/* ---------- Замер скорости на настоящем телефоне: скрытая панель ?perf (П8) ----------
   Включение: адрес с ?perf (или ?perf=1) включает панель и запоминает это (localStorage 'podhod.perf'), ?perf=0 —
   выключает; кнопка «Выключить» на панели — тоже. Во Floot приложение работает в iframe (srcdoc) — флаг читается и
   из адреса страницы-хозяина. Без флага этот файл делает одну проверку при запуске: ни замеров, ни слушателей, ни разметки.
   Крючки замера в чужих файлах — по одной-две строки, и выключенными стоят одну проверку globalThis.GymPerf:
   · 07-rigs-core.js, at() SVG-фигуры (карточки плана): расчёт кадра — из памяти кадров или заново — и запись в DOM;
   · src/volume/main.mjs, создание объёмной фигуры: GymPerf.volume() оборачивает вызовы этой фигуры — поза (данные
     кадра: поза и поверхность тела), кожа (сетка кожи), кости (с рамками костей), мышцы, сцена, отрисовка (render);
   · src/volume/main.mjs, общий рендерер карточек «Анатомии» (GymVolume.cards): GymPerf.volume({card:true}) при сборке
     сцены упражнения — те же обёртки, GymPerf.card() — весь кадр карточки и копия в её холст. Ступень скорости и откат
     на манекен панель читает сама: cardAnatomy (12-motion-player.js), workoutFigure (14-workout-mode.js);
   · 13e-gallery-anatomy.js, миниатюры витрины атласа в «Анатомии»: GymPerf.thumb() — каждая задача миниатюры (сборка
     сцены, кадр); сколько миниатюр у экрана уже готово — galleryAnatStats().
   Кадры считает свой requestAnimationFrame; «кадр» — от метки кадра до первой задачи после отрисовки страницы
   (MessageChannel): оценка всего времени главного потока на кадр, вместе со стилями и отрисовкой SVG браузером.
   «Замерить» — сценарий ≈2 мин без участия человека: карточка плана, разбор трёх упражнений и экран тренировки — каждый
   в видах «Анатомия» и «Манекен», и витрина атласа в «Анатомии». Журнал, настройки и планы не меняются: выбор вида,
   ракурса и раздела возвращается. */
const PERF_KEY = 'podhod.perf', PERF_LIVE_MS = 2000;
const PERF_T = {
  title:'Замер скорости', expand:'Развернуть панель замера скорости', collapse:'Свернуть панель', fps:'к/с',
  screen:'Экран', cards:'Карточки', volume:'Объём', frame:'кадр', fromMemory:'из памяти',
  anew:'заново', pose:'поза', skin:'кожа', bones:'кости', muscles:'мышцы', scene:'сцена', render:'отрисовка', total:'всего',
  figure:'фигура', ms:'мс', low:'облегчённое', noFrames:'нет кадров', anatCard:'анатомия', copyPart:'копия',
  pace:'ступень {fps} к/с, медиана {ms} мс', paceSlow:'откат на манекен (медиана {ms} мс)', paceTag:'откат',
  thumbs:'миниатюры', thumbTask:'задача', thumbReady:'у экрана готово {n} из {m}', thumbVisible:'только видимые', thumbAnat:'анатомия у экрана за {n} мс',
  galleryStep:'витрина',
  slowNever:'Откат «Анатомии» на манекен не включался.', slowAt:'Откат «Анатомии» на манекен включился на шаге {i}.',
  anatomy:'Анатомия', skeleton:'Скелет', mannequin:'Манекен', svg:'рисунок SVG',
  plan:'План', detail:'Разбор', workout:'Тренировка', gallery:'Атлас движений', card:'карточка',
  liveNote:'Медиана / 95 % за 2 с, мс на кадр. «Кадр» — весь кадр с отрисовкой страницы (оценка).', view:'Вид',
  run:'Замерить', stop:'Остановить', off:'Выключить', device:'Устройство', copy:'Скопировать результат', share:'Поделиться',
  close:'Закрыть итог', step:'Шаг', frameCol:'Кадр', fig:'Фигура',
  running:'Идёт замер… не трогайте экран, шаг {i} из {n}', runHint:'Около двух минут. Экран не трогайте и не блокируйте.',
  stopped:'Замер остановлен — показаны готовые шаги.', closeWorkout:'Сначала закройте экран тренировки, потом нажмите «Замерить».',
  copied:'Скопировано — вставьте в сообщение.', copyFail:'Скопировать автоматически не удалось. Выделите текст и скопируйте:',
  resultNote:'к/с — кадров в секунду на экране, под ними — кадров фигуры. Пары чисел — медиана / 95-й процентиль, мс на кадр. Разбор по частям — в тексте для копирования.',
  noCards:'в плане нет карточек с рисунком', noPlan:'нет плана — тренировку не открыть', restOn:'идёт отдых — тренировку не трогаем',
  noVolume:'объёмная графика недоступна', hidden:'страница уходила в фон — шаг неточный', skipped:'пропущен', error:'ошибка',
  head:'замер скорости', build:'сборка', memory:'память {n} ГБ', screenSize:'экран', windowSize:'окно',
  gpu:'Видеокарта', webgl2:'WebGL2 есть', noWebgl2:'WebGL2 нет', reduced:'уменьшение движения включено',
  legend:'Пары чисел — медиана/95-й процентиль, мс главного потока на кадр. «Кадр» — весь кадр вместе с отрисовкой страницы (оценка); поза — расчёт позы и поверхности тела, кожа — запись её сетки, кости — с рамками костей; анатомия — весь кадр карточки в «Анатомии», копия — перенос кадра в её холст; ступень — частота костей и мышц (30, 15, 10 кадров в секунду), медиана — по которой она выбрана; миниатюры — задачи витрины атласа (сборка сцены, кадр).',
  open:'открытие {n} мс', wait:'данные ещё {n} мс', lowAt:'Облегчённый режим объёма включился на шаге {i}.',
  lowBefore:'Облегчённый режим объёма был включён ещё до замера.', lowNever:'Облегчённый режим объёма не включался.',
  qNormal:'объём обычный', qLow:'объём облегчённый', qSwitch:'объём перешёл в облегчённый режим',
  shareTitle:'Lazy Gym Planner — замер скорости', abortedLine:'Замер остановлен до конца.'
};
const perfSay = (key, vars) => String(PERF_T[key]).replace(/\{(\w+)\}/g, (m, k) => vars && k in vars ? vars[k] : m);

