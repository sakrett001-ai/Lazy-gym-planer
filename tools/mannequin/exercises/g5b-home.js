'use strict';
/* G5b: упражнения с весом тела стоя и с домашними предметами (стена, дверь, стол, стул, скамья, ступень, диван).
   Оси: человек смотрит вдоль +Z, левая сторона тела — +X, Y вверх, см. Предметы — src/js/09bo-g5b-home.js.
   Порядок построения позы: корпус (углы, таз) → опора → стопы → кисти; стоя без других опор — balanceOver. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const SG = { L: 1, R: -1 };
const D = Math.PI / 180;
/* отжимания от стены: высота и разнос ладоней, плечо–запястье внизу/вверху, разворот локтей и пальцев */
const WP = { y: 149, x: 25, r0: 34, r1: 54.4, pl: .45, fx: .05 };
/* стойка: опорная точка под подушечкой стопы по положению голеностопа и развороту носка (yaw наружу, град) */
const footAt = (V, s, ankle, yaw) => { const g = SG[s], fw = V.unit([g * Math.sin(yaw * D), 0, Math.cos(yaw * D)]); return { sup: V.add([ankle[0], 0, ankle[1]], fw, 13.5), fw }; };
/* Разворот всей сцены на 180° вокруг вертикали: позы удобно строить лицом к +Z, а в атласе предмет
   (стена, дверь) не должен заслонять человека от камер «сверху»/«под углом» (они со стороны +Z). */
const turnPose = (C, q) => { q.root.p = [-q.root.p[0], q.root.p[1], -q.root.p[2]]; q.root.q = C.M.Q.fromM3(C.M3.mul(C.M3.ry(180), C.M.Q.toM3(q.root.q))); return q; };
const turnP = p => p && [-p[0], p[1], -p[2]];
const turnEq = list => list.map(e => ({ ...e, ...(e.at ? { at: turnP(e.at) } : {}), ...(e.from ? { from: turnP(e.from) } : {}), ...(e.axis ? { axis: turnP(e.axis) } : {}), yaw: ((e.yaw || 0) + 180) % 360 }));
/* корпус прямой линией, наклон theta (град) вперёд от вертикали вокруг голеностопов (ankle — [y, z]) */
function leanBody(C, theta, ankleY, ankleZ, { hipAbd = 3, dir = 1 } = {}) {
  const q = C.base(), a = theta * D, L = C.M.B.th + C.M.B.sk - .1;
  C.root(q, [0, ankleY + L * Math.cos(a), ankleZ + dir * L * Math.sin(a)], [0, Math.cos(a), dir * Math.sin(a)], [0, -dir * Math.sin(a), Math.cos(a)]);
  for (const s of S) { q[s].hip = [0, hipAbd, 0]; q[s].knee = 0; }
  return q;
}

/* Стопа на опоре с подушечкой у края: задний отдел поднят на heel, пальцы разогнуты на mtp (≤ heel);
   при mtp < heel носок свешивается за край опоры. sup — точка опоры под подушечкой, fwd — направление носка. */
function footEdge(C, q, s, sup, fwd, heel, mtp, pole, up = [0, 1, 0]) {
  const { V, M, M3 } = C, R0 = M3.frameYZ(up, fwd), R = M3.mul(R0, M3.rx(heel)), Rt = M3.mul(R0, M3.rx(heel - mtp));
  const ball = V.add(sup, M3.v(Rt, [0, -M.B.toeSole, 0])), o = V.sub(ball, M3.v(R, M.B.ball));
  const r = M.solveLeg(q, s, { o, R, toesR: Rt }, pole);
  if (r.reachError > .05) throw Error(`Нога ${s} не дотягивается до края опоры: ${r.reachError.toFixed(1)} см`);
  return r;
}
/* Упор лёжа: тело прямой линией от подушечек стоп (опора на высоте ballY, z = ballZ) к голове, угол alpha
   к горизонту (голова выше — плюс). Голеностоп: тыльное сгибание dorsi; mtp — предел разгибания пальцев
   (если пальцам не хватает, носок свешивается за край опоры). */
function plankBody(C, alpha, { ballZ = 0, ballY = 0, feetX = 10, dorsi = 6, mtpMax = 78, knee = 0 } = {}) {
  const { V, M } = C, q = C.base(), a = alpha * D, axis = [0, Math.sin(a), Math.cos(a)], belly = [0, -Math.cos(a), Math.sin(a)];
  const heel = 90 - alpha - dorsi, mtp = Math.min(heel, mtpMax);
  const R0 = C.M3.frameYZ([0, 1, 0], [0, 0, 1]), Rt = C.M3.mul(R0, C.M3.rx(heel - mtp)), R = C.M3.mul(R0, C.M3.rx(heel));
  const ankle = V.sub(V.add([0, ballY, ballZ], C.M3.v(Rt, [0, -M.B.toeSole, 0])), C.M3.v(R, M.B.ball));
  const legLen = Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(knee * D)) - .1;
  C.root(q, V.add(ankle, axis, legLen), axis, belly);
  for (const s of S) { q[s].hip = [0, 2, 0]; q[s].knee = knee; footEdge(C, q, s, [SG[s] * feetX, ballY, ballZ], [0, 0, 1], heel, mtp, belly); }
  return q;
}

/* пояс в упоре углом (этап Д): по ритму без смещений, k — 0 у прямых рук, 1 внизу */
const PIKE_GIRDLE = (C, k) => [0, 0];
/* Упор углом («перевёрнутая V»): ноги прямой линией от подушечек стоп под углом psi к горизонту (как plankBody),
   корпус наклонён вниз к голове на phi от горизонтали; сгибание в тазобедренных суставах = psi + phi. */
function pikeBody(C, psi, phi, opts) {
  const q = plankBody(C, psi, opts), p = phi * D, heel = 90 - psi - (opts.dorsi ?? 6), mtp = Math.min(heel, opts.mtpMax ?? 78);
  const belly = [0, -Math.cos(psi * D), Math.sin(psi * D)];
  C.root(q, q.root.p, [0, -Math.sin(p), Math.cos(p)], [0, -Math.cos(p), -Math.sin(p)]);
  for (const s of S) footEdge(C, q, s, [SG[s] * (opts.feetX ?? 10), opts.ballY ?? 0, opts.ballZ ?? 0], [0, 0, 1], heel, mtp, belly);
  return q;
}
/* раскладка упора углом. Низ: корпус под phi1, таз опускается, пока макушка не окажется в headGap см от опоры
   ладоней; ладони ставятся так, чтобы голова была чуть впереди кистей («между ладонями»).
   Верх: корпус под phi0, руки выпрямлены (psi0 подбирается). Сгибание в тазобедренных ограничено гибкостью
   задней поверхности бедра (≈ 80° + половина сгибания колена), поэтому колени чуть согнуты, а «V» не слишком острая. */
function pikeLayout(C, { phi0, phi1, opts, handX = 22, headGap = 4, floorY = 0, headAhead = 2 }) {
  const { V } = C;
  const body = (psi, phi, k) => { const q = pikeBody(C, psi, phi, opts); for (const s of S) C.rhythm(q, s, PIKE_GIRDLE(C, k)); q.neck = [C.lerp(0, -10, k), 0, 0]; return q; };
  const headTop = q => Math.min(...C.region(q, 'headAll').map(p => p[1]));
  /* низ: макушка в headGap см над опорой ладоней, голова чуть впереди кистей */
  const psi1 = C.solve1D(ps => headTop(body(ps, phi1, 1)) - floorY - headGap, -30, 80), head = C.fk(body(psi1, phi1, 1)).P.head;
  const wz = head[2] - headAhead, palm = S.map(s => [SG[s] * handX, floorY, wz + 5.6]), wrist = [handX - .5, floorY + 1.8, wz];
  /* верх: руки почти прямые (локоть ≈ 10°; сустав плеча — при поставленной руке, C.ghToward) */
  const psi0 = C.solve1D(ps => V.dist(C.ghToward(body(ps, phi0, 0), 'L', wrist), wrist) - 54.6, psi1, 85);
  return { psi0, phi0, psi1, phi1, palm, opts };
}
/* Хват за ребро опоры (край скамьи, сиденья, столешницы): центр хвата внутри ребра, большой палец вдоль ребра (thumb),
   кисть направлена по distal (от запястья к пальцам), пальцы обхватывают ребро. В отличие от C.grip направление кисти
   задаётся явно — ладонь лежит на верхней грани, а не «висит» на ребре. */
function edgeGrip(C, q, s, point, thumb, distal, pole) {
  const { V, M, M3 } = C, g = SG[s], Rh = M3.frameYZ(V.scale(V.unit(distal), -1), V.unit(thumb));
  const wrist = V.sub(point, M3.v(Rh, [-g * M.B.grip[0], M.B.grip[1], M.B.grip[2]]));
  const r = M.solveArmWrist(q, s, wrist, pole, Rh);
  q.hands = { ...(q.hands || {}), [s]: 'grip' };
  if (r.reachError > .05) throw Error(`Рука ${s} не дотягивается до края опоры: ${r.reachError.toFixed(1)} см`);
  return r;
}
/* Обратные отжимания от края опоры: корпус почти вертикален (наклон lean вперёд), ягодицы в gap см перед передней
   гранью опоры (edge), кисти держат ребро за спиной (пальцы вперёд-вниз на distal°), пятки на полу впереди.
   hipY — высота тазобедренных суставов. */
