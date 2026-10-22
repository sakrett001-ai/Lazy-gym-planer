"""Вписывание скелета манекена в кожу Anny и замеры мягких тканей (проба кожи, шаг 0).

python3 tools/skin-probe/register.py --fit work/fit.json --skeleton work/m461.json --root . --label 4.61.0 --out work/reg-461.json

1. Ориентиры (landmarks.py) и их нормы.
2. Кожа манекена этой же копии (--root): глубина ориентиров, лучи — через tools/skin-probe/mannequin.js query
   (те же формы кожи, что у валидатора и skeleton/fit.js).
3. Кожа Anny (сетка после anny_fit.py): то же самое по сетке (trimesh: знаковое расстояние, лучи).
4. Регистрация скелета в Anny по ориентирам:
   а) «целиком» — один сдвиг всего скелета (вверх-вниз и вперёд-назад; по ширине — симметрия);
   б) «по сегментам» — сдвиг каждого сегмента (таз, грудная клетка, шея с головой, пояс, плечо, предплечье, бедро,
      голень; левая и правая — зеркально) с ценой за сдвиг (2 см — единица) и за разрыв сустава между соседями (1 см);
   цель — глубина каждого ориентира в своей норме (вне нормы — штраф, 0,3 см — единица). Выход костей из кожи
   в цель не входит: его меряем после, чтобы видеть, где Anny и скелет не согласуются.
5. Отчёт: ориентиры, выход костей, место для мышц спины (лучи у остистых, по линии длиннейшей и подвздошно-рёберной),
   лопатка, рёбра сбоку, грудина спереди, рельеф (борозда позвоночника, лопатки, ключица, яремная ямка).
"""
import argparse, json, os, subprocess, sys
import numpy as np
import trimesh
from scipy.optimize import least_squares

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from landmarks import Skeleton, norm_of, NORMS

HERE = os.path.dirname(os.path.abspath(__file__))
BK_DEPTH = [[0, .45], [26, .45], [34, 1.0], [44, 1.2], [50, 1.8], [54, 2.6], [57, 3.2]]  # ветка осанки, walls.js: верх столбов под кожей
LINES = {'spinous': 0.0, 'longissimus': 3.5, 'iliocostalis': 6.5}
H_BACK = [33, 36, 39, 42, 45, 48, 51, 54, 57]
TRUNK_BONES = ('thoracic', 'ribcage', 'L1', 'L2', 'L3', 'L4', 'L5', 'sacrum', 'pelvis_L', 'pelvis_R')


def interp(tab, h):
    xs, ys = zip(*tab); return float(np.interp(h, xs, ys))


class MeshSkin:
    def __init__(self, V, F):
        # кожа — самая большая связная часть: у Anny ещё три замкнутые части внутри головы (глазные яблоки, полость рта),
        # они не кожа (иначе кости черепа рядом с ними считались бы «снаружи»)
        parts = trimesh.Trimesh(V, F, process=False).split(only_watertight=False)
        self.mesh = max(parts, key=lambda c: len(c.vertices))
        self.pq = trimesh.proximity.ProximityQuery(self.mesh)

    def depth(self, P):
        """глубина под кожей, см: плюс — внутри, минус — снаружи"""
        # знак — по нормали ближайшего треугольника (trimesh.signed_distance на пакетах в тысячи точек путал знак у точек
        # глубоко внутри корпуса: contains_points в пакете и поштучно расходились)
        P = np.atleast_2d(np.asarray(P, dtype=float)); out = np.empty(len(P))
        N = self.mesh.face_normals
        for i in range(0, len(P), 1500):
            Q = P[i:i + 1500]
            cp, dist, tri = self.mesh.nearest.on_surface(Q)
            s = np.einsum('ij,ij->i', Q - cp, N[tri])
            out[i:i + 1500] = np.where(s > 0, -dist, dist)
        return out

    def ray(self, o, d, kind='enter', tmax=80):
        loc, ir, it = self.mesh.ray.intersects_location([o], [d], multiple_hits=True)
        if not len(loc):
            return None
        t = (loc - o) @ np.asarray(d)
        t = t[(t > 1e-6) & (t < tmax)]
        return float(t.min()) if len(t) else None


