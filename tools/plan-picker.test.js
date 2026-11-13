'use strict';
/* «+ В свой план» в атласе и в разборе: список своих планов под кнопкой и «+ Новый план». Упражнение попадает в выбранный
   план, открытый план, режим и вид не меняются; «уже в плане» и «полон» не добавляют; последний выбранный план — первым.
   Поиск по названиям: «ё» и «е» равны, окончания слов не важны (весь поиск — tools/search.test.js). Поведение в браузере
   (раскрытие, фокус, Esc) — tools/ui-check.mjs. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
function app() {
  const m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  const a = m.get('({S,EX,EXI,CUSTOM_MAX,PLACE_DEFAULTS,ensurePlaces,ensureCustoms,customOf,customAdd,customAddTo,customAddMsg,cpPickOrder,cpPickHtml,cpKeepHtml,newCustomPlan,searchFold,searchMatcher,gallery,galleryList})');
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { view: 'atlas', mode: 'single', format: 'classic', goal: 'mass', level: 'mid', groups: ['chest', 'back', 'shoulders'], fav: [], cpLast: null,
    customs: [{ id: 'up', name: 'Верх', items: [{ id: 'bbbench' }] }, { id: 'low', name: 'Низ', group: 'Сила', items: [{ id: 'squat' }] }, { id: 'band', name: 'Дома с эспандером', items: [] }],
    custom: 'up' });
  a.ensureCustoms(a.S);
  a.m = m;
  return a;
}
const plan = (a, id) => a.S.customs.find(c => c.id === id);
const items = (a, id) => plain(plan(a, id).items.map(it => it.id));
const where = a => plain([a.S.custom, a.S.mode, a.S.view]);
const saved = a => JSON.parse(a.m.get('localStorage.getItem(STORE)'));

test('the chosen plan gets the exercise; the open plan, mode and view stay as they were', () => {
  const a = app();
  const r = a.customAddTo('latpull', 'low');
  assert.deepEqual(plain({ added: r.added, created: r.created, plan: r.plan.id }), { added: true, created: false, plan: 'low' });
  assert.deepEqual(items(a, 'low'), ['squat', 'latpull']);
  assert.deepEqual(items(a, 'up'), ['bbbench'], 'the open plan is untouched');
  assert.deepEqual(where(a), ['up', 'single', 'atlas']);
  assert.equal(a.customAddMsg(r), 'Добавлено в план: Низ.');
  assert.deepEqual(saved(a).customs.find(c => c.id === 'low').items.map(it => it.id), ['squat', 'latpull'], 'saved at once');
  /* и из своего плана, открытого на другом виде (атлас при режиме «Свой план»): режим остаётся */
  Object.assign(a.S, { mode: 'custom', view: 'atlas' });
  a.customAddTo('dbcurl', 'band');
  assert.deepEqual(items(a, 'band'), ['dbcurl']);
  assert.deepEqual(where(a), ['up', 'custom', 'atlas']);
  assert.equal(a.customAddTo('nope', 'low'), null, 'an unknown exercise adds nothing');
  assert.equal(a.customAddTo('dbcurl', 'gone'), null, 'a removed plan adds nothing');
});

test('«already in plan» and a full plan do not add', () => {
  const a = app();
  const r = a.customAddTo('bbbench', 'up');
  assert.deepEqual(plain({ added: r.added, has: r.has }), { added: false, has: true });
  assert.deepEqual(items(a, 'up'), ['bbbench'], 'no duplicate');
  assert.equal(a.customAddMsg(r), 'Уже в плане: Верх.');
  assert.equal(a.S.cpLast, null, 'nothing added — nothing remembered');
  const ids = a.EX.map(ex => ex.id).filter(id => id !== 'squat' && id !== 'dbcurl').slice(0, a.CUSTOM_MAX - 1);
  for (const id of ids) a.customAddTo(id, 'low');
  assert.equal(plan(a, 'low').items.length, a.CUSTOM_MAX);
  const f = a.customAddTo('dbcurl', 'low');
  assert.deepEqual(plain({ added: f.added, full: f.full }), { added: false, full: true });
  assert.equal(plan(a, 'low').items.length, a.CUSTOM_MAX);
  assert.equal(a.customAddMsg(f), `План «Низ» полон: в нём уже ${a.CUSTOM_MAX} упражнений.`);
  /* в списке: «✓ уже в плане» и «полон» — пункт не добавляет, но остаётся в порядке фокуса */
  const html = a.cpPickHtml('squat', 'cp-pick-at');
  assert.match(html, /data-cp-to="low" aria-disabled="true"><span class="cp-pick-n"><b>Низ<\/b><small>Сила · 12 упражнений<\/small><\/span><span class="cp-pick-st in">✓ уже в плане<\/span>/);
  assert.match(a.cpPickHtml('dbcurl', 'cp-pick-at'), /data-cp-to="low" aria-disabled="true">.*<span class="cp-pick-st">полон<\/span>/);
  assert.doesNotMatch(html, /\sdisabled[\s>]/, 'items stay focusable');
});

