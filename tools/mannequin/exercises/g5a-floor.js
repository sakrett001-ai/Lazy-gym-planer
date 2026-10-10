'use strict';
/* Группа G5a: упражнения с весом тела на коврике.
   Ось Z — вдоль коврика (голова к +Z), X — поперёк, Y — вверх, см. Поверхность коврика — Y = 1.
   Поза строится так: линия тела (таз, корпус) → опоры на коврике (стопы, колени, предплечья, ладони) → свободные конечности.
   Ограничения валидатора, определившие раскладку: разгибание запястья ≤ 75° (у ладони на полу предплечье наклонено
   назад — ладони стоят на уровне плеч или чуть впереди), пронация ≤ 85°, подошвенное сгибание ≤ 50° (на коленях
   голень чуть приподнята, носок оттянут; в отжиманиях с колен стопы в воздухе), разгибание пальцев стопы ≤ 80°. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const MAT = 1;                       /* высота поверхности коврика */
const once = f => { let v; return () => v ?? (v = f()); };

/* ---------- общие помощники ---------- */
/* Запястье для ладони на опоре (та же рамка, что в C.palm): нужно, чтобы подобрать позу корпуса под заданную досягаемость */
function palmWrist(C, s, point, fingers, up) {
  const { V, M } = C, M3 = M.M3, g = M.SIGN[s], y = V.scale(V.unit(V.perp(fingers, up)), -1), x = V.scale(V.unit(up), g), z = V.cross(x, y);
  const Rh = M3.cols(x, y, z), centre = [-g * (M.B.palm.thick / 2 + .3), -5.6, 0];
  return V.sub(point, M3.v(Rh, centre));
}
/* Длина руки от плечевого сустава до запястья при сгибании локтя el, град */
const armSpan = (C, el) => { const a = C.M.B.ua, b = C.M.B.fa; return Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(el * C.D2R)); };
/* Тело лицом вниз, голова к +Z: up — вдоль позвоночника, fwd — живот (вниз) */
const proneAxes = th => { const a = th * Math.PI / 180; return { up: [0, Math.sin(a), Math.cos(a)], fwd: [0, -Math.cos(a), Math.sin(a)] }; };

/* Упор лёжа на носках: прямая линия голеностоп–таз–плечи под углом theta к полу.
   Подушечки стоп — в точке ballZ на коврике, пальцы упираются, пятки подняты (голеностоп в тыльном сгибании dorsi).
   yaw — поворот всего тела вокруг вертикали через стопы (смещение корпуса вбок, «лучник»), roll — крен корпуса, град. */
function proneOnToes(C, { theta, ballZ, feet = 8, dorsi = 12, lumbar = 0, thoracic = 0, neck = 0, yaw = 0, roll = 0 }) {
  const { V, M } = C, M3 = M.M3, q = C.base(), a0 = proneAxes(theta), Ry = M3.ry(yaw), pivot = [0, MAT, ballZ];
  const up = M3.v(Ry, a0.up), fwd = M3.v(M3.axis(up, roll * C.D2R), M3.v(Ry, a0.fwd)), fwdF = M3.v(Ry, [0, 0, 1]);
  C.root(q, [0, 40, 0], up, fwd);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0]; q.neck = [neck, 0, 0];
  const opt = { forward: fwdF, heel: 90 - theta - dorsi };
  const sup = s => V.add(pivot, M3.v(Ry, [M.SIGN[s] * feet, 0, 0]));
  const A = s => M.footFrame(sup(s), 0, opt).o, Am = V.mix(A('L'), A('R'), .5);
  const leg = M.B.th + M.B.sk - .06;
  q.root.p = V.add(Am, up, Math.sqrt(leg * leg - (feet - M.B.hipHalf) ** 2));
  for (const s of S) C.foot(q, s, sup(s), 0, V.unit(V.add(V.perp(fwd, up), C.latP(q, s), .12)), opt);
  return q;
}
/* Упор на коленях: колени на коврике в точке kneeZ, голени подняты (сгибание колена knee), стопы в воздухе;
   линия колено–таз–плечи под углом theta. Лёжа на голенях стопа не ложится на коврик в пределах подвижности голеностопа. */
function proneOnKnees(C, { theta, kneeZ, knees = 10, knee = 95 }) {
  const { V, M } = C, q = C.base(), { up, fwd } = proneAxes(theta);
  C.root(q, [0, 40, 0], up, fwd);
  const K = s => [M.SIGN[s] * knees, MAT + 5.5, kneeZ];
  q.root.p = V.add(V.mix(K('L'), K('R'), .5), up, Math.sqrt(M.B.th ** 2 - (knees - M.B.hipHalf) ** 2));
  const a = (180 + theta - knee) * C.D2R, shin = [0, Math.sin(a), Math.cos(a)];
  for (const s of S) C.legTo(q, s, V.add(K(s), shin, M.B.sk), fwd, { dorsi: -25 });
  return q;
}
/* Минимальная высота области тела над ковриком */
const lowest = (C, q, region) => Math.min(...C.region(q, region).map(p => p[1])) - MAT;

/* ---------- Упор на предплечьях ----------
   Локоть под плечевым суставом (плечо вертикально), предплечье лежит на коврике и смотрит вперёд-внутрь,
   кисть в кулаке большим пальцем вверх (pron — небольшая пронация). Центры локтя и запястья подняты над ковриком
   на толщину предплечья (6,4 и 4,2 см), чтобы его нижняя поверхность лежала на коврике. */
const ELBOW_H = 6.4, WRIST_H = 4.2;
function forearmOnMat(C, q, s, { inward = 14, pron = 15, wristFlex = 0, mode = 'fist', lift = 0 } = {}) {
  const { V, M } = C, g = M.SIGN[s], f = C.fk(q), gh = f.P['gh' + s];
  const E = [gh[0], MAT + ELBOW_H + lift, gh[2]], a = inward * C.D2R, dy = WRIST_H - ELBOW_H;
  const h = Math.sqrt(M.B.fa ** 2 - dy * dy), W = V.add(E, [-g * Math.sin(a) * h, dy, Math.cos(a) * h]);
  C.armTo(q, s, W, V.unit(V.sub(E, V.mix(gh, W, .5))), { pron, wrist: [wristFlex, 0], mode });
  return { E, W };
}
/* Тело в планке на предплечьях: угол подобран так, чтобы плечо было вертикально над локтем */
function plankTheta(C, o = {}) {
  return C.solve1D(th => { const q = proneOnToes(C, { theta: th, ...o }), f = C.fk(q); return (f.P.ghL[1] + f.P.ghR[1]) / 2 - (MAT + ELBOW_H + C.M.B.ua); }, -10, 40);
}

/* ---------- Лёжа на спине ----------
   Голова к +Z, живот вверх; левая сторона тела — −X. tilt — задний наклон таза (поясница прижимается), град. */
function supine(C, { tilt = 0, lumbar = 0, thoracic = 0, neck = 0, at = [0, 0] } = {}) {
  const q = C.base(), a = tilt * C.D2R;
  C.root(q, [at[0], 20, at[1]], [0, -Math.sin(a), Math.cos(a)], [0, Math.cos(a), Math.sin(a)]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0]; q.neck = [neck, 0, 0];
  return q;
}
/* Положить область на коврик и вернуть таз в точку at по горизонтали (по тазобедренным суставам) */
function lieOn(C, q, region, at = [0, 0], gap = -.8) {
  C.restOn(q, region, [0, MAT, 0], [0, 1, 0], gap);
  const f = C.fk(q), h = C.V.mix(f.P.hipL, f.P.hipR, .5); q.root.p = C.V.add(q.root.p, [at[0] - h[0], 0, at[1] - h[2]]);
  return q;
}
/* Стопа на коврике, носок от головы (−Z), колено смотрит вверх и чуть наружу */
function footFlat(C, q, s, x, z, opts = {}) {
  const { V } = C, lat = C.latP(q, s);
  return C.foot(q, s, [x, MAT, z], 0, V.unit(V.add([0, 1, 0], lat, opts.out ?? .15)), { forward: opts.forward || [0, 0, -1], heel: opts.heel || 0 });
}
/* Стопы на коврике на ширине таза, носки от головы; расстояние от таза подобрано под сгибание колена knee */
function feetFlatAtKnee(C, q, knee = 95, half = 11, heel = 0) {
  const { V } = C, f0 = C.fk(q), base = C.M.clone(q);
  for (const s of S) {
    const hip = f0.P['hip' + s], x = hip[0] + Math.sign(hip[0]) * (half - Math.abs(hip[0])) * 1;
    const kneeAt = D => { const t = C.M.clone(base); footFlat(C, t, s, x, hip[2] - D, { heel }); return t[s].knee - knee; };
    const D = C.solve1D(kneeAt, 15, 85);
    footFlat(C, q, s, x, hip[2] - D, { heel });
  }
  return q;
}
/* Кисти за головой: ладони на затылке сбоку, пальцы к середине затылка (голову не тянуть), локти в стороны.
   side — смещение центра ладони от середины затылка, up — к макушке, open — разворот пальцев к макушке, fwd — подъём локтя к потолку */
