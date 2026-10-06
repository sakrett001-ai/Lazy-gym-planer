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
