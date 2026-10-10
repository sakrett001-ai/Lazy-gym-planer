const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const expectedVersion=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const sw=fs.readFileSync(path.join(root,'dist/sw.js'),'utf8'),shell=require('node:vm').runInNewContext(sw+'\nSHELL;',{self:{registration:{scope:'https://test.invalid/'},addEventListener(){}}}),cached=new Set(shell.map(p=>new URL(p,'https://test.invalid/').href));
for(const lang of ['ru','en']){
 console.log(`Checking packaged ${lang}…`);
 const dir=path.join(root,'dist',lang==='ru'?'':'en'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));vc.on('error',(...a)=>errors.push(a.map(String).join(' ')));
 const dom=new JSDOM(html,{url:'https://sakrett001-ai.github.io/Lazy-gym-planer/atlas-preview/'+(lang==='en'?'en/':''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window,d=w.document;
 const base='https://test.invalid/'+(lang==='en'?'en/':'');
 for(const node of d.querySelectorAll('script[src],link[rel=stylesheet],link[rel=manifest],link[rel=icon],link[rel=apple-touch-icon]'))assert(cached.has(new URL(node.getAttribute('src')||node.getAttribute('href'),base).href),'Offline shell misses a rendered asset');
 w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.eval(fs.readFileSync(path.join(root,'dist/volume.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(dir,'app.js'),'utf8')+'\nwindow.qaCatalog={EX,openMotionItem,previewItem,closeMotion,motionPrefs,getMotion:()=>detailMotion,startWorkout,closeWorkout,getWorkout:()=>workout};');
 const q=w.qaCatalog;assert.equal(q.EX.length,144);assert.equal(d.querySelectorAll('#mv-exercise option').length,144);
 console.log('  Application booted');
 q.openMotionItem(q.previewItem('bbbench'));assert(d.querySelector('#mv-stage .volume-figure svg path'));assert.equal(d.querySelector('#mv-stage .volume-figure').dataset.camera,'above');
 const slider=d.getElementById('mv-progress');slider.value='470';slider.dispatchEvent(new w.Event('input'));const clock=q.getMotion().clock,pose=d.querySelector('#mv-stage .volume-figure').dataset.pose;
 d.querySelector('#mv-cameras [data-motion-camera=side]').click();assert.equal(q.getMotion().clock,clock);assert.equal(d.querySelector('#mv-stage .volume-figure').dataset.pose,pose);
 const dual=d.getElementById('mv-dual');dual.checked=true;dual.dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('#mv-projections .volume-figure').length,2);assert.equal(q.getMotion().clock,clock);
 console.log('  Main and second views rendered');
 const region=d.getElementById('mv-region'),before=d.querySelector('#mv-stage svg').outerHTML;region.value='pec_clavicular';region.dispatchEvent(new w.Event('change'));assert.equal(q.motionPrefs.regions.bbbench,'pec_clavicular');assert.notEqual(d.querySelector('#mv-stage svg').outerHTML,before);assert.equal(q.getMotion().clock,clock);
 const muscles=d.getElementById('mv-muscle-toggle');muscles.checked=false;muscles.dispatchEvent(new w.Event('change'));assert.equal(d.getElementById('mv-muscle-panel').hidden,true);muscles.checked=true;muscles.dispatchEvent(new w.Event('change'));
 dual.checked=false;dual.dispatchEvent(new w.Event('change'));
 const exercise=d.getElementById('mv-exercise');for(const id of ['kbswing','dbfly','dbrow','chestrowdb','cablelat']){exercise.value=id;exercise.dispatchEvent(new w.Event('change'));assert(d.querySelector('#mv-stage .volume-figure svg path'),id);assert.equal(d.querySelectorAll('#mv-cameras button').length,5);assert.equal(d.getElementById('mv-muscle-toggle').disabled,false);console.log('  Switched '+id);}
 q.closeMotion();q.startWorkout();assert.equal(d.getElementById('wv-cameras').hidden,false);assert.equal(d.querySelectorAll('#wv-cameras button').length,5);assert(d.querySelector('#wv-stage .volume-figure svg path'));q.closeWorkout();
 assert.deepEqual(errors,[]);dom.window.close();console.log(`Packaged ${lang}: atlas, actual SVG fallback, camera phase, two views, region highlight, toggles and workout verified.`);
}
for(const lang of ['ru','en']){
 const html=fs.readFileSync(path.join(root,`dist/lazy-gym-planner-offline-${lang}.html`),'utf8'),dom=new JSDOM(html,{url:'file:///lazy-gym-planner.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 assert.equal(d.querySelectorAll('script[src],link[rel=stylesheet]').length,0);
 w.eval([...d.querySelectorAll('script')].map(s=>s.textContent).join('\n')+'\nwindow.qaCatalog={EX,openMotionItem,previewItem,closeMotion};');
 assert.equal(w.PODHOD_VERSION,expectedVersion);w.qaCatalog.openMotionItem(w.qaCatalog.previewItem('bbbench'));assert(d.querySelector('#mv-stage svg path'));assert.equal(d.querySelectorAll('#mv-cameras button').length,5);w.qaCatalog.closeMotion();dom.window.close();console.log(`Standalone ${lang}: embedded renderer and atlas verified without network resources.`);
}
