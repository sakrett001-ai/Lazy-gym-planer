'use strict';
/* Тренировка без случайных потерь (src/js/14a-workout-flow.js, 14-workout-mode.js, 12a-set-timers.js, 12b-rest-alarm.js):
   продолжение тренировки в тот же день и на следующий, «Пропустить», замена в тренировке с сохранением записанных подходов,
   пауза отдыха, сигнал по умолчанию, время тренировки. Без страницы — приложение в vm (как tools/log-sets.test.js); экран,
   «Назад» и снимки — tools/ui-check.mjs. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));

function app() {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  const a = m.get(`({S,LOG,buildPlan,workoutQueue,todayKey,dayKey,swapSet,swapCandidates,PLACE_DEFAULTS,ensurePlaces,ensureCustoms,ensureFold,
    wkNormalize,wkSet,wkSession,wkDaysWith,wkCount,wkFirstOpen,wkResume,wkPlanState,wkMinutes,wkRequeue,wkAddGone,
    restView,restAdjust,restClock,restPauseToggle,restSignals,restSignalMode,RestAlarm,localStorage})`);
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'single', format: 'classic', goal: 'mass', level: 'mid', count: 5, groups: ['chest', 'back', 'shoulders'], seed: 3, fold: null });
  a.ensureCustoms(a.S); a.ensureFold(a.S);
  a.m = m;
  a.plan = () => m.get('plan = buildPlan({swaps:swaps.s || {}, order:swaps.__order?.s})');
  return a;
}
const shift = (a, key, n) => { const [y, mo, d] = key.split('-').map(Number); return a.dayKey(new Date(y, mo - 1, d + n)); };
/* записать подход k упражнения id в день d */
const put = (a, id, k, d, set) => {
  const ss = a.LOG.data[id] || (a.LOG.data[id] = []);
  let s = ss.find(x => x.d === d); if (!s) { s = { d, s: [] }; ss.push(s); ss.sort((p, q) => p.d < q.d ? -1 : 1); }
  while (s.s.length < k) s.s.push(null);
  s.s[k] = set;
};
const saved = (a, o) => a.wkNormalize(o, Date.now(), a.todayKey());
const stampOf = (a, q) => JSON.stringify([a.S.mode, a.S.day, a.S.week, a.S.format, a.S.goal, q.map(x => [x.it.ex.id, x.k, x.n, x.rest, x.it.rx.reps])]);

test('same day: «К плану» after three sets — the plan shows «Продолжить тренировку», the workout resumes where it was', () => {
  const a = app(), p = a.plan(), q = a.workoutQueue(p), today = a.todayKey(), id = q[0].it.ex.id;
  a.LOG.data = {};
  for (const k of [0, 1, 2]) put(a, q[k].it.ex.id, q[k].k, today, [40, 10]);
  const st = saved(a, { stamp: stampOf(a, q), day: today, days: [today], index: 3, spent: 9 * 60000, ended: false, done: 3, total: q.length });
  const w = a.wkPlanState(st, { today, queue: q, data: a.LOG.data });
  assert.deepEqual(plain(w), { kind: 'continue', done: 3, total: q.length }, '«Продолжить тренировку →» и «3 из N подходов»');
  assert.equal(a.wkResume(st, { today, stamp: stampOf(a, q), done: 3 }), 'same');
  const value = s => a.wkSet(a.LOG.data, s.it.ex.id, s.k, [today]);
  assert.equal(a.wkFirstOpen(q, -1, value, []), 3, 'дальше — первый несделанный подход');
  assert.equal(q[0].it.ex.id, id);
  /* закончена или ничего не сделано — «Начать тренировку →» */
  assert.equal(a.wkPlanState({ ...st, ended: true }, { today, queue: q, data: a.LOG.data }).kind, 'start');
  assert.equal(a.wkPlanState(st, { today, queue: q, data: {} }).kind, 'start');
  /* другой план того же дня без его подходов — новая тренировка (время на экране не тянется с утренней) */
  assert.equal(a.wkResume(st, { today, stamp: '[]', done: 0 }), 'new');
  assert.equal(a.wkResume(st, { today, stamp: '[]', done: 2 }), 'same', 'план поменяли (замена в карточке), подходы этой тренировки в нём есть — та же тренировка');
});

