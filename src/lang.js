/* Язык при заходе на сайт. Встраивается в <head> страниц PWA (build.js) раньше стилей и приложения, поэтому
   переход на другой язык происходит до первой отрисовки. В офлайн-файлы и в сборку для Floot не входит: там адрес
   документа не меняется (Floot сам выбирает документ по своему адресу).
   Языки — список из build.js (PODHOD_LANGS): папка каждого языка, язык корня сайта и язык для браузера, в списке
   которого нет ни одного из доступных. Правила:
   * выбор запоминается в localStorage (podhod.lang), общем для корня и папок языков;
   * переключатель языка (ссылка с hreflang) запоминает свой язык до перехода;
   * открытая страница не корневого языка (/en/) — явный выбор: он и запоминается;
   * ?lang=<код> в адресе — явный выбор: запоминается, страница переходит на этот язык, параметр убирается;
   * корень сайта без сохранённого выбора: язык корня есть где-либо в navigator.languages — остаётся; иначе первый
     доступный язык из navigator.languages, а если таких нет — запасной;
   * уходит со страницы только корень (или явный ?lang=), поэтому циклов переадресации нет.
   Чистые функции langTarget и langUrl проверяет tools/lang-pick.test.js. */
(function (g) {
  'use strict';
  var KEY = 'podhod.lang';
  /* основной код языка: «en-US» → «en», «pt_BR» → «pt» */
  function primary(tag) { return String(tag == null ? '' : tag).trim().toLowerCase().split(/[-_]/)[0]; }
  function has(cfg, l) { return typeof l === 'string' && Object.prototype.hasOwnProperty.call(cfg.langs, l); }
  /* на какой язык перейти со страницы page, или null — остаться.
     saved — сохранённый выбор, nav — navigator.languages, asked — ?lang= из адреса */
  function langTarget(cfg, page, saved, nav, asked) {
    if (has(cfg, asked)) return asked === page ? null : asked;
    if (page !== cfg.root) return null;
    if (has(cfg, saved)) return saved === page ? null : saved;
    var list = (Array.isArray(nav) ? nav : nav ? [nav] : []).map(primary);
    if (list.indexOf(cfg.root) >= 0) return null;
    var hit = null;
    for (var i = 0; i < list.length && !hit; i++) if (has(cfg, list[i])) hit = list[i];
    var want = hit || cfg.fallback;
    return has(cfg, want) && want !== page ? want : null;
  }
  /* что запомнить при заходе: явный ?lang=, иначе язык открытой страницы не корня; корень без выбора — ничего */
  function langRemember(cfg, page, asked) { return has(cfg, asked) ? asked : page !== cfg.root ? page : null; }
  /* адрес страницы языка target со страницы page: та же папка сайта, тот же файл (index.html — если был в адресе),
     тот же запрос без lang и тот же якорь */
  function langUrl(cfg, page, target, loc) {
    var p = String(loc.pathname || '/'), m = /^(.*\/)([^\/]*)$/.exec(p) || [p, '/', ''];
    var dir = m[1], file = m[2], own = cfg.langs[page] || '';
    var base = own && dir.slice(-own.length) === own ? dir.slice(0, -own.length) : dir;
    return base + (cfg.langs[target] || '') + file + dropLang(loc.search) + (loc.hash || '');
  }
  function dropLang(search) {
    var q = String(search || '').replace(/^\?/, '');
    if (!q) return '';
    var rest = q.split('&').filter(function (kv) { return kv && kv.split('=')[0] !== 'lang'; });
    return rest.length ? '?' + rest.join('&') : '';
  }
  var api = {KEY:KEY, primary:primary, langTarget:langTarget, langRemember:langRemember, langUrl:langUrl, dropLang:dropLang};
  if (typeof module === 'object' && module && module.exports) module.exports = api;
  g.PodhodLang = api;

  /* ---------- на странице ---------- */
  var cfg = g.PODHOD_LANGS;
  if (!cfg || !cfg.langs || typeof location === 'undefined') return;
  var page = cfg.page, store = null;
  try { store = g.localStorage; } catch (e) {}
  var read = function () { try { return store ? store.getItem(KEY) : null; } catch (e) { return null; } };
  var save = function (l) { try { if (store && has(cfg, l) && store.getItem(KEY) !== l) store.setItem(KEY, l); } catch (e) {} };
  var asked = null;
  try { var q = /(?:^|[?&])lang=([^&#]*)/.exec(location.search || ''); if (q) asked = decodeURIComponent(q[1]); } catch (e) {}
  var nav = g.navigator || {}, langs = nav.languages && nav.languages.length ? Array.prototype.slice.call(nav.languages) : [nav.language];
  /* поисковые роботы видят каждую страницу на её языке */
  var bot = /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(nav.userAgent || '');
  var saved = read(), target = bot && !has(cfg, asked) ? null : langTarget(cfg, page, saved, langs, asked);
  save(langRemember(cfg, page, asked));
  if (target) { location.replace(langUrl(cfg, page, target, location)); return; }
  if (has(cfg, asked)) try { history.replaceState(history.state, '', langUrl(cfg, page, page, location)); } catch (e) {}
  /* переключатель языка: выбор — до перехода, чтобы корень не вернул на прежний язык */
  if (g.document && g.document.addEventListener) g.document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[hreflang]') : null;
    if (a) save(a.getAttribute('hreflang'));
  }, true);
})(typeof globalThis !== 'undefined' ? globalThis : this);
