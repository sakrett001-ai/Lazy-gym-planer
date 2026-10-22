"""Совместная подгонка Anny и посадки скелета (шаг 1): подтянутое телосложение по ANSUR II, мягкие ткани над костями,
осанка по нормам, место для мышц спины, голова на черепе, нейтральный пах, суставы рига на наших суставах.

python3 tools/skin-anny/fit_joint.py --work W [--iters 12] [--start fit0.json] [--posture posture-B.json] --out W/joint.json

Параметры:
  Anny — фенотип (мышцы, вес, рост, пропорции; пол мужской, 27 лет) и местные формы (LOCAL), поза её рига по нашему
  скелету (поясница и грудной отдел spine05…01, шея, голова, ключицы, сдвиг t) — anny_pose.AnnyPosed;
  скелет — посадка (spine.PARAMS: наклон таза, клинья дисков поясницы и шеи, поворот рёбер, наклон черепа).
Невязки (все — в долях допуска; весы — W_*):
  ANSUR II «подтянутый» (norms.ANSUR_TONED, единица — межквартильный размах людей); длины сегментов рига Anny против наших;
  подошва на полу; ткани над ориентирами — вне нормы norms.TISSUE (0,3 см — единица); кости снаружи кожи; место для
  длиннейшей на T3–T10 (не меньше norms.ROOM_MIN) и ткани над лопаткой (не меньше norms.SCAP_MIN); осанка
  (spine.posture_resid: углы и высоты по нормам, замыкание шеи на череп); наклон черепа — к посадке HAT (−12 ± 6°);
  поправки форм и позы Anny — как можно меньше.
Метод — Гаусс — Ньютон с затуханием, якобиан конечными разностями; столбцы скелета — без пересборки Anny.
"""
import argparse, json, os, sys, time, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
import norms, spine, checks
from anny_pose import AnnyPosed
from anny_measure import Measurer
from landmarks import Skeleton

PHEN = ['muscle', 'weight', 'height', 'proportions']
LOCAL = ['torso-scale-depth-incr', 'torso-scale-horiz-incr', 'torso-vshape-incr', 'torso-muscle-dorsi-incr', 'torso-muscle-pectoral-incr',
         'measure-bust-circ-incr', 'measure-underbust-circ-incr', 'measure-waist-circ-incr', 'measure-hips-circ-incr',
         'measure-shoulder-dist-incr', 'measure-frontchest-dist-incr', 'measure-napetowaist-dist-incr', 'measure-waisttohip-dist-incr',
         'hip-scale-horiz-incr', 'hip-scale-depth-incr', 'buttocks-volume-incr', 'stomach-pregnant-incr', 'stomach-navel-out',
         'torso-trans-forward', 'hip-trans-forward',
         'measure-neck-circ-incr', 'measure-neck-height-incr', 'neck-scale-depth-incr', 'neck-trans-forward', 'neck-back-scale-depth-incr',
         'measure-upperarm-circ-incr', 'measure-upperarm-length-incr', 'measure-lowerarm-length-incr', 'measure-wrist-circ-incr',
         '*-lowerarm-muscle-incr', '*-upperarm-shoulder-muscle-incr', '*-upperarm-fat-incr', '*-lowerarm-fat-incr',
         'measure-thigh-circ-incr', 'measure-knee-circ-incr', 'measure-calf-circ-incr', 'measure-ankle-circ-incr',
         'measure-upperleg-height-incr', 'measure-lowerleg-height-incr', '*-upperleg-fat-incr', '*-lowerleg-fat-incr',
         '*-foot-scale-depth-incr', '*-foot-scale-horiz-incr',
         'head-scale-vert-incr', 'head-scale-horiz-incr', 'head-scale-depth-incr', 'head-back-scale-depth-incr', 'head-trans-forward',
         'head-trans-up', 'head-fat-incr', 'forehead-trans-forward', 'chin-prominent-incr', 'chin-height-incr', 'chin-width-incr']
