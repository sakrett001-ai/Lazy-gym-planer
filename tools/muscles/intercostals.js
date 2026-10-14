'use strict';
/* Межрёберные мышцы (anatomy.js, раздел 7) — пласты между рёбрами, а не трубки вдоль линий действия.
   Волокна межрёберных — длиной в одно межреберье (≈ 2 см), сама мышца — пласт толщиной 2–5 мм на всю длину промежутка.
   Грудной отдел манекена жёсткий (шарнир L2/L3 ниже): грудная клетка — одна кость скелета (ribcage), и пласт строится
   один раз в её рамке (локальные см: X — влево, Y — вверх, Z — вперёд) и движется вместе с ней.

   Анатомия (Gray's Anatomy, 1918, с. 403; OpenStax Anatomy and Physiology 2e, 11.4):
   - наружные межрёберные (11 с каждой стороны) — от бугорков рёбер сзади до хрящей рёбер спереди (дальше к грудине —
     наружная межрёберная мембрана); волокна вниз и вперёд, от нижнего края верхнего ребра к верхнему краю нижнего;
   - внутренние межрёберные — от грудины (между хрящами истинных рёбер; у ложных — от передних концов хрящей) назад до
     углов рёбер (дальше к позвоночнику — внутренняя межрёберная мембрана); волокна вниз и назад, глубже наружных.
   Самые внутренние межрёберные (innermost) не рисуются: они лежат под внутренними и снаружи не видны; их толщина входит
   в толщину внутреннего пласта (УЗИ меряет межрёберные мышцы целиком).

   Как строится промежуток k (между рёбрами k и k+1) с каждой стороны:
   1. Сетка грудной клетки делится на части (компоненты связности): 12 костных рёбер с каждой стороны и грудина с
      хрящами (одна большая часть).
   2. Грудная клетка режется полуплоскостями через её вертикальную ось (x = 0, z — средняя по вершинам сетки) с шагом 1°
      по азимуту θ — от позвоночника (θ ≈ 170°) через бок (90°) к грудине (0°). В сечении каждое ребро и каждый хрящ —
      замкнутый контур. Костное ребро узнаётся по своей части сетки; хрящ — по непрерывности: контур хряща продолжает контур
      своего ребра (или хряща) на прошлом шаге (между концом костного ребра и хрящом в сетке бывает разрыв 1–2° — помнится
      последний контур ребра); где хрящи сливаются (хрящи 8–10 с хрящом выше, хрящи с грудиной), контур несёт номера
      обоих — там промежуток кончается.
   3. В сечении θ промежуток — от нижнего края контура ребра k до верхнего края контура ребра k+1. Край — самая нижняя
      (верхняя) точка контура; наружная губа края — самая наружная точка в полосе 2 мм у края, внутренняя — самая
      внутренняя в полосе 5 мм. Губы сглаживаются по θ (окно ±2°), промежуток прореживается до шага ≈ 1 см.
   4. Края пласта — на крае ребра на глубине наружной поверхности слоя: наружный слой — на 0,5 мм глубже наружных губ
      (рёбра чуть выступают), внутренний — сразу под наружным, но не глубже внутренних губ больше чем на 1 мм (intDepth).
      Затем край ставится по самой кости (snap): поперёк промежутка ищется, где кончается ребро, и край заходит под него на
      1,5 мм — между пластом и ребром нет щели, а на ребро пласт не наползает.
   5. Толщина (fixtures/anatomy.json, intercostal): УЗИ здоровых мужчин (Yoshida и др., 2019) — спереди у грудины
      2,40 мм (там только внутренние), сбоку 3,30 мм, сзади 4,46 мм (средние по промежуткам). Между слоями сбоку — по
      отношению масс наружных и внутренних у препаратов (Wilson и др., 2001: 52,5 / 34,4 г между углами рёбер и
      рёберно-хрящевыми соединениями) — 60 / 40 %. Сзади от углов рёбер внутренних нет (мембрана) — вся толщина наружная.
      Наружная: от бугорка до угла — 4,46 мм, от угла до бока (90°) — к 1,99 мм, дальше постоянная и у рёберно-хрящевого
      соединения сходит на нет (переход в мембрану, 6°). Внутренняя: от угла (0) к боку — 1,31 мм, к рёберно-хрящевому
      соединению — 2,40 мм, дальше до грудины — 2,40 мм. Внутренний пласт лежит сразу под наружным.
   Данные пласта (src/data/muscles.bin, sheets): верхний и нижний края наружной поверхности (a, b — точки в рамке грудной
   клетки, сзади вперёд) и толщина t в каждой точке (см). Внутреннюю поверхность строит приложение (Muscles.sheetMesh):
   сдвиг на t внутрь по нормали. */