function handBehindHead(C, q, s, { side = 4.5, up = 0, open = .25, fwd = .15, gap = .4 } = {}) {
  const { V, M } = C, f = C.fk(q), H = f.F.head, hx = M.M3.col(H.R, 0), hy = M.M3.col(H.R, 1), hz = M.M3.col(H.R, 2), g = M.SIGN[s];
  const T = C.axes(q, 'thorax'), u = V.unit(V.add(V.scale(hz, -1), hx, g * side / M.B.head[0] * .9));
  /* точка на поверхности эллипсоида головы в направлении u */
  const r = 1 / Math.hypot(V.dot(u, hx) / M.B.head[0], V.dot(u, hy) / M.B.head[1], V.dot(u, hz) / M.B.head[2]);
  const P = V.add(V.add(f.P.head, u, r + gap), hy, up);
  C.palm(q, s, P, V.unit(V.add(V.scale(hx, -g), hy, open)), u, V.unit(V.add(V.add(V.scale(T.x, g), T.z, fwd), T.y, .25)));
  q.hands[s] = 'relaxed';                 /* пальцы мягко обхватывают затылок */
}
/* Рука вдоль тела ладонью вниз на коврике: центр ладони сбоку от таза, пальцы к стопам */
function palmBesideHip(C, q, s, point, { out = 8, pole } = {}) {
  const { V, M } = C, g = M.SIGN[s], lat = C.latP(q, s), a = out * C.D2R;
  const fingers = V.unit(V.add([0, 0, -Math.cos(a)], V.perp(lat, [0, 1, 0]), Math.sin(a)));
  return C.palm(q, s, point, fingers, [0, 1, 0], pole || V.unit(V.add(lat, [0, -1, 0], .3)));
}
/* Точки ладоней рук вдоль тела (лёжа на спине): рука почти прямая, кисть в xOut см от средней линии */
function palmsAlongBody(C, q, { xOut = 24, el = 10 } = {}) {
  const { V, M } = C, f = C.fk(q), out = {};
  for (const s of S) {
    const gh = f.P['gh' + s], x = gh[0] + Math.sign(gh[0]) * (xOut - Math.abs(gh[0]));
    const fing = V.unit([0, 0, -1]), at = z => [x, MAT, z];
    const z = C.solve1D(z => V.dist(gh, palmWrist(C, s, at(z), fing, [0, 1, 0])) - armSpan(C, el), gh[2] - 70, gh[2] - 20);
    out[s] = at(z);
  }
  return out;
}
/* Тело на спине с поднятым тазом: корпус наклонён на alpha (таз выше плеч), лопатки на коврике, затылок на коврике.
   Плечевые суставы остаются над точкой zs. */
function bridgeBody(C, alpha, zs, { lumbar = 0, thoracic = 0 } = {}) {
  const { V } = C, q = C.base(), a = alpha * C.D2R;
  C.root(q, [0, 30, 0], [0, -Math.sin(a), Math.cos(a)], [0, Math.cos(a), Math.sin(a)]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0];
  C.restOn(q, 'upperBack', [0, MAT, 0], [0, 1, 0], -.8);
  const f = C.fk(q), m = V.mix(f.P.ghL, f.P.ghR, .5); q.root.p = V.add(q.root.p, [0, 0, zs - m[2]]);
  C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.4);
  /* шея не должна уходить в коврик: при необходимости тело чуть приподнимается на шее и затылке */
  for (let i = 0; i < 3; i++) { const d = MAT - 1.6 - neckLowest(C, q); if (d <= 0) break; q.root.p = V.add(q.root.p, [0, d, 0]); C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.4); }
  return q;
}
/* нижняя точка поверхности шеи */
function neckLowest(C, q) {
  const R = C.M.catalogPose(q); let m = Infinity;
  for (let i = 0; i <= 4; i++) for (let j = 0; j < 16; j++) m = Math.min(m, C.M.FLOOR - C.M.neckPoint(R, i / 4, j / 16 * 2 * Math.PI)[1]);
  return m;
}

/* Почти прямая рука в направлении dir с заданной ориентацией ладони (palm — куда смотрит ладонь, пальцы вдоль руки).
   Полюс локтя подбирается перебором вокруг оси руки так, чтобы пронация предплечья и ротация плеча были минимальны. */
function armPalmFacing(C, q, s, dir, palm, { el = 6, mode = 'flat', prefer = null, wrist = null, fingers = null } = {}) {
  const { V, M } = C, M3 = M.M3, g = M.SIGN[s], gh = C.fk(q).P['gh' + s], W = wrist || V.add(gh, V.unit(dir), armSpan(C, el));
  const d = V.unit(fingers || dir), up = V.scale(V.unit(V.perp(palm, d)), -1);
  const x = V.scale(up, g), y = V.scale(d, -1), Rh = M3.cols(x, y, V.cross(x, y));
  let best = null; const base = V.unit(V.perp(Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0], d)), side = V.cross(d, base);
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * 2 * Math.PI, pole = V.add(V.scale(base, Math.cos(a)), side, Math.sin(a)), t = M.clone(q);
    M.solveArmWrist(t, s, W, pole, Rh);
    const cost = Math.max(Math.abs(t[s].pron) / 80, Math.abs(t[s].shoulder[2]) / 85, Math.abs(t[s].wrist[1]) / 20) + (prefer ? .3 * (1 - V.dot(pole, prefer)) : 0);
    if (!best || cost < best.cost) best = { cost, pole };
  }
  M.solveArmWrist(q, s, W, best.pole, Rh);
  q.hands = { ...(q.hands || {}), [s]: mode };
  return best;
}

/* Колено на коврике, голень назад и чуть приподнята, носок оттянут: тыльная сторона пальцев касается коврика.
   (Голень, лежащая на коврике целиком, потребовала бы подошвенного сгибания за пределом голеностопа.) */
function kneelInstep(C, q, s, K, { dorsi = -46 } = {}) {
  const { V, M } = C, hip = C.fk(q).P['hip' + s];
  const put = sg => { const a = sg * C.D2R, A = V.add(K, [0, Math.sin(a), -Math.cos(a)], M.B.sk); C.legTo(q, s, A, V.unit(V.sub(K, V.mix(hip, A, .5))), { dorsi }); };
  put(C.solve1D(sg => { put(sg); return lowestFoot(C, q, s) - (MAT - .3); }, -5, 30));
}
/* Ладонь на опоре с подбором полюса локтя вокруг линии плечо–запястье (минимум пронации, ротации плеча и отклонения запястья);
   prefer — предпочтительное направление локтя (для плавности между ключами) */
function palmAuto(C, q, s, point, fingers, up, prefer, w = .5) {
  const { V, M } = C, gh = C.fk(q).P['gh' + s], d = V.unit(V.sub(palmWrist(C, s, point, fingers, up), gh));
  const base = V.unit(V.perp(Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0], d)), side = V.cross(d, base);
  let best = null;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * 2 * Math.PI, pole = V.add(V.scale(base, Math.cos(a)), side, Math.sin(a)), t = M.clone(q);
    try { C.palm(t, s, point, fingers, up, pole); } catch (e) { continue; }
    const cost = Math.max(Math.abs(t[s].pron) / 82, Math.abs(t[s].shoulder[2]) / 85, Math.abs(t[s].wrist[1]) / 22) + w * (1 - V.dot(pole, V.unit(prefer)));
    if (!best || cost < best.cost) best = { cost, pole };
  }
  return C.palm(q, s, point, fingers, up, best.pole);
}
/* Хват жёсткой ручки с подбором полюса локтя: перебор вокруг линии плечо–хват, минимум ротации плеча, пронации и
   отклонения запястья; prefer — предпочтительное направление локтя (для плавности между ключами) */
function gripAuto(C, q, s, point, thumb, prefer, w = .4) {
  const { V, M } = C, gh = C.fk(q).P['gh' + s], d = V.unit(V.sub(point, gh));
  const base = V.unit(V.perp(Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0], d)), side = V.cross(d, base);
  let best = null;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * 2 * Math.PI, pole = V.add(V.scale(base, Math.cos(a)), side, Math.sin(a)), t = M.clone(q);
    try { C.grip(t, s, point, thumb, pole); } catch (e) { continue; }
    const cost = Math.max(Math.abs(t[s].pron) / 80, Math.abs(t[s].shoulder[2]) / 85, Math.abs(t[s].wrist[1]) / 20, Math.abs(t[s].wrist[0]) / 70) + w * (1 - V.dot(pole, V.unit(prefer)));
    if (!best || cost < best.cost) best = { cost, pole };
  }
  return C.grip(q, s, point, thumb, best.pole);
}