/* ---------- счёт: медиана, процентиль, кадры в секунду (tools/perf-panel.test.js) ---------- */
function perfSorted(list) { return Float64Array.from((list || []).filter(Number.isFinite)).sort(); }
function perfMedian(list) { const s = perfSorted(list), n = s.length; if (!n) return null; const m = n >> 1; return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
/* процентиль «по рангу»: наименьшее значение, не меньше которого p % выборки */
function perfPercentile(list, p) { const s = perfSorted(list), n = s.length; if (!n) return null; return s[Math.min(n - 1, Math.max(0, Math.ceil(p / 100 * n) - 1))]; }
function perfStat(list) { const v = (list || []).filter(Number.isFinite); return v.length ? {med:perfMedian(v), p95:perfPercentile(v, 95), n:v.length} : null; }
/* кадров в секунду: кадров за окно замера (мс). Не по промежутку между первым и последним кадром — редкие кадры
   пачкой (отрисовка не успевает) дали бы высокое число */
function perfFps(count, ms) { return ms > 0 ? count * 1000 / ms : null; }
/* Кадр (запись цикла панели): t — метка rAF, cost — весь кадр главного потока, b — замеры крючков за кадр, мс:
   svgHit / svgMiss — расчёт кадра SVG из памяти / заново (nHit, nMiss — сколько фигур), svgDom — запись в DOM;
   pose, scene (с кожей skin, костями bones и мышцами muscles внутри), render — объём; anat — весь кадр карточки в
   «Анатомии» (nAnat — сколько карточек), copy — копия кадра в её холст (части кадра — те же pose, scene, render). */
const PERF_PARTS = ['svgHit', 'svgMiss', 'svgDom', 'card', 'anat', 'copy', 'thumb', 'pose', 'skin', 'bones', 'muscles', 'sceneRest', 'render', 'volume'];
function perfSummary(frames, ms) {
  const per = Object.fromEntries(PERF_PARTS.map(k => [k, []])), counts = {svgHit:0, svgMiss:0, anat:0, thumb:0};
  let fig = 0;
  for (const f of frames) {
    const b = f.b; if (!b) continue;
    for (const k of ['svgHit', 'svgMiss', 'svgDom', 'anat', 'copy', 'pose', 'skin', 'bones', 'muscles', 'render']) if (b[k] != null) per[k].push(b[k]);
    /* миниатюры витрины — каждая задача отдельно */
    if (b.thumbs) per.thumb.push(...b.thumbs);
    counts.svgHit += b.nHit || 0; counts.svgMiss += b.nMiss || 0; counts.anat += b.nAnat || 0; counts.thumb += b.thumbs ? b.thumbs.length : 0;
    if (b.scene != null) per.sceneRest.push(Math.max(0, b.scene - (b.skin || 0) - (b.bones || 0) - (b.muscles || 0)));
    const svg = (b.svgHit || 0) + (b.svgMiss || 0) + (b.svgDom || 0), vol = (b.pose || 0) + (b.scene || 0) + (b.render || 0);
    if (b.nHit || b.nMiss) per.card.push(svg);
    if (b.pose != null || b.scene != null || b.render != null) per.volume.push(vol);
    if (b.nHit || b.nMiss || b.nAnat || b.thumbs || b.scene != null || b.render != null) fig++;
  }
  return {frames:frames.length, ms, fps:perfFps(frames.length, ms), figFps:fig ? perfFps(fig, ms) : null,
    cost:perfStat(frames.map(f => f.cost)), parts:Object.fromEntries(PERF_PARTS.map(k => [k, perfStat(per[k])])), counts};
}
/* числа текста: до 10 — с десятой, дальше — целые; разделитель — как в приложении */
function perfNum(v) { if (v == null || !Number.isFinite(v)) return '—'; const s = Math.abs(v) >= 10 ? String(Math.round(v)) : v.toFixed(1); return s.replace('.', typeof DEC === 'string' ? DEC : ','); }
function perfPair(st) { return st && st.n ? perfNum(st.med) + '/' + perfNum(st.p95) : '—'; }

/* ---------- устройство ---------- */
function perfUa(ua) {
  ua = String(ua || ''); let os = '', m;
  if ((m = /Android (\d+(?:\.\d+)?)/.exec(ua))) os = 'Android ' + m[1];
  else if ((m = /(?:iPhone|CPU) OS (\d+)_(\d+)/.exec(ua))) os = (/iPad/.test(ua) ? 'iPadOS ' : 'iOS ') + m[1] + '.' + m[2];
  else if ((m = /Mac OS X (\d+)[_.](\d+)/.exec(ua))) os = 'macOS ' + m[1] + '.' + m[2];
  else if ((m = /Windows NT (\d+\.\d+)/.exec(ua))) os = 'Windows ' + (m[1] === '10.0' ? '10/11' : m[1]);
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  let browser = '';
  for (const [re, name] of [['YaBrowser', 'Яндекс Браузер'], ['SamsungBrowser', 'Samsung Internet'], ['OPR', 'Opera'], ['EdgA?', 'Edge'], ['Firefox|FxiOS', 'Firefox'], ['CriOS|Chrome', 'Chrome']]) {
    if ((m = new RegExp('(?:' + re + ')/(\\d+)').exec(ua))) { browser = name + ' ' + m[1]; break; }
  }
  if (!browser && (m = /Version\/(\d+(?:\.\d+)?).*Safari/.exec(ua))) browser = 'Safari ' + m[1];
  m = /Android [^;)]*; ([^;)]+?)(?: Build\/[^;)]*)?\)/.exec(ua);
  return {os, browser, model:m && m[1].trim() !== 'K' ? m[1].trim() : ''};
}
function perfGpu() {
  const out = {webgl2:false, renderer:''};
  try {
    const c = document.createElement('canvas');
    let gl = c.getContext('webgl2'); out.webgl2 = !!gl; if (!gl) gl = c.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      out.renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
      const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    }
  } catch (e) {}
  return out;
}
let perfDev = null;
function perfDevice() {
  if (perfDev) return perfDev;
  const n = navigator, ua = perfUa(n.userAgent);
  perfDev = {...ua, cores:n.hardwareConcurrency || null, memory:n.deviceMemory || null, dpr:window.devicePixelRatio || 1,
    screen:[screen.width, screen.height], gpu:perfGpu(), reduced:typeof reduceMotion !== 'undefined' && !!reduceMotion,
    version:window.PODHOD_VERSION || '', build:window.PODHOD_BUILD || ''};
  /* Chrome на Android прячет в userAgent модель и версию системы («Android 10; K») — точные даёт userAgentData */
  try {
    n.userAgentData?.getHighEntropyValues?.(['model', 'platformVersion']).then(v => {
      if (v.model) perfDev.model = v.model;
      if (v.platform === 'Android' && v.platformVersion) perfDev.os = 'Android ' + v.platformVersion.split('.')[0];
    }, () => {});
  } catch (e) {}
  return perfDev;
}
function perfDeviceLines(d) {
  const sys = [d.os, d.browser, d.model].filter(Boolean).join(' · ');
  const hw = [d.cores ? d.cores + ' ' + plural(d.cores, 'ядро', 'ядра', 'ядер') : '', d.memory ? perfSay('memory', {n:String(d.memory).replace('.', typeof DEC === 'string' ? DEC : ',')}) : '',
    `${PERF_T.screenSize} ${d.screen[0]}×${d.screen[1]} ×${perfNum(d.dpr)}`, d.viewport ? `${PERF_T.windowSize} ${d.viewport[0]}×${d.viewport[1]}` : '', d.reduced ? PERF_T.reduced : ''].filter(Boolean).join(', ');
  return [`${PERF_T.device}: ${[sys, hw].filter(Boolean).join('; ')}`, `${PERF_T.gpu}: ${d.gpu.renderer || '—'} · ${d.gpu.webgl2 ? PERF_T.webgl2 : PERF_T.noWebgl2}`];
}

