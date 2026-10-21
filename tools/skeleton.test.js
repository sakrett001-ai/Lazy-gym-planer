'use strict';
/* Скелет манекена: данные костей (src/data/skeleton.bin) и их раскладка по позе. Кости должны лежать внутри тела
   (кроме тех, что у живого человека под самой кожей), идти за суставами и за хватом. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const M = require('../src/js/09bm-mannequin.js'), Skeleton = require('../src/js/09bq-skeleton.js');
const EQ = require('../src/js/09bn-equipment.js'), { bakeAll } = require('./mannequin/author.js');
const data = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, '../src/data/skeleton.bin'))));
const bone = (name, side = '') => data.bones.findIndex(b => b.name === name && b.side === side);
const IDS = ['squat', 'deadlift', 'bbbench', 'lunge', 'dbcurl', 'pushup', 'legpress', 'hipthrust', 'chinup', 'ohp', 'tablerow', 'facepull', 'kbswing'];
const entries = bakeAll({ only: IDS });
const poses = IDS.flatMap(id => { const rig = EQ.rig(entries[id]); return [0, .5, 1].map(t => ({ id, t, R: rig(t) })); });

test('bone data: 102 MyoSim bones of both sides and the larynx with the trachea, valid triangles, attribution kept', () => {
  assert.equal(data.bones.filter(b => b.seg !== 'airway').length, 102);
  assert.deepEqual(data.bones.filter(b => b.seg === 'airway').map(b => b.name).slice(0, 3), ['hyoid', 'thyroid', 'cricoid']);
  assert.match(data.source, /MyoSim.*Apache 2\.0/);
  for (const name of ['femur', 'tibia', 'humerus', 'radius', 'ulna', 'scapula', 'clavicle', 'patella', 'foot', 'toes', '2proxph', '1mc'])
    for (const s of ['L', 'R']) assert(bone(name, s) >= 0, name + s);
  for (const name of ['ribcage', 'skull', 'jaw', 'sacrum', 'cervical', 'L1', 'L5', 'thoracic1']) assert(bone(name) >= 0, name);
  for (const b of data.bones) {
    assert.equal(b.pos.length, b.nv * 3); assert.equal(b.idx.length, b.nf * 3);
    assert(b.idx.every(i => i < b.nv), 'index in range: ' + b.name);
  }
  assert(fs.existsSync(path.join(__dirname, '../third_party/myosim/LICENSE')), 'MyoSim licence ships with the data');
});

test('long bones run from joint to joint in every phase', () => {
  const end = (m, i, p) => [0, 1, 2].map(r => m[i * 12 + r * 4] * p[0] + m[i * 12 + r * 4 + 1] * p[1] + m[i * 12 + r * 4 + 2] * p[2] + m[i * 12 + r * 4 + 3]);
  for (const { id, t, R } of poses) {
    const m = Skeleton.frames(R, M.bodyData(R), data.bones);
    for (const s of ['L', 'R']) for (const [name, a, b, L] of [['femur', 'hip', 'kn', M.B.th], ['tibia', 'kn', 'an', M.B.sk], ['humerus', 'sh', 'el', M.B.ua], ['ulna', 'el', 'wr', M.B.fa]]) {
      const i = bone(name, s), p0 = end(m, i, [0, 0, 0]), p1 = end(m, i, [0, -L, 0]);
      assert(M.V.dist(p0, R[a + s]) < .01 && M.V.dist(p1, R[b + s]) < .01, `${id} t=${t}: ${name}${s} from ${a} to ${b}`);
    }
  }
});

test('bones stay inside the body: deep bones fully, bones under the skin within a few millimetres', () => {
  /* под самой кожей у живого человека: передний край большеберцовой, лучевая у запястья, надколенник, рёбра, гребни таза, свод черепа,
     ключица, ость и акромион лопатки (лопатка поворачивается за рукой и скользит по рёбрам, но кожа широчайшей за ней
     не растягивается — запас чуть больше) */
  const deep = ['femur', 'humerus', 'ulna', 'sacrum', 'L1', 'L3', 'L5', 'thoracic6', 'jaw'];
  const shallow = { tibia: .8, radius: .8, patella: 1, ribcage: 1, pelvis_: .5, skull: .6, clavicle: .5, scapula: 1.3 };
  let worst = {};
  for (const { id, t, R } of poses) {
    const body = M.bodyData(R), cache = M.torsoCache(R), m = Skeleton.frames(R, body, data.bones);
    const sdf = p => { let d = M.torsoSDF(R, p, cache); d = Math.min(d, M.headSDF(R, p)); for (const s of ['L', 'R']) for (const k of ['ua', 'fa', 'th', 'sk']) d = Math.min(d, M.limbSDF(R, k, s, p)); for (const c of body.caps) d = Math.min(d, M.V.dist(p, c.c) - c.r); return d; };
    data.bones.forEach((b, i) => {
      const key = Object.keys(shallow).find(k => b.name.startsWith(k)) || (deep.includes(b.name) ? b.name : null); if (!key) return;
      const w = Skeleton.worldPoints(b, m, i); let mx = -Infinity;
      for (let j = 0; j < w.length; j += 9) mx = Math.max(mx, sdf([w[j], w[j + 1], w[j + 2]]));
      if (!(worst[key]?.d >= mx)) worst[key] = { d: mx, where: `${id} t=${t} ${b.name}${b.side}` };
    });
  }
  for (const k of deep) assert(worst[k].d <= .1, `${k} inside the body (${worst[k].d.toFixed(2)} cm, ${worst[k].where})`);
  for (const [k, lim] of Object.entries(shallow)) assert(worst[k].d <= lim, `${k} at most ${lim} cm out (${worst[k].d.toFixed(2)} cm, ${worst[k].where})`);
});

