/* ===================== ПОИСК УПРАЖНЕНИЙ =====================
   Один поиск для атласа движений (витрина, 13c-gallery.js) и «Добавить упражнение» своего плана (11d-custom.js).
   Упражнение находится по названию на языке страницы (и с инвентарём — nameV, «Румынская тяга со штангой»), по названию
   на другом языке, по синонимам (зальный жаргон, сокращения, британские слова), по группе мышц («икры», «calves») и по
   мышце («широчайшие»). Синонимы, второй язык, предлоги и раскладка — данные src/data/search.json и i18n/search-data.js:
   сборка дописывает их в начало app.js (PODHOD_SEARCH) после перевода, поэтому русские слова есть и в английской версии.
   Без этих данных (проверки модулей по отдельности) поиск идёт по названиям на языке страницы.

   Сравнение по словам: регистр, «ё» и «е», дефисы и окончания не важны («т-гриф» — это «т», «гриф» и «тгриф»). Слово
   запроса совпадает со словом текста точно или основой (3) или по началу (2: само слово или основа от 4 букв — «lats» не
   начало «lateral»). Тексту нужны все слова запроса, кроме предлогов; группе и мышце — ещё и все слова своего названия
   («бицепс» — не «бицепс бедра»). Порядок — по среднему качеству слов, затем — сколько текста объясняет запрос
   (searchText); при равенстве — порядок каталога. Группа и мышца — ниже названий.
   Ступени, каждая — только если на прежних ничего: точно и по началу; внутри слова (основа от 4 букв: «экстензия» —
   «Гиперэкстензия»; раньше — нет, иначе «становая» находит «постановкой»); тот же запрос в другой раскладке клавиатуры
   (ghbctl → присед); с опечатками — расстояние Дамерау — Левенштейна по словам: 1 правка для слов из 4–7 букв, 2 — от 8.
   Так «жим», «тяга», «присед» не обрастают похожими словами. Ничего и тогда — ближайшие по написанию названия. */
const SEARCH = (typeof window !== 'undefined' && window.PODHOD_SEARCH) || {};
/* регистр и «ё»: ё раскладывается на е и две точки (U+0308), точки убираются; й остаётся собой */
const foldText = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/\u0308/g, '').normalize('NFC');
/* прежний вид (проверки): ещё и без дефисов */
const searchFold = s => foldText(s).replace(/[-\u2010-\u2015]/g, '');
const SEARCH_END = /(?:ями|ами|ого|его|ому|ему|ыми|ими|ой|ей|ий|ый|ая|яя|ое|ее|ие|ые|ую|юю|ом|ем|ам|ям|ах|ях|ов|ев|ия|ья|ье|ью|ию|[аяоеиыуюйь]|es|s)$/;
/* основа слова: без окончания, если остаётся от 3 букв */
const searchStem = w => { const st = w.replace(SEARCH_END, ''); return st.length >= 3 ? st : w; };
const SEARCH_STOP = new Set((SEARCH.stop || []).map(foldText));

/* слова текста: base — по порядку; all — ещё слитные: части через дефис или апостроф вместе («т-гриф» → «тгриф»,
   «farmer’s» → «farmers»), у текста из 2–3 слов — всё слитно («benchpress»); cov — какие слова base покрывает слово all */
