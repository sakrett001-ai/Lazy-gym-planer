'use strict';
/* Объём мышц манекена (этап М2): для каждой линии мышцы — объём брюшка V (см³) и длины сухожилий в начале и в конце
   пути t0, t1 (см, в нейтральной позе). По ним приложение рисует толщину (Muscles.body в src/js/09br-muscles.js):
   сухожилия не растягиваются, брюшко занимает остальную длину пути, и при укорочении утолщается — объём постоянен.

   Объём. Мышца целиком — по МРТ (Riem et al., 2026: 70 мышц, 49 мужчин; fixtures/anatomy.json), пересчитанная на
   манекен по росту × массе (объём мышц пропорционален этому произведению: Handsfield et al., 2014). Между линиями
   одной мышцы объём делится как у исходной модели: пропорционально F · Lopt (сила ∝ физиологическому поперечнику,
   поперечник × длина волокон = объём; fixtures/params.json — Rajagopal 2016, MoBL-ARMS, DAS3). У поясницы исходной
   модели в открытом доступе нет, а длины волокон, выведенные из диапазонов MuJoCo, недостоверны: доля линии —
   F (MyoSim) × длина мясистой части пути. Внутренняя косая в наборе МРТ отсутствует — её объём выводится из наружной
   по отношению тех же весов. Большая поясничная — две части: пучки от позвонков до края таза (Ps_*, из модели
   поясницы) и общая часть от края таза к бедру (psoas, из модели ног); объём делится по их длинам.

   Брюшко — доля b длины пути в нейтральной позе; сухожилия — остальное, доля s — в начале пути (порядок точек пути
   у разных мышц разный: у мышц плеча путь идёт от плечевой кости). У ног b — по длине мышцы у Ward et al., 2009,
   пересчитанной на рост манекена; у руки, плечевого пояса и туловища — оценки по анатомии (измерений нет в открытом
   доступе; tools/muscles/README.md, «Известные расхождения»). */
const path = require('node:path');
const A = require('./fixtures/anatomy.json'), P = require('./fixtures/params.json');