test('«+ New plan»: «План N», settings as in the parameters, exercise inside, not opened, remembered first', () => {
  const a = app();
  Object.assign(a.S, { goal: 'strength', format: 'superset', level: 'adv' });
  a.S.gen = { goal: 'cut', format: 'circuit', level: 'beg' }; /* вне своего плана S.gen может отставать — берутся параметры на экране */
  const r = a.customAddTo('dbcurl', null);
  assert.equal(r.created, true); assert.equal(r.added, true);
  assert.deepEqual(plain({ name: r.plan.name, items: r.plan.items, goal: r.plan.goal, format: r.plan.format, level: r.plan.level, group: r.plan.group }),
    { name: 'План 4', items: [{ id: 'dbcurl' }], goal: 'strength', format: 'superset', level: 'adv' }, 'outside a custom plan: no program');
  assert.equal(a.S.customs.at(-1), r.plan);
  assert.deepEqual(where(a), ['up', 'single', 'atlas'], 'the new plan is not opened');
  assert.equal(a.S.cpLast, r.plan.id);
  assert.equal(a.customAddMsg(r), 'Создан план «План 4», упражнение добавлено.');
  /* номер — первый свободный */
  a.S.customs.push({ id: 'p5', name: 'План 5', items: [] });
  assert.equal(a.newCustomPlan().name, 'План 6');
  /* в своём плане — как «+ План»: настройки и программа открытого плана */
  Object.assign(a.S, { mode: 'custom', custom: 'low' }); a.m.get('loadPlanSettings()');
  Object.assign(plan(a, 'low'), { goal: 'gentle', format: 'classic', level: 'beg' }); a.m.get('loadPlanSettings()');
  const c = a.customAddTo('legext', null).plan;
  assert.deepEqual(plain([c.goal, c.format, c.level, c.group]), ['gentle', 'classic', 'beg', 'Сила']);
  assert.deepEqual(where(a), ['low', 'custom', 'atlas']);
});

test('the last chosen plan comes first; without it — the open plan; a removed one is forgotten on load', () => {
  const a = app();
  const order = () => plain(a.cpPickOrder().map(p => p.id));
  assert.deepEqual(order(), ['up', 'low', 'band'], 'nothing chosen yet: the open plan first');
  a.S.custom = 'band';
  assert.deepEqual(order(), ['band', 'up', 'low']);
  a.customAddTo('dbcurl', 'low');
  assert.deepEqual(order(), ['low', 'up', 'band']);
  assert.equal(saved(a).cpLast, 'low', 'remembered across restarts');
  const html = a.cpPickHtml('dbcurl', 'cp-pick-mv');
  assert(html.indexOf('data-cp-to="low"') < html.indexOf('data-cp-to="up"'));
  assert.match(html, /^<p class="cp-pick-h" id="cp-pick-mv-h">В какой план добавить<\/p>/, 'the list is labelled');
  assert.match(html, /<button type="button" class="place place-add cp-pick-i" data-cp-to="">\+ Новый план<\/button>$/, '«+ New plan» is the last row');
  a.ensureCustoms(a.S); assert.equal(a.S.cpLast, 'low');
  a.S.customs = a.S.customs.filter(c => c.id !== 'low'); a.ensureCustoms(a.S);
  assert.equal(a.S.cpLast, null, 'a removed plan is forgotten');
  a.S.cpLast = { evil: 1 }; a.ensureCustoms(a.S); assert.equal(a.S.cpLast, null, 'damaged value is dropped');
});