test('scapula: the glenoid stays on the shoulder joint, the blade turns up with the arm overhead', () => {
  const tilt = (R) => { const m = Skeleton.frames(R, M.bodyData(R), data.bones), i = bone('scapula', 'L'), b = data.bones[i];
    const at = p => [0, 1, 2].map(r => m[i * 12 + r * 4] * p[0] + m[i * 12 + r * 4 + 1] * p[1] + m[i * 12 + r * 4 + 2] * p[2] + m[i * 12 + r * 4 + 3]);
    const gl = at(b.gl[0]), ia = at(b.ia[0]), th = R.frames.thorax;
    assert(M.V.dist(gl, R.shL) < .01, 'glenoid on the shoulder joint');
    /* наклон линии «впадина — нижний угол» во фронтальной плоскости корпуса, градусы */
    const d = M.V.sub(ia, gl); return Math.atan2(M.V.dot(d, th.x), -M.V.dot(d, th.y)) * 180 / Math.PI; };
  const down = tilt(poses.find(p => p.id === 'dbcurl' && p.t === 0).R), up = tilt(poses.find(p => p.id === 'chinup' && p.t === 0).R);
  assert(Math.abs(up - down) > 15, `upward rotation with the arms overhead: ${down.toFixed(0)}° → ${up.toFixed(0)}°`);
});

