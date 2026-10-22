"""Быстрый просмотр промежуточной подгонки: Anny спереди, сбоку, сзади, голова, «Скелет» сбоку и сзади; сводка невязок.
python3 tools/skin-anny/preview.py --work W --fit W/joint.json --out W/preview.png
"""
import argparse, json, os, subprocess, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
import checks
import fit_joint as FJ

ap = argparse.ArgumentParser(); ap.add_argument('--work', required=True); ap.add_argument('--fit', required=True); ap.add_argument('--out', required=True)
a = ap.parse_args()
model = FJ.Model(a.work); v = np.array(json.load(open(a.fit))['v'], float)
model.body.setup_groin(model.anny(v)[0])
r, D = model.resid(v, detail=True)
V = D['V']; mesh = {'pos': np.round(V, 2).ravel().tolist(), 'idx': model.body.faces.ravel().tolist()}
bo, BP, bd = checks.bones_out(D['skin'], model.base, D['posed'], step=1)
marks = [{'p': p.round(2).tolist(), 'r': .45} for p in BP[bd < 0][::2]]
bl = [{'pos': np.round(D['posed'][b['name'] + b['side']], 3).ravel().tolist(), 'idx': model.F[b['name'] + b['side']].ravel().tolist()}
      for b in model.base.bones if b['seg'] not in ('finger', 'thumb')]
C = [0, 87.5, 1.5]
P = lambda **k: {'body': 'mesh', 'mesh': mesh, **k}
spec = {'title': os.path.basename(a.fit), 'sub': [', '.join(f'{k} {float(b @ b):.1f}' for k, b in D['R'].items())],
        'rows': [{'title': 'Anny', 'panels': [P(label=n, cam=c, center=C, span=112) for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'), ('angle', '¾'))] +
                  [P(label='голова', cam='side', center=[0, 161, 1], span=34), P(label='голова спереди', cam='front', center=[0, 161, 1], span=34)]},
                 {'title': 'Скелет', 'panels': [P(label='сбоку', cam='side', center=C, span=112, ghost=True, bones=bl, marks=marks),
                                                P(label='сзади', cam='back', center=C, span=112, ghost=True, bones=bl, marks=marks),
                                                P(label='череп', cam='side', center=[0, 161, 1], span=34, ghost=True, bones=bl, marks=marks),
                                                P(label='лопатки', cam='back', center=[0, 133, -6], span=46, ghost=True, bones=bl, marks=marks)]}]}
sp = a.out.replace('.png', '-spec.json'); json.dump(spec, open(sp, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render.mjs'), '--spec', sp, '--out', a.out, '--w', '260', '--h', '420', '--width', '1650'], check=True, cwd=ROOT,
               stdout=subprocess.DEVNULL)
print({k: round(x, 2) for k, x in D['tissue'].items()})
print('ANSUR', {k: round(float(D['m'][k]), 1) for k in ('stature', 'chestcircumference', 'chestdepth', 'waistcircumference', 'waistdepth', 'buttockcircumference',
                                                        'bideltoidbreadth', 'headcircumference', 'headlength', 'headbreadth', 'weightkg')})
print('posture', {k: (round(D['pm'][k], 1) if isinstance(D['pm'][k], float) else D['pm'][k]) for k in ('PT', 'LL', 'T1slope', 'CL', 'SVA', 'cSVA', 'jugular', 'cervicale', 'tenthrib', 'close_a')})
print('x', {k: np.round(np.asarray(x_), 1).tolist() for k, x_ in D['x'].items()}, 'q', {k: np.round(np.asarray(x_, float), 1).tolist() for k, x_ in D['q'].items()})
print('room', {k: (None if not row.get('longissimus') or row['longissimus']['room'] is None else round(row['longissimus']['room'], 2)) for k, row in D['room'].items()},
      'scap', {k: round(x_, 2) for k, x_ in D['scap'].items()})
print('out', {k: round(x_['out_max'], 1) for k, x_ in bo.items() if x_['out_max'] > .3 and not k.endswith('R')})
