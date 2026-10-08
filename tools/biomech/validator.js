'use strict';
/* Биомеханический валидатор сцены: тело + инвентарь + пол.
   Единицы — сантиметры, ось Y направлена вниз, пол на FLOOR_Y.
   Валидатор не знает, как построена поза: он получает суставы и коллайдеры
   и проверяет то, что физически невозможно или анатомически недопустимо.

   Нормативы амплитуд: Soucie et al., Haemophilia 2011 (CDC Joint ROM Study),
   для движений, которых нет в этом исследовании, — AAOS (Greene & Heckman 1994).
   Пропорции сегментов: Winter, Biomechanics and Motor Control of Human Movement,
   4th ed., 2009, рис. 4.1 (по Drillis & Contini 1966). */

const FLOOR_Y = 186;
const D2R = Math.PI / 180;

const V = {
  add: (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: a => Math.hypot(a[0], a[1], a[2]),
  scale: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  mix: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  unit: a => { const d = Math.hypot(a[0], a[1], a[2]); return d < 1e-9 ? [0, 0, 0] : [a[0] / d, a[1] / d, a[2] / d]; },
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angleDeg = (a, b) => Math.acos(clamp(V.dot(V.unit(a), V.unit(b)), -1, 1)) / D2R;
const perp = (v, axis) => V.sub(v, V.scale(axis, V.dot(v, axis)));
function rotate(v, k, theta) { /* Родригес */
  const c = Math.cos(theta), s = Math.sin(theta);
  return V.add(V.add(V.scale(v, c), V.scale(V.cross(k, v), s)), V.scale(k, V.dot(k, v) * (1 - c)));
}

/* Пределы суставов, градусы. «tol» — запас на погрешность модели и индивидуальную вариативность.
   Соответствие источнику — см. ROM_SOURCES. */
const ROM = {
  elbowFlexion: { max: 150, tol: 5 },            // Soucie: 145–150
  kneeFlexion: { max: 145, tol: 8 },             // Soucie: 138–142
  hipFlexion: { max: 130, tol: 12 },             // Soucie: 130–134 (+ наклон таза в глубоком приседе)
  hipExtension: { max: 20, tol: 12 },            // Soucie: 17–18
  hipAbduction: { max: 45, tol: 10 },            // AAOS
  shoulderExtension: { max: 60, tol: 10 },       // AAOS: 60
  shoulderHorizExtension: { max: 45, tol: 15 },  // AAOS: 45
  elevatedPosterior: { max: 30, tol: 15 },       // руку выше плеча нельзя завести далеко за фронтальную плоскость
  elbowPlaneDeviation: { max: 90, tol: 30 },     // ротация плеча ≈ ±90° задаёт плоскость сгиба локтя
  kneePlaneDeviation: { max: 50, tol: 25 },      // ротация бедра ±40–45° + колена ±10°
  neckFlexion: { max: 60, tol: 15 }, neckExtension: { max: 70, tol: 15 }
};
const ROM_SOURCES = {
  soucie: 'Soucie JM et al. Range of motion measurements: reference values and a database for comparison studies. Haemophilia 2011;17:500–507 (CDC Joint ROM Study).',
  aaos: 'Greene WB, Heckman JD (eds). The Clinical Measurement of Joint Motion. AAOS, 1994.',
  winter: 'Winter DA. Biomechanics and Motor Control of Human Movement, 4th ed. Wiley, 2009 — рис. 4.1 (Drillis & Contini, 1966).'
};

/* ---------- Знаковые расстояния ---------- */
function sdCapsule(p, a, b, r) {
  const pa = V.sub(p, a), ba = V.sub(b, a), bb = V.dot(ba, ba);
  const h = bb < 1e-9 ? 0 : clamp(V.dot(pa, ba) / bb, 0, 1);
  return V.len(V.sub(pa, V.scale(ba, h))) - r;
}
function sdAABB(p, lo, hi) {
  const c = V.scale(V.add(lo, hi), .5), e = V.scale(V.sub(hi, lo), .5);
  const q = [Math.abs(p[0] - c[0]) - e[0], Math.abs(p[1] - c[1]) - e[1], Math.abs(p[2] - c[2]) - e[2]];
  const out = V.len([Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)]);
  return out + Math.min(Math.max(q[0], q[1], q[2]), 0);
}
function sdOBB(p, c, axes, half) {
  const d = V.sub(p, c), q = axes.map((ax, i) => Math.abs(V.dot(d, ax)) - half[i]);
  return V.len(q.map(v => Math.max(v, 0))) + Math.min(Math.max(...q), 0);
}
function sdCylinder(p, c, axis, r, halfH) {
  const d = V.sub(p, c), y = V.dot(d, axis), rad = V.len(perp(d, axis));
  const dx = rad - r, dy = Math.abs(y) - halfH;
  return Math.min(Math.max(dx, dy), 0) + V.len([Math.max(dx, 0), Math.max(dy, 0), 0]);
}
function sdEllipsoid(p, c, axes, radii) { /* приближённое SDF (Inigo Quilez) */
  const d = V.sub(p, c), q = axes.map((ax, i) => V.dot(d, ax) / radii[i]);
  const k0 = V.len(q), k1 = V.len(axes.map((ax, i) => V.dot(d, ax) / (radii[i] * radii[i])));
  return k1 < 1e-9 ? -Math.min(...radii) : k0 * (k0 - 1) / k1;
}

/* ---------- Тело ---------- */
/* Профили толщины сегментов (радиусы, см) — совпадают с отрисовкой в атласе. */
const LIMB = {
  ua: [[0, 5.4], [.18, 7.0], [.45, 6.6], [.78, 4.9], [1, 4.1]],
  fa: [[0, 4.4], [.22, 5.4], [.45, 4.8], [.76, 3.4], [1, 2.6]],
  th: [[0, 9.0], [.25, 8.5], [.6, 6.8], [1, 5.1]],
  sh: [[0, 5.0], [.27, 5.7], [.57, 4.2], [1, 2.9]]
};
const TORSO = [[0, 12.5, 10, 10], [10, 13, 11.5, 8], [18, 13.4, 12.2, 8], [21, 13.5, 12.5, 8], [31, 16.3, 12.5, 9], [40, 18.2, 12.5, 10], [47, 17.8, 12, 10], [52, 15.8, 8.5, 10]];
const profileAt = (prof, t) => { for (let i = 1; i < prof.length; i++) if (t <= prof[i][0]) { const a = prof[i - 1], b = prof[i], q = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * q; } return prof.at(-1)[1]; };
const sectionAt = h => { if (h <= 0) return TORSO[0].slice(1); for (let i = 1; i < TORSO.length; i++) if (h <= TORSO[i][0]) { const a = TORSO[i - 1], b = TORSO[i], q = (h - a[0]) / (b[0] - a[0]); return a.slice(1).map((v, k) => v + (b[k + 1] - v) * q); } return TORSO.at(-1).slice(1); };

/* Шарообразное покрытие сегментов. Каждый шар знает сегмент, сторону и долю по длине. */
function bodyModel(R) {
  const x = R.x || V.unit(V.cross(R.n, R.u));
  const spheres = [];
  const seg = (name, side, a, b, prof, n = 8, shrink = .9) => {
    for (let i = 0; i <= n; i++) { const t = i / n; spheres.push({ seg: name, side, t, c: V.mix(a, b, t), r: profileAt(prof, t) * shrink }); }
  };
  for (const s of ['L', 'R']) {
    seg('ua', s, R['sh' + s], R['el' + s], LIMB.ua);
    seg('fa', s, R['el' + s], R['wr' + s], LIMB.fa);
    for (let i = 0; i <= 3; i++) spheres.push({ seg: 'hand', side: s, t: i / 3, c: V.mix(R['wr' + s], R['hand' + s] || R['grip' + s], i / 3), r: 2.9 });
    seg('th', s, R['hip' + s], R['kn' + s], LIMB.th);
    seg('sh', s, R['kn' + s], R['an' + s], LIMB.sh);
    if (R['heel' + s] && R['toe' + s]) /* обувь — брусок 9,5×5,5 см вокруг линии пятка–носок */
      for (let i = 0; i <= 4; i++) spheres.push({ seg: 'foot', side: s, t: i / 4, c: V.mix(R['heel' + s], R['toe' + s], i / 4), r: 2.75 });
  }
  const neckBase = V.add(R.sh, R.chestU || R.u, -2);
  for (let i = 0; i <= 3; i++) spheres.push({ seg: 'neck', side: 'C', t: i / 3, c: V.mix(neckBase, R.head, i / 3 * .7), r: 4.2 });
  const hu = V.unit(R.headU || R.u), hn = V.unit(R.headN || R.n), hx = V.unit(V.cross(hu, hn));
  const head = { c: R.head, axes: [hx, hu, hn], radii: [8.8, 12.3, 10] };
  const torso = { hip: R.hip, u: V.unit(R.u), n: V.unit(R.n), x, waist: R.waist, chestU: R.chestU, chestN: R.chestN };
  return { spheres, head, torso, joints: R };
}
function torsoSDF(T, p) {
  let d = V.sub(p, T.hip), h = V.dot(d, T.u), u = T.u, n = T.n, origin = T.hip;
  if (h > 18 && T.waist && T.chestU) { u = V.unit(T.chestU); n = V.unit(T.chestN || T.n); origin = V.add(T.waist, u, -18); d = V.sub(p, origin); h = V.dot(d, u); }
  const [w, a, b] = sectionAt(clamp(h, 0, 52));
  const c = V.add(origin, u, clamp(h, 0, 52)), off = V.sub(p, c);
  const lx = V.dot(off, T.x), ln = V.dot(off, n), depth = ln >= 0 ? a : b;
  const rho = Math.hypot(lx / w, ln / depth), radial = (rho - 1) * Math.min(w, depth);
  const axial = h < 0 ? -h : h > 52 ? h - 52 : -Infinity;
  return axial === -Infinity ? radial : Math.max(radial, axial);
}
const headSDF = (H, p) => sdEllipsoid(p, H.c, H.axes, H.radii);

/* ---------- Инвентарь ---------- */
const HARD = new Set(['steel', 'bar', 'plate', 'cable']);
function colliders(props, R) {
  const out = [];
  const grips = ['L', 'R'].map(s => R['grip' + s]).filter(Boolean);
  const nearGrip = (a, b) => grips.some(g => sdCapsule(g, a, b, 0) < 3.5);
  props.forEach((s, index) => {
    const base = { index, kind: s.kind, tone: s.tone || 'steel', role: s.equipmentRole || '' };
    if (s.kind === 'box') out.push({ ...base, sdf: p => sdAABB(p, s.lo, s.hi), pts: boxPoints(s.lo, s.hi), soft: /pad|mat/.test(s.tone) });
    else if (s.kind === 'line') {
      const r = (s.width || 4) / 2, cable = /cable|band/.test(s.tone);
      out.push({ ...base, cable, grip: !cable && (s.tone === 'bar' || /grip/.test(base.role) || nearGrip(s.a, s.b)), a: s.a, b: s.b, r,
        sdf: p => sdCapsule(p, s.a, s.b, r), pts: segPoints(s.a, s.b, 8) });
    } else if (s.kind === 'panel') {
      const z = V.unit(V.sub(s.b, s.a)); let xx = perp([1, 0, 0], z); xx = V.len(xx) < 1e-5 ? V.unit(V.cross(z, [0, 0, 1])) : V.unit(xx);
      const y = V.unit(V.cross(z, xx)), c = V.scale(V.add(s.a, s.b), .5), half = [s.width / 2, s.thickness / 2, V.dist(s.a, s.b) / 2];
      out.push({ ...base, soft: s.tone === 'pad', sdf: p => sdOBB(p, c, [xx, y, z], half), pts: obbPoints(c, [xx, y, z], half) });
    } else if (['wheel', 'roller', 'weight'].includes(s.kind)) {
      const axis = V.unit(s.axis || [1, 0, 0]), r = s.radius || 6, halfH = s.kind === 'roller' ? 18 : 2.75;
      out.push({ ...base, soft: s.kind === 'roller', free: s.kind === 'weight', sdf: p => sdCylinder(p, s.c, axis, r, halfH), pts: [s.c, V.add(s.c, axis, halfH), V.add(s.c, axis, -halfH)] });
    } else if (s.kind === 'barbell' || s.kind === 'dumbbell') {
      const big = s.kind === 'barbell', axis = V.unit(s.axis || [1, 0, 0]), half = big ? 61 : 12, at = big ? 48 : 9, pr = big ? (s.radius || 17) : 6, ph = big ? 2.5 : 1.75;
      out.push({ ...base, free: true, grip: true, part: 'shaft', a: V.add(s.c, axis, -half), b: V.add(s.c, axis, half), r: big ? 1.4 : 1.2,
        sdf: p => sdCapsule(p, V.add(s.c, axis, -half), V.add(s.c, axis, half), big ? 1.4 : 1.2), pts: segPoints(V.add(s.c, axis, -half), V.add(s.c, axis, half), 6), center: s.c });
      for (const sign of [-1, 1]) { const pc = V.add(s.c, axis, at * sign);
        out.push({ ...base, free: true, part: 'plate', sdf: p => sdCylinder(p, pc, axis, pr, ph), pts: [pc], center: s.c }); }
    } else if (s.kind === 'kettlebell') {
      out.push({ ...base, free: true, part: 'bell', sdf: p => V.dist(p, s.c) - (s.radius || 8.5), pts: [s.c], center: s.c });
    } else out.push({ ...base, unknown: true, sdf: () => Infinity, pts: [] });
  });
  return out;
}
function segPoints(a, b, n) { const o = []; for (let i = 0; i <= n; i++) o.push(V.mix(a, b, i / n)); return o; }
function boxPoints(lo, hi) { const o = []; for (const x of [lo[0], hi[0]]) for (const y of [lo[1], hi[1]]) for (const z of [lo[2], hi[2]]) o.push([x, y, z]); o.push(V.scale(V.add(lo, hi), .5)); return o; }
function obbPoints(c, axes, half) { const o = [c]; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) o.push(V.add(V.add(V.add(c, axes[0], sx * half[0]), axes[1], sy * half[1]), axes[2], sz * half[2])); return o; }

