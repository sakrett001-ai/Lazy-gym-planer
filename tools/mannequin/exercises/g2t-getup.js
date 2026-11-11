'use strict';
/* Турецкий подъём с гирей — ЧЕРНОВИК (id с «_»). Этап: положения в одной системе координат. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const MAT = 0, KB_KG = 16;
const EQUIP = [{ type: 'kettlebell', id: 'kb', hands: ['L'], rest: true }];

/* гиря в кисти с заданной осью рукояти (как holdDir в g2-dumbbell.js) */
function holdDir(C, q, s, point, pole, axis, { flex = 0, dev = 0, lo = -88, hi = 84, signed = false, mode, short = false } = {}) {
  const { V } = C, ax = V.unit(axis);
  const score = p => { C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true, mode }); const d = V.dot(C.M3.col(C.fk(q).F['hand' + s].R, 2), ax); return signed ? d : Math.abs(d); };
  let best = lo, bv = -Infinity;
  for (let p = lo; p <= hi + 1e-9; p += 4) { const v = score(p); if (v > bv) { bv = v; best = p; } }
  let a = Math.max(lo, best - 4), b = Math.min(hi, best + 4);
  for (let i = 0; i < 18; i++) { const m1 = a + (b - a) * .382, m2 = a + (b - a) * .618; if (score(m1) >= score(m2)) b = m2; else a = m1; }
  const p = (a + b) / 2; for (let k = 0; k < 3; k++) C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true, mode }); C.hold(q, s, point, pole, { pron: p, flex, dev, mode, allowShort: short }); return p;
}
/* гиря над плечом на прямой руке, глубокий хват, большой палец — к средней линии. Рука вертикальна; когда корпус почти
   вертикален (на колене, стоя), рука отведена наружу на ~6° и вперёд на ~3°: строго вдоль оси корпуса углы
   плеча вырождаются (как в «мельнице», g2-dumbbell.js). Плечевой сустав идёт за рукой по ритму пояса — точка хвата
   отмеряется от сустава при поставленной руке (два прохода). */
const DBG = { pole: null, thumb: null };
function bellUp(C, q, s = 'L', { reach = REACH, girdle = [0, 6], pole: rot = 0, thumb = 0 } = {}) {
  if (DBG.pole != null) rot = DBG.pole;
  if (DBG.thumb != null) thumb = DBG.thumb;
  const { V } = C;
  q[s].girdle = [...girdle];
  let p;
  for (let k = 0; k < 2; k++) {
    const f = C.fk(q), T = C.axes(q, 'thorax'), lat = C.lat(q, s), latH = V.unit(V.perp(lat, [0, 1, 0]));
    const w = Math.max(0, Math.min(1, (T.y[1] - .8) / .15)), dir = V.unit(V.add(V.add([0, 1, 0], latH, .1 * w), V.unit(V.perp(T.z, [0, 1, 0])), .05 * w));
    const g = V.add(f.P['gh' + s], dir, reach), pole = C.M3.v(C.M3.axis(dir, rot * C.D2R), V.unit(V.add(V.add(V.scale(T.y, -1), lat, .35), T.z, 1)));
    p = holdDir(C, q, s, g, pole, C.M3.v(C.M3.axis([0, 1, 0], thumb * C.D2R), V.scale(latH, -1)), { signed: true, mode: 'deep', short: true });
  }
  return p;
}
/* ладонь на полу: центр в P, пальцы по fingers; полюс локтя — перебором (пронация, ротация плеча, отклонение запястья) */
function palmOn(C, q, s, P, fingers, prefer, wPrefer = 1.5) {
  const { V, M } = C, gh = C.fk(q).P['gh' + s], d = V.unit(V.sub(P, gh));
  const base = V.unit(V.perp(Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0], d)), side = V.cross(d, base);
  let best = null;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * 2 * Math.PI, pole = V.add(V.scale(base, Math.cos(a)), side, Math.sin(a)), t = M.clone(q);
    try { C.palm(t, s, P, fingers, [0, 1, 0], pole); } catch (e) { continue; }
    const cost = Math.max(Math.abs(t[s].pron) / 82, Math.abs(t[s].shoulder[2]) / 85, Math.abs(t[s].wrist[1]) / 22) + (prefer ? wPrefer * (1 - V.dot(pole, V.unit(prefer))) : 0);
    if (!best || cost < best.cost) best = { cost, pole };
  }
  if (!best) throw Error('ладонь ' + s + ': не дотянуться');
  C.palm(q, s, P, fingers, [0, 1, 0], best.pole);
  return best.pole;
}
function lowestFoot(C, q, s) {
  const { M } = C, f = C.fk(q);
  return Math.min(...M.footPoints(s).map(fp => M.footPointWorld(f.F['foot' + s], f.F['toes' + s], fp)[1]));
}
/* ориентация таза: из стойки лицом к −Z — наклон назад beta (90 — лёжа на спине головой к +Z), наклон к правому боку
   sigma (ось корпуса — к +X), поворот вокруг оси корпуса rho (грудь — вправо), разворот вокруг вертикали psi (к −X) */
