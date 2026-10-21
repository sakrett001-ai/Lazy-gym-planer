'use strict';
/* Стенки (этап Б, «перед и бок туловища»): прямая, наружная и внутренняя косые живота, передняя зубчатая и малая грудная —
   пластами по поверхности тела, а не трубками и лентами по линиям действия. Пути мышц (линии действия моделей MyoBack и
   DAS3 — хорды для силы и функций) не меняются; здесь строится только рисунок тела: узлы полос в нейтральной позе
   (src/js/09br-muscles.js, «стенки» — как узлы движутся в кадре). Вызывается из pack.js (после объёмов): out.walls, out.shells.

   Почему не по путям: путь прямой мышцы — хорда от лобка к хрящам рёбер, у грудной клетки на 91 % глубже рёбер, тело —
   две трубки 3,8 × 3,8 см на 5–9 см под кожей; верхние пучки наружной косой — на 85–100 % внутри грудной клетки, передняя
   зубчатая — на 25–70 %, малая грудная — на 35–65 % (аудит 4.53.0, tools/muscles/README.md, «Стенки»).

   Анатомия (Gray's Anatomy, 1918, с. 410–415, 439–442; числа — ниже у каждой мышцы):
   - прямая живота: лента от гребня и симфиза лобковой кости к хрящам рёбер 5–7 и мечевидному отростку, шире и тоньше вверху;
     белая линия между правой и левой; три сухожильные перемычки — у пупка, у конца мечевидного отростка и посередине между
     ними, поперёк мышцы, сращены с передней стенкой влагалища и редко проходят мышцу насквозь;
   - наружная косая: восемь зубцов от наружных поверхностей рёбер 5–12 по косой линии вниз и назад; пять верхних — между
     зубцами передней зубчатой, три нижних — между зубцами широчайшей; задние волокна — почти вертикально к гребню
     подвздошной кости, остальные — вниз и вперёд в апоневроз по линии от хряща 9-го ребра к передней верхней ости;
   - внутренняя косая — под наружной: от гребня подвздошной кости и паховой связки веером вверх и вперёд к хрящам рёбер
     10–12 и в апоневроз у края прямой мышцы;
   - передняя зубчатая: зубцы от рёбер 1–9 (первый — от 1-го и 2-го), «тонкий мышечный пласт», прилегает к грудной стенке
     и уходит под лопатку к её медиальному краю: верхний зубец — к верхнему углу, два следующих — по всему краю, нижние
     5–6 сходятся веером к нижнему углу; четыре нижних зубца — между зубцами наружной косой;
   - малая грудная: от верхних краёв и наружных поверхностей рёбер 3–5 у хрящей к клювовидному отростку лопатки, под
     большой грудной.
   Поперечная живота не рисуется: глубже внутренней косой, снаружи не видна; линии действия в моделях нет.

   Как устроено: правая сторона строится по ориентирам скелета и кожи манекена в нейтральной позе (без складок подмышки),
   левая — зеркально. Узлы — см. Muscles.wallSurface: у кожи (точка в рамке сечения кожи), на кости, смесь, скольжение по
   оболочке рёбер. Толщина: у прямой — объём частей между перемычками (Brown 2011) на площадь; у остальных — относительная
   (тоньше у зубцов и краёв) и пересчитана так, что объём полосы в нейтральной позе — объём её линии по МРТ (volumes.js);
   расчёт — тем же кодом приложения (Muscles.wallSurface), что рисует. */
const IC = require('./intercostals.js');
const DEG = Math.PI / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(a[0], a[1], a[2]), unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const r3 = x => Math.round(x * 1000) / 1000, r2 = x => Math.round(x * 100) / 100;
const profile = (tab, x) => { if (x <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])); return tab[tab.length - 1][1]; };

/* ---------- контекст: нейтральная поза, кожа без складок, грудная клетка ---------- */
function context(M, Skeleton, Muscles, skel) {
  const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), skel.bones);
  const H0 = R.frames.pelvis.o[1];                       /* каталог: высота h над тазобедренными = H0 − Y */
  const index = (name, side = '') => skel.bones.findIndex(b => b.name === name && (b.side || '') === side);
  const toLocal = (i, p) => { const o = i * 12, d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]); return [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); };
  const toWorld = (i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
  const boneWorld = name => { const [n, s] = name.split('|'), i = index(n, s || ''), b = skel.bones[i], out = []; for (let k = 0; k < b.pos.length; k += 3) out.push(toWorld(i, [b.pos[k], b.pos[k + 1], b.pos[k + 2]])); return { i, b, w: out }; };
  return { M, Skeleton, Muscles, skel, R, m, H0, index, toLocal, toWorld, boneWorld, rib: index('ribcage') };
}

/* ---------- кожа корпуса: «карта» (s, h) правой стороны ----------
   s — длина дуги сечения кожи (без складок подмышки) от передней средней линии вправо, см; h — высота над тазобедренными.
   В нейтральной позе рамки сечений кожи совпадают с осями каталога (центр — на оси корпуса x = z = 0), поэтому координаты
   точки в рамке сечения — просто её x и z. */
function skinChart(C) {
  const { M, R } = C, cache = new Map();
  function row(h) {
    const key = h.toFixed(3); let r = cache.get(key); if (r) return r;
    const f = M.torsoFrame(R, h), sec = M.sectionAt(h), pts = [], angs = [], cum = [0];
    for (let i = 0; i <= 720; i++) { const a = i / 720 * Math.PI; angs.push(a); pts.push(M.noFolds(() => M.torsoPointIn(R, h, 'R', a, 0, f, sec))); if (i) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1]))); }
    r = { pts, angs, cum }; cache.set(key, r); return r;
  }
  /* точка кожи (s, h): позиция, нормаль наружу (горизонтальная), угол сечения ang и доля передней схемы kf */
  function at(s, h) {
    const r = row(h), c = r.cum; let i = 1; while (i < c.length - 1 && c[i] < s) i++;
    const t = clamp((s - c[i - 1]) / ((c[i] - c[i - 1]) || 1), 0, 1), p = lerp3(r.pts[i - 1], r.pts[i], t), tg = unit(sub(r.pts[i], r.pts[i - 1]));
    let n = unit(cross(tg, [0, -1, 0])); if (n[0] * p[0] + n[2] * p[2] < 0) n = n.map(x => -x);
    const ang = lerp(r.angs[i - 1], r.angs[i], t);
    return { p, n, ang, kf: M.frontK(ang), s, h };
  }
  /* s точки кожи на том же горизонтальном направлении от оси корпуса, что точка q (перевод точек кости на карту) */
  function sOf(q, h) {
    const r = row(h); let best = Infinity, s = 0;
    const az = Math.atan2(-q[0], q[2]);
    for (let i = 0; i < r.pts.length; i++) { const p = r.pts[i], d = Math.abs(Math.atan2(-p[0], p[2]) - az); if (d < best) { best = d; s = r.cum[i]; } }
    return s;
  }
  return { at, row, sOf };
}

/* ---------- оболочка рёбер ----------
   Наружная поверхность грудной клетки в её рамке (локальные см: x — влево, y — вверх, z — вперёд): радиус от оси (x = 0,
   z = zc) по азимуту θ (0° — вперёд, 90° — вбок своей стороны, 180° — назад) и высоте y. Мелкая сетка (0,5°, 0,25 см) —
   наибольший радиус точек треугольников сетки грудной клетки; межрёберные промежутки (по высоте до 3,5 см) — линейно между
   рёбрами (наружные межрёберные лежат на уровне рёбер — intercostals.js); для приложения — крупная сетка SH_DTH × SH_DY с
   наибольшим радиусом по ячейке (пласт по ней не заходит в выступающие рёбра). */
const SH_DTH = 3, SH_DY = 1, SH_TH = [15, 165];
function ribShell(C, side) {
  const { skel } = C, RC = IC.ribcage(skel), b = RC.b, P = RC.P, g = side === 'R' ? -1 : 1;
  const fine = { dth: .5, dy: .25 };
  let y0 = Infinity, y1 = -Infinity; for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  y0 = Math.floor(y0) - 1; y1 = Math.ceil(y1) + 1;
  const NT = Math.round(180 / fine.dth) + 1, NY = Math.round((y1 - y0) / fine.dy) + 1, r = new Float64Array(NT * NY).fill(-1);
  /* по рёбрам (1–12 своей стороны; 0 — грудина с хрящами): на азимуте — нижний и верхний край и наибольший радиус */
  const lab = RC.label[side], RIB = Array.from({ length: 13 }, () => ({ y0: new Float64Array(NT).fill(Infinity), y1: new Float64Array(NT).fill(-Infinity), r: new Float64Array(NT).fill(-1) }));
  const put = (q, k) => {
    if (g * q[0] < -.5) return;
    const th = Math.atan2(g * q[0], q[2] - RC.zc) / DEG, rr = Math.hypot(q[0], q[2] - RC.zc);
    const i = Math.round(th / fine.dth), j = Math.round((q[1] - y0) / fine.dy); if (i < 0 || i >= NT || j < 0 || j >= NY) return;
    const c = j * NT + i; if (rr > r[c]) r[c] = rr;
    if (k >= 0) { const R0 = RIB[k]; if (q[1] < R0.y0[i]) R0.y0[i] = q[1]; if (q[1] > R0.y1[i]) R0.y1[i] = q[1]; if (rr > R0.r[i]) R0.r[i] = rr; }
  };
  for (let f = 0; f < b.idx.length; f += 3) {
    const a = P[b.idx[f]], c = P[b.idx[f + 1]], d = P[b.idx[f + 2]], L = Math.max(len(sub(a, c)), len(sub(a, d)), len(sub(c, d))), n = Math.max(1, Math.ceil(L / .1)), k = lab[b.idx[f]];
    for (let u = 0; u <= n; u++) for (let v = 0; u + v <= n; v++) { const w = n - u - v; put([0, 1, 2].map(q => (a[q] * u + c[q] * v + d[q] * w) / n), k); }
  }
  /* промежутки между рёбрами — по высоте в столбце; пустые клетки между заполненными по азимуту (до 1,5°) — по соседям */
  for (let i = 0; i < NT; i++) {
    let last = -1;
    for (let j = 0; j < NY; j++) {
      const k = j * NT + i; if (r[k] < 0) continue;
      if (last >= 0 && j - last > 1 && (j - last) * fine.dy <= 3.5) for (let q = last + 1; q < j; q++) { const t = (q - last) / (j - last); r[q * NT + i] = r[last * NT + i] * (1 - t) + r[k] * t; }
      last = j;
    }
  }
  for (let j = 0; j < NY; j++) for (let i = 1; i < NT - 1; i++) { const k = j * NT + i; if (r[k] < 0) { let s = 0, w = 0; for (const d of [-3, -2, -1, 1, 2, 3]) { const ii = i + d; if (ii >= 0 && ii < NT && r[j * NT + ii] > 0) { s += r[j * NT + ii] / Math.abs(d); w += 1 / Math.abs(d); } } if (w > 1.2) r[k] = s / w; } }
  const S = { side, zc: RC.zc, fine: { ...fine, y0, NT, NY, r }, RC, RIB };
  /* крупная сетка для приложения (азимуты SH_TH): наибольший радиус по окрестности клетки */
  const cth = SH_DTH, cdy = SH_DY, CT = Math.round((SH_TH[1] - SH_TH[0]) / cth) + 1, CY = Math.round((y1 - y0) / cdy) + 1, cr = new Float64Array(CT * CY).fill(-1);
  const hw = Math.round(cth / fine.dth / 2), hy = Math.round(cdy / fine.dy / 2);
  for (let j = 0; j < CY; j++) for (let i = 0; i < CT; i++) {
    let mx = -1; const fi = Math.round((SH_TH[0] + i * cth) / fine.dth), fj = Math.round(j * cdy / fine.dy);
    /* клетка без рёбер в своём центре — пустая: иначе оболочка «растекается» за край рёбер (рёберная дуга) на полклетки */
    if (fi < 0 || fi >= NT || fj < 0 || fj >= NY || r[fj * NT + fi] < 0) continue;
    for (let dj = -hy; dj <= hy; dj++) for (let di = -hw; di <= hw; di++) { const ii = fi + di, jj = fj + dj; if (ii < 0 || ii >= NT || jj < 0 || jj >= NY) continue; mx = Math.max(mx, r[jj * NT + ii]); }
    cr[j * CT + i] = mx;
  }
  S.coarse = { th0: SH_TH[0], dth: cth, y0, dy: cdy, NT: CT, NY: CY, zc: RC.zc, r: cr };
  return S;
}
/* радиус оболочки (мелкая сетка; −1 — рёбер нет) */
function shellFine(S, th, y) {
  const F = S.fine, x = th / F.dth, z = (y - F.y0) / F.dy, i = Math.floor(x), j = Math.floor(z); let s = 0, w = 0;
  for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
    const ii = i + di, jj = j + dj; if (ii < 0 || ii >= F.NT || jj < 0 || jj >= F.NY) continue;
    const r = F.r[jj * F.NT + ii]; if (r < 0) continue; const ww = (1 - Math.abs(x - ii)) * (1 - Math.abs(z - jj)); s += r * ww; w += ww;
  }
  return w > .2 ? s / w : -1;
}
/* ребро k на азимуте th (°): нижний и верхний край (y), середина и радиус наружной поверхности — сглажено по ±w° */
function ribAt(S, k, th, w = 2) {
  const R0 = S.RIB[k], F = S.fine; let y0 = 0, y1 = 0, rr = 0, n = 0;
  for (let i = Math.round((th - w) / F.dth); i <= Math.round((th + w) / F.dth); i++) { if (i < 0 || i >= F.NT || R0.r[i] < 0) continue; y0 += R0.y0[i]; y1 += R0.y1[i]; rr += R0.r[i]; n++; }
  if (!n) { if (w < 12) return ribAt(S, k, th, w * 2); throw Error(`walls: нет ребра ${k} у ${th}°`); }
  return { lo: y0 / n, hi: y1 / n, mid: (y0 + y1) / (2 * n), r: rr / n };
}
/* точка в рамке грудной клетки → (θ, y, r) стороны оболочки и обратно */
const chartOf = (S, q) => { const g = S.side === 'R' ? -1 : 1; return { th: Math.atan2(g * q[0], q[2] - S.zc) / DEG, y: q[1], r: Math.hypot(q[0], q[2] - S.zc) }; };
const fromChart = (S, th, y, r) => { const g = S.side === 'R' ? -1 : 1; return [g * Math.sin(th * DEG) * r, y, S.zc + Math.cos(th * DEG) * r]; };
/* глубина рёбер под точкой кожи P (мир) по нормали n внутрь: ∞ — рёбер нет (до 8 см). S.other — оболочка другой стороны
   (build): грудная клетка MyoSim несимметрична, и зазор берётся по ближней из оболочек (точка — зеркально по x рамки грудной
   клетки), иначе зеркальная левая стенка в покое ложилась на свои рёбра и пол её поднимал (наружная косая у 12-го ребра,
   4.62.0: узел левой стороны — в 2,6 мм от зеркала правой) */
