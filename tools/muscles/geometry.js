'use strict';
/* Геометрические проверки путей мышц: не идут сквозь кости и не выходят из кожи.
   Кость «изнутри» — по чётности пересечений луча с её сеткой; сетки после упрощения не всегда замкнуты, поэтому лучей
   три (вдоль осей рамки кости) и решает большинство. Кожа — те же формы тела, что у проверки скелета (fit.js). */
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));

/* ---------- кости ---------- */
function prepareBones(skel) {
  return skel.bones.map(b => {
    const p = b.pos, idx = b.idx, tris = [];
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[i + k]); hi[k] = Math.max(hi[k], p[i + k]); }
    for (let f = 0; f < idx.length; f += 3) tris.push([idx[f], idx[f + 1], idx[f + 2]].map(v => [p[v * 3], p[v * 3 + 1], p[v * 3 + 2]]));
    /* корзины по двум координатам для каждого из трёх лучей: ось луча a, корзина — по двум другим (шаг 1 см) */
    const grids = [0, 1, 2].map(a => {
      const u = (a + 1) % 3, v = (a + 2) % 3, g = new Map();
      for (const t of tris) {
        const u0 = Math.floor(Math.min(t[0][u], t[1][u], t[2][u])), u1 = Math.floor(Math.max(t[0][u], t[1][u], t[2][u]));
        const v0 = Math.floor(Math.min(t[0][v], t[1][v], t[2][v])), v1 = Math.floor(Math.max(t[0][v], t[1][v], t[2][v]));
        for (let i = u0; i <= u1; i++) for (let j = v0; j <= v1; j++) { const k = i * 4096 + j; (g.get(k) || g.set(k, []).get(k)).push(t); }
      }
      return { u, v, g };
    });
    const pb = { name: b.name, side: b.side, lo, hi, grids, tris };
    /* занятость ячеек по 1 см: ячейка рядом с поверхностью (коробка треугольника, расширенная на ячейку) или с центром
       внутри кости; точка в пустой ячейке — заведомо снаружи (у грудной клетки внутри коробки почти всё пусто) */
    const o = lo.map(Math.floor), n = hi.map((h, k) => Math.floor(h) - o[k] + 1), occ = new Uint8Array(n[0] * n[1] * n[2]);
    const at = (i, j, k) => (i * n[1] + j) * n[2] + k;
    for (const t of tris) {
      const a = [0, 1, 2].map(k => Math.max(0, Math.floor(Math.min(t[0][k], t[1][k], t[2][k])) - o[k] - 1));
      const z = [0, 1, 2].map(k => Math.min(n[k] - 1, Math.floor(Math.max(t[0][k], t[1][k], t[2][k])) - o[k] + 1));
      for (let i = a[0]; i <= z[0]; i++) for (let j = a[1]; j <= z[1]; j++) for (let k = a[2]; k <= z[2]; k++) occ[at(i, j, k)] = 1;
    }
    for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) for (let k = 0; k < n[2]; k++)
      if (!occ[at(i, j, k)] && insideRaw(pb, [o[0] + i + .5, o[1] + j + .5, o[2] + k + .5])) occ[at(i, j, k)] = 1;
    pb.occ = { o, n, occ };
    /* треугольники по ячейкам 2 см — для глубины точки (ближайший треугольник ищется в соседних ячейках) */
    const cells = new Map(), C = 2, key = (i, j, k) => (i * 1024 + j) * 1024 + k;
    for (const t of tris) {
      const a = [0, 1, 2].map(k => Math.floor(Math.min(t[0][k], t[1][k], t[2][k]) / C) + 300), z = [0, 1, 2].map(k => Math.floor(Math.max(t[0][k], t[1][k], t[2][k]) / C) + 300);
      for (let i = a[0]; i <= z[0]; i++) for (let j = a[1]; j <= z[1]; j++) for (let k = a[2]; k <= z[2]; k++) { const h = key(i, j, k); (cells.get(h) || cells.set(h, []).get(h)).push(t); }
    }
    pb.near = q => {   /* расстояние до поверхности: точно, если оно меньше 2 см; иначе — перебором всех треугольников */
      const c = q.map(v => Math.floor(v / C) + 300); let d = Infinity;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) for (const t of cells.get(key(c[0] + i, c[1] + j, c[2] + k)) || []) d = Math.min(d, triDist(q, t));
      if (d <= C) return d;
      for (const t of tris) d = Math.min(d, triDist(q, t));
      return d;
    };
    return pb;
  });
}
/* пересекает ли луч из q вдоль +оси a треугольник t (проекция на плоскость u,v — барицентрически) */
function crosses(q, a, u, v, t) {
  const [A, B, C] = t, d = (B[u] - A[u]) * (C[v] - A[v]) - (C[u] - A[u]) * (B[v] - A[v]);
  if (Math.abs(d) < 1e-12) return false;
  const w1 = ((q[u] - A[u]) * (C[v] - A[v]) - (C[u] - A[u]) * (q[v] - A[v])) / d, w2 = ((B[u] - A[u]) * (q[v] - A[v]) - (q[u] - A[u]) * (B[v] - A[v])) / d;
  if (w1 < 0 || w2 < 0 || w1 + w2 > 1) return false;
  return A[a] + w1 * (B[a] - A[a]) + w2 * (C[a] - A[a]) > q[a];
}
function insideBone(pb, q) {
  if (q[0] < pb.lo[0] || q[1] < pb.lo[1] || q[2] < pb.lo[2] || q[0] > pb.hi[0] || q[1] > pb.hi[1] || q[2] > pb.hi[2]) return false;
  const g = pb.occ;
  if (g) { const i = Math.floor(q[0]) - g.o[0], j = Math.floor(q[1]) - g.o[1], k = Math.floor(q[2]) - g.o[2]; if (!g.occ[(i * g.n[1] + j) * g.n[2] + k]) return false; }
  return insideRaw(pb, q);
}
function insideRaw(pb, q) {
  let votes = 0;
  for (const [a, gr] of pb.grids.entries()) {
    const list = gr.g.get(Math.floor(q[gr.u]) * 4096 + Math.floor(q[gr.v])) || [];
    let n = 0; for (const t of list) if (crosses(q, a, gr.u, gr.v, t)) n++;
    votes += n & 1;
  }
  return votes >= 2;
}
/* расстояние от точки до треугольника (Эриксон, «Real-Time Collision Detection», 5.1.5) */
function triDist(p, [a, b, c]) {
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  const at = q => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  if (d1 <= 0 && d2 <= 0) return at(a);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return at(b);
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return at([a[0] + ab[0] * v, a[1] + ab[1] * v, a[2] + ab[2] * v]); }
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return at(c);
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return at([a[0] + ac[0] * w, a[1] + ac[1] * w, a[2] + ac[2] * w]); }
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return at([b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w]); }
  const den = 1 / (va + vb + vc), v = vb * den, w = vc * den; return at([a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]);
}
/* обратная к 3×4 матрице кости (линейная часть может быть растянута — у фаланг) */
function inverse(m, i) {
  const o = i * 12, A = [[m[o], m[o + 1], m[o + 2]], [m[o + 4], m[o + 5], m[o + 6]], [m[o + 8], m[o + 9], m[o + 10]]], t = [m[o + 3], m[o + 7], m[o + 11]];
  const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  const c = (r, s) => { const R = [0, 1, 2].filter(k => k !== r), C = [0, 1, 2].filter(k => k !== s); return ((r + s) % 2 ? -1 : 1) * (A[R[0]][C[0]] * A[R[1]][C[1]] - A[R[0]][C[1]] * A[R[1]][C[0]]); };
  const inv = [0, 1, 2].map(i_ => [0, 1, 2].map(j => c(j, i_) / det));
  return p => { const w = [p[0] - t[0], p[1] - t[1], p[2] - t[2]]; return [0, 1, 2].map(r => inv[r][0] * w[0] + inv[r][1] * w[1] + inv[r][2] * w[2]); };
}
/* Насколько путь заходит в кости: наибольшая глубина (см, по ближайшему треугольнику) и длина участков внутри.
   Участки у начала и прикрепления (attach см по пути) не считаются: там мышца лежит на кости. Глубина — в рамке кости
   (у фаланг рамка растянута, глубина там приблизительная). */