function orient(C, { beta = 0, sigma = 0, rho = 0, psi = 0 }) {
  const { M3 } = C, D = C.D2R, Rb = M3.axis([1, 0, 0], beta * D);
  let up = M3.v(Rb, [0, 1, 0]), fw = M3.v(Rb, [0, 0, -1]);
  up = M3.v(M3.axis(fw, sigma * D), up);
  fw = M3.v(M3.axis(up, -rho * D), fw);
  const Ry = M3.axis([0, 1, 0], psi * D);
  return { up: M3.v(Ry, up), fw: M3.v(Ry, fw) };
}
function bodyAt(C, o, p) {
  const q = C.base(), { up, fw } = orient(C, o);
  C.root(q, p, up, fw);
  q.lumbar = [...(o.lumbar || [0, 0, 0])]; q.thoracic = [...(o.thoracic || [0, 0, 0])]; q.neck = [...(o.neck || [0, 0, 0])]; q.R.girdle = [0, -2];
  return q;
}
/* опустить тело на пол: нижняя точка каждой области — не глубже её поджатия (имя или [имя, поджатие]) */
const GAP = { buttocks: -.8, back: -.8, torso: -.3 };
function lowerTo(C, q, names) {
  const d = Math.max(...names.map(n => { const pts = n === 'torso' ? torsoPts(C, q) : C.region(q, n); return MAT + (GAP[n] ?? -.8) - Math.min(...pts.map(p => p[1])); }));
  q.root.p = C.V.add(q.root.p, [0, d, 0]);
}
/* все точки кожи корпуса (спина, бока, перед) — как области compose.js, по всему сечению */
function torsoPts(C, q) {
  const { M } = C, R = M.catalogPose(q), out = [];
  M.noFolds(() => { for (let h = -5.3; h <= 55.8; h += 2.5) for (let a = 0; a <= Math.PI + 1e-9; a += Math.PI / 12) for (const s of S) { const p = M.torsoPoint(R, h, s, a); out.push([p[0], M.FLOOR - p[1], p[2]]); } });
  return out;
}

/* ---------- раскладка опор (одна на всё движение) ----------
   Таз лёжа — в начале координат (середина тазобедренных суставов над x = z = 0). Левая стопа FL ставится лёжа (колено
   согнуто на kneeL) и не сдвигается до выпада; правый голеностоп AR (нога прямая, отведена на legR) — до проведения ноги;
   ладонь правой руки PR — из положения «на локте»: локоть под плечом, предплечье на полу под armR к корпусу. */
const LY = { kneeL: 95, legR: 22, armR: 45, footOut: 0, span: 55.15, elbowMin: 5 };
const REACH = 63.05;
const ELBOW = { rho: 10, elbowH: 6.4 };
function lieBody(C) {
  const q = bodyAt(C, { beta: 90, lumbar: [2, 0, 0] }, [0, 20, 0]);
  q.L.hip = [50, 8, 4]; q.L.knee = LY.kneeL;
  lowerTo(C, q, ['back']);
  C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.3);
  return q;
}
/* левая стопа на полу под коленом, согнутым на knee (носок к −Z) — опорная точка под подушечкой */
function footL(C, q, knee) {
  const { V, M } = C, hip = C.fk(q).P.hipL, base = M.clone(q);
  const put = (t, D) => C.foot(t, 'L', [hip[0], MAT, hip[2] - D], 0, V.unit(V.add([0, 1, 0], C.latP(t, 'L'), LY.footOut)), { forward: [0, 0, -1] });
  const D = C.solve1D(D => { const t = M.clone(base); put(t, D); return t.L.knee - knee; }, 10, 85);
  put(q, D);
  return [hip[0], MAT, hip[2] - D];
}
/* правая нога прямая: голеностоп на расстоянии длины ноги (чуть согнутой) от тазобедренного, пятка на полу */
function legRStraight(C, q, deg) {
  const { V, M } = C, hip = C.fk(q).P.hipR, a = deg * C.D2R, L = M.B.th + M.B.sk - .3, lat = V.unit(V.perp(C.latP(q, 'R'), [0, 1, 0])), dir = V.add(V.scale(lat, Math.sin(a)), [0, 0, -1], Math.cos(a));
  let A;
  const put = y => { A = V.add(hip, dir, Math.sqrt(Math.max(1, L * L - (hip[1] - y) ** 2))); A[1] = y; C.legTo(q, 'R', A, [0, 1, 0], { dorsi: 5 }); };
  put(C.solve1D(y => { put(y); return lowestFoot(C, q, 'R') - (MAT - .3); }, MAT, MAT + 12));
  return A;
}
/* корпус на полу с наклоном beta: бока sigma подбирается функцией goal (= 0); таз — над x = z = 0, ноги — к опорам */
function floorBody(C, o, lay, goal, lo = 0, hi = 60) {
  const make = sg => {
    const q = bodyAt(C, { ...o, sigma: sg }, [0, 15, 0]);
    q.L.hip = [90 - o.beta, 6, 0]; q.L.knee = 100; q.R.hip = [90 - o.beta, 15, 0];
    lowerTo(C, q, ['buttocks', 'torso']);
    return q;
  };
  const sg = goal ? C.solve1D(sg => goal(make(sg)), lo, hi, 22) : (o.sigma || 0), q = make(sg);
  q.sigma = sg;
  return q;
}
/* «на локте» при наклоне beta: правое плечо над локтем (плечо вертикально), локоть на высоте elbowH, предплечье на полу
   под armR к корпусу (как рука лёжа), кисть ладонью на полу */