class MannequinSkin:
    """кожа манекена копии root — запросы к mannequin.js (пакетами)"""
    def __init__(self, root, work, tag):
        self.root, self.work, self.tag = root, work, tag

    def run(self, points, rays):
        q = os.path.join(self.work, f'q-{self.tag}.json'); a = os.path.join(self.work, f'a-{self.tag}.json')
        json.dump({'points': [list(map(float, p)) for p in points], 'rays': rays}, open(q, 'w'))
        subprocess.run(['node', os.path.join(HERE, 'mannequin.js'), 'query', '--root', self.root, '--in', q, '--out', a], check=True, stdout=subprocess.DEVNULL)
        return json.load(open(a))


def bone_mesh(sk, pred, T=None):
    Vs, Fs, n = [], [], 0
    for b in sk.bones:
        if not pred(b):
            continue
        P = xf(T, b['seg'], b['P'])
        Vs.append(P); Fs.append(b['F'] + n); n += len(P)
    return trimesh.Trimesh(np.concatenate(Vs), np.concatenate(Fs), process=False)


def first_hit(mesh, o, d, tmax=25):
    loc, ir, it = mesh.ray.intersects_location([o], [d], multiple_hits=True)
    if not len(loc):
        return None
    t = (loc - o) @ np.asarray(d); t = t[(t > -1e-6) & (t < tmax)]
    return float(t.min()) if len(t) else None


def floor_hit(mesh, ps, d, offsets, back=1.0, tmax=12):
    """«пол» под точкой кожи, как backFloor в tools/muscles/walls.js (ветка осанки): ближайшая кость среди лучей в
    окрестности (между поперечными отростками и рёбрами одиночный луч проходит внутрь грудной клетки)"""
    d = np.asarray(d, dtype=float)
    O = np.array([ps + off - d * back for off in offsets]); D = np.repeat(d[None], len(O), 0)
    loc, ir, it = mesh.ray.intersects_location(O, D, multiple_hits=True)
    if not len(loc):
        return None
    t = np.einsum('ij,j->i', loc - O[ir], d) - back
    t = t[(t > -back) & (t < tmax)]
    return float(t.min()) if len(t) else None


def last_hit_before(mesh, o, d, tlim, offsets=((0, 0, 0),)):
    d = np.asarray(d, dtype=float)
    O = np.array([np.asarray(o) + off for off in offsets]); D = np.repeat(d[None], len(O), 0)
    loc, ir, it = mesh.ray.intersects_location(O, D, multiple_hits=True)
    if not len(loc):
        return None
    t = np.einsum('ij,j->i', loc - O[ir], d); t = t[(t > 0) & (t < tlim)]
    return float(t.max()) if len(t) else None


# ---------------------------------------------------------------- регистрация
SEGS = ['pelvis', 'thorax', 'neck', 'girdle', 'ua', 'fa', 'th', 'sk']
MID = ('pelvis', 'thorax', 'neck')
PITCH = ('pelvis', 'thorax', 'neck')      # у сегментов корпуса — ещё наклон вперёд-назад вокруг своего нижнего сустава
ADJ = [('pelvis', 'thorax'), ('thorax', 'neck'), ('thorax', 'girdle'), ('girdle', 'ua'), ('ua', 'fa'), ('pelvis', 'th'), ('th', 'sk')]


def rx(deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])   # плюс — верх сегмента вперёд (+Z) при оси X влево


def xf(T, seg, P):
    """точки сегмента seg после преобразования T (словарь сегмент → (R, c, t)); без T — как есть"""
    if not T or seg not in T:
        return P
    R, c, t = T[seg]
    return (P - c) @ R.T + c + t


def centers(sk):
    """центры поворота сегментов корпуса и точки суставов между сегментами (координаты манекена)"""
    J = sk.J
    th12 = sk.bone('thoracic12'); cerv = sk.bone('cervical')
    c = {'pelvis': (J['hipL'] + J['hipR']) / 2, 'thorax': th12.mean(0), 'neck': cerv[cerv[:, 1] < cerv[:, 1].min() + 2].mean(0)}
    cl = sk.bone('clavicle', 'L'); sc_joint = cl[np.argmin(np.abs(cl[:, 0]))]
    joints = {('pelvis', 'thorax'): c['thorax'], ('thorax', 'neck'): c['neck'], ('thorax', 'girdle'): sc_joint, ('girdle', 'ua'): J['shL'],
              ('ua', 'fa'): J['elL'], ('pelvis', 'th'): J['hipL'], ('th', 'sk'): J['knL']}
    return c, joints


