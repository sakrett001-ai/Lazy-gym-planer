"""Подгонка Anny под медианы ANSUR II (мужчины 170–180 см, 72–84 кг; tools/mannequin/anthro-ansur2.json).

python3 tools/skin-probe/anny_fit.py --mannequin work/m461.json --out work/anny-fit.json
Параметры: фенотип (мышцы, вес, рост, пропорции; пол — мужской, возраст — 27 лет) и местные формы Anny
(«measure-…», «torso-…» и т. п., левые и правые — одним числом). Метод — наименьшие квадраты (scipy, конечные разности):
каждый замер — в долях межквартильного размаха людей, плюс слабая привязка местных форм к нулю (чем меньше правка
базовой фигуры, тем лучше). Замеры — anny_measure.py, в нейтральной стойке манекена.
"""
import argparse, json, sys, time, os
import numpy as np
from scipy.optimize import least_squares

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from anny_body import AnnyBody
from anny_measure import Measurer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
ap = argparse.ArgumentParser()
ap.add_argument('--mannequin', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--iters', type=int, default=40)
a = ap.parse_args()

REF = json.load(open(os.path.join(ROOT, 'tools/mannequin/anthro-ansur2.json')))
MAN = json.load(open(a.mannequin))
J = MAN['joints']
pat = next(np.array(b['pos']).reshape(-1, 3) for b in MAN['bones'] if b['name'] == 'patella' and b['side'] == 'L')

body = AnnyBody()
meas = Measurer(body, REF)
meas.patella_top = float(pat[:, 1].max())

PHEN = ['muscle', 'weight', 'height', 'proportions']
LOCAL = ['torso-scale-depth-incr', 'torso-scale-horiz-incr', 'torso-vshape-incr', 'torso-muscle-dorsi-incr',
         'torso-muscle-pectoral-incr', 'measure-bust-circ-incr', 'measure-underbust-circ-incr', 'measure-waist-circ-incr',
         'measure-hips-circ-incr', 'measure-shoulder-dist-incr', 'measure-frontchest-dist-incr',
         'measure-napetowaist-dist-incr', 'measure-waisttohip-dist-incr', 'hip-scale-horiz-incr', 'hip-scale-depth-incr',
         'buttocks-volume-incr', 'stomach-pregnant-incr', 'measure-neck-circ-incr', 'measure-neck-height-incr',
         'measure-upperarm-circ-incr', 'measure-upperarm-length-incr', 'measure-lowerarm-length-incr',
         'measure-wrist-circ-incr', '*-lowerarm-muscle-incr', '*-upperarm-shoulder-muscle-incr', 'measure-thigh-circ-incr',
         'measure-knee-circ-incr', 'measure-calf-circ-incr', 'measure-ankle-circ-incr', 'measure-upperleg-height-incr',
         'measure-lowerleg-height-incr', '*-foot-scale-depth-incr', '*-foot-scale-horiz-incr', 'head-scale-vert-incr',
         'head-scale-horiz-incr', 'head-scale-depth-incr']
# вес замера в подгонке (1 — обычный); длины сегментов рига — слабо, это суставы Anny, а не кости
WEIGHT = {'stature': 4, 'crotchheight': 4, 'chestcircumference': 2, 'chestbreadth': 1, 'chestdepth': 1,
          'waistcircumference': 2, 'waistbreadth': 1, 'waistdepth': 1, 'buttockcircumference': 2, 'buttockdepth': 1,
          'hipbreadth': 1.5, 'bideltoidbreadth': 1.5, 'shouldercircumference': 1, 'neckcircumference': 1,
          'neckcircumferencebase': .5, 'bicepscircumferenceflexed': 1, 'forearmcircumferenceflexed': 1,
          'wristcircumference': 1, 'thighcircumference': 1, 'lowerthighcircumference': 1, 'calfcircumference': 1,
          'anklecircumference': 1, 'headcircumference': .7, 'headlength': .5, 'headbreadth': .5, 'footlength': .7,
          'footbreadthhorizontal': .3, 'weightkg': .5}
SEG = {'_ua': (28.3, .25), '_fa': (27.0, .25), '_knee': (48.8, .5), '_ankle': (7.0, .5)}   # длины плеча и предплечья манекена (B.ua, B.fa), высоты коленного и голеностопного суставов манекена, см; вес на 1 см


def unpack(x):
    phen = {k: float(v) for k, v in zip(PHEN, x[:len(PHEN)])}
    local = {}
    for k, v in zip(LOCAL, x[len(PHEN):]):
        if k.startswith('*'):
            local['l' + k[1:]] = float(v); local['r' + k[1:]] = float(v)
        else:
            local[k] = float(v)
    return phen, local


def build(x):
    phen, local = unpack(x)
    rest = body.rest(phen, local)
    V, H = body.stance(rest, J)
    return V, H


def resid(x):
    V, H = build(x)
    m = meas.measure(V, H)
    out = []
    for k, w in WEIGHT.items():
        p25, p50, p75 = REF['values'][k]
        out.append(w * (m[k] - p50) / max(p75 - p25, .3))
    for k, (t, w) in SEG.items():
        out.append(w * (m[k] - t))
    out.extend(.15 * np.asarray(x[len(PHEN):]))      # местные формы — как можно меньше
    return np.array(out)


x0 = np.array([.5] * len(PHEN) + [0.] * len(LOCAL))
lo = np.array([0.] * len(PHEN) + [-1.] * len(LOCAL)); hi = np.array([1.] * len(PHEN) + [1.] * len(LOCAL))
t = time.time()
r0 = resid(x0)
print('старт: сумма квадратов', float(r0 @ r0), f'{time.time() - t:.2f} с на оценку', flush=True)
res = least_squares(resid, x0, bounds=(lo, hi), diff_step=.02, max_nfev=a.iters, verbose=1, x_scale=.3, xtol=1e-12, ftol=1e-10)
for k in range(2):
    res = least_squares(resid, res.x, bounds=(lo, hi), diff_step=.01, max_nfev=a.iters, verbose=1, x_scale=.3, xtol=1e-12, ftol=1e-10)
print('итог: сумма квадратов', float(res.fun @ res.fun), f'{time.time() - t:.0f} с', flush=True)
V, H = build(res.x)
m = meas.measure(V, H)
m0 = meas.measure(*build(x0))
phen, local = unpack(res.x)
json.dump({'phen': phen, 'local': local, 'x': res.x.tolist(), 'measures': {k: float(v) for k, v in m.items()},
           'measures_default': {k: float(v) for k, v in m0.items()}, 'age': __import__('anny_body').AGE_27,
           'mannequin': a.mannequin, 'cost': float(res.fun @ res.fun)}, open(a.out, 'w'), indent=1)
np.save(a.out.replace('.json', '-verts.npy'), V)
np.save(a.out.replace('.json', '-heads.npy'), H)
np.save(a.out.replace('.json', '-faces.npy'), body.faces)
for k in WEIGHT:
    p25, p50, p75 = REF['values'][k]
    print(f'{k:28s} {m[k]:7.1f}  люди {p50:6.1f} ({p25}–{p75})  было {m0[k]:7.1f}')
print('ua, fa', round(m['_ua'], 1), round(m['_fa'], 1))
print({k: round(v, 3) for k, v in phen.items()})
print({k: round(v, 2) for k, v in local.items() if abs(v) > .05})