test('the button: always a list of plans — on the custom plan page too (nothing is added silently)', () => {
  const a = app();
  const at = a.cpKeepHtml('dbcurl', 'at');
  assert.match(at, /data-cp-add="dbcurl" aria-expanded="false" aria-controls="cp-pick-at">\+ В свой план<\/button><div class="cp-pick" id="cp-pick-at" role="group" aria-labelledby="cp-pick-at-h" hidden><\/div>/);
  assert.match(at, /<p class="cp-msg" role="status" hidden>/);
  /* замечание 12 тестера: из разбора поверх своего плана упражнение уходило молча в открытый план */
  Object.assign(a.S, { view: 'plan', mode: 'custom' });
  assert.match(a.cpKeepHtml('dbcurl', 'mv'), /data-cp-add="dbcurl" aria-expanded="false" aria-controls="cp-pick-mv"/, 'on the custom plan page — the same list');
  assert.equal(a.cpPickOrder()[0].id, 'up', 'the open plan comes first there');
  /* «+ В план» в «Добавить упражнение» своего плана — сразу в открытый план */
  assert.equal(a.customAdd('dbcurl'), true);
  assert.deepEqual(items(a, 'up'), ['bbbench', 'dbcurl'], 'the open plan gets it, as before');
});
test('adding into the open custom plan from the atlas repaints its page when the window closes, not at once', () => {
  const a = app();
  Object.assign(a.S, { view: 'plan', mode: 'custom', custom: 'up' });
  a.m.get('cpStale = false; var repaints = 0; customRerender = () => { repaints++; };');
  a.m.get(`cpAfterAdd(customAddTo('dbcurl', 'low'))`);
  assert.equal(a.m.get('cpStale'), false, 'another plan — nothing to repaint');
  a.m.get(`cpAfterAdd(customAddTo('dbcurl', 'up'))`);
  assert.equal(a.m.get('cpStale'), true);
  assert.equal(a.m.get('repaints'), 0, 'the atlas stays open: no repaint yet');
  a.m.get('cpFlush(); cpFlush();');
  assert.equal(a.m.get('repaints'), 1, 'one repaint when the window closes');
});

test('search: «ё» equals «е», case and word endings do not matter (searchMatcher — one name; the whole search — tools/search.test.js)', () => {
  const a = app();
  assert.equal(a.searchFold('ёлка'), a.searchFold('елка'));
  assert.equal(a.searchFold('ЁЛКА'), 'елка');
  assert.equal(a.searchFold('йод'), 'йод', '«й» stays «й»');
  const names = q => plain(a.EX.filter(ex => a.searchMatcher(q)(ex.name)).map(ex => ex.id));
  for (const q of ['отжимание', 'Отжимания', 'отжимания', 'ОТЖИМАНИЕ']) assert(names(q).includes('pushup') && names(q).includes('dip'), q + ' finds push-ups');
  assert(names('отжимание').every(id => /отжимани/i.test(a.EXI[id].name)));
  assert.deepEqual(names('жим лежа'), names('жим лёжа'));
  assert(names('жим лежа').includes('bbbench'));
  assert.deepEqual(names('мертвый жук'), ['deadbug']);
  assert.deepEqual(names('тяга верхнего'), names('Тяга верхнего блока'));
  assert(names('тяги').includes('latpull'), 'another ending of the same word');
  assert.equal(names('').length, a.EX.length, 'an empty query shows everything');
  assert.equal(names('телепорт').length, 0);
  /* витрина атласа (#mv-gq) */
  a.gallery.q = 'отжимание'; a.gallery.kind = 'all'; a.gallery.here = false;
  const list = plain(a.galleryList().map(ex => ex.id));
  assert(list.includes('pushup') && list.includes('wallpush'));
  a.gallery.q = 'лежа'; assert(plain(a.galleryList().map(ex => ex.id)).includes('bbbench'));
  a.gallery.q = '';
});
