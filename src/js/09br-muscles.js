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
      name: mu.name, side: mu.side, fmax: mu.fmax, L0: mu.L0, LT: mu.LT, group: mu.group, part: mu.part,
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

  /* ---------- данные ----------
     src/data/muscles.bin (tools/muscles/pack.js): gzip от JSON. Грузится при первом включении режима «Анатомия мышц»;
     в офлайн-файле встроен (window.MUSCLES_BIN, base64). */
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
  return { path, wrap, bind, place, layout, load, decode, get data() { return data; }, set data(d) { data = d; } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Muscles;
if (typeof window !== 'undefined') window.Muscles = Muscles;
