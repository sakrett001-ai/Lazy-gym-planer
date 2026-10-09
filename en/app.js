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
const MUSCLE_NAMES = {chest:'Chest', delt_f:'Front delt', delt_s:'Side delt', delt_r:'Rear delt', biceps:'Biceps', triceps:'Triceps',
  forearms:'Forearms', abs:'Abs (rectus abdominis)', obliques:'Obliques', traps:'Traps', midback:'Rhomboids & mid-back',
  lats:'Lats', lowback:'Lower back (spinal erectors)', glutes:'Glutes', quads:'Quads', hams:'Hamstrings', calves:'Calves'};

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
  return `<svg viewBox="0 0 206 ${H}" class="mmap" role="img" aria-label="${opts.aria || 'Muscle map'}">${view(MAP_FRONT, 0, 'front')}${view(MAP_BACK, 106, 'back')}</svg>`;
}

/* ===================== БАЗА УПРАЖНЕНИЙ ===================== */
const EQUIP = [
  {id:'db', name:'Dumbbells', cat:'free'}, {id:'bb', name:'Barbell', cat:'free'}, {id:'kb', name:'Kettlebell', cat:'free'},
  {id:'band', name:'Resistance band', cat:'free'}, {id:'abwheel', name:'Ab wheel', cat:'free'},
  {id:'bench', name:'Flat bench', cat:'bench'},
  {id:'incline', name:'Adjustable bench', cat:'bench', hint:'inclined and upright back; folds flat'},
  {id:'decline', name:'Decline bench', cat:'bench', hint:'head-down, with leg rollers; also works for abs'},
  {id:'abbench', name:'Ab bench', cat:'bench', hint:'inclined board with foot anchor'},
  {id:'preacher', name:'Preacher bench', cat:'bench', hint:'arm pad for biceps curls'},
  {id:'pullup', name:'Pull-up bar', cat:'bars'}, {id:'dipbars', name:'Dip bars', cat:'bars'},
  {id:'captain', name:'Captain\'s chair', cat:'bars', hint:'forearm pads and backrest, legs hang free'},
  {id:'cable', name:'Cable machine', cat:'mach'}, {id:'smith', name:'Smith machine', cat:'mach'}, {id:'legpress', name:'Leg press', cat:'mach'},
  {id:'legext', name:'Leg extension', cat:'mach'}, {id:'legcurl', name:'Leg curl', cat:'mach'}, {id:'pecdeck', name:'Pec deck', cat:'mach'},
  {id:'hyper', name:'Back extension', cat:'mach'}
];
const EQUIP_CATS = [{id:'free', name:'Free weights & gear'}, {id:'bench', name:'Benches'}, {id:'bars', name:'Bar & stations'}, {id:'mach', name:'Machines'}];
/* что даёт оборудование «в придачу»: регулируемая скамья раскладывается в горизонтальную, на скамье с обратным наклоном можно качать пресс */
const EQUIP_IMPLIES = {incline:['bench'], decline:['abbench']};
const EQUIP_PRESETS = [
  {id:'none', name:'No equipment', eq:[]},
  {id:'home', name:'Home', eq:['db', 'band', 'abwheel']},
  {id:'street', name:'Pull-up & dip bars', eq:['pullup', 'dipbars']},
  {id:'homegym', name:'Home gym', eq:['db', 'bb', 'kb', 'band', 'abwheel', 'incline', 'pullup', 'dipbars']},
  {id:'gym', name:'Gym', eq:EQUIP.map(e => e.id)}
];
const GROUPS = [
  {id:'chest', name:'Chest'}, {id:'back', name:'Back'}, {id:'shoulders', name:'Shoulders'}, {id:'biceps', name:'Biceps'},
  {id:'triceps', name:'Triceps'}, {id:'forearms', name:'Forearms'}, {id:'abs', name:'Abs'}, {id:'glutes', name:'Glutes'},
  {id:'quads', name:'Quads'}, {id:'hams', name:'Hamstrings'}, {id:'calves', name:'Calves'}, {id:'cardio', name:'Cardio'}
];
const GROUP_PRESETS = [
  {id:'push', name:'Push', g:['chest', 'shoulders', 'triceps']},
  {id:'pull', name:'Pull', g:['back', 'biceps', 'forearms']},
  {id:'legs', name:'Legs', g:['quads', 'hams', 'glutes', 'calves']},
  {id:'upper', name:'Upper', g:['chest', 'back', 'shoulders', 'biceps', 'triceps']},
  {id:'full', name:'Full body', g:['chest', 'back', 'shoulders', 'quads', 'hams', 'glutes', 'abs']}
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
{id:'pushup', name:'Push-ups', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f', 'abs'], type:'c', lvl:1,
 tech:['Hands slightly wider than shoulders, fingers pointing forward. Body in a straight line from heels to head — glutes and abs tight.',
   'Lower yourself, elbows at 30–45° to your torso, until your chest is 2–3 cm from the floor.',
   'Push the floor away and press up to full arm extension; don\'t let your shoulders sag.'],
 err:['Sagging lower back or hips piked up', 'Elbows flared out to 90°', 'Partial range of motion'],
 breath:'Inhale on the way down, exhale on the way up.',
 anim:{view:'side',
  A:plankA([10, 171], 70.4, {arm:{ik:[139, 181], b:'back', hA:90}}),
  B:plankA([10, 171], 85.4, {arm:{ik:[139, 181], b:'back', hA:90}})}},
{id:'diamond', name:'Close-grip push-ups', eq:[], g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:1,
 tech:['Hands under your chest, thumbs and index fingers almost touching.',
   'Body straight, abs and glutes tight.',
   'Lower yourself, driving your elbows back along your sides, until your chest nears your hands.',
   'Press up to straight arms.'],
 err:['Elbows flaring out', 'Sagging hips', 'Head reaching the floor before the chest'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:plankA([10, 171], 70.4, {arm:{ik:[131, 181], b:'back', hA:90}}),
  B:plankA([10, 171], 84, {arm:{ik:[131, 181], b:'back', hA:90}})}},
{id:'dip', name:'Dips', eq:[['dipbars']], g:'chest', pri:['chest', 'triceps'], sec:['delt_f'], type:'c', lvl:2,
 tech:['Support yourself on the bars with straight arms, shoulders down, shoulder blades squeezed.',
   'Lean your torso forward 20–30°, legs slightly bent and crossed.',
   'Lower until your elbows reach about 90°, elbows tracking back.',
   'Press up to straight arms without snapping your elbows into lockout.'],
 err:['Going too deep with shoulder pain', 'Shoulders shrugging up to the ears', 'Swinging the legs'],
 breath:'Inhale on the way down, exhale on the way up.',
 anim:{view:'side',
  A:{hip:hipFromSh([107, 36], 15), torso:15, arm:{ik:[110, 92], b:"back", hA:90}, leg:{a:[186, 250], fr:-60}},
  B:{hip:hipFromSh([101, 70], 32), torso:32, arm:{ik:[110, 92], b:"back", hA:90}, leg:{a:[192, 255], fr:-60}},
  props:[{k:'line', pts:[[62, 96], [168, 96]], w:5}, {k:'line', pts:[[72, 96], [72, GROUND]], w:4}, {k:'line', pts:[[156, 96], [156, GROUND]], w:4}]}},
{id:'bbbench', name:'Barbell bench press', eq:[['bb'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:2,
 tech:['Lie down with your eyes under the bar. Squeeze your shoulder blades into the bench, feet planted firmly.',
   'Grip slightly wider than shoulders. Unrack the bar and bring it over your shoulders on straight arms.',
   'Lower the bar to your lower chest, elbows at 45–70° to your torso.',
   'Once it touches your chest, press the bar up and slightly back toward your head.'],
 err:['Hips lifting off the bench', 'Bouncing the bar off the chest', 'Elbows flared to 90°'],
 breath:'Inhale and brace before lowering, exhale past the sticking point.',
 note:'Use a spotter with near-max weights.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[78, 111], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(17)]}},
{id:'dbbench', name:'Dumbbell bench press', eq:[['db'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Sit on the end of the bench with dumbbells on your thighs, lie back and bring them over your chest.',
   'Shoulder blades squeezed, feet on the floor, slight natural arch in the lower back.',
   'Lower the dumbbells to chest level, forearms vertical.',
   'Press the dumbbells up along a slightly converging path.'],
 err:['Dumbbells drifting sideways', 'Going too deep and losing shoulder control', 'Clanking the dumbbells at the top'],
 breath:'Inhale down, exhale as you press.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[74, 113], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), ...DB_SIDES('end')]}},
{id:'dbincline', name:'Incline dumbbell press', eq:[['db'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:1,
 tech:['Set the backrest to 30–45°. Squeeze your shoulder blades and press them into the pad.',
   'Bring the dumbbells over your upper chest on straight arms.',
   'Lower the dumbbells to your upper chest, elbows at 45–60° to your torso.',
   'Press up without clanking the dumbbells together.'],
 err:['Backrest too steep — the load shifts to the shoulders', 'Shoulder blades lifting off', 'Arching the lower back to help'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[73, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[80, 90], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[...inclineBench([112, 128], -55), ...DB_SIDES('end')]}},
{id:'smithincline', name:'Smith machine incline press', eq:[['smith'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:1,
 tech:['Set the bench at 30° so the bar comes down to your upper chest.',
   'Grip slightly wider than shoulders, shoulder blades squeezed, feet on the floor.',
   'Rotate your wrists to unhook the bar and lower it to your chest.',
   'Press up without snapping your elbows straight; after the set, rotate the bar back onto the hooks.'],
 err:['Bench not aligned with the bar path', 'Shoulder blades lifting off', 'Grip too wide'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[77, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[77, 89], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[{k:'line', pts:[[86, 8], [86, GROUND]], w:3, cls:'eq-rail'}, {k:'line', pts:[[66, 8], [106, 8]], w:5}, ...inclineBench([112, 128], -55), PLATE(15)]}},
{id:'dbfly', name:'Dumbbell fly', eq:[['db'], ['bench']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Lie on the bench, dumbbells over your chest, palms facing each other, elbows slightly bent.',
   'Open your arms out in an arc, keeping the elbow angle, until you feel a light chest stretch.',
   'Bring the dumbbells back along the same arc, as if hugging a barrel.'],
 err:['Bending the elbows — the fly turns into a press', 'Lowering the arms too far', 'Going heavy at the cost of control'],
 breath:'Inhale as you open, exhale as you bring them together.',
 viewNote:'top view',
 anim:{view:'front', noGround:true,
  A:{c:[100, 128], arm:{p:[[-2, 4], [-7, 7]]}, leg:{p:[[7, 42], [10, 52]], fd:[3, 6]}},
  B:{c:[100, 128], arm:{p:[[28, 3], [53, 6]]}, leg:{p:[[7, 42], [10, 52]], fd:[3, 6]}},
  props:[{k:'rect', x:80, y:30, w:40, h:110, rx:6}, {k:'db', at:'gripR', o:'v', len:20, layer:'front'}, {k:'db', at:'gripL', o:'v', len:20, layer:'front'}]}},
{id:'cablefly', name:'Cable crossover fly', eq:[['cable']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Stand centered between the towers, high-pulley handles in hand, one step forward for stability.',
   'Lean slightly forward, elbows softly bent and locked in place.',
   'Bring your hands together in an arc down and forward; hold for a second, squeezing your chest.',
   'Slowly open your arms until you feel a light chest stretch.'],
 err:['Using the torso instead of the arms', 'Bending and straightening the elbows', 'Letting the handles fly back on the return'],
 breath:'Exhale as you bring them together, inhale as you open.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[28, -3], [53, -5]]}}),
  B:frontStand({arm:{p:[[7, 24], [-15, 37]]}}),
  props:[{k:'line', pts:[[24, 8], [24, GROUND]], w:5}, {k:'line', pts:[[176, 8], [176, GROUND]], w:5},
   {k:'cable', from:[30, 16], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[170, 16], at:'gripR', handle:true, layer:'front'}]}},
{id:'pecdeck', name:'Pec deck fly', eq:[['pecdeck']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Adjust the seat so the handles are at chest level.',
   'Press your back and shoulder blades into the pad.',
   'Bring your arms together in front of you without lifting your back; hold for a second.',
   'Smoothly open your arms to a chest stretch without letting the stack slam.'],
 err:['Shoulders rolling forward', 'Back lifting off the pad', 'Not bringing the arms fully together'],
 breath:'Exhale as you bring them together, inhale as you open.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[30, 1], [31, -25]]}}),
  B:frontSeat({arm:{p:[[-13, 6], [-14, -20]]}}),
  props:[{k:'rect', x:76, y:62, w:48, h:70, rx:5}, {k:'rect', x:72, y:130, w:56, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5}, {k:'line', pts:[[56, 28], [144, 28]], w:5},
   {k:'seg', a:'elR', b:'wrR', w:12, cls:'eq-pad-s', layer:'mid'}, {k:'seg', a:'elL', b:'wrL', w:12, cls:'eq-pad-s', layer:'mid'}]}},

/* ===== СПИНА ===== */
{id:'pullup', name:'Pull-ups', eq:[['pullup']], g:'back', pri:['lats'], sec:['biceps', 'midback', 'forearms'], type:'c', lvl:2,
 tech:['Overhand grip slightly wider than shoulders, hang on straight arms, shoulder blades down.',
   'Start by pulling your shoulder blades down, then drive your elbows down toward your ribs.',
   'Pull up until your chin clears the bar.',
   'Lower under control to full arm extension.'],
 err:['Swinging and kicking the legs', 'Not going all the way down', 'Reaching with the chin instead of lifting the chest'],
 breath:'Exhale on the way up, inhale on the way down.',
 note:'If you can\'t hit the target reps, use a resistance band or slow negatives.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 130], arm:{p:[[10, -28], [13, -55]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  B:{c:[100, 83], arm:{p:[[15, 24], [13, -8]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  props:[{k:'line', pts:[[42, 22], [158, 22]], w:5}, {k:'line', pts:[[46, 6], [46, 22]], w:4}, {k:'line', pts:[[154, 6], [154, 22]], w:4}]}},
{id:'bbrow', name:'Bent-over row', eq:[['bb']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r', 'lowback'], type:'c', lvl:2,
 tech:['Overhand grip at shoulder width. Knees slightly bent, torso at 30–45° to the floor, back straight.',
   'The bar hangs on straight arms below your shoulders.',
   'Pull the bar to your lower belly, driving your elbows back along your sides.',
   'Squeeze your shoulder blades at the top and lower the bar smoothly.'],
 err:['Rounding the back', 'Jerking the torso up', 'Pulling to the chest with flared elbows'],
 breath:'Exhale as you lift the bar, inhale as you lower it.',
 anim:{view:'side',
  A:Object.assign({hip:[85, 104], torso:55, arm:{ik:[130, 129], b:'up', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[85, 104], torso:55, arm:{tf:[20, 16], b:'up', hA:180}}, legsAt(100)),
  props:[PLATE(16)]}},
{id:'dbrow', name:'One-arm dumbbell row', eq:[['db'], ['bench']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:1, uni:true,
 tech:['Place one knee and the same-side hand on the bench, other foot on the floor. Back nearly parallel to the floor.',
   'The dumbbell hangs in your free hand below your shoulder.',
   'Pull the dumbbell to your hip, driving your elbow back and up along your side.',
   'Lower the dumbbell to full arm extension, lightly stretching your lat.'],
 err:['Twisting the torso', 'Curling it to the chest with the biceps', 'Rounding the back'],
 breath:'Exhale as you pull, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{ik:[121, 132], b:'up', hA:180}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  B:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{tf:[16, 13], b:'up', hA:180}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  props:[...benchFlat(18, 140, 138), {k:'db', at:'gripN', o:'perp', layer:'front'}]}},
{id:'latpull', name:'Lat pulldown', eq:[['cable']], g:'back', pri:['lats'], sec:['biceps', 'midback'], type:'c', lvl:1,
 tech:['Sit down and lock your thighs under the pads. Overhand grip wider than shoulders.',
   'Lean back slightly, 10–15°, chest up.',
   'Pull the bar to your upper chest, squeezing your shoulder blades and driving your elbows down.',
   'Smoothly return the bar up to full arm extension.'],
 err:['Pulling behind the neck', 'Leaning too far back', 'Jerking the weight'],
 breath:'Exhale as you pull down, inhale on the return.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[12, -27], [17, -53]]}}),
  B:frontSeat({arm:{p:[[17, 22], [15, -4]]}}),
  props:[{k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5}, {k:'rect', x:68, y:133, w:64, h:6, rx:3, cls:'eq-pad'},
   {k:'barcable', from:[100, -6], layer:'back'}, {k:'fbar', ext:14, layer:'front'}]}},
{id:'cablerow', name:'Seated cable row', eq:[['cable']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Sit with your feet on the platform, knees slightly bent, back straight.',
   'Take the handle, extend your arms and let your shoulder blades reach forward — torso leans slightly forward.',
   'Pull the handle to your stomach, squeezing your shoulder blades; the torso leans back with the pull, but no more than 10–15°.',
   'Return under control without rounding your back.'],
 err:['Heavy torso rocking — the lower back pulls instead of the upper back', 'Shrugging the shoulders to the ears', 'Rounding the lower back'],
 breath:'Exhale as you pull, inhale on the return.',
 anim:{view:'side',
  A:{hip:[76, 140], torso:26, arm:{ik:[148, 112], b:'back', hA:90}, leg:{ik:[150, 146], b:'up', f:5}},
  B:{hip:[76, 140], torso:-4, arm:{tf:[22, 18], b:'back', hA:90}, leg:{ik:[150, 146], b:'up', f:5}},
  props:[...benchFlat(40, 112, 150), {k:'rect', x:156, y:126, w:6, h:44}, {k:'line', pts:[[178, 98], [178, GROUND]], w:5}, {k:'line', pts:[[112, 176], [178, 176]], w:4},
   {k:'cable', from:[174, 112], at:'gripN', handle:true, layer:'front'}]}},
{id:'deadlift', name:'Deadlift', eq:[['bb']], g:'back', pri:['lowback', 'glutes', 'hams'], sec:['traps', 'quads', 'forearms', 'lats'], type:'c', lvl:2,
 tech:['Feet hip-width apart, bar over mid-foot, grip just outside your legs.',
   'Drop your hips, back straight, shoulders slightly ahead of the bar. Build tension as if pushing the floor away.',
   'Lift the bar along your legs, extending your knees and hips together.',
   'Stand tall at the top without leaning back. Lower along the same path: hips back first, then knees.'],
 err:['Rounding the lower back', 'Bar drifting away from the legs', 'Hips rising before the shoulders'],
 breath:'Take a deep breath and brace your abs before lifting, exhale at the top.',
 anim:{view:'side',
  A:Object.assign({hip:hipFromSh([108, 106], 65), torso:65, arm:{ik:[106, 162], b:'back', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[92, 97], torso:-2, arm:{ik:[94, 100], b:'back', hA:180}}, legsAt(100)),
  props:[PLATE(20)]}},
{id:'hyper', name:'Back extension', eq:[['hyper']], g:'back', pri:['lowback'], sec:['glutes', 'hams'], type:'i', lvl:1,
 tech:['Adjust the pad so its top edge is at your hip joints.',
   'Arms crossed over your chest, body in a straight line.',
   'Hinge forward at the hips, back straight.',
   'Rise to a straight body line without hyperextending your lower back.'],
 err:['Hyperextending at the top', 'Jerky reps', 'Rounding the back at the bottom'],
 breath:'Inhale as you bend, exhale as you rise.',
 anim:{view:'side',
  A:{hip:[100, 105], torso:45, arm:{ra:[160, 15]}, leg:{a:[225, 225], fr:-90}},
  B:{hip:[100, 105], torso:158, arm:{ra:[160, 15]}, leg:{a:[225, 225], fr:-90}},
  props:[{k:'line', pts:[[34, 162], [104, 124]], w:6}, {k:'circle', c:[108, 121], r:8, cls:'eq-pad'}, {k:'circle', c:[34, 158], r:6, cls:'eq-pad'},
   {k:'line', pts:[[60, 148], [52, GROUND]], w:4}, {k:'line', pts:[[96, 128], [104, GROUND]], w:4}]}},
{id:'shrug', name:'Dumbbell shrugs', eq:[['db']], g:'back', pri:['traps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Stand tall, dumbbells hanging at your sides.',
   'Raise your shoulders straight up toward your ears.',
   'Hold for 1–2 seconds and lower slowly.'],
 err:['Rolling the shoulders', 'Bending the elbows', 'Dropping the head forward'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand({shrug:0, neck:15}), B:stand({shrug:7, neck:8}), props:DB_SIDES('perp')}},
{id:'bandrow', name:'Seated band row', eq:[['band']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Sit on the floor, legs straight, middle of the band looped around your feet.',
   'Back straight, arms extended forward with tension on the band.',
   'Pull the band ends to your waist, squeezing your shoulder blades and driving your elbows back.',
   'Return slowly, keeping tension.'],
 err:['Leaning back instead of using the arms', 'Rounding the back', 'Snapping back on the return'],
 breath:'Exhale as you pull, inhale on the return.',
 anim:{view:'side',
  A:{hip:[70, 175], torso:20, arm:{ik:[140, 154], b:'back', hA:90}, leg:{a:[90, 90], f:10}},
  B:{hip:[70, 175], torso:-6, arm:{tf:[24, 18], b:'back', hA:90}, leg:{a:[90, 90], f:10}},
  props:[{k:'band', from:'toeN', at:'gripN', layer:'front'}]}},

/* ===== ПЛЕЧИ ===== */
{id:'dbpress', name:'Seated dumbbell press', eq:[['db'], ['incline', 'bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:1,
 tech:['Backrest upright. Dumbbells at your shoulders, elbows under the dumbbells, palms forward.',
   'Press your back into the pad, abs tight.',
   'Press the dumbbells up in an arc, bringing them together overhead.',
   'Lower to ear level or slightly below.'],
 err:['Excessive lower-back arch', 'Elbows drifting behind the torso', 'Partial range of motion'],
 breath:'Exhale as you press, inhale as you lower.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[26, 6], [27, -20]]}}),
  B:frontSeat({arm:{p:[[14, -24], [8, -52]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'db', at:'gripR', o:'h', layer:'front'}, {k:'db', at:'gripL', o:'h', layer:'front'}]}},
{id:'ohp', name:'Overhead press', eq:[['bb']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'abs', 'traps'], type:'c', lvl:2,
 tech:['Grip slightly wider than shoulders, bar resting on your front delts by the collarbones, elbows slightly in front of the bar.',
   'Feet hip-width apart, glutes and abs tight.',
   'Press the bar straight up, moving your head back, then bring it back under the bar.',
   'Lock out the bar over mid-foot and lower it back to your collarbones.'],
 err:['Arching the lower back', 'Using leg drive — that makes it a push press', 'Pressing forward instead of overhead'],
 breath:'Inhale before the press, exhale once the bar passes your forehead.',
 anim:{view:'side',
  A:stand({torso:-3, head:-10, arm:{ik:[101, 50], b:'down'}}),
  B:stand({torso:0, head:0, arm:{ik:[94, -10], b:'down'}}),
  props:[PLATE(16)]}},
{id:'latraise', name:'Dumbbell lateral raises', eq:[['db']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1,
 tech:['Standing, dumbbells at your thighs, elbows slightly bent, torso leaning slightly forward.',
   'Raise your arms out to the sides to shoulder height, leading with your elbows.',
   'Keep your hands no higher than your elbows; don\'t shrug your shoulders toward your ears.',
   'Lower slowly.'],
 err:['Swinging the torso', 'Shrugging the shoulders to the ears', 'Dumbbells too heavy'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'front', A:frontStand({arm:{p:[[4, 29], [7, 55]]}}), B:frontStand({arm:{p:[[29, 2], [55, 7]]}}),
  props:[{k:'db', at:'gripR', layer:'front'}, {k:'db', at:'gripL', layer:'front'}]}},
{id:'bandlatraise', name:'Resistance band lateral raises', eq:[['band']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1,
 tech:['Stand on the middle of the band, ends in your hands at your thighs.',
   'Raise your arms out to the sides to shoulder height, elbows slightly bent.',
   'Pause, then lower slowly without letting the band snap your arms down.'],
 err:['Shrugging the shoulders to the ears', 'Swinging the torso', 'Band too stiff'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'front', A:frontStand({arm:{p:[[4, 29], [7, 55]]}}), B:frontStand({arm:{p:[[29, 2], [55, 7]]}}),
  props:[{k:'band', from:'anR', at:'gripR', layer:'front'}, {k:'band', from:'anL', at:'gripL', layer:'front'}]}},
{id:'frontraise', name:'Dumbbell front raises', eq:[['db']], g:'shoulders', pri:['delt_f'], sec:['delt_s'], type:'i', lvl:1,
 tech:['Stand with dumbbells in front of your thighs, overhand grip.',
   'Raise your straight arms forward to shoulder height, elbows slightly bent.',
   'Pause for a second and lower under control.'],
 err:['Jerking with the torso', 'Raising above shoulder height while arching the back'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand({arm:{a:[176, 174]}}), B:stand({arm:{a:[88, 84]}}), props:DB_SIDES('end')}},
{id:'facepull', name:'Cable face pulls', eq:[['cable']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Set the pulley at forehead height, grab the rope with an overhand grip and step back.',
   'Pull the rope toward your face, spreading its ends apart and driving your elbows high and wide.',
   'At the end point, hands are by your ears and shoulder blades squeezed together.',
   'Return smoothly until your arms are straight.'],
 err:['Elbows below the hands', 'Leaning the torso back', 'Shrugging the shoulders'],
 breath:'Exhale as you pull, inhale on the return.',
 anim:{view:'front', viewNote:'front view, pulley in front of the athlete',
  A:frontStand({arm:{p:[[14, 10], [18, 4]]}}),
  B:frontStand({arm:{p:[[32, -2], [24, -20]]}}),
  props:[{k:'circle', c:[100, 6], r:5, cls:'eq-steel-f'}, {k:'cable', from:[100, 6], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[100, 6], at:'gripR', handle:true, layer:'front'}]}},
{id:'pikepush', name:'Pike push-ups', eq:[], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:2,
 tech:['From a push-up position, lift your hips up: your body forms an upside-down V, hands shoulder-width apart.',
   'Lower your head between your hands toward the floor, bending your elbows back.',
   'Nearly touch the floor with the top of your head, then press yourself back up.'],
 err:['Hips drop, turning it into a regular push-up', 'Elbows flared out', 'Hitting the floor with your head'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[92, 90], torso:135, arm:{ik:[134, 181], b:'back', hA:90}, leg:{ik:[70, 172], b:'fwd', f:160}},
  B:{hip:[98, 96], torso:160, arm:{ik:[134, 181], b:'back', hA:90}, leg:{ik:[70, 172], b:'fwd', f:160}}}},

/* ===== БИЦЕПС ===== */
{id:'bbcurl', name:'Barbell biceps curl', eq:[['bb']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Underhand grip at shoulder width, elbows pinned to your sides.',
   'Curl the bar up toward your chest; keep your elbows still.',
   'Pause at the top and lower slowly until your arms are almost fully straight.'],
 err:['Swinging the torso', 'Elbows drifting forward', 'Dropping the weight'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}), props:[PLATE(15)]}},
{id:'dbcurl', name:'Dumbbell biceps curl', eq:[['db']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Stand with dumbbells at your sides, palms forward, elbows close to your body.',
   'Curl both arms together or alternately up to shoulder level.',
   'Lower slowly until your arms are straight.'],
 err:['Cheating with the torso', 'Elbows drifting forward', 'Not fully extending at the bottom'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}), props:DB_SIDES('end')}},
{id:'hammer', name:'Hammer curls', eq:[['db']], g:'biceps', pri:['biceps', 'forearms'], sec:[], type:'i', lvl:1,
 tech:['Hold dumbbells with palms facing each other.',
   'Curl while keeping a neutral grip; elbows close to your body.',
   'Lower slowly until your arms are straight.'],
 err:['Cheating with the torso', 'Moving the elbows forward'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 30]}}), props:DB_SIDES('perp')}},
{id:'cablecurl', name:'Low-pulley cable curl', eq:[['cable']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Face the machine, holding a straight bar with an underhand grip.',
   'Elbows at your sides, curl up to chest level.',
   'Pause and extend smoothly.'],
 err:['Leaning the torso back', 'Elbows drifting forward'],
 breath:'Exhale as you curl, inhale as you extend.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'line', pts:[[160, 120], [160, GROUND]], w:5}, {k:'cable', from:[154, 178], at:'grips', handle:true, layer:'front'}]}},
{id:'bandcurl', name:'Resistance band curl', eq:[['band']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Stand on the middle of the band and grab the ends with an underhand grip.',
   'Curl, keeping your elbows pinned to your sides.',
   'Lower slowly, keeping the tension.'],
 err:['Elbows drifting forward', 'Swinging the torso'],
 breath:'Exhale as you curl, inhale as you lower.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'band', from:'anN', foff:[4, 3], at:'gripN', layer:'front'}]}},
{id:'chinup', name:'Chin-ups', eq:[['pullup']], g:'biceps', pri:['biceps', 'lats'], sec:['forearms', 'midback'], type:'c', lvl:2,
 tech:['Underhand grip at shoulder width, hang with straight arms.',
   'Drive your elbows down to your sides, pulling your chest toward the bar.',
   'Get your chin over the bar, then lower slowly until your arms are straight.'],
 err:['Not fully extending at the bottom', 'Swinging', 'Kicking with the legs to get up'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 130], arm:{p:[[-2, -28], [-4, -55]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  B:{c:[100, 83], arm:{p:[[6, 25], [-4, -8]]}, leg:{p:[[2, 42], [0, 70]], fd:[1, 7]}},
  props:[{k:'line', pts:[[42, 22], [158, 22]], w:5}, {k:'line', pts:[[46, 6], [46, 22]], w:4}, {k:'line', pts:[[154, 6], [154, 22]], w:4}]}},

/* ===== ТРИЦЕПС ===== */
{id:'skull', name:'Lying triceps extension', eq:[['bb'], ['bench']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:2,
 tech:['Lie on a bench with the barbell (an EZ bar is more comfortable) on straight arms above your forehead, overhand grip at shoulder width.',
   'Tilt your arms slightly back toward your head; keep your upper arms still.',
   'Bend only at the elbows, lowering the bar toward the top of your head.',
   'Extend your arms using your triceps.'],
 err:['Elbows flaring out', 'Moving at the shoulder joints', 'Lowering the bar to your face'],
 breath:'Inhale as you lower, exhale as you extend.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{a:[-12, -8]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{a:[-14, -142]}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(14)]}},
{id:'pushdown', name:'Cable triceps pushdown', eq:[['cable']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Stand at the cable machine, torso leaning slightly forward, elbows pinned to your sides.',
   'Push down until your arms are fully straight, pause for a second.',
   'Return until your elbows reach about 90°; keep your upper arms still.'],
 err:['Elbows drifting away from the body', 'Using body weight to help', 'Handle rising above chest level'],
 breath:'Exhale as you extend, inhale as you return.',
 anim:{view:'side', A:stand({torso:8, arm:{a:[184, 58]}}), B:stand({torso:8, arm:{a:[184, 176]}}),
  props:[{k:'line', pts:[[150, 0], [150, GROUND]], w:5}, {k:'cable', from:[144, 8], at:'grips', handle:true, layer:'front'}]}},
{id:'bandpushdown', name:'Resistance band pushdown', eq:[['band']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Anchor the band high — on a door anchor or a bar — and grab the ends.',
   'Elbows pinned to your sides. Push down until your arms are fully straight.',
   'Slowly return to 90° at the elbows.'],
 err:['Elbows drifting forward', 'Leaning the torso instead of working the arms'],
 breath:'Exhale as you extend, inhale as you return.',
 anim:{view:'side', A:stand({torso:8, arm:{a:[184, 58]}}), B:stand({torso:8, arm:{a:[184, 176]}}),
  props:[{k:'rect', x:140, y:0, w:6, h:12}, {k:'band', from:[143, 10], at:'grips', layer:'front'}]}},
{id:'benchdip', name:'Bench dips', eq:[['bench']], g:'triceps', pri:['triceps'], sec:['chest', 'delt_f'], type:'c', lvl:1,
 tech:['Sit on the edge of a bench, hands next to your hips, fingers forward. Slide your hips forward off the bench.',
   'Bent legs make it easier, straight legs make it harder.',
   'Lower yourself, bending your elbows back to 90°.',
   'Straighten your arms to push yourself back up.'],
 err:['Going too deep', 'Elbows flared out', 'Hips too far from the bench'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[90, 124], torso:0, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[150, 180], b:'up', f:60}},
  B:{hip:[88, 150], torso:-2, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[150, 180], b:'up', f:60}},
  props:benchFlat(20, 82, 129)}},
{id:'ohext', name:'Overhead dumbbell triceps extension', eq:[['db']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Standing or seated, hold a dumbbell overhead with both hands by the top plate.',
   'Elbows point up and stay close to your head.',
   'Lower the dumbbell behind your head by bending your elbows.',
   'Extend your arms overhead without flaring your elbows.'],
 err:['Elbows flaring out', 'Arching the lower back'],
 breath:'Inhale as you lower, exhale as you extend.',
 anim:{view:'side', A:stand({arm:{a:[6, 4]}}), B:stand({arm:{a:[4, -150]}}), props:[{k:'db', at:'grips', o:'along', len:20, layer:'front'}]}},

/* ===== ПРЕДПЛЕЧЬЯ ===== */
{id:'wristcurl', name:'Barbell wrist curl', eq:[['bb'], ['bench']], g:'forearms', pri:['forearms'], sec:[], type:'i', lvl:1,
 tech:['Sit on a bench, forearms resting on your thighs, hands hanging past your knees, underhand grip.',
   'Lower the bar by extending your wrists; you can let it roll down to your fingers.',
   'Curl your wrists, raising the bar as high as possible.'],
 err:['Lifting the forearms off the thighs', 'Too much weight and jerky reps'],
 breath:'Breathe steadily, exhale on the way up.',
 anim:{view:'side',
  A:{hip:[82, 138], torso:35, arm:{ik:[128, 127], b:'back', w:70}, leg:{a:[90, 180], f:90}},
  B:{hip:[82, 138], torso:35, arm:{ik:[128, 127], b:'back', w:-55}, leg:{a:[90, 180], f:90}},
  props:[...benchFlat(48, 116, 148), PLATE(13)]}},
{id:'farmer', name:'Farmer\'s carry', nameV:{kb:'Kettlebell farmer\'s carry'}, eq:[['db', 'kb']], g:'forearms', pri:['forearms', 'traps'], sec:['abs', 'glutes'], type:'c', lvl:1, kind:'dist',
 tech:['Pick up heavy dumbbells or kettlebells and stand tall, shoulders down and back.',
   'Walk with short, quick steps, keeping your torso upright.',
   'Don\'t let the weight sway your torso. Set the weights down by squatting, not bending over.'],
 err:['Slouching', 'Leaning to one side', 'Long, swaying steps'],
 breath:'Breathe steadily, don\'t hold your breath.',
 anim:{view:'side',
  A:{hip:[94, 99], torso:0, arm:{a:[182, 180]}, legN:{ik:[116, 180], b:'fwd', f:90}, legF:{ik:[74, 177], b:'fwd', f:112}},
  B:{hip:[94, 99], torso:0, arm:{a:[178, 180]}, legN:{ik:[74, 177], b:'fwd', f:112}, legF:{ik:[116, 180], b:'fwd', f:90}},
  props:[{k:'db', at:'gripF', o:'perp', layer:'farProps', if:'db'}, {k:'db', at:'gripN', o:'perp', layer:'front', if:'db'}, {k:'kb', at:'gripN', down:true, layer:'front', if:'kb'}]}},
{id:'hang', name:'Dead hang', eq:[['pullup']], g:'forearms', pri:['forearms'], sec:['lats'], type:'i', lvl:1, kind:'time',
 tech:['Grab the bar with an overhand grip at shoulder width.',
   'Hang on straight arms with your shoulders pulled slightly down from your ears — an active hang.',
   'Hold the position for the set time, breathing steadily.'],
 err:['Passive sag in the shoulders causing pain', 'Swinging'],
 breath:'Calm, steady breathing.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], -3), torso:-3, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[183, 186], fr:-30}},
  B:{hip:hipFromSh([100, 80], 3), torso:3, shrug:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[178, 184], fr:-30}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},

/* ===== ПРЕСС ===== */
{id:'crunch', name:'Crunches', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Lie on your back, knees bent, feet on the floor, arms crossed over your chest.',
   'Curl up, lifting your shoulder blades off the floor and bringing your ribs toward your pelvis.',
   'Keep your lower back pressed to the floor. Pause and lower slowly.'],
 err:['Pulling on the head with the hands', 'Lifting the whole torso with the hip flexors', 'Jerky reps'],
 breath:'Exhale as you crunch, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, head:0, arm:{ra:[155, 25]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[112, 175], torso:-62, head:12, arm:{ra:[155, 25]}, leg:{ik:[160, 180], b:'up', f:90}}}},
{id:'plank', name:'Forearm plank', eq:[], g:'abs', pri:['abs'], sec:['obliques', 'delt_f', 'glutes'], type:'i', lvl:1, kind:'time',
 tech:['Rest on your forearms, elbows under your shoulders, body in a straight line.',
   'Squeeze your glutes and abs, draw your ribs toward your pelvis.',
   'Hold the position, breathing steadily.'],
 err:['Sagging lower back', 'Hips raised too high', 'Holding your breath'],
 breath:'Calm belly breathing, don\'t hold your breath.',
 anim:{view:'side',
  A:plankA([5, 171], 81.6, {arm:{a:[180, 90]}}),
  B:plankA([5, 171], 80.6, {arm:{a:[181, 90]}})}},
{id:'sideplank', name:'Side plank', eq:[], g:'abs', pri:['obliques'], sec:['abs', 'glutes'], type:'i', lvl:1, kind:'time', uni:true,
 tech:['Lie on your side, propped on your forearm, elbow under your shoulder, legs together.',
   'Lift your hips: your body forms a straight line from head to feet.',
   'You can raise your top arm. Hold the position, then switch sides.'],
 err:['Sagging hips', 'Shoulder creeping toward the ear', 'Torso rotating forward'],
 breath:'Breathe steadily.',
 anim:{view:'front', rot:true,
  A:{c:[100, 97], rot:69, pivot:[100, 182], armR:{p:[[28, 11], [32, 13]]}, armL:{p:[[29, 3], [56, 4]]}, leg:{p:[[-4, 43], [-7, 85]], fd:[4, 4]}},
  B:{c:[100, 97], rot:68, pivot:[100, 182], armR:{p:[[28, 11], [32, 13]]}, armL:{p:[[10, 22], [2, 38]]}, leg:{p:[[-4, 43], [-7, 85]], fd:[4, 4]}}}},
{id:'legraise', name:'Hanging leg raises', eq:[['pullup']], g:'abs', pri:['abs'], sec:['obliques', 'forearms'], type:'i', lvl:3,
 tech:['Hang from the bar, shoulder blades down, torso still.',
   'Raise straight or bent legs to horizontal or higher, tilting your pelvis up.',
   'Lower slowly without swinging.'],
 err:['Swinging like a pendulum', 'Lifting with only the hip flexors, without tilting the pelvis'],
 breath:'Exhale as you raise your legs, inhale as you lower.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], 0), torso:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[180, 180], fr:-40}},
  B:{hip:hipFromSh([100, 83], -12), torso:-12, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[82, 82], fr:-40}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},
{id:'lyinglegraise', name:'Lying leg raises', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Lie on your back, arms at your sides, lower back pressed to the floor.',
   'Raise your straight legs to vertical; at the top, lift your hips slightly off the floor.',
   'Lower your legs slowly without touching the floor with your heels.'],
 err:['Arching the lower back while lowering', 'Jerky reps'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, arm:{a:[90, 90], hA:90}, leg:{a:[86, 86], fr:-70}},
  B:{hip:[112, 175], torso:-90, arm:{a:[90, 90], hA:90}, leg:{a:[4, 4], fr:-70}}}},
{id:'cablecrunch', name:'Kneeling cable crunches', eq:[['cable']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Kneel facing the high pulley, holding the rope ends by your forehead on either side of your head.',
   'Keep your hips still. Crunch down, bringing your elbows toward your thighs.',
   'Return up while keeping tension in your abs.'],
 err:['Lowering by moving the hips and arms', 'Pulling with the arms', 'Weight too heavy'],
 breath:'Exhale as you crunch, inhale as you return.',
 anim:{view:'side',
  A:{hip:[96, 137], torso:12, head:0, arm:{ra:[150, -8]}, leg:{a:[180, 270], f:200}},
  B:{hip:[96, 137], torso:96, head:20, arm:{ra:[150, -8]}, leg:{a:[180, 270], f:200}},
  props:[{k:'line', pts:[[168, -6], [168, GROUND]], w:5}, {k:'cable', from:[162, 0], at:'grips', handle:true, layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'hipthrust', name:'Barbell hip thrust', eq:[['bb'], ['bench']], g:'glutes', pri:['glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Sit with your back to a bench, the bottom of your shoulder blades on its edge. Place the barbell across your hip crease on a pad.',
   'Feet shoulder-width apart; at the top, your shins are vertical.',
   'Raise your hips until your body forms a straight line from shoulders to knees, chin tucked.',
   'Squeeze your glutes, pause, and lower your hips.'],
 err:['Hyperextending the lower back at the top', 'Feet too far or too close', 'Incomplete hip extension'],
 breath:'Exhale as you raise your hips, inhale as you lower.',
 anim:{view:'side',
  A:{hip:hipFromSh([74, 128], -55), torso:-55, head:18, arm:{tf:[2, 15], b:'up'}, leg:{ik:[150, 180], b:'up', f:90}},
  B:{hip:hipFromSh([74, 128], -92), torso:-92, head:28, arm:{tf:[2, 15], b:'up'}, leg:{ik:[150, 180], b:'up', f:90}},
  props:[...benchFlat(18, 80, 138), {k:'plate', tf:[2, 17], r:17, layer:'mid'}]}},
{id:'bridge', name:'Glute bridge', eq:[], g:'glutes', pri:['glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Lie on your back, feet close to your hips, arms at your sides.',
   'Raise your hips, squeezing your glutes, until your body forms a straight line from shoulders to knees.',
   'Pause for 1–2 seconds and lower your hips.'],
 err:['Arching the lower back', 'Pushing through the toes instead of the heels'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:hipFromSh([58, 176], -90), torso:-90, head:0, arm:{a:[90, 90], hA:90}, leg:{ik:[146, 180], b:'up', f:90}},
  B:{hip:hipFromSh([58, 176], -122), torso:-122, head:30, arm:{a:[90, 90], hA:90}, leg:{ik:[146, 180], b:'up', f:90}}}},
{id:'kbswing', name:'Kettlebell swing', eq:[['kb']], g:'glutes', pri:['glutes', 'hams'], sec:['lowback', 'delt_f', 'forearms'], type:'c', lvl:2,
 tech:['Feet wider than shoulders, kettlebell on the floor in front of you. Push your hips back, grab the kettlebell and hike it between your legs.',
   'Drive your hips forward powerfully — momentum swings the kettlebell up to chest height.',
   'Your arms only guide the kettlebell. At the top, your body is straight and glutes squeezed.',
   'Meet the kettlebell by pushing your hips back.'],
 err:['Squatting instead of hinging', 'Lifting the kettlebell with the arms', 'Rounding the back'],
 breath:'Exhale sharply as you extend, inhale on the backswing.',
 anim:{view:'side',
  A:Object.assign({hip:[72, 108], torso:62, arm:{ik:[86, 130], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[92, 97], torso:-3, arm:{ik:[145, 52], b:'down'}}, legsAt(98)),
  props:[{k:'kb', at:'gripN', layer:'front'}]}},
{id:'bulgarian', name:'Bulgarian split squat', eq:[['bench']], opt:['db'], g:'glutes', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:2, uni:true,
 tech:['Stand with your back to a bench, the top of your rear foot resting on it and your front foot a stride ahead.',
   'Lower straight down until your front thigh is parallel to the floor.',
   'Keep your front knee in line with your toes.',
   'Drive back up through your front leg.'],
 err:['Stance too short', 'Knee caving in', 'Pushing off the back leg'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[90, 100], torso:4, arm:{a:[180, 180]}, legN:{ik:[124, 180], b:'fwd', f:90}, legF:{ik:[36, 134], b:'fwd', f:250}},
  B:{hip:[84, 139], torso:12, arm:{a:[180, 180]}, legN:{ik:[124, 180], b:'fwd', f:90}, legF:{ik:[36, 134], b:'fwd', f:250}},
  props:[...benchFlat(10, 56, 140), ...DB_SIDES('perp', 'db')]}},
{id:'stepup', name:'Step-ups', eq:[['bench']], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Place one foot on a bench or a stable box no higher than knee height.',
   'Shift your weight onto that leg and step up until it is fully straight.',
   'Step down under control with the same leg.'],
 err:['Pushing off the bottom leg', 'Knee caving in', 'Excessive forward lean'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:[86, 104], torso:8, arm:{a:[180, 180]}, legN:{ik:[126, 135], b:'fwd', f:90}, legF:{ik:[78, 180], b:'fwd', f:90}},
  B:{hip:[118, 54], torso:0, arm:{a:[180, 180]}, legN:{ik:[126, 135], b:'fwd', f:90}, legF:{ik:[112, 128], b:'fwd', f:110}},
  props:[{k:'rect', x:104, y:140, w:52, h:46, rx:3}, ...DB_SIDES('perp', 'db')]}},
{id:'rdl', name:'Romanian deadlift', nameV:{bb:'Barbell Romanian deadlift', db:'Dumbbell Romanian deadlift'}, eq:[['bb', 'db']], g:'hams', pri:['hams', 'glutes'], sec:['lowback'], type:'c', lvl:1,
 tech:['Stand holding the weight in straight arms in front of your thighs, knees slightly bent.',
   'Push your hips back, hinging forward with a flat back; the weight slides down along your legs.',
   'Lower until you feel a strong stretch in your hamstrings — usually to mid-shin.',
   'Stand back up by driving your hips forward.'],
 err:['Rounding the back', 'Bending the knees like a squat', 'Weight drifting away from the legs'],
 breath:'Inhale as you bend, exhale as you rise.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:-2, arm:{ik:[95, 100], b:'back', hA:180}}, legsAt(100)),
  B:Object.assign({hip:[70, 106], torso:76, arm:{ik:[112, 146], b:'back', hA:180}}, legsAt(100)),
  props:[{k:'plate', at:'grips', r:16, layer:'mid', if:'bb'}, ...DB_SIDES('end', 'db')]}},

/* ===== КВАДРИЦЕПС ===== */
{id:'squat', name:'Barbell squat', eq:[['bb']], g:'quads', pri:['quads', 'glutes'], sec:['lowback', 'hams', 'abs'], type:'c', lvl:2,
 tech:['Bar on your traps, feet slightly wider than shoulders, toes turned out a little.',
   'Inhale and brace your abs. Descend by bending your knees and pushing your hips back at the same time.',
   'Knees track over your toes, back neutral.',
   'Lower until your thighs are parallel to the floor or below, then stand up, pushing through your whole foot.'],
 err:['Knees caving in', 'Heels lifting off', 'Lower back rounding at the bottom'],
 breath:'Inhale and hold on the way down, exhale once you pass the bottom third of the ascent.',
 note:'Train in a power rack with the safety bars set.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:2, arm:{tf:[51, -6], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[70, 146], torso:44, arm:{tf:[51, -6], b:'down'}}, legsAt(98)),
  props:[{k:'plate', tf:[53, -10], r:17, layer:'mid'}]}},
{id:'goblet', name:'Goblet squat', nameV:{kb:'Kettlebell goblet squat'}, eq:[['db', 'kb']], g:'quads', pri:['quads', 'glutes'], sec:['abs'], type:'c', lvl:1,
 tech:['Hold a dumbbell vertically at your chest (or a kettlebell by the horns), elbows pointing down.',
   'Feet slightly wider than shoulders. Squat down, dropping your hips between your knees; keep your torso upright.',
   'Go as low as you can with a straight back, then stand up.'],
 err:['Leaning the torso forward', 'Knees caving in', 'Heels lifting off'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:0, arm:{tf:[40, 17], b:'down'}}, legsAt(98)),
  B:Object.assign({hip:[72, 148], torso:24, arm:{tf:[40, 17], b:'down'}}, legsAt(98)),
  props:[{k:'db', at:'grips', o:'v', len:20, off:[0, 6], layer:'front', if:'db'}, {k:'kb', at:'grips', down:true, dist:9, layer:'front', if:'kb'}]}},
{id:'airsquat', name:'Bodyweight squat', eq:[], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Feet shoulder-width apart; you can extend your arms forward for balance.',
   'Push your hips back and lower until your thighs are parallel to the floor; knees track over toes, heels stay down.',
   'Stand up to full extension.'],
 err:['Knees caving in', 'Heels lifting off', 'Rounding the back'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side', A:stand({arm:{a:[180, 180]}}), B:Object.assign({hip:[70, 146], torso:38, arm:{a:[88, 88]}}, legsAt(98))}},
{id:'lunge', name:'Split squat', eq:[], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Take a long stride stance, torso upright.',
   'Lower straight down until your back knee almost touches the floor.',
   'Front knee stays over the foot, not far past the toes. Stand up.'],
 err:['Leaning the torso forward', 'Knee caving in', 'Stance too short'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[92, 103], torso:0, arm:{a:[180, 180]}, legN:{ik:[126, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}},
  B:{hip:[90, 141], torso:4, arm:{a:[180, 180]}, legN:{ik:[126, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}},
  props:DB_SIDES('perp', 'db')}},
{id:'legpress', name:'Leg press', eq:[['legpress']], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Sit down and press your lower back into the pad. Feet on the platform, shoulder-width apart.',
   'Release the safety stops and lower the platform, bending your knees to about 90°.',
   'Press the platform away without snapping your knees into lockout.'],
 err:['Hips lifting off the seat at the bottom', 'Knees caving in', 'Locking out the knees at the top'],
 breath:'Inhale as you lower, exhale as you press.',
 anim:{view:'side',
  A:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 80), b:'up', f:-45}},
  B:{hip:[68, 150], torso:-62, arm:{tf:[8, -2], b:'down'}, leg:{ik:add([68, 150], dir(45), 38), b:'up', f:-45}},
  props:[{k:'line', pts:[add([68, 150], dir(-62), -8).map((v, i) => v + [6, 10][i]), add([68, 150], dir(-62), 60).map((v, i) => v + [6, 10][i])], w:8, cls:'eq-pad-s'},
   {k:'line', pts:[[104, GROUND], [164, 126]], w:4}, {k:'line', pts:[[52, 164], [52, GROUND]], w:4}, {k:'line', pts:[[40, 164], [92, 164]], w:5},
   {k:'platform', at:'anN', ang:45, layer:'front'}]}},
{id:'legext', name:'Leg extension', eq:[['legext']], g:'quads', pri:['quads'], sec:[], type:'i', lvl:1,
 tech:['Sit down, press your back into the pad. Roller just above the ankles, machine pivot in line with your knees.',
   'Extend your legs until almost straight and hold for a second.',
   'Lower slowly.'],
 err:['Hips lifting off the seat', 'Jerking and dropping the weight'],
 breath:'Exhale as you extend, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[78, 128], torso:-12, arm:{ik:[90, 138], b:'back', hA:120}, leg:{a:[90, 178], fr:-90}},
  B:{hip:[78, 128], torso:-12, arm:{ik:[90, 138], b:'back', hA:120}, leg:{a:[90, 92], fr:-90}},
  props:[{k:'rect', x:56, y:137, w:68, h:8}, {k:'line', pts:[add([78, 128], dir(-12), 4).map((v, i) => v + [-12, 0][i]), add([78, 128], dir(-12), 58).map((v, i) => v + [-12, 0][i])], w:8, cls:'eq-pad-s'},
   {k:'line', pts:[[90, 145], [90, GROUND]], w:5}, {k:'line', pts:[[60, GROUND], [130, GROUND]], w:4},
   {k:'roller', leg:'N', side:-90, pivot:[123, 128], layer:'front'}]}},
{id:'smithsquat', name:'Smith machine squat', eq:[['smith']], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1,
 tech:['Bar on your traps, feet shoulder-width apart, slightly in front of the bar.',
   'Unrack the bar by rotating your wrists and lower until your thighs are parallel to the floor; knees track over toes.',
   'Stand up without lifting your heels.'],
 err:['Feet directly under the bar — more stress on the knees', 'Heels lifting off', 'Rounding the back'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:Object.assign({hip:[100, 97], torso:0, arm:{tf:[51, -4], b:'down'}}, legsAt(110)),
  B:Object.assign({hip:[74, 142], torso:29, arm:{tf:[51, -4], b:'down'}}, legsAt(110)),
  props:[{k:'line', pts:[[88, 6], [88, GROUND]], w:3, cls:'eq-rail'}, {k:'plate', tf:[52, -8], r:15, layer:'mid'}]}},

/* ===== БИЦЕПС БЕДРА ===== */
{id:'legcurl', name:'Lying leg curl', eq:[['legcurl']], g:'hams', pri:['hams'], sec:['calves'], type:'i', lvl:1,
 tech:['Lie face down, roller just above your heels, knees slightly past the edge of the bench.',
   'Curl your legs, pulling your heels toward your glutes; keep your hips down.',
   'Slowly straighten your legs.'],
 err:['Hips lifting', 'Jerky reps', 'Not fully extending at the bottom'],
 breath:'Exhale as you curl, inhale as you extend.',
 anim:{view:'side',
  A:{hip:[88, 124], torso:84, head:-10, arm:{a:[172, 150]}, leg:{a:[270, 268], fr:-90}},
  B:{hip:[88, 124], torso:84, head:-10, arm:{a:[172, 150]}, leg:{a:[270, 378], fr:-90}},
  props:[{k:'rect', x:48, y:133, w:116, h:8}, {k:'line', pts:[[66, 141], [66, GROUND]], w:4}, {k:'line', pts:[[150, 141], [150, GROUND]], w:4},
   {k:'roller', leg:'N', side:90, out:8, pivot:[47, 128], layer:'front'}]}},

/* ===== ИКРЫ ===== */
{id:'calfraise', name:'Standing calf raise', eq:[], opt:['db'], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Stand tall, ideally with the balls of your feet on the edge of a step; knees straight.',
   'Rise onto your toes as high as you can and hold for 1–2 seconds.',
   'Lower slowly, stretching your calves.'],
 err:['Bouncing reps without a pause', 'Bending the knees'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', A:stand(), B:Object.assign({hip:[94, 88], torso:0, arm:{a:[180, 180]}}, legsAt(100, 172, 'fwd', 130)), props:DB_SIDES('perp', 'db')}},
{id:'lpcalf', name:'Leg press calf raise', eq:[['legpress']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Place the balls of your feet on the bottom edge of the platform, legs almost straight.',
   'Press the platform with your toes, pointing your feet.',
   'Return slowly, stretching your calves.'],
 err:['Bending the knees', 'Unstable footing — heels slipping off'],
 breath:'Exhale as you press, inhale as you return.',
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
{id:'inclinebb', name:'Incline barbell bench press', eq:[['bb'], ['incline']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps'], type:'c', lvl:2,
 tech:['Set the backrest to 30–45° and lie so the bar is above your eyes. Shoulder blades squeezed, feet on the floor.',
   'Grip slightly wider than shoulders. Unrack the bar and bring it over your upper chest.',
   'Lower the bar to your upper chest just below the collarbones, elbows at 45–60° to your torso.',
   'Press the bar up in a vertical path.'],
 err:['Hips and shoulder blades lifting off the bench', 'Backrest too steep — mostly the shoulders work', 'Bouncing the bar off the chest'],
 breath:'Inhale as you lower, exhale after the hardest point of the press.',
 note:'Use a spotter with heavy weights.',
 anim:{view:'side',
  A:{hip:[112, 128], torso:-55, arm:{ik:[76, 44], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  B:{hip:[112, 128], torso:-55, arm:{ik:[79, 90], b:'down'}, leg:{ik:[162, 180], b:'up', f:90}},
  props:[...inclineBench([112, 128], -55), PLATE(16)]}},
{id:'declinebb', name:'Decline barbell bench press', eq:[['bb'], ['decline']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:2,
 tech:['Lock your legs under the rollers and lie so the bar is above your eyes. Bench decline 15–30°.',
   'Squeeze your shoulder blades, grip slightly wider than shoulders. Unrack the bar with a spotter.',
   'Lower the bar to your lower chest, elbows at 45–60° to your torso.',
   'Press the bar up and slightly toward your head.'],
 err:['Grip too wide', 'Bouncing the bar off the chest', 'Training without a spotter: unracking and racking the bar head-down is awkward'],
 breath:'Inhale as you lower, exhale as you press.',
 note:'Don\'t stay head-down between sets. If you have high blood pressure, replace this exercise with a flat bench press.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-112, arm:{ik:add(shFromHip([118, 126], -112), [2, -55]), b:'down'}, leg:{a:[58, 150], fr:-90}},
  B:{hip:[118, 126], torso:-112, arm:{ik:add(shFromHip([118, 126], -112), [13, -13]), b:'down'}, leg:{a:[58, 150], fr:-90}},
  props:[...declineBench([118, 126], -112, [58, 150]), PLATE(16)]}},
{id:'closegrip', name:'Close-grip bench press', eq:[['bb'], ['bench']], g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:2,
 tech:['Lie on the bench, grip at shoulder width or slightly narrower, thumbs wrapped around the bar.',
   'Shoulder blades squeezed, feet on the floor.',
   'Lower the bar to your lower chest, keeping your elbows close to your body.',
   'Press the bar up, fully extending your elbows.'],
 err:['Grip too narrow — overloads the wrists', 'Elbows flaring out', 'Hips lifting off the bench'],
 breath:'Inhale on the way down, exhale as you press.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 72], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[82, 112], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), PLATE(16)]}},
{id:'pullover', name:'Dumbbell pullover', eq:[['db'], ['bench']], g:'chest', pri:['chest', 'lats'], sec:['triceps'], type:'i', lvl:1,
 tech:['Lie on the bench and hold a dumbbell with both hands by the top plate over your chest, elbows slightly bent.',
   'Lower the dumbbell in an arc behind your head until you feel a stretch in your chest and lats.',
   'Bring the dumbbell back along the same arc over your chest without bending your elbows further.'],
 err:['Bending the elbows — it turns into a lying triceps extension', 'Going too deep with shoulder pain', 'Arching the lower back'],
 breath:'Inhale as you lower, exhale as you return.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{a:[-4, -6]}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{a:[-98, -104]}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), {k:'db', at:'grips', o:'along', len:20, layer:'front'}]}},
{id:'declinepush', name:'Decline push-ups (feet on bench)', eq:[['bench']], g:'chest', pri:['chest', 'delt_f'], sec:['triceps', 'abs'], type:'c', lvl:2,
 tech:['Place your toes on the bench, hands on the floor slightly wider than shoulders. Body in a straight line.',
   'Lower until your chest almost touches the floor; elbows at 30–45° to your torso.',
   'Push yourself up without sagging in the lower back.'],
 err:['Sagging lower back', 'Head reaching the floor before the chest', 'Partial range of motion'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:plankA([16, 126], 90.4, {arm:{ik:[152, 181], b:'back', hA:90}}),
  B:plankA([16, 126], 103.5, {arm:{ik:[152, 181], b:'back', hA:90}}),
  props:benchFlat(0, 44, 139)}},

/* ===== СПИНА ===== */
{id:'invrow', name:'Inverted rows', eq:[['smith', 'pullup']], g:'back', pri:['midback', 'lats'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Set a bar or low rail at waist height. Grab it overhand slightly wider than shoulders and lie under it, heels on the floor.',
   'Body in a straight line, glutes and abs tight.',
   'Pull your chest to the bar, squeezing your shoulder blades and driving your elbows back.',
   'Lower to straight arms.'],
 err:['Sagging hips', 'Pulling with the chin instead of the chest', 'Partial range of motion'],
 breath:'Exhale as you pull up, inhale as you lower.',
 note:'Requires a low rail or a Smith machine bar. The lower the bar and the straighter your legs, the harder it gets.',
 anim:{view:'side', A:invPose(4.5), B:invPose(24),
  props:[{k:'line', pts:[[60, 30], [60, GROUND]], w:3, cls:'eq-rail'}, {k:'circle', c:[60, 110], r:4.5}]}},
{id:'straightpull', name:'Straight-arm cable pullover', eq:[['cable']], g:'back', pri:['lats'], sec:['triceps', 'midback'], type:'i', lvl:1,
 tech:['Face the high pulley, take a straight bar or rope overhand, step back and lean your torso slightly forward.',
   'Arms nearly straight. Pull the handle in an arc to your thighs, depressing your shoulders and squeezing your shoulder blades.',
   'Slowly return your arms to head height.'],
 err:['Bending the elbows — it becomes a pulldown', 'Swinging the torso', 'Shrugging the shoulders to the ears'],
 breath:'Exhale as you pull the handle down, inhale as you return.',
 anim:{view:'side', A:stand({hip:[88, 97], torso:16, arm:{a:[26, 30]}}), B:stand({hip:[88, 97], torso:16, arm:{a:[170, 168]}}),
  props:[{k:'line', pts:[[172, -6], [172, GROUND]], w:5}, {k:'cable', from:[166, 0], at:'grips', handle:true, layer:'front'}]}},
{id:'goodmorning', name:'Barbell good morning', eq:[['bb']], g:'hams', pri:['hams', 'lowback'], sec:['glutes'], type:'c', lvl:2,
 tech:['Bar on your traps, as in a squat. Feet hip-width apart, knees slightly bent.',
   'Push your hips back and hinge forward with a straight back until your torso is almost parallel to the floor.',
   'Stand back up by driving your hips forward.'],
 err:['Rounding the back', 'Bending the knees like a squat', 'Heavy weight before mastering the technique'],
 breath:'Inhale as you bend, exhale as you rise.',
 note:'Start with an empty bar.',
 anim:{view:'side',
  A:Object.assign({hip:[92, 97], torso:2, arm:{tf:[51, -6], b:'down'}}, legsAt(100)),
  B:Object.assign({hip:[70, 103], torso:80, arm:{tf:[51, -6], b:'down'}}, legsAt(100)),
  props:[{k:'plate', tf:[53, -10], r:17, layer:'mid'}]}},

/* ===== ПЛЕЧИ ===== */
{id:'arnold', name:'Arnold press', eq:[['db'], ['incline', 'bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:2,
 tech:['Sit on a bench with back support. Dumbbells at your upper chest, palms facing you, elbows in front of your body.',
   'As you start pressing, spread your elbows out and rotate your palms to face forward.',
   'Press the dumbbells overhead. Lower them by reversing the movement.'],
 err:['Arching the lower back', 'Rotating the wrists abruptly without control', 'Heavy dumbbells at the expense of range of motion'],
 breath:'Exhale as you press, inhale as you lower.',
 anim:{view:'front',
  keys:[frontSeat({arm:{p:[[4, 19], [5, -7]]}}), frontSeat({arm:{p:[[26, 6], [27, -20]]}}), frontSeat({arm:{p:[[14, -24], [8, -52]]}})],
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'db', at:'gripR', o:'h', layer:'front'}, {k:'db', at:'gripL', o:'h', layer:'front'}]}},
{id:'cablelat', name:'Low-pulley lateral raise', eq:[['cable']], g:'shoulders', pri:['delt_s'], sec:['traps'], type:'i', lvl:1, uni:true,
 tech:['Stand sideways to the cable, handle in the hand farther from the machine, hold the frame with your other hand.',
   'Raise your arm out to the side to shoulder height, elbow slightly bent.',
   'Slowly lower your arm, keeping tension on the cable. Then switch sides.'],
 err:['Leaning away from the machine', 'Shrugging the shoulder toward the ear', 'Jerking at the start of the movement'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'front',
  A:frontStand({armR:{p:[[-1, 28], [-8, 54]]}, armL:{p:[[26, 18], [48, 32]]}}),
  B:frontStand({armR:{p:[[29, 2], [55, 6]]}, armL:{p:[[26, 18], [48, 32]]}}),
  props:[{k:'line', pts:[[28, 30], [28, GROUND]], w:5}, {k:'cable', from:[34, 180], at:'gripR', handle:true, layer:'front'}]}},
{id:'reversefly', name:'Reverse pec deck fly', eq:[['pecdeck']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Sit facing the machine pad, chest against the support, handles at shoulder height.',
   'Open your nearly straight arms back and out, squeezing your shoulder blades.',
   'Hold for a second and smoothly bring your arms back.'],
 err:['Chest lifting off the pad', 'Bending the elbows and pulling with the arms', 'Shrugging the shoulders to the ears'],
 breath:'Exhale as you open, inhale as you return.',
 viewNote:'rear view',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[-8, 3], [-16, 5]]}}),
  B:frontSeat({arm:{p:[[28, 2], [54, 4]]}}),
  props:[{k:'line', pts:[[100, 26], [100, GROUND]], w:5}, {k:'line', pts:[[56, 26], [144, 26]], w:5}, {k:'rect', x:72, y:130, w:56, h:9},
   {k:'db', at:'gripR', o:'v', len:14, layer:'front'}, {k:'db', at:'gripL', o:'v', len:14, layer:'front'}]}},
{id:'bandfacepull', name:'Resistance band face pull', eq:[['band']], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Anchor the band at forehead height — on a door anchor or rack. Grab the ends overhand and step back until there is tension.',
   'Pull the band toward your face, spreading your hands and driving your elbows high and wide.',
   'Hold with your shoulder blades squeezed, then return slowly.'],
 err:['Elbows below the hands', 'Leaning the torso back', 'Shrugging the shoulders'],
 breath:'Exhale as you pull, inhale on the return.',
 anim:{view:'front', viewNote:'front view, band anchored in front of the athlete',
  A:frontStand({arm:{p:[[14, 10], [18, 4]]}}),
  B:frontStand({arm:{p:[[32, -2], [24, -20]]}}),
  props:[{k:'rect', x:96, y:28, w:8, h:12, rx:2}, {k:'band', from:[100, 34], at:'gripL', layer:'front'}, {k:'band', from:[100, 34], at:'gripR', layer:'front'}]}},

/* ===== БИЦЕПС ===== */
{id:'preacher', name:'Preacher curl', eq:[['preacher'], ['bb', 'db']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Sit so the top edge of the pad is under your armpits and your upper arms rest on the pad.',
   'Underhand grip. Curl the weight toward your shoulders; upper arms stay on the pad.',
   'Lower slowly to almost full extension, without jerking at the bottom.'],
 err:['Snapping straight at the bottom — strains the elbow ligaments', 'Upper arms lifting off the pad', 'Leaning the torso back'],
 breath:'Exhale as you curl, inhale as you lower.',
 anim:(() => {
   const hip = [78, 140], sh = shFromHip(hip, 10), p0 = add(add(sh, dir(235), 11), dir(145), 2), p1 = add(p0, dir(145), 38);
   return {view:'side',
    A:{hip, torso:10, arm:{a:[145, 152]}, leg:{a:[90, 180], f:90}},
    B:{hip, torso:10, arm:{a:[145, 22]}, leg:{a:[90, 180], f:90}},
    props:[{k:'line', pts:[[p1[0] - 4, p1[1]], [p1[0] - 4, GROUND]], w:4}, {k:'rect', x:58, y:150, w:40, h:8}, {k:'line', pts:[[78, 158], [78, GROUND]], w:4},
     {k:'line', pts:[p0, p1], w:9, cls:'eq-pad-s', layer:'mid'}, {k:'plate', at:'grips', r:13, layer:'mid', if:'bb'}, ...DB_SIDES('end', 'db')]};
 })()},
{id:'inclinecurl', name:'Incline dumbbell curl', eq:[['db'], ['incline']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Set the backrest to 45–60°, sit down and press your back into it. Dumbbells hang at arm\'s length, palms forward.',
   'Curl the weights without bringing your elbows forward.',
   'Lower slowly to full extension, feeling the stretch in your biceps.'],
 err:['Elbows drifting forward', 'Back and shoulders lifting off the backrest', 'Not fully extending at the bottom'],
 breath:'Exhale as you curl, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[92, 128], torso:-32, arm:{a:[182, 180]}, leg:{ik:[140, 180], b:'up', f:90}},
  B:{hip:[92, 128], torso:-32, arm:{a:[178, 28]}, leg:{ik:[140, 180], b:'up', f:90}},
  props:[...inclineBench([92, 128], -32), ...DB_SIDES('end')]}},
{id:'concentration', name:'Concentration curl', eq:[['db'], ['bench']], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1, uni:true,
 tech:['Sit on the edge of a bench, feet wide. Brace the elbow of your working arm against your inner thigh.',
   'Curl the dumbbell toward your shoulder; upper arm stays still.',
   'Hold for a second and lower slowly. Then switch arms.'],
 err:['Using the torso for momentum', 'Elbow lifting off the thigh'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:[78, 140], torso:42, armN:{a:[174, 176]}, armF:{a:[140, 104]}, legN:{ik:[124, 180], b:'up', f:90}, legF:{ik:[120, 180], b:'up', f:90}},
  B:{hip:[78, 140], torso:42, armN:{a:[172, 34]}, armF:{a:[140, 104]}, legN:{ik:[124, 180], b:'up', f:90}, legF:{ik:[120, 180], b:'up', f:90}},
  props:[...benchFlat(46, 100, 150), {k:'db', at:'gripN', o:'end', layer:'front'}]}},

/* ===== ТРИЦЕПС ===== */
{id:'kickback', name:'Dumbbell triceps kickback', eq:[['db'], ['bench']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1, uni:true,
 tech:['Brace your knee and hand on the bench, torso almost parallel to the floor. Upper arm of the working arm tight to your side.',
   'Extend your arm back to a straight line and hold for a second.',
   'Return to a 90° elbow angle; upper arm stays still. Then switch arms.'],
 err:['Upper arm dropping and swinging', 'Dropping the dumbbell down', 'Twisting the torso'],
 breath:'Exhale as you extend, inhale as you return.',
 anim:{view:'side',
  A:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{a:[250, 178]}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  B:{hip:[70, 100], torso:70, armF:{ik:[122, 136], b:'back', hA:90}, armN:{a:[250, 252]}, legF:{a:[180, 270], f:230}, legN:{ik:[86, 180], b:'fwd', f:90}},
  props:[...benchFlat(18, 140, 138), {k:'db', at:'gripN', o:'perp', layer:'front'}]}},

/* ===== ПРЕСС ===== */
{id:'declinecrunch', name:'Ab bench crunches', eq:[['abbench', 'decline']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Lock your feet under the rollers, lie on the incline bench, arms crossed over your chest.',
   'Crunch up, lifting your shoulder blades and bringing your ribs toward your pelvis, to about 45° from the bench.',
   'Lower slowly without resting your shoulder blades on the bench to keep the tension.'],
 err:['Jerking the torso', 'Pulling on the head with the hands', 'Coming up to vertical using the hip flexors'],
 breath:'Exhale as you crunch, inhale as you lower.',
 note:'The steeper the incline, the harder it gets. To progress, hold a plate at your chest.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-112, head:0, arm:{ra:[155, 25]}, leg:{a:[58, 150], fr:-90}},
  B:{hip:[118, 126], torso:-58, head:16, arm:{ra:[155, 25]}, leg:{a:[58, 150], fr:-90}},
  props:declineBench([118, 126], -112, [58, 150])}},
{id:'captainraise', name:'Captain\'s chair knee raise', eq:[['captain']], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Get into the captain\'s chair: back against the pad, forearms on the supports, legs hanging.',
   'Raise your knees to your chest, tilting your pelvis slightly forward.',
   'Lower your legs slowly without swinging.'],
 err:['Swinging and dropping the legs', 'Lower back lifting off the pad', 'Shoulders shrugging up to the ears'],
 breath:'Exhale as you raise your knees, inhale as you lower.',
 note:'With straight legs the exercise is much harder.',
 anim:{view:'side',
  A:{hip:[100, 92], torso:0, arm:{a:[180, 90], hA:90}, leg:{a:[178, 186], fr:-60}},
  B:{hip:[100, 92], torso:-6, arm:{a:[180, 90], hA:90}, leg:{a:[84, 174], fr:-60}},
  props:[{k:'line', pts:[[83, 30], [83, GROUND]], w:5}, {k:'line', pts:[[70, GROUND], [120, GROUND]], w:4},
   {k:'rect', x:80, y:36, w:9, h:78, rx:4}, {k:'rect', x:96, y:73, w:36, h:6, rx:3}, {k:'line', pts:[[83, 76], [96, 76]], w:4}, {k:'circle', c:[134, 70], r:3.5}]}},
{id:'hangknee', name:'Hanging knee raise', eq:[['pullup']], g:'abs', pri:['abs'], sec:['obliques', 'forearms'], type:'i', lvl:2,
 tech:['Hang from the bar with an overhand grip, shoulders pulled down.',
   'Pull your knees to your chest, curling your pelvis up.',
   'Lower your legs slowly without swinging.'],
 err:['Swinging like a pendulum', 'Dropping the legs', 'Raising the knees without curling the pelvis'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side', noGround:true,
  A:{hip:hipFromSh([100, 83], 0), torso:0, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[180, 182], fr:-40}},
  B:{hip:hipFromSh([100, 83], -10), torso:-10, arm:{ik:[100, 26], b:'fwd'}, leg:{a:[82, 176], fr:-40}},
  props:[{k:'circle', c:[100, 24], r:4.5}, {k:'line', pts:[[70, 24], [130, 24]], w:2, cls:'eq-rail'}]}},
{id:'rollout', name:'Kneeling ab wheel rollout', eq:[['abwheel']], g:'abs', pri:['abs'], sec:['obliques', 'lats', 'delt_f'], type:'c', lvl:2,
 tech:['Kneel with the ab wheel under your shoulders, arms straight. Brace your abs and glutes, lower back slightly rounded.',
   'Roll the wheel forward, extending your body as long as your lower back stays neutral.',
   'Return to the start using your abs, not your arms.'],
 err:['Arching the lower back', 'Rolling out too far for your level', 'Returning by moving the hips'],
 breath:'Inhale as you roll out, exhale as you return.',
 anim:{view:'side',
  A:{hip:hipFromSh([128, 113], 64), torso:64, arm:{ik:[128, 170], b:'back'}, leg:{ik:[40, 180], b:'down', f:200}},
  B:{hip:[108, 158], torso:84, arm:{ik:[210, 170], b:'back'}, leg:{ik:[40, 180], b:'down', f:200}},
  props:[{k:'plate', at:'grips', r:8, off:[0, 2], layer:'mid'}]}},
{id:'sidebend', name:'Dumbbell side bend', eq:[['db']], g:'abs', pri:['obliques'], sec:['abs'], type:'i', lvl:1, uni:true,
 tech:['Stand tall, dumbbell in one hand, other hand behind your head.',
   'Bend sideways toward the dumbbell without tipping forward or back.',
   'Return upright by contracting the obliques on the opposite side. Then switch sides.'],
 err:['Leaning forward', 'Jerky reps', 'Dumbbells in both hands: the load balances out and the obliques don\'t work'],
 breath:'Inhale as you bend, exhale as you return.',
 anim:{view:'front',
  A:{c:[100, 97], torso:0, armR:{p:[[2, 29], [3, 56]]}, armL:{p:[[18, -20], [4, -30]]}, leg:{p:[[6, 43], [10, 85]]}},
  B:{c:[100, 97], torso:20, armR:{p:[[2, 29], [3, 56]]}, armL:{p:[[18, -20], [4, -30]]}, leg:{p:[[6, 43], [10, 85]]}},
  props:[{k:'db', at:'gripR', layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'glutekick', name:'Cable kickback (low pulley)', eq:[['cable']], g:'glutes', pri:['glutes'], sec:['hams'], type:'i', lvl:1, uni:true,
 tech:['Attach the cuff to your ankle, face the machine and hold the frame.',
   'Lean your torso slightly forward, keep the standing knee soft.',
   'Kick your leg back until your hip is fully extended, squeezing the glute.',
   'Slowly bring the leg back. Then switch sides.'],
 err:['Arching the lower back instead of extending the hip', 'Swinging', 'Too much weight'],
 breath:'Exhale as you kick back, inhale as you return.',
 anim:{view:'side',
  A:{hip:[90, 97], torso:20, arm:{ik:[140, 72], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[182, 182], f:90}},
  B:{hip:[90, 97], torso:20, arm:{ik:[140, 72], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[214, 222], f:112}},
  props:[{k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'cable', from:[146, 180], at:'anN', handle:true, layer:'front'}]}},

/* ===== КАРДИО ===== */
{id:'jumpingjack', name:'Jumping jacks', eq:[], g:'cardio', pri:['calves', 'delt_s'], sec:['quads', 'glutes'], type:'c', lvl:1, kind:'time',
 tech:['Stand tall, arms at your sides.',
   'Jump your feet wider than shoulders and raise your arms out to the sides overhead.',
   'Jump back to the start position. Land softly on the balls of your feet.'],
 err:['Landing on straight legs and heels', 'Holding your breath'],
 breath:'Breathe rhythmically with the pace of the jumps.',
 anim:{view:'front', period:1600,
  keys:[frontStand({arm:{p:[[2, 29], [3, 56]]}, leg:{p:[[1, 43], [1, 85]]}}),
   {c:[100, 93], arm:{p:[[29, 4], [56, 6]]}, leg:{p:[[7, 42], [13, 83]]}},
   {c:[100, 91], arm:{p:[[14, -25], [10, -53]]}, leg:{p:[[11, 42], [22, 82]]}}]}},
{id:'burpee', name:'Burpees', eq:[], g:'cardio', pri:['quads', 'chest', 'delt_f'], sec:['glutes', 'triceps', 'abs'], type:'c', lvl:2,
 tech:['From standing, squat down and place your palms on the floor.',
   'Jump your feet back into a high plank; add a push-up if you like.',
   'Jump your feet back to your hands and jump up, reaching your arms overhead.'],
 err:['Sagging lower back in the plank', 'Landing on straight legs', 'Long pauses between phases'],
 breath:'Exhale as you jump up and as you push off the floor.',
 anim:{view:'side', period:4600,
  keys:[{hip:[94, 84], torso:0, arm:{ik:[100, -24], b:'back', hA:0}, legN:{ik:[98, 170], b:'fwd', f:140}, legF:{ik:[98, 170], b:'fwd', f:140}},
   {hip:[92, 97], torso:0, arm:{ik:[95, 99], b:'back', hA:180}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{ik:[98, 180], b:'fwd', f:90}},
   {hip:[78, 146], torso:62, arm:{ik:[126, 180], b:'back', hA:90}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{ik:[98, 180], b:'fwd', f:90}},
   {hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 180], b:'back', hA:90}, legN:{ik:[10, 171], b:'fwd', f:160}, legF:{ik:[10, 171], b:'fwd', f:160}}]}},
{id:'mountain', name:'Mountain climbers', eq:[], g:'cardio', pri:['abs', 'quads'], sec:['delt_f', 'chest'], type:'c', lvl:1, kind:'time',
 tech:['Get into a high plank on straight arms, palms under shoulders.',
   'Quickly drive your knees to your chest one at a time, keeping hips level with shoulders.',
   'Breathe rhythmically, don\'t hike your hips up.'],
 err:['Hips rise up', 'Shoulders drift back from the hands', 'Short range of the steps'],
 breath:'Rhythmic breathing, no breath-holding.',
 anim:{view:'side', period:1400,
  A:{hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 181], b:'back', hA:90}, legN:{ik:[92, 166], b:'fwd', f:160}, legF:{ik:[10, 171], b:'fwd', f:160}},
  B:{hip:PLANK_TOP.hip, torso:70.4, arm:{ik:[139, 181], b:'back', hA:90}, legN:{ik:[10, 171], b:'fwd', f:160}, legF:{ik:[92, 166], b:'fwd', f:160}}}},
{id:'jumpsquat', name:'Jump squats', eq:[], g:'cardio', pri:['quads', 'glutes', 'calves'], sec:['hams'], type:'c', lvl:2,
 tech:['Feet shoulder-width apart. Squat to parallel or slightly above, swinging your arms back.',
   'Jump up explosively, using an arm swing.',
   'Land softly on the balls of your feet, roll onto the whole foot and drop straight into the next squat.'],
 err:['Landing on straight legs', 'Knees cave in on landing', 'Squatting without controlling depth'],
 breath:'Exhale as you jump, inhale as you squat.',
 anim:{view:'side', period:2200,
  keys:[Object.assign({hip:[72, 146], torso:38, arm:{a:[212, 210]}}, legsAt(98)),
   Object.assign({hip:[95, 90], torso:0, arm:{a:[40, 38]}}, legsAt(99, 172, 'fwd', 130)),
   Object.assign({hip:[95, 74], torso:0, arm:{a:[24, 22]}}, legsAt(99, 158, 'fwd', 150))]}},
{id:'thruster', name:'Dumbbell thrusters', eq:[['db']], g:'cardio', pri:['quads', 'glutes', 'delt_f'], sec:['triceps', 'abs', 'delt_s'], type:'c', lvl:2,
 tech:['Dumbbells at your shoulders, elbows pointing forward. Feet shoulder-width apart.',
   'Squat to parallel, keeping your torso upright.',
   'Drive up powerfully and press the dumbbells overhead in one fluid motion.',
   'Lower the dumbbells to your shoulders and go into the next rep.'],
 err:['Pressing before the legs are straight', 'Arching the lower back at the top', 'Elbows drop in the squat'],
 breath:'Exhale as you stand and press, inhale as you squat.',
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
  bbrow:['Elbows drive the weight toward your waist. Keep your torso still.','Lower the bar under control, gradually straightening your arms.'],
  dbrow:['Drive your elbow back. Don\'t rotate your hips or chest.','Return the dumbbell under your shoulder. Keep your support on the bench.'],
  cablerow:['Pull the handle to your stomach, drive your elbows back.','Straighten your arms with control, keep your torso position.'],
  bandrow:['Bend your elbows and pull the band to your waist.','Return your arms forward without jerking or swinging your torso.'],
  kbswing:['The hip extension drives the kettlebell. Arms stay long.','Meet the kettlebell by pushing your hips back; don\'t squat after it.'],
  deadlift:['Push the floor away with your legs. Arms straight, bar travels along your legs.','Push your hips back first, then bend your knees.'],
  rdl:['Hips back, knees soft. Arms hold the weight without bending.','Extend your hips, keeping your back controlled and arms straight.'],
  crunch:['Bring your ribs toward your pelvis, gradually lifting your shoulder blades.','Uncurl your chest back down, don\'t drop to the floor.'],
  declinecrunch:['Curl your chest toward your pelvis; don\'t sit all the way up.','Return smoothly to the bench, keeping your torso controlled.'],
  latraise:['Lead with your elbows out to the sides up to shoulder height.','Lower your arms in an arc, without swinging.'],
  bandlatraise:['Raise your elbows out to the sides; don\'t shrug toward your ears.','Release the band tension smoothly.'],
  dbpress:['Press the dumbbells overhead without help from your lower back.','Lower the dumbbells under control to the start position.'],
  pullup:['Pull your body to the fixed bar, driving your elbows down.','Lower with control; keep your grip.'],
  chinup:['Pull your body up to the bar without swinging.','Straighten your arms smoothly, keeping your grip.'],
  squat:['Bend your knees and hips, keep your whole foot planted.','Extend your legs and hips together, without jerking your torso.']
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
{id:'wallpush', name:'Wall push-ups', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Stand a step from the wall, palms on the wall at chest height, slightly wider than shoulders.', 'Bend your elbows, bringing your chest to the wall; body straight, heels down.', 'Push back to straight arms.'],
 err:['Arching the lower back', 'Elbows flared to 90°', 'Too close to the wall: no load'],
 breath:'Inhale toward the wall, exhale away from it.',
 anim:{view:'side',
  A:{hip:[84, 100], torso:12, arm:{a:[96, 94], hA:0}, leg:{ik:[70, 180], b:'fwd', f:90}},
  B:{hip:[94, 98], torso:22, arm:{a:[120, 48], hA:0}, leg:{ik:[70, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[132, 0], [132, GROUND]], w:6, cls:'eq-rail'}]}},
{id:'inclinepush', name:'Incline push-ups', eq:[['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Palms on a bench or stable surface slightly wider than shoulders, body straight from heels to crown.', 'Lower your chest to the bench edge, elbows at 45° to your body.', 'Press yourself up to straight arms.'],
 err:['Sagging hips', 'Head drops before the chest', 'Partial range of motion'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:plankA([10, 171], 58, {arm:{ik:[128, 136], b:'back', hA:90}}),
  B:plankA([10, 171], 66, {arm:{ik:[128, 136], b:'back', hA:90}}),
  props:benchFlat(104, 160, 139)}},
{id:'kneepush', name:'Knee push-ups', eq:[], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Weight on palms and knees, shins can be crossed. Straight line from knees to crown, hips don\'t sit back.', 'Lower your chest to the floor, elbows at 45° to your body.', 'Press up to straight arms.'],
 err:['Hips pushed back: only the arms work', 'Arching the lower back', 'Elbows flared out'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:hipFromSh([126, 124], 54), torso:54, arm:{ik:[139, 181], b:'back', hA:90}, leg:{a:[234, 270], f:250}},
  B:{hip:hipFromSh([141, 157], 76), torso:76, arm:{ik:[139, 181], b:'back', hA:90}, leg:{a:[256, 270], f:250}}}},
{id:'widepush', name:'Wide push-ups', eq:[], g:'chest', pri:['chest'], sec:['delt_f', 'triceps'], type:'c', lvl:2,
 tech:['Palms one and a half times shoulder width, fingers turned slightly out. Body straight.', 'Lower until your chest is 3–5 cm from the floor; elbows go out, but not above shoulder level.', 'Press yourself up, squeezing your chest.'],
 err:['Elbows above shoulders: stress on the shoulder joints', 'Sagging hips'],
 breath:'Inhale down, exhale up.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 100], arm:{p:[[30, 18], [34, 46]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[100, 100], arm:{p:[[34, 4], [36, 12]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  props:[{k:'rect', x:46, y:0, w:108, h:190, rx:14, cls:'eq-mat', layer:'back'}], viewNote:'top view'}},
{id:'archer', name:'Archer push-ups', eq:[], g:'chest', pri:['chest', 'triceps'], sec:['delt_f', 'abs'], type:'c', lvl:3, uni:true,
 tech:['Palms wide. Lower toward one hand while the other arm straightens out to the side and slides along the floor.', 'Chest to the working hand, elbow close to your body.', 'Press back to center and repeat on the other side.'],
 err:['Torso rotation', 'Supporting arm not vertical', 'Hips sag'],
 breath:'Inhale down, exhale up.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 100], armR:{p:[[32, 20], [36, 46]]}, armL:{p:[[32, 20], [36, 46]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[108, 100], armR:{p:[[16, 4], [14, 16]]}, armL:{p:[[30, 2], [58, 3]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  props:[{k:'rect', x:40, y:0, w:124, h:190, rx:14, cls:'eq-mat', layer:'back'}], viewNote:'top view'}},
{id:'declinepike', name:'Feet-elevated pike push-ups', eq:[['bench']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'traps'], type:'c', lvl:3,
 tech:['Feet on a bench, hips high, torso nearly vertical, palms shoulder-width apart.', 'Lower the top of your head to the floor, bending your elbows; elbows go forward and down, not out.', 'Press yourself up to straight arms.'],
 err:['Hips drop: it turns into a decline push-up', 'Hitting the floor with your head', 'Elbows flared out'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[86, 62], torso:150, arm:{ik:[124, 181], b:'back', hA:90}, leg:{ik:[30, 134], b:'fwd', f:160}},
  B:{hip:[100, 84], torso:160, arm:{ik:[124, 181], b:'back', hA:90}, leg:{ik:[30, 134], b:'fwd', f:160}},
  props:benchFlat(0, 48, 140)}},

/* --- спина без турника --- */
{id:'superman', name:'Superman hold', eq:[], g:'back', pri:['lowback'], sec:['glutes', 'delt_r', 'midback'], type:'i', lvl:1,
 tech:['Lie on your stomach, arms extended forward, toes pointed.', 'Lift your chest, arms and legs a few centimeters at once, eyes on the floor.', 'Hold for 1–2 seconds and lower.'],
 err:['Throwing your head back', 'Jerking', 'Holding your breath'],
 breath:'Exhale as you lift, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[100, 176], torso:92, head:-24, arm:{a:[94, 94], hA:94}, leg:{a:[270, 270], fr:-90}},
  B:{hip:[100, 173], torso:80, head:-22, arm:{a:[66, 66], hA:66}, leg:{a:[256, 256], fr:-90}}}},
{id:'ytw', name:'Prone Y-T-W raises', eq:[], g:'back', pri:['midback', 'delt_r'], sec:['traps', 'lowback'], type:'i', lvl:1,
 tech:['Lie on your stomach, forehead on a towel. Raise straight arms forward and out in a Y, thumbs up.', 'Lower, then raise your arms straight out to the sides (T), then bend your elbows to 90° and raise (W).', 'Three positions make one rep. Squeeze your shoulder blades in each.'],
 err:['Lifting the torso instead of the arms', 'Shoulders shrugging up to the ears', 'Jerky reps'],
 breath:'Exhale as you raise your arms, inhale as you lower.',
 anim:{view:'front', noGround:true, period:3600,
  keys:[{c:[100, 108], arm:{p:[[28, -14], [52, -26]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
   {c:[100, 108], arm:{p:[[30, 0], [58, 0]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
   {c:[100, 108], arm:{p:[[26, 2], [30, -22]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}}],
  viewNote:'top view'}},
{id:'towelrow', name:'Door towel row', eq:[], g:'back', pri:['lats', 'midback'], sec:['biceps', 'forearms'], type:'c', lvl:1,
 tech:['Loop a towel around the handles of a closed door, hold the ends, feet by the door. Lean back on straight arms.', 'Pull your chest to the door, driving your elbows back and squeezing your shoulder blades.', 'Return smoothly to straight arms. The lower the lean, the harder it gets.'],
 err:['Sagging hips', 'Shrugging up', 'Snapping back on the return'],
 breath:'Exhale as you pull, inhale on the return.',
 note:'Make sure the door is closed and the handles are secure.',
 anim:{view:'side', A:leanBack(18, [144, 180], [148, 86]), B:leanBack(6, [144, 180], [148, 86]),
  props:[{k:'line', pts:[[150, 20], [150, GROUND]], w:5, cls:'eq-rail'}, {k:'circle', c:[148, 86], r:4}, {k:'band', from:[148, 86], at:'gripN', layer:'front', cls:'eq-cable'}]}},
{id:'tablerow', name:'Under-table row', eq:[], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:2,
 tech:['Lie under a sturdy table, grip the edge overhand, heels on the floor, body straight.', 'Pull your chest to the tabletop, squeezing your shoulder blades.', 'Lower to straight arms. Bend your knees to make it easier.'],
 err:['Sagging hips', 'Pulling with the chin', 'Jerking'],
 breath:'Exhale as you pull, inhale as you lower.',
 note:'The table must hold your weight; the edge must have no sharp corners.',
 anim:{view:'side', A:invPose(10), B:invPose(28),
  props:[{k:'rect', x:20, y:106, w:120, h:6}, {k:'line', pts:[[26, 112], [26, GROUND]], w:4}, {k:'line', pts:[[134, 112], [134, GROUND]], w:4}]}},
{id:'reversesnow', name:'Reverse snow angels', eq:[], g:'shoulders', pri:['delt_r', 'midback'], sec:['traps'], type:'i', lvl:1,
 tech:['Lie on your stomach, arms at your sides palms down, chest slightly lifted.', 'Slowly sweep your straight arms in an arc out to the sides and overhead without touching the floor.', 'Return along the same arc. Keep your shoulder blades down throughout.'],
 err:['Shoulders to ears', 'Arms touch the floor', 'Jerking the torso up'],
 breath:'Breathe steadily, don\'t hold your breath.',
 anim:{view:'front', noGround:true, period:3400,
  A:{c:[100, 108], arm:{p:[[6, 28], [8, 54]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  B:{c:[100, 108], arm:{p:[[22, -22], [12, -48]]}, leg:{p:[[4, 42], [5, 84]], fd:[2, 4]}},
  viewNote:'top view'}},

/* --- ноги --- */
{id:'wallsit', name:'Wall sit', eq:[], g:'quads', pri:['quads'], sec:['glutes'], type:'i', lvl:1, kind:'time',
 tech:['Back pressed against the wall, feet forward hip-width apart.', 'Slide down until your thighs are parallel to the floor; knees over heels, 90° angle.', 'Hold the position for the set time, hands off your thighs.'],
 err:['Knees past toes', 'Hips above knees', 'Hands pushing on thighs'],
 breath:'Calm breathing.',
 anim:{view:'side',
  A:{hip:[84, 138], torso:0, arm:{a:[180, 180]}, leg:{ik:[128, 180], b:'fwd', f:90}},
  B:{hip:[84, 137], torso:0, arm:{a:[180, 180]}, leg:{ik:[128, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[72, 0], [72, GROUND]], w:6, cls:'eq-rail'}]}},
{id:'revlunge', name:'Reverse lunges', eq:[], opt:['db'], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['From standing, step back and lower until your back knee almost touches the floor.', 'Front knee over the foot, torso upright.', 'Push off the front leg and return to standing. Alternate legs.'],
 err:['Short step', 'Leaning the torso forward', 'Knee caving in'],
 breath:'Inhale as you step back, exhale as you return.',
 anim:{view:'side', period:3200,
  keys:[stand({arm:{a:[180, 180]}}),
   {hip:[92, 118], torso:4, arm:{a:[180, 180]}, legN:{ik:[100, 180], b:'fwd', f:90}, legF:{ik:[56, 178], b:'fwd', f:150}},
   {hip:[90, 141], torso:4, arm:{a:[180, 180]}, legN:{ik:[100, 180], b:'fwd', f:90}, legF:{ik:[56, 172], b:'fwd', f:155}}],
  props:DB_SIDES('perp', 'db')}},
{id:'sidelunge', name:'Lateral lunges', eq:[], g:'quads', pri:['quads', 'glutes'], sec:['hams'], type:'c', lvl:1, uni:true,
 tech:['Feet wide, toes forward.', 'Bend one leg, pushing your hips back and to the side; the other leg stays straight, whole foot on the floor.', 'Push off and return to center, then go to the other side.'],
 err:['Knee caving in', 'Straight-leg foot lifting off', 'Rounding the back'],
 breath:'Inhale as you lower, exhale as you return.',
 anim:{view:'front',
  A:{c:[100, 97], arm:{p:[[2, 29], [3, 56]]}, leg:{p:[[22, 38], [30, 80]], fd:[6, 3]}},
  B:{c:[122, 128], armR:{p:[[-6, 24], [-18, 36]]}, armL:{p:[[-6, 24], [-18, 36]]}, legR:{p:[[8, 22], [10, 50]], fd:[6, 3]}, legL:{p:[[52, 24], [62, 50]], fd:[8, 3]}}}},
{id:'pistolbox', name:'Single-leg box squats', eq:[['bench']], g:'quads', pri:['quads', 'glutes'], sec:['hams', 'abs'], type:'c', lvl:2, uni:true,
 tech:['Stand on one leg with your back to a bench, the other leg extended forward, arms in front.', 'Lower slowly until you touch the bench, standing knee tracking over the toes.', 'Stand up without pushing off the bench. The lower the bench, the harder it gets.'],
 err:['Dropping onto the bench', 'Knee caving in', 'Heel lifting off'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[92, 98], torso:6, arm:{a:[90, 88]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[86, 90], f:120}},
  B:{hip:[82, 136], torso:30, arm:{a:[80, 76]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[72, 70], f:110}},
  props:benchFlat(20, 76, 140)}},
{id:'sllift', name:'Single-leg Romanian deadlift', eq:[], opt:['db'], g:'hams', pri:['hams', 'glutes'], sec:['lowback', 'calves'], type:'c', lvl:2, uni:true,
 tech:['Stand on one leg, knee soft. Hinge forward, extending the free leg back; one line from crown to heel.', 'Lower until your torso is nearly parallel to the floor.', 'Return by extending your hips. Then switch legs.'],
 err:['Hips opening to the side', 'Rounding the back', 'Bending the standing knee as in a squat'],
 breath:'Inhale as you bend, exhale as you rise.',
 anim:{view:'side',
  A:{hip:[92, 97], torso:-2, arm:{a:[180, 180]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[184, 182], f:92}},
  B:{hip:[80, 102], torso:80, arm:{a:[180, 180]}, legN:{ik:[98, 180], b:'fwd', f:90}, legF:{a:[278, 276], f:200}},
  props:[{k:'db', at:'gripN', o:'end', layer:'front', if:'db'}]}},
{id:'glutebridge1', name:'Single-leg glute bridge', eq:[], g:'glutes', pri:['glutes'], sec:['hams', 'abs'], type:'c', lvl:2, uni:true,
 tech:['Lying on your back, one foot near your hips, the other leg extended up or bent to your chest.', 'Lift your hips on the working leg to a straight shoulders-to-knee line.', 'Keep your hips level. Lower with control.'],
 err:['Hip tilt', 'Arching the lower back', 'Pushing through the toes'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:hipFromSh([58, 176], -90), torso:-90, head:0, arm:{a:[90, 90], hA:90}, legN:{ik:[146, 180], b:'up', f:90}, legF:{a:[-10, -8], fr:-80}},
  B:{hip:hipFromSh([58, 176], -122), torso:-122, head:30, arm:{a:[90, 90], hA:90}, legN:{ik:[146, 180], b:'up', f:90}, legF:{a:[-30, -28], fr:-80}}}},
{id:'nordic', name:'Nordic curls', eq:[], g:'hams', pri:['hams'], sec:['glutes', 'calves'], type:'c', lvl:3,
 tech:['Kneel with your feet anchored under a support or by a partner. Body straight from knees to head.', 'Slowly lower your torso forward, resisting with your hamstrings as long as possible.', 'At the bottom, catch your weight on your hands, push off and return. Don\'t bend at the hips.'],
 err:['Bending at the hips', 'Uncontrolled drop', 'Pushing back with the hands too quickly'],
 breath:'Inhale as you lower, exhale as you return.',
 note:'Feet must be securely anchored.',
 anim:{view:'side',
  A:{hip:[96, 137], torso:0, arm:{a:[168, 100], hA:100}, leg:{a:[180, 270], f:200}},
  B:{hip:[132.5, 157], torso:58, arm:{a:[150, 150], hA:150}, leg:{a:[238, 270], f:200}},
  props:[{k:'rect', x:46, y:166, w:22, h:9, rx:3, cls:'eq-pad'}, {k:'line', pts:[[57, 166], [57, 150]], w:4}]}},
{id:'calf1', name:'Single-leg calf raise', eq:[], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1, uni:true,
 tech:['Stand on one foot with the ball of the foot on the edge of a step, holding a support with one hand.', 'Rise onto your toes as high as you can and hold for a second.', 'Lower below the level of the step, stretching the calf.'],
 err:['Bouncing reps', 'Bending the knee', 'Pulling with the hand'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:[92, 98], torso:0, arm:{ik:[124, 90], b:'down'}, legN:{ik:[96, 180], b:'fwd', f:90}, legF:{a:[180, 240], f:140}},
  B:{hip:[94, 88], torso:0, arm:{ik:[124, 90], b:'down'}, legN:{ik:[97, 172], b:'fwd', f:130}, legF:{a:[180, 240], f:140}},
  props:[{k:'rect', x:84, y:174, w:40, h:12}, {k:'line', pts:[[130, 60], [130, GROUND]], w:5, cls:'eq-rail'}]}},

/* --- пресс --- */
{id:'deadbug', name:'Dead bug', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:1,
 tech:['Lie on your back, arms up, thighs vertical, knees at 90°, lower back pressed down.', 'Slowly lower your right arm overhead and extend your left leg toward the floor without lifting your lower back.', 'Return and repeat on the other side.'],
 err:['Lower back lifting off the floor', 'Rushing the tempo', 'Holding your breath'],
 breath:'Exhale as you extend, inhale as you return.',
 anim:{view:'side',
  A:{hip:[112, 175], torso:-90, arm:{a:[-90, -90], hA:-90}, leg:{a:[-2, 90], fr:-90}},
  B:{hip:[112, 175], torso:-90, armN:{a:[-176, -176], hA:-176}, armF:{a:[-90, -90], hA:-90}, legN:{a:[62, 70], fr:-90}, legF:{a:[-2, 90], fr:-90}}}},
{id:'birddog', name:'Bird dog', eq:[], g:'abs', pri:['abs', 'lowback'], sec:['glutes', 'delt_f'], type:'i', lvl:1,
 tech:['Get on all fours, hands under shoulders, knees under hips.', 'Simultaneously extend your right arm forward and left leg back to torso level.', 'Hold for 2 seconds, return and switch sides. Keep the hips from rotating.'],
 err:['Arching the lower back when lifting the leg', 'Hips rotating', 'Leg above torso level'],
 breath:'Breathe steadily.',
 anim:{view:'side',
  A:{hip:[70, 128], torso:90, head:-10, arm:{ik:[120, 181], b:'back', hA:90}, leg:{a:[180, 270], f:200}},
  B:{hip:[70, 128], torso:90, head:-10, armN:{a:[90, 90], hA:90}, armF:{ik:[120, 181], b:'back', hA:90}, legN:{a:[270, 270], fr:-90}, legF:{a:[180, 270], f:200}}}},
{id:'hollow', name:'Hollow hold', eq:[], g:'abs', pri:['abs'], sec:['obliques'], type:'i', lvl:2, kind:'time',
 tech:['Lie on your back, press your lower back into the floor, arms by your sides or overhead.', 'Lift your shoulder blades and straight legs 15–20 cm off the floor; body forms a shallow arc.', 'Hold the position. The lower the legs and the farther the arms, the harder it gets.'],
 err:['Arching the lower back', 'Tucking the chin too hard', 'Holding your breath'],
 breath:'Breathe steadily, don\'t hold your breath.',
 anim:{view:'side',
  A:{hip:[108, 176], torso:-70, head:12, arm:{a:[-66, -66], hA:-66}, leg:{a:[70, 70], fr:-80}},
  B:{hip:[108, 176], torso:-71, head:12, arm:{a:[-67, -67], hA:-67}, leg:{a:[71, 71], fr:-80}}}},
{id:'bicycle', name:'Bicycle crunches', eq:[], g:'abs', pri:['obliques', 'abs'], sec:[], type:'i', lvl:1,
 tech:['Lie on your back, hands behind your head, shoulder blades off the floor, legs raised.', 'Bring your right elbow toward your left knee while extending your right leg; then switch.', 'Moderate tempo, lower back pressed down.'],
 err:['Pulling on the head with the hands', 'Too fast — the hip flexors take over', 'Lower back lifting'],
 breath:'Exhale as you crunch.',
 anim:{view:'side', period:1800,
  A:{hip:[112, 176], torso:-62, head:12, arm:{ra:[160, -10]}, legN:{a:[30, 120], fr:-90}, legF:{a:[76, 76], fr:-80}},
  B:{hip:[112, 176], torso:-62, head:12, arm:{ra:[160, -10]}, legN:{a:[76, 76], fr:-80}, legF:{a:[30, 120], fr:-90}}}},
{id:'plankup', name:'Plank up-downs', eq:[], g:'abs', pri:['abs', 'triceps'], sec:['delt_f', 'chest'], type:'c', lvl:2,
 tech:['From a forearm plank, place one palm down, then the other, straightening your arms.', 'Lower back onto your forearms in the same order.', 'Keep the hips from swaying; switch the leading arm every rep.'],
 err:['Hips swaying', 'Sagging lower back', 'Always leading with the same arm'],
 breath:'Breathe steadily.',
 anim:{view:'side',
  A:plankA([5, 171], 81.6, {arm:{a:[180, 90]}}),
  B:plankA([10, 171], 70.4, {arm:{ik:[139, 181], b:'back', hA:90}})}},

/* --- руки без снаряда --- */
{id:'chairdip', name:'Chair dips', eq:[], g:'triceps', pri:['triceps'], sec:['chest', 'delt_f'], type:'c', lvl:1,
 tech:['Sit on the edge of a sturdy chair, hands next to your hips, and slide your hips forward. Knees bent.', 'Lower yourself, bending your elbows back to 90°.', 'Press yourself up.'],
 err:['Elbows flared out', 'Going too deep — shoulder pain', 'Hips too far from the support'],
 breath:'Inhale down, exhale up.',
 anim:{view:'side',
  A:{hip:[90, 124], torso:0, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[140, 180], b:'up', f:90}},
  B:{hip:[88, 150], torso:-2, arm:{ik:[80, 125], b:'back', hA:90}, leg:{ik:[140, 180], b:'up', f:90}},
  props:[{k:'rect', x:40, y:129, w:42, h:8}, {k:'line', pts:[[46, 137], [46, GROUND]], w:4}, {k:'line', pts:[[76, 137], [76, GROUND]], w:4}]}},
{id:'towelcurl', name:'Towel curls', eq:[], g:'biceps', pri:['biceps'], sec:['forearms'], type:'i', lvl:1,
 tech:['Step on the middle of a towel, holding the ends with an underhand grip. Pull it taut.', 'Curl while resisting with your foot: pull harder than you let it give.', 'Lower over 3–4 seconds while still pulling.'],
 err:['Too little tension — no load', 'Elbows drifting forward', 'Swinging'],
 breath:'Exhale as you curl, inhale as you lower.',
 anim:{view:'side', A:stand({arm:{a:[178, 176]}}), B:stand({arm:{a:[174, 28]}}),
  props:[{k:'band', from:'anN', foff:[4, 3], at:'gripN', layer:'front', cls:'eq-cable'}]}}
);
/* полотенце: тонкий серый трос вместо зелёной ленты */
for (const id of ['towelrow', 'towelcurl']) for (const p of EXI_LATE(id).anim.props || []) if (p.k === 'band') p.cls = 'eq-cable';
function EXI_LATE(id) { return EX.find(e => e.id === id); }

/* ===================== ТРЕНАЖЁРЫ И ВАРИАНТЫ ===================== */
/* Дополнительное оборудование зала и кардио-тренажёры. Подключается после базовой базы: EQUIP.push + EX.push. */
EQUIP.push(
  {id:'hack', name:'Hack squat', cat:'mach', hint:'squat with your back braced against an angled sled'},
  {id:'chestpress', name:'Chest press', cat:'mach', hint:'lever or cable, with back support'},
  {id:'shoulderpress', name:'Shoulder press', cat:'mach'},
  {id:'leverrow', name:'Lever row', cat:'mach', hint:'chest-supported row to the waist'},
  {id:'tbar', name:'T-bar', cat:'mach', hint:'bent-over row with an anchored bar'},
  {id:'gravitron', name:'Assisted pull-up / dip', cat:'mach', hint:'pull-ups and dips with a counterweight'},
  {id:'abductor', name:'Hip abductor / adductor', cat:'mach'},
  {id:'calfseat', name:'Seated calf raise', cat:'mach'}, {id:'calfstand', name:'Standing calf raise', cat:'mach'},
  {id:'treadmill', name:'Treadmill', cat:'cardio'}, {id:'bike', name:'Stationary bike', cat:'cardio'},
  {id:'rower', name:'Rowing machine', cat:'cardio'}, {id:'elliptical', name:'Elliptical', cat:'cardio'}, {id:'stairs', name:'Stair climber', cat:'cardio'}
);
EQUIP_CATS.push({id:'cardio', name:'Cardio machines'});
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
{id:'chestpressm', name:'Machine chest press', eq:[['chestpress']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Adjust the seat so the handles are at mid-chest height, back and head against the pad.',
   'Press the handles forward until your arms are almost straight, keeping your shoulder blades on the pad.',
   'Return slowly until your elbows go just past your torso; don\'t rest the weight on the stack.'],
 err:['Shoulders rolling forward at the end of the press', 'Lower back coming off the pad', 'Dropping the weight onto the stack'],
 breath:'Exhale as you press, inhale on the way back.',
 anim:{view:'side',
  A:{hip:[70, 130], torso:-8, arm:{ik:[108, 100], b:'down', hA:90}, leg:{ik:[134, 180], b:'up', f:90}},
  B:{hip:[70, 130], torso:-8, arm:{ik:[150, 92], b:'down', hA:90}, leg:{ik:[134, 180], b:'up', f:90}},
  props:[...seatRig([70, 130], -8, 62), {k:'line', pts:[[160, 40], [160, GROUND]], w:5}, {k:'seg', a:'gripN', b:'gripN', boff:[0, 0], aoff:[0, -22], w:3.5, layer:'front'},
   {k:'cable', from:[158, 60], at:'gripN', off:[0, -22], layer:'front'}]}},
{id:'smithbench', name:'Smith machine bench press', eq:[['smith'], ['bench']], g:'chest', pri:['chest'], sec:['triceps', 'delt_f'], type:'c', lvl:1,
 tech:['Position the bench so the bar lowers to your lower chest. Shoulder blades squeezed, feet on the floor.',
   'Unhook the bar by rotating your wrists and lower it to your chest under control.',
   'Press up along the rails; at the end of the set, rotate your wrists and hook the bar back.'],
 err:['Bench placed so the bar travels to your throat or belly', 'Bouncing the bar off your chest', 'Hips lifting off the seat'],
 breath:'Inhale as you lower, exhale as you press.',
 anim:{view:'side',
  A:{hip:[118, 126], torso:-90, arm:{ik:[70, 70], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  B:{hip:[118, 126], torso:-90, arm:{ik:[70, 110], b:'down'}, leg:{ik:[160, 180], b:'up', f:90}},
  props:[...benchFlat(30, 150, 136), {k:'line', pts:[[70, 6], [70, GROUND]], w:3, cls:'eq-rail'}, PLATE(16)]}},
{id:'cablelowfly', name:'Low-to-high cable crossover fly', eq:[['cable']], g:'chest', pri:['chest'], sec:['delt_f'], type:'i', lvl:1,
 tech:['Handles on the low pulleys, step forward, lean slightly, elbows softly bent.',
   'Bring your hands together in an upward arc to shoulder height, as if hugging a big ball.',
   'Slowly open your arms down and out, stretching your chest.'],
 err:['Moving from the elbows instead of the shoulders', 'Torso swinging', 'Shoulders shrugging up to the ears'],
 breath:'Exhale as you bring them together, inhale as you open.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[27, 14], [50, 30]]}}),
  B:frontStand({arm:{p:[[12, 16], [-10, 2]]}}),
  props:[{k:'line', pts:[[24, 8], [24, GROUND]], w:5}, {k:'line', pts:[[176, 8], [176, GROUND]], w:5},
   {k:'cable', from:[30, 176], at:'gripL', handle:true, layer:'front'}, {k:'cable', from:[170, 176], at:'gripR', handle:true, layer:'front'}]}},

/* ===== СПИНА ===== */
{id:'leverrowm', name:'Chest-supported lever row', eq:[['leverrow']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'delt_r'], type:'c', lvl:1,
 tech:['Sit with your chest on the pad, feet on the platform, and grab the handles with a neutral grip.',
   'Pull the handles toward you, driving your elbows back along your sides and squeezing your shoulder blades; keep your chest on the pad.',
   'Return smoothly, letting your shoulder blades spread, but don\'t round your back.'],
 err:['Chest lifting off the pad', 'Shrugging up', 'Jerking at the start'],
 breath:'Exhale as you pull, inhale on the return.',
 anim:{view:'side',
  A:{hip:[70, 132], torso:8, arm:{ik:[136, 104], b:'back', hA:90}, leg:{ik:[132, 180], b:'up', f:90}},
  B:{hip:[70, 132], torso:8, arm:{ik:[98, 110], b:'back', hA:90}, leg:{ik:[132, 180], b:'up', f:90}},
  props:[...seatRig([70, 132], 8, 0).slice(1), {k:'line', pts:[[96, 76], [96, 118]], w:8, cls:'eq-pad-s'}, {k:'line', pts:[[96, 118], [120, GROUND]], w:5},
   {k:'line', pts:[[150, 60], [150, GROUND]], w:5}, {k:'seg', a:'gripN', b:'gripN', aoff:[0, 0], boff:[18, 28], w:4, layer:'front'}]}},
{id:'tbarrow', name:'T-bar row', eq:[['tbar']], g:'back', pri:['lats', 'midback'], sec:['biceps', 'lowback', 'delt_r'], type:'c', lvl:2,
 tech:['Stand over the bar, knees slightly bent, torso at 45°, back straight.',
   'Grab the handle with a close grip and pull it to your stomach, squeezing your shoulder blades.',
   'Lower under control until your arms are almost straight, keeping your torso angle.'],
 err:['Rounding the lower back', 'Jerking your torso upright', 'Pulling to the chest with elbows flared'],
 breath:'Exhale as you pull, inhale as you lower.',
 anim:{view:'side',
  A:{hip:[80, 112], torso:52, arm:{ik:[122, 160], b:'back', hA:90}, leg:{ik:[90, 180], b:'fwd', f:90}},
  B:{hip:[80, 112], torso:52, arm:{ik:[114, 116], b:'back', hA:90}, leg:{ik:[90, 180], b:'fwd', f:90}},
  props:[{k:'circle', c:[40, 180], r:5, cls:'eq-steel-f'}, {k:'seg', a:'gripN', b:'gripN', aoff:[0, 0], boff:[-82, 20], w:4, layer:'back'}, {k:'plate', at:'gripN', off:[-6, 8], r:11, layer:'mid'}]}},
{id:'assistpull', name:'Assisted pull-ups', eq:[['gravitron']], assist:true, g:'back', pri:['lats'], sec:['biceps', 'midback'], type:'c', lvl:1,
 tech:['Set the counterweight: the more you add, the easier it gets. Kneel on the platform, grip slightly wider than shoulders.',
   'Pull up, driving your elbows down until your chin clears the handles.',
   'Lower slowly to straight arms without letting the platform drop.'],
 err:['Swinging', 'Not fully straightening your arms at the bottom', 'Too much counterweight — no real effort'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'front', noGround:true,
  A:{c:[100, 112], arm:{p:[[10, -28], [13, -55]]}, leg:{p:[[2, 40], [4, 54]], fd:[2, 8]}},
  B:{c:[100, 70], arm:{p:[[15, 22], [13, -10]]}, leg:{p:[[2, 40], [4, 54]], fd:[2, 8]}},
  props:[{k:'line', pts:[[42, 16], [158, 16]], w:5}, {k:'line', pts:[[46, 0], [46, 16]], w:4}, {k:'line', pts:[[154, 0], [154, 16]], w:4},
   {k:'line', pts:[[40, 0], [40, GROUND]], w:4}, {k:'line', pts:[[160, 0], [160, GROUND]], w:4},
   {k:'seg', a:'knL', b:'knR', aoff:[-22, 10], boff:[22, 10], w:8, cls:'eq-pad-s', layer:'back'}]}},
{id:'chestrowdb', name:'Chest-supported incline dumbbell row', eq:[['db'], ['incline']], g:'back', pri:['midback', 'lats'], sec:['delt_r', 'biceps'], type:'c', lvl:1,
 tech:['Backrest at 30–45°. Lie chest-down on the bench, feet planted, dumbbells hanging under your shoulders.',
   'Pull the dumbbells toward your hips, squeezing your shoulder blades; keep your chest on the pad.',
   'Lower until your arms are fully straight, letting your shoulder blades spread.'],
 err:['Lifting your chest off the bench', 'Jerking the weight up with your lower back', 'Elbows flaring out'],
 breath:'Exhale as you pull, inhale as you lower.',
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
{id:'shoulderpressm', name:'Machine shoulder press', eq:[['shoulderpress']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps', 'traps'], type:'c', lvl:1,
 tech:['Set the seat so the handles are at shoulder height or slightly below. Back against the pad, feet on the floor.',
   'Press the handles up without snapping your elbows into lockout.',
   'Lower under control to ear level without banging the weight on the stack.'],
 err:['Arching your lower back off the pad', 'Lowering the handles too far', 'Jerking the press'],
 breath:'Exhale as you press, inhale as you lower.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[27, 4], [27, -22]]}}),
  B:frontSeat({arm:{p:[[15, -24], [9, -52]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[36, 10], [36, GROUND]], w:4}, {k:'line', pts:[[164, 10], [164, GROUND]], w:4},
   {k:'seg', a:'gripL', b:'gripL', aoff:[0, 0], boff:[-16, 0], w:4, layer:'front'}, {k:'seg', a:'gripR', b:'gripR', aoff:[0, 0], boff:[16, 0], w:4, layer:'front'}]}},
{id:'smithohp', name:'Seated Smith machine press', eq:[['smith'], ['incline']], g:'shoulders', pri:['delt_f', 'delt_s'], sec:['triceps'], type:'c', lvl:1,
 tech:['Bench with the backrest at 80–90° under the bar so it lowers in front of your face to your collarbones.',
   'Unhook the bar by rotating your wrists and press up until your arms are almost straight.',
   'Lower to chin level under control.'],
 err:['Bar drifting behind your head', 'Arching your lower back', 'Fully locking out your elbows'],
 breath:'Exhale as you press, inhale as you lower.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[27, 2], [25, -24]]}}),
  B:frontSeat({arm:{p:[[14, -26], [9, -54]]}}),
  props:[{k:'rect', x:80, y:58, w:40, h:74, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[28, 0], [28, GROUND]], w:3, cls:'eq-rail'}, {k:'line', pts:[[172, 0], [172, GROUND]], w:3, cls:'eq-rail'}, {k:'fbar', ext:40, plates:true, layer:'front'}]}},

/* ===== ТРИЦЕПС ===== */
{id:'assistdip', name:'Assisted dips', eq:[['gravitron']], assist:true, g:'triceps', pri:['triceps', 'chest'], sec:['delt_f'], type:'c', lvl:1,
 tech:['Set the counterweight, kneel on the platform, grab the lower handles, torso upright.',
   'Lower yourself, bending your elbows back to 90°.',
   'Press yourself up without flaring your elbows.'],
 err:['Shoulders shrugging up to the ears', 'Going too deep with shoulder pain', 'Elbows flared out'],
 breath:'Inhale on the way down, exhale on the way up.',
 anim:{view:'side',
  A:{hip:hipFromSh([104, 44], 8), torso:8, arm:{ik:[108, 96], b:'back', hA:90}, leg:{a:[180, 268], fr:-90}},
  B:{hip:hipFromSh([100, 72], 20), torso:20, arm:{ik:[108, 96], b:'back', hA:90}, leg:{a:[186, 274], fr:-90}},
  props:[{k:'line', pts:[[64, 100], [158, 100]], w:5}, {k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'rect', x:70, y:166, w:50, h:8, rx:3, cls:'eq-pad'}, {k:'line', pts:[[96, 174], [96, GROUND]], w:4}]}},
{id:'cableohext', name:'Overhead cable rope triceps extension', eq:[['cable']], g:'triceps', pri:['triceps'], sec:[], type:'i', lvl:1,
 tech:['Rope attachment on a pulley above head height. Stand with your back to the machine, rope behind your head, elbows by your ears, step forward into a split stance.',
   'Extend your arms forward and up, pulling the rope ends apart at the top.',
   'Return slowly, stretching your triceps; keep your elbows in.'],
 err:['Elbows flaring out', 'Arching the lower back', 'Using your torso'],
 breath:'Exhale as you extend, inhale as you return.',
 anim:{view:'side',
  A:{hip:[96, 97], torso:6, head:-4, arm:{a:[8, 250]}, legN:{ik:[118, 180], b:'fwd', f:90}, legF:{ik:[76, 180], b:'fwd', f:106}},
  B:{hip:[96, 97], torso:6, head:-4, arm:{a:[8, 8]}, legN:{ik:[118, 180], b:'fwd', f:90}, legF:{ik:[76, 180], b:'fwd', f:106}},
  props:[{k:'line', pts:[[22, 30], [22, GROUND]], w:5}, {k:'cable', from:[26, 176], at:'gripN', handle:true, layer:'back'}]}},

/* ===== ПРЕСС ===== */
{id:'cablewood', name:'Cable woodchopper', eq:[['cable']], g:'abs', pri:['obliques', 'abs'], sec:['delt_s', 'glutes'], type:'i', lvl:1,
 tech:['Handle on the high pulley. Stand sideways, feet wider than shoulders, grab it with both hands.',
   'Pull the handle diagonally down toward the opposite knee, rotating your torso and hips; arms nearly straight.',
   'Return along the same arc under control. Repeat on the other side.'],
 err:['Moving only with your arms', 'Rounding the back at the bottom', 'Jerking'],
 breath:'Exhale as you pull down, inhale on the return.',
 anim:{view:'front',
  A:frontStand({arm:{p:[[24, -8], [36, -36]]}, leg:{p:[[9, 43], [12, 85]]}}),
  B:frontStand({arm:{p:[[-20, 20], [-34, 46]]}, leg:{p:[[12, 40], [14, 84]]}}),
  props:[{k:'line', pts:[[172, 6], [172, GROUND]], w:5}, {k:'cable', from:[166, 12], at:'gripR', handle:true, layer:'front'}]}},

/* ===== ЯГОДИЦЫ ===== */
{id:'pullthrough', name:'Cable pull-through', eq:[['cable']], g:'glutes', pri:['glutes', 'hams'], sec:['lowback'], type:'c', lvl:1,
 tech:['Rope attachment on the low pulley. Stand with your back to the machine, rope between your legs, two steps forward.',
   'Hinge forward by pushing your hips back, knees slightly bent, back straight — the rope travels back between your legs.',
   'Stand up by driving your hips forward, squeezing your glutes at the top.'],
 err:['Squatting instead of hinging', 'Pulling with the arms', 'Hyperextending the lower back at the top'],
 breath:'Inhale as you hinge, exhale as you stand up.',
 anim:{view:'side',
  A:{hip:[96, 97], torso:0, arm:{a:[182, 182]}, leg:{ik:[100, 180], b:'fwd', f:90}},
  B:{hip:[72, 110], torso:72, arm:{a:[228, 228]}, leg:{ik:[100, 180], b:'fwd', f:90}},
  props:[{k:'line', pts:[[20, 60], [20, GROUND]], w:5}, {k:'cable', from:[24, 178], at:'grips', handle:true, layer:'back'}]}},
{id:'cablekickback', name:'Cable glute kickback', eq:[['cable']], g:'glutes', pri:['glutes'], sec:['hams'], type:'i', lvl:1,
 tech:['Cuff on your ankle, face the machine, lean slightly, hands on the frame.',
   'Drive your straight leg back with your glute, without arching your lower back.',
   'Return under control without setting your foot down between reps.'],
 err:['Arching your lower back', 'Rotating your hips', 'Swinging with momentum'],
 breath:'Exhale as you kick back, inhale as you return.',
 anim:{view:'side',
  A:{hip:[90, 97], torso:14, arm:{ik:[138, 80], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[170, 176], f:90}},
  B:{hip:[90, 97], torso:14, arm:{ik:[138, 80], b:'down'}, legF:{ik:[96, 180], b:'fwd', f:90}, legN:{a:[224, 218], f:110}},
  props:[{k:'line', pts:[[150, 40], [150, GROUND]], w:5}, {k:'cable', from:[146, 180], at:'anN', handle:true, layer:'front'}]}},
{id:'abduction', name:'Hip abduction machine', eq:[['abductor']], g:'glutes', pri:['glutes'], sec:[], type:'i', lvl:1,
 tech:['Sit with the pads outside your knees, back against the backrest, hands on the handles.',
   'Push your knees apart through a comfortable range and hold for a second.',
   'Bring them back together slowly without letting the weight clank.'],
 err:['Leaning the torso forward', 'Jerky reps', 'Too much weight — hips lifting off the seat'],
 breath:'Exhale as you push out, inhale as you bring them back.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[6, 14], [8, 50]]}}),
  B:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[30, 20], [34, 54]]}}),
  props:[{k:'rect', x:80, y:60, w:40, h:72, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[62, 150], [62, 176]], w:6, cls:'eq-pad'}, {k:'line', pts:[[138, 150], [138, 176]], w:6, cls:'eq-pad'}]}},
{id:'adduction', name:'Hip adduction machine', eq:[['abductor']], g:'quads', pri:['quads'], sec:['glutes'], type:'i', lvl:1,
 tech:['Sit with the pads against the inside of your knees, legs spread until you feel a stretch in the adductors.',
   'Squeeze your knees together using your inner thighs and hold.',
   'Open slowly back to the starting stretch.'],
 err:['Starting position too wide', 'Hips lifting off the seat', 'Dropping the weight'],
 breath:'Exhale as you bring them together, inhale as you open.',
 anim:{view:'front',
  A:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[30, 20], [34, 54]]}}),
  B:frontSeat({arm:{p:[[14, 16], [16, 36]]}, leg:{p:[[7, 14], [9, 50]]}}),
  props:[{k:'rect', x:80, y:60, w:40, h:72, rx:5}, {k:'rect', x:74, y:130, w:52, h:9}, {k:'line', pts:[[100, 139], [100, GROUND]], w:5},
   {k:'line', pts:[[88, 150], [88, 176]], w:6, cls:'eq-pad'}, {k:'line', pts:[[112, 150], [112, 176]], w:6, cls:'eq-pad'}]}},

/* ===== КВАДРИЦЕПС ===== */
{id:'hacksquat', name:'Hack squat', eq:[['hack']], g:'quads', pri:['quads'], sec:['glutes', 'hams'], type:'c', lvl:2,
 tech:['Back and pelvis pressed against the sled, shoulders under the pads, feet shoulder-width apart on the platform, slightly forward.',
   'Release the safety stops and lower yourself, bending your knees to 90° or deeper if your pelvis stays in contact.',
   'Press up through your whole foot without locking your knees.'],
 err:['Pelvis lifting off the back pad at the bottom', 'Feet too low — knees travel far forward', 'Locking the knees'],
 breath:'Inhale on the way down, exhale on the way up.',
 anim:{view:'side',
  A:{hip:[104, 82], torso:-32, arm:{tf:[14, -48], b:'down'}, leg:{ik:[128, 160], b:'fwd', f:124}},
  B:{hip:[73, 133], torso:-32, arm:{tf:[14, -48], b:'down'}, leg:{ik:[128, 160], b:'fwd', f:124}},
  props:[{k:'line', pts:[add(add([73, 133], dir(-32), -30), [-12, 0]), add(add([104, 82], dir(-32), 80), [-12, 0])], w:3, cls:'eq-rail'},
   {k:'line', pts:[add(add([73, 133], dir(-32), -30), [-22, 0]), add(add([104, 82], dir(-32), 80), [-22, 0])], w:3, cls:'eq-rail'},
   {k:'line', pts:[add([128, 160], dir(58), -24), add([128, 160], dir(58), 26)], w:5},
   {k:'line', pts:[add([128, 160], dir(58), 26), [150, GROUND]], w:4}, {k:'line', pts:[[40, GROUND], [150, GROUND]], w:4}]}},

/* ===== ИКРЫ ===== */
{id:'seatedcalf', name:'Seated calf raises', eq:[['calfseat']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Sit with the balls of your feet on the edge of the platform, pads snug on your lower thighs.',
   'Release the stop and lower your heels as far as possible, stretching your calves.',
   'Rise onto your toes as high as you can and hold for a second.'],
 err:['Bouncing at the bottom', 'Partial range of motion', 'Pads on the knees'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:{hip:[78, 128], torso:4, arm:{ik:[110, 128], b:'down'}, leg:{ik:[112, 176], b:'up', f:72}},
  B:{hip:[78, 128], torso:4, arm:{ik:[110, 122], b:'down'}, leg:{ik:[112, 164], b:'up', f:118}},
  props:[{k:'rect', x:58, y:137, w:50, h:8}, {k:'line', pts:[[80, 145], [80, GROUND]], w:5}, {k:'rect', x:100, y:176, w:36, h:6},
   {k:'line', pts:[[118, 182], [118, GROUND]], w:4}, {k:'roller', leg:'N', up:-40, side:-90, out:8, r:7, layer:'front'}]}},
{id:'standcalf', name:'Standing machine calf raises', eq:[['calfstand']], g:'calves', pri:['calves'], sec:[], type:'i', lvl:1,
 tech:['Shoulders under the pads, balls of your feet on the edge of the platform, legs straight, torso upright.',
   'Lower your heels below the platform, stretching your calves.',
   'Rise onto your toes as high as possible and hold.'],
 err:['Bending the knees to help', 'Short range of motion', 'Leaning forward'],
 breath:'Exhale on the way up, inhale on the way down.',
 anim:{view:'side',
  A:Object.assign({hip:[94, 96], torso:0, arm:{a:[176, 12]}}, legsAt(100, 178, 'fwd', 70)),
  B:Object.assign({hip:[94, 84], torso:0, arm:{a:[176, 12]}}, legsAt(100, 166, 'fwd', 128)),
  props:[{k:'line', pts:[[128, 10], [128, GROUND]], w:5}, {k:'line', pts:[[128, 36], [96, 36]], w:5}, {k:'circle', c:[96, 36], r:7, cls:'eq-pad'},
   {k:'rect', x:84, y:180, w:40, h:6}]}},

/* ===== КАРДИО-ТРЕНАЖЁРЫ ===== */
{id:'treadmill', name:'Treadmill', eq:[['treadmill']], g:'cardio', pri:['quads', 'calves'], sec:['glutes', 'hams'], type:'c', lvl:1, kind:'time',
 tech:['Start with 2–3 minutes of walking, then settle into a working pace: breathing deep, but you can still speak in short phrases.',
   'Torso upright, eyes forward, arms swinging along your body; don\'t hold the handrails.',
   'For intervals, alternate 1 minute fast with 1–2 minutes easy. Finish with a walk.'],
 err:['Holding the handrails', 'Overstriding with a heel strike', 'Stopping abruptly without a cool-down'],
 breath:'Steady breathing in rhythm with your steps.',
 anim:{view:'side', period:1200,
  A:{hip:[90, 94], torso:6, armN:{a:[206, 96]}, armF:{a:[150, 60]}, legN:{ik:[114, 178], b:'fwd', f:92}, legF:{ik:[64, 170], b:'fwd', f:124}},
  B:{hip:[90, 94], torso:6, armN:{a:[150, 60]}, armF:{a:[206, 96]}, legN:{ik:[64, 170], b:'fwd', f:124}, legF:{ik:[114, 178], b:'fwd', f:92}},
  props:[{k:'rect', x:30, y:180, w:140, h:6, rx:3}, ...cardioConsole(160, 70), {k:'line', pts:[[160, 94], [150, 118]], w:4}]}},
{id:'bike', name:'Stationary bike', eq:[['bike']], g:'cardio', pri:['quads', 'glutes'], sec:['hams', 'calves'], type:'c', lvl:1, kind:'time',
 tech:['Saddle height: leg almost straight at the bottom of the pedal stroke. Hands on the handlebars without leaning your full weight.',
   'Keep a cadence of 80–100 rpm; set resistance so you breathe deeply but aren\'t out of breath.',
   'For intervals: 30–60 seconds at high resistance, then 1–2 minutes easy.'],
 err:['Saddle too low — knees above hips', 'Rocking the torso', 'Pressure on the wrists'],
 breath:'Breathe steadily, don\'t hold your breath.',
 anim:{view:'side', period:1400,
  keys:[{hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[112, 150], b:'fwd', f:100}, legF:{ik:[96, 174], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[118, 162], b:'fwd', f:100}, legF:{ik:[90, 162], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[96, 174], b:'fwd', f:100}, legF:{ik:[112, 150], b:'fwd', f:100}},
   {hip:[76, 112], torso:30, arm:{ik:[134, 100], b:'down'}, legN:{ik:[90, 162], b:'fwd', f:100}, legF:{ik:[118, 162], b:'fwd', f:100}}],
  props:[{k:'rect', x:62, y:118, w:30, h:6, rx:3}, {k:'line', pts:[[76, 124], [96, 176]], w:5}, {k:'line', pts:[[96, 176], [138, 110]], w:5},
   {k:'line', pts:[[138, 110], [138, 98]], w:4}, {k:'line', pts:[[128, 98], [148, 98]], w:4}, {k:'circle', c:[104, 162], r:12, cls:'eq-steel-f'},
   {k:'line', pts:[[60, GROUND], [150, GROUND]], w:4}, {k:'line', pts:[[96, 176], [96, GROUND]], w:4}, {k:'line', pts:[[138, 110], [128, GROUND]], w:4}]}},
{id:'rower', name:'Rowing machine', eq:[['rower']], g:'cardio', pri:['lats', 'quads'], sec:['glutes', 'midback', 'biceps'], type:'c', lvl:2, kind:'time',
 tech:['Catch: knees bent, shins vertical, arms straight, torso leaning forward from the hips.',
   'Stroke: push with the legs first, then lean the torso back, finally pull the handle to your lower ribs.',
   'Recover in reverse order: arms, torso, legs. Rate of 20–26 strokes per minute.'],
 err:['Pulling with the arms before the legs', 'Rounded back', 'Recovering too fast'],
 breath:'Exhale on the stroke, inhale on the recovery.',
 anim:{view:'side', period:2200, vectors:true,
  keys:[{hip:[62, 136], torso:22, arm:{ik:[124, 118], b:'back', hA:90}, leg:{ik:[112, 170], b:'up', f:40}},
   {hip:[82, 138], torso:-14, arm:{ik:[110, 128], b:'back', hA:90}, leg:{ik:[138, 170], b:'up', f:40}},
   {hip:[86, 138], torso:-16, arm:{tf:[18, 12], b:'back', hA:90}, leg:{ik:[142, 170], b:'up', f:40}}],
  props:[{k:'line', pts:[[20, 150], [170, 150]], w:6}, {k:'line', pts:[[40, 150], [40, GROUND]], w:4}, {k:'line', pts:[[150, 150], [150, GROUND]], w:4},
   {k:'rect', x:140, y:160, w:12, h:20, rx:3, cls:'eq-pad'}, {k:'circle', c:[164, 126], r:16, cls:'eq-steel-f'}, {k:'cable', from:[164, 126], at:'gripN', handle:true, layer:'front'}]}},
{id:'elliptical', name:'Elliptical', eq:[['elliptical']], g:'cardio', pri:['quads', 'glutes'], sec:['hams', 'calves', 'delt_f'], type:'c', lvl:1, kind:'time',
 tech:['Feet flat on the pedals, torso upright, hands on the moving handles.',
   'Move smoothly, pushing the pedals through your heels and helping with your arms; don\'t shift your weight onto the handles.',
   'Vary the load with resistance, not speed: 60–70 strides per minute.'],
 err:['Hanging on the handles', 'Rising onto the toes', 'Pace too fast with short steps'],
 breath:'Breathe steadily.',
 anim:{view:'side', period:1600,
  A:{hip:[96, 92], torso:4, armN:{ik:[128, 70], b:'down'}, armF:{ik:[104, 74], b:'down'}, legN:{ik:[120, 170], b:'fwd', f:90}, legF:{ik:[72, 164], b:'fwd', f:90}},
  B:{hip:[96, 92], torso:4, armN:{ik:[104, 74], b:'down'}, armF:{ik:[128, 70], b:'down'}, legN:{ik:[72, 164], b:'fwd', f:90}, legF:{ik:[120, 170], b:'fwd', f:90}},
  props:[{k:'line', pts:[[30, GROUND], [170, GROUND]], w:4}, {k:'line', pts:[[150, 60], [150, GROUND]], w:5}, {k:'line', pts:[[150, 60], [124, 60]], w:4},
   {k:'seg', a:'anN', b:'anN', aoff:[0, 0], boff:[0, 12], w:5}, {k:'seg', a:'anF', b:'anF', aoff:[0, 0], boff:[0, 14], w:5}, {k:'seg', a:'gripN', b:'anN', boff:[0, 0], w:3}]}},
{id:'stairs', name:'Stair climber', eq:[['stairs']], g:'cardio', pri:['glutes', 'quads'], sec:['calves', 'hams'], type:'c', lvl:1, kind:'time',
 tech:['Torso nearly upright, light touch on the handrails only for balance.',
   'Place your whole foot on the step and push through your heel, knee over foot.',
   'A pace at which you can speak in short phrases; for intervals — 1 minute fast, 2 easy.'],
 err:['Leaning on the handrails', 'Stepping onto the toes', 'Leaning forward with a rounded back'],
 breath:'Steady breathing in rhythm with your steps.',
 anim:{view:'side', period:1300,
  A:{hip:[88, 94], torso:10, arm:{ik:[134, 92], b:'down'}, legN:{ik:[118, 158], b:'fwd', f:90}, legF:{ik:[84, 180], b:'fwd', f:90}},
  B:{hip:[88, 80], torso:10, arm:{ik:[134, 80], b:'down'}, legN:{ik:[118, 158], b:'fwd', f:90}, legF:{ik:[100, 140], b:'fwd', f:90}},
  props:[{k:'rect', x:70, y:180, w:40, h:6}, {k:'rect', x:100, y:158, w:40, h:6}, {k:'rect', x:130, y:136, w:40, h:6}, {k:'line', pts:[[150, 80], [150, 136]], w:4}, {k:'line', pts:[[150, 80], [120, 86]], w:4}]}}
);

/* фазовые подсказки: [рабочая фаза, возврат]; для eccFirst — [опускание, подъём] */
for (const id of ['smithbench', 'assistdip', 'hacksquat', 'pullthrough']) eccFirst.add(id);
const MACHINE_CUES = {
  chestpressm:['Press the handles forward, shoulder blades against the back pad.', 'Return under control, elbows slightly behind your torso.'],
  smithbench:['Lower the bar to your lower chest along the guide rails.', 'Press up, feet driving into the floor.'],
  cablelowfly:['Bring your hands together in an arc from low to high, elbows soft.', 'Open down and out, stretching your chest.'],
  leverrowm:['Pull the handles toward you, elbows close to your body, chest on the pad.', 'Release smoothly, shoulder blades spreading apart.'],
  tbarrow:['Pull the handle to your stomach, squeezing your shoulder blades; keep your torso angle fixed.', 'Lower until your arms are almost straight.'],
  assistpull:['Drive your elbows down, chin above the handles.', 'Lower yourself slowly until your arms are straight.'],
  chestrowdb:['Pull the dumbbells toward your hips, squeezing your shoulder blades.', 'Lower until your arms are fully extended.'],
  shoulderpressm:['Press the handles up without arching your lower back.', 'Lower to ear level under control.'],
  smithohp:['Press the bar up along the guide rails.', 'Lower to your chin.'],
  assistdip:['Lower to 90° at the elbows, elbows back.', 'Press yourself up without flaring your elbows.'],
  cableohext:['Extend your arms forward and up, elbows by your ears.', 'Bring the rope back behind your head, stretching your triceps.'],
  cablewood:['Pull diagonally toward your knee, rotating your torso and hips.', 'Return along the same arc.'],
  pullthrough:['Push your hips back, knees soft; the rope travels back between your legs.', 'Stand up by driving your hips forward, squeezing your glutes.'],
  cablekickback:['Drive your straight leg back with your glute, lower back neutral.', 'Return under control without putting your foot down.'],
  abduction:['Push your knees out, torso still.', 'Bring them together slowly, without slamming the weight.'],
  adduction:['Squeeze your knees together with your inner thighs.', 'Open slowly into a stretch.'],
  hacksquat:['Lower until your knees are at 90°, pelvis pressed against the sled.', 'Press up through your whole foot.'],
  seatedcalf:['Rise onto your toes as high as you can.', 'Lower your heels below the platform, stretching your calves.'],
  standcalf:['Rise onto your toes as high as you can.', 'Lower your heels below the platform.'],
  treadmill:['Torso upright, arms swinging along your body.', 'Step under your body, land on your midfoot.'],
  bike:['Cadence 80–100, push the pedal through your heel.', 'Torso still, no weight on your hands.'],
  rower:['Legs — torso — arms: push, lean back, pull to the ribs.', 'Arms — torso — legs: recover twice as slowly as the stroke.'],
  elliptical:['Push the pedals through your heels, helping with your arms.', 'Don\'t shift your weight onto the handles.'],
  stairs:['Whole foot on the step, push through your heel.', 'Touch the handrails only for balance.']
};
// The player stores every pair as [working/lifting phase, return/lowering phase].
// MACHINE_CUES above is chronological, so eccentric-first entries need conversion.
for (const ex of EX) if (MACHINE_CUES[ex.id]) ex.anim.cues = eccFirst.has(ex.id) ? [...MACHINE_CUES[ex.id]].reverse() : MACHINE_CUES[ex.id];

const CUES_ALL = {
  /* грудь */
  pushup:['Push the floor away with your palms; keep your body in one line.','Lower your chest to the floor, elbows at 45° to your body.'],
  diamond:['Straighten your arms, elbows tucked to your sides.','Lower until your chest is over your hands.'],
  dip:['Press your body up without snapping the elbows into lockout.','Lower until your elbows reach 90°, elbows traveling back.'],
  bbbench:['Press the bar up and slightly back toward your head, feet driving into the floor.','Bring the bar to your lower chest, shoulder blades squeezed together.'],
  dbbench:['Press the dumbbells up in a converging arc.','Lower the dumbbells to your chest, forearms vertical.'],
  dbincline:['Press up without clanking the dumbbells together.','Lower to your upper chest, shoulder blades pinned to the bench.'],
  smithincline:['Press the bar up along the rails without jerking.','Lower the bar to your upper chest.'],
  inclinebb:['Press the bar straight up, hips on the bench.','Lower the bar to just below the collarbones, elbows at 45–60°.'],
  declinebb:['Press up and slightly back toward your head.','Lower the bar to your lower chest.'],
  closegrip:['Fully straighten your arms, elbows along your torso.','Lower the bar to your lower chest, elbows staying in.'],
  declinepush:['Press yourself up, hips not sagging.','Lower until your chest almost touches the floor.'],
  dbfly:['Bring your arms together in an arc, as if hugging a barrel.','Open your arms until you feel a chest stretch, keeping the elbow angle fixed.'],
  cablefly:['Bring the handles down and forward, squeezing your chest for a second.','Open your arms in an arc, elbows staying slightly bent.'],
  pecdeck:['Bring the handles together in front of you, back against the pad.','Open until you feel a chest stretch without dropping the weight.'],
  pullover:['Bring the dumbbell back in an arc over your chest.','Lower the dumbbell behind your head until you feel a stretch in your chest and lats.'],
  /* спина */
  pullup:['Drive your elbows down to your ribs, chest to the bar.','Lower to straight arms, keeping the shoulder blades controlled.'],
  chinup:['Pull your elbows to your sides, chin over the bar.','Straighten your arms smoothly, without swinging.'],
  bbrow:['Drive your elbows back along your torso, bar to your lower stomach.','Lower the barbell without changing your back angle.'],
  dbrow:['Elbow back and up, dumbbell to your hip.','Lower until your arm is fully straight.'],
  latpull:['Pull the handle to your upper chest, elbows down.','Return the handle up to straight arms.'],
  cablerow:['Pull the handle to your stomach, squeeze your shoulder blades; the torso leans back 10–15°.','Extend your arms with control; the torso returns to a slight forward lean.'],
  bandrow:['Pull the band ends to your waist, elbows back.','Return your arms forward, keeping tension.'],
  invrow:['Pull your chest to the bar, body in one line.','Lower to straight arms, hips not sagging.'],
  straightpull:['Pull the handle down to your thighs with straight arms.','Raise your arms to head height, shoulders down.'],
  deadlift:['Push the floor away with your legs, bar close to your shins.','Hips back first, then knees; keep the bar close to your legs.'],
  hyper:['Rise to a straight body line without hyperextending.','Hinge forward at the hips.'],
  shrug:['Raise your shoulders straight up toward your ears.','Lower your shoulders slowly, arms straight.'],
  goodmorning:['Extend your hips, returning to upright.','Hips back, back straight, torso nearly parallel to the floor.'],
  /* плечи */
  dbpress:['Press the dumbbells up, bringing them together overhead.','Lower to ear level, elbows under the dumbbells.'],
  ohp:['Press the bar straight up, then move your head under it.','Lower the bar to your collarbones, elbows in front of the bar.'],
  arnold:['Rotate your palms to face forward as you press.','Lower the dumbbells, rotating your palms to face you.'],
  latraise:['Raise your elbows out to the sides to shoulder height.','Lower your arms in an arc, without swinging.'],
  bandlatraise:['Raise your arms out to the sides, shoulders away from your ears.','Lower slowly; don\'t let the band snap your arms down.'],
  cablelat:['Raise your arm out to the side to shoulder height.','Return your arm, keeping the cable taut.'],
  frontraise:['Raise your straight arms forward to shoulder height.','Lower with control to your thighs.'],
  facepull:['Pull the rope to your face, elbows high and wide.','Return your arms forward until straight.'],
  bandfacepull:['Pull the band to your face, spreading the ends apart.','Smoothly return your arms forward.'],
  reversefly:['Open your arms back, squeezing your shoulder blades.','Return the handles forward, chest against the pad.'],
  pikepush:['Press yourself up, hips staying high.','Lower the top of your head between your hands.'],
  /* бицепс */
  bbcurl:['Curl, elbows fixed at your sides.','Lower the bar until your arms are nearly straight.'],
  dbcurl:['Curl up to shoulder height, palms forward.','Lower until your arms are straight.'],
  hammer:['Curl with a neutral grip, elbows by your torso.','Lower the dumbbells slowly.'],
  cablecurl:['Curl up to chest height.','Lower smoothly, keeping the cable taut.'],
  bandcurl:['Curl, keeping your elbows pinned to your sides.','Lower while keeping tension on the band.'],
  preacher:['Curl, upper arms on the pad.','Lower to nearly straight arms, without jerking at the bottom.'],
  inclinecurl:['Curl the weights without bringing your elbows forward.','Lower to full extension, feeling the stretch.'],
  concentration:['Curl toward your shoulder, elbow braced against your thigh.','Lower the dumbbell slowly.'],
  /* трицепс */
  skull:['Extend your arms, upper arms fixed.','Lower the bar toward the top of your head, bending only at the elbows.'],
  pushdown:['Extend your arms fully down, elbows at your sides.','Return to 90° at the elbows, upper arms fixed.'],
  bandpushdown:['Fully extend your arms down.','Slowly return to 90° at the elbows.'],
  benchdip:['Extend your arms, lifting your body.','Lower to 90° at the elbows, elbows back.'],
  ohext:['Extend your arms overhead, elbows close to your head.','Lower the dumbbell behind your head, elbows staying in.'],
  kickback:['Extend your arm back until straight.','Return to 90°, upper arm fixed.'],
  /* предплечья */
  wristcurl:['Curl your wrists, lifting the bar.','Lower by extending your wrists, letting the bar roll to your fingers.'],
  farmer:['Walk with short steps, torso upright.','Shoulders back and down; don\'t let the weights swing.'],
  hang:['Active hang: shoulders pulled slightly away from your ears, steady breathing.'],
  /* пресс */
  crunch:['Bring your ribs toward your pelvis, lifting your shoulder blades.','Lower without dropping, lower back pressed down.'],
  declinecrunch:['Curl your rib cage toward your pelvis.','Return smoothly without lying fully back.'],
  cablecrunch:['Crunch down, elbows toward your thighs; hips stay still.','Return up without losing tension in your abs.'],
  lyinglegraise:['Raise your straight legs to vertical.','Lower slowly without touching the floor with your heels.'],
  legraise:['Raise your legs, curling your pelvis up.','Lower your legs without swinging.'],
  hangknee:['Draw your knees to your chest, pelvis tucked.','Lower your legs slowly.'],
  captainraise:['Raise your knees to your chest, back against the pad.','Lower your legs without swinging.'],
  rollout:['Return by contracting your abs, not by moving your hips.','Roll the wheel forward, lower back neutral.'],
  sidebend:['Return to upright using your obliques.','Bend directly to the side.'],
  plank:['Body in one line, glutes and abs tight, breathe into your belly.'],
  sideplank:['Hips up, body straight from head to feet, shoulder away from your ear.'],
  /* ягодицы и ноги */
  hipthrust:['Extend your hips to a straight shoulders–knees line, squeeze your glutes.','Lower your hips, chin tucked.'],
  bridge:['Raise your hips, squeezing your glutes.','Lower your hips with control.'],
  kbswing:['Snap your hips forward; your arms only guide the kettlebell.','Meet the kettlebell by pushing your hips back.'],
  glutekick:['Kick your leg back, squeezing the glute; don\'t arch your lower back.','Return your leg slowly.'],
  bulgarian:['Drive up through your front leg.','Lower straight down, knee tracking over your toes.'],
  stepup:['Step up, fully straightening the working leg.','Step down with the same leg under control.'],
  lunge:['Stand up, torso upright.','Lower until your back knee almost touches the floor.'],
  rdl:['Extend your hips, keeping the weight close to your legs.','Hips back, knees soft, back straight.'],
  squat:['Push through your whole foot, knees tracking over your toes.','Bend your knees and hips together, heels on the floor.'],
  goblet:['Stand up, torso upright, elbows down.','Sink your hips between your knees.'],
  airsquat:['Rise to full extension.','Lower until your thighs are parallel to the floor.'],
  smithsquat:['Rise without lifting your heels.','Lower to parallel, feet in front of the bar.'],
  legpress:['Press the platform away without locking your knees.','Lower the platform until your knees reach 90°, hips pressed down.'],
  legext:['Extend your legs until nearly straight and hold.','Lower slowly, without dropping.'],
  legcurl:['Pull your heels toward your glutes, hips pressed down.','Straighten your legs smoothly.'],
  calfraise:['Rise onto your toes as high as you can.','Lower slowly, stretching your calves.'],
  lpcalf:['Press the platform with the balls of your feet.','Return, stretching your calves.'],
  /* кардио */
  jumpingjack:['Jump: feet apart, arms out to the sides and overhead.','Land softly on the balls of your feet, feet together.'],
  burpee:['Jump up, arms overhead.','Squat, hands on the floor, jump your feet back into a plank.'],
  mountain:['Switch legs quickly, hips level with your shoulders.','Shoulders over your wrists, breathe rhythmically.'],
  jumpsquat:['Jump explosively, driving with your arms.','Land softly on the balls of your feet and drop straight into a squat.'],
  thruster:['As you stand, press the dumbbells straight overhead.','Lower the dumbbells to your shoulders and drop into a squat.'],
  wallpush:['Push off the wall until your arms are straight.','Bend your elbows, chest to the wall, body straight.'],
  inclinepush:['Press yourself up to straight arms.','Lower your chest to the edge of the support, elbows at 45°.'],
  kneepush:['Press yourself up without sticking your hips out.','Lower your chest to the floor, keeping a line from knees to head.'],
  widepush:['Press up, squeezing your chest.','Lower yourself, elbows no higher than your shoulders.'],
  archer:['Press yourself back to center.','Lower toward the working arm while the other slides out to the side.'],
  declinepike:['Press yourself up to straight arms.','Lower the top of your head toward the floor, elbows forward and down.'],
  superman:['Lift your chest, arms and legs, eyes on the floor.','Lower yourself smoothly.'],
  ytw:['Raise your arms, squeezing your shoulder blades together.','Lower without touching the floor.'],
  towelrow:['Pull your chest to the door, elbows back.','Straighten your arms smoothly without letting your hips sag.'],
  tablerow:['Pull your chest to the tabletop.','Lower to straight arms.'],
  reversesnow:['Sweep your arms up in an arc without touching the floor.','Return along the same arc.'],
  wallsit:['Thighs parallel to the floor, knees over heels, breathe steadily.'],
  revlunge:['Push off the front foot and return.','Step back, rear knee toward the floor, torso upright.'],
  sidelunge:['Push off and return to center.','Hips back and to the side, other leg straight.'],
  pistolbox:['Stand up without pushing off the bench.','Lower until you touch, knee tracking over toes.'],
  sllift:['Extend your hips, returning to upright.','Hinge with a flat back, free leg extending back.'],
  glutebridge1:['Lift your hips on one leg without tilting.','Lower under control.'],
  nordic:['Push off with your hands and return.','Lower slowly, resisting with your hamstrings; keep your hips level.'],
  calf1:['Rise onto your toes as high as possible.','Lower below the step, stretching your calf.'],
  deadbug:['Bring the arm and leg back.','Lower the opposite arm and leg, lower back pressed down.'],
  birddog:['Extend one arm and the opposite leg, hips still.','Return to all fours.'],
  hollow:['Lower back pressed down, shoulder blades and legs off the floor, breathe steadily.'],
  bicycle:['Elbow to opposite knee.','Switch sides, lower back pressed down.'],
  plankup:['Place your palms and straighten your arms one at a time.','Lower onto your forearms in the same order.'],
  chairdip:['Press yourself up.','Lower to 90° at the elbows, elbows back.'],
  towelcurl:['Bend your arms, resisting with your leg.','Lower for 3–4 seconds, keeping tension.']
};
for (const ex of EX) {
  const c = CUES_ALL[ex.id];
  if (c) ex.anim.cues = c.length === 1 ? [c[0], c[0]] : c;
  else if (!ex.anim.cues) ex.anim.cues = [ex.tech[1] || ex.tech[0], ex.tech[ex.tech.length - 1]];
  /* упражнения из модулей, подключённых после 03-motion-demo */
  if (ex.anim.eccFirst == null) ex.anim.eccFirst = eccFirst.has(ex.id);
  if (ex.anim.hold == null) ex.anim.hold = isometric.has(ex.id);
}

DEMO.rdl.tech[2] = 'Lower the weight only as far as you can keep control of your back and tension in your hamstrings. Depth varies by individual.';
DEMO.sidebend.err[2] = 'Excessive range of motion and loss of torso control';

const SOURCES_BY_EX = {
  kbswing:[['Kettlebell swing — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/']],
  cablerow:[['Seated row — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']],
  pushup:[['Push-ups — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/']],
  airsquat:[['Squats — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  squat:[['Squats — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  bridge:[['Glute bridge — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']],
  hipthrust:[['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']],
  latpull:[['Lat pulldown — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/']],
  bulgarian:[['Bulgarian split squat — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat']],
  chinup:[['Chin-ups — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']]
};
const MOTION_SOURCES = [
  ['Kettlebell swing — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/'],
  ['Seated row — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']
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
 pushup:{setup:'Palms on the floor, torso braced.',control:'Palms and toes keep their support; hips move together with the chest.'},
 diamond:{setup:'Place your palms close together under your chest.',control:'Keep your torso in line and move your elbows along your sides.'},
 squat:{setup:'Plant your feet firmly and hold the bar on your back.',control:'Bend your hips and knees together; keep your whole foot planted.'},
 goblet:{setup:'Hold the weight in front of your chest, close to your body.',control:'Choose a depth at which you keep your base and torso control.'},
 airsquat:{setup:'Feet stable, knees pointing in the direction of your toes.',control:'Hips and knees bend together; heels stay on the floor.'},
 lunge:{setup:'Front foot flat on the floor, rear foot on the toes.',control:'Lower between your feet, keeping your balance. Do both sides.'},
 bridge:{setup:'Lie on your back, bend your knees and place your feet on the floor.',control:'Shoulders and feet stay planted; hips rise without arching your back.'},
 hipthrust:{setup:'Upper back rests on the edge of the bench, feet stable.',control:'The hips move; your back stays supported. Finish the lift without arching.'},
 dbrow:{setup:'Knee and hand rest on the bench.',control:'Elbow travels toward the hip; supporting arm and torso hold position.'},
 bbrow:{setup:'Lean your torso forward and hold that position.',control:'Your arms drive the pull; don\'t heave the bar with your torso.'},
 deadlift:{setup:'Weight close to your legs, arms straight.',control:'Extend hips and knees together, keeping the weight close to your body.'},
 rdl:{setup:'Weight held in straight arms, knees slightly bent.',control:'Push your hips back; back control limits the depth.'},
 kbswing:{setup:'Feet stable, hands holding the kettlebell.',control:'Hip extension drives the swing; elbows stay straight.'},
 plank:{setup:'Forearms and toes form the base.',control:'Keep your hips and rib cage in position and keep breathing.'},
 latraise:{setup:'Dumbbells at your thighs, elbows slightly bent.',control:'Arms move in an arc; torso holds position.'}
};
DEMO.pushup.anim.cues=['Push the floor away, raising your body as one unit.','Lower your rib cage and hips together, keeping support on palms and toes.'];
DEMO.pushup.tech[1]='Bend your elbows and lower your chest, keeping a stable base and torso control. Choose a range you can manage without your hips sagging.';
DEMO.diamond.anim.cues=['Straighten your arms and raise your body without your hips sagging.','Bend your elbows, keeping your hand position and body line.'];
DEMO.bridge.anim.cues=['Lift your hips, keeping your shoulders and feet planted.','Lower your hips smoothly to the starting position.'];
DEMO.hipthrust.anim.cues=['Extend your hips to a line with your torso and thighs without overarching.','Lower your hips smoothly, keeping your back supported on the bench.'];
DEMO.goblet.tech[2]='Lower to a depth where you keep a stable base and back control, then stand up.';
DEMO.goblet.anim.cues=['Stand up, keeping your feet on the floor and your torso under control.','Bend your knees and hips, keeping the weight close to your chest.'];
DEMO.lunge.tech[2]='Front knee travels toward the toes. Keeping your balance, rise to the starting position.';
DEMO.lunge.anim.cues=['Rise by driving through the front foot; then do the other side.','Lower between your feet, keeping your balance.'];
MOTION_SOURCES.push(
 ['Push-ups — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/'],
 ['Squats — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/'],
 ['Glute bridge — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']
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
 R.contacts=[{p:[-12,184,132],label:'Front foot'},{p:[12,140,29],label:'Rear foot'}];return R;
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
 R.contacts=[{p:contact,label:'Back support'},{p:[-13,184,thrustFootZ3+5],label:'Feet'}];return R;
}
const CAMERA3={front:{label:'Front',yaw:0,elevation:0},side:{label:'Side',yaw:90,elevation:0},angle:{label:'Angled',yaw:55,elevation:-15},
 back:{label:'Rear view',yaw:180,elevation:0},above:{label:'Angled overhead view',yaw:35,elevation:-55},rear:{label:'Angled rear view',yaw:235,elevation:-15}};
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
 function silhouette(points,fill,attrs={}){
  const p=points.map(project).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const half=ps=>{const h=[];for(const q of ps){while(h.length>1&&cross(h[h.length-2],h[h.length-1],q)<=0)h.pop();h.push(q);}return h;};
  const a=half(p),b=half([...p].reverse());a.pop();b.pop();
  queue('path',{d:closedSpline(a.concat(b).map(v=>v.slice(0,2))),fill,...attrs},points);
 }
 function line3(a,b,width,fill,offset=0,attrs={}){const p=project(a),q=project(b);queue('line',{x1:f1(p[0]),y1:f1(p[1]),x2:f1(q[0]),y2:f1(q[1]),stroke:fill,'stroke-width':width,'stroke-linecap':'round',...attrs},[a,b],offset);}
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
 function circle3(c,r,axis,count=48){
  axis=V3.unit(axis);const a=V3.unit(V3.cross(axis,Math.abs(axis[1])<.8?[0,1,0]:[0,0,1])),b=V3.cross(axis,a);
  return Array.from({length:count},(_,i)=>V3.add(V3.add(c,a,r*Math.cos(i*Math.PI*2/count)),b,r*Math.sin(i*Math.PI*2/count)));
 }
 function disc(c,r,outline=false,axis=[1,0,0],attrs={}){
  const p=circle3(c,r,axis);
  /* сбоку блин — полупрозрачный диск: не закрывает атлета и не читается как кольцо вокруг головы */
  face(p,outline?'#36465e':'#36465e',{stroke:outline?'#7f90ad':'#25344a','stroke-width':outline?1.2:1,'stroke-opacity':outline?.7:1,'fill-opacity':outline?.38:1,...attrs});
  const q=project(c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:2.5,fill:'#a6b5ca'},[c],1);
 }
 const TONE3={frame:'#5f708a',pad:'#46566e',chrome:'#b7c4d6',plate:'#3b4c66',rubber:'#2f3a4b',cable:'#8a9ab0',band:'#6d9dc6',mat:'#2f3d52',wood:'#8a755e',wall:'#4a586c',stack:'#56667e',rope:'#b8a07a',towel:'#c9cfd8'};
 const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*k))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');};
 const facing=d=>{const a=project([0,0,0]),b=project(d);return b[2]-a[2];};
 function obox(c,ax,size,tone,attrs={}){
  const h=size.map(v=>v/2),P=(i,j,k)=>V3.add(V3.add(V3.add(c,ax[0],i*h[0]),ax[1],j*h[1]),ax[2],k*h[2]),base=TONE3[tone]||TONE3.frame;
  for(let a=0;a<3;a++)for(const sg of [-1,1]){
   const n=ax[a].map(v=>v*sg);if(facing(n)<=1e-6)continue;
   const b=(a+1)%3,cc=(a+2)%3,q=(u,v)=>{const idx=[0,0,0];idx[a]=sg;idx[b]=u;idx[cc]=v;return P(...idx);};
   face([q(-1,-1),q(1,-1),q(1,1),q(-1,1)],shade(base,.78+.32*Math.abs(project(n)[1]-project([0,0,0])[1]<0?.9:.55)),attrs);
  }
 }
 function cylinder(c,axis,r,len,tone,attrs={}){
  axis=V3.unit(axis);const a=V3.add(c,axis,-len/2),b=V3.add(c,axis,len/2),ca=circle3(a,r,axis,20),cb=circle3(b,r,axis,20),base=TONE3[tone]||TONE3.frame;
  silhouette(ca.concat(cb),shade(base,.85),attrs);const end=facing(axis)>0?cb:ca;face(end,shade(base,1.08),attrs);
 }
 function prop(s){
  if(s.optional&&opts.has&&!opts.has(s.optional))return;
  if(s.optionalNot&&(!opts.has||opts.has(s.optionalNot)))return;
  if(s.kind==='beam')line3(s.a,s.b,s.r?2*s.r:Math.max(s.w,s.h),TONE3[s.tone]||TONE3.frame,0,{'data-prop':s.id||'beam'});
  else if(s.kind==='obox')obox(s.c,[s.x,s.y,s.z].map(V3.unit),s.size,s.tone,{'data-prop':s.id||'box'});
  else if(s.kind==='cyl')cylinder(s.c,s.axis,s.r,s.len,s.tone,{'data-prop':s.id||'cyl'});
  else if(s.kind==='sphere'){const q=project(s.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(s.r),fill:TONE3[s.tone]||TONE3.frame},[s.c]);}
  else if(s.kind==='cable')for(let i=1;i<s.pts.length;i++)line3(s.pts[i-1],s.pts[i],Math.max(1,2*s.r),TONE3[s.tone]||TONE3.cable,0,{'data-prop':s.id||'cable'});
  else if(s.kind==='barbell'&&s.len){
   const ax=V3.unit(s.axis);line3(V3.add(s.c,ax,-s.inner),V3.add(s.c,ax,s.inner),2*s.shaftR,TONE3.chrome,0,{'data-prop':'barbell','data-part':'shaft'});
   for(const sg of [-1,1]){line3(V3.add(s.c,ax,sg*(s.inner+2)),V3.add(s.c,ax,sg*s.len/2),2*s.sleeveR,TONE3.chrome,0,{'data-prop':'barbell','data-part':'sleeve'});
    let at=s.inner+2.4;for(const[r,th]of s.plates){cylinder(V3.add(s.c,ax,sg*(at+th/2)),ax,r,th,'plate',{'data-prop':'barbell','data-part':'plate'});at+=th+.3;}}
  }else if(s.kind==='dumbbell'&&s.handle){
   const ax=V3.unit(s.axis);line3(V3.add(s.c,ax,-s.handle/2-1),V3.add(s.c,ax,s.handle/2+1),3.2,TONE3.chrome,0,{'data-prop':'dumbbell','data-part':'shaft'});
   for(const sg of [-1,1])cylinder(V3.add(s.c,ax,sg*(s.handle/2+1.2+s.headLen/2)),ax,s.headR,s.headLen,'plate',{'data-prop':'dumbbell','data-part':'plate'});
  }
  else if(s.kind==='kettlebell'&&s.handleAxis){
   const q=project(s.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(s.radius),fill:TONE3.plate,'data-prop':'kettlebell'},[s.c]);
   const up=V3.unit(V3.sub(s.grip,s.c)),ax=V3.unit(s.handleAxis),P=(x,y)=>V3.add(V3.add(s.c,ax,x*s.radius/10.5),up,y*s.radius/10.5);
   const pts=[P(-7.2,6.5),P(-9,12),P(-5,15.6),P(5,15.6),P(9,12),P(7.2,6.5)].map(project);
   queue('path',{d:'M'+pts.map(p=>f1(p[0])+','+f1(p[1])).join('L'),fill:'none',stroke:TONE3.plate,'stroke-width':3.2,'stroke-linejoin':'round','data-prop':'kettlebell'},[s.grip],.5);
  }
  else if(s.kind==='box')box(s);
  else if(s.kind==='line')line3(s.a,s.b,s.width,tones[s.tone]||tones.steel);
  else if(s.kind==='dumbbell'){
   const axis=V3.unit(s.axis||[1,0,0]);
   line3(V3.add(s.c,axis,-12),V3.add(s.c,axis,12),3,tones.bar,0,{'data-prop':'dumbbell','data-part':'shaft'});
   for(const sign of [-1,1])disc(V3.add(s.c,axis,sign*9),6,false,axis,{'data-prop':'dumbbell','data-part':'plate'});
  }else if(s.kind==='barbell'){
   const axis=V3.unit(s.axis||[1,0,0]);
   line3(V3.add(s.c,axis,-61),V3.add(s.c,axis,61),3.4,tones.bar,0,{'data-prop':'barbell','data-part':'shaft'});
   line3(V3.add(s.c,axis,-19),V3.add(s.c,axis,19),8,'#ac8a61',1);
   for(const sign of [-1,1])disc(V3.add(s.c,axis,sign*48),s.radius||17,camera==='side',axis,{'data-prop':'barbell','data-part':'plate'});
  }else if(s.kind==='panel'){
   const axis=[1,0,0],normal=V3.unit(V3.cross(axis,V3.sub(s.b,s.a))),corners=[V3.add(s.a,axis,-s.width/2),V3.add(s.a,axis,s.width/2),V3.add(s.b,axis,s.width/2),V3.add(s.b,axis,-s.width/2)];
   const lower=corners.map(p=>V3.add(p,normal,s.thickness/2));face(corners,'#53677f');for(let i=0;i<4;i++)face([corners[i],corners[(i+1)%4],lower[(i+1)%4],lower[i]],'#35475f');
  }else if(['wheel','roller','weight'].includes(s.kind)){
   const axis=V3.unit(s.axis||[1,0,0]),r=s.radius||6;
   if(s.kind==='roller'){
    const ends=[-18,18].map(offset=>circle3(V3.add(s.c,axis,offset),r,axis,24));
    for(const points of ends)face(points,'#35475f',{'data-prop':'roller','data-part':'end'});
    for(let i=0;i<24;i++)face([ends[0][i],ends[0][(i+1)%24],ends[1][(i+1)%24],ends[1][i]],'#435570',{'data-prop':'roller','data-part':'wall'});
   }else face(circle3(s.c,r,axis,24),'#45607f');
  }else if(s.kind==='kettlebell'){
   const c=project(s.c);queue('circle',{cx:c[0],cy:c[1],r:s.radius||8.5,fill:'#304a6a',stroke:'#607691','stroke-width':1},[s.c]);
   const d=V3.unit(V3.sub(s.c,s.grip)),points=[V3.add(V3.add(s.grip,[1,0,0],-5.5),d,3),s.grip,V3.add(V3.add(s.grip,[1,0,0],5.5),d,3)],p=points.map(project);
   queue('path',{d:`M${p[0][0]},${p[0][1]} Q${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]}`,fill:'none',stroke:'#b4c6dc','stroke-width':2.4},points);
  }else throw Error('Unknown spatial equipment kind: '+s.kind);
 }
 /* Манекен: силуэты сегментов строятся из той же поверхности, что и объёмная сцена */
 function mannequinBody(R,boundsOnly){
  const B=Mannequin.bodyData(R),H=B.torsoHeights,every=(rows,k)=>rows.filter((_,i)=>i%k===0||i===rows.length-1);
  const L=(f,p)=>[f.o[0]+f.x[0]*p[0]+f.y[0]*p[1]+f.z[0]*p[2],f.o[1]+f.x[1]*p[0]+f.y[1]*p[1]+f.z[1]*p[2],f.o[2]+f.x[2]*p[0]+f.y[2]*p[1]+f.z[2]*p[2]];
  if(boundsOnly){for(const row of B.torso)allBounds.push(...row.map(project));for(const rows of Object.values(B.limbs))for(const row of every(rows,3))allBounds.push(...row.map(project));allBounds.push(project(V3.add(R.head,R.headU,12)));return;}
  const part=(lo,hi)=>B.torso.filter((_,i)=>H[i]>=lo&&H[i]<=hi).flat();
  silhouette(part(-9,10),palette.shorts,{'data-part':'pelvis'});silhouette(part(8,26),palette.kit,{'data-part':'waist'});silhouette(part(23,56),palette.kit,{'data-part':'chest'});
  silhouette(B.neck.flat(),palette.skin,{'data-part':'neck'});
  for(const s of ['R','L']){
   const skin=palette[s==='R'?'far':'skin'];
   for(const k of ['th','sk','ua','fa'])silhouette(every(B.limbs[k+s],2).flatMap(r=>r.filter((_,j)=>j%2===0)),skin,{'data-limb':k+s});
   silhouette(B.limbs['th'+s].slice(0,3).flat(),palette.shorts,{'data-limb':'shorts'+s});
   for(const c of B.caps.filter(c=>c.key.endsWith(s))){const q=project(c.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(c.r),fill:skin},[c.c]);}
   const h=B.hands[s],hand=[...h.shape.fingers.flatMap(f=>f.pts),...h.shape.thumb.pts];
   for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5])hand.push([h.shape.palm.c[0]+dx*h.shape.palm.size[0],h.shape.palm.c[1]+dy*h.shape.palm.size[1],h.shape.palm.c[2]+dz*h.shape.palm.size[2]]);
   silhouette(hand.map(p=>L(h.frame,p)),skin,{'data-limb':'hand'+s});
   for(const k of ['rear','toes']){const f=B.feet[s][k],sp=B.shoe[k],pts=[];for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5])pts.push(L(f,[sp.c[0]+dx*sp.size[0],sp.c[1]+dy*sp.size[1],sp.c[2]+dz*sp.size[2]]));silhouette(pts,palette.shoe,{'data-limb':'shoe'+s});}
  }
  const hf=R.frames.head,head=[];
  for(let i=0;i<16;i++)for(let j=1;j<8;j++){const th=i/16*2*Math.PI,ph=j/8*Math.PI,d=[Math.sin(ph)*Math.cos(th)*B.head.radii[0],Math.cos(ph)*B.head.radii[1],Math.sin(ph)*Math.sin(th)*B.head.radii[2]];head.push(L({o:R.head,x:hf.x,y:hf.y,z:hf.z},d));}
  silhouette(head,palette.skin,{'data-part':'head'});
  face([L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[-1.2,0,9.4]),L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[0,-2.6,10.6]),L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[1.2,0,9.4])],'#a3b3cb');
 }
 function body(R,boundsOnly=false){
  if(R.frames)return mannequinBody(R,boundsOnly);
  const surfaceLimb=(a,b,kind,fill,key,shorts=false)=>{
   if(boundsOnly){
    if(shorts)return;
    const r=Math.max(...CATALOG_LIMB_PROFILES[kind].flatMap(p=>p.slice(1)));
    for(const p of [a,b])for(const x of [-r,r])for(const y of [-r,r])for(const z of [-r,r])allBounds.push(project([p[0]+x,p[1]+y,p[2]+z]));
    return;
   }
   const heights=shorts?[0,.0725,.145]:[0,.2,.4,.6,.8,1],f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),delta=V3.sub(b,a);
   const points=heights.flatMap(t=>{
    const [u,v]=catalogLimbRadius(kind,t),r1=u+(shorts?.2:0),r2=v+(shorts?.2:0),c=V3.add(a,delta,t);
    return Array.from({length:8},(_,i)=>{const x=r1*Math.cos(i*Math.PI/4),y=r2*Math.sin(i*Math.PI/4);return c.map((n,k)=>n+f.x[k]*x+f.y[k]*y);});
   });
   silhouette(points,fill,{'data-limb':key});
  };
  for(const s of ['R','L']){
   const skin=palette[s==='R'?'far':'skin'];
   if(R.basis){
    for(const[kind,a,b]of [['th','hip','kn'],['sh','kn','an'],['ua','sh','el'],['fa','el','wr']])surfaceLimb(R[a+s],R[b+s],kind,skin,kind+s);
    surfaceLimb(R['hip'+s],R['kn'+s],'th',palette.shorts,'shorts'+s,true);
   }else{
    limb(R['hip'+s],R['kn'+s],13,'th',skin);limb(R['kn'+s],R['an'+s],10.5,'sh',skin);
    limb(R['sh'+s],R['el'+s],10,'ua',skin);limb(R['el'+s],R['wr'+s],8.5,'fa',skin);
    limb(R['hip'+s],V3.add(R['hip'+s],V3.unit(V3.sub(R['kn'+s],R['hip'+s])),18),14,'th',palette.shorts);
   }
   limb(R['heel'+s],R['toe'+s],6,'ft',palette.shoe);
   limb(R['wr'+s],R['hand'+s],7,'hd',skin);
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
  records=[];const R=anim.rig3d(t);body(R,!withMuscles);
  const muscles=muscleFrame(anim,t,index);
  const sideValues=muscles&&anim.muscleProfile?.regions?catalogSideValues(anim.muscleProfile,muscles.values):null;
  const facingCam=f=>{const a=project([0,0,0]),b=project(f.normal);return b[2]-a[2]>.035;};
  const surfaces=!muscles||!withMuscles?[]:anim.muscleProfile?.regions?(R.frames?mannequinMuscleSurfaces(R,anim.muscleProfile,{coarse:true}).filter(facingCam):catalogMuscleSurfaces(R,anim.muscleProfile,{coarse:true}).filter(f=>project(f.normal)[2]>.035)):visibleMuscleSurfaces(R,anim.muscleProfile,camera);
  if(muscles&&withMuscles)for(const zone of muscleContours(surfaces)){
   const value=sideValues?.[zone.side]?.[zone.id]??muscles.values[zone.id],fill=muscleColor(value);
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
 const setVectors=anim.catalogId?catalogVectorGroup(svg,anim,camera):vectorGroup(svg,anim,camera);
 if(setVectors.bounds)allBounds.push(...setVectors.bounds);
 let floorCorners=[[-76,187,0],[76,187,0],[76,187,195],[-76,187,195]];
 if(anim.rig3d(0).frames){
  /* пол под всей сценой манекена: суставы по фазам и детали инвентаря */
  const xs=[],zs=[],add=p=>{if(p&&p.length===3){xs.push(p[0]);zs.push(p[2]);}};
  for(let i=0;i<=4;i++){const R=anim.rig3d(i/4);for(const k of ['hip','head','anL','anR','toeL','toeR','heelL','heelR','gripL','gripR','knL','knR'])add(R[k]);
   for(const q of R.props){if(!GymEquipment.visible(q,opts.has))continue;for(const k of ['a','b','c'])add(q[k]);if(q.pts)q.pts.forEach(add);if(q.size&&q.c){const r=Math.max(...q.size)/2;add(V3.add(q.c,[r,0,r]));add(V3.add(q.c,[-r,0,-r]));}}}
  const x0=Math.min(...xs)-18,x1=Math.max(...xs)+18,z0=Math.min(...zs)-18,z1=Math.max(...zs)+18;
  floorCorners=[[x0,186.5,z0],[x1,186.5,z0],[x1,186.5,z1],[x0,186.5,z1]];
 }
 if(!anim.noGround)allBounds.push(...floorCorners.map(project));
 let minX=Math.min(...allBounds.map(p=>p[0]))-13,maxX=Math.max(...allBounds.map(p=>p[0]))+13,minY=Math.min(...allBounds.map(p=>p[1]))-16,maxY=Math.max(...allBounds.map(p=>p[1]))+10;
 const ratio=opts.ratio||1.15,cx=(minX+maxX)/2,cy=(minY+maxY)/2;let w=maxX-minX,h=maxY-minY;
 if(w/h<ratio)w=h*ratio;else h=w/ratio;
 svg.setAttribute('viewBox',`${f1(cx-w/2)} ${f1(cy-h/2)} ${f1(w)} ${f1(h)}`);
 if(!anim.noGround){
  el('path',{d:path2(floorCorners.map(project)),class:'spatial-floor'},ground);
  const fx0=floorCorners[0][0]+6,fx1=floorCorners[1][0]-6,fz0=floorCorners[0][2],fz1=floorCorners[2][2];
  for(let z=Math.ceil(fz0/50)*50;z<fz1;z+=50){const a=project([fx0,187,z]),b=project([fx1,187,z]);el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'spatial-grid'},ground);}
 }
 trace.setAttribute('d',tracePts.map((p,i)=>`${i?'L':'M'}${f1(p[0])},${f1(p[1])}`).join(' '));
 let nodes=[],jointNodes=[],selectedRegion='all';
 /* метки нагрузки на суставы — поверх всего рисунка */
 const stressLayer=el('g',{class:'stress-marks','aria-hidden':'true'},svg),stressNodes=[];
 let stressOn=(opts.stress??(typeof motionPrefs!=='undefined'?motionPrefs.stress:true))!==false,lastT=opts.t||0,lastFrame=null;
 function paintStress(R,t,frame){
  const marks=stressOn&&anim.catalogId&&R.frames&&typeof jointStressPoints==='function'?jointStressPoints(anim,R,t,frame?.index||0):[];
  marks.forEach((m,i)=>{const p=project(m.p);let n=stressNodes[i];if(!n){n=stressNodes[i]=el('g',{class:'stress-mark'},stressLayer);el('circle',{r:9,class:'stress-halo'},n);el('circle',{r:3.4,class:'stress-core'},n);}n.setAttribute('transform',`translate(${f1(p[0])},${f1(p[1])})`);n.dataset.joint=m.key;n.removeAttribute('display');});
  for(let i=marks.length;i<stressNodes.length;i++)stressNodes[i].setAttribute('display','none');
 }
 function at(t,frame){
  lastT=t;lastFrame=frame||null;
  const {R,muscles,records}=compile(t,frame?.index||0);
  records.forEach((s,i)=>{let node=nodes[i];if(!node||node.tagName!==s.tag){const replacement=el(s.tag,{});if(node)node.replaceWith(replacement);else scene.appendChild(replacement);node=nodes[i]=replacement;}for(const attr of [...node.attributes])if(!(attr.name in s.attrs))node.removeAttribute(attr.name);for(const[k,v]of Object.entries(s.attrs))node.setAttribute(k,v);});
  for(let i=records.length;i<nodes.length;i++)nodes[i].remove();nodes.length=records.length;
  const names=['shL','elL','wrL','hipL','knL','anL','shR','elR','wrR','hipR','knR','anR'];
  names.forEach((name,i)=>{const p=project(R[name]),node=jointNodes[i]||(jointNodes[i]=el('circle',{r:2.1,class:'joint-dot'},dots));node.setAttribute('cx',f1(p[0]));node.setAttribute('cy',f1(p[1]));});
  svg.dataset.pose=String(t);if(muscles)svg.dataset.musclePhase=muscles.phase;allBounds.length=0;setRegion(selectedRegion);
  setVectors?.at?.(t,frame,R);paintStress(R,t,frame);
 }
 const setStress=show=>{stressOn=!!show;at(lastT,lastFrame);};
 const setTrace=show=>trace.setAttribute('display',show?'inline':'none');
 const setMuscles=show=>svg.classList.toggle('show-muscles',!!show&&!!anim.muscleProfile);
 const setRegion=id=>{selectedRegion=id;for(const node of svg.querySelectorAll('[data-muscle]'))node.style.opacity=id==='all'||node.dataset.muscle===id?'1':'.12';};
 setMuscles(opts.muscles);at(opts.t||0);return{svg,at,setTrace,setVectors,setMuscles,setRegion,setStress,camera};
}

function spatialExercise(id,rig,camera,cameras,hints){
 const a=DEMO[id].anim;a.rig3d=rig;a.camera=camera;a.view=camera;a.cameras=cameras;a.cameraHints=hints;
 a.sample=t=>({spatialT:t});delete a._C;delete a._normalized;
}
spatialExercise('latpull',pulldownRig,'front',['front','back','side'],{
 front:'Watch the symmetry: elbows come down at your sides, grip stays the same.',
 back:'See the lats and mid-back. Lower both elbows evenly and keep your torso steady.',
 side:'The handle passes in front of your face to the upper chest. Keep the torso lean small.'
});
spatialExercise('bulgarian',bulgarianRig,'side',['side','angle'],{
 side:'Rear knee lowers toward the floor; the top of the rear foot stays on the bench.',
 angle:'Feet on two separate lines. Front knee points toward the toes, hips hold position.'
});
spatialExercise('hipthrust',thrustRig,'side',['side','angle'],{
 side:'Support at the lower shoulder blades. Plates are shown as outlines so they don\'t hide the hips and bar position.',
 angle:'Both feet, knee position and grip are visible. The padded bar rests in the hip crease.'
});
spatialExercise('chinup',chinupRig,'side',['side','front'],{
 side:'Elbows move down in front of the torso. Hands keep the grip, body rises without swinging.',
 front:'Grip about shoulder-width, palms facing you. Arms work symmetrically; the elbows\' forward travel is visible from the side.'
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
 R.contacts=[{p:[0,benchTop3,R.sh[2]],label:'Shoulder blades on bench'},{p:[-16,184,166],label:'Feet on floor'}];
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
 R.contacts=[{p:[-18,184,98],label:'Whole foot on floor'}];
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
 R.contacts=[{p:[-13,184,100],label:'Midfoot under bar'}];
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
 R.contacts=[{p:[-11,184,98],label:'Feet hip-width apart'}];
 return R;
}
spatialExercise('bbbench',benchRig,'side',['side','front','above'],{
 side:'The bar lowers to the lower chest and travels up and slightly toward the head. Hips stay on the bench.',
 front:'Grip slightly wider than shoulders, forearms nearly vertical at the bottom, elbows don\'t flare to 90°.',
 above:'See the chest, shoulders and arm symmetry. Use the side view to check the bar path relative to your chest.'
});
spatialExercise('squat',squatRig,'side',['side','front','back'],{
 side:'Hips move back as the knees bend; the bar travels vertically over midfoot.',
 front:'Knees track toward the toes without caving in. Feet slightly wider than shoulders, heels down.',
 back:'See the glutes and hamstrings. Keep the pelvis centered and maintain support through both feet.'
});
spatialExercise('deadlift',deadliftRig,'side',['side','front'],{
 side:'The bar travels vertically along the shins; shoulders slightly ahead of the bar at the start, back flat.',
 front:'Grip slightly wider than legs, arms hanging vertically, feet hip-width under the bar.'
});
spatialExercise('ohp',ohpRig,'side',['side','front'],{
 side:'The bar goes straight up from the collarbones; the head moves back, then returns under the bar.',
 front:'Grip slightly wider than shoulders, elbows under the bar; torso doesn\'t lean to the side.'
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
 R.contacts=[{p:[-12,184,98],label:'Weight on heels and midfoot'}];
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
 R.contacts=[{p:[-12,184,127],label:'Whole front foot'},{p:[12,184,68],label:'Rear foot on toes'}];
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
 R.contacts=[{p:[0,hip[1]-30,hip[2]-14],label:'Back pressed to backrest'}];
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
 R.contacts=[{p:[-13,184,100],label:'Feet hip-width apart'}];
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
 R.contacts=[{p:[0,benchTop3,R.sh[2]],label:'Shoulder blades on bench'},{p:[-16,184,166],label:'Feet on floor'}];
 return R;
}
spatialExercise('rdl',rdlRig,'side',['side','front'],{
 side:'Hips move back, knees slightly bent with almost no change in angle. The weight slides along the legs.',
 front:'The weight stays centered, shoulders level, feet hip-width apart.'
});
spatialExercise('lunge',lungeRig,'side',['side','front'],{
 side:'Vertical descent: front knee over the foot, rear knee toward the floor, torso doesn\'t lean.',
 front:'Feet on two parallel lines, front knee tracks over the toes and doesn\'t cave in.'
});
spatialExercise('dbpress',dbpressRig,'front',['front','side'],{
 front:'Dumbbells move in an arc and meet overhead; elbows under the dumbbells, shoulders level.',
 side:'Back pressed to the backrest. Elbows don\'t drift behind the torso, no excessive lower-back arch.'
});
spatialExercise('bbrow',bbrowRig,'side',['side','front'],{
 side:'Torso at 45–50°, angle doesn\'t change. The bar goes to the lower belly, elbows back along the torso.',
 front:'Shoulder-width grip, elbows move symmetrically, shoulders level.'
});
spatialExercise('dbbench',dbbenchRig,'front',['front','side'],{
 front:'Dumbbells move apart as you lower and come together in an arc as you press; elbows at 45–60° to the torso.',
 side:'Shoulder blades squeezed and pressed down, natural arch in the lower back, feet on the floor.'
});

DEMO.latpull.tech=['Sit down, place your feet on the floor and lock your thighs under the pads. Take an overhand grip on the handle, wider than shoulders.','Lean back slightly and hold that angle; keep your head in line with your spine.','Drive your elbows down at your sides, bringing the handle past your face to the upper chest. Stop when pulling further would require moving your elbows back.','Smoothly return the handle up, straightening your arms and letting your shoulder blades move naturally.'];
DEMO.latpull.anim.cues=['Drive your elbows down; the handle travels past your face to your chest.','Straighten your arms under control, holding your torso position.'];
DEMO.bulgarian.tech=['Place your front foot on the floor and the top of your rear foot on a stable bench. Feet hip-width apart, not in a single line.','Bend your front leg and lower your rear knee toward the floor. Choose depth based on position control and available mobility.','Keep your whole front foot planted; front knee travels toward the toes. A slight forward lean of the torso is fine.','Rise mainly through the front leg. Repeat on the other side.'];
DEMO.bulgarian.anim.cues=['Rise using your front leg without pushing off the bench.','Lower your hips and rear knee; both feet stay planted.'];
DEMO.hipthrust.tech=['Rest your lower shoulder blades on a stable bench. Place the padded bar in your hip crease and hold it with your hands.','Plant your feet firmly: at the top your shins are roughly vertical, knees tracking over the toes.','Raise your hips to a shoulders–hips–knees line. Upper back stays in contact with the bench; don\'t add lower-back arch.','Lower your hips smoothly, controlling the barbell and keeping your feet planted.'];
MOTION_FOCUS.latpull={setup:'Thighs under the pads, feet on the floor, slight lean back.',control:'Elbows down, handle past your face to your chest; no torso swinging.'};
MOTION_FOCUS.bulgarian={setup:'Front foot on the floor, top of the rear foot on the bench.',control:'Rear knee travels toward the floor; front foot stays planted.'};
MOTION_FOCUS.hipthrust={setup:'Lower shoulder blades on the edge of the bench; bar in the hip crease.',control:'Drive the hips up by extending them; keep your back and feet in contact.'};
DEMO.chinup.anim.cues=['Pull your body up, driving your elbows down in front of you. Hands stay on the bar.','Lower smoothly, straightening your arms without swinging or craning your neck.'];
DEMO.chinup.tech=['Grab the bar about shoulder-width apart, palms facing you. Hang with control over your shoulder position.','Pull your body up, driving your elbows down in front of your torso. Keep your head and back in line.','Get your chin over the bar without craning your neck; then lower under control until your arms are straight.'];
MOTION_FOCUS.chinup={setup:'Palms-facing grip, about shoulder-width apart.',control:'Elbows down in front of your torso; hands on the bar, no leg kicking.'};
MOTION_SOURCES.push(['Lat pulldown — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],['Bulgarian split squat — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat'],['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']);
MOTION_SOURCES.push(['Chin-ups — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']);

/* Учебные мышечные зоны. Числа управляют яркостью, не измеряют силу или ЭМГ.
   Источники описывают технику/состав мышц; кривые — явно условная иллюстрация.
   Узлы кривых: t=0, .5, 1. Общие края исключают скачки в паузах и на развороте. */
const MUSCLE_ROLES={primary:'Primary',support:'Assisting',stabilizer:'Stabilizer'};
const MUSCLE_BANDS=['Neutral','Light involvement','Moderate involvement','Strong involvement'];
const MUSCLE_PROFILES={
 bbbench:{pair:'above',curveBasis:'illustrative',
  sources:[['Bench press muscles — study','https://pubmed.ncbi.nlm.nih.gov/25799093/']],
  notes:{concentric:'The chest, triceps and front delts contribute to the press. Keep your torso supported.',
   eccentric:'The chest, triceps and front delts control the lowering phase. Keep your torso supported.',
   end:'Bottom position: the muscles continue to support the load during the pause.',
   start:'Top position: maintain your grip and keep your torso stable.'},
  muscles:{
   chest:{role:'primary',concentric:[.35,.86,.65],eccentric:[.35,.59,.65]},
   triceps:{role:'support',concentric:[.42,.72,.45],eccentric:[.42,.51,.45]},
   delt_f:{role:'support',concentric:[.32,.64,.50],eccentric:[.32,.46,.50]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 latpull:{pair:'back',curveBasis:'illustrative',
  sources:[['Lat pulldown — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],
   ['Lat pulldown muscles — study','https://pubmed.ncbi.nlm.nih.gov/15228624/']],
  notes:{concentric:'The lats and elbow flexors contribute to the pull; the core maintains your position.',
   eccentric:'The back muscles and elbow flexors control the handle as it returns upward.',
   end:'Handle at the chest: maintain muscle tension and keep your torso steady.',
   start:'Arms overhead: maintain your grip and torso position before the next pull.'},
  muscles:{
   lats:{role:'primary',concentric:[.36,.86,.72],eccentric:[.36,.61,.72]},
   biceps:{role:'support',concentric:[.30,.68,.57],eccentric:[.30,.49,.57]},
   midback:{role:'support',concentric:[.32,.61,.65],eccentric:[.32,.48,.65]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 squat:{pair:'back',curveBasis:'illustrative',
  sources:[['Muscles and joint moments in the squat — study','https://pubmed.ncbi.nlm.nih.gov/33136769/']],
  notes:{concentric:'The quads extend the knees and the glutes extend the hips. Keep your torso stable.',
   eccentric:'The quads and glutes control the descent. The core stabilizes the back.',
   end:'Bottom position: maintain core tension and keep the whole foot planted.',
   start:'Top position: maintain your footing and prepare for the next repetition.'},
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
/* Шкала участия: цвет тела → жёлтый → янтарный → оранжевый. Красный оставлен для отметок нагрузки на суставы. */
const MUSCLE_STOPS=[[0,[174,184,200]],[.15,[233,210,106]],[.45,[245,184,46]],[.75,[242,138,31]],[1,[234,106,14]]];
function muscleColor(v){
 const x=Math.max(0,Math.min(1,Number.isFinite(v)?v:0));let i=0;while(i<MUSCLE_STOPS.length-2&&x>MUSCLE_STOPS[i+1][0])i++;
 const[a,ca]=MUSCLE_STOPS[i],[b,cb]=MUSCLE_STOPS[i+1],q=(x-a)/(b-a);
 return '#'+ca.map((c,k)=>Math.round(c+(cb[k]-c)*q).toString(16).padStart(2,'0')).join('');
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

/* Манекен атласа: пропорции, суставы, прямая и обратная кинематика.
   Один источник геометрии тела для отрисовки, мышечных зон, авторинга поз и валидатора.

   Внутренние координаты: сантиметры, Y вверх, пол Y=0, правая тройка.
   Тело в нейтральной позе смотрит вдоль +Z, левая сторона тела — +X.
   Наружу (для сцены и проверок) поза отдаётся в координатах каталога:
   см, ось Y вниз, пол y=186; направления — тем же отражением по Y.

   Источники:
   - длины сегментов между центрами суставов — de Leva P. Adjustments to Zatsiorsky–Seluyanov's
     segment inertia parameters. J Biomech 1996;29:1223–1230 (мужчины, рост 174,1 см → 175 см);
   - высоты ориентиров — Winter DA. Biomechanics and Motor Control of Human Movement, 4th ed., 2009, рис. 4.1;
   - обхваты и ширины — сводные средние ANSUR II (US Army, 2012), мужчины;
   - массы и центры масс сегментов — de Leva 1996;
   - пределы суставов — Soucie JM et al. Haemophilia 2011 (CDC Joint ROM), AAOS (Greene & Heckman 1994). */
const Mannequin=(()=>{
'use strict';
const D2R=Math.PI/180,R2D=180/Math.PI,FLOOR=186;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const V={
 add:(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],
 sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 scale:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 len:a=>Math.hypot(a[0],a[1],a[2]),
 dist:(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),
 unit:a=>{const l=Math.hypot(a[0],a[1],a[2]);return l<1e-12?[0,0,0]:[a[0]/l,a[1]/l,a[2]/l];},
 mix:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
 perp:(v,axis)=>{const d=v[0]*axis[0]+v[1]*axis[1]+v[2]*axis[2];return[v[0]-axis[0]*d,v[1]-axis[1]*d,v[2]-axis[2]*d];},
 angle:(a,b)=>{const la=Math.hypot(...a),lb=Math.hypot(...b);if(la<1e-12||lb<1e-12)return 0;return Math.acos(clamp((a[0]*b[0]+a[1]*b[1]+a[2]*b[2])/la/lb,-1,1))*R2D;}
};
/* 3×3, построчно: [r00,r01,r02, r10,…]. Столбцы — оси локальной системы в мире. */
const M3={
 I:()=>[1,0,0,0,1,0,0,0,1],
 mul:(A,B)=>{const o=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)o[i*3+j]=A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j];return o;},
 v:(A,p)=>[A[0]*p[0]+A[1]*p[1]+A[2]*p[2],A[3]*p[0]+A[4]*p[1]+A[5]*p[2],A[6]*p[0]+A[7]*p[1]+A[8]*p[2]],
 T:A=>[A[0],A[3],A[6],A[1],A[4],A[7],A[2],A[5],A[8]],
 col:(A,i)=>[A[i],A[3+i],A[6+i]],
 cols:(x,y,z)=>[x[0],y[0],z[0],x[1],y[1],z[1],x[2],y[2],z[2]],
 rx:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[1,0,0,0,c,-s,0,s,c];},
 ry:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[c,0,s,0,1,0,-s,0,c];},
 rz:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[c,-s,0,s,c,0,0,0,1];},
 axis:(k,rad)=>{const l=Math.hypot(...k);if(l<1e-12||Math.abs(rad)<1e-12)return M3.I();const x=k[0]/l,y=k[1]/l,z=k[2]/l,c=Math.cos(rad),s=Math.sin(rad),t=1-c;
  return[t*x*x+c,t*x*y-s*z,t*x*z+s*y,t*x*y+s*z,t*y*y+c,t*y*z-s*x,t*x*z-s*y,t*y*z+s*x,t*z*z+c];},
 /* ортонормирование по двум осям: y — главная, z — уточняется */
 frameYZ:(y,zHint)=>{y=V.unit(y);let z=V.perp(zHint,y);if(V.len(z)<1e-9)z=V.perp(Math.abs(y[2])<.9?[0,0,1]:[1,0,0],y);z=V.unit(z);return M3.cols(V.cross(y,z),y,z);}
};
const Q={
 fromM3:m=>{const t=m[0]+m[4]+m[8];let w,x,y,z;
  if(t>0){const s=Math.sqrt(t+1)*2;w=.25*s;x=(m[7]-m[5])/s;y=(m[2]-m[6])/s;z=(m[3]-m[1])/s;}
  else if(m[0]>m[4]&&m[0]>m[8]){const s=Math.sqrt(1+m[0]-m[4]-m[8])*2;w=(m[7]-m[5])/s;x=.25*s;y=(m[1]+m[3])/s;z=(m[2]+m[6])/s;}
  else if(m[4]>m[8]){const s=Math.sqrt(1+m[4]-m[0]-m[8])*2;w=(m[2]-m[6])/s;x=(m[1]+m[3])/s;y=.25*s;z=(m[5]+m[7])/s;}
  else{const s=Math.sqrt(1+m[8]-m[0]-m[4])*2;w=(m[3]-m[1])/s;x=(m[2]+m[6])/s;y=(m[5]+m[7])/s;z=.25*s;}
  return Q.norm([w,x,y,z]);},
 toM3:q=>{const[w,x,y,z]=Q.norm(q);return[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y),2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x),2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)];},
 norm:q=>{const l=Math.hypot(...q)||1;return q.map(v=>v/l);},
 slerp:(a,b,t)=>{let d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];if(d<0){b=b.map(v=>-v);d=-d;}
  if(d>.9995)return Q.norm(a.map((v,i)=>v+(b[i]-v)*t));const th=Math.acos(d),s=Math.sin(th),wa=Math.sin((1-t)*th)/s,wb=Math.sin(t*th)/s;return a.map((v,i)=>v*wa+b[i]*wb);}
};
/* углы: Rx(α)·Rz(β)·Ry(γ) и Ry(α)·Rz(a)·Rx(b) */
function eulerXZY(M){return[Math.atan2(M[7],M[4])*R2D,Math.asin(clamp(-M[1],-1,1))*R2D,Math.atan2(M[2],M[0])*R2D];}
function eulerYZX(M){return[Math.atan2(-M[6],M[0])*R2D,Math.asin(clamp(M[3],-1,1))*R2D,Math.atan2(-M[5],M[4])*R2D];}
/* поворот «размах»: ось в плоскости XZ, вектор в градусах; затем «закрутка» вокруг Y */
function swing(vx,vz){const a=Math.hypot(vx,vz);return a<1e-9?M3.I():M3.axis([vx,0,vz],a*D2R);}
function swingTwist(M){
 const y=M3.col(M,1),ang=Math.acos(clamp(y[1],-1,1)),k=[y[2],0,-y[0]],l=Math.hypot(k[0],k[2]);
 const sv=l<1e-9?[0,0]:[k[0]/l*ang*R2D,k[2]/l*ang*R2D],S=swing(sv[0],sv[1]),Tw=M3.mul(M3.T(S),M);
 return{vx:sv[0],vz:sv[1],twist:Math.atan2(Tw[2],Tw[0])*R2D,elevation:ang*R2D};
}

/* ---------- Антропометрия: мужчина 175 см, 78 кг, в кроссовках (подошва 2 см) ---------- */
const B={
 stature:175,mass:78,sole:2,
 ua:28.3,fa:27.0,th:42.4,sk:43.6,               // плечо, предплечье, бедро, голень — между центрами суставов
 hipHalf:8.8,                                    // центры тазобедренных суставов ±8,8 см
 lumbar:[0,10,0],thoracic:[0,14,0],              // поясничный и грудопоясничный «шарниры» по оси корпуса
 c7:[0,33,-4],headJoint:[0,10.5,3.5],headCenter:[0,4,2],
 sc:[2,23.5,4],ghRel:[16,-1.9,-4],               // грудино-ключичный шарнир и центр плечевого сустава от него
 head:[7.9,11.4,9.8],                            // полуоси головы: ширина, высота, глубина
 grip:[2.6,-8.0,0],knuckle:[0,-9.8,0],           // центр хвата: 8 см дистальнее и 2,6 см ладоннее запястья
 palm:{width:8.4,thick:3.0,len:10.2},finger:8.6,
 ankle:8.5,heel:-6.5,ball:[0,-6.5,13.5],toe:[0,-0.6,7.2],toeSole:-2.0, // стопа в кроссовке от центра голеностопа
 shoe:{heelW:7.6,ballW:10.2,toeW:8.6,heelTop:-1.2,ballTop:-2.2,toeTop:1.0}
};
B.hipHeight=B.sk+B.th+B.ankle;                   // 94,5 см от пола до центров тазобедренных суставов (в обуви)
/* Сечения корпуса: h — высота над серединой тазобедренных суставов вдоль оси корпуса;
   w — полуширина, a — до передней поверхности, b — до задней. */
const TORSO=[[-9,12.5,4.5,8.5],[-4,15.8,7.2,12.2],[0,16.8,8.6,11.8],[6,16.4,10.0,10.4],[12,15.0,10.4,9.6],[18,14.6,10.4,9.6],[24,15.1,10.6,10.0],
 [31,16.1,12.0,10.6],[38,16.7,12.4,11.0],[44,16.0,11.0,11.0],[49,13.8,7.8,10.2],[53,10.0,4.6,8.6],[56,6.6,3.2,7.0]];
const TORSO_JOINTS=[10,24];
/* Профили конечностей: [t, спереди, сзади, латерально, медиально], см */
const LIMBS={
 ua:[[0,5.4,5.6,6.0,4.8],[.15,5.3,5.6,5.8,4.6],[.45,5.3,5.2,5.2,4.6],[.8,4.3,4.4,4.3,4.0],[1,3.7,4.0,4.0,3.9]],
 fa:[[0,4.0,4.2,4.6,4.3],[.2,4.6,4.3,5.0,4.6],[.55,3.6,3.3,3.9,3.6],[.85,2.5,2.3,3.1,2.8],[1,2.1,2.1,3.0,2.7]],
 th:[[0,8.8,10.0,10.4,8.0],[.12,9.2,9.6,9.0,8.4],[.4,8.4,8.4,7.8,7.8],[.75,7.0,6.5,6.4,6.6],[.92,5.8,5.5,5.4,5.6],[1,5.8,5.4,5.2,5.4]],
 sk:[[0,5.2,5.0,5.2,5.4],[.1,4.2,6.0,5.2,5.6],[.3,3.7,7.3,5.4,5.8],[.6,3.0,5.2,4.0,4.1],[.85,2.6,3.4,3.0,3.0],[1,2.8,3.4,3.6,3.4]]
};
/* Шея: [t, спереди, сзади, латерально], см; t=0 — над верхним сечением корпуса, t=1 — внутри черепа */
const NECK=[[0,5.4,6.0,5.8],[.5,5.0,5.6,5.4],[1,4.8,5.2,5.2]],NECK_BLEND=.4;
const CAPS={sh:6.0,el:3.9,wr:2.7,kn:5.3,an:3.5};
/* Массы (доля от общей) и центры масс сегментов: de Leva 1996, мужчины */
const MASS={head:.0694,upperTrunk:.1596,midTrunk:.1633,lowerTrunk:.1117,ua:.0271,fa:.0162,hand:.0061,th:.1416,sk:.0433,foot:.0137};
/* Пределы, градусы: [мин, макс]. Положительные направления — в описании DOF ниже. */
const LIMITS={
 lumbar:[[-25,50],[-25,25],[-10,10]],thoracic:[[-20,40],[-25,25],[-35,35]],neck:[[-60,50],[-40,40],[-70,70]],
 girdle:[[-10,40],[-20,28]],shoulderTwist:[-75,95],elbow:[-4,150],pron:[-85,80],wrist:[[-75,80],[-25,20]],
 hipTwist:[-40,45],knee:[-4,145],ankle:[[-45,50],[-30,20]],mtp:[-80,40]
};

/* ---------- Степени свободы ----------
 root.p — центр между тазобедренными суставами; root.q — ориентация таза (кватернион).
 lumbar/thoracic/neck: [сгибание вперёд +, боковой наклон вправо +, поворот влево +].
 Для каждой стороны:
  girdle [поднимание +, протракция +];
  shoulder [сгибание, отведение, наружная ротация +] — размах (экспонента) и закрутка;
  elbow сгибание +; pron пронация + (0 — большой палец вперёд);
  wrist [сгибание к ладони +, лучевое отведение +];
  hip [сгибание, отведение, наружная ротация +]; knee сгибание +;
  ankle [тыльное сгибание +, супинация (инверсия) +]; mtp разгибание пальцев (носок вверх) +. */
const SIDES=['L','R'],SIGN={L:1,R:-1};
function sideZero(){return{girdle:[0,0],shoulder:[0,7,0],elbow:6,pron:0,wrist:[0,0],hip:[0,0,4],knee:0,ankle:[0,0],mtp:0};}
function neutral(){
 return{root:{p:[0,B.hipHeight,0],q:[1,0,0,0]},lumbar:[0,0,0],thoracic:[0,0,0],neck:[0,0,0],L:sideZero(),R:sideZero(),hands:{L:'relaxed',R:'relaxed'}};
}
function clone(q){return JSON.parse(JSON.stringify(q));}
const PACK=[['root.p',3],['root.q',4],['lumbar',3],['thoracic',3],['neck',3]];
for(const s of SIDES)for(const[k,n]of [['girdle',2],['shoulder',3],['elbow',1],['pron',1],['wrist',2],['hip',3],['knee',1],['ankle',2],['mtp',1]])PACK.push([s+'.'+k,n]);
const PACK_SIZE=PACK.reduce((s,[,n])=>s+n,0);
function getPath(o,p){return p.split('.').reduce((a,k)=>a[k],o);}
function setPath(o,p,v){const k=p.split('.'),last=k.pop();k.reduce((a,x)=>a[x],o)[last]=v;}
function pack(q){const out=[];for(const[p,n]of PACK){const v=getPath(q,p);if(n===1)out.push(v);else out.push(...v);}return out;}
function unpack(a,hands){const q=neutral();let i=0;for(const[p,n]of PACK){setPath(q,p,n===1?a[i]:a.slice(i,i+n));i+=n;}if(hands)q.hands={...hands};return q;}

/* ---------- Прямая кинематика ---------- */
const child=(F,off,R)=>({o:V.add(F.o,M3.v(F.R,off)),R:R?M3.mul(F.R,R):F.R});
const at=(F,p)=>V.add(F.o,M3.v(F.R,p));
const spineRot=a=>M3.mul(M3.rx(a[0]),M3.mul(M3.rz(a[1]),M3.ry(a[2])));
function fk(q){
 const F={},P={};
 F.pelvis={o:[...q.root.p],R:Q.toM3(q.root.q)};
 F.lumbar=child(F.pelvis,B.lumbar,spineRot(q.lumbar));
 F.thorax=child(F.lumbar,B.thoracic,spineRot(q.thoracic));
 const half=q.neck.map(v=>v/2);
 F.neck=child(F.thorax,B.c7,spineRot(half));F.head=child(F.neck,B.headJoint,spineRot(half));
 P.head=at(F.head,B.headCenter);
 for(const s of SIDES){
  const g=SIGN[s],J=q[s];
  const sc=at(F.thorax,[g*B.sc[0],B.sc[1],B.sc[2]]),gr=M3.mul(M3.rz(g*J.girdle[0]),M3.ry(-g*J.girdle[1]));
  P['sc'+s]=sc;P['gh'+s]=V.add(sc,M3.v(M3.mul(F.thorax.R,gr),[g*B.ghRel[0],B.ghRel[1],B.ghRel[2]]));
  F['ua'+s]={o:P['gh'+s],R:M3.mul(F.thorax.R,M3.mul(swing(-J.shoulder[0],g*J.shoulder[1]),M3.ry(g*J.shoulder[2])))};
  P['el'+s]=at(F['ua'+s],[0,-B.ua,0]);
  F['fa'+s]={o:P['el'+s],R:M3.mul(F['ua'+s].R,M3.rx(-J.elbow))};
  P['wr'+s]=at(F['fa'+s],[0,-B.fa,0]);
  F['fd'+s]={o:P['wr'+s],R:M3.mul(F['fa'+s].R,M3.ry(-g*J.pron))};
  F['hand'+s]={o:P['wr'+s],R:M3.mul(F['fd'+s].R,M3.mul(M3.rz(-g*J.wrist[0]),M3.rx(-J.wrist[1])))};
  P['grip'+s]=at(F['hand'+s],[-g*B.grip[0],B.grip[1],B.grip[2]]);P['knuckle'+s]=at(F['hand'+s],B.knuckle);
  P['hip'+s]=at(F.pelvis,[g*B.hipHalf,0,0]);
  F['th'+s]={o:P['hip'+s],R:M3.mul(F.pelvis.R,M3.mul(swing(-J.hip[0],g*J.hip[1]),M3.ry(g*J.hip[2])))};
  P['kn'+s]=at(F['th'+s],[0,-B.th,0]);
  F['sk'+s]={o:P['kn'+s],R:M3.mul(F['th'+s].R,M3.rx(J.knee))};
  P['an'+s]=at(F['sk'+s],[0,-B.sk,0]);
  F['foot'+s]={o:P['an'+s],R:M3.mul(F['sk'+s].R,M3.mul(M3.rx(-J.ankle[0]),M3.rz(-g*J.ankle[1])))};
  P['heel'+s]=at(F['foot'+s],[0,-B.ankle,B.heel]);P['ball'+s]=at(F['foot'+s],B.ball);
  F['toes'+s]={o:P['ball'+s],R:M3.mul(F['foot'+s].R,M3.rx(-J.mtp))};
  P['toe'+s]=at(F['toes'+s],B.toe);
 }
 return{F,P,q};
}
/* Опорные точки подошвы (для контакта с полом и опорой) */
function solePoints(fkr,s){
 const F=fkr.F['foot'+s],T=fkr.F['toes'+s],g=SIGN[s],w=B.shoe;
 return[[0,-B.ankle,B.heel],[g*w.heelW/2,-B.ankle,B.heel+1.5],[-g*w.heelW/2,-B.ankle,B.heel+1.5],[g*w.ballW/2,-B.ankle,B.ball[2]],[-g*w.ballW/2,-B.ankle,B.ball[2]]].map(p=>({p:at(F,p),part:'rear'}))
  .concat([[0,B.toeSole,B.toe[2]],[g*w.toeW/2,B.toeSole,3],[-g*w.toeW/2,B.toeSole,3]].map(p=>({p:at(T,p),part:'toes'})));
}

/* ---------- Обратная кинематика ---------- */
/* Двухзвенная цепь: корень, цель, длины, «полюс» — куда смотрит средний сустав */
function twoBone(root,target,l1,l2,pole){
 let d=V.sub(target,root),dist=V.len(d);const axis=V.unit(d),reach=l1+l2;
 const clamped=dist>reach*.9995?reach*.9995:dist<Math.abs(l1-l2)+.01?Math.abs(l1-l2)+.01:dist;
 const along=(l1*l1-l2*l2+clamped*clamped)/(2*clamped),h=Math.sqrt(Math.max(0,l1*l1-along*along));
 let b=V.perp(pole,axis);if(V.len(b)<1e-9)b=V.perp(Math.abs(axis[1])<.9?[0,1,0]:[0,0,1],axis);b=V.unit(b);
 const mid=V.add(V.add(root,axis,along),b,h),end=V.add(root,axis,clamped);
 return{mid,end,reachError:dist-clamped};
}
/* Рука: ставит центр хвата в grip, ось ручки — handleAxis (направление от мизинца к большому пальцу),
   локоть — в сторону pole. Ладонь поворачивается вокруг ручки так, чтобы запястье было почти прямым.
   opts.wristExt — желаемое разгибание запястья, град. Возвращает сведения о точности. */
function solveArm(q,s,grip,handleAxis,pole,opts={}){
 const g=SIGN[s];let fkr=fk(q),hx=V.unit(handleAxis),info={};
 const gripOff=[-g*B.grip[0],B.grip[1],B.grip[2]];
 let distal=V.unit(V.perp(V.sub(grip,fkr.P['gh'+s]),hx));
 for(let it=0;it<8;it++){
  /* кисть: z — вдоль ручки, −y — дистально; ладонь (−g·x) обращена к ручке */
  let Rh=M3.frameYZ(V.scale(distal,-1),hx);
  if(opts.wristExt){Rh=M3.mul(Rh,M3.rz(g*opts.wristExt));}
  const wr=V.sub(grip,M3.v(Rh,gripOff)),sh=fkr.P['gh'+s];
  const tb=twoBone(sh,wr,B.ua,B.fa,pole);info.reachError=tb.reachError;
  setArmFromPoints(q,s,fkr,tb.mid,tb.end,Rh);
  fkr=fk(q);
  const fore=V.unit(V.sub(fkr.P['wr'+s],fkr.P['el'+s])),nd=V.unit(V.perp(fore,hx));
  if(V.len(nd)<1e-6)break;
  const change=V.angle(nd,distal);distal=nd;if(change<.05)break;
 }
 fkr=fk(q);info.gripError=V.dist(fkr.P['grip'+s],grip);info.axisError=V.angle(M3.col(fkr.F['hand'+s].R,2),hx);
 return info;
}
/* Свободная рука: запястье в точку, кисть — в продолжение предплечья (или заданная ориентация) */
function solveArmWrist(q,s,wrist,pole,handR=null){
 const fkr=fk(q),tb=twoBone(fkr.P['gh'+s],wrist,B.ua,B.fa,pole);
 setArmFromPoints(q,s,fkr,tb.mid,tb.end,handR);return{reachError:tb.reachError};
}
function setArmFromPoints(q,s,fkr,el,wr,handR){
 const g=SIGN[s],J=q[s],sh=fkr.P['gh'+s],T=fkr.F.thorax.R;
 const a=V.unit(V.sub(el,sh)),f=V.unit(V.sub(wr,el));
 let zf=V.perp(f,a);
 const bent=V.len(zf)>.02;
 if(!bent){ /* прямая рука: плоскость сгиба — по текущей закрутке */
  const cur=fkr.F['ua'+s].R;zf=V.perp(M3.col(cur,2),a);if(V.len(zf)<1e-6)zf=V.perp(M3.col(T,2),a);
 }
 const Rua=M3.frameYZ(V.scale(a,-1),zf),rel=M3.mul(M3.T(T),Rua),st=swingTwist(rel);
 J.shoulder=[-st.vx,g*st.vz,g*st.twist];
 J.elbow=V.angle(a,f)*(V.dot(f,M3.col(Rua,2))>=0?1:-1);
 const Rfa=M3.mul(Rua,M3.rx(-J.elbow));
 if(handR){
  const e=eulerYZX(M3.mul(M3.T(Rfa),handR));
  J.pron=-g*e[0];J.wrist=[-g*e[1],-e[2]];
 }
}
/* Нога: стопа задаётся рамкой (rearfoot), колено — в сторону pole */
function footFrame(support,yaw,opts={}){
 /* support — точка опоры под «мячом» стопы (подушечка под плюснефаланговыми суставами);
    подошва лежит на плоскости с нормалью up; yaw — разворот носка вокруг нормали (0 — вдоль +Z);
    heel — подъём пятки, град: задний отдел вращается вокруг плюснефаланговой линии, пальцы остаются на опоре. */
 const up=V.unit(opts.up||[0,1,0]),fwd0=opts.forward||[Math.sin(yaw*D2R),0,Math.cos(yaw*D2R)];
 let R0=M3.frameYZ(up,fwd0);if(opts.roll)R0=M3.mul(R0,M3.rz(opts.roll));
 const R=opts.heel?M3.mul(R0,M3.rx(opts.heel)):R0,ball=V.add(support,M3.v(R0,[0,-B.toeSole,0]));
 return{o:V.sub(ball,M3.v(R,B.ball)),R,toesR:R0};
}
/* Стопа, стоящая пяткой (носок поднят): опора под пяткой, pitch — подъём носка, град */
function heelFrame(support,yaw,pitch,opts={}){
 const up=V.unit(opts.up||[0,1,0]),fwd0=opts.forward||[Math.sin(yaw*D2R),0,Math.cos(yaw*D2R)],R=M3.mul(M3.frameYZ(up,fwd0),M3.rx(-pitch));
 /* самая низкая точка скруглённой пятки обуви касается опоры */
 const rb=SHOE.rear,zb=rb.c[2]-rb.size[2]/2,ry=rb.size[1]*.22,rz=rb.size[2]*.22,cy=-B.ankle+ry,cz=zb+rz;let best=null;
 for(let i=0;i<=24;i++){const a=Math.PI+i/24*Math.PI/2,p=[0,cy+ry*Math.sin(a),cz+rz*Math.cos(a)],w=V.dot(M3.v(R,p),up);if(!best||w<best.w)best={p,w};}
 for(const p of [[0,-B.ankle,zb+rz],[0,cy,zb]]){const w=V.dot(M3.v(R,p),up);if(w<best.w)best={p,w};}
 return{o:V.sub(support,M3.v(R,best.p)),R,toesR:R};
}
function solveLeg(q,s,foot,pole){
 /* foot: {o (центр голеностопа), R (рамка стопы), toesR?} */
 const g=SIGN[s],J=q[s];let fkr=fk(q);
 const hip=fkr.P['hip'+s],tb=twoBone(hip,foot.o,B.th,B.sk,pole||M3.col(foot.R,2));
 const P=fkr.F.pelvis.R,a=V.unit(V.sub(tb.mid,hip)),sd=V.unit(V.sub(tb.end,tb.mid));
 let zf=V.scale(V.perp(sd,a),-1);
 if(V.len(zf)<.02){zf=V.perp(pole||M3.col(foot.R,2),a);}
 const Rth=M3.frameYZ(V.scale(a,-1),zf),st=swingTwist(M3.mul(M3.T(P),Rth));
 J.hip=[-st.vx,g*st.vz,g*st.twist];
 J.knee=V.angle(a,sd)*(V.dot(sd,M3.col(Rth,2))<=0?1:-1);
 const Rsk=M3.mul(Rth,M3.rx(J.knee)),e=eulerXZY(M3.mul(M3.T(Rsk),foot.R));
 J.ankle=[-e[0],-g*e[1]];
 if(foot.toesR){const m=eulerXZY(M3.mul(M3.T(foot.R),foot.toesR));J.mtp=-m[0];}
 return{reachError:tb.reachError,ankleTwist:e[2]};
}

/* ---------- Корень и вспомогательные ---------- */
function rootRot(yaw=0,pitch=0,roll=0){return Q.fromM3(M3.mul(M3.ry(yaw),M3.mul(M3.rx(pitch),M3.rz(roll))));}
function rootFromAxes(up,forward){return Q.fromM3(M3.frameYZ(up,forward));}

/* ---------- Интерполяция ключей ---------- */
/* монотонная кубическая (Fritsch–Carlson) по каждой компоненте: без выбросов за пределы ключей */
function monotone(ts,ys){
 const n=ts.length,d=[],m=new Array(n).fill(0);
 for(let i=0;i<n-1;i++)d.push((ys[i+1]-ys[i])/(ts[i+1]-ts[i]));
 if(n===2){m[0]=m[1]=d[0];return m;}
 m[0]=d[0];m[n-1]=d[n-2];
 for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){if(Math.abs(d[i])<1e-12){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],h=a*a+b*b;if(h>9){const k=3/Math.sqrt(h);m[i]=k*a*d[i];m[i+1]=k*b*d[i];}}
 return m;
}
function makeTrack(keys,{loop=false}={}){
 /* keys: [{t, v:[...pack], hands:{L,R}}], v упакованы; кватернион корня приведён к одной полусфере.
    loop — замкнутый цикл (ключ t=1 совпадает с t=0): касательные на концах берутся через стык, без остановки. */
 const ts=keys.map(k=>k.t),n=keys[0].v.length,vals=keys.map(k=>k.v.slice());
 for(let i=1;i<vals.length;i++){const a=vals[i-1],b=vals[i];if(a[3]*b[3]+a[4]*b[4]+a[5]*b[5]+a[6]*b[6]<0)for(let j=3;j<7;j++)b[j]=-b[j];}
 const slopes=[];for(let j=0;j<n;j++)slopes.push(keys.length>1?monotone(ts,vals.map(v=>v[j])):[0]);
 if(loop&&keys.length>2){const m=keys.length-1;for(let j=0;j<n;j++){const d0=(vals[1][j]-vals[0][j])/(ts[1]-ts[0]),d1=(vals[m][j]-vals[m-1][j])/(ts[m]-ts[m-1]),s=d0*d1<=0?0:(d0+d1)/2;slopes[j][0]=slopes[j][m]=s;}}
 return t=>{
  if(keys.length===1)return{v:vals[0].slice(),hands:keys[0].hands};
  t=clamp(t,ts[0],ts.at(-1));let i=0;while(i<ts.length-2&&t>ts[i+1])i++;
  const h=ts[i+1]-ts[i],u=(t-ts[i])/h,u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2,out=new Array(n);
  for(let j=0;j<n;j++)out[j]=h00*vals[i][j]+h10*h*slopes[j][i]+h01*vals[i+1][j]+h11*h*slopes[j][i+1];
  const qn=Math.hypot(out[3],out[4],out[5],out[6])||1;for(let j=3;j<7;j++)out[j]/=qn;
  return{v:out,hands:(u<.5?keys[i]:keys[i+1]).hands};
 };
}

/* ---------- Вывод в координаты каталога ---------- */
const toCat=p=>[p[0],FLOOR-p[1],p[2]],dirCat=d=>[d[0],-d[1],d[2]];
function frameCat(F){return{o:toCat(F.o),x:dirCat(M3.col(F.R,0)),y:dirCat(M3.col(F.R,1)),z:dirCat(M3.col(F.R,2))};}
function catalogPose(q){
 const r=fk(q),P=r.P,F=r.F,R={basis:'mannequin',props:[],contacts:[]};
 R.hip=toCat(F.pelvis.o);R.u=dirCat(M3.col(F.pelvis.R,1));R.n=dirCat(M3.col(F.pelvis.R,2));R.x=dirCat(V.scale(M3.col(F.pelvis.R,0),-1)); /* x — анатомически правая сторона */
 R.waist=toCat(at(F.lumbar,[0,8,0]));R.chestU=dirCat(M3.col(F.thorax.R,1));R.chestN=dirCat(M3.col(F.thorax.R,2));
 R.sh=toCat(at(F.thorax,[0,21.6,0]));R.neckBase=toCat(at(F.thorax,[0,30,-3]));
 R.head=toCat(P.head);R.headU=dirCat(M3.col(F.head.R,1));R.headN=dirCat(M3.col(F.head.R,2));
 for(const s of SIDES){
  R['sh'+s]=toCat(P['gh'+s]);R['el'+s]=toCat(P['el'+s]);R['wr'+s]=toCat(P['wr'+s]);R['grip'+s]=toCat(P['grip'+s]);R['hand'+s]=toCat(P['knuckle'+s]);
  R['hip'+s]=toCat(P['hip'+s]);R['kn'+s]=toCat(P['kn'+s]);R['an'+s]=toCat(P['an'+s]);R['heel'+s]=toCat(P['heel'+s]);R['ball'+s]=toCat(P['ball'+s]);R['toe'+s]=toCat(P['toe'+s]);
 }
 R.frames={};for(const[k,f]of Object.entries(F))R.frames[k]=frameCat(f);
 R.hands={...(q.hands||{L:'relaxed',R:'relaxed'})};
 R.girdle={L:toCat(P.ghL),R:toCat(P.ghR)};
 R.gripRadius={L:q.gripRadius?.L??1.4,R:q.gripRadius?.R??1.4};
 return R;
}

/* ---------- Поверхность тела (в координатах каталога, только по рамкам — без векторных произведений) ---------- */
const lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function profileAt(prof,t){
 if(t<=prof[0][0])return prof[0].slice(1);
 for(let i=1;i<prof.length;i++)if(t<=prof[i][0]){const a=prof[i-1],b=prof[i],u=(t-a[0])/(b[0]-a[0]);return a.slice(1).map((v,k)=>lerp(v,b[k+1],u));}
 return prof.at(-1).slice(1);
}
const sectionAt=h=>profileAt(TORSO,h);
/* Ось корпуса: таз до 10 см, поясница 10–24, грудная клетка выше; скругление ±3 см у шарниров */
function spineFrame(R,h){
 const fr=R.frames,segs=[[fr.pelvis,0],[fr.lumbar,10],[fr.thorax,24]];
 const pointOn=(i,hh)=>{const[f,h0]=segs[i];return V.add(f.o,f.y,hh-h0);};
 const axesOf=i=>{const f=segs[i][0];return{x:f.x,y:f.y,z:f.z};};
 let seg=h<10?0:h<24?1:2;
 for(const[j,hj]of [[1,10],[2,24]]){
  if(Math.abs(h-hj)<3){
   const u=(h-hj+3)/6,P0=pointOn(j-1,hj-3),P1=pointOn(j,hj),P2=pointOn(j,hj+3);
   const c=[0,1,2].map(k=>(1-u)*(1-u)*P0[k]+2*u*(1-u)*P1[k]+u*u*P2[k]);
   const a=axesOf(j-1),b=axesOf(j),w=smooth(u),mixU=(p,q)=>V.unit(V.mix(p,q,w));
   const y=mixU(a.y,b.y),z=V.unit(V.perp(mixU(a.z,b.z),y)),x=V.unit(V.perp(V.perp(mixU(a.x,b.x),y),z));
   return{c,x,y,z};
  }
 }
 const ax=axesOf(seg);return{c:pointOn(seg,h),...ax};
}
/* Точка поверхности корпуса: side — 'L'/'R', ang ∈ [0, π] от передней линии через бок к спине */
function torsoPoint(R,h,side,ang,extra=0){
 const f=spineFrame(R,h),[w,a,b]=sectionAt(h),c=Math.cos(ang),s=Math.sin(ang),lat=V.scale(f.x,SIGN[side]); /* f.x — левая сторона тела */
 let p=V.add(V.add(f.c,f.z,((c>=0?a:b)+extra)*c),lat,(w+extra)*s);
 /* надплечья следуют за поднятием и протракцией плечевого пояса */
 if(h>38&&R.girdle&&R.frames.thorax){
  /* основание шеи следует за лопаткой лишь частично (до 60 % у h = 56): трапеция растягивается плавно, без складок */
  const k=smooth((h-38)/12)*(1-.4*smooth((h-50)/6))*Math.pow(Math.max(0,s),2),gh=R.girdle[side],rest=V.add(V.add(V.add(R.frames.thorax.o,R.frames.thorax.y,21.6),R.frames.thorax.x,SIGN[side]*18),R.frames.thorax.z,0);
  p=V.add(p,V.sub(gh,rest),k*.85);
 }
 return p;
}
const LIMB_DEF={ua:['ua','sh','el'],fa:['fa','el','wr'],th:['th','hip','kn'],sk:['sk','kn','an']};
/* Рамка сечения конечности: спереди (front) и латерально (lat). Для предплечья спереди — ладонная сторона,
   закрутка по длине — от локтевой (t=0) к лучевой (t=1) кости. */
function limbAxes(R,kind,side,t){
 const g=SIGN[side],fr=R.frames;
 if(kind==='fa'){
  const p=fr['fa'+side],d=fr['fd'+side],front=V.unit(V.mix(V.scale(p.x,-g),V.scale(d.x,-g),t)),lat=V.unit(V.mix(p.z,d.z,t));
  return{front,lat:V.unit(V.perp(lat,front)),axis:V.scale(p.y,-1)};
 }
 const f=fr[kind+side];return{front:f.z,lat:V.scale(f.x,g),axis:V.scale(f.y,-1)};
}
function limbPoint(R,kind,side,t,ang,extra=0){
 const[,a,b]=LIMB_DEF[kind],A=R[a+side],Bp=R[b+side],ax=limbAxes(R,kind,side,t),[rf,rb,rl,rm]=profileAt(LIMBS[kind],t),c=Math.cos(ang),s=Math.sin(ang);
 return V.add(V.add(V.mix(A,Bp,t),ax.front,((c>=0?rf:rb)+extra)*c),ax.lat,((s>=0?rl:rm)+extra)*s);
}
/* Шея: ось — от основания (на уровне верхнего сечения корпуса, впереди остистых отростков) к точке внутри черепа.
   Нижние 40 % плавно переходят из верхнего сечения корпуса (надплечья с поднятием плечевого пояса) в круглую шею:
   поверхность непрерывна, без уступа и открытого края сзади. ang: 0 — спереди, π/2 — левая сторона, π — сзади. */
function neckPoint(R,t,ang){
 const n=R.frames.neck,h=R.frames.head,lo=V.add(V.add(n.o,n.y,-1),n.z,2.5),hi=V.add(h.o,h.y,1.5),c=V.mix(lo,hi,t);
 const z=V.unit(V.mix(n.z,h.z,t)),x=V.unit(V.mix(n.x,h.x,t)),[rf,rb,rl]=profileAt(NECK,t),cs=Math.cos(ang),sn=Math.sin(ang);
 const p=V.add(V.add(c,z,(cs>=0?rf:rb)*cs),x,rl*sn),w=smooth(t/NECK_BLEND);
 if(w>=1)return p;
 /* основание — продолжение поверхности корпуса по её же касательной: стык корпуса и шеи без излома */
 const a=((ang%(2*Math.PI))+2*Math.PI)%(2*Math.PI),side=a<=Math.PI?'L':'R',an=a<=Math.PI?a:2*Math.PI-a,hTop=TORSO.at(-1)[0];
 const A=torsoPoint(R,hTop,side,an),A0=torsoPoint(R,hTop-2,side,an),base=V.add(A,V.unit(V.sub(A,A0)),t*V.dist(lo,hi));
 return V.mix(base,p,w);
}
const TORSO_H=[];for(let h=TORSO[0][0];h<=TORSO.at(-1)[0]+1e-9;h+=2.5)TORSO_H.push(+h.toFixed(2));if(TORSO_H.at(-1)<TORSO.at(-1)[0])TORSO_H.push(TORSO.at(-1)[0]);
/* Полная сетка тела для сцены: точки в координатах каталога */
function surface(R,{cols=24,limbRows=10,limbCols=16}={}){
 const torso=TORSO_H.map(h=>Array.from({length:cols},(_,c)=>{const a=c/cols*2*Math.PI,side=a<=Math.PI?'L':'R',ang=a<=Math.PI?a:2*Math.PI-a;return torsoPoint(R,h,side,ang);}));
 const limbs={};
 for(const s of SIDES)for(const k of Object.keys(LIMB_DEF))limbs[k+s]=Array.from({length:limbRows+1},(_,r)=>Array.from({length:limbCols},(_,c)=>{const a=c/limbCols*2*Math.PI;return limbPoint(R,k,s,r/limbRows,a);}));
 const neck=Array.from({length:9},(_,r)=>Array.from({length:20},(_,c)=>neckPoint(R,r/8,c/20*2*Math.PI)));
 return{torso,limbs,neck,torsoHeights:TORSO_H};
}

/* ---------- Знаковые расстояния тела (каталог) ---------- */
function ellipseRadius(lx,ly,rf,rb,rl,rm){
 const a=lx>=0?rf:rb,b=ly>=0?rl:rm,th=Math.atan2(ly/b,lx/a);return Math.hypot(a*Math.cos(th),b*Math.sin(th));
}
function limbSDF(R,kind,side,p){
 const[,a,b]=LIMB_DEF[kind],A=R[a+side],Bp=R[b+side],d=V.sub(Bp,A),L2=V.dot(d,d),t=clamp(V.dot(V.sub(p,A),d)/L2,0,1);
 const ax=limbAxes(R,kind,side,t),c=V.mix(A,Bp,t),off=V.sub(p,c),along=V.dot(off,V.unit(d)),rad=V.perp(off,V.unit(d));
 const lx=V.dot(rad,ax.front),ly=V.dot(rad,ax.lat),[rf,rb,rl,rm]=profileAt(LIMBS[kind],t),rho=Math.hypot(lx,ly),r=rho<1e-9?Math.min(rf,rb,rl,rm):ellipseRadius(lx,ly,rf,rb,rl,rm);
 const radial=rho-r,axial=t<=0||t>=1?Math.abs(along):0;
 return axial>0?(radial>0?Math.hypot(radial,axial):axial):radial;
}
const TORSO_SAMPLES=[];for(let h=-9;h<=56;h+=1)TORSO_SAMPLES.push(h);
function torsoSDF(R,p,cache){
 const frames=cache||TORSO_SAMPLES.map(h=>({h,f:spineFrame(R,h)}));
 let best=null;
 for(const s of frames){const off=V.sub(p,s.f.c),along=V.dot(off,s.f.y);if(!best||Math.abs(along)<Math.abs(best.along))best={s,along,off};}
 const{s,off,along}=best,lz=V.dot(off,s.f.z),lx=V.dot(off,s.f.x),[w,a,b]=sectionAt(s.h),rho=Math.hypot(lz,lx);
 const r=rho<1e-9?Math.min(w,a,b):ellipseRadius(lz,lx,a,b,w,w),radial=rho-r;
 /* торец корпуса (низ таза, основание шеи): внутри — до ближайшей поверхности, снаружи — до кромки */
 const lo=TORSO[0][0],hi=TORSO.at(-1)[0],hp=s.h+along,axial=Math.max(lo-hp,hp-hi);
 return axial>0?(radial>0?Math.hypot(radial,axial):axial):Math.max(radial,axial);
}
function torsoCache(R){return TORSO_SAMPLES.map(h=>({h,f:spineFrame(R,h)}));}
function headSDF(R,p){
 const c=R.head,ax=[R.frames.head.x,R.frames.head.y,R.frames.head.z],r=B.head,d=V.sub(p,c),qv=ax.map((a,i)=>V.dot(d,a)/r[i]);
 const k0=Math.hypot(...qv),k1=Math.hypot(...ax.map((a,i)=>V.dot(d,a)/(r[i]*r[i])));return k1<1e-9?-Math.min(...r):k0*(k0-1)/k1;
}

/* ---------- Кисть и обувь: опорные точки для сетки (локальные координаты кисти/стопы, см) ---------- */
/* Кисть: начало — центр лучезапястного сустава; −Y — к пальцам; ладонь смотрит в −g·X; +Z — сторона большого пальца.
   mode: grip — обхват ручки радиуса r; flat — ладонь на опоре; relaxed — расслабленная; fist — кулак. */
const FINGERS=[[2.9,8.0,.85],[1.0,8.8,.86],[-.9,8.2,.8],[-2.8,6.6,.72]];
function handShape(mode='relaxed',side='L',r=1.4){
 const g=SIGN[side],P=(u,v,w)=>[-g*u,-v,w],fingers=[],G=[B.grip[0],-B.grip[1]];
 for(const[w,len,rad]of FINGERS){
  let pts=[];
  if(mode==='grip'||mode==='fist'){
   const rr=mode==='fist'?1.15:r+.85,gu=mode==='fist'?2.2:G[0],gv=mode==='fist'?8.4:G[1];
   pts.push(P(.2,9.6,w));let used=0,prev=[.2,9.6],phi=-.6;
   while(used<len&&phi<3.3){const u=gu+rr*Math.sin(phi),v=gv+rr*Math.cos(phi);used+=Math.hypot(u-prev[0],v-prev[1]);prev=[u,v];pts.push(P(u,v,w*.96));phi+=.32;}
  }else{
   const bend=mode==='flat'?[0,4,2]:mode==='hook'?[10,95,48]:[22,34,22],seg=[.47,.29,.24];let dir=0,u=.2,v=9.6;pts.push(P(u,v,w));
   for(let i=0;i<3;i++){dir+=bend[i]*D2R;u+=Math.sin(dir)*len*seg[i];v+=Math.cos(dir)*len*seg[i];pts.push(P(u,v,w*(mode==='flat'?1.08:1)));}
  }
  fingers.push({pts,r:rad});
 }
 const T={hook:[[.4,2.6,3.0],[1.0,5.8,4.4],[1.4,8.0,4.6]],grip:[[.4,2.6,3.0],[1.9,6.0,3.7],[G[0]+r+2.0,G[1]-.4,2.4],[G[0]+r*.6+1.4,G[1]+r+.9,1.0]],
  fist:[[.4,2.6,3.0],[2.2,6.0,3.3],[3.4,8.6,1.6]],flat:[[.4,2.6,3.0],[.6,5.4,5.6],[.6,7.9,6.6]],relaxed:[[.4,2.6,3.0],[1.2,5.6,4.6],[1.9,7.7,4.2]]};
 return{palm:{c:P(.2,5.6,.15),size:[B.palm.thick,8.6,B.palm.width]},fingers,thumb:{pts:(T[mode]||T.relaxed).map(p=>P(...p)),r:1.0}};
}
const SHOE={rear:{c:[0,-5.0,3.6],size:[9.4,7.0,21.4]},toes:{c:[0,-.4,3.8],size:[9.0,3.2,7.6]}};
/* Данные тела для сцены: сетки, голова, кисти, обувь, «шапки» суставов */
function bodyData(R){
 const S=surface(R),fr=R.frames,caps=[];
 for(const s of SIDES){
  const ua=fr['ua'+s],g=SIGN[s];
  caps.push({key:'sh'+s,c:V.add(V.add(R['sh'+s],ua.y,-1.4),ua.x,g*.7),r:CAPS.sh},{key:'el'+s,c:R['el'+s],r:CAPS.el},{key:'wr'+s,c:R['wr'+s],r:CAPS.wr},{key:'kn'+s,c:V.add(R['kn'+s],fr['sk'+s].z,.4),r:CAPS.kn});
 }
 const hands={},feet={};
 for(const s of SIDES){const mode=R.hands?.[s]||'relaxed',r=R.gripRadius?.[s]??1.4;hands[s]={frame:fr['hand'+s],mode,r,key:mode+':'+s+':'+r.toFixed(2),shape:handShape(mode,s,r)};feet[s]={rear:fr['foot'+s],toes:fr['toes'+s]};}
 return{...S,head:{c:R.head,axes:[fr.head.x,fr.head.y,fr.head.z],radii:B.head},caps,hands,feet,shoe:SHOE};
}

/* ---------- Углы суставов по рамкам сегментов ----------
   Общие для валидатора (tools/biomech/validator2.js) и меток нагрузки на суставы в приложении. */
const jaInt = f => M3.cols([f.x[0], -f.x[1], f.x[2]], [f.y[0], -f.y[1], f.y[2]], [f.z[0], -f.z[1], f.z[2]]); /* каталог → внутренняя правая тройка */
const jaRel = (a, b) => M3.mul(M3.T(jaInt(a)), jaInt(b));
function jointAngles(R) {
  const F = R.frames, out = {};
  out.lumbar = eulerXZY(jaRel(F.pelvis, F.lumbar));
  out.thoracic = eulerXZY(jaRel(F.lumbar, F.thorax));
  out.neck = eulerXZY(jaRel(F.thorax, F.head));
  for (const s of SIDES) {
    const g = SIGN[s], A = {};
    /* плечо относительно грудной клетки */
    const ua = jaRel(F.thorax, F['ua' + s]), st = swingTwist(ua), hum = M3.v(ua, [0, -1, 0]);
    A.elevation = V.angle(hum, [0, -1, 0]);
    A.flexion = Math.atan2(hum[2], -hum[1]) * R2D;         /* вперёд + */
    A.abduction = Math.atan2(g * hum[0], Math.hypot(hum[1], hum[2])) * R2D; /* наружу + */
    A.posterior = -hum[2];                                     /* >0 — плечо позади фронтальной плоскости */
    A.up = hum[1]; A.lat = g * hum[0];
    A.twist = g * st.twist;
    const fa = jaRel(F['ua' + s], F['fa' + s]); A.elbow = -Math.atan2(fa[7], fa[4]) * R2D;
    const pr = jaRel(F['fa' + s], F['fd' + s]); A.pron = -g * Math.atan2(pr[2], pr[0]) * R2D;
    /* запястье: направление кисти в рамке дистального предплечья — устойчиво и при разгибании ~90° */
    const wr = jaRel(F['fd' + s], F['hand' + s]), d = [-wr[1], -wr[4], -wr[7]];
    A.wristFlex = Math.atan2(-g * d[0], -d[1]) * R2D; A.wristDev = Math.asin(clamp(d[2], -1, 1)) * R2D;
    { const ex = M3.mul(M3.rz(-g * A.wristFlex), M3.rx(-A.wristDev)), zE = M3.col(ex, 2), zH = M3.col(wr, 2), ax = V.unit(d);
      const a1 = V.unit(V.perp(zE, ax)), a2 = V.unit(V.perp(zH, ax)); A.wristTwist = Math.atan2(V.dot(V.cross(a1, a2), ax), V.dot(a1, a2)) * R2D; }
    const th = jaRel(F.pelvis, F['th' + s]), fem = M3.v(th, [0, -1, 0]), ht = swingTwist(th);
    A.hipFlex = Math.atan2(fem[2], -fem[1]) * R2D; A.hipAbd = Math.atan2(g * fem[0], Math.hypot(fem[1], fem[2])) * R2D; A.hipRot = g * ht.twist;
    const kn = jaRel(F['th' + s], F['sk' + s]); A.knee = Math.atan2(kn[7], kn[4]) * R2D;
    const an = eulerXZY(jaRel(F['sk' + s], F['foot' + s])); A.dorsi = -an[0]; A.inversion = -g * an[1]; A.ankleTwist = an[2];
    const mt = eulerXZY(jaRel(F['foot' + s], F['toes' + s])); A.mtp = -mt[0];
    out[s] = A;
  }
  return out;
}

/* ---------- Масса ---------- */
function centerOfMass(R,extra=[]){
 const m=B.mass,parts=[];
 const add=(p,frac)=>parts.push([p,frac*m]);
 add(R.head,MASS.head);
 add(spineFrame(R,40).c,MASS.upperTrunk);add(spineFrame(R,20).c,MASS.midTrunk);add(spineFrame(R,2).c,MASS.lowerTrunk);
 for(const s of SIDES){
  add(V.mix(R['sh'+s],R['el'+s],.5772),MASS.ua);add(V.mix(R['el'+s],R['wr'+s],.4574),MASS.fa);add(V.mix(R['wr'+s],R['hand'+s],.79),MASS.hand);
  add(V.mix(R['hip'+s],R['kn'+s],.4095),MASS.th);add(V.mix(R['kn'+s],R['an'+s],.4459),MASS.sk);add(V.mix(R['heel'+s],R['toe'+s],.4415),MASS.foot);
 }
 for(const e of extra)parts.push(e);
 const M=parts.reduce((s,[,w])=>s+w,0);return{c:parts.reduce((acc,[p,w])=>V.add(acc,p,w/M),[0,0,0]),mass:M};
}

return{V,M3,Q,B,TORSO,TORSO_H,TORSO_JOINTS,LIMBS,NECK,CAPS,MASS,LIMITS,SIDES,SIGN,FLOOR,D2R,R2D,clamp,
 neutral,clone,pack,unpack,PACK,PACK_SIZE,fk,solePoints,twoBone,solveArm,solveArmWrist,setArmFromPoints,footFrame,heelFrame,solveLeg,rootRot,rootFromAxes,
 swing,swingTwist,eulerXZY,eulerYZX,spineRot,makeTrack,monotone,toCat,dirCat,catalogPose,
 profileAt,sectionAt,spineFrame,torsoPoint,limbAxes,limbPoint,neckPoint,surface,limbSDF,torsoSDF,torsoCache,headSDF,ellipseRadius,centerOfMass,LIMB_DEF,
 handShape,SHOE,bodyData,jointAngles};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Mannequin;

/* Инвентарь атласа: параметрические модели снарядов и тренажёров в реальных размерах.
   Каждая деталь знает, к чему она крепится (mount), и свою роль: опора (support), рама (frame),
   хват (grip), свободный снаряд (free), трос (cable). Подвижные части берут положение из позы
   (хват, стопы), поэтому руки и ручки, стопы и платформы не расходятся.

   Размеры (см) — по типовым коммерческим образцам: гриф 220 см / шейка 131 / Ø28 мм, втулки Ø50;
   скамья 44 см до верха подушки, ширина 29; диск 20 кг Ø45; блок Ø9–10; турник Ø32 мм. */
const GymEquipment=((M)=>{
'use strict';
const{V,M3,D2R,toCat,dirCat}=M;
const TONES={frame:'frame',pad:'pad',chrome:'chrome',plate:'plate',rubber:'rubber',cable:'cable',band:'band',mat:'mat',wood:'wood',wall:'wall',stack:'stack'};
/* ---------- Сборщик: локальные координаты снаряда → мир → каталог ---------- */
function Builder(spec){
 const yaw=spec.yaw||0,R=M3.ry(yaw),o=[spec.at?.[0]||0,spec.at?.[1]||0,spec.at?.[2]||0];
 const P=p=>V.add(o,M3.v(R,p)),D=d=>M3.v(R,d),parts=[],anchors={},prefix=spec.id||spec.type;
 const id=k=>prefix+':'+k;
 const add=(k,part,opts={})=>{part.id=id(k);part.mount=opts.mount==null||opts.mount==='floor'?'floor':id(opts.mount);part.role=opts.role||'frame';part.tone=opts.tone||(part.role==='support'?'pad':'frame');if(opts.contact)part.contact=opts.contact;parts.push(part);return part;};
 return{
  P,D,parts,anchors,id,
  /* брус квадратного/прямоугольного сечения или труба (r) */
  tube(k,a,b,size,opts={}){const A=P(a),Bp=P(b);if(typeof size==='number')return add(k,{kind:'beam',a:toCat(A),b:toCat(Bp),r:size},opts);
   const up=D(opts.up||[0,1,0]);return add(k,{kind:'beam',a:toCat(A),b:toCat(Bp),w:size[0],h:size[1],up:dirCat(up)},opts);},
  box(k,c,size,opts={}){const ax=(opts.axes||[[1,0,0],[0,1,0],[0,0,1]]).map(a=>dirCat(D(V.unit(a))));return add(k,{kind:'obox',c:toCat(P(c)),x:ax[0],y:ax[1],z:ax[2],size:[...size],round:opts.round??.6},opts);},
  cyl(k,c,axis,r,len,opts={}){return add(k,{kind:'cyl',c:toCat(P(c)),axis:dirCat(V.unit(D(axis))),r,len,sides:opts.sides||24},opts);},
  ball(k,c,r,opts={}){return add(k,{kind:'sphere',c:toCat(P(c)),r},opts);},
  anchor(k,p){anchors[k]=P(p);return anchors[k];},
  frameAnchor(k,c,axes){anchors[k]={o:P(c),R:M3.cols(...axes.map(a=>V.unit(D(a))))};return anchors[k];}
 };
}
/* Наклонная подушка: центр нижней кромки (шарнир), угол от горизонтали, длина, ширина, толщина.
   Возвращает рамку подушки: y — нормаль к поверхности, z — вдоль подушки от шарнира. */
function padFrame(hinge,angle,dir=1){const a=angle*D2R,z=[0,Math.sin(a),dir*Math.cos(a)],y=[0,Math.cos(a),-dir*Math.sin(a)];return{hinge,z,y,x:V.cross(y,z)};}

/* ---------- Конструкции ---------- */
const TYPES={};
/* Коврик */
TYPES.mat=(s,b)=>{const L=s.len||180,W=s.width||60;b.box('mat',[0,.5,0],[W,1,L],{role:'support',tone:'mat',mount:'floor',round:.4});b.anchor('top',[0,1,0]);};
/* Горизонтальная скамья: ось вдоль Z, ножной конец −Z, головной +Z; верх подушки — height */
TYPES.flatBench=(s,b)=>{
 const H=s.height||44,L=s.len||120,W=s.width||29,T=6,z0=-L/2,z1=L/2;
 b.box('pad',[0,H-T/2,0],[W,T,L],{role:'support',tone:'pad',mount:'beam',round:1.6,contact:'top'});
 b.tube('beam',[0,H-T-3.75,z0+8],[0,H-T-3.75,z1-8],[7.5,7.5],{mount:'legF'});
 for(const[k,z]of [['F',z0+10],['B',z1-10]]){
  b.tube('leg'+k,[0,H-T-7.5,z],[0,6,z],[7.5,7.5],{mount:'foot'+k});
  b.tube('foot'+k,[-24,3.75,z],[24,3.75,z],[7.5,7.5],{mount:'floor',up:[0,1,0]});
  for(const sx of [-1,1])b.box('cap'+k+sx,[sx*24.5,3.75,z],[2,7,7],{mount:'foot'+k,tone:'rubber',round:.5});
 }
 b.anchor('top',[0,H,0]);b.anchor('head',[0,H,z1]);b.anchor('foot',[0,H,z0]);
};
/* Стойки для жима лёжа у головного конца скамьи */
TYPES.benchUprights=(s,b)=>{
 const X=s.halfWidth||56,Z=s.z||0,Hh=s.hook||108,top=Hh+18;
 for(const sx of [-1,1]){
  const k=sx<0?'L':'R';
  b.tube('up'+k,[sx*X,6,Z],[sx*X,top,Z],[5,7.5],{mount:'base'+k});
  b.tube('base'+k,[sx*X,3,Z-28],[sx*X,3,Z+20],[7.5,6],{mount:'floor'});
  b.box('hook'+k,[sx*X,Hh-2,Z-4.5],[4.5,4,6],{mount:'up'+k,tone:'chrome',round:.6});
  b.box('hookLip'+k,[sx*X,Hh+1.5,Z-7.2],[4.5,5,1.2],{mount:'hook'+k,tone:'chrome',round:.4});
 }
 b.tube('brace',[-X,3,Z+16],[X,3,Z+16],[6,6],{mount:'baseL'});
 b.anchor('hook',[0,Hh,Z-4.5]);
};
/* Регулируемая скамья: сиденье и спинка; back — угол спинки от горизонтали, seat — угол сиденья.
   Ось вдоль Z: передний край сиденья −Z, спинка поднимается к +Z. */
TYPES.adjBench=(s,b)=>{
 const H=s.height||45,back=s.back??0,seat=s.seat??0,W=s.width||29,T=6,sl=s.seatLen||36,bl=s.backLen||82,gap=1.5;
 const hingeZ=s.hingeZ??6,hinge=[0,H-T,hingeZ];
 /* сиденье: от шарнира вперёд (−Z), угол seat поднимает передний край */
 const sa=seat*D2R,sz=[0,-Math.sin(sa),-Math.cos(sa)],sy=[0,Math.cos(sa),-Math.sin(sa)];
 const seatC=V.add(V.add(hinge,sz,sl/2+gap),sy,T/2);
 if(s.seatPad!==false)b.box('seat',seatC,[W,T,sl],{axes:[[1,0,0],sy,V.scale(sz,-1)],role:'support',tone:'pad',mount:'seatPlate',round:1.6,contact:'top'});
 const ba=back*D2R,bz=[0,Math.sin(ba),Math.cos(ba)],by=[0,Math.cos(ba),-Math.sin(ba)];
 const backC=V.add(V.add(hinge,bz,bl/2+gap),by,T/2);
 b.box('back',backC,[W,T,bl],{axes:[[1,0,0],by,bz],role:'support',tone:'pad',mount:'backPlate',round:1.6,contact:'top'});
 /* пластины под подушками и рама */
 if(s.seatPad!==false)b.box('seatPlate',V.add(V.add(hinge,sz,sl/2+gap),sy,-1),[W-6,2,sl-4],{axes:[[1,0,0],sy,V.scale(sz,-1)],mount:'post'});
 b.box('backPlate',V.add(V.add(hinge,bz,bl/2+gap),by,-1),[W-6,2,bl-6],{axes:[[1,0,0],by,bz],mount:'strut'});
 b.tube('rail',[0,8,-48],[0,8,58],[7.5,7.5],{mount:'footF'});
 b.tube('post',[0,11.75,hingeZ-12],[0,H-T-2,hingeZ-12],[6,6],{mount:'rail'});
 if(s.seatPad===false)b.box('hingeBlock',[0,H-T-2,hingeZ-6],[10,6,14],{mount:'post'});
 b.tube('footF',[-26,3.75,-48],[26,3.75,-48],[7.5,7.5],{mount:'floor'});
 b.tube('footB',[-26,3.75,58],[26,3.75,58],[7.5,7.5],{mount:'floor'});
 b.tube('railB',[0,8,58],[0,8,50],[7.5,7.5],{mount:'footB'});
 /* опорная стойка спинки: от рамы к середине пластины спинки */
 const strutTop=V.add(V.add(hinge,bz,Math.min(bl*.55,40)),by,-2);
 b.tube('strut',[0,11.75,Math.max(hingeZ+10,Math.min(strutTop[2]+14,50))],strutTop,[5,5],{mount:'rail'});
 b.anchor('hinge',hinge);b.anchor('seatTop',V.add(V.add(hinge,sz,sl/2+gap),sy,T));
 b.frameAnchor('backPad',V.add(hinge,by,T),[[1,0,0],by,bz]);
 b.frameAnchor('seatPad',V.add(hinge,sy,T),[[1,0,0],sy,V.scale(sz,-1)]);
};
/* Силовая рама с турником и J-крюками; фронт рамы −Z… +Z, ширина по X */
TYPES.powerRack=(s,b)=>{
 const X=s.halfWidth||60,D=s.depth||110,H=s.height||232,zf=-D/2,zb=D/2;
 for(const[k,x,z]of [['FL',X,zf],['FR',-X,zf],['BL',X,zb],['BR',-X,zb]]){b.tube('up'+k,[x,0,z],[x,H,z],[7.5,7.5],{mount:'floor'});}
 for(const z of [zf,zb])b.tube('top'+(z<0?'F':'B'),[-X,H-3.75,z],[X,H-3.75,z],[7.5,7.5],{mount:'up'+(z<0?'FL':'BL')});
 for(const x of [X,-X]){const k=x>0?'L':'R';b.tube('side'+k,[x,H-3.75,zf],[x,H-3.75,zb],[7.5,7.5],{mount:'upF'+k});b.tube('base'+k,[x,3.75,zf-18],[x,3.75,zb+18],[7.5,7.5],{mount:'floor'});}
 const pz=zf-(s.barOut??12),py=s.pullH||H-8;
 if(s.pullBar!==false){for(const x of [X,-X])b.tube('pullArm'+(x>0?'L':'R'),[x,py,zf],[x,py,pz],[5,7.5],{mount:'upF'+(x>0?'L':'R')});
  b.tube('pullBar',[-X-3,py,pz],[X+3,py,pz],1.6,{mount:'pullArmL',role:'grip',tone:'chrome'});b.anchor('pullBar',[0,py,pz]);}
 if(s.hook){for(const x of [X,-X]){const k=x>0?'L':'R';b.box('hook'+k,[x,s.hook-2,zf-6],[5,4,6],{mount:'upF'+k,tone:'chrome'});b.box('hookLip'+k,[x,s.hook+1.5,zf-8.6],[5,5,1.2],{mount:'hook'+k,tone:'chrome'});}b.anchor('hook',[0,s.hook,zf-6]);}
 b.anchor('front',[0,0,zf]);
};
/* Машина Смита: направляющие вертикальны, гриф ходит вдоль них */
TYPES.smith=(s,b)=>{
 const X=s.halfWidth||62,H=s.height||228,Z=s.z||0,zb=Z+26;
 for(const x of [X,-X]){const k=x>0?'L':'R';
  b.tube('rod'+k,[x,6,Z],[x,H-8,Z],1.6,{mount:'base'+k,tone:'chrome',role:'guide'});
  b.tube('up'+k,[x+Math.sign(x)*9,0,zb],[x+Math.sign(x)*9,H,zb],[7.5,7.5],{mount:'floor'});
  b.tube('base'+k,[x,3.75,Z-55],[x,3.75,zb+30],[7.5,7.5],{mount:'floor'});
  b.tube('rodTop'+k,[x,H-8,Z],[x+Math.sign(x)*9,H-8,zb],[5,5],{mount:'up'+k});
  b.tube('rodBase'+k,[x,6,Z-5],[x,6,Z+5],[6,6],{mount:'base'+k});
 }
 b.tube('top',[-X-9,H-3.75,zb],[X+9,H-3.75,zb],[7.5,7.5],{mount:'upL'});
 b.anchor('rodL',[X,0,Z]);b.anchor('rodR',[-X,0,Z]);
};
/* «Бабочка» / задние дельты: рычаги вращаются вокруг вертикальных осей, проходящих через плечевые суставы.
   Сиденье в начале координат, подушка (спинка или грудной упор) — плоскостью z = padZ, рама — позади подушки
   с зазором для коленей при посадке лицом к упору. pivot — [x, y, z] осей (над плечами). */
TYPES.pecDeck=(s,b)=>{
 const seatH=s.seatH||48,padZ=s.padZ??18,padY=s.padY||95,padH=s.padH||60,padW=s.padW||30,towerZ=padZ+(s.towerGap||58),pv=s.pivot,H=pv[1]+16;
 b.box('seat',[0,seatH-3,0],[34,6,36],{role:'support',tone:'pad',mount:'seatPlate',round:1.6,contact:'top'});
 b.box('seatPlate',[0,seatH-7,0],[26,2,30],{mount:'seatPost'});
 b.tube('seatPost',[0,7.5,0],[0,seatH-8,0],[6,6],{mount:'base'});
 b.tube('base',[0,3.75,-26],[0,3.75,towerZ+26],[8,7.5],{mount:'floor'});
 b.tube('baseX',[-36,3.75,-22],[36,3.75,-22],[8,7.5],{mount:'base'});
 b.tube('baseB',[-36,3.75,towerZ],[36,3.75,towerZ],[8,7.5],{mount:'base'});
 b.tube('tower',[0,7.5,towerZ],[0,H,towerZ],[10,10],{mount:'base'});
 b.box('pad',[0,padY,padZ+3.5],[padW,padH,7],{role:'support',tone:'pad',mount:'padPlate',round:1.8,contact:'face'});
 b.box('padPlate',[0,padY,padZ+8],[padW-8,padH-8,2],{mount:'padArm'});
 b.tube('padArm',[0,padY,padZ+9],[0,padY,towerZ-5],[6,6],{mount:'tower'});
 b.tube('headArm',[0,H-4,towerZ-5],[0,H-4,pv[2]],[8,8],{mount:'tower'});
 b.tube('head',[-pv[0]-7,H-4,pv[2]],[pv[0]+7,H-4,pv[2]],[8,8],{mount:'headArm'});
 for(const sx of [-1,1]){const k=sx>0?'L':'R';b.cyl('hub'+k,[sx*pv[0],(pv[1]+H-8)/2,pv[2]],[0,1,0],4.2,H-8-pv[1]+.4,{mount:'head'});b.anchor('pivot'+k,[sx*pv[0],pv[1],pv[2]]);}
 b.box('stack',[0,62,towerZ+16],[28,124,14],{mount:'floor',tone:'stack'});
 b.box('stackTop',[0,126,towerZ+16],[30,4,16],{mount:'stack'});
 b.anchor('seatTop',[0,seatH,0]);b.anchor('padFace',[0,padY,padZ]);
};
/* ---------- Подвижные и свободные части: собираются по позе ---------- */
const PLATES={20:[22.5,5.6],15:[22.5,4.4],10:[22.5,3.4],5:[11.5,2.6],2.5:[9.5,1.8],1.25:[8,1.4],c10:[16,3.2],c5:[13,2.6],c2:[10,1.8]};
function barbellPart(c,axis,plates=[20],opts={}){
 /* олимпийский гриф 220 см; короткий (curl) — 120 см, шейка 70, втулки Ø3 */
 const curl=opts.size==='curl';
 return{kind:'barbell',c,axis,len:curl?120:220,inner:curl?35:65.5,shaftR:curl?1.4:1.4,sleeveR:curl?1.6:2.5,plates:plates.map(w=>Array.isArray(w)?w:(PLATES[w]||PLATES[20])),role:'free',tone:'chrome',free:true,id:opts.id||'barbell',mount:opts.mount||'hands'};
}
function dumbbellPart(c,axis,opts={}){return{kind:'dumbbell',c,axis,handle:opts.handle||13.5,headR:opts.headR||7.5,headLen:opts.headLen||7,role:'free',tone:'plate',free:true,id:opts.id||'dumbbell',mount:opts.mount||'hand'};}
const BIND={};
/* Гриф в руках: центр посередине между хватами, ось — линия хватов */
BIND.barbell=(e,R)=>{
 const L=R.gripL,Rr=R.gripR,axis=V.unit(V.sub(L,Rr)),c=e.center?V.add(V.mix(L,Rr,.5),axis,e.offset||0):V.mix(L,Rr,.5);
 const parts=[barbellPart(c,axis,e.plates,{id:e.id||'barbell',size:e.size})];
 return parts;
};
/* Гриф Смита: центр — на оси между направляющими на высоте хвата */
BIND.smithBar=(e,R)=>{
 const rodL=toCat(e.rodL),rodR=toCat(e.rodR),y=(R.gripL[1]+R.gripR[1])/2,c=[(rodL[0]+rodR[0])/2,y,(rodL[2]+rodR[2])/2],axis=V.unit(V.sub(rodL,rodR));
 const bar=barbellPart(c,axis,e.plates||[10],{id:e.id||'smithBar'});bar.free=false;bar.role='guided';bar.mount=(e.id||'smithBar')+':carL';bar.len=e.len||216;bar.inner=e.inner||69;
 const out=[bar];
 for(const[k,rod]of [['L',rodL],['R',rodR]])out.push({kind:'obox',c:[rod[0],y,rod[2]],x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[6,9,7],round:.8,tone:'frame',role:'carriage',id:(e.id||'smithBar')+':car'+k,mount:e.mountTo+':rod'+k});
 return out;
};
BIND.dumbbell=(e,R)=>{
 const s=e.hand,f=R.frames['hand'+s];
 return[dumbbellPart(R['grip'+s],f.z,{id:e.id||'dumbbell'+s,handle:e.handle,headR:e.headR,headLen:e.headLen})];
};
/* Гантель на опоре (пол, скамья): c — центр рукояти во внутренних координатах */
BIND.restingDumbbell=e=>[{...dumbbellPart(toCat(e.c),dirCat(V.unit(e.axis||[1,0,0])),{id:e.id||'dumbbellRest'}),mount:e.on||'floor'}];
/* Рычаг «бабочки»: от оси вниз и наружу к рукояти в руке */
BIND.pecArm=(e,R)=>{
 const s=e.hand,pivot=toCat(e.pivot),grip=R['grip'+s],top=[pivot[0],pivot[1],pivot[2]];
 const hand=R.frames['hand'+s],hAxis=hand.z,handleHalf=9;
 const hTop=V.add(grip,hAxis,V.dot(hAxis,[0,-1,0])>0?handleHalf:-handleHalf),hBot=V.add(grip,hAxis,V.dot(hAxis,[0,-1,0])>0?-handleHalf:handleHalf);
 const elbow=[hTop[0],pivot[1],hTop[2]];
 const id=e.id||'pec'+s;
 return[
  {kind:'beam',a:top,b:elbow,w:5,h:5,up:[0,-1,0],tone:'frame',role:'linkage',id:id+':arm',mount:e.mountTo},
  {kind:'beam',a:elbow,b:hTop,r:2.2,tone:'frame',role:'linkage',id:id+':drop',mount:id+':arm'},
  {kind:'beam',a:hTop,b:hBot,r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':drop'}
 ];
};
/* Гриф на опоре (крюки, стойки): c — центр во внутренних координатах */
BIND.restingBarbell=e=>{const b=barbellPart(toCat(e.c),dirCat(V.unit(e.axis||[1,0,0])),e.plates||[],{id:e.id||'barRest'});b.mount=e.on||'floor';return[b];};
/* Лента/трос: ломаная от точки крепления к хвату */
BIND.band=(e,R)=>{
 const out=[];
 for(const s of e.hands||['L','R']){
  let from=e.fromSole?null:e.fromKey?R[e.fromKey+s]:toCat(e.from);
  let via=(e.via||[]).map(toCat);
  if(e.fromSole){const t=R.frames['toes'+s],g=s==='L'?1:-1,lat=V.scale(t.x,g);from=V.add(V.add(R['ball'+s],t.y,M.B.toeSole-(e.r||.7)),t.z,1.5);via=[V.add(V.add(R['ball'+s],lat,5.6),t.y,-1)];}
  const pts=[from,...via,R['grip'+s]];
  out.push({kind:'cable',pts,r:e.r||.7,tone:'band',role:'cable',id:(e.id||'band')+':'+s,mount:e.fromKey||e.fromSole?'body':'floor'});
  out.push({kind:'beam',a:V.add(R['grip'+s],R.frames['hand'+s].z,6.5),b:V.add(R['grip'+s],R.frames['hand'+s].z,-6.5),r:1.6,tone:'rubber',role:'grip',id:(e.id||'band')+':handle'+s,mount:(e.id||'band')+':'+s});
 }
 return out;
};
/* ---------- Обобщённые подвижные части ---------- */
/* Точка тела: ключ позы ('gripL'), смесь двух ключей или смещение в рамке сегмента (внутренние оси, см) */
function bodyPoint(R,b){
 if(typeof b==='string')return R[b];
 let p=b.mix?V.mix(R[b.mix[0]],R[b.mix[1]],b.mix[2]??.5):R[b.key];
 if(b.off){const f=R.frames[b.frame];p=V.add(V.add(V.add(p,f.x,b.off[0]),f.y,b.off[1]),f.z,b.off[2]);}
 return p;
}
const ortho=(u,a)=>{let w=V.sub(u,V.scale(a,V.dot(u,a)));if(V.len(w)<1e-6)w=V.sub([0,0,1],V.scale(a,a[2]));return V.unit(w);};
/* Рычаг: ось (pivot, axis) неподвижна, конец следует за точкой тела.
   end: roller — валик вдоль оси (голень, бедро), handle — рукоять вдоль оси кисти, pad — подушка, none.
   armAt — положение плеча рычага вдоль оси (например, сбоку от сиденья), иначе — напротив точки. */
BIND.lever=(e,R)=>{
 const P=toCat(e.pivot),A=V.unit(dirCat(e.axis)),T=bodyPoint(R,e.bind),id=e.id||'lever',out=[];
 const d=V.sub(T,P),along=V.dot(d,A),rad=V.sub(d,V.scale(A,along)),rl=V.len(rad),ru=rl>1e-6?V.scale(rad,1/rl):ortho([0,1,0],A);
 const reach=V.add(rad,ru,e.extend||0),armAt=e.armAt??along,a0=V.add(P,A,armAt),a1=V.add(a0,reach),w=e.armW||5;
 out.push({kind:'beam',a:a0,b:a1,w,h:w,up:A,tone:'frame',role:'linkage',id:id+':arm',mount:e.mountTo});
 const c=V.add(V.add(P,A,along+(e.endShift||0)),reach);
 if(e.end==='roller'){
  if(Math.abs(armAt-along)>2)out.push({kind:'beam',a:a1,b:c,r:1.6,tone:'chrome',role:'linkage',id:id+':bar',mount:id+':arm'});
  out.push({kind:'cyl',c,axis:A,r:e.endR||5.5,len:e.endLen||30,tone:'pad',role:'pad',id:id+':roller',mount:Math.abs(armAt-along)>2?id+':bar':id+':arm'});
 }else if(e.end==='pad'){
  const n=e.padNormal?V.unit(dirCat(e.padNormal)):V.scale(ru,-1),z=ortho(A,n),x=V.cross(n,z);
  if(Math.abs(armAt-along)>2)out.push({kind:'beam',a:a1,b:c,r:1.6,tone:'chrome',role:'linkage',id:id+':bar',mount:id+':arm'});
  out.push({kind:'obox',c:V.add(c,n,-(e.padT||6)/2),x,y:n,z,size:[e.padW||28,e.padT||6,e.padL||18],round:1.4,tone:'pad',role:'pad',id:id+':pad',mount:Math.abs(armAt-along)>2?id+':bar':id+':arm'});
 }else if(e.end==='handle'){
  const s=e.hand,hz=R.frames['hand'+s].z,g=R['grip'+s],h=e.endLen||12;
  out.push({kind:'beam',a:a1,b:V.add(g,hz,-h/2),r:2,tone:'frame',role:'linkage',id:id+':drop',mount:id+':arm'});
  out.push({kind:'beam',a:V.add(g,hz,-h/2),b:V.add(g,hz,h/2),r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':drop'});
 }
 return out;
};
/* Каретка на прямой направляющей: положение — проекция точки тела на линию rail.
   parts — детали в рамке каретки: z вдоль направляющей (от rail[0] к rail[1]), y — нормаль up, x = y×z. */
BIND.sled=(e,R)=>{
 const A=toCat(e.rail[0]),Bp=toCat(e.rail[1]),z=V.unit(V.sub(Bp,A)),T=bodyPoint(R,e.bind),id=e.id||'sled';
 const s=Math.max(0,Math.min(V.dist(A,Bp),V.dot(V.sub(T,A),z)+(e.shift||0))),O=V.add(A,z,s);
 /* в координатах каталога (Y отражён) векторное произведение меняет знак: x = −(y×z) даёт правую тройку мира */
 const y=ortho(V.unit(dirCat(e.up||[0,1,0])),z),x=V.scale(V.cross(y,z),-1),L=p=>V.add(V.add(V.add(O,x,p[0]),y,p[1]),z,p[2]);
 return(e.parts||[]).map((p,i)=>{
  const q={...p,id:id+':'+(p.name||i),mount:p.mount?id+':'+p.mount:e.mountTo,tone:p.tone||'frame',role:p.role||'frame'};
  if(p.kind==='obox'){q.c=L(p.c);q.x=x;q.y=y;q.z=z;}
  else if(p.kind==='beam'){q.a=L(p.a);q.b=L(p.b);if(!p.r)q.up=y;}
  else if(p.kind==='cyl'){q.c=L(p.c);const ax=p.axis||[1,0,0];q.axis=V.unit(V.add(V.add(V.scale(x,ax[0]),y,ax[1]),z,ax[2]));}
  delete q.name;return q;
 });
};
/* Трос от блока к рукояти. attach: D (рукоять на кисть), rope (канат, две ветви), bar (прямая рукоять),
   V (V-образная рукоять), ankle (манжета на голеностоп). Колесо блока поворачивается к тросу. */
BIND.cable=(e,R)=>{
 const id=e.id||'cable',pulley=toCat(e.from),hands=e.hands||['L','R'],out=[],wr=e.wheelR||4.5;
 let clip,grips=hands.map(s=>R['grip'+s]);
 const towards=(p,k)=>V.add(p,V.unit(V.sub(pulley,p)),k);
 if(e.attach==='ankle'){const s=e.foot||'L',f=R.frames['sk'+s],an=V.add(R['an'+s],f.y,6);clip=towards(an,7);
  out.push({kind:'cyl',c:an,axis:V.scale(f.y,-1),r:5.2,len:5,tone:'rubber',role:'strap',id:id+':strap',mount:'body'});}
 else if(e.attach==='rope'){
  const mid=V.mix(grips[0],grips[1]??grips[0],.5);clip=towards(mid,e.clip??13);
  hands.forEach((s,i)=>{const g=grips[i],dir=V.unit(V.sub(g,clip));out.push({kind:'cable',pts:[clip,V.add(g,dir,4)],r:1.3,tone:'rope',role:'grip',id:id+':rope'+s,mount:id+':line'});out.push({kind:'sphere',c:V.add(g,dir,5.5),r:2.1,tone:'rubber',role:'frame',id:id+':knob'+s,mount:id+':rope'+s});});
 }else if(e.attach==='bar'){
  const a=grips[0],b=grips[1],ax=V.unit(V.sub(a,b)),ext=e.ext??8,mid=V.mix(a,b,.5);clip=towards(mid,3);
  out.push({kind:'beam',a:V.add(a,ax,ext),b:V.add(b,ax,-ext),r:1.4,tone:'chrome',role:'grip',id:id+':bar',mount:id+':line'});
  if(e.bend){for(const[p,sg]of [[a,1],[b,-1]]){const tip=V.add(V.add(p,ax,sg*ext),V.unit(V.sub(clip,mid)),-e.bend);out.push({kind:'beam',a:V.add(p,ax,sg*ext),b:tip,r:1.4,tone:'chrome',role:'grip',id:id+':bend'+(sg>0?'L':'R'),mount:id+':bar'});}}
 }else if(e.attach==='V'){
  const a=grips[0],b=grips[1]??grips[0],mid=V.mix(a,b,.5);clip=towards(mid,e.clip??11);
  hands.forEach((s,i)=>{const g=grips[i],hz=R.frames['hand'+s].z;out.push({kind:'beam',a:V.add(g,hz,-5.5),b:V.add(g,hz,5.5),r:1.5,tone:'rubber',role:'grip',id:id+':grip'+s,mount:id+':v'+s});
   const far=V.dot(V.sub(V.add(g,hz,5.5),clip),V.sub(V.add(g,hz,5.5),clip))>V.dot(V.sub(V.add(g,hz,-5.5),clip),V.sub(V.add(g,hz,-5.5),clip))?V.add(g,hz,5.5):V.add(g,hz,-5.5);
   out.push({kind:'beam',a:far,b:clip,r:1.3,tone:'chrome',role:'frame',id:id+':v'+s,mount:id+':line'});});
 }else{ /* D-рукоять на каждую кисть (в кроссовере у каждой руки свой трос) */
  const s=hands[0],g=grips[0],hz=R.frames['hand'+s].z,a=V.add(g,hz,-6),b=V.add(g,hz,6);clip=towards(g,e.clip??9);
  out.push({kind:'beam',a,b,r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':d'});
  out.push({kind:'cable',pts:[a,clip,b],r:.8,tone:'chrome',role:'frame',id:id+':d',mount:id+':line'});
 }
 const dir=V.unit(V.sub(clip,pulley)),colUp=[0,-1,0];let ax=V.cross(dir,colUp);if(V.len(ax)<1e-3)ax=[1,0,0];ax=V.unit(ax);
 const tangent=V.add(pulley,dir,wr*.2);
 out.unshift({kind:'cable',pts:[tangent,clip],r:.35,tone:'cable',role:'cable',id:id+':line',mount:e.mountTo||'floor'});
 out.unshift({kind:'cyl',c:pulley,axis:ax,r:wr,len:2.4,tone:'chrome',role:'frame',id:id+':wheel',mount:e.mountTo||'floor'});
 return out;
};
/* Гиря: рукоять на хвате (одна или две руки), шар висит по гравитации или по линии рук */
BIND.kettlebell=(e,R)=>{
 const hands=e.hands||['L'],grips=hands.map(s=>R['grip'+s]),g=V.mix(grips[0],grips[1]??grips[0],.5);
 const axis=hands.length>1?V.unit(V.sub(grips[0],grips[1])):V.unit(R.frames['hand'+hands[0]].z);
 let down=[0,1,0];if(e.hang==='arm'){const s=hands[0];down=V.unit(V.sub(R['wr'+s],R['el'+s]));}
 down=ortho(down,axis);
 const r=e.r||10.5,c=V.add(g,down,(e.drop||15)+(hands.length>1?2:0));
 return[{kind:'kettlebell',c,grip:g,axis,handleAxis:axis,radius:r,role:'free',tone:'plate',free:true,id:e.id||'kb',mount:'hands'}];
};
/* Ролик для пресса: ось проходит через хваты */
BIND.abWheel=(e,R)=>{
 const a=R.gripL,b=R.gripR,ax=V.unit(V.sub(a,b)),c=V.mix(a,b,.5),id=e.id||'wheel';
 return[{kind:'cyl',c,axis:ax,r:e.r||9,len:5,tone:'rubber',role:'free',free:true,id:id+':wheel',mount:'hands'},
  {kind:'beam',a:V.add(a,ax,6),b:V.add(b,ax,-6),r:1.6,tone:'rubber',role:'grip',id:id+':axle',mount:id+':wheel'}];
};
/* Шатуны велотренажёра: педали под подушечками стоп */
BIND.crank=(e,R)=>{
 const axle=toCat(e.axle),A=V.unit(dirCat(e.axis||[1,0,0])),id=e.id||'crank',out=[];
 for(const s of ['L','R']){
  const t=R.frames['toes'+s],ped=V.add(R['ball'+s],t.y,M.B.toeSole-1.4),off=V.dot(V.sub(ped,axle),A),hub=V.add(axle,A,off*.75);
  out.push({kind:'beam',a:hub,b:V.add(ped,A,-Math.sign(off||1)*3),w:3.2,h:1.6,up:A,tone:'chrome',role:'linkage',id:id+':arm'+s,mount:e.mountTo});
  out.push({kind:'obox',c:ped,x:t.x,y:t.y,z:t.z,size:[10,2.2,9],round:.5,tone:'rubber',role:'pedal',id:id+':pedal'+s,mount:id+':arm'+s});
 }
 return out;
};
/* Подножки/педали эллипса и степпера: платформа под стопой и тяга к оси */
BIND.footPedals=(e,R)=>{
 const id=e.id||'pedals',out=[];
 for(const s of ['L','R']){
  const f=R.frames['foot'+s],t=R.frames['toes'+s],mid=V.mix(R['heel'+s],R['ball'+s],.5),c=V.add(mid,f.y,-(M.B.ankle-1.2)-1.2),under=V.add(c,f.y,-1.4);
  out.push({kind:'obox',c,x:f.x,y:f.y,z:f.z,size:[13,2.4,34],round:.6,tone:'rubber',role:'pedal',id:id+':pedal'+s,mount:id+':arm'+s});
  const pv=toCat(e.pivots[s]);out.push({kind:'beam',a:pv,b:under,w:4,h:3,up:[0,-1,0],tone:'frame',role:'linkage',id:id+':arm'+s,mount:e.mountTo});
 }
 return out;
};
/* Сиденье, скользящее по монорельсу (гребной тренажёр) */
BIND.slideSeat=(e,R)=>{
 const top=e.top||36,z=R.hip[2]+(e.shift||0),c=toCat([0,top-2.5,0]);c[2]=z;c[0]=R.hip[0];
 return[{kind:'obox',c,x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[28,5,32],round:1.4,tone:'pad',role:'support',id:(e.id||'seat')+':pad',mount:e.mountTo},
  {kind:'obox',c:V.add(c,[0,4.5,0]),x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[14,4,18],round:.6,tone:'frame',role:'carriage',id:(e.id||'seat')+':car',mount:e.mountTo}];
};
/* Полотенце/лента от неподвижной точки (дверная ручка) или из-под стопы к кистям */
BIND.towel=(e,R)=>{
 const out=[],id=e.id||'towel',hands=e.hands||['L','R'];
 let from;
 if(e.underFoot){const s=e.underFoot,t=R.frames['toes'+s],f=R.frames['foot'+s];from=V.add(V.mix(R['ball'+s],R['heel'+s],.3),f.y,-(M.B.ankle-.6)+0);}
 else from=toCat(e.from);
 for(const s of hands){const g=R['grip'+s],hz=R.frames['hand'+s].z;out.push({kind:'cable',pts:[from,V.add(g,hz,s==='L'?-2:2)],r:e.r||1.6,tone:'towel',role:'grip',id:id+':'+s,mount:e.underFoot?'body':(e.mountTo||'floor')});}
 return out;
};
/* ---------- Варианты снаряжения ----------
   optional: 'kb' — деталь видна, если у пользователя есть этот инвентарь; optionalNot: 'kb' — видна, если его нет.
   Так один и тот же хват показывает гирю или гантель в зависимости от выбранного инвентаря. */
function visible(p,has){if(!has)return!p.optionalNot;return(!p.optional||has(p.optional))&&(!p.optionalNot||!has(p.optionalNot));}
/* ---------- Сборка сцены упражнения ---------- */
function staticParts(list){
 const parts=[],anchors={};
 for(const e of list){if(!TYPES[e.type])continue;const b=Builder(e);TYPES[e.type](e,b);parts.push(...b.parts);anchors[e.id||e.type]=b.anchors;}
 return{parts,anchors};
}
const STATIC_CACHE=new Map();
function build(list,R){
 const key=JSON.stringify(list.filter(e=>TYPES[e.type]));
 let st=STATIC_CACHE.get(key);if(!st){st=staticParts(list);STATIC_CACHE.set(key,st);if(STATIC_CACHE.size>64)STATIC_CACHE.delete(STATIC_CACHE.keys().next().value);}
 const out=st.parts.map(p=>({...p}));
 for(const e of list)if(BIND[e.type])for(const p of BIND[e.type](e,R)){p.dyn=true;if(e.optional)p.optional=e.optional;if(e.optionalNot)p.optionalNot=e.optionalNot;out.push(p);}
 for(const p of out){const src=list.find(e=>p.id&&p.id.startsWith((e.id||e.type)+':'));if(p.optional==null&&src?.optional)p.optional=src.optional;if(p.optionalNot==null&&src?.optionalNot)p.optionalNot=src.optionalNot;}
 return out;
}
function anchors(list){return staticParts(list).anchors;}
/* ---------- Риг упражнения: ключи позы → поза каталога + инвентарь ---------- */
function rig(entry){
 const track=M.makeTrack(entry.keys,{loop:!!entry.loop});
 return t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const k=track(t),q=M.unpack(k.v,k.hands);if(entry.gripRadius)q.gripRadius=entry.gripRadius;
  const R=M.catalogPose(q);R.props=build(entry.equipment||[],R);R.contacts=(entry.contacts||[]).map(c=>({...c}));R.exerciseBasis='mannequin';
  return R;
 };
}
return{TYPES,BIND,Builder,build,anchors,rig,PLATES,padFrame,barbellPart,dumbbellPart,bodyPoint,ortho,visible};
})(typeof Mannequin!=='undefined'?Mannequin:require('./09bm-mannequin.js'));
if(typeof module!=='undefined'&&module.exports){module.exports=GymEquipment;const fs=require('fs'),path=require('path');for(const f of fs.readdirSync(__dirname).filter(f=>/^09bo.*\.js$/.test(f)).sort()){try{require(path.join(__dirname,f));}catch(e){console.error('Equipment '+f+': '+e.message);}}}

/* Инвентарь группы G1 (штанга, стойки, скамьи): станции для жима на наклонной скамье и скамье с обратным
   наклоном, скамья Скотта, «мина» (Т-гриф на шарнире) с V-рукоятью, подушка на гриф для ягодичного моста.
   Размеры — по типовым коммерческим образцам (см): подушки толщиной 6–7, профиль рамы 5–8,
   стойки 7,5×5, J-крюки как в силовой раме; гриф 220 см / шейка 131 / Ø2,8, втулки Ø5. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, D2R } = M, { TYPES, BIND } = E;

  /* Стойка с J-крюком: вертикальная труба 5×7,5 от опоры до крюка, крюк смотрит к -Z (к атлету) */
  function upright(b, k, x, z, base, top, hook, mount) {
    b.tube('up' + k, [x, base, z], [x, top, z], [5, 7.5], { mount });
    b.box('hook' + k, [x, hook - 2, z - 6.2], [4.5, 4, 5], { mount: 'up' + k, tone: 'chrome', round: .6 });
    b.box('hookLip' + k, [x, hook + 1.5, z - 8.3], [4.5, 5, 1.2], { mount: 'hook' + k, tone: 'chrome', round: .4 });
  }

  /* Станция для жима на наклонной скамье (олимпийская наклонная скамья).
     Локально: сиденье спереди (-Z), спинка поднимается к +Z под углом back°, атлет сидит лицом к -Z.
     seatH — высота сиденья у шарнира, back — угол спинки, seat — подъём передней кромки сиденья,
     hook — высота крюков, upZ — положение стоек по Z (за верхним краем спинки), halfWidth — полуширина стоек. */
  TYPES.g1InclineRack = (s, b) => {
    const H = s.seatH || 47, a = (s.back ?? 38) * D2R, sa = (s.seat ?? 12) * D2R, T = 6, W = s.width || 30, bl = s.backLen || 82, sl = s.seatLen || 34;
    const hz = s.hingeZ ?? 0, hinge = [0, H - T, hz], X = s.halfWidth || 56, upZ = s.upZ ?? 62, hookH = s.hook || 130;
    /* подушки и пластины под ними */
    const bz = [0, Math.sin(a), Math.cos(a)], by = [0, Math.cos(a), -Math.sin(a)], sz = [0, Math.sin(sa), -Math.cos(sa)], sy = [0, Math.cos(sa), Math.sin(sa)];
    const backC = V.add(V.add(hinge, bz, bl / 2 + 1.5), by, T / 2), seatC = V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, T / 2);
    b.box('back', backC, [W, T, bl], { axes: [[1, 0, 0], by, bz], role: 'support', tone: 'pad', mount: 'backPlate', round: 1.6, contact: 'top' });
    b.box('backPlate', V.add(V.add(hinge, bz, bl / 2 + 1.5), by, -1), [W - 6, 2, bl - 6], { axes: [[1, 0, 0], by, bz], mount: 'spine' });
    b.box('seat', seatC, [W + 2, T, sl], { axes: [[1, 0, 0], sy, V.scale(sz, -1)], role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.6, contact: 'top' });
    b.box('seatPlate', V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, -1), [W - 6, 2, sl - 4], { axes: [[1, 0, 0], sy, V.scale(sz, -1)], mount: 'seatPost' });
    /* рама: продольная балка по полу, стойка сиденья, наклонный хребет под спинкой, подкос */
    b.tube('rail', [0, 3.75, -50], [0, 3.75, upZ + 4], [8, 7.5], { mount: 'floor' });
    b.tube('footF', [-30, 3.75, -50], [30, 3.75, -50], [7.5, 7.5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('capF' + (sx < 0 ? 'R' : 'L'), [sx * 30.5, 3.75, -50], [2, 7, 7], { mount: 'footF', tone: 'rubber', round: .5 });
    const plateC = V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, -1), postZ = plateC[2];
    b.tube('seatPost', [0, 7.5, postZ], [0, plateC[1] - 1.2, postZ], [7, 7], { mount: 'rail' });
    const spineA = V.add(hinge, by, -3.5), spineB = V.add(V.add(hinge, bz, bl - 8), by, -3.5);
    b.tube('spine', spineA, spineB, [6, 6], { mount: 'hingeBlock', up: by });
    b.box('hingeBlock', [0, H - T - 3.5, (postZ + hz + 6) / 2], [10, 7, hz + 6 - postZ + 7], { mount: 'seatPost' });
    const strutTop = V.add(V.add(hinge, bz, bl * .62), by, -5.5);
    b.tube('strut', [0, 7.5, strutTop[2] + 4], strutTop, [6, 6], { mount: 'rail' });
    /* стойки с J-крюками за спинкой, основание — поперечина на полу */
    b.tube('baseB', [-X - 4, 3.75, upZ], [X + 4, 3.75, upZ], [7.5, 7.5], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * X;
      upright(b, k, x, upZ, 7.5, hookH + 16, hookH, 'baseB');
      b.tube('foot' + k, [x, 3.75, upZ - 26], [x, 3.75, upZ + 22], [7.5, 6], { mount: 'baseB' });
    }
    /* поперечина между стойками и тяга к подкосу спинки */
    const yb = Math.min(H + 4, hookH - 30), sTop = V.add(V.add(hinge, bz, bl * .62), by, -5.5);
    b.tube('braceX', [-X, yb, upZ], [X, yb, upZ], [5, 5], { mount: 'upL' });
    const zLink = Math.min(sTop[2] + 1, upZ - 3);
    b.tube('link', [0, yb, upZ], [0, yb, zLink], [5, 5], { mount: 'braceX' });
    b.tube('linkPost', [0, 7.5, zLink], [0, yb, zLink], [5, 5], { mount: 'rail' });
    b.anchor('hinge', hinge);
    b.frameAnchor('backPad', V.add(hinge, by, T), [[1, 0, 0], by, bz]);
    b.frameAnchor('seatPad', V.add(hinge, sy, T), [[1, 0, 0], sy, V.scale(sz, -1)]);
    b.anchor('hook', [0, hookH, upZ - 6.2]);
  };

  /* Станция для жима на скамье с обратным наклоном.
     Локально: голова к +Z (нижний конец), таз у -Z (верхний конец); подушка опускается к голове под углом decline°.
     hipH — высота верха подушки у тазового конца; валик под коленями (knee) и валики перед голенями (ankle) —
     на стойке ног спереди; стойки с крюками у головного конца. */
  TYPES.g1DeclineRack = (s, b) => {
    const a = (s.decline ?? 16) * D2R, T = 6, W = s.width || 29, L = s.padLen || 96, z0 = s.padZ0 ?? -18, hipH = s.hipH || 62;
    const dir = [0, -Math.sin(a), Math.cos(a)], nrm = [0, Math.cos(a), Math.sin(a)], top0 = [0, hipH, z0];
    const padC = V.add(V.add(top0, dir, L / 2), nrm, -T / 2);
    b.box('pad', padC, [W, T, L], { axes: [[1, 0, 0], nrm, dir], role: 'support', tone: 'pad', mount: 'padPlate', round: 1.6, contact: 'top' });
    b.box('padPlate', V.add(V.add(top0, dir, L / 2), nrm, -T - 1), [W - 6, 2, L - 6], { axes: [[1, 0, 0], nrm, dir], mount: 'spine' });
    /* наклонная балка под подушкой и две опоры */
    const sp0 = V.add(V.add(top0, dir, 6), nrm, -T - 2 - 3.5), sp1 = V.add(V.add(top0, dir, L - 10), nrm, -T - 2 - 3.5);
    b.tube('spine', sp0, sp1, [7, 7], { mount: 'legHi', up: nrm });
    b.tube('legHi', [0, 7.5, sp0[2] + 2], V.add(sp0, nrm, -2), [7, 7], { mount: 'rail' });
    b.tube('legLo', [0, 7.5, sp1[2] - 2], V.add(sp1, nrm, -2), [7, 7], { mount: 'rail' });
    const kz = s.kneeZ ?? -60, ky = s.kneeY ?? 70, az = s.ankleZ ?? -72, ay = s.ankleY ?? 30, upZ = s.upZ ?? 70, X = s.halfWidth || 56, hookH = s.hook || 108;
    b.tube('rail', [0, 3.75, Math.min(kz, az) - 12], [0, 3.75, Math.max(upZ, sp1[2] + 2) + 4], [8, 7.5], { mount: 'floor' });
    b.tube('footF', [-30, 3.75, Math.min(kz, az) - 12], [30, 3.75, Math.min(kz, az) - 12], [7.5, 7.5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('capF' + (sx < 0 ? 'R' : 'L'), [sx * 30.5, 3.75, Math.min(kz, az) - 12], [2, 7, 7], { mount: 'footF', tone: 'rubber', round: .5 });
    /* стойка ног: от рамы к валику под коленями; ниже и впереди — валики перед голенями */
    const legBase = [0, 7.5, Math.min(kz, az) - 6];
    b.tube('legPost', legBase, [0, ky - 2, kz], [6, 6], { mount: 'rail' });
    b.cyl('kneeAxle', [0, ky, kz], [1, 0, 0], 1.5, 38, { mount: 'legPost', tone: 'chrome' });
    /* валики называются по знаку X (лёжа на спине левая нога атлета — на −X) */
    for (const sx of [-1, 1]) b.cyl('knee' + (sx > 0 ? 'Xp' : 'Xn'), [sx * 10, ky, kz], [1, 0, 0], s.kneeR || 5.5, 16, { mount: 'kneeAxle', role: 'support', tone: 'pad' });
    const ankleArmTop = V.mix(legBase, [0, ky - 2, kz], (ay - legBase[1]) / (ky - 2 - legBase[1]));
    b.tube('ankleArm', ankleArmTop, [0, ay, az], [5, 5], { mount: 'legPost' });
    b.cyl('ankleAxle', [0, ay, az], [1, 0, 0], 1.5, 36, { mount: 'ankleArm', tone: 'chrome' });
    for (const sx of [-1, 1]) b.cyl('ankle' + (sx > 0 ? 'Xp' : 'Xn'), [sx * 10, ay, az], [1, 0, 0], s.ankleR || 5, 15, { mount: 'ankleAxle', role: 'support', tone: 'pad' });
    /* стойки с крюками у головного конца */
    b.tube('baseB', [-X - 4, 3.75, upZ], [X + 4, 3.75, upZ], [7.5, 7.5], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * X;
      upright(b, k, x, upZ, 7.5, hookH + 16, hookH, 'baseB');
      b.tube('foot' + k, [x, 3.75, upZ - 26], [x, 3.75, upZ + 22], [7.5, 6], { mount: 'baseB' });
    }
    b.frameAnchor('pad', top0, [[1, 0, 0], nrm, dir]);
    b.anchor('knee', [0, ky, kz]); b.anchor('ankle', [0, ay, az]); b.anchor('hook', [0, hookH, upZ - 6.2]);
  };

  /* Скамья Скотта: сиденье на стойке и наклонный упор для плеч.
     Локально: атлет сидит лицом к +Z; верхняя кромка упора — на высоте padTop в точке padZ, упор опускается вперёд
     под углом slope° к горизонту. Длина упора вдоль наклона padLen, ширина padW. */
  TYPES.g1Preacher = (s, b) => {
    const seatH = s.seatH || 60, padTop = s.padTop || 108, pz = s.padZ ?? 20, sl = (s.slope ?? 45) * D2R, PL = s.padLen || 36, PW = s.padW || 62, T = 7;
    const down = [0, -Math.sin(sl), Math.cos(sl)], nrm = [0, Math.cos(sl), Math.sin(sl)], edge = [0, padTop, pz];
    const padC = V.add(V.add(edge, down, PL / 2), nrm, -T / 2);
    b.box('pad', padC, [PW, T, PL], { axes: [[1, 0, 0], nrm, down], role: 'support', tone: 'pad', mount: 'padPlate', round: 2.2, contact: 'top' });
    /* валик верхней кромки (под подмышками) */
    b.cyl('roll', V.add(edge, nrm, -3.2), [1, 0, 0], 3.4, PW - 4, { mount: 'padPlate', role: 'support', tone: 'pad' });
    b.box('padPlate', V.add(V.add(edge, down, PL / 2), nrm, -T - 1), [PW - 8, 2, PL - 4], { axes: [[1, 0, 0], nrm, down], mount: 'padArm' });
    /* опорная колонна позади упора (со стороны от атлета) */
    const under = V.add(V.add(edge, down, PL * .55), nrm, -T - 2), colZ = under[2] + 10;
    b.tube('padArm', V.add(under, nrm, -1.5), [0, under[1] - 12, colZ], [6, 6], { mount: 'column' });
    b.tube('column', [0, 7.5, colZ], [0, under[1] - 9, colZ], [8, 8], { mount: 'base' });
    b.tube('base', [0, 3.75, -32], [0, 3.75, colZ + 28], [8, 7.5], { mount: 'floor' });
    b.tube('baseF', [-34, 3.75, colZ + 22], [34, 3.75, colZ + 22], [7.5, 7.5], { mount: 'base' });
    b.tube('baseB', [-30, 3.75, -28], [30, 3.75, -28], [7.5, 7.5], { mount: 'base' });
    for (const [k, z, x] of [['F', colZ + 22, 34], ['B', -28, 30]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + .5), 3.75, z], [2, 7, 7], { mount: 'base' + k, tone: 'rubber', round: .5 });
    /* сиденье */
    const sz = s.seatZ ?? -6;
    b.box('seat', [0, seatH - 3, sz], [34, 6, 28], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.box('seatPlate', [0, seatH - 7, sz], [26, 2, 22], { mount: 'seatPost' });
    b.tube('seatPost', [0, 7.5, sz], [0, seatH - 8, sz], [6, 6], { mount: 'base' });
    b.frameAnchor('pad', edge, [[1, 0, 0], nrm, down]);
    b.anchor('seatTop', [0, seatH, 0]);
  };

  /* «Мина»: опорная плита на полу и шарнир со стаканом для конца грифа (стакан вращается вместе с грифом) */
  TYPES.g1Landmine = (s, b) => {
    b.box('plate', [0, 1, 0], [42, 2, 42], { mount: 'floor', round: .5 });
    /* две щеки вилки и ось между ними; стакан грифа вращается на оси между щеками */
    for (const sx of [-1, 1]) b.box('yoke' + (sx > 0 ? 'L' : 'R'), [sx * 5.6, 6.5, 0], [2, 11, 10], { mount: 'plate', round: .5 });
    b.cyl('pin', [0, 8, 0], [1, 0, 0], 1.4, 15, { mount: 'yokeL', tone: 'chrome' });
    b.anchor('pivot', [0, 8, 0]);
  };

  /* Т-гриф на «мине»: гриф от шарнира (pivot) через крюк V-рукояти над кистями; блины на дальней втулке.
     hookAt — расстояние от шарнира до крюка рукояти вдоль грифа; V-рукоять — две параллельные ручки вдоль грифа
     (нейтральный хват) на 9 см ниже грифа. */
  BIND.g1LandmineBar = (e, R) => {
    const id = e.id || 'tbar', P = M.toCat(e.pivot), up = [0, -1, 0];
    const H = V.mix(R.gripL, R.gripR, .5), drop = e.drop ?? 9, T = V.add(H, up, drop), d = V.unit(V.sub(T, P)), at = k => V.add(P, d, k);
    const out = [];
    const mount = e.mountTo || 'floor';
    out.push({ kind: 'beam', a: at(-4), b: at(26), r: 3.4, tone: 'frame', role: 'linkage', id: id + ':sleeve', mount });
    out.push({ kind: 'beam', a: at(26), b: at(40), r: 2.5, tone: 'chrome', role: 'linkage', id: id + ':sleeveN', mount: id + ':sleeve' });
    out.push({ kind: 'cyl', c: at(41), axis: d, r: 2.4, len: 2, tone: 'chrome', role: 'linkage', id: id + ':collarN', mount: id + ':sleeveN' });
    const shaftEnd = 41 + 131;
    out.push({ kind: 'beam', a: at(41), b: at(shaftEnd), r: 1.4, tone: 'chrome', role: 'linkage', id: id + ':shaft', mount: id + ':sleeveN' });
    out.push({ kind: 'cyl', c: at(shaftEnd + 1), axis: d, r: 2.4, len: 2, tone: 'chrome', role: 'linkage', id: id + ':collarF', mount: id + ':shaft' });
    out.push({ kind: 'beam', a: at(shaftEnd + 2), b: at(216), r: 2.5, tone: 'chrome', role: 'linkage', id: id + ':sleeveF', mount: id + ':collarF' });
    let k = shaftEnd + 2.6;
    (e.plates || [[16.5, 3.2], [16.5, 3.2]]).forEach((p, i) => { out.push({ kind: 'cyl', c: at(k + p[1] / 2), axis: d, r: p[0], len: p[1], sides: 32, tone: 'plate', role: 'linkage', id: id + ':plate' + i, mount: id + ':sleeveF' }); k += p[1] + .3; });
    out.push({ kind: 'cyl', c: at(k + 1.5), axis: d, r: 3.4, len: 3, tone: 'rubber', role: 'linkage', id: id + ':clamp', mount: id + ':sleeveF' });
    /* V-рукоять: крюк охватывает гриф, от него две щеки вниз к ручкам */
    out.push({ kind: 'obox', c: V.add(T, up, -.4), x: V.unit(V.cross(d, up)), y: V.scale(up, -1), z: d, size: [5, 4.4, 7], round: .8, tone: 'frame', role: 'linkage', id: id + ':hook', mount: id + ':shaft' });
    for (const s of ['L', 'R']) {
      const g = R['grip' + s], hz = R.frames['hand' + s].z, ax = V.dot(hz, d) >= 0 ? hz : V.scale(hz, -1);
      const a0 = V.add(g, ax, -6.5), a1 = V.add(g, ax, 6.5);
      out.push({ kind: 'beam', a: a0, b: a1, r: 1.6, tone: 'rubber', role: 'grip', id: id + ':grip' + s, mount: id + ':cheek' + s });
      out.push({ kind: 'beam', a: V.add(a1, ax, .5), b: V.add(T, d, 3), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':cheek' + s, mount: id + ':hook' });
      out.push({ kind: 'beam', a: V.add(a0, ax, -.5), b: V.add(T, d, -3), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':cheekB' + s, mount: id + ':hook' });
    }
    return out;
  };

  /* Подушка на гриф для ягодичного моста: поролоновый цилиндр Ø10 × 40 по центру грифа */
  BIND.g1BarPad = (e, R) => {
    const L = R.gripL, Rr = R.gripR, axis = V.unit(V.sub(L, Rr)), c = V.mix(L, Rr, .5);
    return [{ kind: 'cyl', c, axis, r: e.r || 5, len: e.len || 40, sides: 20, tone: 'pad', role: 'pad', id: (e.id || 'barPad') + ':foam', mount: e.mountTo || 'bar' }];
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Инвентарь группы G2 (гантели и гири).
   g2Step — степ-платформа для подъёмов на носки: 90x35 см, высота 15 см, резиновое покрытие, две опоры.
   g2CupDumbbell — гантель, которую держат двумя ладонями под верхним диском (гоблет, разгибание из-за головы,
   пуловер): ось гантели — по нормали ладоней, внутренняя грань верхнего диска лежит на ладонях.
   g2KbHorns — гиря двумя руками «за рога» (гоблет): хваты на дужках рукояти, шар под рукоятью.
   g2FistDumbbell — гантель вертикально у груди, верхний диск лежит на кулаках (гоблет, та же поза кистей, что и с гирей). */
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
    const pal = hs.map(s => { const f = R.frames['hand' + s], g = s === 'L' ? 1 : -1; return { p: V.add(V.add(f.o, f.x, -g * 1.8), f.y, -5.6), n: V.scale(f.x, -g) }; });
    let n = V.unit(pal.reduce((a, q) => V.add(a, q.n), [0, 0, 0]));
    if (e.axis === 'gravity') n = [0, -1, 0];
    const P0 = V.scale(pal.reduce((a, q) => V.add(a, q.p), [0, 0, 0]), 1 / pal.length);
    const lift = Math.max(...pal.map(q => V.dot(V.sub(q.p, P0), n)));
    const H = e.handle || 13.5, hr = e.headR || 7.5, hl = e.headLen || 7;
    const face = V.add(P0, n, lift + (e.gap ?? .15)), c = V.add(face, n, -(H / 2 + 1.2));
    const at = k => V.add(c, n, k);
    return [
      { kind: 'cyl', c: at(H / 2 + 1.2 + hl / 2), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':top', mount: 'hands' },
      { kind: 'cyl', c: at(H / 2 + .6), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarT', mount: id + ':top' },
      { kind: 'beam', a: at(-(H / 2 + .6)), b: at(H / 2 + .6), r: 1.6, tone: 'chrome', role: 'grip', id: id + ':handle', mount: id + ':collarT' },
      { kind: 'cyl', c: at(-(H / 2 + .6)), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarB', mount: id + ':handle' },
      { kind: 'cyl', c: at(-(H / 2 + 1.2 + hl / 2)), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':bottom', mount: id + ':collarB' }
    ];
  };
  /* Гиря «за рога» двумя руками (гоблет): дужки рукояти — в кулаках. Ось «вверх» гири — средняя линия больших пальцев,
     центры хватов — на дужках (±8,65 см от оси, 10,5 см над центром шара при Ø21), шар ниже рукояти.
     Дужки — короткие участки рукояти (role grip): на них проверяется хват. */
  BIND.g2KbHorns = (e, R) => {
    const id = e.id || 'kb', k = (e.r || 10.5) / 10.5, gL = R.gripL, gR = R.gripR, ax = V.unit(V.sub(gL, gR)), mid = V.mix(gL, gR, .5);
    const th = V.add(R.frames.handL.z, R.frames.handR.z), up = V.unit(V.perp(V.len(V.perp(th, ax)) > .2 ? th : [0, -1, 0], ax));
    const c = V.add(mid, up, -10.5 * k), L = (a, u) => V.add(V.add(c, ax, a * k), up, u * k);
    const horn = sg => ({ kind: 'beam', a: L(sg * 8.1, 6.9), b: L(sg * 9.1, 13.4), r: 1.7, tone: 'plate', role: 'grip', id: id + ':horn' + (sg > 0 ? 'L' : 'R'), mount: id });
    return [{ kind: 'kettlebell', c, grip: L(0, 15.6), axis: ax, handleAxis: ax, radius: 10.5 * k, role: 'free', tone: 'plate', free: true, id, mount: 'hands' }, horn(1), horn(-1)];
  };
  /* Гантель верхним диском на кулаках (гоблет): кулаки по бокам рукояти, ось — средняя линия больших пальцев,
     внутренняя грань верхнего диска лежит на указательных пальцах, рукоять и нижний диск — ниже кулаков. */
  BIND.g2FistDumbbell = (e, R) => {
    const id = e.id || 'gdb', gL = R.gripL, gR = R.gripR, mid = V.mix(gL, gR, .5);
    const n = V.unit(V.add(R.frames.handL.z, R.frames.handR.z)), H = e.handle || 13.5, hr = e.headR || 7.5, hl = e.headLen || 7;
    const face = V.add(mid, n, e.lift ?? 4.7), c = V.add(face, n, -(H / 2 + 1.2)), at = k => V.add(c, n, k);
    return [
      { kind: 'cyl', c: at(H / 2 + 1.2 + hl / 2), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':top', mount: 'hands' },
      { kind: 'cyl', c: at(H / 2 + .6), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'weight', id: id + ':collarT', mount: id + ':top' },
      { kind: 'beam', a: at(-(H / 2 + .6)), b: at(H / 2 + .6), r: 1.6, tone: 'chrome', role: 'weight', id: id + ':handle', mount: id + ':collarT' },
      { kind: 'cyl', c: at(-(H / 2 + .6)), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'weight', id: id + ':collarB', mount: id + ':handle' },
      { kind: 'cyl', c: at(-(H / 2 + 1.2 + hl / 2)), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':bottom', mount: id + ':collarB' }
    ];
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Тренажёры группы G3: блочные тренажёры и эспандеры.
   g3Tower      — блочная колонна: основание, стойки 7,5×7,5, стек грузов на направляющих, вертикальная
                  направляющая с кареткой блока (регулировка высоты), поворотный блок, ручки-упоры на стойках;
   g3Crossover  — кроссовер: две такие колонны лицом друг к другу, верхняя перемычка;
   g3LatPulldown — тяга верхнего блока: сиденье, валики-упоры для бёдер, колонна со стеком, вылет с блоком;
   g3SeatedRow  — тяга горизонтального блока: длинная скамья, наклонные упоры для стоп, нижний блок между ними;
   g3Door       — участок стены с дверью и креплением для эспандера (вверху или сбоку на нужной высоте).
   Подвижные части: BIND.g3cable — трос с поворотным кронштейном блока (вилка, ось вращения), сход троса
   по касательной к колесу и подъём выбранных плит стека на величину вытянутого троса.
   Размеры (см): стойки 7,5×7,5, высота колонн 218–222, колесо блока Ø9, плиты стека 32×14×2,4,
   сиденье тяги верхнего блока 46, скамья горизонтальной тяги 44, дверной проём 80×203. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, M3, toCat, dirCat } = M, { TYPES, BIND } = E;
  const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  /* Узел внутри снаряда: свой сдвиг и разворот, ключи деталей с префиксом; mount '/k' — деталь снаряда без префикса */
  function Sub(b, pre, o = [0, 0, 0], yaw = 0) {
    const R = M3.ry(yaw), P = p => V.add(o, M3.v(R, p)), D = d => M3.v(R, d);
    const mnt = m => m == null || m === 'floor' ? 'floor' : m[0] === '/' ? m.slice(1) : pre + m;
    const op = (opts = {}) => { const r = { ...opts, mount: mnt(opts.mount), axes: (opts.axes || I3).map(D) }; if (opts.up) r.up = D(opts.up); return r; };
    return {
      P, D, pre,
      tube: (k, a, c, size, opts) => b.tube(pre + k, P(a), P(c), size, op(opts)),
      box: (k, c, size, opts) => b.box(pre + k, P(c), size, op(opts)),
      cyl: (k, c, axis, r, len, opts) => b.cyl(pre + k, P(c), D(axis), r, len, op(opts)),
      ball: (k, c, r, opts) => b.ball(pre + k, P(c), r, op(opts)),
      anchor: (k, p) => b.anchor(pre + k, P(p)),
      frame: (k, c, axes = I3) => b.frameAnchor(pre + k, P(c), axes.map(D)),
      raw: (k, v) => { b.anchors[pre + k] = v; return v; }
    };
  }
  const PITCH = 2.6, PLATE = [32, 2.4, 14];
  /* Стек грузов между стойками (в осях узла: стек в плоскости z=0, перед ним — сторона пользователя +Z).
     Нижние плиты неподвижны, верхние (выбранные штырём) поднимаются вместе с верхней плитой — их строит BIND. */
  function stack(t, { x0 = 0, z0 = 0, H, n = 15, sel = 5, base = 'baseM', y0 = 7.5, topY }) {
    t.tube('rodL', [x0 + 10, y0, z0], [x0 + 10, H - 7.5, z0], 1.25, { mount: base, tone: 'chrome', role: 'guide' });
    t.tube('rodR', [x0 - 10, y0, z0], [x0 - 10, H - 7.5, z0], 1.25, { mount: base, tone: 'chrome', role: 'guide' });
    t.box('bump', [x0, y0 + 2, z0], [28, 4, 12], { mount: base, tone: 'rubber', round: .8 });
    const yb = y0 + 4;
    for (let i = 0; i < n - sel; i++) t.box('plate' + i, [x0, yb + i * PITCH + PLATE[1] / 2, z0], PLATE, { mount: 'rodL', tone: 'stack', round: .35 });
    const o = [x0, yb + (n - sel) * PITCH, z0];
    t.frame('stack', o);
    t.raw('stackInfo', { sel, pitch: PITCH, size: PLATE, topY: topY ?? H - 7.5, rod: t.pre + 'rodL', maxLift: (topY ?? H - 7.5) - o[1] - sel * PITCH - 16 });
  }
  /* Блочная колонна в осях узла: стойки и стек при z=0, направляющая каретки при z=11,5, колесо блока при z=25 */
  function tower(t, { H = 218, h = 100, grab = true, n = 15, sel = 5, lowRail = false }) {
    const X = 27, RZ = 11.5, hh = Math.max(20, Math.min(H - 20, h));
    t.tube('baseL', [X + 3, 3.75, -40], [X + 3, 3.75, 34], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseR', [-X - 3, 3.75, -40], [-X - 3, 3.75, 34], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseB', [-X - 3, 3.75, -36], [X + 3, 3.75, -36], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseM', [-X - 3, 3.75, 0], [X + 3, 3.75, 0], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseF', [-X - 3, 3.75, RZ], [X + 3, 3.75, RZ], [7.5, 7.5], { mount: 'floor' });
    for (const [k, x] of [['L', X + 3], ['R', -X - 3]]) for (const [kk, z] of [['F', 34.5], ['B', -40.5]]) t.box('cap' + k + kk, [x, 3.75, z], [8, 7.5, 1.2], { mount: 'base' + k, tone: 'rubber', round: .4 });
    t.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    t.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    t.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    /* подкосы стоек к заднему основанию */
    t.tube('braceL', [X, 7.5, -32], [X, 60, -3.75], [5, 5], { mount: 'baseL', up: [1, 0, 0] });
    t.tube('braceR', [-X, 7.5, -32], [-X, 60, -3.75], [5, 5], { mount: 'baseR', up: [1, 0, 0] });
    stack(t, { H, n, sel });
    /* направляющая каретки и каретка с фиксатором */
    t.tube('rail', [0, 7.5, RZ], [0, H - 7.5, RZ], [7.5, 7.5], { mount: 'baseF', up: [0, 0, 1] });
    t.tube('railTop', [0, H - 3.75, 0], [0, H - 3.75, RZ + 3.75], [7.5, 7.5], { mount: 'top' });
    for (let y = 30; y < H - 20; y += 15) t.box('mark' + y, [0, y, RZ + 3.8], [2.2, 1.2, .4], { mount: 'rail', tone: 'rubber', round: .2 });
    t.box('carriage', [0, hh, RZ], [11, 20, 11], { mount: 'rail', round: 1 });
    t.cyl('pinShaft', [7.5, hh + 5, RZ], [1, 0, 0], 1, 5, { mount: 'carriage', tone: 'chrome' });
    t.ball('pinKnob', [10.8, hh + 5, RZ], 1.8, { mount: 'pinShaft', tone: 'rubber' });
    t.cyl('swivel', [0, hh, RZ + 6.7], [0, 0, 1], 2.6, 2.4, { mount: 'carriage', tone: 'chrome' });
    t.anchor('pulley', [0, hh, 27]);
    t.anchor('swivelPt', [0, hh, RZ + 7.9]);
    /* ручки-упоры на передней грани стоек */
    if (grab) for (const [k, x] of [['L', X], ['R', -X]]) {
      for (const y of [92, 158]) t.tube('grabArm' + k + y, [x, y, 3.75], [x, y, 10], [3, 3], { mount: 'up' + k });
      t.tube('grab' + k, [x, 90, 10], [x, 160, 10], 1.6, { mount: 'grabArm' + k + '92', tone: 'rubber', role: 'grip' });
      t.anchor('grab' + k, [x, 125, 10]);
    }
    t.anchor('railFront', [0, 0, RZ + 3.75]);
    return { H, X, RZ };
  }
  /* Одиночная блочная колонна: лицевая сторона (каретка, блок) смотрит в +Z снаряда */
  TYPES.g3Tower = (s, b) => { tower(Sub(b, ''), s); };
  /* Кроссовер: колонны при x = ±span/2 лицом к центру, верхняя перемычка; hL/hR — высота блоков */
  TYPES.g3Crossover = (s, b) => {
    const span = s.span || 330, H = s.H || 222;
    tower(Sub(b, 'L', [span / 2, 0, 0], -90), { H, h: s.hL ?? s.h ?? 200, grab: false });
    tower(Sub(b, 'R', [-span / 2, 0, 0], 90), { H, h: s.hR ?? s.h ?? 200, grab: false });
    b.tube('bridge', [-span / 2 + 3.75, H - 5, 0], [span / 2 - 3.75, H - 5, 0], [7.5, 10], { mount: 'Ltop' });
    b.anchor('center', [0, 0, 0]);
  };
  /* Тяга верхнего блока. Начало координат — центр сиденья на полу; пользователь смотрит в +Z.
     seatH — верх сиденья; padH, padZ — ось валиков; colZ — плоскость стека; pulley — центр колеса верхнего блока [y, z]. */
  TYPES.g3LatPulldown = (s, b) => {
    const seatH = s.seatH || 46, padH = s.padH || 66, padZ = s.padZ ?? 26, colZ = s.colZ ?? 92, H = s.H || 220, py = s.pulleyY ?? (H - 10.1), pz = s.pulleyZ ?? 18, X = 26;
    b.tube('rail', [0, 3.75, -32], [0, 3.75, colZ + 34], [10, 7.5], { mount: 'floor' });
    b.tube('footB', [-30, 3.75, -28], [30, 3.75, -28], [7.5, 7.5], { mount: 'rail' });
    b.tube('footF', [-X - 4, 3.75, colZ], [X + 4, 3.75, colZ], [7.5, 7.5], { mount: 'rail' });
    b.tube('footF2', [-X - 4, 3.75, colZ + 30], [X + 4, 3.75, colZ + 30], [7.5, 7.5], { mount: 'rail' });
    for (const [k, x] of [['L', X + 4], ['R', -X - 4]]) b.tube('side' + k, [x, 3.75, colZ - 3.75], [x, 3.75, colZ + 33.75], [7.5, 7.5], { mount: 'footF' });
    /* сиденье */
    b.tube('seatPost', [0, 7.5, -4], [0, seatH - 8, -4], [7.5, 7.5], { mount: 'rail', up: [0, 0, 1] });
    b.box('seatPlate', [0, seatH - 7, -2], [30, 2, 30], { mount: 'seatPost' });
    b.box('seat', [0, seatH - 3, 0], [40, 6, 38], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.tube('seatBrace', [0, 7.5, -26], [0, seatH - 9, -6], [5, 5], { mount: 'rail', up: [1, 0, 0] });
    /* валики-упоры для бёдер: стойка перед коленями между голенями, кронштейн назад к оси валиков */
    const postZ = padZ + 22;
    b.tube('padPost', [0, 7.5, postZ], [0, padH + 3, postZ], [6, 6], { mount: 'rail', up: [0, 0, 1] });
    b.tube('padArm', [0, padH, postZ + 3], [0, padH, padZ], [5, 5], { mount: 'padPost' });
    b.cyl('padAxle', [0, padH, padZ], [1, 0, 0], 1.6, 46, { mount: 'padArm', tone: 'chrome' });
    for (const [k, x] of [['L', 13.5], ['R', -13.5]]) b.cyl('roller' + k, [x, padH, padZ], [1, 0, 0], 6.5, 19, { mount: 'padAxle', tone: 'pad', role: 'support' });
    b.box('padPin', [0, padH - 9, postZ + 3.5], [3, 2, 2], { mount: 'padPost', tone: 'rubber', round: .4 });
    /* колонна со стеком и вылетом */
    const t = Sub(b, '', [0, 0, colZ], 0);
    t.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 10], { mount: '/footF', up: [0, 0, 1] });
    t.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 10], { mount: '/footF', up: [0, 0, 1] });
    t.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    for (const [k, x] of [['L', X], ['R', -X]]) t.tube('brace' + k, [x, 7.5, 30], [x, 70, 5], [5, 5], { mount: '/footF2', up: [1, 0, 0] });
    const wr = 4.5, colWheel = [0, H - 10 - wr - .5, -wr];
    stack(t, { H, topY: colWheel[1], base: '/footF' });
    const boomY = H + 5;
    t.tube('boom', [0, boomY, 6], [0, boomY, pz - colZ - 6], [8, 10], { mount: 'top', up: [0, 1, 0] });
    t.box('boomCap', [0, boomY, pz - colZ - 6.6], [8.4, 10.4, 1.2], { mount: 'boom', tone: 'rubber', round: .4 });
    t.tube('boomGusset', [0, H - 4, -3], [0, boomY - 4.5, -26], [4, 4], { mount: 'top', up: [1, 0, 0] });
    /* поворотный кронштейн под концом вылета; колесо блока ставит BIND.g3cable */
    b.cyl('swivel', [0, boomY - 5 - 1.2, pz], [0, 1, 0], 2.6, 2.4, { mount: 'boom', tone: 'chrome' });
    b.anchor('pulley', [0, py, pz]);
    b.anchor('swivelPt', [0, boomY - 5 - 2.4, pz]);
    /* верхний трос вдоль вылета: от колеса блока к колесу на колонне */
    t.box('colWheelMount', [0, H - 7.5 - 1.25, -wr], [6, 2.5, 5], { mount: 'top', round: .4 });
    t.box('colWheelFork', [0, H - 10 - wr / 2 - .5, -wr], [5.2, wr + 2.5, 3], { mount: 'colWheelMount', round: .3 });
    t.cyl('colWheel', colWheel, [1, 0, 0], wr, 2.4, { mount: 'colWheelFork', tone: 'chrome' });
    b.anchor('boomCableA', [0, py + wr, pz]);
    b.anchor('boomCableB', V.add([0, 0, colZ], [0, colWheel[1] + wr, colWheel[2]]));
    b.anchor('seatTop', [0, seatH, 0]);
    b.anchor('pad', [0, padH, padZ]);
  };
  /* Тяга горизонтального блока. Начало координат — сиденье (центр по длине); пользователь смотрит в +Z.
     seatH — верх скамьи; plateZ, plateH — центр упоров для стоп; tilt — наклон упора от вертикали к пользователю. */
  TYPES.g3SeatedRow = (s, b) => {
    const seatH = s.seatH || 44, plateZ = s.plateZ ?? 92, plateH = s.plateH ?? 30, tilt = s.tilt ?? 22, pulleyH = s.pulleyH ?? 40, colZ = s.colZ ?? plateZ + 46, H = s.H || 205, X = 26;
    b.tube('beam', [0, 5, -48], [0, 5, colZ + 6], [10, 10], { mount: 'floor' });
    b.tube('footB', [-28, 3.75, -42], [28, 3.75, -42], [7.5, 7.5], { mount: 'beam' });
    /* длинная скамья */
    b.box('seat', [0, seatH - 3, -12], [32, 6, 64], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.box('seatPlate', [0, seatH - 7, -12], [24, 2, 58], { mount: 'postB' });
    for (const [k, z] of [['B', -36], ['F', 12]]) b.tube('post' + k, [0, 10, z], [0, seatH - 8, z], [6, 6], { mount: 'beam', up: [0, 0, 1] });
    /* упоры для стоп: стойка, поперечина, две наклонные площадки */
    const backZ = plateZ + 8;
    b.tube('platePost', [0, 10, backZ], [0, Math.max(plateH + 20, pulleyH + 9), backZ], [7.5, 7.5], { mount: 'beam', up: [0, 0, 1] });
    b.box('postCap', [0, Math.max(plateH + 20, pulleyH + 9) + .6, backZ], [8, 1.2, 8], { mount: 'platePost', tone: 'rubber', round: .4 });
    b.tube('plateBar', [-24, plateH, backZ - 4], [24, plateH, backZ - 4], [6, 6], { mount: 'platePost' });
    const ny = Math.sin(tilt * Math.PI / 180), nz = -Math.cos(tilt * Math.PI / 180);
    const n = [0, ny, nz], along = [0, -nz, ny];
    for (const [k, x] of [['L', 15], ['R', -15]]) {
      b.box('plate' + k, [x, plateH, plateZ], [15, 2, 30], { axes: [[1, 0, 0], n, along], role: 'support', tone: 'rubber', mount: 'plateBar', round: .6, contact: 'top' });
      b.box('plateLip' + k, V.add(V.add([x, plateH, plateZ], along, -14.2), n, 2.4), [15, 3.6, 1.6], { axes: [[1, 0, 0], n, along], tone: 'rubber', mount: 'plate' + k, round: .4 });
    }
    b.frameAnchor('plateL', [15, plateH, plateZ], [[1, 0, 0], [0, ny, nz], [0, -nz, ny]]);
    b.frameAnchor('plateR', [-15, plateH, plateZ], [[1, 0, 0], [0, ny, nz], [0, -nz, ny]]);
    b.anchor('plateNormal', [0, ny, nz]);
    /* нижний блок между упорами: кронштейн на стойке */
    b.box('pulleyMount', [0, pulleyH, backZ - 4.5], [6, 8, 2], { mount: 'platePost', round: .4 });
    b.cyl('swivel', [0, pulleyH, backZ - 6.7], [0, 0, 1], 2.6, 2.4, { mount: 'pulleyMount', tone: 'chrome' });
    b.anchor('pulley', [0, pulleyH, backZ - 15]);
    b.anchor('swivelPt', [0, pulleyH, backZ - 7.9]);
    /* колонна со стеком */
    const c = Sub(b, '', [0, 0, colZ], 0);
    c.tube('baseM', [-X - 4, 3.75, 0], [X + 4, 3.75, 0], [7.5, 7.5], { mount: '/beam' });
    c.tube('baseF', [-X - 4, 3.75, 26], [X + 4, 3.75, 26], [7.5, 7.5], { mount: 'baseL' });
    for (const [k, x] of [['L', X + 4], ['R', -X - 4]]) c.tube('base' + k, [x, 3.75, -14], [x, 3.75, 30], [7.5, 7.5], { mount: 'baseM' });
    c.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    c.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    c.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    for (const [k, x] of [['L', X], ['R', -X]]) c.tube('brace' + k, [x, 7.5, 26], [x, 60, 3.75], [5, 5], { mount: 'base' + k, up: [1, 0, 0] });
    stack(c, { H });
    b.anchor('seatTop', [0, seatH, 0]);
  };
  /* Стена с дверью и креплением для эспандера. Плоскость двери z = 0 (сторона пользователя), стена уходит в +Z.
     anchor: 'top' — лента в притворе над дверью по центру; 'side' — в притворе со стороны замка (+X) на высоте h. */
  TYPES.g3Door = (s, b) => {
    const W = 40, Hd = 203, T = 12, wall = s.wallH || 222, stub = s.stub || 34;
    for (const [k, sx] of [['L', 1], ['R', -1]]) {
      b.box('wall' + k, [sx * (W + 4 + stub / 2), wall / 2, T / 2], [stub, wall, T], { mount: 'floor', tone: 'wall', round: .2 });
      b.box('jamb' + k, [sx * (W + 2), (Hd + 5) / 2, T / 2], [4, Hd + 5, T + .4], { mount: 'wall' + k, tone: 'wood', round: .2 });
      b.box('trim' + k, [sx * (W + 4.5), (Hd + 7) / 2, -.6], [7, Hd + 7, 1.2], { mount: 'jamb' + k, tone: 'wood', round: .3 });
      b.box('stop' + k, [sx * (W - .6), Hd / 2, 8.5], [1.4, Hd, 3], { mount: 'jamb' + k, tone: 'wood', round: .2 });
    }
    b.box('lintel', [0, (Hd + 5 + wall) / 2, T / 2], [2 * W + 8, wall - Hd - 5, T], { mount: 'wallL', tone: 'wall', round: .2 });
    b.box('head', [0, Hd + 2.5, T / 2], [2 * W + 8, 5, T + .4], { mount: 'jambL', tone: 'wood', round: .2 });
    b.box('trimH', [0, Hd + 7, -.6], [2 * W + 16, 7, 1.2], { mount: 'head', tone: 'wood', round: .3 });
    b.box('stopH', [0, Hd - .6, 8.5], [2 * W, 1.4, 3], { mount: 'head', tone: 'wood', round: .2 });
    /* полотно двери (закрыто, открывается от пользователя), петли со стороны −X, ручка со стороны +X */
    b.box('leaf', [0, (Hd - .6) / 2 + .4, 4.9], [2 * W - .8, Hd - 1.2, 4], { mount: 'hinge2', tone: 'wood', round: .3 });
    for (const [i, y] of [[1, 24], [2, 100], [3, 180]]) b.box('hinge' + i, [-W + .1, y, 4.9], [.8, 10, 3], { mount: 'jambR', tone: 'chrome', round: .2 });
    b.cyl('rose', [W - 6, 100, 2.4], [0, 0, 1], 2.8, 1.2, { mount: 'leaf', tone: 'chrome' });
    b.tube('lever', [W - 6, 100, 1.4], [W - 6, 100, -2.6], 1, { mount: 'rose', tone: 'chrome' });
    b.tube('leverH', [W - 6, 100, -2.6], [W - 17, 100, -2.6], 1, { mount: 'lever', tone: 'chrome' });
    /* крепление: лента-петля из притвора, кольцо на конце */
    const side = s.anchor !== 'top', h = s.h ?? 160, out = s.out ?? 7;
    const root = side ? [W - .3, h, 2.9] : [0, Hd - .2, 2.9], loopEnd = side ? [W - 2.5, h, -out] : [0, Hd - out * .55, -out * .8];
    b.tube('strap', root, loopEnd, [2.6, .45], { mount: 'leaf', tone: 'rubber', up: side ? [1, 0, 0] : [0, 1, 0] });
    b.cyl('ring', V.add(loopEnd, [0, 0, -1.2]), side ? [0, 1, 0] : [1, 0, 0], 1.7, .7, { mount: 'strap', tone: 'chrome' });
    b.anchor('anchor', V.add(loopEnd, [0, 0, -1.8]));
  };

  /* Подушка под колени (поролон в чехле): size [ширина, толщина, длина] */
  TYPES.g3Pad = (s, b) => { const [w, t, l] = s.size || [46, 4.5, 30]; b.box('pad', [0, t / 2, 0], [w, t, l], { role: 'support', tone: 'mat', mount: 'floor', round: 1.2, contact: 'top' }); b.anchor('top', [0, t, 0]); };

  /* ---------- Трос с поворотным блоком и стеком ---------- */
  /* e: from — центр колеса; swivel — точка крепления оси поворота; swivelPart — деталь, к которой крепится ось;
     attach/hands/foot/bend/ext/clip — как в BIND.cable; plane: 'swivel' — колесо в плоскости троса и оси поворота;
     wrap — с какой стороны колеса сходит трос; stack — {o, R, sel, pitch, size, topY, rod, maxLift}; rest — длина троса
     (центр колеса — рукоять) в покое; ratio — передаточное отношение стека (1 — 1:1, 0,5 — 2:1). */
  BIND.g3cable = (e, R) => {
    const id = e.id || 'g3cable', wr = e.wheelR || 4.5;
    /* канат: ветви постоянной длины ropeLen — карабин тем ближе к кистям, чем шире они разведены */
    let clipLen = e.clip;
    if (e.attach === 'rope' && e.ropeLen) { const h = (e.hands || ['L', 'R']), sep = V.dist(R['grip' + h[0]], R['grip' + (h[1] || h[0])]) / 2; clipLen = Math.sqrt(Math.max(16, e.ropeLen * e.ropeLen - sep * sep)); }
    const base = BIND.cable({ ...e, id, mountTo: id + ':forkA', wheelR: wr, clip: clipLen }, R);
    const wheel = base.find(p => p.id === id + ':wheel'), line = base.find(p => p.id === id + ':line');
    const P = wheel.c, S = toCat(e.swivel), clip = line.pts[1], dir = V.unit(V.sub(clip, P)), up = [0, -1, 0];
    const bv = V.unit(V.sub(S, P));
    let A = wheel.axis;
    if (e.plane === 'swivel') { const c1 = V.cross(dir, bv), c2 = V.cross(dir, up); let a = V.add(c1, c2, .12); if (V.len(a) < 1e-4) a = [1, 0, 0]; A = V.unit(a); }
    wheel.axis = A;
    let bp = V.perp(V.sub(S, P), A); if (V.len(bp) < 1e-3) bp = V.perp(V.scale(dir, -1), A); bp = V.unit(bp);
    const w = V.cross(A, bp);
    /* сход троса по касательной к колесу */
    const q = V.perp(V.sub(clip, P), A), d = V.len(q);
    if (d > wr + .1) {
      const u = V.unit(q), u2 = V.cross(A, u), c = wr / d, s = Math.sqrt(1 - c * c);
      const T1 = V.add(P, V.add(V.scale(u, wr * c), u2, wr * s)), T2 = V.add(P, V.add(V.scale(u, wr * c), u2, -wr * s));
      const wrap = e.wrap ? V.unit(dirCat(e.wrap)) : bp;
      line.pts[0] = V.dot(V.sub(T1, P), wrap) >= V.dot(V.sub(T2, P), wrap) ? T1 : T2;
    }
    const out = base.filter(p => p.id !== id + ':strap');
    /* манжета на голеностоп: мягкое кольцо вокруг голени (полое — голень внутри), D-кольцо к карабину */
    if (e.attach === 'ankle') {
      const s = e.foot || 'L', f = R.frames['sk' + s], c0 = V.add(R['an' + s], f.y, 6), rr = 4.7, u = f.z, w = f.x;
      for (const [k, dy] of [['A', -1.5], ['B', 0], ['C', 1.5]]) {
        const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * 2 * Math.PI; pts.push(V.add(V.add(V.add(c0, f.y, dy), u, rr * Math.cos(a)), w, rr * Math.sin(a))); }
        out.push({ kind: 'cable', pts, r: .8, tone: 'rubber', role: 'strap', id: id + ':cuff' + k, mount: 'body' });
      }
      const ring = V.add(c0, V.unit(V.perp(V.sub(clip, c0), f.y)), rr + 1);
      out.push({ kind: 'cable', pts: [ring, clip], r: .5, tone: 'chrome', role: 'frame', id: id + ':dring', mount: id + ':line' });
    }
    /* прямая рукоять: поворотный крюк от середины рукояти к карабину троса */
    const bar = base.find(p => p.id === id + ':bar');
    if (bar) {
      const mid = V.mix(R['grip' + (e.hands || ['L', 'R'])[0]], R['grip' + (e.hands || ['L', 'R'])[1]], .5);
      out.push({ kind: 'beam', a: mid, b: clip, r: .8, tone: 'chrome', role: 'frame', id: id + ':hook', mount: id + ':line' });
      out.push({ kind: 'sphere', c: clip, r: 1.3, tone: 'chrome', role: 'frame', id: id + ':snap', mount: id + ':line' });
      bar.mount = id + ':hook';
    }
    const fc = V.add(P, bp, wr * .45);
    for (const [k, sg] of [['A', 1], ['B', -1]]) out.push({ kind: 'obox', c: V.add(fc, A, sg * 1.9), x: A, y: bp, z: w, size: [.7, wr * 2.3, wr * 2 + 2.2], round: .3, tone: 'frame', role: 'frame', id: id + ':fork' + k, mount: id + ':bridge' });
    const bc = V.add(P, bp, wr + 1.7);
    out.push({ kind: 'obox', c: bc, x: A, y: bp, z: w, size: [4.5, 2.6, 6], round: .4, tone: 'frame', role: 'frame', id: id + ':bridge', mount: id + ':pin' });
    out.push({ kind: 'beam', a: bc, b: S, r: 1.3, tone: 'chrome', role: 'frame', id: id + ':pin', mount: e.swivelPart });
    /* стек: выбранные плиты поднимаются на длину вытянутого троса */
    if (e.stack) {
      const st = e.stack, hands = e.hands || ['L', 'R'];
      const end = e.attach === 'ankle' ? R['an' + (e.foot || 'L')] : V.mix(R['grip' + hands[0]], R['grip' + (hands[1] || hands[0])], .5);
      const lift = Math.max(0, Math.min(st.maxLift, (V.dist(end, P) - (e.rest || 0)) * (e.ratio ?? 1)));
      const o = toCat(st.o), X = dirCat(M3.col(st.R, 0)), Y = dirCat(M3.col(st.R, 1)), Z = dirCat(M3.col(st.R, 2));
      /* плиты и верхняя плита скользят по обеим направляющим: rides — детали, сквозь которые они проходят по устройству */
      const at = (y) => V.add(o, Y, y + lift), sid = id + ':stk', rides = [e.rodPart, e.rodPart.replace(/L$/, 'R')];
      for (let i = 0; i < st.sel; i++) out.push({ kind: 'obox', c: at(i * st.pitch + st.size[1] / 2), x: X, y: Y, z: Z, size: [...st.size], round: .35, tone: 'stack', role: 'frame', id: sid + i, mount: e.rodPart, rides });
      const topC = at(st.sel * st.pitch + 2);
      out.push({ kind: 'obox', c: topC, x: X, y: Y, z: Z, size: [st.size[0] + 1, 4, st.size[2] + 1], round: .5, tone: 'frame', role: 'frame', id: sid + 'Top', mount: e.rodPart, rides });
      const stemTop = V.add(topC, Y, 8);
      out.push({ kind: 'beam', a: V.add(topC, Y, 2), b: stemTop, r: 1.1, tone: 'chrome', role: 'frame', id: sid + 'Stem', mount: sid + 'Top' });
      out.push({ kind: 'cable', pts: [stemTop, V.add(o, Y, st.topY - st.o[1])], r: .35, tone: 'cable', role: 'cable', id: sid + 'Cable', mount: sid + 'Stem' });
    }
    return out;
  };
  /* Эспандер от крепления (кольцо на двери): обе ветви от одной точки к рукоятям; ветви крепятся к детали mountTo */
  BIND.g3band = (e, R) => {
    const id = e.id || 'band', from = toCat(e.from), out = [];
    for (const s of e.hands || ['L', 'R']) {
      const g = R['grip' + s], hz = R.frames['hand' + s].z;
      out.push({ kind: 'cable', pts: [from, g], r: e.r || .7, tone: 'band', role: 'cable', id: id + ':' + s, mount: e.mountTo });
      out.push({ kind: 'beam', a: V.add(g, hz, 6.5), b: V.add(g, hz, -6.5), r: 1.6, tone: 'rubber', role: 'grip', id: id + ':handle' + s, mount: id + ':' + s });
    }
    return out;
  };
  /* Неподвижный трос между точками (внутри тренажёра: вдоль вылета, к колонне) */
  BIND.g3line = e => [{ kind: 'cable', pts: e.pts.map(toCat), r: e.r || .35, tone: 'cable', role: 'cable', id: e.id || 'g3line', mount: e.mountTo || 'floor' }];
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Тренажёры группы G4: силовые тренажёры с рычагами и каретками, гравитрон, «капитанский стул», брусья,
   скамья для пресса, гиперэкстензия. Размеры — по типовым коммерческим моделям (см).
   Раскладка каждого тренажёра (высота сиденья, оси рычагов, направляющие) считается в спецификации упражнения
   от положения тела: ось рычага проходит через ось нагружаемого сустава, как в настоящих тренажёрах.
   Внутренние координаты: Y вверх, пол Y = 0, тело смотрит вдоль +Z, левая сторона +X. */
((E) => {
const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
const { V, D2R, toCat, dirCat } = M, { TYPES, BIND } = E;
const unit = V.unit;

/* ---------- Общие узлы ---------- */
/* Подушка на пластине: c — центр подушки, size — [ширина, толщина, длина] по осям axes (y — нормаль),
   пластина под подушкой крепится к mount. */
function pad(b, k, c, size, axes, mount, opts = {}) {
  const n = unit(axes[1]), t = size[1], pt = opts.plateT || 2;
  b.box(k, c, size, { axes, role: 'support', tone: 'pad', mount: k + 'Plate', round: opts.round ?? 1.6, contact: 'top' });
  b.box(k + 'Plate', V.add(c, n, -(t / 2 + pt / 2 - .2)), [size[0] - 4, pt, size[2] - 4], { axes, mount });
  return V.add(c, n, -(t / 2 + pt - .2)); /* точка крепления за пластиной */
}
/* Колонна стека грузов: стойки, направляющие, плиты, верхняя плита; основание на полу.
   c — центр стека на полу [x, 0, z], w — ширина плит, h — высота колонны, along — ось ширины ('x' или 'z'). */
function stack(b, k, c, h, opts = {}) {
  const w = opts.w || 30, d = opts.d || 16, ax = opts.along === 'z' ? [0, 0, 1] : [1, 0, 0], side = opts.along === 'z' ? [1, 0, 0] : [0, 0, 1];
  const P = (u, y, v) => V.add(V.add(V.add(c, ax, u), [0, 1, 0], y), side, v);
  const hw = w / 2 + 7;
  b.tube(k + 'Base', P(-hw - 4, 3.75, 0), P(hw + 4, 3.75, 0), [8, 7.5], { mount: 'floor', up: [0, 1, 0] });
  b.tube(k + 'BaseS', P(0, 3.75, -d), P(0, 3.75, d), [8, 7.5], { mount: k + 'Base' });
  for (const sg of [-1, 1]) b.tube(k + 'Post' + (sg > 0 ? 'A' : 'B'), P(sg * hw, 7.5, 0), P(sg * hw, h, 0), [6, 6], { mount: k + 'Base' });
  b.tube(k + 'Top', P(-hw - 3, h - 3, 0), P(hw + 3, h - 3, 0), [6, 6], { mount: k + 'PostA' });
  const sh = opts.stackH || 62;
  b.box(k + 'Plates', P(0, 7.5 + sh / 2, 0), [w, sh, 12], { axes: [ax, [0, 1, 0], side], mount: k + 'Base', tone: 'stack', round: .4 });
  for (const sg of [-1, 1]) b.tube(k + 'Rod' + (sg > 0 ? 'A' : 'B'), P(sg * (w / 2 - 6), 7.5, 0), P(sg * (w / 2 - 6), h - 6, 0), .9, { mount: k + 'Base', tone: 'chrome', role: 'guide' });
  b.box(k + 'Head', P(0, 7.5 + sh + 2.5, 0), [w - 2, 4, 10], { axes: [ax, [0, 1, 0], side], mount: k + 'Plates', tone: 'chrome', round: .4 });
  b.cyl(k + 'Pulley', P(0, h - 9, 0), side, 4.8, 2.4, { mount: k + 'Top', tone: 'chrome' });
  b.tube(k + 'Cable', P(0, 7.5 + sh + 4.5, 0), P(0, h - 13.5, 0), .35, { mount: k + 'Head', tone: 'cable', role: 'cable' });
}
/* Рукоять-труба с прорезиненным хватом: от a к b, держатель — mount */
function handle(b, k, a, c, r, mount) { b.tube(k, a, c, r || 1.6, { mount, role: 'grip', tone: 'rubber' }); }

/* ---------- Жёсткие подвижные узлы ----------
   Детали задаются в локальной рамке узла и переводятся в каталог. Рамка — правая тройка внутренних осей:
   X, Y, Z (внутренние направления). Виды деталей: beam {a, b, r | w, h, up}, obox {c, size, axes?},
   cyl {c, axis, r, len}, sphere {c, r}. mount — имя детали узла или полный id ('lx:hub'); иначе mountTo. */
function rigid(id, O, X, Y, Z, parts, mountTo) {
  const Lp = p => toCat(V.add(V.add(V.add(O, X, p[0]), Y, p[1]), Z, p[2]));
  const Ld = d => dirCat(unit(V.add(V.add(V.scale(X, d[0]), Y, d[1]), Z, d[2])));
  return parts.map(p => {
    const o = { kind: p.kind, id: id + ':' + p.name, mount: p.mount ? (p.mount.includes(':') || p.mount === 'floor' ? p.mount : id + ':' + p.mount) : mountTo, tone: p.tone || 'frame', role: p.role || 'frame' };
    if (p.kind === 'beam') {
      o.a = Lp(p.a); o.b = Lp(p.b);
      if (p.r) o.r = p.r;
      else { /* сечение: up не должен совпадать с осью балки */
        const dir = unit(V.sub(o.b, o.a)); let up = Ld(p.up || [0, 1, 0]);
        if (Math.abs(V.dot(up, dir)) > .9) { for (const c of [[0, 0, 1], [1, 0, 0], [0, 1, 0]]) { up = Ld(c); if (Math.abs(V.dot(up, dir)) < .9) break; } }
        o.w = p.w; o.h = p.h; o.up = up;
      }
    }
    else if (p.kind === 'obox') { const ax = p.axes || [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; o.c = Lp(p.c); o.x = Ld(ax[0]); o.y = Ld(ax[1]); o.z = Ld(ax[2]); o.size = [...p.size]; o.round = p.round ?? 1; }
    else if (p.kind === 'cyl') { o.c = Lp(p.c); o.axis = Ld(p.axis || [1, 0, 0]); o.r = p.r; o.len = p.len; o.sides = p.sides || 24; }
    else if (p.kind === 'sphere') { o.c = Lp(p.c); o.r = p.r; }
    return o;
  });
}
/* Точка тела во внутренних координатах */
const bodyInt = (R, bind) => { const p = E.bodyPoint(R, bind); return [p[0], M.FLOOR - p[1], p[2]]; };
/* Рычаг: ось (pivot, axis) неподвижна, угол задаёт точка тела bind. Локальная рамка:
   X — вдоль оси, Y — от оси к точке тела (радиус), Z = X × Y (касательная). rot — доворот рамки, град. */
BIND.g4lever = (e, R) => {
  const P = e.pivot, A = unit(e.axis), T = bodyInt(R, e.bind), d = V.sub(T, P);
  let Y = V.sub(d, V.scale(A, V.dot(d, A)));
  Y = V.len(Y) > 1e-6 ? unit(Y) : E.ortho([0, -1, 0], A);
  let Z = V.cross(A, Y);
  if (e.rot) { const a = e.rot * D2R, c = Math.cos(a), s = Math.sin(a), y2 = V.add(V.scale(Y, c), Z, s); Z = V.add(V.scale(Z, c), Y, -s); Y = y2; }
  return rigid(e.id || 'lever', P, A, Y, Z, e.parts || [], e.mountTo);
};
/* Параллелограмм: два параллельных рычага (оси pivot + d0 и pivot + d0 + v) несут площадку, которая движется по дуге
   без поворота. Угол задаёт точка тела bind относительно pivot. carrier — детали площадки во внутренних осях,
   координаты от точки тела на дуге. */
BIND.g4link = (e, R) => {
  const P = e.pivot, A = unit(e.axis), T = bodyInt(R, e.bind), d = V.sub(T, P), rad = V.sub(d, V.scale(A, V.dot(d, A)));
  const rl = V.len(rad), u = unit(rad), Tp = V.add(V.add(P, A, V.dot(d, A)), u, rl);
  const p1 = V.add(P, e.d0), p2 = V.add(p1, e.v), E1 = V.add(p1, u, rl), E2 = V.add(p2, u, rl), w = e.armW || 6, xs = e.armX || [0];
  const parts = [];
  xs.forEach((x, i) => {
    const o = [x, 0, 0];
    parts.push({ name: 'armU' + i, kind: 'beam', a: V.add(p1, o), b: V.add(E1, o), w, h: w, up: [1, 0, 0], mount: e.mountTo });
    parts.push({ name: 'armL' + i, kind: 'beam', a: V.add(p2, o), b: V.add(E2, o), w, h: w, up: [1, 0, 0], mount: e.mountTo2 || e.mountTo });
    parts.push({ name: 'post' + i, kind: 'beam', a: V.add(V.add(E2, o), e.v, .2), b: V.add(V.add(E1, o), e.v, -.2), w: w - 1, h: w - 1, up: [0, 0, 1], mount: 'armU' + i });
  });
  for (const p of e.carrier || []) {
    const q = { ...p };
    if (p.c) q.c = V.add(Tp, p.c);
    if (p.a) { q.a = V.add(Tp, p.a); q.b = V.add(Tp, p.b); }
    parts.push(q);
  }
  return rigid(e.id || 'link', [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], parts, e.mountTo);
};
/* Каретка на прямой направляющей rail [от, до]: положение — проекция точки тела + shift.
   Рамка: Z — вдоль направляющей, Y — ближе всего к up, X = Y × Z. */
BIND.g4sled = (e, R) => {
  const A = e.rail[0], B = e.rail[1], Z = unit(V.sub(B, A)), T = bodyInt(R, e.bind);
  const s = Math.max(0, Math.min(V.dist(A, B), V.dot(V.sub(T, A), Z) + (e.shift || 0))), O = V.add(A, Z, s);
  const Y = E.ortho(unit(e.up || [0, 1, 0]), Z), X = V.cross(Y, Z);
  return rigid(e.id || 'sled', O, X, Y, Z, e.parts || [], e.mountTo);
};

/* ---------- Разгибание ног сидя ----------
   s: seatH — верх сиденья; seatZ — [задний, передний] край сиденья; back — {z0 (низ спинки у сиденья), ang (наклон
   от вертикали), len}; pivot — [y, z] оси колен; hubX — сторона рычага (−X — правая); handle — {x, y, z}. */
TYPES.legExtension = (s, b) => {
  const H = s.seatH, [z0, z1] = s.seatZ, T = 7, py = s.pivot[0], pz = s.pivot[1], hx = s.hubX, sx = Math.sign(hx);
  const a = s.back.ang * D2R, up = [0, Math.cos(a), -Math.sin(a)], nb = [0, Math.sin(a), Math.cos(a)];
  /* основание */
  b.tube('base', [0, 3.75, z0 - 32], [0, 3.75, z1 - 4], [8, 7.5], { mount: 'floor' });
  b.tube('baseB', [-34, 3.75, z0 - 26], [34, 3.75, z0 - 26], [8, 7.5], { mount: 'base' });
  b.tube('baseM', [-30, 3.75, z1 - 10], [30, 3.75, z1 - 10], [8, 7.5], { mount: 'base' });
  /* сиденье */
  const seatC = [0, H - T / 2, (z0 + z1) / 2];
  const under = pad(b, 'seat', seatC, [34, T, z1 - z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, (z0 + z1) / 2 - 4], [0, under[1] + .5, (z0 + z1) / 2 - 4], [7.5, 7.5], { mount: 'base' });
  /* спинка: низ у заднего края сиденья, наклон назад */
  const bl = s.back.len || 58, bot = [0, H + 2, s.back.z0], bc = V.add(V.add(bot, up, bl / 2), nb, -T / 2);
  const behind = pad(b, 'back', bc, [32, T, bl], [[1, 0, 0], nb, up], 'backStrut');
  b.tube('backStrut', [0, 7.5, z0 - 22], V.add(behind, nb, -.5), [6, 6], { mount: 'baseB' });
  /* стойка оси рычага сбоку, кулачок (диск) снаружи от рычага */
  b.tube('baseM2', [hx + sx * 7, 3.75, z1 - 10], [hx + sx * 7, 3.75, pz + 6], [7.5, 7.5], { mount: 'baseM' });
  b.tube('pivotPost', [hx + sx * 7, 7.5, pz - 2], [hx + sx * 7, py + 4, pz - 2], [7, 7], { mount: 'baseM2' });
  b.cyl('cam', [hx + sx * 3.5, py, pz], [1, 0, 0], 10, 3, { mount: 'pivotPost', sides: 28 });
  b.cyl('hub', [hx + sx * .5, py, pz], [1, 0, 0], 4.2, 3.4, { mount: 'cam', tone: 'chrome' });
  /* рукояти по бокам сиденья */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', hxp = sg * s.handle.x, hz = s.handle.z - 5;
    b.tube('hArm' + k, [sg * 14, H - T - 1.5, hz], [hxp, H - T - 1.5, hz], [4, 3], { mount: 'seatPlate' });
    b.tube('hPost' + k, [hxp, H - T - 1.5, hz], [hxp, s.handle.y, hz], [3.5, 3.5], { mount: 'hArm' + k });
    handle(b, 'handle' + k, [hxp, s.handle.y, hz], [hxp, s.handle.y, hz + 18], 1.6, 'hPost' + k);
  }
  /* стек грузов позади спинки */
  const sz = z0 - 46;
  stack(b, 'stk', [0, 0, sz], 150, { w: 30 });
  b.tube('stkLink', [0, 3.75, sz + 4], [0, 3.75, z0 - 30], [8, 7.5], { mount: 'stkBaseS' });
  b.anchor('pivot', [hx, py, pz]);
};

/* Наклонная подушка между двумя точками поверхности: from → to вдоль подушки, n — нормаль (вверх от поверхности),
   ширина w, толщина T. Пластина под подушкой крепится к mount. */
function padAlong(b, k, from, to, n, w, T, mount, opts = {}) {
  const z = unit(V.sub(to, from)), y = unit(n), x = unit(V.cross(y, z)), L = V.dist(from, to);
  const c = V.add(V.mix(from, to, .5), y, -T / 2);
  return pad(b, k, c, [w, T, L], [x, y, z], mount, opts);
}
/* ---------- Сгибание ног лёжа: скамья с изломом под тазом ----------
   s: hump [y, z] — линия излома (верх подушек); knee — [y, z] конец бедренной подушки; head — [y, z] конец грудной;
   nTh, nT — нормали подушек; pivot — [y, z] оси колен; hubX — сторона рычага; handle — {x, y, z}. */
TYPES.legCurl = (s, b) => {
  const T = 7, W = 32, H = [0, ...s.hump], Kp = [0, ...s.knee], Hd = [0, ...s.head], nTh = [0, ...s.nTh], nT = [0, ...s.nT];
  const [py, pz] = s.pivot, hx = s.hubX, sx = Math.sign(hx);
  const thB = padAlong(b, 'thighPad', Kp, H, nTh, W, T, 'beamTh');
  const toB = padAlong(b, 'chestPad', V.add(H, [0, 0, 1], .5), Hd, nT, W, T, 'beamT');
  /* балки под подушками и стойки */
  const dTh = unit(V.sub(H, Kp)), dT = unit(V.sub(Hd, H)), nThU = unit(nTh), nTU = unit(nT);
  const thA = V.add(V.add(Kp, dTh, 6), nThU, -T - 2 - 3), thZ = V.add(V.add(H, dTh, -2), nThU, -T - 2 - 3);
  b.tube('beamTh', thA, thZ, [8, 6], { mount: 'hump', up: nThU });
  const tA = V.add(V.add(H, dT, 2), nTU, -T - 2 - 3), tZ = V.add(V.add(Hd, dT, -6), nTU, -T - 2 - 3);
  b.tube('beamT', tA, tZ, [8, 6], { mount: 'hump', up: nTU });
  const hz = H[2] - 2;
  b.tube('hump', [0, 7.5, hz], [0, H[1] - T - 5, hz], [8, 8], { mount: 'base' });
  b.tube('base', [0, 3.75, s.knee[1] > 0 ? Kp[2] + 8 : Kp[2] + 8], [0, 3.75, Hd[2] + 30], [8, 7.5], { mount: 'floor' });
  b.tube('frontLeg', [0, 7.5, Hd[2] - 8], V.add(tZ, nTU, -2.5), [7, 7], { mount: 'base' });
  b.tube('baseF', [-32, 3.75, Hd[2] + 24], [32, 3.75, Hd[2] + 24], [8, 7.5], { mount: 'base' });
  b.tube('baseB', [-30, 3.75, Kp[2] + 12], [hx + sx * 11, 3.75, Kp[2] + 12], [8, 7.5], { mount: 'base' });
  b.tube('rearLeg', [0, 7.5, Kp[2] + 16], V.add(V.add(thA, dTh, 10), nThU, -2.5), [7, 7], { mount: 'baseB' });
  /* ось рычага: стойка от пола сбоку от колен, кулачок снаружи */
  b.tube('baseP', [hx + sx * 7, 3.75, Kp[2] + 12], [hx + sx * 7, 3.75, pz - 6], [7.5, 7.5], { mount: 'baseB' });
  b.tube('pivotUp', [hx + sx * 7, 7.5, pz], [hx + sx * 7, py + 4, pz], [6, 6], { mount: 'baseP' });
  b.cyl('cam', [hx + sx * 3.5, py, pz], [1, 0, 0], 10, 3, { mount: 'pivotUp', sides: 28 });
  b.cyl('hub', [hx + sx * .5, py, pz], [1, 0, 0], 4.2, 3.4, { mount: 'cam', tone: 'chrome' });
  /* рукояти под передним краем грудной подушки: наклонные стойки на поперечине, поперечина — на стойке от основания */
  const ha = unit([0, ...s.handle.ax]), top = [0, s.handle.y + ha[1] * 9, s.handle.z + ha[2] * 9];
  b.tube('hPost', [0, 7.5, top[2]], [0, top[1] + 2, top[2]], [6, 6], { mount: 'base' });
  b.tube('hBar', [-s.handle.x - 2, top[1], top[2]], [s.handle.x + 2, top[1], top[2]], [4, 4], { mount: 'hPost' });
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', g = [sg * s.handle.x, s.handle.y, s.handle.z];
    handle(b, 'handle' + k, V.add(g, ha, 9), V.add(g, ha, -8), 1.6, 'hBar');
  }
  /* стек грузов сбоку у грудной подушки */
  stack(b, 'stk', [hx + sx * 28, 0, (H[2] + Hd[2]) / 2], 140, { along: 'z', w: 30 });
  b.tube('stkLink', [hx + sx * 11, 3.75, Kp[2] + 12], [hx + sx * 11, 3.75, (H[2] + Hd[2]) / 2], [7.5, 7.5], { mount: 'baseB' });
  b.tube('stkLink2', [hx + sx * 11, 3.75, (H[2] + Hd[2]) / 2], [hx + sx * 24, 3.75, (H[2] + Hd[2]) / 2], [7.5, 7.5], { mount: 'stkBase' });
};

/* ---------- Гиперэкстензия 45° ----------
   Рамка от тела: H — середина тазобедренных [y, z]; d — вдоль ног к голове (45°), n — к полу со стороны живота.
   s: plate {c, n, size} — площадка для стоп; roll {u, v} — валики за голенями; pad {u0, u1, v} — упор для бёдер;
   beamV — смещение главной балки под ногами. */
TYPES.hyper45 = (s, b) => {
  const a = (s.ang || 45) * D2R, d = [0, Math.sin(a), Math.cos(a)], n = [0, -Math.cos(a), Math.sin(a)];
  const UV = (x, u, v) => [x, s.H[0] + d[1] * u + n[1] * v, s.H[1] + d[2] * u + n[2] * v];
  const bv = s.beamV, uFloor = (4 - s.H[0] - n[1] * bv) / d[1], uEnd = s.uEnd;
  const rear = UV(0, uFloor, bv), front = UV(0, uEnd, bv);
  b.tube('beam', rear, front, [8, 8], { mount: 'baseB', up: n });
  b.tube('baseB', [-34, 3.75, rear[2]], [34, 3.75, rear[2]], [8, 7.5], { mount: 'floor' });
  b.tube('rail', [0, 3.75, rear[2] - 4], [0, 3.75, front[2] + 4], [8, 7.5], { mount: 'floor' });
  b.tube('frontLeg', [0, 7.5, front[2]], V.add(front, [0, 1, 0], 2), [8, 8], { mount: 'rail' });
  b.tube('baseF', [-34, 3.75, front[2]], [34, 3.75, front[2]], [8, 7.5], { mount: 'rail' });
  /* площадка для стоп на кронштейне от балки */
  const pn = unit([0, ...s.plate.n]), pz = unit(V.cross([1, 0, 0], pn)), pc = [0, ...s.plate.c];
  b.box('plate', V.add(pc, pn, -2), [s.plate.size[0], 4, s.plate.size[1]], { axes: [[1, 0, 0], pn, pz], mount: 'plateArm', tone: 'rubber', round: .6 });
  const pBack = V.add(pc, pn, -4.5), onBeam = UV(0, V.dot(V.sub(pBack, UV(0, 0, 0)), d), bv);
  b.tube('plateArm', V.add(pBack, pn, 1), V.add(onBeam, n, -3), [6, 6], { mount: 'beam' });
  /* валики за голенями: поперечина на балке, боковые стойки снаружи ног, ось с двумя валиками */
  const ru = s.roll.u, rv = s.roll.v, rx = 22;
  b.tube('rollBar', UV(-rx - 3, ru, bv), UV(rx + 3, ru, bv), [6, 6], { mount: 'beam', up: d });
  for (const sg of [1, -1]) b.tube('rollPost' + (sg > 0 ? 'L' : 'R'), UV(sg * rx, ru, bv), UV(sg * rx, ru, rv - 3), [5, 5], { mount: 'rollBar', up: d });
  b.tube('axle', UV(-rx - 2, ru, rv), UV(rx + 2, ru, rv), 1.3, { mount: 'rollPostL', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('roll' + (sg > 0 ? 'L' : 'R'), UV(sg * 9.5, ru, rv), [1, 0, 0], s.roll.r || 5, 16, { mount: 'axle', tone: 'pad', role: 'support' });
  /* упор для бёдер: подушка на стойке от передней части балки */
  const pv = s.pad.v, back = pad(b, 'pad', UV(0, (s.pad.u0 + s.pad.u1) / 2, pv + 3.5), [s.pad.w || 42, 7, s.pad.u0 - s.pad.u1], [[1, 0, 0], V.scale(n, -1), d], 'padPost');
  b.tube('padPost', V.add(back, n, -1), V.add(front, d, -6), [7, 7], { mount: 'beam', up: [1, 0, 0] });
  /* рукояти по бокам упора */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', p0 = V.add(UV(sg * 20, (s.pad.u0 + s.pad.u1) / 2 - 4, pv + 9), [1, 0, 0], 0);
    b.tube('hArm' + k, V.add(p0, [1, 0, 0], -sg * 18), V.add(p0, [1, 0, 0], sg * 6), [4, 3], { mount: 'padPlate' });
    handle(b, 'handle' + k, V.add(p0, [1, 0, 0], sg * 6), V.add(V.add(p0, [1, 0, 0], sg * 6), n, 14), 1.6, 'hArm' + k);
  }
};

/* ---------- Жим ногами 45° ----------
   Направляющие под 45° идут вверх-вперёд (+Z); каретка с платформой — подвижная часть (BIND.g4sled).
   s: seat {c [y, z], ang (подъём переднего края), len}; back {c0 [y, z] — нижняя точка поверхности, ang (от горизонтали),
   len}; rail {a [y, z], b [y, z]} — осевая линия между направляющими; rx — полуширина колеи; handle {x, y, z}. */
TYPES.legPress45 = (s, b) => {
  const rx = s.rx || 28, A = [0, ...s.rail.a], B = [0, ...s.rail.b], d = unit(V.sub(B, A)), nu = [0, d[2], -d[1]];
  const T = 8, W = 40;
  /* основание */
  const zb = s.back.c0[1] - 46, zc = B[2];
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * (rx + 4), 3.75, zb], [sg * (rx + 4), 3.75, zc + 10], [8, 7.5], { mount: 'floor' });
  b.tube('baseC', [0, 3.75, zb], [0, 3.75, A[2] + 10], [8, 7.5], { mount: 'baseX' });
  b.tube('baseX', [-rx - 8, 3.75, A[2] - 4], [rx + 8, 3.75, A[2] - 4], [8, 7.5], { mount: 'baseL' });
  b.tube('baseXB', [-24, 3.75, zb + 4], [24, 3.75, zb + 4], [8, 7.5], { mount: 'baseC' });
  /* направляющие на наклонных балках; нижний конец — на поперечине со стойками, верхний — на колоннах */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * rx, a0 = V.add([x, A[1], A[2]], nu, -6.5), b0 = V.add([x, B[1], B[2]], nu, -6.5);
    b.tube('rb' + k, a0, b0, [8, 8], { mount: 'col' + k, up: nu });
    b.tube('rail' + k, [x, A[1], A[2]], [x, B[1], B[2]], 2.5, { mount: 'rb' + k, tone: 'chrome', role: 'guide' });
    b.tube('col' + k, [sg * (rx + 4), 7.5, b0[2] - 2], [sg * (rx + 4), b0[1] + 4, b0[2] - 2], [8, 8], { mount: 'base' + k });
    b.tube('leg' + k, [sg * (rx + 4), 7.5, a0[2] + 8], V.add(V.add(a0, d, 8), nu, -4), [7, 7], { mount: 'base' + k });
    b.box('stop' + k, V.add(V.add([x, B[1], B[2]], d, -3), nu, 3), [8, 6, 6], { axes: [[1, 0, 0], nu, d], mount: 'rail' + k, tone: 'rubber' });
  }
  b.tube('topX', [-rx - 8, B[1] - 6.5 * nu[1] + 4, B[2] - 2], [rx + 8, B[1] - 6.5 * nu[1] + 4, B[2] - 2], [8, 8], { mount: 'colL' });
  /* сиденье-«ковш» и спинка */
  const sa = s.seat.ang * D2R, sz = [0, Math.sin(sa), Math.cos(sa)], sy = [0, Math.cos(sa), -Math.sin(sa)];
  const sc = [0, ...s.seat.c], sl = s.seat.len || 40;
  const seatB = pad(b, 'seat', V.add(sc, sy, -T / 2), [W, T, sl], [[1, 0, 0], sy, sz], 'seatPost');
  const ba = s.back.ang * D2R, bz = [0, Math.sin(ba), -Math.cos(ba)], by = [0, Math.cos(ba), Math.sin(ba)];
  const bl = s.back.len || 84, bc = V.add(V.add([0, ...s.back.c0], bz, bl / 2), by, -T / 2);
  const backB = pad(b, 'back', bc, [W - 2, T, bl], [[1, 0, 0], by, bz], 'backStrut');
  b.tube('seatPost', [0, 7.5, seatB[2]], V.add(seatB, [0, 1, 0], .5), [8, 8], { mount: 'baseC' });
  b.tube('backStrut', [0, 7.5, zb + 4], V.add(backB, by, .5), [7, 7], { mount: 'baseXB' });
  b.tube('backLink', V.add(seatB, [0, 0, -1], 0), V.add(V.add([0, ...s.back.c0], bz, 10), by, -T - 2.5), [6, 6], { mount: 'seatPost' });
  /* наклонные рукояти по бокам сиденья: ось ручки перпендикулярна предплечью */
  const ha = unit([0, ...s.handle.ax]);
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', g = [sg * s.handle.x, s.handle.y, s.handle.z], lo = V.add(g, ha, -9), hi = V.add(g, ha, 9);
    b.tube('hPost' + k, [sg * (rx + 4), 7.5, lo[2]], [sg * (rx + 4), lo[1], lo[2]], [5, 5], { mount: 'base' + k });
    b.tube('hArm' + k, [sg * (rx + 4), lo[1], lo[2]], [g[0] + sg * 1.5, lo[1], lo[2]], [4, 4], { mount: 'hPost' + k });
    handle(b, 'handle' + k, V.add(lo, [sg, 0, 0], 0), hi, 1.6, 'hArm' + k);
  }
};

/* ---------- Брусья (отдельная стойка) ----------
   s: h — высота оси брусьев, x — полурасстояние между осями, z — [задний, передний] концы. */
TYPES.dipStation = (s, b) => {
  const H = s.h || 120, X = s.x || 28, [z0, z1] = s.z || [-32, 30], r = s.r || 2.2;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [sg * (X + 4), 3.75, z0 - 14], [sg * (X + 4), 3.75, z1 + 14], [8, 7.5], { mount: 'floor' });
    for (const [pk, z] of [['B', z0 + 3], ['F', z1 - 3]]) b.tube('post' + k + pk, [sg * (X + 4), 7.5, z], [sg * (X + 4), H - 3, z], [6, 6], { mount: 'base' + k });
    b.tube('head' + k, [sg * (X + 4), H - 3, z0 + 3], [sg * (X + 4), H - 3, z1 - 3], [6, 4], { mount: 'post' + k + 'B' });
    for (const [pk, z] of [['B', z0 + 3], ['F', z1 - 3]]) b.tube('lug' + k + pk, [sg * (X + 4), H - 1, z], [x, H - 1, z], [5, 3], { mount: 'head' + k });
    b.tube('bar' + k, [x, H, z0], [x, H, z1], r, { mount: 'lug' + k + 'B', role: 'grip', tone: 'chrome' });
  }
  b.tube('baseF', [-X - 8, 3.75, z1 + 10], [X + 8, 3.75, z1 + 10], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-X - 8, 3.75, z0 - 10], [X + 8, 3.75, z0 - 10], [8, 7.5], { mount: 'baseL' });
  b.tube('braceF', [-X - 4, 52, z1 - 3], [X + 4, 52, z1 - 3], [5, 5], { mount: 'postLF' });
};

/* ---------- Гравитрон (подтягивания и брусья с противовесом) ----------
   Пользователь стоит коленями на платформе лицом к башне (+Z). Рычаг платформы вращается вокруг оси в башне.
   s: tz — передняя плоскость башни; pivot [y, z]; pull {y, z, x0, x1} — рукояти подтягиваний (вдоль X);
   dip {y, x, z0} — брусья (вдоль Z до башни); step {y}. */
TYPES.gravitron = (s, b) => {
  const tz = s.tz, X = 30, H = 240, [py, pz] = s.pivot;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [x, 3.75, tz - 30], [x, 3.75, pz + 40], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [x, 7.5, tz], [x, H, tz], [8, 8], { mount: 'base' + k });
    b.tube('upB' + k, [x, 7.5, pz + 34], [x, H - 30, pz + 34], [7, 7], { mount: 'base' + k });
    b.tube('topS' + k, [x, H - 34, tz], [x, H - 34, pz + 34], [6, 6], { mount: 'up' + k });
    /* рукояти подтягиваний: кронштейн от башни назад, рукоять вдоль X */
    const ox = sg * (s.pull.x1 + 2);
    b.tube('pullArm' + k, [x, s.pull.y + 5, tz], [ox, s.pull.y + 5, s.pull.z], [6, 6], { mount: 'up' + k });
    b.tube('pullDrop' + k, [ox, s.pull.y + 5, s.pull.z], [ox, s.pull.y, s.pull.z], [4, 4], { mount: 'pullArm' + k });
    handle(b, 'pull' + k, [sg * s.pull.x0, s.pull.y, s.pull.z], [ox, s.pull.y, s.pull.z], 1.6, 'pullDrop' + k);
    /* брусья: от башни назад */
    b.tube('dipArm' + k, [x, s.dip.y, tz], [sg * s.dip.x, s.dip.y, tz - 6], [5, 5], { mount: 'up' + k });
    b.tube('dip' + k, [sg * s.dip.x, s.dip.y, tz - 6], [sg * s.dip.x, s.dip.y, s.dip.z0], 2.2, { mount: 'dipArm' + k, role: 'grip', tone: 'rubber' });
    /* ступени по бокам платформы */
    b.tube('stepArm' + k, [x, s.step.y - 3, tz], [x, s.step.y - 3, s.step.z0], [5, 5], { mount: 'up' + k });
    b.box('step' + k, [sg * (X - 4), s.step.y - .5, (tz + s.step.z0) / 2 - 8], [18, 3, tz - s.step.z0 - 16], { mount: 'stepArm' + k, tone: 'rubber', round: .5 });
  }
  b.tube('top', [-X - 4, H - 4, tz], [X + 4, H - 4, tz], [8, 8], { mount: 'upL' });
  b.tube('topB', [-X - 3, H - 34, pz + 34], [X + 3, H - 34, pz + 34], [6, 6], { mount: 'upBL' });
  b.tube('baseF', [-X - 4, 3.75, tz - 26], [X + 4, 3.75, tz - 26], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-X - 4, 3.75, pz + 38], [X + 4, 3.75, pz + 38], [8, 7.5], { mount: 'baseL' });
  /* ось рычага платформы: вал между стойками башни */
  /* оси параллелограмма платформы: две поперечные трубы между стойками башни */
  for (const [k, y] of [['U', py], ['D', py + s.linkV]]) {
    b.tube('shaft' + k, [-X, y, pz], [X, y, pz], 2.5, { mount: 'br' + k + 'L', tone: 'chrome' });
    for (const sg of [1, -1]) b.tube('br' + k + (sg > 0 ? 'L' : 'R'), [sg * X, y, tz], [sg * X, y, pz + 34], [6, 6], { mount: 'up' + (sg > 0 ? 'L' : 'R') });
  }
  /* стек грузов в башне за осью */
  stack(b, 'stk', [0, 0, pz + 18], H - 40, { w: 28, stackH: 70 });
};

/* ---------- «Капитанский стул» (станция для подъёма коленей) ----------
   s: back {z — плоскость спинки, y0, y1}; arm {x, y — верх упоров, z0, z1}; handle {x, y, z} — центр вертикальной рукояти. */
TYPES.captainsChair = (s, b) => {
  const T = 7, X = 34, bz = s.back.z, zr = bz - 12, a = s.arm;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [x, 3.75, zr - 30], [x, 3.75, a.z1 + 22], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [x, 7.5, zr], [x, a.y + 30, zr], [8, 8], { mount: 'base' + k });
    b.tube('strut' + k, [x, 7.5, zr - 26], [x, 80, zr - 2], [6, 6], { mount: 'base' + k });
    /* упор для предплечья на кронштейне от стойки */
    b.tube('armBar' + k, [x, a.y - 9, zr], [x, a.y - 9, a.z1 + 4], [6, 6], { mount: 'up' + k });
    b.tube('armLink' + k, [x, a.y - 9, a.z0 + 8], [sg * a.x, a.y - 9, a.z0 + 8], [5, 4], { mount: 'armBar' + k });
    b.tube('armLink2' + k, [x, a.y - 9, a.z1 - 4], [sg * a.x, a.y - 9, a.z1 - 4], [5, 4], { mount: 'armBar' + k });
    pad(b, 'arm' + k, [sg * a.x, a.y - T / 2, (a.z0 + a.z1) / 2], [11, T, a.z1 - a.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'armLink' + k, { round: 1.8 });
    /* вертикальная рукоять на конце упора */
    const h = s.handle;
    b.tube('hBase' + k, [x, a.y - 9, a.z1 + 4], [sg * h.x, a.y - 9, h.z], [4, 4], { mount: 'armBar' + k });
    handle(b, 'handle' + k, [sg * h.x, a.y - 9, h.z], [sg * h.x, h.y + 9, h.z], 1.6, 'hBase' + k);
    /* ступени для подъёма */
    b.tube('stepArm' + k, [x, 34, zr], [x, 34, a.z0 + 14], [5, 5], { mount: 'up' + k });
    b.box('step' + k, [sg * (X + 4), 35.5, a.z0 + 4], [18, 3, 24], { mount: 'stepArm' + k, tone: 'rubber', round: .5 });
  }
  b.tube('baseB', [-X - 4, 3.75, zr - 28], [X + 4, 3.75, zr - 28], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-X - 4, 3.75, a.z1 + 18], [X + 4, 3.75, a.z1 + 18], [8, 7.5], { mount: 'baseL' });
  b.tube('topX', [-X - 4, a.y + 26, zr], [X + 4, a.y + 26, zr], [8, 8], { mount: 'upL' });
  b.tube('midX', [-X, (s.back.y0 + s.back.y1) / 2, zr], [X, (s.back.y0 + s.back.y1) / 2, zr], [6, 6], { mount: 'upL' });
  b.tube('lowX', [-X, s.back.y0 + 4, zr], [X, s.back.y0 + 4, zr], [6, 6], { mount: 'upL' });
  pad(b, 'back', [0, (s.back.y0 + s.back.y1) / 2, bz - T / 2], [34, T, s.back.y1 - s.back.y0], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], 'midX');
};

/* ---------- Сидячий рычажный тренажёр (жим от груди, жим вверх, тяга с упором грудью) ----------
   s: seat {h, z0, z1}; pad {kind 'back' | 'chest', z — плоскость на высоте y0, ang — наклон назад от вертикали, y0, y1, w};
   hub {x, y, z} — оси рычагов (±x); tower {z, h} — башня со стеком (позади спинки или перед упором);
   foot {z, y} — подножка (необязательно). */
TYPES.seatedLever = (s, b) => {
  const T = 7, st = s.seat, pd = s.pad, hb = s.hub, tw = s.tower, TX = hb.x + 9;
  const zLo = Math.min(st.z0, tw.z) - 20, zHi = Math.max(st.z1, tw.z) + 20;
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * 30, 3.75, zLo], [sg * 30, 3.75, zHi], [8, 7.5], { mount: 'floor' });
  b.tube('baseS', [-34, 3.75, (st.z0 + st.z1) / 2], [34, 3.75, (st.z0 + st.z1) / 2], [8, 7.5], { mount: 'baseL' });
  b.tube('baseT', [-TX - 4, 3.75, tw.z], [TX + 4, 3.75, tw.z], [8, 7.5], { mount: 'baseL' });
  /* сиденье */
  const sc = [0, st.h - T / 2, (st.z0 + st.z1) / 2], under = pad(b, 'seat', sc, [38, T, st.z1 - st.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, sc[2]], [0, under[1] + .5, sc[2]], [8, 8], { mount: 'baseS' });
  /* спинка или грудной упор: плоскость z(y) = pd.z + (y − y0)·tan(ang)·dir */
  const a = pd.ang * D2R, dir = pd.kind === 'back' ? -1 : 1, up = [0, Math.cos(a), dir * Math.sin(a)], n = [0, Math.sin(a), -dir * Math.cos(a)];
  const L = pd.y1 - pd.y0, pc = V.add(V.add([0, pd.y0, pd.z], up, L / 2), n, -T / 2);
  const pb = pad(b, 'pad', pc, [pd.w || 34, T, L], [[1, 0, 0], n, up], 'padPost');
  const pp = V.add(pb, n, -.5);
  b.tube('padPost', [0, 7.5, pp[2]], pp, [7, 7], { mount: pd.kind === 'back' ? 'baseB' : 'baseC' });
  if (pd.kind === 'back') b.tube('baseB', [-30, 3.75, pp[2]], [30, 3.75, pp[2]], [8, 7.5], { mount: 'baseL' });
  else b.tube('baseC', [-30, 3.75, pp[2]], [30, 3.75, pp[2]], [8, 7.5], { mount: 'baseL' });
  /* башня: две стойки, верхняя поперечина, консоли к осям рычагов */
  const top = Math.max(tw.h, hb.y + 12);
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('up' + k, [sg * TX, 7.5, tw.z], [sg * TX, top, tw.z], [8, 8], { mount: 'baseT' });
    b.tube('hubArm' + k, [sg * TX, hb.y + 6, tw.z], [sg * TX, hb.y + 6, hb.z], [7, 7], { mount: 'up' + k });
    b.tube('hubDrop' + k, [sg * TX, hb.y + 6, hb.z], [sg * TX, hb.y, hb.z], [6, 6], { mount: 'hubArm' + k });
    b.cyl('hub' + k, [sg * (hb.x + 3), hb.y, hb.z], [1, 0, 0], 5, 9, { mount: 'hubDrop' + k, tone: 'chrome' });
  }
  b.tube('topX', [-TX - 4, top - 4, tw.z], [TX + 4, top - 4, tw.z], [8, 8], { mount: 'upL' });
  /* стек грузов за башней (со стороны от сиденья) */
  const sz = tw.z + (tw.z > st.z1 ? 24 : -24);
  stack(b, 'stk', [0, 0, sz], top - 8, { w: 30 });
  b.tube('stkLink', [0, 3.75, tw.z], [0, 3.75, sz + (sz > tw.z ? -10 : 10)], [8, 7.5], { mount: 'baseT' });
  /* подножка */
  if (s.foot) { b.tube('footBar', [-24, s.foot.y, s.foot.z], [24, s.foot.y, s.foot.z], 2, { mount: 'footPostL', tone: 'chrome' });
    for (const sg of [1, -1]) b.tube('footPost' + (sg > 0 ? 'L' : 'R'), [sg * 26, 3.75, s.foot.z], [sg * 26, s.foot.y + 2, s.foot.z], [5, 5], { mount: 'base' + (sg > 0 ? 'L' : 'R') }); }
};

/* ---------- Тренажёр отведения/приведения бёдер ----------
   Рычаги вращаются вокруг вертикальных осей под тазобедренными суставами. s: seat {c [y, z], ang, len};
   back {c0 [y, z], ang (от вертикали), len}; hub {x, y, z} — оси (±x), y — верх ступиц; handle {x, y, z}. */
TYPES.hipAbductor = (s, b) => {
  const T = 7, W = 40, hb = s.hub;
  const sa = s.seat.ang * D2R, sz = [0, Math.sin(sa), Math.cos(sa)], sy = [0, Math.cos(sa), -Math.sin(sa)], sl = s.seat.len;
  const sc = V.add([0, ...s.seat.c], sy, -T / 2), seatB = pad(b, 'seat', sc, [W, T, sl], [[1, 0, 0], sy, sz], 'hubPlate');
  const ba = s.back.ang * D2R, bz = [0, Math.cos(ba), -Math.sin(ba)], by = [0, Math.sin(ba), Math.cos(ba)], bl = s.back.len;
  const backB = pad(b, 'back', V.add(V.add([0, ...s.back.c0], bz, bl / 2), by, -T / 2), [W - 4, T, bl], [[1, 0, 0], by, bz], 'backStrut');
  /* плита ступиц под сиденьем, центральная стойка, основание */
  b.box('hubPlate', [0, seatB[1] - 1.5, hb.z], [30, 3, 24], { mount: 'post' });
  b.tube('post', [0, 7.5, hb.z - 14], [0, seatB[1] - 3, hb.z - 14], [8, 8], { mount: 'baseC' });
  b.tube('baseC', [0, 3.75, hb.z - 60], [0, 3.75, hb.z + 10], [8, 7.5], { mount: 'baseX' });
  b.tube('baseX', [-36, 3.75, hb.z - 50], [36, 3.75, hb.z - 50], [8, 7.5], { mount: 'floor' });
  b.tube('baseXF', [-30, 3.75, hb.z + 6], [30, 3.75, hb.z + 6], [8, 7.5], { mount: 'baseC' });
  for (const sg of [1, -1]) b.cyl('hub' + (sg > 0 ? 'L' : 'R'), [sg * hb.x, (hb.y - 12 + seatB[1] - 3) / 2, hb.z], [0, 1, 0], 4.2, seatB[1] - 3 - (hb.y - 12), { mount: 'hubPlate', tone: 'chrome' });
  b.tube('backStrut', [0, 7.5, hb.z - 46], V.add(backB, by, .5), [7, 7], { mount: 'baseX' });
  /* рукояти по бокам сиденья */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * s.handle.x, hz = s.handle.z - 9;
    b.tube('hArm' + k, [sg * 12, seatB[1] - 1, hz], [x, seatB[1] - 1, hz], [4, 3], { mount: 'hubPlate' });
    b.tube('hPost' + k, [x, seatB[1] - 1, hz], [x, s.handle.y, hz], [3.5, 3.5], { mount: 'hArm' + k });
    handle(b, 'handle' + k, [x, s.handle.y, hz], [x, s.handle.y, hz + 18], 1.6, 'hPost' + k);
  }
  /* стек грузов позади спинки */
  stack(b, 'stk', [0, 0, hb.z - 70], 140, { w: 30 });
  b.tube('stkLink', [0, 3.75, hb.z - 60], [0, 3.75, hb.z - 54], [8, 7.5], { mount: 'baseX' });
};

/* ---------- Подъём на носки сидя (рычаг с упором на бёдра) ----------
   s: seat {h, z0, z1}; step {y — верх, z — край под подушечками, w}; pivot [y, z] — ось рычага у пола впереди. */
TYPES.seatedCalf = (s, b) => {
  const T = 7, st = s.seat, sp = s.step, [py, pz] = s.pivot;
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * 33, 3.75, st.z0 - 10], [sg * 33, 3.75, pz + 14], [8, 7.5], { mount: 'floor' });
  b.tube('baseB', [-37, 3.75, st.z0 - 6], [37, 3.75, st.z0 - 6], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-37, 3.75, pz + 10], [37, 3.75, pz + 10], [8, 7.5], { mount: 'baseL' });
  const sc = [0, st.h - T / 2, (st.z0 + st.z1) / 2], under = pad(b, 'seat', sc, [38, T, st.z1 - st.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, sc[2]], [0, under[1] + .5, sc[2]], [8, 8], { mount: 'baseS' });
  b.tube('baseS', [-33, 3.75, sc[2]], [33, 3.75, sc[2]], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB2', [0, 3.75, st.z0 - 6], [0, 3.75, sp.z + 2], [8, 7.5], { mount: 'baseB' });
  /* ступень: брус с прорезиненным верхом, край — под подушечками стоп */
  b.box('step', [0, sp.y / 2, sp.z + 9], [sp.w || 50, sp.y, 18], { mount: 'floor', tone: 'frame', round: .6 });
  b.box('stepTop', [0, sp.y + .5, sp.z + 9], [(sp.w || 50) - 2, 1, 17], { mount: 'step', tone: 'rubber', round: .3 });
  /* стойки оси рычага */
  for (const sg of [1, -1]) b.tube('pivPost' + (sg > 0 ? 'L' : 'R'), [sg * 37, 7.5, pz], [sg * 37, py + 4, pz], [7, 7], { mount: 'base' + (sg > 0 ? 'L' : 'R') });
  b.tube('axle', [-40, py, pz], [40, py, pz], 2.2, { mount: 'pivPostL', tone: 'chrome' });
};

/* ---------- Подъём на носки стоя (вертикальная каретка с плечевыми упорами) ----------
   s: zr — плоскость направляющих позади тела; rx — полурасстояние между направляющими; step {y, z — край, w}; top. */
TYPES.standingCalf = (s, b) => {
  const zr = s.zr, rx = s.rx || 24, top = s.top || 222, sp = s.step;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('base' + k, [sg * (rx + 10), 3.75, zr - 40], [sg * (rx + 10), 3.75, sp.z + 30], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [sg * (rx + 10), 7.5, zr - 6], [sg * (rx + 10), top, zr - 6], [8, 8], { mount: 'base' + k });
    b.tube('rodLo' + k, [sg * (rx + 10), 40, zr - 6], [sg * rx, 40, zr], [5, 5], { mount: 'up' + k });
    b.tube('rodHi' + k, [sg * (rx + 10), top - 10, zr - 6], [sg * rx, top - 10, zr], [5, 5], { mount: 'up' + k });
    b.tube('rod' + k, [sg * rx, 38, zr], [sg * rx, top - 8, zr], 1.6, { mount: 'rodLo' + k, tone: 'chrome', role: 'guide' });
  }
  b.tube('topX', [-rx - 14, top - 4, zr - 6], [rx + 14, top - 4, zr - 6], [8, 8], { mount: 'upL' });
  b.tube('baseB', [-rx - 14, 3.75, zr - 36], [rx + 14, 3.75, zr - 36], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-rx - 14, 3.75, sp.z + 26], [rx + 14, 3.75, sp.z + 26], [8, 7.5], { mount: 'baseL' });
  /* ступень: подушечки стоп на заднем крае, пятки свисают назад */
  b.box('step', [0, sp.y / 2, sp.z + 12], [sp.w || 56, sp.y, 24], { mount: 'floor', round: .6 });
  b.box('stepTop', [0, sp.y + .5, sp.z + 12], [(sp.w || 56) - 2, 1, 23], { mount: 'step', tone: 'rubber', round: .3 });
  /* стек грузов позади направляющих */
  stack(b, 'stk', [0, 0, zr - 30], top - 10, { w: 30 });
};

/* ---------- Гакк-машина ----------
   Направляющие под 45° (вверх-назад); каретка со спинкой и плечевыми упорами — подвижная часть (BIND.g4sled).
   s: rail {a [y, z], b [y, z]} — осевая линия; rx — полуширина колеи; plate {c [y, z], ang (подъём носков), w, l}. */
TYPES.hackSquat = (s, b) => {
  const rx = s.rx || 22, A = [0, ...s.rail.a], B = [0, ...s.rail.b], d = unit(V.sub(B, A)), n = [0, d[2], -d[1]];
  const pl = s.plate, a = pl.ang * D2R, pu = [0, Math.cos(a), -Math.sin(a)], pf = [0, Math.sin(a), Math.cos(a)], pc = [0, ...pl.c];
  const zb = B[2] - 20, zf = pc[2] + pl.l / 2 + 10;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('base' + k, [sg * (rx + 14), 3.75, zb], [sg * (rx + 14), 3.75, zf], [8, 7.5], { mount: 'floor' });
    const a0 = V.add([sg * rx, A[1], A[2]], n, 6.5), b0 = V.add([sg * rx, B[1], B[2]], n, 6.5);
    b.tube('rb' + k, a0, b0, [8, 8], { mount: 'colLink' + k, up: n });
    b.tube('rail' + k, [sg * rx, A[1], A[2]], [sg * rx, B[1], B[2]], 2.5, { mount: 'rb' + k, tone: 'chrome', role: 'guide' });
    b.tube('col' + k, [sg * (rx + 14), 7.5, b0[2]], [sg * (rx + 14), b0[1] + 4, b0[2]], [8, 8], { mount: 'base' + k });
    b.tube('colLink' + k, [sg * (rx + 14), b0[1], b0[2]], [sg * rx, b0[1], b0[2]], [6, 6], { mount: 'col' + k });
    b.tube('leg' + k, [sg * (rx + 14), 7.5, a0[2] + 4], [sg * (rx + 14), a0[1], a0[2] + 4], [7, 7], { mount: 'base' + k });
    b.tube('legLink' + k, [sg * (rx + 14), a0[1] - 2, a0[2] + 4], [sg * rx, a0[1] - 2, a0[2] + 4], [6, 6], { mount: 'leg' + k });
    b.box('stop' + k, V.add([sg * rx, A[1], A[2]], d, 6), [7, 7, 5], { axes: [[1, 0, 0], n, d], mount: 'rail' + k, tone: 'rubber' });
  }
  b.tube('topX', [-rx - 18, B[1] + 2, B[2] + 4], [rx + 18, B[1] + 2, B[2] + 4], [8, 8], { mount: 'colL' });
  b.tube('baseF', [-rx - 18, 3.75, zf - 4], [rx + 18, 3.75, zf - 4], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-rx - 18, 3.75, zb + 4], [rx + 18, 3.75, zb + 4], [8, 7.5], { mount: 'baseL' });
  /* наклонная площадка для стоп */
  b.box('plate', V.add(pc, pu, -2), [pl.w, 4, pl.l], { axes: [[1, 0, 0], pu, pf], mount: 'plateFrame', tone: 'rubber', round: .5 });
  const under = V.add(pc, pu, -6);
  b.box('plateFrame', under, [pl.w - 6, 4, pl.l - 4], { axes: [[1, 0, 0], pu, pf], mount: 'plateLegF' });
  const lo = V.add(under, pf, -(pl.l / 2 - 6)), hi = V.add(under, pf, pl.l / 2 - 6);
  b.tube('plateLegB', [0, 7.5, lo[2]], V.add(lo, pu, -1.5), [7, 7], { mount: 'plateBase' });
  b.tube('plateLegF', [0, 7.5, hi[2]], V.add(hi, pu, -1.5), [7, 7], { mount: 'plateBase' });
  b.tube('plateBase', [0, 3.75, lo[2] - 8], [0, 3.75, zf - 4], [8, 7.5], { mount: 'baseF' });
};

/* ---------- Скамья для пресса с обратным наклоном ----------
   Доска опускается к головному концу (−Z). s: pad {hi [y, z] — верхний край поверхности, lo [y, z] — нижний},
   knee {c [y, z], r} — валик под коленями; ankle {c [y, z], r} — валик перед голеностопами. */
TYPES.declineBench = (s, b) => {
  const T = 6, W = 30, hi = [0, ...s.pad.hi], lo = [0, ...s.pad.lo], dz = unit(V.sub(hi, lo)), n = [0, dz[2], -dz[1]];
  const under = padAlong(b, 'pad', lo, hi, n, W, T, 'beam');
  const bl = V.add(V.add(lo, dz, 8), n, -T - 2 - 3), bh = V.add(V.add(hi, dz, -4), n, -T - 2 - 3);
  b.tube('beam', bl, bh, [8, 6], { mount: 'legB', up: n });
  b.tube('legB', [0, 7.5, bl[2] + 4], V.add(bl, n, -2.5), [7, 7], { mount: 'baseB' });
  b.tube('baseB', [-26, 3.75, bl[2] + 4], [26, 3.75, bl[2] + 4], [8, 7.5], { mount: 'floor' });
  b.tube('rail', [0, 3.75, bl[2]], [0, 3.75, s.ankle.c[1] + 16], [8, 7.5], { mount: 'baseB' });
  /* стойка у верхнего края: держит доску, валик под коленями и валики перед голеностопами */
  const kc = [0, ...s.knee.c], ac = [0, ...s.ankle.c], pz = Math.max(kc[2], ac[2]) + 14;
  b.tube('post', [0, 7.5, bh[2]], V.add(bh, n, -2.5), [8, 8], { mount: 'rail' });
  b.tube('legPost', [0, 7.5, pz], [0, Math.max(kc[1], ac[1]) + 3, pz], [7, 7], { mount: 'rail' });
  b.tube('baseF', [-26, 3.75, pz], [26, 3.75, pz], [8, 7.5], { mount: 'rail' });
  b.tube('kArm', [0, kc[1], pz], [0, kc[1], kc[2]], [5, 5], { mount: 'legPost' });
  b.tube('kAxle', [-20, kc[1], kc[2]], [20, kc[1], kc[2]], 1.4, { mount: 'kArm', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('knee' + (sg > 0 ? 'L' : 'R'), [sg * 9.5, kc[1], kc[2]], [1, 0, 0], s.knee.r, 15, { mount: 'kAxle', tone: 'pad', role: 'support' });
  b.tube('aArm', [0, ac[1], pz], [0, ac[1], ac[2]], [5, 5], { mount: 'legPost' });
  b.tube('aAxle', [-20, ac[1], ac[2]], [20, ac[1], ac[2]], 1.4, { mount: 'aArm', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('ankle' + (sg > 0 ? 'L' : 'R'), [sg * 9.5, ac[1], ac[2]], [1, 0, 0], s.ankle.r, 15, { mount: 'aAxle', tone: 'pad', role: 'support' });
};
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Домашние предметы группы G5b: стена, дверь в проёме с ручкой, обеденный стол, стул, степ-платформа,
   диван (упор для пяток), сложенный коврик-подушка. Размеры — типовые бытовые (см):
   стена — 240 высотой, 12 толщиной; межкомнатная дверь 80×200, ручка-рычаг на высоте 100;
   стол — столешница 120×75×3, верх на 75, ножки 5×5; стул — сиденье 44×42 на высоте 45, спинка до 90;
   степ-платформа 80×32, высота 17; диван — сиденье 45, опоры 13.
   Локальные оси каждого предмета: x — ширина, y — вверх, z — к человеку (лицевая сторона предмета смотрит в +z).
   Полотенце у двери охватывает шейку ручки и идёт к кистям; концы свисают из кулаков. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, toCat } = M, { TYPES, BIND } = E;

  /* Сцена скругляет рёбра коробок пропорционально размеру (~8 %); у больших панелей (стена, дверное полотно)
     углы выглядели бы овальными. Угловые вставки чуть тоньше панели закрывают скругление — углы прямые. */
  function squareCorners(b, k, cx, W, H, T, tone, y0 = 0, zc = -T / 2) {
    const cw = Math.min(W / 2, Math.max(4, .1 * W)), ch = Math.min(H / 2, Math.max(4, .1 * H));
    for (const [n, sx, sy] of [['BL', 1, 0], ['BR', -1, 0], ['TL', 1, 1], ['TR', -1, 1]])
      b.box(k + 'Corner' + n, [cx + sx * (W / 2 - cw / 2), y0 + (sy ? H - ch / 2 : ch / 2), zc], [cw, ch, T - .3], { tone, mount: k, round: .2 });
  }
  /* Стена: лицевая плоскость z = 0, тело стены z ∈ [−t, 0]; внизу деревянный плинтус */
  TYPES.homeWall = (s, b) => {
    const W = s.w || 180, H = s.h || 240, T = s.t || 12;
    b.box('panel', [0, H / 2, -T / 2], [W, H, T], { role: 'support', tone: 'wall', mount: 'floor', round: .3, contact: 'face' });
    squareCorners(b, 'panel', 0, W, H, T, 'wall');
    if (s.skirt !== false) b.box('skirt', [0, 3.5, .6], [W, 7, 1.2], { tone: 'wood', mount: 'panel', round: .2 });
    b.anchor('face', [0, 0, 0]);
  };

  /* Дверь в проёме: стена с проёмом, дверная коробка, наличники, полотно, упорная планка (притвор),
     петли и ручки-рычаги с обеих сторон. Дверь открывается от человека: притвор со стороны человека,
     поэтому при тяге полотно прижимается к коробке. side: +1 — ручка у края +x (локально). */
  TYPES.homeDoor = (s, b) => {
    const W = s.w || 220, H = s.h || 240, T = s.t || 12, dw = s.dw || 80, dh = s.dh || 200, hh = s.handleH || 100, sg = s.side || 1;
    const jt = 2.5, gap = .3, ow = dw / 2 + gap + jt, oh = dh + gap + jt;
    /* стена по обе стороны проёма и надпроёмная часть */
    for (const k of [1, -1]) b.box('wall' + (k > 0 ? 'L' : 'R'), [k * (ow + (W / 2 - ow) / 2), H / 2, -T / 2], [W / 2 - ow, H, T], { role: 'support', tone: 'wall', mount: 'floor', round: .3 });
    b.box('header', [0, (oh + H) / 2, -T / 2], [2 * ow, H - oh, T], { tone: 'wall', mount: 'wallL', round: .1 });
    squareCorners(b, 'header', 0, 2 * ow, H - oh, T, 'wall', oh);
    /* коробка */
    for (const k of [1, -1]) b.box('jamb' + (k > 0 ? 'L' : 'R'), [k * (dw / 2 + gap + jt / 2), oh / 2, -T / 2], [jt, oh, T], { tone: 'wood', mount: 'wall' + (k > 0 ? 'L' : 'R'), round: .2 });
    b.box('jambTop', [0, dh + gap + jt / 2, -T / 2], [2 * ow, jt, T], { tone: 'wood', mount: 'header', round: .2 });
    /* притвор (упорная планка) со стороны человека: z ∈ [−4, −2.5] */
    for (const k of [1, -1]) b.box('stop' + (k > 0 ? 'L' : 'R'), [k * (dw / 2 + gap - .7), dh / 2, -3.25], [1.4, dh, 1.5], { tone: 'wood', mount: 'jamb' + (k > 0 ? 'L' : 'R'), round: .2 });
    b.box('stopTop', [0, dh + gap - .7, -3.25], [dw + 2 * gap, 1.4, 1.5], { tone: 'wood', mount: 'jambTop', round: .2 });
    /* наличники */
    for (const k of [1, -1]) b.box('casing' + (k > 0 ? 'L' : 'R'), [k * (ow + 2.5), (oh + 6) / 2, .75], [7, oh + 6, 1.5], { tone: 'wood', mount: 'wall' + (k > 0 ? 'L' : 'R'), round: .3 });
    b.box('casingTop', [0, oh + 3, .75], [2 * ow + 12, 6, 1.5], { tone: 'wood', mount: 'header', round: .3 });
    /* полотно 4 см: z ∈ [−8, −4], зазор у пола 1 см; висит на петлях у края −sg */
    const leafZ = -6;
    b.box('leaf', [0, (dh + 1) / 2, leafZ], [dw, dh - 1, 4], { tone: 'wood', mount: 'hingeB', round: .3 });
    squareCorners(b, 'leaf', 0, dw, dh - 1, 4, 'wood', 1, leafZ);
    for (const k of [1, -1]) squareCorners(b, 'wall' + (k > 0 ? 'L' : 'R'), k * (ow + (W / 2 - ow) / 2), W / 2 - ow, H, T, 'wall');
    for (const [k, y] of [['B', 22], ['T', dh - 22]]) b.cyl('hinge' + k, [-sg * (dw / 2 + gap / 2), y, -8.6], [0, 1, 0], .8, 10, { tone: 'chrome', mount: 'jamb' + (sg > 0 ? 'R' : 'L') });
    /* ручки: розетка, шейка, рычаг к петлям; со стороны человека и с обратной */
    const hx = sg * (dw / 2 - 6);
    for (const [k, face, dir] of [['', -4, 1], ['Back', -8, -1]]) {
      b.cyl('rose' + k, [hx, hh, face + dir * .6], [0, 0, 1], 2.8, 1.2, { tone: 'chrome', mount: 'leaf' });
      b.cyl('neck' + k, [hx, hh, face + dir * 3.6], [0, 0, 1], 1.0, 5.2, { tone: 'chrome', mount: 'rose' + k });
      b.tube('lever' + k, [hx + sg * .6, hh, face + dir * 6.4], [hx - sg * 11.5, hh, face + dir * 7.4], 1.1, { tone: 'chrome', mount: 'neck' + k, role: 'grip' });
    }
    b.anchor('handle', [hx, hh, -4 + 3.4]);
    b.anchor('face', [0, 0, 0]);
  };

  /* Обеденный стол: столешница L×W×T, верх на высоте H; ножки 5×5 у углов; царги только по торцам,
     чтобы под длинным краем было свободно (тяга под столом за длинный край). */
  TYPES.homeTable = (s, b) => {
    const H = s.h || 75, L = s.len || 120, W = s.width || 75, T = s.t || 3, inset = 4, leg = 5;
    b.box('top', [0, H - T / 2, 0], [L, T, W], { role: 'support', tone: 'wood', mount: 'apronL', round: .5, contact: 'top' });
    const lx = L / 2 - inset - leg / 2, lz = W / 2 - inset - leg / 2;
    for (const [k, x, z] of [['FL', lx, lz], ['FR', -lx, lz], ['BL', lx, -lz], ['BR', -lx, -lz]]) b.tube('leg' + k, [x, 0, z], [x, H - T, z], [leg, leg], { tone: 'wood', mount: 'floor' });
    for (const k of [1, -1]) b.box('apron' + (k > 0 ? 'L' : 'R'), [k * lx, H - T - 4.5, 0], [2.5, 9, 2 * lz - leg], { tone: 'wood', mount: 'leg' + (k > 0 ? 'FL' : 'FR'), round: .3 });
    b.anchor('edgeF', [0, H, W / 2]);
    b.anchor('top', [0, H, 0]);
  };

  /* Стул: сиденье sw×sd×st, верх на seatH; передний край сиденья — +z; ножки 4×4, царги под сиденьем,
     задние ножки продолжаются в стойки спинки до высоты back. */
  TYPES.homeChair = (s, b) => {
    const H = s.seatH || 45, sw = s.sw || 44, sd = s.sd || 42, st = s.st || 3, back = s.back || 90, leg = 4;
    const lx = sw / 2 - 2.5 - leg / 2, zf = sd / 2 - 3 - leg / 2, zb = -(sd / 2 - 1 - leg / 2), ay = H - st;
    b.box('seat', [0, H - st / 2, 0], [sw, st, sd], { role: 'support', tone: 'wood', mount: 'apronF', round: .6, contact: 'top' });
    for (const [k, x] of [['L', lx], ['R', -lx]]) {
      b.tube('legF' + k, [x, 0, zf], [x, ay, zf], [leg, leg], { tone: 'wood', mount: 'floor' });
      b.tube('legB' + k, [x, 0, zb], [x, back, zb], [leg, leg], { tone: 'wood', mount: 'floor' });
      b.box('apron' + k, [x, ay - 3.5, (zf + zb) / 2], [2, 7, zf - zb - leg], { tone: 'wood', mount: 'legF' + k, round: .2 });
    }
    b.box('apronF', [0, ay - 3.5, zf], [2 * lx - leg, 7, 2], { tone: 'wood', mount: 'legFL', round: .2 });
    b.box('apronB', [0, ay - 3.5, zb], [2 * lx - leg, 7, 2], { tone: 'wood', mount: 'legBL', round: .2 });
    b.box('backRest', [0, back - 12, zb], [2 * lx - leg, 18, 2], { tone: 'wood', mount: 'legBL', round: .4 });
    b.box('backRail', [0, H + 12, zb], [2 * lx - leg, 5, 2], { tone: 'wood', mount: 'legBL', round: .3 });
    b.anchor('seatFront', [0, H, sd / 2]);
    b.anchor('seat', [0, H, 0]);
  };

  /* Степ-платформа: дека с резиновым покрытием на двух опорах по краям; верх на высоте h */
  TYPES.homeStep = (s, b) => {
    const H = s.h || 17, L = s.len || 80, D = s.depth || 32;
    b.box('top', [0, H - .4, 0], [L - 1, .8, D - 1], { role: 'support', tone: 'mat', mount: 'deck', round: .3, contact: 'top' });
    b.box('deck', [0, H - .8 - 2, 0], [L, 4, D], { tone: 'frame', mount: 'riserL', round: .8 });
    for (const k of [1, -1]) b.box('riser' + (k > 0 ? 'L' : 'R'), [k * (L / 2 - 8), (H - 4.8) / 2, 0], [14, H - 4.8, D - 2], { tone: 'frame', mount: 'floor', round: .6 });
    b.anchor('top', [0, H, 0]);
  };

  /* Диван: лицевая сторона z = 0, глубина d; низ каркаса на высоте опор (под него заводят пятки) */
  TYPES.homeSofa = (s, b) => {
    const W = s.w || 180, D = s.d || 88, hb = s.legH || 13, seat = s.seatH || 45, back = s.backH || 84, arm = s.armH || 62, aw = 16;
    for (const [k, x, z] of [['FL', W / 2 - 9, -7], ['FR', -(W / 2 - 9), -7], ['BL', W / 2 - 9, -D + 7], ['BR', -(W / 2 - 9), -D + 7]]) b.box('foot' + k, [x, hb / 2, z], [5, hb, 5], { tone: 'wood', mount: 'floor', round: .8 });
    b.box('base', [0, hb + (seat - 7 - hb) / 2, -D / 2], [W, seat - 7 - hb, D], { role: 'support', tone: 'pad', mount: 'footFL', round: 2 });
    b.box('cushion', [0, seat - 3.5, -D / 2 + 4], [W - 2 * aw, 7, D - 8], { role: 'support', tone: 'pad', mount: 'base', round: 2.5 });
    for (const k of [1, -1]) b.box('arm' + (k > 0 ? 'L' : 'R'), [k * (W / 2 - aw / 2), (seat - 7 + arm) / 2, -D / 2], [aw, arm - seat + 7, D], { tone: 'pad', mount: 'base', round: 3 });
    b.box('back', [0, (seat - 7 + back) / 2, -D + 10], [W - 2 * aw, back - seat + 7, 20], { tone: 'pad', mount: 'base', round: 3 });
    b.anchor('front', [0, hb, 0]);
  };

  /* Мягкая подушка / сложенный коврик на полу */
  TYPES.homeCushion = (s, b) => {
    const t = s.t || 4, w = s.w || 50, l = s.len || 60;
    b.box('pad', [0, t / 2, 0], [w, t, l], { role: 'support', tone: s.tone || 'pad', mount: 'floor', round: Math.min(1.5, t / 2 - .2) });
    b.anchor('top', [0, t, 0]);
  };

  /* Полотенце, охватывающее неподвижную точку (шейку дверной ручки): петля вокруг оси axis,
     две ветви к кистям и концы, свисающие из кулаков. Координаты from/axis — внутренние (Y вверх). */
  BIND.homeTowel = (e, R) => {
    const id = e.id || 'towel', r = e.r || 1.5, out = [], P = toCat(e.from), ax = V.unit([e.axis?.[0] ?? 0, -(e.axis?.[1] ?? 0), e.axis?.[2] ?? 1]);
    const hands = e.hands || ['L', 'R'], mid = V.mix(R.gripL, R.gripR, .5), toMid = V.unit(V.sub(mid, P));
    const side = V.unit(V.sub(R.gripL, R.gripR)), rr = (e.around || 1.0) + r;
    /* петля вокруг шейки: верхняя дуга (перекинута через шейку) */
    const up = V.unit(V.perp([0, -1, 0], ax)), sideAx = V.unit(V.cross(ax, up));
    const loop = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8; loop.push(V.add(V.add(P, sideAx, Math.cos(a) * rr), up, Math.sin(a) * rr)); }
    out.push({ kind: 'cable', pts: loop, r, tone: 'towel', role: 'grip', id: id + ':loop', mount: e.mountTo || 'floor' });
    for (const s of hands) {
      const g = R['grip' + s], hz = R.frames['hand' + s].z, start = V.add(P, sideAx, (s === 'L' ? 1 : -1) * (V.dot(side, sideAx) >= 0 ? 1 : -1) * rr);
      const into = V.dot(V.sub(start, g), hz) >= 0 ? 1 : -1, entry = V.add(g, hz, into * 3.2), exit = V.add(g, hz, -into * 4.2);
      const down = [0, 1, 0], tail = V.add(V.add(exit, hz, -into * 2.5), down, e.tail ?? 9);
      out.push({ kind: 'cable', pts: [start, entry, exit, tail], r, tone: 'towel', role: 'grip', id: id + ':' + s, mount: id + ':loop' });
    }
    return out;
  };

  /* Полотенце под стопой: середина под подошвой поперёк стопы, ветви поднимаются по сторонам стопы к кистям. */
  BIND.homeTowelFoot = (e, R) => {
    const id = e.id || 'towel', s = e.foot || 'R', r = e.r || 1.4, out = [], f = R.frames['foot' + s], t = R.frames['toes' + s];
    const g = M.SIGN[s], lat = V.scale(f.x, g); /* f.x в каталоге — левая сторона тела */
    const c = V.add(V.add(R['an' + s], f.z, e.at ?? 5), f.y, -(M.B.ankle + r - .4));
    const hw = 5.4 + r, a = V.add(c, lat, -hw), bb = V.add(c, lat, hw);
    out.push({ kind: 'cable', pts: [a, c, bb], r, tone: 'towel', role: 'grip', id: id + ':under', mount: 'body' });
    for (const h of e.hands || ['L', 'R']) {
      const gr = R['grip' + h], hz = R.frames['hand' + h].z, from = V.dot(V.sub(a, bb), V.sub(R['grip' + h], c)) > 0 ? a : bb;
      const into = V.dot(V.sub(from, gr), hz) >= 0 ? 1 : -1, entry = V.add(gr, hz, into * 3.2), exit = V.add(gr, hz, -into * 4.2);
      const rise = V.add(from, f.y, 3);
      out.push({ kind: 'cable', pts: [from, rise, entry, exit, V.add(V.add(exit, hz, -into * 2), [0, 1, 0], e.tail ?? 8)], r, tone: 'towel', role: 'grip', id: id + ':' + h, mount: id + ':under' });
    }
    return out;
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Тренажёры группы G6 (кардио): вертикальный велотренажёр, беговая дорожка, гребной тренажёр,
   эллиптический тренажёр, степпер. Размеры (см) — по типовым коммерческим образцам.
   Подвижные части (шатуны, педали, тяги, сиденье, рукоять с цепью) строятся по позе: педаль — под подошвой,
   рукоять — в кисти, сиденье — под тазом. Код выполняется в браузере: чистый JS без зависимостей. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, M3, D2R, toCat, dirCat } = M, { TYPES, BIND } = E;
  const lerp = (a, b, t) => a + (b - a) * t;
  const end = (a, b, k) => V.add(a, V.unit(V.sub(b, a)), k); /* точка на отрезке a→b в k см от a */

  /* ---------- Вертикальный велотренажёр ----------
     Начало координат — на полу под осью каретки, вперёд +Z. Параметры из раскладки позы:
     bbY — высота оси каретки (≈30), saddle [y, z] — верх седла и центр его задней части,
     bar [x, y, z] — середина хвата правой/левой рукой на руле (x — половина ширины хвата). */
  TYPES.uprightBike = (s, b) => {
    const bbY = s.bbY || 30, bb = [0, bbY, 0], sad = s.saddle, bar = s.bar, st = 72 * D2R, sd = [0, Math.sin(st), -Math.cos(st)];
    const onSeatTube = y => [0, y, -(y - bbY) / Math.tan(st)];
    /* основание: две опоры с резиновыми ножками и продольная балка */
    b.tube('stabF', [-28, 3.75, 50], [28, 3.75, 50], [8, 7.5], { mount: 'floor' });
    b.tube('stabR', [-26, 3.75, -50], [26, 3.75, -50], [8, 7.5], { mount: 'floor' });
    for (const [k, z, x] of [['F', 50, 28], ['R', -50, 26]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + 1), 3.75, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.tube('base', [0, 6.5, -50], [0, 6.5, 50], [7, 6], { mount: 'stabR' });
    /* каретка: корпус, ось шатунов; подседельная труба через каретку под углом 72°, стойка к основанию */
    const b0 = onSeatTube(9.5), clampY = sad[0] - 17, clamp = onSeatTube(clampY);
    b.tube('seatTube', b0, clamp, [6, 8], { mount: 'base' });
    b.tube('bbStrut', [0, 9.5, 14], end(bb, [0, 9.5, 14], 2), [6, 6], { mount: 'base' });
    b.cyl('bb', bb, [1, 0, 0], 3.4, 10, { mount: 'seatTube', tone: 'frame' });
    b.cyl('axle', bb, [1, 0, 0], 1.3, 17.4, { mount: 'bb', tone: 'chrome' });
    /* подседельный штырь, салазки и седло */
    const postTop = onSeatTube(sad[0] - 7.2);
    b.tube('seatPost', V.add(clamp, sd, -6), postTop, [3.4, 3.4], { mount: 'seatTube', tone: 'chrome' });
    b.box('clampKnob', V.add(clamp, [0, 0, -4.5]), [3, 3, 3], { mount: 'seatTube', tone: 'rubber', round: 1 });
    const zs0 = Math.min(postTop[2], sad[1] - 6) - 2, zs1 = Math.max(postTop[2], sad[1] + 9) + 2;
    b.tube('slider', [0, sad[0] - 6, zs0], [0, sad[0] - 6, zs1], [4.5, 2.4], { mount: 'seatPost', tone: 'chrome' });
    b.box('saddle', [0, sad[0] - 2.6, sad[1]], [19, 5.2, 15], { mount: 'slider', role: 'support', tone: 'pad', round: 2.2, contact: 'top' });
    b.box('saddle:mid', [0, sad[0] - 2.7, sad[1] + 9.5], [11, 4.8, 6], { mount: 'saddle', role: 'support', tone: 'pad', round: 1.8 });
    b.box('saddle:nose', [0, sad[0] - 2.7, sad[1] + 16.5], [6.5, 4.4, 10], { mount: 'saddle:mid', role: 'support', tone: 'pad', round: 1.6 });
    /* передняя стойка с выносом руля; маховик на вилке перед кареткой */
    const pBot = [0, 9, 47], pTop = [0, bar[1] - 7, bar[2] + 11], postAt = y => V.mix(pBot, pTop, (y - pBot[1]) / (pTop[1] - pBot[1]));
    b.tube('post', pBot, pTop, [7, 8], { mount: 'base' });
    const fw = [0, 36, 29];
    b.cyl('flywheel', fw, [1, 0, 0], 19, 3.6, { mount: 'hub', tone: 'chrome', sides: 40 });
    b.cyl('flywheel:rim', fw, [1, 0, 0], 19.6, 2.4, { mount: 'flywheel', tone: 'rubber', sides: 40 });
    b.cyl('hub', fw, [1, 0, 0], 3.2, 10, { mount: 'forkL', tone: 'frame' });
    for (const sx of [-1, 1]) b.tube('fork' + (sx > 0 ? 'L' : 'R'), [sx * 4.2, fw[1] + 2, postAt(fw[1] + 2)[2] - 2], [sx * 4.2, fw[1], fw[2]], [2.2, 4], { mount: 'post' });
    b.box('guard', V.mix(bb, fw, .5), [2, 9, V.dist(bb, fw) + 9], { axes: [[1, 0, 0], V.cross(V.unit(V.sub(fw, bb)), [1, 0, 0]), V.unit(V.sub(fw, bb))], mount: 'bb', round: 1.2 });
    b.cyl('knob', V.add(postAt(bar[1] - 25), [0, 0, 4.5]), [0, 0, 1], 2.4, 4, { mount: 'post', tone: 'rubber' });
    /* руль: вынос, поперечина с мягкими ручками и «рога» */
    const stem = [0, bar[1], bar[2] + 1];
    b.tube('stem', pTop, stem, [4.5, 4.5], { mount: 'post' });
    b.tube('bar', [-bar[0] - 6, bar[1], bar[2]], [bar[0] + 6, bar[1], bar[2]], 1.6, { mount: 'stem', role: 'grip', tone: 'rubber' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', a = [sx * (bar[0] + 6), bar[1], bar[2]];
      b.tube('horn' + k, a, [sx * (bar[0] + 7), bar[1] + 9, bar[2] + 16], 1.5, { mount: 'bar', tone: 'chrome' });
    }
    b.box('console', [0, bar[1] + 9, bar[2] + 12], [22, 14, 3.5], { axes: [[1, 0, 0], [0, Math.cos(.5), -Math.sin(.5)], [0, Math.sin(.5), Math.cos(.5)]], mount: 'consoleArm', tone: 'rubber', round: 1 });
    b.tube('consoleArm', V.add(pTop, [0, -2, 0]), [0, bar[1] + 6, bar[2] + 13], [3, 3], { mount: 'post' });
    b.anchor('axle', bb); b.anchor('saddleTop', [0, sad[0], sad[1]]);
  };
  /* Шатуны велотренажёра: плечи шатунов в плоскостях x = ±armX, ось педали — к педали под подушечкой стопы */
  BIND.bikeCrank = (e, R) => {
    const A = toCat(e.axle), id = e.id || 'crank', out = [], ax = e.armX || 8.2;
    for (const s of ['L', 'R']) {
      const g = s === 'L' ? 1 : -1, t = R.frames['toes' + s], ped = V.add(R['ball' + s], t.y, M.B.toeSole - 1.3);
      const a0 = [g * ax, A[1], A[2]], a1 = [g * ax, ped[1], ped[2]];
      out.push({ kind: 'beam', a: a0, b: a1, w: 3.6, h: 1.8, up: [1, 0, 0], tone: 'chrome', role: 'linkage', id: id + ':arm' + s, mount: e.mountTo });
      out.push({ kind: 'cyl', c: a0, axis: [1, 0, 0], r: 2.6, len: 1.8, tone: 'chrome', role: 'linkage', id: id + ':boss' + s, mount: id + ':arm' + s });
      out.push({ kind: 'beam', a: [g * (ax + .9), ped[1], ped[2]], b: ped, r: .75, tone: 'chrome', role: 'linkage', id: id + ':spindle' + s, mount: id + ':arm' + s });
      out.push({ kind: 'obox', c: ped, x: t.x, y: t.y, z: t.z, size: [10, 2.4, 9.5], round: .5, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':spindle' + s });
    }
    return out;
  };

  /* ---------- Беговая дорожка ----------
     Лента 150 × 50 см, верх ленты на высоте deckH (≈20), бегущий лицом к +Z. Боковые платформы, задняя
     заглушка, кожух двигателя спереди, стойки к консоли (≈130), боковые поручни (≈100) и передний поручень. */
  TYPES.treadmill = (s, b) => {
    const H = s.deckH || 20, z0 = s.z0 ?? -100, z1 = s.z1 ?? 50, zc = (z0 + z1) / 2, L = z1 - z0;
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R';
      b.box('side' + k, [sx * 30, (4 + H + 1) / 2, zc + 4], [10, H + 1 - 4, L + 16], { mount: 'foot' + k + 'B', role: 'support', round: 1.2 });
      b.box('tread' + k, [sx * 30, H + 1.3, zc - 2], [9, .6, L - 6], { mount: 'side' + k, tone: 'rubber', round: .3 });
      b.box('foot' + k + 'B', [sx * 30, 2, z0 + 2], [8, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
      b.box('foot' + k + 'F', [sx * 30, 2, z1 + 6], [8, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
    }
    b.box('deck', [0, H - 2.5, zc], [50, 3, L], { mount: 'sideL', tone: 'wood', round: .4 });
    b.box('belt', [0, H - .5, zc], [49.6, 1, L + 4], { mount: 'deck', role: 'support', tone: 'rubber', round: .4, contact: 'top' });
    for (const [k, z] of [['B', z0], ['F', z1]]) b.cyl('roller' + k, [0, H - 3.6, z], [1, 0, 0], 3.6, 49.4, { mount: 'sideL', tone: 'chrome' });
    b.box('endCap', [0, H - 6, z0 - 6], [70, 10, 4], { mount: 'sideL', round: 1.5 });
    /* кожух двигателя, стойки, консоль */
    b.box('hood', [0, 12.5, z1 + 22], [72, 25, 32], { mount: 'floor', round: 3 });
    const upB = x => [x * 33, 24, z1 + 30], upT = x => [x * 31, 124, z1 + 16];
    for (const sx of [-1, 1]) b.tube('up' + (sx > 0 ? 'L' : 'R'), upB(sx), upT(sx), [6, 9], { mount: 'hood' });
    const ca = 28 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', [0, 133, z1 + 12], [78, 24, 9], { axes: [[1, 0, 0], cy, cz], mount: 'upL', round: 2 });
    b.box('screen', V.add([0, 134, z1 + 12], cz, -4.7), [42, 15, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    /* поручни: боковые на высоте ≈100 и передний с датчиками пульса */
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', a = V.mix(upB(sx), upT(sx), (100 - 24) / 100), back = [sx * 33, 100, z1 - 32];
      b.tube('rail' + k, a, back, 1.9, { mount: 'up' + k, role: 'grip', tone: 'chrome' });
      b.tube('railEnd' + k, back, [sx * 33, 93, z1 - 38], 1.9, { mount: 'rail' + k, tone: 'rubber' });
    }
    const fy = 112, fz = V.mix(upB(1), upT(1), (fy - 24) / 100)[2] - 6;
    b.tube('frontBar', [-33, fy, fz], [33, fy, fz], 1.7, { mount: 'upL', role: 'grip', tone: 'chrome' });
    for (const sx of [-1, 1]) b.box('pulse' + (sx > 0 ? 'L' : 'R'), [sx * 16, fy, fz], [9, 4.2, 4.2], { mount: 'frontBar', tone: 'rubber', round: 1 });
    b.box('safetyKey', V.add(V.add([0, 133, z1 + 12], cy, -8), cz, -5.2), [4, 3, 1.5], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .5 });
    b.anchor('beltTop', [0, H, zc]);
  };

  /* ---------- Гребной тренажёр (тип «воздушный», как в залах) ----------
     Монорельс вдоль Z, гребец лицом к +Z. railTop — верх рельса (сиденье на ≈9 см выше), plate — центр
     подушечек стоп на упорах [x, y, z], beta — наклон упоров от горизонтали, exit — выход цепи из корпуса маховика. */
  TYPES.rowerErg = (s, b) => {
    const rt = s.railTop || 27, pl = s.plate, beta = (s.beta || 42) * D2R, ex = s.exit, z0 = s.railRear ?? -110, zf = ex[2] + 26;
    const pf = [0, Math.sin(beta), Math.cos(beta)], pn = [0, Math.cos(beta), -Math.sin(beta)];
    /* монорельс, задняя опора, передняя рама под корпусом маховика */
    b.tube('rail', [0, rt - 3, z0], [0, rt - 3, pl[2] + 12], [8, 6], { mount: 'rearPost', tone: 'chrome' });
    b.box('railStop', [0, rt + 1, z0 + 2], [6, 2.5, 3], { mount: 'rail', tone: 'rubber', round: .6 });
    b.tube('rearPost', [0, 0, z0 + 4], [0, rt - 3, z0 + 4], [7, 6], { mount: 'rearFoot' });
    b.tube('rearFoot', [-24, 2, z0 + 4], [24, 2, z0 + 4], [7, 4], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('rearCap' + (sx > 0 ? 'L' : 'R'), [sx * 25, 2, z0 + 4], [3, 4, 8], { mount: 'rearFoot', tone: 'rubber', round: .6 });
    b.tube('frontBeam', [0, rt - 3, pl[2] + 8], [0, 18, zf], [8, 7], { mount: 'rail' });
    b.tube('frontFoot', [-30, 2.5, zf], [30, 2.5, zf], [8, 5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('frontCap' + (sx > 0 ? 'L' : 'R'), [sx * 31, 2.5, zf], [3, 5, 9], { mount: 'frontFoot', tone: 'rubber', round: .6 });
    b.tube('frontLeg', [0, 4, zf], [0, 20, zf], [7, 7], { mount: 'frontFoot' });
    /* упоры для стоп: наклонные площадки с пятками-чашками и ремнями поперёк стопы */
    const pc = V.add(pl, pf, -6);
    b.box('plateBase', V.add(V.add([0, pc[1], pc[2]], pf, 4), pn, -3.2), [38, 3, 30], { axes: [[1, 0, 0], pn, pf], mount: 'plateStrut', round: 1 });
    b.tube('plateStrut', V.add([0, pc[1], pc[2]], pn, -4.5), [0, rt - 2, pc[2] + 9], [6, 6], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', c = V.add([sx * pl[0], pc[1], pc[2]], pn, -.8);
      b.box('plate' + k, c, [13, 1.6, 36], { axes: [[1, 0, 0], pn, pf], mount: 'plateBase', role: 'support', tone: 'rubber', round: .5 });
      b.box('heelCup' + k, V.add(V.add(c, pf, -16.5), pn, 3), [13, 6, 2], { axes: [[1, 0, 0], pn, pf], mount: 'plate' + k, tone: 'frame', round: .8 });
      b.box('strap' + k, V.add(V.add(c, pf, 4), pn, 8.6), [14, .8, 5], { axes: [[1, 0, 0], pn, pf], mount: 'strapPost' + k + 'o', tone: 'band', round: .3 });
      for (const sy of [-1, 1]) b.box('strapPost' + k + (sy > 0 ? 'o' : 'i'), V.add(V.add(V.add(c, pf, 4), pn, 4.6), [sy * 7.4 * sx, 0, 0]), [1.2, 8.4, 4], { axes: [[1, 0, 0], pn, pf], mount: 'plate' + k, tone: 'band', round: .3 });
    }
    /* корпус маховика (вентилятор в решётчатом кожухе), выход цепи, монитор на штанге */
    const fc = [0, ex[1] + 2, ex[2] + 26];
    b.cyl('fan', fc, [1, 0, 0], 27, 30, { mount: 'fanStand', tone: 'stack', sides: 40 });
    for (const sx of [-1, 1]) b.cyl('fanCover' + (sx > 0 ? 'L' : 'R'), [sx * 15.4, fc[1], fc[2]], [1, 0, 0], 22, 1.2, { mount: 'fan', tone: 'rubber', sides: 40 });
    b.box('fanStand', [0, (fc[1] - 26) / 2 + 9, fc[2] - 4], [16, fc[1] - 26 + 2, 18], { mount: 'frontBeam', round: 1.5 });
    b.box('chainGuide', [0, ex[1], ex[2] + 1.5], [10, 7, 5], { mount: 'fan', round: 1.2 });
    b.box('handleHook', [0, ex[1] - 4.4, ex[2] + 1.5], [12, 2, 4], { mount: 'chainGuide', tone: 'chrome', round: .6 });
    const mon = [0, fc[1] + 44, fc[2] - 34];
    b.tube('monArm', [0, fc[1] + 24, fc[2] - 8], mon, [3.2, 3.2], { mount: 'fan', tone: 'chrome' });
    const ma = 25 * D2R, my = [0, Math.cos(ma), Math.sin(ma)], mz = [0, -Math.sin(ma), Math.cos(ma)];
    b.box('monitor', V.add(mon, mz, -1), [20, 16, 4], { axes: [[1, 0, 0], my, mz], mount: 'monArm', tone: 'rubber', round: 1.2 });
    b.anchor('exit', ex);
  };
  /* Сиденье гребного тренажёра: подушка под тазом, каретка с роликами на монорельсе */
  BIND.rowerSeat = (e, R) => {
    const id = e.id || 'seat', top = e.top || 36, rt = e.railTop || 27, z = R.hip[2] + (e.shift || 0), x = R.hip[0];
    const C = (y, dz = 0) => toCat([x, y, 0]).map((v, i) => i === 2 ? z + dz : v);
    return [
      { kind: 'obox', c: C(top - 2.5), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [e.w || 26, 5, e.l || 30], round: 2, tone: 'pad', role: 'support', id: id + ':pad', mount: id + ':car' },
      { kind: 'obox', c: C(rt + 3.5), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [16, 4.2, 20], round: .8, tone: 'frame', role: 'carriage', id: id + ':car', mount: id + ':wheelF' },
      { kind: 'cyl', c: C(rt + 1.4, 7), axis: [1, 0, 0], r: 1.4, len: 12, tone: 'rubber', role: 'carriage', id: id + ':wheelF', mount: e.mountTo },
      { kind: 'cyl', c: C(rt + 1.4, -7), axis: [1, 0, 0], r: 1.4, len: 12, tone: 'rubber', role: 'carriage', id: id + ':wheelB', mount: e.mountTo }
    ];
  };
  /* Рукоять на цепи: прямая рукоять с резиновыми ручками под кистями, цепь от выхода корпуса к середине рукояти */
  BIND.rowerChain = (e, R) => {
    const id = e.id || 'chain', ex = toCat(e.exit), a = R.gripL, c = R.gripR, ax = V.unit(V.sub(a, c)), mid = V.mix(a, c, .5), ext = e.ext || 7;
    const hook = V.add(mid, V.unit(V.sub(ex, mid)), 2.2);
    return [
      { kind: 'beam', a: V.add(a, ax, -5), b: V.add(c, ax, 5), r: 1.5, tone: 'chrome', role: 'frame', id: id + ':bar', mount: id + ':link' },
      { kind: 'beam', a: V.add(a, ax, -5), b: V.add(a, ax, ext), r: 1.8, tone: 'rubber', role: 'grip', id: id + ':handleL', mount: id + ':bar' },
      { kind: 'beam', a: V.add(c, ax, 5), b: V.add(c, ax, -ext), r: 1.8, tone: 'rubber', role: 'grip', id: id + ':handleR', mount: id + ':bar' },
      { kind: 'beam', a: mid, b: hook, r: 1.1, tone: 'chrome', role: 'frame', id: id + ':link', mount: id + ':line' },
      { kind: 'cable', pts: [ex, hook], r: .6, tone: 'cable', role: 'cable', id: id + ':line', mount: e.mountTo }
    ];
  };

  /* ---------- Эллиптический тренажёр (передний привод) ----------
     Маховик и ось шатунов в корпусе у основания передней стойки; длинные тяги педалей: передний конец — на пальце
     шатуна, задний — роликом на направляющей; рукояти качаются на оси стойки и связаны с шатуном тягой.
     Параметры раскладки: axle [y, z], pivot [x, y, z] — оси рукоятей, trackY — верх направляющих роликов. */
  TYPES.elliptical = (s, b) => {
    const A = [0, s.axle[0], s.axle[1]], H = s.pivot, ty = s.trackY || 8, tz0 = s.trackZ[0], tz1 = s.trackZ[1];
    const colB = [0, 8, H[2] + 14], colT = [0, 150, H[2] - 8], colAt = y => V.mix(colB, colT, (y - colB[1]) / (colT[1] - colB[1]));
    /* основание, опоры, направляющие роликов */
    b.tube('base', [0, 4, tz0 - 4], [0, 4, colB[2] + 22], [9, 8], { mount: 'stabR' });
    b.tube('stabF', [-30, 3.5, colB[2] + 18], [30, 3.5, colB[2] + 18], [8, 7], { mount: 'floor' });
    b.tube('stabR', [-32, 3.5, tz0 + 2], [32, 3.5, tz0 + 2], [8, 7], { mount: 'floor' });
    for (const [k, z, x] of [['F', colB[2] + 18, 30], ['R', tz0 + 2, 32]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + 1), 3.5, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.tube('trackX', [-16, 3.5, tz1 - 6], [16, 3.5, tz1 - 6], [7, 7], { mount: 'base' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * s.barX;
      b.tube('track' + k, [x, ty - 3.5, tz0], [x, ty - 3.5, tz1], [6, 7], { mount: 'stabR', tone: 'chrome' });
      b.box('trackEnd' + k, [x, ty + 1, tz0 + 1], [7, 2.5, 2], { mount: 'track' + k, tone: 'rubber', round: .5 });
    }
    /* корпус маховика, ось шатунов, стойка, ось рукоятей, консоль */
    b.box('shroud', [0, 34, A[2] + 3], [13, 60, 52], { mount: 'base', round: 6 });
    b.cyl('axle', A, [1, 0, 0], 2.2, 19, { mount: 'shroud', tone: 'chrome' });
    b.tube('column', colB, colT, [8, 10], { mount: 'base' });
    b.tube('pivotBar', [-H[0] - 3, H[1], H[2]], [H[0] + 3, H[1], H[2]], 2.4, { mount: 'column', tone: 'chrome' });
    for (const sx of [-1, 1]) b.cyl('hub' + (sx > 0 ? 'L' : 'R'), [sx * H[0], H[1], H[2]], [1, 0, 0], 3.4, 6, { mount: 'pivotBar', tone: 'frame' });
    const ca = 30 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', V.add(colT, [0, 6, -3]), [40, 22, 8], { axes: [[1, 0, 0], cy, cz], mount: 'column', round: 2 });
    b.box('screen', V.add(V.add(colT, [0, 6, -3]), cz, -4.2), [24, 14, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    const fy = colT[1] - 22, fz = colAt(fy)[2] - 9;
    b.tube('fixedBar', [-14, fy, fz], [14, fy, fz], 1.6, { mount: 'fixedArm', tone: 'rubber' });
    b.tube('fixedArm', colAt(fy), [0, fy, fz], [4, 4], { mount: 'column' });
    b.anchor('axle', A);
  };
  /* Тяги эллипса по позе: педаль — под стопой, тяга от ролика на направляющей к пальцу шатуна, шатун на оси;
     рукоять — от кисти через ось качания к нижнему рычагу и тяге к тяге педали. */
  BIND.ellipticalLinks = (e, R) => {
    const id = e.id || 'ell', out = [], toI = p => [p[0], M.FLOOR - p[1], p[2]], dI = d => [d[0], -d[1], d[2]];
    const dl = (e.delta || 8) * D2R, A = [0, e.axle[0], e.axle[1]];
    for (const s of ['L', 'R']) {
      /* рамка пальцев стопы лежит на педали (пятка может слегка приподниматься в конце шага) */
      const g = s === 'L' ? 1 : -1, f = R.frames['toes' + s], up = dI(f.y), fw = dI(f.z), side = dI(f.x);
      const sole = V.add(V.add(toI(R['ball' + s]), up, -2), fw, -10);
      const pc = V.add(sole, up, -1.3), ub = V.add(V.scale(fw, Math.cos(dl)), up, Math.sin(dl)), nb = V.add(V.scale(up, Math.cos(dl)), fw, -Math.sin(dl));
      const pb = V.add(pc, nb, -e.standoff), cp = V.add(pb, ub, (1 - e.frac) * e.barLen), rr = V.add(pb, ub, -e.frac * e.barLen);
      const P = p => toCat(p), D = d => dirCat(V.unit(d));
      const ax = [g * e.armX, A[1], A[2]], pin = [g * e.armX, cp[1], cp[2]];
      out.push({ kind: 'beam', a: P(ax), b: P(pin), w: 4, h: 2, up: [1, 0, 0], tone: 'chrome', role: 'linkage', id: id + ':crank' + s, mount: e.mountTo });
      out.push({ kind: 'beam', a: P(V.add(pin, [g * 1, 0, 0])), b: P(cp), r: 1.2, tone: 'chrome', role: 'linkage', id: id + ':pin' + s, mount: id + ':crank' + s });
      out.push({ kind: 'beam', a: P(V.add(rr, ub, -3)), b: P(V.add(cp, ub, 3)), w: 4.5, h: 4, up: D(side), tone: 'frame', role: 'linkage', id: id + ':bar' + s, mount: id + ':pin' + s });
      out.push({ kind: 'cyl', c: P(rr), axis: [1, 0, 0], r: 4, len: 3.4, tone: 'rubber', role: 'linkage', id: id + ':roller' + s, mount: id + ':bar' + s });
      out.push({ kind: 'beam', a: P(V.add(pb, nb, 1.5)), b: P(V.add(pc, nb, -1)), w: 6, h: 6, up: D(fw), tone: 'frame', role: 'linkage', id: id + ':bracket' + s, mount: id + ':bar' + s });
      out.push({ kind: 'obox', c: P(pc), x: D(side), y: D(up), z: D(fw), size: [15, 2.4, 36], round: .8, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':bracket' + s });
      out.push({ kind: 'obox', c: P(V.add(V.add(pc, fw, -17.4), up, 2.4)), x: D(side), y: D(up), z: D(fw), size: [15, 3, 1.4], round: .4, tone: 'frame', role: 'pedal', id: id + ':heelStop' + s, mount: id + ':pedal' + s });
      /* рукоять: положение рычага восстанавливается по кисти G и оси качания H (рукоять жёсткая: G − H
         повёрнут относительно рычага на постоянный угол), ручка повёрнута относительно рычага на bend */
      const H = [g * e.pivot[0], e.pivot[1], e.pivot[2]], G = toI(R['grip' + s]), bd = e.bend * D2R;
      const ga = Math.atan2(e.grip * Math.sin(bd), e.upper + e.grip * Math.cos(bd)), vn = Math.hypot(G[1] - H[1], G[2] - H[2]), vy = (G[1] - H[1]) / vn, vz = (G[2] - H[2]) / vn;
      const u = [0, vy * Math.cos(ga) + vz * Math.sin(ga), vz * Math.cos(ga) - vy * Math.sin(ga)];
      const w = [0, u[1] * Math.cos(bd) - u[2] * Math.sin(bd), u[2] * Math.cos(bd) + u[1] * Math.sin(bd)];
      const E = V.add(H, u, -e.lever), K = V.add(H, u, e.upper);
      out.push({ kind: 'beam', a: P(E), b: P(K), r: 2, tone: 'frame', role: 'linkage', id: id + ':arm' + s, mount: e.mountHub + s });
      out.push({ kind: 'beam', a: P(K), b: P(V.add(G, w, -7)), r: 2, tone: 'frame', role: 'linkage', id: id + ':upright' + s, mount: id + ':arm' + s });
      out.push({ kind: 'beam', a: P(V.add(G, w, -7)), b: P(V.add(G, w, 10)), r: 1.9, tone: 'rubber', role: 'grip', id: id + ':handle' + s, mount: id + ':upright' + s });
      const lb = V.add(V.add(cp, ub, -e.linkAt), [g * 2.3, 0, 0]);
      out.push({ kind: 'beam', a: P(E), b: P(lb), r: 1.3, tone: 'chrome', role: 'linkage', id: id + ':link' + s, mount: id + ':arm' + s });
    }
    return out;
  };

  /* ---------- Степпер (лестница) ----------
     Две педали на длинных рычагах с осью у основания передней стойки; педали держатся горизонтально
     параллельной тягой, ход рычагов гасят цилиндры; боковые поручни на высоте railY, консоль на стойке.
     pivot [x, y, z] — ось рычага левой педали, railZ — задний конец поручней. */
  TYPES.stepper = (s, b) => {
    const pv = s.pivot, ry = s.railY, rx = s.railX || 29, rz = s.railZ, zb = rz - 12;
    b.tube('base', [0, 4, zb], [0, 4, pv[2] + 22], [10, 8], { mount: 'stabR' });
    b.tube('stabF', [-34, 3.5, pv[2] + 18], [34, 3.5, pv[2] + 18], [8, 7], { mount: 'floor' });
    b.tube('stabR', [-34, 3.5, zb + 4], [34, 3.5, zb + 4], [8, 7], { mount: 'floor' });
    for (const [k, z] of [['F', pv[2] + 18], ['R', zb + 4]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * 35, 3.5, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.box('pivotBlock', [0, pv[1], pv[2] + 4], [12, 16, 14], { mount: 'base', round: 1.5 });
    b.cyl('pivotAxle', [0, pv[1], pv[2]], [1, 0, 0], 2, 2 * pv[0] + 8, { mount: 'pivotBlock', tone: 'chrome' });
    b.cyl('linkAxle', [0, pv[1] + 14, pv[2] + 10 - (pv[1] + 6) * 16 / 134], [1, 0, 0], 1.4, 2 * pv[0] + 6, { mount: 'column', tone: 'chrome' });
    b.tube('dampBase', [-pv[0] - 4, 3.5, zb + 22], [pv[0] + 4, 3.5, zb + 22], [6, 7], { mount: 'base' });
    /* передняя стойка, консоль, поручни */
    const cB = [0, 8, pv[2] + 10], cT = [0, 142, pv[2] - 6];
    b.tube('column', cB, cT, [10, 12], { mount: 'base' });
    const ca = 30 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', V.add(cT, [0, 6, -4]), [42, 22, 8], { axes: [[1, 0, 0], cy, cz], mount: 'column', round: 2 });
    b.box('screen', V.add(V.add(cT, [0, 6, -4]), cz, -4.2), [26, 14, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    const fz = V.mix(cB, cT, (ry - cB[1]) / (cT[1] - cB[1]))[2] - 4;
    b.tube('railFront', [-rx, ry, fz], [rx, ry, fz], 2, { mount: 'railCol', tone: 'chrome' });
    b.tube('railCol', V.mix(cB, cT, (ry - cB[1]) / (cT[1] - cB[1])), [0, ry, fz], [5, 5], { mount: 'column' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R';
      b.tube('rail' + k, [sx * rx, ry, fz], [sx * rx, ry, rz], 2, { mount: 'railFront', role: 'grip', tone: 'chrome' });
      b.tube('railPost' + k, [sx * rx, ry, rz], [sx * rx, 4, rz - 10], 2.4, { mount: 'rail' + k, tone: 'chrome' });
      b.box('railFoot' + k, [sx * rx, 2, rz - 11], [6, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
      b.box('pulse' + k, [sx * rx, ry, fz + 3 - 14], [4.4, 4.4, 9], { mount: 'rail' + k, tone: 'rubber', round: 1 });
    }
    b.anchor('pivot', pv);
  };
  /* Педали степпера: площадка под стопой (рамка пальцев), рычаг к оси, параллельная тяга, цилиндр-демпфер */
  BIND.stepPedals = (e, R) => {
    const id = e.id || 'step', out = [], toI = p => [p[0], M.FLOOR - p[1], p[2]], dI = d => [d[0], -d[1], d[2]], P = p => toCat(p), D = d => dirCat(V.unit(d));
    for (const s of ['L', 'R']) {
      const g = s === 'L' ? 1 : -1, f = R.frames['toes' + s], up = dI(f.y), fw = dI(f.z), side = dI(f.x);
      const pc = V.add(V.add(V.add(toI(R['ball' + s]), up, -2), fw, -9), up, -1.4);
      const pv = [g * e.pivot[0], e.pivot[1], e.pivot[2]], le = [pv[0], pc[1] - 6, pc[2] + 21], lt = V.add(le, [0, 14, 0]), la = [pv[0], pv[1] + 14, pv[2] - 2];
      out.push({ kind: 'obox', c: P(pc), x: D(side), y: D(up), z: D(fw), size: [17, 2.8, 36], round: .8, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':bracket' + s });
      out.push({ kind: 'obox', c: P(V.add(V.add(pc, up, -2.8), [0, 0, 4])), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [12, 3, 38], round: .6, tone: 'frame', role: 'linkage', id: id + ':bracket' + s, mount: id + ':post' + s });
      out.push({ kind: 'beam', a: P(V.add(le, [0, -2, 0])), b: P(V.add(lt, [0, 2, 0])), w: 4, h: 4, up: [0, 0, 1], tone: 'frame', role: 'linkage', id: id + ':post' + s, mount: id + ':lever' + s });
      out.push({ kind: 'beam', a: P(pv), b: P(le), w: 5, h: 4, up: [1, 0, 0], tone: 'frame', role: 'linkage', id: id + ':lever' + s, mount: e.mountTo });
      out.push({ kind: 'beam', a: P(la), b: P(lt), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':link' + s, mount: id + ':post' + s });
      const db = [pv[0], 7, e.dampZ], dt = V.mix(pv, le, .55), dm = V.mix(db, dt, .55);
      out.push({ kind: 'beam', a: P(db), b: P(dm), r: 2.3, tone: 'stack', role: 'linkage', id: id + ':damper' + s, mount: e.mountDamp });
      out.push({ kind: 'beam', a: P(V.add(dm, V.unit(V.sub(dm, db)), -2)), b: P(V.add(dt, [0, -2, 0])), r: 1, tone: 'chrome', role: 'linkage', id: id + ':rod' + s, mount: id + ':damper' + s });
    }
    return out;
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));

/* Сгенерировано tools/mannequin/author.js — не править вручную. Ключи поз манекена и инвентарь упражнений. */
const CATALOG_POSES={
"shrug":{"keys":[{"t":0,"v":[0,94.34,3.68,1,0,0,0,0,0,0,0,0,0,3,0,0,-3,3,-2.45,11.54,-5.36,5,2,0,0,-0.53,2.13,18.9,4,3.82,2.18,0,-3,3,-2.45,11.54,-5.36,5,2,0,0,-0.53,2.13,18.9,4,3.82,2.18,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94.33,3.93,1,0,0,0,0,0,0,0,0,0,3,0,0,14.5,1,-2.45,11.54,-5.36,5,2,0,0,-0.7,2.13,18.91,4,3.97,2.24,0,14.5,1,-2.45,11.54,-5.36,5,2,0,0,-0.7,2.13,18.91,4,3.97,2.24,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.32,4.18,1,0,0,0,0,0,0,0,0,0,3,0,0,32,-1,-2.45,11.54,-5.36,5,2,0,0,-0.87,2.13,18.91,4,4.13,2.29,0,32,-1,-2.45,11.54,-5.36,5,2,0,0,-0.87,2.13,18.91,4,4.13,2.29,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"deadlift":{"keys":[{"t":0,"v":[0,64.91,-27.61,0.89809,0.43981,0,0,8,0,0,7,0,0,-16,0,0,0,6,62.19,15.3,-22.31,5.16,59.15,0.04,9.79,119.6,20.95,21.12,86.12,16.28,-2.67,0,0,6,62.19,15.3,-22.31,5.16,59.15,0.04,9.79,119.6,20.95,21.12,86.12,16.28,-2.67,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1,"v":[0,73.72,-29.05,0.88695,0.46187,0,0,8,0,0,8,0,0,-14,0,0,0,6,66.1,15.75,-21.74,5.16,59.1,0.04,9.79,111.86,15.32,18.27,67.7,9.37,-2.53,0,0,6,66.1,15.75,-21.74,5.16,59.1,0.04,9.79,111.86,15.32,18.27,67.7,9.37,-2.53,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,78.33,-28.58,0.89187,0.4523,0,0,6,0,0,7,0,0,-13,0,0,0,6,62.25,15.31,-22.42,5.16,59.03,0.04,9.79,104.03,12,16.32,57.26,5.99,-2.29,0,0,6,62.25,15.31,-22.42,5.16,59.03,0.04,9.79,104.03,12,16.32,57.26,5.99,-2.29,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,84.28,-25.75,0.91455,0.40448,0,0,3,0,0,3,0,0,-9,0,0,0,6,50.4,14.22,-24.37,5.16,58.78,0.04,9.78,87.6,7.92,13.73,42.81,2.34,-1.74,0,0,6,50.4,14.22,-24.37,5.16,58.78,0.04,9.78,87.6,7.92,13.73,42.81,2.34,-1.74,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,87.31,-18.89,0.95115,0.30872,0,0,1,0,0,2,0,0,-6,0,0,0,6,36.85,13.35,-26.38,5.16,58.53,0.04,9.77,68.77,6.19,12.12,38.97,5.66,-0.81,0,0,6,36.85,13.35,-26.38,5.16,58.53,0.04,9.77,68.77,6.19,12.12,38.97,5.66,-0.81,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,90.49,-10.43,0.97755,0.21071,0,0,0,0,0,0,0,0,-3,0,0,0,6,23.38,12.8,-28.25,5.16,58.27,0.04,9.76,47.49,4.74,10.94,31.96,8.35,0.25,0,0,6,23.38,12.8,-28.25,5.16,58.27,0.04,9.76,47.49,4.74,10.94,31.96,8.35,0.25,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.44,-0.92,1,0,0,0,0,0,0,0,0,0,0,0,0,-2,-6,11.93,13.66,-34.07,5.12,53.59,0,10.55,2.42,1.78,9.97,3.62,0.93,1.34,0,-2,-6,11.93,13.66,-34.07,5.12,53.59,0,10.55,2.42,1.78,9.97,3.62,0.93,1.34,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"barbell","id":"bar","plates":[20,20]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"rdl":{"keys":[{"t":0,"v":[0,94.16,-0.18,1,0,0,0,0,0,0,0,0,0,0,0,0,0,-4,12.23,17.74,-34.75,5.11,52.11,-0.02,14.5,5.17,1.33,5.96,10,4.72,0.79,0,0,-4,12.23,17.74,-34.75,5.11,52.11,-0.02,14.5,5.17,1.33,5.96,10,4.72,0.79,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93.44,-6.01,0.98163,0.19081,0,0,1,0,0,2,0,0,-4,0,0,0,-1.5,21.14,17.57,-27.15,5.15,58.28,0.03,14.5,34.11,1.74,6.29,16,3.78,0.38,0,0,-1.5,21.14,17.57,-27.15,5.15,58.28,0.03,14.5,34.11,1.74,6.29,16,3.78,0.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,92.06,-11.93,0.93358,0.35837,0,0,3,0,0,5,0,0,-8,0,0,0,1,35.81,18.06,-21.97,5.14,61.1,0.03,14.42,61.2,2.37,6.83,22,2.68,-0.04,0,0,1,35.81,18.06,-21.97,5.14,61.1,0.03,14.42,61.2,2.37,6.83,22,2.68,-0.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,90.23,-16.81,0.88295,0.46947,0,0,5,0,0,9,0,0,-11,0,0,0,3.5,53.19,19.47,-18.44,5.14,61.58,0.03,14.28,81.7,3.25,7.53,28,2.16,-0.4,0,0,3.5,53.19,19.47,-18.44,5.14,61.58,0.03,14.28,81.7,3.25,7.53,28,2.16,-0.4,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,88.68,-18.25,0.83389,0.55194,0,0,7,0,0,11,0,0,-13,0,0,0,6,65.43,20.99,-15.53,5.13,62.09,0.03,14.18,96.88,4.37,8.35,34,3.92,-0.51,0,0,6,65.43,20.99,-15.53,5.13,62.09,0.03,14.18,96.88,4.37,8.35,34,3.92,-0.51,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"barbell","id":"bar","plates":[20],"optional":"bb"},{"type":"dumbbell","id":"dbL","hand":"L","optionalNot":"bb"},{"type":"dumbbell","id":"dbR","hand":"R","optionalNot":"bb"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}]},
"bbrow":{"keys":[{"t":0,"v":[0,90.02,-20.66,0.92718,0.37461,0,0,3,0,0,5,0,0,-10,0,0,2,10,51.46,9.26,-26.44,5.26,59.11,0.04,5.37,70.21,4.07,9.58,24,-2.46,-0.49,0,2,10,51.46,9.26,-26.44,5.26,59.11,0.04,5.37,70.21,4.07,9.58,24,-2.46,-0.49,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,90.02,-20.66,0.92718,0.37461,0,0,3,0,0,5,0,0,-10,0,0,1.41,6.19,23.3,21.81,-19.73,57.86,59.1,-0.84,-7.68,70.21,4.07,9.58,24,-2.46,-0.49,0,1.41,6.19,23.3,21.81,-19.73,57.86,59.1,-0.84,-7.68,70.21,4.07,9.58,24,-2.46,-0.49,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,90.02,-20.66,0.92718,0.37461,0,0,3,0,0,5,0,0,-10,0,0,0,-3,-1.08,29.43,-16.17,91.08,60.59,-2.94,-14.33,70.21,4.07,9.58,24,-2.46,-0.49,0,0,-3,-1.08,29.43,-16.17,91.08,60.59,-2.94,-14.33,70.21,4.07,9.58,24,-2.46,-0.49,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,90.02,-20.66,0.92718,0.37461,0,0,3,0,0,5,0,0,-10,0,0,-1.41,-12.19,-23.42,33.3,-13.35,109.18,61.77,-4.94,-14.73,70.21,4.07,9.58,24,-2.46,-0.49,0,-1.41,-12.19,-23.42,33.3,-13.35,109.18,61.77,-4.94,-14.73,70.21,4.07,9.58,24,-2.46,-0.49,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,90.02,-20.66,0.92718,0.37461,0,0,3,0,0,5,0,0,-10,0,0,-2,-16,-33.02,34.09,-12.08,113.88,62,-5.82,-13.3,70.21,4.07,9.58,24,-2.46,-0.49,0,-2,-16,-33.02,34.09,-12.08,113.88,62,-5.82,-13.3,70.21,4.07,9.58,24,-2.46,-0.49,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"barbell","id":"bar","plates":[20]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"ohp":{"keys":[{"t":0,"v":[0,94.44,0,1,0,0,0,0,0,0,0,0,0,0,0,0,6,10,25.94,15.56,39.85,146.49,46.71,-39.76,7.44,1.82,1.72,7.97,3.62,1.58,1.45,0,6,10,25.94,15.56,39.85,146.49,46.71,-39.76,7.44,1.82,1.72,7.97,3.62,1.58,1.45,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,94.44,1.12,0.99985,-0.01745,0,0,-2,0,0,-2,0,0,-10,0,0,10,8,36.85,42.73,34.8,136.2,56.13,-18.75,-17.66,-0.93,1.72,7.95,3.62,2.32,1.56,0,10,8,36.85,42.73,34.8,136.2,56.13,-18.75,-17.66,-0.93,1.72,7.95,3.62,2.32,1.56,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,94.42,1.93,0.99966,-0.02618,0,0,-3,0,0,-2,0,0,-12,0,0,16,6,51.84,64.58,33.95,116.4,49.74,-12.19,-25.92,-2.47,1.72,7.94,3.62,2.86,1.63,0,16,6,51.84,64.58,33.95,116.4,49.74,-12.19,-25.92,-2.47,1.72,7.94,3.62,2.86,1.63,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,94.43,1.2,0.99985,-0.01745,0,0,-2,0,0,-1,0,0,-7,0,0,22,4,59.6,90.12,40.55,92.24,36.83,-12.82,-26.22,-0.98,1.72,7.95,3.62,2.38,1.56,0,22,4,59.6,90.12,40.55,92.24,36.83,-12.82,-26.22,-0.98,1.72,7.95,3.62,2.38,1.56,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,94.44,0.76,0.99996,-0.00873,0,0,-1,0,0,0,0,0,-2,0,0,27,2,58.42,115.79,48.14,64.05,22.35,-15.13,-18.1,0.31,1.72,7.96,3.62,2.09,1.52,0,27,2,58.42,115.79,48.14,64.05,22.35,-15.13,-18.1,0.31,1.72,7.96,3.62,2.09,1.52,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.44,0.27,1,0,0,0,0,0,0,0,0,0,4,0,0,30,0,94.56,131.22,25.23,5,5.23,-15.95,10.17,1.64,1.72,7.98,3.62,1.76,1.48,0,30,0,94.56,131.22,25.23,5,5.23,-15.95,10.17,1.64,1.72,7.98,3.62,1.76,1.48,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","yaw":180,"at":[0,0,-12],"hook":144,"pullBar":false},{"type":"barbell","id":"bar","plates":[10]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"squat":{"keys":[{"t":0,"v":[0,93.58,10.67,1,0,0,0,0,0,0,0,0,0,0,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,-5.36,4.63,15.2,3.62,7.6,5.87,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,-5.36,4.63,15.2,3.62,7.6,5.87,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[0,90.19,-1.1,0.99038,0.13839,0,0,1,0,0,0.38,0,0,-1.75,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,33.94,9.22,15.58,35.38,15.57,3.99,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,33.94,9.22,15.58,35.38,15.57,3.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,85.84,-6.3,0.98079,0.19509,0,0,2,0,0,0.75,0,0,-3.5,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,51.6,11.98,16.44,50.32,19.12,3.23,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,51.6,11.98,16.44,50.32,19.12,3.23,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,76.51,-13.61,0.96169,0.27413,0,0,4,0,0,1.5,0,0,-7,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,77.64,17.62,18.95,71.88,23.14,2.08,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,77.64,17.62,18.95,71.88,23.14,2.08,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,66.67,-18.94,0.94273,0.33357,0,0,6,0,0,2.25,0,0,-10.5,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,98.67,25.02,22.94,88.72,24.7,1.07,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,98.67,25.02,22.94,88.72,24.7,1.07,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,56.5,-23.02,0.92388,0.38268,0,0,8,0,0,3,0,0,-14,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,116.61,36.73,29.95,102.92,24.04,0.04,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,116.61,36.73,29.95,102.92,24.04,0.04,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","yaw":180,"at":[0,0,-12],"hook":132,"pullBar":false},{"type":"barbell","id":"bar","plates":[20]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"back","prop":"bar"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"goodmorning":{"keys":[{"t":0,"v":[0,93.86,9.82,1,0,0,0,0,0,0,0,0,0,0,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,-4.55,1.76,8.09,4,8.26,2.38,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,-4.55,1.76,8.09,4,8.26,2.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94.1,-2.65,0.98481,0.17365,0,0,1,0,0,1,0,0,-5,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,26.78,2.25,8.31,10,2.97,1.21,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,26.78,2.25,8.31,10,2.97,1.21,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,92.58,-14,0.94264,0.33381,0,0,3,0,0,2,0,0,-11,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,55.95,2.95,8.93,15,-2.17,0.16,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,55.95,2.95,8.93,15,-2.17,0.16,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,90.61,-20.66,0.89879,0.43837,0,0,4,0,0,4,0,0,-16,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,76.1,3.9,9.73,20,-4.34,-0.49,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,76.1,3.9,9.73,20,-4.34,-0.49,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,88.59,-25.1,0.85717,0.51504,0,0,6,0,0,6,0,0,-21,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,91.83,5.13,10.71,25,-5.11,-0.94,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,91.83,5.13,10.71,25,-5.11,-0.94,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","yaw":180,"at":[0,0,-14],"hook":132,"pullBar":false},{"type":"barbell","id":"bar","plates":[10]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"back","prop":"bar"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"smithsquat":{"keys":[{"t":0,"v":[0,94.13,10,1,0,0,0,0,0,0,0,0,0,0,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,4.66,4.55,11.83,4,-1.5,3.5,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,4.66,4.55,11.83,4,-1.5,3.5,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[0,90.24,1.41,0.99718,0.07511,0,0,0.75,0,0,0.25,0,0,-1,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,32.55,7.6,12.04,30.66,5.67,2.41,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,32.55,7.6,12.04,30.66,5.67,2.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,85.95,-3.4,0.99351,0.11371,0,0,1.5,0,0,0.5,0,0,-2,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,47.67,9.51,12.52,44.43,8.59,1.81,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,47.67,9.51,12.52,44.43,8.59,1.81,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,76.74,-10.96,0.98512,0.17187,0,0,3,0,0,1,0,0,-4,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,71.34,13.23,14.01,64.03,10.88,0.74,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,71.34,13.23,14.01,64.03,10.88,0.74,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,67.04,-17.18,0.97583,0.21852,0,0,4.5,0,0,1.5,0,0,-6,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,91.44,17.79,16.48,78.47,10.08,-0.41,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,91.44,17.79,16.48,78.47,10.08,-0.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,57,-22.59,0.96593,0.25882,0,0,6,0,0,2,0,0,-8,0,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,109.57,24.58,20.81,89.53,6.59,-1.82,0,12,-20,-33.58,24.1,94.28,111.34,-18.59,-9.27,20.86,109.57,24.58,20.81,89.53,6.59,-1.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"smith","id":"smith","z":0,"halfWidth":62},{"type":"smithBar","id":"bar","rodL":[62,0,0],"rodR":[-62,0,0],"mountTo":"smith","plates":[[20,3.4]]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"back","prop":"bar"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"closegrip":{"keys":[{"t":0,"v":[0,55.14,-24,0,0,0.74274,0.66958,-5,0,0,-9,0,0,12.08,0,0,-4,-8,81.89,6.3,-23.97,6,61.74,-7.98,1.57,1.12,23.97,7.01,84.29,-1.37,-4.82,0,-4,-8,81.89,6.3,-23.97,6,61.74,-7.98,1.57,1.12,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.14,-24,0,0,0.74274,0.66958,-5,0,0,-9,0,0,12.08,0,0,-4,-9.5,51.51,16.94,-14.09,56.25,66.91,-7.92,-8.87,1.12,23.97,7.01,84.29,-1.37,-4.82,0,-4,-9.5,51.51,16.94,-14.09,56.25,66.91,-7.92,-8.87,1.12,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.14,-24,0,0,0.74274,0.66958,-5,0,0,-9,0,0,12.08,0,0,-4,-11,15.82,20.55,-7.76,102.16,73.81,-7.72,-14.24,1.12,23.97,7.01,84.29,-1.37,-4.82,0,-4,-11,15.82,20.55,-7.76,102.16,73.81,-7.72,-14.24,1.12,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.14,-24,0,0,0.74274,0.66958,-5,0,0,-9,0,0,12.08,0,0,-4,-12.5,-20.61,20.76,-4.22,132.25,76.81,-7.81,-13.84,1.12,23.97,7.01,84.29,-1.37,-4.82,0,-4,-12.5,-20.61,20.76,-4.22,132.25,76.81,-7.81,-13.84,1.12,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.14,-24,0,0,0.74274,0.66958,-5,0,0,-9,0,0,12.08,0,0,-4,-14,-38.96,20.64,-2.57,141.29,76.17,-7.89,-12.1,1.12,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,-38.96,20.64,-2.57,141.29,76.17,-7.89,-12.1,1.12,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"benchUprights","id":"rack","z":47,"hook":107},{"type":"barbell","id":"bar","plates":[20]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"smithbench":{"keys":[{"t":0,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-8,63.98,32.85,-44.86,8,22.34,-9.52,18.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-8,63.98,32.85,-44.86,8,22.34,-9.52,18.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-8.88,39.51,51.86,-28.84,51.41,24.59,-10.04,1.17,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-8.88,39.51,51.86,-28.84,51.41,24.59,-10.04,1.17,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-11,3.98,63.93,-10.27,92.67,27.13,-9.86,-9.02,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-11,3.98,63.93,-10.27,92.67,27.13,-9.86,-9.02,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-13.12,-31.57,63.09,8.25,117,26.05,-9.98,-5.11,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-13.12,-31.57,63.09,8.25,117,26.05,-9.98,-5.11,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,-47.5,58.15,17.85,123.6,24.45,-9.98,0.93,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,-47.5,58.15,17.85,123.6,24.45,-9.98,0.93,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"smith","id":"smith","z":8.6,"halfWidth":62},{"type":"smithBar","id":"bar","rodL":[62,0,8.6],"rodR":[-62,0,8.6],"mountTo":"smith","plates":[[20,3.4]]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"skull":{"keys":[{"t":0,"v":[0,55.14,-24,0,0,0.74262,0.66971,-5,0,0,-9,0,0,12.23,0,0,-2,-6,95.73,-5.77,-2.95,8,75.33,-4,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0,-2,-6,95.73,-5.77,-2.95,8,75.33,-4,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.14,-24,0,0,0.74262,0.66971,-5,0,0,-9,0,0,12.23,0,0,-2,-6,96.6,-5.84,-2.95,22.64,76.16,-6.05,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0,-2,-6,96.6,-5.84,-2.95,22.64,76.16,-6.05,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.14,-24,0,0,0.74262,0.66971,-5,0,0,-9,0,0,12.23,0,0,-2,-6,98.71,-6,-2.96,58,77.47,-11,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0,-2,-6,98.71,-6,-2.96,58,77.47,-11,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.14,-24,0,0,0.74262,0.66971,-5,0,0,-9,0,0,12.23,0,0,-2,-6,100.82,-6.16,-2.98,93.36,77.36,-15.95,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0,-2,-6,100.82,-6.16,-2.98,93.36,77.36,-15.95,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.14,-24,0,0,0.74262,0.66971,-5,0,0,-9,0,0,12.23,0,0,-2,-6,101.7,-6.24,-2.98,108,76.88,-18,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0,-2,-6,101.7,-6.24,-2.98,108,76.88,-18,0,1.1,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"barbell","id":"bar","size":"curl","plates":["c10"]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"wristcurl":{"keys":[{"t":0,"v":[0,52.67,-5,0.99446,0.10508,0,0,6,0,0,10,0,0,14,0,0,-2,12,27.38,-14.74,5.28,81.42,-74.75,-49.91,0.2,100.42,12.25,9.78,90.72,1.53,-1.38,0,-2,12,27.38,-14.74,5.28,81.42,-74.75,-49.91,0.2,100.42,12.25,9.78,90.72,1.53,-1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,52.67,-5,0.99446,0.10508,0,0,6,0,0,10,0,0,14,0,0,-2,12,27.38,-14.74,5.28,81.42,-74.68,-34.54,0.16,100.42,12.25,9.78,90.72,1.53,-1.38,0,-2,12,27.38,-14.74,5.28,81.42,-74.68,-34.54,0.16,100.42,12.25,9.78,90.72,1.53,-1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,52.67,-5,0.99446,0.10508,0,0,6,0,0,10,0,0,14,0,0,-2,12,27.38,-14.74,5.28,81.42,-74.59,2.59,0.13,100.42,12.25,9.78,90.72,1.53,-1.38,0,-2,12,27.38,-14.74,5.28,81.42,-74.59,2.59,0.13,100.42,12.25,9.78,90.72,1.53,-1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,52.67,-5,0.99446,0.10508,0,0,6,0,0,10,0,0,14,0,0,-2,12,27.38,-14.74,5.28,81.42,-74.49,39.71,0.17,100.42,12.25,9.78,90.72,1.53,-1.38,0,-2,12,27.38,-14.74,5.28,81.42,-74.49,39.71,0.17,100.42,12.25,9.78,90.72,1.53,-1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.67,-5,0.99446,0.10508,0,0,6,0,0,10,0,0,14,0,0,-2,12,27.38,-14.74,5.28,81.42,-74.41,55.09,0.22,100.42,12.25,9.78,90.72,1.53,-1.38,0,-2,12,27.38,-14.74,5.28,81.42,-74.41,55.09,0.22,100.42,12.25,9.78,90.72,1.53,-1.38,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench","yaw":90},{"type":"barbell","id":"bar","size":"curl","plates":["c5"]}],"contacts":[{"body":"buttocks","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"hipthrust":{"keys":[{"t":0,"v":[0,31.18,4.36,0.89879,-0.43837,0,0,0,0,0,0,0,0,8,0,0,0,-6,-2.45,70.82,-59.21,103.91,17.47,-8.85,-29.69,66.06,13.27,4.06,108.32,-10.15,-2.52,0,0,-6,-2.45,70.82,-59.21,103.91,17.47,-8.85,-29.69,66.06,13.27,4.06,108.32,-10.15,-2.52,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,34.25,5.43,0.87707,-0.48037,0,0,0,0,0,0,0,0,10.64,0,0,0,-6,0.05,68.49,-62.37,99.55,15.94,-8.86,-28.73,56.66,12.56,3.18,107.43,-6.97,-2.03,0,0,-6,0.05,68.49,-62.37,99.55,15.94,-8.86,-28.73,56.66,12.56,3.18,107.43,-6.97,-2.03,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,41.95,6.78,0.81664,-0.57715,0,0,0,0,0,0,0,0,17,0,0,0,-6,4.17,63.25,-68.08,90.22,12.95,-8.96,-26.12,33.13,11.56,2.01,101.97,-1.83,-1.38,0,0,-6,4.17,63.25,-68.08,90.22,12.95,-8.96,-26.12,33.13,11.56,2.01,101.97,-1.83,-1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,49.77,6.36,0.74558,-0.66641,0,0,0,0,0,0,0,0,23.36,0,0,0,-6,6.78,58.39,-72.43,81.78,10.55,-9.24,-23.28,9.49,11.04,1.58,92.28,-0.86,-1.26,0,0,-6,6.78,58.39,-72.43,81.78,10.55,-9.24,-23.28,9.49,11.04,1.58,92.28,-0.86,-1.26,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.94,5.66,0.71325,-0.70091,0,0,0,0,0,0,0,0,26,0,0,0,-6,7.59,56.44,-74.05,78.4,9.58,-9.31,-22.05,-0.19,10.89,1.53,87.14,-1.69,-1.33,0,0,-6,7.59,56.44,-74.05,78.4,9.58,-9.31,-22.05,-0.19,10.89,1.53,87.14,-1.69,-1.33,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench","yaw":90,"at":[0,0,-42]},{"type":"barbell","id":"bar","plates":[20]},{"type":"g1BarPad","id":"barPad","mountTo":"bar"}],"contacts":[{"body":"upperBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"belly","prop":"barPad"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"inclinebb":{"keys":[{"t":0,"v":[0,58.87,-9.74,0,0,0.89879,0.43837,-4,0,0,-6,0,0,18.23,0,0,-4,-8,98.56,57.19,-31.03,6,11.18,-9.29,21.81,26.94,20.7,11.5,82,1.3,-3.03,0,-4,-8,98.56,57.19,-31.03,6,11.18,-9.29,21.81,26.94,20.7,11.5,82,1.3,-3.03,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,58.87,-9.74,0,0,0.89879,0.43837,-4,0,0,-6,0,0,18.23,0,0,-4,-8.88,58.24,78.23,-1.16,54.42,14.97,-10.02,1.02,26.94,20.7,11.5,82,1.3,-3.03,0,-4,-8.88,58.24,78.23,-1.16,54.42,14.97,-10.02,1.02,26.94,20.7,11.5,82,1.3,-3.03,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,58.87,-9.74,0,0,0.89879,0.43837,-4,0,0,-6,0,0,18.23,0,0,-4,-11,12.65,74.59,23.04,97.95,18.82,-9.89,-8.22,26.94,20.7,11.5,82,1.3,-3.03,0,-4,-11,12.65,74.59,23.04,97.95,18.82,-9.89,-8.22,26.94,20.7,11.5,82,1.3,-3.03,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,58.87,-9.74,0,0,0.89879,0.43837,-4,0,0,-6,0,0,18.23,0,0,-4,-13.12,-23.4,54.63,40.49,120.59,18.83,-10.02,2.36,26.94,20.7,11.5,82,1.3,-3.03,0,-4,-13.12,-23.4,54.63,40.49,120.59,18.83,-10.02,2.36,26.94,20.7,11.5,82,1.3,-3.03,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,58.87,-9.74,0,0,0.89879,0.43837,-4,0,0,-6,0,0,18.23,0,0,-4,-14,-36.36,42.77,47.45,124.7,18.32,-9.73,12.39,26.94,20.7,11.5,82,1.3,-3.03,0,-4,-14,-36.36,42.77,47.45,124.7,18.32,-9.73,12.39,26.94,20.7,11.5,82,1.3,-3.03,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g1InclineRack","id":"bench","back":38,"seat":5,"hook":134,"upZ":41.6},{"type":"barbell","id":"bar","plates":[20]}],"contacts":[{"body":"back","prop":"bench:back"},{"body":"buttocks","prop":"bench:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"smithincline":{"keys":[{"t":0,"v":[0,55.08,-6.31,0,0,0.86603,0.5,-4,0,0,-6,0,0,18.23,0,0,-4,-8,91.02,45.33,-36.27,8,17.15,-9.48,18.67,24.25,20.14,10.95,80.63,-4.89,-4.93,0,-4,-8,91.02,45.33,-36.27,8,17.15,-9.48,18.67,24.25,20.14,10.95,80.63,-4.89,-4.93,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.08,-6.31,0,0,0.86603,0.5,-4,0,0,-6,0,0,18.23,0,0,-4,-8.88,57.63,66.97,-11.34,54.69,19.99,-10.02,-1,24.25,20.14,10.95,80.63,-4.89,-4.93,0,-4,-8.88,57.63,66.97,-11.34,54.69,19.99,-10.02,-1,24.25,20.14,10.95,80.63,-4.89,-4.93,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.08,-6.31,0,0,0.86603,0.5,-4,0,0,-6,0,0,18.23,0,0,-4,-11,13.71,71.64,13.49,98.95,22.3,-9.79,-11.59,24.25,20.14,10.95,80.63,-4.89,-4.93,0,-4,-11,13.71,71.64,13.49,98.95,22.3,-9.79,-11.59,24.25,20.14,10.95,80.63,-4.89,-4.93,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.08,-6.31,0,0,0.86603,0.5,-4,0,0,-6,0,0,18.23,0,0,-4,-13.12,-25.3,57.62,36.04,124.12,19.36,-10,-3.41,24.25,20.14,10.95,80.63,-4.89,-4.93,0,-4,-13.12,-25.3,57.62,36.04,124.12,19.36,-10,-3.41,24.25,20.14,10.95,80.63,-4.89,-4.93,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.08,-6.31,0,0,0.86603,0.5,-4,0,0,-6,0,0,18.23,0,0,-4,-14,-40.05,45.62,46.87,129.74,16.54,-9.9,6.62,24.25,20.14,10.95,80.63,-4.89,-4.93,0,-4,-14,-40.05,45.62,46.87,129.74,16.54,-9.9,6.62,24.25,20.14,10.95,80.63,-4.89,-4.93,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":30,"seat":5},{"type":"smith","id":"smith","z":28.4,"halfWidth":62},{"type":"smithBar","id":"bar","rodL":[62,0,28.4],"rodR":[-62,0,28.4],"mountTo":"smith","plates":[[20,3.4]]}],"contacts":[{"body":"back","prop":"bench:back"},{"body":"buttocks","prop":"bench:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"declinebb":{"keys":[{"t":0,"v":[0,69.64,-4.37,0,0,0.63466,0.77279,-4,0,0,-8,0,0,9.51,0,0,-4,-8,61.45,34.21,-53.21,6,13.74,-9.32,21.86,-5.63,1.98,-4.26,88.74,6,0,0,-4,-8,61.45,34.21,-53.21,6,13.74,-9.32,21.86,-5.63,1.98,-4.26,88.74,6,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,69.64,-4.37,0,0,0.63466,0.77279,-4,0,0,-8,0,0,9.51,0,0,-4,-8.88,38.1,55.77,-36.46,49.91,16.62,-10.01,2.98,-5.63,1.98,-4.26,88.74,6,0,0,-4,-8.88,38.1,55.77,-36.46,49.91,16.62,-10.01,2.98,-5.63,1.98,-4.26,88.74,6,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,69.64,-4.37,0,0,0.63466,0.77279,-4,0,0,-8,0,0,9.51,0,0,-4,-11,3.29,70.56,-17.15,89.97,19.44,-9.9,-7.44,-5.63,1.98,-4.26,88.74,6,0,0,-4,-11,3.29,70.56,-17.15,89.97,19.44,-9.9,-7.44,-5.63,1.98,-4.26,88.74,6,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,69.64,-4.37,0,0,0.63466,0.77279,-4,0,0,-8,0,0,9.51,0,0,-4,-13.12,-32.24,72.13,1.9,113.38,19.12,-9.99,-4.03,-5.63,1.98,-4.26,88.74,6,0,0,-4,-13.12,-32.24,72.13,1.9,113.38,19.12,-9.99,-4.03,-5.63,1.98,-4.26,88.74,6,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,69.64,-4.37,0,0,0.63466,0.77279,-4,0,0,-8,0,0,9.51,0,0,-4,-14,-48.12,68.44,11.37,119.74,18.09,-9.98,1.3,-5.63,1.98,-4.26,88.74,6,0,0,-4,-14,-48.12,68.44,11.37,119.74,18.09,-9.98,1.3,-5.63,1.98,-4.26,88.74,6,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g1DeclineRack","id":"bench","decline":16,"hipH":62,"padZ0":-18,"kneeZ":-34.8,"kneeY":61.5,"ankleZ":-57.9,"ankleY":40.1,"hook":106.7,"upZ":50.6},{"type":"barbell","id":"bar","plates":[20]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"thighsBack","prop":"bench:kneeXp"},{"body":"thighsBack","prop":"bench:kneeXn"},{"body":"shinL","prop":"bench:ankleXn"},{"body":"shinR","prop":"bench:ankleXp"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"preacher":{"keys":[{"t":0,"v":[0,68.16,-7,0.99863,0.05234,0,0,2,0,0,6,0,0,8,0,0,6,14,58.94,-3.44,-1.62,18,-89.11,6,0,71.94,13.1,13.02,74.39,7.18,-1.41,0,6,14,58.94,-3.44,-1.62,18,-89.11,6,0,71.94,13.1,13.02,74.39,7.18,-1.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,68.16,-7,0.99863,0.05234,0,0,2,0,0,6,0,0,8,0,0,6,14,58.94,-3.44,-1.62,32.35,-88.47,3.07,0,71.94,13.1,13.02,74.39,7.18,-1.41,0,6,14,58.94,-3.44,-1.62,32.35,-88.47,3.07,0,71.94,13.1,13.02,74.39,7.18,-1.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,68.16,-7,0.99863,0.05234,0,0,2,0,0,6,0,0,8,0,0,6,14,58.94,-3.44,-1.62,67,-87.36,-4,0,71.94,13.1,13.02,74.39,7.18,-1.41,0,6,14,58.94,-3.44,-1.62,67,-87.36,-4,0,71.94,13.1,13.02,74.39,7.18,-1.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,68.16,-7,0.99863,0.05234,0,0,2,0,0,6,0,0,8,0,0,6,14,58.94,-3.44,-1.62,101.65,-87.2,-11.07,0,71.94,13.1,13.02,74.39,7.18,-1.41,0,6,14,58.94,-3.44,-1.62,101.65,-87.2,-11.07,0,71.94,13.1,13.02,74.39,7.18,-1.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,68.16,-7,0.99863,0.05234,0,0,2,0,0,6,0,0,8,0,0,6,14,58.94,-3.44,-1.62,116,-87.43,-14,0,71.94,13.1,13.02,74.39,7.18,-1.41,0,6,14,58.94,-3.44,-1.62,116,-87.43,-14,0,71.94,13.1,13.02,74.39,7.18,-1.41,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g1Preacher","id":"preacher","seatH":56,"padTop":98.3,"padZ":14.4,"slope":45,"padLen":34},{"type":"barbell","id":"bar","size":"curl","plates":["c10"],"optional":"bb"},{"type":"dumbbell","id":"dbL","hand":"L","optionalNot":"bb"},{"type":"dumbbell","id":"dbR","hand":"R","optionalNot":"bb"}],"contacts":[{"body":"buttocks","prop":"preacher:seat"},{"body":"chest","prop":"preacher:roll"},{"body":"uaL","prop":"preacher:pad"},{"body":"uaR","prop":"preacher:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.5,"R":1.5}},
"tbarrow":{"keys":[{"t":0,"v":[0,89.08,-13.29,0.95882,0.28402,0,0,3,0,0,5,0,0,-10,0,0,2,10,35.16,-5.9,-35.86,9.8,-29.2,-0.03,18.53,56.03,17.11,21.02,30,2.74,7.32,0,2,10,35.16,-5.9,-35.86,9.8,-29.2,-0.03,18.53,56.03,17.11,21.02,30,2.74,7.32,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,89.08,-13.29,0.95882,0.28402,0,0,3,0,0,5,0,0,-10,0,0,1.41,6.19,25.9,1.23,-34.51,32.44,-28.19,-1.17,9.74,56.03,17.11,21.02,30,2.74,7.32,0,1.41,6.19,25.9,1.23,-34.51,32.44,-28.19,-1.17,9.74,56.03,17.11,21.02,30,2.74,7.32,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,89.08,-13.29,0.95882,0.28402,0,0,3,0,0,5,0,0,-10,0,0,0,-3,13.69,9.44,-33.24,59.53,-26.96,-3.95,1.26,56.03,17.11,21.02,30,2.74,7.32,0,0,-3,13.69,9.44,-33.24,59.53,-26.96,-3.95,1.26,56.03,17.11,21.02,30,2.74,7.32,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,89.08,-13.29,0.95882,0.28402,0,0,3,0,0,5,0,0,-10,0,0,-1.41,-12.19,3.71,15.17,-32.29,78.34,-25.14,-6.81,-2.82,56.03,17.11,21.02,30,2.74,7.32,0,-1.41,-12.19,3.71,15.17,-32.29,78.34,-25.14,-6.81,-2.82,56.03,17.11,21.02,30,2.74,7.32,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,89.08,-13.29,0.95882,0.28402,0,0,3,0,0,5,0,0,-10,0,0,-2,-16,-0.43,17.19,-31.85,85,-24.1,-7.98,-3.73,56.03,17.11,21.02,30,2.74,7.32,0,-2,-16,-0.43,17.19,-31.85,85,-24.1,-7.98,-3.73,56.03,17.11,21.02,30,2.74,7.32,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g1Landmine","id":"lm","at":[0,0,-138.3]},{"type":"g1LandmineBar","id":"tbar","pivot":[0,8,-138.3],"mountTo":"lm:pin","drop":7,"plates":[[11.5,2.6],[11.5,2.6],[11.5,2.6]]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"tbar"},{"body":"gripR","prop":"tbar"}],"gripRadius":{"L":1.6,"R":1.6}},
"bbcurl":{"keys":[{"t":0,"v":[0,94.38,2.71,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,4,1,9,-4,9,-84,4,0,0.11,2.12,18.89,4,3.21,1.97,0,-2,4,1,9,-4,9,-84,4,0,0.11,2.12,18.89,4,3.21,1.97,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94.41,-1.23,1,0,0,0,0,0,0,-0.44,0,0,2,0,0,-1.41,3.12,2.9,8.71,-3.41,27.89,-84,6.05,0,2.74,2.12,18.87,4,0.72,1.12,0,-1.41,3.12,2.9,8.71,-3.41,27.89,-84,6.05,0,2.74,2.12,18.87,4,0.72,1.12,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94.18,-6.43,1,0,0,0,0,0,0,-1.5,0,0,2,0,0,0,1,7.5,8,-2,73.5,-84,11,0,6.21,2.13,18.91,4,-2.56,0,0,0,1,7.5,8,-2,73.5,-84,11,0,6.21,2.13,18.91,4,-2.56,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,94.38,-2.69,1,0,0,0,0,0,0,-2.56,0,0,2,0,0,1.41,-1.12,12.1,7.29,-0.59,119.11,-84,15.95,0,3.72,2.12,18.88,4,-0.2,0.81,0,1.41,-1.12,12.1,7.29,-0.59,119.11,-84,15.95,0,3.72,2.12,18.88,4,-0.2,0.81,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.42,0.74,1,0,0,0,0,0,0,-3,0,0,2,0,0,2,-2,14,7,0,138,-84,18,0,1.42,2.12,18.88,4,1.96,1.55,0,2,-2,14,7,0,138,-84,18,0,1.42,2.12,18.88,4,1.96,1.55,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"barbell","id":"bar","size":"curl","plates":["c10"]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"kickback":{"keys":[{"t":0,"v":[7.8,91.8,-24,0.73135,0.682,0,0,0,0,0,-3,0,0,-10,0,0,-2,-8,-2.5,34.69,-19.14,76.47,-36.94,0,0,83.7,6.52,20.79,18.4,19.1,4.83,0,0,4,73.21,27.6,-34.48,50.94,74.64,-57.43,11.9,86,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.25,"v":[7.8,91.8,-24,0.73135,0.682,0,0,0,0,0,-3,0,0,-10,0,0,-2,-8,-3.59,29.56,-19.37,66.61,-33.67,0,0,83.7,6.52,20.79,18.4,19.1,4.83,0,0,4,73.21,27.6,-34.48,50.94,74.64,-57.43,11.9,86,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.5,"v":[7.8,91.8,-24,0.73135,0.682,0,0,0,0,0,-3,0,0,-10,0,0,-2,-8,-6.5,20.81,-19.43,43.48,-27.16,0,0,83.7,6.52,20.79,18.4,19.1,4.83,0,0,4,73.21,27.6,-34.48,50.94,74.64,-57.43,11.9,86,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.75,"v":[7.8,91.8,-24,0.73135,0.682,0,0,0,0,0,-3,0,0,-10,0,0,-2,-8,-11.26,15.67,-19.17,24.18,-22.33,0,0,83.7,6.52,20.79,18.4,19.1,4.83,0,0,4,73.21,27.6,-34.48,50.94,74.64,-57.43,11.9,86,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":1,"v":[7.8,91.8,-24,0.73135,0.682,0,0,0,0,0,-3,0,0,-10,0,0,-2,-8,-15.29,14.75,-18.94,20.15,-20.94,0,0,83.7,6.52,20.79,18.4,19.1,4.83,0,0,4,73.21,27.6,-34.48,50.94,74.64,-57.43,11.9,86,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"dumbbell","id":"db","hand":"L"}],"contacts":[{"body":"kneeR","prop":"bench:pad"},{"body":"palmR","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"gripL","prop":"db"}],"gripRadius":{"L":1.6,"R":1.4}},
"concentration":{"keys":[{"t":0,"v":[0,54.77,0,0.95882,0.28402,0,0,12,0,4,15,-2,12,-45,0,-8,0,8,50.07,-29.68,-79.22,21.06,-45,0,0,105.63,49.11,34.89,81.51,-4.59,3.34,0,0,0,-32.76,22.11,23.66,133.95,65.93,-42.27,3.06,105.63,49.11,34.89,81.51,-4.59,3.34,0],"hands":{"L":"grip","R":"flat"}},{"t":0.25,"v":[0,54.77,0,0.95882,0.28402,0,0,12,0,4,15,-2,12,-45,0,-8,0,8,49.02,-31.04,-57.84,31.67,-45.88,0,0,105.63,49.11,34.89,81.51,-4.59,3.34,0,0,0,-32.76,22.11,23.66,133.95,65.93,-42.27,3.06,105.63,49.11,34.89,81.51,-4.59,3.34,0],"hands":{"L":"grip","R":"flat"}},{"t":0.5,"v":[0,54.77,0,0.95882,0.28402,0,0,12,0,4,15,-2,12,-45,0,-8,0,8,49.24,-32.81,-42.93,64.15,-55.25,0,0,105.63,49.11,34.89,81.51,-4.59,3.34,0,0,0,-32.76,22.11,23.66,133.95,65.93,-42.27,3.06,105.63,49.11,34.89,81.51,-4.59,3.34,0],"hands":{"L":"grip","R":"flat"}},{"t":0.75,"v":[0,54.77,0,0.95882,0.28402,0,0,12,0,4,15,-2,12,-45,0,-8,0,8,49.67,-34.47,-36.81,98.64,-74.87,0,0,105.63,49.11,34.89,81.51,-4.59,3.34,0,0,0,-32.76,22.11,23.66,133.95,65.93,-42.27,3.06,105.63,49.11,34.89,81.51,-4.59,3.34,0],"hands":{"L":"grip","R":"flat"}},{"t":1,"v":[0,54.77,0,0.95882,0.28402,0,0,12,0,4,15,-2,12,-45,0,-8,0,8,50,-35.4,-34.85,113.13,-86,0,0,105.63,49.11,34.89,81.51,-4.59,3.34,0,0,0,-32.76,22.11,23.66,133.95,65.93,-42.27,3.06,105.63,49.11,34.89,81.51,-4.59,3.34,0],"hands":{"L":"grip","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench","yaw":90,"at":[0,0,-6]},{"type":"dumbbell","id":"dbL","hand":"L"}],"contacts":[{"body":"buttocks","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"}],"gripRadius":{"L":1.6,"R":1.4}},
"pullover":{"keys":[{"t":0,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,-2,6,87.45,31.44,-69.17,60.15,77.48,-48.91,-0.5,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,-2,6,98.69,28.74,-70.08,51.26,60.18,-50.64,13.9,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.08333333333333333,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,-1.8,5.83,87.63,31.81,-67.4,60.66,76.4,-48.23,-0.06,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,-1.8,5.83,99.26,28.77,-68.94,51.11,59.15,-50.01,13.98,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.16666666666666666,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,-1.2,5.33,88.33,32.84,-62.57,62.23,73.41,-45.93,0.61,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,-1.2,5.33,101.11,28.92,-65.97,50.81,56.32,-47.99,13.58,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,-0.24,4.54,90.02,34.41,-56.09,64.91,69.17,-41.52,-0.25,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,-0.24,4.54,104.6,29.5,-62.33,50.68,52.15,-44.4,11.16,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.3333333333333333,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,1,3.5,93.41,37,-49.77,68.56,63.98,-35.08,-4.84,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,1,3.5,110.16,31.35,-59.61,51,46.4,-39.59,5.15,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.4166666666666667,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,2.45,2.29,99.63,43.4,-45.42,72.56,55.83,-28.43,-13.12,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,2.45,2.29,118.48,36.32,-59.79,51.41,36.65,-35.21,-2.78,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,4,1,107.46,60.93,-41.29,75.5,40.39,-26.26,-15.32,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,4,1,128.46,46.62,-61.4,50.26,21.01,-32.83,0.06,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5833333333333334,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,5.55,-0.29,107.44,87.32,-29.91,77.7,23.69,-26.43,-16.1,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,5.55,-0.29,135.38,61.74,-59.17,49,5.76,-30.02,3.76,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.6666666666666666,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,7,-1.5,98.57,103.94,-9.1,79.05,17.44,-18.43,-12.2,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,7,-1.5,133.76,82.46,-45.7,47.75,-2.47,-24.33,7.39,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,8.24,-2.54,89.29,115.51,9.67,79.67,14.13,-9.87,-9.58,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,8.24,-2.54,118.39,113.08,-22.6,46.64,-9.12,-19.2,9.96,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.8333333333333334,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,9.2,-3.33,79.27,125.42,25.41,79.79,11.3,-3.63,-8.39,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,9.2,-3.33,78.5,148.53,12.67,45.77,-14.72,-15.44,11.71,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":0.9166666666666666,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,9.8,-3.83,70.38,132.38,36.62,79.71,9.22,0,-7.96,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,9.8,-3.83,26.67,167.6,48.87,45.23,-18.48,-13.13,12.76,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,55.02,-24,0,0,0.72369,0.69013,-3,0,0,-4.8,0,0,3.08,0,0,10,-4,66.69,134.87,40.78,79.66,8.44,1.17,-7.87,-1.74,23.99,6.3,84.46,-1.35,-4.82,0,10,-4,4.08,169.94,63.65,45.04,-19.81,-12.35,13.12,-1.74,23.99,6.3,84.46,-1.35,-4.82,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"g2CupDumbbell","id":"cup","hands":["L","R"]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"palmL","prop":"cup:top"},{"body":"palmR","prop":"cup:top"}]},
"sllift":{"keys":[{"t":0,"v":[8.35,93.3,0.81,0.99988,0.01571,0,0,0.06,0,0,0.1,0,0,-0.9,0,0,0,0,-9.12,5.51,-0.46,27.02,10,0,0,5.04,-8.62,2.94,7.47,4.66,-8.78,0,0,0,-12.27,10.25,-0.57,28.76,-3.78,0,0,16.42,0,0,63.84,-12,0,0],"hands":{"L":"relaxed","R":"grip"}},{"t":0.2,"v":[8.28,93.08,-1.26,0.99747,0.07115,0,0,0.27,0,0,0.45,0,0,-4.08,0,0,0,0.57,-2.35,5.07,-0.11,27.32,10,0,0,14.61,-8.55,2.72,11.13,5.08,-8.82,0,0,0.57,-5.69,9.64,0.07,29.28,-3.78,0,0,13.29,0,0,55.45,-11.05,0,0],"hands":{"L":"relaxed","R":"grip"}},{"t":0.4,"v":[8.09,92.51,-5.53,0.97665,0.21482,0,0,0.83,0,0,1.38,0,0,-12.4,0,0,0,2.07,15.44,4.02,0.56,27.99,10,0,0,36.47,-8.72,1.9,15.96,4.58,-8.9,0,0,2.07,11.7,8.25,1.41,30.43,-3.78,0,0,-0.34,0,0,22.7,-8.55,0,0],"hands":{"L":"relaxed","R":"grip"}},{"t":0.6,"v":[7.86,91.79,-10.47,0.92257,0.38583,0,0,1.51,0,0,2.52,0,0,-22.7,0,0,0,3.93,37.58,2.82,0.92,28.58,10,0,0,61.47,-9.58,0.56,18.36,2.4,-8.98,0,0,3.93,33.52,6.8,2.44,31.47,-3.78,0,0,-2.54,0,0,11.06,-5.45,0,0],"hands":{"L":"relaxed","R":"grip"}},{"t":0.8,"v":[7.67,91.22,-14.47,0.85699,0.51534,0,0,2.07,0,0,3.45,0,0,-31.02,0,0,0,5.43,55.59,1.79,0.82,28.87,10,0,0,80.67,-10.94,-0.91,18.37,-0.32,-9.05,0,0,5.43,51.37,5.72,2.82,32.07,-3.05,0,0,0.46,0,0,11.06,-2.95,0,0],"hands":{"L":"relaxed","R":"grip"}},{"t":1,"v":[7.6,91,-15.53,0.82708,0.56208,0,0,2.28,0,0,3.8,0,0,-34.2,0,0,0,6,62.49,1.35,0.68,28.94,10,0,0,87.83,-11.66,-1.6,18.68,-0.9,-9.07,0,0,6,58.24,5.3,2.85,32.21,-3.05,0,0,1.61,0,0,11.06,-2,0,0],"hands":{"L":"relaxed","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.4,"R":1.6}},
"stepup":{"keys":[{"t":0,"v":[1.2,92.49,-35.9,0.98357,0.18052,0,0,2.6,0,0,1.6,0,0,-9.1,0,0,-2,-3,2,12,0,8,0,0,0,112.8,0,0,110,18,0,0,-2,-3,2,12,0,8,0,0,0,26.23,3.98,12.02,22.07,15.95,2.7,0],"hands":{"L":"grip","R":"grip"}},{"t":0.04,"v":[1.2,92.89,-35.98,0.98372,0.17972,0,0,2.59,0,0,1.59,0,0,-9.06,0,0,-2,-3,2,12,0,8,0,0,0,112.19,0,0,109.39,17.91,0,0,-2,-3,2,12,0,8,0,0,0,33.67,5.5,12.12,35.13,9.37,0.77,12.09],"hands":{"L":"grip","R":"grip"}},{"t":0.08,"v":[1.2,94.09,-36.2,0.98415,0.17733,0,0,2.55,0,0,1.55,0,0,-8.94,0,0,-2,-3,2,12,0,8,0,0,0,110.38,0,0,107.58,17.63,0,0,-2,-3,2,12,0,8,0,0,0,40.85,6.76,12.23,44.66,-8.01,-2.51,31.66],"hands":{"L":"grip","R":"grip"}},{"t":0.12,"v":[1.2,96.06,-36.49,0.98485,0.17339,0,0,2.5,0,0,1.5,0,0,-8.74,0,0,-2,-3,2,12,0,8,0,0,0,107.4,0,0,104.6,17.17,0,0,-2,-3,2,12,0,8,0,0,0,40.74,1.99,-0.01,42.71,-13.51,3.33,35.43],"hands":{"L":"grip","R":"grip"}},{"t":0.16,"v":[1.2,98.74,-36.75,0.98579,0.16798,0,0,2.42,0,0,1.42,0,0,-8.46,0,0,-2,-3,2,12,0,8,0,0,0,103.33,0,0,100.53,16.54,0,0,-2,-3,2,12,0,8,0,0,0,41,1.99,-0.04,43.84,-14.1,3.36,36.26],"hands":{"L":"grip","R":"grip"}},{"t":0.24,"v":[1.2,105.85,-36.72,0.9882,0.15319,0,0,2.2,0,0,1.2,0,0,-7.71,0,0,-2,-3,2,12,0,8,0,0,0,92.3,0,0,89.52,14.85,0,0,-2,-3,2,12,0,8,0,0,0,43.73,2.03,-0.16,52.24,-11.37,3.45,37.49],"hands":{"L":"grip","R":"grip"}},{"t":0.32,"v":[1.2,114.37,-35.15,0.99097,0.13406,0,0,1.93,0,0,0.93,0,0,-6.74,0,0,-2,-3,2,12,0,8,0,0,0,78.28,0,0,75.58,12.7,0,0,-2,-3,2,12,0,8,0,0,0,46.1,2.08,-0.31,63.64,-4.77,3.54,37.7],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[1.2,122.83,-31.53,0.9937,0.11205,0,0,1.61,0,0,0.61,0,0,-5.63,0,0,-2,-3,2,12,0,8,0,0,0,62.55,0,0,59.99,10.31,0,0,-2,-3,2,12,0,8,0,0,0,45.92,2.13,-0.43,73.12,3.63,3.61,36.42],"hands":{"L":"grip","R":"grip"}},{"t":0.48,"v":[1.2,129.84,-26.15,0.99604,0.08886,0,0,1.27,0,0,0.27,0,0,-4.46,0,0,-2,-3,2,12,0,8,0,0,0,46.54,0,0,44.22,7.88,0,0,-2,-3,2,12,0,8,0,0,0,44.02,2.14,-0.51,77.76,10.59,3.59,33.33],"hands":{"L":"grip","R":"grip"}},{"t":0.56,"v":[1.2,134.6,-20.01,0.9978,0.06631,0,0,0.95,0,0,-0.05,0,0,-3.33,0,0,-2,-3,2,12,0,8,0,0,0,31.69,0,0,29.73,5.65,0,0,-2,-3,2,12,0,8,0,0,0,39.82,2.05,-0.51,74.82,14.31,3.39,28.28],"hands":{"L":"grip","R":"grip"}},{"t":0.64,"v":[1.2,137.13,-14.39,0.99893,0.04614,0,0,0.66,0,0,-0.34,0,0,-2.31,0,0,-2,-3,2,12,0,8,0,0,0,19.34,0,0,17.88,3.83,0,0,-2,-3,2,12,0,8,0,0,0,33.47,1.9,-0.42,64.42,14.91,2.98,21.34],"hands":{"L":"grip","R":"grip"}},{"t":0.72,"v":[1.2,138.12,-10.34,0.99955,0.02996,0,0,0.43,0,0,-0.57,0,0,-1.5,0,0,-2,-3,2,12,0,8,0,0,0,10.62,0,0,9.77,2.58,0,0,-2,-3,2,12,0,8,0,0,0,27.63,1.76,-0.34,52.81,15.64,2.48,12.99],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[1.2,138.36,-8.51,0.99982,0.01901,0,0,0.27,0,0,-0.73,0,0,-0.95,0,0,-2,-3,2,12,0,8,0,0,0,6.31,0,0,6.15,2.02,0,0,-2,-3,2,12,0,8,0,0,0,22.43,1.68,-0.28,40.38,12.49,2.12,7.65],"hands":{"L":"grip","R":"grip"}},{"t":0.9,"v":[1.2,138.37,-8.44,0.9999,0.01396,0,0,0.2,0,0,-0.8,0,0,-0.7,0,0,-2,-3,2,12,0,8,0,0,0,5.6,0,0,6,2,0,0,-2,-3,2,12,0,8,0,0,0,5.08,2.11,11.44,5.07,1.25,1.38,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[1.2,138.37,-8.44,0.9999,0.01396,0,0,0.2,0,0,-0.8,0,0,-0.7,0,0,-2,-3,2,12,0,8,0,0,0,5.6,0,0,6,2,0,0,-2,-3,2,12,0,8,0,0,0,5.08,2.11,11.44,5.07,1.25,1.38,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench","yaw":90},{"type":"dumbbell","id":"dbL","hand":"L","optional":"db"},{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"bench:pad"},{"body":"soleR","prop":"floor","when":[0,0.1]},{"body":"soleR","prop":"bench:pad","when":[0.9,1]},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6}},
"bulgarian":{"keys":[{"t":0,"v":[1,80,-3,0.99844,0.05582,0,0,0.8,0,0,-1.2,0,0,-2.4,0,0,-2,-3,2,12,0,8,0,0,0,50.69,0.81,2.85,25.05,-19.24,-1.25,0,-2,-3,2,12,0,8,0,0,0,29.27,0.26,-0.14,125.9,-41.97,-0.2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[1,76.92,-2.56,0.99808,0.06195,0,0,0.89,0,0,-1.11,0,0,-2.66,0,0,-2,-3,2,12,0,8,0,0,0,59.25,1.22,3,38.82,-13.33,-1.29,0,-2,-3,2,12,0,8,0,0,0,27.85,0.29,-0.14,128.77,-36.98,-0.22,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[1,69.5,-1.5,0.99705,0.07672,0,0,1.1,0,0,-0.9,0,0,-3.3,0,0,-2,-3,2,12,0,8,0,0,0,74.26,2.02,3.37,60.36,-5.13,-1.41,0,-2,-3,2,12,0,8,0,0,0,22.23,0.39,-0.15,134.5,-23.93,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[1,62.08,-0.44,0.99581,0.09148,0,0,1.31,0,0,-0.69,0,0,-3.94,0,0,-2,-3,2,12,0,8,0,0,0,86.82,2.82,3.81,76.09,-0.28,-1.56,0,-2,-3,2,12,0,8,0,0,0,13.29,0.57,-0.13,138.17,-9.62,-0.37,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[1,59,0,0.99523,0.09758,0,0,1.4,0,0,-0.6,0,0,-4.2,0,0,-2,-3,2,12,0,8,0,0,0,91.74,3.19,4.04,81.72,1.12,-1.63,0,-2,-3,2,12,0,8,0,0,0,8.69,0.69,-0.12,138.99,-3.5,-0.44,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench","at":[-8,0,-92]},{"type":"dumbbell","id":"dbL","hand":"L","optional":"db"},{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"footR","prop":"bench:pad"},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6}},
"lunge":{"keys":[{"t":0,"v":[0,81,-5,0.99966,0.02618,0,0,0,0,0,-2,0,0,-2,0,0,-2,-3,2,12,0,8,0,0,0,47.08,1.51,2.47,28.8,-15.3,-0.35,0,-2,-3,2,12,0,8,0,0,0,-14.23,1.03,0.19,39.61,4.34,0.65,52.5],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,76.83,-5.21,0.99959,0.02873,0,0,0,0,0,-2,0,0,-2,0,0,-2,-3,2,12,0,8,0,0,0,56.58,1.91,2.54,43.79,-9.53,-0.38,0,-2,-3,2,12,0,8,0,0,0,-9.72,1.12,0.16,51.36,11.86,0.7,52.5],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,66.75,-5.7,0.99939,0.0349,0,0,0,0,0,-2,0,0,-2,0,0,-2,-3,2,12,0,8,0,0,0,73.67,2.67,2.72,67.17,-2.55,-0.46,0,-2,-3,2,12,0,8,0,0,0,2.85,1.38,0.06,78.99,10.14,0.47,70],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,56.67,-6.19,0.99916,0.04107,0,0,0,0,0,-2,0,0,-2,0,0,-2,-3,2,12,0,8,0,0,0,88.44,3.42,2.98,83.73,-0.07,-0.58,0,-2,-3,2,12,0,8,0,0,0,7.63,1.72,0.03,95.87,15.44,0.37,77.5],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.5,-6.4,0.99905,0.04362,0,0,0,0,0,-2,0,0,-2,0,0,-2,-3,2,12,0,8,0,0,0,94.38,3.78,3.14,89.43,-0.02,-0.65,0,-2,-3,2,12,0,8,0,0,0,7.63,1.92,0.04,101.1,20.96,0.41,77.5],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L","optional":"db"},{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6}},
"revlunge":{"keys":[{"t":0,"v":[0,93.6,0,0.9999,0.01396,0,0,0.2,0,0,-1.8,0,0,-0.6,0,0,-2,-3,2,12,0,8,0,0,0,9.97,1.14,2.25,16.52,8.11,0.81,0,-2,-3,2,12,0,8,0,0,0,9.78,2.61,12.4,16.52,7.97,0.79,0],"hands":{"L":"grip","R":"grip"}},{"t":0.03,"v":[2.5,93.3,0,0.9999,0.01396,0,0,0.2,0,0,-1.8,0,0,-0.6,0,0,-2,-3,2,12,0,8,0,0,0,11.27,-0.48,2.36,19.09,9.44,-0.88,0,-2,-3,2,12,0,8,0,0,0,21.26,6.62,12.1,36.62,1.17,0.07,15],"hands":{"L":"grip","R":"grip"}},{"t":0.06,"v":[5,93,0,0.9999,0.01396,0,0,0.2,0,0,-1.8,0,0,-0.6,0,0,-2,-3,2,12,0,8,0,0,0,12.15,-2.13,2.5,20.81,10.36,-2.57,0,-2,-3,2,12,0,8,0,0,0,28.31,9.57,11.59,46.37,-11.4,-0.84,30],"hands":{"L":"grip","R":"grip"}},{"t":0.12,"v":[5,92.37,-0.86,0.99987,0.01617,0,0,0.23,0,0,-1.77,0,0,-0.7,0,0,-2,-3,2,12,0,8,0,0,0,15.12,-2.05,2.56,25.03,11.86,-2.62,0,-2,-3,2,12,0,8,0,0,0,36.14,4.22,-1.4,59.52,-14.94,3.65,40.11],"hands":{"L":"grip","R":"grip"}},{"t":0.18,"v":[5,90.46,-3.42,0.99974,0.02281,0,0,0.33,0,0,-1.67,0,0,-0.98,0,0,-2,-3,2,12,0,8,0,0,0,22.51,-1.85,2.73,34.54,14.74,-2.75,0,-2,-3,2,12,0,8,0,0,0,40.12,4.4,-1.63,71.86,-14.93,3.34,49.2],"hands":{"L":"grip","R":"grip"}},{"t":0.24,"v":[5,87.4,-7.57,0.99944,0.03352,0,0,0.48,0,0,-1.52,0,0,-1.44,0,0,-2,-3,2,12,0,8,0,0,0,32.31,-1.61,2.99,45.37,16.99,-2.97,0,-2,-3,2,12,0,8,0,0,0,39.08,4.86,-1.58,81.71,-10.02,3.04,56.4],"hands":{"L":"grip","R":"grip"}},{"t":0.3,"v":[5,84.1,-12.02,0.99899,0.04502,0,0,0.65,0,0,-1.35,0,0,-1.94,0,0,-2,-3,2,12,0,8,0,0,0,41.54,-1.37,3.29,53.96,17.67,-3.24,0,-2,-3,2,12,0,8,0,0,0,33.37,5.49,-1.23,86.13,-3.24,2.84,61.07],"hands":{"L":"grip","R":"grip"}},{"t":0.36,"v":[5,80.8,-16.47,0.9984,0.05651,0,0,0.81,0,0,-1.19,0,0,-2.43,0,0,-2,-3,2,12,0,8,0,0,0,50.03,-1.12,3.63,60.61,17.15,-3.53,0,-2,-3,2,12,0,8,0,0,0,24,6.09,-0.61,84.67,4.12,2.82,62.9],"hands":{"L":"grip","R":"grip"}},{"t":0.42,"v":[5,77.51,-20.92,0.99769,0.068,0,0,0.97,0,0,-1.03,0,0,-2.92,0,0,-2,-3,2,12,0,8,0,0,0,58.02,-0.84,4.03,65.81,15.69,-3.84,0,-2,-3,2,12,0,8,0,0,0,11.88,6.49,0.21,76.99,10.78,3.03,61.95],"hands":{"L":"grip","R":"grip"}},{"t":0.48,"v":[5,74.76,-24.62,0.99699,0.07755,0,0,1.11,0,0,-0.89,0,0,-3.34,0,0,-2,-3,2,12,0,8,0,0,0,64.36,-0.57,4.41,69.21,13.85,-4.13,0,-2,-3,2,12,0,8,0,0,0,-0.41,6.48,1.04,64.26,14.69,3.41,58.65],"hands":{"L":"grip","R":"grip"}},{"t":0.53,"v":[5,73.44,-26.41,0.99662,0.08215,0,0,1.18,0,0,-0.82,0,0,-3.53,0,0,-2,-3,2,12,0,8,0,0,0,67.31,-0.43,4.61,70.57,12.78,-4.27,0,-2,-3,2,12,0,8,0,0,0,-8.45,6.19,1.53,52.69,15.69,3.75,54.62],"hands":{"L":"grip","R":"grip"}},{"t":0.58,"v":[5,73,-27,0.99649,0.08368,0,0,1.2,0,0,-0.8,0,0,-3.6,0,0,-2,-3,2,12,0,8,0,0,0,68.28,-0.38,4.68,70.98,12.39,-4.32,0,-2,-3,2,12,0,8,0,0,0,-11.58,5.91,1.68,45.95,11.89,3.61,55],"hands":{"L":"grip","R":"grip"}},{"t":0.66,"v":[4.57,71.22,-28.13,0.99684,0.07945,0,0,1.14,0,0,-0.86,0,0,-3.42,0,0,-2,-3,2,12,0,8,0,0,0,70.63,0.08,4.73,73.7,12.27,-4.09,0,-2,-3,2,12,0,8,0,0,0,-6.88,5.84,1.32,55.6,11.39,3.03,60],"hands":{"L":"grip","R":"grip"}},{"t":0.74,"v":[3.41,66.49,-31.13,0.99767,0.06822,0,0,0.98,0,0,-1.02,0,0,-2.93,0,0,-2,-3,2,12,0,8,0,0,0,76.64,1.24,4.72,80.06,11.26,-3.41,0,-2,-3,2,12,0,8,0,0,0,0.86,5.28,0.68,72.96,12.3,2.03,67.5],"hands":{"L":"grip","R":"grip"}},{"t":0.82,"v":[1.94,60.47,-34.95,0.99855,0.05388,0,0,0.77,0,0,-1.23,0,0,-2.32,0,0,-2,-3,2,12,0,8,0,0,0,84.01,2.57,4.36,86.53,8.66,-2.36,0,-2,-3,2,12,0,8,0,0,0,8.79,4.11,0.13,90.47,10.31,0.89,77.5],"hands":{"L":"grip","R":"grip"}},{"t":0.91,"v":[0.55,54.74,-38.58,0.99919,0.04023,0,0,0.58,0,0,-1.42,0,0,-1.73,0,0,-2,-3,2,12,0,8,0,0,0,90.75,3.51,3.49,91.11,4.91,-1.1,0,-2,-3,2,12,0,8,0,0,0,11.97,2.62,-0.06,102.44,17.57,0.57,77.5],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.5,-40,0.99939,0.0349,0,0,0.5,0,0,-1.5,0,0,-1.5,0,0,-2,-3,2,12,0,8,0,0,0,93.29,3.73,2.97,92.5,3.13,-0.52,0,-2,-3,2,12,0,8,0,0,0,12.98,1.91,-0.08,106.82,20.33,0.41,77.5],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L","optional":"db"},{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor","when":[0,0.06]},{"body":"soleR","prop":"floor","when":[0.58,1]},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6},"dynamic":true},
"thruster":{"keys":[{"t":0,"v":[0,93.9,-3.55,0.9999,0.01396,0,0,0.2,0,0,0.2,0,0,-0.7,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,7.64,5.97,19.94,10.51,2.78,3.55,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,7.64,5.97,19.94,10.51,2.78,3.55,0],"hands":{"L":"grip","R":"grip"}},{"t":0.05,"v":[0,91.19,-6.66,0.9995,0.0315,0,0,0.45,0,0,0.45,0,0,-1.58,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,21.16,9.49,19.89,30.06,10.32,2.92,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,21.16,9.49,19.89,30.06,10.32,2.92,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1,"v":[0,83.19,-14.07,0.99652,0.08335,0,0,1.2,0,0,1.2,0,0,-4.18,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,45.3,14.91,20.93,56.07,17.39,1.28,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,45.3,14.91,20.93,56.07,17.39,1.28,0],"hands":{"L":"grip","R":"grip"}},{"t":0.15,"v":[0,73.45,-22.06,0.98927,0.14608,0,0,2.1,0,0,2.1,0,0,-7.35,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,68.85,20.9,23.83,74.94,18.97,-0.94,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,68.85,20.9,23.83,74.94,18.97,-0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,63.71,-25.68,0.97808,0.20824,0,0,3,0,0,3,0,0,-10.52,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,88.26,28.76,28.32,90.8,20.79,-2.4,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,88.26,28.76,28.32,90.8,20.79,-2.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.71,-28.12,0.96595,0.25873,0,0,3.75,0,0,3.75,0,0,-13.12,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,102.57,38.35,34.56,101.7,20.47,-3.82,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,102.57,38.35,34.56,101.7,20.47,-3.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.3,"v":[0,53,-28.83,0.96126,0.27564,0,0,4,0,0,4,0,0,-14,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,106.86,42.72,37.55,105.06,20.01,-4.36,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,106.86,42.72,37.55,105.06,20.01,-4.36,0],"hands":{"L":"grip","R":"grip"}},{"t":0.35,"v":[0,55.71,-28.12,0.96595,0.25873,0,0,3.75,0,0,3.75,0,0,-13.12,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,102.57,38.35,34.56,101.7,20.47,-3.82,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,102.57,38.35,34.56,101.7,20.47,-3.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,63.71,-25.68,0.97808,0.20824,0,0,3,0,0,3,0,0,-10.52,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,88.26,28.76,28.32,90.8,20.79,-2.4,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,88.26,28.76,28.32,90.8,20.79,-2.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.45,"v":[0,73.45,-22.06,0.98927,0.14608,0,0,2.1,0,0,2.1,0,0,-7.35,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,68.85,20.9,23.83,74.94,18.97,-0.94,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,68.85,20.9,23.83,74.94,18.97,-0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,83.19,-14.12,0.99652,0.08335,0,0,1.14,0,0,1.14,0,0,-4.07,0,0,2.49,9.84,16.26,17.55,3.02,140.2,-11.06,0,0,45.33,14.91,20.93,56.05,17.34,1.27,0,2.49,9.84,16.26,17.55,3.02,140.2,-11.06,0,0,45.33,14.91,20.93,56.05,17.34,1.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.55,"v":[0,91.19,-6.88,0.9995,0.0315,0,0,0.06,0,0,0.06,0,0,-0.8,0,0,5.5,8.83,43.64,23.89,7.47,133.05,-17.31,0,0,21.28,9.48,19.9,30,10.15,2.87,0,5.5,8.83,43.64,23.89,7.47,133.05,-17.31,0,0,21.28,9.48,19.9,30,10.15,2.87,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,93.9,-2.89,0.9999,0.01396,0,0,-0.7,0,0,-0.7,0,0,1.1,0,0,10.08,7.31,73.19,48.61,16.75,111.81,-33.08,0,0,7.27,6,19.94,10.64,3.26,3.7,0,10.08,7.31,73.19,48.61,16.75,111.81,-33.08,0,0,7.27,6,19.94,10.64,3.26,3.7,0],"hands":{"L":"grip","R":"grip"}},{"t":0.65,"v":[0,93.9,-0.49,0.9999,0.01396,0,0,-1.21,0,0,-1.21,0,0,2.12,0,0,14.67,5.78,82.46,88.5,32.67,83.42,-53.84,0,0,5.6,5.98,19.97,10.52,4.71,4.25,0,14.67,5.78,82.46,88.5,32.67,83.42,-53.84,0,0,5.6,5.98,19.97,10.52,4.71,4.25,0],"hands":{"L":"grip","R":"grip"}},{"t":0.7,"v":[0,93.9,0,0.9999,0.01396,0,0,-1.65,0,0,-1.65,0,0,3,0,0,18.63,4.46,74.6,129.79,49.52,45.71,-69.29,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0,18.63,4.46,74.6,129.79,49.52,45.71,-69.29,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93.9,0,0.9999,0.01396,0,0,-1.8,0,0,-1.8,0,0,3.3,0,0,20,4,76.01,145.77,51.23,21.56,-73.37,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0,20,4,76.01,145.77,51.23,21.56,-73.37,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,93.9,0,0.9999,0.01396,0,0,-1.76,0,0,-1.76,0,0,3.22,0,0,19.65,4.12,73.65,141.71,52.15,29.54,-72.39,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0,19.65,4.12,73.65,141.71,52.15,29.54,-72.39,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0],"hands":{"L":"grip","R":"grip"}},{"t":0.85,"v":[0,93.9,0,0.9999,0.01396,0,0,-1.32,0,0,-1.32,0,0,2.34,0,0,15.68,5.44,81.54,98.45,36.88,75.7,-58.16,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0,15.68,5.44,81.54,98.45,36.88,75.7,-58.16,0,0,5.2,5.95,19.97,10.37,4.94,4.36,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9,"v":[0,93.9,-2.97,0.9999,0.01396,0,0,-0.67,0,0,-0.67,0,0,1.04,0,0,9.83,7.39,72.05,46.81,16.08,113.12,-32.01,0,0,7.32,5.99,19.94,10.63,3.2,3.68,0,9.83,7.39,72.05,46.81,16.08,113.12,-32.01,0,0,7.32,5.99,19.94,10.63,3.2,3.68,0],"hands":{"L":"grip","R":"grip"}},{"t":0.95,"v":[0,93.9,-3.72,0.9999,0.01396,0,0,-0.05,0,0,-0.05,0,0,-0.21,0,0,4.21,9.26,32.14,19.99,5.22,136.3,-14.09,0,0,7.73,5.96,19.94,10.46,2.65,3.51,0,4.21,9.26,32.14,19.99,5.22,136.3,-14.09,0,0,7.73,5.96,19.94,10.46,2.65,3.51,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93.9,-3.55,0.9999,0.01396,0,0,0.2,0,0,0.2,0,0,-0.7,0,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,7.64,5.97,19.94,10.51,2.78,3.55,0,2,10,12.16,17.62,2.16,140,-11.06,0,0,7.64,5.97,19.94,10.51,2.78,3.55,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6},"dynamic":true,"loop":true},
"goblet":{"keys":[{"t":0,"v":[0,93.4,-2.58,0.9999,0.01396,0,0,0.2,0,0,0.2,0,0,-0.7,0,0,0,6,-5.32,15.14,-20.14,129.57,-10.48,-0.02,-22.23,9.78,7,19.86,16.33,6.25,3.79,0,0,6,-5.32,15.14,-20.14,129.57,-10.48,-0.02,-22.23,9.78,7,19.86,16.33,6.25,3.79,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,87.48,-8.59,0.9985,0.05483,0,0,0.79,0,0,0.79,0,0,-2.75,0,0,0,6,-5.04,17.05,-21.23,128.43,-9.08,-0.03,-15.16,32.39,12.33,20.12,44.84,16.09,2.58,0,0,6,-5.04,17.05,-21.23,128.43,-9.08,-0.03,-15.16,32.39,12.33,20.12,44.84,16.09,2.58,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,73.2,-20.53,0.98823,0.15299,0,0,2.2,0,0,2.2,0,0,-7.7,0,0,0,6,-2.61,22.58,-24.17,125.28,-6.11,-0.04,0.99,69.17,21.19,23.78,76.4,20.77,-0.48,0,0,6,-2.61,22.58,-24.17,125.28,-6.11,-0.04,0.99,69.17,21.19,23.78,76.4,20.77,-0.48,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,58.92,-25.12,0.96834,0.24965,0,0,3.61,0,0,3.61,0,0,-12.65,0,0,0,6,2.52,29.8,-27.91,122.08,-2.66,-0.12,14.97,97.26,34.24,31.41,99.09,23.32,-2.41,0,0,6,2.52,29.8,-27.91,122.08,-2.66,-0.12,14.97,97.26,34.24,31.41,99.09,23.32,-2.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,53,-26.6,0.95732,0.28903,0,0,4.2,0,0,4.2,0,0,-14.7,0,0,0,6,5.57,33.49,-29.93,120.95,-0.86,-0.52,19.79,107.26,43.05,37.23,106.9,22.86,-3.38,0,0,6,5.57,33.49,-29.93,120.95,-0.86,-0.52,19.79,107.26,43.05,37.23,106.9,22.86,-3.38,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g2FistDumbbell","id":"gdb","optionalNot":"kb"},{"type":"g2KbHorns","id":"kb","optional":"kb"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"handL","prop":"gdb:top","optional":true},{"body":"handR","prop":"gdb:top","optional":true},{"body":"gripL","prop":"kb:hornL","optional":true},{"body":"gripR","prop":"kb:hornR","optional":true}],"gripRadius":{"L":1.7,"R":1.7}},
"kbswing":{"keys":[{"t":0,"v":[0,83.5,-25,0.89101,0.45399,0,0,1.8,0,0,3,0,0,-16,0,0,-4,8,33.04,-8.93,-70.54,13.61,23.38,0,-21,86.4,31.17,40.31,43.05,0.98,2.47,0,-4,8,33.04,-8.93,-70.54,13.61,23.38,0,-21,86.4,31.17,40.31,43.05,0.98,2.47,0],"hands":{"L":"grip","R":"grip"}},{"t":0.15,"v":[0,84.75,-21.62,0.91789,0.39684,0,0,1.56,0,0,2.6,0,0,-14.2,0,0,-3.56,8.22,31.48,-8.97,-71.32,13.39,22.42,0,-20.97,77.18,27.88,37.14,42.04,2.82,3.61,0,-3.56,8.22,31.48,-8.97,-71.32,13.39,22.42,0,-20.97,77.18,27.88,37.14,42.04,2.82,3.61,0],"hands":{"L":"grip","R":"grip"}},{"t":0.3,"v":[0,86.88,-15.82,0.95535,0.29546,0,0,1.15,0,0,1.91,0,0,-11.11,0,0,-2.35,8.82,34.9,-9.37,-69.83,13.15,24.36,0,-20.84,60.26,23.39,32.84,38.79,5.18,5.46,0,-2.35,8.82,34.9,-9.37,-69.83,13.15,24.36,0,-20.84,60.26,23.39,32.84,38.79,5.18,5.46,0],"hands":{"L":"grip","R":"grip"}},{"t":0.45,"v":[0,89.28,-9.3,0.98417,0.17721,0,0,0.68,0,0,1.13,0,0,-7.63,0,0,-0.63,9.69,43.49,-10.12,-66.5,12.97,28.83,0.01,-20.63,39.51,19.37,29.37,32.27,6.32,7.42,0,-0.63,9.69,43.49,-10.12,-66.5,12.97,28.83,0.01,-20.63,39.51,19.37,29.37,32.27,6.32,7.42,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,91.53,-3.17,0.99797,0.06371,0,0,0.24,0,0,0.41,0,0,-4.36,0,0,1.24,10.62,54.84,-11.21,-63.2,12.86,33.68,0.04,-20.38,17.65,15.71,27.32,21.34,4.87,9.14,0,1.24,10.62,54.84,-11.21,-63.2,12.86,33.68,0.04,-20.38,17.65,15.71,27.32,21.34,4.87,9.14,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,92.7,0,0.99988,-0.01571,0,0,-0.06,0,0,-0.1,0,0,-1.79,0,0,2.83,11.41,66.79,-12.52,-61.1,12.85,37.55,0,-20.18,1.42,12.86,26.67,9.97,1.23,9.99,0,2.83,11.41,66.79,-12.52,-61.1,12.85,37.55,0,-20.18,1.42,12.86,26.67,9.97,1.23,9.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9,"v":[0,92.7,0,0.99988,-0.01571,0,0,-0.06,0,0,-0.1,0,0,-0.29,0,0,3.8,11.9,79.97,-14.3,-60.43,12.89,40.34,0.01,-20.03,1.42,12.86,26.67,9.97,1.23,9.99,0,3.8,11.9,79.97,-14.3,-60.43,12.89,40.34,0.01,-20.03,1.42,12.86,26.67,9.97,1.23,9.99,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,92.7,0,0.99988,-0.01571,0,0,-0.06,0,0,-0.1,0,0,0,0,0,4,12,82.62,-14.73,-60.52,12.89,40.72,0.01,-20,1.42,12.86,26.67,9.97,1.23,9.99,0,4,12,82.62,-14.73,-60.52,12.89,40.72,0.01,-20,1.42,12.86,26.67,9.97,1.23,9.99,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"kettlebell","id":"kb","hands":["L","R"],"hang":"arm"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"kb"},{"body":"gripR","prop":"kb"}],"gripRadius":{"L":1.7,"R":1.7},"dynamic":true},
"calfraise":{"keys":[{"t":0,"v":[0,106.37,-12.69,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,-4,-2,13,0,8,0,0,0,-8.48,1.21,0.09,5,19.48,1.22,-6,-2,-4,-2,13,0,8,0,0,0,-8.48,1.21,0.09,5,19.48,1.22,-6],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,107.98,-12.76,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,-4,-2,13,0,8,0,0,0,-8.01,1.21,0.09,5,12.86,1.22,0.15,-2,-4,-2,13,0,8,0,0,0,-8.01,1.21,0.09,5,12.86,1.22,0.15],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,111.62,-12.98,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,-4,-2,13,0,8,0,0,0,-6.42,1.21,0.07,5,-3.58,1.17,15,-2,-4,-2,13,0,8,0,0,0,-6.42,1.21,0.07,5,-3.58,1.17,15],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,114.65,-13.31,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,-4,-2,13,0,8,0,0,0,-4.26,1.21,0.04,5,-20.6,1.05,29.85,-2,-4,-2,13,0,8,0,0,0,-4.26,1.21,0.04,5,-20.6,1.05,29.85],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,115.66,-13.47,1,0,0,0,0,0,0,0,0,0,2,0,0,-2,-4,-2,13,0,8,0,0,0,-3.23,1.21,0.03,5,-27.78,0.98,36,-2,-4,-2,13,0,8,0,0,0,-3.23,1.21,0.03,5,-27.78,0.98,36],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g2Step","id":"step"},{"type":"dumbbell","id":"dbL","hand":"L","optional":"db"},{"type":"dumbbell","id":"dbR","hand":"R","optional":"db"}],"contacts":[{"body":"soleL","prop":"step:top"},{"body":"soleR","prop":"step:top"},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6}},
"farmer":{"keys":[{"t":0,"v":[0,93.8,0.7,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0],"hands":{"L":"grip","R":"grip"}},{"t":0.0625,"v":[-0.43,93.83,0.22,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,17.18,5.49,15.19,34.02,1.98,-1.27,14.17,-4,-6,-3,15,0,8,0,0,0,6.13,2.09,15.3,14.22,7.75,0.39,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[-4.19,93.97,0,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,23.56,9.44,14.63,42.67,-10.56,-1.22,28.33,-4,-6,-3,15,0,8,0,0,0,5.11,-0.75,15.4,11.81,7.09,-2.08,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1875,"v":[-6.52,94.06,0,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,28.79,5.28,-1.48,53.26,-1.32,8.23,25.75,-4,-6,-3,15,0,8,0,0,0,3.45,-2.76,15.4,8.42,5.82,-3.58,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[-7.45,94.1,0.01,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,27.14,5.8,-1.51,54.67,15.56,7.59,12,-4,-6,-3,15,0,8,0,0,0,2.39,-3.67,15.37,6.25,4.92,-4.17,0],"hands":{"L":"grip","R":"grip"}},{"t":0.3125,"v":[-6.51,94.06,0.02,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,25.16,5.14,-1.23,48.62,6.49,7.3,17,-4,-6,-3,15,0,8,0,0,0,3.44,-2.75,15.4,8.43,5.84,-3.57,0],"hands":{"L":"grip","R":"grip"}},{"t":0.375,"v":[-4.13,93.97,0.25,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,17.94,8.15,14.76,34.93,-1,0.73,16.67,-4,-6,-3,15,0,8,0,0,0,4.93,-0.71,15.4,11.8,7.23,-2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4375,"v":[-0.39,93.83,0.38,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,13.48,4.57,15.21,27.97,5.52,-0.35,8.33,-4,-6,-3,15,0,8,0,0,0,6.01,2.11,15.29,14.19,7.84,0.45,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93.8,0.7,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5625,"v":[0.43,93.83,0.22,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,6.13,2.09,15.3,14.22,7.75,0.39,0,-4,-6,-3,15,0,8,0,0,0,17.18,5.49,15.19,34.02,1.98,-1.27,14.17],"hands":{"L":"grip","R":"grip"}},{"t":0.625,"v":[4.19,93.97,0,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,5.11,-0.75,15.4,11.81,7.09,-2.08,0,-4,-6,-3,15,0,8,0,0,0,23.56,9.44,14.63,42.67,-10.56,-1.22,28.33],"hands":{"L":"grip","R":"grip"}},{"t":0.6875,"v":[6.52,94.06,0,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,3.45,-2.76,15.4,8.42,5.82,-3.58,0,-4,-6,-3,15,0,8,0,0,0,28.79,5.28,-1.48,53.26,-1.32,8.23,25.75],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[7.45,94.1,0.01,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,2.39,-3.67,15.37,6.25,4.92,-4.17,0,-4,-6,-3,15,0,8,0,0,0,27.14,5.8,-1.51,54.67,15.56,7.59,12],"hands":{"L":"grip","R":"grip"}},{"t":0.8125,"v":[6.51,94.06,0.02,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,3.44,-2.75,15.4,8.43,5.84,-3.57,0,-4,-6,-3,15,0,8,0,0,0,25.16,5.14,-1.23,48.62,6.49,7.3,17],"hands":{"L":"grip","R":"grip"}},{"t":0.875,"v":[4.13,93.97,0.25,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,4.93,-0.71,15.4,11.8,7.23,-2,0,-4,-6,-3,15,0,8,0,0,0,17.94,8.15,14.76,34.93,-1,0.73,16.67],"hands":{"L":"grip","R":"grip"}},{"t":0.9375,"v":[0.39,93.83,0.38,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,6.01,2.11,15.29,14.19,7.84,0.45,0,-4,-6,-3,15,0,8,0,0,0,13.48,4.57,15.21,27.97,5.52,-0.35,8.33],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93.8,0.7,1,0,0,0,0,0,0,-2,0,0,-2,0,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0,-4,-6,-3,15,0,8,0,0,0,5.91,2.4,15.28,14.42,8.09,0.76,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L","optionalNot":"kb"},{"type":"dumbbell","id":"dbR","hand":"R","optionalNot":"kb"},{"type":"kettlebell","id":"kbL","hands":["L"],"hang":"gravity","optional":"kb"},{"type":"kettlebell","id":"kbR","hands":["R"],"hang":"gravity","optional":"kb"}],"contacts":[{"body":"soleL","prop":"floor","when":[0,0.14]},{"body":"soleL","prop":"floor","when":[0.36,1]},{"body":"soleR","prop":"floor","when":[0,0.64]},{"body":"soleR","prop":"floor","when":[0.86,1]},{"body":"gripL","prop":"dbL","optional":true},{"body":"gripR","prop":"dbR","optional":true},{"body":"gripL","prop":"kbL","optional":true},{"body":"gripR","prop":"kbR","optional":true}],"gripRadius":{"L":1.6,"R":1.6},"loop":true},
"latraise":{"keys":[{"t":0,"v":[0,94,0,0.99863,0.05234,0,0,1,0,0,2,0,0,-6,0,0,0,-0.62,10,14,2,16,2,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0,0,-0.62,10,14,2,16,2,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94,0,0.99863,0.05234,0,0,1,0,0,2,0,0,-6,0,0,0,-0.42,11.76,24.25,1.12,16,2.59,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0,0,-0.42,11.76,24.25,1.12,16,2.59,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94,0,0.99863,0.05234,0,0,1,0,0,2,0,0,-6,0,0,4.74,-0.06,16,49,-1,16,4,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0,4.74,-0.06,16,49,-1,16,4,0,0,11.16,3.08,15.4,11.93,6.14,1.6,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,94,-0.54,0.99863,0.05234,0,0,1,0,0,2,0,0,-6,0,0,10.22,0.06,20.24,73.75,-3.12,16,5.41,0,0,11.55,3.09,15.4,11.99,5.82,1.5,0,10.22,0.06,20.24,73.75,-3.12,16,5.41,0,0,11.55,3.09,15.4,11.99,5.82,1.5,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94,-0.81,0.99863,0.05234,0,0,1,0,0,2,0,0,-6,0,0,12.5,0.02,22,84,-4,16,6,0,0,11.74,3.09,15.4,12.01,5.65,1.46,0,12.5,0.02,22,84,-4,16,6,0,0,11.74,3.09,15.4,12.01,5.65,1.46,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"frontraise":{"keys":[{"t":0,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2.33,17,7,-14,8,80,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,2.33,17,7,-14,8,80,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,3.71,27.69,6.85,-13.41,8.29,80,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,3.71,27.69,6.85,-13.41,8.29,80,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94.2,-3.44,1,0,0,0,0,0,0,0,0,0,0,0,0,5.26,6.42,53.5,6.5,-12,9,80,0,0,5.79,2.61,15.26,8.51,2.23,0.99,0,5.26,6.42,53.5,6.5,-12,9,80,0,0,5.79,2.61,15.26,8.51,2.23,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,94.2,-5.48,1,0,0,0,0,0,0,0,0,0,0,0,0,10.9,7.84,79.31,6.15,-10.59,9.71,80,0,0,6.36,2.39,15.28,6.88,0.12,0.63,0,10.9,7.84,79.31,6.15,-10.59,9.71,80,0,0,6.36,2.39,15.28,6.88,0.12,0.63,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.2,-5.58,1,0,0,0,0,0,0,0,0,0,0,0,0,13.24,7.98,90,6,-10,10,80,0,0,6.36,2.37,15.28,6.76,-0.01,0.61,0,13.24,7.98,90,6,-10,10,80,0,0,6.36,2.37,15.28,6.76,-0.01,0.61,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"sidebend":{"keys":[{"t":0,"v":[0,93.4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,59.05,130.72,69.2,117.69,-7.94,-7.4,6.25,8.03,4.52,15.14,17.79,8.85,2.26,0,0,0,-11.7,14.43,-15.26,26.9,-18.83,0,0,8.03,4.52,15.14,17.79,8.85,2.26,0],"hands":{"L":"flat","R":"grip"}},{"t":0.25,"v":[0.57,93.4,0,1,0,0,0,0,1.9,0,0,2.2,0,0,0.59,0,0,0,59.62,130.74,68.79,117.39,-8.14,-7.26,6.81,8.11,4.16,15.17,17.96,9.03,1.89,0,0,0,-11.78,18.47,-14.83,26.9,-18.83,0,0,7.93,4.88,15.11,17.58,8.65,2.63,0],"hands":{"L":"flat","R":"grip"}},{"t":0.5,"v":[3.24,93.4,0,1,0,0,0,0,6.5,0,0,7.5,0,0,2,0,0,0,61.05,130.75,67.79,116.67,-8.62,-6.92,8.17,8.27,2.42,15.31,18.3,9.68,0.15,0,0,0,-12.06,28.23,-13.79,26.9,-18.83,0,0,7.23,6.47,14.99,16.13,7.46,4.36,0],"hands":{"L":"flat","R":"grip"}},{"t":0.75,"v":[5.68,93.4,0,1,0,0,0,0,11.1,0,0,12.8,0,0,3.41,0,0,0,62.54,130.73,66.74,115.95,-9.09,-6.55,9.51,8.12,0.75,15.42,17.99,9.96,-1.44,0,0,0,-12.48,37.97,-12.69,26.9,-18.83,0,0,6.14,7.8,14.9,13.89,5.92,5.94,0],"hands":{"L":"flat","R":"grip"}},{"t":1,"v":[6.63,93.4,0,1,0,0,0,0,13,0,0,15,0,0,4,0,0,0,63.18,130.71,66.29,115.65,-9.29,-6.4,10.06,7.98,0.07,15.46,17.71,9.99,-2.06,0,0,0,-12.7,42.01,-12.22,26.9,-18.83,0,0,5.56,8.27,14.89,12.69,5.16,6.55,0],"hands":{"L":"flat","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.4,"R":1.6}},
"ohext":{"keys":[{"t":0,"v":[0,94.2,0,1,0,0,0,1,0,0,0,0,0,4,0,0,26,2,88.54,141.23,1.13,42.48,80.63,-61.43,-15.34,3.74,2.68,15.26,9.01,4.7,1.59,0,26,2,10.8,170.36,59.72,38.41,62.9,-64,-18.44,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"flat","R":"flat"}},{"t":0.08333333333333333,"v":[0,94.2,0,1,0,0,0,1,0,0,0,0,0,4.1,0,0,25.93,1.97,67.71,153.64,17.58,42.17,76.25,-62.1,-11.84,3.74,2.68,15.26,9.01,4.7,1.59,0,25.93,1.97,-22.16,170.01,82.13,36.51,57.3,-64.72,-13.07,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"flat","R":"flat"}},{"t":0.16666666666666666,"v":[0,94.2,0,1,0,0,0,1,0,0,0,0,0,4.4,0,0,25.73,1.87,8.11,168.78,59.77,42.19,67.61,-62.68,-4.5,3.74,2.68,15.26,9.01,4.7,1.59,0,25.73,1.87,25.48,169.65,71.71,33.33,57,-61.29,8.53,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,94.2,0,1,0,0,0,1,0,0,0,0,0,4.88,0,0,25.41,1.71,29.75,163.07,65.54,44.93,65.91,-57.54,12.23,3.74,2.68,15.26,9.01,4.7,1.59,0,25.41,1.71,36.79,168.54,81.8,33.54,60.74,-55.71,11.91,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"flat","R":"flat"}},{"t":0.3333333333333333,"v":[0,94.2,0.24,1,0,0,0,1,0,0,0,0,0,5.5,0,0,25,1.5,47.42,156.02,71.09,52.06,67.94,-48.62,17.4,3.55,2.67,15.26,8.96,4.83,1.64,0,25,1.5,78.79,154.7,73.93,38.63,70.45,-46.26,13.47,3.55,2.67,15.26,8.96,4.83,1.64,0],"hands":{"L":"flat","R":"flat"}},{"t":0.4166666666666667,"v":[0,94.2,1.34,1,0,0,0,1,0,0,0,0,0,6.22,0,0,24.52,1.26,75.72,142.06,65.44,63.32,72.84,-36.56,12.8,2.62,2.62,15.27,8.56,5.34,1.83,0,24.52,1.26,138.27,107,41.24,47.91,79.6,-34.49,17.65,2.62,2.62,15.27,8.56,5.34,1.83,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,94.2,2.24,1,0,0,0,1,0,0,0,0,0,7,0,0,24,1,68.05,144.42,78.56,75.31,72.74,-24.55,17.14,1.76,2.54,15.28,8.02,5.65,1.99,0,24,1,116.17,130.73,66.23,60.2,80.7,-22.25,14.04,1.76,2.54,15.28,8.02,5.65,1.99,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5833333333333334,"v":[0,94.2,2.21,1,0,0,0,1,0,0,0,0,0,7.78,0,0,23.48,0.74,77.52,132.78,71.08,94.88,74.72,-11.66,15.19,1.79,2.55,15.28,8.04,5.65,1.98,0,23.48,0.74,98.99,135.55,73.62,81.95,78.43,-8.25,8.68,1.79,2.55,15.28,8.04,5.65,1.98,0],"hands":{"L":"flat","R":"flat"}},{"t":0.6666666666666666,"v":[0,94.2,2.23,1,0,0,0,1,0,0,0,0,0,8.5,0,0,23,0.5,82.76,126.91,67.73,106.88,75.74,-2.4,14.74,1.77,2.54,15.28,8.03,5.65,1.99,0,23,0.5,110.5,123.98,64.3,94.43,79.54,1.68,8.29,1.77,2.54,15.28,8.03,5.65,1.99,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,94.2,2.1,1,0,0,0,1,0,0,0,0,0,9.12,0,0,22.59,0.29,85.34,122.81,64.52,116.23,76.63,4.26,13.13,1.9,2.56,15.28,8.12,5.61,1.96,0,22.59,0.29,116.16,116.36,58,104.21,80.12,9.01,7.05,1.9,2.56,15.28,8.12,5.61,1.96,0],"hands":{"L":"flat","R":"flat"}},{"t":0.8333333333333334,"v":[0,94.2,1.87,1,0,0,0,1,0,0,0,0,0,9.6,0,0,22.27,0.13,104.24,105.56,48.03,122.78,80.73,9.45,16.15,2.13,2.58,15.27,8.27,5.54,1.92,0,22.27,0.13,118.08,112.29,54.34,111.16,80.4,13.85,5.48,2.13,2.58,15.27,8.27,5.54,1.92,0],"hands":{"L":"flat","R":"flat"}},{"t":0.9166666666666666,"v":[0,94.2,1.72,1,0,0,0,1,0,0,0,0,0,9.9,0,0,22.07,0.03,102.43,105.63,47.47,126.6,81.2,11.59,14.34,2.27,2.59,15.27,8.36,5.49,1.9,0,22.07,0.03,118.25,110.62,52.58,115.28,80.52,16.51,4.2,2.27,2.59,15.27,8.36,5.49,1.9,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,94.2,1.67,1,0,0,0,1,0,0,0,0,0,10,0,0,22,0,101.64,105.8,47.34,127.84,81.38,12.24,13.63,2.32,2.59,15.27,8.39,5.47,1.89,0,22,0,118.12,110.22,52.08,116.63,80.55,17.35,3.7,2.32,2.59,15.27,8.39,5.47,1.89,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"g2CupDumbbell","id":"cup","hands":["L","R"]}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"palmL","prop":"cup:top"},{"body":"palmR","prop":"cup:top"}]},
"dbpress":{"keys":[{"t":0,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,4,2,-8.99,61.92,82.86,118.31,-0.97,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,4,2,-8.99,61.92,82.86,118.31,-0.97,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,6.05,2.59,-7.47,75.64,82.79,111.93,-3.78,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,6.05,2.59,-7.47,75.64,82.79,111.93,-3.78,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,11,4,-4.65,108.71,81.75,89.73,-8.94,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,11,4,-4.65,108.71,81.75,89.73,-8.94,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,15.95,5.41,2.11,146.89,75.38,51.96,-14.11,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,15.95,5.41,2.11,146.89,75.38,51.96,-14.11,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,18,6,83.56,149.52,17.4,15.76,-15.05,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,18,6,83.56,149.52,17.4,15.76,-15.05,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":84,"seat":4,"optional":"incline"},{"type":"flatBench","id":"flat","height":45,"at":[0,0,31],"optionalNot":"incline"},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:back","optional":true},{"body":"buttocks","prop":"bench:seat","optional":true},{"body":"buttocks","prop":"flat:pad","optional":true},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"arnold":{"keys":[{"t":0,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,2,10,28.93,18.55,-1.45,129.77,-88,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,2,10,28.93,18.55,-1.45,129.77,-88,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,3.53,9.62,31.27,26.87,11.37,131.72,-88,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,3.53,9.62,31.27,26.87,11.37,131.72,-88,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,7.53,8.62,24.59,56.3,49.2,124.31,-87.73,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,7.53,8.62,24.59,56.3,49.2,124.31,-87.73,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,12.47,7.38,16.27,98.37,69.37,98.45,-59.5,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,12.47,7.38,16.27,98.37,69.37,98.45,-59.5,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,16.47,6.38,31.09,140.79,64.8,55.44,-18.83,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,16.47,6.38,31.09,140.79,64.8,55.44,-18.83,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.89,-9.48,0,0,0.99863,0.05234,2,0,0,-2,0,0,2,0,0,18,6,102.44,134.92,15.65,16.76,-0.94,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0,18,6,102.44,134.92,15.65,16.76,-0.94,0,0,78.34,25.12,23.36,95.13,7.17,-7.41,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":84,"seat":4,"optional":"incline"},{"type":"flatBench","id":"flat","height":45,"at":[0,0,31],"optionalNot":"incline"},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:back","optional":true},{"body":"buttocks","prop":"bench:seat","optional":true},{"body":"buttocks","prop":"flat:pad","optional":true},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"inclinecurl":{"keys":[{"t":0,"v":[0,54.31,-4.91,0,0,0.95372,0.30071,-2,0,0,-2,0,0,-1.39,0,0,-2,-8,-39,19,4,6,-82,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0,-2,-8,-39,19,4,6,-82,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,54.31,-4.91,0,0,0.95372,0.30071,-2,0,0,-2,0,0,-1.39,0,0,-2,-8,-38.12,19,5.46,24.45,-82.59,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0,-2,-8,-38.12,19,5.46,24.45,-82.59,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,54.31,-4.91,0,0,0.95372,0.30071,-2,0,0,-2,0,0,-1.39,0,0,-2,-8,-36,19,9,69,-84,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0,-2,-8,-36,19,9,69,-84,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,54.31,-4.91,0,0,0.95372,0.30071,-2,0,0,-2,0,0,-1.39,0,0,-2,-8,-33.88,19,12.54,113.55,-85.41,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0,-2,-8,-33.88,19,12.54,113.55,-85.41,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,54.31,-4.91,0,0,0.95372,0.30071,-2,0,0,-2,0,0,-1.39,0,0,-2,-8,-33,19,14,132,-86,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0,-2,-8,-33,19,14,132,-86,0,0,48.78,18.85,19.08,93.65,8.18,-9.89,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":55,"seat":10},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:back"},{"body":"headBack","prop":"bench:back"},{"body":"buttocks","prop":"bench:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"dbincline":{"keys":[{"t":0,"v":[0,54.58,-5.84,0,0,0.88701,0.46175,-4,0,0,-4,0,0,10.7,0,0,-4,-6,109.15,22.02,-53.11,23.39,19.5,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0,-4,-6,109.15,22.02,-53.11,23.39,19.5,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,54.58,-5.84,0,0,0.88701,0.46175,-4,0,0,-4,0,0,10.7,0,0,-4,-7.17,83.9,54.39,-25.66,57.48,20.22,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0,-4,-7.17,83.9,54.39,-25.66,57.48,20.22,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,54.58,-5.84,0,0,0.88701,0.46175,-4,0,0,-4,0,0,10.7,0,0,-4,-10,34.21,71.7,5.54,97.17,20.22,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0,-4,-10,34.21,71.7,5.54,97.17,20.22,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,54.58,-5.84,0,0,0.88701,0.46175,-4,0,0,-4,0,0,10.7,0,0,-4,-12.83,-8.2,62.06,24.88,121.32,23.06,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0,-4,-12.83,-8.2,62.06,24.88,121.32,23.06,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,54.58,-5.84,0,0,0.88701,0.46175,-4,0,0,-4,0,0,10.7,0,0,-4,-14,-24.59,53.38,31.29,127.99,26.37,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0,-4,-14,-24.59,53.38,31.29,127.99,26.37,0,0,29.72,18.57,12.09,92.59,6.66,-5.88,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":35,"seat":8},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:back"},{"body":"headBack","prop":"bench:back"},{"body":"buttocks","prop":"bench:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"dbbench":{"keys":[{"t":0,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-6,74.95,12.36,-58.37,19.14,23.23,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-6,74.95,12.36,-58.37,19.14,23.23,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-7.17,58.76,36.8,-42.78,52.25,24.95,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-7.17,58.76,36.8,-42.78,52.25,24.95,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-10,24.41,61.04,-20.61,89.44,29.89,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-10,24.41,61.04,-20.61,89.44,29.89,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-12.83,-11.94,67.23,-1.68,113.24,33.89,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-12.83,-11.94,67.23,-1.68,113.24,33.89,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-14,-28.04,65.38,6.28,120.92,36.95,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-14,-28.04,65.38,6.28,120.92,36.95,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"dbfly":{"keys":[{"t":0,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-4,70.49,8.68,-66.99,25.2,-69.67,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-4,70.49,8.68,-66.99,25.2,-69.67,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-4.95,68.23,20.61,-58.68,25.73,-69.75,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-4.95,68.23,20.61,-58.68,25.73,-69.75,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-7.45,55.27,47.61,-37.38,24.98,-69.83,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-7.45,55.27,47.61,-37.38,24.98,-69.83,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-10.55,28.44,70.74,-10.98,22.26,-69.02,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-10.55,28.44,70.74,-10.98,22.26,-69.02,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-13.05,-0.14,79.16,11.39,21.39,-68.27,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-13.05,-0.14,79.16,11.39,21.39,-68.27,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.12,-24,0,0,0.7403,0.67227,-5,0,0,-8,0,0,10.35,0,0,-4,-14,-12.29,79.25,20.36,21.88,-68.14,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0,-4,-14,-12.29,79.25,20.36,21.88,-68.14,0,0,0.75,23.97,6.92,84.31,-1.36,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"dbcurl":{"keys":[{"t":0,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,-4,6,16,-4,12,-86,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,-4,6,16,-4,12,-86,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,-3.12,7.46,15.56,-2.24,30.16,-86.59,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,-3.12,7.46,15.56,-2.24,30.16,-86.59,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94.2,-2.96,1,0,0,0,0,0,0,0,0,0,2,0,0,0,-1,11,14.5,2,74,-88,0,0,5.58,2.64,15.26,8.73,2.65,1.07,0,0,-1,11,14.5,2,74,-88,0,0,5.58,2.64,15.26,8.73,2.65,1.07,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,94.2,-0.83,1,0,0,0,0,0,0,0,0,0,2,0,0,0,1.12,14.54,13.44,6.24,117.84,-89.41,0,0,4.34,2.69,15.26,9.11,4.21,1.45,0,0,1.12,14.54,13.44,6.24,117.84,-89.41,0,0,4.34,2.69,15.26,9.11,4.21,1.45,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,2,16,13,8,136,-90,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,2,16,13,8,136,-90,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"hammer":{"keys":[{"t":0,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,9,0,10,4,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,0,2,9,0,10,4,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,3.76,8.85,0,28.16,4.59,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,0,3.76,8.85,0,28.16,4.59,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,94.2,-2.5,1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,8,8.5,0,72,6,0,0,5.35,2.66,15.26,8.89,3.03,1.15,0,0,0,8,8.5,0,72,6,0,0,5.35,2.66,15.26,8.89,3.03,1.15,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,94.2,-1.45,1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,12.24,8.15,0,115.84,7.41,0,0,4.75,2.68,15.26,9.09,3.8,1.34,0,0,0,12.24,8.15,0,115.84,7.41,0,0,4.75,2.68,15.26,9.09,3.8,1.34,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,94.2,0,1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,14,8,0,134,8,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0,0,0,14,8,0,134,8,0,0,3.74,2.68,15.26,9.01,4.7,1.59,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}},
"bandlatraise":{"keys":[{"t":0,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,4,-12.71,22.43,-23.98,39.01,5,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,4,-12.71,22.43,-23.98,39.01,5,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,1.17,4.29,-9.34,33.78,-24.59,38.3,7.93,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,1.17,4.29,-9.34,33.78,-24.59,38.3,7.93,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,4,5,-0.97,64.74,-37.38,38.48,15,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,4,5,-0.97,64.74,-37.38,38.48,15,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,6.83,5.71,6.68,97.48,-55.49,42.09,22.07,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,6.83,5.71,6.68,97.48,-55.49,42.09,22.07,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,8,6,8.24,110.96,-60.3,44.48,25,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,8,6,8.24,110.96,-60.3,44.48,25,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"band","id":"band","fromSole":true,"r":0.7}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"band:handleL"},{"body":"gripR","prop":"band:handleR"}],"gripRadius":{"L":1.6,"R":1.6}},
"bandcurl":{"keys":[{"t":0,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,0,3.53,4.55,3.81,13.55,-75,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,0,3.53,4.55,3.81,13.55,-75,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,0,4.24,4.51,3.19,29.92,-75.73,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,0,4.24,4.51,3.19,29.92,-75.73,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,0,5.86,4.74,4.18,69.55,-77.5,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,0,5.86,4.74,4.18,69.55,-77.5,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,0,7.44,5.38,7.51,108.99,-79.27,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,0,7.44,5.38,7.51,108.99,-79.27,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93.5,5.55,0.99996,0.00873,0,0,-2,0,0,0,0,0,2,0,0,0,0,8.02,5.96,10.45,125.21,-80,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0,0,0,8.02,5.96,10.45,125.21,-80,0,0,4.66,1.91,13.68,15.56,11.55,0.99,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"band","id":"band","fromSole":true,"r":0.7}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"band:handleL"},{"body":"gripR","prop":"band:handleR"}],"gripRadius":{"L":1.6,"R":1.6}},
"bandpushdown":{"keys":[{"t":0,"v":[5.24,92.5,0,0.70442,0.06163,0.70442,-0.06163,-2,0,0,2,0,0,-6,0,0,0,0,16.29,10.37,-6.99,81.42,40,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0,0,0,16.29,10.37,-6.99,81.42,40,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[5.24,92.5,0,0.70442,0.06163,0.70442,-0.06163,-2,0,0,2,0,0,-6,0,0,0,0,16.82,9.98,-9.28,69,37.07,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0,0,0,16.82,9.98,-9.28,69,37.07,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[5.24,92.5,0,0.70442,0.06163,0.70442,-0.06163,-2,0,0,2,0,0,-6,0,0,0,0,18.01,8.42,-17.27,39.31,30,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0,0,0,18.01,8.42,-17.27,39.31,30,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[5.24,92.5,0,0.70442,0.06163,0.70442,-0.06163,-2,0,0,2,0,0,-6,0,0,0,0,17.16,5.19,-36.03,13.71,22.93,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0,0,0,17.16,5.19,-36.03,13.71,22.93,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[5.24,92.5,0,0.70442,0.06163,0.70442,-0.06163,-2,0,0,2,0,0,-6,0,0,0,0,12.47,6.38,-53.7,14.08,20,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0,0,0,12.47,6.38,-53.7,14.08,20,0,0,18.6,3.33,14.88,23.96,14.8,1.01,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Door","id":"door","anchor":"top","at":[72,0,0],"yaw":90},{"type":"g3band","id":"band","from":[64.6,199.2,0],"mountTo":"door:ring","r":0.7}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"band:handleL"},{"body":"gripR","prop":"band:handleR"}],"gripRadius":{"L":1.6,"R":1.6}},
"bandfacepull":{"keys":[{"t":0,"v":[5.17,93,0,0.707,0.01234,0.707,-0.01234,-2,0,0,0,0,0,-4,0,0,4,16,79.25,24.22,-42.2,64.06,70,0,0,7.04,4.05,14.6,19.29,13.39,2.64,0,4,16,79.25,24.22,-42.2,64.06,70,0,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[5.17,93,0,0.707,0.01234,0.707,-0.01234,-2,0,0,0,0,0,-3.12,0,0,4.29,11.31,75.3,42.42,-32.31,84.07,60.48,-1.46,0,7.04,4.05,14.6,19.29,13.39,2.64,0,4.29,11.31,75.3,42.42,-32.31,84.07,60.48,-1.46,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[5.17,93,0,0.707,0.01234,0.707,-0.01234,-2,0,0,0,0,0,-1,0,0,5,0,55.61,90.79,2.71,111.81,37.5,-5,0,7.04,4.05,14.6,19.29,13.39,2.64,0,5,0,55.61,90.79,2.71,111.81,37.5,-5,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[5.17,93,0,0.707,0.01234,0.707,-0.01234,-2,0,0,0,0,0,1.12,0,0,5.71,-11.31,-11.2,112.11,64.44,126.74,14.52,-8.54,0,7.04,4.05,14.6,19.29,13.39,2.64,0,5.71,-11.31,-11.2,112.11,64.44,126.74,14.52,-8.54,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[5.17,93,0,0.707,0.01234,0.707,-0.01234,-2,0,0,0,0,0,2,0,0,6,-16,-32.72,101.78,86.25,130.2,5,-10,0,7.04,4.05,14.6,19.29,13.39,2.64,0,6,-16,-32.72,101.78,86.25,130.2,5,-10,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Door","id":"door","anchor":"side","h":165,"at":[112,0,37.5],"yaw":90},{"type":"g3band","id":"band","from":[103.2,165,0],"mountTo":"door:ring","r":0.7}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"band:handleL"},{"body":"gripR","prop":"band:handleR"}],"gripRadius":{"L":1.6,"R":1.6}},
"latpull":{"keys":[{"t":0,"v":[0,54.7,-6,0.99756,-0.06976,0,0,-3,0,0,-2,0,0,-10,0,0,28,4,76.07,115.75,-0.34,18.96,-15.15,-5.81,15.33,76.43,16.92,15.73,90.48,4.4,-4.97,0,28,4,76.07,115.75,-0.34,18.96,-15.15,-5.81,15.33,76.43,16.92,15.73,90.48,4.4,-4.97,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,54.7,-6,0.99756,-0.06976,0,0,-3,0,0,-2,0,0,-9.41,0,0,23.31,1.66,23.08,117.76,35.39,63.58,-11.11,-5.97,-3.41,76.43,16.92,15.73,90.48,4.4,-4.97,0,23.31,1.66,23.08,117.76,35.39,63.58,-11.11,-5.97,-3.41,76.43,16.92,15.73,90.48,4.4,-4.97,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,54.7,-6,0.99756,-0.06976,0,0,-3,0,0,-2,0,0,-8,0,0,12,-4,-10.66,89.04,48.42,107.84,-3.08,-5.88,-12.54,76.43,16.92,15.73,90.48,4.4,-4.97,0,12,-4,-10.66,89.04,48.42,107.84,-3.08,-5.88,-12.54,76.43,16.92,15.73,90.48,4.4,-4.97,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,54.7,-6,0.99756,-0.06976,0,0,-3,0,0,-2,0,0,-6.59,0,0,0.69,-9.66,-32.51,64.08,43.26,123.53,8.25,-6.04,-2.36,76.43,16.92,15.73,90.48,4.4,-4.97,0,0.69,-9.66,-32.51,64.08,43.26,123.53,8.25,-6.04,-2.36,76.43,16.92,15.73,90.48,4.4,-4.97,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,54.7,-6,0.99756,-0.06976,0,0,-3,0,0,-2,0,0,-6,0,0,-4,-12,-39.92,58.69,37.21,123.69,13.62,-5.95,2.62,76.43,16.92,15.73,90.48,4.4,-4.97,0,-4,-12,-39.92,58.69,37.21,123.69,13.62,-5.95,2.62,76.43,16.92,15.73,90.48,4.4,-4.97,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3LatPulldown","id":"lat","seatH":46,"padH":65.8,"padZ":22.1,"pulleyZ":5},{"type":"g3cable","from":[0,209.9,5],"swivel":[0,217.6,5],"swivelPart":"lat:swivel","rodPart":"lat:rodL","stack":{"o":[0,37.5,92],"R":[1,0,0,0,1,0,0,0,1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":205,"maxLift":138.5},"ratio":0.5,"id":"cab","attach":"bar","hands":["L","R"],"ext":19,"bend":8,"wrap":[0,0,-1],"rest":45},{"type":"g3line","id":"boomCable","pts":[[0,214.4,5],[0,209.5,87.5]]}],"contacts":[{"body":"buttocks","prop":"lat:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}]},
"cablerow":{"keys":[{"t":0,"v":[0,53.39,-6.6,0.99813,0.06105,0,0,2.1,0,0,1.4,0,0,-8,0,0,4,18,70.82,-3.25,-24.89,34.09,-12.91,-3.93,-9.75,89.21,12.42,25.48,23.4,0.96,0.82,0,4,18,70.82,-3.25,-24.89,34.09,-12.91,-3.93,-9.75,89.21,12.42,25.48,23.4,0.96,0.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,53.17,-6.6,0.99923,0.03935,0,0,1.35,0,0,0.9,0,0,-6.24,0,0,3.12,13.02,51.81,4.38,-23.47,62.34,-14.73,-3.71,-20.62,87.11,12.24,25.2,23.84,1.04,0.78,0,3.12,13.02,51.81,4.38,-23.47,62.34,-14.73,-3.71,-20.62,87.11,12.24,25.2,23.84,1.04,0.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,52.77,-6.6,0.99991,-0.01309,0,0,-0.3,0,0,0,0,0,-2,0,0,1,1,21.67,13.32,-25.32,91.6,-17.54,-3.61,-24.92,81.82,11.76,24.52,24.63,1.18,0.71,0,1,1,21.67,13.32,-25.32,91.6,-17.54,-3.61,-24.92,81.82,11.76,24.52,24.63,1.18,0.71,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,52.63,-6.6,0.99785,-0.06549,0,0,-1.5,0,0,0,0,0,2.24,0,0,-1.12,-11.02,-0.05,17.7,-28.02,99.97,-15.62,-3.85,-17.53,76.11,11.2,23.82,24.89,1.23,0.69,0,-1.12,-11.02,-0.05,17.7,-28.02,99.97,-15.62,-3.85,-17.53,76.11,11.2,23.82,24.89,1.23,0.69,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.94,-6.6,0.99619,-0.08716,0,0,-2,0,0,0,0,0,4,0,0,-2,-16,-6.8,18.96,-28.83,100.27,-14.94,-3.9,-13.82,73.18,10.8,23.49,24.3,1.13,0.74,0,-2,-16,-6.8,18.96,-28.83,100.27,-14.94,-3.9,-13.82,73.18,10.8,23.49,24.3,1.13,0.74,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3SeatedRow","id":"row","seatH":44,"plateZ":86,"plateH":31,"tilt":28,"pulleyH":52},{"type":"g3cable","from":[0,52,79],"swivel":[0,52,86.1],"swivelPart":"row:swivel","rodPart":"row:rodL","stack":{"o":[0,37.5,132],"R":[1,0,0,0,1,0,0,0,1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":197.5,"maxLift":131},"ratio":0.5,"id":"cab","attach":"V","hands":["L","R"],"wrap":[0,1,0],"rest":33}],"contacts":[{"body":"buttocks","prop":"row:seat"},{"body":"soleL","prop":"row:plateL"},{"body":"soleR","prop":"row:plateR"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.5,"R":1.5}},
"cablefly":{"keys":[{"t":0,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,6,-14,-22.98,104.04,2.11,31.87,60,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,6,-14,-22.98,104.04,2.11,31.87,60,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,5.62,-11.52,-5.07,103.56,-7.51,31.72,56.66,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,5.62,-11.52,-5.07,103.56,-7.51,31.72,56.66,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,4.62,-5.02,34.53,87.91,-28.79,31.28,47.91,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,4.62,-5.02,34.53,87.91,-28.79,31.28,47.91,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,3.38,3.02,63.22,51.62,-49.67,30.65,37.09,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,3.38,3.02,63.22,51.62,-49.67,30.65,37.09,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,2.38,9.52,69.73,17.94,-63.94,30.06,28.34,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,2.38,9.52,69.73,17.94,-63.94,30.06,28.34,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[-0.49,90.5,25.04,0.98902,0.14781,0,0,-4,0,0,2,0,0,-12,0,0,2,12,68.58,5.27,-68.67,29.83,25,0,0,41.63,3.73,13.74,22.8,-2.02,-2.13,0,2,12,68.58,5.27,-68.67,29.83,25,0,0,9.53,4.4,17.58,25.48,17.39,4.57,14],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Crossover","id":"xo","span":330,"hL":200,"hR":200},{"type":"g3cable","from":[138,200,0],"swivel":[145.6,200,0],"swivelPart":"xo:Lswivel","rodPart":"xo:LrodL","stack":{"o":[165,37.5,0],"R":[0,0,-1,0,1,0,1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":214.5,"maxLift":148},"ratio":0.5,"id":"cabL","attach":"D","hands":["L"],"plane":"swivel","clip":11,"rest":87},{"type":"g3cable","from":[-138,200,0],"swivel":[-145.6,200,0],"swivelPart":"xo:Rswivel","rodPart":"xo:RrodL","stack":{"o":[-165,37.5,0],"R":[0,0,1,0,1,0,-1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":214.5,"maxLift":148},"ratio":0.5,"id":"cabR","attach":"D","hands":["R"],"plane":"swivel","clip":11,"rest":87}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"cabL"},{"body":"gripR","prop":"cabR"}],"gripRadius":{"L":1.6,"R":1.6}},
"cablelowfly":{"keys":[{"t":0,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,-4,-10,-9.34,34.94,14.58,24.94,-50,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,-4,-10,-9.34,34.94,14.58,24.94,-50,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,-3.05,-7.9,-0.15,34.78,7.45,25.05,-47.14,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,-3.05,-7.9,-0.15,34.78,7.45,25.05,-47.14,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,-0.55,-2.4,23.8,29.93,-5.68,25.34,-39.64,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,-0.55,-2.4,23.8,29.93,-5.68,25.34,-39.64,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,2.55,4.4,51.57,16.77,-18.1,25.87,-30.36,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,2.55,4.4,51.57,16.77,-18.1,25.87,-30.36,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,5.05,9.9,71.25,0.21,-27.68,26.4,-22.86,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,5.05,9.9,71.25,0.21,-27.68,26.4,-22.86,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[-0.42,89.5,24.96,0.99692,0.07846,0,0,-4,0,0,0,0,0,-4,0,0,6,12,77.7,-7.77,-31.46,26.58,-20,0,0,36.49,4.54,13.56,30.85,3.06,-1.91,0,6,12,77.7,-7.77,-31.46,26.58,-20,0,0,6.4,6,17.12,35.32,18.14,4.12,18],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Crossover","id":"xo","span":330,"hL":20,"hR":20},{"type":"g3cable","from":[138,20,0],"swivel":[145.6,20,0],"swivelPart":"xo:Lswivel","rodPart":"xo:LrodL","stack":{"o":[165,37.5,0],"R":[0,0,-1,0,1,0,1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":214.5,"maxLift":148},"ratio":0.5,"id":"cabL","attach":"D","hands":["L"],"plane":"swivel","clip":11,"rest":108},{"type":"g3cable","from":[-138,20,0],"swivel":[-145.6,20,0],"swivelPart":"xo:Rswivel","rodPart":"xo:RrodL","stack":{"o":[-165,37.5,0],"R":[0,0,1,0,1,0,-1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":214.5,"maxLift":148},"ratio":0.5,"id":"cabR","attach":"D","hands":["R"],"plane":"swivel","clip":11,"rest":108}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"cabL"},{"body":"gripR","prop":"cabR"}],"gripRadius":{"L":1.6,"R":1.6}},
"cablelat":{"keys":[{"t":0,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,0,6,19.66,-0.68,-64.62,38.47,10,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,0.76,5.62,22.16,8.09,-59.03,38.68,13.34,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,2.76,4.62,25.97,31.93,-45.33,39.34,22.09,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,5.24,3.38,25.22,64.75,-36.58,40.08,32.91,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,7.24,2.38,16.62,92.92,-33.81,40.63,41.66,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0.03,93.5,5.23,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,-6,0,0,23.19,47.48,29.95,56.81,-27.21,-0.03,-12.84,5.9,2.92,12.7,15.59,11.13,1.99,0,8,2,9.89,103.04,-31.25,40.82,45,0,0,5.9,2.97,12.69,15.57,11.12,2.04,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":20,"at":[66,0,18],"yaw":-90},{"type":"g3cable","from":[39,20,18],"swivel":[46.6,20,18],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[66,37.5,18],"R":[0,0,-1,0,1,0,1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"D","hands":["R"],"rest":77}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"col:grabL"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.6,"R":1.6}},
"cablecrunch":{"keys":[{"t":0,"v":[0,49.71,-14.49,0.96593,0.25882,0,0,2,0,0,4,0,0,4,0,0,10,10,92.46,20.99,0.3,136.38,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5,10,10,92.46,20.99,0.3,136.38,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,49.71,-14.49,0.96593,0.25882,0,0,6.98,0,0,8.39,0,0,6.93,0,0,9.12,10,91.18,20.39,-0.22,136.47,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5,9.12,10,91.18,20.39,-0.22,136.47,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,49.71,-14.49,0.96593,0.25882,0,0,19,0,0,19,0,0,14,0,0,7,10,88.09,19.23,-1.24,136.88,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5,7,10,88.09,19.23,-1.24,136.88,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,49.71,-14.49,0.96593,0.25882,0,0,31.02,0,0,29.61,0,0,21.07,0,0,4.88,10,85,18.41,-2,137.42,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5,4.88,10,85,18.41,-2,137.42,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,49.71,-14.49,0.96593,0.25882,0,0,36,0,0,34,0,0,24,0,0,4,10,83.73,18.15,-2.26,137.69,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5,4,10,83.73,18.15,-2.26,137.69,20,-10,0,49.85,-1.32,-3.73,118.63,19.26,3.34,79.5],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":202,"at":[0,0,96],"yaw":180},{"type":"g3Pad","id":"mat","size":[48,4.5,30],"at":[0,0,-4]},{"type":"g3cable","from":[0,198,69],"swivel":[0,198,76.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,96],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"rope","hands":["L","R"],"ropeLen":26,"rest":97}],"contacts":[{"body":"kneeL","prop":"mat"},{"body":"kneeR","prop":"mat"},{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.3,"R":1.3}},
"glutekick":{"keys":[{"t":0,"v":[0,91,10,0.96593,0.25882,0,0,-4,0,0,2,0,0,-18,0,0,0,0,72.01,35.88,-7.84,36.5,-39.03,0.02,7.33,51.93,2.87,2.94,63.96,4,0,0,0,0,73.1,29.62,-15.9,43.06,-38.51,0.02,5.12,48.22,2.47,6.27,32.6,14.23,0.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,91,10,0.96593,0.25882,0,0,-4,0,0,2,0,0,-18,0,0,0,0,72.01,35.88,-7.84,36.5,-39.03,0.02,7.33,42.85,2.96,2.92,66.69,0.19,0,0,0,0,73.1,29.62,-15.9,43.06,-38.51,0.02,5.12,48.22,2.47,6.27,32.6,14.23,0.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,91,10,0.96593,0.25882,0,0,-4,0,0,2,0,0,-18,0,0,0,0,72.01,35.88,-7.84,36.5,-39.03,0.02,7.33,20.93,3.12,3.25,62.96,-9,0,0,0,0,73.1,29.62,-15.9,43.06,-38.51,0.02,5.12,48.22,2.47,6.27,32.6,14.23,0.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,91,10,0.96593,0.25882,0,0,-4,0,0,2,0,0,-18,0,0,0,0,72.01,35.88,-7.84,36.5,-39.03,0.02,7.33,-0.99,2.41,3.82,36.97,-18.19,0,0,0,0,73.1,29.62,-15.9,43.06,-38.51,0.02,5.12,48.22,2.47,6.27,32.6,14.23,0.41,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,91,10,0.96593,0.25882,0,0,-4,0,0,2,0,0,-18,0,0,0,0,72.01,35.88,-7.84,36.5,-39.03,0.02,7.33,-10.07,1.87,4.05,21.91,-22,0,0,0,0,73.1,29.62,-15.9,43.06,-38.51,0.02,5.12,48.22,2.47,6.27,32.6,14.23,0.41,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":20,"at":[4,0,96],"yaw":180},{"type":"g3cable","from":[4,20,69],"swivel":[4,20,76.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[4,37.5,96],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"ankle","foot":"L","rest":70}],"contacts":[{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"col:grabR"},{"body":"gripR","prop":"col:grabL"}],"gripRadius":{"L":1.6,"R":1.6}},
"cablekickback":{"keys":[{"t":0,"v":[0,93.5,8,0.99027,0.13917,0,0,-4,0,0,2,0,0,-8,0,0,0,0,75.55,32.64,-12.31,26.93,-38.42,0.02,-0.31,0.94,1.67,2.93,23.91,6,0,0,0,0,75.27,26.04,-18.91,34.93,-38.74,0.02,-3.26,26.36,1.48,5.88,17.11,6.66,0.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93.5,8,0.99027,0.13917,0,0,-4,0,0,2,0,0,-8,0,0,0,0,75.55,32.64,-12.31,26.93,-38.42,0.02,-0.31,-1.84,1.59,2.98,20.83,4.24,0,0,0,0,75.27,26.04,-18.91,34.93,-38.74,0.02,-3.26,26.36,1.48,5.88,17.11,6.66,0.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93.5,8,0.99027,0.13917,0,0,-4,0,0,2,0,0,-8,0,0,0,0,75.55,32.64,-12.31,26.93,-38.42,0.02,-0.31,-8.58,1.4,3.11,13.35,0,0,0,0,0,75.27,26.04,-18.91,34.93,-38.74,0.02,-3.26,26.36,1.48,5.88,17.11,6.66,0.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93.5,8,0.99027,0.13917,0,0,-4,0,0,2,0,0,-8,0,0,0,0,75.55,32.64,-12.31,26.93,-38.42,0.02,-0.31,-15.39,1.19,3.26,5.74,-4.24,0,0,0,0,75.27,26.04,-18.91,34.93,-38.74,0.02,-3.26,26.36,1.48,5.88,17.11,6.66,0.4,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93.5,8,0.99027,0.13917,0,0,-4,0,0,2,0,0,-8,0,0,0,0,75.55,32.64,-12.31,26.93,-38.42,0.02,-0.31,-17.68,1.13,3.32,3.62,-6,0,0,0,0,75.27,26.04,-18.91,34.93,-38.74,0.02,-3.26,26.36,1.48,5.88,17.11,6.66,0.4,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":20,"at":[4,0,88],"yaw":180},{"type":"g3cable","from":[4,20,61],"swivel":[4,20,68.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[4,37.5,88],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"ankle","foot":"L","rest":89}],"contacts":[{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"col:grabR"},{"body":"gripR","prop":"col:grabL"}],"gripRadius":{"L":1.6,"R":1.6}},
"cableohext":{"keys":[{"t":0,"v":[0.1,89,-0.87,0.97815,0.20791,0,0,-4,0,0,-2,0,0,-8,0,0,26,6,153.45,21.92,5.83,133.23,10,0,0,51.13,3.5,14.2,16.89,-10.28,-3.13,0,26,6,153.45,21.92,5.83,133.23,10,0,0,16.21,5.25,14.19,30.12,18.57,4.4,18],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0.1,89,-0.87,0.97815,0.20791,0,0,-4,0,0,-2,0,0,-8,0,0,26,6,153.65,21.76,8.56,116.15,12.93,0,0,51.13,3.5,14.2,16.89,-10.28,-3.13,0,26,6,153.65,21.76,8.56,116.15,12.93,0,0,16.21,5.25,14.19,30.12,18.57,4.4,18],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0.1,89,-0.87,0.97815,0.20791,0,0,-4,0,0,-2,0,0,-8,0,0,26,6,153.31,22.23,11.37,74.63,20,0,0,51.13,3.5,14.2,16.89,-10.28,-3.13,0,26,6,153.31,22.23,11.37,74.63,20,0,0,16.21,5.25,14.19,30.12,18.57,4.4,18],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0.1,89,-0.87,0.97815,0.20791,0,0,-4,0,0,-2,0,0,-8,0,0,26,6,151.11,22.38,11.23,35.83,27.07,0,0,51.13,3.5,14.2,16.89,-10.28,-3.13,0,26,6,151.11,22.38,11.23,35.83,27.07,0,0,16.21,5.25,14.19,30.12,18.57,4.4,18],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0.1,89,-0.87,0.97815,0.20791,0,0,-4,0,0,-2,0,0,-8,0,0,26,6,147.08,24.1,8.81,25,30,0,0,51.13,3.5,14.2,16.89,-10.28,-3.13,0,26,6,147.08,24.1,8.81,25,30,0,0,16.21,5.25,14.19,30.12,18.57,4.4,18],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":186,"at":[0,0,-118],"yaw":0},{"type":"g3cable","from":[0,186,-91],"swivel":[0,186,-98.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,-118],"R":[1,0,0,0,1,0,0,0,1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"rope","hands":["L","R"],"ropeLen":26,"rest":95}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.3,"R":1.3}},
"cablewood":{"keys":[{"t":0,"v":[6,91.5,4,0.97786,0.02561,0.20762,-0.00544,-2,2,7.19,-4,4,28.77,-16,0,6,16,10,87.08,24.44,-24.25,61.56,30,0,0,18.8,5.98,0.26,27.85,11.97,5.85,0,16,10,96.29,-4.56,-43.86,45.2,30,0,0,9.82,19.23,3.97,33.58,-5.4,12.73,30],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[4.85,91.05,3.52,0.98085,0.04533,0.18923,-0.00874,-1.24,1.43,6.55,-2.47,3.05,26.21,-13.14,0,4.66,14.66,10,81.79,22.63,-25.42,61.71,30.95,0,0,23.85,6.81,-1.63,32.36,11.05,6.88,2.86,14.66,10,90.82,-4.37,-43.77,45.26,30.95,0,0,14.25,19.25,5.81,36.02,-2.82,13.05,27.14],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[1.85,89.88,2.27,0.98409,0.09729,0.14798,-0.01463,0.76,-0.07,5.13,1.53,0.55,20.52,-5.64,0,1.16,11.16,10,72.24,13.96,-32.78,55.42,33.45,0,0,35.31,8.28,-7.51,40.72,7.3,9.69,10.36,11.16,10,77.33,0.25,-41.99,45.43,33.45,0,0,24.67,19.36,11.81,41.2,3.87,12.85,19.64],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[-1.85,88.42,0.73,0.98298,0.16192,0.08562,-0.0141,3.24,-1.93,2.99,6.47,-2.55,11.95,3.64,0,-3.16,6.84,10,62.04,4.87,-41.96,45.62,36.55,0,0,46.5,10.35,-13.29,47.08,1.85,12.81,19.64,6.84,10,61.48,6.26,-41.06,46.81,36.55,0,0,36.66,18.84,18.64,45.53,12.01,10.52,10.36],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[-4.85,87.25,-0.52,0.9765,0.21388,-0.02578,0.00565,5.24,-3.43,-0.91,10.47,-5.05,-3.63,11.14,0,-6.66,3.34,10,45.98,16.93,-37.13,60.25,39.05,0,0,51.27,16.16,-9.14,50.39,-1.79,14.31,27.14,3.34,10,53.52,-0.03,-48.33,45.77,39.05,0,0,47.95,15.02,17.08,47.22,17.85,6.98,2.86],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[-6,86.8,-1,0.96695,0.23214,-0.10256,0.02462,6,-4,-3.63,12,-6,-14.53,14,0,-8,2,10,34.99,28.07,-28.69,75.15,40,0,0,50.48,20.44,-2.52,51.2,-2.7,14.54,30,2,10,52.09,-7.35,-53.63,45.83,40,0,0,53,11.12,11.93,47.22,19.57,5.31,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":202,"at":[122,0,50],"yaw":-90},{"type":"g3cable","from":[95,198,50],"swivel":[102.6,198,50],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[122,37.5,50],"R":[0,0,-1,0,1,0,1,0,0],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"rope","hands":["L","R"],"ropeLen":26,"plane":"swivel","rest":57}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.3,"R":1.3}},
"pullthrough":{"keys":[{"t":0,"v":[0,91.5,8.32,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,0,-4,2,8.9,2.72,-56.52,31.52,0,0,0,4.69,16.16,25.35,13.25,3.75,13.41,0,-4,2,8.9,2.72,-56.52,31.52,0,0,0,4.69,16.16,25.35,13.25,3.75,13.41,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,90.4,3.96,0.99557,0.09399,0,0,-1.41,0,0,0.88,0,0,-1.81,0,0,-2.83,2.88,8.12,2.25,-52.75,31.52,0,0,0,20.84,18.74,26.07,23.41,6.05,12.3,0,-2.83,2.88,8.12,2.25,-52.75,31.52,0,0,0,20.84,18.74,26.07,23.41,6.05,12.3,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,87.75,-5.46,0.96126,0.27564,0,0,0,0,0,3,0,0,-11,0,0,0,5,12.53,1.07,-43.9,31.53,0,0,0,52.68,23.81,30.15,34.63,5.46,9.81,0,0,5,12.53,1.07,-43.9,31.53,0,0,0,52.68,23.81,30.15,34.63,5.46,9.81,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,85.1,-12.68,0.8941,0.44786,0,0,1.41,0,0,5.12,0,0,-20.19,0,0,2.83,7.12,22.25,-1.89,-32.33,31.57,0,0,0,79.68,31.22,37.03,40.59,3.44,7.82,0,2.83,7.12,22.25,-1.89,-32.33,31.57,0,0,0,79.68,31.22,37.03,40.59,3.44,7.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,84,-15.04,0.85717,0.51504,0,0,2,0,0,6,0,0,-24,0,0,4,8,27.32,-4.15,-26.19,31.55,0,0,0,89.61,35.8,41.06,42.59,2.72,7.15,0,4,8,27.32,-4.15,-26.19,31.55,0,0,0,89.61,35.8,41.06,42.59,2.72,7.15,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":20,"at":[0,0,-122],"yaw":0},{"type":"g3cable","from":[0,20,-95],"swivel":[0,20,-102.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,-122],"R":[1,0,0,0,1,0,0,0,1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"rope","hands":["L","R"],"ropeLen":26,"rest":98}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.3,"R":1.3}},
"cablecurl":{"keys":[{"t":0,"v":[0,93,4.87,0.99966,0.02618,0,0,-3,0,0,0,0,0,6,0,0,-2,-2,6.87,2.94,14.09,8.07,-76.74,1.42,-4.84,10.26,2.87,14.68,20.66,12.91,0.94,0,-2,-2,6.87,2.94,14.09,8.07,-76.74,1.42,-4.84,10.26,2.87,14.68,20.66,12.91,0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93,4.87,0.99966,0.02618,0,0,-3,0,0,0,0,0,6,0,0,-2,-1.41,7.25,1.94,10.42,23.78,-80.58,4.14,-5.89,10.26,2.87,14.68,20.66,12.91,0.94,0,-2,-1.41,7.25,1.94,10.42,23.78,-80.58,4.14,-5.89,10.26,2.87,14.68,20.66,12.91,0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93,4.87,0.99966,0.02618,0,0,-3,0,0,0,0,0,6,0,0,-2,0,8.05,0.98,7.44,63.21,-83.99,3.99,-6.96,10.26,2.87,14.68,20.66,12.91,0.94,0,-2,0,8.05,0.98,7.44,63.21,-83.99,3.99,-6.96,10.26,2.87,14.68,20.66,12.91,0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93,4.87,0.99966,0.02618,0,0,-3,0,0,0,0,0,6,0,0,-2,1.41,9.44,0.83,7.7,101.76,-86.01,3.95,-7.24,10.26,2.87,14.68,20.66,12.91,0.94,0,-2,1.41,9.44,0.83,7.7,101.76,-86.01,3.95,-7.24,10.26,2.87,14.68,20.66,12.91,0.94,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93,4.87,0.99966,0.02618,0,0,-3,0,0,0,0,0,6,0,0,-2,2,10.21,0.96,8.75,117.57,-87.36,4.01,-7.2,10.26,2.87,14.68,20.66,12.91,0.94,0,-2,2,10.21,0.96,8.75,117.57,-87.36,4.01,-7.2,10.26,2.87,14.68,20.66,12.91,0.94,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":20,"at":[0,0,78],"yaw":180},{"type":"g3cable","from":[0,20,51],"swivel":[0,20,58.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,78],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"bar","hands":["L","R"],"ext":11,"rest":62}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}]},
"facepull":{"keys":[{"t":0,"v":[0,93,5.17,0.99985,0.01745,0,0,-2,0,0,0,0,0,-4,0,0,4,16,80.47,21.4,-44.42,62.82,70,0,0,7.04,4.05,14.6,19.29,13.39,2.64,0,4,16,80.47,21.4,-44.42,62.82,70,0,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,93,5.17,0.99985,0.01745,0,0,-2,0,0,0,0,0,-3.12,0,0,4.29,11.31,76.85,40.2,-34.36,83.62,60.48,-1.46,0,7.04,4.05,14.6,19.29,13.39,2.64,0,4.29,11.31,76.85,40.2,-34.36,83.62,60.48,-1.46,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,93,5.17,0.99985,0.01745,0,0,-2,0,0,0,0,0,-1,0,0,5,0,57.7,90.6,1.66,112.3,37.5,-5,0,7.04,4.05,14.6,19.29,13.39,2.64,0,5,0,57.7,90.6,1.66,112.3,37.5,-5,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,93,5.17,0.99985,0.01745,0,0,-2,0,0,0,0,0,1.12,0,0,5.71,-11.31,-12.09,112.43,66.72,127.65,14.52,-8.54,0,7.04,4.05,14.6,19.29,13.39,2.64,0,5.71,-11.31,-12.09,112.43,66.72,127.65,14.52,-8.54,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,93,5.17,0.99985,0.01745,0,0,-2,0,0,0,0,0,2,0,0,6,-16,-33.15,101.19,88.88,131.06,5,-10,0,7.04,4.05,14.6,19.29,13.39,2.64,0,6,-16,-33.15,101.19,88.88,131.06,5,-10,0,7.04,4.05,14.6,19.29,13.39,2.64,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":166,"at":[0,0,128],"yaw":180},{"type":"g3cable","from":[0,166,101],"swivel":[0,166,108.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,128],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"rope","hands":["L","R"],"ropeLen":26,"rest":39}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}],"gripRadius":{"L":1.3,"R":1.3}},
"straightpull":{"keys":[{"t":0,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,14,8,125.08,50.62,-32.75,31.88,20.24,-3.87,-14.82,31,4.89,15.36,24.28,13.38,2,0,14,8,125.08,50.62,-32.75,31.88,20.24,-3.87,-14.82,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,12.28,6.66,116.65,37.39,-37.47,32.08,25.91,-3.88,-14.34,31,4.89,15.36,24.28,13.38,2,0,12.28,6.66,116.65,37.39,-37.47,32.08,25.91,-3.88,-14.34,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,7.78,3.16,88.14,21.92,-42.1,32.3,34.5,-3.91,-13.16,31,4.89,15.36,24.28,13.38,2,0,7.78,3.16,88.14,21.92,-42.1,32.3,34.5,-3.91,-13.16,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,2.22,-1.16,51.99,16.6,-49.37,32.25,34.06,-3.92,-12.85,31,4.89,15.36,24.28,13.38,2,0,2.22,-1.16,51.99,16.6,-49.37,32.25,34.06,-3.92,-12.85,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,-2.28,-4.66,24.66,16.37,-62.15,31.92,24.91,-3.91,-13.44,31,4.89,15.36,24.28,13.38,2,0,-2.28,-4.66,24.66,16.37,-62.15,31.92,24.91,-3.91,-13.44,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,92.5,5.37,0.98325,0.18224,0,0,-4,0,0,2,0,0,-14,0,0,-4,-6,14.95,16.7,-69.29,31.66,19.16,-3.91,-13.66,31,4.89,15.36,24.28,13.38,2,0,-4,-6,14.95,16.7,-69.29,31.66,19.16,-3.91,-13.66,31,4.89,15.36,24.28,13.38,2,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":200,"at":[0,0,135],"yaw":180},{"type":"g3cable","from":[0,198,108],"swivel":[0,198,115.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,135],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"bar","hands":["L","R"],"ext":12,"rest":39}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}]},
"pushdown":{"keys":[{"t":0,"v":[0,92.5,4.92,0.99452,0.10453,0,0,-2,0,0,2,0,0,-6,0,0,-2,2,19.27,5.27,-15.5,80.92,83.63,-5.76,-15.34,21.7,3.4,14.95,24.36,14.12,0.78,0,-2,2,19.27,5.27,-15.5,80.92,83.63,-5.76,-15.34,21.7,3.4,14.95,24.36,14.12,0.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,92.5,4.92,0.99452,0.10453,0,0,-2,0,0,2,0,0,-6,0,0,-2,2,19.81,5.05,-17.39,68.61,79.95,-5.78,-15.1,21.7,3.4,14.95,24.36,14.12,0.78,0,-2,2,19.81,5.05,-17.39,68.61,79.95,-5.78,-15.1,21.7,3.4,14.95,24.36,14.12,0.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,92.5,4.92,0.99452,0.10453,0,0,-2,0,0,2,0,0,-6,0,0,-2,2,21.27,3.75,-26.36,38.94,67.55,-5.81,-13.7,21.7,3.4,14.95,24.36,14.12,0.78,0,-2,2,21.27,3.75,-26.36,38.94,67.55,-5.81,-13.7,21.7,3.4,14.95,24.36,14.12,0.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,92.5,4.92,0.99452,0.10453,0,0,-2,0,0,2,0,0,-6,0,0,-2,2,21.32,-0.6,-51.94,10.83,39.7,-5.92,-9.13,21.7,3.4,14.95,24.36,14.12,0.78,0,-2,2,21.32,-0.6,-51.94,10.83,39.7,-5.92,-9.13,21.7,3.4,14.95,24.36,14.12,0.78,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,92.5,4.92,0.99452,0.10453,0,0,-2,0,0,2,0,0,-6,0,0,-2,2,16.84,0.6,-73.71,11.39,17.56,-5.89,-10.4,21.7,3.4,14.95,24.36,14.12,0.78,0,-2,2,16.84,0.6,-73.71,11.39,17.56,-5.89,-10.4,21.7,3.4,14.95,24.36,14.12,0.78,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"g3Tower","id":"col","h":196,"at":[0,0,70],"yaw":180},{"type":"g3cable","from":[0,196,43],"swivel":[0,196,50.6],"swivelPart":"col:swivel","rodPart":"col:rodL","stack":{"o":[0,37.5,70],"R":[-1,0,0,0,1,0,0,0,-1],"sel":5,"pitch":2.6,"size":[32,2.4,14],"topY":210.5,"maxLift":144},"ratio":0.5,"id":"cab","attach":"bar","hands":["L","R"],"ext":11,"rest":89}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cab"},{"body":"gripR","prop":"cab"}]},
"declinecrunch":{"keys":[{"t":0,"v":[0,70,0,0.55919,-0.82904,0,0,2,0,0,4,0,0,8,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,72,4,4,100,-10,0,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,72,4,4,100,-10,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.25,"v":[0,70,0,0.55919,-0.82904,0,0,4.05,0,0,7.81,0,0,9.46,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,72,4,4,100,-10,0,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,72,4,4,100,-10,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,70,0,0.55919,-0.82904,0,0,9,0,0,17,0,0,13,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,72,4,4,100,-10,0,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,72,4,4,100,-10,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,70,0,0.55919,-0.82904,0,0,13.95,0,0,26.19,0,0,16.54,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,72,4,4,100,-10,0,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,72,4,4,100,-10,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,70,0,0.55919,-0.82904,0,0,16,0,0,30,0,0,18,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,72,4,4,100,-10,0,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,72,4,4,100,-10,0,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"declineBench","id":"db","pad":{"hi":[62.55142966633156,10],"lo":[25.268057714808126,-82.27958376824552]},"knee":{"c":[98.73038268576414,10.091740912061567],"r":6},"ankle":{"c":[115.78571288397312,32.10968742939463],"r":5}}],"contacts":[{"body":"buttocks","prop":"db:pad"},{"body":"back","prop":"db:pad"},{"body":"kneeL","prop":"db:kneeL"},{"body":"kneeR","prop":"db:kneeR"},{"body":"skL","prop":"db:ankleL"},{"body":"skR","prop":"db:ankleR"}]},
"hacksquat":{"keys":[{"t":0,"v":[0,77.66,-13.66,0.92388,-0.38268,0,0,-2,0,0,0,0,0,12,0,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,12.53,3.63,11.9,18,-19.5,-4.17,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,12.53,3.63,11.9,18,-19.5,-4.17,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,74.87,-10.87,0.92388,-0.38268,0,0,-2,0,0,0,0,0,12,0,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,23.26,5.91,11.77,39.24,-9.23,-4.11,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,23.26,5.91,11.77,39.24,-9.23,-4.11,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,68.14,-4.14,0.92388,-0.38268,0,0,-2,0,0,0,0,0,12,0,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,37.86,8.98,11.51,67.49,4.1,-3.96,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,37.86,8.98,11.51,67.49,4.1,-3.96,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,61.41,2.59,0.92388,-0.38268,0,0,-2,0,0,0,0,0,12,0,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,48.67,11.2,11.21,87.69,13.26,-3.76,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,48.67,11.2,11.21,87.69,13.26,-3.76,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,58.62,5.38,0.92388,-0.38268,0,0,-2,0,0,0,0,0,12,0,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,52.72,12.01,11.06,95,16.46,-3.65,0,0,0,-8.56,10,16.64,121.18,-17.16,0.1,-3.51,52.72,12.01,11.06,95,16.46,-3.65,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"hackSquat","id":"hk","rx":22,"rail":{"a":[24.40202025355334,-2.8284271247461845],"b":[166.53048327204937,-144.95689014324225]},"plate":{"c":[16.061764231962304,59.894007818403885],"ang":20,"w":70,"l":46}},{"type":"g4sled","id":"hkSled","rail":[[0,24.40202025355334,-2.8284271247461845],[0,166.53048327204937,-144.95689014324225]],"up":[0,-0.7071067811865476,-0.7071067811865475],"bind":{"mix":["hipL","hipR"]},"mountTo":"hk:railL","parts":[{"name":"back","kind":"obox","c":[0,-15.455463769125547,7.521042647585176],"size":[32,7,47.04208529517035],"tone":"pad","role":"support","mount":"plate","round":1.8},{"name":"plate","kind":"obox","c":[0,-10.955463769125547,7.521042647585176],"size":[26,2,43.04208529517035],"mount":"frame"},{"name":"frame","kind":"beam","a":[0,-8.955463769125547,-12],"b":[0,-8.955463769125547,59.04208529517035],"w":8,"h":4,"up":[0,1,0],"mount":"strutLo"},{"name":"crossLo","kind":"beam","a":[-22,-4.5,0],"b":[22,-4.5,0],"w":6,"h":4,"mount":"carLoL"},{"name":"strutLo","kind":"beam","a":[0,-4.5,0],"b":[0,-7.955463769125547,0],"w":6,"h":6,"mount":"crossLo"},{"name":"carLoL","kind":"obox","c":[22,0,0],"size":[7,7,16],"mount":"hk:railL"},{"name":"carLoR","kind":"obox","c":[-22,0,0],"size":[7,7,16],"mount":"hk:railR"},{"name":"crossHi","kind":"beam","a":[-22,-4.5,40],"b":[22,-4.5,40],"w":6,"h":4,"mount":"carHiL"},{"name":"strutHi","kind":"beam","a":[0,-4.5,40],"b":[0,-7.955463769125547,40],"w":6,"h":6,"mount":"crossHi"},{"name":"carHiL","kind":"obox","c":[22,0,40],"size":[7,7,16],"mount":"hk:railL"},{"name":"carHiR","kind":"obox","c":[-22,0,40],"size":[7,7,16],"mount":"hk:railR"},{"name":"armL","kind":"beam","a":[26,-8.955463769125547,59.04208529517035],"b":[26,-62.757577917390975,59.04208529517035],"w":5,"h":6,"mount":"top"},{"name":"shL","kind":"obox","c":[14.792356551031519,-30.506962574855468,51.68691070395311],"size":[14,7,15],"axes":[[0.7556644025093593,0,-0.6549590145804338],[0.6549590145804338,0,0.7556644025093593],[0,1,0]],"tone":"pad","role":"support","mount":"shPlateL","round":2},{"name":"shPlateL","kind":"obox","c":[17.674176215185426,-30.506962574855468,55.01183407499429],"size":[11,2,13],"axes":[[0.7556644025093593,0,-0.6549590145804338],[0.6549590145804338,0,0.7556644025093593],[0,1,0]],"mount":"shArmL"},{"name":"shArmL","kind":"beam","a":[26,-30.506962574855468,59.04208529517035],"b":[18.198143426849775,-30.506962574855468,55.61636559700178],"w":4,"h":4,"mount":"armL"},{"name":"hDropL","kind":"beam","a":[26,-53.102331722909945,59.04208529517035],"b":[26,-53.102331722909945,41.80261737946213],"w":3.5,"h":3.5,"mount":"armL"},{"name":"handleL","kind":"beam","a":[26,-53.102331722909945,41.80261737946213],"b":[26,-60.00668564581856,26.267821052917757],"r":1.6,"tone":"rubber","role":"grip","mount":"hDropL"},{"name":"hornL","kind":"cyl","c":[40,-4.5,40],"axis":[1,0,0],"r":2.5,"len":24,"tone":"chrome","mount":"hornBar"},{"name":"discL","kind":"cyl","c":[37.5,-4.5,40],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornL","sides":32},{"name":"armR","kind":"beam","a":[-26,-8.955463769125547,59.04208529517035],"b":[-26,-62.757577917390975,59.04208529517035],"w":5,"h":6,"mount":"top"},{"name":"shR","kind":"obox","c":[-14.792356551031519,-30.506962574855468,51.68691070395311],"size":[14,7,15],"axes":[[-0.7556644025093593,0,-0.6549590145804338],[-0.6549590145804338,0,0.7556644025093593],[0,1,0]],"tone":"pad","role":"support","mount":"shPlateR","round":2},{"name":"shPlateR","kind":"obox","c":[-17.674176215185426,-30.506962574855468,55.01183407499429],"size":[11,2,13],"axes":[[-0.7556644025093593,0,-0.6549590145804338],[-0.6549590145804338,0,0.7556644025093593],[0,1,0]],"mount":"shArmR"},{"name":"shArmR","kind":"beam","a":[-26,-30.506962574855468,59.04208529517035],"b":[-18.198143426849775,-30.506962574855468,55.61636559700178],"w":4,"h":4,"mount":"armR"},{"name":"hDropR","kind":"beam","a":[-26,-53.102331722909945,59.04208529517035],"b":[-26,-53.102331722909945,41.80261737946213],"w":3.5,"h":3.5,"mount":"armR"},{"name":"handleR","kind":"beam","a":[-26,-53.102331722909945,41.80261737946213],"b":[-26,-60.00668564581856,26.267821052917757],"r":1.6,"tone":"rubber","role":"grip","mount":"hDropR"},{"name":"hornR","kind":"cyl","c":[-40,-4.5,40],"axis":[1,0,0],"r":2.5,"len":24,"tone":"chrome","mount":"hornBar"},{"name":"discR","kind":"cyl","c":[-37.5,-4.5,40],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornR","sides":32},{"name":"top","kind":"beam","a":[-27,-8.955463769125547,59.04208529517035],"b":[27,-8.955463769125547,59.04208529517035],"w":6,"h":6,"mount":"frame"},{"name":"hornBar","kind":"beam","a":[-28,-4.5,40],"b":[28,-4.5,40],"w":6,"h":4,"mount":"strutHi"}]}],"contacts":[{"body":"back","prop":"hkSled:back"},{"body":"upperBack","prop":"hkSled:shL"},{"body":"upperBack","prop":"hkSled:shR"},{"body":"soleL","prop":"hk:plate"},{"body":"soleR","prop":"hk:plate"},{"body":"gripL","prop":"hkSled:handleL"},{"body":"gripR","prop":"hkSled:handleR"}]},
"standcalf":{"keys":[{"t":0,"v":[0,103.39,3.38,1,0,0,0,-2,0,0,0,0,0,-2,0,0,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-7.55,0.98,5.82,5,19.42,1.86,-7,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-7.55,0.98,5.82,5,19.42,1.86,-7],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,104.8,3.38,1,0,0,0,-2,0,0,0,0,0,-2,0,0,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-7.2,1,5.82,5,13.65,1.75,-1.58,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-7.2,1,5.82,5,13.65,1.75,-1.58],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,108.01,3.38,1,0,0,0,-2,0,0,0,0,0,-2,0,0,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-6.03,1.09,5.8,5,-0.61,1.43,11.5,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-6.03,1.09,5.8,5,-0.61,1.43,11.5],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,110.8,3.38,1,0,0,0,-2,0,0,0,0,0,-2,0,0,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-4.45,1.22,5.77,5,-15.28,1.03,24.58,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-4.45,1.22,5.77,5,-15.28,1.03,24.58],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,111.78,3.38,1,0,0,0,-2,0,0,0,0,0,-2,0,0,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-3.69,1.28,5.76,5,-21.45,0.85,30,6,0,-8.6,10.1,16.39,121.23,-17.14,0.1,-3.47,-3.69,1.28,5.76,5,-21.45,0.85,30],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"standingCalf","id":"cs","zr":-30,"rx":24,"step":{"y":12,"z":0,"w":56}},{"type":"g4sled","id":"csSled","rail":[[0,38,-30],[0,214,-30]],"up":[0,0,-1],"bind":{"mix":["shL","shR"]},"mountTo":"cs:rodL","parts":[{"name":"carL","kind":"obox","c":[24,0,11.744930280635458],"size":[6,7,16],"mount":"cs:rodL"},{"name":"armL","kind":"beam","a":[24,0,15.744930280635458],"b":[24,-66.08131265949697,15.744930280635458],"w":5,"h":6,"mount":"carL"},{"name":"padL","kind":"obox","c":[14.311495467861409,-32.081312659496966,6.739673035851267],"size":[14,7,17],"axes":[[0.8556407872045168,0,-0.5175701336746884],[0.5175701336746884,0,0.8556407872045168],[0,1,0]],"tone":"pad","role":"support","mount":"padPlateL","round":2},{"name":"padPlateL","kind":"obox","c":[16.58880405603004,-32.081312659496966,10.50449249955114],"size":[11,2,14],"axes":[[0.8556407872045168,0,-0.5175701336746884],[0.5175701336746884,0,0.8556407872045168],[0,1,0]],"mount":"padArmL"},{"name":"padArmL","kind":"beam","a":[24,-32.081312659496966,15.744930280635458],"b":[17.00286016296979,-32.081312659496966,11.189005129314754],"w":4,"h":4,"mount":"armL"},{"name":"hDropL","kind":"beam","a":[26,-56.426066465015936,15.744930280635458],"b":[26,-56.426066465015936,-3.775696062417685],"w":3.5,"h":3.5,"mount":"armL"},{"name":"handleL","kind":"beam","a":[26,-56.426066465015936,-3.775696062417685],"b":[26,-63.33042038792455,-19.310492388962057],"r":1.6,"tone":"rubber","role":"grip","mount":"hDropL"},{"name":"carR","kind":"obox","c":[-24,0,11.744930280635458],"size":[6,7,16],"mount":"cs:rodR"},{"name":"armR","kind":"beam","a":[-24,0,15.744930280635458],"b":[-24,-66.08131265949697,15.744930280635458],"w":5,"h":6,"mount":"carR"},{"name":"padR","kind":"obox","c":[-14.311495467861409,-32.081312659496966,6.739673035851267],"size":[14,7,17],"axes":[[-0.8556407872045168,0,-0.5175701336746884],[-0.5175701336746884,0,0.8556407872045168],[0,1,0]],"tone":"pad","role":"support","mount":"padPlateR","round":2},{"name":"padPlateR","kind":"obox","c":[-16.58880405603004,-32.081312659496966,10.50449249955114],"size":[11,2,14],"axes":[[-0.8556407872045168,0,-0.5175701336746884],[-0.5175701336746884,0,0.8556407872045168],[0,1,0]],"mount":"padArmR"},{"name":"padArmR","kind":"beam","a":[-24,-32.081312659496966,15.744930280635458],"b":[-17.00286016296979,-32.081312659496966,11.189005129314754],"w":4,"h":4,"mount":"armR"},{"name":"hDropR","kind":"beam","a":[-26,-56.426066465015936,15.744930280635458],"b":[-26,-56.426066465015936,-3.775696062417685],"w":3.5,"h":3.5,"mount":"armR"},{"name":"handleR","kind":"beam","a":[-26,-56.426066465015936,-3.775696062417685],"b":[-26,-63.33042038792455,-19.310492388962057],"r":1.6,"tone":"rubber","role":"grip","mount":"hDropR"},{"name":"cross","kind":"beam","a":[-24,0,15.744930280635458],"b":[24,0,15.744930280635458],"w":6,"h":6,"mount":"carL"}]}],"contacts":[{"body":"soleL","prop":"cs:stepTop"},{"body":"soleR","prop":"cs:stepTop"},{"body":"upperBack","prop":"csSled:padL"},{"body":"upperBack","prop":"csSled:padR"},{"body":"gripL","prop":"csSled:handleL"},{"body":"gripR","prop":"csSled:handleR"}]},
"seatedcalf":{"keys":[{"t":0,"v":[0,58.66,0,1,0,0,0,0,0,0,4,0,0,6,0,0,0,4,32.48,40.48,-20.12,92.63,47.9,-0.02,-27.84,92.57,9.38,10.1,96.89,19.88,-4.19,-16,0,4,32.48,40.48,-20.12,92.63,47.9,-0.02,-27.84,92.57,9.38,10.1,96.89,19.88,-4.19,-16],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,58.66,0,1,0,0,0,0,0,0,4,0,0,6,0,0,0,4,33.32,40.83,-19.67,92.93,47.82,-0.02,-28.01,94.98,9.89,10.42,98.62,12.1,-4.44,-8.97,0,4,33.32,40.83,-19.67,92.93,47.82,-0.02,-28.01,94.98,9.89,10.42,98.62,12.1,-4.44,-8.97],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,58.66,0,1,0,0,0,0,0,0,4,0,0,6,0,0,0,4,35.56,41.57,-18.76,93.12,47.48,-0.02,-28.28,100.4,11.16,11.26,100.9,-8.19,-4.73,8,0,4,35.56,41.57,-18.76,93.12,47.48,-0.02,-28.28,100.4,11.16,11.26,100.9,-8.19,-4.73,8],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,58.66,0,1,0,0,0,0,0,0,4,0,0,6,0,0,0,4,37.58,42.1,-18.19,92.78,47.09,-0.02,-28.37,104.58,12.32,12.06,100.33,-30.09,-4.5,24.97,0,4,37.58,42.1,-18.19,92.78,47.09,-0.02,-28.37,104.58,12.32,12.06,100.33,-30.09,-4.5,24.97],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,58.66,0,1,0,0,0,0,0,0,4,0,0,6,0,0,0,4,38.2,42.24,-18.05,92.61,46.96,-0.02,-28.38,105.78,12.68,12.33,99.27,-39.44,-4.23,32,0,4,38.2,42.24,-18.05,92.61,46.96,-0.02,-28.38,105.78,12.68,12.33,99.27,-39.44,-4.23,32],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"seatedCalf","id":"sc","seat":{"h":50,"z0":-20,"z1":22},"step":{"y":13,"z":52.73275911266378,"w":50},"pivot":[86.44262143082754,78.45380731098633]},{"type":"g4lever","id":"scArm","pivot":[-0.4864307865928664,86.44262143082754,78.45380731098633],"axis":[1,0,0],"mountTo":"sc:axle","bind":{"mix":["knL","knR"],"frame":"thL","off":[0,8,5.7]},"parts":[{"name":"pad","kind":"obox","c":[0,47.566248083480964,3.186207937974185],"size":[44,7,16],"axes":[[1,0,0],[0,0.4138499162040082,-0.9103451251354814],[0,0.9103451251354814,0.4138499162040082]],"tone":"pad","role":"support","mount":"padPlate","round":2},{"name":"padPlate","kind":"obox","c":[0,45.703923460562926,7.282761001083851],"size":[40,2,13],"axes":[[1,0,0],[0,0.4138499162040082,-0.9103451251354814],[0,0.9103451251354814,0.4138499162040082]],"mount":"crossbar"},{"name":"crossbar","kind":"beam","a":[-29,44.4623737119509,10.013796376490296],"b":[29,44.4623737119509,10.013796376490296],"w":6,"h":6,"mount":"armL"},{"name":"armL","kind":"beam","a":[29,0,0],"b":[29,44.4623737119509,10.013796376490296],"w":5,"h":7,"up":[0,0,1],"mount":"hubL"},{"name":"hubL","kind":"cyl","c":[29,0,0],"axis":[1,0,0],"r":4.5,"len":6,"mount":"sc:axle"},{"name":"hornL","kind":"cyl","c":[42.5,44.4623737119509,10.013796376490296],"axis":[1,0,0],"r":2.5,"len":21,"tone":"chrome","mount":"armL"},{"name":"discL","kind":"cyl","c":[42,44.4623737119509,10.013796376490296],"axis":[1,0,0],"r":16,"len":3.2,"tone":"plate","mount":"hornL","sides":28},{"name":"hPostL","kind":"beam","a":[29,29.263620721697304,6.590739870173722],"b":[29,26.83398825833353,17.378579217734927],"w":3,"h":3,"up":[0,0,1],"mount":"armL"},{"name":"handleL","kind":"beam","a":[30.5,26.83398825833353,17.378579217734927],"b":[15,26.83398825833353,17.378579217734927],"r":1.6,"tone":"rubber","role":"grip","mount":"hPostL"},{"name":"armR","kind":"beam","a":[-29,0,0],"b":[-29,44.4623737119509,10.013796376490296],"w":5,"h":7,"up":[0,0,1],"mount":"hubR"},{"name":"hubR","kind":"cyl","c":[-29,0,0],"axis":[1,0,0],"r":4.5,"len":6,"mount":"sc:axle"},{"name":"hornR","kind":"cyl","c":[-42.5,44.4623737119509,10.013796376490296],"axis":[1,0,0],"r":2.5,"len":21,"tone":"chrome","mount":"armR"},{"name":"discR","kind":"cyl","c":[-42,44.4623737119509,10.013796376490296],"axis":[1,0,0],"r":16,"len":3.2,"tone":"plate","mount":"hornR","sides":28},{"name":"hPostR","kind":"beam","a":[-29,29.263620721697304,6.590739870173722],"b":[-29,26.83398825833353,17.378579217734927],"w":3,"h":3,"up":[0,0,1],"mount":"armR"},{"name":"handleR","kind":"beam","a":[-30.5,26.83398825833353,17.378579217734927],"b":[-15,26.83398825833353,17.378579217734927],"r":1.6,"tone":"rubber","role":"grip","mount":"hPostR"}]}],"contacts":[{"body":"buttocks","prop":"sc:seat"},{"body":"soleL","prop":"sc:stepTop"},{"body":"soleR","prop":"sc:stepTop"},{"body":"thL","prop":"scArm:pad"},{"body":"thR","prop":"scArm:pad"},{"body":"gripL","prop":"scArm:handleL"},{"body":"gripR","prop":"scArm:handleR"}]},
"abduction":{"keys":[{"t":0,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,75.96,2.73,1.49,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,75.96,2.73,1.49,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,75.48,9.92,5.43,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,75.48,9.92,5.43,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,72.09,27.01,14.99,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,72.09,27.01,14.99,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,65.55,43.31,24.71,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,65.55,43.31,24.71,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,61.94,49.71,28.81,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,61.94,49.71,28.81,84,2,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"hipAbductor","id":"ha","seat":{"c":[56.12760154373611,0.7246233135977427],"ang":10,"len":42},"back":{"c0":[52.30734163506364,-20.941147252670834],"ang":16,"len":62},"hub":{"x":8.8,"y":28.307341635063644,"z":-12.78549324713006},"handle":{"x":25,"y":54.30734163506364,"z":-10.78549324713006}},{"type":"g4lever","id":"haL","pivot":[8.8,28.307341635063644,-12.78549324713006],"axis":[0,1,0],"mountTo":"ha:hubL","bind":"knL","parts":[{"name":"hub","kind":"cyl","c":[-3,0,0],"axis":[1,0,0],"r":5,"len":7,"mount":"ha:hubL"},{"name":"arm","kind":"beam","a":[-3,0,0],"b":[-3,40.37417106560966,15.3],"w":5,"h":5,"up":[1,0,0],"mount":"hub"},{"name":"post","kind":"beam","a":[-18.82358044364375,40.37417106560966,15.3],"b":[43.409107349564515,40.37417106560966,15.3],"w":4.5,"h":4.5,"up":[0,1,0],"mount":"arm"},{"name":"padPlate","kind":"obox","c":[37.909107349564515,42.37417106560966,11.400000000000002],"size":[12,18,2],"mount":"post"},{"name":"pad","kind":"obox","c":[37.909107349564515,42.37417106560966,8.100000000000001],"size":[14,20,7],"tone":"pad","role":"pad","mount":"padPlate","round":1.8},{"name":"pegArm","kind":"beam","a":[-17.82358044364375,40.37417106560966,15.3],"b":[-17.82358044364375,62.86573608796837,0],"w":3,"h":3,"up":[1,0,0],"mount":"post"},{"name":"peg","kind":"obox","c":[-15.22358044364375,61.86573608796837,0],"size":[3,16,11],"tone":"rubber","mount":"pegArm","round":0.5}]},{"type":"g4lever","id":"haR","pivot":[-8.8,28.307341635063644,-12.78549324713006],"axis":[0,1,0],"mountTo":"ha:hubR","bind":"knR","parts":[{"name":"hub","kind":"cyl","c":[-3,0,0],"axis":[1,0,0],"r":5,"len":7,"mount":"ha:hubR"},{"name":"arm","kind":"beam","a":[-3,0,0],"b":[-3,40.37417106560966,-15.3],"w":5,"h":5,"up":[1,0,0],"mount":"hub"},{"name":"post","kind":"beam","a":[-18.82358044364375,40.37417106560966,-15.3],"b":[43.409107349564515,40.37417106560966,-15.3],"w":4.5,"h":4.5,"up":[0,1,0],"mount":"arm"},{"name":"padPlate","kind":"obox","c":[37.909107349564515,42.37417106560966,-11.400000000000002],"size":[12,18,2],"mount":"post"},{"name":"pad","kind":"obox","c":[37.909107349564515,42.37417106560966,-8.100000000000001],"size":[14,20,7],"tone":"pad","role":"pad","mount":"padPlate","round":1.8},{"name":"pegArm","kind":"beam","a":[-17.82358044364375,40.37417106560966,-15.3],"b":[-17.82358044364375,62.86573608796837,0],"w":3,"h":3,"up":[1,0,0],"mount":"post"},{"name":"peg","kind":"obox","c":[-15.22358044364375,61.86573608796837,0],"size":[3,16,11],"tone":"rubber","mount":"pegArm","round":0.5}]}],"contacts":[{"body":"buttocks","prop":"ha:seat"},{"body":"back","prop":"ha:back"},{"body":"kneeL","prop":"haL:pad"},{"body":"kneeR","prop":"haR:pad"},{"body":"soleL","prop":"haL:peg"},{"body":"soleR","prop":"haR:peg"},{"body":"gripL","prop":"ha:handleL"},{"body":"gripR","prop":"ha:handleR"}]},
"adduction":{"keys":[{"t":0,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,63.37,47.31,27.25,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,63.37,47.31,27.25,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,65.71,43.01,24.52,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,65.71,43.01,24.52,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,70.37,32.24,18.02,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,70.37,32.24,18.02,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,73.64,21.05,11.6,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,73.64,21.05,11.6,84,2,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,63.24,-12.79,0.99027,-0.13917,0,0,2,0,0,0,0,0,-2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,74.59,16.33,8.97,84,2,0,0,-2,-2,-4.68,39.74,-72.28,55.34,-80.7,0.04,-24.26,74.59,16.33,8.97,84,2,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"hipAbductor","id":"ha","seat":{"c":[56.12760154373611,0.7246233135977427],"ang":10,"len":42},"back":{"c0":[52.30734163506364,-20.941147252670834],"ang":16,"len":62},"hub":{"x":8.8,"y":28.307341635063644,"z":-12.78549324713006},"handle":{"x":25,"y":54.30734163506364,"z":-10.78549324713006}},{"type":"g4lever","id":"haL","pivot":[8.8,28.307341635063644,-12.78549324713006],"axis":[0,1,0],"mountTo":"ha:hubL","bind":"knL","parts":[{"name":"hub","kind":"cyl","c":[-3,0,0],"axis":[1,0,0],"r":5,"len":7,"mount":"ha:hubL"},{"name":"arm","kind":"beam","a":[-3,0,0],"b":[-3,40.37417106560966,-15.3],"w":5,"h":5,"up":[1,0,0],"mount":"hub"},{"name":"post","kind":"beam","a":[-18.82358044364375,40.37417106560966,-15.3],"b":[43.409107349564515,40.37417106560966,-15.3],"w":4.5,"h":4.5,"up":[0,1,0],"mount":"arm"},{"name":"padPlate","kind":"obox","c":[37.909107349564515,42.37417106560966,-11.400000000000002],"size":[12,18,2],"mount":"post"},{"name":"pad","kind":"obox","c":[37.909107349564515,42.37417106560966,-8.100000000000001],"size":[14,20,7],"tone":"pad","role":"pad","mount":"padPlate","round":1.8},{"name":"pegArm","kind":"beam","a":[-17.82358044364375,40.37417106560966,-15.3],"b":[-17.82358044364375,62.86573608796837,0],"w":3,"h":3,"up":[1,0,0],"mount":"post"},{"name":"peg","kind":"obox","c":[-15.22358044364375,61.86573608796837,0],"size":[3,16,11],"tone":"rubber","mount":"pegArm","round":0.5}]},{"type":"g4lever","id":"haR","pivot":[-8.8,28.307341635063644,-12.78549324713006],"axis":[0,1,0],"mountTo":"ha:hubR","bind":"knR","parts":[{"name":"hub","kind":"cyl","c":[-3,0,0],"axis":[1,0,0],"r":5,"len":7,"mount":"ha:hubR"},{"name":"arm","kind":"beam","a":[-3,0,0],"b":[-3,40.37417106560966,15.3],"w":5,"h":5,"up":[1,0,0],"mount":"hub"},{"name":"post","kind":"beam","a":[-18.82358044364375,40.37417106560966,15.3],"b":[43.409107349564515,40.37417106560966,15.3],"w":4.5,"h":4.5,"up":[0,1,0],"mount":"arm"},{"name":"padPlate","kind":"obox","c":[37.909107349564515,42.37417106560966,11.400000000000002],"size":[12,18,2],"mount":"post"},{"name":"pad","kind":"obox","c":[37.909107349564515,42.37417106560966,8.100000000000001],"size":[14,20,7],"tone":"pad","role":"pad","mount":"padPlate","round":1.8},{"name":"pegArm","kind":"beam","a":[-17.82358044364375,40.37417106560966,15.3],"b":[-17.82358044364375,62.86573608796837,0],"w":3,"h":3,"up":[1,0,0],"mount":"post"},{"name":"peg","kind":"obox","c":[-15.22358044364375,61.86573608796837,0],"size":[3,16,11],"tone":"rubber","mount":"pegArm","round":0.5}]}],"contacts":[{"body":"buttocks","prop":"ha:seat"},{"body":"back","prop":"ha:back"},{"body":"kneeL","prop":"haL:pad"},{"body":"kneeR","prop":"haR:pad"},{"body":"soleL","prop":"haL:peg"},{"body":"soleR","prop":"haR:peg"},{"body":"gripL","prop":"ha:handleL"},{"body":"gripR","prop":"ha:handleR"}]},
"leverrowm":{"keys":[{"t":0,"v":[0,56.68,5.25,0.99863,0.05234,0,0,0,0,0,0,0,0,-6,0,0,-2,14,67.84,19.75,-16.53,34.93,-30.57,-0.03,9.05,85.42,23.53,26.35,87.55,4.83,-9.28,0,-2,14,67.84,19.75,-16.53,34.93,-30.57,-0.03,9.05,85.42,23.53,26.35,87.55,4.83,-9.28,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,56.68,5.25,0.99863,0.05234,0,0,0,0,0,0,0,0,-6,0,0,-1.41,9.61,49.47,25.42,-11.63,60.92,-30.74,-0.03,-2.01,85.42,23.53,26.35,87.55,4.83,-9.28,0,-1.41,9.61,49.47,25.42,-11.63,60.92,-30.74,-0.03,-2.01,85.42,23.53,26.35,87.55,4.83,-9.28,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,56.68,5.25,0.99863,0.05234,0,0,0,0,0,0,0,0,-6,0,0,0,-1,13.23,29.93,-4.28,100.24,-31.85,-0.03,-15.9,85.42,23.53,26.35,87.55,4.83,-9.28,0,0,-1,13.23,29.93,-4.28,100.24,-31.85,-0.03,-15.9,85.42,23.53,26.35,87.55,4.83,-9.28,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,56.68,5.25,0.99863,0.05234,0,0,0,0,0,0,0,0,-6,0,0,1.41,-11.61,-27.04,27.07,4.1,127.86,-29.49,-0.02,-17.45,85.42,23.53,26.35,87.55,4.83,-9.28,0,1.41,-11.61,-27.04,27.07,4.1,127.86,-29.49,-0.02,-17.45,85.42,23.53,26.35,87.55,4.83,-9.28,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,56.68,5.25,0.99863,0.05234,0,0,0,0,0,0,0,0,-6,0,0,2,-16,-47.67,22.52,8.93,135.85,-27.1,-0.03,-11.61,85.42,23.53,26.35,87.55,4.83,-9.28,0,2,-16,-47.67,22.52,8.93,135.85,-27.1,-0.03,-11.61,85.42,23.53,26.35,87.55,4.83,-9.28,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"seatedLever","id":"lr","seat":{"h":48,"z0":-24,"z1":12},"pad":{"kind":"chest","z":18.108123765217822,"ang":6,"y0":70,"y1":114,"w":30},"hub":{"x":44,"y":181.65259167286445,"z":26.687182432393737},"tower":{"z":82,"h":195.65259167286445}},{"type":"g4lever","id":"lrL","pivot":[44,181.65259167286445,26.687182432393737],"axis":[1,0,0],"bind":"gripL","mountTo":"lr:hubL","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"lr:hubL"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,94.23763418979203,-1.9353751647973418],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,92.23763418979203,-1.9353751647973418],"b":[-22,92.23763418979203,-1.9353751647973418],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[-22,92.23763418979203,-1.9353751647973418],"b":[-22,106.79207008393197,1.693453269197674],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]},{"type":"g4lever","id":"lrR","pivot":[-44,181.65259167286445,26.687182432393737],"axis":[1,0,0],"bind":"gripR","mountTo":"lr:hubR","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"lr:hubR"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,94.23763418979203,-1.9353751647973418],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,92.23763418979203,-1.9353751647973418],"b":[22,92.23763418979203,-1.9353751647973418],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[22,92.23763418979203,-1.9353751647973418],"b":[22,106.79207008393197,1.693453269197674],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]}],"contacts":[{"body":"buttocks","prop":"lr:seat"},{"body":"chest","prop":"lr:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"lrL:handle"},{"body":"gripR","prop":"lrR:handle"}]},
"shoulderpressm":{"keys":[{"t":0,"v":[0,54.68,0.2,0.99863,-0.05234,0,0,0,0,0,0,0,0,-2,0,0,4,0,30.12,39.85,67.06,139.86,27.9,-10.01,-2.96,76.14,22.2,22.36,95.07,10.03,-7.76,0,4,0,30.12,39.85,67.06,139.86,27.9,-10.01,-2.96,76.14,22.2,22.36,95.07,10.03,-7.76,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,54.68,0.2,0.99863,-0.05234,0,0,0,0,0,0,0,0,-2,0,0,4.73,0.44,36.61,54.81,62.62,131.75,33.59,-8.64,-12.14,76.14,22.2,22.36,95.07,10.03,-7.76,0,4.73,0.44,36.61,54.81,62.62,131.75,33.59,-8.64,-12.14,76.14,22.2,22.36,95.07,10.03,-7.76,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,54.68,0.2,0.99863,-0.05234,0,0,0,0,0,0,0,0,-2,0,0,6.5,1.5,44.19,87.88,63.46,104.21,30.63,-5.62,-20.08,76.14,22.2,22.36,95.07,10.03,-7.76,0,6.5,1.5,44.19,87.88,63.46,104.21,30.63,-5.62,-20.08,76.14,22.2,22.36,95.07,10.03,-7.76,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,54.68,0.2,0.99863,-0.05234,0,0,0,0,0,0,0,0,-2,0,0,8.27,2.56,36.79,123.38,74.76,63.73,18.47,-3.14,-11.6,76.14,22.2,22.36,95.07,10.03,-7.76,0,8.27,2.56,36.79,123.38,74.76,63.73,18.47,-3.14,-11.6,76.14,22.2,22.36,95.07,10.03,-7.76,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,54.68,0.2,0.99863,-0.05234,0,0,0,0,0,0,0,0,-2,0,0,9,3,26.28,142.53,84.05,36.24,14.13,-2.01,-0.58,76.14,22.2,22.36,95.07,10.03,-7.76,0,9,3,26.28,142.53,84.05,36.24,14.13,-2.01,-0.58,76.14,22.2,22.36,95.07,10.03,-7.76,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"seatedLever","id":"sp","seat":{"h":46,"z0":-28,"z1":16},"pad":{"kind":"back","z":-10.216247530435647,"ang":6,"y0":50,"y1":120},"hub":{"x":42,"y":130.0396867798729,"z":-71.55300880199822},"tower":{"z":-77.55300880199822,"h":170.0396867798729}},{"type":"g4lever","id":"spL","pivot":[42,130.0396867798729,-71.55300880199822],"axis":[1,0,0],"bind":"gripL","mountTo":"sp:hubL","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"sp:hubL"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,74.5,0],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,72,0],"b":[-1,72,0],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[-1,72,0],"b":[-14,72,0],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]},{"type":"g4lever","id":"spR","pivot":[-42,130.0396867798729,-71.55300880199822],"axis":[1,0,0],"bind":"gripR","mountTo":"sp:hubR","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"sp:hubR"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,74.5,0],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,72,0],"b":[1,72,0],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[1,72,0],"b":[14,72,0],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]}],"contacts":[{"body":"buttocks","prop":"sp:seat"},{"body":"back","prop":"sp:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"spL:handle"},{"body":"gripR","prop":"spR:handle"}]},
"chestpressm":{"keys":[{"t":0,"v":[0,55.04,0.48,0.99619,-0.08716,0,0,2,0,0,0,0,0,-4,0,0,0,-8,1.44,62.25,-9.1,108.59,-65.43,-7.62,-18.41,71.94,21.3,21.22,94.54,9.96,-7.54,0,0,-8,1.44,62.25,-9.1,108.59,-65.43,-7.62,-18.41,71.94,21.3,21.22,94.54,9.96,-7.54,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.04,0.48,0.99619,-0.08716,0,0,2,0,0,0,0,0,-4,0,0,0.44,-5.95,8.73,57.66,-12.53,100.54,-61.02,-7.71,-16.2,71.94,21.3,21.22,94.54,9.96,-7.54,0,0.44,-5.95,8.73,57.66,-12.53,100.54,-61.02,-7.71,-16.2,71.94,21.3,21.22,94.54,9.96,-7.54,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.04,0.48,0.99619,-0.08716,0,0,2,0,0,0,0,0,-4,0,0,1.5,-1,25.46,46.08,-18.96,78.11,-52.25,-7.87,-8.41,71.94,21.3,21.22,94.54,9.96,-7.54,0,1.5,-1,25.46,46.08,-18.96,78.11,-52.25,-7.87,-8.41,71.94,21.3,21.22,94.54,9.96,-7.54,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.04,0.48,0.99619,-0.08716,0,0,2,0,0,0,0,0,-4,0,0,2.56,3.95,44.37,32.58,-25.21,47.31,-47.11,-7.95,4.55,71.94,21.3,21.22,94.54,9.96,-7.54,0,2.56,3.95,44.37,32.58,-25.21,47.31,-47.11,-7.95,4.55,71.94,21.3,21.22,94.54,9.96,-7.54,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.04,0.48,0.99619,-0.08716,0,0,2,0,0,0,0,0,-4,0,0,3,6,55.46,24.14,-29.44,26.71,-47.11,-7.76,13.41,71.94,21.3,21.22,94.54,9.96,-7.54,0,3,6,55.46,24.14,-29.44,26.71,-47.11,-7.76,13.41,71.94,21.3,21.22,94.54,9.96,-7.54,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"seatedLever","id":"cp","front":[0,90.34780038631115,7.455211831355958],"seat":{"h":46,"z0":-30,"z1":14},"pad":{"kind":"back","z":-9.65222869449526,"ang":10,"y0":50,"y1":120},"hub":{"x":38,"y":176.93815189977443,"z":40.28782679496466},"tower":{"z":-50,"h":190.93815189977443}},{"type":"g4lever","id":"cpL","pivot":[38,176.93815189977443,40.28782679496466],"axis":[1,0,0],"bind":"gripL","mountTo":"cp:hubL","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"cp:hubL"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,98,0],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,96,0],"b":[-10,96,0],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[-10,96,0],"b":[-10,81,0],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]},{"type":"g4lever","id":"cpR","pivot":[-38,176.93815189977443,40.28782679496466],"axis":[1,0,0],"bind":"gripR","mountTo":"cp:hubR","parts":[{"name":"hub","kind":"cyl","c":[0,0,0],"axis":[1,0,0],"r":5.5,"len":6,"mount":"cp:hubR"},{"name":"arm","kind":"beam","a":[0,0,0],"b":[0,98,0],"w":5,"h":7,"up":[0,0,1],"mount":"hub"},{"name":"stub","kind":"beam","a":[0,96,0],"b":[10,96,0],"r":2,"mount":"arm","tone":"chrome"},{"name":"handle","kind":"beam","a":[10,96,0],"b":[10,81,0],"r":1.6,"mount":"stub","tone":"rubber","role":"grip"}]}],"contacts":[{"body":"buttocks","prop":"cp:seat"},{"body":"back","prop":"cp:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"cpL:handle"},{"body":"gripR","prop":"cpR:handle"}]},
"captainraise":{"keys":[{"t":0,"v":[0,124.67,4,1,0,0,0,0,0,0,0,0,0,0,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,6,5,5,10,-20,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,6,5,5,10,-20,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,124.69,4.7,0.9996,-0.02824,0,0,2.67,0,0,0.57,0,0,0.88,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,19.77,5,5,24.94,-18.54,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,19.77,5,5,24.94,-18.54,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,124.87,6.39,0.99535,-0.09628,0,0,9.1,0,0,1.95,0,0,3,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,53,5,5,61,-15,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,53,5,5,61,-15,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,125.23,8.05,0.98648,-0.16387,0,0,15.53,0,0,3.33,0,0,5.12,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,86.23,5,5,97.06,-11.46,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,86.23,5,5,97.06,-11.46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,125.44,8.71,0.98146,-0.19167,0,0,18.2,0,0,3.9,0,0,6,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,100,5,5,112,-10,0,0,14,0,-0.17,1.12,5.66,90.05,-1.13,0.01,0.01,100,5,5,112,-10,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"captainsChair","id":"cc","back":{"z":-5.864571746546517,"y0":96,"y1":164},"arm":{"x":22,"y":142,"z0":-6,"z1":34},"handle":{"x":19.4,"y":145.9,"z":39}}],"contacts":[{"body":"upperBack","prop":"cc:back"},{"body":"faL","prop":"cc:armL"},{"body":"faR","prop":"cc:armR"},{"body":"gripL","prop":"cc:handleL"},{"body":"gripR","prop":"cc:handleR"}]},
"assistpull":{"keys":[{"t":0,"v":[0,119.82,-1.13,1,0,0,0,-2,0,0,0,0,0,0,0,0,18,4,28.49,140.35,77.02,46.68,10.42,-0.01,-9.9,2,0,0,90.69,-40,0,0,18,4,28.49,140.35,77.02,46.68,10.42,-0.01,-9.9,2,0,0,90.69,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,124.3,-2.36,0.99999,-0.005,0,0,-2,0,0,-0.76,0,0,-1.15,0,0,15.71,2.66,38.43,127.67,67.1,62.71,13.06,-0.01,-16.77,1.81,0,0,91.07,-40,0,0,15.71,2.66,38.43,127.67,67.1,62.71,13.06,-0.01,-16.77,1.81,0,0,91.07,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,136.1,-4.42,0.99984,-0.01809,0,0,-2,0,0,-2.76,0,0,-4.15,0,0,9.71,-0.84,45.55,101.83,51.35,91.32,20.34,-0.01,-26.53,1.31,0,0,92.07,-40,0,0,9.71,-0.84,45.55,101.83,51.35,91.32,20.34,-0.01,-26.53,1.31,0,0,92.07,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,150.81,-4.69,0.99941,-0.03426,0,0,-2,0,0,-5.24,0,0,-7.85,0,0,2.29,-5.16,35.72,78.08,41.92,116.02,27.93,0.01,-29.53,0.69,0,0,93.3,-40,0,0,2.29,-5.16,35.72,78.08,41.92,116.02,27.93,0.01,-29.53,0.69,0,0,93.3,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,162.82,-2.96,0.99888,-0.04734,0,0,-2,0,0,-7.24,0,0,-10.85,0,0,-3.71,-8.66,17.74,61.9,40.87,131.7,30.47,-0.02,-25.43,0.19,0,0,94.3,-40,0,0,-3.71,-8.66,17.74,61.9,40.87,131.7,30.47,-0.02,-25.43,0.19,0,0,94.3,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,167.43,-1.79,0.99863,-0.05234,0,0,-2,0,0,-8,0,0,-12,0,0,-6,-10,8.75,55.35,42.37,136.81,30.13,0.01,-21.66,0,0,0,94.69,-40,0,0,-6,-10,8.75,55.35,42.37,136.81,30.13,0.01,-21.66,0,0,0,94.69,-40,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"gravitron","id":"gv","tz":48,"pivot":[80,84],"linkV":-16,"pull":{"y":228,"z":2,"x0":20,"x1":44},"dip":{"y":122,"x":28,"z0":-30},"step":{"y":46,"z0":-18}},{"type":"g4link","id":"gvPad","pivot":[0,92,84],"axis":[1,0,0],"d0":[0,-12,0],"v":[0,-16,0],"armX":[-12,12],"mountTo":"gv:shaftU","mountTo2":"gv:shaftD","bind":{"mix":["knL","knR"],"frame":"skL","off":[0,0,5.4]},"carrier":[{"name":"pad","kind":"obox","c":[0,-3.5,-12],"size":[40,7,40],"tone":"pad","role":"support","mount":"plate","round":1.6},{"name":"plate","kind":"obox","c":[0,-8,-12],"size":[34,2,36],"mount":"frame"},{"name":"frame","kind":"beam","a":[-13,-11,2],"b":[13,-11,2],"w":6,"h":6,"mount":"post0"},{"name":"frameB","kind":"beam","a":[0,-11,2],"b":[0,-11,-26],"w":6,"h":4,"mount":"frame"}]}],"contacts":[{"body":"kneeL","prop":"gvPad:pad"},{"body":"kneeR","prop":"gvPad:pad"},{"body":"gripL","prop":"gv:pullL"},{"body":"gripR","prop":"gv:pullR"}]},
"assistdip":{"keys":[{"t":0,"v":[0,136.92,-0.47,0.99863,0.05234,0,0,2,0,0,2,0,0,-6,0,0,-6,4,-21.22,16.09,-11.62,34.53,-15.55,0.02,-2.68,4,0,0,86.69,-40,0,0,-6,4,-21.22,16.09,-11.62,34.53,-15.55,0.02,-2.68,4,0,0,86.69,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,133.47,0.57,0.99735,0.07274,0,0,2,0,0,2.59,0,0,-7.17,0,0,-4.24,2.54,-28.76,17.62,-10.11,47.79,-15.58,0.03,-5.37,5.17,0,0,85.51,-40,0,0,-4.24,2.54,-28.76,17.62,-10.11,47.79,-15.58,0.03,-5.37,5.17,0,0,85.51,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,125.54,3.58,0.99255,0.12187,0,0,2,0,0,4,0,0,-10,0,0,0,-1,-42.07,18.89,-6.98,65.11,-15.38,0.05,-2.56,8,0,0,82.69,-40,0,0,0,-1,-42.07,18.89,-6.98,65.11,-15.38,0.05,-2.56,8,0,0,82.69,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,118.15,7.15,0.98532,0.1707,0,0,2,0,0,5.41,0,0,-12.83,0,0,4.24,-4.54,-51.4,18.38,-4.84,69.68,-15.28,-0.02,8.78,10.83,0,0,79.86,-40,0,0,4.24,-4.54,-51.4,18.38,-4.84,69.68,-15.28,-0.02,8.78,10.83,0,0,79.86,-40,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,115.23,8.76,0.98163,0.19081,0,0,2,0,0,6,0,0,-14,0,0,6,-6,-53.8,17.93,-4.42,68.18,-15.51,-0.03,15.42,12,0,0,78.69,-40,0,0,6,-6,-53.8,17.93,-4.42,68.18,-15.51,-0.03,15.42,12,0,0,78.69,-40,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"gravitron","id":"gv","tz":48,"pivot":[80,84],"linkV":-16,"pull":{"y":228,"z":2,"x0":20,"x1":44},"dip":{"y":122,"x":28,"z0":-30},"step":{"y":46,"z0":-18}},{"type":"g4link","id":"gvPad","pivot":[0,92,84],"axis":[1,0,0],"d0":[0,-12,0],"v":[0,-16,0],"armX":[-12,12],"mountTo":"gv:shaftU","mountTo2":"gv:shaftD","bind":{"mix":["knL","knR"],"frame":"skL","off":[0,0,5.4]},"carrier":[{"name":"pad","kind":"obox","c":[0,-3.5,-12],"size":[40,7,40],"tone":"pad","role":"support","mount":"plate","round":1.6},{"name":"plate","kind":"obox","c":[0,-8,-12],"size":[34,2,36],"mount":"frame"},{"name":"frame","kind":"beam","a":[-13,-11,2],"b":[13,-11,2],"w":6,"h":6,"mount":"post0"},{"name":"frameB","kind":"beam","a":[0,-11,2],"b":[0,-11,-26],"w":6,"h":4,"mount":"frame"}]}],"contacts":[{"body":"kneeL","prop":"gvPad:pad"},{"body":"kneeR","prop":"gvPad:pad"},{"body":"gripL","prop":"gv:dipL"},{"body":"gripR","prop":"gv:dipR"}]},
"dip":{"keys":[{"t":0,"v":[0,138.3,-1.94,0.99452,0.10453,0,0,2,0,0,2,0,0,-8,0,0,-6,4,-5.27,14.29,-11.85,21.31,-15.58,0.04,0.2,16,4,6,70,-25,0,0,-6,4,-5.27,14.29,-11.85,21.31,-15.58,0.04,0.2,16,4,6,70,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,134.49,-2.25,0.99185,0.12738,0,0,2,0,0,2.59,0,0,-9.17,0,0,-4.24,2.54,-16.26,17.24,-9.57,45.05,-15.86,0.02,-9,17.46,4,6,71.46,-25,0,0,-4.24,2.54,-16.26,17.24,-9.57,45.05,-15.86,0.02,-9,17.46,4,6,71.46,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,125.65,-3.31,0.98325,0.18224,0,0,2,0,0,4,0,0,-12,0,0,0,-1,-31.81,20.09,-4.53,76.08,-16.54,-0.01,-17,21,4,6,75,-25,0,0,0,-1,-31.81,20.09,-4.53,76.08,-16.54,-0.01,-17,21,4,6,75,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,117.39,-4.53,0.97162,0.23653,0,0,2,0,0,5.41,0,0,-14.83,0,0,4.24,-4.54,-45.11,19.87,1.36,95.84,-16.69,-0.03,-16.73,24.54,4,6,78.54,-25,0,0,4.24,-4.54,-45.11,19.87,1.36,95.84,-16.69,-0.03,-16.73,24.54,4,6,78.54,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,114.15,-5.07,0.96593,0.25882,0,0,2,0,0,6,0,0,-16,0,0,6,-6,-50.7,18.82,4.19,101.93,-16.6,-0.04,-14.58,26,4,6,80,-25,0,0,6,-6,-50.7,18.82,4.19,101.93,-16.6,-0.04,-14.58,26,4,6,80,-25,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"dipStation","id":"dp","h":120,"x":28,"z":[-32,30]}],"contacts":[{"body":"gripL","prop":"dp:barL"},{"body":"gripR","prop":"dp:barR"}]},
"chinup":{"keys":[{"t":0,"v":[0,114.06,-68.21,1,0,0,0,-2,0,0,0,0,0,0,0,0,24,6,158.38,-30.78,-10.66,23.93,-78.74,0.09,-1.14,14,3,4,48,-28,0,0,24,6,158.38,-30.78,-10.66,23.93,-78.74,0.09,-1.14,14,3,4,48,-28,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,119.35,-69,0.99995,-0.01032,0,0,-2.1,0,0,-0.76,0,0,-0.57,0,0,21.14,4.66,141.74,-22.61,-7.64,47.31,-80.13,0.03,-2.73,14.76,3,4,48.76,-28,0,0,21.14,4.66,141.74,-22.61,-7.64,47.31,-80.13,0.03,-2.73,14.76,3,4,48.76,-28,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,133.45,-70.71,0.99952,-0.03087,0,0,-2.35,0,0,-2.76,0,0,-2.07,0,0,13.64,1.16,110,-12.69,-4.94,82.39,-83.36,-0.04,-3.1,16.76,3,4,50.76,-28,0,0,13.64,1.16,110,-12.69,-4.94,82.39,-83.36,-0.04,-3.1,16.76,3,4,50.76,-28,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,150.86,-70.61,0.99952,-0.03087,0,0,-2.65,0,0,-5.24,0,0,-3.93,0,0,4.36,-3.16,79.25,-5.86,-3.69,114.1,-86.11,-0.02,-1.48,19.24,3,4,53.24,-28,0,0,4.36,-3.16,79.25,-5.86,-3.69,114.1,-86.11,-0.02,-1.48,19.24,3,4,53.24,-28,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,164.6,-68.42,0.99995,-0.01032,0,0,-2.9,0,0,-7.24,0,0,-5.43,0,0,-3.14,-6.66,55.95,-1.8,-2.69,138.53,-87.58,0.02,0.1,21.24,3,4,55.24,-28,0,0,-3.14,-6.66,55.95,-1.8,-2.69,138.53,-87.58,0.02,0.1,21.24,3,4,55.24,-28,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,169.79,-67.3,1,0,0,0,-3,0,0,-8,0,0,-6,0,0,-6,-8,44.35,-0.38,-2.04,148.03,-88.21,-0.03,0.71,22,3,4,56,-28,0,0,-6,-8,44.35,-0.38,-2.04,148.03,-88.21,-0.03,0.71,22,3,4,56,-28,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","pullH":228}],"contacts":[{"body":"gripL","prop":"rack:pullBar"},{"body":"gripR","prop":"rack:pullBar"}]},
"hang":{"keys":[{"t":0,"v":[0,117.38,-67.2,1,0,0,0,-2,0,0,0,0,0,-2,0,0,10,2,14.26,164.46,90.93,7.5,10.73,0,7.5,6,3,4,14,-25,0,0,10,2,14.26,164.46,90.93,7.5,10.73,0,7.5,6,3,4,14,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,117.38,-67.2,1,0,0,0,-2,0,0,0,0,0,-2,0,0,10,2,14.26,164.46,90.93,7.5,10.73,0,7.5,6,3,4,14,-25,0,0,10,2,14.26,164.46,90.93,7.5,10.73,0,7.5,6,3,4,14,-25,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","pullH":228}],"contacts":[{"body":"gripL","prop":"rack:pullBar"},{"body":"gripR","prop":"rack:pullBar"}]},
"legraise":{"keys":[{"t":0,"v":[0,117.54,-66.88,0,0,1,0,-2,0,0,0,0,0,-2,0,0,10,4,11.34,162.14,92.5,12.95,10.24,0.01,4.68,4,3,3,8,-25,0,0,10,4,11.34,162.14,92.5,12.95,10.24,0.01,4.68,4,3,3,8,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,117.47,-64.35,0,0,0.99916,0.04088,1.22,0,0,1.46,0,0,-0.54,0,0,10.88,4,43.82,155.8,71.44,13.12,13.05,0.01,4.68,12.49,3,3,8.29,-24.27,0,0,10.88,4,43.82,155.8,71.44,13.12,13.05,0.01,4.68,12.49,3,3,8.29,-24.27,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,118.32,-59.31,0,0,0.99027,0.13917,9,0,0,5,0,0,3,0,0,13,4,92.99,128.05,35.6,13.37,18.74,0,4.81,33,3,3,9,-22.5,0,0,13,4,92.99,128.05,35.6,13.37,18.74,0,4.81,33,3,3,9,-22.5,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,119.73,-57.17,0,0,0.97173,0.23611,16.78,0,0,8.54,0,0,6.54,0,0,15.12,4,109.6,109.67,20.28,13.31,22.03,0,5.06,53.51,3,3,9.71,-20.73,0,0,15.12,4,109.6,109.67,20.28,13.31,22.03,0,5.06,53.51,3,3,9.71,-20.73,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,120.2,-57.4,0,0,0.96126,0.27564,20,0,0,10,0,0,8,0,0,16,4,111.69,106.7,18.07,13.2,22.58,0,5.18,62,3,3,10,-20,0,0,16,4,111.69,106.7,18.07,13.2,22.58,0,5.18,62,3,3,10,-20,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","pullH":228}],"contacts":[{"body":"gripL","prop":"rack:pullBar"},{"body":"gripR","prop":"rack:pullBar"}]},
"hangknee":{"keys":[{"t":0,"v":[0,117.54,-66.75,0,0,1,0,-2,0,0,0,0,0,-2,0,0,10,4,12.52,162.04,91.75,12.96,10.34,0.01,4.68,6,4,4,14,-25,0,0,10,4,12.52,162.04,91.75,12.96,10.34,0.01,4.68,6,4,4,14,-25,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,117.58,-64.09,0,0,0.99856,0.05365,1.81,0,0,1.76,0,0,-0.24,0,0,10.88,4,55.94,151.33,62.81,13.18,13.78,0,4.67,18.59,4,4,28.35,-23.54,0,0,10.88,4,55.94,151.33,62.81,13.18,13.78,0,4.67,18.59,4,4,28.35,-23.54,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,119.07,-60.06,0,0,0.98325,0.18224,11,0,0,6,0,0,4,0,0,13,4,106.04,114.23,22.48,13.46,19.91,0,4.82,49,4,4,63,-20,0,0,13,4,106.04,114.23,22.48,13.46,19.91,0,4.82,49,4,4,63,-20,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,120.71,-61.63,0,0,0.95146,0.30777,20.19,0,0,10.24,0,0,8.24,0,0,15.12,4,115.57,100.07,11.26,13.29,21.75,0,5.06,79.41,4,4,97.65,-16.46,0,0,15.12,4,115.57,100.07,11.26,13.29,21.75,0,5.06,79.41,4,4,97.65,-16.46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,121.14,-63.98,0,0,0.93358,0.35837,24,0,0,12,0,0,10,0,0,16,4,115.39,100.49,11.12,13.1,21.28,0,5.17,92,4,4,112,-15,0,0,16,4,115.39,100.49,11.12,13.1,21.28,0,5.17,92,4,4,112,-15,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","pullH":228}],"contacts":[{"body":"gripL","prop":"rack:pullBar"},{"body":"gripR","prop":"rack:pullBar"}]},
"lpcalf":{"keys":[{"t":0,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,56.54,1.95,13.13,8,11.25,0.7,-12,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,56.54,1.95,13.13,8,11.25,0.7,-12],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,57.3,2.01,13.11,8,4.37,0.12,-5.85,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,57.3,2.01,13.11,8,4.37,0.12,-5.85],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,59.44,2.23,13.1,8,-12.58,-1.26,9,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,59.44,2.23,13.1,8,-12.58,-1.26,9],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,61.9,2.55,13.15,8,-29.87,-2.45,23.85,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,61.9,2.55,13.15,8,-29.87,-2.45,23.85],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,62.98,2.71,13.19,8,-37.1,-2.86,30,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,62.98,2.71,13.19,8,-37.1,-2.86,30],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"legPress45","id":"lp","rx":28,"seat":{"c":[44.596999525238374,19.22255296960803],"ang":18,"len":40},"back":{"c0":[38.10764264336448,-0.7496338725901913],"ang":28,"len":86},"rail":{"a":[20.301515190165002,15.556349186104047],"b":[158.89444430272832,154.14927829866738]},"handle":{"x":26,"y":56,"z":16,"ax":[1,0]}},{"type":"g4sled","id":"sled","rail":[[0,20.301515190165002,15.556349186104047],[0,158.89444430272832,154.14927829866738]],"up":[0,0.7071067811865476,-0.7071067811865476],"bind":{"mix":["ballL","ballR"]},"mountTo":"lp:railL","parts":[{"name":"plate","kind":"obox","c":[0,35.52953232837201,14.613305953404787],"size":[74,4,58],"axes":[[1,0,0],[0,0.4226182617406995,-0.90630778703665],[0,0.90630778703665,0.4226182617406995]],"tone":"rubber","mount":"deck","round":0.5},{"name":"deck","kind":"obox","c":[0,33.839059281409206,18.238537101551387],"size":[66,4,54],"axes":[[1,0,0],[0,0.4226182617406995,-0.90630778703665],[0,0.90630778703665,0.4226182617406995]],"mount":"carL","round":0.4},{"name":"carL","kind":"obox","c":[28,5,39.9826075110711],"size":[8,6,80],"mount":"lp:railL","round":0.6},{"name":"strutL","kind":"beam","a":[28,7,6.982607511071102],"b":[28,8.556133457346352,6.982607511071102],"w":6,"h":6,"mount":"carL"},{"name":"braceL","kind":"beam","a":[28,7,57.9826075110711],"b":[28,58.12198510547205,31.494466692031672],"w":6,"h":6,"mount":"carL"},{"name":"hornL","kind":"cyl","c":[45,18,67.98260751107111],"axis":[1,0,0],"r":2.5,"len":26,"tone":"chrome","mount":"hornBar"},{"name":"discL","kind":"cyl","c":[42.6,18,67.98260751107111],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornL","sides":32},{"name":"disc2L","kind":"cyl","c":[48.4,18,67.98260751107111],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"discL","sides":32},{"name":"carR","kind":"obox","c":[-28,5,39.9826075110711],"size":[8,6,80],"mount":"lp:railR","round":0.6},{"name":"strutR","kind":"beam","a":[-28,7,6.982607511071102],"b":[-28,8.556133457346352,6.982607511071102],"w":6,"h":6,"mount":"carR"},{"name":"braceR","kind":"beam","a":[-28,7,57.9826075110711],"b":[-28,58.12198510547205,31.494466692031672],"w":6,"h":6,"mount":"carR"},{"name":"hornR","kind":"cyl","c":[-45,18,67.98260751107111],"axis":[1,0,0],"r":2.5,"len":26,"tone":"chrome","mount":"hornBar"},{"name":"discR","kind":"cyl","c":[-42.6,18,67.98260751107111],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornR","sides":32},{"name":"disc2R","kind":"cyl","c":[-48.4,18,67.98260751107111],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"discR","sides":32},{"name":"hornBar","kind":"beam","a":[-32,18,67.98260751107111],"b":[32,18,67.98260751107111],"w":6,"h":6,"mount":"hornPostL"},{"name":"hornPostL","kind":"beam","a":[28,7,67.98260751107111],"b":[28,21,67.98260751107111],"w":6,"h":6,"mount":"carL"},{"name":"hornPostR","kind":"beam","a":[-28,7,67.98260751107111],"b":[-28,21,67.98260751107111],"w":6,"h":6,"mount":"carR"}]}],"contacts":[{"body":"buttocks","prop":"lp:seat"},{"body":"back","prop":"lp:back"},{"body":"soleL","prop":"sled:plate"},{"body":"soleR","prop":"sled:plate"},{"body":"gripL","prop":"lp:handleL"},{"body":"gripR","prop":"lp:handleR"}]},
"legpress":{"keys":[{"t":0,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,82.51,5.15,13.98,20.11,-14.57,-3.29,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,82.51,5.15,13.98,20.11,-14.57,-3.29,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,91.21,8.41,15.58,38.01,-5.75,-3.22,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,91.21,8.41,15.58,38.01,-5.75,-3.22,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,103.29,14.13,18.37,63.37,6.72,-3.05,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,103.29,14.13,18.37,63.37,6.72,-3.05,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,111.74,19.38,20.94,81.7,15.69,-2.84,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,111.74,19.38,20.94,81.7,15.69,-2.84,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,50,0,0.85717,-0.51504,0,0,0,0,0,0,0,0,-18.49,0,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,114.71,21.6,22.03,88.34,18.93,-2.74,0,-2,-4,-9,18.96,-17.63,43.78,-24.2,-0.02,-4.39,114.71,21.6,22.03,88.34,18.93,-2.74,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"legPress45","id":"lp","rx":28,"seat":{"c":[44.596999525238374,19.22255296960803],"ang":18,"len":40},"back":{"c0":[38.10764264336448,-0.7496338725901913],"ang":28,"len":86},"rail":{"a":[20.301515190165002,15.556349186104047],"b":[158.89444430272832,154.14927829866738]},"handle":{"x":26,"y":56,"z":16,"ax":[1,0]}},{"type":"g4sled","id":"sled","rail":[[0,20.301515190165002,15.556349186104047],[0,158.89444430272832,154.14927829866738]],"up":[0,0.7071067811865476,-0.7071067811865476],"bind":{"mix":["ballL","ballR"]},"mountTo":"lp:railL","parts":[{"name":"plate","kind":"obox","c":[0,35.52953232837201,1.9347581011838022],"size":[74,4,58],"axes":[[1,0,0],[0,0.4226182617406995,-0.90630778703665],[0,0.90630778703665,0.4226182617406995]],"tone":"rubber","mount":"deck","round":0.5},{"name":"deck","kind":"obox","c":[0,33.839059281409206,5.559989249330402],"size":[66,4,54],"axes":[[1,0,0],[0,0.4226182617406995,-0.90630778703665],[0,0.90630778703665,0.4226182617406995]],"mount":"carL","round":0.4},{"name":"carL","kind":"obox","c":[28,5,27.304059658850115],"size":[8,6,80],"mount":"lp:railL","round":0.6},{"name":"strutL","kind":"beam","a":[28,7,-5.695940341149884],"b":[28,8.556133457346352,-5.695940341149884],"w":6,"h":6,"mount":"carL"},{"name":"braceL","kind":"beam","a":[28,7,45.304059658850115],"b":[28,58.12198510547205,18.81591883981069],"w":6,"h":6,"mount":"carL"},{"name":"hornL","kind":"cyl","c":[45,18,55.304059658850115],"axis":[1,0,0],"r":2.5,"len":26,"tone":"chrome","mount":"hornBar"},{"name":"discL","kind":"cyl","c":[42.6,18,55.304059658850115],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornL","sides":32},{"name":"disc2L","kind":"cyl","c":[48.4,18,55.304059658850115],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"discL","sides":32},{"name":"carR","kind":"obox","c":[-28,5,27.304059658850115],"size":[8,6,80],"mount":"lp:railR","round":0.6},{"name":"strutR","kind":"beam","a":[-28,7,-5.695940341149884],"b":[-28,8.556133457346352,-5.695940341149884],"w":6,"h":6,"mount":"carR"},{"name":"braceR","kind":"beam","a":[-28,7,45.304059658850115],"b":[-28,58.12198510547205,18.81591883981069],"w":6,"h":6,"mount":"carR"},{"name":"hornR","kind":"cyl","c":[-45,18,55.304059658850115],"axis":[1,0,0],"r":2.5,"len":26,"tone":"chrome","mount":"hornBar"},{"name":"discR","kind":"cyl","c":[-42.6,18,55.304059658850115],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"hornR","sides":32},{"name":"disc2R","kind":"cyl","c":[-48.4,18,55.304059658850115],"axis":[1,0,0],"r":22.5,"len":5.6,"tone":"plate","mount":"discR","sides":32},{"name":"hornBar","kind":"beam","a":[-32,18,55.304059658850115],"b":[32,18,55.304059658850115],"w":6,"h":6,"mount":"hornPostL"},{"name":"hornPostL","kind":"beam","a":[28,7,55.304059658850115],"b":[28,21,55.304059658850115],"w":6,"h":6,"mount":"carL"},{"name":"hornPostR","kind":"beam","a":[-28,7,55.304059658850115],"b":[-28,21,55.304059658850115],"w":6,"h":6,"mount":"carR"}]}],"contacts":[{"body":"buttocks","prop":"lp:seat"},{"body":"back","prop":"lp:back"},{"body":"soleL","prop":"sled:plate"},{"body":"soleR","prop":"sled:plate"},{"body":"gripL","prop":"lp:handleL"},{"body":"gripR","prop":"lp:handleR"}]},
"hyper":{"keys":[{"t":0,"v":[0,100,0,0.92388,0.38268,0,0,-1,0,0,0,0,0,-8,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,-0.02,3.3,5.7,6,3.99,0.1,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,-0.02,3.3,5.7,6,3.99,0.1,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.25,"v":[0,100,0,0.886,0.46369,0,0,1.05,0,0,1.17,0,0,-5.07,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,10.22,3.32,6,6,3.99,0.1,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,10.22,3.32,6,6,3.99,0.1,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,100,0,0.76604,0.64279,0,0,6,0,0,4,0,0,2,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,34.94,3.52,6.74,6,3.99,0.1,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,34.94,3.52,6.74,6,3.99,0.1,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,100,0,0.6105,0.79202,0,0,10.95,0,0,6.83,0,0,9.07,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,59.66,3.99,7.6,6,3.99,0.1,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,59.66,3.99,7.6,6,3.99,0.1,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,100,0,0.5373,0.84339,0,0,13,0,0,8,0,0,12,0,0,0,10,26.72,-11.51,-72.69,116.35,60,0,0,69.89,4.29,8.01,6,3.99,0.1,0,0,10,31.31,-4.35,-66.97,103.66,60,0,0,69.89,4.29,8.01,6,3.99,0.1,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"hyper45","id":"hy","H":[100,0],"ang":45,"beamV":36,"uEnd":-46,"plate":{"c":[33.82749597609402,-68.12582004125666],"n":[0.6810298851224554,0.7303852266791274],"size":[44,34]},"roll":{"u":-75.64362195621764,"v":-11.715510957769556,"r":5},"pad":{"u0":-7,"u1":-31,"v":8.114285714285712,"w":42}}],"contacts":[{"body":"soleL","prop":"hy:plate"},{"body":"soleR","prop":"hy:plate"},{"body":"thL","prop":"hy:pad"},{"body":"thR","prop":"hy:pad"},{"body":"skL","prop":"hy:rollL"},{"body":"skR","prop":"hy:rollR"}]},
"legcurl":{"keys":[{"t":0,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,6,6,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,6,6,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,17.27,5.62,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,17.27,5.62,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,46.77,4.62,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,46.77,4.62,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,83.23,3.38,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,83.23,3.38,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,112.73,2.38,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,112.73,2.38,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,74,0,0.60182,0.79864,0,0,2,0,0,0,0,0,-22,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,124,2,0,0,0,8,79.36,30.1,10.16,94.19,-20.96,0.02,-3.92,24,0,0,124,2,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"legCurl","id":"lc","hump":[64.45965360018236,-10.879739408652936],"knee":[60.64992511612176,-37.987366114642576],"head":[48.30156018869733,45.470228939490646],"nTh":[0.9902680687415704,-0.13917310096006544],"nT":[0.9612616959383189,0.27563735581699916],"pivot":[68.09906051929322,-41.987366114642576],"hubX":27,"handle":{"x":20,"y":20.242621442081884,"z":63.470228939490646,"ax":[1,0.5]}},{"type":"g4lever","id":"lcArm","pivot":[27,68.09906051929322,-41.987366114642576],"axis":[1,0,0],"mountTo":"lc:hub","bind":{"mix":["anL","anR"],"frame":"skL","off":[0,7,-8.2]},"parts":[{"name":"arm","kind":"beam","a":[-1,-4,0],"b":[-1,40.507332616436486,0],"w":4,"h":7,"up":[0,0,1]},{"name":"bar","kind":"beam","a":[-1,37.507332616436486,0],"b":[-11,37.507332616436486,0],"r":1.6,"mount":"arm","tone":"chrome"},{"name":"roller","kind":"cyl","c":[-27,37.507332616436486,0],"axis":[1,0,0],"r":5.5,"len":36,"mount":"bar","tone":"pad","role":"pad"}]}],"contacts":[{"body":"thL","prop":"lc:thighPad"},{"body":"thR","prop":"lc:thighPad"},{"body":"chest","prop":"lc:chestPad"},{"body":"skL","prop":"lcArm:roller"},{"body":"skR","prop":"lcArm:roller"},{"body":"gripL","prop":"lc:handleL"},{"body":"gripR","prop":"lc:handleR"}]},
"legext":{"keys":[{"t":0,"v":[0,59.26,-14.87,0.99452,-0.10453,0,0,3,0,0,2,0,0,-4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,85,4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,85,4,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,59.26,-14.87,0.99452,-0.10453,0,0,3,0,0,2,0,0,-4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,73.87,4.88,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,73.87,4.88,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,59.26,-14.87,0.99452,-0.10453,0,0,3,0,0,2,0,0,-4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,47,7,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,47,7,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,59.26,-14.87,0.99452,-0.10453,0,0,3,0,0,2,0,0,-4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,20.13,9.12,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,20.13,9.12,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,59.26,-14.87,0.99452,-0.10453,0,0,3,0,0,2,0,0,-4,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,9,10,0,0,-2,-4,-3.33,43.43,-70.75,65.08,-81.92,0.03,-21.54,78,0,0,9,10,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"legExtension","id":"lx","seatH":50,"seatZ":[-28,18.525385480162473],"back":{"z0":-25.5,"ang":12,"len":60},"pivot":[59.26492476865128,27.525385480162473],"hubX":27,"handle":{"x":23,"y":53,"z":-16.874614519837525}},{"type":"g4lever","id":"lxArm","pivot":[27,59.26492476865128,27.525385480162473],"axis":[1,0,0],"mountTo":"lx:hub","bind":{"mix":["anL","anR"],"frame":"skL","off":[0,9,7.4]},"parts":[{"name":"arm","kind":"beam","a":[-1,-4,0],"b":[-1,38.382481541011224,0],"w":4,"h":7,"up":[0,0,1]},{"name":"bar","kind":"beam","a":[-1,35.382481541011224,0],"b":[-11,35.382481541011224,0],"r":1.6,"mount":"arm","tone":"chrome"},{"name":"roller","kind":"cyl","c":[-27,35.382481541011224,0],"axis":[1,0,0],"r":5.5,"len":36,"mount":"bar","tone":"pad","role":"pad"}]}],"contacts":[{"body":"buttocks","prop":"lx:seat"},{"body":"back","prop":"lx:back"},{"body":"shinL","prop":"lxArm:roller"},{"body":"shinR","prop":"lxArm:roller"},{"body":"gripL","prop":"lx:handleL"},{"body":"gripR","prop":"lx:handleR"}]},
"crunch":{"keys":[{"t":0,"v":[0,11.88,-10,0,0,0.682,0.73135,4,0,0,0,0,0,9.33,0,0,4,0,72.47,121.88,59.61,124.79,-8.31,4.02,-17.11,52.82,10.38,6.33,118,-29.21,-8.52,0,4,0,72.47,121.88,59.61,124.79,-8.31,4.02,-17.11,52.82,10.38,6.33,118,-29.21,-8.52,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.25,"v":[0,11.85,-10,0,0,0.67731,0.7357,4.73,0,0,4.1,0,0,11.38,0,0,4.59,1.46,72.45,122.29,59.84,124.8,-10.24,3.92,-18.53,52.15,10.33,6.26,118,-29.26,-8.52,0,4.59,1.46,72.45,122.29,59.84,124.8,-10.24,3.92,-18.53,52.15,10.33,6.26,118,-29.26,-8.52,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,11.78,-10,0,0,0.66588,0.74606,6.5,0,0,14,0,0,16.33,0,0,6,5,72.24,123.23,60.49,124.96,-14.92,3.44,-21.92,50.49,10.23,6.09,118,-29.35,-8.52,0,6,5,72.24,123.23,60.49,124.96,-14.92,3.44,-21.92,50.49,10.23,6.09,118,-29.35,-8.52,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,11.73,-10,0,0,0.65429,0.75624,8.27,0,0,23.9,0,0,21.28,0,0,7.41,8.54,71.78,124.11,61.32,125.27,-19.62,2.65,-25.25,48.8,10.14,5.93,118,-29.41,-8.52,0,7.41,8.54,71.78,124.11,61.32,125.27,-19.62,2.65,-25.25,48.8,10.14,5.93,118,-29.41,-8.52,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,11.71,-10,0,0,0.64945,0.76041,9,0,0,28,0,0,23.33,0,0,8,10,71.52,124.46,61.71,125.44,-21.56,2.23,-26.6,48.1,10.1,5.86,118,-29.44,-8.52,0,8,10,71.52,124.46,61.71,125.44,-21.56,2.23,-26.6,48.1,10.1,5.86,118,-29.44,-8.52,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":70,"at":[0,0,5]}],"contacts":[{"body":"buttocks","prop":"mat"},{"body":"back","prop":"mat"},{"body":"soleL","prop":"mat"},{"body":"soleR","prop":"mat"},{"body":"upperBack","prop":"mat","when":[0,0.05]},{"body":"handL","prop":"mat","when":[0,0.05]},{"body":"handR","prop":"mat","when":[0,0.05]}]},
"bridge":{"keys":[{"t":0,"v":[0,12.12,-5.59,0,0,0.69859,0.71553,0,0,0,0,0,0,-9.16,0,0,0,0,-11.38,10.46,-74.18,10.6,16.55,-7.08,-7.75,52.52,10.11,6.8,112.58,-31.73,-8.52,0,0,0,-11.38,10.46,-74.18,10.6,16.55,-7.08,-7.75,52.52,10.11,6.8,112.58,-31.73,-8.52,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,14.63,-5.44,0,0,0.6717,0.74083,0,0,0,2.05,0,0,-3.33,0,0,0,0,-13.49,10.62,-74.39,10.86,16.57,-6.96,-7.88,45.08,9.85,6.31,112.03,-28.98,-8.51,0,0,0,-13.49,10.62,-74.39,10.86,16.57,-6.96,-7.88,45.08,9.85,6.31,112.03,-28.98,-8.51,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,20.54,-4.44,0,0,0.60308,0.79768,0,0,0,7,0,0,12.73,0,0,0,0,-18.53,11.08,-74.9,11.64,16.62,-6.58,-8.26,26.67,9.42,5.37,108.84,-23.81,-8.5,0,0,0,-18.53,11.08,-74.9,11.64,16.62,-6.58,-8.26,26.67,9.42,5.37,108.84,-23.81,-8.5,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,26.5,-2.52,0,0,0.52967,0.8482,0,0,0,11.95,0,0,27.91,0,0,0,0,-23.74,11.18,-75.41,11.58,16.62,-6.6,-8.24,7.77,9.2,4.71,103.07,-20.74,-8.49,0,0,0,-23.74,11.18,-75.41,11.58,16.62,-6.6,-8.24,7.77,9.2,4.71,103.07,-20.74,-8.49,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,28.87,-1.46,0,0,0.498,0.86718,0,0,0,14,0,0,34,0,0,0,0,-25.9,11.22,-75.63,11.54,16.62,-6.63,-8.22,0,9.14,4.51,100,-20.21,-8.49,0,0,0,-25.9,11.22,-75.63,11.54,16.62,-6.63,-8.22,0,9.14,4.51,100,-20.21,-8.49,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":70,"at":[0,0,5]}],"contacts":[{"body":"upperBack","prop":"mat"},{"body":"headBack","prop":"mat"},{"body":"soleL","prop":"mat"},{"body":"soleR","prop":"mat"},{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"buttocks","prop":"mat","when":[0,0.02]}]},
"glutebridge1":{"keys":[{"t":0,"v":[0,12.12,-5.59,0,0,0.69859,0.71553,0,0,0,0,0,0,-9.16,0,0,0,0,-11.38,10.46,-74.18,10.6,16.55,-7.08,-7.75,52.35,8.47,8.06,112.51,-31.77,-8.53,0,0,0,-11.38,10.46,-74.18,10.6,16.55,-7.08,-7.75,55.15,8.03,-6.73,5.53,-10,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,14.62,-5.44,0,0,0.67178,0.74075,0,0,0,2.05,0,0,-3.36,0,0,0,0,-13.48,10.61,-74.38,10.85,16.57,-6.96,-7.88,44.93,8.17,7.55,111.96,-29.03,-8.53,0,0,0,-13.48,10.61,-74.38,10.85,16.57,-6.96,-7.88,47.73,7.78,-6.18,5.53,-10,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,20.51,-4.44,0,0,0.60339,0.79745,0,0,0,7,0,0,12.6,0,0,0,0,-18.49,11.08,-74.89,11.63,16.62,-6.58,-8.26,26.59,7.64,6.57,108.78,-23.88,-8.52,0,0,0,-18.49,11.08,-74.89,11.63,16.62,-6.58,-8.26,29.39,7.35,-5.2,5.53,-10,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,26.44,-2.54,0,0,0.53023,0.84785,0,0,0,11.95,0,0,27.69,0,0,0,0,-23.67,11.18,-75.41,11.58,16.62,-6.61,-8.24,7.75,7.33,5.87,103.05,-20.81,-8.52,0,0,0,-23.67,11.18,-75.41,11.58,16.62,-6.61,-8.24,10.55,7.1,-4.55,5.53,-10,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,28.8,-1.49,0,0,0.49867,0.86679,0,0,0,14,0,0,33.77,0,0,0,0,-25.81,11.22,-75.62,11.55,16.62,-6.62,-8.22,0,7.24,5.64,100,-20.28,-8.52,0,0,0,-25.81,11.22,-75.62,11.55,16.62,-6.62,-8.22,2.8,7.03,-4.37,5.53,-10,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":70,"at":[0,0,5]}],"contacts":[{"body":"upperBack","prop":"mat"},{"body":"headBack","prop":"mat"},{"body":"soleL","prop":"mat"},{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"buttocks","prop":"mat","when":[0,0.02]}]},
"lyinglegraise":{"keys":[{"t":0,"v":[0,11.98,-0.56,0,0,0.67523,0.73761,5,0,0,0,0,0,-12.75,0,0,0,0,-10.31,8.99,-74.05,11.95,16.88,-6.9,-10.52,0.52,1.14,-0.06,6.77,-15,0,0,0,0,-10.31,8.99,-74.05,11.95,16.88,-6.9,-10.52,0.52,1.14,-0.06,6.77,-15,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,12.32,-0.52,0,0,0.66133,0.75009,7.2,0,0,0,0,0,-12.9,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,11.25,1.15,0.04,6.77,-15,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,11.25,1.15,0.04,6.77,-15,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,13.23,-0.36,0,0,0.62592,0.77988,12.5,0,0,0,0,0,-12.9,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,37,1.23,0.31,6.77,-15,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,37,1.23,0.31,6.77,-15,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,14.12,-0.12,0,0,0.58917,0.80801,17.8,0,0,0,0,0,-12.9,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,62.75,1.41,0.63,6.77,-15,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,62.75,1.41,0.63,6.77,-15,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,14.48,0,0,0,0.57358,0.81915,20,0,0,0,0,0,-12.9,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,73.42,1.53,0.78,6.77,-15,0,0,0,0,-10.26,8.99,-74.04,11.94,16.88,-6.91,-10.52,73.42,1.53,0.78,6.77,-15,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":70,"at":[0,0,-4]}],"contacts":[{"body":"back","prop":"mat"},{"body":"upperBack","prop":"mat"},{"body":"headBack","prop":"mat"},{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"buttocks","prop":"mat","when":[0,0.3]}]},
"hollow":{"keys":[{"t":0,"v":[0,11.99,-5,0,0,0.62932,0.77715,12,0,0,22,0,0,12,0,0,10,10,64.36,160.18,-43.62,6,10,0,0,5.43,1.15,-0.01,6.77,-30,0,0,10,10,64.36,160.18,-43.62,6,10,0,0,5.43,1.15,-0.01,6.77,-30,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,11.99,-5,0,0,0.62932,0.77715,12,0,0,24,0,0,12,0,0,10,10,64.36,160.18,-43.62,6,10,0,0,3.93,1.14,-0.03,6.77,-30,0,0,10,10,64.36,160.18,-43.62,6,10,0,0,3.93,1.14,-0.03,6.77,-30,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":70,"at":[0,0,0]}],"contacts":[{"body":"back","prop":"mat"}]},
"deadbug":{"keys":[{"t":0,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.125,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,39.98,2.49,0.63,46,-5,0,0,6,6,126.63,9.51,7.06,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,0.82,2.31,1.59,3.62,-10,0,0,6,6,160.96,43.09,29.76,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.375,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,39.98,2.49,0.63,46,-5,0,0,6,6,126.63,9.51,7.06,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,126.63,9.51,7.06,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,39.98,2.49,0.63,46,-5,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,160.96,43.09,29.76,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,0.82,2.31,1.59,3.62,-10,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.875,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,126.63,9.51,7.06,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,39.98,2.49,0.63,46,-5,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,12.8,-5,0,0,0.64279,0.76604,10,0,0,0,0,0,-12.9,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0,6,6,86.91,5.21,3.43,6,0,0,0,79.94,3.25,-0.37,90,0,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":70,"at":[0,0,5]}],"contacts":[{"body":"back","prop":"mat"},{"body":"upperBack","prop":"mat"},{"body":"headBack","prop":"mat"}],"loop":true},
"bicycle":{"keys":[{"t":0,"v":[0,12.23,-5,0,0,0.64279,0.76604,10,0,6.4,27,0,32,12,0,0,6,-4,76.16,116.45,53.21,126.44,-8.09,3.37,-17.42,99.64,-8.09,4.25,112,-20,0,0,6,12,59.53,133.69,75.72,123.66,-16.09,4.27,-22.43,21.97,3.52,1.46,6,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.125,"v":[0,11.83,-5,0,0,0.64279,0.76604,10,0,4.53,27,0,22.63,12,0,0,6,-1.66,74.99,118.7,55.64,126.12,-9.16,3.52,-18.37,92.65,-5.52,1.82,96.48,-20,0,0,6,9.66,63.31,131.05,71.57,124.15,-14.84,4.15,-21.92,29.16,2.36,0.82,21.52,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.25,"v":[0,11.68,-5,0,0,0.64279,0.76604,10,0,0,27,0,0,12,0,0,6,4,70.47,124.66,62.72,125.21,-11.9,3.85,-20.36,67,-0.73,-0.02,59,-20,0,0,6,4,70.47,124.66,62.72,125.21,-11.9,3.85,-20.36,55,-0.67,-0.09,59,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.375,"v":[0,11.83,-5,0,0,0.64279,0.76604,10,0,-4.53,27,0,-22.63,12,0,0,6,9.66,63.31,131.05,71.57,124.15,-14.84,4.15,-21.92,37.64,2.43,0.67,21.52,-20,0,0,6,-1.66,74.99,118.7,55.64,126.12,-9.16,3.52,-18.37,84.19,-5.03,0.87,96.48,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,12.23,-5,0,0,0.64279,0.76604,10,0,-6.4,27,0,-32,12,0,0,6,12,59.53,133.69,75.72,123.66,-16.09,4.27,-22.43,21.97,3.52,1.46,6,-20,0,0,6,-4,76.16,116.45,53.21,126.44,-8.09,3.37,-17.42,99.64,-8.09,4.25,112,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.625,"v":[0,11.83,-5,0,0,0.64279,0.76604,10,0,-4.53,27,0,-22.63,12,0,0,6,9.66,63.31,131.05,71.57,124.15,-14.84,4.15,-21.92,29.16,2.36,0.82,21.52,-20,0,0,6,-1.66,74.99,118.7,55.64,126.12,-9.16,3.52,-18.37,92.65,-5.52,1.82,96.48,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,11.68,-5,0,0,0.64279,0.76604,10,0,0,27,0,0,12,0,0,6,4,70.47,124.66,62.72,125.21,-11.9,3.85,-20.36,55,-0.67,-0.09,59,-20,0,0,6,4,70.47,124.66,62.72,125.21,-11.9,3.85,-20.36,67,-0.73,-0.02,59,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.875,"v":[0,11.83,-5,0,0,0.64279,0.76604,10,0,4.53,27,0,22.63,12,0,0,6,-1.66,74.99,118.7,55.64,126.12,-9.16,3.52,-18.37,84.19,-5.03,0.87,96.48,-20,0,0,6,9.66,63.31,131.05,71.57,124.15,-14.84,4.15,-21.92,37.64,2.43,0.67,21.52,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,12.23,-5,0,0,0.64279,0.76604,10,0,6.4,27,0,32,12,0,0,6,-4,76.16,116.45,53.21,126.44,-8.09,3.37,-17.42,99.64,-8.09,4.25,112,-20,0,0,6,12,59.53,133.69,75.72,123.66,-16.09,4.27,-22.43,21.97,3.52,1.46,6,-20,0,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":70,"at":[0,0,0]}],"contacts":[{"body":"back","prop":"mat"}],"loop":true},
"superman":{"keys":[{"t":0,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,8,4,127.25,106.93,34.94,6,45,0,0,6,1.33,-0.07,9.57,-45,0,0,8,4,127.25,106.93,34.94,6,45,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,10.94,0,0.70711,0.70711,0,0,-2.05,0,0,-1.17,0,0,2.59,0,0,8.29,2.54,131.49,100.14,29.33,6,45,0,0,3.36,1.33,-0.04,6.49,-45,0,0,8.29,2.54,131.49,100.14,29.33,6,45,0,0,3.36,1.33,-0.04,6.49,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,10.16,0,0.70711,0.70711,0,0,-7,0,0,-4,0,0,4,0,0,9,-1,138.31,86.25,18.32,6,45,0,0,-3,1.33,0.03,3.98,-45,0,0,9,-1,138.31,86.25,18.32,6,45,0,0,-3,1.33,0.03,3.98,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,10.11,0,0.70711,0.70711,0,0,-11.95,0,0,-6.83,0,0,5.41,0,0,9.71,-4.54,142.09,74.96,9.67,6,45,0,0,-9.36,1.34,0.11,3.9,-45,0,0,9.71,-4.54,142.09,74.96,9.67,6,45,0,0,-9.36,1.34,0.11,3.9,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,10.11,0,0.70711,0.70711,0,0,-14,0,0,-8,0,0,6,0,0,10,-6,143.08,70.84,6.53,6,45,0,0,-12,1.34,0.14,3.86,-45,0,0,10,-6,143.08,70.84,6.53,6,45,0,0,-12,1.34,0.14,3.86,-45,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":225,"width":75,"at":[0,0,12]}],"contacts":[{"body":"belly","prop":"mat"},{"body":"front","prop":"mat","when":[0,0.02]},{"body":"headAll","prop":"mat","when":[0,0.02]},{"body":"palmL","prop":"mat","when":[0,0.02]},{"body":"palmR","prop":"mat","when":[0,0.02]},{"body":"thL","prop":"mat","when":[0,0.02]},{"body":"thR","prop":"mat","when":[0,0.02]}]},
"ytw":{"keys":[{"t":0,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-4,-15,-42.09,129.33,31.2,4.92,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-4,-15,-42.09,129.33,31.2,4.92,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.125,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-2,-9.5,-16.32,129.6,11.86,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-2,-9.5,-16.32,129.6,11.86,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.25,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,0,-4,3.47,114.88,-2.46,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0,0,-4,3.47,114.88,-2.46,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.375,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-2,-9.5,-9.5,98.53,6.37,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-2,-9.5,-9.5,98.53,6.37,4.99,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.5,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-4,-15,-19.88,90.22,12.95,4.92,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-4,-15,-19.88,90.22,12.95,4.92,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.625,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-2,-9.5,-4.46,84.76,81.55,15.11,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-2,-9.5,-4.46,84.76,81.55,15.11,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.75,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,0,-4,5.3,72.35,92.08,38.68,0,0,0,6,1.33,-0.07,9.57,-45,0,0,0,-4,5.3,72.35,92.08,38.68,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.875,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-2,-9.5,-3.63,60.06,90.16,62.23,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-2,-9.5,-3.63,60.06,90.16,62.23,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}},{"t":1,"v":[0,12.4,0,0.70711,0.70711,0,0,0,0,0,0,0,0,3.03,0,0,-4,-15,-11.7,54.36,91.99,72.28,0,0,0,6,1.33,-0.07,9.57,-45,0,0,-4,-15,-11.7,54.36,91.99,72.28,0,0,0,6,1.33,-0.07,9.57,-45,0,0],"hands":{"L":"fist","R":"fist"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":90,"at":[0,0,15]}],"contacts":[{"body":"front","prop":"mat"},{"body":"headAll","prop":"mat"},{"body":"thL","prop":"mat"},{"body":"thR","prop":"mat"}]},
"reversesnow":{"keys":[{"t":0,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,-4.33,6.59,43.95,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0,-6,-10,-4.33,6.59,43.95,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.125,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,-3.45,26.49,41.16,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0,-6,-10,-3.45,26.49,41.16,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,-1.43,46.33,38.14,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0,-6,-10,-1.43,46.33,38.14,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.375,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,2.01,66.01,34.64,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0,-6,-10,2.01,66.01,34.64,4,-44.98,-1.45,-1.45,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,7.89,84.96,44.91,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0,-6,-10,7.89,84.96,44.91,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,16.47,103.57,38.73,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0,-6,-10,16.47,103.57,38.73,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,30.84,120.27,29.01,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0,-6,-10,30.84,120.27,29.01,4,-29.98,-1.02,-1.77,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.875,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,59.45,129.42,24.36,4,-14.99,-0.53,-1.98,6,1.33,-0.07,11.54,-45,0,0,-6,-10,59.45,129.42,24.36,4,-14.99,-0.53,-1.98,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,10.23,0,0.70711,0.70711,0,0,-4,0,0,-6,0,0,4,0,0,-6,-10,121.36,101.23,-10.94,4,0,0,-2.05,6,1.33,-0.07,11.54,-45,0,0,-6,-10,121.36,101.23,-10.94,4,0,0,-2.05,6,1.33,-0.07,11.54,-45,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":110,"at":[0,0,15]}],"contacts":[{"body":"belly","prop":"mat"},{"body":"thL","prop":"mat"},{"body":"thR","prop":"mat"}]},
"birddog":{"keys":[{"t":0,"v":[0,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.041666666666666664,"v":[0.2,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,72.5,0,0,100,-43.92,0,0,-4,6,65.66,16,-17.2,50.27,78.62,-54.2,-26.36,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.08333333333333333,"v":[0.75,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,58.87,0,0,100,-38.25,0,0,-4,6,60.51,26.12,-10.02,85.55,66.1,-30.65,-24.5,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.125,"v":[1.5,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,40.25,0,0,72.29,-30.5,0,0,-4,6,80.55,36.08,0.78,97.82,32.26,-13.16,-25.68,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.16666666666666666,"v":[2.25,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,21.62,0,0,37.64,-22.75,0,0,-4,6,114.77,39.33,8.97,80.21,0.9,-8.81,-27.92,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.20833333333333334,"v":[2.8,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,7.99,0,0,12.28,-17.08,0,0,-4,6,147.02,38.86,10.22,43.63,-13.04,-6.12,-18.59,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[3,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,3.32,0,0,3.62,-15,0,0,-4,6,173.09,23.07,-1.75,5,-16.9,-0.74,-2.45,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.2916666666666667,"v":[2.8,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,7.99,0,0,12.28,-17.08,0,0,-4,6,147.02,38.86,10.22,43.63,-13.04,-6.12,-18.59,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.3333333333333333,"v":[2.25,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,21.62,0,0,37.64,-22.75,0,0,-4,6,114.77,39.33,8.97,80.21,0.9,-8.81,-27.92,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.375,"v":[1.5,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,40.25,0,0,72.29,-30.5,0,0,-4,6,80.55,36.08,0.78,97.82,32.26,-13.16,-25.68,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.4166666666666667,"v":[0.75,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,58.87,0,0,100,-38.25,0,0,-4,6,60.51,26.12,-10.02,85.55,66.1,-30.65,-24.5,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.4583333333333333,"v":[0.2,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,72.5,0,0,100,-43.92,0,0,-4,6,65.66,16,-17.2,50.27,78.62,-54.2,-26.36,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5416666666666666,"v":[-0.2,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,65.66,16,-17.2,50.27,78.62,-54.2,-26.36,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,72.5,0,0,100,-43.92,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5833333333333334,"v":[-0.75,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,60.51,26.12,-10.02,85.55,66.1,-30.65,-24.5,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,58.87,0,0,100,-38.25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[-1.5,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,80.55,36.08,0.78,97.82,32.26,-13.16,-25.68,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,40.25,0,0,72.29,-30.5,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.6666666666666666,"v":[-2.25,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,114.77,39.33,8.97,80.21,0.9,-8.81,-27.92,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,21.62,0,0,37.64,-22.75,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.7083333333333334,"v":[-2.8,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,147.02,38.86,10.22,43.63,-13.04,-6.12,-18.59,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,7.99,0,0,12.28,-17.08,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[-3,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,173.09,23.07,-1.75,5,-16.9,-0.74,-2.45,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,3.32,0,0,3.62,-15,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.7916666666666666,"v":[-2.8,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,147.02,38.86,10.22,43.63,-13.04,-6.12,-18.59,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,7.99,0,0,12.28,-17.08,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.8333333333333334,"v":[-2.25,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,114.77,39.33,8.97,80.21,0.9,-8.81,-27.92,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,21.62,0,0,37.64,-22.75,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.875,"v":[-1.5,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,80.55,36.08,0.78,97.82,32.26,-13.16,-25.68,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,40.25,0,0,72.29,-30.5,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.9166666666666666,"v":[-0.75,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,60.51,26.12,-10.02,85.55,66.1,-30.65,-24.5,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,58.87,0,0,100,-38.25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.9583333333333334,"v":[-0.2,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,65.66,16,-17.2,50.27,78.62,-54.2,-26.36,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,72.5,0,0,100,-43.92,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,48.9,-10,0.77992,0.62588,0,0,0,0,0,0,0,0,0,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0,-4,6,82.54,5.78,-23.86,12,67.94,-74.05,-13.74,77.47,2.25,1.17,94.7,-46,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":75,"at":[0,0,5]}],"contacts":[{"body":"palmL","prop":"mat","when":[0,0.51]},{"body":"palmL","prop":"mat","when":[0.99,1]},{"body":"palmR","prop":"mat","when":[0,0.01]},{"body":"palmR","prop":"mat","when":[0.49,1]},{"body":"kneeR","prop":"mat","when":[0,0.51]},{"body":"kneeR","prop":"mat","when":[0.99,1]},{"body":"kneeL","prop":"mat","when":[0,0.01]},{"body":"kneeL","prop":"mat","when":[0.49,1]},{"body":"footR","prop":"mat","when":[0,0.51]},{"body":"footL","prop":"mat","when":[0.49,1]}],"loop":true},
"rollout":{"keys":[{"t":0,"v":[0,48.9,-30,0.91784,0.39696,0,0,10,0,0,8,0,0,0,0,0,0,8,73.45,-3.63,-47.43,17.72,46.6,0,-15.16,46.76,1.82,0.57,94.7,-46,0,0,0,8,73.45,-3.63,-47.43,17.72,46.6,0,-15.16,46.76,1.82,0.57,94.7,-46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,48.24,-22.56,0.90182,0.4321,0,0,8.97,0,0,7.12,0,0,0,0,0,2.05,7.41,83.71,-4.11,-47.91,17.6,46.6,0,-15.16,41.08,1.77,0.76,84.59,-46,0,0,2.05,7.41,83.71,-4.11,-47.91,17.6,46.6,0,-15.16,41.08,1.77,0.76,84.59,-46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,41.44,-5.98,0.85767,0.5142,0,0,6.5,0,0,5,0,0,0,0,0,7,6,109.6,-7.14,-44.06,17.6,53.13,0.01,-14.39,27.37,1.68,1.32,60.21,-46,0,0,7,6,109.6,-7.14,-44.06,17.6,53.13,0.01,-14.39,27.37,1.68,1.32,60.21,-46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,28.4,6.3,0.80606,0.59183,0,0,4.03,0,0,2.88,0,0,0,0,0,11.95,4.59,141.05,-6.58,-68.62,16.12,27.28,0,-16.09,13.64,1.64,2.43,35.86,-46,0,0,11.95,4.59,141.05,-6.58,-68.62,16.12,27.28,0,-16.09,13.64,1.64,2.43,35.86,-46,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,21.69,9.58,0.78261,0.62251,0,0,3,0,0,2,0,0,0,0,0,14,4,152.27,-9.52,-69.21,16.16,28.73,0,-15.92,7.95,1.62,3.45,25.81,-46,0,0,14,4,152.27,-9.52,-69.21,16.16,28.73,0,-15.92,7.95,1.62,3.45,25.81,-46,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"mat","id":"mat","len":220,"width":75,"at":[0,0,20]},{"type":"abWheel","id":"wheel","r":9}],"contacts":[{"body":"kneeL","prop":"mat"},{"body":"kneeR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"},{"body":"gripL","prop":"wheel"},{"body":"gripR","prop":"wheel"}],"gripRadius":{"L":1.6,"R":1.6}},
"plankup":{"keys":[{"t":0,"v":[0,30.05,14.48,0.75544,0.65522,0,0,0,0,0,0,0,0,0,0,0,-2,8,82.59,-0.94,-14.53,89.4,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,69.87,-2,8,82.59,-0.94,-14.53,89.4,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,69.87],"hands":{"L":"fist","R":"fist"}},{"t":0.0625,"v":[3.78,29.66,14.52,0.75376,0.65679,0.01645,-0.01433,0,0,0,0,0,0,0,0,0,-2,8,81.57,-19.44,-26.68,84.91,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,70.13,-2,8,79.29,17.06,-1.71,93.96,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,70.13],"hands":{"L":"fist","R":"fist"}},{"t":0.125,"v":[3.74,32.53,13.58,0.76462,0.64411,0.01668,-0.01405,0,0,-3.08,0,0,-10.92,0,0,0,-2,8,82.55,4.3,-10.61,85.13,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,68.22,-4,5,57.22,16.14,-7.85,109.34,35,-25,0,2.16,2.39,6.8,4.28,13.79,3.49,68.22],"hands":{"L":"fist","R":"relaxed"}},{"t":0.1875,"v":[3.67,36.39,12.15,0.77905,0.62658,0.017,-0.01367,0,0,-7.49,0,0,-26.55,0,0,0,-2,8,69.64,40.94,14.92,86,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.62,-6.5,3.2,71.25,-17.77,-44.04,25.75,39.28,-70.24,7.8,2.16,2.39,6.8,4.28,13.79,3.49,65.62],"hands":{"L":"fist","R":"flat"}},{"t":0.25,"v":[0,36.68,12.12,0.78029,0.62542,0,0,0,0,-7.92,0,0,-28.09,0,0,0,-2,8,55.28,57.35,29.27,89.87,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.43,-6.5,3.2,69.61,-27.75,-53.46,25.13,55.42,-70.87,-8.09,2.16,2.39,6.8,4.28,13.79,3.49,65.43],"hands":{"L":"fist","R":"flat"}},{"t":0.3125,"v":[-3.68,36.29,12.19,0.77865,0.62708,-0.01699,0.01368,0,0,-8.81,0,0,-31.25,0,0,0,-2,8,33.01,71.13,47.54,93.84,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.69,-6.5,3.2,65.55,-39.56,-64.7,24.22,69.64,-70.31,-22.16,2.16,2.39,6.8,4.28,13.79,3.49,65.69],"hands":{"L":"fist","R":"flat"}},{"t":0.375,"v":[-3.59,40.87,10.24,0.7956,0.60542,-0.01736,0.01321,0,0,-3.08,0,0,-10.92,0,0,0,-4,5,44.27,40.29,17,96.75,35,-25,0,2.16,2.39,6.8,4.28,13.79,3.49,62.54,-6.5,3.2,71.19,-14.06,-29.31,25.83,84.96,-66.8,-22.25,2.16,2.39,6.8,4.28,13.79,3.49,62.54],"hands":{"L":"relaxed","R":"flat"}},{"t":0.4375,"v":[-3.54,43.34,9.06,0.80466,0.59333,-0.01756,0.01295,0,0,-0.23,0,0,-0.82,0,0,0,-6.5,3.2,67.29,26.45,-24.85,26.28,41.18,-71.65,-8.99,2.16,2.39,6.8,4.28,13.79,3.49,60.81,-6.5,3.2,71.15,1.86,-16.68,26.19,85.54,-66.03,-22.85,2.16,2.39,6.8,4.28,13.79,3.49,60.81],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,43.52,9.04,0.80553,0.59256,0,0,0,0,0,0,0,0,0,0,0,-6.5,3.2,69.96,14.42,-20.55,26.29,64.92,-68.58,-17.58,2.16,2.39,6.8,4.28,13.79,3.49,60.68,-6.5,3.2,69.96,14.42,-20.55,26.29,64.92,-68.58,-17.58,2.16,2.39,6.8,4.28,13.79,3.49,60.68],"hands":{"L":"flat","R":"flat"}},{"t":0.5625,"v":[3.54,43.34,9.06,0.80466,0.59333,0.01756,-0.01295,0,0,0.23,0,0,0.82,0,0,0,-6.5,3.2,71.15,1.86,-16.68,26.19,85.54,-66.03,-22.85,2.16,2.39,6.8,4.28,13.79,3.49,60.81,-6.5,3.2,67.29,26.45,-24.85,26.28,41.18,-71.65,-8.99,2.16,2.39,6.8,4.28,13.79,3.49,60.81],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[3.59,40.87,10.24,0.7956,0.60542,0.01736,-0.01321,0,0,3.08,0,0,10.92,0,0,0,-6.5,3.2,71.19,-14.06,-29.31,25.83,84.96,-66.8,-22.25,2.16,2.39,6.8,4.28,13.79,3.49,62.54,-4,5,44.27,40.29,17,96.75,35,-25,0,2.16,2.39,6.8,4.28,13.79,3.49,62.54],"hands":{"L":"flat","R":"relaxed"}},{"t":0.6875,"v":[3.68,36.29,12.19,0.77865,0.62708,0.01699,-0.01368,0,0,8.81,0,0,31.25,0,0,0,-6.5,3.2,65.55,-39.56,-64.7,24.22,69.64,-70.31,-22.16,2.16,2.39,6.8,4.28,13.79,3.49,65.69,-2,8,33.01,71.14,47.54,93.84,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.69],"hands":{"L":"flat","R":"fist"}},{"t":0.75,"v":[0,36.68,12.12,0.78029,0.62542,0,0,0,0,7.92,0,0,28.09,0,0,0,-6.5,3.2,69.61,-27.75,-53.46,25.13,55.42,-70.87,-8.09,2.16,2.39,6.8,4.28,13.79,3.49,65.43,-2,8,55.28,57.35,29.27,89.87,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.43],"hands":{"L":"flat","R":"fist"}},{"t":0.8125,"v":[-3.67,36.39,12.15,0.77905,0.62658,-0.017,0.01367,0,0,7.49,0,0,26.55,0,0,0,-6.5,3.2,71.25,-17.77,-44.04,25.75,39.28,-70.24,7.8,2.16,2.39,6.8,4.28,13.79,3.49,65.62,-2,8,69.64,40.94,14.92,86,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,65.62],"hands":{"L":"flat","R":"fist"}},{"t":0.875,"v":[-3.74,32.53,13.58,0.76462,0.64411,-0.01668,0.01405,0,0,3.08,0,0,10.92,0,0,0,-4,5,57.22,16.14,-7.85,109.34,35,-25,0,2.16,2.39,6.8,4.28,13.79,3.49,68.22,-2,8,82.55,4.3,-10.61,85.13,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,68.22],"hands":{"L":"relaxed","R":"fist"}},{"t":0.9375,"v":[-3.78,29.66,14.52,0.75376,0.65679,-0.01645,0.01433,0,0,0,0,0,0,0,0,0,-2,8,79.29,17.06,-1.71,93.96,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,70.13,-2,8,81.57,-19.44,-26.68,84.91,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,70.13],"hands":{"L":"fist","R":"fist"}},{"t":1,"v":[0,30.05,14.48,0.75544,0.65522,0,0,0,0,0,0,0,0,0,0,0,-2,8,82.59,-0.94,-14.53,89.4,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,69.87,-2,8,82.59,-0.94,-14.53,89.4,15,0,0,2.16,2.39,6.8,4.28,13.79,3.49,69.87],"hands":{"L":"fist","R":"fist"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":75,"at":[0,0,8]}],"contacts":[{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"},{"body":"faL","prop":"mat","when":[0,0.32]},{"body":"faL","prop":"mat","when":[0.99,1]},{"body":"palmL","prop":"mat","when":[0.43,0.82]},{"body":"faR","prop":"mat","when":[0,0.07]},{"body":"faR","prop":"mat","when":[0.68,1]},{"body":"palmR","prop":"mat","when":[0.18,0.57]}],"loop":true},
"plank":{"keys":[{"t":0,"v":[0,29.53,14.7,0.75343,0.65753,0,0,0,0,0,0,0,0,0,0,0,-2,8,82.05,0.06,-13.96,90.44,15,0,0,2.16,-0.27,6.85,4.28,14.09,0.9,70.22,-2,8,82.05,0.06,-13.96,90.44,15,0,0,2.16,-0.27,6.85,4.28,14.09,0.9,70.22],"hands":{"L":"fist","R":"fist"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":75,"at":[0,0,8]}],"contacts":[{"body":"faL","prop":"mat"},{"body":"faR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"}]},
"sideplank":{"keys":[{"t":0,"v":[0,38.69,0,0.57093,0.41718,0.57093,0.41718,0,0,0,0,0,0,0,0,0,8,0,-7.47,89.69,4.76,9.75,0,0,0,1.84,-2.37,0.04,3.62,0,0,0,-6,2,-0.11,72.27,25.06,86.82,10,0,0,1.84,-2.37,0.04,3.62,0,0,0],"hands":{"L":"relaxed","R":"fist"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":80,"at":[10,0,0]}],"contacts":[{"body":"faR","prop":"mat"},{"body":"footR","prop":"mat"}]},
"pushup":{"keys":[{"t":0,"v":[0,44.01,8.86,0.80722,0.59024,0,0,0,0,0,0,0,0,0,0,0,-6.5,3.2,72.93,16.07,-7,12,40.68,-74.01,18.87,2.16,-0.27,6.85,4.28,14.09,0.9,60.35,-6.5,3.2,72.93,16.07,-7,12,40.68,-74.01,18.87,2.16,-0.27,6.85,4.28,14.09,0.9,60.35],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,40.25,10.66,0.79348,0.6086,0,0,0,0,0,0,0,0,0,0,0,-4.19,0.83,53.37,21.27,-2.86,50.92,64.45,-60.07,-9.02,2.16,-0.27,6.85,4.28,14.09,0.9,62.98,-4.19,0.83,53.37,21.27,-2.86,50.92,64.45,-60.07,-9.02,2.16,-0.27,6.85,4.28,14.09,0.9,62.98],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,30.89,14.27,0.75858,0.65158,0,0,0,0,0,0,0,0,0,0,0,1.4,-4.9,29.11,28.07,3.29,93.9,69.8,-47.96,-21.79,2.16,-0.27,6.85,4.28,14.09,0.9,69.32,1.4,-4.9,29.11,28.07,3.29,93.9,69.8,-47.96,-21.79,2.16,-0.27,6.85,4.28,14.09,0.9,69.32],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,21.19,16.82,0.72136,0.69256,0,0,0,0,0,0,0,0,0,0,0,6.99,-10.63,5.17,31.67,12.39,123.49,67.75,-47.18,-26.63,2.16,-0.27,6.85,4.28,14.09,0.9,75.67,6.99,-10.63,5.17,31.67,12.39,123.49,67.75,-47.18,-26.63,2.16,-0.27,6.85,4.28,14.09,0.9,75.67],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,17.1,17.56,0.70528,0.70892,0,0,0,0,0,0,0,0,0,0,0,9.3,-13,-7.12,30.94,18.21,133.25,63.89,-51.09,-25.57,2.16,-0.27,6.85,4.28,14.09,0.9,78.29,9.3,-13,-7.12,30.94,18.21,133.25,63.89,-51.09,-25.57,2.16,-0.27,6.85,4.28,14.09,0.9,78.29],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":75,"at":[0,0,8]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"}]},
"diamond":{"keys":[{"t":0,"v":[0,45.27,8.21,0.81182,0.58391,0,0,0,0,0,0,0,0,0,0,0,-8.2,6.3,75.33,6.34,-42.65,10.8,58.75,-78.03,19.57,2.16,-0.27,6.85,4.28,14.09,0.9,59.45,-8.2,6.3,75.33,6.34,-42.65,10.8,58.75,-78.03,19.57,2.16,-0.27,6.85,4.28,14.09,0.9,59.45],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,41.5,10.08,0.79804,0.6026,0,0,0,0,0,0,0,0,0,0,0,-7,3.18,58.83,20.86,-29.17,50.43,80.81,-60.32,0.8,2.16,-0.27,6.85,4.28,14.09,0.9,62.11,-7,3.18,58.83,20.86,-29.17,50.43,80.81,-60.32,0.8,2.16,-0.27,6.85,4.28,14.09,0.9,62.11],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,32.07,13.88,0.76303,0.64637,0,0,0,0,0,0,0,0,0,0,0,-4.1,-4.35,36.25,24.62,-13.37,93.81,88.15,-43.03,5.32,2.16,-0.27,6.85,4.28,14.09,0.9,68.54,-4.1,-4.35,36.25,24.62,-13.37,93.81,88.15,-43.03,5.32,2.16,-0.27,6.85,4.28,14.09,0.9,68.54],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,22.28,16.59,0.72561,0.6881,0,0,0,0,0,0,0,0,0,0,0,-1.2,-11.88,16.68,19.07,-3.15,125.04,89.1,-35.73,15.84,2.16,-0.27,6.85,4.28,14.09,0.9,74.96,-1.2,-11.88,16.68,19.07,-3.15,125.04,89.1,-35.73,15.84,2.16,-0.27,6.85,4.28,14.09,0.9,74.96],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,18.15,17.39,0.70944,0.70476,0,0,0,0,0,0,0,0,0,0,0,0,-15,7.57,16.5,0.52,136.33,87.9,-35.82,19.86,2.16,-0.27,6.85,4.28,14.09,0.9,77.62,0,-15,7.57,16.5,0.52,136.33,87.9,-35.82,19.86,2.16,-0.27,6.85,4.28,14.09,0.9,77.62],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":75,"at":[0,0,8]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"}]},
"kneepush":{"keys":[{"t":0,"v":[0,14.19,19.68,0.76857,0.63977,0,0,0,0,0,0,0,0,0,0,0,10,-3.7,-7.69,30.22,4.18,128.89,78.64,-48.84,-26.01,0,1.78,0,95,-25,0,0,10,-3.7,-7.69,30.22,4.18,128.89,78.64,-48.84,-26.01,0,1.78,0,95,-25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,16.97,19.07,0.78961,0.61361,0,0,0,0,0,0,0,0,0,0,0,8.42,-1.71,1.65,28.12,1.34,118.65,77.81,-46.38,-22.77,0,1.78,0,95,-25,0,0,8.42,-1.71,1.65,28.12,1.34,118.65,77.81,-46.38,-22.77,0,1.78,0,95,-25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,23.46,16.84,0.8367,0.54766,0,0,0,0,0,0,0,0,0,0,0,4.6,3.1,20.02,22.44,-3.76,89.41,75.83,-48.36,-15.4,0,1.78,0,95,-25,0,0,4.6,3.1,20.02,22.44,-3.76,89.41,75.83,-48.36,-15.4,0,1.78,0,95,-25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,29.51,13.6,0.87829,0.47812,0,0,0,0,0,0,0,0,0,0,0,0.78,7.91,40.01,16.13,-8.62,47.89,70.03,-60.14,-5.2,0,1.78,0,95,-25,0,0,0.78,7.91,40.01,16.13,-8.62,47.89,70.03,-60.14,-5.2,0,1.78,0,95,-25,0,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,31.84,11.97,0.89385,0.44837,0,0,0,0,0,0,0,0,0,0,0,-0.8,9.9,58.32,10.44,-12.76,8.6,48.14,-74.96,19.15,0,1.78,0,95,-25,0,0,-0.8,9.9,58.32,10.44,-12.76,8.6,48.14,-74.96,19.15,0,1.78,0,95,-25,0,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":180,"width":75,"at":[0,0,18]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"kneeL","prop":"mat"},{"body":"kneeR","prop":"mat"}]},
"widepush":{"keys":[{"t":0,"v":[0,17.59,17.48,0.70723,0.70699,0,0,0,0,0,0,0,0,0,0,0,3.8,-15,-1.01,49.04,36.98,118.53,31.83,-45.45,-25.76,2.16,-0.27,6.85,4.28,14.09,0.9,77.98,3.8,-15,-1.01,49.04,36.98,118.53,31.83,-45.45,-25.76,2.16,-0.27,6.85,4.28,14.09,0.9,77.98],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,21.3,16.8,0.7218,0.6921,0,0,0,0,0,0,0,0,0,0,0,1.87,-11.9,10.36,48.78,29.71,110.59,38.34,-42.93,-26.21,2.16,-0.27,6.85,4.28,14.09,0.9,75.59,1.87,-11.9,10.36,48.78,29.71,110.59,38.34,-42.93,-26.21,2.16,-0.27,6.85,4.28,14.09,0.9,75.59],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,30.12,14.51,0.75568,0.65494,0,0,0,0,0,0,0,0,0,0,0,-2.8,-4.4,33.45,45.04,15.85,85.32,45.72,-44.11,-21.33,2.16,-0.27,6.85,4.28,14.09,0.9,69.83,-2.8,-4.4,33.45,45.04,15.85,85.32,45.72,-44.11,-21.33,2.16,-0.27,6.85,4.28,14.09,0.9,69.83],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,38.67,11.35,0.78764,0.61613,0,0,0,0,0,0,0,0,0,0,0,-7.47,3.1,57.17,39.9,2.67,46.74,40.04,-54.63,-7.76,2.16,-0.27,6.85,4.28,14.09,0.9,64.07,-7.47,3.1,57.17,39.9,2.67,46.74,40.04,-54.63,-7.76,2.16,-0.27,6.85,4.28,14.09,0.9,64.07],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,42.11,9.79,0.80031,0.59959,0,0,0,0,0,0,0,0,0,0,0,-9.4,6.2,76.65,33.87,-6.98,10.9,17.05,-63.43,19.41,2.16,-0.27,6.85,4.28,14.09,0.9,61.68,-9.4,6.2,76.65,33.87,-6.98,10.9,17.05,-63.43,19.41,2.16,-0.27,6.85,4.28,14.09,0.9,61.68],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":100,"at":[0,0,8]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"}]},
"archer":{"keys":[{"t":0,"v":[-10.91,17.44,16.84,0.70598,0.70538,-0.03082,0.05551,0,0,0,0,0,0,0,0,0,0.8,-2.7,19.33,67.05,10.21,8,-67.83,-20.61,17.92,2.33,-0.28,6.85,4.26,13.84,1.29,78.07,10,-7,-7.37,2.3,33.61,130.99,41.54,-46.28,-25.84,1.96,-0.28,6.85,4.26,14.31,0.51,78.07],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[-9.25,21.12,16.35,0.72061,0.69126,-0.02685,0.04641,0,0,0,0,0,0,0,0,0,0.59,-1.16,25.12,66.68,0.24,8,-72.14,-26.29,17.67,2.31,-0.28,6.85,4.27,13.88,1.23,75.71,7.1,-4.69,3.22,5.05,33.14,121.02,44.8,-42.39,-26.33,1.99,-0.28,6.85,4.27,14.28,0.56,75.71],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[-5.29,29.88,14.43,0.75457,0.65551,-0.01646,0.02576,0,0,0,0,0,0,0,0,0,0.1,2.55,40.21,61.55,-17.35,8,-73.67,-40.73,15.51,2.25,-0.28,6.85,4.28,13.97,1.1,69.99,0.1,0.9,24.49,10.24,34.21,91.74,47.43,-40.99,-19.58,2.06,-0.28,6.85,4.28,14.2,0.7,69.99],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[-1.49,38.37,11.47,0.78649,0.61755,-0.00503,0.0071,0,0,0,0,0,0,0,0,0,-0.39,6.26,56.22,48.26,-35.91,8,-70.77,-58.06,10.52,2.18,-0.27,6.85,4.28,14.05,0.96,64.28,-6.9,6.49,45.2,19.72,38.33,49.63,43.21,-49.47,-4.08,2.13,-0.27,6.85,4.28,14.12,0.84,64.28],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,41.78,9.95,0.79909,0.60121,0,0,0,0,0,0,0,0,0,0,0,-0.6,7.8,62.88,38.2,-44.32,8,-65.87,-67.47,5.77,2.16,-0.27,6.85,4.28,14.09,0.9,61.91,-9.8,8.8,59.79,31.97,42.39,11.2,25.99,-59.6,19.95,2.16,-0.27,6.85,4.28,14.09,0.9,61.91],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":140,"at":[8,0,8]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"}]},
"towelcurl":{"keys":[{"t":0,"v":[1.79,93.6,3.75,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,12,0,14,-82,0,0,3.37,2.02,13.54,14.69,10.93,1.17,0,0,0,6,12,0,14,-82,0,0,19.99,0.59,10.16,29.99,10.19,-2.89,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[10.55,93.6,0.23,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6.57,12,0,22.79,-82,0.95,0,4.37,-4.19,13.72,11.89,8.62,-5.1,0,0,0,6.57,12,0,22.79,-82,0.95,0,32.11,0.93,0.62,29.64,-1.23,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[10.59,93.6,-1.63,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8.07,12,0,45.79,-82,3.45,0,5.76,-4.17,13.8,12.19,7.58,-5.42,0,0,0,8.07,12,0,45.79,-82,3.45,0,54.06,1.56,1.04,49.9,-2.08,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[10.61,93.6,-2.84,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9.93,12,0,74.21,-82,6.55,0,6.55,-4.18,13.84,12.13,6.75,-5.62,0,0,0,9.93,12,0,74.21,-82,6.55,0,80.6,2.33,1.55,74.4,-3.1,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[10.6,93.6,-2.87,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11.43,12,0,97.21,-82,9.05,0,6.57,-4.17,13.84,12.14,6.74,-5.62,0,0,0,11.43,12,0,97.21,-82,9.05,0,100.89,2.91,1.94,93.13,-3.88,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[10.6,93.6,-2.78,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,12,0,106,-82,10,0,6.52,-4.17,13.84,12.15,6.8,-5.6,0,0,0,12,12,0,106,-82,10,0,104,3,2,96,-4,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"homeTowelFoot","id":"towel","foot":"R","r":1.4}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"towel","when":[0,0.03]},{"body":"gripL","prop":"towel"},{"body":"gripR","prop":"towel"}],"gripRadius":{"L":1.5,"R":1.5}},
"calf1":{"keys":[{"t":0,"v":[-9.52,107.99,1.78,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1.11,8,9,0,14,0,0,0,-5.56,-6.27,-0.3,4.94,19.04,-6.22,-8.5,2,4,53.4,27.94,1.59,74.65,69.03,-51.33,17.87,4,3,4,80,-20,0,0],"hands":{"L":"relaxed","R":"flat"}},{"t":0.25,"v":[-9.52,109.68,1.8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1.11,8,9,0,14,0,0,0,-5.14,-6.27,-0.28,4.94,12.07,-6.28,-1.98,2,4,51.29,27.12,1.37,74.83,69.47,-53.32,18.17,4,3,4,80,-20,0,0],"hands":{"L":"relaxed","R":"flat"}},{"t":0.5,"v":[-9.51,113.44,1.91,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1.11,8,9,0,14,0,0,0,-3.62,-6.25,-0.2,4.94,-5.27,-6.08,13.75,2,4,47.05,25.38,0.75,74.23,70.2,-58.3,19.03,4,3,4,80,-20,0,0],"hands":{"L":"relaxed","R":"flat"}},{"t":0.75,"v":[-9.5,116.51,2.1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1.11,8,9,0,14,0,0,0,-1.47,-6.23,-0.08,4.94,-23.22,-5.42,29.48,2,4,44.22,24.05,0.07,72.58,70.42,-62.87,19.99,4,3,4,80,-20,0,0],"hands":{"L":"relaxed","R":"flat"}},{"t":1,"v":[-9.5,117.5,2.19,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1.11,8,9,0,14,0,0,0,-0.44,-6.22,-0.02,4.94,-30.78,-5.03,36,2,4,43.48,23.64,-0.18,71.77,70.38,-64.47,20.39,4,3,4,80,-20,0,0],"hands":{"L":"relaxed","R":"flat"}}],"equipment":[{"type":"homeStep","id":"step","at":[-2,0,-14.5],"yaw":180},{"type":"homeWall","id":"wall","at":[0,0,-44],"yaw":0,"w":160}],"contacts":[{"body":"soleL","prop":"step"},{"body":"palmR","prop":"wall:panel"}]},
"nordic":{"keys":[{"t":0,"v":[0,27.28,39.31,0.82904,0.55919,0,0,0,0,0,0,0,0,-20,0,0,2,4,32.95,20.97,-9.66,81.02,79.98,-46.41,-12.36,-0.02,0.71,-0.57,28.75,18.77,0.79,78,2,4,32.95,20.97,-9.66,81.02,79.98,-46.41,-12.36,-0.02,0.71,-0.57,28.75,18.77,0.79,78],"hands":{"L":"flat","R":"flat"}},{"t":0.07,"v":[0,29.74,38.23,0.84634,0.53264,0,0,0,0,0,0,0,0,-17.2,0,0,2,4,40.98,18.17,-12.8,62.13,77.72,-53.74,-9.7,-0.02,0.68,-0.62,32.38,18.78,0.81,78,2,4,40.98,18.17,-12.8,62.13,77.72,-53.74,-9.7,-0.02,0.68,-0.62,32.38,18.78,0.81,78],"hands":{"L":"flat","R":"flat"}},{"t":0.14,"v":[0,32.13,36.99,0.86279,0.50556,0,0,0,0,0,0,0,0,-14.4,0,0,2,4,52.43,13.41,-16.88,35.58,71.78,-64.77,-3.07,-0.02,0.66,-0.68,36.02,18.78,0.83,78,2,4,52.43,13.41,-16.88,35.58,71.78,-64.77,-3.07,-0.02,0.66,-0.68,36.02,18.78,0.83,78],"hands":{"L":"flat","R":"flat"}},{"t":0.3,"v":[0,35.3,35.02,0.88419,0.46713,0,0,0,0,0,0,0,0,-8,0,0,2,6,29.54,56.27,-42.99,136.94,70,-25,0,-0.02,0.62,-0.77,41.06,18.78,0.87,78,2,6,29.54,56.27,-42.99,136.94,70,-25,0,-0.02,0.62,-0.77,41.06,18.78,0.87,78],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,44.79,26.13,0.94538,0.32598,0,0,0,0,0,0,0,0,0,0,0,2,6,17.37,41.46,-32.03,136.94,70,-25,0,-0.02,0.43,-1.1,58.72,18.79,1.03,78,2,6,17.37,41.46,-32.03,136.94,70,-25,0,-0.02,0.43,-1.1,58.72,18.79,1.03,78],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,52.9,8.68,0.9947,0.10286,0,0,0,0,0,0,0,0,0,0,0,2,6,9.7,27.29,-23.88,136.94,70,-25,0,-0.03,-0.15,-1.74,84.96,18.81,1.53,78,2,6,9.7,27.29,-23.88,136.94,70,-25,0,-0.03,-0.15,-1.74,84.96,18.81,1.53,78],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,53.8,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2,6,8.1,23.52,-21.91,136.94,70,-25,0,-0.04,-0.64,-2.14,96.77,18.82,1.96,78,2,6,8.1,23.52,-21.91,136.94,70,-25,0,-0.04,-0.64,-2.14,96.77,18.82,1.96,78],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"homeSofa","id":"sofa","at":[0,0,-38.770316593534154],"legH":24.074273672586788},{"type":"homeCushion","id":"pad","at":[0,0,-6],"t":6,"w":50,"len":36}],"contacts":[{"body":"kneeL","prop":"pad"},{"body":"kneeR","prop":"pad"},{"body":"footL","prop":"sofa:base"},{"body":"footR","prop":"sofa:base"},{"body":"palmL","prop":"floor","when":[0,0.14]},{"body":"palmR","prop":"floor","when":[0,0.14]}]},
"tablerow":{"keys":[{"t":0,"v":[0,14.26,-27.19,0,0,0.72934,0.68415,0,0,0,0,0,0,0,0,0,12,22,37.03,29.22,-15.15,61.76,54.27,0.03,-6.86,0,3,0,0,-14,0,0,12,22,37.03,29.22,-15.15,61.76,54.27,0.03,-6.86,0,3,0,0,-14,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,19.1,-26.71,0,0,0.7472,0.6646,0,0,0,0,0,0,0.88,0,0,9.95,16.58,26.51,32.07,-10.63,80.12,55.82,-0.02,-10.76,0,3,0,0,-14,0,0,9.95,16.58,26.51,32.07,-10.63,80.12,55.82,-0.02,-10.76,0,3,0,0,-14,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,30.54,-26.72,0,0,0.78812,0.61552,0,0,0,0,0,0,3,0,0,5,3.5,4.52,35.21,-0.24,112.47,57.43,0.02,-14.19,0,3,0,0,-14,0,0,5,3.5,4.52,35.21,-0.24,112.47,57.43,0.02,-14.19,0,3,0,0,-14,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,41.48,-28.38,0,0,0.82583,0.56392,0,0,0,0,0,0,5.12,0,0,0.05,-9.58,-20.84,32.17,16.57,136.13,52.47,-0.05,-8.18,0,3,0,0,-14,0,0,0.05,-9.58,-20.84,32.17,16.57,136.13,52.47,-0.05,-8.18,0,3,0,0,-14,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,45.82,-29.54,0,0,0.84047,0.54186,0,0,0,0,0,0,6,0,0,-2,-15,-33,24.97,29.41,142.96,47.14,-0.16,0.78,0,3,0,0,-14,0,0,-2,-15,-33,24.97,29.41,142.96,47.14,-0.16,0.78,0,3,0,0,-14,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"homeTable","id":"table","at":[0,0,-37.5]}],"contacts":[{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"table:top"},{"body":"gripR","prop":"table:top"}],"gripRadius":{"L":1.5,"R":1.5}},
"towelrow":{"keys":[{"t":0,"v":[0,76.19,52.89,0,0,0.94552,0.32557,0,0,0,0,0,0,0,0,0,2,8,29.25,9.79,-24.01,30.96,-28.01,-0.02,0.19,2.49,1.79,21.63,5.29,-33.57,-12.53,0,2,8,29.25,9.79,-24.01,30.96,-28.01,-0.02,0.19,2.49,1.79,21.63,5.29,-33.57,-12.53,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,78.74,49.45,0,0,0.95334,0.3019,0,0,0,0,0,0,0,0,0,1.71,4.49,17.53,13.97,-21.68,52.07,-27.44,-0.02,0.34,2.5,1.76,20.95,5.29,-30.91,-11.26,0,1.71,4.49,17.53,13.97,-21.68,52.07,-27.44,-0.02,0.34,2.5,1.76,20.95,5.29,-30.91,-11.26,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,84.17,40.65,0,0,0.96978,0.244,0,0,0,0,0,0,0,0,0,1,-4,-2.4,19.49,-18.61,83.87,-25.63,-0.02,0.59,2.53,1.7,19.65,5.29,-24.44,-8.49,0,1,-4,-2.4,19.49,-18.61,83.87,-25.63,-0.02,0.59,2.53,1.7,19.65,5.29,-24.44,-8.49,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,88.51,31.27,0,0,0.9827,0.18522,0,0,0,0,0,0,0,0,0,0.29,-12.49,-20.55,24.38,-15.9,106.95,-23.67,-0.03,0.7,2.54,1.66,18.74,5.29,-17.93,-6.01,0,0.29,-12.49,-20.55,24.38,-15.9,106.95,-23.67,-0.03,0.7,2.54,1.66,18.74,5.29,-17.93,-6.01,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,89.97,27.24,0,0,0.98701,0.16066,0,0,0,0,0,0,0,0,0,0,-16,-28.7,26.49,-14.13,115.2,-23.09,0.01,0.66,2.54,1.65,18.46,5.29,-15.22,-5.05,0,0,-16,-28.7,26.49,-14.13,115.2,-23.09,0.01,0.66,2.54,1.65,18.46,5.29,-15.22,-5.05,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"homeDoor","id":"door","at":[-34,0,-31],"yaw":0,"w":220},{"type":"homeTowel","id":"towel","from":[0,100,-31.6],"axis":[0,0,-1],"around":1,"mountTo":"door:neck","yaw":180}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"towel"},{"body":"gripR","prop":"towel"}],"gripRadius":{"L":1.6,"R":1.6}},
"sidelunge":{"keys":[{"t":0,"v":[-25.01,67.71,-18.48,0.9563,0.29237,0,0,6,0,0,8,0,0,-14,0,0,0,6,48.64,28.68,-63.23,103.44,8,0,0,43.39,51.73,41.81,8.74,-32.1,30.91,0,0,6,48.64,28.68,-63.23,103.44,8,0,0,89.99,30.81,28.15,86.39,23.35,2.2,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.2,"v":[-22.63,70.46,-16.89,0.9642,0.26516,0,0,5.43,0,0,7.24,0,0,-12.66,0,0,0,6,46.09,27.35,-60.75,103.44,8,0,0,40.47,48.31,40.7,8.74,-29.87,29.14,0,0,6,46.09,27.35,-60.75,103.44,8,0,0,82.87,29.39,25.56,81.3,22.27,4.67,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.4,"v":[-16.36,76.65,-12.35,0.9812,0.19298,0,0,3.93,0,0,5.24,0,0,-9.16,0,0,0,6,40.22,23.63,-55,103.44,8,0,0,31.5,40.58,38.29,8.74,-24.07,25.41,0,0,6,40.22,23.63,-55,103.44,8,0,0,63.84,27.45,20.87,67.47,18.85,10.4,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.6,"v":[-8.6,82.55,-6.11,0.99475,0.10233,0,0,2.07,0,0,2.76,0,0,-4.84,0,0,0,6,34.53,19.08,-49.29,103.44,8,0,0,18.6,32.9,36.16,8.74,-16.93,22.1,0,0,6,34.53,19.08,-49.29,103.44,8,0,0,39.21,26.77,17.68,47.91,12.94,16.5,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.8,"v":[-2.38,86.05,-0.55,0.9996,0.02833,0,0,0.57,0,0,0.76,0,0,-1.34,0,0,0,6,31.02,15.74,-45.65,103.44,8,0,0,7.14,27.81,35.03,8.74,-11.15,20.22,0,0,6,31.02,15.74,-45.65,103.44,8,0,0,16.23,26.26,16.95,25.79,4.86,20.95,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[-0.09,87.07,1.87,1,0,0,0,0,0,0,0,0,0,0,0,0,0,6,29.89,14.58,-44.46,103.44,8,0,0,2.46,26.12,34.72,8.74,-8.86,19.76,0,0,6,29.89,14.58,-44.46,103.44,8,0,0,3.61,25.03,17.76,9.87,-1.81,22.58,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"}]},
"pistolbox":{"keys":[{"t":0,"v":[8.84,52.21,-26.83,0.98163,0.19081,0,0,14,0,0,15,0,0,-16,0,0,23.57,5.44,137,6,0,6,70,0,0,101.26,19,34.59,105.29,24.44,-19.73,0,23.57,5.44,137,6,0,6,70,0,0,83.5,2,6,1,8,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.2,"v":[8.98,57.8,-25.08,0.98496,0.17278,0,0,12.66,0,0,13.57,0,0,-14.47,0,0,21.41,6.36,127.15,6.19,0,6,70,0,0,92.83,13.31,29.09,98.45,25.14,-17.34,0,21.41,6.36,127.15,6.19,0,6,70,0,0,79.92,2,6,1.67,7.62,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.4,"v":[9.2,68.9,-20.05,0.99212,0.12533,0,0,9.16,0,0,9.82,0,0,-10.47,0,0,16.72,7.68,105.77,6.69,0,6,70,0,0,72.73,5.9,21.79,82.99,25.36,-13.44,0,16.72,7.68,105.77,6.69,0,6,70,0,0,70.54,2,6,3.42,6.62,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.6,"v":[9.43,80.94,-13.21,0.9978,0.06628,0,0,4.84,0,0,5.18,0,0,-5.53,0,0,12.86,7.97,88.16,7.31,0,6,70,0,0,47.43,0.8,17.23,60.37,21.65,-10.21,0,12.86,7.97,88.16,7.31,0,6,70,0,0,58.96,2,6,5.58,5.38,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.8,"v":[9.66,90.03,-7.19,0.99983,0.01833,0,0,1.34,0,0,1.43,0,0,-1.53,0,0,11.31,7.87,81.04,7.81,0,6,70,0,0,23.24,-3.08,14.96,32.74,12.98,-8.27,0,11.31,7.87,81.04,7.81,0,6,70,0,0,49.58,2,6,7.33,4.38,0,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[9.83,93.4,-4.49,1,0,0,0,0,0,0,0,0,0,0,0,0,11.09,7.85,80,8,0,6,70,0,0,7.89,-5.92,14,9.88,3.62,-7.64,0,11.09,7.85,80,8,0,6,70,0,0,46,2,6,8,4,0,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"flatBench","id":"bench","at":[0,0,-38.05370510651166],"yaw":90}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"buttocks","prop":"bench:pad","when":[0,0.02]}]},
"benchdip":{"keys":[{"t":0,"v":[0,53.23,14.77,0.99939,0.0349,0,0,0,0,0,2,0,0,4,0,0,-4,-6,-28.56,6.18,-14.52,18.26,71.68,-68.83,4.44,83.96,6.37,10.09,45.01,-5.28,-2,0,-4,-6,-28.56,6.18,-14.52,18.26,71.68,-68.83,4.44,83.96,6.37,10.09,45.01,-5.28,-2,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,51.04,14.72,0.9997,0.02468,0,0,0.59,0,0,3.46,0,0,3.71,0,0,-2.24,-7.17,-35.32,8.19,-14.52,33.44,76.02,-61.81,-0.31,86.33,6.91,10.27,49.51,-2.91,-1.93,0,-2.24,-7.17,-35.32,8.19,-14.52,33.44,76.02,-61.81,-0.31,86.33,6.91,10.27,49.51,-2.91,-1.93,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,45.75,14.59,1,0,0,0,2,0,0,7,0,0,3,0,0,2,-10,-44.74,11.24,-14.28,55.12,78.96,-52.25,-3.79,91.16,8.02,10.65,58.11,1.47,-1.82,0,2,-10,-44.74,11.24,-14.28,55.12,78.96,-52.25,-3.79,91.16,8.02,10.65,58.11,1.47,-1.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,40.47,14.43,0.9997,-0.02468,0,0,3.41,0,0,10.54,0,0,2.29,0,0,6.24,-12.83,-51.65,13.58,-13.74,70.69,79.8,-46.05,-4.93,95.34,8.99,11.01,64.92,4.72,-1.74,0,6.24,-12.83,-51.65,13.58,-13.74,70.69,79.8,-46.05,-4.93,95.34,8.99,11.01,64.92,4.72,-1.74,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,38.28,14.35,0.99939,-0.0349,0,0,4,0,0,12,0,0,2,0,0,8,-14,-54.25,14.45,-13.42,76.28,79.9,-44.02,-5.11,96.97,9.38,11.17,67.47,5.88,-1.72,0,8,-14,-54.25,14.45,-13.42,76.28,79.9,-44.02,-5.11,96.97,9.38,11.17,67.47,5.88,-1.72,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench","at":[0,0,-14.5],"yaw":90}],"contacts":[{"body":"gripL","prop":"bench:pad"},{"body":"gripR","prop":"bench:pad"},{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"}],"gripRadius":{"L":2.2,"R":2.2}},
"chairdip":{"keys":[{"t":0,"v":[0,37.76,14.35,0.99939,-0.0349,0,0,4,0,0,12,0,0,2,0,0,8,-14,-57.78,7.88,-18.55,84.33,78,-42.66,-23.97,106.95,14.73,12.54,107.12,18.99,-2.02,0,8,-14,-57.78,7.88,-18.55,84.33,78,-42.66,-23.97,106.95,14.73,12.54,107.12,18.99,-2.02,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,40.34,14.43,0.9997,-0.02468,0,0,3.41,0,0,10.54,0,0,2.29,0,0,6.24,-12.83,-54.71,6.64,-17.93,78.02,77.14,-44.72,-22.86,104.5,14.18,12.36,104.6,19.25,-1.95,0,6.24,-12.83,-54.71,6.64,-17.93,78.02,77.14,-44.72,-22.86,104.5,14.18,12.36,104.6,19.25,-1.95,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,46.57,14.59,1,0,0,0,2,0,0,7,0,0,3,0,0,2,-10,-46.59,3.68,-16.52,60.49,74.29,-51.22,-19.19,98.73,12.98,12.05,97.97,19.22,-1.8,0,2,-10,-46.59,3.68,-16.52,60.49,74.29,-51.22,-19.19,98.73,12.98,12.05,97.97,19.22,-1.8,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,52.79,14.72,0.9997,0.02468,0,0,0.59,0,0,3.46,0,0,3.71,0,0,-2.24,-7.17,-35.55,0.24,-15.04,35.98,67.92,-61.37,-11.56,93.07,11.81,11.83,90.19,17.91,-1.72,0,-2.24,-7.17,-35.55,0.24,-15.04,35.98,67.92,-61.37,-11.56,93.07,11.81,11.83,90.19,17.91,-1.72,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.37,14.77,0.99939,0.0349,0,0,0,0,0,2,0,0,4,0,0,-4,-6,-27.46,-1.98,-14.19,18.26,59.2,-68.9,-1.92,90.74,11.3,11.75,86.47,16.87,-1.71,0,-4,-6,-27.46,-1.98,-14.19,18.26,59.2,-68.9,-1.92,90.74,11.3,11.75,86.47,16.87,-1.71,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"homeChair","id":"chair","at":[0,0,-21]}],"contacts":[{"body":"gripL","prop":"chair:seat"},{"body":"gripR","prop":"chair:seat"},{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"}],"gripRadius":{"L":1.5,"R":1.5}},
"declinepike":{"keys":[{"t":0,"v":[0,79.54,84.36,0.22495,0.97437,0,0,0,0,0,0,0,0,-10,0,0,6,-4,94.11,61.37,27.03,98.09,77.99,-37.6,-24.44,82.33,0.19,0.1,11.42,15.63,0.13,67.46,6,-4,94.11,61.37,27.03,98.09,77.99,-37.6,-24.44,82.33,0.19,0.1,11.42,15.63,0.13,67.46],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,82.38,83.18,0.23552,0.97187,0,0,0,0,0,0,0,0,-8.54,0,0,7.17,-2.24,98.4,60.83,24.37,90.16,77.93,-41,-23.59,83.03,0.19,0.1,11.42,15.63,0.13,65.52,7.17,-2.24,98.4,60.83,24.37,90.16,77.93,-41,-23.59,83.03,0.19,0.1,11.42,15.63,0.13,65.52],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,89.04,79.93,0.26093,0.96536,0,0,0,0,0,0,0,0,-5,0,0,10,2,110.2,58.87,17.59,68.42,76.32,-50.45,-20.68,84.7,0.2,0.11,11.42,15.63,0.13,60.84,10,2,110.2,58.87,17.59,68.42,76.32,-50.45,-20.68,84.7,0.2,0.11,11.42,15.63,0.13,60.84],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,95.43,76.15,0.28615,0.95818,0,0,0,0,0,0,0,0,-1.46,0,0,12.83,6.24,127.82,52.48,6.92,38.04,69.64,-63.89,-12.97,86.38,0.2,0.11,11.42,15.63,0.13,56.15,12.83,6.24,127.82,52.48,6.92,38.04,69.64,-63.89,-12.97,86.38,0.2,0.11,11.42,15.63,0.13,56.15],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,97.98,74.43,0.29654,0.95502,0,0,0,0,0,0,0,0,0,0,0,14,8,144.11,39.12,-6.33,12.88,53.64,-74.72,3.87,87.08,0.2,0.11,11.42,15.63,0.13,54.21,14,8,144.11,39.12,-6.33,12.88,53.64,-74.72,3.87,87.08,0.2,0.11,11.42,15.63,0.13,54.21],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench","at":[0,0,-7.5],"yaw":90}],"contacts":[{"body":"soleL","prop":"bench:pad"},{"body":"soleR","prop":"bench:pad"},{"body":"palmL","prop":"floor"},{"body":"palmR","prop":"floor"}]},
"pikepush":{"keys":[{"t":0,"v":[0,79.2,47.77,0.48481,0.87462,0,0,0,0,0,0,0,0,0,0,0,14,8,138.48,35.63,-20.21,12.85,44.35,-59.28,1.45,86.84,1.21,0.68,11.31,15.58,0.79,30.89,14,8,138.48,35.63,-20.21,12.85,44.35,-59.28,1.45,86.84,1.21,0.68,11.31,15.58,0.79,30.89],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,77.2,50.86,0.47247,0.88135,0,0,0,0,0,0,0,0,-1.46,0,0,12.83,6.24,118.78,55.81,-0.66,41.57,57.57,-48.7,-13.85,86.12,1.2,0.67,11.31,15.58,0.79,33.22,12.83,6.24,118.78,55.81,-0.66,41.57,57.57,-48.7,-13.85,86.12,1.2,0.67,11.31,15.58,0.79,33.22],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,71.87,57.97,0.44229,0.89687,0,0,0,0,0,0,0,0,-5,0,0,10,2,97.25,64.25,14.44,75.58,65.9,-35.5,-23.87,84.4,1.18,0.64,11.31,15.58,0.79,38.82,10,2,97.25,64.25,14.44,75.58,65.9,-35.5,-23.87,84.4,1.18,0.64,11.31,15.58,0.79,38.82],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,65.87,64.52,0.4116,0.91136,0,0,0,0,0,0,0,0,-8.54,0,0,7.17,-2.24,82.95,65.26,23.07,100.11,68.88,-26.33,-28.31,82.68,1.16,0.62,11.31,15.58,0.79,44.43,7.17,-2.24,82.95,65.26,23.07,100.11,68.88,-26.33,-28.31,82.68,1.16,0.62,11.31,15.58,0.79,44.43],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,63.2,67.06,0.39875,0.91706,0,0,0,0,0,0,0,0,-10,0,0,6,-4,77.68,65.08,26.24,109.12,69.37,-23.19,-29.64,81.97,1.16,0.61,11.31,15.58,0.79,46.76,6,-4,77.68,65.08,26.24,109.12,69.37,-23.19,-29.64,81.97,1.16,0.61,11.31,15.58,0.79,46.76],"hands":{"L":"flat","R":"flat"}}],"equipment":[],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"palmL","prop":"floor"},{"body":"palmR","prop":"floor"}]},
"declinepush":{"keys":[{"t":0,"v":[0,59.62,90.28,0.70391,0.71029,0,0,0,0,0,0,0,0,-8,0,0,2,12,94.63,12.18,-6.54,10.09,57.2,-74.56,21.25,2.8,0.13,0,5.52,14.72,0.13,58,2,12,94.63,12.18,-6.54,10.09,57.2,-74.56,21.25,2.8,0.13,0,5.52,14.72,0.13,58],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,55.84,90.85,0.68894,0.72482,0,0,0,0,0,0,0,0,-8.59,0,0,1.41,8.19,78.6,17.19,-1.22,47.86,73.58,-56.06,3.14,2.8,0.13,0,5.52,14.72,0.13,58,1.41,8.19,78.6,17.19,-1.22,47.86,73.58,-56.06,3.14,2.8,0.13,0,5.52,14.72,0.13,58],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,46.65,91.58,0.65158,0.75858,0,0,0,0,0,0,0,0,-10,0,0,0,-1,66.04,22.72,6.57,87.96,75.11,-33.45,-2.26,2.8,0.13,0,5.52,14.72,0.13,58,0,-1,66.04,22.72,6.57,87.96,75.11,-33.45,-2.26,2.8,0.13,0,5.52,14.72,0.13,58],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,37.43,91.39,0.61257,0.79042,0,0,0,0,0,0,0,0,-11.41,0,0,-1.41,-10.19,61.59,29.59,17.08,115.15,69.97,-14.31,-5.45,2.8,0.13,0,5.52,14.72,0.13,58,-1.41,-10.19,61.59,29.59,17.08,115.15,69.97,-14.31,-5.45,2.8,0.13,0,5.52,14.72,0.13,58],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,33.62,91.03,0.59595,0.80302,0,0,0,0,0,0,0,0,-12,0,0,-2,-14,61.11,34.42,23.8,124.27,65.43,-6.24,-7.76,2.8,0.13,0,5.52,14.72,0.13,58,-2,-14,61.11,34.42,23.8,124.27,65.43,-6.24,-7.76,2.8,0.13,0,5.52,14.72,0.13,58],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench","at":[0,0,-13.3],"yaw":90}],"contacts":[{"body":"soleL","prop":"bench:pad"},{"body":"soleR","prop":"bench:pad"},{"body":"palmL","prop":"floor"},{"body":"palmR","prop":"floor"}]},
"inclinepush":{"keys":[{"t":0,"v":[0,48.38,79.5,0.8263,0.56323,0,0,0,0,0,0,0,0,-6,0,0,-2,-14,-19.07,23.49,0.26,124.05,81.54,-54.5,-13.74,2.8,0.13,0,5.52,8.72,0.13,62.56,-2,-14,-19.07,23.49,0.26,124.05,81.54,-54.5,-13.74,2.8,0.13,0,5.52,8.72,0.13,62.56],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,52.2,77.15,0.83979,0.54291,0,0,0,0,0,0,0,0,-5.41,0,0,-1.27,-10.19,-8.07,23.72,-2.79,115.93,81.9,-49.4,-14.64,2.8,0.13,0,5.52,8.72,0.13,59.76,-1.27,-10.19,-8.07,23.72,-2.79,115.93,81.9,-49.4,-14.64,2.8,0.13,0,5.52,8.72,0.13,59.76],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,60.92,70.71,0.87029,0.49254,0,0,0,0,0,0,0,0,-4,0,0,0.5,-1,14.55,21.71,-8.91,89.56,80.04,-47.39,-13.83,2.8,0.13,0,5.52,8.72,0.13,53.02,0.5,-1,14.55,21.71,-8.91,89.56,80.04,-47.39,-13.83,2.8,0.13,0,5.52,8.72,0.13,53.02],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,68.82,63.3,0.89777,0.44047,0,0,0,0,0,0,0,0,-2.59,0,0,2.27,8.19,37.99,15.91,-15.44,48.98,73.63,-57.84,-7.51,2.8,0.13,0,5.52,8.72,0.13,46.27,2.27,8.19,37.99,15.91,-15.44,48.98,73.63,-57.84,-7.51,2.8,0.13,0,5.52,8.72,0.13,46.27],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,71.82,59.97,0.90825,0.41844,0,0,0,0,0,0,0,0,-2,0,0,3,12,56.72,8.31,-20.83,10.47,56.26,-72.72,10.97,2.8,0.13,0,5.52,8.72,0.13,43.47,3,12,56.72,8.31,-20.83,10.47,56.26,-72.72,10.97,2.8,0.13,0,5.52,8.72,0.13,43.47],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench","at":[0,0,122.73238915532059],"yaw":90}],"contacts":[{"body":"palmL","prop":"bench:pad"},{"body":"palmR","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"}]},
"airsquat":{"keys":[{"t":0,"v":[0,94,3.11,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0.83,6,8,0,10,0,0,0,2.47,4.81,16.27,9.34,5.62,3.92,0,0,0.83,6,8,0,10,0,0,0,2.47,4.81,16.27,9.34,5.62,3.92,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.2,"v":[0,89.85,-3.13,0.99767,0.06818,0,0,2.2,0,0,1.71,0,0,-6.35,0,0,0,1.43,10.36,8.09,-0.28,9.72,3.49,0,0,27.97,8.99,16.46,36.93,15.06,2.89,0,0,1.43,10.36,8.09,-0.28,9.72,3.49,0,0,27.97,8.99,16.46,36.93,15.06,2.89,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.4,"v":[0,78.97,-12.94,0.98913,0.14706,0,0,4.76,0,0,3.7,0,0,-13.74,0,0,6.71,6.89,59.85,9,-3.01,6.99,37.61,0,0,59.5,14.86,18.21,66.71,21.69,1.09,0,6.71,6.89,59.85,9,-3.01,6.99,37.61,0,0,59.5,14.86,18.21,66.71,21.69,1.09,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.6,"v":[0,65.53,-20.3,0.97665,0.21486,0,0,6.98,0,0,5.43,0,0,-20.16,0,0,20.87,6.54,124.46,9.99,-5.96,4.04,74.52,0,0,87.05,22.76,22.14,90.11,24.09,-0.75,0,20.87,6.54,124.46,9.99,-5.96,4.04,74.52,0,0,87.05,22.76,22.14,90.11,24.09,-0.75,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.8,"v":[0,54.65,-23.63,0.96563,0.25991,0,0,8.47,0,0,6.59,0,0,-24.48,0,0,22.79,5.78,133.19,10,-6,4,75,0,0,105.49,32.21,27.62,105.42,24.07,-2.09,0,22.79,5.78,133.19,10,-6,4,75,0,0,105.49,32.21,27.62,105.42,24.07,-2.09,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,50.5,-24.46,0.96126,0.27564,0,0,9,0,0,7,0,0,-26,0,0,23.4,5.51,136,10,-6,4,75,0,0,111.76,37.28,30.73,110.74,23.54,-2.62,0,23.4,5.51,136,10,-6,4,75,0,0,111.76,37.28,30.73,110.74,23.54,-2.62,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"}]},
"wallsit":{"keys":[{"t":0,"v":[0,52.1,-26.32,1,0,0,0,-1,0,0,-3,0,0,4,0,0,0,-4,-15.77,18.54,-67.09,22.74,24.32,-2.72,-8.09,89.68,7.16,6.53,90,0.03,-1.96,0,0,-4,-15.77,18.54,-67.09,22.74,24.32,-2.72,-8.09,89.68,7.16,6.53,90,0.03,-1.96,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,52.1,-25.99,1,0,0,0,-1,0,0,-4,0,0,4,0,0,1.5,-4,-15.89,16.71,-67.09,18.85,24.22,-3.41,-6.38,89.68,7.16,6.53,90,0.03,-1.96,0,1.5,-4,-15.89,16.71,-67.09,18.85,24.22,-3.41,-6.38,89.68,7.16,6.53,90,0.03,-1.96,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"homeWall","id":"wall","at":[0,0,-38],"w":160}],"contacts":[{"body":"back","prop":"wall:panel"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"palmL","prop":"wall:panel"},{"body":"palmR","prop":"wall:panel"}]},
"wallpush":{"keys":[{"t":0,"v":[0,91.28,-22.92,0,0,0.99089,-0.13466,0,0,0,0,0,0,-4,0,0,3,-10,58.44,37.05,11.29,104.03,70.51,-30.4,-19.29,2.56,1.61,17.53,5.29,17.17,5.35,0,3,-10,58.44,37.05,11.29,104.03,70.51,-30.4,-19.29,2.56,1.61,17.53,5.29,17.17,5.35,0],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,91.94,-20.39,0,0,0.99283,-0.11957,0,0,0,0,0,0,-3.41,0,0,3.59,-7.07,59.78,34.34,7.35,96.55,72.33,-35.82,-18.52,2.56,1.6,17.37,5.29,15.51,4.81,0,3.59,-7.07,59.78,34.34,7.35,96.55,72.33,-35.82,-18.52,2.56,1.6,17.37,5.29,15.51,4.81,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,93.22,-14.22,0,0,0.99655,-0.08303,0,0,0,0,0,0,-2,0,0,5,0,64.99,28.48,-0.77,75.01,74.44,-49.63,-16.5,2.56,1.59,17.08,5.29,11.49,3.54,0,5,0,64.99,28.48,-0.77,75.01,74.44,-49.63,-16.5,2.56,1.59,17.08,5.29,11.49,3.54,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,94.03,-7.96,0,0,0.99892,-0.04638,0,0,0,0,0,0,-0.59,0,0,6.41,7.07,75.34,21.49,-8.78,43.94,70.71,-66.94,-10.26,2.57,1.58,16.87,5.29,7.47,2.31,0,6.41,7.07,75.34,21.49,-8.78,43.94,70.71,-66.94,-10.26,2.57,1.58,16.87,5.29,7.47,2.31,0],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,94.23,-5.35,0,0,0.99951,-0.03118,0,0,0,0,0,0,0,0,0,7,10,84.91,15.99,-13.84,20.42,54.37,-78.44,7.07,2.57,1.58,16.81,5.29,5.8,1.8,0,7,10,84.91,15.99,-13.84,20.42,54.37,-78.44,7.07,2.57,1.58,16.81,5.29,5.8,1.8,0],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"homeWall","id":"wall","at":[0,0,-67],"yaw":0,"w":160}],"contacts":[{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"palmL","prop":"wall:panel"},{"body":"palmR","prop":"wall:panel"}]},
"jumpingjack":{"keys":[{"t":0,"v":[0,94.15,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0,-0.18,-1.32,9.26,-8.68,16.9,-0.19,0,0,16.8,3.45,12.68,30,8.81,-0.35,7,0,-0.18,-1.32,9.26,-8.68,16.9,-0.19,0,0,16.8,3.45,12.68,30,8.81,-0.35,7],"hands":{"L":"flat","R":"flat"}},{"t":0.0625,"v":[0,96.04,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0,-0.19,-1.37,15.27,-6.41,16.9,-0.62,0,0,14.65,2.92,12.68,24.73,1.39,-0.83,11.39,0,-0.19,-1.37,15.27,-6.41,16.9,-0.62,0,0,14.65,2.92,12.68,24.73,1.39,-0.83,11.39],"hands":{"L":"flat","R":"flat"}},{"t":0.125,"v":[0,99.61,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0.55,-0.2,-1.48,32.45,-0.59,16.9,-3.1,0,0,9.6,1.65,12.65,12,-16.7,-1.95,22,0.55,-0.2,-1.48,32.45,-0.59,16.9,-3.1,0,0,9.6,1.65,12.65,12,-16.7,-1.95,22],"hands":{"L":"flat","R":"flat"}},{"t":0.1875,"v":[0,105.38,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,6.35,-0.2,-1.68,58.82,3.56,16.9,-9.77,0,0,7.85,3.31,14.16,7.76,-19.64,-0.28,6.44,6.35,-0.2,-1.68,58.82,3.56,16.9,-9.77,0,0,7.85,3.31,14.16,7.76,-19.64,-0.28,6.44],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,107.21,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,13.42,-0.2,-2.24,90.99,1.29,16.9,-20.35,0,0,7.13,7.66,17.45,6,-22.17,3.35,0,13.42,-0.2,-2.24,90.99,1.29,16.9,-20.35,0,0,7.13,7.66,17.45,6,-22.17,3.35,0],"hands":{"L":"flat","R":"flat"}},{"t":0.3125,"v":[0,103.83,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,20.49,-0.2,-3.59,123.09,-0.14,16.9,-30.82,0,0,7.85,12.54,20.51,7.76,-23.27,6.91,6.44,20.49,-0.2,-3.59,123.09,-0.14,16.9,-30.82,0,0,7.85,12.54,20.51,7.76,-23.27,6.91,6.44],"hands":{"L":"flat","R":"flat"}},{"t":0.375,"v":[0,97.37,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,26.28,-0.2,-7.2,149.27,6.67,16.9,-37.27,0,0,9.52,15.39,21.68,12,-21.99,8.54,22,26.28,-0.2,-7.2,149.27,6.67,16.9,-37.27,0,0,9.52,15.39,21.68,12,-21.99,8.54,22],"hands":{"L":"flat","R":"flat"}},{"t":0.4375,"v":[0,94.33,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,30.04,-0.19,-16.77,165.72,18.68,16.9,-39.54,0,0,13.02,17.03,21.31,21.9,-5.34,10.58,11.39,30.04,-0.19,-16.77,165.72,18.68,16.9,-39.54,0,0,13.02,17.03,21.31,21.9,-5.34,10.58,11.39],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,92.77,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,31.36,-0.18,-29.96,169.9,29.39,16.9,-39.89,0,0,14.54,17.75,21.14,26,1.51,11.36,7,31.36,-0.18,-29.96,169.9,29.39,16.9,-39.89,0,0,14.54,17.75,21.14,26,1.51,11.36,7],"hands":{"L":"flat","R":"flat"}},{"t":0.5625,"v":[0,94.33,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,30.04,-0.19,-16.77,165.72,18.68,16.9,-39.54,0,0,13.02,17.03,21.31,21.9,-5.34,10.58,11.39,30.04,-0.19,-16.77,165.72,18.68,16.9,-39.54,0,0,13.02,17.03,21.31,21.9,-5.34,10.58,11.39],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[0,97.37,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,26.28,-0.2,-7.2,149.27,6.67,16.9,-37.27,0,0,9.52,15.39,21.68,12,-21.99,8.54,22,26.28,-0.2,-7.2,149.27,6.67,16.9,-37.27,0,0,9.52,15.39,21.68,12,-21.99,8.54,22],"hands":{"L":"flat","R":"flat"}},{"t":0.6875,"v":[0,103.83,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,20.49,-0.2,-3.59,123.09,-0.14,16.9,-30.82,0,0,7.85,12.54,20.51,7.76,-23.27,6.91,6.44,20.49,-0.2,-3.59,123.09,-0.14,16.9,-30.82,0,0,7.85,12.54,20.51,7.76,-23.27,6.91,6.44],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,107.21,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,13.42,-0.2,-2.24,90.99,1.29,16.9,-20.35,0,0,7.13,7.66,17.45,6,-22.17,3.35,0,13.42,-0.2,-2.24,90.99,1.29,16.9,-20.35,0,0,7.13,7.66,17.45,6,-22.17,3.35,0],"hands":{"L":"flat","R":"flat"}},{"t":0.8125,"v":[0,105.38,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,6.35,-0.2,-1.68,58.82,3.56,16.9,-9.77,0,0,7.85,3.31,14.16,7.76,-19.64,-0.28,6.44,6.35,-0.2,-1.68,58.82,3.56,16.9,-9.77,0,0,7.85,3.31,14.16,7.76,-19.64,-0.28,6.44],"hands":{"L":"flat","R":"flat"}},{"t":0.875,"v":[0,99.61,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0.55,-0.2,-1.48,32.45,-0.59,16.9,-3.1,0,0,9.6,1.65,12.65,12,-16.7,-1.95,22,0.55,-0.2,-1.48,32.45,-0.59,16.9,-3.1,0,0,9.6,1.65,12.65,12,-16.7,-1.95,22],"hands":{"L":"flat","R":"flat"}},{"t":0.9375,"v":[0,96.04,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0,-0.19,-1.37,15.27,-6.41,16.9,-0.62,0,0,14.65,2.92,12.68,24.73,1.39,-0.83,11.39,0,-0.19,-1.37,15.27,-6.41,16.9,-0.62,0,0,14.65,2.92,12.68,24.73,1.39,-0.83,11.39],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,94.15,0,0.99966,0.02618,0,0,0,0,0,0,0,0,-3,0,0,0,-0.18,-1.32,9.26,-8.68,16.9,-0.19,0,0,16.8,3.45,12.68,30,8.81,-0.35,7,0,-0.18,-1.32,9.26,-8.68,16.9,-0.19,0,0,16.8,3.45,12.68,30,8.81,-0.35,7],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":120,"width":100,"at":[0,0,6]}],"contacts":[{"body":"soleL","prop":"mat","when":[0,0.125]},{"body":"soleR","prop":"mat","when":[0,0.125]},{"body":"soleL","prop":"mat","when":[0.375,0.625]},{"body":"soleR","prop":"mat","when":[0.375,0.625]},{"body":"soleL","prop":"mat","when":[0.875,1]},{"body":"soleR","prop":"mat","when":[0.875,1]}],"dynamic":true,"loop":true},
"jumpsquat":{"keys":[{"t":0,"v":[0,73.8,-19.02,0.89879,0.43837,0,0,-2,0,0,5,0,0,-28.6,0,0,0,1,7.35,19.78,-8.4,42.74,0,0,0,102.16,26.89,30.98,78,22.62,-1.76,0,0,1,7.35,19.78,-8.4,42.74,0,0,0,102.16,26.89,30.98,78,22.62,-1.76,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.0625,"v":[0,75.44,-19.27,0.90397,0.42759,0,0,-2,0,0,5,0,0,-27.85,0,0,0,2.74,20.49,20.18,-5.98,42.74,0,0,0,99.33,24.91,29.84,74.45,21.06,-1.78,0,0,2.74,20.49,20.18,-5.98,42.74,0,0,0,99.33,24.91,29.84,74.45,21.06,-1.78,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.125,"v":[0,78.29,-19.55,0.91517,0.40306,0,0,-2,0,0,5,0,0,-26.15,0,0,3.14,5.17,40.99,16.73,-5.93,42.74,0,0,0,93.38,21.51,27.84,68,18.32,-1.78,0,3.14,5.17,40.99,16.73,-5.93,42.74,0,0,0,93.38,21.51,27.84,68,18.32,-1.78,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.1875,"v":[0,82.37,-19.12,0.93227,0.36176,0,0,-2,0,0,5,0,0,-23.33,0,0,7.55,6.94,61.88,17.56,-3.47,42.74,0,0,0,83.21,17.1,25.24,58.31,14.46,-1.6,0.19,7.55,6.94,61.88,17.56,-3.47,42.74,0,0,0,83.21,17.1,25.24,58.31,14.46,-1.6,0.19],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.25,"v":[0,90.41,-12.88,0.95667,0.29118,0,0,-2,0,0,5,0,0,-18.62,0,0,10.81,7.61,76.61,19.83,-0.59,42.74,0,0,0,65.02,12.47,22.16,45.48,-0.69,-1.62,12.94,10.81,7.61,76.61,19.83,-0.59,42.74,0,0,0,65.02,12.47,22.16,45.48,-0.69,-1.62,12.94],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.3125,"v":[0,98.55,-3.25,0.98113,0.19333,0,0,-2,0,0,5,0,0,-12.26,0,0,11.81,7.7,81.09,20.72,0.42,42.74,0,0,0,41.54,8.76,19.91,29.24,-24.87,-2.2,33.34,11.81,7.7,81.09,20.72,0.42,42.74,0,0,0,41.54,8.76,19.91,29.24,-24.87,-2.2,33.34],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.375,"v":[0,102.52,3.07,0.99756,0.06976,0,0,-2,0,0,5,0,0,-4.4,0,0,9.87,7.47,72.39,19.08,-1.48,42.74,0,0,0,14.89,5.24,18.7,9,-42.9,-2.55,44,9.87,7.47,72.39,19.08,-1.48,42.74,0,0,0,14.89,5.24,18.7,9,-42.9,-2.55,44],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.4375,"v":[0,112.78,5.1,0.99949,0.0319,0,0,-2,0,0,5,0,0,-2.01,0,0,8.15,7.1,64.61,17.92,-2.98,42.74,0,0,0,7.37,4.58,18.54,5.05,-40.13,-1.82,11.86,8.15,7.1,64.61,17.92,-2.98,42.74,0,0,0,7.37,4.58,18.54,5.05,-40.13,-1.82,11.86],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5,"v":[0,116.61,5.64,0.99966,0.02618,0,0,-2,0,0,5,0,0,-1.65,0,0,5.94,6.42,54.51,16.72,-4.73,42.74,0,0,0,6.43,4.65,18.52,6,-35.46,-1.27,0,5.94,6.42,54.51,16.72,-4.73,42.74,0,0,0,6.43,4.65,18.52,6,-35.46,-1.27,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.5625,"v":[0,111.93,5.33,0.99896,0.04553,0,0,-2,0,0,5,0,0,-2.87,0,0,3.34,5.32,42.36,15.67,-6.62,42.74,0,0,0,9.11,4.85,18.6,8.18,-30.31,-0.8,9.81,3.34,5.32,42.36,15.67,-6.62,42.74,0,0,0,9.11,4.85,18.6,8.18,-30.31,-0.8,9.81],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.625,"v":[0,100.5,4.13,0.99619,0.08716,0,0,-2,0,0,5,0,0,-5.5,0,0,0.67,3.89,29.49,14.91,-8.45,42.74,0,0,0,16.93,5.79,18.8,15,-23.2,-0.45,30,0.67,3.89,29.49,14.91,-8.45,42.74,0,0,0,16.93,5.79,18.8,15,-23.2,-0.45,30],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.6875,"v":[0,94.6,-5.41,0.98621,0.16551,0,0,-2,0,0,5,0,0,-10.48,0,0,0,2.65,19.57,14.53,-9.78,42.74,0,0,0,36.68,7.91,19.58,29.08,0.45,0.43,9.49,0,2.65,19.57,14.53,-9.78,42.74,0,0,0,36.68,7.91,19.58,29.08,0.45,0.43,9.49],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.75,"v":[0,88.61,-11.63,0.96894,0.2473,0,0,-2,0,0,5,0,0,-15.75,0,0,0,1.44,10.54,18.02,-8.9,42.74,0,0,0,56.73,11.14,21.19,43.48,13.41,0.27,0,0,1.44,10.54,18.02,-8.9,42.74,0,0,0,56.73,11.14,21.19,43.48,13.41,0.27,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.8125,"v":[0,84,-14.4,0.94752,0.3197,0,0,-2,0,0,5,0,0,-20.51,0,0,0,0.54,3.93,19.74,-9.02,42.74,0,0,0,73.75,15.23,23.48,56.49,17.36,-0.39,0,0,0.54,3.93,19.74,-9.02,42.74,0,0,0,73.75,15.23,23.48,56.49,17.36,-0.39,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.875,"v":[0,79.3,-16.64,0.92496,0.38008,0,0,-2,0,0,5,0,0,-24.57,0,0,0,0.14,0.99,19.73,-9.56,42.74,0,0,0,88.06,19.97,26.42,67.3,20.31,-1,0,0,0.14,0.99,19.73,-9.56,42.74,0,0,0,88.06,19.97,26.42,67.3,20.31,-1,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":0.9375,"v":[0,75.45,-18.24,0.90596,0.42337,0,0,-2,0,0,5,0,0,-27.55,0,0,0,0.25,1.86,19.73,-9.4,42.74,0,0,0,98.32,24.66,29.49,75.02,22.13,-1.5,0,0,0.25,1.86,19.73,-9.4,42.74,0,0,0,98.32,24.66,29.49,75.02,22.13,-1.5,0],"hands":{"L":"relaxed","R":"relaxed"}},{"t":1,"v":[0,73.8,-19.02,0.89879,0.43837,0,0,-2,0,0,5,0,0,-28.6,0,0,0,1,7.35,19.78,-8.4,42.74,0,0,0,102.16,26.89,30.98,78,22.62,-1.76,0,0,1,7.35,19.78,-8.4,42.74,0,0,0,102.16,26.89,30.98,78,22.62,-1.76,0],"hands":{"L":"relaxed","R":"relaxed"}}],"equipment":[{"type":"mat","id":"mat","len":120,"width":80,"at":[0,0,4]}],"contacts":[{"body":"soleL","prop":"mat","when":[0,0.375]},{"body":"soleR","prop":"mat","when":[0,0.375]},{"body":"soleL","prop":"mat","when":[0.625,1]},{"body":"soleR","prop":"mat","when":[0.625,1]}],"dynamic":true,"loop":true},
"mountain":{"keys":[{"t":0,"v":[0,42.62,-52.03,0.81821,0.57492,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,111.64,22.88,19.08,134.6,-40,0,0,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,-1.12,1.33,5.49,4,13.16,2.19,61.99],"hands":{"L":"flat","R":"flat"}},{"t":0.0625,"v":[0,51.2,-53.88,0.75993,0.65001,0,0,-2,0,0,2,0,0,-12,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,106.67,23.87,21.29,125.21,-40,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,15.85,1.35,5.68,4,2.43,1.18,66.67],"hands":{"L":"flat","R":"flat"}},{"t":0.125,"v":[0,51.91,-53.96,0.7549,0.65584,0,0,-2,0,0,2,0,0,-12,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,72.95,17.77,19.09,101.54,-40,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,17.25,1.35,5.7,4,1.05,1.05,67.55],"hands":{"L":"flat","R":"flat"}},{"t":0.1875,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,24.85,9.75,16,60.22,0.9,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}},{"t":0.25,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}},{"t":0.3125,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,24.85,9.75,16,60.22,0.9,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.375,"v":[0,51.91,-53.96,0.7549,0.65584,0,0,-2,0,0,2,0,0,-12,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,17.25,1.35,5.7,4,1.05,1.05,67.55,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,72.95,17.77,19.09,101.54,-40,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.4375,"v":[0,51.2,-53.88,0.75993,0.65001,0,0,-2,0,0,2,0,0,-12,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,15.85,1.35,5.68,4,2.43,1.18,66.67,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,106.67,23.87,21.29,125.21,-40,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5,"v":[0,42.62,-52.03,0.81821,0.57492,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,-1.12,1.33,5.49,4,13.16,2.19,61.99,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,111.64,22.88,19.08,134.6,-40,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.5625,"v":[0,51.2,-53.88,0.75993,0.65001,0,0,-2,0,0,2,0,0,-12,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,15.85,1.35,5.68,4,2.43,1.18,66.67,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,106.67,23.87,21.29,125.21,-40,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.625,"v":[0,51.91,-53.96,0.7549,0.65584,0,0,-2,0,0,2,0,0,-12,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,17.25,1.35,5.7,4,1.05,1.05,67.55,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,72.95,17.77,19.09,101.54,-40,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.6875,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,24.85,9.75,16,60.22,0.9,0,0],"hands":{"L":"flat","R":"flat"}},{"t":0.75,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}},{"t":0.8125,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,24.85,9.75,16,60.22,0.9,0,0,2,8,60.1,4.91,-10.69,26.15,83.77,-74.21,2.65,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}},{"t":0.875,"v":[0,51.91,-53.96,0.7549,0.65584,0,0,-2,0,0,2,0,0,-12,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,72.95,17.77,19.09,101.54,-40,0,0,2,8,72.03,5.36,-10.09,26.15,83.77,-74.21,2.65,17.25,1.35,5.7,4,1.05,1.05,67.55],"hands":{"L":"flat","R":"flat"}},{"t":0.9375,"v":[0,51.2,-53.88,0.75993,0.65001,0,0,-2,0,0,2,0,0,-12,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,106.67,23.87,21.29,125.21,-40,0,0,2,8,71.15,5.32,-10.13,26.15,83.77,-74.21,2.65,15.85,1.35,5.68,4,2.43,1.18,66.67],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,42.62,-52.03,0.81821,0.57492,0,0,-2,0,0,2,0,0,-12,0,0,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,111.64,22.88,19.08,134.6,-40,0,0,2,8,60.29,4.91,-10.68,26.15,83.77,-74.21,2.65,-1.12,1.33,5.49,4,13.16,2.19,61.99],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":190,"width":70,"at":[0,0,-62]}],"contacts":[{"body":"palmL","prop":"mat"},{"body":"palmR","prop":"mat"},{"body":"soleL","prop":"mat","when":[0.25,0.75]},{"body":"soleR","prop":"mat","when":[0,0.25]},{"body":"soleR","prop":"mat","when":[0.75,1]}],"dynamic":true,"loop":true},
"burpee":{"keys":[{"t":0,"v":[0,108.74,-71.77,0.99985,0.01745,0,0,0,0,0,0,0,0,-3,0,0,28.71,2.56,153.92,45.43,12.48,3.62,0,0,0,5.47,-1.15,8.4,4,-27.25,-0.68,0,28.71,2.56,153.92,45.43,12.48,3.62,0,0,0,5.47,-1.15,8.4,4,-27.25,-0.68,0],"hands":{"L":"flat","R":"flat"}},{"t":0.04,"v":[0,106.3,-71.77,0.99985,0.01745,0,0,0,0,0,0,0,0,-3,0,0,28.4,2.75,153.38,42.26,10.29,3.62,0,0,0,7.81,-0.81,8.43,9,-24.62,-0.69,8.2,28.4,2.75,153.38,42.26,10.29,3.62,0,0,0,7.81,-0.81,8.43,9,-24.62,-0.69,8.2],"hands":{"L":"flat","R":"flat"}},{"t":0.08,"v":[0,100.4,-71.77,0.99985,0.01745,0,0,0,0,0,0,0,0,-3,0,0,27.47,3.31,150.91,34.83,5.14,3.62,0,0,0,9.87,-0.52,8.47,14,-21.7,-0.71,28,27.47,3.31,150.91,34.83,5.14,3.62,0,0,0,9.87,-0.52,8.47,14,-21.7,-0.71,28],"hands":{"L":"flat","R":"flat"}},{"t":0.12,"v":[0,99.53,-71.59,0.99974,0.02275,0,0,0.6,0,0,0.48,0,0,-3.53,0,0,26.26,4,146.65,28.43,0.58,3.62,0,0,0,13.18,-0.13,8.45,19.95,-17.17,-0.73,26.69,26.26,4,146.65,28.43,0.58,3.62,0,0,0,13.18,-0.13,8.45,19.95,-17.17,-0.73,26.69],"hands":{"L":"flat","R":"flat"}},{"t":0.16,"v":[0,96.95,-71.08,0.99924,0.03886,0,0,2.4,0,0,1.92,0,0,-5.13,0,0,25.38,4.48,143.12,25.37,-1.77,3.62,0,0,0,20.24,0.74,8.84,31.98,-7.08,-0.97,23.35,25.38,4.48,143.12,25.37,-1.77,3.62,0,0,0,20.24,0.74,8.84,31.98,-7.08,-0.97,23.35],"hands":{"L":"flat","R":"flat"}},{"t":0.2,"v":[0,92.73,-70.23,0.99783,0.06586,0,0,5.35,0,0,4.28,0,0,-7.74,0,0,25.16,4.59,142.12,25.31,-2.05,3.62,0,0,0,28.89,1.84,9.49,45.57,5.39,-1.26,18.83,25.16,4.59,142.12,25.31,-2.05,3.62,0,0,0,28.89,1.84,9.49,45.57,5.39,-1.26,18.83],"hands":{"L":"flat","R":"flat"}},{"t":0.24,"v":[0,88.08,-69.3,0.99535,0.09632,0,0,8.59,0,0,6.87,0,0,-10.61,0,0,25.08,4.62,141.67,25.91,-1.85,3.62,0,0,0,36.55,2.89,10.23,56.78,17.18,-1.45,13.98,25.08,4.62,141.67,25.91,-1.85,3.62,0,0,0,36.55,2.89,10.23,56.78,17.18,-1.45,13.98],"hands":{"L":"flat","R":"flat"}},{"t":0.28,"v":[0,83.43,-68.37,0.99186,0.12735,0,0,11.83,0,0,9.46,0,0,-13.48,0,0,24.95,4.69,140.95,26.45,-1.67,3.62,0,0,0,47.42,4.71,11.18,71.59,18,-1.51,20.51,24.95,4.69,140.95,26.45,-1.67,3.62,0,0,0,47.42,4.71,11.18,71.59,18,-1.51,20.51],"hands":{"L":"flat","R":"flat"}},{"t":0.32,"v":[0,78.79,-67.44,0.98733,0.15869,0,0,15.07,0,0,12.06,0,0,-16.35,0,0,22.49,5.75,128.39,31.67,3.67,24.94,0,0,0,56.94,6.54,12.23,83.66,18,-1.66,26.47,22.49,5.75,128.39,31.67,3.67,24.94,0,0,0,56.94,6.54,12.23,83.66,18,-1.66,26.47],"hands":{"L":"flat","R":"flat"}},{"t":0.36,"v":[0,74.14,-66.51,0.98177,0.19007,0,0,18.31,0,0,14.65,0,0,-19.22,0,0,20.13,6.56,116.82,33.42,6.74,44.27,0,0,0,65.52,8.45,13.39,94.01,18,-1.87,31.64,20.13,6.56,116.82,33.42,6.74,44.27,0,0,0,65.52,8.45,13.39,94.01,18,-1.87,31.64],"hands":{"L":"flat","R":"flat"}},{"t":0.4,"v":[0,69.49,-65.57,0.97523,0.22118,0,0,21.55,0,0,17.24,0,0,-22.09,0,0,18.28,7.03,108.08,33.38,8.11,57.53,2.65,-2.19,0,73.44,10.51,14.7,103.27,18,-2.14,36.32,18.28,7.03,108.08,33.38,8.11,57.53,2.65,-2.19,0,73.44,10.51,14.7,103.27,18,-2.14,36.32],"hands":{"L":"flat","R":"flat"}},{"t":0.44,"v":[0,64.85,-64.64,0.96779,0.25177,0,0,24.79,0,0,19.83,0,0,-24.96,0,0,16.59,7.34,100.25,32.53,8.7,67.94,13.82,-11.43,0,80.82,12.8,16.17,111.76,18,-2.46,40.68,16.59,7.34,100.25,32.53,8.7,67.94,13.82,-11.43,0,80.82,12.8,16.17,111.76,18,-2.46,40.68],"hands":{"L":"flat","R":"flat"}},{"t":0.48,"v":[0,60.2,-63.71,0.95954,0.28157,0,0,28.03,0,0,22.43,0,0,-27.83,0,0,14.95,7.51,92.88,31.09,8.63,75.91,30.28,-25.03,0,87.72,15.36,17.84,119.7,18,-2.81,44.81,14.95,7.51,92.88,31.09,8.63,75.91,30.28,-25.03,0,87.72,15.36,17.84,119.7,18,-2.81,44.81],"hands":{"L":"flat","R":"flat"}},{"t":0.52,"v":[0,55.59,-62.79,0.95068,0.31016,0,0,31.25,0,0,25,0,0,-30.68,0,0,13.89,7.62,88.88,27.9,6.09,72.98,48.25,-39.89,0,94.08,18.23,19.72,127.14,18,-3.19,48.75,13.89,7.62,88.88,27.9,6.09,72.98,48.25,-39.89,0,94.08,18.23,19.72,127.14,18,-3.19,48.75],"hands":{"L":"flat","R":"flat"}},{"t":0.56,"v":[0,52.14,-62.1,0.94372,0.33075,0,0,33.65,0,0,26.92,0,0,-32.8,0,0,14.57,7.69,93.04,24.65,2.16,56.78,63.95,-52.87,0,98.51,20.63,21.28,132.47,18,-3.49,51.63,14.57,7.69,93.04,24.65,2.16,56.78,63.95,-52.87,0,98.51,20.63,21.28,132.47,18,-3.49,51.63],"hands":{"L":"flat","R":"flat"}},{"t":0.6,"v":[0,50.42,-61.75,0.94014,0.34078,0,0,34.85,0,0,27.88,0,0,-33.87,0,0,16.25,7.6,101.62,21.43,-1.78,36.29,73.62,-60.86,0,100.61,21.92,22.12,135.07,18,-3.65,53.05,16.25,7.6,101.62,21.43,-1.78,36.29,73.62,-60.86,0,100.61,21.92,22.12,135.07,18,-3.65,53.05],"hands":{"L":"flat","R":"flat"}},{"t":0.64,"v":[0,50.21,-61.71,0.93969,0.34202,0,0,35,0,0,28,0,0,-34,0,0,4,12,103.69,16.58,-0.13,32.86,73.84,-55.67,-3.63,105.07,10.1,11.11,135.66,14.11,0,56,4,12,103.69,16.58,-0.13,32.86,73.84,-55.67,-3.63,105.07,10.1,11.11,135.66,14.11,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.68,"v":[0,51.99,-61.73,0.9312,0.3645,0,0,34.72,0,0,27.81,0,0,-33.84,0,0,3.99,11.97,105.73,17.09,0.34,32.89,73.84,-55.81,-3.63,101.31,10.42,11.14,135.23,14.06,0,56,3.99,11.97,105.73,17.09,0.34,32.89,73.84,-55.81,-3.63,101.31,10.42,11.14,135.23,14.06,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.72,"v":[0,56.37,-60.8,0.89686,0.44231,0,0,31.11,0,0,25.27,0,0,-31.69,0,0,3.79,11.58,107.24,17.47,0.85,33.14,73.83,-57.56,-3.48,89.74,11.58,11.56,130.73,13.93,0,56,3.79,11.58,107.24,17.47,0.85,33.14,73.83,-57.56,-3.48,89.74,11.58,11.56,130.73,13.93,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.76,"v":[0,59.1,-58.79,0.84441,0.53569,0,0,22.77,0,0,19.4,0,0,-26.73,0,0,3.34,10.68,101.84,15.93,-0.21,32.71,73.5,-61.66,-2.86,77.15,11.73,11.74,118.42,13.78,0,56,3.34,10.68,101.84,15.93,-0.21,32.71,73.5,-61.66,-2.86,77.15,11.73,11.74,118.42,13.78,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.8,"v":[0,57.84,-56.86,0.79979,0.60027,0,0,12.7,0,0,12.33,0,0,-20.74,0,0,2.79,9.59,91.17,13.48,-2.3,30.63,72.39,-66.55,-1.49,65.2,9.41,10.25,100.63,13.62,0,56,2.79,9.59,91.17,13.48,-2.3,30.63,72.39,-66.55,-1.49,65.2,9.41,10.25,100.63,13.62,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.84,"v":[0,52.52,-55.05,0.78399,0.62077,0,0,3.66,0,0,5.98,0,0,-15.37,0,0,2.31,8.61,78.19,11.22,-4.56,26.9,70.18,-71.01,0.92,48.56,6.21,7.88,77.23,13.46,0,56,2.31,8.61,78.19,11.22,-4.56,26.9,70.18,-71.01,0.92,48.56,6.21,7.88,77.23,13.46,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.88,"v":[0,45.68,-53.02,0.80162,0.59784,0,0,-1.34,0,0,2.46,0,0,-12.39,0,0,2.04,8.07,66.98,9.79,-6.19,23.69,67.87,-73.66,3.35,23.79,3.42,6,44.11,13.31,0,56,2.04,8.07,66.98,9.79,-6.19,23.69,67.87,-73.66,3.35,23.79,3.42,6,44.11,13.31,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.92,"v":[0,42.6,-52.03,0.81836,0.57471,0,0,-2,0,0,2,0,0,-12,0,0,2,8,62.75,9.43,-6.66,23.18,67.46,-74.03,3.77,1.64,1.6,5.47,9.63,13.25,0,56,2,8,62.75,9.43,-6.66,23.18,67.46,-74.03,3.77,1.64,1.6,5.47,9.63,13.25,0,56],"hands":{"L":"flat","R":"flat"}},{"t":0.96,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,62.59,9.42,-6.67,23.18,67.46,-74.03,3.77,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,62.59,9.42,-6.67,23.18,67.46,-74.03,3.77,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}},{"t":1,"v":[0,42.48,-51.99,0.81915,0.57358,0,0,-2,0,0,2,0,0,-12,0,0,2,8,62.59,9.42,-6.67,23.18,67.46,-74.03,3.77,-1.41,1.33,5.48,4,13.24,2.2,62,2,8,62.59,9.42,-6.67,23.18,67.46,-74.03,3.77,-1.41,1.33,5.48,4,13.24,2.2,62],"hands":{"L":"flat","R":"flat"}}],"equipment":[{"type":"mat","id":"mat","len":200,"width":80,"at":[0,0,-72]}],"contacts":[{"body":"soleL","prop":"mat","when":[0.08,0.64]},{"body":"soleR","prop":"mat","when":[0.08,0.64]},{"body":"soleL","prop":"mat","when":[0.93,1]},{"body":"soleR","prop":"mat","when":[0.93,1]},{"body":"palmL","prop":"mat","when":[0.62,1]},{"body":"palmR","prop":"mat","when":[0.62,1]}],"dynamic":true},
"bike":{"keys":[{"t":0,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,86.46,17.73,11.67,112.94,13.9,-2.28,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,38.85,6.52,11.34,31,-11.32,-1.72,0],"hands":{"L":"grip","R":"grip"}},{"t":0.0625,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,89.63,17.26,12.15,107.67,9.27,-2.6,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,39.71,7.61,11.53,40.71,-6.34,-1.77,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,87.91,15.96,12.45,98,5.23,-2.78,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,43.26,9.3,11.7,54.81,0.24,-1.85,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1875,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,82.04,13.99,12.38,85.23,1.8,-2.72,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,48.24,11.25,11.79,69.94,6.95,-1.92,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,73.26,11.73,12.04,70.62,-1.58,-2.49,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,54.37,13.25,11.77,84.52,12.96,-1.92,0],"hands":{"L":"grip","R":"grip"}},{"t":0.3125,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,62.82,9.56,11.65,55.34,-5.37,-2.19,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,61.75,15.09,11.63,97.38,17.4,-1.87,0],"hands":{"L":"grip","R":"grip"}},{"t":0.375,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,52.07,7.73,11.36,41.05,-9.4,-1.93,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,70.31,16.55,11.44,107.26,19.24,-1.86,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4375,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,43.07,6.55,11.26,31.12,-12.28,-1.77,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,79.25,17.46,11.39,112.8,17.83,-1.98,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,38.85,6.52,11.34,31,-11.32,-1.72,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,86.46,17.73,11.67,112.94,13.9,-2.28,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5625,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,39.71,7.61,11.53,40.71,-6.34,-1.77,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,89.63,17.26,12.15,107.67,9.27,-2.6,0],"hands":{"L":"grip","R":"grip"}},{"t":0.625,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,43.26,9.3,11.7,54.81,0.24,-1.85,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,87.91,15.96,12.45,98,5.23,-2.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6875,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,48.24,11.25,11.79,69.94,6.95,-1.92,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,82.04,13.99,12.38,85.23,1.8,-2.72,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,54.37,13.25,11.77,84.52,12.96,-1.92,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,73.26,11.73,12.04,70.62,-1.58,-2.49,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8125,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,61.75,15.09,11.63,97.38,17.4,-1.87,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,62.82,9.56,11.65,55.34,-5.37,-2.19,0],"hands":{"L":"grip","R":"grip"}},{"t":0.875,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,70.31,16.55,11.44,107.26,19.24,-1.86,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,52.07,7.73,11.36,41.05,-9.4,-1.93,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9375,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,79.25,17.46,11.39,112.8,17.83,-1.98,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,43.07,6.55,11.26,31.12,-12.28,-1.77,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,108.75,-17,0.98769,0.15643,0,0,12,0,0,12,0,0,-23.1,0,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,86.46,17.73,11.67,112.94,13.9,-2.28,0,2,8,79.01,25.59,-25.18,41.98,48.28,-5.88,-10.98,38.85,6.52,11.34,31,-11.32,-1.72,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"uprightBike","id":"bike","bbY":30,"saddle":[98.7519758044482,-31],"bar":[22,112.34900324661797,59.610907757845304]},{"type":"bikeCrank","id":"crank","axle":[0,30,0],"armX":8.2,"mountTo":"bike:axle"}],"contacts":[{"body":"buttocks","prop":"bike:saddle"},{"body":"soleL","prop":"crank:pedalL"},{"body":"soleR","prop":"crank:pedalR"},{"body":"gripL","prop":"bike:bar"},{"body":"gripR","prop":"bike:bar"}],"gripRadius":{"L":1.6,"R":1.6},"loop":true},
"treadmill":{"keys":[{"t":0,"v":[0,114.4,-24,0.99802,0.0523,-0.03485,0.00183,0,0,0,2,0,6.4,-8,0,-2,0,-4,-22,13,-14,92,15,8,0,21,1.9,10.9,15.74,-5.31,-1.65,6,0,4,46,13,-14,92,15,8,0,10.71,5.45,3.41,75.82,-13.06,0,0.84],"hands":{"L":"fist","R":"fist"}},{"t":0.05,"v":[0,112.64,-24,0.99808,0.05231,-0.03315,0.00174,0,0,0,2,0,6.09,-8,0,-1.9,0,-3.8,-20.34,13,-14,94.47,15,8,0,19.56,2.25,10.7,24.15,10.12,-0.33,0.29,0,3.8,44.34,13,-14,89.53,15,8,0,22.53,5.61,3.11,93.51,-11.73,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.1,"v":[0,110.87,-24,0.99823,0.05232,-0.0282,0.00148,0,0,0,2,0,5.18,-8,0,-1.62,0,-3.24,-15.51,13,-14,96.7,15,8,0,20.58,2.9,10.17,36.22,18,-0.11,3.38,0,3.24,39.51,13,-14,87.3,15,8,0,35.89,5.36,3.3,106.51,-8.99,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.15,"v":[0,109.78,-24,0.99842,0.05232,-0.02049,0.00107,0,0,0,2,0,3.76,-8,0,-1.18,0,-2.35,-7.98,13,-14,98.47,15,8,0,20.69,3.26,9.3,45.6,18,-0.68,12.67,0,2.35,31.98,13,-14,85.53,15,8,0,48.45,5.26,4.19,110.94,-6.26,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.2,"v":[0,109.78,-24,0.99857,0.05233,-0.01077,0.00056,0,0,0,2,0,1.98,-8,0,-0.62,0,-1.24,1.49,13,-14,99.61,15,8,0,15.01,2.8,8.23,44.05,18,-0.61,16.86,0,1.24,22.51,13,-14,84.39,15,8,0,58.02,5.67,5.75,106.23,-3.52,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.25,"v":[0,110.87,-24,0.99863,0.05234,0,0,0,0,0,2,0,0,-8,0,0,0,0,12,13,-14,100,15,8,0,5.57,2.08,7.16,34.5,15.14,-0.38,19.68,0,0,12,13,-14,84,15,8,0,58.72,6.26,7.34,94.87,-0.79,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.3,"v":[0,112.64,-24,0.99857,0.05233,0.01077,-0.00056,0,0,0,2,0,-1.98,-8,0,0.62,0,1.24,22.51,13,-14,99.61,15,8,0,3.58,2.22,6.03,35.15,-2.44,-2.68,40.09,0,-1.24,1.49,13,-14,84.39,15,8,0,50.37,6.12,8.55,77.97,1.95,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.35,"v":[0,114.4,-24,0.99842,0.05232,0.02049,-0.00107,0,0,0,2,0,-3.76,-8,0,1.18,0,2.35,31.98,13,-14,98.47,15,8,0,-7.14,1.75,5.2,19.84,-16.82,0,50,0,-2.35,-7.98,13,-14,85.53,15,8,0,38.8,5.13,9.53,57.37,3.26,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.4,"v":[0,115.49,-24,0.99823,0.05232,0.0282,-0.00148,0,0,0,2,0,-5.18,-8,0,1.62,0,3.24,39.51,13,-14,96.7,15,8,0,-0.76,3.09,4.33,39.29,-19.42,0,38.71,0,-3.24,-15.51,13,-14,87.3,15,8,0,29.81,3.84,10.33,38.38,-1.87,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.45,"v":[0,115.49,-24,0.99808,0.05231,0.03315,-0.00174,0,0,0,2,0,-6.09,-8,0,1.9,0,3.8,44.34,13,-14,94.47,15,8,0,3.92,4.54,3.81,58.78,-16.77,0,16.5,0,-3.8,-20.34,13,-14,89.53,15,8,0,23.37,2.54,10.82,22.75,-6.53,0,0],"hands":{"L":"fist","R":"fist"}},{"t":0.5,"v":[0,114.4,-24,0.99802,0.0523,0.03485,-0.00183,0,0,0,2,0,-6.4,-8,0,2,0,4,46,13,-14,92,15,8,0,10.71,5.45,3.41,75.82,-13.06,0,0.84,0,-4,-22,13,-14,92,15,8,0,21,1.9,10.9,15.74,-5.31,-1.65,6],"hands":{"L":"fist","R":"fist"}},{"t":0.55,"v":[0,112.64,-24,0.99808,0.05231,0.03315,-0.00174,0,0,0,2,0,-6.09,-8,0,1.9,0,3.8,44.34,13,-14,89.53,15,8,0,22.53,5.61,3.11,93.51,-11.73,0,0,0,-3.8,-20.34,13,-14,94.47,15,8,0,19.56,2.25,10.7,24.15,10.12,-0.33,0.29],"hands":{"L":"fist","R":"fist"}},{"t":0.6,"v":[0,110.87,-24,0.99823,0.05232,0.0282,-0.00148,0,0,0,2,0,-5.18,-8,0,1.62,0,3.24,39.51,13,-14,87.3,15,8,0,35.89,5.36,3.3,106.51,-8.99,0,0,0,-3.24,-15.51,13,-14,96.7,15,8,0,20.58,2.9,10.17,36.22,18,-0.11,3.38],"hands":{"L":"fist","R":"fist"}},{"t":0.65,"v":[0,109.78,-24,0.99842,0.05232,0.02049,-0.00107,0,0,0,2,0,-3.76,-8,0,1.18,0,2.35,31.98,13,-14,85.53,15,8,0,48.45,5.26,4.19,110.94,-6.26,0,0,0,-2.35,-7.98,13,-14,98.47,15,8,0,20.69,3.26,9.3,45.6,18,-0.68,12.67],"hands":{"L":"fist","R":"fist"}},{"t":0.7,"v":[0,109.78,-24,0.99857,0.05233,0.01077,-0.00056,0,0,0,2,0,-1.98,-8,0,0.62,0,1.24,22.51,13,-14,84.39,15,8,0,58.02,5.67,5.75,106.23,-3.52,0,0,0,-1.24,1.49,13,-14,99.61,15,8,0,15.01,2.8,8.23,44.05,18,-0.61,16.86],"hands":{"L":"fist","R":"fist"}},{"t":0.75,"v":[0,110.87,-24,0.99863,0.05234,0,0,0,0,0,2,0,0,-8,0,0,0,0,12,13,-14,84,15,8,0,58.72,6.26,7.34,94.87,-0.79,0,0,0,0,12,13,-14,100,15,8,0,5.57,2.08,7.16,34.5,15.14,-0.38,19.68],"hands":{"L":"fist","R":"fist"}},{"t":0.8,"v":[0,112.64,-24,0.99857,0.05233,-0.01077,0.00056,0,0,0,2,0,1.98,-8,0,-0.62,0,-1.24,1.49,13,-14,84.39,15,8,0,50.37,6.12,8.55,77.97,1.95,0,0,0,1.24,22.51,13,-14,99.61,15,8,0,3.58,2.22,6.03,35.15,-2.44,-2.68,40.09],"hands":{"L":"fist","R":"fist"}},{"t":0.85,"v":[0,114.4,-24,0.99842,0.05232,-0.02049,0.00107,0,0,0,2,0,3.76,-8,0,-1.18,0,-2.35,-7.98,13,-14,85.53,15,8,0,38.8,5.13,9.53,57.37,3.26,0,0,0,2.35,31.98,13,-14,98.47,15,8,0,-7.14,1.75,5.2,19.84,-16.82,0,50],"hands":{"L":"fist","R":"fist"}},{"t":0.9,"v":[0,115.49,-24,0.99823,0.05232,-0.0282,0.00148,0,0,0,2,0,5.18,-8,0,-1.62,0,-3.24,-15.51,13,-14,87.3,15,8,0,29.81,3.84,10.33,38.38,-1.87,0,0,0,3.24,39.51,13,-14,96.7,15,8,0,-0.76,3.09,4.33,39.29,-19.42,0,38.71],"hands":{"L":"fist","R":"fist"}},{"t":0.95,"v":[0,115.49,-24,0.99808,0.05231,-0.03315,0.00174,0,0,0,2,0,6.09,-8,0,-1.9,0,-3.8,-20.34,13,-14,89.53,15,8,0,23.37,2.54,10.82,22.75,-6.53,0,0,0,3.8,44.34,13,-14,94.47,15,8,0,3.92,4.54,3.81,58.78,-16.77,0,16.5],"hands":{"L":"fist","R":"fist"}},{"t":1,"v":[0,114.4,-24,0.99802,0.0523,-0.03485,0.00183,0,0,0,2,0,6.4,-8,0,-2,0,-4,-22,13,-14,92,15,8,0,21,1.9,10.9,15.74,-5.31,-1.65,6,0,4,46,13,-14,92,15,8,0,10.71,5.45,3.41,75.82,-13.06,0,0.84],"hands":{"L":"fist","R":"fist"}}],"equipment":[{"type":"treadmill","id":"tm","deckH":20}],"contacts":[{"body":"soleL","prop":"tm:belt","when":[0,0.35]},{"body":"soleR","prop":"tm:belt","when":[0.5,0.85]}],"loop":true},
"rower":{"keys":[{"t":0,"v":[0,46,35.65,0.99569,0.09272,0,0,11.52,0,0,10.84,0,0,-29.2,0,0,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,124.76,15.72,14.5,108,12.7,-3.63,22,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,124.76,15.72,14.5,108,12.7,-3.63,22],"hands":{"L":"grip","R":"grip"}},{"t":0.1,"v":[0,46,32.83,0.99569,0.09272,0,0,11.52,0,0,10.84,0,0,-29.2,0,0,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,122.71,14.72,14.06,103.06,14.28,-3.31,17.64,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,122.71,14.72,14.06,103.06,14.28,-3.31,17.64],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,46,25.85,0.99569,0.09272,0,0,11.52,0,0,10.84,0,0,-29.2,0,0,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,117.53,12.35,13.08,89.9,15.53,-2.66,8.66,4,14,81.37,12.06,-17.62,32.31,64.41,-0.01,-5.73,117.53,12.35,13.08,89.9,15.53,-2.66,8.66],"hands":{"L":"grip","R":"grip"}},{"t":0.3,"v":[0,46,16.9,0.99576,0.09199,0,0,11.44,0,0,10.78,0,0,-29,0,0,4,14,81.15,12.04,-17.64,32.31,64.41,-0.01,-5.73,110.21,9.37,11.87,70.9,11.48,-2.24,1.22,4,14,81.15,12.04,-17.64,32.31,64.41,-0.01,-5.73,110.21,9.37,11.87,70.9,11.48,-2.24,1.22],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,46,8.17,0.99753,0.07019,0,0,9.2,0,0,8.93,0,0,-23.07,0,0,4,14,74.66,11.33,-18.45,32.31,64.41,-0.01,-5.73,99.49,6.17,10.48,49.13,-0.56,-2.57,0,4,14,74.66,11.33,-18.45,32.31,64.41,-0.01,-5.73,99.49,6.17,10.48,49.13,-0.56,-2.57,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,46,1.85,0.99955,0.02987,0,0,5.06,0,0,5.52,0,0,-12.11,0,0,4,14,62.65,10.31,-19.76,32.31,64.41,-0.01,-5.73,84.19,3.02,8.98,24.34,-14.43,-2.88,0,4,14,62.65,10.31,-19.76,32.31,64.41,-0.01,-5.73,84.19,3.02,8.98,24.34,-14.43,-2.88,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,46,0,0.99992,-0.01292,0,0,0.68,0,0,1.91,0,0,-0.49,0,0,3.79,13.04,44.41,11.28,-19.81,41.39,65.1,0.01,-7.61,71.55,1.31,8.11,8,-22.93,-2.96,0,3.79,13.04,44.41,11.28,-19.81,41.39,65.1,0.01,-7.61,71.55,1.31,8.11,8,-22.93,-2.96,0],"hands":{"L":"grip","R":"grip"}},{"t":0.7,"v":[0,46,0,0.99912,-0.04202,0,0,-2.31,0,0,-0.55,0,0,7.41,0,0,2.44,6.74,14.04,15.53,-16.56,73.73,69.6,-0.03,-12.68,68.22,1.27,8.07,8,-22.93,-2.96,0,2.44,6.74,14.04,15.53,-16.56,73.73,69.6,-0.03,-12.68,68.22,1.27,8.07,8,-22.93,-2.96,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,46,0,0.99892,-0.04641,0,0,-2.76,0,0,-0.92,0,0,8.6,0,0,0.5,-2.32,-10.19,16.89,-11.79,101.18,75.1,0.04,-12.88,67.71,1.27,8.07,8,-22.93,-2.96,0,0.5,-2.32,-10.19,16.89,-11.79,101.18,75.1,0.04,-12.88,67.71,1.27,8.07,8,-22.93,-2.96,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9,"v":[0,46,0,0.99892,-0.04641,0,0,-2.76,0,0,-0.92,0,0,8.6,0,0,-1.24,-10.47,-29.09,16.21,-6.77,118.91,77.54,-0.03,-9.65,67.71,1.27,8.07,8,-22.93,-2.96,0,-1.24,-10.47,-29.09,16.21,-6.77,118.91,77.54,-0.03,-9.65,67.71,1.27,8.07,8,-22.93,-2.96,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,46,0,0.99892,-0.04641,0,0,-2.76,0,0,-0.92,0,0,8.6,0,0,-2,-14,-37.18,15.76,-4.25,125.32,77.51,-0.04,-7.75,67.71,1.27,8.07,8,-22.93,-2.96,0,-2,-14,-37.18,15.76,-4.25,125.32,77.51,-0.04,-7.75,67.71,1.27,8.07,8,-22.93,-2.96,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"rowerErg","id":"row","railTop":27,"plate":[9.5,18,95.82014630101185],"beta":42,"exit":[0,54.90922912624386,127.82014630101185],"railRear":-70},{"type":"rowerSeat","id":"seat","top":36,"railTop":27,"shift":-13,"mountTo":"row:rail"},{"type":"rowerChain","id":"chain","exit":[0,54.90922912624386,127.82014630101185],"mountTo":"row:chainGuide"}],"contacts":[{"body":"buttocks","prop":"seat"},{"body":"soleL","prop":"row:plateL"},{"body":"soleR","prop":"row:plateR"},{"body":"gripL","prop":"chain"},{"body":"gripR","prop":"chain"}],"gripRadius":{"L":1.8,"R":1.8}},
"elliptical":{"keys":[{"t":0,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,2.43,22.72,-15.19,84.43,-25.72,-0.04,-4.7,41.13,6.04,5.35,70,18,0.84,18.02,0,0,21.8,20.34,-15.11,69.62,-28.67,-0.03,-17.35,9.56,2.8,5.92,12.55,-9.16,0.5,0],"hands":{"L":"grip","R":"grip"}},{"t":0.0625,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,-7.5,23.59,-17.83,85.18,-23.14,0.01,10.08,42.68,5.62,5.45,63.23,18,1.17,8.92,0,0,28.15,19.08,-15.9,62.14,-28.98,-0.03,-18.7,3.8,2.8,6.08,12.03,-3.23,1.13,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,-10.92,23.84,-20,82.42,-21.91,0.02,19.27,40.78,5.01,5.57,52.52,15.93,1.4,0,0,0,32.66,17.97,-16.64,56.14,-29.01,-0.03,-18.94,0.05,2.96,6.26,14.3,4.78,1.9,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1875,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,-10.92,23.84,-20,82.42,-21.91,0.02,19.28,39.35,4.57,5.65,44.57,6.25,0.75,0,0,0,35.08,17.3,-17.1,52.67,-28.95,-0.03,-18.82,-0.13,3.39,6.33,20.88,14.55,2.69,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,-8.54,23.68,-18.35,84.67,-22.8,0.02,12.42,35.34,4.06,5.69,35.59,-2.42,0.26,0,0,0,35.04,17.31,-17.09,52.74,-28.96,-0.03,-18.82,10.17,4.71,6.04,42.62,18,1.94,11.63],"hands":{"L":"grip","R":"grip"}},{"t":0.3125,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,-3.19,23.22,-16.3,85.8,-24.37,-0.05,2.42,29.54,3.57,5.71,26.82,-9.02,-0.04,0,0,0,32.19,18.1,-16.56,56.79,-29.01,-0.03,-18.94,19.36,5.56,5.75,57.3,18,1.19,20.87],"hands":{"L":"grip","R":"grip"}},{"t":0.375,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,4.82,22.5,-14.92,83.35,-26.23,-0.04,-7.11,22.82,3.17,5.74,19.55,-12.62,-0.1,0,0,0,26.11,19.52,-15.61,64.67,-28.92,-0.03,-18.4,28.1,6.03,5.5,66.77,18,0.79,24.83],"hands":{"L":"grip","R":"grip"}},{"t":0.4375,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,13.75,21.53,-14.62,77.33,-27.79,-0.03,-13.82,16,2.92,5.8,14.81,-12.6,0.08,0,0,0,15.9,21.25,-14.69,75.48,-28.08,-0.03,-14.97,35.84,6.18,5.35,71.17,18,0.7,23.69],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,21.8,20.34,-15.11,69.62,-28.67,-0.03,-17.35,9.56,2.8,5.92,12.55,-9.16,0.5,0,0,0,2.43,22.72,-15.19,84.43,-25.72,-0.04,-4.7,41.13,6.04,5.35,70,18,0.84,18.02],"hands":{"L":"grip","R":"grip"}},{"t":0.5625,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,28.15,19.08,-15.9,62.14,-28.98,-0.03,-18.7,3.8,2.8,6.08,12.03,-3.23,1.13,0,0,0,-7.5,23.59,-17.83,85.18,-23.14,0.01,10.08,42.68,5.62,5.45,63.23,18,1.17,8.92],"hands":{"L":"grip","R":"grip"}},{"t":0.625,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,32.66,17.97,-16.64,56.14,-29.01,-0.03,-18.94,0.05,2.96,6.26,14.3,4.78,1.9,0,0,0,-10.92,23.84,-20,82.42,-21.91,0.02,19.27,40.78,5.01,5.57,52.52,15.93,1.4,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6875,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,35.08,17.3,-17.1,52.67,-28.95,-0.03,-18.82,-0.13,3.39,6.33,20.88,14.55,2.69,0,0,0,-10.92,23.84,-20,82.42,-21.91,0.02,19.28,39.35,4.57,5.65,44.57,6.25,0.75,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,35.04,17.31,-17.09,52.74,-28.96,-0.03,-18.82,10.17,4.71,6.04,42.62,18,1.94,11.63,0,0,-8.54,23.68,-18.35,84.67,-22.8,0.02,12.42,35.34,4.06,5.69,35.59,-2.42,0.26,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8125,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,32.19,18.1,-16.56,56.79,-29.01,-0.03,-18.94,19.36,5.56,5.75,57.3,18,1.19,20.87,0,0,-3.19,23.22,-16.3,85.8,-24.37,-0.05,2.42,29.54,3.57,5.71,26.82,-9.02,-0.04,0],"hands":{"L":"grip","R":"grip"}},{"t":0.875,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,26.11,19.52,-15.61,64.67,-28.92,-0.03,-18.4,28.1,6.03,5.5,66.77,18,0.79,24.83,0,0,4.82,22.5,-14.92,83.35,-26.23,-0.04,-7.11,22.82,3.17,5.74,19.55,-12.62,-0.1,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9375,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,15.9,21.25,-14.69,75.48,-28.08,-0.03,-14.97,35.84,6.18,5.35,71.17,18,0.7,23.69,0,0,13.75,21.53,-14.62,77.33,-27.79,-0.03,-13.82,16,2.92,5.8,14.81,-12.6,0.08,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,119.48,-49.54,0.99939,0.0349,0,0,0,0,0,0,0,0,-4,0,0,0,0,2.43,22.72,-15.19,84.43,-25.72,-0.04,-4.7,41.13,6.04,5.35,70,18,0.84,18.02,0,0,21.8,20.34,-15.11,69.62,-28.67,-0.03,-17.35,9.56,2.8,5.92,12.55,-9.16,0.5,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"elliptical","id":"ell","axle":[42,40],"pivot":[19,95,0],"trackY":8,"trackZ":[-117.905183467396,-52.71290154081732],"barX":12},{"type":"ellipticalLinks","id":"link","axle":[42,40],"barLen":128,"frac":0.3,"standoff":9,"delta":20,"armX":8.5,"pivot":[19,95,0],"lever":60,"upper":30,"grip":12,"bend":52,"linkAt":30,"mountTo":"ell:axle","mountHub":"ell:hub"}],"contacts":[{"body":"soleL","prop":"link:pedalL"},{"body":"soleR","prop":"link:pedalR"},{"body":"gripL","prop":"link:handleL"},{"body":"gripR","prop":"link:handleR"}],"gripRadius":{"L":1.9,"R":1.9},"loop":true},
"stairs":{"keys":[{"t":0,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,66.03,6.67,7.76,75.3,19,-0.51,1.87,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,28.33,1.73,7.04,8.33,-8.09,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.0625,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,64.92,6.53,7.73,73.75,19,-0.47,1.44,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,32.59,2.28,7.1,16.72,-4,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.125,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,61.64,6.1,7.64,69,18.99,-0.35,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,39.25,3.15,7.21,29.63,2.2,-0.26,0],"hands":{"L":"grip","R":"grip"}},{"t":0.1875,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,57.4,5.55,7.54,62.27,16.54,-0.3,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,45.87,4.02,7.32,42.1,8,-0.25,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,52.02,4.84,7.43,53.17,12.86,-0.27,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,52.02,4.84,7.43,53.17,12.86,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.3125,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,45.87,4.02,7.32,42.1,8,-0.25,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,57.4,5.55,7.54,62.27,16.54,-0.3,0],"hands":{"L":"grip","R":"grip"}},{"t":0.375,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,39.25,3.15,7.21,29.63,2.2,-0.26,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,61.64,6.1,7.64,69,18.99,-0.35,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4375,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,32.59,2.28,7.1,16.72,-4,-0.27,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,64.92,6.53,7.73,73.75,19,-0.47,1.44],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,28.33,1.73,7.04,8.33,-8.09,-0.27,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,66.03,6.67,7.76,75.3,19,-0.51,1.87],"hands":{"L":"grip","R":"grip"}},{"t":0.5625,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,32.59,2.28,7.1,16.72,-4,-0.27,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,64.92,6.53,7.73,73.75,19,-0.47,1.44],"hands":{"L":"grip","R":"grip"}},{"t":0.625,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,39.25,3.15,7.21,29.63,2.2,-0.26,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,61.64,6.1,7.64,69,18.99,-0.35,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6875,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,45.87,4.02,7.32,42.1,8,-0.25,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,57.4,5.55,7.54,62.27,16.54,-0.3,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,52.02,4.84,7.43,53.17,12.86,-0.27,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,52.02,4.84,7.43,53.17,12.86,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8125,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,57.4,5.55,7.54,62.27,16.54,-0.3,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,45.87,4.02,7.32,42.1,8,-0.25,0],"hands":{"L":"grip","R":"grip"}},{"t":0.875,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,61.64,6.1,7.64,69,18.99,-0.35,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,39.25,3.15,7.21,29.63,2.2,-0.26,0],"hands":{"L":"grip","R":"grip"}},{"t":0.9375,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,64.92,6.53,7.73,73.75,19,-0.47,1.44,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,32.59,2.28,7.1,16.72,-4,-0.27,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,108.74,-67.08,0.99452,0.10453,0,0,0,0,0,3,0,0,-10,0,0,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,66.03,6.67,7.76,75.3,19,-0.51,1.87,0,0,-13.94,34.12,-22.78,70.87,-38.4,-0.02,-13.56,28.33,1.73,7.04,8.33,-8.09,-0.27,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"stepper","id":"stp","pivot":[11.5,16,34],"railY":103,"railX":29,"railZ":-95.07603668193913},{"type":"stepPedals","id":"step","pivot":[11.5,16,34],"dampZ":-85.07603668193913,"mountTo":"stp:pivotAxle","mountDamp":"stp:dampBase"}],"contacts":[{"body":"soleL","prop":"step:pedalL"},{"body":"soleR","prop":"step:pedalR"},{"body":"gripL","prop":"stp:railL"},{"body":"gripR","prop":"stp:railR"}],"gripRadius":{"L":2,"R":2},"loop":true},
"bbbench":{"keys":[{"t":0,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,67.44,47.12,-39.6,19.4,14.35,-11.52,16.58,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,67.44,47.12,-39.6,19.4,14.35,-11.52,16.58,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,43.98,61.52,-24.03,53.18,17.74,-12.01,2.84,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,43.98,61.52,-24.03,53.18,17.74,-12.01,2.84,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,5.24,69.69,-3.66,92.2,21.53,-11.92,-6.28,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,5.24,69.69,-3.66,92.2,21.53,-11.92,-6.28,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,-32.18,63.99,14.89,115.13,21.74,-12.02,-0.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,-32.18,63.99,14.89,115.13,21.74,-12.02,-0.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,55.14,-24,0,0,0.74278,0.66954,-5,0,0,-9,0,0,12.03,0,0,-4,-14,-47.95,57.27,23.55,120.92,20.95,-11.91,5.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0,-4,-14,-47.95,57.27,23.55,120.92,20.95,-11.91,5.83,1.13,23.97,7.01,84.29,-1.37,-4.82,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"benchUprights","id":"rack","z":47,"hook":107},{"type":"barbell","id":"bar","plates":[20,5]}],"contacts":[{"body":"back","prop":"bench:pad"},{"body":"headBack","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"dbrow":{"keys":[{"t":0,"v":[7.8,91.8,-24,0.72537,0.68835,0,0,0,0,0,-3,0,0,-8,0,0,-2,12,70.81,13.62,-17.02,33.95,0,0,0,85.69,17.54,27.35,16.36,12.67,10.97,0,0,4,67.05,11.76,-13.83,55.27,85.34,-53.04,20.58,87,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.25,"v":[7.8,91.8,-24,0.72537,0.68835,0,0,0,0,0,-3,0,1.03,-8,0,0,-1.12,7.9,53.85,18.98,-13.12,57.93,-2.64,0,0,85.69,17.54,27.35,16.36,12.67,10.97,0,0,4,66.2,13.19,-12.62,56.69,85.39,-52.25,20.5,87,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.5,"v":[7.8,91.8,-24,0.72537,0.68835,0,0,0,0,0,-3,0,3.5,-8,0,0,1,-2,18.21,26.08,-6.93,95.13,-9,0,0,85.69,17.54,27.35,16.36,12.67,10.97,0,0,4,64.11,16.49,-9.71,59.97,85.5,-50.42,20.33,87,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":0.75,"v":[7.8,91.8,-24,0.72537,0.68835,0,0,0,0,0,-3,0,5.97,-8,0,0,3.12,-11.9,-29.83,28.74,2,121.12,-15.36,0,0,85.69,17.54,27.35,16.36,12.67,10.97,0,0,4,61.95,19.6,-6.83,63.08,85.59,-48.68,20.18,87,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}},{"t":1,"v":[7.8,91.8,-24,0.72537,0.68835,0,0,0,0,0,-3,0,7,-8,0,0,4,-16,-51.15,26.76,6.86,123.58,-18,0,0,85.69,17.54,27.35,16.36,12.67,10.97,0,0,4,61.03,20.84,-5.65,64.32,85.62,-47.98,20.12,87,0,0,88.69,-44,0,0],"hands":{"L":"grip","R":"flat"}}],"equipment":[{"type":"flatBench","id":"bench"},{"type":"dumbbell","id":"db","hand":"L"}],"contacts":[{"body":"kneeR","prop":"bench:pad"},{"body":"palmR","prop":"bench:pad"},{"body":"soleL","prop":"floor"},{"body":"gripL","prop":"db"}],"gripRadius":{"L":1.6,"R":1.4}},
"invrow":{"keys":[{"t":0,"v":[0,38.21,-64.24,0,0,0.81515,0.57925,0,0,0,0,0,0,0,0,0,4,10,44.17,22.78,-15.46,44,58.65,0.01,-0.93,0,3,0,0,-12,0,0,4,10,44.17,22.78,-15.46,44,58.65,0.01,-0.93,0,3,0,0,-12,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,42.94,-65.24,0,0,0.83115,0.55604,0,0,0,0,0,0,0,0,0,3.12,6.34,30.46,26.94,-10.5,67.9,59.47,-0.01,-5.61,0,3,0,0,-12,0,0,3.12,6.34,30.46,26.94,-10.5,67.9,59.47,-0.01,-5.61,0,3,0,0,-12,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,53.76,-68.93,0,0,0.86704,0.49824,0,0,0,0,0,0,0,0,0,1,-2.5,5,30.76,-0.2,105.23,60.5,0.03,-9.15,0,3,0,0,-12,0,0,1,-2.5,5,30.76,-0.2,105.23,60.5,0.03,-9.15,0,3,0,0,-12,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,63.6,-74.36,0,0,0.89891,0.43812,0,0,0,0,0,0,0,0,0,-1.12,-11.34,-22.35,26.08,16.04,131.58,57.27,-0.09,-2.09,0,3,0,0,-12,0,0,-1.12,-11.34,-22.35,26.08,16.04,131.58,57.27,-0.09,-2.09,0,3,0,0,-12,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,67.33,-77.1,0,0,0.91091,0.41261,0,0,0,0,0,0,0,0,0,-2,-15,-34.18,16.34,29.32,139.16,53.76,-0.42,8.87,0,3,0,0,-12,0,0,-2,-15,-34.18,16.34,29.32,139.16,53.76,-0.42,8.87,0,3,0,0,-12,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","hook":98,"pullBar":false},{"type":"restingBarbell","id":"bar","c":[0,99.4,-61],"axis":[1,0,0],"plates":[],"on":"rack:hookL"}],"contacts":[{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"pullup":{"keys":[{"t":0,"v":[0,110.24,-67.61,1,0,0,0,-2,0,0,0,0,0,0,0,0,28,4,14.12,153.16,89.89,19.31,9.96,0.03,7.08,14,4,4,20,-30,0,0,28,4,14.12,153.16,89.89,19.31,9.96,0.03,7.08,14,4,4,20,-30,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.2,"v":[0,115.69,-67.16,1,0,0,0,-2.19,0,0,-1.34,0,0,-1.53,0,0,24.94,2.47,24.77,134.71,79.74,50.51,10.63,-0.01,-7.33,14.76,4,4,20.76,-30,0,0,24.94,2.47,24.77,134.71,79.74,50.51,10.63,-0.01,-7.33,14.76,4,4,20.76,-30,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.4,"v":[0,130.2,-66.24,1,0,0,0,-2.69,0,0,-4.84,0,0,-5.53,0,0,16.94,-1.53,27.6,107.23,69.64,91.15,13.32,-0.01,-22.62,16.76,4,4,22.76,-30,0,0,16.94,-1.53,27.6,107.23,69.64,91.15,13.32,-0.01,-22.62,16.76,4,4,22.76,-30,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.6,"v":[0,148.44,-65.61,1,0,0,0,-3.31,0,0,-9.16,0,0,-10.47,0,0,7.06,-6.47,18.17,77.97,63.61,123.32,16.73,0.01,-25.71,19.24,4,4,25.24,-30,0,0,7.06,-6.47,18.17,77.97,63.61,123.32,16.73,0.01,-25.71,19.24,4,4,25.24,-30,0,0],"hands":{"L":"grip","R":"grip"}},{"t":0.8,"v":[0,163.3,-65.53,1,0,0,0,-3.81,0,0,-12.66,0,0,-14.47,0,0,-0.94,-10.47,1.22,49.82,63.05,139.33,17.86,0.02,-11.96,21.24,4,4,27.24,-30,0,0,-0.94,-10.47,1.22,49.82,63.05,139.33,17.86,0.02,-11.96,21.24,4,4,27.24,-30,0,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,168.97,-65.59,1,0,0,0,-4,0,0,-14,0,0,-16,0,0,-4,-12,-6.97,37.31,63.98,142.13,18.35,-0.06,-1.62,22,4,4,28,-30,0,0,-4,-12,-6.97,37.31,63.98,142.13,18.35,-0.06,-1.62,22,4,4,28,-30,0,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"powerRack","id":"rack","pullH":224}],"contacts":[{"body":"gripL","prop":"rack:pullBar"},{"body":"gripR","prop":"rack:pullBar"}]},
"pecdeck":{"keys":[{"t":0,"v":[0,56.68,7.15,0,0,1,0,0,0,0,0,0,0,0,0,0,2,-12,-55.75,45.73,68.2,71.34,-67.11,-0.03,-10.01,80.72,18.61,21.38,88.84,6.07,-8.33,0,2,-12,-55.75,45.73,68.2,71.34,-67.11,-0.03,-10.01,80.72,18.61,21.38,88.84,6.07,-8.33,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,56.68,7.15,0,0,1,0,0,0,0,0,0,0,0,0,0,2,-8.78,-45.01,57.26,55.06,70.23,-67.87,-0.03,-9.28,80.72,18.61,21.38,88.84,6.07,-8.33,0,2,-8.78,-45.01,57.26,55.06,70.23,-67.87,-0.03,-9.28,80.72,18.61,21.38,88.84,6.07,-8.33,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,56.68,7.15,0,0,1,0,0,0,0,0,0,0,0,0,0,2,-1,-11.93,70.53,27.71,72.2,-66.51,-0.03,-10.6,80.72,18.61,21.38,88.84,6.07,-8.33,0,2,-1,-11.93,70.53,27.71,72.2,-66.51,-0.03,-10.6,80.72,18.61,21.38,88.84,6.07,-8.33,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,56.68,7.15,0,0,1,0,0,0,0,0,0,0,0,0,0,2,6.78,22.08,61.06,5.2,79,-59.2,0.04,-17.22,80.72,18.61,21.38,88.84,6.07,-8.33,0,2,6.78,22.08,61.06,5.2,79,-59.2,0.04,-17.22,80.72,18.61,21.38,88.84,6.07,-8.33,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,56.68,7.15,0,0,1,0,0,0,0,0,0,0,0,0,0,2,10,33.58,48.57,-2.28,82.77,-51.9,0.02,-23.01,80.72,18.61,21.38,88.84,6.07,-8.33,0,2,10,33.58,48.57,-2.28,82.77,-51.9,0.02,-23.01,80.72,18.61,21.38,88.84,6.07,-8.33,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"pecDeck","id":"deck","seatH":48,"padZ":18,"padY":96,"padH":62,"pivot":[18,176,7.147739912858345]},{"type":"pecArm","id":"pecL","hand":"L","pivot":[-18,176,7.147739912858345],"mountTo":"deck:hubR"},{"type":"pecArm","id":"pecR","hand":"R","pivot":[18,176,7.147739912858345],"mountTo":"deck:hubL"}],"contacts":[{"body":"back","prop":"deck:pad"},{"body":"buttocks","prop":"deck:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"pecL"},{"body":"gripR","prop":"pecR"}],"gripRadius":{"L":1.6,"R":1.6}},
"reversefly":{"keys":[{"t":0,"v":[0,58.76,11.98,0.99939,0.0349,0,0,0,0,0,0,0,0,0,0,0,2,14,38.68,70.54,-13.17,67.88,33.37,0.03,-29.22,81.99,18.2,21.46,85.9,5.92,-7.94,0,2,14,38.68,70.54,-13.17,67.88,33.37,0.03,-29.22,81.99,18.2,21.46,85.9,5.92,-7.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,58.76,11.98,0.99939,0.0349,0,0,0,0,0,0,0,0,0,0,0,2,9.9,29.66,74.65,-4.67,63.12,33.46,0.03,-27.04,81.99,18.2,21.46,85.9,5.92,-7.94,0,2,9.9,29.66,74.65,-4.67,63.12,33.46,0.03,-27.04,81.99,18.2,21.46,85.9,5.92,-7.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,58.76,11.98,0.99939,0.0349,0,0,0,0,0,0,0,0,0,0,0,2,0,7.94,78.34,16.89,52.49,37.38,0.04,-22.73,81.99,18.2,21.46,85.9,5.92,-7.94,0,2,0,7.94,78.34,16.89,52.49,37.38,0.04,-22.73,81.99,18.2,21.46,85.9,5.92,-7.94,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,58.76,11.98,0.99939,0.0349,0,0,0,0,0,0,0,0,0,0,0,2,-9.9,-11.71,72.61,45.69,46.25,51.46,0.05,-19.01,81.99,18.2,21.46,85.9,5.92,-7.94,0,2,-9.9,-11.71,72.61,45.69,46.25,51.46,0.05,-19.01,81.99,18.2,21.46,85.9,5.92,-7.94,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,58.76,11.98,0.99939,0.0349,0,0,0,0,0,0,0,0,0,0,0,2,-14,-16.14,66.96,63.92,45.78,65.39,0.04,-15.5,81.99,18.2,21.46,85.9,5.92,-7.94,0,2,-14,-16.14,66.96,63.92,45.78,65.39,0.04,-15.5,81.99,18.2,21.46,85.9,5.92,-7.94,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"pecDeck","id":"deck","seatH":50,"padZ":26,"padY":101,"padH":44,"padW":28,"pivot":[18,178,15.16035497723353]},{"type":"pecArm","id":"pecL","hand":"L","pivot":[18,178,15.16035497723353],"mountTo":"deck:hubL"},{"type":"pecArm","id":"pecR","hand":"R","pivot":[-18,178,15.16035497723353],"mountTo":"deck:hubR"}],"contacts":[{"body":"chest","prop":"deck:pad"},{"body":"buttocks","prop":"deck:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"pecL"},{"body":"gripR","prop":"pecR"}],"gripRadius":{"L":1.6,"R":1.6}},
"smithohp":{"keys":[{"t":0,"v":[0,52.64,-9.1,0,0,0.99756,0.06976,6,0,0,-4,0,0,0,0,0,6,4,11.15,39.68,46.79,140.42,36.87,-7.92,-9.26,77.21,23.28,19.26,97.47,9.17,-4.78,0,6,4,11.15,39.68,46.79,140.42,36.87,-7.92,-9.26,77.21,23.28,19.26,97.47,9.17,-4.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,52.64,-9.1,0,0,0.99756,0.06976,6,0,0,-4,0,0,0,0,0,8.64,4.88,21.46,49.9,45.74,135.28,37.95,-7.67,-16.28,77.21,23.28,19.26,97.47,9.17,-4.78,0,8.64,4.88,21.46,49.9,45.74,135.28,37.95,-7.67,-16.28,77.21,23.28,19.26,97.47,9.17,-4.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,52.64,-9.1,0,0,0.99756,0.06976,6,0,0,-4,0,0,0,0,0,15,7,41.39,70.72,45,116.3,37.41,-7.34,-23.05,77.21,23.28,19.26,97.47,9.17,-4.78,0,15,7,41.39,70.72,45,116.3,37.41,-7.34,-23.05,77.21,23.28,19.26,97.47,9.17,-4.78,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,52.64,-9.1,0,0,0.99756,0.06976,6,0,0,-4,0,0,0,0,0,21.36,9.12,56.75,88.99,44.92,89.66,32.97,-7.53,-19.61,77.21,23.28,19.26,97.47,9.17,-4.78,0,21.36,9.12,56.75,88.99,44.92,89.66,32.97,-7.53,-19.61,77.21,23.28,19.26,97.47,9.17,-4.78,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,52.64,-9.1,0,0,0.99756,0.06976,6,0,0,-4,0,0,0,0,0,24,10,63.29,96.51,44.35,75.61,30.56,-7.75,-15.56,77.21,23.28,19.26,97.47,9.17,-4.78,0,24,10,63.29,96.51,44.35,75.61,30.56,-7.75,-15.56,77.21,23.28,19.26,97.47,9.17,-4.78,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":82,"seat":4,"at":[0,0,0]},{"type":"smith","id":"smith","z":-20.246599933288085,"halfWidth":62},{"type":"smithBar","id":"bar","rodL":[62,0,-20.246599933288085],"rodR":[-62,0,-20.246599933288085],"mountTo":"smith","plates":[10]}],"contacts":[{"body":"back","prop":"bench:back"},{"body":"buttocks","prop":"bench:seat"},{"body":"soleL","prop":"floor"},{"body":"soleR","prop":"floor"},{"body":"gripL","prop":"bar"},{"body":"gripR","prop":"bar"}]},
"bandrow":{"keys":[{"t":0,"v":[0,10.37,0,0.99452,-0.10453,0,0,20,0,0,14,0,0,-10,0,0,0,14,68.75,20.09,-15.59,60.14,-30.28,-0.03,-11.59,103.91,1.87,0.79,51.73,7.8,1.06,0,0,14,68.75,20.09,-15.59,60.14,-30.28,-0.03,-11.59,103.91,1.87,0.79,51.73,7.8,1.06,0],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,10.44,0,0.99397,-0.10961,0,0,18.54,0,0,11.95,0,0,-7.95,0,0,0,9.75,48.52,23.76,-12.78,80.22,-30.17,-0.03,-14.47,103.27,1.85,0.78,51.73,7.85,1.06,0,0,9.75,48.52,23.76,-12.78,80.22,-30.17,-0.03,-14.47,103.27,1.85,0.78,51.73,7.85,1.06,0],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,10.59,0,0.99255,-0.12187,0,0,15,0,0,7,0,0,-3,0,0,0,-0.5,6.6,26.47,-11.07,106.56,-25.78,-0.02,-8.44,101.75,1.81,0.75,51.72,7.96,1.06,0,0,-0.5,6.6,26.47,-11.07,106.56,-25.78,-0.02,-8.44,101.75,1.81,0.75,51.72,7.96,1.06,0],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,10.74,0,0.99097,-0.13411,0,0,11.46,0,0,2.05,0,0,1.95,0,0,0,-10.75,-29.33,27.05,-10.59,116.39,-20.62,-0.03,6.54,100.22,1.78,0.72,51.72,8.07,1.06,0,0,-10.75,-29.33,27.05,-10.59,116.39,-20.62,-0.03,6.54,100.22,1.78,0.72,51.72,8.07,1.06,0],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,10.79,0,0.99027,-0.13917,0,0,10,0,0,0,0,0,4,0,0,0,-15,-42.32,27.26,-9.94,118.12,-19.67,-0.04,13.08,99.59,1.77,0.71,51.72,8.11,1.06,0,0,-15,-42.32,27.26,-9.94,118.12,-19.67,-0.04,13.08,99.59,1.77,0.71,51.72,8.11,1.06,0],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"mat","id":"mat","len":180,"at":[0,0,30]},{"type":"band","id":"band","fromSole":true,"r":0.7}],"contacts":[{"body":"buttocks","prop":"mat"},{"body":"footL","prop":"mat"},{"body":"footR","prop":"mat"},{"body":"gripL","prop":"band:handleL"},{"body":"gripR","prop":"band:handleR"}],"gripRadius":{"L":1.6,"R":1.6}},
"chestrowdb":{"keys":[{"t":0,"v":[0,53.3,-3.39,0.90631,0.42262,0,0,-2,0,0,4,0,0,-30,0,0,-2,12,23.86,17.38,-17.53,51.97,0,0,0,-4.93,3.94,10.9,19.17,18.35,3.85,55,-2,12,23.86,17.38,-17.53,51.97,0,0,0,-4.93,3.94,10.9,19.17,18.35,3.85,55],"hands":{"L":"grip","R":"grip"}},{"t":0.25,"v":[0,53.03,-3.17,0.90631,0.42262,0,0,-2,0,0,2.54,0,0,-30,0,0,-1.12,7.9,15.86,21.19,-15.82,64.07,-3.22,0,0,-5.13,3.94,10.88,19.17,18.54,3.89,55,-1.12,7.9,15.86,21.19,-15.82,64.07,-3.22,0,0,-5.13,3.94,10.88,19.17,18.54,3.89,55],"hands":{"L":"grip","R":"grip"}},{"t":0.5,"v":[0,52.36,-2.6,0.90631,0.42262,0,0,-2,0,0,-1,0,0,-30,0,0,1,-2,-4.25,32.33,-12.08,91.9,-11,0,0,-5.63,3.94,10.83,19.17,19.04,3.98,55,1,-2,-4.25,32.33,-12.08,91.9,-11,0,0,-5.63,3.94,10.83,19.17,19.04,3.98,55],"hands":{"L":"grip","R":"grip"}},{"t":0.75,"v":[0,51.91,-2.23,0.90631,0.42262,0,0,-2,0,0,-4.54,0,0,-30,0,0,3.12,-11.9,-34.63,48.99,-5.51,121.09,-18.78,0,0,-5.96,3.94,10.8,19.17,19.37,4.04,55,3.12,-11.9,-34.63,48.99,-5.51,121.09,-18.78,0,0,-5.96,3.94,10.8,19.17,19.37,4.04,55],"hands":{"L":"grip","R":"grip"}},{"t":1,"v":[0,51.75,-2.08,0.90631,0.42262,0,0,-2,0,0,-6,0,0,-30,0,0,4,-16,-53.62,55.34,0.94,131.85,-22,0,0,-6.08,3.93,10.79,19.17,19.49,4.06,55,4,-16,-53.62,55.34,0.94,131.85,-22,0,0,-6.08,3.93,10.79,19.17,19.49,4.06,55],"hands":{"L":"grip","R":"grip"}}],"equipment":[{"type":"adjBench","id":"bench","back":40,"seat":0,"width":28,"seatPad":false},{"type":"dumbbell","id":"dbL","hand":"L"},{"type":"dumbbell","id":"dbR","hand":"R"}],"contacts":[{"body":"front","prop":"bench:back"},{"body":"footL","prop":"floor"},{"body":"footR","prop":"floor"},{"body":"gripL","prop":"dbL"},{"body":"gripR","prop":"dbR"}],"gripRadius":{"L":1.6,"R":1.6}}
};
if(typeof module!=='undefined'&&module.exports)module.exports=CATALOG_POSES;

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
function catalogSource(ex){const a={...ex.anim,catalogId:ex.id};delete a.catalogRig;delete a.catalogProfile;prepAnim(a);return a;}
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
    else if(!front&&Math.max(...s.pts.map(p=>p[1]))-Math.min(...s.pts.map(p=>p[1]))>25){
     const half=/rail/.test(s.cls||'')?56:13;
     for(const sign of [-1,1])out.push({kind:'line',a:V3.add(a,[1,0,0],sign*half),b:V3.add(b,[1,0,0],sign*half),width:s.w||4,tone:tone(s)});
    }else out.push({kind:'line',a,b,width:s.w||4,tone:tone(s)});
   }
  }else if(s.k==='circle')out.push({kind:'wheel',c:map(s.c),radius:s.r||6,axis:front?[0,0,1]:[1,0,0],tone:tone(s)});
  else if(s.k==='db')out.push({kind:'dumbbell',c:ref(s.at||'gripN',s.off),axis:[1,0,0],optional:s.if});
  else if(s.k==='plate'){
   const c=s.tf?V3.add(V3.add(R.hip,R.u,s.tf[0]),R.n,s.tf[1]):ref(s.at||'grips',s.off);
   if(source.catalogId==='rollout'){
    const center=ref('grips'),axis=V3.unit(V3.sub(R.gripR,R.gripL));
    out.push({kind:'wheel',c:center,axis,radius:s.r||8,tone:'plate'},
     {kind:'line',a:V3.add(R.gripL,axis,-3),b:V3.add(R.gripR,axis,3),width:3,tone:'bar'});
   }else out.push({kind:/^grips$/.test(s.at||'grips')?'barbell':'weight',c,axis:[1,0,0],radius:s.r||16,optional:s.if});
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
  arm3(R,s,wr,[sign,0,.2],[0,-1,0]);leg3(R,s,[sign*16,180,166],[0,-1,0]);R.props.push({kind:'dumbbell',c:R['grip'+s],axis:[0,0,1]});
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
// Side-view silhouettes do not encode the width or assembly of apparatus.
// These families have explicit members and contact surfaces in world space.
function catalogBeam(a,b,width=4,tone='steel',extra={}){return{kind:'line',a:[...a],b:[...b],width,tone,...extra};}
function catalogMachineLink(pivot,target,side){
 // Two rigid arms articulate at a hinge; neither beam stretches with the hands.
 const [hinge,end]=joint3(pivot,target,55,55,[side==='L'?-1:1,0,0]);
 return[catalogBeam(pivot,hinge,3.5,'steel',{equipmentRole:'linkage',side,link:0}),catalogBeam(hinge,end,3.5,'steel',{equipmentRole:'linkage',side,link:1})];
}
function catalogEquipment(R,id,source){
 const p=R.props;
 if(['hang','hangknee','legraise'].includes(id)){
  for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*19,27.5,100],[0,0,1],[0,-1,0]);
  R.props=[catalogBeam([-42,24,100],[42,24,100],3.6,'bar',{equipmentRole:'grip',sourceIndex:1}),
   catalogBeam([-42,24,100],[-42,14,100],4,'steel',{sourceIndex:0}),catalogBeam([42,24,100],[42,14,100],4)];
 }
 if(['dip','assistdip'].includes(id)){
  for(const s of ['L','R']){R['grip'+s]=V3.add(R['wr'+s],[0,1,0],3.5);R['hand'+s]=V3.add(R['wr'+s],[0,1,0],7);}
  const y=R.gripL[1],z0=id==='dip'?62:64,z1=id==='dip'?168:158;
  R.props=[];
  for(const[s,sign]of [['L',-1],['R',1]]){
   const x=R['grip'+s][0];
   R.props.push(catalogBeam([x,y,z0],[x,y,z1],4.5,'bar',{equipmentRole:'grip',side:s,sourceIndex:0}));
   for(const[z,idx]of [[z0,1],[z1,id==='dip'?2:1]])R.props.push(catalogBeam([x,y,z],[x,186,z],4,'steel',{sourceIndex:idx}),catalogBeam([x-7,186,z],[x+7,186,z],4));
  }
  if(id==='assistdip'){
   const y=R.knL[1]+5.2,z=(R.knL[2]+R.knR[2])/2,pad=box3(-17,17,y,y+7,z-12,z+12,'pad');pad.sourceIndex=2;pad.equipmentRole='knee-support';
   R.props.push(pad,catalogBeam([0,y+7,z],[0,y+7,z1],4,'steel',{sourceIndex:3}),catalogBeam([0,y+7,z1],[0,186,z1],4));
   R.props.push(catalogBeam([-19,186,z1],[19,186,z1],4));
  }
 }
 if(id.startsWith('smith')){
  const bar=p.find(q=>q.kind==='barbell'),railIndices=new Set((source.props||[]).flatMap((q,i)=>/rail/.test(q.cls||'')?[i]:[]));
  if(bar&&railIndices.size){
   const z=id==='smithincline'?86:id==='smithbench'?70:92,top=6;
   bar.c[2]=z;bar.axis=[1,0,0];bar.equipmentRole='grip';
   for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*(id==='smithsquat'?30:id==='smithohp'?32:19),bar.c[1]+3.5,z],[sign*.4,1,-.3],[0,-1,0]);
   R.props=p.filter(q=>!railIndices.has(q.sourceIndex)&&!(id==='smithincline'&&q.sourceIndex===1));
   for(const sign of [-1,1])R.props.push(catalogBeam([sign*56,top,z],[sign*56,186,z],4,'steel',{sourceIndex:[...railIndices][sign>0&&railIndices.size>1?1:0],equipmentRole:'guide'}),catalogBeam([sign*56,186,z-20],[sign*56,186,z+20],5));
   R.props.push(catalogBeam([-56,top,z],[56,top,z],5,'steel',{equipmentRole:'crossmember',...(id==='smithincline'?{sourceIndex:1}:{})}));
   if(id==='smithohp')for(const q of R.props){
    if(q.kind==='box'){q.tone='pad';if(q.sourceIndex===1){q.lo[1]+=10;q.hi[1]+=10;q.equipmentRole='seat';}}
    if(q.sourceIndex===2&&q.kind==='line')q.a[1]+=10;
   }
   if(id==='smithohp')R.props.push(catalogBeam([0,130,64],[0,146,86],4,'steel',{equipmentRole:'backrest-bracket'}));
  }
 }
 if(['pecdeck','reversefly'].includes(id)){
  // Seat supports the underside of the pelvis; rear uprights hold the pivots.
  const reverse=id==='reversefly',frameZ=reverse?156:45,seat=box3(-24,24,140,147,65,108,'pad'),back=box3(-20,20,65,130,reverse?93:59,reverse?100:70,'pad');
  seat.sourceIndex=reverse?2:1;seat.equipmentRole='seat';back.sourceIndex=reverse?0:0;back.equipmentRole=reverse?'chest-support':'back-support';
  R.props=[seat,back,catalogBeam([0,147,86],[0,186,86],5,'steel',{sourceIndex:reverse?2:2}),catalogBeam([0,186,86],[0,186,frameZ],5)];
  for(const sign of [-1,1])R.props.push(catalogBeam([sign*60,28,frameZ],[sign*60,186,frameZ],5),catalogBeam([sign*60,186,frameZ],[0,186,frameZ],5));
  R.props.push(catalogBeam([-60,28,frameZ],[60,28,frameZ],5,'steel',{sourceIndex:reverse?1:3,equipmentRole:'crossmember'}));
  // Backrest and seat are tied into the frame, with articulated arms to pads.
  const backZ=reverse?100:59;
  R.props.push(catalogBeam([0,100,backZ],[0,100,frameZ],4),catalogBeam([0,100,frameZ],[0,186,frameZ],4));
  for(const[s,sign,idx]of [['L',-1,reverse?4:5],['R',1,reverse?3:4]]){
   const grip=R['grip'+s],el=R['el'+s],wr=R['wr'+s],pivot=[sign*60,28,frameZ];
   if(reverse){
    const a=V3.add(grip,[0,1,0],-7),b=V3.add(grip,[0,1,0],7);
    R.props.push(catalogBeam(a,b,2.8,'bar',{sourceIndex:idx,equipmentRole:'grip',side:s}),...catalogMachineLink(pivot,a,s));
   }else{
    const offset=[sign*7,0,0],a=V3.add(el,offset),b=V3.add(wr,offset),handleEnd=V3.add(grip,[sign,0,0],7);
    R.props.push(catalogBeam(a,b,9,'pad',{sourceIndex:idx,equipmentRole:'forearm-support',side:s}),...catalogMachineLink(pivot,b,s),catalogBeam(b,handleEnd,3.5),catalogBeam(grip,handleEnd,2.8,'bar',{equipmentRole:'grip',side:s}));
   }
  }
 }
 if(id==='declinebb'){
  for(const q of p)if(q.kind==='wheel'&&q.tone==='pad'){q.kind='roller';q.equipmentRole='leg-restraint';}
  const rollers=p.filter(q=>q.kind==='roller'),pad=p.find(q=>q.kind==='panel'&&q.tone==='pad');
  // The original side-view circles occupied the knee/calf and instep volumes.
  // One roller restrains above the knees; the second supports under the feet.
  rollers[0].c=[0,R.knL[1]-10.7,R.knL[2]];
  const footDir=V3.unit(V3.sub(R.toeL,R.heelL)),under=V3.unit(V3.cross(footDir,[1,0,0]));
  rollers[1].c=V3.add(V3.add([0,R.anL[1],R.anL[2]],footDir,6.2),under,8.5);
  // Legs meet the underside of the actual tilted pad, not its old 2D outline.
  R.props=p.filter(q=>![0,1,3].includes(q.sourceIndex));
  for(const[end,idx]of [[pad.a,0],[pad.b,1]])for(const sign of [-1,1]){
   const top=V3.add(end,[1,0,0],sign*12);R.props.push(catalogBeam(top,[top[0],186,top[2]],4,'steel',{sourceIndex:idx}));
  }
  for(const sign of [-1,1]){
   const root=V3.add(pad.a,[1,0,0],sign*15);let previous=root;
   for(const roller of rollers){const end=V3.add(roller.c,[1,0,0],sign*18);R.props.push(catalogBeam(previous,end,3.5,'steel',{sourceIndex:3}));previous=end;}
  }
 }
 return R;
}
function catalogEquipmentRig(rig,id,source){
 const make=t=>catalogEquipment(rig(t),id,source);
 // A single placement for the entire clip, rather than a floor that follows feet.
 let lift=0;
 if(source.noGround)for(let i=0;i<=40;i++){
  const R=make(i/40);for(const s of ['L','R'])for(const key of ['an','heel','toe'])lift=Math.max(lift,R[key+s][1]+6-186);
 }
 return t=>{
  const R=make(t);
  if(lift>0){
   const shift=p=>[p[0],p[1]-lift,p[2]],vectors=new Set(['u','n','x','headU','headN','chestU','chestN']);
   for(const[key,p]of Object.entries(R))if(!vectors.has(key)&&Array.isArray(p)&&p.length===3&&p.every(Number.isFinite))R[key]=shift(p);
   for(const p of R.props)for(const key of ['a','b','c','lo','hi','grip'])if(p[key])p[key]=shift(p[key]);
   for(const c of R.contacts||[])if(c.p)c.p=shift(c.p);
  }
  if(['hang','hangknee','legraise'].includes(id)){
   const y=24-lift;
   for(const sign of [-1,1])R.props.push(catalogBeam([sign*42,y-10,100],[sign*42,186,100],4),catalogBeam([sign*42,186,75],[sign*42,186,125],5));
  }
  return R;
 };
}
const CATALOG_SOURCES=new Map();
for(const ex of EX){
 const source=catalogSource(ex);CATALOG_SOURCES.set(ex.id,source);
 /* Упражнения на манекене: запечённые ключи поз (tools/mannequin) и параметрический инвентарь */
 if(typeof CATALOG_POSES!=='undefined'&&CATALOG_POSES[ex.id]){
  const rig=GymEquipment.rig(CATALOG_POSES[ex.id]);
  ex.anim.catalogRig=rig;ex.anim.catalogCameras=[...CATALOG_CAMERAS];ex.anim.catalogId=ex.id;ex.anim.catalogBasis='mannequin';
  if(CATALOG_POSES[ex.id].loop)ex.anim.loop=true;
  continue;
 }
 let rig=source.rig3d||catalogPlanarRig(ex,source);
 if(['ytw','reversesnow'].includes(ex.id))rig=catalogProneRig(source);
 if(['widepush','archer'].includes(ex.id))rig=catalogWidePushRig(CATALOG_SOURCES.get('pushup'),ex.id==='archer');
 if(ex.id==='dbfly')rig=catalogFlyRig;
 if(ex.id==='bbbench')rig=catalogBenchRig;
 if(['kbswing','goblet'].includes(ex.id))rig=catalogSharedGripRig(rig,ex.id);
 rig=catalogEquipmentRig(rig,ex.id,source);
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

/* Ground exercises need fixed support joints. Interpolating a hip and solving
   toward a fixed ankle can send the knee through the floor between keyframes. */
function catalogKneelingLegs(R){
 for(const[s,sign]of [['L',-1],['R',1]]){
  R['kn'+s]=[sign*11,180.5,96];
  R['an'+s]=[sign*11,178.5,96-Math.sqrt(FL.sh**2-2**2)];
  // A plantar-flexed foot extends behind the ankle, not vertically into the mat.
  R['toe'+s]=V3.add(R['an'+s],[0,0,-1],13);
  R['heel'+s]=V3.add(R['an'+s],[0,0,-1],-4);
 }
 R.contacts=['knL','knR','anL','anR'].map(key=>({key,kind:'support'}));
}
function catalogRolloutGroundRig(t){
 const thigh=20+40*t,hip=V3.add([0,180.5,96],up3(thigh),FL.th),R=body3(hip,65+19*t);
 catalogKneelingLegs(R);
 // The wheel rolls on the floor (186 cm), and the shoulders determine its
 // reachable forward position. Both hands remain on its short horizontal axle.
 const wheelY=178,wristY=wheelY-3.5,reach=56.8;
 const wheelZ=R.sh[2]+Math.sqrt(reach**2-(wristY-R.sh[1])**2);
 for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*19,wristY,wheelZ],[0,-1,1],[0,1,0]);
 const axis=[1,0,0],center=[0,wheelY,wheelZ];
 R.props=[{kind:'wheel',c:center,axis,radius:8,tone:'plate'},
  {kind:'line',a:[-22,wheelY,wheelZ],b:[22,wheelY,wheelZ],width:3,tone:'bar',equipmentRole:'grip'}];
 R.basis='authored';return R;
}
function catalogNordicGroundRig(t){
 const angle=58*t,hip=V3.add([0,180.5,96],up3(angle),FL.th),R=body3(hip,angle);
 catalogKneelingLegs(R);
 const endShoulder=V3.add([0,180.5,96],up3(58),FL.th+FL.torso),endReach=V3.sub([0,181.5,198],endShoulder);
 for(const[s,sign]of [['L',-1],['R',1]]){
  const wr=V3.add(R['sh'+s],[0,30+(endReach[1]-30)*t,28+(endReach[2]-28)*t]);
  arm3(R,s,wr,[0,1,-1],[0,0,1]);
 }
 const z=R.anL[2];
 R.props=[{kind:'roller',c:[0,171.5,z],radius:4,axis:[1,0,0],tone:'pad'},
  {kind:'line',a:[-23,171.5,z],b:[23,171.5,z],width:3,tone:'steel'},
  ...[-1,1].map(sign=>({kind:'line',a:[sign*23,171.5,z],b:[sign*23,186,z],width:4,tone:'steel'}))];
 R.basis='authored';return R;
}
function catalogSupermanGroundRig(t){
 const R=body3([0,173.2,100],90-12*t),arm=up3(90-12*t),leg=[0,-Math.sin(7*t*D2R),-Math.cos(7*t*D2R)];
 for(const s of ['L','R']){
  R['el'+s]=V3.add(R['sh'+s],arm,FL.ua);R['wr'+s]=V3.add(R['el'+s],arm,FL.fa);
  R['grip'+s]=V3.add(R['wr'+s],arm,3.5);R['hand'+s]=V3.add(R['wr'+s],arm,7);
  R['kn'+s]=V3.add(R['hip'+s],leg,FL.th);R['an'+s]=V3.add(R['kn'+s],leg,FL.sh);
  R['heel'+s]=V3.add(R['an'+s],leg,-4);R['toe'+s]=V3.add(R['an'+s],leg,13);
 }
 R.contacts=[{key:'hip',kind:'support'}];R.basis='authored';return R;
}
const CATALOG_GROUND_RIGS={rollout:catalogRolloutGroundRig,nordic:catalogNordicGroundRig,superman:catalogSupermanGroundRig};
for(const ex of EX){
 /* упражнения на манекене уже стоят на своих опорах (tools/mannequin) — старые плоские риги их не подменяют */
 if(ex.anim.catalogBasis==='mannequin')continue;
 const rig=CATALOG_GROUND_RIGS[ex.id];
 if(rig)ex.anim.catalogRig=t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const R=rig(t);R.x=[1,0,0];return R;
 };
 if(ex.id==='cablecrunch'){
  const original=ex.anim.catalogRig;
  ex.anim.catalogRig=t=>{
   const R=original(t);
   for(const s of ['L','R']){
    R['heel'+s]=V3.add(R['an'+s],[0,0,-1],-4);
    R['toe'+s]=V3.add(R['an'+s],[0,0,-1],13);
   }
   R.contacts=['knL','knR','anL','anR'].map(key=>({key,kind:'support'}));return R;
  };
 }
}

/* Anatomical parts and teaching regions are deliberately distinct. Deep muscles
   have an entry but no patch painted on top of the skin. Colour curves are authored
   illustrations; identical head profiles do not pretend to measure head-specific EMG. */
const MUSCLE_REGIONS={
 chest:[['pec_clavicular','Clavicular portion of pectoralis major','anatomical'],['pec_sternal','Middle chest region','teaching'],['pec_costal','Lower chest region','teaching']],
 triceps:[['tri_long','Long head of triceps','anatomical'],['tri_lateral','Lateral head of triceps','anatomical'],['tri_medial','Medial head of triceps · deeper','deep']],
 biceps:[['bi_long','Long head of biceps','anatomical'],['bi_short','Short head of biceps','anatomical']],
 delt_f:[['delt_f','Anterior deltoid','anatomical']],delt_s:[['delt_s','Middle deltoid','anatomical']],delt_r:[['delt_r','Posterior deltoid','anatomical']],
 quads:[['quad_rectus','Rectus femoris','anatomical'],['quad_lateral','Vastus lateralis','anatomical'],['quad_medial','Vastus medialis','anatomical'],['quad_deep','Vastus intermedius · deeper','deep']],
 hams:[['ham_lateral','Biceps femoris','anatomical'],['ham_medial','Medial hamstring region','teaching']],
 calves:[['calf_medial','Medial head of gastrocnemius','anatomical'],['calf_lateral','Lateral head of gastrocnemius','anatomical'],['soleus','Soleus · deeper','deep']],
 glutes:[['glute_max','Gluteus maximus','anatomical'],['glute_lateral','Lateral gluteal region','teaching']],
 traps:[['trap_upper','Upper trapezius region','teaching'],['trap_mid','Middle trapezius region','teaching']],
 lats:[['lats','Latissimus dorsi · shared profile','group']],midback:[['midback','Interscapular region · shared profile','group']],
 lowback:[['lowback','Spinal extensors · shared profile','group']],abs:[['abs','Abs (rectus abdominis)','anatomical']],
 obliques:[['obliques','Oblique abdominal muscles · shared profile','group']],forearms:[['forearms','Forearm muscles · shared profile','group']]
};
const REGION_META=Object.fromEntries(Object.entries(MUSCLE_REGIONS).flatMap(([parent,rows])=>rows.map(([id,label,kind])=>[id,{id,parent,label,kind,visible:kind!=='deep'}])));
const REGION_ANATOMY_SOURCES=[['Shoulder girdle anatomy — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'],['Leg muscle anatomy — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs']];
function motionProfile(anim){return anim.catalogProfile||anim.muscleProfile;}
const INCLINE_CHEST=new Set(['dbincline','smithincline','inclinebb','declinepush','cablelowfly']);
const LOWER_CHEST=new Set(['declinebb','dip','assistdip']);
const CATALOG_LATERALITY={dbrow:{upper:'L'},cablelat:{upper:'R'},concentration:{upper:'L'},kickback:{upper:'L'},archer:{upper:'R'},bulgarian:{lower:'L'},stepup:{lower:'L'},lunge:{lower:'L'},revlunge:{lower:'L'},sidelunge:{lower:'R'},pistolbox:{lower:'L'},sllift:{lower:'L'},glutebridge1:{lower:'L'},glutekick:{lower:'L'},cablekickback:{lower:'L'},calf1:{lower:'L'}};
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
 const notes=base?base.notes:{concentric:hold?'Hold: the muscles maintain the position.':cyclic?'Cyclic motion: colour illustrates how emphasis changes.':names+' participate in the working phase.',eccentric:cyclic?'Continuation of the cycle: involvement changes smoothly.':'The muscles control the return.',end:'End position: maintain control and support.',start:'Starting position: prepare for the next repetition.'};
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
// Leg fronts follow the sagittal limb plane, even when a bent thigh passes the
// torso's forward normal. Projecting R.n alone would flip front/back at that point.
function catalogLimbFront(R,a,b,kind){return kind==='th'||kind==='sh'?V3.cross(R.x,V3.sub(b,a)):R.n;}
function catalogLimbPoint(R,a,b,kind,t,angle,extra=0){
 const f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),[r1,r2]=catalogLimbRadius(kind,t),c=V3.add(a,V3.sub(b,a),t);
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
   const a=R[root+side],b=R[end+side],f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),outward=V3.dot(f.y,R.x)*sign,orientation=Math.abs(outward)>.001?Math.sign(outward):sign;
   const point=(t,a)=>catalogLimbPoint(R,R[root+side],R[end+side],kind,t,a*orientation);point.normalSign=orientation;point.angleSign=orientation;return point;
  };
  for(const[id,lo,hi,a,b]of [['delt_f',.02,.30,-.70,.70],['delt_s',.02,.32,.73,1.76],['delt_r',.02,.30,1.80,2.75],['bi_long',.33,.84,.04,.80],['bi_short',.33,.84,-.80,-.04],['tri_long',.28,.86,2.46,3.91],['tri_lateral',.27,.85,1.68,2.42]])patch(id,side,lo,hi,a,b,limb('sh','el','ua'));
  patch('forearms',side,.15,.78,-1.25,1.25,limb('el','wr','fa'));
  for(const[id,lo,hi,a,b]of [['quad_rectus',.15,.80,-.44,.44],['quad_lateral',.12,.82,.48,1.48],['quad_medial',.44,.91,-1.38,-.48],['ham_lateral',.16,.82,1.67,2.71],['ham_medial',.18,.84,2.77,4.45]])patch(id,side,lo,hi,a,b,limb('hip','kn','th'));
  patch('calf_lateral',side,.12,.59,2.08,3.12,limb('kn','an','sh'));patch('calf_medial',side,.12,.59,3.18,4.21,limb('kn','an','sh'));
 }
 return faces;
}
/* Мышечные зоны на манекене: те же учебные области, но на поверхности нового тела.
   Корпус: h — высота вдоль оси корпуса от середины тазобедренных суставов, угол от передней линии к боку и спине.
   Конечности: t — доля сегмента, угол от передней поверхности к латеральной. Дельты лежат на «шапке» плеча. */
const MANNEQUIN_TORSO_PATCHES=[['pec_clavicular',41,48,.06,1.12],['pec_sternal',34,41,.06,1.22],['pec_costal',29,34,.08,1.02],['abs',3,29,.04,.5],['obliques',3,28,.56,1.36],
 ['lats',13,39,1.52,2.62],['midback',33,48,2.62,3.1],['lowback',3,24,2.7,3.1],['glute_max',-9,4,1.72,3.1],['glute_lateral',-6,7,1.16,1.7],['trap_upper',47,56,2.05,3.1],['trap_mid',39,47,2.3,2.68]];
const MANNEQUIN_LIMB_PATCHES={
 ua:[['bi_long',.33,.84,.05,.8],['bi_short',.33,.84,-.8,-.05],['tri_long',.3,.86,2.5,3.9],['tri_lateral',.3,.85,1.7,2.45]],
 fa:[['forearms',.12,.76,-1.25,1.25]],
 th:[['quad_rectus',.15,.8,-.44,.44],['quad_lateral',.12,.82,.48,1.48],['quad_medial',.44,.91,-1.38,-.48],['ham_lateral',.16,.82,1.67,2.71],['ham_medial',.18,.84,2.77,4.45]],
 sk:[['calf_lateral',.1,.56,2.05,3.12],['calf_medial',.1,.56,3.16,4.22]]
};
const MANNEQUIN_DELTS=[['delt_f',-.75,.75],['delt_s',.8,1.75],['delt_r',1.8,2.75]];
function mannequinMuscleSurfaces(R,profile,{coarse=false}={}){
 const faces=[],V=Mannequin.V,lift=.25;
 const grid=(id,side,rows,cols,point)=>{
  if(!profile.regions[id]?.visible)return;
  const P=[];for(let r=0;r<=rows;r++){P.push([]);for(let c=0;c<=cols;c++)P[r].push(point(r/rows,c/cols,lift));}
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const pts=[P[r][c],P[r][c+1],P[r+1][c+1],P[r+1][c]],mid=point((r+.5)/rows,(c+.5)/cols,0),out=point((r+.5)/rows,(c+.5)/cols,1);
   faces.push({id,parent:profile.regions[id].parent,side,points:pts,normal:V.unit(V.sub(out,mid)),anchor:mid});
  }
 };
 const step=coarse?2:1;
 for(const side of ['L','R']){
  for(const[id,h0,h1,a0,a1]of MANNEQUIN_TORSO_PATCHES)grid(id,side,Math.max(1,Math.round((h1-h0)/(2.5*step))),Math.max(2,Math.round((a1-a0)/(.13*step))),(u,v,e)=>Mannequin.torsoPoint(R,h0+(h1-h0)*u,side,a0+(a1-a0)*v,e));
  for(const[kind,list]of Object.entries(MANNEQUIN_LIMB_PATCHES))for(const[id,t0,t1,a0,a1]of list)
   grid(id,side,Math.max(1,Math.round((t1-t0)/(.06*step))),Math.max(2,Math.round((a1-a0)/(.2*step))),(u,v,e)=>Mannequin.limbPoint(R,kind,side,t0+(t1-t0)*u,a0+(a1-a0)*v,e));
  /* дельтовидная: сектор «шапки» плечевого сустава, от верха вниз на ~95° */
  const ua=R.frames['ua'+side],g=side==='L'?1:-1,cap=V.add(V.add(R['sh'+side],ua.y,-1.4),ua.x,g*.7),lat=V.scale(ua.x,g),r=Mannequin.CAPS.sh;
  for(const[id,a0,a1]of MANNEQUIN_DELTS)grid(id,side,coarse?3:5,coarse?3:6,(u,v,e)=>{
   const polar=(.18+.85*u)*Math.PI/2*1.05,az=a0+(a1-a0)*v,dir=V.add(V.add(V.scale(ua.y,Math.cos(polar)),ua.z,Math.sin(polar)*Math.cos(az)),lat,Math.sin(polar)*Math.sin(az));
   return V.add(cap,dir,r+e);
  });
 }
 return faces;
}
function catalogFigureAnim(anim){
 return {...anim,noGround:anim.catalogBasis==='mannequin'?false:anim.noGround,rig3d:anim.catalogRig,muscleProfile:anim.catalogProfile,camera:'above',cameras:anim.catalogCameras,sample:t=>({spatialT:t}),catalogRig:null};
}
function catalogVolumeData(anim,t,index,has,coarse=false){
 const R=anim.catalogRig(t),state=muscleFrame(anim,t,index),profile=motionProfile(anim);
 if(R.frames)return{exerciseId:anim.catalogId,pose:R,body:Mannequin.bodyData(R),stress:jointStressPoints(anim,R,t,index),surfaces:mannequinMuscleSurfaces(R,profile,{coarse}),values:state.values,sideValues:catalogSideValues(profile,state.values),regions:profile.regions,props:R.props.filter(s=>GymEquipment.visible(s,has)),torsoRings:[],limbProfiles:{}};
 return{exerciseId:anim.catalogId,pose:R,surfaces:catalogMuscleSurfaces(R,profile,{coarse}),values:state.values,sideValues:catalogSideValues(profile,state.values),regions:profile.regions,props:R.props.filter(s=>!s.optional||!has||has(s.optional)),torsoRings:CATALOG_RINGS,limbProfiles:CATALOG_LIMB_PROFILES};
}

function catalogVectors(anim){
 if(anim.hold||(anim.keys?.length>2&&!anim.vectors))return[];
 const rig=anim.catalogRig||anim.rig3d,poses=Array.from({length:41},(_,i)=>rig(i/40)),a=poses[0],b=poses.at(-1),out=[];
 for(const key of ['sh','hip','elL','elR','gripL','gripR','knL','knR','anL','anR']){
  const delta=V3.sub(b[key],a[key]);if(Math.hypot(...delta)>10)out.push({a:a[key],b:b[key],key,points:poses.map(R=>R[key])});
 }return out;
}
// A movement arrow belongs to the current joint and reverses on the return phase.
function catalogVectorFrame(v,t,index,pose){
 if(index===1||index===3)return null;
 const points=v.points,i=Math.round(t*(points.length-1)),lo=Math.max(0,i-1),hi=Math.min(points.length-1,i+1);
 const delta=V3.sub(points[hi],points[lo]),size=Math.hypot(...delta);if(size<.001)return null;
 const distance=Math.min(28,Math.max(12,Math.hypot(...V3.sub(v.b,v.a))*.3)),a=pose[v.key],sign=index===2?-1:1;
 return{a,b:V3.add(a,delta,sign*distance/size),key:v.key};
}
function catalogVectorGroup(svg,anim,camera){
 const g=el('g',{class:'motion-vec','aria-hidden':'true',display:'none'},svg),id='vec-arrow-'+(++vecSerial),defs=el('defs',{},g),project=camera3(camera),vectors=catalogVectors(anim);
 for(const kind of ['limb','core']){const m=el('marker',{id:id+'-'+kind,viewBox:'0 0 10 10',refX:7,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);el('path',{d:'M0,0 L10,5 L0,10 Z',class:'vec-head vec-'+kind},m);}
 const nodes=vectors.map(v=>{const kind=/^(sh|hip)$/.test(v.key)?'core':'limb';return el('path',{class:'vec-line vec-'+kind,'data-vector':v.key,'marker-end':`url(#${id}-${kind})`},g);});
 const toggle=show=>g.setAttribute('display',show?'inline':'none');
 toggle.bounds=vectors.flatMap(v=>v.points.flatMap((p,i)=>[0,2].flatMap(index=>{const q=catalogVectorFrame(v,i/(v.points.length-1),index,{[v.key]:p});return q?[project(q.a),project(q.b)]:[];})));
 toggle.at=(t,frame,R)=>vectors.forEach((v,i)=>{const q=catalogVectorFrame(v,t,frame?.index||0,R),node=nodes[i];node.setAttribute('display',q?'inline':'none');if(q){const a=project(q.a),b=project(q.b);node.setAttribute('d',`M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])}`);}});
 return toggle;
}
function createMotionFigure(anim,opts){
 if(!window.GymVolume||!anim.catalogRig)return buildFigure(anim,opts);
 let f=window.GymVolume.create({...opts,data:(t,index,coarse)=>catalogVolumeData(anim,t,index,opts.has,coarse),color:muscleColor,joints:motionPrefs.joints,stress:opts.stress??motionPrefs.stress,
  trace:Array.from({length:41},(_,i)=>anim.catalogRig(i/40).gripL),vectors:catalogVectors(anim),vectorFrame:catalogVectorFrame});
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

/* ===================== НАГРУЗКА НА СУСТАВЫ =====================
   Красная метка — момент пиковой нагрузки на сустав, связки или сухожилие в повторении. Это напоминание держать
   технику, а не «опасное упражнение». Условия проверяются по углам суставов манекена (Mannequin.jointAngles —
   тот же расчёт, что у валидатора) и по опорам упражнения (контакты спецификации), на 41 кадре повторения.
   Пороги и основания:
   колени      — сгибание ≥85° (на одной ноге ≥80°) под весом: Escamilla 2001, MSSE 33(1):127–141;
   колено      — разгибание в открытой цепи ближе 30° к прямой ноге: Escamilla et al. 1998, MSSE 30(4):556–569;
   поясница    — наклон корпуса ≥40° без опоры с весом: McGill 1997, J Biomech 30(5):465–475;
   плечи       — плечо за линией корпуса ≥20° в жимах и брусьях, длинный рычаг в разведениях:
                 Fees et al. 1998, AJSM 26(5):732–742; брусья — McKenzie et al. 2022, IJERPH 19(21):14390;
   локти       — сгибание ≥100° с весом над головой в изолирующих упражнениях на трицепс (практическое правило);
   запястья    — разгибание кисти ≥60° под весом тела: J Wrist Surg 2017, 6(4):276–279;
   ахилл       — тыльное сгибание ≥15° с весом в подъёмах на носки: Weinert-Aplin et al. 2015, JSSM 14:459–465;
   приземление — кадры после полётной фазы, пока таз опускается;
   бёдра сзади — колено ≤40° при сгибании бедра ≥70° с весом; скандинавские сгибания — наклон ≥40°:
                 Opar et al. 2012, Sports Med 42(3):209–226;
   вис, верх подтягивания, шея — по просьбе владельца: здесь чаще всего травмируют плечи и шейный отдел. */
const STRESS_RULES = [
  {id:'knee', parts:['knees'], zone:'Knees', what:'Deep bend under load — peak load on the kneecap and knee ligaments.', tip:'Keep knees in line with your feet; don’t drop or relax at the bottom.'},
  {id:'kneeOpen', parts:['knees'], zone:'Knees', what:'The last 30° before a straight leg put the most tension on the ACL.', tip:'Extend without jerking or slamming at the end.'},
  {id:'lumbar', parts:['lower back'], zone:'Lower back', what:'Leaning forward with a load and no support — peak load on the lower back.', tip:'Keep a neutral back, hinge at the hips, keep the weight close to your legs.'},
  {id:'shPress', parts:['shoulders'], zone:'Shoulders', what:'The upper arm goes behind the torso under load — stress on the front of the shoulder joint.', tip:'Lower only to a comfortable depth, shoulder blades squeezed and set.'},
  {id:'shLever', parts:['shoulders'], zone:'Shoulders', what:'Long lever: the weight is far from the shoulder.', tip:'Keep elbows slightly bent, don’t sink at the bottom.'},
  {id:'hang', parts:['shoulders'], zone:'Shoulders', what:'Hanging: body weight stretches the shoulder joint.', tip:'Active hang: shoulders away from your ears, no dropping into the bottom.'},
  {id:'pullTop', parts:['shoulders'], zone:'Shoulders', what:'Top of the pull-up: shoulders roll forward and up to the ears.', tip:'Chest to the bar, shoulder blades down and back, no jerking.'},
  {id:'neck', parts:['neck'], zone:'Neck', what:'When strength runs out, people reach for the bar with their neck — this overloads the cervical spine.', tip:'Keep your chin neutral and eyes forward: better to fall short than to reach with your neck.'},
  {id:'elbow', parts:['elbows'], zone:'Elbows', what:'Deep elbow bend with the weight overhead — stress on the olecranon and triceps tendon.', tip:'Lower slowly, keep your elbows in.'},
  {id:'wrist', parts:['wrists'], zone:'Wrists', what:'The wrist is bent back under body weight.', tip:'Spread the load over the whole palm; if it hurts, use push-up handles.'},
  {id:'achilles', parts:['Achilles tendons'], zone:'Achilles tendons', what:'Heel below the step under load — peak tension on the tendon.', tip:'Lower smoothly, no bouncing.'},
  {id:'landing', parts:['knees', 'Achilles tendons'], zone:'Knees and Achilles tendons', what:'Landing — an impact several times your body weight.', tip:'Land softly on the balls of your feet, knees in line with your feet.'},
  {id:'hams', parts:['hamstrings'], zone:'Hamstrings', what:'The hamstrings are stretched under load.', tip:'Lower until you feel the stretch, no jerking out of the bottom.'}
];
const STRESS_RULE = Object.fromEntries(STRESS_RULES.map(r => [r.id, r]));
const STRESS_FRAMES = 40;
const STRESS_CACHE = new Map();
/* наклоны от таза, если таблица движений планировщика ещё не загружена (проверка рисунков без приложения) */
const STRESS_HINGE = new Set(['deadlift', 'rdl', 'sllift', 'goodmorning', 'kbswing', 'hyper', 'pullthrough']);

/* что держит и на что опирается тело — по контактам спецификации */
function stressContacts(ex) {
  const C = (typeof CATALOG_POSES !== 'undefined' && CATALOG_POSES[ex.id]?.contacts || []).map(c => c.body + '>' + c.prop);
  const has = re => C.some(c => re.test(c));
  const legs = ['quads', 'glutes', 'hams', 'calves', 'cardio'].includes(ex.g);
  /* свободный вес: гриф, гантель, гиря; ладони на диске гантели (пуловер, разгибание из-за головы) */
  const free = has(/^grip[LR]?>(bar|db[LR]?|kb[LR]?|tbar|\w+:horn[LR])$/) || has(/^(hand|palm[LR]?)>\w+:top$/);
  const machine = !legs && has(/^grip[LR]?>(cab[LR]?|pec[LR]|\w+:(handle[LR]?|grab[LR]|pull[LR]|pec[LR]))$/);
  return {
    loaded: free || machine,
    backBar: has(/^back>bar$/),
    sole: s => has(new RegExp(s ? '^sole(' + s + ')?>' : '^sole[LR]?>')),
    /* стоит на полу или коврике и ничем больше не опирается — только у таких упражнений бывает приземление */
    floorOnly: C.some(c => /^sole[LR]?>(floor|mat)$/.test(c)) && !C.some(c => /^sole[LR]?>(?!(floor|mat)$)|^(buttocks|back|upperBack|chest|knee[LR]?|th[LR]?)>|^grip[LR]?>\w+:(pullBar|pull[LR]|bar[LR]|dip[LR]|rail[LR])$/.test(c)),
    seated: has(/^(back|chest|belly|buttocks|upperBack|front|headBack|th[LR]?|thighsBack|knee[LR]?|fa[LR]?|palm[LR]?)>(?!bar$)/),
    upright: !has(/^(buttocks|back|chest|th[LR]?|upperBack|knee[LR]?)>(?!bar$)(?!\w+:sh[LR]$)/),
    /* на одной ноге: касание ящика ягодицами в нижней точке пистолета не делает упражнение сидячим */
    uprightUni: !has(/^(back|chest|th[LR]?|upperBack|knee[LR]?)>(?!bar$)/),
    legPress: has(/^sole[LR]?>\w+:plate/) || has(/^upperBack>\w+:sh[LR]$/),
    shin: has(/^shin[LR]?>\w+:roller/),
    palmBear: s => has(new RegExp('^palm(' + s + ')?>(?!\\w+:(panel|top)$)')),
    palmTop: has(/^palm[LR]?>\w+:top$/),
    handsBear: has(/^(palm[LR]?|fa[LR]?)>|^grip[LR]?>\w+:(bar[LR]|dip[LR]|seat|pad|top)$/),
    bar: has(/^grip[LR]?>\w+:(pullBar|pull[LR])$/),
    kneelAnchored: has(/^knee[LR]?>pad$/) && has(/^foot[LR]?>\w+:base$/)
  };
}
/* углы и вспомогательные величины кадра */
function stressFrame(R) {
  const A = Mannequin.jointAngles(R), V = Mannequin.V;
  const up = V.unit(V.sub(R.sh, R.hip)), trunk = Math.acos(Math.max(-1, Math.min(1, -up[1]))) * 180 / Math.PI;
  const side = s => { const a = A[s], h = R['grip' + s] && R['sh' + s] ? Math.hypot(R['grip' + s][0] - R['sh' + s][0], R['grip' + s][2] - R['sh' + s][2]) : 0;
    return {...a, behind:a.posterior > 0 ? Math.asin(Math.min(1, a.posterior)) * 180 / Math.PI : 0, beta:Math.abs(Math.atan2(a.lat, -a.up) * 180 / Math.PI), reach:h}; };
  return {A, trunk, L:side('L'), R:side('R')};
}
/* правила кадра: возвращают ключи меток (суставы со стороной или центральные точки) */
function stressRulesAt(ex, k, f) {
  const out = {}, add = (id, keys) => { if (keys.length) out[id] = keys; }, both = (fn, key) => ['L', 'R'].filter(fn).map(s => key + s);
  /* в наклоне от таза (становая, румынская) колени согнуты, но пик нагрузки — на поясницу и заднюю поверхность бедра */
  const hinge = typeof PATTERN !== 'undefined' ? PATTERN[ex.id] === 'hinge' : STRESS_HINGE.has(ex.id), legsG = ['quads', 'glutes', 'hams'].includes(ex.g);
  if (!ex.pri.includes('calves') && !hinge) {
    const loaded = k.legPress || (k.upright && (k.loaded || k.backBar)) || (legsG && ex.uni && k.uprightUni);
    if (loaded) add('knee', both(s => k.sole(s) && f[s].knee >= (ex.uni ? 80 : 85), 'kn'));
  }
  if (k.shin) add('kneeOpen', both(s => f[s].knee <= 30, 'kn'));
  if (k.sole('') && !k.seated && (k.loaded || k.backBar) && f.trunk >= 40) add('lumbar', ['lumbar']);
  const push = ['chest', 'triceps', 'shoulders'].includes(ex.g);
  if (push && (k.loaded || k.handsBear)) add('shPress', both(s => f[s].behind >= 20, 'sh'));
  if (ex.g === 'chest' && k.loaded) add('shLever', both(s => (f[s].elbow <= 35 && f[s].reach >= 45 && f[s].beta >= 60 && f[s].beta <= 120 && f.trunk > 60) || (f[s].elevation >= 130 && f[s].reach >= 35), 'sh'));
  if (k.bar) {
    add('hang', both(s => f[s].elevation >= 140, 'sh'));
    const top = both(s => f[s].elbow >= 100, 'sh');
    add('pullTop', top);
    if (top.length) add('neck', ['neck']);
  }
  if (ex.pri[0] === 'triceps' && ex.type !== 'c' && k.loaded) add('elbow', both(s => f[s].elbow >= 100 && f[s].elevation >= 80, 'el'));
  if (!k.kneelAnchored) add('wrist', both(s => ((k.palmBear(s) && f.trunk >= 45) || k.palmTop) && f[s].wristFlex <= -60, 'wr'));
  if (ex.pri[0] === 'calves' && ex.type !== 'c' && ex.g !== 'cardio') add('achilles', both(s => f[s].dorsi >= 15, 'an'));
  if (k.sole('') && !k.seated && (k.loaded || k.backBar)) add('hams', both(s => f[s].knee <= 40 && f[s].hipFlex >= 70, 'th'));
  if (k.kneelAnchored && f.trunk >= 40) add('hams', ['thL', 'thR']);
  return out;
}
/* метки по кадрам: f — повторение вперёд (t 0→1), b — возврат (t 1→0); различаются только приземлением */
function jointStress(ex) {
  if (STRESS_CACHE.has(ex.id)) return STRESS_CACHE.get(ex.id);
  let result = {rules:[]};
  const rig = ex.anim.catalogRig;
  if (rig && typeof CATALOG_POSES !== 'undefined' && CATALOG_POSES[ex.id]) {
    const k = stressContacts(ex), frames = [], clear = [], hip = [];
    for (let i = 0; i <= STRESS_FRAMES; i++) {
      const R = rig(i / STRESS_FRAMES);
      if (!R.frames) { frames.length = 0; break; }
      frames.push(stressRulesAt(ex, k, stressFrame(R)));
      clear.push(Math.max(R.heelL[1], R.toeL[1], R.heelR[1], R.toeR[1])); hip.push(R.hip[1]);
    }
    if (frames.length) {
      const ground = Math.max(...clear), gap = clear.map(y => ground - y);
      const landing = order => { const hit = new Array(frames.length).fill(false); let since = Infinity;
        for (let n = 1; n < order.length; n++) { const i = order[n], prev = order[n - 1];
          since = gap[prev] >= 5 ? 0 : since + 1;
          if (gap[i] < 3 && since < 5 && hip[i] > hip[prev]) hit[i] = true; }
        return hit; };
      const idx = frames.map((_, i) => i), none = idx.map(() => false);
      const fw = k.floorOnly ? landing(idx) : none, bw = !k.floorOnly ? none : ex.anim.loop ? fw : landing(idx.slice().reverse());
      const ids = new Set(frames.flatMap(f => Object.keys(f)));
      if (fw.some(Boolean) || bw.some(Boolean)) ids.add('landing');
      const keysOf = (id, i, dir) => id === 'landing' ? ((dir === 'b' ? bw : fw)[i] ? ['knL', 'knR', 'anL', 'anR'] : []) : frames[i][id] || [];
      result = {rules:STRESS_RULES.filter(r => ids.has(r.id)).map(r => ({...r, f:frames.map((_, i) => keysOf(r.id, i, 'f')), b:frames.map((_, i) => keysOf(r.id, i, 'b'))}))};
    }
  }
  STRESS_CACHE.set(ex.id, result);
  return result;
}
function stressExercise(anim) { return anim.catalogId ? (typeof EXI !== 'undefined' ? EXI[anim.catalogId] : EX.find(e => e.id === anim.catalogId)) : null; }
/* активные правила в положении t; index 2 и 3 — обратный ход (кроме замкнутых циклов) */
function jointStressAt(ex, t, index = 0) {
  const S = jointStress(ex), i = Math.max(0, Math.min(STRESS_FRAMES, Math.round(t * STRESS_FRAMES))), dir = index >= 2 && !ex.anim.loop ? 'b' : 'f';
  return S.rules.map(r => ({rule:r, keys:r[dir][i]})).filter(x => x.keys.length);
}
/* точка метки на манекене */
function stressPoint(R, key) {
  const V = Mannequin.V, s = key.slice(-1);
  if (key === 'lumbar') return R.waist || V.mix(R.hip, R.sh, .3);
  if (key === 'neck') return V.mix(R.neckBase || R.sh, R.head, .35);
  if (key.startsWith('th')) return V.mix(R['hip' + s], R['kn' + s], .45);
  if (key.startsWith('an')) return V.mix(R['an' + s], R['heel' + s], .5);
  return R[key];
}
function jointStressPoints(anim, R, t, index) {
  const ex = stressExercise(anim);
  if (!ex || !R.frames) return [];
  const out = [];
  for (const {rule, keys} of jointStressAt(ex, t, index)) for (const key of keys) if (!out.some(m => m.key === key)) out.push({key, rule:rule.id, p:stressPoint(R, key)});
  return out;
}
/* коротко для карточки: какие суставы под пиковой нагрузкой */
function stressZones(ex) {
  const zones = [];
  for (const r of jointStress(ex).rules) for (const name of r.parts) if (!zones.includes(name)) zones.push(name);
  return zones;
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
  if (topTwice && nextId && EXI[nextId]) return `<p class="prog prog-up"><b>↑</b><span>Two workouts in a row at the top of the range. Next step: <button type="button" class="lk" data-prog="${nextId}">${esc(EXI[nextId].name)}</button>.</span></p>`;
  if (lowTwice && prevId && EXI[prevId]) return `<p class="prog prog-down"><b>↓</b><span>Twice fell short of ${lo} reps. Easier step: <button type="button" class="lk" data-prog="${prevId}">${esc(EXI[prevId].name)}</button>.</span></p>`;
  if (nextId || prevId) return `<p class="prog"><span>Progression: ${prevId ? `<button type="button" class="lk" data-prog="${prevId}">easier</button>` : ''}${prevId && nextId ? ' · ' : ''}${nextId ? `<button type="button" class="lk" data-prog="${nextId}">harder</button>` : ''}</span></p>`;
  return '';
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-prog]'); if (!t) return;
  const card = t.closest('.card'); if (!card || !plan) return;
  const it = plan.items.find(x => x.ex.id === card.dataset.ex); if (!it) return;
  const target = EXI[t.dataset.prog]; if (!target) return;
  const E = plan.E; if (!available(target, E)) { t.textContent = 'no equipment'; return; }
  if (plan.items.some(x => x.ex.id === target.id)) { t.textContent = 'already in plan'; return; }
  const k = swapKey(); swaps[k] = swaps[k] || {}; swaps[k][it.slot] = target.id; done = {}; renderPlan();
  const c2 = document.querySelector(`.card[data-slot="${it.slot}"]`); if (c2) { c2.classList.add('flash'); c2.scrollIntoView({block:'nearest'}); }
});


/* ===================== ПЛАНИРОВЩИК ===================== */
const GOALS = {
  strength:{name:'Strength', hint:'3–6 reps', reps:{c:'3–5', i:'6–8'}, sets:{c:5, i:3}, rest:{c:180, i:90}, tempo:'2-0-X-0',
    load:{c:'≈ 80–90% of 1RM, 1–2 reps in reserve', i:'heavy, 1–2 reps in reserve'}, rep:3, time:'20–30 s', dist:'20 m',
    circ:{rounds:4, reps:'6–8', work:20, rest:30, roundRest:180}, ss:{rest:150}},
  mass:{name:'Muscle', hint:'6–12 reps', reps:{c:'6–10', i:'10–12'}, sets:{c:4, i:3}, rest:{c:120, i:75}, tempo:'3-0-1-0',
    load:{c:'≈ 70–80% of 1RM, 1–2 reps in reserve', i:'1–2 reps in reserve'}, rep:4, time:'30–45 s', dist:'30 m',
    circ:{rounds:3, reps:'10–12', work:30, rest:20, roundRest:120}, ss:{rest:90}},
  cut:{name:'Definition', hint:'12–20 reps', reps:{c:'12–15', i:'15–20'}, sets:{c:3, i:3}, rest:{c:60, i:40}, tempo:'2-0-1-0',
    load:{c:'≈ 55–65% of 1RM, close to failure', i:'until a strong burn'}, rep:3, time:'45–60 s', dist:'40 m',
    circ:{rounds:4, reps:'15–20', work:40, rest:15, roundRest:90}, ss:{rest:60}}
};
const FORMATS = {classic:{name:'Straight sets', hint:'set by set'}, superset:{name:'Supersets', hint:'pairs without rest'}, circuit:{name:'Circuit', hint:'rounds back to back'}};
const LEVELS = {beg:{name:'Beginner'}, mid:{name:'Intermediate'}, adv:{name:'Advanced'}};
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
const MODES = {single:{name:'Workout', hint:'for one day'}, program:{name:'Program', hint:'for a week'}};
const DAY_T = {
  fa:{name:'Full body', g:['quads', 'chest', 'back', 'shoulders', 'biceps', 'abs']},
  fb:{name:'Full body', g:['hams', 'glutes', 'back', 'chest', 'triceps', 'abs']},
  fc:{name:'Full body', g:['quads', 'glutes', 'back', 'shoulders', 'chest', 'calves']},
  up:{name:'Upper', g:['chest', 'back', 'shoulders', 'biceps', 'triceps']},
  lo:{name:'Lower', g:['quads', 'hams', 'glutes', 'calves', 'abs']},
  push:{name:'Push', g:['chest', 'shoulders', 'triceps']},
  pull:{name:'Pull', g:['back', 'biceps', 'forearms']},
  legs:{name:'Legs', g:['quads', 'hams', 'glutes', 'calves', 'abs']}
};
const SPLITS = {
  full:{name:'Full body', hint:'all at once', note:'Every workout hits the whole body, and exercises change from day to day. The best option for beginners and for 2–3 workouts a week.',
    days:{2:['fa', 'fb'], 3:['fa', 'fb', 'fc'], 4:['fa', 'fb', 'fc', 'fa']}},
  ul:{name:'Upper / lower', hint:'alternating', note:'Upper and lower days alternate, so each muscle works twice a week.',
    days:{2:['up', 'lo'], 4:['up', 'lo', 'up', 'lo'], 5:['up', 'lo', 'up', 'lo', 'fa']}},
  ppl:{name:'Push / pull / legs', hint:'three focuses', note:'Pushing muscles, pulling muscles and legs on separate days. With 5 workouts, upper and lower days are added.',
    days:{3:['push', 'pull', 'legs'], 5:['push', 'pull', 'legs', 'up', 'lo']}}
};
const DEFAULT_SPLIT = {2:'full', 3:'full', 4:'ul', 5:'ppl'};
const SCHEDULE = {2:[0, 3], 3:[0, 2, 4], 4:[0, 1, 3, 4], 5:[0, 1, 2, 4, 5]};
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WD_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/* мезоцикл: 4 недели с ростом нагрузки и разгрузкой */
const WEEKS = [
  {name:'Intro', rir:3, add:0, pct:{strength:'≈ 75–80%', mass:'≈ 65–70%', cut:'≈ 55–60%'},
    note:'Choose working weights that leave 3 reps in reserve in every set. Log weight and reps: next weeks\' progress is built on them.'},
  {name:'Loading', rir:2, add:1, pct:{strength:'≈ 80–85%', mass:'≈ 70–75%', cut:'≈ 60–65%'},
    note:'Compound exercises get an extra set. Increase weight using double progression; keep 2 reps in reserve.'},
  {name:'Peak', rir:1, add:1, pct:{strength:'≈ 85–90%', mass:'≈ 75–80%', cut:'≈ 65–70%'},
    note:'The hardest week of the cycle: 1 rep in reserve, clean technique. If your sleep or well-being is poor, stay at the week 2 load.'},
  {name:'Deload', rir:4, deload:true, pct:{strength:'≈ 65–70%', mass:'≈ 55–60%', cut:'≈ 50–55%'},
    note:'About 40% fewer sets, weight 10–15% lower. This is recovery before a new cycle, not a skipped week: muscles grow when they have time to recover.'}
];

const DEFAULTS = {goal:'mass', format:'classic', level:'mid', count:6, groups:['chest', 'back', 'shoulders'], equip:EQUIP.map(e => e.id), seed:7,
  mode:'single', days:3, split:'full', week:1, day:0, view:'plan', atlasM:'chest', focus:null};
const STORE = 'podhod.settings.v1';
function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.groups && s.equip) return Object.assign({}, DEFAULTS, s); } catch (e) {}
  return Object.assign({}, DEFAULTS);
}
function saveSettings() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

const S = loadSettings();
let swaps = {};
let eqOpen = false;
let placeDel = false;
let done = {};
let plan = null, prog = null;

/* ---------- утилиты ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const fmtRest = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
const midOf = r => { const m = String(r).match(/(\d+)\D+(\d+)/); if (m) return (+m[1] + +m[2]) / 2; const n = parseFloat(r); return isNaN(n) ? 10 : n; };
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; }
const fmtNum = v => Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');

/* можно ли взвесить отягощение: свободные веса, тренажёры, блок, машина Смита (а не лента, турник, скамья или вес тела) */
const WEIGHABLE = new Set(['db', 'bb', 'kb', 'cable', 'smith']);
function weighable(ex, E) {
  const ok = id => id !== 'gravitron' && (WEIGHABLE.has(id) || (EQUIP.find(e => e.id === id) || {}).cat === 'mach');
  /* необязательные гантели считаются, только если они есть в этом месте */
  return ex.eq.some(g => g.every(ok)) || (ex.opt || []).some(id => ok(id) && (!E || E.has(id)));
}
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
  const opt = (ex.opt || []).filter(id => E.has(id)).map(id => eqName(id).toLowerCase() + ' optional');
  if (!ch.length) return ['No equipment'].concat(opt).join(' · ');
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
  /* акцент из атласа: если группа мышцы есть в этой тренировке, треть упражнений нагружают её как основную
     (в недельной программе — одно на каждые 5 упражнений дня, объём набирается за неделю);
     сверх этого — небольшой плюс, а где мышца помогает — ещё меньший */
  const focus = S.focus && MUSCLE_NAMES[S.focus] ? S.focus : null;
  const focusNeed = focus && G.has(MUSCLE_GROUP[focus]) ? (S.mode === 'program' ? Math.max(1, Math.round(count / 5)) : Math.ceil(count / 3)) : 0;
  const jitter = pool.map(() => rand());
  while (picked.length < count) {
    let best = null, bestScore = -1e9;
    const focusShort = !!focus && picked.filter(p => p.pri.includes(focus)).length < focusNeed;
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
      if (focus) sc += ex.pri.includes(focus) ? (focusShort ? 3 : 0.6) + (ex.pri[0] === focus ? 0.3 : 0) : ex.sec.includes(focus) ? 0.35 : 0;
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
function prescribe(ex, week, E) {
  const G = GOALS[S.goal];
  const t = ex.type;
  let sets = G.sets[t];
  if (S.level === 'beg') sets = Math.max(2, sets - 1);
  if (S.level === 'adv' && t === 'c') sets = Math.min(6, sets + 1);
  let reps = G.reps[t], unit = 'reps';
  if (ex.kind === 'time') { reps = G.time; unit = ''; }
  if (ex.kind === 'dist') { reps = G.dist; unit = ''; }
  const bodyweight = !ex.eq.length && !(ex.opt || []).length;
  /* процент от 1ПМ имеет смысл только для веса, который можно взвесить: штанга, гантели, гиря, тренажёр, блок.
     Для резины, противовеса и собственного веса — тот же запас повторов, но подбирается натяжение ленты,
     противовес или вариант упражнения. */
  const pct = t === 'c' && weighable(ex, E);
  const band = ex.eq.length && ex.eq.every(g => g.every(id => id === 'band')), assisted = ex.eq.some(g => g.includes('gravitron'));
  const how = band ? 'band tension: ' : assisted ? 'counterweight: ' : 'pick a variation: ';
  const easy = band ? 'lighter than usual, not to failure' : assisted ? 'more than usual, not to failure' : 'an easier one, not to failure';
  let load = t === 'c' && !pct ? how + {strength:'1–2 reps in reserve', mass:'1–2 reps in reserve', cut:'close to failure'}[S.goal] : G.load[t];
  if (week) {
    const rir = week.rir + (S.level === 'beg' ? 1 : 0);
    const reserve = `${rir} ${plural(rir, 'rep', 'reps', 'reps')} in reserve`;
    if (week.deload) { sets = Math.max(2, Math.round(sets * 0.6)); load = pct ? `${week.pct[S.goal]} of 1RM, light weight, not to failure` : t === 'c' ? how + easy : 'light weight, not to failure'; }
    else {
      if (week.add && t === 'c') sets = Math.min(6, sets + week.add);
      load = pct ? `${week.pct[S.goal]} of 1RM, ${reserve}` : t === 'c' ? how + reserve : reserve;
    }
  }
  if (ex.kind === 'time') load = ex.g === 'cardio' ? 'fast pace without losing technique' : S.goal === 'strength' ? 'weighted or with a harder variation' : 'steady, without losing form';
  else if (ex.g === 'cardio') load = 'explosively and at an even pace';
  if (ex.kind === 'dist') load = S.goal === 'strength' ? 'heaviest implements possible' : 'heavy implements, no stops';
  const notes = [];
  if (bodyweight && ex.kind !== 'time' && S.goal === 'strength') notes.push('If the range feels easy, add weight or slow the lowering to 4 s.');
  if (!week && S.level === 'beg') load = load.replace('1–2 reps', '2–3 reps');
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
  /* программа другого места: подбор под его инвентарь, затем недоступное здесь заменяется аналогами */
  const ref = programEquip(), PE = ref ? effEquip(ref) : E;
  let {picked} = pickExercises(PE, rand, groups, count, ctx.avoid);
  const pool = EX.filter(ex => available(ex, E));
  const subs = new Map(), lost = [];
  if (ref) {
    const lvlMax = S.level === 'beg' ? 2 : 3, used = new Set(picked.filter(ex => available(ex, E)).map(ex => ex.id));
    picked = picked.map(ex => {
      if (available(ex, E)) return ex;
      const alt = analogsFor(ex, E, {exclude:used, lvlMax, limit:1})[0];
      if (!alt) { lost.push(ex); return null; }
      used.add(alt.ex.id); subs.set(alt.ex, {from:ex, note:alt.note}); return alt.ex;
    }).filter(Boolean);
  }
  for (const [i, id] of Object.entries(sw)) {
    const ex = EXI[id];
    if (picked[i] && ex && available(ex, E) && !picked.includes(ex)) picked[i] = ex;
  }
  if (!picked.length) return {empty:'none', pool, groups};
  const G = GOALS[S.goal];
  const items = picked.map((ex, i) => ({ex, slot:i, rx:applyLight(prescribe(ex, week, E), ex), name:exName(ex, E), eqLine:equipLine(ex, E), eqIds:chosenEquip(ex, E), has:propHas(ex, E), sub:subs.get(ex) || null}));
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
  return {blocks, items, minutes:Math.round(minutes / 60), totalSets, missing, load, gvol, pool, E, groups, count, lost};
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
    /* день «всё тело» включает мышцу акцента, даже если по шаблону её группы в этот день нет */
    const fg = S.focus && MUSCLE_GROUP[S.focus], g = DAY_T[tid].name === 'Full body' && fg && !DAY_T[tid].g.includes(fg) ? DAY_T[tid].g.concat(fg) : DAY_T[tid].g;
    const p = buildPlan({groups:g, count:S.count, seed:S.seed * 131 + i * 977 + 13, avoid:new Set(avoid), week, swaps:swaps['d' + i] || {}});
    if (p.items) p.items.forEach(it => avoid.add(it.ex.id));
    return {tid, i, wd:SCHEDULE[days][i], plan:p};
  });
  for (const d of out) {
    const same = tmpl.filter(t => t === d.tid).length;
    const k = tmpl.slice(0, d.i + 1).filter(t => t === d.tid).length;
    const letters = DAY_T[d.tid].name === 'Full body' ? 'ABCD' : 'AB';
    const isFull = DAY_T[d.tid].name === 'Full body';
    const fullIdx = isFull ? tmpl.slice(0, d.i + 1).filter(t => DAY_T[t].name === 'Full body').length : 0;
    const fullTotal = tmpl.filter(t => DAY_T[t].name === 'Full body').length;
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
  const jv = S.view === 'journal' || S.view === 'atlas';
  $('.setup').hidden = jv; $('.layout').classList.toggle('solo', jv);
  $('#f-mode').innerHTML = seg('mode', MODES, S.mode);
  $('#f-prog').hidden = !prog;
  $('#f-muscles').hidden = prog;
  $('#count-l').textContent = prog ? 'Exercises per workout' : 'Exercises';
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
  const cur = placeOf();
  $('#e-places').innerHTML = S.places.map(p => `<button type="button" class="place${p.id === S.place ? ' on' : ''}" data-place="${p.id}" aria-pressed="${p.id === S.place}"><b>${esc(p.name)}</b><small>${p.equip.length ? p.equip.length + ' ' + plural(p.equip.length, 'item', 'items', 'items') : 'no equipment'}</small></button>`).join('')
    + `<button type="button" class="place place-add" data-place-add="1">+ Place</button>`;
  const others = S.places.filter(p => p.id !== S.place);
  $('#e-place-tools').innerHTML = `<label class="place-name">Name<input id="place-name" type="text" maxlength="24" value="${esc(cur.name)}" autocomplete="off"></label>`
    + (S.places.length > 1 ? `<button type="button" class="place-del${placeDel ? ' armed' : ''}" data-place-del="1">${placeDel ? 'Are you sure?' : 'Delete place'}</button>` : '')
    + (others.length ? `<label class="place-adapt">Programme<select id="place-adapt"><option value="">Built for this place</option>${others.map(p => `<option value="${p.id}"${S.adapt === p.id ? ' selected' : ''}>As in “${esc(p.name)}”, with substitutes</option>`).join('')}</select></label>
      <p class="f-note">${S.adapt ? `Exercises are chosen for “${esc(placeOf(S, S.adapt).name)}”; anything missing here is replaced with the closest alternative — same movement, same muscles.` : 'The programme is built from what this place has.'}</p>` : '');
  const es = new Set(S.equip);
  $('#e-presets').innerHTML = '<span class="pres-l">Fill in:</span>' + EQUIP_PRESETS.map(p => {
    const on = p.eq.length === es.size && p.eq.every(e => es.has(e));
    return `<button type="button" class="pre${on ? ' on' : ''}" data-ep="${p.id}">${p.name}</button>`;
  }).join('');
  $('#e-chips').innerHTML = EQUIP_CATS.map(c => `<div class="e-cat"><h3>${c.name}</h3><div class="chips">${EQUIP.filter(e => e.cat === c.id).map(e =>
    `<button type="button" class="chip${es.has(e.id) ? ' on' : ''}" data-e="${e.id}" aria-pressed="${es.has(e.id)}"${e.hint ? ` title="${esc(e.hint)}"` : ''}>${ICON.check}<span>${e.name}</span></button>`).join('')}</div></div>`).join('');
  $('#e-count').textContent = es.size ? `${es.size} of ${EQUIP.length}` : 'bodyweight only';
  const matched = EQUIP_PRESETS.some(p => p.eq.length === es.size && p.eq.every(e => es.has(e)));
  const open = eqOpen || !matched;
  $('#e-chips').hidden = !open;
  $('#e-sum').hidden = open;
  $('#e-sum').textContent = es.size === EQUIP.length ? 'All gym equipment.' : EQUIP.filter(e => es.has(e.id)).map(e => e.name).join(', ') + '.';
  $('#e-toggle').hidden = !matched;
  $('#e-toggle').textContent = open ? 'Collapse list' : 'Edit list';
  $('#e-toggle').setAttribute('aria-expanded', open);
}

function titleFor() {
  const gs = new Set(S.groups);
  const p = GROUP_PRESETS.find(p => p.g.length === gs.size && p.g.every(g => gs.has(g)));
  if (p) return p.id === 'full' ? 'Full body' : p.id === 'legs' ? 'Legs & glutes' : p.id === 'push' ? 'Chest, shoulders, triceps' : p.id === 'pull' ? 'Back, biceps, grip' : 'Upper body';
  const names = S.groups.map(g => GN[g].toLowerCase());
  const s = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
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
    const lab = st === 'lo' ? 'low' : st === 'hi' ? 'high' : 'on target';
    return `<li class="${st}"><span class="vb-n">${GN[g]}</span><span class="vb-v">${fmtNum(v)}<em>${lab}</em></span><span class="vb-t"><b style="left:${pct(10)}%;width:${pct(10)}%"></b><i style="width:${Math.max(1.5, +pct(v))}%"></i></span></li>`;
  }).join('');
}

function rxHtml(it) {
  const r = it.rx;
  const unit = r.unit ? ` <small>${r.unit}</small>` : '';
  const side = r.uni ? '<small> per side</small>' : '';
  if (r.circ) return `<div class="rx"><span class="rx-big">${r.reps}${unit}${side}</span></div>`;
  const rest = r.restShown !== undefined ? (r.restShown ? `rest ${fmtRest(r.restShown)}` : 'straight to the next one') : `rest ${fmtRest(r.rest)}`;
  return `<div class="rx"><span class="rx-big">${r.sets} × ${r.reps}${unit}${side}</span><span class="rx-rest">${rest}</span>${r.light ? '<span class="rx-light">scaled down</span>' : ''}</div>`;
}

/* суставы под пиковой нагрузкой — короткая строка в карточке; подробности в разборе движения */
function jointsLine(ex) {
  const zones = typeof stressZones === 'function' ? stressZones(ex) : [];
  if (!zones.length) return '';
  const on = typeof motionPrefs === 'undefined' || motionPrefs.stress !== false;
  return `<p class="c-joints"${on ? '' : ' hidden'} title="Red marks in the movement breakdown show when the load peaks"><span class="stress-dot" aria-hidden="true"></span>Peak load: ${esc(zones.join(', '))}</p>`;
}
function cardHtml(it, idx) {
  const ex = it.ex, r = it.rx;
  const lvl = {};
  for (const m of ex.pri) lvl[m] = 1;
  for (const m of ex.sec) if (!lvl[m]) lvl[m] = 0.38;
  const mus = ex.pri.map(m => `<li class="p">${MUSCLE_NAMES[m]}</li>`).join('') + ex.sec.map(m => `<li class="s">${MUSCLE_NAMES[m]}</li>`).join('');
  const meta = [];
  if (r.tempo) meta.push(`<span title="lowering – pause – lifting – pause, seconds; X — explosive">tempo <b>${r.tempo}</b></span>`);
  if (r.load) meta.push(`<span>${r.load}</span>`);
  const view = ex.anim.catalogRig?'Isometric view · 5 angles':(ex.viewNote || (ex.anim.view === 'front' ? 'front view' : 'side view'));
  return `<li class="card" data-ex="${ex.id}" data-slot="${it.slot}">
  <div class="c-top">
    <div class="motion-tile"><button type="button" class="illus" data-fig="${idx}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Break down the movement: ${esc(it.name)}"><span class="illus-v">${view}</span><span class="illus-zoom" aria-hidden="true">Zoom ↗</span></button><div class="motion-bar"><span class="motion-caption">Starting position</span><button type="button" data-motion-pause="${idx}" aria-label="Pause demo: ${esc(it.name)}" aria-pressed="false">Pause</button></div></div>
    <div class="c-info">
      <div class="c-head"><span class="c-idx">${it.label}</span><span class="c-type">${ex.type === 'c' ? 'compound' : 'isolation'}</span></div>
      <h3 class="c-name">${esc(it.name)}</h3>
      <p class="c-eq">${esc(it.eqLine)}</p>
      ${it.sub ? `<p class="c-sub"><b>Instead of: ${esc(exName(it.sub.from, effEquip(programEquip() || S.equip)))}</b>${it.sub.note ? ` · ${esc(it.sub.note)}` : ''}</p>` : ''}
      ${rxHtml(it)}
      ${meta.length ? `<p class="c-meta">${meta.join('<i>·</i>')}</p>` : ''}
    </div>
  </div>
  <div class="c-mus">
    <div class="c-map">${muscleMapSvg(lvl, {aria:'Working muscles: ' + ex.pri.map(m => MUSCLE_NAMES[m]).join(', ')})}</div>
    <ul class="mus">${mus}</ul>
  </div>
  ${jointsLine(ex)}
  ${logBlock(it)}
  <div class="c-warm">${warmupHtml(it, workWeightOf(it, null))}</div>
  <div class="c-prog">${progressionHint(it)}</div>
  <div class="c-act">
    <button type="button" class="btn-ghost" data-workout="${ex.id}" aria-haspopup="dialog" aria-controls="workout-view">Start workout →</button>
    <button type="button" class="btn-ghost" data-hist="1" aria-expanded="false">${ICON.chart}<span>History</span><small>${histCount(ex.id) || ''}</small></button>
    <button type="button" class="btn-ghost" data-swap="${it.slot}">${ICON.swap}<span>Swap</span></button>
  </div>
  <div class="c-hist" hidden></div>
  <details class="tech">
    <summary>Technique</summary>
    <ol class="t-steps">${ex.tech.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <div class="t-cols">
      <div><h4>Common mistakes</h4><ul class="t-err">${ex.err.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div><h4>Breathing</h4><p>${esc(ex.breath)}</p>${ex.note ? `<h4>Important</h4><p>${esc(ex.note)}</p>` : ''}${r.notes.map(n => `<p class="t-tip">${esc(n)}</p>`).join('')}</div>
    </div>
  </details>
</li>`;
}

function blocksHtml(p) {
  let html = `<p class="phase"><b>Warm-up, 8–10 min.</b> Easy cardio until you break a light sweat, joint mobility, then 1–2 warm-up sets with a light weight in the first exercise.</p>`;
  let idx = 0;
  for (const b of p.blocks) {
    if (b.kind === 'list') {
      html += `<ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol>`;
    } else if (b.kind === 'pair') {
      const many = b.items.length > 1;
      html += `<section class="block">
        <header class="b-head"><h2><span class="b-letter">${b.letter}</span>${many ? 'Superset' : 'Single exercise'}</h2>
        <p>${many ? `${b.sets} ${plural(b.sets, 'round', 'rounds', 'rounds')}: ${b.items.map(it => it.label).join(' → ')} with no break, then rest ${fmtRest(b.rest)}` : `${b.sets} ${plural(b.sets, 'set', 'sets', 'sets')}, rest ${fmtRest(b.rest)}`}</p></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    } else {
      const rd = done.__rounds || 0;
      html += `<section class="block block-c">
        <header class="b-head"><h2><span class="b-letter">${ICON.loop}</span>Circuit × ${b.rounds}</h2>
        <p>Do the stations back to back: ${fmtRest(b.rest)} to move between exercises, ${fmtRest(b.roundRest)} of rest after each round.</p>
        <div class="sets rounds" role="group" aria-label="Mark completed rounds">${Array.from({length:b.rounds}, (_, k) => `<button type="button" class="set${rd > k ? ' done' : ''}" data-round="${k}" aria-label="Round ${k + 1}">${k + 1}</button>`).join('')}<span class="rounds-l">rounds</span></div></header>
        <ol class="cards">${b.items.map(it => cardHtml(it, idx++)).join('')}</ol></section>`;
    }
  }
  html += `<p class="phase"><b>Cool-down, 5 min.</b> Easy walking and stretching of the muscles you worked: 20–30 seconds each.</p>`;
  return html;
}
const LEGEND = `<p class="legend">1RM is the weight you can lift once. Tempo is seconds for the lowering, the pause at the bottom, the lifting and the pause at the top; X means an explosive lift.</p>`;
function warnHtml(p) {
  const warn = [];
  if (p.items.length < p.count) warn.push(`Selected ${p.items.length} ${plural(p.items.length, 'exercise', 'exercises', 'exercises')} of ${p.count}: there are no other options for these muscles and equipment.`);
  if (p.lost && p.lost.length) warn.push(`No substitute here for: ${p.lost.map(ex => ex.name).join(', ')}. ${p.lost.length > 1 ? 'They' : 'It'} can be done at: ${placeOf(S, S.adapt).name}.`);
  if (p.missing.length) warn.push(`No exercises left for: ${p.missing.map(g => GN[g].toLowerCase()).join(', ')}. They need different equipment.`);
  return warn.length ? `<div class="warn">${warn.map(w => `<p>${esc(w)}</p>`).join('')}</div>` : '';
}
function headButtons(copyLabel) {
  return `<div class="p-btns">
        <button type="button" class="btn" id="start-workout" aria-haspopup="dialog" aria-controls="workout-view">Start workout →</button>
        <button type="button" class="btn btn-2" id="reroll">${ICON.dice}<span>Another option</span></button>
        <button type="button" class="btn btn-2" id="copy">${ICON.copy}<span>${copyLabel}</span></button>
        ${S.mode === 'program' ? `<button type="button" class="btn btn-2" id="ics-open">${ICON.cal}<span>Add to calendar</span></button>` : ''}
      </div>
      <p class="p-hint" id="copy-msg" role="status"></p>`;
}
/* акцент, выбранный в атласе мышц */
function focusHtml() {
  if (!S.focus || !MUSCLE_NAMES[S.focus]) return '';
  return `<p class="focus-chip"><span>Focus: <b>${esc(MUSCLE_NAMES[S.focus])}</b></span><button type="button" data-focus-clear="1">Remove focus</button></p>`;
}
function norm(load) { const mx = Math.max(1, ...Object.values(load)); const o = {}; for (const [m, v] of Object.entries(load)) o[m] = v / mx; return o; }

function renderPlan() {
  stopFigures();
  if (S.view === 'journal') { prog = null; plan = null; return renderJournal(); }
  if (S.view === 'atlas') { prog = null; plan = null; return renderAtlas(); }
  if (S.mode === 'program') return renderProgram();
  prog = null;
  plan = buildPlan({swaps:swaps.s || {}});
  const root = $('#plan');
  if (plan.empty === 'groups') {
    root.innerHTML = `<div class="empty"><h2>Pick muscles</h2><p>Select at least one muscle group in the settings and the plan will be built right away.</p></div>`;
    return;
  }
  if (plan.empty === 'none') {
    root.innerHTML = `<div class="empty"><h2>Nothing to build a workout from</h2><p>There are no exercises for the selected muscles with this equipment and level. Add equipment or pick other muscle groups.</p></div>`;
    return;
  }
  const G = GOALS[S.goal];
  const setsWord = S.format === 'circuit' ? plural(plan.totalSets, 'set', 'sets', 'sets') + ' across rounds' : plural(plan.totalSets, 'set', 'sets', 'sets');
  let html = `<header class="p-head">
    <div class="p-sum">
      <p class="eyebrow">${G.name} · ${FORMATS[S.format].name} · ${LEVELS[S.level].name.toLowerCase()}</p>
      <h1 class="p-title">${esc(titleFor())}</h1>
      ${focusHtml()}
      <dl class="stats">
        <div><dt>time</dt><dd>≈${plan.minutes}<small>min</small></dd></div>
        <div><dt>${setsWord}</dt><dd>${plan.totalSets}</dd></div>
        <div><dt>${plural(plan.items.length, 'exercise', 'exercises', 'exercises')}</dt><dd>${plan.items.length}</dd></div>
      </dl>
      ${headButtons('Copy plan')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(plan.load), {labels:true, aria:'Workout load map'})}</div>
      <figcaption>
        <p class="lb-h">Load by muscle, sets</p>
        <ul class="lbars">${loadBars(plan.load)}</ul>
        <p class="lb-note">Assisting work counts as half a set.</p>
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
      <h1 class="p-title">${esc(sp.name)}, ${S.days} ${plural(S.days, 'workout', 'workouts', 'workouts')} per week</h1>
      ${focusHtml()}
      <dl class="stats">
        <div><dt>per week</dt><dd>≈${prog.minutes}<small>min</small></dd></div>
        <div><dt>${plural(prog.sets, 'set', 'sets', 'sets')} per week</dt><dd>${prog.sets}</dd></div>
        <div><dt>cycle week</dt><dd>${S.week}<small>of 4</small></dd></div>
      </dl>
      ${headButtons('Copy week')}
    </div>
    <figure class="p-load">
      <div class="p-map">${muscleMapSvg(norm(prog.load), {labels:true, aria:'Weekly load map'})}</div>
      <figcaption>
        <p class="lb-h">Sets per group per week</p>
        <ul class="vbars">${volBars(prog.gvol, allGroups)}</ul>
        <p class="lb-note">The band is a guide for muscle growth: 10–20 sets per week. A set counts in full for the target group and as half for the other working muscles. ${S.goal === 'strength' ? 'Volume is lower in a strength cycle — that\'s normal.' : ''}</p>
      </figcaption>
    </figure>
  </header>
  <section class="weeks" aria-label="Cycle week">
    <h2>4-week cycle</h2>
    <div class="wk" role="group" aria-label="Cycle week">${WEEKS.map((w, i) => `<button type="button" class="${i + 1 === S.week ? 'on' : ''}" data-week="${i + 1}" aria-pressed="${i + 1 === S.week}"><b>${i + 1}</b><small>${w.name}</small></button>`).join('')}</div>
    <p class="wk-note"><b>${wk.name}.</b> ${esc(wk.note)}</p>
    <p class="rule"><b>How to add weight.</b> Work within the rep range on the card. Once you hit the top of the range in every set, add weight next time — 1–2.5 kg for the upper body, 2.5–5 kg for legs — and start again from the bottom of the range. If you log your sets on the cards, the planner will tell you when to increase. After the deload, repeat the cycle with the new weights.</p>
  </section>
  <nav class="days" role="tablist" aria-label="Days of the week">${prog.days.map((d, i) => `<button type="button" role="tab" class="${i === S.day ? 'on' : ''}" data-day="${i}" aria-selected="${i === S.day}"><b>${WD[d.wd]}</b><span>${esc(d.name)}</span><small>${d.plan.items ? `≈${d.plan.minutes} min` : 'no exercises'}</small></button>`).join('')}</nav>
  <div class="day-head"><h2>${WD_FULL[day.wd]} — ${esc(day.name)}</h2>
    <p>${(plan.groups || DAY_T[day.tid].g).map(g => GN[g].toLowerCase()).join(', ')}${plan.items ? ` · ≈${plan.minutes} min · ${plan.totalSets} ${plural(plan.totalSets, 'set', 'sets', 'sets')}` : ''}</p></div>`;
  if (!plan.items) html += `<div class="empty"><h2>No exercises for this day</h2><p>The selected equipment has nothing to load these muscles. Add equipment or pick a different split.</p></div>`;
  else html += autoregHtml() + warnHtml(plan) + blocksHtml(plan);
  html += LEGEND;
  $('#plan').innerHTML = html;
  if (plan.items) mountFigures();
}

/* ===================== АНАЛОГИ УПРАЖНЕНИЙ =====================
   Замена по смыслу, а не по названию: то же движение (PATTERN), те же работающие мышцы, близкий уровень.
   Каждая замена объясняет, что меняется: другой снаряд, другая мышца в акценте, работа по одной стороне. */
const PATTERN_NAMES = {squat:'squat', hinge:'hip hinge', hpush:'horizontal press', ipush:'incline press', dpush:'decline press',
  fly:'fly', pullover:'pullover', vpull:'vertical pull', hrow:'horizontal row', vpush:'overhead press', raise:'arm raise',
  rear:'rear delts and shoulder blades', curl:'arm curl', ext:'arm extension', lunge:'lunge', bridge:'glute bridge', flex:'crunch',
  hold:'core hold', side:'side bend', calf:'calf raise', grip:'grip', jump:'jumps', burpee:'burpee', climb:'mountain climber',
  adduct:'hip adduction', run:'running', ride:'pedalling', row:'rowing', kneeext:'knee extension', kneeflex:'knee flexion', shrug:'shrugs'};
/* движения, которым не нашлось места в общей таблице */
[['kneeext', 'legext'], ['kneeflex', 'legcurl nordic'], ['shrug', 'shrug'], ['raise', 'frontraise']].forEach(([p, ids]) => ids.split(' ').forEach(id => PATTERN[id] = p));

/* вид сопротивления: от него зависит, как ощущается замена */
const LOAD_KIND_NOTE = {
  band:'band: resistance rises towards the end of the range',
  body:'bodyweight: progress with tempo and range',
  free:'free weight: more work for stabilisers',
  machine:'machine guides the path: less stabilisation',
  cable:'cable: more even load through the range'
};
function loadKind(ex, E) {
  const ids = E ? chosenEquip(ex, E) : ex.eq.map(g => g[0]);
  const cat = id => (EQUIP.find(e => e.id === id) || {}).cat;
  if (ids.some(id => id === 'cable')) return 'cable';
  if (ids.some(id => cat(id) === 'mach' || cat(id) === 'cardio')) return 'machine';
  if (ids.some(id => id === 'band')) return 'band';
  if (ids.some(id => ['db', 'bb', 'kb'].includes(id)) || (E && (ex.opt || []).some(id => ['db', 'kb'].includes(id) && E.has(id)))) return 'free';
  return 'body';
}
function muscleVector(ex) { const v = {}; for (const m of ex.pri) v[m] = 1; for (const m of ex.sec) v[m] = Math.max(v[m] || 0, .45); return v; }
function cosine(a, b) {
  let d = 0, na = 0, nb = 0;
  for (const [k, x] of Object.entries(a)) { na += x * x; if (b[k]) d += x * b[k]; }
  for (const x of Object.values(b)) nb += x * x;
  return na && nb ? d / Math.sqrt(na * nb) : 0;
}
/* близость упражнения b к a: 0…1 с небольшим запасом; движение и мышцы весят больше всего */
function analogScore(a, b) {
  const same = PATTERN[a.id] && PATTERN[a.id] === PATTERN[b.id];
  let s = .55 * cosine(muscleVector(a), muscleVector(b)) + (same ? .35 : 0) + (a.g === b.g ? .1 : 0);
  s -= .05 * Math.max(0, b.lvl - a.lvl);
  s -= .15 * (1 - (EX_W[b.id] ?? 1));
  if (!!a.uni !== !!b.uni) s -= .03;
  if ((a.kind || '') !== (b.kind || '')) s -= .08;
  return s;
}
/* что меняется при замене a → b: коротко, не больше трёх пунктов */
function analogNote(a, b, E) {
  const out = [], name = m => MUSCLE_NAMES[m].toLowerCase();
  if (PATTERN[b.id] && PATTERN[a.id] !== PATTERN[b.id]) out.push('different movement: ' + PATTERN_NAMES[PATTERN[b.id]]);
  const bAll = new Set(b.pri.concat(b.sec)), aAll = new Set(a.pri.concat(a.sec));
  const lost = a.pri.filter(m => !bAll.has(m)), gained = b.pri.filter(m => !aAll.has(m));
  if (lost.length) out.push('less load on: ' + lost.slice(0, 2).map(name).join(', '));
  if (gained.length) out.push('adds: ' + gained.slice(0, 2).map(name).join(', '));
  const ka = loadKind(a), kb = loadKind(b, E);
  if (ka !== kb && LOAD_KIND_NOTE[kb]) out.push(LOAD_KIND_NOTE[kb]);
  if (b.uni && !a.uni) out.push('one side at a time — longer sets');
  return out.slice(0, 3).join('; ');
}
/* лучшие замены упражнения ex среди доступных при оборудовании E */
function analogsFor(ex, E, {exclude = new Set(), lvlMax = 3, limit = 5, min = .45} = {}) {
  const cardio = ex.g === 'cardio';
  return EX.filter(b => b !== ex && !exclude.has(b.id) && available(b, E) && b.lvl <= lvlMax && (b.g === 'cardio') === cardio)
    .map(b => ({ex:b, score:analogScore(ex, b)}))
    .filter(r => r.score >= min)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(r => ({...r, note:analogNote(ex, r.ex, E)}));
}

/* ===================== МЕСТА ТРЕНИРОВОК =====================
   У каждого места свой инвентарь: зал, дом, площадка во дворе. S.equip — инвентарь текущего места. */
const PLACE_DEFAULTS = [
  {id:'gym', name:'Gym', equip:EQUIP.map(e => e.id)},
  {id:'home', name:'Home', equip:['db', 'band', 'abwheel']},
  {id:'street', name:'Outdoors', equip:['pullup', 'dipbars']}
];
function ensurePlaces(s) {
  if (!Array.isArray(s.places) || !s.places.length) {
    s.places = PLACE_DEFAULTS.map(p => ({...p, equip:p.equip.slice()}));
    /* перенос старой настройки: инвентарь, который уже был выбран, становится инвентарём подходящего места */
    const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    const match = s.places.find(p => same(p.equip, s.equip || []));
    if (match) s.place = match.id;
    else { s.place = 'gym'; s.places[0].equip = (s.equip || []).slice(); }
  }
  if (!s.places.some(p => p.id === s.place)) s.place = s.places[0].id;
  if (s.adapt && (!s.places.some(p => p.id === s.adapt) || s.adapt === s.place)) s.adapt = null;
  s.equip = placeOf(s).equip.slice();
  return s;
}
function placeOf(s = S, id = s.place) { return s.places.find(p => p.id === id) || s.places[0]; }
function setPlaceEquip(list) { S.equip = list.slice(); placeOf().equip = list.slice(); }
/* инвентарь, под который собирается программа: своё место или выбранное «как в …» */
function programEquip() { return S.adapt && S.adapt !== S.place ? placeOf(S, S.adapt).equip : null; }
ensurePlaces(S);

/* ---------- Проигрыватель движений: карточки и увеличенный разбор ---------- */
let figs = [], rafId = 0, io = null;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionPrefs = (() => {try {return Object.assign({speed:.5,joints:true,trace:false,vectors:true,muscles:true},JSON.parse(localStorage.getItem('podhod.motion.v2') || '{}'));}catch(e){return {speed:.5,joints:true,trace:false,vectors:true,muscles:true};}})();
if (![.25,.5,1].includes(+motionPrefs.speed)) motionPrefs.speed = .5;
if(typeof motionPrefs.muscles!=='boolean')motionPrefs.muscles=true;
if(typeof motionPrefs.stress!=='boolean')motionPrefs.stress=true;
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
  /* замкнутый цикл (педали, бег, «велосипед»): фаза идёт по кругу без возврата назад */
  if (F.it.ex.anim.loop) {const p=((F.clock%total)+total)%total/total;t=p;index=p<.5?0:2;}
  const a = F.it.ex.anim;
  let labels = a.eccFirst ? ['Lowering','Bottom position','Lifting','Top position'] : ['Working phase','End position','Return','Starting position'];
  if (F.it.ex.id === 'kbswing') labels=['Forward swing','Top position','Backswing','Starting position'];
  if (F.it.ex.id === 'deadlift') labels=['Lifting','Top position','Lowering','Starting position'];
  return {t,index,label:a.hold?'Hold':labels[index],cue:a.hold?a.cues[0]:a.cues[(index<2)!==!!a.eccFirst?0:1],progress:((F.clock%total)+total)%total/total,total};
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
  $('#mv-progress').setAttribute('aria-valuetext',`${m.label}, ${Math.round(m.progress*100)}% of rep`);
  $('#mv-play').textContent=F.paused?'Play':'Pause';
  $('#mv-play').setAttribute('aria-label',F.paused?'Play movement':'Pause movement');
  $('#mv-play').setAttribute('aria-pressed',String(!F.paused));
  $('#mv-position').textContent=`${Math.round(m.progress*100)}% of rep`;
  paintMusclePanel('mv',F,m);paintStressPanel('mv',F,m);
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
   rows.push(`<li class="muscle-region-row" data-muscle-row="${key}" data-deep="${!r.visible}"><span class="muscle-swatch" aria-hidden="true"></span><span class="muscle-row-copy"><span>${esc(r.label)}</span><small>${r.profileBasis==='shared-group'?'Shared group profile':'Illustrative regional emphasis'}</small></span><span class="muscle-level"></span></li>`);
  }
 }
 $('#'+prefix+'-muscle-list').innerHTML=rows.join('');
 const region=$('#'+prefix+'-region');region.innerHTML='<option value="all">All regions</option>'+Object.entries(profile.regions||{}).filter(([,r])=>r.visible).map(([id,r])=>`<option value="${id}">${esc(r.label)}</option>`).join('');
 const saved=motionPrefs.regions?.[it.ex.id]||'all';region.value=profile.regions?.[saved]?.visible?saved:'all';
 const F=prefix==='mv'?detailMotion:workout?.motion;for(const f of [F?.f,F?.extra].filter(Boolean))f.setRegion?.(region.value);
}
function paintMusclePanel(prefix,F,m){
 const panel=$('#'+prefix+'-muscle-panel');if(panel.hidden)return;
 const state=muscleFrame(F.it.ex.anim,m.t,m.index);if(!state)return;
 const note=$('#'+prefix+'-muscle-note');if(note.textContent!==state.note)note.textContent=state.note;
 for(const row of panel.querySelectorAll('[data-muscle-row]')){
  const v=state.values[row.dataset.muscleRow],level=row.querySelector('.muscle-level'),text=row.dataset.deep==='true'?'Deeper':MUSCLE_BANDS[muscleBand(v)];
  row.querySelector('.muscle-swatch').style.backgroundColor=muscleColor(v);
  if(level.textContent!==text)level.textContent=text;
 }
}
/* ---------- нагрузка на суставы: панель с подсказками и красные отрезки шкалы повторения ---------- */
function stressTrack(F){
 const ex=F.it.ex;if(!jointStress(ex).rules.length)return '';
 const N=160,total=F.durations.reduce((a,b)=>a+b,0)||4000,on=[];
 for(let i=0;i<=N;i++){const m=motionFrame({...F,clock:i/N*total*.9999});on.push(jointStressAt(ex,m.t,m.index).length>0);}
 if(!on.some(Boolean))return '';
 const stops=[],pct=i=>(i/N*100).toFixed(2)+'%';let start=0;
 for(let i=1;i<=N+1;i++)if(i>N||on[i]!==on[start]){stops.push(`${on[start]?'var(--hot)':'var(--line)'} ${pct(start)} ${pct(Math.min(i,N))}`);start=i;}
 return `linear-gradient(90deg,${stops.join(',')})`;
}
function configureStressPanel(prefix,F){
 const panel=$('#'+prefix+'-stress-panel');if(!panel||!F)return;
 const rules=jointStress(F.it.ex).rules,toggle=$('#'+prefix+'-stress-toggle'),track=$('#'+prefix+'-stress-track');
 if(toggle){toggle.checked=!!motionPrefs.stress;toggle.disabled=!rules.length;}
 panel.hidden=!rules.length||!motionPrefs.stress;
 $('#'+prefix+'-stress-list').innerHTML=rules.map(r=>`<li data-stress-row="${r.id}"><span class="stress-dot" aria-hidden="true"></span><span><b>${esc(r.zone)}.</b> ${esc(r.what)} <em>${esc(r.tip)}</em></span></li>`).join('');
 if(track){const g=motionPrefs.stress?stressTrack(F):'';track.hidden=!g;track.style.background=g;}
}
function paintStressPanel(prefix,F,m){
 const panel=$('#'+prefix+'-stress-panel');if(!panel||panel.hidden)return;
 const now=new Set(jointStressAt(F.it.ex,m.t,m.index).map(x=>x.rule.id));
 for(const row of panel.querySelectorAll('[data-stress-row]'))row.classList.toggle('on',now.has(row.dataset.stressRow));
}
function changeStressPreference(show){
 motionPrefs.stress=!!show;saveMotionPrefs();
 for(const F of [...figs,detailMotion,workout?.motion].filter(Boolean))for(const f of [F.f,F.extra].filter(Boolean))f.setStress?.(motionPrefs.stress);
 for(const line of document.querySelectorAll('.c-joints'))line.hidden=!motionPrefs.stress;
 if(detailMotion){configureStressPanel('mv',detailMotion);paintMotion(detailMotion,true);}
 if(workout?.motion){configureStressPanel('wv',workout.motion);paintWorkoutMotion();}
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
      if(motionProfile(it.ex.anim)){const note=document.createElement('p');note.className='muscle-tile-note';note.textContent='Color is an educational illustration';note.hidden=!motionPrefs.muscles;btn.closest('.motion-tile').appendChild(note);}
      const pause=btn.closest('.motion-tile').querySelector('[data-motion-pause]');
      if(pause){pause.textContent=F.paused?'Start':'Pause';pause.setAttribute('aria-pressed',String(!F.paused));pause.setAttribute('aria-label',`${F.paused?'Play':'Pause'} demo: ${it.name}`);}
    } catch(e) {console.error('Demo',it.ex.id,e);}
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
  cancelAnimationFrame(rafId);if(io)io.disconnect();io=null;for(const F of figs)disposeMotion(F);figs=[];
}
function previewItem(id) {
  const ex=EXI[id];let E=effEquip(S.equip);
  if(!available(ex,E)) E=effEquip(EQUIP.map(e=>e.id));
  return {ex,name:exName(ex,E),rx:prescribe(ex,S.mode==='program'?WEEKS[S.week-1]:null,E),has:propHas(ex,E),eqLine:equipLine(ex,E)};
}
function selectMotion(it, clock=0) {
  disposeMotion(detailMotion);
  detailMotion={it,f:null,clock,paused:true,durations:motionDurations(it)};
  $('#mv-title').textContent=it.name;
  $('#mv-exercise').value=it.ex.id;
  $('#mv-view').textContent=it.ex.viewNote||(it.ex.anim.view==='front'?'Front view':'Side view');
  $('#mv-speed').value=String(motionPrefs.speed);$('#mv-joints').checked=!!motionPrefs.joints;$('#mv-trace').checked=!!motionPrefs.trace;$('#mv-vectors').checked=!!motionPrefs.vectors;
  $('#mv-tempo').textContent=it.ex.anim.hold?'Hold the position and breathe steadily.':it.ex.anim.timing||it.ex.g==='cardio'||it.ex.kind?'The rhythm is shown schematically. Slowing it down helps you study the movement.':`Prescribed tempo: ${it.rx.tempo}. Playback speed doesn't change the prescription.`;
  const level={};it.ex.pri.forEach(m=>level[m]=1);it.ex.sec.forEach(m=>{if(!level[m])level[m]=.38;});
  $('#mv-muscles').innerHTML=muscleMapSvg(level,{labels:true,aria:'Primary and secondary muscles'});
  $('#mv-primary').textContent=it.ex.pri.map(m=>MUSCLE_NAMES[m]).join(', ');
  $('#mv-secondary').textContent=it.ex.sec.length?it.ex.sec.map(m=>MUSCLE_NAMES[m]).join(', '):'—';
  $('#mv-steps').innerHTML=it.ex.tech.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-errors').innerHTML=it.ex.err.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-breath').textContent=it.ex.breath;
  $('#mv-note').textContent=it.ex.note||'';
  const links=[...(SOURCES_BY_EX[it.ex.id]||[]),...(motionProfile(it.ex.anim)?.sources||[])];
  const src=links.filter((v,i)=>links.findIndex(x=>x[1]===v[1])===i).map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`);
  $('#mv-sources').innerHTML=src.length?`<p class="mv-muscle-label">More on technique</p>${src.join('')}`:'';
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
    if(t.dataset.motionPause!==undefined){const F=figs.find(f=>+f.btn.dataset.fig===+t.dataset.motionPause);if(F){F.paused=!F.paused;t.textContent=F.paused?'Start':'Pause';t.setAttribute('aria-pressed',String(!F.paused));t.setAttribute('aria-label',`${F.paused?'Play':'Pause'} demo: ${F.it.name}`);}return;}
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
  for(const prefix of ['mv','wv'])$('#'+prefix+'-stress-toggle').addEventListener('change',e=>changeStressPreference(e.target.checked));
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
  $('#t-label').textContent = label || 'Rest';
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
    $('#timer').classList.add('over'); $('#t-label').textContent = 'Time for the next set';
    T.id = setTimeout(() => { $('#timer').hidden = true; }, 5000);
  }
}
function adjustRest(d) { if ($('#timer').hidden) return; T.end += d * 1000; T.total = Math.max(1, T.total + d); clearTimeout(T.id); clearInterval(T.id); $('#timer').classList.remove('over'); tick(); T.id = setInterval(tick, 250); }
function stopRest() { clearInterval(T.id); clearTimeout(T.id); $('#timer').hidden = true; }

/* ---------- текст для копирования ---------- */
function blocksText(p) {
  const lines = [];
  for (const b of p.blocks) {
    if (b.kind === 'pair') lines.push(b.items.length > 1 ? `Superset ${b.letter}: ${b.sets} ${plural(b.sets, 'round', 'rounds', 'rounds')}, rest ${fmtRest(b.rest)} after each pair` : `${b.letter}:`);
    if (b.kind === 'circuit') lines.push(`Circuit × ${b.rounds}: transition ${fmtRest(b.rest)}, rest after round ${fmtRest(b.roundRest)}`);
    for (const it of b.items) {
      const r = it.rx;
      const side = r.uni ? ' per side' : '';
      lines.push(r.circ ? `${it.label}. ${it.name} — ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}` : `${it.label}. ${it.name} — ${r.sets} × ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}${b.kind === 'list' ? `, rest ${fmtRest(r.rest)}` : ''}`);
    }
  }
  return lines;
}
function planText() {
  const G = GOALS[S.goal];
  if (S.mode === 'program' && prog) {
    const out = [`${SPLITS[prog.split].name}, ${S.days} ${plural(S.days, 'workout', 'workouts', 'workouts')} per week — ${G.name.toLowerCase()}`,
      `Week ${S.week} of 4: ${prog.week.name.toLowerCase()}. ${prog.week.note}`];
    for (const d of prog.days) {
      out.push('', `${WD_FULL[d.wd]} — ${d.name}${d.plan.items ? `, ≈${d.plan.minutes} min` : ''}`);
      if (d.plan.items) out.push(...blocksText(d.plan)); else out.push('no exercises with the selected equipment');
    }
    return out.join('\n');
  }
  return [`${titleFor()} — ${G.name.toLowerCase()}, ${FORMATS[S.format].name.toLowerCase()}, ≈${plan.minutes} min`, ''].concat(blocksText(plan)).join('\n');
}

/* ---------- события ---------- */
/* место тренировок: название и источник программы */
document.addEventListener('change', e => {
  if (e.target.id === 'place-name') { const v = e.target.value.trim().slice(0, 24); if (v) placeOf().name = v; saveSettings(); renderSetup(); return; }
  if (e.target.id === 'place-adapt') { S.adapt = e.target.value || null; ensurePlaces(S); return regen(); }
});
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
  if (t.dataset.e) { eqOpen = true; const id = t.dataset.e; setPlaceEquip(S.equip.includes(id) ? S.equip.filter(x => x !== id) : S.equip.concat(id)); return regen(); }
  if (t.dataset.ep) { setPlaceEquip(EQUIP_PRESETS.find(p => p.id === t.dataset.ep).eq); return regen(); }
  if (t.dataset.place) { S.place = t.dataset.place; ensurePlaces(S); placeDel = false; return regen(); }
  if (t.dataset.placeAdd !== undefined) {
    const id = 'p' + Date.now().toString(36);
    S.places.push({id, name:'Place ' + (S.places.length + 1), equip:[]});
    S.place = id; ensurePlaces(S); eqOpen = true; placeDel = false; regen();
    const inp = $('#place-name'); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (t.dataset.placeDel !== undefined) {
    if (!placeDel) { placeDel = true; return renderSetup(); }
    S.places = S.places.filter(p => p.id !== S.place); placeDel = false; ensurePlaces(S); return regen();
  }
  if (t.id === 'reroll') { S.seed = (S.seed * 48271 + 11) % 2147483647; regen(); $('#plan').scrollIntoView({behavior:reduceMotion ? 'auto' : 'smooth', block:'start'}); return; }
  if (t.id === 'copy') {
    const txt = planText(), msg = $('#copy-msg');
    const fallback = () => { msg.innerHTML = 'Couldn\'t copy automatically. Select the text:<textarea readonly rows="6"></textarea>'; const ta = msg.querySelector('textarea'); ta.value = txt; ta.focus(); ta.select(); };
    try { navigator.clipboard.writeText(txt).then(() => { msg.textContent = 'Copied — you can paste it into notes or a messenger.'; }, fallback); } catch (err) { fallback(); }
    return;
  }
  if (t.dataset.swap !== undefined) {
    const slot = +t.dataset.swap;
    const cur = plan.items.find(it => it.slot === slot).ex;
    const inPlan = new Set(plan.items.map(it => it.ex.id));
    const lvlMax = S.level === 'beg' ? 2 : 3;
    const tried = new Set((swaps.__tried && swaps.__tried[swapKey() + ':' + slot]) || []);
    /* ближайшие по смыслу: то же движение и те же мышцы — первыми */
    let alts = EX.filter(ex => !inPlan.has(ex.id) && available(ex, plan.E) && ex.lvl <= lvlMax && (ex.g === cur.g || PATTERN[ex.id] === PATTERN[cur.id]))
      .sort((a, b) => analogScore(cur, b) - analogScore(cur, a));
    const msgEl = t.querySelector('span');
    if (!alts.length) { msgEl.textContent = 'No substitute'; setTimeout(() => { msgEl.textContent = 'Swap'; }, 1800); return; }
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
    if (done.__rounds > cur && done.__rounds < b.rounds) startRest(b.roundRest, `Rest after round ${done.__rounds}`);
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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayKey = () => dayKey(new Date());
function fmtDay(k, withYear) {
  if (k === todayKey()) return 'today';
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
    LOG.mode = 'local'; LOG.err = 'Connection to your account was lost — new entries are saved in this browser.'; logRefresh(null);
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
    if (code === 'quota_exceeded') LOG.err = 'Log storage is full. Delete old entries or make a backup.';
    else { LOG.mode = 'local'; LOG.err = 'Couldn\'t save to your account — entries are saved in this browser.'; }
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
function repLabel(ex) { return ex.kind === 'time' ? 'Seconds' : ex.kind === 'dist' ? 'Meters' : 'Reps'; }
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
  const unit = ex.kind === 'time' ? ' s' : ex.kind === 'dist' ? ' m' : '';
  const week = S.mode === 'program' ? WEEKS[S.week - 1] : null;
  const step = stepFor(it);
  const res = {tone:'new', kg:null, reps:[], text:'', prev:null};
  if (!past.length) {
    res.text = lt === 'assist' ? `First entry. Choose a counterweight that lets you do ${lo === hi ? lo : lo + '–' + hi} reps with 2 in reserve.` : lt === 'kg'
      ? (ex.kind === 'dist' ? 'First entry. Take heavy implements you can carry the full distance without stopping.' : `First entry. Pick a weight that lets you do ${lo === hi ? lo : lo + '–' + hi}${unit} with 2 reps in reserve.`)
      : `First entry. Note how many ${ex.kind === 'time' ? 'seconds' : ex.kind === 'dist' ? 'meters' : 'reps'} you did in each set.`;
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
  if (ex.kind === 'dist') { res.tone = 'same'; res.kg = work; res.text = work ? `Last time — ${fmtKg(work)} kg. Try to cover more distance or go heavier.` : `Last time: ${prevList} m.`; return res; }
  if (!week && AR.light && work && (lt === 'kg' || lt === 'assist')) {
    res.tone = 'deload'; res.kg = lt === 'assist' ? Math.max((Math.floor(work / step) + 1) * step, roundTo(work * 1.1, step)) : roundTo(work * .9, step); res.reps = sets.map(() => lo);
    res.text = lt === 'assist' ? `Light mode: counterweight ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.` : `Light mode: ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.`;
    return res;
  }
  if (week && week.deload && work) {
    res.tone = 'deload'; res.kg = lt === 'assist' ? Math.max((Math.floor(work / step) + 1) * step, roundTo(work * 1.15, step)) : roundTo(work * .85, step);
    res.reps = sets.map(() => lo);
    res.text = lt === 'assist' ? `Deload: counterweight ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.` : `Deload: ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.`;
    return res;
  }
  const required=prev.target || (it.rx.circ ? it.rounds : it.rx.sets) || 1;
  const allTop=prev.s.length>=required && Array.from({length:required},(_,k)=>prev.s[k]).every(v=>v && v[1]>=hi && (!work || v[0]===work));
  const anyLow = repsList.some(r => r < lo);
  if (allTop) {
    if (lt === 'kg' && work) {
      res.tone = 'up'; res.kg = work + step; res.reps = sets.map(() => lo);
      res.text = `Increase to ${fmtKg(res.kg)} kg (+${fmtKg(step)}). Last time all sets were at the top of the range: ${prevList}.`;
    } else if (lt === 'assist' && work) {
      res.tone = 'up'; res.kg = Math.max(0, work - step); res.reps = sets.map(() => lo);
      res.text = `Reduce the counterweight to ${fmtKg(res.kg)} kg (−${fmtKg(step)}). Last time all sets were at the top of the range: ${prevList}.`;
    } else if (ex.kind === 'time') {
      res.tone = 'up'; res.kg = work; res.reps = sets.map(() => hi + 10);
      res.text = `All sets at the top of the range. Hold 10 s longer${lt === 'extra' ? ' or add weight' : ''}.`;
    } else {
      res.tone = 'up'; res.kg = work; res.reps = sets.map((x, k) => x[1] + 1);
      res.text = lt === 'extra' ? `All sets at the top of the range (${prevList}). Add weight or slow the lowering to 4 s.` : `All sets at the top of the range (${prevList}). Use a stronger band.`;
    }
    return res;
  }
  if (anyLow) {
    const before = past.length > 1 ? past[past.length - 2].s.filter(Boolean) : [];
    const bWork = before.length ? Math.max(0, ...before.map(x => x[0] || 0)) : 0;
    const lowAgain = work && bWork === work && before.filter(x => x[0] === work).some(x => x[1] < lo);
    if (lt === 'kg' && work && lowAgain) {
      res.tone = 'down'; res.kg = roundTo(work * 0.9, step); res.reps = sets.map(() => lo);
      res.text = `Two workouts in a row below ${lo}${unit} — drop to ${fmtKg(res.kg)} kg and build the reps back up.`;
    } else if (lt === 'assist' && work != null && lowAgain) {
      res.tone = 'down'; res.kg = work + step; res.reps = sets.map(() => lo);
      res.text = `Two workouts in a row below ${lo} — increase the counterweight to ${fmtKg(res.kg)} kg and build the reps back up.`;
    } else {
      res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.max(lo, x[1]));
      res.text = `${work ? `Keep ${fmtKg(work)} kg` : 'Same variation'} and build up to ${lo}${unit} in every set. Last time: ${prevList}.`;
    }
    return res;
  }
  res.tone = 'same'; res.kg = work; res.reps = sets.map(x => Math.min(hi, x[1] + 1));
  res.text = `${work ? `${lt === 'assist' ? 'Same counterweight' : 'Same weight'} — ${fmtKg(work)} kg` : 'Same variation'}, aim for 1${unit || ' rep'} more: last time ${prevList}.`;
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
      ${lt === 'none' ? '' : `<input class="lt-in" id="kg-${ex.id}-${k}" data-f="kg" type="text" inputmode="decimal" autocomplete="off" aria-label="Weight, set ${k + 1}" placeholder="${phKg}" value="${done && v[0] != null ? fmtKg(v[0]) : ''}">`}
      <input class="lt-in" id="rp-${ex.id}-${k}" data-f="reps" type="text" inputmode="numeric" autocomplete="off" aria-label="${repLabel(ex)}, set ${k + 1}" placeholder="${phR}" value="${done ? v[1] : ''}">
      <button type="button" class="lt-ok" data-tick="${ex.id}" data-k="${k}" aria-pressed="${done}" aria-label="Set ${k + 1} done">${ICON.check}</button>
    </div>`;
  }
  return {sg, html:`<p class="sug sug-${sg.tone}"><b aria-hidden="true">${SUG_ICON[sg.tone]}</b><span>${esc(sg.text)}</span></p>
    <div class="lt${lt === 'none' ? ' lt-nokg' : ''}" role="group" aria-label="Set log">
      <div class="lt-h"><span>#</span><span>Last time</span>${lt === 'none' ? '' : `<span>${lt === 'kg' ? 'Weight, kg' : lt === 'assist' ? 'Counterweight' : 'Extra kg'}</span>`}<span>${repLabel(ex)}</span><span></span></div>
      ${rows}
    </div>
    <div class="lt-foot"><button type="button" class="lt-add" data-addset="${ex.id}">+ set</button>${ex.uni ? '<span>reps — per side</span>' : ''}${it.rx.circ ? '<span>row — one round</span>' : ''}</div>`};
}
function logBlock(it) { return `<div class="c-log" data-log="${it.ex.id}">${logRows(it).html}</div>`; }

/* ---------- история упражнения ---------- */
function metricOf(ex) {
  if (loadType(ex) === 'kg' && ex.kind !== 'dist') return {name:'Estimated 1RM', unit:'kg', f:s => { const v = s.s.filter(x => x && x[0] > 0).map(x => e1rm(x[0], x[1])); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'time') return {name:'Best set', unit:'s', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  if (ex.kind === 'dist') return {name:'Best distance', unit:'m', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
  return {name:'Best set', unit:'reps', f:s => { const v = s.s.filter(Boolean).map(x => x[1]); return v.length ? Math.max(...v) : null; }};
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
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend: from ${fv(first.v)} to ${fv(last.v)} ${unit}" data-pts="${data}">
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
  if (!ss.length) return `<p class="h-empty">No entries yet. Log your sets above — history and a chart will appear here.</p>`;
  const m = metricOf(ex);
  const pts = ss.map(s => ({d:s.d, v:m.f(s)})).filter(p => p.v != null).slice(-24);
  const best = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  const rows = ss.slice(-6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}${s.wk ? `<small>wk ${s.wk}</small>` : ''}</span>
    <span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span>
    <button type="button" class="h-del" data-del="${ex.id}" data-d="${s.d}" aria-label="Delete entry for ${fmtDay(s.d, true)}">Delete</button></li>`).join('');
  return `<div class="h-chart"><p class="h-cap">${m.name}, ${m.unit}${best != null ? ` · best ${fmtKg(Math.round(best * 2) / 2)}` : ''}</p>${sparkSvg(pts, m.unit)}</div>
    <ul class="h-list">${rows}</ul>${ss.length > 6 ? `<p class="h-more">Total entries: ${ss.length}. Full history is in the “Log” section.</p>` : ''}`;
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
  const t = m === 'cloud' ? 'Entries are saved to your account and available on any device where you open this page.'
    : m === 'connecting' ? 'Connecting entry storage…'
    : 'Entries are stored in this browser. Make a backup to move your log to another device or to keep it if browser data is cleared.';
  return `<span class="ls-dot ls-${m}" aria-hidden="true"></span><span>${LOG.err ? esc(LOG.err) + ' Make a backup so you don\'t lose your entries.' : t}</span>`;
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
    cells += `<rect class="hm hm${lv}" x="${LX + w * (cell + gap)}" y="${TY + d * (cell + gap)}" width="${cell}" height="${cell}" rx="3" data-tip="${fmtDay(k, true)}: ${n ? n + ' ' + plural(n, 'set', 'sets', 'sets') : 'no workout'}"/>`;
    if (d === 0 && dt.getMonth() !== lastM) { lastM = dt.getMonth(); months += `<text class="hm-l" x="${LX + w * (cell + gap)}" y="10">${MONTHS[lastM]}</text>`; }
  }
  const days = ['Mon', '', 'Wed', '', 'Fri', '', ''].map((t, i) => t ? `<text class="hm-l" x="0" y="${TY + i * (cell + gap) + 11}">${t}</text>` : '').join('');
  const w = LX + W * (cell + gap), h = TY + 7 * (cell + gap);
  return `<svg class="heat" viewBox="0 0 ${w} ${h}" role="img" aria-label="Workout days over 12 weeks">${months}${days}${cells}</svg>
    <p class="hm-legend"><span>less</span><i class="hm0"></i><i class="hm1"></i><i class="hm2"></i><i class="hm3"></i><span>more sets per day</span></p>`;
}
function renderJournal() {
  stopFigures();
  const entries = Object.entries(LOG.data).map(([id, ss]) => [id, ss.filter(x => x.s.some(Boolean))]).filter(([id, ss]) => EXI[id] && ss.length);
  const days = journalDays();
  const sets = entries.reduce((a, [, ss]) => a + ss.reduce((b, x) => b + x.s.filter(Boolean).length, 0), 0);
  const last = entries.reduce((m, [, ss]) => ss[ss.length - 1].d > m ? ss[ss.length - 1].d : m, '');
  entries.sort((a, b) => a[1][a[1].length - 1].d < b[1][b[1].length - 1].d ? 1 : -1);
  const tools = `<div class="j-tools">
      ${LOG.canExport ? `<button type="button" class="btn btn-2" id="exp-json">Full backup (JSON)</button><button type="button" class="btn btn-2" id="exp-csv">Log for Excel</button><button type="button" class="btn btn-2" id="exp-body">Measurements for Excel</button>` : ''}
      <label class="btn btn-2" for="imp-file">Restore from backup</label><input type="file" id="imp-file" accept=".json,application/json" hidden>
    </div><p class="p-hint" id="j-msg" role="status"></p>
    <p class="p-hint">A full backup holds your settings, gear, log and measurements in one file: it moves everything to another phone or brings it back after the browser data is cleared.</p>`;
  let html = `<header class="p-head j-head">
    <div class="p-sum">
      <p class="eyebrow">Log</p>
      <h1 class="p-title">Your progress</h1>
      <dl class="stats">
        <div><dt>${plural(days, 'workout', 'workouts', 'workouts')}</dt><dd>${days}</dd></div>
        <div><dt>${plural(sets, 'set', 'sets', 'sets')}</dt><dd>${sets}</dd></div>
        <div><dt>${plural(entries.length, 'exercise', 'exercises', 'exercises')}</dt><dd>${entries.length}</dd></div>
      </dl>
      <p class="ls" id="log-status">${statusHtml()}</p>
      ${tools}
    </div>
    <figure class="j-heat"><figcaption class="lb-h">Activity over 12 weeks${last ? ` · last workout ${fmtDay(last, true)}` : ''}</figcaption>${heatmap()}</figure>
  </header>${bodyHtml()}`;
  if (!entries.length) {
    html += `<div class="empty"><h2>No entries yet</h2><p>Open the plan and log sets in the exercise cards: weight and reps will be saved here, and the planner will start suggesting when to add weight.</p><button type="button" class="btn" data-view="plan">Go to plan</button></div>`;
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
            <span class="j-name">${esc(ex.name)}<small>${GN[ex.g]} · ${ss.length} ${plural(ss.length, 'entry', 'entries', 'entries')} · ${fmtDay(lastS.d, true)}</small></span>
            <span class="j-val">${lastV != null ? fmtKg(Math.round(lastV * 2) / 2) : '—'}<small>${m.unit}</small>${ch != null ? `<em class="${ch > 0 ? 'pos' : ch < 0 ? 'neg' : ''}">${ch > 0 ? '+' : ''}${ch}%</em>` : ''}</span>
          </summary>
          <div class="j-body">${histHtml(ex).replace(/<p class="h-more">.*?<\/p>/, '')}${ss.length > 6 ? `<details class="j-all"><summary>All entries (${ss.length})</summary><ul class="h-list">${ss.slice(0, -6).reverse().map(s => `<li><span class="h-d">${fmtDay(s.d, true)}</span><span class="h-s">${s.s.filter(Boolean).map(x => (x[0] ? fmtKg(x[0]) + '×' : '') + x[1]).join(' · ')}</span><button type="button" class="h-del" data-del="${id}" data-d="${s.d}">Delete</button></li>`).join('')}</ul></details>` : ''}</div>
        </details>
      </li>`;
    }).join('')}</ul>
    <p class="legend">Estimated 1RM is the weight you could lift once, per the Epley formula: weight × (1 + reps / 30). It rises both when you add weight and when you do more reps with the same weight.</p>`;
  }
  $('#plan').innerHTML = html;
}
function viewTabs() {
  const n = journalDays(), v = ['atlas', 'journal'].includes(S.view) ? S.view : 'plan';
  const tab = (id, label, extra = '') => `<button type="button" role="tab" data-view="${id}" aria-selected="${v === id}" class="${v === id ? 'on' : ''}">${label}${extra}</button>`;
  return tab('plan', 'Plan') + tab('atlas', 'Muscles') + tab('journal', 'Log', ` <small>${n || ''}</small>`);
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
  const rows = [['Date', 'Exercise', 'Muscle group', 'Set', 'Weight, kg', 'Reps / seconds / meters', 'Cycle week']];
  const all = [];
  for (const [id, ss] of Object.entries(LOG.data)) if (EXI[id]) for (const s of ss) s.s.forEach((x, k) => { if (x) all.push([s.d, EXI[id].name, GN[EXI[id].g], k + 1, x[0] != null ? fmtKg(x[0]) : '', x[1], s.wk || '']); });
  all.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1);
  return '﻿' + rows.concat(all).map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\r\n');
}
async function exportLog(kind) {
  const msg = $('#j-msg'), d = todayKey();
  const r = kind === 'csv' ? await saveFile(`lazy-gym-log-${d}.csv`, csvText(), 'text/csv')
    : await saveFile(`lazy-gym-kopiya-${d}.json`, JSON.stringify(backupObject()), 'application/json');
  if (msg) msg.textContent = r === 'ok' ? (kind === 'csv' ? 'Spreadsheet saved. Open it in Excel: columns are separated by semicolons.' : 'Full backup saved. You can restore everything from it right here, on any device.')
    : r === 'declined' ? 'Save canceled.' : 'Couldn\'t save the file.';
}
function importLog(file) {
  const msg = $('#j-msg');
  const rd = new FileReader();
  rd.onload = () => {
    let obj; try { obj = JSON.parse(rd.result); } catch (e) { obj = null; }
    if (!obj || obj.app !== 'podhod' || (!obj.log && !obj.body && !obj.settings)) { if (msg) msg.textContent = 'This is not a Lazy Gym Planner backup. Choose a lazy-gym-kopiya-….json file.'; return; }
    const r = restoreBackup(obj);
    renderJournal();
    const m2 = $('#j-msg');
    const parts = [];
    if (r.exercises) parts.push(`log entries: ${r.sessions} (exercises: ${r.exercises})`);
    if (r.body > 0) parts.push(`measurements: ${r.body}`);
    if (r.settings) parts.push('settings');
    if (m2) m2.textContent = parts.length ? `Restored: ${parts.join(', ')}. Matching dates were merged.` : 'Nothing new in the backup — everything in it is already here.';
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
    if (r) startRest(r, doneN >= total ? 'Rest before the next exercise' : `Rest after set ${doneN}`);
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
    delArm[key] = true; btn.textContent = 'Are you sure?'; btn.classList.add('armed');
    setTimeout(() => { delArm[key] = false; if (btn.isConnected) { btn.textContent = 'Delete'; btn.classList.remove('armed'); } }, 3500);
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

/* ===================== АТЛАС МЫШЦ =====================
   Обратный путь к упражнениям: сначала мышца, потом движения. Список берётся из инвентаря текущего места;
   то, что требует другого инвентаря, показано отдельно с подсказкой, где оно есть. */
const ATLAS_GROUPS = [
  ['Chest & shoulders', ['chest', 'delt_f', 'delt_s', 'delt_r']],
  ['Arms', ['biceps', 'triceps', 'forearms']],
  ['Back', ['lats', 'midback', 'traps', 'lowback']],
  ['Core', ['abs', 'obliques']],
  ['Legs', ['glutes', 'quads', 'hams', 'calves']]
];
const ATLAS_ORDER = ATLAS_GROUPS.flatMap(g => g[1]);
/* что делает мышца — коротко, чтобы было понятно, зачем её тренировать */
const MUSCLE_INFO = {
  chest:'Brings the arms together in front of you and pulls them down from overhead. The upper part works harder in incline presses.',
  delt_f:'Raises the arm forward. Assists in every press, from the chest and overhead.',
  delt_s:'Raises the arm out to the side. It does the most for shoulder width.',
  delt_r:'Moves the arm back and turns the shoulder out. Balances pressing work and keeps the shoulder in position.',
  biceps:'Bends the elbow and turns the palm up. Assists in every pull.',
  triceps:'Straightens the elbow. The long head also moves the upper arm back, so overhead exercises stretch it more.',
  forearms:'Close the hand and hold the grip, bend and straighten the wrist. Often the first to tire in pulls.',
  abs:'Flexes the spine and holds the pelvis. Keeps the lower back from arching in presses and planks.',
  obliques:'Rotate and bend the torso sideways and keep it from twisting.',
  traps:'Lift, squeeze and lower the shoulder blades. The upper part holds the shoulder girdle under load.',
  midback:'Squeeze the shoulder blades together. Work in rows and rear raises and hold your posture.',
  lats:'Pull the arm down and back to the body. The main muscles of pull-ups and rows.',
  lowback:'Keep the spine straight in hinges, pulls and squats; extend the torso.',
  glutes:'Extend the hip — drive you out of a squat and push the hips forward. The gluteus medius keeps the pelvis and knee in line.',
  quads:'Straighten the knee. The rectus femoris also lifts the thigh forward.',
  hams:'Bend the knee and extend the hip. Work in hip hinges and leg curls.',
  calves:'Raise you onto your toes. The gastrocnemius works harder with a straight knee, the soleus with a bent one.'
};
/* мышцы задней поверхности: камера для превью ищет их со спины */
const ATLAS_BACK = new Set(['delt_r', 'triceps', 'traps', 'midback', 'lats', 'lowback', 'glutes', 'hams', 'calves']);
let atlasEx = null, atlasCam = null;
/* ракурсы превью: «спереди» и «сзади» — три четверти, так видно и мышцу, и движение */
const ATLAS_CAMS = {angle:'Front', rear:'Back', side:'Side', above:'Above'};

/* пик учебной кривой участия мышцы в упражнении (0…1) */
function atlasPeak(ex, m) {
  const p = motionProfile(ex.anim)?.muscles?.[m];
  if (p) return Math.max(...p.concentric, ...p.eccentric);
  return ex.pri.includes(m) ? .83 : ex.sec.includes(m) ? .6 : 0;
}
/* порядок в списке: мышца — единственная цель выше, чем одна из нескольких; затем выраженность и «полезность» упражнения */
function atlasScore(ex, m) {
  const pri = ex.pri.includes(m), share = pri ? 1 / Math.sqrt(ex.pri.length) : .45;
  /* кардио нагружает мышцы ног, но силовые упражнения для них идут первыми */
  return share * (.6 + .4 * atlasPeak(ex, m)) * Math.sqrt(EX_W[ex.id] ?? 1) * (ex.g === 'cardio' ? .6 : 1) + (pri && ex.pri[0] === m ? .05 : 0);
}
function atlasNeed(ex, E) {
  return ex.eq.filter(g => !g.some(id => E.has(id))).map(g => g.map(id => eqName(id).toLowerCase()).join(' or '));
}
function atlasFor(m, E) {
  const rows = EX.filter(ex => ex.pri.includes(m) || ex.sec.includes(m))
    .map(ex => ({ex, role:ex.pri.includes(m) ? 'pri' : 'sec', v:atlasPeak(ex, m), score:atlasScore(ex, m)}))
    .sort((a, b) => b.score - a.score || a.ex.lvl - b.ex.lvl);
  const here = rows.filter(r => available(r.ex, E));
  const other = rows.filter(r => !available(r.ex, E)).map(r => ({...r, need:atlasNeed(r.ex, E),
    places:S.places.filter(p => p.id !== S.place && available(r.ex, effEquip(p.equip))).map(p => p.name)}));
  return {pri:here.filter(r => r.role === 'pri'), sec:here.filter(r => r.role === 'sec'), other};
}
function atlasCounts(E) {
  const out = {};
  for (const m of ATLAS_ORDER) out[m] = EX.filter(ex => ex.pri.includes(m) && available(ex, E)).length;
  return out;
}
/* акцент тренировки на мышцу: в разовой тренировке её группа добавляется к выбранным */
function setFocus(m) {
  S.focus = m && MUSCLE_NAMES[m] ? m : null;
  if (S.focus && S.mode !== 'program' && !S.groups.includes(MUSCLE_GROUP[S.focus])) {
    S.groups = S.groups.concat(MUSCLE_GROUP[S.focus]).sort((a, b) => GROUPS.findIndex(x => x.id === a) - GROUPS.findIndex(x => x.id === b));
  }
}
/* ракурс превью, с которого мышцу видно: сравниваем направление на камеру с нормалью груди в середине повторения */
function atlasCamera(ex, m) {
  const R = ex.anim.catalogRig ? ex.anim.catalogRig(.5) : null;
  if (!R || !R.n) return ATLAS_BACK.has(m) ? 'back' : 'front';
  const want = (ATLAS_BACK.has(m) ? -1 : 1), n = [R.n[0] * want, -R.n[1] * want, R.n[2] * want];
  let best = 'side', top = .5;
  for (const key of ['angle', 'rear', 'above', 'front', 'back']) {
    const C = CAMERA3[key], y = C.yaw * Math.PI / 180, e = C.elevation * Math.PI / 180;
    const eye = [-Math.sin(y) * Math.cos(e), -Math.sin(e), Math.cos(y) * Math.cos(e)];
    /* три четверти объёмнее плоского вида, но только если мышца к ним действительно повёрнута */
    /* средняя дельта смотрит вбок: её и отведение руки лучше всего видно прямо спереди */
    const d = eye[0] * n[0] + eye[1] * n[1] + eye[2] * n[2], s = d + ((key === 'angle' || key === 'rear') && d > .4 && m !== 'delt_s' ? .5 : 0);
    if (s > top) { top = s; best = key; }
  }
  return best;
}

/* схема для выбора: средняя дельта выделена из передней и задней, каждая мышца — кнопка */
const ATLAS_SPLIT = {
  delt_f:[['delt_f', [[64, 36], [71, 36], [75, 47], [76, 58], [73, 54], [69, 45], [64, 40]]], ['delt_s', [[71, 36], [73, 36], [80, 42], [82, 53], [78, 61], [76, 58], [75, 47]]]],
  delt_r:[['delt_r', [[67, 36], [73, 36.8], [76, 46], [76.5, 55.5], [72, 48]]], ['delt_s', [[73, 36.8], [75, 37], [81, 43], [82, 53], [78, 58], [76.5, 55.5], [76, 46]]]]
};
function atlasMapSvg(sel, counts) {
  const neutral = new Set(['head', 'neck', 'hand', 'pelvis', 'adduct', 'knee', 'foot', 'flank']);
  const view = (shapes, dx, label) => {
    const by = new Map(), base = [];
    for (const [m, kind, d] of shapes) {
      const parts = ATLAS_SPLIT[m] ? ATLAS_SPLIT[m].map(([id, pts]) => [id, 'p', pts]) : [[m, kind, d]];
      for (const [id, k, dd] of parts) for (const q of [dd, mirrorShape(k, dd)]) {
        if (neutral.has(id)) { base.push(shapeSvg(k, q, {class:'mm-n'})); continue; }
        if (!by.has(id)) by.set(id, []);
        by.get(id).push(shapeSvg(k, q, {class:'mm-b'}));
      }
    }
    let s = `<g transform="translate(${dx},0)">${base.join('')}`;
    for (const [id, list] of by) {
      const on = id === sel, none = !counts[id];
      s += `<g class="am-m${on ? ' on' : ''}${none ? ' none' : ''}" data-atlas-m="${id}" role="button" tabindex="0" aria-pressed="${on}" aria-label="${esc(MUSCLE_NAMES[id])}"><title>${esc(MUSCLE_NAMES[id])}</title>${list.join('')}</g>`;
    }
    return s + `<text x="50" y="216" class="mm-l">${label}</text></g>`;
  };
  return `<svg viewBox="0 0 206 222" class="mmap amap" aria-label="Muscle map: tap a muscle">${view(MAP_FRONT, 0, 'front')}${view(MAP_BACK, 106, 'back')}</svg>`;
}

function atlasRow(r, m, sel) {
  const ex = r.ex, E = effEquip(S.equip), name = exName(ex, E);
  const others = ex.pri.filter(x => x !== m).map(x => MUSCLE_NAMES[x].toLowerCase());
  const how = r.role === 'pri' ? (others.length ? 'together with: ' + others.slice(0, 2).join(', ') : 'main target') : 'mainly works: ' + ex.pri.slice(0, 2).map(x => MUSCLE_NAMES[x].toLowerCase()).join(', ');
  return `<li class="at-row${sel ? ' on' : ''}"><button type="button" class="at-ex" data-atlas-ex="${ex.id}" aria-pressed="${sel}"><span class="at-sw" style="background:${muscleColor(r.v)}" title="${MUSCLE_BANDS[muscleBand(r.v)]}"></span><span class="at-n"><b>${esc(name)}</b><small>${esc(equipLine(ex, E))} · ${esc(how)}${ex.lvl >= 3 ? ' · advanced' : ''}</small></span></button>`
    + `<button type="button" class="at-open" data-atlas-open="${ex.id}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Break down the movement: ${esc(name)}">↗</button></li>`;
}
function atlasList(rows, m, sel, limit) {
  return `<ol class="at-list">${rows.map((r, i) => atlasRow(r, m, r.ex.id === sel).replace('<li class="at-row', i >= limit ? '<li hidden class="at-more at-row' : '<li class="at-row')).join('')}</ol>`
    + (rows.length > limit ? `<button type="button" class="at-show" data-atlas-show="1">Show all: ${rows.length}</button>` : '');
}

function renderAtlas() {
  const m = MUSCLE_NAMES[S.atlasM] ? S.atlasM : 'chest', E = effEquip(S.equip);
  const A = atlasFor(m, E), counts = atlasCounts(E);
  const first = A.pri[0] || A.sec[0];
  if (!atlasEx || ![...A.pri, ...A.sec].some(r => r.ex.id === atlasEx)) { atlasEx = first ? first.ex.id : null; atlasCam = null; }
  const place = placeOf();
  const here = p => { const PE = effEquip(p.equip); return EX.filter(ex => (ex.pri.includes(m) || ex.sec.includes(m)) && available(ex, PE)).length; };
  const name = MUSCLE_NAMES[m], lower = name.toLowerCase();
  let html = `<header class="at-head">
    <p class="eyebrow">Muscle atlas</p>
    <h1 class="p-title">Pick a muscle</h1>
    <p class="at-lead">Tap a muscle to see the exercises that work it, using the equipment of the selected place.</p>
  </header>
  <div class="at-grid">
    <section class="at-pick" aria-label="Muscles">
      <div class="at-map">${atlasMapSvg(m, counts)}</div>
      ${ATLAS_GROUPS.map(([g, ids]) => `<h2 class="at-gh">${g}</h2><div class="at-chips">${ids.map(id => `<button type="button" class="at-chip${id === m ? ' on' : ''}${counts[id] ? '' : ' none'}" data-atlas-m="${id}" aria-pressed="${id === m}"><span>${esc(MUSCLE_NAMES[id])}</span><small>${counts[id] || '—'}</small></button>`).join('')}</div>`).join('')}
      <p class="f-note">The number is how many exercises target the muscle as the main mover at “${esc(place.name)}».</p>
    </section>
    <section class="at-detail" id="at-detail" aria-labelledby="at-name">
      <h2 class="at-name" id="at-name">${esc(name)}</h2>
      <p class="at-desc">${esc(MUSCLE_INFO[m])}</p>
      <div class="at-where"><span class="at-wl">Exercises for this muscle</span><div class="places at-places" role="group" aria-label="Where you train">${S.places.map(p => { const n = here(p); return `<button type="button" class="place${p.id === S.place ? ' on' : ''}" data-place="${p.id}" aria-pressed="${p.id === S.place}"><b>${esc(p.name)}</b><small>${n}</small></button>`; }).join('')}</div></div>
      <div class="at-acts">
        <button type="button" class="btn" data-atlas-focus="${m}">Workout focused on this muscle →</button>
        ${S.focus === m ? '<span class="at-focus-on">Already in focus</span>' : ''}
      </div>`;
  if (first) {
    const it = previewItem(atlasEx);
    html += `<div class="motion-tile at-tile" id="at-preview">
        <button type="button" class="illus" data-fig="0" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Break down the movement: ${esc(it.name)}"><span class="at-stage"></span><span class="illus-zoom" aria-hidden="true">Break down ↗</span></button>
        <div class="motion-bar"><span class="motion-caption">Start position</span><button type="button" data-motion-pause="0" aria-pressed="true">Pause</button></div>
      </div>
      <div class="at-under"><p class="at-pv"><b id="at-pv-name">${esc(it.name)}</b></p><div class="at-cams" role="group" aria-label="View">${Object.entries(ATLAS_CAMS).map(([c, label]) => `<button type="button" data-atlas-cam="${c}" aria-pressed="false">${label}</button>`).join('')}</div></div>
      <p class="at-hint">The chosen muscle is shown in orange: the brighter the colour, the harder it works at that moment of the rep.</p>`;
    if (A.pri.length) html += `<h3 class="at-h">Main mover <small>${A.pri.length}</small></h3>${atlasList(A.pri, m, atlasEx, 8)}`;
    else html += `<p class="warn-inline">No exercise here has ${esc(lower)} as its main target. Below are exercises where it assists, and what the others need.</p>`;
    if (A.sec.length) html += `<h3 class="at-h">Assists <small>${A.sec.length}</small></h3>${atlasList(A.sec, m, atlasEx, 5)}`;
  } else {
    html += `<div class="empty"><h2>Nothing here loads this muscle</h2><p>“${esc(place.name)}” has no suitable equipment. Below is what you would need.</p></div>`;
  }
  if (A.other.length) {
    html += `<details class="at-other"><summary>Needs other equipment <small>${A.other.length}</small></summary><ul class="at-olist">${A.other.map(r => `<li><button type="button" class="at-open at-orow" data-atlas-open="${r.ex.id}" aria-haspopup="dialog" aria-controls="motion-view"><b>${esc(r.ex.name)}</b><small>${r.role === 'pri' ? 'main mover' : 'assists'} · needs: ${esc(r.need.join('; '))}${r.places.length ? ` · available at: ${esc(r.places.join(', '))}` : ''}</small></button></li>`).join('')}</ul></details>`;
  }
  html += `<p class="legend">The map and colours illustrate muscle involvement for teaching; they are not measured muscle activity.</p></section></div>`;
  $('#plan').innerHTML = html;
  mountAtlasPreview(m);
}
function mountAtlasPreview(m = S.atlasM) {
  for (const F of figs) disposeMotion(F);
  figs = [];
  const tile = $('#at-preview');
  if (!tile || !atlasEx) return;
  const it = previewItem(atlasEx), btn = tile.querySelector('.illus');
  const cam = atlasCam || atlasCamera(it.ex, m);
  try {
    const f = createMotionFigure(it.ex.anim, {primary:it.ex.pri, has:it.has, ratio:1.25, t:0, label:it.name, camera:cam, muscles:true});
    f.setRegion?.(m); f.setVectors?.(false); f.setTrace?.(false); f.setJoints?.(false); f.svg.classList.remove('show-joints');
    tile.querySelector('.at-stage').replaceChildren(f.svg);
    const F = {btn, it, f, vis:true, paused:reduceMotion, clock:0, durations:motionDurations(it)};
    figs = [F]; paintMotion(F);
    const pause = tile.querySelector('[data-motion-pause]');
    pause.textContent = F.paused ? 'Start' : 'Pause'; pause.setAttribute('aria-pressed', String(!F.paused));
  } catch (e) { console.error('Atlas', it.ex.id, e); }
  btn.setAttribute('aria-label', 'Break down the movement: ' + it.name);
  $('#at-pv-name').textContent = it.name;
  /* плоский вид спереди или сзади отмечается на ближайшей кнопке */
  const near = {front:'angle', back:'rear'}[cam] || cam;
  for (const b of document.querySelectorAll('[data-atlas-cam]')) b.setAttribute('aria-pressed', String(b.dataset.atlasCam === near));
  for (const b of document.querySelectorAll('[data-atlas-ex]')) { const on = b.dataset.atlasEx === atlasEx; b.setAttribute('aria-pressed', String(on)); b.parentElement.classList.toggle('on', on); }
  scheduleMotionLoop();
}
function selectAtlasMuscle(m, scroll) {
  if (!MUSCLE_NAMES[m]) return;
  S.atlasM = m; atlasEx = null; atlasCam = null; saveSettings(); renderAtlas();
  if (scroll && window.innerWidth < 900) $('#at-detail').scrollIntoView({block:'start', behavior:reduceMotion ? 'auto' : 'smooth'});
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-focus-clear]')) { setFocus(null); regen(); return; }
  if (S.view !== 'atlas') return;
  const g = e.target.closest('[data-atlas-m]');
  if (g) { selectAtlasMuscle(g.dataset.atlasM, true); return; }
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.atlasEx) { atlasEx = t.dataset.atlasEx; atlasCam = null; mountAtlasPreview(); return; }
  if (t.dataset.atlasCam) { atlasCam = t.dataset.atlasCam; mountAtlasPreview(); return; }
  if (t.dataset.atlasOpen) { openMotionItem(previewItem(t.dataset.atlasOpen)); return; }
  if (t.dataset.atlasShow) { for (const li of t.previousElementSibling.querySelectorAll('.at-more')) li.hidden = false; t.remove(); return; }
  if (t.dataset.atlasFocus) { setFocus(t.dataset.atlasFocus); S.view = 'plan'; regen(); $('#plan').scrollIntoView({block:'start'}); return; }
});
document.addEventListener('keydown', e => {
  if ((e.key !== 'Enter' && e.key !== ' ') || !e.target.closest) return;
  const g = e.target.closest('g[data-atlas-m]');
  if (!g) return;
  e.preventDefault(); selectAtlasMuscle(g.dataset.atlasM, true);
  const again = document.querySelector(`g[data-atlas-m="${g.dataset.atlasM}"]`); if (again) again.focus();
});

/* Режим тренировки использует тот же журнал, что и карточки плана. */
let workout=null,workoutTimer=0,workoutReturn=null;
const WORKOUT_STORE='podhod.workout.v3';
function workoutQueue(p){
  const q=[];
  for(const b of p.blocks){
    if(b.kind==='list')for(const it of b.items)for(let k=0;k<it.rx.sets;k++)q.push({it,k,n:it.rx.sets,rest:it.rx.rest,phase:'Straight sets'});
    if(b.kind==='pair')for(let k=0;k<Math.max(b.sets,...b.items.map(it=>it.rx.sets));k++){
      const active=b.items.filter(it=>k<it.rx.sets);active.forEach((it,j)=>q.push({it,k,n:it.rx.sets,rest:j===active.length-1?b.rest:0,phase:`Superset ${b.letter} · round ${k+1}`}));
    }
    if(b.kind==='circuit'){
      const rounds=Math.max(b.rounds,...b.items.map(it=>it.rounds||b.rounds));
      for(let k=0;k<rounds;k++){const active=b.items.filter(it=>k<(it.rounds||b.rounds));active.forEach((it,j)=>q.push({it,k,n:it.rounds||b.rounds,rest:j===active.length-1?b.roundRest:b.rest,phase:`Round ${k+1} of ${rounds}`}));}
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
  $('#wv-set-label').textContent=`${s.phase} · set ${s.k+1} of ${s.n}`;
  $('#wv-equipment').textContent=it.eqLine;
  $('#wv-target').textContent=it.rx.reps+(ex.kind?'':' reps');
  $('#wv-previous').textContent=prev?`${prev[0]!=null?fmtKg(prev[0])+' kg × ':''}${prev[1]} ${ex.kind==='time'?'s':ex.kind==='dist'?'m':'reps'}`:'First entry';
  $('#wv-previous-date').textContent=sg.prev?fmtDay(sg.prev.d,true):'';
  $('#wv-set-chips').innerHTML=workout.queue.map((x,i)=>x.it.ex.id===ex.id?`<button type="button" data-wv-index="${i}" class="${workoutValue(x)?'is-done ':''}${i===workout.index?'is-current':''}" aria-label="Set ${x.k+1}${workoutValue(x)?', done':''}" aria-current="${i===workout.index?'step':'false'}">${workoutValue(x)?'✓ ':''}${x.k+1}</button>`:'').join('');
  $('#wv-unilateral').hidden=!ex.uni;$('#wv-unilateral').textContent='Do both sides. Log the reps for one side.';
  $('#wv-weight-label').hidden=lt==='none';$('#wv-weight-caption').textContent=lt==='extra'?'Extra weight, kg':lt==='assist'?'Counterweight, kg':'Weight, kg';$('#wv-rep-caption').textContent=repLabel(ex);$('#wv-reps').setAttribute('inputmode',ex.kind==='dist'?'decimal':'numeric');
  const draft=workout.drafts[workoutDraftKey(s)],today=todaySession(ex.id,false)?.s||[],last=today.slice(0,s.k).filter(Boolean).slice(-1)[0];
  $('#wv-kg').value=draft?draft.kg:stored?stored[0]!=null?fmtKg(stored[0]):'':last?.[0]!=null?fmtKg(last[0]):prev?.[0]!=null?fmtKg(prev[0]):'';
  $('#wv-reps').value=draft?draft.reps:stored?String(stored[1]):'';$('#wv-reps').placeholder=it.rx.reps;
  $('#wv-input-hint').textContent=lt==='extra'?'Extra weight can be left blank. Enter your actual result.':lt==='none'?'Enter the actual result of the set.':'Weight is filled in from your last entry, if there is one. Adjust it and enter your result.';
  $('#wv-error').textContent='';$('#wv-kg').removeAttribute('aria-invalid');$('#wv-reps').removeAttribute('aria-invalid');
  $('#wv-done').textContent=stored?'Save changes':'Set done';$('#wv-save-status').textContent=stored?'This set is already logged.':'The entry will appear in the main log.';
  $('#wv-suggestion').textContent=sg.text;
  const cue=MOTION_FOCUS[ex.id];$('#wv-setup').textContent=cue?.setup||ex.tech[0];$('#wv-control').textContent=cue?.control||ex.tech[1];$('#wv-breath').textContent=ex.breath;
  disposeMotion(workout.motion);workout.motion={it,f:null,clock:0,paused:reduceMotion,durations:motionDurations(it)};$('#wv-angle').textContent=ex.viewNote||(ex.anim.view==='front'?'Front view':'Side view');
  $('#wv-motion').textContent=reduceMotion?'Play':'Pause';$('#wv-motion').setAttribute('aria-pressed',String(!reduceMotion));mountWorkoutCameras();
  $('#wv-prev').disabled=workout.index===0;$('#wv-next').disabled=workout.index===workout.queue.length-1;
  saveWorkout();workoutTick();
}
function paintWorkoutMotion(){if(!workout?.motion)return;const F=workout.motion,m=motionFrame(F);F.f.at(m.t,m);if($('#wv-cue').textContent!==m.cue)$('#wv-cue').textContent=m.cue;paintMusclePanel('wv',F,m);paintStressPanel('wv',F,m);}
function strictWorkoutNumber(value){const s=String(value).trim().replace(',','.');return /^\d+(\.\d+)?$/.test(s)?Number(s):null;}
function commitWorkout(e){
  if(e)e.preventDefault();if(!workout||$('#wv-active').hidden)return;
  const step=workout.queue[workout.index],ex=step.it.ex,lt=loadType(ex),kgRaw=$('#wv-kg').value.trim(),reps=strictWorkoutNumber($('#wv-reps').value),kg=lt==='none'?null:kgRaw?strictWorkoutNumber(kgRaw):null;
  let bad=null,msg='';
  if(lt!=='none'&&kgRaw&&kg===null){bad=$('#wv-kg');msg='Enter the weight as a number, e.g. 12.5.';}
  else if(lt==='kg'&&(kg===null||kg<=0)){bad=$('#wv-kg');msg='Enter the actual weight used.';}
  else if(reps===null||reps<=0||(!ex.kind&&!Number.isInteger(reps))){bad=$('#wv-reps');msg=ex.kind?'Enter the actual result as a number greater than zero.':'Enter a whole number of reps completed.';}
  if(bad){$('#wv-error').textContent=msg;bad.setAttribute('aria-invalid','true');bad.focus();return;}
  const already=!!workoutValue(step),session=todaySession(ex.id,true);
  while(session.s.length<step.k)session.s.push(null);
  session.s[step.k]=[kg,Math.round(reps*10)/10];session.target=Math.max(session.target||0,step.n);delete workout.drafts[workoutDraftKey(step)];
  logTouch(ex.id);logRefresh([ex.id]);workout.last=workout.index;
  if(already){workoutShow(workout.index);$('#wv-save-status').textContent='Changes saved.';return;}
  const next=workoutFirstOpen(workout.queue,workout.index);
  if(next<0){workoutFinish();return;}
  if(step.rest>0){workout.next=next;workout.restTotal=step.rest;workout.restUntil=Date.now()+step.rest*1000;workoutShowRest();}
  else workoutShow(next);
  saveWorkout();
}
function workoutShowRest(){
  $('#wv-active').hidden=true;$('#wv-rest').hidden=false;$('#wv-finish').hidden=true;
  const next=workout.queue[workout.next];
  $('#wv-next-name').textContent=next.it.name;$('#wv-next-detail').textContent=`${next.phase} · set ${next.k+1} of ${next.n} · ${next.it.rx.reps}${next.it.ex.kind?'':' reps'}`;
  $('#wv-rest-note').textContent='Result saved. Move on when you\'re ready.';workoutTick();$('#wv-continue').focus();
}
function workoutFinish(){
  workout.restUntil=0;workout.next=-1;$('#wv-active').hidden=true;$('#wv-rest').hidden=true;$('#wv-finish').hidden=false;
  const n=workout.queue.filter(workoutValue).length,its=[...new Map(workout.queue.map(s=>[s.it.ex.id,s.it])).values()];
  $('#wv-finish-text').textContent=`Completed ${n} ${plural(n,'set','sets','sets')} in ${its.length} ${plural(its.length,'exercise','exercises','exercises')}.`;
  $('#wv-summary').innerHTML=its.map(it=>`<p><span>${esc(it.name)}</span><strong>${workout.queue.filter(s=>s.it.ex.id===it.ex.id&&workoutValue(s)).length} ✓</strong></p>`).join('');saveWorkout();workoutTick();
}
function workoutTick(){
  if(!workout)return;
  const n=workout.queue.filter(workoutValue).length;$('#wv-progress').max=workout.queue.length;$('#wv-progress').value=n;$('#wv-progress-label').textContent=`${n} of ${workout.queue.length} sets`;
  const elapsed=Math.max(0,Math.floor((Date.now()-workout.started)/60000));$('#wv-elapsed').textContent=elapsed?`${elapsed} min since start`:'';
  if(!$('#wv-rest').hidden){const left=Math.max(0,Math.ceil((workout.restUntil-Date.now())/1000));$('#wv-rest-time').textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;$('#wv-rest-heading').textContent=left?'Rest':'You can keep going';}
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
    if(t.id==='wv-motion'){const m=workout.motion;m.paused=!m.paused;t.textContent=m.paused?'Play':'Pause';t.setAttribute('aria-pressed',String(!m.paused));return;}
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
 $('#mv-view').textContent=CAMERA3[key]?.label||ex.viewNote||(a.view==='front'?'Front view':'Side view');
 $('#mv-camera-hint').textContent=a.cameraHints?.[key]||'';
 $('#mv-camera-hint').hidden=!a.cameraHints;
 const pair=cameras.length>1&&!!motionPrefs.dual;
 $('#mv-dual').checked=!!motionPrefs.dual;$('#mv-second').hidden=!pair;$('#mv-projections').classList.toggle('is-dual',pair);
 F.extra=null;
 if(pair){
  const preferred=motionProfile(a)?.pair,other=preferred!==key&&cameras.includes(preferred)?preferred:cameras.find(c=>c!==key);F.extra=make(other);$('#mv-second-stage').replaceChildren(F.extra.svg);
  $('#mv-second-label').textContent=CAMERA3[other].label;$('#mv-second-hint').textContent=a.cameraHints?.[other]||'';
 }else $('#mv-second-stage').replaceChildren();
 configureMusclePanel('mv',F.it);configureStressPanel('mv',F);paintMotion(F,true);
}
function mountWorkoutCameras(){
 if(!workout?.motion)return;
 const F=workout.motion,ex=F.it.ex,key=motionCamera(ex),m=motionFrame(F);
 disposeMotion(F);F.f=createMotionFigure(ex.anim,{has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera:key,muscles:motionPrefs.muscles});F.f.setVectors(!!motionPrefs.vectors);
 $('#wv-stage').replaceChildren(F.f.svg);$('#wv-cameras').innerHTML=cameraButtons(ex,key);$('#wv-cameras').hidden=!(ex.anim.catalogCameras||ex.anim.cameras);
 $('#wv-angle').textContent=CAMERA3[key]?.label||(ex.anim.view==='front'?'Front view':'Side view');configureMusclePanel('wv',F.it);configureStressPanel('wv',F);paintWorkoutMotion();
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
  return {kind:'stall', ex, since:last3[0].d, text:`${ex.name}: three workouts in a row without progress (${fmtDay(last3[0].d, true)} — ${fmtDay(last3[2].d, true)}). Switch the exercise for 3–4 weeks or work in the range of ${hi + 2}–${hi + 5} reps with a lighter weight.`};
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
  return {kind:'fatigue', n, low, text:`In the last 10 days, ${low} of ${n} entries fell short of the bottom of the rep range. This looks like accumulated fatigue: take a deload week — 40% fewer sets, weights 10–15% lower.`};
}
function layoffCheck() {
  let last = '';
  for (const ss of Object.values(LOG.data)) for (const s of ss) if (s.s.some(Boolean) && s.d > last && s.d < todayKey()) last = s.d;
  if (!last) return null;
  const gap = daysBetween(last, todayKey());
  if (gap < 14) return null;
  return {kind:'layoff', gap, text:`Last entry ${fmtDay(last, true)}, a break of ${gap} ${plural(gap, 'day', 'days', 'days')}. Do your first workout after the break with weights 10% lower than before, then get back to the increment rule.`};
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
    if (r.kind === 'stall') act = `<button type="button" class="btn-ghost" data-ar-swap="${r.ex.id}">${ICON.swap}<span>Swap</span></button>`;
    else if (r.kind === 'fatigue') act = S.mode === 'program' ? `<button type="button" class="btn-ghost" data-ar-deload="1">Start deload</button>` : `<button type="button" class="btn-ghost" data-ar-light="1">${AR.light ? 'Restore normal volume' : 'Lighten the workout'}</button>`;
    return `<li><span class="ar-i ar-${r.kind}" aria-hidden="true"></span><p>${esc(r.text)}</p><div class="ar-act">${act}<button type="button" class="lk" data-ar-dismiss="${esc(key)}">Hide</button></div></li>`;
  }).join('');
  if (!items && !AR.light) return '';
  const lightNote = AR.light ? `<li><span class="ar-i ar-fatigue" aria-hidden="true"></span><p>Light mode: 40% fewer sets, suggested weights 10% lower. Stays on until you turn it off.</p><div class="ar-act"><button type="button" class="btn-ghost" data-ar-light="1">Restore normal volume</button></div></li>` : '';
  return `<section class="ar" aria-label="Load recommendations"><h2>Based on your log</h2><ul>${items}${lightNote}</ul></section>`;
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
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LazyGymPlanner//Workout planner//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Lazy Gym Planner — workouts'];
  const stamp = icsDate(new Date()).replace(/T.*/, 'T000000Z');
  for (let w = 0; w < weeksN; w++) {
    S.week = (w % 4) + 1;
    const pr = buildProgram();
    for (const d of pr.days) {
      if (!d.plan.items) continue;
      const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d.wd); dt.setHours(hh, mm, 0, 0);
      const end = new Date(dt.getTime() + Math.max(30, d.plan.minutes + 15) * 60000);
      const title = `Workout: ${d.name} · week ${S.week} (${pr.week.name.toLowerCase()})`;
      const body = [`${GOALS[S.goal].name}, ${FORMATS[S.format].name.toLowerCase()}, ≈${d.plan.minutes} min`, pr.week.note, ''].concat(blocksText(d.plan)).join('\n');
      lines.push('BEGIN:VEVENT', `UID:podhod-${icsDate(dt)}-${d.tid}@podhod`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(dt)}`, `DTEND:${icsDate(end)}`,
        icsFold(`SUMMARY:${icsEsc(title)}`), icsFold(`DESCRIPTION:${icsEsc(body)}`), 'CATEGORIES:Workout');
      if (ICS.alarm > 0) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', icsFold(`DESCRIPTION:${icsEsc('In ' + (ICS.alarm >= 60 ? ICS.alarm / 60 + ' h' : ICS.alarm + ' min') + ' workout: ' + d.name)}`), `TRIGGER:-PT${ICS.alarm}M`, 'END:VALARM');
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
    <h2>Add to calendar</h2>
    <p class="gear-hint">An .ics file with workouts on your split days (${sched}) for ${ICS.weeks} ${plural(ICS.weeks, 'week', 'weeks', 'weeks')} of the cycle. Open it in your phone or computer calendar — events will be added with a reminder and the workout details.</p>
    <div class="ics-grid">
      <label>First Monday<input id="ics-start" type="date" value="${dayKey(mon)}"></label>
      <label>Start time<input id="ics-time" type="time" value="${ICS.time}"></label>
      <label>Weeks<select id="ics-weeks">${[4, 8, 12].map(n => `<option value="${n}"${n === ICS.weeks ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>Reminder<select id="ics-alarm">${[[0, 'none'], [30, '30 min before'], [60, '1 hour before'], [120, '2 hours before'], [720, '12 hours before']].map(([v, n]) => `<option value="${v}"${v === ICS.alarm ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    </div>
    <p class="gear-hint">Workouts are placed on the weekdays of your split. After week 4 the cycle starts over from week 1.</p>
    <p class="p-hint" id="ics-msg" role="status"></p>
    <div class="gear-btns"><button type="button" class="btn btn-2" id="ics-cancel">Close</button><button type="button" class="btn" id="ics-save">Save file</button></div>
  </form>`;
}
function openIcs() {
  let d = $('#ics-view');
  if (!d) { d = document.createElement('dialog'); d.id = 'ics-view'; d.className = 'gear-view'; document.body.appendChild(d); }
  d.innerHTML = icsDialogHtml(); d.showModal();
}
async function saveIcs() {
  const start = new Date($('#ics-start').value + 'T12:00:00');
  if (isNaN(start)) { $('#ics-msg').textContent = 'Enter a start date.'; return; }
  ICS.time = $('#ics-time').value || '19:00'; ICS.weeks = +$('#ics-weeks').value || 4; ICS.alarm = +$('#ics-alarm').value || 0;
  try { localStorage.setItem(ICS_KEY, JSON.stringify(ICS)); } catch (e) {}
  const txt = icsText(start, ICS.time, ICS.weeks);
  const r = await saveFile(`lazy-gym-workouts-${dayKey(start)}.ics`, txt, 'text/calendar');
  $('#ics-msg').textContent = r === 'ok' ? 'File saved. Open it — your calendar will offer to add the events.' : r === 'declined' ? 'Save canceled.' : 'Couldn\'t save the file.';
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
  std:{name:'Standard', plates:[25, 20, 15, 10, 5, 2.5, 1.25]},
  home:{name:'Home', plates:[20, 10, 5, 2.5, 1.25]},
  fine:{name:'With small plates', plates:[25, 20, 15, 10, 5, 2.5, 1.25, 0.5]}
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
    if (work <= GEAR.bar * 1.6) return [{kg:GEAR.bar, reps:Math.max(8, lo + 4), note:'empty bar'}];
    steps.push({kg:GEAR.bar, reps:10, note:'empty bar'});
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
  if (!s.side.length && s.diff <= 0) return `<span class="pl-empty">empty bar ${fmtKg(GEAR.bar)}</span>`;
  const chips = s.side.map(p => `<i class="pl pl-${String(p).replace('.', '_')}" title="${fmtKg(p)} kg">${fmtKg(p)}</i>`).join('');
  const warn = s.diff > 0.01 ? `<small class="pl-diff">= ${fmtKg(s.total)}, short by ${fmtKg(s.diff)}</small>` : '';
  return `<span class="pl-row" aria-label="Per side: ${s.side.map(fmtKg).join(', ')} kg">${chips}</span>${warn}`;
}
function warmupHtml(it, work) {
  const impl = implementOf(it);
  if (!impl || !work) return '';
  const steps = warmupPlan(work, impl, it.rx.reps);
  if (!steps.length) return '';
  const rows = steps.map((s, i) => `<li><span class="wu-n">${i + 1}</span><span class="wu-kg">${fmtKg(s.kg)}<small>kg</small></span><span class="wu-r">× ${s.reps}</span><span class="wu-note">${s.note}</span>${impl === 'bb' ? `<span class="wu-pl">${s.note === 'empty bar' ? '' : platesHtml(s.kg)}</span>` : ''}</li>`).join('');
  const workRow = impl === 'bb' ? `<li class="wu-work"><span class="wu-n">→</span><span class="wu-kg">${fmtKg(work)}<small>kg</small></span><span class="wu-r">working</span><span class="wu-note"></span><span class="wu-pl">${platesHtml(work)}</span></li>` : '';
  return `<details class="wu"><summary>Warm-up for ${fmtKg(work)} kg<small>${steps.length} ${plural(steps.length, 'set', 'sets', 'sets')}${impl === 'bb' ? ' · plates per side' : ''}</small></summary>
    <ol class="wu-list${impl === 'bb' ? ' wu-bb' : ''}">${rows}${workRow}</ol>
    <p class="wu-note-f">Rest 30–60 s between warm-up sets. ${impl === 'bb' ? `Bar ${fmtKg(GEAR.bar)} kg, plates: ${GEAR.plates.map(fmtKg).join(' · ')} — <button type="button" class="lk" data-gear="1">adjust</button>.` : impl === 'machine' ? 'Weight stack increment assumed to be 5 kg.' : ''}</p>
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
    <h2>Bar and plates</h2>
    <label>Bar weight, kg<input id="gear-bar" type="text" inputmode="decimal" value="${fmtKg(GEAR.bar)}"></label>
    <p class="gear-l">Plate set</p>
    <div class="pres">${Object.entries(PLATE_SETS).map(([k, v]) => `<button type="button" class="pre${cur && cur[0] === k ? ' on' : ''}" data-pset="${k}">${v.name}</button>`).join('')}</div>
    <label>Your plates, kg, comma-separated<input id="gear-plates" type="text" inputmode="decimal" value="${GEAR.plates.map(fmtKg).join(', ')}"></label>
    <p class="gear-hint">The calculator loads one side from the heaviest plate to the lightest. Enter the plates your gym has.</p>
    <div class="gear-btns"><button type="button" class="btn btn-2" value="cancel" id="gear-cancel">Cancel</button><button type="submit" class="btn" id="gear-save">Save</button></div>
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
  {k:'kg', name:'Weight', unit:'kg', main:true},
  {k:'waist', name:'Waist', unit:'cm'}, {k:'chest', name:'Chest', unit:'cm'}, {k:'hips', name:'Hips', unit:'cm'},
  {k:'arm', name:'Biceps', unit:'cm'}, {k:'thigh', name:'Thigh', unit:'cm'}, {k:'calf', name:'Calf', unit:'cm'}, {k:'neck', name:'Neck', unit:'cm'}
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
    LOG.err = 'Could not save measurements to your account — they stay in this browser.'; logRefresh(null);
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
    <label class="b-date">Date<input type="date" id="b-date" value="${todayKey()}" max="${todayKey()}" required></label>
    ${BODY_FIELDS.map(f => { const l = bodyLatest(f.k); return `<label${f.main ? ' class="b-main"' : ''}>${f.name}, ${f.unit}<input class="lt-in" type="text" inputmode="decimal" data-bf="${f.k}" placeholder="${l ? fmtKg(l[f.k]) : '—'}" aria-label="${f.name}, ${f.unit}"></label>`; }).join('')}
    <button type="submit" class="btn">Save</button>
    <p class="b-hint">Fill in what you measured: weight in the morning before eating, girths with a tape measure without pulling it tight, always at the same spots. Leave the rest empty.</p>
  </form>`;
  const rows = [...BODY.rows].reverse();
  const rowHtml = r => `<li><span class="h-d">${fmtDay(r.d, true)}</span><span class="h-s">${BODY_FIELDS.filter(f => r[f.k] != null).map(f => `${f.main ? '' : f.name.toLowerCase() + ' '}${fmtKg(r[f.k])}${f.main ? ' kg' : ''}`).join(' · ')}</span><button type="button" class="h-del" data-bdel="${r.d}" aria-label="Delete the measurement for ${fmtDay(r.d, true)}">Delete</button></li>`;
  const list = rows.length ? `<ul class="h-list b-list">${rows.slice(0, 6).map(rowHtml).join('')}</ul>${rows.length > 6 ? `<details class="j-all"><summary>All measurements (${rows.length})</summary><ul class="h-list b-list">${rows.slice(6).map(rowHtml).join('')}</ul></details>` : ''}` : '';
  return `<section class="b-sec" aria-labelledby="b-title">
    <div class="b-head">
      <div>
        <p class="eyebrow">Body</p>
        <h2 id="b-title">Weight and measurements</h2>
        ${last ? `<p class="b-now"><b>${fmtKg(last.kg)}<small>kg</small></b>${d4 && d4.v ? `<em class="${deltaClass(d4.v)}">${fmtDelta(d4.v)} over 4 wk</em>` : `<em>${fmtDay(last.d, true)}</em>`}</p>` : `<p class="b-empty">No weight entries yet. Weigh yourself once a week at the same time — the chart will show where your mass is going, not daily water swings.</p>`}
        ${chips ? `<ul class="b-chips">${chips}</ul>` : ''}
      </div>
      ${pts.length > 1 ? `<div class="h-chart b-chart"><p class="h-cap">Weight, kg · ${pts.length} ${plural(pts.length, 'entry', 'entries', 'entries')}</p>${sparkSvg(pts, 'kg', 0.1)}</div>` : ''}
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
  const m = $('#j-msg'); if (m) m.textContent = `Measurement for ${fmtDay(d, true)} saved.`;
}
function bodyDelete(btn) {
  if (!btn.classList.contains('armed')) { btn.classList.add('armed'); btn.textContent = 'Are you sure?'; setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Delete'; }, 3000); return; }
  BODY.rows = BODY.rows.filter(r => r.d !== btn.dataset.bdel);
  bodyTouch(false); renderJournal();
}
function bodyCsv() {
  const head = ['Date'].concat(BODY_FIELDS.map(f => `${f.name}, ${f.unit}`));
  const rows = BODY.rows.map(r => [r.d].concat(BODY_FIELDS.map(f => r[f.k] != null ? fmtKg(r[f.k]) : '')));
  return '﻿' + [head].concat(rows).map(r => r.join(';')).join('\r\n');
}
document.addEventListener('submit', e => { if (e.target.id === 'b-form') { e.preventDefault(); bodySubmit(e.target); } });
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.bdel) { bodyDelete(t); return; }
  if (t.id === 'exp-body') { saveFile(`lazy-gym-body-${todayKey()}.csv`, bodyCsv(), 'text/csv').then(r => { const m = $('#j-msg'); if (m) m.textContent = r === 'ok' ? 'Measurements table saved.' : r === 'declined' ? 'Save canceled.' : 'Couldn\'t save the file.'; }); }
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

plural = (n, a, b, c) => n === 1 ? a : c;
DEC = '.';

window.PODHOD_VERSION='4.6.0';window.PODHOD_LANG='en';
