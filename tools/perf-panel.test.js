'use strict';
/* Скрытая панель замера скорости (?perf, src/js/19-perf-panel.js): медиана и процентили, кадры в секунду, сводка
   кадров по частям, текст результата; включение одним флагом (без флага — ни разметки, ни слушателей, ни замеров);
   крючки: кадр SVG карточки (07-rigs-core.js) — из памяти или заново, обёртки объёмной фигуры (src/volume/main.mjs). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const { loadModel } = require('./biomechanics-audit');
const dir = path.join(__dirname, '../src/js');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const m = loadModel({ fullApp: true });
const api = m.get('({perfMedian, perfPercentile, perfStat, perfFps, perfSummary, perfNum, perfPair, perfUa, perfFlag, perfReportText, perfStepLine, perfPaceText, PERF_STEPS})');

test('median and percentiles: unsorted input, even and odd counts, gaps ignored', () => {
  const { perfMedian, perfPercentile, perfStat } = api;
  assert.equal(perfMedian([5, 1, 3]), 3);
  assert.equal(perfMedian([4, 1, 3, 2]), 2.5);
  assert.equal(perfMedian([7]), 7);
  assert.equal(perfMedian([]), null);
  assert.equal(perfMedian([2, null, NaN, undefined, 4]), 3, 'frames whose time has not arrived yet are skipped');
  const hundred = Array.from({ length: 100 }, (_, i) => 100 - i);
  assert.equal(perfPercentile(hundred, 95), 95, 'nearest rank: 95 of 1..100');
  assert.equal(perfPercentile(hundred, 50), 50);
  assert.equal(perfPercentile(hundred, 100), 100);
  assert.equal(perfPercentile(Array.from({ length: 20 }, (_, i) => i + 1), 95), 19);
  assert.equal(perfPercentile([3, 9, 1], 95), 9, 'small sample: the largest');
  assert.equal(perfPercentile([42], 95), 42);
  assert.equal(perfPercentile([], 95), null);
  assert.deepEqual({ ...perfStat([10, 30, 20, 40]) }, { med: 25, p95: 40, n: 4 });
  assert.equal(perfStat([null, NaN]), null);
});

test('frames per second: frames over the measured window, not over the first-to-last span', () => {
  const { perfFps, perfSummary } = api;
  assert.equal(perfFps(60, 1000), 60);
  assert.equal(perfFps(15, 500), 30);
  assert.equal(perfFps(0, 2000), 0);
  assert.equal(perfFps(10, 0), null);
  /* три кадра пачкой за 0,1 с в окне 2 с — 1,5 кадра в секунду, а не 20 */
  const burst = [0, 50, 100].map(t => ({ t, cost: 5, b: null }));
  assert.equal(perfSummary(burst, 2000).fps, 1.5);
});

test('summary per frame: card frames from memory and computed, DOM; 3D parts, the rest of the scene, totals', () => {
  const { perfSummary } = api;
  const frames = [
    { t: 0, cost: 10, b: { svgMiss: 4, nMiss: 1, svgDom: 1 } },
    { t: 16, cost: 12, b: null },
    { t: 33, cost: 6, b: { svgHit: .5, nHit: 1, svgDom: 1.5 } },
    { t: 50, cost: 20, b: { pose: 3, scene: 9, skin: 1, bones: 2, muscles: 4, render: 6 } },
    { t: 66, cost: null, b: { pose: 5, scene: 5, skin: 1, render: 8 } }
  ];
  const s = perfSummary(frames, 100);
  assert.equal(s.frames, 5);
  assert.equal(s.fps, 50);
  assert.equal(s.figFps, 40, 'four frames drew a figure');
  assert.deepEqual({ ...s.counts }, { svgHit: 1, svgMiss: 1, anat: 0, thumb: 0 });
  assert.equal(s.parts.card.n, 2); assert.equal(s.parts.card.med, 3.5, 'card frame = calc + DOM: 5 and 2');
  assert.equal(s.parts.svgMiss.med, 4); assert.equal(s.parts.svgHit.med, .5); assert.equal(s.parts.svgDom.n, 2);
  assert.equal(s.parts.volume.n, 2); assert.deepEqual([s.parts.volume.med, s.parts.volume.p95], [18, 18], '3D frame = pose + scene + render');
  assert.equal(s.parts.bones.n, 1, 'parts are counted only in frames that had them');
  assert.deepEqual([s.parts.sceneRest.med, s.parts.sceneRest.n], [3, 2], 'scene minus skin, bones and muscles: 2 and 4');
  assert.equal(s.cost.n, 4, 'a frame without its time is left out');
  assert.equal(perfSummary([], 2000).parts.card, null);
});