function elbowLayout(C, beta) {
  const { V, M } = C, e = floorBody(C, { beta, rho: ELBOW.rho }, null, q => C.fk(q).P.ghR[1] - (MAT + ELBOW.elbowH + M.B.ua - 1));
  const gh = C.fk(e).P.ghR, a = LY.armR * C.D2R, lat = V.unit(V.perp(C.latP(e, 'R'), [0, 1, 0])), dir = V.unit(V.add(V.scale(lat, Math.sin(a)), [0, 0, -1], Math.cos(a)));
  const E = [gh[0], MAT + ELBOW.elbowH, gh[2]], W = V.add(V.add(E, dir, Math.sqrt(M.B.fa ** 2 - (ELBOW.elbowH - 1.8) ** 2)), [0, 1.8 - ELBOW.elbowH, 0]);
  return { beta, sigma: e.sigma, dir, W, PR: V.add([W[0], MAT, W[2]], dir, 5.6) };
}
const LAYOUT = once(() => {
  const C = ctx(EQUIP), { V } = C;
  return C.unhinted(() => {
    const q = lieBody(C), FL = footL(C, q, LY.kneeL), AR = legRStraight(C, q, LY.legR), gh = C.fk(q).P.ghR;
    /* наклон «на локте» — такой, при котором лёжа рука до той же ладони почти прямая (запястье в LY.span от плеча):
       ладонь не сдвигается с положения лёжа до моста */
    const beta = C.solve1D(b => V.dist(gh, elbowLayout(C, b).W) - LY.span, 40, 60), E = elbowLayout(C, beta);
    return { FL, AR, PR: E.PR, dirE: E.dir, sigmaE: E.sigma, betaE: beta };
  });
});
/* Нелдер — Мид: минимум f(x) от x0 с начальными шагами d (детерминированно) */
function nm(f, x0, d, iters = 300) {
  const n = x0.length; let P = [x0.slice()];
  for (let i = 0; i < n; i++) { const x = x0.slice(); x[i] += d[i]; P.push(x); }
  let F = P.map(f);
  for (let it = 0; it < iters; it++) {
    const ord = F.map((v, i) => i).sort((a, b) => F[a] - F[b]); P = ord.map(i => P[i]); F = ord.map(i => F[i]);
    const c = P[0].map((_, j) => P.slice(0, n).reduce((s, x) => s + x[j], 0) / n), pt = k => c.map((v, j) => v + k * (P[n][j] - v));
    const r = pt(-1), fr = f(r);
    if (fr < F[0]) { const e = pt(-2), fe = f(e); if (fe < fr) { P[n] = e; F[n] = fe; } else { P[n] = r; F[n] = fr; } }
    else if (fr < F[n - 1]) { P[n] = r; F[n] = fr; }
    else { const k = pt(.5), fk = f(k); if (fk < F[n]) { P[n] = k; F[n] = fk; } else { for (let i = 1; i <= n; i++) { P[i] = P[i].map((v, j) => P[0][j] + .5 * (v - P[0][j])); F[i] = f(P[i]); } } }
  }
  const b = F.indexOf(Math.min(...F)); return { x: P[b], f: F[b] };
}
const deg = (C, a, b) => C.V.angle(a, b);
function footAt(C, q, s, P, fwd = [0, 0, -1], heel = 0) {
  const { V } = C;
  return C.foot(q, s, P, 0, V.unit(V.add(V.add([0, 1, 0], fwd), C.latP(q, s), LY.footOut)), { forward: fwd, heel });
}

/* ---------- положения: параметры корпуса ----------
   Каждое положение — таз (точка p или «на полу»: высота по касанию, над x = z = 0) и ориентация (orient), плюс поясница
   и грудной отдел. Между положениями параметры смешиваются, конечности каждый раз ставятся обратной кинематикой к своим
   опорам: ладонь, левая стопа и колено не скользят. */
const SIT = { beta: 22, rho: 10, hand: 2, span: 55 };
const SPAN = 55;
const fingersYaw = (C, L, yaw) => C.M3.v(C.M3.axis([0, 1, 0], -yaw * C.D2R), L.dirE);
const fingersSit = (C, L) => fingersYaw(C, L, SIT.hand);
const wristOn = (C, P, fingers) => C.V.add(C.V.add(P, fingers, -5.6), [0, 1.8, 0]);
/* таз и ноги до опускания на пол (иначе бёдра, опущенные вниз, поднимают таз) */
function makeBody(C, o) {
  const q = bodyAt(C, o, o.p || [0, 15, 0]);
  if (o.floor) { q.L.hip = [Math.max(40, 90 - o.beta), 6, 0]; q.L.knee = 100; q.R.hip = [Math.max(0, 90 - o.beta), 15, 0]; lowerTo(C, q, ['buttocks', 'torso']); }
  return q;
}
const lerp = (a, b, t) => a + (b - a) * t, lerpA = (a, b, t) => a.map((x, i) => lerp(x, b[i], t));
function blendBody(A, B, e) {
  const o = { floor: A.floor && B.floor };
  for (const k of ['beta', 'sigma', 'rho', 'psi']) o[k] = lerp(A[k] || 0, B[k] || 0, e);
  for (const k of ['lumbar', 'thoracic']) o[k] = lerpA(A[k] || [0, 0, 0], B[k] || [0, 0, 0], e);
  if (!o.floor) o.p = lerpA(A.p, B.p, e);
  return o;
}

