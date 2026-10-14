'use strict';
/* Где мышцы начинаются и прикрепляются — в анатомических ориентирах скелета манекена (нейтральная поза).
   Для каждой точки начала и прикрепления (первая и последняя точки пути): кость и место на ней —
   · позвоночник и грудная клетка — уровень позвонка по высоте (T7.5 — между седьмым и восьмым грудными), сторона
     (сзади — у остистых отростков, сбоку, спереди) и расстояние от средней линии;
   · длинные кости и ключица — доля длины от верхнего (у ключицы — внутреннего) конца, 0…1;
   · таз — доля высоты от верха гребня (0) до низа седалищного бугра (1), спереди или сзади;
   · лопатка — доля высоты от верхнего угла (0) до нижнего (1) и доля ширины от внутреннего края (0) до суставной впадины (1).
   Используется аудитом прикреплений (tools/muscles/attach-audit.js, эталон — fixtures/attachments.json).
   node tools/muscles/attach.js [--json] — таблица по частям мышц (правая сторона и средняя линия). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js')), Muscles = require(path.join(root, 'src/js/09br-muscles.js'));
const G = require('./geometry.js');

const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const md = Muscles.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin'))));
const R = M.catalogPose(M.neutral()), frames = Skeleton.frames(R, M.bodyData(R), skel.bones);
const key = b => b.name + (b.side || '');
const at = (i, p) => { const o = i * 12, m = frames; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
/* вершины костей в мире (каталог: см, X — влево, Y — вниз, Z — вперёд) */
const BONES = {};
skel.bones.forEach((b, i) => { const v = []; for (let k = 0; k < b.pos.length; k += 3) v.push(at(i, [b.pos[k], b.pos[k + 1], b.pos[k + 2]])); BONES[key(b)] = { i, v }; });
const mean = v => [0, 1, 2].map(k => v.reduce((s, p) => s + p[k], 0) / v.length);
const ext = (v, k) => [Math.min(...v.map(p => p[k])), Math.max(...v.map(p => p[k]))];

/* позвонки сверху вниз: высоты центров (Y вниз). Шейный отдел — одна кость, но позвонки в её сетке — отдельные
   компоненты связности: семь самых крупных (мелкие — диски), сверху вниз — C1…C7 (до 4.34.0 шея делилась по высоте
   на семь равных частей — C7 выходил на 1,6 см ниже настоящего) */
