"""Подгонка подтянутой Anny под нейтральную стойку манекена 4.61.0 (кожа «только внешний вид»).

python3 tools/anny-look/fit.py [--stage pose|shape|all] [--iters 40] [--out tools/anny-look/fit.json]

Фенотип и местные формы — одобренные (tools/skin-anny/result/anny-toned.json). Подбираются:
  * pose — поза рига Anny по скелету 4.61.0: поясница и грудной отдел (spine05…01), шея, голова, ключицы (подъём, отведение),
    сдвиг всей Anny (вверх, вперёд), закрутки плеча, предплечья, бедра, сдвиг шеи с головой. Конечности стоят шарнирами на
    наших суставах по построению (anny_look.AnnyLook.bones_pose) — их суставы рига совпадают с нашими.
  * shape — поправки местных форм Anny (SHAPE ниже) там, где кожа Anny отходит от процедурной кожи 4.61.0 больше чем на
    2–3 см; поправки дорогие (ушли бы от одобренного вида), бесплатно — только расхождение до DEAD см.
Невязка — расстояние вершин Anny до процедурной кожи 4.61.0 (common.Procedural) по нормали, без кистей и стоп (их форма
своя, кисть ставится по суставам пальцев): мёртвая зона DEAD см (V-силуэт одобрен — грудь шире, талия уже), дальше —
линейно с весом зоны. Метод — scipy least_squares (trf, якобиан конечными разностями).
"""
import argparse, json, os, sys, time, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import common as C
from anny_look import AnnyLook, POSE_KEYS, q_from, v_from, FIT
from scipy.optimize import least_squares

DEAD = 1.0
ZW = {'голова': .6, 'шея': .8, 'надплечья': 1, 'грудь': 1, 'верх спины': 1, 'бока': 1, 'живот': 1, 'поясница': 1, 'ягодицы': 1, 'пах': .7,
      'дельты': .8, 'плечо': .8, 'локоть': .5, 'предплечье': .6, 'бедро': .8, 'колено': .5, 'голень': .6}
SHAPE = ['torso-scale-depth-incr', 'torso-scale-horiz-incr', 'torso-trans-forward', 'hip-trans-forward', 'buttocks-volume-incr',
         'measure-neck-circ-incr', 'neck-trans-forward', 'neck-scale-depth-incr', 'measure-upperarm-circ-incr', '*-upperarm-shoulder-muscle-incr',
         '*-upperarm-fat-incr', 'measure-shoulder-dist-incr', 'measure-thigh-circ-incr', 'measure-calf-circ-incr', 'hip-scale-depth-incr',
         'stomach-pregnant-incr', 'measure-underbust-circ-incr', '*-lowerarm-fat-incr', 'head-trans-forward', 'head-trans-up']
SHAPE_COST = .35   # цена поправки формы: 1,0 единицы местной формы = 1/0,35 ≈ 2,9 см невязки


