'use strict';
/* Турецкий подъём с гирей — ЧЕРНОВИК (id с «_»: в каталог и в 09bp-poses.js не попадает, check.js его пропускает).
   Шесть ключевых положений с разными опорами — по школе RKC (R. Jankowitz, «The Kettlebell Get-up in Detail», части 1 и 2,
   RKC School of Strength, 25.02.2021 и 06.05.2021; пересказ):
     t=0   лёжа: гиря выжата над грудью на прямой руке, нога со стороны гири согнута, стопа на коврике, другая нога прямая
           («ноги буквой V»), свободная рука на коврике под 45° к корпусу — так, чтобы локоть оказался под плечом;
     t=0,2 на локте: «диагональное скручивание» — плечо к противоположному бедру, плечо над локтем, грудь вверх;
     t=0,4 на ладони (сидя): ладонь на коврике, локоть прямой, кисть чуть развёрнута назад;
     t=0,6 мост: таз поднят (с тяжёлой гирей — невысоко), опоры — ладонь, стопа согнутой ноги и пятка прямой;
     t=0,8 на колене: колено прямой ноги заведено под таз, на линии «запястье — колено — голеностоп», носок подогнут;
           после «дворника» (поворот голени) — выпад на колене, корпус вертикален, гиря над головой (рука вертикальна);
     t=1   стоя: ноги вместе, гиря над головой.
   Рука с гирей всё время вертикальна (кулак над плечом), запястье прямое, взгляд — на гирю (в положениях лёжа и на опоре).
   Гиря — в левой руке (как в «мельнице» и рывке). Ось Z — вдоль тела лёжа (голова к +Z; лёжа на спине левая сторона — −X),
   Y — вверх, см.
   Переходы между положениями не построены: между ключами поза — интерполяция углов, кадры между ключами не проверены. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
/* на полу, без коврика: свободная рука под 45° к корпусу ложится за край обычного коврика (70 см) */
const MAT = 0, KB_KG = 16;

/* Гантель/гиря в кисти с заданной осью рукояти — как holdDir в g2-dumbbell.js: подбирается пронация, чтобы линия
   «мизинец → большой палец» шла по axis (signed — с учётом направления большого пальца) */
function holdDir(C, q, s, point, pole, axis, { flex = 0, dev = 0, lo = -88, hi = 84, signed = false, mode, short = false } = {}) {
  const { V } = C, ax = V.unit(axis);
  const score = p => { C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true, mode }); const d = V.dot(C.M3.col(C.fk(q).F['hand' + s].R, 2), ax); return signed ? d : Math.abs(d); };
  let best = lo, bv = -Infinity;
  for (let p = lo; p <= hi + 1e-9; p += 4) { const v = score(p); if (v > bv) { bv = v; best = p; } }
  let a = Math.max(lo, best - 4), b = Math.min(hi, best + 4);
  for (let i = 0; i < 18; i++) { const m1 = a + (b - a) * .382, m2 = a + (b - a) * .618; if (score(m1) >= score(m2)) b = m2; else a = m1; }
  const p = (a + b) / 2; for (let k = 0; k < 3; k++) C.hold(q, s, point, pole, { pron: p, flex, dev, allowShort: true, mode }); C.hold(q, s, point, pole, { pron: p, flex, dev, mode, allowShort: short }); return p;
}
/* Гиря над плечом на прямой руке: кулак над плечевым суставом по вертикали (reach — от сустава до центра хвата, как
   вверху жима стоя), глубокий хват ('deep'), большой палец — к средней линии тела, локоть смотрит вниз-наружу; рука
   выпрямлена до конца — недостача в доли сантиметра допускается (allowShort) */
function bellUp(C, q, s = 'L', { reach = 63, girdle = [0, 6] } = {}) {
  const { V } = C;
  q[s].girdle = [...girdle];
  const f = C.fk(q), T = C.axes(q, 'thorax'), lat = C.lat(q, s), latH = V.unit(V.perp(lat, [0, 1, 0])), g = V.add(f.P['gh' + s], [0, 1, 0], reach);
  /* локоть — как вверху жима стоя (g2-dumbbell.js, kbpress): вниз по корпусу, наружу и вперёд */
  const pole = V.unit(V.add(V.add(V.scale(T.y, -1), lat, .6), T.z, .8));
  return holdDir(C, q, s, g, pole, V.scale(latH, -1), { signed: true, mode: 'deep', short: true });
}
/* Ладонь на коврике: центр ладони в точке P, пальцы по fingers; полюс локтя — перебором (минимум пронации и ротации плеча) */
function palmOn(C, q, s, P, fingers, prefer) {
  const { V, M } = C, gh = C.fk(q).P['gh' + s], d = V.unit(V.sub(P, gh));
  const base = V.unit(V.perp(Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0], d)), side = V.cross(d, base);
  let best = null;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * 2 * Math.PI, pole = V.add(V.scale(base, Math.cos(a)), side, Math.sin(a)), t = M.clone(q);
    try { C.palm(t, s, P, fingers, [0, 1, 0], pole); } catch (e) { continue; }
    const cost = Math.max(Math.abs(t[s].pron) / 82, Math.abs(t[s].shoulder[2]) / 85, Math.abs(t[s].wrist[1]) / 22) + (prefer ? 1.5 * (1 - V.dot(pole, V.unit(prefer))) : 0);
    if (!best || cost < best.cost) best = { cost, pole };
  }
  return C.palm(q, s, P, fingers, [0, 1, 0], best.pole);
}

/* нижняя точка стопы стороны s (по точкам её поверхности) — как в g5a-floor.js */
function lowestFoot(C, q, s) {
  const { M } = C, f = C.fk(q);
  return Math.min(...M.footPoints(s).map(fp => M.footPointWorld(f.F['foot' + s], f.F['toes' + s], fp)[1]));
}