function cervicalY() {
  const b = skel.bones.find(x => x.name === 'cervical'), n = b.pos.length / 3, par = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < b.idx.length; i += 3) for (const [a, c] of [[b.idx[i], b.idx[i + 1]], [b.idx[i + 1], b.idx[i + 2]]]) { const ra = find(a), rc = find(c); if (ra !== rc) par[ra] = rc; }
  const comp = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comp.get(r) || comp.set(r, []).get(r)).push(i); }
  const ys = [...comp.values()].sort((a, c) => c.length - a.length).slice(0, 7).map(c => mean(c.map(i => BONES.cervical.v[i]))[1]).sort((a, c) => a - c);
  if (ys.length !== 7) throw new Error('шейный отдел: позвонков ' + ys.length);
  return ys;
}
const VERT = [];
{
  const c = k => mean(BONES[k].v);
  const skullY = ext(BONES.skull.v, 1)[1];
  cervicalY().forEach((y, i) => VERT.push({ name: 'C' + (i + 1), y }));
  for (let n = 1; n <= 12; n++) VERT.push({ name: 'T' + n, y: c('thoracic' + n)[1] });
  for (let n = 1; n <= 5; n++) VERT.push({ name: 'L' + n, y: c('L' + n)[1] });
  VERT.push({ name: 'S1', y: ext(BONES.sacrum.v, 1)[0] + 3 }, { name: 'S5', y: ext(BONES.sacrum.v, 1)[1] - 2 });
  VERT.skullY = skullY;
}
const SPINE_Z = (() => { const t = ['thoracic7', 'thoracic12', 'L3'].map(k => mean(BONES[k].v)[2]); return t; })();
/* уровень по высоте: T7.5 — между T7 и T8; выше C1 — «череп» */
function level(y) {
  if (y < VERT[0].y - 2) return { label: 'череп', v: 0 };
  for (let i = 0; i < VERT.length - 1; i++) {
    const a = VERT[i], b = VERT[i + 1];
    if (y <= b.y) { const f = Math.max(0, (y - a.y) / (b.y - a.y)); return { label: f < .25 ? a.name : f > .75 ? b.name : a.name + '–' + b.name, v: i + f }; }
  }
  return { label: 'ниже S5', v: VERT.length };
}
const vertIndex = name => VERT.findIndex(v => v.name === name);
/* ось длинной кости — от верхнего (у ключицы — внутреннего) конца */
function axisOf(k) {
  const v = BONES[k].v, c = mean(v);
  let a = [0, 1, 0];
  if (/^clavicle/.test(k)) a = [1, 0, 0];
  /* главная ось — степенным методом */
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of v) for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) C[r][s] += (p[r] - c[r]) * (p[s] - c[s]);
  for (let it = 0; it < 50; it++) { const n = [0, 1, 2].map(r => C[r][0] * a[0] + C[r][1] * a[1] + C[r][2] * a[2]), l = Math.hypot(...n); a = n.map(x => x / l); }
  /* направление: у конечностей — вниз (Y растёт), у ключицы — наружу от средней линии */
  if (/^clavicle/.test(k)) { if (Math.sign(a[0]) !== Math.sign(c[0] - R.sh[0] || 1) && (c[0] - mean(BONES.ribcage.v)[0]) * a[0] < 0) a = a.map(x => -x); }
  else if (a[1] < 0) a = a.map(x => -x);
  const t = v.map(p => (p[0] - c[0]) * a[0] + (p[1] - c[1]) * a[1] + (p[2] - c[2]) * a[2]);
  return { c, a, lo: Math.min(...t), hi: Math.max(...t) };
}
const AX = {};
const along = (k, p) => { const x = AX[k] || (AX[k] = axisOf(k)); const t = (p[0] - x.c[0]) * x.a[0] + (p[1] - x.c[1]) * x.a[1] + (p[2] - x.c[2]) * x.a[2]; return (t - x.lo) / (x.hi - x.lo); };
const midX = mean(BONES.sacrum.v)[0];

function describe(k, p) {
  const name = k.replace(/[LR]$/, ''), side = k.match(/[LR]$/)?.[0] || '';
  const lateral = Math.abs(p[0] - midX), z = p[2];
  if (/^(thoracic\d+|L\d|sacrum|ribcage|cervical|skull|jaw)$/.test(k)) {
    const lv = level(p[1]), spineZ = SPINE_Z[0];
    const where = lateral < 4 && z < spineZ + 4 ? 'сзади' : z > spineZ + 12 ? 'спереди' : 'сбоку';
    return { bone: k, kind: 'spine', level: lv.label, lv: +lv.v.toFixed(2), where, lateral: +lateral.toFixed(1) };
  }
  if (/^pelvis/.test(k)) {
    const v = BONES[k].v, [top, bot] = ext(v, 1), c = mean(v);
    return { bone: k, kind: 'pelvis', h: +((p[1] - top) / (bot - top)).toFixed(2), where: p[2] > c[2] + 2 ? 'спереди' : p[2] < c[2] - 2 ? 'сзади' : 'сбоку', lateral: +lateral.toFixed(1) };
  }
  if (/^scapula/.test(k)) {
    const v = BONES[k].v, [top, bot] = ext(v, 1), lat = v.map(q => Math.abs(q[0] - midX)), lmin = Math.min(...lat), lmax = Math.max(...lat);
    return { bone: k, kind: 'scapula', h: +((p[1] - top) / (bot - top)).toFixed(2), w: +((lateral - lmin) / (lmax - lmin)).toFixed(2) };
  }
  if (/^(clavicle|humerus|ulna|radius|femur|tibia|fibula|patella)$/.test(name)) return { bone: k, kind: 'long', f: +along(k, p).toFixed(2) };
  return { bone: k, kind: 'other' };
}