function ribGap(C, S, P, n) {
  for (let t = 0; t < 8; t += .02) {
    const q = C.toLocal(C.rib, add(P, n, -t));
    for (const [Sx, qx] of S.other ? [[S, q], [S.other, [-q[0], q[1], q[2]]]] : [[S, q]]) {
      const ch = chartOf(Sx, qx); if (ch.th < 0 || ch.th > 180) continue;
      const rs = shellFine(Sx, ch.th, ch.y); if (rs > 0 && ch.r <= rs) return t;
    }
  }
  return Infinity;
}
/* точка оболочки (мир) для точки карты рёбер {th, y} с зазором c */
function shellPoint(C, S, p, c) { const r = shellFine(S, p.th, p.y); if (r < 0) throw Error(`walls: нет рёбер под ${p.th.toFixed(0)}° ${p.y.toFixed(1)}`); return C.toWorld(C.rib, fromChart(S, p.th, p.y, r + c)); }

/* ---------- узлы (формат — Muscles.wallSurface) ---------- */
function skinNode(C, P, kf, datum, t) { return [0, r3(C.H0 - P[1]), r3(kf), r3(P[0]), r3(P[2]), datum, r3(t)]; }
function boneNode(C, bones, bone, P, datum, t) { const b = boneIdx(bones, bone), i = C.index(...bone); return [1, b, ...C.toLocal(i, P).map(r3), datum, r3(t)]; }
function mixNode(C, bones, bone, P, kf, w, datum, t) { const b = boneIdx(bones, bone), i = C.index(...bone); return [2, r3(C.H0 - P[1]), r3(kf), r3(P[0]), r3(P[2]), b, ...C.toLocal(i, P).map(r3), r3(w), datum, r3(t)]; }
function glideNode(bones, th, y, bone, pLocal, f, c0, lift, t) { return [3, r3(th), r3(y), boneIdx(bones, bone), ...pLocal.map(r3), r3(f), r3(c0), r3(lift), r3(t)]; }
/* между кожей и рёбрами: потолок ceil (у кожи, доля передней схемы kf), пол floor (на грудной клетке); pref — опорная сторона
   (1 — низ на полу, 0 — верх у потолка) */
function sandwichNode(C, bones, ceil, kf, floor, pref, t) { const b = boneIdx(bones, ['ribcage', '']); return [4, r3(C.H0 - ceil[1]), r3(kf), r3(ceil[0]), r3(ceil[2]), b, ...C.toLocal(C.rib, floor).map(r3), pref, r3(t)]; }
const CEIL = .3;                                        /* потолок пласта над рёбрами — не выше 3 мм под кожей */
function boneIdx(bones, bone) { let i = bones.findIndex(b => b[0] === bone[0] && b[1] === bone[1]); if (i < 0) { bones.push(bone); i = bones.length - 1; } return i; }
/* сетка стенки: полосы k = 0…K−1, столбцы 2K + 1 (край 0, середина полосы 0, шов 0–1, …, середина K−1, край K; швы общие —
   одни узлы у обеих полос), строки q = 0…n−1 (узел (c, q) — номер q·(2K + 1) + c); номера узлов полос — L, C, R по строкам */
function gridStrips(K, n) {
  const at = (c, q) => q * (2 * K + 1) + c;
  return Array.from({ length: K }, (_, k) => { const o = []; for (let q = 0; q < n; q++) o.push(at(2 * k, q), at(2 * k + 1, q), at(2 * k + 2, q)); return o; });
}
/* ломаная: точка на доле u длины */
function polyAt(P, u) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(...P[i].map((x, j) => x - P[i - 1][j])));
  const s = clamp(u, 0, 1) * L[L.length - 1]; let i = 1; while (i < P.length - 1 && L[i] < s) i++;
  const t = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return P[i].map((x, j) => lerp(P[i - 1][j], x, t));
}
/* пересечение луча (из p по d) с треугольниками T ([a, b, c]) — расстояние до ближайшего или ∞ */
function rayTris(T, p, d) {
  let best = Infinity;
  for (const [a, b, c] of T) {
    const e1 = sub(b, a), e2 = sub(c, a), h = cross(d, e2), det = dot(e1, h); if (Math.abs(det) < 1e-9) continue;
    const f = 1 / det, s = sub(p, a), u = f * dot(s, h); if (u < 0 || u > 1) continue;
    const q = cross(s, e1), v = f * dot(d, q); if (v < 0 || u + v > 1) continue;
    const t = f * dot(e2, q); if (t > 1e-6 && t < best) best = t;
  }
  return best;
}

/* ---------- ориентиры скелета ---------- */
function landmarks(C, S, skin) {
  const pel = C.boneWorld('pelvis_R|R'), H = q => C.H0 - q[1];
  /* конец мечевидного отростка — нижняя точка грудины с хрящами у средней линии */
  let xi = null; for (const i of S.RC.sternum) { const p = S.RC.P[i]; if (Math.abs(p[0]) < 1.5 && (!xi || p[1] < xi[1])) xi = p; }
  const hX = H(C.toWorld(C.rib, xi));
  /* лобковый гребень: верхние точки передней поверхности кости на расстоянии x от середины (у симфиза, посередине, у бугорка) */
  const pubAt = x => { const c = pel.w.filter(q => Math.abs(-q[0] - x) < .7 && q[2] > 3); return c.reduce((a, q) => (H(q) > H(a) ? q : a)); };
  /* передняя верхняя ость — самая передняя точка латеральной части таза; гребень — самые высокие точки по глубине z */
  const asis = pel.w.filter(q => -q[0] > 8).reduce((a, q) => (q[2] > a[2] ? q : a));
  const crestAt = z => { const c = pel.w.filter(q => Math.abs(q[2] - z) < .6 && -q[0] > 5); return c.reduce((a, q) => (H(q) > H(a) ? q : a)); };
  const crest = [asis, crestAt(4), crestAt(2), crestAt(0), crestAt(-2), crestAt(-4)];
  const chart = q => [skin.sOf(q, H(q)), H(q)];
  return { hX, pub: [pubAt(.6), pubAt(1.8), pubAt(2.9)], asis, crest, crestC: crest.map(chart), H, chart };
}

/* ---------- прямая мышца живота ----------
   Ориентиры: пупок — h 16,0 (ANSUR II, высота пупка 105,5 см минус высота тазобедренных манекена 89,5); конец мечевидного
   отростка — нижняя точка грудины у средней линии (скелет); перемычки — у пупка, у мечевидного и посередине (Gray's).
   Белая линия (Rath et al., 1996, Surg Radiol Anat 18: 281–288, моложе 45 лет): выше пупка 10 мм, у пупка 27 мм, ниже 9 мм.
   Объём частей между перемычками — по массам у препаратов (Brown et al., 2011, Spine 36: 355–362, 11 препаратов, 8 — с тремя
   перемычками): сверху вниз 12,4 / 15,6 / 25,0 / 27,8 г (15,3 / 19,3 / 30,9 / 34,4 %). Толщина — объём части (МРТ, Riem et
   al., 2026) на площадь; сверка: УЗИ мужчин в 4 см от пупка — 11,7–11,9 мм (Lim, 2013, J Korean Soc Phys Ther 25: 405–410). */
const RA = {
  umb: 16.0, laHalf: { above: .5, umb: 1.35, below: .45, pubis: .15 },
  /* наружный край (s, см от средней линии по коже) по высоте: у лобкового бугорка ≈ 3 см (латеральное сухожилие), у пупка —
     ширина ≈ 7 см (толщина по объёму Brown — как у УЗИ Lim), вверху у 5-го хряща ≈ 10 см («much broader above») */
  lat: [[.6, 3.0], [4, 4.6], [8, 6.1], [12, 7.4], [16, 8.3], [25.5, 9.0], [35, 9.8], [43, 10.3]],
  share: [.344, .309, .193, .153],                    /* снизу вверх: лобок–пупок, пупок–середина, середина–мечевидный, верх */
  depth: .6, groove: .5, edgeTop: [.15, 0, .25], edgeT: [.7, 1, .55],
  SEGS: [[0, .08, .2, .36, .54, .72, .88, 1], [.14, .36, .62, .86, 1], [.14, .36, .62, .86, 1], [.22, .48, .74, 1]],
  INTER: [0, -.25, .45]                               /* перемычка поперёк мышцы — чуть косо, зигзагом (Gray's) */
};
function rectus(C, K, S, mu) {
  const { skin, LM } = K, bones = [], nodes = [], hX = LM.hX, hU = RA.umb, hM = (hX + hU) / 2, H = LM.H, pub = LM.pub;
  const laHalf = h => {
    const u = Math.abs(h - hU), b = u < 2.5 ? Math.cos(u / 2.5 * Math.PI / 2) ** 2 : 0;
    if (h < hU) { const p = h < 3 ? lerp(RA.laHalf.pubis, RA.laHalf.below, smooth((h - .5) / 2.5)) : RA.laHalf.below; return p + (RA.laHalf.umb - p) * b; }
    return RA.laHalf.above + (RA.laHalf.umb - RA.laHalf.above) * b;
  };
  /* строки по частям между перемычками (снизу вверх): часть 0 — лобок–пупок, 1 — пупок–середина, 2 — середина–мечевидный,
     3 — мечевидный–верх; v — доля строки в части; v = 1 у частей 0–2 — перемычка, у части 3 — верхний край (хрящи 5–7) */
  const BOUNDS = [[.6, hU], [hU, hM], [hM, hX], [hX, null]], topH = [hX + 1.7, hX + 4.4, hX + 7.4], INTER = RA.INTER;
  const rows = []; RA.SEGS.forEach((fr, seg) => fr.forEach(v => rows.push({ seg, v, inter: v === 1 && seg < 3, top: v === 1 && seg === 3 })));
  const n = rows.length, raw = [];
  for (let q = 0; q < n; q++) {
    const { seg, v, inter } = rows[q];
    for (let e = 0; e < 3; e++) {
      const h = seg === 0 ? (v === 0 ? H(pub[e]) : lerp(.6, hU + INTER[e], v)) : seg === 3 ? lerp(hX + INTER[e], topH[e], v) : lerp(BOUNDS[seg][0] + INTER[e], BOUNDS[seg][1] + INTER[e], v);
      const sL = laHalf(h), sR = profile(RA.lat, h), s = e === 0 ? sL : e === 2 ? sR : lerp(sL, sR, .45);
      /* относительная толщина: по ширине — RA.edgeT, у перемычки — RA.groove, рядом — 0,85, у лобка — сухожилие, у верхнего
         края — тонко (прикрепление к хрящам) */
      let rel = RA.edgeT[e];
      const near = (seg > 0 && v <= .15) || (seg < 3 && v >= .86 && v < 1) || (seg === 3 && v <= .22);
      if (inter) rel *= RA.groove; else if (rows[q].top) rel *= .45; else if (near) rel *= .85;
      if (seg === 0) rel *= v === 0 ? .35 : v < .1 ? .6 : v < .25 ? .85 : 1;
      raw.push({ q, e, h, s, seg, v, inter, rel, P: skin.at(s, h) });
    }
  }
  /* масштаб толщины по частям: объём части = доля × объём мышцы (Brown 2011); четырёхугольник между строками q и q + 1 —
     часть строки q + 1 */
  const area = (a, b, c, d) => .5 * len(cross(sub(c, a), sub(d, b)));
  const vol = [0, 0, 0, 0];
  for (let q = 0; q + 1 < n; q++) for (const [e0, e1] of [[0, 1], [1, 2]]) {
    const i = [q * 3 + e0, q * 3 + e1, (q + 1) * 3 + e1, (q + 1) * 3 + e0];
    vol[rows[q + 1].seg] += area(...i.map(k => raw[k].P.p)) * i.reduce((s, k) => s + raw[k].rel, 0) / 4;
  }
  const scale = vol.map((v, k) => RA.share[k] * mu.v / v);
  for (const x of raw) { const sc = x.inter ? (scale[x.seg] + scale[x.seg + 1]) / 2 : scale[x.seg]; x.t = x.rel * sc; x.tNom = x.inter ? x.t / RA.groove : x.t; }
  /* глубина верха: RA.depth под кожей (у краёв глубже — сечение выпуклое); у перемычки верх ниже на разницу толщин (борозда
     снаружи, низ мышцы ровный); над рёбрами — не глубже, чем позволяют рёбра (низ не ближе 1 мм к оболочке); у лобка — к кости */
  for (const x of raw) {
    const P = x.P, t = x.t;
    let d = RA.depth + RA.edgeTop[x.e] + (x.inter ? x.tNom - t : 0);
    const gap = ribGap(C, S, P.p, P.n); if (Number.isFinite(gap)) d = Math.min(d, Math.max(.25, gap - t - .1));
    let Q = add(P.p, P.n, -d);
    if (x.seg === 0 && x.v < .25) {
      /* у лобка: нижняя строка — на гребне лобковой кости (верх пласта — на толщину над костью), выше — к коже; таз — жёстко */
      const w = x.v === 0 ? 1 : x.v < .1 ? .6 : .25, toBone = x.v === 0 ? 1 : x.v < .1 ? .45 : .15, onBone = pub[x.e];
      Q = lerp3(Q, add(onBone, unit(sub(P.p, onBone)), t), toBone);
      nodes.push(w >= 1 ? boneNode(C, bones, ['pelvis_R', 'R'], Q, 0, t) : mixNode(C, bones, ['pelvis_R', 'R'], Q, P.kf, w, 0, t));
    } else if (Number.isFinite(gap)) nodes.push(sandwichNode(C, bones, Q, P.kf, add(P.p, P.n, -(gap - .1)), 0, t));   /* над хрящами: пол — рёбра */
    else nodes.push(skinNode(C, Q, P.kf, 0, t));
  }
  return { key: 'rectabd', lines: [mu.name], n, bones, nodes, strips: [Array.from({ length: n * 3 }, (_, i) => i)], info: { hX, hM, hU, scale, share: RA.share } };
}