/* ---------- Лёжа на животе ----------
   Голова к +Z, живот вниз (левая сторона — +X). Позвоночник: lumbar/thoracic < 0 — разгибание (подъём груди). */
function prone(C, { lumbar = 0, thoracic = 0, neck = 0, region = 'front', at = 0 } = {}) {
  const q = C.base(); C.root(q, [0, 20, 0], [0, 0, 1], [0, -1, 0]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0]; q.neck = [neck, 0, 0];
  C.restOn(q, region, [0, MAT, 0], [0, 1, 0], -1);
  const f = C.fk(q), h = C.V.mix(f.P.hipL, f.P.hipR, .5); q.root.p = C.V.add(q.root.p, [0, 0, at - h[2]]);
  return q;
}
/* Ноги лёжа на животе: бедро разогнуто на ext, носки оттянуты; если ноги лежат (ext=0) — колени чуть согнуты, кончики носков касаются коврика */
function proneLegs(C, q, ext = 0, { dorsi = -45, spread = 2 } = {}) {
  const { V, M } = C;
  for (const s of S) {
    const hip = C.fk(q).P['hip' + s], a = ext * C.D2R, d = V.unit([M.SIGN[s] * spread / 86, Math.sin(a), -Math.cos(a)]);
    const put = k => { const r = k * C.D2R, kn = V.add(hip, d, M.B.th), sd = V.unit(V.add(V.scale(d, Math.cos(r)), [0, 1, 0], Math.sin(r))); C.legTo(q, s, V.add(kn, sd, M.B.sk), [0, -1, 0], { dorsi }); };
    if (ext > .5) { put(4); continue; }
    const k0 = C.solve1D(k => { put(k); return lowestFoot(C, q, s) - (MAT - .3); }, 0, 40);
    put(lowestFoot(C, (put(0), q), s) > MAT - .3 ? 0 : k0);
  }
}

/* ---------- Отжимания: общая раскладка ----------
   Ладони неподвижны на коврике, тело поворачивается вокруг опоры (подушечки стоп или колени), плечевой пояс ходит:
   вверху лопатки опущены и разведены («оттолкнуть пол»), внизу сведены.
   Параметры рук (можно задать отдельно для стороны: xL, outR, pole1L…):
   x — от средней линии до центра ладони; ahead — центр ладони впереди плечевого сустава в верхней точке;
   out — разворот пальцев наружу, град; pole0/pole1 — полюс локтя вверху и внизу [наружу, вверх, к стопам].
   Корпус: low — зазор грудь–коврик внизу; elTop — сгибание локтя вверху; g0/g1 — плечевой пояс [поднимание, протракция].
   Ограничение: разгибание запястья ≤ 75–78° (валидатор) — поэтому ладони стоят на уровне плеч, а не позади них. */
function pushLayout(o) {
  const L = { base: 'toes', ballZ: -72, feet: 8, kneeZ: -22, knees: 10, low: 3.5, ...o };
  const C = ctx([]), { V } = C;
  L.get = (k, s) => L[k + s] ?? L[k];
  L.body = (C, th, e) => {
    const q = L.base === 'knees' ? proneOnKnees(C, { theta: th, kneeZ: L.kneeZ, knees: L.knees }) : proneOnToes(C, { theta: th, ballZ: L.ballZ, feet: L.feet, yaw: (L.yaw || 0) * e, roll: (L.roll || 0) * e });
    for (const s of S) { const g0 = L.get('g0', s), g1 = L.get('g1', s); q[s].girdle = [C.lerp(g0[0], g1[0], e), C.lerp(g0[1], g1[1], e)]; }
    return q;
  };
  L.fingers = s => { const a = L.get('out', s) * C.D2R * C.M.SIGN[s]; return [Math.sin(a), 0, Math.cos(a)]; };
  const palmAt = th => { const f = C.fk(L.body(C, th, 0)); return S.reduce((o, s) => ({ ...o, [s]: [C.M.SIGN[s] * L.get('x', s), MAT, f.P['gh' + s][2] + L.get('ahead', s)] }), {}); };
  const reachTop = th => { const f = C.fk(L.body(C, th, 0)), P = palmAt(th); return Math.max(...S.filter(s => L.slide?.s !== s).map(s => V.dist(f.P['gh' + s], palmWrist(C, s, P[s], L.fingers(s), [0, 1, 0])) - armSpan(C, L.get('elTop', s)))); };
  L.thTop = C.solve1D(reachTop, 5, 60);
  L.palms = palmAt(L.thTop);
  L.thBot = C.solve1D(th => lowest(C, L.body(C, th, 1), 'chest') - L.low, -15, L.thTop);
  return L;
}
/* Поза отжимания: e — 0 верх, 1 низ.
   L.slide = { s, el } — ладонь стороны s скользит по коврику наружу так, что рука остаётся почти прямой (сгибание el) — «лучник». */
function pushPose(C, L, e) {
  const { V } = C, th = C.lerp(L.thTop, L.thBot, e), q = L.body(C, th, e), { up } = proneAxes(th);
  for (const s of S) {
    const lat = C.lat(q, s), p0 = L.get('pole0', s), p1 = L.get('pole1', s), p = [0, 1, 2].map(i => C.lerp(p0[i], p1[i], e));
    const pole = V.unit(V.add(V.add(V.scale(lat, p[0]), [0, 1, 0], p[1]), up, -p[2]));
    let palm = L.palms[s];
    if (L.slide?.s === s) {
      const gh = C.fk(q).P['gh' + s], g = C.M.SIGN[s], at = x => [g * x, MAT, palm[2]];
      const x = C.solve1D(x => V.dist(gh, palmWrist(C, s, at(x), L.fingers(s), [0, 1, 0])) - armSpan(C, L.slide.el), Math.abs(palm[0]) - 5, Math.abs(palm[0]) + 60);
      palm = at(x);
    }
    C.palm(q, s, palm, L.fingers(s), [0, 1, 0], pole);
  }
  return q;
}
const PUSH = once(() => pushLayout({ x: 29, ahead: 12.7, out: 13.3, elTop: 12, pole0: [.39, -.02, 1.13], pole1: [.54, .57, 1.13], g0: [-6.5, 3.2], g1: [9.3, -13] }));
/* Узкий хват: ладони на ширине плеч (уже — пронация предплечья за пределом при прижатых локтях), пальцы внутрь */
const DIAMOND = once(() => pushLayout({ x: 15.5, ahead: 12, out: -35, elTop: 10.8, low: 5, pole0: [1.22, .94, 1.32], pole1: [.38, 1.97, 1.5], g0: [-8.2, 6.3], g1: [0, -15] }));
const KNEEPUSH = once(() => pushLayout({ base: 'knees', kneeZ: -22, x: 26, ahead: 14.7, out: 4.7, low: 5.5, elTop: 8.6, pole0: [.28, 1.24, 1.43], pole1: [.12, 1.21, .51], g0: [-.8, 9.9], g1: [10, -3.7] }));
const WIDEPUSH = once(() => pushLayout({ x: 40, ahead: 18, out: 25, low: 4.2, elTop: 10.9, pole0: [.81, -.22, 1.1], pole1: [.16, 1.32, 1.42], g0: [-9.4, 6.2], g1: [3.8, -15] }));
/* «Лучник»: работает правая рука (ладонь неподвижна, локоть вдоль корпуса), левая выпрямляется и ладонь скользит в сторону;
   внизу корпус смещён к правой ладони поворотом тела вокруг стоп */
const ARCHER = once(() => pushLayout({ low: 4, slide: { s: 'L', el: 8 }, x: 48.9, ahead: -.3, elTop: 11.2, outL: 82.8, outR: 65, yaw: -7, roll: 2,
  pole0L: [.25, 1.45, .34], pole1L: [1.62, -.2, .69], g0L: [-.6, 7.8], g1L: [.8, -2.7], pole0R: [-.13, -.5, 1.46], pole1R: [0, 0, 1.14], g0R: [-9.8, 8.8], g1R: [10, -7] }));
const PLANK = once(() => ({ theta: plankTheta(ctx([]), { ballZ: -72 }) }));
/* Боковая планка на правом предплечье: правый бок к коврику (живот смотрит в +X), тело — прямая линия от стоп до макушки,
   стопы одна на другой (правая — ребром на коврике), правое плечо вертикально над локтем, левая рука поднята вверх. */
