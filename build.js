#!/usr/bin/env node
/* Сборка Lazy Gym Planner: node build.js
   dist/index.html                    — PWA, русский (отдельные css/js/шрифты, кешируются сервис-воркером)
   dist/en/index.html                 — PWA, английский (перевод накладывается при сборке, словарь i18n/en.json)
   dist/lazy-gym-planner-offline-ru.html, -en.html — один файл, всё встроено
   dist/artifact.html                 — тело русской страницы для публикации артефактом */
const fs = require('fs'), path = require('path');
const {translateJs, translateHtml, translateCss} = require('./i18n/translate');
const SRC = path.join(__dirname, 'src'), DIST = path.join(__dirname, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = pkg.version;
const read = p => fs.readFileSync(p, 'utf8');
const list = (dir, ext) => fs.readdirSync(dir).filter(f => f.endsWith(ext)).sort().map(f => path.join(dir, f));

const LANGS = {
  ru:{dir:'', html:'ru', title:'Lazy Gym Planner', desc:'Lazy Gym Planner — планировщик тренировок: подбор под мышцы и оборудование, техника, журнал весов.',
    manifestName:'Lazy Gym Planner — планировщик тренировок', manifestDesc:'Подбор тренировки под мышцы и оборудование, техника, журнал весов.',
    other:{href:'en/', label:'EN', offline:'lazy-gym-planner-offline-en.html', title:'English version'}, patch:''},
  en:{dir:'en', html:'en', title:'Lazy Gym Planner', desc:'Lazy Gym Planner — workout planner: picks exercises for your muscles and equipment, shows technique, logs your weights.',
    manifestName:'Lazy Gym Planner — workout planner', manifestDesc:'Workouts built around your muscles and equipment, technique, weight log.',
    other:{href:'../', label:'RU', offline:'lazy-gym-planner-offline-ru.html', title:'Русская версия'},
    /* английское множественное число: 1 → форма a, иначе c */
    patch:`\nplural = (n, a, b, c) => n === 1 ? a : c;\nDEC = '.';\n`}
};

fs.rmSync(DIST, {recursive:true, force:true});
fs.mkdirSync(path.join(DIST, 'fonts'), {recursive:true});

const cssSrc = list(path.join(SRC, 'css'), '.css').map(read).join('\n');
const jsSrc = list(path.join(SRC, 'js'), '.js').map(read).join('\n');
const bodySrc = read(path.join(SRC, 'body.html'));
const pwaSrc = read(path.join(SRC, 'pwa.js')).replace(/__VERSION__/g, VERSION);
const manifestSrc = JSON.parse(read(path.join(SRC, 'manifest.webmanifest')));
const reset = `:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}`;
const headMeta = L => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ECEFF3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1116" media="(prefers-color-scheme: dark)">
<meta name="description" content="${L.desc}">`;

/* шрифты: inline base64 для single-file сборок, относительные пути для PWA */
const fontsDir = path.join(SRC, 'fonts');
const inlineFonts = c => c.replace(/url\(\.\.\/fonts\/([\w.-]+)\)/g, (m, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontsDir, f)).toString('base64')})`);
for (const f of fs.readdirSync(fontsDir)) fs.copyFileSync(path.join(fontsDir, f), path.join(DIST, 'fonts', f));
for (const f of ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) { const p = path.join(SRC, f); if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST, f)); }
fs.writeFileSync(path.join(DIST, 'sw.js'), read(path.join(SRC, 'sw.js')).replace(/__VERSION__/g, VERSION));
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

const report = [];
for (const [lang, L] of Object.entries(LANGS)) {
  const out = path.join(DIST, L.dir); fs.mkdirSync(out, {recursive:true});
  const up = L.dir ? '../' : '';
  let css = cssSrc, js = jsSrc, body = bodySrc, pwa = pwaSrc;
  if (lang !== 'ru') {
    const dictPath = path.join(__dirname, 'i18n', lang + '.json');
    const dict = fs.existsSync(dictPath) ? JSON.parse(read(dictPath)) : {};
    const missing = new Set();
    css = translateCss(css, dict, missing); js = translateJs(js, dict, missing); body = translateHtml(body, dict, missing); pwa = translateJs(pwa, dict, missing);
    if (missing.size) report.push(`${lang}: не переведено ${missing.size} строк (node i18n/extract.js ${lang})`);
  }
  js += L.patch + `\nwindow.PODHOD_VERSION='${VERSION}';window.PODHOD_LANG='${lang}';\n`;
  body = body.replace(/__VERSION__/g, VERSION).replace(/__LANG_HREF__/g, L.other.href).replace(/__LANG_LABEL__/g, L.other.label).replace(/__LANG_TITLE__/g, L.other.title);
  const manifest = {...manifestSrc, name:L.manifestName, description:L.manifestDesc, lang, scope:up || './', icons:manifestSrc.icons.map(i => ({...i, src:up + i.src}))};

  /* 1. PWA */
  fs.writeFileSync(path.join(out, 'app.css'), css.replace(/\.\.\/fonts\//g, up + 'fonts/'));
  fs.writeFileSync(path.join(out, 'app.js'), js);
  fs.writeFileSync(path.join(out, 'pwa.js'), pwa.replace(/__SW__/g, up + 'sw.js'));
  fs.writeFileSync(path.join(out, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="${L.html}">
<head>
${headMeta(L)}
<title>${L.title}</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="${up}icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${up}icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Lazy Gym">
<link rel="alternate" hreflang="${lang === 'ru' ? 'en' : 'ru'}" href="${L.other.href}">
<style>${reset}</style>
<link rel="stylesheet" href="app.css?v=${VERSION}">
</head>
<body>
${body}
<script src="app.js?v=${VERSION}"></script>
<script src="pwa.js?v=${VERSION}"></script>
</body>
</html>
`);

  /* 2. офлайн-файл: ссылка на другой язык ведёт на соседний офлайн-файл */
  const single = `<title>${L.title}</title>\n<style>\n${inlineFonts(css)}\n</style>\n${body.replace(`href="${L.other.href}"`, `href="${L.other.offline}"`)}\n<script>\n${js}\n</script>\n`;
  fs.writeFileSync(path.join(DIST, `lazy-gym-planner-offline-${lang}.html`), `<!doctype html>
<html lang="${L.html}">
<head>
${headMeta(L)}
<style>${reset}</style>
</head>
<body>
${single}
</body>
</html>
`);
  /* 3. артефакт (только русский) */
  if (lang === 'ru') fs.writeFileSync(path.join(DIST, 'artifact.html'), single);
  report.push(`${lang}: app.js ${(js.length / 1024 | 0)} КБ, offline ${(fs.statSync(path.join(DIST, `lazy-gym-planner-offline-${lang}.html`)).size / 1024 | 0)} КБ`);
}
console.log(`Lazy Gym Planner ${VERSION} — ` + report.join('; '));
