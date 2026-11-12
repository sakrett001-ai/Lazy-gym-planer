'use strict';
/* Вес переносится на следующие подходы (13-log.js: carriedKg, carryKgBox, logKgInput; 14-workout-mode.js: workoutFill).
   Вписали вес в подход или отметили его — у следующих неотмеченных подходов с пустым полем подсказка становится этим
   весом, отметка без ввода записывает его. Вписанное и отмеченное не трогается, свой вес подхода в плане (пирамида,
   сброс) не перетирается, Л/П — по своей стороне, повторы не переносятся; после перерисовки и в режиме тренировки — то же
   правило. Таблица — в JSDOM, обработчики вызываются те же, что у событий; в браузере — tools/ui-check.mjs. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));

/* свой план: жим гантелей (две гантели, «×2»), тяга гантели одной рукой (Л/П), жим штанги пирамидой по плану,
   жим гантелей с одним весом на все подходы, подтягивания (доп. вес) */
const ITEMS = [{ id: 'dbbench', sets: 4 }, { id: 'dbrow', sets: 3 }, { id: 'bbbench', sets: 4, kg: [60, 60, 70, 50] }, { id: 'dbpress', sets: 3, kg: [20] }, { id: 'pullup', sets: 3 }];
function app({ lr = {}, today = {} } = {}) {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; startRest=()=>{}; LOG.mode="local";');
  const a = m.get('({S,LOG,buildPlan,logRows,logBlock,carriedKg,carryKgBox,logKgInput,tickSet,renderLogBox,todaySession,suggest,workoutFill,PLACE_DEFAULTS,ensurePlaces,ensureCustoms})');
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'custom', format: 'classic', goal: 'mass', level: 'mid', groups: ['chest', 'back'], fav: [], lr, customs: [{ id: 't', name: 'Т', items: ITEMS.map(x => ({ ...x })) }], custom: 't' });
  a.ensureCustoms(a.S);
  a.LOG.data = {};
  for (const [id, s] of Object.entries(today)) a.todaySession(id, true).s = s;
  m.get('plan = buildPlan()');
  a.plan = m.get('plan'); a.m = m;
  a.item = id => a.plan.items.find(x => x.ex.id === id);
  a.day = id => { const s = a.todaySession(id, false); return s ? plain(s.s) : null; };
  return a;
}
/* таблица записи одного упражнения в документе; type — ввод веса (как событие input), tick — нажатие «Подход выполнен» */
function mount(a, id) {
  const d = new JSDOM('<!doctype html><body></body>').window.document;
  d.body.innerHTML = `<article class="card" data-ex="${id}">${a.logBlock(a.item(id))}</article>`;
  const box = d.querySelector('.c-log');
  const field = (f, k, side) => box.querySelector(`.lt-r[data-k="${k}"] [data-f="${f}"]${side ? `[data-side="${side}"]` : ':not([data-side])'}`);
  const kg = (k, side) => field('kg', k, side), reps = (k, side) => field('reps', k, side);
  return {
    box, kg, reps,
    ph: (k, side) => kg(k, side).placeholder,
    phs: side => [...box.querySelectorAll('.lt-r')].map(r => kg(+r.dataset.k, side).placeholder),
    type: (k, v, side) => { const i = kg(k, side); i.value = v; a.logKgInput(i); },
    tick: k => a.tickSet(box.querySelector(`[data-tick][data-k="${k}"]`)),
    x2: () => box.querySelector('.lt-x2 b').textContent,
  };
}
const ph = (html, k, side) => { const m = html.match(new RegExp(`id="kg-[^"]+-${k}${side ? '-' + side : ''}"[^>]*placeholder="([^"]*)"`)); return m ? m[1] : null; };

test('a weight typed in a set becomes the hint of the next sets; ticking them without typing logs it', () => {
  const a = app(), t = mount(a, 'dbbench');
  assert.deepEqual(t.phs(), ['', '', '', ''], 'a new exercise without a planned weight: no hint');
  t.type(0, '40');
  assert.deepEqual(t.phs().slice(1), ['40', '40', '40'], 'sets 2–4 show 40');
  for (const k of [0, 1, 2]) { t.reps(k).value = '10'; t.tick(k); }
  assert.deepEqual(a.day('dbbench'), [[40, 10], [40, 10], [40, 10]], 'sets 2 and 3 are logged with 40 without typing');
  assert.equal(t.kg(1).value, '40', 'the ticked row shows what was logged');
  /* другой вес вписывается как раньше и дальше переносится уже он */
  t.type(3, '42,5'); t.reps(3).value = '8'; t.tick(3);
  assert.deepEqual(a.day('dbbench')[3], [42.5, 8]);
});

