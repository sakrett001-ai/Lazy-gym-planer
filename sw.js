/* Сервис-воркер Lazy Gym Planner: кеширует оболочку приложения, работает без сети, обновляется при новой версии. */
const VERSION = '4.1.4';
const CACHE = 'podhod-' + VERSION;
const SHELL = ['./', './index.html', './app.css?v=' + VERSION, './app.js?v=' + VERSION, './pwa.js?v=' + VERSION, './manifest.webmanifest',
  './en/', './en/index.html', './en/app.css?v=' + VERSION, './en/app.js?v=' + VERSION, './en/pwa.js?v=' + VERSION, './en/manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  'fonts/golos-text-cyrillic-400.woff2', 'fonts/golos-text-cyrillic-500.woff2', 'fonts/golos-text-cyrillic-600.woff2',
  'fonts/golos-text-latin-400.woff2', 'fonts/golos-text-latin-500.woff2', 'fonts/golos-text-latin-600.woff2',
  'fonts/russo-one-cyrillic-400.woff2', 'fonts/russo-one-latin-400.woff2', 'fonts/jetbrains-mono-cyrillic-500.woff2', 'fonts/jetbrains-mono-latin-500.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request, {ignoreSearch:false}).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request.url.includes('/en/') ? './en/index.html' : './index.html'))));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
