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
/* рисунки движений — заглушки: проверяется поведение и раскладка, а не фигура */
const fakeFigures = page => page.evaluate(() => {
  const fake = () => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fig'); return { svg, camera: 'side', at() {}, setTrace() {}, setVectors() {}, setJoints() {}, setStress() {}, setMuscles() {}, setRegion() {}, dispose() {} }; };
  window.buildFigure = fake; window.createMotionFigure = fake;
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
  check(fig.anat.last?.bones === 102 && fig.anat.last.muscles === 530 && fig.anat.pri.every(m => fig.anat.last.level[m] === 1) && fig.anat.pressed === 'anatomy' && !fig.anat.busy && /О демонстрациях/.test(fig.anat.note) && fig.anat.note.length < 260,
    '«Анатомия» по умолчанию: 530 мышц на 102 костях, основные мышцы выделены, короткая подпись');
  check(fig.skel.last?.bones === 102 && fig.skel.last.muscles === 0 && fig.skel.pressed === 'skeleton' && fig.skel.pref === 'skeleton' && /MyoSim/.test(fig.skel.note), '«Скелет» — только кости');
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

/* компьютер: параметры в боковой колонке не сворачиваются */
const desk = await open(1280);
await desk.evaluate(() => { S.fold.setup = true; regen(); });
check(await shown(desk, '#f-goal') && !(await shown(desk, '#setup-bar')) && !(await shown(desk, '#setup-fold-end')), 'на компьютере параметры всегда раскрыты');
await desk.close();

await browser.close();
if (errors.length) console.error('Ошибки страницы:\n' + [...new Set(errors)].slice(0, 10).join('\n'));
if (fails.length || errors.length) { console.error(`Проверка интерфейса: ${fails.length} замечаний`); for (const f of fails) console.error('  ✗ ' + f); process.exit(1); }
console.log('Интерфейс: сворачивание блоков, хваты, бережный режим, порядок упражнений, сигнал отдыха, тренировка (экран не гаснет, отдых сверх нуля, таймер удержания), витрина атласа, виды фигуры «Анатомия», «Скелет» и «Манекен», первый экран и разбор на телефоне, карточка, журнал и счётчик оборудования работают на телефоне и компьютере.');