const A = require('./fixtures/anatomy.json'), G = require('./geometry.js');
const DEG = Math.PI / 180;

/* ---------- грудная клетка: части сетки, рёбра по сторонам ---------- */
function ribcage(skel) {
  const b = skel.bones.find(x => x.name === 'ribcage'), n = b.pos.length / 3, P = [];
  for (let i = 0; i < n; i++) P.push([b.pos[3 * i], b.pos[3 * i + 1], b.pos[3 * i + 2]]);
  const par = Array.from({ length: n }, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let f = 0; f < b.idx.length; f += 3) for (const [u, v] of [[b.idx[f], b.idx[f + 1]], [b.idx[f + 1], b.idx[f + 2]]]) { const ru = find(u), rv = find(v); if (ru !== rv) par[ru] = rv; }
  const comp = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comp.get(r) || comp.set(r, []).get(r)).push(i); }
  const parts = [...comp.values()], mean = c => [0, 1, 2].map(k => c.reduce((s, i) => s + P[i][k], 0) / c.length);
  const sternum = parts.reduce((a, c) => (c.length > a.length ? c : a));
  /* рёбра стороны сверху вниз (локальная Y — вверх); правая сторона — X < 0 */
  const ribs = {};
  for (const s of ['R', 'L']) {
    ribs[s] = parts.filter(c => c !== sternum && Math.sign(mean(c)[0]) === (s === 'R' ? -1 : 1)).sort((u, v) => mean(v)[1] - mean(u)[1]);
    if (ribs[s].length !== 12) throw Error(`intercostals: рёбер (${s}) ${ribs[s].length}`);
  }
  /* номер части у каждой вершины: k — ребро k этой стороны, 0 — грудина с хрящами; отдельно для каждой стороны */
  const label = {};
  for (const s of ['R', 'L']) { const l = new Int8Array(n).fill(-1); for (const i of sternum) l[i] = 0; ribs[s].forEach((c, k) => { for (const i of c) l[i] = k + 1; }); label[s] = l; }
  let zc = 0; for (const p of P) zc += p[2]; zc /= n;
  return { b, P, ribs, sternum, label, zc };
}
const lateral = s => (s === 'R' ? -1 : 1);
/* азимут точки вокруг оси грудной клетки: 0° — вперёд, 90° — вбок (в сторону s), 180° — назад */
const azimuth = (C, s, p) => Math.atan2(lateral(s) * p[0], p[2] - C.zc) / DEG;

/* ---------- ориентиры рёбер ---------- */
/* бугорок ребра k — точка ребра у вершины поперечного отростка своего позвонка (самой наружной его точки); угол ребра —
   самая задняя точка ребра (не ближе к середине, чем бугорок); рёберно-хрящевое соединение — передний конец костного
   ребра (наименьший азимут; у свободных рёбер 11–12 — их конец). Всё — в рамке грудной клетки (позвонки грудного отдела
   у манекена — в той же рамке, что и грудная клетка). */
