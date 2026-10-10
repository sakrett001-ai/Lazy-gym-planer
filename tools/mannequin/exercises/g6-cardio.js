'use strict';
/* Группа G6: кардиотренажёры и динамичные упражнения.
   Оси: Z — вперёд по взгляду (вдоль тренажёра), X — влево, Y — вверх, см.
   Циклические движения — замкнутый цикл (loop: true), прыжки — dynamic: true,
   опора стоп в части цикла — контакты с when. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const TAU = 2 * Math.PI, D2R = Math.PI / 180;
const clamp01 = x => Math.max(0, Math.min(1, x));
const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const keysN = n => Array.from({ length: n + 1 }, (_, i) => +(i / n).toFixed(5));
const sgn = s => (s === 'L' ? 1 : -1);
/* расстояние тазобедренный — голеностоп при сгибании колена k, град */
const legSpan = (M, k) => Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(k * D2R));
/* Рамка опоры стопы: yaw — разворот носка наружу (+), pitch — наклон всей стопы носком вниз (+),
   heel — подъём пятки относительно пальцев. Возвращает опции для C.foot. */
function footOpts(s, { yaw = 0, pitch = 0, heel = 0, up = null } = {}) {
  const y = sgn(s) * yaw * D2R, p = pitch * D2R, f0 = [Math.sin(y), 0, Math.cos(y)];
  if (up) return { forward: f0, up, heel };
  return { forward: [f0[0] * Math.cos(p), -Math.sin(p), f0[2] * Math.cos(p)], up: [f0[0] * Math.sin(p), Math.cos(p), f0[2] * Math.sin(p)], heel };
}
/* поставить стопу: ball — точка подошвы под подушечкой стопы */
function place(C, q, s, ball, o, pole, allowShort = false) {
  const opts = { ...footOpts(s, o), allowShort };
  return C.foot(q, s, ball, 0, pole || C.V.unit([sgn(s) * .25, .15, 1]), opts);
}
/* Замкнутая кривая по опорным значениям [[t, v], …] на [0, 1): кубический Эрмит с касательными Катмулла — Рома */
function loopSpline(pts) {
  const n = pts.length, T = i => pts[((i % n) + n) % n][0] + Math.floor(i / n), Vv = i => pts[((i % n) + n) % n][1];
  return t => {
    t = ((t % 1) + 1) % 1; let i = n - 1; for (let k = 0; k < n; k++) if (pts[k][0] <= t) i = k;
    let t0 = T(i), t1 = T(i + 1); if (t < t0) t += 1;
    const m = j => (Vv(j + 1) - Vv(j - 1)) / (T(j + 1) - T(j - 1)), h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * Vv(i) + (u3 - 2 * u2 + u) * h * m(i) + (-2 * u3 + 3 * u2) * Vv(i + 1) + (u3 - u2) * h * m(i + 1);
  };
}
/* Свободная рука в сагиттальной плоскости грудной клетки: a — сгибание плеча (0 — вниз, 90 — вперёд, <0 — назад),
   reach — расстояние плечевой сустав — запястье, out — отведение, град. */
function swingArm(C, q, s, a, { reach = 54.5, out = 8, pron = 0, mode = 'relaxed', wrist = [0, 0] } = {}) {
  const { V } = C, T = C.axes(q), lat = C.lat(q, s), r = a * D2R, o = out * D2R;
  const sag = V.add(V.scale(T.y, -Math.cos(r)), T.z, Math.sin(r)), dir = V.unit(V.add(V.scale(sag, Math.cos(o)), lat, Math.sin(o)));
  const pole = V.unit(V.add(V.add(V.scale(T.z, -Math.cos(r)), T.y, -Math.sin(r)), lat, .3));
  const gh = C.fk(q).P['gh' + s];
  C.armTo(q, s, V.add(gh, dir, reach), pole, { pron, mode, wrist });
}
function ankleOf(C, s, ball, o) { return C.M.footFrame(ball, 0, footOpts(s, o)).o; }
/* высота таза, при которой колено стороны s согнуто на k при данной постановке стопы (таз горизонтален) */
function hipYFor(C, s, ball, o, k, rootXZ = [0, 0], tiltX = 0) {
  const an = ankleOf(C, s, ball, o), hx = rootXZ[0] + sgn(s) * C.M.B.hipHalf * Math.cos(tiltX * D2R), d = legSpan(C.M, k);
  const h2 = d * d - (an[0] - hx) ** 2 - (an[2] - rootXZ[1]) ** 2;
  return an[1] + Math.sqrt(Math.max(0, h2));
}

/* ---------- Упор лёжа (скалолаз, бёрпи) ---------- */
const MAT = 1, PLANK = { theta: 20, handX: 18.5, handZ: 0, heel: 62, kneeExt: 4 };
/* корпус в упоре: ось тела под углом theta к полу, плечи над кистями */
function plankBody(C, theta = PLANK.theta) {
  const { V } = C, q = C.base(), a = theta * D2R;
  C.root(q, [0, 45, -50], [0, Math.sin(a), Math.cos(a)], [0, -Math.cos(a), Math.sin(a)]);
  q.neck = [-12, 0, 0]; q.lumbar = [-2, 0, 0]; q.thoracic = [2, 0, 0];
  for (const s of S) q[s].girdle = [2, 8];
  C.rootAtShoulders(q, [0, MAT + 55.6, PLANK.handZ - 8]);
  return q;
}
function plankHands(C, q, hx = PLANK.handX, turn = -.18, hz = PLANK.handZ) {
  const { V } = C;
  for (const s of S) {
    const lat = C.lat(q, s), fingers = V.unit([sgn(s) * turn, 0, 1]);
    C.palm(q, s, [sgn(s) * hx, MAT, hz], fingers, [0, 1, 0], V.unit(V.add([0, -.3, -1], lat, .25)));
  }
}
/* раскладка: где стоит носок выпрямленной ноги и где голеностоп подтянутой */
const plankLayout = C => PLANK.layout || (PLANK.layout = (() => {
  const q = plankBody(C), f = C.fk(q), hip = f.P.hipL;
  const ext = z => [10.5, MAT, z], fo = { heel: PLANK.heel };
  const zE = C.solve1D(z => { const an = ankleOf(C, 'L', ext(z), fo); return C.V.dist(an, hip) - legSpan(C.M, PLANK.kneeExt); }, hip[2] - 110, hip[2] - 60);
  place(C, q, 'L', ext(zE), fo, [.1, -1, .15]);
  return { zE, AE: C.M.footFrame(ext(zE), 0, footOpts('L', fo)).o, dE: q.L.ankle[0], AT: [9.5, MAT + 11.5, hip[2] - 14], hipZ: hip[2] };
})());
/* опорная нога: носок на месте, пятка поднимается или опускается так, чтобы колено оставалось почти прямым */
function plankStance(C, q, s, L) {
  const g = sgn(s), ball = [g * 10.5, MAT, L.zE], hip = C.fk(q).P['hip' + s], pole = [g * .1, -1, .15];
  const heel = C.solve1D(h => legSpan(C.M, PLANK.kneeExt) - C.V.dist(ankleOf(C, s, ball, { heel: h }), hip), 30, 82);
  place(C, q, s, ball, { heel }, pole);
}
/* маховая нога: w — 0 у опоры, 1 — колено у груди (стопа над ковриком) */
function plankSwing(C, q, s, w, L, { arc = 8, dT = -40 } = {}) {
  const { V } = C, g = sgn(s), pole = V.unit(V.mix([g * .3, -1, .2], [g * .2, -.35, 1], w));
  const m = V.mix(L.AE, L.AT, w), ankle = [g * m[0], m[1] + arc * Math.sqrt(Math.sin(Math.PI * w)), m[2]];
  C.legTo(q, s, ankle, pole, { dorsi: C.lerp(L.dE, dT, smooth(Math.min(1, 2 * w))) });
}
/* ноги в упоре: wL, wR — вынос колена (0 — нога на опоре). Таз поднимается ровно настолько, чтобы колено
   маховой ноги проходило над ковриком (колено проходит под тазом). */
