"""Модель MyoSim целиком (myofullbody: туловище, обе руки, ноги) в MuJoCo и общие помощники для сборки мышц.
   Нужны: клон https://github.com/MyoHub/myo_sim (переменная MYOSIM, по умолчанию /home/claude/myohub/myo_sim)
   и пакет mujoco (pip install mujoco). Длины — в метрах, как в модели."""
import os, sys
import numpy as np
import mujoco

MYO = os.environ.get('MYOSIM', '/home/claude/myohub/myo_sim').rstrip('/')
sys.path.insert(0, MYO)
from myo_sim.build import compose  # noqa: E402

W_SITE, W_SPHERE, W_CYL, W_PULLEY = (int(mujoco.mjtWrap.mjWRAP_SITE), int(mujoco.mjtWrap.mjWRAP_SPHERE),
                                     int(mujoco.mjtWrap.mjWRAP_CYLINDER), int(mujoco.mjtWrap.mjWRAP_PULLEY))
OBJ = mujoco.mjtObj


def load():
    m = compose.build_spec('myofullbody').compile()
    return m, mujoco.MjData(m)


def name(m, kind, i):
    return mujoco.mj_id2name(m, kind, int(i)) if i >= 0 else None


def coupled(m):
    """зависимые суставы: связь «y − y0 = a0 + a1·(x − x0) + …» (равенства типа joint)"""
    return {int(m.eq_obj1id[i]) for i in range(m.neq) if m.eq_type[i] == mujoco.mjtEq.mjEQ_JOINT and m.eq_active0[i]}


def apply_couplings(m, q):
    """ставит зависимые суставы по многочленам связей — как их держат равенства модели в равновесии"""
    for i in range(m.neq):
        if m.eq_type[i] != mujoco.mjtEq.mjEQ_JOINT or not m.eq_active0[i]:
            continue
        j1, j2 = int(m.eq_obj1id[i]), int(m.eq_obj2id[i]); c = m.eq_data[i][:5]; a1 = m.jnt_qposadr[j1]
        x = q[m.jnt_qposadr[j2]] - m.qpos0[m.jnt_qposadr[j2]] if j2 >= 0 else 0.0
        q[a1] = m.qpos0[a1] + sum(c[k] * x ** k for k in range(5))
    return q


def pose(m, d, angles=None, rng=None, spread=1.0):
    """qpos: нулевая поза, заданные углы {сустав: рад} или случайные в пределах суставов (доля spread диапазона)"""
    q = m.qpos0.copy(); dep = coupled(m)
    if rng is not None:
        for j in range(m.njnt):
            if m.jnt_type[j] != mujoco.mjtJoint.mjJNT_HINGE or j in dep or not m.jnt_limited[j]:
                continue
            lo, hi = m.jnt_range[j]; mid = (lo + hi) / 2; half = (hi - lo) / 2 * spread
            q[m.jnt_qposadr[j]] = rng.uniform(mid - half, mid + half)
    for k, v in (angles or {}).items():
        q[m.jnt_qposadr[mujoco.mj_name2id(m, OBJ.mjOBJ_JOINT, k)]] = v
    apply_couplings(m, q)
    d.qpos[:] = q
    mujoco.mj_fwdPosition(m, d)
    return d


def tendon_elements(m, d, t):
    """путь сухожилия в мире: [('s', точка) | ('w', тип, центр, матрица 3×3 по строкам, радиус, боковая точка|None)]"""
    out = []; a, n = m.tendon_adr[t], m.tendon_num[t]
    for j in range(a, a + n):
        ty, oid = int(m.wrap_type[j]), int(m.wrap_objid[j])
        if ty == W_SITE:
            out.append(('s', d.site_xpos[oid].copy()))
        elif ty in (W_SPHERE, W_CYL):
            side = int(round(m.wrap_prm[j]))
            out.append(('w', ty, d.geom_xpos[oid].copy(), d.geom_xmat[oid].reshape(3, 3).copy(), float(m.geom_size[oid][0]),
                        d.site_xpos[side].copy() if side >= 0 else None))
        else:
            raise ValueError(f'тип {ty} в сухожилии {name(m, OBJ.mjOBJ_TENDON, t)} не поддерживается')
    return out