/* ---------- Правила ---------- */
const SOFT_BODY = new Set(['ua', 'th']);
function tolerance(sphere, col) {
  if (sphere.seg === 'foot') return col.soft ? 2 : 1.2;
  if (col.soft) return SOFT_BODY.has(sphere.seg) || sphere.seg === 'torso' ? 3 : 2;
  return 1.2;
}

/* Тяжесть: «error» — грубое, видно сразу; «warn» — заметно при внимательном просмотре. */
function severity(rule, depth, planeRule = false) {
  if (['floating', 'cable-through-body', 'jump', 'floor-equipment'].includes(rule)) return 'error';
  if (rule === 'rom') return depth > (planeRule ? 50 : 25) ? 'error' : 'warn';
  if (rule === 'proportions') return 'warn';
  return depth > 5 ? 'error' : 'warn';
}
function checkFrame(R, opts = {}) {
  const v = [], push = (rule, detail, depth) => v.push({ rule, detail, depth: depth == null ? undefined : +depth.toFixed(1), unit: rule === 'rom' ? '°' : 'см', severity: severity(rule, depth ?? 0, /невозможную сторону/.test(detail)) });
  const body = bodyModel(R), cols = colliders(R.props || [], R), floor = opts.floorY ?? FLOOR_Y;
  const nonFoot = body.spheres.filter(s => s.seg !== 'foot');

  /* 1. Тело внутри инвентаря */
  for (const col of cols) {
    if (col.unknown || col.cable) continue;
    let worst = null;
    for (const s of body.spheres) {
      if (s.seg === 'hand' && (col.grip || col.free)) continue;      // хват и снаряд в руке
      if (s.seg === 'fa' && s.t > .75 && (col.grip || col.free)) continue; // запястье у грифа
      const depth = s.r - col.sdf(s.c);
      if (depth > tolerance(s, col) && (!worst || depth > worst.depth)) worst = { s, depth };
    }
    // Корпус и голова — отдельные поверхности
    for (const p of col.pts.concat(col.a ? segPoints(col.a, col.b, 16) : [])) {
      const tDepth = -torsoSDF(body.torso, p) + (col.r || 0), hDepth = -headSDF(body.head, p) + (col.r || 0);
      const tolT = col.soft ? 3 : 1.5, tolH = 1.2;
      if (!col.grip && !col.free && tDepth > tolT && (!worst || tDepth > worst.depth)) worst = { s: { seg: 'torso', side: 'C' }, depth: tDepth };
      if (hDepth > tolH && (!worst || hDepth > worst.depth)) worst = { s: { seg: 'head', side: 'C' }, depth: hDepth };
    }
    if (col.free && !col.grip) { // диски/гиря внутри тела
      for (const s of nonFoot) { const d = s.r - col.sdf(s.c); if (d > 1.5 && (!worst || d > worst.depth)) worst = { s, depth: d }; }
    }
    if (worst) push('penetration', `${worst.s.seg}${worst.s.side} ⟂ ${col.kind}#${col.index}${col.role ? '(' + col.role + ')' : ''}`, worst.depth);
  }
  /* 2. Пол */
  {
    let worst = null;
    for (const s of body.spheres) { const depth = (s.c[1] + s.r) - floor; const tol = s.seg === 'foot' ? 1.2 : 1.5; if (depth > tol && (!worst || depth > worst.depth)) worst = { s, depth }; }
    for (const p of [R.head]) { const depth = p[1] + 9 - floor; if (depth > 1.5 && (!worst || depth > worst.depth)) worst = { s: { seg: 'head', side: 'C' }, depth }; }
    if (worst) push('floor', `${worst.s.seg}${worst.s.side} ниже пола`, worst.depth);
    for (const col of cols) for (const p of col.pts) if (p[1] > floor + 1.5) { push('floor-equipment', `${col.kind}#${col.index} ниже пола`, p[1] - floor); break; }
  }
  /* 3. Тело само в себе */
  {
    const pairs = [];
    const limbVsTorso = s => !((s.seg === 'ua' && s.t < .35) || (s.seg === 'th' && s.t < .45) || s.seg === 'neck');
    let worst = null;
    for (const s of body.spheres) {
      if (limbVsTorso(s)) { const d = s.r - torsoSDF(body.torso, s.c), tol = s.seg === 'ua' ? 4.5 : s.seg === 'th' ? 4 : 2.5; /* плечо прижато к широчайшей, бедро к животу — с деформацией тканей */ if (d > tol && (!worst || d > worst.depth)) worst = { a: s, b: { seg: 'torso', side: 'C' }, depth: d }; }
      if (s.seg !== 'neck') { const d = s.r - headSDF(body.head, s.c), tol = s.seg === 'hand' ? 2 : 1.5; if (d > tol && (!worst || d > worst.depth)) worst = { a: s, b: { seg: 'head', side: 'C' }, depth: d }; }
    }
    const adjacent = (a, b) => a.side === b.side && (
      (a.seg === 'ua' && b.seg === 'fa') || (a.seg === 'fa' && b.seg === 'ua') || (a.seg === 'fa' && b.seg === 'hand') || (a.seg === 'hand' && b.seg === 'fa') ||
      (a.seg === 'th' && b.seg === 'sh') || (a.seg === 'sh' && b.seg === 'th') || (a.seg === 'sh' && b.seg === 'foot') || (a.seg === 'foot' && b.seg === 'sh'));
    const S = body.spheres.filter(s => s.seg !== 'neck');
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
      const a = S[i], b = S[j];
      if (a.seg === b.seg && a.side === b.side) continue;
      if (adjacent(a, b)) { // соседние сегменты сталкиваются только при переразгибании/пересгибании — это проверяют пределы суставов
        continue;
      }
      if ((a.seg === 'th' && a.t < .3 && b.seg === 'th' && b.t < .3)) continue; // пах
      const handPair = a.seg === 'hand' || b.seg === 'hand';
      const tol = handPair ? 2.5 : (a.seg === 'th' || b.seg === 'th') ? 3 : 2;
      const d = a.r + b.r - V.dist(a.c, b.c);
      if (d > tol && (!worst || d > worst.depth)) worst = { a, b, depth: d };
    }
    if (worst) {
      const hanging = worst.a.seg === 'ua' && worst.b.seg === 'torso' && V.dot(V.unit(V.sub(R['el' + worst.a.side], R['sh' + worst.a.side])), V.scale(V.unit(R.chestU || R.u), -1)) > .8;
      push(hanging ? 'proportions' : 'self-collision', `${worst.a.seg}${worst.a.side} ⟂ ${worst.b.seg}${worst.b.side}${hanging ? ' (рука вдоль тела)' : ''}`, worst.depth);
    }
  }
  /* 4. Пределы суставов */
  for (const msg of jointChecks(R)) push('rom', msg.detail, msg.excess);
  /* 5. Инвентарь: висящие детали, снаряд без опоры, тросы сквозь тело */
  for (const msg of equipmentChecks(R, cols, body, floor)) push(msg.rule, msg.detail, msg.depth);
  return v;
}