test('ticking a set carries its weight; unticking takes it back', () => {
  const a = app(), t = mount(a, 'dbbench');
  t.kg(1).value = '36'; t.reps(1).value = '10'; /* без события ввода: перенос — по отметке */
  assert.equal(t.ph(2), '');
  t.tick(1);
  assert.deepEqual([t.ph(0), t.ph(2), t.ph(3)], ['', '36', '36'], 'the sets after the ticked one show 36, the one before is untouched');
  t.reps(2).value = '9'; t.tick(2);
  assert.deepEqual(a.day('dbbench'), [null, [36, 10], [36, 9]]);
  t.tick(2); /* снять: строка пустая, подсказка — снова из подхода выше */
  assert.deepEqual(a.day('dbbench'), [null, [36, 10]]);
  assert.equal(t.kg(2).value, '');
  assert.deepEqual([t.ph(2), t.ph(3)], ['36', '36']);
  t.tick(1);
  assert.equal(a.day('dbbench'), null);
  assert.deepEqual(t.phs(), ['', '', '', ''], 'nothing logged or typed above: the hint is back to the plan’s (none)');
});

test('typed values and ticked sets are not touched; the nearest weight above wins', () => {
  const a = app(), t = mount(a, 'dbbench');
  t.type(1, '38'); t.reps(1).value = '10'; t.tick(1);
  t.type(2, '45');
  t.type(0, '40');
  assert.equal(t.kg(1).value, '38', 'the ticked set keeps its weight');
  assert.equal(t.kg(2).value, '45', 'the typed weight stays');
  assert.deepEqual(a.day('dbbench'), [null, [38, 10]], 'the log does not change');
  assert.equal(t.ph(3), '45', 'set 4 follows the nearest set above with a weight');
  t.type(2, '');
  assert.equal(t.ph(2), '38', 'the typed weight is erased — the hint comes from the ticked set above');
  assert.equal(t.ph(3), '38');
  t.type(0, '');
  assert.equal(t.ph(0), '', 'the first set has nothing above it');
});

test('pyramid and drop set: a set with its own planned weight keeps it; equal planned weights carry', () => {
  const a = app(), t = mount(a, 'bbbench');
  assert.deepEqual(t.phs(), ['60', '60', '70', '50'], 'the planned weights');
  t.type(0, '62,5');
  assert.deepEqual(t.phs(), ['60', '62,5', '70', '50'], 'set 2 has the same planned weight — carried; sets 3 and 4 have their own');
  t.reps(2).value = '5'; t.tick(2);
  assert.deepEqual(a.day('bbbench'), [null, null, [70, 5]], 'set 3 logs its planned 70');
  assert.equal(t.ph(3), '50', 'the drop set keeps its planned 50 after the heavier set');
  /* один вес на все подходы — переносится вписанный */
  const p = mount(a, 'dbpress');
  assert.deepEqual(p.phs(), ['20', '20', '20']);
  p.type(0, '22');
  assert.deepEqual(p.phs().slice(1), ['22', '22']);
});

test('«Л/П отдельно»: each side carries its own weight', () => {
  const a = app({ lr: { dbrow: true } }), t = mount(a, 'dbrow');
  assert.ok(t.box.querySelector('.lt-r.lt-lr'), 'the table is in left/right mode');
  t.type(0, '30', 'l'); t.type(0, '28', 'r');
  assert.deepEqual(t.phs('l').slice(1), ['30', '30'], 'left → left');
  assert.deepEqual(t.phs('r').slice(1), ['28', '28'], 'right → right');
  for (const s of ['l', 'r']) t.reps(0, s).value = '10';
  t.tick(0);
  for (const s of ['l', 'r']) t.reps(1, s).value = '9';
  t.tick(1);
  assert.deepEqual(a.day('dbrow')[1], [28, 9, null, { l: [30, 9], r: [28, 9] }], 'set 2 logs both sides with their carried weights');
});

