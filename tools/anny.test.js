'use strict';
/* Кожа Anny (вид «Манекен», только внешний вид): данные src/data/anny.bin, скиннинг, сцена и проверки видимой кожи.
   Каталог целиком — npm run anny:check (tools/anny-look/check.js); здесь — правила проверок с отрицательными примерами
   (сломанная кожа должна проверку не пройти) и упражнения-образцы. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), os = require('node:os'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const M = require('../src/js/09bm-mannequin.js'), EQ = require('../src/js/09bn-equipment.js'), A = require('../src/js/09bs-anny.js');
const CK = require('./anny-look/check.js'), CMP = require('./anny-look/compare.js'), PACK = require('./anny-look/pack.js'), IN = require('./anny-look/inputs.js');
const BIN = path.join(root, 'src/data/anny.bin');
const gz = fs.readFileSync(BIN), raw = zlib.gunzipSync(gz), d = A.decode(raw), POSES = CMP.loadPoses(), kind = CK.kinds(d), zones = CMP.zonesOf(d);
const header = JSON.parse(raw.subarray(8, 8 + raw.readUInt32LE(4)).toString('utf8'));
const pose = (id, t, has = () => true) => { const e = EQ.variantEntry(POSES[id], has); return { R: EQ.rig(e)(t), e }; };

/* ---------- данные ---------- */
/* decode → вход упаковщика (те же числа, что в файле) */
function sourceOf(dd, H) {
  const R = dd.region, round = (x, k) => Math.round(x * k) / k;
  return { source: H.source, frames: dd.frames, v: Array.from(dd.pos, x => round(x, 100)), f: Array.from(dd.idx), wi: Array.from(dd.wi), ww: Array.from(dd.ww, x => Math.round(x * 255)),
    region: { code: Array.from(R.code), side: Array.from(R.side), a1: Array.from(R.a1, x => round(x, 500)), a2: Array.from(R.a2, x => round(x, 500)) },
    shade: Array.from(dd.shade, x => Math.round(x * 255)), hands: H.hands,
    correctives: dd.correctives.map(c => { const { i, d: dl, n, ...rest } = c; return { ...rest, i: Array.from(i), d: Array.from(dl, x => round(x, 100)) }; }) };
}
test('anny.bin: canonical pack output (decode → pack.js gives the same bytes), weights sum to one', () => {
  assert.equal(d.nv, header.nv); assert.equal(d.frames.length, 55); assert(d.nv > 12000 && d.nf > 25000, 'full mesh');
  const again = PACK.encode(sourceOf(d, header));
  assert(Buffer.compare(again.gz, gz) === 0, 'src/data/anny.bin must be exactly what tools/anny-look/pack.js writes — the file is generated, not edited');
  for (let v = 0; v < d.nv; v++) { let s = 0; for (let k = 0; k < 4; k++) s += d.ww[v * 4 + k]; assert(Math.abs(s - 1) < 1e-6, `weights of vertex ${v}`); }
  /* отрицательный: правка в файле (сдвиг вершины) — уже другой файл; веса с суммой не 1 упаковщик не примет */
  const broken = sourceOf(d, header); broken.v[0] += 1;
  assert(Buffer.compare(PACK.encode(broken).gz, gz) !== 0);
  const badW = sourceOf(d, header); badW.ww[0] -= 1;
  assert.throws(() => PACK.encode(badW), /сумма/);
});
test('anny.bin was built from the current tools, Anny parameters and neutral stance of the mannequin', () => {
  const inputs = IN.inputs();
  assert.equal(header.source.inputs.files, inputs.files, 'tools/anny-look or the approved Anny parameters changed: rebuild — python3 tools/anny-look/build.py && node tools/anny-look/pack.js');
  assert.equal(header.source.inputs.stance, inputs.stance, 'the neutral stance of the mannequin changed: refit and rebuild the Anny skin (tools/anny-look/README.md)');
  /* отрицательные: изменённый файл подгонки и сдвинутая стойка дают другой отпечаток */
  const fit = path.join(root, 'tools/anny-look/fit.json');
  assert.notEqual(IN.filesHash(f => f === 'tools/anny-look/fit.json' ? Buffer.concat([fs.readFileSync(fit), Buffer.from(' ')]) : fs.readFileSync(path.join(root, f))), inputs.files);
  const shifted = { ...M, catalogPose: q => { const R = M.catalogPose(q); R.frames.thL = { ...R.frames.thL, o: R.frames.thL.o.map((v, i) => i === 1 ? v + .5 : v) }; return R; } };
  assert.notEqual(IN.stanceHash(shifted), inputs.stance);
});
/* полная пересборка — только где есть пакет anny (pip install --break-system-packages anny; torch с PyPI) */
const python = (() => { try { cp.execFileSync('python3', ['-c', 'import anny, torch, trimesh, scipy'], { stdio: 'ignore', cwd: os.tmpdir() }); return true; } catch (e) { return false; } })();
test('anny.bin rebuilds byte for byte from tools/anny-look (Python stage + pack.js)', { skip: !python && 'нет пакета anny/torch: пересборка не проверяется (данные проверены выше)' }, () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anny-')), json = path.join(tmp, 'anny.json'), bin = path.join(tmp, 'anny.bin');
  try {
    cp.execFileSync('node', [path.join(root, 'tools/anny-look/export.js'), '--out', path.join(tmp, 'mannequin.json')], { cwd: root, stdio: 'ignore' });
    cp.execFileSync('python3', [path.join(root, 'tools/anny-look/build.py'), '--out', json, '--mannequin', path.join(tmp, 'mannequin.json')], { cwd: root, stdio: 'ignore', timeout: 600000 });
    cp.execFileSync('node', [path.join(root, 'tools/anny-look/hands.js'), json], { cwd: root, stdio: 'ignore' });
    cp.execFileSync('node', [path.join(root, 'tools/anny-look/pack.js'), json, bin], { cwd: root, stdio: 'ignore' });
    assert(Buffer.compare(fs.readFileSync(bin), gz) === 0, 'rebuilt anny.bin differs from src/data/anny.bin');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

/* ---------- скиннинг ---------- */
test('skinning: the neutral stance is the mesh itself; a rigid move of the whole body moves the skin rigidly', () => {
  const R0 = M.catalogPose(M.neutral()), P = A.skin(R0, { d });
  let e = 0; for (let i = 0; i < P.length; i++) e = Math.max(e, Math.abs(P[i] - d.pos[i])); assert(e < 1e-3, `stance error ${e}`);
  const q = M.neutral(); q.root.p = [10, M.B.hipHeight + 5, -7]; q.root.q = M.rootRot(30, 0, 0);
  const R = M.catalogPose(q), Q = A.skin(R, { d }), L = A.skin(R, { d, method: 'lbs' });
  let worst = 0;
  /* расстояния между вершинами сохраняются (жёсткое движение), двойные кватернионы = линейное смешение при одном повороте */
  for (let k = 0; k < 400; k++) { const a = k * 31 % d.nv, b = (k * 97 + 13) % d.nv, d0 = Math.hypot(d.pos[a * 3] - d.pos[b * 3], d.pos[a * 3 + 1] - d.pos[b * 3 + 1], d.pos[a * 3 + 2] - d.pos[b * 3 + 2]), d1 = Math.hypot(Q[a * 3] - Q[b * 3], Q[a * 3 + 1] - Q[b * 3 + 1], Q[a * 3 + 2] - Q[b * 3 + 2]); worst = Math.max(worst, Math.abs(d1 - d0)); }
  assert(worst < 1e-3, `rigid move changes shape by ${worst}`);
  for (let i = 0; i < Q.length; i++) assert(Math.abs(Q[i] - L[i]) < 1e-3);
});
test('dual quaternions keep the volume where linear blending collapses it (elbow at 145°, forearm pronated)', () => {
  const q = M.neutral(); for (const s of M.SIDES) { q[s].elbow = 145; q[s].pron = 70; } const R = M.catalogPose(q);
  const area = P => { let s = 0; for (let t = 0; t < d.nf; t++) { const [a, b, c] = [d.idx[t * 3], d.idx[t * 3 + 1], d.idx[t * 3 + 2]], u = [0, 1, 2].map(i => P[b * 3 + i] - P[a * 3 + i]), w = [0, 1, 2].map(i => P[c * 3 + i] - P[a * 3 + i]); if (!/^(fa|fd|ua)/.test(d.frames[d.wi[a * 4]])) continue; s += Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) / 2; } return s; };
  const a0 = area(d.pos), aq = area(A.skin(R, { d })), al = area(A.skin(R, { d, method: 'lbs' }));
  assert(aq > al, `DQ ${aq.toFixed(0)} vs LBS ${al.toFixed(0)} cm²`); assert(aq / a0 > .9, `arm skin area ${(aq / a0 * 100).toFixed(0)} % of the stance`);
});
test('corrective shapes: zero in the stance, full at the angle they were sculpted for', () => {
  const R0 = M.catalogPose(M.neutral()); assert(A.correctiveWeights(R0, d).every(w => w === 0));
  const q = M.neutral(); for (const s of M.SIDES) q[s].knee = 140; const w = A.correctiveWeights(M.catalogPose(q), d), names = d.correctives.map(c => c.name);
  for (const s of M.SIDES) assert(w[names.indexOf('knee' + s)] > .95, 'knee shape at 140°');
  assert(d.correctives.every(c => c.n > 0 && c.a1 > c.a0));
});

/* ---------- сцена ---------- */
test('scene: in the Mannequin view the Anny mesh replaces the procedural skin; Anatomy and Skeleton keep the procedural ghost; no data — procedural skin', async () => {
  const { createCatalogScene } = await import('../src/volume/scene.mjs');
  const { loadModel } = require('./biomechanics-audit'), m = loadModel(), cvd = m.get('catalogVolumeData'), ex = m.EX.find(e => e.id === 'bbbench');
  const data = t => cvd(m.get('catalogAnimFor')(ex.anim, () => true), t, 0, () => true);
  const prev = globalThis.AnnySkin, prevSk = globalThis.Skeleton; globalThis.mannequinRegionOf = m.get('mannequinRegionOf'); globalThis.Skeleton = require('../src/js/09bq-skeleton.js');
  try {
    globalThis.AnnySkin = { ...A, data: null, skinMats: A.skinMats, dualQuats: A.dualQuats, correctiveWeights: A.correctiveWeights, skin: A.skin, regions: (dd) => A.regions(dd, m.get('mannequinRegionOf')) };
    const s0 = createCatalogScene(data(0)); s0.apply(data(.5), { color: () => '#ff0000' });
    assert.equal(s0.anny.group.visible, false); assert.equal(s0.mannequin.group.visible, true, 'without Anny data — the procedural skin');
    globalThis.AnnySkin.data = d;
    s0.apply(data(.5), { color: () => '#ff0000', muscles: true });
    assert.equal(s0.anny.group.visible, true); assert.equal(s0.mannequin.group.visible, false);
    assert([...s0.regionMeshes.values()].every(o => !o.visible), 'zones are vertex colours of the Anny skin, not patches over the hidden procedural skin');
    const col = s0.anny.mesh.geometry.attributes.annyColor.array; let on = 0; for (let v = 0; v < d.nv; v++) if (col[v * 4 + 3]) on++;
    assert(on > 300, `muscle zones are painted on the Anny skin (${on} vertices)`);
    assert(s0.anny.mesh.userData.boundsPoints.length > 300, 'frame bounds by the posed skin');
    s0.apply(data(.5), { color: () => '#ff0000', muscles: false }); let off = 0; for (let v = 0; v < d.nv; v++) if (col[v * 4 + 3]) off++; assert.equal(off, 0, 'muscles off — plain skin');
    s0.apply(data(.5), { color: () => '#ff0000', skeleton: { bones: [] } });
    assert.equal(s0.anny.group.visible, false, 'Skeleton view — procedural ghost skin'); assert.equal(s0.mannequin.group.visible, true);
    s0.apply(data(.5), { color: () => '#ff0000', skeleton: null, anny: false }); assert.equal(s0.anny.group.visible, false, 'options.anny === false — old skin');
    s0.dispose();
  } finally { globalThis.AnnySkin = prev; globalThis.Skeleton = prevSk; delete globalThis.mannequinRegionOf; }
});
test('muscle zones on the Anny skin: every zone of the mannequin gets vertices on both sides, by the same patch rules', () => {
  const { loadModel } = require('./biomechanics-audit'), m = loadModel(), regionOf = m.get('mannequinRegionOf'), R = A.regions(d, regionOf);
  const P = m.get('({t:MANNEQUIN_TORSO_PATCHES,l:MANNEQUIN_LIMB_PATCHES,dl:MANNEQUIN_DELTS})'), ids = new Set([...P.t.map(p => p[0]), ...Object.values(P.l).flat().map(p => p[0]), ...P.dl.map(p => p[0])]);
  for (const id of ids) for (const s of [0, 1]) {
    let n = 0; for (let v = 0; v < d.nv; v++) if (R.rid[v] && R.ids[R.rid[v] - 1] === id && d.region.side[v] === s) n++;
    /* не меньше 5: самая малая — боковая ягодичная (у процедурной кожи ≈ 90 см² на сторону, над ней 15 вершин Anny — шаг
       сетки там ≈ 2,5 см; по углам области в неё попадают 6) */
    assert(n >= 5, `zone ${id} ${s ? 'R' : 'L'}: ${n} vertices`);
  }
  /* правило — то же: центр каждой области корпуса — эта область */
  for (const [id, h0, h1, a0, a1] of P.t) assert.equal(regionOf('torso', 'L', (h0 + h1) / 2, (a0 + a1) / 2), id);
});

test('look: baked cavity shading in the data; trunk line of the briefs (tone off by default) — inside on the groin and buttocks, outside elsewhere', async () => {
  /* затенённость впадин: доля открытого неба 0…1; большая часть кожи открыта, во впадинах (подмышка, пах, ягодичная складка) — темнее */
  assert(d.shade && d.shade.length === d.nv && header.shade === true && header.index === 'delta');
  const s = Array.from(d.shade).sort((a, b) => a - b), q = p => s[Math.floor(p * (s.length - 1))];
  assert(s[0] >= 0 && s.at(-1) <= 1 && q(.5) > .9 && q(.02) < .7, `shade p2 ${q(.02)}, median ${q(.5)}`);
  const { trunkLine, ANNY_LOOK } = await import('../src/volume/anny.mjs');
  /* x — влево, высота над полом, z — вперёд (стойка): пах спереди и ягодица — внутри, грудь, середина бедра и колено — снаружи */
  assert(trunkLine(0, 88, 10) > 0 && trunkLine(8, 88, -12) > 0 && trunkLine(-8, 88, -12) > 0, 'groin and buttocks are inside the briefs');
  assert(trunkLine(0, 120, 10) < 0 && trunkLine(8.8, 70, 8) < 0 && trunkLine(8.8, 50, 6) < 0, 'chest, thigh and knee are outside');
  assert(trunkLine(17, 95, 0) > 0 && trunkLine(17, 88, 0) < 0, 'high-cut leg opening on the side (≈ 93 cm)');
  assert(!(ANNY_LOOK.trunks?.alpha > 0), 'no trunks tone by default (the owner chose the groin of the reference)');
  assert(ANNY_LOOK.roughness >= .62, 'matte, no gloss');
});
/* ---------- проверки видимой кожи (каталог — tools/anny-look/check.js) ---------- */
const SAMPLE = ['bbbench', 'chestpressm', 'legcurl', 'hipthrust', 'squat', 'pushup', 'seatedcalf', 'kneepush', 'plank', 'lyinglegraise'];
test('supports: the Anny skin does not sink into benches, seats, pads, the floor, the bar or handles deeper than allowed (sample)', () => {
  for (const id of SAMPLE) for (const t of [0, .25, .5, .75, 1]) {
    const { R, e } = pose(id, t), P = A.skin(R, { d, floor: false }), bad = CK.penetration(R, P, d, kind, e, () => true).filter(p => p.depth > p.limit);
    assert.deepEqual(bad.map(b => `${id} t=${t} ${b.id} ${b.depth.toFixed(2)}>${b.limit.toFixed(2)}`), []);
  }
  /* отрицательный: кожа спины на 10 см ниже — сквозь подушку в балку скамьи (жёсткая деталь) — нарушение. В тонкую
     мягкую подушку (заявленная опора, допуск 4 + 1 см) глубина больше половины её толщины не набирается: кожа выходит
     с другой стороны, поэтому сдвиг — до балки */
  const { R, e } = pose('bbbench', .5), P = Float32Array.from(A.skin(R, { d, floor: false })), up = [0, 1, 0];
  for (let v = 0; v < d.nv; v++) if (zones[v] === 'верх спины' || zones[v] === 'поясница' || zones[v] === 'ягодицы') P[v * 3 + 1] += 10 * up[1];
  assert(CK.penetration(R, P, d, kind, e, () => true).some(p => p.depth > p.limit), 'a back pushed 10 cm down through the bench pad must fail');
  const Pf = Float32Array.from(A.skin(R, { d, floor: false })); for (let v = 0; v < d.nv; v++) if (zones[v] === 'стопа') Pf[v * 3 + 1] += 3;
  assert(CK.penetration(R, Pf, d, kind, e, () => true).some(p => p.id === 'floor' && p.depth > p.limit), 'feet 3 cm under the floor must fail');
  /* на экране кожа прижата к полу: ниже пола вершин нет; без прижатия — та же кожа */
  const { R: Rs } = pose('superman', 0), Pp = A.skin(Rs, { d }), Pu = A.skin(Rs, { d, floor: false });
  let below = 0, moved = 0; for (let v = 0; v < d.nv; v++) { if (Pp[v * 3 + 1] > M.FLOOR + 1e-4) below++; if (Pu[v * 3 + 1] <= M.FLOOR && Math.abs(Pp[v * 3 + 1] - Pu[v * 3 + 1]) > 1e-6) moved++; }
  assert.equal(below, 0); assert.equal(moved, 0);
});
test('distance to the procedural skin: within the limits in the stance and the sample; a skin moved away fails', () => {
  const verts = []; for (let v = 0; v < d.nv; v += 3) if (zones[v] !== 'полость') verts.push(v);
  /* как в check.js: 99 % — по всем кадрам выборки вместе, наибольший — по любому */
  const check = frames => { const by = {};
    for (const [R, P] of frames) { const body = M.bodyData(R), Pv = new Float32Array(verts.length * 3); verts.forEach((v, k) => { for (let i = 0; i < 3; i++) Pv[k * 3 + i] = P[v * 3 + i]; }); const dist = CMP.distances(d, Pv, R, zones, verts, body); verts.forEach((v, k) => (by[zones[v]] ||= []).push(Math.abs(dist[k]))); }
    const out = [];
    for (const [z, a] of Object.entries(by)) { a.sort((x, y) => x - y); const p99 = a[Math.floor(a.length * .99)], mx = a.at(-1), lim = CK.DIST_MAX[z] ?? CK.DIST_MAX_DEFAULT; if (p99 > (CK.DIST_P99[z] ?? CK.DIST_P99_DEFAULT)) out.push(`${z} 99% ${p99.toFixed(2)}`); if (mx > lim) out.push(`${z} max ${mx.toFixed(2)}`); } return out; };
  const R0 = M.catalogPose(M.neutral()); assert.deepEqual(check([[R0, A.skin(R0, { d, floor: false })]]), []);
  const frames = [[R0, A.skin(R0, { d, floor: false })]];
  for (const id of ['bbbench', 'legcurl', 'hipthrust']) for (const t of [0, 1]) { const { R } = pose(id, t); frames.push([R, A.skin(R, { d, floor: false })]); }
  assert.deepEqual(check(frames), []);
  /* отрицательный: грудь вынесена на 8 см вперёд */
  const P = Float32Array.from(A.skin(R0, { d, floor: false })); for (let v = 0; v < d.nv; v++) if (zones[v] === 'грудь') P[v * 3 + 2] += 8;
  assert(check([[R0, P]]).some(s => s.startsWith('грудь')));
});
test('extreme poses: inverted triangles and skin folds do not grow beyond the recorded counts; broken weights fail', () => {
  const base = JSON.parse(fs.readFileSync(path.join(root, 'tools/anny-look/fixtures/folds.json'), 'utf8'));
  for (const [id, t] of [['squat', 1], ['bbcurl', 1], ['latpull', 0], ['pushup', 1]]) {
    const { R } = pose(id, t), f = CK.folds(d, R, A.skin(R, { d, floor: false })), b = base[`${id} ${t}`];
    assert(f.inverted <= b.inverted && f.folds <= b.folds, `${id} t=${t}: ${f.inverted}/${f.folds} > ${b.inverted}/${b.folds}`);
  }
  /* отрицательный: колено с весами бедра (кожа голени не идёт за голенью) — вывороты и складки */
  const dd = { ...d, wi: Uint8Array.from(d.wi) }, th = d.frames.indexOf('thL'), sk = d.frames.indexOf('skL'); for (let i = 0; i < dd.wi.length; i++) if (dd.wi[i] === sk && i % 4 === 0 && i / 4 % 2) dd.wi[i] = th;
  const { R } = pose('squat', 1), f = CK.folds(dd, R, A.skin(R, { d: dd, floor: false })), b = base['squat 1'];
  assert(f.inverted > b.inverted || f.folds > b.folds, 'scrambled knee weights must fail');
});
