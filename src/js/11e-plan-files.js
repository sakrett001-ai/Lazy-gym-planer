/* ===================== ФАЙЛЫ ПЛАНОВ =====================
   Свои планы выгружаются в JSON и загружаются обратно — свои, от тренера, для ученика. Формат описан в docs/plan-format.md.
   Упражнения хранятся кодами каталога (общими для русской и английской версий), название — для чтения человеком.
   Подходы, повторы и отдых пишутся явно, как их видно в плане, — у получателя план выглядит так же. */
const PLAN_FILE = 'lazy-gym-planner/plans', PLAN_FILE_V = 1, PLAN_FILE_MAX = 256 * 1024, PLAN_FILE_PLANS = 50;
let planIn = null;

/* план с его целью, форматом и уровнем: дозировка считается так, как её видит владелец плана */
function withPlanSettings(c, fn) {
  const keep = PLAN_KEYS.map(k => S[k]);
  for (const k of PLAN_KEYS) if (c[k]) S[k] = c[k];
  try { return fn(); } finally { PLAN_KEYS.forEach((k, i) => { S[k] = keep[i]; }); }
}
function exportItem(c, item) {
  const ex = EXI[item.id];
  return withPlanSettings(c, () => {
    const rx = customRx(prescribe(ex, null, effEquip(EQUIP.map(e => e.id))), item, ex), o = {id:ex.id, name:ex.name};
    if (!rx.static) {
      if (S.format !== 'circuit') { o.sets = rx.sets; o.rest = rx.rest; }
      if (!ex.kind) o.reps = item.reps || (S.format === 'circuit' ? GOALS[S.goal].circ.reps : String(rx.reps));
      if (item.tempo) o.tempo = item.tempo;
    } else if (item.sets) o.sets = item.sets; /* статодинамика: число серий человек задаёт сам, остальное — метод */
    if (item.kg) o.kg = item.kg.length === 1 ? item.kg[0] : item.kg.slice();
    if (item.note) o.note = item.note;
    return o;
  });
}
function exportPlan(c) {
  const o = {name:c.name};
  for (const k of ['group', 'for', 'note']) if (c[k]) o[k] = c[k];
  for (const k of PLAN_KEYS) o[k] = c[k] || S.gen[k] || S[k];
  o.items = c.items.map(it => exportItem(c, it));
  return o;
}
function planFileObject(plans, from) {
  const o = {format:PLAN_FILE, version:PLAN_FILE_V, app:typeof window !== 'undefined' && window.PODHOD_VERSION || '', exported:new Date().toISOString().slice(0, 10)};
  if (from) o.from = from;
  o.plans = plans.map(exportPlan);
  return o;
}
/* имя файла латиницей: браузеры подменяют имя с кириллицей на «download» */
const TRANSLIT = {а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'h', ц:'ts', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya'};
function planFileName(plans) {
  const slug = v => String(v).toLowerCase().replace(/[а-яё]/g, ch => TRANSLIT[ch] ?? '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'plan';
  const c = plans[0], group = plans.length > 1 && plans.every(p => p.group && p.group === c.group) ? c.group : null;
  return `lazy-gym-${plans.length > 1 ? (group ? 'program-' + slug(group) : 'plans') : 'plan-' + slug(c.name)}.json`;
}

/* ---------- чтение файла: только известные поля, разумные значения, понятные ошибки ---------- */
function readPlanFile(text) {
  if (typeof text !== 'string' || !text.trim()) return {error:'Файл пустой.'};
  if (text.length > PLAN_FILE_MAX) return {error:'Файл слишком большой для плана.'};
  let o; try { o = JSON.parse(text); } catch (e) { return {error:'Это не файл плана: текст не читается как JSON. Возможно, файл обрезан при пересылке.'}; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return {error:'Это не файл плана.'};
  if (o.v && (o.log || o.settings || o.body)) return {error:'Это резервная копия приложения, а не план. Её восстанавливают в разделе «Журнал».'};
  const raw = Array.isArray(o.plans) ? o.plans : Array.isArray(o.items) ? [o] : null;
  if (!raw || (o.format && o.format !== PLAN_FILE)) return {error:'Это не файл плана Lazy Gym Planner.'};
  const newer = Number(o.version) > PLAN_FILE_V;
  const from = cleanText(o.from, CUSTOM_TEXT), plans = [], unknown = [];
  for (const p of raw.slice(0, PLAN_FILE_PLANS)) {
    if (!p || typeof p !== 'object') continue;
    const items = Array.isArray(p.items) ? p.items : [];
    for (const it of items) if (it && !EXI[it.id]) unknown.push(cleanText(it.name, 60) || cleanText(String(it.id || ''), 30) || '?');
    const c = cleanPlan({...p, items:items.map(it => it && typeof it === 'object' ? {...it, sets:Number.isInteger(it.sets) ? it.sets : undefined, rest:Number.isInteger(it.rest) ? it.rest : undefined} : it)}, '');
    if (from && !c.from) c.from = from;
    plans.push(c);
  }
  if (!plans.length) return {error:'В файле нет планов.'};
  return {plans, from, note:cleanText(o.note, CUSTOM_NOTE, true), unknown:[...new Set(unknown)], newer, cut:raw.length > PLAN_FILE_PLANS};
}
/* добавление: всегда новыми планами, занятые имена получают «(2)» */
function addPlans(plans) {
  const taken = S.customs.map(c => c.name), added = [];
  for (const p of plans) { const c = {...p, id:newPlanId(), name:uniquePlanName(p.name, taken)}; taken.push(c.name); S.customs.push(c); added.push(c); }
  saveSettings(); return added;
}

/* ---------- окно выгрузки ---------- */
function planOutScope(scope) {
  const c = customOf();
  return scope === 'all' ? S.customs.filter(p => p.items.length) : scope === 'group' && c.group ? S.customs.filter(p => p.group === c.group) : [c];
}
function planOutHtml() {
  const c = customOf(), group = c.group ? S.customs.filter(p => p.group === c.group).length : 0, all = S.customs.filter(p => p.items.length).length;
  const radio = (v, label, on, dis) => `<label class="po-opt"><input type="radio" name="po-scope" value="${v}"${on ? ' checked' : ''}${dis ? ' disabled' : ''}><span>${label}</span></label>`;
  const share = typeof navigator !== 'undefined' && navigator.canShare && typeof File === 'function';
  return `<form method="dialog" class="gear po">
    <h2>Выгрузить план</h2>
    <p class="gear-hint">Файл .json откроется в Lazy Gym Planner на любом телефоне или компьютере: «Свой план» → «Загрузить план». Журнал и веса из журнала в файл не попадают.</p>
    <fieldset class="po-set"><legend>Что выгрузить</legend>
      ${radio('one', `Этот план: ${esc(c.name)}`, true)}
      ${group > 1 ? radio('group', `Всю программу (${esc(c.group)}): ${group} ${plural(group, 'план', 'плана', 'планов')}`) : ''}
      ${all > 1 ? radio('all', `Все свои планы: ${all}`) : ''}
    </fieldset>
    <div class="ics-grid">
      <label>Для кого<input id="po-for" type="text" maxlength="${CUSTOM_TEXT}" value="${esc(c.for || '')}" placeholder="Имя ученика" autocomplete="off"></label>
      <label>От кого<input id="po-from" type="text" maxlength="${CUSTOM_TEXT}" value="${esc(S.author || '')}" placeholder="Ваше имя" autocomplete="off"></label>
    </div>
    <p class="p-hint" id="po-msg" role="status"></p>
    <div class="gear-btns po-btns">
      <button type="button" class="btn btn-2" id="po-close">Закрыть</button>
      <button type="button" class="btn btn-2" id="po-copy">Скопировать текст</button>
      ${share ? '<button type="button" class="btn btn-2" id="po-share">Поделиться</button>' : ''}
      <button type="button" class="btn" id="po-save">Сохранить файл</button>
    </div>
  </form>`;
}
function openPlanOut() {
  let d = $('#plan-out');
  if (!d) { d = document.createElement('dialog'); d.id = 'plan-out'; d.className = 'gear-view'; d.setAttribute('aria-label', 'Выгрузить план'); document.body.appendChild(d); }
  d.innerHTML = planOutHtml(); d.showModal();
}
function planOutPayload() {
  const scope = (document.querySelector('input[name="po-scope"]:checked') || {}).value || 'one', plans = planOutScope(scope);
  const forWho = cleanText($('#po-for').value, CUSTOM_TEXT), from = cleanText($('#po-from').value, CUSTOM_TEXT);
  S.author = from;
  /* «для кого» остаётся в самих планах: при следующей выгрузке подставится */
  for (const p of plans) { if (forWho) p.for = forWho; else delete p.for; }
  saveSettings();
  const obj = planFileObject(plans, from);
  return {plans, text:JSON.stringify(obj, null, 1) + '\n', name:planFileName(plans)};
}
async function planOutAction(kind) {
  const msg = $('#po-msg'), {plans, text, name} = planOutPayload();
  if (!plans.length || plans.every(p => !p.items.length)) { msg.textContent = 'В плане нет упражнений — выгружать нечего.'; return; }
  if (kind === 'copy') {
    try { await navigator.clipboard.writeText(text); msg.textContent = 'Текст файла скопирован. Его можно вставить в «Загрузить план» на другом устройстве.'; }
    catch (e) { msg.innerHTML = 'Скопировать автоматически не удалось. Выделите текст:<textarea readonly rows="5"></textarea>'; const ta = msg.querySelector('textarea'); ta.value = text; ta.focus(); ta.select(); }
    return;
  }
  if (kind === 'share') {
    try {
      const file = new File([text], name, {type:'application/json'});
      if (!navigator.canShare({files:[file]})) throw new Error('no files');
      await navigator.share({files:[file], title:plans.length > 1 ? 'Планы тренировок' : plans[0].name});
      msg.textContent = 'Отправлено.';
    } catch (e) { msg.textContent = e && e.name === 'AbortError' ? 'Отправка отменена.' : 'Поделиться файлом не получилось — сохраните его и отправьте вручную.'; }
    return;
  }
  const r = await saveFile(name, text, 'application/json');
  msg.textContent = r === 'ok' ? `Файл сохранён: ${name}` : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не получилось.';
}

/* ---------- окно загрузки ---------- */
function planInHtml() {
  const r = planIn;
  let body = '';
  if (r && r.error) body = `<p class="warn">${esc(r.error)}</p>`;
  else if (r) {
    /* общая программа и адресат — один раз сверху; у плана — только то, что отличает его от соседей */
    const groups = [...new Set(r.plans.map(p => p.group || ''))], common = groups.length === 1 && groups[0];
    const meta = [common ? `<span>программа: <b>${esc(common)}</b></span>` : '', r.from ? `<span>от: <b>${esc(r.from)}</b></span>` : '', r.plans[0].for ? `<span>для: <b>${esc(r.plans[0].for)}</b></span>` : ''].join('');
    const setup = p => [GOALS[p.goal]?.name, FORMATS[p.format]?.name, LEVELS[p.level]?.name].filter(Boolean).join(', ').toLowerCase();
    body = `${meta ? `<p class="cp-sub pi-meta">${meta}</p>` : ''}${r.note ? `<p class="c-note">${esc(r.note)}</p>` : ''}
      ${r.newer ? '<p class="warn">Файл сделан в более новой версии приложения: то, что эта версия не знает, будет пропущено. Обновите приложение.</p>' : ''}
      ${r.unknown.length ? `<p class="warn">Этой версии приложения неизвестны упражнения: ${esc(r.unknown.join(', '))}. Они будут пропущены.</p>` : ''}
      ${r.cut ? `<p class="warn">В файле больше ${PLAN_FILE_PLANS} планов — загрузятся первые ${PLAN_FILE_PLANS}.</p>` : ''}
      <fieldset class="po-set"><legend>Планы в файле</legend>${r.plans.map((p, i) => `<label class="po-opt pi-plan"><input type="checkbox" data-pi="${i}" checked><span><b>${esc(p.name)}</b><small>${p.items.length} ${plural(p.items.length, 'упражнение', 'упражнения', 'упражнений')}${setup(p) ? ` — ${setup(p)}` : ''}</small>${!common && p.group ? `<small>программа: ${esc(p.group)}</small>` : ''}</span></label>`).join('')}</fieldset>`;
  }
  return `<form method="dialog" class="gear pi">
    <h2>Загрузить план</h2>
    <p class="gear-hint">Выберите файл .json, который выгрузили из Lazy Gym Planner, — свой или от тренера. Планы добавятся к вашим, ничего не перезапишется.</p>
    <label class="btn btn-2 pi-file" for="pi-file">Выбрать файл</label><input type="file" id="pi-file" accept=".json,application/json,text/plain" hidden>
    <details class="pi-paste"${r && r.pasted && r.error ? ' open' : ''}><summary>или вставить текст файла</summary><textarea id="pi-text" rows="4" placeholder='{"format": "lazy-gym-planner/plans", …}'></textarea><button type="button" class="btn btn-2" id="pi-read">Прочитать</button></details>
    ${body}
    <p class="p-hint" id="pi-msg" role="status"></p>
    <div class="gear-btns"><button type="button" class="btn btn-2" id="pi-close">Закрыть</button>${r && r.plans ? `<button type="button" class="btn" id="pi-add">Добавить в свои планы</button>` : ''}</div>
  </form>`;
}
function openPlanIn() {
  planIn = null;
  let d = $('#plan-in');
  if (!d) { d = document.createElement('dialog'); d.id = 'plan-in'; d.className = 'gear-view'; d.setAttribute('aria-label', 'Загрузить план'); document.body.appendChild(d); }
  d.innerHTML = planInHtml(); d.showModal();
}
function showPlanIn(result) { planIn = result; $('#plan-in').innerHTML = planInHtml(); const f = $('#pi-add') || $('#pi-close'); if (f) f.focus(); }

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'plan-export') { openPlanOut(); return; }
  if (t.id === 'po-close') { $('#plan-out').close(); return; }
  if (t.id === 'po-save') { planOutAction('save'); return; }
  if (t.id === 'po-share') { planOutAction('share'); return; }
  if (t.id === 'po-copy') { planOutAction('copy'); return; }
  if (t.dataset.cpImport !== undefined) { openPlanIn(); return; }
  if (t.id === 'pi-close') { $('#plan-in').close(); return; }
  if (t.id === 'pi-read') { showPlanIn({...readPlanFile($('#pi-text').value), pasted:true}); return; }
  if (t.id === 'pi-add') {
    const pick = [...document.querySelectorAll('[data-pi]')].filter(x => x.checked).map(x => planIn.plans[+x.dataset.pi]);
    if (!pick.length) { $('#pi-msg').textContent = 'Отметьте хотя бы один план.'; return; }
    const added = addPlans(pick); $('#plan-in').close(); planIn = null;
    openCustom(added[0].id); regen(); window.scrollTo({top:0});
    return;
  }
});
document.addEventListener('change', e => {
  if (e.target.id !== 'pi-file') return;
  const f = e.target.files && e.target.files[0]; if (!f) return;
  if (f.size > PLAN_FILE_MAX) { showPlanIn({error:'Файл слишком большой для плана.'}); return; }
  const rd = new FileReader();
  rd.onload = () => showPlanIn(readPlanFile(String(rd.result || '')));
  rd.onerror = () => showPlanIn({error:'Файл не читается.'});
  rd.readAsText(f);
});
