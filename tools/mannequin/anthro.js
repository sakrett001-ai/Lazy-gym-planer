'use strict';
/* Пропорции манекена против живых людей: замеры манекена по тем же точкам и правилам, что в обследовании ANSUR II,
   и сравнение со сводкой tools/mannequin/anthro-ansur2.json (мужчины 170–180 см, 72–84 кг — как манекен).
   node tools/mannequin/anthro.js [--json файл]
   Кожа — по тем же формам, что у валидатора (torsoSDF, limbSDF, «шапки» суставов, голова, шея, кисть, стопа);
   костные точки (акромион, гребень таза, вертел, надколенник, лодыжка, шиловидный отросток) — по скелету (09bq).
   Обхват — периметр выпуклой оболочки сечения (как ложится сантиметровая лента), ширина и глубина — габариты сечения.
   Замер стоя: нейтральная поза манекена (руки вдоль тела); длины руки — с локтем, согнутым на 90°, как в обследовании. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), SK = require(root + '/src/js/09bq-skeleton.js');
const REF = require('./anthro-ansur2.json');
const { V, FLOOR, B } = M;
const H = p => FLOOR - p[1]; /* высота над полом, см */
const skeleton = SK.decode(zlib.gunzipSync(fs.readFileSync(root + '/src/data/skeleton.bin')));

/* ---------- голова: замеры по форме (рамка головы: x — влево, y — вверх, z — вперёд, см) ---------- */
const hsdf = p => M.headLocalSDF(p, false);
/* луч из точки o в направлении d до поверхности (без ушей) */
function cast(o, d, hi = 16) { let lo = 0; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (hsdf(V.add(o, d, m)) < 0) lo = m; else hi = m; } return V.add(o, d, lo); }
const rayUp = z => cast([0, 0, z], [0, 1, 0])[1];
/* сечение плоскостью y = const: точки поверхности по кругу из (0, y, 0) */
const ring = (y, n = 360) => Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return cast([0, y, 0], [Math.sin(a), 0, Math.cos(a)]); });
const perimXZ = P => P.reduce((s, p, i) => s + Math.hypot(p[0] - P[(i + 1) % P.length][0], p[2] - P[(i + 1) % P.length][2]), 0);
/* профиль средней линии лица: z передней поверхности на высоте y */
const front = y => cast([0, y, 0], [0, 0, 1])[2];
function headMeasures() {
  const out = {}, E = M.HEAD_EARS.L;
  let top = -Infinity; for (let z = -4; z <= 4; z += .1) top = Math.max(top, rayUp(z));
  /* ширина — наибольшая выше ушей; длина — от надпереносья до затылка (выше переносицы); обхват — по горизонтали
     на уровне наибольшей длины (над надбровьями, через затылочный бугор) */
  let breadth = 0, length = 0, ly = 0;
  for (let y = -1; y <= 8; y += .25) { const r = ring(y, 240); breadth = Math.max(breadth, 2 * Math.max(...r.map(p => Math.abs(p[0])))); if (y < 1.5) continue; const L = front(y) - cast([0, y, 0], [0, 0, -1])[2]; if (L > length) { length = L; ly = y; } }
  out.headbreadth = breadth; out.headlength = length; out.headcircumference = perimXZ(ring(ly));
  /* переносица — самая глубокая точка профиля между надпереносьем и кончиком носа; ментон — нижняя точка подбородка */
  const prof = []; for (let y = 4; y >= -12; y -= .05) prof.push([y, front(y)]);
  const tip = prof.filter(p => p[0] < 0 && p[0] > -6).reduce((a, b) => b[1] > a[1] ? b : a);
  const sell = prof.filter(p => p[0] > tip[0] && p[0] < 2.5).reduce((a, b) => b[1] < a[1] ? b : a);
  const pog = prof.filter(p => p[0] < -8 && p[0] > -10.8).reduce((a, b) => b[1] > a[1] ? b : a);
  let men = null; for (let z = 2; z <= 9; z += .05) { const y = cast([0, 0, z], [0, -1, 0])[1]; if (!men || y < men[0]) men = [y, z]; }
  out.mentonsellionlength = sell[0] - men[0];
  /* скулы — наибольшая ширина передней половины лица на уровне скуловых дуг (y −2,5…−0,5, ниже висков) */
  let biz = 0; for (let y = -2.5; y <= -.5; y += .25) biz = Math.max(biz, 2 * Math.max(...ring(y).filter(p => p[2] > 1.5).map(p => Math.abs(p[0]))));
  out.bizygomaticbreadth = biz;
  /* козелок — у переднего края уха, чуть ниже его середины */
  const trag = [E.c[0] - .3, E.c[1] - .3, E.c[2] + E.r[2] * .85];
  out.tragiontopofhead = top - trag[1];
  out.earlength = 2 * E.r[1]; out.earbreadth = 2 * E.r[2];
  { let maxX = 0; for (let a = 0; a < 2 * Math.PI; a += .05) for (let b = -Math.PI / 2; b <= Math.PI / 2; b += .05) { const l = [E.r[0] * Math.cos(b) * Math.cos(a), E.r[1] * Math.sin(b), E.r[2] * Math.cos(b) * Math.sin(a)]; maxX = Math.max(maxX, E.c[0] + E.ax[0][0] * l[0] + E.ax[1][0] * l[1] + E.ax[2][0] * l[2]); }
    out.earprotrusion = maxX - Math.max(...ring(E.c[1]).filter(p => p[0] > 0 && Math.abs(p[2] - E.c[2]) < 1).map(p => p[0])); }
  /* дуги «козелок — подбородок — козелок» и «козелок — под челюстью — козелок»: по плоскости через оба козелка
     и переднюю точку подбородка (ментон для подчелюстной — приближённо) */
  for (const [key, C] of [['bitragionchinarc', [0, pog[0], pog[1]]], ['bitragionsubmandibulararc', [0, men[0], men[1]]]]) {
    const o = [0, trag[1], trag[2]], w = V.unit(V.sub(C, o)), pts = [];
    for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI; pts.push(cast(o, V.add(V.scale([1, 0, 0], Math.cos(a)), w, Math.sin(a)))); }
    out[key] = pts.reduce((s, p, i) => i ? s + V.dist(p, pts[i - 1]) : 0, 0);
  }
  return out;
}

