/* ===================== ДВИЖОК ФИГУРЫ ===================== */
const FL = {torso:52, neck:15, headR:10, ua:30, fa:27, hand:7, th:43, sh:42, heel:4, toe:13};
const GROUND = 186;
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
  const pts = [p(-3, 10), p(18, 9), p(36, 12.5), p(50, 10.5), p(57, 3), p(55, -8), p(38, -10), p(16, -9), p(-4, -11), p(-11, -1)];
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
  props:[{k:'line', pts:[add(add([70, 132], dir(52), -4), [-10, -4]), add(add([70, 132], dir(52), 64), [-10, -4])], w:8, cls:'eq-pad-s'},
   {k:'rect', x:48, y:140, w:44, h:7}, {k:'line', pts:[[72, 147], [72, GROUND]], w:4}, {k:'line', pts:[[112, 96], [128, GROUND]], w:3},
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
 tech:['Rope attachment on the low pulley. Stand with your back to the machine, rope behind your head, elbows by your ears, step forward into a split stance.',
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
for (const ex of EX) if (MACHINE_CUES[ex.id]) ex.anim.cues = MACHINE_CUES[ex.id];

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
DEMO.pushup.anim.cues=['Lower your rib cage and hips together, keeping support on palms and toes.','Push the floor away, raising your body as one unit.'];
DEMO.pushup.tech[1]='Bend your elbows and lower your chest, keeping a stable base and torso control. Choose a range you can manage without your hips sagging.';
DEMO.diamond.anim.cues=['Bend your elbows, keeping your hand position and body line.','Straighten your arms and raise your body without your hips sagging.'];
DEMO.bridge.anim.cues=['Lift your hips, keeping your shoulders and feet planted.','Lower your hips smoothly to the starting position.'];
DEMO.hipthrust.anim.cues=['Extend your hips to a line with your torso and thighs without overarching.','Lower your hips smoothly, keeping your back supported on the bench.'];
DEMO.goblet.tech[2]='Lower to a depth where you keep a stable base and back control, then stand up.';
DEMO.goblet.anim.cues=['Bend your knees and hips, keeping the weight close to your chest.','Stand up, keeping your feet on the floor and your torso under control.'];
DEMO.lunge.tech[2]='Front knee travels toward the toes. Keeping your balance, rise to the starting position.';
DEMO.lunge.anim.cues=['Lower between your feet, keeping your balance.','Rise by driving through the front foot; then do the other side.'];
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
const CAMERA3={front:{label:'Front',yaw:0,elevation:0},side:{label:'Side',yaw:90,elevation:0},angle:{label:'Angled',yaw:55,elevation:8}};
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
  }
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
  const rings=[ring(-5,12,8),ring(9,13,9),ring(23,12,8),ring(40,19,11),ring(49,19,9)];
  silhouette(rings.slice(1).flat(),palette.kit);silhouette(rings.slice(0,2).flat(),palette.shorts);
  line3(V3.add(R.sh,R.u,-2),R.head,8.5,'#95a6bd');
  const h=project(R.head),hu=project(V3.add(R.head,R.headU)),a=Math.atan2(hu[0]-h[0],-(hu[1]-h[1]))/D2R;
  queue('ellipse',{cx:f1(h[0]),cy:f1(h[1]),rx:8.5,ry:10,transform:`rotate(${f1(a)} ${f1(h[0])} ${f1(h[1])})`,fill:palette.skin},[R.head],1);
  const nose=[V3.add(V3.add(R.head,R.headN,8),R.headU,2),V3.add(R.head,R.headN,11),V3.add(V3.add(R.head,R.headN,8),R.headU,-3)];
  face(nose,'#a3b3cb');
 }
 function compile(t){records=[];const R=anim.rig3d(t);body(R);R.props.forEach(prop);return{R,records:records.sort((a,b)=>a.depth-b.depth)};}
 // Bounds include equipment, every sampled pose, and the floor; camera stays still.
 for(let i=0;i<=40;i++){compile(i/40);tracePts.push(project(anim.rig3d(i/40).gripL));}
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
 let nodes=[],jointNodes=[];
 function at(t){
  const {R,records}=compile(t);
  records.forEach((s,i)=>{let node=nodes[i];if(!node||node.tagName!==s.tag){const replacement=el(s.tag,{});if(node)node.replaceWith(replacement);else scene.appendChild(replacement);node=nodes[i]=replacement;}for(const attr of [...node.attributes])if(!(attr.name in s.attrs))node.removeAttribute(attr.name);for(const[k,v]of Object.entries(s.attrs))node.setAttribute(k,v);});
  for(let i=records.length;i<nodes.length;i++)nodes[i].remove();nodes.length=records.length;
  const names=['shL','elL','wrL','hipL','knL','anL','shR','elR','wrR','hipR','knR','anR'];
  names.forEach((name,i)=>{const p=project(R[name]),node=jointNodes[i]||(jointNodes[i]=el('circle',{r:2.1,class:'joint-dot'},dots));node.setAttribute('cx',f1(p[0]));node.setAttribute('cy',f1(p[1]));});
  svg.dataset.pose=String(t);allBounds.length=0;
 }
 const setTrace=show=>trace.setAttribute('display',show?'inline':'none');
 at(opts.t||0);const setVectors=vectorGroup(svg,anim,camera);return{svg,at,setTrace,setVectors,camera};
}

