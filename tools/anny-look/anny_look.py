"""Anny подтянутая в нейтральной стойке манекена 4.61.0 (кожа «только внешний вид»).

Форма — одобренная владельцем подтянутая Anny (tools/skin-anny/result/anny-toned.json: фенотип, местные формы, нейтральный
пах); поза её рига — по скелету 4.61.0 (tools/anny-look/fit.json: поза корпуса и сдвиг подобраны fit.py, плюс небольшие
поправки местных форм там, где Anny отходила от процедурной кожи 4.61.0 больше чем на 2–3 см). Конечности — как в
tools/skin-anny/anny_pose.py: шарниры — наши суставы (плечевой, локтевой, тазобедренный, коленный, голеностопный),
направления сегментов — нашей нейтральной стойки. Кисть Anny повёрнута к рамке кисти манекена, пальцы — по суставам пальцев
расслабленной кисти манекена.
"""
import json, os
import numpy as np
import torch
from common import ROOT
from anny_pose import AnnyPosed, to_anny, rx, ry, SPINE
from anny_body import to_ours, dir_to_anny, rot_between

TONED = os.path.join(ROOT, 'tools/skin-anny/result/anny-toned.json')
FIT = os.path.join(ROOT, 'tools/anny-look/fit.json')
POSE_KEYS = ['sp5', 'sp4', 'sp3', 'sp2', 'sp1', 'neck', 'head', 'clav_e', 'clav_r', 'ty', 'tz', 'tw_ua', 'tw_fa', 'tw_th', 'neck_ty', 'neck_tz']
FINGER_BONES = {0: ['finger1-1', 'finger1-2', 'finger1-3'], 1: ['finger2-1', 'finger2-2', 'finger2-3'], 2: ['finger3-1', 'finger3-2', 'finger3-3'],
                3: ['finger4-1', 'finger4-2', 'finger4-3'], 4: ['finger5-1', 'finger5-2', 'finger5-3']}
HAND_BONES = ('wrist', 'finger', 'metacarpal')


def q_from(v):
    a = [float(v[k]) for k in POSE_KEYS]
    return {'spine': a[:5], 'neck': a[5], 'head': a[6], 'clav': [a[7], a[8]], 't': [a[9], a[10]], 'tw': a[11:14], 'neck_t': [a[14], a[15]]}


def v_from(q):
    return dict(zip(POSE_KEYS, list(q['spine']) + [q['neck'], q['head'], q['clav'][0], q['clav'][1], q['t'][0], q['t'][1]] + list(q['tw']) + list(q['neck_t'])))


def frame_from(a, b):
    """ортонормированная рамка: первая ось — a, вторая — b без проекции на a"""
    a = a / np.linalg.norm(a); b = b - a * (b @ a); b = b / np.linalg.norm(b)
    return np.stack([a, b, np.cross(a, b)], 1)