function searchTokens(text) {
  const base = [], all = [], cov = [];
  for (const chunk of foldText(text).split(/[\s,.;:!?()«»"“”„/+&]+/u)) {
    const parts = chunk.split(/[^\p{L}\p{N}]+/u).filter(Boolean), at = base.length;
    for (const p of parts) { cov.push([base.length]); base.push(p); all.push(p); }
    if (parts.length > 1) { all.push(parts.join('')); cov.push(parts.map((p, i) => at + i)); }
  }
  if (base.length >= 2 && base.length <= 3 && !all.includes(base.join(''))) { all.push(base.join('')); cov.push(base.map((p, i) => i)); }
  const need = base.filter(w => !SEARCH_STOP.has(w)).length || base.length;
  return {base, all, st:all.map(searchStem), cov, need};
}
/* слова запроса: w — слово, s — основа, opt — предлог (может не совпасть), last — последнее (его ещё печатают:
   по началу совпадает и короткое), alt — сокращение («db» — «dumbbell») */
function searchQuery(q) {
  const words = searchTokens(q).base, words2 = SEARCH.words || {};
  const allStop = words.every(w => SEARCH_STOP.has(w));
  return words.map((w, k) => ({w, s:searchStem(w), opt:!allStop && SEARCH_STOP.has(w), last:k === words.length - 1,
    alt:(words2[w] || []).map(x => { const f = foldText(x); return {w:f, s:searchStem(f)}; })}));
}

/* расстояние Дамерау — Левенштейна (смежная перестановка — одна правка) от a до первых bl букв b; больше k — k + 1.
   Строки таблицы — общие буферы: поиск с опечатками сравнивает слово запроса со всем словарём */
let typoRows = [new Int16Array(64), new Int16Array(64), new Int16Array(64)];
function typoDist(a, b, k, bl = b.length) {
  if (Math.abs(a.length - bl) > k) return k + 1;
  if (bl + 1 > typoRows[0].length) typoRows = typoRows.map(() => new Int16Array(bl + 1));
  let p2 = typoRows[0], p = typoRows[1], c = typoRows[2];
  for (let j = 0; j <= bl; j++) p[j] = j;
  for (let i = 1; i <= a.length; i++) {
    c[0] = i; let low = i;
    const ai = a.charCodeAt(i - 1), ap = i > 1 ? a.charCodeAt(i - 2) : -1;
    for (let j = 1; j <= bl; j++) {
      const bj = b.charCodeAt(j - 1);
      let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (ai === bj ? 0 : 1));
      if (j > 1 && ai === b.charCodeAt(j - 2) && ap === bj) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v; if (v < low) low = v;
    }
    if (low > k) return k + 1;
    const t = p2; p2 = p; p = c; c = t;
  }
  return Math.min(p[bl], k + 1);
}
/* допуск опечаток по длине слова запроса */
const typoMax = w => w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0;
/* буквы слова — битами (код буквы по модулю 31): буквы основы запроса, которых нет в слове текста, — каждая хотя бы одна
   правка; больше допуска — расстояние не считается (нижняя оценка, ничего не теряется) */
const letterMask = w => { let m = 0; for (let i = 0; i < w.length; i++) m |= 1 << (w.charCodeAt(i) % 31); return m; };
const bitCount = x => { x -= x >>> 1 & 0x55555555; x = (x & 0x33333333) + (x >>> 2 & 0x33333333); return Math.imul(x + (x >>> 4) & 0x0F0F0F0F, 0x01010101) >>> 24; };
/* ступени поиска: SEARCH_START — точно и по началу, SEARCH_IN — ещё внутри слова, SEARCH_TYPO — ещё с опечатками */
const SEARCH_START = 0, SEARCH_IN = 1, SEARCH_TYPO = 2;
/* слово запроса q (или его сокращение f: w — слово, s — основа) против слова текста t (основа ts, буквы tm) на ступени
   level: 3 — точно, 2 — по началу, 1 — внутри слова, 0,4–0,5 — с опечаткой, 0 — нет */
function searchWord(q, f, t, ts, level, tm = -1) {
  if (t === f.w || ts === f.s) return 3;
  /* по началу — слово запроса или его основа от 4 букв: «lats» (основа «lat») — не «lateral» */
  if ((q.last || f.w.length > 2) && (t.startsWith(f.w) || (f.s.length >= 4 && t.startsWith(f.s)))) return 2;
  if (level >= SEARCH_IN && f.s.length >= 4 && t.includes(f.s)) return 1;
  const k = level >= SEARCH_TYPO ? typoMax(f.w) : 0;
  if (!k || bitCount(letterMask(f.s) & ~tm) > k) return 0;
  let d = Math.min(typoDist(f.w, t, k), typoDist(f.s, ts, k));
  /* опечатка в недопечатанном слове: «присидан» — начало «приседания» */
  if (d > 1 && t.length > f.w.length) d = Math.min(d, typoDist(f.w, t, k, f.w.length));
  return d <= k ? .6 - .1 * d : 0;
}
/* оценки слов запроса по словарю (words, stems): у каждого слова запроса — массив оценок по всем словам словаря.
   Слово сравнивается с каждым словом словаря один раз, а не в каждом тексте */
function searchScores(qs, words, stems, level, masks) {
  return qs.map(q => {
    const out = new Float32Array(words.length);
    for (const f of [q, ...q.alt]) for (let i = 0; i < words.length; i++) { const v = searchWord(q, f, words[i], stems[i], level, masks ? masks[i] : -1); if (v > out[i]) out[i] = v; }
    return out;
  });
}
/* текст T (его слова — номера в словаре, T.ids) против запроса с оценками sc: 0 — не подходит; иначе среднее качество
   слов × 10, затем — сколько текста объясняет запрос: весь текст (+3: «подтягивания» — сначала «Подтягивания»), у запроса
   из нескольких слов — доля слов текста (до +2), запрос начинается с первого слова текста (+1: «тяга гантели» — сначала
   «Тяга гантели…», а не «Румынская тяга с гантелями»). У запроса из одного слова доля не важна: «жим» — по порядку
   каталога, а не короткие названия первыми. full — у группы и мышцы запрос покрывает все слова названия */
function searchText(qs, sc, T, full, bonus = 0) {
  let sum = 0, n = 0, start = false; const hit = new Set();
  for (let k = 0; k < qs.length; k++) {
    let best = 0, at = -1;
    for (let j = 0; j < T.ids.length; j++) { const v = sc[k][T.ids[j]]; if (v > best) { best = v; at = j; } }
    if (!best) { if (qs[k].opt) continue; return 0; }
    if (!n && T.cov[at][0] === 0) start = true;
    sum += best; n++; for (const i of T.cov[at]) if (!SEARCH_STOP.has(T.base[i])) hit.add(i);
  }
  if (!n) return 0;
  const cover = Math.min(1, hit.size / T.need);
  if (full && cover < 1) return 0;
  return sum / n * 10 + (cover === 1 ? 3 : n > 1 ? cover * 2 : 0) + (start ? 1 : 0) + bonus;
}
/* тексты: у упражнения — названия на языке страницы (с небольшим перевесом), на другом языке и синонимы; у групп и мышц —
   свои. Слова всех текстов — в общем словаре (words, stems) */
let searchIdx = null;
function searchIndex() {
  if (searchIdx) return searchIdx;
  const A = SEARCH.alt || {}, Y = SEARCH.syn || {}, of = (o, id) => (o && o[id]) || [];
  const vocab = new Map(), words = [], stems = [];
  const texts = (list, bonus) => list.filter(Boolean).map(s => {
    const T = searchTokens(s);
    T.ids = T.all.map(w => { let i = vocab.get(w); if (i === undefined) { i = words.length; vocab.set(w, i); words.push(w); stems.push(searchStem(w)); } return i; });
    T.bonus = bonus; return T;
  });
  const ex = EX.map((e, i) => ({ex:e, i, texts:texts([e.name, ...Object.values(e.nameV || {})], .2).concat(texts(of(A.ex, e.id), .1), texts(of(Y.ex, e.id), 0))}));
  const named = (ids, own, a, y) => ids.map(id => ({id, texts:texts([own(id), ...of(a, id), ...of(y, id)], 0)}));
  const groups = named(GROUPS.map(g => g.id), id => GN[id], A.groups, Y.groups), muscles = named(Object.keys(MUSCLE_NAMES), id => MUSCLE_NAMES[id], A.muscles, Y.muscles);
  return (searchIdx = {ex, groups, muscles, words, stems, masks:Int32Array.from(words, letterMask)});
}
const searchBest = (qs, sc, texts, full) => texts.reduce((m, T) => Math.max(m, searchText(qs, sc, T, full, T.bonus)), 0);
/* упражнения по запросу, лучшие первыми. Группа совпала — её упражнения (без мышц: «квадрицепс» — не всё кардио с
   квадрицепсом); группы нет — упражнения, где мышца основная */
function searchRank(qs, level) {
  const I = searchIndex(), sc = searchScores(qs, I.words, I.stems, level, I.masks), g = {}, m = {};
  for (const x of I.groups) { const v = searchBest(qs, sc, x.texts, true); if (v) g[x.id] = v * .6; }
  if (!Object.keys(g).length) for (const x of I.muscles) { const v = searchBest(qs, sc, x.texts, true); if (v) m[x.id] = v * .55; }
  const out = [];
  for (const e of I.ex) {
    let v = searchBest(qs, sc, e.texts, false);
    if (g[e.ex.g]) v = Math.max(v, g[e.ex.g]);
    for (const p of e.ex.pri) if (m[p]) v = Math.max(v, m[p]);
    if (v) out.push({ex:e.ex, i:e.i, v});
  }
  return out.sort((a, b) => b.v - a.v || a.i - b.i).map(x => x.ex);
}
/* запрос в другой раскладке: латиница → кириллица или наоборот (одна и та же клавиша); null — не переключить */
function searchLayout(q) {
  const L = SEARCH.layout; if (!L || L.en.length !== L.ru.length) return null;
  const s = String(q).toLowerCase(), lat = /[a-z]/.test(s), cyr = /[а-яё]/.test(s);
  if (lat === cyr) return null;
  const [from, to] = lat ? [L.en, L.ru] : [L.ru, L.en];
  const out = [...s].map(c => { const i = from.indexOf(c); return i < 0 ? c : to[i]; }).join('');
  return out !== s ? out : null;
}
/* ближайшие по написанию названия, когда ничего не нашлось: до трёх, у которых каждое слово запроса — не дальше
   половины своей длины от слова названия или синонима (или от его начала) */
function searchNear(qs) {
  const words = qs.filter(q => !q.opt); if (!words.length) return [];
  const I = searchIndex();
  /* доля правок слова запроса до каждого слова словаря; дальше половины — Infinity */
  const dist = words.map(q => {
    const k = Math.max(1, Math.floor(q.w.length / 2)), out = new Float32Array(I.words.length);
    const qm = letterMask(q.w);
    I.words.forEach((t, i) => { const d = bitCount(qm & ~I.masks[i]) > k ? k + 1 : Math.min(typoDist(q.w, t, k), t.length > q.w.length ? typoDist(q.w, t, k, q.w.length) : k + 1); out[i] = d > k ? Infinity : d / q.w.length; });
    return out;
  });
  const out = [];
  for (const e of I.ex) {
    let best = Infinity;
    for (const T of e.texts) best = Math.min(best, dist.reduce((sum, D) => sum + Math.min(...T.ids.map(i => D[i])), 0) / words.length);
    if (best < Infinity) out.push({ex:e.ex, i:e.i, v:best});
  }
  return out.sort((a, b) => a.v - b.v || a.i - b.i).slice(0, 3).map(x => x.ex);
}
/* Поиск по каталогу: {list — упражнения, лучшие первыми (пустой запрос — весь каталог по порядку), mode — 'all' (пустой
   запрос) | 'exact' | 'layout' (нашлось в другой раскладке, as — этот запрос) | 'typo' (с опечатками) | 'none',
   near — ближайшие по написанию, когда ничего нет}. Последний запрос запоминается: витрина считает его для каждого фильтра */
let searchMemo = null;
function searchExercises(query) {
  const q = String(query ?? '').trim();
  if (searchMemo && searchMemo.q === q) return searchMemo.r;
  const qs = searchQuery(q);
  let r;
  if (!qs.length) r = {list:EX.slice(), mode:'all', as:null, near:[]};
  else {
    const lq = searchLayout(q), ls = lq && searchQuery(lq);
    let list = searchRank(qs, SEARCH_START), mode = 'exact', as = null;
    if (!list.length) list = searchRank(qs, SEARCH_IN);
    if (!list.length && ls) { list = searchRank(ls, SEARCH_IN); mode = 'layout'; as = lq; }
    if (!list.length) { list = searchRank(qs, SEARCH_TYPO); mode = 'typo'; as = null; }
    if (!list.length && ls) { list = searchRank(ls, SEARCH_TYPO); as = lq; }
    if (!list.length) { mode = 'none'; as = null; }
    r = {list, mode, as, near:mode === 'none' ? searchNear(qs) : []};
  }
  searchMemo = {q, r};
  return r;
}
/* пояснение над найденным (витрина атласа, «Добавить упражнение»): запрос в другой раскладке или с опечатками */
function searchNoteText(R) {
  if (R.mode === 'layout') return `Показано для «${R.as}» — запрос в другой раскладке клавиатуры.`;
  if (R.mode === 'typo') return R.as ? `Точных совпадений нет — показаны похожие на «${R.as}» (другая раскладка).` : 'Точных совпадений нет — показаны похожие по написанию.';
  return '';
}
/* Совпадение одного текста со всем запросом (по словам, и внутри слова, без опечаток): searchMatcher(q)(название) — true или false */
function searchMatcher(query) {
  const qs = searchQuery(query);
  return qs.length ? name => { const T = searchTokens(name); T.ids = T.all.map((w, i) => i); return searchText(qs, searchScores(qs, T.all, T.st, SEARCH_IN), T, false) > 0; } : () => true;
}
