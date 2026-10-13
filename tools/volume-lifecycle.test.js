const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const {loadModel}=require('./biomechanics-audit');
const source=fs.readFileSync(path.join(__dirname,'../src/volume/main.mjs'),'utf8').replace(/^import[^\n]*\n/gm,'').replace('export function createVolumeFigure','function createVolumeFigure');
async function runtime({available=true}={}){
 const THREE=await import('three'),{createCatalogScene,world}=await import('../src/volume/scene.mjs');
 const dom=new JSDOM('<body></body>'),w=dom.window,counters={probes:0,constructors:0,renders:0,disposals:0,losses:0};
 w.WebGL2RenderingContext=function(){};
 w.HTMLCanvasElement.prototype.getContext=function(){counters.probes++;return available?{}:null;};
 class Renderer{
  constructor({canvas}){counters.constructors++;this.domElement=canvas;}
  setPixelRatio(){} setSize(){} render(scene){counters.renders++;counters.scene=scene;} dispose(){counters.disposals++;} forceContextLoss(){counters.losses++;}
 }
 const env={window:w,document:w.document,THREE:{...THREE,WebGLRenderer:Renderer},createCatalogScene,world};
 vm.runInNewContext(source,env);
 const m=loadModel(),{catalogVolumeData,muscleColor}=m.get('({catalogVolumeData,muscleColor})');
 const options=(id='bbbench',camera='above',has)=>({label:id,camera,t:.43,trace:[],vectors:[],color:muscleColor,data:(t,index)=>catalogVolumeData(m.EX.find(ex=>ex.id===id).anim,t,index,has)});
 return{dom,w,counters,create:w.GymVolume.create,options,model:m};
}
test('unavailable WebGL2 is probed once and never constructs a failing renderer on later cameras',async()=>{
 const r=await runtime({available:false});
 try{for(const camera of ['above','side','front','back'])assert.equal(r.create(r.options('bbbench',camera)),null);assert.equal(r.counters.probes,1);assert.equal(r.counters.constructors,0);}finally{r.dom.window.close();}
});
test('drawn arrows follow the current grip, reverse on return, and disappear during holds',async()=>{
 const r=await runtime();let figure;
 try{
  const {catalogVectors,catalogVectorFrame}=r.model.get('({catalogVectors,catalogVectorFrame})'),anim=r.model.EX.find(e=>e.id==='dbincline').anim;
  const vectors=catalogVectors(anim),opts={...r.options('dbincline'),vectors,vectorFrame:catalogVectorFrame};figure=r.create(opts);figure.setVectors(true);
  const i=vectors.findIndex(v=>v.key==='gripL'),arrows=r.counters.scene.getObjectByName('movement-vectors'),arrow=arrows.children[i],THREE=await import('three');
  for(const t of [.2,.7]){
   figure.at(t,{index:0});const grip=anim.catalogRig(t).gripL,base=[grip[0]/100,(186-grip[1])/100,grip[2]/100];
   assert(arrow.position.distanceTo(new THREE.Vector3(...base))<1e-8,'arrow must start at the moving grip');
   const lowering=new THREE.Vector3(0,1,0).applyQuaternion(arrow.quaternion);assert(lowering.y<0,'first phase of incline press lowers the weight');
   figure.at(t,{index:2});const lifting=new THREE.Vector3(0,1,0).applyQuaternion(arrow.quaternion);assert(lifting.y>0,'return phase lifts the weight');assert(lowering.dot(lifting)<-.999);
  }
  for(const index of [1,3]){figure.at(.5,{index});assert(arrows.children.every(a=>!a.visible),'holds must not claim movement');}
 }finally{figure?.dispose();r.dom.window.close();}
});
test('camera rebuilds reuse full-motion bounds without losing pose or equipment distinction',async()=>{
 const r=await runtime();let first,second,third;
 try{
  let samples=0;const base=r.options(),original=base.data;const counted={...base,data:(...args)=>{samples++;return original(...args);}};
  first=r.create(counted);const firstSamples=samples;first.at(.47,{index:2});first.dispose();
  samples=0;second=r.create({...counted,camera:'side',t:.47});assert.equal(second.svg.dataset.pose,'0.47');assert(samples<=5,'a camera change must not resample the motion poses');assert(firstSamples>=13,'the first figure fits the frame over 13 motion poses');
  samples=0;const changed={...counted,data:(...args)=>{const d=counted.data(...args);return{...d,props:d.props.filter(p=>p.kind!=='barbell')};}};
  third=r.create(changed);assert(samples>=13,'changed equipment must receive its own fitted bounds');
 }finally{first?.dispose();second?.dispose();third?.dispose();r.dom.window.close();}
});
test('restored WebGL redraws a paused pose and disposal blocks later frames',async()=>{
 const r=await runtime();let figure;
 try{
  figure=r.create(r.options());figure.at(.61,{index:2});const canvas=figure.svg.querySelector('canvas'),before=r.counters.renders;
  canvas.dispatchEvent(new r.w.Event('webglcontextrestored'));assert(r.counters.renders>before);assert.equal(figure.svg.dataset.pose,'0.61');assert.equal(figure.svg.dataset.phase,'2');
  figure.dispose();const after=r.counters.renders;canvas.dispatchEvent(new r.w.Event('webglcontextrestored'));figure.at(.2,{index:0});figure.dispose();
  assert.equal(r.counters.renders,after);assert.equal(figure.svg.dataset.pose,'0.61');
  /* рендерер закрытой фигуры уходит в запас, а не теряет контекст */
  assert.equal(r.counters.disposals,0);assert.equal(r.counters.losses,0);
 }finally{figure?.dispose();r.dom.window.close();}
});
test('a closed figure lends its renderer to the next one; its materials live until the next first frame; at most three spare renderers',async()=>{
 const r=await runtime(),figures=[];
 try{
  const first=r.create(r.options('squat','above')),scene=r.counters.scene,materials=new Set();
  scene.traverse(o=>{if(o.material)for(const m of [].concat(o.material))materials.add(m);});
  let released=0;for(const m of materials)m.addEventListener('dispose',()=>released++);
  const canvas=first.svg.querySelector('canvas');first.dispose();assert.equal(released,0,'materials of a closed figure keep their programs for the next figure');
  const next=r.create(r.options('squat','side'));figures.push(next);
  assert.equal(r.counters.constructors,1,'the next figure reuses the spare renderer');
  assert.equal(next.svg.querySelector('canvas'),canvas,'the same canvas moves to the next figure');
  assert.equal(released,materials.size,'after its first frame the old materials are released');
  for(let i=0;i<4;i++)figures.push(r.create(r.options('bbbench','above')));
  assert.equal(r.counters.constructors,5);
  for(const f of figures)f.dispose();
  assert.equal(r.counters.disposals,2,'two of five renderers are dropped');assert.equal(r.counters.losses,2);
  const again=r.create(r.options('bbbench','front'));figures.push(again);assert.equal(r.counters.constructors,5,'a spare renderer is reused');
 }finally{for(const f of figures)f.dispose();r.dom.window.close();}
});
test('3D joint-stress marks appear at the loaded joints, show through the body, and can be switched off',async()=>{
 const r=await runtime();let figure;
 try{
  figure=r.create(r.options('squat','side'));const group=r.counters.scene.getObjectByName('joint-stress'),visible=()=>group.children.filter(g=>g.visible);
  figure.at(0,{index:0});assert.equal(visible().length,0,'standing tall: no marks');
  figure.at(1,{index:1});const R=r.model.EX.find(e=>e.id==='squat').anim.catalogRig(1),marks=visible();
  assert.equal(marks.length,3,'both knees and the lower back');
  const knee=[R.knL[0]/100,(186-R.knL[1])/100,R.knL[2]/100];
  assert(marks.some(g=>Math.hypot(g.position.x-knee[0],g.position.y-knee[1],g.position.z-knee[2])<1e-9),'a mark sits on the left knee');
  assert(marks.every(g=>g.children.every(o=>o.material.depthTest===false)),'marks show through the body and the bar');
  figure.setStress(false);assert.equal(visible().length,0,'switched off');
 }finally{figure?.dispose();r.dom.window.close();}
});
test('studio light: semantic colours bypass tone mapping, the body casts but never receives shadows',async()=>{
 const THREE=await import('three'),{createCatalogScene,STUDIO}=await import('../src/volume/scene.mjs');
 const m=loadModel(),{catalogVolumeData,muscleColor}=m.get('({catalogVolumeData,muscleColor})'),anim=m.EX.find(e=>e.id==='bbbench').anim;
 const view=createCatalogScene(catalogVolumeData(anim,.5,0));
 try{
  view.apply(catalogVolumeData(anim,.5,0),{color:muscleColor,muscles:true,stress:true,joints:true});
  assert.equal(view.studio({}),false,'without a real WebGL renderer the scene stays plain');
  const renderer={isWebGLRenderer:true,shadowMap:{}};assert.equal(view.studio(renderer),true);
  assert.equal(renderer.toneMapping,THREE.NeutralToneMapping);assert.equal(renderer.shadowMap.enabled,!!STUDIO.shadow);
  assert(STUDIO.exposure<1,'muted a little so lit muscles keep their colour');
  const s=view.scene,dots=s.getObjectByName('joint-dots'),stress=s.getObjectByName('joint-stress');
  dots.traverse(o=>{if(o.isMesh){assert.equal(o.material.toneMapped,false,'joint dots keep their exact colour');assert.equal(o.castShadow,false,'markers cast no shadow');}});
  view.apply(catalogVolumeData(m.EX.find(e=>e.id==='squat').anim,1,1),{color:muscleColor,muscles:true,stress:true});
  stress.traverse(o=>{if(o.isMesh)assert.equal(o.material.toneMapped,false,'red joint marks are not tone-mapped');});
  const body=s.getObjectByName('mannequin'),regions=s.getObjectByName('regions');
  for(const g of [body,regions])g.traverse(o=>{if(o.isMesh)assert.equal(o.receiveShadow,false,'no shadow falls on the body or muscle colour: '+o.name);});
  assert.equal(s.getObjectByName('floor').receiveShadow,true,'the floor shows contact shadows');
  assert(body.getObjectByName('torso').castShadow,'the body casts a shadow');
  view.setShadows(false);assert.equal(renderer.shadowMap.enabled,false,'slow graphics: shadows switch off');
 }finally{view.dispose();}
});
test('skeleton mode: bones follow the pose inside a see-through skin, phase muscle colours hide, switching off restores the body',async()=>{
 const r=await runtime();let figure;
 const zlib=require('node:zlib'),Skeleton=require('../src/js/09bq-skeleton.js');
 globalThis.Skeleton=Skeleton;
 const data=Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(__dirname,'../src/data/skeleton.bin'))));
 try{
  figure=r.create({...r.options('squat','side'),muscles:true});figure.at(1,{index:1});
  const s=r.counters.scene,layer=s.getObjectByName('skeleton'),torso=s.getObjectByName('torso'),regions=s.getObjectByName('regions');
  assert.equal(layer.visible,false,'off by default');
  assert(regions.children.some(o=>o.visible),'phase muscle colours are on');
  figure.setSkeleton(data);
  assert.equal(figure.svg.dataset.skeleton,'on');
  assert.equal(layer.visible,true);assert.equal(layer.children.length,data.bones.length);
  assert.equal(torso.material.transparent,true);assert(torso.material.opacity<.4,'skin is see-through');assert.equal(torso.material.depthWrite,false);
  assert.equal(torso.castShadow,false,'the skin does not shadow the bones');
  assert(regions.children.every(o=>!o.visible),'phase muscle colours hide while the skeleton is on');
  /* бедренная кость: начало рамки — тазобедренный сустав позы */
  const R=r.model.EX.find(e=>e.id==='squat').anim.catalogRig(1),femur=layer.getObjectByName('bone-femurL'),e=femur.matrix.elements;
  const hip=[R.hipL[0]/100,(186-R.hipL[1])/100,R.hipL[2]/100];
  assert(Math.hypot(e[12]-hip[0],e[13]-hip[1],e[14]-hip[2])<1e-6,'the femur hangs from the hip joint');
  for(const m of layer.children)assert(m.matrix.elements.every(Number.isFinite),'finite matrix: '+m.name);
  figure.setSkeleton(null);
  assert.equal(layer.visible,false);assert.equal(torso.material.transparent,false);assert.equal(torso.material.opacity,1);assert.equal(torso.castShadow,true);
  assert(regions.children.some(o=>o.visible),'muscle colours return');
 }finally{figure?.dispose();r.dom.window.close();delete globalThis.Skeleton;}
});

