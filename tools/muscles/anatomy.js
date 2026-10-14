'use strict';
/* Части мышц, которых нет в исходных моделях, — по анатомии (аудит прикреплений, tools/muscles/README.md).
   node tools/muscles/anatomy.js [вход.json] [выход.json]   (по умолчанию qa/muscles/muscles.json → он же; затем pack.js)
   До 4.34.0 скрипт назывался lat_anatomy.js и достраивал только широчайшую.

   1. Широчайшая спины (4.32.0) — поясничная и подвздошная части.
   В модели руки MoBL-ARMS (MyoSim) нет таза: все три пучка широчайшей (LAT1–LAT3) посажены на грудную клетку и
   начинаются на T7, T10 и T12. По анатомии (OpenStax Anatomy and Physiology 2e, 11.5) широчайшая начинается от
   остистых отростков T7–T12, через пояснично-грудную фасцию — от поясничных позвонков и от гребня подвздошной кости.
   Модель плеча DAS3 (Chadwick и др., 2014, по препаратам Klein Breteler и др., 1999) делит её на шесть пучков:
   три грудных (T8, T10, T12), поясничный (у остистых отростков на высоте L3) и два наружных (в 8 и 10 см от средней
   линии на высоте L2–L3 — до таза DAS3 тоже не доходит: таза в ней нет). Здесь пучки LAT1–LAT3 остаются как есть, а
   три недостающих строятся на костях манекена:
   - LAT4 — поясничный: от вершины остистого отростка L3 (пояснично-грудная фасция крепится к остистым отросткам);
   - LAT5, LAT6 — подвздошные: от заднего отдела гребня подвздошной кости, в 6,5 и 9,5 см от средней линии (кнаружи
     от выпрямителя спины), в самой высокой точке гребня на этом расстоянии.
   Путь от плечевой кости до нижнего угла лопатки — как у LAT3 (те же точки и огибающие тела MoBL-ARMS: широчайшая
   ложится на нижний угол лопатки и огибает плечевую кость к межбугорковой борозде). Объём делится между шестью
   пучками как у DAS3 (volumes.js). Левая сторона — зеркально.

   2. Наружная косая живота (4.34.0) — верхние зубцы, рёбра 5 и 6.
   В модели поясницы MyoSim (MyoBack, по Christophy и др., 2012) шесть пучков наружной косой начинаются на рёбрах 7–11:
   EO1–EO4 — у передних концов рёбер 7–10, EO5–EO6 — сбоку на рёбрах 10–11. По анатомии (Gray's Anatomy, 42-е изд.,
   2020) мышца начинается восемью зубцами от наружных поверхностей рёбер 5–12; верхние зубцы — у хрящей рёбер, между
   зубцами передней зубчатой, и через апоневроз уходят к белой линии. Достраиваются пучки EO7 (ребро 5) и EO8 (ребро 6):
   - начало — наружная поверхность ребра в продолжении линии зубцов EO1–EO4: угол вокруг вертикальной оси груди
     (от средней линии спереди) растёт от ребра к ребру почти на одну величину (≈ 5,6° на ребро), для рёбер 5 и 6 он
     продлевается по прямой, подобранной по EO1–EO4; на ребре — наружная треть вершин в пределах ±5° от этого угла;
   - конец — апоневроз у белой линии, как у EO1–EO4: в 3 см от средней линии (у EO1–EO4 — 3,2–4,3 см), ниже начала
     на столько же, на сколько у EO1–EO4 (волокна идут вниз и к середине под тем же углом, ≈ 45°), на глубине 2 см под
     кожей — поверх хрящей рёбер и лежащей на них прямой мышцы (кожа манекена на 3,5 см впереди хрящей; у EO1–EO4
     концы ниже рёберной дуги, где хрящей нет). Кость — L3, как у EO1–EO4 (тело-посредник брюшной стенки MyoSim).
   Путь — от апоневроза к ребру (как у EO1: сухожилие в начале пути). Сила — как у соседнего пучка EO1 (ребро 7):
   данных о силе верхних зубцов в моделях нет; объём наружной косой (МРТ) делится между восемью пучками (volumes.js).
   Левая сторона — зеркально.

   3. Мышцы шеи (4.35.0) — грудино-ключично-сосцевидная, ременные головы и шеи, лестничные: в открытых моделях, которые
   используются здесь, их нет. Построены по описаниям прикреплений (Gray's Anatomy, 1918) на ориентирах, найденных на
   костях манекена (подробности — у раздела 3 ниже и в README). Объём — МРТ Zheng и др. (2013), части — Borst (2009).

   4. Остистая мышца груди (4.35.0) — четыре вложенных пучка вдоль остистых отростков T2–L2; объём — доля выпрямителя
   позвоночника по Delp и др. (2001). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
const G = require('./geometry.js');
const IN = path.resolve(root, process.argv[2] || 'qa/muscles/muscles.json'), OUT = path.resolve(root, process.argv[3] || IN);

const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), skel.bones);
const at = (i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
const index = (name, side = '') => skel.bones.findIndex(b => b.name === name && (b.side || '') === side);
const bone = (name, side = '') => {
  const i = index(name, side), b = skel.bones[i], loc = [], w = [];
  for (let k = 0; k < b.pos.length; k += 3) { const p = [b.pos[k], b.pos[k + 1], b.pos[k + 2]]; loc.push(p); w.push(at(i, p)); }
  return { i, b, loc, w };
};
/* мир → рамка кости (рамки — поворот и сдвиг: обратная — транспонированный поворот) */
const toLocal = (i, p) => { const o = i * 12, d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]); return [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); };
const round = p => p.map(v => +v.toFixed(3));
const mean = v => [0, 1, 2].map(k => v.reduce((s, p) => s + p[k], 0) / v.length);
const sacrum = bone('sacrum'), midX = sacrum.w.reduce((s, p) => s + p[0], 0) / sacrum.w.length;
const mirror = s => ({ ...s, bone: [s.bone[0].replace(/_R$/, '_L'), s.bone[1] === 'R' ? 'L' : s.bone[1]], p: [-s.p[0], s.p[1], s.p[2]] });
const pair = (name, par, el) => [
  { name: name + '_r', side: 'R', ...par, src: 'анатомия (anatomy.js)', el: el.map(s => ({ s: { ...s, site: `${name}-${s.site}_r` } })) },
  { name: name + '_l', side: 'L', ...par, src: 'анатомия (anatomy.js)', el: el.map(s => ({ s: { ...mirror(s), site: `${name}-${s.site}_l` } })) },
];