test('scapula lies on the ribs, not inside them (protraction included)', () => {
  /* оболочка рёбер в рамке грудной клетки: наибольший радиус от оси по слоям 1 см и секторам 5° */
  const rb = data.bones[bone('ribcage')], p = rb.pos; let zc = 0; for (let i = 2; i < p.length; i += 3) zc += p[i]; zc /= p.length / 3;
  const sh = new Map(), key = (y, x, z) => Math.round(y) * 1000 + Math.round(Math.atan2(x, z) * 36 / Math.PI);
  for (let i = 0; i < p.length; i += 3) { const k = key(p[i + 1], p[i], p[i + 2] - zc), r = Math.hypot(p[i], p[i + 2] - zc); if (!(sh.get(k) >= r)) sh.set(k, r); }
  let worst = { d: 0 };
  for (const { id, t, R } of poses) {
    const m = Skeleton.frames(R, M.bodyData(R), data.bones), T = R.frames.thorax;
    for (const s of ['L', 'R']) {
      const i = bone('scapula', s), w = Skeleton.worldPoints(data.bones[i], m, i);
      for (let j = 0; j < w.length; j += 3) {
        const d = M.V.sub([w[j], w[j + 1], w[j + 2]], T.o), x = M.V.dot(d, T.x), y = M.V.dot(d, T.y), z = M.V.dot(d, T.z) - zc, k = key(y, x, z);
        let shell = 0; for (const dk of [-1, 0, 1]) shell = Math.max(shell, sh.get(k + dk) || 0);
        if (shell && shell - Math.hypot(x, z) > worst.d) worst = { d: shell - Math.hypot(x, z), where: `${id} t=${t} ${s}` };
      }
    }
  }
  assert(worst.d <= 1.2, `scapula at most 1.2 cm into the rib cage (${worst.d.toFixed(2)} cm, ${worst.where})`);
});

test('finger bones follow the grip; the radius turns with the forearm and keeps to the wrist', () => {
  const { R } = poses.find(p => p.id === 'dbcurl' && p.t === 1), body = M.bodyData(R), m = Skeleton.frames(R, body, data.bones);
  for (const s of ['L', 'R']) {
    const tip = data.bones.findIndex(b => b.name === '3distph' && b.side === s), w = Skeleton.worldPoints(data.bones[tip], m, tip);
    let near = Infinity; for (let j = 0; j < w.length; j += 3) near = Math.min(near, M.V.dist([w[j], w[j + 1], w[j + 2]], R['grip' + s]));
    assert(near < 4.5, `middle fingertip wraps the handle (${near.toFixed(1)} cm)`);
  }
  const pron = (R, s) => { const f = R.frames; return Math.atan2(M.V.dot(M.V.cross(f['fa' + s].z, f['fd' + s].z), f['fa' + s].y), M.V.dot(f['fa' + s].z, f['fd' + s].z)) * 180 / Math.PI; };
  const turns = poses.map(p => ({ ...p, a: pron(p.R, 'L') })), lo = turns.reduce((a, b) => (b.a < a.a ? b : a)), hi = turns.reduce((a, b) => (b.a > a.a ? b : a));
  assert(hi.a - lo.a > 40, 'the sample has different forearm turns');
  for (const p of [lo, hi]) {
    const i = bone('radius', 'L'), mm = Skeleton.frames(p.R, M.bodyData(p.R), data.bones), w = Skeleton.worldPoints(data.bones[i], mm, i);
    let near = Infinity; for (let j = 0; j < w.length; j += 3) near = Math.min(near, M.V.dist([w[j], w[j + 1], w[j + 2]], p.R.wrL));
    assert(near < 3, `${p.id} t=${p.t}: distal radius at the wrist (${near.toFixed(1)} cm)`);
  }
});

test('the kneecap rides with the knee', () => {
  for (const { id, t, R } of poses) {
    const m = Skeleton.frames(R, M.bodyData(R), data.bones);
    for (const s of ['L', 'R']) {
      const i = bone('patella', s), w = Skeleton.worldPoints(data.bones[i], m, i); let c = [0, 0, 0];
      for (let j = 0; j < w.length; j += 3) c = M.V.add(c, [w[j], w[j + 1], w[j + 2]], 3 / w.length);
      const d = M.V.dist(c, R['kn' + s]);
      assert(d > 2.5 && d < 7.5, `${id} t=${t}: kneecap ${d.toFixed(1)} cm from the knee centre`);
    }
  }
});

/* Гортань и трахея (tools/skeleton/airway.js): параметрические хрящи в рамке шеи. Размеры — по источникам у чисел в airway.js
   (допуск — разброс в исследованиях); посадка — между позвонками, нижней челюстью и кожей шеи; в кадре — за шеей (подъязычная —
   почти с головой, трахея ниже шарнира шеи — с грудной клеткой). */