/* ---------- передняя зубчатая и наружная косая: зубцы ----------
   Четыре нижних зубца передней зубчатой (рёбра 6–9) входят между пятью верхними зубцами наружной косой (рёбра 5–9): по Gray's,
   зубчатая начинается от верхних краёв рёбер, наружная косая — от нижних, поэтому на ребре k кончик зубца зубчатой D_k — у
   верхнего края, впереди, кончик зубца наружной косой E_k — у нижнего края, сзади: граница двух мышц — зигзаг D5 E5 D6 E6 …
   D9 E9 (вниз и назад по косой линии). Обе мышцы лежат на наружной поверхности рёбер; узлы зигзага — общие точки двух стенок
   (одни и те же числа: зубцы входят друг в друга без щели и нахлёста).
   Азимуты кончиков (°, от передней линии): зубчатая — дуга от 1-го ребра под подмышкой к рёбрам 5–6 у передней подмышечной
   линии и назад к 9-му; наружная косая — на 14° позади (≈ 3 см): верхние зубцы у хрящей рёбер, средние — дальше от хрящей,
   нижние три — у концов рёбер 10–12 (12-е — вершина хряща), между ними — зубцы широчайшей (здесь не рисуются). */
const TEETH = {
  D: { 1: 80, 2: 72, 3: 65, 4: 58, 5: 52, 6: 54, 7: 58, 8: 64, 9: 71 },
  E: { 5: 66, 6: 68, 7: 72, 8: 78, 9: 85, 10: 93, 11: 106, 12: 131 },
  c0: .12,                                              /* зазор над оболочкой рёбер, см (выступы рёбер над межрёберными) */
  /* впадины между зубцами рёбер 2–5, ° назад от середины кончиков: зубчатая начинается и от апоневрозов над межрёберными
     между зубцами (Gray's, 1918, с. 441: «and from the aponeuroses covering the intervening Intercostales») — край начала
     почти сплошной; при 11° (до 4.58.0) с рукой над головой между зубцами у подмышки открывались рёбра */
  valley: 3
};
function teeth(S) {
  const pt = (k, th, part) => { const R0 = ribAt(S, k, th); return { th, y: part === 'hi' ? lerp(R0.mid, R0.hi, .45) : part === 'lo' ? lerp(R0.mid, R0.lo, .45) : R0.mid, k }; };
  const D = {}, E = {}, V = {};
  for (const [k, th] of Object.entries(TEETH.D)) D[k] = pt(+k, th, 'hi');
  for (const [k, th] of Object.entries(TEETH.E)) E[k] = pt(+k, th, +k >= 10 ? 'mid' : 'lo');
  D.top = pt(1, 84, 'mid');
  /* впадины зубчатой выше наружной косой (между зубцами рёбер 2–5): посередине, на TEETH.valley назад */
  for (const k of [3, 4, 5]) { const a = D[k - 1], b = D[k]; V['d' + k] = { th: (a.th + b.th) / 2 + TEETH.valley, y: (a.y + b.y) / 2 }; }
  /* впадины наружной косой между зубцами 9–12 (там зубцы широчайшей): посередине, на 10° вперёд и на 1,2 см ниже */
  for (const k of [10, 11, 12]) { const a = E[k - 1], b = E[k]; V[k] = { th: (a.th + b.th) / 2 - 10, y: Math.min(a.y, b.y) - 1.2 }; }
  V.end = { th: E[12].th + 9, y: E[12].y - 1.5 };
  return { D, E, V };
}

/* Передняя зубчатая (DAS3, 12 линий: serr_ant_1 — нижняя … serr_ant12 — верхняя). Начало — зубцы рёбер 1–9: линия 1 — между
   зубцами 9 и 8 (впадина — кончик зубца наружной косой E8), …, линия 4 — 6 и 5, линии 5–7 — между зубцами 5…2, линии 8–12 —
   широкий первый зубец (рёбра 1–2). Конец — медиальный край лопатки (ломаная через точки DAS3 на нём): линии 1–5 сходятся
   веером к нижнему углу, 6 — чуть выше, 7 — середина края, 8–12 — к верхнему углу (Gray's). Узлы скользят по оболочке рёбер
   между точкой начала и точкой на лопатке (доля F). */
const SA = { F: [0, .06, .14, .24, .36, .5, .64, .78, .9, 1], ins: [0, .02, .04, .06, .08, .1, .22, .45, .6, .7, .8, .9, 1], relQ: [.25, .6, .85, 1, 1, 1, 1, .95, .8, .55] };
function serratus(C, K, S, T, mus) {
  const names = ['serr_ant_1', 'serr_ant_2', 'serr_ant_3', 'serr_ant_4', 'serr_ant_5', 'serr_ant_6', 'serr_ant_7', 'serr_ant_8', 'serr_ant_9', 'serr_ant10', 'serr_ant11', 'serr_ant12'].map(x => x + '_r');
  const Kn = names.length, n = SA.F.length, bones = [], nodes = [], { D, E, V } = T;
  const O = [D[9], E[8], D[8], E[7], D[7], E[6], D[6], E[5], D[5], V.d5, D[4], V.d4, D[3], V.d3, D[2]];
  /* первый зубец (рёбра 1–2): 10 узлов от кончика 2-го ребра к верху 1-го, чуть выпукло вперёд */
  for (let i = 1; i <= 10; i++) O.push({ th: lerp(D[2].th, D.top.th, i / 10) - 4 * Math.sin(Math.PI * i / 10), y: lerp(D[2].y, D.top.y, i / 10) });
  if (O.length !== 2 * Kn + 1) throw Error('serratus: столбцов ' + O.length);
  const scap = ['serr_ant_1', 'serr_ant_6', 'serr_ant_7', 'serr_ant_8', 'serr_ant_9', 'serr_ant12'].map(nm => mus(nm + '_r').el.find(e => e.s && e.s.bone[0] === 'scapula').s.p);
  const insCol = c => polyAt(scap, c % 2 ? (SA.ins[(c - 1) / 2] + SA.ins[(c + 1) / 2]) / 2 : SA.ins[c / 2]);
  for (let q = 0; q < n; q++) for (let c = 0; c <= 2 * Kn; c++) {
    const rel = SA.relQ[q] * (c === 0 || c === 2 * Kn ? .5 : 1);
    nodes.push(glideNode(bones, O[c].th, O[c].y, ['scapula', 'R'], insCol(c), SA.F[q], TEETH.c0, 0, rel));
  }
  return { key: 'serrant', lines: names, n, bones, nodes, strips: gridStrips(Kn, n), vol: names.map(nm => mus(nm).v), O };
}

/* Наружная косая (8 линий по зубцам сверху вниз: EO7 — ребро 5, EO8 — 6, EO1–EO6 — 7–12). Конец (Gray's): верхние и средние
   волокна — вниз и вперёд в апоневроз (граница «мышца — апоневроз» — от хряща 9-го ребра к передней верхней ости, выше — у
   края прямой), апоневроз рисуется до края прямой мышцы и на EO.over на неё (передний листок влагалища над прямой не рисуется —
   иначе он закрыл бы «кубики»); нижние — к паховой связке, задние (рёбра 11–12) — почти вертикально к передней половине
   гребня подвздошной кости. Апоневроз — EO.apo толщиной. Над рёбрами низ пласта — на оболочке (зубцы — на рёбрах), дальше от
   зубцов пласт может отойти от рёбер на EO.float; вне рёбер верх — EO.depth под кожей. */
const EO = { F: [0, .05, .12, .2, .3, .4, .5, .6, .7, .79, .87, .93, .97, 1], depth: .45, apo: .15, over: .6, float: 1.2, blend: [.6, .35, .15], blendLast: .25, names: ['EO7', 'EO8', 'EO1', 'EO2', 'EO3', 'EO4', 'EO5', 'EO6'],
  /* швы на краю прямой между полосами EO7…EO4 (высота h) */
  semi: [40.5, 37.5, 34, 29, 22.5, 13] };
function obliqueExt(C, K, S, T, mus) {
  const { skin, LM } = K, names = EO.names.map(x => x + '_r'), Kn = names.length, n = EO.F.length, { D, E, V } = T;
  const O = [D[5], E[5], D[6], E[6], D[7], E[7], D[8], E[8], D[9], E[9], V[10], E[10], V[11], E[11], V[12], E[12], V.end];
  /* узлы зигзага — та же точка, что у узла скольжения передней зубчатой с долей 0 (оболочка приложения, Muscles.shellR) */
  const O3 = O.map(p => { const r = C.Muscles.shellR(K.rt, p.th, p.y); if (r < 0) throw Error('EO: нет рёбер под зубцом'); return C.toWorld(C.rib, fromChart(S, p.th, p.y, r + TEETH.c0)); });
  const Oc = O3.map(p => [skin.sOf(p, C.H0 - p[1]), C.H0 - p[1]]);
  const semi = h => [profile(RA.lat, h) - EO.over, h], cs = LM.crestC, tub = [3.3, 1.6];
  const ins = [];
  for (let k = 0; k < 5; k++) ins.push(semi(EO.semi[k]), semi((EO.semi[k] + EO.semi[k + 1]) / 2));
  /* EO4 (ребро 10): край прямой от h 13 до лобкового бугорка и паховая связка до ости; EO5 (11): гребень от ости; EO6 (12): дальше */
  ins.push(semi(EO.semi[5]), tub, cs[0], cs[1], cs[2], cs[3], cs[4]);
  const ins3 = [...Array(12).fill(null), LM.crest[0], LM.crest[1], LM.crest[2], LM.crest[3], LM.crest[4]];
  if (O.length !== 2 * Kn + 1 || ins.length !== 2 * Kn + 1) throw Error('EO: столбцов ' + O.length + ' / ' + ins.length);
  /* граница «мышца — апоневроз» на карте (s по высоте h) */
  const ninth = [profile(RA.lat, 28.5) + 1.5, 28.5], J = h => (h >= ninth[1] ? profile(RA.lat, h) + 2.5 : lerp(cs[0][0], ninth[0], clamp((h - cs[0][1]) / (ninth[1] - cs[0][1]), 0, 1)));
  const raw = [];
  for (let q = 0; q < n; q++) for (let c = 0; c <= 2 * Kn; c++) {
    const f = EO.F[q], s = lerp(Oc[c][0], ins[c][0], f), h = lerp(Oc[c][1], ins[c][1], f), P = skin.at(s, h);
    const apo = c <= 11 && s < J(h) && f > .3;
    let rel = apo ? 0 : q === 0 ? .25 : q === 1 ? .6 : q === 2 ? .85 : 1;
    if (!apo && f > .93) rel *= .7;
    if (c === 0 || c === 2 * Kn) rel *= .6;
    raw.push({ q, c, f, s, h, P, apo, rel });
  }
  return { key: 'eo', names, n, Kn, raw, O3, ins3, vol: names.map(nm => mus(nm).v) };
}
/* Узел у кожи (верх опорный) над рёбрами: в кадре пол из оболочки рёбер своей стороны (Muscles.wallSurface, WALL_FLOOR 1 мм
   над оболочкой) поднимает узел, если низ (Q − n·t) под полом. Грудная клетка MyoSim несимметрична, и у 12-го ребра пол
   поднимал в покое узел только одной стороны (4.62.0: задний край наружной косой — левая в 2,5 мм от зеркала правой). Поэтому
   узел ставится над полом обеих оболочек (K.rt, K.lt — оболочки приложения; точка левой — зеркально по x рамки грудной клетки) */
