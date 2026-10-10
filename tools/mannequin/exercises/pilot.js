'use strict';
/* Пилот: упражнения со скриншотов пользователя. Ось Z — вдоль скамьи/тренажёра, X — поперёк, Y — вверх, см.
   Каждая поза строится так: корпус (углы) → опора (подушка, сиденье, пол) → стопы → кисти к реальным ручкам. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };

/* ---------- Раскладки, от которых зависит инвентарь (оси рычагов, направляющие) ---------- */
/* Сидя спиной к вертикальной подушке «бабочки» или грудью к ней */
function seatedAgainstPad(C, { seatH, padZ, facing, padRegion, lean = 0, lumbar = 0, feet = 9 }) {
  const { V } = C, q = C.base(), dir = facing === 'pad' ? 1 : -1, a = lean * C.D2R;
  C.root(q, [0, seatH + 12, 0], [0, Math.cos(a), dir * Math.sin(a)], [0, -Math.sin(a), dir * Math.cos(a)]);
  q.lumbar = [lumbar, 0, 0];
  for (const s of S) { q[s].hip = [88, 6, 4]; q[s].knee = 88; }
  C.restOn(q, 'buttocks', [0, seatH, 0], [0, 1, 0], -1.3);
  C.restOn(q, padRegion, [0, 0, padZ], [0, 0, -1], -1.0);
  for (const s of S) { const f = C.fk(q), kn = f.P['kn' + s], lat = C.latP(q, s); C.foot(q, s, V.add([kn[0], 0, kn[2] + dir * feet], lat, 2), 0, V.unit(V.add([0, 0, dir], lat, .25)), { forward: V.unit(V.add([0, 0, dir], lat, .2)) }); }
  return q;
}
const PEC = once(() => {
  const C = ctx([]), q = seatedAgainstPad(C, { seatH: 48, padZ: 18, facing: 'away', padRegion: 'back', feet: 13 }), f = C.fk(q);
  return { q, gh: { L: f.P.ghL, R: f.P.ghR } };
});
const RFLY = once(() => {
  const C = ctx([]), q = seatedAgainstPad(C, { seatH: 50, padZ: 26, facing: 'pad', padRegion: 'chest', lean: 4 }), f = C.fk(q);
  return { q, gh: { L: f.P.ghL, R: f.P.ghR } };
});
const SMITH_BENCH = { type: 'adjBench', id: 'bench', back: 82, seat: 4, at: [0, 0, 0] };
const SOHP = once(() => {
  const C = ctx([SMITH_BENCH]), { V } = C, q = C.base(), bp = C.frame('bench', 'backPad'), sp = C.frame('bench', 'seatPad');
  const by = C.M.M3.col(bp.R, 1), bz = C.M.M3.col(bp.R, 2);
  C.root(q, [0, 60, -12], bz, by);
  q.lumbar = [6, 0, 0]; q.thoracic = [-4, 0, 0];
  for (const s of S) { q[s].hip = [86, 8, 6]; q[s].knee = 92; }
  C.restOn(q, 'buttocks', sp.o, C.M.M3.col(sp.R, 1), -1.4);
  C.restOn(q, 'back', bp.o, by, -1.0);
  const f = C.fk(q);
  return { q, gh: V.mix(f.P.ghL, f.P.ghR, .5), head: f.P.head };
});

