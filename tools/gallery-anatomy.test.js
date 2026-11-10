'use strict';
/* Миниатюры витрины атласа в «Анатомии» (этап 3).
   1) правила без страницы (src/js/12-figure-pace.js): размер холста, ключ и корзины кеша, память, очередь, скорость, вид;
   2) общий рендерер карточек (src/volume/main.mjs) на заглушке WebGL: неподвижный кадр с рамкой по показанной позе,
      сборка сцены отдельной задачей (prepare);
   3) кеш между сеансами (ThumbStore, 13e-gallery-anatomy.js) на поддельном Cache Storage и согласие с сервис-воркером. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { JSDOM } = require('jsdom');
const { loadModel } = require('./biomechanics-audit');
const root = path.resolve(__dirname, '..');
const plain = v => JSON.parse(JSON.stringify(v));

function rules() {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/12-figure-pace.js'), 'utf8'), ctx, { filename: '12-figure-pace.js' });
  return vm.runInContext('({GALLERY_THUMBS,thumbCanvasSize,thumbCacheKey,thumbCacheName,thumbCachesStale,thumbCacheTrim,thumbsToDrop,thumbNext,thumbPace,thumbViewFor,thumbModeFor,thumbHash,thumbPoseHash,thumbStale,FIGURE_NOTES})', ctx);
}
const R = rules(), G = R.GALLERY_THUMBS;

test('thumbnail canvas: device pixels up to ×2, in steps of 40 px, at most 320; nothing for a hidden tile', () => {
  assert.equal(R.thumbCanvasSize(158, 3), 320, 'телефон 390 px, ×3: 158 × 2 = 316 → 320');
  assert.equal(R.thumbCanvasSize(170, 1), 200, 'компьютер ×1: 170 → 200');
  assert.equal(R.thumbCanvasSize(150, 1), 160);
  assert.equal(R.thumbCanvasSize(400, 2), 320, 'не больше 320');
  assert.equal(R.thumbCanvasSize(10, 1), 40);
  assert.equal(R.thumbCanvasSize(0, 2), 0); assert.equal(R.thumbCanvasSize(undefined, 2), 0);
  /* соседние ширины (поворот, полоса прокрутки) дают тот же ключ */
  assert.equal(R.thumbCanvasSize(156, 2), R.thumbCanvasSize(159.5, 2));
  assert(G.max * G.max * 4 < 0.5 * (1 << 20), 'общий холст — меньше 0,5 МБ');
});

test('cache key is by content: render version of the view, view, theme, pose hash, muscle level, camera, quality, paint version and size — each changes the key; the build number is not in it', () => {
  const base = { render: 'r1', view: 'anatomy', theme: 'dark', pose: 'p1', level: 'l1', size: 320 };
  const k = R.thumbCacheKey(base);
  assert.equal(k, 't2|r1|' + G.paint + '|anatomy|dark|p1|l1|angle|' + G.quality + '|320');
  for (const [f, v] of Object.entries({ render: 'r2', view: 'skeleton', theme: 'light', pose: 'p2', level: 'l2', camera: 'side', quality: .5, paint: 'p0', size: 200 }))
    assert.notEqual(R.thumbCacheKey({ ...base, [f]: v }), k, f);
  assert.equal(R.thumbCacheKey({ ...base, build: '4.99.0-zzz' }), k, 'номер сборки ключ не меняет');
});

