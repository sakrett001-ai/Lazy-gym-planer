'use strict';
/* Группа G2: гантели и гири (со скамьями и без). Ось Z — вперёд от атлета (или вдоль скамьи), X — влево, Y — вверх, см.
   Порядок построения позы: корпус → опора (скамья, пол) → стопы → кисти со снарядом → равновесие с массой снарядов. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const DB_KG = 10, KB_KG = 16;

/* ---------- Локальные помощники ---------- */
/* таз с наклоном корпуса вперёд на deg (сгибание в тазобедренных) */
function pelvisLean(C, q, p, deg, yaw = 0) {
  const a = deg * C.D2R, y = yaw * C.D2R, f = [Math.sin(y), 0, Math.cos(y)];
  return C.root(q, p, [f[0] * Math.sin(a), Math.cos(a), f[2] * Math.sin(a)], [f[0] * Math.cos(a), -Math.sin(a), f[2] * Math.cos(a)]);
}
/* стопа на полу: голеностоп над точкой ankle (x, z), носок развёрнут наружу на toeOut°, колено — по носку */
function plant(C, q, s, ankle, { toeOut = 7, heel = 0, y = 0, pole, fwd: f0 } = {}) {
  const { V } = C, g = C.M.SIGN[s], a = g * toeOut * C.D2R, fwd = f0 || [Math.sin(a), 0, Math.cos(a)];
  const sup = [ankle[0] + fwd[0] * 13.5, y, ankle[2] + fwd[2] * 13.5];
  return C.foot(q, s, sup, 0, pole || V.unit([fwd[0] + g * .15, 0, fwd[2]]), { forward: fwd, heel });
}
/* Равновесие стоя: центр масс (с гантелями) держится в «комфортной» зоне над стопами [lo, hi] по Z и |x| ≤ xTol;
   таз сдвигается только если центр масс выходит из зоны — так нет лишней раскачки корпуса. */
function settle(C, q, { lo, hi, x = 0, xTol = 1.5, loads = () => [], resolve = () => {} }) {
  for (let i = 0; i < 6; i++) {
    resolve(q); const c = C.com(q, loads(q));
    const dz = c[2] < lo ? lo - c[2] : c[2] > hi ? hi - c[2] : 0, dx = Math.abs(c[0] - x) > xTol ? x + Math.sign(c[0] - x) * xTol - c[0] : 0;
    if (Math.hypot(dx, dz) < .15) break; q.root.p = C.V.add(q.root.p, [dx, 0, dz]);
  }
  resolve(q); return q;
}
/* масса гантелей в кистях для равновесия */
const loadsIn = (C, hands, kg = DB_KG) => q => { const f = C.fk(q); return hands.map(s => [f.P['grip' + s], kg]); };
/* рука углами: плечо [сгибание, отведение, ротация], локоть, пронация; кисть — хват снаряда */
function armAngles(q, s, shoulder, elbow, pron, wrist = [0, 0]) {
  q[s].shoulder = [...shoulder]; q[s].elbow = elbow; q[s].pron = pron; q[s].wrist = [...wrist];
  q.hands = { ...(q.hands || {}), [s]: 'grip' };
}
/* свободная рука в расслабленном положении вдоль тела */
function relaxArm(q, s, shoulder = [4, 8, 0], elbow = 10) { q[s].shoulder = [...shoulder]; q[s].elbow = elbow; q[s].pron = 0; q[s].wrist = [0, 0]; q.hands = { ...(q.hands || {}), [s]: 'relaxed' }; }

/* Гантель в кисти с заданной осью: подбирается пронация (−88…84°), чтобы ось рукояти (линия «мизинец → большой палец»)
   шла по axis; signed — учитывать направление большого пальца (иначе ось без знака). */
function holdDir(C, q, s, point, pole, axis, { flex = 0, dev = 0, lo = -88, hi = 84, signed = false } = {}) {
  const { V } = C, ax = V.unit(axis);
  const score = p => { C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true }); const d = V.dot(C.M3.col(C.fk(q).F['hand' + s].R, 2), ax); return signed ? d : Math.abs(d); };
  let best = lo, bv = -Infinity;
  for (let p = lo; p <= hi + 1e-9; p += 4) { const v = score(p); if (v > bv) { bv = v; best = p; } }
  let a = Math.max(lo, best - 4), b = Math.min(hi, best + 4);
  for (let i = 0; i < 18; i++) { const m1 = a + (b - a) * .382, m2 = a + (b - a) * .618; if (score(m1) >= score(m2)) b = m2; else a = m1; }
  const p = (a + b) / 2; for (let k = 0; k < 3; k++) C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true }); C.hold(q, s, point, pole, { pron: p, flex, dev }); return p;
}
/* Лёжа на горизонтальной скамье (как в пилотном жиме): голова к +Z, лопатки и ягодицы на подушке, стопы на полу */
function lieOnBench(C, q, { top = 44, z = -24, arch = 1 } = {}) {
  const { V } = C;
  C.root(q, [0, top + 18, z], [0, 0, 1], [0, 1, 0]);
  q.lumbar = [-5 * arch, 0, 0]; q.thoracic = [-8 * arch, 0, 0];
  for (const s of S) q[s].girdle = [-4, -12];
  C.restOn2(q, 'upperBack', 'buttocks', [0, top, 0], [0, 1, 0], -1.2);
  C.neckTo(q, 'headBack', [0, top, 0], [0, 1, 0], -.5);
  for (const s of S) {
    const lat = C.latP(q, s), fwd = V.unit(V.add([0, 0, -1], lat, .3));
    C.foot(q, s, V.add([0, 0, z - 54], lat, 27), 0, V.unit(V.add([0, .5, -1], lat, .5)), { forward: fwd });
  }
  return q;
}

/* Две опоры одновременно (сиденье и спинка): сдвиг таза в плоскости нормалей, чтобы обе области легли на свои плоскости */
function restOnTwo(C, q, a, pa, na, ga, b, pb, nb, gb) {
  const { V } = C, A = V.unit(na), B = V.unit(nb);
  const md = (r, p, n) => Math.min(...C.region(q, r).map(x => V.dot(V.sub(x, p), n)));
  for (let i = 0; i < 3; i++) {
    const ea = ga - md(a, pa, A), eb = gb - md(b, pb, B), ab = V.dot(A, B), det = 1 - ab * ab;
    const ka = (ea - ab * eb) / det, kb = (eb - ab * ea) / det; /* d = ka·A + kb·B: d·A = ea, d·B = eb */
    q.root.p = V.add(V.add(q.root.p, A, ka), B, kb);
    if (Math.abs(ea) < .05 && Math.abs(eb) < .05) break;
  }
  return q;
}
/* Сидя на регулируемой скамье спиной к спинке: ягодицы на сиденье, спина на спинке, стопы на полу перед собой */
function sitOnAdj(C, q, { id = 'bench', lumbar = 0, thoracic = 0, hip = 80, abd = 9, rot = 8, feetZ = -14, feetX = 24, girdle = [0, 0] } = {}) {
  const { V, M } = C, bp = C.frame(id, 'backPad'), sp = C.frame(id, 'seatPad'), by = M.M3.col(bp.R, 1), bz = M.M3.col(bp.R, 2);
  C.root(q, [0, 58, -10], bz, by);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thoracic, 0, 0];
  for (const s of S) { q[s].hip = [hip, abd, rot]; q[s].knee = 90; q[s].girdle = [...girdle]; }
  restOnTwo(C, q, 'buttocks', sp.o, M.M3.col(sp.R, 1), -1.4, 'back', bp.o, by, -1.0);
  for (const s of S) {
    const f = C.fk(q), kn = f.P['kn' + s], g = M.SIGN[s], fwd = V.unit([-g * .18 * 0 + C.lat(q, s)[0] * .2, 0, -1]);
    C.foot(q, s, [kn[0] + C.lat(q, s)[0] * 4, 0, kn[2] + feetZ], 0, V.unit(V.add([0, .2, -1], C.lat(q, s), .35)), { forward: fwd });
  }
  return q;
}