function dipTorso(C, hipY, o, k) {
  const q = C.base(), L = (a, b) => C.lerp(a, b, k), a = L(...o.pelvis) * D;
  C.root(q, [0, hipY, o.edge + 20], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [L(...o.lumbar), 0, 0]; q.thoracic = [L(...o.thoracic), 0, 0]; q.neck = [L(...o.neck), 0, 0];
  for (const s of S) { q[s].hip = [80, 5, 4]; q[s].knee = 30; q[s].girdle = [L(o.girdleTop[0], o.girdleBot[0]), L(o.girdleTop[1], o.girdleBot[1])]; }
  C.restOn(q, 'buttocks', [0, 0, o.edge + o.gap], [0, 0, 1], 0);
  return q;
}
const dipHand = (C, q, s, o) => { const lat = C.lat(q, s), dl = o.distal * D, R = C.M3.ry(SG[s] * (o.turn || 0)); return { point: [SG[s] * o.hx, o.top - o.gr, o.edge - o.gr], thumb: C.M3.v(R, C.V.scale(lat, -1)), distal: C.M3.v(R, [0, -Math.sin(dl), Math.cos(dl)]), lat }; };
/* k: 0 — верх (руки прямые), 1 — низ. Пятки — на полу: самая низкая точка пятки касается пола (прежде опора пятки стояла
   на 0,6 см над полом, и пятки висели над ним на 0,62–0,64 см во всех фазах) */
function dipBody(C, k, o, L) {
  const { V } = C, q = dipTorso(C, C.lerp(L.yTop, L.yBot, k), o, k);
  for (const s of S) C.heel(q, s, [SG[s] * o.feetX, 0, o.heelZ], 0, C.lerp(...o.toe, k), V.unit([SG[s] * .15, 1, .6]));
  for (const s of S) { const h = dipHand(C, q, s, o); edgeGrip(C, q, s, h.point, h.thumb, h.distal, V.unit(V.add([0, 0, -1], h.lat, o.flare ?? .25))); }
  return q;
}
/* высоты таза: вверху руки почти прямые (reachTop), внизу — локти согнуты (reachBot) */
function dipLayout(C, o) {
  const { V, M, M3 } = C;
  const reach = (y, k) => { const q = dipTorso(C, y, o, k), f = C.fk(q), h = dipHand(C, q, 'L', o), Rh = M3.frameYZ(V.scale(h.distal, -1), h.thumb);
    return V.dist(f.P.ghL, V.sub(h.point, M3.v(Rh, [-M.B.grip[0], M.B.grip[1], M.B.grip[2]]))); };
  const yTop = C.solve1D(y => reach(y, 0) - o.reachTop, 20, 90), yBot = C.solve1D(y => reach(y, 1) - o.reachBot, 0, yTop);
  return { yTop, yBot };
}
/* ---------- Отжимания телом-«доской» (plankBody) с ладонями на опоре: раскладка от нижней точки ----------
   Так же, как отжимания на коврике (g5a-floor.js, pushLayout с tilt): внизу предплечье почти вертикально, локоть над
   кистью; наклон tilt — назад против пальцев (тогда отведение запястья нулевое, разгибание — 90° − tilt). */
/* запястье ладони на опоре (та же рамка, что в C.palm; g5a-floor.js palmWrist) */
function palmWrist(C, s, point, fingers, up) {
  const { V, M } = C, M3 = M.M3, g = M.SIGN[s], y = V.scale(V.unit(V.perp(fingers, up)), -1), x = V.scale(V.unit(up), g), z = V.cross(x, y);
  return V.sub(point, M3.v(M3.cols(x, y, z), [-g * (M.B.palm.thick / 2 + .3), -5.6, 0]));
}
/* Ладонь на луче from + k·dir, при которой локоть над запястьем (вдоль нормали опоры n, наклонён на tilt° назад против
   пальцев F, а с lean° — назад и наружу) лежит на длине плеча от плечевого сустава позы qb (сустав — при поставленной руке: ритм пояса). Возвращает
   ладонь и полюс локтя (мировой вектор). */
function stackedPalm(C, qb, s, { from, dir, F, n = [0, 1, 0], tilt, lean = 0, lo = -30, hi = 45 }) {
  const { V } = C, a = tilt * D, side = V.unit(V.cross(n, F)), b = V.add(V.scale(F, -Math.cos(lean * D)), side, SG[s] * Math.sin(lean * D));
  const at = k => {
    const P = V.add(from, dir, k), W = palmWrist(C, s, P, F, n), E = V.add(W, V.add(V.scale(b, Math.sin(a)), n, Math.cos(a)), C.M.B.fa);
    let gh = C.fk(qb).P['gh' + s];
    for (let i = 0; i < 3; i++) gh = C.ghToward(qb, s, W, V.unit(V.perp(V.sub(E, gh), V.unit(V.sub(W, gh)))));
    return { P, W, E, gh };
  };
  return C.unhinted(() => {
    const k = C.solve1D(k => { const b = at(k); return C.M.B.ua - V.dist(b.gh, b.E); }, lo, hi), b = at(k);
    return { palm: b.P, pole: V.unit(V.perp(V.sub(b.E, b.gh), V.unit(V.sub(b.W, b.gh)))), k };
  });
}
/* направление между двумя единичными векторами (сферически) */
const slerpDir = (C, a, b, e) => { const { V } = C, d = Math.max(-1, Math.min(1, V.dot(a, b))), w = Math.acos(d); if (w < 1e-4) return a; return V.unit(V.add(V.scale(a, Math.sin((1 - e) * w)), b, Math.sin(e * w))); };
/* пальцы: развёрнуты наружу на out° от направления «к голове» (+Z) */
const fingersOut = (s, out) => { const a = out * D * SG[s]; return [Math.sin(a), 0, Math.cos(a)]; };
/* Ладонь на опоре (нормаль n) с наклоном на ребро вслед за боковым наклоном предплечья (доля roll, не больше rollMax°):
   как в g5a-floor.js pushPose — при разгибании запястья около 90° поворот кисти вокруг её оси запястью недоступен, и живая
   ладонь чуть заваливается; центр ладони поднят так, что нижний край касается опоры с поджатием 0,3 см */
function palmRolled(C, q, s, palm, F, n, pole, roll = 0, rollMax = 0) {
  const { V } = C;
  try { C.palm(q, s, palm, F, n, pole); } catch (err) { if (!roll) throw err; }
  if (!roll) return;
  for (let k = 0; k < 3; k++) {
    const f = C.fk(q), a = V.unit(V.sub(f.P['el' + s], f.P['wr' + s])), side = V.unit(V.cross(F, n)), lean = Math.asin(Math.max(-1, Math.min(1, V.dot(a, side))));
    const rho = Math.max(-rollMax, Math.min(rollMax, roll * lean / D)) * D, m = V.add(V.scale(n, Math.cos(rho)), side, Math.sin(rho));
    C.palm(q, s, V.add(palm, n, Math.max(0, C.M.B.palm.width / 2 * Math.abs(Math.sin(rho)) - .3)), F, m, pole);
  }
}
/* полюс локтя вверху в базисе тела [наружу, вверх, к стопам] (ax — ось тела от стоп к голове) */
const poleTop = (C, q, s, ax, p) => C.V.unit(C.V.add(C.V.add(C.V.scale(C.lat(q, s), p[0]), [0, 1, 0], p[1]), ax, -p[2]));
/* руки отжимания на опоре: полюс — от верхнего (в базисе тела) к нижнему (мировой вектор раскладки) */
function benchPushArms(C, q, L, P, e, ax, n = [0, 1, 0]) {
  S.forEach((s, i) => palmRolled(C, q, s, L.palm[i], L.F[i], n, slerpDir(C, poleTop(C, q, s, ax, P.pole0), L.pole1[i], e), P.roll, P.rollMax));
}

/* Отжимания от скамьи: скамья поперёк (ось X), ладони у ближнего края, пальцы вперёд и чуть наружу. Низ — от кистей под
   локтями (stackedPalm): ладони в edgeIn см от ближнего края (основание ладони у самого ребра), угол тела — такой, что грудь в
   gap см от скамьи (над верхней гранью — от неё, перед краем — от ребра). Верх — руки почти прямые, плечи опущены.
   Техника: ладони на краю скамьи чуть шире плеч, грудь опускается к краю (Bodybuilding.com, Incline Push-Up: «Place hands on
   edge of bench… slightly wider than shoulder width», «lower chest to edge»; NASM Exercise Library, Incline Push-Up: «slightly
   wider than shoulder-width», «chest nearly touches the bench», «elbows at approximately 45 degrees», «shoulders back and down»).
   Раскладка ладоней — как у отжиманий на коврике (g5a-floor.js, PUSH: x 36, пальцы наружу 13°, наклон предплечья внизу 10°).
   Прежде (4.73.0) ладони стояли по 24 см от середины, край скамьи — под грудью, вверху руки перпендикулярны телу: внизу
   предплечье было наклонено на 29° (кисть далеко впереди локтя). Теперь внизу 10°, локоть над кистью, локти 36° к корпусу; грудь упирается в ребро
   нижней частью грудины, поэтому локоть внизу согнут на 96° (на полу — 114°): глубже не пускает скамья. */
const INCP = { x: 36, out: 13, tilt: 10, edgeIn: 6.5, gap: 3, gBot: [-2, -14], gTop: [-4, 8], neck: [-6, -2], pole0: [.228, .599, .768], roll: 1, rollMax: 12 };
const INC = once(() => {
  const C = ctx([]), { V } = C, padY = 44, opts = { feetX: 9, dorsi: 6 }, P = INCP, F = S.map(s => fingersOut(s, P.out));
  const bodyB = a => { const q = plankBody(C, a, opts); for (const s of S) q[s].girdle = [...P.gBot]; q.neck = [P.neck[0], 0, 0]; return q; };
  const stack = a => { const qb = bodyB(a); return S.map((s, i) => stackedPalm(C, qb, s, { from: [SG[s] * P.x, padY, C.fk(qb).P['gh' + s][2]], dir: [0, 0, -1], F: F[i], tilt: P.tilt, lean: P.lean || 0 })); };
  const clear = a => {
    const edge = stack(a)[0].palm[2] - P.edgeIn, q = bodyB(a); let m = Infinity;
    for (let h = 14; h <= 49.8; h += 1) for (const ang of [0, .25, -.25]) { const p = C.chestPoint(q, h, ang); m = Math.min(m, p[2] >= edge ? p[1] - padY : Math.hypot(p[1] - padY, p[2] - edge)); }
    return m;
  };
  const a0 = C.solve1D(a => clear(a) - P.gap, 2, 45), st = stack(a0), palm = st.map(b => b.palm), edge = palm[0][2] - P.edgeIn;
  /* верх: руки почти прямые (плечевой пояс в протракции, как в позе) */
  const reach = a => { const q = plankBody(C, a, opts); for (const s of S) q[s].girdle = [...P.gTop]; const w = palmWrist(C, 'L', palm[0], F[0], [0, 1, 0]); return V.dist(C.ghToward(q, 'L', w), w) - 55.05; };
  const a1 = C.solve1D(reach, a0, 70);
  return { a0, a1, palm, F, pole1: st.map(b => b.pole), edge, zb: edge + 14.5, opts };
});

/* Отжимания с ногами на скамье: подушечки стоп на краю скамьи, пальцы обхватывают край, пятки вверх; ладони на полу.
   Низ: грудь в 5 см от пола, кисти под плечами; верх — руки выпрямлены. */
const PK = { phi0: 26, phi1: 39, headAhead: 7, opts: { feetX: 10, dorsi: 10, knee: 10 } };
const PKD = { phi0: 50, phi1: 60, headAhead: 6, opts: { ballY: 44, ballZ: 0, feetX: 9, dorsi: 10, knee: 10 } };
/* Отжимания с ногами на скамье: низ — грудь (или голова) в low см от коврика, кисти под локтями (stackedPalm, локоть отведён
   назад и наружу на lean°); верх — руки почти прямые.
   Техника: ладони на полу чуть шире плеч, плечи над запястьями, локти около 45° к корпусу, грудь почти у пола (NASM Exercise
   Library, Decline Push-Up: «slightly wider than shoulder-width», «elbows at approximately 45 degrees», «chest nearly touches
   the floor»; Healthline, Decline Push-Up: «shoulders over your wrists and elbows at 45 degrees»; ExRx, Decline Push-up:
   «slightly wider than shoulder width»).
   Тело вращается вокруг подушечек стоп на скамье высотой 44 см, и плечи между верхом и низом почти не смещаются вдоль пола
   (на коврике от низа к верху — на ~15 см, здесь — на 5 см с ритмом пояса). Поэтому чем ближе кисть к локтю внизу, тем дальше
   она позади плеча вверху и тем сильнее там разогнуто запястье (предел опоры ладонью — 90°): наклон внизу 14° — кисть вверху в
   9,8 см позади плеча, запястье 89°; 20° — 6,8 см и 86°; 30° — 2,0 см и 81°. Выбран наклон 30° (решение владельца по листу
   вариантов): вверху плечи почти над запястьями, как у Healthline, запястье не на пределе. Внизу предплечье наклонено на 30°
   назад против пальцев (кисть впереди локтя), локоть 118°, локти 44° к корпусу (каталог: 30–45°).
   Ширина ладоней — как на коврике (g5a-floor.js PUSH); ладонь вверху чуть заваливается на ребро; плечевой пояс вверху опущен
   на 6° (сильнее — межрёберные первого промежутка выходят над кожей, npm run muscles:check), внизу поднят на 12°. Прежде
   (4.73.0) ладони стояли по 24 см от середины, запястья — в 11 см впереди плеч внизу: предплечье внизу было наклонено на ~85°,
   локти — 55° к корпусу. */
const DECP = { x: 36, out: 13, tilt: 30, lean: 25, low: 3.5, gBot: [12, -14], gTop: [-6, 8], neck: [-8, -12], pole0: [.331, -.296, .896], roll: 1, rollMax: 14 };
/* Ладони — на коврике, как у всех отжиманий на полу (g5a-floor.js: MAT = 1 см, PUSH_MAT): вверху ладонь заваливается на
   ребро, и пальцы видимой кожи Anny (полнее процедурной кисти) на голом полу уходили в него на 3 см при допуске 2,5
   (npm run anny:check). Скамья стоит на полу перед ковриком. */
const DEC_MAT = 1, DEC_MAT_E = { type: 'mat', id: 'mat', len: 160, width: 100, at: [0, 0, 120] };
const lowestFront = (C, q, h0 = 26, h1 = 49.8) => { let best = null; for (let h = h0; h <= h1; h += 1) for (const a of [0, .25, -.25]) { const p = C.chestPoint(q, h, a); if (!best || p[1] < best[1]) best = p; } return best; };
const DEC = once(() => {
  const C = ctx([]), { V } = C, opts = { ballY: 44, ballZ: 0, feetX: 9, dorsi: 12, mtpMax: 58 }, P = DECP, F = S.map(s => fingersOut(s, P.out));
  const low = a => { const q = plankBody(C, a, opts); q.neck = [P.neck[1], 0, 0]; return Math.min(lowestFront(C, q)[1], ...C.region(q, 'headAll').map(p => p[1])); };
  const ab = C.solve1D(a => low(a) - DEC_MAT - P.low, -45, 15), qb = plankBody(C, ab, opts);
  qb.neck = [P.neck[1], 0, 0]; for (const s of S) qb[s].girdle = [...P.gBot];
  const st = S.map((s, i) => stackedPalm(C, qb, s, { from: [SG[s] * P.x, DEC_MAT, C.fk(qb).P['gh' + s][2]], dir: [0, 0, -1], F: F[i], tilt: P.tilt, lean: P.lean || 0 }));
  const palm = st.map(b => b.palm);
  const reach = a => { const q = plankBody(C, a, opts); for (const s of S) q[s].girdle = [...P.gTop]; const w = palmWrist(C, 'L', palm[0], F[0], [0, 1, 0]); return V.dist(C.ghToward(q, 'L', w), w) - 55.05; };
  const at = C.solve1D(reach, ab, 40);
  return { ab, at, palm, F, pole1: st.map(b => b.pole), opts };
});

const PIKE = once(() => pikeLayout(ctx([]), PK));
const PIKED = once(() => pikeLayout(ctx([]), PKD));

/* обратные отжимания: скамья поперёк (передняя грань z = 0), стул передним краем к z = 0 */
const BDIP = { top: 44, edge: 0, gr: 2.2, hx: 21, gap: 2.5, distal: 38, feetX: 11, heelZ: 80, toe: [30, 40], flare: .25,
  pelvis: [4, -4], lumbar: [0, 4], thoracic: [2, 12], neck: [4, 2], girdleTop: [-4, -6], girdleBot: [8, -14], reachTop: 54.6, reachBot: 44.3 };
const CDIP = { top: 45, edge: 0, gr: 1.5, hx: 15, gap: 2.5, distal: 38, turn: 20, feetX: 11, heelZ: 55, toe: [18, 24], flare: .2,
  pelvis: [4, -4], lumbar: [0, 4], thoracic: [2, 12], neck: [4, 2], girdleTop: [-4, -6], girdleBot: [8, -14], reachTop: 54.6, reachBot: 43 };
const BDIP_L = once(() => dipLayout(ctx([]), BDIP)), CDIP_L = once(() => dipLayout(ctx([]), CDIP));

/* Приседание на одной ноге на скамью: опорная — левая, правая вытянута вперёд. k: 0 — внизу (касание скамьи), 1 — стоя.
   Таз и центр масс смещаются над опорной стопой (balanceOver).
   Внизу свободная нога прямая и почти горизонтальна — её держит длина задней поверхности бедра: сгибание бедра при прямом
   колене у обычного человека — до 80° (тест длины подколенных сухожилий, Kendall F. P. и др. «Muscles: Testing and Function»,
   5-е изд., 2005; тот же предел — в валидаторе). Прежде таз внизу был наклонён вперёд на 22°, и свободное бедро сгибалось
   на 83,5° при колене 1° (предупреждение валидатора). Как у живого человека, нехватку длины сухожилий забирает таз: внизу он
   отклоняется назад (наклон вперёд 17° вместо 22°), поясница сгибается на 19° вместо 14° — наклон корпуса прежний,
   свободное бедро — 78,5°, пятка на 1,2 см над полом (было 0,2). */
const PB = { ankle: [8, 0], yaw: 6, hipTop: 88.4, tilt: 17, lumbar: 19, thoracic: 15, freeFlex: 78.5, freeKnee: 1, comZ: [-1.5, 4] };
function pistolPose(C, k, hipY) {
  const { V } = C, q = C.base(), u = 1 - k, tilt = PB.tilt * u * D;
  C.root(q, [6 * u + 2, hipY, -14 * u], [0, Math.cos(tilt), Math.sin(tilt)], [0, -Math.sin(tilt), Math.cos(tilt)]);
  q.lumbar = [PB.lumbar * u, 0, 0]; q.thoracic = [PB.thoracic * u, 0, 0]; q.neck = [C.lerp(-16, 0, k), 0, 0];
  /* свободная правая нога вперёд: сгибание в тазобедренном относительно таза, колено чуть согнуто, носок на себя */
  q.R.hip = [C.lerp(PB.freeFlex, 46, k), 2, 6]; q.R.knee = C.lerp(PB.freeKnee, 8, k); q.R.ankle = [C.lerp(8, 4, k), 0];
  const F = footAt(V, 'L', PB.ankle, PB.yaw), lean = (PB.tilt + PB.lumbar + PB.thoracic) * u;
  const resolve = q => {
    C.foot(q, 'L', F.sup, 0, V.unit(V.add(F.fw, [1, 0, 0], .1)), { forward: F.fw });
    for (const s of S) { q[s].shoulder = [C.lerp(86 + lean, 80, k), C.lerp(6, 8, k), 0]; q[s].elbow = 6; q[s].pron = 70; C.rhythm(q, s); }
  };
  C.balanceOver(q, [PB.ankle[0] + 1, 0, PB.ankle[1] + C.lerp(...PB.comZ, k)], { resolve });
  return q;
}
/* нижняя точка ягодиц (только таз, без бёдер) — для касания скамьи */
const seatLow = (C, q) => { let m = null; for (let h = -5.3; h <= 3; h += 1) for (let a = .7; a <= 1.001; a += .05) { const p = C.chestPoint(q, h, a * Math.PI); if (!m || p[1] < m[1]) m = p; } return m; };
const PISTOL = once(() => {
  const C = ctx([]), yBot = C.solve1D(y => seatLow(C, pistolPose(C, 0, y))[1] - 43.6, 40, 80), lowP = seatLow(C, pistolPose(C, 0, yBot));
  return { yBot, benchZ: lowP[2] - 14.5 + 6 };
});

/* Боковой выпад вправо: стопы широко (голеностопы ±SL.ax), носки почти вперёд. k: 0 — выпад на правую ногу, 1 — центр.
   Левая нога остаётся прямой: высота таза подбирается так, чтобы она дотягивалась до стопы почти без сгибания колена. */
const SL = { ax: 40, yawL: 31, yawR: 12, hipX: -23.5, hipZ: -21, tilt: 34, lumbar: 6, thoracic: 8, comX: -22, comZ: 0 };
function sideLungePose(C, k) {
  const { V } = C, u = 1 - C.ease(k), feet = { L: footAt(V, 'L', [SL.ax, 0], SL.yawL), R: footAt(V, 'R', [-SL.ax, 0], SL.yawR) };
  const body = (y, x, z) => { const q = C.base(), a = SL.tilt * u * D;
    C.root(q, [x, y, z], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
    q.lumbar = [SL.lumbar * u, 0, 0]; q.thoracic = [SL.thoracic * u, 0, 0]; q.neck = [-14 * u, 0, 0]; return q; };
  const straightL = (x, z) => C.solve1D(y => { const f = C.fk(body(y, x, z)); return V.dist(f.P.hipL, [SL.ax, C.M.B.ankle, 0]) - (C.M.B.th + C.M.B.sk - .25); }, 20, 95);
  const resolve = q => {
    for (const s of S) { const F = feet[s]; C.foot(q, s, F.sup, 0, V.unit(V.add(F.fw, [SG[s], 0, 0], .15)), { forward: F.fw }); }
    const T = C.axes(q, 'thorax');
    for (const s of S) { const lat = C.lat(q, s), w = V.add(V.add(V.add(T.o, T.y, 11.8), T.z, 30), lat, 7.5); q[s].girdle = [0, 6];
      C.armTo(q, s, w, V.unit(V.add([0, -1, 0], lat, .8)), { pron: 8, wrist: [0, 0], mode: 'relaxed' }); }
  };
  let x = C.lerp(0, SL.hipX, u), z = C.lerp(0, SL.hipZ, u), q = body(straightL(x, z), x, z);
  /* центр масс между стопами, ближе к рабочей; высота таза пересчитывается под прямую левую ногу */
  for (let i = 0; i < 4; i++) { resolve(q); const c = C.com(q); x += C.lerp(0, SL.comX, u) - c[0]; z += C.lerp(4, SL.comZ, u) - c[2]; q = body(straightL(x, z), x, z); }
  resolve(q);
  return q;
}

/* Тяга полотенца у двери: дверь перед человеком (лицевая плоскость z = TR.door), ручка на высоте 100 по центру,
   полотенце перекинуто через шейку ручки. Тело прямое от голеностопов, отклонено назад на theta. */
const TR = { door: 31, handleY: 100, gx: 15, th0: 38 };
const TR_HANDLE = [0, TR.handleY, TR.door + .6];
function towelRowBody(C, theta, k) {
  const q = leanBody(C, theta, C.M.B.ankle, 0, { dir: -1 });
  for (const s of S) q[s].girdle = [C.lerp(2, 0, k), C.lerp(8, -16, k)];
  return q;
}
/* точка хвата в конце тяги: у нижних рёбер сбоку */
const towelRowEnd = (C, q, s) => { const T = C.axes(q, 'thorax'); return C.V.add(C.V.add(C.V.add(T.o, T.y, -6), T.z, 15), C.lat(q, s), TR.gx + 1); };
/* в начале: руки выпрямлены, кисть на прямой плечо–ручка (чуть шире) */
const towelRowStart = (C, q, s, reach = 61.6) => { const { V } = C, sh = C.fk(q).P['gh' + s], d0 = V.unit(V.sub(TR_HANDLE, sh)); return V.add(V.add(sh, d0, reach), C.lat(q, s), TR.gx - 6); };
const TROW = once(() => {
  const C = ctx([]), { V } = C, th0 = TR.th0, towel = V.dist(towelRowStart(C, towelRowBody(C, th0, 0), 'L'), TR_HANDLE);
  const th1 = C.solve1D(th => V.dist(towelRowEnd(C, towelRowBody(C, th, 1), 'L'), TR_HANDLE) - towel, 0, th0);
  return { th0, th1, towel };
});

/* Тяга под столом: тело прямое, пятки на полу, вращается вокруг пяток (как австралийские подтягивания).
   Столешница над ногами и тазом, длинный край — над грудью; кисти держат край прямым хватом (большой палец вдоль ребра,
   к другой руке), голова за краем стола — не упирается ни в столешницу, ни в ножки.
   Техника: лёжа на спине под столом, держась за край, подтянуть грудь к столу, сохраняя тело прямым, и с контролем опустить
   тело обратно на пол (Physitrack, «Table row»); внизу руки и ноги прямые (Fitness Volt, «How To Do Inverted Rows At Home»:
   «lean back, so your arms and legs are straight»; подсказка каталога — «Опуститесь до прямых рук»). Под обеденным столом
   75 см у человека 175 см это несовместимо: тело, опущенное на пол, держит локти согнутыми на 55° (плечевой сустав — в
   55 см от хвата при прямой руке 61,6), а с прямыми руками тело ушло бы в пол на 4 см — прежде внизу локти были согнуты на
   72°, тело висело в 2 см над полом. Поэтому стол выше — 82 см (высокий обеденный стол; барные и «островные» — 90 и
   выше): внизу тело опускается до касания пола спиной и ягодицами (поджатие мягких тканей floor) или до локтей elBot,
   если руки выпрямятся раньше. */
const TBL = { h: 82, t: 3, edge: 0, gx: 28, gr: 1.5, chestDy: -1, chestDz: 6, floor: -.5, elBot: 10 };
function tableBody(C, theta, Zh) {
  const { V, M } = C, q = C.base(), a = theta * D;
  C.root(q, [0, 50, 0], [0, Math.sin(a), Math.cos(a)], [0, Math.cos(a), -Math.sin(a)]);
  for (const s of S) { q[s].hip = [0, 3, 0]; q[s].knee = 0; q[s].ankle = [-14, 0]; }
  const f = C.fk(q), low = Math.min(...S.flatMap(s => M.solePoints(f, s).map(p => p.p[1]))), heelZ = Math.min(...S.flatMap(s => M.solePoints(f, s).map(p => p.p[2])));
  q.root.p = V.add(q.root.p, [0, -low, Zh - heelZ]);
  return q;
}
const TROWL = once(() => {
  const C = ctx([]), { V } = C, under = TBL.h - TBL.t, grip = s => [-SG[s] * TBL.gx, TBL.h - TBL.gr, TBL.edge - TBL.gr]; /* лёжа на спине левая сторона — −X */
  /* t=1: грудь у края столешницы — сразу за ребром (chestDz) на уровне верхней грани (chestDy) */
  const chest = (th, Zh) => { const q = tableBody(C, th, Zh); let best = null; for (let h = 24; h <= 47.2; h += 1) { const p = C.chestPoint(q, h); if (!best || p[1] > best[1]) best = p; } return best; };
  const th1 = C.solve1D(th => chest(th, 0)[1] - (TBL.h + TBL.chestDy), 5, 60), Zh = TBL.edge + TBL.chestDz - chest(th1, 0)[2];
  /* t=0: тело опущено на пол — спина и ягодицы касаются его (поджатие мягких тканей TBL.floor), руки почти прямые;
     если руки выпрямляются раньше (локоть elBot), тело останавливается над полом */
  const clear = th => Math.min(...C.region(tableBody(C, th, Zh), 'back').map(p => p[1]), ...C.region(tableBody(C, th, Zh), 'buttocks').map(p => p[1]));
  const elbow = th => { const q = tableBody(C, th, Zh); try { tableArms(C, q, grip, 0); } catch (e) { return -TBL.elBot; } return q.L.elbow - TBL.elBot; };
  const th0 = Math.max(C.solve1D(th => clear(th) - TBL.floor, 0, th1), C.unhinted(() => C.solve1D(elbow, 0, th1)));
  return { th0, th1, Zh, grip };
});
/* руки в тяге под столом: e — 0 внизу, 1 вверху; пояс — от протракции внизу к сведённым лопаткам вверху */
function tableArms(C, q, grip, e) {
  const { V } = C;
  for (const s of S) q[s].girdle = [C.lerp(12, -2, e), C.lerp(22, -15, e)];
  for (const s of S) {
    const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], [0, 0, -1], .8), lat, .7));
    C.grip(q, s, grip(s), V.scale(lat, -1), pole);
  }
  return q;
}

