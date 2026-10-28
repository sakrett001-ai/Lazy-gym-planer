"""Anny в нейтральной стойке манекена 4.61.0 (кожа «только внешний вид»).

Форма — эталон «обычного мужчины», одобренный владельцем: Anny по умолчанию (мужчина 27 лет, мышечность, вес и пропорции
0,5, местные формы тела и пах — по умолчанию) на нашем скелете: рост фенотипа и три местные формы длин сегментов
(tools/anny-look/look.json, подгонка — tools/anny-look/lengths.py) — чтобы суставы рига Anny совпали с суставами
скелета; поза её рига — по скелету 4.61.0 (tools/anny-look/fit.json: поза корпуса и сдвиг подобраны fit.py). Прежняя
подтянутая форма 4.62.0 (tools/skin-anny/result/anny-toned.json) — для сравнения на листах (shape='toned'). Конечности — как в
tools/skin-anny/anny_pose.py: шарниры — наши суставы (плечевой, локтевой, тазобедренный, коленный, голеностопный),
направления сегментов — нашей нейтральной стойки. Кисть Anny повёрнута к рамке кисти манекена, пальцы — по суставам пальцев
расслабленной кисти манекена.
"""
import json, os
import numpy as np
import torch
import anny
from common import ROOT
from anny_pose import AnnyPosed, to_anny, rx, ry, SPINE
from anny_body import to_ours, dir_to_anny, rot_between

