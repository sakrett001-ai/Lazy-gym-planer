"""Проверки «кожа Anny + скелет в новой посадке» (шаг 1): ткани над ориентирами, кости снаружи, место для мышц спины,
лопатка, рельеф. Те же правила, что register.py шага 0 (ориентиры — landmarks.py, место для столбов — как walls.js ветки
осанки), плюс ориентиры черепа (лицо Anny на черепе MyoSim).
"""
import numpy as np
import trimesh
import norms
from landmarks import Skeleton, NAMES

HEAD_NAMES = {'nasion': 'Переносица (назион)', 'pogonion': 'Подбородок (погонион)', 'menton': 'Низ подбородка (ментон)',
              'gonion': 'Угол нижней челюсти (гонион)', 'zygion': 'Скуловая дуга (зигион)', 'opisthocranion': 'Затылок (опистокранион)',
              'euryon': 'Бок свода (эурион)'}


class Skin:
    """кожа — сетка Anny (главная связная часть): глубина точек (плюс — внутри), лучи"""
    def __init__(self, V, F):
        self.mesh = trimesh.Trimesh(V, F, process=False)
        self.fn = self.mesh.face_normals

    def depth(self, P, exact=True):
        P = np.atleast_2d(np.asarray(P, float))
        cp, dist, tri = trimesh.proximity.closest_point(self.mesh, P)
        if exact:
            inside = self.mesh.ray.contains_points(P)
        else:
            # Знак по нормали ближайшей грани ошибается не только у самой поверхности: в подмышке, у ягодичной складки, у уха
            # ближайшей оказывается «чужая» поверхность, и точка в глубине тела считалась снаружи на 4–7 см (сверено лучами:
            # 166 из 2646 точек грудной клетки, 91 из 192 крестца). Поэтому точки ближе 1,5 см к коже проверяются лучами, а
            # глубже 1,5 см — внутри (кость, вышедшая из кожи дальше, видна по соседним точкам у самой кожи).
            inside = np.ones(len(P), bool); near = dist < 1.5
            if near.any(): inside[near] = self.mesh.ray.contains_points(P[near])
        return np.where(inside, dist, -dist)

    def ray(self, o, d, tmax=80):
        loc, ir, it = self.mesh.ray.intersects_location([o], [d], multiple_hits=True)
        if not len(loc): return None
        t = (loc - o) @ np.asarray(d); t = t[(t > 1e-6) & (t < tmax)]
        return float(t.min()) if len(t) else None


def skeleton_view(base, posed):
    """landmarks.Skeleton с вершинами костей в новой посадке (base — Skeleton выгрузки 4.61.0)"""
    sk = Skeleton.__new__(Skeleton); sk.d = base.d; sk.J = base.J
    sk.bones = [dict(b, P=posed[b['name'] + b['side']]) for b in base.bones]
    return sk


def head_landmarks(sk):
    """ориентиры черепа и нижней челюсти (по сеткам приложения; голова смотрит вдоль +Z)"""
    S = sk.bone('skull'); Jw = sk.bone('jaw'); out = {}
    mid = S[np.abs(S[:, 0]) < 1.0]
    top = S[:, 1].max()
    # надпереносье — самая передняя точка лобной кости по средней линии в 6–10 см ниже темени
    band = mid[(mid[:, 1] < top - 6) & (mid[:, 1] > top - 10)]
    g = band[np.argmax(band[:, 2])]; out['glabella'] = g
    # переносица — самая задняя точка профиля по средней линии в 0,5–3 см ниже надпереносья, впереди центра черепа
    nb = mid[(mid[:, 1] < g[1] - .5) & (mid[:, 1] > g[1] - 3) & (mid[:, 2] > g[2] - 3)]
    out['nasion'] = nb[np.argmin(nb[:, 2])] if len(nb) else g
    out['opisthocranion'] = mid[np.argmin(mid[:, 2])]
    jm = Jw[np.abs(Jw[:, 0]) < 1.0]
    out['pogonion'] = jm[np.argmax(jm[:, 2] - .3 * (jm[:, 1] - jm[:, 1].min()))]
    out['menton'] = jm[np.argmin(jm[:, 1])]
    jl = Jw[Jw[:, 0] > 2]
    out['gonionL'] = jl[np.argmax(-jl[:, 2] - jl[:, 1])]
    zb = S[(S[:, 1] > g[1] - 6) & (S[:, 1] < g[1] - 3) & (S[:, 0] > 0)]
    out['zygionL'] = zb[np.argmax(zb[:, 0])]
    eb = S[(S[:, 1] > top - 8) & (S[:, 1] < top - 3) & (S[:, 0] > 0)]
    out['euryonL'] = eb[np.argmax(eb[:, 0])]
    return out


def landmarks_all(sk):
    LM = {k: (v[0], v[1]) for k, v in sk.landmarks().items()}
    for k, p in head_landmarks(sk).items():
        LM[k] = (p, 'neck')
    return LM


def norm_of(key):
    base = key[:-1] if key[-1] in 'LR' and key[:-1] in norms.TISSUE else key
    lo, hi, src = norms.TISSUE[base]
    return lo, hi, src, NAMES.get(base) or HEAD_NAMES.get(base, base)


def tissue(skin, LM, keys=None):
    keys = keys or [k for k in LM if not k.endswith('R')]
    P = np.array([LM[k][0] for k in keys]); d = skin.depth(P)
    return {k: float(v) for k, v in zip(keys, d)}


