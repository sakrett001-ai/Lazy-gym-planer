'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const { V, M3 } = M;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const nearV = (a, b, tol, msg) => assert.ok(V.dist(a, b) <= tol, `${msg}: [${a.map(v => v.toFixed(2))}] vs [${b.map(v => v.toFixed(2))}]`);
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test('нейтральная поза: высоты ориентиров по ANSUR II (мужчина 174,5 см, 78 кг, босиком)', () => {
  /* тазобедренный — на высоте большого вертела (89,5), коленный — наружного надмыщелка (48,8), голеностоп — 7,
     плечевой — на 3,5 см ниже акромиона (142,9), макушка — рост 174,5 (tools/mannequin/anthro-ansur2.json) */
  const { P } = M.fk(M.neutral());
  near(P.hipL[1], 89.5, .01, 'тазобедренный');
  near(P.ghL[1], 138.9, .3, 'плечевой');
  near(P.knL[1], 48.8, .3, 'колено');
  near(P.anL[1], 7.0, .3, 'голеностоп');
  near(P.heelL[1], 0, .4, 'пятка на полу');
  near(P.ballL[1], 1.65, .4, 'плюснефаланговый сустав над полом');
  const top = P.head[1] + M.B.head[1]; near(top, 174.5, .6, 'макушка');
  /* центры плечевых суставов ±19 см: акромион у модели MoBL над центром головки плечевой кости, ширина по акромионам
     ANSUR II 41,1 по коже; ширина по дельтам при этом 50 (ANSUR 49,7) */
  near(P.ghL[0], 19.0, .5, 'плечевой сустав слева +X'); near(P.ghR[0], -19.0, .5, 'справа −X');
  assert.ok(P.hipL[0] > 0 && P.hipR[0] < 0);
});

test('направления движений: сгибание плеча вперёд, отведение наружу, локоть вперёд, колено назад', () => {
  const q = M.neutral(); q.L.shoulder = [90, 0, 0]; q.R.shoulder = [0, 90, 0]; q.L.elbow = 0; q.R.elbow = 0;
  let { P } = M.fk(q);
  assert.ok(P.elL[2] - P.ghL[2] > 27, 'левая рука вперёд');
  assert.ok(P.elR[0] - P.ghR[0] < -27, 'правая рука в сторону (−X)');
  const q2 = M.neutral(); q2.L.shoulder = [0, 0, 0]; q2.L.elbow = 90; q2.L.knee = 90;
  ({ P } = M.fk(q2));
  assert.ok(P.wrL[2] - P.elL[2] > 26, 'предплечье вперёд');
  assert.ok(P.anL[2] - P.knL[2] < -40, 'голень назад');
  const q3 = M.neutral(); q3.lumbar = [30, 0, 0];
  const f = M.fk(q3); assert.ok(f.P.head[2] > 10, 'наклон корпуса вперёд');
});

test('разложения углов обратимы', () => {
  for (let i = 0; i < 200; i++) {
    const a = [rnd() * 140 - 70, rnd() * 140 - 70, rnd() * 140 - 70];
    const m = M3.mul(M3.rx(a[0]), M3.mul(M3.rz(a[1]), M3.ry(a[2])));
    const e = M.eulerXZY(m); for (let k = 0; k < 3; k++) near(e[k], a[k], 1e-6, 'XZY');
    const m2 = M3.mul(M3.ry(a[0]), M3.mul(M3.rz(a[1] * .8), M3.rx(a[2])));
    const e2 = M.eulerYZX(m2); near(e2[0], a[0], 1e-6, 'YZX α'); near(e2[1], a[1] * .8, 1e-6, 'YZX a'); near(e2[2], a[2], 1e-6, 'YZX b');
    const vx = rnd() * 200 - 100, vz = rnd() * 200 - 100, tw = rnd() * 160 - 80;
    if (Math.hypot(vx, vz) > 170) continue;
    const st = M.swingTwist(M3.mul(M.swing(vx, vz), M3.ry(tw)));
    near(st.vx, vx, 1e-6, 'swing x'); near(st.vz, vz, 1e-6, 'swing z'); near(st.twist, tw, 1e-6, 'twist');
  }
});

