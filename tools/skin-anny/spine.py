"""Осанка скелета манекена: сагиттальная цепочка «таз — поясница — грудной блок — шея — череп» (кожа Anny, шаг 1).

Кости не меняются — меняется только их посадка в нейтральной стойке (см, координаты манекена: Y вверх, +Z вперёд,
+X влево). Цепочка повторяет устройство позвоночника: каждый позвонок — твёрдое тело, между соседями — поворот вокруг
центра диска (центр между пластинками соседей, ось — поперёк тела, X). Параметры (градусы, плюс — верх вперёд, сгибание):
  pt      — наклон таза вокруг оси тазобедренных суставов (плюс — передний наклон: крестец круче, PT меньше);
  d[0..5] — поправки клиньев дисков L5/S1, L4/5, L3/4, L2/3, L1/2, Th12/L1 (лордоз поясницы);
  rib     — поворот рёбер в рёберно-позвоночных суставах вниз (выдох), у рёбер 1–10 — нарастает от 0,4 до 1 доли;
  e[0..5] — поправки клиньев C7/T1, C6/7, C5/6, C4/5, C3/4, C2/3 (шейный лордоз).
Грудной блок (рёбра, грудина, T1–T12) — твёрдый: грудной кифоз MyoSim не меняется (его угол — в таблице).
Блок C2 + атлас — конгруэнтен черепу (сустав атлант — затылок как в модели HAT, череп — на месте): цепочка должна прийти
в эту посадку — невязка по положению ямок атласа и по углу (сумма всех поворотов цепочки фиксирована).
Пояс и руки сдвигаются вслед за грудино-ключичным суставом (рамка пояса — к новому месту рукоятки грудины); ноги, череп и
нижняя челюсть — на месте. Гортань и трахея — за ближайшим позвонком.

Углы — по замыкательным пластинкам (плоскость по точкам поверхности тела позвонка, нормаль которых смотрит вдоль оси):
  SS — наклон верхней пластинки S1 к горизонтали; PT — угол между вертикалью и линией «центр оси тазобедренных суставов —
  середина пластинки S1»; PI = SS + PT; LL — Cobb L1 (верхняя) — S1 (верхняя); TK — Cobb T4 (верхняя) — T12 (нижняя);
  T1 slope — наклон верхней пластинки T1; CL — Cobb C2 (нижняя) — C7 (нижняя); SVA — центр тела C7 впереди
  задне-верхнего угла S1; cSVA — центр тела C2 впереди задне-верхнего угла C7.
"""
import json
import numpy as np
import trimesh

LUMBAR = ['L5', 'L4', 'L3', 'L2', 'L1']
THOR = ['thoracic%d' % i for i in range(12, 0, -1)]   # T12 … T1
CERV = ['C7', 'C6', 'C5', 'C4', 'C3', 'C2']             # C2 — блок C2 + атлас
DISC_L = ['L5/S1', 'L4/5', 'L3/4', 'L2/3', 'L1/2', 'Th12/L1']
DISC_C = ['C7/T1', 'C6/7', 'C5/6', 'C4/5', 'C3/4', 'C2/3']
# блок C2 + атлас в 4.61.0 повёрнут к черепу на −27,77° (build_bones.py: CH[2].th − RAW[2].th): конгруэнтная посадка — +27,77°
C2_DELTA = 27.774
HIP_Y = 89.5


def rotx(a):
    a = np.radians(a); c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def R_about(c, a):
    """4×4: поворот вокруг оси X через точку c на a° (плюс — верх вперёд)"""
    M = np.eye(4); R = rotx(a); M[:3, :3] = R; M[:3, 3] = np.asarray(c) - R @ np.asarray(c); return M


def T_apply(T, P):
    P = np.asarray(P, float); return P @ T[:3, :3].T + T[:3, 3]


def A2(v):
    return np.array(v, float)


def tilt(n):
    """наклон нормали пластинки вперёд (°): плюс — пластинка опускается кпереди"""
    return float(np.degrees(np.arctan2(n[2], n[1])))