const WALL_FLOOR_APP = .1;
function clearShells(C, K, Q, n, t) {
  let lift = 0;
  for (const [S, g] of [[K.rt, 1], [K.lt, -1]]) {
    if (!S) continue;
    const b = C.toLocal(C.rib, add(Q, n, -t)), lx = g * b[0], lz = b[2] - S.zc, gs = S === K.rt ? -1 : 1;
    const th = Math.atan2(gs * lx, lz) / DEG; if (th < S.th0 || th > S.th0 + S.dth * (S.NT - 1)) continue;
    const rs = C.Muscles.shellR(S, th, b[1]); if (rs < 0) continue;
    const rr = Math.hypot(lx, lz), def = rs + WALL_FLOOR_APP - rr; if (def <= 0) continue;
    const nl = sub(C.toLocal(C.rib, add(Q, n, 1)), C.toLocal(C.rib, Q)), cr = Math.abs((g * nl[0] * lx + nl[2] * lz) / (rr || 1));
    lift = Math.max(lift, def / Math.max(.3, cr));
  }
  return lift > 0 ? add(Q, n, lift + .01) : Q;
}
/* узлы наружной косой при номинальной толщине мышечной части tNom (уточняется по объёмам — build) */
function obliqueExtNodes(C, K, S, W, tNom) {
  const { raw, O3, ins3, n, Kn } = W, bones = [], nodes = [], fixed = [];
  for (const x of raw) {
    x.t = x.apo ? EO.apo : tNom * x.rel;
    x.gap = x.q === 0 ? 0 : ribGap(C, S, x.P.p, x.P.n);
    x.dRib = Number.isFinite(x.gap) ? x.gap - x.t - TEETH.c0 : null;
    x.d = x.dRib == null ? EO.depth : Math.max(EO.depth, x.dRib - EO.float * smooth((x.f - .05) / .3));
    if (x.dRib != null) x.d = Math.min(x.d, x.dRib);
  }
  /* сглаживание глубины вдоль столбца (переход «на рёбрах — под кожей» у рёберной дуги), не глубже рёбер */
  const at = (c, q) => raw[q * (2 * Kn + 1) + c];
  for (let pass = 0; pass < 3; pass++) for (let c = 0; c <= 2 * Kn; c++) for (let q = 2; q < n - 1; q++) {
    const x = at(c, q); let d = .25 * at(c, q - 1).d + .5 * x.d + .25 * at(c, q + 1).d; if (x.dRib != null) d = Math.min(d, x.dRib); x.d = Math.max(.3, d);
  }
  /* Переход «на рёбрах — под кожей» у рёберной дуги. Над рёбрами низ пласта — жёстко с грудной клеткой, ниже верх — у кожи; в
     сильном сгибании туловища (скручивания) рёбра опускаются к тазу и уходят вглубь, а кожа живота у дуги — нет, и на границе
     вдоль полосы был излом до 130–170° (край рёберной части шёл ломаной). Строки под последней строкой над рёбрами следуют за
     грудной клеткой на долю EO.blend (узел-смесь кожи и рамки грудной клетки): в нейтральной позе положение то же, в позе
     переход растянут на несколько строк. Волокна наружной косой и правда идут от рёбер: у дуги мышца движется с ними. */
  const lastRib = Array.from({ length: 2 * Kn + 1 }, (_, c) => { let l = 0; for (let q = 0; q < n; q++) if (at(c, q).dRib != null) l = q; return l; });
  for (const x of raw) {
    fixed.push(x.apo);
    /* зубцы (строка 0) и узлы над рёбрами: низ — на рёбрах (жёстко с грудной клеткой), потолок — CEIL под кожей */
    if (x.q === 0) { const sk = K.skin.at(K.skin.sOf(O3[x.c], C.H0 - O3[x.c][1]), C.H0 - O3[x.c][1]); nodes.push(sandwichNode(C, bones, add(sk.p, sk.n, -CEIL), sk.kf, O3[x.c], 1, x.t)); continue; }
    let Q = add(x.P.p, x.P.n, -x.d);
    if (ins3[x.c] && x.f > .8) {
      /* у гребня подвздошной кости — к кости (последняя строка — верх пласта на толщину над гребнем), жёстко с тазом */
      const w = smooth((x.f - .8) / .2), B = ins3[x.c], onB = add(B, unit(sub(x.P.p, B)), x.t);
      Q = lerp3(Q, onB, w);
      nodes.push(mixNode(C, bones, ['pelvis_R', 'R'], Q, x.P.kf, w, 0, x.t));
    } else if (x.dRib != null) nodes.push(sandwichNode(C, bones, add(x.P.p, x.P.n, -CEIL), x.P.kf, add(Q, x.P.n, -x.t), 1, x.t));
    else {
      /* нижняя строка (свободный задний край у гребня) — не больше EO.blendLast: узел, жёсткий с грудной клеткой на 0,6, в
         скручивании (велосипед) выходил из кожи на 0,8 см */
      const k = x.q - lastRib[x.c], w = k >= 1 && k <= EO.blend.length ? Math.min(EO.blend[k - 1], x.q === n - 1 ? EO.blendLast : 1) : 0;
      Q = clearShells(C, K, Q, x.P.n, x.t);
      nodes.push(w > 0 ? mixNode(C, bones, ['ribcage', ''], Q, x.P.kf, w, 0, x.t) : skinNode(C, Q, x.P.kf, 0, x.t));
    }
  }
  return { key: 'eo', lines: W.names, n, bones, nodes, strips: gridStrips(Kn, n), vol: W.vol, fixed };
}

/* Внутренняя косая (6 линий MyoBack: IO1–IO3 — от паховой связки и гребня к апоневрозу у края прямой, IO4–IO6 — от гребня к
   хрящам рёбер 10–12). Начало — латеральная половина паховой связки и передние 2/3 гребня; конец — край прямой (от h 5 до
   рёберной дуги) и нижние края хрящей 10–12. Под наружной косой: верх — на 0,5 мм под её нижней поверхностью (луч от кожи
   внутрь), где наружной косой нет — IO.depth под кожей. */
const IO = { F: [0, .1, .22, .36, .5, .64, .78, .88, .95, 1], depth: .5, blend: [.15, .05], names: ['IO1', 'IO2', 'IO3', 'IO4', 'IO5', 'IO6'],
  orig: [0, .06, .12, .2, .28, .36, .45, .55, .64, .73, .82, .91, 1], ins: [0, .08, .16, .24, .32, .4, .5, .58, .66, .75, .84, .92, 1] };
function obliqueInt(C, K, S, T, mus, eoBottom, tIO = 0) {
  const { skin, LM } = K, names = IO.names.map(x => x + '_r'), Kn = names.length, n = IO.F.length, bones = [], nodes = [], fixed = [], rels = [], { E } = T;
  const cs = LM.crestC, tub = [3.3, 1.6], ingMid = [lerp(tub[0], cs[0][0], .5), lerp(tub[1], cs[0][1], .5)];
  const Op = [ingMid, cs[0], cs[1], cs[2], cs[3], cs[4], cs[5]];
  /* конец: край прямой (на 0,3 см латеральнее) от h 5 до рёберной дуги, затем по нижним краям хрящей 10–12 к концу 12-го ребра */
  const semi = h => [profile(RA.lat, h) + .3, h], rib = (k, th) => { const R0 = ribAt(S, k, th), p = shellPoint(C, S, { th, y: R0.lo }, TEETH.c0); return [skin.sOf(p, C.H0 - p[1]), C.H0 - p[1]]; };
  const Ip = [semi(5), semi(12), semi(19), semi(25), semi(28.5), rib(10, 75), rib(10, 90), rib(11, E[11].th), rib(12, E[12].th)];
  const crest3 = [null, LM.crest[0], LM.crest[1], LM.crest[2], LM.crest[3], LM.crest[4], LM.crest[5]];
  for (let q = 0; q < n; q++) for (let c = 0; c <= 2 * Kn; c++) {
    const f = IO.F[q], a = polyAt(Op, IO.orig[c]), b = polyAt(Ip, IO.ins[c]), s = lerp(a[0], b[0], f), h = lerp(a[1], b[1], f), P = skin.at(s, h);
    let rel = q === 0 ? .4 : q === 1 ? .8 : 1; if (f > .9) rel *= .55; if (c === 0 || c === 2 * Kn) rel *= .6;
    /* верх — под наружной косой; над рёбрами (у хрящей 10–12) — не глубже рёбер, пол — рёбра */
    const hit = rayTris(eoBottom, P.p, P.n.map(x => -x)), gap = ribGap(C, S, P.p, P.n);
    /* над рёбрами верх — так, чтобы низ (верх + толщина) остался над рёбрами. Первый проход — толщина 0,5 rel; второй (tIO — см
       толщины на единицу rel после подгонки объёма по МРТ) — по толщине первого прохода, пол — TEETH.c0 над рёбрами (как у
       зубцов), и где места меньше толщины, пласт тоньше (объём по МРТ добирается остальным пластом). У заднего края над 12-м
       ребром (4.62.0: нижние рёбра ближе к гребню) низ толщиной первого прохода уходил в рёбра на 0,3 см */
    let d = Number.isFinite(hit) && hit < 6 ? hit + .05 : IO.depth;
    if (Number.isFinite(gap)) d = Math.min(d, Math.max(.3, tIO > 0 ? gap - TEETH.c0 - rel * tIO : gap - .5 * rel - .1));
    if (tIO > 0 && Number.isFinite(gap)) rel = Math.min(rel, Math.max(.05, (gap - TEETH.c0 - d) / tIO));
    let Q = add(P.p, P.n, -d);
    fixed.push(false); rels.push(rel);
    const onCrest = q <= 1 && IO.orig[c] >= .12;
    if (onCrest) {
      /* у гребня — к кости (начало) */
      const B = polyAt(LM.crest.slice(0, 6), (IO.orig[c] - .12) / .88), w = q === 0 ? 1 : .5;
      Q = lerp3(Q, add(B, unit(sub(P.p, B)), .2), q === 0 ? 1 : .4);
      nodes.push(mixNode(C, bones, ['pelvis_R', 'R'], Q, P.kf, w, 0, rel));
    } else if (q <= 1 + IO.blend.length && IO.orig[c] >= .12 && !Number.isFinite(gap)) {
      /* строки над гребнем — за тазом на убывающую долю IO.blend: в сильном сгибании туловища кожа живота над гребнем уходит от
         таза, и на второй строке был излом до 80° (как у наружной косой у рёберной дуги) */
      nodes.push(mixNode(C, bones, ['pelvis_R', 'R'], Q, P.kf, IO.blend[q - 2], 0, rel));
    } else if (Number.isFinite(gap)) nodes.push(sandwichNode(C, bones, Q, P.kf, add(P.p, P.n, -(gap - .1)), 0, rel));
    else nodes.push(skinNode(C, Q, P.kf, 0, rel));
  }
  return { key: 'io', lines: names, n, bones, nodes, strips: gridStrips(Kn, n), vol: names.map(nm => mus(nm).v), fixed, rels };
}

/* Малая грудная (DAS3, 4 линии сверху вниз). Начало — три зубца на рёбрах 3, 4, 5 у хрящей (верхние края и наружные
   поверхности), конец — клювовидный отросток (точки DAS3 на нём). Под большой грудной, над зубцами передней зубчатой: к
   клювовидному отростку пласт поднимается от рёбер к его высоте (lift 2 — к середине длины уже на ней). */
const PM = { F: [0, .08, .18, .3, .44, .58, .72, .85, .95, 1], relQ: [.3, .7, .9, 1, 1, 1, 1, .95, .8, .5] };
function pecMinor(C, K, S, T, mus) {
  const names = ['pect_min_1', 'pect_min_2', 'pect_min_3', 'pect_min_4'].map(x => x + '_r'), Kn = names.length, n = PM.F.length, bones = [], nodes = [];
  const r = (k, th, part) => { const R0 = ribAt(S, k, th); return { th, y: part === 'hi' ? R0.hi : part === 'lo' ? R0.lo : R0.mid }; };
  /* начало: линия у хрящей от верхнего края 3-го ребра к нижнему краю 5-го; зубцы (кончики — к середине тела, у хрящей) на
     рёбрах 3, 4, 5 (доли 1/6, 1/2, 5/6 линии), впадины между ними — латеральнее */
  const base = [r(3, 45, 'hi'), r(4, 47, 'mid'), r(5, 51, 'lo')].map(p => [p.th, p.y]);
  const zig = u => { const d = [[0, 0], [1 / 6, -5], [1 / 3, 2], [.5, -5], [2 / 3, 2], [5 / 6, -5], [1, 0]]; return profile(d, u); };
  const O = Array.from({ length: 2 * Kn + 1 }, (_, c) => { const u = c / (2 * Kn), p = polyAt(base, u); return { th: p[0] + zig(u), y: p[1] }; });
  const cor = ['pect_min_1', 'pect_min_3', 'pect_min_4'].map(nm => mus(nm + '_r').el.find(e => e.s && e.s.bone[0] === 'scapula').s.p);
  for (let q = 0; q < n; q++) for (let c = 0; c <= 2 * Kn; c++) {
    const rel = PM.relQ[q] * (c === 0 || c === 2 * Kn ? .5 : 1);
    nodes.push(glideNode(bones, O[c].th, O[c].y, ['scapula', 'R'], polyAt(cor, c / (2 * Kn)), PM.F[q], TEETH.c0, 2, rel));
  }
  return { key: 'pecmin', lines: names, n, bones, nodes, strips: gridStrips(Kn, n), vol: names.map(nm => mus(nm).v) };
}

/* ---------- спина (этап В): выпрямитель позвоночника столбами, многораздельные, квадратная поясницы ----------
   Пути MyoBack (85 линий на сторону: подвздошно-рёберная 12, длиннейшая 26, многораздельные 25, квадратная поясницы 18;
   остистая 4 — anatomy.js) — линии действия для силы: короткие пучки у позвонков, длинные хвостовые сухожилия, начала и
   концы у самых костей; трубками вдоль них поясница была «веником» со щелями, между трубками торчали позвонки (аудит 4.53.0,
   находка 3). Здесь тела рисуются столбами по поверхности спины, как у человека (Gray's Anatomy, 1918, с. 394–397, «The
   deep muscles of the back»; OpenStax A&P 2e, 11.4): общая масса выпрямителя от крестца и гребня подвздошной кости вверх
   делится на три столба — подвздошно-рёберную снаружи (к углам рёбер), длиннейшую посередине (к поперечным отросткам и
   рёбрам у бугорков), остистую у остистых отростков (грудной отдел); многораздельные — в желобе у остистых отростков от
   крестца до L1 (под апоневрозом выпрямителя), квадратная поясницы — глубже, впереди поперечных отростков, от гребня к 12-му
   ребру (сзади её закрывает выпрямитель).
   Как устроено: правая сторона по карте кожи спины (sb — дуга от задней средней линии по коже, см; h — высота над
   тазобедренными), левая — зеркально. Столб — стенка: строки на общей сетке высот BK.H (у соседних столбов строки на одних
   высотах — узлы общей границы совпадают, щели нет), полосы — линии столба поперёк (порядок — BK.order: у столба сверху
   кончаются сначала одни полосы, потом другие — как прикрепления пучков); полоса линии занята между высотами её концов (у
   начала на крестце и гребне — до низа столба), ширины занятых полос равны. Контуры столбов — BK.B1…B3 (по ориентирам
   скелета манекена: остистые отростки, поперечные, углы рёбер, крестец, задняя верхняя ость, гребень; линии моделей лежат
   внутри своих столбов). Узел — «между кожей и костью» (4): верх — под кожей на BK.depth (под трапециевидной и широчайшей —
   глубже), пол — огибающая костей под узлом (ближайшая кость в окрестности ±1 см по ширине и ±1,5 см по высоте: остистые и
   поперечные отростки, дуги, рёбра, крестец, таз; где кости нет — сбоку от поперечных отростков — задняя поверхность
   квадратной поясницы); толщина — доля f места между верхом и полом (по столбу одна, так что объём столба — МРТ, как
   раньше: сумма объёмов его линий, volumes.js; где МРТ в место между костями и кожей манекена не помещается — f = 1: у
   многораздельных 54 %, у длиннейшей 87 %, у подвздошно-рёберной 93 % объёма), у краёв и концов тоньше. Пол лент спины (трапециевидная, ромбовидные,
   широчайшая) — верх столбов (backTopMap). Между столбами — неглубокая борозда (верх
   границы на BK.groove глубже), у остистых отростков и наружного края — скруглённый край (BK.rim). */
