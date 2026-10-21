/* Проверка поведения интерфейса в браузере: сворачивание блоков на телефоне и компьютере.
   node tools/ui-check.mjs [--file dist/lazy-gym-planner-offline-ru.html] — нужен собранный dist/ (npm run build). */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const fileArg = process.argv.indexOf('--file'), file = fileArg > 0 ? path.resolve(process.argv[fileArg + 1]) : path.join(root, 'dist/lazy-gym-planner-offline-ru.html');
if (!fs.existsSync(file)) { console.error('Нет собранного файла — сначала npm run build'); process.exit(2); }

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const fails = [], errors = [];
const check = (ok, what) => { if (!ok) fails.push(what); };
/* рисунки движений — заглушки: проверяется поведение и раскладка, а не фигура */
const fakeFigures = page => page.evaluate(() => {
  const fake = () => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fig'); return { svg, camera: 'side', at() {}, setTrace() {}, setVectors() {}, setJoints() {}, setStress() {}, setMuscles() {}, setRegion() {}, dispose() {} }; };
  window.buildFigure = fake; window.createMotionFigure = fake;
  /* карточки «Анатомии» (общий рендерер карточек) — тоже без настоящей графики; их проверка — отдельным блоком ниже */
  if (window.GymVolume) window.GymVolume.cards = () => null;
});
async function open(width, height = 800) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + file); await page.waitForTimeout(500);
  await fakeFigures(page);
  await page.evaluate(() => {
    Object.assign(S, { view: 'plan', mode: 'single', format: 'classic', goal: 'mass', level: 'mid', groups: ['chest', 'back', 'shoulders'], count: 5, seed: 3, fold: null });
    LOG.data = {}; regen();
  });
  return page;
}
/* прямоугольник элемента простым объектом */
const rect = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }, sel);
const apart = (a, b) => !!a && !!b && (a.r <= b.l + .5 || b.r <= a.l + .5 || a.b <= b.t + .5 || b.b <= a.t + .5);
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
  check(fig.anat.last?.bones === 109 && fig.anat.last.muscles === 530 && fig.anat.pri.every(m => fig.anat.last.level[m] === 1) && fig.anat.pressed === 'anatomy' && !fig.anat.busy && /О демонстрациях/.test(fig.anat.note) && fig.anat.note.length < 260,
    '«Анатомия» по умолчанию: 530 мышц на 109 костях (102 — MyoSim, 7 — гортань и трахея), основные мышцы выделены, короткая подпись');
  check(fig.skel.last?.bones === 109 && fig.skel.last.muscles === 0 && fig.skel.pressed === 'skeleton' && fig.skel.pref === 'skeleton' && /MyoSim/.test(fig.skel.note), '«Скелет» — только кости');
  check(fig.man.last?.bones === 0 && fig.man.last.muscles === 0 && fig.man.hidden && fig.man.pressed === 'mannequin' && fig.man.saved === 'mannequin', '«Манекен» убирает кости и мышцы, выбор запоминается');
  check(fig.back.last?.muscles === 530 && fig.back.pref === 'anatomy', 'возврат к «Анатомии»');
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

/* телефон (разбор 4.23.1, У2–У4, В1–В3): шапка в две строки, при повторном запуске план на первом экране; в разборе
   сцена сразу под заголовком, ракурсы одной строкой под ней; серый переключатель нагрузки на суставы с подписью;
   подписи карточки не закрывают рисунок, фаза — в одну строку; месяцы журнала не наезжают; счётчик оборудования целиком */
{
  const p = await open(390, 844);
  const head = await p.evaluate(() => {
    const q = s => { const r = document.querySelector(s).getBoundingClientRect(); return { t: r.top, b: r.bottom }; };
    return { top: q('.top'), logo: q('.logo'), atlas: q('#motion-atlas'), views: q('#views'), lang: q('.lang'), tag: getComputedStyle(document.querySelector('.tag')).display };
  });
  check(head.top.b - head.top.t <= 120 && head.tag === 'none' && head.atlas.t < head.logo.b && head.views.t >= head.atlas.b - 1 && head.lang.t < head.views.b && head.lang.b > head.views.t,
    'телефон: шапка в две строки — логотип и атлас, под ними разделы и язык; подпись скрыта');
  check(await p.evaluate(() => !S.fold.setup), 'первый запуск: параметры раскрыты');
  await p.reload(); await p.waitForTimeout(500); await fakeFigures(p);
  check(await p.evaluate(() => S.fold.setup === true && document.querySelector('.setup').classList.contains('folded') && document.querySelector('#plan').getBoundingClientRect().top < innerHeight * .6),
    'после первого плана параметры на телефоне свёрнуты, план — на первом экране');
  /* разбор: сцена под заголовком, ракурсы под сценой одной строкой, выбор упражнения — после управления движением */
  await p.evaluate(() => openMotionItem(previewItem('latpull'))); await p.waitForTimeout(150);
  const mv = await p.evaluate(() => {
    const q = s => { const r = document.querySelector(s).getBoundingClientRect(); return { t: r.top, b: r.bottom, h: r.height, w: r.width }; };
    return { head: q('.mv-head'), stage: q('#mv-stage'), cams: q('#mv-cameras'), toggles: q('.mv-toggles'), select: q('.mv-select'), tools: q('.mv-tools'),
      rows: new Set([...document.querySelectorAll('#mv-cameras button')].map(b => Math.round(b.getBoundingClientRect().top))).size,
      fit: document.querySelector('#mv-cameras').scrollWidth <= document.querySelector('#mv-cameras').clientWidth + 1, n: document.querySelectorAll('#mv-cameras button').length,
      back: !!document.querySelector('.mv-head #mv-back')?.offsetHeight, vh: innerHeight };
  });
  check(mv.stage.t - mv.head.b < 24 && mv.stage.t < 200, 'разбор на телефоне: сцена сразу под заголовком');
  check(mv.stage.h >= mv.vh * .5 && mv.stage.h > 320, 'разбор на телефоне: сцена выше прежних 320 px — кадр «Сверху под углом» крупнее');
  check(mv.n === 5 && mv.rows === 1 && mv.fit && mv.cams.t >= mv.stage.b, 'ракурсы — одной строкой под сценой, все пять видны');
  check(mv.select.t > mv.toggles.b && mv.tools.t > mv.select.t && mv.back, 'выбор упражнения и избранное — после управления движением, «← Все упражнения» — в шапке');
  check(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'разбор на телефоне без прокрутки вбок');
  /* нагрузка на суставы: без меток переключатель выключен и подписан, с метками — подписи нет */
  const stress = await p.evaluate(() => {
    const none = EX.find(e => !jointStress(e).rules.length), some = EX.find(e => jointStress(e).rules.length);
    const said = id => { const n = $(id); return !!n && !n.hidden && n.offsetParent !== null; };
    selectMotion(previewItem(none.id));
    const a = { off: $('#mv-stress-toggle').disabled, note: said('#mv-stress-none'), desc: $('#mv-stress-toggle').getAttribute('aria-describedby') === 'mv-stress-none' };
    selectMotion(previewItem(some.id));
    const b = { off: $('#mv-stress-toggle').disabled, note: said('#mv-stress-none') };
    configureStressPanel('wv', { it: previewItem(none.id) }); const w1 = !!$('#wv-stress-none') && !$('#wv-stress-none').hidden;
    configureStressPanel('wv', { it: previewItem(some.id) }); const w2 = !!$('#wv-stress-none') && $('#wv-stress-none').hidden;
    return { a, b, w: w1 && w2 };
  });
  check(stress.a.off && stress.a.note && stress.a.desc && !stress.b.off && !stress.b.note && stress.w, 'нагрузка на суставы: «в этом упражнении меток нет» — только у упражнений без меток (разбор и тренировка)');
  await p.click('#mv-back'); await p.waitForTimeout(100);
  check(!(await shown(p, '#mv-back')) && await shown(p, '#mv-close'), 'на витрине «← Все упражнения» скрыта');
  await p.evaluate(() => closeMotion());
  /* журнал: подписи месяцев не наезжают и не обрезаются ни в один день года */
  const months = await p.evaluate(() => {
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:0;top:0;width:300px;visibility:hidden'; document.body.append(host);
    const bad = [];
    for (let i = 0; i < 366; i++) {
      const d = new Date(2026, 0, 1 + i, 12); host.innerHTML = heatmap(d);
      const svg = host.querySelector('svg'), W = svg.viewBox.baseVal.width;
      const ls = [...svg.querySelectorAll('text.hm-l[y="10"]')].map(t => t.getBBox()).sort((a, b) => a.x - b.x);
      if (ls.length < 2 || ls.some((b, k) => b.x < 0 || b.x + b.width > W + .5 || (k && ls[k - 1].x + ls[k - 1].width + 2 > b.x))) bad.push(d.toDateString());
    }
    host.remove(); return bad;
  });
  check(!months.length, `журнал: подписи месяцев не наезжают друг на друга (${months.slice(0, 3).join(', ')})`);
  await p.close();

  for (const w of [360, 390]) {
    const c = await open(w, 800);
    await c.evaluate(() => document.querySelector('.card').scrollIntoView()); await c.waitForTimeout(150);
    const fig = await rect(c, '.card .illus > .fig'), view = await rect(c, '.card .illus-v'), zoom = await rect(c, '.card .illus-zoom');
    check(fig && Math.abs(fig.w - fig.h) < 1.5 && apart(fig, view) && apart(fig, zoom), `карточка (${w} px): «Изометрия» и «↗» не лежат на рисунке`);
    const caps = await c.evaluate(() => {
      const cap = document.querySelector('.card .motion-caption'), lh = parseFloat(getComputedStyle(cap).lineHeight), out = [];
      for (const label of ['Рабочая фаза', 'Конечная точка', 'Возврат', 'Исходное положение', 'Опускание', 'Нижняя точка', 'Подъём', 'Верхняя точка']) {
        cap.textContent = label; if (cap.scrollWidth > cap.clientWidth + .5 || cap.getBoundingClientRect().height > lh * 1.5) out.push(label);
      }
      return out;
    });
    check(!caps.length, `карточка (${w} px): фаза в одну строку без обрезки (${caps.join(', ')})`);
    const cnt = await c.evaluate(() => { const e = $('#e-count'), h3 = e.closest('.lbl'); return { h: e.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(h3).lineHeight), text: e.textContent }; });
    check(/^\d+ из \d+$/.test(cnt.text) && cnt.h <= cnt.lh * 1.5, `«Оборудование места» (${w} px): счётчик «${cnt.text}» в одну строку`);
    check(await c.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `план (${w} px) без прокрутки вбок`);
    await c.close();
  }
}

