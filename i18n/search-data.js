/* Данные поиска упражнений для сборки (build.js) и для проверок (tools/lang-model.js): window.PODHOD_SEARCH в начале app.js.
   Поиск (src/js/11i-search.js) находит упражнение и по названию на другом языке: в русской версии — по английскому
   (словарь i18n/en.json), в английской — по русскому (исходник src/js). Названия упражнений (name, nameV), групп мышц
   (GROUPS) и мышц (MUSCLE_NAMES) берутся из исходника разбором (acorn), а не исполнением: так их видит и перевод.
   Синонимы, предлоги, сокращения и раскладка — src/data/search.json. Строки дописываются в app.js после перевода:
   русские слова в английской сборке остаются русскими (их ищут, но не показывают). */
const fs = require('node:fs'), path = require('node:path');
const acorn = require('acorn');
const ROOT = path.join(__dirname, '..');

const str = n => n && n.type === 'Literal' && typeof n.value === 'string' ? n.value : null;
const key = p => p.key && (p.key.type === 'Identifier' ? p.key.name : str(p.key));
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
/* названия из исходника на русском: упражнения — объекты с id, name, g и pri; GROUPS и MUSCLE_NAMES */
function sourceNames(jsSrc) {
  const ast = acorn.parse(jsSrc, {ecmaVersion:'latest', sourceType:'script'});
  const ex = {}, groups = {}, muscles = {};
  walk(ast, n => {
    if (n.type === 'ObjectExpression') {
      const p = Object.fromEntries(n.properties.filter(q => q.type === 'Property').map(q => [key(q), q.value]));
      const id = str(p.id), name = str(p.name);
      if (id && name && str(p.g) && p.pri && p.pri.type === 'ArrayExpression') {
        const v = p.nameV && p.nameV.type === 'ObjectExpression' ? p.nameV.properties.map(q => str(q.value)).filter(Boolean) : [];
        ex[id] = [name, ...v];
      }
    }
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) {
      if (n.id.name === 'GROUPS' && n.init.type === 'ArrayExpression')
        for (const g of n.init.elements) { const p = Object.fromEntries(g.properties.map(q => [key(q), str(q.value)])); if (p.id && p.name) groups[p.id] = [p.name]; }
      if (n.id.name === 'MUSCLE_NAMES' && n.init.type === 'ObjectExpression')
        for (const q of n.init.properties) if (str(q.value)) muscles[key(q)] = [str(q.value)];
    }
  });
  return {ex, groups, muscles};
}
/* lang — язык сборки; jsSrc — исходник src/js на русском (до перевода); dict — словарь i18n/en.json.
   alt — названия на другом языке (русской версии — английские, английской — русские); syn — синонимы на обоих языках */
function searchData(lang, jsSrc, dict) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/search.json'), 'utf8'));
  const names = sourceNames(jsSrc);
  const other = list => lang === 'ru' ? list.map(s => Object.prototype.hasOwnProperty.call(dict, s) ? dict[s] : null).filter(Boolean) : list;
  const alt = {};
  for (const k of ['ex', 'groups', 'muscles']) alt[k] = Object.fromEntries(Object.entries(names[k]).map(([id, list]) => [id, other(list)]).filter(([, l]) => l.length));
  const both = o => Object.fromEntries(Object.entries(o || {}).map(([id, v]) => [id, [...(v.ru || []), ...(v.en || [])]]));
  return {alt, syn:{ex:both(data.exercises), groups:both(data.groups), muscles:both(data.muscles)}, stop:data.stop, words:data.words, layout:data.layout};
}
module.exports = {searchData, sourceNames};
