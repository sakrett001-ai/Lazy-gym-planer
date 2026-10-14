/* ---------- сигнал в конце отдыха ----------
   Звук — Web Audio: тон ставится в очередь звуковой карты сразу при старте отдыха на момент его окончания. Таймеры
   страницы во «уснувшей» вкладке отстают, а запланированный звук всё равно прозвучит вовремя, пока браузер не
   остановил звук страницы (при заблокированном экране iPhone останавливает — тогда сигнал прозвучит при возвращении,
   если отдых ещё не пропущен). Звуковую карту браузеры разрешают включить только по нажатию — поэтому unlock()
   вызывается из нажатий «Подход выполнен» и «Начать тренировку». На телефоне — ещё и вибрация, когда страница на экране.
   Звук выключается кнопкой на таймере, выбор запоминается. */
const RestAlarm = (() => {
  const KEY = 'podhod.restSound';
  let ctx = null, nodes = [], end = 0, rang = 0, vib = 0;
  let on = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } })();
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  function unlock() {
    if (!AC || !on) return;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  function silence() { for (const n of nodes) { try { n.stop(); } catch (e) {} } nodes = []; }
  /* два коротких двойных сигнала: 880 и 1320 Гц, мягкое нарастание и спад без щелчков */
  function schedule(at) {
    const tones = [[0, 880], [.16, 1320], [.6, 880], [.76, 1320]];
    for (const [dt, f] of tones) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = at + dt;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .14);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .16); nodes.push(o);
    }
  }
  /* сигнал в момент endMs (время Date.now()); повторный вызов переносит сигнал (±15 с) */
  function arm(endMs) {
    cancel(); rang = 0;
    const left = (endMs - Date.now()) / 1000;
    if (left <= 0) return;
    end = endMs;
    if (on && ctx && ctx.state !== 'closed') schedule(ctx.currentTime + left);
    if (typeof navigator !== 'undefined' && navigator.vibrate) vib = setTimeout(() => { if (!document.hidden) navigator.vibrate([220, 120, 220]); }, left * 1000);
  }
  function cancel() { silence(); clearTimeout(vib); vib = 0; end = 0; }
  /* таймер на экране дошёл до нуля: если звук не был поставлен в очередь (звуковая карта ещё не была разрешена),
     сыграть сейчас; не повторять */
  function due() {
    if (!end || rang) return; rang = 1;
    if (on && ctx && ctx.state !== 'closed' && !nodes.length) { try { if (ctx.state === 'suspended') ctx.resume(); schedule(ctx.currentTime + .05); } catch (e) {} }
  }
  function setOn(v) {
    on = !!v; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    if (!on) silence(); else { unlock(); if (end > Date.now()) arm(end); }
    for (const b of document.querySelectorAll('[data-rest-sound]')) paintButton(b);
  }
  function paintButton(b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '🔔' : '🔕'; b.title = on ? 'Звук в конце отдыха включён' : 'Звук в конце отдыха выключен'; }
  /* состояние для проверок интерфейса (tools/ui-check.mjs) */
  const state = () => ({ audio: ctx ? ctx.state : null, end, queued: nodes.length });
  return { unlock, arm, cancel, due, setOn, paintButton, state, get on() { return on; } };
})();
document.addEventListener('click', e => {
  const b = e.target.closest('[data-rest-sound]');
  if (b) { RestAlarm.setOn(!RestAlarm.on); if (RestAlarm.on) RestAlarm.unlock(); }
});
