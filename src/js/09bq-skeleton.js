/* ===================== СКЕЛЕТ МАНЕКЕНА =====================
   Кости из библиотеки моделей MyoSim (Apache 2.0; модели Rajagopal 2016 и Holzbaur 2005), пересчитанные в рамки
   сегментов манекена (tools/skeleton). Данные — src/data/skeleton.bin (gzip): грузятся при первом включении режима
   «Скелет»; в офлайн-файле встроены (window.SKELETON_BIN, base64).
   Каждая кость — жёсткое тело своего сегмента (иногда с масштабом): frames() даёт для кадра аффинные матрицы 3×4
   «локальные см → каталог (см, Y вниз)». Особые случаи: позвонки — по рамке позвоночника на своей высоте (как кожа
   корпуса); ключица и лопатка — по рамке плечевого пояса, лопатка поворачивается за рукой и скользит по рёбрам (scapulaRot); лучевая кость — поворот с пронацией вокруг оси
   «головка лучевой — запястье»; надколенник — по углу колена (полиномы связи модели Rajagopal); фаланги — по линиям
   пальцев текущего хвата. */
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
  /* поворот, переводящий направление a в b (кратчайший) */
  function rotBetween(a, b) {
    const u = V.unit(a), w = V.unit(b), k = V.cross(u, w), s = V.len(k), c = V.dot(u, w);
    return s < 1e-9 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : rotAxis(V.scale(k, 1 / s), Math.atan2(s, c));
  }
  /* Плече-лопаточный ритм: при подъёме руки лопатка поворачивается вверх (суставная впадина смотрит выше, нижний угол
     уходит наружу и вперёд по рёбрам) и наклоняется назад. Первые ≈25° подъёма плеча — без поворота, дальше лопатка
     даёт около 0,4° на каждый градус (≈55° при руке над головой); вклад поднятия плечевого пояса (рамка ключицы
     уже повёрнута во фронтальной плоскости) вычитается. Поворот — вокруг оси, перпендикулярной плоскости лопатки,
     через центр плечевого сустава: головка плечевой кости остаётся во впадине; ключица следует за акромионом.
     Inman et al., 1944; McClure et al., 2001; Ludewig et al., 2009. */
  const deg = Math.PI / 180;
  /* Кожа манекена у нижнего угла лопатки не растягивается за поднятой рукой (широчайшая и зубчатая мышцы не
     смоделированы), поэтому поворот ограничен: нижний угол остаётся не ближе INSIDE см к коже корпуса. */
  const INSIDE = .6;
  /* Оболочка рёбер в рамке грудной клетки: наибольший радиус от оси по слоям высоты (1 см) и секторам (5°).
     Передняя поверхность лопатки держится снаружи (между ними у живого человека — подлопаточная и зубчатая мышцы). */
  const RIB_GAP = .3;
  function ribShell(bones) {
    const b = bones.find(x => x.name === 'ribcage'); if (!b) return null;
    const p = b.pos, n = p.length / 3; let zc = 0; for (let i = 2; i < p.length; i += 3) zc += p[i]; zc /= n;
    const sh = new Map();
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i], z = p[i + 2] - zc, k = Math.round(p[i + 1]) * 1000 + Math.round(Math.atan2(x, z) * 36 / Math.PI), r = Math.hypot(x, z);
      if (!(sh.get(k) >= r)) sh.set(k, r);
    }
    return { zc, sh };
  }
  /* зазор точки мира до оболочки рёбер: + снаружи, − внутри; Infinity — там, где рёбер нет */
  function ribClear(rib, T, w) {
    const d = V.sub(w, T.o), x = V.dot(d, T.x), y = Math.round(V.dot(d, T.y)), z = V.dot(d, T.z) - rib.zc, a = Math.round(Math.atan2(x, z) * 36 / Math.PI);
    let s = 0; for (let k = -1; k <= 1; k++) s = Math.max(s, rib.sh.get(y * 1000 + a + k) || 0);
    return s ? Math.hypot(x, z) - s : Infinity;
  }
  function scapulaRot(R, s, b, ctx) {
    const F = R.frames, th = F.thorax, ua = F['ua' + s], cl = F['cl' + s], g = SIGN[s] || 1;
    const elev = Math.acos(Math.max(-1, Math.min(1, V.dot(ua.y, th.y)))) / deg;
    const eCl = g * Math.atan2(V.dot(cl.x, th.y), V.dot(cl.x, th.x)) / deg;
    const up = Math.min(55, .4 * Math.max(0, elev - 25)), extra = Math.max(0, up - Math.max(0, eCl));
    const tilt = Math.min(20, .15 * Math.max(0, elev - 30));
    const gl = b.gl[0], n = V.unit(b.nrm[0]), ia = V.sub(b.ia[0], gl), ax = V.unit(V.sub(b.ac[0], gl));
    const turn = (k, a, p = ia) => { const r = rotAxis(k, a); return [0, 1, 2].map(i => r[i][0] * p[0] + r[i][1] * p[1] + r[i][2] * p[2]); };
    /* знаки: нижний угол уходит наружу (|x| растёт) при повороте вверх, к рёбрам (+z) — при наклоне назад
       и при повороте внутрь (вокруг вертикали через впадину) */
    const su = Math.abs(turn(n, deg)[0] + gl[0]) >= Math.abs(ia[0] + gl[0]) ? 1 : -1, st = turn(ax, deg)[2] >= ia[2] ? 1 : -1;
    const sv = turn([0, 1, 0], deg)[2] >= ia[2] ? 1 : -1;
    const rot = (lam, dl) => about(mul({ lin: rotAxis([0, 1, 0], sv * dl * deg), t: [0, 0, 0] },
      mul({ lin: rotAxis(ax, st * lam * tilt * deg), t: [0, 0, 0] }, { lin: rotAxis(n, su * lam * extra * deg), t: [0, 0, 0] })).lin, gl);
    const C = frameAff(cl), sdf = (R2, p) => M.torsoSDF(R, apply(mul(C, R2), p), ctx.cache());
    /* 1) поворот вверх и наклон — наибольшая доля, при которой нижний угол внутри кожи корпуса */
    let lam = 0;
    if (extra >= .1 || tilt >= .1) {
      const inside = l => sdf(rot(l, 0), b.ia[0]) <= -INSIDE;
      if (inside(1)) lam = 1;
      else if (inside(0)) { let lo = 0, hi = 1; for (let k = 0; k < 6; k++) { const m = (lo + hi) / 2; if (inside(m)) lo = m; else hi = m; } lam = lo; }
    }
    /* 2) лопатка скользит по рёбрам: поворотом вокруг вертикали через впадину держим заднюю поверхность под кожей
       (пробные точки не ближе 0,3 см к коже) и переднюю — снаружи рёбер (не ближе RIB_GAP). Наименьший по модулю угол
       от −10° (наружу) до 25° (внутрь), при котором выполнено и то и другое; если нельзя — наименьшее нарушение
       (в протракции у края грудной клетки кожа ближе к рёбрам, чем толщина лопатки: мышц под ней манекен не имеет) */
    const T = R.frames.thorax, rib = ctx.rib;
    const viol = dl => {
      const R2 = rot(lam, dl); let w = -Infinity, c = Infinity;
      for (const p of b.probe) w = Math.max(w, sdf(R2, p));
      if (rib && b.front) { const A = mul(C, R2); for (const p of b.front) c = Math.min(c, ribClear(rib, T, apply(A, p))); }
      return Math.max(2 * (w + .3), RIB_GAP - c); /* выход из кожи заметнее захода в рёбра — вдвое строже */
    };
    let dl = 0;
    if (b.probe && viol(0) > 0) {
      let best = 0, bv = viol(0), okBest = null;
      for (const a of [5, -5, 10, -10, 15, 20, 25]) { const v = viol(a); if (v <= 0 && (okBest === null || Math.abs(a) < Math.abs(okBest))) okBest = a; if (v < bv) { bv = v; best = a; } }
      if (okBest !== null) {
        /* уточняем к нулю: наименьший угол того же знака, при котором ещё всё в порядке */
        let lo = 0, hi = okBest; for (let k = 0; k < 4; k++) { const m = (lo + hi) / 2; if (viol(m) <= 0) hi = m; else lo = m; } dl = hi;
      } else {
        for (const st2 of [2.5, 1.25]) for (const a of [best - st2, best + st2]) { if (a < -10 || a > 25) continue; const v = viol(a); if (v < bv) { bv = v; best = a; } }
        dl = best;
      }
    }
    return lam < .02 && Math.abs(dl) < .1 ? null : rot(lam, dl);
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
    let tc = null; const ctx = { cache: () => tc || (tc = M.torsoCache(R)), rib: bones._rib === undefined ? (bones._rib = ribShell(bones)) : bones._rib };
    bones.forEach((b, i) => {
      const s = b.side, g = SIGN[s] || 1; let A;
      if (b.seg === 'spine') A = frameAff(M.spineFrame(R, b.h));
      else if (b.seg === 'girdle') {
        const C = frameAff(F['cl' + s]), key = 'st' + s, rot = key in cache ? cache[key] : (cache[key] = b.gl ? scapulaRot(R, s, b, ctx) : null);
        if (!rot) A = C;
        else if (b.name === 'scapula') A = mul(C, rot);
        else A = mul(C, { lin: rotBetween(b.ac[0], apply(rot, b.ac[0])), t: [0, 0, 0] }); /* ключица — от грудино-ключичного к сдвинутому акромиону */
      }
      else if (b.name === 'radius') {
        const fa = F['fa' + s], fd = F['fd' + s], phi = jointAngle(fa.z, fd.z, fa.y), [rh, w] = b.pivot;
        A = mul(frameAff(fa), about(rotAxis(V.unit(V.sub(rh, w)), phi), w));
      } else if (b.name === 'patella') {
        const th = F['th' + s], sk = F['sk' + s], k = jointAngle(th.y, sk.y, th.x) * 180 / Math.PI, tr = b.track;
        const i0 = Math.max(0, Math.min(tr.length - 2, Math.floor(k / 10))), u = Math.max(0, Math.min(1, (k - tr[i0][0]) / 10)), row = tr[i0].map((x, j) => x + (tr[i0 + 1][j] - x) * u);
        A = mul(frameAff(th), { lin: rotAxis([1, 0, 0], -row[1] * Math.PI / 180), t: row.slice(2, 5) });
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
