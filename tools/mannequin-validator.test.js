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
  assert.equal(EX.length, 151); /* +5 прицельных на приводящие и манжету */
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

/* Хваты (правило hold, ось каната в кулаке, трос у кисти): каждое ловит прежний дефект каталога */
const { V } = M;
test('hold: a clenched fist with nothing in it is an error', () => {
  /* выпады без гантелей: прежде кисти оставались сжатыми вокруг невидимой рукояти */
  const e0 = EQ.variantEntry(POSES.lunge, () => false), entry = { ...e0, has: () => false, contacts: e0.contacts.map(c => ({ ...c, optional: true })) }, R = EQ.rig(e0)(.5);
  assert.deepEqual(errors(checkFrame(R, entry), 'hold'), [], 'relaxed hands without dumbbells');
  assert(errors(checkFrame({ ...R, hands: { L: 'grip', R: 'grip' } }, entry), 'hold').some(i => /кулак L сжат/.test(i.detail)));
});
test('hold: a dumbbell on the edges of the fists, beside its handle, is an error (goblet before 4.43.0)', () => {
  /* прежний гоблет: кулаки — как у гири за рога (ключи варианта kb совпадают с прежними), верхний диск гантели лежит на кулаках,
     контакт заявлен областью кисти; касание было, валидатор молчал, а сверху рука проходила мимо гантели */
  const R = EQ.rig({ keys: POSES.goblet.variants.kb.keys, equipment: [] })(.5);
  const n = V.unit(V.add(R.frames.handL.z, R.frames.handR.z)), c = V.add(V.mix(R.gripL, R.gripR, .5), n, 4.7 - 7.95), at = k => V.add(c, n, k);
  const db = role => [{ kind: 'cyl', c: at(11.45), axis: n, r: 7.5, len: 7, tone: 'plate', role: 'weight', id: 'gdb:top', mount: 'hands' },
    { kind: 'beam', a: at(-7.35), b: at(7.35), r: 1.6, tone: 'chrome', role, id: 'gdb:handle', mount: 'gdb:top' },
    { kind: 'cyl', c: at(-11.45), axis: n, r: 7.5, len: 7, tone: 'plate', role: 'weight', id: 'gdb:bottom', mount: 'gdb:handle' }];
  const on = prop => ({ contacts: [...FEET, { body: 'handL', prop }, { body: 'handR', prop }] });
  assert(errors(checkFrame({ ...R, props: db('weight') }, on('gdb:top')), 'hold').some(i => /handL: кулак касается gdb:top краем — ручки в кулаке нет/.test(i.detail)));
  /* та же гантель с рукоятью-ручкой: кулаки рядом с ней, а не на ней */
  assert(errors(checkFrame({ ...R, props: db('grip') }, on('gdb')), 'hold').some(i => /кулак касается gdb краем — ручка в/.test(i.detail)));
  /* гантель в ладонях (4.43.0) — ладони под диском; поднятая с ладоней на 4 см — ошибка */
  const e0 = EQ.variantEntry(POSES.goblet, () => false), entry = { ...e0, has: () => false }, C = EQ.rig(e0)(.5), up = C.props.find(p => p.id === 'cup:top').axis;
  assert.deepEqual(errors(checkFrame(C, entry), 'hold'), []);
  assert(errors(checkFrame(moveProp(C, p => p.id.startsWith('cup:'), V.scale(up, 4)), entry), 'hold').some(i => /ладонь не на cup:top/.test(i.detail)));
});
test('contact: a rope running across the fist is an error', () => {
  /* прежде канат шёл прямо от карабина через центр хвата: при оси кулака поперёк ветви — сквозь ладонь и пальцы */
  const R = frame('facepull', .5), straight = p => { const g = R['grip' + p.id.slice(-1)], d = V.unit(V.sub(g, p.pts[0])); return { ...p, pts: [p.pts[0], V.add(g, d, 4)] }; };
  assert.deepEqual(errors(checkFrame(R, POSES.facepull), 'contact'), []);
  const old = { ...R, props: R.props.map(p => /^cab:rope(L|R)$/.test(p.id) ? straight(p) : p) };
  assert(errors(checkFrame(old, POSES.facepull), 'contact').some(i => /gripL: ладонь повёрнута к ручке/.test(i.detail)));
});
test('cable: a band running through the fingers into the middle of the fist is an error', () => {
  /* прежде лента эспандера шла прямо в центр кулака; теперь — к кольцу стремени рукояти */
  const R = frame('bandcurl', .9), band = R.props.find(p => p.id === 'band:L');
  assert.deepEqual(errors(checkFrame(R, POSES.bandcurl), 'cable'), []);
  const old = { ...R, props: R.props.map(p => p === band ? { ...p, pts: [...p.pts.slice(0, -1), R.gripL] } : p) };
  assert(errors(checkFrame(old, POSES.bandcurl), 'cable').some(i => /band:L проходит сквозь кисть L у хвата/.test(i.detail)));
});
