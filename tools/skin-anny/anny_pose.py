"""Anny в стойке манекена с суставами рига на наших суставах (кожа Anny, шаг 1).

В шаге 0 (anny_body.stance) конечности Anny поворачивались вокруг её собственных суставов рига, а они у Anny не там, где
у нашего скелета: «тазобедренный» — на 2,5 см латеральнее и на 3,9 см выше центра головки бедра (середина бедра, а не
сустав), «плечевой» — на 2,7 см впереди и на 2,1 см ниже центра плечевого сустава, колено — на 2,7 см выше. Здесь шарниры
конечностей — наши суставы: бедро поворачивается вокруг центра головки бедра, голень — вокруг центра коленного сустава,
плечо — вокруг центра плечевого, предплечье — вокруг локтевого (точки манекена; в покое Anny они — там, куда их переносит
преобразование родителя). Это и есть «сустав рига на центре головки бедра»: при движении ноги кожа поворачивается вокруг
него. Направления сегментов — как у манекена (нейтральная стойка), стопа и кисть — с ориентацией покоя, как в шаге 0.

Корпус Anny ставится по нашему скелету позой её же рига (поворот вперёд-назад вокруг осей костей, градусы, плюс — вперёд):
spine05…spine01 — поясница и грудной отдел (лордоз и кифоз кожи), neck01 — шея, head — голова; ключицы — подъём и
отведение назад (плечевой пояс Anny — к нашему плечевому суставу). t — сдвиг всей Anny (вверх, вперёд), см.
Пах — нейтральная гладкая форма: форма Anny «bulge» (выпуклость наружных половых органов) — в минимум (−1), затем
сглаживание сетки в паховой области (см. groin_smooth).
"""
import numpy as np
import torch
from anny_body import AnnyBody, to_ours, dir_to_anny, rot_between

SPINE = ['spine05', 'spine04', 'spine03', 'spine02', 'spine01']


def rx(a):
    a = np.radians(a); c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def ry(a):
    a = np.radians(a); c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])   # поворот вокруг вертикали Anny (Z): нужен для отведения ключицы


def to_anny(p, t):
    """мир манекена (см) → координаты Anny (м)"""
    p = (np.asarray(p, float) - t) / 100.0
    return np.stack([p[..., 0], -p[..., 2], p[..., 1]], -1)


