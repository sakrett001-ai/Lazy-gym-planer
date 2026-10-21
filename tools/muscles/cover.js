'use strict';
/* Покрытие костей мышцами и складки пластов (этап В: спина и таз) — для tools/muscles.test.js и замеров README.
   Тела мышц кадра — вершины Muscles.surfaceAll (кольца по SIDES вершин, как рисует приложение); луч из точки кости наружу до кожи:
   если по пути нет ни одной мышцы — кость видна сквозь мышцы (в виде «Анатомия» — белое «окно»).
   - scapulaCover: задняя поверхность лопатки у медиального края и корня ости (в 4 см от самой медиальной точки) — луч по оси w
     лопатки (наименьшая главная ось её вершин, наружу); там лопатку закрывают трапециевидная, ромбовидные и широчайшая.
   - spineCover: задние точки позвонков L1–L5, T8–T12 и крестца сбоку от остистых отростков (|x| > 1 см в рамке позвонка, в 3,5 см
     от самой задней точки, видимые сзади) — луч назад по рамке позвонка; там лежат многораздельные и столбы выпрямителя.
   - wallFolds: у пласта-сетки (ягодичные) четырёхугольники верха, вывернутые против нормалей узлов, и низа, вывернутые против
     верха, — складки («смятый» пласт). */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const W = (m, i, p) => [0, 1, 2].map(r => m[i * 12 + r * 4] * p[0] + m[i * 12 + r * 4 + 1] * p[1] + m[i * 12 + r * 4 + 2] * p[2] + m[i * 12 + r * 4 + 3]);
const Wd = (m, i, p) => [0, 1, 2].map(r => m[i * 12 + r * 4] * p[0] + m[i * 12 + r * 4 + 1] * p[1] + m[i * 12 + r * 4 + 2] * p[2]);

/* коробки тел мышц кадра: по мышце — кольца [r0, r1) и границы вершин; skip(mu) — мышцы, которых «нет» (отрицательные проверки) */
function muscleBoxes(bound, start, pos, sides, skip = null) {
  const out = [];
  for (let i = 0; i < bound.length; i++) {
    if (skip && skip(bound[i])) continue;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let v = start[i] * sides; v < start[i + 1] * sides; v++) for (let k = 0; k < 3; k++) { const x = pos[v * 3 + k]; if (x < lo[k]) lo[k] = x; if (x > hi[k]) hi[k] = x; }
    out.push({ i, lo, hi, r0: start[i], r1: start[i + 1] });
  }
  return out;
}
function rayTri(o, d, a, b, c) {
  const e1 = sub(b, a), e2 = sub(c, a), h = cross(d, e2), det = dot(e1, h); if (Math.abs(det) < 1e-12) return Infinity;
  const f = 1 / det, s = sub(o, a), u = f * dot(s, h); if (u < 0 || u > 1) return Infinity;
  const q = cross(s, e1), v = f * dot(d, q); if (v < 0 || u + v > 1) return Infinity;
  const t = f * dot(e2, q); return t > 1e-4 ? t : Infinity;
}
/* первая мышца на луче o + d·t до tmax (номер в bound) или −1; с want(i) — первая из тех, для которых want истинно */
function firstHit(MB, pos, sides, o, d, tmax, want = null) {
  const e = [o[0] + d[0] * tmax, o[1] + d[1] * tmax, o[2] + d[2] * tmax], lo = o.map((x, k) => Math.min(x, e[k])), hi = o.map((x, k) => Math.max(x, e[k]));
  const P = v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
  let best = tmax, who = -1;
  for (const b of MB) {
    if (want && !want(b.i)) continue;
    if (b.hi[0] < lo[0] || b.lo[0] > hi[0] || b.hi[1] < lo[1] || b.lo[1] > hi[1] || b.hi[2] < lo[2] || b.lo[2] > hi[2]) continue;
    for (let r = b.r0; r < b.r1 - 1; r++) for (let j = 0; j < sides; j++) {
      const a = r * sides + j, bb = r * sides + (j + 1) % sides, c = a + sides, dd = bb + sides;
      const t = Math.min(rayTri(o, d, P(a), P(bb), P(c)), rayTri(o, d, P(bb), P(dd), P(c)));
      if (t < best) { best = t; who = b.i; }
    }
  }
  return who;
}
/* последняя (самая наружная) мышца на луче o + d·t до tmax — та, что видна сверху; −1 — мышц нет */
function lastHit(MB, pos, sides, o, d, tmax) {
  const e = [o[0] + d[0] * tmax, o[1] + d[1] * tmax, o[2] + d[2] * tmax], lo = o.map((x, k) => Math.min(x, e[k])), hi = o.map((x, k) => Math.max(x, e[k]));
  const P = v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
  let best = -Infinity, who = -1;
  for (const b of MB) {
    if (b.hi[0] < lo[0] || b.lo[0] > hi[0] || b.hi[1] < lo[1] || b.lo[1] > hi[1] || b.hi[2] < lo[2] || b.lo[2] > hi[2]) continue;
    for (let r = b.r0; r < b.r1 - 1; r++) for (let j = 0; j < sides; j++) {
      const a = r * sides + j, bb = r * sides + (j + 1) % sides, c = a + sides, dd = bb + sides;
      for (const t of [rayTri(o, d, P(a), P(bb), P(c)), rayTri(o, d, P(bb), P(dd), P(c))]) if (t < tmax && t > best) { best = t; who = b.i; }
    }
  }
  return who;
}
/* расстояние до кожи по лучу (шаг 0,25 см, до 12 см) */
function skinExit(sdf, o, d) { for (let t = .2; t < 12; t += .25) if (sdf([o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]) > 0) return t; return 12; }
const tally = (bound, by, hm) => { by[bound[hm].part] = (by[bound[hm].part] || 0) + 1; };

