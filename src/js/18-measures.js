/* ===================== ТЕЛО: ВЕС И ЗАМЕРЫ ===================== */
/* BODY.rows = [{d:'2026-10-06', kg:82.4, waist:88, …}] — одна запись на день, любые поля.
   Хранится в localStorage (podhod.body.v1) и, при входе в аккаунт, в документе «_body» той же коллекции, что журнал. */
const BODY_KEY = 'podhod.body.v1';
const BODY_FIELDS = [
  {k:'kg', name:'Вес', unit:'кг', main:true},
  {k:'waist', name:'Талия', unit:'см'}, {k:'chest', name:'Грудь', unit:'см'}, {k:'hips', name:'Таз', unit:'см'},
  {k:'arm', name:'Бицепс', unit:'см'}, {k:'thigh', name:'Бедро', unit:'см'}, {k:'calf', name:'Голень', unit:'см'}, {k:'neck', name:'Шея', unit:'см'}
];
const BODY = {rows:[], pending:false, writing:false, again:false};
function validBodyRows(rows) { return Array.isArray(rows) && rows.every(r => r && typeof r.d === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.d)); }
function cleanBodyRow(r) { const o = {d:r.d}; for (const f of BODY_FIELDS) { const v = parseNum(r[f.k]); if (v != null && v > 0 && v < 1000) o[f.k] = Math.round(v * 10) / 10; } return o; }
function bodyHasValues(r) { return BODY_FIELDS.some(f => r[f.k] != null); }
function bodyLoad() { try { const s = JSON.parse(localStorage.getItem(BODY_KEY) || 'null'); if (s && validBodyRows(s.rows)) BODY.rows = s.rows.map(cleanBodyRow).filter(bodyHasValues); } catch (e) {} }
function bodySaveLocal() { try { localStorage.setItem(BODY_KEY, JSON.stringify({rows:BODY.rows})); } catch (e) {} }
/* объединение по дате: поля складываются, при совпадении приоритет у b */
function mergeBodyRows(a, b) {
  const by = new Map();
  for (const r of a || []) by.set(r.d, {...r});
  for (const r of b || []) by.set(r.d, {...(by.get(r.d) || {}), ...r});
  return [...by.values()].filter(bodyHasValues).sort((p, q) => p.d < q.d ? -1 : 1).slice(-400);
}
/* синхронизация с аккаунтом: вызывается из logInit при каждом снимке коллекции */
function bodyRemote(doc, first) {
  const remote = doc && validBodyRows(doc.rows) ? doc.rows.map(cleanBodyRow).filter(bodyHasValues) : [];
  if (first) {
    const merged = mergeBodyRows(remote, BODY.rows);
    if (JSON.stringify(merged) !== JSON.stringify(remote)) { BODY.rows = merged; bodyTouch(true); } else BODY.rows = remote;
  } else {
    if (BODY.pending || JSON.stringify(remote) === JSON.stringify(BODY.rows)) return;
    BODY.rows = remote;
  }
  bodySaveLocal();
  if (S.view === 'journal' && !$('#b-form input:focus')) renderJournal();
}
function bodyTouch(now) {
  bodySaveLocal();
  if (LOG.mode !== 'cloud' || !LOG.col) return;
  BODY.pending = true;
  clearTimeout(BODY.timer);
  BODY.timer = setTimeout(bodyFlush, now ? 0 : 800);
}
async function bodyFlush(retried) {
  if (BODY.writing) { BODY.again = true; return; }
  BODY.writing = true;
  try {
    if (BODY.rows.length) await LOG.col.doc('_body').set({ex:'_body', rows:BODY.rows});
    else await LOG.col.doc('_body').delete();
  } catch (e) {
    if (e && e.code === 'unavailable' && !retried) { BODY.writing = false; setTimeout(() => bodyFlush(true), 800); return; }
    LOG.err = 'Сохранить замеры в аккаунт не получилось — они остаются в этом браузере.'; logRefresh(null);
  } finally {
    BODY.writing = false;
    if (BODY.again) { BODY.again = false; bodyFlush(); } else BODY.pending = false;
  }
}
function bodyLatest(k) { for (let i = BODY.rows.length - 1; i >= 0; i--) if (BODY.rows[i][k] != null) return BODY.rows[i]; return null; }
/* изменение за период: сравниваем последнее значение с ближайшим не позже cutoff */
function bodyDelta(k, days) {
  const last = bodyLatest(k); if (!last) return null;
  const cutoff = dayKey(new Date(new Date(last.d + 'T12:00:00') - days * 86400000));
  const prev = [...BODY.rows].reverse().find(r => r[k] != null && r.d <= cutoff && r.d !== last.d);
  return prev ? {v:Math.round((last[k] - prev[k]) * 10) / 10, from:prev.d} : null;
}
const fmtDelta = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + fmtKg(Math.abs(v));
/* окраска изменения веса зависит от цели: на массе рост — хорошо, на рельефе — наоборот; на силе нейтрально */
function deltaClass(v) { const g = S.goal === 'mass' ? 1 : S.goal === 'cut' ? -1 : 0; return !g || !v ? '' : v * g > 0 ? 'good' : 'bad'; }
function bodyHtml() {
  const last = bodyLatest('kg'), d4 = bodyDelta('kg', 28);
  const pts = BODY.rows.filter(r => r.kg != null).slice(-40).map(r => ({d:r.d, v:r.kg}));
  const chips = BODY_FIELDS.filter(f => !f.main).map(f => { const l = bodyLatest(f.k); if (!l) return ''; const dl = bodyDelta(f.k, 28); return `<li><span>${f.name}</span><b>${fmtKg(l[f.k])}<small>${f.unit}</small></b>${dl && dl.v ? `<em>${fmtDelta(dl.v)}</em>` : ''}</li>`; }).join('');
  const form = `<form class="b-form" id="b-form" autocomplete="off">
    <label class="b-date">Дата<input type="date" id="b-date" value="${todayKey()}" max="${todayKey()}" required></label>
    ${BODY_FIELDS.map(f => { const l = bodyLatest(f.k); return `<label${f.main ? ' class="b-main"' : ''}>${f.name}, ${f.unit}<input class="lt-in" type="text" inputmode="decimal" data-bf="${f.k}" placeholder="${l ? fmtKg(l[f.k]) : '—'}" aria-label="${f.name}, ${f.unit}"></label>`; }).join('')}
    <button type="submit" class="btn">Записать</button>
    <p class="b-hint">Заполняйте то, что измерили: вес — утром натощак, обхваты — сантиметровой лентой без натяжения, в одних и тех же точках. Остальное можно оставить пустым.</p>
  </form>`;
  const rows = [...BODY.rows].reverse();
  const rowHtml = r => `<li><span class="h-d">${fmtDay(r.d, true)}</span><span class="h-s">${BODY_FIELDS.filter(f => r[f.k] != null).map(f => `${f.main ? '' : f.name.toLowerCase() + ' '}${fmtKg(r[f.k])}${f.main ? ' кг' : ''}`).join(' · ')}</span><button type="button" class="h-del" data-bdel="${r.d}" aria-label="Удалить замер за ${fmtDay(r.d, true)}">Удалить</button></li>`;
  const list = rows.length ? `<ul class="h-list b-list">${rows.slice(0, 6).map(rowHtml).join('')}</ul>${rows.length > 6 ? `<details class="j-all"><summary>Все замеры (${rows.length})</summary><ul class="h-list b-list">${rows.slice(6).map(rowHtml).join('')}</ul></details>` : ''}` : '';
  return `<section class="b-sec" aria-labelledby="b-title">
    <div class="b-head">
      <div>
        <p class="eyebrow">Тело</p>
        <h2 id="b-title">Вес и замеры</h2>
        ${last ? `<p class="b-now"><b>${fmtKg(last.kg)}<small>кг</small></b>${d4 && d4.v ? `<em class="${deltaClass(d4.v)}">${fmtDelta(d4.v)} за 4 нед.</em>` : `<em>${fmtDay(last.d, true)}</em>`}</p>` : `<p class="b-empty">Записей о весе пока нет. Взвешивайтесь раз в неделю в одно и то же время — по графику будет видно, куда идёт масса, а не дневные колебания воды.</p>`}
        ${chips ? `<ul class="b-chips">${chips}</ul>` : ''}
      </div>
      ${pts.length > 1 ? `<div class="h-chart b-chart"><p class="h-cap">Вес, кг · ${pts.length} ${plural(pts.length, 'запись', 'записи', 'записей')}</p>${sparkSvg(pts, 'кг', 0.1)}</div>` : ''}
    </div>
    ${form}
    ${list}
  </section>`;
}
function bodySubmit(form) {
  const d = $('#b-date').value;
  if (!/^\d{4}-\d\d-\d\d$/.test(d) || d > todayKey()) { $('#b-date').focus(); return; }
  const row = {d};
  let any = false;
  form.querySelectorAll('[data-bf]').forEach(inp => { const v = parseNum(inp.value); if (v != null && v > 0) { row[inp.dataset.bf] = v; any = true; } });
  if (!any) { const f = form.querySelector('[data-bf="kg"]'); f.classList.add('need'); f.focus(); setTimeout(() => f.classList.remove('need'), 1200); return; }
  BODY.rows = mergeBodyRows(BODY.rows, [cleanBodyRow(row)]);
  bodyTouch(false);
  renderJournal();
  const m = $('#j-msg'); if (m) m.textContent = `Замер за ${fmtDay(d, true)} записан.`;
}
function bodyDelete(btn) {
  if (!btn.classList.contains('armed')) { btn.classList.add('armed'); btn.textContent = 'Точно удалить?'; setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Удалить'; }, 3000); return; }
  BODY.rows = BODY.rows.filter(r => r.d !== btn.dataset.bdel);
  bodyTouch(false); renderJournal();
}
function bodyCsv() {
  const head = ['Дата'].concat(BODY_FIELDS.map(f => `${f.name}, ${f.unit}`));
  const rows = BODY.rows.map(r => [r.d].concat(BODY_FIELDS.map(f => r[f.k] != null ? fmtKg(r[f.k]) : '')));
  return '﻿' + [head].concat(rows).map(r => r.join(';')).join('\r\n');
}
document.addEventListener('submit', e => { if (e.target.id === 'b-form') { e.preventDefault(); bodySubmit(e.target); } });
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.bdel) { bodyDelete(t); return; }
  if (t.id === 'exp-body') { saveFile(`lazy-gym-body-${todayKey()}.csv`, bodyCsv(), 'text/csv').then(r => { const m = $('#j-msg'); if (m) m.textContent = r === 'ok' ? 'Таблица замеров сохранена.' : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не удалось.'; }); }
});
bodyLoad();

/* ===================== ПОЛНАЯ РЕЗЕРВНАЯ КОПИЯ ===================== */
/* v2: настройки планировщика, инвентарь, авторегулировка, календарь, атлас, журнал и замеры. v1 (только журнал) тоже читается. */
function backupObject() {
  return {app:'podhod', v:2, exported:new Date().toISOString(), version:window.PODHOD_VERSION || '',
    settings:{...S}, gear:{bar:GEAR.bar, plates:GEAR.plates}, autoreg:{dismissed:AR.dismissed, light:AR.light}, ics:{...ICS}, motion:{...motionPrefs},
    log:LOG.data, body:BODY.rows};
}
function restoreBackup(obj) {
  const out = {sessions:0, exercises:0, body:0, settings:false};
  if (obj.log && typeof obj.log === 'object') {
    for (const [id, ss] of Object.entries(obj.log)) {
      if (!EXI[id] || !validSessions(ss)) continue;
      const clean = ss.map(x => ({d:x.d, ...(x.wk ? {wk:+x.wk} : {}),
        ...(Number.isSafeInteger(+x.target) && +x.target > 0 ? {target:+x.target} : {}),
        s:x.s.map(v => Array.isArray(v) && isFinite(+v[1]) ? [v[0] == null || v[0] === '' ? null : +v[0], +v[1]] : null)}));
      const merged = mergeSessions(LOG.data[id], clean);
      if (JSON.stringify(merged) !== JSON.stringify(LOG.data[id] || [])) { LOG.data[id] = merged; logTouch(id, true); out.exercises++; out.sessions += clean.length; }
    }
    logSaveLocal();
  }
  if (validBodyRows(obj.body)) {
    const merged = mergeBodyRows(BODY.rows, obj.body.map(cleanBodyRow).filter(bodyHasValues));
    if (JSON.stringify(merged) !== JSON.stringify(BODY.rows)) { out.body = merged.length - BODY.rows.length; BODY.rows = merged; bodyTouch(true); }
  }
  if (obj.v >= 2) {
    if (obj.settings && typeof obj.settings === 'object') {
      const s = obj.settings, ok = {};
      for (const k of Object.keys(DEFAULTS)) if (k in s && k !== 'view') ok[k] = s[k];
      if (Array.isArray(ok.groups)) ok.groups = ok.groups.filter(g => GROUPS.some(x => x.id === g));
      if (Array.isArray(ok.equip)) ok.equip = ok.equip.filter(id => EQUIP.some(x => x.id === id));
      if (!GOALS[ok.goal]) delete ok.goal; if (!FORMATS[ok.format]) delete ok.format; if (!LEVELS[ok.level]) delete ok.level;
      Object.assign(S, ok); saveSettings(); out.settings = true;
    }
    if (obj.gear && typeof obj.gear === 'object') { if (isFinite(obj.gear.bar) && obj.gear.bar > 0) GEAR.bar = +obj.gear.bar; if (Array.isArray(obj.gear.plates)) { const pl = obj.gear.plates.map(Number).filter(v => v > 0); if (pl.length) GEAR.plates = [...new Set(pl)].sort((a, b) => b - a); } gearSave(); }
    if (obj.autoreg && typeof obj.autoreg === 'object') { if (obj.autoreg.dismissed && typeof obj.autoreg.dismissed === 'object') AR.dismissed = obj.autoreg.dismissed; AR.light = !!obj.autoreg.light; arSave(); }
    if (obj.ics && typeof obj.ics === 'object') { Object.assign(ICS, obj.ics); try { localStorage.setItem(ICS_KEY, JSON.stringify(ICS)); } catch (e) {} }
    if (obj.motion && typeof obj.motion === 'object') { Object.assign(motionPrefs, obj.motion); saveMotionPrefs(); }
    S.view = 'journal';
    renderSetup();
  }
  return out;
}
