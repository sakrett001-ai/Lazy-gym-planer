'use strict';
/* Замеры плечевого пояса (этап Д): node tools/mannequin/girdle-audit.js [--root каталог] [--json файл] [разделы]
   разделы: rhythm depth lengths cover time (по умолчанию — все). --root — другая копия репозитория (например, main для
   замеров «было»): код манекена, скелета, мышц и запечённые позы берутся из неё, ориентиры костей — из её skeleton.bin
   (tools/mannequin/girdle-data.js), поэтому замер одинаков для старой и новой кинематики: всё по матрицам костей кадра.
   - rhythm — подъём плеча 0…150° в плоскостях лопатки, отведения и сгибания с ритмом пояса по умолчанию (C.rhythm):
     ISB-углы ключицы (подъём, ретракция) и лопатки (внутр. ротация, поворот вверх, наклон назад) — приращения от
     нейтральной стойки, рядом — Ludewig 2009 / McClure 2001 (Mannequin.RHYTHM);
   - depth — заход лопатки в рёбра во всех упражнениях (кадры через 0,1): передняя поверхность тела лопатки против
     оболочки рёбер без щелей (как правило валидатора) и все вершины лопатки против оболочки по сектору (как
     tools/skeleton.test.js); стойка и худшие кадры;
   - lengths — длины ромбовидных, средней и нижней частей трапециевидной и поднимающей лопатку в рабочей фазе ключевых
     упражнений (правая сторона, сумма линий);
   - cover — открытая лопатка при руках над головой: медиальный край и корень ости (как проверка покрытия в
     tools/muscles.test.js) и нижний угол (точки в 4 см от него) — доля точек без мышцы на луче к коже;
   - time — время кадра: манекен (поза, поверхность, скелет) и слой мышц (пути, тела с кожей кадра). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const root = path.resolve(arg('--root', path.join(__dirname, '../..')));
const parts = process.argv.slice(2).filter((a, i, A) => !a.startsWith('--') && !(i && A[i - 1].startsWith('--')));
const want = k => !parts.length || parts.includes(k);
const M = require(path.join(root, 'src/js/09bm-mannequin.js')); global.Mannequin = M;
const EQ = require(path.join(root, 'src/js/09bn-equipment.js'));
for (const f of fs.readdirSync(path.join(root, 'src/js')).filter(f => /^09bo/.test(f)).sort()) require(path.join(root, 'src/js', f));
const SK = require(path.join(root, 'src/js/09bq-skeleton.js')), MU = require(path.join(root, 'src/js/09br-muscles.js'));
const POSES = require(path.join(root, 'src/js/09bp-poses.js'));
const { ctx } = require(path.join(root, 'tools/mannequin/compose.js'));
const { girdleData } = require('./girdle-data.js');
const skel = SK.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const GD = girdleData(skel.bones), G = GD.GIRDLE, RE = GD.RIB_ENV;
const { V } = M, out = { root };
const bone = (n, s = '') => skel.bones.findIndex(b => b.name === n && (b.side || '') === s);
const RIB = bone('ribcage'), SCAP = { L: bone('scapula', 'L'), R: bone('scapula', 'R') }, CLAV = { L: bone('clavicle', 'L'), R: bone('clavicle', 'R') };
const W = (m, i, p) => [0, 1, 2].map(r => m[i * 12 + r * 4] * p[0] + m[i * 12 + r * 4 + 1] * p[1] + m[i * 12 + r * 4 + 2] * p[2] + m[i * 12 + r * 4 + 3]);
const mir = (p, s) => s === 'L' ? [-p[0], p[1], p[2]] : p;
/* точка мира → рамка грудной клетки (ribcage), правая сторона — как есть, левая — зеркально по x */
const thx = (m, w, s) => { const o = RIB * 12, d = [w[0] - m[o + 3], w[1] - m[o + 7], w[2] - m[o + 11]], l = [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); return s === 'L' ? [-l[0], l[1], l[2]] : l; };
const framesOf = R => SK.frames(R, M.bodyData(R), skel.bones);
/* ISB по матрицам костей: лопатка — ts, ai, aa; ключица — грудино-ключичный (начало кости) → ac */
const D = 180 / Math.PI, toI = v => [v[2], v[1], -v[0]];
const unit = a => { const l = Math.hypot(...a); return a.map(x => x / l); }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function isb(m, s) {
  const P = (b, p) => thx(m, W(m, b, mir(p, s)), s);
  const ts = toI(P(SCAP[s], G.ts)), ai = toI(P(SCAP[s], G.ai)), aa = toI(P(SCAP[s], G.aa)), Z = unit(V.sub(aa, ts));
  let X = unit(cross(V.sub(ai, ts), V.sub(aa, ts))); if (X[0] < 0) X = X.map(x => -x); X = unit(V.perp(X, Z)); const Y = cross(Z, X);
  const F = [X[0], Y[0], Z[0], X[1], Y[1], Z[1], X[2], Y[2], Z[2]];
  const c = V.sub(toI(P(CLAV[s], G.ac)), toI(P(CLAV[s], [0, 0, 0])));
  return { ir: Math.atan2(F[2], F[8]) * D, ur: -Math.asin(Math.max(-1, Math.min(1, -F[5]))) * D, pt: Math.atan2(F[3], F[4]) * D,
    ret: -Math.atan2(c[0], c[2]) * D, elev: Math.atan2(c[1], Math.hypot(c[0], c[2])) * D };
}
/* ---------- ритм по умолчанию ---------- */
if (want('rhythm')) {
  const C = ctx([]), rest = isb(framesOf(M.catalogPose(M.neutral())), 'R'), R0 = (M.RHYTHM || null), rows = [];
  const lud = (k, th) => { if (!R0) return null; const T = R0.th, Y = R0[k]; if (th <= T[0]) return Y[0]; for (let i = 1; i < T.length; i++) if (th <= T[i]) return Y[i - 1] + (Y[i] - Y[i - 1]) * (th - T[i - 1]) / (T[i] - T[i - 1]); return Y.at(-1); };
  for (const [plane, label] of [[35, 'плоскость лопатки'], [0, 'отведение'], [90, 'сгибание']]) for (const th of [0, 30, 60, 90, 120, 150]) {
    const q = C.base(), p = plane / D;
    for (const s of ['L', 'R']) { q[s].shoulder = [th * Math.sin(p), th * Math.cos(p), 0]; C.rhythm(q, s); }
    const a = isb(framesOf(M.catalogPose(q)), 'R');
    rows.push({ plane: label, th, clavElev: a.elev - rest.elev, clavRet: a.ret - rest.ret, ir: a.ir - rest.ir, ur: a.ur - rest.ur, pt: a.pt - rest.pt });
  }
  out.rhythm = { rest, rows };
  console.log('Ритм по умолчанию: приращения от стойки, градусы (ключица: подъём, ретракция; лопатка: внутр. ротация, поворот вверх, наклон назад)');
  console.log(`  покой (ISB): ключица подъём ${rest.elev.toFixed(1)}, ретракция ${rest.ret.toFixed(1)}; лопатка ротация ${rest.ir.toFixed(1)}, вверх ${rest.ur.toFixed(1)}, наклон ${rest.pt.toFixed(1)}`);
  for (const r of rows) console.log(`  ${r.plane.padEnd(18)} θ ${String(r.th).padStart(3)}: ключица ${r.clavElev.toFixed(1).padStart(5)} ${r.clavRet.toFixed(1).padStart(5)} | лопатка ${r.ir.toFixed(1).padStart(6)} ${r.ur.toFixed(1).padStart(5)} ${r.pt.toFixed(1).padStart(5)}`);
}
/* ---------- заход лопатки в рёбра ---------- */
const ny = RE.y1 - RE.y0 + 1, na = RE.a1 - RE.a0 + 1, raw = RE.mm.split(' ').map(v => +v / 10);
const at = (i, j) => i >= 0 && i < ny && j >= 0 && j < na ? raw[i * na + j] : 0;
const dil = raw.map((_, k) => { const i = k / na | 0, j = k % na; let m = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) m = Math.max(m, at(i + a, j + b)); return m; });
const shell = (() => { const b = skel.bones[RIB], sh = new Map(); let zc = 0; for (let i = 2; i < b.pos.length; i += 3) zc += b.pos[i]; zc /= b.pos.length / 3;
  for (let i = 0; i < b.pos.length; i += 3) { const k = Math.round(b.pos[i + 1]) * 1000 + Math.round(Math.atan2(b.pos[i], b.pos[i + 2] - zc) * 36 / Math.PI), r = Math.hypot(b.pos[i], b.pos[i + 2] - zc); if (!(sh.get(k) >= r)) sh.set(k, r); } return { zc, sh }; })();