test('pose hash: the same pose gives the same hash in any build; a moved joint, another phase, variant or hidden part changes it; sub-micron noise does not', () => {
  const m = loadModel(), ex = m.EX.find(e => e.id === 'squat'), pose = () => ex.anim.catalogRig(1);
  const h = R.thumbPoseHash(pose(), ['squat', '', '111', 1, 1]);
  assert.match(h, /^[0-9a-z]{6,12}$/);
  assert.equal(R.thumbPoseHash(pose(), ['squat', '', '111', 1, 1]), h, 'та же поза — тот же хэш');
  const moved = pose(); moved.head = [moved.head[0], moved.head[1] - .5, moved.head[2]];
  assert.notEqual(R.thumbPoseHash(moved, ['squat', '', '111', 1, 1]), h, 'сустав сдвинут на 5 мм');
  const prop = pose(); prop.props = prop.props.map((p, i) => i === 0 && p.c ? { ...p, c: [p.c[0] + 1, p.c[1], p.c[2]] } : i === 0 && p.a ? { ...p, a: [p.a[0] + 1, p.a[1], p.a[2]] } : p);
  assert.notEqual(R.thumbPoseHash(prop, ['squat', '', '111', 1, 1]), h, 'деталь инвентаря сдвинута');
  assert.notEqual(R.thumbPoseHash(ex.anim.catalogRig(.5), ['squat', '', '111', 1, 1]), h, 'другая фаза — другая поза');
  assert.notEqual(R.thumbPoseHash(pose(), ['squat', 'db', '111', 1, 1]), h, 'вариант');
  assert.notEqual(R.thumbPoseHash(pose(), ['squat', '', '110', 1, 1]), h, 'видимость детали');
  const noise = pose(); noise.head = [noise.head[0] + 1e-7, noise.head[1], noise.head[2]];
  assert.equal(R.thumbPoseHash(noise, ['squat', '', '111', 1, 1]), h, 'шум вычислений (0,1 мкм) ключ не меняет');
  /* хэши поз каталога не сталкиваются */
  const all = new Set(m.EX.map(e => R.thumbPoseHash(e.anim.catalogRig(1), [e.id])));
  assert.equal(all.size, m.EX.length);
});

test('a thumbnail key survives a release that did not touch the exercise and changes when its pose changes', () => {
  const m = loadModel({ fullApp: true });
  const key = (build, patch = '') => m.get(`(() => { window.PODHOD_BUILD = '${build}'; window.PODHOD_RENDER = {anatomy:'ra', skeleton:'rs', skin:'rk'}; galleryAnat.base.clear(); galleryAnat.view = 'anatomy'; galleryAnat.theme = 'dark'; galleryAnat.size = 320;
    ${patch} return ['squat', 'pushup'].map(id => galleryAnatKey(galleryAnatBase(id))); })()`);
  const a = [...key('4.81.0-aaa')], b = [...key('4.82.0-bbb')];
  assert.deepEqual(b, a, 'другая сборка, то же содержимое — те же ключи');
  const c = [...key('4.82.0-bbb', "{ const an = EXI.squat.anim, rig = an.catalogRig; an.catalogRig = t => { const R = rig(t); R.head = [R.head[0], R.head[1] - 2, R.head[2]]; return R; }; }")];
  assert.notEqual(c[0], a[0], 'поза приседа изменилась — у его кадра новый ключ'); assert.equal(c[1], a[1], 'отжимания не менялись — ключ прежний');
  const d = [...m.get("(() => { window.PODHOD_RENDER = {anatomy:'ra2', skeleton:'rs', skin:'rk'}; galleryAnat.base.clear(); return ['pushup'].map(id => galleryAnatKey(galleryAnatBase(id))); })()")];
  assert.notEqual(d[0], a[1], 'изменилась отрисовка вида — ключ новый');
});

test('thumbnail mode: with WebGL (or while volume.js is on its way) frames are expected — a placeholder, not SVG; SVG only where no frame will come', () => {
  const v = (pref, o) => plain(R.thumbModeFor(pref, o));
  assert.deepEqual(v('mannequin', { gl: 'ready' }), { view: 'skin', render: true, note: '', wait: false, expect: true });
  assert.deepEqual(v('anatomy', { gl: 'ready' }), { view: 'anatomy', render: true, note: '', wait: false, expect: true });
  /* volume.js ещё грузится: кадры из кеша показываются, новые не рисуются, SVG не нужен */
  assert.deepEqual(v('mannequin', { gl: 'pending' }), { view: 'skin', render: false, note: '', wait: false, expect: true });
  assert.deepEqual(v('anatomy', { gl: 'pending', state: 'loading' }), { view: 'anatomy', render: false, note: '', wait: true, expect: true });
  assert.deepEqual(v('mannequin', { gl: 'ready', state: 'loading' }), { view: 'skin', render: false, note: '', wait: true, expect: true }, 'данные кожи грузятся — заглушка');
  /* кадров не будет — SVG */
  for (const o of [{ gl: 'none' }, { gl: 'ready', state: 'error' }, { gl: 'ready', slow: true }, { gl: 'ready', skin: false }])
    assert.equal(v('mannequin', o).expect, false, JSON.stringify(o));
  for (const o of [{ gl: 'none' }, { gl: 'ready', state: 'error' }, { gl: 'ready', slow: true }]) { const r = v('anatomy', o); assert.equal(r.expect, false, JSON.stringify(o)); assert.equal(r.view, 'mannequin'); assert.equal(r.render, false); }
});

