'use strict';
/* Правила языка с первой отрисовки (замечание 7 тестера: «Traps 1,5» при первой отрисовке и «1.5» потом). Десятичный
   разделитель, множественное число и даты задаёт PODHOD_LOCALE в начале app.js (build.js), модули читают его при
   загрузке — до первого renderPlan() (99-boot.js). Здесь — модель приложения на языке сборки (tools/lang-model.js)
   до любых вызовов, то есть в том состоянии, в каком её застаёт первая отрисовка. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const {loadApp} = require('./lang-model');

test('English: decimal point, English plurals and the load bars are right before the first render', () => {
  const en = loadApp({lang:'en'});
  assert.deepEqual(en.json('[DEC, fmtNum(1.5), fmtKg(52.5), plural(1,"set","sets","sets"), plural(21,"set","sets","sets"), plural(2,"set","sets","sets")]'), ['.', '1.5', '52.5', 'set', 'sets', 'sets']);
  const bars = en.get('loadBars({traps:1.5, lats:3})');
  assert.match(bars, /1\.5</); assert.doesNotMatch(bars, /1,5/);
  assert.match(en.get('fmtTon(41083)'), /^41,083$/, 'thousands with a comma');
});
test('Russian keeps its comma and three plural forms', () => {
  const ru = loadApp({lang:'ru'});
  assert.deepEqual(ru.json('[DEC, fmtNum(1.5), plural(1,"а","б","в"), plural(3,"а","б","в"), plural(5,"а","б","в"), plural(21,"а","б","в"), fmtDay("2025-11-09", true)]'), [',', '1,5', 'а', 'б', 'в', 'а', '9 ноя 2025']);
});
test('English dates follow the browser locale: en-US «Nov 9», en-GB «9 Nov»', () => {
  const us = loadApp({lang:'en', nav:['en-US', 'en']}), gb = loadApp({lang:'en', nav:['en-GB', 'en']}), other = loadApp({lang:'en', nav:['de-DE']});
  const y = new Date().getFullYear();
  assert.equal(us.get(`fmtDay("${y}-11-09", true)`), 'Nov 9');
  assert.equal(gb.get(`fmtDay("${y}-11-09", true)`), '9 Nov');
  assert.equal(us.get('fmtDay("2020-03-01", true)'), 'Mar 1, 2020');
  assert.equal(gb.get('fmtDay("2020-03-01", true)'), '1 Mar 2020');
  assert.equal(other.get(`fmtDay("${y}-11-09", false)`), 'Nov 9', 'no English in the browser list — plain English');
  assert.equal(us.get('fmtDay(todayKey())'), 'today');
});
test('the build writes the language and locale at the very start of app.js, before the modules and the first render', () => {
  const build = fs.readFileSync(path.join(__dirname, '../build.js'), 'utf8');
  assert.match(build, /js = `window\.PODHOD_VERSION=[^`]*window\.PODHOD_LANG='\$\{lang\}';window\.PODHOD_LOCALE=\$\{JSON\.stringify\(L\.locale\)\};\\n` \+ js;/);
  assert.doesNotMatch(build, /plural = \(n, a, b, c\) =>|DEC = '\.'/, 'no locale patch appended after 99-boot.js');
  const LANGS = build.slice(build.indexOf('const LANGS = {'), build.indexOf('/* выбор языка при заходе'));
  for (const lang of ['ru', 'en']) assert.match(LANGS, new RegExp(`\\b${lang}:\\{dir:[\\s\\S]*?locale:\\{dec:`), lang + ' has a locale');
});
