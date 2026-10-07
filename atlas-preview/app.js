/* ===================== ДВИЖОК ФИГУРЫ ===================== */
const FL = {torso:52, neck:15, headR:10, ua:30, fa:27, hand:7, th:43, sh:42, heel:4, toe:13};
const GROUND = 186;
const SIDE_CHEST = [36, 12.5]; // Anterior chest point on the rendered side-view contour.
const D2R = Math.PI / 180;
const dir = a => [Math.sin(a * D2R), -Math.cos(a * D2R)];
const angOf = v => Math.atan2(v[0], -v[1]) / D2R;
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const vlen = v => Math.hypot(v[0], v[1]);
const unit = v => { const l = vlen(v) || 1; return [v[0] / l, v[1] / l]; };
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const BEND = {fwd:[1, 0], back:[-1, 0], up:[0, -1], down:[0, 1]};

// v2: interpolate orientations, preserve limb lengths and normalize mixed targets.
function slerp3(a, b, t) {
  let dot = Math.max(-1, Math.min(1, a.reduce((s, v, i) => s + v * b[i], 0)));
  if (dot > .9995) { const v = a.map((x, i) => x + (b[i] - x) * t); const l = Math.hypot(...v) || 1; return v.map(x => x / l); }
  if (dot < -.9995) {
    const n = Math.abs(a[2]) < .8 ? [0, 0, 1] : [1, 0, 0];
    const q = n.map((x, i) => x - a[i] * a.reduce((s, y, j) => s + y * n[j], 0));
    const len = Math.hypot(...q);
    return a.map((x, i) => x * Math.cos(Math.PI * t) + q[i] / len * Math.sin(Math.PI * t));
  }
  const angle = Math.acos(dot), den = Math.sin(angle);
  return a.map((x, i) => (x * Math.sin((1 - t) * angle) + b[i] * Math.sin(t * angle)) / den);
}
function lerpSpec(A, B, t) {
  if (typeof A === 'number') return typeof B === 'number' ? A + (B - A) * t : A;
  if (Array.isArray(A)) return A.map((v, i) => lerpSpec(v, B ? B[i] : v, t));
  if (A && typeof A === 'object') {
    const o = {};
    for (const k of new Set([...Object.keys(A), ...Object.keys(B || {})])) {
      if (k === 'v' && A.v && B && B.v) o.v = A.v.map((v, i) => slerp3(v, B.v[i], t));
      else if (!(k in A)) o[k] = typeof B[k] === 'number' ? B[k] * t : B[k];
      else if (!B || !(k in B)) o[k] = typeof A[k] === 'number' ? A[k] * (1 - t) : A[k];
      else o[k] = lerpSpec(A[k], B[k], t);
    }
    return o;
  }
  return A;
}
function projectionVector(p, length, planar) {
  const d = Math.hypot(...p);
  if (planar) return d ? [p[0] / d, p[1] / d, 0] : [0, 1, 0];
  const scale = d > length ? length / d : 1;
  const x = p[0] * scale / length, y = p[1] * scale / length;
  return [x, y, Math.sqrt(Math.max(0, 1 - x*x - y*y))];
}
function normalizeAnimation(anim) {
  if (anim._normalized || anim.sample) return;
  anim._normalized = true;
  let frames = JSON.parse(JSON.stringify(anim.keys || [anim.A, anim.B || anim.A]));
  if (anim.view === 'front') {
    frames.forEach(P => {
      for (const side of ['R', 'L']) {
        for (const [part, lengths, fallback] of [
          ['arm', [FL.ua, FL.fa], {p:[[2,29],[3,56]]}],
          ['leg', [FL.th, FL.sh], {p:[[3,43],[5,85]]}]
        ]) {
          const s = Object.assign({}, P[part+side] || P[part] || fallback);
          if (s.p) {
            s.v = [projectionVector(s.p[0], lengths[0], part === 'arm' && anim.planarArms), projectionVector(sub(s.p[1], s.p[0]), lengths[1], part === 'arm' && anim.planarArms)];
            delete s.p;
          }
          P[part+side] = s;
        }
      }
    });
  } else {
    for (const part of ['armN','armF','legN','legF']) {
      const base = part.startsWith('arm') ? 'arm' : 'leg';
      const specs = frames.map(P => P[part] || P[base] || {a:[180,180]});
      const mode = s => ['a','ra','ik','tf','rk','p'].find(k => s[k]);
      if (new Set(specs.map(mode)).size > 1) {
        frames.forEach((P, i) => {
          const J = solveSide(P, null), s = specs[i], end = J[(base === 'arm' ? 'wr' : 'an') + part.slice(-1)];
          P[part] = {ik:end, b:s.b || 'fwd', ...(s.hA !== undefined ? {hA:s.hA} : {}), ...(s.f !== undefined ? {f:s.f} : {}), ...(s.fr !== undefined ? {fr:s.fr} : {})};
        });
      }
    }
  }
  if (anim.keys) anim.keys = frames;
  anim.A = frames[0]; anim.B = frames[frames.length - 1];
}
function torsoPoint(J, a, b) {
  if (a > 18 && J.waist) return add(add(J.waist, J.chestU, a - 18), J.chestN, b);
  return add(add(J.hip, J.u, a), J.n, b);
}


/* Двухзвенная обратная кинематика. Сторона сгиба фиксируется в C после прогрева. */
function ik2(root, tgt, a, b, bend, C, key) {
  const v = sub(tgt, root);
  let d = vlen(v);
  d = Math.max(Math.abs(a - b) + 0.5, Math.min(a + b - 0.05, d));
  const th = Math.atan2(v[1], v[0]);
  const al = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const bd = BEND[bend] || BEND.fwd;
  const j1 = [Math.cos(th + al), Math.sin(th + al)], j2 = [Math.cos(th - al), Math.sin(th - al)];
  const sNow = (j1[0] * bd[0] + j1[1] * bd[1]) >= (j2[0] * bd[0] + j2[1] * bd[1]) ? 1 : -1;
  let s = sNow;
  if (C) {
    const c = C[key];
    if (C.__prime) { if (!c || al > c.al) C[key] = {s:sNow, al}; }
    else if (c) s = c.s;
  }
  const joint = [root[0] + a * Math.cos(th + s * al), root[1] + a * Math.sin(th + s * al)];
  const end = [root[0] + d * Math.cos(th), root[1] + d * Math.sin(th)];
  return [joint, end];
}

function limbSide(root, spec, l1, l2, J, C, key) {
  if (spec.a) { const j = add(root, dir(spec.a[0]), l1); return [j, add(j, dir(spec.a[1]), l2)]; }
  if (spec.ra) { const a = key.startsWith('arm') ? J.upperTa : J.ta; const j = add(root, dir(a + spec.ra[0]), l1); return [j, add(j, dir(a + spec.ra[1]), l2)]; }
  if (spec.p) return [add(root, spec.p[0]), add(root, spec.p[1])];
  let tgt;
  if (spec.ik) tgt = spec.ik;
  else if (spec.tf) tgt = add(add(J.hip, J.u, spec.tf[0]), J.n, spec.tf[1]);
  else if (spec.rk) tgt = add(root, spec.rk);
  return ik2(root, tgt, l1, l2, spec.b || 'fwd', C, key);
}

function solveSide(P, C) {
  const hip = P.hip, ta = P.torso;
  const u = dir(ta), n = [-u[1], u[0]];
  const upperTa = ta + (P.flex || 0), chestU = dir(upperTa), chestN = [-chestU[1], chestU[0]];
  const waist = add(hip,u,18), sh = add(waist,chestU,FL.torso-18+(P.shrug||0));
  const head = add(sh, dir(upperTa + (P.head || 0)), P.neck !== undefined ? P.neck : FL.neck);
  const J = {view:'side', hip, waist, sh, head, u, n, ta, upperTa, chestU, chestN};
  for (const s of ['N', 'F']) {
    const spec = P['arm' + s] || P.arm || {a:[180, 180]};
    const [el, wr] = limbSide(sh, spec, FL.ua, FL.fa, J, C, 'arm' + s);
    const fa = angOf(sub(wr, el));
    const ha = spec.hA !== undefined ? spec.hA : fa + (spec.w || 0);
    J['el' + s] = el; J['wr' + s] = wr; J['fa' + s] = fa; J['ha' + s] = ha;
    J['hand' + s] = add(wr, dir(ha), FL.hand);
    J['grip' + s] = add(wr, dir(ha), 3.5);
  }
  for (const s of ['N', 'F']) {
    const spec = P['leg' + s] || P.leg || {a:[180, 180]};
    const [kn, an] = limbSide(hip, spec, FL.th, FL.sh, J, C, 'leg' + s);
    const sa = angOf(sub(an, kn));
    const fa = spec.f !== undefined ? spec.f : (spec.fr !== undefined ? sa + spec.fr : 90);
    J['kn' + s] = kn; J['an' + s] = an; J['sa' + s] = sa; J['ft' + s] = fa;
    J['heel' + s] = add(an, dir(fa), -FL.heel);
    J['toe' + s] = add(an, dir(fa), FL.toe);
  }
  return J;
}

/* Вид спереди: точки конечностей задаются в системе корпуса (x — наружу, y — вниз). */
function solveFront(P, C) {
  const c = P.c, ta = P.torso || 0;
  const u = dir(ta), n = [-u[1], u[0]];
  const neck = add(c, u, FL.torso);
  const shR = add(add(neck, n, 19), u, -3), shL = add(add(neck, n, -19), u, -3);
  const hipR = add(c, n, 9), hipL = add(c, n, -9);
  const head = add(neck, dir(ta + (P.head || 0)), FL.neck);
  const J = {view:'front', c, neck, head, u, n, ta, shR, shL, hipR, hipL};
  const down = [-u[0], -u[1]];
  const armPt = (root, out, q) => add(add(root, out, q[0]), down, q[1]);
  const legPt = (root, out, q) => add(add(root, out, q[0]), [0, 1], q[1]);
  for (const s of ['R', 'L']) {
    const out = s === 'R' ? n : [-n[0], -n[1]];
    const spec = P['arm' + s] || P.arm || {p:[[2, 29], [3, 56]]};
    const root = J['sh'+s];
    let el, wr;
    if (spec.ik) [el,wr] = ik2(root,spec.ik,FL.ua,FL.fa,spec.b,C,'arm'+s);
    else if (spec.v) {el=armPt(root,out,spec.v[0].map(v=>v*FL.ua));wr=armPt(el,out,spec.v[1].map(v=>v*FL.fa));}
    else {el=armPt(root,out,spec.p[0]);wr=armPt(root,out,spec.p[1]);}
    const d = spec.hA !== undefined ? dir(spec.hA) : unit(sub(wr, el));
    J['el' + s] = el; J['wr' + s] = wr;
    J['hand' + s] = add(wr, d, FL.hand); J['grip' + s] = add(wr, d, 3.5);
    J['fa' + s] = angOf(d);
    const ls = P['leg' + s] || P.leg || {p:[[3, 43], [5, 85]]};
    const lout = s === 'R' ? [1, 0] : [-1, 0];
    const kn = legPt(J['hip' + s], lout, ls.v ? ls.v[0].map(v=>v*FL.th) : ls.p[0]);
    const an = ls.v ? legPt(kn,lout,ls.v[1].map(v=>v*FL.sh)) : legPt(J['hip' + s],lout,ls.p[1]);
    J['kn' + s] = kn; J['an' + s] = an;
    const fd = ls.fd || [6, 3];
    J['toe' + s] = add(an, [lout[0] * fd[0], fd[1]]);
  }
  if (P.rot) {
    const pv = P.pivot || c, r = P.rot * D2R, cs = Math.cos(r), sn = Math.sin(r);
    const R = p => { const x = p[0] - pv[0], y = p[1] - pv[1]; return [pv[0] + x * cs - y * sn, pv[1] + x * sn + y * cs]; };
    for (const k in J) if (Array.isArray(J[k]) && J[k].length === 2 && !['u', 'n'].includes(k)) J[k] = R(J[k]);
    J.u = [J.u[0] * cs - J.u[1] * sn, J.u[0] * sn + J.u[1] * cs];
    J.n = [J.n[0] * cs - J.n[1] * sn, J.n[0] * sn + J.n[1] * cs];
  }
  return J;
}

function solvePose(anim, P, C) { if(anim.rig3d)return spatialPose(anim,P.spatialT||0); return anim.view === 'front' ? solveFront(P, C) : solveSide(P, C); }
/* Ключевые кадры: anim.keys = [P0, P1, …] или пара A/B */
function poseAt(anim, t) {
  if (anim.sample) return anim.sample(t);
  const K = anim.keys;
  if (!K) return lerpSpec(anim.A, anim.B || anim.A, t);
  const n = K.length - 1, x = Math.max(0, Math.min(n - 1e-9, t * n)), i = Math.floor(x);
  return lerpSpec(K[i], K[i + 1], x - i);
}
function prepAnim(anim) {
  normalizeAnimation(anim);
  if (anim.sample) {anim.A=anim.sample(0);anim.B=anim.sample(1);}
  if (!anim._C) {
    const C={__prime:true};
    for(let i=0;i<=32;i++) solvePose(anim,poseAt(anim,i/32),C);
    delete C.__prime;anim._C=C;
  }
}

/* Разрешение именованной точки для реквизита */
function pt(J, ref, off) {
  let p;
  if (Array.isArray(ref)) p = ref;
  else if (ref === 'grips') p = J.view === 'front' ? mid(J.gripR, J.gripL) : mid(J.gripN, J.gripF);
  else if (ref === 'tf') p = J.hip;
  else p = J[ref];
  if (!p) return [0, 0];
  return off ? add(p, off) : p;
}
function tfPt(J, q) { return add(add(J.hip, J.u, q[0]), J.n, q[1]); }

/* ---------- Реквизит ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const f1 = x => Math.round(x * 10) / 10;
function setLine(e, a, b) { e.setAttribute('x1', f1(a[0])); e.setAttribute('y1', f1(a[1])); e.setAttribute('x2', f1(b[0])); e.setAttribute('y2', f1(b[1])); }

const PROPS = {
  rect: {
    make(g, s) { el('rect', {x:s.x, y:s.y, width:s.w, height:s.h, rx:s.rx ?? 2.5, class:s.cls || 'eq-pad'}, g); },
    bounds(s) { return [[s.x, s.y], [s.x + s.w, s.y + s.h]]; }
  },
  line: {
    make(g, s) { el('polyline', {points:s.pts.map(p => p.join(',')).join(' '), class:s.cls || 'eq-steel', 'stroke-width':s.w || 4, fill:'none'}, g); },
    bounds(s) { return s.pts; }
  },
  circle: {
    make(g, s) { el('circle', {cx:s.c[0], cy:s.c[1], r:s.r, class:s.cls || 'eq-steel-f'}, g); },
    bounds(s) { return [[s.c[0] - s.r, s.c[1] - s.r], [s.c[0] + s.r, s.c[1] + s.r]]; }
  },
  plate: {
    make(g, s) { return {o:el('circle', {r:s.r || 16, class:'eq-plate'}, g), i:el('circle', {r:3.2, class:'eq-hub'}, g)}; },
    update(E, s, J) { const p = s.tf ? tfPt(J, s.tf) : pt(J, s.at || 'grips', s.off); for (const k of ['o', 'i']) { E[k].setAttribute('cx', f1(p[0])); E[k].setAttribute('cy', f1(p[1])); } },
    pts(s, J) { const r = s.r || 16; const p = s.tf ? tfPt(J, s.tf) : pt(J, s.at || 'grips', s.off); return [[p[0] - r, p[1] - r], [p[0] + r, p[1] + r]]; }
  },
  db: {
    make(g, s) {
      if ((s.o || 'end') === 'end') return {o:el('circle', {r:s.r || 7.5, class:'eq-plate'}, g), i:el('circle', {r:2.4, class:'eq-hub'}, g)};
      return {bar:el('line', {class:'eq-bar', 'stroke-width':3.2}, g), a:el('line', {class:'eq-plate-s', 'stroke-width':6.5}, g), b:el('line', {class:'eq-plate-s', 'stroke-width':6.5}, g)};
    },
    geom(s, J) {
      const p = pt(J, s.at || 'gripN', s.off);
      const o = s.o || 'end';
      if (o === 'end') return {p};
      let ax;
      const fa = J['fa' + (s.at || 'gripN').slice(-1)] ?? J.faN;
      if (o === 'h') ax = [1, 0]; else if (o === 'v') ax = [0, 1];
      else if (o === 'perp') ax = dir(fa + 90);
      else if (o === 'along') ax = dir(fa);
      let c = p;
      if (o === 'along') c = add(p, ax, 5);
      const L = (s.len || 22) / 2;
      return {p:c, a1:add(c, ax, -L), a2:add(c, ax, L), ax};
    },
    update(E, s, J) {
      const G = this.geom(s, J);
      if (E.o) { for (const k of ['o', 'i']) { E[k].setAttribute('cx', f1(G.p[0])); E[k].setAttribute('cy', f1(G.p[1])); } return; }
      setLine(E.bar, G.a1, G.a2);
      setLine(E.a, add(G.a1, G.ax, -0.5), add(G.a1, G.ax, 5)); setLine(E.b, add(G.a2, G.ax, -5), add(G.a2, G.ax, 0.5));
    },
    pts(s, J) { const G = this.geom(s, J); if (!G.a1) { const r = s.r || 7.5; return [[G.p[0] - r, G.p[1] - r], [G.p[0] + r, G.p[1] + r]]; } return [G.a1, G.a2]; }
  },
  kb: {
    make(g) { return {h:el('path', {class:'eq-bar', fill:'none', 'stroke-width':3}, g), b:el('circle', {r:9, class:'eq-plate'}, g)}; },
    geom(s, J) {
      const p = pt(J, s.at || 'grips', null);
      let d;
      if (s.down) d = [0, 1];
      else { const fa = J.view === 'front' ? J.faR : J.faN; d = dir(fa); }
      const c = add(p, d, s.dist || 11);
      return {p, c, d};
    },
    update(E, s, J) {
      const G = this.geom(s, J);
      E.b.setAttribute('cx', f1(G.c[0])); E.b.setAttribute('cy', f1(G.c[1]));
      const q = [-G.d[1], G.d[0]];
      const a = add(add(G.p, q, 5), G.d, 3), b = add(add(G.p, q, -5), G.d, 3), t = add(G.p, G.d, -3);
      E.h.setAttribute('d', `M${f1(a[0])},${f1(a[1])} Q${f1(t[0])},${f1(t[1])} ${f1(b[0])},${f1(b[1])}`);
    },
    pts(s, J) { const G = this.geom(s, J); return [[G.c[0] - 9, G.c[1] - 9], [G.c[0] + 9, G.c[1] + 9]]; }
  },
  cable: {
    make(g, s) { return {l:el('line', {class:'eq-cable', 'stroke-width':s.w || 1.6}, g), p:el('circle', {cx:s.from[0], cy:s.from[1], r:4.5, class:'eq-steel-f'}, g), h:s.handle ? el('circle', {r:3.2, class:'eq-steel-f'}, g) : null}; },
    update(E, s, J) { const p = pt(J, s.at, s.off); setLine(E.l, s.from, p); if (E.h) { E.h.setAttribute('cx', f1(p[0])); E.h.setAttribute('cy', f1(p[1])); } },
    pts(s, J) { return [s.from, pt(J, s.at, s.off)]; }
  },
  band: {
    make(g, s) { return {l:el('line', {class:s.cls || 'eq-band', 'stroke-width':s.cls ? 2 : 3}, g)}; },
    update(E, s, J) { setLine(E.l, Array.isArray(s.from) ? s.from : pt(J, s.from, s.foff), pt(J, s.at, s.off)); },
    pts(s, J) { return [Array.isArray(s.from) ? s.from : pt(J, s.from, s.foff), pt(J, s.at, s.off)]; }
  },
  seg: { /* звено тренажёра между двумя точками */
    make(g, s) { return {l:el('line', {class:s.cls || 'eq-steel', 'stroke-width':s.w || 4}, g)}; },
    update(E, s, J) { setLine(E.l, pt(J, s.a, s.aoff), pt(J, s.b, s.boff)); },
    pts(s, J) { return [pt(J, s.a, s.aoff), pt(J, s.b, s.boff)]; }
  },
  fbar: { /* штанга/рукоять во фронтальном виде */
    make(g, s) { return {l:el('line', {class:'eq-bar', 'stroke-width':s.w || 3.6}, g), a:s.plates ? el('line', {class:'eq-plate-s', 'stroke-width':6}, g) : null, b:s.plates ? el('line', {class:'eq-plate-s', 'stroke-width':6}, g) : null}; },
    geom(s, J) { const a = J.gripL, b = J.gripR, d = unit(sub(b, a)), e = s.ext || 12; return {a:add(a, d, -e), b:add(b, d, e), d}; },
    update(E, s, J) {
      const G = this.geom(s, J); setLine(E.l, G.a, G.b);
      if (E.a) { const q = [-G.d[1], G.d[0]]; setLine(E.a, add(G.a, q, -12), add(G.a, q, 12)); setLine(E.b, add(G.b, q, -12), add(G.b, q, 12)); }
    },
    pts(s, J) { const G = this.geom(s, J); return [add(G.a, [0, -12]), add(G.b, [0, 12])]; }
  },
  barcable: { /* трос от центра рукояти к блоку */
    make(g, s) { return {l:el('line', {class:'eq-cable', 'stroke-width':1.6}, g), p:el('circle', {cx:s.from[0], cy:s.from[1], r:4.5, class:'eq-steel-f'}, g)}; },
    update(E, s, J) { setLine(E.l, s.from, mid(J.gripL, J.gripR)); },
    pts(s, J) { return [s.from, mid(J.gripL, J.gripR)]; }
  },
  roller: { /* валик тренажёра у голени */
    make(g, s) { return {lv:s.pivot ? el('line', {class:'eq-steel', 'stroke-width':3.5}, g) : null, r:el('circle', {r:s.r || 6.5, class:'eq-pad'}, g)}; },
    geom(s, J) { const k = s.leg || 'N'; const an = J['an' + k], sa = J['sa' + k]; return add(add(an, dir(sa), s.up ?? -7), dir(sa + (s.side ?? -90)), s.out ?? 8); },
    update(E, s, J) { const p = this.geom(s, J); E.r.setAttribute('cx', f1(p[0])); E.r.setAttribute('cy', f1(p[1])); if (E.lv) setLine(E.lv, s.pivot, p); },
    pts(s, J) { const p = this.geom(s, J); return [[p[0] - 7, p[1] - 7], [p[0] + 7, p[1] + 7]]; }
  },
  platform: { /* платформа жима ногами, перпендикулярна салазкам */
    make(g) { return {l:el('line', {class:'eq-steel', 'stroke-width':5}, g)}; },
    geom(s, J) { const base = s.at === 'toeN' ? J.toeN : J.anN; const d = dir(s.ang); const c = add(base, d, s.gap ?? 5); const q = [-d[1], d[0]]; return [add(c, q, -26), add(c, q, 22)]; },
    update(E, s, J) { const G = this.geom(s, J); setLine(E.l, G[0], G[1]); },
    pts(s, J) { return this.geom(s, J); }
  }
};

/* ---------- Сборка SVG фигуры ---------- */
const MUSCLE_SEG = {chest:'torso', abs:'torso', obliques:'torso', lats:'torso', midback:'torso', lowback:'torso', traps:'torso',
  delt_f:'ua', delt_s:'ua', delt_r:'ua', biceps:'ua', triceps:'ua', forearms:'fa', glutes:'th', quads:'th', hams:'th', calves:'sh'};

function torsoPathSide(J) {
  const p = (a, b) => torsoPoint(J,a,b);
  const pts = [p(-3, 10), p(18, 9), p(...SIDE_CHEST), p(50, 10.5), p(57, 3), p(55, -8), p(38, -10), p(16, -9), p(-4, -11), p(-11, -1)];
  return closedSpline(pts);
}
function torsoPathFront(J) {
  const q = (x, y) => add(add(J.c, J.n, x), J.u, y);
  const half = [[0, -12], [11, -8], [14, 4], [13, 18], [17, 34], [22, 46.5], [14, 52], [6, 54]];
  const pts = half.map(([x, y]) => q(x, y)).concat(half.slice(1).reverse().map(([x, y]) => q(-x, y)));
  return closedSpline(pts);
}
function closedSpline(P) {
  const n = P.length; let d = `M${f1(P[0][0])},${f1(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + 'Z';
}

function animBounds(anim) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const eat = (p, r = 0) => { x0 = Math.min(x0, p[0] - r); y0 = Math.min(y0, p[1] - r); x1 = Math.max(x1, p[0] + r); y1 = Math.max(y1, p[1] + r); };
  const C = anim._C;
  for (let k = 0; k <= 40; k++) {
    const J = solvePose(anim, poseAt(anim, k / 40), C);
    for (const k in J) if (Array.isArray(J[k]) && J[k].length === 2 && !['u', 'n','chestU','chestN'].includes(k)) eat(J[k], 7);
    eat(J.head, FL.headR + 2);
    for (const s of anim.props || []) {
      const T = PROPS[s.k];
      if (T.pts) for (const p of T.pts(s, J)) eat(p, 3);
    }
  }
  for (const s of anim.props || []) { const T = PROPS[s.k]; if (T.bounds) for (const p of T.bounds(s)) eat(p, 2); }
  return [x0, y0, x1, y1];
}

// Rounded, tapered limbs remain neutral; the separate map carries muscle emphasis.
let athleteSerial=0;
function athletePalette(svg) {
  const prefix='athlete-'+(++athleteSerial),defs=el('defs',{},svg),fills={};
  /* цвета берутся из токенов темы (--ath-*), поэтому фигура перекрашивается вместе со страницей */
  for(const name of ['skin','far','kit','shorts','shoe']){
    const id=prefix+'-'+name,g=el('linearGradient',{id,x1:'0%',y1:'0%',x2:'100%',y2:'30%'},defs);
    [0,.42,1].forEach((off,i)=>{const st=el('stop',{offset:off},g);st.style.stopColor=`var(--ath-${name}-${i})`;});fills[name]='url(#'+id+')';
  }
  return fills;
}
function bonePath(a,b,width,kind='ua') {
  const delta=sub(b,a),u=unit(delta),n=[-u[1],u[0]],L=vlen(delta),r=width/2;
  const p=(t,q)=>add(add(a,u,t*L),n,q);
  if(kind==='hd')return closedSpline([p(-.08,-r*.55),p(.4,-r*.72),p(.9,-r*.65),p(1.1,0),p(.8,r*.63),p(.28,r*.68),p(.18,r*1.18),p(-.05,r*.65)]);
  if(kind==='ft')return closedSpline([p(-.02,-r*.55),p(.36,-r*1.4),p(.73,-r*.65),p(1.08,-r*.25),p(1.14,r*.6),p(.82,r*1.2),p(.04,r*1.2),p(-.07,r*.7)]);
  const bulk=kind==='th'?1.16:kind==='sh'?1.1:1.04,distal=kind==='fa'?.55:kind==='sh'?.52:.76;
  return closedSpline([p(-.05,0),p(.04,-r*.9),p(.29,-r*bulk),p(.67,-r*.83),p(.97,-r*distal),p(1.06,0),p(.97,r*distal),p(.61,r*.76),p(.24,r*bulk),p(.02,r*.84)]);
}
function makeBodyDetail(parent,view,palette) {
  const g=el('g',{'aria-hidden':'true'},parent);
  const shortsLeg=el('path',{class:'athlete-shorts-leg',style:'fill:'+palette.shorts},g);
  const pelvis=el('path',{class:'athlete-shorts',style:'fill:'+palette.shorts},g);
  const seam=el('path',{class:'athlete-seam'},g);
  const face=el('path',{class:'athlete-face'},g);
  const ear=el('circle',{r:1.8,class:'athlete-ear'},g);
  const dots=el('g',{class:'rig-dots'},g);
  const names=view==='front'?['shR','shL','elR','elL','wrR','wrL','hipR','hipL','knR','knL','anR','anL']:['sh','elN','wrN','hip','knN','anN'];
  const joints=names.map(name=>[name,el('circle',{r:2.1,class:'joint-dot'},dots)]);
  const f=v=>`${f1(v[0])},${f1(v[1])}`;
  return J=>{
    if(J.view==='front'){
      const p=(x,y)=>add(add(J.c,J.n,x),J.u,y);
      const pr=J.hipR,pl=J.hipL;
      pelvis.setAttribute('d',closedSpline([p(-13,9),p(13,9),add(pr,unit(sub(J.knR,pr)),18),add(add(pr,unit(sub(J.knR,pr)),18),J.n,-7),p(0,-9),add(add(pl,unit(sub(J.knL,pl)),18),J.n,7),add(pl,unit(sub(J.knL,pl)),18)]));
      shortsLeg.setAttribute('d','');
      seam.setAttribute('d',`M${f(p(-14,43))} Q${f(p(0,38))} ${f(p(14,43))} M${f(p(0,37))} L${f(p(0,20))} M${f(p(-12,8))} Q${f(p(0,5))} ${f(p(12,8))}`);
      face.setAttribute('d',`M${f(add(J.head,J.u,1))} l0,3`);ear.setAttribute('display','none');
    }else{
      const h=J.hip,th=unit(sub(J.knN,h)),nt=[-th[1],th[0]],p=(a,b)=>torsoPoint(J,a,b);
      pelvis.setAttribute('d',closedSpline([p(10,-9),p(10,9),p(-3,10),p(-10,0),p(-4,-11)]));
      shortsLeg.setAttribute('d',bonePath(h,add(h,th,18),13.7,'th'));
      seam.setAttribute('d',`M${f(p(11,-8))} Q${f(p(8,0))} ${f(p(11,8))} M${f(p(43,7))} Q${f(p(35,5))} ${f(p(29,9))}`);
      const n=J.chestN||J.n,u=J.chestU||J.u;
      face.setAttribute('d',`M${f(add(add(J.head,n,7.8),u,2))} L${f(add(J.head,n,11.3))} L${f(add(add(J.head,n,7.5),u,-3.8))}`);
      const e=add(J.head,n,-2.5);ear.setAttribute('display','inline');ear.setAttribute('cx',f1(e[0]));ear.setAttribute('cy',f1(e[1]));
    }
    joints.forEach(([name,node])=>{node.setAttribute('cx',f1(J[name][0]));node.setAttribute('cy',f1(J[name][1]));});
  };
}

/* ---------- Векторы движения: куда смещаются суставы за рабочую (концентрическую) фазу ----------
   Считаются из самих поз, поэтому показывают не только кисти: в тяге к животу видно отклонение плеч,
   в приседе — ход таза. Для eccFirst-упражнений рабочая фаза идёт от нижней точки к верхней. */
const VEC_JOINTS = {
  side:['sh', 'hip', 'elN', 'gripN', 'knN', 'anN'],
  front:['shL', 'shR', 'elL', 'elR', 'gripL', 'gripR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR'],
  spatial:['sh', 'hip', 'elL', 'elR', 'gripL', 'gripR', 'knL', 'knR', 'anL', 'anR']
};
let vecSerial = 0;
function poseFor(anim, t, camera) {
  if (anim.rig3d) { const saved = anim.camera; if (camera) anim.camera = camera; const J = spatialPose(anim, t); anim.camera = saved; return J; }
  return solvePose(anim, poseAt(anim, t), anim._C);
}
function vectorPairs(anim, camera) {
  /* циклические многокадровые движения (бёрпи, прыжки) стрелками не описываются, кроме явно разрешённых */
  if (anim.hold || (anim.keys && anim.keys.length > 2 && !anim.vectors)) return [];
  const t0 = anim.eccFirst ? 1 : 0, t1 = anim.eccFirst ? 0 : 1;
  const J0 = poseFor(anim, t0, camera), Jm = poseFor(anim, 0.5, camera), J1 = poseFor(anim, t1, camera);
  let names = anim.vecJoints || VEC_JOINTS[J0.view] || [];
  /* дальняя конечность — только если она движется иначе, чем ближняя (выпады, попеременная работа) */
  if (J0.view === 'side') for (const [n, f] of [['elF', 'elN'], ['gripF', 'gripN'], ['knF', 'knN'], ['anF', 'anN']]) {
    if (J0[n] && J0[f] && (Math.hypot(J0[n][0] - J0[f][0], J0[n][1] - J0[f][1]) > 8 || Math.hypot(J1[n][0] - J1[f][0], J1[n][1] - J1[f][1]) > 8)) names = names.concat(n);
  }
  const out = [];
  for (const n of names) {
    const a = J0[n], m = Jm[n], b = J1[n]; if (!a || !b) continue;
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < (/^(el|kn)/.test(n) ? 11 : 7)) continue;
    /* не рисуем стрелку, если точка просто повторяет соседний сустав (кисть при прямой руке и т. п.) */
    if (out.some(o => Math.hypot(o.a[0] - a[0], o.a[1] - a[1]) < 5 && Math.hypot(o.b[0] - b[0], o.b[1] - b[1]) < 5)) continue;
    out.push({name:n, a, m:m || mid(a, b), b});
  }
  return out;
}
function vectorGroup(svg, anim, camera) {
  const g = el('g', {class:'motion-vec', 'aria-hidden':'true', display:'none'}, svg);
  const id = 'vec-arrow-' + (++vecSerial), defs = el('defs', {}, g);
  for (const kind of ['limb', 'core']) {
    const mk = el('marker', {id:id + '-' + kind, viewBox:'0 0 10 10', refX:'7', refY:'5', markerWidth:'5', markerHeight:'5', orient:'auto-start-reverse'}, defs);
    el('path', {d:'M0,0 L10,5 L0,10 Z', class:'vec-head vec-' + kind}, mk);
  }
  for (const v of vectorPairs(anim, camera)) {
    const dx = v.b[0] - v.a[0], dy = v.b[1] - v.a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const a = [v.a[0] + ux * 2.5, v.a[1] + uy * 2.5], b = [v.b[0] - ux * 2.5, v.b[1] - uy * 2.5];
    /* дуга через середину фазы: сгибания и махи идут по окружности, а не по прямой */
    const c = [2 * v.m[0] - (a[0] + b[0]) / 2, 2 * v.m[1] - (a[1] + b[1]) / 2];
    const kind = /^(head|sh|hip)/.test(v.name) ? 'vec-core' : 'vec-limb';
    el('path', {d:`M${f1(a[0])},${f1(a[1])} Q${f1(c[0])},${f1(c[1])} ${f1(b[0])},${f1(b[1])}`, class:'vec-line ' + kind, 'marker-end':`url(#${id}-${kind.slice(4)})`}, g);
    el('circle', {cx:f1(v.a[0]), cy:f1(v.a[1]), r:1.7, class:'vec-dot ' + kind}, g);
  }
  return show => g.setAttribute('display', show ? 'inline' : 'none');
}

function buildFigure(anim, opts = {}) {
  if(anim.catalogRig)return buildSpatialFigure(catalogFigureAnim(anim),opts);
  if(anim.rig3d)return buildSpatialFigure(anim,opts);
  const ratio = opts.ratio || 1;
  prepAnim(anim);
  let [x0, y0, x1, y1] = animBounds(anim);
  const groundOn = !anim.noGround && anim.view !== 'top';
  if (groundOn) y1 = Math.max(y1, GROUND + 6);
  let w = x1 - x0 + 20, h = y1 - y0 + 20;
  const minH = opts.minH || 150;
  if (h < minH) h = minH;
  if (w / h < ratio) w = h * ratio; else h = w / ratio;
  /* запас сверху под бейдж «Увеличить» и снизу под подпись ракурса */
  h *= 1.22; w = h * ratio;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - h * 0.02;
  let vx = cx - w / 2, vy = cy - h / 2;
  if (groundOn && vy + h < GROUND + 14) vy = GROUND + 14 - h;
  const svg = el('svg', {viewBox:`${f1(vx)} ${f1(vy)} ${f1(w)} ${f1(h)}`, class:'fig', role:'img', 'aria-label':opts.label || ''});
  if (groundOn) el('line', {x1:vx - 5, y1:GROUND + 1.5, x2:vx + w + 5, y2:GROUND + 1.5, class:'ground'}, svg);
  const palette=athletePalette(svg);
  const work = new Set();
  // Muscle emphasis belongs to the anatomical map, not whole limb segments.
  const layers = {};
  const mk = (name) => (layers[name] = el('g', {}, svg));
  const E = {};
  const widths={};
  const seg = (g,key,w) => {widths[key]=w;return E[key]=el('path',{class:'bone',style:'fill:'+palette[key.startsWith('ft')?'shoe':key.endsWith('F')?'far':'skin']},g);};
  const H = {};
  const halo = (g, key, w) => (H[key] = el('line', {'stroke-width':w + 3.2, class:'halo'}, g));
  const trace = el('path',{class:'motion-trace',display:'none','aria-hidden':'true'},svg);
  const tracePoints=[];
  for(let k=0;k<=48;k++){const J=solvePose(anim,poseAt(anim,k/48),anim._C);tracePoints.push(J.view==='front'?J.gripR:J.gripN);}
  trace.setAttribute('d',tracePoints.map((p,i)=>`${i?'L':'M'}${f1(p[0])},${f1(p[1])}`).join(' '));
  const setTrace=show=>trace.setAttribute('display',show?'inline':'none');
  mk('back');
  const ghost = opts.ghost ? el('g', {class:'ghost'}, svg) : null;
  const figG = el('g', {}, svg);
  if (anim.view === 'front') {
    const legs = el('g', {}, figG);
    for (const s of ['R', 'L']) { seg(legs, 'th' + s, 13, 'th'); seg(legs, 'sh' + s, 10.5, 'sh'); seg(legs, 'ft' + s, 6, 'ft'); }
    E.torsoHalo = el('path', {class:'torso-halo'}, figG);
    E.torso = el('path', {class:'torso',style:'fill:'+palette.kit}, figG);
    E.neck = el('line', {'stroke-width':9, class:'seg'}, figG);
    E.head = el('ellipse', {rx:8.5,ry:10,class:'head',style:'fill:'+palette.skin}, figG);
    layers.mid = el('g', {}, figG);
    const arms = el('g', {}, figG);
    for (const s of ['R', 'L']) { halo(arms, 'ua' + s, 10); halo(arms, 'fa' + s, 8.5); halo(arms, 'hd' + s, 7); }
    for (const s of ['R', 'L']) { seg(arms, 'ua' + s, 10, 'ua'); seg(arms, 'fa' + s, 8.5, 'fa'); seg(arms, 'hd' + s, 7, 'hd'); }
  } else {
    const far = el('g', {class:'far'}, figG);
    seg(far, 'thF', 12.5, 'th'); seg(far, 'shF', 10.5, 'sh'); seg(far, 'ftF', 6, 'ft');
    seg(far, 'uaF', 9.5, 'ua'); seg(far, 'faF', 8, 'fa'); seg(far, 'hdF', 7, 'hd');
    layers.farProps = el('g', {}, figG);
    E.torso = el('path', {class:'torso',style:'fill:'+palette.kit}, figG);
    E.neck = el('line', {'stroke-width':8.5, class:'seg'}, figG);
    E.head = el('ellipse', {rx:8.5,ry:10,class:'head',style:'fill:'+palette.skin}, figG);
    const near = el('g', {}, figG);
    halo(near, 'thN', 13); halo(near, 'shN', 11); halo(near, 'ftN', 6);
    seg(near, 'thN', 13, 'th'); seg(near, 'shN', 11, 'sh'); seg(near, 'ftN', 6, 'ft');
    layers.mid = el('g', {}, figG);
    const nearArm = el('g', {}, figG);
    halo(nearArm, 'uaN', 10); halo(nearArm, 'faN', 8.5); halo(nearArm, 'hdN', 7.5);
    seg(nearArm, 'uaN', 10, 'ua'); seg(nearArm, 'faN', 8.5, 'fa'); seg(nearArm, 'hdN', 7.5, 'hd');
  }
  const drawDetails=makeBodyDetail(figG,anim.view,palette);
  mk('front');
  const P = [];
  for (const s of anim.props || []) {
    const T = PROPS[s.k];
    if (s.if && opts.has && !opts.has(s.if)) continue;
    const layer = layers[s.layer || (T.update ? 'mid' : 'back')] || layers.back;
    const made = T.make(layer, s);
    if (T.update) P.push([T, made, s]);
  }
  const L2 = (k,a,b) => {E[k].setAttribute('d',bonePath(a,b,widths[k],k.slice(0,2)));if(H[k])setLine(H[k],a,b);};
  function draw(J) {
    if (J.view === 'front') {
      for (const s of ['R', 'L']) {
        L2('th' + s, J['hip' + s], J['kn' + s]); L2('sh' + s, J['kn' + s], J['an' + s]); L2('ft' + s, J['an' + s], J['toe' + s]);
        L2('ua' + s, J['sh' + s], J['el' + s]); L2('fa' + s, J['el' + s], J['wr' + s]); L2('hd' + s, J['wr' + s], J['hand' + s]);
      }
      const tp = torsoPathFront(J);
      E.torso.setAttribute('d', tp); E.torsoHalo.setAttribute('d', tp);
      setLine(E.neck, J.neck, J.head);
    } else {
      for (const s of ['N', 'F']) {
        L2('th' + s, J.hip, J['kn' + s]); L2('sh' + s, J['kn' + s], J['an' + s]); L2('ft' + s, J['heel' + s], J['toe' + s]);
        L2('ua' + s, J.sh, J['el' + s]); L2('fa' + s, J['el' + s], J['wr' + s]); L2('hd' + s, J['wr' + s], J['hand' + s]);
      }
      E.torso.setAttribute('d', torsoPathSide(J));
      setLine(E.neck, add(J.sh, J.u, -2), J.head);
    }
    E.head.setAttribute('cx', f1(J.head[0])); E.head.setAttribute('cy', f1(J.head[1]));
    E.head.setAttribute('transform',`rotate(${f1(J.upperTa??J.ta)} ${f1(J.head[0])} ${f1(J.head[1])})`);
    drawDetails(J);
    for (const [T, made, s] of P) T.update(made, s, J);
  }
  if (ghost) {
    const J0 = solvePose(anim, anim.A, anim._C);
    const g = el('path', {class:'ghost-body', d:(J0.view === 'front' ? torsoPathFront(J0) : torsoPathSide(J0))}, ghost);
    const segs = J0.view === 'front'
      ? ['R', 'L'].flatMap(s => [[J0['hip' + s], J0['kn' + s]], [J0['kn' + s], J0['an' + s]], [J0['sh' + s], J0['el' + s]], [J0['el' + s], J0['wr' + s]]])
      : ['N', 'F'].flatMap(s => [[J0.hip, J0['kn' + s]], [J0['kn' + s], J0['an' + s]], [J0.sh, J0['el' + s]], [J0['el' + s], J0['wr' + s]]]);
    for (const [a, b] of segs) { const l = el('line', {'stroke-width':9, class:'ghost-seg'}, ghost); setLine(l, a, b); }
    el('circle', {cx:J0.head[0], cy:J0.head[1], r:FL.headR, class:'ghost-seg-f'}, ghost);
  }
  function at(t) { draw(solvePose(anim, poseAt(anim, t), anim._C)); }
  at(opts.t ?? 0);
  const setVectors = vectorGroup(svg, anim);
  return {svg, at, setTrace, setVectors};
}

/* Плавный цикл: подъём — пауза — возврат — пауза */
function cycleT(ms, period = 2800) {
  const x = (ms % period) / period;
  const ease = v => 0.5 - 0.5 * Math.cos(Math.PI * v);
  if (x < 0.4) return ease(x / 0.4);
  if (x < 0.5) return 1;
  if (x < 0.9) return 1 - ease((x - 0.5) / 0.4);
  return 0;
}

/* ===================== КАРТА МЫШЦ ===================== */
const MAP_FRONT = [
  ['head', 'e', [50, 15, 9, 11]],
  ['neck', 'p', [[46, 25], [54, 25], [55, 33], [45, 33]]],
  ['traps', 'p', [[54, 29], [63, 36], [55, 38]]],
  ['delt_f', 'p', [[64, 36], [73, 36], [80, 42], [82, 53], [78, 61], [73, 54], [69, 45], [64, 40]]],
  ['chest', 'p', [[51, 40], [64, 41], [70, 47], [72, 56], [66, 64], [57, 66], [51, 65]]],
  ['biceps', 'p', [[74, 59], [79, 61], [83, 69], [83, 81], [80, 87], [76, 83], [73, 71]]],
  ['forearms', 'p', [[76, 90], [82, 89], [87, 99], [89, 115], [88, 123], [84, 123], [80, 109], [76, 98]]],
  ['hand', 'p', [[84, 125], [89, 125], [91, 133], [88, 139], [84, 136]]],
  ['abs', 'r', [51, 68, 7, 8]], ['abs', 'r', [51, 78, 7, 8]], ['abs', 'r', [51, 88, 7, 8]], ['abs', 'r', [51, 98, 6.5, 13]],
  ['obliques', 'p', [[59, 68], [66, 66], [69, 80], [68, 96], [63, 106], [59, 103]]],
  ['pelvis', 'p', [[50, 113], [58, 113], [64, 108], [69, 104], [70, 112], [62, 116], [52, 121], [50, 122]]],
  ['quads', 'p', [[54, 120], [63, 116], [70, 115], [72, 128], [70, 146], [66, 157], [59, 157], [55, 146], [53, 132]]],
  ['adduct', 'p', [[51, 124], [53, 122], [54, 140], [56, 150], [52, 146]]],
  ['knee', 'e', [62, 161, 4.5, 4]],
  ['calves', 'p', [[57, 166], [65, 165], [67, 176], [64, 194], [59, 194], [57, 180]]],
  ['foot', 'p', [[58, 196], [64, 196], [68, 203], [57, 203]]]
];
const MAP_BACK = [
  ['head', 'e', [50, 15, 9, 11]],
  ['neck', 'p', [[46, 25], [54, 25], [55, 31], [45, 31]]],
  ['traps', 'p', [[50, 27], [55, 30], [66, 36], [60, 41], [54, 54], [50, 60]]],
  ['delt_r', 'p', [[67, 36], [75, 37], [81, 43], [82, 53], [78, 58], [72, 48]]],
  ['midback', 'p', [[51, 61], [55, 55], [61, 42], [69, 44], [71, 52], [63, 59], [53, 66]]],
  ['lats', 'p', [[53, 68], [64, 61], [72, 54], [74, 62], [71, 77], [63, 90], [55, 94]]],
  ['lowback', 'p', [[51, 70], [52, 70], [56, 93], [57, 107], [51, 110]]],
  ['triceps', 'p', [[74, 58], [80, 60], [84, 68], [84, 81], [80, 87], [76, 80], [73, 68]]],
  ['forearms', 'p', [[76, 90], [82, 89], [87, 99], [89, 115], [88, 123], [84, 123], [80, 109], [76, 98]]],
  ['hand', 'p', [[84, 125], [89, 125], [91, 133], [88, 139], [84, 136]]],
  ['flank', 'p', [[57, 96], [64, 91], [68, 98], [68, 106], [58, 108]]],
  ['glutes', 'p', [[51, 111], [59, 109], [68, 110], [71, 121], [68, 131], [59, 133], [51, 130]]],
  ['hams', 'p', [[53, 136], [61, 135], [70, 134], [71, 147], [67, 158], [58, 158], [54, 148]]],
  ['knee', 'e', [62, 162, 4.5, 3.5]],
  ['calves', 'p', [[57, 166], [65, 165], [68, 177], [65, 189], [60, 191], [56, 180]]],
  ['foot', 'p', [[58, 194], [64, 194], [65, 203], [57, 203]]]
];
const MUSCLE_NAMES = {chest:'Грудные', delt_f:'Передняя дельта', delt_s:'Средняя дельта', delt_r:'Задняя дельта', biceps:'Бицепс', triceps:'Трицепс',
  forearms:'Предплечья', abs:'Прямая мышца живота', obliques:'Косые мышцы живота', traps:'Трапеции', midback:'Ромбовидные и середина спины',
  lats:'Широчайшие', lowback:'Разгибатели спины', glutes:'Ягодичные', quads:'Квадрицепс', hams:'Бицепс бедра', calves:'Икроножные'};

function mirrorShape(kind, d) {
  if (kind === 'p') return d.map(([x, y]) => [100 - x, y]);
  if (kind === 'r') return [100 - d[0] - d[2], d[1], d[2], d[3]];
  if (kind === 'e') return [100 - d[0], d[1], d[2], d[3]];
}
function shapeSvg(kind, d, attrs) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  if (kind === 'p') return `<polygon points="${d.map(p => p.join(',')).join(' ')}" ${a}/>`;
  if (kind === 'r') return `<rect x="${d[0]}" y="${d[1]}" width="${d[2]}" height="${d[3]}" rx="1.6" ${a}/>`;
  if (kind === 'e') return `<ellipse cx="${d[0]}" cy="${d[1]}" rx="${d[2]}" ry="${d[3]}" ${a}/>`;
}
/* level: {muscle: 0..1}. delt_s подсвечивает переднюю и заднюю дельту частично */
function muscleMapSvg(level, opts = {}) {
  const lv = m => {
    if (m === 'delt_f') return Math.max(level.delt_f || 0, (level.delt_s || 0) * 0.8);
    if (m === 'delt_r') return Math.max(level.delt_r || 0, (level.delt_s || 0) * 0.8);
    return level[m] || 0;
  };
  const neutral = new Set(['head', 'neck', 'hand', 'pelvis', 'adduct', 'knee', 'foot', 'flank']);
  const view = (shapes, dx, label) => {
    let s = `<g transform="translate(${dx},0)">`;
    for (const [m, kind, d] of shapes) {
      for (const dd of (d === undefined ? [] : [d, mirrorShape(kind, d)])) {
        const v = neutral.has(m) ? 0 : lv(m);
        s += shapeSvg(kind, dd, {class: neutral.has(m) ? 'mm-n' : 'mm-b'});
        if (v > 0) s += shapeSvg(kind, dd, {class:'mm-h', 'fill-opacity':(0.18 + 0.82 * v).toFixed(2)});
      }
    }
    if (opts.labels) s += `<text x="50" y="216" class="mm-l">${label}</text>`;
    return s + '</g>';
  };
  const H = opts.labels ? 222 : 207;
  return `<svg viewBox="0 0 206 ${H}" class="mmap" role="img" aria-label="${opts.aria || 'Карта мышц'}">${view(MAP_FRONT, 0, 'спереди')}${view(MAP_BACK, 106, 'сзади')}</svg>`;
}

/* ===================== БАЗА УПРАЖНЕНИЙ ===================== */
const EQUIP = [
  {id:'db', name:'Гантели', cat:'free'}, {id:'bb', name:'Штанга', cat:'free'}, {id:'kb', name:'Гиря', cat:'free'},
  {id:'band', name:'Эспандер-лента', cat:'free'}, {id:'abwheel', name:'Ролик для пресса', cat:'free'},
  {id:'bench', name:'Горизонтальная скамья', cat:'bench'},
  {id:'incline', name:'Регулируемая скамья', cat:'bench', hint:'наклон спинки и вертикальная спинка; раскладывается в горизонтальную'},
  {id:'decline', name:'Скамья с обратным наклоном', cat:'bench', hint:'головой вниз, с валиками для ног; подходит и для пресса'},
  {id:'abbench', name:'Скамья для пресса', cat:'bench', hint:'наклонная доска с упором для ног'},
  {id:'preacher', name:'Скамья Скотта', cat:'bench', hint:'упор под плечи для сгибаний на бицепс'},
  {id:'pullup', name:'Турник', cat:'bars'}, {id:'dipbars', name:'Брусья', cat:'bars'},
  {id:'captain', name:'Стойка для пресса', cat:'bars', hint:'упор на предплечья и спинка, ноги свисают'},
  {id:'cable', name:'Блочный тренажёр', cat:'mach'}, {id:'smith', name:'Машина Смита', cat:'mach'}, {id:'legpress', name:'Жим ногами', cat:'mach'},
  {id:'legext', name:'Разгибание ног', cat:'mach'}, {id:'legcurl', name:'Сгибание ног', cat:'mach'}, {id:'pecdeck', name:'Бабочка', cat:'mach'},
  {id:'hyper', name:'Гиперэкстензия', cat:'mach'}
];
const EQUIP_CATS = [{id:'free', name:'Свободные веса и инвентарь'}, {id:'bench', name:'Скамьи'}, {id:'bars', name:'Турник и стойки'}, {id:'mach', name:'Тренажёры'}];
/* что даёт оборудование «в придачу»: регулируемая скамья раскладывается в горизонтальную, на скамье с обратным наклоном можно качать пресс */
const EQUIP_IMPLIES = {incline:['bench'], decline:['abbench']};
const EQUIP_PRESETS = [
  {id:'none', name:'Без снаряжения', eq:[]},
  {id:'home', name:'Дома', eq:['db', 'band', 'abwheel']},
  {id:'street', name:'Турник и брусья', eq:['pullup', 'dipbars']},
  {id:'homegym', name:'Домашний зал', eq:['db', 'bb', 'kb', 'band', 'abwheel', 'incline', 'pullup', 'dipbars']},
  {id:'gym', name:'Зал', eq:EQUIP.map(e => e.id)}
];
const GROUPS = [
  {id:'chest', name:'Грудь'}, {id:'back', name:'Спина'}, {id:'shoulders', name:'Плечи'}, {id:'biceps', name:'Бицепс'},
  {id:'triceps', name:'Трицепс'}, {id:'forearms', name:'Предплечья'}, {id:'abs', name:'Пресс'}, {id:'glutes', name:'Ягодицы'},
  {id:'quads', name:'Квадрицепс'}, {id:'hams', name:'Бицепс бедра'}, {id:'calves', name:'Икры'}, {id:'cardio', name:'Кардио'}
];
const GROUP_PRESETS = [
  {id:'push', name:'Жим', g:['chest', 'shoulders', 'triceps']},
  {id:'pull', name:'Тяга', g:['back', 'biceps', 'forearms']},
  {id:'legs', name:'Ноги', g:['quads', 'hams', 'glutes', 'calves']},
  {id:'upper', name:'Верх', g:['chest', 'back', 'shoulders', 'biceps', 'triceps']},
  {id:'full', name:'Всё тело', g:['chest', 'back', 'shoulders', 'quads', 'hams', 'glutes', 'abs']}
];
const MUSCLE_GROUP = {chest:'chest', delt_f:'shoulders', delt_s:'shoulders', delt_r:'shoulders', biceps:'biceps', triceps:'triceps',
  forearms:'forearms', abs:'abs', obliques:'abs', traps:'back', midback:'back', lats:'back', lowback:'back', glutes:'glutes',
  quads:'quads', hams:'hams', calves:'calves'};

/* ---------- помощники для поз ---------- */
const legsAt = (x, y = 180, b = 'fwd', f = 90) => ({legN:{ik:[x, y], b, f}, legF:{ik:[x, y], b, f}});
const stand = (o = {}) => Object.assign({hip:[92, 97], torso:0, arm:{a:[180, 180]}}, legsAt(98), o);
const frontStand = (o = {}) => Object.assign({c:[100, 97], leg:{p:[[3, 43], [5, 85]]}}, o);
const frontSeat = (o = {}) => Object.assign({c:[100, 130], leg:{p:[[5, 13], [8, 50]]}}, o);
const benchFlat = (x0, x1, top, legs = true) => [
  {k:'rect', x:x0, y:top, w:x1 - x0, h:8},
  ...(legs ? [{k:'line', pts:[[x0 + 12, top + 8], [x0 + 12, GROUND]], w:4}, {k:'line', pts:[[x1 - 12, top + 8], [x1 - 12, GROUND]], w:4}] : [])
];
const lineBody = (ankle, a) => ({hip:add(ankle, dir(a), 85), torso:a});
const plankA = (ankle, a, extra) => Object.assign(lineBody(ankle, a), {leg:{a:[a + 180, a + 180], fr:-90}}, extra);
const hipFromSh = (sh, a) => add(sh, dir(a), -FL.torso);
function inclineBench(hip, a) {
  const u = dir(a), n = [-u[1], u[0]];
  const b0 = add(add(hip, u, -6), n, -12.5), b1 = add(add(hip, u, 62), n, -12.5);
  return [
    {k:'line', pts:[b0, b1], w:8, cls:'eq-pad-s'},
    {k:'rect', x:hip[0] - 14, y:hip[1] + 10, w:46, h:7},
    {k:'line', pts:[[hip[0] + 8, hip[1] + 17], [hip[0] + 8, GROUND]], w:4},
    {k:'line', pts:[[b0[0] + 4, b0[1] + 4], [b1[0] + 8, GROUND - 4], [b1[0] + 8, GROUND]], w:3}
  ];
}
const DB_SIDES = (o = 'end', iff) => [{k:'db', at:'gripF', o, layer:'farProps', if:iff}, {k:'db', at:'gripN', o, layer:'front', if:iff}];
const PLATE = (r = 16, extra = {}) => Object.assign({k:'plate', at:'grips', r, layer:'mid'}, extra);

/* ---------- упражнения ---------- */
const EX = [
/* ===== ГРУДЬ ===== */
{id:'pushup', name:'Отжимания от пола', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f', 'abs'], type:'c', lvl:1,
 tech:['Ладони чуть шире плеч, пальцы направлены вперёд. Тело — прямая линия от пяток до макушки, ягодицы и пресс напряжены.',
   'Опускайтесь, сгибая локти под углом 30–45° к корпусу, пока грудь не окажется в 2–3 см от пола.',
   'Выжмите себя вверх, отталкивая пол, до полного выпрямления рук; плечи не проваливаются.'],
 err:['Провисание поясницы или поднятый таз', 'Локти разведены в стороны под 90°', 'Неполная амплитуда'],
 breath:'Вдох при опускании, выдох при подъёме.',
 anim:{view:'side',
  A:plankA([10, 171], 70.4, {arm:{ik:[139, 181], b:'back', hA:90}}),
  B:plankA([10, 171], 85.4, {arm:{ik:[139, 181], b:'back', hA:90}})}},
{id:'diamond', name:'Отжимания узким хватом', eq:[], g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:1,
 tech:['Ладони под грудью, большие и указательные пальцы почти касаются друг друга.',
   'Тело прямое, пресс и ягодицы напряжены.',
   'Опускайтесь, ведя локти назад вдоль корпуса, пока грудь не приблизится к кистям.',
   'Выжмите себя вверх до прямых рук.'],
 err:['Локти уходят в стороны', 'Провисание таза', 'Голова тянется к полу раньше груди'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:plankA([10, 171], 70.4, {arm:{ik:[131, 181], b:'back', hA:90}}),
  B:plankA([10, 171], 84, {arm:{ik:[131, 181], b:'back', hA:90}})}},
{id:'dip', name:'Отжимания на брусьях', eq:[['dipbars']], g:'chest', pri:['chest', 'triceps'], sec:['delt_f'], type:'c', lvl:2,
 tech:['Упритесь в брусья на прямых руках, плечи опущены, лопатки сведены.',
   'Наклоните корпус вперёд на 20–30°, ноги слегка согнуты и скрещены.',
   'Опускайтесь до угла в локтях около 90°, локти идут назад.',
   'Выжмите тело вверх до выпрямления рук без резкого «запирания» локтей.'],
 err:['Слишком глубокое опускание с болью в плечах', 'Плечи поднимаются к ушам', 'Раскачка ногами'],
 breath:'Вдох при опускании, выдох при подъёме.',
 anim:{view:'side',
  A:{hip:hipFromSh([107, 36], 15), torso:15, arm:{ik:[110, 92], b:"back", hA:90}, leg:{a:[186, 250], fr:-60}},
  B:{hip:hipFromSh([101, 70], 32), torso:32, arm:{ik:[110, 92], b:"back", hA:90}, leg:{a:[192, 255], fr:-60}},
  props:[{k:'line', pts:[[62, 96], [168, 96]], w:5}, {k:'line', pts:[[72, 96], [72, GROUND]], w:4}, {k:'line', pts:[[156, 96], [156, GROUND]], w:4}]}},
{id:'bbbench', name:'Жим штанги лёжа', eq:[['bb'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:2,
 tech:['Лягте так, чтобы глаза были под грифом. Сведите и прижмите лопатки к скамье, стопы твёрдо на полу.',
   'Хват чуть шире плеч. Снимите штангу и выведите её над плечами на прямых руках.',
   'Опускайте гриф на нижнюю часть груди, локти под углом 45–70° к корпусу.',
   'Коснувшись груди, выжмите штангу вверх и немного к голове.'],
 err:['Отрыв таза от скамьи', 'Отбив штанги от груди', 'Локти разведены под 90°'],
 breath:'Вдох и задержка перед опусканием, выдох после самой трудной точки подъёма.',
 note:'С весами, близкими к предельным, работайте со страхующим.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[78, 111], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(17)]}},
{id:'dbbench', name:'Жим гантелей лёжа', eq:[['db'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Сядьте на край скамьи с гантелями на бёдрах, лягте и выведите гантели над грудью.',
   'Лопатки сведены, стопы на полу, в пояснице небольшой естественный прогиб.',
   'Опускайте гантели к уровню груди, предплечья вертикальны.',
   'Выжмите гантели вверх по слегка сходящейся траектории.'],
 err:['Гантели «гуляют» в стороны', 'Слишком глубокое опускание с потерей контроля плеч', 'Удар гантелями наверху'],
 breath:'Вдох вниз, выдох на выжимании.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[74, 113], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), ...DB_SIDES('end')]}},
{id:'dbincline', name:'Жим гантелей на наклонной скамье', eq:[['db'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:1,
 tech:['Установите спинку под 30–45°. Сведите лопатки и прижмите их к спинке.',
   'Выведите гантели над верхней частью груди на прямых руках.',
   'Опускайте гантели к верхней части груди, локти под 45–60° к корпусу.',
   'Выжмите вверх, не ударяя гантели друг о друга.'],
 err:['Слишком крутой наклон спинки — нагрузка уходит в плечи', 'Отрыв лопаток', 'Помощь поясницей'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[73, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[80, 90], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[...inclineBench([112, 128], -55), ...DB_SIDES('end')]}},
{id:'smithincline', name:'Жим в машине Смита на наклонной скамье', eq:[['smith'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:1,
 tech:['Поставьте скамью под 30° так, чтобы гриф опускался на верхнюю часть груди.',
   'Хват чуть шире плеч, лопатки сведены, стопы на полу.',
   'Снимите гриф с крючков поворотом кистей и опустите к груди.',
   'Выжмите вверх без резкого выпрямления локтей; после подхода поверните гриф на крючки.'],
 err:['Скамья стоит не под траекторией грифа', 'Отрыв лопаток', 'Слишком широкий хват'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[77, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[77, 89], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[{k:'line', pts:[[86, 8], [86, GROUND]], w:3, cls:'eq-rail'}, {k:'line', pts:[[66, 8], [106, 8]], w:5}, ...inclineBench([112, 128], -55), PLATE(15)]}},
{id:'dbfly', name:'Разводка гантелей лёжа', eq:[['db'], ['bench']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Лягте на скамью, гантели над грудью, ладони смотрят друг на друга, локти слегка согнуты.',
   'Разводите руки по дуге в стороны, сохраняя угол в локтях, до лёгкого растяжения груди.',
   'Сведите гантели по той же дуге, как будто обнимаете бочку.'],
 err:['Сгибание локтей — разводка превращается в жим', 'Слишком низкое опускание рук', 'Тяжёлый вес в ущерб контролю'],
 breath:'Вдох при разведении, выдох при сведении.',
 viewNote:'вид сверху',
 anim:{view:'front', noGround:true,
  A:{c:[100, 128], arm:{p:[[-2, 4], [-7, 7]]}, leg:{p:[[7, 42], [10, 52]], fd:[3, 6]}},
  B:{c:[100, 128], arm:{p:[[28, 3], [53, 6]]}, leg:{p:[[7, 42], [10, 52]], fd:[3, 6]}},
  props:[{k:'rect', x:80, y:30, w:40, h:110, rx:6}, {k:'db', at:'gripR', o:'v', len:20, layer:'front'}, {k:'db', at:'gripL', o:'v', len:20, layer:'front'}]}},
{id:'cablefly', name:'Сведение рук в кроссовере', eq:[['cable']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Встаньте по центру между стойками, рукояти верхних блоков в руках, шаг вперёд для устойчивости.',
   'Корпус слегка наклонён вперёд, локти мягко согнуты и зафиксированы.',
   'Сведите руки по дуге вниз и вперёд, задержитесь на секунду, сжимая грудь.',
   'Медленно разведите руки до лёгкого растяжения груди.'],
 err:['Работа корпусом вместо рук', 'Сгибание и разгибание локтей', 'Бросок рукоятей в обратной фазе'],
 breath:'Выдох при сведении, вдох при разведении.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[28, -3], [53, -5]]}}),
  B:frontStand({arm:{p:[[7, 24], [-15, 37]]}}),
  props:[{k:'line', pts:[[24, 8], [24, GROUND]], w:5}, {k:'line', pts:[[176, 8], [176, GROUND]], w:5},
   {k:'cable', from:[30, 16], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[170, 16], at:'gripR', handle:true, layer:'front'}]}},
{id:'pecdeck', name:'Сведение рук в тренажёре «бабочка»', eq:[['pecdeck']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Отрегулируйте сиденье так, чтобы рукояти были на уровне груди.',
   'Прижмите спину и лопатки к спинке.',
   'Сведите руки перед собой, не отрывая спину, задержитесь на секунду.',
   'Плавно разведите руки до растяжения груди, не давая весу удариться.'],
 err:['Плечи подаются вперёд', 'Отрыв спины от спинки', 'Неполное сведение'],
 breath:'Выдох при сведении, вдох при разведении.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[30, 1], [31, -25]]}}),
  B:frontSeat({arm:{p:[[-13, 6], [-14, -20]]}}),
  props:[{k:'rect', x:76, y:62, w:48, h:70, rx:5}, {k:'rect', x:72, y:130, w:56, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5}, {k:'line', pts:[[56, 28], [144, 28]], w:5},
   {k:'seg', a:'elR', b:'wrR', w:12, cls:'eq-pad-s', layer:'mid'}, {k:'seg', a:'elL', b:'wrL', w:12, cls:'eq-pad-s', layer:'mid'}]}},

/* ===== СПИНА ===== */
{id:'pullup', name:'Подтягивания', eq:[['pullup']], g:'back', pri:['lats'], sec:['biceps', 'midback', 'forearms'], type:'c', lvl:2,
 tech:['Хват сверху чуть шире плеч, вис на прямых руках, лопатки опущены.',
   'Начните движение с опускания лопаток, затем тяните локти вниз к рёбрам.',
   'Поднимайтесь, пока подбородок не окажется над перекладиной.',
   'Опускайтесь подконтрольно до полного выпрямления рук.'],
 err:['Раскачка и рывки ногами', 'Неполная амплитуда внизу', 'Подбородок тянется вперёд вместо подъёма груди'],
 breath:'Выдох при подъёме, вдох при опускании.',
 note:'Если не получается подтянуться нужное число раз, используйте резиновую петлю или медленные негативы.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 130], arm:{p:[[10, -28], [13, -55]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  B:{c:[100, 83], arm:{p:[[15, 24], [13, -8]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  props:[{k:'line', pts:[[42, 22], [158, 22]], w:5}, {k:'line', pts:[[46, 6], [46, 22]], w:4}, {k:'line', pts:[[154, 6], [154, 22]], w:4}]}},
{id:'bbrow', name:'Тяга штанги в наклоне', eq:[['bb']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r', 'lowback'], type:'c', lvl:2,
 tech:['Хват сверху на ширине плеч. Колени чуть согнуты, корпус наклонён на 30–45° к полу, спина прямая.',
   'Штанга висит на прямых руках под плечами.',
   'Тяните гриф к низу живота, ведя локти назад вдоль корпуса.',
   'Сведите лопатки в верхней точке и плавно опустите штангу.'],
 err:['Округление спины', 'Рывок корпусом вверх', 'Тяга к груди с разведёнными локтями'],
 breath:'Выдох при подъёме штанги, вдох при опускании.',
 anim:{view:'side',
  A:Object.assign({hip:[85, 104], torso:55, arm:{ik:[130, 129], b:'up', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[85, 104], torso:55, arm:{tf:[20, 16], b:'up', hA:180}}, legsAt(100)),
  props:[PLATE(16)]}},
{id:'dbrow', name:'Тяга гантели одной рукой', eq:[['db'], ['bench']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:1, uni:true,
 tech:['Упритесь коленом и ладонью одной стороны в скамью, вторая нога на полу. Спина почти параллельна полу.',
   'Гантель в свободной руке висит под плечом.',
   'Тяните гантель к поясу, ведя локоть назад и вверх вдоль корпуса.',
   'Опустите гантель до полного выпрямления руки, слегка растягивая широчайшую.'],
 err:['Скручивание корпуса', 'Тяга к груди бицепсом', 'Округление спины'],
 breath:'Выдох при тяге, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{ik:[121, 132], b:'up', hA:180}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  B:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{tf:[16, 13], b:'up', hA:180}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  props:[...benchFlat(18, 140, 138), {k:'db', at:'gripN', o:'perp', layer:'front'}]}},
{id:'latpull', name:'Тяга верхнего блока', eq:[['cable']], g:'back', pri:['lats'], sec:['biceps', 'midback'], type:'c', lvl:1,
 tech:['Сядьте и зафиксируйте бёдра под валиками. Хват сверху шире плеч.',
   'Слегка отклонитесь назад на 10–15°, грудь вперёд.',
   'Тяните рукоять к верхней части груди, сводя лопатки и опуская локти вниз.',
   'Плавно верните рукоять вверх до полного выпрямления рук.'],
 err:['Тяга за голову', 'Сильное отклонение корпуса назад', 'Рывки весом'],
 breath:'Выдох при тяге вниз, вдох при возврате.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[12, -27], [17, -53]]}}),
  B:frontSeat({arm:{p:[[17, 22], [15, -4]]}}),
  props:[{k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5}, {k:'rect', x:68, y:133, w:64, h:6, rx:3, cls:'eq-pad'},
   {k:'barcable', from:[100, -6], layer:'back'}, {k:'fbar', ext:14, layer:'front'}]}},
{id:'cablerow', name:'Тяга горизонтального блока', eq:[['cable']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Сядьте, стопы на упоре, колени слегка согнуты, спина прямая.',
   'Возьмите рукоять, вытяните руки и подайте лопатки вперёд — корпус чуть наклонён вперёд.',
   'Тяните рукоять к животу, сводя лопатки; корпус отклоняется назад вместе с тягой, но не больше чем на 10–15°.',
   'Вернитесь с контролем, не округляя спину.'],
 err:['Сильное раскачивание корпусом — тянет поясница, а не спина', 'Подъём плеч к ушам', 'Округление поясницы'],
 breath:'Выдох при тяге, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[76, 140], torso:26, arm:{ik:[148, 112], b:'back', hA:90}, leg:{ik:[150, 146], b:'up', f:5}},
  B:{hip:[76, 140], torso:-4, arm:{tf:[22, 18], b:'back', hA:90}, leg:{ik:[150, 146], b:'up', f:5}},
  props:[...benchFlat(40, 112, 150), {k:'rect', x:156, y:126, w:6, h:44}, {k:'line', pts:[[178, 98], [178, GROUND]], w:5}, {k:'line', pts:[[112, 176], [178, 176]], w:4},
   {k:'cable', from:[174, 112], at:'gripN', handle:true, layer:'front'}]}},
{id:'deadlift', name:'Становая тяга', eq:[['bb']], g:'back', pri:['lowback', 'glutes', 'hams'], sec:['traps', 'quads', 'forearms', 'lats'], type:'c', lvl:2,
 tech:['Стопы на ширине таза, гриф над серединой стопы, хват чуть шире ног.',
   'Опустите таз, спина прямая, плечи немного впереди грифа. Создайте натяжение, как будто отжимаете пол.',
   'Поднимайте штангу вдоль ног, одновременно разгибая колени и таз.',
   'Наверху встаньте прямо без переразгибания. Опускайте по той же траектории: сначала таз назад, затем колени.'],
 err:['Округление поясницы', 'Гриф уходит от ног', 'Таз поднимается раньше плеч'],
 breath:'Глубокий вдох и напряжение пресса перед подъёмом, выдох в верхней точке.',
 anim:{view:'side',
  A:Object.assign({hip:hipFromSh([108, 106], 65), torso:65, arm:{ik:[106, 162], b:'back', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[92, 97], torso:-2, arm:{ik:[94, 100], b:'back', hA:180}}, legsAt(100)),
  props:[PLATE(20)]}},
{id:'hyper', name:'Гиперэкстензия', eq:[['hyper']], g:'back', pri:['lowback'], sec:['glutes', 'hams'], type:'i', lvl:1,
 tech:['Отрегулируйте упор: верхний край валика на уровне тазобедренных суставов.',
   'Руки скрещены на груди, тело — прямая линия.',
   'Наклонитесь вперёд со сгибанием в тазобедренных суставах, спина прямая.',
   'Поднимитесь до прямой линии тела без переразгибания в пояснице.'],
 err:['Переразгибание в верхней точке', 'Рывки', 'Округление спины внизу'],
 breath:'Вдох при наклоне, выдох при подъёме.',
 anim:{view:'side',
  A:{hip:[100, 105], torso:45, arm:{ra:[160, 15]}, leg:{a:[225, 225], fr:-90}},
  B:{hip:[100, 105], torso:158, arm:{ra:[160, 15]}, leg:{a:[225, 225], fr:-90}},
  props:[{k:'line', pts:[[34, 162], [104, 124]], w:6}, {k:'circle', c:[108, 121], r:8, cls:'eq-pad'}, {k:'circle', c:[34, 158], r:6, cls:'eq-pad'},
   {k:'line', pts:[[60, 148], [52, GROUND]], w:4}, {k:'line', pts:[[96, 128], [104, GROUND]], w:4}]}},
{id:'shrug', name:'Шраги с гантелями', eq:[['db']], g:'back', pri:['traps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Встаньте прямо, гантели в опущенных руках по бокам.',
   'Поднимите плечи вертикально вверх к ушам.',
   'Задержитесь на 1–2 секунды и медленно опустите.'],
 err:['Вращение плечами', 'Сгибание локтей', 'Наклон головы вперёд'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand({shrug:0, neck:15}), B:stand({shrug:7, neck:8}), props:DB_SIDES('perp')}},
{id:'bandrow', name:'Тяга эспандера к поясу сидя', eq:[['band']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Сядьте на пол, ноги прямые, середина ленты зацеплена за стопы.',
   'Спина прямая, руки вытянуты вперёд с натяжением ленты.',
   'Тяните концы ленты к поясу, сводя лопатки и ведя локти назад.',
   'Медленно вернитесь, сохраняя натяжение.'],
 err:['Отклонение корпуса назад вместо работы рук', 'Округление спины', 'Резкий возврат'],
 breath:'Выдох при тяге, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[70, 175], torso:20, arm:{ik:[140, 154], b:'back', hA:90}, leg:{a:[90, 90], f:10}},
  B:{hip:[70, 175], torso:-6, arm:{tf:[24, 18], b:'back', hA:90}, leg:{a:[90, 90], f:10}},
  props:[{k:'band', from:'toeN', at:'gripN', layer:'front'}]}},

/* ===== ПЛЕЧИ ===== */
{id:'dbpress', name:'Жим гантелей сидя', eq:[['db'], ['incline', 'bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:1,
 tech:['Спинка скамьи вертикальна. Гантели у плеч, локти под гантелями, ладони вперёд.',
   'Прижмите спину к спинке, пресс напряжён.',
   'Выжмите гантели вверх по дуге, сводя их над головой.',
   'Опустите до уровня ушей или чуть ниже.'],
 err:['Сильный прогиб в пояснице', 'Локти уходят назад за корпус', 'Неполная амплитуда'],
 breath:'Выдох при жиме, вдох при опускании.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[26, 6], [27, -20]]}}),
  B:frontSeat({arm:{p:[[14, -24], [8, -52]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'db', at:'gripR', o:'h', layer:'front'}, {k:'db', at:'gripL', o:'h', layer:'front'}]}},
{id:'ohp', name:'Жим штанги стоя', eq:[['bb']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'abs', 'traps'], type:'c', lvl:2,
 tech:['Хват чуть шире плеч, гриф лежит на передних дельтах у ключиц, локти немного впереди грифа.',
   'Ноги на ширине таза, ягодицы и пресс напряжены.',
   'Выжмите гриф вертикально вверх, отводя голову назад, а затем верните её под гриф.',
   'Зафиксируйте штангу над серединой стопы и опустите обратно к ключицам.'],
 err:['Прогиб в пояснице', 'Помощь ногами — это уже швунг', 'Жим перед собой, а не над головой'],
 breath:'Вдох перед жимом, выдох после прохождения лба.',
 anim:{view:'side',
  A:stand({torso:-3, head:-10, arm:{ik:[101, 50], b:'down'}}),
  B:stand({torso:0, head:0, arm:{ik:[94, -10], b:'down'}}),
  props:[PLATE(16)]}},
{id:'latraise', name:'Махи гантелями в стороны', eq:[['db']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1,
 tech:['Стоя, гантели у бёдер, локти слегка согнуты, корпус чуть наклонён вперёд.',
   'Поднимайте руки в стороны до уровня плеч, ведя движение локтями.',
   'Кисти не выше локтей, плечи не поднимаются к ушам.',
   'Медленно опустите.'],
 err:['Раскачка корпусом', 'Подъём плеч к ушам', 'Слишком тяжёлые гантели'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'front', A:frontStand({arm:{p:[[4, 29], [7, 55]]}}), B:frontStand({arm:{p:[[29, 2], [55, 7]]}}),
  props:[{k:'db', at:'gripR', layer:'front'}, {k:'db', at:'gripL', layer:'front'}]}},
{id:'bandlatraise', name:'Махи с эспандером в стороны', eq:[['band']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1,
 tech:['Встаньте на середину ленты, концы в руках у бёдер.',
   'Поднимайте руки через стороны до уровня плеч, локти слегка согнуты.',
   'Задержитесь и медленно опустите, не давая ленте дёрнуть руки.'],
 err:['Подъём плеч к ушам', 'Раскачка корпусом', 'Слишком тугая лента'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'front', A:frontStand({arm:{p:[[4, 29], [7, 55]]}}), B:frontStand({arm:{p:[[29, 2], [55, 7]]}}),
  props:[{k:'band', from:'anR', at:'gripR', layer:'front'}, {k:'band', from:'anL', at:'gripL', layer:'front'}]}},
{id:'frontraise', name:'Подъём гантелей перед собой', eq:[['db']], g:'shoulders', pri:['delt_f'], sec:['delt_s'], type:'i', lvl:1,
 tech:['Стоя, гантели перед бёдрами хватом сверху.',
   'Поднимите прямые руки вперёд до уровня плеч, локти слегка согнуты.',
   'Задержитесь на секунду и опустите с контролем.'],
 err:['Рывок корпусом', 'Подъём выше плеч с прогибом в спине'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[176, 174]}}), B:stand({arm:{a:[88, 84]}}), props:DB_SIDES('end')}},
{id:'facepull', name:'Тяга каната к лицу', eq:[['cable']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Установите блок на уровне лба, возьмите канат хватом сверху, отступите на шаг.',
   'Тяните канат к лицу, разводя его концы и уводя локти высоко в стороны.',
   'В конечной точке кисти у ушей, лопатки сведены.',
   'Плавно вернитесь до выпрямления рук.'],
 err:['Локти ниже кистей', 'Отклонение корпуса назад', 'Подъём плеч'],
 breath:'Выдох при тяге, вдох при возврате.',
 anim:{view:'front', viewNote:'вид спереди, блок перед атлетом',
  A:frontStand({arm:{p:[[14, 10], [18, 4]]}}),
  B:frontStand({arm:{p:[[32, -2], [24, -20]]}}),
  props:[{k:'circle', c:[100, 6], r:5, cls:'eq-steel-f'}, {k:'cable', from:[100, 6], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[100, 6], at:'gripR', handle:true, layer:'front'}]}},
{id:'pikepush', name:'Отжимания в упоре углом', eq:[], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:2,
 tech:['Из упора лёжа поднимите таз вверх: тело — перевёрнутая буква V, ладони на ширине плеч.',
   'Опускайте голову между ладонями к полу, сгибая локти назад.',
   'Почти коснитесь пола макушкой и выжмите себя обратно.'],
 err:['Таз опускается — получаются обычные отжимания', 'Локти разведены в стороны', 'Удар головой о пол'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[92, 90], torso:135, arm:{ik:[134, 181], b:'back', hA:90}, leg:{ik:[70, 172], b:'fwd', f:160}},
  B:{hip:[98, 96], torso:160, arm:{ik:[134, 181], b:'back', hA:90}, leg:{ik:[70, 172], b:'fwd', f:160}}}},

/* ===== БИЦЕПС ===== */
{id:'bbcurl', name:'Подъём штанги на бицепс', eq:[['bb']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Хват снизу на ширине плеч, локти прижаты к бокам.',
   'Согните руки, поднимая штангу к груди; локти остаются неподвижными.',
   'Задержитесь наверху и медленно опустите до почти полного выпрямления.'],
 err:['Раскачка корпусом', 'Локти уходят вперёд', 'Бросок веса вниз'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}), props:[PLATE(15)]}},
{id:'dbcurl', name:'Подъём гантелей на бицепс', eq:[['db']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Стоя, гантели в опущенных руках, ладони вперёд, локти у корпуса.',
   'Сгибайте руки одновременно или поочерёдно до уровня плеч.',
   'Медленно опустите до выпрямления рук.'],
 err:['Читинг корпусом', 'Локти уходят вперёд', 'Неполное выпрямление внизу'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}), props:DB_SIDES('end')}},
{id:'hammer', name:'Молотковые сгибания', eq:[['db']], g:'biceps', pri:['biceps', 'forearms'], sec:[], type:'i', lvl:1,
 tech:['Гантели в руках, ладони смотрят друг на друга.',
   'Сгибайте руки, сохраняя нейтральный хват; локти у корпуса.',
   'Медленно опустите до выпрямления рук.'],
 err:['Читинг корпусом', 'Отведение локтей вперёд'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 30]}}), props:DB_SIDES('perp')}},
{id:'cablecurl', name:'Сгибание рук на нижнем блоке', eq:[['cable']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Встаньте лицом к блоку, прямая рукоять хватом снизу.',
   'Локти у корпуса, сгибайте руки до уровня груди.',
   'Задержитесь и плавно разогните.'],
 err:['Наклон корпуса назад', 'Локти уходят вперёд'],
 breath:'Выдох при сгибании, вдох при разгибании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'line', pts:[[160, 120], [160, GROUND]], w:5}, {k:'cable', from:[154, 178], at:'grips', handle:true, layer:'front'}]}},
{id:'bandcurl', name:'Сгибание рук с эспандером', eq:[['band']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Встаньте на середину ленты, возьмите концы хватом снизу.',
   'Сгибайте руки, прижимая локти к бокам.',
   'Медленно опустите, удерживая натяжение.'],
 err:['Локти уходят вперёд', 'Раскачка корпусом'],
 breath:'Выдох при сгибании, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'band', from:'anN', foff:[4, 3], at:'gripN', layer:'front'}]}},
{id:'chinup', name:'Подтягивания обратным хватом', eq:[['pullup']], g:'biceps', pri:['biceps', 'lats'], sec:['forearms', 'midback'], type:'c', lvl:2,
 tech:['Хват снизу на ширине плеч, вис на прямых руках.',
   'Тяните локти вниз к бокам, поднимая грудь к перекладине.',
   'Подбородок над перекладиной, затем медленное опускание до прямых рук.'],
 err:['Неполное выпрямление внизу', 'Раскачка', 'Подъём за счёт рывка ногами'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 130], arm:{p:[[-2, -28], [-4, -55]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  B:{c:[100, 83], arm:{p:[[6, 25], [-4, -8]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  props:[{k:'line', pts:[[42, 22], [158, 22]], w:5}, {k:'line', pts:[[46, 6], [46, 22]], w:4}, {k:'line', pts:[[154, 6], [154, 22]], w:4}]}},

/* ===== ТРИЦЕПС ===== */
{id:'skull', name:'Французский жим лёжа', eq:[['bb'], ['bench']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:2,
 tech:['Лягте на скамью, штанга (удобнее EZ-гриф) на прямых руках над лбом, хват сверху на ширине плеч.',
   'Слегка отклоните руки к голове; плечи остаются неподвижными.',
   'Сгибайте только локти, опуская гриф к макушке.',
   'Разогните руки усилием трицепса.'],
 err:['Локти разъезжаются в стороны', 'Движение в плечевых суставах', 'Гриф опускается к лицу'],
 breath:'Вдох при опускании, выдох при разгибании.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{a:[-12, -8]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{a:[-14, -142]}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(14)]}},
{id:'pushdown', name:'Разгибание рук на верхнем блоке', eq:[['cable']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Встаньте у блока, корпус немного наклонён вперёд, локти прижаты к бокам.',
   'Разгибайте руки вниз до полного выпрямления, задержитесь на секунду.',
   'Вернитесь до угла в локтях около 90°; плечи неподвижны.'],
 err:['Локти отходят от корпуса', 'Помощь весом тела', 'Рукоять поднимается выше груди'],
 breath:'Выдох при разгибании, вдох при возврате.',
 anim:{view:'side', A:stand({torso:8, arm:{a:[184, 58]}}), B:stand({torso:8, arm:{a:[184, 176]}}),
  props:[{k:'line', pts:[[150, 0], [150, GROUND]], w:5}, {k:'cable', from:[144, 8], at:'grips', handle:true, layer:'front'}]}},
{id:'bandpushdown', name:'Разгибание рук с эспандером', eq:[['band']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Закрепите ленту высоко — на дверном якоре или перекладине — и возьмите концы.',
   'Локти прижаты к бокам. Разгибайте руки вниз до конца.',
   'Медленно вернитесь до 90° в локтях.'],
 err:['Локти уходят вперёд', 'Наклон корпусом вместо работы рук'],
 breath:'Выдох при разгибании, вдох при возврате.',
 anim:{view:'side', A:stand({torso:8, arm:{a:[184, 58]}}), B:stand({torso:8, arm:{a:[184, 176]}}),
  props:[{k:'rect', x:140, y:0, w:6, h:12}, {k:'band', from:[143, 10], at:'grips', layer:'front'}]}},
{id:'benchdip', name:'Обратные отжимания от скамьи', eq:[['bench']], g:'triceps', pri:['triceps'], sec:['chest', 'delt_f'], type:'c', lvl:1,
 tech:['Сядьте на край скамьи, ладони рядом с бёдрами, пальцы вперёд. Сместите таз вперёд.',
   'Ноги согнуты — проще, выпрямлены — сложнее.',
   'Опускайтесь, сгибая локти назад до угла 90°.',
   'Разгибайте руки, поднимаясь вверх.'],
 err:['Слишком глубокое опускание', 'Локти разведены в стороны', 'Таз далеко от скамьи'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[90, 124], torso:0, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[150, 180], b:'up', f:60}},
  B:{hip:[88, 150], torso:-2, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[150, 180], b:'up', f:60}},
  props:benchFlat(20, 82, 129)}},
{id:'ohext', name:'Разгибание гантели из-за головы', eq:[['db']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Стоя или сидя, удерживайте гантель обеими руками за верхний диск над головой.',
   'Локти направлены вверх и находятся близко к голове.',
   'Опустите гантель за голову, сгибая локти.',
   'Разогните руки вверх, не разводя локти.'],
 err:['Локти разъезжаются в стороны', 'Прогиб в пояснице'],
 breath:'Вдох при опускании, выдох при разгибании.',
 anim:{view:'side', A:stand({arm:{a:[6, 4]}}), B:stand({arm:{a:[4, -150]}}), props:[{k:'db', at:'grips', o:'along', len:20, layer:'front'}]}},

/* ===== ПРЕДПЛЕЧЬЯ ===== */
{id:'wristcurl', name:'Сгибание запястий со штангой', eq:[['bb'], ['bench']], g:'forearms', pri:['forearms'], sec:[], type:'i', lvl:1,
 tech:['Сядьте на скамью, предплечья лежат на бёдрах, кисти свисают за колени, хват снизу.',
   'Опустите штангу, разгибая запястья; гриф можно скатить к пальцам.',
   'Согните запястья, поднимая гриф максимально вверх.'],
 err:['Отрыв предплечий от бёдер', 'Слишком большой вес и рывки'],
 breath:'Ровное дыхание, выдох на подъёме.',
 anim:{view:'side',
  A:{hip:[82, 138], torso:35, arm:{ik:[128, 127], b:'back', w:70}, leg:{a:[90, 180], f:90}},
  B:{hip:[82, 138], torso:35, arm:{ik:[128, 127], b:'back', w:-55}, leg:{a:[90, 180], f:90}},
  props:[...benchFlat(48, 116, 148), PLATE(13)]}},
{id:'farmer', name:'Прогулка фермера', nameV:{kb:'Прогулка фермера с гирями'}, eq:[['db', 'kb']], g:'forearms', pri:['forearms', 'traps'], sec:['abs', 'glutes'], type:'c', lvl:1, kind:'dist',
 tech:['Возьмите тяжёлые гантели или гири, встаньте прямо, плечи опущены и отведены назад.',
   'Идите короткими быстрыми шагами, сохраняя корпус вертикальным.',
   'Не давайте весу раскачивать корпус. Ставьте снаряды на пол, приседая, а не наклоняясь.'],
 err:['Сутулость', 'Наклон в сторону', 'Длинные шаги с раскачкой'],
 breath:'Ровное дыхание, без задержек.',
 anim:{view:'side',
  A:{hip:[94, 99], torso:0, arm:{a:[182, 180]}, legN:{ik:[116, 180], b:'fwd', f:90}, legF:{ik:[74, 177], b:'fwd', f:112}},
  B:{hip:[94, 99], torso:0, arm:{a:[178, 180]}, legN:{ik:[74, 177], b:'fwd', f:112}, legF:{ik:[116, 180], b:'fwd', f:90}},
  props:[{k:'db', at:'gripF', o:'perp', layer:'farProps', if:'db'}, {k:'db', at:'gripN', o:'perp', layer:'front', if:'db'}, {k:'kb', at:'gripN', down:true, layer:'front', if:'kb'}]}},
{id:'hang', name:'Вис на турнике', eq:[['pullup']], g:'forearms', pri:['forearms'], sec:['lats'], type:'i', lvl:1, kind:'time',
 tech:['Возьмитесь за перекладину хватом сверху на ширине плеч.',
   'Повисните на прямых руках, плечи слегка опущены от ушей — активный вис.',
   'Удерживайте положение заданное время, дышите ровно.'],
 err:['Пассивный провал в плечах с болью', 'Раскачка'],
 breath:'Спокойное ровное дыхание.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], -3), torso:-3, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[183, 186], fr:-30}},
  B:{hip:hipFromSh([100, 80], 3), torso:3, shrug:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[178, 184], fr:-30}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},

/* ===== ПРЕСС ===== */
{id:'crunch', name:'Скручивания', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Лёжа на спине, колени согнуты, стопы на полу, руки скрещены на груди.',
   'Скручивайтесь, отрывая лопатки от пола и приближая рёбра к тазу.',
   'Поясница прижата к полу. Задержитесь и медленно опуститесь.'],
 err:['Тяга головы руками', 'Подъём корпуса целиком за счёт сгибателей бедра', 'Рывки'],
 breath:'Выдох при скручивании, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, head:0, arm:{ra:[155, 25]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[112, 175], torso:-62, head:12, arm:{ra:[155, 25]}, leg:{ik:[160, 180], b:'up', f:90}}}},
{id:'plank', name:'Планка на предплечьях', eq:[], g:'abs', pri:['abs'], sec:['obliques', 'delt_f', 'glutes'], type:'i', lvl:1, kind:'time',
 tech:['Упор на предплечья, локти под плечами, тело — прямая линия.',
   'Напрягите ягодицы и пресс, подтяните рёбра к тазу.',
   'Удерживайте положение, дышите ровно.'],
 err:['Провисание поясницы', 'Таз поднят вверх', 'Задержка дыхания'],
 breath:'Спокойное дыхание животом, без задержек.',
 anim:{view:'side',
  A:plankA([5, 171], 81.6, {arm:{a:[180, 90]}}),
  B:plankA([5, 171], 80.6, {arm:{a:[181, 90]}})}},
{id:'sideplank', name:'Боковая планка', eq:[], g:'abs', pri:['obliques'], sec:['abs', 'glutes'], type:'i', lvl:1, kind:'time', uni:true,
 tech:['Лягте на бок, упор на предплечье, локоть под плечом, ноги вместе.',
   'Поднимите таз: тело — прямая линия от головы до стоп.',
   'Верхнюю руку можно поднять вверх. Удерживайте положение, затем смените сторону.'],
 err:['Провисание таза', 'Плечо уходит к уху', 'Разворот корпуса вперёд'],
 breath:'Ровное дыхание.',
 anim:{view:'front', rot:true,
  A:{c:[100, 97], rot:69, pivot:[100, 182], armR:{p:[[28, 11], [32, 13]]}, armL:{p:[[29, 3], [56, 4]]}, leg:{p:[[-4, 43], [-7, 85]], fd:[4, 4]}},
  B:{c:[100, 97], rot:68, pivot:[100, 182], armR:{p:[[28, 11], [32, 13]]}, armL:{p:[[10, 22], [2, 38]]}, leg:{p:[[-4, 43], [-7, 85]], fd:[4, 4]}}}},
{id:'legraise', name:'Подъём ног в висе', eq:[['pullup']], g:'abs', pri:['abs'], sec:['obliques', 'forearms'], type:'i', lvl:3,
 tech:['Вис на перекладине, лопатки опущены, корпус неподвижен.',
   'Поднимите прямые или согнутые ноги до горизонтали или выше, подкручивая таз.',
   'Медленно опустите без раскачки.'],
 err:['Раскачка маятником', 'Подъём только за счёт сгибателей бедра без подкрутки таза'],
 breath:'Выдох при подъёме ног, вдох при опускании.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], 0), torso:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[180, 180], fr:-40}},
  B:{hip:hipFromSh([100, 83], -12), torso:-12, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[82, 82], fr:-40}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},
{id:'lyinglegraise', name:'Подъём ног лёжа', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Лёжа на спине, руки вдоль тела, поясница прижата к полу.',
   'Поднимите прямые ноги до вертикали, в верхней точке слегка оторвите таз.',
   'Опускайте ноги медленно, не касаясь пятками пола.'],
 err:['Прогиб в пояснице при опускании', 'Рывки'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, arm:{a:[90, 90], hA:90}, leg:{a:[86, 86], fr:-70}},
  B:{hip:[112, 175], torso:-90, arm:{a:[90, 90], hA:90}, leg:{a:[4, 4], fr:-70}}}},
{id:'cablecrunch', name:'Скручивания на блоке стоя на коленях', eq:[['cable']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Встаньте на колени лицом к верхнему блоку, концы каната у лба по бокам головы.',
   'Таз неподвижен. Скручивайтесь вниз, приближая локти к бёдрам.',
   'Вернитесь вверх, сохраняя натяжение пресса.'],
 err:['Опускание за счёт таза и рук', 'Тяга руками', 'Слишком тяжёлый вес'],
 breath:'Выдох при скручивании, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[96, 137], torso:12, head:0, arm:{ra:[150, -8]}, leg:{a:[180, 270], f:200}},
  B:{hip:[96, 137], torso:96, head:20, arm:{ra:[150, -8]}, leg:{a:[180, 270], f:200}},
  props:[{k:'line', pts:[[168, -6], [168, GROUND]], w:5}, {k:'cable', from:[162, 0], at:'grips', handle:true, layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'hipthrust', name:'Ягодичный мост со штангой', eq:[['bb'], ['bench']], g:'glutes', pri:['glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Сядьте спиной к скамье, нижний край лопаток на её краю. Штанга на сгибе бёдер, на подкладке.',
   'Стопы на ширине плеч; в верхней точке голень вертикальна.',
   'Поднимите таз до прямой линии от плеч до колен, подбородок к груди.',
   'Сожмите ягодицы, задержитесь и опустите таз.'],
 err:['Переразгибание поясницы наверху', 'Стопы стоят слишком далеко или близко', 'Неполное разгибание таза'],
 breath:'Выдох при подъёме таза, вдох при опускании.',
 anim:{view:'side',
  A:{hip:hipFromSh([74, 128], -55), torso:-55, head:18, arm:{tf:[2, 15], b:'up'}, leg:{ik:[150, 180], b:'up', f:90}},
  B:{hip:hipFromSh([74, 128], -92), torso:-92, head:28, arm:{tf:[2, 15], b:'up'}, leg:{ik:[150, 180], b:'up', f:90}},
  props:[...benchFlat(18, 80, 138), {k:'plate', tf:[2, 17], r:17, layer:'mid'}]}},
{id:'bridge', name:'Ягодичный мостик', eq:[], g:'glutes', pri:['glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Лёжа на спине, стопы у таза, руки вдоль тела.',
   'Поднимите таз, сжимая ягодицы, до прямой линии от плеч до колен.',
   'Задержитесь на 1–2 секунды и опустите таз.'],
 err:['Прогиб в пояснице', 'Упор на носки вместо пяток'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:hipFromSh([58, 176], -90), torso:-90, head:0, arm:{a:[90, 90], hA:90}, leg:{ik:[146, 180], b:'up', f:90}},
  B:{hip:hipFromSh([58, 176], -122), torso:-122, head:30, arm:{a:[90, 90], hA:90}, leg:{ik:[146, 180], b:'up', f:90}}}},
{id:'kbswing', name:'Махи гирей', eq:[['kb']], g:'glutes', pri:['glutes', 'hams'], sec:['lowback', 'delt_f', 'forearms'], type:'c', lvl:2,
 tech:['Стопы шире плеч, гиря на полу перед вами. Отведите таз назад, возьмите гирю и забросьте её между ног.',
   'Мощно разогните таз — гиря по инерции взлетает вперёд до уровня груди.',
   'Руки только направляют гирю. Наверху тело прямое, ягодицы сжаты.',
   'Встречайте гирю отведением таза назад.'],
 err:['Приседание вместо наклона', 'Подъём гири руками', 'Округление спины'],
 breath:'Резкий выдох на разгибании, вдох на замахе.',
 anim:{view:'side',
  A:Object.assign({hip:[72, 108], torso:62, arm:{ik:[86, 130], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[92, 97], torso:-3, arm:{ik:[145, 52], b:'down'}}, legsAt(98)),
  props:[{k:'kb', at:'gripN', layer:'front'}]}},
{id:'bulgarian', name:'Болгарские выпады', eq:[['bench']], opt:['db'], g:'glutes', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:2, uni:true,
 tech:['Встаньте спиной к скамье, подъём стопы задней ноги лежит на скамье, передняя нога — в шаге впереди.',
   'Опускайтесь вертикально вниз, пока бедро передней ноги не станет параллельно полу.',
   'Колено передней ноги направлено по носку.',
   'Поднимитесь за счёт передней ноги.'],
 err:['Слишком короткий шаг', 'Колено заваливается внутрь', 'Толчок задней ногой'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[90, 100], torso:4, arm:{a:[180, 180]}, legN:{ik:[124, 180], b:'fwd', f:90}, legF:{ik:[36, 134], b:'fwd', f:250}},
  B:{hip:[84, 139], torso:12, arm:{a:[180, 180]}, legN:{ik:[124, 180], b:'fwd', f:90}, legF:{ik:[36, 134], b:'fwd', f:250}},
  props:[...benchFlat(10, 56, 140), ...DB_SIDES('perp', 'db')]}},
{id:'stepup', name:'Зашагивания на скамью', eq:[['bench']], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Поставьте стопу на скамью или устойчивую платформу высотой не выше колена.',
   'Перенесите вес на эту ногу и поднимитесь, полностью её выпрямив.',
   'Опуститесь подконтрольно той же ногой.'],
 err:['Толчок нижней ногой', 'Колено заваливается внутрь', 'Сильный наклон корпуса'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[86, 104], torso:8, arm:{a:[180, 180]}, legN:{ik:[126, 135], b:'fwd', f:90}, legF:{ik:[78, 180], b:'fwd', f:90}},
  B:{hip:[118, 54], torso:0, arm:{a:[180, 180]}, legN:{ik:[126, 135], b:'fwd', f:90}, legF:{ik:[112, 128], b:'fwd', f:110}},
  props:[{k:'rect', x:104, y:140, w:52, h:46, rx:3}, ...DB_SIDES('perp', 'db')]}},
{id:'rdl', name:'Румынская тяга', nameV:{bb:'Румынская тяга со штангой', db:'Румынская тяга с гантелями'}, eq:[['bb', 'db']], g:'hams', pri:['hams', 'glutes'], sec:['lowback'], type:'c', lvl:1,
 tech:['Стоя, снаряд в прямых руках перед бёдрами, колени слегка согнуты.',
   'Отводите таз назад, наклоняясь с прямой спиной; снаряд скользит вдоль ног.',
   'Опускайтесь до сильного натяжения задней поверхности бедра — обычно до середины голени.',
   'Поднимитесь, подавая таз вперёд.'],
 err:['Округление спины', 'Сгибание коленей, как в приседе', 'Снаряд уходит от ног'],
 breath:'Вдох при наклоне, выдох при подъёме.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:-2, arm:{ik:[95, 100], b:'back', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[70, 106], torso:76, arm:{ik:[112, 146], b:'back', hA:180}}, legsAt(100)),
  props:[{k:'plate', at:'grips', r:16, layer:'mid', if:'bb'}, ...DB_SIDES('end', 'db')]}},

/* ===== КВАДРИЦЕПС ===== */
{id:'squat', name:'Приседания со штангой', eq:[['bb']], g:'quads', pri:['quads', 'glutes'], sec:['lowback', 'hams', 'abs'], type:'c', lvl:2,
 tech:['Штанга на трапециях, стопы чуть шире плеч, носки немного развёрнуты.',
   'Вдох, напряжение пресса. Опускайтесь, одновременно сгибая колени и отводя таз назад.',
   'Колени идут по направлению носков, спина нейтральная.',
   'Опуститесь до параллели бедра с полом или ниже и встаньте, толкая пол всей стопой.'],
 err:['Колени заваливаются внутрь', 'Отрыв пяток', 'Округление поясницы внизу'],
 breath:'Вдох и задержка на опускании, выдох после прохождения нижней трети подъёма.',
 note:'Работайте в силовой раме с выставленными страховочными упорами.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:2, arm:{tf:[51, -6], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[70, 146], torso:44, arm:{tf:[51, -6], b:'down'}}, legsAt(98)),
  props:[{k:'plate', tf:[53, -10], r:17, layer:'mid'}]}},
{id:'goblet', name:'Гоблет-приседания', nameV:{kb:'Гоблет-приседания с гирей'}, eq:[['db', 'kb']], g:'quads', pri:['quads', 'glutes'], sec:['abs'], type:'c', lvl:1,
 tech:['Держите гантель вертикально у груди (или гирю за рожки), локти направлены вниз.',
   'Стопы чуть шире плеч. Приседайте, опуская таз между коленями; корпус вертикальный.',
   'Опуститесь как можно ниже с прямой спиной и поднимитесь.'],
 err:['Наклон корпуса вперёд', 'Колени внутрь', 'Отрыв пяток'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:0, arm:{tf:[40, 17], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[72, 148], torso:24, arm:{tf:[40, 17], b:'down'}}, legsAt(98)),
  props:[{k:'db', at:'grips', o:'v', len:20, off:[0, 6], layer:'front', if:'db'}, {k:'kb', at:'grips', down:true, dist:9, layer:'front', if:'kb'}]}},
{id:'airsquat', name:'Приседания с собственным весом', eq:[], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Стопы на ширине плеч, руки можно вытянуть вперёд для баланса.',
   'Отведите таз и опуститесь до параллели бедра с полом; колени по носкам, пятки на полу.',
   'Поднимитесь до полного выпрямления.'],
 err:['Колени внутрь', 'Отрыв пяток', 'Округление спины'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side', A:stand({arm:{a:[180, 180]}}), B:Object.assign({hip:[70, 146], torso:38, arm:{a:[88, 88]}}, legsAt(98))}},
{id:'lunge', name:'Сплит-приседания', eq:[], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Поставьте ноги в длинный шаг, корпус вертикальный.',
   'Опускайтесь вертикально вниз, пока заднее колено почти не коснётся пола.',
   'Переднее колено над стопой, не уходит далеко за носок. Поднимитесь.'],
 err:['Наклон корпуса вперёд', 'Колено заваливается внутрь', 'Слишком короткий шаг'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[92, 103], torso:0, arm:{a:[180, 180]}, legN:{ik:[126, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}},
  B:{hip:[90, 141], torso:4, arm:{a:[180, 180]}, legN:{ik:[126, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}},
  props:DB_SIDES('perp', 'db')}},
{id:'legpress', name:'Жим ногами', eq:[['legpress']], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Сядьте и прижмите поясницу к спинке. Стопы на платформе на ширине плеч.',
   'Снимите упоры и опускайте платформу, сгибая колени до угла около 90°.',
   'Выжмите платформу, не выпрямляя колени до щелчка.'],
 err:['Отрыв таза в нижней точке', 'Колени заваливаются внутрь', 'Блокировка коленей наверху'],
 breath:'Вдох при опускании, выдох при выжимании.',
 anim:{view:'side',
  A:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 80), b:'up', f:-45}},
  B:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 38), b:'up', f:-45}},
  props:[{k:'line', pts:[add([68, 150], dir(-62), -8).map((v, i) => v + [6, 10][i]), add([68, 150], dir(-62), 60).map((v, i) => v + [6, 10][i])], w:8, cls:'eq-pad-s'},
   {k:'line', pts:[[104, GROUND], [164, 126]], w:4}, {k:'line', pts:[[52, 164], [52, GROUND]], w:4}, {k:'line', pts:[[40, 164], [92, 164]], w:5},
   {k:'platform', at:'anN', ang:45, layer:'front'}]}},
{id:'legext', name:'Разгибание ног в тренажёре', eq:[['legext']], g:'quads', pri:['quads'], sec:[], type:'i', lvl:1,
 tech:['Сядьте, прижмите спину. Валик над голеностопом, ось тренажёра на уровне колена.',
   'Разогните ноги почти до прямых, задержитесь на секунду.',
   'Медленно опустите.'],
 err:['Отрыв таза', 'Рывки и бросок веса'],
 breath:'Выдох при разгибании, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[78, 128], torso:-12, arm:{ik:[90, 138], b:'back', hA:120}, leg:{a:[90, 178], fr:-90}},
  B:{hip:[78, 128], torso:-12, arm:{ik:[90, 138], b:'back', hA:120}, leg:{a:[90, 92], fr:-90}},
  props:[{k:'rect', x:56, y:137, w:68, h:8}, {k:'line', pts:[add([78, 128], dir(-12), 4).map((v, i) => v + [-12, 0][i]), add([78, 128], dir(-12), 58).map((v, i) => v + [-12, 0][i])], w:8, cls:'eq-pad-s'},
   {k:'line', pts:[[90, 145], [90, GROUND]], w:5}, {k:'line', pts:[[60, GROUND], [130, GROUND]], w:4},
   {k:'roller', leg:'N', side:-90, pivot:[123, 128], layer:'front'}]}},
{id:'smithsquat', name:'Приседания в машине Смита', eq:[['smith']], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Гриф на трапециях, стопы немного впереди грифа на ширине плеч.',
   'Снимите гриф поворотом кистей и опускайтесь до параллели бедра с полом; колени по носкам.',
   'Поднимитесь, не отрывая пяток.'],
 err:['Стопы стоят прямо под грифом — нагрузка на колени растёт', 'Отрыв пяток', 'Округление спины'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:Object.assign({hip:[100, 97], torso:0, arm:{tf:[51, -4], b:'down'}}, legsAt(110)),
  B:Object.assign({hip:[74, 142], torso:29, arm:{tf:[51, -4], b:'down'}}, legsAt(110)),
  props:[{k:'line', pts:[[88, 6], [88, GROUND]], w:3, cls:'eq-rail'}, {k:'plate', tf:[52, -8], r:15, layer:'mid'}]}},

/* ===== БИЦЕПС БЕДРА ===== */
{id:'legcurl', name:'Сгибание ног лёжа в тренажёре', eq:[['legcurl']], g:'hams', pri:['hams'], sec:['calves'], type:'i', lvl:1,
 tech:['Лягте на живот, валик над пятками, колени чуть ниже края скамьи.',
   'Сгибайте ноги, подтягивая пятки к ягодицам; таз прижат.',
   'Медленно разогните ноги.'],
 err:['Подъём таза', 'Рывки', 'Неполное разгибание внизу'],
 breath:'Выдох при сгибании, вдох при разгибании.',
 anim:{view:'side',
  A:{hip:[88, 124], torso:84, head:-10, arm:{a:[172, 150]}, leg:{a:[270, 268], fr:-90}},
  B:{hip:[88, 124], torso:84, head:-10, arm:{a:[172, 150]}, leg:{a:[270, 378], fr:-90}},
  props:[{k:'rect', x:48, y:133, w:116, h:8}, {k:'line', pts:[[66, 141], [66, GROUND]], w:4}, {k:'line', pts:[[150, 141], [150, GROUND]], w:4},
   {k:'roller', leg:'N', side:90, out:8, pivot:[47, 128], layer:'front'}]}},

/* ===== ИКРЫ ===== */
{id:'calfraise', name:'Подъём на носки стоя', eq:[], opt:['db'], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Встаньте прямо, лучше носками на край ступени; колени прямые.',
   'Поднимитесь на носки как можно выше и задержитесь на 1–2 секунды.',
   'Медленно опуститесь, растягивая икры.'],
 err:['Пружинящие повторы без паузы', 'Сгибание коленей'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', A:stand(), B:Object.assign({hip:[94, 88], torso:0, arm:{a:[180, 180]}}, legsAt(100, 172, 'fwd', 130)), props:DB_SIDES('perp', 'db')}},
{id:'lpcalf', name:'Подъём на носки в тренажёре для жима ногами', eq:[['legpress']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Поставьте подушечки стоп на нижний край платформы, ноги почти прямые.',
   'Выжмите платформу носками, вытягивая стопы.',
   'Медленно вернитесь, растягивая икры.'],
 err:['Сгибание коленей', 'Ненадёжный упор — пятки соскальзывают'],
 breath:'Выдох при выжимании, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 82), b:'up', f:-45}},
  B:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 82), b:'up', f:-2}},
  props:[{k:'line', pts:[add([68, 150], dir(-62), -8).map((v, i) => v + [6, 10][i]), add([68, 150], dir(-62), 60).map((v, i) => v + [6, 10][i])], w:8, cls:'eq-pad-s'},
   {k:'line', pts:[[104, GROUND], [164, 126]], w:4}, {k:'line', pts:[[52, 164], [52, GROUND]], w:4}, {k:'line', pts:[[40, 164], [92, 164]], w:5},
   {k:'platform', at:'toeN', ang:45, gap:3, layer:'front'}]}}
];

/* ===================== ДОПОЛНЕНИЕ БАЗЫ: скамьи, пресс, кардио ===================== */
const shFromHip = (hip, a) => add(hip, dir(a), FL.torso);
function padAlong(hip, a, from, to, off = 12) {
  const u = dir(a), n = [-u[1], u[0]];
  return [add(add(hip, u, from), n, -off), add(add(hip, u, to), n, -off)];
}
/* скамья с обратным наклоном: подушка под спиной, упоры под колени и голени */
function declineBench(hip, a, legA) {
  const [p0, p1] = padAlong(hip, a, -26, 70);
  const kn = add(hip, dir(legA[0]), FL.th), an = add(kn, dir(legA[1]), FL.sh);
  return [
    {k:'line', pts:[[p0[0] + 2, p0[1] + 4], [p0[0] + 2, GROUND]], w:4}, {k:'line', pts:[[p1[0] + 6, p1[1] + 4], [p1[0] + 6, GROUND]], w:4},
    {k:'line', pts:[p0, p1], w:8, cls:'eq-pad-s'},
    {k:'line', pts:[[p0[0] + 4, p0[1]], [kn[0] + 4, kn[1] + 16]], w:4},
    {k:'circle', c:[kn[0] + 1, kn[1] + 9], r:5.5, cls:'eq-pad'},
    {k:'circle', c:[an[0] + 7, an[1] - 4], r:5.5, cls:'eq-pad'}
  ];
}
/* австралийские подтягивания: тело — прямая от пяток (195,178) под углом phi к полу, голова слева */
function invPose(phi) {
  const r = phi * D2R, sh = [195 - 137 * Math.cos(r), 178 - 137 * Math.sin(r)];
  const a = angOf([-Math.cos(r), -Math.sin(r)]);
  return {hip:add(sh, dir(a), -FL.torso), torso:a, arm:{ik:[60, 114], b:'down'}, leg:{a:[a + 180, a + 180], f:20}};
}
const PLANK_TOP = lineBody([10, 171], 70.4);

EX.push(
/* ===== ГРУДЬ ===== */
{id:'inclinebb', name:'Жим штанги на наклонной скамье', eq:[['bb'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:2,
 tech:['Установите спинку под 30–45° и лягте так, чтобы гриф был над глазами. Лопатки сведены, стопы на полу.',
   'Хват чуть шире плеч. Снимите штангу и выведите её над верхней частью груди.',
   'Опускайте гриф к верхней части груди под ключицами, локти под 45–60° к корпусу.',
   'Выжмите штангу вверх по вертикальной траектории.'],
 err:['Отрыв таза и лопаток', 'Слишком крутой наклон спинки — работают в основном плечи', 'Отбив грифа от груди'],
 breath:'Вдох при опускании, выдох после самой трудной точки подъёма.',
 note:'С тяжёлыми весами работайте со страхующим.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[76, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[79, 90], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[...inclineBench([112, 128], -55), PLATE(16)]}},
{id:'declinebb', name:'Жим штанги на скамье с обратным наклоном', eq:[['bb'], ['decline']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:2,
 tech:['Зафиксируйте ноги под валиками и лягте так, чтобы гриф был над глазами. Наклон скамьи 15–30°.',
   'Сведите лопатки, хват чуть шире плеч. Снимите штангу вместе со страхующим.',
   'Опускайте гриф на нижнюю часть груди, локти под 45–60° к корпусу.',
   'Выжмите штангу вверх и немного к голове.'],
 err:['Слишком широкий хват', 'Отбив грифа от груди', 'Работа без страхующего: снимать и ставить штангу головой вниз неудобно'],
 breath:'Вдох при опускании, выдох при выжимании.',
 note:'Между подходами не лежите головой вниз. При повышенном давлении замените упражнение жимом на горизонтальной скамье.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-112, arm:{ik:add(shFromHip([118, 126], -112), [2, -55]), b:'down'}, leg:{a:[58, 150], fr:-90}},
  B:{hip:[118, 126], torso:-112, arm:{ik:add(shFromHip([118, 126], -112), [13, -13]), b:'down'}, leg:{a:[58, 150], fr:-90}},
  props:[...declineBench([118, 126], -112, [58, 150]), PLATE(16)]}},
{id:'closegrip', name:'Жим лёжа узким хватом', eq:[['bb'], ['bench']], g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:2,
 tech:['Лягте на скамью, хват на ширине плеч или чуть уже, большие пальцы обхватывают гриф.',
   'Лопатки сведены, стопы на полу.',
   'Опускайте гриф на нижнюю часть груди, ведя локти вдоль корпуса.',
   'Выжмите штангу вверх, полностью разгибая локти.'],
 err:['Слишком узкий хват — перегрузка запястий', 'Локти разводятся в стороны', 'Отрыв таза от скамьи'],
 breath:'Вдох вниз, выдох при выжимании.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[82, 112], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(16)]}},
{id:'pullover', name:'Пуловер с гантелью', eq:[['db'], ['bench']], g:'chest', pri:['chest', 'lats'], sec:['triceps'], type:'i', lvl:1,
 tech:['Лягте на скамью и держите гантель обеими руками за верхний диск над грудью, локти слегка согнуты.',
   'Опускайте гантель по дуге за голову до растяжения груди и широчайших.',
   'Верните гантель по той же дуге над грудью, не сгибая локти сильнее.'],
 err:['Сгибание локтей — движение превращается во французский жим', 'Слишком глубокое опускание с болью в плечах', 'Прогиб в пояснице'],
 breath:'Вдох при опускании, выдох при возврате.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{a:[-4, -6]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{a:[-98, -104]}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), {k:'db', at:'grips', o:'along', len:20, layer:'front'}]}},
{id:'declinepush', name:'Отжимания с ногами на скамье', eq:[['bench']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps', 'abs'], type:'c', lvl:2,
 tech:['Поставьте носки на скамью, ладони на пол чуть шире плеч. Тело — прямая линия.',
   'Опускайтесь, пока грудь почти не коснётся пола; локти под 30–45° к корпусу.',
   'Выжмите себя вверх, не прогибаясь в пояснице.'],
 err:['Провисание поясницы', 'Голова тянется к полу раньше груди', 'Неполная амплитуда'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:plankA([16, 126], 90.4, {arm:{ik:[152, 181], b:'back', hA:90}}),
  B:plankA([16, 126], 103.5, {arm:{ik:[152, 181], b:'back', hA:90}}),
  props:benchFlat(0, 44, 139)}},

/* ===== СПИНА ===== */
{id:'invrow', name:'Австралийские подтягивания', eq:[['smith', 'pullup']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Установите гриф или низкую перекладину на уровне пояса. Возьмитесь хватом сверху чуть шире плеч и лягте под ней, пятки на полу.',
   'Тело — прямая линия, ягодицы и пресс напряжены.',
   'Подтяните грудь к перекладине, сводя лопатки и ведя локти назад.',
   'Опуститесь до прямых рук.'],
 err:['Провисание таза', 'Тяга подбородком вместо груди', 'Неполная амплитуда'],
 breath:'Выдох при подтягивании, вдох при опускании.',
 note:'Нужна низкая перекладина или гриф в машине Смита. Чем ниже перекладина и прямее ноги, тем тяжелее.',
 anim:{view:'side', A:invPose(4.5), B:invPose(24),
  props:[{k:'line', pts:[[60, 30], [60, GROUND]], w:3, cls:'eq-rail'}, {k:'circle', c:[60, 110], r:4.5}]}},
{id:'straightpull', name:'Пуловер на блоке прямыми руками', eq:[['cable']], g:'back', pri:['lats'], sec:['triceps', 'midback'], type:'i', lvl:1,
 tech:['Встаньте лицом к верхнему блоку, возьмите прямую рукоять или канат хватом сверху, отступите на шаг и слегка наклоните корпус.',
   'Руки почти прямые. Опустите рукоять по дуге к бёдрам, опуская плечи и сводя лопатки.',
   'Медленно верните руки до уровня головы.'],
 err:['Сгибание локтей — получается тяга вниз', 'Раскачка корпусом', 'Подъём плеч к ушам'],
 breath:'Выдох при опускании рукояти, вдох при возврате.',
 anim:{view:'side', A:stand({hip:[88, 97], torso:16, arm:{a:[26, 30]}}), B:stand({hip:[88, 97], torso:16, arm:{a:[170, 168]}}),
  props:[{k:'line', pts:[[172, -6], [172, GROUND]], w:5}, {k:'cable', from:[166, 0], at:'grips', handle:true, layer:'front'}]}},
{id:'goodmorning', name:'Наклоны со штангой на плечах', eq:[['bb']], g:'hams', pri:['hams', 'lowback'], sec:['glutes'], type:'c', lvl:2,
 tech:['Штанга на трапециях, как в приседании. Стопы на ширине таза, колени слегка согнуты.',
   'Отводите таз назад и наклоняйтесь с прямой спиной, пока корпус не станет почти параллелен полу.',
   'Поднимитесь, подавая таз вперёд.'],
 err:['Округление спины', 'Сгибание коленей, как в приседе', 'Большой вес до освоения техники'],
 breath:'Вдох при наклоне, выдох при подъёме.',
 note:'Начинайте с пустого грифа.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:2, arm:{tf:[51, -6], b:'down'}}, legsAt(100)),
  B:Object.assign({hip:[70, 103], torso:80, arm:{tf:[51, -6], b:'down'}}, legsAt(100)),
  props:[{k:'plate', tf:[53, -10], r:17, layer:'mid'}]}},

/* ===== ПЛЕЧИ ===== */
{id:'arnold', name:'Жим Арнольда', eq:[['db'], ['incline', 'bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:2,
 tech:['Сядьте на скамью со спинкой. Гантели у верхней части груди, ладони к себе, локти перед корпусом.',
   'Начиная жим, разводите локти в стороны и разворачивайте кисти ладонями вперёд.',
   'Выжмите гантели над головой. Опустите их, выполняя движение в обратном порядке.'],
 err:['Прогиб в пояснице', 'Резкий разворот кистей без контроля', 'Тяжёлые гантели в ущерб амплитуде'],
 breath:'Выдох при жиме, вдох при опускании.',
 anim:{view:'front',
  keys:[frontSeat({arm:{p:[[4, 19], [5, -7]]}}), frontSeat({arm:{p:[[26, 6], [27, -20]]}}), frontSeat({arm:{p:[[14, -24], [8, -52]]}})],
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'db', at:'gripR', o:'h', layer:'front'}, {k:'db', at:'gripL', o:'h', layer:'front'}]}},
{id:'cablelat', name:'Отведение руки на нижнем блоке', eq:[['cable']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1, uni:true,
 tech:['Встаньте боком к блоку, рукоять в дальней от тренажёра руке, второй рукой держитесь за стойку.',
   'Отведите руку в сторону до уровня плеча, локоть слегка согнут.',
   'Медленно верните руку, сохраняя натяжение троса. Затем смените сторону.'],
 err:['Наклон корпуса от тренажёра', 'Подъём плеча к уху', 'Рывок в начале движения'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'front',
  A:frontStand({armR:{p:[[-1, 28], [-8, 54]]}, armL:{p:[[26, 18], [48, 32]]}}),
  B:frontStand({armR:{p:[[29, 2], [55, 6]]}, armL:{p:[[26, 18], [48, 32]]}}),
  props:[{k:'line', pts:[[28, 30], [28, GROUND]], w:5}, {k:'cable', from:[34, 180], at:'gripR', handle:true, layer:'front'}]}},
{id:'reversefly', name:'Обратные разведения в «бабочке»', eq:[['pecdeck']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Сядьте лицом к спинке тренажёра, грудь прижата к упору, рукояти на уровне плеч.',
   'Разведите почти прямые руки назад в стороны, сводя лопатки.',
   'Задержитесь на секунду и плавно верните руки.'],
 err:['Отрыв груди от упора', 'Сгибание локтей и тяга руками', 'Подъём плеч к ушам'],
 breath:'Выдох при разведении, вдох при возврате.',
 viewNote:'вид сзади',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[-8, 3], [-16, 5]]}}),
  B:frontSeat({arm:{p:[[28, 2], [54, 4]]}}),
  props:[{k:'line', pts:[[100, 26], [100, GROUND]], w:5}, {k:'line', pts:[[56, 26], [144, 26]], w:5}, {k:'rect', x:72, y:130, w:56, h:9},
   {k:'db', at:'gripR', o:'v', len:14, layer:'front'}, {k:'db', at:'gripL', o:'v', len:14, layer:'front'}]}},
{id:'bandfacepull', name:'Тяга эспандера к лицу', eq:[['band']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Закрепите ленту на уровне лба — на дверном якоре или стойке. Возьмите концы хватом сверху и отступите до натяжения.',
   'Тяните ленту к лицу, разводя руки и уводя локти высоко в стороны.',
   'Задержитесь, сведя лопатки, и медленно вернитесь.'],
 err:['Локти ниже кистей', 'Отклонение корпуса назад', 'Подъём плеч'],
 breath:'Выдох при тяге, вдох при возврате.',
 anim:{view:'front', viewNote:'вид спереди, лента закреплена перед атлетом',
  A:frontStand({arm:{p:[[14, 10], [18, 4]]}}),
  B:frontStand({arm:{p:[[32, -2], [24, -20]]}}),
  props:[{k:'rect', x:96, y:28, w:8, h:12, rx:2}, {k:'band', from:[100, 34], at:'gripL', layer:'front'}, {k:'band', from:[100, 34], at:'gripR', layer:'front'}]}},

/* ===== БИЦЕПС ===== */
{id:'preacher', name:'Сгибание рук на скамье Скотта', eq:[['preacher'], ['bb', 'db']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Сядьте так, чтобы верхний край упора был под подмышками, а плечи лежали на подушке.',
   'Хват снизу. Согните руки, поднимая снаряд к плечам; плечи не отрываются от упора.',
   'Медленно опустите почти до полного выпрямления, без рывка внизу.'],
 err:['Резкое разгибание внизу — нагрузка на связки локтя', 'Отрыв плеч от упора', 'Наклон корпуса назад'],
 breath:'Выдох при сгибании, вдох при опускании.',
 anim:(() => {
   const hip = [78, 140], sh = shFromHip(hip, 10), p0 = add(add(sh, dir(235), 11), dir(145), 2), p1 = add(p0, dir(145), 38);
   return {view:'side',
    A:{hip, torso:10, arm:{a:[145, 152]}, leg:{a:[90, 180], f:90}},
    B:{hip, torso:10, arm:{a:[145, 22]}, leg:{a:[90, 180], f:90}},
    props:[{k:'line', pts:[[p1[0] - 4, p1[1]], [p1[0] - 4, GROUND]], w:4}, {k:'rect', x:58, y:150, w:40, h:8}, {k:'line', pts:[[78, 158], [78, GROUND]], w:4},
     {k:'line', pts:[p0, p1], w:9, cls:'eq-pad-s', layer:'mid'}, {k:'plate', at:'grips', r:13, layer:'mid', if:'bb'}, ...DB_SIDES('end', 'db')]};
 })()},
{id:'inclinecurl', name:'Сгибание рук на наклонной скамье', eq:[['db'], ['incline']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Установите спинку под 45–60°, сядьте и прижмите спину. Гантели свисают на прямых руках, ладони вперёд.',
   'Сгибайте руки, не выводя локти вперёд.',
   'Медленно опустите до полного выпрямления, чувствуя растяжение бицепса.'],
 err:['Локти уходят вперёд', 'Отрыв спины и плеч от спинки', 'Неполное выпрямление внизу'],
 breath:'Выдох при сгибании, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[92, 128], torso:-32, arm:{a:[182, 180]}, leg:{ik:[140, 180], b:'up', f:90}},
  B:{hip:[92, 128], torso:-32, arm:{a:[178, 28]}, leg:{ik:[140, 180], b:'up', f:90}},
  props:[...inclineBench([92, 128], -32), ...DB_SIDES('end')]}},
{id:'concentration', name:'Концентрированный подъём на бицепс', eq:[['db'], ['bench']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1, uni:true,
 tech:['Сядьте на край скамьи, ноги широко. Упритесь локтем рабочей руки во внутреннюю часть бедра.',
   'Согните руку, поднимая гантель к плечу; плечо неподвижно.',
   'Задержитесь на секунду и медленно опустите. Затем смените руку.'],
 err:['Помощь корпусом', 'Отрыв локтя от бедра'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[78, 140], torso:42, armN:{a:[174, 176]}, armF:{a:[140, 104]}, legN:{ik:[124, 180], b:'up', f:90}, legF:{ik:[120, 180], b:'up', f:90}},
  B:{hip:[78, 140], torso:42, armN:{a:[172, 34]}, armF:{a:[140, 104]}, legN:{ik:[124, 180], b:'up', f:90}, legF:{ik:[120, 180], b:'up', f:90}},
  props:[...benchFlat(46, 100, 150), {k:'db', at:'gripN', o:'end', layer:'front'}]}},

/* ===== ТРИЦЕПС ===== */
{id:'kickback', name:'Разгибание руки с гантелью в наклоне', eq:[['db'], ['bench']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1, uni:true,
 tech:['Упритесь коленом и ладонью в скамью, корпус почти параллелен полу. Плечо рабочей руки прижато к корпусу.',
   'Разогните руку назад до прямой линии, задержитесь на секунду.',
   'Вернитесь до угла 90° в локте; плечо неподвижно. Затем смените руку.'],
 err:['Плечо опускается и раскачивается', 'Бросок гантели вниз', 'Скручивание корпуса'],
 breath:'Выдох при разгибании, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{a:[250, 178]}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  B:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{a:[250, 252]}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  props:[...benchFlat(18, 140, 138), {k:'db', at:'gripN', o:'perp', layer:'front'}]}},

/* ===== ПРЕСС ===== */
{id:'declinecrunch', name:'Скручивания на скамье для пресса', eq:[['abbench', 'decline']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Зафиксируйте ноги под валиками, лягте на наклонную скамью, руки скрещены на груди.',
   'Скручивайтесь, отрывая лопатки и приближая рёбра к тазу, примерно до 45° к скамье.',
   'Медленно опуститесь, не ложась лопатками на скамью, чтобы сохранить напряжение.'],
 err:['Рывки корпусом', 'Тяга головы руками', 'Подъём до вертикали за счёт сгибателей бедра'],
 breath:'Выдох при скручивании, вдох при опускании.',
 note:'Чем круче наклон, тем тяжелее. Для усложнения держите блин у груди.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-112, head:0, arm:{ra:[155, 25]}, leg:{a:[58, 150], fr:-90}},
  B:{hip:[118, 126], torso:-58, head:16, arm:{ra:[155, 25]}, leg:{a:[58, 150], fr:-90}},
  props:declineBench([118, 126], -112, [58, 150])}},
{id:'captainraise', name:'Подъём коленей в упоре на локтях', eq:[['captain']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Встаньте в стойку для пресса: спина прижата к спинке, предплечья на упорах, ноги свисают.',
   'Поднимите колени к груди, слегка подкручивая таз вперёд.',
   'Медленно опустите ноги, не раскачиваясь.'],
 err:['Раскачка и бросок ног вниз', 'Отрыв поясницы от спинки', 'Плечи поднимаются к ушам'],
 breath:'Выдох при подъёме коленей, вдох при опускании.',
 note:'С прямыми ногами упражнение заметно тяжелее.',
 anim:{view:'side',
  A:{hip:[100, 92], torso:0, arm:{a:[180, 90], hA:90}, leg:{a:[178, 186], fr:-60}},
  B:{hip:[100, 92], torso:-6, arm:{a:[180, 90], hA:90}, leg:{a:[84, 174], fr:-60}},
  props:[{k:'line', pts:[[83, 30], [83, GROUND]], w:5}, {k:'line', pts:[[70, GROUND], [120, GROUND]], w:4},
   {k:'rect', x:80, y:36, w:9, h:78, rx:4}, {k:'rect', x:96, y:73, w:36, h:6, rx:3}, {k:'line', pts:[[83, 76], [96, 76]], w:4}, {k:'circle', c:[134, 70], r:3.5}]}},
{id:'hangknee', name:'Подъём коленей в висе', eq:[['pullup']], g:'abs', pri:['abs'], sec:['obliques', 'forearms'], type:'i', lvl:2,
 tech:['Вис на перекладине хватом сверху, лопатки опущены.',
   'Подтяните колени к груди, подкручивая таз.',
   'Медленно опустите ноги без раскачки.'],
 err:['Раскачка маятником', 'Бросок ног вниз', 'Подъём коленей без подкрутки таза'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], 0), torso:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[180, 182], fr:-40}},
  B:{hip:hipFromSh([100, 83], -10), torso:-10, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[82, 176], fr:-40}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},
{id:'rollout', name:'Выкатывание ролика с колен', eq:[['abwheel']], g:'abs', pri:['abs'], sec:['obliques', 'lats', 'delt_f'], type:'c', lvl:2,
 tech:['Встаньте на колени, ролик под плечами на прямых руках. Напрягите пресс и ягодицы, поясница слегка округлена.',
   'Катите ролик вперёд, вытягивая тело, пока поясница остаётся ровной.',
   'Вернитесь в исходное положение усилием пресса, а не рук.'],
 err:['Прогиб в пояснице', 'Слишком далёкое выкатывание для своего уровня', 'Возврат за счёт таза'],
 breath:'Вдох при выкатывании, выдох при возврате.',
 anim:{view:'side',
  A:{hip:hipFromSh([128, 113], 64), torso:64, arm:{ik:[128, 170], b:'back'}, leg:{ik:[40, 180], b:'down', f:200}},
  B:{hip:[108, 158], torso:84, arm:{ik:[210, 170], b:'back'}, leg:{ik:[40, 180], b:'down', f:200}},
  props:[{k:'plate', at:'grips', r:8, off:[0, 2], layer:'mid'}]}},
{id:'sidebend', name:'Наклоны в сторону с гантелью', eq:[['db']], g:'abs', pri:['obliques'], sec:['abs'], type:'i', lvl:1, uni:true,
 tech:['Встаньте прямо, гантель в одной руке, вторая рука за головой.',
   'Наклонитесь в сторону гантели, не заваливаясь вперёд или назад.',
   'Вернитесь в вертикальное положение усилием косых мышц противоположной стороны. Затем смените сторону.'],
 err:['Наклон вперёд', 'Рывки', 'Гантели в обеих руках — нагрузка уравновешивается и косые не работают'],
 breath:'Вдох при наклоне, выдох при возврате.',
 anim:{view:'front',
  A:{c:[100, 97], torso:0, armR:{p:[[2, 29], [3, 56]]}, armL:{p:[[18, -20], [4, -30]]}, leg:{p:[[6, 43], [10, 85]]}},
  B:{c:[100, 97], torso:20, armR:{p:[[2, 29], [3, 56]]}, armL:{p:[[18, -20], [4, -30]]}, leg:{p:[[6, 43], [10, 85]]}},
  props:[{k:'db', at:'gripR', layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'glutekick', name:'Отведение ноги назад на нижнем блоке', eq:[['cable']], g:'glutes', pri:['glutes'], sec:['hams'], type:'i', lvl:1, uni:true,
 tech:['Закрепите манжету на щиколотке, встаньте лицом к блоку и держитесь за стойку.',
   'Корпус слегка наклонён вперёд, колено опорной ноги мягкое.',
   'Отведите ногу назад до полного разгибания в тазобедренном суставе, сжимая ягодицу.',
   'Медленно верните ногу. Затем смените сторону.'],
 err:['Прогиб в пояснице вместо разгибания бедра', 'Раскачка', 'Слишком большой вес'],
 breath:'Выдох при отведении, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[90, 97], torso:20, arm:{ik:[140, 72], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[182, 182], f:90}},
  B:{hip:[90, 97], torso:20, arm:{ik:[140, 72], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[214, 222], f:112}},
  props:[{k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'cable', from:[146, 180], at:'anN', handle:true, layer:'front'}]}},

/* ===== КАРДИО ===== */
{id:'jumpingjack', name:'Прыжки «ноги врозь»', eq:[], g:'cardio', pri:['calves', 'delt_s'], sec:['quads', 'glutes'], type:'c', lvl:1, kind:'time',
 tech:['Встаньте прямо, руки вдоль тела.',
   'Прыжком расставьте ноги шире плеч и поднимите руки через стороны над головой.',
   'Следующим прыжком вернитесь в исходное положение. Приземляйтесь мягко на носки.'],
 err:['Приземление на прямые ноги и пятки', 'Задержка дыхания'],
 breath:'Ритмичное дыхание в темпе прыжков.',
 anim:{view:'front', period:1600,
  keys:[frontStand({arm:{p:[[2, 29], [3, 56]]}, leg:{p:[[1, 43], [1, 85]]}}),
   {c:[100, 93], arm:{p:[[29, 4], [56, 6]]}, leg:{p:[[7, 42], [13, 83]]}},
   {c:[100, 91], arm:{p:[[14, -25], [10, -53]]}, leg:{p:[[11, 42], [22, 82]]}}]}},
{id:'burpee', name:'Бёрпи', eq:[], g:'cardio', pri:['quads', 'chest', 'delt_f'], sec:['glutes', 'triceps', 'abs'], type:'c', lvl:2,
 tech:['Из положения стоя присядьте и поставьте ладони на пол.',
   'Прыжком отведите ноги назад в упор лёжа; при желании отожмитесь.',
   'Прыжком верните стопы к рукам и выпрыгните вверх, вытягивая руки над головой.'],
 err:['Провисание поясницы в упоре лёжа', 'Приземление на прямые ноги', 'Длинные паузы между фазами'],
 breath:'Выдох при выпрыгивании и при отталкивании от пола.',
 anim:{view:'side', period:4600,
  keys:[{hip:[94, 84], torso:0, arm:{ik:[100, -24], b:'back', hA:0}, legN:{ik:[98, 170], b:'fwd', f:140}, legF:{ik:[98, 170], b:'fwd', f:140}},
   {hip:[92, 97], torso:0, arm:{ik:[95, 99], b:'back', hA:180}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{ik:[98, 180], b:'fwd', f:90}},
   {hip:[78, 146], torso:62, arm:{ik:[126, 180], b:'back', hA:90}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{ik:[98, 180], b:'fwd', f:90}},
   {hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 180], b:'back', hA:90}, legN:{ik:[10, 171], b:'fwd', f:160}, legF:{ik:[10, 171], b:'fwd', f:160}}]}},
{id:'mountain', name:'Скалолаз', eq:[], g:'cardio', pri:['abs', 'quads'], sec:['delt_f', 'chest'], type:'c', lvl:1, kind:'time',
 tech:['Примите упор лёжа на прямых руках, ладони под плечами.',
   'Поочерёдно и быстро подтягивайте колени к груди, удерживая таз на уровне плеч.',
   'Дышите ритмично, не поднимайте таз вверх.'],
 err:['Таз поднимается вверх', 'Плечи уходят назад от кистей', 'Короткая амплитуда шагов'],
 breath:'Ритмичное дыхание, без задержек.',
 anim:{view:'side', period:1400,
  A:{hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 181], b:'back', hA:90}, legN:{ik:[92, 166], b:'fwd', f:160}, legF:{ik:[10, 171], b:'fwd', f:160}},
  B:{hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 181], b:'back', hA:90}, legN:{ik:[10, 171], b:'fwd', f:160}, legF:{ik:[92, 166], b:'fwd', f:160}}}},
{id:'jumpsquat', name:'Приседания с выпрыгиванием', eq:[], g:'cardio', pri:['quads', 'glutes', 'calves'], sec:['hams'], type:'c', lvl:2,
 tech:['Стопы на ширине плеч. Присядьте до параллели или чуть выше, отведя руки назад.',
   'Мощно выпрыгните вверх, помогая взмахом рук.',
   'Приземлитесь мягко на носки с переходом на всю стопу и сразу уходите в следующий присед.'],
 err:['Приземление на прямые ноги', 'Колени заваливаются внутрь при приземлении', 'Присед без контроля глубины'],
 breath:'Выдох при прыжке, вдох при приседании.',
 anim:{view:'side', period:2200,
  keys:[Object.assign({hip:[72, 146], torso:38, arm:{a:[212, 210]}}, legsAt(98)),
   Object.assign({hip:[95, 90], torso:0, arm:{a:[40, 38]}}, legsAt(99, 172, 'fwd', 130)),
   Object.assign({hip:[95, 74], torso:0, arm:{a:[24, 22]}}, legsAt(99, 158, 'fwd', 150))]}},
{id:'thruster', name:'Трастеры с гантелями', eq:[['db']], g:'cardio', pri:['quads', 'glutes', 'delt_f'], sec:['triceps', 'abs', 'delt_s'], type:'c', lvl:2,
 tech:['Гантели у плеч, локти направлены вперёд. Стопы на ширине плеч.',
   'Присядьте до параллели, сохраняя корпус вертикальным.',
   'Мощно вставая, сразу выжмите гантели над головой одним слитным движением.',
   'Опустите гантели к плечам и переходите к следующему повторению.'],
 err:['Жим начинается раньше, чем выпрямлены ноги', 'Прогиб в пояснице в верхней точке', 'Локти опускаются в приседе'],
 breath:'Выдох при вставании и жиме, вдох при приседании.',
 anim:{view:'side',
  A:Object.assign({hip:[70, 146], torso:34, arm:{rk:[9, -3], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[92, 97], torso:0, arm:{rk:[3, -56], b:'down'}}, legsAt(98)),
  props:DB_SIDES('end')}}
);

/* ===================== ДЕМОНСТРАЦИИ v2 ===================== */
const MOTION_VERSION = '3.1';
const DEMO = Object.fromEntries(EX.map(ex => [ex.id, ex]));
function fixMotion(id, patch) { Object.assign(DEMO[id].anim, patch); }
fixMotion('bbrow', {
  A:Object.assign({hip:[85,104], torso:55, arm:{a:[180,180],hA:180}}, legsAt(100)),
  B:Object.assign({hip:[85,104], torso:55, arm:{ik:add(add([85,104],dir(55),20),[Math.cos(55*D2R),Math.sin(55*D2R)],16), b:'back',hA:180}}, legsAt(100))
});
// Use one coordinate system at both ends, so the wrist actually travels.
DEMO.bbrow.anim.A.arm = {ik:add(add([85,104],dir(55),52),[0,1],56.8),b:'back',hA:180};
const dbRow = DEMO.dbrow.anim;
dbRow.A.armN = {ik:add(add(dbRow.A.hip,dir(dbRow.A.torso),52),[0,1],56.8), b:'back',hA:180};
dbRow.B.armN = {ik:add(add(dbRow.B.hip,dir(dbRow.B.torso),16),[Math.cos(70*D2R),Math.sin(70*D2R)],13), b:'back',hA:180};
/* тяга к животу сидя: корпус работает вместе с руками — из небольшого наклона вперёд (лопатки вперёд)
   в небольшое отклонение назад (10–15°), как в гребле; больше — уже раскачивание */
for (const id of ['cablerow','bandrow']) {
  const a = DEMO[id].anim, hip = a.A.hip;
  a.A.torso = 14; a.B.torso = -10;
  a.A.arm = {ik:add(add(hip,dir(14),52),[50,20]),b:'back',hA:90};
  a.B.arm = {ik:add(add(hip,dir(-10),52),[12,26]),b:'back',hA:90};
}
fixMotion('deadlift', {sample(t) {
  const angle = 65*(1-t), shoulder = [100,105*(1-t)+43.1*t];
  return Object.assign({hip:add(shoulder,dir(angle),-52),torso:angle,arm:{a:[180,180],hA:180}},legsAt(100));
}});
fixMotion('rdl', {sample(t) {
  const a = (178.63-33.63*t)*D2R, hip = [100-83.65*Math.sin(a),180+83.65*Math.cos(a)];
  const torso = Math.asin(Math.min(.99,(100-hip[0])/52))/D2R;
  return Object.assign({hip,torso,arm:{a:[180,180],hA:180}},legsAt(100));
}});
fixMotion('kbswing', {sample(t) {
  const h = 1-(1-t)*(1-t), a = 207-117*t;
  return Object.assign({hip:[64+34*h,112-15.7*h],torso:60*(1-h),arm:{a:[a,a]}},legsAt(100));
}, timing:[.7,.08,1.2,.12]});
for (const id of ['crunch','declinecrunch']) {
  const a = DEMO[id].anim;
  a.A.flex = 0; a.B.flex = id === 'crunch' ? 34 : 40;
  a.B.torso = a.A.torso; a.B.head = 8;
}
for (const id of ['latraise','bandlatraise','cablelat','dbpress']) DEMO[id].anim.planarArms = true;
for (const id of ['pullup','chinup']) {
  const a = DEMO[id].anim, half = id === 'pullup' ? 34 : 15;
  a.A.c = [100,128]; a.B.c = [100,83];
  for (const P of [a.A,a.B]) {
    P.armR = {ik:[100+half,25.5],b:'fwd',hA:0};
    P.armL = {ik:[100-half,25.5],b:'back',hA:0};
  }
}
// A rigid handle and a fixed grip width for the front-view pulldown.
for (const [P,y] of [[DEMO.latpull.anim.A,30.5],[DEMO.latpull.anim.B,91]]) {
  P.armR = {ik:[143,y],b:'fwd',hA:0}; P.armL = {ik:[57,y],b:'back',hA:0};
}
// Keep the Smith bar on its rail, independent of wrist rotation.
const smith = DEMO.smithincline.anim;
smith.props = smith.props.map(p => p.k === 'plate' ? Object.assign({},p,{at:'grips'}) : p);
for (const P of [smith.A,smith.B]) {P.arm.ik[0] = 86; P.arm.hA = 0;}
// When landing from the jump, hands travel around the shoulder instead of
// through it. Interpolate arm angles for that transition, keeping the later
// ground-contact targets for the squat-to-plank transition.
const burpee = DEMO.burpee.anim;
const burpeeFrames = burpee.keys;
const burpeeArms = burpeeFrames.slice(0,2).map(P=>{
  const J=solveSide(P,null);return [angOf(sub(J.elN,J.sh)),angOf(sub(J.wrN,J.elN))];
});
burpeeArms[1]=burpeeArms[1].map((a,i)=>a<burpeeArms[0][i]?a+360:a);
burpee.sample=t=>{
  const x=Math.min(3-1e-9,Math.max(0,t*3)),i=Math.floor(x),q=x-i;
  const P=lerpSpec(burpeeFrames[i],burpeeFrames[i+1],q);
  if(i===0)P.arm={a:burpeeArms[0].map((a,j)=>a+(burpeeArms[1][j]-a)*q),hA:180*q};
  return P;
};
const eccFirst = new Set('pushup diamond dip bbbench dbbench dbincline smithincline dbfly hyper pikepush skull benchdip ohext bulgarian rdl squat goblet airsquat lunge legpress smithsquat inclinebb declinebb closegrip pullover declinepush goodmorning rollout'.split(' '));
const isometric = new Set(['plank','sideplank','hang']);
const MOTION_CUES = {
  bbrow:['Локти ведут снаряд к поясу. Корпус сохраняет положение.','Опускайте штангу подконтрольно, постепенно разгибая руки.'],
  dbrow:['Ведите локоть назад. Таз и грудная клетка не разворачиваются.','Верните гантель под плечо. Опора на скамью сохраняется.'],
  cablerow:['Тяните рукоять к животу, ведите локти назад.','Разгибайте руки с контролем, сохраняйте положение корпуса.'],
  bandrow:['Согните локти и подтяните ленту к поясу.','Верните руки вперёд без рывка и раскачивания корпуса.'],
  kbswing:['Разгибание таза сообщает гире движение. Руки остаются длинными.','Встречайте гирю отведением таза назад; не приседайте за ней.'],
  deadlift:['Отталкивайте пол ногами. Руки прямые, гриф движется вдоль ног.','Сначала отведите таз назад, затем сгибайте колени.'],
  rdl:['Таз назад, колени мягкие. Руки удерживают снаряд без сгибания.','Разогните таз, сохраняя контроль спины и прямые руки.'],
  crunch:['Приближайте рёбра к тазу, постепенно отрывая лопатки.','Разверните грудную клетку обратно, без броска на пол.'],
  declinecrunch:['Скручивайте грудную клетку к тазу; не садитесь целиком.','Плавно вернитесь на скамью, сохраняя контроль корпуса.'],
  latraise:['Ведите локти через стороны до уровня плеч.','Опускайте руки по дуге, без раскачивания.'],
  bandlatraise:['Поднимайте локти через стороны; плечи не тяните к ушам.','Плавно уменьшайте натяжение ленты.'],
  dbpress:['Выжмите гантели над головой без помощи поясницей.','Опускайте гантели подконтрольно к исходному положению.'],
  pullup:['Тяните корпус к неподвижной перекладине, направляя локти вниз.','Опускайтесь с контролем; кисти сохраняют хват.'],
  chinup:['Подтягивайте корпус к перекладине без раскачивания.','Плавно разгибайте руки, сохраняя хват.'],
  squat:['Сгибайте колени и тазобедренные суставы, опирайтесь всей стопой.','Разгибайте ноги и таз согласованно, без рывка корпусом.']
};
for (const ex of EX) {
  ex.anim.eccFirst = eccFirst.has(ex.id);
  ex.anim.hold = isometric.has(ex.id);
  ex.anim.cues = MOTION_CUES[ex.id] || [ex.tech[1] || ex.tech[0],ex.tech[ex.tech.length-1]];
}
/* Подсказки по фазам: [рабочая фаза (усилие), возврат]. Для удержаний — одна реплика. Для кардио — [разгон, приземление/возврат]. */

/* ===================== СОБСТВЕННЫЙ ВЕС 3.7 ===================== */
/* отклонение назад от опоры: тело прямое от голеностопа до плеч, наклон theta° от вертикали, кисти на якоре */
const leanBack = (theta, ankle, grip) => { const t = theta * D2R, sh = [ankle[0] - 137 * Math.sin(t), ankle[1] - 137 * Math.cos(t)]; return {hip:add(sh, dir(-theta), -FL.torso), torso:-theta, arm:{ik:grip, b:'down'}, leg:{a:[180 - theta, 180 - theta], f:90}}; };
EX.push(
/* --- отжимания: лестница сложности --- */
{id:'wallpush', name:'Отжимания от стены', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Встаньте в шаге от стены, ладони на стене на уровне груди, чуть шире плеч.', 'Сгибайте локти, приближая грудь к стене; тело прямое, пятки на полу.', 'Оттолкнитесь до прямых рук.'],
 err:['Прогиб в пояснице', 'Локти разведены под 90°', 'Слишком близко к стене — нет нагрузки'],
 breath:'Вдох к стене, выдох от стены.',
 anim:{view:'side',
  A:{hip:[84, 100], torso:12, arm:{a:[96, 94], hA:0}, leg:{ik:[70, 180], b:'fwd', f:90}},
  B:{hip:[94, 98], torso:22, arm:{a:[120, 48], hA:0}, leg:{ik:[70, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[132, 0], [132, GROUND]], w:6, cls:'eq-rail'}]}},
{id:'inclinepush', name:'Отжимания с рук на возвышении', eq:[['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Ладони на скамье или устойчивом возвышении чуть шире плеч, тело прямое от пяток до макушки.', 'Опускайте грудь к краю скамьи, локти под 45° к корпусу.', 'Выжмите себя до прямых рук.'],
 err:['Провисание таза', 'Голова тянется вниз раньше груди', 'Неполная амплитуда'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:plankA([10, 171], 58, {arm:{ik:[128, 136], b:'back', hA:90}}),
  B:plankA([10, 171], 66, {arm:{ik:[128, 136], b:'back', hA:90}}),
  props:benchFlat(104, 160, 139)}},
{id:'kneepush', name:'Отжимания с колен', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Упор на ладони и колени, голени можно скрестить. От колен до макушки — прямая линия, таз не «сидит» назад.', 'Опускайте грудь к полу, локти под 45° к корпусу.', 'Выжмите себя вверх до прямых рук.'],
 err:['Таз отставлен назад — работают только руки', 'Прогиб в пояснице', 'Локти в стороны'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:hipFromSh([126, 124], 54), torso:54, arm:{ik:[139, 181], b:'back', hA:90}, leg:{a:[234, 270], f:250}},
  B:{hip:hipFromSh([141, 157], 76), torso:76, arm:{ik:[139, 181], b:'back', hA:90}, leg:{a:[256, 270], f:250}}}},
{id:'widepush', name:'Отжимания широким хватом', eq:[], g:'chest', pri:['chest'], sec:['delt_f', 'triceps'], type:'c', lvl:2,
 tech:['Ладони в полтора раза шире плеч, пальцы слегка наружу. Тело прямое.', 'Опускайтесь, пока грудь не окажется в 3–5 см от пола; локти уходят в стороны, но не выше плеч.', 'Выжмите себя вверх, сводя грудные.'],
 err:['Локти выше плеч — нагрузка на плечевые суставы', 'Провисание таза'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 100], arm:{p:[[30, 18], [34, 46]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[100, 100], arm:{p:[[34, 4], [36, 12]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  props:[{k:'rect', x:46, y:0, w:108, h:190, rx:14, cls:'eq-mat', layer:'back'}], viewNote:'вид сверху'}},
{id:'archer', name:'Отжимания «лучник»', eq:[], g:'chest', pri:['chest', 'triceps'], sec:['delt_f', 'abs'], type:'c', lvl:3, uni:true,
 tech:['Ладони широко. Опускайтесь к одной руке, вторая выпрямляется в сторону и скользит по полу.', 'Грудь к рабочей ладони, локоть вдоль корпуса.', 'Выжмите себя в центр и повторите на другую сторону.'],
 err:['Разворот корпуса', 'Опорная рука не вертикальна', 'Таз провисает'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 100], armR:{p:[[32, 20], [36, 46]]}, armL:{p:[[32, 20], [36, 46]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[108, 100], armR:{p:[[16, 4], [14, 16]]}, armL:{p:[[30, 2], [58, 3]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  props:[{k:'rect', x:40, y:0, w:124, h:190, rx:14, cls:'eq-mat', layer:'back'}], viewNote:'вид сверху'}},
{id:'declinepike', name:'Отжимания в упоре углом с ногами на возвышении', eq:[['bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'traps'], type:'c', lvl:3,
 tech:['Стопы на скамье, таз поднят высоко, корпус почти вертикален, ладони на ширине плеч.', 'Опускайте макушку к полу, сгибая локти; локти идут вперёд-вниз, не в стороны.', 'Выжмите себя до прямых рук.'],
 err:['Таз опускается — получаются наклонные отжимания', 'Удар головой о пол', 'Локти в стороны'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[86, 62], torso:150, arm:{ik:[124, 181], b:'back', hA:90}, leg:{ik:[30, 134], b:'fwd', f:160}},
  B:{hip:[100, 84], torso:160, arm:{ik:[124, 181], b:'back', hA:90}, leg:{ik:[30, 134], b:'fwd', f:160}},
  props:benchFlat(0, 48, 140)}},

/* --- спина без турника --- */
{id:'superman', name:'Лодочка', eq:[], g:'back', pri:['lowback'], sec:['glutes', 'delt_r', 'midback'], type:'i', lvl:1,
 tech:['Лягте на живот, руки вытянуты вперёд, носки оттянуты.', 'Одновременно поднимите грудь, руки и ноги на несколько сантиметров, взгляд в пол.', 'Задержитесь на 1–2 секунды и опуститесь.'],
 err:['Запрокидывание головы', 'Рывок', 'Задержка дыхания'],
 breath:'Выдох на подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[100, 176], torso:92, head:-24, arm:{a:[94, 94], hA:94}, leg:{a:[270, 270], fr:-90}},
  B:{hip:[100, 173], torso:80, head:-22, arm:{a:[66, 66], hA:66}, leg:{a:[256, 256], fr:-90}}}},
{id:'ytw', name:'Разведения лёжа «Y-T-W»', eq:[], g:'back', pri:['midback', 'delt_r'], sec:['traps', 'lowback'], type:'i', lvl:1,
 tech:['Лягте на живот, лоб на полотенце. Поднимите прямые руки вперёд-в стороны буквой Y, большие пальцы вверх.', 'Опустите, затем поднимите руки точно в стороны (T), затем согните локти под 90° и поднимите (W).', 'Три положения — одно повторение. Лопатки сводите в каждом.'],
 err:['Подъём корпуса вместо рук', 'Плечи поднимаются к ушам', 'Рывки'],
 breath:'Выдох на подъёме рук, вдох при опускании.',
 anim:{view:'front', noGround:true, period:3600,
  keys:[{c:[100, 108], arm:{p:[[28, -14], [52, -26]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
   {c:[100, 108], arm:{p:[[30, 0], [58, 0]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
   {c:[100, 108], arm:{p:[[26, 2], [30, -22]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}}],
  viewNote:'вид сверху'}},
{id:'towelrow', name:'Тяга полотенца у двери', eq:[], g:'back', pri:['lats', 'midback'], sec:['biceps', 'forearms'], type:'c', lvl:1,
 tech:['Перекиньте полотенце через ручки закрытой двери, возьмите концы, стопы у двери. Отклонитесь назад на прямых руках.', 'Тяните грудь к двери, ведя локти назад и сводя лопатки.', 'Плавно вернитесь до прямых рук. Чем ниже наклон, тем тяжелее.'],
 err:['Провисание таза', 'Тяга плечами вверх', 'Резкий возврат'],
 breath:'Выдох при тяге, вдох при возврате.',
 note:'Убедитесь, что дверь закрыта и ручки надёжны.',
 anim:{view:'side', A:leanBack(18, [144, 180], [148, 86]), B:leanBack(6, [144, 180], [148, 86]),
  props:[{k:'line', pts:[[150, 20], [150, GROUND]], w:5, cls:'eq-rail'}, {k:'circle', c:[148, 86], r:4}, {k:'band', from:[148, 86], at:'gripN', layer:'front', cls:'eq-cable'}]}},
{id:'tablerow', name:'Тяга под столом', eq:[], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:2,
 tech:['Лягте под прочный стол, возьмитесь за край хватом сверху, пятки на полу, тело прямое.', 'Подтяните грудь к столешнице, сводя лопатки.', 'Опуститесь до прямых рук. Согните колени, чтобы облегчить.'],
 err:['Провисание таза', 'Тяга подбородком', 'Рывок'],
 breath:'Выдох при тяге, вдох при опускании.',
 note:'Стол должен выдерживать ваш вес; край — без острых кромок.',
 anim:{view:'side', A:invPose(10), B:invPose(28),
  props:[{k:'rect', x:20, y:106, w:120, h:6}, {k:'line', pts:[[26, 112], [26, GROUND]], w:4}, {k:'line', pts:[[134, 112], [134, GROUND]], w:4}]}},
{id:'reversesnow', name:'Обратные «снежные ангелы»', eq:[], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Лягте на живот, руки вдоль тела ладонями вниз, грудь слегка приподнята.', 'Медленно ведите прямые руки по дуге через стороны вверх над головой, не касаясь пола.', 'Верните по той же дуге. Лопатки опущены всё время.'],
 err:['Плечи к ушам', 'Руки касаются пола', 'Подъём корпуса рывком'],
 breath:'Ровное дыхание, без задержек.',
 anim:{view:'front', noGround:true, period:3400,
  A:{c:[100, 108], arm:{p:[[6, 28], [8, 54]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[100, 108], arm:{p:[[22, -22], [12, -48]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  viewNote:'вид сверху'}},

/* --- ноги --- */
{id:'wallsit', name:'Стульчик у стены', eq:[], g:'quads', pri:['quads'], sec:['glutes'], type:'i', lvl:1, kind:'time',
 tech:['Спина прижата к стене, стопы впереди на ширине таза.', 'Съезжайте, пока бёдра не станут параллельны полу; колени над пятками, угол 90°.', 'Удерживайте положение заданное время, руки не на бёдрах.'],
 err:['Колени впереди носков', 'Таз выше колен', 'Руки упираются в бёдра'],
 breath:'Спокойное дыхание.',
 anim:{view:'side',
  A:{hip:[84, 138], torso:0, arm:{a:[180, 180]}, leg:{ik:[128, 180], b:'fwd', f:90}},
  B:{hip:[84, 137], torso:0, arm:{a:[180, 180]}, leg:{ik:[128, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[72, 0], [72, GROUND]], w:6, cls:'eq-rail'}]}},
{id:'revlunge', name:'Обратные выпады', eq:[], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Стоя, сделайте шаг назад и опуститесь, пока заднее колено почти не коснётся пола.', 'Переднее колено над стопой, корпус вертикален.', 'Оттолкнитесь передней ногой и вернитесь в стойку. Чередуйте ноги.'],
 err:['Короткий шаг', 'Наклон корпуса вперёд', 'Колено внутрь'],
 breath:'Вдох на шаге назад, выдох на возврате.',
 anim:{view:'side', period:3200,
  keys:[stand({arm:{a:[180, 180]}}),
   {hip:[92, 118], torso:4, arm:{a:[180, 180]}, legN:{ik:[100, 180], b:'fwd', f:90}, legF:{ik:[56, 178], b:'fwd', f:150}},
   {hip:[90, 141], torso:4, arm:{a:[180, 180]}, legN:{ik:[100, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}}],
  props:DB_SIDES('perp', 'db')}},
{id:'sidelunge', name:'Боковые выпады', eq:[], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Стопы широко, носки вперёд.', 'Сгибайте одну ногу, отводя таз назад и в сторону; вторая нога прямая, стопа на полу целиком.', 'Оттолкнитесь и вернитесь в центр, затем в другую сторону.'],
 err:['Колено заваливается внутрь', 'Отрыв стопы прямой ноги', 'Округление спины'],
 breath:'Вдох при опускании, выдох при возврате.',
 anim:{view:'front',
  A:{c:[100, 97], arm:{p:[[2, 29], [3, 56]]}, leg:{p:[[22, 38], [30, 80]], fd:[6, 3]}},
  B:{c:[122, 128], armR:{p:[[-6, 24], [-18, 36]]}, armL:{p:[[-6, 24], [-18, 36]]}, legR:{p:[[8, 22], [10, 50]], fd:[6, 3]}, legL:{p:[[52, 24], [62, 50]], fd:[8, 3]}}}},
{id:'pistolbox', name:'Приседания на одной ноге на скамью', eq:[['bench']], g:'quads', pri:['quads', 'glutes'], sec:['hams', 'abs'], type:'c', lvl:2, uni:true,
 tech:['Встаньте спиной к скамье на одной ноге, вторую вытяните вперёд, руки перед собой.', 'Медленно опускайтесь до касания скамьи, колено опорной ноги по носку.', 'Встаньте без отталкивания от скамьи. Чем ниже скамья, тем тяжелее.'],
 err:['Падение на скамью', 'Колено внутрь', 'Отрыв пятки'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[92, 98], torso:6, arm:{a:[90, 88]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[86, 90], f:120}},
  B:{hip:[82, 136], torso:30, arm:{a:[80, 76]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[72, 70], f:110}},
  props:benchFlat(20, 76, 140)}},
{id:'sllift', name:'Румынская тяга на одной ноге', eq:[], opt:['db'], g:'hams', pri:['hams', 'glutes'], sec:['lowback', 'calves'], type:'c', lvl:2, uni:true,
 tech:['Стоя на одной ноге, колено мягкое. Наклоняйтесь, отводя свободную ногу назад; тело от макушки до пятки — одна линия.', 'Опускайтесь, пока корпус не станет почти параллелен полу.', 'Вернитесь, разгибая таз. Затем смените ногу.'],
 err:['Раскрытие таза вбок', 'Округление спины', 'Сгибание опорного колена, как в приседе'],
 breath:'Вдох при наклоне, выдох при подъёме.',
 anim:{view:'side',
  A:{hip:[92, 97], torso:-2, arm:{a:[180, 180]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[184, 182], f:92}},
  B:{hip:[80, 102], torso:80, arm:{a:[180, 180]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[278, 276], f:200}},
  props:[{k:'db', at:'gripN', o:'end', layer:'front', if:'db'}]}},
{id:'glutebridge1', name:'Ягодичный мостик на одной ноге', eq:[], g:'glutes', pri:['glutes'], sec:['hams', 'abs'], type:'c', lvl:2, uni:true,
 tech:['Лёжа на спине, одна стопа у таза, вторая нога вытянута вверх или согнута к груди.', 'Поднимите таз на опорной ноге до прямой линии плечи–колено.', 'Таз не перекашивается. Опуститесь с контролем.'],
 err:['Перекос таза', 'Прогиб в пояснице', 'Упор на носок'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:hipFromSh([58, 176], -90), torso:-90, head:0, arm:{a:[90, 90], hA:90}, legN:{ik:[146, 180], b:'up', f:90}, legF:{a:[-10, -8], fr:-80}},
  B:{hip:hipFromSh([58, 176], -122), torso:-122, head:30, arm:{a:[90, 90], hA:90}, legN:{ik:[146, 180], b:'up', f:90}, legF:{a:[-30, -28], fr:-80}}}},
{id:'nordic', name:'Скандинавские сгибания', eq:[], g:'hams', pri:['hams'], sec:['glutes', 'calves'], type:'c', lvl:3,
 tech:['Встаньте на колени, стопы зафиксированы под опорой или партнёром. Тело от колен до головы — прямое.', 'Медленно опускайте корпус вперёд, сопротивляясь задней поверхностью бедра как можно дольше.', 'Внизу примите вес на руки, оттолкнитесь и вернитесь. Таз не сгибается.'],
 err:['Сгибание в тазобедренном суставе', 'Падение без контроля', 'Слишком быстрый возврат руками'],
 breath:'Вдох при опускании, выдох при возврате.',
 note:'Стопы должны быть надёжно закреплены.',
 anim:{view:'side',
  A:{hip:[96, 137], torso:0, arm:{a:[168, 100], hA:100}, leg:{a:[180, 270], f:200}},
  B:{hip:[132.5, 157], torso:58, arm:{a:[150, 150], hA:150}, leg:{a:[238, 270], f:200}},
  props:[{k:'rect', x:46, y:166, w:22, h:9, rx:3, cls:'eq-pad'}, {k:'line', pts:[[57, 166], [57, 150]], w:4}]}},
{id:'calf1', name:'Подъём на носок на одной ноге', eq:[], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1, uni:true,
 tech:['Стоя на одной ноге носком на краю ступени, рукой держитесь за опору.', 'Поднимитесь на носок максимально высоко, задержитесь на секунду.', 'Опуститесь ниже уровня ступени, растягивая икру.'],
 err:['Пружинящие повторы', 'Сгибание колена', 'Помощь рукой'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[92, 98], torso:0, arm:{ik:[124, 90], b:'down'}, legN:{ik:[96, 180], b:'fwd', f:90}, legF:{a:[180, 240], f:140}},
  B:{hip:[94, 88], torso:0, arm:{ik:[124, 90], b:'down'}, legN:{ik:[97, 172], b:'fwd', f:130}, legF:{a:[180, 240], f:140}},
  props:[{k:'rect', x:84, y:174, w:40, h:12}, {k:'line', pts:[[130, 60], [130, GROUND]], w:5, cls:'eq-rail'}]}},

/* --- пресс --- */
{id:'deadbug', name:'«Мёртвый жук»', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Лёжа на спине, руки вверх, бёдра вертикально, колени под 90°, поясница прижата.', 'Медленно опустите правую руку за голову и выпрямите левую ногу к полу, не отрывая поясницу.', 'Вернитесь и повторите на другую сторону.'],
 err:['Отрыв поясницы от пола', 'Быстрый темп', 'Задержка дыхания'],
 breath:'Выдох при разгибании, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, arm:{a:[-90, -90], hA:-90}, leg:{a:[-2, 90], fr:-90}},
  B:{hip:[112, 175], torso:-90, armN:{a:[-176, -176], hA:-176}, armF:{a:[-90, -90], hA:-90}, legN:{a:[62, 70], fr:-90}, legF:{a:[-2, 90], fr:-90}}}},
{id:'birddog', name:'«Птица-собака»', eq:[], g:'abs', pri:['abs', 'lowback'], sec:['glutes', 'delt_f'], type:'i', lvl:1,
 tech:['Встаньте на четвереньки, ладони под плечами, колени под тазом.', 'Одновременно вытяните правую руку вперёд и левую ногу назад до линии корпуса.', 'Задержитесь на 2 секунды, вернитесь и смените сторону. Таз не поворачивается.'],
 err:['Прогиб поясницы при подъёме ноги', 'Разворот таза', 'Нога выше корпуса'],
 breath:'Ровное дыхание.',
 anim:{view:'side',
  A:{hip:[70, 128], torso:90, head:-10, arm:{ik:[120, 181], b:'back', hA:90}, leg:{a:[180, 270], f:200}},
  B:{hip:[70, 128], torso:90, head:-10, armN:{a:[90, 90], hA:90}, armF:{ik:[120, 181], b:'back', hA:90}, legN:{a:[270, 270], fr:-90}, legF:{a:[180, 270], f:200}}}},
{id:'hollow', name:'Удержание «лодочки» на спине', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:2, kind:'time',
 tech:['Лёжа на спине, прижмите поясницу к полу, руки вдоль тела или вверх.', 'Оторвите лопатки и прямые ноги от пола на 15–20 см; тело в форме пологой дуги.', 'Удерживайте положение. Чем ниже ноги и дальше руки, тем тяжелее.'],
 err:['Прогиб в пояснице', 'Подбородок к груди слишком сильно', 'Задержка дыхания'],
 breath:'Ровное дыхание, без задержек.',
 anim:{view:'side',
  A:{hip:[108, 176], torso:-70, head:12, arm:{a:[-66, -66], hA:-66}, leg:{a:[70, 70], fr:-80}},
  B:{hip:[108, 176], torso:-71, head:12, arm:{a:[-67, -67], hA:-67}, leg:{a:[71, 71], fr:-80}}}},
{id:'bicycle', name:'«Велосипед»', eq:[], g:'abs', pri:['obliques', 'abs'], sec:[], type:'i', lvl:1,
 tech:['Лёжа на спине, руки за головой, лопатки оторваны, ноги подняты.', 'Тяните правый локоть к левому колену, выпрямляя правую ногу; затем наоборот.', 'Темп средний, поясница прижата.'],
 err:['Тяга головы руками', 'Слишком быстро — работают сгибатели бедра', 'Поясница отрывается'],
 breath:'Выдох на скручивании.',
 anim:{view:'side', period:1800,
  A:{hip:[112, 176], torso:-62, head:12, arm:{ra:[160, -10]}, legN:{a:[30, 120], fr:-90}, legF:{a:[76, 76], fr:-80}},
  B:{hip:[112, 176], torso:-62, head:12, arm:{ra:[160, -10]}, legN:{a:[76, 76], fr:-80}, legF:{a:[30, 120], fr:-90}}}},
{id:'plankup', name:'Планка с подъёмом на руки', eq:[], g:'abs', pri:['abs', 'triceps'], sec:['delt_f', 'chest'], type:'c', lvl:2,
 tech:['Из планки на предплечьях поставьте одну ладонь, затем вторую, выпрямив руки.', 'Опуститесь обратно на предплечья в том же порядке.', 'Таз не раскачивается; меняйте ведущую руку каждое повторение.'],
 err:['Раскачка таза', 'Провисание поясницы', 'Одна ведущая рука всегда'],
 breath:'Ровное дыхание.',
 anim:{view:'side',
  A:plankA([5, 171], 81.6, {arm:{a:[180, 90]}}),
  B:plankA([10, 171], 70.4, {arm:{ik:[139, 181], b:'back', hA:90}})}},

/* --- руки без снаряда --- */
{id:'chairdip', name:'Отжимания от стула', eq:[], g:'triceps', pri:['triceps'], sec:['chest', 'delt_f'], type:'c', lvl:1,
 tech:['Сядьте на край устойчивого стула, ладони рядом с бёдрами, сместите таз вперёд. Ноги согнуты.', 'Опускайтесь, сгибая локти назад до угла 90°.', 'Выжмите себя вверх.'],
 err:['Локти в стороны', 'Слишком глубоко — боль в плечах', 'Таз далеко от опоры'],
 breath:'Вдох вниз, выдох вверх.',
 anim:{view:'side',
  A:{hip:[90, 124], torso:0, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[140, 180], b:'up', f:90}},
  B:{hip:[88, 150], torso:-2, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[140, 180], b:'up', f:90}},
  props:[{k:'rect', x:40, y:129, w:42, h:8}, {k:'line', pts:[[46, 137], [46, GROUND]], w:4}, {k:'line', pts:[[76, 137], [76, GROUND]], w:4}]}},
{id:'towelcurl', name:'Сгибание рук с полотенцем', eq:[], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Наступите на середину полотенца, концы в руках хватом снизу. Натяните его.', 'Сгибайте руки, сопротивляясь ногой: тянете сильнее, чем позволяете.', 'Опускайте 3–4 секунды, продолжая тянуть.'],
 err:['Слабое натяжение — нет нагрузки', 'Локти вперёд', 'Раскачка'],
 breath:'Выдох при сгибании, вдох при опускании.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'band', from:'anN', foff:[4, 3], at:'gripN', layer:'front', cls:'eq-cable'}]}}
);
/* полотенце: тонкий серый трос вместо зелёной ленты */
for (const id of ['towelrow', 'towelcurl']) for (const p of EXI_LATE(id).anim.props || []) if (p.k === 'band') p.cls = 'eq-cable';
function EXI_LATE(id) { return EX.find(e => e.id === id); }

/* ===================== ТРЕНАЖЁРЫ И ВАРИАНТЫ ===================== */
/* Дополнительное оборудование зала и кардио-тренажёры. Подключается после базовой базы: EQUIP.push + EX.push. */
EQUIP.push(
  {id:'hack', name:'Гакк-машина', cat:'mach', hint:'присед с опорой спиной на наклонные салазки'},
  {id:'chestpress', name:'Жим от груди сидя', cat:'mach', hint:'рычажный или блочный, с упором спиной'},
  {id:'shoulderpress', name:'Жим сидя (плечи)', cat:'mach'},
  {id:'leverrow', name:'Рычажная тяга', cat:'mach', hint:'тяга к поясу с упором грудью'},
  {id:'tbar', name:'Т-гриф', cat:'mach', hint:'тяга закреплённого грифа в наклоне'},
  {id:'gravitron', name:'Гравитрон', cat:'mach', hint:'подтягивания и отжимания на брусьях с противовесом'},
  {id:'abductor', name:'Сведение / разведение ног', cat:'mach'},
  {id:'calfseat', name:'Икры сидя', cat:'mach'}, {id:'calfstand', name:'Икры стоя', cat:'mach'},
  {id:'treadmill', name:'Беговая дорожка', cat:'cardio'}, {id:'bike', name:'Велотренажёр', cat:'cardio'},
  {id:'rower', name:'Гребной тренажёр', cat:'cardio'}, {id:'elliptical', name:'Эллипс', cat:'cardio'}, {id:'stairs', name:'Степпер / лестница', cat:'cardio'}
);
EQUIP_CATS.push({id:'cardio', name:'Кардио-тренажёры'});
EQUIP_PRESETS.find(p => p.id === 'gym').eq = EQUIP.map(e => e.id);

/* сидячая стойка тренажёра сбоку: сиденье, спинка под углом a от вертикали, стойка */
const seatRig = (hip, a = -8, back = 60) => {
  const u = dir(a), n = [-u[1], u[0]];
  return [
    {k:'line', pts:[add(add(hip, u, -4), n, -11), add(add(hip, u, back), n, -11)], w:8, cls:'eq-pad-s'},
    {k:'rect', x:hip[0] - 12, y:hip[1] + 9, w:40, h:7},
    {k:'line', pts:[[hip[0] + 6, hip[1] + 16], [hip[0] + 6, GROUND]], w:5}, {k:'line', pts:[[hip[0] - 24, GROUND], [hip[0] + 40, GROUND]], w:4}
  ];
};
/* кардио: стойка с консолью */
const cardioConsole = (x, y) => [{k:'line', pts:[[x, y + 24], [x, GROUND]], w:4}, {k:'rect', x:x - 10, y:y, w:20, h:12, rx:3, cls:'eq-pad'}];

EX.push(
/* ===== ГРУДЬ ===== */
{id:'chestpressm', name:'Жим от груди в тренажёре', eq:[['chestpress']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Отрегулируйте сиденье: рукояти на уровне середины груди, спина и затылок у спинки.',
   'Выжмите рукояти вперёд до почти прямых рук, не отрывая лопатки от спинки.',
   'Медленно верните, пока локти не уйдут чуть за линию корпуса; вес не кладите на стек.'],
 err:['Плечи уходят вперёд в конце жима', 'Поясница отрывается от спинки', 'Сброс веса на стек'],
 breath:'Выдох при жиме, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[70, 130], torso:-8, arm:{ik:[108, 100], b:'down', hA:90}, leg:{ik:[134, 180], b:'up', f:90}},
  B:{hip:[70, 130], torso:-8, arm:{ik:[150, 92], b:'down', hA:90}, leg:{ik:[134, 180], b:'up', f:90}},
  props:[...seatRig([70, 130], -8, 62), {k:'line', pts:[[160, 40], [160, GROUND]], w:5}, {k:'seg', a:'gripN', b:'gripN', boff:[0, 0], aoff:[0, -22], w:3.5, layer:'front'},
   {k:'cable', from:[158, 60], at:'gripN', off:[0, -22], layer:'front'}]}},
{id:'smithbench', name:'Жим лёжа в машине Смита', eq:[['smith'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Поставьте скамью так, чтобы гриф опускался на нижнюю часть груди. Лопатки сведены, стопы на полу.',
   'Снимите гриф поворотом кистей, опустите к груди под контролем.',
   'Выжмите вверх по направляющим; в конце подхода поверните кисти и поставьте гриф на крюки.'],
 err:['Скамья стоит так, что гриф идёт на горло или живот', 'Отбив от груди', 'Отрыв таза'],
 breath:'Вдох при опускании, выдох при жиме.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 70], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[70, 110], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), {k:'line', pts:[[70, 6], [70, GROUND]], w:3, cls:'eq-rail'}, PLATE(16)]}},
{id:'cablelowfly', name:'Сведение рук в кроссовере снизу', eq:[['cable']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Рукояти на нижних блоках, шаг вперёд, корпус чуть наклонён, локти слегка согнуты.',
   'Сведите руки по дуге снизу вверх до уровня плеч, будто обнимаете большой мяч.',
   'Медленно разведите руки вниз и в стороны, растягивая грудь.'],
 err:['Руки работают из локтей, а не из плеч', 'Корпус раскачивается', 'Плечи поднимаются к ушам'],
 breath:'Выдох при сведении, вдох при разведении.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[27, 14], [50, 30]]}}),
  B:frontStand({arm:{p:[[12, 16], [-10, 2]]}}),
  props:[{k:'line', pts:[[24, 8], [24, GROUND]], w:5}, {k:'line', pts:[[176, 8], [176, GROUND]], w:5},
   {k:'cable', from:[30, 176], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[170, 176], at:'gripR', handle:true, layer:'front'}]}},

/* ===== СПИНА ===== */
{id:'leverrowm', name:'Рычажная тяга к поясу', eq:[['leverrow']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Сядьте, грудь на упоре, стопы на платформе, возьмитесь за рукояти нейтральным хватом.',
   'Тяните рукояти к себе, ведя локти назад вдоль корпуса и сводя лопатки; грудь не отрывается от упора.',
   'Плавно верните, давая лопаткам разойтись, но не круглите спину.'],
 err:['Отрыв груди от упора', 'Тяга плечами вверх', 'Рывок в начале'],
 breath:'Выдох при тяге, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[70, 132], torso:8, arm:{ik:[136, 104], b:'back', hA:90}, leg:{ik:[132, 180], b:'up', f:90}},
  B:{hip:[70, 132], torso:8, arm:{ik:[98, 110], b:'back', hA:90}, leg:{ik:[132, 180], b:'up', f:90}},
  props:[...seatRig([70, 132], 8, 0).slice(1), {k:'line', pts:[[96, 76], [96, 118]], w:8, cls:'eq-pad-s'}, {k:'line', pts:[[96, 118], [120, GROUND]], w:5},
   {k:'line', pts:[[150, 60], [150, GROUND]], w:5}, {k:'seg', a:'gripN', b:'gripN', aoff:[0, 0], boff:[18, 28], w:4, layer:'front'}]}},
{id:'tbarrow', name:'Тяга Т-грифа в наклоне', eq:[['tbar']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'lowback', 'delt_r'], type:'c', lvl:2,
 tech:['Встаньте над грифом, колени чуть согнуты, корпус наклонён на 45°, спина прямая.',
   'Возьмитесь за рукоять узким хватом и тяните её к животу, сводя лопатки.',
   'Опустите под контролем до почти прямых рук, не меняя угол корпуса.'],
 err:['Округление поясницы', 'Разгибание корпуса рывком', 'Тяга к груди с локтями в стороны'],
 breath:'Выдох при тяге, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[80, 112], torso:52, arm:{ik:[122, 160], b:'back', hA:90}, leg:{ik:[90, 180], b:'fwd', f:90}},
  B:{hip:[80, 112], torso:52, arm:{ik:[114, 116], b:'back', hA:90}, leg:{ik:[90, 180], b:'fwd', f:90}},
  props:[{k:'circle', c:[40, 180], r:5, cls:'eq-steel-f'}, {k:'seg', a:'gripN', b:'gripN', aoff:[0, 0], boff:[-82, 20], w:4, layer:'back'}, {k:'plate', at:'gripN', off:[-6, 8], r:11, layer:'mid'}]}},
{id:'assistpull', name:'Подтягивания в гравитроне', eq:[['gravitron']], assist:true, g:'back', pri:['lats'], sec:['biceps', 'midback'], type:'c', lvl:1,
 tech:['Выставьте противовес: чем он больше, тем легче. Встаньте коленями на платформу, хват чуть шире плеч.',
   'Подтянитесь, ведя локти вниз, пока подбородок не окажется над рукоятями.',
   'Опуститесь медленно до прямых рук, не роняя платформу.'],
 err:['Раскачивание', 'Неполное выпрямление рук внизу', 'Слишком большой противовес — тянут без усилия'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 112], arm:{p:[[10, -28], [13, -55]]}, leg:{p:[[2, 40], [4, 54]], fd:[2, 8]}},
  B:{c:[100, 70], arm:{p:[[15, 22], [13, -10]]}, leg:{p:[[2, 40], [4, 54]], fd:[2, 8]}},
  props:[{k:'line', pts:[[42, 16], [158, 16]], w:5}, {k:'line', pts:[[46, 0], [46, 16]], w:4}, {k:'line', pts:[[154, 0], [154, 16]], w:4},
   {k:'line', pts:[[40, 0], [40, GROUND]], w:4}, {k:'line', pts:[[160, 0], [160, GROUND]], w:4},
   {k:'seg', a:'knL', b:'knR', aoff:[-22, 10], boff:[22, 10], w:8, cls:'eq-pad-s', layer:'back'}]}},
{id:'chestrowdb', name:'Тяга гантелей лёжа на наклонной скамье', eq:[['db'], ['incline']], g:'back', pri:['midback', 'lats'], sec:['delt_r', 'biceps'], type:'c', lvl:1,
 tech:['Спинка под 30–45°. Лягте грудью на скамью, стопы упираются в пол, гантели висят под плечами.',
   'Тяните гантели к бёдрам, сводя лопатки; грудь прижата к спинке.',
   'Опустите до полного выпрямления рук, давая лопаткам разойтись.'],
 err:['Отрыв груди от скамьи', 'Тяга рывком с поясницей', 'Локти уходят в стороны'],
 breath:'Выдох при тяге, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[70, 132], torso:52, head:-8, arm:{a:[178, 180]}, leg:{ik:[56, 182], b:'fwd', f:100}},
  B:{hip:[70, 132], torso:52, head:-8, arm:{a:[238, 196]}, leg:{ik:[56, 182], b:'fwd', f:100}},
  // Fixed bench on the anterior side: its inner surface touches the chest contour.
  // dir(142) is the forward normal to the 52-degree torso; the incline is 38 degrees.
  props:[{k:'line', support:'chest', pts:[-4, 50].map(h => add(add([70, 132], dir(52), h), dir(142), SIDE_CHEST[1] + 4)), w:8, cls:'eq-pad-s'},
   {k:'rect', x:48, y:140, w:29, h:7}, {k:'line', pts:[[66, 147], [66, GROUND]], w:4},
   {k:'line', pts:[add(add([70, 132], dir(52), 50), dir(142), SIDE_CHEST[1] + 8), [132, GROUND]], w:3},
   ...DB_SIDES('perp')]}},

/* ===== ПЛЕЧИ ===== */
{id:'shoulderpressm', name:'Жим сидя в тренажёре', eq:[['shoulderpress']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'traps'], type:'c', lvl:1,
 tech:['Сиденье так, чтобы рукояти были на уровне плеч или чуть ниже. Спина у спинки, стопы на полу.',
   'Выжмите рукояти вверх, не выпрямляя локти до щелчка.',
   'Опустите под контролем до уровня ушей, не ударяя весом о стек.'],
 err:['Прогиб поясницы с отрывом от спинки', 'Опускание рукоятей слишком низко', 'Жим рывком'],
 breath:'Выдох при жиме, вдох при опускании.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[27, 4], [27, -22]]}}),
  B:frontSeat({arm:{p:[[15, -24], [9, -52]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[36, 10], [36, GROUND]], w:4}, {k:'line', pts:[[164, 10], [164, GROUND]], w:4},
   {k:'seg', a:'gripL', b:'gripL', aoff:[0, 0], boff:[-16, 0], w:4, layer:'front'}, {k:'seg', a:'gripR', b:'gripR', aoff:[0, 0], boff:[16, 0], w:4, layer:'front'}]}},
{id:'smithohp', name:'Жим сидя в машине Смита', eq:[['smith'], ['incline']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:1,
 tech:['Скамья со спинкой под 80–90° под грифом так, чтобы гриф опускался перед лицом к ключицам.',
   'Снимите гриф поворотом кистей и выжмите вверх до почти прямых рук.',
   'Опустите до уровня подбородка под контролем.'],
 err:['Гриф уходит за голову', 'Прогиб поясницы', 'Полная блокировка локтей'],
 breath:'Выдох при жиме, вдох при опускании.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[27, 2], [25, -24]]}}),
  B:frontSeat({arm:{p:[[14, -26], [9, -54]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[28, 0], [28, GROUND]], w:3, cls:'eq-rail'}, {k:'line', pts:[[172, 0], [172, GROUND]], w:3, cls:'eq-rail'}, {k:'fbar', ext:40, plates:true, layer:'front'}]}},

/* ===== ТРИЦЕПС ===== */
{id:'assistdip', name:'Отжимания на брусьях в гравитроне', eq:[['gravitron']], assist:true, g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:1,
 tech:['Выставьте противовес, встаньте коленями на платформу, возьмитесь за нижние рукояти, корпус прямой.',
   'Опуститесь, сгибая локти назад до угла 90°.',
   'Выжмите себя вверх, не разводя локти в стороны.'],
 err:['Плечи поднимаются к ушам', 'Слишком глубокое опускание с болью в плече', 'Локти в стороны'],
 breath:'Вдох при опускании, выдох при подъёме.',
 anim:{view:'side',
  A:{hip:hipFromSh([104, 44], 8), torso:8, arm:{ik:[108, 96], b:'back', hA:90}, leg:{a:[180, 268], fr:-90}},
  B:{hip:hipFromSh([100, 72], 20), torso:20, arm:{ik:[108, 96], b:'back', hA:90}, leg:{a:[186, 274], fr:-90}},
  props:[{k:'line', pts:[[64, 100], [158, 100]], w:5}, {k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'rect', x:70, y:166, w:50, h:8, rx:3, cls:'eq-pad'}, {k:'line', pts:[[96, 174], [96, GROUND]], w:4}]}},
{id:'cableohext', name:'Разгибание рук с канатом над головой', eq:[['cable']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Канат на нижнем блоке. Встаньте спиной к блоку, канат за головой, локти у ушей, шаг вперёд в выпад.',
   'Разогните руки вперёд-вверх, разводя концы каната в конце.',
   'Медленно верните, растягивая трицепс; локти не расходятся.'],
 err:['Локти разъезжаются в стороны', 'Прогиб в пояснице', 'Работа корпусом'],
 breath:'Выдох при разгибании, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[96, 97], torso:6, head:-4, arm:{a:[8, 250]}, legN:{ik:[118, 180], b:'fwd', f:90}, legF:{ik:[76, 180], b:'fwd', f:106}},
  B:{hip:[96, 97], torso:6, head:-4, arm:{a:[8, 8]}, legN:{ik:[118, 180], b:'fwd', f:90}, legF:{ik:[76, 180], b:'fwd', f:106}},
  props:[{k:'line', pts:[[22, 30], [22, GROUND]], w:5}, {k:'cable', from:[26, 176], at:'gripN', handle:true, layer:'back'}]}},

/* ===== ПРЕСС ===== */
{id:'cablewood', name:'«Дровосек» на блоке', eq:[['cable']], g:'abs', pri:['obliques', 'abs'], sec:['delt_s', 'glutes'], type:'i', lvl:1,
 tech:['Рукоять на верхнем блоке. Встаньте боком, ноги шире плеч, возьмитесь двумя руками.',
   'Тяните рукоять по диагонали вниз к противоположному колену, поворачивая корпус и таз; руки почти прямые.',
   'Вернитесь по той же дуге под контролем. Повторите на другую сторону.'],
 err:['Движение только руками', 'Округление спины внизу', 'Рывок'],
 breath:'Выдох при тяге вниз, вдох при возврате.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[24, -8], [36, -36]]}, leg:{p:[[9, 43], [12, 85]]}}),
  B:frontStand({arm:{p:[[-20, 20], [-34, 46]]}, leg:{p:[[12, 40], [14, 84]]}}),
  props:[{k:'line', pts:[[172, 6], [172, GROUND]], w:5}, {k:'cable', from:[166, 12], at:'gripR', handle:true, layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'pullthrough', name:'Протяжка на блоке между ног', eq:[['cable']], g:'glutes', pri:['glutes', 'hams'], sec:['lowback'], type:'c', lvl:1,
 tech:['Канат на нижнем блоке. Встаньте спиной к блоку, канат между ног, два шага вперёд.',
   'Наклонитесь, отводя таз назад, колени чуть согнуты, спина прямая — канат уходит назад между ног.',
   'Выпрямитесь движением таза вперёд, сжимая ягодицы в верхней точке.'],
 err:['Присед вместо наклона', 'Тяга руками', 'Переразгибание поясницы наверху'],
 breath:'Вдох при наклоне, выдох при выпрямлении.',
 anim:{view:'side',
  A:{hip:[96, 97], torso:0, arm:{a:[182, 182]}, leg:{ik:[100, 180], b:'fwd', f:90}},
  B:{hip:[72, 110], torso:72, arm:{a:[228, 228]}, leg:{ik:[100, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[20, 60], [20, GROUND]], w:5}, {k:'cable', from:[24, 178], at:'grips', handle:true, layer:'back'}]}},
{id:'cablekickback', name:'Отведение ноги назад на блоке', eq:[['cable']], g:'glutes', pri:['glutes'], sec:['hams'], type:'i', lvl:1,
 tech:['Манжета на щиколотке, лицом к стойке, лёгкий наклон, руки на стойке.',
   'Отведите прямую ногу назад за счёт ягодицы, не прогибая поясницу.',
   'Верните под контролем, не ставя стопу на пол между повторами.'],
 err:['Прогиб поясницы', 'Поворот таза', 'Мах по инерции'],
 breath:'Выдох при отведении, вдох при возврате.',
 anim:{view:'side',
  A:{hip:[90, 97], torso:14, arm:{ik:[138, 80], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[170, 176], f:90}},
  B:{hip:[90, 97], torso:14, arm:{ik:[138, 80], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[224, 218], f:110}},
  props:[{k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'cable', from:[146, 180], at:'anN', handle:true, layer:'front'}]}},
{id:'abduction', name:'Разведение ног в тренажёре', eq:[['abductor']], g:'glutes', pri:['glutes'], sec:[], type:'i', lvl:1,
 tech:['Сядьте, упоры снаружи коленей, спина у спинки, руки на рукоятях.',
   'Разведите колени в стороны до комфортной амплитуды, задержитесь на секунду.',
   'Сведите медленно, не давая весу стукнуть.'],
 err:['Наклон корпуса вперёд', 'Рывки', 'Слишком большой вес — таз отрывается'],
 breath:'Выдох при разведении, вдох при сведении.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[6, 14], [8, 50]]}}),
  B:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[30, 20], [34, 54]]}}),
  props:[{k:'rect', x:80, y:60, w:40, h:72, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[62, 150], [62, 176]], w:6, cls:'eq-pad'}, {k:'line', pts:[[138, 150], [138, 176]], w:6, cls:'eq-pad'}]}},
{id:'adduction', name:'Сведение ног в тренажёре', eq:[['abductor']], g:'quads', pri:['quads'], sec:['glutes'], type:'i', lvl:1,
 tech:['Сядьте, упоры с внутренней стороны коленей, ноги разведены до растяжения приводящих мышц.',
   'Сведите колени вместе за счёт внутренней поверхности бедра, задержитесь.',
   'Разведите медленно до исходного растяжения.'],
 err:['Слишком широкая стартовая позиция', 'Отрыв таза', 'Сброс веса'],
 breath:'Выдох при сведении, вдох при разведении.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[30, 20], [34, 54]]}}),
  B:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[7, 14], [9, 50]]}}),
  props:[{k:'rect', x:80, y:60, w:40, h:72, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[88, 150], [88, 176]], w:6, cls:'eq-pad'}, {k:'line', pts:[[112, 150], [112, 176]], w:6, cls:'eq-pad'}]}},

/* ===== КВАДРИЦЕПС ===== */
{id:'hacksquat', name:'Приседания в гакк-машине', eq:[['hack']], g:'quads', pri:['quads'], sec:['glutes', 'hams'], type:'c', lvl:2,
 tech:['Спина и таз прижаты к салазкам, плечи под упорами, стопы на платформе на ширине плеч, чуть впереди.',
   'Снимите стопоры и опускайтесь, сгибая колени до угла 90° или глубже, если таз не отрывается.',
   'Выжмите вверх через всю стопу, не блокируя колени.'],
 err:['Отрыв таза от спинки внизу', 'Стопы слишком низко — колени уходят далеко вперёд', 'Блокировка коленей'],
 breath:'Вдох при опускании, выдох при подъёме.',
 anim:{view:'side',
  A:{hip:[104, 82], torso:-32, arm:{tf:[14, -48], b:'down'}, leg:{ik:[128, 160], b:'fwd', f:124}},
  B:{hip:[73, 133], torso:-32, arm:{tf:[14, -48], b:'down'}, leg:{ik:[128, 160], b:'fwd', f:124}},
  props:[{k:'line', pts:[add(add([73, 133], dir(-32), -30), [-12, 0]), add(add([104, 82], dir(-32), 80), [-12, 0])], w:3, cls:'eq-rail'},
   {k:'line', pts:[add(add([73, 133], dir(-32), -30), [-22, 0]), add(add([104, 82], dir(-32), 80), [-22, 0])], w:3, cls:'eq-rail'},
   {k:'line', pts:[add([128, 160], dir(58), -24), add([128, 160], dir(58), 26)], w:5},
   {k:'line', pts:[add([128, 160], dir(58), 26), [150, GROUND]], w:4}, {k:'line', pts:[[40, GROUND], [150, GROUND]], w:4}]}},

/* ===== ИКРЫ ===== */
{id:'seatedcalf', name:'Подъём на носки сидя', eq:[['calfseat']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Сядьте, подушечки стоп на краю платформы, валики плотно на нижней части бёдер.',
   'Снимите стопор и опустите пятки как можно ниже, растягивая икры.',
   'Поднимитесь на носки до упора, задержитесь на секунду.'],
 err:['Отбив внизу', 'Неполная амплитуда', 'Валики на коленях'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:{hip:[78, 128], torso:4, arm:{ik:[110, 128], b:'down'}, leg:{ik:[112, 176], b:'up', f:72}},
  B:{hip:[78, 128], torso:4, arm:{ik:[110, 122], b:'down'}, leg:{ik:[112, 164], b:'up', f:118}},
  props:[{k:'rect', x:58, y:137, w:50, h:8}, {k:'line', pts:[[80, 145], [80, GROUND]], w:5}, {k:'rect', x:100, y:176, w:36, h:6},
   {k:'line', pts:[[118, 182], [118, GROUND]], w:4}, {k:'roller', leg:'N', up:-40, side:-90, out:8, r:7, layer:'front'}]}},
{id:'standcalf', name:'Подъём на носки стоя в тренажёре', eq:[['calfstand']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Плечи под упорами, подушечки стоп на краю платформы, ноги прямые, корпус вертикально.',
   'Опустите пятки ниже уровня платформы, растягивая икры.',
   'Поднимитесь на носки максимально высоко, задержитесь.'],
 err:['Сгибание коленей для помощи', 'Короткая амплитуда', 'Наклон вперёд'],
 breath:'Выдох при подъёме, вдох при опускании.',
 anim:{view:'side',
  A:Object.assign({hip:[94, 96], torso:0, arm:{a:[176, 12]}}, legsAt(100, 178, 'fwd', 70)),
  B:Object.assign({hip:[94, 84], torso:0, arm:{a:[176, 12]}}, legsAt(100, 166, 'fwd', 128)),
  props:[{k:'line', pts:[[128, 10], [128, GROUND]], w:5}, {k:'line', pts:[[128, 36], [96, 36]], w:5}, {k:'circle', c:[96, 36], r:7, cls:'eq-pad'},
   {k:'rect', x:84, y:180, w:40, h:6}]}},

/* ===== КАРДИО-ТРЕНАЖЁРЫ ===== */
{id:'treadmill', name:'Беговая дорожка', eq:[['treadmill']], g:'cardio', pri:['quads', 'calves'], sec:['glutes', 'hams'], type:'c', lvl:1, kind:'time',
 tech:['Начните с 2–3 минут ходьбы, затем выйдите на рабочий темп: дыхание глубокое, но говорить короткими фразами ещё можно.',
   'Корпус вертикально, взгляд вперёд, руки работают вдоль тела, не держитесь за поручни.',
   'Для интервалов чередуйте 1 минуту быстро и 1–2 минуты спокойно. Заканчивайте шагом.'],
 err:['Держаться за поручни', 'Слишком длинный шаг с ударом в пятку', 'Резкая остановка без заминки'],
 breath:'Ровное дыхание в ритме шагов.',
 anim:{view:'side', period:1200,
  A:{hip:[90, 94], torso:6, armN:{a:[206, 96]}, armF:{a:[150, 60]}, legN:{ik:[114, 178], b:'fwd', f:92}, legF:{ik:[64, 170], b:'fwd', f:124}},
  B:{hip:[90, 94], torso:6, armN:{a:[150, 60]}, armF:{a:[206, 96]}, legN:{ik:[64, 170], b:'fwd', f:124}, legF:{ik:[114, 178], b:'fwd', f:92}},
  props:[{k:'rect', x:30, y:180, w:140, h:6, rx:3}, ...cardioConsole(160, 70), {k:'line', pts:[[160, 94], [150, 118]], w:4}]}},
{id:'bike', name:'Велотренажёр', eq:[['bike']], g:'cardio', pri:['quads', 'glutes'], sec:['hams', 'calves'], type:'c', lvl:1, kind:'time',
 tech:['Высота седла: в нижней точке педали нога почти прямая. Руки на руле без упора всем весом.',
   'Держите каденс 80–100 оборотов в минуту; сопротивление такое, чтобы дышать глубоко, но без одышки.',
   'Для интервалов: 30–60 секунд с высоким сопротивлением, затем 1–2 минуты легко.'],
 err:['Седло слишком низко — колени выше таза', 'Раскачивание корпуса', 'Давление на кисти'],
 breath:'Ровное дыхание, без задержек.',
 anim:{view:'side', period:1400,
  keys:[{hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[112, 150], b:'fwd', f:100}, legF:{ik:[96, 174], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[118, 162], b:'fwd', f:100}, legF:{ik:[90, 162], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[96, 174], b:'fwd', f:100}, legF:{ik:[112, 150], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[90, 162], b:'fwd', f:100}, legF:{ik:[118, 162], b:'fwd', f:100}}],
  props:[{k:'rect', x:62, y:118, w:30, h:6, rx:3}, {k:'line', pts:[[76, 124], [96, 176]], w:5}, {k:'line', pts:[[96, 176], [138, 110]], w:5},
   {k:'line', pts:[[138, 110], [138, 98]], w:4}, {k:'line', pts:[[128, 98], [148, 98]], w:4}, {k:'circle', c:[104, 162], r:12, cls:'eq-steel-f'},
   {k:'line', pts:[[60, GROUND], [150, GROUND]], w:4}, {k:'line', pts:[[96, 176], [96, GROUND]], w:4}, {k:'line', pts:[[138, 110], [128, GROUND]], w:4}]}},
{id:'rower', name:'Гребной тренажёр', eq:[['rower']], g:'cardio', pri:['lats', 'quads'], sec:['glutes', 'midback', 'biceps'], type:'c', lvl:2, kind:'time',
 tech:['Захват: колени согнуты, голени вертикально, руки прямые, корпус наклонён вперёд от таза.',
   'Гребок: сначала толчок ногами, затем отклонение корпуса, в конце тяга руками к нижним рёбрам.',
   'Возврат в обратном порядке: руки, корпус, ноги. Темп 20–26 гребков в минуту.'],
 err:['Тяга руками раньше ног', 'Округлая спина', 'Слишком быстрый возврат'],
 breath:'Выдох на гребке, вдох на возврате.',
 anim:{view:'side', period:2200, vectors:true,
  keys:[{hip:[62, 136], torso:22, arm:{ik:[124, 118], b:'back', hA:90}, leg:{ik:[112, 170], b:'up', f:40}},
   {hip:[82, 138], torso:-14, arm:{ik:[110, 128], b:'back', hA:90}, leg:{ik:[138, 170], b:'up', f:40}},
   {hip:[86, 138], torso:-16, arm:{tf:[18, 12], b:'back', hA:90}, leg:{ik:[142, 170], b:'up', f:40}}],
  props:[{k:'line', pts:[[20, 150], [170, 150]], w:6}, {k:'line', pts:[[40, 150], [40, GROUND]], w:4}, {k:'line', pts:[[150, 150], [150, GROUND]], w:4},
   {k:'rect', x:140, y:160, w:12, h:20, rx:3, cls:'eq-pad'}, {k:'circle', c:[164, 126], r:16, cls:'eq-steel-f'}, {k:'cable', from:[164, 126], at:'gripN', handle:true, layer:'front'}]}},
{id:'elliptical', name:'Эллиптический тренажёр', eq:[['elliptical']], g:'cardio', pri:['quads', 'glutes'], sec:['hams', 'calves', 'delt_f'], type:'c', lvl:1, kind:'time',
 tech:['Стопы на педалях целиком, корпус вертикально, руки на подвижных рукоятях.',
   'Двигайтесь плавно, толкая педали через пятку и помогая руками; не переносите вес на рукояти.',
   'Меняйте нагрузку сопротивлением, а не скоростью: 60–70 шагов в минуту.'],
 err:['Висеть на рукоятях', 'Подъём на носки', 'Слишком высокий темп с коротким шагом'],
 breath:'Ровное дыхание.',
 anim:{view:'side', period:1600,
  A:{hip:[96, 92], torso:4, armN:{ik:[128, 70], b:'down'}, armF:{ik:[104, 74], b:'down'}, legN:{ik:[120, 170], b:'fwd', f:90}, legF:{ik:[72, 164], b:'fwd', f:90}},
  B:{hip:[96, 92], torso:4, armN:{ik:[104, 74], b:'down'}, armF:{ik:[128, 70], b:'down'}, legN:{ik:[72, 164], b:'fwd', f:90}, legF:{ik:[120, 170], b:'fwd', f:90}},
  props:[{k:'line', pts:[[30, GROUND], [170, GROUND]], w:4}, {k:'line', pts:[[150, 60], [150, GROUND]], w:5}, {k:'line', pts:[[150, 60], [124, 60]], w:4},
   {k:'seg', a:'anN', b:'anN', aoff:[0, 0], boff:[0, 12], w:5}, {k:'seg', a:'anF', b:'anF', aoff:[0, 0], boff:[0, 14], w:5}, {k:'seg', a:'gripN', b:'anN', boff:[0, 0], w:3}]}},
{id:'stairs', name:'Степпер / лестница', eq:[['stairs']], g:'cardio', pri:['glutes', 'quads'], sec:['calves', 'hams'], type:'c', lvl:1, kind:'time',
 tech:['Корпус почти вертикально, лёгкое касание поручней только для равновесия.',
   'Ставьте всю стопу на ступень и толкайтесь через пятку, колено над стопой.',
   'Темп, при котором можете говорить короткими фразами; для интервалов — 1 минута быстро, 2 спокойно.'],
 err:['Навалиться на поручни', 'Шаг с носка', 'Наклон вперёд с круглой спиной'],
 breath:'Ровное дыхание в ритме шагов.',
 anim:{view:'side', period:1300,
  A:{hip:[88, 94], torso:10, arm:{ik:[134, 92], b:'down'}, legN:{ik:[118, 158], b:'fwd', f:90}, legF:{ik:[84, 180], b:'fwd', f:90}},
  B:{hip:[88, 80], torso:10, arm:{ik:[134, 80], b:'down'}, legN:{ik:[118, 158], b:'fwd', f:90}, legF:{ik:[100, 140], b:'fwd', f:90}},
  props:[{k:'rect', x:70, y:180, w:40, h:6}, {k:'rect', x:100, y:158, w:40, h:6}, {k:'rect', x:130, y:136, w:40, h:6}, {k:'line', pts:[[150, 80], [150, 136]], w:4}, {k:'line', pts:[[150, 80], [120, 86]], w:4}]}}
);

/* фазовые подсказки: [рабочая фаза, возврат]; для eccFirst — [опускание, подъём] */
for (const id of ['smithbench', 'assistdip', 'hacksquat', 'pullthrough']) eccFirst.add(id);
const MACHINE_CUES = {
  chestpressm:['Выжимайте рукояти вперёд, лопатки прижаты к спинке.', 'Возвращайте под контролем, локти чуть за линию корпуса.'],
  smithbench:['Опускайте гриф к нижней части груди по направляющим.', 'Выжимайте вверх, стопы давят в пол.'],
  cablelowfly:['Сводите руки по дуге снизу вверх, локти мягкие.', 'Разводите вниз и в стороны, растягивая грудь.'],
  leverrowm:['Тяните рукояти к себе, локти вдоль корпуса, грудь на упоре.', 'Отпускайте плавно, лопатки расходятся.'],
  tbarrow:['Тяните рукоять к животу, сводя лопатки; угол корпуса не меняется.', 'Опускайте до почти прямых рук.'],
  assistpull:['Тяните локти вниз, подбородок над рукоятями.', 'Опускайтесь медленно до прямых рук.'],
  chestrowdb:['Тяните гантели к бёдрам, сводя лопатки.', 'Опускайте до полного выпрямления рук.'],
  shoulderpressm:['Выжимайте рукояти вверх без прогиба в пояснице.', 'Опускайте до уровня ушей под контролем.'],
  smithohp:['Выжимайте гриф вверх по направляющим.', 'Опускайте до подбородка.'],
  assistdip:['Опускайтесь до 90° в локтях, локти назад.', 'Выжимайте себя вверх, не разводя локти.'],
  cableohext:['Разгибайте руки вперёд-вверх, локти у ушей.', 'Возвращайте канат за голову, растягивая трицепс.'],
  cablewood:['Тяните по диагонали к колену, поворачивая корпус и таз.', 'Возвращайтесь по той же дуге.'],
  pullthrough:['Отводите таз назад, колени мягкие, канат уходит между ног.', 'Выпрямляйтесь движением таза вперёд, сжимая ягодицы.'],
  cablekickback:['Отводите прямую ногу назад ягодицей, поясница ровная.', 'Возвращайте под контролем, стопу на пол не ставьте.'],
  abduction:['Разводите колени в стороны, корпус неподвижен.', 'Сводите медленно, без удара веса.'],
  adduction:['Сводите колени внутренней поверхностью бедра.', 'Разводите медленно до растяжения.'],
  hacksquat:['Опускайтесь до 90° в коленях, таз прижат к салазкам.', 'Выжимайте вверх через всю стопу.'],
  seatedcalf:['Поднимайтесь на носки до упора.', 'Опускайте пятки ниже платформы, растягивая икры.'],
  standcalf:['Поднимайтесь на носки максимально высоко.', 'Опускайте пятки ниже платформы.'],
  treadmill:['Корпус вертикально, руки работают вдоль тела.', 'Шаг под себя, приземление на середину стопы.'],
  bike:['Каденс 80–100, давите в педаль через пятку.', 'Корпус спокоен, кисти без упора.'],
  rower:['Ноги — корпус — руки: толчок, отклонение, тяга к рёбрам.', 'Руки — корпус — ноги: возврат вдвое медленнее гребка.'],
  elliptical:['Толкайте педали через пятку, помогая руками.', 'Не переносите вес на рукояти.'],
  stairs:['Всю стопу на ступень, толчок через пятку.', 'Касание поручней только для равновесия.']
};
for (const ex of EX) if (MACHINE_CUES[ex.id]) ex.anim.cues = MACHINE_CUES[ex.id];

const CUES_ALL = {
  /* грудь */
  pushup:['Выжимайте пол ладонями; тело остаётся одной линией.','Опускайте грудь к полу, локти под 45° к корпусу.'],
  diamond:['Выпрямляйте руки, локти прижаты к бокам.','Опускайтесь, пока грудь не окажется над кистями.'],
  dip:['Выжимайте корпус вверх, не запирая локти резко.','Опускайтесь до угла 90° в локтях, локти идут назад.'],
  bbbench:['Выжимайте гриф вверх и чуть к голове, стопы давят в пол.','Ведите гриф к нижней части груди, лопатки сведены.'],
  dbbench:['Выжимайте гантели по сходящейся дуге.','Опускайте гантели к груди, предплечья вертикальны.'],
  dbincline:['Выжимайте вверх, не ударяя гантели друг о друга.','Опускайте к верхней части груди, лопатки прижаты к спинке.'],
  smithincline:['Выжимайте гриф вверх по направляющим без рывка.','Опускайте гриф к верхней части груди.'],
  inclinebb:['Выжимайте гриф вертикально вверх, таз на скамье.','Опускайте гриф под ключицы, локти под 45–60°.'],
  declinebb:['Выжимайте вверх и немного к голове.','Опускайте гриф на нижнюю часть груди.'],
  closegrip:['Выпрямляйте руки полностью, локти вдоль корпуса.','Опускайте гриф на нижнюю часть груди, локти не расходятся.'],
  declinepush:['Выжимайте себя вверх, таз не провисает.','Опускайтесь, пока грудь почти не коснётся пола.'],
  dbfly:['Сводите руки по дуге, будто обнимаете бочку.','Разводите руки до растяжения груди, угол в локтях постоянный.'],
  cablefly:['Сводите рукояти вниз и вперёд, сожмите грудь на секунду.','Разводите руки по дуге, локти остаются мягко согнутыми.'],
  pecdeck:['Сводите рукояти перед собой, спина у спинки.','Разводите до растяжения груди, не роняя вес.'],
  pullover:['Возвращайте гантель по дуге над грудь.','Опускайте гантель за голову до растяжения груди и широчайших.'],
  /* спина */
  pullup:['Тяните локти вниз к рёбрам, грудь к перекладине.','Опускайтесь до прямых рук, лопатки под контролем.'],
  chinup:['Тяните локти к бокам, подбородок над перекладиной.','Разгибайте руки плавно, без раскачки.'],
  bbrow:['Ведите локти назад вдоль корпуса, гриф к низу живота.','Опускайте штангу, не меняя наклон спины.'],
  dbrow:['Локоть назад и вверх, гантель к поясу.','Опускайте до полного выпрямления руки.'],
  latpull:['Тяните рукоять к верхней части груди, локти вниз.','Возвращайте рукоять вверх до прямых рук.'],
  cablerow:['Тяните рукоять к животу, сводите лопатки; корпус отклоняется назад на 10–15°.','Разгибайте руки с контролем, корпус возвращается в небольшой наклон вперёд.'],
  bandrow:['Тяните концы ленты к поясу, локти назад.','Возвращайте руки вперёд, сохраняя натяжение.'],
  invrow:['Подтяните грудь к перекладине, тело одной линией.','Опускайтесь до прямых рук, таз не провисает.'],
  straightpull:['Опускайте рукоять к бёдрам прямыми руками.','Поднимайте руки до уровня головы, плечи опущены.'],
  deadlift:['Отталкивайте пол ногами, гриф вдоль голеней.','Сначала таз назад, затем колени; гриф у ног.'],
  hyper:['Поднимайтесь до прямой линии тела, без переразгибания.','Наклоняйтесь вперёд через тазобедренные суставы.'],
  shrug:['Поднимайте плечи строго вверх, к ушам.','Опускайте плечи медленно, руки прямые.'],
  goodmorning:['Разгибайте таз, возвращаясь в вертикаль.','Таз назад, спина прямая, корпус почти параллелен полу.'],
  /* плечи */
  dbpress:['Выжимайте гантели вверх, сводя над головой.','Опускайте до уровня ушей, локти под гантелями.'],
  ohp:['Выжимайте гриф вертикально, затем голову под гриф.','Опускайте гриф к ключицам, локти перед грифом.'],
  arnold:['Разворачивайте кисти ладонями вперёд и выжимайте.','Опускайте гантели, разворачивая ладони к себе.'],
  latraise:['Поднимайте локти через стороны до уровня плеч.','Опускайте руки по дуге, без раскачки.'],
  bandlatraise:['Поднимайте руки через стороны, плечи не к ушам.','Опускайте медленно, лента не дёргает руки.'],
  cablelat:['Отводите руку в сторону до уровня плеча.','Возвращайте руку, трос остаётся натянутым.'],
  frontraise:['Поднимайте прямые руки вперёд до уровня плеч.','Опускайте с контролем к бёдрам.'],
  facepull:['Тяните канат к лицу, локти высоко и в стороны.','Возвращайте руки вперёд до выпрямления.'],
  bandfacepull:['Тяните ленту к лицу, разводя концы.','Плавно возвращайте руки вперёд.'],
  reversefly:['Разводите руки назад, сводя лопатки.','Возвращайте рукояти вперёд, грудь у упора.'],
  pikepush:['Выжимайте себя вверх, таз остаётся высоко.','Опускайте макушку между ладонями.'],
  /* бицепс */
  bbcurl:['Сгибайте руки, локти неподвижны у боков.','Опускайте гриф до почти прямых рук.'],
  dbcurl:['Сгибайте руки до уровня плеч, ладони вперёд.','Опускайте до выпрямления рук.'],
  hammer:['Сгибайте руки с нейтральным хватом, локти у корпуса.','Опускайте гантели медленно.'],
  cablecurl:['Сгибайте руки до уровня груди.','Разгибайте плавно, трос натянут.'],
  bandcurl:['Сгибайте руки, прижимая локти к бокам.','Опускайте, удерживая натяжение ленты.'],
  preacher:['Сгибайте руки, плечи на упоре.','Опускайте почти до прямых рук, без рывка внизу.'],
  inclinecurl:['Сгибайте руки, не выводя локти вперёд.','Опускайте до полного выпрямления, чувствуя растяжение.'],
  concentration:['Сгибайте руку к плечу, локоть упирается в бедро.','Опускайте гантель медленно.'],
  /* трицепс */
  skull:['Разгибайте руки, плечи неподвижны.','Опускайте гриф к макушке, сгибая только локти.'],
  pushdown:['Разгибайте руки вниз до конца, локти у боков.','Возвращайте до 90° в локтях, плечи неподвижны.'],
  bandpushdown:['Разгибайте руки вниз полностью.','Возвращайте до 90° в локтях медленно.'],
  benchdip:['Разгибайте руки, поднимая корпус.','Опускайтесь до 90° в локтях, локти назад.'],
  ohext:['Разгибайте руки вверх, локти к голове.','Опускайте гантель за голову, локти не расходятся.'],
  kickback:['Разгибайте руку назад до прямой линии.','Возвращайте до 90°, плечо неподвижно.'],
  /* предплечья */
  wristcurl:['Сгибайте запястья, поднимая гриф.','Опускайте, разгибая запястья, гриф к пальцам.'],
  farmer:['Идите короткими шагами, корпус вертикален.','Плечи назад и вниз, снаряды не раскачивают.'],
  hang:['Активный вис: плечи слегка опущены от ушей, дыхание ровное.'],
  /* пресс */
  crunch:['Приближайте рёбра к тазу, отрывая лопатки.','Опускайтесь без броска, поясница прижата.'],
  declinecrunch:['Скручивайте грудную клетку к тазу.','Плавно вернитесь, не ложась полностью.'],
  cablecrunch:['Скручивайтесь вниз, локти к бёдрам; таз неподвижен.','Возвращайтесь вверх, не теряя натяжения пресса.'],
  lyinglegraise:['Поднимайте прямые ноги до вертикали.','Опускайте медленно, не касаясь пола пятками.'],
  legraise:['Поднимайте ноги, подкручивая таз.','Опускайте ноги без раскачки.'],
  hangknee:['Подтягивайте колени к груди, таз подкручен.','Опускайте ноги медленно.'],
  captainraise:['Поднимайте колени к груди, спина у спинки.','Опускайте ноги без раскачки.'],
  rollout:['Возвращайтесь усилием пресса, не таза.','Катите ролик вперёд, поясница ровная.'],
  sidebend:['Возвращайтесь в вертикаль усилием косых мышц.','Наклоняйтесь строго в сторону.'],
  plank:['Тело одной линией, ягодицы и пресс напряжены, дыхание животом.'],
  sideplank:['Таз поднят, тело прямое от головы до стоп, плечо не уходит к уху.'],
  /* ягодицы и ноги */
  hipthrust:['Разгибайте таз до прямой линии плечи–колени, сожмите ягодицы.','Опускайте таз, подбородок к груди.'],
  bridge:['Поднимайте таз, сжимая ягодицы.','Опускайте таз с контролем.'],
  kbswing:['Резко разгибайте таз, руки лишь направляют гирю.','Встречайте гирю отведением таза назад.'],
  glutekick:['Отводите ногу назад, сжимая ягодицу; поясница не прогибается.','Возвращайте ногу медленно.'],
  bulgarian:['Поднимайтесь за счёт передней ноги.','Опускайтесь вертикально, колено по носку.'],
  stepup:['Поднимайтесь, выпрямляя опорную ногу полностью.','Опускайтесь той же ногой подконтрольно.'],
  lunge:['Поднимайтесь, корпус вертикален.','Опускайтесь, пока заднее колено почти не коснётся пола.'],
  rdl:['Разгибайте таз, снаряд скользит вдоль ног.','Таз назад, колени мягкие, спина прямая.'],
  squat:['Отталкивайте пол всей стопой, колени по носкам.','Сгибайте колени и таз одновременно, пятки на полу.'],
  goblet:['Вставайте, корпус вертикален, локти вниз.','Опускайте таз между коленями.'],
  airsquat:['Поднимайтесь до полного выпрямления.','Опускайтесь до параллели бедра с полом.'],
  smithsquat:['Поднимайтесь, не отрывая пяток.','Опускайтесь до параллели, стопы впереди грифа.'],
  legpress:['Выжимайте платформу, не блокируя колени.','Опускайте платформу до 90° в коленях, таз прижат.'],
  legext:['Разгибайте ноги почти до прямых, задержитесь.','Опускайте медленно, без броска.'],
  legcurl:['Подтягивайте пятки к ягодицам, таз прижат.','Разгибайте ноги плавно.'],
  calfraise:['Поднимайтесь на носки максимально высоко.','Опускайтесь медленно, растягивая икры.'],
  lpcalf:['Выжимайте платформу носками.','Возвращайтесь, растягивая икры.'],
  /* кардио */
  jumpingjack:['Прыжок: ноги врозь, руки через стороны вверх.','Мягкое приземление на носки, ноги вместе.'],
  burpee:['Выпрыгивайте вверх, руки над головой.','Присед, ладони на пол, ноги назад в упор.'],
  mountain:['Быстро меняйте ноги, таз на уровне плеч.','Плечи над кистями, дыхание ритмичное.'],
  jumpsquat:['Мощно выпрыгивайте, помогая руками.','Мягкое приземление на носки и сразу в присед.'],
  thruster:['Вставая, сразу выжимайте гантели над головой.','Опускайте гантели к плечам и в присед.'],
  wallpush:['Оттолкнитесь от стены до прямых рук.','Сгибайте локти, грудь к стене, тело прямое.'],
  inclinepush:['Выжмите себя до прямых рук.','Опускайте грудь к краю опоры, локти под 45°.'],
  kneepush:['Выжмите себя вверх, таз не отставляйте.','Опускайте грудь к полу, линия от колен до макушки.'],
  widepush:['Выжимайте, сводя грудные.','Опускайтесь, локти не выше плеч.'],
  archer:['Выжмите себя в центр.','Опускайтесь к рабочей руке, вторая скользит в сторону.'],
  declinepike:['Выжмите себя до прямых рук.','Опускайте макушку к полу, локти вперёд-вниз.'],
  superman:['Поднимите грудь, руки и ноги, взгляд в пол.','Опуститесь плавно.'],
  ytw:['Поднимайте руки, сводя лопатки.','Опускайте без касания пола.'],
  towelrow:['Тяните грудь к двери, локти назад.','Разгибайте руки плавно, таз не провисает.'],
  tablerow:['Подтяните грудь к столешнице.','Опуститесь до прямых рук.'],
  reversesnow:['Ведите руки по дуге вверх, не касаясь пола.','Возвращайте по той же дуге.'],
  wallsit:['Бёдра параллельны полу, колени над пятками, дыхание ровное.'],
  revlunge:['Оттолкнитесь передней ногой и вернитесь.','Шаг назад, заднее колено к полу, корпус вертикален.'],
  sidelunge:['Оттолкнитесь и вернитесь в центр.','Таз назад и в сторону, вторая нога прямая.'],
  pistolbox:['Встаньте без отталкивания от скамьи.','Опускайтесь до касания, колено по носку.'],
  sllift:['Разгибайте таз, возвращаясь в вертикаль.','Наклон с прямой спиной, свободная нога назад.'],
  glutebridge1:['Поднимите таз на одной ноге, без перекоса.','Опускайте с контролем.'],
  nordic:['Оттолкнитесь руками и вернитесь.','Опускайтесь медленно, сопротивляясь бёдрами; таз прямой.'],
  calf1:['Поднимитесь на носок максимально высоко.','Опускайтесь ниже ступени, растягивая икру.'],
  deadbug:['Верните руку и ногу.','Опускайте противоположные руку и ногу, поясница прижата.'],
  birddog:['Вытяните руку и противоположную ногу, таз неподвижен.','Вернитесь на четвереньки.'],
  hollow:['Поясница прижата, лопатки и ноги над полом, дыхание ровное.'],
  bicycle:['Локоть к противоположному колену.','Смените сторону, поясница прижата.'],
  plankup:['Поставьте ладони и выпрямите руки по одной.','Опуститесь на предплечья в том же порядке.'],
  chairdip:['Выжмите себя вверх.','Опускайтесь до 90° в локтях, локти назад.'],
  towelcurl:['Сгибайте руки, сопротивляясь ногой.','Опускайте 3–4 секунды, сохраняя натяжение.']
};
for (const ex of EX) {
  const c = CUES_ALL[ex.id];
  if (c) ex.anim.cues = c.length === 1 ? [c[0], c[0]] : c;
  else if (!ex.anim.cues) ex.anim.cues = [ex.tech[1] || ex.tech[0], ex.tech[ex.tech.length - 1]];
  /* упражнения из модулей, подключённых после 03-motion-demo */
  if (ex.anim.eccFirst == null) ex.anim.eccFirst = eccFirst.has(ex.id);
  if (ex.anim.hold == null) ex.anim.hold = isometric.has(ex.id);
}

DEMO.rdl.tech[2] = 'Опускайте снаряд только пока сохраняются контроль спины и натяжение задней поверхности бедра. Глубина индивидуальна.';
DEMO.sidebend.err[2] = 'Слишком большая амплитуда и потеря контроля корпуса';

const SOURCES_BY_EX = {
  kbswing:[['Мах гирей — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/']],
  cablerow:[['Горизонтальная тяга — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']],
  pushup:[['Отжимания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/']],
  airsquat:[['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  squat:[['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  bridge:[['Ягодичный мост — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']],
  hipthrust:[['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']],
  latpull:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/']],
  bulgarian:[['Болгарский выпад — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat']],
  chinup:[['Подтягивания обратным хватом — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']]
};
const MOTION_SOURCES = [
  ['Мах гирей — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/'],
  ['Горизонтальная тяга — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']
];

/* Контакт с опорой задаётся на всём движении, включая промежуточные позы. */
for(const id of ['pushup','diamond']){
  const handX=id==='pushup'?139:131;
  const sample=t=>{
    const a=71.7+(84.5-71.7)*t,f=a+90,toe=[15,182.5],ankle=add(toe,dir(f),-FL.toe);
    return {hip:add(ankle,dir(a),85),torso:a,leg:{a:[a+180,a+180],f},arm:{ik:[handX,182],b:'back',hA:90}};
  };
  fixMotion(id,{sample});
}
const bridgeTopKnee=ik2([58,176],[146,180],FL.torso+FL.th,FL.sh,'up')[0];
const bridgeTopAngle=angOf(sub([58,176],bridgeTopKnee));
fixMotion('bridge',{sample(t){
  const a=-90+(bridgeTopAngle+90)*t;
  return {hip:hipFromSh([58,176],a),torso:a,head:-90-a,arm:{a:[101,90],hA:90},leg:{ik:[146,180],b:'up',f:90}};
}});
const thrustTopKnee=ik2([74,128],[166,180],FL.torso+FL.th,FL.sh,'up')[0];
const thrustTopAngle=angOf(sub([74,128],thrustTopKnee));
fixMotion('hipthrust',{sample(t){
  const a=-55+(thrustTopAngle+55)*t;
  return {hip:hipFromSh([74,128],a),torso:a,head:18+10*t,arm:{tf:[2,13.5],hA:a+90,b:'up'},leg:{ik:[166,180],b:'up',f:90}};
}});
fixMotion('squat',{sample(t){
  const a=8+36*t,hip=[98-53*Math.sin(a*D2R)+10*Math.cos(a*D2R),97+49*t];
  const bar=add(add(hip,dir(a),53),[Math.cos(a*D2R),Math.sin(a*D2R)],-10);
  return Object.assign({hip,torso:a,arm:{ik:add(bar,[-1,0],3.5),b:'down',hA:90}},legsAt(98));
}});
// Kneeling support rests on the top of the bench, with a full-length thigh.
for(const P of [DEMO.dbrow.anim.A,DEMO.dbrow.anim.B]){
  P.legF={a:[angOf([Math.sqrt(43*43-32*32),32]),270],f:270};
  P.armF={ik:[122,134],b:'back',hA:90};
}
// Stationary holds use one stable support pose instead of a subtle rocking loop.
DEMO.plank.anim.sample=()=>({hip:add([5,171],dir(81.6),85),torso:81.6,leg:{a:[261.6,261.6],fr:-90},arm:{a:[180,90],hA:90}});
const MOTION_FOCUS={
 pushup:{setup:'Ладони на полу, корпус собран.',control:'Ладони и носки сохраняют опору; таз движется вместе с грудью.'},
 diamond:{setup:'Поставьте ладони близко под грудью.',control:'Сохраняйте линию корпуса и ведите локти вдоль него.'},
 squat:{setup:'Устойчиво поставьте стопы и удерживайте гриф на спине.',control:'Сгибайте таз и колени согласованно; опора всей стопой.'},
 goblet:{setup:'Держите снаряд перед грудью, близко к телу.',control:'Выбирайте глубину, на которой сохраняете опору и контроль корпуса.'},
 airsquat:{setup:'Стопы устойчивы, колени направлены в сторону носков.',control:'Таз и колени сгибаются вместе; пятки остаются на полу.'},
 lunge:{setup:'Передняя стопа на полу, задняя — на носке.',control:'Опускайтесь между стопами, сохраняя равновесие. Выполните обе стороны.'},
 bridge:{setup:'Лягте на спину, согните колени и поставьте стопы на пол.',control:'Плечи и стопы сохраняют опору, таз поднимается без переразгибания спины.'},
 hipthrust:{setup:'Верх спины опирается на край скамьи, стопы устойчивы.',control:'Движется таз; опора спиной сохраняется. Завершайте подъём без прогиба.'},
 dbrow:{setup:'Колено и ладонь опираются на скамью.',control:'Локоть движется к тазу; опорная рука и корпус сохраняют положение.'},
 bbrow:{setup:'Наклоните корпус и удерживайте его положение.',control:'Движение создаёт тяга руками; корпус не подбрасывает штангу.'},
 deadlift:{setup:'Снаряд близко к ногам, руки прямые.',control:'Разгибайте таз и колени согласованно, сохраняйте снаряд близко к телу.'},
 rdl:{setup:'Снаряд в прямых руках, колени немного согнуты.',control:'Отводите таз назад; глубину ограничивает контроль спины.'},
 kbswing:{setup:'Стопы устойчивы, руки удерживают гирю.',control:'Разгибание таза задаёт мах; локти остаются разогнутыми.'},
 plank:{setup:'Предплечья и носки образуют опору.',control:'Сохраняйте положение таза и грудной клетки, продолжайте дышать.'},
 latraise:{setup:'Гантели у бёдер, локти слегка согнуты.',control:'Руки движутся по дуге; корпус сохраняет положение.'}
};
DEMO.pushup.anim.cues=['Опускайте грудную клетку и таз вместе, сохраняя опору ладонями и носками.','Оттолкните пол, поднимая корпус как единое целое.'];
DEMO.pushup.tech[1]='Сгибайте локти и опускайте грудь, сохраняя устойчивую опору и контроль корпуса. Подберите доступную амплитуду без провисания таза.';
DEMO.diamond.anim.cues=['Сгибайте локти, сохраняя положение ладоней и линию корпуса.','Разгибайте руки и поднимайте корпус без провисания таза.'];
DEMO.bridge.anim.cues=['Поднимите таз, сохраняя опору плечами и стопами.','Плавно опустите таз в исходное положение.'];
DEMO.hipthrust.anim.cues=['Разогните таз до линии корпуса и бёдер без переразгибания.','Плавно опустите таз, сохраняя опору спиной на скамью.'];
DEMO.goblet.tech[2]='Опуститесь до глубины, на которой сохраняются устойчивая опора и контроль спины, затем поднимитесь.';
DEMO.goblet.anim.cues=['Согните колени и таз, сохраняя снаряд близко к груди.','Поднимитесь, удерживая стопы на полу и контролируя корпус.'];
DEMO.lunge.tech[2]='Переднее колено движется в направлении носка. Сохраняя равновесие, поднимитесь в исходное положение.';
DEMO.lunge.anim.cues=['Опуститесь между стопами, сохраняя равновесие.','Поднимитесь с опорой на переднюю стопу; затем выполните другую сторону.'];
MOTION_SOURCES.push(
 ['Отжимания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/'],
 ['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/'],
 ['Ягодичный мост — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']
);

/* One spatial skeleton per movement. Cameras only project the same pose. */
const V3={
 add:(a,b,k=1)=>a.map((v,i)=>v+b[i]*k),sub:(a,b)=>a.map((v,i)=>v-b[i]),
 dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),unit:a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);},
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
};
const up3=a=>[0,-Math.cos(a*D2R),Math.sin(a*D2R)];
const forward3=a=>[0,Math.sin(a*D2R),Math.cos(a*D2R)];
function joint3(root,target,a,b,hint){
 const delta=V3.sub(target,root),distance=Math.hypot(...delta),axis=V3.unit(delta);
 const d=Math.max(Math.abs(a-b)+1e-6,Math.min(a+b-1e-6,distance));
 let bend=V3.sub(hint,axis.map(v=>v*V3.dot(hint,axis)));
 if(Math.hypot(...bend)<1e-6)bend=V3.cross(axis,[0,0,1]);
 bend=V3.unit(bend);
 const along=(a*a+d*d-b*b)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 return [V3.add(V3.add(root,axis,along),bend,height),V3.add(root,axis,d)];
}
function body3(hip,angle,headOffset=0,hipWidth=11){
 const u=up3(angle),n=forward3(angle),sh=V3.add(hip,u,FL.torso),headU=up3(angle+headOffset);
 const R={hip,sh,u,n,headU,headN:forward3(angle+headOffset),head:V3.add(sh,headU,FL.neck),angle,props:[],contacts:[]};
 for(const [s,sign]of [['L',-1],['R',1]]){R['hip'+s]=V3.add(hip,[sign,0,0],hipWidth);R['sh'+s]=V3.add(sh,[sign,0,0],19);}
 return R;
}
function arm3(R,s,wr,hint,handDir){
 [R['el'+s],R['wr'+s]]=joint3(R['sh'+s],wr,FL.ua,FL.fa,hint);
 const d=handDir||V3.unit(V3.sub(R['wr'+s],R['el'+s]));
 R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
}
/* Высота висящего грифа следует из положения плеч и длины рук.
   Независимая анимация грифа могла задавать кистям недостижимую точку. */
function hangingBar3(R,halfGrip,z){
 const reach=FL.ua+FL.fa-.01,dx=halfGrip-19,dz=z-R.sh[2];
 const drop=Math.sqrt(Math.max(0,reach*reach-dx*dx-dz*dz));
 return [0,R.sh[1]+drop+3.5,z];
}
function leg3(R,s,ankle,hint,footDir=[0,0,1]){
 [R['kn'+s],R['an'+s]]=joint3(R['hip'+s],ankle,FL.th,FL.sh,hint);
 R['heel'+s]=V3.add(R['an'+s],footDir,-4);R['toe'+s]=V3.add(R['an'+s],footDir,13);
}
const box3=(x0,x1,y0,y1,z0,z1,tone='pad')=>({kind:'box',lo:[x0,y0,z0],hi:[x1,y1,z1],tone});
function bench3(z0,z1,top,half=34){
 return [box3(-half,half,top,top+7,z0,z1),...[-1,1].flatMap(s=>[z0+9,z1-9].map(z=>({kind:'line',a:[s*(half-7),top+7,z],b:[s*(half-7),186,z],width:3.5,tone:'steel'})))];
}
function pulldownRig(t){
 const R=body3([0,132,80],-12),barY=30+61*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*43,barY+3.5,85],[sign*.5,1,0],[0,-1,0]);
  const root=R['hip'+s],knee=[sign*11,138,80+Math.sqrt(FL.th**2-6**2)];
  R['kn'+s]=knee;R['an'+s]=V3.add(knee,[0,1,0],FL.sh);
  R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
 }
 R.props=[...bench3(61,101,140,29),box3(-32,32,122,128,102,114),
  {kind:'line',a:[66,-8,146],b:[66,186,146],width:4,tone:'steel'},
  {kind:'line',a:[66,-8,146],b:[0,-8,85],width:4,tone:'steel'},
  {kind:'line',a:[0,-8,85],b:[0,barY,85],width:1.5,tone:'cable'},
  {kind:'line',a:[-56,barY,85],b:[56,barY,85],width:3.3,tone:'bar'}];
 R.bar=[0,barY,85];return R;
}
function bulgarianRig(t){
 const R=body3([0,103.5+35*t,94-7*t],10+8*t,0,12);
 leg3(R,'L',[-12,180,126],[0,0,1]);
 leg3(R,'R',[12,136,36],[0,1,0],[0,0,-1]);
 for(const [s,sign]of [['L',-1],['R',1]]){
  const d=V3.unit([sign*.1,1,0]);R['el'+s]=V3.add(R['sh'+s],d,30);R['wr'+s]=V3.add(R['el'+s],d,27);
  R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
  R.props.push({kind:'dumbbell',c:R['grip'+s],optional:'db'});
 }
 R.props.push(...bench3(15,49,140,29));
 R.contacts=[{p:[-12,184,132],label:'Передняя стопа'},{p:[12,140,29],label:'Задняя стопа'}];return R;
}
const chinStartY3=25.5+Math.sqrt(56.95**2-(95-(80+up3(-6)[2]*52))**2-2**2)-up3(-6)[1]*52;
function chinupRig(t){
 const R=body3([0,chinStartY3+(79-chinStartY3)*t,80],-6,0,10);
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*17,25.5,95],[0,1,0],[0,-1,0]);
  R['kn'+s]=V3.add(R['hip'+s],[0,1,0],43);R['an'+s]=V3.add(R['kn'+s],[0,1,0],42);
  R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
 }
 R.bar=[0,22,95];R.props=[{kind:'line',a:[-56,22,95],b:[56,22,95],width:4,tone:'bar'},...[-1,1].map(s=>({kind:'line',a:[s*52,8,95],b:[s*52,22,95],width:3,tone:'steel'}))];return R;
}
const thrustAngle3=-Math.atan2(83,10)/D2R;
const thrustTopHip3=V3.add(V3.add([0,138,80],up3(thrustAngle3),-40),forward3(thrustAngle3),10);
const thrustFootZ3=V3.add(thrustTopHip3,up3(thrustAngle3),-43)[2];
function thrustRig(t){
 const angle=-43+(thrustAngle3+43)*t,u=up3(angle),n=forward3(angle),contact=[0,138,80];
 const hip=V3.add(V3.add(contact,u,-40),n,10),R=body3(hip,angle,8,13);
 const bar=V3.add(V3.add(hip,u,2),n,12);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,thrustFootZ3],[0,-1,0]);
  const grip=V3.add(bar,[sign,0,0],29);
  arm3(R,s,V3.add(grip,n,-3.5),[sign,0,0],n);
 }
 R.bar=bar;R.backContact=V3.add(V3.add(hip,u,40),n,-10);
 R.props=[...bench3(18,80,138,40),{kind:'barbell',c:bar}];
 R.contacts=[{p:contact,label:'Опора спиной'},{p:[-13,184,thrustFootZ3+5],label:'Стопы'}];return R;
}
const CAMERA3={front:{label:'Спереди',yaw:0,elevation:0},side:{label:'Сбоку',yaw:90,elevation:0},angle:{label:'Под углом',yaw:55,elevation:-15},
 back:{label:'Сзади',yaw:180,elevation:0},above:{label:'Сверху под углом',yaw:35,elevation:-55}};
function camera3(key){
 const C=CAMERA3[key]||CAMERA3.side,sy=Math.sin(C.yaw*D2R),cy=Math.cos(C.yaw*D2R),se=Math.sin(C.elevation*D2R),ce=Math.cos(C.elevation*D2R);
 return p=>{const depth=-p[0]*sy+p[2]*cy;return [p[0]*cy+p[2]*sy,p[1]*ce-depth*se,depth*ce+p[1]*se];};
}
/* Projected segments may shorten. Only the spatial bone lengths are anatomical. */
function spatialPose(anim,t){
 const R=anim.rig3d(t),project=camera3(anim.camera||'side'),J={view:'spatial'};
 for(const[k,v]of Object.entries(R))if(Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))J[k]=project(v).slice(0,2);
 J.sh=project(R.sh).slice(0,2);J.hip=project(R.hip).slice(0,2);return J;
}
function buildSpatialFigure(anim,opts={}){
 const camera=opts.camera||anim.camera||'side',project=camera3(camera),paletteRoot=el('svg',{}),palette=athletePalette(paletteRoot);
 const svg=el('svg',{class:'fig spatial-figure',role:'img','aria-label':`${opts.label||''} — ${CAMERA3[camera].label}`});
 svg.appendChild(paletteRoot.firstChild);
 const ground=el('g',{'aria-hidden':'true'},svg),trace=el('path',{class:'motion-trace',display:'none','aria-hidden':'true'},svg),scene=el('g',{},svg),dots=el('g',{class:'rig-dots','aria-hidden':'true'},svg);
 const tones={steel:'#77869b',pad:'#73849a',bar:'#a7b6ca',cable:'#8192a9'};
 const allBounds=[],tracePts=[];let records=[];
 function queue(tag,attrs,points,offset=0){
  const pts=points.map(project),depth=pts.reduce((s,p)=>s+p[2],0)/pts.length+offset;
  allBounds.push(...pts);records.push({tag,attrs,depth});
 }
 const path2=p=>'M'+p.map(q=>`${f1(q[0])},${f1(q[1])}`).join('L')+'Z';
 function face(points,fill,extra={}){queue('path',{d:path2(points.map(project)),fill,...extra},points);}
 function silhouette(points,fill){
  const p=points.map(project).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const half=ps=>{const h=[];for(const q of ps){while(h.length>1&&cross(h[h.length-2],h[h.length-1],q)<=0)h.pop();h.push(q);}return h;};
  const a=half(p),b=half([...p].reverse());a.pop();b.pop();
  queue('path',{d:closedSpline(a.concat(b).map(v=>v.slice(0,2))),fill},points);
 }
 function line3(a,b,width,fill,offset=0){const p=project(a),q=project(b);queue('line',{x1:f1(p[0]),y1:f1(p[1]),x2:f1(q[0]),y2:f1(q[1]),stroke:fill,'stroke-width':width,'stroke-linecap':'round'},[a,b],offset);}
 function limb(a,b,width,kind,fill){
  const p=project(a),q=project(b);
  if(Math.hypot(q[0]-p[0],q[1]-p[1])<1.5){
   queue('ellipse',{cx:f1((p[0]+q[0])/2),cy:f1((p[1]+q[1])/2+(kind==='ft'?2.5:0)),rx:kind==='ft'?5:width/2,ry:kind==='ft'?3.5:width/2,fill},[a,b]);
  }else queue('path',{d:bonePath(p,q,width,kind),fill},[a,b]);
 }
 function box(s){
  const p=(x,y,z)=>[s[x?'hi':'lo'][0],s[y?'hi':'lo'][1],s[z?'hi':'lo'][2]];
  const faces=[[p(0,0,0),p(1,0,0),p(1,0,1),p(0,0,1)],[p(0,0,0),p(0,0,1),p(0,1,1),p(0,1,0)], [p(1,0,0),p(1,1,0),p(1,1,1),p(1,0,1)],[p(0,0,1),p(1,0,1),p(1,1,1),p(0,1,1)],[p(0,0,0),p(0,1,0),p(1,1,0),p(1,0,0)]];
  faces.forEach((v,i)=>face(v,['#8192a8','#56677d','#65758a','#708097','#617186'][i]));
 }
 function disc(c,r,outline=false){
  const p=Array.from({length:48},(_,i)=>V3.add(c,[0,Math.cos(i*Math.PI/24),Math.sin(i*Math.PI/24)],r));
  /* сбоку блин — полупрозрачный диск: не закрывает атлета и не читается как кольцо вокруг головы */
  face(p,outline?'#36465e':'#36465e',{stroke:outline?'#7f90ad':'#25344a','stroke-width':outline?1.2:1,'stroke-opacity':outline?.7:1,'fill-opacity':outline?.38:1});
  const q=project(c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:2.5,fill:'#a6b5ca'},[c],1);
 }
 function prop(s){
  if(s.optional&&opts.has&&!opts.has(s.optional))return;
  if(s.kind==='box')box(s);
  else if(s.kind==='line')line3(s.a,s.b,s.width,tones[s.tone]||tones.steel);
  else if(s.kind==='dumbbell'){
   line3(V3.add(s.c,[1,0,0],-9),V3.add(s.c,[1,0,0],9),3,tones.bar);
   for(const sign of [-1,1])disc(V3.add(s.c,[1,0,0],sign*8),6);
  }else if(s.kind==='barbell'){
   line3(V3.add(s.c,[1,0,0],-61),V3.add(s.c,[1,0,0],61),3.4,tones.bar);
   line3(V3.add(s.c,[1,0,0],-19),V3.add(s.c,[1,0,0],19),8,'#ac8a61',1);
   for(const sign of [-1,1])disc(V3.add(s.c,[1,0,0],sign*48),17,camera==='side');
  }else if(s.kind==='panel'){
   const axis=[1,0,0],normal=V3.unit(V3.cross(axis,V3.sub(s.b,s.a))),corners=[V3.add(s.a,axis,-s.width/2),V3.add(s.a,axis,s.width/2),V3.add(s.b,axis,s.width/2),V3.add(s.b,axis,-s.width/2)];
   const lower=corners.map(p=>V3.add(p,normal,s.thickness/2));face(corners,'#53677f');for(let i=0;i<4;i++)face([corners[i],corners[(i+1)%4],lower[(i+1)%4],lower[i]],'#35475f');
  }else if(['wheel','roller','weight'].includes(s.kind)){
   const axis=s.axis||[1,0,0],a=V3.unit(V3.cross(axis,Math.abs(axis[1])<.8?[0,1,0]:[0,0,1])),b=V3.cross(axis,a),r=s.radius||6;
   const points=Array.from({length:24},(_,i)=>V3.add(V3.add(s.c,a,r*Math.cos(i*Math.PI/12)),b,r*Math.sin(i*Math.PI/12)));face(points,s.kind==='roller'?'#35475f':'#45607f');
  }else if(s.kind==='kettlebell'){
   const c=project(s.c);queue('circle',{cx:c[0],cy:c[1],r:s.radius||8.5,fill:'#304a6a',stroke:'#607691','stroke-width':1},[s.c]);
   const d=V3.unit(V3.sub(s.c,s.grip)),points=[V3.add(V3.add(s.grip,[1,0,0],-5.5),d,3),s.grip,V3.add(V3.add(s.grip,[1,0,0],5.5),d,3)],p=points.map(project);
   queue('path',{d:`M${p[0][0]},${p[0][1]} Q${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]}`,fill:'none',stroke:'#b4c6dc','stroke-width':2.4},points);
  }else throw Error('Unknown spatial equipment kind: '+s.kind);
 }
 function body(R){
  for(const s of ['R','L']){
   const skin=palette[s==='R'?'far':'skin'];
   limb(R['hip'+s],R['kn'+s],13,'th',skin);limb(R['kn'+s],R['an'+s],10.5,'sh',skin);
   limb(R['heel'+s],R['toe'+s],6,'ft',palette.shoe);
   limb(R['sh'+s],R['el'+s],10,'ua',skin);limb(R['el'+s],R['wr'+s],8.5,'fa',skin);limb(R['wr'+s],R['hand'+s],7,'hd',skin);
   limb(R['hip'+s],V3.add(R['hip'+s],V3.unit(V3.sub(R['kn'+s],R['hip'+s])),18),14,'th',palette.shorts);
  }
  const ring=(h,w,d)=>Array.from({length:12},(_,i)=>V3.add(V3.add(V3.add(R.hip,R.u,h),[1,0,0],w*Math.cos(i*Math.PI/6)),R.n,d*Math.sin(i*Math.PI/6)));
  const rings=R.basis?CATALOG_RINGS.map(([h])=>Array.from({length:24},(_,i)=>catalogTorsoPoint(R,h,i*Math.PI/12))):[ring(-5,12,8),ring(9,13,9),ring(23,12,8),ring(40,19,11),ring(49,19,9)];
  silhouette(rings.slice(1).flat(),palette.kit);silhouette(rings.slice(0,2).flat(),palette.shorts);
  line3(V3.add(R.sh,R.u,-2),R.head,8.5,'#95a6bd');
  const h=project(R.head),hu=project(V3.add(R.head,R.headU)),a=Math.atan2(hu[0]-h[0],-(hu[1]-h[1]))/D2R;
  queue('ellipse',{cx:f1(h[0]),cy:f1(h[1]),rx:8.5,ry:10,transform:`rotate(${f1(a)} ${f1(h[0])} ${f1(h[1])})`,fill:palette.skin},[R.head],1);
  const nose=[V3.add(V3.add(R.head,R.headN,8),R.headU,2),V3.add(R.head,R.headN,11),V3.add(V3.add(R.head,R.headN,8),R.headU,-3)];
  face(nose,'#a3b3cb');
 }
 function compile(t,index=0,withMuscles=true){
  records=[];const R=anim.rig3d(t);body(R);
  const muscles=muscleFrame(anim,t,index);
  const surfaces=!muscles||!withMuscles?[]:anim.muscleProfile?.regions?catalogMuscleSurfaces(R,anim.muscleProfile,{coarse:true}).filter(f=>project(f.normal)[2]>.035):visibleMuscleSurfaces(R,anim.muscleProfile,camera);
  if(muscles&&withMuscles)for(const zone of muscleContours(surfaces)){
   const value=muscles.values[zone.id],fill=muscleColor(value);
   queue('path',{d:closedSpline(zone.points.map(p=>project(p).slice(0,2))),fill,class:'muscle-zone','data-muscle':zone.id,'data-side':zone.side,
    'data-role':(anim.muscleProfile.regions?.[zone.id]||anim.muscleProfile.muscles[zone.id]).role,'data-band':muscleBand(value),
    stroke:fill,'stroke-width':.25,'stroke-linejoin':'round','aria-hidden':'true'},zone.points);
   /* Слой связан с глубиной своего сегмента: не проступает сквозь ближнюю руку/реквизит. */
   if(zone.anchor)records[records.length-1].depth=project(zone.anchor)[2]+.15;
  }
  R.props.forEach(prop);return{R,muscles,records:records.sort((a,b)=>a.depth-b.depth)};
 }
 // Bounds include equipment, every sampled pose, and the floor; camera stays still.
 for(let i=0;i<=40;i++){compile(i/40,0,false);tracePts.push(project(anim.rig3d(i/40).gripL));}
 const floorCorners=[[-76,187,0],[76,187,0],[76,187,195],[-76,187,195]];
 if(!anim.noGround)allBounds.push(...floorCorners.map(project));
 let minX=Math.min(...allBounds.map(p=>p[0]))-13,maxX=Math.max(...allBounds.map(p=>p[0]))+13,minY=Math.min(...allBounds.map(p=>p[1]))-16,maxY=Math.max(...allBounds.map(p=>p[1]))+10;
 const ratio=opts.ratio||1.15,cx=(minX+maxX)/2,cy=(minY+maxY)/2;let w=maxX-minX,h=maxY-minY;
 if(w/h<ratio)w=h*ratio;else h=w/ratio;
 svg.setAttribute('viewBox',`${f1(cx-w/2)} ${f1(cy-h/2)} ${f1(w)} ${f1(h)}`);
 if(!anim.noGround){
  el('path',{d:path2(floorCorners.map(project)),class:'spatial-floor'},ground);
  for(const z of [25,75,125,175]){const a=project([-70,187,z]),b=project([70,187,z]);el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'spatial-grid'},ground);}
 }
 trace.setAttribute('d',tracePts.map((p,i)=>`${i?'L':'M'}${f1(p[0])},${f1(p[1])}`).join(' '));
 let nodes=[],jointNodes=[],selectedRegion='all';
 function at(t,frame){
  const {R,muscles,records}=compile(t,frame?.index||0);
  records.forEach((s,i)=>{let node=nodes[i];if(!node||node.tagName!==s.tag){const replacement=el(s.tag,{});if(node)node.replaceWith(replacement);else scene.appendChild(replacement);node=nodes[i]=replacement;}for(const attr of [...node.attributes])if(!(attr.name in s.attrs))node.removeAttribute(attr.name);for(const[k,v]of Object.entries(s.attrs))node.setAttribute(k,v);});
  for(let i=records.length;i<nodes.length;i++)nodes[i].remove();nodes.length=records.length;
  const names=['shL','elL','wrL','hipL','knL','anL','shR','elR','wrR','hipR','knR','anR'];
  names.forEach((name,i)=>{const p=project(R[name]),node=jointNodes[i]||(jointNodes[i]=el('circle',{r:2.1,class:'joint-dot'},dots));node.setAttribute('cx',f1(p[0]));node.setAttribute('cy',f1(p[1]));});
  svg.dataset.pose=String(t);if(muscles)svg.dataset.musclePhase=muscles.phase;allBounds.length=0;setRegion(selectedRegion);
 }
 const setTrace=show=>trace.setAttribute('display',show?'inline':'none');
 const setMuscles=show=>svg.classList.toggle('show-muscles',!!show&&!!anim.muscleProfile);
 const setRegion=id=>{selectedRegion=id;for(const node of svg.querySelectorAll('[data-muscle]'))node.style.opacity=id==='all'||node.dataset.muscle===id?'1':'.12';};
 setMuscles(opts.muscles);at(opts.t||0);const setVectors=vectorGroup(svg,anim,camera);return{svg,at,setTrace,setVectors,setMuscles,setRegion,camera};
}

function spatialExercise(id,rig,camera,cameras,hints){
 const a=DEMO[id].anim;a.rig3d=rig;a.camera=camera;a.view=camera;a.cameras=cameras;a.cameraHints=hints;
 a.sample=t=>({spatialT:t});delete a._C;delete a._normalized;
}
spatialExercise('latpull',pulldownRig,'front',['front','back','side'],{
 front:'Следите за симметрией: локти опускаются по сторонам корпуса, хват не меняется.',
 back:'Видны широчайшие и середина спины. Локти опускаются симметрично, корпус не раскачивается.',
 side:'Рукоять проходит перед лицом к верхней части груди. Наклон корпуса остаётся небольшим.'
});
spatialExercise('bulgarian',bulgarianRig,'side',['side','angle'],{
 side:'Заднее колено опускается к полу; подъём задней стопы остаётся на скамье.',
 angle:'Стопы стоят на двух линиях. Переднее колено направлено в сторону носка, таз сохраняет положение.'
});
spatialExercise('hipthrust',thrustRig,'side',['side','angle'],{
 side:'Опора — нижняя часть лопаток. Диски показаны контуром, чтобы не скрывать таз и положение грифа.',
 angle:'Видны обе стопы, положение коленей и хват. Гриф с подкладкой лежит на сгибе бёдер.'
});
spatialExercise('chinup',chinupRig,'side',['side','front'],{
 side:'Локти движутся вниз перед корпусом. Кисти сохраняют хват, тело поднимается без раскачивания.',
 front:'Хват примерно на ширине плеч, ладонями к себе. Руки работают симметрично; движение локтей вперёд видно сбоку.'
});

/* ---------- Пространственные риги 3.3: жим лёжа, присед, становая, жим стоя ---------- */
/* Жим лёжа: скамья вдоль Z, голова к малым Z. Корпус лежит (угол -90: «вверх» тела = +Z). */
const benchTop3=136;
function benchRig(t){
 const angle=-90,hipY=benchTop3-10;
 const R=body3([0,hipY,112],angle,0,12);
 /* корпус лежит вдоль скамьи (−Z к голове): таз в середине, голова на скамье, не за краем */
 /* гриф: вверху над плечами, внизу на нижней части груди — на 16 ближе к тазу (+Z); локти уходят вниз-к тазу */
 const barZ=R.sh[2]+4+16*t;
 const topY=R.sh[1]-Math.sqrt(Math.max(0,(FL.ua+FL.fa-1)**2-(R.sh[2]-barZ)**2));
 const y=topY+(hipY-10-topY)*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*34,y+3,barZ],[sign*.8,.6,.45],[0,-1,0]);  /* локти: наружу, вниз под скамью и к тазу (~60° к корпусу) */
  leg3(R,s,[sign*16,180,166],[0,-1,0],[0,0,1]);
 }
 const bar=[0,y,barZ];
 R.bar=bar;
 R.props=[...bench3(28,150,benchTop3,15),{kind:'barbell',c:bar},
  {kind:'line',a:[-40,topY-6,R.sh[2]-8],b:[-40,benchTop3+7,R.sh[2]-8],width:4,tone:'steel'},{kind:'line',a:[40,topY-6,R.sh[2]-8],b:[40,benchTop3+7,R.sh[2]-8],width:4,tone:'steel'},
  {kind:'line',a:[-40,topY+6,R.sh[2]-8],b:[-40,topY+6,R.sh[2]+2],width:3,tone:'steel'},{kind:'line',a:[40,topY+6,R.sh[2]-8],b:[40,topY+6,R.sh[2]+2],width:3,tone:'steel'}];
 R.contacts=[{p:[0,benchTop3,R.sh[2]],label:'Лопатки на скамье'},{p:[-16,184,166],label:'Стопы на полу'}];
 return R;
}
/* Присед со штангой на спине, стопы чуть шире плеч, носки развёрнуты. */
function squatRig(t){
 const angle=2+42*t, hipY=97+49*t, hipZ=98-28*t;
 const R=body3([0,hipY,hipZ],angle,-8*t,12);
 const bar=V3.add(V3.add(R.sh,R.u,1),R.n,-8);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*18,180,98],[sign*.35,0,1],[sign*.3,0,1]);
  /* хват за гриф на трапециях */
  const grip=V3.add(bar,[sign,0,0],33);
  arm3(R,s,V3.add(grip,R.n,-3.5),[sign*.3,1,-.6],R.n);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-18,184,98],label:'Вся стопа на полу'}];
 return R;
}
/* Становая тяга: гриф у голеней, движение вверх вдоль ног. */
function deadliftRig(t){
 const a0=62,a1=-2, angle=a0+(a1-a0)*t;
 /* опорные стопы неподвижны; таз идёт вверх и вперёд */
 const hip=[0,116-19*t,78+20*t];
 const R=body3(hip,angle,8-8*t,12);
 const bar=hangingBar3(R,25,103);  /* кисти остаются на грифе, руки выпрямлены */
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,100],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*25,bar[1]-3.5,bar[2]],[0,0,-1],[0,1,0]);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-13,184,100],label:'Середина стопы под грифом'}];
 return R;
}
/* Жим штанги стоя: гриф от ключиц вертикально над головой, голова уходит назад и возвращается. */
function ohpRig(t){
 const R=body3([0,97,98],-2,t<.5?-12*(1-t*2):0,12);
 const chestZ=R.sh[2]+8;
 const topY=R.sh[1]-Math.sqrt(Math.max(0,(FL.ua+FL.fa-1)**2-(chestZ-R.sh[2])**2));
 const lowY=R.sh[1]+2;
 const y=lowY+(topY-lowY)*t;
 /* в нижней трети гриф обходит голову: вперёд, затем назад над макушкой */
 const z=chestZ-(chestZ-R.sh[2]+2)*Math.max(0,(t-.45)/.55);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*11,180,98],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*33,y+3,z],[sign*.6,.55,.45],[0,-1,0]);  /* локти под грифом и чуть впереди, не за спиной */
 }
 const bar=[0,y,z];
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-11,184,98],label:'Стопы на ширине таза'}];
 return R;
}
spatialExercise('bbbench',benchRig,'side',['side','front','above'],{
 side:'Гриф опускается на нижнюю часть груди и уходит вверх и чуть к голове. Таз не отрывается от скамьи.',
 front:'Хват чуть шире плеч, предплечья в нижней точке почти вертикальны, локти не расходятся под 90°.',
 above:'Видны грудь, плечи и симметрия рук. Траекторию грифа относительно груди проверяйте также сбоку.'
});
spatialExercise('squat',squatRig,'side',['side','front','back'],{
 side:'Таз уходит назад одновременно со сгибанием коленей, гриф движется по вертикали над серединой стопы.',
 front:'Колени идут по направлению носков, не заваливаясь внутрь. Стопы чуть шире плеч, пятки на полу.',
 back:'Видны ягодичные и задняя поверхность бёдер. Таз не смещается в сторону; опора сохраняется на обеих стопах.'
});
spatialExercise('deadlift',deadliftRig,'side',['side','front'],{
 side:'Гриф движется вдоль голеней по вертикали; плечи немного впереди грифа в старте, спина прямая.',
 front:'Хват чуть шире ног, руки висят вертикально, стопы на ширине таза под грифом.'
});
spatialExercise('ohp',ohpRig,'side',['side','front'],{
 side:'Гриф уходит от ключиц вертикально вверх, голова отклоняется назад и возвращается под гриф.',
 front:'Хват чуть шире плеч, локти под грифом; корпус не отклоняется в стороны.'
});

/* ---------- Пространственные риги 3.4 ---------- */
/* Румынская тяга: таз назад, колени мягкие, гриф скользит по ногам. t=0 верх, t=1 низ (eccFirst). */
function rdlRig(t){
 const angle=-2+70*t, hip=[0,97+7*t,98-20*t];
 const R=body3(hip,angle,8*t,12);
 const bar=hangingBar3(R,22,104-5*t);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*12,180,98],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*22,bar[1]-3.5,bar[2]],[0,0,-1],[0,1,0]);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar,optional:'bb'},{kind:'dumbbell',c:V3.add(bar,[1,0,0],-22),optional:'db'},{kind:'dumbbell',c:V3.add(bar,[1,0,0],22),optional:'db'}];
 R.contacts=[{p:[-12,184,98],label:'Вес на пятках и середине стопы'}];
 return R;
}
/* Сплит-присед: передняя нога впереди, опускание вертикально. t=0 верх, t=1 низ. */
function lungeRig(t){
 const R=body3([0,104+30*t,108],0+3*t,0,12);
 leg3(R,'L',[-12,180,122],[0,0,1],[0,0,1]);          /* передняя: голень почти вертикальна */
 /* Задний носок — неподвижная опора; пятка может поворачиваться вокруг него.
    Колено и голеностоп решаются одной цепью, без ручного смещения стопы. */
 const footAngle=.9+.1*t,footDir=[0,Math.sin(footAngle),Math.cos(footAngle)],toe=[12,180,68];
 leg3(R,'R',V3.add(toe,footDir,-13),[0,1,0],footDir);
 for(const [s,sign]of [['L',-1],['R',1]]){
  const d=V3.unit([sign*.08,1,0]);R['el'+s]=V3.add(R['sh'+s],d,30);R['wr'+s]=V3.add(R['el'+s],d,27);
  R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
  R.props.push({kind:'dumbbell',c:R['grip'+s],optional:'db'});
 }
 R.contacts=[{p:[-12,184,127],label:'Передняя стопа целиком'},{p:[12,184,68],label:'Задняя стопа на носке'}];
 return R;
}
/* Жим гантелей сидя: спинка вертикальна. t=0 низ (гантели у плеч), t=1 верх. */
function dbpressRig(t){
 const hip=[0,128,90], R=body3(hip,-6,0,12);
 const seatZ0=hip[2]-14, seatZ1=hip[2]+22;
 for(const [s,sign]of [['L',-1],['R',1]]){
  const kn=[sign*12,138,hip[2]+Math.sqrt(FL.th**2-10**2)];R['kn'+s]=kn;R['an'+s]=V3.add(kn,[0,1,0],FL.sh);
  R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
  /* низ: гантели у ушей снаружи от плеч, предплечья вертикально; верх: над плечами */
  const lowX=sign*40, lowY=R.sh[1]-14, topX=sign*12, topY=R.sh[1]-(FL.ua+FL.fa-3);
  const wr=[lowX+(topX-lowX)*t, lowY+(topY-lowY)*t, R.sh[2]+6-4*t];
  arm3(R,s,wr,[sign*.35,1,.35],[0,-1,0]);  /* локти вниз под гантелями и чуть вперёд — в плоскости лопатки */
  R.props.push({kind:'dumbbell',c:V3.add(R['wr'+s],[0,-3,0])});
 }
 R.props.push(...bench3(seatZ0,seatZ1,140,22), box3(-20,20,hip[1]-62,hip[1]+8,hip[2]-20,hip[2]-14));
 R.contacts=[{p:[0,hip[1]-30,hip[2]-14],label:'Спина прижата к спинке'}];
 return R;
}
/* Тяга штанги в наклоне: корпус 45°, гриф к низу живота. t=0 внизу, t=1 у живота. */
function bbrowRig(t){
 const angle=52, hip=[0,104,84];
 const R=body3(hip,angle,-10,12);
 const low=hangingBar3(R,26,118), high=V3.add(V3.add(hip,R.u,20),R.n,15);
 const bar=[0,low[1]+(high[1]-low[1])*t,low[2]+(high[2]-low[2])*t];
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,100],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*26,bar[1]-3.5,bar[2]],[sign*.4,-1,-.3],[0,1,0]);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-13,184,100],label:'Стопы на ширине таза'}];
 return R;
}
/* Жим гантелей лёжа: гантели сходятся над грудью. t=0 верх, t=1 низ. */
function dbbenchRig(t){
 const hipY=benchTop3-10, R=body3([0,hipY,112],-90,0,12);
 const chestZ=R.sh[2]+6;  /* гантели над серединой груди */
 const topY=R.sh[1]-(FL.ua+FL.fa-2), lowY=hipY-14;
 const y=topY+(lowY-topY)*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  const x=sign*(12+26*t);
  arm3(R,s,[x,y+3,chestZ],[sign*.8,.6,.4],[0,-1,0]);
  leg3(R,s,[sign*16,180,166],[0,-1,0],[0,0,1]);
  R.props.push({kind:'dumbbell',c:[x,y,chestZ]});
 }
 R.props.push(...bench3(28,150,benchTop3,15));
 R.contacts=[{p:[0,benchTop3,R.sh[2]],label:'Лопатки на скамье'},{p:[-16,184,166],label:'Стопы на полу'}];
 return R;
}
spatialExercise('rdl',rdlRig,'side',['side','front'],{
 side:'Таз уходит назад, колени слегка согнуты и почти не меняют угол. Снаряд скользит вдоль ног.',
 front:'Снаряд остаётся по центру, плечи на одной высоте, стопы на ширине таза.'
});
spatialExercise('lunge',lungeRig,'side',['side','front'],{
 side:'Опускание вертикальное: переднее колено над стопой, заднее идёт к полу, корпус не наклоняется.',
 front:'Стопы на двух параллельных линиях, переднее колено направлено по носку и не заваливается внутрь.'
});
spatialExercise('dbpress',dbpressRig,'front',['front','side'],{
 front:'Гантели движутся по дуге и сходятся над головой; локти под гантелями, плечи на одной высоте.',
 side:'Спина прижата к спинке. Локти не уходят назад за корпус, поясница без сильного прогиба.'
});
spatialExercise('bbrow',bbrowRig,'side',['side','front'],{
 side:'Корпус под 45–50° и не меняет наклон. Гриф идёт к низу живота, локти назад вдоль корпуса.',
 front:'Хват на ширине плеч, локти движутся симметрично, плечи на одной высоте.'
});
spatialExercise('dbbench',dbbenchRig,'front',['front','side'],{
 front:'Гантели расходятся при опускании и сходятся при жиме по дуге; локти под 45–60° к корпусу.',
 side:'Лопатки сведены и прижаты, в пояснице естественный прогиб, стопы на полу.'
});

DEMO.latpull.tech=['Сядьте, поставьте стопы на пол и зафиксируйте бёдра под валиками. Возьмите рукоять хватом сверху шире плеч.','Слегка отклоните корпус назад и сохраняйте этот наклон; голову держите по линии спины.','Ведите локти вниз по сторонам корпуса, опуская рукоять перед лицом к верхней части груди. Остановитесь, когда дальнейшая тяга требует уводить локти назад.','Плавно верните рукоять вверх, разгибая руки и позволяя лопаткам естественно двигаться.'];
DEMO.latpull.anim.cues=['Ведите локти вниз; рукоять движется перед лицом к груди.','Разгибайте руки с контролем, сохраняя положение корпуса.'];
DEMO.bulgarian.tech=['Поставьте переднюю стопу на пол, а подъём задней — на устойчивую скамью. Стопы на ширине таза, не на одной линии.','Сгибайте переднюю ногу и опускайте заднее колено к полу. Глубину выбирайте по контролю положения и доступной подвижности.','Сохраняйте опору всей передней стопой; переднее колено движется в сторону носка. Небольшой наклон корпуса допустим.','Поднимитесь преимущественно усилием передней ноги. Повторите другой стороной.'];
DEMO.bulgarian.anim.cues=['Опускайте таз и заднее колено; обе стопы сохраняют опору.','Поднимайтесь за счёт передней ноги, не отталкиваясь от скамьи.'];
DEMO.hipthrust.tech=['Обоприте нижнюю часть лопаток на устойчивую скамью. Гриф с подкладкой расположите на сгибе бёдер и удерживайте руками.','Поставьте стопы устойчиво: в верхней точке голени примерно вертикальны, колени направлены по носкам.','Поднимите таз до линии плечи — таз — колени. Верх спины сохраняет контакт со скамьёй; поясница не добавляет прогиб.','Плавно опустите таз, контролируя штангу и сохраняя опору стопами.'];
MOTION_FOCUS.latpull={setup:'Бёдра под валиками, стопы на полу, небольшой наклон назад.',control:'Локти вниз, рукоять перед лицом к груди; корпус не раскачивается.'};
MOTION_FOCUS.bulgarian={setup:'Передняя стопа на полу, подъём задней — на скамье.',control:'Заднее колено движется к полу; передняя стопа сохраняет опору.'};
MOTION_FOCUS.hipthrust={setup:'Нижняя часть лопаток на краю скамьи; гриф на сгибе бёдер.',control:'Таз поднимается за счёт разгибания бёдер; опора спиной и стопами сохраняется.'};
DEMO.chinup.anim.cues=['Поднимайте корпус, ведя локти вниз перед собой. Кисти остаются на перекладине.','Плавно опускайтесь, разгибая руки без раскачивания и вытягивания шеи.'];
DEMO.chinup.tech=['Возьмитесь за перекладину примерно на ширине плеч, ладонями к себе. Повисните, контролируя положение плеч.','Поднимайте тело, направляя локти вниз перед корпусом. Сохраняйте линию головы и спины.','Поднимите подбородок выше перекладины без вытягивания шеи; затем подконтрольно опуститесь до разгибания рук.'];
MOTION_FOCUS.chinup={setup:'Хват ладонями к себе примерно на ширине плеч.',control:'Локти вниз перед корпусом; кисти на перекладине, без маха ногами.'};
MOTION_SOURCES.push(['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],['Болгарский выпад — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat'],['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']);
MOTION_SOURCES.push(['Подтягивания обратным хватом — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']);

/* Учебные мышечные зоны. Числа управляют яркостью, не измеряют силу или ЭМГ.
   Источники описывают технику/состав мышц; кривые — явно условная иллюстрация.
   Узлы кривых: t=0, .5, 1. Общие края исключают скачки в паузах и на развороте. */
const MUSCLE_ROLES={primary:'Основная',support:'Вспомогательная',stabilizer:'Стабилизатор'};
const MUSCLE_BANDS=['Нейтрально','Низкая яркость','Средняя яркость','Высокая яркость'];
const MUSCLE_PROFILES={
 bbbench:{pair:'above',curveBasis:'illustrative',
  sources:[['Мышцы в жиме лёжа — исследование','https://pubmed.ncbi.nlm.nih.gov/25799093/']],
  notes:{concentric:'Грудные, трицепс и передняя дельта участвуют в жиме. Корпус сохраняет опору.',
   eccentric:'Грудные, трицепс и передняя дельта контролируют опускание. Корпус сохраняет опору.',
   end:'Нижняя точка: мышцы продолжают удерживать нагрузку во время паузы.',
   start:'Верхняя точка: сохраняйте хват и устойчивое положение корпуса.'},
  muscles:{
   chest:{role:'primary',concentric:[.35,.86,.65],eccentric:[.35,.59,.65]},
   triceps:{role:'support',concentric:[.42,.72,.45],eccentric:[.42,.51,.45]},
   delt_f:{role:'support',concentric:[.32,.64,.50],eccentric:[.32,.46,.50]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 latpull:{pair:'back',curveBasis:'illustrative',
  sources:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],
   ['Мышцы в тяге верхнего блока — исследование','https://pubmed.ncbi.nlm.nih.gov/15228624/']],
  notes:{concentric:'Широчайшие и сгибатели локтя участвуют в тяге; мышцы корпуса удерживают положение.',
   eccentric:'Мышцы спины и сгибатели локтя контролируют возврат рукояти вверх.',
   end:'Рукоять у груди: мышцы удерживают положение, корпус не раскачивается.',
   start:'Руки вверху: сохраняйте хват и положение корпуса перед следующей тягой.'},
  muscles:{
   lats:{role:'primary',concentric:[.36,.86,.72],eccentric:[.36,.61,.72]},
   biceps:{role:'support',concentric:[.30,.68,.57],eccentric:[.30,.49,.57]},
   midback:{role:'support',concentric:[.32,.61,.65],eccentric:[.32,.48,.65]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 squat:{pair:'back',curveBasis:'illustrative',
  sources:[['Мышцы и моменты суставов в приседе — исследование','https://pubmed.ncbi.nlm.nih.gov/33136769/']],
  notes:{concentric:'Квадрицепс разгибает колени, ягодичные — тазобедренные суставы. Корпус сохраняет устойчивость.',
   eccentric:'Квадрицепс и ягодичные контролируют опускание. Мышцы корпуса удерживают спину.',
   end:'Нижняя точка: удерживайте напряжение корпуса и опору всей стопой.',
   start:'Верхняя точка: сохраните опору и подготовьтесь к следующему повторению.'},
  muscles:{
   quads:{role:'primary',concentric:[.34,.88,.72],eccentric:[.34,.64,.72]},
   glutes:{role:'primary',concentric:[.32,.82,.67],eccentric:[.32,.59,.67]},
   hams:{role:'support',concentric:[.28,.43,.40],eccentric:[.28,.37,.40]},
   abs:{role:'stabilizer',concentric:[.36,.43,.43],eccentric:[.36,.43,.43]},
   lowback:{role:'stabilizer',concentric:[.36,.46,.46],eccentric:[.36,.46,.46]}
  }}
};
for(const[id,profile]of Object.entries(MUSCLE_PROFILES))DEMO[id].anim.muscleProfile=profile;

function muscleFrame(anim,t,index=0){
 const profile=motionProfile(anim);
 if(!profile)return null;
 t=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
 const phase=index===1?'end':index===3?'start':((index===0)!==!!anim.eccFirst?'concentric':'eccentric');
 const curve=phase==='concentric'?'concentric':'eccentric',values={};
 for(const[id,m]of Object.entries(profile.muscles)){
  const knots=m[curve],i=t<.5?0:1,q=(t-i*.5)*2,e=q*q*(3-2*q);
  values[id]=knots[i]+(knots[i+1]-knots[i])*e;
 }
 for(const[id,r]of Object.entries(profile.regions||{}))values[id]=values[r.parent]*r.factor;
 return{phase,values,note:profile.notes[phase]};
}
function muscleBand(v){return v<.12?0:v<.45?1:v<.72?2:3;}
function muscleColor(v){
 const stops=[[174,184,200],[237,172,99],[237,107,82]],x=Math.max(0,Math.min(1,v))*2,i=Math.min(1,Math.floor(x)),q=x-i;
 return '#'+stops[i].map((c,k)=>Math.round(c+(stops[i+1][k]-c)*q).toString(16).padStart(2,'0')).join('');
}

/* Поверхности в координатах скелета: передняя/задняя сторона, не пятна на экране.
   Тело остаётся схематичным; плечевой пояс и вращение плеча требуют полноценной модели. */
function muscleSurfaces(R,profile){
 const faces=[],has=id=>Object.prototype.hasOwnProperty.call(profile.muscles,id);
 function patch(id,side,rows,point,normal,anchor){
  if(!has(id))return;
  const slices=6;
  for(let r=0;r<rows.length-1;r++)for(let k=0;k<slices;k++){
   const [h0,a0,b0]=rows[r],[h1,a1,b1]=rows[r+1],q0=k/slices,q1=(k+1)/slices;
   const a=a0+(b0-a0)*q0,b=a0+(b0-a0)*q1,c=a1+(b1-a1)*q1,d=a1+(b1-a1)*q0;
   faces.push({id,side,points:[point(h0,a),point(h0,b),point(h1,c),point(h1,d)],
    normal:normal((h0+h1)/2,(a+b+c+d)/4),anchor});
  }
 }
 const rings=[[-5,12,8],[9,13,9],[23,12,8],[40,19,11],[49,19,9]];
 function radius(h){
  const i=Math.max(0,Math.min(rings.length-2,rings.findIndex(r=>r[0]>=h)-1)),a=rings[i],b=rings[i+1],q=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0])));
  return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];
 }
 for(const[side,sign]of [['L',-1],['R',1]]){
  const torsoPoint=(h,a)=>{const[w,d]=radius(h);return V3.add(V3.add(V3.add(R.hip,R.u,h),[sign,0,0],w*Math.sin(a)),R.n,d*Math.cos(a));};
  const torsoNormal=(h,a)=>{const[w,d]=radius(h);return V3.unit(V3.add([sign*Math.sin(a)/w,0,0],R.n,Math.cos(a)/d));};
  const torsoAnchor=V3.add(R.hip,R.u,30.25),pelvisAnchor=V3.add(R.hip,R.u,2);
  patch('chest',side,[[31,.13,.90],[39,.09,1.20],[47,.20,1.12]],torsoPoint,torsoNormal,torsoAnchor);
  patch('abs',side,[[13,.08,.53],[21,.08,.51],[29,.08,.40]],torsoPoint,torsoNormal,torsoAnchor);
  patch('lats',side,[[12,1.65,2.90],[25,1.12,2.85],[39,1.02,2.46]],torsoPoint,torsoNormal,torsoAnchor);
  patch('midback',side,[[34,2.48,3.03],[42,2.22,3.03],[48,2.53,3.03]],torsoPoint,torsoNormal,torsoAnchor);
  patch('lowback',side,[[12,2.62,3.02],[21,2.70,3.02],[30,2.75,3.02]],torsoPoint,torsoNormal,torsoAnchor);
  patch('glutes',side,[[-4,1.62,2.98],[3,1.45,3.04],[9,1.90,3.00]],torsoPoint,torsoNormal,pelvisAnchor);
  function onLimb(id,a,b,width,rows,front){
   const delta=V3.sub(b,a),axis=V3.unit(delta);
   let n=V3.add(front,axis,-V3.dot(front,axis));
   if(Math.hypot(...n)<.01)n=V3.add(R.u,axis,-V3.dot(R.u,axis));
   n=V3.unit(n);const lateral=V3.unit(V3.cross(axis,n));
   const radial=(t,angle)=>V3.add(V3.add([0,0,0],n,Math.cos(angle)),lateral,Math.sin(angle));
   const point=(t,angle)=>V3.add(V3.add(a,delta,t),radial(t,angle),width*(.94-.28*t)*.5);
   patch(id,side,rows,point,radial,V3.add(a,delta,.5));
  }
  const sh=R['sh'+side],elbow=R['el'+side],hip=R['hip'+side],knee=R['kn'+side];
  onLimb('delt_f',sh,elbow,10,[[.02,-.72,.72],[.16,-1.05,1.05],[.30,-.62,.62]],R.n);
  onLimb('biceps',sh,elbow,10,[[.29,-.62,.62],[.56,-.80,.80],[.84,-.38,.38]],R.n);
  onLimb('triceps',sh,elbow,10,[[.24,1.55,4.73],[.55,1.32,4.96],[.88,2.34,3.94]],R.n);
  const thighFront=V3.cross([1,0,0],V3.unit(V3.sub(knee,hip)));
  onLimb('quads',hip,knee,13,[[.13,-1.43,1.43],[.44,-1.62,1.62],[.84,-1.02,1.02]],thighFront);
  onLimb('hams',hip,knee,13,[[.22,1.72,4.56],[.53,1.62,4.66],[.83,2.10,4.18]],thighFront);
 }
 return faces;
}
function visibleMuscleSurfaces(R,profile,camera){
 const project=camera3(camera);
 return muscleSurfaces(R,profile).filter(face=>project(face.normal)[2]>.035);
}
/* Общий контур вместо сетки цветных четырёхугольников: меньше узлов SVG и швов. */
function muscleContours(faces){
 const groups=new Map(),key=p=>p.map(v=>v.toFixed(6)).join(',');
 for(const face of faces){
  const id=face.id+':'+face.side;
  if(!groups.has(id))groups.set(id,{face,edges:new Map()});
  const {edges}=groups.get(id);
  for(let i=0;i<face.points.length;i++){
   const a=face.points[i],b=face.points[(i+1)%face.points.length],ka=key(a),kb=key(b),edge=[ka,kb].sort().join('|');
   if(edges.has(edge))edges.delete(edge);else edges.set(edge,{a,b,ka,kb});
  }
 }
 const contours=[];
 for(const {face,edges}of groups.values())while(edges.size){
  const [firstKey,first]=edges.entries().next().value;
  edges.delete(firstKey);const points=[first.a,first.b];let end=first.kb;
  while(end!==first.ka){
   const entry=[...edges].find(([,e])=>e.ka===end||e.kb===end);if(!entry)break;
   const[k,e]=entry;edges.delete(k);const forward=e.ka===end;points.push(forward?e.b:e.a);end=forward?e.kb:e.ka;
  }
  if(end===first.ka)points.pop();
  if(points.length>=3)contours.push({...face,points});
 }
 return contours;
}

/* Catalog coordinates: centimetres, Y down. Reconstructed depth is an educational
   model, not measured motion capture. Original animation descriptors remain intact
   for the independent regression audit. All cameras use the same world pose. */
const CATALOG_CAMERAS=['above','angle','side','front','back'];
const CATALOG_RINGS=[[0,12.5,10,10],[10,13,11.5,8],[18,13.3636363636,12.2272727273,8],[21,13.5,12.5,8],[31,16.3,12.5,9],[40,18.2,12.5,10],[47,17.8,12,10],[52,15.8,8.5,10]];
function catalogCenter(R,h){
 const u=R.chestU||R.u;
 return h>18&&R.waist?V3.add(R.waist,u,h-18):V3.add(R.hip,R.u,h);
}
function catalogSection(h){
 if(h<=0)return CATALOG_RINGS[0].slice(1);
 for(let i=1;i<CATALOG_RINGS.length;i++)if(h<=CATALOG_RINGS[i][0]){
  const a=CATALOG_RINGS[i-1],b=CATALOG_RINGS[i],q=(h-a[0])/(b[0]-a[0]);return a.slice(1).map((v,k)=>v+(b[k+1]-v)*q);
 }
 return CATALOG_RINGS.at(-1).slice(1);
}
function catalogTorsoPoint(R,h,angle,extra=0){
 const[w,a,b]=catalogSection(h),n=R.chestN||R.n,x=R.x||V3.unit(V3.cross(R.n,R.u)),s=Math.cos(angle);
 return V3.add(V3.add(catalogCenter(R,h),x,w*Math.sin(angle)),n,(s>=0?a:b)*s+extra*s);
}
function catalogSource(ex){const a={...ex.anim};delete a.catalogRig;delete a.catalogProfile;prepAnim(a);return a;}
function catalogLegacyPose(a,t){return solvePose(a,poseAt(a,t),a._C);}
function catalogPlanarRig(ex,source){
 return t=>{
  const P=poseAt(source,t),J=solvePose(source,P,source._C),front=source.view==='front';
  const map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]],vector=p=>front?[p[0],p[1],0]:[0,p[1],p[0]];
  const hip=map(front?J.c:J.hip),u=vector(J.u),n=front?[0,0,1]:vector(J.n),x=V3.unit(V3.cross(n,u));
  const sh=map(front?J.neck:J.sh),R={hip,sh,u,n,x,head:map(J.head),headU:vector(dir(J.upperTa??J.ta)),headN:front?n:vector(dir((J.upperTa??J.ta)+90)),props:[],contacts:[],basis:'reconstructed'};
  if(J.waist){R.waist=map(J.waist);R.chestU=vector(J.chestU);R.chestN=vector(J.chestN);}
  R.headU=V3.unit(V3.sub(R.head,R.sh));R.headN=V3.unit(V3.cross(R.headU,R.x));
  for(const[s,old,sign]of [['L',front?'L':'N',-1],['R',front?'R':'F',1]]){
   R['sh'+s]=front?map(J['sh'+old]):V3.add(sh,x,sign*19);
   R['hip'+s]=front?map(J['hip'+old]):V3.add(hip,x,sign*11);
   for(const part of ['el','wr','hand','grip','kn','an','toe','heel']){
    const p=J[part+old];if(p)R[part+s]=front?map(p):V3.add(map(p),x,sign*(/^(kn|an|toe|heel)$/.test(part)?11:19));
   }
   if(front){
    for(const[part,root,mid,end,l1,l2]of [['arm','sh','el','wr',FL.ua,FL.fa],['leg','hip','kn','an',FL.th,FL.sh]]){
     const spec=P[part+s]||P[part],v=spec?.v;
     if(v){R[mid+s][2]=R[root+s][2]+v[0][2]*l1;R[end+s][2]=R[mid+s][2]+v[1][2]*l2;}
    }
    const d=V3.unit(V3.sub(R['wr'+s],R['el'+s]));
    R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
    R['toe'+s][2]=R['an'+s][2]+10;R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);
   }
  }
  R.props=catalogProps(source,J,R);return R;
 };
}
function catalogRef(source,J,R,ref,off){
 const front=source.view==='front',map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]];
 let p;
 if(Array.isArray(ref))p=map(ref);
 else if(ref==='grips')p=V3.add(R.gripL,R.gripR).map(v=>v/2);
 else if(ref==='tf')p=R.hip;
 else{
  const key=front?ref:String(ref).replace(/N$/,'L').replace(/F$/,'R');p=R[key];
  if(!p&&J[ref])p=map(J[ref]);
 }
 if(!p)throw Error('Unknown equipment attachment: '+ref);
 if(off)p=V3.add(p,front?[off[0],off[1],0]:[0,off[1],off[0]]);
 return [...p];
}
function catalogProps(source,J,R){
 const out=[],front=source.view==='front',map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]],ref=(name,off)=>catalogRef(source,J,R,name,off);
 const tone=s=>/mat/.test(s.cls||'')?'mat':/pad/.test(s.cls||'')?'pad':/band/.test(s.cls||'')?'band':/cable/.test(s.cls||'')?'cable':'steel';
 for(const[sidx,s]of (source.props||[]).entries()){
  const before=out.length;
  if(s.k==='rect'){
   if(/mat/.test(s.cls||''))out.push(box3(-75,75,186,187,-5,205,'mat'));
   else if(front){const z=s.h>20?65:80;out.push(box3(s.x-100,s.x+s.w-100,s.y,s.y+s.h,z-(s.h>20?6:15),z+(s.h>20?5:20),tone(s)));}
   else out.push(box3(s.h>50?-45:-16,s.h>50?45:16,s.y,s.y+s.h,s.x,s.x+s.w,tone(s)));
  }else if(s.k==='line'){
   for(let i=1;i<s.pts.length;i++){
    const a=map(s.pts[i-1]),b=map(s.pts[i]),pad=/pad/.test(s.cls||'');
    if(pad)out.push({kind:'panel',a,b,width:front?8:30,thickness:s.w||8,tone:'pad',support:s.support});
    else if(!front&&Math.abs(a[1]-b[1])>25){
     const half=/rail/.test(s.cls||'')?56:13;
     for(const sign of [-1,1])out.push({kind:'line',a:V3.add(a,[1,0,0],sign*half),b:V3.add(b,[1,0,0],sign*half),width:s.w||4,tone:tone(s)});
    }else out.push({kind:'line',a,b,width:s.w||4,tone:tone(s)});
   }
  }else if(s.k==='circle')out.push({kind:'wheel',c:map(s.c),radius:s.r||6,axis:front?[0,0,1]:[1,0,0],tone:tone(s)});
  else if(s.k==='db')out.push({kind:'dumbbell',c:ref(s.at||'gripN',s.off),axis:[1,0,0],optional:s.if});
  else if(s.k==='plate'){
   const c=s.tf?V3.add(V3.add(R.hip,R.u,s.tf[0]),R.n,s.tf[1]):ref(s.at||'grips',s.off);
   out.push({kind:/^grips$/.test(s.at||'grips')?'barbell':'weight',c,axis:[1,0,0],radius:s.r||16,optional:s.if});
  }else if(s.k==='kb'){
   const grip=ref(s.at||'grips'),d=s.down?[0,1,0]:V3.unit(V3.sub(R.handL,R.wrL));
   out.push({kind:'kettlebell',c:V3.add(grip,d,s.dist||11),grip,axis:[1,0,0],radius:8.5,optional:s.if});
  }else if(['cable','band','barcable'].includes(s.k)){
   const a=Array.isArray(s.from)?map(s.from):ref(s.from,s.foff),b=ref(s.k==='barcable'?'grips':s.at,s.off);
   out.push({kind:'line',a,b,width:s.k==='band'?2.2:1.4,tone:s.k==='band'&&!s.cls?'band':'cable',optional:s.if});
   if(s.k!=='band')out.push({kind:'wheel',c:a,radius:4.5,axis:front?[0,0,1]:[1,0,0],tone:'steel'});
   if(s.handle)out.push({kind:'line',a:V3.add(b,[1,0,0],-5),b:V3.add(b,[1,0,0],5),width:2.6,tone:'bar'});
  }else if(s.k==='seg')out.push({kind:'line',a:ref(s.a,s.aoff),b:ref(s.b,s.boff),width:s.w||4,tone:tone(s)});
  else if(s.k==='fbar'){
   const c=V3.add(R.gripL,R.gripR).map(v=>v/2),axis=V3.unit(V3.sub(R.gripR,R.gripL));
   if(s.plates)out.push({kind:'barbell',c,axis});
   else out.push({kind:'line',a:V3.add(R.gripL,axis,-(s.ext||12)),b:V3.add(R.gripR,axis,s.ext||12),width:s.w||3.6,tone:'bar'});
  }else if(s.k==='roller'){
   const p=map(PROPS.roller.geom(s,J));out.push({kind:'roller',c:p,radius:s.r||6.5,axis:[1,0,0],tone:'pad'});
   if(s.pivot)out.push({kind:'line',a:map(s.pivot),b:p,width:3.5,tone:'steel'});
  }else if(s.k==='platform'){
   const p=PROPS.platform.geom(s,J);out.push({kind:'panel',a:map(p[0]),b:map(p[1]),width:65,thickness:5,tone:'steel'});
  }else throw Error('Unmapped equipment kind: '+s.k);
  for(let i=before;i<out.length;i++){out[i].sourceIndex=sidx;if(s.if)out[i].optional=s.if;}
 }
 return out;
}
function catalogProneRig(source){
 return t=>{
  const J=catalogLegacyPose(source,t),R={hip:[0,172,108],sh:[0,172,56],u:[0,0,-1],n:[0,1,0],x:[1,0,0],head:[0,170,41],headU:[0,0,-1],headN:[0,1,0],props:[],contacts:[],basis:'authored'};
  for(const[s,sign]of [['L',-1],['R',1]]){
   R['hip'+s]=[sign*9,172,108];R['sh'+s]=[sign*19,172,59];
   for(const[root,joint,end,l1,l2]of [['sh','el','wr',30,27],['hip','kn','an',43,42]]){
    const jr=root==='sh'?J['sh'+s]:J['hip'+s],m=J[joint+s],e=J[end+s];
    const d1=V3.unit([m[0]-jr[0],0,m[1]-jr[1]]),d2=V3.unit([e[0]-m[0],0,e[1]-m[1]]);
    R[joint+s]=V3.add(R[root+s],d1,l1);R[end+s]=V3.add(R[joint+s],d2,l2);
   }
   const d=V3.unit(V3.sub(R['wr'+s],R['el'+s]));R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
   R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
  }return R;
 };
}
function catalogWidePushRig(source,archer=false){
 return t=>{
  const J=catalogLegacyPose(source,t),R=body3([archer?20*t:0,J.hip[1]+4,J.hip[0]],J.ta),xShift=R.hip[0];
  for(const[s,old,sign]of [['L','N',-1],['R','F',1]]){
   arm3(R,s,[sign*44,182,139],[sign*.6,0,-1],[0,0,1]);
   const ankle=[sign*11,J['an'+old][1],J['an'+old][0]];
   leg3(R,s,ankle,[0,1,-1]);R['heel'+s]=[sign*11,J['heel'+old][1],J['heel'+old][0]];R['toe'+s]=[sign*11,J['toe'+old][1],J['toe'+old][0]];
  }
  R.contacts=[{key:'wrL',kind:'support'},{key:'wrR',kind:'support'},{key:'toeL',kind:'support'},{key:'toeR',kind:'support'}];R.basis='authored';return R;
 };
}
function catalogFlyRig(t){
 const R=body3([0,126,112],-90),angle=(-8+88*t)*D2R;
 for(const[s,sign]of [['L',-1],['R',1]]){
  const wr=V3.add(R['sh'+s],[sign*Math.sin(angle),-Math.cos(angle),0],54);
  arm3(R,s,wr,[sign,0,.2],[0,-1,0]);leg3(R,s,[sign*16,180,166],[0,-1,0]);R.props.push({kind:'dumbbell',c:R['grip'+s]});
 }
 R.props.push(...bench3(28,150,136,15));R.basis='authored';return R;
}
function catalogSharedGripRig(rig,id){
 return t=>{
  const R=rig(t),d=V3.unit(V3.sub(R.gripL,R.wrL)),center=V3.add(R.wrL,R.wrR).map(v=>v/2),root=R.sh;
  const delta=[0,center[1]-root[1],center[2]-root[2]],reach=Math.sqrt((FL.ua+FL.fa-.02)**2-14**2),scale=Math.min(1,reach/(Math.hypot(...delta)||1));
  center[1]=root[1]+delta[1]*scale;center[2]=root[2]+delta[2]*scale;
  for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*5,center[1],center[2]],V3.sub(R['el'+s],R['sh'+s]),d);
  const grip=V3.add(R.gripL,R.gripR).map(v=>v/2);
  for(const p of R.props)if(['kettlebell','dumbbell'].includes(p.kind)){
   if(p.kind==='kettlebell'){const direction=id==='goblet'?[0,1,0]:d;p.grip=grip;p.c=V3.add(grip,direction,id==='goblet'?9:11);}
   else p.c=[...grip];
  }
  R.sharedGrip=grip;R.basis='authored';return R;
 };
}
function catalogBenchRig(t){
 const R=benchRig(t),bar=[...R.bar];
 // The thicker torso has a 12.5 cm anterior contour; the shaft touches its surface.
 bar[1]-=3.9*t;
 for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*34,bar[1]+3.5,bar[2]],[sign*.8,.6,.45],[0,-1,0]);
 R.bar=bar;R.props=R.props.slice(0,5).concat({kind:'barbell',c:bar});return R;
}
const CATALOG_SOURCES=new Map();
for(const ex of EX){
 const source=catalogSource(ex);CATALOG_SOURCES.set(ex.id,source);
 let rig=source.rig3d||catalogPlanarRig(ex,source);
 if(['ytw','reversesnow'].includes(ex.id))rig=catalogProneRig(source);
 if(['widepush','archer'].includes(ex.id))rig=catalogWidePushRig(CATALOG_SOURCES.get('pushup'),ex.id==='archer');
 if(ex.id==='dbfly')rig=catalogFlyRig;
 if(ex.id==='bbbench')rig=catalogBenchRig;
 if(['kbswing','goblet'].includes(ex.id))rig=catalogSharedGripRig(rig,ex.id);
 ex.anim.catalogRig=t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const R=rig(t);R.x??=V3.unit(V3.cross(R.n,R.u));R.basis??=source.rig3d?'authored':'reconstructed';
  if(ex.id==='bbbench'){
   const z=R.sh[2]-16,y=R.sh[1]-58;
   for(const sign of [-1,1])R.props.push({kind:'line',a:[sign*56,186,z],b:[sign*56,y-10,z],width:5,tone:'steel'},box3(sign*56-5,sign*56+5,180,186,z-18,z+18,'steel'),{kind:'line',a:[sign*56,y,z],b:[sign*56,y,z+12],width:4,tone:'bar'});
  }
  if(ex.id==='inclinebb')for(const pad of R.props.filter(p=>p.kind==='panel'&&p.tone==='pad')){
   pad.a=V3.add(pad.a,R.n,-1.5);pad.b=V3.add(V3.add(pad.b,R.n,-1.5),R.u,15);
  }
  return R;
 };
 ex.anim.catalogCameras=[...CATALOG_CAMERAS];
 ex.anim.catalogId=ex.id;
}

/* Anatomical parts and teaching regions are deliberately distinct. Deep muscles
   have an entry but no patch painted on top of the skin. Colour curves are authored
   illustrations; identical head profiles do not pretend to measure head-specific EMG. */
const MUSCLE_REGIONS={
 chest:[['pec_clavicular','Ключичная часть грудной','anatomical'],['pec_sternal','Средняя область грудной','teaching'],['pec_costal','Нижняя область грудной','teaching']],
 triceps:[['tri_long','Длинная головка трицепса','anatomical'],['tri_lateral','Латеральная головка трицепса','anatomical'],['tri_medial','Медиальная головка трицепса · глубже','deep']],
 biceps:[['bi_long','Длинная головка бицепса','anatomical'],['bi_short','Короткая головка бицепса','anatomical']],
 delt_f:[['delt_f','Передняя часть дельтовидной','anatomical']],delt_s:[['delt_s','Средняя часть дельтовидной','anatomical']],delt_r:[['delt_r','Задняя часть дельтовидной','anatomical']],
 quads:[['quad_rectus','Прямая мышца бедра','anatomical'],['quad_lateral','Латеральная широкая мышца','anatomical'],['quad_medial','Медиальная широкая мышца','anatomical'],['quad_deep','Промежуточная широкая · глубже','deep']],
 hams:[['ham_lateral','Двуглавая мышца бедра','anatomical'],['ham_medial','Медиальная область заднего бедра','teaching']],
 calves:[['calf_medial','Медиальная головка икроножной','anatomical'],['calf_lateral','Латеральная головка икроножной','anatomical'],['soleus','Камбаловидная · глубже','deep']],
 glutes:[['glute_max','Большая ягодичная','anatomical'],['glute_lateral','Боковая ягодичная область','teaching']],
 traps:[['trap_upper','Верхняя область трапециевидной','teaching'],['trap_mid','Средняя область трапециевидной','teaching']],
 lats:[['lats','Широчайшие · общий профиль','group']],midback:[['midback','Межлопаточная область · общий профиль','group']],
 lowback:[['lowback','Разгибатели спины · общий профиль','group']],abs:[['abs','Прямая мышца живота','anatomical']],
 obliques:[['obliques','Косые мышцы живота · общий профиль','group']],forearms:[['forearms','Мышцы предплечья · общий профиль','group']]
};
const REGION_META=Object.fromEntries(Object.entries(MUSCLE_REGIONS).flatMap(([parent,rows])=>rows.map(([id,label,kind])=>[id,{id,parent,label,kind,visible:kind!=='deep'}])));
const REGION_ANATOMY_SOURCES=[['Анатомия мышц плечевого пояса — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'],['Анатомия мышц ног — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs']];
function motionProfile(anim){return anim.catalogProfile||anim.muscleProfile;}
const INCLINE_CHEST=new Set(['dbincline','smithincline','inclinebb','declinepush','cablelowfly']);
const LOWER_CHEST=new Set(['declinebb','dip','assistdip']);
const CATALOG_LATERALITY={dbrow:{upper:'L'},cablelat:{upper:'R'},concentration:{upper:'L'},kickback:{upper:'L'},archer:{upper:'R'},bulgarian:{lower:'L'},stepup:{lower:'L'},lunge:{lower:'L'},revlunge:{lower:'L'},sidelunge:{lower:'R'},pistolbox:{lower:'L'},sllift:{lower:'L'},glutebridge1:{lower:'L'},glutekick:{lower:'L'},calf1:{lower:'L'}};
function catalogSideValues(profile,values){
 const sides={L:{...values},R:{...values}},lower=new Set(['quads','hams','calves','glutes']);
 for(const[part,active]of Object.entries(profile.laterality||{}))for(const[id,r]of Object.entries(profile.regions)){
  const applies=part==='lower'?lower.has(r.parent):!lower.has(r.parent)&&!['abs','obliques','lowback','traps'].includes(r.parent);
  if(applies)sides[active==='L'?'R':'L'][id]=.28;
 }return sides;
}
for(const ex of EX){
 const base=ex.anim.muscleProfile,hold=ex.anim.hold,cyclic=ex.g==='cardio'||!!ex.kind,muscles=base?JSON.parse(JSON.stringify(base.muscles)):{};
 for(const[id,role]of [...ex.pri.map(id=>[id,'primary']),...ex.sec.filter(id=>!ex.pri.includes(id)).map(id=>[id,'support'])])if(!muscles[id]){
  const stabilizer=['abs','obliques','lowback','forearms'].includes(id)&&role!=='primary';
  const start=role==='primary'?.42:.30,end=role==='primary'?.62:.44;
  const c=hold?[.58,.58,.58]:stabilizer?[.34,.37,.34]:[start,role==='primary'?.83:.60,end];
  muscles[id]={role:stabilizer?'stabilizer':role,concentric:c,eccentric:hold?[...c]:stabilizer?[...c]:[start,role==='primary'?.62:.46,end]};
 }
 const regions={};
 for(const[parent,m]of Object.entries(muscles))for(const[id,label,kind]of MUSCLE_REGIONS[parent]){
  let factor=1;
  if(parent==='chest')factor=INCLINE_CHEST.has(ex.id)?{pec_clavicular:1,pec_sternal:.80,pec_costal:.68}[id]:LOWER_CHEST.has(ex.id)?{pec_clavicular:.70,pec_sternal:.90,pec_costal:1}[id]:{pec_clavicular:.80,pec_sternal:1,pec_costal:.88}[id];
  regions[id]={parent,label,kind,role:m.role,factor,visible:kind!=='deep',profileBasis:parent==='chest'?'illustrative-regional':'shared-group'};
 }
 const names=ex.pri.map(id=>MUSCLE_NAMES[id]).join(', ');
 const notes=base?base.notes:{concentric:hold?'Удержание: мышцы сохраняют положение.':cyclic?'Циклическое движение: цвет показывает учебное распределение акцентов.':names+' участвуют в рабочей фазе.',eccentric:cyclic?'Продолжение цикла: вовлечённость меняется плавно.':'Мышцы контролируют возврат.',end:'Конечная точка: сохраняйте контроль и опору.',start:'Исходное положение: подготовьтесь к следующему повторению.'};
 ex.anim.catalogProfile={curveBasis:'illustrative',muscles,regions,notes,pair:ex.pri.some(id=>['lats','midback','lowback','glutes','hams','traps'].includes(id))?'back':'above',sources:[...(base?.sources||[]),...REGION_ANATOMY_SOURCES],cyclic,hold,laterality:CATALOG_LATERALITY[ex.id]};
}
const CATALOG_LIMB_PROFILES={ua:[[0,5.4,5.5],[.18,7.2,6.8],[.45,6.8,6.4],[.78,5.2,4.7],[1,4.2,4]],fa:[[0,4.4,4.4],[.22,5.7,5.2],[.45,4.9,4.7],[.76,3.5,3.3],[1,2.6,2.7]],th:[[0,9.1,9],[.25,8.8,8.2],[.6,7.1,6.5],[1,5.2,5]],sh:[[0,5,5],[.27,5.7,5.7],[.57,4.4,4],[1,2.8,3]]};
function catalogLimbRadius(kind,t){
 const p=CATALOG_LIMB_PROFILES[kind];for(let i=1;i<p.length;i++)if(t<=p[i][0]){const a=p[i-1],b=p[i],q=(t-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];}return p.at(-1).slice(1);
}
function catalogLimbFrame(R,a,b,front=R.n){
 const z=V3.unit(V3.sub(b,a));let x=V3.sub(front,z.map(v=>v*V3.dot(front,z)));
 if(Math.hypot(...x)<1e-5)x=V3.cross(z,Math.abs(z[0])<.8?[1,0,0]:[0,0,1]);x=V3.unit(x);return{x,y:V3.unit(V3.cross(z,x)),z};
}
function catalogLimbPoint(R,a,b,kind,t,angle,extra=0){
 const f=catalogLimbFrame(R,a,b),[r1,r2]=catalogLimbRadius(kind,t),c=V3.add(a,V3.sub(b,a),t);
 return V3.add(V3.add(c,f.x,(r1+extra)*Math.cos(angle)),f.y,(r2+extra)*Math.sin(angle));
}
function catalogMuscleSurfaces(R,profile,{coarse=false}={}){
 const faces=[],limbRows=coarse?5:10,limbCols=coarse?8:16,torsoCols=coarse?12:24;
 function clip(poly,key,bound,greater){
  const result=[];for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],inside=v=>greater?v[key]>=bound-1e-10:v[key]<=bound+1e-10,ia=inside(a),ib=inside(b);
   if(ia)result.push(a);
   if(ia!==ib){const t=(bound-a[key])/(b[key]-a[key]);result.push({h:a.h+(b.h-a.h)*t,a:a.a+(b.a-a.a)*t,p:V3.add(a.p,V3.sub(b.p,a.p),t)});}
  }return result;
 }
 function patch(id,side,lo,hi,a0,a1,point){
  if(!profile.regions[id]?.visible)return;
  const heights=point.torso?CATALOG_RINGS.map(r=>r[0]):Array.from({length:limbRows+1},(_,i)=>i/limbRows),step=2*Math.PI/(point.torso?torsoCols:limbCols);
  for(let r=1;r<heights.length;r++)if(heights[r]>=lo&&heights[r-1]<=hi)for(let c=Math.floor(a0/step);c<Math.ceil(a1/step);c++){
   const corners=[[heights[r-1],c*step],[heights[r-1],(c+1)*step],[heights[r],c*step],[heights[r],(c+1)*step]].map(([h,a])=>({h,a,p:point(h,a)}));
   for(const ix of point.angleSign<0?[[0,1,3],[0,3,2]]:[[0,1,2],[1,3,2]]){
    let poly=ix.map(i=>corners[i]);const normal=V3.unit(V3.cross(V3.sub(poly[1].p,poly[0].p),V3.sub(poly[2].p,poly[0].p))).map(v=>v*(point.normalSign||1));
    for(const[key,bound,greater]of [['h',lo,true],['h',hi,false],['a',a0,true],['a',a1,false]]){poly=clip(poly,key,bound,greater);if(poly.length<3)break;}
    for(let i=1;i<poly.length-1;i++){
     const tri=[poly[0].p,poly[i].p,poly[i+1].p];if(Math.hypot(...V3.cross(V3.sub(tri[1],tri[0]),V3.sub(tri[2],tri[0])))<1e-8)continue;
     const points=tri.map(p=>V3.add(p,normal,.15));points.push(points[2]);faces.push({id,parent:profile.regions[id].parent,side,points,normal});
    }
   }
  }
 }
 for(const[side,sign]of [['L',-1],['R',1]]){
  const torso=(h,a)=>catalogTorsoPoint(R,h,sign*a);
  torso.normalSign=-sign;torso.angleSign=sign;torso.torso=true;
  for(const[id,lo,hi,a,b]of [['pec_clavicular',42,48,.08,1.08],['pec_sternal',33,41,.08,1.2],['pec_costal',27,32,.10,1.0],['abs',12,26,.05,.53],['obliques',10,29,.56,1.34],['lats',11,38,1.55,2.65],['midback',33,47,2.66,3.08],['lowback',11,30,2.72,3.08],['glute_max',0,9,1.64,3.04],['glute_lateral',2,10,1.13,1.63],['trap_upper',43,51,2.20,3.07],['trap_mid',38,43,2.31,2.66]])patch(id,side,lo,hi,a,b,torso);
  const limb=(root,end,kind)=>{
   const f=catalogLimbFrame(R,R[root+side],R[end+side]),outward=V3.dot(f.y,R.x)*sign,orientation=Math.abs(outward)>.001?Math.sign(outward):sign;
   const point=(t,a)=>catalogLimbPoint(R,R[root+side],R[end+side],kind,t,a*orientation);point.normalSign=orientation;point.angleSign=orientation;return point;
  };
  for(const[id,lo,hi,a,b]of [['delt_f',.02,.30,-.70,.70],['delt_s',.02,.32,.73,1.76],['delt_r',.02,.30,1.80,2.75],['bi_long',.33,.84,.04,.80],['bi_short',.33,.84,-.80,-.04],['tri_long',.28,.86,2.46,3.91],['tri_lateral',.27,.85,1.68,2.42]])patch(id,side,lo,hi,a,b,limb('sh','el','ua'));
  patch('forearms',side,.15,.78,-1.25,1.25,limb('el','wr','fa'));
  for(const[id,lo,hi,a,b]of [['quad_rectus',.15,.80,-.44,.44],['quad_lateral',.12,.82,.48,1.48],['quad_medial',.44,.91,-1.38,-.48],['ham_lateral',.16,.82,1.67,2.71],['ham_medial',.18,.84,2.77,4.45]])patch(id,side,lo,hi,a,b,limb('hip','kn','th'));
  patch('calf_lateral',side,.12,.59,2.08,3.12,limb('kn','an','sh'));patch('calf_medial',side,.12,.59,3.18,4.21,limb('kn','an','sh'));
 }
 return faces;
}
function catalogFigureAnim(anim){
 return {...anim,rig3d:anim.catalogRig,muscleProfile:anim.catalogProfile,camera:'above',cameras:anim.catalogCameras,sample:t=>({spatialT:t}),catalogRig:null};
}
function catalogVolumeData(anim,t,index,has,coarse=false){
 const R=anim.catalogRig(t),state=muscleFrame(anim,t,index),profile=motionProfile(anim);
 return{exerciseId:anim.catalogId,pose:R,surfaces:catalogMuscleSurfaces(R,profile,{coarse}),values:state.values,sideValues:catalogSideValues(profile,state.values),regions:profile.regions,props:R.props.filter(s=>!s.optional||!has||has(s.optional)),torsoRings:CATALOG_RINGS,limbProfiles:CATALOG_LIMB_PROFILES};
}

function catalogVectors(anim){
 if(anim.hold||(anim.keys?.length>2&&!anim.vectors))return[];
 const a=anim.catalogRig(anim.eccFirst?1:0),b=anim.catalogRig(anim.eccFirst?0:1),out=[];
 for(const key of ['sh','hip','elL','elR','gripL','gripR','knL','knR','anL','anR']){
  const delta=V3.sub(b[key],a[key]);if(Math.hypot(...delta)>10)out.push({a:a[key],b:b[key],key});
 }return out;
}
function createMotionFigure(anim,opts){
 if(!window.GymVolume||!anim.catalogRig)return buildFigure(anim,opts);
 let f=window.GymVolume.create({...opts,data:(t,index,coarse)=>catalogVolumeData(anim,t,index,opts.has,coarse),color:muscleColor,joints:motionPrefs.joints,
  trace:Array.from({length:41},(_,i)=>anim.catalogRig(i/40).gripL),vectors:catalogVectors(anim)});
 if(!f){
  f=buildFigure(anim,opts);const svg=f.svg,root=document.createElement('div');root.className='volume-figure';root.setAttribute('role','img');root.setAttribute('aria-label',opts.label);root.dataset.renderer='svg';root.dataset.camera=opts.camera||'above';root.append(svg);f.svg=root;
  const at=f.at;f.at=(t,frame)=>{at(t,frame);root.dataset.pose=String(t);root.dataset.phase=String(frame?.index||0);};
  const setJoints=show=>svg.classList.toggle('show-joints',!!show);f.setJoints=setJoints;setJoints(motionPrefs.joints);f.at(opts.t||0);
 }
 f.setTrace(motionPrefs.trace);f.setVectors(motionPrefs.vectors);return f;
}
function disposeMotion(F){F?.f?.dispose?.();F?.extra?.dispose?.();}
function selectMuscleRegion(prefix,id){
 const F=prefix==='mv'?detailMotion:workout?.motion;if(!F)return;
 const p=motionProfile(F.it.ex.anim);if(id!=='all'&&!p.regions[id]?.visible)return;
 motionPrefs.regions={...motionPrefs.regions,[F.it.ex.id]:id};saveMotionPrefs();
 for(const f of [F.f,F.extra].filter(Boolean))f.setRegion?.(id);
}

/* ---------- прогрессии: от лёгкого к тяжёлому ---------- */
const PROGRESSIONS = [
  ['wallpush', 'inclinepush', 'kneepush', 'pushup', 'diamond', 'archer'],
  ['pikepush', 'declinepike'],
  ['towelrow', 'tablerow', 'invrow', 'pullup'],
  ['superman', 'ytw', 'reversesnow'],
  ['airsquat', 'lunge', 'revlunge', 'bulgarian', 'pistolbox'],
  ['bridge', 'glutebridge1', 'hipthrust'],
  ['sllift', 'nordic'],
  ['calfraise', 'calf1'],
  ['deadbug', 'birddog', 'plank', 'plankup', 'hollow'],
  ['crunch', 'bicycle', 'lyinglegraise', 'hangknee', 'legraise'],
  ['chairdip', 'benchdip', 'dip'],
  ['hang', 'chinup', 'pullup']
];
const PROG_NEXT = {}, PROG_PREV = {}, PROG_CHAIN = {};
PROGRESSIONS.forEach((chain, ci) => chain.forEach(id => { PROG_CHAIN[id] = ci; }));
for (const chain of PROGRESSIONS) chain.forEach((id, i) => { if (chain[i + 1]) PROG_NEXT[id] = chain[i + 1]; if (i) PROG_PREV[id] = chain[i - 1]; });
/* подсказка перехода: если дважды подряд все подходы на верхней границе без отягощения — следующий уровень */
function progressionHint(it) {
  const ex = it.ex;
  if (ex.kind || loadType(ex) === 'kg') return '';
  const past = pastSessions(ex.id);
  const [lo, hi] = parseRange(it.rx.reps);
  const topTwice = past.length >= 2 && past.slice(-2).every(s => { const sets = s.s.filter(Boolean); return sets.length && sets.every(x => x[1] >= hi && !(x[0] > 0)); });
  const nextId = PROG_NEXT[ex.id], prevId = PROG_PREV[ex.id];
  const lowTwice = past.length >= 2 && past.slice(-2).every(s => { const sets = s.s.filter(Boolean); return sets.length && sets.some(x => x[1] < lo); });
  if (topTwice && nextId && EXI[nextId]) return `<p class="prog prog-up"><b>↑</b><span>Две тренировки подряд на верхней границе. Следующая ступень: <button type="button" class="lk" data-prog="${nextId}">${esc(EXI[nextId].name)}</button>.</span></p>`;
  if (lowTwice && prevId && EXI[prevId]) return `<p class="prog prog-down"><b>↓</b><span>Дважды не дотянули до ${lo} повторов. Ступень легче: <button type="button" class="lk" data-prog="${prevId}">${esc(EXI[prevId].name)}</button>.</span></p>`;
  if (nextId || prevId) return `<p class="prog"><span>Ступени: ${prevId ? `<button type="button" class="lk" data-prog="${prevId}">легче</button>` : ''}${prevId && nextId ? ' · ' : ''}${nextId ? `<button type="button" class="lk" data-prog="${nextId}">тяжелее</button>` : ''}</span></p>`;
  return '';
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-prog]'); if (!t) return;
  const card = t.closest('.card'); if (!card || !plan) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex); if (!it) return;
  const target = EXI[t.dataset.prog]; if (!target) return;
  const E = plan.E; if (!available(target, E)) { t.textContent = 'нет оборудования'; return; }
  if (plan.items.some(x => x.ex.id === target.id)) { t.textContent = 'уже в плане'; return; }
  const k = swapKey(); swaps[k] = swaps[k] || {}; swaps[k][it.slot] = target.id; done = {}; renderPlan();
  const c2 = document.querySelector(`.card[data-slot="${it.slot}"]`); if (c2) { c2.classList.add('flash'); c2.scrollIntoView({block:'nearest'}); }
});


/* ===================== ПЛАНИРОВЩИК ===================== */
const GOALS = {
  strength:{name:'Сила', hint:'3–6 повт.', reps:{c:'3–5', i:'6–8'}, sets:{c:5, i:3}, rest:{c:180, i:90}, tempo:'2-0-X-0',
    load:{c:'≈ 80–90% от 1ПМ, 1–2 повтора в запасе', i:'тяжело, 1–2 повтора в запасе'}, rep:3, time:'20–30 с', dist:'20 м',
    circ:{rounds:4, reps:'6–8', work:20, rest:30, roundRest:180}, ss:{rest:150}},
  mass:{name:'Масса', hint:'6–12 повт.', reps:{c:'6–10', i:'10–12'}, sets:{c:4, i:3}, rest:{c:120, i:75}, tempo:'3-0-1-0',
    load:{c:'≈ 70–80% от 1ПМ, 1–2 повтора в запасе', i:'1–2 повтора в запасе'}, rep:4, time:'30–45 с', dist:'30 м',
    circ:{rounds:3, reps:'10–12', work:30, rest:20, roundRest:120}, ss:{rest:90}},
  cut:{name:'Рельеф', hint:'12–20 повт.', reps:{c:'12–15', i:'15–20'}, sets:{c:3, i:3}, rest:{c:60, i:40}, tempo:'2-0-1-0',
    load:{c:'≈ 55–65% от 1ПМ, почти до отказа', i:'до выраженного жжения'}, rep:3, time:'45–60 с', dist:'40 м',
    circ:{rounds:4, reps:'15–20', work:40, rest:15, roundRest:90}, ss:{rest:60}}
};
const FORMATS = {classic:{name:'Классика', hint:'по подходам'}, superset:{name:'Суперсеты', hint:'пары без отдыха'}, circuit:{name:'Круговая', hint:'круги подряд'}};
const LEVELS = {beg:{name:'Новичок'}, mid:{name:'Средний'}, adv:{name:'Опытный'}};
const GROUP_W = {chest:1.3, back:1.5, shoulders:1, biceps:0.8, triceps:0.8, forearms:0.5, abs:0.8, glutes:1, quads:1.3, hams:1, calves:0.6, cardio:0.9};
const GROUP_ORDER = {quads:0, glutes:0, hams:1, back:2, chest:3, shoulders:4, triceps:5, biceps:5, forearms:6, calves:7, cardio:7.5, abs:8};
const REGION = {quads:'low', glutes:'low', hams:'low', calves:'low', chest:'push', shoulders:'push', triceps:'push', back:'pull', biceps:'pull', forearms:'pull', abs:'core', cardio:'cardio'};
const ANTAGONIST = {chest:'back', back:'chest', biceps:'triceps', triceps:'biceps', quads:'hams', hams:'quads', shoulders:'back', glutes:'abs', abs:'glutes'};
const PATTERN = {};
[['squat', 'squat goblet airsquat smithsquat legpress'], ['hinge', 'deadlift rdl kbswing hyper goodmorning sllift nordic'],
 ['hpush', 'pushup bbbench dbbench dip diamond closegrip wallpush inclinepush kneepush widepush archer'], ['ipush', 'dbincline smithincline inclinebb'], ['dpush', 'declinebb declinepush'],
 ['fly', 'dbfly cablefly pecdeck'], ['pullover', 'pullover straightpull'], ['vpull', 'pullup chinup latpull'], ['hrow', 'bbrow dbrow cablerow bandrow invrow towelrow tablerow'],
 ['vpush', 'dbpress ohp pikepush arnold declinepike'], ['raise', 'latraise bandlatraise cablelat'], ['rear', 'facepull bandfacepull reversefly ytw reversesnow superman'],
 ['curl', 'bbcurl dbcurl hammer cablecurl bandcurl preacher inclinecurl concentration towelcurl'], ['ext', 'skull pushdown bandpushdown ohext benchdip kickback chairdip'],
 ['lunge', 'lunge bulgarian stepup revlunge sidelunge pistolbox'], ['bridge', 'hipthrust bridge glutekick glutebridge1'], ['flex', 'crunch cablecrunch lyinglegraise legraise declinecrunch captainraise hangknee bicycle'],
 ['hold', 'plank sideplank rollout hollow plankup deadbug birddog wallsit'], ['side', 'sidebend'], ['calf', 'calfraise lpcalf calf1'], ['grip', 'farmer hang wristcurl'],
 ['jump', 'jumpingjack jumpsquat'], ['burpee', 'burpee thruster'], ['climb', 'mountain'],
 /* тренажёры и кардио (04b) */
 ['squat', 'hacksquat'], ['hpush', 'chestpressm smithbench assistdip'], ['fly', 'cablelowfly'], ['hrow', 'leverrowm tbarrow chestrowdb'], ['vpull', 'assistpull'], ['vpush', 'shoulderpressm smithohp'],
 ['ext', 'cableohext'], ['side', 'cablewood'], ['hinge', 'pullthrough'], ['bridge', 'cablekickback abduction'], ['adduct', 'adduction'], ['calf', 'seatedcalf standcalf'],
 ['run', 'treadmill stairs'], ['ride', 'bike elliptical'], ['row', 'rower']].forEach(([p, ids]) => ids.split(' ').forEach(id => PATTERN[id] = p));
/* желательность упражнения при равных условиях: вспомогательные и упрощённые варианты ниже */
const EX_W = {wallpush:0.5, kneepush:0.7, inclinepush:0.8, towelcurl:0.6, towelrow:0.75, tablerow:0.8, chairdip:0.75, wallsit:0.7, superman:0.8, bicycle:0.9, deadbug:0.85, birddog:0.85, sidelunge:0.85, revlunge:0.9, calf1:0.9, sidebend:0.8, concentration:0.85, kickback:0.85, declinepush:0.9, goodmorning:0.8, jumpingjack:0.9, hangknee:0.95, shrug:0.55, hyper:0.75, frontraise:0.75, wristcurl:0.6, hang:0.65, farmer:0.8, lpcalf:0.9, pikepush:0.8, benchdip:0.85, bandlatraise:0.9,
  bridge:0.85, airsquat:0.8, lyinglegraise:0.9, sideplank:0.9, stepup:0.9, smithsquat:0.85, smithincline:0.9, diamond:0.85, bandcurl:0.9, bandpushdown:0.9, bandrow:0.95};
const EXI = Object.fromEntries(EX.map(e => [e.id, e]));
const EQN = Object.fromEntries(EQUIP.map(e => [e.id, e.name]));
const GN = Object.fromEntries(GROUPS.map(g => [g.id, g.name]));

function effEquip(list) { const E = new Set(list); for (const id of list) for (const x of EQUIP_IMPLIES[id] || []) E.add(x); return E; }
/* как назвать оборудование в карточке: если горизонтальная скамья «получена» из регулируемой — так и пишем */
function eqName(id) {
  if (S.equip.includes(id)) return EQN[id];
  for (const [src, list] of Object.entries(EQUIP_IMPLIES)) if (list.includes(id) && S.equip.includes(src)) return EQN[src];
  return EQN[id];
}
/* ---------- недельная программа ---------- */
const MODES = {single:{name:'Тренировку', hint:'на один день'}, program:{name:'Программу', hint:'на неделю'}};
const DAY_T = {
  fa:{name:'Всё тело', g:['quads', 'chest', 'back', 'shoulders', 'biceps', 'abs']},
  fb:{name:'Всё тело', g:['hams', 'glutes', 'back', 'chest', 'triceps', 'abs']},
  fc:{name:'Всё тело', g:['quads', 'glutes', 'back', 'shoulders', 'chest', 'calves']},
  up:{name:'Верх', g:['chest', 'back', 'shoulders', 'biceps', 'triceps']},
  lo:{name:'Низ', g:['quads', 'hams', 'glutes', 'calves', 'abs']},
  push:{name:'Жим', g:['chest', 'shoulders', 'triceps']},
  pull:{name:'Тяга', g:['back', 'biceps', 'forearms']},
  legs:{name:'Ноги', g:['quads', 'hams', 'glutes', 'calves', 'abs']}
};
const SPLITS = {
  full:{name:'Всё тело', hint:'всё за раз', note:'Каждая тренировка нагружает всё тело, упражнения меняются от дня ко дню. Лучший вариант для новичков и при 2–3 тренировках.',
    days:{2:['fa', 'fb'], 3:['fa', 'fb', 'fc'], 4:['fa', 'fb', 'fc', 'fa']}},
  ul:{name:'Верх / низ', hint:'чередование', note:'Дни верха и низа чередуются, каждая мышца работает дважды в неделю.',
    days:{2:['up', 'lo'], 4:['up', 'lo', 'up', 'lo'], 5:['up', 'lo', 'up', 'lo', 'fa']}},
  ppl:{name:'Жим / тяга / ноги', hint:'три направления', note:'Толкающие мышцы, тянущие мышцы и ноги — в разные дни. При 5 тренировках добавляются дни верха и низа.',
    days:{3:['push', 'pull', 'legs'], 5:['push', 'pull', 'legs', 'up', 'lo']}}
};
const DEFAULT_SPLIT = {2:'full', 3:'full', 4:'ul', 5:'ppl'};
const SCHEDULE = {2:[0, 3], 3:[0, 2, 4], 4:[0, 1, 3, 4], 5:[0, 1, 2, 4, 5]};
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WD_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
/* мезоцикл: 4 недели с ростом нагрузки и разгрузкой */
const WEEKS = [
  {name:'Вход', rir:3, add:0, pct:{strength:'≈ 75–80%', mass:'≈ 65–70%', cut:'≈ 55–60%'},
    note:'Подберите рабочие веса так, чтобы в каждом подходе оставалось 3 повтора в запасе. Записывайте вес и повторы: от них строится прогресс следующих недель.'},
  {name:'Нагрузка', rir:2, add:1, pct:{strength:'≈ 80–85%', mass:'≈ 70–75%', cut:'≈ 60–65%'},
    note:'В базовых упражнениях добавляется подход. Вес увеличивайте по правилу двойной прогрессии, запас — 2 повтора.'},
  {name:'Пик', rir:1, add:1, pct:{strength:'≈ 85–90%', mass:'≈ 75–80%', cut:'≈ 65–70%'},
    note:'Самая тяжёлая неделя цикла: 1 повтор в запасе, техника без срывов. Если сон и самочувствие плохие, оставайтесь на нагрузке второй недели.'},
  {name:'Разгрузка', rir:4, deload:true, pct:{strength:'≈ 65–70%', mass:'≈ 55–60%', cut:'≈ 50–55%'},
    note:'Подходов примерно на 40% меньше, вес на 10–15% ниже. Это восстановление перед новым циклом, а не пропуск: мышцы растут, когда успевают восстановиться.'}
];

const DEFAULTS = {goal:'mass', format:'classic', level:'mid', count:6, groups:['chest', 'back', 'shoulders'], equip:EQUIP.map(e => e.id), seed:7,
  mode:'single', days:3, split:'full', week:1, day:0, view:'plan'};
const STORE = 'podhod.settings.v1';
function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.groups && s.equip) return Object.assign({}, DEFAULTS, s); } catch (e) {}
  return Object.assign({}, DEFAULTS);
}
function saveSettings() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

const S = loadSettings();
let swaps = {};
let eqOpen = false;
let done = {};
let plan = null, prog = null;

/* ---------- утилиты ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const fmtRest = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} мин ${s % 60} с` : `${s / 60} мин`) : `${s} с`;
const midOf = r => { const m = String(r).match(/(\d+)\D+(\d+)/); if (m) return (+m[1] + +m[2]) / 2; const n = parseFloat(r); return isNaN(n) ? 10 : n; };
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; }
const fmtNum = v => Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');

function available(ex, E) { return ex.eq.every(grp => grp.some(id => E.has(id))); }
function chosenEquip(ex, E) {
  const ch = [];
  for (const grp of ex.eq) { const f = grp.find(id => E.has(id)); if (f) ch.push(f); }
  return ch;
}
function exName(ex, E) {
  if (ex.nameV) for (const id of chosenEquip(ex, E)) if (ex.nameV[id]) return ex.nameV[id];
  return ex.name;
}
function propHas(ex, E) {
  const ch = new Set(chosenEquip(ex, E));
  return id => ch.has(id) || ((ex.opt || []).includes(id) && E.has(id));
}
function equipLine(ex, E) {
  const ch = [...new Set(chosenEquip(ex, E).map(eqName))];
  const opt = (ex.opt || []).filter(id => E.has(id)).map(id => eqName(id).toLowerCase() + ' по желанию');
  if (!ch.length) return ['Без снаряжения'].concat(opt).join(' · ');
  return ch.concat(opt).join(' · ');
}
function groupsOf(ex) { const s = new Set([ex.g]); for (const m of ex.pri) s.add(MUSCLE_GROUP[m]); return s; }
function splitFor(days) { return SPLITS[S.split] && SPLITS[S.split].days[days] ? S.split : DEFAULT_SPLIT[days]; }

/* ---------- подбор ---------- */
function pickExercises(E, rand, groups, count, avoid) {
  const G = new Set(groups);
  const lvlMax = S.level === 'beg' ? 2 : 3;
  const pool = EX.filter(ex => available(ex, E) && ex.lvl <= lvlMax && (ex.g !== 'cardio' || G.has('cardio')));
  const totalW = groups.reduce((a, g) => a + GROUP_W[g], 0) || 1;
  const quota = {};
  for (const g of groups) quota[g] = count * GROUP_W[g] / totalW;
  const picked = [];
  const usedPat = {};
  const compBonus = {strength:0.7, mass:0.35, cut:0.05}[S.goal];
  const jitter = pool.map(() => rand());
  while (picked.length < count) {
    let best = null, bestScore = -1e9;
    pool.forEach((ex, i) => {
      if (picked.includes(ex)) return;
      const gs = groupsOf(ex);
      let gain = 0;
      if (G.has(ex.g)) gain += Math.max(quota[ex.g], 0) * 1.6 + 0.4;
      for (const g of gs) if (g !== ex.g && G.has(g)) gain += Math.max(quota[g], 0) * 0.5;
      if (gain <= 0) return;
      let sc = gain + (ex.type === 'c' ? compBonus : 0) + jitter[i] * 0.5 + ((EX_W[ex.id] ?? 1) - 1) * 1.4;
      if (ex.eq.length) sc += 0.25;
      if (S.goal === 'strength' && ex.eq.some(g => g.includes('bb'))) sc += 0.3;
      for (const m of ex.pri) if (!G.has(MUSCLE_GROUP[m])) sc -= 0.3;
      const pat = PATTERN[ex.id] || 'solo:' + ex.id;
      if (usedPat[pat]) sc -= 0.7 * usedPat[pat] + (picked.some(p => PATTERN[p.id] === pat && p.g === ex.g) ? 0.4 : 0);
      if (!G.has(ex.g)) sc -= 0.6;
      if (avoid && avoid.has(ex.id)) sc -= 1.1;
      if (typeof PROG_CHAIN !== 'undefined' && PROG_CHAIN[ex.id] !== undefined && picked.some(p => PROG_CHAIN[p.id] === PROG_CHAIN[ex.id])) sc -= 1.5;
      if (sc > bestScore) { bestScore = sc; best = ex; }
    });
    if (!best) break;
    picked.push(best);
    const bp = PATTERN[best.id] || 'solo:' + best.id; usedPat[bp] = (usedPat[bp] || 0) + 1;
    if (quota[best.g] !== undefined) quota[best.g] -= 1;
    for (const g of groupsOf(best)) if (g !== best.g && quota[g] !== undefined) quota[g] -= 0.45;
  }
  return {picked, pool};
}
function orderClassic(list) {
  return list.slice().sort((a, b) => {
    const ca = a.g === 'abs' ? 1 : 0, cb = b.g === 'abs' ? 1 : 0;
    if (ca !== cb) return ca - cb;
    const ta = a.type === 'c' ? 0 : 1, tb = b.type === 'c' ? 0 : 1;
    if (ta !== tb) return ta - tb;
    return GROUP_ORDER[a.g] - GROUP_ORDER[b.g];
  });
}
function pairSupersets(list) {
  const rest = orderClassic(list);
  const pairs = [];
  while (rest.length) {
    const a = rest.shift();
    if (!rest.length) { pairs.push([a]); break; }
    let bi = 0, bs = -1e9;
    rest.forEach((b, i) => {
      let s = 0;
      if (ANTAGONIST[a.g] === b.g) s += 3;
      if (b.g !== a.g) s += 1;
      const ga = groupsOf(a); for (const g of groupsOf(b)) if (ga.has(g)) s -= 1.2;
      s -= i * 0.15;
      if (s > bs) { bs = s; bi = i; }
    });
    pairs.push([a, rest.splice(bi, 1)[0]]);
  }
  return pairs;
}
function orderCircuit(list) {
  const by = {low:[], push:[], pull:[], core:[], cardio:[]};
  for (const ex of orderClassic(list)) by[REGION[ex.g]].push(ex);
  const keys = ['low', 'push', 'pull', 'cardio', 'core'].sort((a, b) => by[b].length - by[a].length);
  const out = [];
  while (out.length < list.length) {
    for (const k of keys) if (by[k].length) { if (out.length && REGION[out[out.length - 1].g] === k && keys.some(o => o !== k && by[o].length)) continue; out.push(by[k].shift()); }
    if (keys.every(k => !by[k].length)) break;
  }
  return out;
}

/* ---------- дозировка ---------- */
function prescribe(ex, week) {
  const G = GOALS[S.goal];
  const t = ex.type;
  let sets = G.sets[t];
  if (S.level === 'beg') sets = Math.max(2, sets - 1);
  if (S.level === 'adv' && t === 'c') sets = Math.min(6, sets + 1);
  let reps = G.reps[t], unit = 'повт.';
  if (ex.kind === 'time') { reps = G.time; unit = ''; }
  if (ex.kind === 'dist') { reps = G.dist; unit = ''; }
  const bodyweight = !ex.eq.length && !(ex.opt || []).length;
  let load = G.load[t];
  if (week) {
    const rir = week.rir + (S.level === 'beg' ? 1 : 0);
    const reserve = `${rir} ${plural(rir, 'повтор', 'повтора', 'повторов')} в запасе`;
    if (week.deload) { sets = Math.max(2, Math.round(sets * 0.6)); load = t === 'c' ? `${week.pct[S.goal]} от 1ПМ, лёгкий вес без отказа` : 'лёгкий вес, без отказа'; }
    else {
      if (week.add && t === 'c') sets = Math.min(6, sets + week.add);
      load = t === 'c' ? `${week.pct[S.goal]} от 1ПМ, ${reserve}` : reserve;
    }
  }
  if (ex.kind === 'time') load = ex.g === 'cardio' ? 'высокий темп без потери техники' : S.goal === 'strength' ? 'с отягощением или в усложнённом варианте' : 'ровно, без потери формы';
  else if (ex.g === 'cardio') load = 'взрывно и в ровном темпе';
  if (ex.kind === 'dist') load = S.goal === 'strength' ? 'максимально тяжёлые снаряды' : 'тяжёлые снаряды, без остановок';
  const notes = [];
  if (bodyweight && ex.kind !== 'time' && S.goal === 'strength') notes.push('Если диапазон даётся легко, добавьте отягощение или замедлите опускание до 4 с.');
  if (!week && S.level === 'beg') load = load.replace('1–2 повтора', '2–3 повтора');
  const rest = G.rest[t];
  const work = ex.kind === 'time' ? midOf(G.time) : ex.kind === 'dist' ? 30 : midOf(reps) * G.rep * (ex.uni ? 2 : 1);
  return {sets, reps, unit, rest, load, tempo:ex.kind ? null : G.tempo, notes, work, uni:!!ex.uni};
}

/* ---------- сборка одной тренировки ---------- */
function buildPlan(ctx = {}) {
  const groups = ctx.groups || S.groups, count = ctx.count || S.count, week = ctx.week || null;
  const sw = ctx.swaps || {};
  const E = effEquip(S.equip);
  const rand = rng((ctx.seed ?? S.seed) * 9973 + count * 31 + groups.length * 7);
  if (!groups.length) return {empty:'groups'};
  let {picked, pool} = pickExercises(E, rand, groups, count, ctx.avoid);
  for (const [i, id] of Object.entries(sw)) {
    const ex = EXI[id];
    if (picked[i] && ex && available(ex, E) && !picked.includes(ex)) picked[i] = ex;
  }
  if (!picked.length) return {empty:'none', pool, groups};
  const G = GOALS[S.goal];
  const items = picked.map((ex, i) => ({ex, slot:i, rx:applyLight(prescribe(ex, week), ex), name:exName(ex, E), eqLine:equipLine(ex, E), eqIds:chosenEquip(ex, E), has:propHas(ex, E)}));
  const bySlot = new Map(items.map(it => [it.ex, it]));
  let blocks = [], minutes = 0, totalSets = 0;
  if (S.format === 'classic') {
    const ord = orderClassic(picked).map(ex => bySlot.get(ex));
    ord.forEach((it, i) => { it.label = String(i + 1); });
    blocks = [{kind:'list', items:ord}];
    for (const it of ord) { minutes += it.rx.sets * (it.rx.work + it.rx.rest) + 60; totalSets += it.rx.sets; }
  } else if (S.format === 'superset') {
    const pairs = pairSupersets(picked);
    pairs.forEach((pr, pi) => {
      const L = String.fromCharCode(65 + pi);
      const its = pr.map((ex, j) => { const it = bySlot.get(ex); it.label = pr.length > 1 ? L + (j + 1) : L; return it; });
      const sets = Math.max(...its.map(it => it.rx.sets));
      const rest = pr.length > 1 ? G.ss.rest : its[0].rx.rest;
      its.forEach(it => { it.rx.sets = sets; it.rx.restShown = pr.length > 1 ? (it === its[its.length - 1] ? rest : 0) : rest; });
      blocks.push({kind:'pair', letter:L, items:its, sets, rest});
      minutes += sets * (its.reduce((a, it) => a + it.rx.work, 0) + 15 + rest) + 60;
      totalSets += sets * its.length;
    });
  } else {
    const ord = orderCircuit(picked).map(ex => bySlot.get(ex));
    const c = G.circ;
    let rounds = c.rounds + (S.level === 'beg' ? -1 : S.level === 'adv' ? 1 : 0);
    if (week && week.deload) rounds -= 1;
    else if (week && week.add) rounds += 0;
    rounds = Math.max(2, rounds);
    if (AR.light && S.mode !== 'program') rounds = Math.max(1, Math.round(rounds * .6));
    ord.forEach((it, i) => {
      it.label = String(i + 1);
      it.rounds = rounds;
      if (!it.ex.kind) it.rx.reps = c.reps;
      it.rx.circ = true;
      it.rx.work = it.ex.kind === 'time' ? c.work : it.ex.kind === 'dist' ? 30 : midOf(c.reps) * G.rep * (it.ex.uni ? 2 : 1);
    });
    blocks = [{kind:'circuit', items:ord, rounds, rest:c.rest, roundRest:c.roundRest}];
    minutes = rounds * (ord.reduce((a, it) => a + it.rx.work, 0) + c.rest * (ord.length - 1)) + (rounds - 1) * c.roundRest;
    totalSets = rounds * ord.length;
  }
  const missing = groups.filter(g => !pool.some(ex => groupsOf(ex).has(g)));
  const load = {}, gvol = {};
  for (const it of items) {
    const k = S.format === 'circuit' ? blocks[0].rounds : it.rx.sets;
    for (const m of it.ex.pri) load[m] = (load[m] || 0) + k;
    for (const m of it.ex.sec) load[m] = (load[m] || 0) + k * 0.5;
    /* дробный учёт: целевая группа — полный подход, остальные работающие — половина */
    const w = {};
    for (const m of it.ex.pri.concat(it.ex.sec)) { const g = MUSCLE_GROUP[m]; w[g] = Math.max(w[g] || 0, 0.5); }
    if (it.ex.g !== 'cardio') w[it.ex.g] = 1;
    else for (const m of it.ex.pri) w[MUSCLE_GROUP[m]] = Math.max(w[MUSCLE_GROUP[m]], 0.5);
    for (const [g, x] of Object.entries(w)) gvol[g] = (gvol[g] || 0) + k * x;
  }
  return {blocks, items, minutes:Math.round(minutes / 60), totalSets, missing, load, gvol, pool, E, groups, count};
}

/* ---------- сборка недели ---------- */
function buildProgram() {
  const days = S.days, split = splitFor(days);
  const tmpl = SPLITS[split].days[days];
  const week = WEEKS[S.week - 1];
  const avoid = new Set();
  const seen = {};
  const out = tmpl.map((tid, i) => {
    seen[tid] = (seen[tid] || 0) + 1;
    const p = buildPlan({groups:DAY_T[tid].g, count:S.count, seed:S.seed * 131 + i * 977 + 13, avoid:new Set(avoid), week, swaps:swaps['d' + i] || {}});
    if (p.items) p.items.forEach(it => avoid.add(it.ex.id));
    return {tid, i, wd:SCHEDULE[days][i], plan:p};
  });
  for (const d of out) {
    const same = tmpl.filter(t => t === d.tid).length;
    const k = tmpl.slice(0, d.i + 1).filter(t => t === d.tid).length;
    const letters = DAY_T[d.tid].name === 'Всё тело' ? 'АБВГ' : 'АБ';
    const isFull = DAY_T[d.tid].name === 'Всё тело';
    const fullIdx = isFull ? tmpl.slice(0, d.i + 1).filter(t => DAY_T[t].name === 'Всё тело').length : 0;
    const fullTotal = tmpl.filter(t => DAY_T[t].name === 'Всё тело').length;
    d.name = DAY_T[d.tid].name + (isFull ? (fullTotal > 1 ? ' ' + letters[fullIdx - 1] : '') : (same > 1 ? ' ' + letters[k - 1] : ''));
  }
  const gvol = {}, load = {};
  let minutes = 0, sets = 0;
  for (const d of out) {
    if (!d.plan.items) continue;
    minutes += d.plan.minutes; sets += d.plan.totalSets;
    for (const [g, v] of Object.entries(d.plan.gvol)) gvol[g] = (gvol[g] || 0) + v;
    for (const [m, v] of Object.entries(d.plan.load)) load[m] = (load[m] || 0) + v;
  }
  return {days:out, split, week, gvol, load, minutes, sets};
}

/* ---------- отрисовка ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const ICON = {
  swap:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h10l-3-3M16 13H6l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dice:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.2" cy="7.2" r="1.3" fill="currentColor"/><circle cx="12.8" cy="12.8" r="1.3" fill="currentColor"/><circle cx="10" cy="10" r="1.3" fill="currentColor"/></svg>',
  copy:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  loop:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 8.5A6 6 0 1 0 15 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.5v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chart:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h14M5 13l3.5-4 3 2.5L16 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cal:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 8h14M7 2.5v3M13 2.5v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  check:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function renderSetup() {
  const seg = (name, dict, cur) => Object.entries(dict).map(([k, v]) =>
    `<button type="button" class="seg-b${k === cur ? ' on' : ''}" data-set="${name}" data-v="${k}" aria-pressed="${k === cur}"><b>${v.name}</b>${v.hint ? `<small>${v.hint}</small>` : ''}</button>`).join('');
  const prog = S.mode === 'program';
  $('#views').innerHTML = viewTabs();
  const jv = S.view === 'journal';
  $('.setup').hidden = jv; $('.layout').classList.toggle('solo', jv);
  $('#f-mode').innerHTML = seg('mode', MODES, S.mode);
  $('#f-prog').hidden = !prog;
  $('#f-muscles').hidden = prog;
  $('#count-l').textContent = prog ? 'Упражнений в тренировке' : 'Упражнений';
  if (prog) {
    $('#f-days').innerHTML = [2, 3, 4, 5].map(d => `<button type="button" class="seg-b${d === S.days ? ' on' : ''}" data-days="${d}" aria-pressed="${d === S.days}"><b>${d}</b><small>${SCHEDULE[d].map(i => WD[i]).join(' ')}</small></button>`).join('');
    const sp = splitFor(S.days);
    const opts = Object.entries(SPLITS).filter(([, v]) => v.days[S.days]);
    $('#f-split').style.gridTemplateColumns = `repeat(${opts.length}, 1fr)`;
    $('#f-split').innerHTML = opts.map(([k, v]) => `<button type="button" class="seg-b${k === sp ? ' on' : ''}" data-split="${k}" aria-pressed="${k === sp}"><b>${v.name}</b><small>${v.hint}</small></button>`).join('');
    $('#split-note').textContent = SPLITS[sp].note;
  }
  $('#f-goal').innerHTML = seg('goal', GOALS, S.goal);
  $('#f-format').innerHTML = seg('format', FORMATS, S.format);
  $('#f-level').innerHTML = seg('level', LEVELS, S.level);
  $('#count-v').textContent = S.count;
  $('#count-minus').disabled = S.count <= 3; $('#count-plus').disabled = S.count >= 10;
  const gs = new Set(S.groups);
  $('#g-presets').innerHTML = GROUP_PRESETS.map(p => {
    const on = p.g.length === gs.size && p.g.every(g => gs.has(g));
    return `<button type="button" class="pre${on ? ' on' : ''}" data-gp="${p.id}">${p.name}</button>`;
  }).join('');
  $('#g-chips').innerHTML = GROUPS.map(g => `<button type="button" class="chip${gs.has(g.id) ? ' on' : ''}" data-g="${g.id}" aria-pressed="${gs.has(g.id)}">${ICON.check}<span>${g.name}</span></button>`).join('');
  const es = new Set(S.equip);
  $('#e-presets').innerHTML = EQUIP_PRESETS.map(p => {
    const on = p.eq.length === es.size && p.eq.every(e => es.has(e));
    return `<button type="button" class="pre${on ? ' on' : ''}" data-ep="${p.id}">${p.name}</button>`;
  }).join('');
  $('#e-chips').innerHTML = EQUIP_CATS.map(c => `<div class="e-cat"><h3>${c.name}</h3><div class="chips">${EQUIP.filter(e => e.cat === c.id).map(e =>
    `<button type="button" class="chip${es.has(e.id) ? ' on' : ''}" data-e="${e.id}" aria-pressed="${es.has(e.id)}"${e.hint ? ` title="${esc(e.hint)}"` : ''}>${ICON.check}<span>${e.name}</span></button>`).join('')}</div></div>`).join('');
  $('#e-count').textContent = es.size ? `${es.size} из ${EQUIP.length}` : 'только вес тела';
  const matched = EQUIP_PRESETS.some(p => p.eq.length === es.size && p.eq.every(e => es.has(e)));
  const open = eqOpen || !matched;
  $('#e-chips').hidden = !open;
  $('#e-sum').hidden = open;
  $('#e-sum').textContent = es.size === EQUIP.length ? 'Всё оборудование зала.' : EQUIP.filter(e => es.has(e.id)).map(e => e.name).join(', ') + '.';
  $('#e-toggle').hidden = !matched;
  $('#e-toggle').textContent = open ? 'Свернуть список' : 'Изменить список';
  $('#e-toggle').setAttribute('aria-expanded', open);
}

function titleFor() {
  const gs = new Set(S.groups);
  const p = GROUP_PRESETS.find(p => p.g.length === gs.size && p.g.every(g => gs.has(g)));
  if (p) return p.id === 'full' ? 'Всё тело' : p.id === 'legs' ? 'Ноги и ягодицы' : p.id === 'push' ? 'Грудь, плечи, трицепс' : p.id === 'pull' ? 'Спина, бицепс, хват' : 'Верх тела';
  const names = S.groups.map(g => GN[g].toLowerCase());
  const s = names.length > 1 ? names.slice(0, -1).join(', ') + ' и ' + names[names.length - 1] : names[0];
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadBars(load) {
  const rows = Object.entries(load).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = rows.length ? rows[0][1] : 1;
  return rows.map(([m, v]) => `<li><span class="lb-n">${MUSCLE_NAMES[m]}</span><span class="lb-t"><i style="width:${Math.max(6, v / max * 100).toFixed(0)}%"></i></span><span class="lb-v">${fmtNum(v)}</span></li>`).join('');
}
/* недельный объём по группам с ориентиром 10–20 подходов */
function volBars(gvol, groups) {
  const ids = GROUPS.map(g => g.id).filter(g => g !== 'cardio' && (groups.has(g) || (gvol[g] || 0) >= 1));
  const max = Math.max(22, ...ids.map(g => gvol[g] || 0));
  const pct = v => (v / max * 100).toFixed(1);
  return ids.map(g => {
    const v = Math.round((gvol[g] || 0) * 2) / 2;
    const st = v < 10 ? 'lo' : v > 20 ? 'hi' : 'ok';
    const lab = st === 'lo' ? 'мало' : st === 'hi' ? 'много' : 'в норме';
    return `<li class="${st}"><span class="vb-n">${GN[g]}</span><span class="vb-v">${fmtNum(v)}<em>${lab}</em></span><span class="vb-t"><b style="left:${pct(10)}%;width:${pct(10)}%"></b><i style="width:${Math.max(1.5, +pct(v))}%"></i></span></li>`;
  }).join('');
}

function rxHtml(it) {
  const r = it.rx;
  const unit = r.unit ? ` <small>${r.unit}</small>` : '';
  const side = r.uni ? '<small> на сторону</small>' : '';
  if (r.circ) return `<div class="rx"><span class="rx-big">${r.reps}${unit}${side}</span></div>`;
  const rest = r.restShown !== undefined ? (r.restShown ? `отдых ${fmtRest(r.restShown)}` : 'сразу к следующему') : `отдых ${fmtRest(r.rest)}`;
  return `<div class="rx"><span class="rx-big">${r.sets} × ${r.reps}${unit}${side}</span><span class="rx-rest">${rest}</span>${r.light ? '<span class="rx-light">облегчено</span>' : ''}</div>`;
}

function cardHtml(it, idx) {
  const ex = it.ex, r = it.rx;
  const lvl = {};
  for (const m of ex.pri) lvl[m] = 1;
  for (const m of ex.sec) if (!lvl[m]) lvl[m] = 0.38;
  const mus = ex.pri.map(m => `<li class="p">${MUSCLE_NAMES[m]}</li>`).join('') + ex.sec.map(m => `<li class="s">${MUSCLE_NAMES[m]}</li>`).join('');
  const meta = [];
  if (r.tempo) meta.push(`<span title="опускание – пауза – подъём – пауза, секунды; X — взрывно">темп <b>${r.tempo}</b></span>`);
  if (r.load) meta.push(`<span>${r.load}</span>`);
  const view = ex.anim.catalogRig?'Изометрия · 5 ракурсов':(ex.viewNote || (ex.anim.view === 'front' ? 'вид спереди' : 'вид сбоку'));
  return `<li class="card" data-ex="${ex.id}" data-slot="${it.slot}">
  <div class="c-top">
    <div class="motion-tile"><button type="button" class="illus" data-fig="${idx}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Разобрать движение: ${esc(it.name)}"><span class="illus-v">${view}</span><span class="illus-zoom" aria-hidden="true">Увеличить ↗</span></button><div class="motion-bar"><span class="motion-caption">Исходное положение</span><button type="button" data-motion-pause="${idx}" aria-label="Пауза демонстрации: ${esc(it.name)}" aria-pressed="false">Пауза</button></div></div>
    <div class="c-info">
      <div class="c-head"><span class="c-idx">${it.label}</span><span class="c-type">${ex.type === 'c' ? 'базовое' : 'изолирующее'}</span></div>
      <h3 class="c-name">${esc(it.name)}</h3>
      <p class="c-eq">${esc(it.eqLine)}</p>
      ${rxHtml(it)}
      ${meta.length ? `<p class="c-meta">${meta.join('<i>·</i>')}</p>` : ''}
    </div>
  </div>
  <div class="c-mus">
    <div class="c-map">${muscleMapSvg(lvl, {aria:'Работающие мышцы: ' + ex.pri.map(m => MUSCLE_NAMES[m]).join(', ')})}</div>
    <ul class="mus">${mus}</ul>
  </div>
  ${logBlock(it)}
  <div class="c-warm">${warmupHtml(it, workWeightOf(it, null))}</div>
  <div class="c-prog">${progressionHint(it)}</div>
  <div class="c-act">
    <button type="button" class="btn-ghost" data-workout="${ex.id}" aria-haspopup="dialog" aria-controls="workout-view">Начать тренировку →</button>
    <button type="button" class="btn-ghost" data-hist="1" aria-expanded="false">${ICON.chart}<span>История</span><small>${histCount(ex.id) || ''}</small></button>
    <button type="button" class="btn-ghost" data-swap="${it.slot}">${ICON.swap}<span>Заменить</span></button>
  </div>
  <div class="c-hist" hidden></div>
  <details class="tech">
    <summary>Техника выполнения</summary>
    <ol class="t-steps">${ex.tech.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <div class="t-cols">
      <div><h4>Частые ошибки</h4><ul class="t-err">${ex.err.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div><h4>Дыхание</h4><p>${esc(ex.breath)}</p>${ex.note ? `<h4>Важно</h4><p>${esc(ex.note)}</p>` : ''}${r.notes.map(n => `<p class="t-tip">${esc(n)}</p>`).join('')}</div>
    </div>
  </details>
</li>`;
}

function blocksHtml(p) {
  let html = `<p class="phase"><b>Разминка, 8–10 мин.</b> Лёгкое кардио до тёплого пота, суставная гимнастика, затем 1–2 разминочных подхода с лёгким весом в первом упражнении.</p>`;
  let idx = 0;
  for (const b of p.blocks) {
    if (b.kind === 'list') {
      html += `<ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol>`;
    } else if (b.kind === 'pair') {
      const many = b.items.length > 1;
      html += `<section class="block">
        <header class="b-head"><h2><span class="b-letter">${b.letter}</span>${many ? 'Суперсет' : 'Отдельное упражнение'}</h2>
        <p>${many ? `${b.sets} ${plural(b.sets, 'круг', 'круга', 'кругов')}: ${b.items.map(it => it.label).join(' → ')} без паузы, затем отдых ${fmtRest(b.rest)}` : `${b.sets} ${plural(b.sets, 'подход', 'подхода', 'подходов')}, отдых ${fmtRest(b.rest)}`}</p></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    } else {
      const rd = done.__rounds || 0;
      html += `<section class="block block-c">
        <header class="b-head"><h2><span class="b-letter">${ICON.loop}</span>Круг × ${b.rounds}</h2>
        <p>Выполняйте станции подряд: ${fmtRest(b.rest)} на переход между упражнениями, ${fmtRest(b.roundRest)} отдыха после круга.</p>
        <div class="sets rounds" role="group" aria-label="Отметить пройденные круги">${Array.from({length:b.rounds}, (_, k) => `<button type="button" class="set${rd > k ? ' done' : ''}" data-round="${k}" aria-label="Круг ${k + 1}">${k + 1}</button>`).join('')}<span class="rounds-l">круги</span></div></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    }
  }
  html += `<p class="phase"><b>Заминка, 5 мин.</b> Спокойная ходьба и растяжка мышц, которые работали: по 20–30 секунд на каждую.</p>`;
  return html;
}
const LEGEND = `<p class="legend">1ПМ — вес, который вы можете поднять один раз. Темп — секунды на опускание, паузу внизу, подъём и паузу вверху; X — взрывной подъём.</p>`;
function warnHtml(p) {
  const warn = [];
  if (p.items.length < p.count) warn.push(`Подобрано ${p.items.length} ${plural(p.items.length, 'упражнение', 'упражнения', 'упражнений')} из ${p.count}: других вариантов для этих мышц и оборудования нет.`);
  if (p.missing.length) warn.push(`Без упражнений осталось: ${p.missing.map(g => GN[g].toLowerCase()).join(', ')}. Для них нужно другое оборудование.`);
  return warn.length ? `<div class="warn">${warn.map(w => `<p>${esc(w)}</p>`).join('')}</div>` : '';
}
function headButtons(copyLabel) {
  return `<div class="p-btns">
        <button type="button" class="btn" id="start-workout" aria-haspopup="dialog" aria-controls="workout-view">Начать тренировку →</button>
        <button type="button" class="btn btn-2" id="reroll">${ICON.dice}<span>Другой вариант</span></button>
        <button type="button" class="btn btn-2" id="copy">${ICON.copy}<span>${copyLabel}</span></button>
        ${S.mode === 'program' ? `<button type="button" class="btn btn-2" id="ics-open">${ICON.cal}<span>В календарь</span></button>` : ''}
      </div>
      <p class="p-hint" id="copy-msg" role="status"></p>`;
}
function norm(load) { const mx = Math.max(1, ...Object.values(load)); const o = {}; for (const [m, v] of Object.entries(load)) o[m] = v / mx; return o; }

function renderPlan() {
  stopFigures();
  if (S.view === 'journal') { prog = null; plan = null; return renderJournal(); }
  if (S.mode === 'program') return renderProgram();
  prog = null;
  plan = buildPlan({swaps:swaps.s || {}});
  const root = $('#plan');
  if (plan.empty === 'groups') {
    root.innerHTML = `<div class="empty"><h2>Выберите мышцы</h2><p>Отметьте хотя бы одну группу мышц в параметрах — план соберётся сразу.</p></div>`;
    return;
  }
  if (plan.empty === 'none') {
    root.innerHTML = `<div class="empty"><h2>Не из чего собрать тренировку</h2><p>Для выбранных мышц нет упражнений с этим оборудованием и уровнем. Добавьте оборудование или выберите другие группы мышц.</p></div>`;
    return;
  }
  const G = GOALS[S.goal];
  const setsWord = S.format === 'circuit' ? plural(plan.totalSets, 'подход', 'подхода', 'подходов') + ' за круги' : plural(plan.totalSets, 'подход', 'подхода', 'подходов');
  let html = `<header class="p-head">
    <div class="p-sum">
      <p class="eyebrow">${G.name} · ${FORMATS[S.format].name} · ${LEVELS[S.level].name.toLowerCase()}</p>
      <h1 class="p-title">${esc(titleFor())}</h1>
      <dl class="stats">
        <div><dt>время</dt><dd>≈${plan.minutes}<small>мин</small></dd></div>
        <div><dt>${setsWord}</dt><dd>${plan.totalSets}</dd></div>
        <div><dt>${plural(plan.items.length, 'упражнение', 'упражнения', 'упражнений')}</dt><dd>${plan.items.length}</dd></div>
      </dl>
      ${headButtons('Скопировать план')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(plan.load), {labels:true, aria:'Карта нагрузки тренировки'})}</div>
      <figcaption>
        <p class="lb-h">Нагрузка по мышцам, подходов</p>
        <ul class="lbars">${loadBars(plan.load)}</ul>
        <p class="lb-note">Вспомогательная работа считается за половину подхода.</p>
      </figcaption>
    </figure>
  </header>`;
  html += autoregHtml() + warnHtml(plan) + blocksHtml(plan) + LEGEND;
  root.innerHTML = html;
  mountFigures();
}

function renderProgram() {
  prog = buildProgram();
  if (S.day >= prog.days.length) S.day = 0;
  const day = prog.days[S.day];
  plan = day.plan;
  const G = GOALS[S.goal], wk = prog.week;
  const allGroups = new Set(prog.days.flatMap(d => DAY_T[d.tid].g));
  const sp = SPLITS[prog.split];
  let html = `<header class="p-head">
    <div class="p-sum">
      <p class="eyebrow">${G.name} · ${FORMATS[S.format].name} · ${LEVELS[S.level].name.toLowerCase()}</p>
      <h1 class="p-title">${esc(sp.name)}, ${S.days} ${plural(S.days, 'тренировка', 'тренировки', 'тренировок')} в неделю</h1>
      <dl class="stats">
        <div><dt>в неделю</dt><dd>≈${prog.minutes}<small>мин</small></dd></div>
        <div><dt>${plural(prog.sets, 'подход', 'подхода', 'подходов')} в неделю</dt><dd>${prog.sets}</dd></div>
        <div><dt>неделя цикла</dt><dd>${S.week}<small>из 4</small></dd></div>
      </dl>
      ${headButtons('Скопировать неделю')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(prog.load), {labels:true, aria:'Карта недельной нагрузки'})}</div>
      <figcaption>
        <p class="lb-h">Подходов на группу за неделю</p>
        <ul class="vbars">${volBars(prog.gvol, allGroups)}</ul>
        <p class="lb-note">Полоса — ориентир для роста мышц: 10–20 подходов в неделю. Подход засчитывается целиком целевой группе и наполовину остальным работающим. ${S.goal === 'strength' ? 'В силовом цикле объём ниже — это нормально.' : ''}</p>
      </figcaption>
    </figure>
  </header>
  <section class="weeks" aria-label="Неделя цикла">
    <h2>Цикл из 4 недель</h2>
    <div class="wk" role="group" aria-label="Неделя цикла">${WEEKS.map((w, i) => `<button type="button" class="${i + 1 === S.week ? 'on' : ''}" data-week="${i + 1}" aria-pressed="${i + 1 === S.week}"><b>${i + 1}</b><small>${w.name}</small></button>`).join('')}</div>
    <p class="wk-note"><b>${wk.name}.</b> ${esc(wk.note)}</p>
    <p class="rule"><b>Как добавлять вес.</b> Работайте в диапазоне повторов из карточки. Когда во всех подходах сделали верхнюю границу, в следующий раз добавьте вес — 1–2,5 кг для верха тела, 2,5–5 кг для ног — и начните с нижней границы. Если записывать подходы в карточках, планировщик сам подскажет, когда прибавлять. После разгрузки повторите цикл с новыми весами.</p>
  </section>
  <nav class="days" role="tablist" aria-label="Дни недели">${prog.days.map((d, i) => `<button type="button" role="tab" class="${i === S.day ? 'on' : ''}" data-day="${i}" aria-selected="${i === S.day}"><b>${WD[d.wd]}</b><span>${esc(d.name)}</span><small>${d.plan.items ? `≈${d.plan.minutes} мин` : 'нет упражнений'}</small></button>`).join('')}</nav>
  <div class="day-head"><h2>${WD_FULL[day.wd]} — ${esc(day.name)}</h2>
    <p>${DAY_T[day.tid].g.map(g => GN[g].toLowerCase()).join(', ')}${plan.items ? ` · ≈${plan.minutes} мин · ${plan.totalSets} ${plural(plan.totalSets, 'подход', 'подхода', 'подходов')}` : ''}</p></div>`;
  if (!plan.items) html += `<div class="empty"><h2>Для этого дня нет упражнений</h2><p>С выбранным оборудованием нечем нагрузить эти мышцы. Добавьте оборудование или выберите другой сплит.</p></div>`;
  else html += autoregHtml() + warnHtml(plan) + blocksHtml(plan);
  html += LEGEND;
  $('#plan').innerHTML = html;
  if (plan.items) mountFigures();
}

/* ---------- Проигрыватель движений: карточки и увеличенный разбор ---------- */
let figs = [], rafId = 0, io = null;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionPrefs = (() => {try {return Object.assign({speed:.5,joints:true,trace:false,vectors:true,muscles:true},JSON.parse(localStorage.getItem('podhod.motion.v2') || '{}'));}catch(e){return {speed:.5,joints:true,trace:false,vectors:true,muscles:true};}})();
if (![.25,.5,1].includes(+motionPrefs.speed)) motionPrefs.speed = .5;
if(typeof motionPrefs.muscles!=='boolean')motionPrefs.muscles=true;
let detailMotion = null, detailReturn = null, lastMotionNow = null;
function saveMotionPrefs() {try {localStorage.setItem('podhod.motion.v2',JSON.stringify(motionPrefs));}catch(e){}}
function motionDurations(it) {
  const a = it.ex.anim;
  if (a.timing) return a.timing.map(x=>x*1000);
  if (a.hold) return [3000,0,3000,0];
  if (a.period || it.ex.kind || it.ex.g === 'cardio') {const p = a.period || 3200;return [p*.45,p*.05,p*.45,p*.05];}
  const parsed = String(it.rx.tempo || '3-0-1-0').split('-').map(x=>x==='X'?.6:Number(x));
  const q = parsed.length===4 && parsed.every(Number.isFinite) ? parsed : [3,0,1,0];
  return (a.eccFirst ? q : [q[2],q[3],q[0],q[1]]).map(x=>Math.max(0,x)*1000);
}
function motionFrame(F) {
  const d = F.durations, total = d.reduce((a,b)=>a+b,0) || 4000;
  let x = ((F.clock%total)+total)%total, index = 0;
  while (index<3 && x>=d[index]) {x-=d[index];index++;}
  const q = d[index] ? Math.min(1,x/d[index]) : 0;
  const eased = .5-.5*Math.cos(Math.PI*q);
  let t = index===0 ? eased : index===1 ? 1 : index===2 ? 1-eased : 0;
  if (F.it.ex.anim.hold) t=0;
  const a = F.it.ex.anim;
  let labels = a.eccFirst ? ['Опускание','Нижняя точка','Подъём','Верхняя точка'] : ['Рабочая фаза','Конечная точка','Возврат','Исходное положение'];
  if (F.it.ex.id === 'kbswing') labels=['Мах вперёд','Верхняя точка','Замах назад','Исходное положение'];
  if (F.it.ex.id === 'deadlift') labels=['Подъём','Верхняя точка','Опускание','Исходное положение'];
  return {t,index,label:a.hold?'Удержание':labels[index],cue:a.hold?a.cues[0]:a.cues[(index<2)!==!!a.eccFirst?0:1],progress:((F.clock%total)+total)%total/total,total};
}
function paintMotion(F, detailed=false) {
  const m = motionFrame(F); F.f.at(m.t,m);if(F.extra)F.extra.at(m.t,m);
  if (!detailed) {
    const cap = F.btn.closest('.motion-tile').querySelector('.motion-caption');
    if (cap && cap.textContent!==m.label) cap.textContent=m.label;
    return;
  }
  $('#mv-phase').textContent=m.label; $('#mv-cue').textContent=m.cue;
  $('#mv-progress').value=String(Math.round(m.progress*1000));
  $('#mv-progress').setAttribute('aria-valuetext',`${m.label}, ${Math.round(m.progress*100)}% повторения`);
  $('#mv-play').textContent=F.paused?'Воспроизвести':'Пауза';
  $('#mv-play').setAttribute('aria-label',F.paused?'Воспроизвести движение':'Приостановить движение');
  $('#mv-play').setAttribute('aria-pressed',String(!F.paused));
  $('#mv-position').textContent=`${Math.round(m.progress*100)}% повторения`;
  paintMusclePanel('mv',F,m);
}
function configureMusclePanel(prefix,it){
 const profile=motionProfile(it.ex.anim),toggle=$('#'+prefix+'-muscle-toggle'),panel=$('#'+prefix+'-muscle-panel');
 toggle.checked=!!profile&&!!motionPrefs.muscles;toggle.disabled=!profile;
 $('#'+prefix+'-muscle-availability').hidden=!!profile;
 panel.hidden=!profile||!motionPrefs.muscles;
 if(!profile){$('#'+prefix+'-muscle-list').replaceChildren();return;}
 const rows=[];
 for(const[id,m]of Object.entries(profile.muscles)){
  rows.push(`<li data-muscle-row="${id}"><span class="muscle-swatch" aria-hidden="true"></span><span class="muscle-row-copy"><strong>${esc(MUSCLE_NAMES[id])}</strong><span>${MUSCLE_ROLES[m.role]}</span></span><span class="muscle-level"></span></li>`);
  for(const[key,r]of Object.entries(profile.regions||{}).filter(([,r])=>r.parent===id&&r.id!==id)){
   if(key===id)continue;
   rows.push(`<li class="muscle-region-row" data-muscle-row="${key}" data-deep="${!r.visible}"><span class="muscle-swatch" aria-hidden="true"></span><span class="muscle-row-copy"><span>${esc(r.label)}</span><small>${r.profileBasis==='shared-group'?'Общий профиль группы':'Учебный региональный акцент'}</small></span><span class="muscle-level"></span></li>`);
  }
 }
 $('#'+prefix+'-muscle-list').innerHTML=rows.join('');
 const region=$('#'+prefix+'-region');region.innerHTML='<option value="all">Все области</option>'+Object.entries(profile.regions||{}).filter(([,r])=>r.visible).map(([id,r])=>`<option value="${id}">${esc(r.label)}</option>`).join('');
 const saved=motionPrefs.regions?.[it.ex.id]||'all';region.value=profile.regions?.[saved]?.visible?saved:'all';
 const F=prefix==='mv'?detailMotion:workout?.motion;for(const f of [F?.f,F?.extra].filter(Boolean))f.setRegion?.(region.value);
}
function paintMusclePanel(prefix,F,m){
 const panel=$('#'+prefix+'-muscle-panel');if(panel.hidden)return;
 const state=muscleFrame(F.it.ex.anim,m.t,m.index);if(!state)return;
 const note=$('#'+prefix+'-muscle-note');if(note.textContent!==state.note)note.textContent=state.note;
 for(const row of panel.querySelectorAll('[data-muscle-row]')){
  const v=state.values[row.dataset.muscleRow],level=row.querySelector('.muscle-level'),text=row.dataset.deep==='true'?'Глубже':MUSCLE_BANDS[muscleBand(v)];
  row.querySelector('.muscle-swatch').style.backgroundColor=muscleColor(v);
  if(level.textContent!==text)level.textContent=text;
 }
}
function changeMusclePreference(show){
 motionPrefs.muscles=!!show;saveMotionPrefs();
 for(const F of [...figs,detailMotion,workout?.motion].filter(Boolean)){
  for(const f of [F.f,F.extra].filter(Boolean))f.setMuscles?.(motionPrefs.muscles);
  const note=F.btn?.closest('.motion-tile').querySelector('.muscle-tile-note');if(note)note.hidden=!motionPrefs.muscles;
 }
 if(detailMotion){configureMusclePanel('mv',detailMotion.it);paintMotion(detailMotion,true);}
 if(workout?.motion){configureMusclePanel('wv',workout.motion.it);paintWorkoutMotion();}
}
function scheduleMotionLoop() {
  cancelAnimationFrame(rafId); lastMotionNow=null;
  const loop = now => {
    const dt = lastMotionNow===null ? 0 : Math.min(80,now-lastMotionNow); lastMotionNow=now;
    if (!document.hidden) {
      if (detailMotion) {if (!detailMotion.paused) {detailMotion.clock+=dt*Number(motionPrefs.speed);paintMotion(detailMotion,true);}}
      else if(workout && $('#workout-view').open){const F=workout.motion;if(F && !F.paused && !$('#wv-active').hidden){F.clock+=dt;paintWorkoutMotion();}}
      else for (const F of figs) if (F.vis && !F.paused) {F.clock+=dt;paintMotion(F);}
    }
    rafId=requestAnimationFrame(loop);
  };
  rafId=requestAnimationFrame(loop);
}
function mountFigures() {
  figs=[];
  const flat=plan.blocks.flatMap(b=>b.items);
  document.querySelectorAll('[data-fig]').forEach(btn=>{
    const it=flat[+btn.dataset.fig];
    try {
      const f=buildFigure(it.ex.anim,{primary:it.ex.pri,has:it.has,ratio:1,t:0,label:it.name,muscles:motionPrefs.muscles});
      btn.prepend(f.svg);
      const F={btn,it,f,vis:true,paused:reduceMotion,clock:0,durations:motionDurations(it)};
      figs.push(F);paintMotion(F);
      if(motionProfile(it.ex.anim)){const note=document.createElement('p');note.className='muscle-tile-note';note.textContent='Цвет — учебная схема';note.hidden=!motionPrefs.muscles;btn.closest('.motion-tile').appendChild(note);}
      const pause=btn.closest('.motion-tile').querySelector('[data-motion-pause]');
      if(pause){pause.textContent=F.paused?'Пуск':'Пауза';pause.setAttribute('aria-pressed',String(!F.paused));pause.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${it.name}`);}
    } catch(e) {console.error('Демонстрация',it.ex.id,e);}
  });
  if ('IntersectionObserver' in window) {
    io=new IntersectionObserver(es=>{for(const e of es){const F=figs.find(x=>x.btn===e.target);if(F)F.vis=e.isIntersecting;}},{rootMargin:'80px'});
    figs.forEach(F=>io.observe(F.btn));
  }
  scheduleMotionLoop();
}
function stopFigures() {
  if(workout && $('#workout-view').open)closeWorkout();
  if(detailMotion) closeMotion();
  cancelAnimationFrame(rafId);if(io)io.disconnect();io=null;figs=[];
}
function previewItem(id) {
  const ex=EXI[id];let E=effEquip(S.equip);
  if(!available(ex,E)) E=effEquip(EQUIP.map(e=>e.id));
  return {ex,name:exName(ex,E),rx:prescribe(ex,S.mode==='program'?WEEKS[S.week-1]:null),has:propHas(ex,E),eqLine:equipLine(ex,E)};
}
function selectMotion(it, clock=0) {
  disposeMotion(detailMotion);
  detailMotion={it,f:null,clock,paused:true,durations:motionDurations(it)};
  $('#mv-title').textContent=it.name;
  $('#mv-exercise').value=it.ex.id;
  $('#mv-view').textContent=it.ex.viewNote||(it.ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
  $('#mv-speed').value=String(motionPrefs.speed);$('#mv-joints').checked=!!motionPrefs.joints;$('#mv-trace').checked=!!motionPrefs.trace;$('#mv-vectors').checked=!!motionPrefs.vectors;
  $('#mv-tempo').textContent=it.ex.anim.hold?'Удерживайте положение и дышите ровно.':it.ex.anim.timing||it.ex.g==='cardio'||it.ex.kind?'Ритм показан схематично. Замедление помогает разобрать движение.':`Темп задания: ${it.rx.tempo}. Скорость просмотра не меняет задание.`;
  const level={};it.ex.pri.forEach(m=>level[m]=1);it.ex.sec.forEach(m=>{if(!level[m])level[m]=.38;});
  $('#mv-muscles').innerHTML=muscleMapSvg(level,{labels:true,aria:'Основные и вспомогательные мышцы'});
  $('#mv-primary').textContent=it.ex.pri.map(m=>MUSCLE_NAMES[m]).join(', ');
  $('#mv-secondary').textContent=it.ex.sec.length?it.ex.sec.map(m=>MUSCLE_NAMES[m]).join(', '):'—';
  $('#mv-steps').innerHTML=it.ex.tech.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-errors').innerHTML=it.ex.err.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-breath').textContent=it.ex.breath;
  $('#mv-note').textContent=it.ex.note||'';
  const links=[...(SOURCES_BY_EX[it.ex.id]||[]),...(motionProfile(it.ex.anim)?.sources||[])];
  const src=links.filter((v,i)=>links.findIndex(x=>x[1]===v[1])===i).map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`);
  $('#mv-sources').innerHTML=src.length?`<p class="mv-muscle-label">Подробнее о технике</p>${src.join('')}`:'';
  mountDetailCameras();
}
function openMotion(idx) {
  const F=figs.find(f=>+f.btn.dataset.fig===Number(idx));
  openMotionItem(F?F.it:previewItem(EX[0].id),F?F.clock:0);
}
function openMotionItem(it,clock=0){
  detailReturn=document.activeElement;
  selectMotion(it,clock);
  const d=$('#motion-view');if(!d.open)d.showModal();
  document.documentElement.classList.add('motion-open');
  $('#mv-close').focus();scheduleMotionLoop();
}
function closeMotion() {
  const d=$('#motion-view');disposeMotion(detailMotion);detailMotion=null;
  if(d&&d.open)d.close();
  document.documentElement.classList.remove('motion-open');
  if(detailReturn&&detailReturn.isConnected)detailReturn.focus();
  detailReturn=null;
}
function setupMotionViewer() {
  $('#mv-exercise').innerHTML=GROUPS.map(g=>`<optgroup label="${esc(g.name)}">${EX.filter(ex=>ex.g===g.id).map(ex=>`<option value="${ex.id}">${esc(ex.name)}</option>`).join('')}</optgroup>`).join('');

  document.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.motionPause!==undefined){const F=figs.find(f=>+f.btn.dataset.fig===+t.dataset.motionPause);if(F){F.paused=!F.paused;t.textContent=F.paused?'Пуск':'Пауза';t.setAttribute('aria-pressed',String(!F.paused));t.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${F.it.name}`);}return;}
    if(t.id==='motion-atlas'){openMotion(figs[0]?figs[0].btn.dataset.fig:-1);return;}
    if(t.id==='mv-close'){closeMotion();return;}
    if(!detailMotion)return;
    if(t.id==='mv-play'){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}
    if(t.dataset.mvStep){const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Math.max(0,Math.min(m.total-1,(m.progress+Number(t.dataset.mvStep))*m.total));paintMotion(detailMotion,true);}
    if(t.dataset.mvPose){const d=detailMotion.durations;detailMotion.paused=true;detailMotion.clock=({start:0,middle:d[0]*.5,end:d[0]+d[1]*.5,return:d[0]+d[1]+d[2]*.5})[t.dataset.mvPose];paintMotion(detailMotion,true);}
    if(t.dataset.mvNav){const i=EX.findIndex(x=>x.id===detailMotion.it.ex.id);selectMotion(previewItem(EX[(i+Number(t.dataset.mvNav)+EX.length)%EX.length].id));}
  });
  $('#mv-progress').addEventListener('input',e=>{if(!detailMotion)return;const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Number(e.target.value)/1000*(m.total-1);paintMotion(detailMotion,true);});
  $('#mv-speed').addEventListener('change',e=>{motionPrefs.speed=Number(e.target.value);saveMotionPrefs();});
  $('#mv-exercise').addEventListener('change',e=>selectMotion(previewItem(e.target.value)));
  $('#mv-joints').addEventListener('change',e=>{motionPrefs.joints=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean)){f.svg.classList.toggle('show-joints',e.target.checked);f.setJoints?.(e.target.checked);}saveMotionPrefs();});
  $('#mv-vectors').addEventListener('change',e=>{motionPrefs.vectors=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setVectors(e.target.checked);saveMotionPrefs();});
  $('#mv-trace').addEventListener('change',e=>{motionPrefs.trace=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setTrace(e.target.checked);saveMotionPrefs();});
  $('#mv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  $('#wv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  for(const prefix of ['mv','wv'])$('#'+prefix+'-region').addEventListener('change',e=>selectMuscleRegion(prefix,e.target.value));
  $('#motion-view').addEventListener('cancel',e=>{e.preventDefault();closeMotion();});
  $('#motion-view').addEventListener('close',()=>{disposeMotion(detailMotion);detailMotion=null;document.documentElement.classList.remove('motion-open');});
  $('#motion-view').addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();if(detailMotion){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}}});
}


/* ---------- таймер отдыха ---------- */
const T = {left:0, total:0, id:0};
function startRest(sec, label) {
  if (!sec) return;
  T.total = sec; T.left = sec; T.end = Date.now() + sec * 1000;
  $('#t-label').textContent = label || 'Отдых';
  $('#timer').hidden = false; $('#timer').classList.remove('over');
  clearInterval(T.id); clearTimeout(T.id); tick(); T.id = setInterval(tick, 250);
}
function tick() {
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
  const m = Math.floor(T.left / 60), s = T.left % 60;
  $('#t-time').textContent = `${m}:${String(s).padStart(2, '0')}`;
  $('#t-bar').style.width = (T.total ? (1 - T.left / T.total) * 100 : 100) + '%';
  if (T.left <= 0) {
    clearInterval(T.id);
    $('#timer').classList.add('over'); $('#t-label').textContent = 'Пора к следующему подходу';
    T.id = setTimeout(() => { $('#timer').hidden = true; }, 5000);
  }
}
function adjustRest(d) { if ($('#timer').hidden) return; T.end += d * 1000; T.total = Math.max(1, T.total + d); clearTimeout(T.id); clearInterval(T.id); $('#timer').classList.remove('over'); tick(); T.id = setInterval(tick, 250); }
function stopRest() { clearInterval(T.id); clearTimeout(T.id); $('#timer').hidden = true; }

/* ---------- текст для копирования ---------- */
function blocksText(p) {
  const lines = [];
  for (const b of p.blocks) {
    if (b.kind === 'pair') lines.push(b.items.length > 1 ? `Суперсет ${b.letter}: ${b.sets} ${plural(b.sets, 'круг', 'круга', 'кругов')}, отдых ${fmtRest(b.rest)} после пары` : `${b.letter}:`);
    if (b.kind === 'circuit') lines.push(`Круг × ${b.rounds}: переход ${fmtRest(b.rest)}, отдых после круга ${fmtRest(b.roundRest)}`);
    for (const it of b.items) {
      const r = it.rx;
      const side = r.uni ? ' на сторону' : '';
      lines.push(r.circ ? `${it.label}. ${it.name} — ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}` : `${it.label}. ${it.name} — ${r.sets} × ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}${b.kind === 'list' ? `, отдых ${fmtRest(r.rest)}` : ''}`);
    }
  }
  return lines;
}
function planText() {
  const G = GOALS[S.goal];
  if (S.mode === 'program' && prog) {
    const out = [`${SPLITS[prog.split].name}, ${S.days} ${plural(S.days, 'тренировка', 'тренировки', 'тренировок')} в неделю — ${G.name.toLowerCase()}`,
      `Неделя ${S.week} из 4: ${prog.week.name.toLowerCase()}. ${prog.week.note}`];
    for (const d of prog.days) {
      out.push('', `${WD_FULL[d.wd]} — ${d.name}${d.plan.items ? `, ≈${d.plan.minutes} мин` : ''}`);
      if (d.plan.items) out.push(...blocksText(d.plan)); else out.push('нет упражнений с выбранным оборудованием');
    }
    return out.join('\n');
  }
  return [`${titleFor()} — ${G.name.toLowerCase()}, ${FORMATS[S.format].name.toLowerCase()}, ≈${plan.minutes} мин`, ''].concat(blocksText(plan)).join('\n');
}

/* ---------- события ---------- */
const swapKey = () => S.mode === 'program' ? 'd' + S.day : 's';
function regen(resetSwaps = true) { if (resetSwaps) swaps = {}; done = {}; saveSettings(); renderSetup(); renderPlan(); }
document.addEventListener('click', e => {
  const t = e.target.closest('button, summary');
  if (!t) return;
  if (t.dataset.set) { S[t.dataset.set] = t.dataset.v; if (t.dataset.set === 'mode') S.day = 0; return regen(); }
  if (t.dataset.days) { S.days = +t.dataset.days; S.split = DEFAULT_SPLIT[S.days]; S.day = 0; return regen(); }
  if (t.dataset.split) { S.split = t.dataset.split; S.day = 0; return regen(); }
  if (t.dataset.week) { S.week = +t.dataset.week; done = {}; saveSettings(); renderPlan(); return; }
  if (t.dataset.day !== undefined) {
    S.day = +t.dataset.day; done = {}; saveSettings(); renderPlan();
    const dh = $('.day-head'); if (dh) dh.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'});
    return;
  }
  if (t.id === 'count-minus') { S.count = Math.max(3, S.count - 1); return regen(); }
  if (t.id === 'count-plus') { S.count = Math.min(10, S.count + 1); return regen(); }
  if (t.dataset.g) { const g = t.dataset.g; S.groups = S.groups.includes(g) ? S.groups.filter(x => x !== g) : S.groups.concat(g); S.groups.sort((a, b) => GROUPS.findIndex(x => x.id === a) - GROUPS.findIndex(x => x.id === b)); return regen(); }
  if (t.dataset.gp) { S.groups = GROUP_PRESETS.find(p => p.id === t.dataset.gp).g.slice(); return regen(); }
  if (t.dataset.e) { eqOpen = true; const id = t.dataset.e; S.equip = S.equip.includes(id) ? S.equip.filter(x => x !== id) : S.equip.concat(id); return regen(); }
  if (t.dataset.ep) { S.equip = EQUIP_PRESETS.find(p => p.id === t.dataset.ep).eq.slice(); return regen(); }
  if (t.id === 'reroll') { S.seed = (S.seed * 48271 + 11) % 2147483647; regen(); $('#plan').scrollIntoView({behavior:reduceMotion ? 'auto' : 'smooth', block:'start'}); return; }
  if (t.id === 'copy') {
    const txt = planText(), msg = $('#copy-msg');
    const fallback = () => { msg.innerHTML = 'Скопировать автоматически не удалось. Выделите текст:<textarea readonly rows="6"></textarea>'; const ta = msg.querySelector('textarea'); ta.value = txt; ta.focus(); ta.select(); };
    try { navigator.clipboard.writeText(txt).then(() => { msg.textContent = 'Скопировано — можно вставить в заметки или мессенджер.'; }, fallback); } catch (err) { fallback(); }
    return;
  }
  if (t.dataset.swap !== undefined) {
    const slot = +t.dataset.swap;
    const cur = plan.items.find(it => it.slot === slot).ex;
    const inPlan = new Set(plan.items.map(it => it.ex.id));
    const lvlMax = S.level === 'beg' ? 2 : 3;
    const tried = new Set((swaps.__tried && swaps.__tried[swapKey() + ':' + slot]) || []);
    let alts = EX.filter(ex => !inPlan.has(ex.id) && available(ex, plan.E) && ex.lvl <= lvlMax && (ex.g === cur.g || PATTERN[ex.id] === PATTERN[cur.id]))
      .sort((a, b) => (PATTERN[b.id] === PATTERN[cur.id]) - (PATTERN[a.id] === PATTERN[cur.id]));
    const msgEl = t.querySelector('span');
    if (!alts.length) { msgEl.textContent = 'Замены нет'; setTimeout(() => { msgEl.textContent = 'Заменить'; }, 1800); return; }
    tried.add(cur.id);
    let next = alts.find(ex => !tried.has(ex.id));
    if (!next) { tried.clear(); tried.add(cur.id); next = alts[0]; }
    swaps.__tried = swaps.__tried || {};
    swaps.__tried[swapKey() + ':' + slot] = [...tried];
    const k = swapKey();
    swaps[k] = swaps[k] || {};
    swaps[k][slot] = next.id;
    done = {};
    renderPlan();
    const card = document.querySelector(`.card[data-slot="${slot}"]`);
    if (card) { card.classList.add('flash'); card.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'}); }
    return;
  }
  if (t.dataset.round !== undefined) {
    const k = +t.dataset.round, cur = done.__rounds || 0;
    done.__rounds = cur === k + 1 ? k : k + 1;
    t.parentElement.querySelectorAll('.set').forEach((b, i) => b.classList.toggle('done', i < done.__rounds));
    const b = plan.blocks[0];
    if (done.__rounds > cur && done.__rounds < b.rounds) startRest(b.roundRest, `Отдых после круга ${done.__rounds}`);
    return;
  }
  if (t.dataset.fig !== undefined) {openMotion(t.dataset.fig);return;}
  if (t.id === 'e-toggle') { eqOpen = !eqOpen; renderSetup(); return; }
  if (t.id === 't-minus') return adjustRest(-15);
  if (t.id === 't-plus') return adjustRest(15);
  if (t.id === 't-skip') return stopRest();
});

/* ===================== ЖУРНАЛ ===================== */
/* Хранилище: в опубликованной версии — аккаунт (db, личный раздел пользователя),
   в офлайн-файле — браузер. Формат: LOG.data[exId] = [{d:'2026-10-05', wk?:1, s:[[кг|null, повторы] | null, …]}, …] */
const LOG_KEY = 'podhod.log.v1';
const LOG = {mode:'connecting', data:{}, col:null, pending:{}, writing:{}, again:{}, timers:{}, err:'', dl:null, canExport:false};
const WEIGHTED = new Set(['db', 'bb', 'kb', 'cable', 'smith', 'legpress', 'legext', 'legcurl', 'pecdeck', 'hack', 'chestpress', 'shoulderpress', 'leverrow', 'tbar', 'abductor', 'calfseat', 'calfstand']);
const LOWER_G = new Set(['quads', 'hams', 'glutes', 'calves']);
const MACHINE = new Set(['cable', 'smith', 'legext', 'legcurl', 'pecdeck', 'chestpress', 'shoulderpress', 'leverrow', 'abductor', 'calfseat', 'calfstand', 'gravitron', 'hack', 'tbar']);
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayKey = () => dayKey(new Date());
function fmtDay(k, withYear) {
  if (k === todayKey()) return 'сегодня';
  const [y, m, d] = k.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}${withYear && y !== new Date().getFullYear() ? ' ' + y : ''}`;
}
let DEC = ','; /* десятичный разделитель; в английской сборке заменяется на точку */
const fmtKg = v => (Math.round(v * 100) / 100).toString().replace('.', DEC);
const parseNum = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };

function validSessions(ss) {
  return Array.isArray(ss) && ss.every(x => x && typeof x.d === 'string' && /^\d{4}-\d\d-\d\d$/.test(x.d) && Array.isArray(x.s));
}
function logLoadLocal() {
  try {
    const s = JSON.parse(localStorage.getItem(LOG_KEY) || 'null');
    if (s && typeof s === 'object') for (const [k, v] of Object.entries(s)) if (EXI[k] && validSessions(v)) LOG.data[k] = v;
  } catch (e) {}
}
function logSaveLocal() { try { localStorage.setItem(LOG_KEY, JSON.stringify(LOG.data)); } catch (e) {} }

/* объединение двух историй: по дате; при совпадении берём запись с большим числом подходов */
function mergeSessions(a, b) {
  const by = new Map();
  for (const x of a || []) by.set(x.d, x);
  for (const x of b || []) {
    const cur = by.get(x.d);
    if (!cur || x.s.filter(Boolean).length > cur.s.filter(Boolean).length) by.set(x.d, x);
  }
  return [...by.values()].sort((p, q) => p.d < q.d ? -1 : 1).slice(-150);
}

async function logInit() {
  const c = window.claude;
  if (!c || typeof c.use !== 'function') { LOG.mode = 'local'; LOG.canExport = true; logRefresh(null); return; }
  let db = null, user = null;
  try { [db, user, LOG.dl] = await Promise.all([c.use('db'), c.use('user'), c.use('downloads')]); } catch (e) {}
  LOG.canExport = !!LOG.dl;
  const uid = user ? await user.id() : null;
  if (!db || !uid) { LOG.mode = 'local'; logRefresh(null); return; }
  try { LOG.col = db.collection('data/users/' + uid); } catch (e) { LOG.mode = 'local'; logRefresh(null); return; }
  LOG.mode = 'cloud';
  const before = JSON.parse(JSON.stringify(LOG.data));
  let first = true;
  LOG.col.onSnapshot(snap => {
    const remote = {};
    let bodyDoc = null;
    for (const d of snap.docs) { const b = d.data(); if (d.id === '_body') bodyDoc = b; else if (b && EXI[d.id] && validSessions(b.sessions)) remote[d.id] = b.sessions; }
    const changed = [], wasFirst = first;
    if (first) {
      first = false;
      /* записи, сделанные в этом браузере до подключения, переносим в аккаунт */
      for (const id of new Set([...Object.keys(remote), ...Object.keys(before)])) {
        const merged = mergeSessions(remote[id], before[id]);
        if (JSON.stringify(merged) !== JSON.stringify(remote[id] || [])) { LOG.data[id] = merged; logTouch(id, true); }
        else LOG.data[id] = remote[id];
        changed.push(id);
      }
    } else {
      for (const id of new Set([...Object.keys(remote), ...Object.keys(LOG.data)])) {
        if (LOG.pending[id]) continue;
        const r = remote[id] || [];
        if (JSON.stringify(r) === JSON.stringify(LOG.data[id] || [])) continue;
        if (r.length) LOG.data[id] = r; else delete LOG.data[id];
        changed.push(id);
      }
    }
    logSaveLocal();
    bodyRemote(bodyDoc, wasFirst);
    logRefresh(changed);
  }, err => {
    if (err && err.code === 'unavailable') return;
    LOG.mode = 'local'; LOG.err = 'Связь с аккаунтом потеряна — новые записи сохраняются в этом браузере.'; logRefresh(null);
  });
  logRefresh(null);
}

function logTouch(id, now) {
  logSaveLocal();
  if (LOG.mode !== 'cloud') return;
  LOG.pending[id] = true;
  clearTimeout(LOG.timers[id]);
  LOG.timers[id] = setTimeout(() => logFlush(id), now ? 0 : 800);
}
async function logFlush(id, retried) {
  if (LOG.writing[id]) { LOG.again[id] = true; return; }
  LOG.writing[id] = true;
  try {
    const ss = (LOG.data[id] || []).filter(x => x.s.some(Boolean));
    if (ss.length) await LOG.col.doc(id).set({ex:id, sessions:ss});
    else await LOG.col.doc(id).delete();
  } catch (e) {
    const code = e && e.code;
    if (code === 'unavailable' && !retried) { LOG.writing[id] = false; setTimeout(() => logFlush(id, true), 600 + Math.random() * 900); return; }
    if (code === 'quota_exceeded') LOG.err = 'Хранилище журнала заполнено. Удалите старые записи или сделайте резервную копию.';
    else { LOG.mode = 'local'; LOG.err = 'Сохранить в аккаунт не получилось — записи сохраняются в этом браузере.'; }
    logRefresh(null);
  } finally {
    LOG.writing[id] = false;
    if (LOG.again[id]) { LOG.again[id] = false; logFlush(id); } else LOG.pending[id] = false;
  }
}

function todaySession(id, create) {
  let ss = LOG.data[id];
  if (!ss) { if (!create) return null; ss = LOG.data[id] = []; }
  const d = todayKey();
  let s = ss.find(x => x.d === d);
  if (!s && create) {
    s = {d, s:[]};
    if (S.mode === 'program') s.wk = S.week;
    ss.push(s); ss.sort((a, b) => a.d < b.d ? -1 : 1);
    if (ss.length > 150) ss.splice(0, ss.length - 150);
  }
  return s;
}
function pastSessions(id) { const d = todayKey(); return (LOG.data[id] || []).filter(x => x.d < d && x.s.some(Boolean)); }
function cleanToday(id) {
  const ss = LOG.data[id]; if (!ss) return;
  const s = ss.find(x => x.d === todayKey()); if (!s) return;
  while (s.s.length && !s.s[s.s.length - 1]) s.s.pop();
  if (!s.s.length) ss.splice(ss.indexOf(s), 1);
  if (!ss.length) delete LOG.data[id];
}

/* ---------- что записываем ---------- */
function loadType(ex) {
  if (ex.assist) return 'assist'; /* гравитрон: записываем противовес, меньше — тяжелее */
  if (ex.eq.some(g => g.every(id => WEIGHTED.has(id)))) return 'kg';
  if (ex.g === 'cardio' || ex.eq.some(g => g.includes('band') || g.includes('abwheel'))) return 'none';
  return 'extra';
}
function repLabel(ex) { return ex.kind === 'time' ? 'Секунды' : ex.kind === 'dist' ? 'Метры' : 'Повторы'; }
function stepFor(it) {
  const ids = it.eqIds || [], lower = LOWER_G.has(it.ex.g);
  if (ids.includes('legpress') || ids.includes('hack')) return 10;
  if (ids.includes('bb') || ids.includes('smith')) return lower ? 5 : 2.5;
  if (ids.some(i => MACHINE.has(i))) return lower ? 5 : 2.5;
  if (ids.includes('db')) return 2;
  if (ids.includes('kb')) return 4;
  return 2.5;
}
const roundTo = (v, st) => Math.max(0, Math.round(v / st) * st);
function parseRange(r) { const m = String(r).match(/(\d+)\D+(\d+)/); if (m) return [+m[1], +m[2]]; const n = parseInt(r, 10); return [n || 0, n || 0]; }
const e1rm = (kg, reps) => kg * (1 + Math.min(reps, 12) / 30);

/* ---------- подсказка по двойной прогрессии ---------- */
function suggest(it) {
  const ex = it.ex, lt = loadType(ex), past = pastSessions(ex.id);
  const [lo, hi] = parseRange(it.rx.reps);
  const unit = ex.kind === 'time' ? ' с' : ex.kind === 'dist' ? ' м' : '';
  const week = S.mode === 'program' ? WEEKS[S.week - 1] : null;
  const step = stepFor(it);
  const res = {tone:'new', kg:null, reps:[], text:'', prev:null};
  if (!past.length) {
    res.text = lt === 'assist' ? `Первая запись. Подберите противовес, с которым ${lo === hi ? lo : lo + '–' + hi} повторов даются с запасом в 2.` : lt === 'kg'
      ? (ex.kind === 'dist' ? 'Первая запись. Возьмите тяжёлые снаряды, с которыми проходите дистанцию без остановок.' : `Первая запись. Подберите вес, с которым ${lo === hi ? lo : lo + '–' + hi}${unit} даются с запасом в 2 повтора.`)
      : `Первая запись. Отметьте, сколько ${ex.kind === 'time' ? 'секунд' : ex.kind === 'dist' ? 'метров' : 'повторов'} получилось в каждом подходе.`;
    return res;
  }
  const prev = past[past.length - 1];
  res.prev = prev;
  const sets = prev.s.filter(Boolean);
  const kgs = sets.map(x => x[0]).filter(v => v > 0);
  const work = kgs.length ? Math.max(...kgs) : null;
  const atWork = work ? sets.filter(x => x[0] === work) : sets;
  const repsList = atWork.map(x => x[1]);
  const prevList = sets.map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(', ');
  if (ex.kind === 'dist') { res.tone = 'same'; res.kg = work; res.text = work ? `В прошлый раз — ${fmtKg(work)} кг. Попробуйте пройти дальше или взять тяжелее.` : `В прошлый раз: ${prevList} м.`; return res; }
  if (!week && AR.light && work && (lt === 'kg' || lt === 'assist')) {
    res.tone = 'deload'; res.kg = lt === 'assist' ? Math.max((Math.floor(work / step) + 1) * step, roundTo(work * 1.1, step)) : roundTo(work * .9, step); res.reps = sets.map(() => lo);
    res.text = lt === 'assist' ? `Облегчённый режим: противовес ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.` : `Облегчённый режим: ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.`;
    return res;
  }
  if (week && week.deload && work) {
    res.tone = 'deload'; res.kg = lt === 'assist' ? Math.max((Math.floor(work / step) + 1) * step, roundTo(work * 1.15, step)) : roundTo(work * .85, step);
    res.reps = sets.map(() => lo);
    res.text = lt === 'assist' ? `Разгрузка: противовес ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.` : `Разгрузка: ${fmtKg(res.kg)} кг вместо ${fmtKg(work)}, без отказа.`;
    return res;
  }
  const required=prev.target || (it.rx.circ ? it.rounds : it.rx.sets) || 1;
  const allTop=prev.s.length>=required && Array.from({length:required},(_,k)=>prev.s[k]).every(v=>v && v[1]>=hi && (!work || v[0]===work));
  const anyLow = repsList.some(r => r < lo);
  if (allTop) {
    if (lt === 'kg' && work) {
      res.tone = 'up'; res.kg = work + step; res.reps = sets.map(() => lo);
      res.text = `Прибавьте до ${fmtKg(res.kg)} кг (+${fmtKg(step)}). В прошлый раз все подходы на верхней границе: ${prevList}.`;
    } else if (lt === 'assist' && work) {
      res.tone = 'up'; res.kg = Math.max(0, work - step); res.reps = sets.map(() => lo);
      res.text = `Уменьшите противовес до ${fmtKg(res.kg)} кг (−${fmtKg(step)}). В прошлый раз все подходы на верхней границе: ${prevList}.`;
    } else if (ex.kind === 'time') {
      res.tone = 'up'; res.kg = work; res.reps = sets.map(() => hi + 10);
      res.text = `Все подходы на верхней границе. Держите на 10 с дольше${lt === 'extra' ? ' или добавьте отягощение' : ''}.`;
    } else {
      res.tone = 'up'; res.kg = work; res.reps = sets.map((x, k) => x[1] + 1);
      res.text = lt === 'extra' ? `Все подходы на верхней границе (${prevList}). Добавьте отягощение или замедлите опускание до 4 с.` : `Все подходы на верхней границе (${prevList}). Возьмите ленту потуже.`;
    }
    return res;
  }
  if (anyLow) {
    const before = past.length > 1 ? past[past.length - 2].s.filter(Boolean) : [];
    const bWork = before.length ? Math.max(0, ...before.map(x => x[0] || 0)) : 0;
    const lowAgain = work && bWork === work && before.filter(x => x[0] === work).some(x => x[1] < lo);
    if (lt === 'kg' && work && lowAgain) {
      res.tone = 'down'; res.kg = roundTo(work * 0.9, step); res.reps = sets.map(() => lo);
      res.text = `Две тренировки подряд меньше ${lo}${unit} — снизьте до ${fmtKg(res.kg)} кг и наберите повторы.`;
    } else if (lt === 'assist' && work != null && lowAgain) {
      res.tone = 'down'; res.kg = work + step; res.reps = sets.map(() => lo);
      res.text = `Две тренировки подряд меньше ${lo} — увеличьте противовес до ${fmtKg(res.kg)} кг и наберите повторы.`;
    } else {
      res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.max(lo, x[1]));
      res.text = `${work ? `Оставьте ${fmtKg(work)} кг` : 'Тот же вариант'} и доберите до ${lo}${unit} в каждом подходе. В прошлый раз: ${prevList}.`;
    }
    return res;
  }
  res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.min(hi, x[1] + 1));
  res.text = `${work ? `${lt === 'assist' ? 'Тот же противовес' : 'Тот же вес'} — ${fmtKg(work)} кг` : 'Тот же вариант'}, цель — на 1${unit || ' повтор'} больше: в прошлый раз ${prevList}.`;
  return res;
}

/* ---------- блок записи в карточке ---------- */
const SUG_ICON = {up:'↑', same:'→', down:'↓', deload:'↓', new:'+'};
function logRows(it) {
  const ex = it.ex, lt = loadType(ex), sg = suggest(it);
  const today = todaySession(ex.id, false);
  const tset = today ? today.s : [];
  const n = Math.max(it.rx.circ ? (it.rounds || it.rx.sets) : it.rx.sets, tset.length);
  const prevSets = sg.prev ? sg.prev.s.filter(Boolean) : [];
  const [lo, hi] = parseRange(it.rx.reps);
  let rows = '';
  for (let k = 0; k < n; k++) {
    const v = tset[k];
    const p = prevSets[k] || prevSets[prevSets.length - 1];
    const pTxt = p ? (p[0] ? fmtKg(p[0]) + ' × ' : '') + p[1] : '—';
    const phKg = sg.kg != null ? fmtKg(sg.kg) : (lt === 'kg' ? '' : '—');
    const phR = sg.reps[k] ?? sg.reps[sg.reps.length - 1] ?? (lo === hi ? String(lo) : `${lo}–${hi}`);
    const done = !!v;
    rows += `<div class="lt-r${done ? ' done' : ''}" data-k="${k}">
      <span class="lt-n">${k + 1}</span><span class="lt-p">${pTxt}</span>
      ${lt === 'none' ? '' : `<input class="lt-in" id="kg-${ex.id}-${k}" data-f="kg" type="text" inputmode="decimal" autocomplete="off" aria-label="Вес, подход ${k + 1}" placeholder="${phKg}" value="${done && v[0] != null ? fmtKg(v[0]) : ''}">`}
      <input class="lt-in" id="rp-${ex.id}-${k}" data-f="reps" type="text" inputmode="numeric" autocomplete="off" aria-label="${repLabel(ex)}, подход ${k + 1}" placeholder="${phR}" value="${done ? v[1] : ''}">
      <button type="button" class="lt-ok" data-tick="${ex.id}" data-k="${k}" aria-pressed="${done}" aria-label="Подход ${k + 1} выполнен">${ICON.check}</button>
    </div>`;
  }
  return {sg, html:`<p class="sug sug-${sg.tone}"><b aria-hidden="true">${SUG_ICON[sg.tone]}</b><span>${esc(sg.text)}</span></p>
    <div class="lt${lt === 'none' ? ' lt-nokg' : ''}" role="group" aria-label="Запись подходов">
      <div class="lt-h"><span>№</span><span>Прошлый раз</span>${lt === 'none' ? '' : `<span>${lt === 'kg' ? 'Вес, кг' : lt === 'assist' ? 'Противовес' : 'Доп. кг'}</span>`}<span>${repLabel(ex)}</span><span></span></div>
      ${rows}
    </div>
    <div class="lt-foot"><button type="button" class="lt-add" data-addset="${ex.id}">+ подход</button>${ex.uni ? '<span>повторы — на каждую сторону</span>' : ''}${it.rx.circ ? '<span>строка — один круг</span>' : ''}</div>`};
}
function logBlock(it) { return `<div class="c-log" data-log="${it.ex.id}">${logRows(it).html}</div>`; }

/* ---------- история упражнения ---------- */
function metricOf(ex) {
  if (loadType(ex) === 'kg' && ex.kind !== 'dist') return {name:'Расчётный максимум', unit:'кг', f:s => { const v = s.s.filter(x => x && x[0] > 0).map(x => e1rm(x[0], x[1])); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'time') return {name:'Лучший подход', unit:'с', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'dist') return {name:'Лучшая дистанция', unit:'м', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  return {name:'Лучший подход', unit:'повт.', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
}
function sparkSvg(pts, unit, step = 0.5) {
  if (!pts.length) return '';
  const W = 300, H = 74, L = 6, R = 40, T = 12, B = 14;
  const vs = pts.map(p => p.v);
  let mn = Math.min(...vs), mx = Math.max(...vs);
  if (mx - mn < 1e-9) { mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.12; mn -= pad; mx += pad;
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (1 - (v - mn) / (mx - mn)) * (H - T - B);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  const area = pts.length > 1 ? `${line}L${x(pts.length - 1).toFixed(1)},${H - B}L${x(0).toFixed(1)},${H - B}Z` : '';
  const last = pts[pts.length - 1], first = pts[0];
  const fv = v => fmtKg(Math.round(v / step) * step);
  const data = esc(JSON.stringify(pts.map((p, i) => [x(i), y(p.v), `${fmtDay(p.d, true)} · ${fv(p.v)} ${unit}`])));
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика: от ${fv(first.v)} до ${fv(last.v)} ${unit}" data-pts="${data}">
    <line class="sp-base" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
    ${area ? `<path class="sp-area" d="${area}"/>` : ''}
    ${pts.length > 1 ? `<path class="sp-line" d="${line}"/>` : ''}
    <circle class="sp-end" cx="${x(pts.length - 1).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4"/>
    <text class="sp-lab" x="${(x(pts.length - 1) + 8).toFixed(1)}" y="${(y(last.v) + 4).toFixed(1)}">${fv(last.v)}</text>
    ${pts.length > 1 ? `<text class="sp-d" x="${L}" y="${H - 2}">${fmtDay(first.d, true)}</text><text class="sp-d" x="${W - R}" y="${H - 2}" text-anchor="end">${fmtDay(last.d, true)}</text>` : ''}
    <line class="sp-x" x1="0" x2="0" y1="${T - 4}" y2="${H - B}" visibility="hidden"/><circle class="sp-dot" r="4" cx="0" cy="0" visibility="hidden"/>
  </svg>`;
}
function histHtml(ex) {
  const ss = (LOG.data[ex.id] || []).filter(x => x.s.some(Boolean));
  if (!ss.length) return `<p class="h-empty">Записей пока нет. Отметьте подходы выше — здесь появится история и график.</p>`;
  const m = metricOf(ex);
  const pts = ss.map(s => ({d:s.d, v:m.f(s)})).filter(p => p.v != null).slice(-24);
  const best = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  const rows = ss.slice(-6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}${s.wk ? `<small>нед. ${s.wk}</small>` : ''}</span>
    <span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span>
    <button type="button" class="h-del" data-del="${ex.id}" data-d="${s.d}" aria-label="Удалить запись за ${fmtDay(s.d, true)}">Удалить</button></li>`).join('');
  return `<div class="h-chart"><p class="h-cap">${m.name}, ${m.unit}${best != null ? ` · лучший ${fmtKg(Math.round(best * 2) / 2)}` : ''}</p>${sparkSvg(pts, m.unit)}</div>
    <ul class="h-list">${rows}</ul>${ss.length > 6 ? `<p class="h-more">Всего записей: ${ss.length}. Полная история — в разделе «Журнал».</p>` : ''}`;
}
function histCount(id) { return (LOG.data[id] || []).filter(x => x.s.some(Boolean)).length; }

/* ---------- обновление на странице ---------- */
function refreshCard(card) {
  if (!plan || !plan.items) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex);
  if (!it) return;
  const box = card.querySelector('.c-log');
  const ae = document.activeElement;
  if (box && !(box.contains(ae) && ae.tagName === 'INPUT')) {
    const refocus = box.contains(ae) && ae.dataset.k !== undefined ? `[data-${ae.dataset.tick ? 'tick' : 'addset'}][data-k="${ae.dataset.k}"]` : null;
    box.innerHTML = logRows(it).html;
    if (refocus) { const n = box.querySelector(refocus); if (n) n.focus(); }
  }
  refreshWarmup(card);
  const pg = card.querySelector('.c-prog'); if (pg) pg.innerHTML = progressionHint(it);
  const h = card.querySelector('.c-hist');
  if (h && !h.hidden) h.innerHTML = histHtml(it.ex);
  const hb = card.querySelector('[data-hist]');
  if (hb) { const n = histCount(it.ex.id); hb.querySelector('small').textContent = n ? n : ''; }
}
function logRefresh(ids) {
  const st = $('#log-status'); if (st) st.innerHTML = statusHtml();
  const tab = document.querySelector('[data-view="journal"] small'); if (tab) tab.textContent = journalDays() || '';
  if (S.view === 'journal') { if (!$('#plan').contains(document.activeElement) || document.activeElement === document.body) renderJournal(); return; }
  document.querySelectorAll('.card').forEach(c => { if (!ids || ids.includes(c.dataset.ex)) refreshCard(c); });
}
function statusHtml() {
  const m = LOG.mode;
  const t = m === 'cloud' ? 'Записи сохраняются в вашем аккаунте и доступны на любом устройстве, где вы открываете эту страницу.'
    : m === 'connecting' ? 'Подключаю хранилище записей…'
    : 'Записи хранятся в этом браузере. Делайте резервную копию, чтобы перенести журнал на другое устройство или не потерять его при очистке браузера.';
  return `<span class="ls-dot ls-${m}" aria-hidden="true"></span><span>${LOG.err ? esc(LOG.err) + ' Делайте резервную копию, чтобы не потерять записи.' : t}</span>`;
}
function journalDays() { const s = new Set(); for (const ss of Object.values(LOG.data)) for (const x of ss) if (x.s.some(Boolean)) s.add(x.d); return s.size; }

/* ---------- экран «Журнал» ---------- */
function heatmap() {
  const byDay = {};
  for (const ss of Object.values(LOG.data)) for (const x of ss) { const n = x.s.filter(Boolean).length; if (n) byDay[x.d] = (byDay[x.d] || 0) + n; }
  const W = 12, cell = 15, gap = 3, LX = 22, TY = 16;
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const dow = (now.getDay() + 6) % 7;
  const start = new Date(now); start.setDate(now.getDate() - dow - (W - 1) * 7);
  let cells = '', months = '', lastM = -1;
  for (let w = 0; w < W; w++) for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
    if (dt > now) continue;
    const k = dayKey(dt), n = byDay[k] || 0;
    const lv = n === 0 ? 0 : n < 10 ? 1 : n < 20 ? 2 : 3;
    cells += `<rect class="hm hm${lv}" x="${LX + w * (cell + gap)}" y="${TY + d * (cell + gap)}" width="${cell}" height="${cell}" rx="3" data-tip="${fmtDay(k, true)}: ${n ? n + ' ' + plural(n, 'подход', 'подхода', 'подходов') : 'без тренировки'}"/>`;
    if (d === 0 && dt.getMonth() !== lastM) { lastM = dt.getMonth(); months += `<text class="hm-l" x="${LX + w * (cell + gap)}" y="10">${MONTHS[lastM]}</text>`; }
  }
  const days = ['Пн', '', 'Ср', '', 'Пт', '', ''].map((t, i) => t ? `<text class="hm-l" x="0" y="${TY + i * (cell + gap) + 11}">${t}</text>` : '').join('');
  const w = LX + W * (cell + gap), h = TY + 7 * (cell + gap);
  return `<svg class="heat" viewBox="0 0 ${w} ${h}" role="img" aria-label="Тренировочные дни за 12 недель">${months}${days}${cells}</svg>
    <p class="hm-legend"><span>меньше</span><i class="hm0"></i><i class="hm1"></i><i class="hm2"></i><i class="hm3"></i><span>больше подходов за день</span></p>`;
}
function renderJournal() {
  stopFigures();
  const entries = Object.entries(LOG.data).map(([id, ss]) => [id, ss.filter(x => x.s.some(Boolean))]).filter(([id, ss]) => EXI[id] && ss.length);
  const days = journalDays();
  const sets = entries.reduce((a, [, ss]) => a + ss.reduce((b, x) => b + x.s.filter(Boolean).length, 0), 0);
  const last = entries.reduce((m, [, ss]) => ss[ss.length - 1].d > m ? ss[ss.length - 1].d : m, '');
  entries.sort((a, b) => a[1][a[1].length - 1].d < b[1][b[1].length - 1].d ? 1 : -1);
  const tools = `<div class="j-tools">
      ${LOG.canExport ? `<button type="button" class="btn btn-2" id="exp-json">Полная копия (JSON)</button><button type="button" class="btn btn-2" id="exp-csv">Журнал для Excel</button><button type="button" class="btn btn-2" id="exp-body">Замеры для Excel</button>` : ''}
      <label class="btn btn-2" for="imp-file">Восстановить из копии</label><input type="file" id="imp-file" accept=".json,application/json" hidden>
    </div><p class="p-hint" id="j-msg" role="status"></p>
    <p class="p-hint">Полная копия — настройки, инвентарь, журнал и замеры одним файлом: перенесёт всё на другой телефон или вернёт после очистки браузера.</p>`;
  let html = `<header class="p-head j-head">
    <div class="p-sum">
      <p class="eyebrow">Журнал</p>
      <h1 class="p-title">Ваш прогресс</h1>
      <dl class="stats">
        <div><dt>${plural(days, 'тренировка', 'тренировки', 'тренировок')}</dt><dd>${days}</dd></div>
        <div><dt>${plural(sets, 'подход', 'подхода', 'подходов')}</dt><dd>${sets}</dd></div>
        <div><dt>${plural(entries.length, 'упражнение', 'упражнения', 'упражнений')}</dt><dd>${entries.length}</dd></div>
      </dl>
      <p class="ls" id="log-status">${statusHtml()}</p>
      ${tools}
    </div>
    <figure class="j-heat"><figcaption class="lb-h">Активность за 12 недель${last ? ` · последняя тренировка ${fmtDay(last, true)}` : ''}</figcaption>${heatmap()}</figure>
  </header>${bodyHtml()}`;
  if (!entries.length) {
    html += `<div class="empty"><h2>Записей пока нет</h2><p>Откройте план и отмечайте подходы в карточках упражнений: вес и повторы сохранятся здесь, а планировщик начнёт подсказывать, когда прибавлять вес.</p><button type="button" class="btn" data-view="plan">Перейти к плану</button></div>`;
  } else {
    html += `<ul class="j-list">${entries.map(([id, ss]) => {
      const ex = EXI[id], m = metricOf(ex);
      const vals = ss.map(s => m.f(s)).filter(v => v != null);
      const firstV = vals[0], lastV = vals[vals.length - 1];
      const ch = vals.length > 1 && firstV ? Math.round((lastV / firstV - 1) * 100) : null;
      const lastS = ss[ss.length - 1];
      return `<li class="j-row">
        <details>
          <summary>
            <span class="j-name">${esc(ex.name)}<small>${GN[ex.g]} · ${ss.length} ${plural(ss.length, 'запись', 'записи', 'записей')} · ${fmtDay(lastS.d, true)}</small></span>
            <span class="j-val">${lastV != null ? fmtKg(Math.round(lastV * 2) / 2) : '—'}<small>${m.unit}</small>${ch != null ? `<em class="${ch > 0 ? 'pos' : ch < 0 ? 'neg' : ''}">${ch > 0 ? '+' : ''}${ch}%</em>` : ''}</span>
          </summary>
          <div class="j-body">${histHtml(ex).replace(/<p class="h-more">.*?<\/p>/, '')}${ss.length > 6 ? `<details class="j-all"><summary>Все записи (${ss.length})</summary><ul class="h-list">${ss.slice(0, -6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}</span><span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span><button type="button" class="h-del" data-del="${id}" data-d="${s.d}">Удалить</button></li>`).join('')}</ul></details>` : ''}</div>
        </details>
      </li>`;
    }).join('')}</ul>
    <p class="legend">Расчётный максимум — вес, который вы, по формуле Эпли, подняли бы один раз: вес × (1 + повторы / 30). Он растёт и когда прибавляете вес, и когда делаете больше повторов с тем же весом.</p>`;
  }
  $('#plan').innerHTML = html;
}
function viewTabs() {
  const n = journalDays();
  return `<button type="button" role="tab" data-view="plan" aria-selected="${S.view !== 'journal'}" class="${S.view !== 'journal' ? 'on' : ''}">План</button>
    <button type="button" role="tab" data-view="journal" aria-selected="${S.view === 'journal'}" class="${S.view === 'journal' ? 'on' : ''}">Журнал <small>${n || ''}</small></button>`;
}

/* ---------- экспорт и восстановление ---------- */
async function saveFile(name, text, mime) {
  if (LOG.dl) {
    try { await LOG.dl.save({filename:name, data:text}); return 'ok'; }
    catch (e) { return e && e.code === 'declined' ? 'declined' : 'fail'; }
  }
  if (!window.claude) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:mime}));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return 'ok';
  }
  return 'fail';
}
function csvText() {
  const rows = [['Дата', 'Упражнение', 'Группа мышц', 'Подход', 'Вес, кг', 'Повторы / секунды / метры', 'Неделя цикла']];
  const all = [];
  for (const [id, ss] of Object.entries(LOG.data)) if (EXI[id]) for (const s of ss) s.s.forEach((x, k) => { if (x) all.push([s.d, EXI[id].name, GN[EXI[id].g], k + 1, x[0] != null ? fmtKg(x[0]) : '', x[1], s.wk || '']); });
  all.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1);
  return '﻿' + rows.concat(all).map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\r\n');
}
async function exportLog(kind) {
  const msg = $('#j-msg'), d = todayKey();
  const r = kind === 'csv' ? await saveFile(`lazy-gym-log-${d}.csv`, csvText(), 'text/csv')
    : await saveFile(`lazy-gym-kopiya-${d}.json`, JSON.stringify(backupObject()), 'application/json');
  if (msg) msg.textContent = r === 'ok' ? (kind === 'csv' ? 'Таблица сохранена. Откройте её в Excel: столбцы разделены точкой с запятой.' : 'Полная копия сохранена. Восстановить из неё всё можно здесь же, на любом устройстве.')
    : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не удалось.';
}
function importLog(file) {
  const msg = $('#j-msg');
  const rd = new FileReader();
  rd.onload = () => {
    let obj; try { obj = JSON.parse(rd.result); } catch (e) { obj = null; }
    if (!obj || obj.app !== 'podhod' || (!obj.log && !obj.body && !obj.settings)) { if (msg) msg.textContent = 'Это не резервная копия Lazy Gym Planner. Выберите файл lazy-gym-kopiya-….json.'; return; }
    const r = restoreBackup(obj);
    renderJournal();
    const m2 = $('#j-msg');
    const parts = [];
    if (r.exercises) parts.push(`записей журнала: ${r.sessions} (упражнений: ${r.exercises})`);
    if (r.body > 0) parts.push(`замеров: ${r.body}`);
    if (r.settings) parts.push('настройки');
    if (m2) m2.textContent = parts.length ? `Восстановлено: ${parts.join(', ')}. Совпадающие даты объединены.` : 'Нового в копии нет — всё из неё уже есть.';
  };
  rd.readAsText(file);
}

/* ---------- всплывающая подсказка для графиков ---------- */
const tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl);
function showTip(text, cx, cy) {
  tipEl.textContent = text; tipEl.hidden = false;
  const r = tipEl.getBoundingClientRect();
  tipEl.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, cx - r.width / 2)) + 'px';
  tipEl.style.top = Math.max(8, cy - r.height - 12) + 'px';
}
document.addEventListener('pointermove', e => {
  const sp = e.target.closest && e.target.closest('.spark');
  if (sp) {
    const pts = JSON.parse(sp.dataset.pts || '[]'); if (!pts.length) return;
    const b = sp.getBoundingClientRect(), vb = sp.viewBox.baseVal, sx = b.width / vb.width;
    const px = (e.clientX - b.left) / sx;
    let bi = 0; pts.forEach((p, i) => { if (Math.abs(p[0] - px) < Math.abs(pts[bi][0] - px)) bi = i; });
    const p = pts[bi], xl = sp.querySelector('.sp-x'), dot = sp.querySelector('.sp-dot');
    xl.setAttribute('x1', p[0]); xl.setAttribute('x2', p[0]); xl.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); dot.setAttribute('visibility', 'visible');
    showTip(p[2], b.left + p[0] * sx, b.top + p[1] * (b.height / vb.height));
    return;
  }
  const c = e.target.closest && e.target.closest('[data-tip]');
  if (c) { const b = c.getBoundingClientRect(); showTip(c.dataset.tip, b.left + b.width / 2, b.top); return; }
  if (!tipEl.hidden) { tipEl.hidden = true; document.querySelectorAll('.spark .sp-x, .spark .sp-dot').forEach(n => n.setAttribute('visibility', 'hidden')); }
}, {passive:true});
document.addEventListener('pointerleave', () => { tipEl.hidden = true; });

/* ---------- действия журнала ---------- */
function tickSet(btn) {
  const id = btn.dataset.tick, k = +btn.dataset.k;
  const row = btn.closest('.lt-r');
  const it = plan.items.find(x => x.ex.id === id);
  const lt = loadType(it.ex);
  const kgIn = row.querySelector('[data-f="kg"]'), rIn = row.querySelector('[data-f="reps"]');
  const s = todaySession(id, true);
  if (s.s[k]) {
    s.s[k] = null; cleanToday(id);
    row.classList.remove('done'); btn.setAttribute('aria-pressed', 'false');
    if (kgIn) kgIn.value = ''; rIn.value = '';
    logTouch(id); refreshHist(id); return;
  }
  const reps = parseNum(rIn.value !== '' ? rIn.value : rIn.placeholder);
  let kg = kgIn ? parseNum(kgIn.value !== '' ? kgIn.value : kgIn.placeholder) : null;
  if (reps == null || reps <= 0) {
    cleanToday(id);
    rIn.focus(); rIn.classList.add('need'); setTimeout(() => rIn.classList.remove('need'), 1600);
    return;
  }
  if (lt === 'kg' && kg == null && kgIn) { kgIn.focus(); kgIn.classList.add('need'); setTimeout(() => kgIn.classList.remove('need'), 1600); cleanToday(id); return; }
  if (kg != null && kg < 0) kg = null;
  while (s.s.length < k) s.s.push(null);
  s.s[k] = [kg, Math.round(reps * 10) / 10];
  s.target=Math.max(s.target||0,it.rx.circ?(it.rounds||it.rx.sets):it.rx.sets);
  if (kgIn) kgIn.value = kg != null ? fmtKg(kg) : '';
  rIn.value = s.s[k][1];
  row.classList.add('done'); btn.setAttribute('aria-pressed', 'true');
  logTouch(id); refreshHist(id);
  const total = it.rx.circ ? 0 : it.rx.sets;
  const doneN = s.s.filter(Boolean).length;
  if (!it.rx.circ) {
    const r = it.rx.restShown !== undefined ? it.rx.restShown : it.rx.rest;
    if (r) startRest(r, doneN >= total ? 'Отдых перед следующим упражнением' : `Отдых после подхода ${doneN}`);
  }
}
function editSet(inp) {
  const row = inp.closest('.lt-r'); if (!row || !row.classList.contains('done')) return;
  const box = inp.closest('.c-log'), id = box.dataset.log, k = +row.dataset.k;
  const s = todaySession(id, false); if (!s || !s.s[k]) return;
  const v = parseNum(inp.value);
  if (inp.dataset.f === 'kg') s.s[k][0] = v != null && v >= 0 ? v : null;
  else if (v != null && v > 0) s.s[k][1] = Math.round(v * 10) / 10; else return;
  logTouch(id); refreshHist(id);
}
function refreshHist(id) {
  const card = document.querySelector(`.card[data-ex="${id}"]`); if (!card) return;
  const h = card.querySelector('.c-hist'); if (h && !h.hidden) h.innerHTML = histHtml(EXI[id]);
  const hb = card.querySelector('[data-hist] small'); if (hb) { const n = histCount(id); hb.textContent = n || ''; }
  const tab = document.querySelector('[data-view="journal"] small'); if (tab) tab.textContent = journalDays() || '';
}
const delArm = {};
function deleteSession(btn) {
  const id = btn.dataset.del, d = btn.dataset.d, key = id + d;
  if (!delArm[key]) {
    delArm[key] = true; btn.textContent = 'Точно удалить?'; btn.classList.add('armed');
    setTimeout(() => { delArm[key] = false; if (btn.isConnected) { btn.textContent = 'Удалить'; btn.classList.remove('armed'); } }, 3500);
    return;
  }
  delArm[key] = false;
  const ss = LOG.data[id]; if (!ss) return;
  const i = ss.findIndex(x => x.d === d); if (i < 0) return;
  ss.splice(i, 1); if (!ss.length) delete LOG.data[id];
  logTouch(id, true);
  if (S.view === 'journal') renderJournal();
  else { const card = document.querySelector(`.card[data-ex="${id}"]`); if (card) refreshCard(card); }
}

document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.tick) { tickSet(t); return; }
  if (t.dataset.addset) {
    const id = t.dataset.addset, it = plan.items.find(x => x.ex.id === id);
    it.extra = (it.extra || 0) + 1;
    const box = t.closest('.c-log');
    const n = box.querySelectorAll('.lt-r').length;
    it.rx.sets = Math.max(it.rx.sets, n + 1);
    if (it.rx.circ) it.rounds = Math.max(it.rounds || 0, n + 1);
    box.innerHTML = logRows(it).html;
    const inp = box.querySelector(`.lt-r[data-k="${n}"] .lt-in`); if (inp) inp.focus();
    return;
  }
  if (t.dataset.hist) {
    const card = t.closest('.card'), h = card.querySelector('.c-hist');
    h.hidden = !h.hidden; t.setAttribute('aria-expanded', String(!h.hidden));
    if (!h.hidden) h.innerHTML = histHtml(EXI[card.dataset.ex]);
    return;
  }
  if (t.dataset.del) { deleteSession(t); return; }
  if (t.dataset.view) { S.view = t.dataset.view; saveSettings(); renderSetup(); renderPlan(); window.scrollTo({top:0}); return; }
  if (t.id === 'exp-csv') { exportLog('csv'); return; }
  if (t.id === 'exp-json') { exportLog('json'); return; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'imp-file' && e.target.files && e.target.files[0]) { importLog(e.target.files[0]); e.target.value = ''; }
  else if (e.target.classList && e.target.classList.contains('lt-in')) editSet(e.target);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('lt-in')) {
    e.preventDefault();
    const row = e.target.closest('.lt-r');
    if (row.classList.contains('done')) { editSet(e.target); return; }
    const ins = [...row.querySelectorAll('.lt-in')];
    const i = ins.indexOf(e.target);
    if (i < ins.length - 1) ins[i + 1].focus(); else row.querySelector('.lt-ok').click();
  }
});

/* Режим тренировки использует тот же журнал, что и карточки плана. */
let workout=null,workoutTimer=0,workoutReturn=null;
const WORKOUT_STORE='podhod.workout.v3';
function workoutQueue(p){
  const q=[];
  for(const b of p.blocks){
    if(b.kind==='list')for(const it of b.items)for(let k=0;k<it.rx.sets;k++)q.push({it,k,n:it.rx.sets,rest:it.rx.rest,phase:'Классика'});
    if(b.kind==='pair')for(let k=0;k<Math.max(b.sets,...b.items.map(it=>it.rx.sets));k++){
      const active=b.items.filter(it=>k<it.rx.sets);active.forEach((it,j)=>q.push({it,k,n:it.rx.sets,rest:j===active.length-1?b.rest:0,phase:`Суперсет ${b.letter} · круг ${k+1}`}));
    }
    if(b.kind==='circuit'){
      const rounds=Math.max(b.rounds,...b.items.map(it=>it.rounds||b.rounds));
      for(let k=0;k<rounds;k++){const active=b.items.filter(it=>k<(it.rounds||b.rounds));active.forEach((it,j)=>q.push({it,k,n:it.rounds||b.rounds,rest:j===active.length-1?b.roundRest:b.rest,phase:`Круг ${k+1} из ${rounds}`}));}
    }
  }
  return q;
}
function workoutStamp(q){return JSON.stringify([todayKey(),S.mode,S.day,S.week,S.format,S.goal,q.map(x=>[x.it.ex.id,x.k,x.n,x.rest,x.it.rx.reps])]);}
function workoutValue(step){return todaySession(step.it.ex.id,false)?.s[step.k]||null;}
function workoutFirstOpen(q,after=-1){for(let j=1;j<=q.length;j++){const i=(after+j)%q.length;if(!workoutValue(q[i]))return i;}return -1;}
function workoutDraftKey(step){return step.it.ex.id+':'+step.k;}
function saveWorkout(){
  if(!workout)return;
  try{localStorage.setItem(WORKOUT_STORE,JSON.stringify({stamp:workout.stamp,index:workout.index,started:workout.started,restUntil:workout.restUntil,restTotal:workout.restTotal,next:workout.next,last:workout.last,drafts:workout.drafts}));}catch(e){}
}
function workoutCapture(){
  if(!workout||$('#wv-active').hidden)return;
  const step=workout.queue[workout.index];if(!step)return;
  workout.drafts[workoutDraftKey(step)]={kg:$('#wv-kg').value,reps:$('#wv-reps').value};saveWorkout();
}
function startWorkout(id){
  if(!plan?.items?.length)return;
  workoutReturn=document.activeElement;
  const queue=workoutQueue(plan),stamp=workoutStamp(queue);
  let old=null;try{old=JSON.parse(localStorage.getItem(WORKOUT_STORE)||'null');}catch(e){}
  const same=old?.stamp===stamp;
  workout={queue,stamp,index:0,started:same&&Number.isFinite(old.started)?old.started:Date.now(),drafts:same&&old.drafts&&typeof old.drafts==='object'?old.drafts:{},restUntil:0,restTotal:0,next:-1,last:-1,motion:null};
  const first=workoutFirstOpen(queue);
  if(same){workout.index=Math.max(0,Math.min(queue.length-1,Math.trunc(old.index)||0));workout.restUntil=Number(old.restUntil)||0;workout.restTotal=Number(old.restTotal)||0;workout.next=Number.isInteger(old.next)?old.next:-1;workout.last=Number.isInteger(old.last)?old.last:-1;}
  else workout.index=Math.max(0,first);
  if(id){const i=queue.findIndex(x=>x.it.ex.id===id&&!workoutValue(x));workout.index=i>=0?i:Math.max(0,queue.findIndex(x=>x.it.ex.id===id));workout.restUntil=0;}
  const d=$('#workout-view');if(!d.open)d.showModal();document.documentElement.classList.add('workout-open');stopRest();
  $('#wv-context').textContent=S.mode==='program'?`${WD_FULL[prog.days[S.day].wd]} · ${prog.days[S.day].name}`:`${GOALS[S.goal].name} · ${FORMATS[S.format].name}`;
  const its=[...new Map(queue.map(x=>[x.it.ex.id,x.it])).values()];
  $('#wv-exercise').innerHTML=its.map(it=>`<option value="${it.ex.id}">${esc(it.label+'. '+it.name)}</option>`).join('');
  if(first<0&&!id)workoutFinish();
  else if(workout.restUntil&&workout.next>=0&&workout.next<queue.length)workoutShowRest();
  else workoutShow(workout.index);
  clearInterval(workoutTimer);workoutTimer=setInterval(workoutTick,250);workoutTick();saveWorkout();$('#wv-close').focus();scheduleMotionLoop();
}
function closeWorkout(){
  if(!workout)return;workoutCapture();saveWorkout();disposeMotion(workout.motion);clearInterval(workoutTimer);workoutTimer=0;
  const d=$('#workout-view');if(d.open)d.close();document.documentElement.classList.remove('workout-open');
  logRefresh(null);if(workoutReturn?.isConnected)workoutReturn.focus();workoutReturn=null;
}
function workoutShow(index){
  if(!workout)return;
  workout.index=Math.max(0,Math.min(workout.queue.length-1,index));workout.restUntil=0;workout.next=-1;
  const s=workout.queue[workout.index],it=s.it,ex=it.ex,stored=workoutValue(s),lt=loadType(ex),sg=suggest(it);
  const prev=sg.prev?.s[s.k]||sg.prev?.s.filter(Boolean).slice(-1)[0];
  $('#wv-active').hidden=false;$('#wv-rest').hidden=true;$('#wv-finish').hidden=true;
  $('#wv-title').textContent=it.name;$('#wv-exercise').value=ex.id;
  $('#wv-set-label').textContent=`${s.phase} · подход ${s.k+1} из ${s.n}`;
  $('#wv-equipment').textContent=it.eqLine;
  $('#wv-target').textContent=it.rx.reps+(ex.kind?'':' повторов');
  $('#wv-previous').textContent=prev?`${prev[0]!=null?fmtKg(prev[0])+' кг × ':''}${prev[1]} ${ex.kind==='time'?'с':ex.kind==='dist'?'м':'повт.'}`:'Первая запись';
  $('#wv-previous-date').textContent=sg.prev?fmtDay(sg.prev.d,true):'';
  $('#wv-set-chips').innerHTML=workout.queue.map((x,i)=>x.it.ex.id===ex.id?`<button type="button" data-wv-index="${i}" class="${workoutValue(x)?'is-done ':''}${i===workout.index?'is-current':''}" aria-label="Подход ${x.k+1}${workoutValue(x)?', выполнен':''}" aria-current="${i===workout.index?'step':'false'}">${workoutValue(x)?'✓ ':''}${x.k+1}</button>`:'').join('');
  $('#wv-unilateral').hidden=!ex.uni;$('#wv-unilateral').textContent='Выполните обе стороны. Запишите количество повторов для одной стороны.';
  $('#wv-weight-label').hidden=lt==='none';$('#wv-weight-caption').textContent=lt==='extra'?'Доп. вес, кг':lt==='assist'?'Противовес, кг':'Вес, кг';$('#wv-rep-caption').textContent=repLabel(ex);$('#wv-reps').setAttribute('inputmode',ex.kind==='dist'?'decimal':'numeric');
  const draft=workout.drafts[workoutDraftKey(s)],today=todaySession(ex.id,false)?.s||[],last=today.slice(0,s.k).filter(Boolean).slice(-1)[0];
  $('#wv-kg').value=draft?draft.kg:stored?stored[0]!=null?fmtKg(stored[0]):'':last?.[0]!=null?fmtKg(last[0]):prev?.[0]!=null?fmtKg(prev[0]):'';
  $('#wv-reps').value=draft?draft.reps:stored?String(stored[1]):'';$('#wv-reps').placeholder=it.rx.reps;
  $('#wv-input-hint').textContent=lt==='extra'?'Дополнительный вес можно оставить пустым. Введите фактический результат.':lt==='none'?'Укажите фактический результат подхода.':'Вес подставлен из последней записи, если она есть. Уточните его и введите результат.';
  $('#wv-error').textContent='';$('#wv-kg').removeAttribute('aria-invalid');$('#wv-reps').removeAttribute('aria-invalid');
  $('#wv-done').textContent=stored?'Сохранить изменения':'Подход выполнен';$('#wv-save-status').textContent=stored?'Этот подход уже записан.':'Запись появится в общем журнале.';
  $('#wv-suggestion').textContent=sg.text;
  const cue=MOTION_FOCUS[ex.id];$('#wv-setup').textContent=cue?.setup||ex.tech[0];$('#wv-control').textContent=cue?.control||ex.tech[1];$('#wv-breath').textContent=ex.breath;
  disposeMotion(workout.motion);workout.motion={it,f:null,clock:0,paused:reduceMotion,durations:motionDurations(it)};$('#wv-angle').textContent=ex.viewNote||(ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
  $('#wv-motion').textContent=reduceMotion?'Воспроизвести':'Пауза';$('#wv-motion').setAttribute('aria-pressed',String(!reduceMotion));mountWorkoutCameras();
  $('#wv-prev').disabled=workout.index===0;$('#wv-next').disabled=workout.index===workout.queue.length-1;
  saveWorkout();workoutTick();
}
function paintWorkoutMotion(){if(!workout?.motion)return;const F=workout.motion,m=motionFrame(F);F.f.at(m.t,m);if($('#wv-cue').textContent!==m.cue)$('#wv-cue').textContent=m.cue;paintMusclePanel('wv',F,m);}
function strictWorkoutNumber(value){const s=String(value).trim().replace(',','.');return /^\d+(\.\d+)?$/.test(s)?Number(s):null;}
function commitWorkout(e){
  if(e)e.preventDefault();if(!workout||$('#wv-active').hidden)return;
  const step=workout.queue[workout.index],ex=step.it.ex,lt=loadType(ex),kgRaw=$('#wv-kg').value.trim(),reps=strictWorkoutNumber($('#wv-reps').value),kg=lt==='none'?null:kgRaw?strictWorkoutNumber(kgRaw):null;
  let bad=null,msg='';
  if(lt!=='none'&&kgRaw&&kg===null){bad=$('#wv-kg');msg='Введите вес числом, например 12,5.';}
  else if(lt==='kg'&&(kg===null||kg<=0)){bad=$('#wv-kg');msg='Укажите фактический вес снаряда.';}
  else if(reps===null||reps<=0||(!ex.kind&&!Number.isInteger(reps))){bad=$('#wv-reps');msg=ex.kind?'Укажите фактический результат числом больше нуля.':'Укажите целое количество выполненных повторов.';}
  if(bad){$('#wv-error').textContent=msg;bad.setAttribute('aria-invalid','true');bad.focus();return;}
  const already=!!workoutValue(step),session=todaySession(ex.id,true);
  while(session.s.length<step.k)session.s.push(null);
  session.s[step.k]=[kg,Math.round(reps*10)/10];session.target=Math.max(session.target||0,step.n);delete workout.drafts[workoutDraftKey(step)];
  logTouch(ex.id);logRefresh([ex.id]);workout.last=workout.index;
  if(already){workoutShow(workout.index);$('#wv-save-status').textContent='Изменения сохранены.';return;}
  const next=workoutFirstOpen(workout.queue,workout.index);
  if(next<0){workoutFinish();return;}
  if(step.rest>0){workout.next=next;workout.restTotal=step.rest;workout.restUntil=Date.now()+step.rest*1000;workoutShowRest();}
  else workoutShow(next);
  saveWorkout();
}
function workoutShowRest(){
  $('#wv-active').hidden=true;$('#wv-rest').hidden=false;$('#wv-finish').hidden=true;
  const next=workout.queue[workout.next];
  $('#wv-next-name').textContent=next.it.name;$('#wv-next-detail').textContent=`${next.phase} · подход ${next.k+1} из ${next.n} · ${next.it.rx.reps}${next.it.ex.kind?'':' повторов'}`;
  $('#wv-rest-note').textContent='Результат сохранён. Переходите дальше, когда будете готовы.';workoutTick();$('#wv-continue').focus();
}
function workoutFinish(){
  workout.restUntil=0;workout.next=-1;$('#wv-active').hidden=true;$('#wv-rest').hidden=true;$('#wv-finish').hidden=false;
  const n=workout.queue.filter(workoutValue).length,its=[...new Map(workout.queue.map(s=>[s.it.ex.id,s.it])).values()];
  $('#wv-finish-text').textContent=`Выполнено ${n} ${plural(n,'подход','подхода','подходов')} в ${its.length} ${plural(its.length,'упражнении','упражнениях','упражнениях')}.`;
  $('#wv-summary').innerHTML=its.map(it=>`<p><span>${esc(it.name)}</span><strong>${workout.queue.filter(s=>s.it.ex.id===it.ex.id&&workoutValue(s)).length} ✓</strong></p>`).join('');saveWorkout();workoutTick();
}
function workoutTick(){
  if(!workout)return;
  const n=workout.queue.filter(workoutValue).length;$('#wv-progress').max=workout.queue.length;$('#wv-progress').value=n;$('#wv-progress-label').textContent=`${n} из ${workout.queue.length} подходов`;
  const elapsed=Math.max(0,Math.floor((Date.now()-workout.started)/60000));$('#wv-elapsed').textContent=elapsed?`${elapsed} мин с начала`:'';
  if(!$('#wv-rest').hidden){const left=Math.max(0,Math.ceil((workout.restUntil-Date.now())/1000));$('#wv-rest-time').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;$('#wv-rest-heading').textContent=left?'Отдых':'Можно продолжать';}
}
function setupWorkout(){
  $('#wv-form').addEventListener('submit',commitWorkout);
  for(const id of ['wv-kg','wv-reps'])$('#'+id).addEventListener('input',()=>{workoutCapture();$('#wv-error').textContent='';$('#'+id).removeAttribute('aria-invalid');});
  $('#wv-exercise').addEventListener('change',e=>{workoutCapture();const i=workout.queue.findIndex(s=>s.it.ex.id===e.target.value&&!workoutValue(s));workoutShow(i>=0?i:workout.queue.findIndex(s=>s.it.ex.id===e.target.value));});
  $('#workout-view').addEventListener('cancel',e=>{e.preventDefault();closeWorkout();});
  document.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.id==='start-workout'||t.dataset.workout!==undefined){startWorkout(t.dataset.workout);return;}
    if(!workout||!$('#workout-view').open)return;
    if(t.id==='wv-close'||t.id==='wv-finish-close'){closeWorkout();return;}
    if(t.id==='wv-prev'||t.id==='wv-next'){workoutCapture();workoutShow(workout.index+(t.id==='wv-next'?1:-1));return;}
    if(t.dataset.wvIndex!==undefined){workoutCapture();workoutShow(Number(t.dataset.wvIndex));return;}
    if(t.id==='wv-review'){workoutShow(0);return;}
    if(t.id==='wv-undo'){workoutShow(workout.last);return;}
    if(t.id==='wv-continue'){workoutShow(workout.next);return;}
    if(t.dataset.wvRest){workout.restUntil=Math.max(Date.now(),workout.restUntil+Number(t.dataset.wvRest)*1000);saveWorkout();workoutTick();return;}
    if(t.id==='wv-motion'){const m=workout.motion;m.paused=!m.paused;t.textContent=m.paused?'Воспроизвести':'Пауза';t.setAttribute('aria-pressed',String(!m.paused));return;}
    if(t.id==='wv-technique'){workoutCapture();if(workout.motion)openMotionItem(workout.motion.it,workout.motion.clock);}
  });
}

function motionCamera(ex){
 const cameras=ex.anim.catalogCameras||ex.anim.cameras||[],saved=motionPrefs.views?.[ex.id];
 return cameras.includes(saved)?saved:ex.anim.catalogRig?'above':ex.anim.camera||ex.anim.view;
}
function cameraButtons(ex,current){
 return (ex.anim.catalogCameras||ex.anim.cameras||[]).map(key=>`<button type="button" data-motion-camera="${key}" aria-pressed="${current===key}">${CAMERA3[key].label}</button>`).join('');
}
function rememberCamera(ex,key){
 if(!(ex.anim.catalogCameras||ex.anim.cameras)?.includes(key))return false;
 motionPrefs.views=Object.assign({},motionPrefs.views,{[ex.id]:key});saveMotionPrefs();return true;
}
function mountDetailCameras(){
 if(!detailMotion)return;
 const F=detailMotion,ex=F.it.ex,a=ex.anim,key=motionCamera(ex),cameras=a.catalogCameras||a.cameras||[];
 disposeMotion(F);
 const m=motionFrame(F),make=camera=>{
  const f=createMotionFigure(a,{primary:ex.pri,has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera,muscles:motionPrefs.muscles});
  f.svg.classList.toggle('show-joints',!!motionPrefs.joints);f.setTrace(!!motionPrefs.trace);f.setVectors(!!motionPrefs.vectors);return f;
 };
 F.f=make(key);$('#mv-stage').replaceChildren(F.f.svg);
 $('#mv-camera-controls').hidden=cameras.length<2;
 $('#mv-cameras').innerHTML=cameraButtons(ex,key);
 $('#mv-view').textContent=CAMERA3[key]?.label||ex.viewNote||(a.view==='front'?'Вид спереди':'Вид сбоку');
 $('#mv-camera-hint').textContent=a.cameraHints?.[key]||'';
 $('#mv-camera-hint').hidden=!a.cameraHints;
 const pair=cameras.length>1&&!!motionPrefs.dual;
 $('#mv-dual').checked=!!motionPrefs.dual;$('#mv-second').hidden=!pair;$('#mv-projections').classList.toggle('is-dual',pair);
 F.extra=null;
 if(pair){
  const preferred=motionProfile(a)?.pair,other=preferred!==key&&cameras.includes(preferred)?preferred:cameras.find(c=>c!==key);F.extra=make(other);$('#mv-second-stage').replaceChildren(F.extra.svg);
  $('#mv-second-label').textContent=CAMERA3[other].label;$('#mv-second-hint').textContent=a.cameraHints?.[other]||'';
 }else $('#mv-second-stage').replaceChildren();
 configureMusclePanel('mv',F.it);paintMotion(F,true);
}
function mountWorkoutCameras(){
 if(!workout?.motion)return;
 const F=workout.motion,ex=F.it.ex,key=motionCamera(ex),m=motionFrame(F);
 disposeMotion(F);F.f=createMotionFigure(ex.anim,{has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera:key,muscles:motionPrefs.muscles});F.f.setVectors(!!motionPrefs.vectors);
 $('#wv-stage').replaceChildren(F.f.svg);$('#wv-cameras').innerHTML=cameraButtons(ex,key);$('#wv-cameras').hidden=!(ex.anim.catalogCameras||ex.anim.cameras);
 $('#wv-angle').textContent=CAMERA3[key]?.label||(ex.anim.view==='front'?'Вид спереди':'Вид сбоку');configureMusclePanel('wv',F.it);paintWorkoutMotion();
}
function setupMotionCameras(){
 $('#mv-cameras').addEventListener('click',e=>{const b=e.target.closest('[data-motion-camera]');if(b&&detailMotion&&rememberCamera(detailMotion.it.ex,b.dataset.motionCamera))mountDetailCameras();});
 $('#wv-cameras').addEventListener('click',e=>{const b=e.target.closest('[data-motion-camera]');if(b&&workout?.motion&&rememberCamera(workout.motion.it.ex,b.dataset.motionCamera))mountWorkoutCameras();});
 $('#mv-dual').addEventListener('change',e=>{motionPrefs.dual=e.target.checked;saveMotionPrefs();mountDetailCameras();});
}

/* ===================== АВТОРЕГУЛИРОВКА ===================== */
/* Решения принимаются по журналу. Правила:
   1. Застой: 3 последние тренировки по упражнению без роста расчётного максимума (±1%) и без выхода на верх диапазона → заменить упражнение или поработать в другом диапазоне.
   2. Недобор: 2 последние тренировки подряд ниже нижней границы повторов → снизить вес (это уже делает подсказка) — здесь только отмечаем.
   3. Усталость: за последние 10 дней не меньше 4 записей, и в половине из них хотя бы один подход ниже нижней границы → внеплановая разгрузка.
   4. Пропуск: последняя запись старше 14 дней при наличии истории → мягкий возврат: веса на 10% ниже. */
const AR = {dismissed:{}, light:false};
try { Object.assign(AR, JSON.parse(localStorage.getItem('podhod.autoreg.v1') || '{}')); } catch (e) {}
function arSave() { try { localStorage.setItem('podhod.autoreg.v1', JSON.stringify({dismissed:AR.dismissed, light:AR.light})); } catch (e) {} }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

function exerciseStall(it) {
  const ex = it.ex, past = pastSessions(ex.id);
  if (past.length < 3 || ex.kind || loadType(ex) !== 'kg') return null;
  const m = metricOf(ex), [lo, hi] = parseRange(it.rx.reps);
  const last3 = past.slice(-3), vals = last3.map(m.f);
  if (vals.some(v => v == null)) return null;
  const grew = vals[2] > vals[0] * 1.01 || vals[2] > vals[1] * 1.01;
  const topReached = last3.some(s => { const sets = s.s.filter(Boolean); const w = Math.max(...sets.map(x => x[0] || 0)); return sets.filter(x => x[0] === w).every(x => x[1] >= hi); });
  if (grew || topReached) return null;
  return {kind:'stall', ex, since:last3[0].d, text:`${ex.name}: три тренировки подряд без роста (${fmtDay(last3[0].d, true)} — ${fmtDay(last3[2].d, true)}). Смените упражнение на 3–4 недели или поработайте в диапазоне ${hi + 2}–${hi + 5} повторов с меньшим весом.`};
}
function fatigueCheck(items) {
  const today = todayKey(), cutoff = dayKey(new Date(Date.now() - 10 * 86400000));
  let n = 0, low = 0;
  const seen = new Set();
  for (const [id, ss] of Object.entries(LOG.data)) {
    const ex = EXI[id]; if (!ex || ex.kind) continue;
    const it = items.find(x => x.ex.id === id);
    const [lo] = parseRange(it ? it.rx.reps : GOALS[S.goal].reps[ex.type]);
    for (const s of ss) {
      if (s.d < cutoff || s.d >= today || !s.s.some(Boolean)) continue;
      n++; seen.add(s.d);
      if (s.s.filter(Boolean).some(x => x[1] < lo)) low++;
    }
  }
  if (n < 4 || low * 2 < n) return null;
  return {kind:'fatigue', n, low, text:`За 10 дней в ${low} из ${n} записей не дотянули до нижней границы повторов. Похоже на накопленную усталость: возьмите разгрузочную неделю — подходов на 40% меньше, веса на 10–15% ниже.`};
}
function layoffCheck() {
  let last = '';
  for (const ss of Object.values(LOG.data)) for (const s of ss) if (s.s.some(Boolean) && s.d > last && s.d < todayKey()) last = s.d;
  if (!last) return null;
  const gap = daysBetween(last, todayKey());
  if (gap < 14) return null;
  return {kind:'layoff', gap, text:`Последняя запись ${fmtDay(last, true)}, перерыв ${gap} ${plural(gap, 'день', 'дня', 'дней')}. Первую тренировку после перерыва проведите на весах на 10% ниже прежних, затем возвращайтесь по правилу прибавок.`};
}
function autoreg() {
  if (!plan || !plan.items) return [];
  const out = [];
  const lay = layoffCheck(); if (lay) out.push(lay);
  const fat = !lay && fatigueCheck(plan.items); if (fat) out.push(fat);
  if (!fat && !lay) for (const it of plan.items) { const st = exerciseStall(it); if (st) out.push(st); }
  return out.filter(r => !AR.dismissed[arKey(r)]);
}
function arKey(r) { return r.kind === 'stall' ? 'stall:' + r.ex.id + ':' + r.since : r.kind + ':' + todayKey().slice(0, 7); }
function autoregHtml() {
  const recs = autoreg();
  const items = recs.map(r => {
    const key = arKey(r);
    let act = '';
    if (r.kind === 'stall') act = `<button type="button" class="btn-ghost" data-ar-swap="${r.ex.id}">${ICON.swap}<span>Заменить</span></button>`;
    else if (r.kind === 'fatigue') act = S.mode === 'program' ? `<button type="button" class="btn-ghost" data-ar-deload="1">Включить разгрузку</button>` : `<button type="button" class="btn-ghost" data-ar-light="1">${AR.light ? 'Вернуть обычный объём' : 'Облегчить тренировку'}</button>`;
    return `<li><span class="ar-i ar-${r.kind}" aria-hidden="true"></span><p>${esc(r.text)}</p><div class="ar-act">${act}<button type="button" class="lk" data-ar-dismiss="${esc(key)}">Скрыть</button></div></li>`;
  }).join('');
  if (!items && !AR.light) return '';
  const lightNote = AR.light ? `<li><span class="ar-i ar-fatigue" aria-hidden="true"></span><p>Облегчённый режим: подходов на 40% меньше, подсказки весов на 10% ниже. Действует, пока вы его не выключите.</p><div class="ar-act"><button type="button" class="btn-ghost" data-ar-light="1">Вернуть обычный объём</button></div></li>` : '';
  return `<section class="ar" aria-label="Рекомендации по нагрузке"><h2>По вашему журналу</h2><ul>${items}${lightNote}</ul></section>`;
}
/* облегчённый режим влияет на дозировку в одиночном режиме */
function applyLight(rx, ex) {
  if (!AR.light || S.mode === 'program') return rx;
  if (!rx.circ) rx.sets = Math.max(2, Math.ceil(rx.sets * 0.6));
  rx.light = true;
  return rx;
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.arDismiss) { AR.dismissed[t.dataset.arDismiss] = true; arSave(); renderPlan(); return; }
  if (t.dataset.arSwap) {
    const it = plan.items.find(x => x.ex.id === t.dataset.arSwap); if (!it) return;
    const btn = document.querySelector(`.card[data-ex="${it.ex.id}"] [data-swap]`); if (btn) btn.click();
    return;
  }
  if (t.dataset.arDeload) { S.week = 4; AR.dismissed['fatigue:' + todayKey().slice(0, 7)] = true; arSave(); saveSettings(); renderPlan(); return; }
  if (t.dataset.arLight) { AR.light = !AR.light; if (AR.light) AR.dismissed['fatigue:' + todayKey().slice(0, 7)] = true; arSave(); renderPlan(); return; }
});

/* ===================== ЭКСПОРТ В КАЛЕНДАРЬ ===================== */
const ICS_KEY = 'podhod.ics.v1';
const ICS = {time:'19:00', weeks:4, alarm:60};
try { Object.assign(ICS, JSON.parse(localStorage.getItem(ICS_KEY) || '{}')); } catch (e) {}
function nextMonday() { const d = new Date(); d.setHours(12, 0, 0, 0); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() + (dow === 0 ? 0 : 7 - dow)); return d; }
const pad2 = n => String(n).padStart(2, '0');
const icsDate = d => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
function icsFold(line) { const out = []; let b = ''; for (const ch of line) { const t = new TextEncoder().encode(b + ch).length; if (t > 72) { out.push(b); b = ' ' + ch; } else b += ch; } out.push(b); return out.join('\r\n'); }
function icsText(start, time, weeksN) {
  const [hh, mm] = time.split(':').map(Number);
  const saved = {week:S.week, day:S.day};
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LazyGymPlanner//Workout planner//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Lazy Gym Planner — тренировки'];
  const stamp = icsDate(new Date()).replace(/T.*/, 'T000000Z');
  for (let w = 0; w < weeksN; w++) {
    S.week = (w % 4) + 1;
    const pr = buildProgram();
    for (const d of pr.days) {
      if (!d.plan.items) continue;
      const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d.wd); dt.setHours(hh, mm, 0, 0);
      const end = new Date(dt.getTime() + Math.max(30, d.plan.minutes + 15) * 60000);
      const title = `Тренировка: ${d.name} · неделя ${S.week} (${pr.week.name.toLowerCase()})`;
      const body = [`${GOALS[S.goal].name}, ${FORMATS[S.format].name.toLowerCase()}, ≈${d.plan.minutes} мин`, pr.week.note, ''].concat(blocksText(d.plan)).join('\n');
      lines.push('BEGIN:VEVENT', `UID:podhod-${icsDate(dt)}-${d.tid}@podhod`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(dt)}`, `DTEND:${icsDate(end)}`,
        icsFold(`SUMMARY:${icsEsc(title)}`), icsFold(`DESCRIPTION:${icsEsc(body)}`), 'CATEGORIES:Тренировка');
      if (ICS.alarm > 0) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', icsFold(`DESCRIPTION:${icsEsc('Через ' + (ICS.alarm >= 60 ? ICS.alarm / 60 + ' ч' : ICS.alarm + ' мин') + ' тренировка: ' + d.name)}`), `TRIGGER:-PT${ICS.alarm}M`, 'END:VALARM');
      lines.push('END:VEVENT');
    }
  }
  lines.push('END:VCALENDAR');
  S.week = saved.week; S.day = saved.day;
  return lines.join('\r\n') + '\r\n';
}
function icsDialogHtml() {
  const mon = nextMonday();
  const sched = SCHEDULE[S.days].map(i => WD[i]).join(', ');
  return `<form method="dialog" class="gear ics">
    <h2>В календарь</h2>
    <p class="gear-hint">Файл .ics с тренировками по дням сплита (${sched}) на ${ICS.weeks} ${plural(ICS.weeks, 'неделю', 'недели', 'недель')} цикла. Откройте его в календаре телефона или компьютера — события добавятся с напоминанием и текстом тренировки.</p>
    <div class="ics-grid">
      <label>Первый понедельник<input id="ics-start" type="date" value="${dayKey(mon)}"></label>
      <label>Время начала<input id="ics-time" type="time" value="${ICS.time}"></label>
      <label>Недель<select id="ics-weeks">${[4, 8, 12].map(n => `<option value="${n}"${n === ICS.weeks ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>Напоминание<select id="ics-alarm">${[[0, 'без'], [30, 'за 30 мин'], [60, 'за час'], [120, 'за 2 часа'], [720, 'за 12 часов']].map(([v, n]) => `<option value="${v}"${v === ICS.alarm ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    </div>
    <p class="gear-hint">Тренировки ставятся на дни недели из сплита. После 4-й недели цикл повторяется с первой.</p>
    <p class="p-hint" id="ics-msg" role="status"></p>
    <div class="gear-btns"><button type="button" class="btn btn-2" id="ics-cancel">Закрыть</button><button type="button" class="btn" id="ics-save">Сохранить файл</button></div>
  </form>`;
}
function openIcs() {
  let d = $('#ics-view');
  if (!d) { d = document.createElement('dialog'); d.id = 'ics-view'; d.className = 'gear-view'; document.body.appendChild(d); }
  d.innerHTML = icsDialogHtml(); d.showModal();
}
async function saveIcs() {
  const start = new Date($('#ics-start').value + 'T12:00:00');
  if (isNaN(start)) { $('#ics-msg').textContent = 'Укажите дату начала.'; return; }
  ICS.time = $('#ics-time').value || '19:00'; ICS.weeks = +$('#ics-weeks').value || 4; ICS.alarm = +$('#ics-alarm').value || 0;
  try { localStorage.setItem(ICS_KEY, JSON.stringify(ICS)); } catch (e) {}
  const txt = icsText(start, ICS.time, ICS.weeks);
  const r = await saveFile(`lazy-gym-workouts-${dayKey(start)}.ics`, txt, 'text/calendar');
  $('#ics-msg').textContent = r === 'ok' ? 'Файл сохранён. Откройте его — календарь предложит добавить события.' : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не удалось.';
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'ics-open') { openIcs(); return; }
  if (t.id === 'ics-cancel') { $('#ics-view').close(); return; }
  if (t.id === 'ics-save') { saveIcs(); return; }
});

/* ===================== РАЗМИНКА И БЛИНЫ ===================== */
const GEAR_KEY = 'podhod.gear.v1';
const GEAR = {bar:20, plates:[25, 20, 15, 10, 5, 2.5, 1.25], dbStep:2, machineStep:5};
const PLATE_SETS = {
  std:{name:'Стандарт', plates:[25, 20, 15, 10, 5, 2.5, 1.25]},
  home:{name:'Домашний', plates:[20, 10, 5, 2.5, 1.25]},
  fine:{name:'С мелкими', plates:[25, 20, 15, 10, 5, 2.5, 1.25, 0.5]}
};
function gearLoad() { try { const g = JSON.parse(localStorage.getItem(GEAR_KEY) || 'null'); if (g && typeof g === 'object') { if (isFinite(g.bar)) GEAR.bar = +g.bar; if (Array.isArray(g.plates)) GEAR.plates = g.plates.map(Number).filter(v => v > 0).sort((a, b) => b - a); } } catch (e) {} }
function gearSave() { try { localStorage.setItem(GEAR_KEY, JSON.stringify({bar:GEAR.bar, plates:GEAR.plates})); } catch (e) {} }
gearLoad();

/* чем нагружают: штанга (гриф + блины), гантели, тренажёр (стек), гиря */
function implementOf(it) {
  const ids = it.eqIds || [];
  if (ids.includes('bb') || ids.includes('smith')) return 'bb';
  if (ids.includes('db')) return 'db';
  if (ids.includes('kb')) return 'kb';
  if (ids.some(i => MACHINE.has(i) || i === 'legpress')) return 'machine';
  return null;
}
/* раскладка блинов на одну сторону грифа; возвращает {side:[...], total, diff} */
function plateSplit(target, bar = GEAR.bar, plates = GEAR.plates) {
  let perSide = (target - bar) / 2, side = [];
  if (perSide <= 0) return {side, total:bar, diff:target - bar};
  for (const p of plates) while (perSide >= p - 1e-9) { side.push(p); perSide -= p; }
  const total = bar + 2 * side.reduce((a, b) => a + b, 0);
  return {side, total, diff:target - total};
}
/* ближайший достижимый вес (вниз) */
function roundToGear(target, impl) {
  if (impl === 'bb') return plateSplit(target).total;
  if (impl === 'db') return Math.round(target / GEAR.dbStep) * GEAR.dbStep;
  if (impl === 'machine') return Math.round(target / GEAR.machineStep) * GEAR.machineStep;
  if (impl === 'kb') return Math.round(target / 4) * 4;
  return Math.round(target * 2) / 2;
}
/* пирамида разминки: от грифа/лёгкого к рабочему; число шагов зависит от веса */
function warmupPlan(work, impl, reps) {
  if (!work || work <= 0) return [];
  const [lo] = parseRange(reps);
  const steps = [];
  if (impl === 'bb') {
    if (work <= GEAR.bar * 1.6) return [{kg:GEAR.bar, reps:Math.max(8, lo + 4), note:'пустой гриф'}];
    steps.push({kg:GEAR.bar, reps:10, note:'пустой гриф'});
  }
  const ratios = work >= 140 ? [0.4, 0.6, 0.75, 0.9] : work >= 90 ? [0.5, 0.7, 0.85] : work >= 50 ? [0.55, 0.8] : [0.6];
  const repsFor = r => r < 0.55 ? 8 : r < 0.72 ? 5 : r < 0.87 ? 3 : 1;
  for (const r of ratios) {
    const kg = roundToGear(work * r, impl);
    if (kg <= (steps.length ? steps[steps.length - 1].kg : 0) || kg >= work) continue;
    steps.push({kg, reps:repsFor(r), note:`${Math.round(r * 100)}%`});
  }
  return steps;
}
function platesHtml(target) {
  const s = plateSplit(target);
  if (!s.side.length && s.diff <= 0) return `<span class="pl-empty">пустой гриф ${fmtKg(GEAR.bar)}</span>`;
  const chips = s.side.map(p => `<i class="pl pl-${String(p).replace('.', '_')}" title="${fmtKg(p)} кг">${fmtKg(p)}</i>`).join('');
  const warn = s.diff > 0.01 ? `<small class="pl-diff">= ${fmtKg(s.total)}, не хватает ${fmtKg(s.diff)}</small>` : '';
  return `<span class="pl-row" aria-label="На каждую сторону: ${s.side.map(fmtKg).join(', ')} кг">${chips}</span>${warn}`;
}
function warmupHtml(it, work) {
  const impl = implementOf(it);
  if (!impl || !work) return '';
  const steps = warmupPlan(work, impl, it.rx.reps);
  if (!steps.length) return '';
  const rows = steps.map((s, i) => `<li><span class="wu-n">${i + 1}</span><span class="wu-kg">${fmtKg(s.kg)}<small>кг</small></span><span class="wu-r">× ${s.reps}</span><span class="wu-note">${s.note}</span>${impl === 'bb' ? `<span class="wu-pl">${s.note === 'пустой гриф' ? '' : platesHtml(s.kg)}</span>` : ''}</li>`).join('');
  const workRow = impl === 'bb' ? `<li class="wu-work"><span class="wu-n">→</span><span class="wu-kg">${fmtKg(work)}<small>кг</small></span><span class="wu-r">рабочий</span><span class="wu-note"></span><span class="wu-pl">${platesHtml(work)}</span></li>` : '';
  return `<details class="wu"><summary>Разминка к ${fmtKg(work)} кг<small>${steps.length} ${plural(steps.length, 'подход', 'подхода', 'подходов')}${impl === 'bb' ? ' · блины на сторону' : ''}</small></summary>
    <ol class="wu-list${impl === 'bb' ? ' wu-bb' : ''}">${rows}${workRow}</ol>
    <p class="wu-note-f">Отдых между разминочными 30–60 с. ${impl === 'bb' ? `Гриф ${fmtKg(GEAR.bar)} кг, блины: ${GEAR.plates.map(fmtKg).join(' · ')} — <button type="button" class="lk" data-gear="1">настроить</button>.` : impl === 'machine' ? 'Шаг стека принят 5 кг.' : ''}</p>
  </details>`;
}
/* рабочий вес для разминки: из первого введённого поля, иначе из подсказки */
function workWeightOf(it, card) {
  if (card) { const inp = card.querySelector('.lt-r:not(.done) [data-f="kg"], .lt-r [data-f="kg"]'); if (inp && inp.value) { const v = parseNum(inp.value); if (v > 0) return v; } }
  const sg = suggest(it); return sg.kg && sg.kg > 0 ? sg.kg : null;
}
function refreshWarmup(card) {
  if (!plan || !plan.items) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex); if (!it) return;
  const box = card.querySelector('.c-warm'); if (!box) return;
  const open = box.querySelector('details') && box.querySelector('details').open;
  box.innerHTML = warmupHtml(it, workWeightOf(it, card));
  if (open && box.querySelector('details')) box.querySelector('details').open = true;
}
/* настройка инвентаря */
function gearDialogHtml() {
  const cur = Object.entries(PLATE_SETS).find(([, v]) => v.plates.join() === GEAR.plates.join());
  return `<form method="dialog" class="gear">
    <h2>Гриф и блины</h2>
    <label>Вес грифа, кг<input id="gear-bar" type="text" inputmode="decimal" value="${fmtKg(GEAR.bar)}"></label>
    <p class="gear-l">Набор блинов</p>
    <div class="pres">${Object.entries(PLATE_SETS).map(([k, v]) => `<button type="button" class="pre${cur && cur[0] === k ? ' on' : ''}" data-pset="${k}">${v.name}</button>`).join('')}</div>
    <label>Свои блины, кг через запятую<input id="gear-plates" type="text" inputmode="decimal" value="${GEAR.plates.map(fmtKg).join(', ')}"></label>
    <p class="gear-hint">Калькулятор раскладывает блины на одну сторону от самого тяжёлого к лёгкому. Укажите те, что есть в зале.</p>
    <div class="gear-btns"><button type="button" class="btn btn-2" value="cancel" id="gear-cancel">Отмена</button><button type="submit" class="btn" id="gear-save">Сохранить</button></div>
  </form>`;
}
function openGear() {
  let d = $('#gear-view');
  if (!d) { d = document.createElement('dialog'); d.id = 'gear-view'; d.className = 'gear-view'; document.body.appendChild(d); }
  d.innerHTML = gearDialogHtml(); d.showModal();
  d.querySelector('form').addEventListener('submit', () => {
    const bar = parseNum($('#gear-bar').value); if (bar > 0) GEAR.bar = bar;
    const pl = $('#gear-plates').value.split(/[,;\s]+/).map(parseNum).filter(v => v > 0).sort((a, b) => b - a);
    if (pl.length) GEAR.plates = [...new Set(pl)];
    gearSave(); document.querySelectorAll('.card').forEach(refreshWarmup);
  });
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.gear) { openGear(); return; }
  if (t.dataset.pset) { $('#gear-plates').value = PLATE_SETS[t.dataset.pset].plates.map(fmtKg).join(', '); t.parentElement.querySelectorAll('.pre').forEach(b => b.classList.toggle('on', b === t)); return; }
  if (t.id === 'gear-cancel') { $('#gear-view').close(); return; }
});
document.addEventListener('input', e => {
  if (e.target.classList && e.target.classList.contains('lt-in') && e.target.dataset.f === 'kg') {
    const card = e.target.closest('.card'); if (card) { clearTimeout(card._wuT); card._wuT = setTimeout(() => refreshWarmup(card), 400); }
  }
});

/* ===================== ТЕЛО: ВЕС И ЗАМЕРЫ ===================== */
/* BODY.rows = [{d:'2026-10-06', kg:82.4, waist:88, …}] — одна запись на день, любые поля.
   Хранится в localStorage (podhod.body.v1) и, при входе в аккаунт, в документе «_body» той же коллекции, что журнал. */
const BODY_KEY = 'podhod.body.v1';
const BODY_FIELDS = [
  {k:'kg', name:'Вес', unit:'кг', main:true},
  {k:'waist', name:'Талия', unit:'см'}, {k:'chest', name:'Грудь', unit:'см'}, {k:'hips', name:'Таз', unit:'см'},
  {k:'arm', name:'Бицепс', unit:'см'}, {k:'thigh', name:'Бедро', unit:'см'}, {k:'calf', name:'Голень', unit:'см'}, {k:'neck', name:'Шея', unit:'см'}
];
const BODY = {rows:[], pending:false, writing:false, again:false};
function validBodyRows(rows) { return Array.isArray(rows) && rows.every(r => r && typeof r.d === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.d)); }
function cleanBodyRow(r) { const o = {d:r.d}; for (const f of BODY_FIELDS) { const v = parseNum(r[f.k]); if (v != null && v > 0 && v < 1000) o[f.k] = Math.round(v * 10) / 10; } return o; }
function bodyHasValues(r) { return BODY_FIELDS.some(f => r[f.k] != null); }
function bodyLoad() { try { const s = JSON.parse(localStorage.getItem(BODY_KEY) || 'null'); if (s && validBodyRows(s.rows)) BODY.rows = s.rows.map(cleanBodyRow).filter(bodyHasValues); } catch (e) {} }
function bodySaveLocal() { try { localStorage.setItem(BODY_KEY, JSON.stringify({rows:BODY.rows})); } catch (e) {} }
/* объединение по дате: поля складываются, при совпадении приоритет у b */
function mergeBodyRows(a, b) {
  const by = new Map();
  for (const r of a || []) by.set(r.d, {...r});
  for (const r of b || []) by.set(r.d, {...(by.get(r.d) || {}), ...r});
  return [...by.values()].filter(bodyHasValues).sort((p, q) => p.d < q.d ? -1 : 1).slice(-400);
}
/* синхронизация с аккаунтом: вызывается из logInit при каждом снимке коллекции */
function bodyRemote(doc, first) {
  const remote = doc && validBodyRows(doc.rows) ? doc.rows.map(cleanBodyRow).filter(bodyHasValues) : [];
  if (first) {
    const merged = mergeBodyRows(remote, BODY.rows);
    if (JSON.stringify(merged) !== JSON.stringify(remote)) { BODY.rows = merged; bodyTouch(true); } else BODY.rows = remote;
  } else {
    if (BODY.pending || JSON.stringify(remote) === JSON.stringify(BODY.rows)) return;
    BODY.rows = remote;
  }
  bodySaveLocal();
  if (S.view === 'journal' && !$('#b-form input:focus')) renderJournal();
}
function bodyTouch(now) {
  bodySaveLocal();
  if (LOG.mode !== 'cloud' || !LOG.col) return;
  BODY.pending = true;
  clearTimeout(BODY.timer);
  BODY.timer = setTimeout(bodyFlush, now ? 0 : 800);
}
async function bodyFlush(retried) {
  if (BODY.writing) { BODY.again = true; return; }
  BODY.writing = true;
  try {
    if (BODY.rows.length) await LOG.col.doc('_body').set({ex:'_body', rows:BODY.rows});
    else await LOG.col.doc('_body').delete();
  } catch (e) {
    if (e && e.code === 'unavailable' && !retried) { BODY.writing = false; setTimeout(() => bodyFlush(true), 800); return; }
    LOG.err = 'Сохранить замеры в аккаунт не получилось — они остаются в этом браузере.'; logRefresh(null);
  } finally {
    BODY.writing = false;
    if (BODY.again) { BODY.again = false; bodyFlush(); } else BODY.pending = false;
  }
}
function bodyLatest(k) { for (let i = BODY.rows.length - 1; i >= 0; i--) if (BODY.rows[i][k] != null) return BODY.rows[i]; return null; }
/* изменение за период: сравниваем последнее значение с ближайшим не позже cutoff */
function bodyDelta(k, days) {
  const last = bodyLatest(k); if (!last) return null;
  const cutoff = dayKey(new Date(new Date(last.d + 'T12:00:00') - days * 86400000));
  const prev = [...BODY.rows].reverse().find(r => r[k] != null && r.d <= cutoff && r.d !== last.d);
  return prev ? {v:Math.round((last[k] - prev[k]) * 10) / 10, from:prev.d} : null;
}
const fmtDelta = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + fmtKg(Math.abs(v));
/* окраска изменения веса зависит от цели: на массе рост — хорошо, на рельефе — наоборот; на силе нейтрально */
function deltaClass(v) { const g = S.goal === 'mass' ? 1 : S.goal === 'cut' ? -1 : 0; return !g || !v ? '' : v * g > 0 ? 'good' : 'bad'; }
function bodyHtml() {
  const last = bodyLatest('kg'), d4 = bodyDelta('kg', 28);
  const pts = BODY.rows.filter(r => r.kg != null).slice(-40).map(r => ({d:r.d, v:r.kg}));
  const chips = BODY_FIELDS.filter(f => !f.main).map(f => { const l = bodyLatest(f.k); if (!l) return ''; const dl = bodyDelta(f.k, 28); return `<li><span>${f.name}</span><b>${fmtKg(l[f.k])}<small>${f.unit}</small></b>${dl && dl.v ? `<em>${fmtDelta(dl.v)}</em>` : ''}</li>`; }).join('');
  const form = `<form class="b-form" id="b-form" autocomplete="off">
    <label class="b-date">Дата<input type="date" id="b-date" value="${todayKey()}" max="${todayKey()}" required></label>
    ${BODY_FIELDS.map(f => { const l = bodyLatest(f.k); return `<label${f.main ? ' class="b-main"' : ''}>${f.name}, ${f.unit}<input class="lt-in" type="text" inputmode="decimal" data-bf="${f.k}" placeholder="${l ? fmtKg(l[f.k]) : '—'}" aria-label="${f.name}, ${f.unit}"></label>`; }).join('')}
    <button type="submit" class="btn">Записать</button>
    <p class="b-hint">Заполняйте то, что измерили: вес — утром натощак, обхваты — сантиметровой лентой без натяжения, в одних и тех же точках. Остальное можно оставить пустым.</p>
  </form>`;
  const rows = [...BODY.rows].reverse();
  const rowHtml = r => `<li><span class="h-d">${fmtDay(r.d, true)}</span><span class="h-s">${BODY_FIELDS.filter(f => r[f.k] != null).map(f => `${f.main ? '' : f.name.toLowerCase() + ' '}${fmtKg(r[f.k])}${f.main ? ' кг' : ''}`).join(' · ')}</span><button type="button" class="h-del" data-bdel="${r.d}" aria-label="Удалить замер за ${fmtDay(r.d, true)}">Удалить</button></li>`;
  const list = rows.length ? `<ul class="h-list b-list">${rows.slice(0, 6).map(rowHtml).join('')}</ul>${rows.length > 6 ? `<details class="j-all"><summary>Все замеры (${rows.length})</summary><ul class="h-list b-list">${rows.slice(6).map(rowHtml).join('')}</ul></details>` : ''}` : '';
  return `<section class="b-sec" aria-labelledby="b-title">
    <div class="b-head">
      <div>
        <p class="eyebrow">Тело</p>
        <h2 id="b-title">Вес и замеры</h2>
        ${last ? `<p class="b-now"><b>${fmtKg(last.kg)}<small>кг</small></b>${d4 && d4.v ? `<em class="${deltaClass(d4.v)}">${fmtDelta(d4.v)} за 4 нед.</em>` : `<em>${fmtDay(last.d, true)}</em>`}</p>` : `<p class="b-empty">Записей о весе пока нет. Взвешивайтесь раз в неделю в одно и то же время — по графику будет видно, куда идёт масса, а не дневные колебания воды.</p>`}
        ${chips ? `<ul class="b-chips">${chips}</ul>` : ''}
      </div>
      ${pts.length > 1 ? `<div class="h-chart b-chart"><p class="h-cap">Вес, кг · ${pts.length} ${plural(pts.length, 'запись', 'записи', 'записей')}</p>${sparkSvg(pts, 'кг', 0.1)}</div>` : ''}
    </div>
    ${form}
    ${list}
  </section>`;
}
function bodySubmit(form) {
  const d = $('#b-date').value;
  if (!/^\d{4}-\d\d-\d\d$/.test(d) || d > todayKey()) { $('#b-date').focus(); return; }
  const row = {d};
  let any = false;
  form.querySelectorAll('[data-bf]').forEach(inp => { const v = parseNum(inp.value); if (v != null && v > 0) { row[inp.dataset.bf] = v; any = true; } });
  if (!any) { const f = form.querySelector('[data-bf="kg"]'); f.classList.add('need'); f.focus(); setTimeout(() => f.classList.remove('need'), 1200); return; }
  BODY.rows = mergeBodyRows(BODY.rows, [cleanBodyRow(row)]);
  bodyTouch(false);
  renderJournal();
  const m = $('#j-msg'); if (m) m.textContent = `Замер за ${fmtDay(d, true)} записан.`;
}
function bodyDelete(btn) {
  if (!btn.classList.contains('armed')) { btn.classList.add('armed'); btn.textContent = 'Точно удалить?'; setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Удалить'; }, 3000); return; }
  BODY.rows = BODY.rows.filter(r => r.d !== btn.dataset.bdel);
  bodyTouch(false); renderJournal();
}
function bodyCsv() {
  const head = ['Дата'].concat(BODY_FIELDS.map(f => `${f.name}, ${f.unit}`));
  const rows = BODY.rows.map(r => [r.d].concat(BODY_FIELDS.map(f => r[f.k] != null ? fmtKg(r[f.k]) : '')));
  return '﻿' + [head].concat(rows).map(r => r.join(';')).join('\r\n');
}
document.addEventListener('submit', e => { if (e.target.id === 'b-form') { e.preventDefault(); bodySubmit(e.target); } });
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.bdel) { bodyDelete(t); return; }
  if (t.id === 'exp-body') { saveFile(`lazy-gym-body-${todayKey()}.csv`, bodyCsv(), 'text/csv').then(r => { const m = $('#j-msg'); if (m) m.textContent = r === 'ok' ? 'Таблица замеров сохранена.' : r === 'declined' ? 'Сохранение отменено.' : 'Сохранить файл не удалось.'; }); }
});
bodyLoad();

/* ===================== ПОЛНАЯ РЕЗЕРВНАЯ КОПИЯ ===================== */
/* v2: настройки планировщика, инвентарь, авторегулировка, календарь, атлас, журнал и замеры. v1 (только журнал) тоже читается. */
function backupObject() {
  return {app:'podhod', v:2, exported:new Date().toISOString(), version:window.PODHOD_VERSION || '',
    settings:{...S}, gear:{bar:GEAR.bar, plates:GEAR.plates}, autoreg:{dismissed:AR.dismissed, light:AR.light}, ics:{...ICS}, motion:{...motionPrefs},
    log:LOG.data, body:BODY.rows};
}
function restoreBackup(obj) {
  const out = {sessions:0, exercises:0, body:0, settings:false};
  if (obj.log && typeof obj.log === 'object') {
    for (const [id, ss] of Object.entries(obj.log)) {
      if (!EXI[id] || !validSessions(ss)) continue;
      const clean = ss.map(x => ({d:x.d, ...(x.wk ? {wk:+x.wk} : {}),
        ...(Number.isSafeInteger(+x.target) && +x.target > 0 ? {target:+x.target} : {}),
        s:x.s.map(v => Array.isArray(v) && isFinite(+v[1]) ? [v[0] == null || v[0] === '' ? null : +v[0], +v[1]] : null)}));
      const merged = mergeSessions(LOG.data[id], clean);
      if (JSON.stringify(merged) !== JSON.stringify(LOG.data[id] || [])) { LOG.data[id] = merged; logTouch(id, true); out.exercises++; out.sessions += clean.length; }
    }
    logSaveLocal();
  }
  if (validBodyRows(obj.body)) {
    const merged = mergeBodyRows(BODY.rows, obj.body.map(cleanBodyRow).filter(bodyHasValues));
    if (JSON.stringify(merged) !== JSON.stringify(BODY.rows)) { out.body = merged.length - BODY.rows.length; BODY.rows = merged; bodyTouch(true); }
  }
  if (obj.v >= 2) {
    if (obj.settings && typeof obj.settings === 'object') {
      const s = obj.settings, ok = {};
      for (const k of Object.keys(DEFAULTS)) if (k in s && k !== 'view') ok[k] = s[k];
      if (Array.isArray(ok.groups)) ok.groups = ok.groups.filter(g => GROUPS.some(x => x.id === g));
      if (Array.isArray(ok.equip)) ok.equip = ok.equip.filter(id => EQUIP.some(x => x.id === id));
      if (!GOALS[ok.goal]) delete ok.goal; if (!FORMATS[ok.format]) delete ok.format; if (!LEVELS[ok.level]) delete ok.level;
      Object.assign(S, ok); saveSettings(); out.settings = true;
    }
    if (obj.gear && typeof obj.gear === 'object') { if (isFinite(obj.gear.bar) && obj.gear.bar > 0) GEAR.bar = +obj.gear.bar; if (Array.isArray(obj.gear.plates)) { const pl = obj.gear.plates.map(Number).filter(v => v > 0); if (pl.length) GEAR.plates = [...new Set(pl)].sort((a, b) => b - a); } gearSave(); }
    if (obj.autoreg && typeof obj.autoreg === 'object') { if (obj.autoreg.dismissed && typeof obj.autoreg.dismissed === 'object') AR.dismissed = obj.autoreg.dismissed; AR.light = !!obj.autoreg.light; arSave(); }
    if (obj.ics && typeof obj.ics === 'object') { Object.assign(ICS, obj.ics); try { localStorage.setItem(ICS_KEY, JSON.stringify(ICS)); } catch (e) {} }
    if (obj.motion && typeof obj.motion === 'object') { Object.assign(motionPrefs, obj.motion); saveMotionPrefs(); }
    S.view = 'journal';
    renderSetup();
  }
  return out;
}

/* ---------- запуск ---------- */
logLoadLocal();
setupMotionViewer();
setupWorkout();
setupMotionCameras();
renderSetup();
renderPlan();
logInit();

window.PODHOD_VERSION='4.2.0';window.PODHOD_LANG='ru';
