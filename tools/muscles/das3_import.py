"""Мышцы между грудной клеткой и лопаткой (трапециевидная, ромбовидные, поднимающая лопатку, передняя зубчатая, малая
   грудная) — из модели плеча DAS3 (Chadwick и др., 2014, doi:10.1109/TBME.2014.2309727; Apache 2.0; прикрепления —
   по препаратам Klein Breteler и др., 1999). В MyoSim этих мышц нет.
   python3 tools/muscles/das3_import.py [вход.json] [выход.json]   (по умолчанию qa/muscles/muscles.json → он же;
   DAS3 — путь к клону github.com/dasproject/DAS3, коммит d6f2ff0, с папкой model/)

   Как переносятся точки. DAS3 и манекен построены на разных костях (кости манекена — MyoSim, подогнанные под ANSUR II).
   Каждая кость DAS3 совмещается с нашей по поверхности (ICP — итеративный
   поиск ближайших точек): грудная клетка с грудными позвонками — аффинно (у людей разная ширина и глубина груди),
   шейный отдел, череп, лопатка и ключица — подобием (поворот, сдвиг, один масштаб). Точка прикрепления мышцы
   переносится преобразованием своей кости DAS3, а затем — в рамку ближайшей нашей кости в нейтральной позе (остистые
   отростки — к своему позвонку, поперечные отростки шейных — к шейному отделу). Огибающий эллипсоид передней зубчатой —
   тем же аффинным преобразованием грудной клетки. Левая сторона — зеркально."""
import os, sys, json, re, subprocess
import xml.etree.ElementTree as ET
import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
# Кости манекена в памяти (как в build_muscles.py): грудная клетка до выноса передней стенки (RIB_RAW) и сам вынос (ribDeform).
# DAS3 совмещается с грудной клеткой до выноса: вынос (4.62.0, грудина к коже) — не аффинный, и аффинное совмещение с уже
# вынесенной клеткой растягивало DAS3 спереди назад на 21 % и уводило начала верхних зубцов передней зубчатой на рёбрах 1–2
# на 0,8 см назад. Точки грудной клетки после совмещения проходят тот же вынос, что сетка рёбер.
sys.path.insert(0, os.path.join(HERE, '../skeleton'))
_argv = sys.argv; sys.argv = sys.argv[:1]
import build_bones as BB  # noqa: E402
sys.argv = _argv
DAS3 = os.environ.get('DAS3', os.path.join(ROOT, '../das3'))
IN = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'qa/muscles/muscles.json')
OUT = sys.argv[2] if len(sys.argv) > 2 else IN
PREFIX = ('trap_scap', 'trap_clav', 'lev_scap', 'pect_min', 'rhomboid', 'serr_ant')


def D2M(v):
    """DAS3 (x вправо, y вверх, z назад; м) → манекен (X влево, Y вверх, Z вперёд; см)"""
    v = np.asarray(v, float); return np.stack([-v[..., 0], v[..., 1], -v[..., 2]], -1) * 100


def rot(axis, a):
    c, s = np.cos(a), np.sin(a)
    return {'x': np.array([[1, 0, 0], [0, c, -s], [0, s, c]]), 'y': np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]]),
            'z': np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])}[axis]


def load_vtp(fn):
    s = open(fn).read(); pts = conn = offs = None
    for attr, body in re.findall(r'<DataArray([^>]*)>(.*?)</DataArray>', s, re.S):
        if 'Normals' in attr: continue
        if 'connectivity' in attr: conn = np.array(body.split(), int)
        elif 'offsets' in attr: offs = np.array(body.split(), int)
        elif 'NumberOfComponents="3"' in attr: pts = np.array(body.split(), float).reshape(-1, 3)
    f, prev = [], 0
    for o in offs:
        poly = conn[prev:o]; prev = o
        f += [[poly[0], poly[k], poly[k + 1]] for k in range(1, len(poly) - 1)]
    return pts, np.array(f)


