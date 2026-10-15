'use strict';
/* Аудит хватов: как кисти держат снаряд и опираются на опору, во всех упражнениях, вариантах инвентаря и кадрах.
   node tools/mannequin/holds-audit.js [--only id,id] [--samples 41] [--json file] [--all] [--baked]
   --all — все строки (по умолчанию — только подозрительные), --baked — ключи из src/js/09bp-poses.js, а не из спецификаций.

   Валидатор (tools/biomech/validator2.js) проверяет только заявленные контакты: хват gripL/R — центр хвата у оси ручки,
   контакт областью кисти (handL/R, palmL/R) — касание любой точкой кисти, хоть краем кулака. Здесь — то, что видит глаз:
   * кулак (grip/hook): расстояние центра хвата до оси ближайшей ручки (гриф, рукоять, дужка, канат, полотенце) и угол
     между осью кулака и ручкой; заявлен хват или нет. «Кулак держит воздух» — ручки нет ближе 3 см от центра хвата;
   * ладонь (flat): зазор центра ладони до ближайшей поверхности (инвентарь, пол, тело), доля ладони и пальцев в касании
     (до 1 см) и наклон ладони к поверхности; при заявленном контакте ладони — до заявленной детали;
   * контакт областью кисти на свободном снаряде (гантель, гиря, диск, мяч) — каждый в список «посмотреть глазами»;
   * снаряд двумя руками (mount 'hands') — обе кисти на нём: центр хвата или ладони у оси ручки;
   * трос, лента, канат у кисти: угол каната или полотенца к оси кулака, глубина оси троса в кисти (ладонь и пальцы) и в
     предплечье — валидатор вокруг центра хвата (9 см) трос не проверяет.
   Варианты инвентаря: has не задан — весь необязательный инвентарь «есть», «без» — has: () => false; при нескольких
   ключах — каждый по отдельности; поза — своего варианта (GymEquipment.variantEntry). */
const fs = require('node:fs'), path = require('node:path');
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const { collider } = require('../biomech/validator2.js');
const { V } = M, FLOOR = M.FLOOR;

/* пороги «подозрительно» (не ошибки валидатора — повод посмотреть глазами) */
const LIM = {
  gripAxis: 2.0,     // см: центр хвата дальше от оси заявленной ручки
  air: 3.0,          // см: кулак 'grip' без ручки ближе этого — «держит воздух»
  gripAngle: 30,     // °: ось кулака поперёк ручки
  palmGap: 1.0,      // см: центр ладони над заявленной опорой
  palmCover: .25,    // доля ладони и пальцев в касании (до 1 см); у ладоней под диском гантели пальцы выходят за диск
  palmTilt: 35,      // °: ладонь наклонена к поверхности (касается краем)
  handGap: 1.5,      // см: кисть (контакт handL/R не ладонью) дальше от опоры — как допуск контакта в валидаторе
  cupAxis: 7,        // см: центр ладони под гантелью дальше от оси рукояти — у края диска (радиус 7,5)
  ropeAngle: 35,     // °: канат/полотенце поперёк кулака
  cableHand: .5,     // см: ось троса в кисти глубже (ладонь, пальцы — кроме отверстия кулака)
  cableArm: .5       // см: ось троса в предплечье глубже
};
const GRIPPY = new Set(['grip', 'hook']);

