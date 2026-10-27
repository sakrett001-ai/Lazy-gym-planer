"""Корректирующие формы кожи Anny (build.py): смещения вершин в стойке, их включает угол сустава.

Где без них не обойтись — подмышка при руке вверх и в сторону, локоть и колено в полном сгибе, пах при глубоком сгибании
бедра: у вершин между двумя рамками скиннинг смешивает повороты на 90–170°, и кожа складывается внутрь или выпирает углом.
Форма считается в позе «сустав в конце амплитуды» (tools/anny-look/sculpt.js — те же рамки и тот же скиннинг, что в
приложении): вершины переходной полосы (доля рамок за суставом от 0,02 до 0,98) не дальше r см от центра сустава
сглаживаются по сетке (Таубин: λ 0,5 и μ −0,53, без усадки) с долей, плавно убывающей от сустава к краю круга: складки и
угол на сгибе расходятся, а вне круга ничего не меняется. (Лапласово редактирование всей полосы пробовали: у колена полоса
весов Anny — 28 см, и при сгибе 140° решение уводило голень на 20 см.) Смещение в стойке — Rᵀ (x − p): в приложении оно
добавляется до скиннинга и поворачивается смешанным поворотом вершины. Вес формы — «шатёр» по углу сустава: 0 при a0,
1 при a1 (угол позы формы), 0 при a2 (если задан).

Формы «к процедурной коже» (conform): в позе вершины полосы, отошедшие от процедурной кожи этой позы (части — свои у формы)
дальше KEEP см, тянутся к ней на избыток с долей круга (по градиенту её знакового расстояния, sculpt.js --sdf), сетка
сглаживается (Таубин, 4 прохода), и так до CONFORM_ITERS раз, пока избыток больше 2 мм; затем — то же сглаживание Таубина. Так у рук прямо вверх (174–177°): у вершин подмышки со стороны
корпуса смешанный поворот (0° у корпуса и 177° у плеча) выносит кожу вбок «крыльями» на 7–8 см от процедурной кожи;
Таубин складку не убирает. Формы строятся по очереди: в позе формы уже действуют прежние (с их весом в этой позе).
"""
import json, os, subprocess, tempfile
import numpy as np
import scipy.sparse as sp
from common import ROOT

HAND = ('hand',) + tuple(f'f{f}{k}' for f in range(5) for k in range(3))
FOREARM = ('fa', 'fd') + HAND
ARM = ('ua',) + FOREARM
SHANK = ('sk', 'foot', 'toes')
SPECS = [
    # имя, поза, угол (Mannequin.jointAngles[side]), a0, a2; полоса — вершины, у которых доля рамок за суставом (вся цепочка до
    # кисти или стопы) от 0,02 до 0,98, по каждому набору, и не дальше r см от центра сустава в позе (сустав, r); у форм
    # «к процедурной коже» — ещё (части процедурной кожи, KEEP см)
    ('armsSide', 'armsSide', 'elevation', 30, 160, (ARM, ('cl', 'sp') + ARM), ('sh', 14)),
    ('armsUp', 'armsUp', 'elevation', 90, None, (ARM, ('cl', 'sp') + ARM), ('sh', 14), (('torso', 'ua', 'sh', 'ac'), 2.0, None, None)),
    ('elbow', 'elbows', 'elbow', 60, None, (FOREARM,), ('el', 8)),
    ('knee', 'knees', 'knee', 60, None, (SHANK,), ('kn', 10)),
    ('hip', 'hips', 'hipFlex', 45, None, (('th',) + SHANK,), ('hip', 14)),
    ('armsOverhead', 'armsOverhead', 'elevation', 150, None, (ARM, ('cl', 'sp') + ARM), ('sh', 16), (('torso', 'ua', 'sh', 'ac'), 2.0, None, None)),
]
CONFORM_ITERS, CONFORM_TAUBIN = 8, 4   # шагов «подтянуть избыток (с долей круга) — сгладить» и проходов Таубина на шаг
TAUBIN = (.5, -.53, 30)   # λ, μ, проходов