/* компьютер: параметры в боковой колонке не сворачиваются, в том числе при повторном запуске; разбор — как прежде,
   ракурсы над сценой; счётчик оборудования в узкой колонке целиком */
{
  const d = await open(1280);
  await d.reload(); await d.waitForTimeout(400); await fakeFigures(d);
  check(await d.evaluate(() => S.fold.setup === false && !document.querySelector('.setup').classList.contains('folded')), 'на компьютере параметры не сворачиваются и при повторном запуске');
  const cnt = await d.evaluate(() => { const e = $('#e-count'); return e.getBoundingClientRect().height <= parseFloat(getComputedStyle(e.closest('.lbl')).lineHeight) * 1.5; });
  check(cnt, 'компьютер: счётчик оборудования в одну строку');
  await d.evaluate(() => openMotionItem(previewItem('latpull'))); await d.waitForTimeout(100);
  const cams = await rect(d, '#mv-camera-controls'), stage = await rect(d, '#mv-stage');
  check(cams && stage && cams.b <= stage.t && await shown(d, '#mv-view') && await shown(d, '#mv-back'), 'компьютер: ракурсы над сценой, подпись ракурса на месте');
  await d.close();
}

/* режим тренировки на телефоне — время (Date.now) и Screen Wake Lock подделаны: экран не гаснет в тренировке и
   отпускается на выходе; отдых после нуля считает вверх «+0:25 сверх отдыха», экран меняет цвет, сигнал повторяется
   (настройка «один раз / настойчиво» запоминается), фактический отдых — третьим полем подхода; таймер удержания:
   «Старт» → 3-2-1 → «до цели» → «сверх цели», «Стоп» пишет секунды в подход и начинает отдых; ручной ввод секунд;
   боковая планка — левая, пауза 10 с, правая, записывается слабая сторона; таймер отдыха в плане тоже считает вверх */
{
  const w = await open(390, 844);
  await w.evaluate(() => {
    const base = Date.now(); window.__dt = 0; Date.now = () => base + window.__dt; /* часы стоят, пока проверка их не сдвинет */
    window.__wl = { req: 0, rel: 0, locks: [] };
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async type => {
      window.__wl.req++;
      const l = { type, released: false, onrelease: null, addEventListener(e, f) { if (e === 'release') l.onrelease = f; },
        release: async () => { if (!l.released) { l.released = true; window.__wl.rel++; l.onrelease?.(); } } };
      window.__wl.locks.push(l); return l;
    } } });
    localStorage.removeItem('podhod.restSignal'); localStorage.removeItem('podhod.restWarn');
    S.customs = [{ id: 'h1', name: 'Удержания', items: [{ id: 'plank', sets: 2 }, { id: 'sideplank', sets: 1 }, { id: 'pushup', sets: 1 }] }];
    S.custom = 'h1'; S.mode = 'custom'; ensureCustoms(S); openCustom('h1'); regen();
  });
  const adv = ms => w.evaluate(ms => { window.__dt += ms; workoutTick(); }, ms);
  const hold = () => w.evaluate(() => ({ mode: $('#wv-hold-mode').textContent, time: $('#wv-hold-time').textContent, btn: $('#wv-hold-go').textContent, sides: $('#wv-hold-sides').textContent, shown: !$('#wv-hold').hidden, done: $('#wv-done').disabled }));
  const rest = () => w.evaluate(() => ({ t: $('#wv-rest-time').textContent, over: $('#wv-rest-over').textContent, h: $('#wv-rest-heading').textContent, red: $('#workout-view').classList.contains('rest-over'), note: $('#wv-rest-note').textContent, st: RestAlarm.state() }));
  await w.click('#start-workout'); await w.waitForTimeout(50);
  check(await w.evaluate(() => window.__wl.req === 1 && window.__wl.locks[0].type === 'screen' && ScreenAwake.state().held), 'тренировка: экран не гаснет — Wake Lock запрошен');
  await w.evaluate(() => { window.__wl.locks[0].release(); document.dispatchEvent(new Event('visibilitychange')); }); await w.waitForTimeout(50);
  check(await w.evaluate(() => window.__wl.req === 2 && ScreenAwake.state().held), 'система сняла блокировку — при возвращении на экран она берётся снова');

  let h = await hold();
  check(h.shown && h.time === '30 с' && h.btn === 'Старт' && /нижняя граница плана 30–45/.test(await w.textContent('#wv-hold-goal')) && /вручную/.test(await w.textContent('#wv-input-hint')), 'планка: таймер удержания, цель — нижняя граница плана, ручной ввод подписан');
  await w.click('#wv-hold-go'); h = await hold();
  check(h.mode === 'Приготовьтесь' && h.time === '3' && h.btn === 'Отмена' && h.done && await w.evaluate(() => RestAlarm.state().hold.join() === 'tick,tick,tick,go,end'), '«Старт»: отсчёт 3-2-1, звуки в очереди, «Подход выполнен» ждёт');
  await adv(3000 + 12000); h = await hold();
  check(h.mode === 'До цели' && h.time === '18 с' && h.btn === 'Стоп', 'после 3-2-1 — обратный отсчёт «до цели»');
  await adv(25000); h = await hold();
  check(h.mode === 'Сверх цели' && h.time === '+7 с', 'после цели — счёт вверх «сверх цели»');
  await w.click('#wv-hold-go');
  check(await w.evaluate(() => JSON.stringify(LOG.data.plank?.[0].s) === '[[null,37]]' && !$('#wv-rest').hidden && !RestAlarm.state().hold.length), '«Стоп» пишет секунды в подход и начинает отдых');

  let r = await rest();
  check(!r.red && /^\d:\d\d$/.test(r.t) && !r.over && r.st.signals.join() === 'end,repeat,repeat,repeat' && r.st.mode === 'persist', 'отдых: по умолчанию «настойчиво» — сигнал на нуле и три повтора');
  const restSec = await w.evaluate(() => workout.queue[workout.last].rest);
  await adv(restSec * 1000 + 25000); r = await rest();
  check(r.t === '+0:25' && r.over === 'сверх отдыха' && r.h === 'Пора к подходу' && r.red && r.st.fired === 2, 'после нуля: «+0:25 сверх отдыха», экран меняет цвет, сигнал повторился');
  check(await w.evaluate(() => $('#wv-rest-minus').disabled), 'после нуля «−15 сек.» выключена');
  await w.click('[data-rest-mode="once"]');
  check(await w.evaluate(() => localStorage.getItem('podhod.restSignal') === 'once' && RestAlarm.state().signals.join() === 'end' && $('[data-rest-mode="once"]').getAttribute('aria-pressed') === 'true'), '«Один раз» — без повторов, выбор запоминается');
  await w.click('[data-rest-mode="persist"]'); await w.check('[data-rest-warn]');
  check(await w.evaluate(() => localStorage.getItem('podhod.restSignal') === 'persist' && localStorage.getItem('podhod.restWarn') === 'on' && RestAlarm.warn), 'сигнал за 10 с до конца включается и запоминается');
  await w.uncheck('[data-rest-warn]');
  await w.click('#wv-continue');
  const taken = await w.evaluate(() => LOG.data.plank[0].s[0]);
  check(taken.length === 3 && taken[2] === restSec + 25, `фактический отдых записан третьим полем подхода (${JSON.stringify(taken)}, ждали ${restSec + 25})`);

  h = await hold();
  check(h.shown && !h.done && await w.evaluate(() => $('#wv-title').textContent.startsWith('Планка')), 'второй подход планки: таймер и ручной ввод доступны');
  await w.fill('#wv-reps', '41'); await w.click('#wv-done');
  check(await w.evaluate(() => LOG.data.plank[0].s[1][1] === 41 && LOG.data.plank[0].s[1].length === 2), 'ручной ввод секунд записывает подход');
  await w.click('#wv-continue');
  h = await hold();
  check(h.mode === 'Левая, затем правая' && await w.evaluate(() => /слабой стороны/.test($('#wv-unilateral').textContent) && !$('#wv-unilateral').hidden), 'боковая планка: обе стороны в одном подходе');
  await w.click('#wv-hold-go'); await adv(3000 + 42000); h = await hold();
  check(h.mode === 'Левая · сверх цели' && h.time === '+12 с', 'боковая планка: левая сторона');
  await w.click('#wv-hold-go'); h = await hold();
  check(h.mode === 'Смена стороны' && h.time === '10' && h.btn === 'Правая — сейчас' && /Левая 42 с/.test(h.sides), 'пауза 10 с перед правой, время левой на виду');
  await adv(10000 + 38000); h = await hold();
  check(h.mode === 'Правая · сверх цели' && h.time === '+8 с', 'правая сторона начинается сама после паузы');
  await w.click('#wv-hold-go'); r = await rest();
  check(await w.evaluate(() => LOG.data.sideplank?.[0].s[0][1] === 38) && /левая 42 с, правая 38 с/.test(r.note), 'записано время слабой стороны, обе цифры — в подсказке');
  check(await w.evaluate(() => JSON.stringify(LOG.data.sideplank[0].s[0].slice(3)) === '[{"l":[null,42],"r":[null,38]}]'), 'таймер боковой планки пишет обе стороны в поле сторон');
  await w.click('#wv-close');
  check(await w.evaluate(() => window.__wl.locks.at(-1).released && !ScreenAwake.state().want && !ScreenAwake.state().held && !$('#workout-view').classList.contains('rest-over')), 'выход из тренировки отпускает блокировку экрана');
  await w.evaluate(() => Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined }));
  await w.click('#start-workout'); await w.waitForTimeout(50);
  check(await w.evaluate(() => $('#workout-view').open && !ScreenAwake.state().held), 'без Wake Lock тренировка работает как раньше');
  await w.click('#wv-close');

  await w.evaluate(() => { localStorage.setItem('podhod.restSignal', 'persist'); S.mode = 'single'; regen(); startRest(60, 'Отдых'); });
  const bar = ms => w.evaluate(ms => { window.__dt += ms; tick(); return { t: $('#t-time').textContent, over: $('#timer').classList.contains('over'), hidden: $('#timer').hidden }; }, ms);
  let b = await bar(70000);
  check(b.t === '+0:10' && b.over && !b.hidden, 'таймер в плане после нуля считает вверх');
  b = await bar(50000);
  check(b.t === '+1:00' && !b.hidden, 'таймер в плане ждёт, пока идут повторы сигнала');
  b = await bar(6000);
  check(b.hidden && await w.evaluate(() => RestAlarm.state().end === 0), 'таймер в плане уходит через 5 с после последнего повтора');
  await w.close();
}

