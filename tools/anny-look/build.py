"""Сборка кожи Anny «только внешний вид» для приложения (шаг 1 из 2: python → qa/anny-look/anny.json; шаг 2 — pack.js).

python3 tools/anny-look/build.py [--out qa/anny-look/anny.json]

Нужны: пакет anny 0.6.1 (pip install --break-system-packages anny; torch — с PyPI), trimesh, scipy; данные манекена —
node tools/anny-look/export.js (qa/anny-look/mannequin.json). Сборка детерминирована: одни и те же пакеты дают тот же файл
(torch — в один поток, дальше — float64).

1. Сетка: подтянутая Anny (anny_look.AnnyLook: одобренные фенотип и местные формы, шлифовка look.json + fit.json) в
   нейтральной стойке манекена 4.61.0, без глаз и полости рта (главная связная часть). Координаты — каталог (см, Y вниз,
   пол 186), как у рамок позы (Mannequin.catalogPose). Глазницы закрыты гладкой заплаткой (anny_look.AnnyLook.neutral_face),
   пах — «как в плавках»: клин между бёдрами закрыт, поверх — гладкий купол (anny_look.AnnyLook.pouch).
   --shape reference — эталон для листа (Anny по умолчанию, anny_look.REFERENCE), не для приложения.
2. Веса — перенос с рига Anny на сегменты манекена (рамки позы): ключица → cl, лопатка (shoulder01) → sp, плечо → ua,
   предплечье → fa и fd (доля fd растёт от локтя к запястью линейно, как закрутка сечений процедурной кожи), запястье и пясть
   → hand, фаланги → рамки фаланг пальцев (по суставам пальцев хвата, как у скелета), бедро → th, голень → sk, стопа → foot,
   пальцы стопы → toes, шея → neck, голова → head. Корпус (root, pelvis, spine05…01) — одна доля, которая делится между
   pelvis, lumbar и thorax по высоте над тазобедренными и по углу сечения — по тем же скруглениям шарниров поясницы, что у
   процедурной кожи (TORSO_BLEND, TORSO_BLEND_FRONT, FRONT_W): у Anny пять позвонков рига, у манекена — два шарнира.
   Четыре наибольших веса на вершину, сумма — 1.
3. Адрес вершины на процедурной коже (часть, сторона, h и угол или t и угол, у дельтовидной — полярный угол и азимут на
   «шапке» плеча) — по ближайшей видимой точке процедурной кожи: по нему приложение красит мышечные зоны тем же правилом,
   что области манекена (MANNEQUIN_TORSO_PATCHES и др., 09d-catalog-muscles.js).
4. Корректирующие формы (correctives.py) — смещения вершин в стойке, их включает угол сустава.
5. Затенённость впадин (shade, байт на вершину: доля открытого неба 0…1) — bake_shade: запечённое в стойке «окружающее
   затенение» по точкам кожи (без лучей — детерминированно, numpy).
"""
import argparse, hashlib, json, os, subprocess, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import common as C
from anny_look import AnnyLook, q_from, FIT, FINGER_BONES
import correctives as CR

FLOOR = 186.0
CENTRAL = ['pelvis', 'lumbar', 'thorax', 'neck', 'head']
SIDE_FRAMES = ['cl', 'sp', 'ua', 'fa', 'fd', 'hand', 'th', 'sk', 'foot', 'toes'] + [f'f{f}{k}' for f in range(5) for k in range(3)]
FRAMES = CENTRAL + [n + s for s in 'LR' for n in SIDE_FRAMES]
PART_CODE = {'torso': 1, 'ua': 2, 'fa': 3, 'th': 4, 'sk': 5, 'delt': 6}
CAVITY_CODE = 7          # выстилка рта: вершина не на видимой коже (областей мышц и проверок отхода нет)


SMOOTH_ITERS = 10


def rigid_mask(W, frames):
    """вершины, веса которых не сглаживаются: пальцы кисти и голова (больше половины веса); ладонь и запястье сглаживаются
    (иначе на сгибе запястья кожа складывается), стопа — по правилу процедурной стопы (foot_split)"""
    idx = [i for i, f in enumerate(frames) if f.startswith('head') or (f[0] == 'f' and f[1].isdigit())]
    return W[:, idx].sum(1) > .5


