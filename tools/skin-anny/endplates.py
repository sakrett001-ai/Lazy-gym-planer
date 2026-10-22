"""Замыкательные пластинки позвонков по полным сеткам MyoSim (в посадке 4.61.0, мировые см нейтральной стойки).

python3 tools/skin-anny/endplates.py --out work/endplates.json      (MYOSIM — путь к клону myo_sim, как у build_bones.py)
В приложении сетки позвонков упрощены до 120–130 вершин: по ним плоскость пластинки «гуляет» на 5–20°. Здесь — те же
позвонки до упрощения, теми же преобразованиями build_bones.py (trunkMap, place). Пластинка — плоскость по точкам
поверхности тела позвонка, нормаль которых смотрит вдоль его оси (|n·a| > 0,8), ось — по нормалям обеих пластинок
(три уточнения). Тело — часть позвонка впереди позвоночного канала (по средней линии), |x| ≤ половины ширины тела.
"""
import argparse, json, os, sys, io, contextlib
import numpy as np
import trimesh

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../skeleton'))
HIP_Y = 89.5


def body_planes(V, F, a0, depth, half_w, n=40000):
    m = trimesh.Trimesh(V, F, process=False)
    S, fi = trimesh.sample.sample_surface(m, n, seed=3); N = m.face_normals[fi]
    a = a0 / np.linalg.norm(a0)
    out = None
    for it in range(4):
        f = np.array([0, -a[2], a[1]])
        zf = (S[np.abs(S[:, 0]) < half_w] @ f).max()
        body = (np.abs(S[:, 0]) < half_w) & (S @ f > zf - depth)
        c = S[body].mean(0); h = (S - c) @ a
        sup = body & (N @ a > .8) & (h > 0); inf = body & (N @ a < -.8) & (h < 0)
        def plane(mask):
            Q = S[mask]; q0 = Q.mean(0); _, _, Vt = np.linalg.svd(Q - q0); nn = Vt[2]
            return q0, nn * (1 if nn @ a > 0 else -1)
        cs, ns = plane(sup); ci, ni = plane(inf)
        out = dict(sup=cs.tolist(), nsup=ns.tolist(), inf=ci.tolist(), ninf=ni.tolist(), npts=[int(sup.sum()), int(inf.sum())])
        a = (ns + ni) / np.linalg.norm(ns + ni)
    # Линии пластинок, как их ведут на боковом снимке: срединный профиль тела (|x| < 0,6), верхний и нижний контур тела
    # между передней стенкой и позвоночным каналом (первый разрыв профиля сзади), без закруглений краёв (по 12 % с концов).
    # Плоскость по нормалям (выше) у вогнутых пластинок и краевых закруглений отклоняется до 10° — для углов берём линии.
    f = np.array([0, -a[2], a[1]]); mid = S[np.abs(S[:, 0]) < .6]
    u = mid @ f; v = mid @ a; uf = u.max(); bins = np.arange(uf - depth - .6, uf + .01, .2)
    top, bot, us = [], [], []
    for b0 in bins[::-1]:
        q = (u >= b0) & (u < b0 + .2)
        if q.sum() < 3:
            if us: break          # разрыв — позвоночный канал
            continue
        us.append(b0 + .1); top.append(v[q].max()); bot.append(v[q].min())
    us, top, bot = np.array(us), np.array(top), np.array(bot)
    k = max(1, int(round(len(us) * .12))); sl = slice(k, len(us) - k) if len(us) > 2 * k + 2 else slice(0, len(us))
    def line(vals):
        A = np.stack([us[sl], np.ones(len(us[sl]))], 1); s, c0 = np.linalg.lstsq(A, vals[sl], rcond=None)[0]
        d = f + s * a; d /= np.linalg.norm(d); n_ = np.array([0, d[2], -d[1]]) * -1   # нормаль: поворот направления на 90° (вверх)
        n_ = n_ if n_ @ a > 0 else -n_
        um = us[sl].mean(); return (um * f + (s * um + c0) * a + np.array([0, 0, 0])), n_
    # центр по профилю: точка на средней линии x = 0 (u, v → y, z)
    cs2, ns2 = line(top); ci2, ni2 = line(bot)
    out.update(nsup_line=ns2.tolist(), ninf_line=ni2.tolist(), sup_line=cs2.tolist(), inf_line=ci2.tolist(), depth_line=float(us.max() - us.min() + .2))
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); args = ap.parse_args()
    sys.argv = ['build_bones', os.path.join(os.path.dirname(os.path.abspath(args.out)), 'bones-tmp.json')]
    with contextlib.redirect_stdout(io.StringIO()):
        import build_bones as BB
    W = lambda q: np.asarray(q) + np.array([0, HIP_Y, 0])
    raw = {}
    # поясница: доля w — как в build_bones.py
    for i in (5, 4, 3, 2, 1):
        v, f = BB.mesh(BB.TOR, f'lumbar{i}_geom_1_lumbar{i}')
        yc = float(BB.trunkMap(v, 0)[:, 1].mean()); w = float(np.clip((yc - BB.yS) / (BB.yT12 - BB.yS), 0, 1))
        raw[f'L{i}'] = (W(BB.trunkMap(v, w)), f)
    for (b, m, file, Rg, pg) in BB.TOR['meshes']:
        if b != 'torso' or 'ribcage' in m: continue
        v, f = BB.load(file, Rg, pg); nm = m.split('_')[-2]
        raw[nm] = (W(BB.trunkMap(BB.M(v), 1)), f)
    v, f = BB.mesh(BB.TOR, 'sacrum_geom_1_sacrum'); raw['sacrum'] = (W(BB.pelvisMap(v)), f)
    # шея: вершины после посадки (vnew) и группы позвонков HAT
    vc = W(BB.vnew); fc = np.asarray(BB.fc)
    for i, g in zip((1, 2, 3, 4, 5, 6, 7), BB.VG):
        msk = np.zeros(len(vc), bool); msk[g] = True; idx = np.where(msk)[0]; rm = -np.ones(len(vc), int); rm[idx] = np.arange(len(idx))
        raw[f'C{i}'] = (vc[idx], rm[fc[msk[fc].all(1)]])
    disc23 = vc[BB.DG[0]]
    order = ['sacrum', 'L5', 'L4', 'L3', 'L2', 'L1'] + [f'thoracic{i}' for i in range(12, 0, -1)] + ['C7', 'C6', 'C5', 'C4', 'C3', 'C2']
    cen = {k: raw[k][0].mean(0) for k in order}
    depth = {**{f'L{i}': 3.4 for i in range(1, 6)}, **{f'thoracic{i}': (2.9 if i >= 10 else 2.5 if i >= 5 else 2.0) for i in range(1, 13)},
             **{f'C{i}': 1.6 for i in range(3, 8)}}
    hw = {**{f'L{i}': 2.6 for i in range(1, 6)}, **{f'thoracic{i}': (2.0 if i >= 9 else 1.6) for i in range(1, 13)}, **{f'C{i}': 1.3 for i in range(3, 8)}}
    E = {}
    for k in range(1, len(order) - 1):
        n = order[k]; a0 = cen[order[k + 1]] - cen[order[k - 1]]; a0[0] = 0
        E[n] = body_planes(*raw[n], a0, depth[n], hw[n])
    # C2: нижняя пластинка — верх диска C2/3 (диск — тонкая пластинка, нормаль — по SVD)
    q0 = disc23.mean(0); _, _, Vt = np.linalg.svd(disc23 - q0); nn = Vt[2] * np.sign(Vt[2][1]); th = (disc23 - q0) @ nn
    E['C2'] = dict(inf=(q0 + nn * th.max()).tolist(), ninf=nn.tolist())
    # S1: верхняя пластинка — срединный профиль верха крестца от заднего края (обрыв в канал) до переднего (мыс), как на
    # боковом снимке: линия по верхнему контуру между углами (без закруглений по 12 % с концов)
    V, F = raw['sacrum']; m = trimesh.Trimesh(V, F, process=False); S, fi = trimesh.sample.sample_surface(m, 60000, seed=1)
    mid = S[np.abs(S[:, 0]) < .5]; zs = np.arange(mid[:, 2].min(), mid[:, 2].max() + .01, .2); prof = []
    for z0 in zs:
        q = mid[(mid[:, 2] >= z0) & (mid[:, 2] < z0 + .2)]
        if len(q) >= 3: prof.append((z0 + .1, q[:, 1].max()))
    prof = np.array(prof); ymax = prof[:, 1].max(); j0 = int(np.argmax(prof[:, 1]))
    # задний край: идём назад от самой высокой точки, пока верх не упадёт больше чем на 0,8 см (канал)
    jb = j0
    while jb > 0 and prof[jb - 1, 1] > ymax - .8: jb -= 1
    jf = len(prof) - 1
    P_ = prof[jb:jf + 1]; k = max(1, int(round(len(P_) * .12))); P2 = P_[k:len(P_) - k]
    s, c0 = np.polyfit(P2[:, 0], P2[:, 1], 1); d = np.array([0, s, 1.0]); d /= np.linalg.norm(d); nn = np.array([0, d[2], -d[1]])
    ps = np.array([0, s * P_[0, 0] + c0, P_[0, 0]]); pa = np.array([0, s * P_[-1, 0] + c0, P_[-1, 0]])
    E['S1'] = dict(sup=((ps + pa) / 2).tolist(), nsup=nn.tolist(), ps=ps.tolist(), pa=pa.tolist(), nsup_line=nn.tolist(), sup_line=((ps + pa) / 2).tolist())
    # ямки атласа (как в build_bones.py: PC)
    E['_PC'] = W(BB.PC).tolist()
    E['_c2_delta'] = float(BB.CH[2]['th'] - BB.RAW[2]['th'])
    json.dump(E, open(args.out, 'w'), indent=1)
    t = lambda n: np.degrees(np.arctan2(n[2], n[1]))
    for n in order[1:-1]:
        e = E[n]; print(f'{n:11s} верхняя {t(e["nsup"]):6.1f}° (линия {t(e["nsup_line"]):6.1f}°)  нижняя {t(e["ninf"]):6.1f}° (линия {t(e["ninf_line"]):6.1f}°)  глубина тела {e["depth_line"]:.1f}')
    print('S1', round(t(E['S1']['nsup']), 1), 'C2 нижняя', round(t(E['C2']['ninf']), 1), 'S1 углы', np.round(E['S1']['ps'], 2), np.round(E['S1']['pa'], 2))


if __name__ == '__main__':
    main()
