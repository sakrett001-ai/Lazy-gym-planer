"""Таблицы сечений кожи манекена по Anny подтянутой (кожа Anny, шаг 2): TORSO, LIMBS, NECK, голова (HEAD_ROWS).

python3 tools/skin-anny/tables_fit.py --fit W2/joint2.json --base W2/m-new.json --out W2/tables-fit.json

Видимая кожа манекена остаётся параметрической (сечения-суперэллипсы корпуса, профили конечностей и шеи, сечения головы —
src/js/09bm-mannequin.js), а форма берётся с Anny в нейтральной стойке манекена (anny_pose.AnnyPosed, суставы — наши,
выгрузка --base — сборка со встроенной осанкой). Высоты строк и доли длины — прежние (от них зависят области мышц
MANNEQUIN_TORSO_PATCHES, сетка корпуса TORSO_H, проверки); меняются размеры и показатели суперэллипсов.

Сечение — замкнутый контур кожи Anny в плоскости строки, внутри которого лежит ось части тела (корпус — горизонтальная
плоскость на высоте строки; конечность — перпендикулярно оси сегмента; шея — перпендикулярно оси шеи манекена; голова —
горизонтально в рамке головы). Где контур сливается с соседней частью (подмышка, корень бедра), берутся точки своей части
по весам скиннинга Anny; у шеи спереди — без подбородка и нижней челюсти; у головы — без ушей. Параметры строки — наименьшие
квадраты радиального расстояния точек контура до кривой манекена (та же формула, что ellipseRadius) с ограничением: кости
скелета у этой строки — внутри кривой с запасом MARGIN.
"""
import argparse, json, os, sys, warnings
import numpy as np
import trimesh
from scipy.optimize import least_squares
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
HIP_Y = 89.5
MARGIN = {'torso': .5, 'limb': .4, 'neck': .6, 'head': .4}

# прежние таблицы (4.61.0) — старт подгонки и строки, которые не подгоняются (низ таза)
TORSO_461 = [[-5.3, 12.5, 4.5, 8.5, 2, 2], [-2.4, 15.8, 7.8, 14.2, 3.2, 2.6], [0, 16.4, 8.8, 13.0, 3.0, 2.4], [6, 16.2, 10.4, 10.8, 2.4, 2.2], [12, 15.6, 11.4, 10.2, 2.6, 2.6],
             [18, 14.9, 11.2, 10.0, 2.8, 2.8], [24, 14.4, 11.6, 10.4, 3, 3], [31, 14.6, 12.5, 11.0, 4.0, 3.2], [38.8, 14.2, 12.6, 12.0, 7, 7], [42, 15.17, 11.91, 11.85, 4.78, 3.96],
             [47.2, 15.6, 10.8, 11.6, 3.6, 2.6], [52.8, 15.4, 8.3, 10.5, 2.8, 2.6], [56.8, 12.1, 5.6, 9.2, 2.7, 2], [59.8, 8.2, 5.4, 8.0, 2.2, 2]]
LIMBS_461 = {
    'ua': [[0, 5.4, 5.6, 5.6, 4.8], [.15, 5.4, 5.7, 5.4, 4.6], [.45, 5.4, 5.4, 4.9, 4.6], [.8, 4.3, 4.4, 4.3, 4.0], [1, 3.7, 4.0, 4.0, 3.9]],
    'fa': [[0, 4.0, 4.2, 4.6, 4.3], [.2, 4.6, 4.3, 5.0, 4.6], [.55, 3.6, 3.4, 3.9, 3.6], [.85, 2.7, 2.5, 3.2, 3.0], [1, 2.4, 2.4, 3.1, 2.9]],
    'th': [[0, 10.2, 10.2, 7.8, 8.6], [.12, 11.4, 10.6, 8.0, 8.8], [.4, 9.4, 8.8, 7.8, 8.2], [.75, 7.2, 6.8, 6.6, 6.8], [.92, 6.3, 6.2, 6.1, 6.3], [1, 6.0, 5.8, 5.7, 5.8]],
    'sk': [[0, 5.2, 5.0, 5.2, 5.4], [.1, 4.3, 6.2, 5.5, 5.9], [.3, 4.0, 7.5, 6.1, 6.6], [.6, 3.3, 5.6, 4.5, 4.6], [.85, 3.0, 4.3, 3.4, 3.4], [1, 2.9, 3.6, 3.7, 3.5]]}
NECK_461 = [[0, 6.6, 7.8, 7.6], [.5, 5.7, 6.9, 6.4], [1, 5.4, 6.4, 6.0]]
HEAD_YS = [2.2, 0.9, -0.3, -1.5, -3.0, -4.5, -5.9, -7.1, -8.3, -9.3, -10.3, -11.0, -11.35]
LIMB_DEF = {'ua': ('sh', 'el'), 'fa': ('el', 'wr'), 'th': ('hip', 'kn'), 'sk': ('kn', 'an')}
LIMB_BONES = {'ua': ('humerus',), 'fa': ('ulna', 'radius'), 'th': ('femur', 'patella'), 'sk': ('tibia', 'fibula')}
TORSO_BONES = ('ribcage', 'sacrum', 'pelvis', 'thoracic', 'clavicle', 'scapula', 'L1', 'L2', 'L3', 'L4', 'L5')


def ellipse_radius(lx, ly, rf, rb, rl, rm, nb=2.0, nf=2.0):
    """как ellipseRadius в манекене: lx — вдоль «вперёд», ly — вдоль «вбок»"""
    lx = np.asarray(lx, float); ly = np.asarray(ly, float)
    a = np.where(lx >= 0, rf, rb); b = np.where(ly >= 0, rl, rm); ne = np.where(lx >= 0, nf, nb)
    r = np.hypot(lx, ly) + 1e-12; u = np.abs(lx) / r; v = np.abs(ly) / r
    return np.power(np.power(u / a, ne) + np.power(v / b, ne), -1 / ne)


def frame_uv(P, origin, e1, e2):
    d = np.asarray(P, float) - origin; return np.stack([d @ e1, d @ e2], -1)


def densify(lines, step=.25):
    pts = []
    for p, q in lines:
        n = max(1, int(np.linalg.norm(q - p) / step)); t = (np.arange(n) + .5) / n
        pts.append(p + (q - p) * t[:, None])
    return np.vstack(pts) if pts else np.zeros((0, 3))