def unpack(x, C, mode):
    T, k = {}, 0
    if mode == 'global':
        t = np.array([0, x[0], x[1]])
        for s in SEGS:
            for side in ([''] if s in MID else ['L', 'R']):
                T[s + side] = (np.eye(3), np.zeros(3), t)
        return T
    for s in SEGS:
        if s in MID:
            t = np.array([0, x[k], x[k + 1]]); k += 2
            R = np.eye(3)
            if s in PITCH:
                R = rx(x[k]); k += 1
            T[s] = (R, C[s], t)
        else:
            v = np.array(x[k:k + 3]); k += 3
            T[s + 'L'] = (np.eye(3), np.zeros(3), v); T[s + 'R'] = (np.eye(3), np.zeros(3), v * np.array([-1, 1, 1]))
    return T


def nparams():
    return sum((2 + (s in PITCH)) if s in MID else 3 for s in SEGS)


def register(skin, sk, LM, mode):
    keys = list(LM)
    P0 = np.array([LM[k][0] for k in keys]); seg = [LM[k][1] for k in keys]
    lo = np.array([norm_of(k)[0][0] for k in keys]); hi = np.array([norm_of(k)[0][1] for k in keys])
    C, JN = centers(sk)

    def resid(x):
        T = unpack(x, C, mode)
        P = np.array([xf(T, s, p[None])[0] for s, p in zip(seg, P0)])
        d = skin.depth(P)
        out = [np.where(d < lo, (lo - d) / .3, np.where(d > hi, (d - hi) / .3, 0.))]
        if mode != 'global':
            out.append(np.concatenate([T[k][2] for k in T if k in MID or k.endswith('L')]) / 2.0)   # сдвиг: 2 см — единица
            out.append(np.array([x[i] for i in pitch_idx]) / 5.0)                                   # наклон: 5° — единица
            for a, b in ADJ:
                ka = a if a in MID else a + 'L'; kb = b if b in MID else b + 'L'
                j = JN[(a, b)][None]
                out.append((xf(T, ka, j) - xf(T, kb, j))[0] / 1.0)                                 # разрыв сустава: 1 см — единица
        return np.concatenate(out)

    pitch_idx, k = [], 0
    for s in SEGS:
        if s in MID:
            k += 2
            if s in PITCH: pitch_idx.append(k); k += 1
        else:
            k += 3
    n = 2 if mode == 'global' else nparams()
    res = least_squares(resid, np.zeros(n), diff_step=.05, x_scale=1.0, max_nfev=600)
    T = unpack(res.x, C, mode)
    info = {}
    for s in T:
        R, c, t = T[s]
        info[s] = {'t': t.tolist(), 'pitch': float(np.degrees(np.arctan2(R[2, 1], R[1, 1])))}
    return T, info


