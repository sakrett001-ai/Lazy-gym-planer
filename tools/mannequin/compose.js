'use strict';
/* Помощники авторинга поз (только сборка, в приложение не попадают).
   Позы задаются как функции фазы t: корпус — углами, конечности — через обратную кинематику
   к реальным точкам инвентаря (гриф, рукоять, пол, подушка). */
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const { V, M3, D2R } = M;
const fromCat = p => [p[0], M.FLOOR - p[1], p[2]];

function ctx(equipment) {
  const A = EQ.anchors(equipment);
  const C = {
    M, V, M3, EQ, A, D2R,
    lerp: (a, b, t) => a + (b - a) * t,
    mixV: (a, b, t) => V.mix(a, b, t),
    ease: t => .5 - .5 * Math.cos(Math.PI * Math.max(0, Math.min(1, t))),
    base() { return M.neutral(); },
    fk: q => M.fk(q),
    /* корень: положение таза и оси (up — вдоль позвоночника к голове, fwd — вперёд от живота) */
    root(q, p, up, fwd) { q.root.p = [...p]; q.root.q = M.rootFromAxes(up, fwd); return q; },
    rootYPR(q, p, yaw = 0, pitch = 0, roll = 0) { q.root.p = [...p]; q.root.q = M.rootRot(yaw, pitch, roll); return q; },
    /* сгибание корпуса делится между поясницей и грудным отделом */
    trunk(q, flex = 0, lat = 0, rot = 0, lumbarShare = .55) {
      q.lumbar = [flex * lumbarShare, lat * .5, rot * .3]; q.thoracic = [flex * (1 - lumbarShare), lat * .5, rot * .7]; return q;
    },
    /* лопаточно-плечевой ритм: поднимание пояса растёт с высотой руки (≈1:2 выше 30°) */
    rhythm(q, s, extra = [0, 0]) {
      const f = M.fk(q), hum = V.unit(V.sub(f.P['el' + s], f.P['gh' + s])), down = V.scale(M3.col(f.F.thorax.R, 1), -1);
      const elev = V.angle(hum, down), fwd = V.dot(hum, M3.col(f.F.thorax.R, 2));
      q[s].girdle = [M.clamp(Math.max(0, elev - 30) * .22 + extra[0], -10, 38), M.clamp(fwd * 8 + extra[1], -20, 26)]; return q;
    },
    /* точки поверхности тела по областям — во внутренних координатах */
    region(q, name) {
      const R = M.catalogPose(q), out = [];
      const torso = (h0, h1, a0, a1) => { for (let h = h0; h <= h1; h += 2) for (let a = a0; a <= a1 + 1e-9; a += Math.PI / 16) for (const s of ['L', 'R']) out.push(fromCat(M.torsoPoint(R, h, s, a))); };
      const limb = (k, s, t0, t1, a0, a1) => { for (let t = t0; t <= t1 + 1e-9; t += .05) for (let a = a0; a <= a1 + 1e-9; a += Math.PI / 12) out.push(fromCat(M.limbPoint(R, k, s, t, a))); };
      const head = (sel) => { const f = R.frames.head; for (let i = 0; i < 26; i++) for (let j = 0; j < 13; j++) { const th = i / 26 * 2 * Math.PI, ph = j / 12 * Math.PI, d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]; if (!sel(d)) continue; const p = V.add(V.add(V.add(R.head, f.x, d[0] * M.B.head[0]), f.y, d[1] * M.B.head[1]), f.z, d[2] * M.B.head[2]); out.push(fromCat(p)); } };
      if (name === 'back') torso(-2, 52, Math.PI * .7, Math.PI);
      else if (name === 'upperBack') torso(26, 52, Math.PI * .7, Math.PI);
      else if (name === 'chest') torso(14, 46, 0, Math.PI * .3);
      else if (name === 'belly') torso(-4, 30, 0, Math.PI * .3);
      else if (name === 'front') torso(-6, 48, 0, Math.PI * .3);
      else if (name === 'buttocks') { torso(-9, 4, Math.PI * .55, Math.PI); torso(-9, -7, 0, Math.PI); for (const s of ['L', 'R']) limb('th', s, 0, .55, Math.PI * .6, Math.PI * 1.4); }
      else if (name === 'thighsBack') { for (const s of ['L', 'R']) limb('th', s, 0, .9, Math.PI * .6, Math.PI * 1.4); }
      else if (name === 'headBack') head(d => d[2] < -.3);
      else if (name === 'headAll') head(() => true);
      else if (/^(ua|fa|th|sk)(L|R)$/.test(name)) limb(name.slice(0, 2), name.slice(2), 0, 1, 0, 2 * Math.PI);
      else if (/^knee(L|R)$/.test(name)) { const s = name.slice(4); limb('sk', s, 0, .25, -Math.PI * .5, Math.PI * .5); limb('th', s, .85, 1, -Math.PI * .5, Math.PI * .5); }
      else if (/^shin(L|R)$/.test(name)) limb('sk', name.slice(4), 0, .8, -Math.PI * .5, Math.PI * .5);
      else throw Error('Unknown body region ' + name);
      return out;
    },
    /* Положить область тела на плоскость (точка, нормаль): сдвиг таза вдоль нормали.
       gap < 0 — поджатие мягких тканей и обивки, см. */
    restOn(q, name, point, normal, gap = -1) {
      const n = V.unit(normal), pts = C.region(q, name);
      const min = Math.min(...pts.map(p => V.dot(V.sub(p, point), n)));
      q.root.p = V.add(q.root.p, n, gap - min); return q;
    },
    /* Две области на одной плоскости (лопатки и ягодицы на скамье при прогибе): наклон таза вокруг его
       поперечной оси подбирается так, чтобы обе области касались плоскости одновременно. */
    restOn2(q, a, b, point, normal, gap = -1, range = 30) {
      const n = V.unit(normal), base = q.root.q.slice(), axis = M3.col(M.fk(q).F.pelvis.R, 0);
      const minD = name => Math.min(...C.region(q, name).map(p => V.dot(V.sub(p, point), n)));
      const setPitch = deg => { q.root.q = M.Q.fromM3(M3.mul(M3.axis(axis, deg * D2R), M.Q.toM3(base))); };
      const f = deg => { setPitch(deg); return minD(a) - minD(b); };
      let lo = -range, hi = range, flo = f(lo), fhi = f(hi);
      if (flo * fhi > 0) { setPitch(Math.abs(flo) < Math.abs(fhi) ? lo : hi); }
      else { for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2, fm = f(m); if (flo * fm <= 0) { hi = m; fhi = fm; } else { lo = m; flo = fm; } } setPitch((lo + hi) / 2); }
      return C.restOn(q, a, point, normal, gap);
    },
    /* Хват: точка, ось ручки (направление большого пальца), полюс локтя */
    grip(q, s, point, thumb, pole, opts = {}) {
      const info = M.solveArm(q, s, point, thumb, pole, opts);
      q.hands = { ...(q.hands || {}), [s]: opts.mode || 'grip' };
      if (info.reachError > .05 && !opts.allowShort) throw Error(`Рука ${s} не дотягивается до хвата: не хватает ${info.reachError.toFixed(1)} см`);
      return info;
    },
    /* Свободный снаряд (гантель, гиря): кисть продолжает предплечье с заданной пронацией,
       ось рукояти следует за кистью. pron — 0: большой палец «вперёд» по плоскости сгиба локтя. */
    hold(q, s, point, pole, opts = {}) {
      const g = M.SIGN[s], off = [-g * M.B.grip[0], M.B.grip[1], M.B.grip[2]], p = opts.pron || 0, fl = opts.flex || 0, dv = opts.dev || 0;
      let info = { reachError: 0 };
      for (let it = 0; it < 20; it++) {
        const f = M.fk(q), Hd = M3.mul(f.F['fa' + s].R, M3.mul(M3.ry(-g * p), M3.mul(M3.rz(-g * fl), M3.rx(-dv))));
        const tb = M.twoBone(f.P['gh' + s], V.sub(point, M3.v(Hd, off)), M.B.ua, M.B.fa, pole);
        M.setArmFromPoints(q, s, f, tb.mid, tb.end, null); q[s].pron = p; q[s].wrist = [fl, dv]; info = { reachError: tb.reachError };
        if (V.dist(M.fk(q).P['grip' + s], point) < .02) break;
      }
      q.hands = { ...(q.hands || {}), [s]: opts.mode || 'grip' };
      info.gripError = V.dist(M.fk(q).P['grip' + s], point);
      if ((info.reachError > .05 || info.gripError > .3) && !opts.allowShort) throw Error(`Рука ${s} не дотягивается до снаряда: ${Math.max(info.reachError, info.gripError).toFixed(1)} см`);
      return info;
    },
    /* Ладонь на опоре: центр ладони в точке, пальцы в направлении fingers, нормаль опоры up */
    palm(q, s, point, fingers, up, pole) {
      const g = M.SIGN[s], y = V.scale(V.unit(V.perp(fingers, up)), -1), palmDir = V.scale(V.unit(up), -1);
      /* ладонь (−g·x) смотрит в опору: x = g·up; z = x × y дополняет правую тройку */
      const x = V.scale(V.unit(up), g), z = V.cross(x, y), Rh = M3.cols(x, y, z);
      const centre = [-g * (M.B.palm.thick / 2 + .3), -5.6, 0];
      const wrist = V.sub(point, M3.v(Rh, centre));
      const r = M.solveArmWrist(q, s, wrist, pole, Rh);
      q.hands = { ...(q.hands || {}), [s]: 'flat' };
      if (r.reachError > .05) throw Error(`Рука ${s} не дотягивается до опоры: ${r.reachError.toFixed(1)} см`);
      return palmDir;
    },
    /* Стопа на опоре: точка под подушечкой стопы, разворот носка, подъём пятки */
    foot(q, s, support, yaw, pole, opts = {}) {
      const ff = M.footFrame(support, yaw, opts), r = M.solveLeg(q, s, ff, pole);
      if (r.reachError > .05 && !opts.allowShort) throw Error(`Нога ${s} не дотягивается до опоры: ${r.reachError.toFixed(1)} см`);
      return r;
    },
    heel(q, s, support, yaw, pitch, pole, opts = {}) {
      const ff = M.heelFrame(support, yaw, pitch, opts), r = M.solveLeg(q, s, ff, pole);
      if (r.reachError > .05 && !opts.allowShort) throw Error(`Нога ${s} не дотягивается пяткой: ${r.reachError.toFixed(1)} см`);
      return r;
    },
    /* Колено на опоре: голень лежит на плоскости (contact — точка под коленом), shin — направление от колена к стопе.
       Таз должен стоять так, чтобы бедро дотягивалось до колена (см. rootAtHip). toes: 'flat' — подъём стопы на опоре,
       'tucked' — пальцы подогнуты и упираются. */
    kneel(q, s, contact, shin, up = [0, 1, 0], opts = {}) {
      const u = V.unit(up), d = V.unit(V.perp(shin, u)), lift = opts.kneeLift ?? 5.4;
      const K = V.add(contact, u, lift), hip = M.fk(q).P['hip' + s], L = V.dist(hip, K);
      if (Math.abs(L - M.B.th) > 1.2) throw Error(`Колено ${s}: от тазобедренного ${L.toFixed(1)} см вместо ${M.B.th}`);
      const ankleH = opts.toes === 'tucked' ? 10 : 4.4, dh = ankleH - lift, horiz = Math.sqrt(M.B.sk ** 2 - dh ** 2);
      const A = V.add(V.add(K, d, horiz), u, dh), sd = V.unit(V.sub(A, K));
      const shR = M3.frameYZ(V.scale(sd, -1), V.scale(u, -1));
      const plantar = opts.toes === 'tucked' ? (opts.plantar ?? 25) : (opts.plantar ?? 48);
      const footR = M3.mul(shR, M3.rx(plantar));
      const toesR = opts.toes === 'tucked' ? M3.frameYZ(u, V.scale(d, -1)) : footR;
      const r = M.solveLeg(q, s, { o: A, R: footR, toesR }, V.scale(u, -1));
      return r;
    },
    /* Поставить таз так, чтобы тазобедренный сустав стороны s оказался в точке p (ориентация таза не меняется) */
    rootAtHip(q, s, p) { const f = M.fk(q); q.root.p = V.add(q.root.p, V.sub(p, f.P['hip' + s])); return q; },
    /* Поставить таз так, чтобы середина плечевых суставов оказалась в точке p */
    rootAtShoulders(q, p) { const f = M.fk(q), c = V.mix(f.P.ghL, f.P.ghR, .5); q.root.p = V.add(q.root.p, V.sub(p, c)); return q; },
    /* латеральное направление стороны в мире (наружу от средней линии) */
    lat(q, s) { const f = M.fk(q); return V.scale(M3.col(f.F.thorax.R, 0), M.SIGN[s]); },
    latP(q, s) { const f = M.fk(q); return V.scale(M3.col(f.F.pelvis.R, 0), M.SIGN[s]); },
    axes(q, seg = 'thorax') { const f = M.fk(q), R = f.F[seg].R; return { x: M3.col(R, 0), y: M3.col(R, 1), z: M3.col(R, 2), o: f.F[seg].o }; },
    /* подобрать сгибание шеи так, чтобы область головы коснулась плоскости */
    neckTo(q, name, point, normal, gap = -.4, lo = -45, hi = 35) {
      const n = V.unit(normal), f = v => { q.neck[0] = v; return Math.min(...C.region(q, name).map(p => V.dot(V.sub(p, point), n))) - gap; };
      let a = lo, b = hi, fa = f(a), fb = f(b);
      if (fa * fb > 0) { q.neck[0] = Math.abs(fa) < Math.abs(fb) ? a : b; return q; }
      for (let i = 0; i < 30; i++) { const m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; } }
      q.neck[0] = (a + b) / 2; return q;
    },
    /* одномерный подбор: f монотонна на [lo, hi], ищем f = 0 */
    solve1D(f, lo, hi, it = 40) { let a = lo, b = hi, fa = f(a); for (let i = 0; i < it; i++) { const m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } } return (a + b) / 2; },
    /* точка передней поверхности корпуса по средней линии на высоте h */
    chestPoint(q, h, ang = 0) { const R = M.catalogPose(q); return fromCat(M.torsoPoint(R, h, 'L', ang)); },
    point: (eqId, name) => { const a = A[eqId]?.[name]; if (!a) throw Error(`Нет опорной точки ${eqId}.${name}`); return a.o ? a.o : a; },
    frame: (eqId, name) => A[eqId][name]
  };
  return C;
}
module.exports = { ctx, fromCat };
