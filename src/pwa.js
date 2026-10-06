/* Регистрация сервис-воркера и уведомление о новой версии. */
(function () {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; location.reload(); });
  navigator.serviceWorker.register('__SW__').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(() => nw.postMessage('skipWaiting'));
      });
    });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
  function showUpdate(apply) {
    let bar = document.getElementById('pwa-update');
    if (!bar) { bar = document.createElement('div'); bar.id = 'pwa-update'; bar.className = 'pwa-update'; bar.innerHTML = '<span>Доступна новая версия Lazy Gym Planner.</span><button type="button" class="btn">Обновить</button>'; document.body.appendChild(bar); }
    bar.querySelector('button').onclick = apply;
  }
})();