test('обратная кинематика руки: хват в точке, ось ручки совпадает, повтор прямой кинематикой', () => {
  for (let i = 0; i < 120; i++) {
    const q = M.neutral(), s = i % 2 ? 'L' : 'R', g = M.SIGN[s];
    const { P } = M.fk(q);
    const dir = V.unit([g * (rnd() * .9 + .1), rnd() * 1.6 - .8, rnd() * 1.4 - .2]);
    const target = V.add(P['gh' + s], dir, 25 + rnd() * 25);
    const axis = V.unit([rnd() - .5, rnd() - .5, rnd() - .5]);
    const info = M.solveArm(q, s, target, axis, [g, -1, -.5]);
    if (info.reachError > 0) continue;
    assert.ok(info.gripError < .05, 'точка хвата ' + info.gripError);
    assert.ok(info.axisError < .5 || info.axisError > 179.5, 'ось ручки ' + info.axisError);
    const f = M.fk(q); near(V.dist(f.P['gh' + s], f.P['el' + s]), M.B.ua, 1e-6, 'длина плеча');
  }
});

test('обратная кинематика ноги: подошва на полу, стопа в заданном направлении, подъём пятки', () => {
  const q = M.neutral(); q.root.p = [0, 80, 0];
  for (const [s, x] of [['L', 14], ['R', -14]]) {
    const foot = M.footFrame([x, 0, 12], M.SIGN[s] * 10, {});
    const r = M.solveLeg(q, s, foot);
    assert.ok(r.reachError <= 0, 'нога дотягивается');
    assert.ok(Math.abs(r.ankleTwist) < 1, 'нет скручивания в голеностопе ' + r.ankleTwist);
  }
  const f = M.fk(q);
  for (const s of ['L', 'R']) for (const p of M.solePoints(f, s)) near(p.p[1], 0, .05, 'подошва');
  const q2 = M.neutral();
  const foot = M.footFrame([9, 0, 13.5], 0, { heel: 30 }); M.solveLeg(q2, 'L', foot);
  const f2 = M.fk(q2), sole = M.solePoints(f2, 'L');
  near(q2.L.mtp, 30, .5, 'пальцы разогнуты на угол подъёма пятки');
  for (const p of sole.filter(p => p.part === 'toes')) near(p.p[1], 0, .05, 'пальцы на полу');
  assert.ok(sole[0].p[1] > 8, 'пятка поднята');
});

test('интерполяция ключей проходит через ключи и не выходит за их диапазон', () => {
  const a = M.pack(M.neutral()), b = M.pack((() => { const q = M.neutral(); q.L.elbow = 140; q.root.p[1] = 60; return q; })());
  const track = M.makeTrack([{ t: 0, v: a }, { t: .5, v: b }, { t: 1, v: a }]);
  const idx = (() => { let i = 0; for (const [p, n] of M.PACK) { if (p === 'L.elbow') return i; i += n; } })();
  near(track(.5).v[idx], 140, 1e-9, 'ключ'); near(track(0).v[idx], 6, 1e-9, 'начало');
  for (let t = 0; t <= 1; t += .02) { const v = track(t).v[idx]; assert.ok(v >= 6 - 1e-9 && v <= 140 + 1e-9); }
});

test('поза каталога: ориентиры, ортонормированные рамки, правая сторона тела по R.x', () => {
  const R = M.catalogPose(M.neutral());
  assert.equal(R.basis, 'mannequin');
  for (const k of ['hip', 'sh', 'head', 'shL', 'elR', 'gripL', 'knL', 'anR', 'heelL', 'toeR']) assert.ok(R[k], k);
  assert.ok(V.dot(V.sub(R.shR, R.shL), R.x) > 30, 'правое плечо со стороны R.x');
  for (const f of Object.values(R.frames)) {
    near(V.len(f.x), 1, 1e-9, 'x'); near(V.dot(f.x, f.y), 0, 1e-9, 'xy'); near(V.dot(f.y, f.z), 0, 1e-9, 'yz');
  }
  assert.ok(R.hip[1] < 186 && R.heelL[1] > 185, 'Y вниз, пол 186');
});

