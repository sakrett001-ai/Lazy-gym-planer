'use strict';
/* Валидатор поз манекена (R.basis === 'mannequin'): работает по рамкам сегментов и поверхности тела.
   Правила:
   rom            — углы суставов из рамок (позвоночник, шея, плечо, локоть, предплечье, запястье,
                    тазобедренный, колено, голеностоп, пальцы стопы) + двусуставные мышцы;
   penetration    — тело внутри инвентаря (мягкая обивка допускает поджатие);
   floor          — тело ниже пола;
   self-collision — сегменты тела друг в друге;
   contact        — заявленный контакт не выполнен (стопа над полом, хват мимо ручки, спина над скамьёй);
   mount          — деталь не касается того, к чему крепится, или цепочка не доходит до пола;
   free-weight    — снаряд не в руке и не на опоре;
   cable          — трос/лента проходит сквозь тело;
   balance        — общий центр масс вне площади опоры (стоя без других опор);
   jump           — скачок сустава между соседними кадрами.
   Координаты — каталога (см, Y вниз, пол 186). */
const M = require('../../src/js/09bm-mannequin.js');
const { V, M3 } = M;
const FLOOR = M.FLOOR, clamp = M.clamp;

/* ---------- рамки → углы: общий расчёт манекена (тот же, что у меток нагрузки на суставы в приложении) ---------- */
const angles = M.jointAngles;
/* пределы (град) и допуск: превышение до tol — предупреждение, больше — ошибка */
const LIM = {
  lumbarFlex: [-25, 50], lumbarLat: [-25, 25], lumbarRot: [-12, 12],
  thoracicFlex: [-20, 40], thoracicLat: [-25, 25], thoracicRot: [-35, 35],
  neckFlex: [-60, 50], neckLat: [-40, 40], neckRot: [-70, 70],
  elevation: [0, 180], extension: 60, horizExt: 45, elevatedPosterior: 35, twist: [-80, 95],
  elbow: [-5, 150], pron: [-90, 85], wristFlex: [-75, 80], wristDev: [-30, 22],
  hipFlex: [-20, 125], hipAbd: [-25, 45], hipRot: [-40, 45], knee: [-5, 145],
  dorsi: [-62, 36], inversion: [-20, 32], mtp: [-40, 80]
};
const TOL = 10;
function romChecks(R, entry = {}) {
  const a = angles(R), out = [], contacts = entry.contacts || R.contacts || [];
  /* ладонь, опёртая на пол или опору, разгибается пассивно под весом тела (до ~90°, отжимания) */
  const flat = s => R.hands?.[s] === 'flat' || contacts.some(k => k.body === 'palm' + s);
  const lim = (v, [lo, hi], name, tol = TOL) => { if (v > hi) out.push({ detail: `${name}: ${v.toFixed(0)}° > ${hi}°`, excess: v - hi, tol }); else if (v < lo) out.push({ detail: `${name}: ${v.toFixed(0)}° < ${lo}°`, excess: lo - v, tol }); };
  lim(a.lumbar[0], LIM.lumbarFlex, 'поясница сгибание/разгибание'); lim(a.lumbar[1], LIM.lumbarLat, 'поясница наклон'); lim(a.lumbar[2], LIM.lumbarRot, 'поясница ротация');
  lim(a.thoracic[0], LIM.thoracicFlex, 'грудной отдел сгибание/разгибание'); lim(a.thoracic[1], LIM.thoracicLat, 'грудной отдел наклон'); lim(a.thoracic[2], LIM.thoracicRot, 'грудной отдел ротация');
  lim(a.neck[0], LIM.neckFlex, 'шея сгибание/разгибание'); lim(a.neck[1], LIM.neckLat, 'шея наклон'); lim(a.neck[2], LIM.neckRot, 'шея поворот');
  for (const s of M.SIDES) {
    const A = a[s], n = x => x + ' ' + s;
    lim(A.elevation, LIM.elevation, n('плечо подъём'));
    /* плечо позади фронтальной плоскости: допустимый угол зависит от направления в этой плоскости
       (вниз — разгибание до 60°, в сторону — горизонтальное разгибание до 45°, вверх — до 30°) */
    if (A.posterior > 0) {
      const psi = Math.asin(clamp(A.posterior, -1, 1)) * M.R2D, beta = Math.abs(Math.atan2(A.lat, -A.up) * M.R2D);
      const maxPsi = beta <= 90 ? LIM.extension - (LIM.extension - LIM.horizExt) * beta / 90 : beta <= 150 ? LIM.horizExt - (LIM.horizExt - LIM.elevatedPosterior) * (beta - 90) / 60 : LIM.elevatedPosterior;
      lim(psi, [-999, +maxPsi.toFixed(0)], n(beta < 45 ? 'плечо разгибание' : beta < 120 ? 'плечо горизонтальное разгибание' : 'плечо поднято и заведено назад'));
    }
    lim(A.twist, LIM.twist, n('плечо ротация'), 15);
    lim(A.elbow, LIM.elbow, n('локоть'), 5);
    lim(A.pron, LIM.pron, n('предплечье пронация/супинация'));
    lim(A.wristFlex, flat(s) ? [-90, LIM.wristFlex[1]] : LIM.wristFlex, n('запястье сгибание/разгибание')); lim(A.wristDev, LIM.wristDev, n('запястье отведение'));
    if (Math.abs(A.wristTwist) > 3) out.push({ detail: n('запястье скручено вокруг оси') + ` ${A.wristTwist.toFixed(0)}°`, excess: Math.abs(A.wristTwist), tol: 5 });
    lim(A.hipFlex, LIM.hipFlex, n('бедро сгибание/разгибание'));
    lim(A.hipAbd, LIM.hipAbd, n('бедро отведение/приведение'));
    lim(A.hipRot, LIM.hipRot, n('бедро ротация'));
    lim(A.knee, LIM.knee, n('колено'), 5);
    lim(A.dorsi, LIM.dorsi, n('голеностоп'), 10);
    lim(A.inversion, LIM.inversion, n('стопа супинация/пронация'));
    if (Math.abs(A.ankleTwist) > 4) out.push({ detail: n('голеностоп скручен вокруг оси голени') + ` ${A.ankleTwist.toFixed(0)}°`, excess: Math.abs(A.ankleTwist), tol: 6 });
    lim(A.mtp, LIM.mtp, n('пальцы стопы'));
    /* двусуставные мышцы */
    const hamstring = 80 + .5 * Math.max(0, A.knee);
    if (A.hipFlex > hamstring) out.push({ detail: n('задняя поверхность бедра: сгибание бедра при прямом колене') + ` ${A.hipFlex.toFixed(0)}° при колене ${A.knee.toFixed(0)}°`, excess: A.hipFlex - hamstring, tol: 12 });
    const gastro = Math.min(42, 18 + .3 * Math.max(0, A.knee));
    if (A.dorsi > gastro) out.push({ detail: n('икроножная: тыльное сгибание') + ` ${A.dorsi.toFixed(0)}° при колене ${A.knee.toFixed(0)}°`, excess: A.dorsi - gastro, tol: 8 });
    const rectus = 20 - .14 * Math.max(0, A.knee);
    if (-A.hipFlex > rectus) out.push({ detail: n('прямая мышца бедра: разгибание бедра при согнутом колене') + ` ${(-A.hipFlex).toFixed(0)}°`, excess: -A.hipFlex - rectus, tol: 10 });
  }
  return { list: out, angles: a };
}