test('next day: the unfinished workout is not lost — «Продолжить вчерашнюю» carries yesterday\'s sets, new ones go to today', () => {
  const a = app(), p = a.plan(), q = a.workoutQueue(p), today = a.todayKey(), y = shift(a, today, -1);
  a.LOG.data = {};
  for (const k of [0, 1]) put(a, q[k].it.ex.id, q[k].k, y, [40, 10]);
  const st = saved(a, { stamp: stampOf(a, q), day: y, days: [y], index: 2, spent: 12 * 60000, done: 2, total: q.length });
  const w = a.wkPlanState(st, { today, queue: q, data: a.LOG.data });
  assert.deepEqual(plain(w), { kind: 'ask', day: y, done: 2, total: q.length, can: true }, 'вопрос «Продолжить вчерашнюю / Закончить её»');
  assert.equal(a.wkResume(st, { today, stamp: stampOf(a, q), done: 2 }), 'new', '«Начать тренировку →» мимо вопроса — новая тренировка');
  assert.equal(a.wkResume(st, { today, stamp: stampOf(a, q), cont: true, done: 2 }), 'past', '«Продолжить вчерашнюю»');
  /* продолжили: вчерашние подходы сделаны, новый пишется сегодняшним днём, вчерашняя запись не трогается */
  const days = a.wkDaysWith(st.days, today), value = s => a.wkSet(a.LOG.data, s.it.ex.id, s.k, days);
  assert.deepEqual(plain(days), [y, today]);
  const next = a.wkFirstOpen(q, -1, value, []);
  assert.equal(next, 2);
  put(a, q[next].it.ex.id, q[next].k, today, [40, 9]);
  assert.equal(a.wkCount(q, value).done, 3);
  assert.equal(a.wkSession(a.LOG.data, q[0].it.ex.id, q[0].k, days).d, y, 'правка вчерашнего подхода — во вчерашней записи');
  assert.equal(a.wkSession(a.LOG.data, q[next].it.ex.id, q[next].k, days).d, today, 'новый подход — сегодняшним днём');
  for (const k of [0, 1]) assert.ok(a.LOG.data[q[k].it.ex.id].find(x => x.d === y).s[q[k].k], 'вчерашние подходы на месте');
  /* «Закончить её» — тренировка закрыта, подходы в журнале; план — «Начать тренировку →» */
  assert.equal(a.wkPlanState({ ...st, ended: true }, { today, queue: q, data: a.LOG.data }).kind, 'start');
  /* в нынешнем плане этих упражнений нет — продолжить нельзя, но и молча не пропадает */
  const other = q.map(s => ({ ...s, it: { ...s.it, ex: { ...s.it.ex, id: 'x-' + s.it.ex.id } } }));
  assert.deepEqual(plain(a.wkPlanState(st, { today, queue: other, data: a.LOG.data })), { kind: 'ask', day: y, done: 2, total: q.length, can: false });
  /* позавчерашняя — тоже вопрос */
  assert.equal(a.wkPlanState({ ...st, days: [shift(a, today, -3)] }, { today, queue: q, data: a.LOG.data }).kind, 'ask');
});

test('saved workout of the previous version: the date moves out of the plan stamp; time on screen is kept for today only', () => {
  const a = app(), today = a.todayKey(), now = Date.now();
  const old = a.wkNormalize({ stamp: JSON.stringify([today, 'single', 0, 1, 'classic', 'mass', [['squat', 0, 3, 120, '8–12']]]), index: 1, started: now - 25 * 60000 }, now, today);
  assert.equal(old.day, today); assert.deepEqual(plain(old.days), [today]);
  assert.equal(old.stamp, JSON.stringify(['single', 0, 1, 'classic', 'mass', [['squat', 0, 3, 120, '8–12']]]));
  assert.equal(Math.round(old.spent / 60000), 25);
  const y = shift(a, today, -1), past = a.wkNormalize({ stamp: JSON.stringify([y, 'single']), started: now - 864e5 }, now, today);
  assert.equal(past.day, y); assert.equal(past.spent, 0, 'вчерашняя: время от начала по часам не переносится');
  assert.equal(a.wkNormalize({ stamp: '["single"]' }, now, today), null, 'без даты — не тренировка');
  assert.equal(a.wkNormalize(null, now, today), null);
});

test('«Пропустить»: the exercise is skipped — next open set is the next exercise, nothing is logged, progress counts only what is left', () => {
  const a = app(), p = a.plan(), q = a.workoutQueue(p), today = a.todayKey(), first = q[0].it.ex.id;
  a.LOG.data = {};
  const n0 = q.filter(s => s.it.ex.id === first).length, value = s => a.wkSet(a.LOG.data, s.it.ex.id, s.k, [today]);
  put(a, first, 0, today, [40, 10]);
  const skipped = [first];
  const next = a.wkFirstOpen(q, 0, value, skipped);
  assert.notEqual(q[next].it.ex.id, first, 'дальше — следующее упражнение');
  assert.equal(next, q.findIndex(s => s.it.ex.id !== first));
  assert.deepEqual(plain(a.wkCount(q, value, { skipped })), { done: 1, total: q.length - (n0 - 1) }, 'сделанный подход пропущенного упражнения считается, оставшиеся — нет');
  assert.deepEqual(Object.keys(a.LOG.data), [first], 'пропуск ничего не пишет в журнал');
  assert.equal(a.LOG.data[first][0].s.filter(Boolean).length, 1);
  /* всё пропущено — несделанного нет: итоги */
  assert.equal(a.wkFirstOpen(q, 0, value, [...new Set(q.map(s => s.it.ex.id))]), -1);
});

