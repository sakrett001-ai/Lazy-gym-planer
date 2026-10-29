'use strict';
/* Кривые «угол сустава — момент» (нормированы на пик) для подбора кулачков рычажных тренажёров (cam-design.js) и проверки
   tools/lever-stacks.test.js. Модель — две половины гауссианы вокруг угла пика: f(θ) = exp(−((θ − θпик)/w)²), w — своя
   для меньших и больших углов. Ширины не подобраны «на глаз»: каждая выведена из чисел источника (anchors). Угол — сгибание
   колена, 0° — прямая нога. Сила (Н·м на кг массы тела, одна нога) — для проверки энергией: какую долю силы среднего мужчины
   даёт весь стек тренажёра. */
const half = (peak, wLow, wHigh) => th => Math.exp(-(((th - peak) / (th < peak ? wLow : wHigh)) ** 2));
/* ширина половины по отношению моментов r = f(a)/f(b) на ней: (b−p)² − (a−p)² = w²·ln r */
const widthFrom = (peak, a, b, r) => Math.sqrt(((b - peak) ** 2 - (a - peak) ** 2) / Math.log(r));

/* Разгибание колена (четырёхглавая мышца), сидя, бедро согнуто ~80–90°.
   Пик 65°: Lanza, Balshaw, Folland 2019 (Eur J Appl Physiol 119:1735–1746) — 28 мужчин, бедро 65°, углы 35/50/65/80/95°,
   изометрический момент наибольший при 65° (перевёрнутая U).
   Ширины: Folland, Morris 2008 (J Sports Sci 26(2):163–169) — 10 мужчин, пять углов: момент растёт на ~40 % от 1,75 до
   1,40 рад (100° → 80°) и падает на ~60 % от 1,05 до 0,35 рад (60° → 20°); там же 8 серийных кулачковых тренажёров
   шести производителей: на нисходящей ветви их момент меняется от +37,6 до −20,5 %, т. е. они «площе» человека.
   Сверка: Šarabon, Kozinc, Perman 2021 (Front Physiol 12:767941, обзор): взрослые мужчины 1,79 Н·м/кг при 10–45°,
   3,19 — при 50–70°, 2,78 — при 80–110° (отношения 0,56 и 0,87); Haffajee, Moritz, Svantesson 1972 (Acta Orthop Scand
   43:138–147): пик ~50°, при 10° ~50 % — расходится с Folland & Morris, в модель не входит, на графике — точкой. */
const EXT_PEAK = 65, EXT_LOW = widthFrom(EXT_PEAK, 20, 60, .4), EXT_HIGH = widthFrom(EXT_PEAK, 100, 80, 1 / 1.4);
/* Сгибание колена (задняя поверхность бедра), лёжа на животе (бедро разогнуто, 0–25°).
   Пик 25°: Onishi et al. 2002 (J Electromyogr Kinesiol 12(5):399–406) — лёжа, изокинетика 30°/с: пик при 15–30°, дальше
   спад; изометрия 60° > 90°. Onishi et al. 1999 (Jpn J Phys Fit Sports Med 48:485–492) — 10 мужчин, лёжа: пик при 15–30°
   и 30–45° (два замера) равен 124 % и 116,6 % среднего момента при 75–90°, т. е. f(82,5°) ≈ 0,81–0,86 → 0,835.
   Fiebert et al. 1996 (Isokinet Exerc Sci 6(2):157–162): лёжа, изометрия 30° > 60° > 90°.
   Pizzimenti 1992 (Can J Sport Sci 17(1):41–48): кулачок Nautilus для сгибания ног лёжа не повторяет кривую силы (p < 0,001).
   За 90° данных нет — продолжение гауссианой (допущение). */
const FLEX_PEAK = 25, FLEX_W = widthFrom(FLEX_PEAK, 82.5, FLEX_PEAK, .835);

/* ---------- Этап 2: жимы, тяга, отведение и приведение бёдер, голеностоп ---------- */
/* монотонная кубическая интерполяция (Fritsch–Carlson) по точкам источника: гладкая цель без выбросов между точками;
   за крайними точками — продолжение крайнего наклона (не дальше 5°, дальше — постоянная) */