/* мировые рамки костей позы: обратные преобразования и описанные коробки (по 8 углам локальной коробки) — чтобы
   точку пути проверять только в костях, в чью коробку она попала */
function poseBones(pbs, m) {
  return pbs.map((pb, i) => {
    const o = i * 12, lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let c = 0; c < 8; c++) {
      const q = [c & 1 ? pb.hi[0] : pb.lo[0], c & 2 ? pb.hi[1] : pb.lo[1], c & 4 ? pb.hi[2] : pb.lo[2]];
      for (let r = 0; r < 3; r++) { const v = m[o + r * 4] * q[0] + m[o + r * 4 + 1] * q[1] + m[o + r * 4 + 2] * q[2] + m[o + r * 4 + 3]; lo[r] = Math.min(lo[r], v); hi[r] = Math.max(hi[r], v); }
    }
    return { inv: inverse(m, i), lo, hi };
  });
}
function boneRun(pbs, m, pts, attach = 1.5, step = .25, pose = poseBones(pbs, m)) {
  let total = 0, along = 0, worst = 0, run = 0, where = null, depth = 0, deepAt = null;
  const L = pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) : 0, 0);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k < n; k++) {
      const s = along + len * (k + .5) / n; if (s < attach || s > L - attach) { run = 0; continue; }
      const p = [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * (k + .5) / n);
      let hit = null, q = null;
      for (let bi = 0; bi < pbs.length && !hit; bi++) {
        const w = pose[bi]; if (p[0] < w.lo[0] || p[0] > w.hi[0] || p[1] < w.lo[1] || p[1] > w.hi[1] || p[2] < w.lo[2] || p[2] > w.hi[2]) continue;
        const ql = w.inv(p); if (insideBone(pbs[bi], ql)) { hit = pbs[bi]; q = ql; }
      }
      if (hit) {
        total += len / n; run += len / n; if (run > worst) { worst = run; where = hit.name + hit.side; }
        /* глубина точки — расстояние до ближайшего треугольника */
        const dmin = hit.near(q);
        if (dmin > depth) { depth = dmin; deepAt = hit.name + hit.side; }
      } else run = 0;
    }
    along += len;
  }
  return { total, worst, where, depth, deepAt };
}