test('поверхность тела замкнута и симметрична; знаковое расстояние корпуса', () => {
  const R = M.catalogPose(M.neutral()), S = M.surface(R);
  assert.equal(S.torso.length, M.TORSO_H.length);
  const ring = S.torso[S.torso.length >> 1];
  const xs = ring.map(p => p[0]); near(Math.max(...xs), -Math.min(...xs), .01, 'симметрия корпуса');
  const c = M.spineFrame(R, 30).c;
  assert.ok(M.torsoSDF(R, c) < -8, 'центр корпуса внутри');
  assert.ok(M.torsoSDF(R, V.add(c, [0, 0, 40])) > 25, 'точка спереди снаружи');
  const mid = V.mix(R.shL, R.elL, .5); assert.ok(M.limbSDF(R, 'ua', 'L', mid) < -3, 'ось плеча внутри руки');
});

test('сечение груди — скруглённый прямоугольник по ANSUR II: глубина и обхват в средней половине людей, ширина не больше 30', () => {
  /* 4.39.0: на уровне сосков (128,2 см, ANSUR II chestheight) — горизонтальное сечение кожи корпуса стоя со складками,
     как в tools/mannequin/anthro.js; ANSUR II (мужчины 170–180 см, 72–84 кг): ширина 27,4–29,1, глубина 23,3–25,2,
     обхват 99,2–104,3. Ширина 28,3 недостижима, пока тела широчайшей — трубки (комментарий к TORSO) */
  const R = M.catalogPose(M.neutral()), cache = M.torsoCache(R), y = M.FLOOR - 128.2, zc = M.spineFrame(R, 30).c[2], pts = [];
  for (let i = 0; i < 360; i++) {
    const a = i / 360 * 2 * Math.PI, at = r => [Math.cos(a) * r, y, zc + Math.sin(a) * r];
    let lo = 0, hi = 30; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (M.torsoSDF(R, at(m), cache) < 0) lo = m; else hi = m; }
    const p = at(lo); pts.push([p[0], p[2]]);
  }
  const ext = k => Math.max(...pts.map(p => p[k])) - Math.min(...pts.map(p => p[k]));
  const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of s) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of s.reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1)); let per = 0; for (let i = 0; i < h.length; i++) per += Math.hypot(h[i][0] - h[(i + 1) % h.length][0], h[i][1] - h[(i + 1) % h.length][1]);
  assert.ok(ext(0) <= 30, `ширина груди ${ext(0).toFixed(1)}`);
  assert.ok(ext(1) >= 23.3 && ext(1) <= 25.2, `глубина груди ${ext(1).toFixed(1)}`);
  assert.ok(per >= 99.2 && per <= 104.3, `обхват груди ${per.toFixed(1)}`);
});