/* ---------- текст результата: устройство и таблица шагов (копировать, поделиться) ---------- */
const perfViewName = v => PERF_T[v] || '—';
function perfStepLine(s, i) {
  const head = `${i + 1}. ${s.label}`;
  if (s.skip) return `${head}: ${PERF_T.skipped} — ${s.skip}`;
  if (s.error) return `${head}: ${PERF_T.error} — ${s.error}`;
  const u = s.sum, p = u.parts, out = [];
  if (s.open != null) out.push(perfSay('open', {n:Math.round(s.open)}) + (s.wait > 100 ? ', ' + perfSay('wait', {n:Math.round(s.wait)}) : ''));
  out.push(`${PERF_T.screen.toLowerCase()} ${perfNum(u.fps)} ${PERF_T.fps}` + (u.figFps ? `, ${PERF_T.figure} ${perfNum(u.figFps)} ${PERF_T.fps}` : ''));
  out.push(`${PERF_T.frame} ${perfPair(u.cost)}`);
  if (p.card) {
    const n = k => `${u.counts[k]} ${plural(u.counts[k], 'кадр', 'кадра', 'кадров')}`;
    out.push(`SVG ${PERF_T.anew} ${perfPair(p.svgMiss)} (${n('svgMiss')}), ${PERF_T.fromMemory} ${perfPair(p.svgHit)} (${n('svgHit')}), DOM ${perfPair(p.svgDom)}`);
  }
  if (p.anat) out.push(`${PERF_T.anatCard} ${perfPair(p.anat)} (${PERF_T.copyPart} ${perfPair(p.copy)})`);
  if (p.thumb) out.push(`${PERF_T.thumbs} ${perfPair(p.thumb)} (${u.counts.thumb} ${plural(u.counts.thumb, 'задача', 'задачи', 'задач')})` + (s.anatAt != null ? ', ' + perfSay('thumbAnat', {n:Math.round(s.anatAt)}) : ''));
  if (p.volume) {
    out.push([['pose', 'pose'], ['skin', 'skin'], ['bones', 'bones'], ['muscles', 'muscles'], ['sceneRest', 'scene'], ['render', 'render'], ['volume', 'total']]
      .filter(([k]) => p[k] || k === 'volume').map(([k, t]) => `${PERF_T[t]} ${perfPair(p[k])}`).join('; '));
    /* «облегчённое» — свойство фигур разбора и тренировки; у карточек его нет */
    if (s.kind !== 'plan') out.push(s.q1 === 'low' ? (s.q0 === 'low' ? PERF_T.qLow : PERF_T.qSwitch) : PERF_T.qNormal);
  }
  if (s.pace) out.push(perfPaceText(s.pace));
  if (s.hidden) out.push(PERF_T.hidden);
  return `${head}: ${out.join('; ')}`;
}
/* ступень скорости «Анатомии» (карточки, тренировка): {fps, median, slow} → «ступень 30 к/с, медиана 9,8 мс» или откат */
function perfPaceText(pc) {
  const ms = perfNum(pc.median);
  return pc.slow ? perfSay('paceSlow', {ms}) : perfSay('pace', {fps:pc.fps, ms});
}
function perfReportText(r) {
  const d = r.device, at = r.date instanceof Date ? r.date : new Date(r.date), two = v => String(v).padStart(2, '0');
  const when = `${two(at.getDate())}.${two(at.getMonth() + 1)}.${at.getFullYear()}, ${two(at.getHours())}:${two(at.getMinutes())}`;
  const lines = [`Lazy Gym Planner ${d.version || ''} (${PERF_T.build} ${d.build || '—'}) — ${PERF_T.head}, ${when}`, ...perfDeviceLines(d), PERF_T.legend];
  r.steps.forEach((s, i) => lines.push(perfStepLine(s, i)));
  const lowAt = r.steps.findIndex(s => s.q1 === 'low');
  lines.push(lowAt < 0 ? PERF_T.lowNever : r.steps[lowAt].q0 === 'low' ? PERF_T.lowBefore : perfSay('lowAt', {i:lowAt + 1}));
  if (r.steps.some(s => s.pace)) { const slowAt = r.steps.findIndex(s => s.pace?.slow); lines.push(slowAt < 0 ? PERF_T.slowNever : perfSay('slowAt', {i:slowAt + 1})); }
  if (r.aborted) lines.push(PERF_T.abortedLine);
  return lines.join('\n');
}

