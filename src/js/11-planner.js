/* ===================== ПЛАНИРОВЩИК ===================== */
const GOALS = {
  strength:{name:'Сила', hint:'3–6 повт.', reps:{c:'3–5', i:'6–8'}, sets:{c:5, i:3}, rest:{c:180, i:90}, tempo:'2-0-X-0',
    load:{c:'≈ 80–90% от 1ПМ, 1–2 повтора в запасе', i:'тяжело, 1–2 повтора в запасе'}, rep:3, time:'20–30 с', dist:'20 м',
    circ:{rounds:4, reps:'6–8', work:20, rest:30, roundRest:180}, ss:{rest:150}},
  mass:{name:'Масса', hint:'6–12 повт.', reps:{c:'6–10', i:'10–12'}, sets:{c:4, i:3}, rest:{c:120, i:75}, tempo:'3-0-1-0',
    load:{c:'≈ 70–80% от 1ПМ, 1–2 повтора в запасе', i:'1–2 повтора в запасе'}, rep:4, time:'30–45 с', dist:'30 м',
    circ:{rounds:3, reps:'10–12', work:30, rest:20, roundRest:120}, ss:{rest:90}},
  cut:{name:'Рельеф', hint:'12–20 повт.', reps:{c:'12–15', i:'15–20'}, sets:{c:3, i:3}, rest:{c:60, i:40}, tempo:'2-0-1-0',
    load:{c:'≈ 55–65% от 1ПМ, почти до отказа', i:'до выраженного жжения'}, rep:3, time:'45–60 с', dist:'40 м',
    circ:{rounds:4, reps:'15–20', work:40, rest:15, roundRest:90}, ss:{rest:60}}
};
const FORMATS = {classic:{name:'Классика', hint:'по подходам'}, superset:{name:'Суперсеты', hint:'пары без отдыха'}, circuit:{name:'Круговая', hint:'круги подряд'}};
const LEVELS = {beg:{name:'Новичок'}, mid:{name:'Средний'}, adv:{name:'Опытный'}};
const GROUP_W = {chest:1.3, back:1.5, shoulders:1, biceps:0.8, triceps:0.8, forearms:0.5, abs:0.8, glutes:1, quads:1.3, hams:1, calves:0.6, cardio:0.9};
const GROUP_ORDER = {quads:0, glutes:0, hams:1, back:2, chest:3, shoulders:4, triceps:5, biceps:5, forearms:6, calves:7, cardio:7.5, abs:8};
const REGION = {quads:'low', glutes:'low', hams:'low', calves:'low', chest:'push', shoulders:'push', triceps:'push', back:'pull', biceps:'pull', forearms:'pull', abs:'core', cardio:'cardio'};
const ANTAGONIST = {chest:'back', back:'chest', biceps:'triceps', triceps:'biceps', quads:'hams', hams:'quads', shoulders:'back', glutes:'abs', abs:'glutes'};
const PATTERN = {};
[['squat', 'squat goblet airsquat smithsquat legpress'], ['hinge', 'deadlift rdl kbswing hyper goodmorning sllift nordic'],
 ['hpush', 'pushup bbbench dbbench dip diamond closegrip wallpush inclinepush kneepush widepush archer'], ['ipush', 'dbincline smithincline inclinebb'], ['dpush', 'declinebb declinepush'],
 ['fly', 'dbfly cablefly pecdeck'], ['pullover', 'pullover straightpull'], ['vpull', 'pullup chinup latpull'], ['hrow', 'bbrow dbrow cablerow bandrow invrow towelrow tablerow'],
 ['vpush', 'dbpress ohp pikepush arnold declinepike'], ['raise', 'latraise bandlatraise cablelat'], ['rear', 'facepull bandfacepull reversefly ytw reversesnow superman'],
 ['curl', 'bbcurl dbcurl hammer cablecurl bandcurl preacher inclinecurl concentration towelcurl'], ['ext', 'skull pushdown bandpushdown ohext benchdip kickback chairdip'],
 ['lunge', 'lunge bulgarian stepup revlunge sidelunge pistolbox'], ['bridge', 'hipthrust bridge glutekick glutebridge1'], ['flex', 'crunch cablecrunch lyinglegraise legraise declinecrunch captainraise hangknee bicycle'],
 ['hold', 'plank sideplank rollout hollow plankup deadbug birddog wallsit'], ['side', 'sidebend'], ['calf', 'calfraise lpcalf calf1'], ['grip', 'farmer hang wristcurl'],
 ['jump', 'jumpingjack jumpsquat'], ['burpee', 'burpee thruster'], ['climb', 'mountain'],
 /* тренажёры и кардио (04b) */
 ['squat', 'hacksquat'], ['hpush', 'chestpressm smithbench assistdip'], ['fly', 'cablelowfly'], ['hrow', 'leverrowm tbarrow chestrowdb'], ['vpull', 'assistpull'], ['vpush', 'shoulderpressm smithohp'],
 ['ext', 'cableohext'], ['side', 'cablewood'], ['hinge', 'pullthrough'], ['bridge', 'cablekickback abduction'], ['adduct', 'adduction'], ['calf', 'seatedcalf standcalf'],
 ['run', 'treadmill stairs'], ['ride', 'bike elliptical'], ['row', 'rower']].forEach(([p, ids]) => ids.split(' ').forEach(id => PATTERN[id] = p));
/* желательность упражнения при равных условиях: вспомогательные и упрощённые варианты ниже */
const EX_W = {wallpush:0.5, kneepush:0.7, inclinepush:0.8, towelcurl:0.6, towelrow:0.75, tablerow:0.8, chairdip:0.75, wallsit:0.7, superman:0.8, bicycle:0.9, deadbug:0.85, birddog:0.85, sidelunge:0.85, revlunge:0.9, calf1:0.9, sidebend:0.8, concentration:0.85, kickback:0.85, declinepush:0.9, goodmorning:0.8, jumpingjack:0.9, hangknee:0.95, shrug:0.55, hyper:0.75, frontraise:0.75, wristcurl:0.6, hang:0.65, farmer:0.8, lpcalf:0.9, pikepush:0.8, benchdip:0.85, bandlatraise:0.9,
  bridge:0.85, airsquat:0.8, lyinglegraise:0.9, sideplank:0.9, stepup:0.9, smithsquat:0.85, smithincline:0.9, diamond:0.85, bandcurl:0.9, bandpushdown:0.9, bandrow:0.95};