/* Скандинавские сгибания: колени на сложенном коврике (4 см), стопы на носках за коленями, пятки заведены
   под низ дивана за спиной и упираются в нижнюю грань его каркаса. Тело прямое от колен до головы, наклон phi вперёд от вертикали.
   Внизу ладони принимают вес на пол (упор, как в отжиманиях), затем руки возвращаются к груди. */
const NRD = { pad: 6, kx: 10, heel: 78, phi0: 68 };
/* стопа «на носках» за коленями: подушечка на полу, пятка вверх (heel°), пальцы вперёд к коленям.
   Положение подушечки подбирается так, чтобы голень (43,6 см) соединяла колено на коврике и голеностоп. */
const nordicFoot = once(() => {
  const { M, V } = ctx([]), K = [0, NRD.pad + 5.4, 0];
  const ff = z => M.footFrame([0, 0, z], 0, { forward: [0, 0, 1], heel: NRD.heel });
  let lo = -80, hi = -10; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (V.dist(ff(m).o, K) > M.B.sk) lo = m; else hi = m; }
  return { ballZ: (lo + hi) / 2, ankle: ff((lo + hi) / 2).o };
});
function nordicBody(C, phi) {
  const { V } = C, q = C.base(), a = phi * D, K = NRD.pad + 5.4, up = [0, Math.cos(a), Math.sin(a)], F = nordicFoot();
  C.root(q, V.add([0, K, 0], up, C.M.B.th), up, [0, -Math.sin(a), Math.cos(a)]);
  for (const s of S) { q[s].hip = [0, 2, 0]; C.foot(q, s, [SG[s] * NRD.kx, 0, F.ballZ], 0, [0, -1, -.3], { forward: [0, 0, 1], heel: NRD.heel }); }
  return q;
}
/* верх подошв (у подъёма стопа смотрит подошвой вверх-назад) — под него подводится низ дивана */
const NORDIC = once(() => {
  const C = ctx([]), q = nordicBody(C, 0), R = C.M.catalogPose(q), pts = [];
  for (const s of S) for (const fp of C.M.footPoints(s)) pts.push(C.M.footPointWorld(R.frames['foot' + s], R.frames['toes' + s], fp));
  const top = Math.max(...pts.map(p => 186 - p[1])), zs = pts.map(p => p[2]);
  /* низ: кисти под плечами (чуть впереди); толчок руками — до почти прямых рук (phi1) */
  const f0 = C.fk(nordicBody(C, NRD.phi0)), palm = s => [f0.P['gh' + s][0] + SG[s] * 4, 0, f0.P['gh' + s][2] + 4 + 5.6];
  const wr = s => C.V.add(C.V.sub(palm(s), [0, 0, 5.6]), [0, 1, 0], 1.8);
  const phi1 = C.solve1D(ph => C.V.dist(C.fk(nordicBody(C, ph)).P.ghL, wr('L')) - 53.5, 20, NRD.phi0);
  /* основание дивана — на пятках (стопы под ним упираются в него; прежде между ними оставалось 0,8 см, и пятки висели под
     основанием во всех фазах) */
  return { legH: top, front: Math.max(...zs) + 3, palm, phi1 };
});

