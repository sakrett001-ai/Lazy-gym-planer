/* Рычажные тренажёры (G4): общий узел передачи «рычаг → кулачок → блоки → стек».
   Физика одна на все тренажёры. Кулачок жёстко сидит на оси рычага, ось рычага совпадает с осью сустава. Трос 4,8 мм
   закреплён на кулачке (зажим у начала профиля), лежит в его канавке и сходит по касательной к первому неподвижному блоку,
   дальше — по касательным между блоками (колёса Ø9–11,5 на кронштейнах рамы) и вниз к верхней плите стека (1:1) или
   к подвижному блоку на ней (2:1, общий стек G3 — E.cableStack). Весь путь троса лежит в одной плоскости, перпендикулярной
   оси рычага (плоскость канавки кулачка).
   * Плечо троса p — расстояние от оси рычага до прямой схода троса с кулачка. Момент сопротивления на оси τ = m·g·k·p,
     где k — передаточное отношение стека (1 — 1:1, 0,5 — 2:1).
   * Длина пути троса L — дуга на кулачке от зажима до точки схода + отрезки и дуги на блоках до точки, откуда трос идёт
     к стеку. Поворот рычага на dφ наматывает dL = p·dφ (виртуальная работа), поэтому подъём стека Δh = k·(L − L₀) = k·∫p dφ
     и m·g·Δh = ∫τ dφ. Здесь подъём считается из длины пути (как у настоящего троса), а проверка (tools/lever-stacks.test.js)
     сверяет его с k·∫p dφ, длину троса со стеком — на постоянство, касание — на каждом конце дуги.
   * Профиль кулачка — цепочка дуг с общими касательными (выпуклый, радиус кривизны не меньше радиуса самого малого блока):
     опорная функция h(ψ) = C_k·n(ψ) + ρ_k — плечо троса, когда нормаль к профилю в точке схода смотрит под углом ψ (в рамке
     рычага). Профиль подбирается по кривой «угол — момент» сустава (tools/mannequin/cam-design.js), здесь только геометрия.
   Привод троса (drive) бывает четырёх видов (kind):
   * 'cam' — кулачок на оси рычага (выше);
   * 'point' — трос закреплён в точке рычага at (без кулачка): плечо — расстояние от оси до прямой троса, меняется с углом;
   * 'block' — подвижный блок на рычаге в точке at: трос приходит от неподвижной точки dead, огибает блок и уходит к первому
     неподвижному блоку; на рычаг тянут обе ветви (сила 2T, ход троса вдвое больше хода блока);
   * 'sled' — трос закреплён на каретке, которая идёт по прямой направляющей rail (рычага нет).
   Общий стек могут тянуть несколько приводов (drives): подъём = k·(ΣL − L₀), у двух приводов через подвижный блок на верхней
   плите (k = 0,5, оба конца троса приходят сверху — дифференциал, E.cableStack: float.twin).
   Внутренние координаты: Y вверх, пол Y = 0, см. */
((E) => {
const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
const { V, M3, toCat, dirCat } = M, { BIND } = E, unit = V.unit;
/* трос 4,8 мм (3/16″, 7×19 — как у селекторных тренажёров) */
const CABLE_R = .24;
const TAU = 2 * Math.PI, rot90 = v => [-v[1], v[0]], ang2 = v => Math.atan2(v[1], v[0]), wrapPi = a => a - TAU * Math.floor((a + Math.PI) / TAU);
const add2 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k], sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]], dot2 = (a, b) => a[0] * b[0] + a[1] * b[1], scale2 = (a, k) => [a[0] * k, a[1] * k];
const dirAt = a => [Math.cos(a), Math.sin(a)], rotate2 = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * p[0] - s * p[1], s * p[0] + c * p[1]]; };
const bodyInt = (R, bind) => { const p = E.bodyPoint(R, bind); return [p[0], M.FLOOR - p[1], p[2]]; };

/* Плоскость троса: ось рычага (pivot, axis); e1 — направление ref (по умолчанию вперёд, +Z) в плоскости, e2 = e1 × A
   (для оси +X: e1 = +Z, e2 = +Y). 2D-координаты — от оси рычага; плоскость троса сдвинута вдоль оси на e.plane см. */
