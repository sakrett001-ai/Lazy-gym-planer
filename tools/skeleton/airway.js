'use strict';
/* Гортань и трахея — подъязычная кость, щитовидный и перстневидный хрящи, трахея с кольцами до бифуркации и начала главных
   бронхов. В MyoSim и в других открытых моделях с лицензией, совместимой с проектом (OpenSim: Rajagopal 2016, MoBL-ARMS, DAS3,
   Gait2392), сеток этих хрящей нет; сетки BodyParts3D / Z-Anatomy — CC BY-SA (условие «share-alike» легло бы на весь
   skeleton.bin). Поэтому — параметрическая геометрия по размерам взрослого мужчины (источники — у каждого числа в P).

   node tools/skeleton/airway.js [qa/skeleton/bones.json]
   Убирает из bones.json прежние кости гортани (seg 'airway') и добавляет новые; дальше — tools/skeleton/pack.js.
   Координаты — рамка шеи манекена (см; X влево, Y вверх, Z вперёд; начало — у остистого отростка C7, B.c7 в рамке грудной
   клетки). В кадре кость гортани — в рамке шеи, повёрнутой к рамке грудной клетки на долю wt (у трахеи ниже шарнира шеи)
   или к рамке головы на долю wh (подъязычная кость подвешена к нижней челюсти), — Skeleton.frames, сегмент 'airway'. */
const fs = require('node:fs'), path = require('node:path');

/* ---------- размеры (см) ---------- */
const P = {
  /* Подъязычная кость. Fakhry N. et al., Dysphagia 2013, 28: 435–445 (3D-морфометрия, мужчины): длина (от передней
     поверхности тела до концов больших рогов) 39,1 мм, ширина (между концами больших рогов) 42,3 мм, угол между большими
     рогами 38,8°. Тело — высота 1,0 и толщина 0,4 см (оценка по пропорциям: тело — четырёхугольная пластинка, Gray's
     Anatomy, 1918, с. 186). */
  hyoid: { len: 3.91, width: 4.23, hornAngle: 38.8, bodyW: 2.4, bodyH: 1.0, bodyT: .4, hornH0: .45, hornH1: .28, hornT0: .32, hornT1: .22, tip: .24, rise: .5 },
  /* Щитовидный хрящ. Rawal J. D. et al., NJIRM 2014, 5(3): 46–50 (мужчины): высота пластинки 26,6 мм, ширина (от вырезки до
     заднего края) 36,8–37,1 мм; Eckel H. E. et al., Surg Radiol Anat 1994, 16: 31–36 — высота 27,4–27,6 мм. Угол между
     пластинками у мужчин ≈ 90° (Gray's Anatomy, 1918, с. 1074; у Rawal — 74 ± 8°): берётся 90° — у манекена между
     позвонками и кожей шеи нет места для более глубокого (74° — на 0,35 см глубже). Верхняя вырезка — 0,9 см,
     толщина пластинки — 0,25; верхний рог — 1,5 см, нижний — 0,7 (Gray's: рога короткие, нижний — к перстневидному). */
  thyroid: { height: 2.7, lamina: 3.7, angle: 86, notch: .9, thick: .25, crest: .25, recess: .4, bulge: .1, supHorn: 1.5, infHorn: .7, hornR: .2 },
  /* Перстневидный хрящ. Kim I. S., Song C. H., Korean J Phys Anthropol 2017, 30(1): 15–20 (33 мужчины): высота пластинки
     22,3 мм, высота дуги 7,1 мм, переднезадний размер сверху 28,5 мм, внутренний поперечный сверху 17,2 мм, внутренний
     переднезадний снизу 18,8 мм. Стенка: дуга — 0,25 см, бока — 0,3, пластинка — 0,6 (переднезадний снаружи — 2,73). */
  cricoid: { lamina: 2.23, arch: .71, inX: .86, inZ: .94, wallArch: .25, wallSide: .3, wallLam: .6 },
  /* Трахея (Gray's Anatomy, 1918, с. 1082–1084): от нижнего края перстневидного хряща (C6) до бифуркации у верхнего края T5,
     ≈ 11 см; поперечник — 2–2,5 см; 16–20 хрящевых полуколец высотой ≈ 4 мм и толщиной ≈ 1 мм, закрывают переднюю ≈ 2/3
     окружности, сзади — перепончатая стенка (трахея сзади уплощена). Поперечник у мужчин (КТ): в среднем 22 мм
     (Boiselle P. M., Clin Chest Med 2008, 29: 181–193). Правый главный бронх — короче, шире и круче (≈ 25° к оси трахеи,
     2,5 см), левый — длиннее и положе (≈ 45°, ≈ 5 см; Gray's): рисуется начало обоих. */
  trachea: { rx: 1.1, rzF: .95, rzB: .72, ring: .4, ringT: .12, arc: 120, rings: 16, wall: .02 },
  bronchi: { R: { ang: 25, len: 2.2, r: .75, rings: 3 }, L: { ang: 45, len: 2.6, r: .62, rings: 4 } },
};

