/* Эспандер — общая модель ленты: одна непрерывная лента по опорам, растяжение и сечение по физике латекса.

   Модели (BAND_MODELS) — реальные изделия:
   * tube48 — трубка с рукоятями 48″ (122 см): TheraBand Professional Latex Resistance Tubing with Handles, 48 Inch;
     CanDo Tubing with Handles, 48″; Power Systems Covered Resistance Tube with Handles, 48″. Трубка круглая, ⌀ 1 см;
   * tube36 — трубка с рукоятями 36″ (91 см): CanDo Tubing with Handles Exerciser, 36 Inch (Fabrication Enterprises 10-5551…10-5556);
   * loop41 — длинная петля: Rogue Monster Band, 41″ в сложенном виде (окружность 208 см), лента 1,13″ × 0,18″ (2,9 × 0,46 см, №3);
   * mini12 — мини-петля 12″ × 2″ (30,5 × 5,1 см в сложенном виде, окружность 61 см): Fit Simplify Resistance Loop Exercise
     Bands; толщина изготовителем не указана — принята 1 мм.
   Предел растяжения — TheraBand, «Care & Safety»: «Do not over-stretch the product (more than 3 times its length at rest)».

   Путь (route) — опоры по порядку вдоль ленты:
   * {handle:'L'} — конец ленты у кольца стремени рукояти (E.stirrup) в кисти L (у трубки — оба конца);
   * {sole:'L', at} — лента проходит под подошвой стопы поперёк (стоя на ленте или лента вокруг подошв сидя): огибает
     наружный край стопы (цилиндр вдоль оси стопы, скругление края 1,6 см) и лежит под подошвой до внутреннего края.
     Подошва прижимает ленту весом тела — опора без скольжения (pin);
   * {ring:[x,y,z], door:[x,y,z], mountTo} — лента продета в петлю крепления (кольцо на двери): огибает перекладину
     кольца (⌀ 0,7 см) на стороне двери в плоскости обеих ветвей. В петле лента скользит, и натяжение по обе стороны
     одно (как у трубки, продетой в дверной якорь: изготовители так её и закрепляют — середину трубки через петлю);
   * {clip:[x,y,z], mountTo} — конец ленты пристёгнут карабином (без скольжения);
   * {cuff:'L'} — конец ленты пристёгнут карабином к D-кольцу манжеты на голеностопе (E.ankleCuff — та же манжета, что у
     нижнего блока): Bodylastics «Standing Leg Adduction With Bands» — «Clip both ends of the band to one ankle strap»,
     середина трубки — в креплении у низа двери. Две манжеты одной стороны (route [{cuff:'L'}, …, {cuff:'L'}]) — оба конца
     трубки на одном кольце: карабины рядом (1,2 см вдоль голени);
   * {limb:'sk'|'th', side, at} — петля огибает голень или бедро (для петель; closed: true — путь замкнут).
   Две рукояти одной стороны (route [{handle:'R'}, …, {handle:'R'}]) — оба конца трубки в одной кисти: ветви идут рядом.

   Материал и растяжение. Лента делится опорами без скольжения на куски; в каждом куске натяжение одно (по скользящим
   опорам — тоже), растяжение λ = L/L0. Кусок между двумя опорами без скольжения, к которому не приложена тяга (под
   стопами между подошвами), лежит без растяжения: L0 — его длина. Остаток длины покоя делится между нагруженными
   кусками поровну (на ленту встают серединой). Сечение — по сохранению объёма латекса: площадь A0·L0/L, у круглой
   трубки радиус r0/√λ, у плоской ленты ширина и толщина w0/√λ, h0/√λ.

   Огибание — расчёт путей мышц (Muscles.wrap, порт mju_wrap MuJoCo из 09br-muscles.js): касательные от соседних точек
   к цилиндру опоры и дуга между ними. Детали для рисования: ветвь id:L и id:R — от середины ленты (середина куска
   под стопами или дуги на кольце) к рукояти, у петли — id:loop; число точек каждой детали постоянно (дуга — ARC_N точек,
   при отсутствии огибания — те же точки на прямой), у круглой ленты — радиус по отрезкам (rs) и сферы в изломах
   (joints). Сведения о ленте (длина, растяжение по кускам, опоры) — в поле band деталей, их читает cable-audit. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, M3, toCat, dirCat, FLOOR, SIGN } = M, { BIND } = E;
  /* огибание — из расчёта путей мышц (09br-muscles.js): в приложении он загружен, в node — по require */
  const MU = () => { if (typeof Muscles !== 'undefined') return Muscles; if (typeof require === 'function') return require('./09br-muscles.js'); throw Error('Лента эспандера: нужен 09br-muscles.js (Muscles.wrap)'); };
  const BAND_MODELS = {
    tube48: { shape: 'round', rest: 121.9, r0: .5, max: 3 },
    tube36: { shape: 'round', rest: 91.4, r0: .5, max: 3 },
    loop41: { shape: 'flat', rest: 208.3, w0: 2.87, h0: .46, max: 3, closed: true },
    mini12: { shape: 'flat', rest: 61, w0: 5.1, h0: .1, max: 3, closed: true }
  };
  const ARC_N = 10, EDGE_R = 1.6, BAR_R = .35, UP = [0, -1, 0];
  /* цилиндр огибания: центр c, ось axis, радиус r, сторона side (точка, куда лента огибает) — элемент Muscles.wrap */
  const cyl = (c, axis, r, side) => {
    const z = V.unit(axis), x = V.unit(V.perp(Math.abs(z[1]) < .9 ? [0, 1, 0] : [1, 0, 0], z)), y = V.cross(z, x);
    return { t: 'c', c, m: [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]], r, side };
  };
  /* под подошвой: стопа s, сечение at (см от голеностопа вперёд по оси стопы; 9 — передний край свода, перед головками
     плюсневых костей, ширина 4,45 см наружу и 4,4 внутрь — FOOT_SECTIONS манекена). Возвращает цилиндр наружного края,
     точку у внутреннего края и плоскость подошвы; стоя на полу лента лежит на полу (центр — на r над ним) */
  function soleOf(R, s, at, r) {
    const F = R.frames['foot' + s], g = SIGN[s], P = p => V.add(V.add(V.add(F.o, F.x, p[0]), F.y, p[1]), F.z, p[2]);
    const lat = V.scale(F.x, g), n = V.scale(F.y, -1), bottom = -7;
    let c = P([g * (4.45 - EDGE_R), bottom + EDGE_R, at]), med = P([-g * (4.4 - .5), bottom - r, at]);
    const low = Math.max(...[V.add(c, n, EDGE_R + r), med].map(p => p[1])), lift = low - (FLOOR - r);
    if (lift > 0) { c = V.add(c, UP, lift); med = V.add(med, UP, lift); }
    return { c, r: EDGE_R + r, axis: F.z, side: V.add(V.add(c, lat, 3), n, 3), med, lat, n, foot: F };
  }
  /* петля вокруг сегмента ноги: окружность, охватывающая сечение (24 точки кожи; центр — их середина, радиус — до самой
     дальней). Прежде радиус был средним по четырём сторонам: сечение голени не круглое, и петля заходила в кожу на 0,8 см */
  function limbOf(R, kind, s, at) {
    const pts = Array.from({ length: 24 }, (_, k) => M.limbPoint(R, kind, s, at, k * Math.PI / 12)), c = V.scale(pts.reduce((a, p) => V.add(a, p), [0, 0, 0]), 1 / 24);
    return { c, r: Math.max(...pts.map(p => V.dist(p, c))), axis: M.limbAxes(R, kind, s, at).axis };
  }
  /* ремень вокруг окружностей в одной плоскости (замкнутая петля): внешние касательные и дуги */
  function belt(circles, axis, rb) {
    const z = V.unit(axis), x = V.unit(V.perp(Math.abs(z[1]) < .9 ? [0, 1, 0] : [1, 0, 0], z)), y = V.cross(z, x);
    const o = V.scale(circles.reduce((a, c) => V.add(a, c.c), [0, 0, 0]), 1 / circles.length);
    const to2 = p => [V.dot(V.sub(p, o), x), V.dot(V.sub(p, o), y)], to3 = ([u, v]) => V.add(V.add(o, x, u), y, v);
    const C = circles.map(c => ({ p: to2(c.c), r: c.r + rb })), out = [];
    if (C.length === 1) { for (let k = 0; k < 4 * ARC_N; k++) { const a = k / (4 * ARC_N) * 2 * Math.PI; out.push(to3([C[0].p[0] + C[0].r * Math.cos(a), C[0].p[1] + C[0].r * Math.sin(a)])); } }
    else {
      /* две окружности: внешние касательные (при близких радиусах), дуги снаружи */
      const [A, B] = C, d = [B.p[0] - A.p[0], B.p[1] - A.p[1]], L = Math.hypot(...d), ang = Math.atan2(d[1], d[0]), phi = Math.acos(Math.max(-1, Math.min(1, (A.r - B.r) / L)));
      const arc = (Q, a0, a1) => { for (let k = 0; k <= 2 * ARC_N; k++) { const a = a0 + (a1 - a0) * k / (2 * ARC_N); out.push(to3([Q.p[0] + Q.r * Math.cos(a), Q.p[1] + Q.r * Math.sin(a)])); } };
      arc(B, ang - phi, ang + phi); arc(A, ang + phi, ang + 2 * Math.PI - phi);
    }
    out.push(out[0]);
    return out;
  }
  /* огибание между точками a и b: точки дуги (ARC_N, без a и b); без огибания — те же точки на прямой a→b */
  function around(a, b, w) {
    const s = MU().wrap(a, b, w), out = [];
    if (!s) { for (let k = 1; k <= ARC_N; k++) out.push(V.mix(a, b, k / (ARC_N + 1))); return { pts: out, a: out[0], b: out[ARC_N - 1], wrapped: false }; }
    const arc = s.arc(ARC_N - 1);
    out.push(s.a, ...arc, s.b);
    return { pts: out, a: s.a, b: s.b, wrapped: true };
  }
  const polyLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += V.dist(pts[i - 1], pts[i]); return L; };
  /* ---------- лента: путь, куски, растяжение, детали ---------- */
  function bandPath(e, R) {
    const model = { ...BAND_MODELS[e.model || 'tube48'], ...(e.rest ? { rest: e.rest } : {}) }, id = e.id || 'band';
    const route = e.route || legacyRoute(e), closed = !!(e.closed ?? model.closed);
    const r0 = model.shape === 'round' ? model.r0 : model.h0 / 2;
    if (closed) return loopPath(e, R, model, route, id);
    /* 1. опоры: точки и цилиндры (радиус огибания — с радиусом ленты в покое; уточняется ниже не нужно — разница < 0,2 см) */
    const nodes = route.map(n => {
      if (n.handle) return { kind: 'handle', s: n.handle };
      if (n.cuff) return { kind: 'cuff', s: n.cuff, pin: true };
      if (n.sole) return { kind: 'sole', s: n.sole, ...soleOf(R, n.sole, n.at ?? 9, r0), pin: true };
      if (n.ring) {
        /* door — направление к двери (перекладина кольца — на дальней от кистей стороне); без него — от середины кистей */
        const c0 = toCat(n.ring), hs = route.filter(m => m.handle).map(m => R['grip' + m.handle]);
        const toward = V.unit(n.door ? dirCat(n.door) : V.sub(c0, V.scale(hs.reduce((a, p) => V.add(a, p), [0, 0, 0]), 1 / hs.length)));
        return { kind: 'ring', c: V.add(c0, toward, n.inset ?? 0), toward, mount: n.mountTo, pin: false };
      }
      if (n.clip) return { kind: 'clip', p: toCat(n.clip), mount: n.mountTo, pin: true };
      throw Error('band: unknown route node ' + JSON.stringify(n));
    });
    const near = i => { const n = nodes[i]; return n.kind === 'sole' ? n.c : n.kind === 'ring' ? n.c : n.kind === 'clip' ? n.p : null; };
    /* 2. рукояти: кольцо стремени смотрит на соседнюю опору; две рукояти в одной кисти — ветви рядом (±0,6 см по рукояти) */
    const sameHand = nodes[0].kind === 'handle' && nodes.at(-1).kind === 'handle' && nodes[0].s === nodes.at(-1).s;
    const sameCuff = nodes[0].kind === 'cuff' && nodes.at(-1).kind === 'cuff' && nodes[0].s === nodes.at(-1).s;
    const handles = [], cuffs = [];
    nodes.forEach((n, i) => {
      if (n.kind !== 'handle') return;
      const to = near(i === 0 ? 1 : i - 1), st = E.stirrup(R['grip' + n.s], R.frames['hand' + n.s].z, to, { ...E.BAND_HANDLE, clear: E.clearOfForearm(R, n.s) });
      n.st = st; n.apex = st.apex;
      if (sameHand && i > 0) n.apex = V.add(st.apex, V.unit(R.frames['hand' + n.s].z), 1.2);
      if (!(sameHand && i > 0)) handles.push(n);
    });
    /* манжеты: карабин от D-кольца к соседней опоре (ankleCuff), конец ленты — на конце карабина */
    nodes.forEach((n, i) => {
      if (n.kind !== 'cuff') return;
      const K = E.ankleCuff(R, n.s, near(i === 0 ? 1 : i - 1));
      n.K = K; n.apex = sameCuff && i > 0 ? V.add(K.clip, V.unit(K.axis), 1.2) : K.clip;
      cuffs.push(n);
    });
    /* 3. путь по опорам: точки и куски (k — номер куска; граница куска — опора без скольжения) */
    const pts = [], piece = [], pins = [];
    let k = 0, midIdx = -1;
    const push = (p, kk = k) => { pts.push(p); piece.push(kk); };
    const first = nodes[0];
    push(first.apex ?? first.p);
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i], prev = pts[pts.length - 1];
      if (n.kind === 'handle' || n.kind === 'clip' || n.kind === 'cuff') { push(n.apex ?? n.p); continue; }
      if (n.kind === 'sole') {
        const fromHandle = nodes[i - 1].kind === 'handle' || nodes[i - 1].kind === 'clip' || nodes[i - 1].kind === 'cuff';
        if (fromHandle) {
          /* с ветви на подошву: огибание наружного края, затем под подошвой к внутреннему краю — дальше кусок без тяги */
          const w = around(prev, n.med, cyl(n.c, n.axis, n.r, n.side));
          for (const p of w.pts) push(p);
          pins.push({ s: n.s, foot: n.foot, at: w.b, med: n.med, lat: n.lat }); k++;
          push(n.med);
        } else {
          /* с куска под стопами на подошву и к ветви: у внутреннего края, огибание наружного края к следующей рукояти */
          const nextP = nodes[i + 1]?.apex ?? nodes[i + 1]?.p;
          /* середина куска под стопами — граница деталей id:L и id:R */
          midIdx = pts.length; push(V.mix(prev, n.med, .5));
          push(n.med);
          const w = around(n.med, nextP, cyl(n.c, n.axis, n.r, n.side));
          push(w.pts[0]);
          pins.push({ s: n.s, foot: n.foot, at: w.a, med: n.med, lat: n.lat }); k++;
          for (const p of w.pts.slice(1)) push(p);
        }
        continue;
      }
      if (n.kind === 'ring') {
        /* перекладина кольца на стороне двери: ось — по нормали плоскости обеих ветвей */
        const nextP = nodes[i + 1].apex ?? nodes[i + 1].p;
        let axis = V.cross(V.sub(prev, n.c), V.sub(nextP, n.c));
        if (V.len(axis) < 1e-6) axis = V.cross(V.sub(prev, n.c), UP);
        const w = around(prev, nextP, cyl(n.c, axis, BAR_R + r0, V.add(n.c, n.toward, 5)));
        n.mid = w.pts[Math.floor(w.pts.length / 2)];
        for (const p of w.pts) push(p);
      }
    }
    /* 4. длины кусков; L0: кусок без тяги (между опорами без скольжения) лежит без растяжения, остаток — поровну */
    const nPieces = k + 1, L = Array(nPieces).fill(0);
    for (let j = 1; j < pts.length; j++) L[piece[j]] += V.dist(pts[j - 1], pts[j]);
    const loaded = L.map((_, kk) => kk === 0 || kk === nPieces - 1 || nodes.filter(n => n.pin).length < 2);
    const restFree = model.rest - L.reduce((a, x, kk) => a + (loaded[kk] ? 0 : x), 0), nl = loaded.filter(Boolean).length;
    const L0 = L.map((x, kk) => loaded[kk] ? restFree / nl : x), lam = L.map((x, kk) => x / L0[kk]);
    const pieces = L.map((x, kk) => ({ L: x, L0: L0[kk], lam: lam[kk], loaded: loaded[kk] }));
    /* сечение по кускам */
    const sec = kk => model.shape === 'round' ? { r: model.r0 / Math.sqrt(Math.max(1, lam[kk])) } : { w: model.w0 / Math.sqrt(Math.max(1, lam[kk])), h: model.h0 / Math.sqrt(Math.max(1, lam[kk])) };
    /* 5. детали: две ветви от середины к рукоятям (у трубки) */
    const total = polyLen(pts), info = { id, model: e.model || 'tube48', shape: model.shape, rest: model.rest, max: model.max, L: total, pieces, pins,
      slide: nodes.some(n => n.kind === 'ring'), hands: handles.map(h => h.s), sameHand, cuffs: [...new Set(cuffs.map(c => c.s))] };
    const ring = nodes.find(n => n.kind === 'ring');
    const mid = ring ? pts.indexOf(ring.mid) : midIdx >= 0 ? midIdx : Math.floor(pts.length / 2);
    const parts = [], branch = (a, b, side) => {
      const P = pts.slice(a, b + 1), K = piece.slice(a, b + 1), rs = P.slice(1).map((_, j) => sec(K[j + 1]).r ?? sec(K[j + 1]).h / 2);
      return { pts: P, rs, r: Math.max(...rs), side };
    };
    const A = branch(0, mid, first.s), B = branch(mid, pts.length - 1, nodes.at(-1).s);
    A.pts.reverse(); A.rs.reverse();
    const sideName = (b, i) => sameHand || sameCuff ? (i ? b.side + '2' : b.side) : b.side;
    for (const [b, i] of [[A, 0], [B, 1]]) {
      const pid = id + ':' + sideName(b, i), mount = ring ? ring.mount : pins.length ? 'body' : (nodes.find(n => n.kind === 'clip')?.mount || 'body');
      parts.push({ kind: 'cable', pts: b.pts, r: b.r, rs: b.rs, joints: true, tone: 'band', role: 'cable', id: pid, mount, band: info });
    }
    /* рукояти: стремя и рукоять (две рукояти в одной кисти — рисуется одна, обе ветви приходят к её кольцу) */
    for (const h of handles) parts.push(...E.bandHandle(h.st, id, h.s));
    /* манжета: неопреновая лента вокруг голени, D-кольцо и карабины (E.cuffParts — как у нижнего блока) */
    if (cuffs.length) {
      /* одна манжета на сторону: оба конца трубки — на её кольце (карабины snap и snap2), карабин крепится к своей ветви */
      for (const s of new Set(cuffs.map(c => c.s))) {
        const cs = cuffs.filter(c => c.s === s);
        parts.push(...E.cuffParts(R, s, cs[0].K, cs.map(c => c.apex), id + ':' + s, k => parts.find(p => p.role === 'cable' && p.pts[p.pts.length - 1] === cs[k].apex)?.id || id + ':' + s));
      }
    }
    return { parts, info, pts, piece };
  }
  /* замкнутая петля: вокруг сегментов ног (две окружности — общий ремень) */
  function loopPath(e, R, model, route, id) {
    const cs = route.map(n => limbOf(R, n.limb, n.side, n.at ?? .5)), axis = V.unit(cs.reduce((a, c) => V.add(a, c.axis), [0, 0, 0]));
    const r0 = model.h0 / 2, pts0 = belt(cs, axis, r0), L = polyLen(pts0), lam = L / model.rest, k = 1 / Math.sqrt(Math.max(1, lam));
    const info = { id, model: e.model, shape: model.shape, rest: model.rest, max: model.max, L, pieces: [{ L, L0: model.rest, lam, loaded: true }], pins: [], slide: true, closed: true, hands: [] };
    const nrm = pts0.slice(1).map((p, j) => { const c = cs.reduce((a, q) => V.dist(V.mix(pts0[j], p, .5), q.c) < V.dist(V.mix(pts0[j], p, .5), a.c) ? q : a); return V.unit(V.perp(V.sub(V.mix(pts0[j], p, .5), c.c), axis)); });
    const part = { kind: 'cable', pts: pts0, r: model.w0 * k / 2, flat: [model.w0 * k, model.h0 * k], nrm, joints: true, tone: 'band', role: 'strap', id: id + ':loop', mount: 'body', band: info };
    return { parts: [part], info, pts: pts0, piece: pts0.map(() => 0) };
  }
  /* прежние записи: fromSole — стоя на ленте (или лента вокруг подошв сидя); from — точка крепления (кольцо двери) */
  function legacyRoute(e) {
    const hands = e.hands || ['L', 'R'];
    if (e.fromSole) return [{ handle: 'L' }, { sole: 'L' }, { sole: 'R' }, { handle: 'R' }];
    if (e.from) return hands.length > 1 ? [{ handle: hands[0] }, { ring: e.from, mountTo: e.mountTo }, { handle: hands[1] }] : [{ handle: hands[0] }, { ring: e.from, mountTo: e.mountTo }, { handle: hands[0] }];
    throw Error('band: route is required');
  }
  BIND.band = (e, R) => bandPath(e, R).parts;
  E.band = { MODELS: BAND_MODELS, path: bandPath, soleOf, belt, ARC_N };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