/* мышцы набора МРТ → линии манекена (имя без стороны) */
const GROUPS = [
  ['Levator scapulae', /^lev_scap_\d$/], ['Supraspinatus', /^SUPSP$/], ['Trapezius', /^trap_(scap_?\d+|clav_\d)$/],
  ['Rhomboid', /^rhomboid_\d$/], ['Serratus anterior', /^serr_ant_?\d+$/], ['Latissimus dorsi', /^LAT[1-6]$/],
  ['Subscapularis', /^SUBSC$/], ['Teres major', /^TMAJ$/], ['Infraspinatus and teres minor', /^(INFSP(sup|inf)?|TMIN)$/],
  ['Pectoralis minor', /^pect_min_\d$/], ['Pectoralis major', /^PECM([123]|1b|2a|2c|3b)$/], ['Deltoid', /^DELT([123]|3med|3lat)$/],
  ['Triceps brachii', /^TRI(long|lat|med)$/], ['Coracobrachialis', /^CORB$/], ['Biceps brachii', /^BIC(long|short)$/],
  ['Brachialis', /^BRA$/], ['Brachioradialis', /^BRD$/], ['Extensor carpi radialis', /^ECR[LB]$/], ['Anconeus', /^ANC$/],
  ['Digit extensors', /^(EDC\d|EDM)$/], ['Extensor carpi ulnaris', /^ECU$/], ['Deep forearm extensors', /^(EIP|EPL|EPB|APL)$/],
  ['Supinator', /^SUP$/], ['Pronator teres', /^PT$/], ['Flexor carpi radialis and palmaris longus', /^(FCR|PL)$/],
  ['Flexor digitorum superficialis', /^FDS\d$/], ['Flexor carpi ulnaris', /^FCU$/], ['Flexor digitorum profundus', /^FDP\d$/],
  ['Flexor pollicis longus', /^FPL$/], ['Pronator quadratus', /^PQ$/],
  ['Erector spinae', /^(IL_|LTpT_|LTpL_|SPIN\d$)/], ['Multifidus', /^MF_/], ['Rectus abdominis', /^rect_abd$/],
  ['External oblique', /^EO\d$/], ['Quadratus lumborum', /^QL_/], ['Psoas major', /^(Ps_.*|psoas)$/], ['Iliacus', /^iliacus$/],
  ['Gluteus medius', /^glmed\d$/], ['Gluteus maximus', /^glmax\d$/], ['Gluteus minimus', /^glmin\d$/], ['Piriformis', /^piri$/],
  ['Pectineus', /^pect$/], ['Tensor fasciae latae', /^tfl$/], ['Rectus femoris', /^recfem$/], ['Vastus lateralis', /^vaslat$/],
  ['Vastus intermedius', /^vasint$/], ['Vastus medialis', /^vasmed$/], ['Sartorius', /^sart$/], ['Adductor brevis', /^addbrev$/],
  ['Adductor magnus', /^addmag(Dist|Isch|Mid|Prox)$/], ['Adductor longus', /^addlong$/], ['Gracilis', /^grac$/],
  ['Semitendinosus', /^semiten$/], ['Semimembranosus', /^semimem$/], ['Biceps femoris: long head', /^bflh$/],
  ['Biceps femoris: short head', /^bfsh$/], ['Gastrocnemius: medial head', /^gasmed$/], ['Gastrocnemius: lateral head', /^gaslat$/],
  ['Soleus', /^soleus$/], ['Tibialis anterior', /^tibant$/], ['Phalangeal extensors', /^(edl|ehl)$/], ['Fibulari', /^per(long|brev)$/],
  ['Tibialis posterior', /^tibpost$/], ['Flexor digitorum longus', /^fdl$/], ['Flexor hallucis longus', /^fhl$/],
];
/* Мышцы шеи (4.35.0, anatomy.js): в наборе Riem их нет. Объём мышцы — МРТ мужчин Zheng и др. (2013; доля от общего
   объёма мышц шеи, сумма двух сторон — делится пополам), пересчёт на рост × массу так же; между частями — по массам
   элементов у Borst (2009, препарат): линии манекена ↔ элементы Borst. Ременные у Zheng — вместе (головы и шеи) и
   обрезаны на уровне T2: часть ниже T2 не измерена, объём занижен (tools/muscles/README.md). */
const NECK = [
  ['Sternocleidomastoid', /^SCM\d$/, { SCM1: ['sternocleidomastoid', [0]], SCM2: ['sternocleidomastoid', [1]], SCM3: ['sternocleidomastoid', [2]], SCM4: ['sternocleidomastoid', [3]] }],
  ['Splenius', /^SPL(cap|cerv)\d$/, { SPLcap1: ['splenius_capitis', [0, 1]], SPLcap2: ['splenius_capitis', [2, 3, 4]], SPLcap3: ['splenius_capitis', [5, 6]],
    SPLcerv1: ['splenius_cervicis', [0]], SPLcerv2: ['splenius_cervicis', [1]] }],
  ['Scalenus', /^SCAL(ant|med|post)\d$/, { SCALant1: ['scalenus_anterior', [0, 1]], SCALant2: ['scalenus_anterior', [2]],
    SCALmed1: ['scalenus_medius', [0, 1]], SCALmed2: ['scalenus_medius', [2, 3, 4]], SCALmed3: ['scalenus_medius', [5, 6]],
    SCALpost1: ['scalenus_posterior', [0]], SCALpost2: ['scalenus_posterior', [1]] }],
];
/* Остистая мышца груди (4.35.0, anatomy.js) — доля объёма выпрямителя позвоночника (МРТ Riem — выпрямитель целиком):
   поперечник × длина волокон у Delp и др. (2001) — остистая 1,6 см² × 5,2 см против длиннейшей 5,9 × 9,6 и
   подвздошно-рёберной 4,1 × 12,0, ≈ 7,3 %. Между пучками остистой — по длине пути. */