const EXI = Object.fromEntries(EX.map(e => [e.id, e]));
const EQN = Object.fromEntries(EQUIP.map(e => [e.id, e.name]));
const GN = Object.fromEntries(GROUPS.map(g => [g.id, g.name]));

function effEquip(list) { const E = new Set(list); for (const id of list) for (const x of EQUIP_IMPLIES[id] || []) E.add(x); return E; }
/* как назвать оборудование в карточке: если горизонтальная скамья «получена» из регулируемой — так и пишем */
function eqName(id) {
  if (S.equip.includes(id)) return EQN[id];
  for (const [src, list] of Object.entries(EQUIP_IMPLIES)) if (list.includes(id) && S.equip.includes(src)) return EQN[src];
  return EQN[id];
}
/* ---------- недельная программа ---------- */
const MODES = {single:{name:'Тренировку', hint:'на один день'}, program:{name:'Программу', hint:'на неделю'}};
const DAY_T = {
  fa:{name:'Всё тело', g:['quads', 'chest', 'back', 'shoulders', 'biceps', 'abs']},
  fb:{name:'Всё тело', g:['hams', 'glutes', 'back', 'chest', 'triceps', 'abs']},
  fc:{name:'Всё тело', g:['quads', 'glutes', 'back', 'shoulders', 'chest', 'calves']},
  up:{name:'Верх', g:['chest', 'back', 'shoulders', 'biceps', 'triceps']},
  lo:{name:'Низ', g:['quads', 'hams', 'glutes', 'calves', 'abs']},
  push:{name:'Жим', g:['chest', 'shoulders', 'triceps']},
  pull:{name:'Тяга', g:['back', 'biceps', 'forearms']},
  legs:{name:'Ноги', g:['quads', 'hams', 'glutes', 'calves', 'abs']}
};
const SPLITS = {
  full:{name:'Всё тело', hint:'всё за раз', note:'Каждая тренировка нагружает всё тело, упражнения меняются от дня ко дню. Лучший вариант для новичков и при 2–3 тренировках.',
    days:{2:['fa', 'fb'], 3:['fa', 'fb', 'fc'], 4:['fa', 'fb', 'fc', 'fa']}},
  ul:{name:'Верх / низ', hint:'чередование', note:'Дни верха и низа чередуются, каждая мышца работает дважды в неделю.',
    days:{2:['up', 'lo'], 4:['up', 'lo', 'up', 'lo'], 5:['up', 'lo', 'up', 'lo', 'fa']}},
  ppl:{name:'Жим / тяга / ноги', hint:'три направления', note:'Толкающие мышцы, тянущие мышцы и ноги — в разные дни. При 5 тренировках добавляются дни верха и низа.',
    days:{3:['push', 'pull', 'legs'], 5:['push', 'pull', 'legs', 'up', 'lo']}}
};
const DEFAULT_SPLIT = {2:'full', 3:'full', 4:'ul', 5:'ppl'};
const SCHEDULE = {2:[0, 3], 3:[0, 2, 4], 4:[0, 1, 3, 4], 5:[0, 1, 2, 4, 5]};
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WD_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
/* мезоцикл: 4 недели с ростом нагрузки и разгрузкой */
const WEEKS = [
  {name:'Вход', rir:3, add:0, pct:{strength:'≈ 75–80%', mass:'≈ 65–70%', cut:'≈ 55–60%'},
    note:'Подберите рабочие веса так, чтобы в каждом подходе оставалось 3 повтора в запасе. Записывайте вес и повторы: от них строится прогресс следующих недель.'},
  {name:'Нагрузка', rir:2, add:1, pct:{strength:'≈ 80–85%', mass:'≈ 70–75%', cut:'≈ 60–65%'},
    note:'В базовых упражнениях добавляется подход. Вес увеличивайте по правилу двойной прогрессии, запас — 2 повтора.'},
  {name:'Пик', rir:1, add:1, pct:{strength:'≈ 85–90%', mass:'≈ 75–80%', cut:'≈ 65–70%'},
    note:'Самая тяжёлая неделя цикла: 1 повтор в запасе, техника без срывов. Если сон и самочувствие плохие, оставайтесь на нагрузке второй недели.'},
  {name:'Разгрузка', rir:4, deload:true, pct:{strength:'≈ 65–70%', mass:'≈ 55–60%', cut:'≈ 50–55%'},
    note:'Подходов примерно на 40% меньше, вес на 10–15% ниже. Это восстановление перед новым циклом, а не пропуск: мышцы растут, когда успевают восстановиться.'}
];

const DEFAULTS = {goal:'mass', format:'classic', level:'mid', count:6, groups:['chest', 'back', 'shoulders'], equip:EQUIP.map(e => e.id), seed:7,
  mode:'single', days:3, split:'full', week:1, day:0, view:'plan'};
const STORE = 'podhod.settings.v1';
function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.groups && s.equip) return Object.assign({}, DEFAULTS, s); } catch (e) {}
  return Object.assign({}, DEFAULTS);
}
function saveSettings() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

const S = loadSettings();
let swaps = {};
let eqOpen = false;
let placeDel = false;
let done = {};
let plan = null, prog = null;