/* Скамья для жимов сидя: регулируемая (спинка 84°) — если есть наклонная; иначе — сидя на краю горизонтальной (высота 45) */
const SEAT_BENCHES = [{ type: 'adjBench', id: 'bench', back: 84, seat: 4, optional: 'incline' }, { type: 'flatBench', id: 'flat', height: 45, at: [0, 0, 31], optionalNot: 'incline' }];
const SEAT_CONTACTS = [{ body: 'back', prop: 'bench:back', optional: true }, { body: 'buttocks', prop: 'bench:seat', optional: true }, { body: 'buttocks', prop: 'flat:pad', optional: true }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }];
/* направление по дуге между единичными векторами a → b (через c, если задан) */
function arc(C, a, b, u, c) {
  const { V } = C, sl = (x, y, k) => { const d = Math.max(-1, Math.min(1, V.dot(x, y))), w = Math.acos(d); if (w < 1e-4) return x; return V.add(V.scale(x, Math.sin((1 - k) * w) / Math.sin(w)), y, Math.sin(k * w) / Math.sin(w)); };
  if (!c) return V.unit(sl(V.unit(a), V.unit(b), u));
  return u < .5 ? V.unit(sl(V.unit(a), V.unit(c), u * 2)) : V.unit(sl(V.unit(c), V.unit(b), u * 2 - 1));
}

/* Ладонь на опоре с подбором разворота пальцев (вокруг нормали опоры) и направления локтя:
   из вариантов берётся тот, где пронация, запястье и ротация плеча дальше всего от границ подвижности. */
const romPen = (q, s) => { const k = (x, lim) => Math.max(0, x - lim) ** 2, p = q[s].pron, [wf, wd] = q[s].wrist, tw = q[s].shoulder[2]; return k(Math.abs(p), 72) + k(-wf, 62) + k(wf, 62) + k(wd, 14) + k(-wd, 22) + k(tw, 82) + k(-tw, 68); };
function palmBest(C, q, s, point, up, fingersList, poles, extra) {
  let best = null, bv = Infinity;
  for (const pl of poles) for (const fg of fingersList) { C.palm(q, s, point, fg, up, pl); const v = romPen(q, s) + (extra ? extra(q, s) : 0); if (v < bv) { bv = v; best = [fg, pl]; } }
  C.palm(q, s, point, best[0], up, best[1]); return bv;
}
/* направления в плоскости с нормалью n: base, повёрнутый на 0…360° с шагом step */
function fan(C, n, base, step = 20) { const { V } = C, N = V.unit(n), b = V.unit(V.perp(base, N)), c = V.cross(N, b), out = []; for (let a = 0; a < 360; a += step) { const r = a * C.D2R; out.push(V.add(V.scale(b, Math.cos(r)), c, Math.sin(r))); } return out; }
/* Гантель в ладонях (хват за верхний диск, тип g2CupDumbbell): P — центр внутренней грани верхнего диска,
   n — ось гантели (от рукояти к верхнему диску), fingers — базовое направление пальцев в плоскости диска.
   Ладони лежат на диске «внахлёст»: каждая смещена на w в свою сторону и на stag вдоль пальцев (одна кисть впереди,
   другая позади рукояти), пальцы повёрнуты к середине на yaw° — большие и указательные пальцы охватывают рукоять. */
function cup(C, q, P, n, fingers, { w = 4, stag = 4.4, yaw = [0, 90], pole, poles, prefer, cands, prev, lam = 0 } = {}) {
  const { V } = C, N = V.unit(n), F = V.unit(V.perp(fingers, N)), side = V.unit(V.cross(N, F)), chosen = {};
  /* штраф за выход пронации, запястья и ротации плеча к границам подвижности */
  const k = (x, lim) => Math.max(0, x - lim) ** 2;
  const pen = s => { const p = q[s].pron, [wf, wd] = q[s].wrist, tw = q[s].shoulder[2]; return k(Math.abs(p), 72) + k(-wf, 62) + k(wf, 62) + k(wd, 14) + k(-wd, 22) + k(tw, 82) + k(-tw, 68); };
  for (const s of S) {
    const lat = C.lat(q, s), sg = V.dot(side, lat) >= 0 ? 1 : -1, med = V.scale(side, -sg);
    const put = (yw, pl) => { const y = yw * C.D2R; C.palm(q, s, V.add(V.add(P, side, sg * w), F, sg * stag), V.unit(V.add(V.scale(F, Math.cos(y)), med, Math.sin(y))), V.scale(N, -1), pl); return pen(s) + (prefer ? prefer(q, s) : 0); };
    if (cands) {
      /* явные варианты {yaw, pole(s, lat), key}; lam — штраф за отход от варианта предыдущего ключа (непрерывность) */
      let best = null, bv = Infinity;
      for (const c of cands(s)) { const v = put(c.yaw, c.pole(s, lat)) + (prev && prev[s] ? lam * c.dist(prev[s]) : 0); if (v < bv) { bv = v; best = c; } }
      put(best.yaw, best.pole(s, lat)); chosen[s] = best; continue;
    }
    const cl = poles ? poles.map(f => f(s, lat)) : [pole ? pole(s, lat) : V.unit(V.add(lat, [0, -1, 0], .3))];
    const yv = typeof yaw === 'function' ? yaw(s) : yaw, [lo, hi] = Array.isArray(yv) ? yv : [yv, yv];
    let best = [lo, cl[0]], bv = Infinity;
    for (const pl of cl) for (let yw = lo; yw <= hi + 1e-9; yw += 5) { const v = put(yw, pl) + 1e-4 * Math.abs(yw - (lo + hi) / 2); if (v < bv) { bv = v; best = [yw, pl]; } }
    put(...best);
  }
  return chosen;
}
const CUP_CONTACTS = [{ body: 'palmL', prop: 'cup:top' }, { body: 'palmR', prop: 'cup:top' }];

/* Гантели по желанию (optional 'db') в опущенных руках, нейтральный хват */
const DB_OPT = [{ type: 'dumbbell', id: 'dbL', hand: 'L', optional: 'db' }, { type: 'dumbbell', id: 'dbR', hand: 'R', optional: 'db' }];
const DB_OPT_CONTACTS = [{ body: 'gripL', prop: 'dbL', optional: true }, { body: 'gripR', prop: 'dbR', optional: true }];
function hangArms(C, q, { abd = 12, flex = 2, elbow = 8 } = {}) { for (const s of S) { q[s].girdle = [-2, -3]; armAngles(q, s, [flex, abd, 0], elbow, 0); } }
/* задняя стопа на подушечке: подъём пятки подбирается так, чтобы бедро задней ноги было под нужным углом
   (hipFlex — сгибание в тазобедренном, отрицательное — разгибание), а голеностоп оставался в физиологических пределах */
function rearFoot(C, q, s, ball, { hipFlex = -4, lo = 10, hi = 79, pole = [0, 0, 1], fwd = [0, 0, 1] } = {}) {
  let best = lo, bv = Infinity;
  for (let h = lo; h <= hi; h += 2.5) {
    try { C.foot(q, s, ball, 0, pole, { forward: fwd, heel: h }); } catch (e) { continue; }
    const d = q[s].ankle[0], v = Math.abs(q[s].hip[0] - hipFlex) + 3 * Math.max(0, d - 12) + 3 * Math.max(0, -46 - d);
    if (v < bv) { bv = v; best = h; }
  }
  C.foot(q, s, ball, 0, pole, { forward: fwd, heel: best }); return best;
}
/* Стопа подъёмом на опоре (болгарские выпады): носок назад и вниз под углом phi, нижняя точка тыла стопы и пальцев
   касается плоскости опоры на высоте top; ankleZ — положение голеностопа по Z; squash — поджатие подушки */