test('user agent: system, browser and model; Chrome on Android hides the model', () => {
  const { perfUa } = api;
  const ua = s => ({ ...perfUa(s) });
  assert.deepEqual(ua('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'), { os: 'Android 10', browser: 'Chrome 129', model: '' });
  assert.deepEqual(ua('Mozilla/5.0 (Linux; Android 13; SM-A525F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'), { os: 'Android 13', browser: 'Samsung Internet 23', model: 'SM-A525F' });
  assert.deepEqual(ua('Mozilla/5.0 (Linux; Android 12; M2101K6G Build/SKQ1.210908.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 YaBrowser/24.1.2.86.00 SA/3 Mobile Safari/537.36'), { os: 'Android 12', browser: 'Яндекс Браузер 24', model: 'M2101K6G' });
  assert.deepEqual(ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'), { os: 'iOS 17.5', browser: 'Safari 17.5', model: '' });
  assert.deepEqual(ua('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.6668.69 Mobile/15E148 Safari/604.1'), { os: 'iOS 18.0', browser: 'Chrome 129', model: '' });
  assert.deepEqual(ua('Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0'), { os: 'Android 14', browser: 'Firefox 131', model: '' });
  assert.deepEqual(ua('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0'), { os: 'Windows 10/11', browser: 'Edge 129', model: '' });
  assert.deepEqual(ua('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'), { os: 'macOS 10.15', browser: 'Safari 17.4', model: '' });
  assert.deepEqual(ua(''), { os: '', browser: '', model: '' });
});

test('flag: ?perf and ?perf=1 switch on, ?perf=0 switches off, other parameters are not the flag', () => {
  const { perfFlag } = api;
  assert.equal(perfFlag('?perf'), 'on');
  assert.equal(perfFlag('?perf=1'), 'on');
  assert.equal(perfFlag('?lang=en&perf'), 'on');
  assert.equal(perfFlag('?perf&x=1'), 'on');
  assert.equal(perfFlag('?perf=0'), 'off');
  assert.equal(perfFlag('?x=2&perf=0'), 'off');
  assert.equal(perfFlag('?perfume'), null);
  assert.equal(perfFlag('?a=perf'), null);
  assert.equal(perfFlag(''), null);
  assert.equal(perfFlag(undefined), null);
});

test('result text: device, legend, one line per step with median/95 % pairs, skipped steps, light 3D mode', () => {
  const { perfReportText, perfSummary, perfNum, perfPair } = api;
  assert.equal(perfNum(4.26), '4,3'); assert.equal(perfNum(12.6), '13'); assert.equal(perfNum(null), '—');
  assert.equal(perfPair({ med: 1.25, p95: 31.2, n: 4 }), '1,3/31'); assert.equal(perfPair(null), '—');
  const frames = n => Array.from({ length: n }, (_, i) => ({ t: i * 33, cost: 8 + i % 3, b: { pose: 3, scene: 9, skin: 1, bones: 2, muscles: 4, render: 6 } }));
  const card = Array.from({ length: 30 }, (_, i) => ({ t: i * 33, cost: 5, b: i < 10 ? { svgMiss: 4, nMiss: 1, svgDom: 1 } : { svgHit: .4, nHit: 1, svgDom: 1 } }));
  const r = {
    date: new Date(2026, 9, 15, 9, 5), aborted: false,
    device: { version: '4.48.0', build: '4.48.0-abc', os: 'Android 14', browser: 'Chrome 129', model: 'SM-A525F', cores: 8, memory: 4, dpr: 2.625, screen: [412, 915], viewport: [412, 839], reduced: false, gpu: { renderer: 'Adreno (TM) 619', webgl2: true } },
    steps: [
      { kind: 'plan', label: 'План: карточка «Присед»', sum: perfSummary(card, 1000), q0: null, q1: null },
      { kind: 'detail', label: 'Разбор: Жим ногами — Анатомия', open: 812.4, wait: 40, sum: perfSummary(frames(30), 1000), q0: 'normal', q1: 'low' },
      { kind: 'detail', label: 'Разбор: Жим ногами — Манекен', open: 9, wait: 0, sum: perfSummary(frames(30), 1000), q0: 'low', q1: 'low', hidden: true },
      { kind: 'workout', label: 'Тренировка', skip: 'идёт отдых — тренировку не трогаем' }
    ]
  };
  const text = perfReportText(r), lines = text.split('\n');
  assert.match(lines[0], /^Lazy Gym Planner 4\.48\.0 \(сборка 4\.48\.0-abc\) — замер скорости, 15\.10\.2026, 09:05$/);
  assert.equal(lines[1], 'Устройство: Android 14 · Chrome 129 · SM-A525F; 8 ядер, память 4 ГБ, экран 412×915 ×2,6, окно 412×839');
  assert.equal(lines[2], 'Видеокарта: Adreno (TM) 619 · WebGL2 есть');
  assert.match(lines[3], /^Пары чисел — медиана\/95-й процентиль/);
  assert.equal(lines[4], '1. План: карточка «Присед»: экран 30 к/с, фигура 30 к/с; кадр 5,0/5,0; SVG заново 4,0/4,0 (10 кадров), из памяти 0,4/0,4 (20 кадров), DOM 1,0/1,0');
  assert.equal(lines[5], '2. Разбор: Жим ногами — Анатомия: открытие 812 мс; экран 30 к/с, фигура 30 к/с; кадр 9,0/10; поза 3,0/3,0; кожа 1,0/1,0; кости 2,0/2,0; мышцы 4,0/4,0; сцена 2,0/2,0; отрисовка 6,0/6,0; всего 18/18; объём перешёл в облегчённый режим');
  assert.match(lines[6], /^3\. .*; объём облегчённый; страница уходила в фон — шаг неточный$/);
  assert.equal(lines[7], '4. Тренировка: пропущен — идёт отдых — тренировку не трогаем');
  assert.equal(lines[8], 'Облегчённый режим объёма включился на шаге 2.');
  assert.equal(lines.length, 9);
  assert.match(perfReportText({ ...r, aborted: true, steps: r.steps.slice(0, 1) }), /Облегчённый режим объёма не включался\.\nЗамер остановлен до конца\.$/);
  assert.match(perfReportText({ ...r, steps: r.steps.slice(2, 3) }), /был включён ещё до замера/);
});

test('without the flag the panel costs one check: no markup, no listeners, no timers, the hooks flag is null', () => {
  assert.equal(m.get('globalThis.GymPerf'), null, 'the app model (no flag): the hooks flag is null');
  const dom = new JSDOM('<html><body></body></html>', { runScripts: 'outside-only', url: 'https://lazy-gym.test/', pretendToBeVisual: true });
  try {
    const w = dom.window, calls = [];
    for (const [o, k] of [[w, 'addEventListener'], [w.document, 'addEventListener'], [w, 'setInterval'], [w, 'setTimeout'], [w, 'requestAnimationFrame'], [w.document, 'createElement']]) {
      const orig = o[k].bind(o); o[k] = (...a) => { calls.push(k); return orig(...a); };
    }
    w.eval(read('19-perf-panel.js'));
    assert.deepEqual(calls, []);
    assert.equal(w.document.body.children.length, 0);
    assert.equal(w.eval('GymPerf'), null, 'the flag exists (a missing window property is a slow lookup) and is off');
  } finally { dom.window.close(); }
});

/* панель в JSDOM: файл панели и небольшие заглушки приложения */
function panelDom(url, stored) {
  const dom = new JSDOM('<html><body><dialog id="motion-view"></dialog><dialog id="workout-view"></dialog></body></html>', { runScripts: 'outside-only', url, pretendToBeVisual: true });
  if (stored) dom.window.localStorage.setItem('podhod.perf', stored);
  dom.window.eval(`const $ = (s, r = document) => r.querySelector(s); const esc = s => String(s); let DEC = ','; function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; }\n` + read('19-perf-panel.js'));
  return dom;
}
test('?perf switches the panel on and remembers it; ?perf=0 and «Выключить» switch it off', () => {
  let dom = panelDom('https://lazy-gym.test/?perf');
  try {
    const w = dom.window;
    assert.equal(w.localStorage.getItem('podhod.perf'), 'open');
    assert.ok(w.document.querySelector('#perf-panel'), 'panel is shown');
    assert.equal(typeof w.GymPerf, 'object');
    assert.match(w.document.querySelector('#perf-panel').textContent, /Замер скорости/);
    /* свернуть — кружок с кадрами в секунду, выбор запоминается */
    w.document.querySelector('[data-perf="min"]').click();
    assert.equal(w.document.querySelector('#perf-panel').dataset.state, 'min');
    assert.equal(w.localStorage.getItem('podhod.perf'), 'min');
    w.document.querySelector('[data-perf="open"]').click();
    w.document.querySelector('[data-perf="off"]').click();
    assert.equal(w.document.querySelector('#perf-panel'), null);
    assert.equal(w.GymPerf, null);
    assert.equal(w.localStorage.getItem('podhod.perf'), null);
    assert.equal(w.location.search, '', 'the flag leaves the address');
  } finally { dom.window.close(); }
  dom = panelDom('https://lazy-gym.test/', 'min');
  try { assert.equal(dom.window.document.querySelector('#perf-panel').dataset.state, 'min', 'remembered without the flag, collapsed as left'); } finally { dom.window.close(); }
  dom = panelDom('https://lazy-gym.test/?perf=0', 'open');
  try { assert.equal(dom.window.document.querySelector('#perf-panel'), null); assert.equal(dom.window.localStorage.getItem('podhod.perf'), null); } finally { dom.window.close(); }
});

test('the panel follows the topmost open modal window (a modal makes the rest of the page inert)', async () => {
  const dom = panelDom('https://lazy-gym.test/?perf');
  try {
    const w = dom.window, d = w.document, panel = () => d.querySelector('#perf-panel'), tick = () => new Promise(r => setTimeout(r, 0));
    assert.equal(panel().parentElement, d.body);
    d.querySelector('#workout-view').setAttribute('open', ''); await tick();
    assert.equal(panel().parentElement.id, 'workout-view');
    d.querySelector('#motion-view').setAttribute('open', ''); await tick();
    assert.equal(panel().parentElement.id, 'motion-view', 'technique opened over the workout');
    d.querySelector('#motion-view').removeAttribute('open'); await tick();
    assert.equal(panel().parentElement.id, 'workout-view');
    d.querySelector('#workout-view').removeAttribute('open'); await tick();
    assert.equal(panel().parentElement, d.body);
  } finally { dom.window.close(); }
});

test('3D hooks: each call goes to its part, nested bone frames are not counted twice, figure creation is not a frame', async () => {
  const dom = panelDom('https://lazy-gym.test/?perf');
  try {
    /* часы — свои: каждая часть «работает» ровно столько, сколько сдвигает часы (на загруженном стенде настоящие
       часы дают паузы сборки мусора и вытеснения) */
    const w = dom.window, P = w.GymPerf; let clock = 1000;
    w.performance.now = () => clock;
    const busy = ms => { clock += ms; };
    w.Skeleton = { frames() { busy(2); return 'A'; } };
    const skeleton = { update(data, pose, body, A = w.Skeleton.frames()) { busy(1); return A; } };
    const scene = { mannequin: { apply() { busy(1); } }, skeleton, muscleLayer: { update() { busy(4); } }, apply() { this.mannequin.apply(); skeleton.update(); this.muscleLayer.update(); busy(.5); } };
    const renderer = { render() { busy(6); } }, options = { data() { busy(3); return {}; } };
    P.volume({ scene, renderer, options, root: null, low: () => true });
    options.data(); scene.apply(); renderer.render();
    assert.equal(P.bucket, null, 'creation (same task) is not recorded');
    await new Promise(r => setTimeout(r, 0));
    P.bucket = null;
    options.data(); scene.apply(); renderer.render();
    assert.deepEqual({ ...P.bucket }, { pose: 3, skin: 1, bones: 3, muscles: 4, scene: 8.5, render: 6 }, 'bones = layer update with its own frames, counted once');
    /* кости в «Анатомии»: рамки считаются в сцене и передаются слою — тоже один раз */
    P.bucket = null; w.Skeleton.frames(); skeleton.update(null, null, null, 'A');
    assert.deepEqual({ ...P.bucket }, { bones: 3 });
    assert.equal(w.eval('perfQuality()'), 'low', 'quality comes from the 3D module');
    /* обёртки не наслаиваются: та же фигура второй раз — тот же вызов */
    const once = scene.apply; P.volume({ scene, renderer, options, low: () => false }); assert.equal(scene.apply, once);
    /* выключили — общая функция костей вернулась, обёртки фигуры просто передают вызов */
    const wrapped = w.Skeleton.frames; w.eval('perfStop()');
    assert.notEqual(w.Skeleton.frames, wrapped); assert.equal(w.Skeleton.frames(), 'A');
    assert.doesNotThrow(() => { scene.apply(); renderer.render(); });
  } finally { dom.window.close(); }
});

test('SVG card hook: the second circle of a repetition hands over the same frames — counted «from memory»', () => {
  const dom = new JSDOM('<html lang="ru"><body></body></html>', { runScripts: 'outside-only', url: 'https://lazy-gym.test/' });
  try {
    const files = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && parseInt(f) < 11).sort();
    dom.window.eval(files.map(read).join('\n') + '\nwindow.api={EX,buildFigure};');
    const { EX, buildFigure } = dom.window.api, seen = [];
    dom.window.GymPerf = { svg: (p0, p1, F) => seen.push([p0, p1, F]) };
    const fig = buildFigure(EX.find(e => e.id === 'latpulluh').anim, { ratio: 1, t: 0, frameCache: true });
    const phases = [[.2, 0], [.6, 0], [1, 1], [.4, 2]];
    seen.length = 0;
    for (let circle = 0; circle < 2; circle++) for (const [t, index] of phases) fig.at(t, { index });
    assert.equal(seen.length, 8);
    for (const [p0, p1] of seen) assert(p0 > 0 && p1 >= p0);
    for (let i = 0; i < 4; i++) assert.equal(seen[i + 4][2], seen[i][2], 'same frame object on the second circle');
    assert.equal(new Set(seen.slice(0, 4).map(x => x[2])).size, 4);
    /* выключено — крючок молчит */
    dom.window.GymPerf = null; seen.length = 0; fig.at(.3, { index: 0 }); assert.equal(seen.length, 0);
    delete dom.window.GymPerf; fig.at(.4, { index: 0 }); assert.equal(seen.length, 0, 'and without the panel file at all');
  } finally { dom.window.close(); }
});