/* ---------- посадка в рамке шеи (см) ---------- */
const POS = {
  hyoid: { y: 1.9, zf: 11.0, wh: +(process.env.AW_WHH || .92) },          // тело: середина по высоте, передняя поверхность
  thyroid: { yn: 0, zp: 8.55, wh: +(process.env.AW_WHT || .15) },   // вершина вырезки на выступе (адамово яблоко)
  cricoid: { y0: -3.25, z: 7.25, wh: +(process.env.AW_WHC || 0) },  // низ дуги спереди; центр кольца по глубине
  /* ось трахеи: от центра низа перстневидного хряща к бифуркации — опорные точки [y, z], между ними — сплайн */
  axis: [[-3.25, 7.25], [-4.5, 7.35], [-6, 7.1], [-7.5, 6.75], [-9.5, 6.15], [-11.6, 5.55]],
  /* доля поворота к грудной клетке у сегментов трахеи: 0 выше y = -1, 1 ниже y = -6.5 */
  blend: [-1, -6.5],
};

/* ---------- векторы ---------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.sqrt(dot(a, a)), unit = a => mul(a, 1 / (len(a) || 1)), mix = (a, b, t) => add(a, mul(sub(b, a), t));
const D2R = Math.PI / 180, smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

/* ---------- сетки ---------- */
function Mesh() { return { v: [], f: [] }; }
function vtx(m, p) { m.v.push(p[0], p[1], p[2]); return m.v.length / 3 - 1; }
/* лофт по кольцам одинаковой длины K (каждое — замкнутый контур); торцы — веером к центру */
function loft(m, rings, { capStart = true, capEnd = true, closed = false } = {}) {
  const K = rings[0].length, base = rings.map(r => r.map(p => vtx(m, p))), n = rings.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = base[i], b = base[(i + 1) % n];
    for (let k = 0; k < K; k++) { const k1 = (k + 1) % K; m.f.push(a[k], b[k], b[k1], a[k], b[k1], a[k1]); }
  }
  const cap = (ids, pts, rev) => { const c = vtx(m, mul(pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / pts.length)); for (let k = 0; k < K; k++) { const k1 = (k + 1) % K; if (rev) m.f.push(c, ids[k1], ids[k]); else m.f.push(c, ids[k], ids[k1]); } };
  if (!closed && capStart) cap(base[0], rings[0], true);
  if (!closed && capEnd) cap(base[n - 1], rings[n - 1], false);
  return m;
}
/* объём со знаком; у замкнутой сетки с нормалями наружу — положительный (рамка правая: X влево, Y вверх, Z вперёд) */
function volume(v, f, from = 0) { let s = 0; for (let i = from; i < f.length; i += 3) { const a = [v[f[i] * 3], v[f[i] * 3 + 1], v[f[i] * 3 + 2]], b = [v[f[i + 1] * 3], v[f[i + 1] * 3 + 1], v[f[i + 1] * 3 + 2]], c = [v[f[i + 2] * 3], v[f[i + 2] * 3 + 1], v[f[i + 2] * 3 + 2]]; s += dot(a, cross(b, c)); } return s / 6; }
/* часть сетки (треугольники с from) — нормалями наружу */
function outward(m, from) { if (volume(m.v, m.f, from) < 0) for (let i = from; i < m.f.length; i += 3) { const t = m.f[i + 1]; m.f[i + 1] = m.f[i + 2]; m.f[i + 2] = t; } }
function part(m, build) { const from = m.f.length; build(); outward(m, from); }
/* трубка по оси pts с сечением-эллипсом: rw(s) — поперёк (вдоль side), rh(s) — по up; s — доля длины */
function tube(m, pts, { up = [0, 1, 0], rw, rh, K = 12, caps = true }) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
  const L = cum.at(-1), rings = pts.map((p, i) => {
    const t = unit(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));
    let u = sub(up, mul(t, dot(up, t))); if (len(u) < 1e-6) u = cross(t, [1, 0, 0]); u = unit(u); const w = cross(t, u), s = cum[i] / L;
    return Array.from({ length: K }, (_, k) => { const a = 2 * Math.PI * k / K; return add(p, add(mul(w, Math.cos(a) * rw(s)), mul(u, Math.sin(a) * rh(s)))); });
  });
  part(m, () => loft(m, rings, { capStart: caps, capEnd: caps }));
}

