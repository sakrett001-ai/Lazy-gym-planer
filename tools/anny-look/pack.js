'use strict';
/* Упаковка кожи Anny для приложения: qa/anny-look/anny.json (build.py) → src/data/anny.bin. Руками файл не править.
   node tools/anny-look/pack.js [вход.json] [выход.bin]
   Формат (до сжатия gzip): 'ANY1', u32 длина заголовка, заголовок JSON (UTF-8, дополнен пробелами до 4 байт), затем подряд:
     вершины Int16 ×3 (×0,01 см, каталог: Y вниз, пол 186; нейтральная стойка манекена), треугольники Int16 ×3 разностями
     (index: 'delta': первая вершина — от первой вершины предыдущего треугольника, вторая и третья — от первой своего; в
     таком виде gzip сжимает их на треть лучше, чем номера подряд), веса: номера рамок Uint8 ×4 и доли Uint8 ×4 (сумма 255),
     адрес на процедурной коже: часть Uint8, сторона Uint8, a1 Int16 и a2 Int16 (×1/500), затенённость впадин Uint8 (доля
     открытого неба ×255; shade: true) с байтом выравнивания при нечётном числе вершин, корректирующие формы: номера вершин
     Uint16 и смещения Int16 ×3 (×0,01 см) — по формам подряд, длины — в заголовке.
   Заголовок: {version, source, scale, rscale, index, shade, frames, nv, nf, correctives:[{name, n, …правило включения}]}.
   Сжатие — gzip уровня 9 без имени файла и времени (zlib.gzipSync): тот же вход даёт тот же файл байт в байт. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const SCALE = 100, RSCALE = 500;

function int16(v, k, what) { const q = Math.round(v * k); if (q < -32768 || q > 32767) throw Error(`${what}: ${v} вне диапазона`); return q; }
/* треугольники разностями (см. шапку) и обратно */
function deltaIndex(f) { const out = new Int16Array(f.length); let prev = 0; for (let t = 0; t < f.length; t += 3) { out[t] = int16(f[t] - prev, 1, 'треугольник'); out[t + 1] = int16(f[t + 1] - f[t], 1, 'треугольник'); out[t + 2] = int16(f[t + 2] - f[t], 1, 'треугольник'); prev = f[t]; } return out; }
function undeltaIndex(e) { const out = new Uint16Array(e.length); let prev = 0; for (let t = 0; t < e.length; t += 3) { const a = prev + e[t]; out[t] = a; out[t + 1] = a + e[t + 1]; out[t + 2] = a + e[t + 2]; prev = a; } return out; }
function encode(src) {
  const nv = src.v.length / 3, nf = src.f.length / 3;
  if (nv > 65535) throw Error(`слишком много вершин (${nv})`);
  const pos = new Int16Array(nv * 3); for (let i = 0; i < nv * 3; i++) pos[i] = int16(src.v[i], SCALE, 'вершина');
  for (const i of src.f) if (!(i >= 0 && i < nv)) throw Error(`треугольник: вершина ${i} вне сетки`);
  const idx = deltaIndex(src.f);
  const wi = Uint8Array.from(src.wi), ww = Uint8Array.from(src.ww);
  if (wi.length !== nv * 4 || ww.length !== nv * 4) throw Error('веса: нужно по 4 на вершину');
  for (let i = 0; i < nv; i++) { let s = 0; for (let k = 0; k < 4; k++) s += ww[i * 4 + k]; if (s !== 255) throw Error(`веса вершины ${i}: сумма ${s}`); }
  const R = src.region, code = Uint8Array.from(R.code), side = Uint8Array.from(R.side), a1 = new Int16Array(nv), a2 = new Int16Array(nv);
  for (let i = 0; i < nv; i++) { a1[i] = int16(R.a1[i], RSCALE, 'адрес'); a2[i] = int16(R.a2[i], RSCALE, 'адрес'); }
  if (!src.shade || src.shade.length !== nv) throw Error('затенённость: нужно по байту на вершину');
  for (const s of src.shade) if (!(s >= 0 && s <= 255 && s === Math.round(s))) throw Error(`затенённость: ${s} — не байт`);
  const shade = Uint8Array.from(src.shade);
  const meta = [], chunks = [];
  for (const c of src.correctives) {
    const n = c.i.length, ci = Uint16Array.from(c.i), cd = new Int16Array(n * 3); for (let k = 0; k < n * 3; k++) cd[k] = int16(c.d[k], SCALE, 'смещение');
    const { i, d, ...rest } = c; meta.push({ ...rest, n }); chunks.push(Buffer.from(ci.buffer), ...(n % 2 ? [Buffer.alloc(2)] : []), Buffer.from(cd.buffer));
  }
  let header = Buffer.from(JSON.stringify({ version: 1, source: src.source, scale: SCALE, rscale: RSCALE, index: 'delta', shade: true, frames: src.frames, nv, nf, correctives: meta }), 'utf8');
  if (header.length % 4) header = Buffer.concat([header, Buffer.alloc(4 - header.length % 4, 0x20)]);
  const head = Buffer.alloc(8); head.write('ANY1', 0, 'latin1'); head.writeUInt32LE(header.length, 4);
  /* выравнивание: Int16 — по 2 байта, всё подряд кратно 2 (после байтов затенённости при нечётном nv — байт выравнивания) */
  const raw = Buffer.concat([head, header, Buffer.from(pos.buffer), Buffer.from(idx.buffer), Buffer.from(wi.buffer), Buffer.from(ww.buffer), Buffer.from(code.buffer), Buffer.from(side.buffer),
    Buffer.from(a1.buffer), Buffer.from(a2.buffer), Buffer.from(shade.buffer), ...(nv % 2 ? [Buffer.alloc(1)] : []), ...chunks]);
  return { raw, gz: zlib.gzipSync(raw, { level: 9 }), nv, nf, meta };
}
module.exports = { encode, deltaIndex, undeltaIndex };
if (require.main === module) {
  const input = path.resolve(root, process.argv[2] || 'qa/anny-look/anny.json'), output = path.resolve(root, process.argv[3] || 'src/data/anny.bin');
  const { raw, gz, nv, nf, meta } = encode(JSON.parse(fs.readFileSync(input, 'utf8')));
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, gz);
  console.log(`${path.relative(root, output)}: вершин ${nv}, треугольников ${nf}, корректирующих форм ${meta.length}, ${(raw.length / 1024).toFixed(0)} КБ → gzip ${(gz.length / 1024).toFixed(0)} КБ`);
}
