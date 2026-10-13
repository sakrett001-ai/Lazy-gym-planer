"""Эталон MuJoCo для расчёта путей мышц: несколько поз модели MyoSim целиком (нулевая и случайные в пределах суставов),
   для каждого сухожилия — точки пути и огибающие тела в мире и длина, посчитанная самим MuJoCo.
   По этому файлу tools/muscles.test.js проверяет, что расчёт путей приложения (src/js/09br-muscles.js) совпадает с MuJoCo.
   python3 tools/muscles/mujoco_ref.py   → tools/muscles/fixtures/mujoco-paths.json.gz"""
import os, json, gzip
import numpy as np
from mjmodel import load, pose, tendon_elements, name, OBJ

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'mujoco-paths.json.gz')
r7 = lambda a: [round(float(x), 7) for x in np.ravel(a)]


def main():
    m, d = load(); rng = np.random.default_rng(7); poses = []
    for k in range(4):
        pose(m, d, rng=None if k == 0 else rng, spread=.8)
        tendons = []
        for t in range(m.ntendon):
            el = []
            for e in tendon_elements(m, d, t):
                if e[0] == 's':
                    el.append(['s', r7(e[1])])
                else:
                    _, ty, c, mat, r, side = e
                    el.append(['c' if ty == 5 else 'o', r7(c), r7(mat), round(r, 7), r7(side) if side is not None else None])
            tendons.append({'name': name(m, OBJ.mjOBJ_TENDON, t), 'length': round(float(d.ten_length[t]), 9), 'path': el})
        poses.append(tendons)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt') as f:
        json.dump({'source': 'MyoSim myofullbody, MuJoCo ' + __import__('mujoco').__version__, 'poses': poses}, f, separators=(',', ':'))
    print(OUT, round(os.path.getsize(OUT) / 1024), 'КБ;', m.ntendon, 'сухожилий ×', len(poses), 'позы')


if __name__ == '__main__':
    main()