function sidePlankBody(C, theta) {
  const { V, M } = C, q = C.base(), a = theta * C.D2R, up = [0, Math.sin(a), Math.cos(a)], fwd = [1, 0, 0];
  C.root(q, [0, 40, 0], up, fwd);
  const f = C.fk(q), left = M.M3.col(f.F.pelvis.R, 0), down = V.scale(up, -1);
  /* голеностопы одна над другой с зазором 10,5 см по боковой оси, ноги прямые */
  for (const s of S) { const hip = f.P['hip' + s], A = V.add(V.add(hip, down, M.B.th + M.B.sk - .1), left, -M.SIGN[s] * (M.B.hipHalf - 5.25)); C.legTo(q, s, A, fwd, { dorsi: 0 }); }
  return q;
}
const SIDEPLANK = once(() => {
  const C = ctx([]), { V } = C;
  /* угол наклона: высота правого плеча над нижним краем правой стопы = локоть + плечо */
  const gap = th => { const q = sidePlankBody(C, th), f = C.fk(q), low = Math.min(...C.region(q, 'shinR').map(p => p[1]), lowestFoot(C, q, 'R')); return f.P.ghR[1] - low - (ELBOW_H + C.M.B.ua); };
  return { theta: C.solve1D(gap, 0, 40) };
});
/* нижняя точка стопы стороны s (по точкам её поверхности) */
function lowestFoot(C, q, s) {
  const { M } = C, f = C.fk(q);
  return Math.min(...M.footPoints(s).map(fp => M.footPointWorld(f.F['foot' + s], f.F['toes' + s], fp)[1]));
}
/* Упор на коленях и ладонях (четвереньки): колени под тазобедренными суставами, ладони на уровне плеч чуть впереди
   (разгибание запястья ≤ 75°), руки почти прямые, спина ровная. */
const QUAD = once(() => {
  const C = ctx([]), { V } = C, kneeZ = -10, knees = 10, el = 12, ahead = 15.5;
  const body = th => {
    const q = C.base(), { up, fwd } = proneAxes(th); C.root(q, [0, MAT + 5.5 + C.M.B.th, kneeZ], up, fwd);
    for (const s of S) q[s].girdle = [-4, 6];
    return q;
  };
  const fing = s => { const a = 8 * C.D2R * C.M.SIGN[s]; return [Math.sin(a), 0, Math.cos(a)]; };
  const palmAt = q => { const f = C.fk(q); return S.reduce((o, s) => ({ ...o, [s]: [f.P['gh' + s][0] + C.M.SIGN[s] * 2, MAT, f.P['gh' + s][2] + ahead] }), {}); };
  const th = C.solve1D(th => { const q = body(th), f = C.fk(q), P = palmAt(q); return V.dist(f.P.ghL, palmWrist(C, 'L', P.L, fing('L'), [0, 1, 0])) - armSpan(C, el); }, -10, 30);
  return { th, body, palms: palmAt(body(th)), fing, kneeZ, knees };
});
/* Ролик с колен: колени неподвижны на коврике (голени назад, носки оттянуты), бёдра наклоняются вперёд на phi,
   корпус — от бедра с углом сгибания hip; ось ролика проходит через хваты на высоте радиуса над ковриком,
   положение ролика подбирается по длине почти прямых рук. */
const WHEEL_R = 9, GRIP_X = 10;
function rolloutBody(C, phi, hip, { lumbar = 0, thoracic = 0, kneeZ = -30, knees = 10 } = {}) {
  const { V } = C, q = C.base(), a = phi * C.D2R, thigh = [0, Math.cos(a), Math.sin(a)];
  const tr = (90 - phi - hip) * C.D2R, up = [0, Math.sin(tr), Math.cos(tr)], fwd = [0, -Math.cos(tr), Math.sin(tr)];
  C.root(q, V.add([0, MAT + 5.5, kneeZ], thigh, C.M.B.th), up, fwd);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0];
  for (const s of S) kneelInstep(C, q, s, [C.M.SIGN[s] * knees, MAT + 5.5, kneeZ]);
  return q;
}
const ROLL = once(() => {
  const C = ctx([]), { V } = C, el0 = 6;
  /* старт: бёдра вертикально, ролик под плечами — угол корпуса из длины рук */
  const reachDown = hip => { const q = rolloutBody(C, 0, hip, { lumbar: 10, thoracic: 8 }), f = C.fk(q), g = f.P.ghL; return g[1] - (MAT + WHEEL_R) - armSpan(C, el0) - 7.4; };
  const hip0 = C.solve1D(reachDown, 20, 110);
  return { hip0, el0 };
});
/* Планка с подъёмом на руки: стопы чуть шире (устойчивость при переносе руки), предплечья — как в планке,
   ладони — на уровне плеч для упора на прямых руках. Положение корпуса в каждом ключе подбирается так, чтобы опорные
   руки точно стояли на своих опорах: предплечье — плечевая кость от неподвижного локтя, ладонь — почти прямая рука. */