test('сетка корпуса: столбцы по «смешанному» углу — на плоских гранях не реже 3,5 см, хорда не больше 1 мм', () => {
  /* colAngle: при n = 2 — прежний угол; монотонна; концы [0, π] на месте */
  assert.equal(M.colAngle(.7, [14, 11, 10, 2, 2]), .7);
  const sec = M.sectionAt(38.8); let prev = -1;
  for (let i = 0; i <= 64; i++) { const a = M.colAngle(i / 64 * Math.PI, sec); assert.ok(a > prev, 'монотонно'); prev = a; }
  near(M.colAngle(0, sec), 0, 1e-12, 'передняя линия'); near(M.colAngle(Math.PI, sec), Math.PI, 1e-12, 'задняя линия');
  /* стоя без складок: шаг между соседними точками ряда и наибольшее отклонение кожи между ними от отрезка (хорда) */
  M.noFolds(() => {
    const R = M.catalogPose(M.neutral()), S = M.surface(R), n = M.TORSO_COLS;
    let step = 0, sag = 0;
    S.torsoHeights.forEach((hh, i) => {
      if (hh < 20 || hh > 50) return;
      const row = S.torso[i], sc = M.sectionAt(hh), at = phi => M.torsoPoint(R, hh, 'L', M.colAngle(phi, sc));
      for (let j = 0; j < n / 2; j++) {
        const p = row[j], q = row[j + 1], d = V.sub(q, p), L = V.len(d); step = Math.max(step, L);
        for (let k = 1; k < 8; k++) { const m = at((j + k / 8) / n * 2 * Math.PI), w = V.sub(m, p); sag = Math.max(sag, V.len(V.perp(w, V.scale(d, 1 / L)))); }
      }
    });
    assert.equal(S.torso[0].length, n);
    assert.ok(step < 3.5, `шаг сетки ${step.toFixed(2)} см`);
    assert.ok(sag < .1, `хорда сетки ${(sag * 10).toFixed(2)} мм`);
  });
});

test('босая стопа: размеры по Winter и ANSUR II, свод, подушечки пальцев на плоскости подошвы, точки для проверок', () => {
  for (const s of ['L', 'R']) {
    const g = M.SIGN[s], sh = M.footShape(s), pts = sh.rear.flat();
    const toeTip = Math.max(...sh.toes.map(t => M.B.ball[2] + t.pts.at(-1)[2] + t.r)), heel = Math.min(...pts.map(p => p[2]));
    near(toeTip - heel, .152 * M.B.stature, .6, 'длина стопы 0,152·H');
    const width = Math.max(...pts.map(p => p[0])) - Math.min(...pts.map(p => p[0]));
    near(width, .055 * M.B.stature, .5, 'ширина по головкам плюсневых 0,055·H');
    near(Math.min(...pts.map(p => p[1])), -M.B.ankle, .05, 'подошва на полу');
    for (const t of sh.toes) near(t.pts.at(-1)[1] - t.r, M.B.toeSole, .02, 'подушечка пальца на плоскости подошвы');
    assert.ok(new Set(sh.rear.map(r => r.length)).size === 1, 'кольца одной длины');
    /* свод: медиальный край подошвы посередине стопы поднят, латеральный лежит на полу */
    const mid = M.FOOT_SECTIONS.find(sec => sec[0] === 6);
    assert.ok(mid[3] - mid[2] > 1.2, 'медиальный край приподнят сводом');
    const fp = M.footPoints(s);
    assert.ok(fp.length > 150 && fp.some(p => p.sole && p.part === 'toes') && fp.some(p => p.sole && p.part === 'rear'), 'точки поверхности с подошвой и пальцами');
    /* большой палец — с медиальной стороны */
    assert.ok(-g * sh.toes[0].pts[0][0] > 2, 'большой палец медиально');
  }
});