function plane(e) {
  const P = e.pivot, A = unit(e.axis || [1, 0, 0]);
  let e1 = V.perp(e.ref || [0, 0, 1], A); if (V.len(e1) < 1e-6) e1 = V.perp([0, 1, 0], A); e1 = unit(e1);
  const e2 = V.cross(e1, A), O = V.add(P, A, e.plane || 0);
  return { P, A, e1, e2, O, to2: p => { const d = V.sub(p, P); return [V.dot(d, e1), V.dot(d, e2)]; }, to3: q => V.add(V.add(O, e1, q[0]), e2, q[1]), dir3: q => V.add(V.scale(e1, q[0]), e2, q[1]) };
}
/* Угол рычага в плоскости: направление от оси к точке тела bind (как у BIND.g4lever) плюс доворот rot. anglePivot — точка,
   от которой берётся направление (у параллелограмма BIND.g4link — его виртуальная ось: плечи параллельны радиусу от неё) */
function leverAngle(e, R, pl = plane(e)) {
  const d = V.perp(V.sub(bodyInt(R, e.bind), e.anglePivot || pl.P), pl.A);
  return ang2([V.dot(d, pl.e1), V.dot(d, pl.e2)]) + (e.rot || 0) * Math.PI / 180;
}
/* Общая касательная двух окружностей со знаковыми радиусами (R > 0 — трос огибает окружность против часовой стрелки в
   плоскости e1, e2, R < 0 — по часовой; R = 0 — точка): трос идёт от i к j, центр окружности — слева от направления троса
   на R. Возвращает левую нормаль nl и точки касания. */
function tangent(Ci, Ri, Cj, Rj) {
  const D = sub2(Cj, Ci), L = Math.hypot(D[0], D[1]), c = (Rj - Ri) / L;
  if (!(L > 1e-9) || Math.abs(c) >= 1) return null;
  const u = [D[0] / L, D[1] / L], n = add2(scale2(u, c), rot90(u), Math.sqrt(1 - c * c));
  return { nl: n, Ti: add2(Ci, n, -Ri), Tj: add2(Cj, n, -Rj) };
}
/* дуга профиля, в которую попадает угол нормали ψ (рамка кулачка); вне профиля — ближайшая крайняя */
function arcOf(arcs, psi) {
  for (const k of arcs) if (psi >= k.a0 - 1e-9 && psi <= k.a1 + 1e-9) return k;
  return psi < arcs[0].a0 ? arcs[0] : arcs[arcs.length - 1];
}
const support = (arcs, psi) => { const k = arcOf(arcs, psi); return dot2(k.c, dirAt(psi)) + k.r; };
const camPoint = (arcs, psi, off = 0) => { const k = arcOf(arcs, psi); return add2(k.c, dirAt(psi), k.r + off); };
/* точки и длина троса на кулачке между углами нормали from и to (по дугам профиля, шаг не больше 4°) */
function camWrap(arcs, from, to) {
  const lo = Math.min(from, to), hi = Math.max(from, to), cuts = [lo];
  for (const k of arcs) for (const a of [k.a0, k.a1]) if (a > lo + 1e-9 && a < hi - 1e-9) cuts.push(a);
  cuts.push(hi); cuts.sort((a, b) => a - b);
  const pts = [camPoint(arcs, lo)]; let len = 0;
  for (let i = 1; i < cuts.length; i++) {
    const a = cuts[i - 1], b = cuts[i], k = arcOf(arcs, (a + b) / 2), n = Math.max(1, Math.ceil((b - a) / (4 * Math.PI / 180)));
    for (let j = 1; j <= n; j++) pts.push(add2(k.c, dirAt(a + (b - a) * j / n), k.r));
    len += k.r * (b - a);
  }
  return { pts: from <= to ? pts : pts.reverse(), len };
}
/* дуга на блоке от точки a к точке b в направлении s (+1 — против часовой) */
function pulleyWrap(C, r, s, a, b) {
  const t0 = ang2(sub2(a, C)), t1 = ang2(sub2(b, C)), d = s > 0 ? (t1 - t0 + TAU) % TAU : -((t0 - t1 + TAU) % TAU);
  const n = Math.max(1, Math.ceil(Math.abs(d) / (8 * Math.PI / 180))), pts = [];
  for (let j = 0; j <= n; j++) pts.push(add2(C, dirAt(t0 + d * j / n), r));
  return { pts, len: r * Math.abs(d) };
}

