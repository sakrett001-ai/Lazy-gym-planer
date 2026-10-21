/* ===================== СКЕЛЕТ МАНЕКЕНА =====================
   Кости из библиотеки моделей MyoSim (Apache 2.0; модели Rajagopal 2016 и Holzbaur 2005), пересчитанные в рамки
   сегментов манекена (tools/skeleton). Данные — src/data/skeleton.bin (gzip): грузятся при первом включении режима
   «Скелет»; в офлайн-файле встроены (window.SKELETON_BIN, base64).
   Каждая кость — жёсткое тело своего сегмента (иногда с масштабом): frames() даёт для кадра аффинные матрицы 3×4
   «локальные см → каталог (см, Y вниз)». Особые случаи: позвонки L5–L1 — по рамке позвонка на своей высоте
   (Mannequin.vertebraFrame: поворот поясницы делится по уровням, как в MyoSim); ключица и лопатка — по рамкам ключицы и лопатки манекена (Mannequin.fk: лопатка на конце ключицы, ритм плечевого
   пояса и скольжение по рёбрам; до этапа Д скелет поворачивал лопатку сам, в обход кинематики); лучевая кость — поворот с пронацией вокруг оси
   «головка лучевой — запястье»; надколенник — по углу колена (полиномы связи модели Rajagopal); фаланги — по линиям
   пальцев текущего хвата. Гортань и трахея (4.58.0, сегмент 'airway') — параметрические хрящи (tools/skeleton/airway.js)
   в рамке шеи, повёрнутой к грудной клетке или к голове на долю угла (airwayFrame). */