const md = JSON.parse(fs.readFileSync(IN, 'utf8'));
md.muscles = md.muscles.filter(mu => !/^(LAT[456]|EO[78]|SCM\d|SPLcap\d|SPLcerv\d|SCAL(ant|med|post)\d|SPIN\d|DELT3(med|lat)|PECM(1b|2a|2c|3b)|INFSP(sup|inf))_[rl]$/.test(mu.name));

/* ---------- 1. широчайшая ---------- */
/* вершина остистого отростка L3 — самая задняя точка позвонка (каталог: Z вперёд) */
function spinousTip(name) {
  const b = bone(name); let k = 0;
  b.w.forEach((p, i) => { if (p[2] < b.w[k][2]) k = i; });
  return { bone: [name, ''], p: round(b.loc[k]) };
}
/* гребень подвздошной кости на расстоянии lat от средней линии: самая высокая точка (каталог: Y вниз), из них — задняя */
function crest(lat) {
  const b = bone('pelvis_R', 'R'), cand = b.w.map((p, i) => [p, i]).filter(([p]) => Math.abs(Math.abs(p[0] - midX) - lat) < .5);
  const top = Math.min(...cand.map(([p]) => p[1])), near = cand.filter(([p]) => p[1] < top + 1);
  const [, k] = near.reduce((a, c) => (c[0][2] < a[0][2] ? c : a));
  return { bone: ['pelvis_R', 'R'], p: round(b.loc[k]) };
}
/* точка на нижних рёбрах сзади-сбоку (каталог, см): ближайшая вершина грудной клетки — подвздошные пучки идут по рёбрам
   (у широчайшей там зубцы на рёбрах 9–12), а не напрямую сквозь бок; в отведении руки путь иначе выходит из кожи */
function rib(target) {
  const b = bone('ribcage'); let k = 0, best = Infinity;
  b.w.forEach((p, i) => { const d = Math.hypot(p[0] - target[0], p[1] - target[1], p[2] - target[2]); if (d < best) { best = d; k = i; } });
  return { bone: ['ribcage', ''], p: round(b.loc[k]) };
}
const tmpl = s => md.muscles.find(mu => mu.name === 'LAT3_' + s);
/* путь у плечевой кости — как у LAT3; поясничный пучок ложится и на нижний угол лопатки (точка P3), подвздошные идут
   по боковой поверхности груди прямо к подмышке, мимо лопатки (нижние наружные волокна образуют заднюю подмышечную складку) */
