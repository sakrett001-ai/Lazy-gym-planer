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

Рука прямо вверх (armsOverhead): круг — 24 см, сглаживание — SMOOTH_IT проходов. Угловатая полоса у подмышки при руках
вверх (жим над головой, подтягивания, висы, тяга сверху) — изломы кожи бока груди и заднего края подмышки в 14–20 см от
плечевого сустава: смешанный поворот корпуса и плеча (до 160°) меняется там на 20–25° на ребро сетки. С кругом 16 см эти
вершины в сглаживание почти не попадали (доля круга у его края — меньше 0,1); с кругом 24 см и 80 проходами рёбер с
изломом больше 40° в кадрах каталога с рукой выше 140° — на 12 % меньше, больше 25° — на 10 %, а складки крайних поз не
растут (что пробовали ещё и почему не взято — tools/anny-look/README.md, «Хвосты 4.72»).

Касание в полном сгибе (CONTACT: локоть — elbowIn при супинации и elbowInPro при пронации, колено — kneeIn): кожа дальнего
и ближнего сегментов на внутренней стороне сгиба проходит сама в себя (двуглавая мышца в предплечье, икра в бедро). У
человека мягкие ткани там сжимаются по поверхности касания; форма ставит её на биссекторную плоскость сгиба (через центр
сустава, между направлениями сегментов): вершины дальнего сегмента (доля его рамок больше половины), зашедшие за плоскость к
ближнему, и наоборот, сдвигаются к ней по нормали, но остаются на 0,2 см за ней (CONTACT_EPS: края смыкаются без щели —
щель снаружи видна тёмной прорезью); у вершин с долей рамок около половины сдвиг меньше (CONTACT_SIGN); только на внутренней
стороне сгиба (CONTACT_INNER см от центра сустава вдоль биссектрисы) и в круге формы; между проходами — лёгкое сглаживание.
Поза формы у локтя — 145° при пронации −60° и при 60° (у жима над головой и отжиманий внизу пронация 47–70°: форма,
построенная только при супинации, складки в них поднимала); второй угол формы (angle2: пронация, доля 0 при b0 и 1 при b1)
выбирает её. Вес по сгибу — от 100° у локтя и 95° у колена: складки появляются там.
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
    ('armsOverhead', 'armsOverhead', 'elevation', 150, None, (ARM, ('cl', 'sp') + ARM), ('sh', 24), (('torso', 'ua', 'sh', 'ac'), 2.0, None, None)),
    # касание в полном сгибе (CONTACT): полоса — вся конечность своей стороны
    ('elbowIn', 'elbows', 'elbow', 100, None, None, ('el', 9)),
    ('elbowInPro', 'elbowsPro', 'elbow', 100, None, None, ('el', 9)),
    ('kneeIn', 'knees', 'knee', 95, None, None, ('kn', 11)),
]
CONFORM_ITERS, CONFORM_TAUBIN = 8, 4   # шагов «подтянуть избыток (с долей круга) — сгладить» и проходов Таубина на шаг
TAUBIN = (.5, -.53, 30)   # λ, μ, проходов
SMOOTH_IT = {'armsOverhead': 80}   # проходов Таубина у формы (иначе — TAUBIN)
# касание в полном сгибе: сустав, ближний и дальний суставы (направления сегментов), цепочка дальнего сегмента, цепочка
# всей конечности (вершины своей стороны — доля её рамок больше половины)
LIMB_ARM, LIMB_LEG = ('ua',) + FOREARM, ('th',) + SHANK
CONTACT = {'elbowIn': ('el', 'sh', 'wr', FOREARM, LIMB_ARM), 'elbowInPro': ('el', 'sh', 'wr', FOREARM, LIMB_ARM), 'kneeIn': ('kn', 'hip', 'an', SHANK, LIMB_LEG)}
CONTACT_EPS, CONTACT_INNER, CONTACT_PASSES, CONTACT_SIGN = -.2, 3.0, 3, 4.0
# второй угол формы: (угол, b0 — доля 0, b1 — доля 1): касание в локте при супинации и при пронации предплечья
SECOND = {'elbowIn': ('pron', 20, -20), 'elbowInPro': ('pron', -20, 20)}


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


def tent(c, v, angles=None):
    """вес формы по углу сустава v («шатёр» a0 → a1 → a2) и, если у формы есть второй угол (angle2: b0 → 0, b1 → 1), — на
    его долю (angles — углы стороны формы в позе)"""
    if v <= c['a1']: w = float(np.clip((v - c['a0']) / (c['a1'] - c['a0']), 0, 1))
    else: w = 1.0 if c.get('a2') is None else float(np.clip((c['a2'] - v) / (c['a2'] - c['a1']), 0, 1))
    if c.get('angle2') and angles is not None:
        w *= float(np.clip((angles[c['angle2']] - c['b0']) / (c['b1'] - c['b0']), 0, 1))
    return w


