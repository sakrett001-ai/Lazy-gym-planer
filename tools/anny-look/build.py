"""Сборка кожи Anny «только внешний вид» для приложения (шаг 1 из 2: python → qa/anny-look/anny.json; шаг 2 — pack.js).

python3 tools/anny-look/build.py [--out qa/anny-look/anny.json]

Нужны: пакет anny 0.6.1 (pip install --break-system-packages anny; torch — с PyPI), trimesh, scipy; данные манекена —
node tools/anny-look/export.js (qa/anny-look/mannequin.json). Сборка детерминирована: одни и те же пакеты дают тот же файл
(torch — в один поток, дальше — float64).

1. Сетка: подтянутая Anny (anny_look.AnnyLook: одобренные фенотип и местные формы + fit.json) в нейтральной стойке манекена
   4.61.0, без глаз и полости рта (главная связная часть), нейтральный гладкий пах. Координаты — каталог (см, Y вниз, пол 186),
   как у рамок позы (Mannequin.catalogPose). Глазницы закрыты гладкой заплаткой, ямка у вершины промежности сглажена
   (anny_look.AnnyLook.neutral_face, neutral_groin): форма «bulge» −1 уже даёт гладкий пах, а прежнее лапласово сглаживание
   области (tools/skin-anny) складывало треугольники — на свету тёмные пятна.
2. Веса — перенос с рига Anny на сегменты манекена (рамки позы): ключица → cl, лопатка (shoulder01) → sp, плечо → ua,
   предплечье → fa и fd (доля fd растёт от локтя к запястью линейно, как закрутка сечений процедурной кожи), запястье и пясть
   → hand, фаланги → рамки фаланг пальцев (по суставам пальцев хвата, как у скелета), бедро → th, голень → sk, стопа → foot,
   пальцы стопы → toes, шея → neck, голова → head. Корпус (root, pelvis, spine05…01) — одна доля, которая делится между
   pelvis, lumbar и thorax по высоте над тазобедренными и по углу сечения — по тем же скруглениям шарниров поясницы, что у
   процедурной кожи (TORSO_BLEND, TORSO_BLEND_FRONT, FRONT_W): у Anny пять позвонков рига, у манекена — два шарнира.
   Четыре наибольших веса на вершину, сумма — 1.
3. Адрес вершины на процедурной коже (часть, сторона, h и угол или t и угол, у дельтовидной — полярный угол и азимут на
   «шапке» плеча) — по ближайшей видимой точке процедурной кожи: по нему приложение красит мышечные зоны тем же правилом,
   что области манекена (MANNEQUIN_TORSO_PATCHES и др., 09d-catalog-muscles.js).
4. Корректирующие формы (correctives.py) — смещения вершин в стойке, их включает угол сустава.
"""
import argparse, hashlib, json, os, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import common as C
from anny_look import AnnyLook, q_from, FIT, FINGER_BONES
import correctives as CR

FLOOR = 186.0
CENTRAL = ['pelvis', 'lumbar', 'thorax', 'neck', 'head']
SIDE_FRAMES = ['cl', 'sp', 'ua', 'fa', 'fd', 'hand', 'th', 'sk', 'foot', 'toes'] + [f'f{f}{k}' for f in range(5) for k in range(3)]
FRAMES = CENTRAL + [n + s for s in 'LR' for n in SIDE_FRAMES]
PART_CODE = {'torso': 1, 'ua': 2, 'fa': 3, 'th': 4, 'sk': 5, 'delt': 6}


def ramp(u, e):
    if e <= 0: return u
    r = 1 / (1 - e)
    return np.where(u < e, r * u * u / (2 * e), np.where(u > 1 - e, 1 - r * (1 - u) * (1 - u) / (2 * e), r * (e / 2 + u - e)))


def smooth(t):
    t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)


