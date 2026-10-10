'use strict';
/* Бережный режим: «Беречь суставы» убирает пиковую нагрузку на отмеченные суставы по тем же правилам, что красные
   метки манекена; цель «Бережно» — лёгкая дозировка без ударных, рывковых и сложных упражнений. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
const m = loadModel({ fullApp: true });
m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
const a = m.get(`({S,EX,EXI,PATTERN,GOALS,WEEKS,STRESS_RULES,PROTECT,PROTECT_BY,buildPlan,buildProgram,prescribe,effEquip,ensureProtect,ensureCustoms,ensurePlaces,
  PLACE_DEFAULTS,stressIdsOf,jointStress,fitsBody,unfitWhy,lostMessages,readPlanFile,planFileObject,customOf,openCustom})`);
function reset(extra = {}) {
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'single', format: 'classic', goal: 'mass', level: 'mid', count: 6, groups: ['quads', 'glutes', 'hams', 'calves'], seed: 7,
    fav: [], customs: [], custom: null, gen: null, protect: [], days: 3, week: 1, day: 0, focus: null }, extra);
  a.ensureCustoms(a.S); a.ensureProtect(a.S);
}
const ids = p => plain(p.items.map(it => it.ex.id));
const rulesOf = list => new Set(list.flatMap(id => a.PROTECT_BY[id].rules));
const GROUP_SETS = [['quads', 'glutes', 'hams', 'calves'], ['chest', 'back', 'shoulders'], ['chest', 'shoulders', 'triceps'], ['back', 'biceps', 'forearms'], ['quads', 'chest', 'back', 'shoulders', 'abs']];

test('every red-mark rule belongs to a joint you can protect, and the cached list matches the mannequin', () => {
  const covered = new Set(a.PROTECT.flatMap(p => p.rules));
  for (const r of a.STRESS_RULES) assert(covered.has(r.id), r.id + ' is protectable');
  for (const p of a.PROTECT) assert(p.rules.length, p.id + ' maps to rules');
  assert.deepEqual(plain(a.PROTECT_BY.knees.rules), ['knee', 'kneeOpen', 'landing']);
  for (const ex of a.EX) assert.deepEqual(plain(a.stressIdsOf(ex)), plain(a.jointStress(ex).rules.map(r => r.id)), ex.id);
});

test('protected joints: no exercise with their peak load is picked, in any group set, seed or mode', () => {
  for (const protect of [['knees'], ['shoulders', 'neck'], ['lumbar', 'hams'], ['wrists', 'elbows'], ['achilles']]) {
    const bad = rulesOf(protect);
    for (const groups of GROUP_SETS) for (const seed of [1, 7, 23, 51]) for (const goal of ['strength', 'mass', 'gentle']) {
      reset({ protect, groups, seed, goal });
      const p = a.buildPlan();
      for (const it of p.items) assert(!a.stressIdsOf(it.ex).some(r => bad.has(r)), `${protect} ${groups} ${seed}: ${it.ex.id}`);
    }
    reset({ protect, mode: 'program', days: 4 });
    for (const d of a.buildProgram().days) for (const it of d.plan.items || []) assert(!a.stressIdsOf(it.ex).some(r => bad.has(r)), `program ${protect}: ${it.ex.id}`);
  }
  reset({ protect: ['knees'] });
  const legs = a.buildPlan();
  assert(legs.items.length >= 4, 'legs still get a workout without knee-heavy exercises: ' + ids(legs));
  reset({ protect: ['shoulders', 'neck'], groups: ['back', 'biceps'] });
  assert(!ids(a.buildPlan()).some(id => ['pullup', 'chinup', 'assistpull'].includes(id)), 'no pull-ups when neck and shoulders are protected');
  for (const seed of [1, 7, 23]) {
    reset({ protect: ['shoulders'], groups: ['shoulders', 'triceps'], seed });
    assert(!ids(a.buildPlan()).some(id => a.PATTERN[id] === 'vpush'), 'no overhead presses when shoulders are protected: ' + ids(a.buildPlan()));
  }
  /* «Ступени: тяжелее» не ведёт к упражнению, которое нагружает бережёмый сустав */
  const hint = id => m.get('progressionHint')({ ex: a.EXI[id], rx: { reps: '12–15' } });
  reset();
  assert.match(hint('airsquat'), /data-prog="lunge"/);
  reset({ protect: ['knees'] });
  assert.equal(hint('airsquat'), '', 'every harder squat step loads the knees');
  reset({ protect: ['shoulders', 'neck'] });
  assert.match(hint('towelrow'), /data-prog="tablerow"/); assert(!/pullup/.test(hint('invrow')), 'the step to pull-ups is skipped');
});