/* «на локте», «на ладони»: бок sigma — по опоре руки */
const POSITIONS = once(() => {
  const C = ctx(EQUIP), { V, M } = C, L = LAYOUT();
  return C.unhinted(() => {
    const W = wristOn(C, L.PR, fingersSit(C, L));
    const sit = floorBody(C, { beta: SIT.beta, rho: SIT.rho }, null, q => V.dist(C.ghToward(q, 'R', W), W) - SIT.span, 0, 45);
    /* лёжа: лопатки и ягодицы на полу — наклон корпуса подбирается */
    const lowOf = (q, n) => Math.min(...C.region(q, n).map(p => p[1]));
    const lieBeta = C.solve1D(b => { const q = makeBody(C, { beta: b, lumbar: [2, 0, 0], floor: true }); return lowOf(q, 'upperBack') - lowOf(q, 'buttocks'); }, 84, 100, 18);
    const P = {
      lie: { beta: lieBeta, lumbar: [2, 0, 0], floor: true },
      elb: { beta: L.betaE, sigma: L.sigmaE, rho: ELBOW.rho, floor: true },
      sit: { beta: SIT.beta, sigma: sit.sigma, rho: SIT.rho, floor: true, pSit: sit.root.p.slice() },
      brg: (x => ({ p: x.slice(0, 3), beta: x[3], sigma: x[4], rho: x[5] }))(BRIDGE().x),
      wm: (x => ({ p: x.slice(0, 3), beta: x[3], sigma: x[4], psi: x[5], lumbar: [0, x[6] / 2, 0], thoracic: [0, x[6] / 2, 0] }))(WINDMILL().x),
      up: { p: [0, KNEEL().y, KNEEL().z], beta: 0 }
    };
    /* полюс локтя опорной руки в каждом положении — перебором (palmOn): лёжа локоть чуть над полом, «на локте» —
       предплечье на полу */
    const pole = (o, yaw, prefer, w) => { const q = makeBody(C, o); footAt(C, q, 'L', L.FL); return palmOn(C, q, 'R', L.PR, fingersYaw(C, L, yaw), prefer, w); };
    /* лёжа локоть чуть приподнят (полюс вверх), «на локте» — на полу: между ними локоть идёт по полу от точки к точке */
    const elbowAt = (o, pl) => { const q = makeBody(C, o); footAt(C, q, 'L', L.FL); C.palm(q, 'R', L.PR, L.dirE, [0, 1, 0], pl); return C.fk(q).P.elR; };
    P.elb.pole = pole(P.elb, 0, [0, -1, 0], 3); P.elb.elbow = elbowAt(P.elb, P.elb.pole);
    P.sit.pole = pole(P.sit, SIT.hand); P.brg.pole = pole(P.brg, SIT.hand); P.wm.pole = pole(P.wm, WM.yaw);
    /* лёжа рука почти прямая, локоть на полу (центр сустава не ниже LY.elbowMin): полюс — перебором вокруг оси «плечо —
       запястье», минимум пронации, ротации плеча и отклонения запястья */
    {
      const q0 = makeBody(C, P.lie); footAt(C, q0, 'L', L.FL);
      const gh = C.fk(q0).P.ghR, W = wristOn(C, L.PR, L.dirE), ax = V.unit(V.sub(W, gh)), b0 = V.unit(V.perp([0, 1, 0], ax)), b1 = V.cross(ax, b0);
      let best = null;
      for (let i = 0; i < 72; i++) {
        const a = i / 72 * 2 * Math.PI, pl = V.add(V.scale(b0, Math.cos(a)), b1, Math.sin(a)), q = M.clone(q0);
        C.palm(q, 'R', L.PR, L.dirE, [0, 1, 0], pl);
        const el = C.fk(q).P.elR, A = M.jointAngles(M.catalogPose(q)).R;
        const cost = Math.max(Math.abs(A.pron) / 82, Math.abs(A.twist) / 85, Math.abs(A.wristDev) / 22) + Math.max(0, LY.elbowMin - el[1]);
        if (!best || cost < best.cost) best = { cost, pl, el };
      }
      P.lie.pole = best.pl; P.lie.elbow = best.el;
    }
    /* длина «плечевой сустав — локоть» в концах (ритм пояса двигает сустав) */
    for (const k of ['lie', 'elb']) P[k].ua = V.dist(C.fk(makeBody(C, P[k])).P.ghR, P[k].elbow);
    return P;
  });
});
/* перекат на локоть: локоть стоит на полу в E, предплечье и ладонь — тоже; корпус поворачивается к опорной руке так, что
   плечевой сустав остаётся на расстоянии плеча от локтя (sigma подбирается) */
function upperArmOn(C, o, E, ua) {
  const { V } = C, d = sg => V.dist(C.fk(makeBody(C, { ...o, sigma: sg })).P.ghR, E) - ua;
  return C.solve1D(d, -15, 60, 22);
}

/* ---------- 4. Мост ---------- */
/* Мост («низкий», как советует Jankowitz для тяжёлой гири): таз поднят на BR.h, правая нога прямая до AR, опорная рука
   прямая (SPAN) с наклоном около BR.tilt, грудь повёрнута к опорной руке на BR.rho (левое плечо выше правого).
   x: [таз x, y, z, beta, sigma] */
const BR = { h: 33, rho: 10, tilt: 12, xz: [8, -5] };
function bridgeBody(C, x) { return bodyAt(C, { beta: x[3], sigma: x[4], rho: BR.rho }, [x[0], x[1], x[2]]); }
const BRIDGE = once(() => {
  const C = ctx(EQUIP), { V, M } = C, L = LAYOUT();
  return C.unhinted(() => {
    const W = wristOn(C, L.PR, fingersSit(C, L)), Lleg = M.B.th + M.B.sk - .3;
    const f = x => { const P = C.fk(bridgeBody(C, x)).P; return ((V.dist(P.hipR, L.AR) - Lleg) / .3) ** 2 + ((V.dist(P.ghR, W) - SPAN) / .3) ** 2 + ((deg(C, V.sub(P.ghR, W), [0, 1, 0]) - BR.tilt) / 5) ** 2 + ((x[1] - BR.h) / 3) ** 2 + ((x[0] - BR.xz[0]) / 8) ** 2 + ((x[2] - BR.xz[1]) / 8) ** 2; };
    const r = nm(f, [BR.xz[0], BR.h, BR.xz[1], 40, 25], [4, 4, 4, 8, 8], 500);
    return { x: [...r.x, BR.rho], f: r.f };
  });
});
/* ---------- 6–7. На колене и выпад ---------- */
const KN = { knee: 95, lift: 5.8, mtp: 70 };
const KNEEL = once(() => {
  const C = ctx(EQUIP), { M } = C, L = LAYOUT();
  return C.unhinted(() => {
    const y = MAT + KN.lift + M.B.th - .3, make = z => { const q = bodyAt(C, { beta: 0 }, [0, y, z]); footAt(C, q, 'L', L.FL); return q; };
    const z = C.solve1D(z => make(z).L.knee - KN.knee, L.FL[2] + 20, L.FL[2] + 80, 30), q = make(z), hipR = C.fk(q).P.hipR;
    return { y, z, K: [hipR[0], MAT, hipR[2]] };
  });
});
/* правая голень на полу: колено в K, голень от колена — назад (+Z) с разворотом влево на gamma°, пальцы подогнуты */
const shinDir = gamma => [-Math.sin(gamma * Math.PI / 180), 0, Math.cos(gamma * Math.PI / 180)];
/* стопа на колене: голеностоп A, рамки стопы и пальцев, точка опоры пальцев B (как C.kneel(…, { toes: 'toes' })); lift —
   голень поднята вокруг колена на lift° (носок над полом — «дворник») */
