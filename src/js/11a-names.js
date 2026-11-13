/* ===================== ИМЕНА ПО УМОЛЧАНИЮ =====================
   Планы, программы и места, которые назвало приложение, а не человек («Мой план», «План 2», «Зал», «Место 5»,
   «Пн · Верх», «Всё тело · неделя 2»), хранят ключ имени: у плана и места — auto, у программы плана — gauto. Имя
   по ключу пишется на языке страницы при каждой загрузке (ensureCustoms, ensurePlaces): созданные в русской версии
   не остаются русскими в английской, и наоборот. Переименовал человек — ключ снимается, имя остаётся его.
   Ключ — основа и поправки по порядку:
     my — «Мой план»; plan:N — «План N»; day:Д:Т[:Б] — день программы (Д — день недели 0–6, Т — шаблон дня DAY_T,
     Б — номер буквы: «Ср · Всё тело Б»); groups:g1,g2 — тренировка по группам мышц («Грудь, спина и плечи»);
     split:С:Н — программа недели («Всё тело · неделя 2»); place:N — «Место N»; gym, home, street, homeband — места-заготовки;
     +copy — «… — копия»; #k — номер занятого имени «… (k)».
   Данные прежних версий (только имя): имя, совпадающее с именем по умолчанию на русском или английском, получает ключ
   (autoGuess). Файл плана несёт ключ рядом с именем (docs/plan-format.md); прежние версии ключ пропускают и видят имя. */
const AUTO_LETTERS = {full:'АБВГ', other:'АБ'};
/* Имена прежних версий на обоих языках сборки. Русские — в регулярных выражениях: строки с кириллицей при сборке
   английской версии переводятся, регулярные выражения — нет. Порядок — как у ключей рядом */