def components(n, f):
    par = np.arange(n)
    def find(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    for tri in f:
        for x, y in ((tri[0], tri[1]), (tri[1], tri[2])):
            rx, ry = find(x), find(y)
            if rx != ry: par[rx] = ry
    return np.unique([find(i) for i in range(n)], return_inverse=True)[1]


def parse():
    """кости (сетки в рамках тел DAS3, оси манекена, см), положение тел в нейтральной позе DAS3, мышцы, эллипсоид"""
    t = ET.parse(os.path.join(DAS3, 'model/das3.osim')).getroot(); G = os.path.join(DAS3, 'model/Geometry')
    q = {c.get('name'): float(c.findtext('default_value')) for c in t.iter('Coordinate')}
    # поза DAS3 по умолчанию: ключица — от грудино-ключичного сустава поворотами Y, Z, X; лопатка — от акромиально-
    # ключичного так же (суставы sc1–sc3, ac1–ac3 модели)
    Rc = rot('y', q['SC_y']) @ rot('z', q['SC_z']) @ rot('x', q['SC_x']); oc = np.array([0.0014, -0.0152, 0.0028])
    Rs = Rc @ rot('y', q['AC_y']) @ rot('z', q['AC_z']) @ rot('x', q['AC_x']); os_ = oc + Rc @ np.array([0.2077, -0.0001, 0.0282])
    pose = {'thorax': (np.eye(3), np.zeros(3)), 'clavicle_r': (Rc, oc), 'scapula_r': (Rs, os_)}
    meshes = {}
    Ry = rot('y', 1.57)       # сетки грудной клетки повёрнуты рамками thorax_geom_frame (ориентация 0 1,57 0)
    for nm, body, R in (('ground_ribs', 'thorax', Ry), ('ground_spine', 'thorax', Ry), ('ground_skull', 'thorax', Ry),
                        ('rscapula', 'scapula_r', np.eye(3)), ('rclavicle', 'clavicle_r', np.eye(3))):
        v, f = load_vtp(os.path.join(G, nm + '.vtp')); meshes[nm] = (body, D2M(v @ R.T), f)
    muscles = []
    for e in t.find('Model').find('ForceSet').find('objects'):
        if not e.get('name').startswith(PREFIX): continue
        pts = [(p.findtext('socket_parent_frame').split('/')[-1], np.array(p.findtext('location').split(), float))
               for p in e.iter('PathPoint')]
        muscles.append({'name': e.get('name'), 'fmax': float(e.findtext('max_isometric_force')),
                        'L0': float(e.findtext('optimal_fiber_length')) * 100, 'LT': float(e.findtext('tendon_slack_length')) * 100,
                        'pts': [(b, D2M(p)) for b, p in pts], 'wrap': [w.findtext('wrap_object') for w in e.iter('PathWrap')]})
    w = [x for x in t.iter('WrapEllipsoid') if x.get('name') == 'serr_ant'][0]
    assert np.allclose([float(a) for a in w.findtext('xyz_body_rotation').split()], 0) and w.findtext('quadrant').strip() == 'all'
    ell = {'c': D2M(np.array(w.findtext('translation').split(), float)), 'r': np.array(w.findtext('dimensions').split(), float) * 100}
    # в осях манекена полуоси идут по X, Y, Z как в DAS3 (x→−X, z→−Z — только знак)
    return pose, meshes, muscles, ell


def to_thorax(pose, body, p):
    """точка тела DAS3 (оси манекена) → рамка грудной клетки DAS3 (оси манекена) в нейтральной позе DAS3"""
    R, o = pose[body]; F = np.diag([-1, 1, -1])            # D2M — поворот на 180° вокруг Y: R_м = F R F
    return (F @ R @ F @ np.asarray(p).T).T + D2M(o)


# ---------- совмещение поверхностей ----------
def umeyama(X, Y, w=None, scale=True):
    w = np.ones(len(X)) if w is None else w; w = w / w.sum()
    mx, my = w @ X, w @ Y; A, B = X - mx, Y - my
    C = (B * w[:, None]).T @ A; U, S, Vt = np.linalg.svd(C); D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt; s = np.trace(np.diag(S) @ D) / (w @ (A * A).sum(1)) if scale else 1.0
    return s * R, my - s * R @ mx


def icp(src, dst, A0, t0, mode, iters=80, trim=.9):
    """src → dst: A·x + t; mode — 'sim' (подобие) или 'aff' (аффинное). Пары — в обе стороны (ближайшая точка цели для
       каждой точки источника и наоборот), дальние 10 % пар отбрасываются (у моделей разный набор мелких деталей)."""
    A, t = A0.copy(), t0.copy(); kd_d = cKDTree(dst)
    for _ in range(iters):
        y = src @ A.T + t; kd_s = cKDTree(y)
        d1, j1 = kd_d.query(y); d2, j2 = kd_s.query(dst)
        X = np.vstack([src, src[j2]]); Y = np.vstack([dst[j1], dst]); d = np.concatenate([d1, d2])
        keep = d <= np.quantile(d, trim); X, Y = X[keep], Y[keep]
        if mode == 'sim': A1, t1 = umeyama(X, Y)
        else:
            H = np.hstack([X, np.ones((len(X), 1))]); P = np.linalg.lstsq(H, Y, rcond=None)[0]; A1, t1 = P[:3].T, P[3]
        done = np.abs(A1 - A).max() < 1e-6 and np.abs(t1 - t).max() < 1e-5; A, t = A1, t1
        if done: break
    y = src @ A.T + t; d1 = kd_d.query(y)[0]; d2 = cKDTree(y).query(dst)[0]
    return A, t, {'src_mean': round(float(d1.mean()), 2), 'src_p95': round(float(np.quantile(d1, .95)), 2),
                  'dst_mean': round(float(d2.mean()), 2), 'dst_p95': round(float(np.quantile(d2, .95)), 2)}


def surf_samples(v, f, n=6000, seed=0):
    """точки, равномерные по площади (у сеток разная плотность вершин)"""
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]; ar = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
    rng = np.random.default_rng(seed); k = rng.choice(len(f), n, p=ar / ar.sum()); u, w = rng.random(n), rng.random(n)
    m = u + w > 1; u[m], w[m] = 1 - u[m], 1 - w[m]
    return a[k] + (b[k] - a[k]) * u[:, None] + (c[k] - a[k]) * w[:, None]


