/* Проверка английской сборки: проходит по экранам приложения и ищет кириллицу в тексте и подписях.
   node tools/i18n-audit.mjs [--full] [--json out.json]   — нужен собранный dist/ (npm run build).
   По умолчанию рисунки движений заменены заглушками (текст от них не зависит) — проверка идёт около минуты;
   --full рисует настоящие фигуры и 3D (около 20 минут).
   Экраны: план (форматы × цели × уровни, разовая и недельная, места и замены), атлас мышц (все мышцы × места),
   журнал с записями, разбор каждого упражнения в четырёх положениях, режим тренировки, тексты копирования. */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const fileArg = process.argv.indexOf('--file'), file = fileArg > 0 ? path.resolve(process.argv[fileArg + 1]) : path.join(root, 'dist/lazy-gym-planner-offline-en.html');
if (!fs.existsSync(file)) { console.error('Нет dist/lazy-gym-planner-offline-en.html — сначала npm run build'); process.exit(2); }

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + file);
await page.waitForTimeout(600);
const FULL = process.argv.includes('--full');
if (!FULL) await page.evaluate(() => {
  const fake = (anim, opts = {}) => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fig'); return { svg, camera: opts.camera || 'side', at() {}, setTrace() {}, setVectors() {}, setJoints() {}, setStress() {}, setMuscles() {}, setRegion() {}, dispose() {} }; };
  window.buildFigure = fake; window.createMotionFigure = fake;
});

const found = new Map();
async function scan(state, extra = '') {
  const hits = await page.evaluate(({ extra }) => {
    const CYR = /[А-Яа-яЁё]/, out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || ['SCRIPT', 'STYLE'].includes(p.tagName)) continue;
      if (CYR.test(n.nodeValue)) out.push({ text: n.nodeValue.trim().slice(0, 160), where: p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + (p.className && typeof p.className === 'string' ? '.' + p.className.split(' ')[0] : '') });
    }
    for (const el of document.querySelectorAll('*')) for (const a of ['aria-label', 'title', 'placeholder', 'alt', 'aria-valuetext', 'aria-description', 'label', 'value'])
      if (el.hasAttribute(a) && CYR.test(el.getAttribute(a)) && !(a === 'value' && el.tagName === 'INPUT' && el.type === 'text')) out.push({ text: `[${a}] ` + el.getAttribute(a).slice(0, 160), where: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') });
    if (extra) for (const line of extra.split('\n')) if (CYR.test(line)) out.push({ text: line.slice(0, 160), where: 'text-export' });
    return out;
  }, { extra });
  for (const h of hits) { if (/^\[title\] Русская версия$/.test(h.text)) continue; /* название языка на нём самом */ const k = h.text; if (!found.has(k)) found.set(k, { ...h, state }); }
}
const run = js => page.evaluate(js);
const t0 = Date.now(), step = name => { if (process.env.I18N_AUDIT_VERBOSE) console.error(`${((Date.now() - t0) / 1000).toFixed(1)} с · ${name}`); };