test('the equipment of a thumbnail decides the exercise variant: goblet with a dumbbell and with a kettlebell are different frames', () => {
  const m = loadModel({ fullApp: true });
  const r = m.get(`(() => { const out = {}; for (const [place, eq] of [['db', ['db']], ['kb', ['kb']]]) { S.places = [{ id: place, name: place, equip: eq }]; S.place = place; ensurePlaces(S);
    const b = galleryAnatBase('goblet'); out[place] = { pose: b.pose, key: galleryAnatKey(b), variant: b.A.catalogVariant || '' }; } return out; })()`);
  assert.notEqual(r.db.variant, r.kb.variant); assert.notEqual(r.db.pose, r.kb.pose, 'другой вариант позы — другой хэш позы'); assert.notEqual(r.db.key, r.kb.key, 'и другой ключ кадра');
});

test('Cache Storage: one bucket per app place, not per build; buckets of the old per-build scheme of this place go, other places stay; the bucket is trimmed to fresh entries', () => {
  const scope = 'https://lazy.test/app/';
  assert.equal(R.thumbCacheName(scope), 'podhod-thumbs2@https://lazy.test/app/');
  const names = [R.thumbCacheName(scope), 'podhod-thumbs@https://lazy.test/app/:4.50.0-old', 'podhod-thumbs@https://lazy.test/app/:4.51.0-abc', 'podhod-thumbs@https://lazy.test/other/:4.50.0-old',
    R.thumbCacheName('https://lazy.test/other/'), 'podhod@https://lazy.test/app/:4.51.0-abc', 'podhod-langs@https://lazy.test/app/', null];
  assert.deepEqual(plain(R.thumbCachesStale(names, scope)), ['podhod-thumbs@https://lazy.test/app/:4.50.0-old', 'podhod-thumbs@https://lazy.test/app/:4.51.0-abc']);
  /* запись из кеша старше refreshDays переписывается в конец — при чистке уходят давно не виденные */
  const day = 864e5, now = 1e12;
  assert.equal(R.thumbStale(now - (G.refreshDays + 1) * day, now), true); assert.equal(R.thumbStale(now - day, now), false); assert.equal(R.thumbStale(NaN, now), true);
  const keys = Array.from({ length: G.cacheMax + 5 }, (_, i) => 'k' + i);
  const gone = R.thumbCacheTrim(keys);
  assert.equal(gone.length, keys.length - G.cacheKeep); assert.equal(gone[0], 'k0', 'первыми — самые старые');
  assert.deepEqual(plain(R.thumbCacheTrim(keys.slice(0, G.cacheMax))), [], 'до предела — ничего');
});

test('memory: above the limit the longest-unseen compressed frames go, never the ones near the screen', () => {
  const e = (key, bytes, seenAt, near = false) => ({ key, bytes, seenAt, near });
  const list = [e('a', 400, 1), e('b', 400, 5, true), e('c', 400, 2), e('d', 400, 9), e('e', 400, 3)];
  assert.deepEqual(plain(R.thumbsToDrop(list, 1200)), ['a', 'c'], '2000 байт → 1200: две самые давние, кроме той, что у экрана');
  assert.deepEqual(plain(R.thumbsToDrop(list, 5000)), []);
  assert.deepEqual(plain(R.thumbsToDrop(list.map(x => ({ ...x, near: true })), 100)), [], 'у экрана — не отпускаются');
  assert.equal(G.memory, 3 << 20); assert(G.memory / 12e3 > 151, 'в 3 МБ помещается вся витрина (по ≈12 КБ на кадр)');
});

test('queue: visible tiles first, then the nearest from the top; on a slow phone — visible only', () => {
  const t = (id, visible, top) => ({ id, visible, top });
  assert.equal(R.thumbNext([t('below', false, 900), t('vis2', true, 400), t('vis1', true, 120), t('above', false, -300)]).id, 'vis1');
  assert.equal(R.thumbNext([t('below2', false, 1300), t('below1', false, 900)]).id, 'below1');
  assert.equal(R.thumbNext([t('below', false, 900)], true), null, 'только видимые');
  assert.equal(R.thumbNext([]), null);
});

