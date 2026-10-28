"""Эталон на нашем скелете: рост фенотипа и местные формы длин сегментов Anny по умолчанию (мужчина 27 лет, мышечность,
вес и пропорции 0,5) — чтобы суставы рига Anny совпали с суставами скелета 4.61.0.

python3 tools/anny-look/lengths.py [--write]

Конечности Anny стоят шарнирами на наших суставах (anny_look.AnnyLook.bones_pose): сегмент поворачивается к нашему, его
начало — в нашем суставе. Если длина сегмента рига другая, кожа у следующего сустава растягивается или сминается; корпус
другой длины ставит плечевые суставы рига выше или ниже наших (рука крепится к нашему плечевому суставу). Подбираются рост
фенотипа и формы FORMS; цели — длины бедра, голени, плеча и предплечья (суставы манекена), высота плечевых суставов над
тазобедренными и рост (темя на 175 см: голова процедурной кожи — до 174,5). Формы — как можно меньше (единица формы — как
2 см невязки), остальные формы тела — по умолчанию. --write — записать в tools/anny-look/look.json.
"""
import argparse, json, os, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import common as C
from anny_look import AnnyLook, LOOK

FORMS = ['measure-lowerleg-height-incr', 'measure-upperarm-length-incr', 'measure-waisttohip-dist-incr']
STATURE = 175.0
WT = {'th': 1, 'sk': 1, 'ua': 1, 'fa': 1, 'trunk': 1, 'top': .5}
REG = 2.0


def targets(J):
    d = lambda a, b: float(np.linalg.norm(np.subtract(J[a], J[b])))
    return {'th': d('hipL', 'knL'), 'sk': d('knL', 'anL'), 'ua': d('shL', 'elL'), 'fa': d('elL', 'wrL'),
            'trunk': float(J['shL'][1] - J['hipL'][1]), 'top': STATURE - float(J['hipL'][1])}


def base_phenotype():
    """мышечность, вес и пропорции — из look.json (у эталона 0,5)"""
    ph = json.load(open(LOOK))['phenotype']; return {k: ph[k] for k in ('muscle', 'weight', 'proportions')}


def measure(body, x):
    """длины рига и рост над тазобедренными (см) для роста x[0] и форм x[1:]; Anny в покое: Z вверх"""
    phen = dict(base_phenotype(), height=float(x[0])); local = {k: float(v) for k, v in zip(FORMS, x[1:])}; local['bulge-incr'] = 0.0
    r = body.rest(phen, local); L = body.idx
    H = r['rest_bone_heads'][0].cpu().numpy().astype(np.float64) * 100; V = r['rest_vertices'][0].cpu().numpy().astype(np.float64) * 100
    h = lambda n: H[L[n]]; mid = lambda a: (h(a + '.L') + h(a + '.R')) / 2
    return {'th': np.linalg.norm(h('upperleg01.L') - h('lowerleg01.L')), 'sk': np.linalg.norm(h('lowerleg01.L') - h('foot.L')),
            'ua': np.linalg.norm(h('upperarm01.L') - h('lowerarm01.L')), 'fa': np.linalg.norm(h('lowerarm01.L') - h('wrist.L')),
            'trunk': mid('upperarm01')[2] - mid('upperleg01')[2], 'top': V[:, 2].max() - mid('upperleg01')[2]}


def fit(body, T):
    """Гаусс — Ньютон с затуханием, якобиан конечными разностями (шаг 0,05); границы: рост 0…1, формы −1…1"""
    def resid(x):
        m = measure(body, x)
        return np.array([WT[k] * (m[k] - T[k]) for k in T] + list(REG * np.asarray(x[1:])))
    lo = np.array([0.0] + [-1.0] * len(FORMS)); hi = np.array([1.0] + [1.0] * len(FORMS))
    x = np.array([.35] + [0.0] * len(FORMS)); lam = 1e-3
    for _ in range(40):
        r = resid(x); Jm = np.zeros((len(r), len(x)))
        for j in range(len(x)):
            e = np.zeros(len(x)); e[j] = .05; Jm[:, j] = (resid(x + e) - r) / .05
        dx = np.linalg.solve(Jm.T @ Jm + lam * np.eye(len(x)), -Jm.T @ r)
        xn = np.clip(x + dx, lo, hi)
        if np.sum(resid(xn) ** 2) < np.sum(r ** 2): x = xn; lam *= .5
        else: lam *= 4
        if np.abs(dx).max() < 1e-4: break
    return x


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    P = C.Procedural(); T = targets(P.J); body = AnnyLook('reference')
    m0 = measure(body, [.35] + [0.0] * len(FORMS)); x = fit(body, T); m = measure(body, x)
    print('цель / эталон (рост 0,35, без форм) / подогнано, см:')
    for k in T: print(f'  {k:6s} {T[k]:6.2f} / {m0[k]:6.2f} / {m[k]:6.2f}')
    print(f'рост фенотипа {x[0]:.4f}'); [print(f'  {k}: {v:+.4f}') for k, v in zip(FORMS, x[1:])]
    if a.write:
        d = json.load(open(LOOK)); d['phenotype']['height'] = round(float(x[0]), 4)
        for k, v in zip(FORMS, x[1:]): d['local'][k] = round(float(v), 4)
        json.dump(d, open(LOOK, 'w'), ensure_ascii=False, indent=1); print('→', LOOK)


if __name__ == '__main__':
    main()
