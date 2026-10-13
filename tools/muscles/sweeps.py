"""Эталонные развороты суставов для сверки мышц: в MuJoCo на родной модели MyoSim поворачивается один сустав (остальные —
   в нулевой позе, связанные — по своим многочленам), длина каждой мышцы — на каждом шаге. Те же развороты делает манекен
   (tools/muscles/compare.js): по совпадению хода длины видно, что после переноса на манекен мышца работает так же —
   тянет в ту же сторону и с тем же плечом.
   Углы — градусы в соглашении манекена (src/js/09bm-mannequin.js: сгибание, отведение, наружная ротация «+»).
   В файл идут только мышцы, пересекающие сустав разворота (длина меняется больше чем на 5 мм), длины — см с точностью 0,01.
   python3 tools/muscles/sweeps.py   → tools/muscles/fixtures/sweeps.json.gz"""
import os, json, gzip
import numpy as np
import mujoco
from mjmodel import load, pose, name, OBJ

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'sweeps.json.gz')
RANGE_MIN = 0.5      # см: мышца пересекает сустав, если её длина в развороте меняется больше
D = np.pi / 180
# имя, путь в позе манекена, углы манекена, суставы MuJoCo: f(угол манекена, °) → {сустав: рад}. Знаки MuJoCo проверены по мышцам
# с бесспорной функцией (внизу): у MyoSim ротация плеча и бедра «+» — внутрь, туловище «+» — разгибание (наклон вправо «+» —
# как у манекена: правая поясничная укорачивается)
SWEEPS = [
    ('elbow', 'R.elbow', range(0, 121, 10), lambda a: {'elbow_flexion_r': a * D}),
    ('pron', 'R.pron', range(-60, 61, 10), lambda a: {'pro_sup_r': a * D}),
    ('wrist_flex', 'R.wrist.0', range(-60, 61, 10), lambda a: {'flexion_r': a * D}),
    ('wrist_dev', 'R.wrist.1', range(-20, 16, 5), lambda a: {'deviation_r': a * D}),
    ('sh_abd', 'R.shoulder.1', range(0, 121, 10), lambda a: {'elv_angle_r': 0, 'shoulder_elv_r': a * D}),
    ('sh_flex', 'R.shoulder.0', range(0, 121, 10), lambda a: {'elv_angle_r': 90 * D, 'shoulder_elv_r': a * D}),
    ('sh_rot', 'R.shoulder.2', range(-60, 61, 10), lambda a: {'shoulder_rot_r': -a * D}),
    ('hip_flex', 'R.hip.0', range(-20, 101, 10), lambda a: {'hip_flexion_r': a * D}),
    ('hip_abd', 'R.hip.1', range(-20, 41, 10), lambda a: {'hip_adduction_r': -a * D}),
    ('hip_rot', 'R.hip.2', range(-30, 31, 10), lambda a: {'hip_rotation_r': -a * D}),
    ('knee', 'R.knee', range(0, 121, 10), lambda a: {'knee_angle_r': a * D}),
    ('ankle', 'R.ankle.0', range(-40, 31, 10), lambda a: {'ankle_angle_r': a * D}),
    ('subtalar', 'R.ankle.1', range(-20, 21, 5), lambda a: {'subtalar_angle_r': a * D}),
    # туловище: у MyoSim координата — сустав L5/S1, остальные поясничные уровни идут за ним по связям модели, и грудная
    # клетка поворачивается относительно таза почти вдвое больше координаты (TRUNK ниже). Угол манекена — поворот грудной
    # клетки относительно таза целиком, поэтому координата MyoSim делится на этот множитель
    ('trunk_flex', 'lumbar.0', range(-20, 41, 10), lambda a: {'flex_extension': -a * D / TRUNK['flex_extension']}),
    ('trunk_bend', 'lumbar.1', range(-20, 21, 10), lambda a: {'lat_bending': a * D / TRUNK['lat_bending']}),
    ('trunk_rot', 'lumbar.2', range(-10, 11, 5), lambda a: {'axial_rotation': a * D / TRUNK['axial_rotation']}),
]
TRUNK = {}


def trunk_gain(m, d):
    """во сколько раз поворот грудной клетки относительно таза больше координаты туловища (по повороту на 10°)"""
    ip, it = (mujoco.mj_name2id(m, OBJ.mjOBJ_BODY, b) for b in ('pelvis', 'torso'))
    for j in ('flex_extension', 'lat_bending', 'axial_rotation'):
        pose(m, d, {j: 10 * D}); R = d.xmat[ip].reshape(3, 3).T @ d.xmat[it].reshape(3, 3)
        TRUNK[j] = float(np.degrees(np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1)))) / 10


def main():
    m, d = load()
    trunk_gain(m, d)
    print('поворот грудной клетки на градус координаты туловища MyoSim:', {k: round(v, 3) for k, v in TRUNK.items()})
    muscles = [a for a in range(m.nu) if m.actuator_trntype[a] == mujoco.mjtTrn.mjTRN_TENDON and m.actuator_dyntype[a] == mujoco.mjtDyn.mjDYN_MUSCLE]
    names = [name(m, OBJ.mjOBJ_ACTUATOR, a) for a in muscles]
    out = {'source': 'MyoSim myofullbody (MuJoCo), tools/muscles/sweeps.py', 'trunkGain': {k: round(v, 4) for k, v in TRUNK.items()}, 'sweeps': []}
    full = {}
    for key, path, angles, f in SWEEPS:
        rows = []
        for a in angles:
            pose(m, d, f(a))
            rows.append([float(d.ten_length[m.actuator_trnid[k][0]]) * 100 for k in muscles])
        cols = {n: [round(r[i], 2) for r in rows] for i, n in enumerate(names)}; full[key] = cols
        out['sweeps'].append({'key': key, 'path': path, 'angles': list(angles),
                              'rows': {n: v for n, v in cols.items() if max(v) - min(v) > RANGE_MIN}})
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        json.dump(out, fh, separators=(',', ':'))
    print(OUT, sum(len(s['rows']) for s in out['sweeps']), 'строк (мышца × разворот),', len(SWEEPS), 'разворотов')
    # проверка соглашений знаков по мышцам с бесспорной функцией: «−» — укорачивается при росте угла манекена
    check = {'elbow': 'BIClong', 'pron': 'PQ', 'wrist_flex': 'FCR', 'wrist_dev': 'ECRL', 'sh_abd': 'DELT2', 'sh_flex': 'DELT1',
             'sh_rot': 'INFSP', 'hip_flex': 'iliacus_r', 'hip_abd': 'glmed2_r', 'hip_rot': 'piri_r', 'knee': 'bfsh_r',
             'ankle': 'tibant_r', 'subtalar': 'tibpost_r', 'trunk_flex': 'rect_abd_r', 'trunk_bend': 'Ps_L1_VB_r', 'trunk_rot': 'EO1_r'}
    for s in out['sweeps']:
        L = full[s['key']].get(check[s['key']])
        if L is None:
            print(s['key'], 'нет', check[s['key']]); continue
        print(f"{s['key']:11s} {check[s['key']]:10s} {L[0]:7.2f} → {L[-1]:7.2f} см ({'укорачивается' if L[-1] < L[0] else 'удлиняется'})")


if __name__ == '__main__':
    main()