/* Состояние узла по позе. e: pivot, axis, bind, rot — как у рычага; plane — сдвиг плоскости троса вдоль оси; cam {arcs: [{c:
   [u, v], r, a0, a1}] — профиль по оси троса (рамка кулачка: u — от оси к точке тела, v — поворот от u к e2 при угле
   рычага 0), anchor — угол нормали у зажима, sense — направление огибания кулачка тросом (±1, как у блоков)};
   route [{c, r, s, id}] — неподвижные блоки по порядку (центры во внутренних координатах, в плоскости троса; id — деталь
   колеса, по ней аудит сверяет нарисованное колесо с расчётным); ratio — k;
   rest — длина пути троса, при которой стек стоит на остальных плитах; stack — общий стек G3 (o, R, sel, pitch, size, topY,
   maxLift, float). Возвращает угол рычага, точку схода и плечо троса, путь троса (3D) и его длину, подъём стека. */
/* Состояние одного привода d (поля — как у узла с одним приводом; kind — вид привода). Для 'point' и 'block' at — точка
   (центр подвижного блока) в рамке рычага: [вдоль радиуса к точке тела, поперёк], для 'sled' — смещение от точки на
   направляющей во внутренних осях. depart — направление троса с последнего блока (внутр. оси; по умолчанию вниз, к стеку).
   momentArm: у кулачка — плечо троса p; у точки и блока — |dL/dφ| (у блока — сумма плеч обеих ветвей); у каретки —
   доля хода каретки, идущая в трос (косинус между тросом и направляющей). */
