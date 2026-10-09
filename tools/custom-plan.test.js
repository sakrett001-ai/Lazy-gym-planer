'use strict';
/* Избранное и свой план: порядок и дозировка человека, замены по месту, подсказки по составу, сохранение и резервная копия. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
function app() {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  const a = m.get('({S,EXI,GOALS,buildPlan,prescribe,effEquip,ensureCustoms,customOf,customAdd,customMove,customRemove,customSet,customHas,customHints,toggleFav,isFav,planText,PLACE_DEFAULTS,ensurePlaces,cleanCustomItem,CUSTOM_MAX})');
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'custom', format: 'classic', goal: 'mass', level: 'mid', groups: ['chest', 'back', 'shoulders'], fav: [], customs: [], custom: null });
  a.ensureCustoms(a.S);
  a.m = m;
  return a;
}
const ids = p => plain(p.items.map(it => it.ex.id));

test('favourites: a star toggles, unknown ids are dropped, duplicates removed', () => {
  const a = app();
  a.toggleFav('bbbench'); a.toggleFav('latpull'); a.toggleFav('bbbench');
  assert.deepEqual(plain(a.S.fav), ['latpull']);
  a.S.fav = ['squat', 'nope', 'squat', 'dbcurl']; a.ensureCustoms(a.S);
  assert.deepEqual(plain(a.S.fav), ['squat', 'dbcurl']);
  assert.equal(a.isFav('dbcurl'), true);
});

test('a new custom plan is empty and says so; exercises keep the person’s order', () => {
  const a = app();
  assert.equal(a.buildPlan().empty, 'custom');
  for (const id of ['latpull', 'bbbench', 'dbcurl']) assert.equal(a.customAdd(id), true);
  assert.equal(a.customAdd('bbbench'), false, 'no duplicates');
  assert.deepEqual(ids(a.buildPlan()), ['latpull', 'bbbench', 'dbcurl'], 'not re-ordered by the planner');
  a.customMove(2, -1);
  assert.deepEqual(ids(a.buildPlan()), ['latpull', 'dbcurl', 'bbbench']);
  a.customRemove(0);
  assert.deepEqual(ids(a.buildPlan()), ['dbcurl', 'bbbench']);
  for (let i = 0; i < 20; i++) a.customAdd(Object.keys(a.EXI)[i]);
  assert.equal(a.customOf().items.length, a.CUSTOM_MAX, 'a plan holds at most twelve exercises');
});

test('dosage follows the goal and format until the person edits it', () => {
  const a = app();
  a.customAdd('bbbench'); a.customAdd('dbcurl');
  const base = a.buildPlan().items.find(it => it.ex.id === 'bbbench').rx, auto = a.prescribe(a.EXI.bbbench, null, a.effEquip(a.S.equip));
  assert.equal(base.sets, auto.sets); assert.equal(base.reps, auto.reps); assert.equal(base.rest, auto.rest);
  a.customSet(0, 'sets', 5); a.customSet(0, 'reps', '6-8'); a.customSet(0, 'rest', 150);
  const rx = a.buildPlan().items.find(it => it.ex.id === 'bbbench').rx;
  assert.deepEqual([rx.sets, rx.reps, rx.rest, rx.edited], [5, '6–8', 150, true]);
  a.m.get('plan = buildPlan()');
  assert.match(a.planText(), /^Мой план — /, 'the copied text starts with the plan name');
  assert.match(a.planText(), /Жим штанги лёжа — 5 × 6–8 повт\., отдых 2 мин 30 с/);
  a.customSet(0, 'reps', 'много'); assert.equal(a.customOf().items[0].reps, '6–8', 'nonsense is ignored');
  for (const k of ['sets', 'reps', 'rest']) a.customSet(0, k, null);
  assert.equal(a.buildPlan().items.find(it => it.ex.id === 'bbbench').rx.sets, auto.sets, 'back to the goal default');
  a.S.goal = 'strength';
  assert.equal(a.buildPlan().items.find(it => it.ex.id === 'bbbench').rx.reps, a.GOALS.strength.reps.c, 'changing the goal re-doses unedited exercises');
});

test('formats work on the person’s order: supersets pair neighbours, a circuit keeps the sequence, static-dynamics keeps its method', () => {
  const a = app();
  for (const id of ['bbbench', 'latpull', 'ohp', 'dbcurl', 'legext']) a.customAdd(id);
  a.S.format = 'superset';
  assert.deepEqual(plain(a.buildPlan().blocks.map(b => b.items.map(it => it.ex.id))), [['bbbench', 'latpull'], ['ohp', 'dbcurl'], ['legext']]);
  a.S.format = 'circuit';
  assert.deepEqual(plain(a.buildPlan().blocks[0].items.map(it => it.ex.id)), ['bbbench', 'latpull', 'ohp', 'dbcurl', 'legext']);
  a.customSet(0, 'reps', '12');
  assert.equal(a.buildPlan().blocks[0].items[0].rx.reps, '12', 'edited reps survive the circuit');
  a.S.format = 'static'; a.customSet(0, 'sets', 6);
  const st = a.buildPlan().items.find(it => it.ex.id === 'bbbench').rx;
  assert.equal(st.static, true); assert.equal(st.sets, st.series * 3, 'series stay whole in static-dynamics');
});

test('at another place missing equipment is replaced by the closest analog, and nothing is lost silently', () => {
  const a = app();
  for (const id of ['bbbench', 'latpull', 'dbcurl']) a.customAdd(id);
  a.S.place = 'home'; a.ensurePlaces(a.S);
  const p = a.buildPlan(), E = a.effEquip(a.S.equip);
  assert.equal(p.items.length + p.lost.length, 3);
  for (const it of p.items) assert(it.ex.eq.every(g => g.some(id => E.has(id))), it.ex.id + ' is doable at home');
  const sub = p.items.find(it => it.sub);
  assert(sub && ['bbbench', 'latpull'].includes(sub.sub.from.id), 'the substitute names what it replaces');
  assert.deepEqual(plain(a.customOf().items.map(i => i.id)), ['bbbench', 'latpull', 'dbcurl'], 'the saved plan itself is unchanged');
  const slots = plain(p.items.map(it => it.slot));
  assert.deepEqual(slots, [...slots].sort((x, y) => x - y), 'cards keep the slots of the saved plan');
});

test('hints: selected muscles left idle, and presses far outnumbering pulls', () => {
  const a = app();
  a.S.groups = ['chest', 'back', 'shoulders', 'quads'];
  a.customAdd('bbbench'); a.customAdd('dbfly'); a.customAdd('ohp');
  let h = plain(a.customHints(a.buildPlan()));
  assert(h.some(x => /Пока не нагружены:.*квадрицепс/.test(x)), 'quads were selected but nothing works them');
  a.S.groups = ['chest', 'back', 'shoulders'];
  a.customAdd('dbpress'); a.customAdd('bbrow');
  h = plain(a.customHints(a.buildPlan()));
  assert(h.some(x => /Жимов заметно больше, чем тяг/.test(x)), 'four presses for one row');
  a.customAdd('latpull');
  assert(!plain(a.customHints(a.buildPlan())).some(x => /Жимов/.test(x)), 'balanced once there are enough pulls');
  a.S.groups = ['chest', 'shoulders', 'triceps']; a.customRemove(5); a.customRemove(4);
  assert.deepEqual(plain(a.customHints(a.buildPlan())).filter(x => /Жимов/.test(x)), [], 'a pressing day is a choice, not an imbalance');
});

test('several named plans survive saving and a backup round trip', () => {
  const a = app();
  a.customAdd('squat'); a.customSet(0, 'sets', 4);
  a.S.customs.push({ id: 'c9', name: '  Ноги дома  ', items: [{ id: 'goblet', reps: '10-12' }, { id: 'nope' }, { id: 'goblet' }] });
  a.S.custom = 'c9'; a.ensureCustoms(a.S);
  assert.deepEqual(plain(a.S.customs.map(c => [c.name, c.items])), [['Мой план', [{ id: 'squat', sets: 4 }]], ['Ноги дома', [{ id: 'goblet', reps: '10–12' }]]]);
  const backup = plain(a.m.get('backupObject()'));
  assert.deepEqual(backup.settings.customs, plain(a.S.customs), 'custom plans go into the full backup');
  assert.deepEqual(backup.settings.fav, plain(a.S.fav), 'and favourites too');
  a.S.customs = []; a.S.fav = []; a.m.get('restoreBackup')(JSON.parse(JSON.stringify(backup))); a.ensureCustoms(a.S);
  assert.deepEqual(plain(a.S.customs.map(c => c.name)), ['Мой план', 'Ноги дома'], 'restored from the backup');
  a.S.customs = 'broken'; a.S.custom = 'zzz'; a.ensureCustoms(a.S);
  assert.equal(a.S.customs.length, 1); assert.equal(a.S.custom, a.S.customs[0].id, 'damaged data falls back to one empty plan');
});