const head = (s, scapula) => { const el = tmpl(s).el, k = el.findIndex(e => e.s && e.s.bone[0] === 'scapula'); return JSON.parse(JSON.stringify(el.slice(0, scapula ? k + 1 : k))); };
/* параметры — DAS3 (сила Н, оптимальная длина волокон и свободного сухожилия, см): lat_dorsi_4…6 */
const LAT = [
  ['LAT4', spinousTip('L3'), { fmax: 96, L0: 32.06, LT: 12 }, true, null],
  ['LAT5', crest(6.5), { fmax: 88, L0: 31.29, LT: 7.2 }, false, rib([midX - 11.5, 63, -4.5])],
  ['LAT6', crest(9.5), { fmax: 105, L0: 34.02, LT: 6.9 }, false, rib([midX - 13, 61, -1])],
];
for (const [name, origin, par, scap, via] of LAT) {
  const r = { name: name + '_r', side: 'R', ...par, src: 'анатомия (anatomy.js)', el: [...head('r', scap), ...(via ? [{ s: { ...via, site: name + '-rib_r' } }] : []), { s: { ...origin, site: name + '-origin_r' } }] };
  const l = { name: name + '_l', side: 'L', ...par, src: 'анатомия (anatomy.js)', el: [...head('l', scap), ...(via ? [{ s: { ...mirror(via), site: name + '-rib_l' } }] : []), { s: { ...mirror(origin), site: name + '-origin_l' } }] };
  md.muscles.push(r, l);
  console.log(name, 'начало', origin.bone.join(''), origin.p.join(' '));
}
console.log('широчайшая: пучков', md.muscles.filter(mu => /^LAT\d_r$/.test(mu.name)).length);

/* ---------- 2. наружная косая: верхние зубцы ---------- */
{
  const rc = bone('ribcage'), n = rc.w.length, par = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < rc.b.idx.length; i += 3) for (const [a, c] of [[rc.b.idx[i], rc.b.idx[i + 1]], [rc.b.idx[i + 1], rc.b.idx[i + 2]]]) { const ra = find(a), rb = find(c); if (ra !== rb) par[ra] = rb; }
  const comp = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comp.get(r) || comp.set(r, []).get(r)).push(i); }
  /* рёбра правой стороны — компоненты сетки грудной клетки (грудина с хрящами — одна большая компонента), сверху вниз */
  const ribs = [...comp.values()].filter(c => c.length < 200 && mean(c.map(i => rc.w[i]))[0] < midX).sort((a, c) => mean(a.map(i => rc.w[i]))[1] - mean(c.map(i => rc.w[i]))[1]);
  if (ribs.length !== 12) throw Error('рёбер справа: ' + ribs.length);
  const zc = mean(rc.w)[2], ang = p => Math.atan2(-(p[0] - midX), p[2] - zc) * 180 / Math.PI, rad = p => Math.hypot(p[0] - midX, p[2] - zc);
  const ribOf = p => { let best = Infinity, k = -1; ribs.forEach((c, j) => { for (const i of c) { const d = Math.hypot(...[0, 1, 2].map(t => rc.w[i][t] - p[t])); if (d < best) { best = d; k = j; } } }); return k + 1; };
  /* EO1–EO4 MyoSim (правые): конец на ребре и конец у апоневроза — в мире */
  const world = s => at(index(s.bone[0], s.bone[1] || ''), s.p);
  const eo = [1, 2, 3, 4].map(k => {
    const el = md.muscles.find(mu => mu.name === `EO${k}_r`).el.map(e => e.s), onRib = el.find(s => s.bone[0] === 'ribcage'), front = el.find(s => s.bone[0] === 'L3');
    const r = world(onRib), f = world(front);
    return { k, rib: ribOf(r), a: ang(r), drop: (f[1] - r[1]) / (Math.abs(r[0] - midX) - Math.abs(f[0] - midX)), r, f };
  });
  const mr = eo.reduce((s, e) => s + e.rib, 0) / 4, ma = eo.reduce((s, e) => s + e.a, 0) / 4;
  const slope = eo.reduce((s, e) => s + (e.rib - mr) * (e.a - ma), 0) / eo.reduce((s, e) => s + (e.rib - mr) ** 2, 0);
  const drop = eo.reduce((s, e) => s + e.drop, 0) / 4;
  console.log('EO1–EO4: рёбра', eo.map(e => e.rib).join(', '), '; угол', eo.map(e => e.a.toFixed(0) + '°').join(', '), `(+${slope.toFixed(1)}° на ребро); спуск ${drop.toFixed(2)} см на см к середине`);
  if (eo.map(e => e.rib).join() !== '7,8,9,10') throw Error('EO1–EO4 не на рёбрах 7–10');
  const sdf = G.skinSDF(R), skinZ = (x, y) => { for (let z = 30; z > -10; z -= .05) if (sdf([x, y, z]) < 0) return z; throw Error('нет кожи спереди'); };
  const L3 = index('L3'), src = md.muscles.find(mu => mu.name === 'EO1_r');
  for (const [name, r] of [['EO7', 5], ['EO8', 6]]) {
    const a = ma + slope * (r - mr), cand = ribs[r - 1].filter(i => Math.abs(ang(rc.w[i]) - a) < 5).sort((i, j) => rad(rc.w[j]) - rad(rc.w[i]));
    const outer = cand.slice(0, Math.max(1, Math.round(cand.length / 3)));
    const o = mean(outer.map(i => rc.w[i])), oLoc = mean(outer.map(i => rc.loc[i]));
    const x = midX - 3, y = o[1] + drop * (Math.abs(o[0] - midX) - 3), f = [x, y, skinZ(x, y) - 2];
    md.muscles.push(...pair(name, { fmax: src.fmax, L0: src.L0, LT: src.LT }, [
      { bone: ['L3', ''], p: round(toLocal(L3, f)), site: 'aponeurosis' },
      { bone: ['ribcage', ''], p: round(oLoc), site: 'rib' + r },
    ]));
    console.log(`${name}: ребро ${r}, угол ${a.toFixed(1)}° (вершин ${outer.length}), начало ${o.map(v => v.toFixed(1)).join(' ')} → апоневроз ${f.map(v => v.toFixed(1)).join(' ')}`);
  }
}

