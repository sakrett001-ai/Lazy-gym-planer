'use strict';
/* Поиск упражнений (src/js/11i-search.js): атлас движений и «Добавить упражнение» своего плана. Запросы — из отчётов тестеров
   (4.94.0): все, что давали 0 результатов у Дмитрия (п. 7, русская версия) и у Alex (п. 6, английская), — в обеих версиях:
   нужное упражнение в первых трёх. «Жим», «тяга», «присед» — без мусора (список допустимого ниже), раскладка, опечатки
   (Дамерау — Левенштейн: 1 правка для слов из 4–7 букв, 2 — от 8), группы мышц, порядок, ближайшие по написанию.
   Модель приложения на языке сборки с данными поиска, как в build.js, — tools/lang-model.js. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const {loadApp} = require('./lang-model');
const {sourceNames, searchData} = require('../i18n/search-data');
const root = path.resolve(__dirname, '..');

const apps = {ru:loadApp({lang:'ru'}), en:loadApp({lang:'en'})};
for (const a of Object.values(apps)) a.context.performance = performance;
const find = (lang, q) => apps[lang].json(`(()=>{searchMemo=null;const r=searchExercises(${JSON.stringify(q)});return {mode:r.mode,as:r.as,ids:r.list.map(e=>e.id),near:r.near.map(e=>e.id)};})()`);
const top3 = (lang, q) => find(lang, q).ids.slice(0, 3);

test('names of the other language and synonyms reach the app: exercises, groups and muscles as at run time', () => {
  const js = fs.readdirSync(path.join(root, 'src/js')).filter(f => /^\d.*\.js$/.test(f)).sort().map(f => fs.readFileSync(path.join(root, 'src/js', f), 'utf8')).join('\n');
  const src = sourceNames(js);
  for (const lang of ['ru', 'en']) {
    const ex = apps[lang].json('EX.map(e=>[e.id,[e.name,...Object.values(e.nameV||{})]])');
    assert.deepEqual(Object.keys(src.ex), ex.map(e => e[0]), 'the same exercises, in the same order');
    const other = apps[lang === 'ru' ? 'en' : 'ru'].json('Object.fromEntries(EX.map(e=>[e.id,[e.name,...Object.values(e.nameV||{})]]))');
    const data = apps[lang].json('PODHOD_SEARCH');
    for (const [id] of ex) assert.deepEqual(data.alt.ex[id], other[id], `${lang}: ${id} — names of the other version`);
    assert.deepEqual(data.alt.groups.calves, [lang === 'ru' ? 'Calves' : 'Икры']);
    assert.deepEqual(data.alt.muscles.lats, [lang === 'ru' ? 'Lats' : 'Широчайшие']);
  }
  /* синонимы — только у существующих упражнений, групп и мышц; без повторов названия */
  const syn = JSON.parse(fs.readFileSync(path.join(root, 'src/data/search.json'), 'utf8'));
  const ids = new Set(Object.keys(src.ex));
  for (const [id, v] of Object.entries(syn.exercises)) {
    assert(ids.has(id), 'no such exercise: ' + id);
    for (const s of [...(v.ru || []), ...(v.en || [])]) assert(!src.ex[id].concat(apps.en.json(`[EXI.${id}.name]`)).some(n => n.toLowerCase() === s.toLowerCase()), `${id}: «${s}» repeats the name`);
    for (const s of v.ru || []) assert(/[а-яё]/i.test(s), `${id}: «${s}» is not Russian`);
    for (const s of v.en || []) assert(!/[а-яё]/i.test(s), `${id}: «${s}» is not English`);
  }
  for (const id of Object.keys(syn.groups)) assert(src.groups[id], 'no such group: ' + id);
  for (const id of Object.keys(syn.muscles)) assert(src.muscles[id], 'no such muscle: ' + id);
  assert.equal(syn.layout.en.length, syn.layout.ru.length, 'one key — one letter in each layout');
  /* данные поиска одинаковы в сборке и в модели проверок */
  assert.deepEqual(apps.ru.json('PODHOD_SEARCH'), JSON.parse(JSON.stringify(searchData('ru', js, JSON.parse(fs.readFileSync(path.join(root, 'i18n/en.json'), 'utf8'))))));
});

