'use strict';
/* Кожа Anny против процедурной кожи манекена по всему каталогу (те же формы тела, что у валидатора и skeleton/fit.js).
   node tools/anny-look/compare.js [all|id,id] [0,0.25,0.5,0.75,1] [--method dq|lbs|both] [--step 3] [--json файл]
   По зонам: среднее и 95-й процентиль |d|, наибольшее |d| и где (плюс — Anny снаружи процедурной кожи), доля вершин дальше
   2 и 3 см. Кисти — против процедурной кисти (ладонь — скруглённый брусок, пальцы — трубки по путям хвата), стопы — против
   колец стопы и трубок пальцев. Библиотека для tools/anny.test.js: loadAnny, proceduralSDF, zonesOf, measure. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const { V } = M;

function loadAnny(file = path.join(root, 'src/data/anny.bin')) { return A.decode(zlib.gunzipSync(fs.readFileSync(file))); }
function loadPoses() {
  for (const f of fs.readdirSync(path.join(root, 'src/js')).filter(f => /^09bo.*\.js$/.test(f)).sort()) require(path.join(root, 'src/js', f));
  return require(root + '/src/js/09bp-poses.js');
}
const ZONES = ['голова', 'шея', 'надплечья', 'грудь', 'верх спины', 'бока', 'живот', 'поясница', 'ягодицы', 'пах', 'дельты', 'плечо',
  'локоть', 'предплечье', 'кисть', 'бедро', 'колено', 'голень', 'стопа'];
/* зона вершины: по главной рамке веса (кисть, стопа, голова, шея) и по адресу на процедурной коже */
function zonesOf(d) {
  const out = new Array(d.nv), R = d.region;
  for (let v = 0; v < d.nv; v++) {
    const f = d.frames[d.wi[v * 4]];
    if (d.region.code[v] === 7) { out[v] = 'полость'; continue; }   /* выстилка рта (не видна) */
    if (/^(hand|f\d\d)/.test(f)) { out[v] = 'кисть'; continue; }
    if (/^(foot|toes)/.test(f)) { out[v] = 'стопа'; continue; }
    if (f === 'head') { out[v] = 'голова'; continue; }
    if (f === 'neck') { out[v] = 'шея'; continue; }
    const c = R.code[v], a1 = R.a1[v], a2 = R.a2[v];
    if (c === 1) { const h = a1, ang = a2; out[v] = h > 50 ? 'надплечья' : h < 6 ? (ang < 1.25 ? 'пах' : 'ягодицы') : h >= 30 ? (ang < 1.25 ? 'грудь' : ang > 1.95 ? 'верх спины' : 'бока') : (ang < 1.25 ? 'живот' : ang > 1.95 ? 'поясница' : 'бока'); }
    else if (c === 2) out[v] = a1 > .88 ? 'локоть' : 'плечо';
    else if (c === 3) out[v] = a1 < .12 ? 'локоть' : 'предплечье';
    else if (c === 4) out[v] = a1 > .85 ? 'колено' : 'бедро';
    else if (c === 5) out[v] = a1 < .15 ? 'колено' : 'голень';
    else if (c === 6) out[v] = 'дельты';
    else out[v] = /^(ua|cl|sp)/.test(f) ? 'дельты' : /^(fa|fd)/.test(f) ? 'предплечье' : /^th/.test(f) ? 'бедро' : /^sk/.test(f) ? 'голень' : /^(thorax)/.test(f) ? 'надплечья' : 'ягодицы';
  }
  return out;
}
const sdCapsule = (p, a, b, r) => { const pa = V.sub(p, a), ba = V.sub(b, a), h = Math.max(0, Math.min(1, V.dot(pa, ba) / V.dot(ba, ba))); return V.len(V.sub(pa, V.scale(ba, h))) - r; };
function sdRoundBox(p, c, ax, half, r) { const d = V.sub(p, c), q = [0, 1, 2].map(i => Math.abs(V.dot(d, ax[i])) - half[i] + r); return Math.hypot(Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)) + Math.min(Math.max(q[0], q[1], q[2]), 0) - r; }
/* Голова: M.headSDF — расстояние вдоль сечений (радиально по ряду и по оси), над макушкой и у лба оно не евклидово:
   у точки на 2 см выше верхнего ряда и на 8 см впереди оси оно даёт 8 см, а ближайшая точка поверхности — в 3–4 см.
   Поэтому для отхода — евклидово расстояние до сетки головы (headMesh, шаг ≈ 0,8 см; уши — эллипсоиды, расстояние по
   ним — M.headLocalSDF), знак — по headLocalSDF. Сетка расстояний в рамке головы — один раз, шаг 1 см, трилинейно. */