def dq_from(S):
    """матрицы 3×4 по строкам (nf×12) → двойные кватернионы nf×8 [x y z w | dx dy dz dw] — как AnnySkin.dualQuats"""
    out = np.zeros((len(S), 8))
    for i, m in enumerate(S):
        m00, m01, m02, tx, m10, m11, m12, ty, m20, m21, m22, tz = m
        tr = m00 + m11 + m22
        if tr > 0: s = np.sqrt(tr + 1) * 2; w = .25 * s; x = (m21 - m12) / s; y = (m02 - m20) / s; z = (m10 - m01) / s
        elif m00 > m11 and m00 > m22: s = np.sqrt(1 + m00 - m11 - m22) * 2; w = (m21 - m12) / s; x = .25 * s; y = (m01 + m10) / s; z = (m02 + m20) / s
        elif m11 > m22: s = np.sqrt(1 + m11 - m00 - m22) * 2; w = (m02 - m20) / s; x = (m01 + m10) / s; y = .25 * s; z = (m12 + m21) / s
        else: s = np.sqrt(1 + m22 - m00 - m11) * 2; w = (m10 - m01) / s; x = (m02 + m20) / s; y = (m12 + m21) / s; z = .25 * s
        l = np.sqrt(x * x + y * y + z * z + w * w) * (-1 if w < 0 else 1); x, y, z, w = x / l, y / l, z / l, w / l
        out[i] = [x, y, z, w, .5 * (tx * w + ty * z - tz * y), .5 * (-tx * z + ty * w + tz * x), .5 * (tx * y - ty * x + tz * w), -.5 * (tx * x + ty * y + tz * z)]
    return out


def skin(P, wi, ww, DQ):
    """скиннинг двойными кватернионами (как в приложении): позиции и матрицы поворота вершин"""
    q = DQ[wi]                                   # n×4×8
    ref = q[:, 0, :4]; sgn = np.where(np.einsum('nkj,nj->nk', q[:, :, :4], ref) < 0, -1.0, 1.0)
    b = np.einsum('nk,nkj->nj', ww * sgn, q); l = np.linalg.norm(b[:, :4], axis=1, keepdims=True); b = b / l
    r, d = b[:, :3], b[:, 3:4]; dv, dw = b[:, 4:7], b[:, 7:8]
    c = np.cross(r, P) + d * P; pos = P + 2 * np.cross(r, c) + 2 * (d * dv - dw * r + np.cross(r, dv))
    x, y, z, w = r[:, 0], r[:, 1], r[:, 2], d[:, 0]
    Rm = np.stack([np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], 1),
                   np.stack([2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], 1),
                   np.stack([2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], 1)], 1)
    return pos, Rm


def adjacency(F, n):
    I = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]]); J = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = sp.coo_matrix((np.ones(len(I)), (I, J)), shape=(n, n)).tocsr(); A.data[:] = 1.0
    return A


def taubin(P, A, f, it=None):
    """сглаживание Таубина (λ, μ — без усадки) с долей f по вершинам (0 — неподвижна)"""
    deg = np.asarray(A.sum(1)).ravel(); X = P.copy(); lam, mu, it0 = TAUBIN; it = it or it0; k = f[:, None]
    for _ in range(it):
        for c in (lam, mu):
            avg = (A @ X) / np.maximum(deg, 1)[:, None]; X = X + c * k * (avg - X)
    return X


def sculpt_poses(frames):
    with tempfile.TemporaryDirectory() as tmp:
        fp = os.path.join(tmp, 'frames.json'); op = os.path.join(tmp, 'poses.json'); json.dump(frames, open(fp, 'w'))
        subprocess.run(['node', os.path.join(ROOT, 'tools/anny-look/sculpt.js'), fp, op], check=True)
        return json.load(open(op))


def proc_sdf(pose, pts, side, parts):
    with tempfile.TemporaryDirectory() as tmp:
        ip = os.path.join(tmp, 'in.json'); op = os.path.join(tmp, 'out.json')
        json.dump({'points': np.round(pts, 4).tolist(), 'side': side, 'parts': list(parts)}, open(ip, 'w'))
        subprocess.run(['node', os.path.join(ROOT, 'tools/anny-look/sculpt.js'), '--sdf', pose, ip, op], check=True)
        r = json.load(open(op))
    return np.array(r['d']), np.array(r['g'])