/* вес гантелей и стороны (13a-sets.js): «Вес одной гантели, кг» и «×2 = 40 кг»; «Л/П отдельно» в тренировке и в карточке
   пишет обе стороны, слабую — в основные поля; общий вес — после подхода, в итогах и в журнале; «Л … · П …» в истории */
{
  const v = await open(390, 844);
  await v.evaluate(() => {
    S.customs = [{ id: 'g1', name: 'Гантели', items: [{ id: 'dbbench', sets: 1 }, { id: 'dbrow', sets: 2 }, { id: 'goblet', sets: 1 }] }];
    S.custom = 'g1'; S.mode = 'custom'; S.lr = {}; ensureCustoms(S); openCustom('g1'); regen();
  });
  const f = () => v.evaluate(() => ({ cap: $('#wv-weight-caption').textContent, rep: $('#wv-rep-caption').textContent, x2: $('#wv-kg-total').textContent,
    bar: !$('#wv-lr-bar').hidden, lr: $('#wv-lr').getAttribute('aria-pressed'), one: !$('#wv-one').hidden, two: !$('#wv-lr-fields').hidden }));
  await v.click('#start-workout'); await v.waitForTimeout(50);
  await v.fill('#wv-kg', '20'); await v.fill('#wv-reps', '10');
  let s = await f();
  check(s.cap === 'Вес одной гантели, кг' && s.x2 === '×2 = 40 кг' && s.rep === 'Повторы' && !s.bar && s.one, `жим гантелей: «Вес одной гантели, кг», «×2 = 40 кг», без Л/П (${JSON.stringify(s)})`);
  await v.fill('#wv-kg', '22');
  check(await v.evaluate(() => $('#wv-kg-total').textContent === '×2 = 44 кг'), '«×2» обновляется при вводе веса');
  await v.fill('#wv-kg', '20'); await v.click('#wv-done');
  check(await v.evaluate(() => JSON.stringify(LOG.data.dbbench[0].s) === '[[20,10]]' && LOG.data.dbbench[0].eq === 'db' && /общий вес подхода 400 кг/.test($('#wv-rest-note').textContent)), 'подход записан как вес одной гантели; после подхода — общий вес 400 кг');
  await v.click('#wv-continue');
  s = await f();
  check(s.cap === 'Вес гантели, кг' && !s.x2 && s.rep === 'Повторы на каждую сторону' && s.bar && s.lr === 'false' && s.one && !s.two, `тяга одной рукой: одна гантель, повторы на каждую сторону, «Л/П отдельно» выключен (${JSON.stringify(s)})`);
  await v.click('#wv-lr'); s = await f();
  check(s.lr === 'true' && !s.one && s.two && await v.evaluate(() => S.lr.dbrow === true && JSON.parse(localStorage.getItem('podhod.settings.v1')).lr.dbrow === true), '«Л/П отдельно»: две строки — левая и правая, выбор запоминается');
  await v.fill('#wv-kg-l', '30'); await v.fill('#wv-reps-l', '10'); await v.fill('#wv-kg-r', '30'); await v.fill('#wv-reps-r', '8'); await v.click('#wv-done');
  check(await v.evaluate(() => JSON.stringify(LOG.data.dbrow[0].s[0]) === '[30,8,null,{"l":[30,10],"r":[30,8]}]'), 'тренировка: обе стороны в поле сторон, слабая (правая) — в основных полях');
  check(await v.evaluate(() => /общий вес подхода 540 кг/.test($('#wv-rest-note').textContent) && /слабая сторона — правая/i.test($('#wv-rest-note').textContent)), 'после подхода с Л/П: общий вес — сумма сторон, слабая сторона названа');
  await v.click('#wv-continue');
  s = await f();
  check(s.two && await v.evaluate(() => $('#wv-kg-l').value === '30' && $('#wv-kg-r').value === '30' && $('#wv-reps-l').value === ''), 'второй подход: Л/П остаётся включённым, вес сторон подставлен из первого');
  await v.fill('#wv-reps-l', '9'); await v.fill('#wv-reps-r', '9');
  await v.click('#wv-lr'); s = await f();
  check(s.one && await v.evaluate(() => $('#wv-kg').value === '30' && $('#wv-reps').value === '9' && !S.lr.dbrow), 'выключили Л/П — введённое переходит в общую пару');
  await v.click('#wv-done');
  check(await v.evaluate(() => JSON.stringify(LOG.data.dbrow[0].s[1].slice(0, 2)) === '[30,9]' && LOG.data.dbrow[0].s[1].length <= 3), 'без Л/П — одна пара «вес × повторы», как раньше');
  await v.click('#wv-continue');
  s = await f();
  check(s.cap === 'Вес гантели, кг' && !s.x2 && !s.bar, 'гоблет: одна гантель, без «×2» и без Л/П');
  await v.fill('#wv-kg', '24'); await v.fill('#wv-reps', '10'); await v.click('#wv-done');
  check(await v.evaluate(() => !$('#wv-finish').hidden && /Общий вес — 1 720 кг/.test($('#wv-finish-text').textContent) && /1 080 кг/.test($('#wv-summary').textContent)), 'итоги тренировки: общий вес за тренировку и по упражнениям');
  await v.click('#wv-finish-close');
  /* карточка плана: Л/П в таблице, подпись столбца, «×2» под таблицей */
  await v.evaluate(() => { document.querySelectorAll('.card').forEach(c => { const b = c.querySelector('[data-cfold="log"]'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); }); });
  check(await v.evaluate(() => { const h = document.querySelector('.card[data-ex="dbbench"] .lt-h span[title]'); return h && h.title === 'Вес одной гантели, кг' && h.textContent === 'Гантель, кг' && document.querySelector('.card[data-ex="dbbench"] .lt-x2').textContent.includes('×2 = 40 кг'); }), 'карточка: столбец «Гантель, кг» (подсказка — вес одной гантели), под таблицей «×2 = 40 кг»');
  await v.click('.card[data-ex="dbbench"] [data-addset]');
  await v.fill('.card[data-ex="dbbench"] .lt-r[data-k="1"] [data-f="kg"]', '24');
  check(await v.evaluate(() => document.querySelector('.card[data-ex="dbbench"] .lt-x2 b').textContent === '×2 = 48 кг'), 'карточка: «×2» обновляется при вводе');
  await v.click('.card[data-ex="dbrow"] [data-lr]');
  check(await v.evaluate(() => S.lr.dbrow === true && document.querySelectorAll('.card[data-ex="dbrow"] .lt-r.lt-lr').length === 2 && document.querySelector('.card[data-ex="dbrow"] [data-lr]').getAttribute('aria-pressed') === 'true' && document.activeElement?.dataset.lr === 'dbrow'), 'карточка: «Л/П отдельно» — подход в две строки, фокус на переключателе');
  check(await v.evaluate(() => { const r = document.querySelector('.card[data-ex="dbrow"] .lt-r[data-k="0"]'); return r.classList.contains('done') && r.querySelector('[data-side="l"][data-f="reps"]').value === '10' && r.querySelector('[data-side="r"][data-f="reps"]').value === '8'; }), 'карточка: записанный подход показывает обе стороны');
  await v.click('.card[data-ex="dbrow"] [data-tick][data-k="1"]'); /* снять второй подход и записать его заново по сторонам */
  await v.fill('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="kg"][data-side="l"]', '28');
  await v.fill('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="reps"][data-side="l"]', '12');
  await v.fill('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="kg"][data-side="r"]', '30');
  await v.fill('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="reps"][data-side="r"]', '8');
  await v.click('.card[data-ex="dbrow"] [data-tick][data-k="1"]');
  check(await v.evaluate(() => JSON.stringify(LOG.data.dbrow[0].s[1]) === '[30,8,null,{"l":[28,12],"r":[30,8]}]'), 'карточка: обе стороны записаны, слабая по расчётному максимуму (30 × 8 слабее 28 × 12) — в основных полях');
  await v.fill('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="reps"][data-side="r"]', '11');
  await v.dispatchEvent('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="reps"][data-side="r"]', 'change');
  check(await v.evaluate(() => JSON.stringify(LOG.data.dbrow[0].s[1]) === '[28,12,null,{"l":[28,12],"r":[30,11]}]'), 'карточка: исправление стороны пересчитывает слабую');
  await v.click('.card[data-ex="dbrow"] [data-lr]');
  check(await v.evaluate(() => !S.lr.dbrow && !document.querySelector('.card[data-ex="dbrow"] .lt-r.lt-lr') && document.querySelector('.card[data-ex="dbrow"] .lt-r[data-k="1"] [data-f="reps"]').value === '12'), 'карточка: выключили Л/П — в строке слабая сторона');
  /* журнал: последние тренировки с общим весом, история «Л … · П …» */
  await v.evaluate(() => { S.view = 'journal'; renderSetup(); renderPlan(); });
  const j = await v.evaluate(() => ({ day: document.querySelector('.j-days li')?.textContent || '', hist: [...document.querySelectorAll('.j-row')].find(li => li.querySelector('[data-del="dbrow"]'))?.textContent || '' }));
  check(/сегодня/.test(j.day) && /3 упражнения · 4 подхода/.test(j.day) && /1 846\s*кг/.test(j.day), `журнал: тренировка дня — упражнения, подходы, общий вес (${j.day})`);
  check(/Л 30×10 · П 30×8; Л 28×12 · П 30×11/.test(j.hist) && /общий вес 1 206 кг/.test(j.hist), `журнал: история — «Л … · П …» и общий вес (${j.hist.replace(/\s+/g, ' ').slice(0, 200)})`);
  await v.close();
}