class Fitter:
    def __init__(self, fit, base):
        from anny_pose import AnnyPosed
        from scipy.spatial import cKDTree
        self.man = json.load(open(base)); js = json.load(open(fit))
        self.J = {k: np.array(v) for k, v in self.man['joints'].items()}; self.Fr = self.man['frames']
        body = AnnyPosed(); rest = body.rest(js['phen'], js['local']); q = js['q']
        V0 = body.pose(rest, self.J, q)[0]; body.setup_groin(V0)
        V, H, piv, heads = body.pose(rest, self.J, q)
        self.body = body; self.V = V; self.F = body.skin_faces
        self.mesh = trimesh.Trimesh(V, self.F, process=False)
        W = body.weights; L = body.idx
        self.vw = {'armL': body.arm_w['L'], 'armR': body.arm_w['R'], 'legL': body.leg_w['L'], 'legR': body.leg_w['R'],
                   'head': W[:, [L['head'], L['eye.L'], L['eye.R']]].sum(1), 'neck': W[:, [L['neck01'], L['neck02'], L['neck03']]].sum(1)}
        self.tree = cKDTree(V)
        self.bones = {}
        for b in self.man['bones']:
            self.bones.setdefault(b['name'], []).append(np.array(b['pos'], float).reshape(-1, 3))
        self.bones = {k: np.vstack(v) for k, v in self.bones.items()}
        self.debug_sel = {}; self.torso_pts = {}

    def weights_at(self, P):
        j = self.tree.query(P)[1]; return {k: w[j] for k, w in self.vw.items()}

    def section(self, origin, normal):
        lines = trimesh.intersections.mesh_plane(self.mesh, normal, origin)
        return densify(lines) if len(lines) else np.zeros((0, 3))

    def loop_at(self, origin, normal, e1, e2, center=(0.0, 0.0)):
        """замкнутый контур сечения, внутри которого точка center (в осях e1, e2 от origin): точки (3D) и их координаты"""
        from matplotlib.path import Path as MPath
        sec = self.mesh.section(plane_origin=origin, plane_normal=normal)
        if sec is None: return np.zeros((0, 3)), np.zeros((0, 2))
        best = None
        for d in sec.discrete:
            uv = frame_uv(d, origin, e1, e2)
            if len(uv) > 3 and MPath(uv).contains_point(center):
                area = abs(np.sum(uv[:-1, 0] * uv[1:, 1] - uv[1:, 0] * uv[:-1, 1])) / 2
                if best is None or area > best[0]: best = (area, d)   # наибольший: внутренние контуры (полость рта) — не кожа снаружи
        if best is None: return np.zeros((0, 3)), np.zeros((0, 2))
        d = best[1]; P = densify(list(zip(d[:-1], d[1:]))); return P, frame_uv(P, origin, e1, e2)

    def bones_near(self, names, origin, normal, half=1.25):
        out = []
        for n, v in self.bones.items():
            if n.startswith(names):
                s = v[np.abs((v - origin) @ normal) < half]
                if len(s): out.append(s)
        return np.vstack(out) if out else np.zeros((0, 3))

    # ---------------- корпус ----------------
    def torso_row(self, row, xlim=None, keep_w=False, max_depth=None, xfit=None, front=None, nf_max=8, n_max=7):
        """xlim — кости и точки не дальше от средней линии; xfit — точки контура только у средней линии (надплечья: сечение
        «бабочкой» — середина и гребни трапециевидной, их кривая манекена не держит; бока закрывают шапки плеч); front — передний
        край у средней линии задан (основание шеи спереди закрыто подбородком)"""
        h = row[0]; y = HIP_Y + h; o = np.array([0, y, 0.]); X, Z = np.array([1., 0, 0]), np.array([0, 0, 1.])
        P, uv = self.loop_at(o, [0, 1, 0], X, Z)
        w_ = self.weights_at(P); keep = (np.maximum(w_['armL'], w_['armR']) < .5) & (w_['head'] < .5)
        if xlim: keep &= np.abs(P[:, 0]) < xlim
        Pall = P[keep]                                  # для радиальной поправки — весь контур до xlim
        if xfit: keep &= np.abs(P[:, 0]) < xfit
        P = P[keep]; self.debug_sel[('torso', h)] = P
        lx, ly = P[:, 2], np.abs(P[:, 0])
        B = self.bones_near(TORSO_BONES, o, np.array([0, 1., 0]))
        if xlim: B = B[np.abs(B[:, 0]) < xlim]
        w0, a0, b0, nb0, nf0 = row[1:]
        def unpack(p):
            return (w0 if keep_w else p[0]), p[1], p[2], p[3], p[4]
        def res(p):
            w, a, b, nb, nf = unpack(p)
            out = [np.hypot(lx, ly) - ellipse_radius(lx, ly, a, b, w, w, nb, nf)]
            if len(B):
                rb_ = ellipse_radius(B[:, 2], np.abs(B[:, 0]), a, b, w, w, nb, nf) - np.hypot(B[:, 2], B[:, 0])
                out.append(10 * np.clip(MARGIN['torso'] - rb_, 0, None))
            if max_depth is not None: out.append([20 * max(0.0, a + b - max_depth)])
            if front is not None: out.append([10 * (a - front)])
            return np.concatenate(out)
        nfm = min(nf_max, n_max)
        sol = least_squares(res, [w0, a0, b0, min(nb0, n_max - 1e-3), min(nf0, nfm - 1e-3)], bounds=([5, 2, 2, 2, 2], [25, 20, 20, n_max, nfm]), loss='soft_l1', f_scale=.5)
        w, a, b, nb, nf = unpack(sol.x)
        r = np.hypot(lx, ly) - ellipse_radius(lx, ly, a, b, w, w, nb, nf)
        stats = dict(n=int(len(P)), rms=float(np.sqrt(np.mean(r ** 2))), maxin=float(r.min()), maxout=float(r.max()),
                     anny_w=float(np.abs(P[:, 0]).max()), anny_front=float(P[:, 2].max()), anny_back=float(-P[:, 2].min()))
        if len(B):
            stats['bone_min'] = float((ellipse_radius(B[:, 2], np.abs(B[:, 0]), a, b, w, w, nb, nf) - np.hypot(B[:, 2], B[:, 0])).min())
        self.torso_pts[h] = (Pall, B)
        return [h, round(float(w), 2), round(float(a), 2), round(float(b), 2), round(float(nb), 2), round(float(nf), 2)], stats

    def limit_depth(self, row, dr, D):
        """глубина сечения (перед − зад по оси вперёд) не больше D: лишнее снимается спереди и сзади гладко (cos² от передней и
        задней линий) пропорционально запасу над костями у средней линии; кости — внутри с запасом MARGIN"""
        h, w, a, b, nb, nf = row; n = len(dr); th = np.linspace(0, np.pi, n); dr = np.array(dr, float)
        base = ellipse_radius(np.cos(th), np.sin(th), a, b, w, w, nb, nf)
        P, B = self.torso_pts.get(h, (None, np.zeros((0, 3))))
        def ext(d):
            z = (base + d) * np.cos(th); return float(z.max()), float(-z.min())
        f0, b0 = ext(dr)
        if f0 + b0 <= D: return [round(float(v), 2) for v in dr], dict(depth=f0 + b0)
        bf = float(B[B[:, 2] > 0, 2].max()) + MARGIN['torso'] if len(B) and (B[:, 2] > 0).any() else 0.0
        bb = float(-B[B[:, 2] < 0, 2].min()) + MARGIN['torso'] if len(B) and (B[:, 2] < 0).any() else 0.0
        sf, sb = max(f0 - bf, 0.01), max(b0 - bb, 0.01); ex = f0 + b0 - D
        cf = np.clip(np.cos(th), 0, None) ** 3; cb = np.clip(-np.cos(th), 0, None) ** 3
        for it in range(20):
            d2 = dr - ex * sf / (sf + sb) * cf / 1.0 - ex * sb / (sf + sb) * cb
            f1, b1 = ext(d2)
            if f1 + b1 <= D + .02: break
            ex += (f1 + b1 - D)
        return [round(float(v), 2) for v in d2], dict(depth_before=f0 + b0, depth=f1 + b1, front=f1, back=b1, bone_front=bf, bone_back=bb)

    def torso_dr(self, row, n=25, win=4.0, gap=30.0, sigma=4.0):
        """радиальная поправка строки (TORSO_DR): по углу от передней линии θ_k = kπ/(n − 1) — внешний край контура Anny
        (точки в пределах ±win°) минус радиус суперэллипса строки; где точек нет дальше gap° — 0, ближе — линейно; затем кости
        у строки — внутри с запасом MARGIN; сглаживание по углу"""
        h, w, a, b, nb, nf = row; P, B = self.torso_pts.get(h, (np.zeros((0, 3)), np.zeros((0, 3))))
        th = np.linspace(0, np.pi, n); base = ellipse_radius(np.cos(th), np.sin(th), a, b, w, w, nb, nf)
        dr = np.full(n, np.nan)
        if len(P):
            pt = np.arctan2(np.abs(P[:, 0]), P[:, 2]); pr = np.hypot(P[:, 0], P[:, 2])
            for k in range(n):
                m = np.abs(pt - th[k]) < np.radians(win)
                if m.any(): dr[k] = pr[m].max() - base[k]
        ok = ~np.isnan(dr)
        if ok.any():
            idx = np.arange(n); full = np.interp(idx, idx[ok], dr[ok])
            dist = np.array([np.abs(idx[ok] - k).min() for k in idx]) * 180 / (n - 1)
            dr = np.where(dist <= gap, full, 0.0)
        else:
            dr = np.zeros(n)
        # гладко по длине дуги сечения (Гаусс, σ sigma см; за передней и задней линиями — отражение): сетка корпуса (столбцы через
        # 2–3 см) держит хорду ≤ 1 мм — мельче ей не уследить (у узкой верхней части груди 7,5° — полсантиметра дуги)
        r = base + dr; xz = np.stack([r * np.sin(th), r * np.cos(th)], 1); sarc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(xz, axis=0), axis=1))])
        S_ = np.concatenate([-sarc[:0:-1], sarc, 2 * sarc[-1] - sarc[-2::-1]])
        def gauss(v, sg):
            D_ = np.concatenate([v[:0:-1], v, v[-2::-1]])
            return np.array([np.sum(D_ * np.exp(-(S_ - sk) ** 2 / (2 * sg ** 2))) / np.sum(np.exp(-(S_ - sk) ** 2 / (2 * sg ** 2))) for sk in sarc])
        need = np.full(n, -np.inf)                       # кости у строки — внутри с запасом MARGIN
        if len(B):
            bt = np.arctan2(np.abs(B[:, 0]), B[:, 2]); br = np.hypot(B[:, 0], B[:, 2])
            for k in range(n):
                m = np.abs(bt - th[k]) < np.radians(180 / (n - 1))
                if m.any(): need[k] = br[m].max() + MARGIN['torso'] - base[k]
        if h >= 47: sigma = sigma * 1.5                  # у подмышки и надплечий контур Anny с разрывом (руки) — грубее
        # основание шеи (сечение «бабочкой»: шея и гребни трапециевидных): спереди узкий столб шеи между ямками над ключицами —
        # при σ 6 см перед шеи сглаживался в ямки и уходил на 1,5–2 см за кожу Anny (трахея — под самой кожей); столбцы сетки
        # здесь через 1 см — мельче можно
        if h >= 52: sigma = 2.5
        dr = np.maximum(gauss(dr, sigma), need)
        dr = gauss(dr, sigma * .6)
        for it in range(200):                            # недостающее над костями — гладким горбом, а не изломом (по шагам:
            d = np.clip(need - dr, 0, None)              # единым множителем сглаженной нехватки широкий горб раздувался)
            if d.max() < .01: break
            dr = dr + gauss(d, 1.5) + np.where(d > 0, .01, 0)
        return [round(float(v), 2) for v in dr]

    def head_grid(self, top=11.9, n_lat=49, n_lon=49, cut=((-9.5, -9.0), (-15.0, 4.0)), ear=(-6.0, 2.0, -8.0, 0.5, 6.8), smooth=.7, xmax=8.6):
        """радиус кожи головы Anny из центра головы по направлениям (HEAD_R): последнее пересечение луча с кожей головы (веса
        головы, без ушей, с глазами); свод сжат по высоте к макушке top; снизу голова срезана плоскостью cut (через точки
        (y, z) у затылка и у горла — ниже кожа шеи); дыры (корни ушей) — по соседям; узкие провалы (щель рта, глаза) —
        закрытием 3 × 3"""
        hc = np.array(self.J['head']); body = self.body; V = self.V - hc; F = body.faces
        atop = float(V[self.vw['head'] > .5, 1].max()); k = (top - 2.2) / (atop - 2.2)
        Vs = V.copy(); up = Vs[:, 1] > 2.2; Vs[up, 1] = 2.2 + (Vs[up, 1] - 2.2) * k
        fh = (self.vw['head'] + self.vw['neck'])[F].mean(1) > .5     # голова и шея: лучи вниз-вбок упираются в кожу шеи (срез — плоскостью)
        c = V[F].mean(1); y0, y1, z0, z1, xe = ear
        fe = (c[:, 1] > y0) & (c[:, 1] < y1) & (c[:, 2] > z0) & (c[:, 2] < z1) & (np.abs(c[:, 0]) > xe)
        skin = set(map(tuple, np.sort(body.skin_faces, 1)))
        eye = np.array([tuple(sorted(f)) not in skin for f in F]) & (np.abs(c[:, 1] - 0.5) < 3) & (c[:, 2] > 0)
        sel = (fh & ~fe) | eye
        mesh = trimesh.Trimesh(Vs, F[sel], process=False)
        tl = np.linspace(0, np.pi, n_lat); pl = np.linspace(0, np.pi, n_lon)
        U = np.array([[np.sin(t) * np.sin(p), np.cos(t), np.sin(t) * np.cos(p)] for t in tl for p in pl])
        loc, ir, _ = mesh.ray.intersects_location(np.zeros_like(U), U, multiple_hits=True)
        R = np.full(len(U), np.nan)
        if len(loc):
            d = np.einsum('ij,ij->i', loc, U[ir])
            for i, dd, lc in zip(ir, d, loc):
                if abs(lc[0]) > xmax: continue              # шея у надплечий — не голова (голова уже, уши — пластинами)
                if dd > 0 and (np.isnan(R[i]) or dd > R[i]): R[i] = dd
        (ya, za), (yb, zb) = cut; nrm = np.array([0.0, zb - za, -(yb - ya)]); nrm /= np.linalg.norm(nrm)
        if nrm[1] < 0: nrm = -nrm
        d0 = nrm @ np.array([0.0, ya, za]); nu = U @ nrm
        tc = np.where(nu < -1e-6, d0 / np.where(nu < -1e-6, nu, -1), np.inf)
        down = U[:, 1] < -.6                              # лучи без попаданий круто вниз — в шею: до плоскости среза; вбок (корни ушей) — по соседям
        # вниз без попаданий — внутрь шеи: до плоскости среза, но не дальше цилиндра радиуса 5,8 см вокруг оси шеи (z −2,5)
        a2 = U[:, 0] ** 2 + U[:, 2] ** 2; b2 = -2 * U[:, 2] * -2.5; c2 = 2.5 ** 2 - 5.8 ** 2
        tcy = (-b2 + np.sqrt(np.maximum(b2 * b2 - 4 * a2 * c2, 0))) / (2 * np.maximum(a2, 1e-9))
        tin = np.minimum(tc, tcy)
        R = np.where(np.isnan(R), np.where(down & np.isfinite(tin), tin, np.nan), np.minimum(R, tc))
        G = R.reshape(n_lat, n_lon)
        for it in range(200):
            nan = np.isnan(G)
            if not nan.any(): break
            P_ = np.pad(G, 1, mode='edge'); S = np.zeros_like(G); C = np.zeros_like(G)
            for dy, dx in ((0, 1), (1, 0), (1, 2), (2, 1)):
                v = P_[dy:dy + n_lat, dx:dx + n_lon]; ok = ~np.isnan(v); S[ok] += v[ok]; C[ok] += 1
            fill = nan & (C > 0); G[fill] = S[fill] / C[fill]
        from scipy.ndimage import grey_closing
        Gp = np.concatenate([G[:, ::-1][:, :-1], G, G[:, ::-1][:, 1:]], 1)         # долгота — с отражением (симметрия)
        Gp = grey_closing(Gp, size=(3, 3), mode='nearest')
        from scipy.ndimage import gaussian_filter
        Gp = gaussian_filter(Gp, sigma=smooth, mode='nearest')                       # грани сетки Anny — без ряби на свету
        G = Gp[:, n_lon - 1:2 * n_lon - 1]
        # череп и нижняя челюсть — внутри с запасом MARGIN: по каждому направлению — наибольшая проекция вершин кости в конусе
        # полуширины шага сетки (надбровья и скулы черепа MyoSim местами у самой кожи Anny — шаг 1: надпереносье −0,2)
        Bh = np.vstack([self.bones[n] for n in ('skull', 'jaw') if n in self.bones]) - hc
        Bh[:, 0] = np.abs(Bh[:, 0])                       # симметрично: левая половина
        bu = Bh / np.linalg.norm(Bh, axis=1, keepdims=True); br = np.linalg.norm(Bh, axis=1)
        cone = np.cos(np.radians(180 / (n_lat - 1)))
        need = np.full(len(U), 0.0)
        Uh = U.copy(); Uh[:, 0] = np.abs(Uh[:, 0])
        cs = Uh @ bu.T
        for i in range(len(U)):
            m = cs[i] > cone
            if m.any(): need[i] = float((br[m] * cs[i][m]).max()) + MARGIN['head']
        need = need.reshape(n_lat, n_lon)
        for it in range(200):                             # недостающее над костями — гладким горбом (сглаженная нехватка, по шагам)
            d = np.clip(need - G, 0, None)
            if d.max() < .01: break
            dp = np.concatenate([d[:, ::-1][:, :-1], d, d[:, ::-1][:, 1:]], 1)
            G = G + gaussian_filter(dp, sigma=1.0, mode='nearest')[:, n_lon - 1:2 * n_lon - 1] + np.where(d > 0, .01, 0)
        G[0, :] = G[0, :].mean()                          # макушка — одна точка
        # ориентиры лица — для проверочных точек головы (headSamples)
        m = (np.abs(V[:, 0]) < .5) & (V[:, 1] > -8) & (V[:, 1] < 0) & (self.vw['head'] > .5)
        tip = V[np.argmax(np.where(m, V[:, 2], -99))]
        m = (np.abs(V[:, 0]) < .5) & (V[:, 1] > -13) & (V[:, 1] < -8) & (self.vw['head'] > .5)
        pog = V[np.argmax(np.where(m, V[:, 2], -99))]
        m = (np.abs(V[:, 0]) < 1) & (V[:, 2] > 3) & (self.vw['head'] > .3)
        men = V[np.argmin(np.where(m, V[:, 1], 99))]
        m = (np.abs(V[:, 0]) < .5) & (V[:, 1] > 1) & (V[:, 1] < 2.2) & (self.vw['head'] > .5)
        gla = V[np.argmax(np.where(m, V[:, 2], -99))]
        e = (np.abs(V[:, 0]) > xe) & (V[:, 1] > y0) & (V[:, 1] < y1) & (V[:, 2] > z0) & (V[:, 2] < z1) & (V[:, 0] > 0)
        lm = {'nose_tip': tip.round(2).tolist(), 'pogonion': pog.round(2).tolist(), 'menton': men.round(2).tolist(), 'glabella': gla.round(2).tolist(),
              'ear_c': V[e].mean(0).round(2).tolist(), 'anny_top': atop, 'k_vault': k}
        return {'nLat': n_lat, 'nLon': n_lon, 'u': ' '.join(str(int(round(v * 100))) for v in G.ravel())}, lm

    # ---------------- конечности ----------------
    def limb_axes(self, kind, s, t):
        g = 1 if s == 'L' else -1
        if kind == 'fa':
            p = self.Fr['fa' + s]; d = self.Fr['fd' + s]
            front = -g * ((1 - t) * np.array(p['x']) + t * np.array(d['x'])); front /= np.linalg.norm(front)
            lat = (1 - t) * np.array(p['z']) + t * np.array(d['z']); lat = lat - front * (lat @ front); lat /= np.linalg.norm(lat)
            return front, lat
        f = self.Fr[kind + s]; return np.array(f['z'], float), g * np.array(f['x'], float)

    def limb_row(self, kind, s, row, rmax=None, recenter=False):
        """recenter — сечение Anny сдвигается вперёд-назад так, чтобы его центр (по площади) лёг на ось сегмента: плечо Anny висит
        за нашей плечевой костью (её плечевой сустав — на 4,4 см позади нашего, кость у передней кожи), а профиль манекена — вокруг
        оси «плечевой — локтевой»; берётся форма сечения"""
        t = row[0]; a_, b_ = LIMB_DEF[kind]; A, Bj = self.J[a_ + s], self.J[b_ + s]
        c = A + (Bj - A) * t; ax = (Bj - A) / np.linalg.norm(Bj - A)
        front, lat = self.limb_axes(kind, s, t)
        front = front - ax * (front @ ax); front /= np.linalg.norm(front); lat = lat - ax * (lat @ ax) - front * (lat @ front); lat /= np.linalg.norm(lat)
        alluv = frame_uv(self.section(c, ax), c, front, lat)
        P, uv = self.loop_at(c, ax, front, lat)
        w_ = self.weights_at(P)
        keep = (w_['arm' + s] > .5) if kind in ('ua', 'fa') else (w_['leg' + s] > .5)
        if rmax: keep &= np.hypot(uv[:, 0], uv[:, 1]) < rmax
        uv = uv[keep]; lx, ly = uv[:, 0], uv[:, 1]
        if recenter and len(lx) > 20:
            ang = np.arctan2(ly, lx); o_ = np.argsort(ang); x_, y_ = lx[o_], ly[o_]
            A2 = x_ * np.roll(y_, -1) - np.roll(x_, -1) * y_; cx = np.sum((x_ + np.roll(x_, -1)) * A2) / (3 * np.sum(A2))
            lx = lx - cx; alluv = alluv - [cx, 0]
        Bv = self.bones_near(LIMB_BONES[kind], c, ax, 1.0); Bv = Bv[(Bv[:, 0] * (1 if s == 'L' else -1)) > 0]
        buv = frame_uv(Bv, c, front, lat); bx, by = buv[:, 0], buv[:, 1]
        self.debug_sel[(kind, t)] = (lx, ly, bx, by, alluv[:, 0], alluv[:, 1])
        def res(p):
            rf, rb, rl, rm = p
            out = [np.hypot(lx, ly) - ellipse_radius(lx, ly, rf, rb, rl, rm)]
            if len(Bv): out.append(10 * np.clip(MARGIN['limb'] - (ellipse_radius(bx, by, rf, rb, rl, rm) - np.hypot(bx, by)), 0, None))
            return np.concatenate(out)
        if len(lx) < 20: return row, dict(n=int(len(lx)))
        sol = least_squares(res, row[1:], bounds=([1, 1, 1, 1], [15, 15, 15, 15]), loss='soft_l1', f_scale=.3)
        rf, rb, rl, rm = sol.x
        r = np.hypot(lx, ly) - ellipse_radius(lx, ly, rf, rb, rl, rm)
        stats = dict(n=int(len(lx)), rms=float(np.sqrt(np.mean(r ** 2))))
        if len(Bv): stats['bone_min'] = float((ellipse_radius(bx, by, rf, rb, rl, rm) - np.hypot(bx, by)).min())
        return [t] + [round(float(x), 2) for x in sol.x], stats

    def limb_bone_fix(self, kind, s, rows, iters=6):
        """кости сегмента — внутри профиля с запасом MARGIN по всей длине, а не только у плоскостей строк (строки — через
        2,7–4,2 см, подгонка видит кости в ±1 см от строки; лодыжка, шиловидные отростки — между строками или за концевой
        строкой, которая взята по пропорции): у точки кости на доле t профиль — линейно между соседними строками, как
        profileAt в манекене; где не хватает — добавка к радиусу этой стороны у обеих соседних строк (у наибольшей по
        направлению доли; если на сторону одной оси не хватает — к обеим)"""
        rows = [list(r) for r in rows]; ts = [r[0] for r in rows]
        a_, b_ = LIMB_DEF[kind]; A, Bj = self.J[a_ + s], self.J[b_ + s]; L = np.linalg.norm(Bj - A); ax = (Bj - A) / L
        Bv = np.vstack([v for n, v in self.bones.items() if n.startswith(LIMB_BONES[kind])])
        Bv = Bv[(Bv[:, 0] * (1 if s == 'L' else -1)) > 0]
        t = (Bv - A) @ ax / L; Bv, t = Bv[(t >= 0) & (t <= 1)], t[(t >= 0) & (t <= 1)]
        loc = []
        for p, tt in zip(Bv, t):
            front, lat = self.limb_axes(kind, s, tt)
            front = front - ax * (front @ ax); front /= np.linalg.norm(front); lat = lat - ax * (lat @ ax) - front * (lat @ front); lat /= np.linalg.norm(lat)
            c = A + (Bj - A) * tt; loc.append(((p - c) @ front, (p - c) @ lat))
        loc = np.array(loc); fixed = 0.0
        for it in range(iters):
            worst = 0.0
            for (lx, ly), tt in zip(loc, t):
                i = min(max(int(np.searchsorted(ts, tt, side='right')) - 1, 0), len(ts) - 2); u = (tt - ts[i]) / (ts[i + 1] - ts[i])
                pr = [(1 - u) * rows[i][k] + u * rows[i + 1][k] for k in range(1, 5)]
                ci = 1 if lx >= 0 else 2; cj = 3 if ly >= 0 else 4          # столбцы: rf/rb, rl/rm
                rho = np.hypot(lx, ly); need = rho + MARGIN['limb']
                r = float(ellipse_radius(lx, ly, *pr))
                if r >= need: continue
                worst = max(worst, need - r)
                a, b = pr[ci - 1], pr[cj - 1]; uu, vv = abs(lx) / rho, abs(ly) / rho
                rhs = 1 / need ** 2 - (uu / a) ** 2 if vv >= uu else 1 / need ** 2 - (vv / b) ** 2
                if rhs > 1e-9:                                           # хватает добавки по преобладающей оси
                    if vv >= uu: col, cur, new = cj, b, vv / np.sqrt(rhs)
                    else: col, cur, new = ci, a, uu / np.sqrt(rhs)
                    for k in (i, i + 1): rows[k][col] = round(rows[k][col] + (new - cur) + .005, 2)
                else:                                                    # по обеим осям — в долю
                    f = need / r
                    for k in (i, i + 1):
                        rows[k][ci] = round(rows[k][ci] + a * (f - 1) + .005, 2); rows[k][cj] = round(rows[k][cj] + b * (f - 1) + .005, 2)
            fixed = max(fixed, worst)
            if worst <= 0: break
        return rows, dict(bone_fix=round(fixed, 2), n=int(len(t)))

    # ---------------- шея ----------------
    def neck_axis(self):
        n = self.Fr['neck']; h = self.Fr['head']
        lo = np.array(n['o']) - np.array(n['y']) * 1 + np.array(n['z']) * 2.5; hi = np.array(h['o']) + np.array(h['y']) * 1.5
        return lo, hi

    def neck_row(self, row, front_max=7.5, rf=None):
        """rf — передний радиус задан (спереди в плоскости строки — подбородок и дно рта): подгоняются задний и боковой"""
        t = row[0]; lo, hi = self.neck_axis(); c = lo + (hi - lo) * t; ax = (hi - lo) / np.linalg.norm(hi - lo)
        z = np.array(self.Fr['neck']['z'], float); z = z - ax * (z @ ax); z /= np.linalg.norm(z)
        x = np.array(self.Fr['neck']['x'], float); x = x - ax * (x @ ax) - z * (x @ z); x /= np.linalg.norm(x)
        alluv = frame_uv(self.section(c, ax), c, z, x)
        P, uv = self.loop_at(c, ax, z, x)
        keep = ~((uv[:, 0] > 0) & (np.hypot(uv[:, 0], uv[:, 1]) > front_max))     # подбородок и нижняя челюсть спереди — не шея
        uv = uv[keep]; lz, lx = uv[:, 0], uv[:, 1]
        Bv = self.bones_near(('cervical',), c, ax, 1.0); buv = frame_uv(Bv, c, z, x); bz, bx = buv[:, 0], buv[:, 1]
        self.debug_sel[('neck', t)] = (lz, lx, bz, bx, alluv[:, 0], alluv[:, 1])
        rf_ = rf
        if rf_ is not None:
            keep = lz <= 0.5 * rf_; lz, lx = lz[keep], lx[keep]          # спереди точек нет: по заднему и боковым краям
        def full(p): return (rf_, p[0], p[1]) if rf_ is not None else tuple(p)
        def res(p):
            rf, rb, rl = full(p)
            out = [np.hypot(lz, lx) - ellipse_radius(lz, lx, rf, rb, rl, rl)]
            if len(Bv): out.append(10 * np.clip(MARGIN['neck'] - (ellipse_radius(bz, bx, rf, rb, rl, rl) - np.hypot(bz, bx)), 0, None))
            return np.concatenate(out)
        if len(lz) < 20: return row, dict(n=int(len(lz)))
        x0 = row[2:] if rf_ is not None else row[1:]
        sol = least_squares(res, x0, bounds=([2] * len(x0), [12] * len(x0)), loss='soft_l1', f_scale=.3)
        par = full(sol.x)
        r = np.hypot(lz, lx) - ellipse_radius(lz, lx, par[0], par[1], par[2], par[2])
        return [t] + [round(float(v), 2) for v in par], dict(n=int(len(lz)), rms=float(np.sqrt(np.mean(r ** 2))),
                                                             anny_front=float(lz.max()), anny_back=float(-lz.min()), anny_lat=float(np.abs(lx).max()))

    # ---------------- голова ----------------
    def head_rows(self, ys, ear=(-6.0, 2.0, -8.0, 0.5, 6.8)):
        """сечения головы в рамке головы (начало — центр головы R.head): [y, w, zc, zf, zb, nf, nb]. Уши — пластины HEAD_EAR:
        в полосе ушей (ear: y от, до, z от, до, x дальше) точки не берутся"""
        hc = np.array(self.J['head']); out = []
        for y in ys:
            P, uv = self.loop_at(hc + [0, y, 0], [0, 1, 0], np.array([1., 0, 0]), np.array([0, 0, 1.]), center=(0.0, -3.0 if y > 6 else 0.0))
            if len(P) < 20: out.append(None); continue
            P = P[self.weights_at(P)['head'] > .5] - hc          # без шеи (у нижних строк сзади к голове подходит шея)
            if len(P) < 20: out.append(None); continue
            y0, y1, z0, z1, xe = ear
            if y0 <= y <= y1: P = P[~((P[:, 2] > z0) & (P[:, 2] < z1) & (np.abs(P[:, 0]) > xe))]
            self.debug_sel[('head', y)] = P
            ax_ = np.abs(P[:, 0]); w = float(ax_.max())
            mid = P[ax_ < .8]; zf = float(mid[:, 2].max()) if len(mid) else float(P[:, 2].max())
            zb = float(P[:, 2].min())                              # сзади — затылок, ниже — углы нижней челюсти
            lx = ax_
            # центр сечения по глубине (там наибольшая ширина) и показатели — подгонкой: по точке наибольшей ширины он скачет
            # между скулами, углами челюсти и теменем
            def res(p):
                zc, nf, nb = p; lz = P[:, 2] - zc
                return np.hypot(lz, lx) - ellipse_radius(lz, lx, zf - zc, zc - zb, w, w, nb, nf)
            z0 = float(np.clip(P[np.argmax(ax_), 2], zb + .6, zf - .6))
            sol = least_squares(res, [z0, 2.3, 2.2], bounds=([zb + .5, 1.6, 1.6], [zf - .5, 4, 4]))
            zc, nf, nb = sol.x
            out.append([y, round(w, 2), round(float(zc), 2), round(zf, 2), round(zb, 2), round(float(nf), 2), round(float(nb), 2)])
        return out

    def head_table(self, top=11.9, nose=(-5.6, -0.4)):
        """строки головы (рамка головы: [y, w, zc, zf, zb, nf, nb], снизу вверх по убыванию y — как HEAD_ROWS) и положение носа
        и ушей Anny. Свод — по Anny, сжат по высоте так, чтобы макушка была на top (рост манекена — B.head[1]); нос — отдельными
        эллипсоидами (HEAD_PARTS), поэтому в строках у носа передний край — между переносицей и верхней губой; низ — у подбородка"""
        hc = np.array(self.J['head']); V = self.V - hc; wh = self.vw['head']
        atop = float(V[wh > .5, 1].max()); k = (top - 2.2) / (atop - 2.2)
        m = (np.abs(V[:, 0]) < .5) & (V[:, 1] > -8) & (V[:, 1] < 2) & (wh > .5)
        tip = V[np.argmax(np.where(m, V[:, 2], -99))]
        ear = (np.abs(V[:, 0]) > 6.8) & (V[:, 1] > -6) & (V[:, 1] < 2) & (V[:, 2] > -8) & (V[:, 2] < .5) & (V[:, 0] > 0)
        # низ подбородка: где передний край по средней линии уходит назад к горлу (меньше 5 см впереди центра)
        ys_face = list(np.arange(2.2, -16.0, -.8))
        rows_a = [atop - .05, atop - .25, atop - .6, atop - 1.2, atop - 2.2, atop - 3.7, atop - 5.5, 4.4, 3.2]
        ys = [round(y, 2) for y in rows_a] + [round(y, 2) for y in ys_face]
        raw = self.head_rows(ys)
        out = []
        for y, r in zip(ys, raw):
            if r is None: continue
            if y < -6 and r[3] < 5.0: break                    # ниже подбородка — шея
            r = list(r); y2 = 2.2 + (y - 2.2) * k if y > 2.2 else y
            r[0] = round(y2, 2); out.append(r)
        # у носа передний край — линейно между краями выше и ниже носа
        up = [r for r in out if r[0] >= nose[1]][-1]; dn = [r for r in out if r[0] <= nose[0]][0]
        for r in out:
            if nose[0] < r[0] < nose[1]:
                u = (r[0] - up[0]) / (dn[0] - up[0]); r[3] = round(up[3] + (dn[3] - up[3]) * u, 2)
        out = smooth_cols(out, (2, 5, 6))
        extra = {'nose_tip': tip.round(2).tolist(), 'ear_c': V[ear].mean(0).round(2).tolist(), 'anny_top': atop, 'k_vault': k}
        return out, extra

    def head_top(self):
        hc = np.array(self.J['head']); P = self.V[self.vw['head'] > .5] - hc
        return float(P[:, 1].max())


