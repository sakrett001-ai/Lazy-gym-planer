"""Anny в координатах манекена (проба кожи, шаг 0).

Координаты манекена (docs/mannequin-authoring.md): см, Y вверх, пол Y = 0, тело смотрит вдоль +Z, левая сторона — +X.
У Anny: метры, Z вверх, лицо к −Y, левая сторона — +X. Перевод: (x, y, z)_манекен = 100 · (x, z, −y)_Anny.

Стойка: Anny в покое стоит в A-позе (руки отведены на ≈ 41°, стопы шире таза). В нейтральную стойку манекена
её приводит её же риг (линейный скиннинг Anny): плечо и предплечье поворачиваются кратчайшим поворотом так, чтобы
отрезки «плечевой — локтевой — лучезапястный» шли как у манекена; бедро и голень — так же по «тазобедренный —
коленный — голеностопный»; стопа сохраняет ориентацию покоя (подошва на полу); корпус, ключицы, шея и голова — как в покое.
"""
import math
import numpy as np
import torch
import anny

torch.set_grad_enabled(False)

# возраст: 27 лет (медиана ANSUR II в выборке). Шкала MakeHuman: «young» = 25 лет, «old» = 90 лет, линейно между ними;
# в Anny якорь young = 2/3, old = 1. Калибровка роста Anny по ВОЗ (shape_distribution.py) дала бы 0,782 — это 35 % «old».
AGE_27 = 2 / 3 + (27 - 25) / (90 - 25) / 3
MALE = 0.0  # в Anny gender: 0 — male, 1 — female (PHENOTYPE_VARIATIONS['gender'] = ['male', 'female'])

ARM = ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal')
LEG = ('upperleg', 'lowerleg', 'foot', 'toe')


def to_ours(p):
    """Anny (м, Z вверх, лицо к −Y) → манекен (см, Y вверх, лицо к +Z)."""
    p = np.asarray(p, dtype=np.float64)
    return 100.0 * np.stack([p[..., 0], p[..., 2], -p[..., 1]], axis=-1)


def dir_to_anny(d):
    d = np.asarray(d, dtype=np.float64)
    return np.stack([d[..., 0], -d[..., 2], d[..., 1]], axis=-1)


def rot_between(a, b):
    """кратчайший поворот, переводящий направление a в b (матрица 3×3)"""
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    v = np.cross(a, b); c = float(np.dot(a, b)); s = np.linalg.norm(v)
    if s < 1e-9:
        return np.eye(3)
    k = v / s; K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    ang = math.atan2(s, c)
    return np.eye(3) + math.sin(ang) * K + (1 - math.cos(ang)) * K @ K


