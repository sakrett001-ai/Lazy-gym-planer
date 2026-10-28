"""Быстрый просмотр подгонки: манекен 4.61.0 и Anny в стойке (fit.json) — спереди, сбоку, сзади, три четверти.
python3 tools/anny-look/preview.py --out qa/anny-look/preview.png [--fit tools/anny-look/fit.json] [--hands]"""
import argparse, json, os, subprocess, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import common as C
from anny_look import AnnyLook, q_from, FIT

ap = argparse.ArgumentParser(); ap.add_argument('--out', default=os.path.join(C.ROOT, 'qa/anny-look/preview.png')); ap.add_argument('--fit', default=FIT)
ap.add_argument('--hands', action='store_true'); ap.add_argument('--groin', default='smooth'); ap.add_argument('--zoom', default='')
a = ap.parse_args()
P = C.Procedural(); body = AnnyLook(); fit = json.load(open(a.fit))
phen, local = body.params(fit); rest = body.rest(phen, local)
q = q_from(fit['pose']); hands = P.D['hands'] if a.hands else None
V, H = body.stance(rest, P.J, q, hands, groin=False)[:2]
if a.groin == 'smooth': body.setup_groin(V); V = body.stance(rest, P.J, q, hands)[0]
if a.groin in ('face', 'all'): V = body.neutral_face(V, H); print('глазницы:', int(body.socket.sum()), 'вершин')
mesh = {'pos': np.round(V, 2).ravel().tolist(), 'idx': body.skin_faces.ravel().tolist()}
CEN = [0, 87.5, 1.5]; full = 112
rows = [{'title': 'манекен 4.61.0', 'panels': [{'label': c, 'cam': c, 'center': CEN, 'span': full, 'body': 'mannequin', 'w': 300, 'h': 560} for c in ('front', 'side', 'back', 'angle')]},
        {'title': 'Anny (fit.json)', 'panels': [{'label': c, 'cam': c, 'center': CEN, 'span': full, 'body': 'mesh', 'mesh': mesh, 'w': 300, 'h': 560} for c in ('front', 'side', 'back', 'angle')]}]
if a.zoom:
    for z in a.zoom.split(';'):
        cx, cy, cz, span, cam = z.split(',')
        c = [float(cx), float(cy), float(cz)]
        rows.append({'title': f'крупно {z}', 'panels': [{'label': 'манекен', 'cam': cam, 'center': c, 'span': float(span), 'body': 'mannequin', 'w': 420, 'h': 420},
                                                       {'label': 'Anny', 'cam': cam, 'center': c, 'span': float(span), 'body': 'mesh', 'mesh': mesh, 'w': 420, 'h': 420},
                                                       {'label': 'вместе (Anny полупрозрачна)', 'cam': cam, 'center': c, 'span': float(span), 'body': 'mannequin', 'mesh': mesh, 'ghost': True, 'w': 420, 'h': 420}]})
spec = {'title': 'Anny под 4.61.0 — просмотр подгонки', 'rows': rows}
os.makedirs(os.path.dirname(a.out), exist_ok=True)
sp = a.out + '.spec.json'; json.dump(spec, open(sp, 'w'))
subprocess.run(['node', os.path.join(C.ROOT, 'tools/skin-anny/render.mjs'), '--spec', sp, '--out', a.out, '--width', '1300'], check=True)