function setup(q) {
  const R = M.catalogPose(q), body = M.bodyData(R), cache = M.torsoCache(R), mats = SK.frames(R, body, skeleton.bones);
  const bone = (name, side = '') => {
    const i = skeleton.bones.findIndex(b => b.name === name && (b.side || '') === side), w = SK.worldPoints(skeleton.bones[i], mats, i), out = [];
    for (let j = 0; j < w.length; j += 3) out.push([w[j], w[j + 1], w[j + 2]]);
    return out;
  };
  const cap = key => body.caps.find(c => c.key === key);
  const sdf = {
    torso: p => M.torsoSDF(R, p, cache),
    thigh: s => p => M.limbSDF(R, 'th', s, p),
    arm: s => p => Math.min(M.limbSDF(R, 'ua', s, p), M.V.dist(p, cap('sh' + s).c) - cap('sh' + s).r)
  };
  return { R, body, bone, cap, sdf };
}

/* ---------- геометрия сечений ---------- */
function hull(pts) { /* выпуклая оболочка точек [x, z] */
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length > 1 && cr(hi.at(-2), hi.at(-1), q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
const perimeter = pts => { const h = hull(pts); let s = 0; for (let i = 0; i < h.length; i++) s += Math.hypot(h[i][0] - h[(i + 1) % h.length][0], h[i][1] - h[(i + 1) % h.length][1]); return s; };
const extent = (pts, k) => Math.max(...pts.map(p => p[k])) - Math.min(...pts.map(p => p[k]));
/* горизонтальное сечение на высоте h: внешняя граница области, где хотя бы одна форма из списка < 0 */
function slice(h, fns, center = [0, 0], rMax = 45, n = 360) {
  const y = FLOOR - h, f = p => Math.min(...fns.map(g => g(p))), out = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * Math.PI, d = [Math.cos(a), 0, Math.sin(a)], at = r => [center[0] + d[0] * r, y, center[1] + d[2] * r];
    let r = rMax; while (r > 0 && f(at(r)) > 0) r -= .25;
    if (r <= 0) continue;
    let a0 = r, a1 = r + .25; for (let k = 0; k < 20; k++) { const m = (a0 + a1) / 2; if (f(at(m)) < 0) a0 = m; else a1 = m; }
    const p = at(a0); out.push([p[0], p[2]]);
  }
  return out;
}
/* кольцо конечности поперёк оси (лента вокруг руки или ноги) */
const limbRing = (R, kind, s, t, n = 120) => { const row = M.limbRow(R, kind, s, t); return Array.from({ length: n }, (_, i) => { const p = row(i / n * 2 * Math.PI); return p; }); };
const ringPerimeter3 = pts => { let s = 0; for (let i = 0; i < pts.length; i++) s += V.dist(pts[i], pts[(i + 1) % pts.length]); return s; };
const maxBy = (arr, f) => arr.reduce((a, b) => f(b) > f(a) ? b : a);
const minBy = (arr, f) => arr.reduce((a, b) => f(b) < f(a) ? b : a);
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);