/* загрузка мышц по журналу (13d-muscle-load.js): панели нет при пустом журнале; с записями — 11 групп со статусами;
   «Собрать тренировку на сегодня» собирает разовую тренировку с объяснением по группам; смена мышц — обычный подбор */
{
  const seedLog = page => page.evaluate(() => {
    const d = n => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - n); return dayKey(x); };
    const s = n => Array.from({ length: n }, () => [50, 10]);
    LOG.data = { squat: [{ d: d(3), s: s(4) }], bbbench: [{ d: d(3), s: s(4) }], latpull: [{ d: d(1), s: s(4) }], ohp: [{ d: d(1), s: s(3) }], bbcurl: [{ d: d(2), s: s(3) }] };
    S.view = 'journal'; renderSetup(); renderPlan();
  });
  const st = (page, g) => page.evaluate(g => { const li = document.querySelector(`#ml [data-lg="${g}"]`); return li ? ['loaded', 'recovering', 'ready'].find(x => li.classList.contains('st-' + x)) : null; }, g);
  const noSide = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  const j = await open(390, 844);
  await j.evaluate(() => { S.view = 'journal'; renderSetup(); renderPlan(); });
  check(await j.evaluate(() => !document.querySelector('#ml') && !document.querySelector('[data-logpick]')), 'пустой журнал: панели «Загрузка мышц» и кнопки «По журналу» нет');
  await seedLog(j);
  check(await shown(j, '#ml') && await j.evaluate(() => document.querySelectorAll('#ml .ml-list li').length === 11), 'журнал с записями: панель загрузки мышц видна, 11 групп');
  check(await st(j, 'back') === 'loaded' && await st(j, 'biceps') === 'recovering' && await st(j, 'chest') === 'ready'
    && await j.evaluate(() => /вчера, 4 подхода/.test(document.querySelector('#ml [data-lg="back"] .ml-st').textContent)), 'статусы: спина вчера — нагружена, бицепс позавчера — восстанавливается, грудь — готова');
  check(await noSide(j), 'журнал с панелью загрузки (390 px) без прокрутки вбок');
  await j.click('[data-logpick="journal"]'); await j.waitForTimeout(100);
  const built = await j.evaluate(() => ({ view: S.view, mode: S.mode, byLog: !!plan.byLog, groups: S.groups.slice(), lines: document.querySelectorAll('.lp li').length,
    text: document.querySelector('.lp')?.textContent || '', eyebrow: document.querySelector('.p-head .eyebrow').textContent, pre: !!document.querySelector('.pre-log.on'),
    ex: plan.items.map(it => it.ex.g) }));
  check(built.view === 'plan' && built.mode === 'single' && built.byLog && built.lines === built.groups.length && built.lines > 0 && /^По журналу/.test(built.eyebrow) && built.pre,
    'кнопка собирает тренировку на сегодня: строка-объяснение по каждой группе, заготовка «По журналу» отмечена');
  check(!built.groups.includes('back') && !built.groups.includes('shoulders') && !built.ex.includes('back') && /Спина: \d/.test(built.text) === false && /Отдыхают.*спина \(вчера\)/.test(built.text),
    'нагруженные вчера спина и плечи пропущены и названы в объяснении');
  check(await noSide(j), 'план по журналу (390 px) без прокрутки вбок');
  await j.click('#g-chips [data-g="back"]'); await j.waitForTimeout(100);
  check(await j.evaluate(() => !plan.byLog && !document.querySelector('.lp') && !document.querySelector('.pre-log.on')), 'смена мышц вручную — обычный подбор без объяснения');
  await j.click('.pre-log'); await j.waitForTimeout(100);
  check(await j.evaluate(() => plan.byLog && !!document.querySelector('.lp')), '«По журналу» в параметрах собирает заново');
  /* всё нагружено сегодня: тренировку не собираем, объясняем */
  await j.evaluate(() => {
    for (const id of ['bbbench', 'latpull', 'ohp', 'bbcurl', 'pushdown', 'wristcurl', 'crunch', 'hipthrust', 'legext', 'legcurl', 'calfraise']) LOG.data[id] = [{ d: todayKey(), s: [[20, 10], [20, 10]] }];
    S.view = 'journal'; renderSetup(); renderPlan();
  });
  await j.click('[data-logpick="journal"]'); await j.waitForTimeout(100);
  check(await j.evaluate(() => S.view === 'journal' && /лучше отдохнуть/.test(document.querySelector('#ml-msg').textContent)), 'всё нагружено: план не собирается, в панели — объяснение');
  await j.close();
  const jd = await open(1280);
  await seedLog(jd);
  check(await jd.evaluate(() => { const li = [...document.querySelectorAll('#ml .ml-list li')]; const t = li.slice(0, 2).map(x => Math.round(x.getBoundingClientRect().top)); return t[0] === t[1]; }), 'компьютер: группы загрузки в две колонки');
  await jd.close();
}