TONED = os.path.join(ROOT, 'tools/skin-anny/result/anny-toned.json')
FIT = os.path.join(ROOT, 'tools/anny-look/fit.json')
LOOK = os.path.join(ROOT, 'tools/anny-look/look.json')
# эталон «обычного мужчины» (лист для владельца): Anny по умолчанию — мужчина 27 лет, мышечность, вес и пропорции 0,5, без
# местных форм; рост 0,35 — у Anny шкала роста своя (0,5 — 190,8 см), 0,35 — 174,4 см, медиана ANSUR II (174,5)
REFERENCE = {'phenotype': {'muscle': .5, 'weight': .5, 'height': .35, 'proportions': .5}, 'local': {'bulge-incr': 0.0}}
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
    def __init__(self, shape='look'):
        """shape: 'look' — эталон на нашем скелете (look.json, сборка), 'toned' — подтянутая форма 4.62.0 (для листа),
        'reference' — эталон REFERENCE как есть (Anny по умолчанию, рост 174,4 см, без форм длин, для листа)"""
        torch.set_num_threads(1)
        super().__init__()
        self.toned = json.load(open(TONED)); self.shape = shape
        self.look = json.load(open(LOOK)) if shape == 'look' else None

    def params(self, fit=None):
        """фенотип и местные формы: look.json (эталон на нашем скелете) или подтянутая форма 4.62.0; поправки fit.json"""
        if self.shape == 'reference':
            return dict(REFERENCE['phenotype']), dict(REFERENCE['local'])
        if self.look:
            phen = dict(self.look['phenotype']); local = dict(self.look['local'])
        else:
            A = self.toned; phen = dict(A['phenotype']); local = dict(A['local_changes']); local['bulge-incr'] = A['bulge-incr']
        for k, d in ((fit or {}).get('local_delta') or {}).items():
            local[k] = float(np.clip(local.get(k, 0.0) + d, -1, 1))
        return phen, local

    def rest(self, phen, local=None):
        """покой рига; у формы look — руки и ноги со своим фенотипом (look.json: limbs), см. limb_blend"""
        out = super().rest(phen, local)
        limbs = (self.look or {}).get('limbs') if self.shape == 'look' else None
        if not limbs: return out
        V = out['rest_vertices'].clone()
        for k, ph in limbs.items():
            p2 = dict(phen); p2.update(ph)
            V2 = super().rest(p2, local)['rest_vertices']
            a = torch.tensor(self.limb_blend(k), dtype=V.dtype)[None, :, None]
            V = V + a * (V2 - out['rest_vertices'])
        out = dict(out); out['rest_vertices'] = V
        return out

    def limb_blend(self, kind):
        """доля фенотипа конечности у вершины: по весам рига Anny на кости руки (arms) или ноги (legs), обе стороны;
        малые доли (у Anny доли кости плеча 0,02–0,2 лежат по груди и спине, бедра — по крестцу) не берутся: плавно от 0,1
        до 0,9"""
        w = sum(self.arm_w[s] if kind == 'arms' else self.leg_w[s] for s in 'LR')
        u = np.clip((w - .1) / .8, 0, 1)
        return u * u * (3 - 2 * u)

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

    def neutral_face(self, V, H):
        """Глазницы закрыты гладкими «веками» (глаз нет, как у манекена). Выстилку глазниц (у Anny — глубокая чаша без
        глазного яблока, ~700 вершин на глаз) сплющивать в заплатку нельзя: тысячи треугольников в 3 см² с координатами до
        0,01 см складываются и вырождаются, нормали — шум, на свету — белые пятна, как глаза. Поэтому выстилка убирается, а
        прорезь век закрывается своей заплаткой: край прорези, кольцо вдвое ближе к середине и середина (cap_sockets),
        новые вершины — fair() (продолжает выпуклость век без излома), середина — на EYE_SINK см глубже (сомкнутые веки)."""
        F = self.skin_faces; L = self.idx
        eyes = [H[L['eye.L']], H[L['eye.R']]]
        # выстилка полостей — список вершин пакета Anny (data/template_mesh_internal_cavities.pth: глазницы и рот, номера —
        # те же, что у сетки), у глаз; плюс вершины, чей луч по нормали снова встречает кожу (на всякий случай)
        cav = torch.load(os.path.join(os.path.dirname(anny.__file__), 'data/template_mesh_internal_cavities.pth'), weights_only=False)['vertex_indices']
        cav = np.array([i for i in cav if i < len(V)]); near = np.zeros(len(V), bool)
        # связные куски выстилки (по рёбрам сетки между её вершинами) — целиком те, чья середина у глаза (ближе 4 см)
        import scipy.sparse.csgraph as cg
        iscav = np.zeros(len(V), bool); iscav[cav] = True
        A = neighbors(F, len(V)).tocoo(); m = iscav[A.row] & iscav[A.col]
        import scipy.sparse as sp_
        G = sp_.coo_matrix((np.ones(m.sum()), (A.row[m], A.col[m])), shape=(len(V), len(V)))
        ncomp, lab = cg.connected_components(G, directed=False)
        for c in eyes:   # у каждого глаза — самый большой кусок с серединой ближе 4 см (мелкие — вне чаши: у век, у носа)
            best = max((k for k in np.unique(lab[cav]) if np.linalg.norm(V[cav[lab[cav] == k]].mean(0) - c) < 4.0), key=lambda k: (lab[cav] == k).sum())
            near[cav[lab[cav] == best]] = True
        # в списке пакета — не все вершины выстилки (между кусками остаются вершины без отметки): замыкание (рост на 2 кольца
        # и сжатие на 2) заполняет промежутки внутри чаши, не выходя за кромку век
        closed = grow(F, near, 2); closed &= ~grow(F, ~closed, 2); near |= closed
        # убирается только выстилка из списка пакета (чаша с краем по кромке век): по лучам нормалей (eye_sockets) в выборку
        # попадали и складки век и виска — после удаления там оставались дыры с рваным краем
        sel = near
        self.socket = sel
        n0 = len(V)
        if sel.any():
            V, F, src, depth = cap_sockets(V, F, sel)
            new = np.arange(n0, len(V)); region = np.zeros(len(V), bool); region[new] = True
            # и кромки век (EYE_RINGS колец от прорези): у Anny они толстые, загнуты к глазному яблоку; без него нижняя кромка —
            # полочка, обращённая вверх, на свету — белая полоса, как белок глаза. Заплатка вместе с ними — гладкие сомкнутые веки
            rim = np.zeros(len(V), bool); rim[np.unique(np.concatenate([np.array(r) for r in src]))] = True
            region |= grow(F, rim, EYE_RINGS) & (np.linalg.norm(V[:, None, :] - np.array(eyes)[None], axis=2).min(1) < 3.0)
            V = fair(V, F, region)
            for c in eyes:
                idx = new[np.linalg.norm(V[new] - c, axis=1) < 4.0]
                nrm = (V[idx] - c) / np.maximum(np.linalg.norm(V[idx] - c, axis=1), 1e-9)[:, None]
                V[idx] -= nrm * (EYE_SINK * depth[idx - n0])[:, None]
            # новые вершины: веса и главная кость — средние по краю своей прорези
            Wn = np.stack([self.weights[r].mean(0) for r in src]); Wn /= Wn.sum(1, keepdims=True)
            self.weights = np.vstack([self.weights, Wn]); self.dominant = np.concatenate([self.dominant, Wn.argmax(1)])
            self.skin_faces = F
        # выстилка рта (полость за сомкнутыми губами): снаружи не видна — в проверках отхода и опор не считается
        # (в списке пакета есть и 33 вершины на теле — у плеча, на груди: их номера, видимо, из другой нумерации сетки; берём
        # только вершины головы — главная кость head)
        self.cavity = np.zeros(len(V), bool); self.cavity[cav] = True; self.cavity[:n0] &= ~sel
        self.cavity &= self.dominant == L['head']
        return V

    def neutral_throat(self, V, H):
        """ярёмная ямка: у подтянутой Anny — глубокая ямка над грудиной между ножками грудино-ключично-сосцевидных; на
        свету приложения (ключевой сверху спереди) она — тёмное пятно ромбом на горле в каждом виде спереди. Гладкая
        заплатка fair() по средней линии: |x| < THROAT[0] см, от THROAT[1] см ниже до THROAT[2] см выше середины
        грудино-ключичных суставов (головки костей ключиц рига), спереди от них"""
        F = self.skin_faces; L = self.idx; c = (H[L['clavicle.L']] + H[L['clavicle.R']]) / 2
        used = np.zeros(len(V), bool); used[np.unique(F)] = True
        sel = used & (np.abs(V[:, 0]) < THROAT[0]) & (V[:, 1] > c[1] - THROAT[1]) & (V[:, 1] < c[1] + THROAT[2]) & (V[:, 2] > c[2])
        self.throat_sel = sel
        return fair(V, F, sel) if sel.any() else V

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


