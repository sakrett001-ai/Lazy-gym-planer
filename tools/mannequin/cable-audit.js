'use strict';
/* Аудит тросов, блоков и эспандеров: как трос и лента идут от блока (крепления) к рукояти во всех упражнениях с тросом,
   блоком и лентой, по кадрам повторения. Печатает подозрительное, ничего не исправляет.
   node tools/mannequin/cable-audit.js [--only id,id] [--samples 41] [--json file] [--all] [--baked] [--frames]
   --all — все упражнения (по умолчанию — только с замечаниями), --baked — ключи из src/js/09bp-poses.js, а не из
   спецификаций, --frames — покадровая таблица (угол троса, высота кисти, подъём стека).

   Трос на блоке (BIND.g3cable), по кадрам:
   * угол троса к полу (+ — от колеса вверх к рукояти) и к линии тяги (направлению хода рукояти или голеностопа:
     0° — трос вдоль хода, 90° — поперёк);
   * высота кисти (середины хвата) или голеностопа над осью блока;
   * путь рукояти: у упражнений, где по технике рукоять идёт вдоль троса (тяги, тяга к лицу, протяжка, разгибания),
     — отклонение от прямой «рукоять → блок» в конце тяги и поворот троса за повтор; у дуговых (разводки, подъёмы,
     сгибания) — выход троса из плоскости движения (плоскость пути рукояти по методу главных компонент);
   * подъём стека: (расстояние рукоять — колесо − rest) × ratio. В растяжке (трос короче всего) плиты висят на 0,5–3 см
     над остальными: трос натянут, плиты не стучат; посреди повтора подъём не уходит в 0 (плиты не ложатся) и не
     упирается в maxLift;
   * передаточное отношение и проводка: при 2:1 (ratio 0,5) на верхней плите стека нарисован подвижный блок, при 1:1 —
     нет; трос от блока доходит до стека (цепочка тросов от колеса или оси поворота блока через колёса тренажёра
     к тросу верхней плиты).
   Рычажный стек (BIND.g4camCable, 09bo-g4-lever.js) — строки «кулачок», см. auditLever: длина троса, касание кулачка
   и колёс, кулачок вместе с рычагом, подъём стека против k·∫p dφ, трос против рамы, момент против кривой силы.
   Эспандер (BIND.band, BIND.g3band), по кадрам и по каждой ветви: длина ветви, угол ленты к полу и к линии тяги,
   высота кисти над точкой, откуда лента идёт к кисти; длина в растяжке — наименьшая за повтор (лента не сжимается
   посреди повтора), растяжение max/min не больше 3 (паспортный предел латексных лент), путь кисти вдоль ленты —
   как у троса. */
const fs = require('node:fs');
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const { V, M3 } = M;
const fromCat = p => [p[0], M.FLOOR - p[1], p[2]], dirFromCat = d => [d[0], -d[1], d[2]];

/* ход рукояти по технике: line — вдоль троса (к блоку и от блока), arc — по дуге (трос в плоскости движения),
   hold — кисти неподвижны относительно головы (движется корпус) */
const KIND = {
  latpull: 'line', latpullv: 'line', latpulluh: 'line', cablerow: 'line', cablerowwide: 'line', facepull: 'line', pullthrough: 'line',
  pushdown: 'arc', ropepushdown: 'arc', straightpull: 'arc', cableohext: 'arc', cablecurl: 'arc', ropecurl: 'arc',
  cablefly: 'arc', cablelowfly: 'arc', cablelat: 'arc', cablewood: 'arc', cablecrunch: 'hold',
  glutekick: 'arc', cablekickback: 'arc', cableadduct: 'arc', cableextrot: 'arc',
  bandlatraise: 'arc', bandcurl: 'arc', bandpushdown: 'arc', bandfacepull: 'line', bandextrot: 'arc', bandrow: 'line'
};
/* пороги «подозрительно» (повод посмотреть глазами) */
const LIM = {
  hoverMin: .5, hoverMax: 3,  // см: подъём стека в растяжке
  lineDev: 3,                 // см: путь рукояти дальше от прямой «рукоять → блок»
  lineSwing: 15,              // °: трос поворачивается за повтор (рукоять идёт не вдоль троса). У прямого хода остаётся
                              //    поворот у самого блока: карабин в 11–13 см от кисти к центру колеса, трос сходит
                              //    по касательной — asin(r/d), до 12° в растяжке тяги сидя (cablerow, d = 22 см)
  lineMove: 15,               // °: трос под углом к ходу рукояти
  moving: .5,                 // доля наибольшей скорости: углы к ходу — в кадрах быстрее (у краёв повтора ход мал,
                              //    а между ключами позы кисть идёт по дуге интерполяции углов)
  arcPlane: 20,               // °: трос выходит из плоскости движения
  bandShrink: 1,              // см: ветвь ленты короче, чем в растяжке
  bandStretch: 3,             // раз: растяжение ленты max/min — TheraBand (Performance Health), инструкция к лентам: «не
                              //    растягивать больше чем в 3 раза от длины в покое»; в растяжке лента не короче длины покоя
  wristDev: 12,               // °: локтевое или лучевое отклонение запястья на рукояти (у тяги сидя после правки — 3–6°)
  join: 2                     // см: концы тросов в цепочке
};
const deg = r => r * 180 / Math.PI;
const angleLine = (a, b) => { const x = deg(Math.acos(Math.max(-1, Math.min(1, Math.abs(V.dot(V.unit(a), V.unit(b))))))); return x; };
const elev = d => deg(Math.asin(Math.max(-1, Math.min(1, V.unit(d)[1]))));
/* главные оси облака точек: [ось наибольшего разброса, …, нормаль плоскости] (степенной метод по ковариации) */
function pca(pts) {
  const c = pts.reduce((a, p) => V.add(a, p), [0, 0, 0]).map(v => v / pts.length), C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of pts) { const d = V.sub(p, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j]; }
  const mul = (A, v) => A.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]), axes = [];
  let A = C.map(r => [...r]);
  for (let k = 0; k < 2; k++) {
    let v = V.unit([1, .7 + k, .3 - k]);
    for (let i = 0; i < 80; i++) { const w = mul(A, v); if (V.len(w) < 1e-12) break; v = V.unit(w); }
    const l = V.dot(v, mul(A, v)); axes.push(v);
    A = A.map((r, i) => r.map((x, j) => x - l * v[i] * v[j]));
  }
  axes.push(V.unit(V.cross(axes[0], axes[1])));
  return { c, axes };
}
const lineDist = (p, a, u) => V.len(V.perp(V.sub(p, a), u));
/* цепочка тросов: от колеса блока (или оси поворота) через колёса тренажёра к тросу верхней плиты стека; тросы — ломаные
   (BIND: g3line, трос стека) и неподвижные отрезки рамы (тонкие брусья с ролью cable: путь внутри колонны, cableRun) */