/* ---------- SDF инвентаря (каталог) ---------- */
function sdCapsule(p, a, b, r) { const pa = V.sub(p, a), ba = V.sub(b, a), bb = V.dot(ba, ba), h = bb < 1e-9 ? 0 : clamp(V.dot(pa, ba) / bb, 0, 1); return V.len(V.sub(pa, V.scale(ba, h))) - r; }
function sdOBB(p, c, axes, half) { const d = V.sub(p, c), q = axes.map((ax, i) => Math.abs(V.dot(d, ax)) - half[i]); return V.len(q.map(v => Math.max(v, 0))) + Math.min(Math.max(...q), 0); }
function sdCyl(p, c, axis, r, halfH) { const d = V.sub(p, c), y = V.dot(d, axis), rad = V.len(V.perp(d, axis)), dx = rad - r, dy = Math.abs(y) - halfH; return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)); }
const linspace = (a, b, step) => { const n = Math.max(1, Math.ceil(V.dist(a, b) / step)), out = []; for (let i = 0; i <= n; i++) out.push(V.mix(a, b, i / n)); return out; };
function beamAxes(s) { const y = V.unit(V.sub(s.b, s.a)); let z = V.perp(s.up || [0, -1, 0], y); if (V.len(z) < 1e-6) z = V.perp([0, 0, 1], y); if (V.len(z) < 1e-6) z = V.perp([1, 0, 0], y); z = V.unit(z); return [V.unit(V.cross(y, z)), y, z]; }
function collider(s) {
  const c = { id: s.id, kind: s.kind, role: s.role || '', tone: s.tone || 'frame', mount: s.mount, free: !!s.free, part: s.part, dyn: !!s.dyn, group: s.group, rides: s.rides || [] };
  c.soft = ['pad', 'mat'].includes(c.tone);
  if (s.kind === 'beam') {
    if (s.r) { c.sdf = p => sdCapsule(p, s.a, s.b, s.r); c.pts = linspace(s.a, s.b, 2); c.r = s.r; c.ptR = s.r; c.axis = [s.a, s.b]; }
    else { const ax = beamAxes(s), cc = V.mix(s.a, s.b, .5), half = [s.w / 2, V.dist(s.a, s.b) / 2, s.h / 2]; c.sdf = p => sdOBB(p, cc, ax, half); c.pts = obbPoints(cc, ax, half, 3); c.r = Math.min(s.w, s.h) / 2; }
  } else if (s.kind === 'obox') { const ax = [s.x, s.y, s.z].map(V.unit), half = s.size.map(v => v / 2); c.sdf = p => sdOBB(p, s.c, ax, half); c.pts = obbPoints(s.c, ax, half, 4); c.r = Math.min(...half); }
  else if (s.kind === 'cyl') { const ax = V.unit(s.axis); c.sdf = p => sdCyl(p, s.c, ax, s.r, s.len / 2); c.pts = cylPoints(s.c, ax, s.r, s.len / 2); c.r = Math.min(s.r, s.len / 2); }
  else if (s.kind === 'sphere') { c.sdf = p => V.dist(p, s.c) - s.r; c.pts = [s.c]; c.r = s.r; }
  else if (s.kind === 'cable') { c.cable = true; c.pts = s.pts; c.r = s.r; c.ptR = s.r; c.sdf = p => Math.min(...s.pts.slice(1).map((b, i) => sdCapsule(p, s.pts[i], b, s.r))); }
  else if (s.kind === 'barbell' || s.kind === 'dumbbell') return compound(s, c);
  else if (s.kind === 'kettlebell' && s.handleAxis) {
    const ax = V.unit(s.handleAxis), up = V.unit(V.sub(s.grip, s.c)), k = s.radius / 10.5, a = V.add(V.add(s.c, ax, -5 * k), up, 15.6 * k), b = V.add(V.add(s.c, ax, 5 * k), up, 15.6 * k);
    return [{ ...c, free: true, part: 'bell', r: s.radius, sdf: p => V.dist(p, s.c) - s.radius * .97, pts: cylPoints(s.c, up, s.radius * .9, s.radius * .5).concat([V.add(s.c, up, -s.radius)]) },
      { ...c, free: true, part: 'handle', grip: true, r: 1.7, ptR: 1.7, axis: [a, b], sdf: p => sdCapsule(p, a, b, 1.7), pts: linspace(a, b, 2) }];
  }
  else { c.unknown = true; c.sdf = () => Infinity; c.pts = []; }
  return [c];
}
function compound(s, base) {
  const ax = V.unit(s.axis), out = [];
  if (s.kind === 'barbell') {
    const a = V.add(s.c, ax, -s.inner), b = V.add(s.c, ax, s.inner);
    out.push({ ...base, part: 'shaft', grip: true, r: s.shaftR, ptR: s.shaftR, axis: [a, b], sdf: p => sdCapsule(p, a, b, s.shaftR), pts: linspace(a, b, 2) });
    for (const sign of [-1, 1]) {
      const sa = V.add(s.c, ax, sign * (s.inner + 2)), sb = V.add(s.c, ax, sign * s.len / 2);
      out.push({ ...base, part: 'sleeve', r: s.sleeveR, ptR: s.sleeveR, sdf: p => sdCapsule(p, sa, sb, s.sleeveR), pts: linspace(sa, sb, 3) });
      let at = s.inner + 2.4;
      for (const [r, th] of s.plates) { const pc = V.add(s.c, ax, sign * (at + th / 2)); out.push({ ...base, part: 'plate', r: Math.min(r, th / 2), sdf: p => sdCyl(p, pc, ax, r, th / 2), pts: cylPoints(pc, ax, r, th / 2) }); at += th + .3; }
    }
  } else {
    const a = V.add(s.c, ax, -s.handle / 2), b = V.add(s.c, ax, s.handle / 2);
    out.push({ ...base, part: 'handle', grip: true, r: 1.6, ptR: 1.6, axis: [a, b], sdf: p => sdCapsule(p, a, b, 1.6), pts: linspace(a, b, 2) });
    for (const sign of [-1, 1]) { const hc = V.add(s.c, ax, sign * (s.handle / 2 + 1.2 + s.headLen / 2)); out.push({ ...base, part: 'head', r: Math.min(s.headR, s.headLen / 2), sdf: p => sdCyl(p, hc, ax, s.headR, s.headLen / 2), pts: cylPoints(hc, ax, s.headR, s.headLen / 2) }); }
  }
  return out;
}
function obbPoints(c, axes, half, step) {
  const out = [], n = half.map(h => Math.max(1, Math.ceil(2 * h / step)));
  for (let i = 0; i <= n[0]; i++) for (let j = 0; j <= n[1]; j++) for (let k = 0; k <= n[2]; k++) {
    if (!(i === 0 || i === n[0] || j === 0 || j === n[1] || k === 0 || k === n[2])) continue;
    out.push(V.add(V.add(V.add(c, axes[0], -half[0] + 2 * half[0] * i / n[0]), axes[1], -half[1] + 2 * half[1] * j / n[1]), axes[2], -half[2] + 2 * half[2] * k / n[2]));
  }
  return out;
}
function cylPoints(c, ax, r, hh) {
  let u = V.perp([1, 0, 0], ax); if (V.len(u) < .1) u = V.perp([0, 0, 1], ax); u = V.unit(u); const w = V.cross(ax, u), out = [];
  for (const y of [-hh, 0, hh]) for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * Math.PI; out.push(V.add(V.add(V.add(c, ax, y), u, r * Math.cos(a)), w, r * Math.sin(a))); }
  for (const y of [-hh, hh]) for (const k of [.33, .66]) for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * Math.PI; out.push(V.add(V.add(V.add(c, ax, y), u, k * r * Math.cos(a)), w, k * r * Math.sin(a))); }
  return out;
}