const AW = require('./skeleton/airway.js');
const awBone = n => data.bones.find(b => b.name === n && b.seg === 'airway');
const awPts = (n, f = () => true) => { const b = awBone(n), o = []; for (let i = 0; i < b.pos.length; i += 3) { const p = [b.pos[i], b.pos[i + 1], b.pos[i + 2]]; if (f(p)) o.push(p); } return o; };
const span = (pts, k) => Math.max(...pts.map(p => p[k])) - Math.min(...pts.map(p => p[k]));

test('larynx and trachea: present, sized as in an adult man', () => {
  for (const n of ['hyoid', 'thyroid', 'cricoid', 'trachea1']) assert(awBone(n), n);
  for (const b of data.bones.filter(x => x.seg === 'airway')) assert(b.nf > 50 && Math.abs(b.wt || 0) <= 1 && Math.abs(b.wh || 0) <= 1, b.name);
  /* подъязычная: длина 39,1 и ширина 42,3 мм (Fakhry 2013) — ±3 мм */
  const hy = awPts('hyoid'); assert(Math.abs(span(hy, 2) - 3.91) < .3 && Math.abs(span(hy, 0) - 4.23) < .3, `hyoid ${span(hy, 2).toFixed(2)} × ${span(hy, 0).toFixed(2)} cm`);
  /* щитовидный: высота пластинки (сбоку, без рогов) 26,6–27,6 мм (Rawal 2014; Eckel 1994) ± 3; пластинка от выступа до заднего края
     36,8–37,1 мм ± 3,6; угол 74 ± 8° (Rawal) … ≈90° (Gray's) */
  const th = awPts('thyroid', p => Math.abs(p[0]) > 1.2 && Math.abs(p[0]) < 2), lam = span(th, 1);
  assert(lam > 2.4 && lam < 3.0, `thyroid lamina height ${lam.toFixed(2)} cm`);
  const T = AW.P.thyroid; assert(T.angle >= 66 && T.angle <= 92 && Math.abs(T.lamina - 3.7) < .36, 'thyroid angle and lamina width');
  /* перстневидный: пластинка 22,3 мм, дуга 7,1 мм, снаружи спереди назад ≈ 27–28,5 мм (Kim, Song 2017) */
  const zc = AW.POS.cricoid.z, lamC = span(awPts('cricoid', p => Math.abs(p[0]) < .4 && p[2] < zc), 1), arch = span(awPts('cricoid', p => Math.abs(p[0]) < .4 && p[2] > zc), 1), ap = span(awPts('cricoid'), 2);
  assert(Math.abs(lamC - 2.23) < .15 && Math.abs(arch - .71) < .1 && ap > 2.5 && ap < 2.95, `cricoid lamina ${lamC.toFixed(2)}, arch ${arch.toFixed(2)}, AP ${ap.toFixed(2)} cm`);
  /* трахея: 16–20 полуколец, поперечник 2–2,5 см (Gray's) */
  assert(AW.P.trachea.rings >= 16 && AW.P.trachea.rings <= 20);
  const tr = awPts('trachea1'); assert(span(tr, 0) >= 2 && span(tr, 0) <= 2.5, `trachea width ${span(tr, 0).toFixed(2)} cm`);
});

/* Шейный отдел и уровни гортани (4.60.0). Тела C7…C2 — из данных кости cervical (build_bones.py, поле bodies: центры нижней и
   верхней пластинок, у C2 верхняя — середина ямок атласа; рамка шеи — та же, что у хрящей гортани). Уровни — Gray's Anatomy
   (1918, с. 1074–1083): подъязычная кость — C3, щитовидный хрящ — C4–C5, перстневидный — C6, трахея от C6 до бифуркации у T5,
   ≈ 11 см. До 4.60.0 отдел стоял под твёрдым нёбом (ямки атласа на 7,6 см впереди мыщелков), а гортань — на 1–2 позвонка ниже. */