function routeOf(props, e, P, S) {
  const id = e.id, cables = props.filter(p => p.role === 'cable' && (p.kind === 'cable' || (p.kind === 'beam' && p.r)) && p.id !== id + ':line' && !/:(L|R)$/.test(p.id))
    .map(p => ({ id: p.id, pts: (p.pts || [p.a, p.b]).map(fromCat) }));
  const wheels = props.filter(p => p.kind === 'cyl' && /wheel/i.test(p.id)).map(p => ({ id: p.id, c: fromCat(p.c), r: p.r }));
  const ends = c => [c.pts[0], c.pts[c.pts.length - 1]];
  const onRim = (p, w) => Math.abs(V.dist(p, w.c) - w.r) < LIM.join + .5 && V.dist(p, w.c) < w.r + LIM.join + .5;
  const joined = (a, b) => ends(a).some(p => ends(b).some(q => V.dist(p, q) < LIM.join || wheels.some(w => onRim(p, w) && onRim(q, w))));
  const start = cables.filter(c => ends(c).some(p => V.dist(p, S) < LIM.join + .5 || Math.abs(V.dist(p, P) - (e.wheelR || 4.5)) < LIM.join));
  const seen = new Set(start.map(c => c.id)), queue = [...start];
  while (queue.length) { const a = queue.shift(); for (const b of cables) if (!seen.has(b.id) && joined(a, b)) { seen.add(b.id); queue.push(b); } }
  const stk = id + ':stkCable';
  return { ok: seen.has(stk), chain: [...seen], hasStack: cables.some(c => c.id === stk) };
}

/* ---------- рычаг → привод → блоки → стек (BIND.g4camCable, 09bo-g4-lever.js) ----------
   Всё меряется по нарисованным деталям кадра, а не по расчёту узла: трос каждого привода (id:cable), трос стека (id:stkCable),
   неподвижный хвост (tail.id), кулачок (id:cam — рамка c, u, v), подвижный блок (id:block), деталь рычага или каретки, с которой
   ходит привод (arm, armU0 у параллелограмма, carL у каретки), колёса блоков (route), верхняя плита (id:stkTop). Профиль кулачка
   (дуги по оси троса) переводится в кадр по рамке нарисованного кулачка.
   Плечо: у кулачка и точки — от оси рычага до прямой троса; у подвижного блока — |Σ (T − P) × û| по двум ветвям (û — куда
   тянет ветвь); у каретки — доля хода каретки вдоль троса (|û · направляющая|). Подъём верхней плиты сверяется с
   k·Σ∫p dφ (рычаг, φ — угол нарисованного плеча) или k·Σ∫p ds (каретка, s — ход нарисованной каретки). Детали, в которых
   трос закреплён неподвижным концом (anchorParts: проушины), и колёса хвоста (tail.wheels) в проверку зазора не входят. */
