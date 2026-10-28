/* ===================== КОЖА ANNY (вид «Манекен», только внешний вид) =====================
   Сетка подтянутой Anny (Anny 0.6.1 — Apache 2.0, NAVER; сетка, формы и веса MakeHuman/MPFB2 — CC0; third_party/anny),
   подогнанная под нейтральную стойку манекена 4.61.0 (tools/anny-look). Это только видимая кожа: кинематика, процедурная
   кожа (Mannequin.surface, знаковые расстояния), скелет, мышцы и все проверки — прежние. Данные — src/data/anny.bin (gzip):
   грузятся при первом показе объёмной фигуры в виде «Манекен», в офлайн-файле встроены (window.ANNY_BIN, base64); пока
   не загрузились (или не загрузились совсем) — прежняя процедурная кожа.
   Скиннинг — по сегментам манекена (рамки позы R.frames; фаланги пальцев — вокруг суставов рига Anny, поза по хвату —
   digitPose ниже; у прежнего файла без рига кисти — по суставам процедурной кисти, как в 4.63.0):
   двойные кватернионы (dual quaternion skinning): при повороте корпуса доля поворота шарнира поясницы — поворот вокруг его
   оси, как у процедурной кожи (spineFrame), и плечо, предплечье и бедро при закрутке не «худеют» (у линейного смешения
   сечение посередине сжимается в cos(φ/2) раз). Корректирующие формы — смещения вершин в стойке, их включает угол сустава
   (jointAngles манекена); добавляются до скиннинга. Здесь — данные, рамки, кватернионы и скиннинг на процессоре (проверки,
   рамка кадра); на видеокарте то же самое считает src/volume/anny.mjs. */
