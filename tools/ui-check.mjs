/* Проверка поведения интерфейса в браузере: сворачивание блоков на телефоне и компьютере.
   node tools/ui-check.mjs [--file dist/lazy-gym-planner-offline-ru.html] — нужен собранный dist/ (npm run build). */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const fileArg = process.argv.indexOf('--file'), file = fileArg > 0 ? path.resolve(process.argv[fileArg + 1]) : path.join(root, 'dist/lazy-gym-planner-offline-ru.html');
if (!fs.existsSync(file)) { console.error('Нет собранного файла — сначала npm run build'); process.exit(2); }

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const fails = [], errors = [];
const check = (ok, what) => { if (!ok) fails.push(what); };
async function open(width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + file); await page.waitForTimeout(500);
  await page.evaluate(() => {
    const fake = () => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); return { svg, camera: 'side', at() {}, setTrace() {}, setVectors() {}, setJoints() {}, setStress() {}, setMuscles() {}, setRegion() {}, dispose() {} }; };
    window.buildFigure = fake; window.createMotionFigure = fake;
    Object.assign(S, { view: 'plan', mode: 'single', format: 'classic', goal: 'mass', level: 'mid', groups: ['chest', 'back', 'shoulders'], count: 5, seed: 3, fold: null });
    LOG.data = {}; regen();
  });
  return page;
}
/* checkVisibility учитывает и закрытый <details>: его содержимое в Chromium сохраняет размеры, но не рисуется */
const shown = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0 && e.offsetHeight > 0 && (!e.checkVisibility || e.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })); }, sel);

/* телефон */
const page = await open(360);
check(await page.evaluate(() => S.fold.cards === 'compact' && !S.fold.setup && !S.fold.load), 'по умолчанию: карточки компактно, параметры и нагрузка раскрыты');
check(await shown(page, '#f-goal') && await shown(page, '#setup-fold-end'), 'параметры раскрыты, внизу кнопка «Свернуть параметры»');
await page.click('#setup-fold-end');
check(await page.evaluate(() => document.querySelector('.setup').classList.contains('folded') && S.fold.setup === true), 'кнопка снизу сворачивает параметры');
check(!(await shown(page, '#f-goal')) && await shown(page, '.sb-chips'), 'свёрнуто: поля скрыты, видна строка выбранного');
check(await page.evaluate(() => document.querySelector('#setup-bar').getBoundingClientRect().top >= -1), 'после сворачивания снизу строка параметров на экране');
await page.click('.sb-chip[data-sgo="#f-goal"]'); await page.waitForTimeout(100);
check(await page.evaluate(() => !S.fold.setup && Math.abs(document.querySelector('#f-goal').closest('.field').getBoundingClientRect().top) < 120), 'нажатие на «цель» раскрывает параметры и ведёт к цели');
await page.click('#setup-bar [data-sfold]');
await page.evaluate(() => regen());
check(await page.evaluate(() => document.querySelector('.setup').classList.contains('folded')), 'свёрнутые параметры остаются свёрнутыми после пересборки');

await page.click('[data-lfold]');
check(await page.evaluate(() => S.fold.load && document.querySelector('.p-load').classList.contains('folded')), 'нагрузка по мышцам сворачивается');
check(!(await shown(page, '.p-load .p-map')), 'свёрнутая нагрузка без схемы');
await page.evaluate(() => regen());
check(await page.evaluate(() => document.querySelector('.p-load.folded [data-lfold]').getAttribute('aria-expanded') === 'false'), 'нагрузка остаётся свёрнутой после пересборки');

