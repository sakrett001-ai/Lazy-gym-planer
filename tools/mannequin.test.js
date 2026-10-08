'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const { V, M3 } = M;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const nearV = (a, b, tol, msg) => assert.ok(V.dist(a, b) <= tol, `${msg}: [${a.map(v => v.toFixed(2))}] vs [${b.map(v => v.toFixed(2))}]`);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test('нейтральная поза: высоты ориентиров соответствуют антропометрии (175 см, обувь 2 см)', () => {
  const { P } = M.fk(M.neutral());
  near(P.hipL[1], 94.5, .01, 'тазобедренный');
  near(P.ghL[1], 140.1, .3, 'плечевой');
  near(P.knL[1], 52.1, .3, 'колено');
  near(P.anL[1], 8.5, .3, 'голеностоп');
  near(P.heelL[1], 0, .4, 'пятка на полу');
  near(P.ballL[1], 2, .4, 'плюснефаланговый сустав над полом');
  const top = P.head[1] + M.B.head[1]; near(top, 177.4, .6, 'макушка в обуви');
  near(P.ghL[0], 18.1, .8, 'плечевой сустав слева +X'); near(P.ghR[0], -18.1, .8, 'справа −X');
  assert.ok(P.hipL[0] > 0 && P.hipR[0] < 0);
});

test('направления движений: сгибание плеча вперёд, отведение наружу, локоть вперёд, колено назад', () => {
  const q = M.neutral(); q.L.shoulder = [90, 0, 0]; q.R.shoulder = [0, 90, 0]; q.L.elbow = 0; q.R.elbow = 0;
  let { P } = M.fk(q);
  assert.ok(P.elL[2] - P.ghL[2] > 27, 'левая рука вперёд');
  assert.ok(P.elR[0] - P.ghR[0] < -27, 'правая рука в сторону (−X)');
  const q2 = M.neutral(); q2.L.shoulder = [0, 0, 0]; q2.L.elbow = 90; q2.L.knee = 90;
  ({ P } = M.fk(q2));
  assert.ok(P.wrL[2] - P.elL[2] > 26, 'предплечье вперёд');
  assert.ok(P.anL[2] - P.knL[2] < -42, 'голень назад');
  const q3 = M.neutral(); q3.lumbar = [30, 0, 0];
  const f = M.fk(q3); assert.ok(f.P.head[2] > 10, 'наклон корпуса вперёд');
});

test('разложения углов обратимы', () => {
  for (let i = 0; i < 200; i++) {
    const a = [rnd() * 140 - 70, rnd() * 140 - 70, rnd() * 140 - 70];
    const m = M3.mul(M3.rx(a[0]), M3.mul(M3.rz(a[1]), M3.ry(a[2])));
    const e = M.eulerXZY(m); for (let k = 0; k < 3; k++) near(e[k], a[k], 1e-6, 'XZY');
    const m2 = M3.mul(M3.ry(a[0]), M3.mul(M3.rz(a[1] * .8), M3.rx(a[2])));
    const e2 = M.eulerYZX(m2); near(e2[0], a[0], 1e-6, 'YZX α'); near(e2[1], a[1] * .8, 1e-6, 'YZX a'); near(e2[2], a[2], 1e-6, 'YZX b');
    const vx = rnd() * 200 - 100, vz = rnd() * 200 - 100, tw = rnd() * 160 - 80;
    if (Math.hypot(vx, vz) > 170) continue;
    const st = M.swingTwist(M3.mul(M.swing(vx, vz), M3.ry(tw)));
    near(st.vx, vx, 1e-6, 'swing x'); near(st.vz, vz, 1e-6, 'swing z'); near(st.twist, tw, 1e-6, 'twist');
  }
});

test('обратная кинематика руки: хват в точке, ось ручки совпадает, повтор прямой кинематикой', () => {
  for (let i = 0; i < 120; i++) {
    const q = M.neutral(), s = i % 2 ? 'L' : 'R', g = M.SIGN[s];
    const { P } = M.fk(q);
    const dir = V.unit([g * (rnd() * .9 + .1), rnd() * 1.6 - .8, rnd() * 1.4 - .2]);
    const target = V.add(P['gh' + s], dir, 25 + rnd() * 25);
    const axis = V.unit([rnd() - .5, rnd() - .5, rnd() - .5]);
    const info = M.solveArm(q, s, target, axis, [g, -1, -.5]);
    if (info.reachError > 0) continue;
    assert.ok(info.gripError < .05, 'точка хвата ' + info.gripError);
    assert.ok(info.axisError < .5 || info.axisError > 179.5, 'ось ручки ' + info.axisError);
    const f = M.fk(q); near(V.dist(f.P['gh' + s], f.P['el' + s]), M.B.ua, 1e-6, 'длина плеча');
  }
});