/* Подъём на носок на одной ноге: стоя лицом к стене на степ-платформе; левая стопа подушечкой на заднем крае
   (пятка свисает), правая нога согнута и поднята назад, правая ладонь на стене перед собой (лёгкая страховка).
   t=0 — пятка ниже ступени (растяжение), t=1 — на носке. Колено опорной ноги прямое. */
const CALF = { stepH: 17, stepZ: 14.5, ballX: 9, wallZ: 44, handX: -16, handY: 162, drop: -8.5, rise: 36 };
function calfPose(C, k) {
  const { V, M } = C, q = C.base(), heel = C.lerp(CALF.drop, CALF.rise, k), sup = [CALF.ballX, CALF.stepH, CALF.stepZ - 16 + 2];
  const ff = M.footFrame(sup, 0, { forward: [0, 0, 1], heel });
  q.R.hip = [4, 3, 4]; q.R.knee = 80; q.R.ankle = [-20, 0];
  let x = CALF.ballX - 6, z = sup[2] - 4;
  const place = () => { C.root(q, [x, 0, z], [0, 1, 0], [0, 0, 1]); const f = C.fk(q), L5 = Math.sqrt(M.B.th ** 2 + M.B.sk ** 2 + 2 * M.B.th * M.B.sk * Math.cos(5 * C.D2R)), dy = Math.sqrt(L5 ** 2 - (ff.o[0] - f.P.hipL[0]) ** 2 - (ff.o[2] - f.P.hipL[2]) ** 2); q.root.p[1] = ff.o[1] + dy; };
  const resolve = () => {
    C.foot(q, 'L', sup, 0, [0, 0, 1], { forward: [0, 0, 1], heel });
    const lat = C.lat(q, 'R'); q.R.girdle = [2, 4];
    C.palm(q, 'R', [CALF.handX, CALF.handY, CALF.wallZ], V.unit([.45, 1, 0]), [0, 0, -1], V.unit(V.add(V.add([0, -1, 0], lat, .35), [0, 0, -1], .3)));
    q.L.shoulder = [8, 9, 0]; q.L.elbow = 14; C.rhythm(q, 'L');
  };
  /* центр масс над подушечкой опорной стопы (чуть позади неё) */
  for (let i = 0; i < 6; i++) { place(); resolve(); const c = C.com(q); x += sup[0] - .5 - c[0]; z += sup[2] - 2.5 - c[2]; }
  place(); resolve();
  return q;
}