const BK = {
  H: [3, 6, 9, 12, 15, 18, 21, 24, 27, 33, 39, 45, 51, 57],      /* общая сетка высот строк, см: через 3 до 27 (поясница), выше через 6 */
  med: .6,                                                       /* медиальный край — у остистых отростков */
  B1: [[3, 2.4], [6, 3.2], [9, 3.6], [14, 3.6], [18, 3.2], [22, 2.6], [27, 1.8], [34, 1.9], [44, 1.9], [52, 1.6], [57, .8]],   /* многораздельные, остистая | длиннейшая */
  B2: [[9, 4.4], [14, 5.0], [20, 4.9], [26, 4.7], [32, 4.5], [40, 4.3], [48, 4.0], [52, 3.6], [57, 2.6]],                       /* длиннейшая | подвздошно-рёберная */
  B3: [[15, 6.6], [18, 8.4], [22, 9.2], [28, 9.0], [34, 8.2], [40, 7.5], [45, 6.8], [48, 5.6], [51, 3.7]],                      /* наружный край подвздошно-рёберной */
  depth: [[0, .45], [26, .45], [34, 1.0], [44, 1.2], [50, 1.8], [54, 2.6], [57, 3.2]], groove: .12, rim: .35,
  relEdge: { rim: .45, groove: .8 }, relEnd: [.35, .75],
  roomMax: 5, roomNo: 3.5, NB: .5, NH: 1.5, ext: [8, 3], taper: 2.5,
  cols: {
    mf: { rows: [3, 27], med: 'med', lat: 'B1', edges: ['rim', 'groove'], depth: 0 },
    sp: { rows: [27, 57], med: 'med', lat: 'B1', edges: ['rim', 'groove'], depth: 0 },
    lt: { rows: [9, 57], med: 'B1', lat: 'B2', edges: ['groove', 'groove'], depth: 0 },
    il: { rows: [15, 51], med: 'B2', lat: 'B3', edges: ['groove', 'rim'], depth: 0 },
  },
  order: {
    il: ['IL_L4', 'IL_L3', 'IL_L2', 'IL_L1', 'IL_R5', 'IL_R6', 'IL_R7', 'IL_R8', 'IL_R9', 'IL_R10', 'IL_R11', 'IL_R12'],
    lt: ['LTpT_T1', 'LTpT_T2', 'LTpT_T3', 'LTpT_T4', 'LTpT_T5', 'LTpT_T6', 'LTpT_T7', 'LTpT_T8', 'LTpT_T9', 'LTpT_T10', 'LTpT_T11', 'LTpT_T12',
      'LTpT_R4', 'LTpT_R5', 'LTpT_R6', 'LTpT_R7', 'LTpT_R8', 'LTpT_R9', 'LTpT_R10', 'LTpT_R11', 'LTpT_R12', 'LTpL_L1', 'LTpL_L2', 'LTpL_L3', 'LTpL_L4', 'LTpL_L5'],
    sp: ['SPIN1', 'SPIN2', 'SPIN3', 'SPIN4'],
    mf: null,                                                    /* многораздельные — по уровню прикрепления (L1 у середины), затем по началу */
  },
  key: { il: 'il', lt: 'ltpt', sp: 'spinalis', mf: 'mf' },
};
/* огибающая костей под точкой спины (над костью — по нормали кожи внутрь): ближайшее попадание лучей в окрестности */
function backFloor(C, BT, skin, sb, h, d) {
  const key = (s, hh) => s.toFixed(2) + ',' + hh.toFixed(2), cache = BT.cache;
  const ray = (s, hh) => {
    const k = key(s, hh); if (cache.has(k)) return cache.get(k);
    const r = skin.row(hh), tot = r.cum[r.cum.length - 1], P = skin.at(tot - Math.max(0, s), hh), q = add(P.p, P.n, -d), dir = P.n.map(x => -x);
    let best = Infinity, bone = null;
    /* лучи горизонтальны (нормаль кожи сечения): треугольники — из корзины своей высоты */
    for (const o of BT.at(q[1])) { const t = rayTris([o.t], q, dir); if (t < best) { best = t; bone = o.bone; } }
    const v = { t: best, bone }; cache.set(k, v); return v;
  };
  let best = { t: Infinity, bone: null };
  /* по ширине — только наружу от средней линии (у медиальных узлов окрестность не захватывает остистые отростки: пол —
     дуги позвонков, а не вершины отростков между правым и левым столбом) */
  for (let ds = 0; ds <= BK.NB + 1e-9; ds += .5) for (let dh = -BK.NH; dh <= BK.NH + 1e-9; dh += .75) { const v = ray(sb + ds, h + dh); if (v.t < best.t) best = v; }
  return best;
}
const VERT = [['sacrum', 14.4], ['L5', 18], ['L4', 21.5], ['L3', 24.5], ['L2', 27.5], ['L1', 30.5]];
const vertebraAt = h => { for (const [n, top] of VERT) if (h < top) return [n, '']; return ['ribcage', '']; };
/* столб: узлы (4 — между кожей и полом) по сетке строк, толщина — доля f места (уточняется по объёму в build) */
function backColumn(C, K, BT, name, mus) {
  const spec = BK.cols[name], skin = K.skin, rows = BK.H.filter(h => h >= spec.rows[0] - 1e-9 && h <= spec.rows[1] + 1e-9), n = rows.length;
  const tab = k => (k === 'med' ? () => BK.med : h => profile(BK[k], h));
  const mF = tab(spec.med), lF = tab(spec.lat);
  /* линии столба и их порядок поперёк (от средней линии наружу) */
  let names = BK.order[name];
  const H = q => C.H0 - q[1];
  const ends = nm => {
    const P = C.Muscles.place(K.bound[K.at.get(nm + '_r')], C.m).filter(e => e.s).map(e => e.s), hs = P.map(H);
    return { lo: Math.min(...hs), hi: Math.max(...hs), x: P.map(p => -p[0]) };
  };
  if (!names) {
    const all = K.bound.filter(b => b.side === 'R' && new RegExp('^MF_').test(b.name)).map(b => b.name.replace(/_r$/, ''));
    names = all.map(nm => ({ nm, e: ends(nm) })).sort((a, b) => b.e.hi - a.e.hi || Math.min(...a.e.x) - Math.min(...b.e.x)).map(o => o.nm);
  }
  const E = names.map(ends), Kn = names.length;
  const [r0, r1] = spec.rows, lo = E.map(e => (e.lo - r0 < BK.ext[0] ? r0 - 1 : e.lo)), hi = E.map(e => (r1 - e.hi < BK.ext[1] ? r1 + 1 : e.hi));
  const wAt = (k, h) => smooth((h - lo[k] + BK.taper / 2) / BK.taper) * smooth((hi[k] - h + BK.taper / 2) / BK.taper);
  const bones = [], nodes = [], raw = [];
  for (let q = 0; q < n; q++) {
    const h = rows[q], m = mF(h), l = Math.max(m, lF(h)), w = names.map((_, k) => wAt(k, h)), W = w.reduce((a, b) => a + b, 0);
    const cum = [0]; for (let k = 0; k < Kn; k++) cum.push(cum[k] + w[k]);
    for (let c = 0; c <= 2 * Kn; c++) {
      const u = W < 1e-9 ? .5 : (c % 2 ? (cum[(c - 1) / 2] + w[(c - 1) / 2] / 2) : cum[c / 2]) / W, sb = m + (l - m) * u;
      const edge = c === 0 ? spec.edges[0] : c === 2 * Kn ? spec.edges[1] : null;
      const d = profile(BK.depth, h) + (edge === 'rim' ? BK.rim : edge === 'groove' ? BK.groove : 0);
      const r = skin.row(h), tot = r.cum[r.cum.length - 1], P = skin.at(tot - sb, h), ceil = add(P.p, P.n, -d);
      /* пол: огибающая костей; где кости нет (сбоку от поперечных отростков поясницы) — задняя поверхность квадратной поясницы */
      const fl = backFloor(C, BT, skin, sb, h, d);
      let room = fl.t, bone = fl.bone ? fl.bone.split('|') : null;
      if (!Number.isFinite(room) || room > BK.roomMax) {
        /* сбоку от поперечных отростков поясницы — до задней поверхности квадратной поясницы (QLW) с зазором 0,3 см */
        const dz = -P.n[2], zF = QLW.z0 + QLW.zk * (Math.abs(ceil[0]) - 3) - .3;
        room = h > 14 && h < 31 && dz > .3 ? Math.min(BK.roomMax, Math.max(1, (ceil[2] - zF) / dz)) : Math.min(BK.roomMax, Number.isFinite(room) ? room : BK.roomNo);
        bone = vertebraAt(h);
      }
      const rel = (edge ? BK.relEdge[edge] : 1) * (q === 0 || q === n - 1 ? BK.relEnd[0] : q === 1 || q === n - 2 ? BK.relEnd[1] : 1);
      raw.push({ q, c, h, sb, d, P, ceil, room, bone, rel });
    }
  }
  for (const x of raw) {
    const floor = add(x.ceil, x.P.n, -x.room), b = boneIdx(bones, x.bone), i = C.index(...x.bone);
    nodes.push([4, r3(C.H0 - x.ceil[1]), 0, r3(x.ceil[0]), r3(x.ceil[2]), b, ...C.toLocal(i, floor).map(r3), 0, r3(x.room * x.rel)]);
  }
  return { key: BK.key[name], col: name, lines: names.map(nm => nm + '_r'), n, bones, nodes, strips: gridStrips(Kn, n), vol: names.map(nm => mus(nm + '_r').v), rows, raw, noRib: 1 };
}
/* Квадратная поясницы (18 линий MyoBack): пласт впереди поперечных отростков — от подвздошно-поясничной связки и задней
   части гребня подвздошной кости к нижнему краю 12-го ребра и вершинам поперечных отростков L1–L4 (Gray's, 1918, с. 413);
   медиальный край — вершины поперечных отростков, наружный — свободный. Узлы — точки корпуса на своей высоте (0: поворачиваются
   с кожей у шарниров поясницы), нижняя строка — на тазе, верхняя — на грудной клетке (жёстко); опорная сторона — задняя
   поверхность (на BK.floorZ… вперёд от пола выпрямителя), толщина — вперёд. */
const QLW = { rows: [16, 19, 22, 25, 28, 31], med: [[16, 3.2], [28, 3.2], [31, 2.2]], lat: [[16, 7.2], [20, 8.2], [25, 8.0], [29, 7.2], [31, 6.0]], z0: -6.2, zk: .22 };
function quadratus(C, K, mus) {
  const H = q => C.H0 - q[1], rows = QLW.rows, n = rows.length;
  const names = K.bound.filter(b => b.side === 'R' && /^QL_/.test(b.name)).map(b => {
    const P = C.Muscles.place(b, C.m).filter(e => e.s).map(e => e.s), hs = P.map(H);
    return { nm: b.name.replace(/_r$/, ''), lo: Math.min(...hs), hi: Math.max(...hs), x: P.reduce((s, p) => s - p[0], 0) / P.length };
  }).sort((a, b) => a.x - b.x);
  const Kn = names.length, [r0, r1] = [rows[0], rows[n - 1]];
  const lo = names.map(e => (e.lo - r0 < BK.ext[0] ? r0 - 1 : e.lo)), hi = names.map(e => (r1 - e.hi < BK.ext[1] ? r1 + 1 : e.hi));
  const bones = [], nodes = [];
  for (let q = 0; q < n; q++) {
    const h = rows[q], m = profile(QLW.med, h), l = profile(QLW.lat, h), w = names.map((_, k) => smooth((h - lo[k] + BK.taper / 2) / BK.taper) * smooth((hi[k] - h + BK.taper / 2) / BK.taper));
    const W = w.reduce((a, b) => a + b, 0), cum = [0]; for (let k = 0; k < Kn; k++) cum.push(cum[k] + w[k]);
    for (let c = 0; c <= 2 * Kn; c++) {
      const u = W < 1e-9 ? .5 : (c % 2 ? (cum[(c - 1) / 2] + w[(c - 1) / 2] / 2) : cum[c / 2]) / W, x = m + (l - m) * u, P = [-x, C.H0 - h, QLW.z0 + QLW.zk * (x - 3)];
      const rel = (c === 0 || c === 2 * Kn ? .5 : 1) * (q === 0 || q === n - 1 ? .45 : 1);
      if (q === 0) nodes.push(boneNode(C, bones, ['pelvis_R', 'R'], P, 0, rel));
      else if (q === n - 1) nodes.push(boneNode(C, bones, ['ribcage', ''], P, 0, rel));
      else nodes.push(skinNode(C, P, 0, 0, rel));
    }
  }
  return { key: 'ql', lines: names.map(o => o.nm + '_r'), n, bones, nodes, strips: gridStrips(Kn, n), vol: names.map(o => mus(o.nm + '_r').v), noRib: 1 };
}
/* объём стенки по толщинам кадра (узлы 4 ограничены местом между кожей и полом) — нейтральная поза */
function thVolume(wall) {
  const { K, n, P, rows, TH } = wall; let V = 0;
  const area = (a, b, c, d) => { const ax = P[c * 3] - P[a * 3], ay = P[c * 3 + 1] - P[a * 3 + 1], az = P[c * 3 + 2] - P[a * 3 + 2], bx = P[d * 3] - P[b * 3], by = P[d * 3 + 1] - P[b * 3 + 1], bz = P[d * 3 + 2] - P[b * 3 + 2]; return .5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx); };
  for (let k = 0; k < K; k++) for (let q = 0; q + 1 < n; q++) {
    const r0 = (k * n + q) * 3, r1 = r0 + 3;
    for (const [a, b] of [[0, 1], [1, 2]]) { const i = [rows[r0 + a], rows[r0 + b], rows[r1 + b], rows[r1 + a]]; V += area(...i) * i.reduce((s, v) => s + TH[v], 0) / 4; }
  }
  return V;
}
/* треугольники костей спины в нейтральной позе (мир), по корзинам высоты 1 см — для лучей огибающей */
function backTris(C) {
  const list = [];
  for (const nm of ['pelvis_R|R', 'sacrum|', 'L5|', 'L4|', 'L3|', 'L2|', 'L1|', ...Array.from({ length: 12 }, (_, i) => 'thoracic' + (i + 1) + '|'), 'ribcage|']) {
    const { b, w } = C.boneWorld(nm);
    for (let f = 0; f < b.idx.length; f += 3) list.push({ t: [w[b.idx[f]], w[b.idx[f + 1]], w[b.idx[f + 2]]], bone: nm });
  }
  const bins = new Map();
  for (const o of list) { const y0 = Math.floor(Math.min(o.t[0][1], o.t[1][1], o.t[2][1])), y1 = Math.floor(Math.max(o.t[0][1], o.t[1][1], o.t[2][1])); for (let y = y0; y <= y1; y++) (bins.get(y) || bins.set(y, []).get(y)).push(o); }
  return { at: y => bins.get(Math.floor(y)) || [], cache: new Map() };
}
/* доля места f столба: объём по толщинам кадра — сумма объёмов линий по МРТ (до f = 1 — весь просвет между верхом и полом) */
function fillColumn(out, W, shells, C) {
  const target = W.vol.reduce((a, b) => a + b, 0), t0 = W.nodes.map(nd => nd[nd.length - 1]);
  const vol = f => { W.nodes.forEach((nd, v) => { nd[nd.length - 1] = r3(t0[v] * f); }); return thVolume(evaluate(out, [W], shells, C).bound.walls[0]); };
  let a = 0, b = 1, va = 0, vb = vol(1);
  if (vb < target) return { target, drawn: vb, f: 1 };
  for (let it = 0; it < 30; it++) { const mid = (a + b) / 2, v = vol(mid); if (v < target) { a = mid; va = v; } else { b = mid; vb = v; } }
  const drawn = vol(b); return { target, drawn, f: b };
}