/* запросы с 0 результатов в 4.94.0 → ожидаемое упражнение (первые три); в обеих версиях */
const FOUND = {
  /* Дмитрий, п. 7 (русская версия) */
  'bench press':'bbbench', 'deadlift':'deadlift', 'squat':'squat', 'pull up':'pullup', 'lat pulldown':'latpull', 'face pull':'facepull',
  'hip thrust':'hipthrust', 'ohp':'ohp', 'присидания':'squat', 'тяга ганетли':'dbrow', 'бенч':'bbbench', 'армейский жим':'ohp',
  'хаммер':'hammer', 'пек дек':'pecdeck', 'фейс пул':'facepull', 'икры':'calfraise',
  /* Alex, п. 6 (английская версия) */
  'press-up':'pushup', 'RDL':'rdl', 'OHP':'ohp', 'military press':'ohp', 'skull crusher':'skull', 'rear delt fly':'reversefly', 'dumbell':'dbbench',
  /* и то, что находилось, — по-прежнему */
  'жим лёжа':'bbbench', 'жим лежа':'bbbench', 'Жим штанги лёжа':'bbbench', 'подтягивания':'pullup', 'румынская':'rdl', 'гиперэкстензия':'hyper',
  'french press':'skull', 'т-гриф':'tbarrow', 'молотки':'hammer', 'бабочка':'pecdeck', 'farmers walk':'farmer', 'chin up':'chinup', 'cable row':'cablerow'
};
for (const lang of ['ru', 'en']) test(`${lang}: the queries testers typed in vain find the exercise in the first three`, () => {
  for (const [q, id] of Object.entries(FOUND)) { const r = top3(lang, q); assert(r.includes(id), `${lang} «${q}» → ${id}: ${r.join(', ')}`); }
});

/* Широкие запросы — без мусора: всё найденное — из списка допустимого (названия с этим словом, его синонимы); опечатки
   не подмешиваются (ступень «опечатки» — только когда точного нет) */
const ALLOWED = {
  'жим':['bbbench', 'dbbench', 'dbincline', 'smithincline', 'dbpress', 'ohp', 'kbpress', 'kbfloorpress', 'legpress', 'legpresshigh', 'legpresslow', 'inclinebb', 'declinebb',
    'closegrip', 'arnold', 'bandfloorpress', 'chestpressm', 'smithbench', 'shoulderpressm', 'smithohp', 'skull', 'lpcalf' /* «…для жима ногами» */, 'ohext' /* «французский жим сидя» */],
  'тяга':['bbrow', 'dbrow', 'latpull', 'latpullv', 'latpulluh', 'cablerow', 'cablerowwide', 'bandrow', 'facepull', 'kbrow', 'bandfacepull', 'bandlatpull', 'towelrow', 'tablerow',
    'tbarrow', 'chestrowdb', 'leverrowm', 'deadlift', 'kbdeadlift', 'kbsllift', 'rdl', 'sllift'],
  'присед':['squat', 'sissysquat', 'airsquat', 'smithsquat', 'jumpsquat', 'pistolbox', 'hacksquat', 'kbfrontsquat', 'goblet', 'lunge' /* «Сплит-приседания» */, 'bulgarian' /* «болгарские сплит-приседания» */],
  'squat':['squat', 'kbfrontsquat', 'bulgarian', 'goblet', 'airsquat', 'lunge', 'smithsquat', 'sissysquat', 'pistolbox', 'hacksquat', 'jumpsquat']
};
test('«жим», «тяга», «присед» (and «squat»): only what is allowed, no look-alikes; the main one first', () => {
  for (const lang of ['ru', 'en']) for (const [q, allowed] of Object.entries(ALLOWED)) {
    const r = find(lang, q);
    assert.equal(r.mode, 'exact', `${lang} «${q}»`);
    const junk = r.ids.filter(id => !allowed.includes(id));
    assert.deepEqual(junk, [], `${lang} «${q}»: not expected`);
    assert(r.ids.length >= allowed.length - 2, `${lang} «${q}»: ${r.ids.length} of ${allowed.length}`);
  }
  assert.equal(find('ru', 'жим').ids[0], 'bbbench', 'equal matches — in catalog order: the bench press first');
  assert.equal(find('ru', 'присед').ids[0], 'squat');
  assert.equal(find('en', 'squat').ids[0], 'squat');
  assert.equal(find('ru', 'подтягивания').ids[0], 'pullup', 'the whole name first');
  assert.deepEqual(find('ru', 'лежа').ids.slice(0, 2), ['bbbench', 'dbbench']);
  /* «становая» — не «постановкой», «lats» — не «lateral» */
  assert.deepEqual(find('ru', 'становая').ids, ['deadlift', 'kbdeadlift']);
  assert(!find('en', 'lats').ids.some(id => ['latraise', 'bandlatraise', 'cablelat', 'sidelunge'].includes(id)));
});