function instepOn(C, q, s, x, ankleZ, top, phi, pole, squash = 1) {
  const { V, M } = C, a = phi * C.D2R, zf = [0, -Math.sin(a), -Math.cos(a)], yf = [0, -Math.cos(a), Math.sin(a)];
  const R = M.M3.cols(V.cross(yf, zf), yf, zf);
  /* голеностоп ставится так, чтобы нижняя точка стопы (у босой стопы — тыл большого пальца, он сбоку от оси)
     касалась опоры; стопа после решения ноги может слегка повернуться, поэтому высота уточняется по факту */
  let y = top - Math.min(...M.footPoints(s).map(({ p }) => M.M3.v(R, p)[1])) - squash, r;
  for (let i = 0; i < 4; i++) {
    r = M.solveLeg(q, s, { o: [x, y, ankleZ], R, toesR: R }, pole);
    const f = C.fk(q), low = Math.min(...M.footPoints(s).map(fp => M.footPointWorld(f.F['foot' + s], f.F['toes' + s], fp)[1])), d = top - squash - low;
    if (Math.abs(d) < .05) break; y += d;
  }
  if (r.reachError > .05) throw Error(`Нога ${s} не дотягивается до скамьи: ${r.reachError.toFixed(1)} см`);
  return r;
}

/* Разгибание из-за головы: поза одного ключа; prev — варианты хвата предыдущего ключа */
function ohextKey(t, C, prev) {
  const { V } = C, q = C.base(), e = C.ease(t);
  C.root(q, [0, 94.2, 0], [0, 1, 0], [0, 0, 1]); q.lumbar = [1, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [C.lerp(4, 10, e), 0, 0];
  const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 11, 0, -1]); };
  for (const s of S) q[s].girdle = [C.lerp(26, 22, e), C.lerp(2, 0, e)];
  const cands = [];
  for (let yw = 20; yw <= 90; yw += 5) for (const fz of [-.4, 0, .3, .6, 1, 1.6]) for (const lx of [1, .4, -.2])
    cands.push({ yaw: yw, fz, lx, pole: (s, lat) => V.unit(V.add(V.add(V.scale(lat, lx), [0, 1, 0], C.lerp(.2, 4, e)), [0, 0, 1], fz)), dist: o => Math.abs(yw - o.yaw) / 10 + Math.abs(fz - o.fz) * 2 + Math.abs(lx - o.lx) * 2 });
  let chosen = null;
  const arms = q => {
    const f = C.fk(q), head = f.P.head, gh = V.mix(f.P.ghL, f.P.ghR, .5);
    /* верхний диск идёт по дуге вокруг локтей: над головой → за затылок */
    const E = [0, gh[1] + 27, head[2] + 2], th = C.lerp(-15.6, 96, Math.pow(e, .8)) * C.D2R, r = e < .5 ? 26 + 2 * Math.sin(Math.PI * e) : C.lerp(26, 20, (e - .5) * 2);
    const P = V.add(E, [0, Math.cos(th), -Math.sin(th)], r), tilt = C.lerp(18, 12, e) * C.D2R;
    chosen = cup(C, q, P, [0, Math.cos(tilt), Math.sin(tilt)], [0, 0, -1], { w: 4.8, cands: () => cands, prev, lam: 25,
      prefer: (q, s) => { const el = C.fk(q).P['el' + s]; return 1.2 * Math.max(0, Math.abs(el[0]) - 11) ** 2; } });
  };
  settle(C, q, { lo: 1, hi: 7, loads: q => [[C.fk(q).P.gripL, 12]], resolve: q => { feet(q); arms(q); } });
  return { q, chosen };
}

