/* ===================== ПОДХОД: СНАРЯДЫ, СТОРОНЫ, ОБЩИЙ ВЕС ===================== */
/* Каталог. У каждого упражнения с гантелями или гирей (в eq или opt) — imp: сколько снарядов в руках (1 или 2) и sides:
   как работают стороны. both — обе сразу (жим гантелей лёжа, гоблет); alt — попеременно (подъём гантелей на бицепс,
   обратные выпады); one — одна сторона за раз (тяга гантели одной рукой). У alt и one повторы считаются на каждую
   сторону — это и есть uni. У остальных упражнений стороны — по uni, снаряд один: вес штанги, стека и блока — общий.

   Вес в журнале — вес одного снаряда (так владелец писал и раньше, история не пересчитывается). Рекорды, расчётный
   максимум, подсказки и автонастройка работают по нему, как раньше.

   Л/П — левая и правая сторона отдельно (переключатель у упражнений alt и one). Подход хранится обратно совместимо:
   [кг, повторы, отдых | null, {l:[кг | null, повторы], r:[кг | null, повторы]}]. Основные поля — СЛАБАЯ сторона: по ним
   идут прогрессия, подсказки, рекорды и старые версии приложения. Поле сторон действительно, только если основные поля
   совпадают со слабой стороной: если старая версия исправила вес или повторы, а стороны не тронула, стороны
   отбрасываются при чтении. */
const SIDE_MODES = ['both', 'alt', 'one'];
const sidesOf = ex => SIDE_MODES.includes(ex.sides) ? ex.sides : ex.uni ? 'one' : 'both';
/* повторы на каждую сторону — и переключатель Л/П */
const perSide = ex => sidesOf(ex) !== 'both';
/* попеременно чередуются руки (у каждой своя гантель) — в упражнениях на верх тела; ноги — в упражнениях на ноги,
   и тогда гантели в руках поднимаются в каждом повторе (обратные выпады) */
const armsAlternate = ex => sidesOf(ex) === 'alt' && !LOWER_G.has(ex.g);

/* ---------- чем нагружено упражнение ---------- */
/* снаряд: 'db' — гантели, 'kb' — гиря, 'bb' — штанга, 'x' — доп. вес без гантелей (жилет, пояс) у упражнений, где гантели
   по желанию, null — тренажёр, блок, вес тела */
const IMPLS = ['db', 'kb', 'bb', 'x'];
const FREE_IMPL = id => id === 'db' || id === 'kb' || id === 'bb';
/* у упражнения есть гантели или гиря — его снаряд записывается в журнал (eq у записи), чтобы общий вес считался верно */
const hasFreeWeights = ex => ex.eq.some(g => g.includes('db') || g.includes('kb')) || (ex.opt || []).includes('db') || (ex.opt || []).includes('kb');
/* снаряд по умолчанию — для записей без поля eq: первый из списка (как в полном зале), гантели по желанию — гантели */
function defaultImpl(ex) {
  for (const g of ex.eq) { const f = g.find(FREE_IMPL); if (f) return f; }
  if ((ex.opt || []).includes('db')) return 'db';
  if ((ex.opt || []).includes('kb')) return 'kb';
  return null;
}
/* снаряд карточки плана: выбранный инвентарь (eqIds) и инвентарь по желанию (has) */
function itemImpl(it) {
  const ex = it.ex, ids = it.eqIds;
  if (!Array.isArray(ids)) return defaultImpl(ex);
  for (const id of ['db', 'kb', 'bb']) if (ids.includes(id)) return id;
  for (const id of ['db', 'kb']) if ((ex.opt || []).includes(id)) return it.has && it.has(id) ? id : 'x';
  return null;
}
/* какие снаряды возможны у упражнения (для проверки поля eq записи) */
function implChoices(ex) {
  const out = new Set();
  for (const g of ex.eq) for (const id of g) if (FREE_IMPL(id)) out.add(id);
  for (const id of ex.opt || []) if (id === 'db' || id === 'kb') { out.add(id); out.add('x'); }
  return out;
}
/* снаряд записи журнала */
function sessionImpl(ex, s) { return s && IMPLS.includes(s.eq) && hasFreeWeights(ex) && implChoices(ex).has(s.eq) ? s.eq : defaultImpl(ex); }
/* поле eq записи: пишется у упражнений с гантелями или гирей, проверяется при восстановлении из копии */
function cleanImpl(ex, v) { return hasFreeWeights(ex) && IMPLS.includes(v) && implChoices(ex).has(v) ? v : null; }
/* снарядов в руках при этом снаряде: у гантелей и гири — из каталога, у штанги и прочего — один (вес общий) */
const impCount = (ex, impl) => (impl === 'db' || impl === 'kb') && ex.imp === 2 ? 2 : 1;
/* сколько снарядов поднимается за повтор одной стороны: попеременно руками — одна гантель, иначе все, что в руках */
const impPerRep = (ex, impl) => armsAlternate(ex) ? 1 : impCount(ex, impl);