/* «Анатомия» карточек плана и экрана тренировки (этап 2): общий рендерер карточек, ступень скорости и откат на манекен */
test('anatomy cards: the whole card frame and its copy are counted per frame; a figure frame; parts come from the same wrappers', () => {
  const { perfSummary } = api;
  const frames = [
    { t: 0, cost: 14, b: { anat: 10, copy: .2, nAnat: 1, pose: 2, scene: 6, skin: 1, bones: 1.5, muscles: 2.5, render: 1.8 } },
    { t: 16, cost: 3, b: null },
    { t: 33, cost: 13, b: { anat: 9, copy: .3, nAnat: 1, pose: 2, scene: 5, render: 1.7 } },
    { t: 50, cost: 3, b: null }
  ];
  const s = perfSummary(frames, 66.7);
  assert.equal(s.parts.anat.n, 2); assert.equal(s.parts.anat.med, 9.5);
  assert.equal(s.parts.copy.med, .25);
  assert.equal(s.counts.anat, 2);
  assert.equal(Math.round(s.figFps), 30, 'two of four frames drew the card: 30 figure frames per second');
  assert.equal(s.parts.card, null, 'no SVG card frames');
  assert.equal(s.parts.volume.n, 2, 'pose + scene + render of the card');
});

test('anatomy step lines: step and median, or the fallback; the closing line says whether the fallback happened', () => {
  const { perfReportText, perfSummary, perfPaceText } = api;
  assert.equal(perfPaceText({ fps: 30, median: 9.84, slow: false }), 'ступень 30 к/с, медиана 9,8 мс');
  assert.equal(perfPaceText({ fps: 10, median: 61.2, slow: true }), 'откат на манекен (медиана 61 мс)');
  assert.equal(perfPaceText({ fps: 30, median: null, slow: false }), 'ступень 30 к/с, медиана — мс');
  const card = Array.from({ length: 30 }, (_, i) => ({ t: i * 33, cost: 12, b: { anat: 10, copy: .2, nAnat: 1, pose: 2, scene: 6, render: 2 } }));
  const r = {
    date: new Date(2026, 9, 15, 9, 5), aborted: false,
    device: { version: '4.49.0', build: 'b', os: 'Android 14', browser: 'Chrome 129', model: '', cores: 8, memory: 4, dpr: 2, screen: [412, 915], reduced: false, gpu: { renderer: 'Adreno', webgl2: true } },
    steps: [
      { kind: 'plan', label: 'План: карточка «Присед» — Анатомия', sum: perfSummary(card, 1000), q0: 'normal', q1: 'low', pace: { fps: 30, median: 9.6, slow: false } },
      { kind: 'workout', label: 'Тренировка: Присед — Анатомия', open: 400, wait: 0, sum: perfSummary(card, 1000), q0: 'normal', q1: 'normal', pace: { fps: 10, median: 62, slow: true } }
    ]
  };
  const lines = perfReportText(r).split('\n');
  assert.equal(lines[4], '1. План: карточка «Присед» — Анатомия: экран 30 к/с, фигура 30 к/с; кадр 12/12; анатомия 10/10 (копия 0,2/0,2); поза 2,0/2,0; сцена 6,0/6,0; отрисовка 2,0/2,0; всего 10/10; ступень 30 к/с, медиана 9,6 мс',
    'card in «Anatomy»: its frame, copy, parts; no light-mode words for cards');
  assert.match(lines[5], /^2\. Тренировка: Присед — Анатомия: открытие 400 мс; .*; объём обычный; откат на манекен \(медиана 62 мс\)$/);
  assert.equal(lines.at(-1), 'Откат «Анатомии» на манекен включился на шаге 2.');
  r.steps[1].pace.slow = false;
  assert.equal(perfReportText(r).split('\n').at(-1), 'Откат «Анатомии» на манекен не включался.');
});