SH_GEO = 4.0             # доля плеча (ua) на стороне корпуса — до 0 на 4 см по коже от линии сгиба Anny (доля руки 0,5)
HIP_GEO = 6.0            # доля бедра (th) на стороне корпуса — до 0 на 6 см по коже от линии сгиба Anny (доля ноги 0,5)
SH_FRONT = 1.0           # лопатка (sp) — только сзади: спереди от плоскости на 1 см впереди сустава её доля уходит ключице


def limb_limit(W, V, F, J, fi, Wa, limbs):
    """Плечо и бедро не тянут за собой кожу корпуса. У Anny малые доли кости плеча (upperarm01, 0,02–0,2) лежат по всей
    груди и верху спины, у кости «shoulder01» — и спереди на груди: в её риге плечо поднимается на 30–40°, а у манекена
    рука идёт над голову на 160–170° и лопатка поворачивается вверх на 50° — кожа бока и груди со смешанным поворотом
    выходила «крыльями» (прыжки с разведением рук, руки над головой). Так же доли бедра после сглаживания заходили на
    крестец, и при сгибании бедра («велосипед», скручивания) кожа крестца уходила в пол. У процедурной кожи грудь, спина и
    крестец за конечностью не поворачиваются. Поэтому на стороне корпуса от линии сгиба Anny (где у неё доля всей руки или
    ноги 0,5) доля ua и th убывает до 0 на SH_GEO и HIP_GEO см по коже (путь по коже от руки до бока груди идёт через
    подмышку), ушедшая доля плеча — рамке ключицы (сдвиг и подъём надплечий, как у процедурной кожи), бедра — тазу;
    сторона конечности — как у Anny (если срезать и её, кожа подмышки остаётся у корпуса и тянется перепонкой). Доля sp
    спереди — тоже ключице."""
    import scipy.sparse as sp_, scipy.sparse.csgraph as cg
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); L = np.linalg.norm(V[E[:, 0]] - V[E[:, 1]], axis=1)
    G = sp_.coo_matrix((np.concatenate([L, L]), (np.concatenate([E[:, 0], E[:, 1]]), np.concatenate([E[:, 1], E[:, 0]]))), shape=(len(V), len(V))).tocsr()
    for s, g in (('L', 1), ('R', -1)):
        for limb, child, parent, reach in (('arm', 'ua' + s, 'cl' + s, SH_GEO), ('leg', 'th' + s, 'pelvis', HIP_GEO)):
            if limb not in limbs:
                continue
            inside = Wa[limb + s] >= .5
            dist = cg.dijkstra(G, directed=False, indices=np.where(inside)[0], min_only=True, limit=reach + 1)
            u = np.clip(1 - dist / reach, 0, 1); keep = np.where(inside, 1.0, u * u * (3 - 2 * u))
            moved = W[:, fi[child]] * (1 - keep); W[:, fi[child]] -= moved; W[:, fi[parent]] += moved
        if 'arm' not in limbs:
            continue
        sp, cl = fi['sp' + s], fi['cl' + s]
        gh = np.asarray(J['sh' + s]); f = np.clip((V[:, 2] - gh[2] - SH_FRONT) / 3.0, 0, 1); front = f * f * (3 - 2 * f)
        moved = W[:, sp] * front; W[:, sp] -= moved; W[:, cl] += moved
    return W


def foot_blend_w(p, g):
    """доля рамки пальцев стопы — Mannequin.footBlendW: линия сгиба косая, как линия головок плюсневых костей
    (у первой — z ≈ 13,7, у пятой — z ≈ 10,7), ширина перехода ±1,6 см; p — в рамке стопы (x — влево, z — вперёд)"""
    m = np.clip(-g * p[:, 0], -4.5, 5); zc = 12.2 + .375 * m; u = np.clip((p[:, 2] - zc + 1.6) / 3.2, 0, 1)
    return u * u * (3 - 2 * u)


def foot_split(W, V, frames, D):
    """стопа и пальцы стопы: их общая доля делится по правилу процедурной стопы (сгиб у плюснефаланговых суставов — там,
    где гнётся процедурная стопа и где её рамка пальцев поворачивается); у Anny сгиб пальцев резкий и в другом месте —
    при подъёме на носки и в упоре лёжа кожа над пальцами выворачивалась"""
    fi = {f: i for i, f in enumerate(frames)}
    for s, g in (('L', 1), ('R', -1)):
        fr = D['frames']['foot' + s]; o = np.array(fr['o']); R = np.stack([fr['x'], fr['y'], fr['z']], 1)
        p = (V - o) @ R; w = foot_blend_w(p, g)
        a, b = fi['foot' + s], fi['toes' + s]; tot = W[:, a] + W[:, b]
        W[:, a] = tot * (1 - w); W[:, b] = tot * w
    return W