/* ---------- утилиты ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const fmtRest = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} мин ${s % 60} с` : `${s / 60} мин`) : `${s} с`;
const midOf = r => { const m = String(r).match(/(\d+)\D+(\d+)/); if (m) return (+m[1] + +m[2]) / 2; const n = parseFloat(r); return isNaN(n) ? 10 : n; };
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; }
const fmtNum = v => Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');

function available(ex, E) { return ex.eq.every(grp => grp.some(id => E.has(id))); }
function chosenEquip(ex, E) {
  const ch = [];
  for (const grp of ex.eq) { const f = grp.find(id => E.has(id)); if (f) ch.push(f); }
  return ch;
}
function exName(ex, E) {
  if (ex.nameV) for (const id of chosenEquip(ex, E)) if (ex.nameV[id]) return ex.nameV[id];
  return ex.name;
}
function propHas(ex, E) {
  const ch = new Set(chosenEquip(ex, E));
  return id => ch.has(id) || ((ex.opt || []).includes(id) && E.has(id));
}
function equipLine(ex, E) {
  const ch = [...new Set(chosenEquip(ex, E).map(eqName))];
  const opt = (ex.opt || []).filter(id => E.has(id)).map(id => eqName(id).toLowerCase() + ' по желанию');
  if (!ch.length) return ['Без снаряжения'].concat(opt).join(' · ');
  return ch.concat(opt).join(' · ');
}
function groupsOf(ex) { const s = new Set([ex.g]); for (const m of ex.pri) s.add(MUSCLE_GROUP[m]); return s; }
function splitFor(days) { return SPLITS[S.split] && SPLITS[S.split].days[days] ? S.split : DEFAULT_SPLIT[days]; }

/* ---------- подбор ---------- */
function pickExercises(E, rand, groups, count, avoid) {
  const G = new Set(groups);
  const lvlMax = S.level === 'beg' ? 2 : 3;
  const pool = EX.filter(ex => available(ex, E) && ex.lvl <= lvlMax && (ex.g !== 'cardio' || G.has('cardio')));
  const totalW = groups.reduce((a, g) => a + GROUP_W[g], 0) || 1;
  const quota = {};
  for (const g of groups) quota[g] = count * GROUP_W[g] / totalW;
  const picked = [];
  const usedPat = {};
  const compBonus = {strength:0.7, mass:0.35, cut:0.05}[S.goal];
  const jitter = pool.map(() => rand());
  while (picked.length < count) {
    let best = null, bestScore = -1e9;
    pool.forEach((ex, i) => {
      if (picked.includes(ex)) return;
      const gs = groupsOf(ex);
      let gain = 0;
      if (G.has(ex.g)) gain += Math.max(quota[ex.g], 0) * 1.6 + 0.4;
      for (const g of gs) if (g !== ex.g && G.has(g)) gain += Math.max(quota[g], 0) * 0.5;
      if (gain <= 0) return;
      let sc = gain + (ex.type === 'c' ? compBonus : 0) + jitter[i] * 0.5 + ((EX_W[ex.id] ?? 1) - 1) * 1.4;
      if (ex.eq.length) sc += 0.25;
      if (S.goal === 'strength' && ex.eq.some(g => g.includes('bb'))) sc += 0.3;
      for (const m of ex.pri) if (!G.has(MUSCLE_GROUP[m])) sc -= 0.3;
      const pat = PATTERN[ex.id] || 'solo:' + ex.id;
      if (usedPat[pat]) sc -= 0.7 * usedPat[pat] + (picked.some(p => PATTERN[p.id] === pat && p.g === ex.g) ? 0.4 : 0);
      if (!G.has(ex.g)) sc -= 0.6;
      if (avoid && avoid.has(ex.id)) sc -= 1.1;
      if (typeof PROG_CHAIN !== 'undefined' && PROG_CHAIN[ex.id] !== undefined && picked.some(p => PROG_CHAIN[p.id] === PROG_CHAIN[ex.id])) sc -= 1.5;
      if (sc > bestScore) { bestScore = sc; best = ex; }
    });
    if (!best) break;
    picked.push(best);
    const bp = PATTERN[best.id] || 'solo:' + best.id; usedPat[bp] = (usedPat[bp] || 0) + 1;
    if (quota[best.g] !== undefined) quota[best.g] -= 1;
    for (const g of groupsOf(best)) if (g !== best.g && quota[g] !== undefined) quota[g] -= 0.45;
  }
  return {picked, pool};
}
function orderClassic(list) {
  return list.slice().sort((a, b) => {
    const ca = a.g === 'abs' ? 1 : 0, cb = b.g === 'abs' ? 1 : 0;
    if (ca !== cb) return ca - cb;
    const ta = a.type === 'c' ? 0 : 1, tb = b.type === 'c' ? 0 : 1;
    if (ta !== tb) return ta - tb;
    return GROUP_ORDER[a.g] - GROUP_ORDER[b.g];
  });
}
function pairSupersets(list) {
  const rest = orderClassic(list);
  const pairs = [];
  while (rest.length) {
    const a = rest.shift();
    if (!rest.length) { pairs.push([a]); break; }
    let bi = 0, bs = -1e9;
    rest.forEach((b, i) => {
      let s = 0;
      if (ANTAGONIST[a.g] === b.g) s += 3;
      if (b.g !== a.g) s += 1;
      const ga = groupsOf(a); for (const g of groupsOf(b)) if (ga.has(g)) s -= 1.2;
      s -= i * 0.15;
      if (s > bs) { bs = s; bi = i; }
    });
    pairs.push([a, rest.splice(bi, 1)[0]]);
  }
  return pairs;
}
function orderCircuit(list) {
  const by = {low:[], push:[], pull:[], core:[], cardio:[]};
  for (const ex of orderClassic(list)) by[REGION[ex.g]].push(ex);
  const keys = ['low', 'push', 'pull', 'cardio', 'core'].sort((a, b) => by[b].length - by[a].length);
  const out = [];
  while (out.length < list.length) {
    for (const k of keys) if (by[k].length) { if (out.length && REGION[out[out.length - 1].g] === k && keys.some(o => o !== k && by[o].length)) continue; out.push(by[k].shift()); }
    if (keys.every(k => !by[k].length)) break;
  }
  return out;
}

/* ---------- дозировка ---------- */
function prescribe(ex, week) {
  const G = GOALS[S.goal];
  const t = ex.type;
  let sets = G.sets[t];
  if (S.level === 'beg') sets = Math.max(2, sets - 1);
  if (S.level === 'adv' && t === 'c') sets = Math.min(6, sets + 1);
  let reps = G.reps[t], unit = 'повт.';
  if (ex.kind === 'time') { reps = G.time; unit = ''; }
  if (ex.kind === 'dist') { reps = G.dist; unit = ''; }
  const bodyweight = !ex.eq.length && !(ex.opt || []).length;
  let load = G.load[t];
  if (week) {
    const rir = week.rir + (S.level === 'beg' ? 1 : 0);
    const reserve = `${rir} ${plural(rir, 'повтор', 'повтора', 'повторов')} в запасе`;
    if (week.deload) { sets = Math.max(2, Math.round(sets * 0.6)); load = t === 'c' ? `${week.pct[S.goal]} от 1ПМ, лёгкий вес без отказа` : 'лёгкий вес, без отказа'; }
    else {
      if (week.add && t === 'c') sets = Math.min(6, sets + week.add);
      load = t === 'c' ? `${week.pct[S.goal]} от 1ПМ, ${reserve}` : reserve;
    }
  }
  if (ex.kind === 'time') load = ex.g === 'cardio' ? 'высокий темп без потери техники' : S.goal === 'strength' ? 'с отягощением или в усложнённом варианте' : 'ровно, без потери формы';
  else if (ex.g === 'cardio') load = 'взрывно и в ровном темпе';
  if (ex.kind === 'dist') load = S.goal === 'strength' ? 'максимально тяжёлые снаряды' : 'тяжёлые снаряды, без остановок';
  const notes = [];
  if (bodyweight && ex.kind !== 'time' && S.goal === 'strength') notes.push('Если диапазон даётся легко, добавьте отягощение или замедлите опускание до 4 с.');
  if (!week && S.level === 'beg') load = load.replace('1–2 повтора', '2–3 повтора');
  const rest = G.rest[t];
  const work = ex.kind === 'time' ? midOf(G.time) : ex.kind === 'dist' ? 30 : midOf(reps) * G.rep * (ex.uni ? 2 : 1);
  return {sets, reps, unit, rest, load, tempo:ex.kind ? null : G.tempo, notes, work, uni:!!ex.uni};
}

