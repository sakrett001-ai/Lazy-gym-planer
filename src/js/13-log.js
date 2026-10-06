/* ===================== ЖУРНАЛ ===================== */
/* Хранилище: в опубликованной версии — аккаунт (db, личный раздел пользователя),
   в офлайн-файле — браузер. Формат: LOG.data[exId] = [{d:'2026-10-05', wk?:1, s:[[кг|null, повторы] | null, …]}, …] */
const LOG_KEY = 'podhod.log.v1';
const LOG = {mode:'connecting', data:{}, col:null, pending:{}, writing:{}, again:{}, timers:{}, err:'', dl:null, canExport:false};
const WEIGHTED = new Set(['db', 'bb', 'kb', 'cable', 'smith', 'legpress', 'legext', 'legcurl', 'pecdeck']);
const LOWER_G = new Set(['quads', 'hams', 'glutes', 'calves']);
const MACHINE = new Set(['cable', 'smith', 'legext', 'legcurl', 'pecdeck']);
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayKey = () => dayKey(new Date());
function fmtDay(k, withYear) {
  if (k === todayKey()) return 'сегодня';
  const [y, m, d] = k.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}${withYear && y !== new Date().getFullYear() ? ' ' + y : ''}`;
}
let DEC = ','; /* десятичный разделитель; в английской сборке заменяется на точку */
const fmtKg = v => (Math.round(v * 100) / 100).toString().replace('.', DEC);
const parseNum = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };

function validSessions(ss) {
  return Array.isArray(ss) && ss.every(x => x && typeof x.d === 'string' && /^\d{4}-\d\d-\d\d$/.test(x.d) && Array.isArray(x.s));
}
function logLoadLocal() {
  try {
    const s = JSON.parse(localStorage.getItem(LOG_KEY) || 'null');
    if (s && typeof s === 'object') for (const [k, v] of Object.entries(s)) if (EXI[k] && validSessions(v)) LOG.data[k] = v;
  } catch (e) {}
}
function logSaveLocal() { try { localStorage.setItem(LOG_KEY, JSON.stringify(LOG.data)); } catch (e) {} }

/* объединение двух историй: по дате; при совпадении берём запись с большим числом подходов */
function mergeSessions(a, b) {
  const by = new Map();
  for (const x of a || []) by.set(x.d, x);
  for (const x of b || []) {
    const cur = by.get(x.d);
    if (!cur || x.s.filter(Boolean).length > cur.s.filter(Boolean).length) by.set(x.d, x);
  }
  return [...by.values()].sort((p, q) => p.d < q.d ? -1 : 1).slice(-150);
}

async function logInit() {
  const c = window.claude;
  if (!c || typeof c.use !== 'function') { LOG.mode = 'local'; LOG.canExport = true; logRefresh(null); return; }
  let db = null, user = null;
  try { [db, user, LOG.dl] = await Promise.all([c.use('db'), c.use('user'), c.use('downloads')]); } catch (e) {}
  LOG.canExport = !!LOG.dl;
  const uid = user ? await user.id() : null;
  if (!db || !uid) { LOG.mode = 'local'; logRefresh(null); return; }
  try { LOG.col = db.collection('data/users/' + uid); } catch (e) { LOG.mode = 'local'; logRefresh(null); return; }
  LOG.mode = 'cloud';
  const before = JSON.parse(JSON.stringify(LOG.data));
  let first = true;
  LOG.col.onSnapshot(snap => {
    const remote = {};
    for (const d of snap.docs) { const b = d.data(); if (b && EXI[d.id] && validSessions(b.sessions)) remote[d.id] = b.sessions; }
    const changed = [];
    if (first) {
      first = false;
      /* записи, сделанные в этом браузере до подключения, переносим в аккаунт */
      for (const id of new Set([...Object.keys(remote), ...Object.keys(before)])) {
        const merged = mergeSessions(remote[id], before[id]);
        if (JSON.stringify(merged) !== JSON.stringify(remote[id] || [])) { LOG.data[id] = merged; logTouch(id, true); }
        else LOG.data[id] = remote[id];
        changed.push(id);
      }
    } else {
      for (const id of new Set([...Object.keys(remote), ...Object.keys(LOG.data)])) {
        if (LOG.pending[id]) continue;
        const r = remote[id] || [];
        if (JSON.stringify(r) === JSON.stringify(LOG.data[id] || [])) continue;
        if (r.length) LOG.data[id] = r; else delete LOG.data[id];
        changed.push(id);
      }
    }
    logSaveLocal();
    logRefresh(changed);
  }, err => {
    if (err && err.code === 'unavailable') return;
    LOG.mode = 'local'; LOG.err = 'Связь с аккаунтом потеряна — новые записи сохраняются в этом браузере.'; logRefresh(null);
  });
  logRefresh(null);
}

function logTouch(id, now) {
  logSaveLocal();
  if (LOG.mode !== 'cloud') return;
  LOG.pending[id] = true;
  clearTimeout(LOG.timers[id]);
  LOG.timers[id] = setTimeout(() => logFlush(id), now ? 0 : 800);
}
async function logFlush(id, retried) {
  if (LOG.writing[id]) { LOG.again[id] = true; return; }
  LOG.writing[id] = true;
  try {
    const ss = (LOG.data[id] || []).filter(x => x.s.some(Boolean));
    if (ss.length) await LOG.col.doc(id).set({ex:id, sessions:ss});
    else await LOG.col.doc(id).delete();
  } catch (e) {
    const code = e && e.code;
    if (code === 'unavailable' && !retried) { LOG.writing[id] = false; setTimeout(() => logFlush(id, true), 600 + Math.random() * 900); return; }
    if (code === 'quota_exceeded') LOG.err = 'Хранилище журнала заполнено. Удалите старые записи или сделайте резервную копию.';
    else { LOG.mode = 'local'; LOG.err = 'Сохранить в аккаунт не получилось — записи сохраняются в этом браузере.'; }
    logRefresh(null);
  } finally {
    LOG.writing[id] = false;
    if (LOG.again[id]) { LOG.again[id] = false; logFlush(id); } else LOG.pending[id] = false;
  }
}

function todaySession(id, create) {
  let ss = LOG.data[id];
  if (!ss) { if (!create) return null; ss = LOG.data[id] = []; }
  const d = todayKey();
  let s = ss.find(x => x.d === d);
  if (!s && create) {
    s = {d, s:[]};
    if (S.mode === 'program') s.wk = S.week;
    ss.push(s); ss.sort((a, b) => a.d < b.d ? -1 : 1);
    if (ss.length > 150) ss.splice(0, ss.length - 150);
  }
  return s;
}
function pastSessions(id) { const d = todayKey(); return (LOG.data[id] || []).filter(x => x.d < d && x.s.some(Boolean)); }
function cleanToday(id) {
  const ss = LOG.data[id]; if (!ss) return;
  const s = ss.find(x => x.d === todayKey()); if (!s) return;
  while (s.s.length && !s.s[s.s.length - 1]) s.s.pop();
  if (!s.s.length) ss.splice(ss.indexOf(s), 1);
  if (!ss.length) delete LOG.data[id];
}

/* ---------- что записываем ---------- */
function loadType(ex) {
  if (ex.eq.some(g => g.every(id => WEIGHTED.has(id)))) return 'kg';
  if (ex.g === 'cardio' || ex.eq.some(g => g.includes('band') || g.includes('abwheel'))) return 'none';
  return 'extra';
}
function repLabel(ex) { return ex.kind === 'time' ? 'Секунды' : ex.kind === 'dist' ? 'Метры' : 'Повторы'; }
function stepFor(it) {
  const ids = it.eqIds || [], lower = LOWER_G.has(it.ex.g);
  if (ids.includes('legpress')) return 10;
  if (ids.includes('bb') || ids.includes('smith')) return lower ? 5 : 2.5;
  if (ids.some(i => MACHINE.has(i))) return lower ? 5 : 2.5;
  if (ids.includes('db')) return 2;
  if (ids.includes('kb')) return 4;
  return 2.5;
}
const roundTo = (v, st) => Math.max(0, Math.round(v / st) * st);
function parseRange(r) { const m = String(r).match(/(\d+)\D+(\d+)/); if (m) return [+m[1], +m[2]]; const n = parseInt(r, 10); return [n || 0, n || 0]; }
const e1rm = (kg, reps) => kg * (1 + Math.min(reps, 12) / 30);

/* ---------- подсказка по двойной прогрессии ---------- */
function suggest(it) {
  const ex = it.ex, lt = loadType(ex), past = pastSessions(ex.id);
  const [lo, hi] = parseRange(it.rx.reps);
  const unit = ex.kind === 'time' ? ' с' : ex.kind === 'dist' ? ' м' : '';
  const week = S.mode === 'program' ? WEEKS[S.week - 1] : null;
  const step = stepFor(it);
  const res = {tone:'new', kg:null, reps:[], text:'', prev:null};
  if (!past.length) {
    res.text = lt === 'kg'
      ? (ex.kind === 'dist' ? 'Первая запись. Возьмите тяжёлые снаряды, с которыми проходите дистанцию без остановок.' : `Первая запись. Подберите вес, с которым ${lo === hi ? lo : lo + '–' + hi}${unit} даются с запасом в 2 повтора.`)
      : `Первая запись. Отметьте, сколько ${ex.kind === 'time' ? 'секунд' : ex.kind === 'dist' ? 'метров' : 'повторов'} получилось в каждом подходе.`;
    return res;
  }
  const prev = past[past.length - 1];
  res.prev = prev;
  const sets = prev.s.filter(Boolean);
  const kgs = sets.map(x => x[0]).filter(v => v > 0);
  const work = kgs.length ? Math.max(...kgs) : null;
  const atWork = work ? sets.filter(x => x[0] === work) : sets;
  const repsList = atWork.map(x => x[1]);
  const prevList = sets.map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(', ');
  if (ex.kind === 'dist') { res.tone = 'same'; res.kg = work; res.text = work ? `В прошлый раз — ${fmtKg(work)} кг. Попробуйте пройти дальше или взять тяжелее.` : `В прошлый раз: ${prevList} м.`; return res; }
  if (!week && AR.light && work && lt === 'kg') {
    res.tone = 'deload'; res.kg = roundTo(work * 0.9, step); res.reps = sets.map(() => lo);
    res.text = `Облегчённый режим: ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.`;
    return res;
  }
  if (week && week.deload && work) {
    res.tone = 'deload'; res.kg = roundTo(work * 0.85, step);
    res.reps = sets.map(() => lo);
    res.text = `Разгрузка: ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.`;
    return res;
  }
  const required=prev.target || (it.rx.circ ? it.rounds : it.rx.sets) || 1;
  const allTop=prev.s.length>=required && Array.from({length:required},(_,k)=>prev.s[k]).every(v=>v && v[1]>=hi && (!work || v[0]===work));
  const anyLow = repsList.some(r => r < lo);
  if (allTop) {
    if (lt === 'kg' && work) {
      res.tone = 'up'; res.kg = work + step; res.reps = sets.map(() => lo);
      res.text = `Прибавьте до ${fmtKg(res.kg)} кг (+${fmtKg(step)}). В прошлый раз все подходы на верхней границе: ${prevList}.`;
    } else if (ex.kind === 'time') {
      res.tone = 'up'; res.kg = work; res.reps = sets.map(() => hi + 10);
      res.text = `Все подходы на верхней границе. Держите на 10 с дольше${lt === 'extra' ? ' или добавьте отягощение' : ''}.`;
    } else {
      res.tone = 'up'; res.kg = work; res.reps = sets.map((x, k) => x[1] + 1);
      res.text = lt === 'extra' ? `Все подходы на верхней границе (${prevList}). Добавьте отягощение или замедлите опускание до 4 с.` : `Все подходы на верхней границе (${prevList}). Возьмите ленту потуже.`;
    }
    return res;
  }
  if (anyLow) {
    const before = past.length > 1 ? past[past.length - 2].s.filter(Boolean) : [];
    const bWork = before.length ? Math.max(0, ...before.map(x => x[0] || 0)) : 0;
    const lowAgain = work && bWork === work && before.filter(x => x[0] === work).some(x => x[1] < lo);
    if (lt === 'kg' && work && lowAgain) {
      res.tone = 'down'; res.kg = roundTo(work * 0.9, step); res.reps = sets.map(() => lo);
      res.text = `Две тренировки подряд меньше ${lo}${unit} — снизьте до ${fmtKg(res.kg)} кг и наберите повторы.`;
    } else {
      res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.max(lo, x[1]));
      res.text = `${work ? `Оставьте ${fmtKg(work)} кг` : 'Тот же вариант'} и доберите до ${lo}${unit} в каждом подходе. В прошлый раз: ${prevList}.`;
    }
    return res;
  }
  res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.min(hi, x[1] + 1));
  res.text = `${work ? `Тот же вес — ${fmtKg(work)} кг` : 'Тот же вариант'}, цель — на 1${unit || ' повтор'} больше: в прошлый раз ${prevList}.`;
  return res;
}

/* ---------- блок записи в карточке ---------- */
const SUG_ICON = {up:'↑', same:'→', down:'↓', deload:'↓', new:'+'};
function logRows(it) {
  const ex = it.ex, lt = loadType(ex), sg = suggest(it);
  const today = todaySession(ex.id, false);
  const tset = today ? today.s : [];
  const n = Math.max(it.rx.circ ? (it.rounds || it.rx.sets) : it.rx.sets, tset.length);
  const prevSets = sg.prev ? sg.prev.s.filter(Boolean) : [];
  const [lo, hi] = parseRange(it.rx.reps);
  let rows = '';
  for (let k = 0; k < n; k++) {
    const v = tset[k];
    const p = prevSets[k] || prevSets[prevSets.length - 1];
    const pTxt = p ? (p[0] ? fmtKg(p[0]) + ' × ' : '') + p[1] : '—';
    const phKg = sg.kg != null ? fmtKg(sg.kg) : (lt === 'kg' ? '' : '—');
    const phR = sg.reps[k] ?? sg.reps[sg.reps.length - 1] ?? (lo === hi ? String(lo) : `${lo}–${hi}`);
    const done = !!v;
    rows += `<div class="lt-r${done ? ' done' : ''}" data-k="${k}">
      <span class="lt-n">${k + 1}</span><span class="lt-p">${pTxt}</span>
      ${lt === 'none' ? '' : `<input class="lt-in" id="kg-${ex.id}-${k}" data-f="kg" type="text" inputmode="decimal" autocomplete="off" aria-label="Вес, подход ${k + 1}" placeholder="${phKg}" value="${done && v[0] != null ? fmtKg(v[0]) : ''}">`}
      <input class="lt-in" id="rp-${ex.id}-${k}" data-f="reps" type="text" inputmode="numeric" autocomplete="off" aria-label="${repLabel(ex)}, подход ${k + 1}" placeholder="${phR}" value="${done ? v[1] : ''}">
      <button type="button" class="lt-ok" data-tick="${ex.id}" data-k="${k}" aria-pressed="${done}" aria-label="Подход ${k + 1} выполнен">${ICON.check}</button>
    </div>`;
  }
  return {sg, html:`<p class="sug sug-${sg.tone}"><b aria-hidden="true">${SUG_ICON[sg.tone]}</b><span>${esc(sg.text)}</span></p>
    <div class="lt${lt === 'none' ? ' lt-nokg' : ''}" role="group" aria-label="Запись подходов">
      <div class="lt-h"><span>№</span><span>Прошлый раз</span>${lt === 'none' ? '' : `<span>${lt === 'kg' ? 'Вес, кг' : 'Доп. кг'}</span>`}<span>${repLabel(ex)}</span><span></span></div>
      ${rows}
    </div>
    <div class="lt-foot"><button type="button" class="lt-add" data-addset="${ex.id}">+ подход</button>${ex.uni ? '<span>повторы — на каждую сторону</span>' : ''}${it.rx.circ ? '<span>строка — один круг</span>' : ''}</div>`};
}
function logBlock(it) { return `<div class="c-log" data-log="${it.ex.id}">${logRows(it).html}</div>`; }

/* ---------- история упражнения ---------- */
function metricOf(ex) {
  if (loadType(ex) === 'kg' && ex.kind !== 'dist') return {name:'Расчётный максимум', unit:'кг', f:s => { const v = s.s.filter(x => x && x[0] > 0).map(x => e1rm(x[0], x[1])); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'time') return {name:'Лучший подход', unit:'с', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'dist') return {name:'Лучшая дистанция', unit:'м', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  return {name:'Лучший подход', unit:'повт.', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
}
function sparkSvg(pts, unit) {
  if (!pts.length) return '';
  const W = 300, H = 74, L = 6, R = 40, T = 12, B = 14;
  const vs = pts.map(p => p.v);
  let mn = Math.min(...vs), mx = Math.max(...vs);
  if (mx - mn < 1e-9) { mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.12; mn -= pad; mx += pad;
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  const area = pts.length > 1 ? `${line}L${x(pts.length - 1).toFixed(1)},${H - B}L${x(0).toFixed(1)},${H - B}Z` : '';
  const last = pts[pts.length - 1], first = pts[0];
  const fv = v => fmtKg(Math.round(v * 2) / 2);
  const data = esc(JSON.stringify(pts.map((p, i) => [x(i), y(p.v), `${fmtDay(p.d, true)} · ${fv(p.v)} ${unit}`])));
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика: от ${fv(first.v)} до ${fv(last.v)} ${unit}" data-pts="${data}">
    <line class="sp-base" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
    ${area ? `<path class="sp-area" d="${area}"/>` : ''}
    ${pts.length > 1 ? `<path class="sp-line" d="${line}"/>` : ''}
    <circle class="sp-end" cx="${x(pts.length - 1).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4"/>
    <text class="sp-lab" x="${(x(pts.length - 1) + 8).toFixed(1)}" y="${(y(last.v) + 4).toFixed(1)}">${fv(last.v)}</text>
    ${pts.length > 1 ? `<text class="sp-d" x="${L}" y="${H - 2}">${fmtDay(first.d, true)}</text><text class="sp-d" x="${W - R}" y="${H - 2}" text-anchor="end">${fmtDay(last.d, true)}</text>` : ''}
    <line class="sp-x" x1="0" x2="0" y1="${T - 4}" y2="${H - B}" visibility="hidden"/><circle class="sp-dot" r="4" cx="0" cy="0" visibility="hidden"/>
  </svg>`;
}
function histHtml(ex) {
  const ss = (LOG.data[ex.id] || []).filter(x => x.s.some(Boolean));
  if (!ss.length) return `<p class="h-empty">Записей пока нет. Отметьте подходы выше — здесь появится история и график.</p>`;
  const m = metricOf(ex);
  const pts = ss.map(s => ({d:s.d, v:m.f(s)})).filter(p => p.v != null).slice(-24);
  const best = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  const rows = ss.slice(-6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}${s.wk ? `<small>нед. ${s.wk}</small>` : ''}</span>
    <span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span>
    <button type="button" class="h-del" data-del="${ex.id}" data-d="${s.d}" aria-label="Удалить запись за ${fmtDay(s.d, true)}">Удалить</button></li>`).join('');
  return `<div class="h-chart"><p class="h-cap">${m.name}, ${m.unit}${best != null ? ` · лучший ${fmtKg(Math.round(best * 2) / 2)}` : ''}</p>${sparkSvg(pts, m.unit)}</div>
    <ul class="h-list">${rows}</ul>${ss.length > 6 ? `<p class="h-more">Всего записей: ${ss.length}. Полная история — в разделе «Журнал».</p>` : ''}`;
}
function histCount(id) { return (LOG.data[id] || []).filter(x => x.s.some(Boolean)).length; }

/* ---------- обновление на странице ---------- */
function refreshCard(card) {
  if (!plan || !plan.items) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex);
  if (!it) return;
  const box = card.querySelector('.c-log');
  const ae = document.activeElement;
  if (box && !(box.contains(ae) && ae.tagName === 'INPUT')) {
    const refocus = box.contains(ae) && ae.dataset.k !== undefined ? `[data-${ae.dataset.tick ? 'tick' : 'addset'}][data-k="${ae.dataset.k}"]` : null;
    box.innerHTML = logRows(it).html;
    if (refocus) { const n = box.querySelector(refocus); if (n) n.focus(); }
  }
  refreshWarmup(card);
  const pg = card.querySelector('.c-prog'); if (pg) pg.innerHTML = progressionHint(it);
  const h = card.querySelector('.c-hist');
  if (h && !h.hidden) h.innerHTML = histHtml(it.ex);
  const hb = card.querySelector('[data-hist]');
  if (hb) { const n = histCount(it.ex.id); hb.querySelector('small').textContent = n ? n : ''; }
}
function logRefresh(ids) {
  const st = $('#log-status'); if (st) st.innerHTML = statusHtml();
  const tab = document.querySelector('[data-view="journal"] small'); if (tab) tab.textContent = journalDays() || '';
  if (S.view === 'journal') { if (!$('#plan').contains(document.activeElement) || document.activeElement === document.body) renderJournal(); return; }
  document.querySelectorAll('.card').forEach(c => { if (!ids || ids.includes(c.dataset.ex)) refreshCard(c); });
}
function statusHtml() {
  const m = LOG.mode;
  const t = m === 'cloud' ? 'Записи сохраняются в вашем аккаунте и доступны на любом устройстве, где вы открываете эту страницу.'
    : m === 'connecting' ? 'Подключаю хранилище записей…'
    : 'Записи хранятся в этом браузере. Делайте резервную копию, чтобы перенести журнал на другое устройство или не потерять его при очистке браузера.';
  return `<span class="ls-dot ls-${m}" aria-hidden="true"></span><span>${LOG.err ? esc(LOG.err) + ' Делайте резервную копию, чтобы не потерять записи.' : t}</span>`;
}
function journalDays() { const s = new Set(); for (const ss of Object.values(LOG.data)) for (const x of ss) if (x.s.some(Boolean)) s.add(x.d); return s.size; }

/* ---------- экран «Журнал» ---------- */
function heatmap() {
  const byDay = {};
  for (const ss of Object.values(LOG.data)) for (const x of ss) { const n = x.s.filter(Boolean).length; if (n) byDay[x.d] = (byDay[x.d] || 0) + n; }
  const W = 12, cell = 15, gap = 3, LX = 22, TY = 16;
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const dow = (now.getDay() + 6) % 7;
  const start = new Date(now); start.setDate(now.getDate() - dow - (W - 1) * 7);
  let cells = '', months = '', lastM = -1;
  for (let w = 0; w < W; w++) for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
    if (dt > now) continue;
    const k = dayKey(dt), n = byDay[k] || 0;
    const lv = n === 0 ? 0 : n < 10 ? 1 : n < 20 ? 2 : 3;
    cells += `<rect class="hm hm${lv}" x="${LX + w * (cell + gap)}" y="${TY + d * (cell + gap)}" width="${cell}" height="${cell}" rx="3" data-tip="${fmtDay(k, true)}: ${n ? n + ' ' + plural(n, 'подход', 'подхода', 'подходов') : 'без тренировки'}"/>`;
    if (d === 0 && dt.getMonth() !== lastM) { lastM = dt.getMonth(); months += `<text class="hm-l" x="${LX + w * (cell + gap)}" y="10">${MONTHS[lastM]}</text>`; }
  }
  const days = ['Пн', '', 'Ср', '', 'Пт', '', ''].map((t, i) => t ? `<text class="hm-l" x="0" y="${TY + i * (cell + gap) + 11}">${t}</text>` : '').join('');
  const w = LX + W * (cell + gap), h = TY + 7 * (cell + gap);
  return `<svg class="heat" viewBox="0 0 ${w} ${h}" role="img" aria-label="Тренировочные дни за 12 недель">${months}${days}${cells}</svg>
    <p class="hm-legend"><span>меньше</span><i class="hm0"></i><i class="hm1"></i><i class="hm2"></i><i class="hm3"></i><span>больше подходов за день</span></p>`;
}
function renderJournal() {
  stopFigures();
  const entries = Object.entries(LOG.data).map(([id, ss]) => [id, ss.filter(x => x.s.some(Boolean))]).filter(([id, ss]) => EXI[id] && ss.length);
  const days = journalDays();
  const sets = entries.reduce((a, [, ss]) => a + ss.reduce((b, x) => b + x.s.filter(Boolean).length, 0), 0);
  const last = entries.reduce((m, [, ss]) => ss[ss.length - 1].d > m ? ss[ss.length - 1].d : m, '');
  entries.sort((a, b) => a[1][a[1].length - 1].d < b[1][b[1].length - 1].d ? 1 : -1);
  const tools = `<div class="j-tools">
      ${LOG.canExport ? `<button type="button" class="btn btn-2" id="exp-csv">Таблица для Excel</button><button type="button" class="btn btn-2" id="exp-json">Резервная копия</button>` : ''}
      <label class="btn btn-2" for="imp-file">Восстановить из копии</label><input type="file" id="imp-file" accept=".json,application/json" hidden>
    </div><p class="p-hint" id="j-msg" role="status"></p>`;
  let html = `<header class="p-head j-head">
    <div class="p-sum">
      <p class="eyebrow">Журнал</p>
      <h1 class="p-title">Ваш прогресс</h1>
      <dl class="stats">
        <div><dt>${plural(days, 'тренировка', 'тренировки', 'тренировок')}</dt><dd>${days}</dd></div>
        <div><dt>${plural(sets, 'подход', 'подхода', 'подходов')}</dt><dd>${sets}</dd></div>
        <div><dt>${plural(entries.length, 'упражнение', 'упражнения', 'упражнений')}</dt><dd>${entries.length}</dd></div>
      </dl>
      <p class="ls" id="log-status">${statusHtml()}</p>
      ${tools}
    </div>
    <figure class="j-heat"><figcaption class="lb-h">Активность за 12 недель${last ? ` · последняя тренировка ${fmtDay(last, true)}` : ''}</figcaption>${heatmap()}</figure>
  </header>`;
  if (!entries.length) {
    html += `<div class="empty"><h2>Записей пока нет</h2><p>Откройте план и отмечайте подходы в карточках упражнений: вес и повторы сохранятся здесь, а планировщик начнёт подсказывать, когда прибавлять вес.</p><button type="button" class="btn" data-view="plan">Перейти к плану</button></div>`;
  } else {
    html += `<ul class="j-list">${entries.map(([id, ss]) => {
      const ex = EXI[id], m = metricOf(ex);
      const vals = ss.map(s => m.f(s)).filter(v => v != null);
      const firstV = vals[0], lastV = vals[vals.length - 1];
      const ch = vals.length > 1 && firstV ? Math.round((lastV / firstV - 1) * 100) : null;
      const lastS = ss[ss.length - 1];
      return `<li class="j-row">
        <details>
          <summary>
            <span class="j-name">${esc(ex.name)}<small>${GN[ex.g]} · ${ss.length} ${plural(ss.length, 'запись', 'записи', 'записей')} · ${fmtDay(lastS.d, true)}</small></span>
            <span class="j-val">${lastV != null ? fmtKg(Math.round(lastV * 2) / 2) : '—'}<small>${m.unit}</small>${ch != null ? `<em class="${ch > 0 ? 'pos' : ch < 0 ? 'neg' : ''}">${ch > 0 ? '+' : ''}${ch}%</em>` : ''}</span>
          </summary>
          <div class="j-body">${histHtml(ex).replace(/<p class="h-more">.*?<\/p>/, '')}${ss.length > 6 ? `<details class="j-all"><summary>Все записи (${ss.length})</summary><ul class="h-list">${ss.slice(0, -6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}</span><span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span><button type="button" class="h-del" data-del="${id}" data-d="${s.d}">Удалить</button></li>`).join('')}</ul></details>` : ''}</div>
        </details>
      </li>`;
    }).join('')}</ul>
    <p class="legend">Расчётный максимум — вес, который вы, по формуле Эпли, подняли бы один раз: вес × (1 + повторы / 30). Он растёт и когда прибавляете вес, и когда делаете больше повторов с тем же весом.</p>`;
  }
  $('#plan').innerHTML = html;
}
function viewTabs() {
  const n = journalDays();
  return `<button type="button" role="tab" data-view="plan" aria-selected="${S.view !== 'journal'}" class="${S.view !== 'journal' ? 'on' : ''}">План</button>
    <button type="button" role="tab" data-view="journal" aria-selected="${S.view === 'journal'}" class="${S.view === 'journal' ? 'on' : ''}">Журнал <small>${n || ''}</small></button>`;
}

/* ---------- экспорт и восстановление ---------- */
async function saveFile(name, text, mime) {
  if (LOG.dl) {
    try { await LOG.dl.save({filename:name, data:text}); return 'ok'; }
    catch (e) { return e && e.code === 'declined' ? 'declined' : 'fail'; }
  }
  if (!window.claude) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:mime}));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return 'ok';
  }
  return 'fail';
}
function csvText() {
  const rows = [['Дата', 'Упражнение', 'Группа мышц', 'Подход', 'Вес, кг', 'Повторы / секунды / метры', 'Неделя цикла']];
  const all = [];
  for (const [id, ss] of Object.entries(LOG.data)) if (EXI[id]) for (const s of ss) s.s.forEach((x, k) => { if (x) all.push([s.d, EXI[id].name, GN[EXI[id].g], k + 1, x[0] != null ? fmtKg(x[0]) : '', x[1], s.wk || '']); });
  all.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1);
  return '﻿' + rows.concat(all).map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\r\n');
}
async function exportLog(kind) {
  const msg = $('#j-msg'), d = todayKey();
  const r = kind === 'csv' ? await saveFile(`lazy-gym-log-${d}.csv`, csvText(), 'text/csv')
    : await saveFile(`lazy-gym-kopiya-${d}.json`, JSON.stringify({app:'podhod', v:1, exported:new Date().toISOString(), log:LOG.data}), 'application/json');
  if (msg) msg.textContent = r === 'ok' ? (kind === 'csv' ? 'Таблица сохранена. Откройте её в Excel: столбцы разделены точкой с запятой.' : 'Копия сохранена. Восстановить журнал из неё можно здесь же, на любом устройстве.')
    : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не удалось.';
}
function importLog(file) {
  const msg = $('#j-msg');
  const rd = new FileReader();
  rd.onload = () => {
    let obj; try { obj = JSON.parse(rd.result); } catch (e) { obj = null; }
    const log = obj && obj.app === 'podhod' && obj.log && typeof obj.log === 'object' ? obj.log : null;
    if (!log) { if (msg) msg.textContent = 'Это не резервная копия Lazy Gym Planner. Выберите файл lazy-gym-kopiya-….json.'; return; }
    let nEx = 0, nS = 0;
    for (const [id, ss] of Object.entries(log)) {
      if (!EXI[id] || !validSessions(ss)) continue;
      const clean = ss.map(x => ({d:x.d, ...(x.wk ? {wk:+x.wk} : {}), s:x.s.map(v => Array.isArray(v) && isFinite(+v[1]) ? [v[0] == null || v[0] === '' ? null : +v[0], +v[1]] : null)}));
      const merged = mergeSessions(LOG.data[id], clean);
      if (JSON.stringify(merged) !== JSON.stringify(LOG.data[id] || [])) { LOG.data[id] = merged; logTouch(id, true); nEx++; nS += clean.length; }
    }
    logSaveLocal();
    renderJournal();
    const m2 = $('#j-msg');
    if (m2) m2.textContent = nEx ? `Восстановлено записей: ${nS}, упражнений: ${nEx}. Совпадающие даты объединены.` : 'Новых записей в копии нет — журнал уже содержит всё из неё.';
  };
  rd.readAsText(file);
}