function bodyFrame(R) { const u = V.unit(R.chestU || R.u), n = V.unit(R.chestN || R.n), x = V.unit(V.cross(n, u)); return { u, n, x }; }
function jointChecks(R) {
  const out = [], over = (value, lim, detail) => { if (value > lim.max + lim.tol) out.push({ detail: `${detail}: ${value.toFixed(0)}° > ${lim.max}°`, excess: value - lim.max }); };
  const F = bodyFrame(R), P = { u: V.unit(R.u), n: V.unit(R.n), x: V.unit(V.cross(V.unit(R.n), V.unit(R.u))) };
  for (const s of ['L', 'R']) {
    const side = s === 'L' ? -1 : 1, lat = V.scale(F.x, side), latP = V.scale(P.x, side);
    /* локоть */
    const ua = V.sub(R['el' + s], R['sh' + s]), fa = V.sub(R['wr' + s], R['el' + s]);
    const elbow = angleDeg(ua, fa); over(elbow, ROM.elbowFlexion, `локоть ${s} сгибание`);
    const hum = V.unit(ua), up = V.dot(hum, F.u), fwd = V.dot(hum, F.n), out_ = V.dot(hum, lat);
    if (up < 0 && fwd < 0) over(Math.atan2(-fwd, -up) / D2R, ROM.shoulderExtension, `плечо ${s} разгибание`);
    if (up > .2 && fwd < 0) over(Math.atan2(-fwd, Math.hypot(up, out_)) / D2R, ROM.elevatedPosterior, `плечо ${s} поднято и заведено назад`);
    if (Math.abs(up) < .5 && fwd < 0 && out_ > 0) over(Math.atan2(-fwd, out_) / D2R, ROM.shoulderHorizExtension, `плечо ${s} горизонтальное разгибание`);
    if (elbow > 25) { // плоскость сгиба локтя достижима ротацией плеча?
      const theta = Math.acos(clamp(-up, -1, 1)), k = V.cross(V.scale(F.u, -1), hum);
      const ref = V.len(k) < 1e-6 ? F.n : rotate(F.n, V.unit(k), theta);
      const dev = angleDeg(perp(fa, hum), perp(ref, hum));
      over(dev, ROM.elbowPlaneDeviation, `локоть ${s} гнётся в невозможную сторону`);
    }
    /* тазобедренный и колено */
    const th = V.sub(R['kn' + s], R['hip' + s]), shn = V.sub(R['an' + s], R['kn' + s]), fem = V.unit(th);
    const knee = angleDeg(th, shn); over(knee, ROM.kneeFlexion, `колено ${s} сгибание`);
    const hu = V.dot(fem, V.scale(P.u, -1)), hf = V.dot(fem, P.n), ho = V.dot(fem, latP);
    const flex = Math.atan2(hf, hu) / D2R; // 0 — бедро по оси корпуса вниз
    if (flex > 0) over(flex, ROM.hipFlexion, `бедро ${s} сгибание`); else over(-flex, ROM.hipExtension, `бедро ${s} разгибание`);
    if (ho > 0) over(Math.atan2(ho, Math.hypot(hu, Math.max(hf, 0))) / D2R, ROM.hipAbduction, `бедро ${s} отведение`);
    if (knee > 20) {
      const theta = Math.acos(clamp(hu, -1, 1)), k = V.cross(V.scale(P.u, -1), fem);
      const ref = V.len(k) < 1e-6 ? V.scale(P.n, -1) : rotate(V.scale(P.n, -1), V.unit(k), theta);
      over(angleDeg(perp(shn, fem), perp(ref, fem)), ROM.kneePlaneDeviation, `колено ${s} гнётся в невозможную сторону`);
    }
  }
  /* шея */
  if (R.headU) {
    const a = angleDeg(R.headU, F.u), sign = V.dot(V.unit(R.headU), F.n);
    if (sign > 0) over(a, ROM.neckFlexion, 'шея сгибание'); else over(a, ROM.neckExtension, 'шея разгибание');
  }
  return out;
}