def analyse(skin, sk, T, mann=None):
    """замеры для одной кожи (Anny — MeshSkin; манекен — словарь ответов mannequin.js) и скелета со сдвигами"""
    LM = sk.landmarks()
    hipY = sk.J['hipL'][1]
    out = {'landmarks': {}, 'bones': {}, 'back': {}, 'lateral': {}, 'front': {}, 'scapula': {}, 'relief': {}}
    # --- точки: ориентиры, вершины костей (без кистей и стоп — как skeleton/fit.js) ---
    lm_keys = list(LM); lm_pts = np.array([xf(T, LM[k][1], LM[k][0][None])[0] for k in lm_keys])
    bone_sel = [b for b in sk.bones if b['kind'] not in ('finger', 'thumb', 'hand', 'foot', 'toes') and b['seg']]
    bone_pts = [xf(T, b['seg'], b['P']) for b in bone_sel]
    allp = np.concatenate([lm_pts] + bone_pts)
    # --- лучи ---
    trunk = bone_mesh(sk, lambda b: b['name'].startswith(TRUNK_BONES), T)
    rib = bone_mesh(sk, lambda b: b['name'] == 'ribcage', T)
    rays, meta = [], []
    for line, x in LINES.items():
        for h in H_BACK:
            rays.append({'o': [x, hipY + h, -60.0], 'd': [0, 0, 1.0], 'kind': 'enter', 'max': 80}); meta.append(('back', line, h))
    ribP = rib.vertices
    for h in range(21, 43, 3):    # ниже подмышки (у ANSUR II подмышка — 132,3 см, h ≈ 43)
        band = ribP[np.abs(ribP[:, 1] - (hipY + h)) < 1.5]
        if not len(band):
            continue
        zc = float(band[:, 2].mean())
        rays.append({'o': [0.0, hipY + h, zc], 'd': [1.0, 0, 0], 'kind': 'exit', 'max': 50}); meta.append(('lateral', zc, h))
    for h in H_BACK:
        rays.append({'o': [0.0, hipY + h, 60.0], 'd': [0, 0, -1.0], 'kind': 'enter', 'max': 80}); meta.append(('front', 0, h))
    # рельеф: профили кожи спины поперёк (x −12…12) на четырёх высотах; передняя поверхность шеи и над ключицей
    for h in (22, 32, 42, 50):
        for x in np.arange(-12, 12.01, .5):
            rays.append({'o': [float(x), hipY + h, -60.0], 'd': [0, 0, 1.0], 'kind': 'enter', 'max': 80}); meta.append(('relief-back', float(x), h))
    jug = xf(T, 'thorax', LM['jugular'][0][None])[0]; clv = xf(T, 'girdleL', LM['clavicleL'][0][None])[0]
    for y in np.arange(jug[1] - 6, jug[1] + 8.01, .5):
        for x in (0.0, 2.5, float(clv[0])):
            rays.append({'o': [x, float(y), 60.0], 'd': [0, 0, -1.0], 'kind': 'enter', 'max': 80}); meta.append(('relief-front', x, float(y)))
    # --- кожа ---
    if mann is not None:
        ans = mann.run(allp, rays)
        dall = -np.array([p['d'] for p in ans['points']])
        rhit = [None if r is None else r['t'] for r in ans['rays']]
        # знаковое расстояние кожи манекена (torsoSDF и др.) — не евклидово: у ключицы 6,2 см при настоящих 3,5. Глубину
        # ориентиров (они внутри) берём как настоящее расстояние до кожи: наименьший путь луча до выхода — 256 направлений,
        # затем 64 направления в конусе 12° вокруг лучшего
        dl0 = dall[:len(lm_keys)]
        def fib(n):
            i = np.arange(n) + .5; ph = np.arccos(1 - 2 * i / n); th = np.pi * (1 + 5 ** .5) * i
            return np.stack([np.cos(th) * np.sin(ph), np.cos(ph), np.sin(th) * np.sin(ph)], 1)
        D1 = fib(256)
        r1 = [{'o': p.tolist(), 'd': d.tolist(), 'kind': 'exit', 'max': float(min(15, 1.5 * max(d0, .2) + 1))} for p, d0 in zip(lm_pts, dl0) for d in D1]
        a1 = mann.run([], r1)['rays']
        best = []
        for j in range(len(lm_pts)):
            ts = [(r['t'], D1[i]) for i, r in enumerate(a1[j * 256:(j + 1) * 256]) if r]
            best.append(min(ts, key=lambda q: q[0]) if ts else (None, None))
        cone = []
        for (t, d) in best:
            if d is None: cone.append([]); continue
            u = np.cross(d, [1, 0, 0] if abs(d[0]) < .9 else [0, 1, 0]); u /= np.linalg.norm(u); w = np.cross(d, u)
            cone.append([d * np.cos(a) + np.sin(a) * (u * np.cos(b) + w * np.sin(b)) for a in np.radians([3, 6, 9, 12]) for b in np.linspace(0, 2 * np.pi, 16, endpoint=False)])
        r2 = [{'o': p.tolist(), 'd': d.tolist(), 'kind': 'exit', 'max': 15} for p, C in zip(lm_pts, cone) for d in C]
        a2 = mann.run([], r2)['rays'] if r2 else []
        k2 = 0
        for j, ((t, d), C) in enumerate(zip(best, cone)):
            ts = [r['t'] for r in a2[k2:k2 + len(C)] if r] + ([t] if t is not None else []); k2 += len(C)
            if dl0[j] > 0 and ts:
                dall[j] = min(ts)
    else:
        dall = skin.depth(allp)
        rhit = [skin.ray(np.array(r['o']), np.array(r['d']), r['kind'], r['max']) for r in rays]
    dl = dall[:len(lm_keys)]; k0 = len(lm_keys)
    for k, d in zip(lm_keys, dl):
        (lo, hi, src), name = norm_of(k)
        out['landmarks'][k] = {'depth': float(d), 'lo': lo, 'hi': hi, 'src': src, 'name': name, 'seg': LM[k][1], 'p': xf(T, LM[k][1], LM[k][0][None])[0].tolist()}
    for b, P in zip(bone_sel, bone_pts):
        d = dall[k0:k0 + len(P)]; k0 += len(P)
        key = b['name'] + b['side']
        out['bones'][key] = {'out_max': float(max(0, -d.min())), 'out_frac': float((d < 0).mean()), 'min_depth': float(d.min())}
        if b['name'] == 'scapula':
            out['scapula'][b['side']] = {'min_depth': float(d.min()), 'lt05': float((d < .5).mean()), 'lt10': float((d < 1.0).mean()), 'lt14': float((d < 1.4).mean()),
                                         'post_min': float(d[P[:, 2] < np.percentile(P[:, 2], 30)].min())}
    # лучи
    for r, m, t in zip(rays, meta, rhit):
        o, dvec = np.array(r['o']), np.array(r['d'])
        if m[0] == 'back':
            _, line, h = m
            if t is None:
                continue
            ps = o + dvec * t
            offs = [np.array([dx, dy, 0]) for dx in (-.5, 0, .5) for dy in (-1.5, -.75, 0, .75, 1.5)]
            dep = floor_hit(trunk, ps, dvec, offs)
            room = None if dep is None else dep - interp(BK_DEPTH, h)
            out['back'].setdefault(line, {})[h] = {'skin_z': float(ps[2]), 'depth': dep, 'room': room}
        elif m[0] == 'lateral':
            if t is None:
                continue
            tb = last_hit_before(rib, o, dvec, t, [np.array([0, dy, dz]) for dy in (-1.5, -.75, 0, .75, 1.5) for dz in (-.5, 0, .5)])
            out['lateral'][m[2]] = {'skin_x': float(o[0] + t), 'depth': None if tb is None else float(t - tb)}
        elif m[0] == 'front':
            if t is None:
                continue
            ps = o + dvec * t
            tb = floor_hit(rib, ps, dvec, [np.array([dx, dy, 0]) for dx in (-.5, 0, .5) for dy in (-.75, 0, .75)], tmax=15)
            out['front'][m[2]] = {'skin_z': float(ps[2]), 'depth': tb}
        elif m[0] == 'relief-back':
            if t is not None:
                out['relief'].setdefault('back%d' % m[2], []).append([m[1], float(o[2] + t)])
        elif m[0] == 'relief-front':
            if t is not None:
                out['relief'].setdefault('front%.1f' % m[1], []).append([m[2], float(o[2] - t)])
    out['relief_summary'] = relief_summary(out['relief'], jug, clv)
    # сумма тканей спереди (над грудиной) и сзади (над остистыми) по средней линии: от сдвига грудной клетки вперёд-назад
    # не зависит — показывает, помещается ли грудная клетка скелета в глубину кожи
    out['ap'] = {}
    for h in H_BACK:
        f = out['front'].get(h); bk = out['back'].get('spinous', {}).get(h)
        if f and bk and f['depth'] is not None and bk['depth'] is not None:
            out['ap'][h] = {'sum': f['depth'] + bk['depth'], 'skin': f['skin_z'] - bk['skin_z'], 'front': f['depth'], 'back': bk['depth']}
    return out