def build(Vcat, F, wi, ww, frames):
    """Vcat — вершины в стойке (каталог), wi/ww — четыре рамки и доли на вершину. Возвращает список форм для anny.json."""
    n = len(Vcat); A = adjacency(F, n); poses = sculpt_poses(frames)
    fi = {f: i for i, f in enumerate(frames)}
    chain_w = lambda names: sum(np.where(np.isin(wi[:, k], [fi[c] for c in names]), ww[:, k], 0) for k in range(4))
    out = []
    for name, pose, angle, a0, a2, chains, (jk, r), *conf in SPECS:
        S = np.array(poses[pose]['S']).reshape(-1, 12); DQ = dq_from(S); J = poses[pose]['joints']
        for s in 'LR':
            # прежние формы (и левая этой же — у правой: круги сторон у таза перекрываются) — с их весом в этой позе
            V0 = Vcat.copy()
            for c in out:
                w = tent(c, poses[pose]['angles'][c['side']][c['angle']], poses[pose]['angles'][c['side']])
                if w > 0: V0[c['i']] += w * np.array(c['d']).reshape(-1, 3)
            Pp, Rm = skin(V0, wi, ww, DQ)
            if name in CONTACT:
                band = chain_w([c + s for c in CONTACT[name][4]]) > .5
            else:
                band = np.zeros(n, bool) if chains else np.ones(n, bool)
                for chain in chains or ():
                    wc = chain_w([c + s for c in chain]); band |= (wc > .02) & (wc < .98)
            dist = np.linalg.norm(Pp - np.array(J[jk + s]), axis=1)
            fall = np.clip(1 - dist / r, 0, 1); fall = fall * fall * (3 - 2 * fall); fall[~band] = 0
            if not chains and name not in CONTACT:   # полоса без цепочки (сидя): только своя сторона, переход через середину на ±2 см
                m = np.clip((Pp[:, 0] * (1 if s == 'L' else -1) + 2) / 4, 0, 1); fall *= m * m * (3 - 2 * m)
            ri = np.where(fall > 0)[0]
            if not len(ri): continue
            Q = Pp
            if conf:
                parts, keep_, keep_in, where = conf[0]; Q = Pp.copy()
                if where == 'below':   # ниже сустава (каталог: Y вниз)
                    fall[Pp[:, 1] < J[jk + s][1] - 1.0] = 0; ri = np.where(fall > 0)[0]
                for _ in range(CONFORM_ITERS):
                    dd, gg = proc_sdf(pose, Q[ri], s, parts)
                    e = np.clip(dd - keep_, 0, None) - (np.clip(-dd - keep_in, 0, None) if keep_in is not None else 0)
                    if np.abs(e).max() < .2: break
                    Q[ri] -= gg * (e * fall[ri])[:, None]
                    Q = taubin(Q, A, fall, CONFORM_TAUBIN)
            X = contact(Q, A, fall, J, s, CONTACT[name], chain_w) if name in CONTACT else taubin(Q, A, fall, SMOOTH_IT.get(name))
            D = np.einsum('nji,nj->ni', Rm[ri], X[ri] - Pp[ri])          # Rᵀ (x − p)
            keep = np.linalg.norm(D, axis=1) > .05
            a1 = float(poses[pose]['angles'][s][angle])
            c = {'name': f'{name}{s}', 'side': s, 'angle': angle, 'a0': a0, 'a1': round(a1, 2), 'i': ri[keep].tolist(), 'd': np.round(D[keep], 2).ravel().tolist()}
            if a2 is not None: c['a2'] = a2
            if name in SECOND: c['angle2'], c['b0'], c['b1'] = SECOND[name]
            out.append(c)
            print(f'  форма {name}{s}: угол {angle} {a0}→{a1:.0f}' + (f'→{a2}' if a2 else '') + (f', {c["angle2"]} {c["b0"]}→{c["b1"]}' if name in SECOND else '') + f', вершин {int(keep.sum())}, наибольшее смещение {np.linalg.norm(D, axis=1).max():.1f} см')
    return out


def contact(Q, A, fall, J, s, spec, chain_w):
    """касание в полном сгибе (шапка): вершины на внутренней стороне сгиба, зашедшие за биссекторную плоскость к другому
    сегменту, — к ней (с перекрытием CONTACT_EPS), CONTACT_PASSES раз со сглаживанием между проходами"""
    jk, pk, dk, dist_chain, _ = spec; J0 = np.array(J[jk + s])
    u = np.array(J[pk + s]) - J0; u /= np.linalg.norm(u); f = np.array(J[dk + s]) - J0; f /= np.linalg.norm(f)
    b = u + f; b /= np.linalg.norm(b); nrm = f - u; nrm /= np.linalg.norm(nrm)      # биссектриса внутрь сгиба; нормаль плоскости — к дальнему
    wd = chain_w([c + s for c in dist_chain]); sgn = np.where(wd > .5, 1.0, -1.0); ks = np.clip(np.abs(wd - .5) * CONTACT_SIGN, 0, 1)

    def project(X):
        inner = np.clip(((X - J0) @ b) / CONTACT_INNER, 0, 1); inner = inner * inner * (3 - 2 * inner)
        over = np.clip(CONTACT_EPS - sgn * ((X - J0) @ nrm), 0, None) * (fall > 0) * inner * ks
        return X + (sgn * over)[:, None] * nrm[None, :]
    X = Q.copy()
    for _ in range(CONTACT_PASSES): X = taubin(project(X), A, fall * .5, 6)
    return project(X)
