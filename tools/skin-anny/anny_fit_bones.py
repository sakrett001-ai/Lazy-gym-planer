"""Опыт: может ли Anny вместить скелет с нормальными мягкими тканями, оставаясь в ANSUR II?

python3 tools/skin-probe/anny_fit_bones.py --fit work/fit.json --skeleton work/mpost.json --out work/fitb-post.json
Те же параметры Anny, что в anny_fit.py (старт — его результат), к замерам ANSUR II добавлены цели по скелету:
толщина тканей над ориентирами корпуса — в норме landmarks.py (вне нормы — штраф, 0,3 см — единица) и запас тканей
спереди и сзади по средней линии на высотах h 39–54 (сумма над грудиной и над остистым ≥ 2,2 см). Скелет — целиком,
сдвиг вверх-вниз и вперёд-назад подбирается вместе с формой. Если остаток по скелету уходит, а ANSUR II остаётся в
середине людей, — в пространстве форм Anny тело под этот скелет есть.
"""
import argparse, json, os, sys
import numpy as np
import trimesh

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anny_body import AnnyBody
from anny_measure import Measurer
from landmarks import Skeleton, norm_of

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
ap = argparse.ArgumentParser()
ap.add_argument('--fit', required=True); ap.add_argument('--skeleton', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--iters', type=int, default=8)
a = ap.parse_args()
REF = json.load(open(os.path.join(ROOT, 'tools/mannequin/anthro-ansur2.json')))
fit = json.load(open(a.fit)); SK = Skeleton(json.load(open(a.skeleton)))
J461 = json.load(open(fit['mannequin']))['joints']
body = AnnyBody(); meas = Measurer(body, REF)
pat = SK.bone('patella', 'L'); meas.patella_top = float(pat[:, 1].max())

# параметры — как в anny_fit.py
import importlib.util
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'anny_fit.py')).read()
PHEN = eval(src[src.index("PHEN = ") + 7:src.index('\n', src.index("PHEN = "))])
LOCAL = eval(src[src.index("LOCAL = ") + 8:src.index("]", src.index("LOCAL = ")) + 1])
WEIGHT = eval(src[src.index("WEIGHT = ") + 9:src.index("}", src.index("WEIGHT = ")) + 1])
SEG = {'_ua': (28.3, .25), '_fa': (27.0, .25)}

LM = SK.landmarks()
TRUNK = [k for k in LM if LM[k][1] in ('thorax', 'pelvis', 'neck', 'girdleL') and k not in ('vertex', 'glabella') and not k.endswith('R')]
P0 = np.array([LM[k][0] for k in TRUNK]); lo = np.array([norm_of(k)[0][0] for k in TRUNK]); hi = np.array([norm_of(k)[0][1] for k in TRUNK])
skin_faces = None


def unpack(x):
    phen = {k: float(v) for k, v in zip(PHEN, x[:len(PHEN)])}; local = {}
    for k, v in zip(LOCAL, x[len(PHEN):len(PHEN) + len(LOCAL)]):
        if k.startswith('*'): local['l' + k[1:]] = float(v); local['r' + k[1:]] = float(v)
        else: local[k] = float(v)
    return phen, local, np.array([0, x[-2], x[-1]])


def depth(V, F, P):
    m = trimesh.Trimesh(V, F, process=False)
    cp, d, _ = trimesh.proximity.closest_point_naive(m, P)
    # «внутри»: чётность пересечений луча +X (обход — Мёллер — Трумбор по всем треугольникам)
    T = V[F]; e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; dvec = np.array([1.0, 0.0, 0.0])
    h = np.cross(dvec, e2); det = np.einsum('ij,ij->i', e1, h); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    out = []
    for p in P:
        s = p - T[:, 0]; u = np.einsum('ij,ij->i', s, h) * inv; q = np.cross(s, e1); v = (q @ dvec) * inv; t = np.einsum('ij,ij->i', e2, q) * inv
        out.append(int(np.sum(ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-9))) % 2 == 1)
    return np.where(out, d, -d)


