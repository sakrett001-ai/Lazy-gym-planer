'use strict';
/* Хват кожи Anny (вид «Манекен»): кисть держит ручку, а не лежит рядом с ней. В духе tools/mannequin/holds-audit.js, но по
   видимой сетке Anny (AnnySkin.skin — тот же расчёт, что в шейдере), по всему каталогу, на кадрах t = 0, 0,25, 0,5, 0,75, 1
   и вариантах инвентаря «всё есть» и «ничего необязательного». Входит в npm run anny:check (tools/anny-look/check.js).
   node tools/anny-look/holds.js [all|id,id] [0,0.25,0.5,0.75,1] [--all] — таблица (по умолчанию — только нарушения).

   Кисть в хвате — режим 'grip' (R.hands) с ручкой: заявленная деталь хвата (контакт gripL/R) или ручка снаряда (grip, role
   'grip': гриф, рукоять, дужка гири, канат, полотенце) — ось в 3 см от центра хвата (дальше — «кулак держит воздух», это
   holds-audit). Кожа кисти — вершины, у которых главная рамка — кисть или фаланга этой стороны. В рамке ручки (ось e через
   ближайшую к центру хвата точку оси): осевая координата a, расстояние до оси ρ, угол φ вокруг оси.
   1. Обхват — доля окружности ручки (36 секторов по 10°), у которой в пределах ширины кисти (|a| ≤ COVER_A) есть кожа не
      дальше COVER_BAND от поверхности ручки (ρ − r ≤ 1 см; меньше половины толщины пальца — 2 см: кожа «на ручке», а не
      рядом). Кольцо силового хвата замкнуто — ладонь, пальцы и большой палец поверх них (Napier J. R. 1956, J Bone Joint
      Surg 38B: 902–913): COVER_MIN = 0,8. Без хвата (пальцы в позе покоя на грифе) — 0,4–0,6 (отрицательный тест).
   2. Глубина — кожа внутри ручки: пальцы — не глубже FINGER_DEPTH = 0,5 см (мякоть подушечки сминается на 2–3 мм; ещё
      2 мм — смешение весов у суставов) или, где ручка наклонена к кулаку и в неё уходит и процедурная кисть, — глубины её
      фаланг + FINGER_EXTRA = 0,6 (фаланги Anny толще трубок процедурной кисти на 0,14–0,35 см: медиана расстояния кожи до
      кости 0,86–1,21 против радиусов 0,72–0,86, — плюс 0,25 на мякоть); ладонь — как в проверке опор
      (check.js): глубина процедурной ладони в этой ручке + HAND_FOOT_EXTRA = 1,5 см (ладонь Anny с подушечками на 0,9–1,1 см
      полнее коробки процедурной ладони, а центр хвата у манекена — 2,6 см от запястья к ладони при её толщине 3 см: ручка
      и у процедурной кисти уходит в ладонь на r − 0,9 см).
   3. Шип — кончик пальца далеко от ручки: середина дальней трети концевой фаланги не дальше от поверхности ручки (или от
      «ручки кулака» — оси z кисти через центр хвата радиуса R.gripRadius, см. holdOf), чем TIP_FINGER = 1,5 см у пальцев
      (лежащий на ручке кончик — на свой радиус, 0,4–0,6 см, плюс 1 см) и TIP_THUMB = 3,2 у большого (он лежит поверх пальцев:
      толщина их средней фаланги — 2,0–2,4 см, свой радиус — 0,6, плюс 0,2). Отрицательные тесты: пальцы в позе покоя на грифе —
      кончики в 8,8–9 см, большой — в 3,8–4; скиннинг 4.63.0 (фаланги вокруг суставов процедурной кисти) — кончики в 2,7–3,2,
      большой («шип» со скриншотов владельца) — в 3,7–3,9. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const { collider } = require(root + '/tools/biomech/validator2.js');
const { V } = M;
const LIM = { COVER_A: 5.0, COVER_BAND: 1.0, COVER_MIN: .8, FINGER_DEPTH: .5, FINGER_EXTRA: .6, HAND_FOOT_EXTRA: 1.5, TIP_FINGER: 1.5, TIP_THUMB: 3.2, AIR: 3.0, SECTORS: 36 };

/* вершины кисти по сторонам: главная рамка, концевая треть фаланги (кончик) */
function handVerts(d) {
  if (d._handVerts) return d._handVerts;
  const out = { L: [], R: [] }, R0 = M.catalogPose(M.neutral());
  for (let v = 0; v < d.nv; v++) {
    const n = d.frames[d.wi[v * 4]], s = n.slice(-1), m = /^f(\d)(\d)[LR]$/.exec(n);
    if (n !== 'hand' + s && !m) continue;
    let tip = false;
    if (m && m[2] === '2' && d.hands) {
      const H = d.hands[s].digits[+m[1]], hf = R0.frames['hand' + s], p = [d.pos[v * 3], d.pos[v * 3 + 1], d.pos[v * 3 + 2]], t = V.sub(p, hf.o), q = [V.dot(t, hf.x), V.dot(t, hf.y), V.dot(t, hf.z)];
      const ax = V.sub(H.j[3], H.j[2]), u = V.dot(V.sub(q, H.j[2]), ax) / V.dot(ax, ax); tip = u > .67;
    }
    out[s].push({ v, palm: !m, digit: m ? +m[1] : -1, tip });
  }
  return d._handVerts = out;
}
const segDist = (p, a, b) => { const ab = V.sub(b, a), l2 = V.dot(ab, ab), k = l2 < 1e-9 ? 0 : Math.max(0, Math.min(1, V.dot(V.sub(p, a), ab) / l2)); return { d: V.dist(p, V.add(a, ab, k)), k, at: V.add(a, ab, k), dir: l2 < 1e-9 ? [0, 0, 1] : V.unit(ab) }; };
/* ручка у центра хвата стороны s: {id, c0 (ближайшая точка оси), e (ось), r, len: [от, до] по оси от c0} или null */
function handleAt(R, s, entry, has) {
  const props = (R.props || []).filter(p => EQ.visible(p, has)), cols = props.flatMap(collider), g = R['grip' + s];
  const declared = (entry.contacts || R.contacts || []).filter(k => k.body === 'grip' + s).map(k => k.prop);
  const handles = cols.filter(c => !c.unknown && (c.axis || c.cable) && (c.grip || c.role === 'grip' || declared.some(p => c.id === p || c.id.startsWith(p + ':'))));
  let best = null;
  for (const c of handles) {
    const segs = c.axis ? [c.axis] : c.pts.slice(1).map((b, i) => [c.pts[i], b]);
    for (const [a, b] of segs) { const q = segDist(g, a, b); if (!best || q.d < best.d) best = { d: q.d, c, a, b, q }; }
  }
  if (!best || best.d > LIM.AIR) return null;
  const { c, a, b, q } = best, e = q.dir, c0 = q.at;
  /* у каната и троса — вся ломаная как ручка: длина вдоль кисти не ограничена; у прямой ручки — её концы */
  const len = c.axis ? [V.dot(V.sub(a, c0), e), V.dot(V.sub(b, c0), e)] : [-Infinity, Infinity];
  return { id: c.id + (c.part ? '/' + c.part : ''), c0, e, r: c.r || 1.4, len, off: best.d };
}
/* процедурная кисть в этой ручке (M.handShape, как в holds-audit): глубина ручки в коробке ладони (r − расстояние оси до
   коробки) и в капсулах фаланг пальцев и большого (r + радиус фаланги − расстояние оси до оси фаланги) */
