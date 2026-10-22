"""Плечи Anny — к плечевым суставам манекена со встроенной осанкой (кожа Anny, шаг 2).

В шаге 1 скелет садился по осанке поверх выгрузки 4.61.0 (spine.Posture), кости рук сдвигались за грудино-ключичным
суставом (dsc ≈ 0; −0,55; −3,35 см), а руки Anny поворачивались вокруг прежних суставов (центр плечевого сустава — на 3,3 см
впереди). При встраивании плечевой сустав манекена идёт за грудино-ключичным назад (B.sc; по высоте — прежний, B.ghRel),
и Anny ставится на новые суставы: здесь — догонка позы ключиц и закруток рук Anny, её сдвига и форм плечевого пояса и груди
при прочих параметрах шага 1. Кости — новой сборки (build_bones.py с осанкой).

python3 tools/skin-anny/fit_shoulders.py --base W2/m-new.json --endplates W2/endplates-new.json --start W/joint.json --out W2/joint2.json
  --base       — выгрузка манекена со встроенной осанкой (mannequin.js export): кости и суставы;
  --endplates  — пластинки позвонков этой сборки (endplates.py);
  --start      — итог шага 1 (joint.json: v, phen, local, q, posture). Осанка в нём обнуляется: она уже в костях --base.
"""
import argparse, json, os, shutil, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import fit_joint as FJ
import spine

FREE_POSE = ['clav_e', 'clav_r', 'tw_ua', 'tw_fa', 'ty', 'tz']
FREE_LOCAL = ['measure-shoulder-dist-incr', '*-upperarm-shoulder-muscle-incr', 'torso-vshape-incr', 'torso-muscle-dorsi-incr',
              'torso-muscle-pectoral-incr', 'measure-upperarm-circ-incr', 'measure-frontchest-dist-incr', 'torso-trans-forward',
              'measure-bust-circ-incr', 'torso-scale-depth-incr', 'torso-scale-horiz-incr']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', required=True); ap.add_argument('--endplates', required=True); ap.add_argument('--start', required=True)
    ap.add_argument('--out', required=True); ap.add_argument('--iters', type=int, default=4); ap.add_argument('--sweeps', type=int, default=4)
    a = ap.parse_args()
    # рабочая папка для Model: кости и суставы — новой сборки (осанка уже в костях: параметры посадки — нули)
    W2 = os.path.dirname(os.path.abspath(a.out)); os.makedirs(W2, exist_ok=True)
    tmp = os.path.join(W2, 'fs-work'); os.makedirs(tmp, exist_ok=True)
    shutil.copy(a.base, os.path.join(tmp, 'm461.json')); shutil.copy(a.endplates, os.path.join(tmp, 'endplates.json'))
    model = FJ.Model(tmp)
    js = json.load(open(a.start)); v = np.array(js['v'], float); v[len(v) - len(spine.PARAMS):] = 0.0
    lo = np.array([0.] * len(FJ.PHEN) + [-1.] * len(FJ.LOCAL) + [-20] * 7 + [-15, -25] + [-30, -15] + [-45] * 3 + [-4, -4] + [-40] * len(spine.PARAMS))
    hi = np.array([1.] * len(FJ.PHEN) + [1.] * len(FJ.LOCAL) + [20] * 7 + [15, 25] + [30, 15] + [45] * 3 + [4, 4] + [40] * len(spine.PARAMS))
    it0 = len(FJ.PHEN) + len(FJ.LOCAL) + 9; lo[it0:it0 + 2] = v[it0:it0 + 2] - 15; hi[it0:it0 + 2] = v[it0:it0 + 2] + 15
    kp = len(FJ.PHEN) + len(FJ.LOCAL)
    free = [kp + FJ.POSE.index(n) for n in FREE_POSE] + [len(FJ.PHEN) + FJ.LOCAL.index(n) for n in FREE_LOCAL]
    V0 = model.anny(v)[0]; model.body.setup_groin(V0)
    logf = open(a.out.replace('.json', '.log'), 'a')
    def log(s): print(s, flush=True); logf.write(s + '\n'); logf.flush()
    def save(v):
        r, D = model.resid(v, detail=True)
        json.dump({'v': v.tolist(), 'phen': D['phen'], 'local': D['local'], 'q': {k: (np.asarray(x).tolist() if not isinstance(x, float) else x) for k, x in D['q'].items()},
                   'posture': {k: (np.asarray(x).tolist() if not isinstance(x, float) else float(x)) for k, x in D['x'].items()},
                   'cost': float(r @ r), 'blocks': {k: float(b_ @ b_) for k, b_ in D['R'].items()}}, open(a.out, 'w'), indent=1)
        return D
    D = save(v); log('старт (новые суставы рук): ' + ', '.join(f'{k} {float(b_ @ b_):.1f}' for k, b_ in D['R'].items()))
    for v in FJ.gn(model, v, a.iters, lo, hi, log, free):
        D = save(v); log('  блоки: ' + ', '.join(f'{k} {float(b_ @ b_):.1f}' for k, b_ in D['R'].items()))
    for v in FJ.polish(model, v, a.sweeps, lo, hi, log, free):
        D = save(v); log('  блоки: ' + ', '.join(f'{k} {float(b_ @ b_):.1f}' for k, b_ in D['R'].items()))
    save(v)


if __name__ == '__main__':
    main()
