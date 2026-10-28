/* Лист сравнения вариантов кожи по столбцам: те же кадры сцены приложения (свет и тон студии, вид «Манекен») из разных копий
   кода и данных. node tools/anny-look/sheet-cols.mjs --spec spec.json --out лист.png [--width 1900]
   spec: { title, sub: [строки],
     cols: [{ key, label, root?, bin?, look? }] — root: корень копии кода (по умолчанию эта), bin: anny.bin (по умолчанию
       src/data/anny.bin копии; 'none' — без кожи Anny, процедурная), look: globalThis.ANNY_LOOK (вид кожи, src/volume/anny.mjs),
     camFrom: key столбца, по которому считается рамка камеры (у остальных — та же),
     rows: [{ title, note?, cols?: [key…], panels: [{ id | 'stance', t, cam, label?, focus?, span?, w?, h?, has? }] }],
     blocks: [{ title, html }] — таблицы под рядами }
   Ряд — один кадр (панели ряда — разные ракурсы или фазы) во всех столбцах ряда: столбцы идут подряд, слева направо. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild'),{chromium}=require('playwright'),zlib=require('node:zlib');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const spec=JSON.parse(await fs.readFile(arg('--spec'),'utf8')),out=path.resolve(arg('--out','qa/anny-look/cols.png')),W=+arg('--width','1900');
const ids=[...new Set(spec.rows.flatMap(r=>r.panels.map(p=>p.id)).filter(id=>id!=='stance'))];
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const labs=new Map();
async function lab(src){
 if(labs.has(src))return labs.get(src);
 const dir=path.join(path.dirname(out),'.cols-'+process.pid+'-'+labs.size);await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(path.join(dir,'entry.mjs'),`import * as THREE from 'three';import {createCatalogScene} from '${src}/src/volume/scene.mjs';window.THREE=THREE;window.createCatalogScene=createCatalogScene;`);
 await build({entryPoints:[path.join(dir,'entry.mjs')],outfile:path.join(dir,'lab.js'),bundle:true,format:'iife',target:['es2020'],logLevel:'error',nodePaths:[path.join(root,'node_modules')]});
 const js=(await fs.readdir(path.join(src,'src/js'))).filter(f=>/^09b[m-s].*\.js$/.test(f)&&!/^09bp/.test(f)).sort();
 const {bakeAll}=require(path.join(src,'tools/mannequin/author.js'));
 const L={dir,js,entries:bakeAll({only:ids})};labs.set(src,L);return L;
}
const pages={};
for(const c of spec.cols){
 const src=path.resolve(c.root||root),L=await lab(src),dir=path.join(L.dir,c.key);await fs.mkdir(dir,{recursive:true});
 let data='';const bin=c.bin==='none'?null:path.resolve(c.bin||path.join(src,'src/data/anny.bin'));
 if(bin)try{data=`window.ANNY_RAW='${zlib.gunzipSync(await fs.readFile(bin)).toString('base64')}';`;}catch(e){}
 data+=`window.ANNY_LOOK=${JSON.stringify(c.look||null)};`;
 await fs.writeFile(path.join(dir,'data.js'),data);
 await fs.writeFile(path.join(dir,'index.html'),`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">${L.js.map(f=>`<script src="${src}/src/js/${f}"></script>`).join('')}<script src="data.js"></script><script src="../lab.js"></script><script src="${path.join(here,'sheet-page.js')}"></script>`);
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('file://'+path.join(dir,'index.html'));pages[c.key]={p,entries:L.entries,errors,col:c};
}
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
let html='';
for(const row of spec.rows){
 const keys=row.cols||spec.cols.map(c=>c.key),first=pages[spec.camFrom&&keys.includes(spec.camFrom)?spec.camFrom:keys[0]];
 const A=await first.p.evaluate(([panels,entries])=>Sheet.render(panels,entries,null),[row.panels,first.entries]),cams=A.map(a=>a.cam);
 html+=`<section><h2>${esc(row.title)}</h2>${row.note?`<p class="note">${esc(row.note)}</p>`:''}<div class="grid">`;
 for(const k of keys){
  const P=pages[k],R=P===first?A:await P.p.evaluate(([panels,entries,cams])=>Sheet.render(panels,entries,cams),[row.panels,P.entries,cams]);
  html+=`<div class="col"><div class="lbl">${esc(P.col.label)}</div><div class="row">${R.map((r,i)=>`<figure><img src="${r.url}" width="${row.panels[i].w||300}" height="${row.panels[i].h||360}">${row.panels[i].label?`<figcaption>${esc(row.panels[i].label)}</figcaption>`:''}</figure>`).join('')}</div></div>`;
 }
 html+='</div></section>';
}
const css=`body{margin:0;background:#0b1018;color:#dfe7f3;font:14px/1.35 system-ui,sans-serif;width:${W}px}header{padding:16px 20px 4px}h1{margin:0;font-size:22px}
 header p{margin:3px 0;color:#a9b6c9}section{padding:6px 20px 8px;border-top:1px solid #1d2838}h2{font-size:16px;margin:6px 0 4px}.note{margin:0 0 6px;color:#a9b6c9}
 .grid{display:flex;gap:14px;flex-wrap:wrap}.col{display:flex;flex-direction:column;gap:2px}.lbl{color:#f2c46d;font-weight:600;font-size:13px}
 .row{display:flex;gap:4px}figure{margin:0}figcaption{font-size:12px;color:#c5d1e3;padding:2px}
 .blocks{padding:10px 20px 22px;border-top:1px solid #1d2838}.blocks h2{margin:10px 0 6px}table{border-collapse:collapse;font-size:13px}
 th,td{padding:3px 8px;border-bottom:1px solid #243044;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{color:#9fb0c8;font-weight:600}
 .ok{color:#8fd19e}.warn{color:#f2c46d}.dim{color:#7f8da3}.small{font-size:12px;color:#9fb0c8;max-width:${W - 60}px}`;
const doc=`<!doctype html><meta charset="utf-8"><style>${css}</style><header><h1>${esc(spec.title)}</h1>${(spec.sub||[]).map(s=>`<p>${esc(s)}</p>`).join('')}</header>${html}${(spec.blocks||[]).map(b=>`<div class="blocks"><h2>${esc(b.title)}</h2>${b.html}</div>`).join('')}`;
const first=[...labs.values()][0],tmp=path.join(first.dir,'sheet.html');await fs.writeFile(tmp,doc);
const p2=await browser.newPage({viewport:{width:W,height:800}});await p2.goto('file://'+tmp);
await fs.mkdir(path.dirname(out),{recursive:true});await p2.screenshot({path:out,fullPage:true});
const errs=Object.values(pages).flatMap(p=>p.errors);if(errs.length)console.log('Ошибки страницы:',errs.slice(0,6));
await browser.close();for(const L of labs.values())await fs.rm(L.dir,{recursive:true,force:true});console.log(out);