/* ось w лопатки (наименьшая главная ось вершин), в рамке лопатки, наружу — по нейтральной позе (m0) */
function scapAxis(skel, i, m0) {
  const b = skel.bones[i], P = []; for (let k = 0; k < b.pos.length; k += 3) P.push([b.pos[k], b.pos[k + 1], b.pos[k + 2]]);
  const o = [0, 1, 2].map(c => P.reduce((a, p) => a + p[c], 0) / P.length), C = [0, 1, 2].map(() => [0, 0, 0]);
  for (const p of P) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) C[a][c] += (p[a] - o[a]) * (p[c] - o[c]);
  const tr = C[0][0] + C[1][1] + C[2][2], A = C.map((r, a) => r.map((x, c) => (a === c ? tr : 0) - x));
  let w = [0, 0, 1]; for (let it = 0; it < 200; it++) w = unit([0, 1, 2].map(a => A[a][0] * w[0] + A[a][1] * w[1] + A[a][2] * w[2]));
  if (Wd(m0, i, w)[2] > 0) w = w.map(x => -x);
  return { P, w };
}
/* лопатки кадра: { n, open, by: {часть: точек} } */
function scapulaCover({ skel, bound, start, pos, sides, m, m0, sdf, MB }) {
  let n = 0, open = 0; const by = {}, rib = skel.bones.findIndex(b => b.name === 'ribcage'), ro = rib * 12;
  const lxOf = p => { const d = sub(p, [m[ro + 3], m[ro + 7], m[ro + 11]]); return Math.abs(m[ro] * d[0] + m[ro + 4] * d[1] + m[ro + 8] * d[2]); };
  for (const s of ['R', 'L']) {
    const i = skel.bones.findIndex(b => b.name === 'scapula' && b.side === s), ax = scapAxis(skel, i, m0), w = unit(Wd(m, i, ax.w));
    const world = ax.P.map(p => W(m, i, p)), lxs = world.map(lxOf), lmin = Math.min(...lxs);
    world.forEach((p, k) => {
      if (lxs[k] > lmin + 4) return;
      /* только задняя сторона: точка не глубже 0,5 см самой задней по w в своей окрестности 1,5 см */
      const pw = dot(p, w); let mx = -Infinity;
      for (const q of world) { const dd = sub(q, p), a = dot(dd, w); if (Math.abs(a) < 6 && Math.hypot(dd[0] - a * w[0], dd[1] - a * w[1], dd[2] - a * w[2]) < 1.5) mx = Math.max(mx, dot(q, w)); }
      if (pw < mx - .5) return;
      n++; const hm = firstHit(MB, pos, sides, p, w, skinExit(sdf, p, w));
      if (hm < 0) open++; else tally(bound, by, hm);
    });
  }
  return { n, open, by };
}
/* Нижний угол и нижняя треть медиального края лопатки (этап Д: при руке над головой лопатка поворачивается вверх, нижний
   угол уходит наружу и вперёд по рёбрам). У человека нижний угол в любой позе закрыт широчайшей (часть её волокон начинается
   от него — Gray's), нижнюю часть медиального края — нижние пучки трапециевидной. Точки — задние вершины кости в 4 см от
   нижнего угла (ai) и у отрезка ts–ai в его нижней трети (не дальше 1,5 см от отрезка); луч — по нормали плоскости лопатки
   (ts, ai, aa) наружу до кожи; точка закрыта, если самая наружная мышца на луче (та, что видна в «Анатомии») — одна из
   частей parts (по умолчанию — широчайшая и трапециевидная): иначе сквозь них видны мышцы глубже или кость. Ориентиры G —
   Mannequin.GIRDLE (рамка лопатки правой стороны, левая — зеркально по x).
   { n, open, by: {наружная мышца на луче: точек}, at: [открытые точки: сторона и номер вершины] } */
