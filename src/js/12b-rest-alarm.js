/* ---------- сигнал в конце отдыха и звуки таймера удержания ----------
   Звук — Web Audio: тоны ставятся в очередь звуковой карты сразу при старте отдыха на моменты сигналов (restSignals в
   12a-set-timers.js). Таймеры страницы во «уснувшей» вкладке отстают, а запланированный звук всё равно прозвучит вовремя,
   пока браузер не остановил звук страницы. iPhone останавливает звуковую карту, когда приложение не на экране (или экран
   заблокирован), и её время стоит, — поэтому при возвращении на экран очередь ставится заново по часам (resync):
   прошедшие сигналы не догоняют, будущие звучат вовремя. Звуковую карту браузеры разрешают включить только по нажатию —
   поэтому unlock() вызывается из нажатий «Подход выполнен», «Начать тренировку», «Старт» таймера удержания.
   Сигнал «настойчиво» (по умолчанию): после нуля — повтор раз в 20 с, не больше трёх, пока не начат следующий подход;
   «один раз» — только на нуле. По желанию — короткий мягкий сигнал за 10 с до конца (по умолчанию выключен).
   Вибрация (Chrome на Android; Safari на iPhone её не умеет) и запасной звук, если очередь не была поставлена, — из шага
   таймера на экране (poll), тоже по меткам времени. Звук выключается кнопкой 🔔, выбор запоминается. */
