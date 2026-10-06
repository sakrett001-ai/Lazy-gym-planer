/* ===================== РАЗМИНКА И БЛИНЫ ===================== */
const GEAR_KEY = 'podhod.gear.v1';
const GEAR = {bar:20, plates:[25, 20, 15, 10, 5, 2.5, 1.25], dbStep:2, machineStep:5};
const PLATE_SETS = {
  std:{name:'Стандарт', plates:[25, 20, 15, 10, 5, 2.5, 1.25]},
  home:{name:'Домашний', plates:[20, 10, 5, 2.5, 1.25]},
  fine:{name:'С мелкими', plates:[25, 20, 15, 10, 5, 2.5, 1.25, 0.5]}
};
function gearLoad() { try { const g = JSON.parse(localStorage.getItem(GEAR_KEY) || 'null'); if (g && typeof g === 'object') { if (isFinite(g.bar)) GEAR.bar = +g.bar; if (Array.isArray(g.plates)) GEAR.plates = g.plates.map(Number).filter(v => v > 0).sort((a, b) => b - a); } } catch (e) {} }
function gearSave() { try { localStorage.setItem(GEAR_KEY, JSON.stringify({bar:GEAR.bar, plates:GEAR.plates})); } catch (e) {} }
gearLoad();

/* чем нагружают: штанга (гриф + блины), гантели, тренажёр (стек), гиря */
function implementOf(it) {
  const ids = it.eqIds || [];
  if (ids.includes('bb') || ids.includes('smith')) return 'bb';
  if (ids.includes('db')) return 'db';
  if (ids.includes('kb')) return 'kb';
  if (ids.some(i => MACHINE.has(i) || i === 'legpress')) return 'machine';
  return null;
}
/* раскладка блинов на одну сторону грифа; возвращает {side:[...], total, diff} */
function plateSplit(target, bar = GEAR.bar, plates = GEAR.plates) {
  let perSide = (target - bar) / 2, side = [];
  if (perSide <= 0) return {side, total:bar, diff:target - bar};
  for (const p of plates) while (perSide >= p - 1e-9) { side.push(p); perSide -= p; }
  const total = bar + 2 * side.reduce((a, b) => a + b, 0);
  return {side, total, diff:target - total};
}
/* ближайший достижимый вес (вниз) */
function roundToGear(target, impl) {
  if (impl === 'bb') return plateSplit(target).total;
  if (impl === 'db') return Math.round(target / GEAR.dbStep) * GEAR.dbStep;
  if (impl === 'machine') return Math.round(target / GEAR.machineStep) * GEAR.machineStep;
  if (impl === 'kb') return Math.round(target / 4) * 4;
  return Math.round(target * 2) / 2;
}
/* пирамида разминки: от грифа/лёгкого к рабочему; число шагов зависит от веса */
function warmupPlan(work, impl, reps) {
  if (!work || work <= 0) return [];
  const [lo] = parseRange(reps);
  const steps = [];
  if (impl === 'bb') {
    if (work <= GEAR.bar * 1.6) return [{kg:GEAR.bar, reps:Math.max(8, lo + 4), note:'пустой гриф'}];
    steps.push({kg:GEAR.bar, reps:10, note:'пустой гриф'});
  }
  const ratios = work >= 140 ? [0.4, 0.6, 0.75, 0.9] : work >= 90 ? [0.5, 0.7, 0.85] : work >= 50 ? [0.55, 0.8] : [0.6];
  const repsFor = r => r < 0.55 ? 8 : r < 0.72 ? 5 : r < 0.87 ? 3 : 1;
  for (const r of ratios) {
    const kg = roundToGear(work * r, impl);
    if (kg <= (steps.length ? steps[steps.length - 1].kg : 0) || kg >= work) continue;
    steps.push({kg, reps:repsFor(r), note:`${Math.round(r * 100)}%`});
  }
  return steps;
}
function platesHtml(target) {
  const s = plateSplit(target);
  if (!s.side.length && s.diff <= 0) return `<span class="pl-empty">пустой гриф ${fmtKg(GEAR.bar)}</span>`;
  const chips = s.side.map(p => `<i class="pl pl-${String(p).replace('.', '_')}" title="${fmtKg(p)} кг">${fmtKg(p)}</i>`).join('');
  const warn = s.diff > 0.01 ? `<small class="pl-diff">= ${fmtKg(s.total)}, не хватает ${fmtKg(s.diff)}</small>` : '';
  return `<span class="pl-row" aria-label="На каждую сторону: ${s.side.map(fmtKg).join(', ')} кг">${chips}</span>${warn}`;
}
function warmupHtml(it, work) {
  const impl = implementOf(it);
  if (!impl || !work) return '';
  const steps = warmupPlan(work, impl, it.rx.reps);
  if (!steps.length) return '';
  const rows = steps.map((s, i) => `<li><span class="wu-n">${i + 1}</span><span class="wu-kg">${fmtKg(s.kg)}<small>кг</small></span><span class="wu-r">× ${s.reps}</span><span class="wu-note">${s.note}</span>${impl === 'bb' ? `<span class="wu-pl">${s.note === 'пустой гриф' ? '' : platesHtml(s.kg)}</span>` : ''}</li>`).join('');
  const workRow = impl === 'bb' ? `<li class="wu-work"><span class="wu-n">→</span><span class="wu-kg">${fmtKg(work)}<small>кг</small></span><span class="wu-r">рабочий</span><span class="wu-note"></span><span class="wu-pl">${platesHtml(work)}</span></li>` : '';
  return `<details class="wu"><summary>Разминка к ${fmtKg(work)} кг<small>${steps.length} ${plural(steps.length, 'подход', 'подхода', 'подходов')}${impl === 'bb' ? ' · блины на сторону' : ''}</small></summary>
    <ol class="wu-list${impl === 'bb' ? ' wu-bb' : ''}">${rows}${workRow}</ol>
    <p class="wu-note-f">Отдых между разминочными 30–60 с. ${impl === 'bb' ? `Гриф ${fmtKg(GEAR.bar)} кг, блины: ${GEAR.plates.map(fmtKg).join(' · ')} — <button type="button" class="lk" data-gear="1">настроить</button>.` : impl === 'machine' ? 'Шаг стека принят 5 кг.' : ''}</p>
  </details>`;
}
/* рабочий вес для разминки: из первого введённого поля, иначе из подсказки */
function workWeightOf(it, card) {
  if (card) { const inp = card.querySelector('.lt-r:not(.done) [data-f="kg"], .lt-r [data-f="kg"]'); if (inp && inp.value) { const v = parseNum(inp.value); if (v > 0) return v; } }
  const sg = suggest(it); return sg.kg && sg.kg > 0 ? sg.kg : null;
}
function refreshWarmup(card) {
  if (!plan || !plan.items) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex); if (!it) return;
  const box = card.querySelector('.c-warm'); if (!box) return;
  const open = box.querySelector('details') && box.querySelector('details').open;
  box.innerHTML = warmupHtml(it, workWeightOf(it, card));
  if (open && box.querySelector('details')) box.querySelector('details').open = true;
}
/* настройка инвентаря */
function gearDialogHtml() {
  const cur = Object.entries(PLATE_SETS).find(([, v]) => v.plates.join() === GEAR.plates.join());
  return `<form method="dialog" class="gear">
    <h2>Гриф и блины</h2>
    <label>Вес грифа, кг<input id="gear-bar" type="text" inputmode="decimal" value="${fmtKg(GEAR.bar)}"></label>
    <p class="gear-l">Набор блинов</p>
    <div class="pres">${Object.entries(PLATE_SETS).map(([k, v]) => `<button type="button" class="pre${cur && cur[0] === k ? ' on' : ''}" data-pset="${k}">${v.name}</button>`).join('')}</div>
    <label>Свои блины, кг через запятую<input id="gear-plates" type="text" inputmode="decimal" value="${GEAR.plates.map(fmtKg).join(', ')}"></label>
    <p class="gear-hint">Калькулятор раскладывает блины на одну сторону от самого тяжёлого к лёгкому. Укажите те, что есть в зале.</p>
    <div class="gear-btns"><button type="button" class="btn btn-2" value="cancel" id="gear-cancel">Отмена</button><button type="submit" class="btn" id="gear-save">Сохранить</button></div>
  </form>`;
}
function openGear() {
  let d = $('#gear-view');
  if (!d) { d = document.createElement('dialog'); d.id = 'gear-view'; d.className = 'gear-view'; document.body.appendChild(d); }
  d.innerHTML = gearDialogHtml(); d.showModal();
  d.querySelector('form').addEventListener('submit', () => {
    const bar = parseNum($('#gear-bar').value); if (bar > 0) GEAR.bar = bar;
    const pl = $('#gear-plates').value.split(/[,;\s]+/).map(parseNum).filter(v => v > 0).sort((a, b) => b - a);
    if (pl.length) GEAR.plates = [...new Set(pl)];
    gearSave(); document.querySelectorAll('.card').forEach(refreshWarmup);
  });
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.gear) { openGear(); return; }
  if (t.dataset.pset) { $('#gear-plates').value = PLATE_SETS[t.dataset.pset].plates.map(fmtKg).join(', '); t.parentElement.querySelectorAll('.pre').forEach(b => b.classList.toggle('on', b === t)); return; }
  if (t.id === 'gear-cancel') { $('#gear-view').close(); return; }
});
document.addEventListener('input', e => {
  if (e.target.classList && e.target.classList.contains('lt-in') && e.target.dataset.f === 'kg') {
    const card = e.target.closest('.card'); if (card) { clearTimeout(card._wuT); card._wuT = setTimeout(() => refreshWarmup(card), 400); }
  }
});
