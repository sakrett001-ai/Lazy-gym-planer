/* ===================== АТЛАС ДВИЖЕНИЙ: МИНИАТЮРЫ В «АНАТОМИИ» (этап 3) =====================
   В выбранном виде фигуры (motionPrefs.view; по умолчанию «Анатомия») миниатюры витрины — кадры костей и мышц в почти
   невидимом силуэте кожи, «Скелет» — только кости, «Манекен» — прежний SVG. Правила (размер, ключ, кеш, память,
   скорость) — в 12-figure-pace.js, проверка — tools/gallery-anatomy.test.js и tools/ui-check.mjs.
   · Рисует тот же общий рендерер вне экрана, что карточки плана (GymVolume.cards; своего WebGL у витрины нет): неподвижный
     кадр той же фазы, что SVG-миниатюра (конечная точка движения), ракурсом «Под углом», рамка — по телу в этой позе.
     Цвет мышц — основные ярче, вспомогательные бледнее (без фаз), меток нагрузки нет.
   · Первая картинка витрины не ждёт: сразу — SVG-миниатюры, как раньше (13c-gallery.js), кадры анатомии — в простое
     (requestIdleCallback), только для миниатюр у экрана и чуть ниже (GALLERY_THUMBS.near), сначала видимые, и не во
     время прокрутки. Миниатюра — две задачи: сборка сцены упражнения (prepare) и кадр (поза, кости, мышцы, отрисовка,
     копия в холст); сцен у рендерера не больше трёх, как у карточек.
   · Готовый кадр сжимается (WebP, иначе JPEG) в фоновом потоке (ThumbEncoder: снимок холста createImageBitmap →
     Worker → OffscreenCanvas.convertToBlob): главный поток не ждёт ни видеокарту, ни сжатие; без Worker — toBlob.
     Хранится картинкой blob: в памяти страницы (до 3 МБ, дальше отпускаются давно не виденные — thumbsToDrop) и в
     Cache Storage (ThumbStore) между открытиями витрины и сеансами.
     Ключ — сборка, вид, тема, вариант инвентаря, фаза, ракурс, размер (thumbCacheKey); корзины прежних сборок удаляет
     страница (при открытии витрины) и сервис-воркер (при обновлении). Холст один на все миниатюры.
   · Без WebGL, после ошибки загрузки костей и мышц и если телефон не успевает (thumbPace) — SVG, как раньше; пока
     кости и мышцы грузятся — SVG, а готовые кадры из памяти и кеша показываются сразу. */
const galleryAnat = {view:'mannequin', render:false, note:'', wait:false, size:0, theme:'', loading:false, failed:false,
  mem:new Map(), base:new Map(), state:new Map(), fails:new Map(), near:new Set(), fresh:new Set(), vis:new Set(), io:null, ioVis:null, queued:false, scrollAt:0,
  job:null, canvas:null, watched:null, type:'image/webp', noStore:false, pace:thumbPace(), stats:{painted:0, cached:0, chunks:0}, cleaned:false, freeTimer:0};

/* ---------- Cache Storage: готовые кадры между сеансами ---------- */
/* место приложения: адрес корня (русская и английская страницы — одна корзина), во Floot (iframe srcdoc) — страница-хозяин;
   офлайн-файл (file://) — без кеша между сеансами */