const bound = Muscles.bind(md, skel), paths = Muscles.layout(bound, frames, .5);
function table() {
  const rows = new Map();
  bound.forEach((mu, i) => {
    if (mu.side === 'L') return;
    const pts = paths[i].points, ends = [pts[0], pts[pts.length - 1]];
    const boneOf = el => { const s = el.find(x => x.s)?.s; return s ? key(skel.bones[s.i]) : '?'; };
    const b0 = boneOf(mu.el), b1 = boneOf([...mu.el].reverse());
    const d = [describe(b0, ends[0]), describe(b1, ends[1])];
    const part = mu.part || mu.name.replace(/_[rl]$/, '');
    if (!rows.has(part)) rows.set(part, { part, group: (mu.group || []).join('+'), n: 0, a: [], b: [], names: [] });
    const r = rows.get(part); r.n++; r.a.push(d[0]); r.b.push(d[1]); r.names.push(mu.name);
  });
  return [...rows.values()];
}
const fmt = list => {
  const by = new Map();
  for (const d of list) { const k = d.bone + (d.where ? ' ' + d.where : ''); (by.get(k) || by.set(k, []).get(k)).push(d); }
  return [...by.entries()].map(([k, ds]) => {
    const d = ds[0];
    if (d.kind === 'spine') { const lo = ds.reduce((a, x) => x.lv < a.lv ? x : a), hi = ds.reduce((a, x) => x.lv > a.lv ? x : a); return `${k} ${lo.level}${lo === hi ? '' : '…' + hi.level} (${Math.min(...ds.map(x => x.lateral))}–${Math.max(...ds.map(x => x.lateral))} см от середины)`; }
    if (d.kind === 'long') return `${k} ${Math.min(...ds.map(x => x.f))}–${Math.max(...ds.map(x => x.f))}`;
    if (d.kind === 'pelvis') return `${k} h ${Math.min(...ds.map(x => x.h))}–${Math.max(...ds.map(x => x.h))}`;
    if (d.kind === 'scapula') return `${k} h ${Math.min(...ds.map(x => x.h))}–${Math.max(...ds.map(x => x.h))} w ${Math.min(...ds.map(x => x.w))}–${Math.max(...ds.map(x => x.w))}`;
    return k;
  }).join('; ');
};
/* ---------- аудит по эталону (fixtures/attachments.json) ---------- */
const CAT = [['spine', /^(thoracic\d+|L\d|sacrum|ribcage|cervical|skull|jaw)$/], ['pelvis', /^pelvis/], ['scapula', /^scapula/], ['clavicle', /^clavicle/],
  ['humerus', /^humerus/], ['ulna', /^ulna/], ['radius', /^radius/], ['femur', /^femur/], ['shank', /^(tibia|fibula|patella)/], ['foot', /^(talus|foot|toes)/], ['hand', /./]];