function driveState(d, R) {
  const pl = plane(d), kind = d.kind || 'cam';
  const route = d.route.map(p => ({ C: pl.to2(p.c), r: p.r, s: p.s, R: p.s * p.r }));
  let al = null, psi = null, viol = 0, Tc, nl, p, pts, camLen = 0, L = 0, arrive, s = null, block = null;
  const segs = [], wraps = [];
  if (kind === 'cam') {
    const cam = d.cam, sc = cam.sense, arcs = cam.arcs;
    al = leverAngle(d, R, pl);
    /* сход с кулачка к первому блоку: дуга профиля, на которой лежит точка касания */
    const mid = (arcs[0].a0 + arcs[arcs.length - 1].a1) / 2;
    let best = null;
    for (const k of arcs) {
      const Ck = rotate2(k.c, al), t = tangent(Ck, sc * k.r, route[0].C, route[0].R);
      if (!t) continue;
      const ps = mid + wrapPi(ang2(scale2(t.nl, -sc)) - al - mid), vi = Math.max(k.a0 - ps, ps - k.a1, 0);
      if (!best || vi < best.viol) best = { k, t, psi: ps, viol: vi };
      if (vi === 0) break;
    }
    Tc = best.t.Ti; nl = best.t.nl; p = Math.abs(dot2(nl, Tc)); psi = best.psi; viol = best.viol;
    /* трос на кулачке: от зажима до точки схода */
    const wrapC = camWrap(arcs, cam.anchor, best.psi);
    pts = wrapC.pts.map(q => rotate2(q, al)); pts[pts.length - 1] = Tc;
    camLen = wrapC.len; L = wrapC.len; arrive = best.t.Tj;
  } else if (kind === 'point' || kind === 'block') {
    al = leverAngle(d, R, pl);
    const W = rotate2(d.at, al), vel = rot90(W);
    if (kind === 'point') {
      const t = tangent(W, 0, route[0].C, route[0].R);
      Tc = W; nl = t.nl; arrive = t.Tj; pts = [W];
      p = Math.abs(dot2(vel, sub2(arrive, W))) / Math.hypot(...sub2(arrive, W));
    } else {
      /* подвижный блок: ветвь от неподвижной точки dead к блоку, дуга на блоке, ветвь к первому неподвижному блоку */
      const D = pl.to2(d.dead), Rw = d.sense * d.wheel, t1 = tangent(D, 0, W, Rw), t2 = tangent(W, Rw, route[0].C, route[0].R);
      const w = pulleyWrap(W, d.wheel, d.sense, t1.Tj, t2.Ti);
      pts = [D, ...w.pts]; L = Math.hypot(...sub2(t1.Tj, D)) + w.len;
      segs.push({ from: D, to: t1.Tj }); block = { C: W, r: d.wheel, s: d.sense, a: t1.Tj, b: t2.Ti, len: w.len };
      Tc = t2.Ti; nl = t2.nl; arrive = t2.Tj;
      const u1 = scale2(sub2(t1.Tj, D), 1 / Math.hypot(...sub2(t1.Tj, D))), u2 = scale2(sub2(arrive, Tc), 1 / Math.hypot(...sub2(arrive, Tc)));
      p = Math.abs(dot2(vel, sub2(u1, u2)));
    }
  } else {
    /* каретка: проекция точки тела на направляющую (+ shift), точка крепления — со смещением at */
    const A = d.rail[0], B = d.rail[1], Z = unit(V.sub(B, A)), T = bodyInt(R, d.bind);
    s = Math.max(0, Math.min(V.dist(A, B), V.dot(V.sub(T, A), Z) + (d.shift || 0)));
    const W = pl.to2(V.add(V.add(A, Z, s), d.at || [0, 0, 0])), t = tangent(W, 0, route[0].C, route[0].R);
    Tc = W; nl = t.nl; arrive = t.Tj; pts = [W];
    const z2 = [V.dot(Z, pl.e1), V.dot(Z, pl.e2)], u = sub2(arrive, W);
    p = Math.abs(dot2(z2, u)) / Math.hypot(...u);
  }
  L += Math.hypot(...sub2(arrive, Tc));
  segs.push({ from: Tc, to: arrive });
  /* блоки: дуга на каждом, касательная к следующему; с последнего — по depart (по умолчанию вниз, к стеку) */
  const dep = d.depart || [0, -1, 0], down = (() => { const q = [V.dot(dep, pl.e1), V.dot(dep, pl.e2)], l = Math.hypot(q[0], q[1]); return [q[0] / l, q[1] / l]; })();
  for (let i = 0; i < route.length; i++) {
    const q = route[i];
    let leave, next = null;
    if (i + 1 < route.length) { const t = tangent(q.C, q.R, route[i + 1].C, route[i + 1].R); leave = t.Ti; next = t.Tj; }
    else leave = add2(q.C, rot90(down), -q.R);
    const w = pulleyWrap(q.C, q.r, q.s, arrive, leave);
    pts.push(...w.pts); L += w.len; wraps.push({ C: q.C, r: q.r, s: q.s, a: arrive, b: leave, len: w.len });
    if (next) { L += Math.hypot(...sub2(next, leave)); segs.push({ from: leave, to: next }); arrive = next; }
    else arrive = leave;
  }
  const u = al == null ? null : pl.dir3(dirAt(al)), v = al == null ? null : pl.dir3(dirAt(al + Math.PI / 2));
  return { kind, pl, alpha: al, psi, viol, contact: pl.to3(Tc), contact2: Tc, nl, momentArm: p, camLen, segs, wraps, block, s,
    L, pts3: pts.map(pl.to3), leave3: pl.to3(arrive), camO: pl.O, u, v };
}
/* Приводы узла: drives (у каждого — свои ось, точка тела, кулачок или точка, блоки и id деталей) или сам узел (один привод) */
const drivesOf = e => e.drives || [e];
/* Состояние узла: приводы и подъём стека k·(ΣL − rest). У одного привода поля привода — на верхнем уровне (как в этапе 1). */
function state(e, R) {
  const ds = drivesOf(e).map(d => driveState(d, R)), L = ds.reduce((s, q) => s + q.L, 0);
  const k = e.ratio ?? 1, raw = (L - (e.rest || 0)) * k, lift = Math.max(0, Math.min(e.stack ? e.stack.maxLift : Infinity, raw));
  /* подвижный блок 1:2 в колонне (mult): трос привода с блока колонны висит вниз на d = d0 − (L − rest) до проушины обоймы
     блока B; трос стека — от штока верхней плиты вверх, через верх B и вниз к неподвижной проушине dead (k = 2) */
  let mult = null;
  if (e.mult) {
    const d = e.mult.d0 - (L - (e.rest || 0)), top = V.add(ds[0].leave3, [0, -1, 0], d);
    mult = { d, top, c: V.add(top, [0, -1, 0], e.mult.r + 3) };
  }
  return { ...ds[0], drives: ds, L, rawLift: raw, lift, mult };
}

