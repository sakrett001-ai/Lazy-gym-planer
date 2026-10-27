/* Время кадра вида «Манекен» в браузере (как замер слоя мышц, tools/muscles/README.md): Chromium, окно 390 px, фигура разбора
   (createMotionFigure приложения) в ракурсе «три четверти», 10 упражнений × 61 кадр × прогоны, медиана по кадрам, медиана по
   прогонам, медиана по упражнениям.
   node tools/anny-look/bench.mjs --dist <папка dist сборки> [--anny on|off] [--ids a,b] [--frames 61] [--runs 3] [--throttle 1]
   Кадр — f.at(t): данные кадра (поза, кожа или её поверхности, области мышц), сцена и отрисовка (вызов WebGL); «с растром» —
   то же и gl.finish() (программная видеокарта SwiftShader: растр на процессоре, для сравнения числа треугольников и вызовов).
   --anny off — в сборке с кожей Anny: её данные не грузятся (прежняя процедурная кожа той же сборки). */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {chromium}=require('playwright');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const dist=path.resolve(arg('--dist',path.join(root,'dist'))),anny=arg('--anny','on'),F=+arg('--frames','61'),runs=+arg('--runs','3'),throttle=+arg('--throttle','1');
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
 const host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:390px;height:340px;z-index:99999';document.body.append(host);
 const out={};
 for(const id of ids){
  const ex=EX.find(e=>e.id===id);if(!ex)continue;
  const f=createMotionFigure(ex.anim,{has:()=>true,ratio:1.15,t:0,label:id,camera:'angle',muscles:true});host.append(f.svg);
  const canvas=f.svg.querySelector('canvas'),gl=canvas&&(canvas.getContext('webgl2'));
  for(let k=0;k<F;k++)f.at(k/(F-1),{index:0});            /* разогрев: память рамок, программы шейдеров */
  const cpu=[],full=[];
  for(let r=0;r<runs;r++){
   const a=[],b=[];
   for(let k=0;k<F;k++){const t0=performance.now();f.at(k/(F-1),{index:0});const t1=performance.now();gl?.finish();const t2=performance.now();a.push(t1-t0);b.push(t2-t0);}
   a.sort((x,y)=>x-y);b.sort((x,y)=>x-y);cpu.push(a[a.length>>1]);full.push(b[b.length>>1]);
  }
  cpu.sort((x,y)=>x-y);full.sort((x,y)=>x-y);
  out[id]={cpu:cpu[cpu.length>>1],full:full[full.length>>1],runs:cpu,anny:!!(A&&A.data),renderer:f.svg.dataset.renderer};
  f.dispose();host.innerHTML='';
 }
 return out;
},[ids,F,runs,anny]);
if(errors.length)console.log('Ошибки страницы:',errors.slice(0,5));
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};
for(const[id,r]of Object.entries(res))console.log(`${id.padEnd(9)} кадр ${r.cpu.toFixed(2)} мс, с растром ${r.full.toFixed(2)} мс (прогоны ${r.runs.map(x=>x.toFixed(2)).join(' ')})${r.anny?' — кожа Anny':''}`);
console.log(`медиана по упражнениям ×${throttle}: кадр ${med(Object.values(res).map(r=>r.cpu)).toFixed(2)} мс, с растром ${med(Object.values(res).map(r=>r.full)).toFixed(2)} мс`);
await browser.close();server.close();
