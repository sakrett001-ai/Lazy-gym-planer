#!/usr/bin/env node
/* Собирает все русские строки из src в i18n/strings.json и список непереведённых в i18n/missing.<lang>.json
   node i18n/extract.js [lang=en] */
const fs = require('fs'), path = require('path');
const {collect} = require('./translate');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const lang = process.argv[2] || 'en';
const list = (dir, ext) => fs.readdirSync(dir).filter(f => f.endsWith(ext)).sort();
const js = list(path.join(SRC, 'js'), '.js').map(f => [f, fs.readFileSync(path.join(SRC, 'js', f), 'utf8')]);
js.push(['pwa.js', fs.readFileSync(path.join(SRC, 'pwa.js'), 'utf8')]);
const html = fs.readFileSync(path.join(SRC, 'body.html'), 'utf8');
const css = list(path.join(SRC, 'css'), '.css').map(f => fs.readFileSync(path.join(SRC, 'css', f), 'utf8')).join('\n');
const keys = collect(js, html, css);
const strings = {}; for (const [k, v] of keys) strings[k] = v;
fs.writeFileSync(path.join(__dirname, 'strings.json'), JSON.stringify(strings, null, 1));
const dictPath = path.join(__dirname, lang + '.json');
const dict = fs.existsSync(dictPath) ? JSON.parse(fs.readFileSync(dictPath, 'utf8')) : {};
const missing = {}; let n = 0;
for (const [k, v] of keys) if (!Object.prototype.hasOwnProperty.call(dict, k)) { missing[k] = v.ctx ? {file:v.file, ctx:v.ctx} : v.file; n++; }
fs.writeFileSync(path.join(__dirname, `missing.${lang}.json`), JSON.stringify(missing, null, 1));
const stale = Object.keys(dict).filter(k => !keys.has(k));
console.log(`Строк: ${keys.size}, переведено (${lang}): ${keys.size - n}, не переведено: ${n}, лишних в словаре: ${stale.length}`);