test('the run measures the plan card and the workout in «Anatomy» and in «Mannequin», the 3D detail — as before, and the atlas gallery in «Anatomy»', () => {
  const steps = JSON.parse(JSON.stringify(api.PERF_STEPS));
  assert.deepEqual(steps.map(s => s.kind + ':' + s.view + (s.id ? ':' + s.id : '')), ['plan:anatomy', 'plan:mannequin',
    'detail:anatomy:latpulluh', 'detail:mannequin:latpulluh', 'detail:anatomy:legpress', 'detail:mannequin:legpress', 'detail:anatomy:squat', 'detail:mannequin:squat',
    'workout:anatomy', 'workout:mannequin', 'gallery:anatomy']);
});

test('gallery thumbnails: each task is recorded on its own; the report line names them and the time to anatomy near the screen', () => {
  const { perfSummary, perfStepLine } = api;
  const frames = [{ t: 0, cost: 9, b: { thumbs: [30, 45] } }, { t: 16, cost: 8, b: null }, { t: 33, cost: 10, b: { thumbs: [60] } }];
  const u = perfSummary(frames, 1000);
  assert.deepEqual(JSON.parse(JSON.stringify([u.parts.thumb.med, u.parts.thumb.n, u.counts.thumb])), [45, 3, 3]);
  const line = perfStepLine({ kind: 'gallery', label: 'Атлас движений: витрина — Анатомия', open: 120, sum: u, anatAt: 1830 }, 10);
  assert.match(line, /^11\. Атлас движений: витрина — Анатомия: открытие 120 мс; экран 3,0 к\/с, фигура 2,0 к\/с; кадр 9,0\/10; миниатюры 45\/60 \(3 задачи\), анатомия у экрана за 1830 мс$/);
});

