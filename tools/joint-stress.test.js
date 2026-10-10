'use strict';
/* Метки нагрузки на суставы: каждое правило загорается там, где должно, и молчит там, где сустав не нагружен;
   метка стоит на своём суставе и в своей фазе. Углы — общие с валидатором манекена. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const M = require('../src/js/09bm-mannequin.js');
const validator = require('./biomech/validator2.js');

const m = loadModel({ fullApp: true });
m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
const A = m.get('({EX,EXI,PATTERN,STRESS_RULES,STRESS_HINGE,STRESS_VPUSH,jointStress,jointStressAt,jointStressPoints,stressZones,stressPoint})');
const ex = id => A.EXI[id];
/* массивы из контекста приложения — в обычные, чтобы сравнивать по содержимому */
const plain = x => JSON.parse(JSON.stringify(x));
const rules = id => new Set(A.jointStress(ex(id)).rules.map(r => r.id));
const at = (id, t, index = 0) => plain(A.jointStressAt(ex(id), t, index).map(x => x.rule.id));
const keysAt = (id, rule, t, index = 0) => plain((A.jointStressAt(ex(id), t, index).find(x => x.rule.id === rule) || { keys: [] }).keys);

test('joint angles are the validator\'s own calculation', () => {
  assert.equal(typeof M.jointAngles, 'function');
  const R = ex('squat').anim.catalogRig(.6);
  assert.equal(validator.angles, M.jointAngles, 'one function, not a copy');
  assert(Math.abs(M.jointAngles(R).L.knee) > 10);
});