/* ---------- сборка одной тренировки ---------- */
function buildPlan(ctx = {}) {
  const groups = ctx.groups || S.groups, count = ctx.count || S.count, week = ctx.week || null;
  const sw = ctx.swaps || {};
  const E = effEquip(S.equip);
  const rand = rng((ctx.seed ?? S.seed) * 9973 + count * 31 + groups.length * 7);
  if (!groups.length) return {empty:'groups'};
  /* программа другого места: подбор под его инвентарь, затем недоступное здесь заменяется аналогами */
  const ref = programEquip(), PE = ref ? effEquip(ref) : E;
  let {picked} = pickExercises(PE, rand, groups, count, ctx.avoid);
  const pool = EX.filter(ex => available(ex, E));
  const subs = new Map(), lost = [];
  if (ref) {
    const lvlMax = S.level === 'beg' ? 2 : 3, used = new Set(picked.filter(ex => available(ex, E)).map(ex => ex.id));
    picked = picked.map(ex => {
      if (available(ex, E)) return ex;
      const alt = analogsFor(ex, E, {exclude:used, lvlMax, limit:1})[0];
      if (!alt) { lost.push(ex); return null; }
      used.add(alt.ex.id); subs.set(alt.ex, {from:ex, note:alt.note}); return alt.ex;
    }).filter(Boolean);
  }
  for (const [i, id] of Object.entries(sw)) {
    const ex = EXI[id];
    if (picked[i] && ex && available(ex, E) && !picked.includes(ex)) picked[i] = ex;
  }
  if (!picked.length) return {empty:'none', pool, groups};
  const G = GOALS[S.goal];
  const items = picked.map((ex, i) => ({ex, slot:i, rx:applyLight(prescribe(ex, week), ex), name:exName(ex, E), eqLine:equipLine(ex, E), eqIds:chosenEquip(ex, E), has:propHas(ex, E), sub:subs.get(ex) || null}));
  const bySlot = new Map(items.map(it => [it.ex, it]));
  let blocks = [], minutes = 0, totalSets = 0;
  if (S.format === 'classic') {
    const ord = orderClassic(picked).map(ex => bySlot.get(ex));
    ord.forEach((it, i) => { it.label = String(i + 1); });
    blocks = [{kind:'list', items:ord}];
    for (const it of ord) { minutes += it.rx.sets * (it.rx.work + it.rx.rest) + 60; totalSets += it.rx.sets; }
  } else if (S.format === 'superset') {
    const pairs = pairSupersets(picked);
    pairs.forEach((pr, pi) => {
      const L = String.fromCharCode(65 + pi);
      const its = pr.map((ex, j) => { const it = bySlot.get(ex); it.label = pr.length > 1 ? L + (j + 1) : L; return it; });
      const sets = Math.max(...its.map(it => it.rx.sets));
      const rest = pr.length > 1 ? G.ss.rest : its[0].rx.rest;
      its.forEach(it => { it.rx.sets = sets; it.rx.restShown = pr.length > 1 ? (it === its[its.length - 1] ? rest : 0) : rest; });
      blocks.push({kind:'pair', letter:L, items:its, sets, rest});
      minutes += sets * (its.reduce((a, it) => a + it.rx.work, 0) + 15 + rest) + 60;
      totalSets += sets * its.length;
    });
  } else {
    const ord = orderCircuit(picked).map(ex => bySlot.get(ex));
    const c = G.circ;
    let rounds = c.rounds + (S.level === 'beg' ? -1 : S.level === 'adv' ? 1 : 0);
    if (week && week.deload) rounds -= 1;
    else if (week && week.add) rounds += 0;
    rounds = Math.max(2, rounds);
    if (AR.light && S.mode !== 'program') rounds = Math.max(1, Math.round(rounds * .6));
    ord.forEach((it, i) => {
      it.label = String(i + 1);
      it.rounds = rounds;
      if (!it.ex.kind) it.rx.reps = c.reps;
      it.rx.circ = true;
      it.rx.work = it.ex.kind === 'time' ? c.work : it.ex.kind === 'dist' ? 30 : midOf(c.reps) * G.rep * (it.ex.uni ? 2 : 1);
    });
    blocks = [{kind:'circuit', items:ord, rounds, rest:c.rest, roundRest:c.roundRest}];
    minutes = rounds * (ord.reduce((a, it) => a + it.rx.work, 0) + c.rest * (ord.length - 1)) + (rounds - 1) * c.roundRest;
    totalSets = rounds * ord.length;
  }
  const missing = groups.filter(g => !pool.some(ex => groupsOf(ex).has(g)));
  const load = {}, gvol = {};
  for (const it of items) {
    const k = S.format === 'circuit' ? blocks[0].rounds : it.rx.sets;
    for (const m of it.ex.pri) load[m] = (load[m] || 0) + k;
    for (const m of it.ex.sec) load[m] = (load[m] || 0) + k * 0.5;
    /* дробный учёт: целевая группа — полный подход, остальные работающие — половина */
    const w = {};
    for (const m of it.ex.pri.concat(it.ex.sec)) { const g = MUSCLE_GROUP[m]; w[g] = Math.max(w[g] || 0, 0.5); }
    if (it.ex.g !== 'cardio') w[it.ex.g] = 1;
    else for (const m of it.ex.pri) w[MUSCLE_GROUP[m]] = Math.max(w[MUSCLE_GROUP[m]], 0.5);
    for (const [g, x] of Object.entries(w)) gvol[g] = (gvol[g] || 0) + k * x;
  }
  return {blocks, items, minutes:Math.round(minutes / 60), totalSets, missing, load, gvol, pool, E, groups, count, lost};
}