function equipmentChecks(R, cols, body, floor) {
  const out = [], structural = cols.filter(c => !c.free && !c.cable && !c.unknown);
  const grips = ['L', 'R'].map(s => R['grip' + s]).filter(Boolean);
  const bodyPts = ['L', 'R'].flatMap(s => ['grip', 'hand', 'wr', 'an', 'toe', 'heel', 'kn'].map(k => R[k + s])).filter(Boolean);
  /* граф креплений: деталь заземлена, если касается пола или заземлённой детали */
  const grounded = new Set();
  structural.forEach((c, i) => { if (c.pts.some(p => p[1] >= floor - 2.5)) grounded.add(i); });
  let changed = true;
  while (changed) {
    changed = false;
    structural.forEach((c, i) => {
      if (grounded.has(i)) return;
      for (const j of grounded) { const o = structural[j]; if (c.pts.some(p => o.sdf(p) < 2) || o.pts.some(p => c.sdf(p) < 2)) { grounded.add(i); changed = true; break; } }
    });
  }
  structural.forEach((c, i) => {
    if (grounded.has(i)) return;
    // подвижный элемент, который держит атлет (рукоять тренажёра), — опирается через руки
    const held = c.pts.some(p => grips.some(g => V.dist(p, g) < 6));
    if (!held) out.push({ rule: 'floating', detail: `${c.kind}#${c.index}${c.role ? '(' + c.role + ')' : ''} не соединена с рамой и полом` });
  });
  /* снаряд: в руке или на опоре */
  const free = new Map();
  for (const c of cols) if (c.free) { const key = c.index; if (!free.has(key)) free.set(key, []); free.get(key).push(c); }
  for (const [index, parts] of free) {
    const held = parts.some(c => grips.some(g => c.sdf(g) < 4) || (c.part === 'bell' && grips.some(g => c.sdf(g) < 14)));
    const resting = parts.some(c => c.pts.some(p => p[1] >= floor - 3) || structural.some(o => c.pts.some(p => o.sdf(p) < 1.5)));
    const onBody = parts.some(c => c.pts.some(p => torsoSDF(body.torso, p) < 3));
    if (!held && !resting && !onBody) out.push({ rule: 'floating', detail: `снаряд #${index} висит без хвата и опоры` });
  }
  /* тросы и ленты: концы закреплены, середина не проходит сквозь тело */
  for (const c of cols.filter(c => c.cable)) {
    const anchored = p => structural.some(o => o.sdf(p) < 3) || bodyPts.some(b => V.dist(b, p) < 6) || cols.some(o => o.free && o.sdf(p) < 3);
    if (!anchored(c.a) || !anchored(c.b)) out.push({ rule: 'floating', detail: `трос/лента #${c.index} без крепления на конце` });
    const L = V.dist(c.a, c.b); let worst = 0, where = '';
    for (let i = 1; i < 24; i++) {
      const p = V.mix(c.a, c.b, i / 24), along = Math.min(i / 24, 1 - i / 24) * L; if (along < 7) continue;
      for (const s of body.spheres) { const d = s.r - V.dist(s.c, p); if (d > worst) { worst = d; where = s.seg + s.side; } }
      const dt = -torsoSDF(body.torso, p); if (dt > worst) { worst = dt; where = 'torso'; }
    }
    if (worst > 1.5) out.push({ rule: 'cable-through-body', detail: `трос/лента #${c.index} проходит сквозь ${where}`, depth: worst });
  }
  return out;
}