const catOf = k => CAT.find(([, re]) => re.test(k))[0];
/* концы всех мышц правой стороны и средней линии: кость, категория, описание места */
function ends() {
  const out = [];
  bound.forEach((mu, i) => {
    if (mu.side === 'L') return;
    const pts = paths[i].points, part = mu.part || mu.name;
    const boneAt = el => { const s = el.find(x => x.s)?.s; return s ? key(skel.bones[s.i]) : '?'; };
    const e = [[boneAt(mu.el), pts[0]], [boneAt([...mu.el].reverse()), pts[pts.length - 1]]].map(([k, p], j) => ({ muscle: mu.name, part, j, bone: k.replace(/[LR]$/, '') === k ? k : k.replace(/[LR]$/, ''), cat: catOf(k), p, d: describe(k, p) }));
    e[0].other = e[1]; e[1].other = e[0]; out.push(...e);
  });
  return out;
}
const TOL = { f: .06, h: .1, w: .1, lv: 1 };
function audit(ref) {
  const E = ends(), used = new Set(), results = [];
  for (const c of ref.checks) {
    const e = c.end, parts = new Set(c.parts);
    let sel = E.filter(x => parts.has(x.part) && x.cat === e.bone && (!e.on || e.on.includes(x.bone)) && (!e.where || e.where.includes(x.d.where)));
    /* у мышц с обоими концами на одной кости — нижний или верхний конец */
    if (e.pick) sel = sel.filter(x => x.other.cat !== x.cat || (e.pick === 'low' ? x.d.lv >= x.other.d.lv : x.d.lv < x.other.d.lv));
    const fail = [], id = c.parts.join('+'), tag = `${id}: ${e.bone}${c.note ? ' (' + c.note + ')' : ''}`;
    for (const x of sel) used.add(x.muscle + ':' + x.j);
    const miss = c.parts.filter(pt => !sel.some(x => x.part === pt));
    if (miss.length) fail.push('нет конца у ' + miss.join(', '));
    const outside = (v, [lo, hi], t) => v < lo - t || v > hi + t;
    for (const k of ['f', 'h', 'w']) if (e[k]) for (const x of sel) if (x.d[k] !== undefined && outside(x.d[k], e[k], TOL[k])) fail.push(`${x.muscle} ${k}=${x.d[k]} вне ${e[k].join('…')}`);
    if (e.levels) { const [lo, hi] = e.levels.map(vertIndex); for (const x of sel) if (outside(x.d.lv, [lo, hi], TOL.lv)) fail.push(`${x.muscle} на ${x.d.level}, нужно ${e.levels.join('…')}`); }
    if (e.cover) {
      const num = typeof e.cover[0] === 'number', vals = sel.map(x => num ? x.d.f : x.d.lv).filter(Number.isFinite);
      const [lo, hi] = num ? e.cover : e.cover.map(vertIndex), t = num ? TOL.f : TOL.lv;
      if (vals.length && (Math.min(...vals) > lo + t || Math.max(...vals) < hi - t)) {
        const show = v => num ? v.toFixed(2) : level(VERT[Math.min(VERT.length - 1, Math.round(v))].y).label;
        fail.push(`покрыто ${show(Math.min(...vals))}…${show(Math.max(...vals))}, нужно ${e.cover.join('…')}`);
      }
    }
    if (e.pelvis && !E.some(x => parts.has(x.part) && x.cat === 'pelvis')) fail.push('нет начала на тазе');
    if (e.skull && !E.some(x => parts.has(x.part) && x.bone === 'skull')) fail.push('нет начала на черепе');
    if (e.spread) { const n = new Set(sel.map(x => x.p.map(v => Math.round(v)).join(','))).size; if (n < e.spread) fail.push(`${n} разных точек из ${sel.length}, нужно не меньше ${e.spread}`); }
    results.push({ id, tag, ok: !fail.length, fail, src: c.src });
  }
  /* пласты (межрёберные) — свои проверки */
  const sh = sheetAudit(ref); results.push(...sh.results);
  /* у каждого конца каждой мышцы должен быть эталон */
  const orphan = [...new Set(E.filter(x => !used.has(x.muscle + ':' + x.j)).map(x => `${x.part} (${x.bone})`)), ...sh.orphan];
  const known = ref.known || {}, failing = new Set(results.filter(r => !r.ok).map(r => r.id));
  return { results, orphan, unknown: results.filter(r => !r.ok && !known[r.id]), fixed: Object.keys(known).filter(k => !failing.has(k)), known };
}
/* ---------- пласты: межрёберные мышцы (4.40.0, intercostals.js) ----------
   Пласт промежутка k — между рёбрами k и k+1 своей стороны. Проверки (эталон — раздел sheets в fixtures/attachments.json),
   всё в рамке грудной клетки (локальные см: X — влево, Y — вверх, Z — вперёд; пласты в данных — в ней же):
   · border — край пласта лежит на своём ребре и на своём крае ребра: у каждой точки верхнего края (a) ближайшая часть
     сетки — ребро k (или хрящ — часть грудины), и ребро над точкой (вершины ребра в 1,5 см — по большей части выше
     по направлению от нижнего края к верхнему); у нижнего края (b) — ребро k+1 и ребро под точкой. Середина пласта
     между краями — не внутри рёбер и хрящей (пласт лежит в щели, а не на ребре);
   · end — задний или передний конец у ориентира: бугорок или угол ребра k либо k+1, рёберно-хрящевое соединение
     (ориентиры — intercostals.js, landmarks), конец свободного ребра; «gap» — пласт доходит до места, где промежуток
     закрывается (грудина или сошедшиеся хрящи): в 1 см впереди переднего конца — уже кость или хрящ;
   · spaces — все промежутки 1–11 с обеих сторон; сторона — все вершины по свою сторону средней линии (не дальше 1 см). */
