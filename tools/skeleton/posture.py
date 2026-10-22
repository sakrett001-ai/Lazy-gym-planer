"""Осанка скелета манекена в нейтральной стойке (кожа Anny, шаг 2): посадка таза, поясницы, грудного блока с рёбрами,
шейного отдела и черепа по нормам осанки — tools/skin-anny/result/posture-patch.json (подбор и источники норм —
tools/skin-anny/spine.py, norms.py, README.md).

Кости не меняются — меняется их посадка: каждая часть — твёрдое тело с преобразованием 4×4 из посадки 4.61.0 в новую
(мировые см нейтральной стойки, Y вверх, +Z вперёд, +X влево; здесь — в рамке таза: начало у центра тазобедренных суставов):
  pelvis      — таз и крестец (наклон вокруг оси тазобедренных суставов);
  L5 … L1     — поясничные позвонки (повороты вокруг центров дисков L5/S1 … L1/2);
  thorax      — грудной блок: T1–T12, рёбра, грудина (поворот на диске Th12/L1);
  C7 … C2     — шейные позвонки (C2 — блок C2 + атлас), D67 … D23 — диски между ними (половина поворота уровня);
  skull       — череп и нижняя челюсть (поворот вокруг середины ямок атласа).
Рёбра сверх того поворачиваются в рёберно-позвоночных суставах вниз на rib° (вокруг оси шейки ребра «головка — бугорок»,
у рёбер 1–10 — доля 0,4 … 1, у 11–12 — 1); грудина с хрящами идёт за передними концами рёбер 1–7 (Кабш).
Без файла посадки (SKEL_POSTURE=none) — посадка 4.61.0 (тождественные преобразования)."""
import json, os
import numpy as np

HIP_Y = 89.5
DEFAULT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../skin-anny/result/posture-patch.json')


def rot_axis(k, a):
    k = np.asarray(k, float) / np.linalg.norm(k); K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def kabsch(A, B):
    """жёсткое преобразование A → B (4×4)"""
    ca, cb = A.mean(0), B.mean(0); H = (A - ca).T @ (B - cb); U, S, Vt = np.linalg.svd(H)
    D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(Vt.T @ U.T)); R = Vt.T @ D @ U.T
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = cb - R @ ca; return M


def apply4(T, P):
    P = np.asarray(P, float); return P @ T[:3, :3].T + T[:3, 3]


def components(F, n):
    """компоненты связности сетки: метка на вершину"""
    par = np.arange(n)
    def find(x):
        while par[x] != x:
            par[x] = par[par[x]]; x = par[x]
        return x
    for a, b, c in np.asarray(F).reshape(-1, 3):
        for u, w in ((a, b), (b, c)):
            ru, rw = find(u), find(w)
            if ru != rw: par[ru] = rw
    lab = np.array([find(i) for i in range(n)]); _, lab = np.unique(lab, return_inverse=True); return lab


class Posture:
    def __init__(self, path=None):
        path = path or os.environ.get('SKEL_POSTURE') or DEFAULT
        self.on = path != 'none' and os.path.exists(path)
        self.T = {}; self.rib = 0.0; self.params = {}
        if not self.on:
            return
        d = json.load(open(path)); self.params = d['params']; self.rib = float(d['params'].get('rib', 0.0))
        Sh = np.eye(4); Sh[1, 3] = HIP_Y; Si = np.linalg.inv(Sh)
        self.T = {k: Si @ np.array(v, float) @ Sh for k, v in d['frames_neutral_world_cm'].items()}
        self.sternum_ref = Si @ np.array(d['sternum_after_ribs'], float) @ Sh if 'sternum_after_ribs' in d else None

    def get(self, key):
        return self.T.get(key, np.eye(4))

    def apply(self, key, P):
        return apply4(self.get(key), P)

    # ---------- рёбра и грудина ----------
    def setup_ribs(self, P, F, verts=()):
        """P, F — грудная клетка (рёбра + грудина с хрящами) в рамке таза до посадки; verts — вершины грудных позвонков
        (для переноса точек мышц, прикреплённых к позвонкам: у них поворота рёбер нет). Готовит повороты рёбер."""
        P = np.asarray(P, float); lab = components(F, len(P)); n = lab.max() + 1
        comps = [np.where(lab == k)[0] for k in range(n)]
        st = max(range(n), key=lambda k: len(comps[k]))
        self.rib_R = {}; old, new = [], []
        self.lab = lab; self.st = st
        for sg in (1, -1):
            side = sorted([k for k in range(n) if k != st and sg * P[comps[k], 0].mean() > 0], key=lambda k: -P[comps[k], 1].mean())
            for i, k in enumerate(side, 1):
                Q = P[comps[k]]; ax_ = np.abs(Q[:, 0]); head = Q[np.argmin(ax_)]
                band = Q[(ax_ > ax_.min() + 2.0) & (ax_ < ax_.min() + 4.0)]
                tub = band[np.argmin(band[:, 2])] if len(band) else Q[np.argmin(Q[:, 2])]
                w = 1.0 if i > 10 else .4 + .6 * (i - 1) / 9
                tip = Q[np.argmax(Q[:, 2])]
                R = rot_axis(tub - head, np.radians(self.rib * w))
                if (R @ (tip - head) + head)[1] > tip[1]:          # «вниз» — передний конец ребра опускается
                    R = rot_axis(tub - head, -np.radians(self.rib * w))
                M = np.eye(4); M[:3, :3] = R; M[:3, 3] = head - R @ head; self.rib_R[k] = M
                if i <= 7:
                    old.append(tip); new.append(apply4(M, tip[None])[0])
        self.Ts = kabsch(np.array(old), np.array(new)) if self.rib and old else np.eye(4)
        self.rib_R[st] = self.Ts
        from scipy.spatial import cKDTree
        V = [P] + [np.asarray(v, float) for v in verts]
        L = [lab] + [np.full(len(v), -1) for v in verts]
        self.tree = cKDTree(np.vstack(V)); self.tree_lab = np.concatenate(L)
        return lab

    def rib_parts(self, P):
        """вершины грудной клетки (те же, что в setup_ribs) после поворота рёбер и посадки грудного блока"""
        P = np.asarray(P, float); out = np.empty_like(P)
        for k, M in self.rib_R.items():
            m = self.lab == k; out[m] = apply4(M, P[m])
        return self.apply('thorax', out)

    def rib_points(self, P, near=3.0):
        """произвольные точки грудного блока (рамка таза до посадки): поворот ближайшего ребра или грудины (ближе near см),
        иначе — только посадка грудного блока"""
        P = np.asarray(P, float); d, j = self.tree.query(P); lab = self.tree_lab[j]; out = P.copy()
        for k, M in self.rib_R.items():
            m = (lab == k) & (d < near)
            if m.any(): out[m] = apply4(M, P[m])
        return self.apply('thorax', out)