/* «Анатомия» вне разбора (этап 2) — настоящая объёмная графика (программный WebGL): карточки плана рисует общий рендерер
   (у карточки нет своего WebGL), анимируется одна, у остальных — один неподвижный кадр; «↗» открывает разбор; выбор
   «Манекен» в разборе возвращает SVG-карточки, «Анатомия» — кадры; экран тренировки — в «Анатомии» с переключателем;
   подделанные медленные кадры — откат на манекен с подписью, выбор человека не сбрасывается */
{
  const a = await browser.newPage({ viewport: { width: 390, height: 844 } });
  a.on('pageerror', e => errors.push(String(e)));
  await a.goto('file://' + file); await a.waitForTimeout(400);
  await a.evaluate(() => {
    Object.assign(S, { view: 'plan', fold: { ...S.fold, setup: true } }); LOG.data = {}; motionPrefs.view = 'anatomy';
    S.mode = 'custom'; S.customs = [{ id: 'ua', name: 'Анатомия', items: ['squat', 'pushup', 'dbcurl', 'latpull'].map(id => ({ id })) }]; S.custom = 'ua'; ensureCustoms(S); openCustom('ua'); regen();
    document.querySelector('.card .illus').scrollIntoView({ block: 'start' }); window.scrollBy(0, -40);
  });
  const anat = () => a.evaluate(() => figs.map(F => !!F.av?.on));
  const ok = await a.waitForFunction(() => figs.filter(F => F.vis && F.av?.on).length >= 2, null, { timeout: 90000 }).then(() => true, () => false);
  check(ok, 'карточки в «Анатомии»: кадры костей и мышц появляются у карточек рядом с экраном');
  const pic = await a.evaluate(() => {
    const F = figs.find(F => F.av?.on), c = F.av.canvas, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
    let lo = 255, hi = 0, warm = 0; for (let i = 0; i < d.length; i += 16) { const v = d[i] + d[i + 1] + d[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); if (d[i] > d[i + 2] + 60 && d[i] > 120) warm++; }
    return { w: c.width, h: c.height, svgHidden: getComputedStyle(F.f.svg).visibility === 'hidden', range: hi - lo, warm, contexts: GymVolume.cards().stats() };
  });
  check(pic.w > 100 && pic.w === pic.h && pic.svgHidden && pic.range > 200 && pic.warm > 5, `в карточке — картинка анатомии (холст ${pic.w}×${pic.h}, мышцы цветом), SVG-манекен под ней скрыт`);
  check(pic.contexts.context && pic.contexts.scenes <= 3, 'у карточек один общий рендерер, сцен — не больше трёх');
  const motion = await a.evaluate(async () => {
    const act = figs.find(F => F.active && !F.paused), rest = figs.filter(F => F !== act && F.av?.on), calls = new Map();
    for (const F of rest) { const p = F.av.handle.paint; F.av.handle.paint = (...x) => { calls.set(F, (calls.get(F) || 0) + 1); return p.apply(F.av.handle, x); }; }
    const s0 = act?.av?.still; await new Promise(r => setTimeout(r, 1500));
    return { act: !!act, moved: !!act && act.av.still !== s0, restPaints: [...calls.values()].reduce((x, y) => x + y, 0), rest: rest.length };
  });
  check(motion.act && motion.moved, 'анимируемая карточка двигается в «Анатомии»');
  check(motion.rest > 0 && motion.restPaints === 0, `неподвижные карточки — один кадр, без перерисовки (${motion.restPaints})`);
  await a.click('.card .illus.anatomy-on'); await a.waitForTimeout(200);
  check(await a.evaluate(() => $('#motion-view').open && !!detailMotion && detailMotion.it.ex.id === figs.find(F => F.btn === document.querySelector('.card .illus.anatomy-on'))?.it.ex.id), '«↗» в карточке с анатомией открывает разбор этого упражнения');
  await a.evaluate(() => { $('[data-mv-figure="mannequin"]').disabled = false; $('[data-mv-figure="mannequin"]').click(); }); await a.click('#mv-close'); await a.waitForTimeout(200);
  check(await a.evaluate(() => motionPrefs.view === 'mannequin' && cardAnatomy.view === 'mannequin' && figs.every(F => !F.av?.on && (!F.f || getComputedStyle(F.f.svg).visibility !== 'hidden'))), '«Манекен» в разборе — карточки снова SVG-манекен');
  await a.evaluate(() => openMotion(0)); await a.waitForTimeout(100);
  await a.evaluate(() => $('[data-mv-figure="anatomy"]').click()); await a.click('#mv-close');
  check(await a.waitForFunction(() => cardAnatomy.view === 'anatomy' && figs.filter(F => F.vis && F.av?.on).length >= 2, null, { timeout: 60000 }).then(() => true, () => false), 'и обратно «Анатомия» — кадры костей и мышц возвращаются');
  /* экран тренировки */
  await a.evaluate(() => startWorkout('squat'));
  const wv = await a.waitForFunction(() => document.querySelector('#wv-stage .volume-figure')?.dataset.anatomy === 'on', null, { timeout: 60000 }).then(() => true, () => false);
  const wstate = await a.evaluate(() => ({ pressed: [...document.querySelectorAll('[data-wv-figure]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.wvFigure).join(), note: $('#wv-figure-note').hidden, renderer: document.querySelector('#wv-stage .volume-figure')?.dataset.renderer }));
  check(wv && wstate.pressed === 'anatomy' && wstate.note && wstate.renderer === 'webgl', 'экран тренировки — в «Анатомии»: кости и мышцы, выбор виден, подписи нет');
  await a.click('[data-wv-figure="mannequin"]');
  check(await a.evaluate(() => document.querySelector('#wv-stage .volume-figure').dataset.anatomy === 'off' && motionPrefs.view === 'mannequin' && JSON.parse(localStorage.getItem('podhod.motion.v2')).view === 'mannequin'), 'тренировка: «Манекен» убирает кости и мышцы, выбор общий с разбором');
  await a.click('[data-wv-figure="anatomy"]');
  check(await a.evaluate(() => document.querySelector('#wv-stage .volume-figure').dataset.anatomy === 'on' && motionPrefs.view === 'anatomy'), 'тренировка: снова «Анатомия»');
  /* подделанные медленные кадры (120 мс — дольше бюджета 10 кадров в секунду): откат на манекен с подписью */
  const slow = await a.evaluate(() => { for (let i = 0; i < 80; i++) workoutPaceSample(120); return { view: workoutFigure.view, anat: document.querySelector('#wv-stage .volume-figure').dataset.anatomy, note: $('#wv-figure-note').hidden ? '' : $('#wv-figure-note').textContent, pref: motionPrefs.view, pressed: $('[data-wv-figure="mannequin"]').getAttribute('aria-pressed') }; });
  check(slow.view === 'mannequin' && slow.anat === 'off' && /не успевает — показан манекен/.test(slow.note) && slow.pref === 'anatomy' && slow.pressed === 'true', `тренировка: медленные кадры — манекен с подписью «${slow.note}», выбор «Анатомия» сохранён`);
  await a.evaluate(() => closeWorkout());
  await a.evaluate(() => startWorkout('squat'));
  check(await a.waitForFunction(() => document.querySelector('#wv-stage .volume-figure')?.dataset.anatomy === 'on', null, { timeout: 60000 }).then(() => true, () => false), 'следующее открытие тренировки — снова попытка «Анатомии»');
  await a.evaluate(() => closeWorkout());
  const cslow = await a.evaluate(() => { for (let i = 0; i < 80; i++) cardPaceSample(120); const t = figs[0].btn.closest('.motion-tile').querySelector('.figure-tile-note'); return { view: cardAnatomy.view, on: figs.some(F => F.av?.on), note: t.hidden ? '' : t.textContent, pref: motionPrefs.view }; });
  check(cslow.view === 'mannequin' && !cslow.on && /не успевает — показан манекен/.test(cslow.note) && cslow.pref === 'anatomy', 'карточки: медленные кадры — SVG-манекен с подписью, выбор не сброшен');
  check(await a.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'план с подписью отката (390 px) без прокрутки вбок');
  await a.close();
}
/* без WebGL — как раньше: карточки SVG, в тренировке плоская схема, виды с костями недоступны */
{
  const n = await browser.newPage({ viewport: { width: 390, height: 844 } });
  n.on('pageerror', e => errors.push(String(e)));
  await n.addInitScript(() => { delete window.WebGL2RenderingContext; });
  await n.goto('file://' + file); await n.waitForTimeout(400);
  await n.evaluate(() => { Object.assign(S, { view: 'plan', mode: 'single', groups: ['chest', 'back'], count: 4, seed: 3, fold: { ...S.fold, setup: true } }); LOG.data = {}; motionPrefs.view = 'anatomy'; regen(); document.querySelector('.card .illus').scrollIntoView({ block: 'center' }); });
  await n.waitForTimeout(1500);
  const r = await n.evaluate(() => ({ svg: figs.filter(F => F.vis).every(F => F.f && F.f.svg.tagName.toLowerCase() === 'svg' && getComputedStyle(F.f.svg).visibility !== 'hidden'), canvas: document.querySelectorAll('canvas.card-anatomy').length, view: cardAnatomy.view }));
  check(r.svg && r.canvas === 0 && r.view === 'mannequin', 'без WebGL карточки — SVG-манекен, как раньше');
  await n.evaluate(() => startWorkout()); await n.waitForTimeout(200);
  check(await n.evaluate(() => document.querySelector('#wv-stage .volume-figure')?.dataset.renderer === 'svg' && $('[data-wv-figure="anatomy"]').disabled && $('[data-wv-figure="mannequin"]').getAttribute('aria-pressed') === 'true' && $('#wv-figure-note').hidden), 'без WebGL тренировка — плоская схема, «Анатомия» недоступна');
  await n.close();
}

/* витрина атласа в «Анатомии» (этап 3) — настоящая объёмная графика (программный WebGL): сразу — SVG-миниатюры, потом у
   видимых — кадры костей и мышц (картинки из общего рендерера карточек); клик открывает разбор, «← Все упражнения»
   возвращает на то же место и кадры — сразу из памяти; фильтр и поиск работают; «Манекен» — снова SVG. Без WebGL — SVG.
   Кеш между сеансами — по http (офлайн-файлу Cache Storage недоступен): после перезагрузки кадры берутся из кеша. */
{
  const thumbsState = page => page.evaluate(() => { const s = galleryAnatStats(); return { ...s, svg: document.querySelectorAll('#mv-gallery .mv-thumb.ready:not(.anat)').length, anat: document.querySelectorAll('#mv-gallery .mv-thumb.anat img.mv-anat').length }; });
  const visAnat = (page, ms = 120000) => page.waitForFunction(() => { const s = galleryAnatStats(); return s.vis > 0 && s.visReady >= s.vis && [...document.querySelectorAll('#mv-gallery .mv-thumb.anat img.mv-anat')].some(i => i.complete && i.naturalWidth > 0); }, null, { timeout: ms, polling: 200 }).then(() => true, () => false);
  const g = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  g.on('pageerror', e => errors.push(String(e)));
  await g.goto('file://' + file); await g.waitForTimeout(400);
  await g.evaluate(() => { motionPrefs.view = 'anatomy'; LOG.data = {}; });
  await g.waitForFunction(() => window.GymVolume, null, { timeout: 30000 });
  await g.click('#motion-atlas');
  const first = await g.waitForFunction(() => document.querySelector('#mv-gallery .mv-thumb.ready svg'), null, { timeout: 10000 }).then(() => true, () => false);
  check(first, 'витрина в «Анатомии»: первые миниатюры — сразу SVG, кадры анатомии их не задерживают');
  check(await visAnat(g), 'витрина в «Анатомии»: у видимых миниатюр — кадры костей и мышц');
  const pic = await g.evaluate(async () => {
    const img = document.querySelector('#mv-gallery .mv-thumb.anat img.mv-anat'), c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
    let lo = 765, hi = 0, warm = 0; for (let i = 0; i < d.length; i += 16) { const v = d[i] + d[i + 1] + d[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); if (d[i] > d[i + 2] + 60 && d[i] > 120) warm++; }
    const el = img.closest('.mv-thumb'), svg = el.querySelector('svg');
    return { w: c.width, src: img.src.slice(0, 5), range: hi - lo, warm, svgHidden: !svg || getComputedStyle(svg).visibility === 'hidden', canvases: document.querySelectorAll('#mv-gallery canvas').length, stage: GymVolume.cards().stats() };
  });
  check(pic.w >= 200 && pic.src === 'blob:' && pic.range > 200 && pic.warm > 5 && pic.svgHidden, `миниатюра — сжатая картинка анатомии (${pic.w} точек, мышцы цветом), SVG под ней скрыт`);
  check(pic.canvases === 0 && pic.stage.scenes <= 3, `у витрины нет своих холстов и WebGL: общий рендерер, сцен ${pic.stage.scenes} (не больше трёх)`);
  /* миниатюра открывает разбор, возврат — на то же место, кадры — сразу из памяти */
  const id = await g.evaluate(() => document.querySelector('#mv-gallery .mv-thumb.anat').closest('[data-gallery-open]').dataset.galleryOpen);
  await g.click(`[data-gallery-open="${id}"]`); await g.waitForTimeout(150);
  check(await g.evaluate(id => !$('#mv-detail').hidden && detailMotion?.it.ex.id === id && !gallery.on && !galleryAnat.io, id), 'миниатюра анатомии открывает разбор этого упражнения, очередь витрины стоит');
  await g.click('#mv-back');
  const back = await g.evaluate(id => ({ focus: document.activeElement?.dataset.galleryOpen, anat: !!document.querySelector(`[data-gallery-open="${id}"] .mv-thumb.anat img.mv-anat`), painted: galleryAnat.stats.painted }), id);
  check(back.focus === id && back.anat, '«← Все упражнения» — на то же упражнение, его кадр анатомии сразу из памяти');
  /* фильтр и поиск в «Анатомии» */
  await g.click('[data-gallery-kind="band"]');
  check(await g.evaluate(() => { const t = [...document.querySelectorAll('.mv-tile')]; return t.length > 0 && t.every(b => workKind(EXI[b.dataset.galleryOpen]) === 'band'); }), 'витрина в «Анатомии»: фильтр «Резинки» работает');
  check(await visAnat(g), 'после фильтра видимые миниатюры — тоже анатомия');
  await g.click('[data-gallery-kind="all"]');
  await g.fill('#mv-gq', 'тяга верхнего');
  check(await g.evaluate(() => { const t = [...document.querySelectorAll('.mv-tile')].map(b => b.dataset.galleryOpen); return t.includes('latpull') && t.every(id => EXI[id].name.toLowerCase().includes('тяга верхнего')) && document.activeElement.id === 'mv-gq'; }), 'поиск в «Анатомии» работает, курсор в поле');
  check(await visAnat(g), 'найденные миниатюры — анатомия');
  await g.fill('#mv-gq', '');
  /* «Манекен» в разборе — витрина снова SVG; «Анатомия» — кадры из памяти */
  await g.click('[data-gallery-open="latpull"]'); await g.waitForTimeout(100);
  await g.evaluate(() => { const b = $('[data-mv-figure="mannequin"]'); b.disabled = false; b.click(); });
  await g.click('#mv-back');
  /* SVG видимых миниатюр строится, как раньше, в кадрах после возврата из разбора (на стенде — до нескольких секунд) */
  const svgBack = await g.waitForFunction(() => (v => v.length > 0 && v.every(el => el.querySelector('svg') && !el.classList.contains('anat')))([...document.querySelectorAll('#mv-gallery .mv-thumb')].filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })), null, { timeout: 20000 }).then(() => true, () => false);
  const man = await thumbsState(g);
  check(svgBack && man.view === 'mannequin' && man.anat === 0 && man.svg > 0, `«Манекен» — миниатюры снова SVG (${JSON.stringify({ view: man.view, anat: man.anat, svg: man.svg })})`);
  await g.click('[data-gallery-open="latpull"]'); await g.waitForTimeout(100);
  await g.evaluate(() => $('[data-mv-figure="anatomy"]').click()); await g.click('#mv-back');
  check(await visAnat(g, 60000), 'снова «Анатомия» — кадры костей и мышц');
  /* память: сжатые кадры, а не холсты */
  const mem = await thumbsState(g);
  check(mem.mem > 0 && mem.bytes / mem.mem < 40e3 && mem.bytes < 3 << 20, `кадры в памяти сжаты: ${mem.mem} шт., ${(mem.bytes / 1024).toFixed(0)} КБ`);
  check(await g.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'витрина в «Анатомии» (390 px) без прокрутки вбок');
  await g.keyboard.press('Escape'); await g.waitForTimeout(100);
  check(await g.evaluate(() => !gallery.on && !galleryAnat.io && !galleryAnat.job), 'закрытая витрина — очередь кадров остановлена');
  await g.close();
}
/* без WebGL — витрина как раньше: SVG-миниатюры, картинок анатомии нет */
{
  const n = await browser.newPage({ viewport: { width: 390, height: 844 } });
  n.on('pageerror', e => errors.push(String(e)));
  await n.addInitScript(() => { delete window.WebGL2RenderingContext; });
  await n.goto('file://' + file); await n.waitForTimeout(400);
  await n.evaluate(() => { motionPrefs.view = 'anatomy'; });
  await n.click('#motion-atlas'); await n.waitForTimeout(1500);
  const r = await n.evaluate(() => ({ svg: document.querySelectorAll('#mv-gallery .mv-thumb.ready svg').length, img: document.querySelectorAll('#mv-gallery img.mv-anat').length, view: galleryAnat.view, note: document.querySelector('.mv-gnote')?.hidden }));
  check(r.svg > 0 && r.img === 0 && r.view === 'mannequin' && r.note === true, `без WebGL витрина — SVG, как раньше (${JSON.stringify(r)})`);
  await n.close();
}
/* кеш между сеансами: PWA по http (Cache Storage), после перезагрузки кадры — из кеша, без отрисовки */
{
  const dist = path.dirname(file), types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.bin': 'application/octet-stream', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (u.endsWith('/')) u += 'index.html';
    const f = path.join(dist, u); if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
  const c = await ctx.newPage(); c.on('pageerror', e => errors.push(String(e)));
  const url = `http://127.0.0.1:${srv.address().port}/`;
  const openGal = async () => { await c.goto(url); await c.waitForFunction(() => window.GymVolume && typeof galleryAnat === 'object', null, { timeout: 30000 }); await c.evaluate(() => { motionPrefs.view = 'anatomy'; }); await c.click('#motion-atlas'); };
  await openGal();
  const okFirst = await c.waitForFunction(() => { const s = galleryAnatStats(); return s.vis > 0 && s.visReady >= s.vis; }, null, { timeout: 120000, polling: 200 }).then(() => true, () => false);
  await c.waitForTimeout(800);
  const saved = await c.evaluate(async () => { const names = (await caches.keys()).filter(n => n.startsWith('podhod-thumbs@')); const c0 = names.length ? await caches.open(names[0]) : null; return { names, n: c0 ? (await c0.keys()).length : 0, build: window.PODHOD_BUILD, painted: galleryAnat.stats.painted }; });
  check(okFirst && saved.names.length === 1 && saved.names[0].endsWith(':' + saved.build) && saved.n >= saved.painted && saved.n > 0, `кадры сохранены в Cache Storage этой сборки (${saved.n} шт., корзина ${saved.names.join()})`);
  /* корзина прежней сборки удаляется при открытии витрины */
  await c.evaluate(async () => { await caches.open('podhod-thumbs@' + thumbScope() + ':0.0.0-old'); });
  await openGal();
  const t0 = Date.now();
  const okCache = await c.waitForFunction(() => { const s = galleryAnatStats(); return s.vis > 0 && s.visReady >= s.vis; }, null, { timeout: 30000, polling: 50 }).then(() => true, () => false);
  const fromCache = await c.evaluate(() => ({ painted: galleryAnat.stats.painted, cached: galleryAnat.stats.cached, stage: !!GymVolume.cards().stats().context }));
  check(okCache && fromCache.painted === 0 && fromCache.cached > 0, `после перезагрузки видимые кадры — из кеша, без отрисовки (${Date.now() - t0} мс, ${JSON.stringify(fromCache)})`);
  await c.waitForTimeout(3600);
  const left = await c.evaluate(async () => (await caches.keys()).filter(n => n.startsWith('podhod-thumbs@')));
  check(left.length === 1 && !left[0].endsWith('0.0.0-old'), `корзина прежней сборки удалена (${left.join()})`);
  await ctx.close(); srv.close();
}

/* скрытая панель замера скорости (?perf, 19-perf-panel.js): без флага панели нет, а крючки только читают флаг
   (globalThis.GymPerf); с флагом — плашка на телефоне, живые цифры карточек (в «Анатомии» — кадр карточки, копия,
   ступень скорости) и объёма, панель переезжает в открытое окно; «Замерить» проходит все 11 шагов (карточка и
   тренировка — в «Анатомии» и «Манекене»; короткие длительности, фигуры — заглушки) и не меняет журнал, настройки,
   планы и вид фигуры; «Остановить» прерывает и всё возвращает; «Скопировать результат» — текст или поле для ручного
   копирования; ?perf=0 выключает */
{
  const off = await browser.newPage({ viewport: { width: 390, height: 844 } });
  off.on('pageerror', e => errors.push(String(e)));
  await off.addInitScript(() => { let reads = 0; Object.defineProperty(window, 'GymPerf', { configurable: true, get() { reads++; return undefined; } }); window.__perfReads = () => reads; });
  await off.goto('file://' + file); await off.waitForTimeout(400);
  await off.evaluate(() => document.querySelector('.card')?.scrollIntoView({ block: 'center' })); await off.waitForTimeout(800);
  const o = await off.evaluate(() => ({ panel: !!document.querySelector('#perf-panel'), flag: localStorage.getItem('podhod.perf'), reads: window.__perfReads() }));
  check(!o.panel && o.flag === null && o.reads > 0, `без ?perf: панели нет, крючки только проверяют флаг (${o.reads} проверок)`);
  await off.close();

  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + file + '?perf'); await p.waitForTimeout(500);
  const box = await rect(p, '#perf-panel .perf-body');
  check(await p.evaluate(() => localStorage.getItem('podhod.perf') === 'open' && !!globalThis.GymPerf) && box && box.l >= 0 && box.r <= 390 && box.b <= 844 && box.w >= 300,
    '?perf: панель включена и запомнена, плашка целиком на экране телефона');
  check(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), '?perf: страница без прокрутки вбок');
  await p.evaluate(() => document.querySelector('.card').scrollIntoView({ block: 'center' }));
  /* карточки по умолчанию — в «Анатомии»: живые цифры — кадр карточки общего рендерера, копия в её холст, ступень скорости */
  await p.waitForFunction(() => /кадр \d/.test(document.querySelector('[data-perf-k="screen"]').textContent) && /анатомия \d/.test(document.querySelector('[data-perf-k="cards"]').textContent), null, { timeout: 30000 }).catch(() => {});
  const live = await p.evaluate(() => ({ pill: document.querySelector('[data-perf-pill]').textContent, screen: document.querySelector('[data-perf-k="screen"]').textContent, cards: document.querySelector('[data-perf-k="cards"]').textContent, view: document.querySelector('[data-perf-k="view"]').textContent }));
  check(/^\d/.test(live.pill) && /^\d+(,\d)? к\/с · кадр \d/.test(live.screen) && /анатомия \d.* · копия \d/.test(live.cards) && /^План — Анатомия; ступень (30|15|10) к\/с, медиана /.test(live.view),
    `живые цифры: кадры, карточка в «Анатомии» и её ступень (${live.screen} | ${live.cards} | ${live.view})`);
  /* «Манекен» — снова SVG-карточки: из памяти и заново */
  await p.evaluate(() => { motionPrefs.view = 'mannequin'; applyCardsView(); });
  const svgLive = await p.waitForFunction(() => /заново \d/.test(document.querySelector('[data-perf-k="cards"]').textContent) && /^План — рисунок SVG$/.test(document.querySelector('[data-perf-k="view"]').textContent), null, { timeout: 15000 }).then(() => true, () => false);
  check(svgLive, 'живые цифры в «Манекене»: SVG-карточки, без ступени');
  await p.evaluate(() => { motionPrefs.view = 'mannequin'; openMotionItem(previewItem('legpress')); detailMotion.paused = false; });
  const volLive = await p.waitForFunction(() => /поза \d/.test(document.querySelector('[data-perf-k="volume"]')?.textContent || ''), null, { timeout: 15000 }).then(() => true, () => false);
  /* программная графика стенда отстаёт от кадров — фигуру сразу на паузу */
  await p.evaluate(() => { if (detailMotion) detailMotion.paused = true; });
  check(volLive && await p.evaluate(() => document.querySelector('#perf-panel').parentElement.id === 'motion-view' && /Разбор — Манекен/.test(document.querySelector('[data-perf-k="view"]').textContent)),
    'разбор: панель в окне разбора, живые цифры объёма по частям, вид фигуры');
  await p.click('#perf-panel [data-perf="dev"]');
  check(await p.evaluate(() => /Устройство: .*\nВидеокарта: /.test(document.querySelector('[data-perf-dev]').textContent) && !document.querySelector('[data-perf-dev]').hidden), 'в открытом окне панель нажимается: сведения об устройстве и видеокарте');
  await p.click('#perf-panel [data-perf="dev"]');
  await p.evaluate(() => { closeMotion(); motionPrefs.view = 'anatomy'; });
  check(await p.evaluate(() => document.querySelector('#perf-panel').parentElement === document.body), 'окно закрыто — панель снова на странице');
  await p.waitForFunction(() => GymPerf.frames.filter(f => f.t > performance.now() - 500).length >= 10, null, { timeout: 20000 }).catch(() => {});

  /* сценарий: журнал с записью, сохранённая тренировка — снимок до и после */
  await fakeFigures(p);
  const snap = () => p.evaluate(() => {
    const ls = {}, keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    for (const k of keys.sort()) if (!/^podhod\.(frames|volume-bounds|stress)\.v\d|^podhod\.perf/.test(k)) ls[k] = localStorage.getItem(k);
    return JSON.stringify({ ls, log: LOG.data, S, prefs: motionPrefs, view: figureView(), dialogs: document.querySelectorAll('dialog[open]').length, y: Math.round(scrollY) });
  });
  await p.evaluate(() => {
    LOG.data = { squat: [{ d: todayKey(), s: [[60, 8]] }] }; logSaveLocal();
    localStorage.setItem('podhod.workout.v3', JSON.stringify({ stamp: 'старый день', index: 2, started: 1, restUntil: 0, drafts: {} }));
    window.scrollTo(0, 300);
  });
  const before = await snap();
  await p.click('[data-perf="run"]'); await p.waitForTimeout(400);
  check(/^Идёт замер… не трогайте экран, шаг 1 из 11$/.test(await p.evaluate(() => document.querySelector('[data-perf-runtext]').textContent)), '«Замерить»: надпись «Идёт замер… не трогайте экран, шаг 1 из 11»');
  await p.click('[data-perf="stop"]');
  await p.waitForFunction(() => !GymPerf.run && GymPerf.result, null, { timeout: 5000 });
  check(await p.evaluate(() => GymPerf.result.aborted && /Замер остановлен/.test(document.querySelector('[data-perf-result]').textContent)) && await snap() === before, '«Остановить» прерывает замер и возвращает всё как было');
  /* экран не гаснет на время замера: блокировка берётся и отпускается (тренировка берёт свою — тоже отпускает) */
  await p.evaluate(() => { window.__wk = { req: 0, rel: 0 }; Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { __wk.req++; return { release: async () => { __wk.rel++; } }; } } }); });
  const run = await p.evaluate(() => perfRun({ plan: 700, step: 500, warm: 150 }).then(r => ({ kinds: r.steps.map(s => s.kind + (s.id ? ':' + s.id : '')), labels: r.steps.map(s => s.label), bad: r.steps.filter(s => s.skip || s.error).map(s => s.label + ' ' + (s.skip || s.error)), text: perfReportText(r) })));
  await p.waitForTimeout(50);
  check(await p.evaluate(() => __wk.req >= 2 && __wk.rel === __wk.req), 'на время замера экран не гаснет: блокировка экрана взята и отпущена');
  check(run.kinds.length === 11 && /^plan:\w+$/.test(run.kinds[0]) && run.kinds[1] === run.kinds[0] && /^workout:\w+$/.test(run.kinds[8]) && run.kinds[9] === run.kinds[8] && run.kinds[10] === 'gallery' && !run.bad.length
    && run.kinds.slice(2, 8).join() === 'detail:latpulluh,detail:latpulluh,detail:legpress,detail:legpress,detail:squat,detail:squat',
    `«Замерить»: все 11 шагов — карточка и тренировка в двух видах, три разбора в двух видах, витрина атласа (${run.kinds.join(', ')}${run.bad.length ? '; ' + run.bad.join('; ') : ''})`);
  check(/^Атлас движений: витрина — Манекен \(объёмная графика недоступна\)$/.test(run.labels[10]), `шаг витрины подписан по тому, что показано (${run.labels[10]})`);
  /* фигуры — заглушки (объёма нет): шаги «Анатомии» честно подписаны манекеном без объёмной графики */
  check(/ — Манекен \(объёмная графика недоступна\)$/.test(run.labels[0]) && / — Манекен$/.test(run.labels[1]) && /^Тренировка: .* \(объёмная графика недоступна\)$/.test(run.labels[8]) && /^Тренировка: /.test(run.labels[9]),
    `подписи шагов — по тому, что показано (${run.labels[0]} | ${run.labels[1]} | ${run.labels[8]} | ${run.labels[9]})`);
  const after = await snap();
  check(after === before, 'после замера журнал, настройки, планы, сохранённая тренировка, вид фигуры и прокрутка — как были');
  check(await p.evaluate(() => document.querySelectorAll('#perf-panel .perf-table tbody tr').length === 11 && !document.querySelector('[data-perf-run]').offsetHeight), 'итог: таблица из 11 шагов');
  /* копирование: буфер обмена; не вышло — поле с выделенным текстом */
  await p.evaluate(() => { window.__copied = null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__copied = t; return Promise.resolve(); } } }); });
  await p.click('[data-perf="copy"]'); await p.waitForTimeout(100);
  const copied = await p.evaluate(() => ({ text: window.__copied, msg: document.querySelector('[data-perf-msg]').textContent }));
  check(copied.text && /^Lazy Gym Planner .* — замер скорости, /.test(copied.text) && /\nУстройство: .*\nВидеокарта: /.test(copied.text) && (copied.text.match(/^\d+\. /gm) || []).length === 11 && /Скопировано/.test(copied.msg),
    '«Скопировать результат»: устройство и 11 шагов в буфере обмена');
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('нет доступа')); });
  await p.click('[data-perf="copy"]'); await p.waitForTimeout(100);
  check(await p.evaluate(() => { const ta = document.querySelector('[data-perf-msg] textarea'); return !!ta && ta.value === window.__copied && document.activeElement === ta && ta.selectionEnd - ta.selectionStart === ta.value.length; }),
    'без доступа к буферу — поле с выделенным текстом для ручного копирования');
  await p.click('[data-perf="min"]');
  check(await p.evaluate(() => localStorage.getItem('podhod.perf') === 'min' && !document.querySelector('#perf-panel .perf-body').offsetHeight && /^\d|—/.test(document.querySelector('.perf-pill').textContent.trim())), 'свёрнутая панель — кружок с кадрами в секунду');
  await p.goto('file://' + file + '?perf=0'); await p.waitForTimeout(300);
  check(await p.evaluate(() => !document.querySelector('#perf-panel') && localStorage.getItem('podhod.perf') === null && globalThis.GymPerf === null), '?perf=0 выключает панель');
  await p.close();
}