def tent(c, v):
    if v <= c['a1']: return float(np.clip((v - c['a0']) / (c['a1'] - c['a0']), 0, 1))
    return 1.0 if c.get('a2') is None else float(np.clip((c['a2'] - v) / (c['a2'] - c['a1']), 0, 1))


def build(Vcat, F, wi, ww, frames):
    """Vcat — вершины в стойке (каталог), wi/ww — четыре рамки и доли на вершину. Возвращает список форм для anny.json."""
    n = len(Vcat); A = adjacency(F, n); poses = sculpt_poses(frames); deg = np.asarray(A.sum(1)).ravel()
    fi = {f: i for i, f in enumerate(frames)}
    out = []
    for name, pose, angle, a0, a2, chains, (jk, r), *conf in SPECS:
        S = np.array(poses[pose]['S']).reshape(-1, 12); DQ = dq_from(S)
        for s in 'LR':
            # прежние формы (и левая этой же — у правой: круги сторон у таза перекрываются) — с их весом в этой позе
            V0 = Vcat.copy()
            for c in out:
                w = tent(c, poses[pose]['angles'][c['side']][c['angle']])
                if w > 0: V0[c['i']] += w * np.array(c['d']).reshape(-1, 3)
            Pp, Rm = skin(V0, wi, ww, DQ)
            band = np.zeros(n, bool) if chains else np.ones(n, bool)
            for chain in chains or ():
                ids = [fi[c + s] for c in chain]; wc = np.zeros(n)
                for k in range(4): wc += np.where(np.isin(wi[:, k], ids), ww[:, k], 0)
                band |= (wc > .02) & (wc < .98)
            dist = np.linalg.norm(Pp - np.array(poses[pose]['joints'][jk + s]), axis=1)
            fall = np.clip(1 - dist / r, 0, 1); fall = fall * fall * (3 - 2 * fall); fall[~band] = 0
            if not chains:   # полоса без цепочки (сидя): только своя сторона, переход через середину на ±2 см
                m = np.clip((Pp[:, 0] * (1 if s == 'L' else -1) + 2) / 4, 0, 1); fall *= m * m * (3 - 2 * m)
            ri = np.where(fall > 0)[0]
            if not len(ri): continue
            Q = Pp
            if conf:
                parts, keep_, keep_in, where = conf[0]; Q = Pp.copy()
                if where == 'below':   # ниже сустава (каталог: Y вниз)
                    fall[Pp[:, 1] < poses[pose]['joints'][jk + s][1] - 1.0] = 0; ri = np.where(fall > 0)[0]
                for _ in range(CONFORM_ITERS):
                    dd, gg = proc_sdf(pose, Q[ri], s, parts)
                    e = np.clip(dd - keep_, 0, None) - (np.clip(-dd - keep_in, 0, None) if keep_in is not None else 0)
                    if np.abs(e).max() < .2: break
                    Q[ri] -= gg * (e * fall[ri])[:, None]
                    Q = taubin(Q, A, fall, CONFORM_TAUBIN)
            X = taubin(Q, A, fall)
            D = np.einsum('nji,nj->ni', Rm[ri], X[ri] - Pp[ri])          # Rᵀ (x − p)
            keep = np.linalg.norm(D, axis=1) > .05
            a1 = float(poses[pose]['angles'][s][angle])
            c = {'name': f'{name}{s}', 'side': s, 'angle': angle, 'a0': a0, 'a1': round(a1, 2), 'i': ri[keep].tolist(), 'd': np.round(D[keep], 2).ravel().tolist()}
            if a2 is not None: c['a2'] = a2
            out.append(c)
            print(f'  форма {name}{s}: угол {angle} {a0}→{a1:.0f}' + (f'→{a2}' if a2 else '') + f', вершин {int(keep.sum())}, наибольшее смещение {np.linalg.norm(D, axis=1).max():.1f} см')
    return out
