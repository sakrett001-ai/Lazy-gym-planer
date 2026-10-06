/* Перевод на этапе сборки.
   Словарь i18n/<lang>.json — объект «русская строка → перевод». Ключ — строка целиком
   (для шаблонных литералов — каждый текстовый кусок между ${…} отдельно).
   Строки без кириллицы не трогаем. Непереведённое остаётся по-русски и попадает в отчёт. */
const acorn = require('acorn');
const CYR = /[А-Яа-яЁё]/;

/* --- JS: обходим AST, собираем строковые и шаблонные литералы --- */
function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const k in node) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walk(c, visit));
    else if (v && typeof v.type === 'string') walk(v, visit);
  }
}
function jsSegments(src) {
  const ast = acorn.parse(src, {ecmaVersion:'latest', sourceType:'script'});
  const out = [];
  walk(ast, n => {
    if (n.type === 'Literal' && typeof n.value === 'string' && CYR.test(n.value)) out.push({start:n.start, end:n.end, text:n.value, kind:'str', quote:src[n.start]});
    else if (n.type === 'TemplateElement' && CYR.test(n.value.cooked || '')) out.push({start:n.start, end:n.end, text:n.value.cooked, kind:'tpl'});
  });
  return out.sort((a, b) => a.start - b.start);
}
const escStr = (s, q) => s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const escTpl = s => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

/* перевод с сохранением ведущих/замыкающих пробелов и пунктуации: ключ — обрезанная строка */
function lookup(dict, text, missing) {
  const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const core = m[2];
  if (!core || !CYR.test(core)) return text;
  if (Object.prototype.hasOwnProperty.call(dict, core)) return m[1] + dict[core] + m[3];
  if (missing) missing.add(core);
  return text;
}
function translateJs(src, dict, missing) {
  const segs = jsSegments(src);
  let out = '', pos = 0;
  for (const s of segs) {
    const t = lookup(dict, s.text, missing);
    out += src.slice(pos, s.start);
    out += s.kind === 'str' ? s.quote + escStr(t, s.quote) + s.quote : escTpl(t);
    pos = s.end;
  }
  return out + src.slice(pos);
}

/* --- HTML: текстовые узлы и значения атрибутов --- */
const ATTRS = /(\s(?:title|aria-label|aria-description|placeholder|alt|content|label|data-[\w-]+)=")([^"]*?)(")/g;
function translateHtml(src, dict, missing) {
  src = src.replace(ATTRS, (m, a, v, z) => a + lookup(dict, v, missing) + z);
  return src.replace(/>([^<>]*)</g, (m, v) => CYR.test(v) ? '>' + lookup(dict, v, missing) + '<' : m);
}
/* --- CSS: строки в кавычках --- */
function translateCss(src, dict, missing) {
  return src.replace(/(['"])([^'"\n]*?)\1/g, (m, q, v) => CYR.test(v) ? q + lookup(dict, v, missing) + q : m);
}
/* все ключи для перевода (для выгрузки переводчику) */
function collect(jsSources, html, css) {
  const keys = new Map(); // ключ → контекст
  const add = (core, ctx) => { if (!keys.has(core)) keys.set(core, ctx); };
  for (const [name, src] of jsSources) {
    for (const s of jsSegments(src)) {
      const core = s.text.trim(); if (!core) continue;
      const ctx = s.kind === 'tpl' ? src.slice(Math.max(0, src.lastIndexOf('`', s.start)), Math.min(src.length, src.indexOf('`', s.end) + 1)).slice(0, 240) : '';
      add(core, {file:name, ctx});
    }
  }
  const probe = new Set();
  translateHtml(html, {}, probe); for (const k of probe) add(k, {file:'body.html', ctx:''});
  probe.clear(); translateCss(css, {}, probe); for (const k of probe) add(k, {file:'css', ctx:''});
  return keys;
}
module.exports = {translateJs, translateHtml, translateCss, collect, CYR};
