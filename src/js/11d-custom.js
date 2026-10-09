/* ===================== ИЗБРАННОЕ И СВОЙ ПЛАН =====================
   Избранное — упражнения, отмеченные звёздочкой в атласе, в разборе движения или в карточке плана.
   Свой план — тренировка из упражнений, выбранных вручную (из избранного или по мышцам): порядок, подходы,
   повторы и отдых задаёт человек; по умолчанию дозировку подставляют цель, формат и уровень, как в обычном плане.
   Своих планов может быть несколько, у каждого имя. Журнал, разминка, подсказки веса и режим тренировки — общие. */
const CUSTOM_MAX = 12, CUSTOM_NAME = 40, CUSTOM_TEXT = 40, CUSTOM_NOTE = 400, ITEM_NOTE = 200;
const CUSTOM_REPS = /^(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?$/;
const CUSTOM_TEMPO = /^[0-9X]{1,2}-[0-9X]{1,2}-[0-9X]{1,2}-[0-9X]{1,2}$/;
const PLAN_KEYS = ['goal', 'format', 'level'];
let cpTab = null, cpOpen = new Set(), cpDel = false, cpMsg = '';

/* текст от человека или из чужого файла: без управляющих символов, с ограничением длины (переводы строк в заметках остаются) */
function cleanText(v, max, lines = false) {
  if (typeof v !== 'string') return '';
  return v.replace(lines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, lines ? '' : ' ').replace(/[ \t]+/g, ' ').trim().slice(0, max);
}
/* вес: одно число на все подходы или по подходам; 0–500 кг, шаг 0,25 */
function cleanKg(v) {
  const list = (Array.isArray(v) ? v : [v]).map(x => typeof x === 'string' ? parseFloat(x.replace(',', '.')) : x)
    .filter(x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 500).map(x => Math.round(x * 4) / 4).slice(0, 10);
  return list.length ? list : null;
}
/* ввод веса: «60», «62,5», «60 / 62,5 / 65», «60, 62,5, 65» — запятая с пробелом, пробел, «/» и «;» разделяют подходы,
   запятая внутри числа — десятичная */
function parseKgInput(text) {
  return cleanKg(String(text || '').split(/\s*[;\/]\s*|,\s+|\s+/).map(x => x.trim()).filter(Boolean));
}
function cleanCustomItem(it) {
  if (!it || !EXI[it.id]) return null;
  const o = {id:it.id};
  if (Number.isInteger(it.sets) && it.sets >= 1 && it.sets <= 10) o.sets = it.sets;
  const m = typeof it.reps === 'string' && it.reps.trim().match(CUSTOM_REPS);
  if (m && +m[1] >= 1 && (!m[2] || +m[2] >= +m[1])) o.reps = m[2] ? `${+m[1]}–${+m[2]}` : String(+m[1]);
  if (Number.isInteger(it.rest) && it.rest >= 0 && it.rest <= 600) o.rest = it.rest;
  const kg = it.kg != null ? cleanKg(it.kg) : null; if (kg) o.kg = kg;
  if (typeof it.tempo === 'string' && CUSTOM_TEMPO.test(it.tempo.trim().toUpperCase())) o.tempo = it.tempo.trim().toUpperCase();
  const note = cleanText(it.note, ITEM_NOTE, true); if (note) o.note = note;
  return o;
}
function cleanPlan(c, id) {
  const ids = new Set(), out = {id, name:cleanText(c.name, CUSTOM_NAME) || 'Мой план',
    items:(Array.isArray(c.items) ? c.items : []).map(cleanCustomItem).filter(it => it && !ids.has(it.id) && ids.add(it.id)).slice(0, CUSTOM_MAX)};
  for (const [k, dict] of [['goal', GOALS], ['format', FORMATS], ['level', LEVELS]]) if (typeof c[k] === 'string' && dict[c[k]]) out[k] = c[k];
  for (const k of ['group', 'for', 'from']) { const v = cleanText(c[k], CUSTOM_TEXT); if (v) out[k] = v; }
  const note = cleanText(c.note, CUSTOM_NOTE, true); if (note) out.note = note;
  return out;
}
/* настройки из хранилища или резервной копии: только известные упражнения и разумные значения */
function ensureCustoms(s) {
  s.fav = Array.isArray(s.fav) ? [...new Set(s.fav.filter(id => typeof id === 'string' && EXI[id]))] : [];
  const seen = new Set();
  s.customs = (Array.isArray(s.customs) ? s.customs : []).filter(c => c && typeof c.id === 'string' && /^[\w-]{1,24}$/.test(c.id) && !seen.has(c.id) && seen.add(c.id)).map(c => cleanPlan(c, c.id));
  if (!s.customs.length) s.customs.push({id:'c1', name:'Мой план', items:[]});
  if (!s.customs.some(c => c.id === s.custom)) s.custom = s.customs[0].id;
  if (!MODES[s.mode]) s.mode = 'single';
  s.author = cleanText(s.author, CUSTOM_TEXT);
  /* цель, формат и уровень обычных планов, пока открыт свой план (у своего — свои) */
  const g = s.gen && typeof s.gen === 'object' ? s.gen : {};
  s.gen = {goal:GOALS[g.goal] ? g.goal : s.goal, format:FORMATS[g.format] ? g.format : s.format, level:LEVELS[g.level] ? g.level : s.level};
  return s;
}
function newPlanId() { let id; do id = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); while (S.customs.some(c => c.id === id)); return id; }
function customOf(s = S) { return s.customs.find(c => c.id === s.custom) || s.customs[0]; }