def smooth_weights(W, F, mask, iters, alpha=.5):
    """лапласово сглаживание весов (равные соседи) у вершин mask; сумма весов остаётся 1"""
    from anny_look import neighbors
    A = neighbors(F, len(W)); deg = np.asarray(A.sum(1)).ravel(); m = mask[:, None]
    for _ in range(iters):
        avg = (A @ W) / np.maximum(deg, 1)[:, None]
        W = np.where(m, (1 - alpha) * W + alpha * avg, W)
    return W / W.sum(1, keepdims=True)


def ramp(u, e):
    if e <= 0: return u
    r = 1 / (1 - e)
    return np.where(u < e, r * u * u / (2 * e), np.where(u > 1 - e, 1 - r * (1 - u) * (1 - u) / (2 * e), r * (e / 2 + u - e)))


def smooth(t):
    t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)


def trunk_split(h, ang, D):
    """доли pelvis, lumbar, thorax по высоте h (над тазобедренными) и углу сечения ang (0 — передняя линия):
    те же скругления, что spineFrame/torsoFrame манекена"""
    def scheme(zones):
        # доля «выше шарнира» для каждого из двух шарниров: 0 — ниже скругления, 1 — выше
        a = []
        for j, hj, lo, hi, e in zones:
            u = np.clip((h - hj + lo) / (lo + hi), 0, 1); a.append(ramp(u, e))
        return a
    s1, s2 = scheme(D['TORSO_BLEND']); f1, f2 = scheme(D['TORSO_BLEND_FRONT'])
    fw = D['FRONT_W']; kf = 1 - smooth((ang - fw[0]) / (fw[1] - fw[0]))
    kf = np.where((h > D['FRONT_H'][0]) & (h < D['FRONT_H'][1]), kf, 0.0)
    a1 = s1 * (1 - kf) + f1 * kf; a2 = s2 * (1 - kf) + f2 * kf
    # цепочка: pelvis —(шарнир 1)→ lumbar —(шарнир 2)→ thorax
    wt = a2; wl = a1 - a2; wl = np.clip(wl, 0, 1); wp = 1 - a1
    return np.clip(wp, 0, 1), wl, np.clip(wt, 0, 1)


def ground_feet(V, W, labels):
    """Стопы — на полу. Подошва Anny в стойке оказывалась на 1,1 см выше пола: стопа стоит на нашем голеностопе, а у Anny
    голеностоп ниже над подошвой, чем у процедурной стопы (у той подошва — на полу, 186,0). Стопа опускается к полу целиком
    (по доле костей стопы и пальцев в риге Anny), лодыжка над ней растягивается по той же доле."""
    for s in 'LR':
        w = sum(W[:, i] for i, lab in enumerate(labels) if lab.endswith('.' + s) and lab.startswith(('foot', 'toe')))
        sole = V[w > .5, 1].min()
        V[:, 1] -= sole * w
    return V


SHADE_R = 10.0           # радиус затенения, см: впадины масштаба мышц и суставов (ключица, край грудной, пресс, ягодичная складка)
SHADE_GROUPS = {'T': 'T LL LR', 'LL': 'LL T', 'LR': 'LR T', 'AL': 'AL', 'AR': 'AR'}


def shade_group(frame):
    """группа рамки для затенения: корпус с головой, рука, нога (по стороне)"""
    if frame in CENTRAL or frame[:2] in ('cl', 'sp'): return 'T'
    s = frame[-1]
    return ('L' if frame[:2] in ('th', 'sk') or frame[:4] in ('foot', 'toes') else 'A') + s


