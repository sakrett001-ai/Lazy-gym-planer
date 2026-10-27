"""Замеры ANSUR II на сетке Anny — по тем же уровням и правилам, что tools/mannequin/anthro.js у манекена.

Сетка — в координатах манекена (см, Y вверх, пол 0). Обхват — периметр выпуклой оболочки сечения (как ложится лента),
ширина и глубина — габариты сечения. Уровни корпуса — медианы ANSUR II (как в anthro.js: chestheight, waistheightomphalion,
buttockheight). Корпус для обхватов груди и талии — треугольники без рук (вес костей руки у всех трёх вершин < 0,5),
как anthro.js режет только torsoSDF. Конечности — свои треугольники, сечение поперёк оси сегмента.
Костных точек у Anny нет: высоты акромиона, C7, гребня таза и т. п. считаются после вписывания скелета (register.py).
"""
import numpy as np
import trimesh

ANSUR = None


def hull_perimeter(P):
    """P — точки N×2; периметр выпуклой оболочки"""
    if len(P) < 3:
        return 0.0
    P = np.unique(np.round(P, 4), axis=0)
    if len(P) < 3:
        return 0.0
    P = P[np.lexsort((P[:, 1], P[:, 0]))]
    def cross(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in P:
        while len(lo) > 1 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in P[::-1]:
        while len(hi) > 1 and cross(hi[-2], hi[-1], p) <= 0: hi.pop()
        hi.append(p)
    H = np.array(lo[:-1] + hi[:-1])
    return float(np.sum(np.linalg.norm(H - np.roll(H, -1, axis=0), axis=1)))


def section(V, F, origin, normal):
    """точки сечения подсетки (V, F) плоскостью; возвращает K×3"""
    if len(F) == 0:
        return np.zeros((0, 3))
    d = (V - origin) @ normal
    s = np.sign(d[F])
    cut = ~((s[:, 0] == s[:, 1]) & (s[:, 1] == s[:, 2]))
    pts = []
    for a, b in ((0, 1), (1, 2), (2, 0)):
        ia, ib = F[cut, a], F[cut, b]
        da, db = d[ia], d[ib]
        m = (da * db) < 0
        t = da[m] / (da[m] - db[m])
        pts.append(V[ia[m]] + (V[ib[m]] - V[ia[m]]) * t[:, None])
    return np.concatenate(pts) if pts else np.zeros((0, 3))


def plane_basis(n):
    n = n / np.linalg.norm(n)
    a = np.array([1.0, 0, 0]) if abs(n[0]) < .9 else np.array([0, 0, 1.0])
    u = np.cross(n, a); u /= np.linalg.norm(u); w = np.cross(n, u)
    return u, w


def ring(V, F, origin, normal):
    P = section(V, F, origin, normal)
    if len(P) < 3:
        return 0.0, P
    u, w = plane_basis(normal)
    Q = np.stack([(P - origin) @ u, (P - origin) @ w], 1)
    return hull_perimeter(Q), P


class Measurer:
    def __init__(self, body, ref):
        """body — AnnyBody (веса костей, грани), ref — anthro-ansur2.json"""
        self.b = body; self.ref = ref['values']
        F = body.faces
        armw = np.maximum(body.arm_w['L'], body.arm_w['R'])
        legw = np.maximum(body.leg_w['L'], body.leg_w['R'])
        allv = lambda mask: F[mask[F].all(1)]
        self.F_all = F
        self.F_torso = allv((armw < .5) & (legw < .5))
        self.F_noarm = allv(armw < .5)
        self.F_armL = allv(body.arm_w['L'] >= .5)
        self.F_legL = allv(body.leg_w['L'] >= .5)
        lab = body.labels
        dom = body.dominant
        head_b = [i for i, n in enumerate(lab) if n in ('head', 'eye.L', 'eye.R')]
        neck_b = [i for i, n in enumerate(lab) if n.startswith('neck')]
        foot_b = [i for i, n in enumerate(lab) if (n.startswith('foot') or n.startswith('toe')) and n.endswith('.L')]
        self.F_head = allv(np.isin(dom, head_b))
        self.F_neck = allv(np.isin(dom, neck_b))
        self.F_footL = allv(np.isin(dom, foot_b))

    def r(self, k):
        return self.ref[k][1]

    def measure(self, V, H):
        """V — вершины (см, координаты манекена), H — головы костей рига Anny в стойке"""
        b = self.b; L = b.idx; m = {}
        up = np.array([0, 1.0, 0])
        m['stature'] = V[:, 1].max()
        # промежность: самая низкая точка кожи у средней линии выше колен, позади наружных половых органов (их сетка
        # Anny свисает ниже промежности; щуп антропометра упирается в промежность)
        # (они впереди фронтальной плоскости тазобедренных суставов, z > 0; стойка ставит эти суставы на z = 0)
        # |x| < 0,6: при ногах на наших суставах внутренние поверхности бёдер подходят к средней линии на 1,5 см — это не промежность
        mid = (np.abs(V[:, 0]) < .6) & (V[:, 1] > 55) & (V[:, 2] < -.5)
        m['crotchheight'] = V[mid, 1].min()

        def hslice(h, F):
            P = section(V, F, np.array([0, h, 0]), up)
            return P
        def stats(P):
            if len(P) < 3: return 0, 0, 0
            return hull_perimeter(P[:, [0, 2]]), np.ptp(P[:, 0]), np.ptp(P[:, 2])
        c, w, d = stats(hslice(self.r('chestheight'), self.F_torso))
        m['chestcircumference'], m['chestbreadth'], m['chestdepth'] = c, w, d
        c, w, d = stats(hslice(self.r('waistheightomphalion'), self.F_torso))
        m['waistcircumference'], m['waistbreadth'], m['waistdepth'] = c, w, d
        c, w, d = stats(hslice(self.r('buttockheight'), self.F_noarm))
        m['buttockcircumference'], m['buttockdepth'] = c, d
        best = 0
        for h in np.linspace(m['crotchheight'], self.r('iliocristaleheight'), 31):
            P = hslice(h, self.F_noarm)
            if len(P): best = max(best, np.ptp(P[:, 0]))
        m['hipbreadth'] = best
        # плечи: наибольшая ширина по дельтам в 12 см ниже акромиона (уровень акромиона — медиана ANSUR)
        ac = self.r('acromialheight'); bb = (0, None)
        for h in np.linspace(ac - 12, ac, 25):
            P = hslice(h, self.F_all)
            P = P[P[:, 1] > 0] if len(P) else P
            if len(P) and np.ptp(P[:, 0]) > bb[0]: bb = (np.ptp(P[:, 0]), P)
        m['bideltoidbreadth'] = bb[0]
        m['shouldercircumference'] = hull_perimeter(bb[1][:, [0, 2]]) if bb[1] is not None else 0
        # шея: ось — от головы кости neck01 к голове кости head; самое узкое кольцо свободной части и основание
        n0, n1 = H[L['neck01']], H[L['head']]
        ax = (n1 - n0) / np.linalg.norm(n1 - n0)
        def neckring(t, rad=9.0):
            o = n0 + (n1 - n0) * t
            P = section(V, self.F_all, o, ax)
            P = P[np.linalg.norm((P - o) - np.outer((P - o) @ ax, ax), axis=1) < rad] if len(P) else P
            if len(P) < 3: return 0
            u, w = plane_basis(ax)
            return hull_perimeter(np.stack([(P - o) @ u, (P - o) @ w], 1))
        rings = [neckring(t) for t in np.linspace(.2, .8, 13)]
        m['neckcircumference'] = min(r for r in rings if r > 0)
        m['neckcircumferencebase'] = neckring(0.0)
        # рука (левая): плечо — от головы upperarm01 к голове lowerarm01, предплечье — к голове wrist
        sh, el, wr = H[L['upperarm01.L']], H[L['lowerarm01.L']], H[L['wrist.L']]
        def limbmax(a, b, ts, F, f=max):
            ax = (b - a) / np.linalg.norm(b - a)
            vals = [ring(V, F, a + (b - a) * t, ax)[0] for t in ts]
            vals = [v for v in vals if v > 0]
            return f(vals) if vals else 0
        m['bicepscircumferenceflexed'] = limbmax(sh, el, np.linspace(.3, .75, 18), self.F_armL)
        m['forearmcircumferenceflexed'] = limbmax(el, wr, np.linspace(.05, .5, 18), self.F_armL)
        m['wristcircumference'] = limbmax(el, wr, [.95], self.F_armL)
        m['_ua'] = np.linalg.norm(el - sh); m['_fa'] = np.linalg.norm(wr - el)
        m['_knee'] = H[L['lowerleg01.L']][1]; m['_ankle'] = H[L['foot.L']][1]
        # нога (левая): горизонтальные кольца (нога в стойке вертикальна)
        def legring(h):
            P = hslice(h, self.F_legL)
            return hull_perimeter(P[:, [0, 2]]) if len(P) >= 3 else 0
        m['thighcircumference'] = legring(m['crotchheight'] - 1)
        m['lowerthighcircumference'] = legring(self.patella_top)
        m['calfcircumference'] = max(legring(h) for h in np.linspace(25, 45, 21))
        m['anklecircumference'] = min(v for v in (legring(h) for h in np.linspace(10, 19.5, 12)) if v > 0)
        # голова: сечение наибольшей длины (выше переносицы), ширина — наибольшая
        top = V[:, 1].max(); best = (0, 0, None)
        for h in np.linspace(top - 14, top - 5, 19):
            P = hslice(h, self.F_head)
            if len(P) >= 3 and np.ptp(P[:, 2]) > best[0]: best = (np.ptp(P[:, 2]), h, P)
        m['headlength'] = best[0]
        m['headcircumference'] = hull_perimeter(best[2][:, [0, 2]]) if best[2] is not None else 0
        hb = 0
        for h in np.linspace(top - 12, top - 3, 19):
            P = hslice(h, self.F_head)
            if len(P) >= 3: hb = max(hb, np.ptp(P[:, 0]))
        m['headbreadth'] = hb
        # стопа
        fv = V[np.unique(self.F_footL)]
        m['footlength'] = np.ptp(fv[:, 2]); m['footbreadthhorizontal'] = np.ptp(fv[:, 0])
        # масса по объёму: замкнутость сетки не гарантирована — объём по формуле дивергенции, плотность 1,04 кг/л
        T = V[b.faces]
        vol = np.abs(np.einsum('ij,ij->i', np.cross(T[:, 0], T[:, 1]), T[:, 2]).sum() / 6) / 1000.0
        m['_volumeL'] = vol; m['weightkg'] = vol * 1.04
        return m