const PLANKUP = once(() => {
  const C = ctx([]), { V } = C, feet = 12, base = { ballZ: -72, feet };
  /* крен плечевого пояса — поворотом грудного и поясничного отделов, таз ровный; yaw — перенос веса поворотом тела вокруг стоп */
  const body = (th, roll = 0, yaw = 0) => { const q = proneOnToes(C, { theta: th, yaw, ...base }); q.thoracic[2] = roll * .78; q.lumbar[2] = roll * .22; return q; };
  const thF = plankTheta(C, base), qF = body(thF);
  const fore = {}; for (const s of S) { const t = C.M.clone(qF); fore[s] = forearmOnMat(C, t, s, { lift: .8 }); }
  const top = pushLayout({ x: 23.5, ahead: 15, out: 9, elTop: 11, feet, pole0: [.39, -.02, 1.13], pole1: [.39, -.02, 1.13], g0: [-6.5, 3.2], g1: [-6.5, 3.2] });
  const palmW = s => palmWrist(C, s, top.palms[s], top.fingers(s), [0, 1, 0]);
  /* невязка опоры стороны s в состоянии F/P */
  const res = (q, s, st) => { const gh = C.fk(q).P['gh' + s]; return st === 'F' ? V.dist(gh, fore[s].E) - C.M.B.ua : V.dist(gh, palmW(s)) - armSpan(C, 12); };
  /* подбор корпуса: две опоры — угол и крен; одна опора — угол при заданном крене */
  const solve = (st, yaw, roll0) => {
    const sup = S.filter(s => st[s] !== 'A');
    if (sup.length === 1) { const s = sup[0]; return { th: C.solve1D(x => res(body(x, roll0, yaw), s, st[s]), thF - 12, top.thTop + 12), roll: roll0, yaw }; }
    let x = [(thF + top.thTop) / 2, roll0];
    for (let i = 0; i < 40; i++) {
      const err = y => { const q = body(y[0], y[1], yaw); return S.map(s => res(q, s, st[s])); }, e0 = err(x), h = .05, j = [[0, 0], [0, 0]];
      if (Math.hypot(...e0) < 1e-3) break;
      for (let k = 0; k < 2; k++) { const y = x.slice(); y[k] += h; const e1 = err(y); j[0][k] = (e1[0] - e0[0]) / h; j[1][k] = (e1[1] - e0[1]) / h; }
      const det = j[0][0] * j[1][1] - j[0][1] * j[1][0]; if (Math.abs(det) < 1e-9) break;
      x = [x[0] - (j[1][1] * e0[0] - j[0][1] * e0[1]) / det, x[1] - (-j[1][0] * e0[0] + j[0][0] * e0[1]) / det];
    }
    return { th: x[0], roll: x[1], yaw };
  };
  return { thF, fore, top, palmW, body, solve };
});
const PLANKUP_SHIFT = 2.5, PLANKUP_ROLL = 14;
const PUSH_MAT = [{ type: 'mat', id: 'mat', len: 200, width: 75, at: [0, 0, 8] }];
const PUSH_CONTACTS = [{ body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' }, { body: 'footL', prop: 'mat' }, { body: 'footR', prop: 'mat' }];

/* Ягодичный мостик: плечи остаются на месте (zs), стопы неподвижны; таз поднимается до прямой линии плечи–таз–колени.
   one — сторона опорной ноги (для мостика на одной ноге): вторая нога выпрямлена, бёдра параллельны. */
function bridgeLayout({ zs = 40, half = 11, kneeTop = 100, one = null } = {}) {
  const C = ctx([]);
  const thor = 14, alpha0 = C.solve1D(a => lowest(C, bridgeBody(C, a, zs), 'buttocks') + .9, -10, 25);
  const sides = one ? [one] : S;
  const at = (alpha, zf) => { const q = bridgeBody(C, alpha, zs, { thoracic: thor }); for (const s of sides) footFlat(C, q, s, C.M.SIGN[s] * -half, zf); return q; };
  const alphaTop = zf => C.solve1D(a => at(a, zf)[sides[0]].hip[0], alpha0, 45);
  const zf = C.solve1D(zf => at(alphaTop(zf), zf)[sides[0]].knee - kneeTop, zs - 75, zs - 115);
  /* ладони неподвижны: точка, до которой рука дотягивается во всех фазах */
  const alpha1 = alphaTop(zf), cands = [0, .25, .5, .75, 1].map(e => palmsAlongBody(C, bridgeBody(C, C.lerp(alpha0, alpha1, e), zs, { thoracic: thor * e })));
  const palms = S.reduce((o, s) => ({ ...o, [s]: cands.reduce((a, b) => (b[s][2] > a[s][2] ? b : a))[s] }), {});
  return { zs, half, zf, alpha0, alpha1, palms, sides, one, thor };
}
function bridgePose(C, L, e) {
  const q = bridgeBody(C, C.lerp(L.alpha0, L.alpha1, e), L.zs, { thoracic: L.thor * e });
  for (const s of L.sides) footFlat(C, q, s, C.M.SIGN[s] * -L.half, L.zf);
  /* свободная нога выпрямлена, бедро зеркально опорному (бёдра параллельны, таз без перекоса) */
  if (L.one) { const o = L.one === 'L' ? 'R' : 'L', f = C.fk(q), d = C.V.unit(C.V.sub(f.P['kn' + L.one], f.P['hip' + L.one])); C.legTo(q, o, C.V.add(f.P['hip' + o], [-d[0], d[1], d[2]], C.M.B.th + C.M.B.sk - .1), [0, 1, 0], { dorsi: -10 }); }
  for (const s of S) palmBesideHip(C, q, s, L.palms[s]);
  return q;
}
const BRIDGE = once(() => bridgeLayout());
const GLUTEBRIDGE1 = once(() => bridgeLayout({ one: 'L', half: 9 }));
/* Подъём ног лёжа: корпус (таз подкручивается к верхней точке), ноги под углом a к коврику, пятки внизу в 5 см над ковриком */
function legRaiseBody(C, e) {
  const q = supine(C, { tilt: C.lerp(5, 20, e), lumbar: C.lerp(5, 20, e) });
  C.restOn(q, 'upperBack', [0, MAT, 0], [0, 1, 0], -.8);
  if (e === 0) C.restOn2(q, 'upperBack', 'buttocks', [0, MAT, 0], [0, 1, 0], -.8);
  const f = C.fk(q), m = C.V.mix(f.P.ghL, f.P.ghR, .5); q.root.p = C.V.add(q.root.p, [0, 0, 45 - m[2]]);
  C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.4);
  return q;
}
function legAngle(C, q, s, a, { dorsi = -15, knee = 0 } = {}) {
  const { V, M } = C, r = a * C.D2R, hip = C.fk(q).P['hip' + s], d = V.unit([M.SIGN[s] * -.02, Math.sin(r), -Math.cos(r)]);
  C.legTo(q, s, V.add(hip, d, M.B.th + M.B.sk - .15 - knee), [0, Math.cos(r), Math.sin(r)], { dorsi });
}
const LEGRAISE = once(() => {
  const C = ctx([]), q = legRaiseBody(C, 0);
  const heel = a => { const t = C.M.clone(q); for (const s of S) legAngle(C, t, s, a); return Math.min(...S.map(s => lowestFoot(C, t, s))) - (MAT + 5); };
  return { a0: C.solve1D(heel, -10, 30), palms: palmsAlongBody(C, q, { xOut: 22, el: 12 }) };
});
/* Лёжа на спине с прижатой поясницей и оторванными лопатками (лодочка, мёртвый жук, велосипед):
   tilt/lumbar — подкрутка таза, thoracic — сгибание грудного отдела, rot — поворот грудного отдела влево (+) */
function supineCore(C, { tilt = 10, lumbar = 10, thoracic = 0, neck = 0, rot = 0, zs = 40 } = {}) {
  const q = supine(C, { tilt, lumbar, thoracic, neck });
  q.thoracic[2] = rot; q.lumbar[2] = rot * .2;
  C.restOn(q, 'back', [0, MAT, 0], [0, 1, 0], -.8);
  const f = C.fk(q), h = C.V.mix(f.P.hipL, f.P.hipR, .5); q.root.p = C.V.add(q.root.p, [0, 0, zs - 45 - h[2]]);
  return q;
}
/* Прямая рука в направлении dir от плечевого сустава (почти прямая, сгибание el) */
function armDir(C, q, s, dir, pole, { el = 8, pron = 0, wrist = [0, 0], mode = 'relaxed' } = {}) {
  const { V } = C, gh = C.fk(q).P['gh' + s];
  return C.armTo(q, s, V.add(gh, V.unit(dir), armSpan(C, el)), pole, { pron, wrist, mode });
}
/* Нога: бедро в направлении thigh (мир), колено согнуто на knee в сторону стоп/коврика (полюс pole) */
function legBent(C, q, s, thigh, knee, pole, { dorsi = -10 } = {}) {
  const { V, M } = C, hip = C.fk(q).P['hip' + s], K = V.add(hip, V.unit(thigh), M.B.th);
  const L = Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(knee * C.D2R));
  /* голень поворачивается от продолжения бедра на угол knee в плоскости (бедро, pole) */
  const u = V.unit(thigh), w = V.unit(V.perp(pole, u)), a = knee * C.D2R, sd = V.add(V.scale(u, Math.cos(a)), w, Math.sin(a));
  C.legTo(q, s, V.add(K, sd, M.B.sk), V.scale(w, -1), { dorsi });
  return L;
}
const YTW = { lift: 10, low: -4, wOut: .9 }, SNOW = { lift: -7 }, BIRD = { shift: 3 }, ROLLOUT = { phi1: 69, hip1: 8 };
const HOLLOW_LEG = 14, DEADBUG_LEG = 10, BIKE = { hipOut: 32, hipIn: 110 };
const SUP_MAT = [{ type: 'mat', id: 'mat', len: 190, width: 70, at: [0, 0, 5] }];
module.exports = {
  /* Скручивания: лёжа на спине, колени согнуты, стопы на коврике, кисти за головой, локти в стороны (голову не тянуть).
     t=0 — лопатки на коврике, t=1 — лопатки оторваны сгибанием грудного отдела, поясница прижата. */
  crunch: {
    keys: [0, .25, .5, .75, 1],
    equipment: SUP_MAT,
    contacts: [{ body: 'buttocks', prop: 'mat' }, { body: 'back', prop: 'mat' }, { body: 'soleL', prop: 'mat' }, { body: 'soleR', prop: 'mat' },
      { body: 'upperBack', prop: 'mat', when: [0, .05] }, { body: 'handL', prop: 'mat', when: [0, .05] }, { body: 'handR', prop: 'mat', when: [0, .05] }],
    pose(t, C) {
      const e = C.ease(t), body = (e, neck) => {
        const q = supine(C, { tilt: C.lerp(4, 12, e), lumbar: C.lerp(4, 12, e), thoracic: C.lerp(0, 28, e), neck });
        for (const s of S) { q[s].hip = [60, 8, 4]; q[s].knee = 95; }
        return lieOn(C, q, 'back', [0, -10]);
      };
      /* в исходном положении затылок лежит в ладонях на коврике */
      const q0 = body(0, 0); C.neckTo(q0, 'headBack', [0, MAT + 3.4, 0], [0, 1, 0], 0);
      const q = body(e, q0.neck[0] + C.lerp(0, 14, e));
      feetFlatAtKnee(C, q, 118);
      for (const s of S) { q[s].girdle = [C.lerp(4, 8, e), C.lerp(0, 10, e)]; handBehindHead(C, q, s, { fwd: .6, up: 1 }); }
      return q;
    }
  },

  /* Ягодичный мостик: t=0 — таз на коврике, t=1 — таз поднят до прямой линии плечи–таз–колени; лопатки, затылок, стопы и ладони на коврике. */
  bridge: {
    keys: [0, .25, .5, .75, 1],
    equipment: SUP_MAT,
    contacts: [{ body: 'upperBack', prop: 'mat' }, { body: 'headBack', prop: 'mat' }, { body: 'soleL', prop: 'mat' }, { body: 'soleR', prop: 'mat' },
      { body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' }, { body: 'buttocks', prop: 'mat', when: [0, .02] }],
    pose(t, C) { return bridgePose(C, BRIDGE(), C.ease(t)); }
  },

  /* Ягодичный мостик на одной ноге: опорная — ЛЕВАЯ, правая нога выпрямлена, бёдра параллельны, таз без перекоса. */
  glutebridge1: {
    keys: [0, .25, .5, .75, 1],
    equipment: SUP_MAT,
    contacts: [{ body: 'upperBack', prop: 'mat' }, { body: 'headBack', prop: 'mat' }, { body: 'soleL', prop: 'mat' },
      { body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' }, { body: 'buttocks', prop: 'mat', when: [0, .02] }],
    pose(t, C) { return bridgePose(C, GLUTEBRIDGE1(), C.ease(t)); }
  },

  /* Подъём ног лёжа: руки вдоль тела ладонями вниз, ноги прямые. t=0 — пятки в нескольких сантиметрах над ковриком
     (поясница прижата), t=1 — ноги вертикально, таз слегка подкручен и оторван от коврика. */
  lyinglegraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 70, at: [0, 0, -4] }],
    contacts: [{ body: 'back', prop: 'mat' }, { body: 'upperBack', prop: 'mat' }, { body: 'headBack', prop: 'mat' }, { body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' },
      { body: 'buttocks', prop: 'mat', when: [0, .3] }],
    pose(t, C) {
      const e = C.ease(t), L = LEGRAISE(), q = legRaiseBody(C, e);
      const a = C.lerp(L.a0, 90, e);
      for (const s of S) legAngle(C, q, s, a);
      for (const s of S) palmBesideHip(C, q, s, L.palms[s]);
      return q;
    }
  },

  /* «Лодочка» на спине (удержание): поясница прижата, лопатки и прямые ноги оторваны от коврика, руки вытянуты за голову.
     t=0 и t=1 почти совпадают (дыхание). */
  hollow: {
    keys: [0, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 70, at: [0, 0, 0] }],
    contacts: [{ body: 'back', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = supineCore(C, { tilt: 12, lumbar: 12, thoracic: C.lerp(22, 24, e), neck: 12 });
      for (const s of S) q[s].girdle = [10, 10];
      const T = C.axes(q, 'thorax'), a = C.lerp(HOLLOW_LEG, HOLLOW_LEG - 1.5, e) * C.D2R;
      for (const s of S) legAngle(C, q, s, a / C.D2R, { dorsi: -30 });
      for (const s of S) armDir(C, q, s, V.add(V.add(T.y, T.z, .1), T.x, C.M.SIGN[s] * .12), V.scale(T.z, -1), { el: 6, pron: 10, mode: 'flat' });
      return q;
    }
  },

  /* «Мёртвый жук» (замкнутый цикл): руки вертикально, бёдра вертикально, колени 90°, поясница прижата.
     t=0,25 — правая рука за голову и левая нога выпрямлена над ковриком; t=0,5 — исходное; t=0,75 — левая рука и правая нога; t=1 = t=0. */
  deadbug: {
    keys: [0, .125, .25, .375, .5, .625, .75, .875, 1],
    loop: true,
    equipment: SUP_MAT,
    contacts: [{ body: 'back', prop: 'mat' }, { body: 'upperBack', prop: 'mat' }, { body: 'headBack', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, q = supineCore(C, { tilt: 10, lumbar: 10 });
      C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.4);
      /* фаза работы: правая рука + левая нога в первой половине, левая рука + правая нога — во второй */
      const bump = u => (1 - Math.cos(4 * Math.PI * u)) / 2, w = { R: t < .5 ? bump(t) : 0, L: t >= .5 ? bump(t - .5) : 0 };
      const T = C.axes(q, 'thorax');
      for (const s of S) {
        const k = w[s], arm = C.lerp(0, 80, k) * C.D2R;    /* рука: от вертикали к голове, кисть над ковриком */
        const head = V.unit(V.perp(T.y, [0, 1, 0])), dir = V.add(V.add([0, Math.cos(arm), 0], head, Math.sin(arm)), V.perp(T.x, [0, 1, 0]), C.M.SIGN[s] * .06);
        armDir(C, q, s, dir, V.unit(V.add([0, Math.sin(arm), 0], head, -Math.cos(arm))), { el: 6, pron: 0, mode: 'flat' });
        const o = s === 'L' ? 'R' : 'L', kl = w[o];       /* нога противоположной стороны */
        const th = C.lerp(90, DEADBUG_LEG, kl) * C.D2R, kn = C.lerp(90, 2, kl);
        legBent(C, q, s, [C.M.SIGN[s] * -.04, Math.sin(th), -Math.cos(th)], kn, V.unit([0, -1, -1]), { dorsi: C.lerp(0, -10, kl) });
      }
      for (const s of S) q[s].girdle = [6, 6];
      return q;
    }
  },

  /* «Велосипед» (замкнутый цикл): кисти за головой, лопатки оторваны, поясница прижата, ноги на весу.
     t=0 — правый локоть к левому колену (левая нога согнута, правая выпрямлена), t=0,5 — левый локоть к правому колену, t=1 = t=0. */
  bicycle: {
    keys: [0, .125, .25, .375, .5, .625, .75, .875, 1],
    loop: true,
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 70, at: [0, 0, 0] }],
    contacts: [{ body: 'back', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, c = Math.cos(2 * Math.PI * t), sn = Math.sin(2 * Math.PI * t);
      /* поворот корпуса влево (+) при t=0, вправо при t=0,5 */
      const q = supineCore(C, { tilt: 10, lumbar: 10, thoracic: 27, neck: 12, rot: 32 * c });
      for (const s of S) q[s].girdle = [6, s === 'R' ? 4 + 8 * c : 4 - 8 * c];
      /* ноги крутят «педали»: фаза левой ноги p=0 — колено к груди, p=0,5 — нога выпрямлена */
      for (const s of S) {
        const p = s === 'L' ? t : (t + .5) % 1, k = (1 + Math.cos(2 * Math.PI * p)) / 2, lift = Math.sin(2 * Math.PI * p);
        const th = (C.lerp(BIKE.hipOut, BIKE.hipIn, k) + 6 * lift) * C.D2R, kn = C.lerp(6, 112, k);
        legBent(C, q, s, [C.M.SIGN[s] * C.lerp(-.06, .08, k), Math.sin(th), -Math.cos(th)], kn, V.unit([0, -1, -1]), { dorsi: -20 });
      }
      for (const s of S) handBehindHead(C, q, s, { fwd: .6 });
      return q;
    }
  },

  /* «Лодочка» (супермен): лёжа на животе, руки вытянуты вперёд, носки оттянуты.
     t=0 — лежит, лоб и ладони на коврике; t=1 — грудь, руки и ноги приподняты на несколько сантиметров, взгляд в пол. */
  superman: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 225, width: 75, at: [0, 0, 12] }],
    contacts: [{ body: 'belly', prop: 'mat' }, { body: 'front', prop: 'mat', when: [0, .02] }, { body: 'forehead', prop: 'mat', when: [0, .02] },
      { body: 'palmL', prop: 'mat', when: [0, .02] }, { body: 'palmR', prop: 'mat', when: [0, .02] }, { body: 'thL', prop: 'mat', when: [0, .02] }, { body: 'thR', prop: 'mat', when: [0, .02] }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = prone(C, { lumbar: C.lerp(0, -14, e), thoracic: C.lerp(0, -8, e), region: e < .01 ? 'front' : 'belly' });
      for (const s of S) q[s].girdle = [C.lerp(8, 10, e), C.lerp(4, -6, e)];
      if (e < .01) C.neckTo(q, 'headAll', [0, MAT, 0], [0, 1, 0], .2); else q.neck = [C.lerp(2, 6, e), 0, 0];
      proneLegs(C, q, C.lerp(-6, 12, e));
      /* руки: впереди головы, ладони вниз; внизу кисти лежат на коврике, вверху подняты вместе с грудью */
      const T = C.axes(q, 'thorax');
      for (const s of S) {
        const lift = C.lerp(-.15, .1, e), dir = V.unit([C.M.SIGN[s] * .12, lift, 1]);
        armDir(C, q, s, dir, V.unit(V.add(T.z, V.scale(T.x, C.M.SIGN[s]), 1)), { el: 6, pron: 45, mode: 'flat' });
      }
      return q;
    }
  },

  /* Разведения лёжа «Y-T-W»: лоб на коврике, грудь не отрывается, большие пальцы вверх, лопатки сведены.
     t=0 — руки подняты буквой Y, t=0,5 — буквой T, t=1 — W (локти согнуты); между ними руки опускаются, не касаясь коврика
     (t=0,25 — опущены в положение T, t=0,75 — в положение W). */
  ytw: {
    keys: [0, .125, .25, .375, .5, .625, .75, .875, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 90, at: [0, 0, 15] }],
    contacts: [{ body: 'front', prop: 'mat' }, { body: 'forehead', prop: 'mat' }, { body: 'thL', prop: 'mat' }, { body: 'thR', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, q = prone(C);
      C.neckTo(q, 'headAll', [0, MAT, 0], [0, 1, 0], .2);
      proneLegs(C, q, -6);
      /* подъём рук: вверху (t=0; 0,5; 1) — YTW.lift, между — опущены до YTW.low (над ковриком) */
      const dip = (1 - Math.cos(4 * Math.PI * t)) / 2, lift = C.lerp(YTW.lift, YTW.low, dip) * C.D2R;
      /* форма: Y (45° от линии головы) → T (90°) в первой половине, T → W (локти согнуты) во второй */
      const ang = (t < .5 ? C.lerp(45, 90, C.ease(t / .5)) : C.lerp(90, 125, C.ease((t - .5) / .5))) * C.D2R;
      const bend = t < .5 ? 5 : C.lerp(5, 72, C.ease((t - .5) / .5));
      for (const s of S) {
        const g = C.M.SIGN[s], up = 1 - dip;
        q[s].girdle = [C.lerp(0, -4, up), C.lerp(-4, -15, up)];
        const gh = C.fk(q).P['gh' + s], ua = V.unit([g * Math.sin(ang) * Math.cos(lift), Math.sin(lift), Math.cos(ang) * Math.cos(lift)]);
        const E = V.add(gh, ua, C.M.B.ua);
        /* предплечье: от продолжения плеча поворачивается к голове (+Z) в горизонтальной плоскости на угол bend */
        const fAng = ang - bend * C.D2R, fa = V.unit([g * Math.sin(fAng) * Math.cos(lift), Math.sin(lift) * (bend > 10 ? 0 : 1), Math.cos(fAng) * Math.cos(lift)]);
        const pole = bend > 10 ? V.unit(V.add(V.scale(fa, -1), ua, 1)) : [0, 1, 0];
        C.armTo(q, s, V.add(E, fa, C.M.B.fa), V.unit(V.add(pole, [0, 1, 0], bend > 10 ? 0 : 1)), { pron: 0, mode: 'fist' });
      }
      return q;
    }
  },

  /* Обратные «снежные ангелы»: лёжа на животе, грудь чуть приподнята, лоб над ковриком, прямые руки ладонями вниз
     ведутся по дуге над ковриком: t=0 — кисти у бёдер, t=0,5 — руки в стороны, t=1 — руки над головой. Лопатки опущены. */
  reversesnow: {
    keys: [0, .125, .25, .375, .5, .625, .75, .875, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 110, at: [0, 0, 15] }],
    contacts: [{ body: 'belly', prop: 'mat' }, { body: 'thL', prop: 'mat' }, { body: 'thR', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, q = prone(C, { lumbar: -4, thoracic: -6, region: 'belly' });
      q.neck = [4, 0, 0];
      proneLegs(C, q, -6);
      const ang = C.lerp(8, 168, t) * C.D2R, lift = SNOW.lift * C.D2R;
      for (const s of S) {
        const g = C.M.SIGN[s];
        q[s].girdle = [-6, -10];
        const dir = [g * Math.sin(ang) * Math.cos(lift), Math.sin(lift), -Math.cos(ang) * Math.cos(lift)];
        armPalmFacing(C, q, s, dir, [0, -1, 0], { el: 4 });
      }
      return q;
    }
  },

  /* «Птица-собака» (замкнутый цикл): на четвереньках; t=0,25 — правая рука вперёд и левая нога назад до линии корпуса,
     t=0,5 — исходное, t=0,75 — левая рука и правая нога, t=1 = t=0. Таз и спина неподвижны. */
  birddog: {
    keys: Array.from({ length: 25 }, (_, i) => i / 24),
    loop: true,
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 75, at: [0, 0, 5] }],
    contacts: [
      { body: 'palmL', prop: 'mat', when: [0, .51] }, { body: 'palmL', prop: 'mat', when: [.99, 1] },
      { body: 'palmR', prop: 'mat', when: [0, .01] }, { body: 'palmR', prop: 'mat', when: [.49, 1] },
      { body: 'kneeR', prop: 'mat', when: [0, .51] }, { body: 'kneeR', prop: 'mat', when: [.99, 1] },
      { body: 'kneeL', prop: 'mat', when: [0, .01] }, { body: 'kneeL', prop: 'mat', when: [.49, 1] },
      { body: 'footR', prop: 'mat', when: [0, .51] }, { body: 'footL', prop: 'mat', when: [.49, 1] }],
    pose(t, C) {
      const { V } = C, L = QUAD(), q = L.body(L.th), { up } = proneAxes(L.th);
      const bump = u => (1 - Math.cos(4 * Math.PI * u)) / 2, w = { R: t < .5 ? bump(t) : 0, L: t >= .5 ? bump(t - .5) : 0 };
      /* перенос веса на опорную диагональ: корпус чуть смещается к опорной руке */
      q.root.p = V.add(q.root.p, [(w.R - w.L) * BIRD.shift, 0, 0]);
      for (const s of S) {
        const g = C.M.SIGN[s], o = s === 'L' ? 'R' : 'L', k = w[o];   /* нога работает в паре с рукой противоположной стороны */
        const K = [g * L.knees + (w.R - w.L) * BIRD.shift, MAT + 5.5, L.kneeZ];
        if (k < .01) { kneelInstep(C, q, s, K); continue; }
        /* нога назад: бедро от вертикали к линии корпуса (чуть ниже), колено выпрямляется */
        const a = C.lerp(0, 90 - L.th - 3, k) * C.D2R, thigh = [0, -Math.cos(a), -Math.sin(a)], kk = Math.max(0, (k - .3) / .7);
        legBent(C, q, s, thigh, C.lerp(100, 3, kk), V.unit([0, .3, -1]), { dorsi: C.lerp(-46, -15, k) });
      }
      for (const s of S) {
        const k = w[s];
        if (k < .01) { C.palm(q, s, V.add(L.palms[s], [(w.R - w.L) * BIRD.shift, 0, 0]), L.fing(s), [0, 1, 0], V.unit(V.add(V.add(V.scale(C.lat(q, s), .5), up, -1), [0, 1, 0], .2))); continue; }
        /* рука вперёд: от вертикали к линии корпуса, большой палец вверх (ладонь внутрь) */
        /* сначала кисть поднимается от коврика ладонью вниз (локоть сгибается назад), затем рука выпрямляется вперёд
           до линии корпуса и поворачивается большим пальцем вверх */
        const gh = C.fk(q).P['gh' + s], g = C.M.SIGN[s], Wfloor = palmWrist(C, s, V.add(L.palms[s], [(w.R - w.L) * BIRD.shift, 0, 0]), L.fing(s), [0, 1, 0]);
        const a = (90 + L.th - 3) * C.D2R, line = [0, -Math.cos(a), Math.sin(a)], Wf = V.add(gh, line, armSpan(C, 5));
        const lift = Math.min(1, k / .12), u = Math.max(0, (k - .12) / .88);
        const W = V.mix(V.add(Wfloor, [0, 1, 0], 9 * lift), Wf, u);
        const fingers = V.unit(V.mix(L.fing(s), line, u)), palm = V.unit(V.mix([0, -1, 0], [-g, 0, 0], u));
        const M3 = C.M.M3, d = fingers, upn = V.scale(V.unit(V.perp(palm, d)), -1), x = V.scale(upn, g), y = V.scale(d, -1);
        const pole = V.unit(V.mix(V.unit(V.add(V.add(V.scale(up, -1), [g, 0, 0], .5), [0, 1, 0], .3)), [g * .3, -1, 0], u));
        C.M.solveArmWrist(q, s, W, pole, M3.cols(x, y, V.cross(x, y)));
        q.hands[s] = 'flat';
      }
      return q;
    }
  },

  /* Выкатывание ролика с колен. eccFirst: t=0 — колени на коврике, ролик под плечами на прямых руках, поясница слегка
     округлена; t=1 — тело вытянуто от колен до кистей, поясница ровная (без провиса), ролик катится по коврику. */
  rollout: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 220, width: 75, at: [0, 0, 20] }, { type: 'abWheel', id: 'wheel', r: WHEEL_R }],
    contacts: [{ body: 'kneeL', prop: 'mat' }, { body: 'kneeR', prop: 'mat' }, { body: 'footL', prop: 'mat' }, { body: 'footR', prop: 'mat' },
      { body: 'gripL', prop: 'wheel' }, { body: 'gripR', prop: 'wheel' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = ROLL();
      const q = rolloutBody(C, C.lerp(0, ROLLOUT.phi1, e), C.lerp(L.hip0, ROLLOUT.hip1, e), { lumbar: C.lerp(10, 3, e), thoracic: C.lerp(8, 2, e) });
      for (const s of S) q[s].girdle = [C.lerp(0, 14, e), C.lerp(8, 4, e)];
      /* ролик: впереди, на расстоянии почти прямой руки от плеча */
      const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), y = MAT + WHEEL_R, reach = armSpan(C, C.lerp(L.el0, 4, e)) + 7.6;
      const z = gh[2] + Math.sqrt(Math.max(0, reach * reach - (gh[1] - y) ** 2 - (Math.abs(f.P.ghL[0]) - GRIP_X) ** 2));
      for (const s of S) {
        const lat = C.lat(q, s), prefer = V.add(V.add([0, 1, 0], [0, 0, -1], C.lerp(1.2, .2, e)), lat, 1);
        gripAuto(C, q, s, [C.M.SIGN[s] * GRIP_X, y, z], V.scale([C.M.SIGN[s], 0, 0], -1), prefer);
      }
      return q;
    }
  },

  /* Планка с подъёмом на руки (замкнутый цикл, ведёт ПРАВАЯ рука и вверх, и вниз):
     t=0 — планка на предплечьях; 0,125 — правая рука переносится к ладони (вес на левом предплечье);
     0,25 — правая на ладони, левая на предплечье; 0,375 — левая переносится; 0,5 — упор на прямых руках;
     0,625 — правая переносится к предплечью; 0,75 — правая на предплечье, левая на ладони; 0,875 — левая; t=1 = t=0.
     Таз не раскачивается: крен только плечевого пояса (разная высота плеч), при переносе руки — небольшой перенос веса. */
  plankup: {
    keys: Array.from({ length: 17 }, (_, i) => i / 16),
    loop: true,
    equipment: PUSH_MAT,
    contacts: [{ body: 'footL', prop: 'mat' }, { body: 'footR', prop: 'mat' },
      { body: 'faL', prop: 'mat', when: [0, .32] }, { body: 'faL', prop: 'mat', when: [.99, 1] }, { body: 'palmL', prop: 'mat', when: [.43, .82] },
      { body: 'faR', prop: 'mat', when: [0, .07] }, { body: 'faR', prop: 'mat', when: [.68, 1] }, { body: 'palmR', prop: 'mat', when: [.18, .57] }],
    pose(t, C) {
      const { V } = C, L = PLANKUP(), i = Math.round(t * 16) % 16, sh = PLANKUP_SHIFT;
      /* ключи: состояние рук (F — предплечье, P — ладонь, A — перенос: u — доля пути от F к P), перенос веса (yaw) */
      const K = [
        { R: 'F', L: 'F', yaw: 0 }, { R: 'F', L: 'F', yaw: sh }, { R: ['A', .5], L: 'F', yaw: sh }, { R: 'P', L: 'F', yaw: sh },
        { R: 'P', L: 'F', yaw: 0 }, { R: 'P', L: 'F', yaw: -sh }, { R: 'P', L: ['A', .5], yaw: -sh }, { R: 'P', L: 'P', yaw: -sh },
        { R: 'P', L: 'P', yaw: 0 }, { R: 'P', L: 'P', yaw: sh }, { R: ['A', .5], L: 'P', yaw: sh }, { R: 'F', L: 'P', yaw: sh },
        { R: 'F', L: 'P', yaw: 0 }, { R: 'F', L: 'P', yaw: -sh }, { R: 'F', L: ['A', .5], yaw: -sh }, { R: 'F', L: 'F', yaw: -sh }][i];
      const st = { R: Array.isArray(K.R) ? 'A' : K.R, L: Array.isArray(K.L) ? 'A' : K.L };
      /* начальный крен: ладонь выше предплечья — крен в сторону предплечья */
      const ra = PLANKUP_ROLL, half = st.R !== st.L && st.R !== 'A' && st.L !== 'A', r0 = half ? (st.R === 'P' ? -35 : 35) : st.R === 'A' ? (st.L === 'F' ? -ra : ra) : st.L === 'A' ? (st.R === 'F' ? ra : -ra) : 0;
      const sol = L.solve(st, K.yaw, r0), q = L.body(sol.th, sol.roll, sol.yaw);
      for (const s of S) {
        const lat = C.lat(q, s), { up } = proneAxes(sol.th);
        if (st[s] === 'F') { q[s].girdle = [-2, 8]; const f = L.fore[s]; C.armTo(q, s, f.W, V.unit(V.sub(f.E, V.mix(C.fk(q).P['gh' + s], f.W, .5))), { pron: 15, wrist: [0, 0], mode: 'fist' }); }
        else if (st[s] === 'P') { q[s].girdle = [-6.5, 3.2]; palmAuto(C, q, s, L.top.palms[s], L.top.fingers(s), [0, 1, 0], V.unit(V.add(V.add(V.scale(lat, 2), [0, 1, 0], .2), up, -1.13)), .9); }
        else {
          /* перенос: кисть над ковриком между кулаком предплечья и местом ладони; локоть вверх-назад-наружу */
          const u = (s === 'R' ? K.R : K.L)[1];
          q[s].girdle = [-4, 5];
          const W = V.add(V.mix(L.fore[s].W, L.palmW(s), u), [0, 1, 0], 11);
          C.armTo(q, s, W, V.unit([C.M.SIGN[s] * .3, .2, -1]), { pron: 35, wrist: [-25, 0], mode: 'relaxed' });
        }
      }
      return q;
    }
  },

  /* Планка на предплечьях (удержание, показывается t=0): локти под плечами, предплечья на коврике, кулаки,
     тело — прямая линия от пяток до макушки, стопы на носках. */
  plank: {
    keys: [0],
    equipment: PUSH_MAT,
    contacts: [{ body: 'faL', prop: 'mat' }, { body: 'faR', prop: 'mat' }, { body: 'footL', prop: 'mat' }, { body: 'footR', prop: 'mat' }],
    pose(t, C) {
      const q = proneOnToes(C, { theta: PLANK().theta, ballZ: -72 });
      for (const s of S) { q[s].girdle = [-2, 8]; forearmOnMat(C, q, s); }
      return q;
    }
  },

  /* Боковая планка (удержание, t=0): опора на правое предплечье и ребро правой стопы. */
  sideplank: {
    keys: [0],
    equipment: [{ type: 'mat', id: 'mat', len: 190, width: 80, at: [10, 0, 0] }],
    contacts: [{ body: 'faR', prop: 'mat' }, { body: 'footR', prop: 'mat' }],
    pose(t, C) {
      const { V } = C, q = sidePlankBody(C, SIDEPLANK().theta);
      q.R.girdle = [-6, 2]; q.L.girdle = [8, 0];
      /* опора: нижняя точка правой стопы на коврике, правое плечо над локтем */
      const low = lowestFoot(C, q, 'R'); q.root.p = V.add(q.root.p, [0, MAT - .3 - low, 0]);
      const f = C.fk(q), gh = f.P.ghR, E = [gh[0], MAT + ELBOW_H, gh[2]], a = 25 * C.D2R, dy = WRIST_H - ELBOW_H, h = Math.sqrt(C.M.B.fa ** 2 - dy * dy);
      const W = V.add(E, [Math.cos(a) * h, dy, Math.sin(a) * h]);
      C.armTo(q, 'R', W, V.unit(V.sub(E, V.mix(gh, W, .5))), { pron: 10, wrist: [0, 0], mode: 'fist' });
      const T = C.axes(q, 'thorax'), ghL = C.fk(q).P.ghL;
      C.armTo(q, 'L', V.add(ghL, T.x, 55.1), V.scale(T.z, -1), { pron: 0, wrist: [0, 0], mode: 'relaxed' });
      return q;
    }
  },

  /* Отжимания от пола. eccFirst: t=0 — верх (руки почти прямые), t=1 — грудь в 3 см от коврика. */
  pushup: {
    keys: [0, .25, .5, .75, 1],
    equipment: PUSH_MAT,
    contacts: PUSH_CONTACTS,
    pose(t, C) { return pushPose(C, PUSH(), C.ease(t)); }
  },

  /* Отжимания узким хватом. eccFirst: t=0 — верх, t=1 — грудь у кистей, локти идут назад вдоль корпуса. */
  diamond: {
    keys: [0, .25, .5, .75, 1],
    equipment: PUSH_MAT,
    contacts: PUSH_CONTACTS,
    pose(t, C) { return pushPose(C, DIAMOND(), C.ease(t)); }
  },

  /* Отжимания с колен: колени и голени на коврике, линия колено–таз–макушка прямая.
     Рабочая фаза — выжимание: t=0 — грудь у коврика, t=1 — руки почти прямые. */
  kneepush: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 180, width: 75, at: [0, 0, 18] }],
    contacts: [{ body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' }, { body: 'kneeL', prop: 'mat' }, { body: 'kneeR', prop: 'mat' }],
    pose(t, C) { return pushPose(C, KNEEPUSH(), 1 - C.ease(t)); }
  },

  /* Отжимания широким хватом: ладони в полтора раза шире плеч, пальцы чуть наружу, локти в стороны, но не выше плеч.
     Рабочая фаза — выжимание: t=0 — грудь в 4 см от коврика, t=1 — руки почти прямые. */
  widepush: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 100, at: [0, 0, 8] }],
    contacts: PUSH_CONTACTS,
    pose(t, C) { return pushPose(C, WIDEPUSH(), 1 - C.ease(t)); }
  },

  /* Отжимания «лучник»: работает ПРАВАЯ рука. Рабочая фаза — выжимание в центр:
     t=0 — грудь у правой ладони, левая рука выпрямлена в сторону; t=1 — обе руки почти прямые, корпус по центру. */
  archer: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 200, width: 140, at: [8, 0, 8] }],
    contacts: PUSH_CONTACTS,
    pose(t, C) { return pushPose(C, ARCHER(), 1 - C.ease(t)); }
  }
};