def bake_shade(V, F, dom):
    """Запечённая затенённость впадин в стойке (ambient occlusion по точкам, как у Bunnell, GPU Gems 2, гл. 14): каждая
    вершина — диск площадью в треть смежных треугольников; вершина p затеняется дисками q ближе SHADE_R, повёрнутыми к ней
    и лежащими над её касательной плоскостью: A·cos θp·cos θq / (π d² + A), с затуханием (1 − d/R)². Затеняют только части,
    которые от позы не уходят: корпус — корпус и бёдра (ягодичная и паховая складки), нога — своя нога и корпус, рука —
    только своя рука (рука у бока в стойке не должна оставлять тень на рёбрах, когда она поднята). Без лучей — сумма по
    точкам в float64 (numpy, cKDTree): сборка детерминирована. Возвращает долю открытого неба 0…1."""
    import trimesh
    from scipy.spatial import cKDTree
    m = trimesh.Trimesh(V, F, process=False); N = np.asarray(m.vertex_normals)
    area = np.zeros(len(V)); np.add.at(area, F.ravel(), np.repeat(m.area_faces / 3, 3))
    grp = np.array([shade_group(f) for f in dom]); used = area > 0
    tree = cKDTree(V); occ = np.zeros(len(V))
    allow = {g: np.isin(grp, SHADE_GROUPS[g].split()) & used for g in SHADE_GROUPS}
    for p in np.where(used)[0]:
        nb = np.array(sorted(tree.query_ball_point(V[p], SHADE_R)), dtype=np.int64)
        nb = nb[allow[grp[p]][nb] & (nb != p)]
        if not len(nb): continue
        d = V[nb] - V[p]; r = np.linalg.norm(d, axis=1); ok = r > 1e-6; nb, d, r = nb[ok], d[ok], r[ok]
        cr = np.clip(d @ N[p] / r, 0, 1); ce = np.clip(-np.einsum('ij,ij->i', N[nb], d) / r, 0, 1)
        occ[p] = np.sum(area[nb] * cr * ce / (np.pi * r * r + area[nb]) * (1 - r / SHADE_R) ** 2)
    vis = np.clip(1 - occ, 0, 1)
    # два шага сглаживания по сетке: точки — не лучи, но на редкой сетке пах и подмышка дают пятна в одну вершину
    from anny_look import neighbors
    A = neighbors(F, len(V)); deg = np.asarray(A.sum(1)).ravel()
    for _ in range(2): vis = np.where(used, .5 * vis + .5 * (A @ vis) / np.maximum(deg, 1), vis)
    return vis


def pouch_correctives(back, o):
    """Плавки при сгибании бедра: купол (anny_look.AnnyLook.pouch) лежит в складке между тазом и бёдрами; при сгибании
    бедра больше 90° (присед, сидя, «велосипед») бедро поднимается к нему, и треугольники купола и складки переворачиваются
    (вывороты — tools/anny-look/check.js). Форма возвращает купол к прежнему клину (его же смещение с обратным знаком) — по
    половине на каждое бедро: вес — «шатёр» по углу сгибания бедра hipFlex (back: от и до, доля); при одном согнутом бедре
    (выпад) купол уходит наполовину. Одна форма на обе стороны (side 'LR': вес — среднее весов бёдер, AnnySkin.correctiveWeights)
    — то же, что две половинные по сторонам, при вдвое меньшей работе вершинного шейдера. Смещения — в стойке (каталог: Y вниз)."""
    a0, a1, k = o['back']
    if not k: return []
    m = np.linalg.norm(back, axis=1) > .05; i = np.where(m)[0]
    d = back[i] * np.array([1, -1, 1]) * k
    print(f'  форма pouch: угол hipFlex {a0}→{a1} (среднее бёдер), вершин {len(i)}, наибольшее смещение {np.linalg.norm(d, axis=1).max():.1f} см')
    return [{'name': 'pouch', 'side': 'LR', 'angle': 'hipFlex', 'a0': a0, 'a1': a1, 'i': i.tolist(), 'd': np.round(d, 2).ravel().tolist()}]