/* подпись поля веса: полная (режим тренировки) и короткая (столбец таблицы в карточке); n — снарядов в руках */
function weightLabel(it) {
  const lt = loadType(it.ex);
  if (lt === 'none') return null;
  if (lt === 'assist') return {full:'Противовес, кг', short:'Противовес', n:1, impl:null};
  const impl = itemImpl(it), n = impCount(it.ex, impl);
  if (impl === 'db') return {full:n > 1 ? 'Вес одной гантели, кг' : 'Вес гантели, кг', short:'Гантель, кг', n, impl};
  if (impl === 'kb') return {full:n > 1 ? 'Вес одной гири, кг' : 'Вес гири, кг', short:'Гиря, кг', n, impl};
  return lt === 'extra' ? {full:'Доп. вес, кг', short:'Доп. кг', n:1, impl} : {full:'Вес, кг', short:'Вес, кг', n:1, impl};
}
/* «×2 = 40 кг» — вес двух снарядов в руках */
function pairTotalText(n, kg) { return n > 1 && kg > 0 ? `×${n} = ${fmtKg(kg * n)} кг` : ''; }

/* ---------- стороны подхода ---------- */
/* одна сторона: [кг | null, повторы]; кг — не меньше нуля, повторы (секунды, метры) — больше нуля */
function sidePair(p) {
  if (!Array.isArray(p) || p.length < 2) return null;
  const kg = p[0] == null || p[0] === '' ? null : Number(p[0]), reps = Number(p[1]);
  if ((kg !== null && !(Number.isFinite(kg) && kg >= 0 && kg < 1000)) || !(Number.isFinite(reps) && reps > 0 && reps < 100000)) return null;
  return [kg, reps];
}
/* слабая сторона: по расчётному максимуму, если у обеих есть вес; у удержаний, дистанции, противовеса и без веса —
   по повторам (секундам). При равенстве — меньше повторов, затем меньше вес; совсем поровну — левая */
function weakSide(l, r, ex) {
  const lt = loadType(ex), byE1rm = !ex.kind && (lt === 'kg' || lt === 'extra') && l[0] > 0 && r[0] > 0;
  const key = p => byE1rm ? [e1rm(p[0], p[1]), p[1], p[0]] : lt === 'assist' ? [p[1], -(p[0] || 0)] : [p[1], p[0] || 0];
  const a = key(l), b = key(r);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? 'l' : 'r';
  return 'l';
}
/* стороны записанного подхода или null: поле сторон проверено, основные поля — слабая сторона */
function setSides(x, ex) {
  if (!Array.isArray(x) || !x[3] || typeof x[3] !== 'object' || !perSide(ex)) return null;
  const l = sidePair(x[3].l), r = sidePair(x[3].r);
  if (!l || !r) return null;
  const w = weakSide(l, r, ex) === 'l' ? l : r;
  return w[0] === (x[0] ?? null) && w[1] === x[1] ? {l, r, weak:w === l ? 'l' : 'r'} : null;
}
/* подход из двух сторон: основные поля — слабая сторона; отдых (третье поле) — если есть, иначе пусто */
function makeSidedSet(l, r, ex, rest) {
  const L = sidePair(l), R = sidePair(r);
  if (!L || !R) return null;
  const w = weakSide(L, R, ex) === 'l' ? L : R, rf = restField(rest);
  return [w[0], w[1], rf || null, {l:L, r:R}];
}
/* подход из копии или чужого источника: [кг, повторы], отдых и стороны — если верны; неверное отбрасывается, подход остаётся */
function cleanSet(v, ex) {
  if (!Array.isArray(v) || !isFinite(+v[1])) return null;
  const o = [v[0] == null || v[0] === '' ? null : +v[0], +v[1]], r = restField(v[2]);
  const sd = ex && setSides([o[0], o[1], null, v[3]], ex);
  if (sd) o.push(r || null, {l:sd.l, r:sd.r}); else if (r) o.push(r);
  return o;
}