/* ---------- Кулачок: контур (рамка кулачка) и детали ---------- */
/* выпуклая оболочка (монотонная цепь), против часовой стрелки */
function hull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-9) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 1e-9) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/* Контур кулачка: профиль (дуги, сдвинутые на off от оси троса — дно канавки или обод щёк) с запасом за краями и ступица
   радиуса hub вокруг оси, выпуклая оболочка. Кэш по профилю. */
const OUTLINE = new WeakMap();
function outline(cam, off) {
  let m = OUTLINE.get(cam); if (!m) OUTLINE.set(cam, m = new Map());
  if (m.has(off)) return m.get(off);
  const pts = [], arcs = cam.arcs;
  for (const k of arcs) { const n = Math.max(2, Math.ceil((k.a1 - k.a0) / (3 * Math.PI / 180))); for (let j = 0; j <= n; j++) pts.push(add2(k.c, dirAt(k.a0 + (k.a1 - k.a0) * j / n), k.r + off)); }
  const hub = (cam.hub || 4.5) + Math.min(0, off);
  for (let j = 0; j < 36; j++) pts.push(scale2(dirAt(j / 36 * TAU), hub));
  const out = hull(pts).map(q => [+q[0].toFixed(3), +q[1].toFixed(3)]);
  m.set(off, out); return out;
}
/* Детали кулачка в позе: сердцевина (по дну канавки), две щеки (обод на 0,6 см за осью троса — трос лежит в канавке между
   ними), зажим троса у начала профиля. Рамка: c — центр в плоскости троса, u, v — оси профиля, w — ось рычага. */
function camParts(e, S) {
  const cam = e.cam, id = e.id, core = cam.core || 2, fl = cam.flange || .5, groove = CABLE_R + .1, rim = cam.rim || .6, out = [];
  const w = S.pl.A, frame = { u: dirCat(S.u), v: dirCat(S.v), w: dirCat(w) };
  const prism = (k, off, len, shift, tone, mount) => out.push({ kind: 'prism', c: toCat(V.add(S.camO, w, shift)), ...frame, pts: outline(cam, off), len, tone, role: 'frame', id: id + ':' + k, mount });
  prism('cam', -groove, core, 0, 'frame', e.mountTo);
  prism('flangeA', rim, fl, core / 2 + fl / 2, 'chrome', id + ':cam');
  prism('flangeB', rim, fl, -core / 2 - fl / 2, 'chrome', id + ':cam');
  /* зажим: колодка на дне канавки у начала профиля */
  const n2 = dirAt(cam.anchor), a2 = camPoint(cam.arcs, cam.anchor, -groove - .6), n3 = V.add(V.scale(S.u, n2[0]), S.v, n2[1]), t3 = V.cross(w, n3);
  const c3 = V.add(V.add(S.camO, S.u, a2[0]), S.v, a2[1]);
  out.push({ kind: 'obox', c: toCat(c3), x: dirCat(n3), y: dirCat(t3), z: dirCat(w), size: [1.2, 2.6, core + 2 * fl + .4], round: .3, tone: 'chrome', role: 'frame', id: id + ':clamp', mount: id + ':cam' });
  return out;
}
/* Трос с кулачком и стек. Детали: кулачок (id:cam, id:flangeA/B, id:clamp), трос (id:cable — от зажима по кулачку, по блокам
   до точки, откуда идёт к стеку), стек — общий G3 (id:stk…, трос от штока верхней плиты к последнему блоку). */
