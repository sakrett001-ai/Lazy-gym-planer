"""Стартовая посадка скелета — только по нормам осанки (без кожи): python3 tools/skin-anny/posture_start.py --work W
Пишет W/posture-B.json (старт совместной подгонки) и печатает углы до и после.

Череп — к посадке HAT: в 4.61.0 шея и череп HAT повёрнуты вперёд на 12° вместе с грудным блоком (build_bones.py: hat() →
trunkMap с наклоном 12°), а блок C2 + атлас ещё и на −27,8° к черепу. Конгруэнтный сустав атлант — затылок при черепе в
посадке 4.61.0 требует наклона C2 на +20°, и шейный лордоз при нормальном наклоне T1 уходит в кифоз. Поэтому старт —
череп −12° (как в самой модели HAT), высота C7 — с малым весом (с черепом MyoSim и шеей его длины недостижима, см. README).
"""
import argparse, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
import spine

ap = argparse.ArgumentParser(); ap.add_argument('--work', required=True); ap.add_argument('--sk', type=float, default=-12.0)
a = ap.parse_args(); W = a.work
ref = json.load(open(os.path.join(ROOT, 'tools/mannequin/anthro-ansur2.json')))['values']
p = spine.Posture(json.load(open(os.path.join(W, 'm461.json'))), json.load(open(os.path.join(W, 'endplates.json'))))
x, tg = spine.fit_posture(p, ref, iters=40, w={'cervicale': .2}, extra=lambda x: np.array([(x['sk'] - a.sk) / 1.0]))
m0, m = p.measures({}), p.measures(x)
for k in ('PI', 'PT', 'SS', 'LL', 'TK', 'T1slope', 'CL', 'SVA', 'cSVA', 'jugular', 'cervicale', 'tenthrib', 'close_a'):
    print(f'{k:9s} {m0[k]:7.1f} → {m[k]:7.1f}   цель {tg[k][0]:.1f} ± {tg[k][1]:.1f}' if k in tg else f'{k:9s} {m0[k]:7.1f} → {m[k]:7.1f}')
print({k: np.round(np.asarray(v, float), 2).tolist() for k, v in x.items()})
json.dump({k: (np.asarray(v, float).tolist()) for k, v in x.items()}, open(os.path.join(W, 'posture-B.json'), 'w'))