/* ---------- замеры (по текущим формам манекена; подбор форм вызывает measure() после правки таблиц) ---------- */
function measure() {
  const N = setup(M.neutral());
  const qFlex = M.neutral(); qFlex.L.elbow = 90; qFlex.hands = { L: 'flat', R: 'relaxed' };
  const F = setup(qFlex);
  const m = {}, note = {};
  const R = N.R, ref = k => REF.values[k][1];

  /* рост: верх головы (точки её поверхности) */
  { let top = -Infinity; for (const l of M.headSamples()) top = Math.max(top, H(M.headWorld(R, l)));
    for (let z = -4; z <= 4; z += .25) top = Math.max(top, H(M.headWorld(R, [0, rayUp(z), z])));
    m.stature = top; }

  /* костные точки */
  const scap = N.bone('scapula', 'L'), xMax = Math.max(...scap.map(p => p[0]));
  const acromion = maxBy(scap.filter(p => p[0] > xMax - 2), p => H(p));
  m.acromialheight = H(acromion);
  m.biacromialbreadth = 2 * xMax;
  const cerv = N.bone('cervical'), cervLow = Math.min(...cerv.map(H));
  m.cervicaleheight = H(minBy(cerv.filter(p => H(p) < cervLow + 3), p => p[2]));
  const rib = N.bone('ribcage'), ribZ = rib.reduce((s, p) => s + p[2], 0) / rib.length;
  m.suprasternaleheight = Math.max(...rib.filter(p => Math.abs(p[0]) < 1.5 && p[2] > ribZ).map(H));
  const pel = N.bone('pelvis_L', 'L');
  m.iliocristaleheight = Math.max(...pel.map(H));
  m.bicristalbreadth = 2 * Math.max(...pel.map(p => p[0]));
  const fem = N.bone('femur', 'L'), femX = Math.max(...fem.map(p => p[0]));
  m.trochanterionheight = Math.max(...fem.filter(p => p[0] > femX - 1.5).map(H));
  const pat = N.bone('patella', 'L'), patC = pat.reduce((a, p) => V.add(a, p, 1 / pat.length), [0, 0, 0]);
  m.kneeheightmidpatella = H(patC);
  const tib = N.bone('tibia', 'L'), tibX = tib.reduce((s, p) => s + p[0], 0) / tib.length;
  m.tibialheight = Math.max(...tib.filter(p => p[0] < tibX).map(H));
  const fib = N.bone('fibula', 'L'), fibLow = Math.min(...fib.map(H));
  m.lateralmalleolusheight = H(maxBy(fib.filter(p => H(p) < fibLow + 2), p => p[0])); /* самая наружная точка нижних 2 см малоберцовой */
  const rad = N.bone('radius', 'L'), stylion = minBy(rad, H), radiale = maxBy(rad, H);
  m.wristheight = H(stylion);
  m.radialestylionlength = V.dist(radiale, stylion);
  m.acromionradialelength = V.dist(acromion, radiale);

  /* промежность: снизу вверх по средней линии до кожи корпуса (бёдра у живого человека раздвигает щуп антропометра) */
  { const z = M.spineFrame(R, M.TORSO[0][0]).c[2]; let h = 60;
    while (h < 100 && N.sdf.torso([0, FLOOR - h, z]) > 0) h += .05; m.crotchheight = h; }

  /* уровни из обследования: на них и меряем */
  const lvl = { chest: ref('chestheight'), waist: ref('waistheightomphalion'), buttock: ref('buttockheight') };
  const chest = slice(lvl.chest, [N.sdf.torso]), waist = slice(lvl.waist, [N.sdf.torso]);
  m.chestcircumference = perimeter(chest); m.chestbreadth = extent(chest, 0); m.chestdepth = extent(chest, 1);
  m.waistcircumference = perimeter(waist); m.waistbreadth = extent(waist, 0); m.waistdepth = extent(waist, 1);
  const butt = slice(lvl.buttock, [N.sdf.torso, N.sdf.thigh('L'), N.sdf.thigh('R')]);
  m.buttockcircumference = perimeter(butt); m.buttockdepth = extent(butt, 1);
  /* ширина бёдер стоя — наибольшая между гребнями таза и промежностью */
  { let best = 0; for (const h of range(m.crotchheight, m.iliocristaleheight, 30)) best = Math.max(best, extent(slice(h, [N.sdf.torso, N.sdf.thigh('L'), N.sdf.thigh('R')]), 0)); m.hipbreadth = best; }
  /* плечи: уровень наибольшей ширины по дельтам */
  { let best = { b: 0 }; for (const h of range(m.acromialheight - 16, m.acromialheight, 32)) { const s = slice(h, [N.sdf.torso, N.sdf.arm('L'), N.sdf.arm('R')], [0, 0], 50); const b = extent(s, 0); if (b > best.b) best = { b, h, s }; }
    m.bideltoidbreadth = best.b; m.shouldercircumference = perimeter(best.s); note.shouldercircumference = `на высоте ${best.h.toFixed(1)}`; }

  /* шея: самое узкое кольцо свободной части и основание */
  { const rings = N.body.neck.map(r => ringPerimeter3(r)); m.neckcircumference = Math.min(...rings.slice(2, 7)); m.neckcircumferencebase = rings[1]; }

  /* конечности: лента поперёк оси */
  const ringAt = (kind, t) => ringPerimeter3(limbRing(R, kind, 'L', t));
  const thT = h => { const a = R.hipL, b = R.knL; return (H(a) - h) / (H(a) - H(b)); };
  m.thighcircumference = ringAt('th', thT(m.crotchheight - 1)); note.thighcircumference = 'под ягодичной складкой';
  m.lowerthighcircumference = ringAt('th', thT(Math.max(...pat.map(H)))); note.lowerthighcircumference = 'над надколенником';
  m.calfcircumference = Math.max(...range(.05, .6, 22).map(t => ringAt('sk', t)));
  m.anklecircumference = Math.min(...range(.7, .93, 12).map(t => ringAt('sk', t)));
  m.bicepscircumferenceflexed = Math.max(...range(.3, .75, 18).map(t => ringAt('ua', t))); note.bicepscircumferenceflexed = 'у манекена рука расслаблена';
  m.forearmcircumferenceflexed = Math.max(...range(.05, .5, 18).map(t => ringAt('fa', t))); note.forearmcircumferenceflexed = 'у манекена кисть не сжата';
  m.wristcircumference = ringAt('fa', .95);

  /* голова и лицо — по форме головы в её рамке (не зависит от позы) */
  Object.assign(m, headMeasures());
  note.bitragionsubmandibulararc = 'дуга через ментон — приближённо'; note.bitragionchinarc = 'по плоскости сечения';

  /* кисть (ладонь раскрыта) и стопа */
  { /* кисть в своей рамке: −Y — к пальцам, Z — поперёк ладони (к большому пальцу) */
    const hs = M.handShape('flat', 'L');
    m.handlength = Math.max(...hs.fingers.map(f => -f.pts.at(-1)[1] + f.r));
    /* ширина по головкам пястных: ладонь (блок size[2]) или пальцы у основания — что шире */
    m.handbreadth = Math.max(hs.palm.size[2], Math.max(...hs.fingers.map(f => f.pts[0][2] + f.r)) - Math.min(...hs.fingers.map(f => f.pts[0][2] - f.r))); }
  { const fo = R.frames.footL, to = R.frames.toesL, pts = M.footPoints('L').map(pt => M.footPointWorld(fo, to, pt));
    m.footlength = extent(pts, 2); m.footbreadthhorizontal = extent(pts, 0); }

  /* длины руки с локтем под 90° (как в обследовании): от акромиона до низа локтя, от локтя сзади до кончика среднего пальца */
  { const Rf = F.R, el = F.cap('elL'), ulna = F.bone('ulna', 'L'), ac = maxBy(F.bone('scapula', 'L').filter(p => p[0] > xMax - 2), p => H(p));
    const bottom = Math.min(H(el.c) - el.r, ...ulna.map(H));
    m.shoulderelbowlength = H(ac) - bottom;
    const hs = M.handShape('flat', 'L'), hf = Rf.frames.handL, tip = V.add(V.add(V.add(hf.o, hf.x, hs.fingers[1].pts.at(-1)[0]), hf.y, hs.fingers[1].pts.at(-1)[1] - hs.fingers[1].r), hf.z, hs.fingers[1].pts.at(-1)[2]);
    const back = Math.min(el.c[2] - el.r, ...ulna.map(p => p[2]));
    m.forearmhandlength = tip[2] - back; }

  /* размах рук: плечевые суставы + прямые руки + кисть */
  m.span = 2 * (Math.abs(R.shL[0]) + B.ua + B.fa + m.handlength);
  m.weightkg = B.mass;
  return { m, note };
}