/* ---------- общее для разделов 3–4: части сеток, точки на поверхности кости ---------- */
function parts(B) {
  const n = B.w.length, par = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < B.b.idx.length; i += 3) for (const [a, c] of [[B.b.idx[i], B.b.idx[i + 1]], [B.b.idx[i + 1], B.b.idx[i + 2]]]) { const ra = find(a), rb = find(c); if (ra !== rb) par[ra] = rb; }
  const comp = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comp.get(r) || comp.set(r, []).get(r)).push(i); }
  return [...comp.values()];
}
const sub = (a, b) => a.map((v, k) => v - b[k]), add = (a, b) => a.map((v, k) => v + b[k]), mul = (a, s) => a.map(v => v * s);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], dist = (a, b) => Math.hypot(...sub(a, b));
/* ближайшая к p точка треугольника abc (Эриксон, «Real-Time Collision Detection», 5.1.5) */
function onTri(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return add(a, mul(ab, d1 / (d1 - d3)));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return add(a, mul(ac, d2 / (d2 - d6)));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return add(b, mul(sub(c, b), (d4 - d3) / ((d4 - d3) + (d5 - d6))));
  const den = 1 / (va + vb + vc); return add(a, add(mul(ab, vb * den), mul(ac, vc * den)));
}
/* точка на поверхности кости, ближайшая к p (мир) */
function surface(B, p) {
  let best = Infinity, q = p;
  for (let f = 0; f < B.b.idx.length; f += 3) { const r = onTri(p, B.w[B.b.idx[f]], B.w[B.b.idx[f + 1]], B.w[B.b.idx[f + 2]]), d = dist(p, r); if (d < best) { best = d; q = r; } }
  return q;
}
/* точка пути: кость и координаты в её рамке */
const at3 = (B, p, site) => ({ bone: [B.b.name, B.b.side || ''], p: round(toLocal(B.i, p)), site });
const extreme = (pts, f) => pts.reduce((a, q) => (f(q) > f(a) ? q : a));