/* У каждого своего плана свои цель, формат и уровень: план выглядит одинаково у тренера и у ученика.
   Переключатели в параметрах правят открытый план; обычная тренировка и неделя держат свои (S.gen). */
function loadPlanSettings() { const c = customOf(); for (const k of PLAN_KEYS) { if (!c[k]) c[k] = S[k]; S[k] = c[k]; } }
function storePlanSetting(k) { if (S.mode === 'custom' && PLAN_KEYS.includes(k)) customOf()[k] = S[k]; else if (PLAN_KEYS.includes(k)) S.gen[k] = S[k]; }
function switchModeSettings(prev) {
  if (prev !== 'custom' && S.mode === 'custom') { for (const k of PLAN_KEYS) S.gen[k] = S[k]; loadPlanSettings(); }
  else if (prev === 'custom' && S.mode !== 'custom') for (const k of PLAN_KEYS) S[k] = S.gen[k];
}
function openCustom(id) {
  const prev = S.mode; if (id) S.custom = id;
  S.mode = 'custom'; S.view = 'plan'; S.day = 0; cpOpen = new Set(); cpDel = false;
  if (prev === 'custom') loadPlanSettings(); else switchModeSettings(prev);
}
ensureCustoms(S);
if (S.mode === 'custom') loadPlanSettings();

/* ---------- избранное ---------- */
const isFav = id => S.fav.includes(id);
function toggleFav(id) {
  if (!EXI[id]) return;
  S.fav = isFav(id) ? S.fav.filter(x => x !== id) : S.fav.concat(id);
  saveSettings(); refreshFav(id);
}
function favLabel(on) { return on ? 'Убрать из избранного' : 'В избранное'; }
function favButton(id, text = false) {
  const on = isFav(id);
  return `<button type="button" class="fav${on ? ' on' : ''}${text ? ' fav-t' : ''}" data-fav="${id}" aria-pressed="${on}" aria-label="${favLabel(on)}: ${esc(EXI[id].name)}" title="${favLabel(on)}"><span class="fav-i" aria-hidden="true">${on ? '★' : '☆'}</span>${text ? `<span class="fav-l">${on ? 'В избранном' : 'В избранное'}</span>` : ''}</button>`;
}
/* звёздочки обновляются на месте: анимации и открытые панели не перестраиваются */
function refreshFav(id) {
  const on = isFav(id);
  for (const b of document.querySelectorAll(`[data-fav="${id}"]`)) {
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('title', favLabel(on));
    b.setAttribute('aria-label', `${favLabel(on)}: ${EXI[id].name}`);
    const i = b.querySelector('.fav-i'); if (i) i.textContent = on ? '★' : '☆';
    const l = b.querySelector('.fav-l'); if (l) l.textContent = on ? 'В избранном' : 'В избранное';
  }
  const n = document.querySelector('[data-cp-tab="fav"] small'); if (n) n.textContent = S.fav.length || '';
  const c = document.querySelector('.at-favn'); if (c) c.textContent = S.fav.length;
  if (S.view === 'plan' && S.mode === 'custom' && (cpTab || 'fav') === 'fav' && $('#cp-list')) $('#cp-list').innerHTML = customListHtml();
}