/* Сгибание рук с полотенцем: середина полотенца под правой стопой, концы в кулаках хватом снизу.
   t=0 — правая стопа на полу (наступил на полотенце), руки почти прямые, полотенце натянуто;
   при сгибании рук нога сопротивляется и уступает: правое колено поднимается, длина полотенца постоянна.
   Опорная — левая нога; центр масс над ней. */
const TC = { lAnkle: [11, -2], rAnkle: [-4, 11], towelT: 2.4, elbow1: 106 };
function towelCurlArms(C, q, k) {
  for (const s of S) { q[s].shoulder = [C.lerp(6, 12, k), 12, 0]; q[s].elbow = C.lerp(14, TC.elbow1, k); q[s].pron = -82; q[s].wrist = [C.lerp(0, 10, k), 0]; q[s].girdle = [0, 0]; q.hands = { ...(q.hands || {}), [s]: 'grip' }; }
}
/* точка полотенца под правой стопой (середина подошвы под сводом) */
const towelUnder = (C, q) => { const f = C.fk(q), F = f.F.footR; return C.V.add(F.o, C.M3.v(F.R, [0, -(C.M.B.ankle + 1), 5])); };
function towelCurlPose(C, k, r) {
  const { V } = C, q = C.base(), FL = footAt(V, 'L', TC.lAnkle, 8);
  C.root(q, [2, 88.6, 1], [0, 1, 0], [0, 0, 1]);
  towelCurlArms(C, q, k);
  /* правая нога: r = 0 — стопа на полу, r > 0 — колено поднимается (бедро вперёд-вверх, голень вертикально) */
  const legR = q => {
    if (r <= 1e-6) { const F = footAt(V, 'R', TC.rAnkle, 4); C.foot(q, 'R', V.add(F.sup, [0, TC.towelT, 0]), 0, V.unit(V.add(F.fw, [-1, 0, 0], .1)), { forward: F.fw }); return; }
    q.R.hip = [r * 104, r * 3, r * 2]; q.R.knee = r * 96; q.R.ankle = [C.lerp(0, -4, r), 0];
  };
  const resolve = q => { C.foot(q, 'L', FL.sup, 0, V.unit(V.add(FL.fw, [1, 0, 0], .1)), { forward: FL.fw }); legR(q); };
  const target = [C.lerp(2, TC.lAnkle[0] - 1, Math.min(1, r * 4)), 0, C.lerp(6, 4, Math.min(1, r * 4))];
  C.balanceOver(q, target, { resolve });
  return q;
}
const TCURL = once(() => {
  const C = ctx([]), { V } = C, gm = q => { const f = C.fk(q); return V.mix(f.P.gripL, f.P.gripR, .5); };
  const q0 = towelCurlPose(C, 0, 0), L = V.dist(gm(q0), towelUnder(C, q0));
  return { L, gm };
});

/* ---------- Сисси-присед с опорой рукой о дверной косяк ----------
   Muscle & Strength «Sissy Squat»: стопы на ширине плеч, «Begin by bending at the knees and lowering your body backward while
   raising your heels off the ground», «Form a straight line with your body (from your neck to your knees) by leaning back», глубина —
   насколько позволяет равновесие. Fitness Volt («Sissy Squat Guide»): «Hold the frame with your nearest hand for support»; BarBend
   (J. Dickson, «Sissy Squat»): за дверной косяк держаться «very light», свободные руки поднимать вперёд «at the same cadence as your
   knees bend to help maintain your balance»; Garage Gym Reviews (S. McLean, «Sissy Squat»): руки вперёд при отклонении назад —
   противовес. В 4.102.0 свободная рука лежала поперёк груди (M&S: «Put one arm across your chest») — с ладонью у левой ключицы
   это читалось как хватание за сердце; теперь она вытянута вперёд противовесом (sissyArms).
   Опора — дверной проём слева (homeDoor, стена по оси Z при x > 0, лицевая сторона к телу; камеры атласа не смотрят со стороны +X —
   стена не заслоняет тело). Полотно открыто от человека (open, петли у дальнего края проёма): в закрытом проёме пальцам некуда
   зайти — за коробкой 2,5 см до притвора и полотно. Левая кисть держит ребро проёма: ладонь на углу наличника, пальцы огибают
   коробку и лежат в проёме на её внутренней грани (sissyArms). Тело от колен до плеч — одна линия
   (сгибание бедра ≈ 0), пятки подняты: голень наклонена вперёд на φ, линия бедро–корпус — назад на ψ = колено − φ; φ подбирается
   так, чтобы центр масс был над подушечками стоп (рука на косяке страхует, вес не держит). t=0 — на подушечках стоп, колени
   чуть согнуты; t=1 — колени согнуты на SISSY.knee[1]° (умеренная глубина: опора одной рукой, без отягощения). */