let HEAD_GRID = null;
function headGrid() {
  if (HEAD_GRID) return HEAD_GRID;
  const pts = M.headMesh().pts, np_ = pts.length, X = new Float64Array(np_ * 3), lo = [-14, -18, -16], n = [29, 37, 33], h = 1, g = new Float32Array(n[0] * n[1] * n[2]);
  pts.forEach((p, i) => { X[i * 3] = p[0]; X[i * 3 + 1] = p[1]; X[i * 3 + 2] = p[2]; });
  for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) for (let k = 0; k < n[2]; k++) {
    const x = lo[0] + i * h, y = lo[1] + j * h, z = lo[2] + k * h, s = M.headLocalSDF([x, y, z], false);
    let best = Infinity; for (let m = 0; m < np_; m++) { const dx = X[m * 3] - x, dy = X[m * 3 + 1] - y, dz = X[m * 3 + 2] - z, q = dx * dx + dy * dy + dz * dz; if (q < best) best = q; }
    let dist = Math.sqrt(best) * (s < 0 ? -1 : 1);
    if (s > 0) dist = Math.min(dist, M.headLocalSDF([x, y, z], true));   /* уши: эллипсоиды снаружи головы */
    g[(i * n[1] + j) * n[2] + k] = dist;
  }
  return HEAD_GRID = { lo, n, h, g };
}
function headDist(R, p) {
  const G = headGrid(), l = M.headLocal(R, p), f = [0, 1, 2].map(a => (l[a] - G.lo[a]) / G.h);
  if (f.some((x, a) => x < 0 || x > G.n[a] - 1.001)) return M.headSDF(R, p);
  const i = Math.floor(f[0]), j = Math.floor(f[1]), k = Math.floor(f[2]), u = f[0] - i, v = f[1] - j, w = f[2] - k, at = (a, b, c) => G.g[(a * G.n[1] + b) * G.n[2] + c];
  let s = 0; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) s += (a ? u : 1 - u) * (b ? v : 1 - v) * (c ? w : 1 - w) * at(i + a, j + b, k + c);
  return s;
}
/* знаковое расстояние до процедурной кожи кадра (каталог): объединение частей; parts — по частям (для кистей и стоп — свои) */
function proceduralSDF(R, body = M.bodyData(R), cache = M.torsoCache(R)) {
  const box = pts => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const p of pts) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } return { lo, hi }; };
  const near = (b, p, m) => p[0] > b.lo[0] - m && p[0] < b.hi[0] + m && p[1] > b.lo[1] - m && p[1] < b.hi[1] + m && p[2] > b.lo[2] - m && p[2] < b.hi[2] + m;
  const S = M.surface(R, { cols: 24, limbRows: 6, limbCols: 8 }), tb = box(S.torso.flat()), lb = {};
  for (const [k, rows] of Object.entries(S.limbs)) lb[k] = box(rows.flat());
  const hands = {}, feet = {};
  for (const s of M.SIDES) {
    const H = body.hands[s], hf = H.frame, Wp = p => V.add(V.add(V.add(hf.o, hf.x, p[0]), hf.y, p[1]), hf.z, p[2]);
    const pc = Wp(H.shape.palm.c), half = H.shape.palm.size.map(v => v / 2), ax = [hf.x, hf.y, hf.z];
    const caps = [...H.shape.fingers, H.shape.thumb].flatMap(f => f.pts.slice(1).map((b, i) => [Wp(f.pts[i]), Wp(b), f.r]));
    hands[s] = { b: box([pc, ...caps.flatMap(c => [c[0], c[1]])]), f: p => { let d = sdRoundBox(p, pc, ax, half, 1.2); for (const [a, b, r] of caps) d = Math.min(d, sdCapsule(p, a, b, r)); return d; } };
    const Fo = body.feet[s], rows = Fo.rows, toes = Fo.shape.toes.map(t => ({ r: t.r, pts: t.pts.map(p => V.add(V.add(V.add(Fo.toes.o, Fo.toes.x, p[0]), Fo.toes.y, p[1]), Fo.toes.z, p[2])) }));
    /* стопа: расстояние до колец заднего отдела — по ближайшему кольцу как до эллипса через точки кольца (без знака внутри: глубина
       по ближайшей точке с минусом, если точка ближе к оси кольца, чем кольцо) */
    const rings = rows.slice(1, -1).map(r => ({ c: r.reduce((a, p) => V.add(a, p, 1 / r.length), [0, 0, 0]), pts: r }));
    feet[s] = { b: box([...rows.flat(), ...toes.flatMap(t => t.pts)]), f: p => {
      let d = Infinity;
      for (const t of toes) for (let i = 1; i < t.pts.length; i++) d = Math.min(d, sdCapsule(p, t.pts[i - 1], t.pts[i], t.r));
      let best = Infinity, sgn = 1;
      for (const g of rings) { for (const q of g.pts) { const e = V.dist(p, q); if (e < best) { best = e; sgn = V.dist(p, g.c) < V.dist(q, g.c) ? -1 : 1; } } }
      return Math.min(d, sgn * best);
    } };
  }
  const caps = body.caps;
  function sdf(p) {
    let d = Infinity;
    if (near(tb, p, 6)) d = M.torsoSDF(R, p, cache);
    d = Math.min(d, headDist(R, p), M.neckSDF(R, p));
    for (const s of M.SIDES) for (const k of ['ua', 'fa', 'th', 'sk']) if (near(lb[k + s], p, 6)) d = Math.min(d, M.limbSDF(R, k, s, p));
    for (const c of caps) d = Math.min(d, V.dist(p, c.c) - c.r);
    return d;
  }
  sdf.hand = (s, p) => near(hands[s].b, p, 4) ? hands[s].f(p) : Infinity;
  sdf.foot = (s, p) => near(feet[s].b, p, 4) ? feet[s].f(p) : Infinity;
  /* расстояние до одной части: torso, head, neck, ua/fa/th/sk, hand, foot (со стороной), колпачок сустава (ac, sh, el, wr, kn, an) */
  const capOf = Object.fromEntries(caps.map(c => [c.key, c]));
  sdf.part = (name, s, p) => name === 'torso' ? M.torsoSDF(R, p, cache) : name === 'head' ? headDist(R, p) : name === 'neck' ? M.neckSDF(R, p)
    : name === 'hand' ? hands[s].f(p) : name === 'foot' ? feet[s].f(p) : ['ua', 'fa', 'th', 'sk'].includes(name) ? M.limbSDF(R, name, s, p)
    : capOf[name + s] ? V.dist(p, capOf[name + s].c) - capOf[name + s].r : Infinity;
  return sdf;
}
/* Части процедурной кожи, до которых меряется отход вершины зоны (своя сторона): своя часть и соседние по суставу.
   Не объединение всего тела: где части касаются друг друга (бедро о живот в глубоком приседе, кисть у затылка, плечо у
   головы при руках вверх), вершина Anny внутри чужой части оказалась бы «далеко внутри» процедурной кожи — это касание
   (его проверяют складки и опоры), а не отход формы. */
