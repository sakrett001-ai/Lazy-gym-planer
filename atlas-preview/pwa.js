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