function landmarks(skel, C) {
  const out = {};
  for (const s of ['R', 'L']) {
    const g = lateral(s);
    out[s] = C.ribs[s].map((c, k) => {
      const pts = c.map(i => C.P[i]), vb = skel.bones.find(x => x.name === 'thoracic' + (k + 1));
      if (!vb || vb.seg !== 'thorax') throw Error('intercostals: позвонок T' + (k + 1));
      let tp = null; for (let i = 0; i < vb.pos.length; i += 3) { const q = [vb.pos[i], vb.pos[i + 1], vb.pos[i + 2]]; if (!tp || g * q[0] > g * tp[0]) tp = q; }
      const d = p => Math.hypot(p[0] - tp[0], p[1] - tp[1], p[2] - tp[2]);
      const tubercle = pts.reduce((a, p) => (d(p) < d(a) ? p : a));
      const back = pts.reduce((a, p) => (p[2] < a[2] ? p : a));
      const az = p => azimuth(C, s, p);
      const angle = az(back) <= az(tubercle) ? back : tubercle;
      const front = pts.reduce((a, p) => (az(p) < az(a) ? p : a));
      return { rib: k + 1, tubercle, angle, ccj: front, th: { tubercle: az(tubercle), angle: az(angle), ccj: az(front) } };
    });
  }
  return out;
}

/* ---------- сечение грудной клетки полуплоскостью ---------- */
/* контуры сечения: точки (мир — рамка грудной клетки), r — расстояние от оси, y; номер части (ребро стороны s или 0) */
function section(C, s, th) {
  const { b, P, zc } = C, lab = C.label[s], d = [lateral(s) * Math.sin(th * DEG), Math.cos(th * DEG)], nn = [d[1], -d[0]];
  const sd = P.map(p => p[0] * nn[0] + (p[2] - zc) * nn[1]);
  const pt = new Map(), link = new Map(), key = (i, j) => (i < j ? i * 65536 + j : j * 65536 + i);
  const add = (u, v) => { (link.get(u) || link.set(u, []).get(u)).push(v); };
  for (let f = 0; f < b.idx.length; f += 3) {
    const v = [b.idx[f], b.idx[f + 1], b.idx[f + 2]], cut = [];
    for (let e = 0; e < 3; e++) {
      const i = v[e], j = v[(e + 1) % 3], a = sd[i], c = sd[j];
      if ((a < 0) === (c < 0)) continue;
      const k = key(i, j);
      if (!pt.has(k)) {
        const t = a / (a - c), q = [0, 1, 2].map(m => P[i][m] + (P[j][m] - P[i][m]) * t);
        pt.set(k, { q, r: q[0] * d[0] + (q[2] - zc) * d[1], lab: lab[i] });
      }
      cut.push(k);
    }
    if (cut.length === 2) { add(cut[0], cut[1]); add(cut[1], cut[0]); }
  }
  /* контуры — связные группы рёбер сетки, пересечённых плоскостью */
  const seen = new Set(), loops = [];
  for (const k0 of pt.keys()) {
    if (seen.has(k0)) continue;
    const stack = [k0], pts = []; seen.add(k0);
    while (stack.length) { const k = stack.pop(); pts.push(pt.get(k)); for (const m of link.get(k) || []) if (!seen.has(m)) { seen.add(m); stack.push(m); } }
    const lab0 = pts[0].lab;
    if (lab0 < 0 || pts.some(p => p.r <= 0)) continue;             /* другая сторона или за осью */
    const ys = pts.map(p => p.q[1]), rs = pts.map(p => p.r);
    loops.push({ pts, part: lab0, y0: Math.min(...ys), y1: Math.max(...ys), r0: Math.min(...rs), r1: Math.max(...rs), ry: [rs.reduce((x, v) => x + v, 0) / rs.length, ys.reduce((x, v) => x + v, 0) / ys.length] });
  }
  return loops;
}
const overlap = (a0, a1, b0, b1, tol) => a0 <= b1 + tol && b0 <= a1 + tol;

