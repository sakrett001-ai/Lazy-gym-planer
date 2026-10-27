'use strict';
/* Проверки видимой кожи Anny по всему каталогу (npm run anny:check; входит в npm run check). Кожа — та же, что на экране:
   данные src/data/anny.bin, скиннинг AnnySkin.skin (двойные кватернионы, корректирующие формы) — копия расчёта шейдера.
   node tools/anny-look/check.js [all|id,id] [0,0.25,0.5,0.75,1] [--json файл] [--quiet]

   1. Опоры и инвентарь (penetration). Вершины Anny внутри деталей инвентаря и ниже пола. Детали и правила — валидатора
      (tools/biomech/validator2.js: collider, исключения кисти у ручек, ладони на опоре, предплечья у хвата). Допуск —
      допуск вдавливания валидатора для этой детали (заявленная опора: мягкая 4 см, жёсткая 2; прочее: мягкая 2,5, жёсткая
      0,8; стопа — 1,5 и 0,8; пальцы — 1,2; пол — 1 см): мягкие ткани и обивка поджимаются. Где сама процедурная кожа в
      этом кадре вдавлена глубже допуска (предупреждения валидатора, поза так одобрена), опора — её глубина. Сверх опоры
      кожа Anny может уйти ещё на DEPTH_EXTRA = 1 см: форма Anny отличается от процедурной (подтянутое телосложение, ягодицы,
      грудь), а 1 см — меньше толщины подкожного слоя над опорными зонами (ягодицы — 2–4 см, спина над лопатками — 1–2).
      Кисть и стопа — HAND_FOOT_EXTRA = 1,5 см: ладонь Anny с подушечками и стопа со сводом и пальцами полнее трубок и колец
      процедурной кисти и стопы (в стойке 95 % вершин кисти — ближе +1,97 см снаружи процедурной, стопы — +2,54).
      Пол: на экране кожа к нему прижата (AnnySkin.skin, шейдер — вершины ниже пола на полу); проверяется, насколько
      прижата (кожа без прижатия). Предплечье, плечо, корпус и ноги Anny полнее процедурных (в стойке 95 % вершин —
      ближе +2,08 см снаружи у предплечья, +1,90 у плеча, +2,07 у верха спины, +2,48 у поясницы), а суставы те же: где
      процедурная кожа лежит на полу, Anny ложится глубже на столько же — сверх допуска на это FLOOR_PRESS = 2 см (меньше
      этих полнот с запасом на сгиб). Кисти и стопе — нет (подошва и ладонь ставятся по контактам).
   2. Отход от процедурной кожи (distance). Процедурная кожа — то, по чему считаются контакты, равновесие и проверки;
      видимая кожа не должна уходить от неё дальше, чем сама форма Anny отличается от формы манекена в стойке, плюс запас
      на сгибы. В стойке (fit.py: местные формы поправлены там, где расхождение больше 2–3 см) 99 % вершин — ближе
      STANCE_P99 ≈ 3,5 см; поэтому в любом кадре 99 % вершин зоны должны быть ближе DIST_P99 = 5 см, а все — ближе
      DIST_MAX по зонам (ягодицы и пах — 9 см: процедурный «низ таза» скошен до −9 см под седалищными буграми для опоры
      сидя, у Anny там ягодичная складка; кисть — 6 см: пальцы Anny толще и длиннее трубок процедурной кисти; прочее — 7).
   3. Самопересечения и вывороты (folds) в крайних позах. Треугольник вывернут, если его нормаль в кадре смотрит против
      нормали стойки, повёрнутой смешанным поворотом его вершин (скиннинг сложил кожу). Складка — два треугольника,
      которые в стойке были ближе 5 см друг к другу (не соседние: без общих вершин), а в кадре пересекаются: так
      складывается кожа сгиба. Касания разных частей тела (бедро и икра в глубоком приседе, плечо и голова) — не складки:
      в стойке эти части дальше 5 см. Ноль недостижим: в полном сгибе (подколенная ямка, локтевой сгиб, пальцы вокруг
      грифа, подмышка при руке над головой) кожа с двух сторон сгиба прижимается и проходит сама в себя — у человека её
      сминают мягкие ткани, у скиннинга без столкновений она пересекается (у процедурной кожи там же — пересечение частей,
      валидатор допускает его на 1,5–3,5 см). Эти складки внутри сгиба и снаружи не видны. Поэтому проверка — «только
      убывают»: числа на позу записаны в tools/anny-look/fixtures/folds.json (node tools/anny-look/check.js --record-folds
      после улучшения), больше записанного — ошибка. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const V2 = require(root + '/tools/biomech/validator2.js'), CMP = require('./compare.js');
const { V } = M, FLOOR = M.FLOOR;
const DEPTH_EXTRA = 1.0, HAND_FOOT_EXTRA = 1.5, FLOOR_TOL = 1.0, FLOOR_PRESS = 2.0;
const extraOf = seg => seg === 'hand' || seg === 'foot' ? HAND_FOOT_EXTRA : DEPTH_EXTRA;
const DIST_P99 = 5.0, DIST_MAX = { 'ягодицы': 9, 'пах': 9, 'кисть': 6 }, DIST_MAX_DEFAULT = 7.0;
const FOLD_NEAR = 5.0;
const EXTREME = [['squat', 1], ['goblet', 1], ['legcurl', 1], ['bbcurl', 1], ['dbcurl', 1], ['chinup', 0], ['pullup', 0], ['latpull', 0], ['ohp', 0], ['ohext', 0],
  ['hollow', 1], ['bicycle', .25], ['hangknee', 1], ['lunge', 1], ['cablewood', 1], ['nordic', 1], ['burpee', .5], ['seatedcalf', 0], ['crunch', 1], ['pushup', 1]];

/* категория вершины для правил валидатора: кисть (пальцы), ладонь, дистальное предплечье, стопа, прочее */
function kinds(d) {
  const out = new Array(d.nv);
  for (let v = 0; v < d.nv; v++) {
    const f = d.frames[d.wi[v * 4]], s = f.endsWith('R') ? 'R' : 'L';
    out[v] = /^f\d\d/.test(f) ? { seg: 'hand', part: 'finger', side: s } : /^hand/.test(f) ? { seg: 'hand', part: 'palm', side: s }
      : /^(foot|toes)/.test(f) ? { seg: 'foot', side: s } : /^fd/.test(f) ? { seg: 'fa', distal: true, side: s } : { seg: f.replace(/[LR]$/, ''), side: s };
  }
  return out;
}
const aabb = (pts, pad) => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const p of pts) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i] - pad); hi[i] = Math.max(hi[i], p[i] + pad); } return { lo, hi }; };
const inBox = (b, x, y, z) => x >= b.lo[0] && x <= b.hi[0] && y >= b.lo[1] && y <= b.hi[1] && z >= b.lo[2] && z <= b.hi[2];
/* глубина в каждой детали: кожа Anny (P) и процедурная кожа (точки валидатора); правила — validator2.checkFrame */
function penetration(R, P, d, kind, entry, has) {
  const contacts = entry.contacts || R.contacts || [];
  const props = (R.props || []).filter(p => EQ.visible(p, has)), cols = props.flatMap(V2.collider).filter(c => !c.unknown && !c.cable);
  const declared = c => contacts.some(k => !/^grip/.test(k.body) && k.prop !== 'floor' && (c.id === k.prop || c.id.startsWith(k.prop + ':')));
  const isGrip = (c, side) => c.grip || c.role === 'grip' || contacts.some(k => k.body === 'grip' + side && (c.id === k.prop || c.id.startsWith(k.prop + ':')));
  const palmOn = side => contacts.some(k => k.body === 'palm' + side);
  const tolOf = (c, k) => k.seg === 'foot' ? (c.soft ? 1.5 : .8) : k.seg === 'hand' && k.part === 'finger' ? 1.2 : declared(c) ? (c.soft ? 4 : 2) : c.soft ? 2.5 : .8;
  const skip = (c, k) => (k.seg === 'hand' && isGrip(c, k.side)) || (k.seg === 'hand' && k.part === 'palm' && palmOn(k.side)) || (k.seg === 'fa' && k.distal && isGrip(c, k.side));
  const proc = V2.bodyPoints(R), out = [];
  for (const c of cols) {
    const box = aabb(c.pts, Math.max(c.r || 0, c.ptR || 0) + 1);
    let a = null;
    for (let v = 0; v < d.nv; v++) {
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2]; if (!inBox(box, x, y, z)) continue;
      const k = kind[v]; if (skip(c, k)) continue;
      const depth = -c.sdf([x, y, z]); if (!(depth > 0)) continue;
      const tol = tolOf(c, k); if (!a || depth - tol > a.depth - a.tol) a = { depth, tol, v, seg: k.seg };
    }
    if (!a) continue;
    /* процедурная кожа в той же детали (точки тела валидатора, те же исключения) */
    let pd = 0;
    for (const b of proc) {
      if (!inBox(box, b.p[0], b.p[1], b.p[2])) continue;
      const k = b.seg === 'hand' ? { seg: 'hand', part: b.part, side: b.side } : b.seg === 'fa' ? { seg: 'fa', distal: b.t > .8, side: b.side } : { seg: b.seg, side: b.side };
      if (skip(c, k)) continue;
      pd = Math.max(pd, -c.sdf(b.p) - (b.r || 0) * .5);
    }
    const extra = extraOf(a.seg);
    out.push({ id: c.id + (c.part ? '/' + c.part : ''), depth: a.depth, tol: a.tol, proc: pd, extra, limit: Math.max(a.tol, pd) + extra, seg: a.seg, v: a.v });
  }
  /* пол: кожа без прижатия (P — skin с floor: false); худшая вершина — по запасу до её допуска */
  let pd = 0; for (const b of proc) pd = Math.max(pd, b.p[1] - FLOOR - (b.seg === 'foot' ? .6 : 0));
  let fl = null;
  for (let v = 0; v < d.nv; v++) {
    const dep = P[v * 3 + 1] - FLOOR; if (!(dep > 0)) continue;
    const seg = kind[v].seg, extra = extraOf(seg) + (seg === 'hand' || seg === 'foot' ? 0 : FLOOR_PRESS), limit = Math.max(FLOOR_TOL, pd) + extra;
    if (!fl || dep - limit > fl.depth - fl.limit) fl = { id: 'floor', depth: dep, tol: FLOOR_TOL, proc: pd, extra, limit, seg, v };
  }
  if (fl) out.push(fl);
  return out;
}
/* вывернутые треугольники и складки (см. шапку) */
function folds(d, R, P, opts = {}) {
  const S = A.skinMats(R, d), DQ = A.dualQuats(S, d.frames.length), n = d.nf, idx = d.idx, B = d.pos;
  /* поворот вершины — смешанный кватернион (как в skin) */
  const rot = v => { let x = 0, y = 0, z = 0, w = 0, r0 = -1; for (let j = 0; j < 4; j++) { const wt = d.ww[v * 4 + j]; if (!wt) continue; const o = d.wi[v * 4 + j] * 8; let s = wt; if (r0 < 0) r0 = o; else if (DQ[o] * DQ[r0] + DQ[o + 1] * DQ[r0 + 1] + DQ[o + 2] * DQ[r0 + 2] + DQ[o + 3] * DQ[r0 + 3] < 0) s = -wt; x += s * DQ[o]; y += s * DQ[o + 1]; z += s * DQ[o + 2]; w += s * DQ[o + 3]; } const l = Math.hypot(x, y, z, w); return [x / l, y / l, z / l, w / l]; };
  const rotate = (q, p) => { const [x, y, z, w] = q, cx = y * p[2] - z * p[1] + w * p[0], cy = z * p[0] - x * p[2] + w * p[1], cz = x * p[1] - y * p[0] + w * p[2]; return [p[0] + 2 * (y * cz - z * cy), p[1] + 2 * (z * cx - x * cz), p[2] + 2 * (x * cy - y * cx)]; };
  const at = (Q, i) => [Q[i * 3], Q[i * 3 + 1], Q[i * 3 + 2]], nrm = (Q, a, b, c) => V.cross(V.sub(at(Q, b), at(Q, a)), V.sub(at(Q, c), at(Q, a)));
  let inverted = 0; const bad = [];
  for (let t = 0; t < n; t++) {
    const a = idx[t * 3], b = idx[t * 3 + 1], c = idx[t * 3 + 2], n0 = nrm(B, a, b, c), n1 = nrm(P, a, b, c), l0 = V.len(n0), l1 = V.len(n1);
    if (l0 < 1e-9 || l1 < 1e-9) continue;
    const q = rot(a), ref = rotate(q, n0);
    if (V.dot(ref, n1) / (l0 * l1) < -.2) { inverted++; if (bad.length < 5) bad.push(t); }
  }
  /* складки: пересечения треугольников, близких в стойке (сетка-решётка 2 см) */
  const cell = 2, grid = new Map(), key = (i, j, k) => i + ',' + j + ',' + k, tri = t => [at(P, idx[t * 3]), at(P, idx[t * 3 + 1]), at(P, idx[t * 3 + 2])];
  const lo = t => { const T = tri(t); return [0, 1, 2].map(i => Math.floor(Math.min(T[0][i], T[1][i], T[2][i]) / cell)); }, hi = t => { const T = tri(t); return [0, 1, 2].map(i => Math.floor(Math.max(T[0][i], T[1][i], T[2][i]) / cell)); };
  const only = opts.region || null;
  for (let t = 0; t < n; t++) { if (only && !only(t)) continue; const l = lo(t), h = hi(t); for (let i = l[0]; i <= h[0]; i++) for (let j = l[1]; j <= h[1]; j++) for (let k = l[2]; k <= h[2]; k++) { const kk = key(i, j, k); let a = grid.get(kk); if (!a) grid.set(kk, a = []); a.push(t); } }
  const cen = (Q, t) => [0, 1, 2].map(i => (Q[idx[t * 3] * 3 + i] + Q[idx[t * 3 + 1] * 3 + i] + Q[idx[t * 3 + 2] * 3 + i]) / 3);
  const seen = new Set(); let foldPairs = 0; const pairs = [];
  for (const list of grid.values()) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const s = list[i], t = list[j], k2 = s < t ? s * n + t : t * n + s; if (seen.has(k2)) continue; seen.add(k2);
      const vs = [idx[s * 3], idx[s * 3 + 1], idx[s * 3 + 2]], vt = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
      if (vs.some(v => vt.includes(v))) continue;
      if (V.dist(cen(B, s), cen(B, t)) > FOLD_NEAR) continue;
      if (triTri(tri(s), tri(t))) { foldPairs++; if (pairs.length < 5) pairs.push([s, t]); }
    }
  }
  return { inverted, folds: foldPairs, bad, pairs };
}
/* пересечение треугольников (Мёллер, 1997) */
function triTri(T1, T2) {
  const plane = T => { const n = V.cross(V.sub(T[1], T[0]), V.sub(T[2], T[0])); return [n, -V.dot(n, T[0])]; };
  const [n2, d2] = plane(T2), du = T1.map(p => V.dot(n2, p) + d2);
  if (du.every(x => x > 1e-9) || du.every(x => x < -1e-9)) return false;
  const [n1, d1] = plane(T1), dv = T2.map(p => V.dot(n1, p) + d1);
  if (dv.every(x => x > 1e-9) || dv.every(x => x < -1e-9)) return false;
  const D = V.cross(n1, n2), ax = [Math.abs(D[0]), Math.abs(D[1]), Math.abs(D[2])], k = ax[0] > ax[1] ? (ax[0] > ax[2] ? 0 : 2) : (ax[1] > ax[2] ? 1 : 2);
  const iv = (T, d) => {
    const p = T.map(q => q[k]); let a, b, c;
    if (d[0] * d[1] > 0) { a = 2; b = 0; c = 1; } else if (d[0] * d[2] > 0) { a = 1; b = 0; c = 2; } else if (d[1] * d[2] > 0 || d[0] !== 0) { a = 0; b = 1; c = 2; } else if (d[1] !== 0) { a = 1; b = 0; c = 2; } else { a = 2; b = 0; c = 1; }
    const t1 = p[a] + (p[b] - p[a]) * d[a] / (d[a] - d[b]), t2 = p[a] + (p[c] - p[a]) * d[a] / (d[a] - d[c]);
    return t1 < t2 ? [t1, t2] : [t2, t1];
  };
  if (Math.abs(du[0]) < 1e-9 && Math.abs(du[1]) < 1e-9 && Math.abs(du[2]) < 1e-9) return false;   /* копланарные — не считаем */
  const i1 = iv(T1, du), i2 = iv(T2, dv);
  return i1[1] > i2[0] + 1e-6 && i2[1] > i1[0] + 1e-6;
}