function pchip(pts) {
  const x = pts.map(p => p[0]), y = pts.map(p => p[1]), n = x.length, h = [], d = [], m = new Array(n);
  for (let i = 0; i + 1 < n; i++) { h.push(x[i + 1] - x[i]); d.push((y[i + 1] - y[i]) / h[i]); }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i + 1 < n; i++) {
    const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  }
  return th => {
    if (th <= x[0]) return y[0] + m[0] * Math.max(th - x[0], -5);
    if (th >= x[n - 1]) return y[n - 1] + m[n - 1] * Math.min(th - x[n - 1], 5);
    let i = 0; while (th > x[i + 1]) i++;
    const t = (th - x[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * y[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}
const poly = c => x => c.reduce((s, k, i) => s + k * x ** i, 0);
const maxOn = (g, a, b) => { let m = -Infinity; for (let x = a; x <= b; x += .25) m = Math.max(m, g(x)); return m; };
/* Bober, Kulig, Burnfield, Pietraszewski 2002 (Acta Bioeng Biomech 4(2)) — уравнения момента (% пика) по углу сустава,
   22 мужчины, изокинетика 1 рад/с, усреднённые кривые. Нормируем на наибольшее значение уравнения в проверенном диапазоне.
   Разгибатели локтя: Y = −10,42 + 3,65x − 0,038x² + 0,0001x³, x — сгибание локтя (0° — прямая рука), 15–120°, пик ~65–75°.
   Разгибатели плеча: Y = 61,41 + 0,72x − 0,001x² − 0,00002x³, x — сгибание плеча (0° — рука вдоль корпуса, + вперёд),
   −45…120°, пик 90°; коэффициент вариации у пика 6,9–9,9 %. */
const BOB_EL = poly([-10.42, 3.65, -0.038, 0.0001]), BOB_EL_MAX = maxOn(BOB_EL, 15, 120);
const BOB_SH = poly([61.41, 0.72, -0.001, -0.00002]), BOB_SH_MAX = maxOn(BOB_SH, -45, 120);
/* Подъём плеча (жим вверх): до 90° — Timmons, Stevens, Pincivero 2005 (ISB/ASB, Кливленд): изометрия, отведение в плоскости
   лопатки, 15/30/45/60/75/90° — 55,2; 54,1; 49,9; 48,1; 45,4; 45,7 Н·м; выше 90° — Aronis et al. 2026 (J Funct Morphol Kinesiol
   11(1):20): сгибание стоя, 14 мужчин, 90–160° через 10°, 77,24 Н·м при 90° и 43,19 при 160°, нормированный момент
   y = −0,6317x + 157,21 (R² = 0,99). Склейка при 90°: отрезок Aronis масштабирован на значение Timmons при 90°. Допущение:
   плоскости разные (лопатка и сагиттальная), у жима плечо идёт между ними (отведение 35–61°, сгибание 34–166°). */
const TIM = [[15, 55.2], [30, 54.1], [45, 49.9], [60, 48.1], [75, 45.4], [90, 45.7]], ARO = x => -0.6317 * x + 157.21;
const ELEV_PTS = TIM.map(([x, v]) => [x, v / 55.2]).concat([100, 110, 120, 130, 140, 150, 160].map(x => [x, 45.7 / 55.2 * ARO(x) / ARO(90)]));
/* Подошвенное сгибание: Maganaris, Baltzopoulos, Sargeant 1998 (Exp Physiol 83:843–855), табл. 4: изометрия лёжа, колено 90°,
   6 человек, более сильная нога: −19,5° (тыльное сгибание) 150 Н·м, −15° — 160, 0° — 119, +15° — 74, +30° — 32, +35° — 30.
   Колено согнуто — работает в основном камбаловидная; стоя с прямыми коленями добавляется икроножная (сила больше),
   форма кривой — допущение «та же». */
const MAG = [[-19.5, 150], [-15, 160], [0, 119], [15, 74], [30, 32], [35, 30]];
/* Отведение и приведение бедра сидя (бедро согнуто ~76°). Кривых «угол — момент» с числами для этой позы не нашли (Neumann 1988,
   Kindel & Challis 2017, Olson 1972 — только «убывает от приведения к отведению», в доступных текстах без чисел), поэтому:
   * угол пика — по источникам с числами: отводящие — 13 ± 5° отведения (Stotz et al. 2022, BMC Sports Sci Med Rehabil 14:13:
     пик концентрической кривой, лёжа на боку, 0–60°), приводящие — 35–37° (Marušič, Cvjetičanin, Šarabon 2025, PLOS ONE
     20(11):e0336699: изокинетика при сгибании бедра 0, 45 и 90°, ход 42,7 ± 13,5°);
   * спад от пика — оценка по экскурсии волокон: каждая мышца группы на пике — на оптимальной длине, длина волокна меняется
     на r·Δθ (r — плечо мышцы, см/рад, по путям мышц приложения в этих же позах тренажёра: −dL/dθ), сила–длина — Thelen 2003
     (J Biomech Eng 125:70–77): exp(−(Δl/Lopt)²/γ), γ = 0,45; Lopt и F — Rajagopal et al. 2016 (tools/muscles/fixtures/params.json);
     момент группы — сумма F·r·exp(…) по мышцам. Сухожилие считается нерастяжимым, пассивная сила не учитывается — спад
     оценён сверху (настоящий, вероятно, круче). */
const fiberCurve = (peak, ms) => {
  const g = Math.sqrt(.45), S = ms.reduce((s, m) => s + m[1] * m[3], 0);
  return th => ms.reduce((s, [, F, Lo, r]) => s + F * r * Math.exp(-(((th - peak) * Math.PI / 180 * r / (Lo * g)) ** 2)), 0) / S;
};
/* [мышца, F Н, Lopt см, r см/рад] — r из путей мышц в позах abduction / adduction (среднее по ходу) */
const HIP_ABD_MS = [['glmax1', 983.78, 14.7, 2.43], ['glmax2', 1406.05, 15.7, 2.87], ['glmed1', 1093.47, 7.3, .55], ['glmed2', 765.09, 7.3, 2.21],
  ['glmed3', 871.2, 7.3, 3.3], ['glmin1', 374.05, 6.8, .3], ['glmin2', 394.82, 5.6, 1.4], ['glmin3', 446.77, 3.8, 2.37], ['piri', 1029.79, 2.6, 3.0],
  ['tfl', 411.21, 9.5, 2.34], ['sart', 249.41, 40.3, 1.54], ['recfem', 2191.74, 7.59, .64]];
const HIP_ADD_MS = [['addbrev', 625.82, 10.31, 6.52], ['addlong', 916.8, 10.82, 8.19], ['addmagDist', 597.3, 17.72, 3.21], ['addmagIsch', 597.3, 15.62, 3.04],
  ['addmagMid', 597.3, 13.77, 4.61], ['addmagProx', 597.3, 10.56, 4.75], ['grac', 281.31, 22.78, 6.33]];
const CURVES = {
  kneeExtension: {
    name: 'Разгибание колена (сидя)', joint: 'knee', peak: EXT_PEAK, w: [EXT_LOW, EXT_HIGH], f: half(EXT_PEAK, EXT_LOW, EXT_HIGH),
    /* опорные точки модели и сверочные точки (на графике) */
    anchors: [{ th: 65, v: 1, src: 'Lanza 2019: пик 65°' }, { th: 100, v: null, ratio: [80, 1.4], src: 'Folland & Morris 2008: +40 % 100→80°' },
      { th: 20, v: null, ratio: [60, .4], src: 'Folland & Morris 2008: −60 % 60→20°' }],
    checks: [{ th: [10, 45], v: .56, src: 'Šarabon 2021: 1,79 / 3,19 Н·м/кг' }, { th: [80, 110], v: .87, src: 'Šarabon 2021: 2,78 / 3,19 Н·м/кг' }, { th: 10, v: .5, src: 'Haffajee 1972' }],
    /* сила одной ноги на пике, Н·м/кг: Šarabon 2021, взрослые мужчины, 50–70° */
    nmPerKg: 3.19, nmSrc: 'Šarabon, Kozinc, Perman 2021: 3,19 Н·м/кг (мужчины, 50–70°)'
  },
  kneeFlexionProne: {
    name: 'Сгибание колена (лёжа)', joint: 'knee', peak: FLEX_PEAK, w: [FLEX_W, FLEX_W], f: half(FLEX_PEAK, FLEX_W, FLEX_W),
    anchors: [{ th: 25, v: 1, src: 'Onishi 1999, 2002: пик 15–45°' }, { th: 82.5, v: .835, src: 'Onishi 1999: 1/1,24 и 1/1,166 при 75–90°' }],
    checks: [{ th: 82.5, v: .81, src: 'Onishi 1999, замер 1' }, { th: 82.5, v: .86, src: 'Onishi 1999, замер 2' }],
    /* сила одной ноги на пике, Н·м/кг: Šarabon 2021 (сидя, 50–70°: 1,39) × лёжа/сидя 0,88 (Findley et al. 2006, J Sports Sci
       Med 5:400–406: пиковый момент сгибания 87,1 против 99,2 Н·м при 60°/с) */
    nmPerKg: 1.39 * 87.1 / 99.2, nmSrc: 'Šarabon 2021 (1,39 Н·м/кг сидя) × 0,88 лёжа/сидя (Findley et al. 2006)'
  },
  /* главный сустав жима от груди — локоть: у горизонтального приведения плеча (большая грудная) кривой с числами не нашли */
  elbowExtension: {
    name: 'Разгибание локтя', joint: 'elbow', peak: 64, f: th => BOB_EL(th) / BOB_EL_MAX,
    anchors: [15, 30, 45, 60, 75, 90, 105, 120].map(th => ({ th, v: BOB_EL(th) / BOB_EL_MAX, src: 'Bober 2002' })), checks: [],
    nm: null, nmSrc: 'нет числа для мужчин в Н·м (проверка силы не делается)'
  },
  shoulderExtension: {
    name: 'Разгибание плеча', joint: 'shoulderFlex', peak: 94, f: th => BOB_SH(th) / BOB_SH_MAX,
    anchors: [-45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120].map(th => ({ th, v: BOB_SH(th) / BOB_SH_MAX, src: 'Bober 2002' })), checks: [],
    nm: null, nmSrc: 'нет числа для мужчин в Н·м (проверка силы не делается)'
  },
  shoulderElevation: {
    name: 'Подъём плеча', joint: 'shoulderElev', peak: 15, f: pchip(ELEV_PTS),
    anchors: ELEV_PTS.map(([th, v]) => ({ th, v, src: th <= 90 ? 'Timmons 2005' : 'Aronis 2026' })), checks: [{ th: 140, v: 45.7 / 55.2 * .672, src: 'Aronis 2026: 67,2 % при 140°' }],
    nm: 77.24, nmAt: 90, nmSrc: 'Aronis et al. 2026: 77,24 Н·м при сгибании 90° (14 мужчин)'
  },
  plantarFlexion: {
    name: 'Подошвенное сгибание', joint: 'plantar', peak: -15, f: pchip(MAG.map(([x, v]) => [x, v / 160])),
    anchors: MAG.map(([th, v]) => ({ th, v: v / 160, src: 'Maganaris 1998' })), checks: [],
    nm: 160, nmAt: -15, nmSrc: 'Maganaris et al. 1998: 160 Н·м при −15° (колено 90°, 6 человек)'
  },
  hipAbduction: {
    name: 'Отведение бедра (сидя)', joint: 'hipAbd', peak: 13, f: fiberCurve(13, HIP_ABD_MS),
    anchors: [{ th: 13, v: 1, src: 'Stotz 2022: пик 13 ± 5°' }], checks: [], muscles: HIP_ABD_MS,
    nm: 112, nmAt: 0, nmSrc: 'Lanza et al. 2021 (Front Physiol 12:744153): 112 ± 23 Н·м, лёжа, бедро разогнуто'
  },
  hipAdduction: {
    name: 'Приведение бедра (сидя)', joint: 'hipAbd', peak: 36, f: fiberCurve(36, HIP_ADD_MS),
    anchors: [{ th: 36, v: 1, src: 'Marušič 2025: пик 35–37°' }], checks: [], muscles: HIP_ADD_MS,
    nm: 76, nmAt: 0, nmSrc: 'Lanza et al. 2021 (Front Physiol 12:744153): 76 ± 20 Н·м, лёжа, бедро разогнуто'
  }
};
/* угол сустава кривой в позе R (среднее двух сторон) — в соглашении кривой */
const JOINT = {
  knee: a => a.knee, elbow: a => a.elbow, shoulderFlex: a => a.flexion, shoulderElev: a => a.elevation, plantar: a => -a.dorsi, hipAbd: a => a.hipAbd
};
const JOINT_NAME = { knee: 'колено', elbow: 'локоть', shoulderFlex: 'сгибание плеча', shoulderElev: 'подъём плеча', plantar: 'подошвенное сгибание', hipAbd: 'отведение бедра' };
function angleOf(curve, R) {
  const M = require('../../src/js/09bm-mannequin.js'), a = M.jointAngles(R), g = JOINT[curve ? curve.joint : 'knee'];
  return (g(a.L) + g(a.R)) / 2;
}
Object.defineProperty(CURVES, 'angleOf', { value: angleOf });
Object.defineProperty(CURVES, 'JOINT_NAME', { value: JOINT_NAME });
module.exports = CURVES;