def relief_summary(R, jug, clv):
    """числа рельефа: борозда позвоночника (насколько кожа у средней линии глубже, чем над столбами в 2,5–4,5 см),
    выпуклость лопаток (на уровне h 42: самая задняя точка в 6–11 см от средней линии против кожи в 4 см),
    яремная ямка (кожа у средней линии на высоте вырезки против кожи в 2,5 см), надключичная ямка (над ключицей
    против самой передней точки кожи над ключицей)"""
    S = {}
    for h in (22, 32, 42, 50):
        P = np.array(R.get('back%d' % h, []))
        if not len(P):
            continue
        z = lambda xs: P[np.isin(np.round(P[:, 0], 1), xs), 1]
        mid = z([0.0]).mean(); col = z([2.5, 3.0, 3.5, 4.0, 4.5, -2.5, -3.0, -3.5, -4.0, -4.5]).min()
        S['furrow%d' % h] = float(mid - col)          # плюс — у средней линии кожа глубже (ближе к телу), чем над столбами: борозда
        lat = P[(np.abs(P[:, 0]) >= 6) & (np.abs(P[:, 0]) <= 11), 1].min(); at4 = z([4.0, -4.0]).mean()
        S['scap%d' % h] = float(at4 - lat)             # плюс — выпуклость наружу от 4 см
    def concavity(P):
        """наибольшая глубина профиля под хордой его концов (ямка), см"""
        if len(P) < 3: return None
        P = P[np.argsort(P[:, 0])]; a, b = P[0], P[-1]
        chord = a[1] + (b[1] - a[1]) * (P[:, 0] - a[0]) / max(b[0] - a[0], 1e-6)
        return float(max(0.0, (chord - P[:, 1]).max()))
    F0 = np.array(R.get('front0.0', [])); F25 = np.array(R.get('front2.5', [])); FC = np.array(R.get('front%.1f' % float(clv[0]), []))
    if len(F0):
        S['jugular_notch'] = concavity(F0[(F0[:, 0] > jug[1] - 4) & (F0[:, 0] < jug[1] + 5)])
    if len(F0) and len(F25):
        z0 = np.interp(jug[1], F0[:, 0], F0[:, 1]); z25 = np.interp(jug[1], F25[:, 0], F25[:, 1])
        S['jugular_vs_25'] = float(z25 - z0)
    if len(FC):
        S['supraclavicular'] = concavity(FC[(FC[:, 0] > clv[1] - 2) & (FC[:, 0] < clv[1] + 7)])
    return S


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fit', required=True); ap.add_argument('--skeleton', required=True); ap.add_argument('--root', required=True)
    ap.add_argument('--label', required=True); ap.add_argument('--out', required=True)
    a = ap.parse_args()
    work = os.path.dirname(os.path.abspath(a.out))
    data = json.load(open(a.skeleton)); sk = Skeleton(data)
    base = a.fit.replace('.json', '')
    V = np.load(base + '-verts.npy'); F = np.load(base + '-faces.npy')
    anny = MeshSkin(V, F)
    LM = sk.landmarks()
    res = {'label': a.label, 'skeleton': a.skeleton}
    # манекен (своя кожа этой копии)
    mann = MannequinSkin(a.root, work, a.label.replace(' ', '_'))
    res['mannequin'] = analyse(None, sk, None, mann)
    # Anny: без сдвига, целиком, по сегментам
    res['anny_raw'] = analyse(anny, sk, None)
    Tg, ig = register(anny, sk, LM, 'global')
    res['shift_global'] = ig['pelvis']
    res['anny_global'] = analyse(anny, sk, Tg)
    Ts, is_ = register(anny, sk, LM, 'segments')
    res['shift_segments'] = is_
    res['anny_segments'] = analyse(anny, sk, Ts)
    json.dump(res, open(a.out, 'w'), indent=1, default=float)
    # кости — для листа: как есть, целиком, по сегментам
    def dump(T):
        return [{'name': b['name'], 'side': b['side'], 'pos': np.round(xf(T, b['seg'], b['P']), 3).ravel().tolist(), 'idx': b['F'].ravel().tolist()} for b in sk.bones]
    json.dump({'segments': dump(Ts), 'raw': dump(None), 'global': dump(Tg)}, open(a.out.replace('.json', '-bones.json'), 'w'))
    print(a.label, 'целиком', ig['pelvis'], '; по сегментам:', {k: (np.round(v['t'], 2).tolist(), round(v['pitch'], 1)) for k, v in is_.items() if not k.endswith('R')})


if __name__ == '__main__':
    main()