/* ---------- отчёт ---------- */
const GROUPS = [
  ['Рост и высоты точек', ['stature', 'cervicaleheight', 'acromialheight', 'suprasternaleheight', 'iliocristaleheight', 'trochanterionheight', 'crotchheight', 'kneeheightmidpatella', 'tibialheight', 'lateralmalleolusheight', 'wristheight']],
  ['Ширины и глубины', ['biacromialbreadth', 'bideltoidbreadth', 'chestbreadth', 'chestdepth', 'waistbreadth', 'waistdepth', 'bicristalbreadth', 'hipbreadth', 'buttockdepth']],
  ['Обхваты корпуса и шеи', ['chestcircumference', 'waistcircumference', 'buttockcircumference', 'shouldercircumference', 'neckcircumference', 'neckcircumferencebase']],
  ['Обхваты рук и ног', ['bicepscircumferenceflexed', 'forearmcircumferenceflexed', 'wristcircumference', 'thighcircumference', 'lowerthighcircumference', 'calfcircumference', 'anklecircumference']],
  ['Длины', ['acromionradialelength', 'radialestylionlength', 'shoulderelbowlength', 'forearmhandlength', 'span']],
  ['Голова и лицо', ['headcircumference', 'headlength', 'headbreadth', 'tragiontopofhead', 'mentonsellionlength', 'bizygomaticbreadth', 'bitragionchinarc', 'bitragionsubmandibulararc', 'earlength', 'earbreadth', 'earprotrusion']],
  ['Кисть и стопа', ['handlength', 'handbreadth', 'footlength', 'footbreadthhorizontal']],
  ['Масса', ['weightkg']]
];
const NAMES = {
  stature: 'Рост', cervicaleheight: 'Высота 7-го шейного позвонка', acromialheight: 'Высота акромиона', suprasternaleheight: 'Высота яремной вырезки',
  iliocristaleheight: 'Высота гребня таза', trochanterionheight: 'Высота большого вертела', crotchheight: 'Высота промежности', kneeheightmidpatella: 'Высота середины надколенника',
  tibialheight: 'Высота края большеберцовой', lateralmalleolusheight: 'Высота наружной лодыжки', wristheight: 'Высота запястья',
  biacromialbreadth: 'Ширина плеч по акромионам', bideltoidbreadth: 'Ширина плеч по дельтам', chestbreadth: 'Ширина груди', chestdepth: 'Глубина груди', waistbreadth: 'Ширина талии',
  waistdepth: 'Глубина талии', bicristalbreadth: 'Ширина таза по гребням', hipbreadth: 'Ширина бёдер', buttockdepth: 'Глубина ягодиц',
  chestcircumference: 'Обхват груди', waistcircumference: 'Обхват талии (пупок)', buttockcircumference: 'Обхват ягодиц', shouldercircumference: 'Обхват плеч',
  neckcircumference: 'Обхват шеи', neckcircumferencebase: 'Обхват основания шеи', bicepscircumferenceflexed: 'Обхват плеча (бицепс)', forearmcircumferenceflexed: 'Обхват предплечья',
  wristcircumference: 'Обхват запястья', thighcircumference: 'Обхват бедра', lowerthighcircumference: 'Обхват бедра над коленом', calfcircumference: 'Обхват голени',
  anklecircumference: 'Обхват над лодыжками', acromionradialelength: 'Плечо: акромион — головка лучевой', radialestylionlength: 'Предплечье: лучевая кость', shoulderelbowlength: 'Плечо — низ локтя (90°)',
  forearmhandlength: 'Локоть — кончик пальца (90°)', span: 'Размах рук', headcircumference: 'Обхват головы', headlength: 'Длина головы', headbreadth: 'Ширина головы',
  tragiontopofhead: 'Козелок — макушка', mentonsellionlength: 'Переносица — подбородок', bizygomaticbreadth: 'Ширина по скулам',
  bitragionchinarc: 'Дуга козелок — подбородок', bitragionsubmandibulararc: 'Дуга козелок — под челюстью', earlength: 'Длина уха', earbreadth: 'Ширина уха',
  earprotrusion: 'Выступ уха', handlength: 'Длина кисти', handbreadth: 'Ширина кисти', footlength: 'Длина стопы', footbreadthhorizontal: 'Ширина стопы', weightkg: 'Масса, кг'
};
function report() {
  const { m, note } = measure(), rows = [];
  for (const [g, keys] of GROUPS) for (const k of keys) {
    const [p25, p50, p75] = REF.values[k], v = m[k], sd = (p75 - p25) / 1.349, z = (v - p50) / sd;
    rows.push({ group: g, key: k, name: NAMES[k], p25, p50, p75, value: +v.toFixed(1), diff: +(v - p50).toFixed(1), pct: +(100 * (v - p50) / p50).toFixed(1), z: +z.toFixed(1), within: v >= p25 && v <= p75, note: note[k] || '' });
  }
  return rows;
}
module.exports = { measure, report, REF };
if (require.main === module) {
  const rows = report();
  if (process.argv.includes('--json')) { const f = process.argv[process.argv.indexOf('--json') + 1]; fs.writeFileSync(f, JSON.stringify({ ref: { n: REF.n, filter: REF.filter, citation: REF.citation }, rows }, null, 1)); }
  let g0 = '';
  for (const r of rows) {
    if (r.group !== g0) { console.log('\n' + r.group); g0 = r.group; }
    const mark = r.within ? '  ' : Math.abs(r.z) >= 2 ? '!!' : ' !';
    console.log(`${mark} ${r.name.padEnd(36)} ${String(r.value).padStart(6)}  люди ${String(r.p50).padStart(6)} (${r.p25}–${r.p75})  ${(r.diff > 0 ? '+' : '') + r.diff}  z ${r.z}${r.note ? '  ' + r.note : ''}`);
}
const out = rows.filter(r => !r.within);
console.log(`\nВне середины (25–75 %) у живых людей: ${out.length} из ${rows.length}; сильно (|z| ≥ 2): ${out.filter(r => Math.abs(r.z) >= 2).length}. Эталон: ${REF.n} мужчин, ${REF.filter}.`);
}