POSE = ['sp5', 'sp4', 'sp3', 'sp2', 'sp1', 'neck', 'head', 'clav_e', 'clav_r', 'ty', 'tz', 'tw_ua', 'tw_fa', 'tw_th', 'neck_ty', 'neck_tz']
NA = len(PHEN) + len(LOCAL) + len(POSE)
OUT_STEP = 10
SEG_OURS = {'th': 40.7, 'sk': 41.8, 'ua': 28.3, 'fa': 27.0}
W_ANSUR, W_TISSUE, W_OUT, W_ROOM, W_SCAP, W_SEG, W_FLOOR, W_SK = 2.0, 1.0, 2.0, 1.5, 2.0, .5, 3.0, 1.0
TRUNK_LM = ('C7',) + tuple('T%d' % i for i in range(1, 13)) + ('jugular', 'sternum', 'acromionL', 'clavicleL', 'scapSpineL', 'supAngleL',
            'infAngleL', 'iliacCrestL', 'ASISL', 'PSISL', 'sacrum', 'trochanterL')
LIMB_LM = ('patellaL', 'tibialCrestL', 'fibulaHeadL', 'latMalleolusL', 'medMalleolusL', 'olecranonL', 'latEpicondyleL', 'medEpicondyleL',
           'radialStyloidL', 'ulnarStyloidL')
HEAD_LM = ('vertex', 'glabella', 'nasion', 'pogonion', 'menton', 'gonionL', 'zygionL', 'opisthocranion', 'euryonL')
OUT_BONES = ('hyoid', 'thyroid', 'cricoid', 'thoracic', 'ribcage', 'L1', 'L2', 'L3', 'L4', 'L5', 'sacrum', 'pelvis', 'clavicle', 'scapula', 'humerus', 'ulna', 'radius',
             'femur', 'patella', 'tibia', 'fibula', 'skull', 'jaw', 'cervical')