/* ---------- 3. мышцы шеи: грудино-ключично-сосцевидная, ременные, лестничные ---------- */
{
  /* ориентиры (каталог: X влево, Y вниз, Z вперёд; правая сторона — X меньше середины) */
  const cerv = bone('cervical'), skull = bone('skull'), rc = bone('ribcage'), cl = bone('clavicle', 'R');
  const C = parts(cerv).sort((a, b) => b.length - a.length).slice(0, 7).map(c => c.map(i => cerv.w[i])).sort((a, b) => mean(a)[1] - mean(b)[1]);
  if (C.length !== 7) throw Error('шейных позвонков: ' + C.length);
  /* поперечный отросток: самые наружные точки позвонка (в пределах 0,8 см от края); передний бугорок — передняя из них,
     задний — задняя (у C7 переднего бугорка нет: передний и задний — одна наружная часть) */
  const tub = C.map(p => { const R = p.filter(q => q[0] < midX - 1), lat = Math.max(...R.map(q => midX - q[0])), L = R.filter(q => midX - q[0] > lat - .8);
    return { ant: extreme(L, q => q[2]), post: extreme(L, q => -q[2]), tip: extreme(p, q => -q[2]) }; });
  const T = n => extreme(bone('thoracic' + n).w, q => -q[2]);                                  // вершина остистого отростка
  const eop = (() => { const s = md.muscles.find(mu => mu.name === 'trap_clav_1_r').el[0].s; return at(index(s.bone[0], s.bone[1] || ''), s.p); })();
  const mastoid = extreme(skull.w.filter(q => { const l = midX - q[0]; return l > 4 && l < 6.5 && q[2] > -3 && q[2] < 1.5; }), q => q[1]);
  const onSkull = p => surface(skull, p);
  /* верхняя выйная линия — от наружного затылочного выступа к основанию сосцевидного отростка (на 2 см выше вершины) */
  const snl = t => onSkull(add(eop, mul(sub(add(mastoid, [0, -2, 0]), eop), t)));
  /* выйная связка — от наружного затылочного выступа к вершине остистого отростка C7, на высоте вершины уровня L (0 — C1) */
  const nuchal = L => { const i = Math.min(Math.floor(L), 5), y = tub[i].tip[1] + (L - i) * (tub[i + 1].tip[1] - tub[i].tip[1]), t = (y - eop[1]) / (tub[6].tip[1] - eop[1]); return add(eop, mul(sub(tub[6].tip, eop), t)); };
  /* рукоятка грудины: вырезка — верхняя точка грудины у середины; начало грудинной головки — передняя поверхность ниже и сбоку */
  const sternum = parts(rc).sort((a, b) => b.length - a.length)[0].map(i => rc.w[i]);
  const notch = extreme(sternum.filter(q => Math.abs(q[0] - midX) < 1.5), q => -q[1]);
  const manubrium = (dx, dy) => extreme(sternum.filter(q => Math.abs(q[0] - (midX - dx)) < .7 && Math.abs(q[1] - (notch[1] + dy)) < .7), q => q[2]);
  /* ключица: внутренний конец — ближайшая к середине точка; f — доля длины к наружному концу; верхняя поверхность */
  const clMed = extreme(cl.w, q => q[0]), clLat = extreme(cl.w, q => -q[0]);
  const clav = f => { const x = clMed[0] + f * (clLat[0] - clMed[0]); return extreme(cl.w.filter(q => Math.abs(q[0] - x) < .6), q => -q[1]); };
  /* рёбра 1–2 справа: срез по глубине (доля f от заднего конца к переднему) */
  const ribs = parts(rc).filter(c => c.length < 200).map(c => c.map(i => rc.w[i])).filter(p => mean(p)[0] < midX).sort((a, b) => mean(a)[1] - mean(b)[1]);
  const slice = (r, f) => { const p = ribs[r - 1], z0 = Math.min(...p.map(q => q[2])), z1 = Math.max(...p.map(q => q[2])); return p.filter(q => Math.abs(q[2] - (z0 + f * (z1 - z0))) < .5); };
  /* лестничный бугорок 1-го ребра — внутренний край верхней поверхности у перехода к переднему отделу; за бороздой
     подключичной артерии — верхняя поверхность ребра; 2-е ребро — наружная поверхность */
  const scaleneTub = (() => { const s = slice(1, .8), xs = s.map(q => q[0]), xm = (Math.min(...xs) + Math.max(...xs)) / 2; return extreme(s.filter(q => q[0] >= xm), q => -q[1]); })();
  const rib1Top = f => extreme(slice(1, f), q => -q[1]), rib2Out = f => extreme(slice(2, f), q => -q[0]);
  console.log('шея: сосцевидный отросток', mastoid.map(v => v.toFixed(1)).join(' '), '; яремная вырезка', notch.map(v => v.toFixed(1)).join(' '));

  const LINES = [
    /* грудино-ключично-сосцевидная (Gray's: грудинная головка — передняя поверхность рукоятки грудины, ключичная — верхняя
       поверхность внутренней трети ключицы → наружная поверхность сосцевидного отростка и наружная половина верхней выйной
       линии); четыре части — как четыре элемента у Borst (2009): грудинно-затылочная, грудинно-сосцевидная, две ключично-сосцевидные */
    ['SCM1', [[rc, manubrium(1.3, 1.2)], [skull, snl(.6)]]],
    ['SCM2', [[rc, manubrium(1.6, 1.8)], [skull, onSkull(add(mastoid, [-.5, -1, 0]))]]],
    ['SCM3', [[cl, clav(.15)], [skull, onSkull(add(mastoid, [-.5, -.5, .5]))]]],
    ['SCM4', [[cl, clav(.3)], [skull, onSkull(add(mastoid, [-.5, -1.5, -.3]))]]],
    /* ременная мышца головы (Gray's: нижняя половина выйной связки, остистые отростки C7–T3 → сосцевидный отросток и
       затылочная кость под наружной третью верхней выйной линии): верхние пучки — к затылку, нижние — к сосцевидному */
    ['SPLcap1', [[cerv, nuchal(3)], [skull, onSkull(add(snl(.72), [0, 1, 0]))]]],
    ['SPLcap2', [[cerv, nuchal(5.5)], [skull, onSkull(add(snl(.86), [0, 1, 0]))]]],
    ['SPLcap3', [[bone('thoracic2'), T(2)], [skull, onSkull(add(mastoid, [0, -2, -1]))]]],
    /* ременная мышца шеи (Gray's: остистые отростки T3–T6 → задние бугорки поперечных отростков C1–C3) */
    ['SPLcerv1', [[bone('thoracic3'), T(3)], [cerv, tub[0].post]]],
    ['SPLcerv2', [[bone('thoracic5'), T(5)], [cerv, tub[2].post]]],
    /* лестничные (Gray's): передняя — передние бугорки C3–C6 → лестничный бугорок 1-го ребра; средняя — задние бугорки
       C2–C7 → верхняя поверхность 1-го ребра за бороздой подключичной артерии; задняя — задние бугорки C4–C6 →
       наружная поверхность 2-го ребра */
    ['SCALant1', [[cerv, tub[3].ant], [rc, scaleneTub]]],
    ['SCALant2', [[cerv, tub[5].ant], [rc, scaleneTub]]],
    ['SCALmed1', [[cerv, tub[1].post], [rc, rib1Top(.5)]]],
    ['SCALmed2', [[cerv, tub[3].post], [rc, rib1Top(.56)]]],
    ['SCALmed3', [[cerv, tub[5].post], [rc, rib1Top(.62)]]],
    ['SCALpost1', [[cerv, tub[3].post], [rc, rib2Out(.28)]]],
    ['SCALpost2', [[cerv, tub[5].post], [rc, rib2Out(.36)]]],
  ];
  for (const [name, pts] of LINES) {
    md.muscles.push(...pair(name, { fmax: 0, L0: 0, LT: 0 }, pts.map(([B, p], k) => at3(B, p, 'P' + (k + 1)))));
    console.log(`  ${name}: ${pts.map(([B, p]) => B.b.name + ' ' + p.map(v => v.toFixed(1)).join(' ')).join(' → ')}`);
  }
}