/* ---------- всплывающая подсказка для графиков ---------- */
const tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl);
function showTip(text, cx, cy) {
  tipEl.textContent = text; tipEl.hidden = false;
  const r = tipEl.getBoundingClientRect();
  tipEl.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, cx - r.width / 2)) + 'px';
  tipEl.style.top = Math.max(8, cy - r.height - 12) + 'px';
}
document.addEventListener('pointermove', e => {
  const sp = e.target.closest && e.target.closest('.spark');
  if (sp) {
    const pts = JSON.parse(sp.dataset.pts || '[]'); if (!pts.length) return;
    const b = sp.getBoundingClientRect(), vb = sp.viewBox.baseVal, sx = b.width / vb.width;
    const px = (e.clientX - b.left) / sx;
    let bi = 0; pts.forEach((p, i) => { if (Math.abs(p[0] - px) < Math.abs(pts[bi][0] - px)) bi = i; });
    const p = pts[bi], xl = sp.querySelector('.sp-x'), dot = sp.querySelector('.sp-dot');
    xl.setAttribute('x1', p[0]); xl.setAttribute('x2', p[0]); xl.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); dot.setAttribute('visibility', 'visible');
    showTip(p[2], b.left + p[0] * sx, b.top + p[1] * (b.height / vb.height));
    return;
  }
  const c = e.target.closest && e.target.closest('[data-tip]');
  if (c) { const b = c.getBoundingClientRect(); showTip(c.dataset.tip, b.left + b.width / 2, b.top); return; }
  if (!tipEl.hidden) { tipEl.hidden = true; document.querySelectorAll('.spark .sp-x, .spark .sp-dot').forEach(n => n.setAttribute('visibility', 'hidden')); }
}, {passive:true});
document.addEventListener('pointerleave', () => { tipEl.hidden = true; });

