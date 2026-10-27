/* Время кадра вида «Манекен» в браузере (как замер слоя мышц, tools/muscles/README.md): Chromium, окно 390 px, фигура разбора
   (createMotionFigure приложения) в ракурсе «три четверти», 10 упражнений × кадры × прогоны, медиана по кадрам, медиана по
   прогонам, медиана по упражнениям. Части кадра — крючками панели замера (src/js/19-perf-panel.js: GymPerf.volume): поза
   (данные кадра), сцена (scene.apply: кожа — процедурная или Anny с её матрицами, рамка кадра, области мышц), отрисовка
   (renderer.render: вызовы WebGL), и отдельно — растр (чтение пикселя после кадра ждёт конца отрисовки). Видеокарта — программная (SwiftShader): отрисовка — растр на процессоре, её время велико и только для
   сравнения «было/стало» (число треугольников и работа вершинного шейдера), на телефоне её делает видеокарта.
   Кадры — через 0,21 с: иначе фигура по темпу кадров (main.mjs, watchPace) переходит в облегчённый режим (без теней), и
   прогоны с ним и без него несравнимы.
   node tools/anny-look/bench.mjs --dist <папка dist сборки> [--anny on|off] [--ids a,b] [--frames 31] [--runs 3] [--throttle 1]
   --anny off — в сборке с кожей Anny: её данные не грузятся (прежняя процедурная кожа той же сборки). */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {chromium}=require('playwright');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const dist=path.resolve(arg('--dist',path.join(root,'dist'))),anny=arg('--anny','on'),F=+arg('--frames','31'),runs=+arg('--runs','3'),throttle=+arg('--throttle','1');
const ids=arg('--ids','latpull,bbbench,ohp,pullup,bbrow,pushup,crunch,bicycle,deadlift,squat').split(',');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.bin':'application/octet-stream','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.join(dist,p);if(!f.startsWith(dist)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await ctx.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/index.html`);
await page.waitForFunction(()=>window.GymVolume&&typeof createMotionFigure==='function',null,{timeout:30000});
const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
const res=await page.evaluate(async([ids,F,runs,anny])=>{
 const A=window.AnnySkin;
 if(A){if(anny==='on')await A.load();else A.load=()=>new Promise(()=>{});}
 /* крючки: части кадра текущей фигуры (как GymPerf.volume панели замера) */
 /* рендерер фигур переходит к следующей (запас) — обёртка одна: иначе время отрисовки считалось бы столько раз, сколько фигур */
 let cur=null;const wrap=(obj,name,kind)=>{const orig=obj&&obj[name];if(typeof orig!=='function'||orig.benchWrapped)return;const w=obj[name]=function(...a){const t=performance.now();try{return orig.apply(this,a);}finally{if(cur)cur[kind]+=performance.now()-t;}};w.benchWrapped=true;};
 globalThis.GymPerf={volume({scene,renderer,options}){wrap(options,'data','pose');wrap(scene,'apply','scene');wrap(renderer,'render','render');},svg(){},card(){},thumb(){},add(){}};
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};
 const host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:390px;height:340px;z-index:99999';document.body.append(host);
 const out={};
 for(const id of ids){
  const ex=EX.find(e=>e.id===id);if(!ex)continue;
  const f=createMotionFigure(ex.anim,{has:()=>true,ratio:1.15,t:0,label:id,camera:'angle',muscles:true});host.append(f.svg);
  await sleep(300);
  for(let k=0;k<F;k++){f.at(k/(F-1),{index:0});await sleep(210);}   /* разогрев: программы шейдеров, данные Anny */
  const gl=f.svg.querySelector('canvas')?.getContext('webgl2'),px=new Uint8Array(4);
  const R={frame:[],pose:[],scene:[],render:[],raster:[]};
  for(let r=0;r<runs;r++){
   const a={frame:[],pose:[],scene:[],render:[],raster:[]};
   for(let k=0;k<F;k++){cur={pose:0,scene:0,render:0};const t0=performance.now();f.at(k/(F-1),{index:0});const t1=performance.now();gl?.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t2=performance.now();a.frame.push(t1-t0);a.raster.push(t2-t1);for(const key of ['pose','scene','render'])a[key].push(cur[key]);cur=null;await sleep(210);}
   for(const key of Object.keys(R))R[key].push(med(a[key]));
  }
  out[id]={...Object.fromEntries(Object.entries(R).map(([k,v])=>[k,med(v)])),runs:R.frame,anny:!!(A&&A.data),quality:f.svg.dataset.quality||'normal'};
  f.dispose();host.innerHTML='';
 }
 return out;
},[ids,F,runs,anny]);
if(errors.length)console.log('Ошибки страницы:',errors.slice(0,5));
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};
const f2=x=>x.toFixed(2);
for(const[id,r]of Object.entries(res))console.log(`${id.padEnd(9)} кадр ${f2(r.frame)} мс: поза ${f2(r.pose)}, сцена ${f2(r.scene)}, отрисовка ${f2(r.render)}; растр ${f2(r.raster)} (прогоны ${r.runs.map(f2).join(' ')}; ${r.quality})${r.anny?' — кожа Anny':''}`);
const all=Object.values(res);
console.log(`медиана по упражнениям ×${throttle}: кадр ${f2(med(all.map(r=>r.frame)))} мс, поза ${f2(med(all.map(r=>r.pose)))}, сцена ${f2(med(all.map(r=>r.scene)))}, отрисовка ${f2(med(all.map(r=>r.render)))}; растр SwiftShader ${f2(med(all.map(r=>r.raster)))}`);
if(arg('--json'))fs.writeFileSync(arg('--json'),JSON.stringify(res,null,1));
await browser.close();server.close();