function run({ ids = null, ts = [0, .25, .5, .75, 1], d = CMP.loadAnny(), log = () => {} } = {}) {
  const POSES = CMP.loadPoses(), list = (ids || Object.keys(POSES)).filter(id => POSES[id]), kind = kinds(d), zones = CMP.zonesOf(d);
  const verts = []; for (let v = 0; v < d.nv; v += 2) if (zones[v] !== 'полость') verts.push(v);
  const res = { penetration: [], distance: {}, folds: [] };
  const zacc = {};
  for (const id of list) {
    const entry = POSES[id], invs = [['всё', () => true], ['ничего', () => false]];
    for (const [hn, has] of invs) {
      const e = EQ.variantEntry(entry, has), rig = EQ.rig(e);
      for (const t of ts) {
        const R = rig(t), P = A.skin(R, { d, floor: false });
        for (const p of penetration(R, P, d, kind, e, has)) if (p.depth > p.limit) res.penetration.push({ ex: id, t, has: hn, ...p });
        if (hn === 'всё') {
          const body = M.bodyData(R), Pv = new Float32Array(verts.length * 3); verts.forEach((v, k) => { Pv[k * 3] = P[v * 3]; Pv[k * 3 + 1] = P[v * 3 + 1]; Pv[k * 3 + 2] = P[v * 3 + 2]; });
          const dist = CMP.distances(d, Pv, R, zones, verts, body);
          verts.forEach((v, k) => { const z = zones[v], a = zacc[z] || (zacc[z] = { all: [], max: 0, where: '' }), x = Math.abs(dist[k]); a.all.push(x); if (x > a.max) { a.max = x; a.where = `${id} t=${t}`; } });
        }
      }
    }
    log(id);
  }
  for (const [z, a] of Object.entries(zacc)) { const s = a.all.sort((x, y) => x - y), n = s.length; res.distance[z] = { p99: s[Math.floor(n * .99)], p95: s[Math.floor(n * .95)], max: a.max, where: a.where, limitMax: DIST_MAX[z] ?? DIST_MAX_DEFAULT }; }
  for (const [id, t] of EXTREME) { if (!POSES[id] || (ids && !ids.includes(id))) continue; const R = EQ.rig(POSES[id])(t), P = A.skin(R, { d, floor: false }), f = folds(d, R, P); res.folds.push({ id, t, ...f }); }
  return res;
}
const FOLDS_FILE = path.join(__dirname, 'fixtures/folds.json');
function foldBase() { try { return JSON.parse(fs.readFileSync(FOLDS_FILE, 'utf8')); } catch (e) { return {}; } }
function failures(res) {
  const out = [];
  for (const p of res.penetration) out.push(`${p.ex}${p.has === 'ничего' ? ' (без необязательного инвентаря)' : ''} t=${p.t}: ${p.seg} в ${p.id === 'floor' ? 'полу' : p.id} на ${p.depth.toFixed(2)} см (допуск ${p.limit.toFixed(2)}: валидатор ${p.tol}, процедурная кожа ${p.proc.toFixed(2)} + ${p.extra})`);
  for (const [z, s] of Object.entries(res.distance)) { if (s.p99 > DIST_P99) out.push(`${z}: 99 % вершин дальше ${s.p99.toFixed(2)} см от процедурной кожи (допуск ${DIST_P99})`); if (s.max > s.limitMax) out.push(`${z}: отход ${s.max.toFixed(2)} см (${s.where}, допуск ${s.limitMax})`); }
  const base = foldBase();
  for (const f of res.folds) { const b = base[`${f.id} ${f.t}`] || { inverted: 0, folds: 0 }; if (f.inverted > b.inverted) out.push(`${f.id} t=${f.t}: вывернутых треугольников ${f.inverted} (записано ${b.inverted})`); if (f.folds > b.folds) out.push(`${f.id} t=${f.t}: складок ${f.folds} (записано ${b.folds})`); }
  return out;
}
module.exports = { kinds, penetration, folds, triTri, run, failures, foldBase, DEPTH_EXTRA, HAND_FOOT_EXTRA, FLOOR_PRESS, DIST_P99, DIST_MAX, DIST_MAX_DEFAULT, FOLD_NEAR, EXTREME };
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const ts = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3].split(',').map(Number) : [0, .25, .5, .75, 1];
  const quiet = process.argv.includes('--quiet'), t0 = Date.now();
  if (process.argv.includes('--record-folds')) {
    const d = CMP.loadAnny(), POSES = CMP.loadPoses(), out = {};
    for (const [id, t] of EXTREME) { const R = EQ.rig(POSES[id])(t), f = folds(d, R, A.skin(R, { d, floor: false })); out[`${id} ${t}`] = { inverted: f.inverted, folds: f.folds }; }
    fs.mkdirSync(path.dirname(FOLDS_FILE), { recursive: true }); fs.writeFileSync(FOLDS_FILE, JSON.stringify(out, null, 1) + '\n'); console.log(FOLDS_FILE); process.exit(0);
  }
  if (process.argv.includes('--folds')) {
    const d = CMP.loadAnny(), POSES = CMP.loadPoses();
    for (const [id, t] of EXTREME) { const R = EQ.rig(POSES[id])(t), noCorr = folds(d, R, A.skin(R, { d, floor: false, corr: d.correctives.map(() => 0) })), f = folds(d, R, A.skin(R, { d, floor: false })); console.log(`${id.padEnd(11)} t=${t}: вывернутых ${String(f.inverted).padStart(4)} (без форм ${String(noCorr.inverted).padStart(4)}), складок ${String(f.folds).padStart(4)} (без форм ${String(noCorr.folds).padStart(4)})`); }
    process.exit(0);
  }
  const res = run({ ids, ts, log: quiet ? () => {} : () => process.stderr.write('.') });
  if (!quiet) {
    console.log(`\nкожа Anny: ${((Date.now() - t0) / 1000).toFixed(0)} с`);
    console.log('отход от процедурной кожи (99 % / наибольший, см):'); for (const [z, s] of Object.entries(res.distance)) console.log(`  ${z.padEnd(12)} ${s.p99.toFixed(2).padStart(5)} / ${s.max.toFixed(2).padStart(5)} (допуск ${DIST_P99} / ${s.limitMax})  ${s.where}`);
    console.log('крайние позы (вывернутые треугольники, складки):', res.folds.map(f => `${f.id} ${f.t}: ${f.inverted}/${f.folds}`).join(', '));
  }
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(res, null, 1));
  const bad = failures(res);
  if (bad.length) { console.error(`\nКожа Anny: ${bad.length} нарушений:\n` + bad.slice(0, 60).join('\n')); process.exit(1); }
  console.log(`Кожа Anny: опоры, отход от процедурной кожи и крайние позы — в допусках (${ids ? ids.length : 'все'} упражнений × ${ts.length} фаз).`);
}