test('speed: the longest task of a thumbnail decides — visible only above 90 ms, SVG above 400 ms; the first (shaders) is not counted', () => {
  const p = R.thumbPace(), feed = (ms, n = G.window) => { let r = null; for (let i = 0; i < n; i++) r = p.sample(ms) || r; return r; };
  assert.equal(p.sample(900), null, 'первая миниатюра — прогрев');
  assert.equal(feed(40), null); assert.equal(p.mode, 'near');
  assert.equal(feed(G.visibleMs + 30), 'visible'); assert.equal(p.mode, 'visible');
  assert.equal(feed(G.visibleMs * .8), null, 'между 0,7 и 1 × порога — остаётся «только видимые» (без качелей)');
  assert.equal(feed(G.visibleMs * .5), 'near');
  /* медиана, а не среднее: одна долгая задача из трёх не решает */
  p.sample(1000); p.sample(30); assert.equal(p.sample(40), null); assert.equal(p.mode, 'near');
  assert.equal(feed(G.svgMs + 50), 'svg'); assert.equal(p.sample(1), null, 'после отката замеры не нужны');
  p.reset(); assert.equal(p.mode, 'near'); assert.equal(p.sample(9999), null, 'новое открытие — снова прогрев');
});

test('view: the person\'s choice («Mannequin» — the Anny skin); no WebGL, a loading error or a slow phone — SVG; while data loads — saved frames only', () => {
  const v = (pref, o) => plain(R.thumbViewFor(pref, o));
  assert.deepEqual(v('anatomy'), { view: 'anatomy', render: true, note: '', wait: false });
  assert.deepEqual(v('skeleton'), { view: 'skeleton', render: true, note: '', wait: false });
  assert.deepEqual(v(undefined), { view: 'anatomy', render: true, note: '', wait: false }, 'по умолчанию — «Анатомия»');
  /* «Манекен» — кожа Anny кадрами общего рендерера; пока её данные грузятся — готовые кадры, без них и после отката — SVG */
  assert.deepEqual(v('mannequin'), { view: 'skin', render: true, note: '', wait: false });
  assert.deepEqual(v('mannequin', { state: 'loading' }), { view: 'skin', render: false, note: '', wait: true });
  assert.deepEqual(v('mannequin', { state: 'error' }), { view: 'mannequin', render: false, note: '', wait: false });
  assert.deepEqual(v('mannequin', { slow: true }), { view: 'mannequin', render: false, note: '', wait: false });
  assert.deepEqual(v('mannequin', { able: false }), { view: 'mannequin', render: false, note: '', wait: false });
  assert.deepEqual(v('anatomy', { able: false }), { view: 'mannequin', render: false, note: '', wait: false }, 'без WebGL — SVG, без подписи');
  assert.deepEqual(v('anatomy', { state: 'loading' }), { view: 'anatomy', render: false, note: '', wait: true }, 'грузится: готовые кадры показываются, новые ждут');
  assert.deepEqual(v('anatomy', { state: 'error' }), { view: 'mannequin', render: false, note: R.FIGURE_NOTES.error, wait: false });
  assert.deepEqual(v('anatomy', { slow: true }), { view: 'mannequin', render: false, note: R.FIGURE_NOTES.slowPhone, wait: false });
});

