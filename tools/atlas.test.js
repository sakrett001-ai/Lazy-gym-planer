'use strict';
/* Атлас мышц: от мышцы к упражнениям. Список — только из инвентаря места, сначала то, где мышца основная цель;
   акцент из атласа реально меняет состав тренировки; схема даёт выбрать каждую мышцу. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
function app() {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  return m.get('({S,EX,EXI,MUSCLE_NAMES,MUSCLE_GROUP,MUSCLE_INFO,ATLAS_ORDER,available,effEquip,atlasFor,atlasCounts,atlasMapSvg,atlasCamera,setFocus,buildPlan,buildProgram,ensurePlaces,PLACE_DEFAULTS})');
}
const HOME = ['db', 'band', 'abwheel'];
const places = a => { a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); };

test('every muscle has a description, a place on the map and exercises in the gym', () => {
  const a = app(), E = a.effEquip(a.PLACE_DEFAULTS[0].equip);
  assert.deepEqual([...a.ATLAS_ORDER].sort(), Object.keys(a.MUSCLE_NAMES).sort(), 'the atlas lists all muscles once');
  const svg = a.atlasMapSvg('chest', a.atlasCounts(E));
  for (const m of a.ATLAS_ORDER) {
    assert(a.MUSCLE_INFO[m] && a.MUSCLE_INFO[m].length > 30, m + ' explains what it does');
    assert(svg.includes(`data-atlas-m="${m}"`), m + ' can be tapped on the map');
    assert(a.atlasFor(m, E).pri.length >= 2, m + ' has exercises where it is the main target');
  }
  assert.match(svg, /class="am-m on"[^>]*data-atlas-m="chest"/, 'the chosen muscle is highlighted');
});
test('the list uses only the current place, main work first, isolation before compound', () => {
  const a = app(), E = a.effEquip(HOME), A = a.atlasFor('biceps', E);
  for (const r of [...A.pri, ...A.sec]) assert(a.available(r.ex, E), r.ex.id + ' is doable at home');
  assert(A.pri.every(r => r.ex.pri.includes('biceps')) && A.sec.every(r => r.ex.sec.includes('biceps') && !r.ex.pri.includes('biceps')));
  for (let i = 1; i < A.pri.length; i++) assert(A.pri[i - 1].score >= A.pri[i].score, 'sorted by score');
  const gym = a.atlasFor('biceps', a.effEquip(a.PLACE_DEFAULTS[0].equip)).pri.map(r => r.ex.id);
  assert(gym.indexOf('dbcurl') < gym.indexOf('chinup'), 'a curl targets the biceps more directly than a chin-up');
  const glutes = a.atlasFor('glutes', a.effEquip(a.PLACE_DEFAULTS[0].equip)).pri;
  assert.notEqual(glutes[0].ex.g, 'cardio', 'strength exercises come before cardio machines');
});
test('exercises that need other equipment say what is missing and where it is available', () => {
  const a = app(); places(a); a.S.place = 'street'; a.ensurePlaces(a.S);
  const E = a.effEquip(a.S.equip), A = a.atlasFor('traps', E);
  assert(A.other.length, 'shrugs need dumbbells or a barbell');
  for (const r of A.other) {
    assert(!a.available(r.ex, E), r.ex.id + ' really is unavailable on the street');
    assert(r.need.length, r.ex.id + ' names the missing equipment');
    for (const name of r.places) assert(['Зал', 'Дом'].includes(name));
  }
  const shrug = A.other.find(r => r.ex.id === 'shrug');
  assert(shrug && shrug.places.includes('Зал'), 'shrugs can be done in the gym');
});
test('a focus from the atlas puts the muscle into a third of the workout', () => {
  const a = app(); places(a); a.S.place = 'gym'; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'single', goal: 'mass', level: 'mid', count: 6, groups: ['chest', 'back', 'shoulders'], format: 'classic', focus: null });
  for (const seed of [3, 7, 19]) {
    a.S.seed = seed; a.S.groups = ['chest', 'back', 'shoulders']; a.setFocus('biceps');
    assert(a.S.groups.includes('biceps'), 'the focus group joins the selected groups');
    const p = a.buildPlan(), n = p.items.filter(it => it.ex.pri.includes('biceps')).length;
    assert(n >= 2, `seed ${seed}: ${n} biceps exercises`);
  }
  a.setFocus(null); assert.equal(a.S.focus, null);
});
test('in a weekly programme the focus works on days that train its group and on every full-body day', () => {
  const a = app(); places(a); a.S.place = 'gym'; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'program', days: 4, split: 'ul', week: 1, count: 6, seed: 5, goal: 'mass', level: 'mid', format: 'classic' });
  const count = (prog, m) => prog.days.map(d => (d.plan.items || []).filter(it => it.ex.pri.includes(m)).length);
  a.setFocus(null); const plain = count(a.buildProgram(), 'delt_s');
  a.setFocus('delt_s');
  const prog = a.buildProgram(), focused = count(prog, 'delt_s');
  prog.days.forEach((d, i) => {
    if (d.plan.groups.includes('shoulders')) assert(focused[i] >= 1, d.name + ': side delt accent');
    else assert.equal(focused[i], 0, d.name + ': no shoulder work forced into a lower-body day');
  });
  assert(focused.reduce((x, y) => x + y) > plain.reduce((x, y) => x + y), 'the accent adds side-delt work over the week');
  Object.assign(a.S, { days: 3, split: 'full' }); a.setFocus('calves');
  for (const d of a.buildProgram().days) assert(d.plan.items.some(it => it.ex.pri.includes('calves')), d.name + ' trains the calves');
});
test('the preview camera faces the chosen muscle', () => {
  const a = app();
  assert.equal(a.atlasCamera(a.EXI.bbbench, 'chest'), 'above', 'bench press chest is seen from above');
  assert.equal(a.atlasCamera(a.EXI.latpull, 'lats'), 'rear', 'lats are seen from behind');
  assert.equal(a.atlasCamera(a.EXI.dbcurl, 'biceps'), 'angle', 'biceps are seen from the front');
});
