#!/usr/bin/env node
/* Сборка «Подхода». Без зависимостей: node build.js
   dist/index.html          — PWA (отдельные css/js/шрифты, кешируются сервис-воркером)
   dist/podhod-offline.html — один файл, всё встроено
   dist/artifact.html       — тело страницы для публикации артефактом (без <html>/<head>) */
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, 'src'), DIST = path.join(__dirname, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = pkg.version;
const read = p => fs.readFileSync(p, 'utf8');
const list = (dir, ext) => fs.readdirSync(dir).filter(f => f.endsWith(ext)).sort().map(f => path.join(dir, f));

fs.rmSync(DIST, {recursive:true, force:true});
fs.mkdirSync(path.join(DIST, 'fonts'), {recursive:true});

const css = list(path.join(SRC, 'css'), '.css').map(read).join('\n');
const js = list(path.join(SRC, 'js'), '.js').map(read).join('\n') + `\nwindow.PODHOD_VERSION='${VERSION}';\n`;
const body = read(path.join(SRC, 'body.html')).replace(/__VERSION__/g, VERSION);
const reset = `:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}`;
const headMeta = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ECEFF3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1116" media="(prefers-color-scheme: dark)">
<meta name="description" content="Подход — планировщик тренировок: подбор под мышцы и оборудование, техника, журнал весов.">`;

/* шрифты: inline base64 для single-file сборок, относительные пути для PWA */
const fontsDir = path.join(SRC, 'fonts');
const inlineFonts = c => c.replace(/url\(\.\.\/fonts\/([\w.-]+)\)/g, (m, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontsDir, f)).toString('base64')})`);
for (const f of fs.readdirSync(fontsDir)) fs.copyFileSync(path.join(fontsDir, f), path.join(DIST, 'fonts', f));

/* 1. PWA */
fs.writeFileSync(path.join(DIST, 'app.css'), css.replace(/\.\.\/fonts\//g, 'fonts/'));
fs.writeFileSync(path.join(DIST, 'app.js'), js);
const sw = read(path.join(SRC, 'sw.js')).replace(/__VERSION__/g, VERSION);
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), read(path.join(SRC, 'manifest.webmanifest')));
for (const f of ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) { const p = path.join(SRC, f); if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST, f)); }
fs.writeFileSync(path.join(DIST, 'index.html'), `<!doctype html>
<html lang="ru">
<head>
${headMeta}
<title>Подход</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Подход">
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
fs.writeFileSync(path.join(DIST, 'pwa.js'), read(path.join(SRC, 'pwa.js')).replace(/__VERSION__/g, VERSION));

/* 2. офлайн-файл */
const single = `<title>Планировщик «Подход»</title>\n<style>\n${inlineFonts(css)}\n</style>\n${body}\n<script>\n${js}\n</script>\n`;
fs.writeFileSync(path.join(DIST, 'podhod-offline.html'), `<!doctype html>
<html lang="ru">
<head>
${headMeta}
<style>${reset}</style>
</head>
<body>
${single}
</body>
</html>
`);
/* 3. артефакт */
fs.writeFileSync(path.join(DIST, 'artifact.html'), single);
console.log(`Подход ${VERSION}: index.html ${(fs.statSync(path.join(DIST, 'index.html')).size / 1024 | 0)} КБ, app.js ${(js.length / 1024 | 0)} КБ, podhod-offline.html ${(fs.statSync(path.join(DIST, 'podhod-offline.html')).size / 1024 | 0)} КБ`);