const ZONE_PARTS = {
  'голова': ['head'], 'шея': ['neck', 'head', 'torso', 'ac'], 'надплечья': ['torso', 'neck', 'ac', 'sh'], 'грудь': ['torso', 'sh', 'ac'],
  'верх спины': ['torso', 'sh', 'ac'], 'бока': ['torso', 'ua', 'sh'], 'живот': ['torso'], 'поясница': ['torso'], 'ягодицы': ['torso', 'th'],
  'пах': ['torso', 'th'], 'дельты': ['torso', 'ua', 'sh', 'ac'], 'плечо': ['ua', 'sh', 'el', 'torso'], 'локоть': ['ua', 'fa', 'el'],
  'предплечье': ['fa', 'el', 'wr'], 'кисть': ['hand', 'fa', 'wr'], 'бедро': ['th', 'torso', 'kn'], 'колено': ['th', 'sk', 'kn'],
  'голень': ['sk', 'kn', 'an'], 'стопа': ['foot', 'sk', 'an'],
};
/* расстояния вершин Anny (сетка кадра P) до процедурной кожи — до частей своей зоны (ZONE_PARTS) */
function distances(d, P, R, zones, verts, body) {
  const sdf = proceduralSDF(R, body), out = new Float32Array(verts.length);
  verts.forEach((v, k) => {
    const p = [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]], z = zones[v], f = d.frames[d.wi[v * 4]];
    const s = /[LR]$/.test(f) ? f.slice(-1) : d.region.side[v] ? 'R' : 'L';
    let m = Infinity; for (const part of ZONE_PARTS[z]) m = Math.min(m, sdf.part(part, s, p));
    out[k] = m;
  });
  return out;
}
function measure({ ids = null, ts = [0, .25, .5, .75, 1], method = 'dq', step = 3, d = loadAnny(), log = false } = {}) {
  const POSES = loadPoses(), zones = zonesOf(d), verts = []; for (let v = 0; v < d.nv; v += step) if (zones[v] !== 'полость') verts.push(v);
  const list = (ids || Object.keys(POSES)).filter(id => POSES[id]);
  const acc = Object.fromEntries(ZONES.map(z => [z, { all: [], max: 0, where: '' }]));
  const add = (P, R, where, body) => { const dist = distances(d, P, R, zones, verts, body); verts.forEach((v, k) => { const z = acc[zones[v]], a = Math.abs(dist[k]); z.all.push(dist[k]); if (a > z.max) { z.max = a; z.where = where; z.sign = Math.sign(dist[k]); } }); };
  { const R = M.catalogPose(M.neutral()), body = M.bodyData(R); add(A.skin(R, { d, method, only: verts, hands: body.hands }), R, 'стойка', body); }
  for (const id of list) for (const t of ts) {
    const R = EQ.rig(POSES[id])(t), body = M.bodyData(R);
    add(A.skin(R, { d, method, only: verts, hands: body.hands }), R, `${id} t=${t}`, body);
    if (log) process.stderr.write('.');
  }
  const out = {};
  for (const z of ZONES) {
    const a = acc[z]; if (!a.all.length) continue; const abs = a.all.map(Math.abs).sort((x, y) => x - y), n = abs.length;
    out[z] = { mean: abs.reduce((s, x) => s + x, 0) / n, p95: abs[Math.floor(n * .95)], p99: abs[Math.floor(n * .99)], max: a.max, sign: a.sign, where: a.where,
      signed: a.all.reduce((s, x) => s + x, 0) / n, over2: abs.filter(x => x > 2).length / n, over3: abs.filter(x => x > 3).length / n };
  }
  return out;
}
module.exports = { loadAnny, loadPoses, zonesOf, proceduralSDF, distances, measure, ZONES, ZONE_PARTS };
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const ts = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3].split(',').map(Number) : [0, .25, .5, .75, 1];
  const methods = (arg('--method') || 'dq') === 'both' ? ['dq', 'lbs'] : [arg('--method') || 'dq'];
  const res = {};
  for (const method of methods) {
    const t0 = Date.now(), r = measure({ ids, ts, method, step: +(arg('--step') || 3), log: true }); res[method] = r;
    console.log(`\n${method === 'dq' ? 'двойные кватернионы' : 'линейное смешение'} (${((Date.now() - t0) / 1000).toFixed(0)} с)`);
    console.log('зона         ср.|d|   95%   99%  наиб.  знак ср.  >2 см  >3 см  где наибольшее');
    for (const [z, s] of Object.entries(r)) console.log(`${z.padEnd(12)} ${s.mean.toFixed(2).padStart(6)} ${s.p95.toFixed(2).padStart(5)} ${s.p99.toFixed(2).padStart(5)} ${(s.sign < 0 ? '−' : '+') + s.max.toFixed(2).padStart(5)} ${s.signed.toFixed(2).padStart(9)} ${(100 * s.over2).toFixed(1).padStart(5)}% ${(100 * s.over3).toFixed(1).padStart(5)}%  ${s.where}`);
  }
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(res, null, 1));
}