/* ---------- включение: одна проверка при запуске ---------- */
function perfQuery() {
  let s = '';
  try { s = location.search || ''; } catch (e) {}
  /* во Floot приложение — в iframe srcdoc того же источника: адрес с ?perf — у страницы-хозяина */
  if (!s) try { if (window.parent && window.parent !== window) s = window.parent.location.search || ''; } catch (e) {}
  return s;
}
function perfFlag(search) {
  const m = /[?&]perf(?:=([^&#]*))?(?=[&#]|$)/.exec(search || '');
  return m ? (m[1] === '0' || m[1] === 'off' ? 'off' : 'on') : null;
}

/* ---------- замер: крючки, свой цикл кадров ---------- */
function perfStart() {
  if (globalThis.GymPerf) return globalThis.GymPerf;
  const P = {t0:performance.now(), bucket:null, frames:[], rec:null, seen:new WeakSet(), busy:{}, creating:false, low:null, raf:0, timer:0, run:null, result:null};
  const B = () => P.bucket || (P.bucket = {});
  P.add = (kind, ms) => { if (!P.creating) { const b = B(); b[kind] = (b[kind] || 0) + ms; } };
  /* 07-rigs-core.js: p0 — до расчёта кадра, p1 — после, F — кадр (тот же объект — значит, из памяти кадров) */
  P.svg = (p0, p1, F) => {
    const now = performance.now(), b = B(), hit = P.seen.has(F);
    if (!hit) P.seen.add(F);
    if (hit) { b.svgHit = (b.svgHit || 0) + p1 - p0; b.nHit = (b.nHit || 0) + 1; } else { b.svgMiss = (b.svgMiss || 0) + p1 - p0; b.nMiss = (b.nMiss || 0) + 1; }
    b.svgDom = (b.svgDom || 0) + now - p1;
  };
  /* src/volume/main.mjs: вызовы новой фигуры — через обёртки. Создание фигуры (рамка по 13 положениям, первые кадры)
     — не кадр анимации: до конца текущей задачи замеры не пишутся. */
  P.volume = ({scene, renderer, options, low, card}) => {
    if (!card) P.low = low; P.creating = true; Promise.resolve().then(() => { P.creating = false; });
    perfWrap(options, 'data', 'pose'); perfWrap(scene, 'apply', 'scene'); perfWrap(scene.mannequin, 'apply', 'skin');
    perfWrap(scene.skeleton, 'update', 'bones'); perfWrap(scene.muscleLayer, 'update', 'muscles'); perfWrap(renderer, 'render', 'render');
    perfWrap(window.Skeleton, 'frames', 'bones');
  };
  /* src/volume/main.mjs, общий рендерер карточек: весь кадр карточки в «Анатомии» и копия в её холст (кадр со сборкой
     сцены — не кадр анимации: как у фигур, до конца задачи не пишется) */
  P.card = (total, copy) => { if (P.creating) return; const b = B(); b.anat = (b.anat || 0) + total; b.copy = (b.copy || 0) + copy; b.nAnat = (b.nAnat || 0) + 1; };
  /* 13e-gallery-anatomy.js: задача миниатюры витрины (сборка сцены или кадр), мс — сборка тоже в счёт: это работа миниатюры */
  P.thumb = ms => { const b = B(); (b.thumbs || (b.thumbs = [])).push(ms); };
  /* первая задача после отрисовки кадра: сообщение самому себе с номером кадра (без MessageChannel — таймер) */
  const pending = new Map(); let seq = 0;
  const done = id => { const f = pending.get(id); if (f) { pending.delete(id); f.cost = performance.now() - f.t; } };
  let post = id => setTimeout(() => done(id), 0);
  if (typeof MessageChannel === 'function') { const ch = new MessageChannel(); ch.port1.onmessage = e => done(e.data); post = id => ch.port2.postMessage(id); }
  const tick = now => {
    P.raf = requestAnimationFrame(tick);
    const f = {t:now, b:P.bucket, cost:null}; P.bucket = null;
    P.frames.push(f); while (P.frames.length && P.frames[0].t < now - PERF_LIVE_MS - 500) P.frames.shift();
    if (P.rec) P.rec.push(f);
    if (pending.size > 600) pending.clear();
    pending.set(++seq, f); post(seq);
  };
  P.raf = requestAnimationFrame(tick);
  globalThis.GymPerf = P;
  perfMount(P);
  return P;
}
/* обёртка вызова: время пишется в свой вид замера; вложенный вызов того же вида (рамки костей внутри слоя костей)
   не считается дважды. Выключенная панель — обёртка просто передаёт вызов. */
function perfWrap(obj, name, kind) {
  const orig = obj && obj[name];
  if (typeof orig !== 'function' || orig.perfOrig) return;
  const wrapped = function (...args) {
    const P = globalThis.GymPerf;
    if (!P || P.busy[kind]) return orig.apply(this, args);
    P.busy[kind] = 1; const t = performance.now();
    try { return orig.apply(this, args); } finally { P.busy[kind] = 0; P.add(kind, performance.now() - t); }
  };
  wrapped.perfOrig = orig; obj[name] = wrapped;
}
function perfStop() {
  const P = globalThis.GymPerf; if (!P) return;
  if (P.run) P.run.abort = true;
  cancelAnimationFrame(P.raf); clearInterval(P.timer); P.observer?.disconnect(); P.el?.remove();
  /* рамки костей — общая функция: вернуть как была; обёртки фигур уйдут вместе с фигурами */
  const sk = window.Skeleton; if (sk?.frames?.perfOrig) sk.frames = sk.frames.perfOrig;
  try { localStorage.removeItem(PERF_KEY); } catch (e) {}
  try { const u = new URL(location.href); if (u.searchParams.has('perf')) { u.searchParams.delete('perf'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } } catch (e) {}
  globalThis.GymPerf = null;
}
function perfQuality(P = globalThis.GymPerf) {
  if (P?.low) return P.low() ? 'low' : 'normal';
  return document.querySelector('.volume-figure[data-quality="low"]') ? 'low' : document.querySelector('.volume-figure[data-renderer="webgl"]') ? 'normal' : null;
}
/* вид показанной фигуры — по её разметке: объём пишет data-anatomy / data-skeleton */
function perfViewOf(root) {
  if (!root) return null;
  if (root.dataset?.renderer !== 'webgl') return 'svg';
  return root.dataset.anatomy === 'on' ? 'anatomy' : root.dataset.skeleton === 'on' ? 'skeleton' : 'mannequin';
}
/* ступень скорости «Анатомии» сейчас: карточки плана (cardAnatomy) или экран тренировки (workoutFigure); null — не в «Анатомии» */
function perfPaceOf(place) {
  const src = place === 'workout' ? (typeof workoutFigure !== 'undefined' ? workoutFigure : null) : place === 'plan' ? (typeof cardAnatomy !== 'undefined' ? cardAnatomy : null) : null;
  if (!src || (src.view === 'mannequin' && !src.slow)) return null;
  return {fps:src.pace.fps, median:src.pace.last ?? null, slow:!!src.slow};
}
function perfWhere() {
  if ($('#motion-view')?.open) {
    if (typeof detailMotion !== 'undefined' && detailMotion) return {place:'detail', view:perfViewOf($('#mv-stage')?.firstElementChild)};
    /* витрина: миниатюры в «Анатомии» («Скелете») или SVG; сколько у экрана уже готово */
    const g = typeof galleryAnatStats === 'function' ? galleryAnatStats() : null;
    return {place:'gallery', view:g && g.view !== 'mannequin' ? g.view : 'svg', thumbs:g};
  }
  if ($('#workout-view')?.open) return {place:'workout', view:perfViewOf($('#wv-stage')?.firstElementChild), pace:perfPaceOf('workout')};
  /* карточки плана: «Анатомия» или «Скелет» — кадры общего рендерера, иначе (выбран манекен, откат, нет WebGL) — SVG */
  const v = typeof cardAnatomy !== 'undefined' ? cardAnatomy.view : 'mannequin';
  return {place:'plan', view:v === 'mannequin' ? 'svg' : v, pace:perfPaceOf('plan')};
}

/* ---------- панель ---------- */
function perfMount(P) {
  const el = document.createElement('section');
  el.id = 'perf-panel'; el.className = 'perf'; el.setAttribute('aria-label', PERF_T.title);
  let state = 'open'; try { state = localStorage.getItem(PERF_KEY) === 'min' ? 'min' : 'open'; } catch (e) {}
  el.dataset.state = state;
  el.innerHTML = `<button type="button" class="perf-pill" data-perf="open" aria-expanded="false" aria-label="${PERF_T.expand}"><span class="perf-dot" aria-hidden="true"></span><b data-perf-pill>—</b> ${PERF_T.fps}</button>
<div class="perf-body">
 <div class="perf-head"><strong>${PERF_T.title}</strong><button type="button" class="perf-x" data-perf="min" aria-expanded="true" aria-label="${PERF_T.collapse}">▾</button></div>
 <dl class="perf-live" data-perf-live>
  <dt>${PERF_T.screen}</dt><dd data-perf-k="screen">—</dd>
  <dt>${PERF_T.cards}</dt><dd data-perf-k="cards">—</dd>
  <dt>${PERF_T.volume}</dt><dd data-perf-k="volume">—</dd>
  <dt>${PERF_T.view}</dt><dd data-perf-k="view">—</dd>
 </dl>
 <p class="perf-note" data-perf-livenote>${PERF_T.liveNote}</p>
 <div class="perf-run" data-perf-run hidden><p class="perf-run-title" role="status" data-perf-runtext></p><p class="perf-run-step" data-perf-runstep></p><progress max="1" value="0" data-perf-progress></progress><p class="perf-note">${PERF_T.runHint}</p></div>
 <div class="perf-result" data-perf-result hidden></div>
 <p class="perf-devinfo" id="perf-dev" data-perf-dev hidden></p>
 <div class="perf-actions"><button type="button" class="perf-go" data-perf="run">${PERF_T.run}</button><button type="button" data-perf="stop" hidden>${PERF_T.stop}</button><button type="button" data-perf="dev" aria-expanded="false" aria-controls="perf-dev">${PERF_T.device}</button><button type="button" data-perf="off">${PERF_T.off}</button></div>
</div>`;
  P.el = el;
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-perf]'); if (!b) return;
    const a = b.dataset.perf;
    if (a === 'open' || a === 'min') { el.dataset.state = a === 'open' ? 'open' : 'min'; try { localStorage.setItem(PERF_KEY, el.dataset.state); } catch (er) {} perfPaint(P); el.querySelector(a === 'open' ? '[data-perf="min"]' : '[data-perf="open"]')?.focus(); }
    else if (a === 'run') perfRun();
    else if (a === 'stop') { if (P.run) P.run.abort = true; }
    else if (a === 'off') perfStop();
    else if (a === 'copy') perfCopy(P);
    else if (a === 'share') { try { navigator.share({title:PERF_T.shareTitle, text:perfReportText(P.result)}).catch(() => {}); } catch (er) {} }
    else if (a === 'close') { P.result = null; perfPaint(P); }
    else if (a === 'dev') { const box = el.querySelector('[data-perf-dev]'), show = box.hidden; if (show) perfPaintDevice(P); box.hidden = !show; b.setAttribute('aria-expanded', String(show)); }
  });
  /* модальные окна (разбор, тренировка) делают остальную страницу инертной: панель переезжает в верхнее открытое окно */
  const stack = [...document.querySelectorAll('dialog[open]')];
  const place = () => { const host = stack[stack.length - 1] || document.body; if (el.parentNode !== host) host.append(el); };
  P.observer = new MutationObserver(list => {
    for (const m of list) { const d = m.target; if (d.tagName !== 'DIALOG') continue; const i = stack.indexOf(d); if (i >= 0) stack.splice(i, 1); if (d.open) stack.push(d); }
    place();
  });
  P.observer.observe(document.body, {subtree:true, attributes:true, attributeFilter:['open']});
  place();
  P.timer = setInterval(() => perfPaint(P), 500);
  perfPaint(P);
}
function perfPaintDevice(P) {
  const d = perfDevice(); d.viewport = [window.innerWidth, window.innerHeight];
  const box = P.el.querySelector('[data-perf-dev]'); box.textContent = perfDeviceLines(d).join('\n') + `\nLazy Gym Planner ${d.version} (${PERF_T.build} ${d.build || '—'})`;
}
const perfSet = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };
function perfPaint(P) {
  const el = P.el; if (!el) return;
  const now = performance.now(), win = Math.min(PERF_LIVE_MS, now - P.t0), sum = perfSummary(P.frames.filter(f => f.t >= now - win), win), p = sum.parts, open = el.dataset.state === 'open';
  perfSet(el.querySelector('[data-perf-pill]'), perfNum(sum.fps));
  el.querySelector('[data-perf="open"]').setAttribute('aria-expanded', String(open));
  if (!open) return;
  const where = perfWhere(), q = perfQuality(P), running = !!P.run;
  el.querySelector('[data-perf-live]').hidden = running || !!P.result; el.querySelector('[data-perf-livenote]').hidden = running || !!P.result;
  if (!running && !P.result) {
    const k = key => el.querySelector(`[data-perf-k="${key}"]`);
    perfSet(k('screen'), `${perfNum(sum.fps)} ${PERF_T.fps} · ${PERF_T.frame} ${perfPair(sum.cost)} ${PERF_T.ms}`);
    const th = where.thumbs;
    perfSet(k('cards'), th && th.view !== 'mannequin' ? `${PERF_T.thumbs}: ${PERF_T.thumbTask} ${perfPair(p.thumb)} ${PERF_T.ms} · ${perfSay('thumbReady', {n:th.ready, m:th.near})}` + (th.mode === 'visible' ? ` · ${PERF_T.thumbVisible}` : '')
      : p.anat ? `${PERF_T.anatCard} ${perfPair(p.anat)} · ${PERF_T.copyPart} ${perfPair(p.copy)} ${PERF_T.ms}`
      : p.card ? `${PERF_T.anew} ${perfPair(p.svgMiss)} · ${PERF_T.fromMemory} ${perfPair(p.svgHit)} · DOM ${perfPair(p.svgDom)} ${PERF_T.ms}` : PERF_T.noFrames);
    perfSet(k('volume'), p.volume ? `${PERF_T.total} ${perfPair(p.volume)} ${PERF_T.ms}, ${PERF_T.figure} ${perfNum(sum.figFps)} ${PERF_T.fps}\n${PERF_T.pose} ${perfPair(p.pose)} · ${PERF_T.skin} ${perfPair(p.skin)} · ${PERF_T.bones} ${perfPair(p.bones)} · ${PERF_T.muscles} ${perfPair(p.muscles)} · ${PERF_T.scene} ${perfPair(p.sceneRest)} · ${PERF_T.render} ${perfPair(p.render)}` : PERF_T.noFrames);
    const qv = where.place === 'plan' ? null : q;
    perfSet(k('view'), `${PERF_T[where.place]} — ${perfViewName(where.view)}` + (where.pace ? `; ${perfPaceText(where.pace)}` : '') + (qv ? `; ${qv === 'low' ? PERF_T.qLow : PERF_T.qNormal}` : ''));
  }
  const run = el.querySelector('[data-perf-run]'); run.hidden = !running;
  if (running) {
    perfSet(el.querySelector('[data-perf-runtext]'), perfSay('running', {i:P.run.i + 1, n:P.run.n}));
    perfSet(el.querySelector('[data-perf-runstep]'), P.run.label || '');
    el.querySelector('[data-perf-progress]').value = (P.run.i + Math.min(1, (now - P.run.t0) / P.run.ms)) / P.run.n;
  }
  el.querySelector('[data-perf="run"]').hidden = running; el.querySelector('[data-perf="stop"]').hidden = !running;
  const res = el.querySelector('[data-perf-result]'); res.hidden = !P.result || running;
  if (P.result && !running && res.dataset.for !== String(P.result.id)) { res.dataset.for = String(P.result.id); res.innerHTML = perfResultHtml(P.result); }
}
function perfResultHtml(r) {
  if (r.notice) return `<p class="perf-warn">${r.notice}</p><div class="perf-actions"><button type="button" data-perf="close">${PERF_T.close}</button></div>`;
  const rows = r.steps.map((s, i) => {
    const u = s.sum, fig = u && (u.parts.thumb || u.parts.anat || u.parts.volume || u.parts.card);
    const tag = (s.q1 === 'low' && s.kind !== 'plan' ? ` <span class="perf-low">${PERF_T.low}</span>` : '') + (s.pace?.slow ? ` <span class="perf-low">${PERF_T.paceTag}</span>` : '');
    return s.skip || s.error ? `<tr><th scope="row">${i + 1}. ${esc(s.label)}</th><td colspan="3">${esc(s.skip || s.error)}</td></tr>`
      : `<tr><th scope="row">${i + 1}. ${esc(s.label)}${tag}</th><td>${perfNum(u.fps)}${u.figFps ? '<small>' + perfNum(u.figFps) + '</small>' : ''}</td><td>${perfPair(u.cost)}</td><td>${perfPair(fig)}</td></tr>`;
  }).join('');
  return `${r.aborted ? `<p class="perf-warn">${PERF_T.stopped}</p>` : ''}<table class="perf-table"><thead><tr><th scope="col">${PERF_T.step}</th><th scope="col">${PERF_T.fps}</th><th scope="col">${PERF_T.frameCol}</th><th scope="col">${PERF_T.fig}</th></tr></thead><tbody>${rows}</tbody></table>
<p class="perf-note">${PERF_T.resultNote}</p>
<div class="perf-actions"><button type="button" class="perf-go" data-perf="copy">${PERF_T.copy}</button>${typeof navigator.share === 'function' ? `<button type="button" data-perf="share">${PERF_T.share}</button>` : ''}<button type="button" data-perf="close">${PERF_T.close}</button></div>
<p class="perf-msg" data-perf-msg role="status"></p>`;
}
function perfCopy(P) {
  const text = perfReportText(P.result), msg = P.el.querySelector('[data-perf-msg]');
  const fallback = () => {
    msg.textContent = PERF_T.copyFail;
    const ta = document.createElement('textarea'); ta.readOnly = true; ta.rows = 8; ta.value = text; msg.append(ta); ta.focus(); ta.select();
  };
  try { navigator.clipboard.writeText(text).then(() => { msg.textContent = PERF_T.copied; }, fallback); } catch (e) { fallback(); }
}