/* ---------- свой план: правка ---------- */
const customHas = id => customOf().items.some(it => it.id === id);
function customAdd(id) {
  const c = customOf();
  if (!EXI[id] || customHas(id) || c.items.length >= CUSTOM_MAX) return false;
  c.items.push({id}); saveSettings(); return true;
}
function customMove(slot, d) {
  const items = customOf().items, j = slot + d;
  if (slot < 0 || j < 0 || slot >= items.length || j >= items.length) return;
  [items[slot], items[j]] = [items[j], items[slot]];
  const a = cpOpen.has(slot), b = cpOpen.has(j); cpOpen.delete(slot); cpOpen.delete(j); if (a) cpOpen.add(j); if (b) cpOpen.add(slot);
  saveSettings();
}
function customRemove(slot) {
  const items = customOf().items; items.splice(slot, 1);
  cpOpen = new Set([...cpOpen].filter(i => i !== slot).map(i => i > slot ? i - 1 : i)); saveSettings();
}
function customSet(slot, key, value) {
  const items = customOf().items, it = items[slot]; if (!it) return;
  const next = {...it}, clear = value === null || value === undefined || value === '';
  if (clear) delete next[key]; else next[key] = value;
  const ok = cleanCustomItem(next);
  if (!ok || (!clear && !(key in ok))) return;   /* неверное значение не стирает прежнее */
  items[slot] = ok; saveSettings();
}

/* дозировка по цели и формату, поверх — правка человека (кроме статодинамики: там серии заданы методом) */
function customRx(rx, o, ex) {
  if (!o) return rx;
  const r = {...rx};
  if (!rx.static) {
    if (o.sets) r.sets = o.sets;
    if (o.reps && !ex.kind) { r.reps = o.reps; r.work = midOf(o.reps) * GOALS[S.goal].rep * (ex.uni ? 2 : 1); }
    if (o.rest !== undefined) r.rest = o.rest;
    if (o.tempo && !ex.kind) r.tempo = o.tempo;
  }
  /* вес и заметка тренера — и в статодинамике */
  if (o.kg) r.kgPlan = o.kg;
  if (o.note) r.coachNote = o.note;
  r.edited = r.sets !== rx.sets || r.reps !== rx.reps || r.rest !== rx.rest || r.tempo !== rx.tempo || !!o.kg || !!o.note;
  return r;
}
/* вес по плану для подхода k (с нуля): список короче подходов — последний вес повторяется */
const planKg = (rx, k) => rx && rx.kgPlan ? rx.kgPlan[Math.min(k, rx.kgPlan.length - 1)] : null;
function planKgText(list) { return list.every(v => v === list[0]) ? fmtKg(list[0]) : list.map(fmtKg).join(' / '); }

/* подсказки по составу: выбранные мышцы без упражнений и заметный перекос жимов и тяг, передней и задней поверхности бедра */
function customHints(p) {
  const out = [], v = g => p.gvol[g] || 0;
  const idle = S.groups.filter(g => g !== 'cardio' && v(g) < 1);
  if (idle.length) out.push(`Пока не нагружены: ${idle.map(g => GN[g].toLowerCase()).join(', ')}. Добавьте упражнение ниже — или снимите эти мышцы в параметрах.`);
  /* перекос — по основным упражнениям (не по вспомогательной работе) и только когда в плане есть обе стороны:
     день «только жим» или «только тяга» — осознанный выбор */
  const sets = g => p.items.filter(it => g.includes(it.ex.g)).reduce((a, it) => a + (it.rounds || it.rx.sets), 0);
  const push = sets(['chest', 'shoulders']), pull = sets(['back']);
  if (pull >= 1 && push >= 4 && push > pull * 2.5) out.push('Жимов заметно больше, чем тяг. Плечевым суставам полезен баланс: добавьте тягу для спины — горизонтальную или вертикальную.');
  else if (push >= 1 && pull >= 4 && pull > push * 2.5) out.push('Тяг заметно больше, чем жимов. Для баланса добавьте жим — для груди или плеч.');
  return out;
}