/* ---------- 4. остистая мышца груди ---------- */
/* Gray's: от остистых отростков T11–L2 к остистым отросткам верхних грудных позвонков (T1–T8). Четыре пучка, вложенные
   друг в друга: L2 → T2, L1 → T4, T12 → T6, T11 → T8. Мышца лежит вплотную к остистым отросткам: точки — сбоку от
   вершины (0,7 см кнаружи, 0,7 см вглубь), на каждом промежуточном позвонке — промежуточная точка той же кости, путь
   повторяет изгиб позвоночника. */
{
  const vb = n => (n <= 12 ? bone('thoracic' + n) : bone('L' + (n - 12)));
  const beside = n => { const B = vb(n), t = extreme(B.w, q => -q[2]); return [B, add(t, [-.7, 0, .7])]; };
  const SP = [['SPIN1', 14, 2], ['SPIN2', 13, 4], ['SPIN3', 12, 6], ['SPIN4', 11, 8]];
  for (const [name, lo, hi] of SP) {
    const pts = []; for (let n = lo; n >= hi; n--) pts.push(beside(n));
    md.muscles.push(...pair(name, { fmax: 0, L0: 0, LT: 0 }, pts.map(([B, p], k) => at3(B, p, k === 0 ? 'origin' : k === pts.length - 1 ? 'insertion' : 'via' + k))));
    console.log(`  ${name}: ${lo > 12 ? 'L' + (lo - 12) : 'T' + lo} → T${hi}, точек ${pts.length}`);
  }
}