def sagittal_front(F, y, z0=0.0, zmax=9.0):
    """передний край кожи Anny по средней линии на высоте y (сагиттальное сечение, точки впереди z0 и не дальше zmax)"""
    P = F.section(np.array([0, y, 0.]), np.array([1., 0, 0])); P = P[(np.abs(P[:, 1] - y) < .3) & (P[:, 2] > z0) & (P[:, 2] < zmax)]
    return float(P[:, 2].min()) if len(P) else None


TORSO_HS = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 31, 34.5, 38.8, 42, 45, 47.2, 50, 52.8, 56.8, 59.8]
LIMB_TS = [round(.1 * i, 1) for i in range(11)]
NECK_TS = [0, .25, .5, .75, 1]


def profile_at(prof, t):
    """как profileAt в манекене: линейно между строками"""
    if t <= prof[0][0]: return list(prof[0][1:])
    for a, b in zip(prof, prof[1:]):
        if t <= b[0]:
            u = (t - a[0]) / (b[0] - a[0]); return [x + (y - x) * u for x, y in zip(a[1:], b[1:])]
    return list(prof[-1][1:])


def smooth_cols(rows, cols, k=(.25, .5, .25)):
    """сглаживание столбцов cols вдоль строк (показатели суперэллипсов: без ступенек между соседними сечениями)"""
    out = [list(r) for r in rows]
    for c in cols:
        v = [r[c] for r in rows]
        for i in range(1, len(rows) - 1): out[i][c] = round(k[0] * v[i - 1] + k[1] * v[i] + k[2] * v[i + 1], 2)
    return out