def trunk_split(h, ang, D):
    """доли pelvis, lumbar, thorax по высоте h (над тазобедренными) и углу сечения ang (0 — передняя линия):
    те же скругления, что spineFrame/torsoFrame манекена"""
    def scheme(zones):
        # доля «выше шарнира» для каждого из двух шарниров: 0 — ниже скругления, 1 — выше
        a = []
        for j, hj, lo, hi, e in zones:
            u = np.clip((h - hj + lo) / (lo + hi), 0, 1); a.append(ramp(u, e))
        return a
    s1, s2 = scheme(D['TORSO_BLEND']); f1, f2 = scheme(D['TORSO_BLEND_FRONT'])
    fw = D['FRONT_W']; kf = 1 - smooth((ang - fw[0]) / (fw[1] - fw[0]))
    kf = np.where((h > D['FRONT_H'][0]) & (h < D['FRONT_H'][1]), kf, 0.0)
    a1 = s1 * (1 - kf) + f1 * kf; a2 = s2 * (1 - kf) + f2 * kf
    # цепочка: pelvis —(шарнир 1)→ lumbar —(шарнир 2)→ thorax
    wt = a2; wl = a1 - a2; wl = np.clip(wl, 0, 1); wp = 1 - a1
    return np.clip(wp, 0, 1), wl, np.clip(wt, 0, 1)