test('шарниры поясницы — на уровнях L5/S1 и L2/L3, оси через позвоночник, нейтральная поза не меняется', () => {
  /* Высота и глубина — центры межпозвонковых суставов модели поясничного отдела MyoSim (MyoBack; Christophy et al.,
     2012), перенесённые на манекен теми же преобразованиями, что кости (tools/muscles): L5/S1 — 15,2 см над
     тазобедренными и 4,4 см кзади от оси корпуса, L2/L3 — 24,6 и 3,1 см. Точка оси при сгибании, наклоне и повороте
     остаётся на месте; грудная клетка в нейтральной позе — на 24 см, как раньше (по ней посажены рёбра и кожа). */
  assert.equal(M.B.lumbar[1], 15); assert.equal(M.B.lumbar[1] + M.B.thoracic[1], 24);
  assert.deepEqual(M.B.lumbarPivot, [0, 0, -4.4]); assert.deepEqual(M.B.thoracicPivot, [0, 0, -3.1]);
  assert.deepEqual(M.TORSO_JOINTS, [15, 24]);
  const q0 = M.neutral(), F0 = M.fk(q0).F;
  const axisL = F => V.add(F.pelvis.o, M3.v(F.pelvis.R, V.add(M.B.lumbar, M.B.lumbarPivot)));
  const axisT = F => V.add(F.lumbar.o, M3.v(F.lumbar.R, V.add(M.B.thoracic, M.B.thoracicPivot)));
  nearV(F0.thorax.o, V.add(F0.pelvis.o, [0, M.B.lumbar[1] + M.B.thoracic[1], 0]), 1e-9, 'нейтральная поза: грудная клетка на месте');
  for (const a of [[40, 0, 0], [-20, 0, 0], [0, 20, 0], [0, 0, 25]]) {
    const q = M.neutral(); q.lumbar = a; q.thoracic = a;
    nearV(axisL(M.fk(q).F), axisL(F0), 1e-9, `ось поясничного шарнира неподвижна (${a})`);
    const r = M.neutral(); r.thoracic = a;
    nearV(axisT(M.fk(r).F), axisT(F0), 1e-9, `ось грудопоясничного шарнира неподвижна (${a})`);
  }
  /* наклон вперёд: начало рамки грудной клетки (ось корпуса) лежит на 3,1 см впереди оси шарнира и при сгибании
     опускается по дуге вокруг неё (при оси в центре корпуса оно оставалось на месте) */
  const q = M.neutral(); q.thoracic = [30, 0, 0];
  const F = M.fk(q).F, d = V.dist(F.thorax.o, axisT(F)), d0 = V.dist(F0.thorax.o, axisT(F0));
  near(d, d0, 1e-9, 'расстояние от оси до начала рамки сохраняется');
  near(F.thorax.o[1] - F0.thorax.o[1], -3.1 * Math.sin(30 * Math.PI / 180), 1e-6, 'начало рамки опускается');
});

test('ось нижнего шарнира шеи — через тела позвонков у диска C7–T1, нейтральная поза не меняется', () => {
  /* 4.38.0: мгновенные оси шейных сегментов лежат в теле нижнего позвонка у его верхней пластинки (Amevo, Worth,
     Bogduk, 1991). Ось шарнира шеи — у диска C7–T1, на 2,7 см ниже и 4,7 см впереди начала рамки шеи (раньше ось шла
     через начало рамки — у остистого отростка C7). При сгибании, наклоне и повороте точка оси остаётся на месте,
     начало рамки шеи в нейтральной позе — прежнее (по нему посажены шейные позвонки и кожа шеи). */
  assert.deepEqual(M.B.neckPivot, [0, -2.7, 4.7]);
  const F0 = M.fk(M.neutral()).F, axis = F => V.add(F.thorax.o, M3.v(F.thorax.R, V.add(M.B.c7, M.B.neckPivot)));
  nearV(F0.neck.o, V.add(F0.thorax.o, M3.v(F0.thorax.R, M.B.c7)), 1e-9, 'нейтральная поза: рамка шеи на месте');
  for (const a of [[40, 0, 0], [-40, 0, 0], [0, 30, 0], [0, 0, 50]]) {
    const q = M.neutral(); q.neck = a; nearV(axis(M.fk(q).F), axis(F0), 1e-9, `ось шарнира шеи неподвижна (${a})`);
  }
  /* при сгибании шеи затылок (начало рамки шеи — позади оси) поднимается и уходит вперёд по дуге вокруг оси */
  const q = M.neutral(); q.neck = [40, 0, 0];
  const F = M.fk(q).F; near(V.dist(F.neck.o, axis(F)), V.dist(F0.neck.o, axis(F0)), 1e-9, 'расстояние от оси до рамки сохраняется');
});