def fit_all(F, max_chest_depth=None):
    res = {'TORSO': [], 'LIMBS': {}, 'NECK': [], 'stats': {}}
    lo, hi = F.neck_axis()
    # шея: основание и нижняя половина — по контуру; с середины (уровень нижней челюсти: спереди дно рта, в плоскости строки —
    # подбородок) спереди — прежний профиль; верх (в черепе) — в той же пропорции к середине, что у прежней таблицы
    neck = []
    r0, st = F.neck_row([0] + profile_at(NECK_461, 0)); res['stats']['neck 0'] = st
    rf5 = profile_at(NECK_461, .5)[0]
    for t in NECK_TS:
        if t == 0: neck.append(r0); continue
        rf = r0[1] + (rf5 - r0[1]) * min(1.0, t / .5) if t <= .5 else profile_at(NECK_461, t)[0]
        r, st = F.neck_row([t] + profile_at(NECK_461, t), rf=rf); res['stats'][f'neck {t}'] = st; neck.append(r)
    # с середины шея — на уровне нижней челюсти и в черепе: контур сечения там — лицо и челюсть, не шея. Голова манекена —
    # прежняя (4.61.0, голова Anny не подставляется: tables_apply.py), и верх шеи входит в неё, как раньше: прежний профиль, но
    # сзади и с боков не толще строки t 0,25 (шея Anny тоньше прежней — без утолщения к затылку)
    for i, t in enumerate(NECK_TS):
        if t >= .5:
            o = profile_at(NECK_461, t); neck[i] = [t, round(o[0], 2), round(min(o[1], neck[1][2]), 2), round(min(o[2], neck[1][3]), 2)]
    res['NECK'] = neck
    # корпус: низ таза (h < 0: скошенный торец, промежность) — прежний: пах нейтральный, высота промежности ANSUR
    rows = []
    for h in TORSO_HS:
        kw = {}
        if h >= 52: kw = dict(xlim=13.5, keep_w=True, xfit=8.0, nf_max=2.6)
        if h >= 59: kw['front'] = lo[2] + neck[0][1]          # основание шеи спереди — как у шеи (t 0)
        if max_chest_depth is not None and 35 <= h <= 43: kw['max_depth'] = max_chest_depth
        kw['n_max'] = 4.0
        r, st = F.torso_row([h] + profile_at(TORSO_461, h), **kw)
        rows.append(r); res['stats'][f'torso {h}'] = st
    rows = smooth_cols(rows, (4, 5))
    # низ таза (h < 0: скошенный торец — сзади сечение опускается на h·SEAT_K·w(θ), промежность): строка h −5,3 (промежность,
    # высота ANSUR) — прежняя; строка h −2,4 — по Anny: ширина и перед — на своей высоте, зад — на высоте, куда его опускает
    # скос (ягодицы над ягодичной складкой), показатели — прежние
    h2 = TORSO_461[1][0]; seat = 9 / 5.3 - 1
    P = F.section(np.array([0, HIP_Y + h2, 0.]), np.array([0, 1., 0])); Pb = F.section(np.array([0, HIP_Y + h2 * (1 + seat), 0.]), np.array([0, 1., 0]))
    noarm = lambda Q: Q[np.maximum(F.weights_at(Q)['armL'], F.weights_at(Q)['armR']) < .5] if len(Q) else Q
    P, Pb = noarm(P), noarm(Pb)
    w2 = float(np.abs(P[:, 0]).max()); a2 = float(P[np.abs(P[:, 0]) < 6, 2].max()); b2 = float(-Pb[(np.abs(Pb[:, 0]) > 2) & (np.abs(Pb[:, 0]) < 8), 2].min())
    low = [list(TORSO_461[0]), [h2, round(w2, 2), round(a2, 2), round(b2, 2)] + list(TORSO_461[1][4:])]
    res['stats']['torso -2.4'] = dict(w=w2, a=a2, b=b2)
    res['TORSO'] = low + rows
    res['TORSO_DR'] = {'n': 25, 'h': [r[0] for r in res['TORSO']], 'dr': [[0.0] * 25 if r[0] < 0 else F.torso_dr(r) for r in res['TORSO']]}
    if max_chest_depth is not None:
        for i, r in enumerate(res['TORSO']):
            if 33 <= r[0] <= 43:
                res['TORSO_DR']['dr'][i], st = F.limit_depth(r, res['TORSO_DR']['dr'][i], max_chest_depth)
                res['stats'][f'depth {r[0]}'] = st
    for kind in LIMBS_461:
        out = []
        for t in LIMB_TS:
            # центрирование по площади — у плеча и у бедра: их кожа Anny сидит не вокруг наших костей (плечо — на 3–4 см позади
            # плечевой, бедро — на 2 см впереди бедренной: спереди от кости 8,3 см ткани, сзади 7,7, тогда как у живого на середине
            # бедра спереди меньше, чем сзади — мышцы передней поверхности ≈ 5 см, задней ≈ 6–7 см по УЗИ, Abe et al. 1994)
            r, st = F.limb_row(kind, 'L', [t] + profile_at(LIMBS_461[kind], t), rmax=9 if ((kind == 'ua' and t < .2) or (kind == 'th' and t < .05)) else None, recenter=kind in ('ua', 'th'))
            out.append(r); res['stats'][f'{kind} {t}'] = st
        res['LIMBS'][kind] = out
    # корни и концы, где контур сливается с соседней частью (плечо — с подмышкой и дельтой, бедро — с ягодицей и пахом, низ
    # голени — со стопой): прежний профиль в той же пропорции к ближайшей подогнанной строке
    for kind, ts, ref in (('ua', (0, .1), .2), ('th', (0,), .1), ('sk', (1.0,), .9)):
        new = res['LIMBS'][kind]; j = LIMB_TS.index(ref); oj = profile_at(LIMBS_461[kind], ref)
        for t in ts:
            i = LIMB_TS.index(t); oi = profile_at(LIMBS_461[kind], t)
            new[i] = [t] + [round(oi[k] * new[j][k + 1] / oj[k], 2) for k in range(4)]
    for kind in res['LIMBS']:
        res['LIMBS'][kind], st = F.limb_bone_fix(kind, 'L', res['LIMBS'][kind]); res['stats'][f'{kind} bones'] = st
    res['HEAD_R'], res['head_extra'] = F.head_grid(); res['head_top'] = F.head_top()
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fit', required=True); ap.add_argument('--base', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--chest-depth', type=float, default=None, help='наибольшая глубина груди (a + b у строк 38,8 и 42), см')
    a = ap.parse_args()
    F = Fitter(a.fit, a.base); res = fit_all(F, a.chest_depth)
    json.dump(res, open(a.out, 'w'), indent=1)
    for k, v in res['stats'].items():
        print(k, {kk: (round(vv, 2) if isinstance(vv, float) else vv) for kk, vv in v.items()})
    print('TORSO', res['TORSO']); print('LIMBS', res['LIMBS']); print('NECK', res['NECK']); print('HEAD', res['head_extra'])
    for h, d in zip(res['TORSO_DR']['h'], res['TORSO_DR']['dr']): print('DR', h, d)


if __name__ == '__main__':
    main()