const LEVER_LIM = {
  length: .2,     // см: длина троса (путь + трос стека) за повтор постоянна
  tangentCos: 1e-3, // |cos| угла между свободным отрезком и радиусом колеса в точке касания
  onRim: .02,     // см: точка касания на ободе колеса (по оси троса) и на профиле кулачка
  side: .02,      // см: профиль кулачка по одну сторону от прямой схода троса
  rigid: .01,     // °: кулачок поворачивается вместе с рычагом; см: точка крепления и подвижный блок — вместе с рычагом или кареткой
  lift: .2,       // см: подъём верхней плиты против k·∫p dφ
  hover: [.9, 1.1], // см: в начале повтора плиты висят на 1 см
  clear: .05      // см: ось троса не ближе r − 0,05 к раме, телу кулачка, щекам, кронштейнам (кроме колёс и кулачка, по которым идёт)
};
const polyLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += V.dist(pts[i - 1], pts[i]); return L; };
/* деталь, с которой ходит привод: рычаг (arm), параллелограмм (armU0), каретка (carL) */
const ARM = { g4lever: 'arm', g4link: 'armU0', g4sled: 'carL' };
function leverOf(eqs, d) {
  return eqs.find(q => q.id === d.lever) || eqs.find(q => ARM[q.type] && (d.mountTo || '').startsWith(q.id + ':'));
}
function auditLever(id, entry, { samples = 41 } = {}) {
  const ev = EQ.variantEntry(entry), rig = EQ.rig(ev), eqs = ev.equipment || [], V2 = require('../biomech/validator2.js'), CURVES = require('./strength-curves.js');
  const rows = [];
  for (const e of eqs.filter(q => q.type === 'g4camCable')) {
    const drives = EQ.leverStack.drivesOf(e).map(d => ({ d, id: d.id || e.id, kind: d.kind || 'cam', lever: leverOf(eqs, d), A: V.unit(d.axis || [1, 0, 0]) }));
    const k = e.ratio ?? 1, st = e.stack, Y = M3.col(st.R, 1), tail = e.tail || null, fr = [];
    const camDrive = drives.find(q => q.kind === 'cam' && e.curve);
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1), R = rig(t), props = R.props, get = s => props.find(p => p.id === s);
      const a = camDrive ? CURVES.angleOf(CURVES[e.curve], R) : null;
      const drop = get(e.id + ':stkCable').pts.map(fromCat), tl = tail ? get(tail.id).pts.map(fromCat) : null;
      let tan = 0, rim = 0, onProf = 0, side = 0, wheelOff = 0, L = polyLen(drop);
      const dv = drives.map((q, j) => {
        const { d, A } = q, P = d.pivot, cable = get(q.id + ':cable').pts.map(fromCat);
        L += polyLen(cable);
        const onWheel = (p, w) => Math.abs(V.dist(V.sub(p, V.scale(A, V.dot(V.sub(p, w.c), A))), w.c) - w.r);
        const arm = q.lever ? get(q.lever.id + ':' + ARM[q.lever.type]) : null;
        /* направление плеча рычага (поперёк оси) или центр каретки */
        const armDir = arm && arm.a ? V.unit(V.perp(V.sub(fromCat(arm.b), fromCat(arm.a)), A)) : null, armC = arm && arm.c ? fromCat(arm.c) : null;
        const r0 = d.route[0], jArr = cable.findIndex(p => onWheel(p, r0) < LEVER_LIM.onRim);
        const torque = (T, u) => V.dot(V.cross(V.sub(T, P), u), A);
        let p, rel = null, T = cable[jArr - 1], N = cable[jArr];
        if (q.kind === 'cam') {
          const cam = get(q.id + ':cam'), cu = dirFromCat(cam.u), cv = dirFromCat(cam.v), cc = fromCat(cam.c), toW = qq => V.add(V.add(cc, cu, qq[0]), cv, qq[1]);
          const dir = V.unit(V.sub(N, T));
          p = V.len(V.perp(V.perp(V.sub(T, P), A), V.unit(V.perp(dir, A))));
          const nOut = V.unit(V.perp(V.sub(V.sub(T, V.scale(A, V.dot(V.sub(T, cc), A))), cc), dir)), prof = [];
          for (const arc of d.cam.arcs) for (let j = 0; j <= 8; j++) prof.push(toW(EQ.leverStack.camPoint(d.cam.arcs, arc.a0 + (arc.a1 - arc.a0) * j / 8)));
          const tq = [V.dot(V.sub(T, cc), cu), V.dot(V.sub(T, cc), cv)];
          onProf = Math.max(onProf, Math.min(...d.cam.arcs.map(arc => {
            const dd = [tq[0] - arc.c[0], tq[1] - arc.c[1]], an = Math.atan2(dd[1], dd[0]), a2 = arc.a0 + ((an - arc.a0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            if (a2 <= arc.a1) return Math.abs(Math.hypot(dd[0], dd[1]) - arc.r);
            return Math.min(...[arc.a0, arc.a1].map(b => Math.hypot(tq[0] - arc.c[0] - arc.r * Math.cos(b), tq[1] - arc.c[1] - arc.r * Math.sin(b))));
          })));
          side = Math.max(side, ...prof.map(qq => V.dot(V.sub(qq, T), nOut)));
          rel = { cam: cu };
        } else if (q.kind === 'point') {
          T = cable[0]; N = cable[1]; p = Math.abs(torque(T, V.unit(V.sub(N, T))));
          rel = { pt: T };
        } else if (q.kind === 'block') {
          const bw = get(q.id + ':block'), bc = fromCat(bw.c), w = { c: bc, r: bw.r }, idx = cable.map((qq, j) => onWheel(qq, w) < LEVER_LIM.onRim ? j : -1).filter(j => j >= 0);
          const Ta = cable[idx[0]], Tb = cable[idx[idx.length - 1]], Dp = cable[idx[0] - 1], Nb = cable[idx[idx.length - 1] + 1];
          const u1 = V.unit(V.sub(Dp, Ta)), u2 = V.unit(V.sub(Nb, Tb));
          p = Math.abs(torque(Ta, u1) + torque(Tb, u2));
          for (const [Tq, u] of [[Ta, u1], [Tb, u2]]) { rim = Math.max(rim, onWheel(Tq, w)); tan = Math.max(tan, Math.abs(V.dot(V.unit(V.perp(V.sub(Tq, bc), A)), V.unit(V.perp(u, A))))); }
          T = Tb; N = Nb; rel = { pt: bc };
        } else {
          T = cable[0]; N = cable[1];
          const Z = V.unit(V.sub(d.rail[1], d.rail[0]));
          p = Math.abs(V.dot(V.unit(V.sub(N, T)), Z));
          rel = { pt: T, s: V.dot(V.sub(armC, d.rail[0]), Z) };
        }
        /* касание блоков: точки на ободе, свободные отрезки перпендикулярны радиусу */
        for (const wq of d.route) {
          const idx = cable.map((qq, j) => onWheel(qq, wq) < LEVER_LIM.onRim ? j : -1).filter(j => j >= 0);
          if (!idx.length) { tan = Infinity; continue; }
          for (const [j, nb] of [[idx[0], idx[0] - 1], [idx[idx.length - 1], idx[idx.length - 1] + 1]]) {
            const qq = cable[j], other = nb < cable.length ? cable[nb] : (tl ? tl[1] : drop[0]);
            if (!other || V.dist(other, qq) < 1e-6) continue;
            rim = Math.max(rim, onWheel(qq, wq));
            tan = Math.max(tan, Math.abs(V.dot(V.unit(V.perp(V.sub(qq, wq.c), A)), V.unit(V.perp(V.sub(other, qq), A)))));
          }
          const wp = get(wq.id); wheelOff = Math.max(wheelOff, wp ? Math.max(V.dist(fromCat(wp.c), wq.c), Math.abs(wp.r - wq.r)) : Infinity);
        }
        /* где кончается трос привода: у стека (1:1), в начале хвоста или в обойме подвижного блока 1:2 */
        const end = cable[cable.length - 1], bridge = e.mult ? get(e.id + ':stkMultBridge') : null;
        const join = bridge ? V.dist(end, V.add(fromCat(bridge.c), [0, 1, 0], .75)) : tl ? V.dist(end, tl[0]) : V.dist(end, drop[drop.length - 1]);
        /* положение точки крепления (кулачка) относительно плеча рычага или каретки */
        if (armDir) { const w2 = V.cross(A, armDir); rel.frame = rel.pt ? [V.dot(V.sub(rel.pt, P), armDir), V.dot(V.sub(rel.pt, P), w2)] : null; rel.arm = armDir; }
        else if (armC) rel.frame = V.sub(rel.pt, armC);
        /* длина подвижной части троса: у подвижного блока 1:2 без отрезка, на котором висит обойма (весь трос привода постоянен) */
        const len = polyLen(cable) - (bridge && j === 0 ? V.dist(cable[cable.length - 2], end) : 0);
        return { p, rel, join, len, cable };
      });
      const tailJoin = tl ? V.dist(tl[tl.length - 1], drop[drop.length - 1]) : 0;
      const top = get(e.id + ':stkTop'), lift = V.dot(V.sub(fromCat(top.c), st.o), Y) - (st.sel * st.pitch + 2);
      fr.push({ t, a, dv, L, lift, tan, rim, onProf, side, wheelOff, join: Math.max(tailJoin, ...dv.map(q => q.join)), drop, tl, props });
    }
    /* привод с рычагом: кулачок (или точка, блок) неподвижен относительно плеча; угол φ — по нарисованному плечу */
    const ang = (u, v, A) => Math.atan2(V.dot(V.cross(u, v), A), V.dot(u, v));
    let rigid = 0, rigidCm = 0;
    const calc = fr.map(() => 0);
    drives.forEach((q, j) => {
      const rels = fr.map(f => f.dv[j].rel);
      if (q.kind === 'cam') { const r = rels.map(x => ang(x.arm, x.cam, q.A) * 180 / Math.PI); rigid = Math.max(rigid, Math.max(...r) - Math.min(...r)); }
      else if (rels[0].frame) { const f0 = rels[0].frame; rigidCm = Math.max(rigidCm, ...rels.map(x => Math.hypot(...x.frame.map((v, m) => v - f0[m])))); }
      /* знак — наматывается ли трос привода (по длине нарисованного троса), величина — p·|dφ| или p·|ds| */
      let I = 0;
      for (let i = 1; i < fr.length; i++) {
        const pm = (fr[i].dv[j].p + fr[i - 1].dv[j].p) / 2, sg = Math.sign(fr[i].dv[j].len - fr[i - 1].dv[j].len);
        I += sg * (q.kind === 'sled' ? pm * Math.abs(rels[i].s - rels[i - 1].s) : pm * Math.abs(ang(rels[i - 1].arm, rels[i].arm, q.A)));
        calc[i] += I * k;
      }
    });
    const liftErr = Math.max(...fr.map((f, i) => Math.abs((f.lift - fr[0].lift) - calc[i])));
    const Ls = fr.map(f => f.L), lifts = fr.map(f => f.lift);
    /* трос против рамы и других деталей: всё, кроме колёс, по которым он идёт, деталей узла и детали крепления */
    const skipIds = new Set([...drives.flatMap(q => q.d.route.map(w => w.id)), ...(tail ? tail.wheels || [] : []), ...drives.map(q => q.d.mountTo), ...(e.anchorParts || [])]);
    const pre = [e.id + ':', ...drives.map(q => q.id + ':')], skip = c => c.cable || pre.some(s => c.id.startsWith(s)) || skipIds.has(c.id);
    let clear = { d: Infinity };
    for (const f of [fr[0], fr[Math.floor(fr.length / 2)], fr[fr.length - 1], ...fr.filter((_, i) => i % 5 === 0)]) {
      const cols = f.props.filter(q => !q.free).flatMap(V2.collider).filter(c => !c.unknown && !skip(c));
      for (const line of [...f.dv.map(q => q.cable), f.drop, ...(f.tl ? [f.tl] : [])]) for (let i = 1; i < line.length; i++) {
        const a = line[i - 1], b = line[i], n = Math.max(1, Math.ceil(V.dist(a, b)));
        for (let j = 0; j <= n; j++) { const qq = V.mix(a, b, j / n), qc = [qq[0], M.FLOOR - qq[1], qq[2]];
          for (const c of cols) { const d = c.sdf(qc) - EQ.leverStack.CABLE_R; if (d < clear.d) clear = { d, id: c.id, t: f.t }; } }
      }
    }
    /* момент тренажёра против кривой силы (у привода кулачком): плечо первого кулачка */
    const curve = camDrive ? CURVES[e.curve] : null, jc = camDrive ? drives.indexOf(camDrive) : 0, ps = fr.map(f => f.dv[jc].p), pm = Math.max(...ps), as = fr.map(f => f.a);
    const tn = curve ? (() => { const fm = Math.max(...as.map(curve.f)); return as.map(th => curve.f(th) / fm); })() : null;
    const pn = ps.map(v => v / pm), iP = pn.indexOf(1), err = tn ? pn.map((v, i) => v - tn[i]) : [];
    const row = { id, kind: 'рычаг', part: e.id, type: 'кулачок', drives: drives.map(q => q.kind), ratio: k, maxLift: st.maxLift, frames: [],
      length: [Math.min(...Ls), Math.max(...Ls)], tan: Math.max(...fr.map(f => f.tan)), rim: Math.max(...fr.map(f => f.rim)),
      side: Math.max(...fr.map(f => f.side)), onProf: Math.max(...fr.map(f => f.onProf)), dropJoin: Math.max(...fr.map(f => f.join)),
      rigid, rigidCm, liftErr, liftStart: lifts[0], liftMin: Math.min(...lifts), liftMax: Math.max(...lifts), wheelOff: Math.max(...fr.map(f => f.wheelOff)), clear,
      p: [Math.min(...ps), pm], joint: curve ? curve.joint : null, angle: curve ? [as[0], as[as.length - 1]] : null, curve: e.curve || null,
      peakMachine: curve ? as[iP] : null, peakTarget: tn ? as[tn.indexOf(Math.max(...tn))] : null,
      ratioMachine: Math.min(...pn), ratioTarget: tn ? Math.min(...tn) : null,
      rms: err.length ? Math.sqrt(err.reduce((s, x) => s + x * x, 0) / err.length) : null, maxDev: err.length ? Math.max(...err.map(Math.abs)) : null };
    /* совместимость с этапом 1: угол сустава кривой — в поле knee */
    row.knee = row.angle;
    row.frames = fr.map((f, i) => ({ t: +f.t.toFixed(3), knee: f.a == null ? null : +f.a.toFixed(1), p: +ps[i].toFixed(2), ps: f.dv.map(q => +q.p.toFixed(3)), norm: +pn[i].toFixed(3), target: tn ? +tn[i].toFixed(3) : null,
      lift: +f.lift.toFixed(2), calc: +(fr[0].lift + calc[i]).toFixed(2), L: +f.L.toFixed(3) }));
    row.flags = leverFlags(row);
    rows.push(row);
  }
  return rows;
}
function leverFlags(r) {
  const f = [], L = LEVER_LIM;
  if (r.length[1] - r.length[0] > L.length) f.push(`длина троса меняется на ${(r.length[1] - r.length[0]).toFixed(2)} см`);
  if (r.tan > L.tangentCos) f.push(`трос не по касательной к блоку (cos ${r.tan.toExponential(1)})`);
  if (r.rim > L.onRim || r.onProf > L.onRim) f.push(`точка касания не на ободе (${Math.max(r.rim, r.onProf).toFixed(3)} см)`);
  if (r.side > L.side) f.push(`профиль кулачка заходит за прямую схода на ${r.side.toFixed(3)} см`);
  if (r.dropJoin > L.onRim) f.push(`трос привода не доходит до хвоста, стека или обоймы блока (${r.dropJoin.toFixed(3)} см)`);
  if (r.rigid > L.rigid) f.push(`кулачок проворачивается относительно рычага на ${r.rigid.toFixed(3)}°`);
  if (r.rigidCm > L.onRim) f.push(`точка крепления троса сдвигается относительно рычага или каретки на ${r.rigidCm.toFixed(3)} см`);
  if (r.wheelOff > L.onRim) f.push(`колесо блока не там, где его считает узел (${r.wheelOff.toFixed(3)} см)`);
  if (r.liftErr > L.lift) f.push(`подъём стека расходится с k·∫p dφ на ${r.liftErr.toFixed(2)} см`);
  if (r.liftMin < L.hover[0] || r.liftMin > L.hover[1]) f.push(`в нижней точке хода плиты на ${r.liftMin.toFixed(2)} см (норма 1)`);
  if (r.liftMax >= r.maxLift) f.push(`стек упирается в maxLift ${r.maxLift}`);
  if (r.clear.d < -L.clear) f.push(`трос проходит сквозь ${r.clear.id} (t=${r.clear.t}) на ${(-r.clear.d).toFixed(2)} см`);
  return f;
}