function spatialExercise(id,rig,camera,cameras,hints){
 const a=DEMO[id].anim;a.rig3d=rig;a.camera=camera;a.view=camera;a.cameras=cameras;a.cameraHints=hints;
 a.sample=t=>({spatialT:t});delete a._C;delete a._normalized;
}
spatialExercise('latpull',pulldownRig,'front',['front','side'],{
 front:'Watch the symmetry: elbows come down at your sides, grip stays the same.',
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
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*18,180,98],[sign*.35,0,1],[sign*.3,0,1]);
  /* хват за гриф на трапециях */
  const grip=V3.add(V3.add(R.sh,R.u,-2),[sign,0,0],33);
  arm3(R,s,V3.add(grip,R.n,-6),[sign*.3,1,-.6],V3.unit(V3.add(R.n,[0,0,0])));
 }
 const bar=V3.add(V3.add(R.sh,R.u,1),R.n,-8);
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
 const barY=160-60*t;  /* низ: гриф на уровне середины голени; верх: у бёдер */
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,100],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*25,barY,103],[0,0,-1],[0,1,0]);
 }
 const bar=[0,barY,103];
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
spatialExercise('bbbench',benchRig,'side',['side','front'],{
 side:'The bar lowers to the lower chest and travels up and slightly toward the head. Hips stay on the bench.',
 front:'Grip slightly wider than shoulders, forearms nearly vertical at the bottom, elbows don\'t flare to 90°.'
});
spatialExercise('squat',squatRig,'side',['side','front'],{
 side:'Hips move back as the knees bend; the bar travels vertically over midfoot.',
 front:'Knees track toward the toes without caving in. Feet slightly wider than shoulders, heels down.'
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
 const barY=100+40*t, barZ=104-5*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*12,180,98],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*22,barY,barZ],[0,0,-1],[0,1,0]);
 }
 const bar=[0,barY,barZ];
 R.bar=bar;R.props=[{kind:'barbell',c:bar,optional:'bb'},{kind:'dumbbell',c:V3.add(bar,[1,0,0],-22),optional:'db'},{kind:'dumbbell',c:V3.add(bar,[1,0,0],22),optional:'db'}];
 R.contacts=[{p:[-12,184,98],label:'Weight on heels and midfoot'}];
 return R;
}
/* Сплит-присед: передняя нога впереди, опускание вертикально. t=0 верх, t=1 низ. */
function lungeRig(t){
 const R=body3([0,104+30*t,108],0+3*t,0,12);
 leg3(R,'L',[-12,180,122],[0,0,1],[0,0,1]);          /* передняя: голень почти вертикальна */
 /* задняя: колено идёт вниз к полу, голень ложится назад, стопа на носке */
 const knR=[12,R.hipR[1]+FL.th*(0.95-0.2*t),R.hipR[2]-FL.th*(0.3+0.1*t)];
 const d=V3.unit(V3.sub(knR,R.hipR));R.knR=V3.add(R.hipR,d,FL.th);
 const anR=[12,Math.min(176,R.knR[1]+FL.sh*(0.42+0.02*t)),R.knR[2]-FL.sh*(0.9-0.05*t)];
 R.anR=V3.add(R.knR,V3.unit(V3.sub(anR,R.knR)),FL.sh);
 R.heelR=V3.add(R.anR,[0,-6,-5]);R.toeR=V3.add(R.anR,[0,4,8]);
 for(const [s,sign]of [['L',-1],['R',1]]){
  const d=V3.unit([sign*.08,1,0]);R['el'+s]=V3.add(R['sh'+s],d,30);R['wr'+s]=V3.add(R['el'+s],d,27);
  R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
  R.props.push({kind:'dumbbell',c:R['grip'+s],optional:'db'});
 }
 R.contacts=[{p:[-12,184,127],label:'Whole front foot'},{p:[12,182,68],label:'Rear foot on toes'}];
 return R;
}
/* Жим гантелей сидя: спинка вертикальна. t=0 низ (гантели у плеч), t=1 верх. */
function dbpressRig(t){
 const hip=[0,128,90], R=body3(hip,-6,0,12);
 const seatZ0=hip[2]-14, seatZ1=hip[2]+22;
 for(const [s,sign]of [['L',-1],['R',1]]){
  const kn=[sign*12,138,hip[2]+42];R['kn'+s]=kn;R['an'+s]=V3.add(kn,[0,1,0],42);
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
 const low=[0,150,118], high=V3.add(V3.add(hip,R.u,20),R.n,15);
 const bar=[0,low[1]+(high[1]-low[1])*t,low[2]+(high[2]-low[2])*t];
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,100],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*26,bar[1],bar[2]],[sign*.4,-1,-.3],[0,1,0]);
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
DEMO.bulgarian.anim.cues=['Lower your hips and rear knee; both feet stay planted.','Rise using your front leg without pushing off the bench.'];
DEMO.hipthrust.tech=['Rest your lower shoulder blades on a stable bench. Place the padded bar in your hip crease and hold it with your hands.','Plant your feet firmly: at the top your shins are roughly vertical, knees tracking over the toes.','Raise your hips to a shoulders–hips–knees line. Upper back stays in contact with the bench; don\'t add lower-back arch.','Lower your hips smoothly, controlling the barbell and keeping your feet planted.'];
MOTION_FOCUS.latpull={setup:'Thighs under the pads, feet on the floor, slight lean back.',control:'Elbows down, handle past your face to your chest; no torso swinging.'};
MOTION_FOCUS.bulgarian={setup:'Front foot on the floor, top of the rear foot on the bench.',control:'Rear knee travels toward the floor; front foot stays planted.'};
MOTION_FOCUS.hipthrust={setup:'Lower shoulder blades on the edge of the bench; bar in the hip crease.',control:'Drive the hips up by extending them; keep your back and feet in contact.'};
DEMO.chinup.anim.cues=['Pull your body up, driving your elbows down in front of you. Hands stay on the bar.','Lower smoothly, straightening your arms without swinging or craning your neck.'];
DEMO.chinup.tech=['Grab the bar about shoulder-width apart, palms facing you. Hang with control over your shoulder position.','Pull your body up, driving your elbows down in front of your torso. Keep your head and back in line.','Get your chin over the bar without craning your neck; then lower under control until your arms are straight.'];
MOTION_FOCUS.chinup={setup:'Palms-facing grip, about shoulder-width apart.',control:'Elbows down in front of your torso; hands on the bar, no leg kicking.'};
MOTION_SOURCES.push(['Lat pulldown — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],['Bulgarian split squat — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat'],['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']);
MOTION_SOURCES.push(['Chin-ups — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']);

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
const fmtRest = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
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
  let reps = G.reps[t], unit = 'reps';
  if (ex.kind === 'time') { reps = G.time; unit = ''; }
  if (ex.kind === 'dist') { reps = G.dist; unit = ''; }
  const bodyweight = !ex.eq.length && !(ex.opt || []).length;
  let load = G.load[t];
  if (week) {
    const rir = week.rir + (S.level === 'beg' ? 1 : 0);
    const reserve = `${rir} ${plural(rir, 'rep', 'reps', 'reps')} in reserve`;
    if (week.deload) { sets = Math.max(2, Math.round(sets * 0.6)); load = t === 'c' ? `${week.pct[S.goal]} of 1RM, light weight, not to failure` : 'light weight, not to failure'; }
    else {
      if (week.add && t === 'c') sets = Math.min(6, sets + week.add);
      load = t === 'c' ? `${week.pct[S.goal]} of 1RM, ${reserve}` : reserve;
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
  const jv = S.view === 'journal';
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
  const es = new Set(S.equip);
  $('#e-presets').innerHTML = EQUIP_PRESETS.map(p => {
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

function cardHtml(it, idx) {
  const ex = it.ex, r = it.rx;
  const lvl = {};
  for (const m of ex.pri) lvl[m] = 1;
  for (const m of ex.sec) if (!lvl[m]) lvl[m] = 0.38;
  const mus = ex.pri.map(m => `<li class="p">${MUSCLE_NAMES[m]}</li>`).join('') + ex.sec.map(m => `<li class="s">${MUSCLE_NAMES[m]}</li>`).join('');
  const meta = [];
  if (r.tempo) meta.push(`<span title="lowering – pause – lifting – pause, seconds; X — explosive">tempo <b>${r.tempo}</b></span>`);
  if (r.load) meta.push(`<span>${r.load}</span>`);
  const view = (ex.viewNote || (ex.anim.view === 'front' ? 'front view' : 'side view'))+(ex.anim.cameras?' · 2 views':'');
  return `<li class="card" data-ex="${ex.id}" data-slot="${it.slot}">
  <div class="c-top">
    <div class="motion-tile"><button type="button" class="illus" data-fig="${idx}" aria-haspopup="dialog" aria-controls="motion-view" aria-label="Break down the movement: ${esc(it.name)}"><span class="illus-v">${view}</span><span class="illus-zoom" aria-hidden="true">Zoom ↗</span></button><div class="motion-bar"><span class="motion-caption">Starting position</span><button type="button" data-motion-pause="${idx}" aria-label="Pause demo: ${esc(it.name)}" aria-pressed="false">Pause</button></div></div>
    <div class="c-info">
      <div class="c-head"><span class="c-idx">${it.label}</span><span class="c-type">${ex.type === 'c' ? 'compound' : 'isolation'}</span></div>
      <h3 class="c-name">${esc(it.name)}</h3>
      <p class="c-eq">${esc(it.eqLine)}</p>
      ${rxHtml(it)}
      ${meta.length ? `<p class="c-meta">${meta.join('<i>·</i>')}</p>` : ''}
    </div>
  </div>
  <div class="c-mus">
    <div class="c-map">${muscleMapSvg(lvl, {aria:'Working muscles: ' + ex.pri.map(m => MUSCLE_NAMES[m]).join(', ')})}</div>
    <ul class="mus">${mus}</ul>
  </div>
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
function norm(load) { const mx = Math.max(1, ...Object.values(load)); const o = {}; for (const [m, v] of Object.entries(load)) o[m] = v / mx; return o; }

function renderPlan() {
  stopFigures();
  if (S.view === 'journal') { prog = null; plan = null; return renderJournal(); }
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
    <p>${DAY_T[day.tid].g.map(g => GN[g].toLowerCase()).join(', ')}${plan.items ? ` · ≈${plan.minutes} min · ${plan.totalSets} ${plural(plan.totalSets, 'set', 'sets', 'sets')}` : ''}</p></div>`;
  if (!plan.items) html += `<div class="empty"><h2>No exercises for this day</h2><p>The selected equipment has nothing to load these muscles. Add equipment or pick a different split.</p></div>`;
  else html += autoregHtml() + warnHtml(plan) + blocksHtml(plan);
  html += LEGEND;
  $('#plan').innerHTML = html;
  if (plan.items) mountFigures();
}

/* ---------- Проигрыватель движений: карточки и увеличенный разбор ---------- */
let figs = [], rafId = 0, io = null;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionPrefs = (() => {try {return Object.assign({speed:.5,joints:true,trace:false,vectors:true},JSON.parse(localStorage.getItem('podhod.motion.v2') || '{}'));}catch(e){return {speed:.5,joints:true,trace:false,vectors:true};}})();
if (![.25,.5,1].includes(+motionPrefs.speed)) motionPrefs.speed = .5;
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
  let labels = a.eccFirst ? ['Lowering','Bottom position','Lifting','Top position'] : ['Working phase','End position','Return','Starting position'];
  if (F.it.ex.id === 'kbswing') labels=['Forward swing','Top position','Backswing','Starting position'];
  if (F.it.ex.id === 'deadlift') labels=['Lifting','Top position','Lowering','Starting position'];
  return {t,index,label:a.hold?'Hold':labels[index],cue:a.hold?a.cues[0]:a.cues[(index<2)!==!!a.eccFirst?0:1],progress:((F.clock%total)+total)%total/total,total};
}
function paintMotion(F, detailed=false) {
  const m = motionFrame(F); F.f.at(m.t);if(F.extra)F.extra.at(m.t);
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
      const f=buildFigure(it.ex.anim,{primary:it.ex.pri,has:it.has,ratio:1,t:0,label:it.name});
      btn.prepend(f.svg);
      const F={btn,it,f,vis:true,paused:reduceMotion,clock:0,durations:motionDurations(it)};
      figs.push(F);paintMotion(F);
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
  cancelAnimationFrame(rafId);if(io)io.disconnect();io=null;figs=[];
}
function previewItem(id) {
  const ex=EXI[id];let E=effEquip(S.equip);
  if(!available(ex,E)) E=effEquip(EQUIP.map(e=>e.id));
  return {ex,name:exName(ex,E),rx:prescribe(ex,S.mode==='program'?WEEKS[S.week-1]:null),has:propHas(ex,E),eqLine:equipLine(ex,E)};
}
function selectMotion(it, clock=0) {
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
  const src=(SOURCES_BY_EX[it.ex.id]||[]).map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`);
  $('#mv-sources').innerHTML=src.length?`<p class="mv-muscle-label">More on technique</p>${src.join('')}`:'';
  mountDetailCameras();
}
function openMotion(idx) {
  const F=figs.find(f=>+f.btn.dataset.fig===Number(idx));
  detailReturn=document.activeElement;
  selectMotion(F?F.it:previewItem(EX[0].id),F?F.clock:0);
  const d=$('#motion-view');if(!d.open)d.showModal();
  document.documentElement.classList.add('motion-open');
  $('#mv-close').focus();scheduleMotionLoop();
}
function closeMotion() {
  const d=$('#motion-view');detailMotion=null;
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
  $('#mv-joints').addEventListener('change',e=>{motionPrefs.joints=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.svg.classList.toggle('show-joints',e.target.checked);saveMotionPrefs();});
  $('#mv-vectors').addEventListener('change',e=>{motionPrefs.vectors=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setVectors(e.target.checked);saveMotionPrefs();});
  $('#mv-trace').addEventListener('change',e=>{motionPrefs.trace=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setTrace(e.target.checked);saveMotionPrefs();});
  $('#motion-view').addEventListener('cancel',e=>{e.preventDefault();closeMotion();});
  $('#motion-view').addEventListener('close',()=>{detailMotion=null;document.documentElement.classList.remove('motion-open');});
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
    let alts = EX.filter(ex => !inPlan.has(ex.id) && available(ex, plan.E) && ex.lvl <= lvlMax && (ex.g === cur.g || PATTERN[ex.id] === PATTERN[cur.id]))
      .sort((a, b) => (PATTERN[b.id] === PATTERN[cur.id]) - (PATTERN[a.id] === PATTERN[cur.id]));
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
  if (!week && AR.light && work && lt === 'kg') {
    res.tone = 'deload'; res.kg = roundTo(work * 0.9, step); res.reps = sets.map(() => lo);
    res.text = `Light mode: ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.`;
    return res;
  }
  if (week && week.deload && work) {
    res.tone = 'deload'; res.kg = roundTo(work * 0.85, step);
    res.reps = sets.map(() => lo);
    res.text = `Deload: ${fmtKg(res.kg)} kg instead of ${fmtKg(work)}, not to failure.`;
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
  const n = journalDays();
  return `<button type="button" role="tab" data-view="plan" aria-selected="${S.view !== 'journal'}" class="${S.view !== 'journal' ? 'on' : ''}">Plan</button>
    <button type="button" role="tab" data-view="journal" aria-selected="${S.view === 'journal'}" class="${S.view === 'journal' ? 'on' : ''}">Log <small>${n || ''}</small></button>`;
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
  if(!workout)return;workoutCapture();saveWorkout();clearInterval(workoutTimer);workoutTimer=0;
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
  workout.motion={it,f:null,clock:0,paused:reduceMotion,durations:motionDurations(it)};$('#wv-angle').textContent=ex.viewNote||(ex.anim.view==='front'?'Front view':'Side view');
  $('#wv-motion').textContent=reduceMotion?'Play':'Pause';$('#wv-motion').setAttribute('aria-pressed',String(!reduceMotion));mountWorkoutCameras();
  $('#wv-prev').disabled=workout.index===0;$('#wv-next').disabled=workout.index===workout.queue.length-1;
  saveWorkout();workoutTick();
}
function paintWorkoutMotion(){if(!workout?.motion)return;const m=motionFrame(workout.motion);workout.motion.f.at(m.t);if($('#wv-cue').textContent!==m.cue)$('#wv-cue').textContent=m.cue;}
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
    if(t.id==='wv-technique'){workoutCapture();const F=figs.find(f=>f.it.ex.id===workout.queue[workout.index].it.ex.id);if(F)openMotion(F.btn.dataset.fig);}
  });
}

function motionCamera(ex){
 const cameras=ex.anim.cameras||[],saved=motionPrefs.views?.[ex.id];
 return cameras.includes(saved)?saved:ex.anim.camera||ex.anim.view;
}
function cameraButtons(ex,current){
 return (ex.anim.cameras||[]).map(key=>`<button type="button" data-motion-camera="${key}" aria-pressed="${current===key}">${CAMERA3[key].label}</button>`).join('');
}
function rememberCamera(ex,key){
 if(!ex.anim.cameras?.includes(key))return false;
 motionPrefs.views=Object.assign({},motionPrefs.views,{[ex.id]:key});saveMotionPrefs();return true;
}
function mountDetailCameras(){
 if(!detailMotion)return;
 const F=detailMotion,ex=F.it.ex,a=ex.anim,key=motionCamera(ex),cameras=a.cameras||[];
 const m=motionFrame(F),make=camera=>{
  const f=buildFigure(a,{primary:ex.pri,has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera});
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
  const other=cameras.find(c=>c!==key);F.extra=make(other);$('#mv-second-stage').replaceChildren(F.extra.svg);
  $('#mv-second-label').textContent=CAMERA3[other].label;$('#mv-second-hint').textContent=a.cameraHints?.[other]||'';
 }else $('#mv-second-stage').replaceChildren();
 paintMotion(F,true);
}
function mountWorkoutCameras(){
 if(!workout?.motion)return;
 const F=workout.motion,ex=F.it.ex,key=motionCamera(ex),m=motionFrame(F);
 F.f=buildFigure(ex.anim,{has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera:key});F.f.setVectors(!!motionPrefs.vectors);
 $('#wv-stage').replaceChildren(F.f.svg);$('#wv-cameras').innerHTML=cameraButtons(ex,key);$('#wv-cameras').hidden=!ex.anim.cameras;
 $('#wv-angle').textContent=CAMERA3[key]?.label||(ex.anim.view==='front'?'Front view':'Side view');paintWorkoutMotion();
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
      const clean = ss.map(x => ({d:x.d, ...(x.wk ? {wk:+x.wk} : {}), s:x.s.map(v => Array.isArray(v) && isFinite(+v[1]) ? [v[0] == null || v[0] === '' ? null : +v[0], +v[1]] : null)}));
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

window.PODHOD_VERSION='4.1.4';window.PODHOD_LANG='en';
