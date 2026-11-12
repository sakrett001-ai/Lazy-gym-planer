'use strict';
/* Число подходов в карточке: «− N подходов +» под таблицей записи. Убирается только последний подход, минимум один;
   записанное в первых подходах остаётся; заполненный подход — только после подтверждения в его строке.
   Поведение кнопок, фокус и Esc в браузере — tools/ui-check.mjs. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
function app() {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  const a = m.get(`({S,LOG,buildPlan,logRows,logRowCount,growSets,dropLastSet,setArm,todaySession,PLACE_DEFAULTS,ensurePlaces,ensureCustoms,ensureFold})`);
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'single', format: 'classic', goal: 'mass', level: 'mid', count: 5, groups: ['chest', 'back', 'shoulders'], seed: 3, fold: null });
  a.ensureCustoms(a.S); a.ensureFold(a.S);
  a.m = m;
  return a;
}
const rows = html => (html.match(/class="lt-r[ "]/g) || []).length;
const today = (a, id) => { const s = a.todaySession(id, false); return s ? plain(s) : null; };

test('the set count under the table: «−», number of sets, «+»; «−» is off at one set', () => {
  const a = app(), it = a.buildPlan().items[0], n = it.rx.sets;
  const html = a.logRows(it).html;
  assert.equal(rows(html), n);
  assert.match(html, /<div class="lt-sets" role="group" aria-label="Число подходов">/);
  assert(html.includes(`data-delset="${it.ex.id}" aria-label="Убрать подход ${n}">−</button>`), 'the minus names the set it removes');
  assert(html.includes(`<span class="lt-sn">${n} подход`), 'the number of sets is visible');
  assert(html.includes(`data-addset="${it.ex.id}" aria-label="Добавить подход">+</button>`));
  assert(!/\+ подход/.test(html), 'the old link is gone');
  it.rx.sets = 1;
  assert.match(a.logRows(it).html, /data-delset="[^"]+" aria-label="Убрать подход 1" disabled>/, 'one set: nothing to remove');
});

test('add a set, remove it: the first sets keep their data, plan and log agree', () => {
  const a = app(), it = a.buildPlan().items[0], id = it.ex.id, n = it.rx.sets;
  a.LOG.data = {};
  const s = a.todaySession(id, true); s.s = [[40, 10], [40, 9]]; s.target = n;
  assert.equal(a.growSets(it), n, 'the new row is the last one');
  assert.equal(a.logRowCount(it), n + 1); assert.equal(it.rx.sets, n + 1);
  assert.equal(rows(a.logRows(it).html), n + 1);
  assert.deepEqual(plain(a.dropLastSet(it)), { k: n, changed: false }, 'an empty row: the day entry does not change');
  assert.equal(a.logRowCount(it), n); assert.equal(it.rx.sets, n);
  assert.deepEqual(today(a, id).s, [[40, 10], [40, 9]], 'the first sets are untouched');
  /* убрать до двух: записанные подходы на месте */
  while (a.logRowCount(it) > 2) a.dropLastSet(it);
  assert.deepEqual(today(a, id).s, [[40, 10], [40, 9]]);
  assert.equal(today(a, id).target, 2, 'the entry\'s planned number of sets follows the plan');
});

test('remove a logged last set: only that set goes; at least one set stays', () => {
  const a = app(), it = a.buildPlan().items[0], id = it.ex.id;
  a.LOG.data = {}; it.rx.sets = 3;
  const s = a.todaySession(id, true); s.s = [[40, 10], [40, 9], [40, 8]]; s.target = 3;
  assert.deepEqual(plain(a.dropLastSet(it)), { k: 2, changed: true });
  assert.deepEqual(today(a, id).s, [[40, 10], [40, 9]]); assert.equal(today(a, id).target, 2);
  assert.equal(a.logRowCount(it), 2);
  a.dropLastSet(it);
  assert.deepEqual(today(a, id).s, [[40, 10]]);
  assert.deepEqual(plain(a.dropLastSet(it)), { k: -1, changed: false }, 'the last remaining set is not removed');
  assert.deepEqual(today(a, id).s, [[40, 10]]); assert.equal(it.rx.sets, 1);
  /* единственный подход дня — пустой хвост после записанного не оставляет пустую запись */
  it.rx.sets = 2; a.LOG.data = {}; a.todaySession(id, true).s = [null, [30, 8]];
  a.dropLastSet(it);
  assert(!a.todaySession(id, false) && !a.LOG.data[id], 'nothing logged left: the day entry is removed');
});

test('a logged row asks in place: the confirmation is rendered in the last row and survives re-rendering', () => {
  const a = app(), it = a.buildPlan().items[0], id = it.ex.id;
  a.LOG.data = {}; it.rx.sets = 3;
  a.todaySession(id, true).s = [[40, 10], [40, 9], [40, 8]];
  a.setArm[id] = 2;
  const html = a.logRows(it).html, last = html.slice(html.indexOf('data-k="2"'));
  assert.match(html, /class="lt-r done lt-arm" data-k="2"/, 'the last row is highlighted');
  assert(last.includes('Подход 3 записан. Убрать вместе с записью?'), 'it says what is lost');
  assert(/data-delyes="[^"]+">Убрать<\/button><button type="button" class="lt-cfn" data-delno="[^"]+">Оставить<\/button>/.test(last));
  assert.match(html, /role="group" aria-labelledby="lt-cf-/);
  assert.equal((html.match(/class="lt-cf"/g) || []).length, 1, 'only one row asks');
  a.todaySession(id, false).s.length = 2; it.rx.sets = 2; a.logRows(it);
  assert.equal(a.setArm[id], undefined, 'the row is gone — the question too');
  a.setArm[id] = 0; it.rx.sets = 3;
  assert(!a.logRows(it).html.includes('class="lt-cf"'), 'only the last row can be removed');
});

test('a circuit counts rounds', () => {
  const a = app(); a.S.format = 'circuit';
  const it = a.buildPlan().items[0], n = it.rounds;
  const html = a.logRows(it).html;
  assert(html.includes('aria-label="Число кругов"') && html.includes(`aria-label="Убрать круг ${n}"`) && html.includes('aria-label="Добавить круг"'));
  a.growSets(it); assert.equal(it.rounds, n + 1);
  a.dropLastSet(it); assert.equal(it.rounds, n); assert.equal(a.logRowCount(it), n);
});
