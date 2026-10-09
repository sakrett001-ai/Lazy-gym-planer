'use strict';
/* Группа G1: упражнения со штангой, стойками и скамьями.
   Оси: Z — вперёд от лица стоящего (вдоль скамьи), X — влево, Y — вверх; см. Пол Y = 0.
   Порядок построения позы: корпус и таз → опора → стопы → кисти к реальным ручкам → баланс. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const memo = f => { const m = new Map(); return t => { const k = +t.toFixed(4); if (!m.has(k)) m.set(k, f(t)); return m.get(k); }; };

/* ---------- Общие помощники ---------- */
const FEET = [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }];
const GRIPS = id => [{ body: 'gripL', prop: id }, { body: 'gripR', prop: id }];
/* Масса штанги: гриф 20 кг + блины; короткий гриф 10 кг */
const PLATE_KG = { 20: 20, 15: 15, 10: 10, 5: 5, 2.5: 2.5, 1.25: 1.25, c10: 10, c5: 5, c2: 2 };
const barKg = (plates, curl) => (curl ? 10 : 20) + 2 * plates.reduce((s, p) => s + (PLATE_KG[p] || 0), 0);

/* Стопы на полу: ax — полуширина между центрами голеностопов, az — z голеностопов, out — разворот носков (град),
   kneeOut — насколько колено уходит наружу относительно носка */
function placeFeet(C, q, { ax = 11, az = 0, out = 8, kneeOut = .2, heel = 0 } = {}) {
  const { V } = C;
  for (const s of S) {
    const g = C.M.SIGN[s], a = out * C.D2R, fwd = [g * Math.sin(a), 0, Math.cos(a)];
    const sup = [g * ax + fwd[0] * 13.5, 0, az + fwd[2] * 13.5];
    const pole = V.unit(V.add(fwd, [g, 0, 0], kneeOut));
    C.foot(q, s, sup, 0, pole, { forward: fwd, heel });
  }
}
/* Высота таза, при которой колени согнуты на kneeDeg (стопы уже стоят в ax/az; таз — в текущей ориентации) */
function hipHeightFor(C, q, kneeDeg, { ax = 11, az = 0 } = {}) {
  const { V, M } = C, L = Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(kneeDeg * C.D2R));
  const f = C.fk(q), hip = f.P.hipL, an = [ax, 8.5, az];
  const dx = hip[0] - an[0], dz = hip[2] - an[2];
  return q.root.p[1] + (an[1] + Math.sqrt(Math.max(0, L * L - dx * dx - dz * dz)) - hip[1]);
}
/* Расстояние плечевой сустав — запястье при сгибании локтя elbowDeg */
const armLen = (C, elbowDeg) => Math.sqrt(C.M.B.ua ** 2 + C.M.B.fa ** 2 + 2 * C.M.B.ua * C.M.B.fa * Math.cos(elbowDeg * C.D2R));
/* Прямой хват на горизонтальном грифе: большой палец к другой руке; обратный — наружу */
function gripBar(C, q, s, bar, half, pole, { under = false, wristExt = 0, axis, allowShort = false } = {}) {
  const { V } = C, lat = axis ? V.scale(axis, C.M.SIGN[s]) : [C.M.SIGN[s], 0, 0];
  return C.grip(q, s, V.add(bar, lat, half), under ? lat : V.scale(lat, -1), pole, { wristExt, allowShort });
}
/* Хват с явной ориентацией кисти: distal — направление от запястья к пальцам (через ручку), thumb — ось ручки
   в сторону большого пальца; локоть — к pole. Нужен там, где кисть сильно разогнута (гриф на ключицах, жим лёжа). */
function gripFrame(C, q, s, grip, thumb, distal, pole) {
  const { V, M } = C, g = M.SIGN[s], Rh = M.M3.frameYZ(V.scale(distal, -1), thumb);
  const wr = V.sub(grip, M.M3.v(Rh, [-g * M.B.grip[0], M.B.grip[1], M.B.grip[2]]));
  const r = M.solveArmWrist(q, s, wr, pole, Rh);
  q.hands = { ...(q.hands || {}), [s]: 'grip' };
  if (r.reachError > .05) throw Error(`Рука ${s} не дотягивается до хвата: ${r.reachError.toFixed(1)} см`);
  return r;
}
/* Хват широкого грифа за головой: при широком хвате ось грифа идёт в ладони наискось. Отклонение кисти
   делится между лучезапястным суставом и разворотом грифа в ладони (до ≈ 20°, как у живого атлета). */
function gripBarSplit(C, q, s, bar, half, pole, axis, { wristExt = 10, share = .5, maxTurn = 20 } = {}) {
  const { V, M } = C, g = M.SIGN[s], lat = V.scale(axis, g), thumbBar = V.scale(lat, -1), grip = V.add(bar, lat, half);
  gripBar(C, q, s, bar, half, pole, { axis, wristExt });
  for (let i = 0; i < 3; i++) {
    const f = C.fk(q), fa = V.unit(V.sub(f.P['wr' + s], f.P['el' + s]));
    /* отклонение кисти = угол предплечья с плоскостью, перпендикулярной оси грифа */
    const dev = 90 - V.angle(fa, thumbBar), turn = Math.max(-maxTurn, Math.min(maxTurn, dev * share));
    const k = V.unit(V.cross(thumbBar, fa)), thumb = V.unit(M.M3.v(M.M3.axis(k, -turn * C.D2R), thumbBar));
    let distal = V.unit(V.perp(fa, thumb)); distal = V.unit(M.M3.v(M.M3.axis(thumb, g * wristExt * C.D2R), distal));
    gripFrame(C, q, s, grip, thumb, distal, pole);
  }
}
/* Рука по углам: плечо по направлению ua, локоть согнут к fold на angle°, кисть — продолжение предплечья
   с разгибанием ext° вокруг оси ручки thumb. Возвращает точку хвата. */
function armByAngles(C, q, s, uaDir, fold, angle, thumb, ext = 0, turn = 0) {
  const { V, M } = C, f = C.fk(q), gh = f.P['gh' + s], u = V.unit(uaDir), E = V.add(gh, u, M.B.ua);
  const k = V.unit(V.cross(u, V.unit(V.perp(fold, u)))), w = V.unit(M.M3.v(M.M3.axis(k, angle * C.D2R), u)), W = V.add(E, w, M.B.fa);
  /* turn — поворот кисти вокруг предплечья (к супинации +), град: хват «полусупинированный» */
  thumb = V.unit(M.M3.v(M.M3.axis(w, -M.SIGN[s] * turn * C.D2R), V.unit(V.perp(thumb, w))));
  const distal = V.unit(M.M3.v(M.M3.axis(V.unit(thumb), M.SIGN[s] * ext * C.D2R), V.unit(V.perp(w, thumb))));
  const Rh = M.M3.frameYZ(V.scale(distal, -1), thumb);
  M.solveArmWrist(q, s, W, V.perp(u, V.unit(V.sub(W, gh))), Rh); q.hands = { ...(q.hands || {}), [s]: 'grip' };
  return C.fk(q).P['grip' + s];
}
/* Таз по наклону корпуса: theta — наклон вперёд от вертикали (град), корпус в плоскости YZ */
function pelvisPitch(C, q, theta, p = q.root.p) {
  const a = theta * C.D2R;
  return C.root(q, p, [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
}
/* Зазор между грифом (ось вдоль X через bar, |x| < 32) и ногами (бёдра, голени), см: поверхность—поверхность */
function legBarGap(C, q, bar, r = 1.4) {
  const R = C.M.catalogPose(q); let m = 99;
  for (let x = -32; x <= 32; x += 2) { const p = C.M.toCat([x, bar[1], bar[2]]); for (const s of S) for (const k of ['th', 'sk']) m = Math.min(m, C.M.limbSDF(R, k, s, p) - r); }
  return m;
}
/* Поза «наклон с грифом в прямых руках» (локаут становой, румынская, тяга в наклоне, Т-тяга):
   theta — наклон таза; spine — [поясница, грудной, шея]; bar.y — высота грифа или null (тогда гриф висит на прямых руках
   под плечами со смещением sa вперёд/назад); sa — насколько плечи впереди грифа; half — полуширина хвата.
   Высота таза подбирается так, чтобы руки были прямыми (локоть ≈ elbow°), горизонталь — балансом над серединой стопы. */
function hangPose(C, o) {
  const { V } = C, q = C.base(), st = o.st, half = o.half, kg = o.kg, sa = o.sa ?? 0, el = o.elbow ?? 4;
  pelvisPitch(C, q, o.theta, [0, o.hy0 ?? 90, o.hz0 ?? -8]);
  q.lumbar = [o.spine[0], 0, 0]; q.thoracic = [o.spine[1], 0, 0]; q.neck = [o.spine[2], 0, 0];
  for (const s of S) q[s].girdle = o.girdle || [0, 4];
  const D = Math.hypot(armLen(C, el) + 8, 2.6) - .25;
  const barAt0 = q => { const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), z = o.barZ ?? gh[2] - sa; return [0, o.barY ?? gh[1] - Math.sqrt(Math.max(0, D * D - (half - Math.abs(f.P.ghL[0])) ** 2 - (gh[2] - z) ** 2)), z]; };
  let dyBar = 0;
  const barAt = q => { const b = barAt0(q); return [b[0], b[1] + (o.barY == null ? dyBar : 0), b[2]]; };
  const hands = q => {
    const pole = s => V.unit(V.add(V.add([0, 0, -1], [0, 1, 0], .3), [C.M.SIGN[s], 0, 0], .55));
    for (let i = 0; i < 6; i++) {
      const bar = barAt(q);
      let re = 0; for (const s of S) re += gripBar(C, q, s, bar, half, pole(s), { wristExt: o.wristExt ?? 0, allowShort: true }).reachError / 2;
      const f = C.fk(q), err = armLen(C, el) - (V.dist(f.P.ghL, f.P.wrL) + V.dist(f.P.ghR, f.P.wrR)) / 2 - re;
      if (Math.abs(err) < .01) break;
      if (o.barY == null) dyBar -= err; else q.root.p[1] += err;
    }
    const bar = barAt(q); for (const s of S) gripBar(C, q, s, bar, half, pole(s), { wristExt: o.wristExt ?? 0 });
    return bar;
  };
  const height = q => {
    if (o.barY == null) { q.root.p[1] = hipHeightFor(C, q, o.knee ?? 4, st); return; }
    /* гриф на заданной высоте: таз так, чтобы плечевые суставы были на длину руки от хвата */
    const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), dx = half - Math.abs(f.P.ghL[0]), dz = gh[2] - (o.barZ ?? gh[2] - sa);
    const dy = Math.sqrt(Math.max(1, D * D - dx * dx - dz * dz));
    q.root.p[1] += o.barY + dy - gh[1];
  };
  C.balanceOver(q, [0, 0, (st.az ?? 0) + (o.mid ?? 6)], {
    loads: q => [[barAt(q), kg]],
    resolve: q => { height(q); placeFeet(C, q, st); hands(q); }
  });
  q._bar = barAt(q);
  return q;
}

