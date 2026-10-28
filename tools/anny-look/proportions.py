"""Пропорции кожи Anny против эталона мужского тела (таблица листа и README).

python3 tools/anny-look/proportions.py [--json out.json]

Три формы в той же стойке манекена 4.61.0 (поза рига — fit.json): эталон (Anny по умолчанию — мужчина 27 лет, мышечность,
вес и пропорции 0,5, без местных форм, рост 174,4 см: anny_look.REFERENCE), 4.62.0 (одобренная подтянутая форма без
шлифовки) и новая (look.json: эталон на нашем скелете — рост и формы длин, lengths.py). Замеры — по правилам ANSUR II, как tools/skin-anny/anny_measure.py
(уровни — медианы ANSUR II, обхват — периметр выпуклой оболочки сечения); обхват бедра — на высоте промежности
процедурной кожи 4.61.0 − 1 см (83,5 − 1: у сетки Anny бёдра касаются друг друга до 70 см, «промежность» по сетке ниже
настоящей), левая половина сечения.

Половые различия, которые сверяются (числа — в README, «Эталон мужского тела»):
* отношение ширины по дельтам к ширине бёдер — ANSUR II (Gordon et al. 2014; медианы по таблицам NCSU Ergonomics Center):
  мужчины 50,9 / 34,4 = 1,48, женщины 45,0 / 35,3 = 1,27;
* отношение талии к ягодицам — мужчины ANSUR II (170–180 см, 72–84 кг) 88,7 / 98,4 = 0,90; женский идеал — 0,7 (Singh 1993),
  мужской — 0,9 (Singh 1995);
* выступ ягодиц назад сверх живота (глубина ягодиц − глубина талии) — ANSUR II мужчины 23,4 − 22,0 = 1,4 см;
* впадина у вертела (сбоку ягодицы) — у мужчин выражена (Kollu et al. 2023): глубина под выпуклой оболочкой сечения
  на высоте 80–96 см, задне-боковая четверть.
"""
import argparse, json, os, sys, warnings
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import numpy as np
import common as C
from anny_look import AnnyLook, q_from, FIT
from anny_measure import Measurer, section, hull_perimeter

ROWS = [('stature', 'Рост'), ('chestcircumference', 'Обхват груди'), ('waistcircumference', 'Обхват талии (пупок)'),
        ('buttockcircumference', 'Обхват ягодиц'), ('buttockdepth', 'Глубина ягодиц'), ('waistdepth', 'Глубина талии'),
        ('hipbreadth', 'Ширина бёдер'), ('bideltoidbreadth', 'Ширина по дельтам'), ('thighcircumference', 'Обхват бедра'),
        ('bicepscircumferenceflexed', 'Обхват плеча'), ('forearmcircumferenceflexed', 'Обхват предплечья'),
        ('wristcircumference', 'Обхват запястья'), ('calfcircumference', 'Обхват голени'), ('anklecircumference', 'Обхват над лодыжкой'),
        ('shr', 'Дельты / бёдра'), ('whr', 'Талия / ягодицы'), ('bproj', 'Выступ ягодиц сверх живота'),
        ('buttock_peak_h', 'Высота наибольшего выступа ягодиц'), ('troch_depr', 'Впадина у вертела')]


def hull_depth(Q):
    from scipy.spatial import ConvexHull
    eq = ConvexHull(Q).equations
    return (-(Q @ eq[:, :2].T + eq[:, 2])).min(1)


def measure(body, M, V, H):
    m = M.measure(V, H); Fn = M.F_noarm
    used = np.zeros(len(V), bool); used[np.unique(Fn)] = True
    S = section(V, Fn, np.array([0, 83.5 - 1, 0]), np.array([0, 1.0, 0])); S = S[(S[:, 0] > 0) & (S[:, 0] < 17)]
    m['thighcircumference'] = hull_perimeter(S[:, [0, 2]])
    sel = used & (np.abs(V[:, 0]) < 15) & (V[:, 1] > 70) & (V[:, 1] < 105)
    m['buttock_peak_h'] = V[sel][np.argmin(V[sel, 2]), 1]
    best = 0.0
    for h in np.arange(80, 96.1, .5):
        S = section(V, Fn, np.array([0, h, 0]), np.array([0, 1.0, 0])); S = S[S[:, 0] > 1.0]
        if len(S) < 10: continue
        Q = S[:, [0, 2]]; d = hull_depth(Q); zc = (Q[:, 1].max() + Q[:, 1].min()) / 2; k = (Q[:, 0] > 7) & (Q[:, 1] < zc)
        if k.any(): best = max(best, d[k].max())
    m['troch_depr'] = best
    m['whr'] = m['waistcircumference'] / m['buttockcircumference']; m['shr'] = m['bideltoidbreadth'] / m['hipbreadth']
    m['bproj'] = m['buttockdepth'] - m['waistdepth']
    return {k: round(float(m[k]), 2) for k, _ in ROWS}


def run():
    P = C.Procedural(); fit = json.load(open(FIT)); q = q_from(fit['pose'])
    ref = json.load(open(os.path.join(C.ROOT, 'tools/mannequin/anthro-ansur2.json')))
    out = {}
    for shape in ('reference', 'toned', 'look'):
        body = AnnyLook(shape); M = Measurer(body, ref); M.patella_top = 52.0
        phen, local = body.params(fit); rest = body.rest(phen, local)
        V, H = body.stance(rest, P.J, q, None, groin=False)[:2]
        out[shape] = measure(body, M, V, H)
    out['ansur'] = {k: ref['values'][k] for k, _ in ROWS if k in ref['values']}
    out['ansur']['shr'] = [None, round(49.7 / 33.6, 2), None]; out['ansur']['whr'] = [None, round(88.7 / 98.4, 2), None]
    out['ansur']['bproj'] = [None, round(23.4 - 22.0, 1), None]
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--json'); a = ap.parse_args()
    r = run()
    print(f"{'':36s}{'ANSUR p25–p75':>16s}{'эталон':>9s}{'4.62.0':>9s}{'новая':>9s}")
    for k, n in ROWS:
        q = r['ansur'].get(k); qs = (f'{q[0]}–{q[2]}' if q and q[0] is not None else (f'{q[1]}' if q else ''))
        print(f'{n:36s}{qs:>16s}' + ''.join(f"{r[s][k]:9.2f}" for s in ('reference', 'toned', 'look')))
    if a.json: json.dump(r, open(a.json, 'w'), ensure_ascii=False, indent=1)
