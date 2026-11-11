/* Инвентарь группы G2 (гантели и гири).
   g2Step — степ-платформа для подъёмов на носки: 90x35 см, высота 15 см, резиновое покрытие, две опоры.
   g2CupDumbbell — гантель, которую держат двумя ладонями под верхним диском (гоблет, разгибание из-за головы,
   пуловер). Кисти «чашей» ('cup'): диск — там, где его задаёт Mannequin.cupDisk в рамке каждой кисти (ладони по бокам
   диска, нижнее ребро — на основании ладони). Иначе (прежний хват) ось — по нормали ладоней, грань лежит на ладонях.
   g2KbHorns — гиря двумя руками «за рога» (гоблет): хваты на дужках рукояти, шар под рукоятью; bottomUp — дном вверх
   («гало»): шар над кистями. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V } = M, { TYPES, BIND } = E;
  /* Степ-платформа: верх на высоте height, длина len по X, глубина depth по Z */
  TYPES.g2Step = (s, b) => {
    const H = s.height || 15, L = s.len || 90, D = s.depth || 35;
    b.box('top', [0, H - .6, 0], [L - 2, 1.2, D - 2], { role: 'support', tone: 'rubber', mount: 'deck', round: .5, contact: 'top' });
    b.box('deck', [0, H - 3.2, 0], [L, 4, D], { mount: 'riserL', round: 1 });
    for (const sx of [-1, 1]) b.box('riser' + (sx > 0 ? 'L' : 'R'), [sx * (L / 2 - 9), (H - 5.2) / 2, 0], [16, H - 5.2, D - 3], { mount: 'floor', round: .8 });
    b.anchor('top', [0, H, 0]); b.anchor('edgeB', [0, H, -D / 2]); b.anchor('edgeF', [0, H, D / 2]);
  };
  /* Гантель в ладонях: ладони (hands) под внутренней гранью верхнего диска.
     axis: 'palms' — по средней нормали ладоней (по умолчанию), 'gravity' — вертикально. */
  BIND.g2CupDumbbell = (e, R) => {
    const hs = e.hands || ['L', 'R'], id = e.id || 'cup';
    const H = e.handle || 13.5, hr = e.headR || 7.5, hl = e.headLen || 7;
    let n, face;
    const cupMode = R.hands?.[hs[0]];
    if ((cupMode === 'cup' || cupMode === 'cupring') && hs.every(s => R.hands?.[s] === cupMode)) {
      /* хват «чашей» (кисть 'cup', Mannequin.cupDisk): у каждой ладони диск — в одном и том же месте её рамки; гантель —
         среднее по ладоням (между ключами позы кисти чуть расходятся) */
      const at = hs.map(s => M.cupIn(R.frames['hand' + s], s, cupMode));
      n = V.unit(at.reduce((a, q) => V.add(a, q.n), [0, 0, 0]));
      face = V.scale(at.reduce((a, q) => V.add(a, q.c), [0, 0, 0]), 1 / at.length);
    } else {
      const pal = hs.map(s => { const f = R.frames['hand' + s], g = s === 'L' ? 1 : -1; return { p: V.add(V.add(f.o, f.x, -g * 1.8), f.y, -5.6), n: V.scale(f.x, -g) }; });
      n = V.unit(pal.reduce((a, q) => V.add(a, q.n), [0, 0, 0]));
      if (e.axis === 'gravity') n = [0, -1, 0];
      const P0 = V.scale(pal.reduce((a, q) => V.add(a, q.p), [0, 0, 0]), 1 / pal.length);
      const lift = Math.max(...pal.map(q => V.dot(V.sub(q.p, P0), n)));
      face = V.add(P0, n, lift + (e.gap ?? .15));
    }
    const c = V.add(face, n, -(H / 2 + 1.2));
    const at = k => V.add(c, n, k);
    return [
      { kind: 'cyl', c: at(H / 2 + 1.2 + hl / 2), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':top', mount: 'hands' },
      { kind: 'cyl', c: at(H / 2 + .6), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarT', mount: id + ':top' },
      { kind: 'beam', a: at(-(H / 2 + .6)), b: at(H / 2 + .6), r: 1.6, tone: 'chrome', role: 'grip', id: id + ':handle', mount: id + ':collarT' },
      { kind: 'cyl', c: at(-(H / 2 + .6)), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarB', mount: id + ':handle' },
      { kind: 'cyl', c: at(-(H / 2 + 1.2 + hl / 2)), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':bottom', mount: id + ':collarB' }
    ];
  };
  /* Изогнутый рог гири: точка хвата u — 0: прямая часть рога над шаром (центр кулака в 8,6 см от оси гири и 10,5 над центром
     шара, как прежде), 1 — за изгибом, у перекладины (кулак в 6,5 см от оси, ось кулака почти поперёк оси гири). Ряды — по
     осевой линии рукояти той же кривой, что у сетки (src/volume/props.mjs: CatmullRom по 8 точкам, центростремительная):
     [u, x, y, ось от хвата к шару (x, y)] в плоскости рукояти (x — от оси гири к своему рогу, y — от центра шара к рукояти;
     r = 10,5 см); ось — хорда кривой на ширине кулака (±3,5 см). Хват меняется по ходу «гало»: спереди — прямая часть
     рога, за головой гиря висит шаром вниз, предплечья — вдоль оси гири, и кулаки держат рог у перекладины. */
  const HORN = [[0, 8.6, 10.5, -.132, -.991], [.2, 8.97, 12.4, -.165, -.986], [.4, 9.2, 14.38, .031, -1], [.6, 9.05, 16.27, .39, -.921], [.8, 8.14, 17.89, .741, -.672], [1, 6.46, 18.47, .929, -.369]];
  E.kbHorn = u => {
    const v = Math.max(0, Math.min(1, u || 0)) * (HORN.length - 1), i = Math.min(HORN.length - 2, Math.floor(v)), w = v - i, A = HORN[i], B = HORN[i + 1];
    const m = j => A[j] + (B[j] - A[j]) * w, l = Math.hypot(m(3), m(4));
    return { x: m(1), y: m(2), ax: [m(3) / l, m(4) / l] };
  };
  /* Гиря «за рога» двумя руками (гоблет): дужки рукояти — в кулаках. Ось «вверх» гири — средняя линия больших пальцев,
     центры хватов — на дужках (±8,65 см от оси, 10,5 см над центром шара при Ø21), шар ниже рукояти; размеры гири —
     E.KB (09bn-equipment.js).
     Дужки — короткие участки рукояти (role grip): на них проверяется хват. Дном вверх у рогов — ещё изгиб к перекладине
     (три отрезка по осевой линии); R.horn {L, R} — точка хвата каждой руки на роге (E.kbHorn): гиря ставится так, чтобы оба
     кулака были на своих точках рогов (без R.horn — прежнее положение, u = 0 у обеих рук). */
  BIND.g2KbHorns = (e, R) => {
    const id = e.id || 'kb', k = (e.r || 10.5) / 10.5, gL = R.gripL, gR = R.gripR;
    /* up — от шара к рукояти: по большим пальцам (хват за рога сверху: пальцы смотрят на рукоять); дном вверх (bottomUp,
       «гало») большие пальцы смотрят на шар — шар над кистями */
    const th = V.add(R.frames.handL.z, R.frames.handR.z);
    let ax, up, c;
    if (R.horn) {
      /* кулаки на точках рогов hL, hR: линия хватов наклонена к оси рукояти на α (разные точки хвата у рук) */
      const hL = E.kbHorn(R.horn.L), hR = E.kbHorn(R.horn.R), e1 = V.unit(V.sub(gL, gR));
      const e2 = V.scale(V.unit(V.perp(V.len(V.perp(th, e1)) > .2 ? th : [0, -1, 0], e1)), e.bottomUp ? -1 : 1), a = Math.atan2(hL.y - hR.y, hL.x + hR.x);
      ax = V.add(V.scale(e1, Math.cos(a)), e2, -Math.sin(a)); up = V.add(V.scale(e1, Math.sin(a)), e2, Math.cos(a));
      c = V.mix(V.add(V.add(gL, ax, -hL.x * k), up, -hL.y * k), V.add(V.add(gR, ax, hR.x * k), up, -hR.y * k), .5);
    } else {
      ax = V.unit(V.sub(gL, gR)); up = V.scale(V.unit(V.perp(V.len(V.perp(th, ax)) > .2 ? th : [0, -1, 0], ax)), e.bottomUp ? -1 : 1);
      c = V.add(V.mix(gL, gR, .5), up, -10.5 * k);
    }
    const L = (a, u) => V.add(V.add(c, ax, a * k), up, u * k), S = sg => sg > 0 ? 'L' : 'R';
    const horn = sg => ({ kind: 'beam', a: L(sg * 8.1, 6.9), b: L(sg * 9.1, 14.4), r: 1.7, tone: 'plate', role: 'grip', id: id + ':horn' + S(sg), mount: id });
    /* изгиб рога к перекладине — по осевой линии рукояти (точки кривой сетки на дуге 11,7; 9,2; 7,3 и 3,9 см от середины перекладины) */
    const bend = sg => [[9.2, 14.49], [8.86, 16.9], [7.48, 18.23], [4.19, 18.76]].slice(1).map((p, i, A) => {
      const a0 = i ? A[i - 1] : [9.2, 14.49], pid = id + ':horn' + S(sg);
      return { kind: 'beam', a: L(sg * a0[0], a0[1]), b: L(sg * p[0], p[1]), r: 1.7, tone: 'plate', role: 'grip', id: pid + ':' + (i + 2), mount: i ? pid + ':' + (i + 1) : pid };
    });
    return [{ kind: 'kettlebell', c, grip: L(0, E.KB.handle), axis: ax, handleAxis: ax, radius: 10.5 * k, handleUp: E.KB.handle * k, bottom: E.KB.bottom * k, role: 'free', tone: 'plate', free: true, id, mount: 'hands' },
      horn(1), horn(-1), ...(e.bottomUp ? [...bend(1), ...bend(-1)] : [])];
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
