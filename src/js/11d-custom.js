/* ===================== ИЗБРАННОЕ И СВОЙ ПЛАН =====================
   Избранное — упражнения, отмеченные звёздочкой в атласе, в разборе движения или в карточке плана.
   Свой план — тренировка из упражнений, выбранных вручную (из избранного или по мышцам): порядок, подходы,
   повторы и отдых задаёт человек; по умолчанию дозировку подставляют цель, формат и уровень, как в обычном плане.
   Своих планов может быть несколько, у каждого имя. Журнал, разминка, подсказки веса и режим тренировки — общие. */
const CUSTOM_MAX = 12, CUSTOM_NAME = 24;
const CUSTOM_REPS = /^(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?$/;
let cpTab = null, cpOpen = new Set(), cpDel = false, cpMsg = '';

function cleanCustomItem(it) {
  if (!it || !EXI[it.id]) return null;
  const o = {id:it.id};
  if (Number.isInteger(it.sets) && it.sets >= 1 && it.sets <= 10) o.sets = it.sets;
  const m = typeof it.reps === 'string' && it.reps.trim().match(CUSTOM_REPS);
  if (m && +m[1] >= 1 && (!m[2] || +m[2] >= +m[1])) o.reps = m[2] ? `${+m[1]}–${+m[2]}` : String(+m[1]);
  if (Number.isInteger(it.rest) && it.rest >= 0 && it.rest <= 600) o.rest = it.rest;
  return o;
}
/* настройки из хранилища или резервной копии: только известные упражнения и разумные значения */
function ensureCustoms(s) {
  s.fav = Array.isArray(s.fav) ? [...new Set(s.fav.filter(id => typeof id === 'string' && EXI[id]))] : [];
  const seen = new Set();
  s.customs = (Array.isArray(s.customs) ? s.customs : []).filter(c => c && typeof c.id === 'string' && !seen.has(c.id) && seen.add(c.id)).map(c => {
    const ids = new Set();
    return {id:c.id, name:String(c.name || '').trim().slice(0, CUSTOM_NAME) || 'Мой план',
      items:(Array.isArray(c.items) ? c.items : []).map(cleanCustomItem).filter(it => it && !ids.has(it.id) && ids.add(it.id)).slice(0, CUSTOM_MAX)};
  });
  if (!s.customs.length) s.customs.push({id:'c1', name:'Мой план', items:[]});
  if (!s.customs.some(c => c.id === s.custom)) s.custom = s.customs[0].id;
  if (!MODES[s.mode]) s.mode = 'single';
  return s;
}
function customOf(s = S) { return s.customs.find(c => c.id === s.custom) || s.customs[0]; }
ensureCustoms(S);

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
  if (!o || rx.static) return rx;
  const r = {...rx, edited:!!(o.sets || o.reps || o.rest !== undefined)};
  if (o.sets) r.sets = o.sets;
  if (o.reps && !ex.kind) { r.reps = o.reps; r.work = midOf(o.reps) * GOALS[S.goal].rep * (ex.uni ? 2 : 1); }
  if (o.rest !== undefined) r.rest = o.rest;
  return r;
}

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
function customSetupHtml() {
  const c = customOf();
  return `<div class="places cp-plans" role="group" aria-label="Свои планы">${S.customs.map(p => `<button type="button" class="place${p.id === c.id ? ' on' : ''}" data-cp-plan="${p.id}" aria-pressed="${p.id === c.id}"><b>${esc(p.name)}</b><small>${p.items.length ? p.items.length + ' ' + plural(p.items.length, 'упражнение', 'упражнения', 'упражнений') : 'пусто'}</small></button>`).join('')}`
    + `<button type="button" class="place place-add" data-cp-new="1">+ План</button></div>`
    + `<div class="place-tools"><label class="place-name">Название<input id="cp-name" type="text" maxlength="${CUSTOM_NAME}" value="${esc(c.name)}" autocomplete="off"></label>`
    + (S.customs.length > 1 ? `<button type="button" class="place-del${cpDel ? ' armed' : ''}" data-cp-del="1">${cpDel ? 'Точно удалить?' : 'Удалить план'}</button>` : '') + `</div>`;
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
        ${o.sets || o.reps || o.rest !== undefined ? `<button type="button" class="btn-ghost cp-reset" data-cp-reset="${slot}">Как по цели</button>` : ''}
      </div>`;
  return `<div class="cp-tools">
    <button type="button" class="btn-ghost" data-cp-move="${slot}" data-d="-1" aria-label="Выше"${slot === 0 ? ' disabled' : ''}>↑</button>
    <button type="button" class="btn-ghost" data-cp-move="${slot}" data-d="1" aria-label="Ниже"${slot >= n - 1 ? ' disabled' : ''}>↓</button>
    <button type="button" class="btn-ghost" data-cp-edit="${slot}" aria-expanded="${open}">${r.edited ? 'Изменено' : 'Подходы и отдых'}</button>
    <button type="button" class="btn-ghost cp-rm" data-cp-rm="${slot}">Убрать</button>
  </div>${open ? `<div class="cp-edit">${edit}</div>` : ''}`;
}
function customEmptyHtml() {
  return `<div class="empty cp-empty"><h2>План пока пустой</h2><p>Добавьте упражнения из избранного или из списка по выбранным мышцам. Подходы, повторы и отдых подставятся по цели и формату — их можно поправить в карточке.</p></div>`;
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
  if (t.dataset.cpGo !== undefined) { if (document.querySelector('#motion-view')?.open) closeMotion(); S.view = 'plan'; S.mode = 'custom'; S.day = 0; regen(); window.scrollTo({top:0}); return; }
  if (t.dataset.cpOpen) { openMotionItem(previewItem(t.dataset.cpOpen)); return; }
  if (t.dataset.cpMore) { for (const li of document.querySelectorAll(`[data-cp-g="${t.dataset.cpMore}"]`)) li.hidden = false; t.closest('li').remove(); return; }
  if (t.dataset.cpTab) { cpTab = t.dataset.cpTab; for (const b of document.querySelectorAll('[data-cp-tab]')) { const on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); } $('#cp-list').innerHTML = customListHtml(); return; }
  if (t.dataset.cpPlan) { S.custom = t.dataset.cpPlan; cpOpen = new Set(); cpDel = false; return regen(); }
  if (t.dataset.cpNew !== undefined) {
    const id = 'c' + Date.now().toString(36);
    S.customs.push({id, name:'План ' + (S.customs.length + 1), items:[]}); S.custom = id; cpOpen = new Set(); cpDel = false; regen();
    const inp = $('#cp-name'); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (t.dataset.cpDel !== undefined) {
    if (!cpDel) { cpDel = true; return renderSetup(); }
    S.customs = S.customs.filter(c => c.id !== S.custom); cpDel = false; cpOpen = new Set(); ensureCustoms(S); return regen();
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
  if (t.dataset.cpReset !== undefined) { const s = +t.dataset.cpReset; for (const k of ['sets', 'reps', 'rest']) customSet(s, k, null); return customRerender(`[data-cp-edit="${s}"]`); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'cp-name') { const v = t.value.trim().slice(0, CUSTOM_NAME); if (v) customOf().name = v; saveSettings(); renderSetup(); if (S.mode === 'custom' && S.view === 'plan') renderPlan(); return; }
  if (t.dataset.cpReps !== undefined) {
    const s = +t.dataset.cpReps, ok = cleanCustomItem({id:customOf().items[s]?.id, reps:t.value});
    if (ok && ok.reps) customSet(s, 'reps', ok.reps); else { t.value = plan.items.find(x => x.slot === s)?.rx.reps || ''; return; }
    return customRerender(`[data-cp-reps="${s}"]`);
  }
  if (t.dataset.cpRest !== undefined) { const s = +t.dataset.cpRest; customSet(s, 'rest', +t.value); return customRerender(`[data-cp-rest="${s}"]`); }
});
