/* ===================== АТЛАС ДВИЖЕНИЙ: ВИТРИНА =====================
   Кнопка «Атлас движений» открывает витрину: все упражнения миниатюрами манекена, по группам мышц. Сверху — фильтр
   «Чем работать» (свободные веса, тренажёры и блоки, резинки, свой вес), «только то, что есть в месте» и поиск.
   Миниатюра открывает подробный разбор в том же окне; «← Все упражнения» возвращает к витрине на то же место.
   «Увеличить» в карточке плана по-прежнему открывает сразу разбор.
   Миниатюра — неподвижный SVG-кадр того же манекена, что в карточках плана (конечная точка движения), строится,
   когда подходит к экрану, по одной за кадр; готовые миниатюры переиспользуются при смене фильтра. */
const WORK_KINDS = [
  {id:'all', name:'Всё'}, {id:'free', name:'Свободные веса'}, {id:'mach', name:'Тренажёры и блоки'},
  {id:'band', name:'Резинки'}, {id:'body', name:'Свой вес'}
];
const EQUIP_CAT = Object.fromEntries(EQUIP.map(e => [e.id, e.cat]));
const FREE_WEIGHTS = new Set(['db', 'bb', 'kb']);
/* чем работать: тренажёр или блок важнее всего (без него упражнение не сделать), потом свободный вес, потом резинка;
   без них — свой вес (скамья, турник, брусья, ролик — опора, а не отягощение) */
function workKind(ex) {
  const ids = ex.eq.flat();
  if (ids.some(id => EQUIP_CAT[id] === 'mach')) return 'mach';
  if (ids.some(id => FREE_WEIGHTS.has(id))) return 'free';
  if (ids.includes('band')) return 'band';
  return 'body';
}
const gallery = {kind:'all', here:false, q:'', on:false, scroll:0};
const galleryThumbs = new Map();
let galleryIO = null, galleryQueue = [], galleryRaf = 0;