/* ---------- общий вес (тоннаж) ---------- */
/* Общий вес подхода, кг = вес одного снаряда × повторы × снарядов в повторе × сторон.
   both — × снарядов: жим гантелей 2 × 20 кг × 10 = 400 кг, гоблет 24 кг × 10 = 240 кг;
   one — × снарядов × 2 стороны: тяга гантели одной рукой 30 кг по 10 на сторону = 600 кг;
   alt руками — у каждой руки своя гантель, сторон две: попеременные сгибания 2 × 12 кг по 10 на руку = 240 кг;
   alt ногами — гантели в руках поднимаются в каждом повторе: обратные выпады с 2 × 10 кг по 10 на ногу = 400 кг.
   Л/П — сумма сторон, каждая — вес × повторы × снарядов в повторе.
   Считается только внешний вес: гантели, гиря, штанга, стек, доп. вес. Вес тела не входит — доля веса тела, которую
   двигает упражнение, разная (отжимания — около двух третей, подтягивания — почти весь), а взвешивания в день тренировки
   может не быть; без доп. веса общий вес — 0. Противовес гравитрона облегчает подход, удержания на время и дистанция —
   не «вес × повторы»: у них тоже 0. */
function tonnageApplies(ex) { const lt = loadType(ex); return !ex.kind && (lt === 'kg' || lt === 'extra'); }
function setTonnage(ex, x, impl = defaultImpl(ex)) {
  if (!Array.isArray(x) || !tonnageApplies(ex)) return 0;
  const n = impPerRep(ex, impl), sd = setSides(x, ex);
  const part = p => p[0] > 0 && p[1] > 0 ? p[0] * p[1] * n : 0;
  if (sd) return part(sd.l) + part(sd.r);
  return part([x[0], x[1]]) * (perSide(ex) ? 2 : 1);
}
function sessionTonnage(ex, s) {
  if (!s || !Array.isArray(s.s)) return 0;
  const impl = sessionImpl(ex, s);
  return s.s.reduce((a, x) => a + (x ? setTonnage(ex, x, impl) : 0), 0);
}
/* общий вес за день по всему журналу */
function dayTonnage(d, data = LOG.data) {
  let t = 0;
  for (const [id, ss] of Object.entries(data || {})) { const ex = EXI[id]; if (ex && Array.isArray(ss)) for (const s of ss) if (s && s.d === d) t += sessionTonnage(ex, s); }
  return t;
}
/* 4320 → «4 320»; в английской сборке — «4,320» */
function fmtTon(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, DEC === ',' ? ' ' : ','); }

/* ---------- текст подхода ---------- */
const pairText = p => (p[0] ? fmtKg(p[0]) + '×' : '') + p[1];
/* «20×10», с Л/П — «Л 12×10 · П 12×8» */
function setText(x, ex) { const sd = setSides(x, ex); return sd ? `${'Л'} ${pairText(sd.l)} · ${'П'} ${pairText(sd.r)}` : pairText(x); }
/* подходы записи (разметка): через « · »; если есть подход с Л/П — через «; », чтобы стороны не путались с подходами;
   подход с Л/П не переносится посередине */
function setsText(sets, ex) {
  const xs = sets.filter(Boolean), lr = xs.some(x => setSides(x, ex));
  return xs.map(x => lr ? `<span class="h-lr">${setText(x, ex)}</span>` : setText(x, ex)).join(lr ? '; ' : ' · ');
}
/* «слабая сторона — левая: догоняйте её» — если в записи стороны отличались и слабой всё время была одна и та же */
function weakSideNote(ex, s) {
  if (!s || !perSide(ex)) return '';
  const weak = new Set();
  for (const x of s.s || []) { const sd = x && setSides(x, ex); if (sd && (sd.l[0] !== sd.r[0] || sd.l[1] !== sd.r[1])) weak.add(sd.weak); }
  return weak.size === 1 ? (weak.has('l') ? 'Слабая сторона — левая: догоняйте её.' : 'Слабая сторона — правая: догоняйте её.') : '';
}

/* ---------- переключатель Л/П (запоминается для упражнения, по умолчанию выключен) ---------- */
function lrOn(ex) { return perSide(ex) && !!(S.lr && typeof S.lr === 'object' && S.lr[ex.id] === true); }
function lrSet(ex, on) {
  const m = {...(S.lr && typeof S.lr === 'object' ? S.lr : {})};
  if (on) m[ex.id] = true; else delete m[ex.id];
  S.lr = m; saveSettings();
}
/* из копии: только упражнения каталога со сторонами */
function cleanLr(v) {
  const o = {};
  if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k, on] of Object.entries(v)) if (on === true && EXI[k] && perSide(EXI[k])) o[k] = true;
  return o;
}
