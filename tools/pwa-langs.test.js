'use strict';
/* Сервис-воркер скачивает только язык, которым пользуются: оболочка русской страницы — без английской (≈0,4 МБ
   в сжатом виде) и наоборот; второй язык — когда его откроют с сетью; без сети и без скачанной копии — подсказка. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const SCOPE = 'https://test.invalid/app/', DAY = 864e5;

function cacheStorage() {
  const stores = new Map();
  const abs = r => new URL(typeof r === 'string' ? r : r.url, SCOPE).href;
  const open = async name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      addAll: async list => { for (const u of list) m.set(abs(u), new Response('file ' + abs(u))); },
      put: async (r, res) => { m.set(abs(r), res); },
      match: async r => { const hit = m.get(abs(r)); return hit ? hit.clone() : undefined; }
    };
  };
  return {stores, api:{open, keys:async () => [...stores.keys()], delete:async k => stores.delete(k),
    match:async r => { for (const m of stores.values()) { const hit = m.get(abs(r)); if (hit) return hit.clone(); } }}};
}
/* sw.js в песочнице: открытые окна, сохранённые отметки языков, сеть */
function worker({windows = [], langs = null, online = true} = {}) {
  const handlers = {}, {stores, api} = cacheStorage();
  const self = {addEventListener:(n, f) => handlers[n] = f, skipWaiting() {}, location:{origin:'https://test.invalid'}, registration:{scope:SCOPE},
    clients:{claim() {}, matchAll:async () => windows.map(url => ({url}))}};
  const fetch = async req => { if (!online) throw new TypeError('offline'); return new Response('net ' + req.url); };
  const ctx = {self, caches:api, Response, fetch, URL};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src/sw.js'), 'utf8').replace(/__VERSION__/g, '9.9.9-test') + '\n;this.api={shellFor,langOf,LANGS_CACHE,LANGS_URL,CACHE};', ctx);
  const ready = langs ? api.open(ctx.api.LANGS_CACHE).then(c => c.put(ctx.api.LANGS_URL, new Response(JSON.stringify(langs)))) : Promise.resolve();
  const files = () => [...(stores.get(ctx.api.CACHE) || new Map()).keys()];
  return {handlers, stores, api, ctx, files, ready,
    install:async () => { await ready; let p; handlers.install({waitUntil:x => p = x}); await p; },
    message:async data => { let p; handlers.message({data, waitUntil:x => p = x}); await p; },
    fetch:async (url, mode = 'navigate') => { let p; handlers.fetch({request:{url, method:'GET', mode}, respondWith:x => p = x}); return p; },
    langs:async () => { const hit = await (await api.open(ctx.api.LANGS_CACHE)).match(ctx.api.LANGS_URL); return hit ? hit.json() : null; }};
}
const english = f => f.includes('/app/en/'), russianPage = f => /\/app\/(index\.html|app\.|pwa\.|manifest\.|$)/.test(f.replace(/\?.*$/, ''));