/* ---------- 2. общий рендерер: неподвижный кадр и сборка сцены заранее ---------- */
const mainSrc = fs.readFileSync(path.join(root, 'src/volume/main.mjs'), 'utf8').replace(/^import[^\n]*\n/gm, '').replace('export function createVolumeFigure', 'function createVolumeFigure');
async function stageRuntime() {
  const THREE = await import('three'), { createCatalogScene, world, CAMERA_SETTINGS } = await import('../src/volume/scene.mjs'), orbit = await import('../src/volume/orbit.mjs'), { attachOrbit } = await import('../src/volume/controls.mjs');
  const dom = new JSDOM('<body></body>'), w = dom.window, n = { renders: 0, saved: 0 };
  w.WebGL2RenderingContext = function () {};
  w.HTMLCanvasElement.prototype.getContext = function () { return {}; };
  class Renderer {
    constructor({ canvas }) { this.domElement = canvas; this.shadowMap = {}; }
    getContext() { return { isContextLost: () => false }; }
    setPixelRatio() {} setSize() {} render(scene, camera) { n.renders++; n.camera = camera; } dispose() {} forceContextLoss() {}
  }
  const store = { getItem: () => null, setItem: () => { n.saved++; } };
  const env = { window: Object.assign(w, { PODHOD_BUILD: 'test' }), document: w.document, performance, localStorage: store, setTimeout: f => f(), clearTimeout() {},
    THREE: { ...THREE, WebGLRenderer: Renderer }, createCatalogScene, world, CAMERA_SETTINGS, ...orbit, attachOrbit, GymPerf: null };
  vm.runInNewContext(mainSrc, env);
  const m = loadModel(), { catalogVolumeData, muscleColor } = m.get('({catalogVolumeData,muscleColor})');
  let datas = 0;
  const opts = (id, extra = {}) => ({ key: 'thumb|' + id + (extra.still ? '' : '|all'), fit: 'body', color: muscleColor, ...extra,
    data: (t, index, coarse, lean) => { datas++; return catalogVolumeData(m.EX.find(e => e.id === id).anim, t, index, undefined, coarse, lean); } });
  const target = (s = 320) => ({ width: s, height: s, getContext: () => ({ drawImage() {} }) });
  return { dom, n, env, stage: () => w.GymVolume.cards(), opts, target, datas: () => datas };
}

test('a still frame is framed by the pose it shows, without sampling 13 phases and without touching the shared frame memory', async () => {
  const r = await stageRuntime();
  try {
    const stage = r.stage();
    /* карточка плана: рамка по 13 положениям повторения и запись в память рамок */
    const card = stage.figure(r.opts('squat'));
    const d0 = r.datas(); card.paint(r.target(), .5, 0, 'angle');
    assert(r.datas() - d0 >= 13, 'карточка: рамка по всем фазам'); assert.equal(r.n.saved, 1, 'рамка карточки — в память');
    /* миниатюра: сборка сцены отдельной задачей, без отрисовки; потом кадр — одна поза */
    const still = stage.figure(r.opts('squat', { still: true }));
    const d1 = r.datas(), renders = r.n.renders, builds = stage.builds;
    assert.equal(still.prepare(), true); assert.equal(stage.builds, builds + 1, 'prepare собирает сцену'); assert.equal(r.n.renders, renders, 'и ничего не рисует');
    const afterBuild = r.datas();
    assert.equal(still.paint(r.target(), 1, 1, 'angle'), true); assert.equal(stage.builds, builds + 1, 'кадр — из собранной сцены');
    assert.equal(r.datas() - afterBuild, 1, 'кадр — один расчёт позы, без 13 положений'); assert(afterBuild - d1 <= 1);
    assert.equal(r.n.saved, 1, 'рамка миниатюры — не в общую память рамок');
    /* рамка по показанной позе: присед внизу и вверху — разные кадры */
    const low = { ...plain({ l: r.n.camera.left, r: r.n.camera.right, t: r.n.camera.top, b: r.n.camera.bottom }) };
    still.paint(r.target(), 0, 0, 'angle');
    const top = plain({ l: r.n.camera.left, r: r.n.camera.right, t: r.n.camera.top, b: r.n.camera.bottom });
    assert.notDeepEqual(low, top, 'рамка — своя у каждой показанной позы');
    assert(top.t - top.b > low.t - low.b, 'стоя человек выше, чем в нижней точке приседа');
    /* квадратный кадр, тело в нём целиком: высота рамки — по телу, с полем */
    assert(Math.abs((low.r - low.l) - (low.t - low.b)) < 1e-6, 'кадр квадратный');
    /* нарисованная миниатюра отпускает свою сцену сразу (карточка плана — остаётся) */
    const scenes = stage.stats().scenes; still.forget();
    assert.equal(stage.stats().scenes, scenes - 1, 'сцена миниатюры отпущена'); assert.equal(still.prepare(), false, 'отпущенная фигура не собирает сцену');
    assert.equal(card.paint(r.target(), .5, 0, 'angle'), true); assert.equal(stage.builds, builds + 1, 'сцена карточки — та же');
  } finally { r.stage().dispose(); r.dom.window.close(); }
});