const AnnySkin = (() => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V } = M, SIGN = { L: 1, R: -1 }, FINGER_LEN = [8.0, 8.8, 8.2, 6.6];
  let data = null, pending = null;

  function decode(buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) !== 'ANY1') throw Error('anny: unknown format');
    const hl = dv.getUint32(4, true), H = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + hl)));
    let off = 8 + hl;
    const take = (T, n) => { const a = new T(u8.buffer.slice(u8.byteOffset + off, u8.byteOffset + off + n * T.BYTES_PER_ELEMENT)); off += n * T.BYTES_PER_ELEMENT; return a; };
    const nv = H.nv, nf = H.nf, q = take(Int16Array, nv * 3);
    /* треугольники: разностями (index: 'delta', tools/anny-look/pack.js) или номерами подряд (прежний файл) */
    let idx;
    if (H.index === 'delta') { const e = take(Int16Array, nf * 3); idx = new Uint16Array(nf * 3); let prev = 0; for (let t = 0; t < e.length; t += 3) { const a = prev + e[t]; idx[t] = a; idx[t + 1] = a + e[t + 1]; idx[t + 2] = a + e[t + 2]; prev = a; } }
    else idx = take(Uint16Array, nf * 3);
    const wi = take(Uint8Array, nv * 4), wq = take(Uint8Array, nv * 4);
    const code = take(Uint8Array, nv), side = take(Uint8Array, nv), a1q = take(Int16Array, nv), a2q = take(Int16Array, nv);
    /* затенённость впадин: доля открытого неба (запечена в стойке, tools/anny-look/build.py bake_shade); без неё — 1 */
    let shade = null; if (H.shade) { const s = take(Uint8Array, nv); if (nv % 2) off += 1; shade = new Float32Array(nv); for (let i = 0; i < nv; i++) shade[i] = s[i] / 255; }
    const pos = new Float32Array(nv * 3); for (let i = 0; i < pos.length; i++) pos[i] = q[i] / H.scale;
    const ww = new Float32Array(nv * 4); for (let i = 0; i < ww.length; i++) ww[i] = wq[i] / 255;
    const a1 = new Float32Array(nv), a2 = new Float32Array(nv); for (let i = 0; i < nv; i++) { a1[i] = a1q[i] / H.rscale; a2[i] = a2q[i] / H.rscale; }
    const correctives = H.correctives.map(c => { const i = take(Uint16Array, c.n); if (c.n % 2) off += 2; const dq = take(Int16Array, c.n * 3), d = new Float32Array(c.n * 3); for (let k = 0; k < d.length; k++) d[k] = dq[k] / H.scale; return { ...c, i, d }; });
    return { source: H.source, frames: H.frames, nv, nf, pos, idx, wi, ww, region: { code, side, a1, a2 }, shade, correctives, hands: H.hands || null };
  }
  async function gunzip(bytes) {
    if (typeof DecompressionStream === 'undefined') throw Error('anny: DecompressionStream is unavailable');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function fromBase64(s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function url() {
    const up = typeof window !== 'undefined' && window.PODHOD_LANG && window.PODHOD_LANG !== 'ru' ? '../' : '';
    return up + 'anny.bin' + (typeof window !== 'undefined' && window.PODHOD_BUILD ? '?v=' + window.PODHOD_BUILD : '');
  }
  /* загрузка один раз; при ошибке следующая попытка начнётся заново (до неё — процедурная кожа) */
  function load() {
    if (data) return Promise.resolve(data);
    if (pending) return pending;
    const bytes = typeof window !== 'undefined' && window.ANNY_BIN ? Promise.resolve(fromBase64(window.ANNY_BIN))
      : fetch(url()).then(r => { if (!r.ok) throw Error('anny: ' + r.status); return r.arrayBuffer(); }).then(b => new Uint8Array(b));
    pending = bytes.then(gunzip).then(decode).then(d => (data = d)).catch(e => { pending = null; throw e; });
    return pending;
  }

  /* ---------- рамки сегментов: аффинные 3×4 по строкам (каталог) ---------- */
  const aff = (o, x, y, z) => [x[0], y[0], z[0], o[0], x[1], y[1], z[1], o[1], x[2], y[2], z[2], o[2]];
  function pathAt(pts, s) {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) { const l = V.dist(pts[i - 1], pts[i]); if (acc + l >= s || i === pts.length - 1) return V.mix(pts[i - 1], pts[i], l < 1e-9 ? 0 : Math.min(1, (s - acc) / l)); acc += l; }
    return pts[pts.length - 1];
  }
  /* суставы пальцев в рамке кисти: пальцы — на долях 0, 0,47, 0,76, 1 длины (как у скелета), большой — по точкам пути */
  function digitJoints(shape) {
    const out = shape.fingers.map((f, i) => { let tot = 0; for (let k = 1; k < f.pts.length; k++) tot += V.dist(f.pts[k - 1], f.pts[k]); const L = Math.min(FINGER_LEN[i], tot); return [0, .47, .76, 1].map(q => pathAt(f.pts, q * L)); });
    const p = shape.thumb.pts; out.unshift(p.length >= 4 ? p.slice(0, 4) : [p[0], p[1], V.mix(p[1], p[2], .55), p[2]]);
    return out;
  }
  /* рамка фаланги в рамке кисти: начало — сустав, y — к предыдущему суставу, z — поперёк пальцев (к большому пальцу) */
  function phalanx(a, b, g) {
    const y = V.unit(V.sub(a, b)); let z = V.perp([0, 0, 1], y); if (V.len(z) < .05) z = V.perp([g, 0, 0], y); z = V.unit(z);
    return { o: a, x: V.cross(y, z), y, z };
  }
  /* ---------- пальцы Anny по хвату ----------
     Фаланги Anny поворачиваются вокруг суставов её рига (data.hands[s].digits — головы костей пальцев и их оси в рамке кисти
     стойки, tools/anny-look/build.py digit_rig), а не вокруг суставов процедурной кисти: кисть Anny крупнее (пястно-фаланговые
     суставы на 1–2 см дальше от запястья, запястно-пястный сустав большого пальца — на 1,5 см), и при повороте вокруг чужих
     суставов пальцы не обхватывали гриф, а большой палец торчал шипом. Состояние хвата — то же, что у процедурной кисти
     (R.hands, R.gripRadius; M.handShape): grip — ручка радиуса r вдоль оси z кисти через центр хвата (B.grip), fist — кулак
     без снаряда, flat — ладонь на опоре, relaxed — кисть расслаблена (как в стойке: поворотов нет), hook — крюк.
     Хват и кулак — таблица в данных (tools/anny-look/hands.js: углы подобраны по касанию с ручкой, ладонью и пальцами, в
     пределах суставов): grip — строки по радиусу ручки (между строками — линейно, поворот пясти большого пальца — нормированная
     смесь кватернионов), fist — одна строка. Ладонь на опоре — пальцы прямые (как у процедурной кисти: 0, 4 и 2°), большой —
     в плоскости ладони (поворот пясти — строка flat, подобран по складкам кожи кисти; без неё — по процедурной кисти); крюк —
     углы процедурной кисти. Поза зависит только от стороны, режима и радиуса — кэш; в кадре только рамки фаланг по ней.
     Пределы сгибания (градусы; 0 — фаланга продолжает пясть или предыдущую фалангу, переразгибания нет): пальцы —
     пястно-фаланговый 0–90, проксимальный межфаланговый 0–110, дистальный межфаланговый 0–90 (Kapandji I. A. The Physiology
     of the Joints, vol. 1, 6th ed., 2007: МФС около 90°, ПМФС больше 90° — 100–110°, ДМФС чуть меньше 90° — 80–90°);
     большой — пястно-фаланговый 0–60, межфаланговый 0–80 (AAOS. Joint Motion: Method of Measuring and Recording, 1965:
     50 и 80; Kapandji: 60–70 и 75–80). */
  const DIG = {
    lim: { finger: [[0, 90], [0, 110], [0, 90]], thumb: [null, [0, 60], [0, 80]] },
    flat: [0, 4, 2],     // ладонь на опоре: как у процедурной кисти (M.handShape, 'flat')
    hook: [10, 95, 48]
  };
  const R3 = {
    I: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    axis(a, t) { const c = Math.cos(t), s = Math.sin(t), k = 1 - c, [x, y, z] = a; return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k]; },
    mul(A, B) { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return o; },
    ap(A, v) { return [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]]; },
    /* поворот, переводящий базис (a, b, a×b) в (c, e, c×e); a ⟂ b и c ⟂ e — единичные */
    frame(a, b, c, e) { const ab = V.cross(a, b), ce = V.cross(c, e), o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = c[i] * a[j] + e[i] * b[j] + ce[i] * ab[j]; return o; },
    quat(A) {
      const tr = A[0] + A[4] + A[8]; let x, y, z, w;
      if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; w = s / 4; x = (A[7] - A[5]) / s; y = (A[2] - A[6]) / s; z = (A[3] - A[1]) / s; }
      else if (A[0] > A[4] && A[0] > A[8]) { const s = Math.sqrt(1 + A[0] - A[4] - A[8]) * 2; w = (A[7] - A[5]) / s; x = s / 4; y = (A[1] + A[3]) / s; z = (A[2] + A[6]) / s; }
      else if (A[4] > A[8]) { const s = Math.sqrt(1 + A[4] - A[0] - A[8]) * 2; w = (A[2] - A[6]) / s; x = (A[1] + A[3]) / s; y = s / 4; z = (A[5] + A[7]) / s; }
      else { const s = Math.sqrt(1 + A[8] - A[0] - A[4]) * 2; w = (A[3] - A[1]) / s; x = (A[2] + A[6]) / s; y = (A[5] + A[7]) / s; z = s / 4; }
      const l = Math.hypot(x, y, z, w) * (w < 0 ? -1 : 1); return [x / l, y / l, z / l, w / l];
    },
    fromQuat(q) { const l = Math.hypot(...q), [x, y, z, w] = q.map(v => v / l); return [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]; }
  };
  const D2R = Math.PI / 180;
  /* угол от p до q вокруг оси a (проекции на плоскость, перпендикулярную a), градусы */
  function flexAngle(p, q, a) { const pp = V.unit(V.perp(p, a)), qq = V.unit(V.perp(q, a)); return Math.atan2(V.dot(V.cross(pp, qq), a), V.dot(pp, qq)) / D2R; }
  /* риг кисти Anny (координаты рамки кисти: x, y, z — оси рамки hand стойки): на палец — суставы j (и конец), на фалангу —
     ось сгибания a = y × z (поворот на +угол ведёт фалангу к ладонной стороне z), y — вдоль кости; углы стойки bind: у
     пальцев пястно-фаланговый — от пясти (начало пястной кости → сустав), межфаланговые — от предыдущей фаланги */
  function digitRig(d, s) {
    const C = d._rig || (d._rig = {}); if (C[s]) return C[s];
    const g = SIGN[s], digits = d.hands[s].digits.map((h, f) => {
      const segs = h.ax.map(ax => ({ a: V.unit(V.cross(ax[1], ax[2])), y: ax[1], z: ax[2] }));
      const bind = segs.map((sg, k) => k ? flexAngle(segs[k - 1].y, sg.y, sg.a) : f ? flexAngle(V.sub(h.j[0], h.base), sg.y, sg.a) : 0);
      return { j: h.j, segs, bind, thumb: f === 0 };
    });
    return C[s] = { g, digits, grip: [-g * M.B.grip[0], M.B.grip[1], M.B.grip[2]] };
  }
  /* цепочка фаланг пальца: Rs — повороты суставов (в координатах стойки, вокруг их осей); на фалангу {Q, o}: точка стойки p
     фаланги k переходит в o + Q·(p − j_k) */
  function chain(dg, Rs) {
    const out = [];
    for (let k = 0; k < 3; k++) {
      if (!k) { out.push({ Q: Rs[0], o: dg.j[0] }); continue; }
      const P = out[k - 1]; out.push({ Q: R3.mul(P.Q, Rs[k]), o: V.add(P.o, R3.ap(P.Q, V.sub(dg.j[k], dg.j[k - 1]))) });
    }
    return out;
  }
  const xf = (T, j, p) => V.add(T.o, R3.ap(T.Q, V.sub(p, j)));
  const flexRot = (dg, k, abs) => R3.axis(dg.segs[k].a, (abs - dg.bind[k]) * D2R);
  /* большой палец на опоре: в плоскости ладони, отведён к лучевой стороне (как M.handShape 'flat'), ладонной стороной к
     опоре и к лучевой стороне поровну */
  function flatThumb(rig) {
    const dg = rig.digits[0], g = rig.g, dir = V.unit([-g * .2, -5.3, 3.6]), pal = V.unit(V.perp(V.unit([-g, 0, -1]), dir));
    return R3.frame(dg.segs[0].y, dg.segs[0].a, dir, V.cross(dir, pal));
  }
  /* строка таблицы хвата: grip — по радиусу (вне таблицы — крайняя строка), fist — единственная */
  function tableRow(H, mode, r) {
    if (mode === 'fist') return H.fist || null;
    const T = H.grip; if (!T?.length) return null;
    if (r <= T[0].r) return T[0]; if (r >= T[T.length - 1].r) return T[T.length - 1];
    let i = 0; while (T[i + 1].r < r) i++;
    const a = T[i], b = T[i + 1], u = (r - a.r) / (b.r - a.r), qa = a.th.q, sg = V.dot(qa, b.th.q) + qa[3] * b.th.q[3] < 0 ? -1 : 1;
    const q = [0, 1, 2, 3].map(k => qa[k] * (1 - u) + sg * b.th.q[k] * u), l = Math.hypot(...q);
    return { r, f: a.f.map((t, k) => t.map((x, m) => x * (1 - u) + b.f[k][m] * u)), th: { q: q.map(x => x / l), t: a.th.t.map((x, k) => x * (1 - u) + b.th.t[k] * u) } };
  }
  /* поза пальцев одной кисти: T[палец][фаланга] → {Q, o} (координаты рамки кисти) и углы сгибания ang[палец][сустав]
     (у большого пальца первый — null: запястно-пястный задан поворотом); кэш по стороне, режиму, радиусу */
  function digitPose(d, s, mode = 'relaxed', r = 1.4) {
    const C = d._digits || (d._digits = new Map()), key = s + ':' + mode + ':' + (+r).toFixed(2);
    if (C.has(key)) return C.get(key);
    const rig = digitRig(d, s), I3 = [R3.I, R3.I, R3.I], fingers = rig.digits.slice(1);
    const pose = (fa, thR, tha) => ({ T: [chain(rig.digits[0], thR), ...fingers.map((dg, i) => chain(dg, fa[i].map((t, k) => flexRot(dg, k, t))))], ang: [tha, ...fa], mode, r });
    const row = mode === 'grip' || mode === 'fist' ? tableRow(d.hands[s], mode, r) : null, th = rig.digits[0];
    const out = row ? pose(row.f, [R3.fromQuat(row.th.q), flexRot(th, 1, row.th.t[0]), flexRot(th, 2, row.th.t[1])], [null, ...row.th.t])
      : mode === 'flat' ? (H => pose(fingers.map(() => DIG.flat), [H ? R3.fromQuat(H.th.q) : flatThumb(rig), flexRot(th, 1, H ? H.th.t[0] : 5), flexRot(th, 2, H ? H.th.t[1] : 5)], [null, ...(H ? H.th.t : [5, 5])]))(d.hands[s].flat)
      : mode === 'hook' ? pose(fingers.map(() => DIG.hook), I3, [null, th.bind[1], th.bind[2]])
      : pose(fingers.map(dg => dg.bind), I3, [null, th.bind[1], th.bind[2]]);
    C.set(key, out);
    return out;
  }

  /* все рамки кадра (имена — data.frames): R — поза каталога, hands — {L,R}: {frame, shape} (bodyData) или null (по R.hands);
     d — данные кожи: с d.hands фаланги — по суставам рига Anny (digitPose), без них (прежний файл) — по процедурной кисти */
  function frameMats(R, names, hands, d = null) {
    const F = R.frames, out = new Float64Array(names.length * 12), digits = {}, anny = {};
    const handOf = s => hands?.[s] || { frame: F['hand' + s], shape: M.handShape(R.hands?.[s] || 'relaxed', s, R.gripRadius?.[s] ?? 1.4) };
    const annyOf = s => anny[s] || (anny[s] = digitPose(d, s, hands?.[s]?.mode || R.hands?.[s] || 'relaxed', hands?.[s]?.r ?? R.gripRadius?.[s] ?? 1.4));
    names.forEach((n, i) => {
      let A;
      const m = /^f(\d)(\d)([LR])$/.exec(n);
      if (m && d?.hands) {
        const s = m[3], f = +m[1], k = +m[2], T = annyOf(s).T[f][k], hf = F['hand' + s];
        const W = p => V.add(V.add(V.add(hf.o, hf.x, p[0]), hf.y, p[1]), hf.z, p[2]), D = c => V.add(V.add(V.scale(hf.x, T.Q[c]), hf.y, T.Q[3 + c]), hf.z, T.Q[6 + c]);
        A = aff(W(T.o), D(0), D(1), D(2));
      } else if (m) {
        const s = m[3], H = handOf(s), js = digits[s] || (digits[s] = digitJoints(H.shape)), f = +m[1], k = +m[2], g = SIGN[s];
        const P = phalanx(js[f][k], js[f][k + 1], g), hf = H.frame, W = p => V.add(V.add(V.add(hf.o, hf.x, p[0]), hf.y, p[1]), hf.z, p[2]), D = d => V.add(V.add(V.scale(hf.x, d[0]), hf.y, d[1]), hf.z, d[2]);
        A = aff(W(P.o), D(P.x), D(P.y), D(P.z));
      } else { const f = F[n]; A = aff(f.o, f.x, f.y, f.z); }
      out.set(A, i * 12);
    });
    return out;
  }
  function inv(A, o = 0) {
    /* обратная к ортогональной (с отражением) аффинной: линейная часть транспонируется */
    const r = [A[o], A[o + 4], A[o + 8], A[o + 1], A[o + 5], A[o + 9], A[o + 2], A[o + 6], A[o + 10]], t = [A[o + 3], A[o + 7], A[o + 11]];
    return [r[0], r[1], r[2], -(r[0] * t[0] + r[1] * t[1] + r[2] * t[2]), r[3], r[4], r[5], -(r[3] * t[0] + r[4] * t[1] + r[5] * t[2]), r[6], r[7], r[8], -(r[6] * t[0] + r[7] * t[1] + r[8] * t[2])];
  }
  const mul = (A, ao, B) => { const o = new Array(12); for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) o[i * 4 + j] = A[ao + i * 4] * B[j] + A[ao + i * 4 + 1] * B[4 + j] + A[ao + i * 4 + 2] * B[8 + j]; o[i * 4 + 3] = A[ao + i * 4] * B[3] + A[ao + i * 4 + 1] * B[7] + A[ao + i * 4 + 2] * B[11] + A[ao + i * 4 + 3]; } return o; };
  /* рамки стойки (нейтральная поза, расслабленные кисти) — обратные, один раз на набор имён (и на данные с ригом кисти) */
  const BIND = new Map();
  function bindInv(names, d = null) {
    if (d?.hands) { if (!d._bind) { const R0 = M.catalogPose(M.neutral()), A = frameMats(R0, names, null, d); d._bind = names.map((_, i) => inv(A, i * 12)); } return d._bind; }
    const key = names.join(','); let b = BIND.get(key);
    if (!b) { const R0 = M.catalogPose(M.neutral()), A = frameMats(R0, names, null); b = []; for (let i = 0; i < names.length; i++) b.push(inv(A, i * 12)); BIND.set(key, b); }
    return b;
  }
  /* матрицы скиннинга кадра: S = рамка кадра · (рамка стойки)⁻¹ — Float64Array по 12 */
  function skinMats(R, d = data, hands = null) {
    const A = frameMats(R, d.frames, hands, d), Bi = bindInv(d.frames, d), out = new Float64Array(d.frames.length * 12);
    for (let i = 0; i < d.frames.length; i++) out.set(mul(A, i * 12, Bi[i]), i * 12);
    return out;
  }
  /* двойные кватернионы: [qx,qy,qz,qw, dx,dy,dz,dw] на рамку; знак — к полусфере qw ≥ 0 */
  function dualQuats(S, n) {
    const out = new Float32Array(n * 8);
    for (let i = 0; i < n; i++) {
      const o = i * 12, m00 = S[o], m01 = S[o + 1], m02 = S[o + 2], m10 = S[o + 4], m11 = S[o + 5], m12 = S[o + 6], m20 = S[o + 8], m21 = S[o + 9], m22 = S[o + 10];
      const tr = m00 + m11 + m22; let w, x, y, z;
      if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; w = .25 * s; x = (m21 - m12) / s; y = (m02 - m20) / s; z = (m10 - m01) / s; }
      else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; w = (m21 - m12) / s; x = .25 * s; y = (m01 + m10) / s; z = (m02 + m20) / s; }
      else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; w = (m02 - m20) / s; x = (m01 + m10) / s; y = .25 * s; z = (m12 + m21) / s; }
      else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; w = (m10 - m01) / s; x = (m02 + m20) / s; y = (m12 + m21) / s; z = .25 * s; }
      const l = Math.hypot(x, y, z, w) * (w < 0 ? -1 : 1); x /= l; y /= l; z /= l; w /= l;
      const tx = S[o + 3], ty = S[o + 7], tz = S[o + 11];
      /* dual = ½·(t, 0)·q */
      const dx = .5 * (tx * w + ty * z - tz * y), dy = .5 * (-tx * z + ty * w + tz * x), dz = .5 * (tx * y - ty * x + tz * w), dw = -.5 * (tx * x + ty * y + tz * z);
      out.set([x, y, z, w, dx, dy, dz, dw], i * 8);
    }
    return out;
  }

  /* ---------- корректирующие формы: вес по углу сустава — «шатёр»: 0 при a0, 1 при a1 (угол позы формы), 0 при a2
     (без a2 — 1 и дальше) ---------- */
  function correctiveWeights(R, d = data) {
    if (!d.correctives.length) return [];
    const A = M.jointAngles(R);
    return d.correctives.map(c => {
      const src = c.side ? A[c.side] : A, v = c.angle.split('.').reduce((o, k) => o?.[k], src);
      if (typeof v !== 'number') return 0;
      if (v <= c.a1) return Math.max(0, Math.min(1, (v - c.a0) / (c.a1 - c.a0)));
      return c.a2 == null ? 1 : Math.max(0, Math.min(1, (c.a2 - v) / (c.a2 - c.a1)));
    });
  }

  /* ---------- скиннинг на процессоре: проверки и рамка кадра (на экране — видеокарта, src/volume/anny.mjs) ----------
     method 'dq' (как в приложении) или 'lbs' (линейное смешение — для сравнения); only — номера вершин (по умолчанию все);
     floor — кожа прижата к полу (как на экране): вершины ниже пола — на полу. Мягкие ткани, лёжа на полу, сплющиваются о
     него; кожа Anny полнее процедурной (подтянутое телосложение), а суставы — те же, поэтому там, где процедурная кожа
     касается пола, предплечье, плечо или спина Anny ушли бы под пол. floor: false — без прижатия (насколько прижато —
     проверка tools/anny-look/check.js). */
  function skin(R, { d = data, method = 'dq', hands = null, only = null, corr = null, floor = true } = {}) {
    const S = skinMats(R, d, hands), nfr = d.frames.length, DQ = method === 'dq' ? dualQuats(S, nfr) : null, cw = corr || correctiveWeights(R, d);
    let P = d.pos;
    if (cw.some(w => w > 0)) { P = Float32Array.from(d.pos); d.correctives.forEach((c, k) => { const w = cw[k]; if (!(w > 0)) return; for (let j = 0; j < c.n; j++) { const v = c.i[j]; P[v * 3] += w * c.d[j * 3]; P[v * 3 + 1] += w * c.d[j * 3 + 1]; P[v * 3 + 2] += w * c.d[j * 3 + 2]; } }); }
    const list = only || null, n = list ? list.length : d.nv, out = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const v = list ? list[k] : k, px = P[v * 3], py = P[v * 3 + 1], pz = P[v * 3 + 2];
      if (DQ) {
        let x = 0, y = 0, z = 0, w = 0, dx = 0, dy = 0, dz = 0, dw = 0, r0 = -1;
        for (let j = 0; j < 4; j++) {
          const wt = d.ww[v * 4 + j]; if (!wt) continue; const o = d.wi[v * 4 + j] * 8;
          let s = wt; if (r0 < 0) r0 = o; else if (DQ[o] * DQ[r0] + DQ[o + 1] * DQ[r0 + 1] + DQ[o + 2] * DQ[r0 + 2] + DQ[o + 3] * DQ[r0 + 3] < 0) s = -wt;
          x += s * DQ[o]; y += s * DQ[o + 1]; z += s * DQ[o + 2]; w += s * DQ[o + 3]; dx += s * DQ[o + 4]; dy += s * DQ[o + 5]; dz += s * DQ[o + 6]; dw += s * DQ[o + 7];
        }
        const l = Math.hypot(x, y, z, w); x /= l; y /= l; z /= l; w /= l; dx /= l; dy /= l; dz /= l; dw /= l;
        /* поворот: p + 2·q×(q×p + w·p); сдвиг: 2·(w·d − dw·q + q×d) */
        const cx = y * pz - z * py + w * px, cy = z * px - x * pz + w * py, cz = x * py - y * px + w * pz;
        const rx = px + 2 * (y * cz - z * cy), ry = py + 2 * (z * cx - x * cz), rz = pz + 2 * (x * cy - y * cx);
        out[k * 3] = rx + 2 * (w * dx - dw * x + y * dz - z * dy); out[k * 3 + 1] = ry + 2 * (w * dy - dw * y + z * dx - x * dz); out[k * 3 + 2] = rz + 2 * (w * dz - dw * z + x * dy - y * dx);
      } else {
        let ox = 0, oy = 0, oz = 0;
        for (let j = 0; j < 4; j++) { const wt = d.ww[v * 4 + j]; if (!wt) continue; const o = d.wi[v * 4 + j] * 12; ox += wt * (S[o] * px + S[o + 1] * py + S[o + 2] * pz + S[o + 3]); oy += wt * (S[o + 4] * px + S[o + 5] * py + S[o + 6] * pz + S[o + 7]); oz += wt * (S[o + 8] * px + S[o + 9] * py + S[o + 10] * pz + S[o + 11]); }
        out[k * 3] = ox; out[k * 3 + 1] = oy; out[k * 3 + 2] = oz;
      }
      if (floor && out[k * 3 + 1] > M.FLOOR) out[k * 3 + 1] = M.FLOOR;
    }
    return out;
  }

  /* ---------- мышечные зоны: область каждой вершины по её адресу на процедурной коже (правила областей манекена —
     mannequinRegionOf, 09d-catalog-muscles.js); id — номер в списке областей, сторона — 0 левая, 1 правая ---------- */
  const PART = ['', 'torso', 'ua', 'fa', 'th', 'sk', 'delt'];
  function regions(d = data, regionOf = typeof mannequinRegionOf === 'function' ? mannequinRegionOf : null) {
    if (!regionOf) return null;
    if (d._regions && d._regions.fn === regionOf) return d._regions;
    const ids = [], at = new Map(), rid = new Uint8Array(d.nv), R = d.region;
    for (let v = 0; v < d.nv; v++) {
      const part = PART[R.code[v]]; if (!part) continue;
      const id = regionOf(part, R.side[v] ? 'R' : 'L', R.a1[v], R.a2[v]); if (!id) continue;
      if (!at.has(id)) { ids.push(id); at.set(id, ids.length); }
      rid[v] = at.get(id);
    }
    return d._regions = { fn: regionOf, ids, rid };
  }
  return { load, decode, frameMats, skinMats, dualQuats, correctiveWeights, skin, regions, bindInv, digitRig, digitPose, DIG, _digit: { R3, chain, xf, flexRot, flexAngle, flatThumb }, get data() { return data; }, set data(x) { data = x; } };
})();
if (typeof window !== 'undefined') window.AnnySkin = AnnySkin; /* объёмная сцена (volume.js) берёт данные и рамки отсюда */
if (typeof module !== 'undefined' && module.exports) module.exports = AnnySkin;