/* ---------- геометрия ---------- */
const segDist = (p, a, b) => { const ab = V.sub(b, a), l2 = V.dot(ab, ab), k = l2 < 1e-9 ? 0 : M.clamp(V.dot(V.sub(p, a), ab) / l2, 0, 1); return { d: V.dist(p, V.add(a, ab, k)), k, dir: l2 < 1e-9 ? [0, 0, 1] : V.unit(ab) }; };
function polyDist(p, pts) { let best = { d: Infinity }; for (let i = 1; i < pts.length; i++) { const r = segDist(p, pts[i - 1], pts[i]); if (r.d < best.d) best = { ...r, i }; } return best; }
/* расстояние центра хвата до оси ручки и направление ручки в ближайшей точке; у коробок и прочих — до поверхности */
function axisOf(c, p) {
  if (c.axis) { const r = segDist(p, c.axis[0], c.axis[1]); return { d: r.d, dir: r.dir, r: c.r || 0, ends: r.k <= 0 || r.k >= 1 }; }
  if (c.cable) { const r = polyDist(p, c.pts); return { d: r.d, dir: r.dir, r: c.r || 0, cable: true }; }
  return { d: c.sdf(p), r: 0, surface: true };
}
const angleTo = (a, b) => { const x = V.angle(a, b); return Math.min(x, 180 - x); };
/* кисть в координатах каталога (как M.handShape и сетка в приложении): ладонь смотрит в −g·x, пальцы — в −y */
function handGeo(R, s) {
  const f = R.frames['hand' + s], g = M.SIGN[s], L = p => V.add(V.add(V.add(f.o, f.x, p[0]), f.y, p[1]), f.z, p[2]);
  const mode = R.hands?.[s] || 'relaxed', sh = M.handShape(mode, s, R.gripRadius?.[s] ?? 1.4), n = V.scale(f.x, -g);
  const palmC = L([-g * 1.7, -5.6, .15]);
  /* ладонная поверхность: 3 × 3 точки ладони и подушечки пальцев (средняя и концевая фаланги) */
  const face = [];
  for (const v of [1.6, 5.6, 9.6]) for (const w of [-3.8, .15, 4.1]) face.push(L([-g * 1.7, -v, w]));
  for (const fg of sh.fingers) for (const p of fg.pts.slice(-2)) face.push(V.add(L(p), n, fg.r));
  /* объём кисти для тросов: ладонь (коробка) и фаланги (капсулы) */
  const box = { c: L(sh.palm.c), ax: [f.x, f.y, f.z], half: sh.palm.size.map(v => v / 2) };
  const caps = []; for (const fg of [...sh.fingers, sh.thumb]) for (let i = 1; i < fg.pts.length; i++) caps.push([L(fg.pts[i - 1]), L(fg.pts[i]), fg.r]);
  const sdf = p => {
    const d = V.sub(p, box.c), q = box.ax.map((a, i) => Math.abs(V.dot(d, a)) - box.half[i]);
    let m = V.len(q.map(v => Math.max(v, 0))) + Math.min(Math.max(...q), 0);
    for (const [a, b, r] of caps) m = Math.min(m, segDist(p, a, b).d - r);
    return m;
  };
  /* вся поверхность кисти (ладонь с обеих сторон, фаланги) — чем кисть касается опоры, если не ладонью */
  const all = [];
  for (const u of [-1.5, 1.5]) for (const v of [-4.3, 0, 4.3]) for (const w of [-4.2, 0, 4.2]) all.push({ p: V.add(V.add(V.add(box.c, f.x, u), f.y, v), f.z, w), r: 0 });
  for (const [a, b, r] of caps) all.push({ p: a, r }, { p: V.mix(a, b, .5), r }, { p: b, r });
  return { f, g, mode, grip: R['grip' + s], palmC, n, face, sdf, all };
}
/* поверхности для ладони: инвентарь (кроме тросов), пол и тело (бёдра, голени, корпус, голова, рука другой стороны) */
function surfaces(R, cols, s) {
  const out = cols.filter(c => !c.cable && !c.unknown).map(c => ({ id: c.id + (c.part ? '/' + c.part : ''), prop: c.id, sdf: c.sdf, free: c.free }));
  out.push({ id: 'пол', prop: 'floor', sdf: p => FLOOR - p[1] });
  const cache = M.torsoCache(R), o = s === 'L' ? 'R' : 'L';
  out.push({ id: 'тело/корпус', body: true, sdf: p => M.torsoSDF(R, p, cache) }, { id: 'тело/голова', body: true, sdf: p => M.headSDF(R, p) });
  for (const k of ['th', 'sk']) for (const sd of M.SIDES) out.push({ id: `тело/${k}${sd}`, body: true, sdf: p => M.limbSDF(R, k, sd, p) });
  for (const k of ['ua', 'fa']) out.push({ id: `тело/${k}${o}`, body: true, sdf: p => M.limbSDF(R, k, o, p) });
  return out;
}
function palmOn(H, surf) {
  const gap = surf.sdf(H.palmC), touch = H.face.filter(p => surf.sdf(p) < 1).length / H.face.length, h = .25;
  const grad = [0, 1, 2].map(i => { const a = [...H.palmC], b = [...H.palmC]; a[i] += h; b[i] -= h; return (surf.sdf(a) - surf.sdf(b)) / (2 * h); });
  const tilt = V.len(grad) > 1e-6 ? V.angle(V.scale(H.n, -1), V.unit(grad)) : 0;
  /* ближайшая точка всей кисти (касание тылом, краем кулака, пальцами) */
  const any = Math.min(...H.all.map(q => surf.sdf(q.p) - q.r));
  return { gap, touch, tilt, any };
}