def build(out_path):
    P = C.Procedural(); D = P.D; body = AnnyLook(); fit = json.load(open(FIT))
    phen, local = body.params(fit); rest = body.rest(phen, local); q = q_from(fit['pose'])
    hands = D['hands']
    V, Hw, G, heads = body.stance(rest, P.J, q, hands, groin=False)
    V = body.neutral_groin(body.neutral_face(V, Hw), P.J)
    F = body.skin_faces; used = np.unique(F); remap = -np.ones(len(V), np.int64); remap[used] = np.arange(len(used))
    V = V[used]; F = remap[F]; W = body.weights[used]          # плотные веса Anny по 104 костям
    labels = body.labels; L = body.idx; n = len(V)

    # ---------- перенос весов ----------
    J = P.J; hipY = (J['hipL'][1] + J['hipR'][1]) / 2
    Wo = np.zeros((n, len(FRAMES))); fi = {k: i for i, k in enumerate(FRAMES)}
    trunk = np.zeros(n); fore = {s: np.zeros(n) for s in 'LR'}
    for b, lab in enumerate(labels):
        w = W[:, b]
        if not w.any(): continue
        if lab in ('root',) or lab.startswith(('pelvis', 'spine')): trunk += w; continue
        if lab.startswith('neck'): Wo[:, fi['neck']] += w; continue
        if lab in ('head', 'eye.L', 'eye.R'): Wo[:, fi['head']] += w; continue
        s = lab[-1]; base = lab[:-2]
        if base == 'clavicle': k = 'cl'
        elif base == 'shoulder01': k = 'sp'
        elif base.startswith('upperarm'): k = 'ua'
        elif base.startswith('lowerarm'): fore[s] += w; continue
        elif base == 'wrist' or base.startswith('metacarpal'): k = 'hand'
        elif base.startswith('finger'):
            f, kk = base[6:].split('-'); k = f'f{int(f) - 1}{int(kk) - 1}'
        elif base.startswith('upperleg'): k = 'th'
        elif base.startswith('lowerleg'): k = 'sk'
        elif base == 'foot': k = 'foot'
        elif base.startswith('toe'): k = 'toes'
        else: raise ValueError('кость без сегмента: ' + lab)
        Wo[:, fi[k + s]] += w
    # предплечье: fa → fd по доле длины от локтя к запястью
    for s in 'LR':
        e, w_ = J['el' + s], J['wr' + s]; ax = w_ - e; t = np.clip(((V - e) @ ax) / (ax @ ax), 0, 1)
        Wo[:, fi['fa' + s]] += fore[s] * (1 - t); Wo[:, fi['fd' + s]] += fore[s] * t
    # корпус: по высоте и углу сечения (адрес на процедурной коже — ниже; здесь угол по положению вершины)
    sd, ii = P.query(V)
    h = V[:, 1] - hipY
    ang_geo = np.arctan2(np.abs(V[:, 0]), V[:, 2])
    on_torso = np.array([p.startswith('torso') for p in P.part[ii]])
    ang = np.where(on_torso, P.a2[ii], ang_geo)
    wp, wl, wt = trunk_split(h, ang, D)
    Wo[:, fi['pelvis']] += trunk * wp; Wo[:, fi['lumbar']] += trunk * wl; Wo[:, fi['thorax']] += trunk * wt
    # четыре наибольших
    order = np.argsort(-Wo, 1)[:, :4]; wv = np.take_along_axis(Wo, order, 1); wv = wv / wv.sum(1, keepdims=True)
    # округление до 1/255 с суммой ровно 255 (в файле — байты)
    wq = np.floor(wv * 255 + .5).astype(int); wq[:, 0] += 255 - wq.sum(1)
    order = np.where(wq > 0, order, 0)

    # ---------- адрес на процедурной коже ----------
    code = np.zeros(n, int); side = np.zeros(n, int); a1 = np.zeros(n); a2 = np.zeros(n)
    dom = np.array(labels)[body.dominant[used]]
    handfoot = np.array([l.startswith(('wrist', 'finger', 'metacarpal', 'foot', 'toe', 'head', 'eye')) for l in dom])
    for j in range(n):
        if handfoot[j]: continue
        part = P.part[ii[j]]
        if part.startswith('torso'): code[j] = 1; side[j] = 0 if part.endswith('L') else 1; a1[j] = P.a1[ii[j]]; a2[j] = P.a2[ii[j]]
        elif part[:2] in ('ua', 'fa', 'th', 'sk') and len(part) == 3:
            code[j] = PART_CODE[part[:2]]; side[j] = 0 if part[2] == 'L' else 1; a1[j] = P.a1[ii[j]]; a2[j] = P.a2[ii[j]]
    # дельтовидная: по направлению от центра «шапки» плеча в рамке плеча — у вершин плечевого пояса и верха плеча
    for s, si in (('L', 0), ('R', 1)):
        g = next(g for g in D['grids'] if g['name'] == 'cap-sh' + s); c = np.array(g['addr']['c'])
        fr = D['frames']['ua' + s]; uy = np.array(fr['y']); uz = np.array(fr['z']); lat = np.array(fr['x']) * (1 if s == 'L' else -1)
        d = V - c; r = np.linalg.norm(d, axis=1); dn = d / np.maximum(r, 1e-9)[:, None]
        polar = np.arccos(np.clip(dn @ uy, -1, 1)); az = np.arctan2(dn @ lat, dn @ uz)
        armw = Wo[:, [fi['ua' + s], fi['sp' + s], fi['cl' + s]]].sum(1)
        near_part = np.array([p in ('cap-sh' + s, 'cap-ac' + s) or (p == 'ua' + s) for p in P.part[ii]])
        sel = (armw > .3) & (r < 10) & (polar < 1.75) & (near_part | (code == 0)) & ~((code == 2) & (a1 > .3))
        code[sel] = 6; side[sel] = si; a1[sel] = polar[sel]; a2[sel] = az[sel]

    # ---------- корректирующие формы ----------
    corr = CR.build(V, F, Wo, FRAMES, P, body)

    # ---------- в каталог ----------
    cat = V.copy(); cat[:, 1] = FLOOR - cat[:, 1]
    out = {'version': 1, 'source': {'anny': '0.6.1', 'toned': 'tools/skin-anny/result/anny-toned.json', 'fit': fit.get('pose'), 'local_delta': fit.get('local_delta', {}),
                                    'mannequin': D['version']},
           'frames': FRAMES, 'v': np.round(cat, 2).ravel().tolist(), 'f': F.ravel().tolist(),
           'wi': order.ravel().tolist(), 'ww': wq.ravel().tolist(),
           'region': {'code': code.tolist(), 'side': side.tolist(), 'a1': np.round(a1, 3).tolist(), 'a2': np.round(a2, 3).tolist()},
           'correctives': corr}
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    s = json.dumps(out, separators=(',', ':'))
    open(out_path, 'w').write(s)
    print(out_path, 'вершин', n, 'треугольников', len(F), 'рамок', len(FRAMES), 'корректирующих форм', len(corr), 'sha256', hashlib.sha256(s.encode()).hexdigest()[:12])


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default=os.path.join(C.ROOT, 'qa/anny-look/anny.json'))
    build(ap.parse_args().out)