function procDepth(R, s, h) {
  const f = R.frames['hand' + s], sh = M.handShape(R.hands?.[s] || 'grip', s, R.gripRadius?.[s] ?? 1.4);
  const L = p => V.add(V.add(V.add(f.o, f.x, p[0]), f.y, p[1]), f.z, p[2]), c = L(sh.palm.c), ax = [f.x, f.y, f.z], half = sh.palm.size.map(v => v / 2);
  const box = p => { const d = V.sub(p, c), q = ax.map((a, i) => Math.abs(V.dot(d, a)) - half[i]); return V.len(q.map(v => Math.max(v, 0))) + Math.min(Math.max(...q), 0); };
  const axisD = p => { const t = V.sub(p, h.c0), a = Math.max(h.len[0], Math.min(h.len[1], V.dot(t, h.e))); return V.dist(p, V.add(h.c0, h.e, a)); };
  let m = Infinity; for (let a = -LIM.COVER_A; a <= LIM.COVER_A + 1e-9; a += .25) if (a >= h.len[0] && a <= h.len[1]) m = Math.min(m, box(V.add(h.c0, h.e, a)));
  let fing = 0;
  for (const fg of [...sh.fingers, sh.thumb]) for (let i = 1; i < fg.pts.length; i++) { const A_ = L(fg.pts[i - 1]), B = L(fg.pts[i]); for (let k = 0; k <= 8; k++) fing = Math.max(fing, h.r + fg.r - axisD(V.mix(A_, B, k / 8))); }
  return { palm: Math.max(0, h.r - m), finger: fing };
}
/* одна кисть в одном кадре: P — кожа (AnnySkin.skin, floor: false) */
function holdOf(R, P, d, s, entry, has) {
  const h = handleAt(R, s, entry, has); if (!h) return null;
  const n1 = V.unit(V.perp(Math.abs(h.e[1]) < .9 ? [0, 1, 0] : [1, 0, 0], h.e)), n2 = V.cross(h.e, n1);
  const near = new Float64Array(LIM.SECTORS).fill(Infinity);
  let fingerDepth = 0, palmDepth = 0;
  const tips = [0, 1, 2, 3, 4].map(() => [0, 0, 0, 0]);
  for (const hv of handVerts(d)[s]) {
    const p = [P[hv.v * 3], P[hv.v * 3 + 1], P[hv.v * 3 + 2]], t = V.sub(p, h.c0), a = V.dot(t, h.e), rad = V.sub(t, V.scale(h.e, a)), rho = V.len(rad), gap = rho - h.r;
    if (Math.abs(a) <= LIM.COVER_A) { const k = Math.floor(((Math.atan2(V.dot(rad, n2), V.dot(rad, n1)) / (2 * Math.PI)) + 1) % 1 * LIM.SECTORS) % LIM.SECTORS; if (gap < near[k]) near[k] = gap; }
    if (a >= h.len[0] && a <= h.len[1] && gap < 0) { if (hv.palm) palmDepth = Math.max(palmDepth, -gap); else fingerDepth = Math.max(fingerDepth, -gap); }
    if (hv.tip) { const c = tips[hv.digit]; c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; c[3]++; }
  }
  /* кончик пальца — середина дальней трети концевой фаланги: её расстояние до поверхности ручки (у лежащего на ручке кончика —
     около его радиуса, 0,5–0,7 см) */
  /* шип — кончик далеко и от ручки, и от «ручки кулака» (ось z кисти через центр хвата, радиус R.gripRadius — то, что пальцы
     обхватывают): где ручка снаряда наклонена к кулаку (присед — 24°, holds-audit допускает до 30°) или кончается раньше кисти
     (рожки гири), кончик у кулака — не шип */
  const hf = R.frames['hand' + s], gc = R['grip' + s], gr = R.gripRadius?.[s] ?? 1.4;
  const tipGap = c => { if (!c[3]) return 0; const p = [c[0] / c[3], c[1] / c[3], c[2] / c[3]], t = V.sub(p, h.c0), a = Math.max(h.len[0], Math.min(h.len[1], V.dot(t, h.e))), u = V.sub(p, gc);
    return Math.min(V.dist(p, V.add(h.c0, h.e, a)) - h.r, V.len(V.perp(u, hf.z)) - gr); };
  const tg = tips.map(tipGap), cover = near.filter(x => x <= LIM.COVER_BAND).length / LIM.SECTORS, proc = procDepth(R, s, h);
  return { side: s, handle: h.id, r: h.r, off: h.off, cover, fingerDepth, fingerLimit: Math.max(LIM.FINGER_DEPTH, proc.finger + LIM.FINGER_EXTRA), palmDepth, palmLimit: proc.palm + LIM.HAND_FOOT_EXTRA, tipFinger: Math.max(...tg.slice(1)), tipThumb: tg[0] };
}
function problems(o) {
  const out = [];
  if (o.cover < LIM.COVER_MIN) out.push(`обхват ${(o.cover * 100).toFixed(0)} % (нужно ≥ ${LIM.COVER_MIN * 100})`);
  if (o.fingerDepth > o.fingerLimit) out.push(`пальцы в ручке на ${o.fingerDepth.toFixed(2)} см (допуск ${o.fingerLimit.toFixed(2)})`);
  if (o.palmDepth > o.palmLimit) out.push(`ладонь в ручке на ${o.palmDepth.toFixed(2)} см (допуск ${o.palmLimit.toFixed(2)})`);
  if (o.tipFinger > LIM.TIP_FINGER) out.push(`кончик пальца в ${o.tipFinger.toFixed(2)} см от ручки (допуск ${LIM.TIP_FINGER})`);
  if (o.tipThumb > LIM.TIP_THUMB) out.push(`кончик большого пальца в ${o.tipThumb.toFixed(2)} см от ручки (допуск ${LIM.TIP_THUMB})`);
  return out;
}
/* кисти в хвате в кадре: R — поза, P — кожа; mode — режим кисти, по которому кисть считается держащей (по умолчанию R.hands) */
function framesHolds(R, P, d, entry, has, modes = R.hands) {
  const out = [];
  for (const s of M.SIDES) if ((modes?.[s] || 'relaxed') === 'grip') { const o = holdOf(R, P, d, s, entry, has); if (o) out.push(o); }
  return out;
}
function run({ ids = null, ts = [0, .25, .5, .75, 1], d, POSES, log = () => {} } = {}) {
  const rows = [];
  for (const id of ids || Object.keys(POSES)) {
    if (!POSES[id] || id.startsWith('_')) continue;
    for (const [hn, has] of [['всё', () => true], ['ничего', () => false]]) {
      const e = EQ.variantEntry(POSES[id], has), rig = EQ.rig(e);
      for (const t of ts) { const R = rig(t); if (!M.SIDES.some(s => R.hands?.[s] === 'grip')) continue; const P = A.skin(R, { d, floor: false, props: (R.props || []).filter(p => EQ.visible(p, has)) }); for (const o of framesHolds(R, P, d, e, has)) rows.push({ id, t, has: hn, ...o, bad: problems(o) }); }
    }
    log(id);
  }
  return rows;
}
const failures = rows => rows.filter(r => r.bad.length).map(r => `${r.id}${r.has === 'ничего' ? ' (без необязательного инвентаря)' : ''} t=${r.t} ${r.side}: хват ${r.handle} — ${r.bad.join('; ')}`);
function summary(rows) {
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : NaN; };
  const col = k => rows.map(r => r[k]);
  return { n: rows.length, cover: { min: Math.min(...col('cover')), p5: q(col('cover'), .05), median: q(col('cover'), .5) }, fingerDepth: { max: Math.max(...col('fingerDepth')), p95: q(col('fingerDepth'), .95), margin: Math.min(...rows.map(r => r.fingerLimit - r.fingerDepth)) },
    palmDepth: { max: Math.max(...col('palmDepth')), margin: Math.min(...rows.map(r => r.palmLimit - r.palmDepth)) }, tipFinger: { max: Math.max(...col('tipFinger')), p95: q(col('tipFinger'), .95) }, tipThumb: { max: Math.max(...col('tipThumb')), p95: q(col('tipThumb'), .95) } };
}
module.exports = { LIM, handVerts, handleAt, holdOf, framesHolds, problems, run, failures, summary };
if (require.main === module) {
  const CMP = require('./compare.js');
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const ts = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3].split(',').map(Number) : [0, .25, .5, .75, 1];
  const rows = run({ ids, ts, d: CMP.loadAnny(), POSES: CMP.loadPoses(), log: () => process.stderr.write('.') });
  const f2 = x => x.toFixed(2);
  for (const r of process.argv.includes('--all') ? rows : rows.filter(r => r.bad.length)) console.log(`${r.id.padEnd(14)} t=${String(r.t).padEnd(4)} ${r.side} ${r.has.padEnd(6)} ${r.handle.padEnd(18)} r=${f2(r.r)} обхват ${(r.cover * 100).toFixed(0).padStart(3)} % пальцы ${f2(r.fingerDepth)}/${f2(r.fingerLimit)} ладонь ${f2(r.palmDepth)}/${f2(r.palmLimit)} кончик ${f2(r.tipFinger)} большой ${f2(r.tipThumb)}${r.bad.length ? '  ⚠ ' + r.bad.join('; ') : ''}`);
  console.log('\n' + JSON.stringify(summary(rows)));
  const bad = failures(rows); if (bad.length) { console.error(`Хват кожи Anny: ${bad.length} нарушений`); process.exit(1); }
  console.log(`Хват кожи Anny: ${rows.length} кистей в хвате — обхват, глубина и кончики в допусках.`);
}