function thumbScope() {
  const http = u => u && /^https?:$/.test(u.protocol) ? u : null;
  let u = null;
  try { u = http(new URL(location.href)); } catch (e) {}
  if (!u) try { u = http(new URL(window.parent.location.href)); } catch (e) {}
  if (!u) return null;
  let dir = u.pathname.replace(/[^/]*$/, '');
  if (window.PODHOD_LANG === 'en') dir = dir.replace(/\/en\/$/, '/');
  return u.origin + dir;
}
const ThumbStore = (() => {
  let cache = null, opening = null, off = false;
  const build = () => window.PODHOD_BUILD || '';
  /* адрес записи — условный (кадры в сеть не ходят): Cache Storage требует http(s) */
  const url = key => 'https://thumbs.podhod.invalid/' + encodeURIComponent(key);
  function open() {
    if (cache || off) return Promise.resolve(cache);
    if (!opening) opening = (async () => {
      try {
        const scope = thumbScope();
        if (!scope || !build() || typeof caches === 'undefined') throw 0;
        cache = await caches.open(thumbCacheName(scope, build()));
      } catch (e) { off = true; cache = null; }
      return cache;
    })();
    return opening;
  }
  async function get(key) {
    const c = await open(); if (!c) return null;
    try { const r = await c.match(url(key)); return r ? await r.blob() : null; } catch (e) { return null; }
  }
  async function put(key, blob) {
    const c = await open(); if (!c) return;
    try { await c.put(url(key), new Response(blob, {headers:{'Content-Type':blob.type}})); } catch (e) {}
  }
  /* корзины прежних сборок — удалить; в своей больше cacheMax записей — оставить свежие */
  async function clean() {
    const c = await open(); if (!c) return 0;
    let n = 0;
    try {
      for (const name of thumbCachesStale(await caches.keys(), thumbScope(), build())) if (await caches.delete(name)) n++;
      for (const r of thumbCacheTrim(await c.keys())) if (await c.delete(r)) n++;
    } catch (e) {}
    return n;
  }
  return {open, get, put, clean, get on() { return !off; }, url};
})();

/* ---------- сжатие кадра вне главного потока ----------
   Чтение пикселей холста (toBlob) ждёт, пока видеокарта дорисует кадр, — на главном потоке это стояние (на стенде с
   программной графикой — 0,2–0,6 с на миниатюру). Снимок холста (createImageBitmap) — без ожидания; читает и сжимает его
   Worker. Снимок берётся сразу, поэтому общий холст можно рисовать дальше. Worker не создался или упал — toBlob. */
const ThumbEncoder = (() => {
  const code = `onmessage=async e=>{const d=e.data;try{const c=new OffscreenCanvas(d.bm.width,d.bm.height);c.getContext('2d').drawImage(d.bm,0,0);d.bm.close();postMessage({id:d.id,blob:await c.convertToBlob({type:d.type,quality:d.q})});}catch(x){postMessage({id:d.id,error:String(x)});}};`;
  let w = null, broken = false, seq = 0, url = '';
  const wait = new Map();
  function worker() {
    if (w || broken) return w;
    try {
      if (typeof Worker !== 'function' || typeof OffscreenCanvas !== 'function' || typeof createImageBitmap !== 'function') throw 0;
      url = URL.createObjectURL(new Blob([code], {type:'text/javascript'})); w = new Worker(url);
      w.onmessage = e => { const r = wait.get(e.data.id); wait.delete(e.data.id); r?.(e.data.blob || null); };
      w.onerror = () => { broken = true; w?.terminate(); w = null; for (const r of wait.values()) r(null); wait.clear(); };
    } catch (e) { broken = true; w = null; }
    return w;
  }
  /* холст → Promise<Blob|null>; снимок (или toBlob) — сразу, до возврата */
  function encode(canvas, type, q) {
    const wk = worker();
    if (wk) {
      let bm; try { bm = createImageBitmap(canvas); } catch (e) { bm = null; }
      if (bm) return bm.then(b => new Promise(res => { const id = ++seq; wait.set(id, res); wk.postMessage({id, bm:b, type, q}, [b]); }), () => null);
    }
    return new Promise(res => { try { canvas.toBlob(res, type, q); } catch (e) { res(null); } });
  }
  return {encode, get pending() { return wait.size; }, get worker() { return !!w && !broken; }};
})();

/* ---------- ключ и показ ---------- */
function galleryTheme() {
  const t = document.documentElement?.dataset?.theme;
  if (t === 'light' || t === 'dark') return t;
  try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; }
}
/* упражнение миниатюры: инвентарь места, как у SVG-миниатюры (то, чего нет в месте, — из полного набора). Ключ — по
   выбранному инвентарю (он и задаёт вариант и видимые детали), без расчёта позы: дёшево, чтобы не задерживать витрину;
   сам вариант (catalogAnimFor) и видимые детали — уже при отрисовке. false — объёма у упражнения нет */