def closest_on_mesh(v, f, p):
    """ближайшая к p точка поверхности сетки (перебор треугольников; Эриксон, «Real-Time Collision Detection», 5.1.5)"""
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]; ab, ac, ap = b - a, c - a, p - a
    d1, d2 = (ab * ap).sum(1), (ac * ap).sum(1); bp = p - b; d3, d4 = (ab * bp).sum(1), (ac * bp).sum(1)
    cp = p - c; d5, d6 = (ab * cp).sum(1), (ac * cp).sum(1)
    va, vb, vc = d3 * d6 - d5 * d4, d5 * d2 - d1 * d6, d1 * d4 - d3 * d2
    den = np.where(np.abs(va + vb + vc) < 1e-12, 1e-12, va + vb + vc); v_, w_ = vb / den, vc / den
    q = a + ab * v_[:, None] + ac * w_[:, None]                                    # внутри треугольника
    def put(mask, val):
        q[mask] = val[mask]
    with np.errstate(divide='ignore', invalid='ignore'):
        put((va <= 0) & (d4 - d3 >= 0) & (d5 - d6 >= 0), b + (c - b) * np.nan_to_num((d4 - d3) / ((d4 - d3) + (d5 - d6)))[:, None])
        put((vb <= 0) & (d2 >= 0) & (d6 <= 0), a + ac * np.nan_to_num(d2 / (d2 - d6))[:, None])
        put((vc <= 0) & (d1 >= 0) & (d3 <= 0), a + ab * np.nan_to_num(d1 / (d1 - d3))[:, None])
    put((d6 >= 0) & (d5 <= d6), c); put((d3 >= 0) & (d4 <= d3), b); put((d1 <= 0) & (d2 <= 0), a)
    d = np.linalg.norm(q - p, axis=1); k = int(np.argmin(d))
    return q[k], float(d[k])


SNAP = 1.0      # точка прикрепления дальше 1 см от поверхности своей кости переносится на поверхность (см. main)
# Кость для точек у основания черепа выбрана по анатомии, а не по ближайшей сетке DAS3 (там ничья или череп рядом с C1):
# нисходящая часть трапециевидной начинается от верхней выйной линии и наружного затылочного выступа, поднимающая
# лопатку — от поперечных отростков C1–C4 (Gray's Anatomy, 42-е изд., 2020, гл. «Плечевой пояс»).
REGION = {('trap_clav_1', 0): 'skull', ('lev_scap_1', 0): 'cervical', ('lev_scap_2', 0): 'cervical'}