/* ---------- одно упражнение, один вариант ---------- */
function variantsOf(e) {
  const keys = [...new Set((e.equipment || []).flatMap(q => [q.optional, q.optionalNot]).filter(Boolean))];
  if (!keys.length) return [{ label: '', has: undefined }];
  const out = [{ label: 'с ' + keys.join('+'), has: undefined }, { label: 'без ' + keys.join('+'), has: () => false }];
  if (keys.length > 1) for (const k of keys) out.push({ label: 'только ' + k, has: x => x === k });
  return out;
}
function auditEntry(id, e, { samples = 41 } = {}) {
  const rows = [];
  for (const vr of variantsOf(e)) {
    const ev = EQ.variantEntry(e, vr.has), rig = EQ.rig(ev), has = vr.has || (() => true), acc = {};
    const row = (key, init) => acc[key] || (acc[key] = { id, variant: vr.label + (ev.variant ? ` [поза ${ev.variant}]` : ''), ...init });
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1), R = rig(t), props = R.props.filter(p => EQ.visible(p, has)), cols = props.flatMap(collider);
      const ids = new Set(cols.map(c => c.id)), present = k => k.prop === 'floor' || [...ids].some(x => x === k.prop || x.startsWith(k.prop + ':'));
      const contacts = (ev.contacts || []).filter(k => !(k.when && (t < k.when[0] - 1e-6 || t > k.when[1] + 1e-6)) && present(k));
      const of = k => cols.filter(c => c.id === k.prop || c.id.startsWith(k.prop + ':'));
      for (const s of M.SIDES) {
        const H = handGeo(R, s), mine = contacts.filter(k => /^(grip|hand|palm)(L|R)$/.test(k.body) && k.body.endsWith(s));
        const r = row('hand' + s, { side: s, kind: 'кисть', modes: new Set(), contacts: new Set() });
        r.modes.add(H.mode); for (const k of mine) r.contacts.add(k.body + '→' + k.prop);
        /* кулак: ось ближайшей ручки */
        if (GRIPPY.has(H.mode) || mine.some(k => k.body.startsWith('grip'))) {
          const decl = mine.filter(k => k.body.startsWith('grip')).flatMap(of);
          const handles = cols.filter(c => (c.grip || c.role === 'grip') && !c.unknown).concat(decl.filter(c => !(c.grip || c.role === 'grip')));
          let best = null;
          for (const c of handles) { const a = axisOf(c, H.grip); if (!best || a.d < best.off) best = { off: a.d, a, c }; }
          const declBest = decl.length ? decl.map(c => ({ a: axisOf(c, H.grip), c })).sort((x, y) => x.a.d - y.a.d)[0] : null;
          const use = declBest || best;
          if (use) {
            const ang = use.a.dir ? angleTo(H.f.z, use.a.dir) : null, name = use.c.id + (use.c.part ? '/' + use.c.part : '');
            if (r.axis == null || use.a.d > r.axis) Object.assign(r, { axis: use.a.d, axisR: use.a.r, axisT: t, handle: name + (use.a.ends ? ' (у конца)' : ''), declared: !!declBest, surface: !!use.a.surface });
            if (ang != null && (r.angle == null || ang > r.angle)) Object.assign(r, { angle: ang, angleT: t });
          }
          if (H.mode === 'grip' && (!best || best.off > LIM.air) && !mine.length) { r.air = (r.air || 0) + 1; r.airT = r.airT ?? t; }
        }
        /* ладонь: заявленная опора или ближайшая поверхность. Ладонь (palmL/R или кисть 'flat') — ладонью: центр ладони у
           поверхности, ладонь и пальцы в касании, ладонь не наклонена; кисть (handL/R, не 'flat') — любой точкой */
        if (H.mode === 'flat' || mine.some(k => !k.body.startsWith('grip'))) {
          const S = surfaces(R, cols, s), declPalm = mine.filter(k => !k.body.startsWith('grip'));
          let target = null;
          if (declPalm.length) {
            const list = declPalm.map(k => k.prop === 'floor' ? S.find(x => x.prop === 'floor') : { id: k.prop, prop: k.prop, free: of(k).some(c => c.free || c.mount === 'hands'), sdf: p => Math.min(...of(k).map(c => c.sdf(p))) });
            target = list.map(x => ({ x, o: palmOn(H, x) })).sort((a, b) => a.o.gap - b.o.gap)[0];
            if (target.x.free) r.freeRegion = true;
          } else {
            const best = S.map(x => ({ x, d: x.sdf(H.palmC) })).sort((a, b) => a.d - b.d)[0];
            target = { x: best.x, o: palmOn(H, best.x) };
          }
          const o = { ...target.o, byPalm: H.mode === 'flat' || declPalm.some(k => k.body.startsWith('palm')) }, k = declPalm.length ? 'decl' : 'near';
          r.palm = r.palm || { decl: null, near: null };
          const prev = r.palm[k];
          const score = x => x.byPalm ? Math.max(x.gap / LIM.palmGap, (1 - x.touch) / (1 - LIM.palmCover), x.tilt / LIM.palmTilt) : x.any / LIM.handGap;
          if (!prev || (k === 'decl' ? score(o) > score(prev) : o.gap < prev.gapMin)) r.palm[k] = { ...o, on: target.x.id, t, gapMin: Math.min(prev?.gapMin ?? Infinity, o.gap), gapMax: Math.max(prev?.gapMax ?? -Infinity, o.gap) };
          else { prev.gapMin = Math.min(prev.gapMin, o.gap); prev.gapMax = Math.max(prev.gapMax, o.gap); }
        }
      }
      /* снаряд двумя руками: гантель под ладонями (g2CupDumbbell) — ладони у оси рукояти */
      for (const p of props.filter(p => /:handle$/.test(p.id) && props.some(q => q.id === p.id.replace(/:handle$/, ':top') && q.mount === 'hands'))) {
        for (const s of M.SIDES) {
          const H = handGeo(R, s), d = segDist(H.palmC, p.a, p.b).d, r = row('cup' + s, { side: s, kind: 'гантель в ладонях', handle: p.id });
          if (r.axis == null || d > r.axis) Object.assign(r, { axis: d, axisT: t });
        }
      }
      /* тросы, ленты, канаты у кистей */
      for (const c of cols.filter(c => c.cable && c.role !== 'strap')) {
        for (const s of M.SIDES) {
          const H = handGeo(R, s), near = polyDist(H.grip, c.pts);
          if (near.d > 15) continue;
          const r = row('cable' + s + c.id, { side: s, kind: 'трос', cable: c.id, role: c.role, tone: c.tone });
          /* канат и полотенце — сами ручка: проходят сквозь кулак вдоль его оси */
          if (c.role === 'grip' && near.d < 2.5) { const a = angleTo(H.f.z, near.dir); if (r.angle == null || a > r.angle) Object.assign(r, { angle: a, angleT: t }); }
          let hand = -Infinity, arm = -Infinity;
          for (let j = 1; j < c.pts.length; j++) {
            const a = c.pts[j - 1], b = c.pts[j], n = Math.max(1, Math.ceil(V.dist(a, b) / .5));
            for (let k = 0; k <= n; k++) {
              const p = V.mix(a, b, k / n), dg = V.dist(p, H.grip);
              if (dg > 15) continue;
              /* глубина оси троса в кисти и предплечье (поверхность каната, лежащего на кисти или в отверстии кулака, уходит
                 в неё на 0,5–1,3 см — это касание, а не прохождение); у центра хвата трос — ручка или её крепление */
              if (dg > 2.2) hand = Math.max(hand, -H.sdf(p));
              arm = Math.max(arm, -M.limbSDF(R, 'fa', s, p));
            }
          }
          if (r.hand == null || hand > r.hand) Object.assign(r, { hand, handT: t });
          if (r.arm == null || arm > r.arm) Object.assign(r, { arm, armT: t });
        }
      }
    }
    for (const r of Object.values(acc)) { r.flags = flagsOf(r); if (r.modes) r.modes = [...r.modes].join(','); if (r.contacts) r.contacts = [...r.contacts].join(' '); rows.push(r); }
  }
  return rows;
}
function flagsOf(r) {
  const f = [];
  if (r.kind === 'кисть') {
    if (r.axis != null && r.declared && !r.surface && r.axis > LIM.gripAxis) f.push(`хват в ${r.axis.toFixed(1)} см от оси ${r.handle}`);
    if (r.axis != null && r.declared && r.surface && r.axis > LIM.gripAxis) f.push(`хват в ${r.axis.toFixed(1)} см от ${r.handle}`);
    if (r.air) f.push(`кулак без ручки (${r.air} кадр.)`);
    if (r.angle != null && r.declared && r.angle > LIM.gripAngle) f.push(`ручка под ${r.angle.toFixed(0)}° к кулаку`);
    const d = r.palm?.decl;
    if (d && d.byPalm && (d.gap > LIM.palmGap || d.touch < LIM.palmCover || d.tilt > LIM.palmTilt)) f.push(`ладонь на ${d.on}: зазор ${d.gap.toFixed(1)}, касание ${(d.touch * 100).toFixed(0)} %, наклон ${d.tilt.toFixed(0)}°`);
    if (d && !d.byPalm && d.any > LIM.handGap) f.push(`кисть над ${d.on}: зазор ${d.any.toFixed(1)}`);
    if (r.freeRegion) f.push('контакт областью кисти на свободном снаряде — глазами');
  }
  if (r.kind === 'гантель в ладонях' && r.axis > LIM.cupAxis) f.push(`ладонь в ${r.axis.toFixed(1)} см от рукояти`);
  if (r.kind === 'трос') {
    if (r.angle != null && r.angle > LIM.ropeAngle) f.push(`${r.tone === 'towel' ? 'полотенце' : 'канат'} под ${r.angle.toFixed(0)}° к оси кулака`);
    if (r.hand > LIM.cableHand) f.push(`трос сквозь кисть: ось на ${r.hand.toFixed(1)} см внутри`);
    if (r.arm > LIM.cableArm) f.push(`трос сквозь предплечье: ось на ${r.arm.toFixed(1)} см внутри`);
  }
  return f;
}
function run({ only, samples = 41, baked = false } = {}) {
  const entries = baked ? require('../../src/js/09bp-poses.js') : require('./author.js').bakeAll({ only });
  const rows = [];
  for (const [id, e] of Object.entries(entries)) { if ((only && !only.includes(id)) || id.startsWith('_')) continue; rows.push(...auditEntry(id, e, { samples })); }
  return rows;
}
const f1 = v => v == null ? '' : (+v).toFixed(1), f0 = v => v == null ? '' : (+v).toFixed(0);
function describe(r) {
  if (r.kind === 'кисть') {
    const p = r.palm?.decl || r.palm?.near;
    return [r.modes, r.contacts || '—', r.handle ? `${r.handle}${r.declared ? '' : ' (не заявлен)'} ${f1(r.axis)} см @${r.axisT}` : '', r.angle != null ? `${f0(r.angle)}°` : '',
      p ? `${p.on}: ладонь ${f1(p.gap)} см (${f1(p.gapMin)}…${f1(p.gapMax)}), кисть ${f1(p.any)}, ${f0(p.touch * 100)} %, ${f0(p.tilt)}° @${p.t}` : ''].join(' | ');
  }
  if (r.kind === 'трос') return [r.cable, r.angle != null ? `угол ${f0(r.angle)}° @${r.angleT}` : '', `ось в кисти ${f1(r.hand)} @${r.handT}`, `ось в предплечье ${f1(r.arm)} @${r.armT}`].join(' | ');
  return `${r.handle}: ладонь у оси ${f1(r.axis)} см @${r.axisT}`;
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), all = process.argv.includes('--all');
  const rows = run({ only, samples, baked: process.argv.includes('--baked') });
  const ex = new Set(rows.map(r => r.id)), bad = rows.filter(r => r.flags.length);
  for (const r of all ? rows : bad) console.log(`${r.id.padEnd(15)} ${(r.variant || '').padEnd(10)} ${r.side} ${r.kind.padEnd(5)} ${describe(r)}${r.flags.length ? '\n    ⚠ ' + r.flags.join('; ') : ''}`);
  const holds = rows.filter(r => r.kind === 'кисть' && (r.handle || r.palm?.decl || r.contacts)).length;
  console.log(`\nУпражнений ${ex.size}; строк ${rows.length} (кисти с хватом или опорой ${holds}, тросов у кистей ${rows.filter(r => r.kind === 'трос').length}); подозрительных ${bad.length} в ${new Set(bad.map(r => r.id)).size} упражнениях`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows, null, 1));
}
module.exports = { run, auditEntry, handGeo, LIM };
