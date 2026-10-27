"""Кожа Anny «только внешний вид»: общие части подгонки (fit.py) и сборки (build.py).

Координаты — авторинга манекена (см, Y вверх, пол 0, лицо к +Z, левая сторона +X), как у tools/skin-anny.
Процедурная кожа 4.61.0 — плотные сетки частей из tools/anny-look/export.js (qa/anny-look/mannequin.json): видимые точки
(не внутри другой части) с нормалями. Расстояние от вершины Anny до процедурной кожи — по ближайшей видимой точке вдоль её
нормали (плюс — Anny снаружи); зона вершины — по части и адресу этой точки.
"""
import json, os, sys
import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'tools/skin-anny'))

ZONES = ['голова', 'шея', 'надплечья', 'грудь', 'верх спины', 'бока', 'живот', 'поясница', 'ягодицы', 'пах', 'дельты', 'плечо',
         'локоть', 'предплечье', 'кисть', 'бедро', 'колено', 'голень', 'стопа']


def grid_normals(P, closed_cols=False):
    """нормали сетки rows×cols×3 по касательным (знак — наружу от центра ряда)"""
    du = np.gradient(P, axis=0); dv = np.gradient(P, axis=1)
    if closed_cols:
        dv = (np.roll(P, -1, axis=1) - np.roll(P, 1, axis=1)) / 2
    n = np.cross(du, dv); l = np.linalg.norm(n, axis=-1, keepdims=True); n = n / np.maximum(l, 1e-9)
    c = P.mean(axis=1, keepdims=True); s = np.sign(np.sum(n * (P - c), axis=-1, keepdims=True)); s[s == 0] = 1
    return n * s


class Procedural:
    """процедурная кожа нейтральной стойки 4.61.0: видимые точки, нормали, часть и адрес"""
    def __init__(self, path=os.path.join(ROOT, 'qa/anny-look/mannequin.json')):
        D = json.load(open(path)); self.D = D
        self.J = {k: np.array(v, float) for k, v in D['joints'].items()}
        self.frames = D['frames']
        P, N, part, a1, a2, side = [], [], [], [], [], []
        for g in D['grids']:
            pts = np.array(g['pts'], float).reshape(g['rows'], g['cols'], 3)
            if g['part'].startswith('cap-'):
                c = np.array(g['addr']['c']); n = pts - c; n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-9)
            elif g['part'] == 'torso':
                n = grid_normals(pts)
            else:
                n = grid_normals(pts, closed_cols=True)
            hid = np.array(g['hid'], bool).reshape(g['rows'], g['cols'])
            a = g['addr']
            if g['part'] == 'torso':
                A1 = np.repeat(np.array(a['h'])[:, None], g['cols'], 1); A2 = np.repeat(np.array(a['ang'])[None, :], g['rows'], 0)
            elif g['part'].startswith('cap-'):
                A1 = np.repeat(np.array(a['polar'])[:, None], g['cols'], 1); A2 = np.repeat(np.array(a['az'])[None, :], g['rows'], 0)
            else:
                A1 = np.repeat(np.array(a['t'])[:, None], g['cols'], 1); A2 = np.repeat(np.array(a['ang'])[None, :], g['rows'], 0)
            keep = ~hid
            P.append(pts[keep]); N.append(n[keep]); part += [g['name']] * int(keep.sum()); a1.append(A1[keep]); a2.append(A2[keep])
        # голова: вершины сетки головы, нормали — по граням
        import trimesh
        H = np.array(D['head']['pts'], float); F = np.array(D['head']['idx']).reshape(-1, 3)
        hm = trimesh.Trimesh(H, F, process=False); hn = np.asarray(hm.vertex_normals)
        c = H.mean(0); flip = np.sign(np.sum(hn * (H - c), 1)).mean() < 0
        if flip: hn = -hn
        keep = ~np.array(D['head']['hid'], bool)
        P.append(H[keep]); N.append(hn[keep]); part += ['head'] * int(keep.sum()); a1.append(np.zeros(keep.sum())); a2.append(np.zeros(keep.sum()))
        self.P = np.concatenate(P); self.N = np.concatenate(N); self.part = np.array(part)
        self.a1 = np.concatenate(a1); self.a2 = np.concatenate(a2)
        self.tree = cKDTree(self.P)
        self.zone_of_sample = np.array([zone_of(p, x, y) for p, x, y in zip(self.part, self.a1, self.a2)])

    def query(self, X):
        """для точек X: знаковое расстояние (плюс — снаружи процедурной кожи), индекс ближайшей видимой точки"""
        d, i = self.tree.query(X, k=1)
        s = np.sum((X - self.P[i]) * self.N[i], 1)
        # вдоль нормали, но не дальше евклидова расстояния (на изломах сетки)
        sd = np.sign(s) * np.minimum(np.abs(s) + 0.0, d)
        return sd, i


def zone_of(part, a1, a2):
    if part == 'head': return 'голова'
    if part == 'neck': return 'шея'
    if part.startswith('torso'):
        h, ang = a1, a2
        if h > 50: return 'надплечья'
        if h < 6: return 'пах' if ang < 1.25 else 'ягодицы'
        if h >= 30: return 'грудь' if ang < 1.25 else ('верх спины' if ang > 1.95 else 'бока')
        return 'живот' if ang < 1.25 else ('поясница' if ang > 1.95 else 'бока')
    k = part[:-1] if part[-1] in 'LR' else part
    if part.startswith('cap-'):
        key = part[4:-1]
        return {'sh': 'дельты', 'ac': 'дельты', 'el': 'локоть', 'wr': 'предплечье', 'kn': 'колено', 'an': 'голень'}[key]
    t = a1
    if k == 'ua': return 'локоть' if t > .88 else 'плечо'
    if k == 'fa': return 'локоть' if t < .12 else 'предплечье'
    if k == 'th': return 'колено' if t > .85 else 'бедро'
    if k == 'sk': return 'колено' if t < .15 else 'голень'
    return part


def zone_stats(sd, zones, mask=None):
    """по зонам: число вершин, среднее |d|, 95-й процентиль |d|, наибольшее |d|, средний знак (плюс — Anny снаружи)"""
    out = {}
    for z in ZONES:
        m = zones == z
        if mask is not None: m &= mask
        if not m.any(): continue
        a = np.abs(sd[m])
        out[z] = dict(n=int(m.sum()), mean=float(a.mean()), p95=float(np.percentile(a, 95)), max=float(a.max()), signed=float(sd[m].mean()),
                      over2=float((a > 2).mean()), over3=float((a > 3).mean()))
    return out


def print_stats(st, title=''):
    if title: print(title)
    print(f"{'зона':12s} {'вершин':>6s} {'ср.|d|':>7s} {'95%':>6s} {'наиб.':>6s} {'знак':>6s} {'>2 см':>6s} {'>3 см':>6s}")
    for z, s in st.items():
        print(f"{z:12s} {s['n']:6d} {s['mean']:7.2f} {s['p95']:6.2f} {s['max']:6.2f} {s['signed']:+6.2f} {100*s['over2']:5.1f}% {100*s['over3']:5.1f}%")