/* ---------- кожа ---------- */
function skinSDF(R) {
  const body = M.bodyData(R), cache = M.torsoCache(R);
  /* части кожи по отдельности: расстояние — наименьшее по частям; skinOut перебирает их сам и бросает точку, как только
     она оказалась глубже уже найденного худшего выхода */
  const parts = [p => M.torsoSDF(R, p, cache), p => M.headSDF(R, p), p => M.neckSDF(R, p)];
  for (const s of ['L', 'R']) for (const k of ['ua', 'fa', 'th', 'sk']) parts.push(p => M.limbSDF(R, k, s, p));
  for (const c of body.caps) parts.push(p => M.V.dist(p, c.c) - c.r);
  const sdf = p => { let d = Infinity; for (const f of parts) d = Math.min(d, f(p)); return d; };
  sdf.parts = parts;
  return sdf;
}
/* Наибольший выход пути из кожи, см. Кисти и стопы — вне проверки (у них своя форма, сухожилия пальцев под самой кожей):
   точки дальше запястья и голеностопа (по оси предплечья и голени) пропускаются. */
function skinOut(sdf, pts, R, step = .5) {
  const F = R.frames, dot = (p, o, v) => (p[0] - o[0]) * v[0] + (p[1] - o[1]) * v[1] + (p[2] - o[2]) * v[2];
  /* кисть — дальше запястья по оси кисти (её y смотрит от пальцев к запястью); стопа — ниже голеностопа по оси стопы
     или впереди него больше чем на 2 см */
  const beyond = p => ['L', 'R'].some(s => {
    const h = F['hand' + s], f = F['foot' + s];
    return (dot(p, h.o, h.y) < -.5 && Math.hypot(p[0] - h.o[0], p[1] - h.o[1], p[2] - h.o[2]) < 25) ||
      ((dot(p, f.o, f.y) < -.5 || dot(p, f.o, f.z) > 2) && Math.hypot(p[0] - f.o[0], p[1] - f.o[1], p[2] - f.o[2]) < 30 && dot(p, f.o, f.y) < 6);
  });
  let worst = -Infinity, last = 0;
  const parts = sdf.parts || [sdf];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / step));
    for (let k = 0; k <= n; k++) {
      const p = [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * k / n); if (beyond(p)) continue;
      /* сначала часть кожи, ближайшая к прошлой точке: обычно она же ближайшая и теперь */
      let d = parts[last](p);
      if (d > worst) for (let j = 0; j < parts.length; j++) { if (j === last) continue; const e = parts[j](p); if (e < d) { d = e; last = j; } if (d <= worst) break; }
      if (d > worst) worst = d;
    }
  }
  return worst;
}
module.exports = { prepareBones, poseBones, boneRun, insideBone, inverse, skinSDF, skinOut };