function plankLegs(C, w, L, theta0 = PLANK.theta) {
  let theta = theta0, q;
  for (let it = 0; it < 4; it++) {
    q = plankBody(C, theta);
    let need = 0;
    for (const s of S) if (w[s] > 1e-4) { plankSwing(C, q, s, w[s], L); const kn = C.fk(q).P['kn' + s]; need = Math.max(need, MAT + 8.2 + 3.5 * w[s] - kn[1]); }
    if (need < .05) break;
    theta -= need / .72;
  }
  for (const s of S) if (w[s] <= 1e-4) plankStance(C, q, s, L);
  return q;
}
function plankPose(C, t, L) {
  /* фаза каждой ноги: 0,25…0,75 — опора выпрямленной ноги на носок, 0,75…1 — вынос колена к груди, 0…0,25 — назад */
  const leg = p => { p = ((p % 1) + 1) % 1; if (p >= .25 && p <= .75) return 0; return smooth(p > .75 ? (p - .75) / .25 : 1 - p / .25); };
  const q = plankLegs(C, { L: leg(t), R: leg(t + .5) }, L);
  plankHands(C, q);
  return q;
}

/* ---------- Бёрпи ---------- */
const BURPEE = { T: { land: .08, hands: .62, shift: .64, plank: .93 }, pelvis: 40, lumbar: 35, thoracic: 28, hipF: 110, hipAbd: 8, knee: 136, heel: 50, reach: 53.2, handX: 24, turn: .1, handZ: 1.5 };
/* равномерное движение с разгоном и торможением (трапеция скорости): доля пути за долю времени u */
const trap = (u, a = .25) => { u = clamp01(u); const v = 1 / (1 - a); return u < a ? .5 * v * u * u / a : u > 1 - a ? 1 - .5 * v * (1 - u) ** 2 / a : v * (u - a / 2); };
/* присед с ладонями на коврике: таз наклонён, спина скруглена, колени разведены, плечи позади кистей на длину руки */
function burpeeSquatBody(C, p) {
  const q = C.base(), a = BURPEE.pelvis * D2R;
  C.root(q, p, [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [BURPEE.lumbar, 0, 0]; q.thoracic = [BURPEE.thoracic, 0, 0]; q.neck = [-34, 0, 0];
  for (const s of S) { q[s].girdle = [4, 12]; q[s].hip = [BURPEE.hipF, BURPEE.hipAbd, 8]; q[s].knee = BURPEE.knee; q[s].ankle = [0, 0]; }
  return q;
}
const burpeeLayout = C => BURPEE.layout || (BURPEE.layout = (() => {
  const { V, M } = C, wr = [BURPEE.handX + 1, MAT + 1.8, BURPEE.handZ - 5.6];
  let q = burpeeSquatBody(C, [0, 40, -50]);
  /* опора на подушечки стоп: высота таза — по нижней точке подушечки */
  const ball0 = C.fk(q).P.ballL, y = 40 - (ball0[1] - (MAT + 2));
  const zH = C.solve1D(z => BURPEE.reach - V.dist(C.fk(burpeeSquatBody(C, [0, y, z])).P.ghL, wr), -95, -20);
  q = burpeeSquatBody(C, [0, y, zH]);
  const b = C.fk(q).P.ballL;
  return { root: [0, y, zH], ball: [b[0], MAT, b[2]], plank: plankLayout(C) };
})());
function burpeeSquat(C, L, { heel = BURPEE.heel } = {}) {
  const q = burpeeSquatBody(C, L.root);
  for (const s of S) { const lat = C.latP(q, s); place(C, q, s, [sgn(s) * L.ball[0], MAT, L.ball[2]], { yaw: 10, heel }, C.V.unit(C.V.add([0, .2, 1], lat, .25))); }
  return q;
}
/* смесь двух поз: углы и положение таза (поза — для тела, руки и ноги ставятся заново) */
function blendBody(C, a, b, w) {
  const q = C.M.clone(a), Ra = C.M.Q.toM3(a.root.q), Rb = C.M.Q.toM3(b.root.q), V = C.V;
  const up = V.unit(V.mix(C.M.M3.col(Ra, 1), C.M.M3.col(Rb, 1), w)), fw = V.unit(V.mix(C.M.M3.col(Ra, 2), C.M.M3.col(Rb, 2), w));
  q.root.p = V.mix(a.root.p, b.root.p, w); q.root.q = C.M.rootFromAxes(up, fw);
  for (const k of ['lumbar', 'thoracic', 'neck']) q[k] = a[k].map((v, i) => C.lerp(v, b[k][i], w));
  for (const s of S) q[s].girdle = a[s].girdle.map((v, i) => C.lerp(v, b[s].girdle[i], w));
  return q;
}
/* стоя над местом приседа: верхняя точка прыжка (lift > 0) или приземление; руки — отдельно */
function burpeeStand(C, L, { lift = 0, knee = 6, lean = 3, heel = 0, pitch = 0 } = {}) {
  const { V } = C, q = C.base(), a = lean * D2R, fo = { yaw: 10, heel, pitch }, ball = s => [sgn(s) * L.ball[0], MAT + lift, L.ball[2]];
  const z = L.ball[2] - 10;
  C.root(q, [0, 90, z], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.root.p[1] = hipYFor(C, 'L', ball('L'), fo, knee, [0, z]);
  q.neck = [-3, 0, 0];
  for (const s of S) { const lat = C.latP(q, s); place(C, q, s, ball(s), fo, V.unit(V.add([0, .1, 1], lat, .15))); }
  return q;
}
/* рука от плеча в сагиттальной плоскости под углом W от вертикали вниз (вперёд +) */
function armWorld(C, q, s, W, reach, { out = 6, lift = 0, pron = 0, ext = 0 } = {}) {
  const { V } = C, r = W * D2R, o = out * D2R, lat = C.lat(q, s), gh = C.fk(q).P['gh' + s];
  const dir = V.unit(V.add(V.scale([0, -Math.cos(r), Math.sin(r)], Math.cos(o)), lat, Math.sin(o)));
  const pole = V.unit(V.add([0, -Math.sin(r), -Math.cos(r)], lat, .35));
  C.armTo(q, s, V.add(V.add(gh, dir, reach), [0, 1, 0], lift), pole, { mode: 'flat', allowShort: true, pron, wrist: [ext, 0] });
}
function pivotAtShoulders(C, q, deg) {
  if (Math.abs(deg) < 1e-6) return q;
  const { V, M } = C, f = C.fk(q), c = V.mix(f.P.ghL, f.P.ghR, .5), R = M.M3.rx(deg);
  q.root.p = V.add(c, M.M3.v(R, V.sub(q.root.p, c))); q.root.q = M.Q.fromM3(M.M3.mul(R, M.Q.toM3(q.root.q)));
  return q;
}
function burpeePose(C, t) {
  const { V } = C, L = burpeeLayout(C), hx = BURPEE.handX, T = BURPEE.T;
  /* 3) ноги назад прыжком и упор лёжа: ладони на месте, тело поворачивается вокруг плеч */
  if (t >= T.shift) {
    const u = trap((t - T.shift) / (T.plank - T.shift)), sq = burpeeSquat(C, L, { heel: 56 }), pl = plankBody(C);
    const q = blendBody(C, sq, pl, smooth(u));
    /* в прыжке таз поднимается: тело поворачивается вокруг плеч, колени проходят над ковриком */
    pivotAtShoulders(C, q, 16 * Math.sin(Math.PI * u));
    if (t >= T.plank) { for (const s of S) plankStance(C, q, s, L.plank); }
    else for (const s of S) {
      const g = sgn(s), fs = ankleOf(C, 'L', [L.ball[0], MAT, L.ball[2]], { yaw: 10, heel: 56 }), fe = L.plank.AE;
      const m = V.mix(fs, fe, u), ankle = [g * C.lerp(fs[0], fe[0], u), m[1] + 12 * Math.sin(Math.PI * u), m[2]];
      C.legTo(q, s, ankle, V.unit(V.mix([g * .12, .2, 1], [g * .1, -1, .15], u)), { dorsi: C.lerp(sq.L.ankle[0], L.plank.dE, u) });
    }
    plankHands(C, q, hx, BURPEE.turn, BURPEE.handZ);
    return q;
  }
  /* 2) присед, ладони на коврике; вес переходит на руки (пятки выше) */
  if (t >= T.hands) { const q = burpeeSquat(C, L, { heel: C.lerp(52, 56, (t - T.hands) / (T.shift - T.hands)) }); plankHands(C, q, hx, BURPEE.turn, BURPEE.handZ); return q; }
  /* 1) верхняя точка прыжка → приземление на носки → присед; руки опускаются перед телом к коврику */
  const sq = burpeeSquat(C, L, { heel: 52 });
  const gS = C.fk(sq).P.ghL, wS = [hx + 1, MAT + 1.8, BURPEE.handZ - 5.6], aS = Math.atan2(wS[2] - gS[2], gS[1] - wS[1]) / D2R, rS = V.dist(gS, wS);
  let q;
  if (t <= T.land) { const u = t / T.land, sn = Math.cos(Math.PI / 2 * u); q = burpeeStand(C, L, { lift: 8 * sn, knee: C.lerp(4, 14, u), lean: 2, heel: 28 * (1 - sn), pitch: 28 * sn }); }
  else {
    const u = (t - T.land) / (T.hands - T.land), w = trap(u, .2), land = burpeeStand(C, L, { knee: 14, lean: 2, heel: 28 });
    const heel = u < .5 ? C.lerp(28, 6, smooth(u * 2)) : C.lerp(6, 52, smooth(u * 2 - 1));
    q = blendBody(C, land, sq, w);
    /* пятки поднимаются, когда колени уходят вперёд: тыльное сгибание стопы не больше 18° */
    for (const s of S) {
      const lat = C.latP(q, s), ball = [sgn(s) * L.ball[0], MAT, L.ball[2]], pole = V.unit(V.add([0, .2, 1], lat, C.lerp(.15, .25, w)));
      const put = h => { place(C, q, s, ball, { yaw: 10, heel: h }, pole); return q[s].ankle[0] - 18; };
      if (put(heel) > 0) put(C.solve1D(put, heel, 75));
    }
  }
  /* кисти подходят к коврику сверху и разворачиваются ладонями вниз */
  const v = t / T.hands, W = C.lerp(156, aS, trap(v, .2)), reach = C.lerp(54, rS, smooth(v)), hand = smooth((v - .6) / .4);
  const o = { lift: 14 * (1 - smooth((v - .76) / .24)), pron: 75 * hand, ext: -62 * hand };
  for (const s of S) { armWorld(C, q, s, W, reach, o); C.rhythm(q, s); armWorld(C, q, s, W, reach, o); }
  return q;
}

/* ---------- Вертикальный велотренажёр ---------- */
const BIKE = { bbY: 30, rc: 17.5, footX: 13.6, pelvis: 18, lumbar: 12, thoracic: 12, hipZ: -17, kneeBottom: 31, barX: 22 };
/* педаль: угол шатуна phi (0 — вверху, 90° — впереди); наклон стопы носком вниз 16…34°: в рабочей фазе пятка опущена */
function bikePedal(s, phi) {
  const a = (25 + 4 * Math.cos(phi) - 9 * Math.sin(phi)) * D2R, P = [sgn(s) * BIKE.footX, BIKE.bbY + BIKE.rc * Math.cos(phi), BIKE.rc * Math.sin(phi)];
  const up = [0, Math.cos(a), Math.sin(a)], fwd = [0, -Math.sin(a), Math.cos(a)];
  return { support: [P[0], P[1] + 1.2 * up[1], P[2] + 1.2 * up[2]], o: { up, forward: fwd } };
}
function bikeBody(C, y) {
  const q = C.base(), a = BIKE.pelvis * D2R;
  C.root(q, [0, y, BIKE.hipZ], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [BIKE.lumbar, 0, 0]; q.thoracic = [BIKE.thoracic, 0, 0]; q.neck = [-(BIKE.pelvis + BIKE.lumbar + BIKE.thoracic) * .55, 0, 0];
  for (const s of S) q[s].girdle = [2, 8];
  return q;
}
const bikeLayout = once(() => {
  const C = ctx([]), { V, M } = C, bot = bikePedal('L', Math.PI);
  const an = M.footFrame(bot.support, 0, bot.o).o;
  const y = C.solve1D(y => V.dist(C.fk(bikeBody(C, y)).P.hipL, an) - legSpan(M, BIKE.kneeBottom), 80, 130);
  const q = bikeBody(C, y);
  const gh = C.fk(q).P.ghL;
  /* седло на 10 см ниже центров тазобедренных суставов (мягкие ткани и обивка), широкая часть — под седалищными
     буграми позади суставов, узкий нос — между бёдрами */
  return { y, saddle: [y - 10, BIKE.hipZ - 14], bar: [BIKE.barX, gh[1] - 33, gh[2] + 50] };
});

/* ---------- Беговая дорожка: лёгкий бег ---------- */
const RUN = { belt: 20, hipZ: -24, footX: 8.6, stance: .35, zTD: 24, zTO: -30, kneeMid: 42, bob: 3, lean: 6 };
/* опора стопы на ленте: p — доля опорной фазы 0…1; подушечка уезжает назад со скоростью ленты */
function runStanceFoot(s, p) {
  const z = RUN.hipZ + C_lerp(RUN.zTD, RUN.zTO, p), heel = p < .15 ? 6 * (1 - p / .15) : p < .5 ? 0 : 50 * smooth((p - .5) / .5);
  return { ball: [sgn(s) * RUN.footX, RUN.belt, z], o: { heel } };
}
const C_lerp = (a, b, t) => a + (b - a) * t;
function runBody(C, t, y) {
  const q = C.base(), a = RUN.lean * D2R, yaw = -4 * Math.cos(TAU * t) * D2R;
  const up = [Math.sin(a) * Math.sin(yaw), Math.cos(a), Math.sin(a) * Math.cos(yaw)], fwd = [-Math.sin(a) * 0 + Math.sin(yaw) * Math.cos(a), -Math.sin(a), Math.cos(yaw) * Math.cos(a)];
  C.root(q, [0, y + RUN.bob * Math.cos(2 * TAU * (t - .425)), RUN.hipZ], up, fwd);
  q.thoracic = [2, 0, 4 * Math.cos(TAU * t) * 1.6]; q.lumbar = [0, 0, 0]; q.neck = [-RUN.lean - 2, 0, -2 * Math.cos(TAU * t)];
  return q;
}
const runLayout = once(() => {
  const C = ctx([]), { V, M } = C, mid = runStanceFoot('L', .4), an = M.footFrame(mid.ball, 0, footOpts('L', { heel: 8 })).o;
  /* средняя высота таза: в середине опоры колено согнуто на ≈40° */
  const y = C.solve1D(y => V.dist(C.fk(runBody(C, (.4 * RUN.stance), y)).P.hipL, an) - legSpan(M, RUN.kneeMid), 90, 125);
  return { y };
});
/* маховая нога: голеностоп идёт по кривой от отрыва носка к постановке «под себя» */
function runSwing(C, q, s, u, A0, A1, d0, d1) {
  const { V } = C, H = RUN.hipZ, g = sgn(s), x = g * RUN.footX + g * .4;
  const pts = [A0, [x, RUN.belt + 36, H - 40], [x, RUN.belt + 44, H - 20], [x, RUN.belt + 34, H + 4], [x, RUN.belt + 17, H + 6], A1];
  const n = pts.length - 1, f = Math.min(n - 1e-9, u * n), i = Math.floor(f), w = f - i;
  const P = k => pts[Math.max(0, Math.min(n, k))];
  const cr = (p0, p1, p2, p3) => [0, 1, 2].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * w + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * w * w + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * w * w * w));
  const ankle = cr(P(i - 1), P(i), P(i + 1), P(i + 2));
  const dorsi = u < .3 ? C.lerp(d0, -12, u / .3) : u < .75 ? C.lerp(-12, 4, (u - .3) / .45) : C.lerp(4, d1, (u - .75) / .25);
  C.legTo(q, s, ankle, V.unit([g * .12, .1, 1]), { dorsi });
}
function runPose(C, t) {
  const { V } = C, L = runLayout(), q = runBody(C, t, L.y), st = RUN.stance;
  /* опорные точки отрыва и постановки (для начала и конца маха) */
  const edge = (s, p) => { const f = runStanceFoot(s, p); return C.M.footFrame(f.ball, 0, footOpts(s, f.o)).o; };
  for (const s of S) {
    const p = (((t + (s === 'R' ? .5 : 0)) % 1) + 1) % 1, lat = C.latP(q, s), pole = V.unit(V.add([0, .1, 1], lat, .12));
    if (p <= st) {
      /* пятка отрывается, когда голень наклоняется вперёд (тыльное сгибание стопы не больше 18°) */
      const f = runStanceFoot(s, p / st), put = h => { place(C, q, s, f.ball, { heel: h }, pole); return q[s].ankle[0] - 18; };
      if (put(f.o.heel) > 0) put(C.solve1D(put, f.o.heel, 70));
    }
    else {
      /* углы стопы на краях маха берём из опорной позы этого же кадра */
      const tmp = C.M.clone(q), f0 = runStanceFoot(s, 1), f1 = runStanceFoot(s, 0);
      place(C, tmp, s, f0.ball, f0.o, pole, true); const d0 = tmp[s].ankle[0];
      place(C, tmp, s, f1.ball, f1.o, pole, true); const d1 = tmp[s].ankle[0];
      const u = (p - st) / (1 - st);
      runSwing(C, q, s, u, edge(s, 1), edge(s, 0), d0, d1);
      q[s].mtp = 50 * (1 - smooth(u / .25)); /* пальцы разгибаются обратно после отрыва */
    }
  }
  /* руки: локти ≈90°, мах вдоль тела в противофазе ногам, кисти в свободном кулаке */
  for (const s of S) {
    const ph = TAU * (t + (s === 'R' ? .5 : 0)), F = 12 - 34 * Math.cos(ph);
    q[s].shoulder = [F, 13, -14]; q[s].elbow = 92 + 8 * Math.sin(ph); q[s].pron = 15; q[s].wrist = [8, 0]; q[s].girdle = [0, 4 * Math.cos(ph + Math.PI)];
  }
  q.hands = { L: 'fist', R: 'fist' };
  return q;
}

/* ---------- Гребной тренажёр ---------- */
const ROW = { seatTop: 36, railTop: 27, hipUp: 10, beta: 42, footX: 11, plateY: 18, kneeFin: 8, kneeCatch: 100, heelCatch: 22, leanCatch: 24, leanFin: -14, gripX: 20, armDrop: 28, shift: -13 };
/* тело сидя на подвижном сиденье: z — положение таза, lean — наклон корпуса (вперёд +), вращение идёт в тазу */
function rowBody(C, z, lean) {
  const q = C.base(), P = (lean * .38) * D2R;
  C.root(q, [0, ROW.seatTop + ROW.hipUp, z], [0, Math.cos(P), Math.sin(P)], [0, -Math.sin(P), Math.cos(P)]);
  q.lumbar = [lean * .34 + 2, 0, 0]; q.thoracic = [lean * .28 + 3, 0, 0]; q.neck = [-lean * .9 - 4, 0, 0];
  /* таз на сиденье: нижняя точка ягодиц (корпус, без бёдер) на 1 см ниже верха сиденья — мягкие ткани и подушка */
  let lo = Infinity; for (let h = C.M.TORSO[0][0]; h <= 4; h += 1) for (let a = .6; a <= 1.001; a += .05) lo = Math.min(lo, C.chestPoint(q, h, a * Math.PI)[1]);
  q.root.p[1] += ROW.seatTop - 1 - lo;
  return q;
}
const rowLayout = once(() => {
  const C = ctx([]), { V, M } = C, b = ROW.beta * D2R, n = [0, Math.cos(b), -Math.sin(b)], f = [0, Math.sin(b), Math.cos(b)];
  const opts = heel => ({ up: n, forward: f, heel }), ball = z => [ROW.footX, ROW.plateY, z];
  /* упоры: в конце гребка (таз в z = 0) нога почти прямая */
  const hip0 = C.fk(rowBody(C, 0, ROW.leanFin)).P.hipL;
  const zP = C.solve1D(z => V.dist(M.footFrame(ball(z), 0, opts(0)).o, hip0) - legSpan(M, ROW.kneeFin), 40, 120);
  /* захват: голень почти вертикальна, пятка слегка оторвана */
  const anC = M.footFrame(ball(zP), 0, opts(ROW.heelCatch)).o;
  const zC = C.solve1D(z => legSpan(M, ROW.kneeCatch) - V.dist(C.fk(rowBody(C, z, ROW.leanCatch)).P.hipL, anC), 0, zP);
  /* выход цепи — на высоте рукояти в захвате, впереди упоров */
  const qc = rowBody(C, zC, ROW.leanCatch), gh = C.fk(qc).P.ghL;
  return { zP, zC, n, f, opts, exit: [0, gh[1] - ROW.armDrop - 4, zP + 32] };
});
function rowPose(C, t) {
  const { V } = C, L = rowLayout();
  /* гребок: ноги (0…0,55) → корпус (0,3…0,75) → руки (0,55…1) */
  const legs = smooth(t / .58), body = smooth((t - .28) / .47), arms = smooth((t - .55) / .45);
  const z = C.lerp(L.zC, 0, legs), lean = C.lerp(ROW.leanCatch, ROW.leanFin, body), q = rowBody(C, z, lean);
  const heel = ROW.heelCatch * (1 - smooth(t / .35));
  for (const s of S) { const lat = C.latP(q, s); place(C, q, s, [sgn(s) * ROW.footX, ROW.plateY, L.zP], { up: L.n, heel }, V.unit(V.add([0, .55, 1], lat, .12))); }
  for (const s of S) q[s].girdle = [C.lerp(4, -2, arms), C.lerp(14, -14, arms)];
  /* рукоять: на прямых руках — по линии цепи впереди плеч, в конце — у низа рёбер */
  const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), T = C.axes(q);
  const straight = V.add(gh, V.unit([0, -ROW.armDrop, 55]), 61.5);
  const ribs = V.add(V.add(C.chestPoint(q, 20), T.z, 3.5), T.y, -1);
  const H = V.mix(straight, [0, ribs[1], ribs[2]], arms);
  for (const s of S) {
    const lat = C.lat(q, s), pole = V.unit(V.mix(V.add([0, -1, -.25], lat, .5), V.add([0, -.45, -1], lat, .22), arms));
    C.grip(q, s, V.add(H, [sgn(s), 0, 0], ROW.gripX), [-sgn(s), 0, 0], pole, { wristExt: 0 });
  }
  return q;
}

/* ---------- Эллиптический тренажёр ---------- */
const ELL = { axle: [42, 40], rc: 21, rollerY: 12, barLen: 128, frac: .3, standoff: 9, delta: 20, barX: 12, armX: 8.5, pivot: [19, 95, 0], lever: 60, upper: 30, grip: 12, bend: 52, linkAt: 30, lean: 4, kneeLow: 12 };
/* шатун phi (0 — палец вверху, 90° — впереди) → палец, ролик, точка тяги, рамка педали и опора под подушечкой */
function ellFoot(s, phi) {
  const g = sgn(s), A = [0, ELL.axle[0], ELL.axle[1]], cp = [g * ELL.barX, A[1] + ELL.rc * Math.cos(phi), A[2] + ELL.rc * Math.sin(phi)];
  const dy = cp[1] - ELL.rollerY, rr = [cp[0], ELL.rollerY, cp[2] - Math.sqrt(ELL.barLen ** 2 - dy * dy)];
  const ub = [0, (cp[1] - rr[1]) / ELL.barLen, (cp[2] - rr[2]) / ELL.barLen], nb = [0, ub[2], -ub[1]], dl = ELL.delta * D2R;
  const up = [0, nb[1] * Math.cos(dl) + ub[1] * Math.sin(dl), nb[2] * Math.cos(dl) + ub[2] * Math.sin(dl)];
  const fw = [0, ub[1] * Math.cos(dl) - nb[1] * Math.sin(dl), ub[2] * Math.cos(dl) - nb[2] * Math.sin(dl)];
  const pb = [cp[0], rr[1] + ELL.frac * (cp[1] - rr[1]), rr[2] + ELL.frac * (cp[2] - rr[2])];
  const pc = [pb[0], pb[1] + nb[1] * ELL.standoff, pb[2] + nb[2] * ELL.standoff];
  const sole = [pc[0], pc[1] + up[1] * 1.3, pc[2] + up[2] * 1.3], ball = [sole[0], sole[1] + fw[1] * 10, sole[2] + fw[2] * 10];
  /* тяга рукояти крепится к тяге педали в linkAt см позади пальца шатуна */
  return { cp, rr, ball, o: { up, forward: fw }, link: [g * (ELL.barX + 2.3), cp[1] - ub[1] * ELL.linkAt, cp[2] - ub[2] * ELL.linkAt] };
}
/* рукоять: качается на оси H; нижний рычаг (lever) связан тягой с тягой педали (шарнирный четырёхзвенник,
   Lk — длина тяги в плоскости движения) */
function ellHandle(s, phi, Lk) {
  const g = sgn(s), H = [g * ELL.pivot[0], ELL.pivot[1], ELL.pivot[2]], c = ellFoot(s, phi).link;
  const dx = H[0] - c[0], k = Math.sqrt(Lk * Lk - dx * dx), d = Math.hypot(c[1] - H[1], c[2] - H[2]);
  const a = (ELL.lever ** 2 - k * k + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ELL.lever ** 2 - a * a));
  const ey = (c[1] - H[1]) / d, ez = (c[2] - H[2]) / d, my = H[1] + a * ey, mz = H[2] + a * ez;
  /* из двух решений — рычаг впереди линии ось — палец */
  const E = [H[0], my - h * ez, mz + h * ey], E2 = [H[0], my + h * ez, mz - h * ey], Ee = E[2] > E2[2] ? E : E2;
  /* рукоять: от оси вверх-назад (upper), затем почти вертикальная ручка, повёрнутая на bend относительно рычага */
  const n = Math.hypot(H[1] - Ee[1], H[2] - Ee[2]), u = [0, (H[1] - Ee[1]) / n, (H[2] - Ee[2]) / n], b = ELL.bend * D2R;
  const w = [0, u[1] * Math.cos(b) - u[2] * Math.sin(b), u[2] * Math.cos(b) + u[1] * Math.sin(b)];
  const K = [H[0], H[1] + u[1] * ELL.upper, H[2] + u[2] * ELL.upper];
  return { G: [H[0], K[1] + w[1] * ELL.grip, K[2] + w[2] * ELL.grip], axis: w, H, E: Ee };
}
function ellBody(C, y, z) {
  const q = C.base(), a = ELL.lean * D2R;
  C.root(q, [0, y, z], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.neck = [-4, 0, 0];
  return q;
}
const ellLayout = once(() => {
  const C = ctx([]), { V, M } = C, phis = Array.from({ length: 24 }, (_, i) => i / 24 * TAU);
  /* длина тяги рукояти: рычаг в среднем положении направлен вниз-вперёд под 25° */
  const H = [ELL.pivot[0], ELL.pivot[1], ELL.pivot[2]], a40 = 25 * D2R, Em = [H[1] - ELL.lever * Math.cos(a40), H[2] + ELL.lever * Math.sin(a40)];
  const Lk = phis.reduce((s, p) => { const c = ellFoot('L', p).link; return s + Math.hypot(c[1] - Em[0], c[2] - Em[1]); }, 0) / phis.length + 2;
  const feet = phis.map(p => ellFoot('L', p)), zc = feet.reduce((s, f) => s + f.ball[2], 0) / feet.length - 11;
  /* высота таза: самая выпрямленная за цикл нога согнута в колене на kneeLow */
  const y = Math.min(...feet.map(f => { const an = M.footFrame(f.ball, 0, f.o).o; return C.solve1D(y => V.dist(C.fk(ellBody(C, y, zc)).P.hipL, an) - legSpan(M, ELL.kneeLow), 90, 150); }));
  const tz = feet.map(f => f.rr[2]);
  return { Lk, y, z: zc, track: [Math.min(...tz) - 12, Math.max(...tz) + 10] };
});

/* ---------- Степпер ---------- */
const STEP = { pivot: [11.5, 16, 34], lever: 58, mid: 24, amp: 9, footX: 11.5, lean: 12, kneeLow: 8, railX: 29, back: 18, thumb: [0, .36] };
/* педаль на высоте h (центр площадки): конец рычага на окружности вокруг оси, площадка горизонтальна */
function stepPedal(s, h) {
  const pv = STEP.pivot, ly = h - 6, lz = pv[2] - Math.sqrt(STEP.lever ** 2 - (ly - pv[1]) ** 2), pc = [sgn(s) * STEP.footX, h, lz - 21];
  return { pc, ball: [pc[0], h + 1.4, pc[2] + 9] };
}
function stepBody(C, y, z) {
  const q = C.base(), a = STEP.lean * D2R;
  C.root(q, [0, y, z], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.thoracic = [3, 0, 0]; q.neck = [-10, 0, 0];
  return q;
}
const stepLayout = once(() => {
  const C = ctx([]), { V, M } = C, low = stepPedal('L', STEP.mid - STEP.amp), an = M.footFrame(low.ball, 0, {}).o, z = an[2] - STEP.back;
  const y = C.solve1D(y => V.dist(C.fk(stepBody(C, y, z)).P.hipL, an) - legSpan(M, STEP.kneeLow), 90, 140);
  const hip = C.fk(stepBody(C, y, z)).P.hipL;
  return { y, z, railY: Math.round(hip[1] - 6), railZ: z - 28, gripZ: z + 16 };
});

module.exports = {
  /* Прыжки «ноги врозь». Замкнутый цикл: t=0 — ноги вместе, руки внизу (опора), t=0,5 — ноги врозь,
     руки над головой (опора); между ними — фазы полёта. Приземление мягко на носки, колени пружинят. */
  jumpingjack: {
    keys: keysN(16), loop: true, dynamic: true,
    equipment: [{ type: 'mat', id: 'mat', len: 120, width: 100, at: [0, 0, 6] }],
    contacts: [
      ...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [0, .125] })),
      ...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [.375, .625] })),
      ...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [.875, 1] }))
    ],
    pose(t, C) {
      const { V, M } = C, q = C.base(), mat = 1;
      /* фаза: опора (вместе / врозь) или полёт */
      let g, spread, tau;
      if (t <= .125) { g = true; spread = 0; tau = (t + .125) / .25; }
      else if (t >= .875) { g = true; spread = 0; tau = (t - .875) / .25; }
      else if (t >= .375 && t <= .625) { g = true; spread = 1; tau = (t - .375) / .25; }
      else if (t < .375) { g = false; tau = (t - .125) / .25; spread = smooth(tau); }
      else { g = false; tau = (t - .625) / .25; spread = 1 - smooth(tau); }
      const sn = Math.sin(Math.PI * tau);
      const kMid = C.lerp(30, 26, spread), kEdge = 12, hEdge = 22, hMid = 7;
      const knee = g ? kEdge + (kMid - kEdge) * sn : kEdge - 6 * sn;
      const lift = g ? 0 : 8 * sn, heel = g ? hEdge - (hEdge - hMid) * sn : hEdge * (1 - sn), pitch = g ? 0 : hEdge * sn;
      const fo = { yaw: C.lerp(7, 16, spread), pitch, heel };
      const ball = s => [sgn(s) * C.lerp(10.5, 31, spread), mat + lift, 11];
      const lean = 3 * D2R;
      C.root(q, [0, 90, 0], [0, Math.cos(lean), Math.sin(lean)], [0, -Math.sin(lean), Math.cos(lean)]);
      q.root.p[1] = hipYFor(C, 'L', ball('L'), fo, knee);
      q.neck = [-3, 0, 0];
      for (const s of S) { const lat = C.latP(q, s); place(C, q, s, ball(s), fo, V.unit(V.add([sgn(s) * Math.sin(fo.yaw * D2R), .1, Math.cos(fo.yaw * D2R)], lat, .1))); }
      /* руки через стороны вверх: отведение во фронтальной плоскости, локти чуть согнуты */
      const a = (91 - 83 * Math.cos(TAU * t)) * D2R;
      for (let it = 0; it < 2; it++) for (const s of S) {
        const f = C.fk(q), gh = f.P['gh' + s], lat = C.lat(q, s), T = C.axes(q);
        const dir = V.unit(V.add(V.add(V.scale(T.y, -Math.cos(a)), lat, Math.sin(a)), T.z, .12));
        const pole = V.unit(V.add(V.scale(T.z, -1), T.y, -.35 * Math.cos(a)));
        C.armTo(q, s, V.add(gh, dir, 54.7), V.unit(V.add(pole, lat, .2)), { pron: C.lerp(0, -40, (1 - Math.cos(a)) / 2), wrist: [0, 0], mode: 'flat' });
        C.rhythm(q, s);
      }
      return q;
    }
  },

  /* Приседания с выпрыгиванием. Замкнутый цикл: t=0 — присед (бедро выше параллели), руки отведены назад;
     0…0,32 — толчок с махом рук вперёд-вверх, отрыв с носков; 0,32…0,56 — полёт; 0,56 — мягкое приземление
     на носки, перекат на всю стопу и уход в присед с отведением рук назад. */
  jumpsquat: {
    keys: keysN(16), loop: true, dynamic: true,
    equipment: [{ type: 'mat', id: 'mat', len: 120, width: 80, at: [0, 0, 4] }],
    contacts: [...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [0, .375] })), ...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [.625, 1] }))],
    pose(t, C) {
      const { V } = C, mat = 1, T0 = .375, T1 = .625, fl = t > T0 && t < T1, u = (t - T0) / (T1 - T0);
      const knee = loopSpline([[0, 78], [.1, 71], [.2, 56], [.3, 33], [.375, 9], [.44, 5], [.5, 6], [.56, 8], [.625, 15], [.7, 32], [.78, 50], [.86, 65], [.92, 73], [.96, 77]])(t);
      const lean = loopSpline([[0, 52], [.1, 49], [.2, 41], [.3, 25], [.375, 8], [.5, 3], [.625, 10], [.7, 21], [.78, 33], [.86, 43], [.92, 49], [.96, 51]])(t);
      /* мах рук: угол руки в мире от вертикали вниз (вперёд +), наибольший — в полёте */
      const tw = t > .95 ? t - 1 : t, W = tw <= .37 ? 25 - 57 * Math.cos(Math.PI * (tw + .05) / .42) : 25 + 57 * Math.cos(Math.PI * (tw - .37) / .58), arm = W + lean + 5, out = 9 + 6 * clamp01((15 - W) / 25);
      /* стопа: на опоре — подъём пятки, в полёте — носки вытянуты */
      let heel, pitch = 0, lift = 0;
      if (fl) { const tip = C.lerp(44, 30, u), sn = Math.sin(Math.PI * u); heel = tip * (1 - sn); pitch = tip * sn; lift = 15 * sn; }
      else heel = t <= T0 ? 44 * smooth((t - .18) / (T0 - .18)) : 30 * (1 - smooth((t - T1) / .1));
      const fo = { yaw: 12, pitch, heel }, ball = s => [sgn(s) * 15.5, mat + lift, 12];
      /* центр масс над серединой стопы (на носках — над подушечками), в полёте — по вертикали над точкой отрыва */
      const comZ = fl ? 10 : 1.5 + 8.5 * Math.min(1, (heel + pitch) / 30);
      const build = (z, strict = false) => {
        const q = C.base(), a = lean * D2R;
        C.root(q, [0, 90, z], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
        q.root.p[1] = hipYFor(C, 'L', ball('L'), fo, knee, [0, z], 0);
        q.lumbar = [-2, 0, 0]; q.thoracic = [5, 0, 0]; q.neck = [-lean * .55, 0, 0];
        for (const s of S) { const lat = C.latP(q, s), y = 12 * D2R; place(C, q, s, ball(s), fo, V.unit(V.add([sgn(s) * Math.sin(y), 0, Math.cos(y)], lat, .12)), !strict); }
        for (const s of S) { swingArm(C, q, s, arm, { reach: 51.5, out }); C.rhythm(q, s); swingArm(C, q, s, arm, { reach: 51.5, out }); }
        return q;
      };
      /* таз по горизонтали — так, чтобы центр масс был над серединой стопы */
      const z = C.solve1D(z => C.com(build(z))[2] - comZ, -45, 20, 30);
      return build(z, true);
    }
  },

  /* Скалолаз. Упор лёжа на прямых руках, ладони под плечами, тело прямое. Замкнутый цикл: t=0 — левое колено
     подтянуто к груди, правая нога выпрямлена с упором на носок; t=0,5 — наоборот. Ноги работают как в беге:
     пока одна подтягивается и возвращается, другая стоит на носке. */
  mountain: {
    keys: keysN(16), loop: true, dynamic: true,
    equipment: [{ type: 'mat', id: 'mat', len: 190, width: 70, at: [0, 0, -62] }],
    contacts: [...S.map(s => ({ body: 'palm' + s, prop: 'mat' })),
      { body: 'soleL', prop: 'mat', when: [.25, .75] }, { body: 'soleR', prop: 'mat', when: [0, .25] }, { body: 'soleR', prop: 'mat', when: [.75, 1] }],
    pose(t, C) { return plankPose(C, t, plankLayout(C)); }
  },

  /* Бёрпи. Проигрывается туда-обратно (без loop), так что полный цикл идёт в правильном порядке:
     t=0 — верхняя точка выпрыгивания (руки над головой) → 0,1 — приземление на носки → 0,45 — присед,
     ладони на коврике → 0,5…0,8 — прыжком ноги назад → 0,8…1 — упор лёжа. Обратный ход: прыжком стопы к рукам,
     присед, подъём с махом рук и выпрыгивание. */
  burpee: {
    keys: keysN(25), dynamic: true,
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 80, at: [0, 0, -72] }],
    contacts: [...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [.08, .64] })), ...S.map(s => ({ body: 'sole' + s, prop: 'mat', when: [.93, 1] })),
      ...S.map(s => ({ body: 'palm' + s, prop: 'mat', when: [.62, 1] }))],
    pose(t, C) { return burpeePose(C, t); }
  },

  /* Вертикальный велотренажёр. Замкнутый цикл: t — полный оборот педалей (t=0 — левая педаль вверху).
     Седло выставлено так, что в нижней точке колено согнуто на ≈30°; корпус наклонён к рулю,
     руки на руле без упора, стопы на педалях подушечками. */
  bike: {
    keys: keysN(16), loop: true,
    equipment: (() => { const L = bikeLayout(); return [{ type: 'uprightBike', id: 'bike', bbY: BIKE.bbY, saddle: L.saddle, bar: L.bar },
      { type: 'bikeCrank', id: 'crank', axle: [0, BIKE.bbY, 0], armX: 8.2, mountTo: 'bike:axle' }]; })(),
    contacts: [{ body: 'buttocks', prop: 'bike:saddle' }, { body: 'soleL', prop: 'crank:pedalL' }, { body: 'soleR', prop: 'crank:pedalR' },
      { body: 'gripL', prop: 'bike:bar' }, { body: 'gripR', prop: 'bike:bar' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, L = bikeLayout(), q = bikeBody(C, L.y);
      for (const s of S) {
        const ped = bikePedal(s, TAU * t + (s === 'R' ? Math.PI : 0)), lat = C.latP(q, s);
        C.foot(q, s, ped.support, 0, V.unit(V.add([0, .25, 1], lat, .18)), ped.o);
      }
      for (const s of S) {
        const g = sgn(s), lat = C.lat(q, s);
        C.grip(q, s, [g * L.bar[0], L.bar[1], L.bar[2]], [-g, 0, 0], V.unit(V.add([0, -.55, -.5], lat, .7)), { wristExt: 6 });
      }
      return q;
    }
  },

  /* Беговая дорожка: лёгкий бег. Замкнутый цикл из двух шагов: t=0 — постановка левой стопы «под себя»
     на середину стопы; опора 35% цикла (стопа уезжает назад вместе с лентой, затем отрыв с носка), далее мах;
     правая нога — в противофазе. Корпус почти вертикален, руки работают вдоль тела. */
  treadmill: {
    keys: keysN(20), loop: true,
    equipment: [{ type: 'treadmill', id: 'tm', deckH: RUN.belt }],
    contacts: [{ body: 'soleL', prop: 'tm:belt', when: [0, RUN.stance] }, { body: 'soleR', prop: 'tm:belt', when: [.5, .5 + RUN.stance] }],
    pose(t, C) { return runPose(C, t); }
  },

  /* Гребной тренажёр. Проигрывается туда-обратно: 0→1 — гребок (захват: колени у груди, голени почти вертикальны,
     руки прямые → толчок ногами → отклонение корпуса на ≈14° назад → тяга рукояти к низу рёбер),
     1→0 — возврат в обратном порядке: руки, корпус, ноги. */
  rower: {
    keys: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
    equipment: (() => { const L = rowLayout(); return [
      { type: 'rowerErg', id: 'row', railTop: ROW.railTop, plate: [ROW.footX, ROW.plateY, L.zP], beta: ROW.beta, exit: L.exit, railRear: -70 },
      { type: 'rowerSeat', id: 'seat', top: ROW.seatTop, railTop: ROW.railTop, shift: ROW.shift, mountTo: 'row:rail' },
      { type: 'rowerChain', id: 'chain', exit: L.exit, mountTo: 'row:chainGuide' }]; })(),
    contacts: [{ body: 'buttocks', prop: 'seat' }, { body: 'soleL', prop: 'row:plateL' }, { body: 'soleR', prop: 'row:plateR' },
      { body: 'gripL', prop: 'chain' }, { body: 'gripR', prop: 'chain' }],
    gripRadius: { L: 1.8, R: 1.8 },
    pose(t, C) { return rowPose(C, t); }
  },

  /* Эллиптический тренажёр. Замкнутый цикл: t — полный оборот шатунов (t=0 — левый палец вверху).
     Стопы целиком на педалях всё время, педали идут по эллипсу (вперёд вверху, назад внизу); рукояти связаны с
     шатунами: левая нога впереди — левая рука сзади. Корпус почти вертикален, вес на ногах, руки толкают и тянут. */
  elliptical: {
    keys: keysN(16), loop: true,
    equipment: (() => { const L = ellLayout(); return [
      { type: 'elliptical', id: 'ell', axle: ELL.axle, pivot: ELL.pivot, trackY: ELL.rollerY - 4, trackZ: L.track, barX: ELL.barX },
      { type: 'ellipticalLinks', id: 'link', axle: ELL.axle, barLen: ELL.barLen, frac: ELL.frac, standoff: ELL.standoff, delta: ELL.delta, armX: ELL.armX,
        pivot: ELL.pivot, lever: ELL.lever, upper: ELL.upper, grip: ELL.grip, bend: ELL.bend, linkAt: ELL.linkAt, mountTo: 'ell:axle', mountHub: 'ell:hub' }]; })(),
    contacts: [{ body: 'soleL', prop: 'link:pedalL' }, { body: 'soleR', prop: 'link:pedalR' }, { body: 'gripL', prop: 'link:handleL' }, { body: 'gripR', prop: 'link:handleR' }],
    gripRadius: { L: 1.9, R: 1.9 },
    pose(t, C) {
      const { V } = C, L = ellLayout(), q = ellBody(C, L.y, L.z);
      for (const s of S) {
        /* стопа на педали; в заднем положении пятка чуть отрывается (тыльное сгибание стопы не больше 18°) */
        const f = ellFoot(s, TAU * t + (s === 'R' ? Math.PI : 0)), lat = C.latP(q, s), pole = V.unit(V.add([0, .1, 1], lat, .1));
        const put = h => { C.foot(q, s, f.ball, 0, pole, { ...f.o, heel: h }); return q[s].ankle[0] - 18; };
        if (put(0) > 0) put(C.solve1D(put, 0, 40));
      }
      for (const s of S) {
        const h = ellHandle(s, TAU * t + (s === 'R' ? Math.PI : 0), L.Lk), lat = C.lat(q, s);
        /* кисть держит ручку, слегка поворачиваясь на ней (не более ≈12°): ось хвата — между ручкой и вертикалью */
        C.grip(q, s, h.G, V.unit(V.add(h.axis, [0, 1, .35])), V.unit(V.add([0, -1, -.6], lat, .6)));
      }
      return q;
    }
  },

  /* Степпер (лестница): две педали на рычагах. Замкнутый цикл: t=0 — левая стопа вверху, ставится всей стопой
     и продавливает педаль вниз через пятку (до t=0,5), правая поднимается; затем наоборот. Корпус слегка наклонён
     вперёд, кисти лежат на поручнях только для равновесия. */
  stairs: {
    keys: keysN(16), loop: true,
    equipment: (() => { const L = stepLayout(); return [
      { type: 'stepper', id: 'stp', pivot: STEP.pivot, railY: L.railY, railX: STEP.railX, railZ: L.railZ },
      { type: 'stepPedals', id: 'step', pivot: STEP.pivot, dampZ: L.railZ + 10, mountTo: 'stp:pivotAxle', mountDamp: 'stp:dampBase' }]; })(),
    contacts: [{ body: 'soleL', prop: 'step:pedalL' }, { body: 'soleR', prop: 'step:pedalR' }, { body: 'gripL', prop: 'stp:railL' }, { body: 'gripR', prop: 'stp:railR' }],
    gripRadius: { L: 2, R: 2 },
    pose(t, C) {
      const { V } = C, L = stepLayout(), q = stepBody(C, L.y, L.z);
      for (const s of S) {
        /* вся стопа на педали; на верхней педали пятка может едва отрываться (тыльное сгибание не больше 19°) */
        const h = STEP.mid + STEP.amp * Math.cos(TAU * t + (s === 'R' ? Math.PI : 0)), f = stepPedal(s, h), lat = C.latP(q, s), pole = V.unit(V.add([0, .1, 1], lat, .12));
        const put = hl => { place(C, q, s, f.ball, { yaw: 4, heel: hl }, pole); return q[s].ankle[0] - 19; };
        if (put(0) > 0) put(C.solve1D(put, 0, 30));
      }
      for (const s of S) {
        const g = sgn(s), lat = C.lat(q, s);
        C.grip(q, s, [g * STEP.railX, L.railY, L.gripZ], V.unit([g * STEP.thumb[0], STEP.thumb[1], 1]), V.unit(V.add([0, -.7, -.5], lat, .6)));
      }
      return q;
    }
  }
};