class AnnyLook(AnnyPosed):
    def __init__(self):
        torch.set_num_threads(1)
        super().__init__()
        self.toned = json.load(open(TONED))

    def params(self, fit=None):
        """фенотип и местные формы: одобренные + поправки fit.json"""
        A = self.toned; phen = dict(A['phenotype']); local = dict(A['local_changes']); local['bulge-incr'] = A['bulge-incr']
        for k, d in ((fit or {}).get('local_delta') or {}).items():
            local[k] = float(np.clip(local.get(k, 0.0) + d, -1, 1))
        return phen, local

    def bones_pose(self, rest, J, q, hands=None):
        """матрицы костей G (Anny, м) для стойки: корпус — позой рига q, конечности — шарнирами на наших суставах (как
        AnnyPosed.pose), кисть — к рамке кисти манекена, пальцы — по суставам его расслабленной кисти (hands, export.js)"""
        L = self.idx; nb = len(self.labels)
        heads = rest['rest_bone_heads'][0].cpu().numpy().astype(np.float64)
        t = np.array([0.0, q['t'][0], q['t'][1]])
        D = [np.eye(3) for _ in range(nb)]
        for n, a in zip(SPINE, q['spine']): D[L[n]] = rx(a)
        D[L['neck01']] = rx(q['neck']); D[L['head']] = rx(q['head'])
        ce, cr = q['clav']
        for s, g in (('L', 1), ('R', -1)):
            k = np.array([0, -1.0, 0]); a = np.radians(ce) * g; K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
            D[L['clavicle.' + s]] = ry(cr * g) @ (np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K)
        G = [None] * nb
        limb = {L[n] for n in self.labels if n[-2:] in ('.L', '.R') and n.startswith(('upperleg', 'lowerleg', 'foot', 'toe', 'upperarm', 'lowerarm') + HAND_BONES)}
        for i in self.order:
            p = self.parents[i]; Gp = np.eye(4) if (p is None or p < 0) else G[p]
            if i in limb: continue
            Gi = np.eye(4); Gi[:3, :3] = D[i]; Gi[:3, 3] = heads[i] - D[i] @ heads[i]
            if i == L['neck01']:
                nt = q['neck_t']; Gi[:3, 3] += np.array([0, -nt[1], nt[0]]) / 100.0
            G[i] = Gp @ Gi
        tw = q['tw']

        def seg(parent_G, joint_w, child_rest=None, child_w=None, twist=0.0):
            pj = to_anny(joint_w, t); Gi = np.linalg.inv(parent_G); pr = Gi[:3, :3] @ pj + Gi[:3, 3]
            if child_rest is None: R = np.eye(3)
            else:
                dw = dir_to_anny(np.subtract(child_w, joint_w)); dw = dw / np.linalg.norm(dw)
                R = rot_between(child_rest - pr, dw)
                if twist:
                    a = np.radians(twist); K = np.array([[0, -dw[2], dw[1]], [dw[2], 0, -dw[0]], [-dw[1], dw[0], 0]])
                    R = (np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K) @ R
            M = np.eye(4); M[:3, :3] = R; M[:3, 3] = pj - R @ pr
            return M
        for s in 'LR':
            h = lambda n: heads[L[n + '.' + s]]; g = 1 if s == 'L' else -1
            Gth = seg(G[L['pelvis.' + s]], J['hip' + s], h('lowerleg01'), J['kn' + s], g * tw[2])
            Gsk = seg(Gth, J['kn' + s], h('foot'), J['an' + s])
            Gft = seg(Gsk, J['an' + s])
            Gua = seg(G[L['shoulder01.' + s]], J['sh' + s], h('lowerarm01'), J['el' + s], g * tw[0])
            Gfa = seg(Gua, J['el' + s], h('wrist'), J['wr' + s], g * tw[1])
            for n in self.labels:
                if not n.endswith('.' + s): continue
                i = L[n]
                if n.startswith('upperleg'): G[i] = Gth
                elif n.startswith('lowerleg'): G[i] = Gsk
                elif n.startswith(('foot', 'toe')): G[i] = Gft
                elif n.startswith('upperarm'): G[i] = Gua
                elif n.startswith(('lowerarm',) + HAND_BONES): G[i] = Gfa
        if hands is not None:
            G = self.hand_pose(G, heads, hands, J, t)
        return G, heads

    def hand_pose(self, G, heads, hands, J, t):
        """кисть Anny — к кисти манекена: поворот вокруг сустава запястья (и сдвиг его на наш сустав) так, что направление
        «запястье — середина пястно-фаланговых суставов» и линия «указательный — мизинец» совпадают с нашими; затем фаланги
        по суставам пальцев манекена (направления; длины — свои)"""
        G = [g.copy() for g in G]; L = self.idx
        for s in 'LR':
            H = hands[s]; ix = lambda n: L[n + '.' + s]
            P = lambda i: G[i][:3, :3] @ heads[i] + G[i][:3, 3]
            wr = P(ix('wrist'))
            a_mid = (P(ix('finger3-1')) - wr); a_side = P(ix('finger2-1')) - P(ix('finger5-1'))
            ours_wr = to_anny(np.array(J['wr' + s]), t)
            o_mid = to_anny(np.array(H['fingers'][1][0]), t) - ours_wr
            o_side = to_anny(np.array(H['fingers'][0][0]), t) - to_anny(np.array(H['fingers'][3][0]), t)
            Ra = frame_from(a_mid, a_side); Ro = frame_from(o_mid, o_side); Rw = Ro @ Ra.T
            M = np.eye(4); M[:3, :3] = Rw; M[:3, 3] = ours_wr - Rw @ wr
            for n in self.labels:
                if n.endswith('.' + s) and n.startswith(HAND_BONES): G[L[n]] = M @ G[L[n]]
            chains = {0: H['thumb']}
            for f in range(4): chains[f + 1] = H['fingers'][f]
            for f, bones in FINGER_BONES.items():
                pts = [to_anny(np.array(p), t) for p in chains[f]]
                for k, bn in enumerate(bones):
                    i = ix(bn); p = self.parents[i]
                    G[i] = G[p].copy()          # фаланга идёт за родителем (поворот родителя уже применён)
                    hp = P(i)
                    nxt = heads[i + 1] - heads[i] if k < 2 else heads[i] - heads[i - 1]
                    d = G[i][:3, :3] @ nxt
                    Rf = rot_between(d, pts[k + 1] - pts[k])
                    Mf = np.eye(4); Mf[:3, :3] = Rf; Mf[:3, 3] = hp - Rf @ hp
                    G[i] = Mf @ G[i]
        return G

    def stance(self, rest, J, q, hands=None, groin=True):
        """вершины в стойке (см, авторинг), головы костей рига в позе (см, авторинг) и матрицы костей"""
        G, heads = self.bones_pose(rest, J, q, hands)
        t = np.array([0.0, q['t'][0], q['t'][1]])
        Tt = torch.tensor(np.stack(G)[None], dtype=torch.float32)
        verts = self.m.get_skinned_vertices(rest['rest_vertices'], Tt)[0].cpu().numpy().astype(np.float64)
        V = to_ours(verts) + t
        if groin and self.groin is not None: V = self.groin_smooth(V)
        H = np.array([G[i][:3, :3] @ heads[i] + G[i][:3, 3] for i in range(len(self.labels))])
        return V, to_ours(H) + t, G, heads
