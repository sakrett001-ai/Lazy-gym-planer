/* Лист «было / стало» для кожи Anny: те же кадры сцены приложения (свет и тон студии, вид «Манекен») из двух копий кода.
   node tools/anny-look/sheet.mjs --spec spec.json --out лист.png [--before <корень копии «было»>] [--width 1800]
   [--before-label 'БЫЛО (4.63.0)'] [--after-label 'СТАЛО']
   spec: { title, sub: [строки], rows: [{ title, note?, panels: [{ id | 'stance', t, cam, label?, focus?, span?, w?, h?, has? }] }] }
   id 'stance' — нейтральная стойка без инвентаря. focus — ключ позы (head, gripL, knL, hipL, shL, elL…) и span — ширина
   кадра, м (крупный план); иначе кадр — по всем фазам повторения, как в разборе. Каждая ячейка рисуется дважды: из копии
   «было» (--before; без неё ряд «было» не рисуется) и из этой копии («стало», кожа Anny из src/data/anny.bin), камера — одна
   и та же (рамка считается в «стало»). */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild'),{chromium}=require('playwright'),zlib=require('node:zlib');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const spec=JSON.parse(await fs.readFile(arg('--spec'),'utf8')),out=path.resolve(arg('--out','qa/anny-look/sheet.png')),before=arg('--before',null);
const W=+arg('--width','1800'),cmp=arg('--compare',null)==='lbs',beforeLabel=arg('--before-label','БЫЛО (4.61.0)'),afterLabel=arg('--after-label','СТАЛО (Anny)');
async function lab(src,name){
 const dir=path.join(path.dirname(out),'.sheet-'+process.pid+'-'+name);await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(path.join(dir,'entry.mjs'),`import * as THREE from 'three';import {createCatalogScene} from '${src}/src/volume/scene.mjs';window.THREE=THREE;window.createCatalogScene=createCatalogScene;`);
 await build({entryPoints:[path.join(dir,'entry.mjs')],outfile:path.join(dir,'lab.js'),bundle:true,format:'iife',target:['es2020'],logLevel:'error',nodePaths:[path.join(root,'node_modules')]});
 const js=(await fs.readdir(path.join(src,'src/js'))).filter(f=>/^09b[m-s].*\.js$/.test(f)&&!/^09bp/.test(f)).sort();
 const {bakeAll}=require(path.join(src,'tools/mannequin/author.js'));
 let annyData='';try{annyData=`window.ANNY_RAW='${zlib.gunzipSync(await fs.readFile(path.join(src,'src/data/anny.bin'))).toString('base64')}';`;}catch(e){}
 await fs.writeFile(path.join(dir,'data.js'),annyData);
 await fs.writeFile(path.join(dir,'index.html'),`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">${js.map(f=>`<script src="${src}/src/js/${f}"></script>`).join('')}<script src="data.js"></script><script src="lab.js"></script><script src="${path.join(here,'sheet-page.js')}"></script>`);
 return {dir,bakeAll};
}
const ids=[...new Set(spec.rows.flatMap(r=>r.panels.map(p=>p.id)).filter(id=>id!=='stance'))];
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function page(src,name){
 const L=await lab(src,name),entries=L.bakeAll({only:ids}),p=await browser.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('file://'+path.join(L.dir,'index.html'));
 return {p,entries,errors,dir:L.dir};
}
const after=await page(root,'after'),prev=before?await page(path.resolve(before),'before'):null;
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
let html='';
for(const row of spec.rows){
 const A=await after.p.evaluate(([panels,entries])=>Sheet.render(panels,entries,null),[row.panels,after.entries]);
 /* --compare lbs: второй ряд — та же кожа Anny линейным смешением (выбор способа скиннинга) */
 const B=prev?await prev.p.evaluate(([panels,entries,cams])=>Sheet.render(panels,entries,cams),[row.panels,prev.entries,A.map(a=>a.cam)])
  :cmp?await after.p.evaluate(([panels,entries,cams])=>Sheet.render(panels,entries,cams,'lbs'),[row.panels,after.entries,A.map(a=>a.cam)]):null;
 html+=`<section><h2>${esc(row.title)}</h2>${row.note?`<p class="note">${esc(row.note)}</p>`:''}`;
 const fig=(u,p,tag)=>`<figure><img src="${u}" width="${p.w||300}" height="${p.h||360}"><figcaption><b>${tag}</b> ${esc(p.label||`${p.id} · t=${p.t} · ${p.cam}`)}</figcaption></figure>`;
 if(B){html+=`<div class="pair"><div class="lbl">${cmp?'ЛИНЕЙНОЕ СМЕШЕНИЕ':esc(beforeLabel)}</div><div class="row">${B.map((b,i)=>fig(b.url,row.panels[i],'')).join('')}</div></div>`;}
 html+=`<div class="pair"><div class="lbl">${cmp?'ДВОЙНЫЕ КВАТЕРНИОНЫ':esc(afterLabel)}</div><div class="row">${A.map((a,i)=>fig(a.url,row.panels[i],'')).join('')}</div></div></section>`;
}
const css=`body{margin:0;background:#0b1018;color:#dfe7f3;font:14px/1.35 system-ui,sans-serif;width:${W}px}header{padding:16px 20px 4px}h1{margin:0;font-size:22px}
 header p{margin:3px 0;color:#a9b6c9}section{padding:6px 20px 8px;border-top:1px solid #1d2838}h2{font-size:16px;margin:6px 0 4px}.note{margin:0 0 6px;color:#a9b6c9}
 .pair{display:flex;align-items:flex-start;gap:8px;margin:4px 0}.lbl{writing-mode:vertical-rl;transform:rotate(180deg);color:#9fb0c8;font-weight:600;font-size:13px;padding:4px}
 .row{display:flex;gap:6px;flex-wrap:wrap}figure{margin:0}figcaption{font-size:12px;color:#c5d1e3;padding:2px}`;
const doc=`<!doctype html><meta charset="utf-8"><style>${css}</style><header><h1>${esc(spec.title)}</h1>${(spec.sub||[]).map(s=>`<p>${esc(s)}</p>`).join('')}</header>${html}`;
const tmp=path.join(after.dir,'sheet.html');await fs.writeFile(tmp,doc);
const p2=await browser.newPage({viewport:{width:W,height:800}});await p2.goto('file://'+tmp);
await fs.mkdir(path.dirname(out),{recursive:true});await p2.screenshot({path:out,fullPage:true});
const errs=[...after.errors,...(prev?.errors||[])];if(errs.length)console.log('Ошибки страницы:',errs.slice(0,6));
await browser.close();for(const d of [after.dir,prev?.dir].filter(Boolean))await fs.rm(d,{recursive:true,force:true});console.log(out);