/* ---------- 5. задняя часть дельтовидной — веером вдоль ости лопатки (4.36.0) ---------- */
/* В MoBL-ARMS задняя часть дельтовидной — одна линия от ости лопатки (у её наружной трети). С 4.36.0 её объём — по
   препаратам (29 % дельтовидной, volumes.js, PART_SHARE), и одной трубкой такой объём выходит из кожи при руке над
   головой до 4,6 см: у человека задняя часть — широкий пласт от нижней губы ости лопатки (Gray's Anatomy) к
   дельтовидной бугристости. Добавлены ещё две линии с началом на ости ближе к середине (DELT3med) и у заднего угла
   акромиона (DELT3lat); путь к плечу — как у DELT3 (те же огибающие тела MoBL-ARMS). Объём делится между тремя линиями
   как между тремя задними элементами DAS3 (delt_scap_1…3, препарат Klein Breteler: 36 / 22 / 41 %). */
{
  const sc = bone('scapula', 'R'), D3 = s => md.muscles.find(mu => mu.name === 'DELT3_' + s);
  const v = sc.w, lmin = Math.min(...v.map(q => midX - q[0])), lmax = Math.max(...v.map(q => midX - q[0])), [top, bot] = [Math.min(...v.map(q => q[1])), Math.max(...v.map(q => q[1]))];
  const wOf = q => ((midX - q[0]) - lmin) / (lmax - lmin), hOf = q => (q[1] - top) / (bot - top);
  /* нижняя губа ости: самая задняя точка лопатки на доле ширины w (в верхней трети высоты), на 0,6 см ниже — на поверхность */
  const spine = w => { const c = v.filter(q => Math.abs(wOf(q) - w) < .04 && hOf(q) < .35), crest = extreme(c, q => -q[2]); return surface(sc, add(crest, [0, .6, -.3])); };
  for (const [name, w, keepVia] of [['DELT3med', .3, false], ['DELT3lat', .8, true]]) {
    const o = spine(w), s3 = at3(sc, o, 'origin');
    for (const s of ['r', 'l']) {
      const src = D3(s), el = JSON.parse(JSON.stringify(src.el));
      const origin = s === 'r' ? s3 : { ...s3, bone: ['scapula', 'L'], p: [-s3.p[0], s3.p[1], s3.p[2]] };
      el[0] = { s: { ...origin, site: `${name}-origin_${s}` } };
      /* ближе к середине ости волокна идут к плечу вниз-наружу по подостной, не через задний угол акромиона: без его точки */
      const path = keepVia ? el : el.filter((e, k) => !(e.s && k > 0 && e.s.bone[0] === 'scapula') && !(e.w && e.w.bone[0] === 'scapula'));
      md.muscles.push({ name: `${name}_${s}`, side: s.toUpperCase(), fmax: src.fmax, L0: src.L0, LT: src.LT, src: 'анатомия (anatomy.js)', el: path });
    }
    console.log(`  ${name}: ость лопатки w ${w}, начало ${o.map(x => x.toFixed(1)).join(' ')}, точек пути ${keepVia ? 'как у DELT3' : 'без заднего угла акромиона'}`);
  }
}