# ---------- начала на позвоночнике — по анатомическим ориентирам (аудит прикреплений, 4.34.0) ----------
# Начала трапециевидной, ромбовидных и поднимающей лопатку у DAS3 лежат в мягких тканях в 3–4,4 см позади позвонков
# её сетки; при посадке на ближайшую кость четыре верхних пучка трапециевидной и верхний пучок ромбовидных сходились
# в одну точку — вершину остистого отростка C7, а оба пучка поднимающей лопатку — у C1. Поэтому эти начала ставятся не
# на ближайшую поверхность, а по уровню позвонка: уровень начала у DAS3 — по высоте вершин остистых отростков её
# собственного позвоночника (непрерывный: T7.6 — между T7 и T8), затем поправка по анатомии (SPINE_FIX), затем точка
# на нашем скелете того же уровня:
#   · шея (до C7) — задний край выйной связки: прямая от наружного затылочного выступа (начало trap_clav_1 на черепе)
#     к вершине остистого отростка C7, на высоте вершины остистого отростка своего уровня; кость — шейный отдел;
#   · ниже C7 — надостистая связка: между вершинами остистых отростков соседних позвонков; кость — ближайший позвонок;
#   · поперечный отросток (поднимающая лопатку) — у C1–C2 кончик (самая наружная точка позвонка), у C3–C7 — задний
#     бугорок (tp_point в main).
# Уровни: 0 — C1 … 6 — C7, 7 — T1 … 18 — T12. Источники: Gray's Anatomy, 42-е изд., 2020 (трапециевидная — затылочная
# кость, выйная связка, остистые отростки C7–T12; поднимающая лопатку — поперечные отростки C1–C4); OpenStax Anatomy
# and Physiology 2e, 11.5 (ромбовидная малая — C7–T1, большая — T2–T5).
LEVELS = [f'C{i}' for i in range(1, 8)] + [f'T{i}' for i in range(1, 13)]
LV = {n: i for i, n in enumerate(LEVELS)}
SPINE_FIX = {
    # трапециевидная: у препарата DAS3 (Klein Breteler и др., 1999) нижний пучок начинается на T9, по анатомии — до
    # T12. Шейная часть остаётся на своих уровнях, грудная растягивается пропорционально (порядок и относительные
    # промежутки пучков препарата сохраняются), нижний пучок — на T12
    'trap': 'stretch',
    # ромбовидные: у препарата C6–T2; малая (rhomboid_1 — прикрепление у основания ости лопатки) — от C7–T1, середина
    # её начала; большая (rhomboid_2…5 — край лопатки ниже ости) — от T2…T5, по пучку на позвонок
    'rhomboid_1': LV['C7'] + .5, 'rhomboid_2': LV['T2'], 'rhomboid_3': LV['T3'], 'rhomboid_4': LV['T4'], 'rhomboid_5': LV['T5'],
    # поднимающая лопатку: у DAS3 оба пучка у C1, по анатомии — поперечные отростки C1–C4. Верхний у DAS3 пучок
    # (lev_scap_1; прикрепляется ниже по краю лопатки — мышца перекручена) — C1, второй — C4
    'lev_scap_1': ('tp', LV['C1']), 'lev_scap_2': ('tp', LV['C4']),
}


