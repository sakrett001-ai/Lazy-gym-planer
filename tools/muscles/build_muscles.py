"""Пути мышц MyoSim → рамки костей скелета манекена (те же преобразования, что у костей: tools/skeleton/build_bones.py, XF).
   python3 tools/muscles/build_muscles.py [выход.json]   (по умолчанию qa/muscles/muscles.json; затем node tools/muscles/pack.js)

   Что берётся из модели (myofullbody, нулевая поза — в ней посажены кости):
   - мышцы — сухожилия, на которые действует мышечный привод (связки и внутренние мышцы кисти не берутся);
   - точки пути (сайты) — в рамке тела MyoSim → в рамку корня цепочки (как сетки костей) → оси и см манекена → XF кости;
   - огибающие тела (сферы, цилиндры) — центр тем же преобразованием, ось и радиус — по его производной (кости вдоль
     сегмента растянуты, поперёк — почти нет);
   - параметры мышцы (MuJoCo): сила Fmax, оптимальная длина волокон L0 и длина свободного сухожилия LT — для объёма (этап М2).
   Правая рука строится по правой руке MyoSim, левая — зеркально (как кости). Ноги и туловище — обе стороны из модели."""
import os, sys, json
import numpy as np
import mujoco
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '../skeleton'))
from mjmodel import load, name, OBJ, W_SITE, W_SPHERE, W_CYL  # noqa: E402
import build_bones as BB  # noqa: E402  (собирает кости в памяти; XF — преобразования костей)

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '../../qa/muscles/muscles.json')
HAND_INTRINSIC = ('RI', 'LU_RB', 'UI_UB', 'OP')            # межкостные, червеобразные, противопоставляющая — не берём
CHAINS = {'pelvis': 'pelvis', 'sacrum': 'sacrum', 'clavicle_r': 'clavicle_r'}
LEG_B = {'femur': 'femur', 'tibia': 'tibia', 'patella': 'patella', 'talus': 'talus', 'calcn': 'foot', 'toes': 'toes'}
ARM_B = {'clavicle_r': 'clavicle', 'scapula_r': 'scapula', 'humerus_r': 'humerus', 'ulna_r': 'ulna', 'radius_r': 'radius',
         'secondmc_r': '2mc', 'thirdmc_r': '3mc', 'fourthmc_r': '4mc', 'fifthmc_r': '5mc', 'firstmc_r': '1mc',
         'proximal_thumb_r': 'thumbprox', 'distal_thumb_r': 'thumbdist'}
for c_ in ('lunate', 'scaphoid', 'pisiform', 'triquetrum', 'capitate', 'trapezium', 'trapezoid', 'hamate'):
    ARM_B[c_ + '_r'] = c_
for k in '2345':
    ARM_B[f'{k}proxph_r'] = f'{k}proxph'; ARM_B[f'midph{k}_r'] = f'{k}midph'; ARM_B[f'distph{k}_r'] = f'{k}distph'


def root_of(body):
    """корень цепочки MyoSim, в рамке которого посажены кости этого тела"""
    if body in ARM_B:
        return 'clavicle_r'
    if body == 'pelvis' or any(body in (k + '_r', k + '_l') for k in LEG_B):
        return 'pelvis'
    return 'sacrum'


def bone_of(body, p_root):
    """тело MyoSim → (корень цепочки, кость манекена (имя, сторона)); p_root — точка в рамке корня, оси манекена, см"""
    if body == 'pelvis':
        return 'pelvis', ('sacrum', '') if abs(p_root[0]) < 1 else (('pelvis_L', 'L') if p_root[0] > 0 else ('pelvis_R', 'R'))
    for k, v in LEG_B.items():
        if body in (k + '_r', k + '_l'):
            return 'pelvis', (v, 'R' if body.endswith('_r') else 'L')
    if body == 'sacrum':
        return 'sacrum', ('sacrum', '')
    if body.startswith('lumbar'):
        return 'sacrum', ('L' + body[-1], '')
    if body in ('torso', 'chest_r'):
        return 'sacrum', ('ribcage', '')
    if body == 'Abdomen':          # тело-посредник брюшной стенки (поворачивается на 0,64 сгибания поясницы) — с L3
        return 'sacrum', ('L3', '')
    if body in ARM_B:
        return 'clavicle_r', (ARM_B[body], 'R')
    raise KeyError(body)


