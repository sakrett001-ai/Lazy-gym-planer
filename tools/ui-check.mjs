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
  /* режим «Скелет»: у плоской схемы без объёмной графики переключатель недоступен; у объёмной фигуры кости
     грузятся (в офлайн-файле — встроенные данные) и передаются фигуре, под переключателем — авторы моделей */
  check(await g.evaluate(() => $('#mv-skeleton').disabled && !$('#mv-skeleton').checked), 'без объёмной графики «Скелет» недоступен');
  const got = await g.evaluate(async () => {
    const calls = []; const f = detailMotion.f; f.setSkeleton = d => calls.push(d ? d.bones.length : 0);
    applySkeleton(); const box = $('#mv-skeleton'); if (box.disabled) return 'disabled';
    box.click(); for (let i = 0; i < 50 && !calls.some(n => n > 0); i++) await new Promise(r => setTimeout(r, 50));
    const on = { calls: calls.slice(), note: $('#mv-skeleton-note').textContent, pref: motionPrefs.skeleton };
    box.click(); return { on, off: calls.at(-1), pref: motionPrefs.skeleton, hidden: $('#mv-skeleton-note').hidden };
  });
  check(got !== 'disabled' && got.on.calls.at(-1) === 102 && /MyoSim/.test(got.on.note) && got.on.pref === true, '«Скелет» загружает 102 кости и показывает авторов моделей');
  check(got !== 'disabled' && got.off === 0 && got.pref === false && got.hidden, 'повторное нажатие выключает скелет');
  await g.close();
}

/* компьютер: параметры в боковой колонке не сворачиваются */
const desk = await open(1280);
await desk.evaluate(() => { S.fold.setup = true; regen(); });
check(await shown(desk, '#f-goal') && !(await shown(desk, '#setup-bar')) && !(await shown(desk, '#setup-fold-end')), 'на компьютере параметры всегда раскрыты');
await desk.close();

await browser.close();
if (errors.length) console.error('Ошибки страницы:\n' + [...new Set(errors)].slice(0, 10).join('\n'));
if (fails.length || errors.length) { console.error(`Проверка интерфейса: ${fails.length} замечаний`); for (const f of fails) console.error('  ✗ ' + f); process.exit(1); }
console.log('Интерфейс: сворачивание блоков, хваты, бережный режим, витрина атласа и режим «Скелет» работают на телефоне и компьютере.');