def main():
    pose, meshes, muscles, ell = parse()
    names = ['ribcage'] + [f'thoracic{i}' for i in range(1, 13)] + ['cervical', 'skull', 'clavicleR', 'scapulaR']
    ours = json.loads(subprocess.run(['node', os.path.join(HERE, 'neutral.js'), ','.join(names)], capture_output=True, check=True, text=True).stdout)
    ov = {k: np.array(b['v']) for k, b in ours.items()}; of = {k: np.array(b['f']).reshape(-1, 3) for k, b in ours.items()}
    osamp = {k: surf_samples(ov[k], of[k], 4000 if k in ('ribcage', 'skull', 'scapulaR') else 800) for k in ours}

    # DAS3: грудная клетка и позвонки → по компонентам связности; уровни позвонков — по высоте (снизу L5 … T1, C7 … C1)
    _, sv, sf = meshes['ground_spine']; lab = components(len(sv), sf)
    comps = [np.where(lab == c)[0] for c in range(lab.max() + 1)]
    big = sorted([c for c in comps if len(c) >= 140], key=lambda c: sv[c, 1].mean())     # тела позвонков с дугами
    assert len(big) == 24, len(big)
    level = {}
    for k, c in enumerate(big): level.update({int(i): (['L5', 'L4', 'L3', 'L2', 'L1'] + [f'T{12 - j}' for j in range(12)] + [f'C{7 - j}' for j in range(7)])[k] for i in c})
    small = [c for c in comps if len(c) < 140]                                              # диски — к ближайшему позвонку
    for c in small:
        y = sv[c, 1].mean(); k = int(np.argmin([abs(sv[b, 1].mean() - y) for b in big])); level.update({int(i): level[int(big[k][0])] for i in c})
    lv = np.array([level[i] for i in range(len(sv))])
    def region_mesh(mask):
        keep = mask[sf].all(1); idx = np.where(mask)[0]; remap = -np.ones(len(sv), int); remap[idx] = np.arange(len(idx))
        return sv[idx], remap[sf[keep]]
    thor_spine = region_mesh(np.array([l.startswith('T') for l in lv])); cerv = region_mesh(np.array([l.startswith('C') for l in lv]))
    rib_v, rib_f = meshes['ground_ribs'][1:]

    # 1) грудная клетка: рёбра + грудные позвонки DAS3 → наши рёбра + Th1–Th12. Начало — совмещение центров
    src = np.vstack([surf_samples(rib_v, rib_f, 6000), surf_samples(*thor_spine, 2000)])
    dst = np.vstack([surf_samples(BB.RIB_RAW[0], np.asarray(BB.RIB_RAW[1]).reshape(-1, 3), 4000)] + [osamp[f'thoracic{i}'] for i in range(1, 13)])
    A, t, res = icp(src, dst, np.eye(3), dst.mean(0) - src.mean(0), 'sim')
    A, t, res = icp(src, dst, A, t, 'aff')
    U, S, Vt = np.linalg.svd(A); Rpol = U @ Vt; P = Vt.T @ np.diag(S) @ Vt
    print('грудная клетка: масштабы', np.round(S, 3), 'поворот', round(float(np.degrees(np.arccos((np.trace(Rpol) - 1) / 2))), 1), '°, невязка', res)
    XF = {'thorax': (A, t)}
    # 2) шейный отдел и 3) череп — подобие, начало — преобразование грудной клетки
    cs = surf_samples(*cerv, 1500); A2, t2, r2 = icp(cs, osamp['cervical'], A, t, 'sim'); XF['cervical'] = (A2, t2)
    print('шейный отдел: масштаб', round(float(np.cbrt(np.linalg.det(A2))), 3), 'невязка', r2)
    _, kv, kf = meshes['ground_skull']; ks = surf_samples(kv, kf, 3000)
    A3, t3, r3 = icp(ks, osamp['skull'], A, t, 'sim'); XF['skull'] = (A3, t3)
    print('череп: масштаб', round(float(np.cbrt(np.linalg.det(A3))), 3), 'невязка', r3)
    # 4) лопатка и 5) ключица: начало — их положение в позе DAS3 по умолчанию, перенесённое преобразованием грудной клетки
    for nm, body, key in (('rscapula', 'scapula_r', 'scapulaR'), ('rclavicle', 'clavicle_r', 'clavicleR')):
        _, v, f = meshes[nm]; s0 = surf_samples(v, f, 3000)
        R, o = pose[body]; F = np.diag([-1, 1, -1]); Rm = F @ R @ F; om = D2M(o)
        A0 = A @ Rm; t0 = A @ om + t
        Ab, tb, rb = icp(s0, osamp[key], A0, t0, 'sim'); XF[body] = (Ab, tb)
        print(nm, ': масштаб', round(float(np.cbrt(np.linalg.det(Ab))), 3), 'невязка', rb)
    # проверка по суставам: акромиально-ключичный (начало рамки лопатки DAS3) и центр плечевого — как у нашей лопатки
    sc = -np.array(ours['scapulaR']['T'])[:, 3]                         # начало рамки лопатки (грудино-ключичный) в рамке груди
    for nm, p_das, p_our in (('АКС', np.zeros(3), ours['scapulaR']['meta']['ac'][0]),
                             ('плечевой', D2M([0.002, -0.023, -0.0439]), ours['scapulaR']['meta']['gl'][0])):
        A_, t_ = XF['scapula_r']; print(f'  {nm}: DAS3 → {np.round(A_ @ p_das + t_, 1)}, у манекена {np.round(np.array(p_our) + sc, 1)}')

    # ---------- точки мышц ----------
    # Точки DAS3 сняты с препаратов (Klein Breteler 1999), сетки костей модели с ними согласуются не везде: у DAS3
    # точки на лопатке и ключице лежат в пределах 1,2 см от своих сеток, на рёбрах — 1–2 см, а начала трапециевидной и
    # ромбовидных на остистых отростках — в 3–4,4 см позади позвонков (в мягких тканях). Мышца крепится к кости,
    # поэтому точку, оказавшуюся после переноса дальше SNAP от поверхности своей кости, ставим в ближайшую точку
    # поверхности (сдвиг записывается в данные: поле snap, см).
    kd_rib = cKDTree(rib_v); kd_sp = cKDTree(sv); kd_sk = cKDTree(meshes['ground_skull'][1])
    def place(body, p, override=None):
        """точка тела DAS3 → (наша кость, координаты в её рамке, сдвиг на поверхность, см)"""
        if body == 'thorax':
            d = {'rib': kd_rib.query(p)[0], 'spine': kd_sp.query(p)[0], 'skull': kd_sk.query(p)[0]}; reg = min(d, key=d.get)
            region = 'skull' if reg == 'skull' else 'cervical' if reg == 'spine' and lv[kd_sp.query(p)[1]].startswith('C') else 'thorax'
            region = override or region
            A_, t_ = XF[region]; x = A_ @ p + t_
            if region == 'thorax': x = BB.ribDeform(x[None])[0]
            cand = {'skull': ['skull'], 'cervical': ['cervical'], 'thorax': ['ribcage'] + [f'thoracic{i}' for i in range(1, 13)]}[region]
        else:
            A_, t_ = XF[body]; x = A_ @ p + t_; cand = ['scapulaR' if body == 'scapula_r' else 'clavicleR']
        near = {k: closest_on_mesh(ov[k], of[k], x) for k in cand}; key = min(near, key=lambda k: near[k][1])
        q_s, dist = near[key]; snap = 0.0
        if dist > SNAP: x, snap = q_s, dist
        T = np.array(ours[key]['T']); q = T[:, :3] @ x + T[:, 3]
        bone = [key[:-1], 'R'] if key.endswith('R') and key[:-1] in ('scapula', 'clavicle') else [key, '']
        return bone, q, snap, dist, x

    # ---------- начала на позвоночнике (SPINE_FIX) ----------
    # DAS3: вершина остистого отростка — самая задняя точка позвонка; уровень точки — по высоте между вершинами
    tip_d = np.array([sv[big[23 - i]][np.argmin(sv[big[23 - i], 2])] for i in range(len(LEVELS))])   # big — снизу L5 … C1
    def das3_level(p):
        H = tip_d[:, 1]
        if p[1] >= H[0]: return 0.0
        for i in range(len(H) - 1):
            if H[i] >= p[1] >= H[i + 1]: return i + (H[i] - p[1]) / (H[i] - H[i + 1])
        return float(len(H) - 1)
    # наш скелет (рамка грудной клетки, Y вверх, Z вперёд): позвонки шейного отдела — компоненты связности его сетки
    cv, cf = ov['cervical'], of['cervical']; clab = components(len(cv), cf)
    cverts = sorted([np.where(clab == c)[0] for c in range(clab.max() + 1)], key=len)[-7:]
    cverts = sorted(cverts, key=lambda c: -cv[c, 1].mean())                                     # сверху вниз: C1 … C7
    tip_o = np.array([cv[c][np.argmin(cv[c][:, 2])] for c in cverts] + [ov[f'thoracic{i}'][np.argmin(ov[f'thoracic{i}'][:, 2])] for i in range(1, 13)])
    # поперечный отросток (правая сторона: X влево): у C1 и C2 — кончик (самая наружная точка), у C3–C7 — задний бугорок:
    # задний край наружных 0,3 см кончика, как у лестничных в anatomy.js. Поднимающая лопатку начинается «от поперечных
    # отростков атласа и осевого позвонка и от задних бугорков поперечных отростков C3 и C4» (Gray's Anatomy, 1918, «Мышцы,
    # соединяющие верхнюю конечность с позвоночником»). 4.60.0: до посадки шеи на мыщелки пучок C4 начинался у самой наружной
    # точки — у переднего края кончика, на 0,45 см впереди заднего бугорка; с позвонками на своих местах его тело в стрельбе
    # из лука (правая лопатка отведена) выходило из кожи на 1,03 см у основания шеи, с задним бугорком — на ≈0,5 см.
    def tp_point(k, c):
        p = cv[c]
        if k < 2: return p[np.argmin(p[:, 0])]
        R = p[p[:, 0] < -1]; lat = -R[:, 0].min(); T = R[-R[:, 0] > lat - .3]
        return T[np.argmin(T[:, 2])]
    tp_o = np.array([tp_point(k, c) for k, c in enumerate(cverts)])
    eop = place('thorax', [p for mu in muscles if mu['name'] == 'trap_clav_1' for _, p in mu['pts'][:1]][0], 'skull')[4]
    def in_frame(key, x):
        T = np.array(ours[key]['T']); return [key, ''], T[:, :3] @ x + T[:, 3]
    def spine_point(L):
        """точка начала на нашем скелете на уровне L (см. SPINE_FIX)"""
        if L <= LV['C7']:
            i = min(int(L), LV['C7'] - 1); y = tip_o[i, 1] + (L - i) * (tip_o[i + 1, 1] - tip_o[i, 1])
            t = (y - eop[1]) / (tip_o[LV['C7'], 1] - eop[1]); return in_frame('cervical', eop + t * (tip_o[LV['C7']] - eop))
        i = min(int(L), len(LEVELS) - 2); x = tip_o[i] + (L - i) * (tip_o[i + 1] - tip_o[i]); n = int(L + .5)
        return in_frame('cervical' if n <= LV['C7'] else f'thoracic{n - LV["C7"]}', x)
    low = max(das3_level(mu['pts'][0][1]) for mu in muscles if mu['name'].startswith('trap_scap'))
    def fixed(name, p):
        rule = SPINE_FIX.get('trap' if name.startswith('trap_') and name != 'trap_clav_1' else name)
        if rule is None: return None
        L0 = das3_level(p)
        if rule == 'stretch': L, how = (L0 if L0 <= LV['C7'] else LV['C7'] + (L0 - LV['C7']) * (LV['T12'] - LV['C7']) / (low - LV['C7'])), 'spine'
        elif isinstance(rule, tuple): L, how = rule[1], 'tp'
        else: L, how = rule, 'spine'
        bone, q = in_frame('cervical', tp_o[int(L)]) if how == 'tp' else spine_point(L)
        name_lv = lambda v: LEVELS[int(v)] + ('' if v == int(v) else f'.{round((v - int(v)) * 100):02d}')
        print(f'  {name}: DAS3 {name_lv(L0)} → {name_lv(L)}{" (поперечный отросток)" if how == "tp" else ""}')
        return bone, q
    # ---------- верхняя часть передней зубчатой (SERR_UPPER) ----------
    # Первый зубец начинается от 1-го и 2-го рёбер и фасции первого межрёберья и прикрепляется к рёберной поверхности
    # верхнего угла лопатки; волокна идут назад, прилегая к стенке груди (Gray's Anatomy, 1918, «Serratus anterior»). Длина
    # верхней части на препаратах — 6,9 ± 1,2 см (4,8–9,0; Smith R. и др., J Orthop Sports Phys Ther 2003; 33: 449–454),
    # у DAS3 (препарат Klein Breteler 1999) — 8,0–9,6 см (линии 10–12) и 11,2 (9). Лопатка манекена лежит на рёбрах
    # глубже и дальше в сторону, чем у DAS3 в его позе (верхний угол — в 8,5 см от средней линии, у DAS3 — в 5,3; у DAS3
    # он в 3,3 см позади рёбер), и начала DAS3, перенесённые с рёбрами, оказывались почти под верхним углом: линии 10–12 —
    # 2,1–3,7 см, и при протракции лопатки верхний угол уходил за них — линии удлинялись. Поэтому начала линий к верхнему
    # углу (DAS3 9–12, все — от рёбер 1–2) сдвигаются по рёбрам вперёд на той же высоте, пока прямая до прикрепления не
    # станет нужной длины; точка — на поверхности рёбер. Длина: соотношение линий — как у DAS3 (с масштабом совмещения
    # грудной клетки), средняя — 6,9 см, как на препаратах Smith 2003. До 4.62.0 (ветка осанки, промежуточно) — длины DAS3
    # (8,9–11,3 см, выше диапазона Smith): начала уходили далеко вперёд по рёбрам, и при сведении лопаток (поворот наружу
    # подводит верхний угол к рёбрам) верхние зубцы укорачивались, а в жиме над головой часть удлинялась сверх профиля.
    SERR_UPPER = ('serr_ant_9', 'serr_ant10', 'serr_ant11', 'serr_ant12')
    SMITH_UPPER = 6.9
    s_thor = float(np.cbrt(np.linalg.det(XF['thorax'][0])))
    rv, rf = ov['ribcage'], of['ribcage']
    def das3_len(mu):
        i_d, o_d = (to_thorax(pose, b, p) for b, p in mu['pts'])
        return float(np.linalg.norm(o_d - i_d)) * s_thor
    k_smith = SMITH_UPPER / float(np.mean([das3_len(mu) for mu in muscles if mu['name'] in SERR_UPPER]))
    def serr_upper(mu, pl):
        """начало линии на рёбрах: (кость, точка в рамке кости, сдвиг, расстояние, точка в рамке груди); pl — place() точек"""
        assert [b for b, _ in mu['pts']] == ['scapula_r', 'thorax'], mu['name']
        target = das3_len(mu) * k_smith
        xi, xo = pl[0][4], pl[1][4]
        band = rv[np.abs(rv[:, 1] - xo[1]) < .8]; zc = (band[:, 2].min() + band[:, 2].max()) / 2
        r0, a0, g = np.hypot(xo[0], xo[2] - zc), np.arctan2(abs(xo[0]), xo[2] - zc), np.sign(xo[0])
        x, L = xo, float(np.linalg.norm(xo - xi))
        # левая сторона — зеркало правой, а грудная клетка MyoSim несимметрична (у края 1-го ребра — до 4 мм): начало — там, где
        # и зеркальная точка лежит на рёбрах левой стороны (не дальше 1,5 мм от них), иначе левая стенка зубчатой расходится с
        # зеркалом правой (узлы скольжения ложатся на оболочку своей стороны)
        for a in np.radians(np.arange(np.degrees(a0), 0, -.5)):
            c = np.array([g * r0 * np.sin(a), xo[1], zc + r0 * np.cos(a)]); x = closest_on_mesh(rv, rf, c)[0]; L = float(np.linalg.norm(x - xi))
            if L >= target and closest_on_mesh(rv, rf, x * np.array([-1., 1., 1.]))[1] <= .15: break
        T = np.array(ours['ribcage']['T']); q = T[:, :3] @ x + T[:, 3]
        print(f'  {mu["name"]}: длина {np.linalg.norm(xo - xi):.1f} → {L:.1f} см (цель {target:.1f}: DAS3 {target / k_smith:.1f} × {k_smith:.3f}), начало сдвинуто вперёд на {np.linalg.norm(x - xo):.1f} см')
        return ['ribcage', ''], q, float(np.linalg.norm(x - xo)), 0.0, x
    out, worst = [], []
    print('начала на позвоночнике (уровень DAS3 → по анатомии); верхняя часть передней зубчатой:')
    for mu in muscles:
        el = []
        pl = [place(body, p, REGION.get((mu['name'], k))) for k, (body, p) in enumerate(mu['pts'])]
        if mu['name'] in SERR_UPPER: pl[1] = serr_upper(mu, pl)
        for k, (body, p) in enumerate(mu['pts']):
            bone, q, snap, dist, _ = pl[k]
            fx = fixed(mu['name'], p) if k == 0 and body == 'thorax' else None
            if fx: bone, q, snap = fx[0], fx[1], 0.0
            else: worst.append((dist, mu['name'], k, bone[0]))
            el.append({'s': {'bone': bone, 'p': np.round(q, 3).tolist(), 'site': f"{mu['name']}-P{k + 1}", **({'snap': round(snap, 2)} if snap else {})}})
        if mu['wrap']:
            assert mu['wrap'] == ['serr_ant'] and len(el) == 2
            A_, t_ = XF['thorax']; c = BB.ribDeform((A_ @ ell['c'] + t_)[None])[0]; B = A_ @ np.diag(ell['r'])
            el.insert(1, {'w': {'t': 'e', 'bone': ['ribcage', ''], 'c': np.round(c, 3).tolist(), 'B': np.round(B, 4).ravel().tolist(), 'side': None, 'geom': 'serr_ant'}})
        out.append({'name': mu['name'] + '_r', 'side': 'R', 'fmax': round(mu['fmax'], 2), 'L0': round(mu['L0'], 3), 'LT': round(mu['LT'], 3), 'src': 'DAS3', 'el': el})
    worst.sort(reverse=True)
    print('расстояние точки прикрепления до поверхности своей кости, см: медиана', round(float(np.median([w[0] for w in worst])), 2),
          'худшие', [(round(float(d), 2), n, k, b) for d, n, k, b in worst[:5]])
    # левая сторона — зеркально
    def mirror_s(s):
        b, sd = s['bone']; return {**s, 'bone': [b, 'L' if sd == 'R' else sd], 'p': [-s['p'][0], s['p'][1], s['p'][2]]}
    left = []
    for mu in out:
        el = []
        for e in mu['el']:
            if 's' in e: el.append({'s': mirror_s(e['s'])})
            else:
                w = e['w']; B = np.array(w['B']).reshape(3, 3); B[0] *= -1
                el.append({'w': {**w, 'c': [-w['c'][0], w['c'][1], w['c'][2]], 'B': B.ravel().tolist()}})
        left.append({**mu, 'name': mu['name'][:-2] + '_l', 'side': 'L', 'el': el})
    md = json.load(open(IN, encoding='utf-8'))
    md['muscles'] = [m for m in md['muscles'] if m.get('src') != 'DAS3'] + out + left
    if 'DAS3' not in md['source']:
        md['source'] += '; DAS3 (Chadwick и др., 2014; Apache 2.0): мышцы лопатки'
    json.dump(md, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    print('мышц DAS3', len(out) + len(left), '→', OUT)
    return XF


if __name__ == '__main__':
    main()
