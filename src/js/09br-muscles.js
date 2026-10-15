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
      el: mu.el.map(e => e.s ? { s: pt(e.s) } : { w: { t: e.w.t, i: bone(e.w.bone), c: e.w.c, a: e.w.a, r: e.w.r, B: e.w.B, side: e.w.side ? pt(e.w.side) : null } })
    }));
    bound.fans = bindFans(md, bound, idx);
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
     в центре, низ другого шва, край, верх другого шва. Нормали — по поверхности пласта (у швов — средняя двух полос).
     Источники выбора мышц и числа — tools/muscles/README.md, «Ленты». */
  const FANS = [
    /* [ключ, линии по порядку начал вдоль кости, кость конца u = 0]; источники — tools/muscles/README.md, «Ленты» */
    ['pecmaj', ['PECM1', 'PECM1b', 'PECM2a', 'PECM2', 'PECM2c', 'PECM3', 'PECM3b'], /^humerus/],
    ['delt3', ['DELT3lat', 'DELT3', 'DELT3med'], /^humerus/],
    ['lat', ['LAT1', 'LAT2', 'LAT3', 'LAT4', 'LAT5', 'LAT6'], /^humerus/],
    ['trap', ['trap_clav_1', 'trap_clav_2', 'trap_scap_1', 'trap_scap_2', 'trap_scap_3', 'trap_scap_4', 'trap_scap_5', 'trap_scap_6', 'trap_scap_7', 'trap_scap_8', 'trap_scap_9', 'trap_scap10', 'trap_scap11'], /^(clavicle|scapula)/],
    ['infsp', ['INFSPsup', 'INFSP', 'INFSPinf'], /^humerus/],
    ['serrant', ['serr_ant_1', 'serr_ant_2', 'serr_ant_3', 'serr_ant_4', 'serr_ant_5', 'serr_ant_6', 'serr_ant_7', 'serr_ant_8', 'serr_ant_9', 'serr_ant10', 'serr_ant11', 'serr_ant12'], /^scapula/],
    ['rhomb', ['rhomboid_2', 'rhomboid_3', 'rhomboid_4', 'rhomboid_5'], /^scapula/],
    ['eo', ['EO7', 'EO8', 'EO1', 'EO2', 'EO3', 'EO4', 'EO5', 'EO6'], /^ribcage/],
    ['glmax', ['glmax1', 'glmax2', 'glmax3'], /^femur/],
    ['glmed', ['glmed1', 'glmed2', 'glmed3'], /^femur/],
  ];
  const BORDER = .35, BORDER_H = .5, TIP_IN = .25, TIP_OUT = .6, RIB_WMIN = .5, RIB_HMIN = .06, RIB_C0 = .3, RIB_C1 = 1, RIB_SPREAD = .8, RIB_STEER = .35, RIB_LAM = .3, RIB_AGREE = .5;
  /* поля записи линии в кольце (LW): 0–2 центр, 3–5 касательная в сторону u, 6–8 нормаль пласта, 9–11 направление к коже,
     12 глубина под кожей, 13 площадь сечения (как у трубки), 14 полупоперечник, 15–16 ширины до швов, 17 толщина η = A/(2w),
     18 полутолщина центра, 19 сдвиг вглубь, 20–22 нормаль по соседям, 23 флаги своей кромки, 24 расстояние по пути (см),
     25 радиус кривизны кожи поперёк линии;
     шва (SW): 0–2 точка, 3–5 нормаль, 6–8 поперёк (от линии k к k+1), 9 полутолщина, 10 вынос кромки, 11 доля λ */
  const LW = 26, SW = 12;
  const GAP = new Float64Array(32), GAP2 = new Float64Array(32), PC = new Float64Array(96);
  function bindFans(md, bound, idx) {
    const at = new Map(bound.map((mu, i) => [mu.name, i])), fans = [];
    for (const [key, names, anchor] of FANS) for (const s of ['r', 'l']) {
      const lines = names.map(nm => at.get(nm + '_' + s));
      if (lines.some(i => i === undefined)) continue;
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
        knots: knotList, lineKnots, KU: new Float64Array(knotList.length), KF: new Float64Array(knotList.length * K) };
      lines.forEach((i, k) => { bound[i].fan = fan; bound[i].fanK = k; bound[i].rings = n; });
      /* огибающие тела линий (сферы и цилиндры — модели костей в исходных моделях): швы ленты не заходят в них */
      const wraps = lines.map(i => bound[i].el.filter(e => e.w && e.w.t !== 'e').map(e => e.w));
      fan.wrapOff = new Uint16Array(K + 1); wraps.forEach((l, k) => { fan.wrapOff[k + 1] = fan.wrapOff[k] + l.length; });
      /* в рамке кости: центр, ось (у сферы — любая), поперечное к оси направление (масштаб радиуса), радиус, цилиндр ли */
      fan.wrapEls = wraps.flat().map(w => { const fr = frameFromAxis(w.a || [0, 0, 1]); return { i: w.i, c: w.c, a: w.a || [0, 0, 1], p: [fr[0], fr[3], fr[6]], r: w.r, cyl: w.t === 'c' }; });
      fan.WB = new Float64Array(fan.wrapEls.length * 8);
      fans.push(fan);
    }
    return fans;
  }
  let CUM = new Float64Array(256);
  /* нормаль для кривизны пласта у линии кольца (смещение в записи линии): направление к коже, без данных кожи — нормаль пласта */
  let CURV_B = null;
  const curv = o => (CURV_B[o + 12] < 1e8 ? o + 9 : o + 6);
  /* вершины и нормали всех линий ленты fan (кадр — матрицы m, пути для рисования paths по номерам bound); вершины линии i —
     с кольца start[i] (номера колец, как у слоя мышц) */
  function ribbon(fan, bound, paths, m, pos, nor, start) {
    const K = fan.K, n = fan.n, B = fan.L, S = fan.S, KN = fan.knots, KU = fan.KU, KF = fan.KF; CURV_B = B;
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
    /* 1б. Линии веера, добавленные по площадке начала (большая грудная, подостная, задняя дельта; LAT4 у нижнего угла
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
    /* 3б. знак нормали — общий для ленты: перенос вдоль линии мог развернуть нормаль одной линии против соседей (пласт задней
       дельты обходит плечо больше чем на четверть оборота, а между кольцами линии почти сходятся). Линия, чья нормаль
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
           кость: дельтовидная вокруг головки плеча); стрелка — вдоль среднего из них */
        const ga = curv(a), gc = curv(c);
        const cphi = B[ga] * B[gc] + B[ga + 1] * B[gc + 1] + B[ga + 2] * B[gc + 2];
        let sag = 0, sx = 0, sy = 0, sz = 0;
        if (cphi < .99999) {
          const phi = Math.min(Math.PI / 2, Math.acos(Math.max(-1, cphi))), conv = ex * (B[gc] - B[ga]) + ey * (B[gc + 1] - B[ga + 1]) + ez * (B[gc + 2] - B[ga + 2]);
          sag = (conv >= 0 ? 1 : -1) * d * .5 * Math.tan(phi / 4);
          sx = B[ga] + B[gc]; sy = B[ga + 1] + B[gc + 1]; sz = B[ga + 2] + B[gc + 2]; const sl = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1; sx /= sl; sy /= sl; sz /= sl;
        }
        /* шов — не посередине, а по площадям сечений двух полос (λ = A/(A + A'), в пределах RIB_LAM…1 − RIB_LAM): у частей
           разного объёма (средняя и передняя дельтовидная — 53 и 17 %) толщина пласта ровнее; стрелка — по доле хорды */
        const lam = Math.min(1 - RIB_LAM, Math.max(RIB_LAM, B[a + 13] / (B[a + 13] + B[c + 13] || 1)));
        sag *= 4 * lam * (1 - lam);
        S[o] = B[a] + (B[c] - B[a]) * lam + sx * sag; S[o + 1] = B[a + 1] + (B[c + 1] - B[a + 1]) * lam + sy * sag; S[o + 2] = B[a + 2] + (B[c + 2] - B[a + 2]) * lam + sz * sag;
        S[o + 11] = lam;
        S[o + 3] = nx; S[o + 4] = ny; S[o + 5] = nz; S[o + 6] = wx; S[o + 7] = wy; S[o + 8] = wz;
      }
      /* шов — на хорде между линиями: где линии огибают кость (задняя дельтовидная и большая грудная у головки плеча),
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
           линии перекрещиваются (пласт задней дельты при руке над головой перекручен), полосы перекрывают промежуток */
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
        B[o + 19] = Math.max(0, ext);
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
        const room = B[a + 12] + (B[c + 12] - B[a + 12]) * lam - lift - SKIN_GAP - x2, sh = Math.max(0, S[s + 9] * Math.abs(gx * S[s + 3] + gy * S[s + 4] + gz * S[s + 5]) - room, B[a + 19] + (B[c + 19] - B[a + 19]) * lam);
        S[s] -= gx * sh; S[s + 1] -= gy * sh; S[s + 2] -= gz * sh;
      }
      for (let k = 0; k < K; k++) { const o = (k * n + q) * LW, sh = B[o + 19]; B[o] -= B[o + 9] * sh; B[o + 1] -= B[o + 10] * sh; B[o + 2] -= B[o + 11] * sh; }
      /* после сдвигов центр и швы сместились по-разному — толщина центра заново, по сечению, которое будет нарисовано */
      for (let k = 0; k < K; k++) { const o = (k * n + q) * LW; B[o + 18] = solveH(B, S, o, (k * n + q) * SW, ((k + 1) * n + q) * SW, k, K); }
    }
    /* 5. вершины: порядок кольца — как у трубки (от нормали к w = N × t своей линии) */
    for (let k = 0; k < K; k++) {
      const i = fan.lines[k], rev = fan.rev[k];
      for (let r = 0; r < n; r++) {
        const q = rev ? n - 1 - r : r, o = (k * n + q) * LW, sl = (k * n + q) * SW, sr = ((k + 1) * n + q) * SW, v = (start[i] + r) * SIDES * 3;
        const cx = B[o], cy = B[o + 1], cz = B[o + 2], nx = B[o + 6], ny = B[o + 7], nz = B[o + 8], h = B[o + 18], fl = B[o + 23];
        const tx = B[o + 3], ty = B[o + 4], tz = B[o + 5], wx = ny * tz - nz * ty, wy = nz * tx - nx * tz, wz = nx * ty - ny * tx;
        /* правый шов (к линии k+1) и левый (к k−1): общие вершины — или своя кромка, если полоса шире шва (линии сходятся) */
        const R = edge(S, sr, fl & 2, cx, cy, cz, nx, ny, nz, wx, wy, wz, B[o + 16], 1, k < K - 1 ? B[o + 17] : -1), Lf = edge(S, sl, fl & 1, cx, cy, cz, nx, ny, nz, wx, wy, wz, B[o + 15], -1, k > 0 ? B[o + 17] : -1);
        const order = rev ? ORDER_REV : ORDER;
        for (let j = 0; j < SIDES; j++) {
          const e = order[j], w = v + j * 3;
          let px, py, pz, qx, qy, qz;
          if (e === 0 || e === 4) { const sg = e === 0 ? 1 : -1; px = cx + nx * h * sg; py = cy + ny * h * sg; pz = cz + nz * h * sg; qx = nx * sg; qy = ny * sg; qz = nz * sg; }
          else {
            const E = e < 4 ? R : Lf, kind = e < 4 ? e - 1 : 7 - e;   /* 0 — верх шва, 1 — кромка, 2 — низ шва */
            if (kind === 1) { px = E[0] + E[6] * E[10]; py = E[1] + E[7] * E[10]; pz = E[2] + E[8] * E[10]; qx = E[6]; qy = E[7]; qz = E[8]; }
            else { const sg = kind === 0 ? 1 : -1; px = E[0] + E[3] * E[9] * sg; py = E[1] + E[4] * E[9] * sg; pz = E[2] + E[5] * E[9] * sg; qx = E[3] * sg; qy = E[4] * sg; qz = E[5] * sg; }
          }
          pos[w] = px; pos[w + 1] = py; pos[w + 2] = pz;
          if (nor) { nor[w] = qx; nor[w + 1] = qy; nor[w + 2] = qz; }
        }
      }
    }
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
    return Math.max(RIB_HMIN, .3 * eta, (B[o + 13] - bL * hL - bR * hR - (oL ? TIP_IN * eta : S[sl + 10]) * hL - (oR ? TIP_IN * eta : S[sr + 10]) * hR) / (aL + aR));
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
     ширины до швов, своя ли кромка (линии сошлись) — для проверок */
  function ribbonRing(fan, k, q) {
    const o = (k * fan.n + q) * LW, B = fan.L;
    return { s: B[o + 24], area: B[o + 13], h: B[o + 18], eta: B[o + 17], wl: B[o + 15], wr: B[o + 16], own: B[o + 23], shift: B[o + 19], t: [B[o + 3], B[o + 4], B[o + 5]] };
  }
  /* все мышцы кадра: трубки (surface) и ленты (ribbon); start — номера первых колец мышц (длина bound.length + 1) */
  function surfaceAll(bound, paths, m, pos, nor, start) {
    for (let i = 0; i < bound.length; i++) if (!bound[i].fan) surface(bound[i], paths[i], m, pos, nor, start[i] * SIDES);
    for (const fan of bound.fans || []) ribbon(fan, bound, paths, m, pos, nor, start);
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
  return { path, wrap, bind, place, layout, drawn, layoutDrawn, body, radiusAt, skinAt, section, surface, ribbon, ribbonRing, surfaceAll, ringCount, ringStarts, sheetNormals, sheetMesh, FANS, SIDES, SKIN_U, SKIN_GAP, FLAT, SPINDLE, SPINDLE_I, load, decode, get data() { return data; }, set data(d) { data = d; } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Muscles;
if (typeof window !== 'undefined') window.Muscles = Muscles;