/* ---------- действия журнала ---------- */
function tickSet(btn) {
  const id = btn.dataset.tick, k = +btn.dataset.k;
  const row = btn.closest('.lt-r');
  const it = plan.items.find(x => x.ex.id === id);
  const lt = loadType(it.ex);
  const kgIn = row.querySelector('[data-f="kg"]'), rIn = row.querySelector('[data-f="reps"]');
  const s = todaySession(id, true);
  if (s.s[k]) {
    s.s[k] = null; cleanToday(id);
    row.classList.remove('done'); btn.setAttribute('aria-pressed', 'false');
    if (kgIn) kgIn.value = ''; rIn.value = '';
    logTouch(id); refreshHist(id); return;
  }
  const reps = parseNum(rIn.value !== '' ? rIn.value : rIn.placeholder);
  let kg = kgIn ? parseNum(kgIn.value !== '' ? kgIn.value : kgIn.placeholder) : null;
  if (reps == null || reps <= 0) {
    cleanToday(id);
    rIn.focus(); rIn.classList.add('need'); setTimeout(() => rIn.classList.remove('need'), 1600);
    return;
  }
  if (lt === 'kg' && kg == null && kgIn) { kgIn.focus(); kgIn.classList.add('need'); setTimeout(() => kgIn.classList.remove('need'), 1600); cleanToday(id); return; }
  if (kg != null && kg < 0) kg = null;
  while (s.s.length < k) s.s.push(null);
  s.s[k] = [kg, Math.round(reps * 10) / 10];
  s.target=Math.max(s.target||0,it.rx.circ?(it.rounds||it.rx.sets):it.rx.sets);
  if (kgIn) kgIn.value = kg != null ? fmtKg(kg) : '';
  rIn.value = s.s[k][1];
  row.classList.add('done'); btn.setAttribute('aria-pressed', 'true');
  logTouch(id); refreshHist(id);
  const total = it.rx.circ ? 0 : it.rx.sets;
  const doneN = s.s.filter(Boolean).length;
  if (!it.rx.circ) {
    const r = it.rx.restShown !== undefined ? it.rx.restShown : it.rx.rest;
    if (r) startRest(r, doneN >= total ? 'Отдых перед следующим упражнением' : `Отдых после подхода ${doneN}`);
  }
}
function editSet(inp) {
  const row = inp.closest('.lt-r'); if (!row || !row.classList.contains('done')) return;
  const box = inp.closest('.c-log'), id = box.dataset.log, k = +row.dataset.k;
  const s = todaySession(id, false); if (!s || !s.s[k]) return;
  const v = parseNum(inp.value);
  if (inp.dataset.f === 'kg') s.s[k][0] = v != null && v >= 0 ? v : null;
  else if (v != null && v > 0) s.s[k][1] = Math.round(v * 10) / 10; else return;
  logTouch(id); refreshHist(id);
}
function refreshHist(id) {
  const card = document.querySelector(`.card[data-ex="${id}"]`); if (!card) return;
  const h = card.querySelector('.c-hist'); if (h && !h.hidden) h.innerHTML = histHtml(EXI[id]);
  const hb = card.querySelector('[data-hist] small'); if (hb) { const n = histCount(id); hb.textContent = n || ''; }
  const tab = document.querySelector('[data-view="journal"] small'); if (tab) tab.textContent = journalDays() || '';
}
const delArm = {};
function deleteSession(btn) {
  const id = btn.dataset.del, d = btn.dataset.d, key = id + d;
  if (!delArm[key]) {
    delArm[key] = true; btn.textContent = 'Точно удалить?'; btn.classList.add('armed');
    setTimeout(() => { delArm[key] = false; if (btn.isConnected) { btn.textContent = 'Удалить'; btn.classList.remove('armed'); } }, 3500);
    return;
  }
  delArm[key] = false;
  const ss = LOG.data[id]; if (!ss) return;
  const i = ss.findIndex(x => x.d === d); if (i < 0) return;
  ss.splice(i, 1); if (!ss.length) delete LOG.data[id];
  logTouch(id, true);
  if (S.view === 'journal') renderJournal();
  else { const card = document.querySelector(`.card[data-ex="${id}"]`); if (card) refreshCard(card); }
}