const SPINALIS = (() => { const e = A.delp2001.erector, w = Object.values(e).map(([a, l]) => a * l); return w[0] / w.reduce((s, x) => s + x, 0); })();
/* Деление между частями по препаратам (4.36.0, аудит точности): у дельтовидной и двуглавой плеча доли частей в
   MoBL-ARMS расходятся с измерениями нескольких препаратов — задняя часть дельтовидной там 10 % объёма вместо 29 %
   (Gómez и др., 2022, 6 препаратов; DAS3 по препарату Klein Breteler — 33 %), длинная головка двуглавой — 59 % вместо
   51 % (Murray и др., 2000; DAS3 — 44 %). Для них веса частей — из fixtures/anatomy.json (parts), а не F · Lopt модели.
   Остальные многочастные мышцы сверены и оставлены по моделям (README, «Объём»). */
/* Веер (4.37.0, anatomy.js, раздел 6): линии, добавленные к линии модели по той же площадке начала, — с весом своей
   линии-основы; вес части делится между её линиями поровну (равные полосы начала). */
const FAN = { PECM1b: 'PECM1', PECM2a: 'PECM2', PECM2c: 'PECM2', PECM3b: 'PECM3', INFSPsup: 'INFSP', INFSPinf: 'INFSP' };
const PART_SHARE = Object.fromEntries(Object.entries(A.parts).filter(([k]) => k !== 'about').map(([g, v]) => [g, v.share]));
/* мышцы пальцев: MyoSim (2–5 — указательный…мизинец) → MoBL-ARMS (I, M, R, L) */
const DIGIT = { 2: 'I', 3: 'M', 4: 'R', 5: 'L' };
function source(base) {
  /* широчайшая: три пучка MoBL-ARMS (T7, T10, T12) и три достроенных по анатомии (L3, гребень подвздошной кости;
     anatomy.js) — объём делится как между шестью пучками DAS3 (lat_dorsi_1…6: T8, T10, T12, L3, два наружных) */
  const lat = base.match(/^LAT([1-6])$/);
  if (lat) return P.das3['lat_dorsi_' + lat[1]];
  if (P.rajagopal2016[base + '_r']) return P.rajagopal2016[base + '_r'];
  const d = base.match(/^(FDS|FDP|EDC)(\d)$/);
  if (d) return P.mobl[d[1] + DIGIT[d[2]]];
  return P.mobl[base] || P.das3[base] || null;
}
/* брюшко: [шаблон, b — доля пути (или ключ Ward 2009), s — доля сухожилий в начале пути, at — кость, у которой
   основное сухожилие]. Порядок точек пути в моделях разный (у задней части дельтовидной путь идёт от лопатки, у
   передней — от плеча; у наружной косой — то от рёбер, то от белой линии): если задан at и путь начинается не у этой
   кости, а кончается у неё, доля s отсчитывается с другого конца (4.36.0 — раньше сухожилие задней дельты рисовалось
   у ости лопатки, апоневроз пучков EO2–EO4 — у рёбер). */