/* ---------- подъязычная кость ---------- */
function hyoid() {
  const H = P.hyoid, { y, zf } = POS.hyoid, m = Mesh();
  /* ось — подкова в плане: тело — дуга шириной bodyW, большие рога — от концов тела к концам на ширине width и длине len от
     передней поверхности, расходятся под углом hornAngle; концы рогов выше тела на rise */
  const zc = zf - H.bodyT / 2, half = H.bodyW / 2, bend = .5, tipX = H.width / 2 - H.tip / 2, tipZ = zf - H.len + H.tip;
  /* начало рога: так, чтобы угол между рогами был hornAngle */
  const a = H.hornAngle / 2 * D2R, x0 = tipX - Math.tan(a) * (tipZ < zc - bend ? (zc - bend - tipZ) : 1);
  const pts = [];
  for (let i = 0; i <= 24; i++) {             /* правый рог → тело → левый рог; s ∈ [−1, 1] */
    const s = -1 + 2 * i / 24, as = Math.abs(s), g = Math.sign(s) || 1;
    let p;
    if (as <= .35) { const t = as / .35, x = g * t * Math.max(half - .2, x0); p = [x, y, zc - bend * t * t]; }
    else { const t = (as - .35) / .65, e = smooth(t); const xs = Math.max(half - .2, x0); p = [g * (xs + (tipX - xs) * t), y + H.rise * e, (zc - bend) + (tipZ - (zc - bend)) * t]; }
    pts.push(p);
  }
  const prof = (s0, a0, a1) => s => { const as = Math.abs(2 * s - 1); return as <= .35 ? a0 : as > .95 ? a1 * 1.15 : a0 + (a1 - a0) * smooth((as - .35) / .4); };
  tube(m, pts, { rw: prof(0, H.bodyT / 2, H.hornT1 / 2), rh: prof(0, H.bodyH / 2, H.hornH1 / 2), K: 12 });
  return m;
}

/* ---------- щитовидный хрящ ----------
   Две пластинки, сросшиеся спереди под углом angle (у вырезки) в гребень — выступ гортани; книзу угол раскрывается (гребень
   уходит назад на recess: выступ — у верхнего края, Gray's). Верхний край: глубокая вырезка у гребня (notch), дальше выпуклый
   к заднему краю; нижний край — неглубокая нижняя вырезка посередине и нижний бугорок на трети ширины. Задние края — вертикальны;
   от верхнего угла — верхний рог (вверх и чуть назад), от нижнего — нижний (вниз, к суставу с перстневидным хрящом).
   Пластинка чуть выпукла наружу (bulge). */
