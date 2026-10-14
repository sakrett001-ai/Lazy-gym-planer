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

/* позвонки сверху вниз: высоты центров (Y вниз), шея — C1…C7 между основанием черепа и T1 */
const VERT = [];
{
  const c = k => mean(BONES[k].v);
  const skullY = ext(BONES.skull.v, 1)[1], cerv = BONES.cervical.v, [cTop, cBot] = ext(cerv, 1);
  for (let n = 1; n <= 7; n++) VERT.push({ name: 'C' + n, y: cTop + (cBot - cTop) * (n - .5) / 7 });
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
  /* у каждого конца каждой мышцы должен быть эталон */
  const orphan = [...new Set(E.filter(x => !used.has(x.muscle + ':' + x.j)).map(x => `${x.part} (${x.bone})`))];
  const known = ref.known || {}, failing = new Set(results.filter(r => !r.ok).map(r => r.id));
  return { results, orphan, unknown: results.filter(r => !r.ok && !known[r.id]), fixed: Object.keys(known).filter(k => !failing.has(k)), known };
}
module.exports = { table, describe, level, VERT, vertIndex, BONES, bound, paths, R, frames, ends, audit };
if (require.main === module) {
  if (process.argv.includes('--audit')) {
    const ref = require('./fixtures/attachments.json'), a = audit(ref);
    for (const r of a.results) console.log(`${r.ok ? '✓' : a.known[r.id] ? '◐' : '✗'} ${r.tag}${r.ok ? '' : ' — ' + r.fail.join('; ')}`);
    if (a.orphan.length) console.log('Без эталона: ' + a.orphan.join(', '));
    console.log(`Проверок ${a.results.length}: в норме ${a.results.filter(r => r.ok).length}, известных расхождений ${a.results.filter(r => !r.ok && a.known[r.id]).length}, новых ${a.unknown.length}`);
    process.exit(a.unknown.length || a.orphan.length || a.fixed.length ? 1 : 0);
  }
  const t = table();
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(t));
  else for (const r of t) console.log(`${r.part.padEnd(9)} ${String(r.n).padStart(2)} ${r.group.padEnd(14)} | ${fmt(r.a)}  ⇄  ${fmt(r.b)}`);
}