test('card hooks: GymPerf.card records the card frame (not while a scene is built); card scenes keep the 3D quality flag of the detail', async () => {
  const dom = panelDom('https://lazy-gym.test/?perf');
  try {
    const w = dom.window, P = w.GymPerf; let clock = 1000;
    w.performance.now = () => clock;
    const fig = { scene: { apply() { clock += 3; } }, renderer: { render() { clock += 1; } }, options: { data() { clock += 2; return {}; } } };
    P.volume({ ...fig, low: () => true });
    assert.equal(w.eval('perfQuality()'), 'low');
    const card = { scene: { apply() { clock += 5; } }, renderer: { render() { clock += 1; } }, options: { data() { clock += 2; return {}; } } };
    P.volume({ ...card, root: null, card: true });
    assert.equal(w.eval('perfQuality()'), 'low', 'a card scene does not replace the quality source');
    P.card(9, .2); assert.equal(P.bucket, null, 'the frame that built a scene is not recorded');
    await new Promise(r => setTimeout(r, 0)); P.bucket = null;
    card.options.data(); card.scene.apply(); card.renderer.render(); P.card(8, .3); P.card(7, .1);
    assert.deepEqual({ ...P.bucket }, { pose: 2, scene: 5, render: 1, anat: 15, copy: .4, nAnat: 2 });
  } finally { dom.window.close(); }
});