const Skeleton = (() => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V } = M, SIGN = { L: 1, R: -1 }, FINGER_LEN = [8.0, 8.8, 8.2, 6.6], FINGER_SCALE = .9;
  let data = null, pending = null;

  function decode(buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) !== 'SKL1') throw Error('skeleton: unknown format');
    const hl = dv.getUint32(4, true), header = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + hl)));
    let off = 8 + hl;
    const bones = header.bones.map(b => {
      const n = b.nv * 3, q = new Int16Array(u8.buffer.slice(u8.byteOffset + off, u8.byteOffset + off + n * 2)); off += n * 2;
      const idx = new Uint16Array(u8.buffer.slice(u8.byteOffset + off, u8.byteOffset + off + b.nf * 6)); off += b.nf * 6;
      const pos = new Float32Array(n); for (let i = 0; i < n; i++) pos[i] = q[i] / header.scale;
      return { ...b, pos, idx };
    });
    return { source: header.source, bones };
  }
  async function gunzip(bytes) {
    if (typeof DecompressionStream === 'undefined') throw Error('skeleton: DecompressionStream is unavailable');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function fromBase64(s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function url() {
    const up = typeof window !== 'undefined' && window.PODHOD_LANG && window.PODHOD_LANG !== 'ru' ? '../' : '';
    return up + 'skeleton.bin' + (typeof window !== 'undefined' && window.PODHOD_BUILD ? '?v=' + window.PODHOD_BUILD : '');
  }
  /* загрузка один раз; при ошибке следующая попытка начнётся заново */
  function load() {
    if (data) return Promise.resolve(data);
    if (pending) return pending;
    const bytes = typeof window !== 'undefined' && window.SKELETON_BIN ? Promise.resolve(fromBase64(window.SKELETON_BIN))
      : fetch(url()).then(r => { if (!r.ok) throw Error('skeleton: ' + r.status); return r.arrayBuffer(); }).then(b => new Uint8Array(b));
    pending = bytes.then(gunzip).then(decode).then(d => (data = d)).catch(e => { pending = null; throw e; });
    return pending;
  }

  /* ---------- раскладка ---------- */
  const signedAngle = (a, b, axis) => Math.atan2(V.dot(V.cross(a, b), axis), V.dot(a, b));
  /* Угол поворота сустава в рамке сегмента. Кадры позы — в координатах каталога, где ось Y смотрит вниз (зеркало):
     векторное произведение в них меняет знак, и угол, измеренный по рамкам каталога, обратен углу в рамке сегмента.
     До 4.25.0 этого не учитывали: лучевая кость при пронации крутилась в сторону супинации, а надколенник не ехал
     за сгибанием колена (угол выходил отрицательным и упирался в 0°). */
  const jointAngle = (a, b, axis) => -signedAngle(a, b, axis);
  function rotAxis(k, a) { /* матрица поворота вокруг единичной оси k (столбцы) */
    const c = Math.cos(a), s = Math.sin(a), t = 1 - c, [x, y, z] = k;
    return [[t * x * x + c, t * x * y - s * z, t * x * z + s * y], [t * x * y + s * z, t * y * y + c, t * y * z - s * x], [t * x * z - s * y, t * y * z + s * x, t * z * z + c]];
  }
  /* аффинное преобразование: lin — 3×3 по строкам, t — сдвиг */
  const frameAff = F => ({ lin: [[F.x[0], F.y[0], F.z[0]], [F.x[1], F.y[1], F.z[1]], [F.x[2], F.y[2], F.z[2]]], t: F.o || F.c });
  function mul(A, B) {
    const lin = [0, 1, 2].map(i => [0, 1, 2].map(j => A.lin[i][0] * B.lin[0][j] + A.lin[i][1] * B.lin[1][j] + A.lin[i][2] * B.lin[2][j]));
    const t = [0, 1, 2].map(i => A.lin[i][0] * B.t[0] + A.lin[i][1] * B.t[1] + A.lin[i][2] * B.t[2] + A.t[i]);
    return { lin, t };
  }
  const about = (lin, p) => ({ lin, t: [0, 1, 2].map(i => p[i] - (lin[i][0] * p[0] + lin[i][1] * p[1] + lin[i][2] * p[2])) }); /* поворот вокруг точки p */
  const apply = (A, p) => [0, 1, 2].map(i => A.lin[i][0] * p[0] + A.lin[i][1] * p[1] + A.lin[i][2] * p[2] + A.t[i]);
  /* Гортань и трахея (сегмент 'airway', tools/skeleton/airway.js): сетки — в рамке шеи. Шея манекена гнётся в двух шарнирах —
     у диска C7–T1 (B.neckPivot) и в атлантозатылочном суставе (B.headJoint), по половине угла. Трахея ниже шарнира шеи
     уходит за рукоятку грудины и поворачивается вместе с грудной клеткой: кость с долей wt — рамка шеи, повёрнутая к рамке
     «шея без поворота» (жёстко с грудной клеткой) на долю wt угла вокруг оси нижнего шарнира. Подъязычная кость подвешена к
     нижней челюсти: доля wh — к рамке головы вокруг атлантозатылочного сустава. Поворот на долю — по оси и углу
     относительного поворота (рамки каталога левые, относительный поворот — правый). */
  function slerpLin(A, B, w) {
    const Q = [0, 1, 2].map(i => [0, 1, 2].map(j => B[i][0] * A[j][0] + B[i][1] * A[j][1] + B[i][2] * A[j][2]));   /* B · Aᵀ */
    const c = Math.max(-1, Math.min(1, (Q[0][0] + Q[1][1] + Q[2][2] - 1) / 2)), ang = Math.acos(c);
    if (ang < 1e-7) return A;
    const k = V.unit([Q[2][1] - Q[1][2], Q[0][2] - Q[2][0], Q[1][0] - Q[0][1]]), R = rotAxis(k, w * ang);
    return [0, 1, 2].map(i => [0, 1, 2].map(j => R[i][0] * A[0][j] + R[i][1] * A[1][j] + R[i][2] * A[2][j]));
  }
  function airwayFrame(F, wt, wh) {
    const N = frameAff(F.neck);
    if (wt > 0) {
      const T = frameAff(F.thorax), piv = M.B.neckPivot, lin = slerpLin(N.lin, T.lin, wt), P = apply(N, piv);
      return { lin, t: [0, 1, 2].map(i => P[i] - (lin[i][0] * piv[0] + lin[i][1] * piv[1] + lin[i][2] * piv[2])) };
    }
    if (wh > 0) {
      const H = frameAff(F.head), piv = M.B.headJoint, lin = slerpLin(N.lin, H.lin, wh), P = apply(N, piv);
      return { lin, t: [0, 1, 2].map(i => P[i] - (lin[i][0] * piv[0] + lin[i][1] * piv[1] + lin[i][2] * piv[2])) };
    }
    return N;
  }
  function pointAt(pts, s) {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) { const l = V.dist(pts[i - 1], pts[i]); if (acc + l >= s || i === pts.length - 1) return V.mix(pts[i - 1], pts[i], l < 1e-9 ? 0 : Math.min(1, (s - acc) / l)); acc += l; }
    return pts[pts.length - 1];
  }
  function digitJoints(shape, b) {
    if (b.seg === 'finger') {
      const pts = shape.fingers[b.finger].pts; let total = 0; for (let i = 1; i < pts.length; i++) total += V.dist(pts[i - 1], pts[i]);
      const L = Math.min(FINGER_LEN[b.finger], total), js = [0, .47, .76, 1].map(f => pointAt(pts, f * L));
      return [js[b.joint], js[b.joint + 1]];
    }
    const p = shape.thumb.pts, js = p.length >= 4 ? p.slice(0, 4) : [p[0], p[1], V.mix(p[1], p[2], .55), p[2]];
    return [js[b.joint], js[b.joint + 1]];
  }
  /* матрицы всех костей кадра: Float32Array по 12 чисел (строки 3×4) — каталог = A·[x y z 1] */
  function frames(R, body, bones = data?.bones) {
    const out = new Float32Array(bones.length * 12), F = R.frames, cache = {};
    bones.forEach((b, i) => {
      const s = b.side, g = SIGN[s] || 1; let A;
      if (b.seg === 'spine') A = frameAff(M.vertebraFrame(R, b.h));
      /* кости пояса заданы в рамке ключицы покоя: ключица — по рамке ключицы, лопатка — по рамке лопатки (Mannequin.fk:
         лопатка на конце ключицы, поворот вокруг акромиально-ключичного сустава, ритм и скольжение по рёбрам) */
      else if (b.seg === 'girdle') A = frameAff(F[(b.name === 'scapula' ? 'sp' : 'cl') + s]);
      else if (b.name === 'radius') {
        const fa = F['fa' + s], fd = F['fd' + s], phi = jointAngle(fa.z, fd.z, fa.y), [rh, w] = b.pivot;
        A = mul(frameAff(fa), about(rotAxis(V.unit(V.sub(rh, w)), phi), w));
      } else if (b.name === 'patella') {
        const th = F['th' + s], sk = F['sk' + s], k = jointAngle(th.y, sk.y, th.x) * 180 / Math.PI, tr = b.track;
        const i0 = Math.max(0, Math.min(tr.length - 2, Math.floor(k / 10))), u = Math.max(0, Math.min(1, (k - tr[i0][0]) / 10)), row = tr[i0].map((x, j) => x + (tr[i0 + 1][j] - x) * u);
        A = mul(frameAff(th), { lin: rotAxis([1, 0, 0], -row[1] * Math.PI / 180), t: row.slice(2, 5) });
      } else if (b.seg === 'airway') {
        const key = 'aw' + (b.wt || 0) + '|' + (b.wh || 0);
        A = cache[key] || (cache[key] = airwayFrame(F, b.wt || 0, b.wh || 0));
      } else if (b.seg === 'finger' || b.seg === 'thumb') {
        const H = body.hands[s], [p0, p1] = digitJoints(H.shape, b), a = V.unit(V.sub(p1, p0)), ref = [g, 0, 0];
        const z = V.unit(V.sub(ref, V.scale(a, V.dot(ref, a)))), y = V.scale(a, -1), x = V.cross(y, z), k = V.dist(p0, p1) / b.len, st = FINGER_SCALE;
        A = mul(frameAff(H.frame), { lin: [[x[0] * st, y[0] * k, z[0] * st], [x[1] * st, y[1] * k, z[1] * st], [x[2] * st, y[2] * k, z[2] * st]], t: p0 });
      } else {
        const key = ['pelvis', 'thorax', 'neck', 'head'].includes(b.seg) ? b.seg : b.seg + s;
        A = cache[key] || (cache[key] = frameAff(F[key]));
      }
      for (let r = 0; r < 3; r++) { out[i * 12 + r * 4] = A.lin[r][0]; out[i * 12 + r * 4 + 1] = A.lin[r][1]; out[i * 12 + r * 4 + 2] = A.lin[r][2]; out[i * 12 + r * 4 + 3] = A.t[r]; }
    });
    return out;
  }
  /* мировые координаты вершин кости (каталог) — для проверок */
  function worldPoints(b, m, i) {
    const o = i * 12, p = b.pos, out = new Float32Array(p.length);
    for (let j = 0; j < p.length; j += 3) for (let r = 0; r < 3; r++) out[j + r] = m[o + r * 4] * p[j] + m[o + r * 4 + 1] * p[j + 1] + m[o + r * 4 + 2] * p[j + 2] + m[o + r * 4 + 3];
    return out;
  }
  return { load, decode, frames, worldPoints, get data() { return data; }, set data(d) { data = d; } };
})();
if (typeof window !== 'undefined') window.Skeleton = Skeleton; /* объёмная сцена (volume.js) берёт раскладку отсюда */
if (typeof module !== 'undefined' && module.exports) module.exports = Skeleton;