/* Проверка клипа: кадры по фазе + непрерывность */
function checkClip(frameAt, { samples = 41 } = {}) {
  const issues = new Map(); let prev = null;
  const keys = ['shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR', 'head'];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1), R = frameAt(t);
    for (const f of checkFrame(R)) {
      const key = f.rule + '|' + f.detail.replace(/[\d.]+°/g, '').replace(/#\d+/, '#');
      const old = issues.get(key);
      if (!old || (f.depth ?? 0) > (old.depth ?? 0)) issues.set(key, { ...f, severity: old?.severity === 'error' ? 'error' : f.severity, t: +t.toFixed(3), frames: (old?.frames || 0) + 1 });
      else old.frames++;
    }
    if (prev) for (const k of keys) if (R[k] && prev[k] && V.dist(R[k], prev[k]) > 14) {
      const key = 'jump|' + k; if (!issues.has(key)) issues.set(key, { rule: 'jump', severity: 'error', detail: `${k} скачок ${V.dist(R[k], prev[k]).toFixed(0)} см между кадрами`, t: +t.toFixed(3), frames: 1 });
    }
    prev = R;
  }
  return [...issues.values()];
}

module.exports = { FLOOR_Y, ROM, ROM_SOURCES, V, checkFrame, checkClip, bodyModel, colliders, torsoSDF, headSDF, jointChecks };