function kneelFootAt(C, gamma, lift = 0, mtp = KN.mtp) {
  const { V, M, M3 } = C, K = KNEEL().K, u = [0, 1, 0], d = shinDir(gamma), Kc = V.add(K, u, KN.lift);
  const toesR = M3.frameYZ(u, V.scale(d, -1)), footR = M3.mul(toesR, M3.rx(mtp));
  const ankleAt = x => V.sub(V.add(V.add(K, d, x), u, -M.B.toeSole), M3.v(footR, M.B.ball));
  const x = C.solve1D(x => V.dist(ankleAt(x), Kc) - M.B.sk, 15, 75), A = ankleAt(x), Rl = M3.axis(V.cross(d, u), lift * C.D2R);
  return { A: V.add(Kc, M3.v(Rl, V.sub(A, Kc))), R: M3.mul(Rl, footR), toesR: M3.mul(Rl, toesR), B: V.add(K, d, x), Kc };
}
/* колено ставится точно в K: полюс — от середины «тазобедренный — голеностоп» к колену */
function kneelR(C, q, gamma, lift = 0) {
  const { V, M } = C, k = kneelFootAt(C, gamma, lift), hip = C.fk(q).P.hipR;
  return M.solveLeg(q, 'R', { o: k.A, R: k.R, toesR: k.toesR }, V.sub(k.Kc, V.mix(hip, k.A, .5)));
}
/* правая нога прямая, голеностоп в AR: стопа поворачивается вокруг голеностопа так, чтобы пятка лежала на полу
   (нижняя точка стопы — на 0,3 см в полу) */
function legStraight(C, q) {
  const L = LAYOUT(), put = d => C.legTo(q, 'R', L.AR, [0, 1, 0], { dorsi: d, allowShort: true });
  put(C.solve1D(d => { put(d); return lowestFoot(C, q, 'R') - (MAT - .3); }, -25, 25, 20));
}
function relaxR(q) { q.R.shoulder = [4, 8, 0]; q.R.elbow = 10; q.R.pron = 0; q.R.wrist = [0, 0]; q.hands = { ...(q.hands || {}), R: 'relaxed' }; }

/* ---------- 5. «Мельница на колене» ---------- */
const WM = { gamma: 35, beta: -15, sigma: 25, bend: 30, off: 18, span: 55, yaw: 35 };
/* x: [таз x, y, z, наклон вперёд-назад, наклон к правому боку, разворот, боковой наклон позвоночника вправо] */
function wmBody(C, x) { return bodyAt(C, { beta: x[3], sigma: x[4], psi: x[5], lumbar: [0, x[6] / 2, 0], thoracic: [0, x[6] / 2, 0] }, [x[0], x[1], x[2]]); }
const WINDMILL = once(() => {
  const C = ctx(EQUIP), { V, M } = C, L = LAYOUT(), K = KNEEL();
  return C.unhinted(() => {
    const W = wristOn(C, L.PR, fingersYaw(C, L, WM.yaw)), Kc = V.add(K.K, [0, KN.lift, 0]);
    const f = x => {
      const P = C.fk(wmBody(C, x)).P, off = Math.hypot(P.hipR[0] - Kc[0], P.hipR[2] - Kc[2]);
      return ((V.dist(P.hipR, Kc) - M.B.th) / .2) ** 2 + ((V.dist(P.ghR, W) - WM.span) / .3) ** 2 + (Math.max(0, off - WM.off) / 3) ** 2 + ((x[3] - WM.beta) / 10) ** 2 + ((x[4] - WM.sigma) / 10) ** 2 + (x[5] / 15) ** 2 + ((x[6] - WM.bend) / 10) ** 2;
    };
    const r = nm(f, [0, 42, K.z, WM.beta, WM.sigma, 0, WM.bend], [4, 4, 4, 8, 8, 8, 8], 800);
    return { x: r.x, f: r.f };
  });
});

