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

test('bone data: 102 bones of both sides, valid triangles, attribution kept', () => {
  assert.equal(data.bones.length, 102);
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