test('reps are not carried; a bodyweight exercise carries its extra weight', () => {
  const a = app(), t = mount(a, 'dbbench');
  const before = t.reps(1).placeholder;
  t.reps(0).value = '12'; t.type(0, '40');
  assert.equal(t.reps(1).placeholder, before, 'the reps hint stays the plan’s range');
  const u = mount(a, 'pullup');
  assert.deepEqual(u.phs(), ['—', '—', '—'], 'no extra weight yet');
  u.type(0, '10');
  assert.deepEqual(u.phs().slice(1), ['10', '10']);
  u.type(0, '');
  assert.deepEqual(u.phs(), ['—', '—', '—'], 'erased — back to «—»');
});

test('after re-rendering: the hint is the weight of the last set ticked today above it', () => {
  const a = app({ today: { dbbench: [[40, 10], null, [42, 8]], bbbench: [[62.5, 5]], dbrow: [[28, 10, null, { l: [30, 10], r: [28, 10] }]], pullup: [[null, 8]] }, lr: { dbrow: true } });
  const html = id => a.logRows(a.item(id)).html;
  assert.deepEqual([0, 1, 2, 3].map(k => ph(html('dbbench'), k)), ['', '40', '40', '42']);
  assert.match(html('dbbench'), /id="kg-dbbench-3"[^>]*data-ph=""/, 'data-ph keeps the hint without the carry');
  assert.deepEqual([0, 1, 2, 3].map(k => ph(html('bbbench'), k)), ['60', '62,5', '70', '50'], 'the pyramid is kept after re-rendering too');
  assert.deepEqual([1, 2].map(k => [ph(html('dbrow'), k, 'l'), ph(html('dbrow'), k, 'r')]), [['30', '28'], ['30', '28']], 'left/right by side');
  assert.deepEqual([1, 2].map(k => ph(html('pullup'), k)), ['—', '—'], 'a set logged without extra weight carries nothing');
  /* перерисовка с введённым, но не отмеченным: введённое на месте и переносится */
  const t = mount(a, 'dbpress');
  t.kg(1).value = '22';
  a.renderLogBox(t.box, a.item('dbpress'));
  assert.equal(t.kg(1).value, '22', 'the typed weight survives re-rendering');
  assert.deepEqual([t.ph(0), t.ph(2)], ['20', '22'], 'and carries to the next set; the set above keeps the plan’s 20');
});

test('«×2 = …» under the table follows the carried weight', () => {
  const a = app(), t = mount(a, 'dbbench');
  t.type(0, '20');
  assert.equal(t.x2(), '×2 = 40 кг');
  t.type(2, '22');
  assert.equal(t.x2(), '×2 = 44 кг');
  t.type(2, '');
  assert.equal(t.x2(), '×2 = 40 кг', 'erased — the carried 20 kg, not an empty hint');
});

test('the workout screen uses the same rule', () => {
  const a = app({ today: { dbbench: [[40, 10]], dbpress: [[22, 10]], bbbench: [[62.5, 5], [62.5, 5]], dbrow: [[28, 10, null, { l: [30, 10], r: [28, 10] }]] } });
  const html = fs.readFileSync(path.join(__dirname, '../src/body.html'), 'utf8');
  const d = new JSDOM(`<!doctype html><html><head>${html}</html>`).window.document;
  a.m.get('(d => { globalThis.document = d; })')(d);
  const fill = (id, k) => {
    const it = a.item(id), sg = a.suggest(it), s = { it, k, n: it.rx.sets };
    a.m.get('(s => { workout = {queue:[s], index:0, drafts:{}}; })')(s);
    a.workoutFill(s, sg, sg.prev?.s[k]);
    return { kg: d.querySelector('#wv-kg').value, reps: d.querySelector('#wv-reps').value, l: d.querySelector('#wv-kg-l').value, r: d.querySelector('#wv-kg-r').value };
  };
  assert.deepEqual(fill('dbbench', 1), { kg: '40', reps: '', l: '40', r: '40' }, 'the weight of set 1, reps are not carried');
  assert.equal(fill('dbpress', 1).kg, '22', 'one planned weight for all sets: the logged 22 is carried, as in the card');
  assert.equal(fill('bbbench', 1).kg, '62,5');
  assert.equal(fill('bbbench', 2).kg, '70', 'a set with its own planned weight keeps it');
  a.S.lr = { dbrow: true };
  const lr = fill('dbrow', 1);
  assert.deepEqual([lr.l, lr.r], ['30', '28'], 'left/right by side');
});