test('a Russian page caches the Russian shell and shared files only; an English page — the English shell', async () => {
  const ru = worker({windows:[SCOPE]}); await ru.install();
  assert(ru.files().some(russianPage), 'Russian index cached');
  assert.equal(ru.files().filter(english).length, 0, 'no English files for a Russian user');
  for (const f of ['volume.js?v=9.9.9-test', 'fonts/golos-text-cyrillic-400.woff2', 'icon-192.png?v=9.9.9-test']) assert(ru.files().includes(SCOPE + f), f);
  assert.deepEqual(Object.keys(await ru.langs()), ['ru'], 'the open page is remembered');
  const en = worker({windows:[SCOPE + 'en/?x=1']}); await en.install();
  assert(en.files().includes(SCOPE + 'en/index.html') && en.files().includes(SCOPE + 'en/app.js?v=9.9.9-test'));
  assert.equal(en.files().filter(russianPage).length, 0, 'no Russian files for an English user');
  assert(en.files().includes(SCOPE + 'volume.js?v=9.9.9-test'), 'the 3D engine is shared');
});
test('an update keeps the languages used in the last 30 days, drops older ones, and caches both only when nothing is known', async () => {
  const now = Date.now();
  const recent = worker({langs:{ru:now - DAY, en:now - 5 * DAY}}); await recent.install();
  assert(recent.files().some(english) && recent.files().some(russianPage), 'both used this month');
  const stale = worker({langs:{ru:now - DAY, en:now - 31 * DAY}}); await stale.install();
  assert.equal(stale.files().filter(english).length, 0, 'English not opened for a month is not downloaded again');
  const open = worker({langs:{ru:now - 40 * DAY}, windows:[SCOPE + 'en/index.html']}); await open.install();
  assert(open.files().some(english) && !open.files().some(russianPage), 'the page open now decides');
  const blank = worker(); await blank.install();
  assert(blank.files().some(english) && blank.files().some(russianPage), 'unknown: both, as before');
  const junk = worker({langs:{ru:'yesterday', de:now}, windows:['https://test.invalid/other/', SCOPE + 'lazy-gym-planner-offline-en.html']}); await junk.install();
  assert(junk.files().some(english) && junk.files().some(russianPage), 'foreign pages and broken marks are ignored');
});
test('the second language opened online is downloaded whole and remembered', async () => {
  const w = worker({windows:[SCOPE]}); await w.install();
  await w.message({type:'lang', lang:'en'});
  for (const f of w.ctx.api.shellFor(['en'])) assert(w.files().includes(new URL(f, SCOPE).href), f);
  assert(Number.isFinite((await w.langs()).en));
  const before = w.files().length; await w.message({type:'lang', lang:'de'}); await w.message({type:'lang'});
  assert.equal(w.files().length, before, 'unknown languages are ignored');
});
test('offline: the cached language opens, a missing one gets an honest bilingual page, other requests fail as before', async () => {
  /* сеть пропала после установки */
  const net = worker({windows:[SCOPE]}); await net.install();
  net.ctx.fetch = async () => { throw new TypeError('offline'); };
  const ru = await net.fetch(SCOPE + 'index.html?from=home');
  assert.equal(await ru.text(), 'file ' + SCOPE + 'index.html', 'Russian page from the cache');
  const en = await net.fetch(SCOPE + 'en/');
  assert.equal(en.status, 503);
  const text = await en.text();
  assert.match(text, /Английская версия ещё не скачана/); assert.match(text, /English version is not downloaded/); assert.match(text, /href="\.\.\/"/);
  const data = await net.fetch(SCOPE + 'en/app.js?v=1', 'no-cors');
  assert.equal(data.type, 'error', 'a missing script is a network error, not a page');
});
test('activation removes old versions of this scope only and keeps the language marks', async () => {
  const w = worker({windows:[SCOPE]}); await w.install();
  const prefix = 'podhod@' + SCOPE + ':';
  for (const k of [prefix + 'old', 'podhod@https://test.invalid/:4.1.8', 'other-project']) await w.api.open(k);
  let p; w.handlers.activate({waitUntil:x => p = x}); await p;
  assert.deepEqual((await w.api.keys()).sort(), [w.ctx.api.CACHE, w.ctx.api.LANGS_CACHE, 'other-project', 'podhod@https://test.invalid/:4.1.8'].sort());
});

/* pwa.js: страница сообщает свой язык; без сети ссылка на нескачанный язык показывает подсказку */
function pwaPage({lang = 'ru', online = true, cached = false} = {}) {
  const posted = [], listeners = {}, body = [];let bar = null, href = null;
  const worker = name => ({postMessage:m => posted.push([name, m])});
  const serviceWorker = {controller:{state:'activated'}, addEventListener() {}, register:async () => ({waiting:null, addEventListener() {}}),
    ready:Promise.resolve({active:worker('active'), waiting:worker('waiting')})};
  const button = {};
  const document = {documentElement:{lang}, addEventListener:(n, f) => listeners[n] = f, getElementById:id => bar && bar.id === id ? bar : null,
    createElement:() => ({setAttribute() {}, querySelector:() => button, set innerHTML(v) { this.html = v; }}), body:{appendChild:b => { bar = b; body.push(b); }}};
  const location = {protocol:'https:', reload() {}, set href(v) { href = v; }, get href() { return href; }};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src/pwa.js'), 'utf8'), {navigator:{serviceWorker, onLine:online}, location, document, setInterval:() => 0,
    caches:{match:async () => cached ? new Response('page') : undefined}});
  const click = async () => { let prevented = false; const a = {href:SCOPE + 'en/'};
    listeners.click({target:{closest:s => s === 'a.lang' ? a : null}, preventDefault:() => { prevented = true; }}); await new Promise(r => setTimeout(r, 0)); return prevented; };
  return {posted, click, bar:() => bar, href:() => href, button};
}
test('the page tells both the running and the waiting service worker its language', async () => {
  const p = pwaPage({lang:'en'}); await new Promise(r => setTimeout(r, 0));
  assert.deepEqual(JSON.parse(JSON.stringify(p.posted)), [['active', {type:'lang', lang:'en'}], ['waiting', {type:'lang', lang:'en'}]]);
});
test('offline language switch: a hint when the other language is not downloaded, normal navigation otherwise', async () => {
  const missing = pwaPage({online:false});
  assert.equal(await missing.click(), true); assert.match(missing.bar().html, /Английская версия ещё не скачана/); assert.equal(missing.href(), null);
  missing.button.onclick(); assert.equal(missing.bar().hidden, true);
  const cached = pwaPage({online:false, cached:true});
  assert.equal(await cached.click(), true); assert.equal(cached.href(), SCOPE + 'en/'); assert.equal(cached.bar(), null);
  const online = pwaPage({online:true});
  assert.equal(await online.click(), false, 'online: the link works as a link'); assert.equal(online.bar(), null);
});