/* Наклон с грифом в руках при заданном положении грифа: плечевые суставы ставятся на длину прямой руки над грифом
   со смещением sa вперёд (плечи впереди грифа); остаются только наклон корпуса и ноги. */
function hingeAtBar(C, o) {
  const { V } = C, q = C.base(), half = o.half, el = o.elbow ?? 4, bar = o.bar, sa = o.sa ?? 0;
  pelvisPitch(C, q, o.theta, [0, 70, -20]);
  q.lumbar = [o.spine[0], 0, 0]; q.thoracic = [o.spine[1], 0, 0]; q.neck = [o.spine[2], 0, 0];
  for (const s of S) q[s].girdle = o.girdle || [0, 4];
  const D = Math.hypot(armLen(C, el) + 8, 2.6) - .25;
  for (let i = 0; i < 3; i++) {
    const f = C.fk(q), dx = half - Math.abs(f.P.ghL[0]);
    C.rootAtShoulders(q, [0, bar[1] + Math.sqrt(D * D - dx * dx - sa * sa), bar[2] + sa]);
  }
  const pole = s => V.unit(V.add(V.add([0, 0, -1], [0, 1, 0], .3), [C.M.SIGN[s], 0, 0], .55));
  for (let i = 0; i < 6; i++) {
    let re = 0; for (const s of S) re += gripBar(C, q, s, bar, half, pole(s), { wristExt: o.wristExt ?? 0, allowShort: true }).reachError / 2;
    const f = C.fk(q), err = armLen(C, el) - (V.dist(f.P.ghL, f.P.wrL) + V.dist(f.P.ghR, f.P.wrR)) / 2 - re;
    if (Math.abs(err) < .01) break;
    q.root.p[1] += err;
  }
  placeFeet(C, q, o.st);
  for (const s of S) gripBar(C, q, s, bar, half, pole(s), { wristExt: o.wristExt ?? 0 });
  q._bar = bar;
  return q;
}

/* ---------- Становая тяга ---------- */
const DL_ST = { ax: 11, az: 0, out: 10, kneeOut: 0 };
const DL = memo(t => {
  const C = ctx([]);
  const base = { half: 29, kg: 100, st: DL_ST };
  if (t >= 1 - 1e-6) {
    /* локаут: таз и колени выпрямлены без переразгибания, гриф касается бёдер */
    const build = sa => hangPose(C, { ...base, theta: 0, spine: [0, 0, 0], sa, knee: 3, girdle: [-2, -6] });
    const sa = C.solve1D(sa => legBarGap(C, build(sa), build(sa)._bar) - .9, -14, 4, 24);
    return build(sa);
  }
  /* t, [y, z] грифа, плечи впереди грифа, зазор гриф—нога, [поясница, грудной, шея], диапазон наклона таза */
  const K = [[0, [22.6, 9], 4, .5, [8, 7, -16], [44, 64]], [.1, [29, 8.8], 3.8, .9, [8, 8, -14], [44, 64]], [.2, [36, 8.6], 3.5, .9, [6, 7, -13], [44, 60]], [.4, [49, 8.4], 2.5, 1, [3, 3, -9], [36, 50]],
    [.6, [60, 8.8], 1.5, 1, [1, 2, -6], [22, 38]], [.8, [69, 9.4], .5, 1, [0, 0, -3], [8, 26]]];
  const k = K.find(p => Math.abs(p[0] - t) < 1e-6);
  const build = th => hingeAtBar(C, { ...base, theta: th, spine: k[4], bar: [0, k[1][0], k[1][1]], sa: k[2], girdle: [0, 6] });
  /* наклон таза подбирается так, чтобы гриф шёл вдоль голеней и бёдер с заданным зазором */
  const err = th => { try { const q = build(th); return legBarGap(C, q, q._bar) - k[3]; } catch (e) { return 50; } };
  return build(C.solve1D(err, k[5][0], k[5][1], 24));
});

/* ---------- Румынская тяга ---------- */
const RDL_ST = { ax: 10, az: 0, out: 6, kneeOut: 0 };
const RDL = memo(t => {
  const C = ctx([]);
  /* t, наклон таза, колени, [поясница, грудной, шея] */
  const K = [[0, 0, 10, [0, 0, 0]], [.25, 22, 16, [1, 2, -4]], [.5, 42, 22, [3, 5, -8]], [.75, 59, 28, [5, 9, -11]], [1, 72, 33, [7, 11, -13]]];
  const k = K.find(p => Math.abs(p[0] - t) < 1e-6);
  const build = sa => hangPose(C, { half: 33, kg: 60, st: RDL_ST, theta: k[1], knee: k[2], spine: k[3], sa, girdle: [0, C.lerp(-4, 6, t)] });
  /* гриф скользит вдоль бёдер и голеней: зазор ≈ 1 см */
  return build(C.solve1D(sa => { const q = build(sa); return legBarGap(C, q, q._bar) - 1; }, -30, 30, 22));
});

/* ---------- Тяга штанги в наклоне ---------- */
const ROW_ST = { ax: 11, az: 0, out: 8, kneeOut: 0 };
const BBROW = once(() => {
  const C = ctx([]);
  /* исходное: корпус наклонён (таз 44°, грудной отдел ≈ 52° от вертикали), колени согнуты, гриф висит под плечами */
  const q = hangPose(C, { half: 25, kg: 60, st: ROW_ST, theta: 44, knee: 24, spine: [3, 5, -10], sa: 0, girdle: [2, 10] });
  const L = C.axes(q, 'lumbar'), belly = C.chestPoint(q, 13);
  return { q, bar0: q._bar, bar1: C.V.add(belly, L.z, 2.4) };
});

/* ---------- Жим штанги стоя ---------- */
const OHP_ST = { ax: 11, az: 0, out: 8, kneeOut: 0 };
const OHP_KG = barKg([10]), SQ_KG = barKg([20]), GM_KG = barKg([10]);
/* Руки «на ключицах» прямой кинематикой: плечо вперёд-вниз-наружу, предплечье почти вертикально, кисть разогнута;
   гриф — посередине между хватами (≈ на 10 см выше плечевых суставов, у подбородка), локти впереди грифа. */
