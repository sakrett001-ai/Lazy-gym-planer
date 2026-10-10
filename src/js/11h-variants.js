/* ===================== ХВАТЫ И ПОСТАНОВКА РУК И СТОП =====================
   Один снаряд — разные хваты: подтягивания прямым и обратным хватом; верхний блок широким хватом, V-рукоятью
   и обратным хватом; горизонтальный блок V-рукоятью и широким хватом; жим лёжа обычным и узким; сгибания
   с супинацией и «молотом»; разгибания и сгибания на блоке прямой рукоятью и канатом; отжимания с обычной,
   широкой и узкой постановкой рук; жим ногами со стопами посередине, выше и ниже на платформе. Для человека
   это одна карточка с переключателем; внутри каждый хват — своё упражнение каталога: своя поза манекена,
   свои мышцы, свои метки нагрузки на суставы и свой вес в журнале (узким хватом обычно поднимают иначе,
   и подсказки «прибавьте» не смешиваются). Переключение меняет упражнение в той же карточке: место в плане и,
   в своём плане, дозировка сохраняются. В семью входят только упражнения на одном и том же инвентаре. */
const VARIANT_FAMILIES = [
  {id:'pullbar', what:'Хват', items:[['pullup', 'Прямой'], ['chinup', 'Обратный']]},
  {id:'latpull', what:'Хват', items:[['latpull', 'Широкий'], ['latpullv', 'V-рукоять'], ['latpulluh', 'Обратный']]},
  {id:'cablerow', what:'Хват', items:[['cablerow', 'V-рукоять'], ['cablerowwide', 'Широкий']]},
  {id:'bench', what:'Хват', items:[['bbbench', 'Обычный'], ['closegrip', 'Узкий']]},
  {id:'dbcurl', what:'Хват', items:[['dbcurl', 'Ладони вверх'], ['hammer', 'Молот']]},
  {id:'pushdown', what:'Рукоять', items:[['pushdown', 'Прямая'], ['ropepushdown', 'Канат']]},
  {id:'cablecurl', what:'Рукоять', items:[['cablecurl', 'Прямая'], ['ropecurl', 'Канат']]},
  {id:'legpress', what:'Постановка стоп', items:[['legpress', 'Обычно'], ['legpresshigh', 'Высоко'], ['legpresslow', 'Низко']]},
  {id:'pushup', what:'Постановка рук', items:[['pushup', 'Обычно'], ['widepush', 'Широко'], ['diamond', 'Узко']]}
];
const VARIANT_OF = Object.fromEntries(VARIANT_FAMILIES.flatMap(f => f.items.map(([id, label]) => [id, {family:f, label}])));

/* хваты, которые можно выбрать здесь и сейчас: есть инвентарь, по уровню, не нагружают бережёмые суставы */
function variantsFor(ex, E, taken = new Set()) {
  const v = VARIANT_OF[ex.id]; if (!v) return [];
  const lvlMax = S.level === 'beg' || S.goal === 'gentle' ? 2 : 3;
  const list = v.family.items.map(([id, label]) => ({ex:EXI[id], label}))
    .filter(x => x.ex && (x.ex === ex || (!taken.has(x.ex.id) && available(x.ex, E) && x.ex.lvl <= lvlMax && fitsBody(x.ex) && (S.format !== 'static' || staticOk(x.ex)))));
  return list.length > 1 ? list : [];
}
/* хват, который уже стоит в другой карточке плана, не предлагается: два одинаковых упражнения в плане не нужны */
function variantTaken() {
  const ids = new Set(plan && plan.items ? plan.items.map(x => x.ex.id) : []);
  if (S.mode === 'custom') for (const x of customOf().items) ids.add(x.id);
  return ids;
}
function variantRowHtml(it, E = plan && plan.E || effEquip(S.equip)) {
  const list = variantsFor(it.ex, E, variantTaken()); if (!list.length) return '';
  const what = VARIANT_OF[it.ex.id].family.what;
  return `<div class="c-var" role="group" aria-label="${what}"><span>${what}:</span>${list.map(x => {
    const on = x.ex === it.ex;
    return `<button type="button" class="${on ? 'on' : ''}" data-variant="${x.ex.id}" data-slot="${it.slot}" aria-pressed="${on}"${on ? '' : ` title="${esc(x.ex.name)}"`}>${esc(x.label)}</button>`;
  }).join('')}</div>`;
}
/* в истории упражнения — что записано другими хватами той же семьи */
function variantHistNote(ex) {
  const v = VARIANT_OF[ex.id]; if (!v) return '';
  const rows = v.family.items.filter(([id]) => id !== ex.id).map(([id, label]) => {
    const ss = (LOG.data[id] || []).filter(x => x.s.some(Boolean)); if (!ss.length) return '';
    const last = ss[ss.length - 1];
    return `<li><b>${esc(label)}</b> · ${ss.length} ${plural(ss.length, 'запись', 'записи', 'записей')}, последняя ${fmtDay(last.d, true)}: ${last.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</li>`;
  }).filter(Boolean);
  return rows.length ? `<div class="h-var"><p class="h-cap">Другие хваты — ведутся отдельно</p><ul>${rows.join('')}</ul></div>` : '';
}

document.addEventListener('click', e => {
  const t = e.target.closest('button[data-variant]'); if (!t || !plan || !plan.items) return;
  const slot = +t.dataset.slot, it = plan.items.find(x => x.slot === slot), next = EXI[t.dataset.variant];
  if (!it || !next || it.ex === next) return;
  /* в своём плане хват записывается в сам план (подходы, вес и заметка остаются); в собранном — как замена */
  if (S.mode === 'custom') { const item = customOf().items[slot]; if (!item || customOf().items.some(x => x.id === next.id)) return; item.id = next.id; saveSettings(); }
  else { const k = swapKey(); swaps[k] = swaps[k] || {}; swaps[k][slot] = next.id; }
  done = {}; renderPlan();
  const card = document.querySelector(`.card[data-slot="${slot}"]`), b = card && card.querySelector(`[data-variant="${next.id}"]`);
  if (b) b.focus({preventScroll:true});
});