function galleryAnatBase(id) {
  const k = thumbKey(id);
  if (galleryAnat.base.has(k)) return galleryAnat.base.get(k);
  let b = false;
  try {
    const ex = EXI[id];
    if (ex && ex.anim.catalogRig) {
      let E = effEquip(S.equip); if (!available(ex, E)) E = effEquip(EQUIP.map(e => e.id));
      const equip = [...new Set(chosenEquip(ex, E))].sort().join(',') + '+' + (ex.opt || []).filter(x => E.has(x)).sort().join(','), t = thumbT(ex);
      b = {id, ex, E, equip, t, index:t === 1 ? 1 : 0};
    }
  } catch (e) { b = false; }
  galleryAnat.base.set(k, b);
  return b;
}
const galleryAnatKey = b => thumbCacheKey({build:window.PODHOD_BUILD || '', view:galleryAnat.view, theme:galleryAnat.theme, id:b.id, equip:b.equip, t:b.t, size:galleryAnat.size});
const galleryAnatOn = () => galleryAnat.view !== 'mannequin' && galleryAnat.size > 0;
/* показать готовый кадр в миниатюре: картинка поверх SVG (SVG скрыт; пока картинка не расшифрована — тёмный фон сцены) */
function galleryAnatShow(el, key, e) {
  let img = el.querySelector('img.mv-anat');
  if (!img) { img = document.createElement('img'); img.className = 'mv-anat'; img.alt = ''; img.decoding = 'async'; img.draggable = false; el.append(img); }
  if (img.dataset.key !== key) { img.src = e.url; img.dataset.key = key; }
  el.classList.add('ready', 'anat'); e.seenAt = performance.now();
}
/* убрать кадр: снова SVG (если его ещё нет — построится в очереди витрины) */
function galleryAnatHide(el) {
  const img = el.querySelector('img.mv-anat'); if (!img && !el.classList.contains('anat')) return;
  img?.remove(); el.classList.remove('anat');
  if (!el.querySelector('svg')) { el.classList.remove('ready'); galleryNeedSvg(el); }
}
const galleryThumbEl = id => $('#mv-gallery')?.querySelector(`.mv-thumb[data-thumb="${id}"]`);
/* готовый кадр из памяти — сразу (витрина собрана заново: фильтр, поиск, возврат из разбора); true — показан */
function galleryAnatPlace(el) {
  if (!galleryAnatOn()) return false;
  const b = galleryAnat.base.get(thumbKey(el.dataset.thumb)); if (!b) return false;
  const key = galleryAnatKey(b), e = galleryAnat.mem.get(key); if (!e) return false;
  galleryAnatShow(el, key, e); return true;
}
/* миниатюра на экране (очередь SVG, 13c-gallery.js): готовый кадр из памяти — сразу; true — SVG не нужен (кадр показан
   или его ищут в кеше). Здесь ничего не считается: первая картинка витрины — SVG — не ждёт */
function galleryAnatPeek(el) {
  if (!galleryAnatOn()) return false;
  const b = galleryAnat.base.get(thumbKey(el.dataset.thumb)); if (!b) return false;
  const key = galleryAnatKey(b), e = galleryAnat.mem.get(key);
  if (e) { galleryAnatShow(el, key, e); return true; }
  return galleryAnat.state.get(key) === 'lookup';
}
/* миниатюра у экрана (в простое): готовый кадр — из памяти или кеша; нет — в очередь отрисовки.
   true — SVG пока не нужен (кадр показан или ищется в кеше); false — нужен SVG */