/* ---------- точки тела ---------- */
function bodyPoints(R) {
  const S = M.surface(R, { cols: 24, limbRows: 12, limbCols: 16 }), pts = [];
  S.torsoHeights.forEach((h, i) => S.torso[i].forEach((p, c) => pts.push({ seg: 'torso', side: c <= 12 ? 'L' : 'R', h, p })));
  for (const [k, rows] of Object.entries(S.limbs)) rows.forEach((row, r) => row.forEach(p => pts.push({ seg: k.slice(0, 2), side: k.slice(2), t: r / (rows.length - 1), p })));
  S.neck.forEach(row => row.forEach(p => pts.push({ seg: 'neck', side: 'C', p })));
  const f = R.frames.head;
  for (let i = 0; i < 20; i++) for (let j = 1; j < 10; j++) { const th = i / 20 * 2 * Math.PI, ph = j / 10 * Math.PI, d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]; pts.push({ seg: 'head', side: 'C', p: V.add(V.add(V.add(R.head, f.x, d[0] * M.B.head[0]), f.y, d[1] * M.B.head[1]), f.z, d[2] * M.B.head[2]) }); }
  for (const s of M.SIDES) {
    const hf = R.frames['hand' + s], sh = M.handShape(R.hands?.[s] || 'relaxed', s, R.gripRadius?.[s] ?? 1.4), L = p => V.add(V.add(V.add(hf.o, hf.x, p[0]), hf.y, p[1]), hf.z, p[2]);
    for (const fg of [...sh.fingers, sh.thumb]) fg.pts.forEach((p, i) => pts.push({ seg: 'hand', side: s, part: 'finger', p: L(p), r: fg.r }));
    const pc = sh.palm.c, ps = sh.palm.size;
    for (const dx of [-.5, .5]) for (const dy of [-.5, 0, .5]) for (const dz of [-.5, 0, .5]) pts.push({ seg: 'hand', side: s, part: 'palm', p: L([pc[0] + dx * ps[0], pc[1] + dy * ps[1], pc[2] + dz * ps[2]]) });
    /* стопа — точки её поверхности (Mannequin.footPoints): задний и средний отдел в рамке foot, пальцы в рамке toes,
       передний отдел у плюснефаланговых суставов — между ними */
    const ff = { rear: R.frames['foot' + s], toes: R.frames['toes' + s] };
    for (const fp of M.footPoints(s)) pts.push({ seg: 'foot', side: s, part: fp.part, sole: fp.sole, p: M.footPointWorld(ff.rear, ff.toes, fp) });
    /* лодыжки выступают из голени: проверяются как её поверхность */
    for (const p of M.malleoli(R, s)) pts.push({ seg: 'sk', side: s, t: 1, p });
  }
  return pts;
}

