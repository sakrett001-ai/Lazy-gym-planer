'use strict';
/* Ладони на опоре по коже Anny (вид «Манекен»): кисть, поставленная ладонью на опору (режим 'flat' — C.palm), лежит на ней, а не
   висит в воздухе. Опора — деталь инвентаря (контакт palmL/R: скамья, коврик, стена) или тело (ладонь на бедре в тяге
   в наклоне и концентрированном сгибании, на поясе, на затылке, на груди) — у тела контакта в спецификации нет, и
   валидатор его не проверяет. Плюс кисти «чашей» (cup, cupring): доля ладони на верхнем диске гантели.
   node tools/anny-look/palms.js [all|id,id] [0,0.25,0.5,0.75,1] [--all] [--relaxed] [--bake] [--json файл]
   Кожа ладони — вершины Anny с главной рамкой кисти этой стороны на ладонной стороне (в рамке кисти: ладоннее оси кисти
   и не дальше 10 см от запястья, без пальцев). Зазор до опоры:
   * деталь инвентаря — знаковое расстояние валидатора (collider.sdf), наименьшее по вершинам ладони;
   * тело — ближайшая вершина кожи Anny другой части тела (не своя кисть и не своё предплечье) и знак — по её нормали в кадре.
   Зазор кисти — наименьший из опор (минус — ладонь вдавлена). Доля ладони на опоре — вершины ладони ближе NEAR = 0,6 см.
   Подозрительно: зазор больше AIR = 0,5 см (ладонь висит) у кисти 'flat'; дальше FREE = 5 см — свободная раскрытая кисть
   (руки вперёд или в стороны), не опора. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const V2 = require(root + '/tools/biomech/validator2.js'), CMP = require('./compare.js'), H = require('./holds.js');
const { V } = M;
const LIM = { AIR: .5, NEAR: .6, FREE: 5 };
/* вершины ладони стороны s: главная рамка — кисть, ладонная сторона, не дальше 10 см от запястья (в стойке) */
function palmVerts(d, s) {
  d._palm = d._palm || {}; if (d._palm[s]) return d._palm[s];
  const R0 = M.catalogPose(M.neutral()), hf = R0.frames['hand' + s], g = M.SIGN[s], out = [];
  for (const h of H.handVerts(d)[s]) {
    if (!h.palm) continue;
    const p = V.sub([d.pos[h.v * 3], d.pos[h.v * 3 + 1], d.pos[h.v * 3 + 2]], hf.o), x = V.dot(p, hf.x) * g, y = V.dot(p, hf.y);
    if (x < -.3 && y > -10 && y < -1) out.push(h.v);    /* x — к тылу (·g), y — к пальцам минус */
  }
  return d._palm[s] = out;
}
/* нормали вершин кожи в кадре (по треугольникам) */
function vertexNormals(d, P) {
  const N = new Float32Array(d.nv * 3);
  for (let t = 0; t < d.nf; t++) {
    const a = d.idx[t * 3], b = d.idx[t * 3 + 1], c = d.idx[t * 3 + 2];
    const u = [P[b * 3] - P[a * 3], P[b * 3 + 1] - P[a * 3 + 1], P[b * 3 + 2] - P[a * 3 + 2]], w = [P[c * 3] - P[a * 3], P[c * 3 + 1] - P[a * 3 + 1], P[c * 3 + 2] - P[a * 3 + 2]], n = V.cross(u, w);
    for (const v of [a, b, c]) { N[v * 3] += n[0]; N[v * 3 + 1] += n[1]; N[v * 3 + 2] += n[2]; }
  }
  for (let v = 0; v < d.nv; v++) { const l = Math.hypot(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]) || 1; N[v * 3] /= l; N[v * 3 + 1] /= l; N[v * 3 + 2] /= l; }
  return N;
}
/* вершины тела, на которые может лечь ладонь стороны s: всё, кроме своей кисти, фаланг и предплечья */
function bodyVerts(d, s) {
  d._bodyFor = d._bodyFor || {}; if (d._bodyFor[s]) return d._bodyFor[s];
  const re = new RegExp(`^(hand|f\\d\\d|fa|fd)${s}$`), out = [];
  for (let v = 0; v < d.nv; v++) if (!re.test(d.frames[d.wi[v * 4]]) && d.region.code[v] !== 7) out.push(v);
  return d._bodyFor[s] = out;
}
function palmOf(R, P, N, d, s, entry, has) {
  const pv = palmVerts(d, s), at = v => [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]];
  /* детали инвентаря (видимые, кроме троса) */
  const cols = (R.props || []).filter(p => EQ.visible(p, has)).flatMap(V2.collider).filter(c => !c.unknown && !c.cable);
  let prop = { gap: Infinity, id: null }, floor = Infinity;
  for (const v of pv) { const p = at(v); floor = Math.min(floor, M.FLOOR - p[1]); for (const c of cols) { const x = c.sdf(p); if (x < prop.gap) prop = { gap: x, id: c.id }; } }
  /* тело: ближайшая вершина другой части и знак по её нормали */
  const bv = bodyVerts(d, s); let body = { gap: Infinity, v: -1 }, near = 0;
  const gaps = pv.map(v => {
    const p = at(v); let best = Infinity, bq = -1;
    for (const u of bv) { const dx = P[u * 3] - p[0], dy = P[u * 3 + 1] - p[1], dz = P[u * 3 + 2] - p[2], d2 = dx * dx + dy * dy + dz * dz; if (d2 < best) { best = d2; bq = u; } }
    const g = (p[0] - P[bq * 3]) * N[bq * 3] + (p[1] - P[bq * 3 + 1]) * N[bq * 3 + 1] + (p[2] - P[bq * 3 + 2]) * N[bq * 3 + 2];
    const gb = Math.sqrt(best) > 3 ? Math.sqrt(best) : g;   /* рядом (до 3 см) — знак по нормали ближайшей вершины, дальше — расстояние */
    if (gb < body.gap) body = { gap: gb, v: bq };
    return gb;
  });
  const propGaps = pv.map(v => Math.min(...cols.map(c => c.sdf(at(v))), M.FLOOR - P[v * 3 + 1]));
  near = pv.filter((v, i) => Math.min(gaps[i], propGaps[i]) < LIM.NEAR).length / pv.length;
  const gap = Math.min(prop.gap, floor, body.gap), on = gap === body.gap ? 'тело' : gap === floor ? 'пол' : prop.id;
  return { side: s, mode: R.hands[s], gap, on, prop: prop.id, propGap: prop.gap, floorGap: floor, bodyGap: body.gap, bodyFrame: body.v >= 0 ? d.frames[d.wi[body.v * 4]] : null, near };
}
function run({ ids = null, ts = [0, .25, .5, .75, 1], d = CMP.loadAnny(), POSES = CMP.loadPoses(), all = false, relaxed = false, log = () => {} } = {}) {
  const rows = [];
  for (const id of ids || Object.keys(POSES)) {
    if (!POSES[id] || id.startsWith('_')) continue;
    for (const [hn, has] of [['всё', () => true], ['ничего', () => false]]) {
      const e = EQ.variantEntry(POSES[id], has), rig = EQ.rig(e);
      if (hn === 'ничего' && e === EQ.variantEntry(POSES[id], () => true) && !(e.equipment || []).some(q => q.optional || q.optionalNot)) continue;
      for (const t of ts) {
        /* relaxed — с --relaxed: расслабленная кисть у тела (ладони на затылке, рука вдоль ноги в «мельнице») */
        const R = rig(t), sides = M.SIDES.filter(s => R.hands?.[s] === 'flat' || H.CUP_MODES.has(R.hands?.[s]) || (relaxed && R.hands?.[s] === 'relaxed'));
        if (!sides.length) continue;
        const P = A.skin(R, { d, floor: false, props: (R.props || []).filter(p => EQ.visible(p, has)) }), N = vertexNormals(d, P);
        for (const s of sides) {
          const o = palmOf(R, P, N, d, s, e, has);
          if (H.CUP_MODES.has(o.mode)) { const c = H.cupOf(R, P, d, s); Object.assign(o, { tipFinger: c?.tipFinger, tipThumb: c?.tipThumb }); }
          /* свободная раскрытая кисть (руки вперёд или в стороны — «лодочка», «прыжки», «супермен») — не опора: дальше FREE см */
          o.free = o.gap > LIM.FREE;
          o.bad = o.mode === 'flat' && o.gap > LIM.AIR && !o.free;
          if (o.mode === 'relaxed' && o.gap > LIM.FREE) continue;
          if (all || o.bad) rows.push({ id, t, has: hn, ...o });
        }
      }
    }
    log(id);
  }
  return rows;
}
const fmt = r => `${r.id.padEnd(16)} t=${String(r.t).padEnd(5)} ${r.side} ${r.has.padEnd(6)} ${r.mode.padEnd(8)} зазор ${r.gap.toFixed(2).padStart(6)} см (${r.on}${r.on === 'тело' ? ' ' + r.bodyFrame : ''}) | на опоре ${(r.near * 100).toFixed(0).padStart(3)} %${r.tipFinger != null ? ` | кончики ${r.tipFinger.toFixed(2)}, большой ${r.tipThumb.toFixed(2)}` : ''}${r.bad ? '  ← висит' : r.free ? '  (свободная)' : ''}${r.mode !== 'flat' ? ` | ладонь до диска ${r.propGap.toFixed(2)}` : ''}`;
module.exports = { LIM, palmVerts, vertexNormals, palmOf, run, fmt };
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const ts = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3].split(',').map(Number) : [0, .25, .5, .75, 1];
  /* --bake — позы из спецификаций (tools/mannequin/author.js), а не из запечённого 09bp-poses.js */
  const POSES = process.argv.includes('--bake') ? { ...CMP.loadPoses(), ...require(root + '/tools/mannequin/author.js').bakeAll({ only: ids }) } : CMP.loadPoses();
  const rows = run({ ids, ts, POSES, all: process.argv.includes('--all'), relaxed: process.argv.includes('--relaxed'), log: process.argv.includes('--quiet') ? () => {} : () => process.stderr.write('.') });
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows));
  process.stderr.write('\n');
  for (const r of rows) console.log(fmt(r));
  console.log(`ладоней на опоре: ${rows.length} строк; висят (зазор > ${LIM.AIR} см): ${rows.filter(r => r.bad).length}`);
}