test('a full tile name finds its exercise, in both languages', () => {
  assert.equal(find('ru', 'Румынская тяга со штангой').ids[0], 'rdl');
  assert.equal(find('ru', 'Румынская тяга с гантелями').ids[0], 'rdl');
  assert.equal(find('en', 'Barbell Romanian deadlift').ids[0], 'rdl');
  assert.equal(find('en', 'Kettlebell goblet squat').ids[0], 'goblet');
  assert.equal(find('ru', 'Прогулка фермера с гирями').ids[0], 'farmer');
});

test('wrong keyboard layout: ghbctl → присед, ыйгфе → squat, иутср → bench', () => {
  for (const lang of ['ru', 'en']) {
    const a = find(lang, 'ghbctl');
    assert.deepEqual([a.mode, a.as, a.ids[0]], ['layout', 'присед', 'squat'], lang);
    const b = find(lang, 'ыйгфе');
    assert.deepEqual([b.mode, b.as, b.ids[0]], ['layout', 'squat', 'squat'], lang);
    assert.equal(find(lang, 'иутср').ids[0], 'bbbench', lang);
  }
  /* правильная раскладка не переключается */
  assert.equal(find('ru', 'присед').mode, 'exact');
  assert.equal(find('en', 'bench').mode, 'exact');
});

test('typos: 1 edit for 4–7 letters, 2 for 8 and more; exact and prefix matches rank above', () => {
  const ok = (lang, q, id, mode = 'typo') => { const r = find(lang, q); assert(r.mode === mode && r.ids.slice(0, 3).includes(id), `${lang} «${q}» → ${id}: ${r.mode} ${r.ids.slice(0, 3)}`); };
  for (const lang of ['ru', 'en']) {
    ok(lang, 'присидания', 'squat');         /* 10 букв, 1 правка */
    ok(lang, 'присиданея', 'squat');         /* 10 букв, 2 правки */
    ok(lang, 'тяга ганетли', 'dbrow');       /* перестановка соседних букв */
    ok(lang, 'кросовер', 'cablefly');        /* 8 букв, пропуск */
    ok(lang, 'гиперэкстезия', 'hyper');
    ok(lang, 'шарги', 'shrug');              /* 5 букв, перестановка */
    ok(lang, 'squot', 'squat');
    ok(lang, 'dumbell', 'dbbench');
    ok(lang, 'бенчч', 'bbbench');
  }
  /* сверх допуска — не находится: 2 правки в слове из 5–7 букв, любая — в слове из 3 */
  for (const q of ['шаргм', 'жми', 'бнчч']) assert.equal(find('ru', q).mode, 'none', q);
  /* точное совпадение есть — опечатки не ищутся */
  assert.equal(find('ru', 'тяга').mode, 'exact');
  assert(!find('ru', 'тяга').ids.includes('shrug'));
});