# ---------------- лицо и горло: гладкое заполнение (без глаз, без «дыр» и тёмных пятен) ----------------
EYE_SINK, EYE_RINGS = .3, 6
THROAT = (3.5, 2.0, 4.5)


def neighbors(F, n):
    import scipy.sparse as sp
    I = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]]); J = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = sp.coo_matrix((np.ones(len(I)), (I, J)), shape=(n, n)).tocsr(); A.data[:] = 1.0
    return A


def fair(V, F, region, k=2):
    """гладкая заплатка: вершины region — решение L^k x = 0 (равномерный лапласиан), остальные неподвижны (край —
    соседние кольца: при k = 2 поверхность продолжает соседнюю кожу без излома)"""
    import scipy.sparse as sp, scipy.sparse.linalg as sl
    n = len(V); A = neighbors(F, n); deg = np.asarray(A.sum(1)).ravel()
    L = sp.identity(n, format='csr') - sp.diags(1 / np.maximum(deg, 1)) @ A
    Lk = L
    for _ in range(k - 1): Lk = Lk @ L
    Lk = Lk.tocsr()
    ri = np.where(region)[0]; fi = np.where(~region)[0]
    Arr = Lk[ri][:, ri].tocsc(); Arf = Lk[ri][:, fi]
    out = V.copy()
    for c in range(3):
        out[ri, c] = sl.spsolve(Arr, -Arf @ V[fi, c])
    return out