const EXPECT = {
  knee: { on: ['squat', 'goblet', 'smithsquat', 'hacksquat', 'legpress', 'legpresslow', 'lunge', 'revlunge', 'bulgarian', 'stepup', 'pistolbox'], off: ['dbpress', 'latpull', 'deadlift', 'jumpsquat', 'glutebridge1', 'crunch', 'legext', 'calfraise'] },
  kneeOpen: { on: ['legext'], off: ['legcurl', 'squat', 'legpress'] },
  lumbar: { on: ['deadlift', 'rdl', 'sllift', 'goodmorning', 'bbrow', 'kbswing', 'squat'], off: ['latpull', 'cablerow', 'dbrow', 'shrug', 'ohp', 'chestrowdb', 'legpress'] },
  shPress: { on: ['bbbench', 'smithbench', 'inclinebb', 'closegrip', 'dip', 'assistdip', 'benchdip', 'pecdeck'], off: ['ohp', 'pushup', 'latpull', 'bbrow', 'dbcurl'] },
  shLever: { on: ['dbfly', 'pullover'], off: ['bbbench', 'cablefly', 'latraise'] },
  shOverhead: { on: ['ohp', 'dbpress', 'arnold', 'shoulderpressm', 'smithohp', 'pikepush', 'declinepike'],
    off: ['latraise', 'bandlatraise', 'frontraise', 'facepull', 'bandfacepull', 'latpull', 'pullup', 'ohext', 'cableohext', 'bbbench', 'dbincline', 'pullover'] },
  hang: { on: ['pullup', 'chinup', 'hang', 'legraise', 'hangknee'], off: ['latpull', 'dip', 'ohp'] },
  pullTop: { on: ['pullup', 'chinup', 'assistpull'], off: ['hang', 'legraise', 'latpull', 'invrow'] },
  neck: { on: ['pullup', 'chinup', 'assistpull'], off: ['crunch', 'latpull', 'hang', 'shrug'] },
  elbow: { on: ['skull', 'ohext', 'cableohext'], off: ['dbcurl', 'ohp', 'pushdown', 'closegrip'] },
  wrist: { on: ['pushup', 'diamond', 'burpee', 'mountain', 'birddog', 'plankup'], off: ['plank', 'wallpush', 'nordic', 'bbbench', 'dbcurl'] },
  achilles: { on: ['calfraise', 'calf1', 'seatedcalf', 'standcalf'], off: ['squat', 'jumpsquat', 'treadmill', 'lpcalf'] },
  landing: { on: ['jumpsquat', 'burpee', 'jumpingjack'], off: ['pullup', 'dip', 'stepup', 'elliptical', 'stairs', 'squat', 'hangknee'] },
  hams: { on: ['rdl', 'sllift', 'goodmorning', 'nordic'], off: ['squat', 'legcurl', 'hipthrust', 'lunge'] }
};
test('every rule has texts and lights up where the joint is loaded, and only there', () => {
  assert.deepEqual(plain(A.STRESS_RULES.map(r => r.id)).sort(), Object.keys(EXPECT).sort(), 'each rule is covered by this test');
  for (const r of A.STRESS_RULES) {
    assert(r.zone && r.what.length > 20 && r.tip.length > 15, r.id + ' explains what is loaded and how to protect it');
    for (const id of EXPECT[r.id].on) assert(rules(id).has(r.id), `${r.id} must mark ${id}`);
    for (const id of EXPECT[r.id].off) assert(!rules(id).has(r.id), `${r.id} must not mark ${id}`);
  }
});
test('marks follow the phase: bottom of a squat and a bench press, end range of a leg extension', () => {
  assert.deepEqual(at('squat', 0), [], 'standing tall: no mark');
  assert.deepEqual(keysAt('squat', 'knee', 1).sort(), ['knL', 'knR'], 'bottom: both knees');
  assert(at('squat', 1).includes('lumbar'), 'bottom: lower back too');
  assert(!at('bbbench', 0).includes('shPress') && at('bbbench', 1).includes('shPress'), 'bench: only at the chest');
  const leg = ex('legext');
  for (let i = 0; i <= 40; i++) {
    const on = A.jointStressAt(leg, i / 40).some(x => x.rule.id === 'kneeOpen'), knee = M.jointAngles(leg.anim.catalogRig(i / 40)).L.knee;
    if (on) assert(knee <= 30.5, 'leg extension mark only near a straight knee: ' + knee.toFixed(0));
  }
  assert(at('pullup', 0).includes('hang') && !at('pullup', 0).includes('neck'), 'pull-up bottom: hanging shoulders, neck is fine');
  /* жим вверх: метка только пока плечо в дуге 90–120°; внизу у груди и наверху на прямых руках — нет */
  assert(!at('ohp', 0).includes('shOverhead') && !at('ohp', 1).includes('shOverhead'), 'overhead press: no mark at the chest or at lockout');
  const press = ex('ohp');
  let lit = 0;
  for (let i = 0; i <= 40; i++) {
    const on = A.jointStressAt(press, i / 40).some(x => x.rule.id === 'shOverhead'), el = M.jointAngles(press.anim.catalogRig(i / 40)).L.elevation;
    if (on) { lit++; assert(el >= 89.5 && el <= 120.5, 'overhead press mark only in the 90–120° arc: ' + el.toFixed(0)); }
  }
  assert(lit >= 3, 'the arc is crossed in several frames');
  assert(at('pullup', 1).includes('neck') && at('pullup', 1).includes('pullTop'), 'pull-up top: neck and shoulders');
});
test('fallback sets match the movement table, so marks do not change when it is not loaded', () => {
  const by = p => plain(A.EX.filter(e => A.PATTERN[e.id] === p).map(e => e.id)).sort();
  assert.deepEqual(plain([...A.STRESS_VPUSH]).sort(), by('vpush'));
  for (const id of A.STRESS_HINGE) assert.equal(A.PATTERN[id], 'hinge', id);
});
test('single-leg exercises mark only the working leg', () => {
  const S = A.jointStress(ex('stepup')).rules.find(r => r.id === 'knee'), keys = new Set(S.f.flat());
  assert.deepEqual(plain([...keys]), ['knL'], 'the leg on the bench');
});
test('landing is marked right after the flight phase and follows the direction of playback', () => {
  const jump = ex('jumpsquat'), rig = jump.anim.catalogRig, foot = R => Math.max(R.heelL[1], R.toeL[1], R.heelR[1], R.toeR[1]);
  const ground = Math.max(...Array.from({ length: 41 }, (_, i) => foot(rig(i / 40))));
  const land = A.jointStress(jump).rules.find(r => r.id === 'landing');
  const hits = land.f.map((k, i) => k.length ? i : -1).filter(i => i >= 0);
  assert(hits.length >= 2 && hits.length <= 8, 'a short landing window: ' + hits.join(','));
  for (const i of hits) {
    assert(ground - foot(rig(i / 40)) < 3, 'feet are on the floor at frame ' + i);
    assert([1, 2, 3, 4, 5].some(d => i - d >= 0 && ground - foot(rig((i - d) / 40)) >= 5), 'a flight frame precedes frame ' + i);
  }
  const burpee = A.jointStress(ex('burpee')).rules.find(r => r.id === 'landing');
  assert.notDeepEqual(burpee.f.map(k => k.length > 0), burpee.b.map(k => k.length > 0), 'a reversed burpee lands elsewhere');
});
test('marks sit on their joints', () => {
  const R = ex('squat').anim.catalogRig(1), pts = A.jointStressPoints(ex('squat').anim, R, 1, 0);
  const knee = pts.find(p => p.key === 'knL'), lumbar = pts.find(p => p.key === 'lumbar');
  assert.deepEqual(plain(knee.p), plain(R.knL));
  const between = (p, a, b) => p[1] <= Math.max(a[1], b[1]) + 1 && p[1] >= Math.min(a[1], b[1]) - 1;
  assert(lumbar && between(lumbar.p, R.hip, R.sh), 'lower back mark between pelvis and shoulders');
  const neck = A.jointStressPoints(ex('pullup').anim, ex('pullup').anim.catalogRig(1), 1, 0).find(p => p.key === 'neck');
  assert(neck, 'pull-up top marks the neck');
  const P = ex('pullup').anim.catalogRig(1);
  assert(Math.hypot(...neck.p.map((v, i) => v - P.head[i])) < 20, 'neck mark is just below the head');
});
test('the plan card names the loaded joints in plain words', () => {
  assert.deepEqual(plain(A.stressZones(ex('pullup'))), ['плечи', 'шея']);
  assert.deepEqual(plain(A.stressZones(ex('rdl'))), ['поясница', 'задняя поверхность бедра']);
  assert.deepEqual(plain(A.stressZones(ex('jumpsquat'))), ['колени', 'ахилловы сухожилия']);
  assert.deepEqual(plain(A.stressZones(ex('dbcurl'))), []);
});
test('the SVG figure draws red marks on top at the loaded joints and can hide them', () => {
  const fs = require('node:fs'), path = require('node:path'), { JSDOM } = require('jsdom');
  const dom = new JSDOM('<html><body></body></html>', { runScripts: 'outside-only' });
  try {
    const dir = path.join(__dirname, '../src/js'), files = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && parseInt(f) < 11).sort();
    dom.window.eval(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\nwindow.api={EX,buildFigure};');
    const { EX, buildFigure } = dom.window.api, squat = EX.find(e => e.id === 'squat');
    const fig = buildFigure(squat.anim, { camera: 'side', t: 0 }), shown = () => [...fig.svg.querySelectorAll('.stress-mark')].filter(n => n.getAttribute('display') !== 'none').map(n => n.dataset.joint).sort();
    assert.deepEqual(shown(), [], 'standing: nothing');
    fig.at(1, { index: 1 });
    assert.deepEqual(shown(), ['knL', 'knR', 'lumbar'], 'bottom of the squat');
    assert.equal(fig.svg.lastElementChild.getAttribute('class'), 'stress-marks', 'marks are drawn last, above the body');
    fig.setStress(false);
    assert.deepEqual(shown(), [], 'switched off');
  } finally { dom.window.close(); }
});