const LOWER_PARTS = new Set(['lat', 'trapinf', 'trapmid', 'trapsup']);
function scapulaLowerCover({ skel, bound, pos, sides, m, m0, sdf, MB, G }, parts = LOWER_PARTS) {
  let n = 0, open = 0; const by = {}, at = [], want = i => parts.has(bound[i].part);
  for (const s of ['R', 'L']) {
    const i = skel.bones.findIndex(b => b.name === 'scapula' && b.side === s), g = s === 'L' ? -1 : 1, mir = p => [g * p[0], p[1], p[2]];
    const ts = mir(G.ts), ai = mir(G.ai), aa = mir(G.aa), e = sub(ai, ts), L2 = dot(e, e);
    let nl = unit(cross(sub(ai, ts), sub(aa, ts))); if (Wd(m0, i, nl)[2] > 0) nl = nl.map(x => -x);
    const w = unit(Wd(m, i, nl)), b = skel.bones[i], P = []; for (let k = 0; k < b.pos.length; k += 3) P.push([b.pos[k], b.pos[k + 1], b.pos[k + 2]]);
    const near = p => { const d = sub(p, ai); if (Math.hypot(d[0], d[1], d[2]) <= 4) return true; const u = dot(sub(p, ts), e) / L2; if (u < 2 / 3 || u > 1) return false; const q = sub(sub(p, ts), e.map(x => x * u)); return Math.hypot(q[0], q[1], q[2]) <= 1.5; };
    const sel = P.map(near), world = P.map(p => W(m, i, p));
    world.forEach((p, k) => {
      if (!sel[k]) return;
      /* только задняя сторона: точка не глубже 0,5 см самой задней по w в своей окрестности 1,5 см */
      const pw = dot(p, w); let mx = -Infinity;
      for (let j = 0; j < world.length; j++) { if (!sel[j]) continue; const dd = sub(world[j], p), a = dot(dd, w); if (Math.abs(a) < 6 && Math.hypot(dd[0] - a * w[0], dd[1] - a * w[1], dd[2] - a * w[2]) < 1.5) mx = Math.max(mx, dot(world[j], w)); }
      if (pw < mx - .5) return;
      n++; const te = skinExit(sdf, p, w), hm = lastHit(MB, pos, sides, p, w, te);
      if (hm >= 0) tally(bound, by, hm);
      if (hm < 0 || !want(hm)) { open++; at.push(s + k); }
    });
  }
  return { n, open, by, at };
}
const SPINE = ['sacrum', 'L5', 'L4', 'L3', 'L2', 'L1', 'thoracic12', 'thoracic11', 'thoracic10', 'thoracic9', 'thoracic8'];
/* позвонков кадра: { n, open, by, deep } — deep: лучей, на которых до кожи есть мышца из parts (столбы и многораздельные: они
   могут быть и не первыми — где широкая мышца толще, её низ ниже их верха, но выпрямитель под ней на месте) */