const AUTO_LEGACY = {
  ids:{places:['gym', 'home', 'street', 'homeband'], days:['fa', 'up', 'lo', 'push', 'pull', 'legs'], splits:['full', 'ul', 'ppl'],
    presets:['full', 'legs', 'push', 'pull', 'upper'], groups:['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'glutes', 'quads', 'hams', 'calves', 'cardio']},
  ru:{my:/Мой план/, plan:/План/, place:/Место/, copy:/копия/, week:/неделя/, and:/и/, letters:/АБВГ/,
    places:/Зал|Дом|Улица|Дома с эспандером/, wd:/Пн|Вт|Ср|Чт|Пт|Сб|Вс/, days:/Всё тело|Верх|Низ|Жим|Тяга|Ноги/,
    splits:/Всё тело|Верх \/ низ|Жим \/ тяга \/ ноги/, presets:/Всё тело|Ноги и ягодицы|Грудь, плечи, трицепс|Спина, бицепс, хват|Верх тела/,
    groups:/грудь|спина|плечи|бицепс|трицепс|предплечья|пресс|ягодицы|квадрицепс|бицепс бедра|икры|кардио/},
  en:{my:'My plan', plan:'Plan', place:'Place', copy:'copy', week:'week', and:'and', letters:'ABCD',
    places:'Gym|Home|Outdoors|Home with bands', wd:'Mon|Tue|Wed|Thu|Fri|Sat|Sun', days:'Full body|Upper|Lower|Push|Pull|Legs',
    splits:'Full body|Upper / lower|Push / pull / legs', presets:'Full body|Legs & glutes|Chest, shoulders, triceps|Back, biceps, grip|Upper body',
    groups:'chest|back|shoulders|biceps|triceps|forearms|abs|glutes|quads|hamstrings|calves|cardio'}
};
const autoList = v => (v instanceof RegExp ? v.source.replace(/\\\//g, '/') : String(v)).split('|');
/* имя основы ключа на языке страницы или null */
function autoBase(b) {
  let m;
  if (b === 'my') return 'Мой план';
  if ((m = /^plan:([1-9]\d{0,2})$/.exec(b))) return 'План ' + m[1];
  if ((m = /^place:([1-9]\d{0,2})$/.exec(b))) return 'Место ' + m[1];
  const pd = typeof PLACE_DEFAULTS !== 'undefined' && PLACE_DEFAULTS.find(p => p.id === b); if (pd) return pd.name;
  if ((m = /^day:([0-6]):(\w+)(?::([1-4]))?$/.exec(b)) && DAY_T[m[2]]) {
    const letters = DAY_T[m[2]].name === 'Всё тело' ? AUTO_LETTERS.full : AUTO_LETTERS.other, li = m[3] ? +m[3] : 0;
    return li > letters.length ? null : `${WD[+m[1]]} · ${DAY_T[m[2]].name}${li ? ' ' + letters[li - 1] : ''}`;
  }
  if ((m = /^split:(\w+):([1-9])$/.exec(b)) && SPLITS[m[1]]) return `${SPLITS[m[1]].name} · неделя ${m[2]}`;
  if ((m = /^groups:([\w,]{1,200})$/.exec(b))) { const g = m[1].split(','); if (g.every(x => GN[x]) && new Set(g).size === g.length) return groupsTitle(g); }
  return null;
}
/* вид ключа: имя плана, программы или места */
function autoKind(key) {
  const b = String(key).split(/[+#]/)[0];
  return /^(?:my|plan:\d+|day:.+|groups:.+)$/.test(b) ? 'plan' : /^split:/.test(b) ? 'group' : /^place:\d+$/.test(b) || AUTO_LEGACY.ids.places.includes(b) ? 'place' : null;
}
/* имя по ключу на языке страницы или null (ключ неверный) */
function autoName(key) {
  if (typeof key !== 'string' || key.length > 240) return null;
  const m = /^([^+#]+)((?:\+copy|#[1-9]\d{0,2})*)$/.exec(key); if (!m) return null;
  let s = autoBase(m[1]); if (!s) return null;
  for (const [, copy, k] of m[2].matchAll(/(\+copy)|#(\d+)/g)) s = copy ? `${s} — копия` : `${s} (${k})`;
  return s.slice(0, CUSTOM_NAME_MAX);
}
const CUSTOM_NAME_MAX = 40;
/* имена по умолчанию → основа ключа: на языке страницы, по-русски и по-английски (для данных прежних версий) */
let autoNames = null;
function autoNameMap() {
  if (autoNames) return autoNames;
  const add = (map, name, key) => { if (name && !map.has(name)) map.set(name, key); };
  const plan = new Map(), place = new Map(), group = new Map();
  const ids = AUTO_LEGACY.ids;
  /* на языке страницы — по ключам */
  add(plan, autoBase('my'), 'my');
  for (const id of ids.places) add(place, autoBase(id), id);
  for (const tid of Object.keys(DAY_T)) for (let wd = 0; wd < 7; wd++) for (let li = 0; li <= 4; li++) { const k = `day:${wd}:${tid}${li ? ':' + li : ''}`; add(plan, autoBase(k), k); }
  for (const sp of Object.keys(SPLITS)) for (let w = 1; w <= 9; w++) add(group, autoBase(`split:${sp}:${w}`), `split:${sp}:${w}`);
  for (const p of GROUP_PRESETS) add(plan, groupsTitle(p.g), 'groups:' + p.g.join(','));
  /* по-русски и по-английски — по спискам прежних версий */
  for (const L of [AUTO_LEGACY.ru, AUTO_LEGACY.en]) {
    add(plan, autoList(L.my)[0], 'my');
    autoList(L.places).forEach((n, i) => add(place, n, ids.places[i]));
    const wd = autoList(L.wd), days = autoList(L.days), letters = autoList(L.letters)[0];
    days.forEach((dn, j) => { for (let w = 0; w < 7; w++) for (let li = 0; li <= (j ? 2 : 4); li++) add(plan, `${wd[w]} · ${dn}${li ? ' ' + letters[li - 1] : ''}`, `day:${w}:${ids.days[j]}${li ? ':' + li : ''}`); });
    autoList(L.splits).forEach((sn, j) => { for (let w = 1; w <= 9; w++) add(group, `${sn} · ${autoList(L.week)[0]} ${w}`, `split:${ids.splits[j]}:${w}`); });
    autoList(L.presets).forEach((pn, j) => { const p = GROUP_PRESETS.find(x => x.id === ids.presets[j]); if (p) add(plan, pn, 'groups:' + p.g.join(',')); });
  }
  return (autoNames = {plan, place, group});
}
/* «Грудь, спина и плечи» → groups:chest,back,shoulders (на языке страницы, по-русски и по-английски) */
function autoGroupsGuess(s) {
  const low = s.toLowerCase(), ids = AUTO_LEGACY.ids.groups;
  const langs = [[ids.map(g => String(GN[g]).toLowerCase()), GROUPS_AND.trim()], [autoList(AUTO_LEGACY.ru.groups), autoList(AUTO_LEGACY.ru.and)[0]], [autoList(AUTO_LEGACY.en.groups), AUTO_LEGACY.en.and]];
  for (const [names, and] of langs) {
    const parts = low.split(new RegExp(`, | ${and} `)), out = parts.map(p => ids[names.indexOf(p)]);
    const text = parts.length > 1 ? parts.slice(0, -1).join(', ') + ` ${and} ` + parts[parts.length - 1] : parts[0];
    if (out.every(Boolean) && new Set(out).size === out.length && text === low) return 'groups:' + out.join(',');
  }
  return null;
}
/* ключ имени прежней версии: kind — 'plan' | 'place' | 'group'; id — код места (заготовки узнаются только на своём месте) */
function autoGuess(name, kind, id) {
  if (typeof name !== 'string' || !name.trim()) return null;
  let s = name.trim(), mods = '', m;
  if (kind === 'plan') for (;;) {
    if ((m = /^(.*\S) \(([1-9]\d{0,2})\)$/.exec(s))) { s = m[1]; mods = '#' + m[2] + mods; continue; }
    if ((m = /^(.*\S) — (?:копия|copy)$/.exec(s))) { s = m[1]; mods = '+copy' + mods; continue; }
    break;
  }
  const map = autoNameMap()[kind]; let base = map && map.get(s) || null;
  if (kind === 'place' && base && base !== id) base = null;
  if (!base && kind === 'plan' && (m = /^(?:План|Plan) ([1-9]\d{0,2})$/.exec(s))) base = 'plan:' + m[1];
  if (!base && kind === 'place' && (m = /^(?:Место|Place) ([1-9]\d{0,2})$/.exec(s))) base = 'place:' + m[1];
  if (!base && kind === 'plan') base = autoGroupsGuess(s);
  return base && autoName(base + mods) ? base + mods : null;
}
/* ключ из данных (свой, если верный и того же вида) или угаданный по имени */
function autoKey(given, name, kind, id) {
  if (typeof given === 'string' && autoKind(given) === kind && autoName(given)) return given;
  return autoGuess(name, kind, id);
}
/* имя и ключ нового плана: занятое имя получает номер «(2)», ключ — «#2» */
function namedPlan(name, auto, taken) {
  const base = auto && autoName(auto) || name, n = uniquePlanName(base, taken);
  if (!auto || !autoName(auto)) return {name:n};
  const m = n !== base && / \((\d+)\)$/.exec(n);
  return {name:n, auto:m ? `${auto}#${m[1]}` : auto};
}