test('gentle goal: light dosage with reserve, no impact, ballistic or advanced exercises, fewer joint peaks', () => {
  let peaks = { gentle: 0, mass: 0 };
  for (const goal of ['gentle', 'mass']) for (const groups of GROUP_SETS) for (const seed of [1, 7, 23, 51, 77]) {
    reset({ goal, groups: groups.concat('cardio'), seed, count: 7 });
    const p = a.buildPlan();
    for (const it of p.items) {
      peaks[goal] += a.stressIdsOf(it.ex).length;
      if (goal !== 'gentle') continue;
      assert(it.ex.lvl <= 2 && it.ex.id !== 'kbswing' && !['jump', 'burpee', 'climb'].includes(a.PATTERN[it.ex.id]), it.ex.id);
    }
  }
  assert(peaks.gentle < peaks.mass * 0.75, `gentle picks fewer joint peaks: ${JSON.stringify(peaks)}`);
  reset({ goal: 'gentle', groups: ['chest', 'back'] });
  const E = a.effEquip(a.S.equip), rx = plain(a.prescribe(a.EXI.dbbench, null, E));
  assert.deepEqual([rx.reps, rx.sets, rx.rest, rx.tempo], ['12–15', 2, 90, '3-0-2-0']);
  assert.match(rx.load, /40–60% от 1ПМ, 3–4 повтора в запасе, без боли/);
  assert(!/X/.test(a.GOALS.gentle.tempo), 'no explosive lift');
  for (const w of a.WEEKS) {
    const r = plain(a.prescribe(a.EXI.dbbench, w, E));
    const rir = +(r.load.match(/(\d) повтор/) || [0, 9])[1];
    assert(w.deload ? /лёгкий вес/.test(r.load) : rir >= 3, `${w.name}: ${r.load}`);
  }
  assert.match(plain(a.prescribe(a.EXI.treadmill, null, E)).load, /можно говорить/);
});

test('custom plan: an exercise that loads a protected joint is replaced and says why; nothing silently lost', () => {
  reset({ mode: 'custom', protect: ['knees'], groups: ['quads', 'chest'] });
  a.S.customs = [{ id: 'p1', name: 'Ноги', items: [{ id: 'squat' }, { id: 'legext' }, { id: 'dbbench' }] }]; a.ensureCustoms(a.S); a.openCustom('p1');
  const p = a.buildPlan(), knee = rulesOf(['knees']);
  assert.equal(p.items.length + p.lost.length, 3);
  for (const it of p.items) assert(!a.stressIdsOf(it.ex).some(r => knee.has(r)), it.ex.id);
  const sub = p.items.find(it => it.sub && it.sub.from.id === 'squat');
  if (sub) assert.match(sub.sub.note, /нагружает колени/, 'the card says why it was replaced');
  assert(p.items.some(it => it.ex.id === 'dbbench' && !it.sub), 'the bench press stays');
  assert.deepEqual(plain(a.customOf().items.map(i => i.id)), ['squat', 'legext', 'dbbench'], 'the saved plan itself is not changed');
  if (p.lost.length) assert(a.lostMessages(p.lost, p.E).some(t => /Бережный режим: нечем заменить/.test(t)));
  assert.equal(a.unfitWhy(a.EXI.squat), 'нагружает колени', 'only the protected joint is named');
  a.S.protect = ['knees', 'lumbar'];
  assert.equal(a.unfitWhy(a.EXI.squat), 'нагружает поясницу и колени', 'accusative names, joined');
});

test('settings: unknown joints dropped, kept in the backup; a gentle plan travels in a plan file', () => {
  reset();
  a.S.protect = ['knees', 'nose', 'knees', 'neck']; a.ensureProtect(a.S);
  assert.deepEqual(plain(a.S.protect), ['neck', 'knees'], 'known ids, catalogue order, no duplicates');
  a.S.protect = 'broken'; a.ensureProtect(a.S); assert.deepEqual(plain(a.S.protect), []);
  a.S.protect = ['lumbar'];
  assert.deepEqual(plain(m.get('backupObject()')).settings.protect, ['lumbar']);
  a.S.customs = [{ id: 'p1', name: 'Реабилитация', goal: 'gentle', format: 'classic', level: 'beg', items: [{ id: 'legpress' }] }]; a.ensureCustoms(a.S);
  const read = plain(a.readPlanFile(JSON.stringify(a.planFileObject([a.S.customs[0]], ''))));
  assert.equal(read.plans[0].goal, 'gentle');
});