function galleryList(kind = gallery.kind) {
  const E = effEquip(S.equip), q = gallery.q.trim().toLowerCase();
  return EX.filter(ex => (kind === 'all' || workKind(ex) === kind) && (!gallery.here || available(ex, E)) && (!q || ex.name.toLowerCase().includes(q)));
}
function galleryTile(ex, E, all) {
  const here = available(ex, E), name = exName(ex, here ? E : all), fav = isFav(ex.id);
  const sub = here ? equipLine(ex, E) : `Нет в месте «${placeOf().name}», нужно: ${equipLine(ex, all).toLowerCase()}`;
  return `<button type="button" class="mv-tile${here ? '' : ' off'}" data-gallery-open="${ex.id}"><span class="mv-thumb" data-thumb="${ex.id}" aria-hidden="true"></span>`
    + `<span class="mv-tname">${fav ? '<span class="mv-tfav" aria-label="В избранном">★</span> ' : ''}${esc(name)}</span><span class="mv-tsub">${esc(sub)}</span></button>`;
}
function galleryHtml() {
  const E = effEquip(S.equip), all = effEquip(EQUIP.map(e => e.id)), list = galleryList();
  const chips = WORK_KINDS.map(k => `<button type="button" class="${gallery.kind === k.id ? 'on' : ''}" data-gallery-kind="${k.id}" aria-pressed="${gallery.kind === k.id}">${esc(k.name)} <small>${galleryList(k.id).length}</small></button>`).join('');
  const sections = GROUPS.map(g => {
    const xs = list.filter(ex => ex.g === g.id); if (!xs.length) return '';
    return `<section class="mv-gsec" aria-labelledby="mv-g-${g.id}"><h3 id="mv-g-${g.id}">${esc(g.name)} <small>${xs.length}</small></h3><div class="mv-ggrid">${xs.map(ex => galleryTile(ex, E, all)).join('')}</div></section>`;
  }).join('');
  return `<div class="mv-gtools"><div class="mv-gkinds" role="group" aria-label="Чем работать">${chips}</div>`
    /* «…» вокруг названия места — в одном шаблоне со следующей подписью: перевод закрывающей кавычки идёт вместе с ней */
    + `<div class="mv-gfilters"><label class="mv-ghere"><input type="checkbox" id="mv-ghere"${gallery.here ? ' checked' : ''}> Только то, что есть в месте «${esc(placeOf().name)}»</label><label class="mv-gsearch"><span class="vh">Найти упражнение</span><input type="search" id="mv-gq" value="${esc(gallery.q)}" placeholder="Найти: жим, тяга, присед…" autocomplete="off"></label></div></div>`
    + `<p class="mv-gcount" aria-live="polite">${list.length} ${plural(list.length, 'упражнение', 'упражнения', 'упражнений')}</p>`
    + (sections || `<p class="mv-gempty">Ничего не найдено. Выберите «Всё» или измените поиск.</p>`);
}
function thumbKey(id) { return id + '|' + S.place + '|' + S.equip.join(','); }
/* конечная точка движения узнаётся лучше всего: штанга у груди, присед в нижней точке; у циклических — середина шага */
function thumbT(ex) { return ex.anim.hold ? 0 : ex.anim.loop ? .3 : 1; }
function buildThumb(el) {
  const id = el.dataset.thumb, key = thumbKey(id);
  let svg = galleryThumbs.get(key);
  if (!svg) {
    const it = previewItem(id);
    try { svg = buildFigure(it.ex.anim, {primary:it.ex.pri, has:it.has, ratio:1, camera:'angle', t:thumbT(it.ex), label:it.name, muscles:false, stress:false}).svg; }
    catch (e) { console.error('Миниатюра', id, e); return; }
    galleryThumbs.set(key, svg);
  }
  el.replaceChildren(svg); el.classList.add('ready');
}
function pumpThumbs() {
  galleryRaf = 0;
  const el = galleryQueue.shift(); if (!el) return;
  if (el.isConnected && !el.classList.contains('ready')) buildThumb(el);
  if (galleryQueue.length) galleryRaf = requestAnimationFrame(pumpThumbs);
}
function renderGallery() {
  const box = $('#mv-gallery'); box.innerHTML = galleryHtml();
  if (galleryIO) galleryIO.disconnect();
  galleryQueue = [];
  const thumbs = [...box.querySelectorAll('[data-thumb]')];
  /* готовые миниатюры ставятся сразу, остальные — когда подходят к экрану */
  for (const el of thumbs) { const svg = galleryThumbs.get(thumbKey(el.dataset.thumb)); if (svg) { el.replaceChildren(svg); el.classList.add('ready'); } }
  if (typeof IntersectionObserver === 'function') {
    galleryIO = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting && !e.target.classList.contains('ready') && !galleryQueue.includes(e.target)) galleryQueue.push(e.target);
      if (galleryQueue.length && !galleryRaf) galleryRaf = requestAnimationFrame(pumpThumbs);
    }, {rootMargin:'300px 0px'});
    for (const el of thumbs) if (!el.classList.contains('ready')) galleryIO.observe(el);
  }
}
function showGallery(focusId) {
  disposeMotion(detailMotion); detailMotion = null;
  gallery.on = true;
  $('#motion-view').classList.add('mv-mode-gallery');
  $('#mv-detail').hidden = true; $('#mv-gallery').hidden = false;
  $('#mv-title').textContent = 'Все упражнения';
  renderGallery();
  const tile = focusId && $('#mv-gallery').querySelector(`[data-gallery-open="${focusId}"]`);
  if (tile) { tile.scrollIntoView({block:'center'}); tile.focus({preventScroll:true}); }
  else $('#mv-gallery').querySelector('[data-gallery-kind].on')?.focus({preventScroll:true});
}
function showDetail() {
  gallery.on = false;
  $('#motion-view').classList.remove('mv-mode-gallery');
  $('#mv-gallery').hidden = true; $('#mv-detail').hidden = false;
  if (galleryIO) galleryIO.disconnect(); cancelAnimationFrame(galleryRaf); galleryRaf = 0; galleryQueue = [];
}
function openGallery() {
  detailReturn = document.activeElement;
  const d = $('#motion-view'); if (!d.open) d.showModal();
  document.documentElement.classList.add('motion-open');
  showGallery();
  scheduleMotionLoop();
}
function closeGallery() {
  gallery.on = false;
  if (galleryIO) galleryIO.disconnect(); cancelAnimationFrame(galleryRaf); galleryRaf = 0; galleryQueue = [];
}
function setupGallery() {
  $('#mv-gallery').addEventListener('click', e => {
    const k = e.target.closest('[data-gallery-kind]');
    if (k) { gallery.kind = k.dataset.galleryKind; renderGallery(); $('#mv-gallery').querySelector(`[data-gallery-kind="${gallery.kind}"]`)?.focus(); return; }
    const t = e.target.closest('[data-gallery-open]');
    if (t) { showDetail(); selectMotion(previewItem(t.dataset.galleryOpen)); $('#mv-back').focus(); }
  });
  $('#mv-gallery').addEventListener('change', e => { if (e.target.id === 'mv-ghere') { gallery.here = e.target.checked; renderGallery(); $('#mv-ghere').focus(); } });
  $('#mv-gallery').addEventListener('input', e => {
    if (e.target.id !== 'mv-gq') return;
    gallery.q = e.target.value; const at = e.target.selectionStart;
    renderGallery(); const q = $('#mv-gq'); q.focus(); q.setSelectionRange(at, at);
  });
  $('#mv-back').addEventListener('click', () => showGallery(detailMotion?.it.ex.id));
}