test('muscle groups and muscles: «икры», «calves», «квадрицепс» — the group; «бицепс» is not «бицепс бедра»', () => {
  for (const lang of ['ru', 'en']) {
    const group = g => apps[lang].json(`EX.filter(e=>e.g==='${g}').map(e=>e.id)`).sort();
    for (const [q, g] of [['икры', 'calves'], ['calves', 'calves'], ['квадрицепс', 'quads'], ['quads', 'quads'], ['бицепс бедра', 'hams'], ['hamstrings', 'hams'], ['дельты', 'shoulders'], ['delts', 'shoulders']])
      assert.deepEqual([...find(lang, q).ids].sort(), group(g), `${lang} «${q}» → ${g}`);
    const biceps = find(lang, 'бицепс').ids;
    assert(group('biceps').every(id => biceps.includes(id)), 'all biceps exercises');
    assert(!biceps.some(id => group('hams').includes(id)), 'not the hamstrings');
    /* мышца без своей группы: широчайшие — упражнения, где она основная */
    const lats = find(lang, 'широчайшие').ids;
    assert(lats.includes('latpull') && lats.includes('pullup') && lats.every(id => apps[lang].json(`EXI.${id}.pri`).includes('lats')), lang);
    assert.deepEqual(find(lang, 'упражнения на икры').ids.sort(), group('calves'), 'common words are optional');
  }
});

test('nothing found: close spellings, the empty query shows everything in catalog order', () => {
  const r = find('ru', 'жми');
  assert.equal(r.mode, 'none'); assert(r.near.includes('bbbench'), r.near.join());
  assert.deepEqual(find('ru', 'xyzzy plugh').near, []);
  const all = find('ru', '  ');
  assert.equal(all.mode, 'all'); assert.deepEqual(all.ids, apps.ru.json('EX.map(e=>e.id)'));
});

test('the same search in «Add an exercise» of a custom plan: results, close spellings, «+ Add» to the open plan', () => {
  const a = apps.ru;
  a.get(`(()=>{Object.assign(S,{view:'plan',mode:'custom'});S.customs=[{id:'c1',name:'Низ А',items:[{id:'squat'}]}];S.custom='c1';ensureCustoms(S);openCustom('c1');})()`);
  a.get(`cpQ='бенч'`);
  const html = a.get('customListHtml()');
  assert.match(html, /^<li class="cp-gh">Найдено: 1<\/li><li class="cp-row"><button type="button" class="fav[^>]*data-fav="bbbench"/);
  assert.match(html, /data-cp-add="bbbench" aria-label="Добавить в план: Жим штанги лёжа">\+ В план<\/button>/);
  a.get(`cpQ='присед'`);
  assert.match(a.get('customListHtml()'), /data-cp-open="squat"[\s\S]*?class="cp-addb in" disabled>✓ В плане/, 'already in the plan');
  a.get(`cpQ='жми'`);
  assert.match(a.get('customListHtml()'), /^<li class="cp-none">Ничего не нашлось\. Похожие по написанию: <button type="button" class="link" data-cp-q="Жим штанги лёжа">/);
  a.get(`cpQ='ghbctl'`);
  assert.match(a.get('customListHtml()'), /<small>Показано для «присед» — запрос в другой раскладке клавиатуры\.<\/small>/);
  a.get(`cpQ=''`);
  assert.doesNotMatch(a.get('customListHtml()'), /Найдено/, 'no query — the tabs as before');
});

test('speed: the whole catalog (171 exercises) is searched without a delay at typing', () => {
  const qs = [...Object.keys(FOUND), ...Object.keys(ALLOWED), 'ж', 'жи', 'жим л', 'жим лё', 'ghbctl', 'zzzz', 'xyzzy plugh'];
  const t = apps.ru.json(`(()=>{searchIdx=null;let t0=performance.now();searchIndex();const index=performance.now()-t0;const ms=[];for(const q of ${JSON.stringify(qs)}){searchMemo=null;t0=performance.now();searchExercises(q);ms.push(performance.now()-t0);}ms.sort((a,b)=>a-b);return {index,median:ms[ms.length>>1],max:ms[ms.length-1]};})()`);
  /* обычно: словарь ≈5 мс один раз, запрос ≈0,5 мс, с опечатками ≈3–5 мс, «ничего» ≈8–15 мс (компьютер); запас — на медленную машину */
  assert(t.median < 20 && t.max < 400, JSON.stringify(t));
});