const SISSY = { knee: [10, 95], heel: [16, 38], ballX: 10, ballZ: 8, wallX: 68, doorZ: 60, handY: 118, gr: 1.2, inset: .2, elbow: [.3, 1, .5], tilt: .5,
  armUp: [-55, 8], armAbd: 15, armElbow: 12, armPron: 70 };
/* дверь: межкомнатная 80×200 (homeDoor: зазор 0,3, коробка 2,5, наличник 1,5 толщиной); полотно открыто на 90° от человека,
   петли у дальнего от кисти края (side −1) — полотно уходит в соседнюю комнату и не стоит за кистью */
const SISSY_DOOR = { type: 'homeDoor', id: 'door', at: [SISSY.wallX, 0, SISSY.doorZ], yaw: -90, side: -1, open: 90 };
/* в координатах сцены: лицо наличника — на 1,5 см перед стеной; внутренняя грань коробки ближнего к телу края проёма */
const SISSY_DOOR_GEO = { casing: 1.5, jambFace: SISSY.doorZ - (80 / 2 + .3) };
function sissyBody(C, k, heel, phi) {
  const { V, M } = C, q = C.base(), opt = { forward: [0, 0, 1], heel };
  const sup = s => [SG[s] * SISSY.ballX, 0, SISSY.ballZ], A = V.mix(M.footFrame(sup('L'), 0, opt).o, M.footFrame(sup('R'), 0, opt).o, .5);
  const f = phi * D, p = (k - phi) * D, K = V.add(A, [0, Math.cos(f), Math.sin(f)], M.B.sk - .05), up = [0, Math.cos(p), -Math.sin(p)];
  C.root(q, V.add(K, up, M.B.th - .05), up, [0, Math.sin(p), Math.cos(p)]);
  q.lumbar = [0, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [C.lerp(2, 12, k / SISSY.knee[1]), 0, 0];
  for (const s of S) C.foot(q, s, sup(s), 0, V.unit(V.add([0, 0, 1], [SG[s], 0, 0], .1)), opt);
  return q;
}
/* k — доля опускания (0 вверху, 1 внизу) */
function sissyArms(C, q, k, allowShort = false) {
  const { V } = C, latL = C.lat(q, 'L');
  q.L.girdle = [0, 2];
  /* Хват за ребро проёма, ближней (левой) рукой. Кулак вписан в угол между лицом наличника и внутренней гранью коробки: центр
     хвата — на радиус хвата от обеих плоскостей, как у хвата за край скамьи и столешницы (edgeGrip). Ладонь ложится на ребро
     со стороны комнаты, пальцы огибают его и уходят в проём на внутреннюю грань коробки — ей они и тянут, когда корпус отклоняется
     назад. Стена слева от кисти, поэтому так обхватить ребро левой рукой можно только большим пальцем вниз (у левой кисти ладонь
     к стене и пальцы вперёд — большой палец вниз; большим пальцем вверх ладонь смотрит от стены, и кулак у ребра держал воздух,
     как в 4.102.0): предплечье пронировано, плечо повёрнуто внутрь, локоть отведён в сторону (полюс elbow: вверх, наружу, назад) —
     так держат косяк в растяжке широчайшей. Чтобы пронация и поворот плеча оставались в пределах, а локоть не задирался выше плеча,
     рука почти прямая: кисть на 118 см — на середине пути плечевого сустава (вверху и внизу он почти на одном расстоянии от кисти,
     локоть согнут на 48–65°), плечо — в 47 см от наличника; ось кулака наклонена от ребра на долю tilt к поперечной предплечью (запястье без
     лишнего отведения; наклон — до 25°, допуск оси хвата). Радиус хвата 1,2 (наименьший в таблице пальцев Anny): кольцо пальцев
     помещается в коробку (2,5 см) и не уходит в стену за ней; центр хвата сдвинут на inset внутрь от вписанного положения —
     кончики пальцев ложатся на внутреннюю грань коробки (не дальше 1,4 см; tools/anny-look/holds.js — до 1,5). */
  const gr = SISSY.gr, H = [SISSY.wallX - SISSY_DOOR_GEO.casing + gr + SISSY.inset, SISSY.handY, SISSY_DOOR_GEO.jambFace - gr], down = [0, -1, 0];
  const pole = V.unit(V.add(V.add([0, SISSY.elbow[0], 0], latL, SISSY.elbow[1]), [0, 0, -1], SISSY.elbow[2]));
  let thumb = down;
  for (let i = 0; i < 3; i++) { C.grip(q, 'L', H, thumb, pole, { allowShort: true }); thumb = V.unit(V.mix(down, V.unit(V.perp(down, V.unit(V.sub(H, C.fk(q).P.elL)))), SISSY.tilt)); }
  C.grip(q, 'L', H, thumb, pole, { allowShort });
  /* свободная (правая) рука — противовес: вытянута вперёд и поднимается вместе со сгибанием коленей (BarBend: «raise your
     arms out in front of you at the same cadence as your knees bend»; Garage Gym Reviews: «holding your arms out in front as
     you lean back … act as a counterbalance»). Направление руки в мире: подъём над горизонталью от SISSY.armUp[0] вверху до
     SISSY.armUp[1] внизу; рука отведена наружу на SISSY.armAbd — спереди и под углом кисть не ложится на грудь (к середине тела
     она снова читалась бы как рука на сердце); локоть слегка согнут, кисть расслаблена, ладонь вниз и внутрь. Сгибание плеча —
     от грудной клетки: корпус отклонён назад, и рука «вперёд в мире» согнута в плече меньше 90°. */
  const T = C.axes(q, 'thorax'), lean = Math.atan2(-T.y[2], T.y[1]) / D, up = C.lerp(SISSY.armUp[0], SISSY.armUp[1], k);
  q.R.shoulder = [90 + up - lean, SISSY.armAbd, 0]; q.R.elbow = SISSY.armElbow; q.R.pron = SISSY.armPron; q.R.wrist = [0, 0];
  q.hands = { ...(q.hands || {}), R: 'relaxed' }; C.rhythm(q, 'R');
}
/* наклон голени φ: центр масс — над подушечками стоп (в 2 см позади точки под подушечкой) */
function sissyPose(C, k, heel) {
  const u = (k - SISSY.knee[0]) / (SISSY.knee[1] - SISSY.knee[0]);
  const phi = C.solve1D(ph => { const q = sissyBody(C, k, heel, ph); sissyArms(C, q, u, true); return C.com(q)[2] - (SISSY.ballZ - 2); }, 0, Math.min(80, k + 10));
  const q = sissyBody(C, k, heel, phi); sissyArms(C, q, u);
  return q;
}

module.exports = {
  /* Сисси-присед с опорой рукой о дверной косяк: раскладка и источник — SISSY выше. */
  sissysquat: {
    keys: Array.from({ length: 13 }, (_, i) => i / 12),
    equipment: [SISSY_DOOR],
    contacts: [{ body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'door:jambR' }],
    gripRadius: { L: SISSY.gr },
    pose(t, C) { const e = C.ease(t); return sissyPose(C, C.lerp(SISSY.knee[0], SISSY.knee[1], e), C.lerp(SISSY.heel[0], SISSY.heel[1], e)); }
  },

  /* Сгибание рук с полотенцем: полотенце под правой стопой, концы в руках хватом снизу, локти прижаты.
     t=0 — руки почти прямые, стопа на полу; t=1 — руки согнуты, нога, сопротивляясь, поднялась (колено вперёд-вверх). */
  towelcurl: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [{ type: 'homeTowelFoot', id: 'towel', foot: 'R', r: 1.4 }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'towel', when: [0, .03] }, { body: 'gripL', prop: 'towel' }, { body: 'gripR', prop: 'towel' }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, L = TCURL(), k = C.ease(t);
      if (k < 1e-6) return towelCurlPose(C, 0, 0);
      const r = C.solve1D(r => { const q = towelCurlPose(C, k, r); return V.dist(L.gm(q), towelUnder(C, q)) - L.L; }, 0, 1);
      return towelCurlPose(C, k, r);
    }
  },

  /* Подъём на носок на одной ноге (левая): лицом к стене, подушечка стопы на краю степ-платформы, правая ладонь на стене.
     t=0 — пятка опущена ниже ступени, t=1 — подъём на носок. Колено опорной ноги прямое. */
  calf1: {
    keys: [0, .25, .5, .75, 1],
    equipment: turnEq([{ type: 'homeStep', id: 'step', at: [2, 0, CALF.stepZ] }, { type: 'homeWall', id: 'wall', at: [0, 0, CALF.wallZ], yaw: 180, w: 160 }]),
    contacts: [{ body: 'soleL', prop: 'step' }, { body: 'palmR', prop: 'wall:panel' }],
    pose(t, C) { return turnPose(C, calfPose(C, C.ease(t))); }
  },

  /* Скандинавские сгибания: колени на мягком коврике, пятки зафиксированы под диваном, тело — прямая линия от колен.
     t=0 — внизу: ладони на полу принимают вес, локти согнуты; t=1 — вернулся вертикально (руки у груди).
     Возврат 1→0 — медленное опускание (плеер), 0→1 — толчок руками и возврат. */
  nordic: {
    keys: [0, .07, .14, .3, .5, .75, 1],
    equipment: (() => [{ type: 'homeSofa', id: 'sofa', at: [0, 0, NORDIC().front], legH: NORDIC().legH },
      { type: 'homeCushion', id: 'pad', at: [0, 0, -6], t: NRD.pad, w: 50, len: 36 }])(),
    contacts: [{ body: 'kneeL', prop: 'pad' }, { body: 'kneeR', prop: 'pad' }, { body: 'footL', prop: 'sofa:base' }, { body: 'footR', prop: 'sofa:base' },
      { body: 'palmL', prop: 'floor', when: [0, .14] }, { body: 'palmR', prop: 'floor', when: [0, .14] }],
    pose(t, C) {
      const { V } = C, L = NORDIC(), phi = t <= .14 ? C.lerp(NRD.phi0, L.phi1, t / .14) : C.lerp(L.phi1, 0, C.ease((t - .14) / .86)), q = nordicBody(C, phi);
      q.neck = [C.lerp(-20, 0, Math.min(1, t * 2)), 0, 0];
      if (t <= .14) {
        /* упор на ладони: кисти под плечами, пальцы вперёд, локти назад */
        for (const s of S) { const lat = C.lat(q, s); q[s].girdle = [2, 4]; C.palm(q, s, L.palm(s), V.unit([-SG[s] * .08, 0, 1]), [0, 1, 0], V.unit(V.add([0, 0, -1], lat, .45))); }
      } else {
        /* руки у груди, ладони вперёд — готовы принять вес */
        const T = C.axes(q, 'thorax');
        for (const s of S) { const lat = C.lat(q, s), w = V.add(V.add(V.add(T.o, T.y, 14.8), T.z, 20), lat, 15); q[s].girdle = [2, 6];
          C.armTo(q, s, w, V.unit(V.add([0, -1, 0], lat, .5)), { pron: 70, wrist: [-25, 0], mode: 'relaxed' }); }
      }
      return q;
    }
  },

  /* Тяга под столом: лёжа под столом лицом вверх, кисти держат длинный край столешницы прямым хватом, пятки на полу,
     тело прямое. t=0 — тело опущено на пол, руки почти прямые; t=1 — грудь у края столешницы, лопатки сведены. */
  tablerow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'homeTable', id: 'table', h: TBL.h, at: [0, 0, TBL.edge - 37.5] }],
    contacts: [{ body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'table:top' }, { body: 'gripR', prop: 'table:top' },
      { body: 'buttocks', prop: 'floor', when: [0, .02] }, { body: 'back', prop: 'floor', when: [0, .02] }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, L = TROWL(), e = C.ease(t), q = tableBody(C, C.lerp(L.th0, L.th1, e), L.Zh);
      q.neck = [C.lerp(0, 6, e), 0, 0];
      return tableArms(C, q, L.grip, e);
    }
  },

  /* Тяга полотенца у двери: полотенце перекинуто через ручку закрытой двери, стопы у двери, тело прямое,
     отклонено назад. t=0 — руки выпрямлены, t=1 — грудь подтянута к двери, локти назад, лопатки сведены. */
  towelrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: turnEq([{ type: 'homeDoor', id: 'door', at: [34, 0, TR.door], yaw: 180, w: 220 },
      { type: 'homeTowel', id: 'towel', from: TR_HANDLE, axis: [0, 0, 1], around: 1.0, mountTo: 'door:neck' }]),
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'towel' }, { body: 'gripR', prop: 'towel' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, L = TROW(), e = C.ease(t), q = towelRowBody(C, C.lerp(L.th0, L.th1, e), e);
      for (const s of S) { const fw = V.unit([SG[s] * .12, 0, 1]); C.foot(q, s, V.add([SG[s] * 10, 0, 0], fw, 13.5), 0, V.unit(V.add(fw, [SG[s], 0, 0], .2)), { forward: fw }); }
      for (const s of S) {
        const f = C.fk(q), lat = C.lat(q, s), sh = f.P['gh' + s];
        /* кисть на дуге: в начале — на прямой плечо–ручка, в конце — у рёбер; длина полотенца постоянна */
        const end = towelRowEnd(C, q, s), start = towelRowStart(C, q, s);
        let g = V.mix(start, end, e); g = V.add(TR_HANDLE, V.unit(V.sub(g, TR_HANDLE)), L.towel);
        /* нейтральный хват: большой палец вверх, поперёк предплечья (полотенце входит в кулак сверху) */
        const towelDir = V.unit(V.sub(TR_HANDLE, g)), fore = V.unit(V.mix(V.unit(V.sub(g, sh)), towelDir, e)), thumb = V.unit(V.perp([0, 1, 0], fore));
        const pole = V.unit(V.add(V.add([0, -1, 0], [0, 0, -1], .5), lat, .55));
        C.grip(q, s, g, thumb, pole);
        for (let i = 0; i < 3; i++) { const f2 = C.fk(q), fa = V.unit(V.sub(f2.P['wr' + s], f2.P['el' + s])); C.grip(q, s, g, V.unit(V.perp([0, 1, 0], fa)), pole); }
      }
      return turnPose(C, q);
    }
  },

  /* Боковые выпады (рабочая — правая нога): стопы широко, носки вперёд. t=0 — таз отведён назад и вправо,
     правое колено по носку, левая нога прямая, стопа на полу целиком; t=1 — возврат в центр. */
  sidelunge: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }],
    pose(t, C) { return sideLungePose(C, t); }
  },

  /* Приседания на одной ноге на скамью: стоя спиной к скамье на левой ноге, правая вытянута вперёд, руки перед собой.
     t=0 — касание скамьи ягодицами (без опоры на неё), t=1 — стоя. Колено опорной ноги по носку, пятка на полу. */
  pistolbox: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: (() => [{ type: 'flatBench', id: 'bench', at: [0, 0, PISTOL().benchZ], yaw: 90 }])(),
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'buttocks', prop: 'bench:pad', when: [0, .02] }],
    pose(t, C) {
      const L = PISTOL(), k = C.ease(t);
      return pistolPose(C, k, C.lerp(L.yBot, PB.hipTop, Math.pow(k, .85)));
    }
  },

  /* Обратные отжимания от скамьи (eccFirst): скамья поперёк за спиной, кисти держат её край у бёдер, пальцы вперёд,
     ноги вытянуты вперёд на пятках, таз у самой скамьи. t=0 — руки выпрямлены, t=1 — локти ≈ 90°, назад. */
  benchdip: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', at: [0, 0, -14.5], yaw: 90 }],
    contacts: [{ body: 'gripL', prop: 'bench:pad' }, { body: 'gripR', prop: 'bench:pad' }, { body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }],
    gripRadius: { L: 2.2, R: 2.2 },
    pose(t, C) {
      return dipBody(C, C.ease(t), BDIP, BDIP_L());
    }
  },

  /* Отжимания от стула: стул за спиной, кисти держат передний край сиденья рядом с бёдрами, пальцы вперёд,
     ноги согнуты, пятки на полу. t=0 — локти ≈ 90° (низ), t=1 — руки выпрямлены. */
  chairdip: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'homeChair', id: 'chair', at: [0, 0, -21] }],
    contacts: [{ body: 'gripL', prop: 'chair:seat' }, { body: 'gripR', prop: 'chair:seat' }, { body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      return dipBody(C, 1 - C.ease(t), CDIP, CDIP_L());
    }
  },

  /* Отжимания в упоре углом с ногами на скамье: подушечки стоп на скамье, таз высоко, корпус круче, чем на полу.
     t=0 — макушка у пола между ладонями (локти назад-вниз), t=1 — руки выпрямлены. */
  declinepike: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', at: [0, 0, -7.5], yaw: 90 }],
    contacts: [{ body: 'soleL', prop: 'bench:pad' }, { body: 'soleR', prop: 'bench:pad' }, { body: 'palmL', prop: 'floor' }, { body: 'palmR', prop: 'floor' }],
    pose(t, C) {
      const { V } = C, L = PIKED(), e = 1 - C.ease(t), q = pikeBody(C, C.lerp(L.psi0, L.psi1, e), C.lerp(L.phi0, L.phi1, e), L.opts);
      q.neck = [C.lerp(0, -10, e), 0, 0];
      /* пояс по ритму (этап Д); плечевой сустав идёт за лопаткой — ладони ставятся дважды */
      for (const pass of [0, 1]) S.forEach((s, i) => {
        C.rhythm(q, s, PIKE_GIRDLE(C, e));
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, 0, -1], lat, .55), [0, 1, 0], .7));
        C.palm(q, s, L.palm[i], [0, 0, 1], [0, 1, 0], pole);   /* пальцы прямо вперёд: вверху запястье без лучевого отведения сверх 22°, внизу — без локтевого сверх 30° */
      });
      return q;
    }
  },

  /* Отжимания в упоре углом (eccFirst): таз высоко, тело — перевёрнутая V, ладони на ширине плеч.
     t=0 — руки выпрямлены, t=1 — макушка почти у пола между ладонями, локти назад. */
  pikepush: {
    keys: [0, .25, .5, .75, 1],
    equipment: [],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'palmL', prop: 'floor' }, { body: 'palmR', prop: 'floor' }],
    pose(t, C) {
      const { V } = C, L = PIKE(), e = C.ease(t), q = pikeBody(C, C.lerp(L.psi0, L.psi1, e), C.lerp(L.phi0, L.phi1, e), L.opts);
      q.neck = [C.lerp(0, -10, e), 0, 0];
      /* пояс по ритму (этап Д); плечевой сустав идёт за лопаткой — ладони ставятся дважды */
      for (const pass of [0, 1]) S.forEach((s, i) => {
        C.rhythm(q, s, PIKE_GIRDLE(C, e));
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, 0, -1], lat, .55), [0, 1, 0], .7));
        C.palm(q, s, L.palm[i], V.unit([-SG[s] * .1, 0, 1]), [0, 1, 0], pole);
      });
      return q;
    }
  },

  /* Отжимания с ногами на скамье (eccFirst): носки на скамье поперёк, ладони на полу чуть шире плеч, тело — прямая линия.
     t=0 — руки выпрямлены, t=1 — грудь почти у пола, локти 30–45° к корпусу. */
  declinepush: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench', at: [0, 0, -13.3], yaw: 90 }, DEC_MAT_E],
    contacts: [{ body: 'soleL', prop: 'bench:pad' }, { body: 'soleR', prop: 'bench:pad' }, { body: 'palmL', prop: 'mat' }, { body: 'palmR', prop: 'mat' }],
    pose(t, C) {
      const L = DEC(), P = DECP, e = C.ease(t), al = C.lerp(L.at, L.ab, e), q = plankBody(C, al, L.opts), a = al * D;
      q.neck = [C.lerp(P.neck[0], P.neck[1], e), 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(P.gTop[0], P.gBot[0], e), C.lerp(P.gTop[1], P.gBot[1], e)];
      benchPushArms(C, q, L, P, e, [0, Math.sin(a), Math.cos(a)]);
      return q;
    }
  },

  /* Отжимания с рук на возвышении (скамья поперёк): ладони у края скамьи чуть шире плеч, тело прямое от пяток до макушки.
     t=0 — грудь у края скамьи (локти ~45° к корпусу), t=1 — руки выпрямлены. Тело вращается вокруг подушечек стоп. */
  inclinepush: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => [{ type: 'flatBench', id: 'bench', at: [0, 0, INC().zb], yaw: 90 }])(),
    contacts: [{ body: 'palmL', prop: 'bench:pad' }, { body: 'palmR', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }],
    pose(t, C) {
      const L = INC(), P = INCP, e = C.ease(t), al = C.lerp(L.a0, L.a1, e), q = plankBody(C, al, L.opts), a = al * D;
      q.neck = [C.lerp(P.neck[0], P.neck[1], e), 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(P.gBot[0], P.gTop[0], e), C.lerp(P.gBot[1], P.gTop[1], e)];
      /* полюс: внизу — к локтю над кистью (раскладка), вверху — по pole0 */
      benchPushArms(C, q, L, P, 1 - e, [0, Math.sin(a), Math.cos(a)]);
      return q;
    }
  },

  /* Приседания с собственным весом (eccFirst): t=0 — стоя, t=1 — бёдра параллельны полу.
     Стопы на ширине плеч, носки наружу 15°, колени по носкам, пятки на полу, руки вперёд для баланса. */
  airsquat: {
    /* ключи через 0,1 на взмахе рук (до t ≈ 0,7): при шаге 0,2 руки между ключами 0,4 и 0,6 проходили половину взмаха, а в ключе
       0,6 останавливались — рывок кистей 1,2 см за кадр (tools/anny-look/jitter.js) */
    keys: [0, .1, .2, .3, .4, .5, .6, .7, .8, 1],
    equipment: [],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), k = Math.pow(e, .6), q = C.base(), tilt = C.lerp(0, 32, k) * D;
      C.root(q, [0, C.lerp(89, 47.3, e), C.lerp(0, -22, e)], [0, Math.cos(tilt), Math.sin(tilt)], [0, -Math.sin(tilt), Math.cos(tilt)]);
      q.lumbar = [C.lerp(0, 9, k), 0, 0]; q.thoracic = [C.lerp(0, 7, k), 0, 0]; q.neck = [C.lerp(0, -26, k), 0, 0];
      const feet = S.map(s => ({ s, ...footAt(V, s, [SG[s] * 14, 0], 12) }));
      const resolve = q => {
        for (const F of feet) C.foot(q, F.s, F.sup, 0, V.unit(V.add(F.fw, [SG[F.s], 0, 0], .08)), { forward: F.fw });
        /* взмах рук — почти на всё опускание (до 87 %), со скоростью и ускорением, сходящими на нет к концу (кривая
           6x⁵ − 15x⁴ + 10x³): прежний взмах (косинус до 69 % опускания) на подъёме за 1 с вёл кисти со скоростью до 4,8 м/с
           и обрывал ускорение в конце — рывок кистей 1,2 см за кадр (tools/anny-look/jitter.js) */
        const x = Math.min(1, e * 1.15), a = x * x * x * (x * (6 * x - 15) + 10), lean = 32 * k + 9 * k + 7 * k;
        for (const s of S) { q[s].shoulder = [C.lerp(6, 88 + lean, a), C.lerp(8, 10, a), C.lerp(0, -6, a)]; q[s].elbow = C.lerp(10, 4, a); q[s].pron = C.lerp(0, 75, a); C.rhythm(q, s); }
      };
      C.balanceOver(q, [0, 0, C.lerp(4, 0, k)], { resolve });
      return q;
    }
  },

  /* Стульчик у стены (удержание): спина прижата к стене, бёдра параллельны полу, колени над пятками,
     руки вдоль тела, ладони на стене. t=0 и t=1 — одно положение (лишь дыхание). */
  wallsit: {
    keys: [0, 1],
    equipment: [{ type: 'homeWall', id: 'wall', at: [0, 0, -38], w: 160 }],
    contacts: [{ body: 'back', prop: 'wall:panel' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'palmL', prop: 'wall:panel' }, { body: 'palmR', prop: 'wall:panel' }],
    pose(t, C) {
      const { V } = C, q = C.base();
      C.root(q, [0, C.M.B.ankle + C.M.B.sk, 0], [0, 1, 0], [0, 0, 1]);
      q.lumbar = [-1, 0, 0]; q.thoracic = [C.lerp(-3, -4, t), 0, 0]; q.neck = [4, 0, 0];
      for (const s of S) { q[s].hip = [90, 4, 4]; q[s].knee = 90; }
      /* спина касается стены без поджатия: стена жёсткая, а над лопатками кожу поднимает задняя складка подмышки
         (Mannequin.FOLDS; опора ставится по коже без складок). С подгонкой складок 4.41.0 при поджатии 0,8 см кожа
         складки уходила в стену на 2,6 см (предупреждение валидатора, допуск 2 см); теперь — на 1,5 см */
      C.restOn(q, 'back', [0, 0, -38], [0, 0, 1], 0);
      for (const s of S) {
        const f = C.fk(q), kn = f.P['kn' + s], fw = V.unit([SG[s] * .12, 0, 1]);
        C.foot(q, s, V.add([kn[0], 0, kn[2]], fw, 13.5), 0, V.unit([SG[s] * .08, .7, .7]), { forward: fw });
      }
      /* руки свободно вдоль тела, ладони легко касаются стены у таза (не на бёдрах); на 40 см от пола (было 38,8):
         без поджатия спины к стене рука до 38,8 не доставала на 1 мм */
      for (const s of S) {
        q[s].girdle = [C.lerp(0, 1.5, t), -4];
        const lat = C.lat(q, s), pole = V.unit(V.add(lat, [0, 0, -1], .45));
        C.palm(q, s, [SG[s] * 26, 40, -38], V.unit([SG[s] * .1, -1, 0]), [0, 0, 1], pole);
      }
      return q;
    }
  },

  /* Отжимания от стены: ладони на стене чуть выше уровня плеч, тело прямое, пятки на полу.
     t=0 — грудь у стены (локти согнуты, ~45° к корпусу), t=1 — руки выпрямлены. Тело вращается вокруг голеностопов. */
  wallpush: {
    keys: [0, .25, .5, .75, 1],
    equipment: turnEq([{ type: 'homeWall', id: 'wall', at: [0, 0, 67], yaw: 180, w: 160 }]),
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'palmL', prop: 'wall:panel' }, { body: 'palmR', prop: 'wall:panel' }],
    pose(t, C) {
      const { V } = C, Zw = 67, palmY = WP.y, palmX = WP.x;
      const body = (th, e) => { const q = leanBody(C, th, C.M.B.ankle, 0); for (const s of S) q[s].girdle = [C.lerp(3, 7, e), C.lerp(-10, 10, e)]; return q; };
      const wristOf = s => [SG[s] * (palmX - .5), palmY - 5.6, Zw - 1.8];
      const L = this._layout || (this._layout = (() => {
        const reach = (th, e, k) => { const q = body(th, e); return V.dist(C.ghToward(q, 'L', wristOf('L')), wristOf('L')) - k; };
        return { th0: C.solve1D(th => reach(th, 0, WP.r0), 0, 45), th1: C.solve1D(th => reach(th, 1, WP.r1), 0, 45) };
      })());
      const e = C.ease(t), q = body(C.lerp(L.th0, L.th1, e), e);
      q.neck = [C.lerp(-4, 0, e), 0, 0];
      for (const s of S) { const fw = V.unit([SG[s] * .1, 0, 1]); C.foot(q, s, V.add([SG[s] * 10, 0, 0], fw, 13.5), 0, V.unit(V.add(fw, [SG[s], 0, 0], .2)), { forward: fw }); }
      for (const s of S) {
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], lat, WP.pl), [0, 0, -1], .15));
        C.palm(q, s, [SG[s] * palmX, palmY, Zw], V.unit([SG[s] * WP.fx, 1, 0]), [0, 0, -1], pole);
      }
      return turnPose(C, q);
    }
  }
};
