/* ===================== СИСТЕМНАЯ «НАЗАД» НА ОКНАХ ПОВЕРХ ПЛАНА =====================
   Экран тренировки и разбор движения — окна <dialog> поверх плана. Без записи в истории системная «Назад» телефона уводила
   со страницы (в установленном приложении — закрывала его). Каждое открытое окно кладёт в историю свою запись
   (history.pushState); «Назад» снимает верхнюю — закрывается верхнее окно (разбор поверх тренировки — сначала разбор),
   план остаётся. Окно, закрытое кнопкой или Esc, свою запись убирает само (history.go назад), и «Назад» в плане ведёт
   туда же, куда и раньше. Вложенная запись — карточка упражнения, открытая из витрины атласа: «Назад» возвращает к витрине.
   Перезагрузка на записи окна: окна уже нет — запись снимается сразу. */
const OverlayBack = (() => {
  const stack = []; /* {id, close} снизу вверх */
  let skip = 0; /* сколько событий popstate вызвали мы сами (history.go) — их не обрабатывать */
  const H = () => typeof history !== 'undefined' && typeof history.pushState === 'function' ? history : null;
  function open(id, close) {
    const h = H(); if (!h || stack.some(x => x.id === id)) return;
    stack.push({id, close});
    try { h.pushState(Object.assign({}, h.state, {lgOverlay:id, lgDepth:stack.length}), ''); } catch (e) { stack.pop(); }
  }
  /* окно закрыто не «Назад»: убрать его запись и записи над ним */
  function closed(id) {
    const i = stack.findIndex(x => x.id === id); if (i < 0) return;
    const n = stack.length - i; stack.splice(i);
    const h = H(); if (!h) return;
    skip++; try { h.go(-n); } catch (e) { skip--; }
  }
  function onPop() {
    if (skip) { skip--; return; }
    const top = stack.pop(); if (top) top.close();
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('popstate', onPop);
    /* перезагрузка или возврат на страницу на записи окна: окна нет — запись не нужна */
    try { const h = H(); if (h && h.state && h.state.lgOverlay) { skip++; h.go(-Math.max(1, h.state.lgDepth | 0)); } } catch (e) {}
  }
  return {open, closed, has:id => stack.some(x => x.id === id), state:() => ({stack:stack.map(x => x.id), skip})};
})();
