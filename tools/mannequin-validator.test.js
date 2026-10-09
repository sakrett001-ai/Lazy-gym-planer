'use strict';
/* Валидатор манекена (tools/biomech/validator2.js): каждое правило ловит своё нарушение, а чистая поза проходит.
   Это отрицательные тесты — без них «0 ошибок» ничего не доказывает. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const EQ = require('../src/js/09bn-equipment.js');
const POSES = require('../src/js/09bp-poses.js');
const EX = require('./biomechanics-audit.js').loadModel().EX;
const { checkFrame, checkClip } = require('./biomech/validator2.js');

const FEET = [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }];
const errors = (r, rule) => r.issues.filter(i => i.severity === 'error' && (!rule || i.rule === rule));
const stand = (edit = () => {}) => { const q = M.neutral(); edit(q); const R = M.catalogPose(q); R.props = []; return R; };
const frame = (id, t) => EQ.rig(POSES[id])(t);
const moveProp = (R, pick, d) => ({ ...R, props: R.props.map(p => !pick(p) ? p : { ...p, ...(p.c ? { c: p.c.map((v, i) => v + d[i]) } : {}), ...(p.a ? { a: p.a.map((v, i) => v + d[i]), b: p.b.map((v, i) => v + d[i]) } : {}) }) });

test('every catalog exercise is authored on the mannequin', () => {
  const missing = EX.filter(ex => !POSES[ex.id]).map(ex => ex.id);
  assert.equal(missing.length, 0, 'not on the mannequin: ' + missing.join(', '));
  assert.equal(EX.length, 139);
  for (const ex of EX) assert(ex.anim.catalogRig(.5).frames, ex.id + ' renders the mannequin, not a legacy rig');
});
test('a clean standing pose and a clean exercise frame pass', () => {
  assert.deepEqual(errors(checkFrame(stand(), { contacts: FEET })), []);
  for (const id of ['squat', 'bbbench', 'latpull', 'pushup']) assert.deepEqual(errors(checkFrame(frame(id, .5), POSES[id])), [], id);
});
test('rom: an elbow bent backwards is an error', () => {
  const R = stand(q => { q.L.elbow = -25; });
  assert(errors(checkFrame(R, { contacts: FEET }), 'rom').some(i => /локоть/.test(i.detail)));
});
test('floor: a body sunk into the floor is an error', () => {
  const R = stand(q => { q.root.p = [0, M.B.hipHeight - 8, 0]; });
  assert(errors(checkFrame(R, { contacts: FEET }), 'floor').length);
});
test('contact: feet hovering above the floor are an error', () => {
  const R = stand(q => { q.root.p = [0, M.B.hipHeight + 8, 0]; });
  assert(errors(checkFrame(R, { contacts: FEET }), 'contact').length);
});
test('penetration: a bench pad pushed into the back is an error', () => {
  const R = moveProp(frame('bbbench', .5), p => p.tone === 'pad', [0, -8, 0]);
  assert(errors(checkFrame(R, POSES.bbbench), 'penetration').length);
});
test('self-collision: an arm driven through the chest is an error', () => {
  const R = stand(q => { q.L.shoulder = [0, -40, 0]; q.L.elbow = 0; });
  assert(errors(checkFrame(R, { contacts: FEET }), 'self-collision').length);
});
test('equipment: a part driven through another machine is an error', () => {
  const R = frame('bbbench', .5), pad = R.props.find(p => p.tone === 'pad');
  const pole = { kind: 'beam', id: 'pole:post', a: [pad.c[0] + 10, 186, pad.c[2]], b: [pad.c[0] + 10, pad.c[1] - 20, pad.c[2]], w: 6, h: 6, mount: 'floor', tone: 'frame' };
  assert(errors(checkFrame({ ...R, props: [...R.props, pole] }, POSES.bbbench), 'equipment').length);
});
test('cable: a cable routed through the torso is an error', () => {
  const R = frame('cablerow', .5), cable = R.props.find(p => p.kind === 'cable' && p.pts.length >= 2);
  const through = { ...cable, pts: [cable.pts[0], R.hip.map((v, i) => i === 1 ? v - 25 : v), cable.pts.at(-1)] };
  assert(errors(checkFrame({ ...R, props: R.props.map(p => p === cable ? through : p) }, POSES.cablerow), 'cable').length);
});
test('balance: a heavy load held far in front of the feet is an error', () => {
  const R = stand(q => { for (const k of ['L', 'R']) { q[k].shoulder = [90, 0, 0]; q[k].elbow = 0; } });
  const loads = [{ at: 'gripL', kg: 100 }, { at: 'gripR', kg: 100 }];
  assert.deepEqual(errors(checkFrame(R, { contacts: FEET }), 'balance'), []);
  assert(errors(checkFrame(R, { contacts: FEET, loads }), 'balance').length);
});
test('mount: a machine part hanging in the air is an error', () => {
  const R = frame('legext', .5), part = R.props.find(p => !p.dyn && p.mount && p.mount !== 'floor' && p.kind === 'beam');
  assert(errors(checkFrame(moveProp(R, p => p === part, [0, 0, 40]), POSES.legext), 'mount').length);
});
test('jump: a teleport between neighbouring frames is an error', () => {
  const rig = EQ.rig(POSES.squat), jumpy = t => { const R = rig(t); if (t > .5) for (const k of ['wrL', 'gripL']) R[k] = R[k].map((v, i) => i === 0 ? v + 40 : v); return R; };
  assert(checkClip(jumpy, POSES.squat, { samples: 21 }).some(i => i.rule === 'jump'));
});