/* ---------- отрисовка ---------- */
/* список своих планов: без программы — сверху, программы — группами со своим заголовком */
function customSetupHtml() {
  const c = customOf(), groups = [...new Set(S.customs.map(p => p.group || ''))].sort((a, b) => (a ? 1 : 0) - (b ? 1 : 0));
  const chip = p => `<button type="button" class="place${p.id === c.id ? ' on' : ''}" data-cp-plan="${p.id}" aria-pressed="${p.id === c.id}"><b>${esc(p.name)}</b><small>${p.items.length ? p.items.length + ' ' + plural(p.items.length, 'упражнение', 'упражнения', 'упражнений') : 'пусто'}</small></button>`;
  const lists = groups.map(g => `${g ? `<p class="cp-group">${esc(g)}</p>` : ''}<div class="places cp-plans" role="group" aria-label="${g ? esc(g) : 'Свои планы'}">${S.customs.filter(p => (p.group || '') === g).map(chip).join('')}</div>`).join('');
  const known = [...new Set(S.customs.map(p => p.group).filter(Boolean))];
  return `${lists}<div class="cp-acts"><button type="button" class="place place-add" data-cp-new="1">+ План</button><button type="button" class="btn-ghost" data-cp-copy="1">Копия плана</button><button type="button" class="btn-ghost" data-cp-import="1">${ICON.load}<span>Загрузить план</span></button></div>`
    + `<div class="place-tools"><label class="place-name">Название<input id="cp-name" type="text" maxlength="${CUSTOM_NAME}" value="${esc(c.name)}" autocomplete="off"></label>`
    + (S.customs.length > 1 ? `<button type="button" class="place-del${cpDel ? ' armed' : ''}" data-cp-del="1">${cpDel ? 'Точно удалить?' : 'Удалить план'}</button>` : '') + `</div>`
    + `<details class="cp-about"${c.group || c.for || c.note ? ' open' : ''}><summary>Программа, для кого, заметка</summary><div class="cp-about-f">
        <label class="place-name">Программа<input id="cp-group" type="text" maxlength="${CUSTOM_TEXT}" list="cp-groups" value="${esc(c.group || '')}" placeholder="Например: Сила, неделя 1" autocomplete="off"><datalist id="cp-groups">${known.map(g => `<option value="${esc(g)}"></option>`).join('')}</datalist></label>
        <label class="place-name">Для кого<input id="cp-for" type="text" maxlength="${CUSTOM_TEXT}" value="${esc(c.for || '')}" placeholder="Имя ученика" autocomplete="off"></label>
        <label class="place-name cp-pnote">Заметка к плану<textarea id="cp-pnote" rows="2" maxlength="${CUSTOM_NOTE}" placeholder="Цель, самочувствие, что важно в этой тренировке">${esc(c.note || '')}</textarea></label>
        ${c.from ? `<p class="f-note">От кого: ${esc(c.from)}</p>` : ''}
      </div></details>`;
}
function customRowHtml(ex, E) {
  const here = available(ex, E), inPlan = customHas(ex.id), full = customOf().items.length >= CUSTOM_MAX, name = exName(ex, here ? E : effEquip(EQUIP.map(e => e.id)));
  const add = inPlan ? `<button type="button" class="cp-addb in" disabled>✓ В плане</button>`
    : full ? `<button type="button" class="cp-addb" disabled>Не больше ${CUSTOM_MAX}</button>`
    : `<button type="button" class="cp-addb" data-cp-add="${ex.id}" aria-label="Добавить в план: ${esc(name)}">+ В план</button>`;
  return `<li class="cp-row${here ? '' : ' away'}">${favButton(ex.id)}<button type="button" class="cp-open" data-cp-open="${ex.id}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Разобрать движение: ${esc(name)}"><b>${esc(name)}</b><small>${esc(here ? equipLine(ex, E) : 'здесь нет инвентаря — в плане будет замена')} · ${esc(ex.pri.slice(0, 2).map(m => MUSCLE_NAMES[m].toLowerCase()).join(', '))}${ex.lvl >= 3 ? ' · сложное' : ''}</small></button>${add}</li>`;
}
function customListHtml() {
  const E = effEquip(S.equip), tab = cpTab || (S.fav.length ? 'fav' : 'groups');
  if (tab === 'fav') {
    if (!S.fav.length) return `<li class="cp-none">Избранного пока нет. Отметьте упражнения звёздочкой ☆ — здесь, в атласе мышц или в разборе движения.</li>`;
    return S.fav.map(id => customRowHtml(EXI[id], E)).join('');
  }
  if (!S.groups.length) return `<li class="cp-none">Отметьте мышцы в параметрах — здесь появятся упражнения для них.</li>`;
  const lvlMax = S.level === 'beg' ? 2 : 3;
  return S.groups.map(g => {
    const list = EX.filter(ex => ex.g === g && available(ex, E) && ex.lvl <= lvlMax).sort((a, b) => (a.type === 'c' ? 0 : 1) - (b.type === 'c' ? 0 : 1) || (EX_W[b.id] ?? 1) - (EX_W[a.id] ?? 1));
    /* по шесть на группу, остальное — по кнопке: на телефоне список не превращается в ленту */
    const rows = list.map((ex, i) => customRowHtml(ex, E).replace('<li class="cp-row', i >= 6 ? `<li hidden data-cp-g="${g}" class="cp-row` : '<li class="cp-row'));
    return list.length ? `<li class="cp-gh">${esc(GN[g])} <small>${list.length}</small></li>` + rows.join('') + (list.length > 6 ? `<li class="cp-morel"><button type="button" class="link" data-cp-more="${g}">Ещё ${list.length - 6}</button></li>` : '') : '';
  }).join('') || `<li class="cp-none">Для этих мышц здесь нет упражнений — добавьте инвентарь места.</li>`;
}
function customAddHtml() {
  const tab = cpTab || (S.fav.length ? 'fav' : 'groups'), E = effEquip(S.equip), lvlMax = S.level === 'beg' ? 2 : 3;
  const nG = EX.filter(ex => S.groups.includes(ex.g) && available(ex, E) && ex.lvl <= lvlMax).length;
  const t = (id, label, n) => `<button type="button" role="tab" data-cp-tab="${id}" aria-selected="${tab === id}" class="${tab === id ? 'on' : ''}">${label} <small>${n || ''}</small></button>`;
  return `<section class="cp-add" id="cp-add" aria-labelledby="cp-add-h">
    <h2 id="cp-add-h">Добавить упражнение</h2>
    <div class="cp-tabs" role="tablist" aria-label="Откуда добавить">${t('fav', '★ Избранное', S.fav.length)}${t('groups', 'По выбранным мышцам', nG)}</div>
    <ol class="cp-list" id="cp-list">${customListHtml()}</ol>
    <p class="f-note">Звёздочка ☆ добавляет упражнение в избранное. Больше вариантов с описанием мышц — в атласе. <button type="button" class="link" data-view="atlas">Открыть атлас мышц →</button></p>
  </section>`;
}
/* панель под карточкой своего плана: порядок, подходы, повторы, отдых */
function customToolsHtml(it) {
  const c = customOf(), slot = it.slot, o = c.items[slot] || {}, r = it.rx, open = cpOpen.has(slot), n = c.items.length;
  const restOpts = [0, 15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
  if (!restOpts.includes(r.rest)) restOpts.push(r.rest), restOpts.sort((a, b) => a - b);
  const edit = r.static ? `<p class="f-note">В статодинамике серии, темп и отдых заданы методом — меняются цель и уровень.</p>`
    : `<div class="cp-fields">
        ${r.circ ? '' : `<div class="cp-f"><span>Подходов</span><div class="stepper sm"><button type="button" data-cp-step="${slot}" data-d="-1" aria-label="Меньше подходов"${r.sets <= 1 ? ' disabled' : ''}>−</button><output>${r.sets}</output><button type="button" data-cp-step="${slot}" data-d="1" aria-label="Больше подходов"${r.sets >= 10 ? ' disabled' : ''}>+</button></div></div>`}
        ${it.ex.kind ? '' : `<label class="cp-f"><span>Повторов</span><input type="text" inputmode="numeric" maxlength="7" data-cp-reps="${slot}" value="${esc(r.reps)}" aria-label="Повторов, например 8–12"></label>`}
        ${r.circ ? '' : `<label class="cp-f"><span>Отдых</span><select data-cp-rest="${slot}">${restOpts.map(s => `<option value="${s}"${s === r.rest ? ' selected' : ''}>${s ? fmtRest(s) : 'без отдыха'}</option>`).join('')}</select></label>`}
        ${it.ex.kind ? '' : `<label class="cp-f"><span>Темп</span><input type="text" maxlength="11" data-cp-tempo="${slot}" value="${esc(o.tempo || '')}" placeholder="${esc(r.tempo || '3-0-1-0')}" aria-label="Темп: опускание, пауза, подъём, пауза — например 3-0-1-0" autocomplete="off"></label>`}
        ${o.sets || o.reps || o.rest !== undefined || o.tempo ? `<button type="button" class="btn-ghost cp-reset" data-cp-reset="${slot}">Как по цели</button>` : ''}
      </div>`;
  const lt = loadType(it.ex), kgLabel = lt === 'assist' ? 'Противовес, кг' : lt === 'extra' ? 'Доп. вес, кг' : 'Вес, кг';
  const extra = `<div class="cp-fields">
      ${lt === 'none' ? '' : `<label class="cp-f cp-kg"><span>${kgLabel}</span><input type="text" maxlength="60" data-cp-kg="${slot}" value="${o.kg ? esc(o.kg.map(fmtKg).join(' / ')) : ''}" placeholder="60 или 60 / 62,5 / 65" aria-label="${kgLabel}: одно число на все подходы или по подходам через «/»" autocomplete="off"></label>`}
      <label class="cp-f cp-note"><span>Заметка к упражнению</span><textarea rows="2" maxlength="${ITEM_NOTE}" data-cp-note="${slot}" placeholder="Например: пауза 1 с на груди">${esc(o.note || '')}</textarea></label>
    </div>`;
  return `<div class="cp-tools">
    <button type="button" class="btn-ghost" data-cp-move="${slot}" data-d="-1" aria-label="Выше"${slot === 0 ? ' disabled' : ''}>↑</button>
    <button type="button" class="btn-ghost" data-cp-move="${slot}" data-d="1" aria-label="Ниже"${slot >= n - 1 ? ' disabled' : ''}>↓</button>
    <button type="button" class="btn-ghost${r.edited ? ' cp-edited' : ''}" data-cp-edit="${slot}" aria-expanded="${open}">Подходы, вес, заметка${r.edited ? '<i class="cp-dot" aria-label="изменено"></i>' : ''}</button>
    <button type="button" class="btn-ghost cp-rm" data-cp-rm="${slot}">Убрать</button>
  </div>${open ? `<div class="cp-edit">${edit}${extra}</div>` : ''}`;
}
function customEmptyHtml() {
  return `<div class="empty cp-empty"><h2>План пока пустой</h2><p>Добавьте упражнения из избранного или из списка по выбранным мышцам. Подходы, повторы и отдых подставятся по цели и формату — их можно поправить в карточке.</p><p><button type="button" class="btn btn-2" data-cp-import="1">${ICON.load}<span>Загрузить план из файла</span></button></p></div>`;
}
/* под названием своего плана: программа, для кого, от кого и заметка */
function customHeadHtml() {
  /* название программы само может содержать «·», поэтому части разделены отступом, а значения выделены */
  const c = customOf(), sub = [c.group ? `<span>программа: <b>${esc(c.group)}</b></span>` : '', c.for ? `<span>для: <b>${esc(c.for)}</b></span>` : '', c.from ? `<span>от: <b>${esc(c.from)}</b></span>` : ''].filter(Boolean);
  return (sub.length ? `<p class="cp-sub">${sub.join('')}</p>` : '') + (c.note ? `<p class="c-note cp-pn">${esc(c.note)}</p>` : '');
}

/* ---------- сохранить собранный план как свой ----------
   Обычная тренировка и неделя пересобираются при любой смене настроек; сохранение фиксирует состав, порядок
   и дозировку, какими они видны сейчас. Неделя — несколько планов с общим названием программы. */
function uniquePlanName(name, taken = S.customs.map(c => c.name)) {
  const base = cleanText(name, CUSTOM_NAME - 4) || 'Мой план';
  if (!taken.includes(base)) return base;
  for (let k = 2; ; k++) { const v = `${base} (${k})`; if (!taken.includes(v)) return v; }
}
function freezePlan(p) {
  return p.blocks.flatMap(b => b.items).map(it => {
    const r = it.rx, o = {id:it.ex.id};
    if (!r.static) {
      if (!r.circ) { o.sets = r.sets; o.rest = r.rest; }
      if (!it.ex.kind && CUSTOM_REPS.test(String(r.reps))) o.reps = String(r.reps);
    }
    return cleanCustomItem(o);
  }).filter(Boolean).slice(0, CUSTOM_MAX);
}
function savePlansFrom() {
  const set = Object.fromEntries(PLAN_KEYS.map(k => [k, S[k]])), added = [];
  if (S.mode === 'program' && prog) {
    const group = cleanText(`${SPLITS[prog.split].name} · неделя ${S.week}`, CUSTOM_TEXT);
    for (const d of prog.days) if (d.plan.items) added.push({id:newPlanId(), name:uniquePlanName(`${WD[d.wd]} · ${d.name}`, S.customs.map(c => c.name).concat(added.map(c => c.name))), group, ...set, items:freezePlan(d.plan)});
  } else if (plan && plan.items) added.push({id:newPlanId(), name:uniquePlanName(titleFor()), ...set, items:freezePlan(plan)});
  S.customs.push(...added); saveSettings();
  return added;
}

/* ---------- события ---------- */
function customRerender(focusSel) {
  const y = window.scrollY; saveSettings(); renderSetup(); renderPlan(); window.scrollTo(0, y);
  if (focusSel) { const el = document.querySelector(focusSel); if (el) el.focus(); }
}
document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.fav) { toggleFav(t.dataset.fav); return; }
  if (t.dataset.cpAdd) {
    const id = t.dataset.cpAdd, ok = customAdd(id);
    if (S.view === 'plan' && S.mode === 'custom') return customRerender(`[data-cp-tab="${cpTab || (S.fav.length ? 'fav' : 'groups')}"]`);
    cpMsg = ok ? `Добавлено в план: ${customOf().name}` : customHas(id) ? `Уже в плане: ${customOf().name}` : `В плане не больше ${CUSTOM_MAX} упражнений`;
    for (const m of document.querySelectorAll('.cp-msg')) { m.hidden = false; m.querySelector('span').textContent = cpMsg; }
    return;
  }
  if (t.id === 'save-plan') {
    const added = savePlansFrom(), msg = $('#save-msg');
    if (msg && added.length) msg.innerHTML = `Сохранено в свои планы: ${esc(added.map(c => c.name).join(', '))}. <button type="button" class="link" data-cp-go="${added[0].id}">Открыть →</button>`;
    return;
  }
  if (t.dataset.cpGo !== undefined) { if (document.querySelector('#motion-view')?.open) closeMotion(); openCustom(S.customs.some(c => c.id === t.dataset.cpGo) ? t.dataset.cpGo : null); regen(); window.scrollTo({top:0}); return; }
  if (t.dataset.cpOpen) { openMotionItem(previewItem(t.dataset.cpOpen)); return; }
  if (t.dataset.cpMore) { for (const li of document.querySelectorAll(`[data-cp-g="${t.dataset.cpMore}"]`)) li.hidden = false; t.closest('li').remove(); return; }
  if (t.dataset.cpTab) { cpTab = t.dataset.cpTab; for (const b of document.querySelectorAll('[data-cp-tab]')) { const on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); } $('#cp-list').innerHTML = customListHtml(); return; }
  if (t.dataset.cpPlan) { openCustom(t.dataset.cpPlan); return regen(); }
  if (t.dataset.cpNew !== undefined) {
    const c = customOf(), id = newPlanId();
    S.customs.push({id, name:'План ' + (S.customs.length + 1), items:[], ...(c.group ? {group:c.group} : {}), ...Object.fromEntries(PLAN_KEYS.map(k => [k, S[k]]))});
    openCustom(id); regen();
    const inp = $('#cp-name'); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (t.dataset.cpCopy !== undefined) {
    const c = customOf(), copy = JSON.parse(JSON.stringify(c)); copy.id = newPlanId(); copy.name = uniquePlanName(c.name + ' — копия');
    S.customs.splice(S.customs.indexOf(c) + 1, 0, copy); openCustom(copy.id); regen();
    const inp = $('#cp-name'); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (t.dataset.cpDel !== undefined) {
    if (!cpDel) { cpDel = true; return renderSetup(); }
    S.customs = S.customs.filter(c => c.id !== S.custom); ensureCustoms(S); openCustom(S.customs[0].id); return regen();
  }
  if (S.mode !== 'custom' || S.view !== 'plan') return;
  if (t.dataset.cpMove !== undefined) { const s = +t.dataset.cpMove, d = +t.dataset.d; customMove(s, d); return customRerender(`[data-cp-move="${s + d}"][data-d="${d}"]`); }
  if (t.dataset.cpRm !== undefined) { customRemove(+t.dataset.cpRm); return customRerender(); }
  if (t.dataset.cpEdit !== undefined) { const s = +t.dataset.cpEdit; cpOpen.has(s) ? cpOpen.delete(s) : cpOpen.add(s); return customRerender(`[data-cp-edit="${s}"]`); }
  if (t.dataset.cpStep !== undefined) {
    const s = +t.dataset.cpStep, it = plan.items.find(x => x.slot === s);
    customSet(s, 'sets', Math.max(1, Math.min(10, it.rx.sets + +t.dataset.d)));
    return customRerender(`[data-cp-step="${s}"][data-d="${t.dataset.d}"]`);
  }
  if (t.dataset.cpReset !== undefined) { const s = +t.dataset.cpReset; for (const k of ['sets', 'reps', 'rest', 'tempo']) customSet(s, k, null); return customRerender(`[data-cp-edit="${s}"]`); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (['cp-group', 'cp-for', 'cp-pnote'].includes(t.id)) {
    const c = customOf(), k = {'cp-group':'group', 'cp-for':'for', 'cp-pnote':'note'}[t.id], v = k === 'note' ? cleanText(t.value, CUSTOM_NOTE, true) : cleanText(t.value, CUSTOM_TEXT);
    if (v) c[k] = v; else delete c[k];
    saveSettings(); if (k === 'group') renderSetup(); if (S.mode === 'custom' && S.view === 'plan') renderPlan(); return;
  }
  if (t.id === 'cp-name') { const v = t.value.trim().slice(0, CUSTOM_NAME); if (v) customOf().name = v; saveSettings(); renderSetup(); if (S.mode === 'custom' && S.view === 'plan') renderPlan(); return; }
  if (t.dataset.cpReps !== undefined) {
    const s = +t.dataset.cpReps, ok = cleanCustomItem({id:customOf().items[s]?.id, reps:t.value});
    if (ok && ok.reps) customSet(s, 'reps', ok.reps); else { t.value = plan.items.find(x => x.slot === s)?.rx.reps || ''; return; }
    return customRerender(`[data-cp-reps="${s}"]`);
  }
  if (t.dataset.cpRest !== undefined) { const s = +t.dataset.cpRest; customSet(s, 'rest', +t.value); return customRerender(`[data-cp-rest="${s}"]`); }
  if (t.dataset.cpKg !== undefined) {
    const s = +t.dataset.cpKg, v = t.value.trim(), kg = v ? parseKgInput(v) : null;
    if (v && !kg) { t.setAttribute('aria-invalid', 'true'); return; }
    customSet(s, 'kg', kg); return customRerender(`[data-cp-kg="${s}"]`);
  }
  if (t.dataset.cpTempo !== undefined) {
    const s = +t.dataset.cpTempo, v = t.value.trim().toUpperCase().replace(/[–—]/g, '-');
    if (v && !CUSTOM_TEMPO.test(v)) { t.setAttribute('aria-invalid', 'true'); return; }
    customSet(s, 'tempo', v || null); return customRerender(`[data-cp-tempo="${s}"]`);
  }
  if (t.dataset.cpNote !== undefined) { const s = +t.dataset.cpNote; customSet(s, 'note', cleanText(t.value, ITEM_NOTE, true) || null); return customRerender(`[data-cp-note="${s}"]`); }
});