const IC = require('./intercostals.js');
const RC = IC.ribcage(skel), RLM = IC.landmarks(skel, RC), SHEET_DATA = md.sheets || [];
const RTRI = (() => {
  const b = RC.b, tris = [], cells = new Map(), C = 2, key = (i, j, k) => (i * 1024 + j) * 1024 + k;
  for (let f = 0; f < b.idx.length; f += 3) tris.push([b.idx[f], b.idx[f + 1], b.idx[f + 2]]);
  tris.forEach((t, n) => {
    const p = t.map(i => RC.P[i]), lo = [0, 1, 2].map(k => Math.floor(Math.min(p[0][k], p[1][k], p[2][k]) / C) + 300), hi = [0, 1, 2].map(k => Math.floor(Math.max(p[0][k], p[1][k], p[2][k]) / C) + 300);
    for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) { const h = key(i, j, k); (cells.get(h) || cells.set(h, []).get(h)).push(n); }
  });
  /* ближайший треугольник сетки грудной клетки к точке p (в пределах 4 см): {tri, d} */
  const tri = (p, [a, b2, c]) => { const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const ab = sub(b2, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap), at = q => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    if (d1 <= 0 && d2 <= 0) return at(a); const bp = sub(p, b2), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return at(b2);
    const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return at([a[0] + ab[0] * v, a[1] + ab[1] * v, a[2] + ab[2] * v]); }
    const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return at(c);
    const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return at([a[0] + ac[0] * w, a[1] + ac[1] * w, a[2] + ac[2] * w]); }
    const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return at([b2[0] + (c[0] - b2[0]) * w, b2[1] + (c[1] - b2[1]) * w, b2[2] + (c[2] - b2[2]) * w]); }
    const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; return at([a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]); };
  /* keep(v) — только треугольники, чья первая вершина подходит (например, своя часть сетки) */
  return (p, keep = null) => {
    const c = p.map(v => Math.floor(v / C) + 300); let best = { tri: -1, d: Infinity };
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) for (const n of cells.get(key(c[0] + i, c[1] + j, c[2] + k)) || []) { if (keep && !keep(tris[n][0])) continue; const d = tri(p, tris[n].map(v => RC.P[v])); if (d < best.d) best = { tri: n, d }; }
    best.v = best.tri >= 0 ? tris[best.tri][0] : -1;
    return best;
  };
})();
const RIBCAGE_PB = G.prepareBones({ bones: [RC.b] })[0], NEAR = .35;
/* точка в кости — глубже 0,5 мм: у самой поверхности грубой сетки чётность пересечений лучей неустойчива (луч поперёк
   пласта там, где край ребра косой, идёт вдоль поверхности ребра в 0,1–0,3 мм от неё) */