const BELLY = [
  /* ноги: путь — от начала (таз, бедро, голень) к прикреплению */
  [/^psoas$/, .75, 0], [/^iliacus$/, 'iliacus', 0], [/^glmax\d$/, 'glmax', .1], [/^glmed\d$/, 'glmed', .1], [/^glmin\d$/, .85, .1],
  [/^piri$/, .7, .05], [/^tfl$/, .33, .05], [/^sart$/, 'sart', .3], [/^recfem$/, 'recfem', .35], [/^vas(lat|int|med)$/, null, .1],
  [/^grac$/, 'grac', .25], [/^addlong$/, 'addlong', .3], [/^addbrev$/, 'addbrev', .3], [/^addmag/, 'addmag', .3],
  [/^bflh$/, 'bflh', .35], [/^bfsh$/, 'bfsh', .1], [/^semiten$/, 'semiten', .25], [/^semimem$/, 'semimem', .45],
  [/^(tibant|ehl|edl|perlong|perbrev|fhl|fdl|tibpost|soleus)$/, null, .05], [/^gas(med|lat)$/, null, .1],
  /* плечо: путь — от плечевой кости (сухожилие прикрепления — в начале) */
  [/^(DELT\d|DELT3(med|lat)|PECM\d[abc]?)$/, .85, .9, /^humerus/], [/^(SUPSP|INFSP(sup|inf)?|SUBSC|TMIN|TMAJ)$/, .8, .9, /^humerus/], [/^LAT[456]$/, .7, .4], [/^LAT\d$/, .75, .6], [/^CORB$/, .8, .3],
  [/^TRIlong$/, .75, .25], [/^TRI(lat|med)$/, .8, .1], [/^(ANC|SUP|PQ)$/, .95, .5], [/^BIClong$/, .55, .6], [/^BICshort$/, .6, .4],
  [/^BRA$/, .9, .1], [/^BRD$/, .65, .05], [/^PT$/, .85, .1],
  /* предплечье: брюшко — в верхней части, длинные сухожилия к кисти и пальцам */
  [/^ECRL$/, .5, .05], [/^(ECRB|FCR)$/, .45, .05], [/^ECU$/, .5, .05], [/^FCU$/, .55, .05], [/^PL$/, .35, .05],
  [/^FDS\d$/, .4, .05], [/^FDP\d$/, .45, .05], [/^(EDC\d|EDM)$/, .4, .05], [/^(EIP|EPL)$/, .35, .05], [/^(EPB|FPL)$/, .4, .05], [/^APL$/, .5, .05],
  /* плечевой пояс (DAS3): мясистые */
  [/^(trap_|rhomboid_|lev_scap_|serr_ant|pect_min_)/, .9, .5],
  /* туловище: грудные пучки подвздошно-рёберной и длиннейшей — короткие брюшки на рёбрах и длинные хвостовые
     сухожилия (апоневроз выпрямителя), поясничные — мясистые; у косых — апоневроз спереди (начало пути) */
  [/^Ps_/, .95, .5], [/^rect_abd$/, .95, .5], [/^IL_R/, .45, .9], [/^IL_L/, .9, .5], [/^LTpT_/, .35, .9], [/^LTpL_/, .9, .5],
  [/^QL_/, .9, .5], [/^MF_/, .85, .5],
  /* косые: апоневроз — у белой линии (тело-посредник брюшной стенки — L3); пучки от рёбер к гребню подвздошной кости
     (задние наружной, верхние внутренней) — мясистые */
  [/^(EO[56]|IO[456])$/, .9, .5], [/^(EO|IO)\d$/, .7, .9, /^L3$/],
  /* 4.35.0 (anatomy.js, gait2392_import.py; оценки по анатомии, Gray's): остистая — короткие волокна и длинные сухожилия
     с обеих сторон; грудино-ключично-сосцевидная — сухожилие грудинной головки у грудины (начало пути); ременные и
     лестничные — мясистые; гребенчатая — мясистое начало, короткое плоское сухожилие у бедра */
  [/^SPIN\d$/, .5, .5], [/^SCM\d$/, .85, .6], [/^SPL(cap|cerv)\d$/, .9, .5], [/^SCAL(ant|med|post)\d$/, .85, .5], [/^pect$/, .85, .2],
];
const WARD_OF = { vaslat: 'vaslat', vasint: 'vasint', vasmed: 'vasmed', tibant: 'tibant', ehl: 'ehl', edl: 'edl', perlong: 'perlong',
  perbrev: 'perbrev', fhl: 'fhl', fdl: 'fdl', tibpost: 'tibpost', soleus: 'soleus', gasmed: 'gasmed', gaslat: 'gaslat' };
/* Начало брюшка по анатомии. Пути моделей — линии действия: у мышц с широким мясистым началом вдоль кости (широкие
   бедра, камбаловидная, мышцы голени, плечевая, головки трёхглавой) точка начала пути стоит в середине площадки
   прикрепления, и брюшко, нарисованное по пути, собиралось бы у дистального конца. Для рисования путь продлевается
   вдоль кости до верхнего края мясистого начала: y — уровень в рамке первой кости пути (см; у бедра, голени и плеча
   ось y идёт от проксимального сустава вниз), смещение от оси кости — как у первой точки пути. Уровни — по описанию
   начал мышц (Standring S., ed. Gray's Anatomy, 42nd ed., 2020): широкая латеральная — основание большого вертела;
   промежуточная и медиальная — ниже межвертельной линии; камбаловидная — головка малоберцовой и камбаловидная линия;
   передняя большеберцовая и длинный разгибатель пальцев — латеральный мыщелок большеберцовой; длинная малоберцовая —
   головка малоберцовой; задняя большеберцовая — верхние 2/3 межкостной перепонки; длинный сгибатель пальцев — ниже
   камбаловидной линии; короткая малоберцовая и длинный сгибатель большого пальца — нижние 2/3 малоберцовой;
   длинный разгибатель большого пальца — средняя половина малоберцовой; плечевая — нижняя половина плечевой кости;
   латеральная головка трёхглавой — выше борозды лучевого нерва, медиальная — ниже. */