test('«Заменить» in the workout: the plan and the workout get the new exercise, sets already logged stay in the journal and in the progress', () => {
  const a = app(), p = a.plan(), q = a.workoutQueue(p), today = a.todayKey(), it = q[0].it, from = it.ex.id;
  a.LOG.data = {};
  put(a, from, 0, today, [40, 10]); put(a, from, 1, today, [40, 9]);
  const value = s => a.wkSet(a.LOG.data, s.it.ex.id, s.k, [today]);
  const before = a.wkCount(q, value);
  const to = a.swapCandidates(it.ex, p)[0];
  assert.ok(to, 'есть замена из того же списка, что в карточке плана');
  assert.equal(a.swapSet(it.slot, to.id), true);
  const p2 = a.plan(), q2 = a.workoutQueue(p2);
  assert.ok(p2.items.some(x => x.ex.id === to.id) && !p2.items.some(x => x.ex.id === from), 'в плане — новое упражнение');
  const r = a.wkRequeue(q, q2, { index: 2, last: 1, next: 2 }, { from, name: it.name, value });
  assert.deepEqual(plain(r.gone), { id: from, name: it.name, ks: [0, 1] }, 'записанные подходы прежнего упражнения запомнены');
  assert.equal(r.last, -1, 'последняя запись была у заменённого упражнения');
  assert.deepEqual(plain(a.LOG.data[from][0].s), [[40, 10], [40, 9]], 'в журнале подходы на месте');
  const gone = a.wkAddGone([], r.gone), after = a.wkCount(q2, value, { gone }, (id, k) => a.wkSet(a.LOG.data, id, k, [today]));
  assert.equal(after.done, before.done, 'сделанное не пропало из прогресса');
  assert.equal(after.total, q2.length + 2);
  /* «Вернуть» в плане: прежнее упражнение снова в тренировке — его подходы считаются по очереди, не дважды */
  const back = a.wkCount(q, value, { gone }, (id, k) => a.wkSet(a.LOG.data, id, k, [today]));
  assert.deepEqual(plain(back), plain(before));
  assert.deepEqual(plain(a.wkAddGone(gone, { id: from, name: it.name, ks: [1, 2] })[0].ks), [0, 1, 2]);
});

test('rest pause: time stands still, ±15 s count from the pause, «▶» moves the end by the pause; no pause after zero', () => {
  const a = app(), t0 = 1e9, end = t0 + 90000;
  let r = a.restPauseToggle(end, 0, t0 + 30000);
  assert.deepEqual(plain(r), { end, paused: t0 + 30000 });
  assert.equal(a.restView(r.end, a.restClock(r.paused, t0 + 200000)).text, '1:00', 'на паузе время стоит');
  assert.equal(a.restAdjust(r.end, a.restClock(r.paused, t0 + 200000), 15), end + 15000, '+15 с на паузе');
  r = a.restPauseToggle(end + 15000, r.paused, t0 + 200000);
  assert.deepEqual(plain(r), { end: end + 15000 + 170000, paused: 0 }, '«▶»: конец сдвинут на длину паузы');
  assert.equal(a.restView(r.end, t0 + 200000).text, '1:15', 'после паузы — с того же места');
  assert.deepEqual(plain(a.restPauseToggle(end, 0, end + 1000)), { end, paused: 0 }, 'после нуля пауза не ставится');
  assert.equal(a.restClock(0, 5), 5);
});

test('rest signal: once by default for a new user; a choice and an existing user\'s old default are kept', () => {
  const a = app();
  assert.equal(a.restSignalMode(null, false), 'once');
  assert.equal(a.restSignalMode(null, true), 'persist', 'уже пользовался приложением — прежний «настойчиво»');
  assert.equal(a.restSignalMode('persist', false), 'persist');
  assert.equal(a.restSignalMode('once', true), 'once');
  assert.equal(a.restSignalMode('loud', false), 'once');
  assert.equal(a.RestAlarm.mode, 'once', 'новый человек (пустое хранилище) — один раз');
  assert.equal(a.localStorage.getItem('podhod.restSignal'), 'once', 'выбор по умолчанию записан: со второго запуска новый не станет «старым»');
  assert.deepEqual(plain(a.restSignals(1e6, { from: 1e6 - 90000 })), [{ at: 1e6, kind: 'end' }], 'по умолчанию — один сигнал на нуле');
});

test('workout time: only while the workout screen is open', () => {
  const a = app();
  assert.equal(a.wkMinutes(0, 1000, 1000 + 59000), 0);
  assert.equal(a.wkMinutes(0, 1000, 1000 + 61000), 1);
  assert.equal(a.wkMinutes(12 * 60000, 0, 9e12), 12, 'экран закрыт — время стоит');
  assert.equal(a.wkMinutes(12 * 60000, 1000, 1000 + 3 * 60000), 15);
});