/* ---------- одно упражнение ---------- */
function auditEntry(id, entry, { samples = 41 } = {}) {
  const ev = EQ.variantEntry(entry), rig = EQ.rig(ev), eqs = (ev.equipment || []);
  const cablesEq = eqs.filter(e => e.type === 'g3cable'), bandsEq = eqs.filter(e => e.type === 'g3band' || e.type === 'band');
  /* стек рычажных тренажёров (09bo-g4-machines.js, stack): плиты одним неподвижным блоком, трос от головы стека — до блока
     на верхней балке; к рычагу трос не идёт, плиты за рычагом не поднимаются */
  const fixedStacks = EQ.build(eqs, EQ.rig(ev)(0)).filter(p => !p.dyn && /stkPlates$/.test(p.id));
  const levers = eqs.some(e => e.type === 'g4camCable') ? auditLever(id, entry, { samples }) : [];
  if (!cablesEq.length && !bandsEq.length && !fixedStacks.length) return levers;
  const rows = [...levers, ...fixedStacks.map(p => ({ id, kind: '—', part: p.id, type: 'стек', frames: [], flags: ['стек неподвижен: плиты одним блоком не поднимаются за рычагом, трос от головы стека доходит только до блока на балке'] }))];
  if (!cablesEq.length && !bandsEq.length) return rows;
  const frames = [];
  for (let i = 0; i < samples; i++) { const t = i / (samples - 1), R = rig(t); frames.push({ t, R }); }
  const kind = KIND[id] || '—';
  /* кисть на рукояти: отклонение и сгибание запястья по кадрам (Mannequin.jointAngles, как в валидаторе) — рукоять, не
     повёрнутая вслед за предплечьем, выворачивает запястье */
  const ja = frames.map(({ R }) => M.jointAngles(R));
  const wristOf = hs => {
    const dev = hs.flatMap(s => ja.map(a => a[s].wristDev)), flex = hs.flatMap(s => ja.map(a => a[s].wristFlex));
    return { dev: [Math.min(...dev), Math.max(...dev)], flex: [Math.min(...flex), Math.max(...flex)] };
  };
  for (const e of cablesEq) {
    const hands = e.hands || ['L', 'R'], P = fromCat(frames[0].R.props.find(p => p.id === e.id + ':wheel').c), S = e.swivel;
    const st = e.stack, ratio = e.ratio ?? 1, Y = st ? M3.col(st.R, 1) : [0, 1, 0];
    const fr = frames.map(({ t, R }) => {
      const line = R.props.find(p => p.id === e.id + ':line'), T = fromCat(line.pts[0]), K = fromCat(line.pts[1]);
      const end = fromCat(e.attach === 'ankle' ? R['an' + (e.foot || 'L')] : V.mix(R['grip' + hands[0]], R['grip' + (hands[1] || hands[0])], .5));
      const d = V.dist(end, P), raw = st ? (d - (e.rest || 0)) * ratio : null;
      const top = R.props.find(p => p.id === e.id + ':stkTop'), drawn = top ? V.dot(V.sub(fromCat(top.c), V.add(st.o, Y, st.sel * st.pitch + 2)), Y) : null;
      return { t, T, K, end, dir: V.sub(K, T), d, raw, drawn };
    });
    /* ход рукояти: центральная разность по кадрам */
    fr.forEach((f, i) => { const a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)]; f.v = V.sub(b.end, a.end); });
    const vmax = Math.max(...fr.map(f => V.len(f.v))), moving = fr.filter(f => V.len(f.v) > LIM.moving * vmax);
    const row = { id, kind, part: e.id, type: 'трос', attach: e.attach || 'D', ratio, rest: e.rest, frames: [] };
    if (e.attach !== 'ankle') row.wrist = wristOf(hands);
    row.floorAng = [Math.min(...fr.map(f => elev(f.dir))), Math.max(...fr.map(f => elev(f.dir)))];
    row.moveAng = Math.max(...moving.map(f => angleLine(f.dir, f.v)));
    row.moveAngMid = angleLine(fr[Math.floor(fr.length / 2)].dir, fr[Math.floor(fr.length / 2)].v);
    row.height = [Math.min(...fr.map(f => f.end[1] - P[1])), Math.max(...fr.map(f => f.end[1] - P[1]))];
    row.span = [Math.min(...fr.map(f => f.d)), Math.max(...fr.map(f => f.d))];
    /* растяжка — кадр, где рукоять ближе всего к блоку; конец тяги — дальше всего */
    const near = fr.reduce((a, f) => f.d < a.d ? f : a), far = fr.reduce((a, f) => f.d > a.d ? f : a);
    row.stretchT = near.t; row.farT = far.t;
    const u = V.unit(V.sub(far.end, far.T));
    row.lineDev = Math.max(...fr.map(f => lineDist(f.end, far.T, u)));
    row.swing = Math.max(...fr.map(f => angleLine(f.dir, far.dir)));
    const pl = pca(fr.map(f => f.end)), n = pl.axes[2];
    row.pathSpread = Math.max(...fr.map(f => Math.abs(V.dot(V.sub(f.end, pl.c), n))));
    row.planeAng = Math.max(...moving.map(f => deg(Math.asin(Math.min(1, Math.abs(V.dot(V.unit(f.dir), n)))))));
    if (st) {
      const raws = fr.map(f => f.raw);
      row.liftMin = Math.min(...raws); row.liftMinT = fr[raws.indexOf(row.liftMin)].t; row.liftMax = Math.max(...raws); row.maxLift = st.maxLift;
      row.liftAtStretch = near.raw;
      row.lying = fr.filter(f => f.raw <= 0).map(f => f.t);
      row.drawnMax = Math.max(...fr.map(f => f.drawn ?? 0));
      const R0 = frames[0].R, props = R0.props;
      row.floating = props.some(p => p.id === e.id + ':stkFloat');
      row.route = routeOf(props, e, P, S);
    }
    row.frames = fr.map(f => ({ t: +f.t.toFixed(3), floor: +elev(f.dir).toFixed(1), move: V.len(f.v) > LIM.moving * vmax ? +angleLine(f.dir, f.v).toFixed(1) : null, h: +(f.end[1] - P[1]).toFixed(1), lift: f.raw != null ? +f.raw.toFixed(2) : null }));
    row.flags = flagsOf(row);
    rows.push(row);
  }
  for (const e of bandsEq) {
    /* две ветви от одной точки крепления (дверь): ход — по середине кистей, как у каната (концы ленты расходятся, и каждая
       кисть идёт к своей ветви под углом); у ветвей — длина и растяжение */
    const hands = e.hands || ['L', 'R'], shared = e.type === 'g3band' && hands.length > 1;
    const branch = (R, s) => {
      const b = R.props.find(p => p.id === (e.id || 'band') + ':' + s), pts = b.pts.map(fromCat);
      let L = 0; for (let i = 1; i < pts.length; i++) L += V.dist(pts[i - 1], pts[i]);
      return { A: pts[pts.length - 2], K: pts[pts.length - 1], L, end: fromCat(R['grip' + s]) };
    };
    for (const s of shared ? [...hands, 'mid'] : hands) {
      const fr = frames.map(({ t, R }) => {
        if (s !== 'mid') { const b = branch(R, s); return { t, ...b, dir: V.sub(b.K, b.A) }; }
        const a = branch(R, hands[0]), b = branch(R, hands[1]), K = V.mix(a.K, b.K, .5);
        return { t, A: a.A, K, L: (a.L + b.L) / 2, end: V.mix(a.end, b.end, .5), dir: V.sub(K, a.A) };
      });
      fr.forEach((f, i) => { const a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)]; f.v = V.sub(b.end, a.end); });
      const vmax = Math.max(...fr.map(f => V.len(f.v))), moving = fr.filter(f => V.len(f.v) > LIM.moving * vmax);
      const row = { id, kind: shared && s !== 'mid' ? 'ветвь' : kind, part: (e.id || 'band') + ':' + s, type: 'лента', side: s };
      row.wrist = wristOf(s === 'mid' ? hands : [s]);
      row.floorAng = [Math.min(...fr.map(f => elev(f.dir))), Math.max(...fr.map(f => elev(f.dir)))];
      row.moveAng = Math.max(...moving.map(f => angleLine(f.dir, f.v)));
      row.moveAngMid = angleLine(fr[Math.floor(fr.length / 2)].dir, fr[Math.floor(fr.length / 2)].v);
      row.height = [Math.min(...fr.map(f => f.end[1] - f.A[1])), Math.max(...fr.map(f => f.end[1] - f.A[1]))];
      const Ls = fr.map(f => f.L), near = fr.reduce((a, f) => f.L < a.L ? f : a), far = fr.reduce((a, f) => f.L > a.L ? f : a);
      row.len = [Math.min(...Ls), Math.max(...Ls)]; row.stretchT = near.t; row.farT = far.t;
      /* растяжка — исходное положение (t=0 или t=1, где лента короче); сжатие — ветвь короче, чем в растяжке */
      const start = fr[0].L <= fr[fr.length - 1].L ? fr[0] : fr[fr.length - 1];
      row.startT = start.t; row.shrink = start.L - near.L;
      row.ratioLen = row.len[1] / row.len[0];
      const u = V.unit(V.sub(far.end, far.A));
      row.lineDev = Math.max(...fr.map(f => lineDist(f.end, far.A, u)));
      row.swing = Math.max(...fr.map(f => angleLine(f.dir, far.dir)));
      const pl = pca(fr.map(f => f.end)), n = pl.axes[2];
      row.planeAng = Math.max(...moving.map(f => deg(Math.asin(Math.min(1, Math.abs(V.dot(V.unit(f.dir), n)))))));
      row.frames = fr.map(f => ({ t: +f.t.toFixed(3), floor: +elev(f.dir).toFixed(1), move: V.len(f.v) > LIM.moving * vmax ? +angleLine(f.dir, f.v).toFixed(1) : null, h: +(f.end[1] - f.A[1]).toFixed(1), len: +f.L.toFixed(1) }));
      row.flags = flagsOf(row);
      rows.push(row);
    }
  }
  return rows;
}
function flagsOf(r) {
  const f = [];
  if (r.kind === 'line') {
    if (r.lineDev > LIM.lineDev) f.push(`путь рукояти в ${r.lineDev.toFixed(1)} см от прямой «рукоять → ${r.type === 'трос' ? 'блок' : 'крепление'}»`);
    if (r.swing > LIM.lineSwing) f.push(`${r.type} поворачивается за повтор на ${r.swing.toFixed(0)}°`);
    if (r.moveAng > LIM.lineMove) f.push(`${r.type} под ${r.moveAng.toFixed(0)}° к ходу рукояти`);
  }
  if (r.kind === 'arc' && r.planeAng > LIM.arcPlane) f.push(`${r.type} выходит из плоскости движения на ${r.planeAng.toFixed(0)}°`);
  /* у прямой рукояти (bar) ось хвата задана грифом: отклонение — следствие ширины хвата, оно печатается, но не отмечается */
  if (r.wrist && r.attach !== 'bar' && Math.max(-r.wrist.dev[0], r.wrist.dev[1]) > LIM.wristDev) f.push(`запястье отклонено до ${Math.max(-r.wrist.dev[0], r.wrist.dev[1]).toFixed(0)}° (рукоять не по предплечью?)`);
  if (r.type === 'трос' && r.liftMin != null) {
    if (r.liftAtStretch < LIM.hoverMin || r.liftAtStretch > LIM.hoverMax) f.push(`стек в растяжке (t=${r.stretchT.toFixed(3)}) на ${r.liftAtStretch.toFixed(1)} см над плитами (норма ${LIM.hoverMin}–${LIM.hoverMax})`);
    if (r.lying.length) f.push(`стек лежит на плитах в ${r.lying.length} кадр. (t=${r.lying[0].toFixed(3)}…${r.lying[r.lying.length - 1].toFixed(3)})`);
    if (r.liftMax > r.maxLift) f.push(`стек упирается в maxLift ${r.maxLift} (нужно ${r.liftMax.toFixed(0)})`);
    if (r.ratio < 1 && !r.floating) f.push(`ratio ${r.ratio} (2:1), а подвижного блока на стеке нет`);
    if (r.ratio === 1 && r.floating) f.push('ratio 1 (1:1), а на стеке подвижный блок');
    if (!r.route.ok) f.push('трос от блока не доходит до стека');
  }
  if (r.type === 'лента') {
    if (r.shrink > LIM.bandShrink) f.push(`лента короче, чем в растяжке, на ${r.shrink.toFixed(1)} см (сжимается или провисает)`);
    if (r.ratioLen > LIM.bandStretch) f.push(`растяжение ленты ×${r.ratioLen.toFixed(1)}`);
  }
  return f;
}
function run({ only, samples = 41, baked = false } = {}) {
  const entries = baked ? require('../../src/js/09bp-poses.js') : require('./author.js').bakeAll({ only });
  const rows = [];
  for (const [id, e] of Object.entries(entries)) { if ((only && !only.includes(id)) || id.startsWith('_')) continue; rows.push(...auditEntry(id, e, { samples })); }
  return rows;
}
const f1 = v => v == null ? '—' : (+v).toFixed(1), f0 = v => v == null ? '—' : (+v).toFixed(0), rng = (a, k = f0) => `${k(a[0])}…${k(a[1])}`;
function describe(r) {
  if (r.type === 'стек') return `стек тренажёра ${r.part}`;
  if (r.type === 'кулачок') return [`кулачок ${r.part} [рычаг, k=${r.ratio}]`, `плечо троса ${rng(r.p, f1)} см, колено ${rng(r.knee)}°`,
    r.curve ? `пик момента ${f0(r.peakMachine)}° (цель ${f0(r.peakTarget)}°), min/max ${r.ratioMachine.toFixed(2)} (цель ${r.ratioTarget.toFixed(2)}), откл. RMS ${r.rms.toFixed(3)}, max ${r.maxDev.toFixed(3)}` : 'без кривой силы',
    `длина троса ${rng(r.length, v => v.toFixed(2))} см`, `касание: cos ${r.tan.toExponential(1)}, обод ${Math.max(r.rim, r.onProf).toFixed(3)} см, профиль за прямой ${r.side.toFixed(3)} см`,
    `кулачок/рычаг ${r.rigid.toFixed(4)}°`, `стек: старт ${f1(r.liftStart)}, min ${f1(r.liftMin)}, max ${f1(r.liftMax)} из ${r.maxLift} см, против k·∫p dφ ${r.liftErr.toFixed(3)} см`,
    `зазор троса до рамы ${r.clear.d.toFixed(2)} см (${r.clear.id})`].join(' | ');
  const out = [`${r.type} ${r.part} [${r.kind}]`, `к полу ${rng(r.floorAng)}°`, `к ходу ≤${f0(r.moveAng)}° (середина ${f0(r.moveAngMid)}°)`,
    `${r.type === 'трос' ? (r.attach === 'ankle' ? 'голеностоп' : 'кисть') + ' над осью блока' : 'кисть над креплением'} ${rng(r.height)} см`,
    r.kind === 'line' ? `от прямой ${f1(r.lineDev)} см, поворот ${f0(r.swing)}°` : `из плоскости ${f0(r.planeAng)}°`,
    r.wrist ? `запястье: отклонение ${rng(r.wrist.dev)}°, сгибание ${rng(r.wrist.flex)}°` : ''].filter(Boolean);
  if (r.type === 'трос') {
    out.push(`рукоять—колесо ${rng(r.span)} см`);
    if (r.liftMin != null) out.push(`ratio ${r.ratio}${r.floating ? ' (подвижный блок)' : ''}, rest ${r.rest}, стек: в растяжке ${f1(r.liftAtStretch)} см @${r.stretchT.toFixed(3)}, min ${f1(r.liftMin)} @${r.liftMinT.toFixed(3)}, max ${f1(r.liftMax)} из ${r.maxLift}`, `проводка ${r.route.ok ? 'до стека' : 'обрыв'} (${r.route.chain.join(', ') || '—'})`);
  } else out.push(`длина ${rng(r.len, f1)} см (×${r.ratioLen.toFixed(2)}), растяжка @${r.startT}`);
  return out.join(' | ');
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), all = process.argv.includes('--all'), frames = process.argv.includes('--frames');
  const rows = run({ only, samples, baked: process.argv.includes('--baked') });
  const bad = rows.filter(r => r.flags.length);
  for (const r of all ? rows : bad) {
    console.log(`${r.id.padEnd(14)} ${describe(r)}${r.flags.length ? '\n    ⚠ ' + r.flags.join('; ') : ''}`);
    if (frames && r.type === 'кулачок') { for (const f of r.frames.filter((_, i) => i % 4 === 0)) console.log(`      t=${f.t.toFixed(3).padEnd(6)} колено ${f1(f.knee).padStart(6)}°  плечо ${f.p.toFixed(2).padStart(6)} см  момент ${f.norm.toFixed(3)} (цель ${f.target == null ? '—' : f.target.toFixed(3)})  подъём ${f1(f.lift).padStart(5)} (k·∫p dφ ${f1(f.calc).padStart(5)}) см  трос ${f.L.toFixed(2)} см`); continue; }
    if (frames) for (const f of r.frames.filter((_, i) => i % 5 === 0)) console.log(`      t=${f.t.toFixed(3).padEnd(6)} к полу ${f1(f.floor).padStart(6)}°  к ходу ${f.move == null ? '   —' : f1(f.move).padStart(5)}°  высота ${f1(f.h).padStart(6)} см${f.lift != null ? `  стек ${f1(f.lift).padStart(6)} см` : ''}${f.len != null ? `  длина ${f1(f.len).padStart(6)} см` : ''}`);
  }
  console.log(`\nУпражнений ${new Set(rows.map(r => r.id)).size}; тросов ${rows.filter(r => r.type === 'трос').length}, ветвей ленты ${rows.filter(r => r.type === 'лента').length}; с замечаниями ${new Set(bad.map(r => r.id)).size} упражнений (${bad.length} строк)`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows, null, 1));
}
module.exports = { run, auditEntry, auditLever, KIND, LIM, LEVER_LIM };
