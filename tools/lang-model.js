'use strict';
/* Модель приложения на языке сборки для проверок: модули src/js (без 99-boot.js — первой отрисовки) в песочнице,
   для английского — переведённые словарём i18n/en.json так же, как в build.js, и с тем же началом app.js
   (PODHOD_LANG, PODHOD_LOCALE). Хранилище можно передать — так проверяется работа в одном языке и открытие в другом. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {translateJs} = require('../i18n/translate');
const root = path.resolve(__dirname, '..');
const LOCALES = {ru:{dec:',', plural:'ru', dates:'ru', units:'kg'}, en:{dec:'.', plural:'one', dates:'intl', units:'region'}};
let cache = {};
function source(lang) {
  if (cache[lang]) return cache[lang];
  const dir = path.join(root, 'src/js');
  let js = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && Number.parseInt(f) < 99).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  if (lang !== 'ru') js = translateJs(js, JSON.parse(fs.readFileSync(path.join(root, 'i18n', lang + '.json'), 'utf8')), new Set(), {quotes:'“”'});
  return (cache[lang] = new vm.Script(js, {filename:`app-${lang}.js`}));
}
function loadApp({lang = 'ru', storage = new Map(), nav = lang === 'en' ? ['en-US', 'en'] : ['ru-RU', 'ru']} = {}) {
  const listeners = {};
  const document = {addEventListener:(type, fn) => { (listeners[type] = listeners[type] || []).push(fn); }, querySelector() { return null; }, querySelectorAll() { return []; },
    getElementById() { return null; }, createElement:() => ({style:{}, addEventListener() {}, setAttribute() {}}), body:{appendChild() {}}, documentElement:{lang}};
  const context = {console, document, navigator:{languages:nav, language:nav[0]}, location:{href:'https://site.invalid/', search:'', hash:''},
    localStorage:{getItem:k => storage.get(k) ?? null, setItem:(k, v) => storage.set(k, String(v)), removeItem:k => storage.delete(k)},
    setTimeout:() => 0, clearTimeout() {}, setInterval:() => 0, clearInterval() {}, Intl,
    requestAnimationFrame:() => 0, cancelAnimationFrame() {}, matchMedia:() => ({matches:false}),
    PODHOD_LANG:lang, PODHOD_LOCALE:LOCALES[lang], PODHOD_VERSION:'0.0.0-test'};
  context.window = context;
  vm.createContext(context);
  source(lang).runInContext(context, {timeout:20000});
  const get = expression => vm.runInContext(expression, context, {timeout:10000});
  get('renderSetup=()=>{}; renderPlan=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  /* событие документа для обработчиков модулей (change, input, click): target — простой объект с полями элемента */
  const fire = (type, target) => { for (const fn of listeners[type] || []) fn({type, target, preventDefault() {}}); };
  return {get, storage, context, fire, json:expression => JSON.parse(get(`JSON.stringify(${expression})`))};
}
module.exports = {loadApp};