/* ---------- 6. широкие мышцы веером: большая грудная и подостная (4.37.0) ---------- */
/* В MoBL-ARMS большая грудная — три линии (ключичная часть — от ключицы на 0,4 её длины, грудинная — от грудины на
   высоте T5, рёберная — от хряща ребра на высоте T8–T9), подостная — одна (от середины подостной ямки). На рисунке это
   три веретена и одно вместо пластов: у грудной видны рёбра между частями, начало вдоль грудины не покрыто. По
   анатомии (Gray's Anatomy): ключичная часть — от передней поверхности внутренней половины ключицы, грудинно-рёберная —
   от передней поверхности грудины (рукоятка и тело) и хрящей рёбер 1–6, брюшная — от апоневроза наружной косой; подостная
   — от медиальных двух третей подостной ямки. Добавлены линии с началом в других местах той же площадки; путь к плечу —
   как у линии MoBL-ARMS своей части (те же точки у плеча и огибающие тела: волокна сходятся к сухожилию). Объём части
   делится между её линиями поровну — равные полосы начала (volumes.js, FAN). */
{
  const rc = bone('ribcage'), cl = bone('clavicle', 'R'), sc = bone('scapula', 'R');
  const sternum = parts(rc).sort((a, b) => b.length - a.length)[0].map(i => rc.w[i]);
  const notch = extreme(sternum.filter(q => Math.abs(q[0] - midX) < 1.5), q => -q[1]);
  /* передняя поверхность грудной клетки (грудина, хрящи) в точке (dx от середины вправо, высота y): проекция с точки спереди */
  const front = (dx, y) => surface(rc, [midX - dx, y, notch[2] + 6]);
  /* передняя поверхность ключицы на доле длины f от внутреннего конца */
  const clMed = extreme(cl.w, q => q[0]), clLat = extreme(cl.w, q => -q[0]);
  const clavFront = f => { const x = clMed[0] + f * (clLat[0] - clMed[0]); return surface(cl, add(extreme(cl.w.filter(q => Math.abs(q[0] - x) < .6), q => q[2]), [0, 0, 1])); };
  /* подостная ямка: задняя поверхность лопатки в точке (h, w) — доли высоты и ширины, как в аудите прикреплений */
  const v = sc.w, lmin = Math.min(...v.map(q => midX - q[0])), lmax = Math.max(...v.map(q => midX - q[0])), [top, bot] = [Math.min(...v.map(q => q[1])), Math.max(...v.map(q => q[1]))];
  const fossa = (h, w) => { const c = v.filter(q => Math.abs(((midX - q[0]) - lmin) / (lmax - lmin) - w) < .05 && Math.abs((q[1] - top) / (bot - top) - h) < .05); return surface(sc, add(extreme(c, q => -q[2]), [0, 0, -1])); };
  const FAN = [
    ['PECM1b', 'PECM1', cl, clavFront(.15), 'ключица, 0,15 длины'],
    ['PECM2a', 'PECM2', rc, front(1.8, notch[1] + 1.5), 'рукоятка грудины'],
    ['PECM2c', 'PECM2', rc, front(2.2, notch[1] + 9), 'тело грудины, ниже начала MoBL'],
    ['PECM3b', 'PECM3', rc, front(6, notch[1] + 16.5), 'хрящ 6-го ребра и апоневроз наружной косой'],
    ['INFSPsup', 'INFSP', sc, fossa(.32, .3), 'подостная ямка под остью'],
    ['INFSPinf', 'INFSP', sc, fossa(.72, .3), 'подостная ямка у нижнего угла'],
  ];
  for (const [name, parent, B, o, where] of FAN) {
    const s3 = at3(B, o, 'origin');
    for (const s of ['r', 'l']) {
      const src = md.muscles.find(mu => mu.name === `${parent}_${s}`), el = JSON.parse(JSON.stringify(src.el));
      /* у этих линий MoBL-ARMS путь идёт от плеча: начало мышцы — последняя точка */
      const k = el.length - 1; if (!el[k].s || el[k].s.bone[0] !== B.b.name) throw Error(`${parent}: начало не на ${B.b.name}`);
      const origin = s === 'r' ? s3 : { ...s3, bone: [s3.bone[0], s3.bone[1] === 'R' ? 'L' : s3.bone[1]], p: [-s3.p[0], s3.p[1], s3.p[2]] };
      el[k] = { s: { ...origin, site: `${name}-origin_${s}` } };
      md.muscles.push({ name: `${name}_${s}`, side: s.toUpperCase(), fmax: src.fmax, L0: src.L0, LT: src.LT, src: 'анатомия (anatomy.js)', el });
    }
    console.log(`  ${name} (как ${parent}): ${where}, начало ${o.map(x => x.toFixed(1)).join(' ')}`);
  }
}

fs.writeFileSync(OUT, JSON.stringify(md));
console.log('→', path.relative(root, OUT));