test('13-pose framing keeps every one of 25 poses in frame (exercises with the largest deviation)',async()=>{
 /* полная сверка 146 упражнений — 0,4 % кадра наибольший сдвиг (4.24.0); здесь — те, где он наибольший */
 const THREE=await import('three'),{createCatalogScene}=await import('../src/volume/scene.mjs'),m=require('./biomechanics-audit').loadModel(),{catalogVolumeData}=m.get('({catalogVolumeData})');
 const fit=(anim,n)=>{const data=t=>catalogVolumeData(anim,t,0,undefined),sc=createCatalogScene(data(0));for(let i=0;i<=n;i++){sc.apply(data(i/n),{color:()=>'#fff',selected:'all',muscles:true,joints:false,stress:true,skeleton:null});sc.includeBounds();}return sc.bounds;};
 const frame=b=>{const cx=(b.minX+b.maxX)/2,cy=(b.minY+b.maxY)/2;let w=(b.maxX-b.minX)*1.13,h=(b.maxY-b.minY)*1.13;if(w/h<1.15)w=h*1.15;else h=w/1.15;return{l:cx-w/2,r:cx+w/2,t:cy+h/2,b:cy-h/2,s:Math.max(w,h)};};
 const source=fs.readFileSync(path.join(__dirname,'../src/volume/main.mjs'),'utf8'),steps=+source.match(/FIT_STEPS=(\d+)/)[1];
 assert(steps>=12,'at least 13 poses');
 for(const id of ['thruster','bicycle','ohext','nordic','birddog','jumpingjack']){
  const anim=m.EX.find(e=>e.id===id).anim,all=fit(anim,24),few=fit(anim,steps);
  for(const cam of Object.keys(all)){
   const f=frame(few[cam]),b=all[cam];
   assert(b.minX>=f.l&&b.maxX<=f.r&&b.minY>=f.b&&b.maxY<=f.t,`${id} ${cam}: all 25 poses inside the ${steps+1}-pose frame`);
   const g=frame(b);assert(Math.max(Math.abs(g.l-f.l),Math.abs(g.r-f.r),Math.abs(g.t-f.t),Math.abs(g.b-f.b))/g.s<.006,`${id} ${cam}: frame shift under 0.6 %`);
  }
 }
});