function spineCover({ skel, bound, pos, sides, m, sdf, MB }, parts = null) {
  let n = 0, open = 0, deep = 0; const by = {}, want = parts ? i => parts.has(bound[i].part) : null;
  for (const nm of SPINE) {
    const i = skel.bones.findIndex(b => b.name === nm), b = skel.bones[i], back = unit(Wd(m, i, [0, 0, -1]));
    const P = []; for (let k = 0; k < b.pos.length; k += 3) P.push([b.pos[k], b.pos[k + 1], b.pos[k + 2]]);
    const zmin = Math.min(...P.map(p => p[2]));
    for (const p of P) {
      if (Math.abs(p[0]) < 1 || p[2] > zmin + 3.5) continue;
      if (P.some(q => q !== p && Math.abs(q[0] - p[0]) < .5 && Math.abs(q[1] - p[1]) < .5 && q[2] < p[2] - .3)) continue;
      const wp = W(m, i, p), te = skinExit(sdf, wp, back); n++; const hm = firstHit(MB, pos, sides, wp, back, te);
      if (hm < 0) open++; else tally(bound, by, hm);
      if (want && (hm >= 0 && want(hm) || hm >= 0 && firstHit(MB, pos, sides, wp, back, te, want) >= 0)) deep++;
    }
  }
  return { n, open, by, deep };
}
/* складки пласта-сетки (строки × 2K + 1 столбцов): верх и низ узла — как в Muscles.wallSurface (сдвиг на толщину — wall.OF, если
   есть, иначе NR · TH); { quads, top, bottom, at, topQ: [[q, c]…], bottomQ } — вывернутые четырёхугольники */
function wallFolds(wall) {
  const C2 = 2 * wall.K + 1, n = wall.n; if (wall.N !== n * C2) return null;
  const off = (v, k) => (wall.OF ? wall.OF[v * 3 + k] : wall.NR[v * 3 + k] * wall.TH[v]);
  const at = (v, s) => { const d = (wall.datum[v] ? 1 : 0) - s; return [0, 1, 2].map(k => wall.P[v * 3 + k] + off(v, k) * d); };
  const T = []; let bottom = 0; const where = [], topQ = [], bottomQ = [];
  for (let q = 0; q + 1 < n; q++) for (let c = 0; c + 1 < C2; c++) {
    const vs = [q * C2 + c, q * C2 + c + 1, (q + 1) * C2 + c + 1, (q + 1) * C2 + c], N = [0, 1, 2].map(k => vs.reduce((s, v) => s + wall.NR[v * 3 + k], 0));
    const pt = vs.map(v => at(v, 0)), pb = vs.map(v => at(v, 1)), nt = cross(sub(pt[2], pt[0]), sub(pt[3], pt[1])), nb = cross(sub(pb[2], pb[0]), sub(pb[3], pb[1]));
    T.push([dot(nt, N), `q${q} c${c}`, q, c]);
    if (dot(nb, nt) < 0) { bottom++; bottomQ.push([q, c]); where.push(`низ q${q} c${c}`); }
  }
  /* обход сетки: знак — по большинству четырёхугольников верха */
  const sg = T.filter(x => x[0] >= 0).length * 2 >= T.length ? 1 : -1; let top = 0;
  for (const [d, s, q, c] of T) if (d * sg < 0) { top++; topQ.push([q, c]); where.unshift(`верх ${s}`); }
  return { quads: T.length, top, bottom, topQ, bottomQ, at: where.slice(0, 6).join(', ') };
}
module.exports = { muscleBoxes, firstHit, lastHit, skinExit, scapulaCover, scapulaLowerCover, LOWER_PARTS, spineCover, wallFolds, SPINE };