function rackArms(C, q, { ua = [.3, -1, .5], fa = [.1, 1, 0], ext = 40 } = {}) {
  const { V, M } = C, f = C.fk(q);
  for (const s of S) {
    const g = M.SIGN[s], gh = f.P['gh' + s], u1 = V.unit([g * ua[0], ua[1], ua[2]]), u2 = V.unit([g * fa[0], fa[1], fa[2]]);
    const E = V.add(gh, u1, M.B.ua), W = V.add(E, u2, M.B.fa), a = ext * C.D2R;
    const Rh = M.M3.frameYZ([0, -Math.cos(a), Math.sin(a)], [-g, 0, 0]);
    M.solveArmWrist(q, s, W, u1, Rh); q.hands = { ...(q.hands || {}), [s]: 'grip' };
  }
  const g2 = C.fk(q); return V.mix(g2.P.gripL, g2.P.gripR, .5);
}
/* стойка с грифом: theta — наклон таза (минус — назад), spine — [поясница, грудной, шея], girdle — плечевой пояс;
   arms(q) ставит руки и возвращает положение грифа */
function ohpStand(C, o) {
  const q = C.base();
  pelvisPitch(C, q, o.theta, [0, 94, 0]);
  q.lumbar = [o.spine[0], 0, 0]; q.thoracic = [o.spine[1], 0, 0]; q.neck = [o.spine[2], 0, 0];
  for (const s of S) q[s].girdle = [...o.girdle];
  let bar;
  C.balanceOver(q, [0, 0, OHP_ST.az + 5], { loads: () => [[bar || [0, 150, 8], OHP_KG]], resolve: q => { q.root.p[1] = hipHeightFor(C, q, 3, OHP_ST); placeFeet(C, q, OHP_ST); bar = o.arms(q); } });
  q._bar = bar;
  return q;
}
const OHP = memo(t => {
  const C = ctx([]), { V } = C;
  const start = ohpStand(C, { theta: 0, spine: [0, 0, 0], girdle: [6, 10], arms: q => rackArms(C, q) });
  if (t < 1e-6) return start;
  const Zb = start._bar[2], Yr = start._bar[1], half = Math.abs(C.fk(start).P.gripL[0]);
  /* t, высота грифа (null — локаут), наклон таза, [поясница, грудной, шея], плечевой пояс */
  const K = [[.2, Yr + 11, -2, [-2, -2, -10], [10, 8]], [.4, Yr + 24, -3, [-3, -2, -12], [16, 6]], [.6, Yr + 37, -2, [-2, -1, -7], [22, 4]], [.8, Yr + 48, -1, [-1, 0, -2], [27, 2]], [1, null, 0, [0, 0, 4], [30, 0]]];
  const k = K.find(p => Math.abs(p[0] - t) < 1e-6), a = C.lerp(32, 6, t) * C.D2R, distal = [0, Math.cos(a), -Math.sin(a)];
  const pole = s => V.unit(V.add(V.add([0, -1, 0], [C.M.SIGN[s], 0, 0], C.lerp(.5, 1.1, t)), [0, 0, 1], C.lerp(.6, 0, t)));
  const lockY = q => { const f = C.fk(q); return (f.P.ghL[1] + f.P.ghR[1]) / 2 + Math.sqrt(Math.max(0, (armLen(C, 4) + 8.1) ** 2 - (half - Math.abs(f.P.ghL[0])) ** 2 - (Zb - f.P.ghL[2]) ** 2)) - 1.5; };
  const arms = q => {
    const bar = [0, k[1] ?? lockY(q), Zb];
    for (let i = 0; i < (k[1] == null ? 5 : 1); i++) {
      for (const s of S) { const lat = [C.M.SIGN[s], 0, 0]; gripFrame(C, q, s, V.add(bar, lat, half), V.scale(lat, -1), distal, pole(s)); }
      /* локаут: руки выпрямлены (локоть ≈ 5°) */
      if (k[1] == null) { const f = C.fk(q); bar[1] += armLen(C, 5) - V.dist(f.P.ghL, f.P.wrL); }
    }
    for (const s of S) { const lat = [C.M.SIGN[s], 0, 0]; gripFrame(C, q, s, V.add(bar, lat, half), V.scale(lat, -1), distal, pole(s)); }
    return bar;
  };
  return ohpStand(C, { theta: k[2], spine: k[3], girdle: k[4], arms });
});

/* ---------- Гриф на трапециях (присед, наклоны, Смит) ---------- */
/* Точка грифа на верхней части трапеций: чуть ниже C7, гриф лежит на спине (поджатие мышц ≈ 0,4 см) */
function barOnTraps(C, q, h = 52, r = 1.4) {
  const R = C.M.catalogPose(q), p = C.M.torsoPoint(R, h, 'L', Math.PI), c = C.M.spineFrame(R, h).c;
  const P = [p[0], C.M.FLOOR - p[1], p[2]], Cc = [c[0], C.M.FLOOR - c[1], c[2]], n = C.V.unit(C.V.sub(P, Cc));
  return C.V.add(P, n, r - .4);
}
/* Присед / наклон со штангой на спине: таз по наклону theta, высота таза hy; стопы стоят, баланс по горизонтали.
   Хват широкий, локти вниз-назад. */
function backBarPose(C, o) {
  const { V } = C, q = C.base(), half = o.half ?? 40;
  pelvisPitch(C, q, o.theta, [0, o.hy, o.hz0 ?? -10]);
  q.lumbar = [o.spine[0], 0, 0]; q.thoracic = [o.spine[1], 0, 0]; q.neck = [o.spine[2], 0, 0];
  for (const s of S) q[s].girdle = o.girdle || [4, -8];
  const hands = q => {
    const bar = barOnTraps(C, q, o.barH ?? 52), T = C.axes(q, 'thorax');
    for (const s of S) { const lat = V.scale(T.x, C.M.SIGN[s]), pole = V.unit(V.add(V.add(V.scale(T.y, -1), T.z, -(o.elbowBack ?? .8)), lat, o.elbowOut ?? .9)); gripBarSplit(C, q, s, bar, half, pole, T.x, { wristExt: 10, share: .6, maxTurn: 24 }); }
    return bar;
  };
  if (o.fixed) { placeFeet(C, q, o.st); q._bar = hands(q); return q; }
  if (o.barZ != null) {
    /* гриф на направляющих (Смит): таз сдвигается по горизонтали так, чтобы гриф был на линии направляющих */
    for (let i = 0; i < 8; i++) {
      if (o.knee != null) q.root.p[1] = hipHeightFor(C, q, o.knee, o.st);
      const b = barOnTraps(C, q, o.barH ?? 52); q.root.p[2] += o.barZ - b[2]; q.root.p[0] -= b[0];
      if (Math.abs(o.barZ - b[2]) < .02) break;
    }
    if (o.knee != null) q.root.p[1] = hipHeightFor(C, q, o.knee, o.st);
    placeFeet(C, q, o.st); q._bar = hands(q); return q;
  }
  C.balanceOver(q, [0, 0, o.st.az + (o.mid ?? 5)], { loads: q => [[barOnTraps(C, q, o.barH ?? 52), o.kg]], resolve: q => { if (o.knee != null) q.root.p[1] = hipHeightFor(C, q, o.knee, o.st); placeFeet(C, q, o.st); hands(q); } });
  q._bar = barOnTraps(C, q, o.barH ?? 52);
  return q;
}

/* ---------- Приседания со штангой ---------- */
const SQ_ST = { ax: 15, az: 0, out: 15, kneeOut: 0 };
const SQ = memo(t => {
  const C = ctx([]), e = t;
  /* опускание: таз и колени сгибаются одновременно; внизу бёдра около параллели, гриф над серединой стопы */
  const th = 45 * Math.pow(e, .5), hy = e < 1e-6 ? null : C.lerp(94, 56.5, Math.pow(e, 1.1));
  return backBarPose(C, { theta: th, hy: hy ?? 94, knee: hy == null ? 3 : null, spine: [8 * e, 3 * e, -14 * e], st: SQ_ST, kg: SQ_KG, half: 49, girdle: [12, -20] });
});

/* ---------- Наклоны со штангой на плечах ---------- */
const GM_ST = { ax: 11, az: 0, out: 8, kneeOut: 0 };
const GM = memo(t => {
  const C = ctx([]);
  /* t, наклон таза, колени, [поясница, грудной, шея] */
  const K = [[0, 0, 4, [0, 0, 0]], [.25, 20, 10, [1, 1, -5]], [.5, 39, 15, [3, 2, -11]], [.75, 52, 20, [4, 4, -16]], [1, 62, 25, [6, 6, -21]]];
  const k = K.find(p => Math.abs(p[0] - t) < 1e-6);
  return backBarPose(C, { theta: k[1], hy: 90, knee: k[2], spine: k[3], st: GM_ST, kg: GM_KG, half: 49, girdle: [12, -20] });
});

