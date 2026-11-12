/* ===================== СИСТЕМНАЯ «НАЗАД» НА ОКНАХ ПОВЕРХ ПЛАНА =====================
   Экран тренировки и разбор движения — окна <dialog> поверх плана. Без записи в истории системная «Назад» телефона уводила
   со страницы (в установленном приложении — закрывала его). Окно, открытое нажатием, кладёт в историю свою запись
   (history.pushState); «Назад» снимает верхнюю — закрывается верхнее окно (разбор поверх тренировки — сначала разбор),
   план остаётся. Окно, закрытое кнопкой или Esc, свою запись убирает само (history.go назад), и «Назад» в плане ведёт
   туда же, куда и раньше. Вложенная запись — карточка упражнения, открытая из витрины атласа: «Назад» возвращает к витрине.
   Запись кладётся только при открытии нажатием человека (navigator.userActivation; где его нет — всегда) и только если
   браузер её принял: Chrome молча пропускает pushState чаще 200 раз за 10 с, и тогда «назад» на непринятую запись увёл бы
   со страницы (проверки открывают и закрывают разбор сотни раз подряд). Перезагрузка на записи окна: окна уже нет —
   запись снимается сразу. */
const OverlayBack = (() => {
  const stack = []; /* {id, close, token} снизу вверх — только окна со своей записью в истории */
  const later = []; /* окна, открытые, пока наш переход назад ещё не завершился: запись — после него */
  let skip = 0, seq = 0, timer = 0; /* skip — сколько событий popstate вызвали мы сами (history.go): их не обрабатывать */
  const H = () => typeof history !== 'undefined' && typeof history.pushState === 'function' ? history : null;
  const byHand = () => { try { const u = navigator.userActivation; return !u || u.isActive; } catch (e) { return true; } };
  function push(it) {
    const h = H(); if (!h) return;
    const token = ++seq + ':' + it.id;
    try { h.pushState(Object.assign({}, h.state, {lgOverlay:it.id, lgDepth:stack.length + 1, lgToken:token}), ''); } catch (e) { return; }
    if (h.state && h.state.lgToken === token) stack.push({...it, token});
  }
  /* Переход назад асинхронный: запись, положенная до его конца, оказалась бы над целью перехода и пропала — окно открыто,
     а «назад» потом увёл бы со страницы. Поэтому новая запись ждёт конца нашего перехода (или 1,5 с, если браузер его
     не выполнил). */
  function settle() { clearTimeout(timer); timer = 0; skip = 0; while (later.length) push(later.shift()); }
  function open(id, close) {
    if (!H() || stack.some(x => x.id === id) || later.some(x => x.id === id) || !byHand()) return;
    if (skip) later.push({id, close}); else push({id, close});
  }
  /* окно закрыто не «Назад»: убрать его запись и записи над ним */
  function closed(id) {
    const j = later.findIndex(x => x.id === id); if (j >= 0) later.splice(j);
    const i = stack.findIndex(x => x.id === id); if (i < 0) return;
    const n = stack.length - i, top = stack[stack.length - 1], h = H(); stack.splice(i);
    if (!h) return;
    /* наша запись не текущая (переходов в пути нет) — уходить назад нельзя: это была бы чужая запись */
    if (!skip && !(h.state && h.state.lgToken === top.token)) return;
    skip++; clearTimeout(timer); timer = setTimeout(settle, 1500);
    try { h.go(-n); } catch (e) { settle(); }
  }
  function onPop() {
    if (skip) { if (--skip === 0) settle(); return; }
    const top = stack.pop(); if (top) top.close();
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('popstate', onPop);
    /* перезагрузка или возврат на страницу на записи окна: окна нет — запись не нужна */
    try { const h = H(); if (h && h.state && h.state.lgOverlay) { skip++; timer = setTimeout(settle, 1500); h.go(-Math.max(1, h.state.lgDepth | 0)); } } catch (e) {}
  }
  return {open, closed, has:id => stack.some(x => x.id === id), state:() => ({stack:stack.map(x => x.id), skip, later:later.map(x => x.id)})};
})();