comp = None
def resid(x):
    global comp
    phen, local, t = unpack(x)
    V, H = body.stance(body.rest(phen, local), J461)
    m = meas.measure(V, H); r = []
    for k, w in WEIGHT.items():
        p25, p50, p75 = REF['values'][k]; r.append(w * (m[k] - p50) / max(p75 - p25, .3))
    for k, (tg, w) in SEG.items(): r.append(w * (m[k] - tg))
    if comp is None:   # кожа — самая большая связная часть (без глаз и полости рта): индексы граней один раз
        parts = trimesh.Trimesh(V, body.faces, process=False).split(only_watertight=False)
        big = max(parts, key=lambda c: len(c.vertices))
        # грани, все вершины которых принадлежат большой части (по совпадению координат)
        from scipy.spatial import cKDTree
        idx = cKDTree(V).query(big.vertices)[1]; inbig = np.zeros(len(V), bool); inbig[idx] = True
        comp = body.faces[inbig[body.faces].all(1)]
    d = depth(V, comp, P0 + t)
    r.extend(np.where(d < lo, (lo - d) / .3, np.where(d > hi, (d - hi) / .3, 0.)) * 1.5)
    r.extend(.15 * np.asarray(x[len(PHEN):len(PHEN) + len(LOCAL)]))
    return np.array(r), m, d


x = np.array(fit['x'] + [0.0, 2.0]); lo_b = np.array([0.] * len(PHEN) + [-1.] * len(LOCAL) + [-6, -6]); hi_b = np.array([1.] * len(PHEN) + [1.] * len(LOCAL) + [6, 6])
r, m, d = resid(x); lam = 1e-2
print('старт', round(float(r @ r), 2), 'ткани вне нормы', int(((d < lo) | (d > hi)).sum()), 'из', len(d), flush=True)
for it in range(a.iters):
    Jm = np.empty((len(r), len(x)))
    for j in range(len(x)):
        hstep = (.08 if j < len(x) - 2 else .3); hstep = hstep if x[j] + hstep <= hi_b[j] else -hstep
        xj = x.copy(); xj[j] += hstep; Jm[:, j] = (resid(xj)[0] - r) / hstep
    A = Jm.T @ Jm; g = Jm.T @ r; best = (r @ r, x, r, m, d)
    for lm in (lam, lam * 10, lam * 100):
        dx = -np.linalg.solve(A + lm * np.diag(np.diag(A) + 1e-6), g)
        for al in (1, .5):
            xn = np.clip(x + al * dx, lo_b, hi_b); rn, mn, dn = resid(xn)
            if rn @ rn < best[0]: best = (rn @ rn, xn, rn, mn, dn)
    if best[0] >= r @ r - 1e-3:
        lam *= 10
        if lam > 1e3: break
        continue
    lam = max(lam / 3, 1e-4); _, x, r, m, d = best
    print(f'шаг {it}: {r @ r:.2f}; ткани вне нормы {int(((d < lo) | (d > hi)).sum())} из {len(d)}', flush=True)
phen, local, t = unpack(x)
V, H = body.stance(body.rest(phen, local), J461)
np.save(a.out.replace('.json', '-verts.npy'), V); np.save(a.out.replace('.json', '-faces.npy'), body.faces); np.save(a.out.replace('.json', '-heads.npy'), H)
inside = sum(1 for k in WEIGHT if REF['values'][k][0] <= m[k] <= REF['values'][k][2])
json.dump({'phen': phen, 'local': local, 'x': x.tolist(), 'shift': t.tolist(), 'measures': {k: float(v) for k, v in m.items()},
           'tissue': {k: float(v) for k, v in zip(TRUNK, d)}, 'ansur_inside': inside, 'ansur_total': len(WEIGHT), 'mannequin': fit['mannequin']}, open(a.out, 'w'), indent=1)
print('ANSUR в середине людей:', inside, 'из', len(WEIGHT))
for k, v in zip(TRUNK, d):
    l, h_ = norm_of(k)[0][:2]
    print(f'  {k:14s} {v:6.2f}  норма {l}–{h_}')
for k in WEIGHT:
    p25, p50, p75 = REF['values'][k]
    if not p25 <= m[k] <= p75: print('  вне IQR:', k, round(m[k], 1), (p25, p75))