class Model:
    def __init__(self, work):
        self.man = json.load(open(os.path.join(work, 'm461.json')))
        self.ep = json.load(open(os.path.join(work, 'endplates.json')))
        self.ref = json.load(open(os.path.join(ROOT, 'tools/mannequin/anthro-ansur2.json')))
        self.p = spine.Posture(self.man, self.ep)
        self.base = Skeleton(self.man)
        self.J = {k: np.array(v) for k, v in self.man['joints'].items()}
        self.body = AnnyPosed(); self.meas = Measurer(self.body, self.ref)
        self.meas.patella_top = float(self.base.bone('patella', 'L')[:, 1].max())
        self.tg = spine.posture_targets(self.p, self.ref['values'])
        self.F = {b['name'] + b['side']: b['F'] for b in self.base.bones}
        self.h0 = {f'T{k}': float(self.base.bone(f'thoracic{k}')[:, 1].mean() - 89.5) for k in range(3, 11)}
        self._skel_cache = {}

    # ---------------- части параметров ----------------
    def split(self, v):
        v = np.asarray(v, float); k = 0
        phen = {n: float(x) for n, x in zip(PHEN, v[k:k + len(PHEN)])}; k += len(PHEN)
        local = {}
        for n, x in zip(LOCAL, v[k:k + len(LOCAL)]):
            if n.startswith('*'): local['l' + n[1:]] = float(x); local['r' + n[1:]] = float(x)
            else: local[n] = float(x)
        k += len(LOCAL)
        a = v[k:k + len(POSE)]; k += len(POSE)
        q = {'spine': list(a[:5]), 'neck': a[5], 'head': a[6], 'clav': [a[7], a[8]], 't': [a[9], a[10]], 'tw': list(a[11:14]), 'neck_t': [a[14], a[15]]}
        x = spine.unpack(v[k:])
        return phen, local, q, x

    def anny(self, v):
        phen, local, q, x = self.split(v)
        rest = self.body.rest(phen, local)
        V, H, piv, heads = self.body.pose(rest, self.J, q)
        return V, H, rest, (piv, dict(self.body.last_lens))

    def skeleton(self, v):
        x = self.split(v)[3]; key = tuple(np.round(spine.pack(x), 6))
        if key not in self._skel_cache:
            posed, T, dsc = self.p.pose(x)
            sk = checks.skeleton_view(self.base, posed)
            LM = checks.landmarks_all(sk)
            pm = self.p.measures(x, (posed,))
            trunk = checks.bone_mesh({k: (posed[k], self.F[k]) for k in posed}, ('thoracic', 'ribcage'))
            tips = {f'T{k}': posed[f'thoracic{k}'][np.argmin(posed[f'thoracic{k}'][:, 2])] for k in range(3, 11)}
            if len(self._skel_cache) > 40: self._skel_cache.clear()
            self._skel_cache[key] = (posed, sk, LM, pm, trunk, tips, x)
        return self._skel_cache[key]

    # ---------------- невязки ----------------
    def resid(self, v, an=None, detail=False):
        V, H, rest, (piv, self._lens) = an if an is not None else self.anny(v)
        posed, sk, LM, pm, trunk, tips, x = self.skeleton(v)
        phen, local, q, _ = self.split(v)
        if getattr(self, '_skin_for', None) is not V:          # одна и та же Anny (столбцы скелета) — та же кожа
            self._skin = checks.Skin(V, self.body.skin_faces); self._skin_for = V
        skin = self._skin
        R = {}; ref = self.ref['values']
        m = self.meas.measure(V, H)
        R['ansur'] = W_ANSUR * np.array([w * (m[k] - norms.ansur_target(ref, k)) / max(ref[k][2] - ref[k][0], .3) for k, (t_, w) in norms.ANSUR_TONED.items()])
        L = dict(self._lens)       # от нашего сустава (в покое Anny) до сустава рига на конце сегмента
        R['seg'] = W_SEG * np.array([L[k] - SEG_OURS[k] for k in SEG_OURS])
        R['floor'] = np.array([W_FLOOR * V[:, 1].min() / .2])
        keys = list(TRUNK_LM + LIMB_LM + HEAD_LM)
        d = skin.depth(np.array([LM[k][0] for k in keys]))
        lo = np.array([checks.norm_of(k)[0] for k in keys]); hi = np.array([checks.norm_of(k)[1] for k in keys])
        R['tissue'] = W_TISSUE * np.where(d < lo, (lo - d) / .3, np.where(d > hi, (d - hi) / .3, 0.))
        bo, BP, bd = checks.bones_out(skin, self.base, posed, step=OUT_STEP)
        R['out'] = W_OUT * np.array([np.sqrt(np.mean(np.clip(.15 - bd[i0:i0 + n], 0, None) ** 2)) / .3 for i0, n in self._out_slices(posed)])
        room = checks.back_room(skin, trunk, tips, self.h0)
        rr = []
        for k, row in room.items():
            r_ = row.get('longissimus'); val = None if r_ is None else r_['room']
            rr.append(0.0 if val is None else max(0.0, norms.ROOM_MIN - val) / .3)
        R['room'] = W_ROOM * np.array(rr)
        sc = checks.scapula(skin, posed['scapulaL'][::2])
        R['scap'] = W_SCAP * np.array([max(0.0, norms.SCAP_MIN - sc['post_min']) / .3])
        rp, _ = spine.posture_resid(self.p, x, self.tg, m=pm, w={'cervicale': .2})
        R['posture'] = 1.5 * rp      # осанка — по нормам: вес выше тканей, Anny подстраивается позой и формой
        R['skull'] = np.array([W_SK * (x['sk'] + 12.0) / 4.0])     # череп — к посадке HAT (−12 ± 4°): лицо — формой, позой и сдвигом головы Anny
        R['reg'] = np.concatenate([.15 * np.asarray(v[len(PHEN):len(PHEN) + len(LOCAL)]),
                                   np.array(q['spine'] + [q['neck'], q['head']] + q['clav']) / 15.0, np.array(q['tw']) / 30.0, np.array(q['neck_t']) / 3.0])
        r = np.concatenate([R[k] for k in R])
        if detail:
            return r, dict(R=R, m=m, tissue=dict(zip(keys, d.tolist())), bones=bo, room=room, scap=sc, pm=pm, x=x, q=q, phen=phen,
                           local=local, seg=L, skin=skin, V=V, H=H, posed=posed, LM=LM, sk=sk, piv=piv)
        return r

    def _out_slices(self, posed):
        keys = [b['name'] + b['side'] for b in self.base.bones if b['kind'] not in checks.SKIP and b['seg']]
        out, i0 = [], 0
        for k in keys:
            n = len(posed[k][::OUT_STEP])
            if k.startswith(OUT_BONES) and not k.endswith('R'): out.append((i0, n))
            i0 += n
        return out