test('still frames do not report to the card speed hook (the gallery reports its own tasks)', async () => {
  const r = await stageRuntime();
  try {
    const calls = []; r.env.GymPerf = { volume() {}, card: (...a) => calls.push(a) };
    const f = r.stage().figure(r.opts('pushup', { still: true })); f.prepare(); f.paint(r.target(), 1, 1, 'angle');
    assert.equal(calls.length, 0);
    const c = r.stage().figure(r.opts('pushup')); c.paint(r.target(), .5, 0, 'angle'); c.paint(r.target(), .6, 0, 'angle');
    assert(calls.length >= 1, 'карточки плана — как раньше');
  } finally { r.stage().dispose(); r.dom.window.close(); }
});

/* ---------- 3. кеш между сеансами ---------- */
function fakeCaches() {
  const stores = new Map();
  const api = {
    open: async name => { if (!stores.has(name)) stores.set(name, new Map()); const m = stores.get(name);
      return { put: async (u, res) => { m.set(String(u), await res.blob()); }, match: async u => m.has(String(u)) ? new Response(m.get(String(u))) : undefined,
        keys: async () => [...m.keys()].map(url => ({ url })), delete: async r => m.delete(typeof r === 'string' ? r : r.url) }; },
    keys: async () => [...stores.keys()], delete: async k => stores.delete(k) };
  return { stores, api };
}
function storeModel({ href = 'https://lazy.test/app/en/index.html', lang = 'en', caches = fakeCaches().api } = {}) {
  const m = loadModel({ fullApp: true });
  m.get('globalThis.__set=(o)=>Object.assign(globalThis,o)')({ location: { href }, PODHOD_BUILD: '4.51.0-abc', PODHOD_RENDER: { anatomy: 'ra', skeleton: 'rs', skin: 'rk' }, PODHOD_LANG: lang, caches: caches === 'none' ? undefined : caches, Response, URL, Blob });
  return m;
}

test('cache between sessions: one bucket per place for both languages and all builds; put, get, and the old per-build buckets removed', async () => {
  const { stores, api } = fakeCaches();
  await api.open('podhod-thumbs@https://lazy.test/app/:4.50.0-old'); await api.open('podhod-thumbs@https://lazy.test/other/:4.50.0-old');
  const m = storeModel({ caches: api });
  assert.equal(m.get('thumbScope()'), 'https://lazy.test/app/', 'английская страница — тот же корень, что русская');
  const S = m.get('ThumbStore');
  const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/webp' });
  await S.put('t1|k', blob);
  const back = await S.get('t1|k'); assert.equal(back.size, 3); assert.equal(back.type, 'image/webp');
  assert.equal(await S.get('t1|missing'), null);
  assert.equal(await S.clean(), 1, 'корзина прежней схемы этого места удалена');
  assert.deepEqual([...stores.keys()].sort(), ['podhod-thumbs2@https://lazy.test/app/', 'podhod-thumbs@https://lazy.test/other/:4.50.0-old']);
  /* имя корзины совпадает с тем, что оставляет сервис-воркер */
  const sw = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'src/sw.js'), 'utf8').replace(/__VERSION__/g, '4.51.0-abc') + ';this.T=THUMBS;',
    Object.assign(sw, { self: { addEventListener() {}, registration: { scope: 'https://lazy.test/app/' }, location: { origin: 'https://lazy.test' } }, caches: api }));
  assert.equal(sw.T, 'podhod-thumbs2@https://lazy.test/app/', 'сервис-воркер знает ту же корзину и не привязывает её к сборке');
  /* «новая версия»: та же корзина, тот же кадр */
  const m2 = storeModel({ caches: api }); m2.get('globalThis.__set')({ PODHOD_BUILD: '4.52.0-new' });
  assert.equal((await m2.get('ThumbStore').get('t1|k')).size, 3, 'кадр пережил смену сборки');
});

test('no persistent cache where Cache Storage cannot work: the offline file (file://) and a missing API', async () => {
  for (const o of [{ href: 'file:///tmp/lazy-gym-planner-offline-ru.html', lang: 'ru' }, { caches: 'none' }]) {
    const m = storeModel(o), S = m.get('ThumbStore');
    assert.equal(await S.get('t1|k'), null); await S.put('t1|k', new Blob(['x'])); assert.equal(S.on, false);
  }
});