const inBone = q => G.insideBone(RIBCAGE_PB, q) && RIBCAGE_PB.near(q) > .05;
const subv = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dotv = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unitv = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
/* часть грудной клетки у точки: номер ребра стороны s или 0 (грудина с хрящами) */
const partAt = (s, p) => { const n = RTRI(p); return n.v < 0 ? -1 : RC.label[s][n.v]; };
function sheetAudit(ref, SHEETS = SHEET_DATA) {
  const results = [];
  for (const c of ref.sheets || []) {
    const parts = new Set(c.parts), list = SHEETS.filter(sh => parts.has(sh.part) && (!c.spaces || (sh.space >= c.spaces[0] && sh.space <= c.spaces[1])));
    const fail = [], id = 'sheet:' + c.parts.join('+') + ':' + c.check + (c.spaces ? ':' + c.spaces.join('-') : '') + (c.at ? ':' + c.at : '') + (c.end ? ':' + c.end : '');
    const tag = `${c.parts.join('+')}: ${c.note || c.check}`;
    if (!list.length) fail.push('нет пластов');
    if (c.check === 'spaces') {
      for (const p of c.parts) for (const s of ['R', 'L']) { const have = new Set(SHEETS.filter(sh => sh.part === p && sh.side === s).map(sh => sh.space)); const miss = []; for (let k = c.spaces[0]; k <= c.spaces[1]; k++) if (!have.has(k)) miss.push(k); if (miss.length) fail.push(`${p} ${s}: нет промежутков ${miss.join(', ')}`); }
      for (const sh of list) { const g = sh.side === 'R' ? -1 : 1; if ([...sh.a, ...sh.b].some(q => g * q[0] < -1)) fail.push(sh.name + ' за средней линией'); }
    }
    for (const sh of list) {
      const s = sh.side, k = sh.space, n = sh.a.length, bad = [];
      if (c.check === 'border') {
        for (let i = 0; i < n; i++) {
          const a = sh.a[i], b = sh.b[i];
          for (const [p, rib, sign, tagE] of [[a, k, 1, 'верх'], [b, k + 1, -1, 'низ']]) {
            const part = partAt(s, p);
            if (part !== rib && part !== 0) { bad.push(`${tagE}: ${i} у ребра ${part}`); continue; }
            /* край пласта — у края своего ребра (хряща), обращённого к промежутку: сам край — в ребре или не дальше NEAR от
               его поверхности, а на трети ширины пласта от края (не дальше 4 мм) по пласту к другому его краю — уже щель, не
               кость. Пласт, прикреплённый к противоположному краю ребра, здесь попал бы в само ребро. NEAR = 3,5 мм: сетка
               рёбер грубая (сечение ребра — 6 вершин, грани отходят от скруглённой кости на 1–2 мм), края пласта сглажены по
               азимуту (±2°), а край внутреннего слоя лежит у внутренней губы ребра */
            const u = subv(a, b), w = unitv(u), step = Math.min(.4, Math.hypot(...u) / 3);
            const own = RTRI(p, v => RC.label[s][v] === part), qo = [0, 1, 2].map(j => p[j] - sign * step * w[j]);
            if (own.d > NEAR && !G.insideBone(RIBCAGE_PB, p)) bad.push(`${tagE}: ${i} — в ${own.d.toFixed(2)} см от своего ребра`);
            if (inBone(qo)) bad.push(`${tagE}: ${i} — ${sign > 0 ? 'не нижний' : 'не верхний'} край ребра: в ${(step * 10).toFixed(0)} мм к промежутку — кость`);
          }
          const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
          if (inBone(mid)) bad.push(`середина ${i} внутри ребра`);
        }
      } else if (c.check === 'end') {
        const i = c.end === 'back' ? 0 : n - 1, j = c.end === 'back' ? Math.min(1, n - 1) : Math.max(0, n - 2);
        const mid = [(sh.a[i][0] + sh.b[i][0]) / 2, (sh.a[i][1] + sh.b[i][1]) / 2, (sh.a[i][2] + sh.b[i][2]) / 2];
        if (c.at === 'gap') {
          /* в 1 см впереди конца — уже кость или хрящ (промежуток закрылся) */
          const dir = unitv(subv(mid, [(sh.a[j][0] + sh.b[j][0]) / 2, (sh.a[j][1] + sh.b[j][1]) / 2, (sh.a[j][2] + sh.b[j][2]) / 2])), q = [mid[0] + dir[0], mid[1] + dir[1], mid[2] + dir[2]];
          const d = RTRI(q).d; if (d > c.tol && !G.insideBone(RIBCAGE_PB, q)) bad.push(`промежуток впереди открыт (до кости ${d.toFixed(1)} см)`);
        } else {
          /* ориентир ребра k или k+1 (конец свободного ребра — только k+1); расстояние — от ближайшей из точек конца пласта
             (верхний край, середина, нижний край) */
          const marks = c.at === 'tip' ? [RLM[s][k].ccj] : [RLM[s][k - 1], RLM[s][k]].map(L => L[c.at === 'costochondral' ? 'ccj' : c.at]);
          const d = Math.min(...marks.flatMap(q => [sh.a[i], mid, sh.b[i]].map(p => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]))));
          if (d > c.tol) bad.push(`в ${d.toFixed(1)} см от ориентира`);
        }
      }
      if (bad.length) fail.push(`${sh.name}: ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` (+${bad.length - 3})` : ''}`);
    }
    results.push({ id, tag, ok: !fail.length, fail, src: c.src });
  }
  /* у каждой части пластов должны быть проверки краёв и концов */
  const orphan = [...new Set(SHEETS.map(sh => sh.part))].filter(p => !['border', 'end', 'spaces'].every(k => (ref.sheets || []).some(c => c.check === k && c.parts.includes(p)))).map(p => p + ' (пласт)');
  return { results, orphan };
}
/* Сторона: правая мышца (_r) лежит справа от средней линии, левая — слева; ни одна точка пути (нейтральная поза) не
   заходит за середину дальше 1 см. Так в 4.34.0 нашлись ошибки исходной модели: перепутанные правая и левая прямая
   живота и левый пучок длиннейшей LTpT_T12, лежавший справа (исправлены при сборке — build_muscles.py, SIDE_FIX). */
