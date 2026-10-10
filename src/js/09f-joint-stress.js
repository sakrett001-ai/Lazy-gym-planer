/* ===================== НАГРУЗКА НА СУСТАВЫ =====================
   Красная метка — момент пиковой нагрузки на сустав, связки или сухожилие в повторении. Это напоминание держать
   технику, а не «опасное упражнение». Условия проверяются по углам суставов манекена (Mannequin.jointAngles —
   тот же расчёт, что у валидатора) и по опорам упражнения (контакты спецификации), на 41 кадре повторения.
   Пороги и основания:
   колени      — сгибание ≥85° (на одной ноге ≥80°) под весом: Escamilla 2001, MSSE 33(1):127–141;
   колено      — разгибание в открытой цепи ближе 30° к прямой ноге: Escamilla et al. 1998, MSSE 30(4):556–569;
   поясница    — наклон корпуса ≥40° без опоры с весом: McGill 1997, J Biomech 30(5):465–475;
   плечи       — плечо за линией корпуса ≥20° в жимах и брусьях, длинный рычаг в разведениях:
                 Fees et al. 1998, AJSM 26(5):732–742; брусья — McKenzie et al. 2022, IJERPH 19(21):14390;
   плечи вверх — жим над головой: плечо поднято на 90–120° под весом — подакромиальное пространство здесь самое узкое
                 (при работе мышц — уже всего около 90°): Graichen et al. 1999, AJR 172(4):1081–1086; жимы над головой —
                 среди упражнений, на которые чаще жалуются при боли в плече: Kolber et al. 2010, JSCR 24(6):1696–1704;
   локти       — сгибание ≥100° с весом над головой в изолирующих упражнениях на трицепс (практическое правило);
   запястья    — разгибание кисти ≥60° под весом тела: J Wrist Surg 2017, 6(4):276–279;
   ахилл       — тыльное сгибание ≥15° с весом в подъёмах на носки: Weinert-Aplin et al. 2015, JSSM 14:459–465;
   приземление — кадры после полётной фазы, пока таз опускается;
   бёдра сзади — колено ≤40° при сгибании бедра ≥70° с весом; скандинавские сгибания — наклон ≥40°:
                 Opar et al. 2012, Sports Med 42(3):209–226;
   вис, верх подтягивания, шея — по просьбе владельца: здесь чаще всего травмируют плечи и шейный отдел. */
const STRESS_RULES = [
  {id:'knee', parts:['колени'], zone:'Колени', what:'Глубокий сгиб под весом — пик нагрузки на надколенник и связки колена.', tip:'Колени по линии стоп, не проваливайтесь и не расслабляйтесь внизу.'},
  {id:'kneeOpen', parts:['колени'], zone:'Колени', what:'Последние 30° до прямой ноги — сильнее всего натянута передняя крестообразная связка.', tip:'Разгибайте без рывка и удара в конце.'},
  {id:'lumbar', parts:['поясница'], zone:'Поясница', what:'Наклон корпуса с весом без опоры — пик нагрузки на поясницу.', tip:'Спина нейтральная, движение от таза, вес ближе к ногам.'},
  {id:'shPress', parts:['плечи'], zone:'Плечи', what:'Плечо ушло за линию корпуса под весом — нагрузка на переднюю часть сустава.', tip:'Опускайтесь до комфортной глубины, лопатки сведены и прижаты.'},
  {id:'shLever', parts:['плечи'], zone:'Плечи', what:'Длинный рычаг: вес далеко от плеча.', tip:'Локти слегка согнуты, без провала в нижней точке.'},
  {id:'shOverhead', parts:['плечи'], zone:'Плечи', what:'Рука проходит дугу 90–120° под весом — пространство под акромионом самое узкое, сухожилия плеча сдавлены сильнее всего.', tip:'Жмите перед головой, не из-за головы, локти чуть впереди корпуса; при боли — остановитесь ниже или замените упражнение.'},
  {id:'hang', parts:['плечи'], zone:'Плечи', what:'Вис: плечевой сустав растянут весом тела.', tip:'Активный вис: плечи от ушей, без падения в нижнюю точку.'},
  {id:'pullTop', parts:['плечи'], zone:'Плечи', what:'Верх подтягивания: плечи уходят вперёд и к ушам.', tip:'Грудь к перекладине, лопатки вниз и назад, без рывка.'},
  {id:'neck', parts:['шея'], zone:'Шея', what:'Когда не хватает сил, к перекладине тянутся шеей — это перегружает шейный отдел.', tip:'Подбородок нейтрально, взгляд вперёд: лучше недотянуть, чем дотягиваться шеей.'},
  {id:'elbow', parts:['локти'], zone:'Локти', what:'Глубокий сгиб локтя с весом над головой — нагрузка на локтевой отросток и сухожилие трицепса.', tip:'Опускайте медленно, локти не разводите.'},
  {id:'wrist', parts:['запястья'], zone:'Запястья', what:'Кисть разогнута под весом тела.', tip:'Опора на всю ладонь; при боли — упоры для отжиманий.'},
  {id:'achilles', parts:['ахилловы сухожилия'], zone:'Ахилловы сухожилия', what:'Пятка ниже опоры с весом — пик натяжения сухожилия.', tip:'Опускайтесь плавно, без пружинящих рывков.'},
  {id:'landing', parts:['колени', 'ахилловы сухожилия'], zone:'Колени и ахилловы сухожилия', what:'Приземление — ударная нагрузка в несколько раз больше веса тела.', tip:'Мягко на передний отдел стопы, колени по линии стоп.'},
  {id:'hams', parts:['задняя поверхность бедра'], zone:'Задняя поверхность бедра', what:'Мышцы задней поверхности бедра растянуты под весом.', tip:'Опускайтесь до ощутимого натяжения, без рывка из нижней точки.'}
];
const STRESS_RULE = Object.fromEntries(STRESS_RULES.map(r => [r.id, r]));
const STRESS_FRAMES = 40;
const STRESS_CACHE = new Map();
/* наклоны от таза, если таблица движений планировщика ещё не загружена (проверка рисунков без приложения) */
const STRESS_HINGE = new Set(['deadlift', 'rdl', 'sllift', 'goodmorning', 'kbswing', 'hyper', 'pullthrough']);
/* жимы вверх — так же, на случай проверки без таблицы движений */
const STRESS_VPUSH = new Set(['dbpress', 'ohp', 'pikepush', 'arnold', 'declinepike', 'shoulderpressm', 'smithohp']);