test('cervical spine seated on the condyles; larynx and trachea at their vertebral levels', () => {
  const cv = data.bones.find(b => b.name === 'cervical'), [C7, C6, C5, C4, C3, C2] = cv.bodies;   // [y низ, z, y верх, z]
  /* атлас — под суставом головы (B.headJoint: ось через мыщелки): ямки не дальше 2,5 см от оси, ниже неё и не впереди */
  const fac = [0, C2[2], C2[3]], hj = M.B.headJoint;
  assert(M.V.dist(fac, hj) < 2.5 && fac[1] < hj[1] && fac[2] < hj[2] + .5, `atlas facets ${fac.slice(1)} vs head joint ${hj.slice(1)}`);
  /* шаг тел C3→C6 (центры тел) — 1,6–2 см, у взрослых ≈ 1,8 (тело 1,4 + диск 0,45) */
  const mid = r => [r[0] + r[2], r[1] + r[3]].map(v => v / 2);
  for (const [a, b] of [[C3, C4], [C4, C5], [C5, C6]]) { const s = Math.hypot(...mid(a).map((v, k) => v - mid(b)[k])); assert(s > 1.6 && s < 2, `body step ${s.toFixed(2)} cm`); }
  const ys = n => awPts(n).map(p => p[1]);
  /* перстневидный: низ дуги — у нижней пластинки C6, верх пластинки — не выше верха C5 */
  const clo = Math.min(...ys('cricoid')), chi = Math.max(...ys('cricoid'));
  assert(Math.abs(clo - C6[0]) < .3 && chi < C5[2], `cricoid ${clo.toFixed(2)}…${chi.toFixed(2)}, C6 ${C6[0]}…${C6[2]}`);
  /* щитовидный (пластинки без рогов): заходит и на C5, и на C4; не ниже C6 и не выше C3 */
  const th = awPts('thyroid', p => Math.abs(p[0]) > 1.2 && Math.abs(p[0]) < 2).map(p => p[1]), tlo = Math.min(...th), thi = Math.max(...th);
  assert(tlo < C5[2] && thi > C4[0] && tlo > C6[2] - .3 && thi < C3[0] + .3, `thyroid lamina ${tlo.toFixed(2)}…${thi.toFixed(2)}`);
  /* подъязычная: середина тела у средней линии — на уровне C3 (между верхом C4 и низом C2) */
  const hb = awPts('hyoid', p => Math.abs(p[0]) < 1).map(p => p[1]), hc = (Math.min(...hb) + Math.max(...hb)) / 2;
  assert(hc > C4[2] && hc < C2[0], `hyoid body ${hc.toFixed(2)}, C3 ${C3[0]}…${C3[2]}`);
  /* трахея — 10–12 см по оси */
  assert(AW.axis().L >= 10 && AW.axis().L <= 12, `trachea ${AW.axis().L.toFixed(1)} cm`);
  /* тела C3–C6 — не ближе 3,2 см к коже шеи спереди (у живого 4–5; было 0–1,9): от передней поверхности тела у средней
     линии вперёд до кожи шеи в нейтральной позе */
  const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), data.bones), i = data.bones.indexOf(cv), w = Skeleton.worldPoints(cv, m, i);
  const N = R.frames.neck, toW = (y, z) => M.V.add(M.V.add(N.o, N.y, y), N.z, z);
  for (const [name, r] of [['C3', C3], ['C4', C4], ['C5', C5], ['C6', C6]]) {
    const c = toW(...mid(r)); let front = -Infinity;
    for (let j = 0; j < w.length; j += 3) { const p = [w[j], w[j + 1], w[j + 2]], d = M.V.sub(p, c); if (Math.abs(d[0]) < .8 && Math.abs(M.V.dot(d, N.y)) < .5) front = Math.max(front, M.V.dot(d, N.z)); }
    let s = front; while (M.neckSDF(R, M.V.add(c, N.z, s)) < 0 && s < 15) s += .02;
    assert(s - front >= 3.2, `${name}: body ${(s - front).toFixed(2)} cm from the skin of the neck`);
  }
});

