'use strict';
/* Упаковка костей для приложения: qa/skeleton/bones.json (build_bones.py) → src/data/skeleton.bin.
   node tools/skeleton/pack.js [вход.json] [выход.bin]
   Формат (до сжатия gzip): 'SKL1', u32 длина заголовка, заголовок JSON (UTF-8, дополнен пробелами до 4 байт),
   затем по костям подряд, без выравнивания: вершины Int16 (×0,01 см, локальные координаты сегмента) и индексы Uint16.
   Заголовок: {version, source, scale, bones:[{name, side, seg, nv, nf, …параметры раскладки}]}. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const input = path.resolve(root, process.argv[2] || 'qa/skeleton/bones.json');
const output = path.resolve(root, process.argv[3] || 'src/data/skeleton.bin');
const SCALE = 100; /* 1 ед. = 0,01 см */
const src = JSON.parse(fs.readFileSync(input, 'utf8'));
const meta = [], chunks = [];
for (const b of src.bones) {
  const nv = b.v.length / 3, nf = b.f.length / 3;
  if (nv > 65535) throw Error(`${b.name}: слишком много вершин (${nv})`);
  const pos = new Int16Array(b.v.length);
  for (let i = 0; i < b.v.length; i++) {
    const q = Math.round(b.v[i] * SCALE);
    if (q < -32768 || q > 32767) throw Error(`${b.name}: координата ${b.v[i]} вне диапазона`);
    pos[i] = q;
  }
  const idx = Uint16Array.from(b.f);
  const { v, f, ...rest } = b;
  meta.push({ ...rest, nv, nf });
  chunks.push(Buffer.from(pos.buffer), Buffer.from(idx.buffer));
}
let header = Buffer.from(JSON.stringify({ version: 1, source: src.source, scale: SCALE, bones: meta }), 'utf8');
if (header.length % 4) header = Buffer.concat([header, Buffer.alloc(4 - header.length % 4, 0x20)]);
const head = Buffer.alloc(8); head.write('SKL1', 0, 'latin1'); head.writeUInt32LE(header.length, 4);
const raw = Buffer.concat([head, header, ...chunks]);
const gz = zlib.gzipSync(raw, { level: 9 });
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, gz);
const tris = meta.reduce((s, b) => s + b.nf, 0);
console.log(`${path.relative(root, output)}: костей ${meta.length}, треугольников ${tris}, ${(raw.length / 1024).toFixed(0)} КБ → gzip ${(gz.length / 1024).toFixed(0)} КБ`);