function galleryAnatTouch(el) {
  if (!galleryAnatOn()) return false;
  const b = galleryAnatBase(el.dataset.thumb); if (!b) return false;
  const key = galleryAnatKey(b), e = galleryAnat.mem.get(key);
  if (e) { galleryAnatShow(el, key, e); return true; }
  const st = galleryAnat.state.get(key);
  if (st === 'lookup') return true;
  if (st === undefined && ThumbStore.on && !galleryAnat.noStore) {
    galleryAnat.state.set(key, 'lookup');
    const t0 = performance.now();
    /* SVG ждёт ответа кеша не дольше 150 мс: кадр из кеша не сменяет только что построенный SVG */
    const late = setTimeout(() => { const el2 = galleryThumbEl(b.id); if (el2 && !el2.classList.contains('anat')) galleryNeedSvg(el2); }, 150);
    ThumbStore.get(key).then(blob => {
      clearTimeout(late);
      if (blob) { galleryAnat.state.delete(key); galleryAnatAdd(key, b.id, blob); galleryAnat.stats.cached++; galleryAnat.lookupMs = performance.now() - t0; return; }
      galleryAnat.state.set(key, 'miss');
      const el2 = galleryThumbEl(b.id); if (el2 && !el2.classList.contains('anat')) galleryNeedSvg(el2);
      galleryAnatKick();
    });
    return true;
  }
  if (st === undefined) galleryAnat.state.set(key, 'miss');
  galleryAnatKick();
  return false;
}
/* готовый кадр — в память (blob: картинка), показать в миниатюре, если ключ ещё тот же; лишнее — отпустить */
function galleryAnatAdd(key, id, blob) {
  let e = galleryAnat.mem.get(key);
  if (!e) { e = {key, id, url:URL.createObjectURL(blob), bytes:blob.size, seenAt:performance.now()}; galleryAnat.mem.set(key, e); }
  const el = galleryThumbEl(id), b = galleryAnat.base.get(thumbKey(id));
  if (el && b && galleryAnatOn() && galleryAnatKey(b) === key) galleryAnatShow(el, key, e);
  galleryAnatTrim();
}
function galleryAnatTrim() {
  const list = [...galleryAnat.mem.values()].map(e => ({key:e.key, bytes:e.bytes, seenAt:e.seenAt, near:galleryAnat.near.has(e.id)}));
  for (const key of thumbsToDrop(list)) {
    const e = galleryAnat.mem.get(key); galleryAnat.mem.delete(key);
    const el = galleryThumbEl(e.id); if (el && el.querySelector('img.mv-anat')?.dataset.key === key) galleryAnatHide(el);
    URL.revokeObjectURL(e.url);
  }
}
/* миниатюра в нужном виде: тот же кадр, другой (тема, размер, вид сменились) или SVG */
function galleryAnatSync(el) {
  if (galleryAnatPlace(el)) return;
  galleryAnatHide(el);
  if (galleryAnatOn() && galleryAnat.near.has(el.dataset.thumb)) galleryAnatTouch(el);
}