const c0 = '.card:nth-child(1)';
check(!(await shown(page, `${c0} .lt-fold`)) && await shown(page, `${c0} .sug`), 'компактно: таблица скрыта, подсказка по весу на виду');
check(!(await shown(page, `${c0} .c-map`)), 'компактно: мышцы одной строкой');
await page.click(`${c0} [data-cfold="log"]`);
check(await shown(page, `${c0} .lt-fold`), 'запись раскрывается в одной карточке');
check(!(await shown(page, '.card:nth-child(2) .lt-fold')), 'соседняя карточка остаётся свёрнутой');
await page.fill(`${c0} .lt-r[data-k="0"] [data-f="reps"]`, '8');
await page.fill(`${c0} .lt-r[data-k="0"] [data-f="kg"]`, '40').catch(() => {});
await page.click(`${c0} [data-tick][data-k="0"]`); await page.waitForTimeout(100);
check(await page.evaluate(s => /^1 из \d+$/.test(document.querySelector(s + ' .lt-tog .cg-s').textContent), c0), 'счётчик записанных подходов обновляется сразу');
await page.click(`${c0} [data-hist]`);
await page.evaluate(() => logRefresh());
check(await page.evaluate(s => { const c = document.querySelector(s); return c.classList.contains('open-log') && c.querySelector('[data-cfold="log"]').getAttribute('aria-expanded') === 'true' && c.querySelector('[data-hist]').getAttribute('aria-expanded') === 'true'; }, c0), 'после перерисовки записи блок открыт, история знает своё состояние');
await page.evaluate(() => regen());
check(await page.evaluate(s => document.querySelector(s).classList.contains('open-log'), c0), 'раскрытая вручную карточка не сворачивается при пересборке');

await page.click('[data-cards="full"]');
check(await page.evaluate(() => S.fold.cards === 'full' && [...document.querySelectorAll('.card')].every(c => c.classList.contains('open-log') && c.classList.contains('open-mus'))), '«Подробно» раскрывает все карточки');
check(await shown(page, `${c0} .c-map`) && await shown(page, '.card:nth-child(2) .lt-fold'), '«Подробно»: схема мышц и таблицы на виду');
await page.click('[data-cards="compact"]');
check(await page.evaluate(() => [...document.querySelectorAll('.card')].every(c => !c.classList.contains('open-log'))), '«Компактно» сворачивает все, ручные раскрытия сбрасываются');

/* хваты: переключатель в карточке меняет упражнение в той же карточке; в своём плане — записывается в план */
await page.evaluate(() => { S.fold.setup = true; S.customs = [{ id: 'v1', name: 'Хваты', items: [{ id: 'pullup', sets: 4 }, { id: 'dbcurl' }] }]; S.custom = 'v1'; ensureCustoms(S); openCustom('v1'); regen(); });
await page.click('.card[data-slot="0"] [data-variant="chinup"]');
check(await page.evaluate(() => customOf().items[0].id === 'chinup' && customOf().items[0].sets === 4 && document.querySelector('.card[data-slot="0"]').dataset.ex === 'chinup'
  && document.querySelector('.card[data-slot="0"] [data-variant="chinup"]').getAttribute('aria-pressed') === 'true'), 'хват в своём плане: упражнение сменилось, подходы остались');
await page.evaluate(() => { S.mode = 'single'; S.groups = ['back', 'biceps']; S.count = 5; S.seed = 3; regen(); });
const gripCard = await page.evaluate(() => { const b = document.querySelector('.card [data-variant][aria-pressed="false"]'); return b ? [b.closest('.card').dataset.slot, b.dataset.variant] : null; });
check(gripCard, 'в собранной тренировке на спину и бицепс есть карточка с хватами');
if (gripCard) {
  await page.click(`.card[data-slot="${gripCard[0]}"] [data-variant="${gripCard[1]}"]`);
  check(await page.evaluate(([slot, id]) => document.querySelector(`.card[data-slot="${slot}"]`).dataset.ex === id, gripCard), 'хват в собранной тренировке: замена в той же карточке');
}
/* бережный режим: отметка сустава сразу перестраивает план, плашка с правилом боли сворачивается и помнит это */
await page.evaluate(() => { S.mode = 'single'; S.groups = ['quads', 'glutes', 'hams', 'calves']; S.fold.setup = false; regen(); });
await page.click('[data-protect="knees"]');
check(await page.evaluate(() => S.protect.includes('knees') && plan.items.every(it => !stressIdsOf(it.ex).some(r => ['knee', 'kneeOpen', 'landing'].includes(r)))), 'отметка «Колени» убирает из плана нагрузку на колени');
check(await shown(page, '.gentle-box p'), 'плашка бережного режима раскрыта');
await page.click('.gentle-box summary'); await page.waitForTimeout(100); /* событие toggle приходит следующей задачей */
check(await page.evaluate(() => S.fold.gentle === true), 'свёрнутая плашка запоминается');
await page.evaluate(() => regen());
check(!(await shown(page, '.gentle-box p')), 'и остаётся свёрнутой после пересборки');
await page.click('[data-protect="knees"]');
check(await page.evaluate(() => !S.protect.length && !document.querySelector('.gentle-box')), 'снятая отметка убирает плашку');
await page.evaluate(() => { S.mode = 'program'; regen(); });
check(await page.evaluate(() => { const d = document.querySelector('details.rule'); return !!d && !d.open; }), 'программа: правило прибавки свёрнуто');
await page.close();