/* ---------- сборка недели ---------- */
function buildProgram() {
  const days = S.days, split = splitFor(days);
  const tmpl = SPLITS[split].days[days];
  const week = WEEKS[S.week - 1];
  const avoid = new Set();
  const seen = {};
  const out = tmpl.map((tid, i) => {
    seen[tid] = (seen[tid] || 0) + 1;
    const p = buildPlan({groups:DAY_T[tid].g, count:S.count, seed:S.seed * 131 + i * 977 + 13, avoid:new Set(avoid), week, swaps:swaps['d' + i] || {}});
    if (p.items) p.items.forEach(it => avoid.add(it.ex.id));
    return {tid, i, wd:SCHEDULE[days][i], plan:p};
  });
  for (const d of out) {
    const same = tmpl.filter(t => t === d.tid).length;
    const k = tmpl.slice(0, d.i + 1).filter(t => t === d.tid).length;
    const letters = DAY_T[d.tid].name === 'Всё тело' ? 'АБВГ' : 'АБ';
    const isFull = DAY_T[d.tid].name === 'Всё тело';
    const fullIdx = isFull ? tmpl.slice(0, d.i + 1).filter(t => DAY_T[t].name === 'Всё тело').length : 0;
    const fullTotal = tmpl.filter(t => DAY_T[t].name === 'Всё тело').length;
    d.name = DAY_T[d.tid].name + (isFull ? (fullTotal > 1 ? ' ' + letters[fullIdx - 1] : '') : (same > 1 ? ' ' + letters[k - 1] : ''));
  }
  const gvol = {}, load = {};
  let minutes = 0, sets = 0;
  for (const d of out) {
    if (!d.plan.items) continue;
    minutes += d.plan.minutes; sets += d.plan.totalSets;
    for (const [g, v] of Object.entries(d.plan.gvol)) gvol[g] = (gvol[g] || 0) + v;
    for (const [m, v] of Object.entries(d.plan.load)) load[m] = (load[m] || 0) + v;
  }
  return {days:out, split, week, gvol, load, minutes, sets};
}