test('larynx and trachea: inside the neck, clear of the vertebrae and the jaw, follow the head and the neck', () => {
  const G = require('./muscles/geometry.js'), pbs = G.prepareBones(data);
  const other = data.bones.map((b, i) => /^(cervical|thoracic[1-6]|jaw|skull|ribcage|clavicle)$/.test(b.name) ? i : -1).filter(i => i >= 0);
  const aw = data.bones.map((b, i) => b.seg === 'airway' ? i : -1).filter(i => i >= 0);
  /* крайние позы шеи в каталоге: сгибание 26° (тяга бедром), разгибание 45° (концентрированный подъём), наклон 10°, поворот 8° — с запасом */
  const qs = [['neutral', {}], ['flexion', { neck: [26, 0, 0] }], ['extension', { neck: [-45, 0, -8] }], ['turn', { neck: [0, 0, 30] }], ['bend', { neck: [0, 12, 0] }]];
  for (const [label, set] of qs) {
    const q = M.neutral(); Object.assign(q, set); const R = M.catalogPose(q), body = M.bodyData(R), m = Skeleton.frames(R, body, data.bones), pose = G.poseBones(pbs, m), cache = M.torsoCache(R);
    const sdf = p => Math.min(M.torsoSDF(R, p, cache), M.headSDF(R, p), M.neckSDF(R, p));
    let out = -Infinity, deep = 0, where = '';
    for (const i of aw) {
      const w = Skeleton.worldPoints(data.bones[i], m, i);
      for (let j = 0; j < w.length; j += 3) {
        const p = [w[j], w[j + 1], w[j + 2]]; out = Math.max(out, sdf(p));
        for (const bi of other) { const P = pose[bi]; if (p[0] < P.lo[0] || p[0] > P.hi[0] || p[1] < P.lo[1] || p[1] > P.hi[1] || p[2] < P.lo[2] || p[2] > P.hi[2]) continue; const ql = P.inv(p); if (G.insideBone(pbs[bi], ql)) { const d = pbs[bi].near(ql); if (d > deep) { deep = d; where = data.bones[i].name + ' в ' + data.bones[bi].name; } } }
      }
    }
    /* под кожей шеи (в разгибании подъязычная выходит под подбородком — у манекена там нет кожи дна рта, она стянута к шее) */
    assert(out < (label === 'extension' ? 1 : .3), `${label}: larynx out of the skin by ${out.toFixed(2)} cm`);
    assert(deep < .2, `${label}: ${where} ${deep.toFixed(2)} cm deep`);
  }
  /* в кадре: перстневидный — с шеей, нижний сегмент трахеи — с грудной клеткой, подъязычная — почти с головой */
  const q = M.neutral(); q.neck = [26, 0, 30]; const R = M.catalogPose(q), m = Skeleton.frames(R, M.bodyData(R), data.bones), R0 = M.catalogPose(M.neutral()), m0 = Skeleton.frames(R0, M.bodyData(R0), data.bones);
  const rel = (mm, a, b) => { const i = data.bones.findIndex(x => x.name === a), k = data.bones.findIndex(x => x.name === b), wa = Skeleton.worldPoints(data.bones[i], mm, i), wb = Skeleton.worldPoints(data.bones[k], mm, k); return M.V.dist([wa[0], wa[1], wa[2]], [wb[0], wb[1], wb[2]]); };
  const last = data.bones.filter(b => b.seg === 'airway' && /^trachea/.test(b.name)).at(-1).name;
  assert(Math.abs(rel(m, 'cricoid', 'cervical') - rel(m0, 'cricoid', 'cervical')) < 1e-3, 'cricoid moves with the cervical spine');
  assert(Math.abs(rel(m, last, 'ribcage') - rel(m0, last, 'ribcage')) < 1e-3, 'lower trachea moves with the rib cage');
  assert(Math.abs(rel(m, 'hyoid', 'jaw') - rel(m0, 'hyoid', 'jaw')) < Math.abs(rel(m, 'hyoid', 'cervical') - rel(m0, 'hyoid', 'cervical')), 'hyoid follows the jaw more than the spine');
});
