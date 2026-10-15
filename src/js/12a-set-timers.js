/* ---------- таймеры подхода: чистые расчёты ----------
   Отдых и удержания (планка, вис, «стульчик», «лодочка») считаются только по меткам времени Date.now(), а не по числу
   «тиков»: в скрытой вкладке Chrome таймеры страницы срабатывают раз в секунду, через 5 минут — раз в минуту, и счёт по
   тикам отстал бы. Здесь нет страницы и звука — только фазы, числа на экране и моменты сигналов (проверки —
   tools/set-timers.test.js). Звук и вибрация — 12b-rest-alarm.js, экран тренировки — 14-workout-mode.js. */
/* every — повтор сигнала после нуля, с; repeats — не больше трёх повторов; warn — мягкий сигнал за 10 с до конца;
   grace — сигнал, опоздавший больше чем на 2 с (страница спала), уже не подаётся; maxActual — отдых длиннее 30 мин —
   перерыв, а не отдых: в журнал не пишется */
const REST_SIGNAL = {every:20, repeats:3, warn:10, grace:2, maxActual:1800};
/* удержание: отсчёт 3-2-1 перед стартом и пауза между сторонами (боковая планка), с */
const HOLD = {lead:3, pause:10};

function clockText(sec) { sec = Math.max(0, Math.floor(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }

/* отдых на момент now: до конца — обратный отсчёт (с округлением вверх: «0:01» до самого нуля), после — сколько сверх */
function restView(end, now) {
  const ms = end - now;
  if (ms > 0) { const left = Math.ceil(ms / 1000); return {over:false, left, extra:0, text:clockText(left)}; }
  const extra = Math.floor(-ms / 1000);
  return {over:true, left:0, extra, text:'+' + clockText(extra)};
}

/* моменты сигналов отдыха (мс): за 10 с до конца — мягкий (если включён и отдых длиннее 15 с), конец, затем в режиме
   «настойчиво» — повторы раз в 20 с, не больше трёх. from — начало отдыха. */
function restSignals(end, {mode = 'persist', warn = false, from = null} = {}) {
  const out = [];
  if (warn && (from == null || end - from > (REST_SIGNAL.warn + 5) * 1000)) out.push({at:end - REST_SIGNAL.warn * 1000, kind:'warn'});
  out.push({at:end, kind:'end'});
  if (mode !== 'once') for (let i = 1; i <= REST_SIGNAL.repeats; i++) out.push({at:end + i * REST_SIGNAL.every * 1000, kind:'repeat'});
  return out;
}
/* какие сигналы наступили к now и ещё не поданы (fired — отметки по номерам). Опоздавший больше чем на 2 с помечен late:
   его не повторяют — на экране и так видно «+0:40» */
function restDue(signals, fired, now) {
  const out = [];
  signals.forEach((s, i) => { if (!fired[i] && s.at <= now) out.push({i, kind:s.kind, late:now - s.at > REST_SIGNAL.grace * 1000}); });
  return out;
}
/* момент последнего сигнала отдыха (после него таймер в плане может уйти с экрана) */
function restLastAt(signals) { return signals.reduce((m, s) => Math.max(m, s.at), 0); }
/* ±15 с: во время отдыха сдвигает конец (не раньше «сейчас»); после нуля «+15» даёт ещё 15 с от текущего момента,
   «−15» ничего не меняет — отдых уже кончился */
function restAdjust(end, now, d) { return end > now ? Math.max(now, end + d * 1000) : d > 0 ? now + d * 1000 : end; }
/* фактический отдых, с: от записи подхода до перехода к следующему; меньше секунды или дольше 30 мин — не записывается */
function restActual(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to < from) return null;
  const s = Math.round((to - from) / 1000);
  return s >= 1 && s <= REST_SIGNAL.maxActual ? s : null;
}
/* третье поле записи подхода [кг, повторы, отдых]: целые секунды 1…1800, иначе поля нет */
function restField(v) { if (typeof v !== 'number' && (typeof v !== 'string' || !v.trim())) return null; const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= REST_SIGNAL.maxActual ? n : null; }

/* ---------- удержание ---------- */
function holdRange(text) { const m = String(text).match(/(\d+)\D+(\d+)/); if (m) return [+m[1], +m[2]]; const n = parseInt(text, 10); return [n || 0, n || 0]; }
/* Цель отсчёта, с. По плану — нижняя граница диапазона («30–45 с» → 30): ноль значит «подход засчитан», дальше счёт вверх
   ведёт к верхней границе, а не обрывает удержание раньше времени. Если журнал уже ведёт прогрессию (в прошлый раз 38 с —
   сегодня 39; все подходы на верхней границе — на 10 с дольше), цель — из подсказки журнала, но не выше верхней
   границы + 10 с. */
function holdTarget(reps, suggested) {
  const [lo, hi0] = holdRange(reps), lo1 = lo > 0 ? lo : 30, hi = Math.max(hi0, lo1), s = Math.round(Number(suggested));
  if (Number.isFinite(s) && s > lo1) return {sec:Math.min(s, hi + 10), lo:lo1, hi, from:'log'};
  return {sec:lo1, lo:lo1, hi, from:'plan'};
}
/* Таймер — только метки нажатий: t0 — «Старт», stops — «Стоп» каждой стороны, skip — «правая сейчас» (без паузы).
   Фазы: lead (3-2-1) → hold (до цели, затем сверх цели) → у двусторонних switch (пауза 10 с) → hold правой → done. */
function holdNew(t0, target, sides = 1) { return {t0, target, sides:sides === 2 ? 2 : 1, stops:[], skip:null}; }
function holdStartOf(h, side) { return side === 0 ? h.t0 + HOLD.lead * 1000 : h.stops.length ? (h.skip ?? h.stops[0] + HOLD.pause * 1000) : Infinity; }
function holdState(h, now) {
  const results = h.stops.map((t, i) => Math.max(0, Math.floor((t - holdStartOf(h, i)) / 1000)));
  if (h.stops.length >= h.sides) return {phase:'done', side:h.sides - 1, results, value:Math.min(...results)};
  const side = h.stops.length, start = holdStartOf(h, side);
  if (now < start) return {phase:side ? 'switch' : 'lead', side, count:Math.ceil((start - now) / 1000), results};
  const ms = now - start, reach = h.target * 1000, elapsed = Math.floor(ms / 1000);
  return ms < reach ? {phase:'hold', side, mode:'to', left:Math.ceil((reach - ms) / 1000), elapsed, results}
    : {phase:'hold', side, mode:'over', over:Math.floor((ms - reach) / 1000), elapsed, results};
}
/* главная кнопка: в отсчёте 3-2-1 — отмена; в удержании — «Стоп» стороны; в паузе между сторонами — правая сразу */
function holdPress(h, now) {
  const st = holdState(h, now);
  if (st.phase === 'lead') return {h:null, action:'cancel'};
  if (st.phase === 'switch') return {h:{...h, skip:now}, action:'skip'};
  if (st.phase === 'hold') { const n = {...h, stops:[...h.stops, now]}; return {h:n, action:n.stops.length >= n.sides ? 'done' : 'side'}; }
  return {h, action:'none'};
}
/* звуки таймера (мс): короткие 3-2-1, «пошли», цель достигнута — для каждой начатой стороны. «Стоп» раньше цели снимает
   её сигнал. Перед правой стороной — те же 3-2-1 в конце паузы (если правую не начали сразу). */
function holdCues(h) {
  const out = [], lead = (start, n) => { for (let k = n; k >= 1; k--) out.push({at:start - k * 1000, kind:'tick'}); out.push({at:start, kind:'go'}); };
  for (let side = 0; side < h.sides && side <= h.stops.length; side++) {
    const start = holdStartOf(h, side);
    if (side === 0) lead(start, HOLD.lead); else if (h.skip == null) lead(start, Math.min(3, HOLD.pause)); else out.push({at:start, kind:'go'});
    const reach = start + h.target * 1000;
    if (!(h.stops[side] < reach)) out.push({at:reach, kind:'end'});
  }
  return out;
}
/* число на таймере удержания: «23 с», с минуты — «1:05»; сверх цели — «+7 с» */
function holdText(sec, plus) { const t = sec < 60 ? `${sec} с` : clockText(sec); return plus ? '+' + t : t; }