def rot_axis(k, a):
    k = k / np.linalg.norm(k); K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def kabsch(A, B):
    """жёсткое преобразование A → B (4×4)"""
    ca, cb = A.mean(0), B.mean(0); H = (A - ca).T @ (B - cb); U, S, Vt = np.linalg.svd(H)
    D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(Vt.T @ U.T)); R = Vt.T @ D @ U.T
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = cb - R @ ca; return M


class Posture:
    def __init__(self, data, endplates=None):
        """data — выгрузка mannequin.js export (4.61.0); endplates — endplates.json (полные сетки MyoSim; без него — по
        упрощённым сеткам приложения, углы до ±10°)"""
        self.d = data; self.ep = endplates
        self.bones = {}
        for b in data['bones']:
            P = np.array(b['pos'], float).reshape(-1, 3); F = np.array(b['idx'], int).reshape(-1, 3)
            self.bones[b['name'] + b['side']] = dict(name=b['name'], side=b['side'], seg=b['seg'], P=P, F=F)
        self.J = {k: np.array(v, float) for k, v in data['joints'].items()}
        self.hip = (self.J['hipL'] + self.J['hipR']) / 2
        self._split_cervical(); self._split_ribs(); self._endplates()

    # ---------------- разметка ----------------
    def _components(self, P, F):
        m = trimesh.Trimesh(P, F, process=False); lab = np.full(len(P), -1)
        for k, g in enumerate(trimesh.graph.connected_components(m.edges, nodes=np.arange(len(P)), min_len=1)):
            lab[list(g)] = k
        return lab

    def _split_cervical(self):
        b = self.bones['cervical']; lab = self._components(b['P'], b['F'])
        comps = [np.where(lab == k)[0] for k in range(lab.max() + 1)]
        big = sorted([c for c in comps if len(c) > 40], key=lambda c: -b['P'][c, 1].mean())     # C1, C2, C3 … C7
        disc = sorted([c for c in comps if 11 <= len(c) <= 40 and abs(b['P'][c, 0].mean()) < 1], key=lambda c: -b['P'][c, 1].mean())
        frag = [c for c in comps if not any(c is x for x in big + disc)]
        assert len(big) == 7 and len(disc) == 5, (len(big), len(disc))
        names = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']
        owner = np.empty(len(b['P']), object)
        for n, c in zip(names, big): owner[c] = n
        for n, c in zip(['D23', 'D34', 'D45', 'D56', 'D67'], disc): owner[c] = n
        for c in frag: owner[c] = 'C1'   # обломки боковых масс атласа
        owner[owner == 'C1'] = 'C2'      # атлас едет с C2 (блок C2 + атлас)
        self.cerv_owner = owner

    def _split_ribs(self):
        b = self.bones['ribcage']; P = b['P']; lab = self._components(P, b['F'])
        comps = [np.where(lab == k)[0] for k in range(lab.max() + 1)]
        st = max(comps, key=len)                                   # грудина с хрящами
        ribs = [c for c in comps if c is not st]
        out = {}
        for s, sg in (('L', 1), ('R', -1)):
            side = sorted([c for c in ribs if sg * P[c, 0].mean() > 0], key=lambda c: -P[c, 1].mean())
            # верхние рёбра — по высоте; 11-е и 12-е короткие, у 12-го центр ниже (по номеру — по длине у короткой пары)
            for i, c in enumerate(side):
                out[(s, i + 1)] = c
        self.rib_idx = out; self.sternal = st
        assert len(out) == 24, len(out)
        # ось шейки ребра: головка (ближе всего к средней линии) → бугорок (точка ребра в 3 см латеральнее головки, самая задняя)
        self.rib_axis = {}
        for (s, i), c in out.items():
            Q = P[c]; ax_ = np.abs(Q[:, 0]); head = Q[np.argmin(ax_)]
            band = Q[(ax_ > ax_.min() + 2.0) & (ax_ < ax_.min() + 4.0)]
            tub = band[np.argmin(band[:, 2])] if len(band) else Q[np.argmin(Q[:, 2])]
            self.rib_axis[(s, i)] = (head, tub)
        # концы рёбер 1–7 спереди (к грудине) — для переноса грудины вслед за рёбрами
        self.rib_tip = {k: P[c][np.argmax(P[c][:, 2])] for k, c in out.items()}

    def _body_endplates(self, P, F, a0, depth, half_w, front_pt=None, n=6000, seed=0):
        """пластинки тела позвонка: (центр верхней, нормаль верхней, центр нижней, нормаль нижней) — нормали вверх"""
        m = trimesh.Trimesh(P, F, process=False)
        S, fi = trimesh.sample.sample_surface(m, n, seed=seed); N = m.face_normals[fi]
        a = a0 / np.linalg.norm(a0); f = np.array([0, -a[2], a[1]])           # вперёд, перпендикулярно оси
        band = S[np.abs(S[:, 0]) < half_w]
        zf = (band @ f).max() if front_pt is None else front_pt @ f
        body = (np.abs(S[:, 0]) < half_w) & (S @ f > zf - depth)
        res = []
        for it in range(3):
            c = S[body].mean(0); h = (S - c) @ a
            sup = body & (N @ a > .7) & (h > 0); inf = body & (N @ a < -.7) & (h < 0)
            if sup.sum() < 8 or inf.sum() < 8:
                break
            def plane(mask):
                Q = S[mask]; q0 = Q.mean(0); _, _, Vt = np.linalg.svd(Q - q0); nn = Vt[2]
                return q0, nn * (1 if nn @ a > 0 else -1)
            cs, ns = plane(sup); ci, ni = plane(inf)
            res = [cs, ns, ci, ni]
            a = (ns + ni) / np.linalg.norm(ns + ni); f = np.array([0, -a[2], a[1]])
            body = (np.abs(S[:, 0]) < half_w) & (S @ f > zf - depth)
        return res

    def _endplates(self):
        if self.ep is not None:
            return self._endplates_full()
        E = {}
        # грубые оси — по центрам соседних позвонков
        names = ['sacrum'] + LUMBAR + THOR
        cen = {n: self.bones[n]['P'].mean(0) for n in names}
        cb = self.bones['cervical']
        for n in ['C3', 'C4', 'C5', 'C6', 'C7', 'C2']:
            cen[n] = cb['P'][self.cerv_owner == n].mean(0)
        chain = names + ['C7', 'C6', 'C5', 'C4', 'C3', 'C2']
        depth = {**{n: 3.4 for n in LUMBAR}, **{'thoracic%d' % i: (2.9 if i >= 10 else 2.5 if i >= 5 else 2.0) for i in range(1, 13)}}
        hw = {**{n: 2.6 for n in LUMBAR}, **{'thoracic%d' % i: (2.0 if i >= 9 else 1.6) for i in range(1, 13)}}
        for k, n in enumerate(chain[1:-1], 1):
            a0 = cen[chain[k + 1]] - cen[chain[k - 1]]; a0[0] = 0
            if n in self.bones:
                P, F = self.bones[n]['P'], self.bones[n]['F']
            else:
                msk = self.cerv_owner == n; idx = np.where(msk)[0]; remap = -np.ones(len(msk), int); remap[idx] = np.arange(len(idx))
                Fc = cb['F'][msk[cb['F']].all(1)]; P, F = cb['P'][idx], remap[Fc]
            E[n] = self._body_endplates(P, F, a0, depth.get(n, 1.5), hw.get(n, 1.2))
        # C2: нижняя пластинка — по верхней поверхности диска C2/3; ось C2 — нормаль диска
        dm = cb['P'][self.cerv_owner == 'D23']; q0 = dm.mean(0); _, _, Vt = np.linalg.svd(dm - q0); nn = Vt[2] * np.sign(Vt[2][1])
        th = (dm - q0) @ nn
        E['C2'] = [None, None, q0 + nn * th.max(), nn]
        # S1: верхняя пластинка — верхняя поверхность тела S1 (смотрит вверх-вперёд), |x| < 2
        P, F = self.bones['sacrum']['P'], self.bones['sacrum']['F']
        m = trimesh.Trimesh(P, F, process=False); S, fi = trimesh.sample.sample_surface(m, 8000, seed=1); N = m.face_normals[fi]
        top = S[:, 1].max()
        sel = (np.abs(S[:, 0]) < 2.0) & (S[:, 1] > top - 3.0) & (N[:, 1] > .5) & (N[:, 2] > 0)
        Q = S[sel]
        # тело S1 — передняя часть: самые передние точки верхнего пояса (задний край — у канала)
        Q = Q[Q[:, 2] > np.percentile(Q[:, 2], 25)]
        q0 = Q.mean(0); _, _, Vt = np.linalg.svd(Q - q0); nn = Vt[2] * np.sign(Vt[2][1])
        f = np.array([0, -nn[2], nn[1]]); proj = (Q - q0) @ f
        E['S1'] = [q0, nn, None, None]
        self.S1_ps = q0 + f * proj.min()           # задне-верхний угол S1
        self.E = E
        # центры дисков (оригинал)
        self.disc_c = {}
        seq = [('S1', 0)] + [(n, 2) for n in LUMBAR] + [('thoracic12', 2)]
        lower = ['S1'] + LUMBAR
        upper = LUMBAR + ['thoracic12']
        for dn, lo, up in zip(DISC_L, lower, upper):
            self.disc_c[dn] = (E[lo][0] + E[up][2]) / 2
        cl = ['thoracic1', 'C7', 'C6', 'C5', 'C4', 'C3']; cu = ['C7', 'C6', 'C5', 'C4', 'C3', 'C2']
        for dn, lo, up in zip(DISC_C, cl, cu):
            self.disc_c[dn] = (E[lo][0] + E[up][2]) / 2
        # ямки атласа (середина) — точка схождения цепочки с черепом: верх блока C2 + атлас у средней линии
        c12 = cb['P'][self.cerv_owner == 'C2']
        lm = c12[(np.abs(c12[:, 0]) > 1.1) & (np.abs(c12[:, 0]) < 2.6)]
        fac = lm[lm[:, 1] > np.percentile(lm[:, 1], 75)]
        self.PC = np.array([0, fac[:, 1].mean(), lm[:, 2].mean()])
        # центр тела C7 и задне-верхний угол C7; центр тела C2 (середина между нижней пластинкой и ямками)
        self.C7c = (E['C7'][0] + E['C7'][2]) / 2
        f7 = np.array([0, -E['C7'][1][2], E['C7'][1][1]])
        b7 = cb['P'][self.cerv_owner == 'C7']; top7 = b7[(np.abs(b7[:, 0]) < 1.2) & ((b7 - E['C7'][0]) @ E['C7'][1] > -0.4)]
        self.C7_ps = E['C7'][0] + f7 * min(0.0, float(((top7 - E['C7'][0]) @ f7).min())) if len(top7) else E['C7'][0]

    def _endplates_full(self):
        ep = self.ep; A = lambda k: np.array(ep[k], float)
        E = {}
        for n in LUMBAR + THOR + ['C7', 'C6', 'C5', 'C4', 'C3']:
            e = ep[n]; E[n] = [A2(e['sup']), A2(e['nsup']), A2(e['inf']), A2(e['ninf'])]
        E['C2'] = [None, None, A2(ep['C2']['inf']), A2(ep['C2']['ninf'])]
        E['S1'] = [A2(ep['S1']['sup']), A2(ep['S1']['nsup']), None, None]
        self.S1_ps = A2(ep['S1']['ps']); self.S1_pa = A2(ep['S1']['pa'])
        self.E = E
        self.disc_c = {}
        for dn, lo, up in zip(DISC_L, ['S1'] + LUMBAR, LUMBAR + ['thoracic12']):
            self.disc_c[dn] = (E[lo][0] + E[up][2]) / 2
        for dn, lo, up in zip(DISC_C, ['thoracic1', 'C7', 'C6', 'C5', 'C4', 'C3'], ['C7', 'C6', 'C5', 'C4', 'C3', 'C2']):
            self.disc_c[dn] = (E[lo][0] + E[up][2]) / 2
        self.PC = A2(ep['_PC']); self.c2_delta = -float(ep['_c2_delta'])
        self.C7c = (E['C7'][0] + E['C7'][2]) / 2
        f7 = np.array([0, -E['C7'][1][2], E['C7'][1][1]])
        cb = self.bones['cervical']; b7 = cb['P'][self.cerv_owner == 'C7']
        top7 = b7[(np.abs(b7[:, 0]) < 1.2) & (np.abs((b7 - E['C7'][0]) @ E['C7'][1]) < .5)]
        self.C7_ps = E['C7'][0] + f7 * float(((top7 - E['C7'][0]) @ f7).min()) if len(top7) else E['C7'][0]

    # ---------------- посадка ----------------
    def transforms(self, x):
        """x — словарь параметров; возвращает словарь «кость или часть → 4×4» (мир, нейтральная стойка)"""
        pt = x.get('pt', 0.0); d = list(x.get('d', [0] * 6)); e = list(x.get('e', [0] * 6))
        T = {}
        Tp = R_about(self.hip, pt); T['pelvis'] = Tp
        cur = Tp
        for dn, n, a in zip(DISC_L, LUMBAR + ['thorax'], d):
            cur = cur @ R_about(self.disc_c[dn], a); T[n] = cur
        Tth = T['thorax']
        cur = Tth; prev = Tth
        for dn, n, a in zip(DISC_C, CERV, e):
            half = cur @ R_about(self.disc_c[dn], a / 2)
            cur = cur @ R_about(self.disc_c[dn], a); T[n] = cur
            T['D' + dn.replace('C', '').replace('/', '')] = half
        # диски шеи — между соседями: D67 — между C7 и C6 (половина поворота C6/7) и т. д.
        # череп и нижняя челюсть — поворот вокруг середины ямок атласа (sk, плюс — лицо вниз); блок C2 + атлас должен прийти
        # к черепу в ту же конгруэнтную посадку (невязка close_* в measures)
        T['skull'] = R_about(self.PC, x.get('sk', 0.0))
        return T

    def rib_points(self, x, T=None):
        """вершины грудной клетки после поворота рёбер (в осях грудного блока до его посадки) и перенос грудины"""
        b = self.bones['ribcage']; P = b['P'].copy(); r = x.get('rib', 0.0)
        if abs(r) < 1e-9:
            return P, np.eye(4)
        old_tips, new_tips = [], []
        for (s, i), c in self.rib_idx.items():
            if i > 10:
                w = 1.0       # плавающие рёбра — как 10-е
            else:
                w = .4 + .6 * (i - 1) / 9
            head, tub = self.rib_axis[(s, i)]
            k = tub - head
            # «вниз» — передний конец ребра опускается: знак оси выбираем по движению конца
            Rm = rot_axis(k, np.radians(r * w))
            tip = self.rib_tip[(s, i)]
            if (Rm @ (tip - head) + head)[1] > tip[1]:
                Rm = rot_axis(k, -np.radians(r * w))
            P[c] = (P[c] - head) @ Rm.T + head
            if i <= 7:
                old_tips.append(tip); new_tips.append(Rm @ (tip - head) + head)
        Ts = kabsch(np.array(old_tips), np.array(new_tips))
        P[self.sternal] = T_apply(Ts, P[self.sternal])
        return P, Ts

    def pose(self, x):
        """кости в новой посадке: {ключ кости: вершины}; и сводка: углы, высоты"""
        T = self.transforms(x); out = {}
        ribP, Ts = self.rib_points(x)
        sc = self.sc_joint()
        dsc = T_apply(T['thorax'], T_apply(Ts, sc[None]))[0] - sc
        for key, b in self.bones.items():
            n, seg = b['name'], b['seg']
            if n in ('pelvis_L', 'pelvis_R', 'sacrum'):
                out[key] = T_apply(T['pelvis'], b['P'])
            elif n in LUMBAR:
                out[key] = T_apply(T[n], b['P'])
            elif n == 'ribcage':
                out[key] = T_apply(T['thorax'], ribP)
            elif n.startswith('thoracic'):
                out[key] = T_apply(T['thorax'], b['P'])
            elif n == 'cervical':
                P = b['P'].copy()
                for part in set(self.cerv_owner):
                    m = self.cerv_owner == part; P[m] = T_apply(T[part], b['P'][m])
                out[key] = P
            elif n in ('skull', 'jaw') or n == 'hyoid':
                out[key] = T_apply(T['skull'], b['P'])        # подъязычная подвешена к нижней челюсти (wh 0,92)
            elif seg == 'airway':
                out[key] = T_apply(T[self.airway_owner(b['P'])], b['P'])
            elif seg in ('girdle', 'ua', 'fa', 'hand', 'finger', 'thumb'):
                out[key] = b['P'] + dsc
            else:
                out[key] = b['P']
        return out, T, dsc

    def sc_joint(self):
        cl = self.bones['clavicleL']['P']; return cl[np.argmin(np.abs(cl[:, 0]))]

    def airway_owner(self, P):
        y = P[:, 1].mean()
        best, by = 'thorax', None
        for n in CERV:
            c = self.bones['cervical']['P'][self.cerv_owner == n].mean(0)
            if by is None or abs(c[1] - y) < by:
                best, by = n, abs(c[1] - y)
        lowc = self.disc_c['C7/T1'][1]
        return 'thorax' if y < lowc - 1.0 else best

    # ---------------- замеры ----------------
    def measures(self, x, posed=None):
        T = self.transforms(x)
        P = posed[0] if posed is not None else self.pose(x)[0]
        E = self.E; Tn = lambda k, p: T_apply(T[k], p[None])[0]; Rn = lambda k, n: T[k][:3, :3] @ n
        key = {'S1': 'pelvis', **{n: n for n in LUMBAR}, **{n: 'thorax' for n in THOR}, **{n: n for n in CERV}}
        def ep(n, which):   # 0 — верхняя, 2 — нижняя
            return Tn(key[n], E[n][which]), Rn(key[n], E[n][which + 1])
        m = {}
        s1c, s1n = ep('S1', 0)
        if hasattr(self, 'S1_pa'):
            s1c = (Tn('pelvis', self.S1_ps) + Tn('pelvis', self.S1_pa)) / 2
        m['SS'] = tilt(s1n)
        m['PT'] = float(np.degrees(np.arctan2(self.hip[2] - s1c[2], s1c[1] - self.hip[1])))
        m['PI'] = m['SS'] + m['PT']
        m['LL'] = m['SS'] - tilt(ep('L1', 0)[1])
        m['TK'] = tilt(ep('thoracic4', 0)[1]) - tilt(ep('thoracic12', 2)[1])
        m['TK_T1T12'] = tilt(ep('thoracic1', 0)[1]) - tilt(ep('thoracic12', 2)[1])
        m['T1slope'] = tilt(ep('thoracic1', 0)[1])
        m['CL'] = tilt(ep('C7', 2)[1]) - tilt(ep('C2', 2)[1])
        c7c = Tn('C7', self.C7c); s1ps = Tn('pelvis', self.S1_ps)
        m['SVA'] = c7c[2] - s1ps[2]
        c2c = (Tn('C2', E['C2'][2]) + Tn('C2', self.PC)) / 2; c7ps = Tn('C7', self.C7_ps)
        m['cSVA'] = c2c[2] - c7ps[2]
        # замыкание на череп: ямки атласа и угол блока C2 + атлас
        pc = Tn('C2', self.PC)
        m['close_y'] = pc[1] - self.PC[1]; m['close_z'] = pc[2] - self.PC[2]
        m['close_a'] = x.get('pt', 0) + sum(x.get('d', [0] * 6)) + sum(x.get('e', [0] * 6)) - getattr(self, 'c2_delta', C2_DELTA) - x.get('sk', 0.0)
        # высоты: яремная вырезка, C7 (остистый), 10-е ребро, гребень таза
        rib = P['ribcage']; st = rib[self.sternal]
        mid = st[np.abs(st[:, 0]) < 1.5]
        m['jugular'] = mid[:, 1].max()
        m['jugular_z'] = mid[np.argmax(mid[:, 1]), 2]
        c7 = P['cervical'][self.cerv_owner == 'C7']; m['cervicale'] = c7[np.argmin(c7[:, 2]), 1]
        m['cervicale_z'] = c7[:, 2].min()
        r10 = np.concatenate([rib[self.rib_idx[('R', 10)]], st[st[:, 0] < -3]])
        m['tenthrib'] = r10[:, 1].min()
        m['iliocristale'] = max(P['pelvis_LL'][:, 1].max(), P['pelvis_RR'][:, 1].max())
        m['xiphoid'] = mid[:, 1].min()
        # уровни позвонков: какой позвонок на высоте точки (по центрам тел)
        bodies = {}
        for n in LUMBAR + THOR:
            c = (Tn(key[n], E[n][0]) + Tn(key[n], E[n][2])) / 2; bodies[n] = c
        def level(y):
            order = sorted(bodies.items(), key=lambda kv: kv[1][1])
            for (n0, c0), (n1, c1) in zip(order, order[1:]):
                if c0[1] <= y <= c1[1]:
                    u = (y - c0[1]) / (c1[1] - c0[1]); return f'{short(n0)}–{short(n1)} ({u:.1f})'
            return '—'
        m['lvl_jugular'] = level(m['jugular']); m['lvl_tenthrib'] = level(m['tenthrib']); m['lvl_xiphoid'] = level(m['xiphoid'])
        m['lvl_crest'] = level(m['iliocristale'])
        # глубина грудной клетки (кость): передняя поверхность грудины — вершина остистого по средней линии на высотах
        sp = {n: P[n][np.argmin(P[n][:, 2])] for n in THOR}
        m['ap'] = {}
        for lvl in ('thoracic4', 'thoracic6', 'thoracic8'):
            y = sp[lvl][1]
            s = st[(np.abs(st[:, 0]) < 1.5)]
            if len(s):
                near = s[np.argmin(np.abs(s[:, 1] - y))]
                m['ap'][short(lvl)] = float(near[2] - sp[lvl][2])
        # индекс Халлера на уровне нижней трети грудины: поперечник внутри рёбер / от задней поверхности грудины до тела позвонка
        yh = m['xiphoid'] + 3.0
        ring = rib[np.abs(rib[:, 1] - yh) < 1.0]
        if len(ring):
            inner_w = 2 * np.percentile(np.abs(ring[:, 0]), 95) - 2 * 1.2
            sb = st[(np.abs(st[:, 0]) < 1.5) & (np.abs(st[:, 1] - yh) < 1.5)]
            vb = min(bodies.items(), key=lambda kv: abs(kv[1][1] - yh))[0]
            vfront = Tn(key[vb], E[vb][0])[2] + 1.6        # передняя поверхность тела ≈ центр + половина глубины тела
            if len(sb):
                ap_in = sb[:, 2].min() - vfront
                m['haller'] = float(inner_w / max(ap_in, 1e-3)); m['ap_inner'] = float(ap_in); m['w_inner'] = float(inner_w)
        m['neckPivot'] = Tn('thorax', self.disc_c['C7/T1']).tolist()          # центр диска C7/T1 (ось нижнего шарнира шеи)
        m['lumbarPivot'] = Tn('pelvis', self.disc_c['L5/S1']).tolist()        # L5/S1 (B.lumbarPivot)
        m['thoracicPivot'] = Tn('L3', self.disc_c['L2/3']).tolist()           # L2/L3 (B.thoracicPivot)
        return m