/* ---------- 8. Стоя ---------- */
const SPL = { dz: -2, knee: 55, kneeR: 35 };
const STAND = once(() => {
  const C = ctx(EQUIP), { V } = C, L = LAYOUT();
  return C.unhinted(() => {
    const q = C.base(), a = 8 * C.D2R, fwdR = [Math.sin(a), 0, -Math.cos(a)], BR2 = [L.FL[0] + 18, MAT, L.FL[2] + 1];
    C.root(q, [L.FL[0] + 9, 88.6 + MAT, L.FL[2] + 13.5], [0, 1, 0], [0, 0, -1]);
    const feet = q => { footAt(C, q, 'L', L.FL); footAt(C, q, 'R', BR2, fwdR); };
    relaxR(q);
    for (let i = 0; i < 6; i++) {
      feet(q); bellUp(C, q, 'L', { girdle: [0, 0] });
      const c = C.com(q, [[C.fk(q).P.gripL, KB_KG]]), f = C.fk(q), mid = V.mix(f.P.anL, f.P.anR, .5), d = [mid[0] - c[0], 0, mid[2] - 4 - c[2]];
      if (Math.hypot(d[0], d[2]) < .15) break;
      q.root.p = V.add(q.root.p, d);
    }
    /* разножка: таз над точкой между стопами (z — на SPL.dz впереди колена K), левое колено согнуто на SPL.knee,
       правая стопа на подушечке там же, где в выпаде; подъём пятки — при котором правое колено согнуто на SPL.kneeR */
    const K = KNEEL(), k = kneelFootAt(C, 0), z = K.z - SPL.dz;
    const mk = y => { const t = C.base(); C.root(t, [0, y, z], [0, 1, 0], [0, 0, -1]); footAt(C, t, 'L', L.FL); return t; };
    const y = C.solve1D(y => mk(y).L.knee - SPL.knee, K.y, K.y + 40, 30), t = mk(y);
    const heel = C.solve1D(h => { C.foot(t, 'R', k.B, 0, V.unit(REAR), { forward: [0, 0, -1], heel: h, allowShort: true }); return SPL.kneeR - t.R.knee; }, 20, 80, 24);
    return { p: q.root.p.slice(), split: [0, y, z], heel, ballR: BR2, fwdR };
  });
});

/* ---------- фазы ----------
   t: 0 лёжа · 0,15 на локте · 0,3 на ладони · 0,425 мост · 0,575 «мельница на колене» · 0,675 на колене, корпус
   вертикален · 0,775 выпад (после «дворника») · 0,85 правая стопа отрывается · 0,95 стопы рядом · 1 стоя */
const T = { elb: .15, sit: .3, brg: .425, wm: .575, up: .675, lng: .775, push: .85, land: .95, std: 1 };
/* ключи через 2,5 % цикла; при проведении ноги — через 1,25 % (иначе стопа между ключами уходит в пол) */
const KEYS = Array.from({ length: 41 }, (_, i) => i / 40).concat(Array.from({ length: 6 }, (_, i) => .4375 + i * .025)).sort((a, b) => a - b);
const smooth = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
const seg = (t, a, b) => smooth((t - a) / (b - a));
const nlerpM = (C, A, B, t) => { const { Q } = C.M, a = Q.fromM3(A), b = Q.fromM3(B), sg = a.reduce((s, x, i) => s + x * b[i], 0) < 0 ? -1 : 1; return Q.toM3(Q.norm(a.map((x, i) => lerp(x, sg * b[i], t)))); };
const vnl = (C, a, b, t) => C.V.unit(C.V.mix(a, b, t));
/* гиря: [полюс локтя, разворот большого пальца] и пояс по положениям (подобраны по ротации плеча и пронации) */
const BELL = { lie: [15, 0], elb: [30, 0], sit: [40, 0], brg: [60, 20], wm: [100, 45], up: [90, 30], lng: [50, 30] };