/* ---------- сценарий «Замерить» ----------
   1–2 — план: активная карточка 10 с в «Анатомии» (общий рендерер карточек собирается заново, ступень — с 30 кадров,
   прежний откат забыт; первый круг — матрицы костей считаются, дальше — из памяти) и в «Манекене» (SVG, память кадров
   сброшена так же); 3–8 — разбор latpulluh (верхний блок), legpress (тренажёр жима ногами), squat (штанга): по 8 с
   в «Анатомии» и в «Манекене», ракурс по умолчанию, один вид; 9–10 — экран тренировки 8 с в «Анатомии» и в «Манекене»
   (если не идёт отдых); 11 — витрина атласа в «Анатомии»: открыть с пустой памятью миниатюр (кеш между сеансами на время
   шага не читается и не стирается), дождаться анатомии у всех видимых миниатюр (не дольше двух третей шага), дальше
   листать витрину вниз до конца шага. Перед каждым шагом — 1 с прогрева (сборка шейдеров, рамка кадра). У шагов
   «Анатомии» карточек и тренировки в итоге — ступень (30, 15, 10 кадров в секунду или откат на манекен) и медиана, по
   которой она выбрана; у витрины — задачи миниатюр и время до анатомии у всех видимых.
   Вид фигуры на время шага меняется без записи; выбор человека возвращается в конце. Длительности для проверок —
   perfRun({plan, step, warm}). */