function thyroid() {
  const T = P.thyroid, { yn, zp } = POS.thyroid, m = Mesh(), h = T.angle / 2 * D2R, NU = 10, NV = 6;
  const xb = T.lamina * Math.sin(h), zb = zp - T.lamina * Math.cos(h);          /* задний край (у верхнего угла) */
  const top = u => { const a = Math.abs(u); return T.notch * smooth(a / .9) + .2 * Math.sin(Math.PI * Math.min(1, a / T.lamina)) - .1 * smooth((a - 3.0) / .7); };
  const bot = u => { const a = Math.abs(u); return -(T.height - T.notch) + .18 * (1 - smooth(a / .7)) - .08 * Math.sin(Math.PI * Math.min(1, a / 2.4)) + .3 * smooth((a - 2.6) / 1.1); };
  /* гребень: на высоте v (0 — вершина вырезки) — уход назад от выступа */
  const crestZ = v => zp - T.recess * smooth(-v / (T.height - T.notch));
  const au = u => Math.sqrt(u * u + T.crest * T.crest) - T.crest, A0 = au(T.lamina);
  const X = (u, v) => {
    const f = au(u) / A0, g = Math.sign(u), cz = crestZ(v);
    /* от гребня к заднему краю — по прямой; выпуклость наружу посередине пластинки */
    const x = g * xb * f, z = cz + (zb - cz) * f, nx = g * Math.cos(h), nz = Math.sin(h), b = T.bulge * Math.sin(Math.PI * f);
    return [x + nx * b, yn + v, z + nz * b];
  };
  const nrm = (u, v) => { const e = 1e-3, a = X(u - e, v), b = X(u + e, v), c = X(u, v + e), d = X(u, v - e); return unit(cross(sub(c, d), sub(b, a))); };
  part(m, () => {
    const us = Array.from({ length: 2 * NU + 1 }, (_, i) => -T.lamina + 2 * T.lamina * i / (2 * NU));
    const O = [], I = [];
    for (const u of us) {
      const rowO = [], rowI = [];
      for (let j = 0; j <= NV; j++) { const v = bot(u) + (top(u) - bot(u)) * j / NV, p = X(u, v), n = nrm(u, v); rowO.push(vtx(m, p)); rowI.push(vtx(m, sub(p, mul(n, T.thick)))); }
      O.push(rowO); I.push(rowI);
    }
    const q = (a, b, c, d) => m.f.push(a, b, c, a, c, d);
    for (let i = 0; i < us.length - 1; i++) for (let j = 0; j < NV; j++) { q(O[i][j], O[i + 1][j], O[i + 1][j + 1], O[i][j + 1]); q(I[i][j], I[i][j + 1], I[i + 1][j + 1], I[i + 1][j]); }
    for (let i = 0; i < us.length - 1; i++) { q(O[i][0], I[i][0], I[i + 1][0], O[i + 1][0]); q(O[i][NV], O[i + 1][NV], I[i + 1][NV], I[i][NV]); }
    for (const i of [0, us.length - 1]) for (let j = 0; j < NV; j++) { if (i === 0) q(O[i][j], O[i][j + 1], I[i][j + 1], I[i][j]); else q(O[i][j], I[i][j], I[i][j + 1], O[i][j + 1]); }
  });
  for (const g of [1, -1]) {
    const u = g * (T.lamina - .1), mid = v => sub(X(u, v), mul(nrm(u, v), T.thick / 2));
    const s0 = mid(top(u) - .25), s1 = add(mid(top(u)), [-g * .15, T.supHorn, -.3]);
    tube(m, [s0, mix(s0, s1, .5), s1], { rw: s => T.hornR * (1 - .35 * s), rh: s => T.hornR * (1 - .35 * s), K: 8 });
    const i0 = mid(bot(u) + .25), i1 = add(mid(bot(u)), [-g * .1, -T.infHorn, -.05]);
    tube(m, [i0, mix(i0, i1, .5), i1], { rw: s => T.hornR * (1 - .2 * s), rh: s => T.hornR * (1 - .2 * s), K: 8 });
  }
  return m;
}

/* ---------- перстневидный хрящ ---------- */
function cricoid() {
  const C = P.cricoid, { y0, z } = POS.cricoid, m = Mesh(), N = 32;
  part(m, () => {
    const rings = [];
    for (let i = 0; i < N; i++) {
      const f = 2 * Math.PI * i / N, s = Math.sin(f), c = Math.cos(f), back = (1 - c) / 2;  /* f = 0 — спереди, π/2 — слева */
      const wall = c >= 0 ? C.wallArch + (C.wallSide - C.wallArch) * s * s : C.wallSide + (C.wallLam - C.wallSide) * c * c;
      const ri = [C.inX * s, C.inZ * c], ro = [ri[0] + wall * s, ri[1] + wall * c];
      const yb = y0, yt = y0 + C.arch + (C.lamina - C.arch) * Math.pow(back, 1.6);
      rings.push([[ri[0], yb, z + ri[1]], [ro[0], yb, z + ro[1]], [ro[0], yt, z + ro[1]], [ri[0], yt - .05, z + ri[1]]]);
    }
    loft(m, rings, { closed: true });
  });
  return m;
}