/* ---------- Приседания в машине Смита ---------- */
const SMITH_PLATES = [[20, 3.4]];  /* «десятки» Ø40: диски проходят внутри рамы */
const SSQ_ST = { ax: 15, az: 14, out: 12, kneeOut: 0 };
const SSQ = memo(t => {
  const C = ctx([]), e = t;
  /* стопы на 14 см впереди грифа: корпус прямее, пятки на полу, колени по носкам */
  const th = 30 * Math.pow(e, .6), hy = e < 1e-6 ? null : C.lerp(94, 57, Math.pow(e, 1.1));
  return backBarPose(C, { theta: th, hy: hy ?? 94, knee: hy == null ? 4 : null, spine: [6 * e, 2 * e, -8 * e], st: SSQ_ST, half: 49, girdle: [12, -20], barZ: 0 });
});

/* ---------- Лёжа на горизонтальной скамье ---------- */
/* Лёжа на спине на скамье высотой 44 (ось вдоль Z, голова к +Z): лопатки и ягодицы на подушке, стопы на полу.
   arch — прогиб (поясница/грудной), feetZ — где стоят стопы. Как в эталонном жиме лёжа. */
function lieOnBench(C, { rootZ = -24, arch = [-5, -9], feet = { z: -78, x: 27 }, girdle = [-4, -14], benchY = 44 } = {}) {
  const { V } = C, q = C.base();
  C.root(q, [0, benchY + 18, rootZ], [0, 0, 1], [0, 1, 0]);
  q.lumbar = [arch[0], 0, 0]; q.thoracic = [arch[1], 0, 0];
  for (const s of S) q[s].girdle = [...girdle];
  C.restOn2(q, 'upperBack', 'buttocks', [0, benchY, 0], [0, 1, 0], -1.2);
  C.neckTo(q, 'headBack', [0, benchY, 0], [0, 1, 0], -.5);
  for (const s of S) {
    const lat = C.latP(q, s), fwd = V.unit(V.add([0, 0, -1], lat, .3));
    C.foot(q, s, V.add([0, 0, feet.z], lat, feet.x), 0, V.unit(V.add([0, .5, -1], lat, .5)), { forward: fwd });
  }
  return q;
}
/* Жим лёжа: гриф от прямых рук над плечами к груди. half — полуширина хвата, chestH — точка касания на груди,
   pole(lat) — полюс локтя; top — сколько гриф выше плечевых суставов (по умолчанию прямые руки). */
function benchPress(C, q, t, { half, chestH = 31, pole, wristExt = 10, topZ = 2, elbowTop = 6 }) {
  const { V } = C, e = C.ease(t), f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), chest = C.chestPoint(q, chestH);
  const bottom = [0, chest[1] + 1.7, chest[2]];
  /* верх: руки выпрямлены (локоть ≈ elbowTop) — подбираем высоту по фактической длине руки */
  let topY = gh[1] + 55;
  for (let i = 0; i < 6; i++) {
    const qq = C.M.clone(q); for (const s of S) { const lat = C.lat(qq, s); C.grip(qq, s, V.add([0, topY, gh[2] + topZ], lat, half), V.scale(lat, -1), pole(lat), { wristExt, allowShort: true }); }
    const ff = C.fk(qq), d = (V.dist(ff.P.ghL, ff.P.wrL) + V.dist(ff.P.ghR, ff.P.wrR)) / 2;
    topY += armLen(C, elbowTop) - d;
  }
  const bar = [0, C.lerp(topY, bottom[1], e), C.lerp(gh[2] + topZ, bottom[2], Math.pow(e, .8))];
  for (const s of S) { const lat = C.lat(q, s); C.grip(q, s, V.add(bar, lat, half), V.scale(lat, -1), pole(lat), { wristExt }); }
  return bar;
}

/* ---------- Жим лёжа в машине Смита ---------- */
/* Скамья поставлена так, чтобы гриф опускался на низ груди; направляющие — над этой точкой */
const SBENCH = once(() => {
  const C = ctx([]), q = lieOnBench(C, { girdle: [-4, -14] }), chest = C.chestPoint(q, 31);
  return { q, z: +chest[2].toFixed(1), y: chest[1] + 1.7 };
});