/* ---------- 1. Лёжа ---------- */
const TGU = { kneeL: 95, legR: 22, armR: 45 };
function tguSupine(C) {
  const { V, M } = C, q = C.base();
  C.root(q, [0, 20, 0], [0, 0, 1], [0, 1, 0]);
  q.lumbar = [2, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [0, 0, 0];
  q.L.hip = [50, 8, 4]; q.L.knee = TGU.kneeL;
  C.restOn(q, 'back', [0, MAT, 0], [0, 1, 0], -.8);
  { const f = C.fk(q), h = V.mix(f.P.hipL, f.P.hipR, .5); q.root.p = V.add(q.root.p, [-h[0], 0, -10 - h[2]]); }
  C.neckTo(q, 'headBack', [0, MAT, 0], [0, 1, 0], -.3);
  const f = C.fk(q);
  /* левая стопа на коврике: колено согнуто на kneeL, стопа на ширине таза */
  {
    const hip = f.P.hipL, base = M.clone(q), put = (t, D) => C.foot(t, 'L', [hip[0], MAT, hip[2] - D], 0, V.unit(V.add([0, 1, 0], C.latP(t, 'L'), .15)), { forward: [0, 0, -1] });
    const D = C.solve1D(D => { const t = M.clone(base); put(t, D); return t.L.knee - TGU.kneeL; }, 15, 85);
    put(q, D);
  }
  /* правая нога прямая, отведена на legR: пятка лежит на коврике (нижняя точка стопы — на 0,3 см в коврике) */
  {
    const hip = f.P.hipR, a = TGU.legR * C.D2R, L = M.B.th + M.B.sk - .3, lat = V.unit(V.perp(C.latP(q, 'R'), [0, 1, 0])), dir = V.add(V.scale(lat, Math.sin(a)), [0, 0, -1], Math.cos(a));
    const put = y => { const A = V.add(hip, dir, Math.sqrt(Math.max(1, L * L - (hip[1] - y) ** 2))); C.legTo(q, 'R', [A[0], y, A[2]], [0, 1, 0], { dorsi: 5 }); };
    put(C.solve1D(y => { put(y); return lowestFoot(C, q, 'R') - (MAT - .3); }, MAT, MAT + 12));
  }
  /* правая рука на коврике под armR к корпусу, ладонью вниз; ладонь — на расстоянии почти прямой руки (центр ладони
     в 60,3 см от плечевого сустава: локоть согнут на ~10°) */
  {
    q.R.girdle = [0, -4];
    const gh = C.fk(q).P.ghR, a = TGU.armR * C.D2R, lat = V.unit(V.perp(C.lat(q, 'R'), [0, 1, 0])), dir = V.add(V.scale(lat, Math.sin(a)), [0, 0, -1], Math.cos(a)), P = V.add([gh[0], MAT, gh[2]], dir, Math.sqrt(60.3 ** 2 - (gh[1] - MAT - 2) ** 2));
    palmOn(C, q, 'R', P, dir);
  }
  bellUp(C, q, 'L', { reach: M.B.ua + 35.2 });
  return q;
}

/* ---------- 6. Стоя ---------- */
function tguStand(C) {
  const { V, M } = C, q = C.base();
  C.root(q, [0, 88.6 + MAT, -10], [0, 1, 0], [0, 0, -1]);
  const feet = q => { for (const s of S) { const g = M.SIGN[s], x = -g * 10, a = -g * 8 * C.D2R, fwd = [Math.sin(a), 0, -Math.cos(a)]; C.foot(q, s, [x + fwd[0] * 13.5, MAT, -10 + 2 + fwd[2] * 13.5], 0, V.unit([fwd[0] - g * .15, 0, fwd[2]]), { forward: fwd }); } };
  feet(q);
  q.R.shoulder = [4, 8, 0]; q.R.elbow = 10; q.hands = { ...(q.hands || {}), R: 'relaxed' };
  bellUp(C, q, 'L', { reach: 63, girdle: [0, 0] });
  /* равновесие: центр масс с гирей — над серединой стоп */
  for (let i = 0; i < 6; i++) {
    const c = C.com(q, [[C.fk(q).P.gripL, KB_KG]]), d = [-c[0], 0, -10 - 1 - c[2]];
    if (Math.hypot(d[0], d[2]) < .15) break;
    q.root.p = V.add(q.root.p, d); feet(q); bellUp(C, q, 'L', { reach: 63, girdle: [0, 0] });
  }
  return q;
}

const POS = [tguSupine, null, null, null, null, tguStand];
const KEYS = [0, .2, .4, .6, .8, 1];
/* опоры каждого положения — только в его ключе (when) */
const at = (k, list) => list.map(c => ({ ...c, when: [KEYS[k] - .01, KEYS[k] + .01] }));
module.exports = {
  _kbtgu: {
    keys: KEYS.filter((_, k) => POS[k]),
    equipment: [{ type: 'kettlebell', id: 'kb', hands: ['L'], rest: true }],
    contacts: [{ body: 'gripL', prop: 'kb' },
      ...at(0, [{ body: 'back', prop: 'floor' }, { body: 'buttocks', prop: 'floor' }, { body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'palmR', prop: 'floor' }]),
      ...at(5, [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }])],
    gripRadius: { L: 1.7, R: 1.7 },
    pose(t, C) { const k = KEYS.reduce((b, x, i) => Math.abs(x - t) < Math.abs(KEYS[b] - t) ? i : b, 0); return (POS[k] || POS.find(Boolean))(C); }
  }
};
