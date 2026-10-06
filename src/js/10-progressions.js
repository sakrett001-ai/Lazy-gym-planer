/* ---------- прогрессии: от лёгкого к тяжёлому ---------- */
const PROGRESSIONS = [
  ['wallpush', 'inclinepush', 'kneepush', 'pushup', 'diamond', 'archer'],
  ['pikepush', 'declinepike'],
  ['towelrow', 'tablerow', 'invrow', 'pullup'],
  ['superman', 'ytw', 'reversesnow'],
  ['airsquat', 'lunge', 'revlunge', 'bulgarian', 'pistolbox'],
  ['bridge', 'glutebridge1', 'hipthrust'],
  ['sllift', 'nordic'],
  ['calfraise', 'calf1'],
  ['deadbug', 'birddog', 'plank', 'plankup', 'hollow'],
  ['crunch', 'bicycle', 'lyinglegraise', 'hangknee', 'legraise'],
  ['chairdip', 'benchdip', 'dip'],
  ['hang', 'chinup', 'pullup']
];
const PROG_NEXT = {}, PROG_PREV = {}, PROG_CHAIN = {};
PROGRESSIONS.forEach((chain, ci) => chain.forEach(id => { PROG_CHAIN[id] = ci; }));
for (const chain of PROGRESSIONS) chain.forEach((id, i) => { if (chain[i + 1]) PROG_NEXT[id] = chain[i + 1]; if (i) PROG_PREV[id] = chain[i - 1]; });
/* подсказка перехода: если дважды подряд все подходы на верхней границе без отягощения — следующий уровень */
function progressionHint(it) {
  const ex = it.ex;
  if (ex.kind || loadType(ex) === 'kg') return '';
  const past = pastSessions(ex.id);
  const [lo, hi] = parseRange(it.rx.reps);
  const topTwice = past.length >= 2 && past.slice(-2).every(s => { const sets = s.s.filter(Boolean); return sets.length && sets.every(x => x[1] >= hi && !(x[0] > 0)); });
  const nextId = PROG_NEXT[ex.id], prevId = PROG_PREV[ex.id];
  const lowTwice = past.length >= 2 && past.slice(-2).every(s => { const sets = s.s.filter(Boolean); return sets.length && sets.some(x => x[1] < lo); });
  if (topTwice && nextId && EXI[nextId]) return `<p class="prog prog-up"><b>↑</b><span>Две тренировки подряд на верхней границе. Следующая ступень: <button type="button" class="lk" data-prog="${nextId}">${esc(EXI[nextId].name)}</button>.</span></p>`;
  if (lowTwice && prevId && EXI[prevId]) return `<p class="prog prog-down"><b>↓</b><span>Дважды не дотянули до ${lo} повторов. Ступень легче: <button type="button" class="lk" data-prog="${prevId}">${esc(EXI[prevId].name)}</button>.</span></p>`;
  if (nextId || prevId) return `<p class="prog"><span>Ступени: ${prevId ? `<button type="button" class="lk" data-prog="${prevId}">легче</button>` : ''}${prevId && nextId ? ' · ' : ''}${nextId ? `<button type="button" class="lk" data-prog="${nextId}">тяжелее</button>` : ''}</span></p>`;
  return '';
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-prog]'); if (!t) return;
  const card = t.closest('.card'); if (!card || !plan) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex); if (!it) return;
  const target = EXI[t.dataset.prog]; if (!target) return;
  const E = plan.E; if (!available(target, E)) { t.textContent = 'нет оборудования'; return; }
  if (plan.items.some(x => x.ex.id === target.id)) { t.textContent = 'уже в плане'; return; }
  const k = swapKey(); swaps[k] = swaps[k] || {}; swaps[k][it.slot] = target.id; done = {}; renderPlan();
  const c2 = document.querySelector(`.card[data-slot="${it.slot}"]`); if (c2) { c2.classList.add('flash'); c2.scrollIntoView({block:'nearest'}); }
});