def main():
    m, d = load(); d.qpos[:] = m.qpos0; mujoco.mj_kinematics(m, d)
    bid = lambda n: mujoco.mj_name2id(m, OBJ.mjOBJ_BODY, n)
    roots = {r: (d.xpos[bid(r)].copy(), d.xmat[bid(r)].reshape(3, 3).copy()) for r in CHAINS}

    def to_root(root, p_world):
        o, R = roots[root]; return BB.M((R.T @ (p_world - o)) * 100)

    def body_name(b):
        return name(m, OBJ.mjOBJ_BODY, b)

    def map_point(body, p_world):
        """точка в мире (нулевая поза) → (кость, координаты в рамке кости)"""
        root = root_of(body); pr = to_root(root, p_world)
        r2, key = bone_of(body, pr); assert r2 == root, (body, r2, root)
        return key, BB.XF[key](pr[None])[0]

    def map_axis(key, root, c_world, a_world):
        """ось и масштаб поперёк неё: производная преобразования кости в центре огибающего тела"""
        xf = BB.XF[key]; c = to_root(root, c_world); h = .05
        J = np.stack([(xf((c + h * e)[None])[0] - xf((c - h * e)[None])[0]) / (2 * h) for e in np.eye(3)], 1)
        a = BB.M(roots[root][1].T @ a_world); a = a / np.linalg.norm(a)     # направление — в рамку корня цепочки, как точки
        u = np.cross(a, [1, 0, 0] if abs(a[0]) < .9 else [0, 1, 0]); u /= np.linalg.norm(u); v = np.cross(a, u)
        ja = J @ a; s_perp = (np.linalg.norm(J @ u) + np.linalg.norm(J @ v)) / 2; s_all = np.cbrt(abs(np.linalg.det(J)))
        return ja / np.linalg.norm(ja), s_perp, s_all

    def site(sid):
        body = body_name(m.site_bodyid[sid]); key, q = map_point(body, d.site_xpos[sid])
        return {'bone': list(key), 'p': np.round(q, 3).tolist(), 'site': name(m, OBJ.mjOBJ_SITE, sid)}

    muscles = []; skipped = []
    for a in range(m.nu):
        if m.actuator_trntype[a] != mujoco.mjtTrn.mjTRN_TENDON or m.actuator_dyntype[a] != mujoco.mjtDyn.mjDYN_MUSCLE:
            continue
        t = m.actuator_trnid[a][0]; tname = name(m, OBJ.mjOBJ_TENDON, t); aname = name(m, OBJ.mjOBJ_ACTUATOR, a)
        if aname.startswith(HAND_INTRINSIC) or aname.endswith('_l') and any(aname[:-2] == k for k in ARM_NAMES):
            skipped.append(aname); continue
        bodies = set(); el = []
        for j in range(m.tendon_adr[t], m.tendon_adr[t] + m.tendon_num[t]):
            ty, oid = int(m.wrap_type[j]), int(m.wrap_objid[j])
            if ty == W_SITE:
                s = site(oid); bodies.add(body_name(m.site_bodyid[oid])); el.append({'s': s})
            elif ty in (W_SPHERE, W_CYL):
                body = body_name(m.geom_bodyid[oid]); key, c = map_point(body, d.geom_xpos[oid])
                axis, s_perp, s_all = map_axis(key, root_of(body), d.geom_xpos[oid], d.geom_xmat[oid].reshape(3, 3)[:, 2])
                r = float(m.geom_size[oid][0]) * 100 * (s_perp if ty == W_CYL else s_all)
                side = int(round(m.wrap_prm[j]))
                el.append({'w': {'t': 'c' if ty == W_CYL else 'o', 'bone': list(key), 'c': np.round(c, 3).tolist(),
                                 'a': np.round(axis, 5).tolist(), 'r': round(r, 3), 'side': site(side) if side >= 0 else None,
                                 'geom': name(m, OBJ.mjOBJ_GEOM, oid)}})
            else:
                raise ValueError(tname)
        gp = m.actuator_gainprm[a]; lr = m.actuator_lengthrange[a]; rng = gp[0:2]
        L0 = (lr[1] - lr[0]) / (rng[1] - rng[0]); LT = lr[0] - rng[0] * L0
        side = 'R' if aname.endswith('_r') or aname in ARM_NAMES else 'L' if aname.endswith('_l') else ''
        if not side:
            raise ValueError('сторона мышцы не определена: ' + aname)
        muscles.append({'name': aname, 'side': side, 'fmax': round(float(gp[2]), 2), 'L0': round(float(L0) * 100, 3),
                        'LT': round(float(LT) * 100, 3), 'el': el})
    # левая рука — зеркально правой: кости руки 'R' → 'L', кости туловища — те же, x → −x
    arm_bones = set(ARM_B.values())
    def mirror_pt(s):
        b, sd = s['bone']; return {**s, 'bone': [b, 'L' if b in arm_bones else sd], 'p': [-s['p'][0], s['p'][1], s['p'][2]]}
    left = []
    for mu in muscles:
        if mu['name'] not in ARM_NAMES:
            continue
        el = []
        for e in mu['el']:
            if 's' in e:
                el.append({'s': mirror_pt(e['s'])})
            else:
                w = e['w']; b, sd = w['bone']
                el.append({'w': {**w, 'bone': [b, 'L' if b in arm_bones else sd], 'c': [-w['c'][0], w['c'][1], w['c'][2]],
                                 'a': [-w['a'][0], w['a'][1], w['a'][2]], 'side': mirror_pt(w['side']) if w['side'] else None}})
        left.append({**mu, 'name': mu['name'] + '_l', 'side': 'L', 'el': el})
    for mu in muscles:
        if mu['name'] in ARM_NAMES:
            mu['name'] += '_r'
    muscles += left
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    json.dump({'source': 'MyoSim (MyoHub, Apache 2.0): Rajagopal 2016 (ноги), Holzbaur 2005 MoBL (рука), модель поясничного отдела (туловище)',
               'muscles': muscles}, open(OUT, 'w'), ensure_ascii=False)
    print('мышц', len(muscles), '(пропущено', len(skipped), ': внутренние мышцы кисти и левая рука модели)', OUT)


ARM_NAMES = ['DELT1', 'DELT2', 'DELT3', 'SUPSP', 'INFSP', 'SUBSC', 'TMIN', 'TMAJ', 'PECM1', 'PECM2', 'PECM3', 'LAT1', 'LAT2', 'LAT3',
             'CORB', 'TRIlong', 'TRIlat', 'TRImed', 'ANC', 'SUP', 'BIClong', 'BICshort', 'BRA', 'BRD', 'ECRL', 'ECRB', 'ECU', 'FCR',
             'FCU', 'PL', 'PT', 'PQ', 'FDS5', 'FDS4', 'FDS3', 'FDS2', 'FDP5', 'FDP4', 'FDP3', 'FDP2', 'EDC5', 'EDC4', 'EDC3', 'EDC2',
             'EDM', 'EIP', 'EPL', 'EPB', 'FPL', 'APL']

if __name__ == '__main__':
    main()