def short(n):
    return n.replace('thoracic', 'T')


# ---------------------------------------------------------------- подгонка осанки по нормам
PARAMS = ['pt'] + ['d%d' % i for i in range(6)] + ['rib'] + ['e%d' % i for i in range(6)] + ['sk']


def unpack(v):
    v = list(v); return {'pt': v[0], 'd': v[1:7], 'rib': v[7], 'e': v[8:14], 'sk': v[14]}


def pack(x):
    return [x.get('pt', 0)] + list(x.get('d', [0] * 6)) + [x.get('rib', 0)] + list(x.get('e', [0] * 6)) + [x.get('sk', 0)]


def posture_targets(p, ref):
    """цели осанки (среднее, допуск) по norms.POSTURE; LL и PT — по PI таза MyoSim (LH16); высоты — ANSUR II"""
    import norms
    PI = p.measures({})['PI']
    t = {k: (v[0], v[1]) for k, v in norms.POSTURE.items() if k != 'PI'}
    t['PT'] = (0.44 * PI - 11, 4.0); t['LL'] = (0.54 * PI + 27.6, 5.0); t['SS'] = (PI - t['PT'][0], 4.0)
    t['T1slope'] = (25.0, 3.5); t['CL'] = (16.5, 5.0); t['SVA'] = (0.5, 2.0); t['cSVA'] = (1.7, 1.0)
    for k, a in norms.HEIGHTS.items():
        p25, p50, p75 = ref[a]; t[k] = (p50, (p75 - p25) / 2)
    return t


