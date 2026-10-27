/* Лист пробы кожи: node tools/skin-probe/render.mjs --spec spec.json --out sheet.png
   spec: { title, sub, rows: [{ title, note, panels: [{ label, cam, center: [x,y,z] см, span: см, body: 'mannequin'|'mesh',
           mesh: { pos, idx }, bones: [{ pos, idx, color? }], ghost, marks: [{ p, r, color }] }] }],
           blocks: [{ title, html }] }  — блоки (таблицы) идут под рядами.
   Ячейки рисует настоящая WebGL-сцена приложения (src/volume/scene.mjs): свет, тон, материал кожи «манекен».
   В контейнере без нужной ревизии Chromium берётся headless_shell из /opt/pw-browsers. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild'),{chromium}=require('playwright');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const spec=JSON.parse(await fs.readFile(arg('--spec'),'utf8')),out=path.resolve(arg('--out','qa/skin-probe.png'));
const lab=path.join(path.dirname(out),'.render-'+process.pid);await fs.mkdir(lab,{recursive:true});
await build({entryPoints:[path.join(here,'render-entry.mjs')],outfile:path.join(lab,'probe.js'),bundle:true,format:'iife',target:['es2020'],logLevel:'error'});
await fs.writeFile(path.join(lab,'index.html'),`<!doctype html><meta charset="utf-8"><body style="margin:0"><script src="${root}/src/js/09bm-mannequin.js"></script><script src="probe.js"></script>`);
async function launch(){
 const args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 try{return await chromium.launch({args});}
 catch(e){return chromium.launch({args,executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});}
}
const browser=await launch(),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+path.join(lab,'index.html'));
const W=+arg('--w','300'),H=+arg('--h','470');
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
let rowsHtml='';
for(const row of spec.rows){
 const imgs=await page.evaluate(([p,o])=>Probe.render(p,o),[row.panels,{w:W,h:H}]);
 rowsHtml+=`<section><h2>${esc(row.title)}</h2>${row.note?`<p class="note">${esc(row.note)}</p>`:''}<div class="row">`+
  imgs.map((u,i)=>`<figure><img src="${u}" width="${row.panels[i].w||W}" height="${row.panels[i].h||H}"><figcaption>${esc(row.panels[i].label)}</figcaption></figure>`).join('')+`</div></section>`;
}
const css=`body{margin:0;background:#0b1018;color:#dfe7f3;font:14px/1.35 system-ui,sans-serif;width:${arg('--width','1900')}px}
 header{padding:18px 22px 6px}h1{margin:0;font-size:24px}header p{margin:4px 0;color:#a9b6c9}
 section{padding:8px 22px 4px}h2{font-size:17px;margin:6px 0 4px;color:#f3f6fb}.note{margin:0 0 6px;color:#a9b6c9;max-width:1800px}
 .row{display:flex;gap:6px;flex-wrap:wrap}figure{margin:0}figcaption{font-size:13px;color:#c5d1e3;padding:3px 2px}
 .blocks{display:flex;flex-wrap:wrap;gap:18px;padding:10px 22px 22px}.block{flex:1 1 880px}
 table{border-collapse:collapse;font-size:12.5px;width:100%}th,td{padding:2px 6px;border-bottom:1px solid #243044;text-align:right;white-space:nowrap}
 th:first-child,td:first-child{text-align:left;white-space:normal}th{color:#9fb0c8;font-weight:600;position:sticky}
 .ok{color:#8fd19e}.warn{color:#f2c46d}.bad{color:#ff7a6b}.dim{color:#7f8da3}.small{font-size:12px;color:#9fb0c8}`;
const html=`<!doctype html><meta charset="utf-8"><style>${css}</style><header><h1>${esc(spec.title)}</h1>${(spec.sub||[]).map(s=>`<p>${esc(s)}</p>`).join('')}</header>${rowsHtml}<div class="blocks">${(spec.blocks||[]).map(b=>`<div class="block"><h2>${esc(b.title)}</h2>${b.html}</div>`).join('')}</div>`;
await fs.writeFile(path.join(lab,'sheet.html'),html);
const p2=await browser.newPage({viewport:{width:+arg('--width','1900'),height:800}});await p2.goto('file://'+path.join(lab,'sheet.html'));
await fs.mkdir(path.dirname(out),{recursive:true});await p2.screenshot({path:out,fullPage:true});
if(arg('--html'))await fs.copyFile(path.join(lab,'sheet.html'),arg('--html'));
if(errors.length)console.log('Ошибки страницы:',errors.slice(0,5));
await browser.close();await fs.rm(lab,{recursive:true,force:true});console.log(out);