class AnnyBody:
    def __init__(self, local_changes='all'):
        self.m = anny.Anny(local_changes=local_changes).to(dtype=torch.float32)
        m = self.m
        self.labels = list(m.bone_labels)
        self.parents = list(m.bone_parents)
        self.faces = m.faces.cpu().numpy().astype(np.int64)
        self.local_labels = list(m.local_change_labels)
        self.idx = {n: i for i, n in enumerate(self.labels)}
        w = m.vertex_bone_weights.cpu().numpy(); bi = m.vertex_bone_indices.cpu().numpy()
        self.vw, self.vi = w, bi
        nb = len(self.labels)
        dense = np.zeros((w.shape[0], nb)); np.add.at(dense, (np.arange(w.shape[0])[:, None].repeat(w.shape[1], 1), bi), w)
        self.weights = dense
        armb = [i for i, n in enumerate(self.labels) if n.startswith(ARM)]
        legb = [i for i, n in enumerate(self.labels) if n.startswith(LEG)]
        self.arm_w = {s: dense[:, [i for i in armb if self.labels[i].endswith('.' + s)]].sum(1) for s in 'LR'}
        self.leg_w = {s: dense[:, [i for i in legb if self.labels[i].endswith('.' + s)]].sum(1) for s in 'LR'}
        self.dominant = dense.argmax(1)

    # ---------- форма ----------
    def coeffs(self, phen, local):
        m = self.m
        P = {'gender': MALE, 'age': AGE_27, 'muscle': .5, 'weight': .5, 'height': .5, 'proportions': .5}
        P.update(phen)
        pp = m._parse_parameter_kwargs(P, m.phenotype_labels, .5, 'phenotype_kwargs')
        lc = m._parse_parameter_kwargs(local or {}, m.local_change_labels, 0., 'local_changes_kwargs')
        fa = m._parse_parameter_kwargs(None, m.facial_action_labels, 0., 'facial_actions')
        return m._get_phenotype_blendshape_coefficients(pp, lc, fa)

    def rest(self, phen, local=None):
        out = self.m.get_rest_model(self.coeffs(phen, local))
        return out

    # ---------- стойка манекена ----------
    def stance(self, rest, joints):
        """rest — выход get_rest_model; joints — центры суставов манекена (см, координаты манекена).
        Возвращает вершины (см, координаты манекена) и центры суставов Anny в стойке."""
        m = self.m
        Rp = rest['rest_bone_poses'][0].cpu().numpy().astype(np.float64)   # J×4×4, мир покоя
        heads = rest['rest_bone_heads'][0].cpu().numpy().astype(np.float64)
        L = self.idx
        nb = len(self.labels)
        D = [np.eye(3) for _ in range(nb)]
        target = {}
        for s in 'LR':
            # направления сегментов манекена → в оси Anny
            ua = dir_to_anny(np.subtract(joints['el' + s], joints['sh' + s]))
            fa = dir_to_anny(np.subtract(joints['wr' + s], joints['el' + s]))
            h = lambda n: heads[L[n + '.' + s]]
            # ноги — по направлению сегментов манекена (вертикально) от «тазобедренного» сустава рига Anny. Он лежит на
            # ≈ 2,5 см латеральнее центра головки бедра (у мужчины 175 см ±11,3 см, у манекена и у людей ±8,8), но середина
            # бедра Anny — именно там: если свести колени к ширине манекена, бёдра заходят друг в друга. Поэтому ноги Anny
            # стоят шире скелета, и это видно при вписывании (сдвиг бедра и голени наружу).
            th = dir_to_anny(np.subtract(joints['kn' + s], joints['hip' + s]))
            sk = dir_to_anny(np.subtract(joints['an' + s], joints['kn' + s]))
            Dua = rot_between(h('lowerarm01') - h('upperarm01'), ua)
            Dfa = rot_between(h('wrist') - h('lowerarm01'), fa)
            Dth = rot_between(h('lowerleg01') - h('upperleg01'), th)
            Dsk = rot_between(h('foot') - h('lowerleg01'), sk)
            for i, n in enumerate(self.labels):
                if not n.endswith('.' + s):
                    continue
                if n.startswith('upperarm'):
                    D[i] = Dua
                elif n.startswith(('lowerarm', 'wrist', 'finger', 'metacarpal')):
                    D[i] = Dfa
                elif n.startswith('upperleg'):
                    D[i] = Dth
                elif n.startswith('lowerleg'):
                    D[i] = Dsk
                # стопа и пальцы — ориентация покоя (D = I)
        # прямая кинематика: голова кости следует за преобразованием родителя
        T = [None] * nb
        order = sorted(range(nb), key=lambda i: self._depth(i))
        for i in order:
            p = self.parents[i]
            head = heads[i]
            if p is None or p < 0:
                newhead = head
            else:
                Tp = T[p]
                newhead = Tp[:3, :3] @ head + Tp[:3, 3]
            Ti = np.eye(4); Ti[:3, :3] = D[i]; Ti[:3, 3] = newhead - D[i] @ head
            T[i] = Ti
        Tt = torch.tensor(np.stack(T)[None], dtype=torch.float32)
        verts = self.m.get_skinned_vertices(rest['rest_vertices'], Tt)[0].cpu().numpy().astype(np.float64)
        posed_heads = np.array([T[i][:3, :3] @ heads[i] + T[i][:3, 3] for i in range(nb)])
        V = to_ours(verts); Hh = to_ours(posed_heads)
        # пол: подошва на Y = 0; середина между «тазобедренными» головами рига — над началом координат по X и Z
        dy = -V[:, 1].min()
        hip = (Hh[L['upperleg01.L']] + Hh[L['upperleg01.R']]) / 2
        shift = np.array([-hip[0], dy, -hip[2]])
        return V + shift, Hh + shift

    def _depth(self, i):
        d = 0
        while self.parents[i] is not None and self.parents[i] >= 0:
            i = self.parents[i]; d += 1
        return d