const ORIGIN = { vaslat: -4, vasint: -9, vasmed: -9, soleus: -4, tibant: -4, edl: -4, perlong: -4, tibpost: -6, fdl: -10,
  perbrev: -16, fhl: -15, ehl: -14, BRA: -13, TRIlat: -5, TRImed: -11 };
/* Дистальное сухожилие четырёхглавой (этап А аудита анатомии 4.53.0, находка 9). Путь прямой и широких мышц бедра в модели
   ног идёт через надколенник к бугристости большеберцовой кости, а доля брюшка у широких — по длине мышцы у Ward (у
   медиальной и промежуточной она длиннее пути, доля упиралась в B_MAX): сухожилие у колена было 2,8 см — брюшко ложилось
   на надколенник и связку надколенника и в сгибании колена выходило «клювом» вперёд. Мышечных волокон в надколеннике и
   связке нет (Gray's Anatomy: надколенник — сесамовидная кость в сухожилии четырёхглавой), а над надколенником у каждой
   части своё сухожилие (fixtures/anatomy.json, quadtendon — препараты): прямая бедра — 8,3 см (Krebs и др., 2019;
   Strauss и др., 2021 — 8,7), медиальная широкая — 2,5 (Smith и др., 2009: 1,4–3,5), латеральная и промежуточная — 3,3
   (Grob и др., 2016). Поэтому дистальное сухожилие на рисунке не короче пути от первой точки на надколеннике до
   прикрепления (надколенник и связка; pack.js считает в нейтральной позе) плюс сухожилие над надколенником. */
const QUAD_TENDON = A.quadtendon.above;
const B_MIN = .3, B_MAX = .92;
const base = n => n.replace(/_[rl]$/, '');

/* stature, mass — рост и масса манекена; lengths — длины путей в нейтральной позе (см) по имени линии; patella — у мышц
   четырёхглавой длина пути от первой точки на надколеннике до прикрепления (см, QUAD_TENDON) */