function depthOf(m, s) {
  let front = -Infinity, all = -Infinity;
  for (const f of G.front) {
    const l = thx(m, W(m, SCAP[s], mir(f, s)), s), x = Math.abs(l[0]), y = Math.round(l[1]), z = l[2] - RE.zc, a = Math.round(Math.atan2(x, z) * 36 / Math.PI);
    if (y < RE.y0 || y > RE.y1 || a < RE.a0 || a > RE.a1) continue; const r = dil[(y - RE.y0) * na + a - RE.a0]; if (r) front = Math.max(front, r - Math.hypot(x, z));
  }
  const w = SK.worldPoints(skel.bones[SCAP[s]], m, SCAP[s]), o = RIB * 12;
  for (let j = 0; j < w.length; j += 3) {
    const d = [w[j] - m[o + 3], w[j + 1] - m[o + 7], w[j + 2] - m[o + 11]], x = m[o] * d[0] + m[o + 4] * d[1] + m[o + 8] * d[2], y = m[o + 1] * d[0] + m[o + 5] * d[1] + m[o + 9] * d[2], z = m[o + 2] * d[0] + m[o + 6] * d[1] + m[o + 10] * d[2] - shell.zc;
    const k = Math.round(y) * 1000 + Math.round(Math.atan2(x, z) * 36 / Math.PI); let r = 0; for (const dk of [-1, 0, 1]) r = Math.max(r, shell.sh.get(k + dk) || 0);
    if (r) all = Math.max(all, r - Math.hypot(x, z));
  }
  return { front, all };
}
if (want('depth')) {
  const stand = framesOf(M.catalogPose(M.neutral())), d0 = { L: depthOf(stand, 'L'), R: depthOf(stand, 'R') };
  let wf = { d: -Infinity }, wa = { d: -Infinity }; const over = { f05: 0, f10: 0, a12: 0 }, byId = {}; let n = 0;
  for (const [id, e0] of Object.entries(POSES)) {
    const entries = [EQ.variantEntry(e0)]; if ((e0.equipment || []).some(q => q.optional || q.optionalNot)) entries.push(EQ.variantEntry(e0, () => false));
    for (const e of entries) { const rig = EQ.rig(e); for (let k = 0; k <= 10; k++) {
      const t = k / 10, m = framesOf(rig(t)); n++;
      let fmax = -Infinity, amax = -Infinity;
      for (const s of ['L', 'R']) { const d = depthOf(m, s); fmax = Math.max(fmax, d.front); amax = Math.max(amax, d.all);
        if (d.front > wf.d) wf = { d: d.front, where: `${id} t=${t} ${s}` }; if (d.all > wa.d) wa = { d: d.all, where: `${id} t=${t} ${s}` }; }
      if (fmax > .5) over.f05++; if (fmax > 1) over.f10++; if (amax > 1.2) over.a12++;
      byId[id] = Math.max(byId[id] ?? -Infinity, fmax);
    } }
  }
  const top = Object.entries(byId).sort((a, b) => b[1] - a[1]).slice(0, 10);
  out.depth = { stand: d0, worstFront: wf, worstAll: wa, frames: n, over, top };
  console.log(`\nЛопатка в рёбрах (см, плюс — глубина): стойка — передняя поверхность ${d0.R.front.toFixed(2)}, все вершины ${d0.R.all.toFixed(2)}`);
  console.log(`  худший кадр каталога: передняя поверхность ${wf.d.toFixed(2)} (${wf.where}); все вершины ${wa.d.toFixed(2)} (${wa.where})`);
  console.log(`  кадров ${n}: передняя глубже 0,5 — ${over.f05}, глубже 1 — ${over.f10}; все вершины глубже 1,2 — ${over.a12}`);
  console.log('  больше всего: ' + top.map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', '));
}
/* ---------- мышцы ---------- */
const md = MU.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin')))), bound = MU.bind(md, skel);
const GROUPS = { 'ромбовидные': /^rhomboid_\d_r$/, 'трапец. средняя': /^trap_scap_[678]_r$/, 'трапец. нижняя': /^trap_scap(_9|10|11)_r$/, 'поднимающая лопатку': /^lev_scap_\d_r$/, 'трапец. верхняя': /^(trap_clav_\d|trap_scap_[1-5])_r$/ };
const lenAt = (id, t) => { const m = framesOf(EQ.rig(EQ.variantEntry(POSES[id]))(t)), L = MU.layout(bound, m); const o = {}; for (const [g, re] of Object.entries(GROUPS)) o[g] = bound.reduce((a, mu, i) => a + (re.test(mu.name) ? L[i].length : 0), 0); return o; };
if (want('lengths')) {
  /* рабочая фаза: [t начала, t конца] — подъём груза или руки */
  const PH = [['bbrow', 0, 1, 'тяга в наклоне'], ['bbbench', 1, 0, 'жим лёжа (выжим)'], ['ohp', 0, 1, 'жим стоя'], ['pullup', 0, 1, 'подтягивания'], ['facepull', 0, 1, 'тяга к лицу'], ['ytw', .25, .5, 'Y-T-W: T'], ['ytw', .75, 1, 'Y-T-W: W'], ['reversesnow', 0, 1, '«снежные ангелы»']];
  out.lengths = [];
  console.log('\nДлины в рабочей фазе (правая сторона, сумма линий): изменение, %');
  console.log('  ' + ''.padEnd(20) + Object.keys(GROUPS).map(g => g.padStart(20)).join(''));
  for (const [id, a, b, label] of PH) {
    if (!POSES[id]) continue; const A = lenAt(id, a), Bv = lenAt(id, b), r = {};
    for (const g of Object.keys(GROUPS)) r[g] = 100 * (Bv[g] - A[g]) / A[g];
    out.lengths.push({ id, label, from: a, to: b, change: r });
    console.log('  ' + label.padEnd(20) + Object.values(r).map(v => ((v > 0 ? '+' : '') + v.toFixed(1)).padStart(20)).join(''));
  }
}
/* ---------- покрытие лопатки ---------- */
if (want('cover')) {
  const COVER = require(path.join(root, 'tools/muscles/cover.js')), GEO = require(path.join(root, 'tools/muscles/geometry.js'));
  const SIDES = MU.SIDES, START = MU.ringStarts(bound), BUF = new Float64Array(START[bound.length] * SIDES * 3), m0 = framesOf(M.catalogPose(M.neutral()));
  const ES = new Set(['mf', 'spinalis', 'ltpt', 'ltpl', 'il', 'ql']);
  const rows = [];
  for (const [id, t] of [['pullup', 0], ['chinup', 0], ['latpull', 0], ['hang', 0], ['ohp', 1], ['facepull', 1], ['bbrow', 1], ['ytw', 0], ['neutral', 0]]) {
    const R = id === 'neutral' ? M.catalogPose(M.neutral()) : EQ.rig(EQ.variantEntry(POSES[id]))(t), m = framesOf(R);
    MU.surfaceAll(bound, MU.layoutDrawn(bound, m, 1.5), m, BUF, null, START);
    const c = { skel, bound, start: START, pos: BUF, sides: SIDES, m, m0, sdf: GEO.skinSDF(R), MB: COVER.muscleBoxes(bound, START, BUF, SIDES, mu => ES.has(mu.part)) };
    const med = COVER.scapulaCover(c);
    /* нижний угол: задние точки лопатки в 4 см от нижнего угла, луч наружу по оси лопатки до кожи */
    let n = 0, open = 0; const by = {};
    for (const s of ['R', 'L']) {
      const i = SCAP[s], b = skel.bones[i], P = []; for (let k = 0; k < b.pos.length; k += 3) P.push([b.pos[k], b.pos[k + 1], b.pos[k + 2]]);
      const ai = mir(G.ai, s), o = P.reduce((a, p) => V.add(a, p, 1 / P.length), [0, 0, 0]);
      const nrm = (() => { const ts = mir(G.ts, s), aa = mir(G.aa, s); let w = unit(cross(V.sub(ai, ts), V.sub(aa, ts))); const back = [0, 1, 2].map(r => m0[i * 12 + r * 4 + 2]); if (V.dot([0, 1, 2].map(r => m0[i * 12 + r * 4] * w[0] + m0[i * 12 + r * 4 + 1] * w[1] + m0[i * 12 + r * 4 + 2] * w[2]), [0, 0, 1]) > 0) w = w.map(x => -x); return w; })();
      const w = unit([0, 1, 2].map(r => m[i * 12 + r * 4] * nrm[0] + m[i * 12 + r * 4 + 1] * nrm[1] + m[i * 12 + r * 4 + 2] * nrm[2]));
      const world = P.map(p => W(m, i, p));
      P.forEach((p, k) => {
        if (V.dist(p, ai) > 4) return;
        const pw = V.dot(world[k], w); let mx = -Infinity;
        for (let j = 0; j < P.length; j++) { if (V.dist(P[j], ai) > 6) continue; const dd = V.sub(world[j], world[k]), a = V.dot(dd, w); if (Math.hypot(...V.sub(dd, V.scale(w, a))) < 1.5) mx = Math.max(mx, V.dot(world[j], w)); }
        if (pw < mx - .5) return;
        n++; const hm = COVER.firstHit(c.MB, BUF, SIDES, world[k], w, COVER.skinExit(c.sdf, world[k], w));
        if (hm < 0) open++; else by[bound[hm].part] = (by[bound[hm].part] || 0) + 1;
      });
    }
    rows.push({ id, t, medial: med.open / med.n, angle: open / Math.max(1, n), angleBy: by });
    console.log(`${rows.length === 1 ? '\nОткрытая лопатка (доля точек без мышцы на луче к коже):\n' : ''}  ${(id + ' t=' + t).padEnd(16)} медиальный край и корень ости ${(100 * med.open / med.n).toFixed(0).padStart(3)} % | нижний угол ${(100 * open / Math.max(1, n)).toFixed(0).padStart(3)} % (${Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ' ' + v).join(', ')})`);
  }
  out.cover = rows;
}
/* ---------- время кадра ---------- */
if (want('time')) {
  const ids = ['bbrow', 'ohp', 'pullup', 'facepull', 'bbbench', 'squat', 'latraise', 'deadlift'].filter(id => POSES[id]), N = 60;
  const START = MU.ringStarts(bound), BUF = new Float64Array(START[bound.length] * MU.SIDES * 3), NOR = new Float64Array(BUF.length);
  const rigs = ids.map(id => EQ.rig(EQ.variantEntry(POSES[id])));
  const run = (f) => { const t0 = process.hrtime.bigint(); let k = 0; for (let r = 0; r < 2; r++) for (const rig of rigs) for (let i = 0; i < N; i++) f(rig, (i + .5) / N, k++); return Number(process.hrtime.bigint() - t0) / 1e6 / k; };
  const mann = rig_t => { const R = rig_t; M.bodyData(R); return R; };
  /* прогрев */
  run((rig, t) => mann(rig(t)));
  const tMan = Math.min(...[0, 1, 2].map(() => run((rig, t) => { const R = rig(t); M.bodyData(R); SK.frames(R, M.bodyData(R), skel.bones); })));
  const frames = rigs.map(rig => Array.from({ length: N }, (_, i) => { const R = rig((i + .5) / N); return SK.frames(R, M.bodyData(R), skel.bones); }));
  let fi = 0; const flat = frames.flat();
  run((rig, t, k) => { const m = flat[k % flat.length]; MU.surfaceAll(bound, MU.layoutDrawn(bound, m, 1.5), m, BUF, NOR, START); });
  const tMus = Math.min(...[0, 1].map(() => run((rig, t, k) => { const m = flat[k % flat.length]; MU.surfaceAll(bound, MU.layoutDrawn(bound, m, 1.5), m, BUF, NOR, START); })));
  out.time = { mannequin: tMan, muscles: tMus };
  console.log(`\nВремя кадра (мс, лучшее из повторов; ${ids.length} упражнений × ${N} кадров × 2): манекен (поза, поверхность, кости) ${tMan.toFixed(3)}, слой мышц без памяти кожи ${tMus.toFixed(2)}`);
}
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(out, null, 1));