const PERF_STEPS = [{kind:'plan', view:'anatomy'}, {kind:'plan', view:'mannequin'},
  ...['latpulluh', 'legpress', 'squat'].flatMap(id => [{kind:'detail', id, view:'anatomy'}, {kind:'detail', id, view:'mannequin'}]),
  {kind:'workout', view:'anatomy'}, {kind:'workout', view:'mannequin'}, {kind:'gallery', view:'anatomy'}];
const PERF_ABORT = {abort:true}, PERF_RESTORE_KEYS = ['podhod.motion.v2', 'podhod.workout.v3', 'podhod.settings.v1', 'podhod.planSeen.v1'];
let perfRunSerial = 0;
async function perfWait(ms, run) {
  const end = performance.now() + ms;
  while (performance.now() < end) { if (run.abort) throw PERF_ABORT; await new Promise(r => setTimeout(r, Math.max(0, Math.min(100, end - performance.now())))); }
  if (run.abort) throw PERF_ABORT;
}
async function perfUntil(test, ms, run) {
  const end = performance.now() + ms;
  for (;;) { let ok = false; try { ok = !!test(); } catch (e) {} if (ok) return true; if (run.abort) throw PERF_ABORT; if (performance.now() >= end) return false; await new Promise(r => setTimeout(r, 50)); }
}
async function perfMeasure(P, run, ms) {
  let hidden = document.hidden; const vis = () => { if (document.hidden) hidden = true; };
  document.addEventListener('visibilitychange', vis);
  P.rec = []; P.bucket = null; /* работа до начала окна (кадры могли задержаться) — не в счёт */
  const t0 = performance.now();
  try { await perfWait(ms, run); } finally { document.removeEventListener('visibilitychange', vis); }
  const frames = P.rec, span = performance.now() - t0; P.rec = null;
  await new Promise(r => setTimeout(r, 60)); /* последние кадры дописывают своё время */
  return {sum:perfSummary(frames, span), hidden};
}
async function perfStepRun(P, run, step, T, ctx) {
  const q0 = perfQuality(P), out = {kind:step.kind, q0};
  const finish = m => Object.assign(out, m, {q1:perfQuality(P)});
  if (step.kind === 'plan') {
    out.label = `${PERF_T.plan}: ${PERF_T.card}`;
    if ($('#motion-view')?.open) closeMotion();
    if (S.view !== 'plan') { ctx.view = S.view; S.view = 'plan'; renderSetup(); renderPlan(); }
    const F = figs.find(x => x.card);
    if (!F) return Object.assign(out, {skip:PERF_T.noCards});
    out.id = F.it.ex.id; run.label = out.label + ` «${F.it.name}»`;
    if (!ctx.card || ctx.card.F !== F) ctx.card = {F, paused:F.paused, pick:F.pick};
    /* вид карточек — на время шага; «Анатомия» — новая попытка с холодной памятью (как первое открытие плана) */
    const anat = step.view !== 'mannequin';
    motionPrefs.view = step.view;
    if (anat) { retryAnatomyPace(); cardStage()?.dispose(); }
    applyCardsView();
    F.btn.scrollIntoView({block:'center'}); F.paused = false; F.pick = performance.now();
    figureFramesReset(); pickActiveCards();
    await perfUntil(() => F.f && F.active, 3000, run);
    if (anat) await perfUntil(() => F.av?.on || cardAnatomy.view === 'mannequin' && !cardAnatomy.loading, 10000, run);
    out.view = cardAnatomy.view === 'mannequin' ? 'svg' : cardAnatomy.view;
    /* подпись — то, что показано: «Анатомия» («Скелет») или манекен (SVG-карточки); «Анатомия» без объёма — манекен с пометкой */
    out.label += ` «${F.it.name}» — ${perfViewName(out.view === 'svg' ? 'mannequin' : out.view)}` + (anat && out.view === 'svg' ? ` (${PERF_T.noVolume})` : '');
    run.label = out.label;
    await perfWait(T.warm / 2, run);
    finish(await perfMeasure(P, run, T.plan));
    if (anat && out.view !== 'svg') out.pace = perfPaceOf('plan') || {fps:cardAnatomy.pace.fps, median:cardAnatomy.pace.last ?? null, slow:!!cardAnatomy.slow};
    return out;
  }
  if (step.kind === 'detail') {
    const it = previewItem(step.id);
    out.label = `${PERF_T.detail}: ${it.name} — ${perfViewName(step.view)}`; out.id = step.id; run.label = out.label;
    await perfUntil(() => window.GymVolume, 6000, run);
    motionPrefs.view = step.view;
    const t0 = performance.now();
    if (!$('#motion-view').open || !detailMotion) openMotionItem(it);
    else if (detailMotion.it.ex.id !== step.id) selectMotion(it);
    else applyFigureView();
    out.open = performance.now() - t0;
    const root = () => $('#mv-stage')?.firstElementChild;
    if (window.GymVolume && step.view !== 'mannequin') await perfUntil(() => root()?.dataset.anatomy === 'on' || root()?.dataset.renderer !== 'webgl', 10000, run);
    out.wait = performance.now() - t0 - out.open; out.view = perfViewOf(root());
    if (out.view === 'svg') out.label += ` (${PERF_T.noVolume})`;
    if (detailMotion) detailMotion.paused = false;
    await perfWait(T.warm, run);
    return finish(await perfMeasure(P, run, T.step));
  }
  if (step.kind === 'gallery') return perfGalleryStep(P, run, step, T, out, finish);
  /* тренировка: открыть без записи в журнал; сохранённое состояние тренировки вернётся из снимка. Вид фигуры — на время
     шага; каждое открытие тренировки — новая попытка «Анатомии» (ступень с 30 кадров) */
  out.label = PERF_T.workout; run.label = out.label;
  const anat = step.view !== 'mannequin';
  if ($('#motion-view')?.open) closeMotion();
  if (!plan?.items?.length) return Object.assign(out, {skip:PERF_T.noPlan});
  let saved = null; try { saved = JSON.parse(localStorage.getItem(WORKOUT_STORE) || 'null'); } catch (e) {}
  /* отдых в плане или незаконченный отдых сегодняшней тренировки: открытие тренировки включило бы его сигнал */
  if (!$('#timer').hidden || (saved && saved.stamp === workoutStamp(workoutQueue(plan)) && Number(saved.restUntil) > 0 && saved.next >= 0)) return Object.assign(out, {skip:PERF_T.restOn});
  motionPrefs.view = step.view;
  const t0 = performance.now();
  startWorkout(); ctx.workout = true;
  if ($('#wv-active').hidden) workoutShow(workout.index || 0);
  out.open = performance.now() - t0;
  const root = () => $('#wv-stage')?.firstElementChild;
  await perfUntil(() => root(), 3000, run);
  /* «Анатомия»: кости и мышцы могут ещё грузиться — подпись шага по тому, что в итоге показано */
  if (anat) await perfUntil(() => root()?.dataset.anatomy === 'on' || root()?.dataset.skeleton === 'on' || root()?.dataset.renderer !== 'webgl' || workoutFigure.failed, 10000, run);
  out.wait = performance.now() - t0 - out.open;
  const F = workout.motion; out.view = perfViewOf(root()); out.id = F?.it.ex.id;
  out.label = `${PERF_T.workout}: ${F ? F.it.name : '—'} — ${perfViewName(out.view)}` + (anat && out.view === 'svg' ? ` (${PERF_T.noVolume})` : ''); run.label = out.label;
  if (F) F.paused = false;
  await perfWait(T.warm, run);
  const m = await perfMeasure(P, run, T.step);
  finish(m);
  if (anat && (out.view === 'anatomy' || out.view === 'skeleton')) out.pace = {fps:workoutFigure.pace.fps, median:workoutFigure.pace.last ?? null, slow:!!workoutFigure.slow};
  closeWorkout(); ctx.workout = false;
  return out;
}
/* витрина атласа: первые миниатюры, анатомия у всех видимых (заново, без памяти и кеша), прокрутка вниз */
async function perfGalleryStep(P, run, step, T, out, finish) {
  out.label = `${PERF_T.gallery}: ${PERF_T.galleryStep} — ${perfViewName(step.view)}`; run.label = out.label;
  if ($('#motion-view')?.open) closeMotion();
  await perfUntil(() => window.GymVolume, 6000, run);
  motionPrefs.view = step.view;
  galleryAnatForget(); galleryAnat.noStore = true;
  const box = $('#motion-view');
  let scrolling = false, done = false;
  try {
    const t0 = performance.now(); openGallery();
    await perfUntil(() => document.querySelector('#mv-gallery .mv-thumb.ready'), 5000, run); out.open = performance.now() - t0;
    out.view = galleryAnat.view === 'mannequin' ? 'svg' : galleryAnat.view;
    if (out.view === 'svg') out.label = `${PERF_T.gallery}: ${PERF_T.galleryStep} — ${perfViewName('mannequin')}` + (step.view !== 'mannequin' ? ` (${PERF_T.noVolume})` : '');
    run.label = out.label;
    const visDone = () => { const g = galleryAnatStats(); return g.vis > 0 && g.visReady >= g.vis; };
    const measure = perfMeasure(P, run, T.step);
    perfUntil(() => visDone() || performance.now() - t0 > T.step * 2 / 3, T.step, run).then(() => {
      if (done) return;
      if (visDone()) out.anatAt = performance.now() - t0;
      scrolling = true; const down = () => { if (!scrolling) return; box.scrollBy(0, 18); requestAnimationFrame(down); }; requestAnimationFrame(down);
    }, () => {});
    finish(await measure);
  } finally { done = true; scrolling = false; galleryAnat.noStore = false; if ($('#motion-view')?.open) closeMotion(); }
  return out;
}
async function perfRun(opts = {}) {
  const P = globalThis.GymPerf; if (!P || P.run) return null;
  const T = {plan:10000, step:8000, warm:1000, ...opts};
  if ($('#workout-view')?.open) { P.result = {id:++perfRunSerial, notice:PERF_T.closeWorkout}; P.el.dataset.state = 'open'; perfPaint(P); return null; }
  /* что вернуть после замера: выбор вида, ракурсов и одного/двух видов, раздел, прокрутку, записи хранилища */
  const store = {}; for (const k of PERF_RESTORE_KEYS) try { store[k] = localStorage.getItem(k); } catch (e) {}
  const prefs = {}; for (const k of ['view', 'dual', 'views']) prefs[k] = [k in motionPrefs, motionPrefs[k]];
  const ctx = {store, prefs, scroll:window.scrollY, view:null, card:null, workout:false};
  const steps = PERF_STEPS;
  const run = P.run = {i:0, n:steps.length, abort:false, label:'', t0:performance.now(), ms:1};
  P.result = null; P.el.dataset.state = 'open'; perfPaint(P);
  /* экран не гаснет до конца замера (телефон часто блокируется через 30 с); просьба — сразу, пока идёт нажатие */
  let wake = null;
  try { navigator.wakeLock?.request('screen').then(l => { if (P.run === run) wake = l; else l.release().catch(() => {}); }, () => {}); } catch (e) {}
  const results = [];
  motionPrefs.dual = false; motionPrefs.views = {};
  try {
    for (let i = 0; i < steps.length; i++) {
      run.i = i; run.t0 = performance.now(); run.ms = (steps[i].kind === 'plan' ? T.plan + T.warm / 2 : T.step + T.warm) + 500; perfPaint(P);
      try { results.push(await perfStepRun(P, run, steps[i], T, ctx)); }
      catch (e) { if (e === PERF_ABORT) throw e; results.push({kind:steps[i].kind, label:run.label || steps[i].kind, error:String(e && e.message || e)}); }
    }
  } catch (e) { if (e !== PERF_ABORT) throw e; }
  finally {
    P.rec = null;
    try { if (ctx.workout || $('#workout-view')?.open) closeWorkout(); } catch (e) {}
    try { if ($('#motion-view')?.open) closeMotion(); } catch (e) {}
    for (const [k, [had, v]] of Object.entries(prefs)) { if (had) motionPrefs[k] = v; else delete motionPrefs[k]; }
    if (ctx.card) { ctx.card.F.paused = ctx.card.paused; ctx.card.F.pick = ctx.card.pick; try { pickActiveCards(); } catch (e) {} }
    /* карточки — снова в виде, выбранном человеком */
    try { if (typeof applyCardsView === 'function' && figs.some(F => F.card)) applyCardsView(); } catch (e) {}
    if (ctx.view) { S.view = ctx.view; renderSetup(); renderPlan(); }
    for (const [k, v] of Object.entries(store)) try { if (localStorage.getItem(k) !== v) { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } } catch (e) {}
    window.scrollTo(0, ctx.scroll);
    const d = perfDevice(); d.viewport = [window.innerWidth, window.innerHeight];
    P.result = {id:++perfRunSerial, date:new Date(), device:d, steps:results, aborted:run.abort};
    P.run = null; perfPaint(P);
    try { wake?.release().catch(() => {}); } catch (e) {}
  }
  return P.result;
}

/* включение — последним: к этому месту объявлено всё, что нужно панели */
(() => {
  /* флаг крючков есть всегда (null — выключено): чтение существующего глобального свойства — ≈4 нс,
     а отсутствующего у window — ≈110 нс (поиск по именованным элементам страницы) */
  if (!('GymPerf' in globalThis)) globalThis.GymPerf = null;
  let on = false;
  try {
    const flag = perfFlag(perfQuery());
    if (flag === 'off') localStorage.removeItem(PERF_KEY);
    else if (flag === 'on' && !localStorage.getItem(PERF_KEY)) localStorage.setItem(PERF_KEY, 'open');
    on = !!localStorage.getItem(PERF_KEY);
  } catch (e) {}
  /* ошибка панели не должна останавливать запуск приложения */
  if (on && typeof document !== 'undefined' && document.body && typeof requestAnimationFrame === 'function') try { perfStart(); } catch (e) { console.error('Замер скорости', e); }
})();