function volumes(names, fmax, lengths, { stature, mass }, ends = {}, patella = {}) {
  const k = stature * mass / (A.mri.height * A.mri.mass), kw = stature / A.ward2009.height, out = {};
  const belly = n => {
    const b0 = base(n), row = BELLY.find(([re]) => re.test(b0));
    if (!row) throw Error('нет правила брюшка: ' + n);
    let [, b, s, at] = row;
    if (b === null) b = WARD_OF[b0];
    const e = ends[n]; if (at && e && !at.test(e[0]) && at.test(e[1])) s = 1 - s;
    if (typeof b === 'string') b = A.ward2009.rows[b][0] * kw / lengths[n];
    return { b: Math.min(B_MAX, Math.max(B_MIN, b)), s };
  };
  const weight = n => {
    const parent = FAN[base(n)] || (Object.values(FAN).includes(base(n)) ? base(n) : null);
    if (parent) { const s = source(parent), side = n.slice(-2), k = names.filter(x => x.endsWith(side) && (base(x) === parent || FAN[base(x)] === parent)).length; return s[0] * s[1] / k; }
    const src = source(base(n)), { b } = belly(n);
    return src ? src[0] * src[1] : fmax[n] * lengths[n] * b;   /* F·Lopt; у поясницы — F · мясистая длина */
  };
  const groupOf = n => GROUPS.find(([, re]) => re.test(base(n)));
  const assigned = new Set();
  for (const side of ['_r', '_l']) {
    const mine = names.filter(n => n.endsWith(side) || (!/_[rl]$/.test(n) && side === '_r'));
    for (const [g, re] of GROUPS) {
      const lines = mine.filter(n => re.test(base(n)));
      if (!lines.length) throw Error('группа МРТ без линий: ' + g);
      const V = A.mri.male[g] * k;
      let parts = lines.map(n => [n, PART_SHARE[g] ? PART_SHARE[g][base(n)] : weight(n)]);
      if (g === 'Psoas major') {
        /* общая часть (psoas) и пучки от позвонков (Ps_*): объём — по длинам, пучки между собой — по весам */
        const low = parts.filter(([n]) => base(n) === 'psoas'), up = parts.filter(([n]) => base(n) !== 'psoas');
        const fUp = up.reduce((s, [, w]) => s + w, 0), lUp = up.reduce((s, [n, w]) => s + lengths[n] * w, 0) / fUp;
        const lLow = lengths[low[0][0]], vLow = V * lLow / (lUp + lLow);
        out[low[0][0]] = { v: vLow, group: g };
        for (const [n, w] of up) out[n] = { v: (V - vLow) * w / fUp, group: g };
      } else if (g === 'Erector spinae' && lines.some(n => /^SPIN\d$/.test(base(n)))) {
        /* остистая — своя доля (SPINALIS), остальное — линиям модели поясницы по весам */
        const sp = parts.filter(([n]) => /^SPIN\d$/.test(base(n))), rest = parts.filter(([n]) => !/^SPIN\d$/.test(base(n)));
        const sum = rest.reduce((s, [, w]) => s + w, 0), lsp = sp.reduce((s, [n]) => s + lengths[n], 0);
        for (const [n, w] of rest) out[n] = { v: V * (1 - SPINALIS) * w / sum, group: g };
        for (const [n] of sp) out[n] = { v: V * SPINALIS * lengths[n] / lsp, group: g + ': остистая (Delp 2001)' };
      } else {
        const sum = parts.reduce((s, [, w]) => s + w, 0);
        for (const [n, w] of parts) out[n] = { v: V * w / sum, group: g };
      }
      lines.forEach(n => assigned.add(n));
    }
    /* шея — МРТ Zheng 2013, части — по Borst 2009 */
    const kn = stature * mass / (A.neck.height * A.neck.mass);
    for (const [g, re, map] of NECK) {
      const lines = mine.filter(n => re.test(base(n)));
      if (!lines.length) continue;
      const V = A.neck.percent[g] / 100 * A.neck.total / 2 * kn;
      const w = n => { const [m, idx] = map[base(n)]; return idx.reduce((s, i) => s + A.borst2009.mass[m][i], 0); }, sum = lines.reduce((s, n) => s + w(n), 0);
      for (const n of lines) { out[n] = { v: V * w(n) / sum, group: g + ' (Zheng 2013)' }; assigned.add(n); }
    }
    /* внутренняя косая — по наружной: по отношению весов линий модели поясницы (EO1–EO6, рёбра 7–11). Верхние зубцы
       наружной (EO7, EO8 — рёбра 5–6, anatomy.js) достроены по анатомии, у внутренней таких нет — в отношение не входят */
    const eo = mine.filter(n => /^EO[1-6]$/.test(base(n))), io = mine.filter(n => /^IO\d$/.test(base(n)));
    const wEO = eo.reduce((s, n) => s + weight(n), 0), vEO = mine.filter(n => /^EO\d$/.test(base(n))).reduce((s, n) => s + out[n].v, 0);
    for (const n of io) { out[n] = { v: vEO * weight(n) / wEO, group: 'Internal oblique (по наружной)' }; assigned.add(n); }
  }
  const missing = names.filter(n => !assigned.has(n));
  if (missing.length) throw Error('мышцы без объёма: ' + missing.join(', '));
  for (const n of names) {
    const { b, s } = belly(n), L = lengths[n], t = L * (1 - b), q = QUAD_TENDON[base(n)];
    let t0 = t * s, t1 = t * (1 - s);
    if (q !== undefined) {
      if (!(patella[n] > 0)) throw Error('нет пути через надколенник: ' + n);
      t1 = Math.max(t1, patella[n] + q);
    }
    Object.assign(out[n], { t0, t1, b: 1 - (t0 + t1) / L });
  }
  return out;
}
module.exports = { volumes, GROUPS, NECK, SPINALIS, PART_SHARE, FAN, BELLY, ORIGIN, QUAD_TENDON, source };