const RestAlarm = (() => {
  const KEY = 'podhod.restSound', MODE_KEY = 'podhod.restSignal', WARN_KEY = 'podhod.restWarn';
  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let ctx = null, on = read(KEY) !== 'off', mode = read(MODE_KEY) === 'once' ? 'once' : 'persist', warn = read(WARN_KEY) === 'on';
  /* очереди звуков: отдых и таймер удержания снимаются независимо */
  const ch = {rest:[], hold:[]};
  let sig = [], fired = [], queued = [], end = 0, from = 0, cues = [];
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  function unlock() {
    if (!AC || !on) return;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended' || ctx.state === 'interrupted') ctx.resume();
    } catch (e) { ctx = null; }
  }
  /* голоса: конец отдыха и его повторы — два коротких двойных сигнала 880 и 1320 Гц; предупреждение — один мягкий тон;
     3-2-1 удержания — короткие щелчки, «пошли» — высокий тон; мягкое нарастание и спад без щелчков в динамике */
  const VOICE = {end:{gain:.32, len:.14, tones:[[0, 880], [.16, 1320], [.6, 880], [.76, 1320]]}, warn:{gain:.16, len:.24, tones:[[0, 660]]},
    tick:{gain:.24, len:.08, tones:[[0, 880]]}, go:{gain:.3, len:.22, tones:[[0, 1320]]}};
  VOICE.repeat = VOICE.end;
  function tone(list, at, kind) {
    const v = VOICE[kind] || VOICE.end;
    for (const [dt, f] of v.tones) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = at + dt;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v.gain, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + v.len);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + v.len + .02); list.push(o);
    }
  }
  const ready = () => on && !!ctx && ctx.state !== 'closed';
  function silence(c) { for (const n of ch[c]) { try { n.stop(); } catch (e) {} } ch[c] = []; }
  /* поставить звук в очередь на момент at (время Date.now()); прошедшее не ставится */
  function queue(c, at, kind) {
    if (!ready()) return false;
    const dt = (at - Date.now()) / 1000;
    if (dt < -.05) return false;
    try { tone(ch[c], ctx.currentTime + Math.max(0, dt), kind); return true; } catch (e) { return false; }
  }
  function queueRest() { silence('rest'); queued = sig.map((s, i) => !fired[i] && queue('rest', s.at, s.kind)); }
  /* отдых до endMs (время Date.now()); from — начало отдыха. Повторный вызов переносит сигналы (±15 с). */
  function arm(endMs, opts = {}) {
    cancel();
    if (!(endMs > 0)) return;
    const now = Date.now();
    end = endMs; from = opts.from || now;
    sig = restSignals(end, {mode, warn, from});
    fired = sig.map(s => s.at <= now); /* прошедшие (например, при возврате к тренировке после нуля) не подаются */
    queueRest();
  }
  function cancel() { silence('rest'); sig = []; fired = []; queued = []; end = 0; from = 0; }
  function buzz(kind) {
    if (typeof navigator === 'undefined' || !navigator.vibrate || (typeof document !== 'undefined' && document.hidden)) return;
    try { navigator.vibrate(kind === 'warn' ? 90 : kind === 'tick' ? 40 : kind === 'go' ? 120 : [220, 120, 220]); } catch (e) {}
  }
  /* шаг таймера на экране: наступившие сигналы — вибрация и звук, если он не стоял в очереди (звуковая карта ещё не была
     разрешена); опоздавшие (страница спала) — без сигнала. Возвращает поданные. */
  function poll(now = Date.now()) {
    if (!end) return [];
    const due = restDue(sig, fired, now);
    for (const d of due) {
      fired[d.i] = true;
      if (d.late) continue;
      if (!queued[d.i] && ready()) { try { if (ctx.state !== 'running') ctx.resume(); tone(ch.rest, ctx.currentTime + .05, d.kind); } catch (e) {} }
      buzz(d.kind);
    }
    return due;
  }
  /* таймер удержания: список {at, kind} заменяет прежний */
  function cue(list) { silence('hold'); cues = list || []; for (const c of cues) queue('hold', c.at, c.kind); }
  function hush() { silence('hold'); cues = []; }
  /* страница снова на экране: очередь — заново по часам */
  function resync() {
    if (ctx && on && ctx.state !== 'running' && ctx.state !== 'closed') { try { ctx.resume(); } catch (e) {} }
    if (end) {
      const now = Date.now();
      sig.forEach((s, i) => { if (!fired[i] && now - s.at > REST_SIGNAL.grace * 1000) fired[i] = true; });
      queueRest();
    }
    if (cues.length) cue(cues);
  }
  /* звуковая карта стоит (iPhone не всегда запускает её сам после возвращения на экран, а без нажатия запустить её
     нельзя): любое нажатие будит её и ставит очередь заново по часам */
  function wake() { if (ctx && on && ctx.state !== 'running' && ctx.state !== 'closed') resync(); }
  function setOn(v) {
    on = !!v; write(KEY, on ? 'on' : 'off');
    if (!on) { silence('rest'); silence('hold'); queued = sig.map(() => false); }
    else { unlock(); if (end) queueRest(); if (cues.length) cue(cues); }
    for (const b of document.querySelectorAll('[data-rest-sound]')) paintButton(b);
  }
  /* «один раз» / «настойчиво» и предупреждение за 10 с: идущий отдых пересчитывается сразу */
  function setPrefs(p) {
    if (p.mode) { mode = p.mode === 'once' ? 'once' : 'persist'; write(MODE_KEY, mode); }
    if (p.warn !== undefined) { warn = !!p.warn; write(WARN_KEY, warn ? 'on' : 'off'); }
    if (end) {
      const now = Date.now();
      sig = restSignals(end, {mode, warn, from}); fired = sig.map(s => s.at <= now); queueRest();
    }
    paintPrefs();
  }
  function paintButton(b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '🔔' : '🔕'; b.title = on ? 'Звук таймеров включён' : 'Звук таймеров выключен'; }
  function paintPrefs() {
    for (const b of document.querySelectorAll('[data-rest-mode]')) b.setAttribute('aria-pressed', String(b.dataset.restMode === mode));
    for (const c of document.querySelectorAll('[data-rest-warn]')) c.checked = warn;
  }
  /* состояние для проверок интерфейса (tools/ui-check.mjs) */
  const state = () => ({audio:ctx ? ctx.state : null, end, queued:ch.rest.length, signals:sig.map(s => s.kind), fired:fired.filter(Boolean).length, mode, warn, hold:cues.map(c => c.kind)});
  return {unlock, arm, cancel, poll, buzz, cue, hush, resync, wake, setOn, setPrefs, paintButton, paintPrefs, state, lastAt:() => restLastAt(sig),
    get on() { return on; }, get mode() { return mode; }, get warn() { return warn; }};
})();
document.addEventListener('click', e => {
  RestAlarm.wake();
  const b = e.target.closest('[data-rest-sound]');
  if (b) { RestAlarm.setOn(!RestAlarm.on); if (RestAlarm.on) RestAlarm.unlock(); return; }
  const m = e.target.closest('[data-rest-mode]');
  if (m) RestAlarm.setPrefs({mode:m.dataset.restMode});
});
document.addEventListener('change', e => { if (e.target.matches && e.target.matches('[data-rest-warn]')) RestAlarm.setPrefs({warn:e.target.checked}); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) RestAlarm.resync(); });