/* ---------- Сгибание запястий сидя ---------- */
/* Сидя поперёк скамьи (скамья развёрнута вдоль X), лицом к +Z; предплечья лежат на бёдрах, кисти за коленями */
const WRIST = once(() => {
  const C = ctx([]), { V, M } = C;
  /* подушка скамьи (повёрнута вдоль X): верх Y = 44, z ∈ [−14,5; 14,5] */
  const padSDF = p => { const d = [Math.abs(p[0]) - 60, Math.abs(p[1] - 41) - 3, Math.abs(p[2]) - 14.5]; return Math.hypot(...d.map(v => Math.max(v, 0))) + Math.min(Math.max(...d), 0); };
  const seat = th => {
    const q = C.base(), a = th * C.D2R;
    C.root(q, [0, 54, -5], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
    q.lumbar = [6, 0, 0]; q.thoracic = [10, 0, 0]; q.neck = [14, 0, 0];
    for (const s of S) q[s].girdle = [-2, 12];
    const feet = () => { for (const s of S) { const g = M.SIGN[s]; C.foot(q, s, [g * 14, 0, 36 + 13.5], 0, V.unit([g * .12, 0, 1]), { forward: V.unit([g * .1, 0, 1]) }); } };
    for (let i = 0; i < 4; i++) { feet(); const m = Math.min(...C.region(q, 'buttocks').map(padSDF)); q.root.p[1] += -1.3 - m; }
    feet();
    return q;
  };
  /* предплечье: тыльной стороной на верхней поверхности бедра, запястье на 3,5 см дальше колена */
  const fore = q => {
    const f = C.fk(q), out = {};
    for (const s of S) {
      const th = f.F['th' + s], hip = f.P['hip' + s], kn = f.P['kn' + s], up = M.M3.col(th.R, 2), dir = V.unit(V.sub(kn, hip));
      const W = V.add(V.add(kn, dir, 3.5), up, 5.8 + 2.5), E = V.add(V.add(W, dir, -M.B.fa), up, 4.6);
      out[s] = { W, E, w: V.unit(V.sub(W, E)) };
    }
    return out;
  };
  const err = th => { const q = seat(th), F = fore(q), f = C.fk(q); return V.dist(f.P.ghL, F.L.E) - M.B.ua; };
  const th = C.solve1D(err, 0, 60, 30), q = seat(th);
  return { q, F: fore(q), th };
});

/* ---------- Ягодичный мост со штангой ---------- */
/* Скамья поперёк (вдоль X), её передняя кромка — линия z = HT_EDGE, y = 44; нижний край лопаток лежит на кромке.
   psi — подъём головного конца корпуса над горизонталью (вверху ≈ 0, внизу таз опущен). */
const HT_BENCH = -42, HT_EDGE = HT_BENCH + 14.5;
function thrustBody(C, psi, { neck = 20, spine = [0, 0], scap = 33 } = {}) {
  const { V, M } = C, q = C.base(), a = psi * C.D2R, up = [0, Math.sin(a), -Math.cos(a)], fwd = [0, Math.cos(a), Math.sin(a)];
  C.root(q, [0, 50, HT_EDGE + 30], up, fwd);
  q.lumbar = [spine[0], 0, 0]; q.thoracic = [spine[1], 0, 0]; q.neck = [neck, 0, 0];
  for (const s of S) q[s].girdle = [0, -6];
  /* точка оси корпуса на высоте лопаток — над кромкой на глубину спины (поджатие 1,2 см) */
  for (let i = 0; i < 3; i++) {
    const R = M.catalogPose(q), c = M.spineFrame(R, scap).c, cc = [c[0], M.FLOOR - c[1], c[2]], b = M.sectionAt(scap)[2];
    const T = C.axes(q, 'thorax'), target = V.add([0, 44, HT_EDGE], T.z, b - 1.2);
    q.root.p = V.add(q.root.p, V.sub(target, cc));
  }
  return q;
}
const HT = memo(t => {
  const C = ctx([]), { V, M } = C;
  /* стопы: в верхней точке голени вертикальны, колени ≈ 90°, бёдра продолжают линию корпуса */
  const top = thrustBody(C, 1, { neck: 26 });
  for (const s of S) { top[s].hip = [0, 7, 6]; top[s].knee = 90; }
  const fTop = C.fk(top), feet = {};
  for (const s of S) { const kn = fTop.P['kn' + s]; feet[s] = [kn[0] * 1.15, 0, kn[2] + 1]; }
  const psi = C.lerp(1, 38, 1 - C.ease(t)), q = thrustBody(C, psi, { neck: C.lerp(8, 26, C.ease(t)) });
  for (const s of S) {
    const g = M.SIGN[s], fwd = V.unit([g * .14, 0, 1]);
    C.foot(q, s, V.add(feet[s], fwd, 13.5), 0, V.unit([g * .2, .3, 1]), { forward: fwd });
  }
  /* гриф с подушкой ложится в сгиб бёдер сверху: подбираем высоту, при которой поролон (R 5) поджат на 1 см */
  const R = M.catalogPose(q), cache = M.torsoCache(R);
  const gap = B => { let m = 99; for (let x = -20; x <= 20; x += 2) { const p = M.toCat([x, B[1], B[2]]); m = Math.min(m, M.torsoSDF(R, p, cache), ...S.map(s => M.limbSDF(R, 'th', s, p))); } return m - 5; };
  const base = V.add(q.root.p, [0, 0, 1.5]), d = C.solve1D(d => gap(V.add(base, [0, d, 0])) + 1, 0, 30, 30), bar = V.add(base, [0, d, 0]);
  const P = C.axes(q, 'pelvis');
  for (const s of S) { const lat = C.lat(q, s), pole = V.unit(V.add(V.add(V.scale(P.y, -.7), lat, 1), P.z, .15)); gripBar(C, q, s, bar, 31, pole, { axis: [1, 0, 0], wristExt: 10 }); }
  q._bar = bar;
  return q;
});

/* ---------- Наклонная скамья (станция и регулируемая скамья в Смите) ---------- */
/* Сидя на наклонной скамье спиной к спинке: спина на спинке, таз на сиденье, стопы на полу перед сиденьем.
   bench — id скамьи с опорными рамками backPad/seatPad (атлет смотрит к −Z, голова — вверх по спинке). */
function sitIncline(C, bench, { arch = [-4, -6], girdle = [-4, -12], feetZ = -62, feetX = 24 } = {}) {
  const { V, M } = C, q = C.base(), bp = C.frame(bench, 'backPad'), sp = C.frame(bench, 'seatPad');
  const by = M.M3.col(bp.R, 1), bz = M.M3.col(bp.R, 2), sn = M.M3.col(sp.R, 1);
  C.root(q, V.add(V.add(bp.o, bz, 14), by, 12), bz, by);
  q.lumbar = [arch[0], 0, 0]; q.thoracic = [arch[1], 0, 0];
  for (const s of S) { q[s].hip = [70, 8, 6]; q[s].knee = 80; q[s].girdle = [...girdle]; }
  for (let i = 0; i < 4; i++) {
    C.restOn(q, 'back', bp.o, by, -1.2);
    const d = Math.min(...C.region(q, 'buttocks').map(p => V.dot(V.sub(p, sp.o), sn)));
    q.root.p = V.add(q.root.p, bz, (-1.4 - d) / V.dot(bz, sn));
  }
  C.restOn(q, 'back', bp.o, by, -1.2);
  C.neckTo(q, 'headBack', bp.o, by, -.4);
  for (const s of S) {
    const lat = C.latP(q, s), fwd = V.unit(V.add([0, 0, -1], lat, .25));
    C.foot(q, s, V.add([0, 0, feetZ], lat, feetX), 0, V.unit(V.add([0, .4, -1], lat, .4)), { forward: fwd });
  }
  return q;
}
/* Жим на наклонной: верх — гриф над плечевыми суставами на прямых руках, низ — у верха груди под ключицами */
function inclinePress(C, q, t, { half = 40, chestH = 42, path = 'free', smithZ, smithY, elbowTop = 6 } = {}) {
  const { V } = C, e = C.ease(t), f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), T = C.axes(q, 'thorax');
  const chest = V.add(C.chestPoint(q, chestH), T.z, 1.7);
  const pole = lat => V.unit(V.add(V.add([0, -1, 0], lat, 1.05), T.y, -.45));
  const arms = (qq, bar, allow) => { for (const s of S) { const lat = C.lat(qq, s); C.grip(qq, s, V.add(bar, lat, half), V.scale(lat, -1), pole(lat), { wristExt: 10, allowShort: allow }); } };
  /* верх: прямые руки (локоть ≈ elbowTop), для Смита — на линии направляющих над точкой касания */
  const topXZ = path === 'smith' ? [0, smithZ] : [0, gh[2] - 1];
  let topY = gh[1] + 55;
  for (let i = 0; i < 6; i++) { const qq = C.M.clone(q); arms(qq, [0, topY, topXZ[1]], true); const ff = C.fk(qq); topY += armLen(C, elbowTop) - (V.dist(ff.P.ghL, ff.P.wrL) + V.dist(ff.P.ghR, ff.P.wrR)) / 2; }
  const top = [0, topY, topXZ[1]], bottom = path === 'smith' ? [0, smithY, smithZ] : chest;
  const bar = [0, C.lerp(top[1], bottom[1], e), C.lerp(top[2], bottom[2], Math.pow(e, .85))];
  arms(q, bar, false);
  return { bar, top, bottom };
}
const INC_BENCH = { type: 'g1InclineRack', id: 'bench', back: 38, seat: 5 };
const INC = once(() => {
  const C = ctx([INC_BENCH]), q = sitIncline(C, 'bench');
  const r = inclinePress(C, C.M.clone(q), 0, {});
  /* крюки: на 7 см позади и на 4 см ниже грифа в верхней точке */
  return { q, hook: +(r.top[1] - 4).toFixed(1), upZ: +(r.top[2] + 6.2 + 7).toFixed(1) };
});

/* ---------- Жим в машине Смита на наклонной скамье ---------- */
const SINC_BENCH = { type: 'adjBench', id: 'bench', back: 30, seat: 5 };
const SINC = once(() => {
  const C = ctx([SINC_BENCH]), q = sitIncline(C, 'bench', { feetZ: -64 }), T = C.axes(q, 'thorax');
  const chest = C.V.add(C.chestPoint(q, 43), T.z, 1.7);
  return { q, z: +chest[2].toFixed(1), y: chest[1] };
});

/* ---------- Жим на скамье с обратным наклоном ---------- */
const DEC_BENCH = { type: 'g1DeclineRack', id: 'bench', decline: 16, hipH: 62, padZ0: -18 };
const DEC = once(() => {
  const C = ctx([DEC_BENCH]), { V, M } = C, F = C.frame('bench', 'pad'), n = M.M3.col(F.R, 1), dz = M.M3.col(F.R, 2), q = C.base();
  /* лёжа на спине головой вниз по подушке */
  C.root(q, V.add(V.add(F.o, dz, 10), n, 12), dz, n);
  q.lumbar = [-4, 0, 0]; q.thoracic = [-8, 0, 0];
  for (const s of S) q[s].girdle = [-4, -14];
  for (let i = 0; i < 3; i++) {
    C.restOn2(q, 'upperBack', 'buttocks', F.o, n, -1.2);
    const hipAlong = V.dot(V.sub(q.root.p, F.o), dz); q.root.p = V.add(q.root.p, dz, 11 - hipAlong);
  }
  C.restOn2(q, 'upperBack', 'buttocks', F.o, n, -1.2);
  C.neckTo(q, 'headBack', F.o, n, -.5);
  /* ноги: бёдра к валику под коленями (чуть вверх), голени вниз к валикам перед голеностопами */
  for (const s of S) {
    const f = C.fk(q), hip = f.P['hip' + s], lat = C.latP(q, s), th = V.unit(V.add(V.add([0, 0, -1], [0, 1, 0], .1), lat, .08));
    const K = V.add(hip, th, M.B.th), A = V.add(K, V.unit([lat[0] * .03, -1, -.12]), M.B.sk);
    C.legTo(q, s, A, V.unit(V.add([0, 0, -1], [0, 1, 0], .6)), { dorsi: 6 });
  }
  const f = C.fk(q);
  /* валики голеностопа — перед голенью над голеностопом */
  const K = V.mix(f.P.knL, f.P.knR, .5), A = V.mix(f.P.anL, f.P.anR, .5);
  /* валик в подколенной ямке: касается задней поверхности бедра (снизу) и икры (со стороны таза) */
  const kneeR = 5.5, thighBack = 7.6, calfBack = 7, knee = V.add(V.add(K, [0, -1, 0], thighBack + kneeR - .8), [0, 0, 1], calfBack + kneeR - .8);
  const shinPt = V.mix(K, A, .78), ankleR = 5, ankle = V.add(shinPt, [0, 0, -1], 3.2 + ankleR - .8);
  return { q, knee, ankle };
});
const DEC_EQ = once(() => {
  const L = DEC(), C = ctx([{ ...DEC_BENCH, kneeZ: L.knee[2], kneeY: L.knee[1], ankleZ: L.ankle[2], ankleY: L.ankle[1] }]), q = C.M.clone(L.q);
  const r = benchPressDecline(C, q, 0);
  return { kneeZ: +L.knee[2].toFixed(1), kneeY: +L.knee[1].toFixed(1), ankleZ: +L.ankle[2].toFixed(1), ankleY: +L.ankle[1].toFixed(1), hook: +(r.top[1] - 4).toFixed(1), upZ: +(r.top[2] + 6.2 + 7).toFixed(1) };
});
/* жим на скамье с обратным наклоном: верх — прямые руки над плечевыми суставами, низ — нижняя часть груди */
function benchPressDecline(C, q, t, { half = 40, chestH = 30, elbowTop = 6 } = {}) {
  const { V } = C, e = C.ease(t), f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), T = C.axes(q, 'thorax');
  const chest = V.add(C.chestPoint(q, chestH), T.z, 1.7);
  const pole = lat => V.unit(V.add(V.add([0, -1, 0], lat, 1.1), T.y, -.5));
  const arms = (qq, bar, allow) => { for (const s of S) { const lat = C.lat(qq, s); C.grip(qq, s, V.add(bar, lat, half), V.scale(lat, -1), pole(lat), { wristExt: 10, allowShort: allow }); } };
  let topY = gh[1] + 55;
  for (let i = 0; i < 6; i++) { const qq = C.M.clone(q); arms(qq, [0, topY, gh[2] + 1], true); const ff = C.fk(qq); topY += armLen(C, elbowTop) - (V.dist(ff.P.ghL, ff.P.wrL) + V.dist(ff.P.ghR, ff.P.wrR)) / 2; }
  const top = [0, topY, gh[2] + 1];
  const bar = [0, C.lerp(top[1], chest[1], e), C.lerp(top[2], chest[2], Math.pow(e, .8))];
  arms(q, bar, false);
  return { bar, top };
}