/* ---------- края промежутков по всем сечениям ---------- */
const STEP = 1, TH0 = 178, LIP = .2;
function edges(C, s) {
  let prev = [];
  const out = new Map(), mem = new Map();   /* k → Map(θ → образец); mem — последний контур ребра k (между концом костного
                                                ребра и началом хряща в сетке бывает разрыв в 1–2°) */
  for (let th = TH0; th >= 0; th -= STEP) {
    const loops = section(C, s, th);
    for (const l of loops) {
      if (l.part > 0) { l.ribs = new Set([l.part]); continue; }
      /* хрящ: номера тех контуров прошлого шага, с которыми он перекрывается (по высоте и глубине); иначе — ближайшего
         из контуров прошлого шага и недавно пропавших рёбер */
      let m = prev.filter(p => overlap(l.y0, l.y1, p.y0, p.y1, .15) && overlap(l.r0, l.r1, p.r0, p.r1, .4));
      if (!m.length) {
        const cand = [...prev, ...[...mem.values()].filter(x => x.th - th <= 5).map(x => x.loop)];
        const near = cand.map(p => [p, Math.hypot(p.ry[0] - l.ry[0], p.ry[1] - l.ry[1])]).filter(([, dd]) => dd < 1.5).sort((u, v) => u[1] - v[1]);
        if (near.length) m = [near[0][0]];
      }
      l.ribs = new Set(m.flatMap(p => [...p.ribs]));
    }
    for (const l of loops) if (l.ribs.size === 1) mem.set([...l.ribs][0], { loop: l, th });
    for (let k = 1; k <= 11; k++) {
      if (loops.some(l => l.ribs.has(k) && l.ribs.has(k + 1))) continue;     /* хрящи слились */
      const up = loops.filter(l => l.ribs.has(k)), lo = loops.filter(l => l.ribs.has(k + 1));
      if (!up.length || !lo.length) continue;
      /* пара контуров на одной глубине (ребро у шейки может попасть в сечение дважды) */
      let best = null;
      for (const u of up) for (const v of lo) { const dd = Math.abs(u.ry[0] - v.ry[0]); if (!best || dd < best[2]) best = [u, v, dd]; }
      const [u0, v0] = best, U = up.filter(l => overlap(l.r0, l.r1, u0.r0, u0.r1, .5)).flatMap(l => l.pts), V = lo.filter(l => overlap(l.r0, l.r1, v0.r0, v0.r1, .5)).flatMap(l => l.pts);
      const yU = Math.min(...U.map(p => p.q[1])), yV = Math.max(...V.map(p => p.q[1]));
      if (yU - yV < .15) continue;
      /* между краями не должно быть других рёбер и хрящей */
      const r0 = Math.min(u0.r0, v0.r0) - 1, r1 = Math.max(u0.r1, v0.r1) + 1;
      if (loops.some(l => !l.ribs.has(k) && !l.ribs.has(k + 1) && overlap(l.y0, l.y1, yV + .05, yU - .05, 0) && overlap(l.r0, l.r1, r0, r1, 0))) continue;
      /* наружная губа — самая наружная точка в полосе LIP у края, внутренняя — самая внутренняя в полосе 2,5·LIP (у
         скруглённого края ребра его внутренняя поверхность начинается чуть дальше от края) */
      const lip = (pts, y, sgn) => { const near = d => pts.filter(p => sgn * (p.q[1] - y) < d); return { out: near(LIP).reduce((a, p) => (p.r > a.r ? p : a)).q, inn: near(2.5 * LIP).reduce((a, p) => (p.r < a.r ? p : a)).q }; };
      const a = lip(U, yU, 1), bb = lip(V, yV, -1);
      (out.get(k) || out.set(k, new Map()).get(k)).set(th, { th, a: a.out, ai: a.inn, b: bb.out, bi: bb.inn });
    }
    prev = loops;
  }
  return out;
}

