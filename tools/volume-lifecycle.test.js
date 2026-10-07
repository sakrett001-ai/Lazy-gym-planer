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
  samples=0;second=r.create({...counted,camera:'side',t:.47});assert.equal(second.svg.dataset.pose,'0.47');assert(samples<=5,'a camera change must not resample 25 motion poses');assert(firstSamples>=25);
  samples=0;const changed={...counted,data:(...args)=>{const d=counted.data(...args);return{...d,props:d.props.filter(p=>p.kind!=='barbell')};}};
  third=r.create(changed);assert(samples>=25,'changed equipment must receive its own fitted bounds');
 }finally{first?.dispose();second?.dispose();third?.dispose();r.dom.window.close();}
});
test('restored WebGL redraws a paused pose and disposal blocks later frames',async()=>{
 const r=await runtime();let figure;
 try{
  figure=r.create(r.options());figure.at(.61,{index:2});const canvas=figure.svg.querySelector('canvas'),before=r.counters.renders;
  canvas.dispatchEvent(new r.w.Event('webglcontextrestored'));assert(r.counters.renders>before);assert.equal(figure.svg.dataset.pose,'0.61');assert.equal(figure.svg.dataset.phase,'2');
  figure.dispose();const after=r.counters.renders;canvas.dispatchEvent(new r.w.Event('webglcontextrestored'));figure.at(.2,{index:0});figure.dispose();
  assert.equal(r.counters.renders,after);assert.equal(figure.svg.dataset.pose,'0.61');assert.equal(r.counters.disposals,1);assert.equal(r.counters.losses,1);
 }finally{figure?.dispose();r.dom.window.close();}
});