/* ---------- быстрые отсечения по габаритам ----------
   Объём сегмента тела лежит внутри габарита его точек поверхности с запасом ~1,5 см (хорда между образующими),
   а все проверки ниже срабатывают не дальше 2,5 см снаружи. Поэтому запас BOX_M = 4 см не меняет результат,
   только пропускает заведомо далёкие пары. */
const BOX_M = 4;
function aabb(list, pad = 0) { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (const p of list) for (let i = 0; i < 3; i++) { if (p[i] < lo[i]) lo[i] = p[i]; if (p[i] > hi[i]) hi[i] = p[i]; } for (let i = 0; i < 3; i++) { lo[i] -= pad; hi[i] += pad; } return { lo, hi }; }
const inBox = (b, p, m = 0) => !!b && p[0] >= b.lo[0] - m && p[0] <= b.hi[0] + m && p[1] >= b.lo[1] - m && p[1] <= b.hi[1] + m && p[2] >= b.lo[2] - m && p[2] <= b.hi[2] + m;
const boxesMeet = (a, b, m = 0) => a.lo.every((v, i) => v - m <= b.hi[i]) && b.lo.every((v, i) => v - m <= a.hi[i]);
function segBoxes(pts) {
  const g = {}; for (const b of pts) { const k = b.seg === 'torso' || b.seg === 'head' || b.seg === 'neck' ? b.seg : b.seg + b.side; (g[k] = g[k] || []).push(b.p); }
  const out = {}; for (const [k, l] of Object.entries(g)) out[k] = aabb(l); out.body = aabb(pts.map(b => b.p)); return out;
}
/* габарит детали инвентаря: точки детали плюс радиус (капсулы, сферы) и 1 см */
function withBox(c) { c.box = aabb(c.pts, Math.max(c.r || 0, c.ptR || 0) + 1); return c; }

/* ---------- контакты ---------- */
function regionPoints(name, pts, R) {
  const m = /^(sole|grip|palm|knee|shin|hand|ua|fa|th|sk|foot)(L|R)?$/.exec(name);
  if (name === 'back') return pts.filter(p => p.seg === 'torso' && p.h >= -4 && p.h <= 52);
  if (name === 'upperBack' || name === 'chest' || name === 'front' || name === 'belly') return pts.filter(p => p.seg === 'torso' && p.h >= (name === 'upperBack' ? 26 : name === 'belly' ? -4 : 10) && p.h <= (name === 'belly' ? 30 : 50));
  if (name === 'buttocks') return pts.filter(p => (p.seg === 'torso' && p.h <= 6) || (p.seg === 'th' && p.t <= .6));
  if (name === 'thighsBack') return pts.filter(p => p.seg === 'th');
  if (name === 'shoulders') return pts.filter(p => (p.seg === 'torso' && p.h >= 47) || (p.seg === 'ua' && p.t <= .15));
  if (name === 'neck') return pts.filter(p => p.seg === 'neck');
  if (name === 'headBack' || name === 'headAll') return pts.filter(p => p.seg === 'head');
  if (m) {
    const [, k, s] = m;
    if (k === 'sole') return pts.filter(p => p.seg === 'foot' && p.side === s && p.sole);
    if (k === 'foot') return pts.filter(p => p.seg === 'foot' && p.side === s);
    if (k === 'palm' || k === 'hand') return pts.filter(p => p.seg === 'hand' && p.side === s);
    if (k === 'knee') return pts.filter(p => (p.seg === 'sk' && p.side === s && p.t <= .25) || (p.seg === 'th' && p.side === s && p.t >= .85));
    if (k === 'shin') return pts.filter(p => p.seg === 'sk' && p.side === s);
    return pts.filter(p => p.seg === k && p.side === s);
  }
  throw Error('Неизвестная область контакта ' + name);
}