module.exports = {

  /* Разгибание руки с гантелью в наклоне (левая рука): правые колено и ладонь на скамье, левая стопа на полу,
     корпус почти параллелен полу; плечо рабочей руки прижато к корпусу и параллельно полу.
     t=0 — локоть ~80° (предплечье почти вертикально), t=1 — рука выпрямлена назад; хват нейтральный.
     Плечо отведено от корпуса на ~20°, чтобы гантель проходила сбоку от таза и бедра опорной ноги. */
  kickback: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'dumbbell', id: 'db', hand: 'L' }],
    contacts: [{ body: 'kneeR', prop: 'bench:pad' }, { body: 'palmR', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'gripL', prop: 'db' }],
    gripRadius: { L: 1.6, R: 1.4 },
    pose(t, C) {
      const { V } = C, q = C.base(), e = C.ease(t), a = 4 * C.D2R;
      C.root(q, [9, 92, -20], [0, Math.sin(a), Math.cos(a)], [0, -Math.cos(a), Math.sin(a)]);
      q.thoracic = [-3, 0, 0]; q.lumbar = [0, 0, 0]; q.neck = [-10, 0, 0];
      q.L.girdle = [-2, -8]; q.R.girdle = [0, 4];
      C.rootAtHip(q, 'R', [-1, 44 + 5.4 + 42.4, -24]);
      C.kneel(q, 'R', [-1, 44, -24], [0, 0, -1], [0, 1, 0], { toes: 'flat', plantar: 44 });
      let f = C.fk(q);
      palmBest(C, q, 'R', [f.P.ghR[0] + 4, 44, f.P.ghR[2] + 12], [0, 1, 0], fan(C, [0, 1, 0], [.9, 0, 1], 10).filter(v => v[2] > .3), [[-.4, 0, -1], [-.6, .2, -1], [-.2, 0, -1], [-.8, 0, -.6]].map(v => V.unit(v)));
      C.foot(q, 'L', [22, 0, -23], 0, V.unit([.3, 0, 1]), { forward: V.unit([.22, 0, 1]) });
      f = C.fk(q);
      const gh = f.P.ghL, lat = C.lat(q, 'L'), back = [0, 0, -1];
      /* плечо назад вдоль корпуса, параллельно полу, чуть в сторону от корпуса */
      const E = V.add(gh, V.unit(V.add(V.scale(back, 27.9), lat, 10)), 27.9);
      const ph = C.lerp(78, 4, e) * C.D2R, d = V.unit(V.add(V.scale(back, Math.cos(ph)), [0, -1, 0], Math.sin(ph))), grip = V.add(E, d, 35.3);
      holdDir(C, q, 'L', grip, V.unit(V.add([0, 1, 0], lat, .35)), V.cross(lat, d));
      return q;
    }
  },

  /* Концентрированный подъём на бицепс (левая рука): сидя на скамье, ноги широко, корпус наклонён вперёд,
     задняя поверхность плеча у локтя упирается во внутреннюю поверхность левого бедра; правая ладонь на правом бедре.
     t=0 — рука выпрямлена (гантель между ног), t=1 — гантель у плеча; плечо неподвижно, хват снизу. */
  concentration: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', yaw: 90, at: [0, 0, -6] }, { type: 'dumbbell', id: 'dbL', hand: 'L' }],
    contacts: [{ body: 'buttocks', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }],
    gripRadius: { L: 1.6, R: 1.4 },
    pose(t, C) {
      const { V, M } = C, e = C.ease(t);
      /* посадка: ноги широко; наклон корпуса подбирается так, чтобы локоть (плечо висит вертикально)
         пришёлся на внутреннюю поверхность левого бедра у колена */
      const seat = lean => {
        const q = C.base();
        pelvisLean(C, q, [0, 56, 0], lean * .55);
        q.lumbar = [lean * .2, 0, 4]; q.thoracic = [lean * .25, -2, 12]; q.neck = [-lean * .75, 0, -8];
        for (const s of S) { q[s].hip = [88, 26, 6]; q[s].knee = 90; }
        for (let i = 0; i < 2; i++) {
          C.restOn(q, 'buttocks', [0, 44, 0], [0, 1, 0], -1.4);
          for (const s of S) { const f = C.fk(q), kn = f.P['kn' + s], g = M.SIGN[s]; plant(C, q, s, [kn[0] + g * 4, 0, kn[2] + 3], { toeOut: 14 }); }
        }
        return q;
      };
      const elbowOf = q => { const f = C.fk(q); return V.add(V.add(f.P.ghL, [0, -1, 0], 27), [-1, 0, 0], 8.5); };
      const along = q => { const f = C.fk(q), a = f.P.hipL, b = f.P.knL, ab = V.sub(b, a); return V.dot(V.sub(elbowOf(q), a), ab) / V.dot(ab, ab); };
      const lean = C.solve1D(l => along(seat(l)) - .8, 15, 60);
      const q = seat(lean);
      const f = C.fk(q), gh = f.P.ghL, E = elbowOf(q);
      const u = V.unit(V.add(V.sub(E, gh), [-1, 0, 0], 6)), w = V.unit(V.perp(V.sub(V.add(gh, [3, 0, 16]), E), u)), phi = C.lerp(10, 114, e) * C.D2R;
      const d = V.unit(V.add(V.scale(u, Math.cos(phi)), w, Math.sin(phi))), grip = V.add(E, d, 35.6);
      q.L.girdle = [0, 8];
      C.hold(q, 'L', grip, V.unit(V.add(V.sub(E, V.mix(gh, grip, .5)), [1, 0, 0], .3)), { pron: C.lerp(-45, -86, e * e) });
      /* правая рука: ладонь на правом бедре над коленом */
      const g2 = C.fk(q), knR = g2.P.knR, hipR = g2.P.hipR, tR = V.unit(V.sub(knR, hipR));
      palmBest(C, q, 'R', V.add(V.add(hipR, tR, 41), [0, 1, 0], 7.6), [0, 1, 0], fan(C, [0, 1, 0], tR, 20), [[-1, .3, -.3], [-1, 0, 0], [-1, .5, .3], [-.5, .3, -1]].map(v => V.unit(v)));
      return q;
    }
  },



  /* Пуловер с гантелью лёжа вдоль скамьи (голова у края): гантель вертикально, ладони под верхним диском.
     eccFirst: t=0 — гантель над грудью на почти прямых руках, t=1 — гантель опущена по дуге за голову
     (за торцом скамьи), локти слегка согнуты, поясница без прогиба. */
  pullover: {
    keys: Array.from({ length: 13 }, (_, i) => i / 12),
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'g2CupDumbbell', id: 'cup', hands: ['L', 'R'] }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, ...CUP_CONTACTS],
    pose(t, C) {
      const { V } = C, q = lieOnBench(C, C.base(), { arch: .6 }), e = C.ease(t);
      for (const s of S) q[s].girdle = [C.lerp(-2, 10, e), C.lerp(6, -4, e)];
      const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), th = C.lerp(14, 84, e) * C.D2R;
      const P = V.add(gh, [0, Math.cos(th), Math.sin(th)], 50);
      /* плавная раскладка: локти от «наружу» к «наружу-вниз-к ногам», пальцы от «к середине» к диагонали */
      const k = Math.min(1, e / .35), m = Math.max(0, (e - .65) / .35), yw = C.lerp(80, 45, k);
      cup(C, q, P, [0, 1, 0], [0, 0, 1], { w: 4.8, yaw: [yw, yw], poles: [(s, lat) => V.unit(V.add(V.add(lat, [0, 1, 0], -.6 * k * (1 - (s === 'L' ? 1 : .3) * m)), [0, 0, 1], -.6 * k - .4 * m))] });
      return q;
    }
  },

  /* Румынская тяга на одной ноге: опорная левая (колено мягкое), гантель в правой руке (по желанию, optional 'db').
     t=0 — стоя на левой, правая стопа чуть позади над полом; t=1 — наклон с прямой спиной до почти горизонтали,
     свободная нога отведена назад — корпус и нога одной линией, таз не раскрывается. */
  sllift: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [{ type: 'dumbbell', id: 'dbR', hand: 'R', optional: 'db' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'gripR', prop: 'dbR', optional: true }],
    gripRadius: { L: 1.4, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), e = C.ease(t), lean = C.lerp(2, 76, e), ankL = [4, 0, 0];
      pelvisLean(C, q, [-4, C.lerp(93.3, 91, e), C.lerp(0, -16, e)], lean * .9); q.lumbar = [lean * .03, 0, 0]; q.thoracic = [lean * .05, 0, 0]; q.neck = [-lean * .45, 0, 0];
      for (const s of S) q[s].girdle = [0, C.lerp(0, 6, e)];
      const pose2 = q => {
        plant(C, q, 'L', ankL, { toeOut: 5, pole: [.05, 0, 1] });
        const f = C.fk(q), P = C.axes(q, 'pelvis'), hipR = f.P.hipR, b = C.lerp(16, 4, e) * C.D2R;
        /* свободная нога: продолжает линию корпуса (чуть позади неё в начале), колено почти прямое, носок вниз */
        const along = V.unit(V.add(V.scale(P.y, -Math.cos(b)), P.z, -Math.sin(b))), reach = C.lerp(73, 85.6, Math.min(1, e * 2.6));
        C.legTo(q, 'R', V.add(hipR, along, reach), V.unit(V.add(P.z, [0, -1, 0], .2)), { dorsi: C.lerp(-12, -2, e) });
        const sh = f.P.ghR, shL = f.P.ghL, latR = C.latP(q, 'R'), latL = C.latP(q, 'L');
        holdDir(C, q, 'R', V.add(V.add(sh, latR, C.lerp(8, 2, e)), [0, -60.8, 2]), V.unit([0, .2, -1]), [0, 0, 1]);
        C.armTo(q, 'L', V.add(V.add(shL, latL, C.lerp(5, 1, e)), [0, -53.5, 2]), V.unit([0, .2, -1]), { pron: 10, mode: 'relaxed' });
      };
      settle(C, q, { lo: 2, hi: 6, x: ankL[0] + 1.5, xTol: 1, loads: q => [[C.fk(q).P.gripR, DB_KG]], resolve: pose2 });
      return q;
    }
  },

  /* Зашагивания на скамью (поперёк скамьи), левая нога рабочая. t=0 — левая стопа на скамье (колено ~110°),
     правая на полу; левая нога разгибается (голень почти вертикальна, колено по носку), правая отрывается
     и ставится на скамью рядом; t=1 — стоя на скамье на прямых ногах. Опускание — обратным ходом той же ногой. */
  stepup: {
    keys: [0, .04, .08, .12, .16, .24, .32, .4, .48, .56, .64, .72, .8, .9, 1],
    equipment: [{ type: 'flatBench', id: 'bench', yaw: 90 }, ...DB_OPT],
    contacts: [{ body: 'soleL', prop: 'bench:pad' }, { body: 'soleR', prop: 'floor', when: [0, .1] }, { body: 'soleR', prop: 'bench:pad', when: [.9, 1] }, ...DB_OPT_CONTACTS],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), H = 44, u = C.ease(Math.min(1, t / .82));
      /* таз из геометрии рабочей ноги: угол голени от вертикали s и сгибание колена k */
      const ankL = [10, H + 8.5, -7], s = C.lerp(18, 2, u) * C.D2R, k = C.lerp(110, 6, u) * C.D2R;
      const knee = [ankL[0], ankL[1] + 43.6 * Math.cos(s), ankL[2] + 43.6 * Math.sin(s)], hipL = [knee[0], knee[1] + 42.4 * Math.cos(s - k), knee[2] + 42.4 * Math.sin(s - k)];
      const lean = C.lerp(26, 2, C.ease(Math.min(1, t / .9)));
      pelvisLean(C, q, [hipL[0] - 10 + 1.2, hipL[1], hipL[2]], lean * .8); q.lumbar = [lean * .1, 0, 0]; q.thoracic = [lean * .1 - 1, 0, 0]; q.neck = [-lean * .35, 0, 0];
      hangArms(C, q);
      plant(C, q, 'L', ankL, { y: H, toeOut: 0, pole: [0, 0, 1], fwd: [0, 0, 1] });
      const home = [-10, 0, -44], land = [-10, H, -7];
      if (t <= .1) plant(C, q, 'R', home, { toeOut: 3, heel: 35 * C.ease(t / .1) });
      else if (t < .9) {
        /* правая стопа по дуге: вверх, затем вперёд над краем скамьи с запасом по высоте */
        const w = (t - .1) / .8, z = C.lerp(home[2], land[2], C.ease(Math.max(0, (w - .3) / .7))), y = H * C.ease(Math.min(1, w / .6)) + 9 * Math.sin(Math.PI * w);
        plant(C, q, 'R', [-10, 0, z], { y, toeOut: 3, heel: C.lerp(35, 0, Math.min(1, w * 1.3)) + 20 * Math.sin(Math.PI * w), pole: [0, 0, 1] });
      } else plant(C, q, 'R', land, { y: H, toeOut: 3 });
      return q;
    }
  },


  /* Болгарские выпады: правая стопа подъёмом на скамье позади, левая (рабочая) впереди.
     eccFirst: t=0 — верх, t=1 — низ: переднее бедро почти параллельно полу, колено над стопой, заднее колено к полу. */
  bulgarian: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', at: [-8, 0, -92] }, ...DB_OPT],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'bench:pad' }, ...DB_OPT_CONTACTS],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), e = C.ease(t), lean = C.lerp(8, 14, e);
      pelvisLean(C, q, [1, C.lerp(80, 59, e), C.lerp(-3, 0, e)], lean * .8); q.lumbar = [lean * .1, 0, 0]; q.thoracic = [lean * .1 - 2, 0, 0]; q.neck = [-lean * .3, 0, 0];
      hangArms(C, q);
      plant(C, q, 'L', [10, 0, 41], { toeOut: 4, pole: [.04, 0, 1] });
      instepOn(C, q, 'R', -8, -29, 44, 35, [0, -.3, 1]);
      return q;
    }
  },

  /* Сплит-приседания (левая нога впереди). eccFirst: t=0 — верх, обе ноги почти прямые, задняя пятка поднята;
     t=1 — низ: переднее бедро параллельно полу, колено над стопой, заднее колено почти касается пола, корпус вертикален. */
  lunge: {
    keys: [0, .25, .5, .75, 1],
    equipment: [...DB_OPT],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, ...DB_OPT_CONTACTS],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), e = C.ease(t), hipY = C.lerp(81, 52.5, e), hipZ = C.lerp(-5, -6.4, e);
      pelvisLean(C, q, [0, hipY, hipZ], C.lerp(3, 5, e)); q.thoracic = [-2, 0, 0]; q.neck = [-2, 0, 0];
      hangArms(C, q);
      const feet = q => { plant(C, q, 'L', [10, 0, 36], { toeOut: 4, pole: [.04, 0, 1] }); rearFoot(C, q, 'R', [-10, 0, -51], { hipFlex: C.lerp(-14, -4, e) }); };
      settle(C, q, { lo: -6, hi: 10, x: 0, xTol: 3, loads: loadsIn(C, S), resolve: feet });
      return q;
    }
  },

  /* Обратные выпады (левая нога рабочая): шаг правой назад и опускание. t=0 — стойка, ноги на ширине таза;
     0…0.06 — вес переносится на левую; 0.06…0.58 — правая стопа уходит назад и касается пола подушечкой;
     0.58…1 — опускание: переднее колено над стопой, заднее колено почти у пола, корпус вертикален.
     dynamic: шаг назад — динамический перенос веса (как в ходьбе), статическое равновесие на одной ноге в момент
     шага требовало бы наклона корпуса ~40° и выноса переднего колена далеко за носок — это противоречит технике. */
  revlunge: {
    keys: [0, .03, .06, .12, .18, .24, .3, .36, .42, .48, .53, .58, .66, .74, .82, .91, 1],
    dynamic: true,
    equipment: [...DB_OPT],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor', when: [0, .06] }, { body: 'soleR', prop: 'floor', when: [.58, 1] }, ...DB_OPT_CONTACTS],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), ball = -80, T0 = .06, T1 = .58;
      const tz = u => { u = Math.max(0, Math.min(1, u)); const k = .3, v = 1 / (1 - k); return u < k ? v * u * u / (2 * k) : u > 1 - k ? 1 - v * (1 - u) * (1 - u) / (2 * k) : v * (u - k / 2); };
      const a = tz((t - T0) / (T1 - T0)), d = C.ease(Math.max(0, (t - T1) / (1 - T1)));
      const hipY = t < T0 ? C.lerp(93.6, 93, t / T0) : t < T1 ? C.lerp(93, 73, a) : C.lerp(73, 52.5, d);
      const hipZ = t < T1 ? C.lerp(0, -27, a) : C.lerp(-27, -40, d), lean = t < T1 ? C.lerp(2, 12, a) : C.lerp(12, 5, d);
      const shift = t < T0 ? t / T0 : t < T1 ? 1 : 1 - d;
      pelvisLean(C, q, [5 * shift, hipY, hipZ], lean * .8); q.lumbar = [lean * .1, 0, 0]; q.thoracic = [lean * .1 - 2, 0, 0]; q.neck = [-lean * .3, 0, 0];
      hangArms(C, q);
      plant(C, q, 'L', [10, 0, 0], { toeOut: 4, pole: [.04, 0, 1] });
      if (t <= T0) plant(C, q, 'R', [-10, 0, 0], { toeOut: 4, heel: 30 * t / T0 });
      else if (t < T1) { const u = (t - T0) / (T1 - T0), z = C.lerp(13.5, ball, tz(u)), y = 7 * Math.sin(Math.PI * u); C.foot(q, 'R', [-10, y, z], 0, [0, 0, 1], { forward: [0, 0, 1], heel: C.lerp(30, 50, u) + 22 * Math.sin(Math.PI * u), allowShort: true }); }
      else rearFoot(C, q, 'R', [-10, 0, ball], { hipFlex: C.lerp(-26, 2, d) });
      return q;
    }
  },





  /* Трастеры с гантелями: замкнутый цикл, dynamic. t=0 — стоя, гантели на плечах (нейтральный хват, локти вперёд-вниз);
     0…0.3 — фронтальный присед до параллели; 0.3…0.6 — подъём, со второй половины подъёма — жим над головой (0.47…0.75);
     0.78…1 — гантели опускаются на плечи. */
  thruster: {
    keys: Array.from({ length: 21 }, (_, i) => i / 20),
    loop: true,
    dynamic: true,
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), ph = ((t % 1) + 1) % 1;
      /* профиль скорости «разгон — равномерно — торможение»: пиковая скорость ниже, чем у косинусного */
      const tz = u => { u = Math.max(0, Math.min(1, u)); const a = .3, v = 1 / (1 - a); return u < a ? v * u * u / (2 * a) : u > 1 - a ? 1 - v * (1 - u) * (1 - u) / (2 * a) : v * (u - a / 2); };
      const sq = ph < .3 ? tz(ph / .3) : ph < .6 ? 1 - tz((ph - .3) / .3) : 0;
      const pr = ph < .47 ? 0 : ph < .75 ? tz((ph - .47) / .28) : ph < .78 ? 1 : 1 - tz((ph - .78) / .22);
      const lean = C.lerp(2, 40, sq);
      pelvisLean(C, q, [0, C.lerp(93.9, 53, sq), C.lerp(0, -20, sq)], lean * .8);
      q.lumbar = [lean * .1 - 2 * pr, 0, 0]; q.thoracic = [lean * .1 - 2 * pr, 0, 0]; q.neck = [-lean * .35 + 4 * pr, 0, 0];
      const feet = q => { for (const s of S) plant(C, q, s, [M.SIGN[s] * 15, 0, -2], { toeOut: 12 }); };
      const arms = q => {
        for (const s of S) q[s].girdle = [C.lerp(2, 20, pr), C.lerp(10, 4, pr)];
        const f = C.fk(q), T = C.axes(q, 'thorax');
        for (const s of S) {
          const lat = C.lat(q, s), gh = f.P['gh' + s], fw = V.unit(V.perp(T.z, [0, 1, 0]));
          const rack = V.add(V.add(V.add(gh, T.z, 22), T.y, 3), lat, -2), top = V.add(V.add(gh, [0, 1, 0], 61.8), fw, 2);
          const g = V.add(V.mix(rack, top, pr), fw, 6 * Math.sin(Math.PI * pr));
          const axis = V.unit(V.add(V.add(T.z, T.y, .35 * (1 - pr)), lat, -.25 * (1 - pr)));
          const pole = V.unit(arc(C, V.unit(V.add(V.add(V.scale(T.y, -1), T.z, .6), lat, .35)), V.unit(V.add(lat, fw, .3)), Math.pow(pr, 1.6)));
          holdDir(C, q, s, g, pole, V.add(V.scale(axis, 1 - pr), fw, pr));
        }
      };
      settle(C, q, { lo: C.lerp(1, -6, Math.min(1, sq * 2)), hi: C.lerp(4, -3, Math.min(1, sq * 2)), loads: loadsIn(C, S), resolve: q => { feet(q); arms(q); } });
      return q;
    }
  },

  /* Гоблет-приседания: гантель вертикально у груди (верхний диск лежит на кулаках) или гиря «за рога» (optional 'kb').
     Стопы шире плеч, носки врозь, колени по носкам, локти опущены и при приседе проходят внутри коленей.
     eccFirst: t=0 — стоя, t=1 — присед до параллели бедра с полом, спина нейтральна. */
  goblet: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'g2FistDumbbell', id: 'gdb', optionalNot: 'kb' }, { type: 'g2KbHorns', id: 'kb', optional: 'kb' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'handL', prop: 'gdb:top', optional: true }, { body: 'handR', prop: 'gdb:top', optional: true },
      { body: 'gripL', prop: 'kb:hornL', optional: true }, { body: 'gripR', prop: 'kb:hornR', optional: true }],
    gripRadius: { L: 1.7, R: 1.7 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), e = C.ease(t), lean = C.lerp(2, 42, e);
      pelvisLean(C, q, [0, C.lerp(93.4, 53, e), C.lerp(0, -20, e)], lean * .8);
      q.lumbar = [lean * .1, 0, 0]; q.thoracic = [lean * .1, 0, 0]; q.neck = [-lean * .35, 0, 0];
      for (const s of S) q[s].girdle = [0, 6];
      const feet = q => { for (const s of S) plant(C, q, s, [M.SIGN[s] * 15, 0, -2], { toeOut: 12 }); };
      const hands = q => {
        /* кулаки у груди, большие пальцы вверх (снаряд вертикален), локти вниз */
        const T = C.axes(q, 'thorax'), Hc = V.add(V.add(T.o, T.y, 8), T.z, 26), b = 5 * C.D2R, fw = V.unit(V.perp(T.z, [0, 1, 0]));
        const th = V.unit(V.add(V.scale([0, 1, 0], Math.cos(b)), fw, -Math.sin(b)));
        for (const s of S) { const lat = C.lat(q, s); C.grip(q, s, V.add(Hc, lat, 8.65), th, V.unit(V.add(V.add([0, -1, 0], lat, .3), fw, -.2))); }
      };
      settle(C, q, { lo: C.lerp(1, -6.5, Math.min(1, e * 2)), hi: C.lerp(4, -3.5, Math.min(1, e * 2)), loads: q => { const f = C.fk(q); return [[V.mix(f.P.gripL, f.P.gripR, .5), 16]]; }, resolve: q => { feet(q); hands(q); } });
      return q;
    }
  },

  /* Махи гирей двумя руками. dynamic: мах — равновесие не проверяется. Стопы шире плеч, носки чуть врозь.
     t=0 — замах: таз отведён назад, спина нейтральна (наклон ~60°), предплечья у внутренней поверхности бёдер,
     гиря позади линии стоп между ногами; t=1 — таз разогнут, тело прямое, руки и гиря на уровне груди. */
  kbswing: {
    keys: [0, .15, .3, .45, .6, .75, .9, 1],
    dynamic: true,
    equipment: [{ type: 'kettlebell', id: 'kb', hands: ['L', 'R'], hang: 'arm' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'kb' }, { body: 'gripR', prop: 'kb' }],
    gripRadius: { L: 1.7, R: 1.7 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), e = C.ease(t), u = Math.pow(e, .75);
      const k = Math.min(1, u * 1.2), lean = C.lerp(60, -2, Math.min(1, u * 1.15)), hz = C.lerp(-25, 0, k), hy = C.lerp(83.5, 92.7, k);
      pelvisLean(C, q, [0, hy, hz], lean * .9);
      q.lumbar = [lean * .03, 0, 0]; q.thoracic = [lean * .05, 0, 0]; q.neck = [C.lerp(-16, 0, u), 0, 0];
      for (const s of S) plant(C, q, s, [M.SIGN[s] * 24.5, 0, -2], { toeOut: 20 });
      for (const s of S) q[s].girdle = [C.lerp(-4, 4, e), C.lerp(8, 12, e)];
      const T = C.axes(q, 'thorax'), f = C.fk(q), sh = V.mix(f.P.ghL, f.P.ghR, .5), ph = C.lerp(-25, 88, e) * C.D2R;
      const H = V.add(sh, [0, -Math.cos(ph), Math.sin(ph)], 61.3);
      for (const s of S) {
        const lat = C.lat(q, s), pole = V.unit(V.add(lat, T.y, -.8));
        C.grip(q, s, V.add(H, lat, 4.4), V.scale(lat, -1), pole);
      }
      return q;
    }
  },

  /* Подъём на носки стоя на степ-платформе: подушечки стоп у заднего края, пятки свисают.
     t=0 — пятки опущены ниже края (растяжение икр), t=1 — максимальный подъём на носки; колени прямые.
     Гантели по желанию (optional 'db'); центр масс держится над передним отделом стоп. */
  calfraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'g2Step', id: 'step' }, { type: 'dumbbell', id: 'dbL', hand: 'L', optional: 'db' }, { type: 'dumbbell', id: 'dbR', hand: 'R', optional: 'db' }],
    contacts: [{ body: 'soleL', prop: 'step:top' }, { body: 'soleR', prop: 'step:top' }, { body: 'gripL', prop: 'dbL', optional: true }, { body: 'gripR', prop: 'dbR', optional: true }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), e = C.ease(t), H = C.point('step', 'top')[1], heel = C.lerp(-6, 36, e), ballZ = -15;
      C.root(q, [0, 100, -20], [0, 1, 0], [0, 0, 1]);
      q.neck = [2, 0, 0];
      for (const s of S) { q[s].girdle = [-2, -4]; armAngles(q, s, [-2, 13, 0], 8, 0); }
      const sup = s => [M.SIGN[s] * 10.6, H, ballZ];
      const feet = q => {
        /* таз — на высоте, при которой колени почти прямые (5°) */
        const ff = M.footFrame(sup('L'), 0, { forward: [0, 0, 1], heel }), an = ff.o, hip = C.fk(q).P.hipL;
        const d = Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(5 * C.D2R)), dx = hip[0] - an[0], dz = hip[2] - an[2];
        q.root.p[1] += an[1] + Math.sqrt(Math.max(0, d * d - dx * dx - dz * dz)) - hip[1];
        for (const s of S) C.foot(q, s, sup(s), 0, [0, 0, 1], { forward: [0, 0, 1], heel });
      };
      settle(C, q, { lo: ballZ + 1.2, hi: ballZ + 3.5, loads: loadsIn(C, S), resolve: feet });
      return q;
    }
  },

  /* Прогулка фермера: замкнутый цикл — шаг на месте (стопы чередуются), корпус вертикален, плечи опущены и отведены,
     снаряды неподвижно висят по бокам. t 0…0.5 — шаг левой (опора на правую), 0.5…1 — шаг правой.
     Гантели по умолчанию; гири — если выбраны гири (optional 'kb'). */
  farmer: {
    keys: Array.from({ length: 17 }, (_, i) => i / 16),
    loop: true,
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L', optionalNot: 'kb' }, { type: 'dumbbell', id: 'dbR', hand: 'R', optionalNot: 'kb' },
      { type: 'kettlebell', id: 'kbL', hands: ['L'], hang: 'gravity', optional: 'kb' }, { type: 'kettlebell', id: 'kbR', hands: ['R'], hang: 'gravity', optional: 'kb' }],
    contacts: [{ body: 'soleL', prop: 'floor', when: [0, .14] }, { body: 'soleL', prop: 'floor', when: [.36, 1] }, { body: 'soleR', prop: 'floor', when: [0, .64] }, { body: 'soleR', prop: 'floor', when: [.86, 1] },
      { body: 'gripL', prop: 'dbL', optional: true }, { body: 'gripR', prop: 'dbR', optional: true }, { body: 'gripL', prop: 'kbL', optional: true }, { body: 'gripR', prop: 'kbR', optional: true }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), ph = ((t % 1) + 1) % 1;
      const swing = ph < .5 ? 'L' : 'R', u = (ph % .5) / .5, stance = swing === 'L' ? 'R' : 'L';
      const lift = Math.sin(Math.PI * u), single = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (u - .1) / .8))));
      C.root(q, [0, 93.8 + .3 * single, 0], [0, 1, 0], [0, 0, 1]);
      q.thoracic = [-2, 0, 0]; q.neck = [-2, 0, 0];
      for (const s of S) { q[s].girdle = [-4, -6]; armAngles(q, s, [-3, 15, 0], 8, 0); }
      const home = s => [C.M.SIGN[s] * 9.5, 0, -1];
      const feet = q => {
        plant(C, q, stance, home(stance));
        const a = home(swing);
        if (u < .3 || u > .7) plant(C, q, swing, a, { heel: (u < .5 ? u / .3 : (1 - u) / .3) * (u < .5 ? 34 : 20) });
        else { const v = (u - .3) / .4, h = 7 * Math.sin(Math.PI * v), hl = v < .5 ? C.lerp(34, 12, v * 2) : C.lerp(12, 20, v * 2 - 1); plant(C, q, swing, [a[0], 0, a[2] - 1.5 * Math.sin(Math.PI * v)], { y: h, heel: hl, pole: [0, 0, 1] }); }
      };
      const xs = -C.M.SIGN[swing] * 7.2 * single;
      settle(C, q, { lo: 1.5, hi: 6, x: xs, xTol: .4, loads: loadsIn(C, S, 16), resolve: feet });
      return q;
    }
  },

  /* Махи гантелями в стороны: корпус чуть наклонён вперёд, локти слегка согнуты, подъём до уровня плеч
     в плоскости лопатки, кисти не выше локтей; лопаточно-плечевой ритм. */
  latraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const q = C.base(), e = C.ease(t);
      pelvisLean(C, q, [0, 94, 0], 6); q.lumbar = [1, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-6, 0, 0];
      const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 11, 0, -1]); };
      for (const s of S) { armAngles(q, s, [C.lerp(10, 22, e), C.lerp(14, 84, e), C.lerp(2, -4, e)], 16, C.lerp(2, 6, e)); C.rhythm(q, s, [0, -2]); }
      settle(C, q, { lo: 2, hi: 7, loads: loadsIn(C, S, 6), resolve: feet });
      return q;
    }
  },

  /* Подъём гантелей перед собой: хват сверху, руки почти прямые, до уровня плеч. */
  frontraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = C.base(), e = C.ease(t);
      C.root(q, [0, 94.2, 0], [0, 1, 0], [0, 0, 1]); q.neck = [0, 0, 0];
      const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 11, 0, -1]); };
      for (const s of S) { armAngles(q, s, [C.lerp(17, 90, e), C.lerp(7, 6, e), C.lerp(-14, -10, e)], C.lerp(8, 10, e), 80); C.rhythm(q, s); }
      settle(C, q, { lo: 1, hi: 7, loads: loadsIn(C, S, 6), resolve: feet });
      return q;
    }
  },

  /* Наклоны в сторону: гантель в правой руке, левая кисть за головой; наклон строго во фронтальной плоскости. */
  sidebend: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.4, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, q = C.base(), e = C.ease(t);
      C.root(q, [0, 93.4, 0], [0, 1, 0], [0, 0, 1]);
      q.lumbar = [0, C.lerp(0, 13, e), 0]; q.thoracic = [0, C.lerp(0, 15, e), 0]; q.neck = [0, C.lerp(0, 4, e), 0];
      const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 12, 0, -1]); };
      const arms = q => {
        const f = C.fk(q), gh = f.P.ghR;
        holdDir(C, q, 'R', V.add(V.add(gh, C.latP(q, 'R'), 8.5), [0, -60.8, 3]), V.unit([-.3, 0, -1]), [0, 0, 1]);
        const H = f.F.head, hx = M.M3.col(H.R, 0), hy = M.M3.col(H.R, 1), hz = M.M3.col(H.R, 2), c = f.P.head, a = M.B.head;
        const d = V.unit(V.add(V.add(V.scale(hz, -.9), hx, .42), hy, .12)), loc = [V.dot(d, hx), V.dot(d, hy), V.dot(d, hz)];
        const k = 1 / Math.hypot(loc[0] / a[0], loc[1] / a[1], loc[2] / a[2]), p = V.add(c, d, k);
        const nn = V.unit(V.add(V.add(V.scale(hx, loc[0] * k / a[0] ** 2), hy, loc[1] * k / a[1] ** 2), hz, loc[2] * k / a[2] ** 2));
        palmBest(C, q, 'L', V.add(p, nn, .25), nn, fan(C, nn, V.scale(hx, -1), 15).filter(v => V.dot(v, hz) < .1 && V.dot(v, hx) < .3), [[1, .4, -.3], [1, .2, .2], [1, .7, 0], [1, 0, -.6], [1, .3, .5], [1, .6, .4], [.7, .5, .8]].map(([a, b, c]) => V.unit(V.add(V.add(V.scale(hx, a), hy, b), hz, c))));
      };
      settle(C, q, { lo: 1, hi: 6, x: 0, xTol: 3.5, loads: q => [[C.fk(q).P.gripR, DB_KG]], resolve: q => { feet(q); arms(q); } });
      return q;
    }
  },

  /* Разгибание гантели из-за головы стоя: гантель вертикально, ладони под верхним диском, локти у головы.
     eccFirst: t=0 — руки выпрямлены над головой, t=1 — гантель опущена за голову. */
  ohext: {
    keys: Array.from({ length: 13 }, (_, i) => i / 12),
    equipment: [{ type: 'g2CupDumbbell', id: 'cup', hands: ['L', 'R'] }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, ...CUP_CONTACTS],
    pose(t, C) {
      /* ключи считаются цепочкой: вариант хвата выбирается с учётом предыдущего ключа (без скачков между ключами) */
      const chain = this._chain || (this._chain = (() => {
        const out = new Map(); let prev = null;
        for (const tk of this.keys) { const r = ohextKey(tk, C, prev); out.set(tk, r.q); prev = r.chosen; }
        return out;
      })());
      const q = chain.get(t) || ohextKey(t, C, null).q;
      return C.M.clone(q);
    }
  },


  /* Жим гантелей сидя: спинка почти вертикальна (без наклонной — сидя на краю горизонтальной скамьи).
     t=0 — гантели на уровне ушей, локти под гантелями, ладони вперёд; t=1 — гантели сведены над головой. */
  dbpress: {
    keys: [0, .25, .5, .75, 1],
    equipment: [...SEAT_BENCHES, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [...SEAT_CONTACTS, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = sitOnAdj(C, C.base(), { lumbar: 2, thoracic: -2, hip: 84, feetZ: -23 });
      q.neck = [2, 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(4, 18, e), C.lerp(2, 6, e)];
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const lat = C.lat(q, s), gh = f.P['gh' + s], up = [0, 1, 0], fwd = V.unit(V.perp(T.z, up));
        const bot = V.add(V.add(V.add(gh, lat, 25), up, 21), fwd, 5), top = V.add(V.add(V.add(gh, lat, -1), up, 62.6), fwd, 3);
        const g = V.add(V.mix(bot, top, e), lat, 4 * Math.sin(Math.PI * e));
        const pole = V.unit(V.add(V.add([0, -1, 0], lat, C.lerp(.9, .6, e)), fwd, -.15));
        holdDir(C, q, s, g, pole, lat);
      }
      return q;
    }
  },

  /* Жим Арнольда сидя. t=0 — гантели перед подбородком, ладони к себе, локти впереди;
     по ходу жима локти расходятся, кисти поворачиваются (через нейтральный хват) ладонями вперёд; t=1 — над головой. */
  arnold: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [...SEAT_BENCHES, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [...SEAT_CONTACTS, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = sitOnAdj(C, C.base(), { lumbar: 2, thoracic: -2, hip: 84, feetZ: -23 });
      q.neck = [2, 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(2, 18, e), C.lerp(10, 6, e)];
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const lat = C.lat(q, s), gh = f.P['gh' + s], up = [0, 1, 0], fwd = V.unit(V.perp(T.z, up)), back = V.scale(fwd, -1);
        const p0 = V.add(V.add(V.add(gh, lat, -1.5), up, 11), fwd, 23), p1 = V.add(V.add(V.add(gh, lat, 20), up, 26), fwd, 8), p2 = V.add(V.add(V.add(gh, lat, -1), up, 62.6), fwd, 3);
        const g = e < .5 ? V.mix(p0, p1, e * 2) : V.mix(p1, p2, e * 2 - 1);
        const thumb = arc(C, lat, V.scale(lat, -1), e, V.unit(V.add(back, up, .25)));
        const pole = V.unit(arc(C, V.add(V.add([0, -1, 0], fwd, .25), lat, .35), V.add([0, -1, 0], lat, .7), Math.min(1, e * 1.6)));
        holdDir(C, q, s, g, pole, thumb, { signed: true });
      }
      return q;
    }
  },

  /* Сгибание рук на наклонной скамье (спинка 55°): плечи висят вертикально, локти не уходят вперёд.
     t=0 — руки выпрямлены, ладони вперёд; t=1 — гантели у плеч. */
  inclinecurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'adjBench', id: 'bench', back: 55, seat: 10 }, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'back', prop: 'bench:back' }, { body: 'headBack', prop: 'bench:back' }, { body: 'buttocks', prop: 'bench:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, e = C.ease(t), q = sitOnAdj(C, C.base(), { lumbar: -2, thoracic: -2, hip: 62, abd: 3, feetZ: -27 }), bp = C.frame('bench', 'backPad');
      C.neckTo(q, 'headBack', bp.o, M.M3.col(bp.R, 1), -.5);
      for (const s of S) q[s].girdle = [-2, -8];
      const T = C.axes(q, 'thorax'), recline = Math.atan2(-T.y[2] * 0 + V.dot(T.y, [0, 0, 1]), T.y[1]) * 180 / Math.PI;
      for (const s of S) armAngles(q, s, [-recline + C.lerp(0, 6, e), 19, C.lerp(4, 14, e)], C.lerp(6, 132, e), C.lerp(-82, -86, e));
      return q;
    }
  },

  /* Жим гантелей на наклонной скамье (спинка 35°). eccFirst: t=0 — гантели над верхом груди,
     t=1 — гантели у верхней части груди, предплечья вертикальны, лопатки прижаты к спинке. */
  dbincline: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'adjBench', id: 'bench', back: 35, seat: 8 }, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'back', prop: 'bench:back' }, { body: 'headBack', prop: 'bench:back' }, { body: 'buttocks', prop: 'bench:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, e = C.ease(t), q = sitOnAdj(C, C.base(), { lumbar: -4, thoracic: -4, hip: 52, feetZ: -30, girdle: [-4, -12] }), bp = C.frame('bench', 'backPad');
      C.neckTo(q, 'headBack', bp.o, M.M3.col(bp.R, 1), -.5);
      const f = C.fk(q), chest = C.chestPoint(q, 40);
      for (const s of S) {
        q[s].girdle = [-4, C.lerp(-6, -14, e)];
        const lat = C.lat(q, s), gh = f.P['gh' + s];
        const top = [gh[0] - Math.sign(gh[0]) * 1, gh[1] + 63.5, gh[2] - 4], bot = V.add([gh[0], chest[1] + 7, chest[2] - 2], lat, 18);
        const g = V.add(V.mix(top, bot, e), lat, 3 * Math.sin(Math.PI * e));
        const pole = V.unit(V.add(V.add([0, -1, 0], lat, 1.1), [0, 0, -1], .4));
        holdDir(C, q, s, g, pole, V.unit(V.add(lat, [0, 1, 0], C.lerp(0, .2, e))));
      }
      return q;
    }
  },

  /* Жим гантелей лёжа. eccFirst: t=0 — гантели над грудью на почти прямых руках, t=1 — гантели у груди,
     предплечья вертикальны, локти под 50–60° к корпусу. Хват прямой (ладони к ногам), гантели в линию. */
  dbbench: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = lieOnBench(C, C.base()), e = C.ease(t), f = C.fk(q), chest = C.chestPoint(q, 33);
      for (const s of S) {
        q[s].girdle = [-4, C.lerp(-6, -14, e)];
        const lat = C.lat(q, s), gh = f.P['gh' + s];
        const top = V.add([gh[0], gh[1] + 64, gh[2] - 5], lat, 0), bot = V.add([gh[0], chest[1] + 8, gh[2] - 11], lat, 18);
        const g = V.add(V.mix(top, bot, e), lat, 3 * Math.sin(Math.PI * e));
        const pole = V.unit(V.add(V.add([0, -1, 0], lat, 1.1), [0, 0, -1], .45));
        const axis = V.unit(V.add(lat, [0, 0, 1], C.lerp(0, .25, e)));
        holdDir(C, q, s, g, pole, axis);
      }
      return q;
    }
  },

  /* Разводка гантелей лёжа. eccFirst: t=0 — гантели над грудью, ладони друг к другу, локти чуть согнуты;
     t=1 — руки разведены по дуге до уровня плеч, угол в локтях постоянный (~20°). */
  dbfly: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, q = lieOnBench(C, C.base()), e = C.ease(t), f = C.fk(q);
      for (const s of S) {
        q[s].girdle = [-4, C.lerp(-4, -14, e)];
        const lat = C.lat(q, s), gh = f.P['gh' + s], phi = C.lerp(-8, 84, e) * C.D2R, reach = C.lerp(63.3, 61.5, e);
        const dir = V.unit(V.add(V.add(V.scale([0, 1, 0], Math.cos(phi)), lat, Math.sin(phi)), [0, 0, -1], .12));
        const g = V.add(gh, dir, reach);
        const pole = V.unit(V.add(V.add(V.scale(lat, Math.cos(phi)), [0, -1, 0], Math.sin(phi) * .9), [0, 0, -1], .35));
        holdDir(C, q, s, g, pole, [0, 0, 1]);
      }
      return q;
    }
  },
  /* Подъём гантелей на бицепс стоя. t=0 — руки опущены, ладони вперёд; t=1 — гантели у плеч. */
  dbcurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const q = C.base(), e = C.ease(t);
      C.root(q, [0, 94.2, 0], [0, 1, 0], [0, 0, 1]);
      q.thoracic = [0, 0, 0]; q.neck = [2, 0, 0];
      const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 11, 0, -1]); };
      for (const s of S) { q[s].girdle = [0, C.lerp(-4, 2, e)]; armAngles(q, s, [C.lerp(6, 16, e), C.lerp(16, 13, e), C.lerp(-4, 8, e)], C.lerp(12, 136, e), C.lerp(-86, -90, e)); }
      settle(C, q, { lo: 1, hi: 7, loads: loadsIn(C, S), resolve: feet });
      return q;
    }
  },

  /* Молотковые сгибания: нейтральный хват (ладони друг к другу), локти у корпуса. */
  hammer: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const q = C.base(), e = C.ease(t);
      C.root(q, [0, 94.2, 0], [0, 1, 0], [0, 0, 1]);
      q.neck = [2, 0, 0];
      const feet = q => { for (const s of S) plant(C, q, s, [C.M.SIGN[s] * 11, 0, -1]); };
      for (const s of S) { q[s].girdle = [0, 0]; armAngles(q, s, [C.lerp(2, 14, e), C.lerp(9, 8, e), 0], C.lerp(10, 134, e), C.lerp(4, 8, e)); }
      settle(C, q, { lo: 1, hi: 7, loads: loadsIn(C, S), resolve: feet });
      return q;
    }
  }
};