document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tick) { tickSet(t); return; }
  if (t.dataset.addset) {
    const id = t.dataset.addset, it = plan.items.find(x => x.ex.id === id);
    it.extra = (it.extra || 0) + 1;
    const box = t.closest('.c-log');
    const n = box.querySelectorAll('.lt-r').length;
    it.rx.sets = Math.max(it.rx.sets, n + 1);
    if (it.rx.circ) it.rounds = Math.max(it.rounds || 0, n + 1);
    box.innerHTML = logRows(it).html;
    const inp = box.querySelector(`.lt-r[data-k="${n}"] .lt-in`); if (inp) inp.focus();
    return;
  }
  if (t.dataset.hist) {
    const card = t.closest('.card'), h = card.querySelector('.c-hist');
    h.hidden = !h.hidden; t.setAttribute('aria-expanded', String(!h.hidden));
    if (!h.hidden) h.innerHTML = histHtml(EXI[card.dataset.ex]);
    return;
  }
  if (t.dataset.del) { deleteSession(t); return; }
  if (t.dataset.view) { S.view = t.dataset.view; saveSettings(); renderSetup(); renderPlan(); window.scrollTo({top:0}); return; }
  if (t.id === 'exp-csv') { exportLog('csv'); return; }
  if (t.id === 'exp-json') { exportLog('json'); return; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'imp-file' && e.target.files && e.target.files[0]) { importLog(e.target.files[0]); e.target.value = ''; }
  else if (e.target.classList && e.target.classList.contains('lt-in')) editSet(e.target);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('lt-in')) {
    e.preventDefault();
    const row = e.target.closest('.lt-r');
    if (row.classList.contains('done')) { editSet(e.target); return; }
    const ins = [...row.querySelectorAll('.lt-in')];
    const i = ins.indexOf(e.target);
    if (i < ins.length - 1) ins[i + 1].focus(); else row.querySelector('.lt-ok').click();
  }
});