/* 1. план: форматы, цели, уровни; разовая тренировка и неделя */
step('1. план');
for (const mode of ['single', 'program']) for (const format of ['classic', 'superset', 'circuit', 'static']) for (const goal of ['strength', 'mass', 'cut']) for (const level of ['beg', 'adv']) {
  await run(`(()=>{Object.assign(S,{view:'plan',mode:'${mode}',format:'${format}',goal:'${goal}',level:'${level}',week:1,day:0});regen();})()`);
  await scan(`plan ${mode}/${format}/${goal}/${level}`, await run('planText()'));
  if (mode === 'program') for (const week of [2, 3, 4]) for (const day of [0, 1, 2]) {
    await run(`(()=>{S.week=${week};S.day=${day};done={};renderPlan();})()`);
    await scan(`program week ${week} day ${day}`, await run('planText()'));
  }
}
/* группы мышц и количество упражнений */
step('группы мышц');
for (const groups of [['quads', 'glutes', 'hams', 'calves'], ['biceps', 'triceps', 'forearms'], ['abs', 'cardio'], []]) {
  await run(`(()=>{Object.assign(S,{mode:'single',format:'classic',goal:'mass',level:'mid',groups:${JSON.stringify(groups)}});regen();})()`);
  await scan('groups ' + groups.join(','));
}
/* 2. места, замены, удаление, оборудование */
step('2. места');
await run(`(()=>{Object.assign(S,{groups:['chest','back','shoulders','biceps'],place:'home',adapt:'gym'});ensurePlaces(S);regen();})()`);
await scan('home adapted from gym', await run('planText()'));
await run(`(()=>{Object.assign(S,{place:'street',adapt:'gym'});ensurePlaces(S);regen();})()`);
await scan('street adapted from gym');
await run(`(()=>{placeDel=true;eqOpen=true;renderSetup();})()`);
await scan('place delete armed, equipment open');
await run(`(()=>{placeDel=false;S.place='gym';S.adapt=null;ensurePlaces(S);setFocus('biceps');regen();})()`);
await scan('focus chip');
await run(`(()=>{setFocus(null);regen();})()`);
/* замены в карточке до исчерпания */
for (let i = 0; i < 6; i++) { const b = await page.$('[data-swap]'); if (!b) break; await b.click(); await page.waitForTimeout(80); }
await scan('swaps');
/* 3. атлас мышц */
step('3. атлас');
await run(`(()=>{S.view='atlas';renderSetup();renderPlan();})()`);
for (const place of ['gym', 'home', 'street']) for (const m of await run('ATLAS_ORDER')) {
  await run(`(()=>{S.place='${place}';ensurePlaces(S);S.atlasM='${m}';atlasEx=null;renderAtlas();document.querySelectorAll('.at-more').forEach(n=>n.hidden=false);document.querySelectorAll('.at-other').forEach(d=>d.open=true);})()`);
  await scan(`atlas ${place}/${m}`);
}
await run(`(()=>{S.place='gym';ensurePlaces(S);})()`);
/* 4. журнал с записями: вес, вес тела, время, статодинамика, замеры */
step('4. журнал');
await run(`(()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10);};
  LOG.data.bbbench=[{d:d(14),s:[[60,8],[60,8]],target:2},{d:d(7),s:[[62.5,8],[62.5,7]],target:2,wk:2},{d:d(3),s:[[35,7],[35,7],[35,6]],target:3,fmt:'static'}];
  LOG.data.pushup=[{d:d(10),s:[[null,15],[null,12]]},{d:d(4),s:[[null,18],[null,14]]}];
  LOG.data.plank=[{d:d(6),s:[[null,45],[null,40]]}];
  S.view='journal';renderSetup();renderPlan();})()`);
await scan('journal');
await run(`(()=>{document.querySelectorAll('details').forEach(d=>d.open=true);})()`);
await scan('journal expanded');
/* 5. план с историей: карточки, история, разминка, подсказки */
step('5. план с историей');
await run(`(()=>{Object.assign(S,{view:'plan',mode:'single',format:'classic',groups:['chest','triceps'],count:6});regen();document.querySelectorAll('[data-hist]').forEach(b=>b.click());document.querySelectorAll('details').forEach(d=>d.open=true);})()`);
await scan('plan with history');
await run(`(()=>{S.format='static';regen();document.querySelectorAll('[data-hist]').forEach(b=>b.click());})()`);
await scan('static plan with history');
/* 6. разбор каждого упражнения в четырёх положениях */
step('6. разбор');
const ids = await run('EX.map(e=>e.id)');
for (const id of ids) {
  await run(`openMotionItem(previewItem('${id}'))`);
  for (const pose of ['start', 'middle', 'end', 'return']) { await run(`document.querySelector('[data-mv-pose="${pose}"]').click()`); await scan(`motion ${id} ${pose}`); }
  await run('closeMotion()');
}
/* 7. режим тренировки и отдых */
step('7. режим');
await run(`(()=>{S.format='classic';regen();})()`);
await page.click('#start-workout'); await page.waitForTimeout(300);
await scan('workout');
await run(`(()=>{startRest(90);})()`);
await scan('rest timer');
await run(`(()=>{closeWorkout&&closeWorkout();stopRest();})()`);

await browser.close();
const list = [...found.values()];
const outIdx = process.argv.indexOf('--json');
if (outIdx > 0) fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify(list, null, 1));
if (errors.length) console.error('Ошибки страницы:\n' + [...new Set(errors)].slice(0, 10).join('\n'));
if (list.length) {
  console.error(`Английская версия: найдено ${list.length} строк с кириллицей`);
  for (const h of list.slice(0, 80)) console.error(`  ${h.state} · ${h.where}: ${h.text}`);
  process.exit(1);
}
console.log('Английская версия: кириллицы нет на ' + ids.length + ' упражнениях и всех экранах.' + (errors.length ? ' Есть ошибки страницы.' : ''));
process.exit(errors.length ? 1 : 0);