/* ---------- Скамья Скотта ---------- */
/* Сидя лицом к упору: корпус чуть наклонён вперёд, плечи лежат на наклонном упоре (45°), подмышки — на верхней кромке.
   Упор рассчитывается от позы: плоскость упора — под плечевыми костями на глубину трицепса. */
const PRE_SLOPE = 45, PRE_SEAT = 56;
const PREACHER = once(() => {
  const C = ctx([]), { V, M } = C, q = C.base(), lean = 6 * C.D2R;
  C.root(q, [0, PRE_SEAT + 10, -7], [0, Math.cos(lean), Math.sin(lean)], [0, -Math.sin(lean), Math.cos(lean)]);
  q.lumbar = [2, 0, 0]; q.thoracic = [6, 0, 0]; q.neck = [8, 0, 0];
  for (const s of S) { q[s].hip = [80, 8, 6]; q[s].knee = 80; q[s].girdle = [6, 14]; }
  C.restOn(q, 'buttocks', [0, PRE_SEAT, 0], [0, 1, 0], -1.4);
  for (const s of S) { const f = C.fk(q), kn = f.P['kn' + s], lat = C.latP(q, s); C.foot(q, s, V.add([kn[0], 0, kn[2] + 6], lat, 3), 0, V.unit(V.add([0, 0, 1], lat, .2)), { forward: V.unit(V.add([0, 0, 1], lat, .15)) }); }
  const f = C.fk(q), a = PRE_SLOPE * C.D2R, down = [0, -Math.sin(a), Math.cos(a)], n = [0, Math.cos(a), Math.sin(a)];
  const gh = V.mix(f.P.ghL, f.P.ghR, .5);
  /* плечо по наклону упора, чуть сведены к середине; плоскость упора — на 4,6 см ниже оси плеча */
  const ua = s => V.unit(V.add(down, [-M.SIGN[s], 0, 0], .05));
  const plane = V.add(gh, n, -4.6);
  /* верхняя кромка — перед грудью: сдвигаем кромку вдоль наклона, пока грудь лишь слегка поджимает валик */
  const { collider } = require('../../biomech/validator2.js'), R = M.catalogPose(q), S0 = M.surface(R).torso.flat();
  const clear = sh => {
    const e = V.add(plane, down, sh), eq = { type: 'g1Preacher', id: 'p', seatH: PRE_SEAT, padTop: e[1], padZ: e[2], slope: PRE_SLOPE, padLen: 34 };
    const cols = C.EQ.build([eq], R).filter(p => /p:(pad|roll|padPlate|padArm)$/.test(p.id)).flatMap(collider);
    let m = 99; for (const p of S0) for (const c of cols) m = Math.min(m, c.sdf(p)); return m;
  };
  const sh = C.solve1D(sh => clear(sh) + .6, -5, 30, 24), edge = V.add(plane, down, sh);
  return { q, ua, down, n, edge, gh };
});
const PRE_EQ = once(() => { const L = PREACHER(); return { type: 'g1Preacher', id: 'preacher', seatH: PRE_SEAT, padTop: +L.edge[1].toFixed(1), padZ: +L.edge[2].toFixed(1), slope: PRE_SLOPE, padLen: 34 }; });

/* ---------- Тяга Т-грифа («мина») ---------- */
/* Атлет стоит над грифом лицом к блинам, конец грифа — в шарнире на полу позади. V-рукоять висит на грифе
   на расстоянии TB_HOOK от шарнира, ручки на 7 см ниже грифа (нейтральный хват). */
const TB_THETA = 33, TB_HOOK = 168, TB_DROP = 7, TB_PLATES = [[11.5, 2.6], [11.5, 2.6], [11.5, 2.6]], TB_ST = { ax: 24, az: 0, out: 18, kneeOut: 0 };
const TBAR = once(() => {
  const C = ctx([]), { V, M } = C;
  const q = hangPose(C, { half: 14, kg: 25, st: TB_ST, theta: TB_THETA, knee: 30, spine: [3, 5, -10], sa: 0, girdle: [2, 10] });
  const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5);
  /* исходное: руки висят прямо, рукоять под плечами; шарнир — так, чтобы крюк был на TB_HOOK от него */
  const H0 = [0, gh[1] - Math.sqrt((armLen(C, 14) + 7.6) ** 2 - (Math.abs(f.P.ghL[0]) - 6.5) ** 2), gh[2] + 1], T0 = V.add(H0, [0, TB_DROP, 0]);
  const pz = +(T0[2] - Math.sqrt(TB_HOOK ** 2 - (T0[1] - 8) ** 2)).toFixed(1), P = [0, 8, pz];
  const beta0 = Math.asin((T0[1] - 8) / TB_HOOK);
  /* верх: рукоять поднимается по дуге, пока гриф, рукоять или блины не коснутся корпуса (зазор 0,8 см) */
  const { collider } = require('../../biomech/validator2.js');
  const eq = [{ type: 'g1LandmineBar', id: 'tbar', pivot: P, mountTo: 'lm:pin', drop: TB_DROP, plates: TB_PLATES }];
  const clear = db => {
    const qq = M.clone(q); tbarArms(C, qq, P, beta0 + db * C.D2R, 1);
    const R = M.catalogPose(qq), cache = M.torsoCache(R); let m = 99;
    for (const c of C.EQ.build(eq, R).flatMap(collider)) for (const p of c.pts) m = Math.min(m, M.torsoSDF(R, p, cache) - (c.ptR || 0), M.headSDF(R, p) - (c.ptR || 0), ...S.map(s => M.limbSDF(R, 'th', s, p) - (c.ptR || 0)));
    return m;
  };
  const dBeta = C.solve1D(db => clear(db) - .8, 0, 25, 22);
  return { q, P, beta0, dBeta };
});
/* руки на V-рукояти при угле грифа beta (нейтральный хват, ручки вдоль грифа) */
function tbarArms(C, q, P, beta, e) {
  const { V } = C, d = [0, Math.sin(beta), Math.cos(beta)], H = V.add(V.add(P, d, TB_HOOK), [0, -TB_DROP, 0]);
  for (const s of S) {
    const lat = [C.M.SIGN[s], 0, 0], pole = V.unit(V.mix(V.add(V.add([0, 0, -1], [0, 1, 0], .2), lat, .7), V.add(V.add([0, 1, 0], [0, 0, -1], .8), lat, .75), e));
    C.grip(q, s, V.add(H, lat, 6.5), d, pole, { wristExt: C.lerp(0, 8, e) });
  }
}