function tguPose(t, C) {
  const { V, M, M3 } = C, L = LAYOUT(), P = POSITIONS(), K = KNEEL(), ST = STAND();
  let o, arm, leg, bell, girdle = [0, 6], look = 1;
  if (t <= T.elb) { const e = seg(t, 0, T.elb), E = lerpA(P.lie.elbow, P.elb.elbow, e); o = blendBody(P.lie, P.elb, e); o.rho = lerp(0, P.elb.rho, seg(t, 0, T.elb * .6)); if (e > 0 && e < 1) o.sigma = upperArmOn(C, o, E, lerp(P.lie.ua, P.elb.ua, e)); arm = { yaw: 0, elbow: E }; bell = lerpA(BELL.lie, BELL.elb, e); leg = 'straight'; }
  else if (t <= T.sit) { const e = seg(t, T.elb, T.sit); o = blendBody(P.elb, P.sit, e); arm = { yaw: lerp(0, SIT.hand, e), pole: vnl(C, P.elb.pole, P.sit.pole, e), span: true, elbow0: e < 1 ? P.elb.elbow : null, e }; bell = lerpA(BELL.elb, BELL.sit, e); leg = 'straight'; }
  else if (t <= T.brg) { const e = seg(t, T.sit, T.brg); o = blendBody({ ...P.sit, floor: false, p: P.sit.pSit }, P.brg, e); arm = { yaw: SIT.hand, pole: vnl(C, P.sit.pole, P.brg.pole, e), span: true }; bell = lerpA(BELL.sit, BELL.brg, e); leg = 'straight'; }
  else if (t <= T.wm) { const u = (t - T.brg) / (T.wm - T.brg), e = smooth(u); o = blendBody(P.brg, P.wm, e); arm = { yaw: lerp(SIT.hand, WM.yaw, e), pole: vnl(C, P.brg.pole, P.wm.pole, e), span: true }; bell = lerpA(BELL.brg, BELL.wm, e); leg = { sweep: u }; }
  else if (t <= T.up) { const e = seg(t, T.wm, T.up); o = blendBody(P.wm, P.up, e); arm = { lift: seg(t, T.wm + HL.on * (T.up - T.wm), T.up), yaw: WM.yaw, pole: P.wm.pole }; bell = lerpA(BELL.wm, BELL.up, e); girdle = [0, 6 * (1 - e)]; look = 1 - e; leg = { kneel: WM.gamma }; }
  else if (t <= T.lng) { const u = (t - T.up) / (T.lng - T.up); o = P.up; arm = 'relax'; bell = lerpA(BELL.up, BELL.lng, smooth(u)); girdle = [0, 0]; look = 0; leg = { kneel: WM.gamma * (1 - smooth(u)) }; }
  else { o = { p: standPelvis(C, t), beta: 0 }; arm = 'relax'; bell = BELL.lng; girdle = [0, 0]; look = 0; leg = { stand: t }; }

  const q = makeBody(C, o);
  if (t > T.wm && t <= T.lng) fitThigh(C, q);
  footAt(C, q, 'L', L.FL);
  /* правая нога */
  if (leg === 'straight') legStraight(C, q);
  else if (leg.sweep != null) sweepR(C, q, leg.sweep);
  else if (leg.kneel != null) kneelR(C, q, leg.kneel, leg.lift || 0);
  else standR(C, q, leg.stand);
  /* правая рука */
  if (arm === 'relax') relaxR(q);
  else if (arm.lift != null && (arm.lift > 0 || V.dist(C.fk(q).P.ghR, wristOn(C, L.PR, fingersYaw(C, L, arm.yaw))) > SPAN)) liftR(C, q, Math.max(arm.lift, 1e-3), arm);
  else {
    const fingers = fingersYaw(C, L, arm.yaw);
    const W = wristOn(C, L.PR, fingers);
    if (arm.span) keepSpan(C, q, o, W);
    let pole = arm.pole;
    if (arm.elbow) pole = V.sub(arm.elbow, V.mix(C.fk(q).P.ghR, W, .5));
    C.palm(q, 'R', L.PR, fingers, [0, 1, 0], pole);
  }
  bellUp(C, q, 'L', { pole: bell[0], thumb: bell[1], girdle });
  gaze(C, q, look);
  return q;
}
/* колено на месте: таз по высоте — так, чтобы правое бедро доставало до колена K ровно */
function fitThigh(C, q) {
  const { V, M } = C, Kc = V.add(KNEEL().K, [0, KN.lift, 0]), y0 = q.root.p[1];
  q.root.p[1] = C.solve1D(y => { q.root.p[1] = y; return V.dist(C.fk(q).P.hipR, Kc) - M.B.th; }, y0 - 8, y0 + 8, 24);
}
/* прямая опорная рука не длиннее SPAN: если плечо ушло дальше от запястья, корпус наклоняется к руке (sigma) */
function keepSpan(C, q, o, W) {
  const { V } = C, span = q => V.dist(C.fk(q).P.ghR, W);
  if (span(q) <= SPAN) return;
  const mk = d => { const t = makeBody(C, { ...o, sigma: (o.sigma || 0) + d }); return t; };
  const d = C.solve1D(d => span(mk(d)) - SPAN, 0, 20, 18), t = mk(d);
  Object.assign(q, { root: t.root, lumbar: t.lumbar, thoracic: t.thoracic });
  footAt(C, q, 'L', LAYOUT().FL);
}
/* правая нога проводится под таз: голеностоп — от AR к положению «на колене» по дуге (подъём над полом), рамка стопы —
   от стопы прямой ноги к стопе с подогнутыми пальцами, колено — от прямой ноги к колену K */
function sweepR(C, q, u) {
  const { V, M } = C, L = LAYOUT(), k = kneelFootAt(C, WM.gamma), e = smooth(u);
  const t0 = M.clone(q); legStraight(C, t0);
  const f0 = C.fk(t0), hip = C.fk(q).P.hipR, A0 = f0.P.anR, A1 = k.A;
  /* пятка скользит назад над полом под таз (точка SW.mid в середине пути), колено при этом поднимается, затем
     опускается в K, голень уходит назад-влево */
  const Mid = SW.mid, ctl = V.sub(V.scale(Mid, 2), V.mix(A0, A1, .5)), w = u;
  const A = V.add(V.add(V.add(V.scale(A0, (1 - w) ** 2), ctl, 2 * w * (1 - w)), A1, w * w), [0, 1, 0], 2 * smooth(u * 4) * (1 - u));
  const pole0 = V.unit(V.add([0, 1, 0], C.latP(q, 'R'), .3)), pole1 = V.unit(V.sub(k.Kc, V.mix(hip, A1, .5)));
  const pole = vnl(C, pole0, pole1, smooth(Math.max(0, (u - .3) / .7)));
  /* стопа — в осях голени: от стопы прямой ноги к стопе на колене (без скручивания в голеностопе) */
  const M3 = C.M3, sk0 = f0.F.skR.R, rel0 = M3.mul(M3.T(sk0), f0.F.footR.R), relT1 = M3.mul(M3.T(k.R), k.toesR);
  const tk = M.clone(q); kneelR(C, tk, WM.gamma); const rel1 = M3.mul(M3.T(C.fk(tk).F.skR.R), k.R);
  let a = A.slice();
  for (let it = 0; it < 3; it++) {
    M.solveLeg(q, 'R', { o: a, R: k.R, toesR: k.toesR }, pole);
    const Rf = M3.mul(C.fk(q).F.skR.R, nlerpM(C, rel0, rel1, e));
    M.solveLeg(q, 'R', { o: a, R: Rf, toesR: M3.mul(Rf, nlerpM(C, M3.I(), relT1, e)) }, pole);
    const low = lowestFoot(C, q, 'R');
    if (low >= MAT - .3 || u >= 1) break;
    a = V.add(a, [0, MAT - .2 - low, 0]);
  }
}
const SW = { mid: [14, 9, -24] };
/* рука отрывается от пола сразу после «мельницы» (толчок рукой), HL.on — задержка в долях перехода */
const HL = { on: 0 };
/* правая рука отрывается от пола и опускается вдоль тела: углы — от рук «мельницы» к расслабленной */
const WM_ARM = once(() => { const C = ctx(EQUIP), L = LAYOUT(), P = POSITIONS(); return C.unhinted(() => { const q = makeBody(C, P.wm); footAt(C, q, 'L', L.FL); C.palm(q, 'R', L.PR, fingersYaw(C, L, WM.yaw), [0, 1, 0], P.wm.pole); return { shoulder: q.R.shoulder, elbow: q.R.elbow, pron: q.R.pron, wrist: q.R.wrist }; }); });
function liftR(C, q, e, arm) {
  const { M } = C, L = LAYOUT(), R0 = { shoulder: [4, 8, 0], elbow: 10, pron: 0, wrist: [0, 0] }, w = smooth(e);
  /* начало — рука на ладони при нынешнем корпусе (если ещё дотягивается), иначе — рука «мельницы» */
  let A = WM_ARM();
  try { const t = M.clone(q); C.palm(t, 'R', L.PR, fingersYaw(C, L, arm.yaw), [0, 1, 0], arm.pole); A = t.R; } catch (err) { /* не дотянуться */ }
  q.R.shoulder = lerpA(A.shoulder, R0.shoulder, w); q.R.elbow = lerp(A.elbow, R0.elbow, w); q.R.pron = lerp(A.pron, R0.pron, w); q.R.wrist = lerpA(A.wrist, R0.wrist, w);
  q.hands = { ...(q.hands || {}), R: e < .5 ? 'flat' : 'relaxed' };
}
/* вставание из выпада: таз — вверх до разножки (0,775–0,85, правая стопа на подушечке), затем правая стопа шагает
   к левой, а таз уходит в стойку (0,85–0,95), стопы рядом (0,95–1) */