/* ---------- отрисовка ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const ICON = {
  swap:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h10l-3-3M16 13H6l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dice:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.2" cy="7.2" r="1.3" fill="currentColor"/><circle cx="12.8" cy="12.8" r="1.3" fill="currentColor"/><circle cx="10" cy="10" r="1.3" fill="currentColor"/></svg>',
  copy:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  loop:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 8.5A6 6 0 1 0 15 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.5v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chart:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h14M5 13l3.5-4 3 2.5L16 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cal:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 8h14M7 2.5v3M13 2.5v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  check:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function renderSetup() {
  const seg = (name, dict, cur) => Object.entries(dict).map(([k, v]) =>
    `<button type="button" class="seg-b${k === cur ? ' on' : ''}" data-set="${name}" data-v="${k}" aria-pressed="${k === cur}"><b>${v.name}</b>${v.hint ? `<small>${v.hint}</small>` : ''}</button>`).join('');
  const prog = S.mode === 'program';
  $('#views').innerHTML = viewTabs();
  const jv = S.view === 'journal';
  $('.setup').hidden = jv; $('.layout').classList.toggle('solo', jv);
  $('#f-mode').innerHTML = seg('mode', MODES, S.mode);
  $('#f-prog').hidden = !prog;
  $('#f-muscles').hidden = prog;
  $('#count-l').textContent = prog ? 'Упражнений в тренировке' : 'Упражнений';
  if (prog) {
    $('#f-days').innerHTML = [2, 3, 4, 5].map(d => `<button type="button" class="seg-b${d === S.days ? ' on' : ''}" data-days="${d}" aria-pressed="${d === S.days}"><b>${d}</b><small>${SCHEDULE[d].map(i => WD[i]).join(' ')}</small></button>`).join('');
    const sp = splitFor(S.days);
    const opts = Object.entries(SPLITS).filter(([, v]) => v.days[S.days]);
    $('#f-split').style.gridTemplateColumns = `repeat(${opts.length}, 1fr)`;
    $('#f-split').innerHTML = opts.map(([k, v]) => `<button type="button" class="seg-b${k === sp ? ' on' : ''}" data-split="${k}" aria-pressed="${k === sp}"><b>${v.name}</b><small>${v.hint}</small></button>`).join('');
    $('#split-note').textContent = SPLITS[sp].note;
  }
  $('#f-goal').innerHTML = seg('goal', GOALS, S.goal);
  $('#f-format').innerHTML = seg('format', FORMATS, S.format);
  $('#f-level').innerHTML = seg('level', LEVELS, S.level);
  $('#count-v').textContent = S.count;
  $('#count-minus').disabled = S.count <= 3; $('#count-plus').disabled = S.count >= 10;
  const gs = new Set(S.groups);
  $('#g-presets').innerHTML = GROUP_PRESETS.map(p => {
    const on = p.g.length === gs.size && p.g.every(g => gs.has(g));
    return `<button type="button" class="pre${on ? ' on' : ''}" data-gp="${p.id}">${p.name}</button>`;
  }).join('');
  $('#g-chips').innerHTML = GROUPS.map(g => `<button type="button" class="chip${gs.has(g.id) ? ' on' : ''}" data-g="${g.id}" aria-pressed="${gs.has(g.id)}">${ICON.check}<span>${g.name}</span></button>`).join('');
  const cur = placeOf();
  $('#e-places').innerHTML = S.places.map(p => `<button type="button" class="place${p.id === S.place ? ' on' : ''}" data-place="${p.id}" aria-pressed="${p.id === S.place}"><b>${esc(p.name)}</b><small>${p.equip.length ? p.equip.length + ' ' + plural(p.equip.length, 'снаряд', 'снаряда', 'снарядов') : 'без снаряжения'}</small></button>`).join('')
    + `<button type="button" class="place place-add" data-place-add="1">+ Место</button>`;
  const others = S.places.filter(p => p.id !== S.place);
  $('#e-place-tools').innerHTML = `<label class="place-name">Название<input id="place-name" type="text" maxlength="24" value="${esc(cur.name)}" autocomplete="off"></label>`
    + (S.places.length > 1 ? `<button type="button" class="place-del${placeDel ? ' armed' : ''}" data-place-del="1">${placeDel ? 'Точно удалить?' : 'Удалить место'}</button>` : '')
    + (others.length ? `<label class="place-adapt">Программа<select id="place-adapt"><option value="">Своя для этого места</option>${others.map(p => `<option value="${p.id}"${S.adapt === p.id ? ' selected' : ''}>Как в «${esc(p.name)}», с заменами</option>`).join('')}</select></label>
      <p class="f-note">${S.adapt ? `Упражнения подобраны под «${esc(placeOf(S, S.adapt).name)}»; то, чего здесь нет, заменено ближайшим аналогом — по тому же движению и тем же мышцам.` : 'Программа собирается из того, что есть в этом месте.'}</p>` : '');
  const es = new Set(S.equip);
  $('#e-presets').innerHTML = '<span class="pres-l">Заполнить:</span>' + EQUIP_PRESETS.map(p => {
    const on = p.eq.length === es.size && p.eq.every(e => es.has(e));
    return `<button type="button" class="pre${on ? ' on' : ''}" data-ep="${p.id}">${p.name}</button>`;
  }).join('');
  $('#e-chips').innerHTML = EQUIP_CATS.map(c => `<div class="e-cat"><h3>${c.name}</h3><div class="chips">${EQUIP.filter(e => e.cat === c.id).map(e =>
    `<button type="button" class="chip${es.has(e.id) ? ' on' : ''}" data-e="${e.id}" aria-pressed="${es.has(e.id)}"${e.hint ? ` title="${esc(e.hint)}"` : ''}>${ICON.check}<span>${e.name}</span></button>`).join('')}</div></div>`).join('');
  $('#e-count').textContent = es.size ? `${es.size} из ${EQUIP.length}` : 'только вес тела';
  const matched = EQUIP_PRESETS.some(p => p.eq.length === es.size && p.eq.every(e => es.has(e)));
  const open = eqOpen || !matched;
  $('#e-chips').hidden = !open;
  $('#e-sum').hidden = open;
  $('#e-sum').textContent = es.size === EQUIP.length ? 'Всё оборудование зала.' : EQUIP.filter(e => es.has(e.id)).map(e => e.name).join(', ') + '.';
  $('#e-toggle').hidden = !matched;
  $('#e-toggle').textContent = open ? 'Свернуть список' : 'Изменить список';
  $('#e-toggle').setAttribute('aria-expanded', open);
}

function titleFor() {
  const gs = new Set(S.groups);
  const p = GROUP_PRESETS.find(p => p.g.length === gs.size && p.g.every(g => gs.has(g)));
  if (p) return p.id === 'full' ? 'Всё тело' : p.id === 'legs' ? 'Ноги и ягодицы' : p.id === 'push' ? 'Грудь, плечи, трицепс' : p.id === 'pull' ? 'Спина, бицепс, хват' : 'Верх тела';
  const names = S.groups.map(g => GN[g].toLowerCase());
  const s = names.length > 1 ? names.slice(0, -1).join(', ') + ' и ' + names[names.length - 1] : names[0];
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadBars(load) {
  const rows = Object.entries(load).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = rows.length ? rows[0][1] : 1;
  return rows.map(([m, v]) => `<li><span class="lb-n">${MUSCLE_NAMES[m]}</span><span class="lb-t"><i style="width:${Math.max(6, v / max * 100).toFixed(0)}%"></i></span><span class="lb-v">${fmtNum(v)}</span></li>`).join('');
}
/* недельный объём по группам с ориентиром 10–20 подходов */
function volBars(gvol, groups) {
  const ids = GROUPS.map(g => g.id).filter(g => g !== 'cardio' && (groups.has(g) || (gvol[g] || 0) >= 1));
  const max = Math.max(22, ...ids.map(g => gvol[g] || 0));
  const pct = v => (v / max * 100).toFixed(1);
  return ids.map(g => {
    const v = Math.round((gvol[g] || 0) * 2) / 2;
    const st = v < 10 ? 'lo' : v > 20 ? 'hi' : 'ok';
    const lab = st === 'lo' ? 'мало' : st === 'hi' ? 'много' : 'в норме';
    return `<li class="${st}"><span class="vb-n">${GN[g]}</span><span class="vb-v">${fmtNum(v)}<em>${lab}</em></span><span class="vb-t"><b style="left:${pct(10)}%;width:${pct(10)}%"></b><i style="width:${Math.max(1.5, +pct(v))}%"></i></span></li>`;
  }).join('');
}

function rxHtml(it) {
  const r = it.rx;
  const unit = r.unit ? ` <small>${r.unit}</small>` : '';
  const side = r.uni ? '<small> на сторону</small>' : '';
  if (r.circ) return `<div class="rx"><span class="rx-big">${r.reps}${unit}${side}</span></div>`;
  const rest = r.restShown !== undefined ? (r.restShown ? `отдых ${fmtRest(r.restShown)}` : 'сразу к следующему') : `отдых ${fmtRest(r.rest)}`;
  return `<div class="rx"><span class="rx-big">${r.sets} × ${r.reps}${unit}${side}</span><span class="rx-rest">${rest}</span>${r.light ? '<span class="rx-light">облегчено</span>' : ''}</div>`;
}