module.exports = {
  /* Шраги с гантелями: стоя, гантели в опущенных прямых руках по бокам (нейтральный хват).
     t=0 — плечи опущены, t=1 — плечевой пояс поднят к ушам. */
  shrug: {
    keys: [0, .5, 1],
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [...FEET, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base(), st = { ax: 11, az: 0, out: 8 };
      q.neck = [3, 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(-3, 32, e), C.lerp(3, -1, e)];
      const hands = q => {
        const f = C.fk(q);
        for (const s of S) {
          const gh = f.P['gh' + s], lat = C.lat(q, s), d = V.unit(V.add([0, -1, 0], lat, .2));
          C.armTo(q, s, V.add(gh, d, armLen(C, 5)), V.unit(V.add([0, 0, -1], lat, .1)), { pron: 2, wrist: [0, 0], mode: 'grip' });
        }
      };
      C.balanceOver(q, [0, 0, 4], { loads: q => { const f = C.fk(q); return S.map(s => [f.P['grip' + s], 20]); }, resolve: q => { q.root.p[1] = hipHeightFor(C, q, 4, st); placeFeet(C, q, st); hands(q); } });
      return q;
    }
  },

  /* Становая тяга: гриф над серединой стопы, хват сверху чуть шире ног.
     t=0 — гриф на полу (диски касаются пола), голени у грифа; t=1 — локаут без переразгибания. */
  deadlift: {
    keys: [0, .1, .2, .4, .6, .8, 1],
    equipment: [{ type: 'barbell', id: 'bar', plates: [20, 20] }],
    contacts: [...FEET, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(DL(t)); }
  },

  /* Румынская тяга: колени мягкие, таз назад, гриф (или гантели) скользит вдоль бёдер до середины голени.
     t=0 — стоя, снаряд перед бёдрами; t=1 — нижняя точка. Хват чуть шире бёдер, чтобы гантели проходили вдоль ног. */
  rdl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'barbell', id: 'bar', plates: [20], optional: 'bb' },
      { type: 'dumbbell', id: 'dbL', hand: 'L', optionalNot: 'bb' }, { type: 'dumbbell', id: 'dbR', hand: 'R', optionalNot: 'bb' }],
    contacts: [...FEET, ...GRIPS('bar'), { body: 'gripL', prop: 'dbL', optional: true }, { body: 'gripR', prop: 'dbR', optional: true }],
    pose(t, C) { return C.M.clone(RDL(t)); }
  },

  /* Тяга штанги в наклоне: хват сверху чуть шире плеч, корпус ≈ 40° к полу, спина прямая.
     t=0 — руки выпрямлены, гриф под плечами; t=1 — гриф у низа живота, локти назад вдоль корпуса, лопатки сведены. */
  bbrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'barbell', id: 'bar', plates: [20] }],
    contacts: [...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = BBROW(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [C.lerp(2, -2, e), C.lerp(10, -16, e)];
      const bar = [0, C.lerp(L.bar0[1], L.bar1[1], Math.pow(e, .8)), C.lerp(L.bar0[2], L.bar1[2], Math.pow(e, 1.35))];
      for (const s of S) {
        const lat = [C.M.SIGN[s], 0, 0], pole = V.unit(V.mix(V.add(V.add([0, 0, -1], [0, 1, 0], .3), lat, .55), V.add(V.add([0, 1, 0], [0, 0, -1], .7), lat, .45), e));
        gripBar(C, q, s, bar, 25, pole, { wristExt: C.lerp(0, 6, e) });
      }
      return q;
    }
  },

  /* Жим штанги стоя: хват чуть шире плеч, гриф идёт вертикально над серединой стопы; голова уходит назад,
     пропуская гриф, в локауте — под грифом. t=0 — гриф у ключиц, t=1 — руки выпрямлены над головой.
     Атлет стоит в силовой раме (гриф снят с J-крюков передних стоек). */
  ohp: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [{ type: 'powerRack', id: 'rack', yaw: 180, at: [0, 0, -12], hook: 144, pullBar: false }, { type: 'barbell', id: 'bar', plates: [10] }],
    contacts: [...FEET, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(OHP(t)); }
  },

  /* Приседания со штангой (гриф на трапециях): стопы на ширине плеч, носки чуть наружу, колени по линии носков,
     пятки на полу; бёдра до параллели, гриф над серединой стопы. t=0 — стоя, t=1 — нижняя точка. Стойки рамы позади. */
  squat: {
    keys: [0, .125, .25, .5, .75, 1],
    equipment: [{ type: 'powerRack', id: 'rack', yaw: 180, at: [0, 0, -12], hook: 132, pullBar: false }, { type: 'barbell', id: 'bar', plates: [20] }],
    contacts: [...FEET, { body: 'back', prop: 'bar' }, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(SQ(t)); }
  },

  /* Наклоны со штангой на плечах («гуд морнинг»): гриф на трапециях, колени слегка согнуты, таз назад,
     спина прямая; корпус почти параллелен полу. t=0 — стоя, t=1 — нижняя точка. Гриф снимают со стоек рамы. */
  goodmorning: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'powerRack', id: 'rack', yaw: 180, at: [0, 0, -14], hook: 132, pullBar: false }, { type: 'barbell', id: 'bar', plates: [10] }],
    contacts: [...FEET, { body: 'back', prop: 'bar' }, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(GM(t)); }
  },

  /* Приседания в машине Смита: гриф на трапециях идёт по вертикальным направляющим, стопы на ширине плеч впереди грифа.
     t=0 — стоя, t=1 — бёдра около параллели. */
  smithsquat: {
    keys: [0, .125, .25, .5, .75, 1],
    equipment: [{ type: 'smith', id: 'smith', z: 0, halfWidth: 62 }, { type: 'smithBar', id: 'bar', rodL: [62, 0, 0], rodR: [-62, 0, 0], mountTo: 'smith', plates: SMITH_PLATES }],
    contacts: [...FEET, { body: 'back', prop: 'bar' }, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(SSQ(t)); }
  },

  /* Жим лёжа узким хватом: хват на ширине плеч, локти вдоль корпуса, гриф к нижней части груди.
     t=0 — руки выпрямлены над плечами, t=1 — гриф касается груди. Стойки у головного конца скамьи. */
  closegrip: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'benchUprights', id: 'rack', z: 47, hook: 107 }, { type: 'barbell', id: 'bar', plates: [20] }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V } = C, q = lieOnBench(C, { girdle: [-4, -12] });
      for (const s of S) q[s].girdle = [-4, C.lerp(-8, -14, t)];
      benchPress(C, q, t, { half: 20, chestH: 29, pole: lat => V.unit(V.add(V.add([0, -1, 0], lat, .45), [0, 0, -1], 1.0)), wristExt: 8 });
      return q;
    }
  },

  /* Жим лёжа в машине Смита: гриф идёт по направляющим вертикально и опускается на нижнюю часть груди.
     t=0 — руки выпрямлены, t=1 — гриф у груди. */
  smithbench: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = SBENCH(); return [{ type: 'flatBench', id: 'bench' }, { type: 'smith', id: 'smith', z: L.z, halfWidth: 62 },
      { type: 'smithBar', id: 'bar', rodL: [62, 0, L.z], rodR: [-62, 0, L.z], mountTo: 'smith', plates: SMITH_PLATES }]; })(),
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = SBENCH(), q = C.M.clone(L.q), half = 38;
      for (const s of S) q[s].girdle = [-4, C.lerp(-8, -14, e)];
      const pole = lat => V.unit(V.add(V.add([0, -1, 0], lat, 1.1), [0, 0, -1], .5));
      /* верх: руки выпрямлены над низом груди */
      let topY = L.y + 40;
      for (let i = 0; i < 6; i++) {
        const qq = C.M.clone(q); for (const s of S) { const lat = C.lat(qq, s); C.grip(qq, s, V.add([0, topY, L.z], lat, half), V.scale(lat, -1), pole(lat), { wristExt: 10, allowShort: true }); }
        const f = C.fk(qq); topY += armLen(C, 8) - (V.dist(f.P.ghL, f.P.wrL) + V.dist(f.P.ghR, f.P.wrR)) / 2;
      }
      const bar = [0, C.lerp(topY, L.y, e), L.z];
      for (const s of S) { const lat = C.lat(q, s); C.grip(q, s, V.add(bar, lat, half), V.scale(lat, -1), pole(lat), { wristExt: 10 }); }
      return q;
    }
  },

  /* Французский жим лёжа: короткий гриф, хват сверху на ширине плеч, плечи почти вертикальны и неподвижны.
     t=0 — руки выпрямлены над лбом; t=1 — гриф у макушки, сгибаются только локти. */
  skull: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'barbell', id: 'bar', size: 'curl', plates: ['c10'] }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = lieOnBench(C, { girdle: [-2, -6] });
      /* плечо отклонено к голове на 14…20°, локти чуть внутрь (хват уже плеч) */
      const tilt = C.lerp(14, 20, e) * C.D2R;
      for (const s of S) {
        const lat = C.lat(q, s), ua = V.add(V.add([0, Math.cos(tilt), Math.sin(tilt)], lat, -.06), [0, 0, 0]);
        armByAngles(C, q, s, ua, [0, 0, 1], C.lerp(8, 108, e), V.scale(lat, -1), C.lerp(4, 18, e), 16);
      }
      return q;
    }
  },

  /* Сгибание запястий со штангой сидя: предплечья лежат на бёдрах, кисти свисают за колени, хват снизу.
     t=0 — запястья разогнуты (гриф внизу), t=1 — запястья согнуты (гриф поднят). Двигаются только кисти. */
  wristcurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', yaw: 90 }, { type: 'barbell', id: 'bar', size: 'curl', plates: ['c5'] }],
    contacts: [{ body: 'buttocks', prop: 'bench:pad' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V, M } = C, e = C.ease(t), L = WRIST(), q = M.clone(L.q);
      for (const s of S) {
        const { W, E, w } = L.F[s], lat = C.latP(q, s), thumb = V.unit(V.perp(lat, w));
        /* сгибание к ладони (+) поднимает гриф: ладонь смотрит вверх */
        const flex = C.lerp(-50, 55, e);
        const distal = V.unit(M.M3.v(M.M3.axis(thumb, -M.SIGN[s] * flex * C.D2R), w));
        const Rh = M.M3.frameYZ(V.scale(distal, -1), thumb);
        M.solveArmWrist(q, s, W, V.unit(V.add(V.sub(E, C.fk(q).P['gh' + s]), [0, -1, 0], .2)), Rh); q.hands = { ...(q.hands || {}), [s]: 'grip' };
      }
      return q;
    }
  },

  /* Ягодичный мост со штангой: лопатки на краю скамьи, гриф с подушкой на сгибе бёдер, стопы на ширине плеч.
     t=0 — таз опущен; t=1 — таз разогнут до линии корпуса и бёдер, голени вертикальны, подбородок к груди. */
  hipthrust: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', yaw: 90, at: [0, 0, HT_BENCH] }, { type: 'barbell', id: 'bar', plates: [20] }, { type: 'g1BarPad', id: 'barPad', mountTo: 'bar' }],
    contacts: [{ body: 'upperBack', prop: 'bench:pad' }, ...FEET, { body: 'belly', prop: 'barPad' }, ...GRIPS('bar')],
    pose(t, C) { return C.M.clone(HT(t)); }
  },

  /* Жим штанги на наклонной скамье (станция со стойками, спинка 38°): лопатки сведены, стопы на полу.
     t=0 — руки выпрямлены над плечами, t=1 — гриф у верха груди под ключицами, локти под 45–60° к корпусу. */
  inclinebb: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = INC(); return [{ ...INC_BENCH, hook: L.hook, upZ: L.upZ }, { type: 'barbell', id: 'bar', plates: [20] }]; })(),
    contacts: [{ body: 'back', prop: 'bench:back' }, { body: 'buttocks', prop: 'bench:seat' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const L = INC(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [-4, C.lerp(-8, -14, C.ease(t))];
      inclinePress(C, q, t, {});
      return q;
    }
  },

  /* Жим в машине Смита на наклонной скамье (спинка 30°): скамья стоит так, что гриф опускается на верх груди.
     t=0 — руки выпрямлены, t=1 — гриф у верха груди; гриф идёт по направляющим вертикально. */
  smithincline: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = SINC(); return [SINC_BENCH, { type: 'smith', id: 'smith', z: L.z, halfWidth: 62 },
      { type: 'smithBar', id: 'bar', rodL: [62, 0, L.z], rodR: [-62, 0, L.z], mountTo: 'smith', plates: SMITH_PLATES }]; })(),
    contacts: [{ body: 'back', prop: 'bench:back' }, { body: 'buttocks', prop: 'bench:seat' }, ...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const L = SINC(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [-4, C.lerp(-8, -14, C.ease(t))];
      inclinePress(C, q, t, { half: 38, path: 'smith', smithZ: L.z, smithY: L.y, elbowTop: 8 });
      return q;
    }
  },

  /* Жим штанги на скамье с обратным наклоном (16°): ноги зафиксированы валиками, гриф к нижней части груди.
     t=0 — руки выпрямлены над плечами, t=1 — гриф у нижней части груди. Стойки с крюками у головного конца. */
  declinebb: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = DEC_EQ(); return [{ ...DEC_BENCH, ...L }, { type: 'barbell', id: 'bar', plates: [20] }]; })(),
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, { body: 'thighsBack', prop: 'bench:kneeXp' }, { body: 'thighsBack', prop: 'bench:kneeXn' },
      { body: 'shinL', prop: 'bench:ankleXn' }, { body: 'shinR', prop: 'bench:ankleXp' }, ...GRIPS('bar')],
    pose(t, C) {
      const q = C.M.clone(DEC().q);
      for (const s of S) q[s].girdle = [-4, C.lerp(-8, -14, C.ease(t))];
      benchPressDecline(C, q, t);
      return q;
    }
  },

  /* Сгибание рук на скамье Скотта: плечи лежат на наклонном упоре, хват снизу; штанга (короткий гриф) или гантели.
     t=0 — руки почти выпрямлены, t=1 — снаряд у плеч; плечи не отрываются от упора. */
  preacher: {
    keys: [0, .25, .5, .75, 1],
    equipment: [PRE_EQ(), { type: 'barbell', id: 'bar', size: 'curl', plates: ['c10'], optional: 'bb' },
      { type: 'dumbbell', id: 'dbL', hand: 'L', optionalNot: 'bb' }, { type: 'dumbbell', id: 'dbR', hand: 'R', optionalNot: 'bb' }],
    contacts: [{ body: 'buttocks', prop: 'preacher:seat' }, { body: 'chest', prop: 'preacher:roll' }, { body: 'uaL', prop: 'preacher:pad' }, { body: 'uaR', prop: 'preacher:pad' }, ...FEET,
      ...GRIPS('bar'), { body: 'gripL', prop: 'dbL', optional: true }, { body: 'gripR', prop: 'dbR', optional: true }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = PREACHER(), q = C.M.clone(L.q);
      for (const s of S) armByAngles(C, q, s, L.ua(s), L.n, C.lerp(18, 116, e), C.lat(q, s), C.lerp(-6, 14, e));
      return q;
    }
  },

  /* Тяга Т-грифа в наклоне («мина» с V-рукоятью): корпус ≈ 45°, колени согнуты, спина прямая.
     t=0 — руки выпрямлены, t=1 — рукоять у живота, лопатки сведены; угол корпуса не меняется. */
  tbarrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = TBAR(); return [{ type: 'g1Landmine', id: 'lm', at: [0, 0, L.P[2]] }, { type: 'g1LandmineBar', id: 'tbar', pivot: L.P, mountTo: 'lm:pin', drop: TB_DROP, plates: TB_PLATES }]; })(),
    contacts: [...FEET, { body: 'gripL', prop: 'tbar' }, { body: 'gripR', prop: 'tbar' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = TBAR(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [C.lerp(2, -2, e), C.lerp(10, -16, e)];
      /* рукоять движется по дуге вокруг шарнира до касания корпуса */
      tbarArms(C, q, L.P, L.beta0 + L.dBeta * e * C.D2R, e);
      return q;
    }
  },

  /* Подъём штанги на бицепс: короткий гриф, хват снизу на ширине плеч, локти у боков.
     t=0 — руки почти прямые, гриф перед бёдрами; t=1 — гриф у верха груди. */
  bbcurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'barbell', id: 'bar', size: 'curl', plates: ['c10'] }],
    contacts: [...FEET, ...GRIPS('bar')],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base(), st = { ax: 11, az: 0, out: 8 };
      q.lumbar = [0, 0, 0]; q.thoracic = [C.lerp(0, -3, e), 0, 0]; q.neck = [2, 0, 0];
      for (const s of S) {
        q[s].girdle = [C.lerp(-2, 2, e), C.lerp(4, -2, e)];
        q[s].shoulder = [C.lerp(1, 14, e), C.lerp(9, 7, e), C.lerp(-4, 0, e)];
        q[s].elbow = C.lerp(9, 138, e); q[s].pron = -84; q[s].wrist = [C.lerp(4, 18, e), 0];
      }
      q.hands = { L: 'grip', R: 'grip' };
      C.balanceOver(q, [0, 0, 6], { loads: q => { const f = C.fk(q); return [[V.mix(f.P.gripL, f.P.gripR, .5), barKg(['c10'], true)]]; }, resolve: q => { q.root.p[1] = hipHeightFor(C, q, 4, st); placeFeet(C, q, st); } });
      return q;
    }
  }
};