test('обратная кинематика ноги: подошва на полу, стопа в заданном направлении, подъём пятки', () => {
  const q = M.neutral(); q.root.p = [0, 80, 0];
  for (const [s, x] of [['L', 14], ['R', -14]]) {
    const foot = M.footFrame([x, 0, 12], M.SIGN[s] * 10, {});
    const r = M.solveLeg(q, s, foot);
    assert.ok(r.reachError <= 0, 'нога дотягивается');
    assert.ok(Math.abs(r.ankleTwist) < 1, 'нет скручивания в голеностопе ' + r.ankleTwist);
  }
  const f = M.fk(q);
  for (const s of ['L', 'R']) for (const p of M.solePoints(f, s)) near(p.p[1], 0, .05, 'подошва');
  const q2 = M.neutral();
  const foot = M.footFrame([9, 0, 13.5], 0, { heel: 30 }); M.solveLeg(q2, 'L', foot);
  const f2 = M.fk(q2), sole = M.solePoints(f2, 'L');
  near(q2.L.mtp, 30, .5, 'пальцы разогнуты на угол подъёма пятки');
  for (const p of sole.filter(p => p.part === 'toes')) near(p.p[1], 0, .05, 'пальцы на полу');
  assert.ok(sole[0].p[1] > 8, 'пятка поднята');
});

test('интерполяция ключей проходит через ключи и не выходит за их диапазон', () => {
  const a = M.pack(M.neutral()), b = M.pack((() => { const q = M.neutral(); q.L.elbow = 140; q.root.p[1] = 60; return q; })());
  const track = M.makeTrack([{ t: 0, v: a }, { t: .5, v: b }, { t: 1, v: a }]);
  const idx = (() => { let i = 0; for (const [p, n] of M.PACK) { if (p === 'L.elbow') return i; i += n; } })();
  near(track(.5).v[idx], 140, 1e-9, 'ключ'); near(track(0).v[idx], 6, 1e-9, 'начало');
  for (let t = 0; t <= 1; t += .02) { const v = track(t).v[idx]; assert.ok(v >= 6 - 1e-9 && v <= 140 + 1e-9); }
});

test('поза каталога: ориентиры, ортонормированные рамки, правая сторона тела по R.x', () => {
  const R = M.catalogPose(M.neutral());
  assert.equal(R.basis, 'mannequin');
  for (const k of ['hip', 'sh', 'head', 'shL', 'elR', 'gripL', 'knL', 'anR', 'heelL', 'toeR']) assert.ok(R[k], k);
  assert.ok(V.dot(V.sub(R.shR, R.shL), R.x) > 30, 'правое плечо со стороны R.x');
  for (const f of Object.values(R.frames)) {
    near(V.len(f.x), 1, 1e-9, 'x'); near(V.dot(f.x, f.y), 0, 1e-9, 'xy'); near(V.dot(f.y, f.z), 0, 1e-9, 'yz');
  }
  assert.ok(R.hip[1] < 186 && R.heelL[1] > 185, 'Y вниз, пол 186');
});

test('поверхность тела замкнута и симметрична; знаковое расстояние корпуса', () => {
  const R = M.catalogPose(M.neutral()), S = M.surface(R);
  assert.equal(S.torso.length, M.TORSO_H.length);
  const ring = S.torso[S.torso.length >> 1];
  const xs = ring.map(p => p[0]); near(Math.max(...xs), -Math.min(...xs), .01, 'симметрия корпуса');
  const c = M.spineFrame(R, 30).c;
  assert.ok(M.torsoSDF(R, c) < -8, 'центр корпуса внутри');
  assert.ok(M.torsoSDF(R, V.add(c, [0, 0, 40])) > 25, 'точка спереди снаружи');
  const mid = V.mix(R.shL, R.elL, .5); assert.ok(M.limbSDF(R, 'ua', 'L', mid) < -3, 'ось плеча внутри руки');
});