function cardHtml(it, idx) {
  const ex = it.ex, r = it.rx;
  const lvl = {};
  for (const m of ex.pri) lvl[m] = 1;
  for (const m of ex.sec) if (!lvl[m]) lvl[m] = 0.38;
  const mus = ex.pri.map(m => `<li class="p">${MUSCLE_NAMES[m]}</li>`).join('') + ex.sec.map(m => `<li class="s">${MUSCLE_NAMES[m]}</li>`).join('');
  const meta = [];
  if (r.tempo) meta.push(`<span title="опускание – пауза – подъём – пауза, секунды; X — взрывно">темп <b>${r.tempo}</b></span>`);
  if (r.load) meta.push(`<span>${r.load}</span>`);
  const view = ex.anim.catalogRig?'Изометрия · 5 ракурсов':(ex.viewNote || (ex.anim.view === 'front' ? 'вид спереди' : 'вид сбоку'));
  return `<li class="card" data-ex="${ex.id}" data-slot="${it.slot}">
  <div class="c-top">
    <div class="motion-tile"><button type="button" class="illus" data-fig="${idx}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Разобрать движение: ${esc(it.name)}"><span class="illus-v">${view}</span><span class="illus-zoom" aria-hidden="true">Увеличить ↗</span></button><div class="motion-bar"><span class="motion-caption">Исходное положение</span><button type="button" data-motion-pause="${idx}" aria-label="Пауза демонстрации: ${esc(it.name)}" aria-pressed="false">Пауза</button></div></div>
    <div class="c-info">
      <div class="c-head"><span class="c-idx">${it.label}</span><span class="c-type">${ex.type === 'c' ? 'базовое' : 'изолирующее'}</span></div>
      <h3 class="c-name">${esc(it.name)}</h3>
      <p class="c-eq">${esc(it.eqLine)}</p>
      ${it.sub ? `<p class="c-sub"><b>Вместо: ${esc(exName(it.sub.from, effEquip(programEquip() || S.equip)))}</b>${it.sub.note ? ` · ${esc(it.sub.note)}` : ''}</p>` : ''}
      ${rxHtml(it)}
      ${meta.length ? `<p class="c-meta">${meta.join('<i>·</i>')}</p>` : ''}
    </div>
  </div>
  <div class="c-mus">
    <div class="c-map">${muscleMapSvg(lvl, {aria:'Работающие мышцы: ' + ex.pri.map(m => MUSCLE_NAMES[m]).join(', ')})}</div>
    <ul class="mus">${mus}</ul>
  </div>
  ${logBlock(it)}
  <div class="c-warm">${warmupHtml(it, workWeightOf(it, null))}</div>
  <div class="c-prog">${progressionHint(it)}</div>
  <div class="c-act">
    <button type="button" class="btn-ghost" data-workout="${ex.id}" aria-haspopup="dialog" aria-controls="workout-view">Начать тренировку →</button>
    <button type="button" class="btn-ghost" data-hist="1" aria-expanded="false">${ICON.chart}<span>История</span><small>${histCount(ex.id) || ''}</small></button>
    <button type="button" class="btn-ghost" data-swap="${it.slot}">${ICON.swap}<span>Заменить</span></button>
  </div>
  <div class="c-hist" hidden></div>
  <details class="tech">
    <summary>Техника выполнения</summary>
    <ol class="t-steps">${ex.tech.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <div class="t-cols">
      <div><h4>Частые ошибки</h4><ul class="t-err">${ex.err.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div><h4>Дыхание</h4><p>${esc(ex.breath)}</p>${ex.note ? `<h4>Важно</h4><p>${esc(ex.note)}</p>` : ''}${r.notes.map(n => `<p class="t-tip">${esc(n)}</p>`).join('')}</div>
    </div>
  </details>
</li>`;
}

function blocksHtml(p) {
  let html = `<p class="phase"><b>Разминка, 8–10 мин.</b> Лёгкое кардио до тёплого пота, суставная гимнастика, затем 1–2 разминочных подхода с лёгким весом в первом упражнении.</p>`;
  let idx = 0;
  for (const b of p.blocks) {
    if (b.kind === 'list') {
      html += `<ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol>`;
    } else if (b.kind === 'pair') {
      const many = b.items.length > 1;
      html += `<section class="block">
        <header class="b-head"><h2><span class="b-letter">${b.letter}</span>${many ? 'Суперсет' : 'Отдельное упражнение'}</h2>
        <p>${many ? `${b.sets} ${plural(b.sets, 'круг', 'круга', 'кругов')}: ${b.items.map(it => it.label).join(' → ')} без паузы, затем отдых ${fmtRest(b.rest)}` : `${b.sets} ${plural(b.sets, 'подход', 'подхода', 'подходов')}, отдых ${fmtRest(b.rest)}`}</p></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    } else {
      const rd = done.__rounds || 0;
      html += `<section class="block block-c">
        <header class="b-head"><h2><span class="b-letter">${ICON.loop}</span>Круг × ${b.rounds}</h2>
        <p>Выполняйте станции подряд: ${fmtRest(b.rest)} на переход между упражнениями, ${fmtRest(b.roundRest)} отдыха после круга.</p>
        <div class="sets rounds" role="group" aria-label="Отметить пройденные круги">${Array.from({length:b.rounds}, (_, k) => `<button type="button" class="set${rd > k ? ' done' : ''}" data-round="${k}" aria-label="Круг ${k + 1}">${k + 1}</button>`).join('')}<span class="rounds-l">круги</span></div></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    }
  }
  html += `<p class="phase"><b>Заминка, 5 мин.</b> Спокойная ходьба и растяжка мышц, которые работали: по 20–30 секунд на каждую.</p>`;
  return html;
}
const LEGEND = `<p class="legend">1ПМ — вес, который вы можете поднять один раз. Темп — секунды на опускание, паузу внизу, подъём и паузу вверху; X — взрывной подъём.</p>`;
function warnHtml(p) {
  const warn = [];
  if (p.items.length < p.count) warn.push(`Подобрано ${p.items.length} ${plural(p.items.length, 'упражнение', 'упражнения', 'упражнений')} из ${p.count}: других вариантов для этих мышц и оборудования нет.`);
  if (p.lost && p.lost.length) warn.push(`Здесь нечем заменить: ${p.lost.map(ex => ex.name).join(', ')}. ${p.lost.length > 1 ? 'Их' : 'Его'} можно сделать здесь: ${placeOf(S, S.adapt).name}.`);
  if (p.missing.length) warn.push(`Без упражнений осталось: ${p.missing.map(g => GN[g].toLowerCase()).join(', ')}. Для них нужно другое оборудование.`);
  return warn.length ? `<div class="warn">${warn.map(w => `<p>${esc(w)}</p>`).join('')}</div>` : '';
}
function headButtons(copyLabel) {
  return `<div class="p-btns">
        <button type="button" class="btn" id="start-workout" aria-haspopup="dialog" aria-controls="workout-view">Начать тренировку →</button>
        <button type="button" class="btn btn-2" id="reroll">${ICON.dice}<span>Другой вариант</span></button>
        <button type="button" class="btn btn-2" id="copy">${ICON.copy}<span>${copyLabel}</span></button>
        ${S.mode === 'program' ? `<button type="button" class="btn btn-2" id="ics-open">${ICON.cal}<span>В календарь</span></button>` : ''}
      </div>
      <p class="p-hint" id="copy-msg" role="status"></p>`;
}
function norm(load) { const mx = Math.max(1, ...Object.values(load)); const o = {}; for (const [m, v] of Object.entries(load)) o[m] = v / mx; return o; }