test('позвонки L5–L1 делят поворот грудного шарнира по уровням, как MyoSim', () => {
  /* связи суставов поясницы MyoBack (myotorso_assets.xml): доли уровней L4/L5…L1/L2 от поворота выше L5/S1 —
     сгибание 0,185 : 0,204 : 0,231 : 0,255, наклон 0,1811 : 0,2453 : 0,2501 : 0,188, поворот 0,03778 : 0,03778 : 0,03111 : 0,02889 */
  const cum = r => { const s = r.reduce((a, b) => a + b), out = []; let acc = 0; for (const x of r.slice(0, 3)) out.push((acc += x) / s); return out; };
  const want = [cum([.185, .204, .231, .255]), cum([.1811, .2453, .2501, .188]), cum([.03778, .03778, .03111, .02889])];
  M.VERT_SHARE.forEach((row, i) => row.forEach((v, k) => near(v, want[k][i], .002, `доля у позвонка ${['L4', 'L3', 'L2'][i]}, ось ${k}`)));
  const R0 = M.catalogPose(M.neutral());
  for (const h of [16.39, 20.02, 23.28, 26.15, 29.17]) nearV(M.vertebraFrame(R0, h).c, M.spineFrame(R0, h).c, 1e-9, `нейтральная поза: позвонок на ${h}`);
  const q = M.neutral(); q.lumbar = [10, 0, 0]; q.thoracic = [40, 0, 0];
  const R = M.catalogPose(q), T = R.frames.thorax, L = R.frames.lumbar;
  const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, V.dot(a, b)))) * 180 / Math.PI;
  near(ang(M.vertebraFrame(R, 16.39).y, L.y), 0, 1e-6, 'L5 — с поясничной рамкой');
  near(ang(M.vertebraFrame(R, 23.28).y, L.y), 40 * M.VERT_SHARE[1][0], 1e-6, 'L3 — доля сгибания');
  nearV(M.vertebraFrame(R, 29.17).c, V.add(T.o, T.y, 29.17 - 24), 1e-9, 'L1 — с грудной рамкой');
});

test('кожа корпуса в глубоком скручивании и повороте не складывается, расстояние до кожи совпадает с сеткой', () => {
  /* самые глубокие позы каталога: скручивания на блоке (поясница 36°, грудной шарнир 34°) и «велосипед» (поворот 32°) */
  const crunch = M.neutral(); crunch.lumbar = [36, 0, 0]; crunch.thoracic = [34, 0, 0];
  const twist = M.neutral(); twist.lumbar = [10, 0, 6]; twist.thoracic = [27, 0, 32];
  for (const [name, q] of [['скручивание', crunch], ['поворот', twist]]) {
    const R = M.catalogPose(q), cache = M.torsoCache(R);
    let step = Infinity, sdf = 0;
    for (const side of ['L', 'R']) for (let a = 0; a <= Math.PI + 1e-9; a += Math.PI / 16) {
      let prev = null;
      for (let h = -1; h <= 36; h += .25) {
        const p = M.torsoPoint(R, h, side, a), f = M.torsoFrame(R, h), k = f.front ? M.frontK(a) : 0, y = V.unit(V.mix(f.y, (f.front || f).y, k));
        if (prev) step = Math.min(step, V.dot(V.sub(p, prev), y) / .25);
        sdf = Math.max(sdf, Math.abs(M.torsoSDF(R, p, cache))); prev = p;
      }
    }
    assert.ok(step > .15, `${name}: кожа сжата до ${step.toFixed(2)} (складка)`);
    assert.ok(sdf < .7, `${name}: расстояние до кожи у точки кожи ${sdf.toFixed(2)} см`);
  }
});

