/* Сервис-воркер Lazy Gym Planner: кеширует оболочку приложения, работает без сети, обновляется при новой версии. */
const VERSION = '4.11.0-b4d1a85a8ee0';
const CACHE_PREFIX = 'podhod@' + self.registration.scope + ':';
const CACHE = CACHE_PREFIX + VERSION;
const SHELL = ['./', './index.html', './app.css?v=' + VERSION, './app.js?v=' + VERSION, './volume.js?v=' + VERSION, './pwa.js?v=' + VERSION, './manifest.webmanifest', './manifest.webmanifest?v=' + VERSION,
  './en/', './en/index.html', './en/app.css?v=' + VERSION, './en/app.js?v=' + VERSION, './en/pwa.js?v=' + VERSION, './en/manifest.webmanifest', './en/manifest.webmanifest?v=' + VERSION,
  './icon.svg', './icon-192.png?v=' + VERSION, './icon-512.png?v=' + VERSION, './icon-maskable-512.png?v=' + VERSION,
  './apple-touch-icon.png?v=' + VERSION, './favicon-32.png?v=' + VERSION,
  'fonts/golos-text-cyrillic-400.woff2', 'fonts/golos-text-cyrillic-500.woff2', 'fonts/golos-text-cyrillic-600.woff2',
  'fonts/golos-text-latin-400.woff2', 'fonts/golos-text-latin-500.woff2', 'fonts/golos-text-latin-600.woff2',
  'fonts/russo-one-cyrillic-400.woff2', 'fonts/russo-one-latin-400.woff2', 'fonts/jetbrains-mono-cyrillic-500.woff2', 'fonts/jetbrains-mono-latin-500.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch:false})).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.open(CACHE).then(c => c.match(e.request.url.includes('/en/') ? './en/index.html' : './index.html')))));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