module.exports = {
  _stand: {
    keys: [0, 1],
    equipment: [{ type: 'mat', id: 'mat' }],
    pose(t, C) {
      const q = C.base();
      for (const s of S) { q[s].shoulder = [C.lerp(0, 160, t), C.lerp(8, 20, t), 0]; q[s].elbow = C.lerp(6, 10, t); C.rhythm(q, s); }
      return q;
    }
  },

  /* Жим штанги лёжа. t=0 — гриф на прямых руках над плечами, t=1 — гриф касается низа груди. */
  bbbench: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'benchUprights', id: 'rack', z: 47, hook: 107 }, { type: 'barbell', id: 'bar', plates: [20, 5] }],
    contacts: [{ body: 'back', prop: 'bench:pad' }, { body: 'headBack', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'bar' }, { body: 'gripR', prop: 'bar' }],
    pose(t, C) {
      const { V } = C, q = C.base();
      C.root(q, [0, 62, -24], [0, 0, 1], [0, 1, 0]);
      q.lumbar = [-5, 0, 0]; q.thoracic = [-9, 0, 0];
      for (const s of S) q[s].girdle = [-4, -14];
      C.restOn2(q, 'upperBack', 'buttocks', [0, 44, 0], [0, 1, 0], -1.2);
      C.neckTo(q, 'headBack', [0, 44, 0], [0, 1, 0], -.5);
      for (const s of S) {
        const lat = C.latP(q, s), fwd = V.unit(V.add([0, 0, -1], lat, .3));
        C.foot(q, s, V.add([0, 0, -78], lat, 27), 0, V.unit(V.add([0, .5, -1], lat, .5)), { forward: fwd });
      }
      const f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5), chest = C.chestPoint(q, 33);
      const top = [0, gh[1] + 57.5, gh[2] + 2], bottom = [0, chest[1] + 1.6, chest[2]];
      const e = C.ease(t), bar = [0, C.lerp(top[1], bottom[1], e), C.lerp(top[2], bottom[2], Math.pow(e, .8))];
      for (const s of S) {
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], lat, 1.15), [0, 0, -1], .55));
        C.grip(q, s, V.add(bar, lat, 40), V.scale(lat, -1), pole, { wristExt: 12 });
      }
      return q;
    }
  },

  /* Тяга гантели одной рукой: правые колено и ладонь на скамье, левая стопа на полу, работает левая рука.
     t=0 — рука выпрямлена, гантель внизу; t=1 — гантель у пояса, локоть вверх и назад. */
  dbrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'flatBench', id: 'bench' }, { type: 'dumbbell', id: 'db', hand: 'L' }],
    contacts: [{ body: 'kneeR', prop: 'bench:pad' }, { body: 'palmR', prop: 'bench:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'gripL', prop: 'db' }],
    gripRadius: { L: 1.6, R: 1.4 },
    pose(t, C) {
      const { V } = C, q = C.base(), e = C.ease(t), a = 3 * C.D2R;
      C.root(q, [9, 87.1, -20], [0, Math.sin(a), Math.cos(a)], [0, -Math.cos(a), Math.sin(a)]);
      q.thoracic = [-3, 0, C.lerp(0, 7, e)]; q.lumbar = [0, 0, 0]; q.neck = [-8, 0, 0];
      q.L.girdle = [C.lerp(-2, 4, e), C.lerp(12, -16, e)]; q.R.girdle = [0, 4];
      /* бедро опорной на скамье ноги наклонено: колено на 20° позади таза, иначе стоящая нога не достаёт до пола */
      const kb = 20 * C.D2R, kz = -24 - C.M.B.th * Math.sin(kb);
      C.rootAtHip(q, 'R', [-1, 44 + 5.4 + C.M.B.th * Math.cos(kb), -24]);
      C.kneel(q, 'R', [-1, 44, kz], [0, 0, -1], [0, 1, 0], { toes: 'flat', plantar: 44 });
      let f = C.fk(q);
      C.palm(q, 'R', [f.P.ghR[0] + 4, 44, f.P.ghR[2] + 12], [.8, 0, 1], [0, 1, 0], [-.4, 0, -1]);
      C.foot(q, 'L', [31, 0, -22], 0, V.unit([.3, 0, 1]), { forward: V.unit([.22, 0, 1]) });
      f = C.fk(q);
      const T = C.axes(q, 'thorax'), gh = f.P.ghL;
      const g0 = V.add(V.add(gh, [0, -1, 0], 60.5), [0, 0, 1], 4);
      const g1 = V.add(V.add(V.add(T.o, T.x, 26), T.y, -3), T.z, 8);
      const grip = V.add(V.mix(g0, g1, e), T.z, 6 * Math.sin(Math.PI * e));
      const pole = V.unit(V.mix([.5, -.1, -1], [.25, 1, -.55], e));
      C.hold(q, 'L', grip, pole, { pron: C.lerp(0, -18, e) });
      return q;
    }
  },

  /* Австралийские подтягивания: гриф в J-крюках рамы, пятки на полу, тело прямое.
     t=0 — руки выпрямлены, t=1 — грудь у грифа. Тело вращается вокруг пяток. */
  invrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'powerRack', id: 'rack', hook: 98, pullBar: false }, { type: 'restingBarbell', id: 'bar', c: [0, 99.4, -61], axis: [1, 0, 0], plates: [], on: 'rack:hookL' }],
    contacts: [{ body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'bar' }, { body: 'gripR', prop: 'bar' }],
    pose(t, C) {
      const { V, M } = C, bar = [0, 99.4, -61];
      const body = (theta, Zh) => {
        const q = C.base(), a = theta * C.D2R;
        C.root(q, [0, 50, 0], [0, Math.sin(a), Math.cos(a)], [0, Math.cos(a), -Math.sin(a)]);
        for (const s of S) { q[s].hip = [0, 3, 0]; q[s].knee = 0; q[s].ankle = [-12, 0]; }
        const f = C.fk(q), low = Math.min(...S.flatMap(s => M.solePoints(f, s).map(p => p.p[1])));
        const heelZ = Math.min(...S.flatMap(s => M.solePoints(f, s).map(p => p.p[2])));
        q.root.p = V.add(q.root.p, [0, -low, Zh - heelZ]);
        return q;
      };
      const L = this._layout || (this._layout = (() => {
        const chestY = th => C.chestPoint(body(th, 0), 32)[1];
        const th1 = C.solve1D(th => chestY(th) - (bar[1] - 1.9), 5, 60);
        const Zh = bar[2] - C.chestPoint(body(th1, 0), 32)[2];
        const reach = th => { const q = body(th, Zh), f = C.fk(q); return V.dist(f.P.ghL, V.add(bar, C.lat(q, 'L'), 28)) - 61.8; };
        const th0 = C.solve1D(reach, 0, th1);
        return { th0, th1, Zh };
      })());
      const e = C.ease(t), q = body(C.lerp(L.th0, L.th1, e), L.Zh);
      for (const s of S) q[s].girdle = [C.lerp(4, -2, e), C.lerp(10, -15, e)];
      for (const s of S) {
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], [0, 0, -1], .8), lat, .7));
        C.grip(q, s, V.add(bar, lat, 28), V.scale(lat, -1), pole);
      }
      return q;
    }
  },

  /* Подтягивания прямым хватом на турнике силовой рамы. t=0 — вис на прямых руках, t=1 — подбородок над перекладиной. */
  pullup: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [{ type: 'powerRack', id: 'rack', pullH: 224 }],
    contacts: [{ body: 'gripL', prop: 'rack:pullBar' }, { body: 'gripR', prop: 'rack:pullBar' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), bar = [0, 224, -67], q = C.base();
      C.root(q, [0, 100, bar[2] - 2], [0, 1, 0], [0, 0, 1]);
      q.thoracic = [C.lerp(0, -14, e), 0, 0]; q.lumbar = [C.lerp(-2, -4, e), 0, 0]; q.neck = [C.lerp(0, -16, e), 0, 0];
      for (const s of S) { q[s].hip = [C.lerp(14, 22, e), 4, 4]; q[s].knee = C.lerp(20, 28, e); q[s].ankle = [-30, 0]; q[s].girdle = [C.lerp(28, -4, e), C.lerp(4, -12, e)]; }
      /* корпус: плечевые суставы под перекладиной на высоте вытянутых рук; сверху — перекладина у верха груди */
      const f0 = C.fk(q), ghMid = V.mix(f0.P.ghL, f0.P.ghR, .5);
      const hang = [0, bar[1] - 60.3, bar[2] - 1], top = [0, bar[1] - 12.5, bar[2] - 9];
      C.rootAtShoulders(q, V.mix(hang, top, e));
      for (const s of S) {
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], lat, 1.0), [0, 0, 1], .25));
        C.grip(q, s, V.add(bar, lat, 33), V.scale(lat, -1), pole);
      }
      return q;
    }
  },

  /* «Бабочка»: сидя спиной к подушке, рукояти вертикальные. t=0 — руки разведены, t=1 — рукояти сведены перед грудью. */
  pecdeck: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = PEC(); return [{ type: 'pecDeck', id: 'deck', seatH: 48, padZ: 18, padY: 96, padH: 62, pivot: [Math.abs(L.gh.L[0]), 176, L.gh.L[2]] },
      ...S.map(s => ({ type: 'pecArm', id: 'pec' + s, hand: s, pivot: [L.gh[s][0], 176, L.gh[s][2]], mountTo: 'deck:hub' + (L.gh[s][0] > 0 ? 'L' : 'R') }))]; })(),
    contacts: [{ body: 'back', prop: 'deck:pad' }, { body: 'buttocks', prop: 'deck:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'pecL' }, { body: 'gripR', prop: 'pecR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = PEC(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [2, C.lerp(-12, 10, e)];
      const f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), fwd = [0, 0, -1], back = [0, 0, 1];
        const ang = C.lerp(-14, 76, e) * C.D2R, rad = 50;
        const dir = V.unit(V.add(V.scale(lat, Math.cos(ang)), Math.sin(ang) >= 0 ? fwd : back, Math.abs(Math.sin(ang))));
        const grip = V.add(V.add([L.gh[s][0], gh[1] - 4, L.gh[s][2]], dir, rad), [0, 0, 0]);
        const pole = V.unit(V.add(V.add([0, -.45, 0], back, 1), lat, .2));
        C.grip(q, s, grip, [0, 1, 0], pole);
      }
      return q;
    }
  },

  /* Обратные разведения в «бабочке»: грудью к упору. t=0 — руки впереди, t=1 — руки разведены в стороны. */
  reversefly: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = RFLY(); return [{ type: 'pecDeck', id: 'deck', seatH: 50, padZ: 26, padY: 101, padH: 44, padW: 28, pivot: [Math.abs(L.gh.L[0]), 178, L.gh.L[2]] },
      ...S.map(s => ({ type: 'pecArm', id: 'pec' + s, hand: s, pivot: [L.gh[s][0], 178, L.gh[s][2]], mountTo: 'deck:hub' + (L.gh[s][0] > 0 ? 'L' : 'R') }))]; })(),
    contacts: [{ body: 'chest', prop: 'deck:pad' }, { body: 'buttocks', prop: 'deck:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'pecL' }, { body: 'gripR', prop: 'pecR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = RFLY(), q = C.M.clone(L.q);
      for (const s of S) q[s].girdle = [2, C.lerp(14, -14, e)];
      const f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), fwd = [0, 0, 1];
        const ang = C.lerp(62, -4, e) * C.D2R, rad = 58;
        const dir = V.unit(V.add(V.scale(lat, Math.cos(ang)), fwd, Math.sin(ang)));
        const grip = V.add([L.gh[s][0], gh[1] - 3, L.gh[s][2]], dir, rad);
        /* рукоять чуть наклонена внутренним концом вниз — запястье без локтевого отведения */
        const tangent = V.unit(V.add(V.add(V.scale(lat, -Math.sin(ang)), fwd, Math.cos(ang)), [0, -1, 0], .22));
        const pole = V.unit(V.add(V.add([0, -.3, 0], lat, 1), [0, 0, -1], .2));
        C.grip(q, s, grip, tangent, pole);
      }
      return q;
    }
  },

  /* Жим сидя в машине Смита: спинка 82°, гриф идёт по направляющим перед лицом.
     t=0 — гриф у подбородка, t=1 — руки почти выпрямлены. */
  smithohp: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = SOHP(); const z = L.head[2] - 16.5; return [SMITH_BENCH, { type: 'smith', id: 'smith', z, halfWidth: 62 },
      { type: 'smithBar', id: 'bar', rodL: [62, 0, z], rodR: [-62, 0, z], mountTo: 'smith', plates: [10] }]; })(),
    contacts: [{ body: 'back', prop: 'bench:back' }, { body: 'buttocks', prop: 'bench:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'bar' }, { body: 'gripR', prop: 'bar' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = SOHP(), q = C.M.clone(L.q), z = L.head[2] - 16.5;
      for (const s of S) {
        const f = C.fk(q), kn = f.P['kn' + s], lat = C.latP(q, s);
        C.foot(q, s, V.add([kn[0], 0, kn[2] - 26], lat, 6), 0, V.unit(V.add([0, 0, -1], lat, .3)), { forward: V.unit(V.add([0, 0, -1], lat, .25)) });
      }
      const chin = L.head[1] - 11.5, yTop = L.gh[1] + 55, y = C.lerp(chin + 1, yTop, e);
      for (const s of S) {
        q[s].girdle = [C.lerp(6, 24, e), C.lerp(4, 10, e)];
        const lat = C.lat(q, s), pole = V.unit(V.add(V.add([0, -1, 0], lat, .8), [0, 0, -1], .3));
        C.grip(q, s, V.add([0, y, z], lat, 32), V.scale(lat, -1), pole, { wristExt: 8 });
      }
      return q;
    }
  },

  /* Тяга эспандера к поясу сидя на полу: лента охватывает подошвы. t=0 — руки впереди, t=1 — кисти у пояса. */
  bandrow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'mat', id: 'mat', len: 180, at: [0, 0, 30] }, { type: 'band', id: 'band', fromSole: true, r: .7 }],
    contacts: [{ body: 'buttocks', prop: 'mat' }, { body: 'footL', prop: 'mat' }, { body: 'footR', prop: 'mat' }, { body: 'gripL', prop: 'band:handleL' }, { body: 'gripR', prop: 'band:handleR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base(), tilt = C.lerp(12, 16, e) * C.D2R;
      C.root(q, [0, 12, 0], [0, Math.cos(tilt), -Math.sin(tilt)], [0, Math.sin(tilt), Math.cos(tilt)]);
      q.lumbar = [C.lerp(20, 10, e), 0, 0]; q.thoracic = [C.lerp(14, 0, e), 0, 0]; q.neck = [C.lerp(-10, 4, e), 0, 0];
      for (const s of S) { q[s].hip = [76, 5, 6]; q[s].knee = 10; }
      C.restOn(q, 'buttocks', [0, 1, 0], [0, 1, 0], -1.2);
      const hz = C.fk(q).P.hipL[2];
      for (const s of S) {
        const f = C.fk(q), hip = f.P['hip' + s], lat = C.latP(q, s);
        C.heel(q, s, V.add([hip[0], 1, hz + 82], lat, 1.5), 0, 72, [0, 1, 0]);
      }
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        q[s].girdle = [0, C.lerp(14, -15, e)];
        const lat = C.lat(q, s), gh = f.P['gh' + s];
        const g0 = V.add(V.add(gh, [0, 0, 1], 57), [0, -1, 0], 14), g1 = V.add(V.add(V.add(T.o, T.x, C.M.SIGN[s] * 17), T.y, -6), T.z, 10);
        const pole = V.unit(V.mix(V.add([0, -1, -.2], lat, .6), V.add([0, -.6, -1], lat, .5), e));
        C.grip(q, s, V.add(V.mix(g0, g1, e), lat, C.lerp(-3, 2, e)), [0, 1, 0], pole);
      }
      return q;
    }
  },

  /* Тяга гантелей лёжа грудью на наклонной скамье (35°): стопы на полу по бокам сиденья.
     t=0 — руки выпрямлены вниз, t=1 — гантели у пояса. */
  chestrowdb: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'adjBench', id: 'bench', back: 40, seat: 0, width: 28, seatPad: false }, { type: 'dumbbell', id: 'dbL', hand: 'L' }, { type: 'dumbbell', id: 'dbR', hand: 'R' }],
    contacts: [{ body: 'front', prop: 'bench:back' }, { body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'dbL' }, { body: 'gripR', prop: 'dbR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V, M } = C, e = C.ease(t), q = C.base(), bp = C.frame('bench', 'backPad'), by = M.M3.col(bp.R, 1), bz = M.M3.col(bp.R, 2);
      /* сиденье снято: таз у шарнира, грудь на подушке, ноги почти прямые назад, упор на носки */
      C.root(q, V.add(bp.o, bz, 4), bz, V.scale(by, -1));
      q.thoracic = [C.lerp(4, -6, e), 0, 0]; q.lumbar = [-2, 0, 0]; q.neck = [-30, 0, 0];
      for (const s of S) { q[s].hip = [12, 9, 6]; q[s].knee = 8; }
      C.restOn(q, 'front', bp.o, by, -1.4);
      const hipAlong = V.dot(V.sub(C.fk(q).P.hipL, bp.o), bz);
      q.root.p = V.add(q.root.p, bz, 2 - hipAlong);
      for (const s of S) {
        const f = C.fk(q), hip = f.P['hip' + s], lat = C.latP(q, s);
        const sup = d => V.add([hip[0], 0, hip[2] - d], lat, 3), heel = 55;
        const d = C.solve1D(d => V.dist(hip, C.M.footFrame(sup(d), 0, { forward: [0, 0, 1], heel }).o) - (M.B.th + M.B.sk - 1.2), 20, 100);
        C.foot(q, s, sup(d), 0, V.unit(V.add([0, -1, 0], lat, .2)), { forward: [0, 0, 1], heel });
      }
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        q[s].girdle = [C.lerp(-2, 4, e), C.lerp(12, -16, e)];
        const lat = C.lat(q, s), gh = f.P['gh' + s];
        const g0 = V.add(V.add(gh, [0, -1, 0], 60), lat, 3), g1 = V.add(V.add(V.add(T.o, T.x, M.SIGN[s] * 28), T.y, 3), T.z, 8);
        const grip = V.add(V.mix(g0, g1, e), T.z, 5 * Math.sin(Math.PI * e));
        const pole = V.unit(V.mix(V.add([0, 0, -1], lat, .5), V.add(V.add([0, 1, 0], [0, 0, -1], .6), lat, .3), e));
        C.hold(q, s, grip, pole, { pron: C.lerp(0, -22, e) });
      }
      return q;
    }
  }
};