def build(out_path, mannequin=None, shape='look'):
    P = C.Procedural(mannequin) if mannequin else C.Procedural(); D = P.D; body = AnnyLook(shape); fit = json.load(open(FIT))
    phen, local = body.params(fit); rest = body.rest(phen, local); q = q_from(fit['pose'])
    hands = D['hands']
    V, Hw, G, heads = body.stance(rest, P.J, q, hands, groin=False)
    V = body.neutral_throat(body.neutral_face(V, Hw), Hw)
    pouch_back = None
    if shape == 'look':
        V0 = V; V = body.pouch(V, body.look['pouch'])
        # обратный ход купола (корректирующая форма «плавки при сгибании бедра», ниже): к прежнему клину; сваренные вершины —
        # по средней линии (x не меняется)
        pouch_back = V0 - V; pouch_back[[i for i, _ in body.pouch_welded], 0] = 0
        # разложенные по передней поверхности (верх купола): их сдвиг к клину у каждой свой (из глубины клина), и при сгибании
        # бедра верх купола сминался бы; ход назад здесь — гармоническое продолжение хода соседей (гладкий), раскладка по x
        # и высоте остаётся
        if body.pouch_front is not None and body.pouch_layout.any():
            from anny_look import fair
            pouch_back[body.pouch_layout, :2] = 0
    F = body.skin_faces; used = np.unique(F); remap = -np.ones(len(V), np.int64); remap[used] = np.arange(len(used))
    V = V[used]; F = remap[F]; W = body.weights[used]          # плотные веса Anny по 104 костям
    if pouch_back is not None: pouch_back = pouch_back[used]; pin = body.pouch_pin[used]
    apex = body.pouch_apex[used] if shape == 'look' and body.pouch_apex is not None else None
    labels = body.labels; L = body.idx; n = len(V)
    V = ground_feet(V, W, labels)

    # ---------- перенос весов ----------
    J = P.J; hipY = (J['hipL'][1] + J['hipR'][1]) / 2
    Wo = np.zeros((n, len(FRAMES))); fi = {k: i for i, k in enumerate(FRAMES)}
    trunk = np.zeros(n); fore = {s: np.zeros(n) for s in 'LR'}
    for b, lab in enumerate(labels):
        w = W[:, b]
        if not w.any(): continue
        if lab in ('root',) or lab.startswith(('pelvis', 'spine')): trunk += w; continue
        if lab.startswith('neck'): Wo[:, fi['neck']] += w; continue
        if lab in ('head', 'eye.L', 'eye.R'): Wo[:, fi['head']] += w; continue
        s = lab[-1]; base = lab[:-2]
        if base == 'clavicle': k = 'cl'
        elif base == 'shoulder01': k = 'sp'
        elif base.startswith('upperarm'): k = 'ua'
        elif base.startswith('lowerarm'): fore[s] += w; continue
        elif base == 'wrist' or base.startswith('metacarpal'): k = 'hand'
        elif base.startswith('finger'):
            f, kk = base[6:].split('-'); k = f'f{int(f) - 1}{int(kk) - 1}'
        elif base.startswith('upperleg'): k = 'th'
        elif base.startswith('lowerleg'): k = 'sk'
        elif base == 'foot': k = 'foot'
        elif base.startswith('toe'): k = 'toes'
        else: raise ValueError('кость без сегмента: ' + lab)
        Wo[:, fi[k + s]] += w
    # предплечье: fa → fd по доле длины от локтя к запястью
    for s in 'LR':
        e, w_ = J['el' + s], J['wr' + s]; ax = w_ - e; t = np.clip(((V - e) @ ax) / (ax @ ax), 0, 1)
        Wo[:, fi['fa' + s]] += fore[s] * (1 - t); Wo[:, fi['fd' + s]] += fore[s] * t
    # корпус: по высоте и углу сечения (адрес на процедурной коже — ниже; здесь угол по положению вершины)
    sd, ii = P.query(V)
    h = V[:, 1] - hipY
    ang_geo = np.arctan2(np.abs(V[:, 0]), V[:, 2])
    on_torso = np.array([p.startswith('torso') for p in P.part[ii]])
    ang = np.where(on_torso, P.a2[ii], ang_geo)
    wp, wl, wt = trunk_split(h, ang, D)
    Wo[:, fi['pelvis']] += trunk * wp; Wo[:, fi['lumbar']] += trunk * wl; Wo[:, fi['thorax']] += trunk * wt
    Wa = {}
    for s in 'LR':
        Wa['arm' + s] = sum(W[:, i] for n, i in L.items() if n.endswith('.' + s) and n.startswith(('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal')))
        Wa['leg' + s] = sum(W[:, i] for n, i in L.items() if n.endswith('.' + s) and n.startswith(('upperleg', 'lowerleg', 'foot', 'toe')))
    # сглаживание весов по сетке (кроме кистей, стоп и головы): у Anny веса — с рваными краями (в плече и подмышке доли
    # кисти рига 0,02–0,1 обрываются по рёбрам сетки), а у манекена соседние рамки поворачиваются на 100–170° — на коже швы
    # плечо — до сглаживания (сглаживание смягчает срез, иначе кожа подмышки при руках вверх тянется перепонкой), бедро —
    # после (сглаживание заново разносит долю бедра на крестец)
    Wo = limb_limit(Wo, V, F, J, fi, Wa, ('arm',))
    Wo = smooth_weights(Wo, F, ~rigid_mask(Wo, FRAMES), SMOOTH_ITERS)
    Wo = limb_limit(Wo, V, F, J, fi, Wa, ('leg',))
    Wo = foot_split(Wo, V, FRAMES, D)
    if shape == 'look' and body.look['pouch'].get('smooth'):
        # пах: веса сглажены сильнее (переход таз — бёдра шире): у купола и столбцов касания бёдер за ним при сгибании и
        # отведении бедра треугольники иначе переворачиваются (tools/anny-look/check.js, вывороты)
        sm = body.look['pouch']['smooth']
        for it, bx, by0, by1, bz0, bz1 in (sm if isinstance(sm[0], list) else [sm]):
            gm = (np.abs(V[:, 0]) < bx) & (V[:, 1] > by0) & (V[:, 1] < by1) & (V[:, 2] > bz0) & (V[:, 2] < bz1)
            Wo = smooth_weights(Wo, F, gm, it)
        # низ купола по средней линии — за тазом (anny_look.AnnyLook.pouch, pin)
        Wo = Wo * (1 - pin[:, None]); Wo[:, fi['pelvis']] += pin
    # четыре наибольших — непрерывно: из них вычитается пятый (иначе на границе, где пятый становится четвёртым, — скачок)
    order = np.argsort(-Wo, 1); w5 = np.take_along_axis(Wo, order[:, 4:5], 1); order = order[:, :4]
    wv = np.maximum(np.take_along_axis(Wo, order, 1) - w5, 0); wv = wv / wv.sum(1, keepdims=True)
    # округление до 1/255 с суммой ровно 255 (в файле — байты)
    wq = np.floor(wv * 255 + .5).astype(int); wq[:, 0] += 255 - wq.sum(1)
    order = np.where(wq > 0, order, 0)

    # ---------- адрес на процедурной коже ----------
    code = np.zeros(n, int); side = np.zeros(n, int); a1 = np.zeros(n); a2 = np.zeros(n)
    dom = np.array(labels)[body.dominant[used]]
    handfoot = np.array([l.startswith(('wrist', 'finger', 'metacarpal', 'foot', 'toe', 'head', 'eye')) for l in dom])
    # точка процедурной кожи под вершиной — ближайшая из тех, чья нормаль смотрит туда же (cos > 0,3): кожа Anny отстоит от
    # процедурной на 1–3 см, и у угла (бок таза над бедром, подмышка) ближайшей оказывалась точка соседней части за углом —
    # у боковой ягодичной было вдвое меньше вершин, чем у процедурной кожи (по доле видимой площади)
    Nv = np.zeros_like(V); fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    for k in range(3): np.add.at(Nv, F[:, k], fn)
    Nv /= np.maximum(np.linalg.norm(Nv, axis=1, keepdims=True), 1e-12)
    _, ik = P.tree.query(V, k=16); ok = np.einsum('nkj,nj->nk', P.N[ik], Nv) > .3
    ia = np.where(ok.any(1), ik[np.arange(n), np.argmax(ok, 1)], ii)
    for j in range(n):
        if handfoot[j]: continue
        part = P.part[ia[j]]
        if part.startswith('torso'): code[j] = 1; side[j] = 0 if part.endswith('L') else 1; a1[j] = P.a1[ia[j]]; a2[j] = P.a2[ia[j]]
        elif part[:2] in ('ua', 'fa', 'th', 'sk') and len(part) == 3:
            code[j] = PART_CODE[part[:2]]; side[j] = 0 if part[2] == 'L' else 1; a1[j] = P.a1[ia[j]]; a2[j] = P.a2[ia[j]]
    # дельтовидная: по направлению от центра «шапки» плеча в рамке плеча — у вершин плечевого пояса и верха плеча
    for s, si in (('L', 0), ('R', 1)):
        g = next(g for g in D['grids'] if g['name'] == 'cap-sh' + s); c = np.array(g['addr']['c'])
        fr = D['frames']['ua' + s]; uy = np.array(fr['y']); uz = np.array(fr['z']); lat = np.array(fr['x']) * (1 if s == 'L' else -1)
        d = V - c; r = np.linalg.norm(d, axis=1); dn = d / np.maximum(r, 1e-9)[:, None]
        polar = np.arccos(np.clip(dn @ uy, -1, 1)); az = np.arctan2(dn @ lat, dn @ uz)
        armw = Wo[:, [fi['ua' + s], fi['sp' + s], fi['cl' + s]]].sum(1)
        near_part = np.array([p in ('cap-sh' + s, 'cap-ac' + s) or (p == 'ua' + s) for p in P.part[ia]])
        sel = (armw > .3) & (r < 10) & (polar < 1.75) & (near_part | (code == 0)) & ~((code == 2) & (a1 > .3))
        code[sel] = 6; side[sel] = si; a1[sel] = polar[sel]; a2[sel] = az[sel]
    code[body.cavity[used]] = CAVITY_CODE

    # ---------- затенённость впадин (в стойке) ----------
    shade = np.floor(bake_shade(V, F, [FRAMES[i] for i in order[:, 0]]) * 255 + .5).astype(int)

    # ---------- в каталог ----------
    cat = V.copy(); cat[:, 1] = FLOOR - cat[:, 1]
    cat = np.round(cat, 2)

    # ---------- корректирующие формы (по тем же данным, что попадут в файл: координаты до 0,01 см, доли — байты) ----------
    corr = CR.build(cat, F, order, wq / 255.0, FRAMES)
    if pouch_back is not None: corr += pouch_correctives(pouch_back, body.look['pouch'])
    if apex is not None and apex.any():
        # веер у вершины клина (anny_look.AnnyLook.pouch, apex_after): гладкая заплатка после корректирующих форм, его
        # вершины из форм убраны (их смещения считались по вееру до заплатки)
        from anny_look import fair
        cat = np.round(fair(cat, F, apex), 2); ai = set(np.where(apex)[0].tolist())
        for c in corr:
            keep = [k for k, v in enumerate(c['i']) if v not in ai]
            c['d'] = [c['d'][k * 3 + j] for k in keep for j in range(3)]; c['i'] = [c['i'][k] for k in keep]
    inputs = json.loads(subprocess.run(['node', os.path.join(C.ROOT, 'tools/anny-look/inputs.js')], check=True, capture_output=True, text=True).stdout)
    out = {'version': 1, 'source': {'anny': '0.6.1', 'toned': 'tools/skin-anny/result/anny-toned.json', 'fit': fit.get('pose'), 'local_delta': fit.get('local_delta', {}),
                                    # версия приложения в файл не пишется: стойку и инструменты уже отпечатывает inputs,
                                    # а номер версии менял бы файл при каждом выпуске без изменения данных
                                    'inputs': inputs},
           'frames': FRAMES, 'v': np.round(cat, 2).ravel().tolist(), 'f': F.ravel().tolist(),
           'wi': order.ravel().tolist(), 'ww': wq.ravel().tolist(),
           'region': {'code': code.tolist(), 'side': side.tolist(), 'a1': np.round(a1, 3).tolist(), 'a2': np.round(a2, 3).tolist()},
           'shade': shade.tolist(), 'correctives': corr}
    if shape != 'look': out['source']['shape'] = shape
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    s = json.dumps(out, separators=(',', ':'))
    open(out_path, 'w').write(s)
    print(out_path, 'вершин', n, 'треугольников', len(F), 'рамок', len(FRAMES), 'корректирующих форм', len(corr), 'sha256', hashlib.sha256(s.encode()).hexdigest()[:12])


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default=os.path.join(C.ROOT, 'qa/anny-look/anny.json'))
    ap.add_argument('--mannequin', default=None, help='qa/anny-look/mannequin.json (node tools/anny-look/export.js)')
    ap.add_argument('--shape', default='look', choices=['look', 'reference'], help='reference — эталон для листа, не для приложения')
    a = ap.parse_args(); build(a.out, a.mannequin, a.shape)
