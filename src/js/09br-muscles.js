/* ===================== МЫШЦЫ: ПУТИ =====================
   Путь мышцы — ломаная по точкам начала, промежуточным точкам и прикреплению, которая огибает кости: сферы и цилиндры
   модели MyoSim. Расчёт огибания повторяет MuJoCo (engine_util_misc.c: mju_wrap, wrap_circle, wrap_inside;
   engine_core_smooth.c: mj_tendon) — длины совпадают с MuJoCo в эталонных позах (tools/muscles.test.js,
   tools/muscles/mujoco_ref.py). Здесь же — точки для рисования: дуги огибания разбиты на отрезки.

   Элемент пути: {s:[x,y,z]} — точка; {w:{t:'o'|'c', c:[x,y,z], m:[9 по строкам], r, side:[x,y,z]|null}} — сфера (o)
   или цилиндр (c) с осью — третьим столбцом матрицы, как у геометрии MuJoCo; {w:{t:'e', c, B:[9], Bi:[9], side}} —
   эллипсоид {c + B·u : |u| = 1} (передняя зубчатая у DAS3). Эллипсоид огибается как единичная сфера в своих
   координатах u = B⁻¹(x − c): решение «огибать или нет» от этого не меняется (прямая остаётся прямой), а дуга после
   обратного переноса — плоская кривая на эллипсоиде через его центр, близкая к кратчайшей (у OpenSim — «гибридный»
   метод с той же проверкой пересечения). Единицы — любые, но одни для всех. */