function renderPlan() {
  stopFigures();
  if (S.view === 'journal') { prog = null; plan = null; return renderJournal(); }
  if (S.mode === 'program') return renderProgram();
  prog = null;
  plan = buildPlan({swaps:swaps.s || {}});
  const root = $('#plan');
  if (plan.empty === 'groups') {
    root.innerHTML = `<div class="empty"><h2>Выберите мышцы</h2><p>Отметьте хотя бы одну группу мышц в параметрах — план соберётся сразу.</p></div>`;
    return;
  }
  if (plan.empty === 'none') {
    root.innerHTML = `<div class="empty"><h2>Не из чего собрать тренировку</h2><p>Для выбранных мышц нет упражнений с этим оборудованием и уровнем. Добавьте оборудование или выберите другие группы мышц.</p></div>`;
    return;
  }
  const G = GOALS[S.goal];
  const setsWord = S.format === 'circuit' ? plural(plan.totalSets, 'подход', 'подхода', 'подходов') + ' за круги' : plural(plan.totalSets, 'подход', 'подхода', 'подходов');
  let html = `<header class="p-head">
    <div class="p-sum">
      <p class="eyebrow">${G.name} · ${FORMATS[S.format].name} · ${LEVELS[S.level].name.toLowerCase()}</p>
      <h1 class="p-title">${esc(titleFor())}</h1>
      <dl class="stats">
        <div><dt>время</dt><dd>≈${plan.minutes}<small>мин</small></dd></div>
        <div><dt>${setsWord}</dt><dd>${plan.totalSets}</dd></div>
        <div><dt>${plural(plan.items.length, 'упражнение', 'упражнения', 'упражнений')}</dt><dd>${plan.items.length}</dd></div>
      </dl>
      ${headButtons('Скопировать план')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(plan.load), {labels:true, aria:'Карта нагрузки тренировки'})}</div>
      <figcaption>
        <p class="lb-h">Нагрузка по мышцам, подходов</p>
        <ul class="lbars">${loadBars(plan.load)}</ul>
        <p class="lb-note">Вспомогательная работа считается за половину подхода.</p>
      </figcaption>
    </figure>
  </header>`;
  html += autoregHtml() + warnHtml(plan) + blocksHtml(plan) + LEGEND;
  root.innerHTML = html;
  mountFigures();
}

function renderProgram() {
  prog = buildProgram();
  if (S.day >= prog.days.length) S.day = 0;
  const day = prog.days[S.day];
  plan = day.plan;
  const G = GOALS[S.goal], wk = prog.week;
  const allGroups = new Set(prog.days.flatMap(d => DAY_T[d.tid].g));
  const sp = SPLITS[prog.split];
  let html = `<header class="p-head">
    <div class="p-sum">
      <p class="eyebrow">${G.name} · ${FORMATS[S.format].name} · ${LEVELS[S.level].name.toLowerCase()}</p>
      <h1 class="p-title">${esc(sp.name)}, ${S.days} ${plural(S.days, 'тренировка', 'тренировки', 'тренировок')} в неделю</h1>
      <dl class="stats">
        <div><dt>в неделю</dt><dd>≈${prog.minutes}<small>мин</small></dd></div>
        <div><dt>${plural(prog.sets, 'подход', 'подхода', 'подходов')} в неделю</dt><dd>${prog.sets}</dd></div>
        <div><dt>неделя цикла</dt><dd>${S.week}<small>из 4</small></dd></div>
      </dl>
      ${headButtons('Скопировать неделю')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(prog.load), {labels:true, aria:'Карта недельной нагрузки'})}</div>
      <figcaption>
        <p class="lb-h">Подходов на группу за неделю</p>
        <ul class="vbars">${volBars(prog.gvol, allGroups)}</ul>
        <p class="lb-note">Полоса — ориентир для роста мышц: 10–20 подходов в неделю. Подход засчитывается целиком целевой группе и наполовину остальным работающим. ${S.goal === 'strength' ? 'В силовом цикле объём ниже — это нормально.' : ''}</p>
      </figcaption>
    </figure>
  </header>
  <section class="weeks" aria-label="Неделя цикла">
    <h2>Цикл из 4 недель</h2>
    <div class="wk" role="group" aria-label="Неделя цикла">${WEEKS.map((w, i) => `<button type="button" class="${i + 1 === S.week ? 'on' : ''}" data-week="${i + 1}" aria-pressed="${i + 1 === S.week}"><b>${i + 1}</b><small>${w.name}</small></button>`).join('')}</div>
    <p class="wk-note"><b>${wk.name}.</b> ${esc(wk.note)}</p>
    <p class="rule"><b>Как добавлять вес.</b> Работайте в диапазоне повторов из карточки. Когда во всех подходах сделали верхнюю границу, в следующий раз добавьте вес — 1–2,5 кг для верха тела, 2,5–5 кг для ног — и начните с нижней границы. Если записывать подходы в карточках, планировщик сам подскажет, когда прибавлять. После разгрузки повторите цикл с новыми весами.</p>
  </section>
  <nav class="days" role="tablist" aria-label="Дни недели">${prog.days.map((d, i) => `<button type="button" role="tab" class="${i === S.day ? 'on' : ''}" data-day="${i}" aria-selected="${i === S.day}"><b>${WD[d.wd]}</b><span>${esc(d.name)}</span><small>${d.plan.items ? `≈${d.plan.minutes} мин` : 'нет упражнений'}</small></button>`).join('')}</nav>
  <div class="day-head"><h2>${WD_FULL[day.wd]} — ${esc(day.name)}</h2>
    <p>${DAY_T[day.tid].g.map(g => GN[g].toLowerCase()).join(', ')}${plan.items ? ` · ≈${plan.minutes} мин · ${plan.totalSets} ${plural(plan.totalSets, 'подход', 'подхода', 'подходов')}` : ''}</p></div>`;
  if (!plan.items) html += `<div class="empty"><h2>Для этого дня нет упражнений</h2><p>С выбранным оборудованием нечем нагрузить эти мышцы. Добавьте оборудование или выберите другой сплит.</p></div>`;
  else html += autoregHtml() + warnHtml(plan) + blocksHtml(plan);
  html += LEGEND;
  $('#plan').innerHTML = html;
  if (plan.items) mountFigures();
}