function standPelvis(C, t) {
  const K = KNEEL(), ST = STAND(), a = [0, K.y, K.z];
  if (t <= T.push) return lerpA(a, ST.split, seg(t, T.lng, T.push));
  return lerpA(ST.split, ST.p, seg(t, T.push, T.land));
}
const REAR = [0, -1, -.6];
function standR(C, q, t) {
  const { V } = C, ST = STAND(), k = kneelFootAt(C, 0);
  if (t <= T.push) { C.foot(q, 'R', k.B, 0, V.unit(REAR), { forward: [0, 0, -1], heel: lerp(70, ST.heel, seg(t, T.lng, T.push)), allowShort: true }); return; }
  const u = Math.min(1, (t - T.push) / (T.land - T.push)), e = smooth(u), B = V.add(V.mix(k.B, ST.ballR, e), [0, 1, 0], 7 * Math.sin(Math.PI * u));
  C.foot(q, 'R', B, 0, vnl(C, REAR, [0, 1, -1], e), { forward: vnl(C, [0, 0, -1], ST.fwdR, e), heel: lerp(ST.heel, 0, e), allowShort: true });
}
/* взгляд на гирю: шея (сгибание и поворот) — лицо к гире, в пределах FLEX и ROT; w — доля (0 — вперёд) */
const GZ = { flex: [-40, 35], rot: 40 };
function gaze(C, q, w) {
  const { V, M3 } = C, target = C.fk(q).P.gripL;
  const set = (f, r) => { q.neck = [Math.max(GZ.flex[0], Math.min(GZ.flex[1], f)), 0, Math.max(-GZ.rot, Math.min(GZ.rot, r))]; };
  const cost = x => { set(x[0], x[1]); const f = C.fk(q); return -V.dot(M3.col(f.F.head.R, 2), V.unit(V.sub(target, f.P.head))); };
  const r = w > 0 ? nm(cost, [0, 0], [10, 10], 60).x : [0, 0];
  set(r[0] * w, r[1] * w);
}

const at = (a, b, list) => list.map(c => ({ ...c, when: [a, b] }));
module.exports = {
  _kbtgu: {
    keys: KEYS,
    equipment: EQUIP,
    contacts: [{ body: 'gripL', prop: 'kb' },
      { body: 'soleL', prop: 'floor' },
      ...at(0, .01, [{ body: 'back', prop: 'floor' }]),
      ...at(0, T.sit + .005, [{ body: 'buttocks', prop: 'floor' }]),
      ...at(0, T.brg + .005, [{ body: 'footR', prop: 'floor' }]),
      ...at(T.elb - .005, T.elb + .005, [{ body: 'faR', prop: 'floor' }]),
      ...at(0, T.wm + .005, [{ body: 'palmR', prop: 'floor' }]),
      ...at(T.wm - .001, T.lng + .005, [{ body: 'kneeR', prop: 'floor' }]),
      ...at(T.wm - .001, T.push + .005, [{ body: 'footR', prop: 'floor' }]),
      ...at(T.land - .005, 1, [{ body: 'soleR', prop: 'floor' }])],
    gripRadius: { L: 1.7, R: 1.7 },
    pose: tguPose
  }
};
/* раскладка — для отладки (не перечисляется: loadSpecs её не видит) */
Object.defineProperty(module.exports, '_layout', { value: () => ({ ...LAYOUT(), bridge: BRIDGE(), kneel: KNEEL(), windmill: WINDMILL(), stand: STAND() }), enumerable: false });
Object.defineProperty(module.exports, '_dbg', { value: () => ({ LAYOUT, BRIDGE, KNEEL, POSITIONS, legStraight, kneelR, WINDMILL, STAND, palmOn, bodyAt, makeBody, floorBody, bridgeBody, footAt, bellUp, wristOn, fingersSit, SIT, BR, EQUIP, orient, nm, DBG }), enumerable: false });