const Muscles = (() => {
  const MINVAL = 1e-15;
  const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  /* как mju_normalize: длина вектора; слишком короткий — единичный вдоль первой оси */
  function normalize(v) {
    const n = Math.hypot(...v);
    if (n < MINVAL) { v.fill(0); v[0] = 1; return n; }
    for (let i = 0; i < v.length; i++) v[i] /= n;
    return n;
  }
  const mulT = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
  const mul = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];

  /* пересекаются ли отрезки p1–p2 и p3–p4 на плоскости */
  function isIntersect(p1, p2, p3, p4) {
    const u = [p2[0] - p1[0], p2[1] - p1[1]], v = [p4[0] - p3[0], p4[1] - p3[1]];
    const det = v[1] * u[0] - v[0] * u[1];
    if (Math.abs(det) < MINVAL) return false;
    const s = det > 0 ? 1 : -1, w = [p1[0] - p3[0], p1[1] - p3[1]], d = [p2[0] - p4[0], p2[1] - p4[1]];
    const a0 = (v[0] * w[1] - v[1] * w[0]) * s, a1 = (v[0] * d[1] - v[1] * d[0]) * s;
    const b0 = (u[0] * w[1] - u[1] * w[0]) * s, b1 = (u[0] * d[1] - u[1] * d[0]) * s;
    return a0 >= 0 && a1 <= 0 && b0 >= 0 && b1 <= 0;
  }
  function lengthCircle(p0, p1, ind, r) {
    const cross = p0[1] * p1[0] - p0[0] * p1[1];
    let angle = Math.atan2(Math.abs(cross), dot2(p0, p1));
    if ((cross > 0 && ind) || (cross < 0 && !ind)) angle = 2 * Math.PI - angle;
    return r * angle;
  }
  /* огибание окружности на плоскости: концы end[4], боковая точка side[2] или null → {len, pnt[4]} или null */
  function wrapCircle(end, side, r) {
    const sq0 = end[0] * end[0] + end[1] * end[1], sq1 = end[2] * end[2] + end[3] * end[3], sqr = r * r;
    if (sq0 < sqr || sq1 < sqr || r < MINVAL) return null;
    const dif = [end[2] - end[0], end[3] - end[1]], dd = dot2(dif, dif);
    if (dd < MINVAL) return null;
    let a = -(dif[0] * end[0] + dif[1] * end[1]) / dd; a = a < 0 ? 0 : a > 1 ? 1 : a;
    const tmp = [a * dif[0] + end[0], a * dif[1] + end[1]];
    if (dot2(tmp, tmp) > sqr && (!side || dot2(side, tmp) >= 0)) return null;
    const s0 = Math.sqrt(sq0 - sqr), s1 = Math.sqrt(sq1 - sqr), sol = [], good = [];
    for (let i = 0; i < 2; i++) {
      const g = i === 0 ? 1 : -1;
      const p = [(end[0] * sqr + g * r * end[1] * s0) / sq0, (end[1] * sqr - g * r * end[0] * s0) / sq0];
      const q = [(end[2] * sqr - g * r * end[3] * s1) / sq1, (end[3] * sqr + g * r * end[2] * s1) / sq1];
      sol.push([p, q]);
      if (side) { const t = [p[0] + q[0], p[1] + q[1]]; normalize(t); good.push(dot2(t, side)); }
      else { const t = [p[0] - q[0], p[1] - q[1]]; good.push(-dot2(t, t)); }
      if (isIntersect(end, p, end.slice(2), q)) good[i] = -10000;
    }
    const i = good[0] > good[1] ? 0 : 1, [p, q] = sol[i];
    if (isIntersect(end, p, end.slice(2), q)) return null;
    return { len: lengthCircle(p, q, i, r), pnt: [p[0], p[1], q[0], q[1]] };
  }
  /* огибание изнутри (боковая точка внутри окружности): одна точка касания, длина дуги 0 */
  function wrapInside(end, r) {
    const len0 = Math.hypot(end[0], end[1]), len1 = Math.hypot(end[2], end[3]);
    const dif = [end[2] - end[0], end[3] - end[1]], dd = dot2(dif, dif);
    if (len0 <= r || len1 <= r || r < MINVAL || len0 < MINVAL || len1 < MINVAL) return null;
    if (dd > MINVAL) {
      const a = -(dif[0] * end[0] + dif[1] * end[1]) / dd;
      if (a > 0 && a < 1 && Math.hypot(end[0] + a * dif[0], end[1] + a * dif[1]) <= r) return null;
    }
    const pnt = [.5 * (end[0] + end[2]), .5 * (end[1] + end[3])]; normalize(pnt); pnt[0] *= r; pnt[1] *= r; pnt.push(pnt[0], pnt[1]);
    const A = r / len0, B = r / len1, cosG = (len0 * len0 + len1 * len1 - dd) / (2 * len0 * len1);
    if (cosG < -1 + MINVAL) return null;
    if (cosG > 1 - MINVAL) return { len: 0, pnt };
    const G = Math.acos(cosG);
    let phi = Math.PI / 2, z = Math.sin(phi), f = Math.asin(A * z) + Math.asin(B * z) - 2 * phi + G;
    if (f > 0) return { len: 0, pnt };
    let iter = 0;
    for (; iter < 20 && Math.abs(f) > 1e-6; iter++) {
      const df = Math.cos(phi) * (A / Math.max(MINVAL, Math.sqrt(1 - z * z * A * A)) + B / Math.max(MINVAL, Math.sqrt(1 - z * z * B * B))) - 2;
      if (df > -MINVAL) return { len: 0, pnt };
      const phi1 = phi - f / df;
      if (phi1 > phi) return { len: 0, pnt };
      phi = phi1; z = Math.sin(phi); f = Math.asin(A * z) + Math.asin(B * z) - 2 * phi + G;
      if (f > 1e-6) return { len: 0, pnt };
    }
    if (iter >= 20) return { len: 0, pnt };
    let vec, ang;
    if (end[0] * end[3] - end[1] * end[2] > 0) { vec = [end[0], end[1]]; ang = phi - Math.asin(A * z); }
    else { vec = [end[2], end[3]]; ang = phi - Math.asin(B * z); }
    normalize(vec);
    const x = r * (Math.cos(ang) * vec[0] - Math.sin(ang) * vec[1]), y = r * (Math.sin(ang) * vec[0] + Math.cos(ang) * vec[1]);
    return { len: 0, pnt: [x, y, x, y] };
  }
  /* огибание эллипсоида: единичная сфера в координатах u = B⁻¹(x − c); длина — по ломаной из ELL_N отрезков дуги */
  const UNIT = { t: 'o', c: [0, 0, 0], m: [1, 0, 0, 0, 1, 0, 0, 0, 1], r: 1, side: null }, ELL_N = 32;
  function wrapEllipsoid(x0, x1, w) {
    const toU = x => mul(w.Bi, sub3(x, w.c)), back = u => { const v = mul(w.B, u); return [v[0] + w.c[0], v[1] + w.c[1], v[2] + w.c[2]]; };
    const s = wrap(toU(x0), toU(x1), w.side ? { ...UNIT, side: toU(w.side) } : UNIT);
    if (!s) return null;
    const a = back(s.a), b = back(s.b), pts = [a, ...s.arc(ELL_N).map(back), b];
    let len = 0; for (let i = 1; i < pts.length; i++) len += dist3(pts[i - 1], pts[i]);
    return { len, a, b, arc: n => s.arc(n).map(back) };
  }
  /* огибание сферы, цилиндра или эллипсоида между точками x0 и x1 → {len, a, b, arc(n)} или null (путь идёт прямо) */
  function wrap(x0, x1, w) {
    if (w.t === 'e') return wrapEllipsoid(x0, x1, w);
    const p = [mulT(w.m, sub3(x0, w.c)), mulT(w.m, sub3(x1, w.c))], r = w.r, cyl = w.t === 'c';
    if (Math.hypot(...p[0]) < MINVAL || Math.hypot(...p[1]) < MINVAL) return null;
    let ax0, ax1;
    if (!cyl) {
      ax0 = [...p[0]]; normalize(ax0);
      let normal = cross3(p[0], p[1]);
      if (normalize(normal) < MINVAL) {
        let i = 0;
        if (Math.abs(ax0[1]) > Math.abs(ax0[0]) && Math.abs(ax0[1]) > Math.abs(ax0[2])) i = 1;
        if (Math.abs(ax0[2]) > Math.abs(ax0[0]) && Math.abs(ax0[2]) > Math.abs(ax0[1])) i = 2;
        const a1 = [1, 1, 1]; a1[i] = 0; normal = cross3(ax0, a1); normalize(normal);
      }
      ax1 = cross3(normal, ax0); normalize(ax1);
    } else { ax0 = [1, 0, 0]; ax1 = [0, 1, 0]; }
    const d = [dot3(p[0], ax0), dot3(p[0], ax1), dot3(p[1], ax0), dot3(p[1], ax1)];
    let s = null, sd = null;
    if (w.side) { s = mulT(w.m, sub3(w.side, w.c)); sd = [dot3(s, ax0), dot3(s, ax1)]; normalize(sd); sd[0] *= r; sd[1] *= r; }
    const res = s && Math.hypot(...s) < r ? wrapInside(d, r) : wrapCircle(d, sd, r);
    if (!res) return null;
    let len = res.len;
    const loc = i => [ax0[0] * res.pnt[2 * i] + ax1[0] * res.pnt[2 * i + 1], ax0[1] * res.pnt[2 * i] + ax1[1] * res.pnt[2 * i + 1], ax0[2] * res.pnt[2 * i] + ax1[2] * res.pnt[2 * i + 1]];
    const A = loc(0), B = loc(1);
    if (cyl) {
      const L0 = Math.hypot(p[0][0] - A[0], p[0][1] - A[1]), L1 = Math.hypot(p[1][0] - B[0], p[1][1] - B[1]);
      A[2] = p[0][2] + (p[1][2] - p[0][2]) * L0 / (L0 + len + L1);
      B[2] = p[0][2] + (p[1][2] - p[0][2]) * (L0 + len) / (L0 + len + L1);
      len = Math.sqrt(len * len + (B[2] - A[2]) ** 2);
    }
    const world = q => { const v = mul(w.m, q); return [v[0] + w.c[0], v[1] + w.c[1], v[2] + w.c[2]]; };
    /* дуга от A к B по поверхности: угол — по длине дуги (направление выбирает расчёт огибания), у цилиндра — винт */
    const arc = n => {
      const a0 = [res.pnt[0], res.pnt[1]], a1 = [res.pnt[2], res.pnt[3]], theta = res.len / r;
      if (theta < 1e-9 || n < 1) return [];
      const ccw = (Math.atan2(a0[0] * a1[1] - a0[1] * a1[0], dot2(a0, a1)) + 2 * Math.PI) % (2 * Math.PI);
      const dir = Math.abs(ccw - theta) <= Math.abs(2 * Math.PI - ccw - theta) ? 1 : -1, start = Math.atan2(a0[1], a0[0]), out = [];
      for (let k = 1; k < n; k++) {
        const u = k / n, ang = start + dir * theta * u, c2 = [r * Math.cos(ang), r * Math.sin(ang)];
        const q = [ax0[0] * c2[0] + ax1[0] * c2[1], ax0[1] * c2[0] + ax1[1] * c2[1], ax0[2] * c2[0] + ax1[2] * c2[1]];
        if (cyl) q[2] = A[2] + (B[2] - A[2]) * u;
        out.push(world(q));
      }
      return out;
    };
    return { len, a: world(A), b: world(B), arc };
  }
  /* путь целиком: длина (как ten_length MuJoCo) и точки для рисования (дуги — отрезками не длиннее step) */
  function path(el, step = Infinity) {
    let L = 0, j = 0;
    const pts = [];
    while (j < el.length - 1) {
      const a = el[j].s, b = el[j + 1];
      if (b.w) {
        const c = el[j + 2].s, w = wrap(a, c, b.w);
        pts.push(a);
        if (w) {
          L += dist3(a, w.a) + w.len + dist3(w.b, c);
          pts.push(w.a, ...w.arc(Number.isFinite(step) ? Math.ceil(w.len / step) : 0), w.b);
        } else L += dist3(a, c);
        j += 2;
      } else { L += dist3(a, b.s); pts.push(a); j += 1; }
    }
    pts.push(el[el.length - 1].s);
    return { length: L, points: pts };
  }
  /* ---------- мышцы на скелете ----------
     Данные (tools/muscles/build_muscles.py): точки и огибающие тела — в рамках костей скелета, теми же
     преобразованиями, что сами кости. bind() находит кости в данных скелета; place() ставит путь в позу по матрицам
     костей кадра (Skeleton.frames); layout() — все мышцы кадра. */
  function bind(md, skel) {
    const idx = new Map(skel.bones.map((b, i) => [b.name + '|' + b.side, i]));
    const bone = k => { const i = idx.get(k[0] + '|' + k[1]); if (i === undefined) throw Error('muscles: no bone ' + k.join(' ')); return i; };
    const pt = s => ({ i: bone(s.bone), p: s.p });
    const bound = md.muscles.map(mu => ({
      name: mu.name, side: mu.side, group: mu.group, part: mu.part, v: mu.v, t0: mu.t0, t1: mu.t1, l0: mu.l0, sk: mu.sk, x0: mu.x0,
      el: mu.el.map(e => e.s ? { s: pt(e.s) } : { w: { t: e.w.t, i: bone(e.w.bone), c: e.w.c, a: e.w.a, r: e.w.r, B: e.w.B, side: e.w.side ? pt(e.w.side) : null } }),
      /* стенка, лента или колпак линии и число колец (bindWalls, bindFans, bindCaps) — сразу в объекте: у всех линий одна форма
         объекта, и обращения к ним в циклах по линиям не замедляются */
      wall: null, wallK: 0, fan: null, fanK: 0, cap: null, capK: 0, rings: 0
    }));
    bound.walls = bindWalls(md, bound, idx, skel);
    bound.fans = bindFans(md, bound, idx);
    bound.caps = bindCaps(md, bound, idx);
    return bound;
  }
  const apply = (m, i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
  const lin = (m, i, v) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * v[0] + m[o + r * 4 + 1] * v[1] + m[o + r * 4 + 2] * v[2]); };
  /* ортонормированная рамка с третьей осью a (у цилиндра MuJoCo ось — третий столбец; поворот вокруг оси безразличен) */
  function frameFromAxis(a) {
    const n = Math.hypot(...a), z = a.map(v => v / n), t = Math.abs(z[0]) < .9 ? [1, 0, 0] : [0, 1, 0];
    const x = cross3(t, z); normalize(x); const y = cross3(z, x);
    return [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
  }
  /* обратная 3×3 (по строкам) */
  function inv3(a) {
    const c = [a[4] * a[8] - a[5] * a[7], a[5] * a[6] - a[3] * a[8], a[3] * a[7] - a[4] * a[6]];
    const d = a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
    return [c[0] / d, (a[2] * a[7] - a[1] * a[8]) / d, (a[1] * a[5] - a[2] * a[4]) / d,
      c[1] / d, (a[0] * a[8] - a[2] * a[6]) / d, (a[2] * a[3] - a[0] * a[5]) / d,
      c[2] / d, (a[1] * a[6] - a[0] * a[7]) / d, (a[0] * a[4] - a[1] * a[3]) / d];
  }
  function place(mu, m) {
    return mu.el.map(e => {
      if (e.s) return { s: apply(m, e.s.i, e.s.p) };
      const w = e.w;
      if (w.t === 'e') {   /* эллипсоид: столбцы B (полуоси) — линейной частью матрицы кости */
        const col = [0, 1, 2].map(k => lin(m, w.i, [w.B[k], w.B[3 + k], w.B[6 + k]]));
        const B = [col[0][0], col[1][0], col[2][0], col[0][1], col[1][1], col[2][1], col[0][2], col[1][2], col[2][2]];
        return { w: { t: 'e', c: apply(m, w.i, w.c), B, Bi: inv3(B), side: w.side ? apply(m, w.side.i, w.side.p) : null } };
      }
      const ax = lin(m, w.i, w.a), fr = frameFromAxis(ax);
      /* радиус — с масштабом кости поперёк оси (у фаланг рамка растянута) */
      const fl = frameFromAxis(w.a), k = Math.hypot(...lin(m, w.i, [fl[0], fl[3], fl[6]])) || 1;
      return { w: { t: w.t, c: apply(m, w.i, w.c), m: fr, r: w.r * k, side: w.side ? apply(m, w.side.i, w.side.p) : null } };
    });
  }
  function layout(bound, m, step = Infinity) { return bound.map(mu => path(place(mu, m), step)); }
  /* путь для рисования тела мышцы: у мышц с широким мясистым началом вдоль кости — продлён до начала брюшка x0
     (точка в рамке первой кости пути, tools/muscles/volumes.js, ORIGIN); длина и сухожилия (body) — по нему же */
  function drawn(mu, m, step = Infinity) {
    const p = path(place(mu, m), step);
    if (!mu.x0) return p;
    const a = apply(m, mu.el[0].s.i, mu.x0);
    return { length: p.length + dist3(a, p.points[0]), points: [a, ...p.points] };
  }
  function layoutDrawn(bound, m, step = Infinity) { return bound.map(mu => drawn(mu, m, step)); }

  /* ---------- толщина (этап М2) ----------
     У мышцы — объём брюшка v (см³), длины сухожилий в начале и в конце пути t0, t1 и длина пути l0 в нейтральной позе
     (см; tools/muscles/volumes.js).
     Сухожилия не растягиваются: брюшко — остальная длина пути L, его средняя площадь сечения — v / длина брюшка, так что
     при укорочении мышца утолщается, при растяжении — истончается (объём мышцы постоянен). Вдоль брюшка сечение —
     веретено: площадь ∝ sin^SPINDLE(πu), u — доля длины брюшка; наибольшая — в 1/SPINDLE_I ≈ 1,2 раза больше средней.
     Если путь короче сухожилий и 40 % брюшка нейтральной позы (крайнее растяжение суставов в модели не бывает, но
     укорочение — бывает), сухожилия укорачиваются вместе с брюшком. Сухожилие — четверть радиуса брюшка, 1,2–5 мм. */
  const SKIN_U = [.1, .3, .5, .7, .9];   /* доли брюшка, где записана кожа над ним (sk) */
  const SPINDLE = .6, SPINDLE_I = (() => { let s = 0; const n = 400; for (let i = 0; i < n; i++) s += Math.pow(Math.sin(Math.PI * (i + .5) / n), SPINDLE); return s / n; })();
  function body(mu, L) {
    let t0 = mu.t0, t1 = mu.t1, lb = L - t0 - t1;
    const min = .4 * Math.max(.5, mu.l0 - t0 - t1);
    if (lb < min) { const k = Math.max(0, (L - min) / Math.max(1e-6, t0 + t1)); t0 *= k; t1 *= k; lb = Math.max(1e-3, L - t0 - t1); }
    const area = mu.v / lb, rt = Math.min(.5, Math.max(.12, .25 * Math.sqrt(area / Math.PI)));
    return { t0, lb, area, rt, L };
  }
  /* кожа над брюшком в точке s пути: глубина d (см) и направление к коже o (каталог, единичный) — по записям sk
     (нейтральная поза), линейно между ними. Направление записано в рамке кости: у первой половины брюшка — кости начала
     пути, у второй — конца; m — матрицы костей кадра (Skeleton.frames) */
  function skinAt(mu, b, s, m) {
    const sk = mu.sk; if (!sk) return null;
    const u = (s - b.t0) / b.lb, n = SKIN_U.length;
    let k = 0; while (k < n - 2 && u > SKIN_U[k + 1]) k++;
    const w = Math.max(0, Math.min(1, (u - SKIN_U[k]) / (SKIN_U[k + 1] - SKIN_U[k]))), A = sk[k], C = sk[k + 1];
    /* направления двух соседних записей — линейной частью матриц их костей; без промежуточных массивов (кадр — сотни колец) */
    const ia = (SKIN_U[k] < .5 ? mu.el[0].s.i : mu.el[mu.el.length - 1].s.i) * 12, ic = (SKIN_U[k + 1] < .5 ? mu.el[0].s.i : mu.el[mu.el.length - 1].s.i) * 12;
    const ax = m[ia] * A[1] + m[ia + 1] * A[2] + m[ia + 2] * A[3], ay = m[ia + 4] * A[1] + m[ia + 5] * A[2] + m[ia + 6] * A[3], az = m[ia + 8] * A[1] + m[ia + 9] * A[2] + m[ia + 10] * A[3];
    const cx = m[ic] * C[1] + m[ic + 1] * C[2] + m[ic + 2] * C[3], cy = m[ic + 4] * C[1] + m[ic + 5] * C[2] + m[ic + 6] * C[3], cz = m[ic + 8] * C[1] + m[ic + 9] * C[2] + m[ic + 10] * C[3];
    let ox = ax + (cx - ax) * w, oy = ay + (cy - ay) * w, oz = az + (cz - az) * w; const ol = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
    SK.o[0] = ox / ol; SK.o[1] = oy / ol; SK.o[2] = oz / ol;
    SK.d = A[0] + (C[0] - A[0]) * w; SK.rho = (A[4] || 200) + ((C[4] || 200) - (A[4] || 200)) * w;
    return SK;
  }
  /* результат skinAt — один объект на модуль (перезаписывается при каждом вызове) */
  const SK = { d: 0, o: [0, 0, 0], rho: 200 };
  /* Сечение у кожи: круг радиуса r, если до кожи (за вычетом подкожного слоя SKIN_GAP) хватает места; иначе мышца
     сплющивается вдоль кожи — эллипс с полуосями ao (к коже) и aw (вдоль кожи), площадь та же (ao · aw = r²), но не
     тоньше FLAT · r: остаток — сдвигом центра вглубь (shift, см). Так широкие поверхностные мышцы (широкая бедра,
     дельтовидная, большая ягодичная) лежат пластом под кожей, а не выпирают из неё. */
  const SKIN_GAP = .4, FLAT = .4;
  function section(r, sk) {
    if (!sk) { SEC1.ao = SEC1.aw = r; SEC1.shift = 0; return SEC1; }
    const room = sk.d - SKIN_GAP, ao = Math.min(r, Math.max(FLAT * r, room));
    SEC1.ao = ao; SEC1.aw = r * r / ao; SEC1.shift = Math.max(0, ao - room);
    return SEC1;
  }
  const SEC1 = { ao: 0, aw: 0, shift: 0 };
  /* ---------- поверхность тела мышцы ----------
     Кольца по SIDES вершин через равные доли длины пути для рисования (drawn); число колец — по длине пути в нейтральной
     позе (ringCount), так что сетка всех мышц не меняет топологию от кадра к кадру. Сечение — section(); его ось
     переносится от середины мышцы к концам без закрутки (проекция на плоскость следующего кольца) и понемногу (STEER)
     подтягивается к направлению на кожу — иначе сплющенная мышца перекручивалась. Ось — прямая, а не направление: цель
     берётся тем знаком, что ближе к текущей (путь над гребнем кожи — у шеи, над лопаткой — меняет сторону, к которой ближе
     кожа). Сдвиг вглубь — по настоящему направлению от кожи; сечение изгибается вдоль кожи по её кривизне (ρ из sk).
     Здесь Math.sqrt вместо Math.hypot: hypot в V8 в разы медленнее, а кадр — около 40 тысяч вершин.
     Кожа — нейтральной позы, в рамках костей: глубину по позе пробовали (Mannequin.skinDistance в трёх точках брюшка) —
     выход из кожи у плеча не уменьшился (кожа там уходит вбок, а сечение сплющивается к ней), а кадр дорожал на 10 мс.
     Координаты — каталога (см, Y вниз). */
  const RING = 2.5, SIDES = 8, MAX_RINGS = 40, STEER = .25;
  const COS = Array.from({ length: SIDES }, (_, j) => Math.cos(2 * Math.PI * j / SIDES)), SIN = Array.from({ length: SIDES }, (_, j) => Math.sin(2 * Math.PI * j / SIDES));
  /* у линий ленты (ниже, «ленты») число колец общее на всю ленту — mu.rings */
  const ringCount = mu => mu.rings || Math.max(6, Math.min(MAX_RINGS, Math.ceil((mu.l0 || 10) / RING) + 1));
  const RB = new Float64Array(MAX_RINGS * 9);
  /* курсор по ломаной: точка на длине s (s не убывает между вызовами) — в out[o..o+2] */
  function cursor(pts, cum) {
    let a = 1;
    return (s, out, o) => {
      while (a < pts.length - 1 && cum[a] < s) a++;
      const A = pts[a - 1], B = pts[a], d = cum[a] - cum[a - 1], u = d > 0 ? Math.min(1, Math.max(0, (s - cum[a - 1]) / d)) : 0;
      out[o] = A[0] + (B[0] - A[0]) * u; out[o + 1] = A[1] + (B[1] - A[1]) * u; out[o + 2] = A[2] + (B[2] - A[2]) * u;
    };
  }
  const T3 = new Float64Array(9);
  /* вершины и нормали тела мышцы mu по пути для рисования p (drawn) в кадре с матрицами костей m: в pos/nor с вершины v0 */
  function surface(mu, p, m, pos, nor, v0 = 0) {
    const pts = p.points, L = p.length, b = body(mu, L), n = ringCount(mu);
    const cum = new Float64Array(pts.length); for (let a = 1; a < pts.length; a++) cum[a] = cum[a - 1] + dist3(pts[a], pts[a - 1]);
    const scale = cum[pts.length - 1] > 1e-9 ? L / cum[pts.length - 1] : 1;
    const atP = cursor(pts, cum), atA = cursor(pts, cum), atB = cursor(pts, cum);
    for (let r = 0; r < n; r++) {
      const s = L * r / (n - 1), q = r * 9;
      atP(s / scale, RB, q);
      /* касательная — по точкам ±RING/2 (сглажена на изломах ломаной) */
      atA(Math.max(0, s - RING * .5) / scale, T3, 0); atB(Math.min(L, s + RING * .5) / scale, T3, 3);
      let tx = T3[3] - T3[0], ty = T3[4] - T3[1], tz = T3[5] - T3[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (tl < 1e-9) { const k = Math.min(pts.length - 1, 1); tx = pts[k][0] - pts[0][0]; ty = pts[k][1] - pts[0][1]; tz = pts[k][2] - pts[0][2]; tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; }
      RB[q + 3] = tx / tl; RB[q + 4] = ty / tl; RB[q + 5] = tz / tl;
      const sk = skinAt(mu, b, s, m), sec = section(radiusAt(b, s), sk);
      /* в ячейках кольца: 0–2 центр, 3–5 касательная, 6–8 направление на кожу; сечение — отдельно */
      if (sk) { RB[q + 6] = sk.o[0]; RB[q + 7] = sk.o[1]; RB[q + 8] = sk.o[2]; } else RB[q + 6] = RB[q + 7] = RB[q + 8] = 0;
      SEC[r * 3] = sec.ao; SEC[r * 3 + 1] = sec.aw; SEC[r * 3 + 2] = sec.shift;
      /* расстояние от центра сечения до центра кривизны кожи: сечение изгибается вдоль кожи (у круглого бедра и плеча
         плоская пластина выходила бы краями из кожи) */
      BEND[r] = sk ? Math.max(.5, sk.rho - sk.d - sec.shift) : 1e6;
    }
    const mid = n >> 1;
    let ox = 0, oy = 0, oz = 0;
    for (const dir of [1, -1]) for (let r = mid; r >= 0 && r < n; r += dir) {
      const q = r * 9, tx = RB[q + 3], ty = RB[q + 4], tz = RB[q + 5], gx0 = RB[q + 6], gy0 = RB[q + 7], gz0 = RB[q + 8];
      if (r === mid) { ox = gx0; oy = gy0; oz = gz0; if (ox * ox + oy * oy + oz * oz < 1e-8) { ox = ty; oy = tz; oz = tx; } }
      else {
        ox = OW[(r - dir) * 3]; oy = OW[(r - dir) * 3 + 1]; oz = OW[(r - dir) * 3 + 2];
        const gd = gx0 * tx + gy0 * ty + gz0 * tz; let gx = gx0 - gd * tx, gy = gy0 - gd * ty, gz = gz0 - gd * tz; const gl = Math.sqrt(gx * gx + gy * gy + gz * gz);
        if (gl > 1e-4) { const sg = (gx * ox + gy * oy + gz * oz) < 0 ? -1 / gl : 1 / gl; ox += (gx * sg - ox) * STEER; oy += (gy * sg - oy) * STEER; oz += (gz * sg - oz) * STEER; }
      }
      const od = ox * tx + oy * ty + oz * tz; ox -= od * tx; oy -= od * ty; oz -= od * tz;
      let ol = Math.sqrt(ox * ox + oy * oy + oz * oz);
      if (ol < 1e-6) { /* любой перпендикуляр к касательной */ if (Math.abs(tx) < .9) { ox = 0; oy = tz; oz = -ty; } else { ox = -tz; oy = 0; oz = tx; } ol = Math.sqrt(ox * ox + oy * oy + oz * oz); }
      ox /= ol; oy /= ol; oz /= ol;
      OW[r * 3] = ox; OW[r * 3 + 1] = oy; OW[r * 3 + 2] = oz;
      if (dir === -1 && r === mid) continue;
      /* w = o × t: в каталоге (Y вниз) это левая тройка; в сцене (Y вверх) кольцо идёт от o к w против часовой снаружи */
      let wx = oy * tz - oz * ty, wy = oz * tx - ox * tz, wz = ox * ty - oy * tx; const wl = Math.sqrt(wx * wx + wy * wy + wz * wz) || 1; wx /= wl; wy /= wl; wz /= wl;
      const gd = gx0 * tx + gy0 * ty + gz0 * tz, gx = gx0 - gd * tx, gy = gy0 - gd * ty, gz = gz0 - gd * tz, sh = SEC[r * 3 + 2] / (Math.sqrt(gx * gx + gy * gy + gz * gz) || 1);
      const cx = RB[q] - gx * sh, cy = RB[q + 1] - gy * sh, cz = RB[q + 2] - gz * sh, ao = SEC[r * 3], aw = SEC[r * 3 + 1];
      /* центр кривизны — вглубь по оси сечения на rc; вершина эллипса (co, si) — на окружности радиуса rc + co под углом si / rc */
      const rc = BEND[r], kx = cx - ox * rc, ky = cy - oy * rc, kz = cz - oz * rc;
      for (let j = 0; j < SIDES; j++) {
        const v = (v0 + r * SIDES + j) * 3, co = COS[j] * ao, si = SIN[j] * aw, th = Math.max(-BEND_MAX, Math.min(BEND_MAX, si / rc)), t2 = th * th;
        /* малые углы — рядом Тейлора (ошибка < 10⁻⁵ при |θ| < 0,3): у большинства колец кожа почти плоская */
        const ct = t2 < .09 ? 1 - t2 * (.5 - t2 / 24) : Math.cos(th), st = t2 < .09 ? th * (1 - t2 * (1 / 6 - t2 / 120)) : Math.sin(th);
        const rr = rc + co, ux = ox * ct + wx * st, uy = oy * ct + wy * st, uz = oz * ct + wz * st;
        pos[v] = kx + ux * rr; pos[v + 1] = ky + uy * rr; pos[v + 2] = kz + uz * rr;
        if (nor) {
          /* нормаль эллипса (cos/ao, sin/aw) в осях (o, w), повёрнутая на тот же угол */
          const a1 = COS[j] / ao, a2 = SIN[j] / aw, n1 = a1 * ct - a2 * st, n2 = a1 * st + a2 * ct;
          const nx = ox * n1 + wx * n2, ny = oy * n1 + wy * n2, nz = oz * n1 + wz * n2, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          nor[v] = nx / nl; nor[v + 1] = ny / nl; nor[v + 2] = nz / nl;
        }
      }
    }
    return n;
  }
  const SEC = new Float64Array(MAX_RINGS * 3), OW = new Float64Array(MAX_RINGS * 3), BEND = new Float64Array(MAX_RINGS), BEND_MAX = 1.3;
  /* радиус сечения на расстоянии s от начала пути (см) */
  function radiusAt(b, s) {
    const u = (s - b.t0) / b.lb;
    if (u <= 0 || u >= 1) return b.rt;
    /* sin^SPINDLE(πu) — по таблице (кадр — тысячи колец, Math.pow был самым дорогим местом расчёта тел), у самых концов,
       где кривая круче, — точно; ошибка радиуса < 0,1 % */
    const x = u * SPN, i = Math.min(SPN - 1, x | 0), f = i > 3 && i < SPN - 4 ? SPT[i] + (SPT[i + 1] - SPT[i]) * (x - i) : Math.pow(Math.sin(Math.PI * u), SPINDLE);
    return Math.max(b.rt, Math.sqrt(b.area * f / SPINDLE_I / Math.PI));
  }
  const SPN = 1024, SPT = Float64Array.from({ length: SPN + 1 }, (_, i) => Math.pow(Math.sin(Math.PI * i / SPN), SPINDLE));

  /* ---------- ленты: широкие плоские мышцы ----------
     Трубка вдоль линии действия хороша для веретена (двуглавая, бедро); широкая плоская мышца (большая грудная,
     широчайшая, трапециевидная…) — пласт, и несколько трубок по числу линий выглядели пучками, между которыми видны
     рёбра, а тело широчайшей при руке над головой выходило из кожи на 3 см. Здесь соседние линии одной мышцы (в порядке
     начал вдоль кости, FANS) образуют ленту: сечение линии — полоса пласта от шва с одним соседом до шва с другим.
     - Соответствие линий — по доле длины пути u (0 — конец у кости anchor, где волокна сходятся; у линий с путём в
       другую сторону — с другого конца); число колец — общее на ленту: кольцо q всех линий — одна доля u. Общие
       промежуточные точки линий веера («узлы») стоят у всех линий на одной доле u; где линии совпадают, центры полос
       раздвигаются вдоль поперечника ленты (только рисунок — путь и работа мышцы прежние).
     - Нормаль пласта у линии — T × D (D — от соседа слева к соседу справа); где линии сходятся, нормаль переносится от
       соседнего кольца без закрутки и понемногу ложится вдоль кожи.
     - Шов соседей — точка хорды между центрами по доле площадей их сечений, приподнятая по кривизне пласта (стрелка
       дуги по углу между направлениями к коже у двух линий) и вытолкнутая из огибающих сфер и цилиндров обеих линий;
       вершины шва общие у обеих полос (те же числа) — щели между полосами нет. Где шов ближе RIB_WMIN·√A или с другой
       стороны (линии сошлись или перекрестились), у полосы своя кромка, полосы перекрываются. Наружные края ленты — на
       BORDER ширины внутренней половины полосы, тоньше (BORDER_H) и скруглены.
     - Площадь сечения — та же, что у трубки (π·r² по объёму брюшка, веретено, утолщение при укорочении): полутолщина
       центра решается из площади многоугольника сечения (solveH) — объём части сохраняется.
     - Под кожей: если до кожи (за вычетом SKIN_GAP, по нейтральной позе — sk) меньше, чем до верха полосы, полоса
       сдвигается вглубь — центр по верху и своим кромкам, шов по своей глубине и не меньше сдвига соседних центров; пучок
       со своими кромками у кожи расплющивается, как трубка.
     Кольцо — те же SIDES = 8 вершин, что у трубки (сетка слоя не меняется): верх в центре, верх шва, край, низ шва, низ
     в центре, низ другого шва, край, верх другого шва. Нормали — по поверхности пласта лицевой стороной (у швов и своих
     кромок внутри ленты — средняя двух полос; изнанка освещена как лицевая — шаг 5).
     Источники выбора мышц и числа — tools/muscles/README.md, «Ленты». */
  const FANS = [
    /* [ключ, линии по порядку начал вдоль кости, кость конца u = 0]; источники — tools/muscles/README.md, «Ленты» */
    ['pecmaj', ['PECM1', 'PECM1b', 'PECM2a', 'PECM2', 'PECM2c', 'PECM3', 'PECM3b'], /^humerus/],
    ['lat', ['LAT1', 'LAT2', 'LAT3', 'LAT4', 'LAT5', 'LAT6'], /^humerus/],
    ['trap', ['trap_clav_1', 'trap_clav_2', 'trap_scap_1', 'trap_scap_2', 'trap_scap_3', 'trap_scap_4', 'trap_scap_5', 'trap_scap_6', 'trap_scap_7', 'trap_scap_8', 'trap_scap_9', 'trap_scap10', 'trap_scap11'], /^(clavicle|scapula)/],
    ['infsp', ['INFSPsup', 'INFSP', 'INFSPinf'], /^humerus/],
    ['serrant', ['serr_ant_1', 'serr_ant_2', 'serr_ant_3', 'serr_ant_4', 'serr_ant_5', 'serr_ant_6', 'serr_ant_7', 'serr_ant_8', 'serr_ant_9', 'serr_ant10', 'serr_ant11', 'serr_ant12'], /^scapula/],
    ['rhomb', ['rhomboid_2', 'rhomboid_3', 'rhomboid_4', 'rhomboid_5'], /^scapula/],
    ['eo', ['EO7', 'EO8', 'EO1', 'EO2', 'EO3', 'EO4', 'EO5', 'EO6'], /^ribcage/],
  ];
  const PEC_LOW = 7.5, PEC_U0 = .45;
  const BORDER = .35, BORDER_H = .5, TIP_IN = .25, TIP_OUT = .6, RIB_WMIN = .5, RIB_HMIN = .06, RIB_C0 = .3, RIB_C1 = 1, RIB_SPREAD = .8, RIB_STEER = .35, RIB_LAM = .3, RIB_AGREE = .5, RIB_HMAX = 3;
  /* поля записи линии в кольце (LW): 0–2 центр, 3–5 касательная в сторону u, 6–8 нормаль пласта, 9–11 направление к коже,
     12 глубина под кожей, 13 площадь сечения (как у трубки), 14 полупоперечник, 15–16 ширины до швов, 17 толщина η = A/(2w),
     18 полутолщина центра, 19 сдвиг вглубь, 20–22 нормаль по соседям, 23 флаги своей кромки, 24 расстояние по пути (см),
     25 радиус кривизны кожи поперёк линии;
     шва (SW): 0–2 точка, 3–5 нормаль, 6–8 поперёк (от линии k к k+1), 9 полутолщина, 10 вынос кромки, 11 доля λ */
  const LW = 26, SW = 12;
  const GAP = new Float64Array(32), GAP2 = new Float64Array(32), PC = new Float64Array(96), LV = new Float64Array(96);
  function bindFans(md, bound, idx) {
    const at = new Map(bound.map((mu, i) => [mu.name, i])), fans = [];
    for (const [key, names, anchor] of FANS) for (const s of ['r', 'l']) {
      const lines = names.map(nm => at.get(nm + '_' + s));
      /* линии, которые рисуются стенкой (bindWalls — данные с полем walls), лентой не становятся */
      if (lines.some(i => i === undefined || bound[i].wall)) continue;
      const rev = new Uint8Array(lines.length);
      lines.forEach((i, k) => {
        const el = md.muscles[i].el, first = el[0].s.bone[0], last = el[el.length - 1].s.bone[0];
        if (anchor.test(first)) rev[k] = 0; else if (anchor.test(last)) rev[k] = 1; else throw Error('muscles: ribbon ' + key + ': ' + bound[i].name + ' not at ' + anchor);
      });
      const n = Math.max(...lines.map(i => ringCount(bound[i]))), K = lines.length;
      /* Узлы: линии веера, добавленные к линии модели (anatomy.js), проходят через её промежуточные точки — от конца u = 0
         до последней общей точки путь у них один и тот же. Доля u такой точки у всех линий — одна (средняя их долей), иначе
         кольца с равной долей u стояли бы у одной линии до общей точки, у другой — после, и линии на рисунке
         перекрещивались бы. Узел — последняя общая точка пути пары линий (элементы пути от конца u = 0 совпадают). */
      const keys = lines.map((i, k) => { const el = md.muscles[i].el.map(e => JSON.stringify(e)); return rev[k] ? el.reverse() : el; });
      const knots = new Map();
      for (let k = 0; k < K; k++) for (let j = 0; j < K; j++) {
        if (j === k) continue;
        let c = 0; while (c < keys[k].length && c < keys[j].length && keys[k][c] === keys[j][c]) c++;
        let e = c - 1; while (e > 0 && !keys[k][e].startsWith('{"s"')) e--;
        if (e <= 0 || e >= keys[k].length - 1 || e >= keys[j].length - 1) continue;
        const kn = knots.get(keys[k][e]) || knots.set(keys[k][e], { s: JSON.parse(keys[k][e]).s, members: new Map() }).get(keys[k][e]);
        kn.members.set(k, e); kn.members.set(j, e);
      }
      const knotList = [...knots.values()].map(kn => ({ i: idx.get(kn.s.bone[0] + '|' + kn.s.bone[1]), p: kn.s.p, members: [...kn.members.keys()] }));
      const lineKnots = lines.map((_, k) => knotList.map((kn, id) => [id, knots.get([...knots.keys()][id]).members.get(k)]).filter(([, e]) => e !== undefined).sort((a, b) => a[1] - b[1]).map(([id]) => id));
      const fan = { key, side: s.toUpperCase(), lines, rev, K, n, L: new Float64Array(K * n * LW), S: new Float64Array((K + 1) * n * SW),
        knots: knotList, lineKnots, KU: new Float64Array(knotList.length), KF: new Float64Array(knotList.length * K),
        /* заполняются ниже (у всех лент одна форма объекта): огибающие тела, нижний край большой грудной, пол */
        wrapOff: null, wrapEls: null, WB: null, rib: -1, low: null, floor: null };
      lines.forEach((i, k) => { bound[i].fan = fan; bound[i].fanK = k; bound[i].rings = n; });
      /* огибающие тела линий (сферы и цилиндры — модели костей в исходных моделях): швы ленты не заходят в них */
      const wraps = lines.map(i => bound[i].el.filter(e => e.w && e.w.t !== 'e').map(e => e.w));
      fan.wrapOff = new Uint16Array(K + 1); wraps.forEach((l, k) => { fan.wrapOff[k + 1] = fan.wrapOff[k] + l.length; });
      /* в рамке кости: центр, ось (у сферы — любая), поперечное к оси направление (масштаб радиуса), радиус, цилиндр ли */
      fan.wrapEls = wraps.flat().map(w => { const fr = frameFromAxis(w.a || [0, 0, 1]); return { i: w.i, c: w.c, a: w.a || [0, 0, 1], p: [fr[0], fr[3], fr[6]], r: w.r, cyl: w.t === 'c' }; });
      fan.WB = new Float64Array(fan.wrapEls.length * 8);
      /* Нижний край большой грудной. Линия рёберной части PECM3b (от хряща 6-го ребра; 4.37.0) идёт к плечу через промежуточную
         точку линии PECM3 на 5-м ребре (h 45,4 — на 7,6 см выше начала): нижний край ленты был ломаным — горизонталь от
         подмышки до этой точки и крутой спуск к хрящу. У человека нижний край — плавная выпуклая книзу дуга от хряща 6-го
         ребра к подмышке (передняя подмышечная складка; Gray's Anatomy, 1918, «Pectoralis major»: нижние волокна рёберной и
         брюшной частей идут вверх и наружу и подворачиваются под верхние). Центр нижней полосы выносится вниз на PEC_LOW·b(u)
         (u — доля длины от плеча; b = sin(π/2·v²), v = (u − 0,45)/0,25, от 0,45 длины до точки PECM3 на 0,7 и
         cos(π/2·(u − 0,7)/0,3) после: у плеча и у хряща — на месте). Ближе к плечу (u < 0,45) край не сдвигается: там, у бока груди
         под подмышкой, сдвинутая вниз полоса выходила из кожи (на четвереньках — до 2,9 см). Площадь сечения прежняя (solveH) —
         объём части тот же. */
      if (key === 'pecmaj') {
        fan.rib = idx.get('ribcage|'); fan.low = new Float64Array(n);
        for (let q = 0; q < n; q++) { const u = q / (n - 1), v = Math.max(0, (u - PEC_U0) / (.7 - PEC_U0)); fan.low[q] = PEC_LOW * (u <= .7 ? Math.sin(Math.PI / 2 * v * v) : Math.cos(Math.PI / 2 * (u - .7) / .3)); }
      }
      /* пол ленты (этап В): лопатка, рёбра, верх столбов выпрямителя — см. FLOOR, floorNeed */
      const fl = FLOOR[key];
      if (fl && md.shells && md.shells[fan.side]) {
        const sh = md.shells[fan.side], sc = md.scap && md.scap[fan.side], si = idx.get('scapula|' + fan.side);
        /* все поля — явно (у полов всех лент одна форма объекта) */
        fan.floor = { u0: fl.u0, su0: fl.su0 ?? fl.u0, scap_c: fl.scap || 0, ribc: fl.ribc || 0, top: fl.top || 0, max: fl.max || 0, sideR: fan.side === 'R', rib: idx.get('ribcage|'), shell: { ...sh, r: Float64Array.from(sh.r, v => (v < 0 ? -1 : v / 100)) },
          scap: fl.scap && sc && si !== undefined ? { i: si, o: sc.o, u: sc.u, v: sc.v, w: sc.w, u0: sc.u0, v0: sc.v0, du: sc.du, NU: sc.NU, NV: sc.NV, h: Float64Array.from(sc.h, x => x / 100), W: new Float64Array(12) } : null,
          bt: fl.back && md.backTop ? { ...md.backTop, z: Float64Array.from(md.backTop.z, v => (v === -32768 ? NaN : v / 100)) } : null };
      }
      fans.push(fan);
    }
    return fans;
  }
  /* Пол лент (этап В: «спина над лопаткой»). Пути трапециевидной, ромбовидных и широчайшей — хорды от позвонков, рёбер и таза к
     лопатке и плечу; в тягах (лопатки сведены) медиальный край и ость лопатки оказывались снаружи ленты — белые «окна», а в
     скручиваниях широчайшая и большая грудная уходили в рёбра до 3,4 см. Ленте, у которой есть пол, низ полосы (центр и швы)
     держится снаружи: задней поверхности лопатки (карта высоты по пластинке, md.scap; зазор scap), оболочки рёбер (зазор rib —
     у широчайшей толщина передней зубчатой и наружной косой под ней) и, над спиной, — верха столбов выпрямителя (back: верх
     полосы не глубже верха столбов, карта md.backTop в рамке грудной клетки — трапециевидная и широчайшая лежат поверх
     выпрямителя, у человека — так же). Где низ ниже
     пола, полоса поднимается к коже (по направлению к коже, как сдвиг вглубь у кожи — только наоборот); пол важнее кожи:
     над лопаткой в сведении лента может подойти к коже ближе обычного. Путь и работа мышцы прежние. */
  /* u0 — доля длины от кости конца (u = 0: лопатка у трапециевидной и ромбовидных, плечо у широчайшей и большой грудной), с
     которой пол действует: у самого прикрепления полоса лежит на кости, а у плеча идёт к нему над подмышкой — там пол только
     выбрасывал бы её в сторону; подъём над лопаткой и рёбрами — не больше FLOOR_MAX, над выпрямителем — FLOOR_BACK (у остистых
     отростков C7–T4 путь трапециевидной на 4–4,5 см под кожей). Подъём — по нормали пола (не по направлению к коже g: у
     остистых отростков оно у соседних линий разное — у гребня кожи над позвонками уходит вбок, — и подъём по нему перекашивал
     полосы); шов поднимается вместе с соседними центрами и сам — только над выпрямителем, не больше чем на FLOOR_SEAM сверх них.
     top — на сколько верх полосы снаружи верха выпрямителя: у трапециевидной больше, чем у широчайшей и ромбовидных (нижняя
     часть трапециевидной лежит поверх верхнего медиального края широчайшей и ромбовидных — Gray's, с. 432–435) */
  const FLOOR = { trap: { scap: .25, ribc: .3, back: 1, top: .7, u0: .25 }, rhomb: { scap: .25, ribc: .3, back: 1, top: .3, u0: .25 }, lat: { scap: .25, ribc: .6, back: 1, top: .2, u0: .3, su0: .5 }, pecmaj: { ribc: .3, u0: .45, max: .4 } }, FLOOR_MAX = 2, FLOOR_BACK = 4, FLOOR_SKIN = .2, FLOOR_SEAM = .5;
  /* z верха столбов выпрямителя (рамка грудной клетки) в точке (x, h) карты md.backTop (правая сторона; у левой x — зеркально);
     NaN — столбов там нет */
  function backTopAt(T, x, h) {
    const fx = (x - T.x0) / T.dx, fy = (h - T.h0) / T.dh, i = Math.floor(fx), j = Math.floor(fy);
    if (i < 0 || j < 0 || i >= T.NX - 1 || j >= T.NH - 1) return NaN;
    let s = 0, w = 0;
    for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
      const z = T.z[(j + dj) * T.NX + i + di]; if (z !== z) continue;
      const ww = (1 - Math.abs(fx - i - di)) * (1 - Math.abs(fy - j - dj)); s += z * ww; w += ww;
    }
    return w > .25 ? s / w : NaN;
  }
  /* оси карты лопатки кадра: начало и оси (u, v, w) в каталоге — fan.floor.scap.W */
  function floorFrame(F, m) {
    const S = F.scap; if (!S) return;
    const o = S.i * 12, W = S.W;
    for (let r = 0; r < 3; r++) {
      W[r] = m[o + r * 4] * S.o[0] + m[o + r * 4 + 1] * S.o[1] + m[o + r * 4 + 2] * S.o[2] + m[o + r * 4 + 3];
      W[3 + r] = m[o + r * 4] * S.u[0] + m[o + r * 4 + 1] * S.u[1] + m[o + r * 4 + 2] * S.u[2];
      W[6 + r] = m[o + r * 4] * S.v[0] + m[o + r * 4 + 1] * S.v[1] + m[o + r * 4 + 2] * S.v[2];
      W[9 + r] = m[o + r * 4] * S.w[0] + m[o + r * 4 + 1] * S.w[1] + m[o + r * 4 + 2] * S.w[2];
    }
  }
  /* высота задней поверхности лопатки над её плоскостью в точке (pu, pv), −∞ — вне лопатки */
  function scapH(S, pu, pv) {
    const x = (pu - S.u0) / S.du, y = (pv - S.v0) / S.du, i = Math.floor(x), j = Math.floor(y);
    if (i < -1 || j < -1 || i >= S.NU || j >= S.NV) return -Infinity;
    let best = -Infinity, s = 0, w = 0;
    for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= S.NU || jj >= S.NV) continue;
      const h = S.h[jj * S.NU + ii]; if (h < -900) continue;
      const ww = (1 - Math.abs(x - ii)) * (1 - Math.abs(y - jj)); s += h * ww; w += ww; if (h > best) best = h;
    }
    return w > .5 ? s / w : best;
  }
  /* насколько поднять точку ленты p с полутолщиной h (нормаль пласта n, направление к коже g), чтобы низ был над полом (над
     выпрямителем — верх над его верхом): подъём — по нормали самого пола (FD: ось w лопатки, радиус оболочки рёбер, «назад»
     грудной клетки), у самого высокого из полов; depth — глубина точки под кожей (нейтральная поза, sk; ограничивает подъём над
     лопаткой и рёбрами); u — доля длины; onlyBack — только над выпрямителем (швы); ≤ 0 — подъём не нужен */
  const FD = new Float64Array(3);
  function floorNeed(F, m, px, py, pz, nx, ny, nz, h, depth, gx, gy, gz, u, onlyBack) {
    const ng = nx * gx + ny * gy + nz * gz, sg = ng < 0 ? -1 : 1, bx = px - sg * nx * h, by = py - sg * ny * h, bz = pz - sg * nz * h;
    /* над лопаткой и рёбрами — не выше FLOOR_SKIN над кожей (глубина — по нейтральной позе, sk): где кость под самой кожей
       (ключица и верхние рёбра при сведённых лопатках), пласт лучше оставить чуть в кости, чем вынести из тела */
    const cap = Math.min(F.max || FLOOR_MAX, depth < 1e8 ? Math.max(0, depth - h * Math.abs(ng) + FLOOR_SKIN) : FLOOR_MAX);
    let need = -Infinity;
    if (F.scap && u >= F.su0 && !onlyBack) {
      const W = F.scap.W, dx = bx - W[0], dy = by - W[1], dz = bz - W[2], pu = dx * W[3] + dy * W[4] + dz * W[5], pv = dx * W[6] + dy * W[7] + dz * W[8], pw = dx * W[9] + dy * W[10] + dz * W[11];
      const hs = scapH(F.scap, pu, pv);
      if (hs > -Infinity) { const L = Math.min(FLOOR_MAX, cap, hs + F.scap_c - pw); if (L > need) { need = L; FD[0] = W[9]; FD[1] = W[10]; FD[2] = W[11]; } }
    }
    const o = F.rib * 12, dx = bx - m[o + 3], dy = by - m[o + 7], dz = bz - m[o + 11];
    const lx = m[o] * dx + m[o + 4] * dy + m[o + 8] * dz, ly = m[o + 1] * dx + m[o + 5] * dy + m[o + 9] * dz, lz = m[o + 2] * dx + m[o + 6] * dy + m[o + 10] * dz;
    const S = F.shell, zz = lz - S.zc, r = Math.sqrt(lx * lx + zz * zz);
    if (r > 1e-6) {
      const gs = F.sideR ? -1 : 1, th = Math.atan2(gs * lx, zz) * 180 / Math.PI;
      if (th >= S.th0 && th <= S.th0 + S.dth * (S.NT - 1)) {
        const rs = onlyBack ? -1 : shellR(S, th, ly);
        if (rs > 0) {
          const rx = (m[o] * lx + m[o + 2] * zz) / r, ry = (m[o + 4] * lx + m[o + 6] * zz) / r, rz = (m[o + 8] * lx + m[o + 10] * zz) / r;
          const L = Math.min(FLOOR_MAX, cap, rs + F.ribc - r); if (L > need) { need = L; FD[0] = rx; FD[1] = ry; FD[2] = rz; }
        }
      }
    }
    /* над спиной: верх полосы — снаружи верха столбов выпрямителя на F.top (столбы лежат под широкими мышцами спины). Верх
       столбов — по карте в рамке грудной клетки (нейтральная поза), а не по глубине под кожей: та — по нейтральной позе и в
       тягах с сведёнными лопатками ошибалась на 1–2 см (полоса выходила из кожи) */
    if (F.bt) {
      const tx = bx + 2 * sg * nx * h - m[o + 3], ty = by + 2 * sg * ny * h - m[o + 7], tz = bz + 2 * sg * nz * h - m[o + 11];
      const qx = m[o] * tx + m[o + 4] * ty + m[o + 8] * tz, qy = m[o + 1] * tx + m[o + 5] * ty + m[o + 9] * tz, qz = m[o + 2] * tx + m[o + 6] * ty + m[o + 10] * tz;
      const ze = backTopAt(F.bt, F.sideR ? qx : -qx, qy + 24);
      if (ze === ze) { const L = Math.min(FLOOR_BACK, qz - ze + F.top); if (L > need) { need = L; FD[0] = -m[o + 2]; FD[1] = -m[o + 6]; FD[2] = -m[o + 10]; } }
    }
    return need;
  }
  /* поднята ли полоса j (вектор подъёма LV не нулевой) */
  const lifted = (j, K) => j >= 0 && j < K && (LV[j * 3] !== 0 || LV[j * 3 + 1] !== 0 || LV[j * 3 + 2] !== 0);
  let CUM = new Float64Array(256);
  /* нормаль для кривизны пласта у линии кольца (смещение в записи линии): направление к коже, без данных кожи — нормаль пласта */
  let CURV_B = null;
  const curv = o => (CURV_B[o + 12] < 1e8 ? o + 9 : o + 6);
  /* вершины и нормали всех линий ленты fan (кадр — матрицы m, пути для рисования paths по номерам bound); вершины линии i —
     с кольца start[i] (номера колец, как у слоя мышц) */
  function ribbon(fan, bound, paths, m, pos, nor, start) {
    const K = fan.K, n = fan.n, B = fan.L, S = fan.S, KN = fan.knots, KU = fan.KU, KF = fan.KF, FL = fan.floor; CURV_B = B;
    if (FL) floorFrame(FL, m);
    /* огибающие тела линий в кадре (как place, без новых объектов): центр, единичная ось, радиус, цилиндр ли */
    const WB = fan.WB;
    fan.wrapEls.forEach((w, j) => {
      const o = w.i * 12, b = j * 8, c = w.c, a = w.a, pp = w.p;
      for (let r = 0; r < 3; r++) {
        WB[b + r] = m[o + r * 4] * c[0] + m[o + r * 4 + 1] * c[1] + m[o + r * 4 + 2] * c[2] + m[o + r * 4 + 3];
        WB[b + 3 + r] = m[o + r * 4] * a[0] + m[o + r * 4 + 1] * a[1] + m[o + r * 4 + 2] * a[2];
      }
      const al = Math.sqrt(WB[b + 3] ** 2 + WB[b + 4] ** 2 + WB[b + 5] ** 2) || 1; WB[b + 3] /= al; WB[b + 4] /= al; WB[b + 5] /= al;
      let kx = 0; for (let r = 0; r < 3; r++) { const v = m[o + r * 4] * pp[0] + m[o + r * 4 + 1] * pp[1] + m[o + r * 4 + 2] * pp[2]; kx += v * v; }
      WB[b + 6] = w.r * (Math.sqrt(kx) || 1); WB[b + 7] = w.cyl ? 1 : 0;
    });
    const WO = fan.wrapOff;
    /* 0. узлы (общие промежуточные точки линий): доля длины пути у каждой линии и средняя — доля узла */
    for (let j = 0; j < KN.length; j++) {
      const kn = KN[j], X = apply(m, kn.i, kn.p); let sum = 0;
      for (const k of kn.members) {
        const i = fan.lines[k], pts = paths[i].points; let best = Infinity, at = 0, c = 0, tot = 0;
        for (let a = 0; a < pts.length; a++) {
          if (a) tot += dist3(pts[a], pts[a - 1]);
          const d = (pts[a][0] - X[0]) ** 2 + (pts[a][1] - X[1]) ** 2 + (pts[a][2] - X[2]) ** 2; if (d < best) { best = d; at = tot; }
        }
        c = tot > 1e-9 ? at / tot : 0; if (fan.rev[k]) c = 1 - c;
        KF[j * K + k] = c; sum += c;
      }
      KU[j] = sum / kn.members.length;
    }
    /* 1. центры, касательные (в сторону u), площади, кожа; доля пути кольца — по u через узлы линии */
    for (let k = 0; k < K; k++) {
      const i = fan.lines[k], mu = bound[i], p = paths[i], pts = p.points, Ln = p.length, b = body(mu, Ln), sg = fan.rev[k] ? -1 : 1, lk = fan.lineKnots[k];
      if (CUM.length < pts.length) CUM = new Float64Array(pts.length * 2);
      const cum = CUM; cum[0] = 0; for (let a = 1; a < pts.length; a++) cum[a] = cum[a - 1] + dist3(pts[a], pts[a - 1]);
      const scale = cum[pts.length - 1] > 1e-9 ? Ln / cum[pts.length - 1] : 1, atP = cursor(pts, cum), atA = cursor(pts, cum), atB = cursor(pts, cum);
      for (let r = 0; r < n; r++) {
        const q = fan.rev[k] ? n - 1 - r : r, o = (k * n + q) * LW, u = q / (n - 1);
        /* u → доля пути своей линии: ломаная через (0, 0), узлы (доля узла, доля линии) и (1, 1) */
        let u0 = 0, f0 = 0, u1 = 1, f1 = 1;
        for (const j of lk) { const U = Math.max(u0 + 1e-4, KU[j]), F = Math.max(f0, KF[j * K + k]); if (U < u) { u0 = U; f0 = F; } else { u1 = U; f1 = F; break; } }
        const f = f0 + (f1 - f0) * Math.max(0, Math.min(1, (u - u0) / Math.max(1e-6, u1 - u0))), s = Ln * (fan.rev[k] ? 1 - f : f);
        atP(s / scale, B, o);
        atA(Math.max(0, s - RING * .5) / scale, T3, 0); atB(Math.min(Ln, s + RING * .5) / scale, T3, 3);
        let tx = T3[3] - T3[0], ty = T3[4] - T3[1], tz = T3[5] - T3[2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
        if (tl < 1e-9) { const e = pts.length - 1; tx = pts[e][0] - pts[0][0]; ty = pts[e][1] - pts[0][1]; tz = pts[e][2] - pts[0][2]; tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; }
        B[o + 3] = sg * tx / tl; B[o + 4] = sg * ty / tl; B[o + 5] = sg * tz / tl;
        const rr = radiusAt(b, s); B[o + 13] = Math.PI * rr * rr; B[o + 24] = s;
        const sk = skinAt(mu, b, s, m);
        if (sk) { B[o + 9] = sk.o[0]; B[o + 10] = sk.o[1]; B[o + 11] = sk.o[2]; B[o + 12] = sk.d; B[o + 25] = sk.rho; } else { B[o + 9] = B[o + 10] = B[o + 11] = 0; B[o + 12] = 1e9; B[o + 25] = 200; }
      }
    }
    /* 1б. Линии веера, добавленные по площадке начала (большая грудная, подостная; LAT4 у нижнего угла
       лопатки), идут к плечу через промежуточные точки своей линии-основы (tools/muscles/anatomy.js) — от этих точек до
       плеча они совпадают, и лента там сжималась бы в пучок. Поэтому центры полос раздвигаются вдоль поперечника ленты
       (ломаная через центры по порядку линий, длины — поперёк касательной): промежуток между соседями — не меньше
       RIB_SPREAD средней, остальные сжимаются так, что края ленты остаются на месте. Где линии и так разошлись, центры —
       на своих линиях; путь и длина мышцы (её работа) не меняются — только рисунок. */
    if (K > 2) for (let q = 0; q < n; q++) {
      let tot = 0;
      for (let k = 0; k < K - 1; k++) {
        const a = (k * n + q) * LW, c = a + n * LW;
        let tx = B[a + 3] + B[c + 3], ty = B[a + 4] + B[c + 4], tz = B[a + 5] + B[c + 5]; const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        let dx = B[c] - B[a], dy = B[c + 1] - B[a + 1], dz = B[c + 2] - B[a + 2]; const dt = dx * tx + dy * ty + dz * tz; dx -= dt * tx; dy -= dt * ty; dz -= dt * tz;
        GAP[k] = Math.sqrt(dx * dx + dy * dy + dz * dz); tot += GAP[k];
      }
      if (tot < 1e-3) continue;
      const lo = RIB_SPREAD * tot / (K - 1); let sum = 0;
      for (let k = 0; k < K - 1; k++) { GAP2[k] = Math.max(GAP[k], lo); sum += GAP2[k]; }
      if (sum - tot < 1e-6) continue;
      /* новые доли поперечника → точки на ломаной через центры (копия центров — до сдвига) */
      for (let k = 0; k < K; k++) { const a = (k * n + q) * LW; PC[k * 3] = B[a]; PC[k * 3 + 1] = B[a + 1]; PC[k * 3 + 2] = B[a + 2]; }
      let c2 = 0;
      for (let k = 1; k < K - 1; k++) {
        c2 += GAP2[k - 1] * tot / sum;
        let j = 0, acc = 0; while (j < K - 2 && acc + GAP[j] < c2) { acc += GAP[j]; j++; }
        const f = GAP[j] > 1e-9 ? Math.min(1, Math.max(0, (c2 - acc) / GAP[j])) : 0, a = (k * n + q) * LW;
        B[a] = PC[j * 3] + (PC[j * 3 + 3] - PC[j * 3]) * f; B[a + 1] = PC[j * 3 + 1] + (PC[j * 3 + 4] - PC[j * 3 + 1]) * f; B[a + 2] = PC[j * 3 + 2] + (PC[j * 3 + 5] - PC[j * 3 + 2]) * f;
      }
    }
    /* 1в. Нижний край большой грудной (fan.low, bindFans): центр нижней полосы выносится вниз вдоль груди (−y грудной клетки
       поперёк направления к коже) на fan.low — только рисунок, путь прежний */
    if (fan.low) {
      const o = fan.rib * 12, yx = -m[o + 1], yy = -m[o + 5], yz = -m[o + 9];
      for (let q = 0; q < n; q++) {
        const c = ((K - 1) * n + q) * LW; let gx = B[c + 9], gy = B[c + 10], gz = B[c + 11];
        if (B[c + 12] > 1e8) { gx = B[c + 6]; gy = B[c + 7]; gz = B[c + 8]; }
        const d = yx * gx + yy * gy + yz * gz; let dx = yx - d * gx, dy = yy - d * gy, dz = yz - d * gz; const dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dl < 1e-6) continue; const s = fan.low[q] / dl; B[c] += dx * s; B[c + 1] += dy * s; B[c + 2] += dz * s;
      }
    }
    /* 2. поперечник D (от соседа слева к соседу справа) и нормаль пласта T × D */
    for (let q = 0; q < n; q++) for (let k = 0; k < K; k++) {
      const o = (k * n + q) * LW, a = ((k > 0 ? k - 1 : 0) * n + q) * LW, c = ((k < K - 1 ? k + 1 : K - 1) * n + q) * LW;
      const tx = B[o + 3], ty = B[o + 4], tz = B[o + 5];
      let dx = B[c] - B[a], dy = B[c + 1] - B[a + 1], dz = B[c + 2] - B[a + 2];
      /* у крайней линии — и второй сосед с половинным весом: если первый почти совпадает с ней (линии веера до общей
         промежуточной точки), направление поперёк всё равно задано */
      if ((k === 0 || k === K - 1) && K > 2) { const f = ((k === 0 ? 2 : K - 3) * n + q) * LW, g = k === 0 ? 1 : -1; dx += g * (B[f] - B[o]) * .5; dy += g * (B[f + 1] - B[o + 1]) * .5; dz += g * (B[f + 2] - B[o + 2]) * .5; }
      const dt = dx * tx + dy * ty + dz * tz;
      dx -= dt * tx; dy -= dt * ty; dz -= dt * tz;
      const dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
      /* полупоперечник — на один промежуток: у внутренней линии D — два промежутка, у крайней — один и половина двух */
      B[o + 14] = dl * (k > 0 && k < K - 1 ? .5 : K > 2 ? .5 : 1);
      if (dl > 1e-6) { B[o + 20] = (ty * dz - tz * dy) / dl; B[o + 21] = (tz * dx - tx * dz) / dl; B[o + 22] = (tx * dy - ty * dx) / dl; } else B[o + 20] = B[o + 21] = B[o + 22] = 0;
    }
    /* 3. нормаль вдоль линии: от кольца с самым широким поперечником в обе стороны; где линии сходятся — перенос без закрутки */
    for (let k = 0; k < K; k++) {
      let q0 = 0, best = -1;
      for (let q = 0; q < n; q++) { const w = B[(k * n + q) * LW + 14]; if (w > best) { best = w; q0 = q; } }
      for (const dir of [1, -1]) for (let q = q0; q >= 0 && q < n; q += dir) {
        const o = (k * n + q) * LW, tx = B[o + 3], ty = B[o + 4], tz = B[o + 5];
        let nx, ny, nz;
        if (q === q0) {
          if (dir === -1) continue;
          nx = B[o + 20]; ny = B[o + 21]; nz = B[o + 22];
          /* поперечника нет нигде (все линии в одной точке) — к коже */
          if (nx * nx + ny * ny + nz * nz < .5) { nx = B[o + 9] || tz; ny = B[o + 10] || tx; nz = B[o + 11] || ty; }
        } else {
          const pq = (k * n + q - dir) * LW; nx = B[pq + 6]; ny = B[pq + 7]; nz = B[pq + 8];
          const c = Math.max(0, Math.min(1, (B[o + 14] - RIB_C0) / RIB_C1));
          if (c > 0) {
            let rx = B[o + 20], ry = B[o + 21], rz = B[o + 22]; if (rx * nx + ry * ny + rz * nz < 0) { rx = -rx; ry = -ry; rz = -rz; }
            nx += (rx - nx) * c; ny += (ry - ny) * c; nz += (rz - nz) * c;
          }
          /* где лента сходится в пучок, полоса понемногу ложится вдоль кожи — как сплющенная трубка (иначе её ширина
             могла смотреть в кость под ней) */
          const gx = B[o + 9], gy = B[o + 10], gz = B[o + 11], gd = gx * tx + gy * ty + gz * tz, k1 = (1 - c) * RIB_STEER;
          let ux = gx - gd * tx, uy = gy - gd * ty, uz = gz - gd * tz; const ul = Math.sqrt(ux * ux + uy * uy + uz * uz);
          if (k1 > 0 && ul > .1) { if (ux * nx + uy * ny + uz * nz < 0) { ux = -ux; uy = -uy; uz = -uz; } nx += (ux / ul - nx) * k1; ny += (uy / ul - ny) * k1; nz += (uz / ul - nz) * k1; }
        }
        const nd = nx * tx + ny * ty + nz * tz; nx -= nd * tx; ny -= nd * ty; nz -= nd * tz;
        let nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (nl < 1e-6) { if (Math.abs(tx) < .9) { nx = 0; ny = tz; nz = -ty; } else { nx = -tz; ny = 0; nz = tx; } nl = Math.sqrt(nx * nx + ny * ny + nz * nz); }
        B[o + 6] = nx / nl; B[o + 7] = ny / nl; B[o + 8] = nz / nl;
      }
    }
    /* 3б. знак нормали — общий для ленты: перенос вдоль линии мог развернуть нормаль одной линии против соседей (пласт огибает
       головку плеча — подостная, большая грудная, — а между кольцами линии почти сходятся). Линия, чья нормаль
       большей частью (с весом надёжности поперечника) смотрит против нормали соседа, переворачивается целиком — вдоль
       линии перекрута нет */
    for (let k = 1; k < K; k++) {
      let vote = 0;
      for (let q = 0; q < n; q++) { const o = (k * n + q) * LW, a = o - n * LW, w = Math.min(B[o + 14], B[a + 14]); vote += w * (B[o + 6] * B[a + 6] + B[o + 7] * B[a + 7] + B[o + 8] * B[a + 8]); }
      if (vote < 0) for (let q = 0; q < n; q++) { const o = (k * n + q) * LW; B[o + 6] = -B[o + 6]; B[o + 7] = -B[o + 7]; B[o + 8] = -B[o + 8]; }
    }
    /* 4. швы между соседями: точка хорды между центрами, приподнятая по кривизне пласта; общая нормаль и направление поперёк */
    for (let q = 0; q < n; q++) {
      for (let j = 1; j < K; j++) {
        const a = ((j - 1) * n + q) * LW, c = (j * n + q) * LW, o = (j * n + q) * SW;
        let nx = B[a + 6] + B[c + 6], ny = B[a + 7] + B[c + 7], nz = B[a + 8] + B[c + 8], nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (nl < .2) { nx = B[a + 6]; ny = B[a + 7]; nz = B[a + 8]; nl = 1; }
        nx /= nl; ny /= nl; nz /= nl;
        let tx = B[a + 3] + B[c + 3], ty = B[a + 4] + B[c + 4], tz = B[a + 5] + B[c + 5];
        const td = tx * nx + ty * ny + tz * nz; tx -= td * nx; ty -= td * ny; tz -= td * nz;
        let wx = ny * tz - nz * ty, wy = nz * tx - nx * tz, wz = nx * ty - ny * tx; const wl = Math.sqrt(wx * wx + wy * wy + wz * wz) || 1; wx /= wl; wy /= wl; wz /= wl;
        const ex = B[c] - B[a], ey = B[c + 1] - B[a + 1], ez = B[c + 2] - B[a + 2], d = Math.sqrt(ex * ex + ey * ey + ez * ez);
        /* кривизна пласта — по направлениям к коже у двух линий (они надёжнее нормалей пласта там, где линии огибают
           кость: подостная и большая грудная у головки плеча); стрелка — вдоль среднего из них */
        const ga = curv(a), gc = curv(c);
        const cphi = B[ga] * B[gc] + B[ga + 1] * B[gc + 1] + B[ga + 2] * B[gc + 2];
        let sag = 0, sx = 0, sy = 0, sz = 0;
        if (cphi < .99999) {
          const phi = Math.min(Math.PI / 2, Math.acos(Math.max(-1, cphi))), conv = ex * (B[gc] - B[ga]) + ey * (B[gc + 1] - B[ga + 1]) + ez * (B[gc + 2] - B[ga + 2]);
          sag = (conv >= 0 ? 1 : -1) * d * .5 * Math.tan(phi / 4);
          sx = B[ga] + B[gc]; sy = B[ga + 1] + B[gc + 1]; sz = B[ga + 2] + B[gc + 2]; const sl = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1; sx /= sl; sy /= sl; sz /= sl;
        }
        /* шов — не посередине, а по площадям сечений двух полос (λ = A/(A + A'), в пределах RIB_LAM…1 − RIB_LAM): у линий
           разного объёма (части большой грудной, широчайшей) толщина пласта ровнее; стрелка — по доле хорды */
        const lam = Math.min(1 - RIB_LAM, Math.max(RIB_LAM, B[a + 13] / (B[a + 13] + B[c + 13] || 1)));
        sag *= 4 * lam * (1 - lam);
        S[o] = B[a] + (B[c] - B[a]) * lam + sx * sag; S[o + 1] = B[a + 1] + (B[c + 1] - B[a + 1]) * lam + sy * sag; S[o + 2] = B[a + 2] + (B[c + 2] - B[a + 2]) * lam + sz * sag;
        S[o + 11] = lam;
        S[o + 3] = nx; S[o + 4] = ny; S[o + 5] = nz; S[o + 6] = wx; S[o + 7] = wy; S[o + 8] = wz;
      }
      /* шов — на хорде между линиями: где линии огибают кость (подостная и большая грудная у головки плеча),
         хорда проходит сквозь неё. Шов выталкивается на поверхность огибающих тел обеих линий (на ней лежат и сами линии,
         когда огибают кость) */
      for (let j = 1; j < K; j++) { const s = (j * n + q) * SW; clear(S, s, WB, WO[j - 1], WO[j + 1], .05); }
      /* ширины полос до швов (вдоль W = N × T), не уже RIB_WMIN·√A; крайние — на BORDER внутренней половины */
      for (let k = 0; k < K; k++) {
        const o = (k * n + q) * LW, nx = B[o + 6], ny = B[o + 7], nz = B[o + 8], tx = B[o + 3], ty = B[o + 4], tz = B[o + 5];
        const wx = ny * tz - nz * ty, wy = nz * tx - nx * tz, wz = nx * ty - ny * tx, wmin = RIB_WMIN * Math.sqrt(B[o + 13]);
        let wl = -1, wr = -1, fl = 0;
        /* шов общий, только если он со своей стороны не ближе wmin и нормали полосы и шва согласны (где линии
           перекрещиваются, нормали соседних полос расходятся — общий шов перекрутил бы сечение «бантиком») */
        if (k > 0) { const s = (k * n + q) * SW; wl = (B[o] - S[s]) * wx + (B[o + 1] - S[s + 1]) * wy + (B[o + 2] - S[s + 2]) * wz; if (nx * S[s + 3] + ny * S[s + 4] + nz * S[s + 5] < RIB_AGREE) fl |= 1; }
        if (k < K - 1) { const s = ((k + 1) * n + q) * SW; wr = (S[s] - B[o]) * wx + (S[s + 1] - B[o + 1]) * wy + (S[s + 2] - B[o + 2]) * wz; if (nx * S[s + 3] + ny * S[s + 4] + nz * S[s + 5] < RIB_AGREE) fl |= 2; }
        if (k === 0) wl = BORDER * Math.max(wmin, wr); if (k === K - 1) wr = BORDER * Math.max(wmin, wl);
        if (wl < wmin || fl & 1) { wl = Math.max(wl, wmin); fl |= 1; } if (wr < wmin || fl & 2) { wr = Math.max(wr, wmin); fl |= 2; }
        /* своя кромка дотягивается до середины пути к соседней линии с той же стороны, какой бы сосед там ни оказался: где
           линии перекрещиваются (у головки плеча при руке над головой), полосы перекрывают промежуток */
        if (fl) for (let j = k - 1; j <= k + 1; j += 2) {
          if (j < 0 || j >= K) continue;
          const c = (j * n + q) * LW, p = ((B[c] - B[o]) * wx + (B[c + 1] - B[o + 1]) * wy + (B[c + 2] - B[o + 2]) * wz) * .5;
          if (p < 0 && fl & 1) wl = Math.max(wl, -p); else if (p > 0 && fl & 2) wr = Math.max(wr, p);
        }
        /* у кожи полоса со своими кромками (пучок, где линии сошлись) расплющивается, как трубка: толщина к коже — не больше
           места до неё (но не тоньше FLAT радиуса), ширина своих кромок растёт так, что площадь та же */
        const ng = Math.abs(nx * B[o + 9] + ny * B[o + 10] + nz * B[o + 11]), room = B[o + 12] - SKIN_GAP;
        if (fl && ng > .8) {
          const A = B[o + 13], eta = A / (2 * (wl + wr)), lim = Math.max(FLAT * Math.sqrt(A / Math.PI), room / ng);
          if (eta > lim) {
            /* не шире полуторной: кожа над широкой кромкой уходит вниз по своей кривизне */
            const extra = Math.min(A / (2 * lim), 1.5 * (wl + wr)) - wl - wr;
            if ((fl & 3) === 3) { wl += extra / 2; wr += extra / 2; } else if (fl & 1) wl += extra; else wr += extra;
          }
        }
        B[o + 15] = wl; B[o + 16] = wr; B[o + 23] = fl; B[o + 17] = B[o + 13] / (2 * (wl + wr));
      }
      /* наружные края: по кривизне пласта у соседней линии (край уходит вглубь выпуклого пласта) */
      border(B, S, n, q, 0, 1, 0, -1); border(B, S, n, q, K - 1, K - 2, K, 1);
      clear(S, q * SW, WB, WO[0], WO[1], .05); clear(S, (K * n + q) * SW, WB, WO[K - 1], WO[K], .05);
      /* толщина у шва — среднее гармоническое толщин двух полос: ближе к тонкой — толстая полоса выпуклее в своей
         середине, а у тонкой кромка не толще её самой (иначе сечение — «бантик» с перекрутом) */
      for (let j = 1; j < K; j++) { const s = (j * n + q) * SW, ea = B[((j - 1) * n + q) * LW + 17], ec = B[(j * n + q) * LW + 17]; S[s + 9] = 2 * ea * ec / (ea + ec || 1); S[s + 10] = TIP_IN * S[s + 9]; }
      /* толщина центра — из площади сечения (solveH). Сдвиг вглубь у кожи (кожа над точкой — плоскость на её глубине d,
         нейтральная поза): центр — по верху полосы и её своим кромкам; шов — сам по себе, по своей толщине и средней
         глубине двух линий (иначе швы линий, лежащих у самой кожи, уходили бы вслед за центром в кость) */
      for (let k = 0; k < K; k++) {
        const o = (k * n + q) * LW, sl = (k * n + q) * SW, sr = ((k + 1) * n + q) * SW, wl = B[o + 15], wr = B[o + 16], fl = B[o + 23], eta = B[o + 17];
        const h = B[o + 18] = solveH(B, S, o, sl, sr, k, K);
        const gx = B[o + 9], gy = B[o + 10], gz = B[o + 11], nx = B[o + 6], ny = B[o + 7], nz = B[o + 8], tx = B[o + 3], ty = B[o + 4], tz = B[o + 5];
        const ng = Math.abs(gx * nx + gy * ny + gz * nz), wg = gx * (ny * tz - nz * ty) + gy * (nz * tx - nx * tz) + gz * (nx * ty - ny * tx);
        let ext = h * ng - (B[o + 12] - SKIN_GAP);
        /* свои кромки — там же, где их поставит edge() (по направлению на шов); кожа над кромкой ниже, чем над линией, на
           x²/(2ρ) — x — отход кромки вбок, ρ — радиус кривизны кожи поперёк линии (sk, как у трубок) */
        for (let side = -1; side <= 1; side += 2) {
          if (!(fl & (side < 0 ? 1 : 2))) continue;
          const E = edge(S, side < 0 ? sl : sr, 1, B[o], B[o + 1], B[o + 2], nx, ny, nz, ny * tz - nz * ty, nz * tx - nx * tz, nx * ty - ny * tx, side < 0 ? wl : wr, side, (side < 0 ? k > 0 : k < K - 1) ? eta : -1);
          const ex = E[0] - B[o], ey = E[1] - B[o + 1], ez = E[2] - B[o + 2], up = ex * gx + ey * gy + ez * gz, x2 = Math.max(0, ex * ex + ey * ey + ez * ez - up * up);
          ext = Math.max(ext, up + E[9] * ng + Math.max(0, E[10] * (E[6] * gx + E[7] * gy + E[8] * gz)) - (B[o + 12] - SKIN_GAP - x2 / (2 * B[o + 25])));
        }
        const sh0 = Math.max(0, ext);
        B[o + 19] = sh0;
        /* пол (этап В): низ полосы — над лопаткой, рёбрами и выпрямителем; где ниже — подъём от пола (вектор LV) */
        LV[k * 3] = LV[k * 3 + 1] = LV[k * 3 + 2] = 0;
        if (FL && q >= FL.u0 * (n - 1)) { const L = floorNeed(FL, m, B[o] - gx * sh0, B[o + 1] - gy * sh0, B[o + 2] - gz * sh0, nx, ny, nz, h, B[o + 12] + sh0, gx, gy, gz, q / (n - 1)); if (L > 0) { LV[k * 3] = FD[0] * L; LV[k * 3 + 1] = FD[1] * L; LV[k * 3 + 2] = FD[2] * L; } }
      }
      for (let j = 0; j <= K; j++) {
        const s = (j * n + q) * SW, a = ((j > 0 ? j - 1 : 0) * n + q) * LW, c = ((j < K ? j : K - 1) * n + q) * LW;
        let gx = B[a + 9] + B[c + 9], gy = B[a + 10] + B[c + 10], gz = B[a + 11] + B[c + 11]; const gl = Math.sqrt(gx * gx + gy * gy + gz * gz);
        if (gl < 1e-6) continue;
        gx /= gl; gy /= gl; gz /= gl;
        /* глубина точки шва: средняя глубина линий минус подъём шва над их средней точкой к коже */
        const lam = a === c ? .5 : S[s + 11];
        const lift = (S[s] - B[a] - (B[c] - B[a]) * lam) * gx + (S[s + 1] - B[a + 1] - (B[c + 1] - B[a + 1]) * lam) * gy + (S[s + 2] - B[a + 2] - (B[c + 2] - B[a + 2]) * lam) * gz;
        /* наружный край: кожа над ним ниже на x²/(2ρ) */
        let x2 = 0; if (a === c) { const ex = S[s] - B[a], ey = S[s + 1] - B[a + 1], ez = S[s + 2] - B[a + 2], up = ex * gx + ey * gy + ez * gz; x2 = Math.max(0, ex * ex + ey * ey + ez * ez - up * up) / (2 * B[a + 25]); }
        /* и не меньше сдвига соседних центров по доле λ: иначе у полосы, ушедшей вглубь, швы оставались бы наверху (сечение «галочкой») */
        const room = B[a + 12] + (B[c + 12] - B[a + 12]) * lam - lift - SKIN_GAP - x2, skin = S[s + 9] * Math.abs(gx * S[s + 3] + gy * S[s + 4] + gz * S[s + 5]) - room, base = B[a + 19] + (B[c + 19] - B[a + 19]) * lam;
        const sh = Math.max(0, skin, base);
        S[s] -= gx * sh; S[s + 1] -= gy * sh; S[s + 2] -= gz * sh;
        /* пол: шов поднимается вместе с соседними центрами (доля λ их подъёма) и сам держится над выпрямителем — не больше чем на
           FLOOR_SEAM сверх них (свой пол над лопаткой и рёбрами поднимал шов отдельно от центра, полоса перекашивалась) */
        if (FL) {
          const ka = j > 0 ? j - 1 : 0, kc = j < K ? j : K - 1;
          for (let r = 0; r < 3; r++) S[s + r] += LV[ka * 3 + r] + (LV[kc * 3 + r] - LV[ka * 3 + r]) * lam;
          if (q >= FL.u0 * (n - 1)) { const L = floorNeed(FL, m, S[s], S[s + 1], S[s + 2], S[s + 3], S[s + 4], S[s + 5], S[s + 9], room + SKIN_GAP + x2 + sh, gx, gy, gz, q / (n - 1), true); if (L > 0) { const d = Math.min(L, FLOOR_SEAM); S[s] += FD[0] * d; S[s + 1] += FD[1] * d; S[s + 2] += FD[2] * d; } }
        }
      }
      for (let k = 0; k < K; k++) { const o = (k * n + q) * LW, sh = B[o + 19]; B[o] -= B[o + 9] * sh - LV[k * 3]; B[o + 1] -= B[o + 10] * sh - LV[k * 3 + 1]; B[o + 2] -= B[o + 11] * sh - LV[k * 3 + 2]; }
      /* с полом соседние полосы подняты на разную высоту, и полоса между ними наклонена: нормаль центра — поперёк линии её швов
         (иначе верх и низ центра шли бы по прежней нормали, сечение — «ромбом» наискось, без площади) */
      if (FL) for (let k = 0; k < K; k++) {
        const o = (k * n + q) * LW; if (!lifted(k - 1, K) && !lifted(k, K) && !lifted(k + 1, K)) continue;
        const sl = (k * n + q) * SW, sr = ((k + 1) * n + q) * SW, cx = S[sr] - S[sl], cy = S[sr + 1] - S[sl + 1], cz = S[sr + 2] - S[sl + 2];
        let nx = B[o + 4] * cz - B[o + 5] * cy, ny = B[o + 5] * cx - B[o + 3] * cz, nz = B[o + 3] * cy - B[o + 4] * cx; const l = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (l < 1e-6) continue;
        /* знак — по прежней нормали; где новая к ней почти поперёк (швы встали один над другим), — по нормали предыдущего кольца
           (иначе кольцо перевернулось бы относительно соседних) */
        let cs = (nx * B[o + 6] + ny * B[o + 7] + nz * B[o + 8]) / l;
        if (Math.abs(cs) < .5 && q > 0) { const p = o - LW; cs = (nx * B[p + 6] + ny * B[p + 7] + nz * B[p + 8]) / l; }
        const sg = cs < 0 ? -1 / l : 1 / l; B[o + 6] = nx * sg; B[o + 7] = ny * sg; B[o + 8] = nz * sg;
      }
      /* после сдвигов центр и швы сместились по-разному — толщина центра заново, по сечению, которое будет нарисовано */
      for (let k = 0; k < K; k++) { const o = (k * n + q) * LW; B[o + 18] = solveH(B, S, o, (k * n + q) * SW, ((k + 1) * n + q) * SW, k, K); }
    }
    /* 5. вершины: порядок кольца — как у трубки (от нормали к w = N × t своей линии).
       Изнанка пласта (сторона, обращённая от кожи) освещается как лицевая: нормали её вершин — нормали лицевой стороны
       (so · N; знак — по большинству колец ленты, в какую сторону от N кожа, с весом u: у начала на туловище направление
       к коже надёжнее, у плеча и бедра кожа нейтральной позы поворачивается вместе с костью). Изнанка видна только сквозь
       прозрачный силуэт кожи (шея и затылок, если смотреть со стороны головы), и там широкая плоская изнанка, обращённая
       вниз, — тёмный клин: свет сцены — сверху, снизу — только тёмная полусфера. У трубки изнанка узкая и круглая, её не
       видно; тонкий пласт мышцы (5–15 мм) на рисунке — как лист, освещённый с лицевой стороны. Геометрия не меняется. */
    let vote = 0;
    for (let k = 0; k < K; k++) for (let q = 1; q < n; q++) { const o = (k * n + q) * LW; if (B[o + 12] < 1e8) vote += q * (B[o + 6] * B[o + 9] + B[o + 7] * B[o + 10] + B[o + 8] * B[o + 11]); }
    const so = vote < 0 ? -1 : 1;
    for (let k = 0; k < K; k++) {
      const i = fan.lines[k], rev = fan.rev[k];
      for (let r = 0; r < n; r++) {
        const q = rev ? n - 1 - r : r, o = (k * n + q) * LW, sl = (k * n + q) * SW, sr = ((k + 1) * n + q) * SW, v = (start[i] + r) * SIDES * 3;
        const cx = B[o], cy = B[o + 1], cz = B[o + 2], nx = B[o + 6], ny = B[o + 7], nz = B[o + 8], h = B[o + 18], fl = B[o + 23];
        const tx = B[o + 3], ty = B[o + 4], tz = B[o + 5], wx = ny * tz - nz * ty, wy = nz * tx - nx * tz, wz = nx * ty - ny * tx;
        /* правый шов (к линии k+1) и левый (к k−1): общие вершины — или своя кромка, если полоса шире шва (линии сходятся) */
        const R = edge(S, sr, fl & 2, cx, cy, cz, nx, ny, nz, wx, wy, wz, B[o + 16], 1, k < K - 1 ? B[o + 17] : -1), Lf = edge(S, sl, fl & 1, cx, cy, cz, nx, ny, nz, wx, wy, wz, B[o + 15], -1, k > 0 ? B[o + 17] : -1);
        /* своя кромка внутри ленты лежит на соседней полосе (они перекрываются): её вершины освещаются по средней нормали двух
           полос, без бокового блика кромки — иначе край каждой полосы на соседке рисовался тёмной линией («ступеньки») */
        smoothEdge(B, n, q, k, K, fl, so);
        const order = rev ? ORDER_REV : ORDER;
        for (let j = 0; j < SIDES; j++) {
          const e = order[j], w = v + j * 3;
          let px, py, pz, qx, qy, qz;
          if (e === 0 || e === 4) { const sg = e === 0 ? 1 : -1; px = cx + nx * h * sg; py = cy + ny * h * sg; pz = cz + nz * h * sg; qx = nx * so; qy = ny * so; qz = nz * so; }
          else {
            const right = e < 4, E = right ? R : Lf, kind = right ? e - 1 : 7 - e, sm = right ? SMR : SML;   /* 0 — верх шва, 1 — кромка, 2 — низ шва */
            if (kind === 1) { px = E[0] + E[6] * E[10]; py = E[1] + E[7] * E[10]; pz = E[2] + E[8] * E[10]; qx = E[6]; qy = E[7]; qz = E[8]; }
            else { const sg = kind === 0 ? 1 : -1; px = E[0] + E[3] * E[9] * sg; py = E[1] + E[4] * E[9] * sg; pz = E[2] + E[5] * E[9] * sg; qx = E[3] * so; qy = E[4] * so; qz = E[5] * so; }
            if (sm[3]) { qx = sm[0]; qy = sm[1]; qz = sm[2]; }
          }
          pos[w] = px; pos[w + 1] = py; pos[w + 2] = pz;
          if (nor) { nor[w] = qx; nor[w + 1] = qy; nor[w + 2] = qz; }
        }
      }
    }
  }
  /* нормаль освещения своих кромок полосы k (кольцо q) внутри ленты: средняя её нормали и нормали соседа с той же стороны,
     лицевой стороной (so); SMR/SML[3] = 1, если кромка своя */
  const SMR = new Float64Array(4), SML = new Float64Array(4);
  function smoothEdge(B, n, q, k, K, fl, so) { smoothSide(SMR, B, n, q, k, k + 1, K, fl & 2, so); smoothSide(SML, B, n, q, k, k - 1, K, fl & 1, so); }
  function smoothSide(sm, B, n, q, k, j, K, own, so) {
    sm[3] = 0; if (!own || j < 0 || j >= K) return;
    const o = (k * n + q) * LW, c = (j * n + q) * LW, g = B[o + 6] * B[c + 6] + B[o + 7] * B[c + 7] + B[o + 8] * B[c + 8] < 0 ? -1 : 1;
    const x = B[o + 6] + g * B[c + 6], y = B[o + 7] + g * B[c + 7], z = B[o + 8] + g * B[c + 8], l = Math.sqrt(x * x + y * y + z * z);
    if (l < 1e-6) return;
    sm[0] = so * x / l; sm[1] = so * y / l; sm[2] = so * z / l; sm[3] = 1;
  }
  /* наружный край ленты (шов j у линии k, сосед nb, сторона side): на ширине своей половины, по кривизне пласта у соседа */
  function border(B, S, n, q, k, nb, j, side) {
    const o = (k * n + q) * LW, c = (nb * n + q) * LW, s = (j * n + q) * SW, e = side < 0 ? B[o + 15] : B[o + 16];
    const nx = B[o + 6], ny = B[o + 7], nz = B[o + 8], tx = B[o + 3], ty = B[o + 4], tz = B[o + 5];
    const wx = ny * tz - nz * ty, wy = nz * tx - nx * tz, wz = nx * ty - ny * tx;
    const ex = B[c] - B[o], ey = B[c + 1] - B[o + 1], ez = B[c + 2] - B[o + 2], d = Math.sqrt(ex * ex + ey * ey + ez * ez) || 1;
    const go = curv(o), gn = curv(c);
    const cphi = Math.max(-1, Math.min(1, B[go] * B[gn] + B[go + 1] * B[gn + 1] + B[go + 2] * B[gn + 2])), conv = ex * (B[gn] - B[go]) + ey * (B[gn + 1] - B[go + 1]) + ez * (B[gn + 2] - B[go + 2]);
    const kap = 2 * Math.sqrt(Math.max(0, (1 - cphi) * .5)) / d, dev = (conv >= 0 ? 1 : -1) * Math.min(.5 * e, kap * e * e * .5);
    S[s] = B[o] + side * wx * e - B[go] * dev; S[s + 1] = B[o + 1] + side * wy * e - B[go + 1] * dev; S[s + 2] = B[o + 2] + side * wz * e - B[go + 2] * dev;
    S[s + 3] = nx; S[s + 4] = ny; S[s + 5] = nz; S[s + 6] = wx; S[s + 7] = wy; S[s + 8] = wz;
    S[s + 9] = BORDER_H * B[o + 17]; S[s + 10] = TIP_OUT * S[s + 9];
  }
  /* Полутолщина центра полосы из площади сечения. Половина сечения от центра до шва — четырёхугольник (толщина 2h по N у
     центра, 2hS по NS у шва), площадь |(N·h + NS·hS) × a| в плоскости поперёк касательной, a — от центра к шву: у изогнутого
     пласта (шов приподнят по кривизне или сдвинут у кожи иначе центра) — по самим векторам, а не ширина × толщина; своя
     кромка — прямая полоса ширины w; плюс треугольники кромок. Своя кромка внутри ленты — толщины самой полосы η,
     наружный край ленты — всегда тоньше (BORDER_H), как у шва края. */
  function solveH(B, S, o, sl, sr, k, K) {
    const wl = B[o + 15], wr = B[o + 16], fl = B[o + 23], eta = B[o + 17];
    const oL = fl & 1 && k > 0, oR = fl & 2 && k < K - 1, hL = oL ? eta : S[sl + 9], hR = oR ? eta : S[sr + 9];
    arm(B, S, o, sl, fl & 1, wl, -1); const aL = ARM[0], bL = ARM[1];
    arm(B, S, o, sr, fl & 2, wr, 1); const aR = ARM[0], bR = ARM[1];
    /* не толще RIB_HMAX толщин η: где швы сдвинуты поперёк пласта почти по нормали центра (пол поднял шов, а центр рядом — нет),
       плечо сечения мало, и площадь давала бы центр в 4–8 см толщиной — шип */
    return Math.min(RIB_HMAX * eta, Math.max(RIB_HMIN, .3 * eta, (B[o + 13] - bL * hL - bR * hR - (oL ? TIP_IN * eta : S[sl + 10]) * hL - (oR ? TIP_IN * eta : S[sr + 10]) * hR) / (aL + aR)));
  }
  /* вклад половины сечения в площадь: ARM[0] — множитель при толщине центра, ARM[1] — при толщине шва (solveH) */
  const ARM = new Float64Array(2);
  function arm(B, S, o, s, own, w, side) {
    if (own) { ARM[0] = ARM[1] = w; return; }
    const tx = B[o + 3], ty = B[o + 4], tz = B[o + 5], ax = S[s] - B[o], ay = S[s + 1] - B[o + 1], az = S[s + 2] - B[o + 2];
    /* (n × a)·t = n·(a × t), со знаком стороны: n — нормаль центра или шва */
    const cx = ay * tz - az * ty, cy = az * tx - ax * tz, cz = ax * ty - ay * tx;
    const at = ax * tx + ay * ty + az * tz, al = Math.sqrt(Math.max(0, ax * ax + ay * ay + az * az - at * at));
    ARM[0] = Math.max(.2 * al, -side * (B[o + 6] * cx + B[o + 7] * cy + B[o + 8] * cz)); ARM[1] = Math.max(.2 * al, -side * (S[s + 3] * cx + S[s + 4] * cy + S[s + 5] * cz));
  }
  /* вытолкнуть точку шва (S[s..s+2]) из огибающих сфер и цилиндров WB[j0..j1) (кадр, ribbon) на расстояние cl от поверхности */
  function clear(S, s, WB, j0, j1, cl) {
    for (let j = j0; j < j1; j++) {
      const b = j * 8; let vx = S[s] - WB[b], vy = S[s + 1] - WB[b + 1], vz = S[s + 2] - WB[b + 2];
      if (WB[b + 7]) { const d = vx * WB[b + 3] + vy * WB[b + 4] + vz * WB[b + 5]; vx -= d * WB[b + 3]; vy -= d * WB[b + 4]; vz -= d * WB[b + 5]; }
      const dl = Math.sqrt(vx * vx + vy * vy + vz * vz), need = WB[b + 6] + cl;
      if (dl < need && dl > 1e-6) { const k = (need - dl) / dl; S[s] += vx * k; S[s + 1] += vy * k; S[s + 2] += vz * k; }
    }
  }
  /* обход кольца: 0 — верх центра, 1–3 — правый шов (верх, кромка, низ), 4 — низ центра, 5–7 — левый (низ, кромка, верх);
     у линии с путём против u её w смотрит влево — кольцо идёт через левый шов */
  const ORDER = [0, 1, 2, 3, 4, 5, 6, 7], ORDER_REV = [0, 7, 6, 5, 4, 3, 2, 1];
  const ER = new Float64Array(11), EL = new Float64Array(11);
  /* шов для вершин полосы: [точка, нормаль, направление кромки (наружу полосы), толщина, вынос кромки]. Своя кромка — на
     ширине w от центра, когда шов ближе (линии сходятся или перекрещиваются) */
  function edge(S, s, own, cx, cy, cz, nx, ny, nz, wx, wy, wz, w, side, eta) {
    const E = side > 0 ? ER : EL;
    if (own) {
      /* своя кромка — на продолжении направления на шов (полоса заходит за шов на соседа, без щели по кривизне пласта);
         если шов сбоку или с другой стороны (линии перекрещиваются) — поперёк, по W */
      const dx = S[s] - cx, dy = S[s + 1] - cy, dz = S[s + 2] - cz, ws = (dx * wx + dy * wy + dz * wz) * side;
      if (ws > .5 * w) { const k = w / ws; E[0] = cx + dx * k; E[1] = cy + dy * k; E[2] = cz + dz * k; }
      else { E[0] = cx + wx * w * side; E[1] = cy + wy * w * side; E[2] = cz + wz * w * side; }
      E[3] = nx; E[4] = ny; E[5] = nz;
      E[6] = wx * side; E[7] = wy * side; E[8] = wz * side;
    }
    else { E[0] = S[s]; E[1] = S[s + 1]; E[2] = S[s + 2]; E[3] = S[s + 3]; E[4] = S[s + 4]; E[5] = S[s + 5]; E[6] = S[s + 6] * side; E[7] = S[s + 7] * side; E[8] = S[s + 8] * side; }
    /* толщина кромки: своя — толщины полосы η; у наружного края ленты (eta < 0) и у общего шва — как у шва */
    if (own && eta > 0) { E[9] = eta; E[10] = TIP_IN * eta; } else { E[9] = S[s + 9]; E[10] = S[s + 10]; }
    return E;
  }
  /* кольцо q линии k ленты после ribbon(): расстояние по пути s, площадь сечения area (как у трубки), полутолщина h и η,
     ширины до швов, своя ли кромка (линии сошлись), нормаль пласта n и направление к коже skin — для проверок */
  function ribbonRing(fan, k, q) {
    const o = (k * fan.n + q) * LW, B = fan.L;
    return { s: B[o + 24], area: B[o + 13], h: B[o + 18], eta: B[o + 17], wl: B[o + 15], wr: B[o + 16], own: B[o + 23], shift: B[o + 19], t: [B[o + 3], B[o + 4], B[o + 5]],
      n: [B[o + 6], B[o + 7], B[o + 8]], skin: B[o + 12] < 1e8 ? [B[o + 9], B[o + 10], B[o + 11]] : null };
  }
  /* ---------- дельтовидная: «колпак» над головкой плеча ----------
     Пять линий действия дельтовидной (передняя DELT1, средняя DELT2, задние DELT3lat, DELT3, DELT3med) рисуются одним пластом,
     а не трубками (почему — tools/muscles/README.md, «Колпак дельтовидной»). Пласт — сетка: 11 столбцов (край, центр части 1,
     шов 1–2, центр 2, …, центр 5, край) по CAP_RINGS строк. Столбец — «нить» от прикрепления на плечевой кости к началу на
     ключице, акромионе или ости лопатки, натянутая снаружи головки плеча и диафиза. Строки — поперёк нитей на общей «широте».
     Часть k — кольца по строкам: центр части (наружу и на кости) и два шва; соседние части делят шов, поэтому пласт сплошной.
     Линии действия (пути из данных) не меняются: из них берутся только концы, длина и тело мышцы (площади сечения). */
  const CAP = ['DELT1', 'DELT2', 'DELT3lat', 'DELT3', 'DELT3med'];
  /* CAP_RINGS — строк (колец у части); CAP_RH, CAP_GAP — радиус головки (см) и зазор до мышцы; CAP_SHAFT — наибольшее расстояние
     пласта от оси диафиза у прикрепления (см); CAP_ROUTE, CAP_STR — точек маршрута и нити; CAP_LAM — пределы доли шва;
     CAP_EDGE, CAP_EDGE_O — вынос края колпака за крайнюю часть у плеча и у начала (доля шага столбцов: у начала меньше — край
     не уходит острым лоскутом вдоль ключицы и ости); CAP_EDGE_H, CAP_TIP — толщина края (доля центра) и скругление кромки;
     CAP_INS, CAP_VOPEN — прикрепления задних пучков вдоль заднего края V бугристости (доли от вершины V) и раскрытие этого
     края (рад); CAP_FIX — азимуты столбцов на диафизе (рад, спереди назад); CAP_FAN — полярный угол, до которого веер
     раскрывается на диафизе (рад); CAP_BETA — вклад длины нити в «широту» строк; CAP_TMAX, CAP_WMAX, CAP_WTOT — толщина, по
     которой считается нужная ширина части, наибольшая полуширина части и вся ширина колпака (см); CAP_AMAX — наибольший
     поворот узла при раздвигании (рад); CAP_UEND — у концов нити (доля длины) ширина не добирается; CAP_DSMOOTH — проходы
     сглаживания сдвигов вдоль столбца; CAP_HMAX, CAP_HMAX2 — наибольшая толщина части (см; у средней — вторая); CAP_SMOOTH —
     проходы согласования толщин центров и швов; CAP_TSMOOTH, CAP_NSMOOTH — проходы сглаживания толщины и нормали вдоль
     столбца */
  const CAP_RINGS = 20, CAP_RH = 2.75, CAP_GAP = .2, CAP_SHAFT = 1.6, CAP_ROUTE = 48, CAP_STR = 40, CAP_LAM = .3, CAP_EDGE = .6, CAP_EDGE_O = .25,
    CAP_EDGE_H = .5, CAP_TIP = .5, CAP_INS = [0, 0, 1 / 3, 2 / 3, 1], CAP_VOPEN = 40 * Math.PI / 180,
    CAP_FIX = [100, 75, 40, 0, -30, -50, -65, -80, -90, -100, -110].map(x => x * Math.PI / 180), CAP_FAN = .45, CAP_BETA = .15,
    CAP_TMAX = 3, CAP_WMAX = 4, CAP_WTOT = 18, CAP_AMAX = .45, CAP_UEND = .2, CAP_DSMOOTH = 4, CAP_HMAX = 3, CAP_HMAX2 = 3.5, CAP_SMOOTH = 3, CAP_TSMOOTH = 2, CAP_NSMOOTH = 2;
  function bindCaps(md, bound, idx) {
    const at = new Map(bound.map((mu, i) => [mu.name, i])), caps = [];
    for (const s of ['r', 'l']) {
      const lines = CAP.map(nm => at.get(nm + '_' + s));
      if (lines.some(i => i === undefined)) continue;
      const hum = idx.get('humerus|' + s.toUpperCase());
      if (hum === undefined) continue;
      const K = lines.length, C = 2 * K + 1, n = CAP_RINGS, f = c => new Float64Array(c);
      /* rev — путь линии идёт от начала к плечу (у задней части); строки колпака — от плеча */
      const rev = Uint8Array.from(lines.map(i => /^humerus/.test(md.muscles[i].el[0].s.bone[0]) ? 0 : 1));
      /* швы — по доле объёмов λ соседних частей */
      const v = lines.map(i => bound[i].v), lam = f(K + 1);
      for (let k = 0; k + 1 < K; k++) lam[k + 1] = Math.min(1 - CAP_LAM, Math.max(CAP_LAM, v[k] / (v[k] + v[k + 1])));
      const cap = { key: 'delt', side: s.toUpperCase(), lines, rev, K, C, n, hum, lam,
        X: f(C * n * 3), NR: f(C * n * 3), B: f(C * n * 3), A: f(K * n), TH: f(C * n), WL: f(K * n), WR: f(K * n), U: f(C * n),
        DT: f(C * n), AIM: f(2), E: f(C * 6), RT: f(CAP_ROUTE), ST: f(C * CAP_STR * 4), SL: f(C * CAP_STR), TS: f(C), AE: f(C), PL: new Uint8Array(C),
        BODY: new Array(K), LN: f(K) };
      lines.forEach((i, k) => { bound[i].cap = cap; bound[i].capK = k; bound[i].rings = n; });
      caps.push(cap);
    }
    return caps;
  }
  /* рамка кадра: центр сустава H (0–2), ось плеча к локтю a (3–5), азимут 0 — e1 (к бугристости, 6–8), e2 = a × e1 (9–11) */
  const CF = new Float64Array(12);
  /* азимуты столбцов: прикрепления TI (настоящие) и T0 (по порядку), на диафизе TS, у начала T1; рабочие массивы */
  const TI = new Float64Array(16), T0 = new Float64Array(16), T1 = new Float64Array(16), TO = new Float64Array(16), W = new Float64Array(16),
    RS = new Float64Array(16), GP = new Float64Array(16);
  const capWrap = d => { while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI; return d; };
  const capStep = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  /* азимут точки p вокруг оси плеча (от e1 к e2) */
  const capAzimuth = (p, i) => {
    const dx = p[i] - CF[0], dy = p[i + 1] - CF[1], dz = p[i + 2] - CF[2];
    return Math.atan2(dx * CF[9] + dy * CF[10] + dz * CF[11], dx * CF[6] + dy * CF[7] + dz * CF[8]);
  };
  /* полярный угол точки p (от оси плеча к локтю) */
  const capPolar = (p, i) => {
    const dx = p[i] - CF[0], dy = p[i + 1] - CF[1], dz = p[i + 2] - CF[2];
    return Math.acos(Math.max(-1, Math.min(1, (dx * CF[3] + dy * CF[4] + dz * CF[5]) / (Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-9))));
  };
  /* Маршрут столбца — направления из центра сустава: полярный угол α растёт линейно от прикрепления aI до начала aE (через
     верх головки — aE > π), азимут θ(α): от своего на прикреплении — к азимуту столбца на диафизе TS (веер раскрывается между
     a0 и a1), затем к азимуту начала T1 (между a1 и aE); у прикрепления (1 − u)⁴ — поправка к настоящему азимуту TI. */
  const RP = new Float64Array(8);
  function capTheta(u, al) {
    const v = 1 - u, v2 = v * v;
    return RP[4] + (RP[3] - RP[4]) * capStep((al - RP[0]) / (RP[1] - RP[0])) + (RP[5] - RP[3]) * (RP[2] - RP[1] > 1e-6 ? capStep((al - RP[1]) / (RP[2] - RP[1])) : 1) +
      (RP[6] - RP[4]) * v2 * v2;
  }
  /* Нить столбца c — кратчайший путь от прикрепления I до начала O по развёртке маршрута (конус направлений с вершиной в центре
     сустава: точка — радиус r и угол развёртки ψ) снаружи препятствия — головки (радиус CAP_RH + CAP_GAP) и диафиза (расстояние
     от оси rs, на маршруте это r ≥ rs / sin α). Препятствие звёздное, путь — выпуклая цепочка левых поворотов (обход Грэхема по
     возрастанию ψ). Результат — CAP_STR точек нити в ST (x, y, z, «широта»): ниже центра сустава — минус высота вдоль оси, выше —
     дуга по головке CAP_RH·(α − π/2); вдоль маршрута «широта» растёт. */
  const HX = new Float64Array(CAP_ROUTE + 2), HY = new Float64Array(CAP_ROUTE + 2), HA = new Float64Array(CAP_ROUTE + 2), HL = new Float64Array(CAP_ROUTE + 2),
    RX = new Float64Array(CAP_ROUTE), RY = new Float64Array(CAP_ROUTE), RZ = new Float64Array(CAP_ROUTE), CP = new Float64Array(CAP_ROUTE), SP = new Float64Array(CAP_ROUTE);
  function capString(cap, c, E, iI, iO) {
    const M = CAP_ROUTE, RT = cap.RT, ST = cap.ST, MS = CAP_STR, b0 = c * MS * 4, hx = CF[0], hy = CF[1], hz = CF[2];
    const rA = Math.sqrt((E[iI] - hx) ** 2 + (E[iI + 1] - hy) ** 2 + (E[iI + 2] - hz) ** 2) || 1e-9, rB = Math.sqrt((E[iO] - hx) ** 2 + (E[iO + 1] - hy) ** 2 + (E[iO + 2] - hz) ** 2) || 1e-9;
    const aI = Math.acos(Math.max(-1, Math.min(1, ((E[iI] - hx) * CF[3] + (E[iI + 1] - hy) * CF[4] + (E[iI + 2] - hz) * CF[5]) / rA))), aE = cap.AE[c];
    RP[0] = Math.max(aI, cap.AIM[c < 3 ? 0 : 1]); RP[1] = RP[0] + Math.max(.15, Math.min(aE, Math.PI - .2, CAP_FAN) - RP[0]); RP[2] = Math.max(aE, RP[1]);
    RP[3] = cap.TS[c]; RP[4] = T0[c]; RP[5] = T1[c]; RP[6] = TI[c];
    /* маршрут: направления (вдоль оси, e1, e2) и угол развёртки ψ — накопленный угол между соседними направлениями */
    /* шаг маршрута мал (доли радиана): угол между соседними направлениями — по хорде, поворот на развёртке (CP, SP —
       косинус и синус ψ) — по рядам Тейлора; α растёт равномерно — его косинус и синус тоже поворотом */
    let psi = 0, ca = Math.cos(aI), sa = Math.sin(aI), cp = 1, sp = 0;
    const da = (aE - aI) / (M - 1), cd = Math.cos(da), sd = Math.sin(da);
    for (let j = 0; j < M; j++) {
      const u = j / (M - 1), th = capTheta(u, aI + da * j), x = ca, y = sa * Math.cos(th), z = sa * Math.sin(th);
      if (j) {
        const dx = x - RX[j - 1], dy = y - RY[j - 1], dz = z - RZ[j - 1], d = Math.sqrt(dx * dx + dy * dy + dz * dz), d2 = d * d;
        const c1 = 1 - d2 / 2 + d2 * d2 / 24, s1 = d - d * d2 / 6, c0 = cp; psi += d; cp = c0 * c1 - sp * s1; sp = sp * c1 + c0 * s1;
      }
      RT[j] = psi; RX[j] = x; RY[j] = y; RZ[j] = z; CP[j] = cp; SP[j] = sp;
      const c2 = ca * cd - sa * sd; sa = sa * cd + ca * sd; ca = c2;
    }
    const Rh = Math.min(CAP_RH + CAP_GAP, .97 * rA, .97 * rB), rs = Math.min(CAP_SHAFT, .97 * rA * Math.sin(aI), .97 * rB * Math.max(.05, Math.abs(Math.sin(aE))));
    let h = 0;
    for (let j = 0; j < M; j++) {
      let x, y, a;
      if (j === 0) { x = rA; y = 0; a = 0; }
      else if (j === M - 1) { x = rB * CP[j]; y = rB * SP[j]; a = psi; }
      else { const sa = Math.sqrt(RY[j] * RY[j] + RZ[j] * RZ[j]), ro = RX[j] > 0 ? Math.max(Rh, rs / Math.max(1e-3, sa)) : Rh; a = RT[j]; x = ro * CP[j]; y = ro * SP[j]; }
      while (h >= 2 && (HX[h - 1] - HX[h - 2]) * (y - HY[h - 1]) - (HY[h - 1] - HY[h - 2]) * (x - HX[h - 1]) <= 1e-12) h--;
      HX[h] = x; HY[h] = y; HA[h] = a; h++;
    }
    HL[0] = 0; for (let k = 1; k < h; k++) HL[k] = HL[k - 1] + Math.sqrt((HX[k] - HX[k - 1]) ** 2 + (HY[k] - HY[k - 1]) ** 2);
    const L = HL[h - 1]; let k = 1, j = 1;
    for (let q = 0; q < MS; q++) {
      const s = L * q / (MS - 1); while (k < h - 1 && HL[k] < s) k++;
      const d = HL[k] - HL[k - 1], t = d > 1e-12 ? Math.min(1, Math.max(0, (s - HL[k - 1]) / d)) : 0;
      const x0 = HX[k - 1], y0 = HY[k - 1], x = x0 + (HX[k] - x0) * t, y = y0 + (HY[k] - y0) * t, r = Math.sqrt(x * x + y * y);
      const an = Math.min(psi, Math.max(0, HA[k - 1] + Math.atan2(x0 * y - y0 * x, x0 * x + y0 * y)));
      while (j < M - 1 && RT[j] < an) j++;
      while (j > 1 && RT[j - 1] > an) j--;
      /* направление — между соседними точками маршрута (их угол мал: маршрут густой) */
      const f = RT[j] > RT[j - 1] ? (an - RT[j - 1]) / (RT[j] - RT[j - 1]) : 0, u = (j - 1 + f) / (M - 1);
      let dx = RX[j - 1] + (RX[j] - RX[j - 1]) * f, dy = RY[j - 1] + (RY[j] - RY[j - 1]) * f, dz = RZ[j - 1] + (RZ[j] - RZ[j - 1]) * f; const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      dx /= dl; dy /= dl; dz /= dl;
      const v = b0 + q * 4;
      for (let e = 0; e < 3; e++) ST[v + e] = CF[e] + r * (dx * CF[3 + e] + dy * CF[6 + e] + dz * CF[9 + e]);
      ST[v + 3] = r * dx > 0 ? -r * dx : CAP_RH * (aI + (aE - aI) * u - Math.PI / 2);
    }
    for (let e = 0; e < 3; e++) { ST[b0 + e] = E[iI + e]; ST[b0 + (MS - 1) * 4 + e] = E[iO + e]; }
  }
  /* изотоническая регрессия с шагами gap[c] между c и c + 1: ближайшие по сумме квадратов t, где t[c+1] − t[c] ≥ gap[c] */
  const ISO = new Float64Array(16), ISW = new Float64Array(16), ISN = new Int32Array(16), ISC = new Float64Array(16);
  function capSpread(t, gap, C) {
    let b = 0, acc = 0;
    for (let c = 0; c < C; c++) {
      ISC[c] = acc; ISO[b] = t[c] - acc; ISW[b] = 1; ISN[b] = 1; b++; if (c + 1 < C) acc += gap[c];
      while (b > 1 && ISO[b - 2] > ISO[b - 1]) { const w = ISW[b - 2] + ISW[b - 1]; ISO[b - 2] = (ISO[b - 2] * ISW[b - 2] + ISO[b - 1] * ISW[b - 1]) / w; ISW[b - 2] = w; ISN[b - 2] += ISN[b - 1]; b--; }
    }
    let c = 0; for (let j = 0; j < b; j++) for (let k = 0; k < ISN[j]; k++, c++) t[c] = ISO[j] + ISC[c];
  }
  /* колпак кадра: концы и рамка, азимуты, нити и строки, ширина, толщины, вершины колец частей */
  function capSurface(cap, bound, paths, m, pos, nor, start) {
    capEnds(cap, bound, paths, m);
    capAzimuths(cap);
    capRows(cap);
    capWidth(cap);
    capThickness(cap);
    capVertices(cap, pos, nor, start);
  }
  function capEnds(cap, bound, paths, m) {
    const K = cap.K, C = cap.C, lam = cap.lam, E = cap.E;
    const o = cap.hum * 12, hx = m[o + 3], hy = m[o + 7], hz = m[o + 11];
    let ax0 = -m[o + 1], ax1 = -m[o + 5], ax2 = -m[o + 9]; { const l = Math.sqrt(ax0 * ax0 + ax1 * ax1 + ax2 * ax2) || 1; ax0 /= l; ax1 /= l; ax2 /= l; }
    CF[0] = hx; CF[1] = hy; CF[2] = hz; CF[3] = ax0; CF[4] = ax1; CF[5] = ax2;
    /* 1. Концы столбцов: прикрепление на плече E[c·6 …] и начало E[c·6 + 3 …]. Задняя часть в модели прикрепляется одной точкой
          (три линии); на рисунке её пучки — вдоль заднего края V-образной бугристости: от вершины V (прикрепление средней части)
          к своему (доли CAP_INS), и этот край раскрыт назад вокруг оси плеча (CAP_VOPEN) — иначе задние пучки шли бы друг за
          другом по одной линии. Швы — между соседними центрами (λ), края — вынос за крайние части (CAP_EDGE у плеча,
          CAP_EDGE_O у начала). */
    for (let k = 0; k < K; k++) {
      const i = cap.lines[k], p = paths[i], pts = p.points, I = cap.rev[k] ? pts[pts.length - 1] : pts[0], O = cap.rev[k] ? pts[0] : pts[pts.length - 1];
      cap.BODY[k] = body(bound[i], p.length); cap.LN[k] = p.length;
      const c = 2 * k + 1; for (let j = 0; j < 3; j++) { E[c * 6 + j] = I[j]; E[c * 6 + 3 + j] = O[j]; }
    }
    {
      /* назад — от передней части: знак поворота по взаимному положению прикреплений передней и средней частей */
      const d2x = E[18] - hx, d2y = E[19] - hy, d2z = E[20] - hz, d1x = E[6] - hx, d1y = E[7] - hy, d1z = E[8] - hz;
      const s1 = (d2y * d1z - d2z * d1y) * ax0 + (d2z * d1x - d2x * d1z) * ax1 + (d2x * d1y - d2y * d1x) * ax2 >= 0 ? -1 : 1;
      for (let k = 2; k < K; k++) {
        const c = 2 * k + 1, f = CAP_INS[k], a = s1 * CAP_VOPEN * f, ca = Math.cos(a), sa = Math.sin(a);
        const px = E[18] + (E[c * 6] - E[18]) * f - hx, py = E[19] + (E[c * 6 + 1] - E[19]) * f - hy, pz = E[20] + (E[c * 6 + 2] - E[20]) * f - hz, dd = px * ax0 + py * ax1 + pz * ax2;
        const cx = ax1 * pz - ax2 * py, cy = ax2 * px - ax0 * pz, cz = ax0 * py - ax1 * px;
        E[c * 6] = hx + px * ca + cx * sa + ax0 * dd * (1 - ca); E[c * 6 + 1] = hy + py * ca + cy * sa + ax1 * dd * (1 - ca); E[c * 6 + 2] = hz + pz * ca + cz * sa + ax2 * dd * (1 - ca);
      }
    }
    for (let k = 0; k + 1 < K; k++) { const c = 2 * k + 2, l = lam[k + 1]; for (let j = 0; j < 6; j++) E[c * 6 + j] = E[(c - 1) * 6 + j] + (E[(c + 1) * 6 + j] - E[(c - 1) * 6 + j]) * l; }
    for (let j = 0; j < 6; j++) { const f = j < 3 ? CAP_EDGE : CAP_EDGE_O; E[j] = E[6 + j] + (E[6 + j] - E[12 + j]) * f; E[(C - 1) * 6 + j] = E[(C - 2) * 6 + j] + (E[(C - 2) * 6 + j] - E[(C - 3) * 6 + j]) * f; }
    /* 2. Рамка: азимут 0 — к среднему прикреплению на плече (бугристость), поперёк оси */
    {
      let x = 0, y = 0, z = 0;
      for (let c = 0; c < C; c++) { x += E[c * 6] - hx; y += E[c * 6 + 1] - hy; z += E[c * 6 + 2] - hz; }
      const d = x * ax0 + y * ax1 + z * ax2; x -= d * ax0; y -= d * ax1; z -= d * ax2; const l = Math.sqrt(x * x + y * y + z * z) || 1;
      CF[6] = x / l; CF[7] = y / l; CF[8] = z / l; CF[9] = ax1 * CF[8] - ax2 * CF[7]; CF[10] = ax2 * CF[6] - ax0 * CF[8]; CF[11] = ax0 * CF[7] - ax1 * CF[6];
    }
  }
  function capAzimuths(cap) {
    const C = cap.C, E = cap.E;
    /* 3. Азимуты. На диафизе пучки лежат каждый на своём месте вокруг кости (CAP_FIX, спереди назад; для левой стороны — с
          обратным знаком): дистальная половина мышцы движется вместе с плечом. Выше головки нить идёт к началу — поворотом вокруг
          оси плеча в ту сторону, где ближе, или через верх головки (полярный угол за π), если начало над головкой с другой
          стороны: стоимость пути — поворот, умноженный на sin α начала, плюс лишний полярный угол. Решает центр части; шов идёт
          через верх, только если обе соседние части, край — как своя часть. Веер раскрывается выше самого высокого
          прикрепления своего края V (AIM: передний — столбцы до средней части, задний — от неё): прикрепления на заднем
          крае V не обгоняют друг друга, а передняя часть раскрывается сразу от своего. */
    for (let c = 0; c < C; c++) { TI[c] = capAzimuth(E, c * 6); T0[c] = TI[c]; TO[c] = capAzimuth(E, c * 6 + 3); }
    const sgI = TI[0] - TI[C - 1] >= 0 ? 1 : -1;
    cap.AIM[0] = cap.AIM[1] = 0;
    for (let c = 0; c < C; c++) { const a = capPolar(E, c * 6); if (c <= 3) cap.AIM[0] = Math.max(cap.AIM[0], a); if (c >= 3) cap.AIM[1] = Math.max(cap.AIM[1], a); }
    for (let c = 0; c < C; c++) {
      const ts = sgI * CAP_FIX[c], aO = capPolar(E, c * 6 + 3), sa = Math.sin(aO);
      const dn = capWrap(TO[c] - ts), dp = capWrap(TO[c] + Math.PI - ts);
      cap.TS[c] = ts; T1[c] = dn; W[c] = dp; RS[c] = aO;
      cap.PL[c] = aO > Math.PI / 2 && Math.abs(dp) * sa + 2 * (Math.PI - aO) < Math.abs(dn) * sa ? 1 : 0;
    }
    for (let c = 0; c < C; c += 2) cap.PL[c] = c === 0 ? cap.PL[1] : c === C - 1 ? cap.PL[C - 2] : cap.PL[c - 1] & cap.PL[c + 1];
    for (let c = 0; c < C; c++) { const pl = cap.PL[c]; T1[c] = cap.TS[c] + (pl ? W[c] : T1[c]); cap.AE[c] = pl ? 2 * Math.PI - RS[c] : RS[c]; }
    /* азимуты прикреплений — по порядку столбцов (не ближе 0,0125 рад): маршруты у плеча не пересекаются */
    for (let c = 0; c + 1 < C; c++) GP[c] = .0125;
    if (sgI > 0) { for (let c = 0; c < C; c++) T0[c] = -T0[c]; capSpread(T0, GP, C); for (let c = 0; c < C; c++) T0[c] = -T0[c]; } else capSpread(T0, GP, C);
  }
  function capRows(cap) {
    const K = cap.K, C = cap.C, n = cap.n, X = cap.X, A = cap.A, E = cap.E, ST = cap.ST, U = cap.U, MS = CAP_STR;
    /* 4. Нити столбцов; «широта» вдоль нити — накопленный максимум */
    for (let c = 0; c < C; c++) {
      capString(cap, c, E, c * 6, c * 6 + 3);
      const b0 = c * MS * 4; let mx = -Infinity;
      for (let j = 0; j < MS; j++) { const v = b0 + j * 4 + 3; mx = Math.max(mx, ST[v]); ST[v] = mx; }
    }
    /* 5. Строки — поперёк нитей на общей «широте» Λ = широта + CAP_BETA·длина нити (строго растёт): от самого нижнего
          прикрепления до самого высокого начала; столбец ниже своего прикрепления стоит в нём (сухожилие), у начала строки
          подтягиваются к своему началу (смещение затухает как t³). U — доля длины нити (для площади сечения). */
    const SL = cap.SL;
    let lo = Infinity, hi = -Infinity;
    for (let c = 0; c < C; c++) {
      const b0 = c * MS * 4; let sl = 0;
      for (let j = 0; j < MS; j++) {
        const v = b0 + j * 4;
        if (j) sl += Math.sqrt((ST[v] - ST[v - 4]) ** 2 + (ST[v + 1] - ST[v - 3]) ** 2 + (ST[v + 2] - ST[v - 2]) ** 2);
        SL[c * MS + j] = ST[v + 3] + CAP_BETA * sl;
      }
      lo = Math.min(lo, SL[c * MS]); hi = Math.max(hi, SL[c * MS + MS - 1]);
    }
    for (let c = 0; c < C; c++) {
      const b0 = c * MS * 4, s0 = c * MS, l0 = SL[s0], l1 = SL[s0 + MS - 1]; let j = 0, prev = -Infinity;
      for (let q = 0; q < n; q++) {
        const t = q / (n - 1), v = (q * C + c) * 3;
        const tg = Math.max(prev, Math.max(l0, lo + (hi - lo) * t) + (l1 - hi) * t * t * t); prev = tg;
        while (j < MS - 2 && SL[s0 + j + 1] < tg) j++;
        const la = SL[s0 + j], lb = SL[s0 + j + 1], f = lb > la ? Math.min(1, Math.max(0, (tg - la) / (lb - la))) : 0, a = b0 + j * 4;
        X[v] = ST[a] + (ST[a + 4] - ST[a]) * f; X[v + 1] = ST[a + 1] + (ST[a + 5] - ST[a + 1]) * f; X[v + 2] = ST[a + 2] + (ST[a + 6] - ST[a + 2]) * f;
        U[q * C + c] = (j + f) / (MS - 1);
      }
    }
    for (let k = 0; k < K; k++) for (let q = 0; q < n; q++) { const u = U[q * C + 2 * k + 1], r = radiusAt(cap.BODY[k], cap.LN[k] * (cap.rev[k] ? 1 - u : u)); A[k * n + q] = Math.PI * r * r; }
  }
  function capWidth(cap) {
    const C = cap.C, n = cap.n, X = cap.X, NR = cap.NR, B = cap.B, A = cap.A, U = cap.U;
    const hx = CF[0], hy = CF[1], hz = CF[2], ax0 = CF[3], ax1 = CF[4], ax2 = CF[5];
    /* 6. Ширина. Где нити сходятся (у начал на одной прямой с головкой, при сильно поднятой руке), часть была бы уже, чем
          позволяет её сечение при толщине CAP_TMAX. В каждой строке столбцы раздвигаются поперёк волокна b = N × t (положения
          вдоль строки — изотоническая регрессия с шагами: половина нужной ширины части, не больше CAP_WMAX, всего не больше
          CAP_WTOT); у концов нити — плавно до нуля (CAP_UEND), вдоль столбца сдвиги сглажены (CAP_DSMOOTH проходов). Сдвиг —
          по поверхности: по сфере вокруг точки оси плеча на той же высоте (у головки — вокруг центра сустава), не больше
          CAP_AMAX — у диафиза (близко к оси) большой сдвиг закрутил бы пучок вокруг кости */
    capNormals(cap);
    let sgb = 0;
    for (let q = 0; q < n; q++) for (let c = 0; c < C; c++) {
      const v = (q * C + c) * 3, a = (Math.max(0, q - 1) * C + c) * 3, b = (Math.min(n - 1, q + 1) * C + c) * 3;
      let tx = X[b] - X[a], ty = X[b + 1] - X[a + 1], tz = X[b + 2] - X[a + 2]; const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
      const bx = NR[v + 1] * tz - NR[v + 2] * ty, by = NR[v + 2] * tx - NR[v] * tz, bz = NR[v] * ty - NR[v + 1] * tx, bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      B[v] = bx / bl; B[v + 1] = by / bl; B[v + 2] = bz / bl;
      if (c && q && q < n - 1) sgb += (X[v] - X[v - 3]) * (B[v] + B[v - 3]) + (X[v + 1] - X[v - 2]) * (B[v + 1] + B[v - 2]) + (X[v + 2] - X[v - 1]) * (B[v + 2] + B[v - 1]);
    }
    sgb = sgb >= 0 ? 1 : -1;
    const DT = cap.DT; DT.fill(0);
    for (let q = 1; q < n - 1; q++) {
      W[0] = 0;
      for (let c = 1; c < C; c++) {
        const v = (q * C + c) * 3, bx = B[v] + B[v - 3], by = B[v + 1] + B[v - 2], bz = B[v + 2] + B[v - 1], bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        W[c] = W[c - 1] + sgb * ((X[v] - X[v - 3]) * bx + (X[v + 1] - X[v - 2]) * by + (X[v + 2] - X[v - 1]) * bz) / bl;
      }
      let tot = 0;
      for (let c = 0; c + 1 < C; c++) { GP[c] = Math.min(CAP_WMAX, A[(c >> 1) * n + q] / CAP_TMAX * .5 * (c === 0 || c === C - 2 ? CAP_EDGE : 1)); tot += GP[c]; }
      if (tot > CAP_WTOT) for (let c = 0; c + 1 < C; c++) GP[c] *= CAP_WTOT / tot;
      for (let c = 0; c < C; c++) RS[c] = W[c];
      capSpread(RS, GP, C);
      for (let c = 0; c < C; c++) { const u = U[q * C + c]; DT[q * C + c] = (RS[c] - W[c]) * Math.max(0, Math.min(1, u / CAP_UEND, (1 - u) / CAP_UEND)); }
    }
    for (let pass = 0; pass < CAP_DSMOOTH; pass++) for (let c = 0; c < C; c++) {
      let prev = DT[c];
      for (let q = 1; q < n - 1; q++) { const g = q * C + c, cur = DT[g]; DT[g] = .25 * prev + .5 * cur + .25 * DT[g + C]; prev = cur; }
    }
    const RM = CAP_RH + CAP_GAP;
    for (let q = 1; q < n - 1; q++) for (let c = 0; c < C; c++) {
      const g = q * C + c, v = g * 3, d = DT[g] * sgb;
      if (!d) continue;
      const hh = Math.max(0, (X[v] - hx) * ax0 + (X[v + 1] - hy) * ax1 + (X[v + 2] - hz) * ax2), cx = hx + hh * ax0, cy = hy + hh * ax1, cz = hz + hh * ax2;
      let rx = X[v] - cx, ry = X[v + 1] - cy, rz = X[v + 2] - cz; const r = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1; rx /= r; ry /= r; rz /= r;
      const bd = B[v] * rx + B[v + 1] * ry + B[v + 2] * rz;
      let bx = B[v] - bd * rx, by = B[v + 1] - bd * ry, bz = B[v + 2] - bd * rz; const bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1; bx /= bl; by /= bl; bz /= bl;
      const a = Math.max(-CAP_AMAX, Math.min(CAP_AMAX, d / Math.max(r, RM))), ca = Math.cos(a), sa = Math.sin(a), rr = hh > 0 ? r : Math.max(r, RM);
      X[v] = cx + rr * (ca * rx + sa * bx); X[v + 1] = cy + rr * (ca * ry + sa * by); X[v + 2] = cz + rr * (ca * rz + sa * bz);
    }
    capNormals(cap);
  }
  function capThickness(cap) {
    const K = cap.K, C = cap.C, n = cap.n, X = cap.X, A = cap.A, TH = cap.TH;
    /* 7. Толщины: у центра части — из площади многоугольника сечения (тело мышцы — объём сохраняется), не больше CAP_HMAX
          (у средней части — CAP_HMAX2); у шва — среднее соседних центров (CAP_SMOOTH проходов), у края колпака — CAP_EDGE_H
          центра */
    for (let q = 0; q < n; q++) {
      for (let k = 0; k < K; k++) {
        const c = (q * C + 2 * k + 1) * 3, e = k * n + q;
        cap.WL[e] = Math.sqrt((X[c] - X[c - 3]) ** 2 + (X[c + 1] - X[c - 2]) ** 2 + (X[c + 2] - X[c - 1]) ** 2);
        cap.WR[e] = Math.sqrt((X[c] - X[c + 3]) ** 2 + (X[c + 1] - X[c + 4]) ** 2 + (X[c + 2] - X[c + 5]) ** 2);
        TH[q * C + 2 * k + 1] = Math.min(k === 1 ? CAP_HMAX2 : CAP_HMAX, A[e] / Math.max(.2, cap.WL[e] + cap.WR[e]));
      }
      for (let it = 0; it < CAP_SMOOTH; it++) {
        for (let k = 0; k + 1 < K; k++) TH[q * C + 2 * k + 2] = .5 * (TH[q * C + 2 * k + 1] + TH[q * C + 2 * k + 3]);
        for (let k = 0; k < K; k++) TH[q * C + 2 * k + 1] = capSolve(cap, k, q);
      }
      TH[q * C] = CAP_EDGE_H * TH[q * C + 1]; TH[q * C + C - 1] = CAP_EDGE_H * TH[q * C + C - 2];
    }
    /* вдоль волокна толщина сглажена (CAP_TSMOOTH проходов): переход сухожилия в брюшко и соседние строки разной ширины не
       дают ступенек на наружной стороне */
    for (let pass = 0; pass < CAP_TSMOOTH; pass++) for (let c = 0; c < C; c++) {
      let prev = TH[c];
      for (let q = 1; q < n - 1; q++) { const g = q * C + c, cur = TH[g]; TH[g] = .25 * prev + .5 * cur + .25 * TH[g + C]; prev = cur; }
    }
  }
  function capVertices(cap, pos, nor, start) {
    const K = cap.K, C = cap.C, n = cap.n, X = cap.X, NR = cap.NR, TH = cap.TH;
    /* 8. Вершины кольца: 0 — наружу у центра части, 1–3 — шов справа (наружу, середина — у края колпака с кромкой, внутрь),
          4 — внутрь у центра, 5–7 — шов слева; «справа» — по w = N × t, как у трубки */
    for (let k = 0; k < K; k++) {
      const i = cap.lines[k], rev = cap.rev[k], cc = 2 * k + 1;
      let sgr = 0;
      for (let q = 1; q < n - 1; q++) {
        const v = (q * C + cc) * 3, vu = v + C * 3, vd = v - C * 3, g = rev ? -1 : 1, tx = (X[vu] - X[vd]) * g, ty = (X[vu + 1] - X[vd + 1]) * g, tz = (X[vu + 2] - X[vd + 2]) * g;
        sgr += (NR[v + 1] * tz - NR[v + 2] * ty) * (X[v + 3] - X[v - 3]) + (NR[v + 2] * tx - NR[v] * tz) * (X[v + 4] - X[v - 2]) + (NR[v] * ty - NR[v + 1] * tx) * (X[v + 5] - X[v - 1]);
      }
      const cR = sgr >= 0 ? cc + 1 : cc - 1, cL = sgr >= 0 ? cc - 1 : cc + 1;
      for (let q = 0; q < n; q++) {
        const r = rev ? n - 1 - q : q, base = (start[i] + r) * SIDES * 3, v = (q * C + cc) * 3, h = TH[q * C + cc];
        capPut(pos, nor, base, 0, X[v] + NR[v] * h, X[v + 1] + NR[v + 1] * h, X[v + 2] + NR[v + 2] * h, NR[v], NR[v + 1], NR[v + 2]);
        capPut(pos, nor, base, 4, X[v], X[v + 1], X[v + 2], -NR[v], -NR[v + 1], -NR[v + 2]);
        capSeam(pos, nor, base, X, NR, TH, q, C, cc, cR, 1, 2, 3);
        capSeam(pos, nor, base, X, NR, TH, q, C, cc, cL, 7, 6, 5);
      }
    }
  }
  /* Нормаль пласта у узла сетки — наружу поперёк волокна: направление от оси «капсулы» (у головки — от центра сустава, ниже — от
     оси плеча на той же высоте), без составляющей вдоль столбца */
  function capNormals(cap) {
    const X = cap.X, NR = cap.NR, C = cap.C, n = cap.n;
    for (let q = 0; q < n; q++) for (let c = 0; c < C; c++) {
      const v = (q * C + c) * 3, a = (Math.max(0, q - 1) * C + c) * 3, b = (Math.min(n - 1, q + 1) * C + c) * 3;
      const tx = X[b] - X[a], ty = X[b + 1] - X[a + 1], tz = X[b + 2] - X[a + 2], tt = tx * tx + ty * ty + tz * tz;
      let rx = X[v] - CF[0], ry = X[v + 1] - CF[1], rz = X[v + 2] - CF[2];
      const hh = Math.max(0, rx * CF[3] + ry * CF[4] + rz * CF[5]); rx -= hh * CF[3]; ry -= hh * CF[4]; rz -= hh * CF[5];
      const d = tt > 1e-12 ? (rx * tx + ry * ty + rz * tz) / tt : 0;
      let nx = rx - d * tx, ny = ry - d * ty, nz = rz - d * tz, l = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (l < 1e-6) { nx = rx; ny = ry; nz = rz; l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; }
      NR[v] = nx / l; NR[v + 1] = ny / l; NR[v + 2] = nz / l;
    }
    /* вдоль столбца нормаль сглажена (CAP_NSMOOTH проходов): излом нити на 20–30° не поворачивает толщину скачком */
    for (let pass = 0; pass < CAP_NSMOOTH; pass++) for (let c = 0; c < C; c++) {
      let px = NR[c * 3], py = NR[c * 3 + 1], pz = NR[c * 3 + 2];
      for (let q = 1; q < n - 1; q++) {
        const v = (q * C + c) * 3, w = v + C * 3, cx = NR[v], cy = NR[v + 1], cz = NR[v + 2];
        const x = .25 * px + .5 * cx + .25 * NR[w], y = .25 * py + .5 * cy + .25 * NR[w + 1], z = .25 * pz + .5 * cz + .25 * NR[w + 2], l = Math.sqrt(x * x + y * y + z * z) || 1;
        NR[v] = x / l; NR[v + 1] = y / l; NR[v + 2] = z / l; px = cx; py = cy; pz = cz;
      }
    }
  }
  function capPut(pos, nor, base, j, x, y, z, nx, ny, nz) { const w = base + j * 3; pos[w] = x; pos[w + 1] = y; pos[w + 2] = z; if (nor) { nor[w] = nx; nor[w + 1] = ny; nor[w + 2] = nz; } }
  /* вершины шва (или края колпака) столбца cs у части с центром cc: наружу, середина (у края — с кромкой наружу), внутрь */
  function capSeam(pos, nor, base, X, NR, TH, q, C, cc, cs, jt, jm, jb) {
    const s = (q * C + cs) * 3, v = (q * C + cc) * 3, hs = TH[q * C + cs], edge = cs === 0 || cs === C - 1;
    let lx = X[s] - X[v], ly = X[s + 1] - X[v + 1], lz = X[s + 2] - X[v + 2]; const ld = lx * NR[s] + ly * NR[s + 1] + lz * NR[s + 2]; lx -= ld * NR[s]; ly -= ld * NR[s + 1]; lz -= ld * NR[s + 2];
    const ll = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1; lx /= ll; ly /= ll; lz /= ll;
    const e = edge ? CAP_TIP * hs : 0;
    capPut(pos, nor, base, jt, X[s] + NR[s] * hs, X[s + 1] + NR[s + 1] * hs, X[s + 2] + NR[s + 2] * hs, NR[s], NR[s + 1], NR[s + 2]);
    capPut(pos, nor, base, jm, X[s] + NR[s] * hs * .5 + lx * e, X[s + 1] + NR[s + 1] * hs * .5 + ly * e, X[s + 2] + NR[s + 2] * hs * .5 + lz * e, lx, ly, lz);
    capPut(pos, nor, base, jb, X[s], X[s + 1], X[s + 2], -NR[s], -NR[s + 1], -NR[s + 2]);
  }
  /* Площадь многоугольника сечения части k в строке q как функция толщины h у центра: точки — в плоскости поперёк волокна
     (вдоль строки, вдоль нормали центра): центр снаружи (0, h) и на кости (0, 0), швы — снаружи, середина, на кости (толщина
     шва TH; у края колпака — доля CAP_EDGE_H от h и скруглённая кромка). Площадь квадратична по h; AR — её значения при
     h = 0, 1, 2 (подготовка — один раз). */
  const CSW = new Float64Array(10), AR = new Float64Array(3), PXY = new Float64Array(16);
  function capArea3(cap, k, q) {
    const C = cap.C, X = cap.X, NR = cap.NR, TH = cap.TH, cc = 2 * k + 1, v = (q * C + cc) * 3;
    const nx = NR[v], ny = NR[v + 1], nz = NR[v + 2], ox = X[v], oy = X[v + 1], oz = X[v + 2];
    let px = X[v + 3] - X[v - 3], py = X[v + 4] - X[v - 2], pz = X[v + 5] - X[v - 1]; const pd = px * nx + py * ny + pz * nz; px -= pd * nx; py -= pd * ny; pz -= pd * nz;
    const pl = Math.sqrt(px * px + py * py + pz * pz) || 1; px /= pl; py /= pl; pz /= pl;
    /* по стороне: su, sv — шов на кости, mu, mv — нормаль шва, край ли, толщина шва */
    for (let side = 0; side < 2; side++) {
      const cs = side ? cc - 1 : cc + 1, s = (q * C + cs) * 3, o = side * 5, sx = X[s] - ox, sy = X[s + 1] - oy, sz = X[s + 2] - oz;
      CSW[o] = sx * px + sy * py + sz * pz; CSW[o + 1] = sx * nx + sy * ny + sz * nz;
      CSW[o + 2] = NR[s] * px + NR[s + 1] * py + NR[s + 2] * pz; CSW[o + 3] = NR[s] * nx + NR[s + 1] * ny + NR[s + 2] * nz;
      CSW[o + 4] = cs === 0 || cs === C - 1 ? -1 : TH[q * C + cs];
    }
    for (let i = 0; i < 3; i++) {
      const h = i;
      let j = 0;
      PXY[j++] = 0; PXY[j++] = h;
      for (let side = 0; side < 2; side++) {
        const o = side * 5, su = CSW[o], sv = CSW[o + 1], mu = CSW[o + 2], mv = CSW[o + 3], edge = CSW[o + 4] < 0, hs = edge ? CAP_EDGE_H * h : CSW[o + 4], e = edge ? CAP_TIP * hs : 0;
        const t0 = side ? 0 : hs, t2 = side ? hs : 0, sg = side ? -1 : 1;
        PXY[j++] = su + mu * t0; PXY[j++] = sv + mv * t0;
        PXY[j++] = su + mu * hs * .5 + sg * e; PXY[j++] = sv + mv * hs * .5;
        PXY[j++] = su + mu * t2; PXY[j++] = sv + mv * t2;
        if (!side) { PXY[j++] = 0; PXY[j++] = 0; }
      }
      let a = 0; for (let m = 0; m < 8; m++) { const m2 = (m + 1) & 7; a += PXY[m * 2] * PXY[m2 * 2 + 1] - PXY[m2 * 2] * PXY[m * 2 + 1]; }
      AR[i] = Math.abs(a / 2);
    }
  }
  /* толщина у центра части k в строке q: корень квадратного уравнения площади, в пределах 0,3…3 средней толщины
     η = A / ширина и не больше CAP_HMAX (CAP_HMAX2 у средней части) */
  function capSolve(cap, k, q) {
    capArea3(cap, k, q);
    const A = cap.A[k * cap.n + q], a0 = AR[0], a1 = AR[1], a2 = AR[2];
    const c = (a2 - 2 * a1 + a0) / 2, b = a1 - a0 - c, r = A - a0;
    let h = Math.abs(c) < 1e-9 ? r / (b || 1e-9) : (-b + Math.sqrt(Math.max(0, b * b + 4 * c * r))) / (2 * c);
    const eta = A / Math.max(.2, cap.WL[k * cap.n + q] + cap.WR[k * cap.n + q]);
    if (!(h > 0)) h = eta;
    return Math.min(k === 1 ? CAP_HMAX2 : CAP_HMAX, Math.max(.3 * eta, Math.min(3 * eta, h)));
  }
  /* ---------- стенки: пласты по поверхности тела (брюшная стенка и бок груди, формат данных 3, поле walls) ----------
     Прямая, наружная и внутренняя косые живота, передняя зубчатая и малая грудная рисуются не по линиям действия (пути
     MyoBack и DAS3 — хорды для силы, на 25–100 % внутри грудной клетки), а пластом по поверхности тела: форма — по анатомии
     (tools/muscles/walls.js, README, «Стенки»), пути и работа мышц прежние. Пласт мышцы — полосы её линий (кольца по 8 вершин,
     как у трубок и лент: слой мышц и проверки не меняются); полоса k в строке q — три узла: левый край, середина, правый
     край; соседние полосы делят узел шва (общие вершины — щели нет), у зубцов и наружных краёв край свой.
     Узел — точка «опорной» стороны пласта (datum: 0 — наружная, 1 — глубокая) и толщина (см) в нейтральной позе:
     - 0 — у кожи корпуса: точка в рамке сечения кожи на высоте h (Mannequin.torsoPointIn: боковая и передняя схемы изгиба
       у шарниров поясницы, доля передней kf) — движется вместе с кожей над ней;
     - 1 — на кости (жёстко);
     - 2 — смесь 0 и 1 с весом w (у лобка, гребня таза, рёберной дуги — живот гнётся, кости нет);
     - 3 — «скольжение» по наружной поверхности рёбер (оболочка shells — радиус в рамке грудной клетки по азимуту и высоте):
       между точкой на ребре и точкой на подвижной кости (лопатка) с долей f — по азимуту и высоте, радиус — оболочка плюс
       зазор; у малой грудной у клювовидного отростка пласт поднимается к нему (lift);
     - 4 — между кожей и рёбрами: «потолок» — точка у кожи (как 0), «пол» — точка на грудной клетке (жёстко); опорная сторона —
       пол (pref 1: пласт лежит на рёбрах — наружная косая у зубцов) или потолок (pref 0: прямая над хрящами); в позах, где кожа
       и рёбра сходятся (скручивание с поворотом — кожа гнётся плавно, грудная клетка — целиком), пласт сжимается между ними
       (не тоньше 0,3 своей толщины), а не выходит из кожи или уходит в рёбра;
     - 5 — у тазобедренного сустава (этап В: ягодичные): точка в рамке таза, повёрнутая вокруг центра головки бедра на долю w
       поворота бедра относительно таза (0 — жёстко с тазом у начала на гребне и крестце, 1 — с бедром у прикрепления; ось и
       угол поворота — один раз на кадр): пласт обходит сустав дугой на своём расстоянии от центра, как кожа корпуса у
       шарниров поясницы, — в глубоком сгибании он растягивается, а не сминается по хордам линий действия.
     Полосы линии (этап В): у линии может быть несколько соседних полос (lineOf — линия каждой полосы); её кольца идут змейкой
     — первая полоса от строки 0, вторая обратно, … — и кольцо конца одной полосы соединено с кольцом конца соседней той же
     строки: общий шов совпадает, остальное — торец пласта (так у большой ягодичной 7 полос на 3 линии модели).
     Толщина в кадре — нейтральная × σ: σ — отношение площади полосы у строки в нейтральной позе к нынешней (объём части
     сохраняется: растянутая кожей полоса тоньше, сжатая — толще). Нормаль — по опорной поверхности (средняя четырёхугольников
     вокруг узла), знак — наружу. */
  const MQ = typeof Mannequin !== 'undefined' ? Mannequin : (typeof require === 'function' ? require('./09bm-mannequin.js') : null);
  const WALL_ROUND = .5, WALL_SIG0 = .6, WALL_SIG1 = 1.7, WALL_FLOOR = .1, WALL_COS = .5, WALL_LIFT = .6, WALL_HIPMIN = 2, WALL_HIPCORE = 6.5;
  /* рамки корпуса кадра: таз (крестец), поясница (L5, начало — на высоте шарнира 15 см), грудная клетка; шарниры 1 (L5/S1) и
     2 (L2/L3): ось (в рамке нижнего сегмента) и половина угла поворота — как hingeTurn в 09bm-mannequin.js */
  const WT = new Float64Array(3 * 12 + 2 * 4);
  function wallTorso(T, m) {
    WSP_k = -1;
    for (let s = 0; s < 3; s++) {
      const o = T.bones[s] * 12, b = s * 12;
      for (let r = 0; r < 3; r++) { WT[b + r] = m[o + r * 4 + 3]; WT[b + 3 + r] = m[o + r * 4]; WT[b + 6 + r] = m[o + r * 4 + 1]; WT[b + 9 + r] = m[o + r * 4 + 2]; }
    }
    /* начало рамки поясницы — у шарника L5/S1: позвонок L5 стоит на своей высоте (Mannequin.vertebraFrame) */
    for (let r = 0; r < 3; r++) WT[12 + r] -= WT[18 + r] * T.l5;
    for (let j = 0; j < 2; j++) {
      const a = j * 12, c = (j + 1) * 12, R = new Array(9);
      for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) R[i * 3 + k] = WT[a + 3 + i * 3] * WT[c + 3 + k * 3] + WT[a + 4 + i * 3] * WT[c + 4 + k * 3] + WT[a + 5 + i * 3] * WT[c + 5 + k * 3];
      /* кватернион по матрице (Q.fromM3 манекена) */
      const t = R[0] + R[4] + R[8]; let w, x, y, z;
      if (t > 0) { const s = Math.sqrt(t + 1) * 2; w = .25 * s; x = (R[7] - R[5]) / s; y = (R[2] - R[6]) / s; z = (R[3] - R[1]) / s; }
      else if (R[0] > R[4] && R[0] > R[8]) { const s = Math.sqrt(1 + R[0] - R[4] - R[8]) * 2; w = (R[7] - R[5]) / s; x = .25 * s; y = (R[1] + R[3]) / s; z = (R[2] + R[6]) / s; }
      else if (R[4] > R[8]) { const s = Math.sqrt(1 + R[4] - R[0] - R[8]) * 2; w = (R[2] - R[6]) / s; x = (R[1] + R[3]) / s; y = .25 * s; z = (R[5] + R[7]) / s; }
      else { const s = Math.sqrt(1 + R[8] - R[0] - R[4]) * 2; w = (R[3] - R[1]) / s; x = (R[2] + R[6]) / s; y = (R[5] + R[7]) / s; z = .25 * s; }
      let l = Math.sqrt(w * w + x * x + y * y + z * z) || 1; w /= l; x /= l; y /= l; z /= l; if (w < 0) { w = -w; x = -x; y = -y; z = -z; }
      const half = Math.acos(Math.max(-1, Math.min(1, w))), sn = Math.sin(half), o = 36 + j * 4;
      if (sn < 1e-9) { WT[o] = 1; WT[o + 1] = 0; WT[o + 2] = 0; } else { WT[o] = x / sn; WT[o + 1] = y / sn; WT[o + 2] = z / sn; }
      WT[o + 3] = half;
    }
  }
  /* точка узла у кожи по схеме: код 0–2 — жёсткий сегмент (таз, поясница, грудная клетка), 3–4 — скругление у шарнира 1–2
     с долей поворота w; V — вектор в рамке сегмента (у шарнира — от его оси) */
  const WP = new Float64Array(3);
  /* последний поворот у шарнира (код, доля, cos, sin): у узлов одной строки стенки доля одна — синус и косинус не считаются заново;
     сброс — с новыми рамками корпуса (wallTorso) */
  let WSP_k = -1, WSP_w = 0, WSP_c = 1, WSP_s = 0;
  function wallSkinPoint(code, w, V, o, piv) {
    if (code < 3) { const b = code * 12; for (let r = 0; r < 3; r++) WP[r] = WT[b + r] + WT[b + 3 + r] * V[o] + WT[b + 6 + r] * V[o + 1] + WT[b + 9 + r] * V[o + 2]; return; }
    const j = code - 3, b = j * 12, q = 36 + j * 4, kx = WT[q], ky = WT[q + 1], kz = WT[q + 2], vx = V[o], vy = V[o + 1], vz = V[o + 2];
    if (code !== WSP_k || w !== WSP_w) { const an = 2 * WT[q + 3] * w; WSP_k = code; WSP_w = w; WSP_c = Math.cos(an); WSP_s = Math.sin(an); }
    const c = WSP_c, s = WSP_s;
    const kv = (kx * vx + ky * vy + kz * vz) * (1 - c), rx = vx * c + (ky * vz - kz * vy) * s + kx * kv + piv[j * 3], ry = vy * c + (kz * vx - kx * vz) * s + ky * kv + piv[j * 3 + 1], rz = vz * c + (kx * vy - ky * vx) * s + kz * kv + piv[j * 3 + 2];
    for (let r = 0; r < 3; r++) WP[r] = WT[b + r] + WT[b + 3 + r] * rx + WT[b + 6 + r] * ry + WT[b + 9 + r] * rz;
  }
  /* оболочка рёбер: радиус в рамке грудной клетки на азимуте th (°, 0 — вперёд, 90 — вбок) и высоте y; −1 — рёбер нет */
  function shellR(S, th, y) {
    const x = (th - S.th0) / S.dth, z = (y - S.y0) / S.dy, i = Math.floor(x), j = Math.floor(z); let s = 0, w = 0;
    for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
      const ii = i + di, jj = j + dj; if (ii < 0 || ii >= S.NT || jj < 0 || jj >= S.NY) continue;
      const r = S.r[jj * S.NT + ii]; if (r < 0) continue;
      const ww = (1 - Math.abs(x - ii)) * (1 - Math.abs(z - jj)); s += r * ww; w += ww;
    }
    return w > .2 ? s / w : -1;
  }
  function bindWalls(md, bound, idx, skel) {
    const at = new Map(bound.map((mu, i) => [mu.name, i])), walls = [];
    if (!md.walls || !md.walls.length || !MQ) return walls;
    /* оболочка рёбер: радиусы — в 0,1 мм, −1 — рёбер нет */
    const shells = {};
    for (const [s, sh] of Object.entries(md.shells || {})) shells[s] = { ...sh, r: Float64Array.from(sh.r, v => (v < 0 ? -1 : v / 100)) };
    /* кожа у тазобедренного сустава (ягодичные, этап В): радиус кожи из центра головки бедра по направлению — корпус в рамке таза (p)
       и бедро в рамке бедра (f), сетка по азимуту и наклону; в 0,01 см */
    const hips = {};
    for (const [s, H] of Object.entries(md.hips || {})) hips[s] = { ...H, p: Float64Array.from(H.p, v => v / 100), f: Float64Array.from(H.f, v => v / 100) };
    const T = { bones: [idx.get('sacrum|'), idx.get('L5|'), idx.get('ribcage|')], l5: 0, rib: idx.get('ribcage|') };
    if (T.bones.some(i => i === undefined)) return walls;
    const B = MQ.B, PIV = [0, B.lumbar[1] + B.lumbarPivot[1], B.lumbarPivot[2], 0, B.thoracic[1] + B.thoracicPivot[1], B.thoracicPivot[2]];
    const SEG_H = [0, B.lumbar[1], B.lumbar[1] + B.thoracic[1]];
    /* начало рамки поясницы — на высоте шарнира L5/S1; позвонок L5 стоит выше на свою высоту (bones[].h, Mannequin.vertebraFrame) */
    T.l5 = skel.bones[T.bones[1]].h - B.lumbar[1];
    /* схема изгиба кожи на высоте h: код и доля (как spineFrame) */
    const scheme = (h, zones) => {
      for (const [j, hj, lo, hi, e = 0] of zones) if (h > hj - lo && h < hj + hi) return [2 + j, MQ.ramp((h - hj + lo) / (lo + hi), e)];
      return [h < SEG_H[1] ? 0 : h < SEG_H[2] ? 1 : 2, 0];
    };
    for (const W of md.walls) {
      const lineIdx = W.lines.map(nm => at.get(nm));
      if (lineIdx.some(i => i === undefined)) continue;
      const bones = W.bones.map(b => { const i = idx.get(b[0] + '|' + (b[1] || '')); if (i === undefined) throw Error('muscles: wall bone ' + b.join(' ')); return i; });
      /* полосы линий: lineOf — линия каждой полосы (по умолчанию полоса на линию); у второй, третьей… полосы линии свои кольца
         после колец предыдущей (r0), строки — змейкой (dir) */
      const lineOf = W.lineOf || lineIdx.map((_, k) => k), K = lineOf.length, n = W.n, lines = lineOf.map(j => lineIdx[j]);
      const r0 = new Uint16Array(K), dir = new Uint8Array(K), cntL = new Map();
      lineOf.forEach((j, k) => { const c = cntL.get(j) || 0; r0[k] = c * n; dir[k] = c & 1; cntL.set(j, c + 1); });
      const N = W.nodes.length, f = c => new Float64Array(c);
      const wall = { key: W.key, side: W.side, lines, lineIdx, lineOf, r0, dir, K, n, N, T, shell: W.noRib ? null : shells[W.side] || null, flip: W.flip || 1, rev: Uint8Array.from(W.rev),
        kind: new Uint8Array(N), datum: new Uint8Array(N), t0: f(N), code: new Uint8Array(N * 2), w: f(N * 2), V: f(N * 6), kf: f(N), bone: new Int32Array(N),
        bp: f(N * 3), mix: f(N), g: f(N * 6), P: f(N * 3), NR: f(N * 3), TH: f(N), SG: f(K * n), AR: f(K * n), A0: f(K * n), CL: f(N * 3),
        rows: Int32Array.from(W.strips.flat()), own: new Uint8Array(N), piv: PIV, hip: null,
        /* рабочие массивы кадра — сразу в объекте (у всех стенок одна форма объекта: доступ к полям в циклах по узлам не
           замедляется): HD, HA, HB — прижатие узлов 6 к коже (wallNodes, hipPull), OF, OF2 — сдвиг на толщину у сустава
           (wallOffsets), cnt — число строк узла, m — матрицы кадра на время wallNormals */
        HD: null, HA: null, HB: null, OF: null, OF2: null, cnt: new Uint8Array(N), m: null };
      /* узлы 5: таз и бедро своей стороны, центр головки бедра в рамке таза и поворот бедра относительно таза в нейтральной позе */
      if (W.hip) wall.hip = { p: bones[W.hip.pelvis], f: bones[W.hip.femur], c: W.hip.c, R0: W.hip.R0, map: hips[W.side] || null, cap: W.hip.cap || 0 };
      W.nodes.forEach((nd, v) => {
        const k = nd[0]; wall.kind[v] = k;
        if (k === 0 || k === 2 || k === 4) {
          const [, h, kf, lx, lz] = nd;
          for (const [s, zones] of [[0, MQ.TORSO_BLEND], [1, MQ.TORSO_BLEND_FRONT]]) {
            const [code, w] = scheme(h, zones); wall.code[v * 2 + s] = code; wall.w[v * 2 + s] = w;
            const o = (v * 2 + s) * 3;
            if (code < 3) { wall.V[o] = lx; wall.V[o + 1] = h - SEG_H[code]; wall.V[o + 2] = lz; }
            else { const j = code - 3; wall.V[o] = lx - PIV[j * 3]; wall.V[o + 1] = h - SEG_H[j] - PIV[j * 3 + 1]; wall.V[o + 2] = lz - PIV[j * 3 + 2]; }
          }
          wall.kf[v] = h > MQ.FRONT_H[0] && h < MQ.FRONT_H[1] ? kf : 0;
        }
        if (k === 1) { wall.bone[v] = bones[nd[1]]; wall.bp.set(nd.slice(2, 5), v * 3); }
        if (k === 2) { wall.bone[v] = bones[nd[5]]; wall.bp.set(nd.slice(6, 9), v * 3); wall.mix[v] = nd[9]; }
        if (k === 4) { wall.bone[v] = bones[nd[5]]; wall.bp.set(nd.slice(6, 9), v * 3); }
        if (k === 3) { wall.g.set([nd[1], nd[2], nd[7], nd[8], nd[9], 0], v * 6); wall.bone[v] = bones[nd[3]]; wall.bp.set(nd.slice(4, 7), v * 3); }
        if (k === 5 || k === 6) { if (!wall.hip) throw Error('muscles: wall ' + W.key + ': hip nodes without hip data'); wall.bp.set(nd.slice(1, 4), v * 3); wall.mix[v] = nd[4]; wall.bone[v] = wall.hip.p; if (k === 6) { if (!wall.hip.map) throw Error('muscles: wall ' + W.key + ': no hip skin map'); wall.g[v * 6] = nd[5]; } }
        wall.datum[v] = k === 3 ? 1 : nd[nd.length - 2]; wall.t0[v] = nd[nd.length - 1];
      });
      /* узел шва двух полос — общий: σ узла — среднее по его строкам; own — у скольких полос узел свой (1 — край) */
      const cnt = new Uint8Array(N); for (const v of wall.rows) cnt[v]++;
      for (let k = 0; k < K; k++) for (let q = 0; q < n; q++) for (const e of [0, 2]) { const v = wall.rows[(k * n + q) * 3 + e]; if (cnt[v] < 2) wall.own[v] = 1; }
      W.a0.forEach((a, k) => wall.A0.set(a, k * n));
      lineIdx.forEach((i, j) => { bound[i].wall = wall; bound[i].wallK = lineOf.indexOf(j); bound[i].rings = n * cntL.get(j); });
      walls.push(wall);
    }
    return walls;
  }
  /* опорная точка каждого узла кадра → wall.P */
  /* поворот бедра относительно таза кадра (узлы 5): ось (в рамке таза) и угол — по кватерниону R = Rтаз^T·Rбедро·R0^T */
  const HP = new Float64Array(4);
  function wallHip(wall, m) {
    const p = wall.hip.p * 12, fm = wall.hip.f * 12, R0 = wall.hip.R0, A = new Array(9), R = new Array(9);
    /* A = Rтаз^T · Rбедро (столбцы матриц костей — оси рамок) */
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i * 3 + j] = m[p + i] * m[fm + j] + m[p + 4 + i] * m[fm + 4 + j] + m[p + 8 + i] * m[fm + 8 + j];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[i * 3 + j] = A[i * 3] * R0[j * 3] + A[i * 3 + 1] * R0[j * 3 + 1] + A[i * 3 + 2] * R0[j * 3 + 2];
    const t = R[0] + R[4] + R[8]; let w, x, y, z;
    if (t > 0) { const s = Math.sqrt(t + 1) * 2; w = .25 * s; x = (R[7] - R[5]) / s; y = (R[2] - R[6]) / s; z = (R[3] - R[1]) / s; }
    else if (R[0] > R[4] && R[0] > R[8]) { const s = Math.sqrt(1 + R[0] - R[4] - R[8]) * 2; w = (R[7] - R[5]) / s; x = .25 * s; y = (R[1] + R[3]) / s; z = (R[2] + R[6]) / s; }
    else if (R[4] > R[8]) { const s = Math.sqrt(1 + R[4] - R[0] - R[8]) * 2; w = (R[2] - R[6]) / s; x = (R[1] + R[3]) / s; y = .25 * s; z = (R[5] + R[7]) / s; }
    else { const s = Math.sqrt(1 + R[8] - R[0] - R[4]) * 2; w = (R[3] - R[1]) / s; x = (R[2] + R[6]) / s; y = (R[5] + R[7]) / s; z = .25 * s; }
    if (w < 0) { w = -w; x = -x; y = -y; z = -z; }
    const sn = Math.sqrt(x * x + y * y + z * z);
    if (sn < 1e-9) { HP[0] = 1; HP[1] = 0; HP[2] = 0; HP[3] = 0; } else { HP[0] = x / sn; HP[1] = y / sn; HP[2] = z / sn; HP[3] = 2 * Math.atan2(sn, w); }
    /* центр головки бедра в каталоге — начало рамки бедра */
    HC[0] = m[fm + 3]; HC[1] = m[fm + 7]; HC[2] = m[fm + 11];
  }
  const HC = new Float64Array(3);
  /* радиус кожи у сустава по направлению (lx, ly, lz) в рамке кости: карта map.p (корпус, рамка таза) или map.f (бедро) */
  function hipMap(H, arr, lx, ly, lz) {
    const el = Math.asin(Math.max(-1, Math.min(1, ly))), az = Math.atan2(lx, lz);
    let x = (az - H.az0) / H.daz, y = (el - H.el0) / H.del; x = ((x % H.NA) + H.NA) % H.NA; y = Math.max(0, Math.min(H.NE - 1.0001, y));
    const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, i1 = (i + 1) % H.NA;
    return (arr[j * H.NA + i] * (1 - u) + arr[j * H.NA + i1] * u) * (1 - v) + (arr[(j + 1) * H.NA + i] * (1 - u) + arr[(j + 1) * H.NA + i1] * u) * v;
  }
  /* радиус кожи (объединение корпуса и бедра) из центра головки по направлению мира (dx, dy, dz) */
  function hipSkin(wall, m, dx, dy, dz) {
    const H = wall.hip.map, p = wall.hip.p * 12, f = wall.hip.f * 12;
    const a = hipMap(H, H.p, m[p] * dx + m[p + 4] * dy + m[p + 8] * dz, m[p + 1] * dx + m[p + 5] * dy + m[p + 9] * dz, m[p + 2] * dx + m[p + 6] * dy + m[p + 10] * dz);
    const b = hipMap(H, H.f, m[f] * dx + m[f + 4] * dy + m[f + 8] * dz, m[f + 1] * dx + m[f + 5] * dy + m[f + 9] * dz, m[f + 2] * dx + m[f + 6] * dy + m[f + 10] * dz);
    return a > b ? a : b;
  }
  function wallNodes(wall, m) {
    const N = wall.N, P = wall.P, S = wall.shell, ri = wall.T.rib * 12, kind = wall.kind, code = wall.code, cw = wall.w, V = wall.V, piv = wall.piv, KF = wall.kf, bone = wall.bone, mix = wall.mix, bp = wall.bp;
    if (wall.hip) wallHip(wall, m);
    for (let v = 0; v < N; v++) {
      const k = kind[v], o = v * 3;
      if (k === 5 || k === 6) {
        /* поворот на долю w вокруг центра головки бедра (в рамке таза), затем — рамкой таза в каталог */
        const c = wall.hip.c, px = bp[o] - c[0], py = bp[o + 1] - c[1], pz = bp[o + 2] - c[2], an = HP[3] * mix[v], cs = Math.cos(an), sn = Math.sin(an);
        const kx = HP[0], ky = HP[1], kz = HP[2], kv = (kx * px + ky * py + kz * pz) * (1 - cs);
        const lx = px * cs + (ky * pz - kz * py) * sn + kx * kv + c[0], ly = py * cs + (kz * px - kx * pz) * sn + ky * kv + c[1], lz = pz * cs + (kx * py - ky * px) * sn + kz * kv + c[2];
        const b = wall.hip.p * 12;
        for (let r = 0; r < 3; r++) P[o + r] = m[b + r * 4] * lx + m[b + r * 4 + 1] * ly + m[b + r * 4 + 2] * lz + m[b + r * 4 + 3];
        if (k === 6) {
          /* у кожи ягодицы: по тому же направлению из центра головки — не дальше глубины d под кожей (объединение корпуса и бедра):
             где поворот на долю w вынес точку из тела (в глубоком сгибании — между ягодицей и бедром), она возвращается под кожу */
          let dx = P[o] - HC[0], dy = P[o + 1] - HC[1], dz = P[o + 2] - HC[2]; const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1; dx /= dl; dy /= dl; dz /= dl;
          const r = Math.min(dl, Math.max(WALL_HIPMIN, hipSkin(wall, m, dx, dy, dz) - wall.g[v * 6]));
          P[o] = HC[0] + dx * r; P[o + 1] = HC[1] + dy * r; P[o + 2] = HC[2] + dz * r;
          const HD = wall.HD || (wall.HD = new Float64Array(N * 5)); HD[v * 5] = dx; HD[v * 5 + 1] = dy; HD[v * 5 + 2] = dz; HD[v * 5 + 3] = dl; HD[v * 5 + 4] = dl - r;
        }
        continue;
      }
      if (k === 0 || k === 2 || k === 4) {
        wallSkinPoint(code[v * 2], cw[v * 2], V, v * 6, piv);
        let x = WP[0], y = WP[1], z = WP[2]; const kf = KF[v];
        if (kf > 0) { wallSkinPoint(code[v * 2 + 1], cw[v * 2 + 1], V, v * 6 + 3, piv); x += (WP[0] - x) * kf; y += (WP[1] - y) * kf; z += (WP[2] - z) * kf; }
        if (k === 2) { const b = bone[v] * 12, w = mix[v], p = bp; for (let r = 0; r < 3; r++) { const q = m[b + r * 4] * p[o] + m[b + r * 4 + 1] * p[o + 1] + m[b + r * 4 + 2] * p[o + 2] + m[b + r * 4 + 3]; if (r === 0) x += (q - x) * w; else if (r === 1) y += (q - y) * w; else z += (q - z) * w; } }
        if (k === 4) {
          /* потолок — у кожи, пол — на кости; опорная (P) — по pref (datum), другая — в CL */
          const CL = wall.CL, b = bone[v] * 12, p = bp;
          const fx = m[b] * p[o] + m[b + 1] * p[o + 1] + m[b + 2] * p[o + 2] + m[b + 3], fy = m[b + 4] * p[o] + m[b + 5] * p[o + 1] + m[b + 6] * p[o + 2] + m[b + 7], fz = m[b + 8] * p[o] + m[b + 9] * p[o + 1] + m[b + 10] * p[o + 2] + m[b + 11];
          if (wall.datum[v]) { CL[o] = x; CL[o + 1] = y; CL[o + 2] = z; x = fx; y = fy; z = fz; } else { CL[o] = fx; CL[o + 1] = fy; CL[o + 2] = fz; }
        }
        P[o] = x; P[o + 1] = y; P[o + 2] = z;
      } else if (k === 1) {
        const b = bone[v] * 12, p = bp;
        for (let r = 0; r < 3; r++) P[o + r] = m[b + r * 4] * p[o] + m[b + r * 4 + 1] * p[o + 1] + m[b + r * 4 + 2] * p[o + 2] + m[b + r * 4 + 3];
      } else {
        /* скольжение: подвижная точка → рамка грудной клетки (азимут, высота, радиус) */
        const b = bone[v] * 12, p = bp, g = wall.g, gs = wall.side === 'R' ? -1 : 1;
        let wx = 0, wy = 0, wz = 0;
        for (let r = 0; r < 3; r++) { const q = m[b + r * 4] * p[o] + m[b + r * 4 + 1] * p[o + 1] + m[b + r * 4 + 2] * p[o + 2] + m[b + r * 4 + 3]; if (r === 0) wx = q; else if (r === 1) wy = q; else wz = q; }
        const dx = wx - m[ri + 3], dy = wy - m[ri + 7], dz = wz - m[ri + 11];
        const lx = m[ri] * dx + m[ri + 4] * dy + m[ri + 8] * dz, ly = m[ri + 1] * dx + m[ri + 5] * dy + m[ri + 9] * dz, lz = m[ri + 2] * dx + m[ri + 6] * dy + m[ri + 10] * dz - S.zc;
        const thS = Math.atan2(gs * lx, lz) * 180 / Math.PI, rS = Math.sqrt(lx * lx + lz * lz), f = g[v * 6 + 2], th = g[v * 6] + (thS - g[v * 6]) * f, y = g[v * 6 + 1] + (ly - g[v * 6 + 1]) * f;
        const rA = shellR(S, g[v * 6], g[v * 6 + 1]), shS = shellR(S, thS, ly), sh = shellR(S, th, y), c0 = g[v * 6 + 3], lift = g[v * 6 + 4];
        let r = sh > 0 ? sh : (rA > 0 ? rA : rS) + ((shS > 0 ? shS : rS) - (rA > 0 ? rA : rS)) * f;
        /* зазор над рёбрами c0; с lift > 0 (малая грудная) пласт идёт от ребра к подвижной точке по плавной кривой (доля
           min(1, lift·s(f)) радиуса: низ пласта у клювовидного отростка — на t0 под ним) и не ниже оболочки рёбер под узлом.
           Подъём считается от ребра, а не от оболочки под отростком: при поднятой лопатке (шраги) отросток выше верха грудной
           клетки, оболочка под ним узкая — от неё пласт ушёл бы из кожи */
        if (lift > 0) {
          const s = f * f * (3 - 2 * f), rB = (rA > 0 ? rA : rS) + c0, rC = rB + (rS - wall.t0[v] - rB) * Math.min(1, lift * s);
          r = sh > 0 ? Math.max(sh + c0, rC) : rC;
        } else r += c0;
        const a = th * Math.PI / 180, qx = gs * Math.sin(a) * r, qz = S.zc + Math.cos(a) * r;
        for (let k2 = 0; k2 < 3; k2++) P[o + k2] = m[ri + k2 * 4] * qx + m[ri + k2 * 4 + 1] * y + m[ri + k2 * 4 + 2] * qz + m[ri + k2 * 4 + 3];
      }
    }
    if (wall.HD) hipPull(wall);
  }
  /* прижатие узлов 6 к коже (HD: направление из центра головки, радиус до прижатия, на сколько прижат) — по сетке без ступенек:
     в глубоком сгибании соседние строки попадают одна в складку между ягодицей и бедром (прижатие до 6 см), другая — на бедро
     (1–2 см), и верх пласта шёл волнами. Прижатие узла — не меньше среднего по соседям (два прохода), так что узел остаётся под
     кожей, а перепад между соседями сглажен */
  function hipPull(wall) {
    const { N, n, K, P, HD } = wall, C2 = 2 * K + 1;
    if (N !== n * C2) return;
    const A = wall.HA || (wall.HA = new Float64Array(N)), B = wall.HB || (wall.HB = new Float64Array(N));
    for (let v = 0; v < N; v++) A[v] = wall.kind[v] === 6 ? HD[v * 5 + 4] : 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let q = 0; q < n; q++) for (let c = 0; c < C2; c++) {
        const v = q * C2 + c; let s = 2 * A[v], w = 2;
        if (q > 0) { s += A[v - C2]; w++; } if (q < n - 1) { s += A[v + C2]; w++; } if (c > 0) { s += A[v - 1]; w++; } if (c < C2 - 1) { s += A[v + 1]; w++; }
        B[v] = s / w;
      }
      for (let v = 0; v < N; v++) A[v] = Math.max(A[v], B[v]);
    }
    for (let v = 0; v < N; v++) {
      if (wall.kind[v] !== 6) continue;
      const o = v * 3, r = Math.max(WALL_HIPMIN, Math.min(HD[v * 5 + 3] - HD[v * 5 + 4], HD[v * 5 + 3] - A[v]));
      P[o] = HC[0] + HD[v * 5] * r; P[o + 1] = HC[1] + HD[v * 5 + 1] * r; P[o + 2] = HC[2] + HD[v * 5 + 2] * r;
    }
  }
  /* четырёхугольник a-b-c-d опорной поверхности: нормаль (по диагоналям, со знаком fl) прибавляется к NR его узлов, ответ —
     площадь */
  function wallQuad(P, NR, fl, a, b, c, d) {
    const ax = P[c * 3] - P[a * 3], ay = P[c * 3 + 1] - P[a * 3 + 1], az = P[c * 3 + 2] - P[a * 3 + 2], bx = P[d * 3] - P[b * 3], by = P[d * 3 + 1] - P[b * 3 + 1], bz = P[d * 3 + 2] - P[b * 3 + 2];
    const nx = (ay * bz - az * by) * fl, ny = (az * bx - ax * bz) * fl, nz = (ax * by - ay * bx) * fl;
    NR[a * 3] += nx; NR[a * 3 + 1] += ny; NR[a * 3 + 2] += nz; NR[b * 3] += nx; NR[b * 3 + 1] += ny; NR[b * 3 + 2] += nz;
    NR[c * 3] += nx; NR[c * 3 + 1] += ny; NR[c * 3 + 2] += nz; NR[d * 3] += nx; NR[d * 3 + 1] += ny; NR[d * 3 + 2] += nz;
    return .5 * Math.sqrt(nx * nx + ny * ny + nz * nz);
  }
  /* нормали узлов (средняя четырёхугольников полос вокруг узла, наружу) и σ строк полос */
  function wallNormals(wall) {
    const { N, K, n, P, NR, rows, SG, AR, A0, kind, datum, code } = wall, fl = wall.flip, cw = wall.w;
    NR.fill(0);
    /* AR — площадь опорной поверхности полосы у строки (половины соседних четырёхугольников), SG — σ строки */
    for (let k = 0; k < K; k++) {
      const o = k * n; AR.fill(0, o, o + n);
      for (let q = 0; q + 1 < n; q++) {
        const r0 = (o + q) * 3, r1 = r0 + 3;
        const s = wallQuad(P, NR, fl, rows[r0], rows[r0 + 1], rows[r1 + 1], rows[r1]) + wallQuad(P, NR, fl, rows[r0 + 1], rows[r0 + 2], rows[r1 + 2], rows[r1 + 1]);
        AR[o + q] += s / 2; AR[o + q + 1] += s / 2;
      }
      for (let q = 0; q < n; q++) { const a = A0[o + q], s = AR[o + q]; SG[o + q] = a > 1e-6 && s > 1e-9 ? Math.min(WALL_SIG1, Math.max(WALL_SIG0, a / s)) : 1; }
    }
    let none = 0;
    for (let v = 0; v < N; v++) { const l = Math.sqrt(NR[v * 3] ** 2 + NR[v * 3 + 1] ** 2 + NR[v * 3 + 2] ** 2); if (l > 1e-12) { NR[v * 3] /= l; NR[v * 3 + 1] /= l; NR[v * 3 + 2] /= l; } else { NR[v * 3] = NR[v * 3 + 1] = NR[v * 3 + 2] = 0; none++; } }
    /* узел, у которого все четырёхугольники вырождены (полоса квадратной поясницы, у которой линия кончилась ниже, — точка у
       ребра), берёт нормаль соседей по строке и столбцу полосы */
    for (let pass = 0; none && pass < 4; pass++) {
      for (let k = 0; k < K; k++) for (let q = 0; q < n; q++) for (let e = 0; e < 3; e++) {
        const v = rows[(k * n + q) * 3 + e]; if (NR[v * 3] || NR[v * 3 + 1] || NR[v * 3 + 2]) continue;
        let x = 0, y = 0, z = 0;
        for (const [dq, de] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const qq = q + dq, ee = e + de; if (qq < 0 || qq >= n || ee < 0 || ee > 2) continue;
          const u = rows[(k * n + qq) * 3 + ee]; x += NR[u * 3]; y += NR[u * 3 + 1]; z += NR[u * 3 + 2];
        }
        const l = Math.sqrt(x * x + y * y + z * z); if (l > 1e-9) { NR[v * 3] = x / l; NR[v * 3 + 1] = y / l; NR[v * 3 + 2] = z / l; none--; }
      }
    }
    for (let v = 0; none && v < N; v++) if (!NR[v * 3] && !NR[v * 3 + 1] && !NR[v * 3 + 2]) NR[v * 3 + 2] = 1;
    /* у узлов кожи (0, 2, 4) направление «наружу» известно: от оси корпуса (x = z = 0 в рамке сегмента схемы) к точке узла по
       горизонтали сегмента. Там, где кожа складывается (бок живота при скручивании с поворотом, низ живота при глубоком
       сгибании), четырёхугольники вокруг узла встают ребром и их нормаль уходит вбок или внутрь — тогда она доворачивается к
       этому направлению (косинус не меньше WALL_COS) */
    const V = wall.V, piv = wall.piv, Sh = wall.shell, mm = wall.m, ri0 = wall.T.rib * 12;
    for (let v = 0; v < N; v++) {
      const k = kind[v]; if (k === 1 || (k === 3 && !(Sh && mm)) || ((k === 5 || k === 6) && !mm)) continue;
      const o = v * 3;
      let rx, ry, rz;
      if (k === 5 || k === 6) {
        /* у тазобедренного сустава: от центра головки бедра (начало рамки бедра) */
        const fb = wall.hip.f * 12; rx = P[o] - mm[fb + 3]; ry = P[o + 1] - mm[fb + 7]; rz = P[o + 2] - mm[fb + 11];
        const rl = Math.sqrt(rx * rx + ry * ry + rz * rz); if (rl < 1e-6) continue; rx /= rl; ry /= rl; rz /= rl;
        const cs = NR[o] * rx + NR[o + 1] * ry + NR[o + 2] * rz; if (cs >= WALL_COS) continue;
        const a = 2 * (WALL_COS - cs); let nx = NR[o] + a * rx, ny = NR[o + 1] + a * ry, nz = NR[o + 2] + a * rz;
        const l = Math.sqrt(nx * nx + ny * ny + nz * nz); NR[o] = nx / l; NR[o + 1] = ny / l; NR[o + 2] = nz / l;
        continue;
      }
      if (k === 3) {
        /* скольжение по рёбрам: от оси оболочки рёбер (x = 0, z = zc в рамке грудной клетки) */
        const dx = P[o] - mm[ri0 + 3], dy = P[o + 1] - mm[ri0 + 7], dz = P[o + 2] - mm[ri0 + 11];
        const lx = mm[ri0] * dx + mm[ri0 + 4] * dy + mm[ri0 + 8] * dz, lz = mm[ri0 + 2] * dx + mm[ri0 + 6] * dy + mm[ri0 + 10] * dz - Sh.zc;
        rx = mm[ri0] * lx + mm[ri0 + 2] * lz; ry = mm[ri0 + 4] * lx + mm[ri0 + 6] * lz; rz = mm[ri0 + 8] * lx + mm[ri0 + 10] * lz;
      } else {
        const cv = code[v * 2], j = cv < 3 ? cv : cv - 3 + (cw[v * 2] > .5 ? 1 : 0), b = j * 12;
        const lx = V[v * 6], lz = V[v * 6 + 2] + (cv < 3 ? 0 : piv[(cv - 3) * 3 + 2]);
        rx = WT[b + 3] * lx + WT[b + 9] * lz; ry = WT[b + 4] * lx + WT[b + 10] * lz; rz = WT[b + 5] * lx + WT[b + 11] * lz;
      }
      const rl = Math.sqrt(rx * rx + ry * ry + rz * rz); if (rl < 1) continue; rx /= rl; ry /= rl; rz /= rl;
      const cs = NR[o] * rx + NR[o + 1] * ry + NR[o + 2] * rz; if (cs >= WALL_COS) continue;
      const a = 2 * (WALL_COS - cs); let nx = NR[o] + a * rx, ny = NR[o + 1] + a * ry, nz = NR[o + 2] + a * rz;
      const l = Math.sqrt(nx * nx + ny * ny + nz * nz); NR[o] = nx / l; NR[o + 1] = ny / l; NR[o + 2] = nz / l;
    }
    /* толщина узла: нейтральная × σ его строк (у шва — среднее двух полос) */
    const TH = wall.TH; TH.fill(0); const c = wall.cnt; c.fill(0);
    for (let k = 0; k < K; k++) for (let q = 0; q < n; q++) for (let e = 0; e < 3; e++) { const v = rows[((k * n + q) * 3) + e]; TH[v] += SG[k * n + q]; c[v]++; }
    for (let v = 0; v < N; v++) TH[v] = wall.t0[v] * (c[v] ? TH[v] / c[v] : 1);
    /* у сустава (5, низ на кости — средняя и малая ягодичные): верх не выше кожи — не ближе cap к ней по лучу из центра головки
       бедра (карта кожи), иначе пласт тоньше (не тоньше 0,3 своей толщины) */
    if (wall.hip && wall.hip.map && wall.hip.cap && wall.m) {
      for (let v = 0; v < N; v++) {
        if (kind[v] !== 5 || !datum[v]) continue;
        const o = v * 3, t = TH[v], tx = P[o] + NR[o] * t - HC[0], ty = P[o + 1] + NR[o + 1] * t - HC[1], tz = P[o + 2] + NR[o + 2] * t - HC[2], r = Math.sqrt(tx * tx + ty * ty + tz * tz);
        if (r < 1e-6) continue;
        const rs = hipSkin(wall, wall.m, tx / r, ty / r, tz / r) - wall.hip.cap; if (r <= rs) continue;
        const cr = Math.max(.3, (NR[o] * tx + NR[o + 1] * ty + NR[o + 2] * tz) / r);
        TH[v] = Math.max(.3 * t, t - (r - rs) / cr);
      }
    }
    /* у кожи ягодицы (6, верх — опорный): низ не ближе WALL_HIPCORE к центру головки бедра (вертел, шейка, седалищный бугор лежат
       в 4,5–6 см от него) — в глубоком сгибании кожа между ягодицей и бедром прижимает узлы к суставу, и пласт толщиной 3–5 см
       уходил бы низом в сустав и выворачивался; там он тоньше (не тоньше 0,3 своей толщины) */
    if (wall.hip && wall.m) {
      for (let v = 0; v < N; v++) {
        if (kind[v] !== 6 || datum[v]) continue;
        const o = v * 3, r = Math.sqrt((P[o] - HC[0]) ** 2 + (P[o + 1] - HC[1]) ** 2 + (P[o + 2] - HC[2]) ** 2);
        TH[v] = Math.min(TH[v], Math.max(.3 * TH[v], r - WALL_HIPCORE));
      }
    }
    /* между кожей и рёбрами (узлы 4): толщина — не больше места между полом и потолком по нормали (не тоньше 0,3 своей) */
    const CL = wall.CL;
    for (let v = 0; v < N; v++) {
      if (kind[v] !== 4) continue;
      const o = v * 3, s = datum[v] ? 1 : -1, room = s * ((CL[o] - P[o]) * NR[o] + (CL[o + 1] - P[o + 1]) * NR[o + 1] + (CL[o + 2] - P[o + 2]) * NR[o + 2]);
      TH[v] = Math.min(TH[v], Math.max(.3 * TH[v], room));
    }
    /* пол из оболочки рёбер для узлов у кожи (верх — опорный): в позах, где грудная клетка подходит под пласт (рёберная дуга при
       скручивании с поворотом), низ пласта не уходит в рёбра — пласт сжимается (не тоньше 0,3), а если ребро выше и этого —
       узел поднимается над ним */
    const S = wall.shell; if (!S || !wall.m) return;
    const m = wall.m, ri = wall.T.rib * 12, gs = wall.side === 'R' ? -1 : 1;
    for (let v = 0; v < N; v++) {
      if (datum[v] || kind[v] === 3 || kind[v] >= 5) continue;
      const o = v * 3, t = TH[v], bx = P[o] - NR[o] * t - m[ri + 3], by = P[o + 1] - NR[o + 1] * t - m[ri + 7], bz = P[o + 2] - NR[o + 2] * t - m[ri + 11];
      const lx = m[ri] * bx + m[ri + 4] * by + m[ri + 8] * bz, ly = m[ri + 1] * bx + m[ri + 5] * by + m[ri + 9] * bz, lz = m[ri + 2] * bx + m[ri + 6] * by + m[ri + 10] * bz - S.zc;
      const th = Math.atan2(gs * lx, lz) * 180 / Math.PI; if (th < S.th0 || th > S.th0 + S.dth * (S.NT - 1)) continue;
      const rs = shellR(S, th, ly); if (rs < 0) continue;
      const rr = Math.sqrt(lx * lx + lz * lz); let def = rs + WALL_FLOOR - rr; if (def <= 0) continue;
      /* сдвиг — по нормали узла: радиус растёт на def · cos (нормаль к радиусу оболочки), поэтому def делится на него; узел
         поднимается не больше чем на WALL_LIFT — дальше пласт только сжимается (толстая сжатая прямая при скручивании с
         поворотом: низ уходит вбок под край хрящей, и подъём на всю глубину вывел бы её из кожи) */
      const cr = ((m[ri] * NR[o] + m[ri + 4] * NR[o + 1] + m[ri + 8] * NR[o + 2]) * lx + (m[ri + 2] * NR[o] + m[ri + 6] * NR[o + 1] + m[ri + 10] * NR[o + 2]) * lz) / (rr || 1);
      def /= Math.max(.3, cr);
      const tn = Math.max(.3 * t, t - def); TH[v] = tn;
      const lift = Math.min(WALL_LIFT, def - (t - tn)); if (lift > 0) { P[o] += NR[o] * lift; P[o + 1] += NR[o + 1] * lift; P[o + 2] += NR[o + 2] * lift; }
    }
  }
  /* сдвиг на толщину у ягодичных (wall.OF, по узлам): NR · TH, усреднённый WALL_OFF_PASS раз с соседями по сетке (узел — с весом 2),
     длина — прежняя толщина узла. Сетка ягодичных — строки × (2K + 1) столбцов (tools/muscles/walls.js, glGrid) */
  const WALL_OFF_PASS = 3;
  function wallOffsets(wall) {
    const { N, n, K, NR, TH } = wall, C2 = 2 * K + 1;
    if (N !== n * C2) { wall.OF = null; return; }
    const A = wall.OF || (wall.OF = new Float64Array(N * 3)), B = wall.OF2 || (wall.OF2 = new Float64Array(N * 3));
    for (let v = 0; v < N * 3; v++) A[v] = NR[v] * TH[(v / 3) | 0];
    for (let pass = 0; pass < WALL_OFF_PASS; pass++) {
      for (let q = 0; q < n; q++) for (let c = 0; c < C2; c++) {
        const v = q * C2 + c; let sx = 2 * A[v * 3], sy = 2 * A[v * 3 + 1], sz = 2 * A[v * 3 + 2], w = 2;
        if (q > 0) { const u = v - C2; sx += A[u * 3]; sy += A[u * 3 + 1]; sz += A[u * 3 + 2]; w++; }
        if (q < n - 1) { const u = v + C2; sx += A[u * 3]; sy += A[u * 3 + 1]; sz += A[u * 3 + 2]; w++; }
        if (c > 0) { const u = v - 1; sx += A[u * 3]; sy += A[u * 3 + 1]; sz += A[u * 3 + 2]; w++; }
        if (c < C2 - 1) { const u = v + 1; sx += A[u * 3]; sy += A[u * 3 + 1]; sz += A[u * 3 + 2]; w++; }
        B[v * 3] = sx / w; B[v * 3 + 1] = sy / w; B[v * 3 + 2] = sz / w;
      }
      A.set(B);
    }
    for (let v = 0; v < N; v++) {
      const o = v * 3, l = Math.sqrt(A[o] * A[o] + A[o + 1] * A[o + 1] + A[o + 2] * A[o + 2]);
      if (l > 1e-9) { const s = TH[v] / l; A[o] *= s; A[o + 1] *= s; A[o + 2] *= s; } else { A[o] = NR[o] * TH[v]; A[o + 1] = NR[o + 1] * TH[v]; A[o + 2] = NR[o + 2] * TH[v]; }
    }
  }
  /* вершины колец полос (порядок — как у ленты: 0 — верх середины, 1–3 — правый край, 4 — низ середины, 5–7 — левый) */
  const WV = new Float64Array(8 * 6);
  function wallSurface(wall, m, pos, nor, start, torso) {
    /* рамки корпуса у всех стенок общие (wall.T): surfaceAll считает их один раз на кадр (torso) */
    if (!torso) wallTorso(wall.T, m);
    wallNodes(wall, m);
    wall.m = m; wallNormals(wall); wall.m = null;
    const { K, n, NR, TH, rows } = wall;
    /* у сустава (ягодичные): сдвиг на толщину (NR · TH) сглаживается по сетке — у толстого пласта (до 3–4 см), огибающего вертел,
       крестец и вогнутую наружную поверхность крыла, нормали соседних узлов расходятся или сходятся сильнее, чем позволяет
       толщина, и поверхность, сдвинутая на толщину, выворачивалась складками; опорная поверхность (у кожи или на кости) — прежняя */
    if (wall.hip) wallOffsets(wall);
    WS_P = wall.P; WS_TH = TH; WS_OF = wall.OF; WS_NR = NR; WS_DT = wall.datum; WS_OWN = wall.own;
    for (let k = 0; k < K; k++) {
      const i = wall.lines[k], order = wall.rev[k] ? ORDER_REV : ORDER, r0 = wall.r0[k], dr = wall.dir[k];
      for (let q = 0; q < n; q++) {
        /* кольцо строки q полосы: у второй, третьей… полосы линии — после колец предыдущих, строки змейкой */
        const r = (k * n + q) * 3, L = rows[r], C = rows[r + 1], Rn = rows[r + 2], v0 = (start[i] + r0 + (dr ? n - 1 - q : q)) * SIDES * 3;
        wallPut(0, C, 0, NR[C * 3], NR[C * 3 + 1], NR[C * 3 + 2]); wallPut(4, C, TH[C], NR[C * 3], NR[C * 3 + 1], NR[C * 3 + 2]);
        wallSide(Rn, C, 1, 1); wallSide(L, C, 7, -1);
        for (let j = 0; j < SIDES; j++) {
          const e = order[j], o = e * 6, w = v0 + j * 3;
          pos[w] = WV[o]; pos[w + 1] = WV[o + 1]; pos[w + 2] = WV[o + 2];
          if (nor) { nor[w] = WV[o + 3]; nor[w + 1] = WV[o + 4]; nor[w + 2] = WV[o + 5]; }
        }
      }
    }
    WS_P = WS_TH = WS_OF = WS_NR = WS_DT = WS_OWN = null;
  }
  /* вершина e кольца (WV: по 6 чисел — позиция, нормаль) — узел v текущей стенки на глубине depth от верха (у ягодичных сдвиг на
     толщину — wall.OF). Массивы текущей стенки (P, TH, OF, NR, datum, own) — в переменных модуля на время wallSurface */
  let WS_P = null, WS_TH = null, WS_OF = null, WS_NR = null, WS_DT = null, WS_OWN = null;
  function wallPut(e, v, depth, nx, ny, nz) {
    const P = WS_P, TH = WS_TH, OF = WS_OF, o = e * 6, v3 = v * 3;
    let x = P[v3], y = P[v3 + 1], z = P[v3 + 2];
    if (OF) { const f = (WS_DT[v] ? 1 : 0) - (TH[v] > 1e-9 ? depth / TH[v] : 0); x += OF[v3] * f; y += OF[v3 + 1] * f; z += OF[v3 + 2] * f; }
    else { const NR = WS_NR, d = (WS_DT[v] ? TH[v] : 0) - depth; x += NR[v3] * d; y += NR[v3 + 1] * d; z += NR[v3 + 2] * d; }
    WV[o] = x; WV[o + 1] = y; WV[o + 2] = z; WV[o + 3] = nx; WV[o + 4] = ny; WV[o + 5] = nz;
  }
  /* край полосы (узел шва v, середина C): верх, середина и низ края (e0, e0 ± 1, e0 ± 2) */
  function wallSide(v, C, e0, sgn) {
    const P = WS_P, NR = WS_NR, nx = NR[v * 3], ny = NR[v * 3 + 1], nz = NR[v * 3 + 2], t = WS_TH[v];
    wallPut(e0, v, 0, nx, ny, nz); wallPut(e0 + 2 * sgn, v, t, nx, ny, nz); wallPut(e0 + sgn, v, t / 2, nx, ny, nz);
    if (WS_OWN[v]) {
      /* свой край: кромка наружу поперёк полосы (от середины к краю, по касательной к пласту), скруглена */
      let ex = P[v * 3] - P[C * 3], ey = P[v * 3 + 1] - P[C * 3 + 1], ez = P[v * 3 + 2] - P[C * 3 + 2]; const d = ex * nx + ey * ny + ez * nz; ex -= d * nx; ey -= d * ny; ez -= d * nz;
      const l = Math.sqrt(ex * ex + ey * ey + ez * ez);
      if (l > 1e-6) { const o = (e0 + sgn) * 6, k2 = WALL_ROUND * t / 2 / l; WV[o] += ex * k2; WV[o + 1] += ey * k2; WV[o + 2] += ez * k2; WV[o + 3] = ex / l; WV[o + 4] = ey / l; WV[o + 5] = ez / l; }
    }
  }
  /* все мышцы кадра: трубки (surface), ленты (ribbon), колпак дельтовидной (capSurface) и стенки (wallSurface); start — номера
     первых колец мышц (длина bound.length + 1) */
  function surfaceAll(bound, paths, m, pos, nor, start) {
    for (let i = 0; i < bound.length; i++) if (!bound[i].fan && !bound[i].cap && !bound[i].wall) surface(bound[i], paths[i], m, pos, nor, start[i] * SIDES);
    for (const fan of bound.fans || []) ribbon(fan, bound, paths, m, pos, nor, start);
    for (const cap of bound.caps || []) capSurface(cap, bound, paths, m, pos, nor, start);
    const walls = bound.walls || [];
    if (walls.length) wallTorso(walls[0].T, m);
    for (const wall of walls) wallSurface(wall, m, pos, nor, start, wall.T === walls[0].T);
  }
  function ringStarts(bound) { const st = new Uint32Array(bound.length + 1); for (let i = 0; i < bound.length; i++) st[i + 1] = st[i] + ringCount(bound[i]); return st; }

  /* ---------- пласты (межрёберные мышцы, формат данных 3) ----------
     Пласт — тонкая мышца на всю площадь промежутка между костями, а не трубка вдоль линии действия
     (tools/muscles/intercostals.js). В данных: кость (bone — пласт жёсткий, движется вместе с ней), верхний и нижний края
     наружной поверхности (a, b — точки в рамке кости, по порядку сзади вперёд) и толщина t в каждой точке (см).
     Наружная поверхность — полосы между краями; внутренняя — сдвиг на t вглубь по нормали; торцы закрыты. Нормаль наружу —
     cross(вдоль пласта, от a к b), у правой стороны — с обратным знаком (порядок точек на обеих сторонах — сзади вперёд). */
  function sheetNormals(sh) {
    const a = sh.a, b = sh.b, n = a.length, g = sh.side === 'L' ? 1 : -1, out = [];
    for (let i = 0; i < n; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      const t = [a[i1][0] + b[i1][0] - a[i0][0] - b[i0][0], a[i1][1] + b[i1][1] - a[i0][1] - b[i0][1], a[i1][2] + b[i1][2] - a[i0][2] - b[i0][2]];
      const v = sub3(b[i], a[i]), c = cross3(t, v), l = Math.sqrt(dot3(c, c)) || 1;
      out.push([g * c[0] / l, g * c[1] / l, g * c[2] / l]);
    }
    return out;
  }
  /* сетка пласта в рамке его кости: {pos, nor (Float32Array), idx (номера вершин), n — вершин}; вершины: наружная поверхность
     (a, b по точкам), внутренняя, два торца */
  function sheetMesh(sh) {
    const a = sh.a, b = sh.b, n = a.length, N = sheetNormals(sh), nv = 4 * n + 8;
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = [];
    const put = (v, p, q) => { pos.set(p, v * 3); nor.set(q, v * 3); };
    const deep = (p, i) => [p[0] - N[i][0] * sh.t[i], p[1] - N[i][1] * sh.t[i], p[2] - N[i][2] * sh.t[i]], neg = q => [-q[0], -q[1], -q[2]];
    for (let i = 0; i < n; i++) {
      put(2 * i, a[i], N[i]); put(2 * i + 1, b[i], N[i]);
      put(2 * n + 2 * i, deep(a[i], i), neg(N[i])); put(2 * n + 2 * i + 1, deep(b[i], i), neg(N[i]));
    }
    /* обход: снаружи — против часовой, если смотреть со стороны нормали */
    const f = cross3(sub3(a[Math.min(1, n - 1)], a[0]), sub3(b[0], a[0])), flip = dot3(f, N[0]) < 0;
    const quad = (p, q, r, s, rev) => { if (rev) idx.push(p, r, q, q, r, s); else idx.push(p, q, r, q, s, r); };
    for (let i = 0; i < n - 1; i++) { quad(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 3, flip); quad(2 * n + 2 * i, 2 * n + 2 * i + 2, 2 * n + 2 * i + 1, 2 * n + 2 * i + 3, !flip); }
    /* торцы: сзади (i = 0) нормаль — против хода пласта, спереди — по ходу */
    for (const [i, s, v] of [[0, -1, 4 * n], [n - 1, 1, 4 * n + 4]]) {
      const j = s < 0 ? Math.min(1, n - 1) : Math.max(0, n - 2), t = sub3(a[i], a[j]), l = Math.sqrt(dot3(t, t)) || 1, e = [t[0] / l, t[1] / l, t[2] / l];
      put(v, a[i], e); put(v + 1, b[i], e); put(v + 2, deep(a[i], i), e); put(v + 3, deep(b[i], i), e);
      const g = cross3(sub3(b[i], a[i]), sub3(deep(a[i], i), a[i]));
      quad(v, v + 1, v + 2, v + 3, dot3(g, e) < 0);
    }
    return { pos, nor, idx, n: nv };
  }

  /* ---------- данные ----------
     src/data/muscles.bin (tools/muscles/pack.js): gzip от JSON. Грузится заранее, в простое после первого экрана, или при первом открытии вида «Анатомия»;
     в офлайн-файле встроен (window.MUSCLES_BIN, base64).
     Формат 2 — мышцы-трубки (muscles); формат 3 (4.40.0) добавляет пласты (sheets) — читатель формата 2 их не видит и рисует
     мышцы как раньше, данные формата 2 без sheets этот читатель рисует без пластов. */
  let data = null, pending = null;
  const decode = u8 => JSON.parse(new TextDecoder().decode(u8));
  async function gunzip(bytes) {
    if (typeof DecompressionStream === 'undefined') throw Error('muscles: DecompressionStream is unavailable');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function fromBase64(s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function url() {
    const up = typeof window !== 'undefined' && window.PODHOD_LANG && window.PODHOD_LANG !== 'ru' ? '../' : '';
    return up + 'muscles.bin' + (typeof window !== 'undefined' && window.PODHOD_BUILD ? '?v=' + window.PODHOD_BUILD : '');
  }
  /* загрузка один раз; при ошибке следующая попытка начнётся заново */
  function load() {
    if (data) return Promise.resolve(data);
    if (pending) return pending;
    const bytes = typeof window !== 'undefined' && window.MUSCLES_BIN ? Promise.resolve(fromBase64(window.MUSCLES_BIN))
      : fetch(url()).then(r => { if (!r.ok) throw Error('muscles: ' + r.status); return r.arrayBuffer(); }).then(b => new Uint8Array(b));
    pending = bytes.then(gunzip).then(decode).then(d => (data = d)).catch(e => { pending = null; throw e; });
    return pending;
  }
  return { path, wrap, bind, place, layout, drawn, layoutDrawn, body, radiusAt, skinAt, section, surface, ribbon, ribbonRing, wallSurface, shellR, surfaceAll, ringCount, ringStarts, sheetNormals, sheetMesh, FANS, SIDES, SKIN_U, SKIN_GAP, FLAT, SPINDLE, SPINDLE_I, load, decode, get data() { return data; }, set data(d) { data = d; } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Muscles;
if (typeof window !== 'undefined') window.Muscles = Muscles;