/* ---------- кадр ---------- */
function checkFrame(R, entry = {}) {
  const issues = [], push = (rule, severity, detail, depth, unit = 'см') => issues.push({ rule, severity, detail, depth: depth == null ? undefined : +(+depth).toFixed(1), unit });
  const EQV = require('../../src/js/09bn-equipment.js').visible;
  const props = (R.props || []).filter(p => EQV(p, entry.has || (() => true))), cols = props.flatMap(collider).map(withBox), byId = new Map(); for (const c of cols) { if (!byId.has(c.id)) byId.set(c.id, []); byId.get(c.id).push(c); }
  const pts = bodyPoints(R), cache = M.torsoCache(R), SB = segBoxes(pts);
  /* знаковые расстояния тела с отсечением по габаритам: далеко от сегмента — «бесконечно далеко» */
  const torsoD = p => inBox(SB.torso, p, BOX_M) ? M.torsoSDF(R, p, cache) : Infinity;
  const headD = p => inBox(SB.head, p, BOX_M) ? M.headSDF(R, p) : Infinity;
  const limbD = (k, s, p) => inBox(SB[k + s], p, BOX_M) ? M.limbSDF(R, k, s, p) : Infinity;
  const contacts = entry.contacts || R.contacts || [];
  const gripProps = new Set(contacts.filter(c => /^grip/.test(c.body)).map(c => c.prop));
  const touching = new Set(contacts.map(c => c.prop));
  /* заявленная опора: мягкие ткани и обивка поджимаются сильнее (ягодицы на сиденье — до 4 см) */
  const declared = c => contacts.some(k => !/^grip/.test(k.body) && k.prop !== 'floor' && (c.id === k.prop || c.id.startsWith(k.prop + ':')));
  const isGripCol = (c, side) => c.grip || c.role === 'grip' || contacts.some(k => k.body === 'grip' + side && (c.id === k.prop || c.id.startsWith(k.prop + ':')));
  /* 1. Суставы */
  const rom = romChecks(R, entry);
  for (const r of rom.list) push('rom', r.excess > r.tol ? 'error' : 'warn', r.detail, r.excess, '°');
  /* 2. Тело в инвентаре */
  for (const c of cols) {
    if (c.unknown || c.cable) continue;
    if (!boxesMeet(c.box, SB.body, BOX_M)) continue;
    let worst = null;
    for (const b of pts) {
      if (!inBox(c.box, b.p)) continue;
      if (b.seg === 'hand' && isGripCol(c, b.side)) continue;
      if (b.seg === 'hand' && b.part === 'palm' && contacts.some(k => k.body === 'palm' + b.side)) continue;
      if (b.seg === 'fa' && b.t > .8 && isGripCol(c, b.side)) continue;
      const d = c.sdf(b.p), depth = -d - (b.r || 0) * .5;
      let tol = declared(c) ? (c.soft ? 4 : 2) : c.soft ? 2.5 : .8;
      if (b.seg === 'foot') tol = c.soft ? 1.5 : .8;
      if (b.seg === 'hand' && b.part === 'finger') tol = 1.2;
      if (depth > tol && (!worst || depth - tol > worst.depth - worst.tol)) worst = { b, depth, tol };
    }
    /* тонкие детали: точки детали внутри тела */
    for (const p of c.pts) {
      if (!inBox(SB.body, p, BOX_M)) continue;
      const dT = torsoD(p), dH = headD(p), rr = c.ptR || 0;
      const tol = declared(c) ? (c.soft ? 4 : 2) : c.soft ? 2.5 : .8;
      const nearHand = c.grip && M.SIDES.some(sd => V.dist(p, R['grip' + sd]) < 10);
      if (!nearHand && -dT + Math.min(rr, 2) > tol && (!worst || -dT + Math.min(rr, 2) - tol > worst.depth - worst.tol)) worst = { b: { seg: 'torso', side: 'C' }, depth: -dT + Math.min(rr, 2), tol };
      if (-dH + Math.min(rr, 2) > .8 && (!worst || -dH + Math.min(rr, 2) - .8 > worst.depth - worst.tol)) worst = { b: { seg: 'head', side: 'C' }, depth: -dH + Math.min(rr, 2), tol: .8 };
      for (const s of M.SIDES) for (const k of ['ua', 'fa', 'th', 'sk']) {
        if (c.grip && (k === 'fa')) continue;
        const d = -limbD(k, s, p) + Math.min(rr, 2);
        if (d > tol && (!worst || d - tol > worst.depth - worst.tol)) worst = { b: { seg: k, side: s }, depth: d, tol };
      }
    }
    if (worst) push('penetration', worst.depth - worst.tol > 3 ? 'error' : 'warn', `${worst.b.seg}${worst.b.side} ⟂ ${c.id}${c.part ? '/' + c.part : ''}`, worst.depth);
  }
  /* 3. Пол (Y вниз: ниже пола — y > 186) */
  {
    let worst = null;
    for (const b of pts) { const depth = b.p[1] - FLOOR - (b.seg === 'foot' ? .6 : 0); const tol = b.seg === 'foot' ? .4 : 1.0; if (depth > tol && (!worst || depth > worst.depth)) worst = { b, depth }; }
    if (worst) push('floor', worst.depth > 3 ? 'error' : 'warn', `${worst.b.seg}${worst.b.side} ниже пола`, worst.depth);
    for (const c of cols) { const low = Math.max(...c.pts.map(p => p[1])); if (low > FLOOR + 1) push('floor', 'error', `${c.id} ниже пола`, low - FLOOR); }
  }
  /* 4. Самопересечения */
  {
    let worst = null;
    const adj = { ua: ['fa', 'torso', 'neck'], fa: ['ua', 'hand'], hand: ['fa'], th: ['sk', 'torso'], sk: ['th', 'foot'], foot: ['sk'], neck: ['torso', 'head', 'ua'], head: ['neck'], torso: ['ua', 'th', 'neck'] };
    const tolPair = (a, b) => (a === 'ua' || b === 'ua') && (a === 'torso' || b === 'torso') ? 3.2 : (a === 'th' || b === 'th') && (a === 'torso' || b === 'torso') ? 3.5 : (a === 'th' && b === 'th') ? 2.5 : (a === 'sk' || b === 'sk') && (a === 'th' || b === 'th') ? 3 : 1.5;
    for (const b of pts) {
      /* против корпуса */
      if (!['torso', 'neck'].includes(b.seg) && !(b.seg === 'ua' && b.t < .3) && !(b.seg === 'th' && b.t < .35)) {
        const d = -torsoD(b.p) - (b.r || 0) * .5, tol = tolPair(b.seg, 'torso');
        if (d > tol && (!worst || d - tol > worst.depth - worst.tol)) worst = { a: b.seg + b.side, b: 'torso', depth: d, tol };
      }
      /* против головы */
      if (!['head', 'neck', 'torso'].includes(b.seg)) { const d = -headD(b.p), tol = 1.2; if (d > tol && (!worst || d - tol > worst.depth - worst.tol)) worst = { a: b.seg + b.side, b: 'head', depth: d, tol }; }
      /* против конечностей */
      if (['torso', 'neck'].includes(b.seg)) continue;
      for (const s of M.SIDES) for (const k of ['ua', 'fa', 'th', 'sk']) {
        if (s === b.side && (k === b.seg || (adj[b.seg] || []).includes(k))) continue;
        if (b.seg === 'hand' && s === b.side && k === 'fa') continue;
        if (b.seg === 'th' && k === 'th' && b.t < .3) continue;
        const d = -limbD(k, s, b.p) - (b.r || 0) * .5, tol = tolPair(b.seg, k);
        if (d > tol && (!worst || d - tol > worst.depth - worst.tol)) worst = { a: b.seg + b.side, b: k + s, depth: d, tol };
      }
    }
    if (worst) push('self-collision', worst.depth - worst.tol > 3 ? 'error' : 'warn', `${worst.a} ⟂ ${worst.b}`, worst.depth);
  }
  /* 5. Заявленные контакты */
  for (const k of contacts) {
    /* контакт может действовать только в части цикла: when [t0, t1] (прыжки, шаги) */
    if (k.when && entry.t != null && (entry.t < k.when[0] - 1e-6 || entry.t > k.when[1] + 1e-6)) continue;
    if (k.prop !== 'floor' && !cols.some(c => c.id === k.prop || c.id.startsWith(k.prop + ':'))) { if (k.optional) continue; }
    const region = /^grip(L|R)$/.test(k.body) ? null : regionPoints(k.body, pts, R);
    if (/^grip(L|R)$/.test(k.body)) {
      const s = k.body.slice(4), g = R['grip' + s], cand = cols.filter(c => c.id === k.prop || c.id.startsWith(k.prop + ':'));
      const handle = cand.filter(c => c.grip || c.role === 'grip');
      const list = handle.length ? handle : cand;
      if (!list.length) { push('contact', 'error', `${k.body}: нет детали ${k.prop}`); continue; }
      const d = Math.min(...list.map(c => c.sdf(g) + (c.r || 0)));
      const r = list[0].r || 1.4;
      if (d - r > 1.2 || d < -.3) push('contact', Math.abs(d - r) > 3 ? 'error' : 'warn', `${k.body} мимо ${k.prop}: центр хвата в ${(d - r).toFixed(1)} см от оси ручки`, Math.abs(d - r));
      const ax = list.find(c => c.axis)?.axis;
      if (ax) { const ang = V.angle(R.frames['hand' + s].z, V.sub(ax[1], ax[0])), off = Math.min(ang, 180 - ang); if (off > (k.axisTol ?? 25)) push('contact', off > 45 ? 'error' : 'warn', `${k.body}: ладонь повёрнута к ручке под ${off.toFixed(0)}°`, off, '°'); }
      continue;
    }
    if (k.prop === 'floor') {
      const min = Math.min(...region.map(p => FLOOR - p.p[1]));
      const gap = min, lim = k.gap ?? 1.2;
      if (gap > lim) push('contact', gap > 4 ? 'error' : 'warn', `${k.body} не касается пола: зазор ${gap.toFixed(1)} см`, gap);
      continue;
    }
    const cand = cols.filter(c => c.id === k.prop || c.id.startsWith(k.prop + ':'));
    if (!cand.length) { push('contact', 'error', `${k.body}: нет детали ${k.prop}`); continue; }
    let min = Infinity; for (const c of cand) for (const p of region) min = Math.min(min, c.sdf(p.p));
    const lim = k.gap ?? 1.5;
    if (min > lim) push('contact', min > 4 ? 'error' : 'warn', `${k.body} не касается ${k.prop}: зазор ${min.toFixed(1)} см`, min);
  }
  /* 6. Крепления деталей и свободные снаряды */
  {
    const ids = new Map(); for (const c of cols) { if (!ids.has(c.id)) ids.set(c.id, []); ids.get(c.id).push(c); }
    const dist = (A, B) => { let m = Infinity; for (const a of A) for (const p of a.pts) for (const b of B) m = Math.min(m, b.sdf(p)); for (const b of B) for (const p of b.pts) for (const a of A) m = Math.min(m, a.sdf(p)); return m; };
    const grounded = new Map();
    const chain = (id, seen = new Set()) => {
      if (grounded.has(id)) return grounded.get(id);
      if (seen.has(id)) return false; seen.add(id);
      const parts = ids.get(id); if (!parts) return false;
      const m = parts[0].mount;
      let ok;
      if (m === 'floor') ok = Math.max(...parts.flatMap(c => c.pts.map(p => p[1]))) >= FLOOR - 1.2;
      else if (['hands', 'hand', 'body'].includes(m)) ok = true;
      else ok = ids.has(m) && chain(m, seen);
      grounded.set(id, ok); return ok;
    };
    for (const [id, parts] of ids) {
      const c = parts[0];
      if (c.free || c.cable) continue;
      if (c.mount === 'floor') { const low = Math.max(...parts.flatMap(p => p.pts.map(q => q[1]))); if (low < FLOOR - 1.2) push('mount', 'error', `${id} висит над полом на ${(FLOOR - low).toFixed(1)} см`, FLOOR - low); continue; }
      if (['hands', 'hand', 'body'].includes(c.mount)) continue;
      const target = ids.get(c.mount);
      if (!target) { push('mount', 'error', `${id}: нет детали крепления ${c.mount}`); continue; }
      const d = dist(parts, target);
      if (d > 1.2) push('mount', 'error', `${id} не касается ${c.mount}: зазор ${d.toFixed(1)} см`, d);
      if (!chain(id)) push('mount', 'error', `${id}: цепочка креплений не доходит до пола`);
    }
    /* свободные снаряды: в руке или на опоре */
    const freeIds = [...ids.entries()].filter(([, p]) => p[0].free);
    for (const [id, parts] of freeIds) {
      const grip = parts.filter(p => p.grip);
      const held = M.SIDES.some(s => grip.some(c => c.sdf(R['grip' + s]) < 2.5));
      const supports = cols.filter(c => !c.free && !c.cable && c.id !== id);
      const resting = parts.some(c => c.pts.some(p => p[1] >= FLOOR - 1.2 || supports.some(o => o.sdf(p) < 1.2)));
      const onBody = parts.some(c => c.pts.some(p => torsoD(p) < 2.5));
      if (!held && !resting && !onBody) push('free-weight', 'error', `${id} не в руке и не на опоре`);
    }
  }
  /* 6б. Снаряд против снаряда: гриф в стойку, гантель в скамью, рычаг в раму.
     Неподвижные детали сверяются один раз (на первом кадре), подвижные — в каждом. */
  {
    const item = c => String(c.id).split(':')[0];
    /* По устройству пересекаются: деталь узла и ось/направляющая, на которой узел сидит (каретка на штанге Смита,
       рычаг на оси, салазки на направляющей), деталь и ось её втулки, плиты стека и их направляющие (rides). */
    const seat = new Set(); for (const c of cols) if (c.mount && item({ id: c.mount }) !== item(c)) seat.add(item(c) + '|' + c.mount);
    const joint = (x, y) => { const h = byId.get(x.mount)?.[0]; return seat.has(item(x) + '|' + y.id) || x.rides.includes(y.id) || (!!h && /hub|bearing|bushing/i.test(h.id) && h.mount === y.id); };
    const skip = (a, b) => item(a) === item(b) || a.mount === b.id || b.mount === a.id || joint(a, b) || joint(b, a) || a.cable || b.cable || a.unknown || b.unknown;
    const sub = pts => pts.length <= 260 ? pts : pts.filter((_, i) => i % Math.ceil(pts.length / 260) === 0);
    let worst = null;
    for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
      const a = cols[i], b = cols[j];
      if (skip(a, b) || (!a.dyn && !b.dyn && entry.t != null && entry.t > 0) || !boxesMeet(a.box, b.box)) continue;
      for (const [x, y] of [[a, b], [b, a]]) for (const p of sub(x.pts)) {
        const d = (x.ptR || 0) - y.sdf(p);
        /* сквозное прохождение тонких деталей (стойка сквозь подушку) ограничено их толщиной — поэтому порог
           ошибки — 4 см или 80 % полутолщины более тонкой детали */
        const thin = Math.min(x.r || Infinity, y.r || Infinity), through = d >= Math.max(1.5, .8 * thin);
        if (d > 1.5 && (!worst || d > worst.d)) worst = { d, through, a: x.id + (x.part ? '/' + x.part : ''), b: y.id + (y.part ? '/' + y.part : '') };
      }
    }
    if (worst) push('equipment', worst.d > 4 || worst.through ? 'error' : 'warn', `${worst.a} ⟂ ${worst.b}`, worst.d);
  }
  /* 7. Тросы и ленты */
  for (const c of cols.filter(c => c.cable)) {
    let worst = 0, where = '';
    for (let i = 1; i < c.pts.length; i++) {
      const a = c.pts[i - 1], b = c.pts[i], n = Math.ceil(V.dist(a, b) / 2);
      for (let j = 0; j <= n; j++) {
        const p = V.mix(a, b, j / n);
        if (M.SIDES.some(s => V.dist(p, R['grip' + s]) < 9)) continue;
        if (i === 1 && j === 0) continue;
        if (!inBox(SB.body, p, BOX_M)) continue;
        const dT = -torsoD(p) + c.r; if (dT > worst) { worst = dT; where = 'torso'; }
        const dH = -headD(p) + c.r; if (dH > worst) { worst = dH; where = 'head'; }
        for (const s of M.SIDES) for (const k of ['ua', 'fa', 'th', 'sk']) { const d = -limbD(k, s, p) + c.r; if (d > worst) { worst = d; where = k + s; } }
      }
    }
    if (worst > 1.0) push('cable', worst > 3 ? 'error' : 'warn', `${c.id} проходит сквозь ${where}`, worst);
  }
  /* 8. Равновесие: только если тело опирается лишь на пол */
  const active = contacts.filter(k => !(k.when && entry.t != null && (entry.t < k.when[0] || entry.t > k.when[1])));
  /* коврик и низкая платформа на полу считаются полом */
  const floorLike = cols.filter(c => c.tone === 'mat' || (c.mount === 'floor' && c.role === 'support' && Math.min(...c.pts.map(p => FLOOR - p[1])) < .5 && Math.max(...c.pts.map(p => FLOOR - p[1])) < 4));
  const isFloorLike = k => k.prop === 'floor' || floorLike.some(c => c.id === k.prop || c.id.startsWith(k.prop + ':'));
  if (!entry.dynamic && active.length && active.every(isFloorLike)) {
    /* масса снарядов в руках: гриф 20 кг + диски, гантель 12 кг, гиря 16 кг */
    const plateKg = ([r, th]) => r >= 22 ? (th >= 5 ? 20 : th >= 4 ? 15 : 10) : r >= 11 ? 5 : r >= 9 ? 2.5 : 1.25;
    const heldMass = props.filter(p => p.free && p.c && M.SIDES.some(sd => V.dist(R['grip' + sd], p.grip || p.c) < (p.kind === 'barbell' ? 70 : 12))).map(p => [p.c, p.kind === 'barbell' ? (p.len >= 200 ? 20 : 10) + 2 * (p.plates || []).reduce((a, q) => a + plateKg(q), 0) : p.kind === 'kettlebell' ? 16 : 12]);
    const freeMass = (entry.loads || []).map(l => [l.at === 'grips' ? V.mix(R.gripL, R.gripR, .5) : R[l.at], l.kg]).concat(heldMass);
    const com = M.centerOfMass(R, freeMass).c, top = Math.max(0, ...floorLike.map(c => FLOOR - Math.min(...c.pts.map(p => p[1]))));
    const base = pts.filter(p => FLOOR - p.p[1] < 1.2 + top && ['foot', 'hand', 'sk', 'th', 'fa', 'torso'].includes(p.seg) && (FLOOR - p.p[1] < 1.2 || floorLike.some(c => c.sdf(p.p) < 1.5))).map(p => [p.p[0], p.p[2]]);
    if (base.length >= 3) {
      const hull = convexHull(base), d = hullDistance(hull, [com[0], com[2]]);
      if (d > 2) push('balance', d > 6 ? 'error' : 'warn', `центр масс вне площади опоры на ${d.toFixed(1)} см`, d);
    }
  }
  return { issues, angles: rom.angles };
}
function convexHull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function hullDistance(h, q) {
  if (h.length < 3) return Infinity;
  let inside = true, best = Infinity;
  for (let i = 0; i < h.length; i++) {
    const a = h[i], b = h[(i + 1) % h.length], e = [b[0] - a[0], b[1] - a[1]], w = [q[0] - a[0], q[1] - a[1]];
    if (e[0] * w[1] - e[1] * w[0] < 0) inside = false;
    const t = clamp((w[0] * e[0] + w[1] * e[1]) / (e[0] * e[0] + e[1] * e[1] || 1), 0, 1); best = Math.min(best, Math.hypot(w[0] - e[0] * t, w[1] - e[1] * t));
  }
  return inside ? 0 : best;
}
/* ---------- клип ---------- */
function checkClip(frameAt, entry = {}, { samples = 41 } = {}) {
  const issues = new Map(); let prev = null;
  const keys = ['shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR', 'head'];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1), R = frameAt(t), { issues: list } = checkFrame(R, { ...entry, t });
    for (const f of list) {
      const key = f.rule + '|' + f.detail.replace(/-?[\d.]+(°| см)/g, '').replace(/\d+/g, '#');
      const old = issues.get(key);
      if (!old) issues.set(key, { ...f, t: +t.toFixed(3), frames: 1 });
      else { old.frames++; if ((f.depth ?? 0) > (old.depth ?? 0)) Object.assign(old, { ...f, t: +t.toFixed(3), frames: old.frames, severity: old.severity === 'error' ? 'error' : f.severity }); else if (f.severity === 'error') old.severity = 'error'; }
    }
    if (prev) for (const k of keys) { const d = V.dist(R[k], prev[k]); if (d > (entry.dynamic ? 24 : 14)) issues.set('jump|' + k, { rule: 'jump', severity: 'error', detail: `${k} скачок ${d.toFixed(0)} см между кадрами`, t: +t.toFixed(3), frames: 1 }); }
    prev = R;
  }
  /* замкнутый цикл: конец совпадает с началом */
  if (entry.loop) { const a = frameAt(0), b = frameAt(1); for (const k of keys) { const d = V.dist(a[k], b[k]); if (d > 1) { issues.set('loop|' + k, { rule: 'loop', severity: 'error', detail: `цикл не замкнут: ${k} в конце на ${d.toFixed(1)} см от начала`, t: 1, frames: 1 }); break; } } }
  return [...issues.values()];
}
module.exports = { checkFrame, checkClip, angles, romChecks, bodyPoints, collider, LIM };
