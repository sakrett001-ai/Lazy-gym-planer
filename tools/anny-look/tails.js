'use strict';
/* Замер хвостов кожи Anny по всему каталогу и по фазам (вид «Манекен»; кожа — та же, что на экране: AnnySkin.skin).
   node tools/anny-look/tails.js [all|id,id] [0,0.25,0.5,0.75,1] [--bin src/data/anny.bin] [--json файл] [--quiet]
   1. Подмышка при руках вверх (подъём плеча ≥ ARM_UP°): излом кожи — угол между нормалями соседних треугольников в кадре
      сверх угла в стойке (crease, градусы) у рёбер кожи корпуса, плечевого пояса и плеча ближе AXILLA_R см от плечевого
      сустава. Угловатая полоса — цепочка рёбер с изломом: число рёбер с изломом больше 25° и 40°, наибольший излом.
   2. Опоры: зазор между кожей и заявленной опорой (контакты упражнения, кроме хвата и пола): наименьшее знаковое
      расстояние вершин области контакта до деталей опоры. Плюс — кожа висит над опорой. Рядом — то же у процедурной кожи
      (точки тела валидатора, его области контактов).
   3. Пол: глубина кожи под полом без прижатия (на экране вершины ниже пола ставятся на пол — эта глубина сплющивается) по
      частям тела; у предплечья — где (доля длины от локтя, сторона сечения).
   4. Складки в крайних позах (check.js EXTREME): вывороты и складки всего тела и по суставам — колено, локоть, подмышка, пах.
   Без --quiet печатает сводку; --json — всё по кадрам. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const V2 = require(root + '/tools/biomech/validator2.js'), CMP = require('./compare.js'), CK = require('./check.js');
const { V } = M, FLOOR = M.FLOOR;
const ARM_UP = 140, AXILLA_R = 16;

/* рёбра сетки: [a, b, треугольник 1, треугольник 2] (только внутренние) */
function edges(d) {
  if (d._edges) return d._edges;
  const m = new Map(), out = [];
  for (let t = 0; t < d.nf; t++) for (let k = 0; k < 3; k++) {
    const a = d.idx[t * 3 + k], b = d.idx[t * 3 + (k + 1) % 3], key = a < b ? a * 65536 + b : b * 65536 + a, e = m.get(key);
    if (e) e.push(t); else m.set(key, [Math.min(a, b), Math.max(a, b), t]);
  }
  for (const e of m.values()) if (e.length === 4) out.push(e);
  return d._edges = out;
}
const faceN = (P, idx, t) => { const a = idx[t * 3] * 3, b = idx[t * 3 + 1] * 3, c = idx[t * 3 + 2] * 3, u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], w = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]]; return V.unit(V.cross(u, w)); };
const dihedral = (P, idx, e) => { const n1 = faceN(P, idx, e[2]), n2 = faceN(P, idx, e[3]); return Math.acos(Math.max(-1, Math.min(1, V.dot(n1, n2)))) * M.R2D; };
/* вершины руки и корпуса у плечевого сустава стороны s: не кисть и не предплечье */
const AXILLA_ZONES = new Set(['надплечья', 'грудь', 'верх спины', 'бока', 'дельты', 'плечо', 'шея']);
function axilla(d, R, P, zones, s) {
  const E = edges(d), sh = R['sh' + s], near = new Uint8Array(d.nv);
  for (let v = 0; v < d.nv; v++) { if (!AXILLA_ZONES.has(zones[v])) continue; const f = d.frames[d.wi[v * 4]]; if (/[LR]$/.test(f) && f.slice(-1) !== s) continue; if (V.dist([P[v * 3], P[v * 3 + 1], P[v * 3 + 2]], sh) < AXILLA_R) near[v] = 1; }
  let n25 = 0, n40 = 0, max = 0, sum = 0, at = -1; const verts = new Set();
  for (const e of E) {
    if (!near[e[0]] || !near[e[1]]) continue;
    const c = dihedral(P, d.idx, e) - dihedral(d.pos, d.idx, e);
    if (c > 25) { n25++; verts.add(e[0]); verts.add(e[1]); sum += c - 25; }
    if (c > 40) n40++;
    if (c > max) { max = c; at = e[0]; }
  }
  return { n25, n40, max, excess: sum, at, verts: [...verts] };
}
/* области контакта на коже Anny (как regionPoints валидатора): зоны (compare.zonesOf) и сторона */
const BODY_ZONES = {
  buttocks: ['ягодицы', 'пах', 'бедро'], back: ['надплечья', 'верх спины', 'бока', 'поясница', 'ягодицы', 'грудь', 'живот'],
  upperBack: ['надплечья', 'верх спины', 'бока', 'грудь'], chest: ['грудь', 'бока', 'живот', 'надплечья'], front: ['грудь', 'бока', 'живот', 'надплечья'],
  belly: ['живот', 'бока', 'грудь', 'поясница'], thighsBack: ['бедро', 'колено'], shoulders: ['надплечья', 'дельты'], neck: ['шея'],
  headBack: ['голова'], forehead: ['голова'], headAll: ['голова'],
  knee: ['колено'], shin: ['голень', 'колено'], th: ['бедро', 'колено'], ua: ['плечо', 'локоть', 'дельты'], fa: ['предплечье', 'локоть'],
  palm: ['кисть'], hand: ['кисть'], foot: ['стопа'], sole: ['стопа']
};
function sideOf(d, v) { const f = d.frames[d.wi[v * 4]]; return /[LR]$/.test(f) ? f.slice(-1) : d.region.side[v] ? 'R' : 'L'; }
function contactVerts(d, zones, body) {
  const m = /^(sole|palm|knee|shin|hand|ua|fa|th|sk|foot)(L|R)?$/.exec(body), key = m ? m[1] : body, s = m ? m[2] : null, zs = BODY_ZONES[key === 'sk' ? 'shin' : key];
  if (!zs) return null;
  const out = []; for (let v = 0; v < d.nv; v++) if (zs.includes(zones[v]) && (!s || sideOf(d, v) === s)) out.push(v);
  return out;
}
/* опоры: зазор кожи Anny и процедурной кожи до заявленных деталей */
function supports(d, R, P, zones, entry, has, cache) {
  const contacts = entry.contacts || R.contacts || [], props = (R.props || []).filter(p => EQ.visible(p, has)), cols = props.flatMap(V2.collider).filter(c => !c.unknown && !c.cable);
  const out = []; let pts = null;
  for (const k of contacts) {
    if (/^grip/.test(k.body)) continue;
    if (k.when && (cache.t < k.when[0] - 1e-6 || cache.t > k.when[1] + 1e-6)) continue;
    const cand = k.prop === 'floor' ? [{ sdf: p => FLOOR - p[1] }] : cols.filter(c => c.id === k.prop || c.id.startsWith(k.prop + ':')); if (!cand.length) continue;
    const vs = cache.cv[k.body] || (cache.cv[k.body] = contactVerts(d, zones, k.body)); if (!vs) continue;
    let gap = Infinity, at = -1;
    for (const v of vs) { const p = [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]; for (const c of cand) { const x = c.sdf(p); if (x < gap) { gap = x; at = v; } } }
    pts = pts || V2.bodyPoints(R);
    let proc = Infinity; try { /* та же область валидатора */
      const reg = regionPoints(k.body, pts); for (const c of cand) for (const b of reg) proc = Math.min(proc, c.sdf(b.p));
    } catch (e) { proc = NaN; }
    out.push({ body: k.body, prop: k.prop, gap, proc, v: at, zone: zones[at] });
  }
  return out;
}
/* область контакта процедурной кожи — копия regionPoints валидатора (он её не экспортирует) */
function regionPoints(name, pts) {
  const m = /^(sole|grip|palm|knee|shin|hand|ua|fa|th|sk|foot)(L|R)?$/.exec(name);
  if (name === 'back') return pts.filter(p => p.seg === 'torso' && p.h >= -2.4 && p.h <= 55.8);
  if (name === 'upperBack' || name === 'chest' || name === 'front' || name === 'belly') return pts.filter(p => p.seg === 'torso' && p.h >= (name === 'upperBack' ? 26 : name === 'belly' ? -2.4 : 10) && p.h <= (name === 'belly' ? 30 : 53.8));
  if (name === 'buttocks') return pts.filter(p => (p.seg === 'torso' && p.h <= 6) || (p.seg === 'th' && p.t <= .6));
  if (name === 'thighsBack') return pts.filter(p => p.seg === 'th');
  if (name === 'shoulders') return pts.filter(p => (p.seg === 'torso' && p.h >= 50.8) || (p.seg === 'ua' && p.t <= .15));
  if (name === 'neck') return pts.filter(p => p.seg === 'neck');
  if (name === 'headBack' || name === 'headAll' || name === 'forehead') return pts.filter(p => p.seg === 'head');
  if (m) {
    const [, k, s] = m;
    if (k === 'sole') return pts.filter(p => p.seg === 'foot' && p.side === s && p.sole);
    if (k === 'foot') return pts.filter(p => p.seg === 'foot' && p.side === s);
    if (k === 'palm' || k === 'hand') return pts.filter(p => p.seg === 'hand' && p.side === s);
    if (k === 'knee') return pts.filter(p => (p.seg === 'sk' && p.side === s && p.t <= .25) || (p.seg === 'th' && p.side === s && p.t >= .85));
    if (k === 'shin') return pts.filter(p => p.seg === 'sk' && p.side === s);
    return pts.filter(p => p.seg === k && p.side === s);
  }
  throw Error('область ' + name);
}
/* пол: глубина под полом (без прижатия) по частям; процедурная кожа — точки валидатора */
const FLOOR_PART = f => /^(fa|fd)/.test(f) ? 'предплечье' : /^ua/.test(f) ? 'плечо' : /^(hand|f\d\d)/.test(f) ? 'кисть' : /^(foot|toes)/.test(f) ? 'стопа' : /^(th)/.test(f) ? 'бедро' : /^sk/.test(f) ? 'голень' : /^(head|neck)/.test(f) ? 'голова' : 'корпус';
function floorDepth(d, R, P) {
  const out = {};
  for (let v = 0; v < d.nv; v++) { const dep = P[v * 3 + 1] - FLOOR; if (!(dep > 0)) continue; const part = FLOOR_PART(d.frames[d.wi[v * 4]]), o = out[part]; if (!o || dep > o.depth) out[part] = { depth: dep, v }; }
  return out;
}
function procFloor(R) {
  const out = {}; for (const b of V2.bodyPoints(R)) { const part = b.seg === 'fa' ? 'предплечье' : b.seg === 'ua' ? 'плечо' : b.seg === 'hand' ? 'кисть' : b.seg === 'foot' ? 'стопа' : b.seg === 'th' ? 'бедро' : b.seg === 'sk' ? 'голень' : b.seg === 'head' || b.seg === 'neck' ? 'голова' : 'корпус', dep = b.p[1] - FLOOR - (b.seg === 'foot' ? .6 : 0); if (dep > (out[part] ?? 0)) out[part] = dep; }
  return out;
}
/* где на предплечье: доля длины от локтя (0) к запястью (1) и сторона сечения в рамке fa (x — наружу у левой, z — вперёд) */
function forearmSpot(R, s, p) {
  const e = R['el' + s], w = R['wr' + s], ax = V.sub(w, e), t = V.dot(V.sub(p, e), ax) / V.dot(ax, ax), f = R.frames['fd' + s], r = V.perp(V.sub(p, V.add(e, ax, t)), V.unit(ax)), g = M.SIGN[s];
  const ang = Math.atan2(g * V.dot(r, f.x), V.dot(r, f.z)) * M.R2D;   /* 0 — сторона z рамки дистального предплечья, +90 — x наружу */
  return { u: t, ang };
}
/* складки по суставам: пара треугольников — по главным рамкам её шести вершин */
function jointOf(fr) {
  const has = re => fr.some(f => re.test(f));
  if (has(/^f\d\d/) || has(/^hand/)) return 'кисть';
  if (has(/^th/) && has(/^sk/)) return 'колено';
  if (has(/^ua/) && has(/^(fa|fd)/)) return 'локоть';
  if (has(/^(thorax|cl|sp|lumbar)/) && has(/^ua/)) return 'подмышка';
  if (has(/^(pelvis|lumbar|thorax)/) && has(/^th/)) return 'пах';
  if (has(/^(sk|foot|toes)/) && has(/^(foot|toes)/)) return 'стопа';
  if (has(/^(fa|fd)/)) return 'локоть';
  if (has(/^th/) || has(/^sk/)) return 'колено';
  if (has(/^ua/)) return 'подмышка';
  return 'прочее';
}
function foldJoints(d, f) {
  const out = {};
  for (const [s, t] of f.pairs) { const fr = [s, t].flatMap(tt => [0, 1, 2].map(k => d.frames[d.wi[d.idx[tt * 3 + k] * 4]])); const j = jointOf(fr); out[j] = (out[j] || 0) + 1; }
  return out;
}
function run({ ids = null, ts = [0, .25, .5, .75, 1], d = CMP.loadAnny(), log = () => {} } = {}) {
  const POSES = CMP.loadPoses(), list = (ids || Object.keys(POSES)).filter(id => POSES[id]), zones = CMP.zonesOf(d);
  const res = { axilla: [], supports: [], floor: [], folds: [] };
  for (const id of list) {
    for (const [hn, has] of [['всё', () => true], ['ничего', () => false]]) {
      const e = EQ.variantEntry(POSES[id], has), rig = EQ.rig(e), cache = { cv: {} };
      for (const t of ts) {
        const R = rig(t), P = A.skin(R, { d, floor: false, props: (R.props || []).filter(p => EQ.visible(p, has)) }); cache.t = t;
        const fd = floorDepth(d, R, P), pf = procFloor(R);
        for (const [part, o] of Object.entries(fd)) {
          const row = { id, t, has: hn, part, depth: o.depth, proc: pf[part] || 0, zone: zones[o.v] };
          if (part === 'предплечье') { const s = sideOf(d, o.v); Object.assign(row, { side: s }, forearmSpot(R, s, [P[o.v * 3], P[o.v * 3 + 1], P[o.v * 3 + 2]])); }
          res.floor.push(row);
        }
        if (hn !== 'всё') continue;
        const JA = M.jointAngles(R);
        for (const s of M.SIDES) if (JA[s].elevation >= ARM_UP) { const a = axilla(d, R, P, zones, s); res.axilla.push({ id, t, side: s, elevation: JA[s].elevation, n25: a.n25, n40: a.n40, max: a.max, excess: a.excess }); }
        for (const o of supports(d, R, P, zones, e, has, cache)) res.supports.push({ id, t, ...o });
      }
    }
    log(id);
  }
  for (const [id, t] of CK.EXTREME) {
    if (!POSES[id] || (ids && !ids.includes(id))) continue;
    const R = EQ.rig(POSES[id])(t), P = A.skin(R, { d, floor: false }), all = CK.folds(d, R, P, { all: true });
    res.folds.push({ id, t, inverted: all.inverted, folds: all.folds, joints: foldJoints(d, all) });
  }
  return res;
}
function summary(res) {
  const f2 = x => (x ?? 0).toFixed(2), lines = [];
  const ax = res.axilla.slice().sort((a, b) => b.excess - a.excess);
  const tot = ax.reduce((s, a) => s + a.n25, 0), tot40 = ax.reduce((s, a) => s + a.n40, 0), mx = ax.reduce((m, a) => Math.max(m, a.max), 0);
  lines.push(`1. Подмышка, руки вверх (≥ ${ARM_UP}°): кадров-сторон ${ax.length}; рёбер с изломом > 25° — ${tot}, > 40° — ${tot40}; наибольший излом ${mx.toFixed(0)}°`);
  for (const a of ax.slice(0, 12)) lines.push(`   ${a.id} t=${a.t} ${a.side}: подъём ${a.elevation.toFixed(0)}°, рёбер > 25° ${a.n25}, > 40° ${a.n40}, наиб. ${a.max.toFixed(0)}°`);
  const sp = res.supports.filter(s => isFinite(s.gap)).sort((a, b) => b.gap - a.gap);
  lines.push(`2. Опоры: контактов-кадров ${sp.length}; зазор кожи Anny (наибольший): ${f2(sp[0]?.gap)} см`);
  for (const s of sp.slice(0, 12)) lines.push(`   ${s.id} t=${s.t} ${s.body} → ${s.prop}: Anny ${f2(s.gap)} см (${s.zone}), процедурная ${f2(s.proc)}`);
  const fa = res.floor.filter(f => f.part === 'предплечье').sort((a, b) => b.depth - a.depth);
  lines.push(`3. Пол: предплечье под полом — кадров ${fa.length}, наибольшая глубина ${f2(fa[0]?.depth)} см`);
  for (const f of fa.slice(0, 12)) lines.push(`   ${f.id} t=${f.t} (${f.has}) ${f.side}: ${f2(f.depth)} см (процедурное ${f2(f.proc)}), доля от локтя ${f2(f.u)}, угол ${f.ang.toFixed(0)}°`);
  const byPart = {}; for (const f of res.floor) if (!byPart[f.part] || f.depth > byPart[f.part].depth) byPart[f.part] = f;
  lines.push('   по частям: ' + Object.entries(byPart).map(([p, f]) => `${p} ${f2(f.depth)} (${f.id} t=${f.t})`).join(', '));
  lines.push('4. Складки в крайних позах (вывороты/складки; складки по суставам):');
  for (const f of res.folds) lines.push(`   ${f.id} ${f.t}: ${f.inverted}/${f.folds}  ${Object.entries(f.joints).map(([j, n]) => j + ' ' + n).join(', ')}`);
  return lines.join('\n');
}
module.exports = { run, summary, axilla, supports, floorDepth, forearmSpot, edges, ARM_UP, AXILLA_R };
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const ts = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3].split(',').map(Number) : [0, .25, .5, .75, 1];
  const d = arg('--bin') ? A.decode(zlib.gunzipSync(fs.readFileSync(arg('--bin')))) : CMP.loadAnny();
  const res = run({ ids, ts, d, log: process.argv.includes('--quiet') ? () => {} : () => process.stderr.write('.') });
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(res));
  console.log('\n' + summary(res));
}