BIND.g4camCable = (e, R) => {
  const S = state(e, R), out = [];
  drivesOf(e).forEach((d, i) => {
    const q = S.drives[i], id = d.id || e.id, kind = d.kind || 'cam';
    if (kind === 'cam') out.push(...camParts({ ...d, id }, q));
    /* подвижный блок на рычаге: колесо, ось в двух щеках, щёки — на детали рычага mountTo */
    if (kind === 'block') {
      const A = q.pl.A, c3 = q.pl.to3(q.block.C), w = dirCat(A), half = 1.9, fd = q.pl.dir3(dirAt(q.alpha + Math.PI)), fl = d.wheel + (d.fork || 3);
      out.push({ kind: 'cyl', c: toCat(c3), axis: w, r: d.wheel, len: 2.4, sides: 24, tone: 'chrome', role: 'frame', id: id + ':block', mount: id + ':blockAxle' });
      out.push({ kind: 'cyl', c: toCat(c3), axis: w, r: .6, len: 2 * half + 1.2, sides: 12, tone: 'chrome', role: 'frame', id: id + ':blockAxle', mount: id + ':blockForkA' });
      for (const [k, sg] of [['A', 1], ['B', -1]]) out.push({ kind: 'obox', c: toCat(V.add(V.add(c3, A, sg * half), fd, (fl - 1.2) / 2)), x: w, y: dirCat(fd), z: dirCat(V.cross(A, fd)), size: [.7, fl + 1.2, 3], round: .2, tone: 'frame', role: 'frame', id: id + ':blockFork' + k, mount: d.mountTo });
    }
    const pts = q.pts3.concat(i === 0 && S.mult ? [S.mult.top] : []);
    out.push({ kind: 'cable', pts: pts.map(toCat), r: CABLE_R, tone: 'cable', role: 'cable', id: id + ':cable', mount: kind === 'cam' ? id + ':cam' : kind === 'block' ? id + ':block' : d.mountTo });
  });
  if (e.stack) out.push(...E.cableStack.parts(e.stack, S.lift, e.id, e.rodPart, CABLE_R, !!S.mult));
  if (S.mult) out.push(...multParts(e, S));
  return out;
};
/* Подвижный блок 1:2 в колонне: колесо B (ось — X стека), ось в обойме из двух щёк, мостик обоймы с проушиной троса привода;
   трос стека от штока верхней плиты вверх к B (сторона −Z стека), по верху B и вниз к проушине dead (сторона +Z, перед плитами) */
function multParts(e, S) {
  const st = e.stack, mu = e.mult, sid = e.id + ':stk', X = M3.col(st.R, 0), Y = M3.col(st.R, 1), Z = M3.col(st.R, 2), r = mu.r, half = 1.9, out = [];
  const c = S.mult.c, fl = r + 1.5, ax = dirCat(X), up = [0, 1, 0];
  out.push({ kind: 'cyl', c: toCat(c), axis: ax, r, len: 2.4, sides: 24, tone: 'chrome', role: 'frame', id: sid + 'Mult', mount: sid + 'MultAxle' });
  out.push({ kind: 'cyl', c: toCat(c), axis: ax, r: .6, len: 2 * half + 1.2, sides: 12, tone: 'chrome', role: 'frame', id: sid + 'MultAxle', mount: sid + 'MultForkA' });
  for (const [k, sg] of [['A', 1], ['B', -1]]) out.push({ kind: 'obox', c: toCat(V.add(V.add(c, X, sg * half), up, (fl - 1.2) / 2)), x: ax, y: dirCat(up), z: dirCat(Z), size: [.7, fl + 1.2, 3], round: .2, tone: 'frame', role: 'frame', id: sid + 'MultFork' + k, mount: sid + 'MultBridge' });
  out.push({ kind: 'obox', c: toCat(V.add(c, up, fl + .75)), x: ax, y: dirCat(up), z: dirCat(Z), size: [2 * half + .7, 1.5, 3], round: .3, tone: 'frame', role: 'frame', id: sid + 'MultBridge', mount: e.id + ':cable' });
  /* трос стека: шток → B → dead */
  const stem = V.add(st.o, Y, S.lift + st.sel * st.pitch + 2 + 8), pts = [stem];
  for (let j = 0; j <= 8; j++) { const a = Math.PI * j / 8; pts.push(V.add(V.add(c, Z, -r * Math.cos(a)), up, r * Math.sin(a))); }
  pts.push(mu.dead);
  out.push({ kind: 'cable', pts: pts.map(toCat), r: CABLE_R, tone: 'cable', role: 'cable', id: sid + 'Cable', mount: sid + 'Stem' });
  return out;
}