/* ---------- очередь: кадры в простое ---------- */
const galleryIdle = window.requestIdleCallback ? cb => requestIdleCallback(cb, {timeout:1000}) : cb => setTimeout(() => { const end = performance.now() + 12; cb({timeRemaining:() => Math.max(0, end - performance.now()), didTimeout:true}); }, 50);
function galleryAnatKick(delay = 0) {
  if (galleryAnat.queued || !gallery.on || !galleryAnatOn() || (!galleryAnat.render && !galleryAnat.fresh.size)) return;
  galleryAnat.queued = true;
  if (delay) setTimeout(() => galleryIdle(galleryAnatWork), delay); else galleryIdle(galleryAnatWork);
}
function galleryAnatData() {
  const need = galleryAnat.view === 'anatomy' ? [Skeleton, Muscles] : [Skeleton];
  return need.every(x => x.data) ? 'ready' : galleryAnat.failed ? 'error' : 'loading';
}
function galleryAnatLoad() {
  if (galleryAnat.loading) return; galleryAnat.loading = true;
  const need = figureView() === 'anatomy' ? [Skeleton, Muscles] : [Skeleton];
  Promise.all(need.map(x => x.load())).then(() => { galleryAnat.failed = false; }, () => { galleryAnat.failed = true; })
    .then(() => { galleryAnat.loading = false; if (gallery.on) galleryAnatApply(); });
}
/* следующая миниатюра: у экрана, без готового кадра и не в кеше; на медленном телефоне — только видимые */
function galleryAnatNext() {
  const box = $('#mv-gallery'), list = [];
  for (const id of galleryAnat.near) {
    const b = galleryAnatBase(id); if (!b) continue;
    const key = galleryAnatKey(b); if (galleryAnat.state.get(key) !== 'miss' || galleryAnat.mem.has(key)) continue;
    const el = box?.querySelector(`.mv-thumb[data-thumb="${id}"]`); if (!el) continue;
    list.push({id, b, key, visible:galleryAnat.vis.has(id), top:el.getBoundingClientRect().top});
  }
  return thumbNext(list, galleryAnat.pace.mode === 'visible');
}
function galleryAnatWork(deadline) {
  galleryAnat.queued = false;
  if (!gallery.on || !galleryAnatOn() || document.hidden) return;
  /* при прокрутке и пока строятся первые SVG-миниатюры — подождать */
  if (performance.now() - galleryAnat.scrollAt < GALLERY_THUMBS.quiet || galleryQueue.length || galleryRaf) { galleryAnatKick(GALLERY_THUMBS.quiet); return; }
  /* миниатюры, подошедшие к экрану: кадр из памяти или поиск в кеше (сначала видимые) — пока есть время простоя */
  if (galleryAnat.fresh.size) {
    const box = $('#mv-gallery'), ids = [...galleryAnat.fresh].sort((a, b) => galleryAnat.vis.has(b) - galleryAnat.vis.has(a));
    for (const id of ids) {
      galleryAnat.fresh.delete(id); const el = box?.querySelector(`.mv-thumb[data-thumb="${id}"]`);
      if (el && !el.classList.contains('anat')) galleryAnatTouch(el);
      if (deadline.timeRemaining() < 3 && !deadline.didTimeout) break;
    }
    if (galleryAnat.fresh.size) { galleryAnatKick(); return; }
  }
  if (!galleryAnat.render) return;
  if (galleryAnatData() !== 'ready') { galleryAnatLoad(); return; }
  const stage = cardStage(); if (!stage) return;
  /* сжимаются уже два кадра — новый подождёт (снимки держат память видеокарты) */
  if (!galleryAnat.job && ThumbEncoder.pending >= 2) return;
  let job = galleryAnat.job;
  /* размер, тема или вид сменились, пока сцена ждала кадра, — работа не нужна */
  if (job && (job.key !== galleryAnatKey(job.b) || !galleryAnat.near.has(job.id))) { job.h.forget(); job = galleryAnat.job = null; }
  if (!job) {
    const n = galleryAnatNext(); if (!n) return;
    const {b} = n, layers = galleryAnat.view === 'anatomy' ? {skeleton:Skeleton.data, muscles:Muscles.data, level:anatomyLevel(b.ex)} : null;
    /* вариант упражнения и видимые детали — по инвентарю миниатюры (как у SVG-миниатюры и карточки) */
    const has = propHas(b.ex, b.E), A = catalogAnimFor(b.ex.anim, has), bits = A.catalogRig(0).props.map(q => GymEquipment.visible(q, has) ? 1 : 0).join('');
    const h = stage.figure({key:['thumb', A.catalogId, A.catalogVariant || '', bits].join('|'), still:true, fit:'body', color:muscleColor, muscles:false, stress:false,
      data:(t, index, coarse, lean) => catalogVolumeData(A, t, index, has, coarse, lean)});
    h.setLayers(Skeleton.data, layers); h.setLook({muscles:false, stress:false});
    job = galleryAnat.job = {id:n.id, b, key:n.key, h, prepared:false, long:0, t0:performance.now()};
  }
  const t0 = performance.now(); let painted = false;
  try {
    if (!job.prepared) { if (!job.h.prepare()) throw Error('webgl'); job.prepared = true; }
    else { galleryAnatPaint(job); painted = true; }
  } catch (e) {
    console.error('Миниатюра анатомии', job.id, e);
    job.h.forget(); galleryAnat.job = null;
    /* вторая неудача — у этой миниатюры остаётся SVG */
    const n = (galleryAnat.fails.get(job.key) || 0) + 1; galleryAnat.fails.set(job.key, n);
    galleryAnat.state.set(job.key, n >= 2 ? 'fail' : 'miss');
  }
  const ms = performance.now() - t0; job.long = Math.max(job.long, ms); galleryAnat.stats.chunks++;
  globalThis.GymPerf?.thumb?.(ms);
  if (painted) {
    galleryAnat.lastMs = job.long;
    const r = galleryAnat.pace.sample(job.long);
    if (r === 'svg') { galleryAnatApply(); return; }
  }
  galleryAnatKick();
}
/* кадр — в общий холст, оттуда сжатым (в фоне) в память и кеш */
function galleryAnatPaint(job) {
  const c = galleryAnat.canvas || (galleryAnat.canvas = document.createElement('canvas')), size = galleryAnat.size;
  if (c.width !== size || c.height !== size) { c.width = size; c.height = size; }
  const ok = job.h.paint(c, job.b.t, job.b.index, GALLERY_THUMBS.camera);
  /* сцена миниатюры больше не нужна: память — сразу, а не после вытеснения (≈3 МБ кучи на сцену) */
  job.h.forget(); galleryAnat.job = null;
  if (!ok) throw Error('paint');
  galleryAnat.state.set(job.key, 'encode');
  const {key, id} = job, t0 = performance.now();
  ThumbEncoder.encode(c, galleryAnat.type, GALLERY_THUMBS.quality).then(blob => {
    galleryAnat.encodeMs = performance.now() - t0;
    /* не вышло (Worker упал) — нарисовать заново, уже через toBlob */
    if (!blob) { galleryAnat.state.set(key, 'miss'); galleryAnatKick(); return; }
    /* браузер без WebP отдаёт PNG (в 5–8 раз больше) — дальше JPEG */
    if (galleryAnat.type === 'image/webp' && blob.type !== 'image/webp') galleryAnat.type = 'image/jpeg';
    galleryAnat.state.delete(key); galleryAnat.stats.painted++;
    galleryAnatAdd(key, id, blob); ThumbStore.put(key, blob);
    galleryAnatKick();
  });
}

