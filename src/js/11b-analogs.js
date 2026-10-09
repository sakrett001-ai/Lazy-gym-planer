/* ===================== АНАЛОГИ УПРАЖНЕНИЙ =====================
   Замена по смыслу, а не по названию: то же движение (PATTERN), те же работающие мышцы, близкий уровень.
   Каждая замена объясняет, что меняется: другой снаряд, другая мышца в акценте, работа по одной стороне. */
const PATTERN_NAMES = {squat:'присед', hinge:'наклон от таза', hpush:'горизонтальный жим', ipush:'жим под углом вверх', dpush:'жим под углом вниз',
  fly:'сведение рук', pullover:'пуловер', vpull:'вертикальная тяга', hrow:'горизонтальная тяга', vpush:'жим вверх', raise:'подъём рук',
  rear:'задняя дельта и лопатки', curl:'сгибание рук', ext:'разгибание рук', lunge:'выпад', bridge:'ягодичный мост', flex:'скручивание',
  hold:'удержание корпуса', side:'боковой наклон', calf:'подъём на носки', grip:'хват', jump:'прыжки', burpee:'бёрпи', climb:'скалолаз',
  adduct:'сведение ног', run:'бег', ride:'вращение педалей', row:'гребля', kneeext:'разгибание колена', kneeflex:'сгибание колена', shrug:'шраги'};
/* движения, которым не нашлось места в общей таблице */
[['kneeext', 'legext'], ['kneeflex', 'legcurl nordic'], ['shrug', 'shrug'], ['raise', 'frontraise']].forEach(([p, ids]) => ids.split(' ').forEach(id => PATTERN[id] = p));

/* вид сопротивления: от него зависит, как ощущается замена */
const LOAD_KIND_NOTE = {
  band:'резина: сопротивление растёт к концу амплитуды',
  body:'вес тела: усложняйте темпом и амплитудой',
  free:'свободный вес: больше работы мышц-стабилизаторов',
  machine:'тренажёр ведёт траекторию: меньше стабилизации',
  cable:'блок: нагрузка ровнее по всей амплитуде'
};
function loadKind(ex, E) {
  const ids = E ? chosenEquip(ex, E) : ex.eq.map(g => g[0]);
  const cat = id => (EQUIP.find(e => e.id === id) || {}).cat;
  if (ids.some(id => id === 'cable')) return 'cable';
  if (ids.some(id => cat(id) === 'mach' || cat(id) === 'cardio')) return 'machine';
  if (ids.some(id => id === 'band')) return 'band';
  if (ids.some(id => ['db', 'bb', 'kb'].includes(id)) || (E && (ex.opt || []).some(id => ['db', 'kb'].includes(id) && E.has(id)))) return 'free';
  return 'body';
}
function muscleVector(ex) { const v = {}; for (const m of ex.pri) v[m] = 1; for (const m of ex.sec) v[m] = Math.max(v[m] || 0, .45); return v; }
function cosine(a, b) {
  let d = 0, na = 0, nb = 0;
  for (const [k, x] of Object.entries(a)) { na += x * x; if (b[k]) d += x * b[k]; }
  for (const x of Object.values(b)) nb += x * x;
  return na && nb ? d / Math.sqrt(na * nb) : 0;
}
/* близость упражнения b к a: 0…1 с небольшим запасом; движение и мышцы весят больше всего */
function analogScore(a, b) {
  const same = PATTERN[a.id] && PATTERN[a.id] === PATTERN[b.id];
  let s = .55 * cosine(muscleVector(a), muscleVector(b)) + (same ? .35 : 0) + (a.g === b.g ? .1 : 0);
  s -= .05 * Math.max(0, b.lvl - a.lvl);
  s -= .15 * (1 - (EX_W[b.id] ?? 1));
  if (!!a.uni !== !!b.uni) s -= .03;
  if ((a.kind || '') !== (b.kind || '')) s -= .08;
  return s;
}
/* что меняется при замене a → b: коротко, не больше трёх пунктов */
function analogNote(a, b, E) {
  const out = [], name = m => MUSCLE_NAMES[m].toLowerCase();
  if (PATTERN[b.id] && PATTERN[a.id] !== PATTERN[b.id]) out.push('другое движение: ' + PATTERN_NAMES[PATTERN[b.id]]);
  const bAll = new Set(b.pri.concat(b.sec)), aAll = new Set(a.pri.concat(a.sec));
  const lost = a.pri.filter(m => !bAll.has(m)), gained = b.pri.filter(m => !aAll.has(m));
  if (lost.length) out.push('меньше нагрузки: ' + lost.slice(0, 2).map(name).join(', '));
  if (gained.length) out.push('добавляется: ' + gained.slice(0, 2).map(name).join(', '));
  const ka = loadKind(a), kb = loadKind(b, E);
  if (ka !== kb && LOAD_KIND_NOTE[kb]) out.push(LOAD_KIND_NOTE[kb]);
  if (b.uni && !a.uni) out.push('по одной стороне — подход дольше');
  return out.slice(0, 3).join('; ');
}
/* лучшие замены упражнения ex среди доступных при оборудовании E */
function analogsFor(ex, E, {exclude = new Set(), lvlMax = 3, limit = 5, min = .45} = {}) {
  const cardio = ex.g === 'cardio';
  return EX.filter(b => b !== ex && !exclude.has(b.id) && available(b, E) && b.lvl <= lvlMax && (b.g === 'cardio') === cardio)
    .map(b => ({ex:b, score:analogScore(ex, b)}))
    .filter(r => r.score >= min)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(r => ({...r, note:analogNote(ex, r.ex, E)}));
}

/* ===================== МЕСТА ТРЕНИРОВОК =====================
   У каждого места свой инвентарь: зал, дом, площадка во дворе. S.equip — инвентарь текущего места. */
const PLACE_DEFAULTS = [
  {id:'gym', name:'Зал', equip:EQUIP.map(e => e.id)},
  {id:'home', name:'Дом', equip:['db', 'band', 'abwheel']},
  {id:'street', name:'Улица', equip:['pullup', 'dipbars']}
];
function ensurePlaces(s) {
  if (!Array.isArray(s.places) || !s.places.length) {
    s.places = PLACE_DEFAULTS.map(p => ({...p, equip:p.equip.slice()}));
    /* перенос старой настройки: инвентарь, который уже был выбран, становится инвентарём подходящего места */
    const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    const match = s.places.find(p => same(p.equip, s.equip || []));
    if (match) s.place = match.id;
    else { s.place = 'gym'; s.places[0].equip = (s.equip || []).slice(); }
  }
  if (!s.places.some(p => p.id === s.place)) s.place = s.places[0].id;
  if (s.adapt && (!s.places.some(p => p.id === s.adapt) || s.adapt === s.place)) s.adapt = null;
  s.equip = placeOf(s).equip.slice();
  return s;
}
function placeOf(s = S, id = s.place) { return s.places.find(p => p.id === id) || s.places[0]; }
function setPlaceEquip(list) { S.equip = list.slice(); placeOf().equip = list.slice(); }
/* инвентарь, под который собирается программа: своё место или выбранное «как в …» */
function programEquip() { return S.adapt && S.adapt !== S.place ? placeOf(S, S.adapt).equip : null; }
ensurePlaces(S);