class AnnyPosed(AnnyBody):
    def __init__(self, local_changes='all'):
        super().__init__(local_changes)
        self.order = sorted(range(len(self.labels)), key=lambda i: self._depth(i))
        self.kids = {i: [j for j, p in enumerate(self.parents) if p == i] for i in range(len(self.labels))}
        F = self.faces
        # кожа — без глаз и полости рта (три замкнутые части внутри головы): грани главной связной части
        import trimesh
        lab = trimesh.graph.connected_component_labels(trimesh.Trimesh(np.zeros((self.vw.shape[0], 3)), F, process=False).face_adjacency, node_count=len(F))
        main = np.bincount(lab).argmax(); self.skin_faces = F[lab == main]
        self.groin = None

    def coeffs(self, phen, local):
        local = dict(local or {}); local.setdefault('bulge-incr', -1.0)
        return super().coeffs(phen, local)

    def pose(self, rest, J, q):
        """rest — get_rest_model; J — суставы манекена (мир, см); q — поза корпуса Anny.
        Возвращает вершины (мир, см), головы костей в позе (мир, см) и словарь шарниров конечностей."""
        L = self.idx; nb = len(self.labels)
        heads = rest['rest_bone_heads'][0].cpu().numpy().astype(np.float64)
        t = np.array([0.0, q.get('t', [0, 0])[0], q.get('t', [0, 0])[1]])
        D = [np.eye(3) for _ in range(nb)]
        for n, a in zip(SPINE, q.get('spine', [0] * 5)):
            D[L[n]] = rx(a)
        D[L['neck01']] = rx(q.get('neck', 0.0)); D[L['head']] = rx(q.get('head', 0.0))
        ce, cr = q.get('clav', [0, 0])
        for s, g in (('L', 1), ('R', -1)):
            # подъём — вокруг оси вперёд (−Y Anny), отведение назад — вокруг вертикали (Z): у левой и правой — зеркально
            k = np.array([0, -1.0, 0]); a = np.radians(ce) * g; K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
            Re = np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K
            D[L["clavicle." + s]] = ry(cr * g) @ Re
        G = [None] * nb
        limb = set()
        for s in 'LR':
            for n in self.labels:
                if n.endswith('.' + s) and n.startswith(('upperleg', 'lowerleg', 'foot', 'toe', 'upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal')):
                    limb.add(L[n])
        piv = {}
        for i in self.order:
            p = self.parents[i]
            Gp = np.eye(4) if (p is None or p < 0) else G[p]
            if i in limb:
                continue
            # кость корпуса: поворот D вокруг своей головы, затем преобразование родителя
            Gi = np.eye(4); Gi[:3, :3] = D[i]; Gi[:3, 3] = heads[i] - D[i] @ heads[i]
            G[i] = Gp @ Gi
        # конечности: шарнир — наш сустав; направление сегмента — как у манекена
        def seg(i_bone, parent_G, joint_w, dir_rest, dir_w, keep_rest=False):
            pj = to_anny(joint_w, t)                                     # наш сустав в позе (Anny, м)
            Gi = np.linalg.inv(parent_G); pr = Gi[:3, :3] @ pj + Gi[:3, 3]  # тот же сустав в покое
            R = np.eye(3) if keep_rest else rot_between(dir_rest, dir_to_anny(dir_w))
            M = np.eye(4); M[:3, :3] = R; M[:3, 3] = pj - R @ pr
            return M, pr
        for s in 'LR':
            h = lambda n: heads[L[n + '.' + s]]
            Gpel = G[L['pelvis.' + s]]
            Gth, prh = seg(None, Gpel, J['hip' + s], h('lowerleg01') - h('upperleg01'), np.subtract(J['kn' + s], J['hip' + s]))
            Gsk, prk = seg(None, Gth, J['kn' + s], h('foot') - h('lowerleg01'), np.subtract(J['an' + s], J['kn' + s]))
            Gft, pra = seg(None, Gsk, J['an' + s], None, None, keep_rest=True)
            Gsh = G[L['shoulder01.' + s]]
            Gua, prs = seg(None, Gsh, J['sh' + s], h('lowerarm01') - h('upperarm01'), np.subtract(J['el' + s], J['sh' + s]))
            Gfa, pre = seg(None, Gua, J['el' + s], h('wrist') - h('lowerarm01'), np.subtract(J['wr' + s], J['el' + s]))
            piv[s] = dict(hip=prh, knee=prk, ankle=pra, sh=prs, el=pre)
            for n in self.labels:
                if not n.endswith('.' + s): continue
                i = L[n]
                if n.startswith('upperleg'): G[i] = Gth
                elif n.startswith('lowerleg'): G[i] = Gsk
                elif n.startswith(('foot', 'toe')): G[i] = Gft
                elif n.startswith('upperarm'): G[i] = Gua
                elif n.startswith(('lowerarm', 'wrist', 'finger', 'metacarpal')): G[i] = Gfa
        Tt = torch.tensor(np.stack(G)[None], dtype=torch.float32)
        verts = self.m.get_skinned_vertices(rest['rest_vertices'], Tt)[0].cpu().numpy().astype(np.float64)
        H = np.array([G[i][:3, :3] @ heads[i] + G[i][:3, 3] for i in range(nb)])
        V = to_ours(verts) + t; Hw = to_ours(H) + t
        # головы конечностей — наши суставы (для замеров по осям сегментов)
        for s in 'LR':
            Hw[L['upperleg01.' + s]] = J['hip' + s]; Hw[L['lowerleg01.' + s]] = J['kn' + s]; Hw[L['foot.' + s]] = J['an' + s]
            Hw[L['upperarm01.' + s]] = J['sh' + s]; Hw[L['lowerarm01.' + s]] = J['el' + s]; Hw[L['wrist.' + s]] = J['wr' + s]
        if self.groin is not None:
            V = self.groin_smooth(V)
        return V, Hw, piv, heads

    def t_init(self, rest, J):
        """начальный сдвиг: середина «тазобедренных» Anny — на 3,9 см выше середины наших (так в шаге 0)"""
        heads = rest['rest_bone_heads'][0].cpu().numpy().astype(np.float64); L = self.idx
        ah = to_ours((heads[L['upperleg01.L']] + heads[L['upperleg01.R']]) / 2)
        hm = (np.asarray(J['hipL']) + np.asarray(J['hipR'])) / 2
        return [float(hm[1] + 3.9 - ah[1]), float(hm[2] - ah[2])]

    def rest_lengths(self, rest):
        heads = rest['rest_bone_heads'][0].cpu().numpy().astype(np.float64) * 100; L = self.idx; h = lambda n: heads[L[n + '.L']]
        return {'th': np.linalg.norm(h('lowerleg01') - h('upperleg01')), 'sk': np.linalg.norm(h('foot') - h('lowerleg01')),
                'ua': np.linalg.norm(h('lowerarm01') - h('upperarm01')), 'fa': np.linalg.norm(h('wrist') - h('lowerarm01'))}

    # ---------------- пах ----------------
    def setup_groin(self, V):
        """паховая область: вершины спереди между бёдрами ниже лобка (по сетке в стойке, один раз) и веса сглаживания"""
        F = self.skin_faces
        y0 = V[:, 1]; hipy = 89.5
        sel = (np.abs(V[:, 0]) < 7.5) & (V[:, 1] > hipy - 16) & (V[:, 1] < hipy + 6) & (V[:, 2] > -2.0)
        # соседи по рёбрам сетки
        nbr = [[] for _ in range(len(V))]
        for a, b, c in F:
            nbr[a] += [b, c]; nbr[b] += [a, c]; nbr[c] += [a, b]
        self.nbr = [np.unique(np.array(n, dtype=np.int64)) for n in nbr]
        idx = np.where(sel)[0]
        # плавный край: вес 1 в середине, к краю области — 0
        cx = np.clip(1 - (np.abs(V[idx, 0]) - 4.5) / 3.0, 0, 1); cy = np.clip(np.minimum((V[idx, 1] - (hipy - 16)) / 4, ((hipy + 6) - V[idx, 1]) / 4), 0, 1)
        self.groin = (idx, cx * cy)

    def groin_smooth(self, V, iters=40):
        """лапласово сглаживание паховой области (только вперёд-назад и вниз — без сдвига по ширине): гладкая форма манекена"""
        idx, w = self.groin; V = V.copy()
        for it in range(iters):
            avg = np.array([V[self.nbr[i]].mean(0) for i in idx])
            V[idx] = V[idx] + .5 * w[:, None] * (avg - V[idx])
        return V
