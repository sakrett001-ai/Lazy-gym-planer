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
    return md.muscles.map(mu => ({
      name: mu.name, side: mu.side, group: mu.group, part: mu.part, v: mu.v, t0: mu.t0, t1: mu.t1, l0: mu.l0, sk: mu.sk, x0: mu.x0,
      el: mu.el.map(e => e.s ? { s: pt(e.s) } : { w: { t: e.w.t, i: bone(e.w.bone), c: e.w.c, a: e.w.a, r: e.w.r, B: e.w.B, side: e.w.side ? pt(e.w.side) : null } })
    }));
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
  const ringCount = mu => Math.max(6, Math.min(MAX_RINGS, Math.ceil((mu.l0 || 10) / RING) + 1));
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
    return Math.max(b.rt, Math.sqrt(b.area * Math.pow(Math.sin(Math.PI * u), SPINDLE) / SPINDLE_I / Math.PI));
  }

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
  return { path, wrap, bind, place, layout, drawn, layoutDrawn, body, radiusAt, skinAt, section, surface, ringCount, sheetNormals, sheetMesh, SIDES, SKIN_U, SKIN_GAP, FLAT, SPINDLE, SPINDLE_I, load, decode, get data() { return data; }, set data(d) { data = d; } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Muscles;
if (typeof window !== 'undefined') window.Muscles = Muscles;