/* атлас движений: витрина с фильтром «Чем работать», миниатюра открывает разбор, «← Все упражнения» возвращает */
{
  const g = await open(1280);
  await g.click('#motion-atlas'); await g.waitForTimeout(150);
  check(await shown(g, '#mv-gallery') && !(await shown(g, '#mv-detail')), 'кнопка атласа открывает витрину, а не разбор');
  check(await g.evaluate(() => document.querySelectorAll('.mv-tile').length === EX.length && document.querySelectorAll('.mv-gsec').length === GROUPS.filter(x => EX.some(e => e.g === x.id)).length), 'на витрине все упражнения по группам мышц');
  await g.click('[data-gallery-kind="band"]');
  check(await g.evaluate(() => { const t = [...document.querySelectorAll('.mv-tile')]; return t.length > 0 && t.every(b => workKind(EXI[b.dataset.galleryOpen]) === 'band') && document.querySelector('[data-gallery-kind="band"]').getAttribute('aria-pressed') === 'true'; }), 'фильтр «Резинки» оставляет только упражнения с резинкой');
  await g.click('[data-gallery-kind="all"]');
  await g.evaluate(() => { S.place = 'home'; ensurePlaces(S); }); await g.click('#mv-ghere');
  check(await g.evaluate(() => { const E = effEquip(S.equip), t = [...document.querySelectorAll('.mv-tile')]; return t.length > 0 && t.length < EX.length && t.every(b => available(EXI[b.dataset.galleryOpen], E)); }), '«только то, что есть в месте» скрывает недоступное');
  await g.click('#mv-ghere');
  await g.fill('#mv-gq', 'тяга верхнего');
  check(await g.evaluate(() => { const t = [...document.querySelectorAll('.mv-tile')].map(b => b.dataset.galleryOpen); return t.includes('latpull') && t.every(id => EXI[id].name.toLowerCase().includes('тяга верхнего')) && document.activeElement.id === 'mv-gq'; }), 'поиск по названию, курсор остаётся в поле');
  await g.click('[data-gallery-open="latpull"]'); await g.waitForTimeout(100);
  check(await shown(g, '#mv-detail') && !(await shown(g, '#mv-gallery')) && await g.evaluate(() => $('#mv-exercise').value === 'latpull' && detailMotion?.it.ex.id === 'latpull'), 'миниатюра открывает разбор этого упражнения');
  await g.click('#mv-back'); await g.waitForTimeout(100);
  check(await shown(g, '#mv-gallery') && await g.evaluate(() => document.activeElement?.dataset.galleryOpen === 'latpull' && !detailMotion), '«← Все упражнения» возвращает к витрине на то же упражнение');
  await g.keyboard.press('Escape'); await g.waitForTimeout(100);
  check(await g.evaluate(() => !$('#motion-view').open && !gallery.on), 'Esc закрывает атлас');
  await g.evaluate(() => { S.place = 'gym'; ensurePlaces(S); regen(); });
  await g.evaluate(() => openMotion(0)); await g.waitForTimeout(100);
  check(await shown(g, '#mv-detail') && !(await shown(g, '#mv-gallery')), '«Увеличить» в карточке плана открывает сразу разбор');
  /* вид фигуры: по умолчанию «Анатомия» (кости и мышцы в почти невидимом силуэте). Без объёмной графики доступен только
     манекен. У объёмной фигуры анатомия грузит кости и мышцы и передаёт их одним вызовом, «Скелет» — только кости,
     «Манекен» — ничего; выбор запоминается, подпись короткая (источники — в «О демонстрациях») */
  check(await g.evaluate(() => motionPrefs.view === 'anatomy' && $('[data-mv-figure="anatomy"]').disabled && $('[data-mv-figure="skeleton"]').disabled
    && $('[data-mv-figure="mannequin"]').getAttribute('aria-pressed') === 'true' && $('#mv-figure-note').hidden), 'без объёмной графики — только манекен');
  const fig = await g.evaluate(async () => {
    const calls = []; const f = detailMotion.f; f.setLayers = (b, a) => calls.push({ bones: b ? b.bones.length : 0, muscles: a ? a.muscles.muscles.length : 0, level: a?.level || null });
    applyFigureView(); for (let i = 0; i < 60 && !calls.some(c => c.muscles); i++) await new Promise(r => setTimeout(r, 50));
    const pressed = () => [...document.querySelectorAll('[data-mv-figure]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.mvFigure).join();
    const anat = { last: calls.at(-1), note: $('#mv-figure-note').textContent, pressed: pressed(), pri: detailMotion.it.ex.pri, busy: $('#mv-figure').hasAttribute('aria-busy') };
    $('[data-mv-figure="skeleton"]').click(); const skel = { last: calls.at(-1), note: $('#mv-figure-note').textContent, pressed: pressed(), pref: motionPrefs.view };
    $('[data-mv-figure="mannequin"]').click(); const man = { last: calls.at(-1), hidden: $('#mv-figure-note').hidden, pressed: pressed(), pref: motionPrefs.view, saved: JSON.parse(localStorage.getItem('podhod.motion.v2')).view };
    $('[data-mv-figure="anatomy"]').click();
    return { anat, skel, man, back: { last: calls.at(-1), pref: motionPrefs.view }, thanks: $('#mv-detail').textContent };
  });
  check(fig.anat.last?.bones === 102 && fig.anat.last.muscles === 518 && fig.anat.pri.every(m => fig.anat.last.level[m] === 1) && fig.anat.pressed === 'anatomy' && !fig.anat.busy && /О демонстрациях/.test(fig.anat.note) && fig.anat.note.length < 260,
    '«Анатомия» по умолчанию: 518 мышц на 102 костях, основные мышцы выделены, короткая подпись');
  check(fig.skel.last?.bones === 102 && fig.skel.last.muscles === 0 && fig.skel.pressed === 'skeleton' && fig.skel.pref === 'skeleton' && /MyoSim/.test(fig.skel.note), '«Скелет» — только кости');
  check(fig.man.last?.bones === 0 && fig.man.last.muscles === 0 && fig.man.hidden && fig.man.pressed === 'mannequin' && fig.man.saved === 'mannequin', '«Манекен» убирает кости и мышцы, выбор запоминается');
  check(fig.back.last?.muscles === 518 && fig.back.pref === 'anatomy', 'возврат к «Анатомии»');
  check(/Укорачиваясь, мышца утолщается/.test(fig.thanks) && /DAS3/.test(fig.thanks), 'источники костей и мышц — в «О демонстрациях»');
  await g.close();
}

/* порядок упражнений: ↑ ↓ на карточке переставляют упражнение (в суперсетах — пару), порядок переживает перезапуск
   приложения и сбрасывается сменой параметров; в своём плане — свои кнопки */
{
  const o = await open(390), ids = () => o.evaluate(() => [...document.querySelectorAll('.card')].map(c => c.dataset.ex).join());
  const a = await ids();
  await o.click('.card:nth-child(1) [data-move][data-d="1"]'); await o.waitForTimeout(100);
  const b = await ids(), A = a.split(','), B = b.split(',');
  check(A[0] === B[1] && A[1] === B[0] && A.slice(2).join() === B.slice(2).join() && await o.evaluate(() => plan.blocks[0].items.map(it => it.label).join() === '1,2,3,4,5'),
    '↓ на первой карточке меняет местами первое и второе упражнения, номера пересчитаны');
  check(await o.evaluate(() => document.querySelector('.card [data-move][data-d="-1"]').disabled && [...document.querySelectorAll('.card')].at(-1).querySelector('[data-move][data-d="1"]').disabled), 'у крайних карточек лишняя стрелка выключена');
  await o.reload(); await o.waitForTimeout(400);
  check(await ids() === b, 'порядок сохраняется после перезапуска приложения');
  await o.evaluate(() => { S.count = 6; regen(); S.count = 5; regen(); });
  check(await ids() === a, 'смена параметров собирает план заново — порядок по правилам');
  await o.evaluate(() => { S.format = 'superset'; regen(); });
  const pairs = () => o.evaluate(() => plan.blocks.map(b => b.items.map(it => it.ex.id).join('+')).join(' '));
  const p1 = (await pairs()).split(' '); await o.click('.block .card [data-move][data-d="1"]'); await o.waitForTimeout(100);
  const p2 = (await pairs()).split(' ');
  check(p2[0] === p1[1] && p2[1] === p1[0], 'в суперсетах ↑ ↓ переставляют пару целиком');
  await o.evaluate(() => { Object.assign(S, { mode: 'custom', format: 'classic' }); regen(); });
  check(await o.evaluate(() => !document.querySelector('[data-move]')), 'в своём плане — только свои кнопки порядка');
  /* таймер отдыха: сигнал ставится на конец отдыха, ±15 переносит, «Готово» снимает; звук выключается и это запоминается */
  await o.evaluate(() => { Object.assign(S, { mode: 'single' }); regen(); startRest(60, 'Отдых'); });
  const st = () => o.evaluate(() => RestAlarm.state());
  let r = await st(); check(r.end > Date.now() + 55e3 && (r.audio === null || r.queued > 0), 'в конце отдыха запланирован сигнал');
  await o.click('#t-plus'); r = await st(); check(r.end > Date.now() + 70e3, '+15 переносит сигнал');
  await o.click('#t-sound'); check(await o.evaluate(() => !RestAlarm.on && localStorage.getItem('podhod.restSound') === 'off' && RestAlarm.state().queued === 0 && $('#t-sound').getAttribute('aria-pressed') === 'false'), 'кнопка выключает звук и запоминает выбор');
  await o.click('#t-sound'); await o.click('#t-skip'); r = await st(); check(r.end === 0 && r.queued === 0, '«Готово» снимает сигнал');
  /* векторы движения по умолчанию выключены; «включено» прежних версий выключается один раз */
  check(await o.evaluate(() => motionPrefs.vectors === false && !$('#mv-vectors').checked), 'векторы движения по умолчанию выключены');
  /* прежние флажки «Скелет»/«Анатомия мышц» один раз заменяются видом «Анатомия» */
  await o.evaluate(() => localStorage.setItem('podhod.motion.v2', JSON.stringify({ speed: 1, skeleton: true, anatomy: false, vectorsV: 2 }))); await o.reload(); await o.waitForTimeout(400);
  check(await o.evaluate(() => motionPrefs.view === 'anatomy' && motionPrefs.viewV === 1 && !('skeleton' in motionPrefs) && +motionPrefs.speed === 1), 'настройки прежних версий переходят на вид «Анатомия», скорость сохраняется');
  await o.close();
}

/* компьютер: параметры в боковой колонке не сворачиваются */
const desk = await open(1280);
await desk.evaluate(() => { S.fold.setup = true; regen(); });
check(await shown(desk, '#f-goal') && !(await shown(desk, '#setup-bar')) && !(await shown(desk, '#setup-fold-end')), 'на компьютере параметры всегда раскрыты');
await desk.close();

await browser.close();
if (errors.length) console.error('Ошибки страницы:\n' + [...new Set(errors)].slice(0, 10).join('\n'));
if (fails.length || errors.length) { console.error(`Проверка интерфейса: ${fails.length} замечаний`); for (const f of fails) console.error('  ✗ ' + f); process.exit(1); }
console.log('Интерфейс: сворачивание блоков, хваты, бережный режим, порядок упражнений, сигнал отдыха, витрина атласа, виды фигуры «Анатомия», «Скелет» и «Манекен» работают на телефоне и компьютере.');