class Fit:
    def __init__(self, nsub=4000):
        self.P = C.Procedural(); self.body = AnnyLook(); self.fit = json.load(open(FIT)) if os.path.exists(FIT) else {}
        self.hands = self.P.D['hands']
        lab = np.array(self.body.labels)[self.body.dominant]
        hf = np.array([l.startswith(('wrist', 'finger', 'metacarpal', 'foot', 'toe')) for l in lab])
        used = np.unique(self.body.skin_faces); used = used[~hf[used]]
        rng = np.random.default_rng(1); self.sub = np.sort(rng.choice(used, min(nsub, len(used)), replace=False)); self.used = used
        self._rest_key = None

    def rest(self, local_delta):
        key = tuple(sorted((k, round(v, 6)) for k, v in local_delta.items()))
        if key != self._rest_key:
            phen, local = self.body.params({'local_delta': local_delta}); self._rest = self.body.rest(phen, local); self._rest_key = key
            if self.body.groin is None:
                V = self.body.stance(self._rest, self.P.J, q_from(self.start_pose()), groin=False)[0]; self.body.setup_groin(V)
        return self._rest

    def start_pose(self):
        if 'pose' in self.fit: return self.fit['pose']
        return v_from(self.body.toned['rig_pose'])

    def shape_delta(self, x):
        out = {}
        for n, v in zip(SHAPE, x):
            if n.startswith('*'): out['l' + n[1:]] = v; out['r' + n[1:]] = v
            else: out[n] = v
        return out

    def resid(self, pose, delta_x, sub=True):
        rest = self.rest(self.shape_delta(delta_x))
        V = self.body.stance(rest, self.P.J, q_from(pose))[0]
        idx = self.sub if sub else self.used
        sd, i = self.P.query(V[idx]); z = self.P.zone_of_sample[i]
        w = np.array([ZW.get(k, .5) for k in z])
        a = np.abs(sd); r = w * np.sign(sd) * np.maximum(a - DEAD, 0)
        return r, sd, z, V

    def run(self, stage, iters):
        p0 = self.start_pose(); x0 = np.array([p0[k] for k in POSE_KEYS])
        # закрутки плеча, предплечья и бедра — из подгонки шага 1 (по ориентирам: надмыщелки, локтевой отросток, надколенник,
        # шиловидные отростки): по форме кожи их подбирать нельзя — сечения конечностей манекена — эллипсы, и подгонка
        # разворачивала бедро на 37° (надколенник вбок) и плечо на 66°
        tw0 = v_from(self.body.toned['rig_pose'])
        for k in ('tw_ua', 'tw_fa', 'tw_th'): x0[POSE_KEYS.index(k)] = tw0[k]
        FREE = [i for i, k in enumerate(POSE_KEYS) if not k.startswith('tw_')]
        d0 = np.array([self.fit.get('shape_x', {}).get(n, 0.0) for n in SHAPE])
        free_pose = stage in ('pose', 'all'); free_shape = stage in ('shape', 'all')
        def unpack(v):
            k = 0; pose = dict(zip(POSE_KEYS, x0)); dx = d0.copy()
            if free_pose:
                xx = x0.copy(); xx[FREE] = v[:len(FREE)]; pose = dict(zip(POSE_KEYS, xx)); k = len(FREE)
            if free_shape: dx = v[k:k + len(SHAPE)]
            return pose, dx
        v0 = np.concatenate(([x0[FREE]] if free_pose else []) + ([d0] if free_shape else []))
        nres = [0]
        def f(v):
            pose, dx = unpack(v); r = self.resid(pose, dx)[0]; nres[0] += 1
            reg = [.02 * (np.array([pose[k] for k in POSE_KEYS]) - x0)] if free_pose else []
            if free_shape: reg.append(SHAPE_COST * dx * 10 / 3)   # 0,3 единицы формы — 1 см невязки
            return np.concatenate([r] + reg)
        t0 = time.time(); r0 = f(v0)
        print(f'старт: стоимость {0.5 * np.sum(r0 ** 2):.1f}', flush=True)
        steps = np.concatenate(([np.full(len(FREE), .25)] if free_pose else []) + ([np.full(len(SHAPE), .02)] if free_shape else []))
        lb = np.concatenate(([np.full(len(FREE), -np.inf)] if free_pose else []) + ([np.full(len(SHAPE), -.6)] if free_shape else []))
        ub = -lb
        res = least_squares(f, v0, method='trf', loss='soft_l1', f_scale=2.0, max_nfev=iters, diff_step=steps / np.maximum(np.abs(v0), 1), x_scale='jac', bounds=(lb, ub), verbose=0)
        pose, dx = unpack(res.x)
        print(f'итог: стоимость {res.cost:.1f}, вычислений {nres[0]}, {time.time() - t0:.0f} с', flush=True)
        return pose, dx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stage', default='pose'); ap.add_argument('--iters', type=int, default=40); ap.add_argument('--out', default=FIT)
    a = ap.parse_args()
    F = Fit()
    pose0 = F.start_pose(); d0 = np.array([F.fit.get('shape_x', {}).get(n, 0.0) for n in SHAPE])
    r, sd, z, V = F.resid(pose0, d0, sub=False)
    C.print_stats(C.zone_stats(sd, z), 'до подгонки:')
    pose, dx = F.run(a.stage, a.iters)
    r, sd, z, V = F.resid(pose, dx, sub=False)
    C.print_stats(C.zone_stats(sd, z), 'после:')
    out = dict(F.fit); out['pose'] = {k: round(float(v), 4) for k, v in pose.items()}
    out['shape_x'] = {n: round(float(v), 4) for n, v in zip(SHAPE, dx)}
    out['local_delta'] = {k: round(float(v), 4) for k, v in F.shape_delta(dx).items() if abs(v) > 1e-6}
    out['note'] = 'fit.py: поза рига Anny по скелету 4.61.0 (градусы; t, neck_t — см), поправки местных форм к anny-toned.json'
    json.dump(out, open(a.out, 'w'), ensure_ascii=False, indent=1)
    print('→', a.out)


if __name__ == '__main__':
    main()