STEP = np.array([.1] * len(PHEN) + [.25] * len(LOCAL) + [4.0] * 9 + [2.0, 2.0] + [6.0] * 3 + [1.0, 1.0] + [4.0] * len(spine.PARAMS))


def gn(model, v, iters, lo, hi, log, free=None):
    na = NA; free = np.arange(len(v)) if free is None else np.asarray(free)
    def full(v, an=None): return model.resid(v, an)
    an = model.anny(v); r = full(v, an); lam = 1e-2
    log(f'старт: {r @ r:.2f}')
    for it in range(iters):
        t0 = time.time(); Jm = np.zeros((len(r), len(v)))
        for j in free:
            h = (.08 if j < len(PHEN) + len(LOCAL) else (1.0 if j < na else .3))
            h = h if v[j] + h <= hi[j] else -h
            vj = v.copy(); vj[j] += h
            Jm[:, j] = (full(vj, None if j < na else an) - r) / h
        Jf = Jm[:, free]; A = Jf.T @ Jf; g = Jf.T @ r; best = (r @ r, v, r, an)
        for lm in (lam, lam * 10, lam * 100):
            dv = np.zeros(len(v)); dv[free] = -np.linalg.solve(A + lm * np.diag(np.diag(A) + 1e-6), g)
            # область доверия: за шаг формы Anny — не больше 0,25 (фенотип — 0,1), углы — 4°, сдвиги — 2 см
            k = max(1.0, float(np.max(np.abs(dv) / STEP)))
            dv = dv / k
            for al in (1, .5, .25):
                vn = np.clip(v + al * dv, lo, hi); ann = model.anny(vn); rn = full(vn, ann)
                if rn @ rn < best[0]: best = (rn @ rn, vn, rn, ann)
        if best[0] >= r @ r - 1e-3:
            lam *= 10; log(f'шаг {it}: без улучшения, затухание {lam:g}')
            if lam > 1e3: break
            continue
        lam = max(lam / 3, 1e-4); _, v, r, an = best
        log(f'шаг {it}: {r @ r:.2f} ({time.time() - t0:.0f} с)')
        yield v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--start', default='fit0.json'); ap.add_argument('--posture', default='posture-B.json'); ap.add_argument('--resume')
    ap.add_argument('--iters', type=int, default=12); ap.add_argument('--pose-iters', type=int, default=4)
    ap.add_argument('--reset-posture', action='store_true', help='посадку скелета взять из --posture (форма Anny — из --resume)')
    a = ap.parse_args(); W = a.work
    model = Model(W)
    lo = np.array([0.] * len(PHEN) + [-1.] * len(LOCAL) + [-20] * 7 + [-15, -25] + [-30, -15] + [-45] * 3 + [-4, -4] + [-40] * len(spine.PARAMS))
    hi = np.array([1.] * len(PHEN) + [1.] * len(LOCAL) + [20] * 7 + [15, 25] + [30, 15] + [45] * 3 + [4, 4] + [40] * len(spine.PARAMS))
    if a.resume:
        v = np.array(json.load(open(a.resume))['v'], float)
        if len(v) == len(lo) - 5:      # старый файл без закруток конечностей и сдвига шеи
            k = len(PHEN) + len(LOCAL) + 11; v = np.concatenate([v[:k], [0, 0, 0, 0, 0], v[k:]])
        elif len(v) == len(lo) - 2:    # без сдвига шеи
            k = len(PHEN) + len(LOCAL) + 14; v = np.concatenate([v[:k], [0, 0], v[k:]])
        if a.reset_posture:
            v[len(v) - len(spine.PARAMS):] = spine.pack(json.load(open(os.path.join(W, a.posture))))
    else:
        st = json.load(open(os.path.join(W, a.start))); ps = json.load(open(os.path.join(W, a.posture)))
        phen0 = [st['phen'][k] for k in PHEN]
        loc0 = []
        for n in LOCAL:
            key = ('l' + n[1:]) if n.startswith('*') else n
            loc0.append(st['local'].get(key, 0.0))
        ti = model.body.t_init(model.body.rest(*model.split(np.array(phen0 + loc0 + [0] * len(POSE) + spine.pack(ps)))[:2]), model.J)
        v = np.array(phen0 + loc0 + [0] * 9 + ti + [0, 0, 0, 0, 0] + spine.pack(ps), float)
    it0 = len(PHEN) + len(LOCAL) + 9
    V0 = model.anny(v)[0]; model.body.setup_groin(V0)
    if not a.resume:
        # сдвиг Anny вперёд-назад и вверх-вниз — перебором (кожа против остистых и грудины, кости внутри)
        best = None
        for dz in np.arange(-9, 3.01, 1.0):
            for dy in (-2.0, 0.0, 2.0):
                vv = v.copy(); vv[it0] += dy; vv[it0 + 1] += dz; r = model.resid(vv)
                if best is None or r @ r < best[0]: best = (r @ r, vv)
        v = best[1]; print('старт: сдвиг Anny', np.round(v[it0:it0 + 2], 2), 'стоимость', round(best[0], 1), flush=True)
    lo[it0:it0 + 2] = v[it0:it0 + 2] - 15; hi[it0:it0 + 2] = v[it0:it0 + 2] + 15
    # пах: область сглаживания — по стартовой фигуре
    V0 = model.anny(v)[0]; model.body.setup_groin(V0)
    logf = open(a.out.replace('.json', '.log'), 'a')
    def log(s): print(s, flush=True); logf.write(s + '\n'); logf.flush()
    def save(v):
        r, D = model.resid(v, detail=True)
        json.dump({'v': v.tolist(), 'phen': D['phen'], 'local': D['local'], 'q': {k: (np.asarray(x).tolist() if not isinstance(x, float) else x) for k, x in D['q'].items()},
                   'posture': {k: (np.asarray(x).tolist() if not isinstance(x, float) else float(x)) for k, x in D['x'].items()},
                   'cost': float(r @ r), 'blocks': {k: float(b_ @ b_) for k, b_ in D['R'].items()}}, open(a.out, 'w'), indent=1)
        return D
    # этап 1 — только поза Anny (поясница, шея, голова, ключицы, сдвиг) и посадка скелета; этап 2 — всё вместе
    stage1 = list(range(len(PHEN) + len(LOCAL), len(v)))
    for stage, free, n in (('поза', stage1, a.pose_iters), ('всё', None, a.iters)):
        log(f'== этап: {stage}')
        for v in gn(model, v, n, lo, hi, log, free):
            D = save(v)
            log('  блоки: ' + ', '.join(f'{k} {float(b_ @ b_):.1f}' for k, b_ in D['R'].items()))
    save(v)


if __name__ == '__main__':
    main()