/* ---------- вид витрины: выбор человека, объёмная графика, данные, скорость ---------- */
function galleryAnatApply() {
  const box = $('#mv-gallery'); if (!box || !gallery.on) return;
  const pref = figureView(), was = galleryAnat.view + galleryAnat.theme + galleryAnat.size;
  const choice = thumbViewFor(pref, {able:!!cardStage(), state:galleryAnatData(), slow:galleryAnat.pace.mode === 'svg', coarse:coarsePointer()});
  Object.assign(galleryAnat, {view:choice.view, render:choice.render, note:choice.note, wait:choice.wait, theme:galleryTheme()});
  const first = box.querySelector('.mv-thumb');
  galleryAnat.size = galleryAnat.view === 'mannequin' ? 0 : thumbCanvasSize(first ? first.getBoundingClientRect().width : 0, window.devicePixelRatio);
  const note = box.querySelector('.mv-gnote'); if (note) { if (note.textContent !== galleryAnat.note) note.textContent = galleryAnat.note; note.hidden = !galleryAnat.note; }
  if (choice.wait) galleryAnatLoad();
  if (was !== galleryAnat.view + galleryAnat.theme + galleryAnat.size || !galleryAnatOn()) for (const el of box.querySelectorAll('.mv-thumb[data-thumb]')) galleryAnatSync(el);
  if (galleryAnatOn()) { galleryAnatWatch(box); galleryAnatKick(); }
  if (!galleryAnat.cleaned && ThumbStore.on) { galleryAnat.cleaned = true; setTimeout(() => galleryIdle(() => ThumbStore.clean()), 3000); }
}
/* какие миниатюры у экрана (с запасом) и какие видны; корень — окно атласа (оно и прокручивается) */
function galleryAnatWatch(box) {
  const root = $('#motion-view');
  if (!galleryAnat.io && typeof IntersectionObserver === 'function') {
    galleryAnat.watched = new WeakSet();
    /* у экрана: только отметка — поиск в кеше и отрисовка идут в простое (galleryAnatWork) */
    galleryAnat.io = new IntersectionObserver(es => {
      for (const e of es) { const id = e.target.dataset.thumb; if (e.isIntersecting) { galleryAnat.near.add(id); galleryAnat.fresh.add(id); } else { galleryAnat.near.delete(id); galleryAnat.fresh.delete(id); } }
      galleryAnatKick();
    }, {root, rootMargin:GALLERY_THUMBS.near});
    galleryAnat.ioVis = new IntersectionObserver(es => { for (const e of es) { const id = e.target.dataset.thumb; if (e.isIntersecting) galleryAnat.vis.add(id); else galleryAnat.vis.delete(id); } }, {root});
  }
  if (!galleryAnat.io) return;
  for (const el of box.querySelectorAll('.mv-thumb[data-thumb]')) if (!galleryAnat.watched.has(el)) { galleryAnat.watched.add(el); galleryAnat.io.observe(el); galleryAnat.ioVis.observe(el); }
}
/* витрина собрана заново (фильтр, поиск, возврат): прежние наблюдения — недействительны */
function galleryAnatMount(box) {
  galleryAnat.io?.disconnect(); galleryAnat.ioVis?.disconnect(); galleryAnat.io = galleryAnat.ioVis = null;
  galleryAnat.near.clear(); galleryAnat.vis.clear(); galleryAnat.fresh.clear();
  galleryAnatApply();
}
/* витрина закрыта или открыт разбор: очередь стоит, готовые кадры остаются в памяти */
function galleryAnatStop() {
  galleryAnat.io?.disconnect(); galleryAnat.ioVis?.disconnect(); galleryAnat.io = galleryAnat.ioVis = null;
  galleryAnat.near.clear(); galleryAnat.vis.clear(); galleryAnat.fresh.clear();
  if (galleryAnat.job) { galleryAnat.job.h.forget(); galleryAnat.job = null; }
  for (const [k, v] of galleryAnat.state) if (v === 'lookup') galleryAnat.state.delete(k);
  galleryAnat.pace.reset();
  /* без карточек плана в «Анатомии» общий рендерер через несколько секунд отдаёт контекст WebGL и сцены */
  clearTimeout(galleryAnat.freeTimer);
  galleryAnat.freeTimer = setTimeout(() => { if (!gallery.on && !figs.some(F => F.av)) cardStage()?.dispose(); }, 4000);
}
/* для панели замера (?perf) и проверок: сколько миниатюр у экрана (near) и видимых (vis) уже в анатомии */
function galleryAnatStats() {
  const box = $('#mv-gallery'), count = set => { let n = 0, ready = 0; for (const id of set) { const el = box?.querySelector(`.mv-thumb[data-thumb="${id}"]`); if (!el || !galleryAnatBase(id)) continue; n++; if (el.classList.contains('anat')) ready++; } return [n, ready]; };
  const [near, ready] = count(galleryAnat.near), [vis, visReady] = count(galleryAnat.vis);
  let bytes = 0; for (const e of galleryAnat.mem.values()) bytes += e.bytes;
  return {view:galleryAnat.view, render:galleryAnat.render, mode:galleryAnat.pace.mode, ready, near, vis, visReady, mem:galleryAnat.mem.size, bytes,
    painted:galleryAnat.stats.painted, cached:galleryAnat.stats.cached, last:galleryAnat.lastMs ?? null, encode:galleryAnat.encodeMs ?? null, worker:ThumbEncoder.worker};
}
/* забыть готовые кадры в памяти страницы (замер «с нуля» в панели ?perf); кеш между сеансами не трогается */
function galleryAnatForget() {
  for (const e of galleryAnat.mem.values()) URL.revokeObjectURL(e.url);
  galleryAnat.mem.clear(); galleryAnat.state.clear(); galleryAnat.fails.clear(); galleryAnat.stats = {painted:0, cached:0, chunks:0};
}
function setupGalleryAnatomy() {
  const view = $('#motion-view'); if (!view) return;
  /* прокрутка витрины: кадры подождут, пока листание не остановится */
  view.addEventListener('scroll', () => { if (gallery.on) galleryAnat.scrollAt = performance.now(); }, {passive:true});
  let raf = 0;
  const again = () => { if (!gallery.on || raf) return; raf = requestAnimationFrame(() => { raf = 0; if (gallery.on) galleryAnatApply(); }); };
  window.addEventListener('resize', again, {passive:true});
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', again); } catch (e) {}
  if (typeof MutationObserver === 'function' && document.documentElement) new MutationObserver(again).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange', () => { if (!document.hidden && gallery.on) galleryAnatKick(); });
  /* объёмная графика пришла после открытия витрины — миниатюры в выбранном виде */
  window.addEventListener('gym-volume', () => { if (gallery.on) galleryAnatApply(); });
}