POSTURE_KEYS = ('PT', 'LL', 'T1slope', 'CL', 'SVA', 'cSVA', 'jugular', 'cervicale', 'tenthrib')


def posture_resid(p, x, tg, m=None, w_close=20.0, w=None):
    m = m or p.measures(x); r = []; w = w or {}
    for k in POSTURE_KEYS:
        mu, sd = tg[k]; r.append(w.get(k, 1.0) * (m[k] - mu) / sd)
    r += [w_close * m['close_y'], w_close * m['close_z'], w_close * m['close_a'] / 5]
    # поправки — как можно меньше (лордоз — поровну по дискам), таз, рёбра и череп — с ценой
    r += [di / 6 for di in x['d']] + [ei / 6 for ei in x['e']] + [x['pt'] / 10, x['rib'] / 8, x['sk'] / 10]
    return np.array(r), m


def fit_posture(p, ref, x0=None, iters=30, extra=None, w=None):
    """Гаусс — Ньютон (конечные разности): осанка по нормам; extra(x) — добавочные невязки"""
    tg = posture_targets(p, ref)
    v = np.array(pack(x0 or {}), float)
    def R(v):
        x = unpack(v); r, m = posture_resid(p, x, tg, w=w)
        if extra is not None: r = np.concatenate([r, extra(x)])
        return r
    r = R(v); lam = 1e-2
    for it in range(iters):
        J = np.empty((len(r), len(v)))
        for j in range(len(v)):
            vj = v.copy(); vj[j] += .25; J[:, j] = (R(vj) - r) / .25
        A = J.T @ J; g = J.T @ r; best = (r @ r, v, r)
        for lm in (lam, lam * 10, lam * 100):
            dv = -np.linalg.solve(A + lm * np.diag(np.diag(A) + 1e-6), g)
            for al in (1, .5):
                vn = v + al * dv; rn = R(vn)
                if rn @ rn < best[0]: best = (rn @ rn, vn, rn)
        if best[0] >= r @ r - 1e-6:
            lam *= 10
            if lam > 1e4: break
            continue
        lam = max(lam / 3, 1e-5); v, r = best[1], best[2]
    return unpack(v), tg


if __name__ == '__main__':
    import sys
    d = json.load(open(sys.argv[1])); ep = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None; p = Posture(d, ep)
    m = p.measures({})
    for k, v in m.items():
        print(k, v if not isinstance(v, float) else round(v, 2))