test('складки подмышки: кожа корпуса над осью складки поднимается плавно, симметрично и одинаково в сетке и в расстояниях', () => {
  const up = M.neutral(); for (const s of ['L', 'R']) up[s].shoulder = [0, 160, 0];   /* руки над головой */
  const side = M.neutral(); for (const s of ['L', 'R']) side[s].shoulder = [0, 90, 0];  /* руки в стороны */
  const lift = (R, s) => { let mx = 0; for (let h = 30; h <= 56; h += 1) for (let a = 0; a <= Math.PI; a += Math.PI / 24) mx = Math.max(mx, M.V.dist(M.torsoPoint(R, h, s, a), M.noFolds(() => M.torsoPoint(R, h, s, a)))); return mx; };
  const R0 = M.catalogPose(M.neutral()), Ru = M.catalogPose(up), Rs = M.catalogPose(side);
  /* стоя кожа почти не меняется (замеры ANSUR — tools/mannequin/anthro.js), рука отведена — складка поднимается */
  assert.ok(lift(R0, 'L') < 1.6, `стоя подъём ${lift(R0, 'L').toFixed(2)} см`);
  assert.ok(lift(Rs, 'L') > lift(R0, 'L') + 1 && lift(Ru, 'L') > lift(R0, 'L') + 1, 'с отведённой рукой складка выше');
  for (const R of [R0, Ru, Rs]) {
    near(lift(R, 'L'), lift(R, 'R'), .02, 'слева и справа одинаково');
    /* без складок — ровно прежняя кожа; с ними точки сетки лежат на нулевом уровне расстояний */
    const cache = M.torsoCache(R), S = M.surface(R);
    let dT = 0, dA = 0;
    /* выше 52 см — надплечья со сдвигом за плечевым поясом: там сетка и расстояние расходятся и без складок (до 0,6 см) */
    S.torsoHeights.forEach((h, i) => { if (h >= 25 && h <= 52) for (const p of S.torso[i]) dT = Math.max(dT, Math.abs(M.torsoSDF(R, p, cache))); });
    for (const s of ['L', 'R']) for (const row of S.limbs['ua' + s]) for (const p of row) dA = Math.max(dA, Math.abs(M.limbSDF(R, 'ua', s, p)));
    assert.ok(dT < .15 && dA < .05, `кожа сетки и расстояний расходится: корпус ${dT.toFixed(2)}, плечо ${dA.toFixed(2)} см`);
  }
  /* соседние точки сетки сдвинуты почти одинаково: без зубцов */
  for (const R of [Ru, Rs]) {
    const S = M.surface(R), S0 = M.noFolds(() => M.surface(R));
    let jump = 0;
    const a = S.torso, b = S0.torso, d = (i, j) => M.V.dist(a[i][j % a[i].length], b[i][j % a[i].length]);
    for (let i = 0; i < a.length; i++) for (let j = 0; j < a[i].length; j++) {
      jump = Math.max(jump, Math.abs(d(i, j) - d(i, j + 1)));
      if (i + 1 < a.length) jump = Math.max(jump, Math.abs(d(i, j) - d(i + 1, j)));
    }
    /* соседние точки сетки — в 2,5–3 см друг от друга */
    assert.ok(jump < 1.3, `скачок подъёма между соседними точками ${jump.toFixed(2)} см`);
    /* плечо складки не меняют */
    for (const s of ['L', 'R']) assert.deepEqual(S.limbs['ua' + s], S0.limbs['ua' + s]);
  }
});

test('подгонка складок (tools/mannequin/folds-fit.js) считает подъём кожи той же формулой, что манекен', () => {
  const F = require('./mannequin/folds-fit.js'), NR = M.catalogPose(M.neutral());
  const q = M.neutral(); q.L.shoulder = [20, 120, 0]; q.R.shoulder = [-10, 60, 0]; const R = M.catalogPose(q);
  const L0 = Object.fromEntries(Object.entries(M.FOLDS).map(([k, f]) => [k, F.axes(f, NR.frames.thorax, NR.frames.uaL, 'L', 0).L]));
  /* оси складок обеих сторон: подъём — наибольший по всем (широкая складка заходит за среднюю линию) */
  const set = ['L', 'R'].flatMap(s => Object.entries(M.FOLDS).map(([k, f]) => F.axes(f, R.frames.thorax, R.frames['ua' + s], s, L0[k])));
  for (const s of ['L', 'R']) {
    for (let i = 0; i < 300; i++) {
      const p = V.add(R['sh' + s], [rnd() * 36 - 18, rnd() * 36 - 6, rnd() * 30 - 15]);
      near(F.lift(set, p), M.foldLift(R, p), 1e-9, 'подъём');
    }
  }
});