/* ---------- Неподвижные узлы рамы ---------- */
/* Блок на кронштейне: колесо радиуса r (ось axis), ось колеса в двух щеках вилки, мостик вилки на расстоянии r + 1,5 см
   от оси в сторону dir (в плоскости колеса, со стороны, свободной от троса) крепится к детали mount. t — сборщик снаряда
   или узел E.cableStack.Sub (те же tube/box/cyl). Возвращает точку, куда упирается мостик (там должна быть деталь mount). */
function pulley(t, k, c, r, { axis = [1, 0, 0], dir, mount, half = 1.9 }) {
  const A = unit(axis), d = unit(dir), w = V.cross(A, d), L = r + 1.5;
  t.cyl(k, c, A, r, 2.4, { mount: k + 'Axle', tone: 'chrome' });
  t.cyl(k + 'Axle', c, A, .6, 2 * half + 1.2, { mount: k + 'ForkA', tone: 'chrome' });
  for (const [kk, sg] of [['A', 1], ['B', -1]]) t.box(k + 'Fork' + kk, V.add(V.add(c, A, sg * half), d, (L - 1.2) / 2), [.7, L + 1.2, 3], { axes: [A, d, w], mount: k + 'Bridge', round: .2 });
  t.box(k + 'Bridge', V.add(c, d, L + .75), [2 * half + .7, 1.5, 3], { axes: [A, d, w], mount, round: .3 });
  return V.add(c, d, L + 1.5);
}
/* Колонна стека: поперечина основания на балке рамы (mount), две стойки 7,5 × 7,5, верхняя балка, общий стек G3 (направляющие,
   нижние плиты, рамка и stackInfo), блок под верхней балкой — его колесо сходом вниз попадает в ось стека (трос к нему
   подходит со стороны +Z узла, перед плитами). at — центр стека на полу, H — высота колонны, r — радиус верхнего блока.
   Ключи деталей — с префиксом pre; возвращает центр верхнего блока и высоту схода (topY) во внутренних координатах. */
function column(b, pre, { at, H, n = 15, sel = 5, r = 5, mount, X = 27, yaw = 0, mult = 0 }) {
  const t = E.cableStack.Sub(b, pre, at, yaw);
  /* подвижный блок 1:2 (mult — его радиус): блок колонны сдвинут вперёд на mult — трос с него висит над осью блока B;
     проушина неподвижного конца троса стека — на кронштейне основания перед плитами (сторона +Z, на 2·mult от оси стека) */
  if (mult) {
    t.tube('deadArm', [0, 3.75, 3.5], [0, 3.75, 2 * mult + 2], [4, 7.5], { mount: 'baseM' });
    t.box('deadEnd', [0, 8.5, 2 * mult], [2.5, 2, 2.5], { mount: 'deadArm', tone: 'chrome', round: .4 });
    t.anchor('dead', [0, 9.3, 2 * mult]);
  }
  t.tube('baseM', [-X - 4, 3.75, 0], [X + 4, 3.75, 0], [8, 7.5], { mount: '/' + mount });
  for (const [k, x] of [['L', X], ['R', -X]]) {
    t.tube('foot' + k, [x, 3.75, -26], [x, 3.75, 22], [7.5, 7.5], { mount: 'baseM' });
    t.tube('up' + k, [x, 7.5, 0], [x, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    t.tube('brace' + k, [x, 7.5, -24], [x, 58, -3.75], [5, 5], { mount: 'foot' + k, up: [1, 0, 0] });
  }
  t.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
  const topY = H - 7.5 - 3 - r, wc = [0, topY, r + mult];
  E.cableStack.stack(t, { H, n, sel, base: 'baseM', topY });
  /* блок, сдвинутый вперёд (mult), — на консоли от верхней балки */
  if (mult) t.tube('wheelArm', [0, H - 3.75, 3], [0, H - 3.75, r + mult + 2.5], [6, 7.5], { mount: 'top' });
  pulley(t, 'pulley', wc, r, { dir: [0, 1, 0], mount: mult ? 'wheelArm' : 'top' });
  return { wheel: t.P(wc), r, topY, H };
}
E.leverStack = { CABLE_R, plane, leverAngle, tangent, support, camPoint, camWrap, driveState, drivesOf, state, outline, hull, camParts, pulley, column };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