def eye_sockets(V, F, eyes, r=3.2):
    """выстилка глазниц (у Anny без глазных яблок): вершины у глаза, чей луч по нормали наружу снова встречает кожу ближе
    2,5 см — они смотрят внутрь полости; плюс одно кольцо соседей (сгладить край век)"""
    import trimesh
    m = trimesh.Trimesh(V, F, process=False); N = np.asarray(m.vertex_normals)
    sel = np.zeros(len(V), bool)
    for c in eyes:
        idx = np.where(np.linalg.norm(V - c, axis=1) < r)[0]
        if not len(idx): continue
        O = V[idx] + N[idx] * .02
        loc, ir, it = m.ray.intersects_location(O, N[idx], multiple_hits=False)
        hit = np.zeros(len(idx), bool)
        if len(loc):
            d = np.linalg.norm(loc - O[ir], axis=1); hit[ir[d < 2.5]] = True
        sel[idx[hit]] = True
    return sel


def cap_sockets(V, F, sel):
    """убрать треугольники с вершинами sel и закрыть дыры: край — петля граничных рёбер, кольцо на полпути к середине и
    середина (обход — как у убранных: ребро края в заплатке идёт против ребра оставшегося треугольника). Возвращает V, F,
    для каждой новой вершины — вершины края её петли (src) и глубину (0,5 у кольца, 1 у середины)."""
    Fk = F[~sel[F].any(1)]
    # островки (дно чаши без отметок в списке пакета) — прочь: остаётся одна связная кожа
    import scipy.sparse as sp_, scipy.sparse.csgraph as cg
    n = len(V); I = np.concatenate([Fk[:, 0], Fk[:, 1], Fk[:, 2]]); J = np.concatenate([Fk[:, 1], Fk[:, 2], Fk[:, 0]])
    _, lab = cg.connected_components(sp_.coo_matrix((np.ones(len(I)), (I, J)), shape=(n, n)), directed=False)
    main = np.bincount(lab[Fk[:, 0]]).argmax(); Fk = Fk[lab[Fk[:, 0]] == main]
    he = {}
    for f in Fk:
        for a, b in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])): he[(a, b)] = True
    nxt = {a: b for (a, b) in he if (b, a) not in he}
    V = list(V); faces = [Fk]; src = []; depth = []; loops = []
    seen = set()
    for start in list(nxt):
        if start in seen: continue
        loop = [start]; seen.add(start); v = nxt[start]
        while v != start and v not in seen:
            loop.append(v); seen.add(v); v = nxt[v]
        if len(loop) < 3: continue
        loops.append((len(loop), np.round(np.array([V[i] for i in loop]).mean(0), 1).tolist(), np.round(np.ptp(np.array([V[i] for i in loop]), 0), 1).tolist()))
        P = np.array([V[i] for i in loop]); c = P.mean(0); k = len(loop)
        ring = []
        for p in P:
            V.append(c + (p - c) * .5); ring.append(len(V) - 1); src.append(loop); depth.append(.5)
        V.append(c); ci = len(V) - 1; src.append(loop); depth.append(1.0)
        cap = []
        for i in range(k):
            a, b = loop[i], loop[(i + 1) % k]; ra, rb = ring[i], ring[(i + 1) % k]
            cap += [(b, a, ra), (b, ra, rb), (rb, ra, ci)]
        faces.append(np.array(cap))
    print('  глазницы: петли края', loops)
    return np.array(V), np.concatenate(faces), src, np.array(depth)


def grow(F, sel, rings=1):
    A = neighbors(F, len(sel))
    for _ in range(rings): sel = sel | (A @ sel.astype(float) > 0)
    return sel
