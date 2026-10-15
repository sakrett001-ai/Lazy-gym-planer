/* Регистрация сервис-воркера и уведомление о новой версии. */
(function () {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  let refreshing = false, requested = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    if (requested) { refreshing = true; location.reload(); }
    else if (hadController) showUpdate(navigator.serviceWorker.controller);
  });
  navigator.serviceWorker.register('sw.js').then(reg => {
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw);
      });
    });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
  /* язык этой страницы: сервис-воркер держит в кеше только те языки, которыми пользуются (см. sw.js), и докачивает
     этот, если его открыли впервые; сообщение получают и работающий, и ожидающий обновления сервис-воркер */
  const lang = (document.documentElement && document.documentElement.lang) === 'en' ? 'en' : 'ru';
  if (navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(reg => {
    for (const w of [reg.active, reg.waiting]) if (w) w.postMessage({type:'lang', lang});
  }).catch(() => {});
  /* без сети: переход на язык, который ещё не скачан, — подсказка вместо пустой страницы браузера */
  if (document.addEventListener) document.addEventListener('click', e => {
    const a = e.target && e.target.closest ? e.target.closest('a.lang') : null;
    if (!a || navigator.onLine !== false || typeof caches === 'undefined') return;
    e.preventDefault();
    caches.match(a.href).then(hit => { if (hit) location.href = a.href; else showLangHint(); }, () => { location.href = a.href; });
  });
  function showLangHint() {
    let bar = document.getElementById('pwa-lang');
    if (!bar) { bar = document.createElement('div'); bar.id = 'pwa-lang'; bar.className = 'pwa-update'; bar.setAttribute('role', 'status'); bar.innerHTML = '<span>Английская версия ещё не скачана. Откройте её один раз с интернетом — потом она будет работать и без сети.</span><button type="button" class="btn">Понятно</button>'; document.body.appendChild(bar); }
    bar.hidden = false;
    bar.querySelector('button').onclick = () => { bar.hidden = true; };
  }
  function showUpdate(worker) {
    let bar = document.getElementById('pwa-update');
    if (!bar) { bar = document.createElement('div'); bar.id = 'pwa-update'; bar.className = 'pwa-update'; bar.innerHTML = '<span>Доступна новая версия Lazy Gym Planner.</span><button type="button" class="btn">Обновить</button>'; document.body.appendChild(bar); }
    bar.querySelector('button').onclick = () => {
      requested = true;
      if (worker.state === 'activated') { refreshing = true; location.reload(); }
      else worker.postMessage('skipWaiting');
    };
  }
})();