def bone_mesh(posed, names):
    Vs, Fs, n = [], [], 0
    for key, (P, F) in posed.items():
        if not any(key.startswith(x) for x in names): continue
        Vs.append(P); Fs.append(F + n); n += len(P)
    return trimesh.Trimesh(np.concatenate(Vs), np.concatenate(Fs), process=False)


SKIP = ('finger', 'thumb', 'hand', 'foot', 'toes')


def bones_out(skin, base, posed, step=2):
    """по костям: наибольший выход наружу (см) и доля вершин снаружи (знак — по нормали ближайшей грани)"""
    out = {}
    keys = [b['name'] + b['side'] for b in base.bones if b['kind'] not in SKIP and b['seg']]
    P = np.concatenate([posed[k][::step] for k in keys]); d = skin.depth(P, exact=False); k0 = 0
    for k in keys:
        n = len(posed[k][::step]); dd = d[k0:k0 + n]; k0 += n
        out[k] = {'out_max': float(max(0, -dd.min())), 'out_frac': float((dd < 0).mean()), 'min_depth': float(dd.min())}
    return out, P, d


def floor_hit(mesh, ps, d, offsets, back=1.0, tmax=12):
    d = np.asarray(d, float); O = np.array([ps + off - d * back for off in offsets]); D = np.repeat(d[None], len(O), 0)
    loc, ir, it = mesh.ray.intersects_location(O, D, multiple_hits=True)
    if not len(loc): return None
    t = np.einsum('ij,j->i', loc - O[ir], d) - back; t = t[(t > -back) & (t < tmax)]
    return float(t.min()) if len(t) else None


def interp(tab, h):
    xs, ys = zip(*tab); return float(np.interp(h, xs, ys))


def back_room(skin, trunk, sp_tips, h0):
    """место для столбов спины на уровнях T3–T10: sp_tips — {Tk: вершина остистого (поза)}, h0 — {Tk: высота над
    тазобедренными в 4.61.0 (слой над столбом BK_DEPTH — по ней)}"""
    out = {}
    offs = [np.array([dx, dy, 0]) for dx in (-.5, 0, .5) for dy in (-1.5, -.75, 0, .75, 1.5)]
    for k, tip in sp_tips.items():
        y = tip[1] + 1.0                       # на уровне тела позвонка (верхушка остистого — ниже тела на ≈ 1–2 см)
        row = {}
        for line, x in [('spinous', 0.0)] + list(norms.ROOM_LINES.items()):
            o = np.array([x, y, -60.0]); t = skin.ray(o, [0, 0, 1.0], 80)
            if t is None: row[line] = None; continue
            ps = o + np.array([0, 0, t]); dep = floor_hit(trunk, ps, [0, 0, 1.0], offs)
            row[line] = {'skin_z': float(ps[2]), 'depth': dep, 'room': None if dep is None else dep - interp(norms.BK_DEPTH, h0[k])}
        out[k] = row
    return out


def scapula(skin, P):
    d = skin.depth(P, exact=False)
    post = P[:, 2] < np.percentile(P[:, 2], 30)
    return {'min_depth': float(d.min()), 'post_min': float(d[post].min()), 'lt14': float((d[post] < norms.SCAP_MIN).mean()),
            'lt10': float((d < 1.0).mean())}


def relief(skin, LM):
    """рельеф спереди: яремная ямка (кожа у средней линии глубже, чем в 2,5 см от неё, на высоте вырезки −3…+4 см) и
    надключичная (профиль над серединой ключицы — глубина под хордой); сзади — борозда позвоночника и лопатки"""
    jug = LM['jugular'][0]; clv = LM['clavicleL'][0]; S = {}
    def prof(x, ys):
        out = []
        for y in ys:
            t = skin.ray(np.array([x, y, 60.0]), [0, 0, -1.0], 80)
            if t is not None: out.append((y, 60.0 - t))
        return np.array(out)
    ys = np.arange(jug[1] - 3, jug[1] + 4.01, .5)
    F0 = prof(0.0, ys); F25 = prof(2.5, ys)
    if len(F0) and len(F25):
        S['jugular_notch'] = float(max(0, (np.interp(ys, F25[:, 0], F25[:, 1]) - np.interp(ys, F0[:, 0], F0[:, 1])).max()))
    FC = prof(float(clv[0]), np.arange(clv[1] - 2, clv[1] + 7.01, .5))
    if len(FC) >= 3:
        a, b = FC[0], FC[-1]; chord = a[1] + (b[1] - a[1]) * (FC[:, 0] - a[0]) / (b[0] - a[0])
        S['supraclavicular'] = float(max(0, (chord - FC[:, 1]).max()))
    for name, y in (('T9', LM['T9'][0][1]), ('T6', LM['T6'][0][1])):
        row = []
        for x in np.arange(-12, 12.01, .5):
            t = skin.ray(np.array([x, y, -60.0]), [0, 0, 1.0], 80)
            if t is not None: row.append((x, -60.0 + t))
        R = np.array(row)
        if len(R):
            z = lambda xs: R[np.isin(np.round(R[:, 0], 1), xs), 1]
            S['furrow_' + name] = float(z([0.0]).mean() - z([2.5, 3.0, 3.5, 4.0, 4.5, -2.5, -3.0, -3.5, -4.0, -4.5]).min())
            lat = R[(np.abs(R[:, 0]) >= 6) & (np.abs(R[:, 0]) <= 11), 1].min(); S['scap_' + name] = float(z([4.0, -4.0]).mean() - lat)
    return S
