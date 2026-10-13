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
  ['Rhomboid', /^rhomboid_\d$/], ['Serratus anterior', /^serr_ant_?\d+$/], ['Latissimus dorsi', /^LAT[123]$/],
  ['Subscapularis', /^SUBSC$/], ['Teres major', /^TMAJ$/], ['Infraspinatus and teres minor', /^(INFSP|TMIN)$/],
  ['Pectoralis minor', /^pect_min_\d$/], ['Pectoralis major', /^PECM[123]$/], ['Deltoid', /^DELT[123]$/],
  ['Triceps brachii', /^TRI(long|lat|med)$/], ['Coracobrachialis', /^CORB$/], ['Biceps brachii', /^BIC(long|short)$/],
  ['Brachialis', /^BRA$/], ['Brachioradialis', /^BRD$/], ['Extensor carpi radialis', /^ECR[LB]$/], ['Anconeus', /^ANC$/],
  ['Digit extensors', /^(EDC\d|EDM)$/], ['Extensor carpi ulnaris', /^ECU$/], ['Deep forearm extensors', /^(EIP|EPL|EPB|APL)$/],
  ['Supinator', /^SUP$/], ['Pronator teres', /^PT$/], ['Flexor carpi radialis and palmaris longus', /^(FCR|PL)$/],
  ['Flexor digitorum superficialis', /^FDS\d$/], ['Flexor carpi ulnaris', /^FCU$/], ['Flexor digitorum profundus', /^FDP\d$/],
  ['Flexor pollicis longus', /^FPL$/], ['Pronator quadratus', /^PQ$/],
  ['Erector spinae', /^(IL|LTpT|LTpL)_/], ['Multifidus', /^MF_/], ['Rectus abdominis', /^rect_abd$/],
  ['External oblique', /^EO\d$/], ['Quadratus lumborum', /^QL_/], ['Psoas major', /^(Ps_.*|psoas)$/], ['Iliacus', /^iliacus$/],
  ['Gluteus medius', /^glmed\d$/], ['Gluteus maximus', /^glmax\d$/], ['Gluteus minimus', /^glmin\d$/], ['Piriformis', /^piri$/],
  ['Tensor fasciae latae', /^tfl$/], ['Rectus femoris', /^recfem$/], ['Vastus lateralis', /^vaslat$/],
  ['Vastus intermedius', /^vasint$/], ['Vastus medialis', /^vasmed$/], ['Sartorius', /^sart$/], ['Adductor brevis', /^addbrev$/],
  ['Adductor magnus', /^addmag(Dist|Isch|Mid|Prox)$/], ['Adductor longus', /^addlong$/], ['Gracilis', /^grac$/],
  ['Semitendinosus', /^semiten$/], ['Semimembranosus', /^semimem$/], ['Biceps femoris: long head', /^bflh$/],
  ['Biceps femoris: short head', /^bfsh$/], ['Gastrocnemius: medial head', /^gasmed$/], ['Gastrocnemius: lateral head', /^gaslat$/],
  ['Soleus', /^soleus$/], ['Tibialis anterior', /^tibant$/], ['Phalangeal extensors', /^(edl|ehl)$/], ['Fibulari', /^per(long|brev)$/],
  ['Tibialis posterior', /^tibpost$/], ['Flexor digitorum longus', /^fdl$/], ['Flexor hallucis longus', /^fhl$/],
];
/* мышцы пальцев: MyoSim (2–5 — указательный…мизинец) → MoBL-ARMS (I, M, R, L) */
const DIGIT = { 2: 'I', 3: 'M', 4: 'R', 5: 'L' };
function source(base) {
  if (P.rajagopal2016[base + '_r']) return P.rajagopal2016[base + '_r'];
  const d = base.match(/^(FDS|FDP|EDC)(\d)$/);
  if (d) return P.mobl[d[1] + DIGIT[d[2]]];
  return P.mobl[base] || P.das3[base] || null;
}
/* брюшко: [шаблон, b — доля пути (или ключ Ward 2009), s — доля сухожилий в начале пути] */
const BELLY = [
  /* ноги: путь — от начала (таз, бедро, голень) к прикреплению */
  [/^psoas$/, .75, 0], [/^iliacus$/, 'iliacus', 0], [/^glmax\d$/, 'glmax', .1], [/^glmed\d$/, 'glmed', .1], [/^glmin\d$/, .85, .1],
  [/^piri$/, .7, .05], [/^tfl$/, .33, .05], [/^sart$/, 'sart', .3], [/^recfem$/, 'recfem', .35], [/^vas(lat|int|med)$/, null, .1],
  [/^grac$/, 'grac', .25], [/^addlong$/, 'addlong', .3], [/^addbrev$/, 'addbrev', .3], [/^addmag/, 'addmag', .3],
  [/^bflh$/, 'bflh', .35], [/^bfsh$/, 'bfsh', .1], [/^semiten$/, 'semiten', .25], [/^semimem$/, 'semimem', .45],
  [/^(tibant|ehl|edl|perlong|perbrev|fhl|fdl|tibpost|soleus)$/, null, .05], [/^gas(med|lat)$/, null, .1],
  /* плечо: путь — от плечевой кости (сухожилие прикрепления — в начале) */
  [/^(DELT\d|PECM\d)$/, .85, .9], [/^(SUPSP|INFSP|SUBSC|TMIN|TMAJ)$/, .8, .9], [/^LAT\d$/, .75, .6], [/^CORB$/, .8, .3],
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
  [/^QL_/, .9, .5], [/^MF_/, .85, .5], [/^(EO|IO)\d$/, .7, .9],
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
const B_MIN = .3, B_MAX = .92;
const base = n => n.replace(/_[rl]$/, '');

/* stature, mass — рост и масса манекена; lengths — длины путей в нейтральной позе (см) по имени линии */
function volumes(names, fmax, lengths, { stature, mass }) {
  const k = stature * mass / (A.mri.height * A.mri.mass), kw = stature / A.ward2009.height, out = {};
  const belly = n => {
    const b0 = base(n), row = BELLY.find(([re]) => re.test(b0));
    if (!row) throw Error('нет правила брюшка: ' + n);
    let [, b, s] = row;
    if (b === null) b = WARD_OF[b0];
    if (typeof b === 'string') b = A.ward2009.rows[b][0] * kw / lengths[n];
    return { b: Math.min(B_MAX, Math.max(B_MIN, b)), s };
  };
  const weight = n => {
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
      let parts = lines.map(n => [n, weight(n)]);
      if (g === 'Psoas major') {
        /* общая часть (psoas) и пучки от позвонков (Ps_*): объём — по длинам, пучки между собой — по весам */
        const low = parts.filter(([n]) => base(n) === 'psoas'), up = parts.filter(([n]) => base(n) !== 'psoas');
        const fUp = up.reduce((s, [, w]) => s + w, 0), lUp = up.reduce((s, [n, w]) => s + lengths[n] * w, 0) / fUp;
        const lLow = lengths[low[0][0]], vLow = V * lLow / (lUp + lLow);
        out[low[0][0]] = { v: vLow, group: g };
        for (const [n, w] of up) out[n] = { v: (V - vLow) * w / fUp, group: g };
      } else {
        const sum = parts.reduce((s, [, w]) => s + w, 0);
        for (const [n, w] of parts) out[n] = { v: V * w / sum, group: g };
      }
      lines.forEach(n => assigned.add(n));
    }
    /* внутренняя косая — по наружной */
    const eo = mine.filter(n => /^EO\d$/.test(base(n))), io = mine.filter(n => /^IO\d$/.test(base(n)));
    const wEO = eo.reduce((s, n) => s + weight(n), 0), vEO = eo.reduce((s, n) => s + out[n].v, 0);
    for (const n of io) { out[n] = { v: vEO * weight(n) / wEO, group: 'Internal oblique (по наружной)' }; assigned.add(n); }
  }
  const missing = names.filter(n => !assigned.has(n));
  if (missing.length) throw Error('мышцы без объёма: ' + missing.join(', '));
  for (const n of names) {
    const { b, s } = belly(n), L = lengths[n], t = L * (1 - b);
    Object.assign(out[n], { t0: t * s, t1: t * (1 - s), b });
  }
  return out;
}
module.exports = { volumes, GROUPS, BELLY, ORIGIN, source };