/* ---------- трахея ---------- */
function catmull(pts, n) {   /* сплайн Кэтмелла — Рома по опорным точкам, n точек на отрезок */
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push(p1.map((_, j) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  out.push(pts.at(-1)); return out;
}
/* ось трахеи: точки [x, y, z] с длиной дуги */
function axis() {
  const pts = catmull(POS.axis.map(([y, z]) => [0, y, z]), 12), cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
  const at = s => { let i = 1; while (i < pts.length - 1 && cum[i] < s) i++; const t = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return mix(pts[i - 1], pts[i], Math.max(0, Math.min(1, t))); };
  const tan = s => unit(sub(at(Math.min(cum.at(-1), s + .2)), at(Math.max(0, s - .2))));
  return { L: cum.at(-1), at, tan };
}
/* контур сечения трахеи (снаружи, в плоскости, перпендикулярной оси): спереди — дуга, сзади — уплощённая перепончатая стенка.
   f = 0 — спереди, π/2 — слева; scale — добавка к радиусам */
function contour(f, add_ = 0) {
  const T = P.trachea, s = Math.sin(f), c = Math.cos(f);
  return [(T.rx + add_) * s, c >= 0 ? (T.rzF + add_) * c : -(T.rzB + add_) * Math.pow(-c, .55)];
}
function frameAt(A, s) {
  const t = A.tan(s), up = [0, 0, 1];                       /* «вперёд» — по Z, перпендикулярно оси */
  const fwd = unit(sub(up, mul(t, dot(up, t)))), left = cross(t, fwd);   /* t — вниз по оси: t × fwd — влево? проверяется ниже */
  return { o: A.at(s), t, fwd, left: dot(left, [1, 0, 0]) >= 0 ? left : mul(left, -1) };
}
const onFrame = (F, x, z) => add(F.o, add(mul(F.left, x), mul(F.fwd, z)));
/* стенка трахеи между долями оси s0…s1 (замкнутая трубка) */
function wall(m, A, s0, s1, K = 18) {
  const n = Math.max(2, Math.ceil((s1 - s0) / .3)), rings = [];
  for (let i = 0; i <= n; i++) { const F = frameAt(A, s0 + (s1 - s0) * i / n); rings.push(Array.from({ length: K }, (_, k) => { const [x, z] = contour(2 * Math.PI * k / K, -P.trachea.wall); return onFrame(F, x, z); })); }
  part(m, () => loft(m, rings));
}
/* хрящевое полукольцо с серединой на доле s (высота ring, толщина ringT, дуга ±arc°) */
function ring(m, A, s, { h = P.trachea.ring, t = P.trachea.ringT, arc = P.trachea.arc } = {}) {
  const N = 14, F0 = frameAt(A, s - h / 2), F1 = frameAt(A, s + h / 2), loops = [];
  for (let i = 0; i <= N; i++) {
    const f = (-arc + 2 * arc * i / N) * D2R, [xi, zi] = contour(f, -P.trachea.wall), [xo, zo] = contour(f, t);
    loops.push([onFrame(F0, xi, zi), onFrame(F0, xo, zo), onFrame(F1, xo, zo), onFrame(F1, xi, zi)]);
  }
  part(m, () => loft(m, loops));
}
/* бронх: ось от точки бифуркации наружу и вниз под углом ang к оси трахеи */
function bronchus(m, A, side) {
  const Bc = P.bronchi[side], g = side === 'L' ? 1 : -1, F = frameAt(A, A.L - .3), ang = Bc.ang * D2R;
  const dir = unit(add(mul(F.t, Math.cos(ang)), mul(F.left, g * Math.sin(ang)))), o = F.o, e = add(o, mul(dir, Bc.len));
  const pts = [o, mix(o, e, .5), e];
  tube(m, pts, { up: F.fwd, rw: () => Bc.r, rh: () => Bc.r * .92, K: 16 });
  /* полукольца бронха */
  for (let k = 0; k < Bc.rings; k++) {
    const c = add(o, mul(dir, .7 + k * (Bc.len - .9) / Math.max(1, Bc.rings - 1))), N = 16, loops = [];
    let u = sub(F.fwd, mul(dir, dot(F.fwd, dir))); u = unit(u); const w = cross(dir, u);
    for (let i = 0; i <= N; i++) {
      const f = (-110 + 220 * i / N) * D2R, rr = [Bc.r - .01, Bc.r + .1], hh = [-.15, .15];
      loops.push([[rr[0], hh[0]], [rr[1], hh[0]], [rr[1], hh[1]], [rr[0], hh[1]]].map(([r, d]) => add(add(c, mul(dir, d)), add(mul(u, Math.cos(f) * r), mul(w, Math.sin(f) * r)))));
    }
    part(m, () => loft(m, loops));
  }
}
/* сегменты трахеи: кольца по оси с шагом; сегмент — группа колец со своей долей поворота к грудной клетке (wt) */
function trachea() {
  const T = P.trachea, A = axis(), start = .25, end = A.L - .9, pitch = (end - start) / (T.rings - 1);
  const ringsS = Array.from({ length: T.rings }, (_, i) => start + i * pitch);
  const wtAt = s => { const y = A.at(s)[1], [y0, y1] = POS.blend; return Math.round(smooth((y0 - y) / (y0 - y1)) * 20) / 20; };
  /* группы: по два кольца, пока wt меняется; дальше — одна группа (грудная клетка) */
  const groups = []; let cur = null;
  ringsS.forEach((s, i) => {
    const w = wtAt(s);
    if (!cur || (w < 1 && cur.rings.length >= 2) || (w >= 1 && cur.wt < 1)) { cur = { rings: [], wt: w }; groups.push(cur); }
    cur.rings.push(s); cur.wt = Math.min(1, wtAt(cur.rings.reduce((a, b) => a + b, 0) / cur.rings.length));
  });
  return groups.map((g, k) => {
    const m = Mesh(), s0 = k === 0 ? 0 : (g.rings[0] - pitch / 2) - .03, last = k === groups.length - 1, s1 = last ? A.L : g.rings.at(-1) + pitch / 2 + .03;
    wall(m, A, s0, s1);
    for (const s of g.rings) ring(m, A, s);
    if (last) { bronchus(m, A, 'R'); bronchus(m, A, 'L'); }
    return { name: 'trachea' + (k + 1), m, wt: g.wt, n: g.rings.length };
  });
}

function build() {
  const out = [];
  const push = (name, m, extra) => out.push({ name, side: '', seg: 'airway', ...extra, v: m.v.map(x => Math.round(x * 100) / 100), f: m.f });
  push('hyoid', hyoid(), { wh: POS.hyoid.wh });
  push('thyroid', thyroid(), { wh: POS.thyroid.wh });
  push('cricoid', cricoid(), POS.cricoid.wh ? { wh: POS.cricoid.wh } : {});
  for (const t of trachea()) push(t.name, t.m, t.wt ? { wt: t.wt } : {});
  return out;
}
/* размеры готовых сеток — для тестов (tools/skeleton.test.js) и отчёта */
function measure(bones) {
  const pts = name => { const b = bones.find(x => x.name === name); const v = b.pos || b.v, o = []; for (let i = 0; i < v.length; i += 3) o.push([v[i], v[i + 1], v[i + 2]]); return o; };
  const ext = (p, k) => [Math.min(...p.map(q => q[k])), Math.max(...p.map(q => q[k]))];
  const A = axis();
  return { P, POS, axisLength: A.L, rings: P.trachea.rings, hyoid: { x: ext(pts('hyoid'), 0), y: ext(pts('hyoid'), 1), z: ext(pts('hyoid'), 2) }, thyroid: { x: ext(pts('thyroid'), 0), y: ext(pts('thyroid'), 1), z: ext(pts('thyroid'), 2) }, cricoid: { x: ext(pts('cricoid'), 0), y: ext(pts('cricoid'), 1), z: ext(pts('cricoid'), 2) } };
}
module.exports = { P, POS, build, measure, axis, contour };

if (require.main === module) {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '../../qa/skeleton/bones.json'));
  const src = JSON.parse(fs.readFileSync(file, 'utf8'));
  src.bones = src.bones.filter(b => b.seg !== 'airway').concat(build());
  if (!/airway/.test(src.source)) src.source += '; гортань и трахея — параметрические (tools/skeleton/airway.js)';
  fs.writeFileSync(file, JSON.stringify(src));
  const ab = src.bones.filter(b => b.seg === 'airway');
  console.log(`${path.relative(process.cwd(), file)}: костей гортани ${ab.length} (${ab.map(b => b.name + (b.wt ? ' wt ' + b.wt : '') + (b.wh ? ' wh ' + b.wh : '')).join(', ')}), треугольников ${ab.reduce((s, b) => s + b.f.length / 3, 0)}`);
}