/* компьютер: параметры в боковой колонке не сворачиваются */
const desk = await open(1280);
await desk.evaluate(() => { S.fold.setup = true; regen(); });
check(await shown(desk, '#f-goal') && !(await shown(desk, '#setup-bar')) && !(await shown(desk, '#setup-fold-end')), 'на компьютере параметры всегда раскрыты');
await desk.close();

await browser.close();
if (errors.length) console.error('Ошибки страницы:\n' + [...new Set(errors)].slice(0, 10).join('\n'));
if (fails.length || errors.length) { console.error(`Проверка интерфейса: ${fails.length} замечаний`); for (const f of fails) console.error('  ✗ ' + f); process.exit(1); }
console.log('Интерфейс: сворачивание блоков, хваты, бережный режим, порядок упражнений, сигнал отдыха, тренировка (экран не гаснет, отдых сверх нуля, таймер удержания), витрина атласа (в «Анатомии» — кадры из общего рендерера, кеш между сеансами, без WebGL — SVG), виды фигуры «Анатомия», «Скелет» и «Манекен», анатомия в карточках плана и на экране тренировки (откат на манекен, без WebGL — SVG), первый экран и разбор на телефоне, карточка, журнал, вес гантелей, Л/П и общий вес, загрузка мышц и тренировка по журналу, счётчик оборудования, панель замера скорости ?perf работают на телефоне и компьютере.');