/* ---------- толщина по литературе ---------- */
const meanOf = o => { const v = Object.values(o).map(x => x[0]); return v.reduce((x, y) => x + y, 0) / v.length; };
function thickness() {
  const Y = A.intercostal.yoshida2019, W = A.intercostal.wilson2001;
  const ant = meanOf(Y.anterior) / 10, lat = meanOf(Y.lateral) / 10, post = meanOf(Y.posterior) / 10;   /* мм → см */
  const fExt = W.external / (W.external + W.internal);
  return { ant, lat, post, fExt, ext: { post, lat: fExt * lat }, int: { lat: (1 - fExt) * lat, ant } };
}
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
/* толщина слоя (см) в азимуте th промежутка с ориентирами L: {angle, ccj} (азимуты), lateral — 90° */
function layerThickness(layer, th, L, T) {
  const LAT = 90, TAPER = 6;
  if (layer === 'ext') {
    const t = th >= L.angle ? T.ext.post : th >= LAT ? lerp(T.ext.lat, T.ext.post, (th - LAT) / (L.angle - LAT)) : T.ext.lat;
    return t * smooth((th - L.ccj) / TAPER);
  }
  if (th >= L.angle) return 0;
  if (th >= LAT) return lerp(0, T.int.lat, (L.angle - th) / (L.angle - LAT));
  if (th >= L.ccj) return lerp(T.int.lat, T.int.ant, (LAT - th) / (LAT - L.ccj));
  return T.int.ant;
}

/* ---------- пласты ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], addv = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
const INSET = .05, OVER = .15, SPACING = 1;
const dotv = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/* Глубина наружной поверхности внутреннего слоя под наружными губами рёбер: сразу под наружным слоем (INSET + его
   толщина), но не глубже, чем позволяют рёбра манекена: внутренний слой не выходит внутрь грудной клетки дальше 1 мм за
   внутренние губы краёв рёбер (span — глубина края ребра, см). Сзади, где наружный слой толстый (4,5 мм), а рёбра
   манекена у края тоньше, внутренний слой поднимается и частью лежит внутри наружного — его там всё равно не видно; не
   выше 0,8 мм под наружной поверхностью наружного слоя (иначе поверхности совпали бы). */
function intDepth(th, L, T, span) {
  const te = layerThickness('ext', th, L, T), ti = layerThickness('int', th, L, T);
  return Math.max(INSET + Math.min(te, .08), Math.min(INSET + te, span + .1 - ti));
}
/* точка края ребра на глубине D (см) под наружной губой O: по грани края от наружной губы O к внутренней I; глубже
   внутренней губы — дальше вглубь по нормали */