/* ---------- ягодичные (этап В): большая, средняя, малая — пластами у тазобедренного сустава ----------
   Пути Rajagopal (по 3 линии на мышцу) — линии действия: у большой ягодичной (1 002 см³ на сторону) лента из трёх полос в
   глубоком приседе мялась по хордам линий («тряпкой»), гребень, крыло таза, большой вертел и крестец оставались голыми (аудит
   4.53.0, находка 4). Анатомия (Gray's Anatomy, 1918, с. 471–474): большая ягодичная — толстый четырёхугольный пласт от
   задней ягодичной линии и гребня позади неё, задней поверхности нижней части крестца, края копчика и крестцово-бугорной связки
   вниз и наружу; верхние три четверти и поверхностные волокна нижней — в подвздошно-большеберцовый тракт над большим вертелом,
   глубокие нижние — к ягодичной бугристости; средняя ягодичная — широкий веер от наружной поверхности крыла между гребнем,
   передней и задней ягодичными линиями к наружной поверхности большого вертела, задние две трети под большой, передняя треть
   — под кожей (ягодичный апоневроз); малая ягодичная — под средней, между передней и нижней ягодичными линиями, к переднему
   краю вертела.
   Как устроено: пласт — сетка «начало → прикрепление» (строки — доли длины волокна F, столбцы — доли линий начала и
   прикрепления; у линии модели 2–3 соседние полосы, lineOf: большая ягодичная — 7 полос, средняя — 6). Узлы — у сустава (5): в
   нейтральной позе — в рамке таза, в кадре поворачиваются вокруг центра головки бедра на долю w(F) поворота бедра (у начала
   0 — с тазом, у прикрепления 1 — с бедром). Большая ягодичная (узлы 6): верх — под кожей ягодицы на GL.max.d над
   направляющей точкой между началом и прикреплением (по нормали кожи у ближайшей к ней точки кожи, сглаженной по сетке; у
   начала верх уходит к кости); в кадре узел, вынесенный поворотом из тела, прижимается к коже по лучу из центра головки бедра
   (карты кожи у сустава, hipMaps), прижатие сглажено по сетке (Muscles: hipPull). Толщина внутрь — по профилю вдоль волокна, не
   толще места до средней ягодичной и костей, перепад между соседними узлами — не круче GL.max.slope; в кадре низ не ближе
   6,5 см к центру головки (Muscles: WALL_HIPCORE). Средняя и малая: низ — на кости (наружная поверхность крыла, вертел; над
   большой седалищной вырезкой — не глубже GL.bridge под хордой волокна), у средней над малой — на её верху, толщина наружу,
   верх средней не выше кожи и большой ягодичной. Сдвиг на толщину у всех трёх в кадре сглажен по сетке (Muscles:
   wallOffsets). Объём каждой мышцы — МРТ (сумма линий, volumes.js). */
const GL = {
  cap: .6,                                                       /* верх средней и малой — не ближе 0,6 см к коже */
  smax: 4.5,                                                     /* толщина середины пласта — не больше 4,5 см */
  bridge: .8,                                                    /* низ средней и малой — не глубже 0,8 см под хордой волокна */
  max: {
    O: [[-6.5, 14.6, -5.4], [-5.4, 12.6, -7.2], [-4.3, 10.2, -8.5], [-3.6, 7.0, -8.4], [-2.4, 4.0, -8.3], [-1.0, 1.5, -7.9], [-2.0, -1.5, -5.8], [-3.0, -3.8, -3.5]],
    I: [[-15.4, 1.0, -3.2], [-15.3, -2.5, -3.4], [-15.0, -5.5, -3.2], [-14.4, -8.0, -2.6], [-13.8, -10.0, -2.0]],
    F: [0, .06, .13, .22, .33, .45, .57, .69, .8, .9, 1], lineOf: [0, 0, 1, 1, 1, 2, 2], d: .6,
    prof: [[0, .25], [.08, .6], [.22, 1], [.7, 1], [.88, .65], [1, .3]], w: [.2, .85], lead: .2, room: .9, slope: .6,
  },
  med: {
    O: [[-12.4, 12.0, 2.8], [-12.4, 14.0, .6], [-11.0, 15.8, -1.6], [-9.0, 16.4, -3.4], [-7.0, 15.2, -5.0], [-5.6, 11.0, -6.6]],
    I: [[-14.4, -.2, -.8], [-14.8, -.8, -2.2], [-14.8, -1.2, -3.6]],
    F: [0, .1, .22, .36, .5, .63, .76, .88, 1], lineOf: [0, 0, 1, 1, 2, 2],
    prof: [[0, .12], [.1, .5], [.3, 1], [.8, .8], [1, .3]], w: [.6, 1],
  },
  min: {
    O: [[-12.0, 7.8, 3.6], [-11.2, 9.0, .4], [-9.6, 8.4, -2.4], [-8.2, 6.4, -3.6]],
    I: [[-14.0, .2, .2], [-14.6, -.6, -1.2], [-14.6, -1.0, -2.2]],
    F: [0, .2, .4, .6, .8, 1], lineOf: [0, 1, 2],
    prof: [[0, .15], [.15, .6], [.35, 1], [.8, .8], [1, .3]], w: [.6, 1],
  },
};
/* Кожа у тазобедренного сустава — карты радиуса из центра головки бедра (нейтральная поза): корпус в рамке таза (p; ниже 6 см
   кожа корпуса движется с тазом) и бедро в рамке бедра (f); в кадре — наибольший из двух (объединение форм кожи), как у самой
   кожи манекена. Сетка: азимут atan2(x, z) с шагом HM.daz, наклон asin(y) с шагом HM.del (оси рамки кости); радиус — 0,01 см.
   Луч — от центра головки до первого выхода из формы (знаковое расстояние кожи манекена: Mannequin.torsoSDF без складок,
   limbSDF бедра). */