function sides(list = bound, pts = paths) {
  const bad = [];
  list.forEach((mu, i) => { const s = mu.side === 'R' ? -1 : mu.side === 'L' ? 1 : 0; if (s && pts[i].points.some(p => (p[0] - midX) * s < -1)) bad.push(mu.name); });
  return bad;
}
module.exports = { table, describe, level, VERT, vertIndex, BONES, bound, paths, R, frames, ends, audit, sides, midX, sheetAudit, SHEETS: SHEET_DATA };
if (require.main === module) {
  if (process.argv.includes('--audit')) {
    const ref = require('./fixtures/attachments.json'), a = audit(ref);
    for (const r of a.results) console.log(`${r.ok ? '✓' : a.known[r.id] ? '◐' : '✗'} ${r.tag}${r.ok ? '' : ' — ' + r.fail.join('; ')}`);
    if (a.orphan.length) console.log('Без эталона: ' + a.orphan.join(', '));
    const wrong = sides();
    console.log(wrong.length ? '✗ не на своей стороне: ' + wrong.join(', ') : '✓ все мышцы на своей стороне');
    console.log(`Проверок ${a.results.length}: в норме ${a.results.filter(r => r.ok).length}, известных расхождений ${a.results.filter(r => !r.ok && a.known[r.id]).length}, новых ${a.unknown.length}`);
    process.exit(a.unknown.length || a.orphan.length || a.fixed.length || wrong.length ? 1 : 0);
  }
  const t = table();
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(t));
  else for (const r of t) console.log(`${r.part.padEnd(9)} ${String(r.n).padStart(2)} ${r.group.padEnd(14)} | ${fmt(r.a)}  ⇄  ${fmt(r.b)}`);
}