function atDepth(O, I, D, n) {
  const span = dotv(sub(O, I), n), s = span > .05 ? Math.min(1, D / span) : 0;
  const p = [0, 1, 2].map(j => O[j] + (I[j] - O[j]) * s), rest = D - s * Math.max(0, span);
  return rest > 0 ? addv(p, n, -rest) : p;
}
/* нормаль наружу у образца i (как у Muscles.sheetMesh: по средней линии и поперечнику, знак — по стороне) */
function normals(s, a, b) {
  return a.map((_, i) => {
    const i0 = Math.max(0, i - 1), i1 = Math.min(a.length - 1, i + 1);
    const t = sub(addv(a[i1], b[i1]), addv(a[i0], b[i0])), v = sub(b[i], a[i]);
    return unit(cross(t, v).map(x => x * (s === 'L' ? 1 : -1)));
  });
}
function build(skel) {
  const C = ribcage(skel), LM = landmarks(skel, C), T = thickness(), sheets = [], log = [];
  /* Край пласта по самой кости: от точки края p (на глубине слоя) поперёк промежутка (d — к другому краю) ищется, где
     кончается ребро; край ставится на OVER под ребро от этой границы. Губы краёв найдены в сечениях по азимуту и сглажены
     (±2°), а грань ребра на глубине слоя бывает дальше от губы: у хрящей и у шеек рёбер край без этой поправки заходил на
     ребро до 9 мм. Если от 6 мм под ребром до 8 мм к промежутку кости нет (край внутреннего слоя у внутренней губы),
     край просто сдвигается на OVER от промежутка. */
  const pbRib = G.prepareBones({ bones: [C.b] })[0], inside = q => G.insideBone(pbRib, q);
  const snap = (p, d) => {
    const u = unit(d), L = Math.hypot(...d), at = s => addv(p, u, s);
    let last = null;
    for (let s = -.6; s <= Math.min(.8, L / 2); s += .02) { if (inside(at(s))) last = s; else if (last !== null && s > 0) break; }
    if (last === null) return addv(p, u, -OVER);
    return at(last - OVER);
  };
  for (const s of ['R', 'L']) {
    const E = edges(C, s);
    for (let k = 1; k <= 11; k++) {
      const m = E.get(k); if (!m) throw Error(`intercostals: нет промежутка ${k} (${s})`);
      /* самый длинный непрерывный участок (пропуски до 3° — разрыв сетки между костным ребром и хрящом — не в счёт) */
      const ths = [...m.keys()].sort((x, y) => y - x); let run = [], cur = [];
      for (const th of ths) { if (cur.length && cur[cur.length - 1] - th > 3 * STEP + 1e-9) cur = []; cur.push(th); if (cur.length > run.length) run = cur; }
      const smp = run.map(th => m.get(th));
      /* сглаживание краёв по θ */
      const sm = key => smp.map((_, i) => { const w = smp.slice(Math.max(0, i - 2), i + 3).map(x => x[key]); return [0, 1, 2].map(j => w.reduce((x, p) => x + p[j], 0) / w.length); });
      const a = sm('a'), b = sm('b'), ai = sm('ai'), bi = sm('bi');
      const lm = [LM[s][k - 1], LM[s][k]];
      const L = { tubercle: Math.min(lm[0].th.tubercle, lm[1].th.tubercle), angle: Math.min(lm[0].th.angle, lm[1].th.angle), ccj: (lm[0].th.ccj + lm[1].th.ccj) / 2 };
      const n = normals(s, a, b), th = smp.map(x => x.th);
      for (const layer of ['ext', 'int']) {
        /* участок слоя: наружный — от бугорков до рёберно-хрящевых соединений, внутренний — от углов рёбер до конца промежутка спереди */
        const idx = th.map((t, i) => i).filter(i => (layer === 'ext' ? th[i] <= L.tubercle && th[i] >= L.ccj : th[i] <= L.angle));
        if (idx.length < 2) throw Error(`intercostals: пустой слой ${layer} в промежутке ${k} (${s})`);
        /* прореживание: шаг ≈ 1 см по средней линии, концы — всегда */
        const keep = [idx[0]];
        for (let j = 1; j < idx.length; j++) {
          const i = idx[j], p = keep[keep.length - 1], mi = addv(a[i], b[i]).map(x => x / 2), mp = addv(a[p], b[p]).map(x => x / 2);
          if (Math.hypot(...sub(mi, mp)) >= SPACING || j === idx.length - 1) keep.push(i);
        }
        const A2 = [], B2 = [], t = [];
        for (const i of keep) {
          /* край пласта — на крае ребра на глубине наружной поверхности пласта: по грани края между наружной и внутренней
             губами (внутренний слой лежит глубже — его края ближе к внутренней губе), с нахлёстом под ребро */
          const depth = layer === 'ext' ? INSET : intDepth(th[i], L, T, (dotv(sub(a[i], ai[i]), n[i]) + dotv(sub(b[i], bi[i]), n[i])) / 2);
          const pa = atDepth(a[i], ai[i], depth, n[i]), pb = atDepth(b[i], bi[i], depth, n[i]);
          A2.push(snap(pa, sub(pb, pa))); B2.push(snap(pb, sub(pa, pb)));
          t.push(layerThickness(layer, th[i], L, T));
        }
        /* у самого заднего образца внутреннего слоя толщина 0 — пласт начинается от угла ребра тонким краем */
        sheets.push({ name: `IC${layer === 'ext' ? 'e' : 'i'}${k}_${s.toLowerCase()}`, side: s, space: k, layer, a: A2, b: B2, t,
          th: keep.map(i => th[i]) });
      }
      log.push(`${s} ${k}: θ ${th[0]}…${th[th.length - 1]}°, бугорок ${L.tubercle.toFixed(0)}°, угол ${L.angle.toFixed(0)}°, рёберно-хрящевое ${L.ccj.toFixed(0)}°`);
    }
  }
  return { sheets, log, T, C, LM };
}
module.exports = { build, ribcage, landmarks, section, azimuth, thickness, layerThickness, normals };