/* что держит и на что опирается тело — по контактам спецификации */
function stressContacts(ex) {
  const C = (typeof CATALOG_POSES !== 'undefined' && CATALOG_POSES[ex.id]?.contacts || []).map(c => c.body + '>' + c.prop);
  const has = re => C.some(c => re.test(c));
  const legs = ['quads', 'glutes', 'hams', 'calves', 'cardio'].includes(ex.g);
  /* свободный вес: гриф, гантель, гиря; ладони на диске гантели (пуловер, разгибание из-за головы) */
  const free = has(/^grip[LR]?>(bar|db[LR]?|kb[LR]?|tbar|\w+:horn[LR])$/) || has(/^(hand|palm[LR]?)>\w+:top$/);
  const machine = !legs && has(/^grip[LR]?>(cab[LR]?|pec[LR]|\w+:(handle[LR]?|grab[LR]|pull[LR]|pec[LR]))$/);
  return {
    loaded: free || machine,
    backBar: has(/^back>bar$/),
    sole: s => has(new RegExp(s ? '^sole(' + s + ')?>' : '^sole[LR]?>')),
    /* стоит на полу или коврике и ничем больше не опирается — только у таких упражнений бывает приземление */
    floorOnly: C.some(c => /^sole[LR]?>(floor|mat)$/.test(c)) && !C.some(c => /^sole[LR]?>(?!(floor|mat)$)|^(buttocks|back|upperBack|chest|knee[LR]?|th[LR]?)>|^grip[LR]?>\w+:(pullBar|pull[LR]|bar[LR]|dip[LR]|rail[LR])$/.test(c)),
    seated: has(/^(back|chest|belly|buttocks|upperBack|front|headBack|th[LR]?|thighsBack|knee[LR]?|fa[LR]?|palm[LR]?)>(?!bar$)/),
    upright: !has(/^(buttocks|back|chest|th[LR]?|upperBack|knee[LR]?)>(?!bar$)(?!\w+:sh[LR]$)/),
    /* на одной ноге: касание ящика ягодицами в нижней точке пистолета не делает упражнение сидячим */
    uprightUni: !has(/^(back|chest|th[LR]?|upperBack|knee[LR]?)>(?!bar$)/),
    legPress: has(/^sole[LR]?>\w+:plate/) || has(/^upperBack>\w+:sh[LR]$/),
    shin: has(/^shin[LR]?>\w+:roller/),
    palmBear: s => has(new RegExp('^palm(' + s + ')?>(?!\\w+:(panel|top)$)')),
    palmTop: has(/^palm[LR]?>\w+:top$/),
    handsBear: has(/^(palm[LR]?|fa[LR]?)>|^grip[LR]?>\w+:(bar[LR]|dip[LR]|seat|pad|top)$/),
    bar: has(/^grip[LR]?>\w+:(pullBar|pull[LR])$/),
    kneelAnchored: has(/^knee[LR]?>pad$/) && has(/^foot[LR]?>\w+:base$/)
  };
}
/* углы и вспомогательные величины кадра */
function stressFrame(R) {
  const A = Mannequin.jointAngles(R), V = Mannequin.V;
  const up = V.unit(V.sub(R.sh, R.hip)), trunk = Math.acos(Math.max(-1, Math.min(1, -up[1]))) * 180 / Math.PI;
  const side = s => { const a = A[s], h = R['grip' + s] && R['sh' + s] ? Math.hypot(R['grip' + s][0] - R['sh' + s][0], R['grip' + s][2] - R['sh' + s][2]) : 0;
    return {...a, behind:a.posterior > 0 ? Math.asin(Math.min(1, a.posterior)) * 180 / Math.PI : 0, beta:Math.abs(Math.atan2(a.lat, -a.up) * 180 / Math.PI), reach:h}; };
  return {A, trunk, L:side('L'), R:side('R')};
}
/* правила кадра: возвращают ключи меток (суставы со стороной или центральные точки) */
function stressRulesAt(ex, k, f) {
  const out = {}, add = (id, keys) => { if (keys.length) out[id] = keys; }, both = (fn, key) => ['L', 'R'].filter(fn).map(s => key + s);
  /* в наклоне от таза (становая, румынская) колени согнуты, но пик нагрузки — на поясницу и заднюю поверхность бедра */
  const hinge = typeof PATTERN !== 'undefined' ? PATTERN[ex.id] === 'hinge' : STRESS_HINGE.has(ex.id), legsG = ['quads', 'glutes', 'hams'].includes(ex.g);
  if (!ex.pri.includes('calves') && !hinge) {
    const loaded = k.legPress || (k.upright && (k.loaded || k.backBar)) || (legsG && ex.uni && k.uprightUni);
    if (loaded) add('knee', both(s => k.sole(s) && f[s].knee >= (ex.uni ? 80 : 85), 'kn'));
  }
  if (k.shin) add('kneeOpen', both(s => f[s].knee <= 30, 'kn'));
  if (k.sole('') && !k.seated && (k.loaded || k.backBar) && f.trunk >= 40) add('lumbar', ['lumbar']);
  const push = ['chest', 'triceps', 'shoulders'].includes(ex.g);
  if (push && (k.loaded || k.handsBear)) add('shPress', both(s => f[s].behind >= 20, 'sh'));
  /* жим вверх: плечо в дуге 90–120° — только в жимах, а не в тяге к лицу или махах (там другая задача и малый вес) */
  const vpush = typeof PATTERN !== 'undefined' ? PATTERN[ex.id] === 'vpush' : STRESS_VPUSH.has(ex.id);
  if (vpush && (k.loaded || k.handsBear)) add('shOverhead', both(s => f[s].elevation >= 90 && f[s].elevation <= 120, 'sh'));
  if (ex.g === 'chest' && k.loaded) add('shLever', both(s => (f[s].elbow <= 35 && f[s].reach >= 45 && f[s].beta >= 60 && f[s].beta <= 120 && f.trunk > 60) || (f[s].elevation >= 130 && f[s].reach >= 35), 'sh'));
  if (k.bar) {
    add('hang', both(s => f[s].elevation >= 140, 'sh'));
    const top = both(s => f[s].elbow >= 100, 'sh');
    add('pullTop', top);
    if (top.length) add('neck', ['neck']);
  }
  if (ex.pri[0] === 'triceps' && ex.type !== 'c' && k.loaded) add('elbow', both(s => f[s].elbow >= 100 && f[s].elevation >= 80, 'el'));
  if (!k.kneelAnchored) add('wrist', both(s => ((k.palmBear(s) && f.trunk >= 45) || k.palmTop) && f[s].wristFlex <= -60, 'wr'));
  if (ex.pri[0] === 'calves' && ex.type !== 'c' && ex.g !== 'cardio') add('achilles', both(s => f[s].dorsi >= 15, 'an'));
  if (k.sole('') && !k.seated && (k.loaded || k.backBar)) add('hams', both(s => f[s].knee <= 40 && f[s].hipFlex >= 70, 'th'));
  if (k.kneelAnchored && f.trunk >= 40) add('hams', ['thL', 'thR']);
  return out;
}
/* метки по кадрам: f — повторение вперёд (t 0→1), b — возврат (t 1→0); различаются только приземлением */
function jointStress(ex) {
  if (STRESS_CACHE.has(ex.id)) return STRESS_CACHE.get(ex.id);
  let result = {rules:[]};
  const rig = ex.anim.catalogRig;
  if (rig && typeof CATALOG_POSES !== 'undefined' && CATALOG_POSES[ex.id]) {
    const k = stressContacts(ex), frames = [], clear = [], hip = [];
    for (let i = 0; i <= STRESS_FRAMES; i++) {
      const R = rig(i / STRESS_FRAMES);
      if (!R.frames) { frames.length = 0; break; }
      frames.push(stressRulesAt(ex, k, stressFrame(R)));
      clear.push(Math.max(R.heelL[1], R.toeL[1], R.heelR[1], R.toeR[1])); hip.push(R.hip[1]);
    }
    if (frames.length) {
      const ground = Math.max(...clear), gap = clear.map(y => ground - y);
      const landing = order => { const hit = new Array(frames.length).fill(false); let since = Infinity;
        for (let n = 1; n < order.length; n++) { const i = order[n], prev = order[n - 1];
          since = gap[prev] >= 5 ? 0 : since + 1;
          if (gap[i] < 3 && since < 5 && hip[i] > hip[prev]) hit[i] = true; }
        return hit; };
      const idx = frames.map((_, i) => i), none = idx.map(() => false);
      const fw = k.floorOnly ? landing(idx) : none, bw = !k.floorOnly ? none : ex.anim.loop ? fw : landing(idx.slice().reverse());
      const ids = new Set(frames.flatMap(f => Object.keys(f)));
      if (fw.some(Boolean) || bw.some(Boolean)) ids.add('landing');
      const keysOf = (id, i, dir) => id === 'landing' ? ((dir === 'b' ? bw : fw)[i] ? ['knL', 'knR', 'anL', 'anR'] : []) : frames[i][id] || [];
      result = {rules:STRESS_RULES.filter(r => ids.has(r.id)).map(r => ({...r, f:frames.map((_, i) => keysOf(r.id, i, 'f')), b:frames.map((_, i) => keysOf(r.id, i, 'b'))}))};
    }
  }
  STRESS_CACHE.set(ex.id, result);
  return result;
}
function stressExercise(anim) { return anim.catalogId ? (typeof EXI !== 'undefined' ? EXI[anim.catalogId] : EX.find(e => e.id === anim.catalogId)) : null; }
/* активные правила в положении t; index 2 и 3 — обратный ход (кроме замкнутых циклов) */
function jointStressAt(ex, t, index = 0) {
  const S = jointStress(ex), i = Math.max(0, Math.min(STRESS_FRAMES, Math.round(t * STRESS_FRAMES))), dir = index >= 2 && !ex.anim.loop ? 'b' : 'f';
  return S.rules.map(r => ({rule:r, keys:r[dir][i]})).filter(x => x.keys.length);
}
/* точка метки на манекене */
function stressPoint(R, key) {
  const V = Mannequin.V, s = key.slice(-1);
  if (key === 'lumbar') return R.waist || V.mix(R.hip, R.sh, .3);
  if (key === 'neck') return V.mix(R.neckBase || R.sh, R.head, .35);
  if (key.startsWith('th')) return V.mix(R['hip' + s], R['kn' + s], .45);
  if (key.startsWith('an')) return V.mix(R['an' + s], R['heel' + s], .5);
  return R[key];
}
function jointStressPoints(anim, R, t, index) {
  const ex = stressExercise(anim);
  if (!ex || !R.frames) return [];
  const out = [];
  for (const {rule, keys} of jointStressAt(ex, t, index)) for (const key of keys) if (!out.some(m => m.key === key)) out.push({key, rule:rule.id, p:stressPoint(R, key)});
  return out;
}
/* коротко для карточки: какие суставы под пиковой нагрузкой */
function stressZones(ex) {
  const zones = [];
  for (const r of jointStress(ex).rules) for (const name of r.parts) if (!zones.includes(name)) zones.push(name);
  return zones;
}