const HM = { daz: 10, del: 7.5 };
function hipMaps(C) {
  const M = C.M, R = C.R, cache = M.torsoCache(R), m = C.m, out = {}, NA = Math.round(360 / HM.daz), NE = Math.round(180 / HM.del) + 1;
  const torso = q => M.noFolds(() => M.torsoSDF(R, q, cache));
  for (const side of ['R', 'L']) {
    const p = C.index(side === 'R' ? 'pelvis_R' : 'pelvis_L', side), f = C.index('femur', side), c = [m[f * 12 + 3], m[f * 12 + 7], m[f * 12 + 11]];
    const thigh = q => M.limbSDF(R, 'th', side, q);
    const map = (bi, sdf) => {
      const arr = [];
      for (let j = 0; j < NE; j++) for (let i = 0; i < NA; i++) {
        const el = (-90 + j * HM.del) * DEG, az = (-180 + i * HM.daz) * DEG, l = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
        const d = [0, 1, 2].map(r => m[bi * 12 + r * 4] * l[0] + m[bi * 12 + r * 4 + 1] * l[1] + m[bi * 12 + r * 4 + 2] * l[2]);
        let t = .5; while (t < 45 && sdf(add(c, d, t)) < 0) t += .5;
        const r = t >= 45 ? 45 : rayRoot(sdf, c, d, t - .5, t) ?? t;
        arr.push(Math.round(r * 100));
      }
      return arr;
    };
    out[side] = { az0: -Math.PI, daz: HM.daz * DEG, NA, el0: -Math.PI / 2, del: HM.del * DEG, NE, p: map(p, torso), f: map(f, thigh) };
  }
  return out;
}
/* то же, что Muscles (hipMap, hipSkin) — радиус кожи из центра головки по направлению мира d */
function hipSkinAt(C, H, side, d) {
  const look = (arr, bi) => {
    const m = C.m, l = [0, 1, 2].map(cc => m[bi * 12 + cc] * d[0] + m[bi * 12 + 4 + cc] * d[1] + m[bi * 12 + 8 + cc] * d[2]);
    const el = Math.asin(clamp(l[1], -1, 1)), az = Math.atan2(l[0], l[2]);
    let x = (az - H.az0) / H.daz, y = (el - H.el0) / H.del; x = ((x % H.NA) + H.NA) % H.NA; y = clamp(y, 0, H.NE - 1.0001);
    const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, i1 = (i + 1) % H.NA, a = k => arr[k] / 100;
    return (a(j * H.NA + i) * (1 - u) + a(j * H.NA + i1) * u) * (1 - v) + (a((j + 1) * H.NA + i) * (1 - u) + a((j + 1) * H.NA + i1) * u) * v;
  };
  return Math.max(look(H.p, C.index(side === 'R' ? 'pelvis_R' : 'pelvis_L', side)), look(H.f, C.index('femur', side)));
}
/* данные узлов у сустава стороны: кости, центр головки бедра в рамке таза, поворот бедра относительно таза в нейтральной позе */
function hipData(C, side) {
  const p = C.index(side === 'R' ? 'pelvis_R' : 'pelvis_L', side), f = C.index('femur', side), m = C.m, R0 = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R0.push(m[p * 12 + i] * m[f * 12 + j] + m[p * 12 + 4 + i] * m[f * 12 + 4 + j] + m[p * 12 + 8 + i] * m[f * 12 + 8 + j]);
  const c = C.toLocal(p, [m[f * 12 + 3], m[f * 12 + 7], m[f * 12 + 11]]);
  return { c: c.map(v => Math.round(v * 1e4) / 1e4), R0: R0.map(v => Math.round(v * 1e6) / 1e6) };
}
const lerpP = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const glP = (C, q) => [q[0], C.H0 - q[1], q[2]];
/* луч из p по d до поверхности, заданной знаковым расстоянием (корень — делением пополам), t ∈ [t0, t1] */
function rayRoot(f, p, d, t0, t1) {
  let a = t0, b = t1, fa = f(add(p, d, a)), fb = f(add(p, d, b));
  if (fa * fb > 0) return null;
  for (let it = 0; it < 40; it++) { const m = (a + b) / 2, fm = f(add(p, d, m)); if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; } }
  return (a + b) / 2;
}
/* сетка ягодичной: направляющие точки (строка q, столбец c) между линией начала и линией прикрепления */
function glGrid(C, S) {
  const K = S.lineOf.length, cols = 2 * K + 1, O = S.O.map(q => glP(C, q)), I = S.I.map(q => glP(C, q)), out = [];
  for (let q = 0; q < S.F.length; q++) for (let c = 0; c < cols; c++) { const a = c / (cols - 1); out.push({ q, c, f: S.F[q], a, O: polyAt(O, a), I: polyAt(I, a), G: lerpP(polyAt(O, a), polyAt(I, a), S.F[q]) }); }
  return { K, cols, n: S.F.length, nodes: out };
}
const glEdge = (c, cols) => (c === 0 || c === cols - 1 ? .5 : 1);
/* средняя и малая: низ на кости (луч снаружи к центру головки бедра — до наружной поверхности крыла таза или вертела) */
function glDeep(C, S, BT, under, sdf) {
  const g = glGrid(C, S), hip = [C.m[C.index('femur', 'R') * 12 + 3], C.m[C.index('femur', 'R') * 12 + 7], C.m[C.index('femur', 'R') * 12 + 11]];
  for (const x of g.nodes) {
    /* луч снаружи горизонтально к оси таза (наружная поверхность крыла смотрит наружу и назад; луч от центра головки бедра шёл
       бы вдоль тонкого крыла и попадал в крышу вертлужной впадины) */
    const dir = unit([x.G[0], 0, x.G[2] + 1.5]), start = add(x.G, dir, 8);
    let t = Infinity; for (const o of BT) { const tt = rayTris([o], start, dir.map(v => -v)); if (tt < t) t = tt; }
    /* не глубже хорды «начало — прикрепление» больше чем на GL.bridge: волокна натянуты и перекидываются через вогнутость
       (большая седалищная вырезка позади крыла — луч проходил в неё до крестца, и на верху пласта была борозда) */
    x.start = start; x.t = Number.isFinite(t) ? Math.min(t, 8 + GL.bridge) : 8; x.n = dir;
  }
  /* низ — по сглаженной поверхности кости (кость крыла бугристая: иначе бугры кости проступали бы на верху пласта гребнями);
     сглаживание только наружу — не глубже самой кости */
  for (let pass = 0; pass < 3; pass++) {
    const tt = g.nodes.map(x => x.t);
    g.nodes.forEach((x, v) => {
      let s = 0, w = 0; for (const [dq, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = x.q + dq, c = x.c + dc; if (q < 0 || q >= g.n || c < 0 || c >= g.cols) continue; const k = dq || dc ? 1 : 2; s += tt[q * g.cols + c] * k; w += k; }
      x.t = Math.min(tt[v], s / w);
    });
  }
  for (const x of g.nodes) {
    const dir = x.n;
    x.bone = add(x.start, dir, -x.t);
    /* над малой ягодичной — на её верху */
    let lift = 0; if (under) for (const u of under) { const dd = len(sub(u.bone, x.bone)); if (dd < 1.6) lift = Math.max(lift, u.t * (1 - dd / 1.6)); }
    x.base = add(x.bone, dir, lift);
    /* верх — не выше кожи: ограничивает расчёт приложения (hip.cap, карта кожи у сустава) */
    x.room = 8;
    x.rel = profile(S.prof, x.f) * glEdge(x.c, g.cols);
  }
  return g;
}
/* ближайшая точка кожи к точке p внутри тела и нормаль кожи там (наружу): шаги по градиенту знакового расстояния */
function skinNear(sdf, p) {
  const e = .05, grad = q => unit([0, 1, 2].map(k => { const a = q.slice(), b = q.slice(); a[k] += e; b[k] -= e; return sdf(a) - sdf(b); }));
  let q = p.slice();
  for (let it = 0; it < 30; it++) { const s = sdf(q); if (Math.abs(s) < 1e-3) break; q = add(q, grad(q), -s); }
  return { p: q, n: grad(q) };
}
/* большая: верх под кожей над направляющей точкой, у начала — к кости. Направление к коже — нормаль кожи у ближайшей к точке
   точки кожи, сглаженная по сетке (у глубоких точек ближайшая точка кожи перескакивает между ягодицей, складкой и боком —
   соседние узлы расходились бы); верх — по лучу из направляющей точки вдоль этой нормали. Луч из центра головки бедра у краёв
   мышцы шёл почти вдоль кожи и уводил верхний угол к талии (до h 22 см при начале на 12–15), нижний край — на 10–14 см вниз по
   бедру. */
function glMax(C, S, BT, medTop, sdf) {
  const g = glGrid(C, S), N = g.nodes.map(x => skinNear(sdf, x.G).n);
  for (let pass = 0; pass < 6; pass++) {
    const prev = N.map(v => v.slice());
    g.nodes.forEach((x, v) => {
      const s = [0, 0, 0]; for (const [dq, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = x.q + dq, c = x.c + dc; if (q < 0 || q >= g.n || c < 0 || c >= g.cols) continue; const n = prev[q * g.cols + c], k = dq || dc ? 1 : 2; s[0] += n[0] * k; s[1] += n[1] * k; s[2] += n[2] * k; }
      N[v] = unit(s);
    });
  }
  g.nodes.forEach((x, v) => {
    const dir = N[v], s = rayRoot(sdf, x.G, dir, 0, 30), S0 = s == null ? x.G : add(x.G, dir, s - S.d);
    /* у начала верх пласта — у самой кости (начало мясистое, на кости), дальше по волокну — под кожей */
    const w = smooth(x.f / S.lead), O = add(x.O, dir, .3);
    x.top = lerpP(O, S0, w); x.n = dir;
    /* место: до средней ягодичной или кости внутрь по нормали */
    let t = Infinity; for (const o of BT) { const tt = rayTris([o], x.top, dir.map(v => -v)); if (tt < t) t = tt; }
    const tm = rayTris(medTop, x.top, dir.map(v => -v)); if (tm < t) t = tm;
    x.room = Number.isFinite(t) ? Math.max(.3, t) : 6;
    x.rel = profile(S.prof, x.f) * glEdge(x.c, g.cols);
  });
  return g;
}
/* стенка ягодичной из сетки: узлы 5 (в рамке таза), толщина — t0 = rel · масштаб (не толще места), уточняется по объёму */
function glWall(C, key, S, g, names, mus, datum) {
  const p = C.index('pelvis_R', 'R'), f = C.index('femur', 'R'), hc = [C.m[f * 12 + 3], C.m[f * 12 + 7], C.m[f * 12 + 11]], bones = [['pelvis_R', 'R'], ['femur', 'R']], nodes = [];
  for (const x of g.nodes) {
    const P = datum ? x.base : x.top, w = smooth((x.f - S.w[0]) / (S.w[1] - S.w[0]));
    if (datum) nodes.push([5, ...C.toLocal(p, P).map(r3), r3(w), datum, r3(x.rel)]);
    else {
      /* у кожи ягодицы: глубина под кожей по лучу из центра головки бедра — по тем же картам, что в кадре */
      const d = sub(P, hc), r = len(d), dep = hipSkinAt(C, C.hips.R, 'R', d.map(v => v / r)) - r;
      nodes.push([6, ...C.toLocal(p, P).map(r3), r3(w), r3(dep), datum, r3(x.rel)]);
    }
  }
  const W = { key, lines: names.map(nm => nm + '_r'), lineOf: S.lineOf, n: g.n, bones, nodes, strips: gridStrips(g.K, g.n), hip: { pelvis: 0, femur: 1, ...hipData(C, 'R'), ...(datum ? { cap: GL.cap } : {}) }, vol: names.map(nm => mus(nm + '_r').v), g };
  return W;
}
/* толщина: rel · s, не толще места (room) — s по объёму (МРТ) */
function glFill(out, W, shells, C) {
  const target = W.vol.reduce((a, b) => a + b, 0), g = W.g;
  /* толщина узлов: rel · s, не толще места; у большой ягодичной перепад между соседними узлами — не круче GL.max.slope (см на
     см): где место резко меньше (верхний край у гребня), низ пласта иначе ступенькой выворачивался */
  const P = g.nodes.map(x => x.top || x.base), th = new Float64Array(g.nodes.length), slope = W.key === 'glmax' ? GL.max.slope : Infinity;
  const vol = s => {
    g.nodes.forEach((x, v) => { th[v] = Math.min(x.room * (x.cap || 1), x.rel * s); });
    for (let pass = 0; slope < Infinity && pass < 2 * (g.n + g.cols); pass++) {
      let ch = false;
      g.nodes.forEach((x, v) => { for (const [dq, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = x.q + dq, c = x.c + dc; if (q < 0 || q >= g.n || c < 0 || c >= g.cols) continue; const u = q * g.cols + c, lim = th[u] + slope * len(sub(P[u], P[v])); if (th[v] > lim + 1e-6) { th[v] = lim; ch = true; } } });
      if (!ch) break;
    }
    W.nodes.forEach((nd, v) => { nd[nd.length - 1] = r3(th[v]); });
    return thVolume(evaluate(out, [W], shells, C).bound.walls[0]);
  };
  let a = .1, b = GL.smax;
  if (vol(b) < target) { const v = vol(b); return { target, drawn: v, s: b }; }
  for (let it = 0; it < 30; it++) { const m = (a + b) / 2; if (vol(m) < target) a = m; else b = m; }
  return { target, drawn: vol(b), s: b };
}
/* верх стенки в нейтральной позе — треугольники (для места большой ягодичной) */
function wallTopTris(out, W, shells, C) {
  const w = evaluate(out, [W], shells, C).bound.walls[0], tris = [], P = i => { const d = w.datum[i] ? w.TH[i] : 0; return [w.P[i * 3] + w.NR[i * 3] * d, w.P[i * 3 + 1] + w.NR[i * 3 + 1] * d, w.P[i * 3 + 2] + w.NR[i * 3 + 2] * d]; };
  for (let k = 0; k < w.K; k++) for (let q = 0; q + 1 < w.n; q++) { const r0 = (k * w.n + q) * 3, r1 = r0 + 3; for (const [a, b] of [[0, 1], [1, 2]]) { const A = P(w.rows[r0 + a]), B = P(w.rows[r0 + b]), Cc = P(w.rows[r1 + b]), D = P(w.rows[r1 + a]); tris.push([A, B, Cc], [A, Cc, D]); } }
  return tris;
}
function glutes(out, C, mus, shells, info) {
  const G = require('./geometry.js'), sdf0 = C.M.noFolds(() => G.skinSDF(C.R)), sdf = q => C.M.noFolds(() => sdf0(q));
  const BT = []; for (const nm of ['pelvis_R|R', 'sacrum|', 'femur|R']) { const { b, w } = C.boneWorld(nm); for (let f = 0; f < b.idx.length; f += 3) BT.push([w[b.idx[f]], w[b.idx[f + 1]], w[b.idx[f + 2]]]); }
  /* малая → средняя (над малой) → большая (над средней) */
  const gMin = glDeep(C, GL.min, BT, null, sdf), mn = glWall(C, 'glmin', GL.min, gMin, ['glmin1', 'glmin2', 'glmin3'], mus, 1); mn.side = 'R';
  info.glmin = glFill(out, mn, shells, C);
  const minTop = gMin.nodes.map((x, v) => ({ bone: x.bone, t: mn.nodes[v][mn.nodes[v].length - 1] }));
  const gMed = glDeep(C, GL.med, BT, minTop, sdf), md = glWall(C, 'glmed', GL.med, gMed, ['glmed1', 'glmed2', 'glmed3'], mus, 1); md.side = 'R';
  info.glmed = glFill(out, md, shells, C);
  const gMax = glMax(C, GL.max, BT, wallTopTris(out, md, shells, C), sdf), mx = glWall(C, 'glmax', GL.max, gMax, ['glmax1', 'glmax2', 'glmax3'], mus, 0); mx.side = 'R';
  gMax.nodes.forEach(x => { x.cap = GL.max.room; });
  info.glmax = glFill(out, mx, shells, C);
  return [mx, md, mn];
}

/* ---------- верх столбов выпрямителя: карта для пола лент спины (этап В; Muscles.floorNeed) ----------
   В рамке грудной клетки нейтральной позы, правая сторона: сетка x (BTM.x0 … с шагом dx) × высота h над тазобедренными (h = y +
   24, как в приложении); значение — z верха столбов (наибольшая задняя точка верха всех четырёх столбов над узлом сетки), 0,01 см;
   −32768 — столбов нет. Трапециевидная, ромбовидные и широчайшая лежат поверх столбов — их верх не глубже этой поверхности. */
const BTM = { x0: -12, dx: .5, NX: 26, h0: 0, dh: 1, NH: 61 };
function backTopMap(out, cols, shells, C) {
  const { bound } = evaluate(out, cols, shells, C), Z = new Float64Array(BTM.NX * BTM.NH).fill(Infinity);
  for (const w of bound.walls) {
    const C2 = 2 * w.K + 1; if (w.N !== w.n * C2) continue;
    const L = v => { const p = C.toLocal(C.rib, [w.P[v * 3], w.P[v * 3 + 1], w.P[v * 3 + 2]]); return [p[0], p[1] + 24, p[2]]; };
    const Q = Array.from({ length: w.N }, (_, v) => L(v));
    for (let q = 0; q + 1 < w.n; q++) for (let c = 0; c + 1 < C2; c++) {
      const a = Q[q * C2 + c], b = Q[q * C2 + c + 1], d = Q[(q + 1) * C2 + c], e = Q[(q + 1) * C2 + c + 1];
      for (const [A, B, D] of [[a, b, e], [a, e, d]]) {
        const x0 = Math.min(A[0], B[0], D[0]), x1 = Math.max(A[0], B[0], D[0]), h0 = Math.min(A[1], B[1], D[1]), h1 = Math.max(A[1], B[1], D[1]);
        const det = (B[0] - A[0]) * (D[1] - A[1]) - (D[0] - A[0]) * (B[1] - A[1]); if (Math.abs(det) < 1e-9) continue;
        for (let j = Math.max(0, Math.ceil((h0 - BTM.h0) / BTM.dh)); j < BTM.NH && BTM.h0 + j * BTM.dh <= h1; j++) for (let i = Math.max(0, Math.ceil((x0 - BTM.x0) / BTM.dx)); i < BTM.NX && BTM.x0 + i * BTM.dx <= x1; i++) {
          const x = BTM.x0 + i * BTM.dx, h = BTM.h0 + j * BTM.dh;
          const u = ((x - A[0]) * (D[1] - A[1]) - (D[0] - A[0]) * (h - A[1])) / det, v = ((B[0] - A[0]) * (h - A[1]) - (x - A[0]) * (B[1] - A[1])) / det;
          if (u < -1e-6 || v < -1e-6 || u + v > 1 + 1e-6) continue;
          const z = A[2] + (B[2] - A[2]) * u + (D[2] - A[2]) * v; if (z < Z[j * BTM.NX + i]) Z[j * BTM.NX + i] = z;
        }
      }
    }
  }
  /* к середине — до остистых отростков (x = 0,5 см за середину): верх у медиального края столбов (вершины остистых отростков —
     под кожей, на них — апоневроз широчайшей и сухожилие трапециевидной) */
  for (let j = 0; j < BTM.NH; j++) {
    let last = Infinity; for (let i = 0; i < BTM.NX; i++) { const v = Z[j * BTM.NX + i]; if (Number.isFinite(v)) last = v; else if (Number.isFinite(last) && BTM.x0 + i * BTM.dx > -1) Z[j * BTM.NX + i] = last; }
  }
  return { ...BTM, z: Array.from(Z, z => (Number.isFinite(z) ? Math.round(z * 100) : -32768)) };
}

/* ---------- лопатка: карта задней поверхности (пол лент спины, этап В; Muscles.floorNeed) ----------
   В рамке лопатки: плоскость пластинки — две главные оси её вершин (u, v), w — наименьшая, наружу (назад); на сетке 1 см по
   (u, v) — наибольшая высота поверхности кости над плоскостью (ость и акромион — выше), 0,01 см; −99999 — вне лопатки. */
function scapMaps(C) {
  const out = {};
  for (const side of ['R', 'L']) {
    const i = C.index('scapula', side), b = C.skel.bones[i], P = []; for (let k = 0; k < b.pos.length; k += 3) P.push([b.pos[k], b.pos[k + 1], b.pos[k + 2]]);
    const o = [0, 1, 2].map(c => P.reduce((sum, p) => sum + p[c], 0) / P.length), Cv = [0, 1, 2].map(() => [0, 0, 0]);
    for (const p of P) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) Cv[a][c] += (p[a] - o[a]) * (p[c] - o[c]);
    /* наименьшая ось — обратной итерацией по сдвинутой матрице (наибольшая у Cmax·I − C) */
    const tr = Cv[0][0] + Cv[1][1] + Cv[2][2], A = Cv.map((r, a) => r.map((x, c) => (a === c ? tr : 0) - x));
    let w = [0, 0, 1]; for (let it = 0; it < 200; it++) w = unit([0, 1, 2].map(a => A[a][0] * w[0] + A[a][1] * w[1] + A[a][2] * w[2]));
    /* наружу — назад в нейтральной позе (каталог: −z) */
    const ww = [0, 1, 2].map(r => C.m[i * 12 + r * 4] * w[0] + C.m[i * 12 + r * 4 + 1] * w[1] + C.m[i * 12 + r * 4 + 2] * w[2]); if (ww[2] > 0) w = w.map(x => -x);
    let u = unit(sub([0, 1, 0], w.map(x => x * w[1]))); const v = cross(w, u);
    const pts = [];
    for (let f = 0; f < b.idx.length; f += 3) {
      const a = P[b.idx[f]], c = P[b.idx[f + 1]], d = P[b.idx[f + 2]], L = Math.max(len(sub(a, c)), len(sub(a, d)), len(sub(c, d))), nn = Math.max(1, Math.ceil(L / .25));
      for (let x = 0; x <= nn; x++) for (let y = 0; x + y <= nn; y++) { const z = nn - x - y, q = [0, 1, 2].map(k => (a[k] * x + c[k] * y + d[k] * z) / nn), r = sub(q, o); pts.push([dot(r, u), dot(r, v), dot(r, w)]); }
    }
    const du = 1, u0 = Math.floor(Math.min(...pts.map(p => p[0]))) - 1, v0 = Math.floor(Math.min(...pts.map(p => p[1]))) - 1;
    const NU = Math.ceil(Math.max(...pts.map(p => p[0])) - u0) + 2, NV = Math.ceil(Math.max(...pts.map(p => p[1])) - v0) + 2, h = new Array(NU * NV).fill(-Infinity);
    /* узел сетки — наибольшая высота точек кости в квадрате 1 × 1 см вокруг него */
    for (const p of pts) { const ci = Math.round((p[0] - u0) / du), cj = Math.round((p[1] - v0) / du); if (ci >= 0 && cj >= 0 && ci < NU && cj < NV) h[cj * NU + ci] = Math.max(h[cj * NU + ci], p[2]); }
    out[side] = { o: o.map(r3), u: u.map(x => r3(x * 1e3) / 1e3), v: v.map(x => r3(x * 1e3) / 1e3), w: w.map(x => r3(x * 1e3) / 1e3), u0, v0, du, NU, NV, h: h.map(x => (Number.isFinite(x) ? Math.round(x * 100) : -99999)) };
  }
  return out;
}

/* ---------- зеркало: левая сторона из правой ---------- */
function mirrorWall(W, C) {
  const bones = W.bones.map(([n, s]) => [n.replace(/_R$/, '_L'), s === 'R' ? 'L' : s]);
  const nodes = W.nodes.map(nd => {
    const o = nd.slice();
    if (o[0] === 0) o[3] = -o[3];
    else if (o[0] === 1) o[2] = -o[2];
    else if (o[0] === 2 || o[0] === 4) { o[3] = -o[3]; o[6] = -o[6]; }
    else if (o[0] === 3) o[4] = -o[4];
    else if (o[0] === 5 || o[0] === 6) o[1] = -o[1];
    return o.map(v => (Object.is(v, -0) ? 0 : v));
  });
  const L = { ...W, side: 'L', lines: W.lines.map(n => n.replace(/_r$/, '_l')), bones, nodes };
  /* у сустава — свои кости и поворот бедра левой стороны (рамки таза общие, у бедра — своя) */
  if (W.hip) L.hip = { ...W.hip, ...hipData(C, 'L') };
  return L;
}

/* ---------- расчёт стенок кодом приложения (нейтральная поза) ---------- */
function evaluate(out, walls, shells, C) {
  for (const W of walls) { W.flip = W.flip || 1; W.rev = W.rev || W.strips.map(() => 0); W.a0 = W.a0 || W.strips.map(() => new Array(W.n).fill(0)); }
  const md = { ...out, walls: walls.map(pick), shells, hips: C.hips }, bound = C.Muscles.bind(md, C.skel), start = C.Muscles.ringStarts(bound);
  const pos = new Float64Array(start[bound.length] * C.Muscles.SIDES * 3);
  for (const wall of bound.walls) {
    C.Muscles.wallSurface(wall, C.m, pos, null, start);
    /* нормаль — наружу от оси корпуса (по большинству четырёхугольников): знак обхода зависит от порядка столбцов (у левой
       стороны — зеркало — обратный). Считается по самим четырёхугольникам, а не по нормалям узлов: те приложение доворачивает
       к направлению «наружу» (Muscles.wallSurface) — по ним неверный знак был бы не виден */
    const { P, rows } = wall; let vote = 0;
    for (let k = 0; k < wall.K; k++) for (let q = 0; q + 1 < wall.n; q++) for (const [e0, e1] of [[0, 1], [1, 2]]) {
      const a = rows[(k * wall.n + q) * 3 + e0], b = rows[(k * wall.n + q) * 3 + e1], c = rows[(k * wall.n + q + 1) * 3 + e1], d = rows[(k * wall.n + q + 1) * 3 + e0];
      const u = [P[c * 3] - P[a * 3], P[c * 3 + 1] - P[a * 3 + 1], P[c * 3 + 2] - P[a * 3 + 2]], w = [P[d * 3] - P[b * 3], P[d * 3 + 1] - P[b * 3 + 1], P[d * 3 + 2] - P[b * 3 + 2]], nq = cross(u, w);
      vote += wall.flip * (nq[0] * (P[a * 3] + P[c * 3]) + nq[2] * (P[a * 3 + 2] + P[c * 3 + 2]));
    }
    if (vote < 0) { wall.flip = -wall.flip; walls.find(x => x.key === wall.key && x.side === wall.side).flip = wall.flip; C.Muscles.wallSurface(wall, C.m, pos, null, start); }
  }
  return { bound, start, pos };
}
const pick = W => { const o = { key: W.key, side: W.side, lines: W.lines, n: W.n, bones: W.bones, nodes: W.nodes, strips: W.strips, flip: W.flip, rev: W.rev, a0: W.a0 }; for (const k of ['lineOf', 'hip', 'noRib']) if (W[k] && (!Array.isArray(W[k]) || W[k].length)) o[k] = W[k]; return o; };
/* Объём полос: Σ по четырёхугольникам опорной поверхности (площадь × средняя толщина углов). Толщины узлов (кроме fixed —
   апоневроз) масштабируются одним множителем так, что объём мышцы — сумма объёмов её линий (МРТ, volumes.js): толщина
   ровная по всему пласту (доли объёма между линиями модели — оценки по силе × длине, а не замеры; по полосам рисунка
   они дали бы ступеньки толщины на швах). */
function stripVolumes(wall) {
  const { K, n, P, rows, t0 } = wall, out = new Float64Array(K);
  const area = (a, b, c, d) => { const ax = P[c * 3] - P[a * 3], ay = P[c * 3 + 1] - P[a * 3 + 1], az = P[c * 3 + 2] - P[a * 3 + 2], bx = P[d * 3] - P[b * 3], by = P[d * 3 + 1] - P[b * 3 + 1], bz = P[d * 3 + 2] - P[b * 3 + 2]; return .5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx); };
  for (let k = 0; k < K; k++) for (let q = 0; q + 1 < n; q++) {
    const r0 = (k * n + q) * 3, r1 = r0 + 3;
    for (const [a, b] of [[0, 1], [1, 2]]) { const i = [rows[r0 + a], rows[r0 + b], rows[r1 + b], rows[r1 + a]]; out[k] += area(...i) * i.reduce((s, v) => s + t0[v], 0) / 4; }
  }
  return out;
}
function normalize(out, W, shells, C) {
  const target = W.vol.reduce((a, b) => a + b, 0);
  for (let it = 0; it < 4; it++) {
    const { bound } = evaluate(out, [W], shells, C), vol = stripVolumes(bound.walls[0]).reduce((a, b) => a + b, 0), s = target / vol;
    W.nodes.forEach((nd, v) => { if (W.fixed && W.fixed[v]) return; nd[nd.length - 1] = r3(nd[nd.length - 1] * s); });
  }
  const { bound } = evaluate(out, [W], shells, C);
  return { target, drawn: stripVolumes(bound.walls[0]).reduce((a, b) => a + b, 0) };
}

/* ---------- сборка ---------- */
function build(out, deps) {
  const { M, Skeleton, Muscles, skel } = deps;
  const C = context(M, Skeleton, Muscles, skel), skin = skinChart(C), SH = { R: ribShell(C, 'R'), L: ribShell(C, 'L') };
  const K = { skin, LM: landmarks(C, SH.R, skin) };
  const mus = name => { const mu = out.muscles.find(x => x.name === name); if (!mu) throw Error('walls: нет мышцы ' + name); return mu; };
  const shells = {};
  for (const s of ['R', 'L']) { const c = SH[s].coarse; shells[s] = { th0: c.th0, dth: c.dth, y0: c.y0, dy: c.dy, NT: c.NT, NY: c.NY, zc: r3(c.zc), r: Array.from(c.r, v => (v < 0 ? -1 : Math.round(v * 100))) }; }
  const S = SH.R, T = teeth(S), info = {};
  S.other = SH.L;
  K.rt = { ...shells.R, r: Float64Array.from(shells.R.r, v => (v < 0 ? -1 : v / 100)) };
  K.lt = { ...shells.L, r: Float64Array.from(shells.L.r, v => (v < 0 ? -1 : v / 100)) };
  const ra = rectus(C, K, S, mus('rect_abd_r'));
  const sa = serratus(C, K, S, T, mus); sa.side = 'R'; info.serrant = normalize(out, sa, shells, C);
  const pm = pecMinor(C, K, S, T, mus); pm.side = 'R'; info.pecmin = normalize(out, pm, shells, C);
  /* наружная косая: номинальная толщина мышечной части — по объёму; два прохода (глубина над рёбрами зависит от толщины) */
  const eoRaw = obliqueExt(C, K, S, T, mus);
  let eo = obliqueExtNodes(C, K, S, eoRaw, .6); eo.side = 'R'; normalize(out, eo, shells, C);
  const muscleT = eo.nodes.filter((nd, v) => !eo.fixed[v] && eoRaw.raw[v].rel === 1).map(nd => nd[nd.length - 1]);
  const tEO = muscleT.reduce((a, b) => a + b, 0) / muscleT.length;
  eo = obliqueExtNodes(C, K, S, eoRaw, tEO); eo.side = 'R'; info.eo = normalize(out, eo, shells, C);
  /* внутренняя косая — под нижней поверхностью наружной косой */
  const ev = evaluate(out, [eo], shells, C).bound.walls[0], tris = [];
  { const P = i => [ev.P[i * 3] - ev.NR[i * 3] * ev.TH[i], ev.P[i * 3 + 1] - ev.NR[i * 3 + 1] * ev.TH[i], ev.P[i * 3 + 2] - ev.NR[i * 3 + 2] * ev.TH[i]];
    for (let k = 0; k < ev.K; k++) for (let q = 0; q + 1 < ev.n; q++) { const r0 = (k * ev.n + q) * 3, r1 = r0 + 3; for (const [a, b] of [[0, 1], [1, 2]]) { const A = P(ev.rows[r0 + a]), B = P(ev.rows[r0 + b]), Cc = P(ev.rows[r1 + b]), D = P(ev.rows[r1 + a]); tris.push([A, B, Cc], [A, Cc, D]); } } }
  /* два прохода, как у наружной косой: толщина над рёбрами — по месту между пластом и рёбрами при толщине первого прохода */
  let io = obliqueInt(C, K, S, T, mus, tris); io.side = 'R'; normalize(out, io, shells, C);
  const tIO = io.nodes.reduce((a, nd, v) => a + nd[nd.length - 1] / io.rels[v], 0) / io.nodes.length;
  io = obliqueInt(C, K, S, T, mus, tris, tIO); io.side = 'R'; info.io = normalize(out, io, shells, C);
  ra.side = 'R';
  /* спина (этап В): столбы выпрямителя, многораздельные, квадратная поясницы */
  K.bound = C.Muscles.bind({ ...out, walls: [] }, C.skel); K.at = new Map(K.bound.map((b, i) => [b.name, i]));
  const BT = backTris(C), back = [];
  C.hips = hipMaps(C);
  for (const name of ['mf', 'sp', 'lt', 'il']) { const W = backColumn(C, K, BT, name, mus); W.side = 'R'; info[W.key] = fillColumn(out, W, shells, C); back.push(W); }
  const backTop = backTopMap(out, back.slice(), shells, C);
  const ql = quadratus(C, K, mus); ql.side = 'R'; info.ql = normalize(out, ql, shells, C); back.push(ql);
  back.push(...glutes(out, C, mus, shells, info));
  const right = [ra, eo, io, sa, pm, ...back], walls = [];
  for (const W of right) { const R0 = { ...pick(W), side: 'R' }; walls.push(R0, pick(mirrorWall(R0, C))); }
  finalize(out, walls, shells, C);
  return { walls, shells, hips: C.hips, scap: scapMaps(C), backTop, info: { ...info, ra: ra.info, tEO } };
}
/* Нормаль наружу (flip), обход колец как у трубок (rev) и площади строк в нейтральной позе (a0) — тем же расчётом, что в
   приложении (Muscles.wallSurface) */
function finalize(out, walls, shells, C) {
  for (const W of walls) { W.flip = 1; W.rev = W.strips.map(() => 0); W.a0 = W.strips.map(() => new Array(W.n).fill(0)); }
  const { bound } = evaluate(out, walls, shells, C);   /* evaluate выставляет и знак нормали (flip) */
  for (const wall of bound.walls) {
    const W = walls.find(x => x.key === wall.key && x.side === wall.side);
    W.a0 = W.strips.map((_, k) => Array.from(wall.AR.subarray(k * wall.n, (k + 1) * wall.n), v => r2(v)));
    /* обход: вершина 1 (правый край) — со стороны w = N × t (t — к следующей строке; у полосы, чьи кольца идут обратно, — наоборот) */
    const Pt = i => [wall.P[i * 3], wall.P[i * 3 + 1], wall.P[i * 3 + 2]];
    W.rev = W.strips.map((_, k) => {
      let s = 0;
      for (let q = 0; q < wall.n; q++) {
        const r = (k * wall.n + q) * 3, Cn = wall.rows[r + 1], Rn = wall.rows[r + 2], q1 = Math.min(wall.n - 1, q + 1), q0 = Math.max(0, q - 1);
        const Nn = [wall.NR[Cn * 3], wall.NR[Cn * 3 + 1], wall.NR[Cn * 3 + 2]], t = sub(Pt(wall.rows[(k * wall.n + q1) * 3 + 1]), Pt(wall.rows[(k * wall.n + q0) * 3 + 1]));
        s += dot(cross(Nn, t), sub(Pt(Rn), Pt(Cn)));
      }
      return (s < 0 ? 1 : 0) ^ wall.dir[k];
    });
  }
}
module.exports = { build, scapMaps, hipMaps, BK, GL, QLW, ribShell, skinChart, context, shellFine, chartOf, fromChart, ribGap, ribAt, teeth, RA, EO, IO, SA, PM, TEETH };
