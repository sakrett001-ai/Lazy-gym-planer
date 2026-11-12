'use strict';
/* «Виляние» кожи Anny у плеча по ходу повтора (вид «Манекен»): кожа плеча идёт туда-обратно, хотя суставы движутся плавно.
   node tools/anny-look/wobble.js [all|id,id] [--n 121] [--bin файл] [--bake] [--json файл] [--top 20]
   По N кадрам повтора (рантайм — EQ.rig, кожа — AnnySkin.skin, как в шейдере) у вершин дельты, надплечий и плеча своей стороны
   в рамке грудной клетки: дрожание кадра i — |P(i) − (P(i−1) + P(i+1)) / 2| (половина второй разности: у плавного движения —
   доли миллиметра, рывок кожи «туда-обратно» за 2–4 кадра — сантиметры). Рядом — то же у суставов (плечевой, локтевой в той же
   рамке): если кость дрожит так же, это движение позы, а не кожи. Причина в кадре — изменения между соседними кадрами того, что
   двигает кожу помимо костей: снятой закрутки плеча (рамка закрутки, AnnySkin.rollFrame) и весов корректирующих форм.
   Печатает упражнения-стороны с рукой выше ARM° хоть в одном кадре: наибольшее дрожание кожи и костей, где, и причину. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const CMP = require('./compare.js');
const { V } = M;
const ARM = 90, ZONES = new Set(['дельты', 'надплечья', 'плечо']);
/* снятая закрутка плеча (градусы): та же, что у AnnySkin.rollFrame */
function rollOffOf(R, s) {
  const F = R.frames, fl = v => [v[0], -v[1], v[2]], im = f => M.M3.cols(fl(f.x), fl(f.y), fl(f.z));
  const st = M.swingTwist(M.M3.mul(M.M3.T(im(F.thorax)), im(F['ua' + s]))), g = M.SIGN[s];
  return A.rollOff(g * st.twist, st.elevation);
}
function sideVerts(d, zones, s) {
  const out = [];
  for (let v = 0; v < d.nv; v++) { if (!ZONES.has(zones[v])) continue; const f = d.frames[d.wi[v * 4]], vs = /[LR]$/.test(f) ? f.slice(-1) : d.pos[v * 3] > 0 ? 'L' : 'R'; if (vs === s) out.push(v); }
  return out;
}
function track(id, entry, { d, zones, n = 121 }) {
  const rig = EQ.rig(entry), frames = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), R = rig(t), P = A.skin(R, { d, floor: false, props: R.props || [] }), T = R.frames.thorax;
    const rel = p => { const q = V.sub(p, T.o); return [V.dot(q, T.x), V.dot(q, T.y), V.dot(q, T.z)]; };
    const JA = M.jointAngles(R);
    frames.push({ t, P, rel, R, el: { L: JA.L.elevation, R: JA.R.elevation }, roll: { L: rollOffOf(R, 'L'), R: rollOffOf(R, 'R') }, cw: A.correctiveWeights(R, d) });
  }
  const out = [];
  for (const s of M.SIDES) {
    if (!frames.some(f => f.el[s] >= ARM)) continue;
    const vs = sideVerts(d, zones, s), relV = (f, v) => f.rel([f.P[v * 3], f.P[v * 3 + 1], f.P[v * 3 + 2]]);
    const jit = (a, b, c) => V.len(V.sub(b, V.mix(a, c, .5)));
    let skin = { j: 0, i: -1, v: -1 }, bone = { j: 0, i: -1 };
    for (let i = 1; i < n - 1; i++) {
      const [a, b, c] = [frames[i - 1], frames[i], frames[i + 1]];
      for (const v of vs) { const j = jit(relV(a, v), relV(b, v), relV(c, v)); if (j > skin.j) skin = { j, i, v }; }
      for (const k of ['sh', 'el']) { const j = jit(a.rel(a.R[k + s]), b.rel(b.R[k + s]), c.rel(c.R[k + s])); if (j > bone.j) bone = { j, i, k }; }
    }
    const f = frames[skin.i] || frames[0], fa = frames[Math.max(0, skin.i - 1)], fc = frames[Math.min(n - 1, skin.i + 1)];
    /* причина в кадре: вторая разность снятой закрутки и весов форм */
    const d2 = (x, y, z) => Math.abs(y - (x + z) / 2);
    const roll2 = d2(fa.roll[s], f.roll[s], fc.roll[s]);
    let shape = { w: 0, k: -1 }; f.cw.forEach((w, k) => { const x = d2(fa.cw[k], w, fc.cw[k]); if (x > shape.w) shape = { w: x, k }; });
    /* снятая закрутка туда-обратно за повтор: сумма возвратов (полный ход минус чистый ход по монотонным участкам подъёма) */
    let rollBack = 0; for (let i = 1; i < n - 1; i++) { const a = frames[i - 1].roll[s], b = frames[i].roll[s], c = frames[i + 1].roll[s]; if ((b - a) * (c - b) < 0) rollBack += Math.min(Math.abs(b - a), Math.abs(c - b)); }
    let rollTV = 0; for (let i = 1; i < n; i++) rollTV += Math.abs(frames[i].roll[s] - frames[i - 1].roll[s]);
    out.push({ id, side: s, elMax: Math.max(...frames.map(x => x.el[s])), skin: skin.j, at: f.t, vertex: skin.v, zone: zones[skin.v], bone: bone.j, boneAt: frames[bone.i]?.t, boneKey: bone.k,
      el: f.el[s], roll: [fa.roll[s], f.roll[s], fc.roll[s]], roll2, rollTV, shape: shape.k >= 0 ? (d.correctives[shape.k].name || d.correctives[shape.k].angle) : null, shape2: shape.w });
  }
  return out;
}
function run({ ids = null, n = 121, d = CMP.loadAnny(), POSES = CMP.loadPoses(), log = () => {} } = {}) {
  const zones = CMP.zonesOf(d), rows = [];
  for (const id of ids || Object.keys(POSES)) {
    if (!POSES[id] || id.startsWith('_')) continue;
    rows.push(...track(id, EQ.variantEntry(POSES[id], () => true), { d, zones, n })); log(id);
  }
  return rows;
}
const fmt = r => `${r.id.padEnd(16)} ${r.side} подъём до ${r.elMax.toFixed(0).padStart(3)}° | кожа ${r.skin.toFixed(3)} см (t=${r.at.toFixed(3)}, ${r.zone}, подъём ${r.el.toFixed(0)}°) | кости ${r.bone.toFixed(3)} (${r.boneKey}, t=${r.boneAt?.toFixed(3)}) | закрутка ${r.roll.map(x => x.toFixed(1)).join(' → ')} (Δ² ${r.roll2.toFixed(1)}°, ход ${r.rollTV.toFixed(0)}°) | форма ${r.shape} Δ² ${r.shape2.toFixed(3)}`;
module.exports = { run, track, rollOffOf, fmt, ARM };
if (require.main === module) {
  const arg = (k, def) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : def; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const d = arg('--bin') ? A.decode(zlib.gunzipSync(fs.readFileSync(arg('--bin')))) : CMP.loadAnny();
  /* --bake — позы из спецификаций (tools/mannequin/author.js), а не из запечённого 09bp-poses.js */
  const POSES = process.argv.includes('--bake') ? { ...CMP.loadPoses(), ...require(root + '/tools/mannequin/author.js').bakeAll({ only: ids }) } : CMP.loadPoses();
  const rows = run({ ids, n: +arg('--n', 121), d, POSES, log: process.argv.includes('--quiet') ? () => {} : () => process.stderr.write('.') });
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows));
  process.stderr.write('\n');
  for (const r of rows.slice().sort((a, b) => b.skin - a.skin).slice(0, +arg('--top', 40))) console.log(fmt(r));
}
