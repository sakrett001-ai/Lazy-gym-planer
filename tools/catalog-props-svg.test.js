const{test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
function svgModel(){
 const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'}),dir=path.join(__dirname,'../src/js');
 const files=fs.readdirSync(dir).filter(f=>/^\d.*\.js$/.test(f)&&parseInt(f)<11).sort();
 dom.window.eval(files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n')+'\nwindow.api={EX,buildFigure,camera3};');return dom;
}
const points=node=>{const nums=node.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number);return Array.from({length:nums.length/2},(_,i)=>[nums[i*2],nums[i*2+1]]);};
const near=(a,b,tolerance=.11)=>Math.hypot(a[0]-b[0],a[1]-b[1])<tolerance;
function checkShafts(figure,props,project,kind,half){
 const nodes=[...figure.svg.querySelectorAll(`[data-prop="${kind}"][data-part="shaft"]`)];assert.equal(nodes.length,props.length);
 for(const prop of props){
  const axis=prop.axis||[1,0,0],a=project(prop.c.map((v,k)=>v-axis[k]*half)),b=project(prop.c.map((v,k)=>v+axis[k]*half));
  assert(nodes.some(node=>near([+node.getAttribute('x1'),+node.getAttribute('y1')],a)&&near([+node.getAttribute('x2'),+node.getAttribute('y2')],b)),'drawn shaft follows the spatial grip axis');
 }
}

test('SVG neutral-grip fly shows longitudinal shafts and correctly oriented plates',()=>{
 const dom=svgModel();
 try{
  const{EX,buildFigure,camera3}=dom.window.api,ex=EX.find(e=>e.id==='dbfly');
  for(const camera of ['above','side','front']){
   const figure=buildFigure(ex.anim,{camera,t:.5,muscles:false}),props=ex.anim.catalogRig(.5).props.filter(p=>p.kind==='dumbbell');
   checkShafts(figure,props,camera3(camera),'dumbbell',12);
   if(camera==='front')for(const plate of figure.svg.querySelectorAll('[data-prop="dumbbell"][data-part="plate"]')){
    const x=points(plate).map(p=>p[0]);assert(Math.max(...x)-Math.min(...x)>11.8,'neutral plates face the front camera instead of becoming edge-on');
   }
  }
 }finally{dom.window.close();}
});

test('negative: neutral SVG shaft drawn across the body fails with unchanged rig',()=>{
 const dom=svgModel();
 try{
  const{EX,buildFigure,camera3}=dom.window.api,ex=EX.find(e=>e.id==='dbfly'),figure=buildFigure(ex.anim,{camera:'side',t:.5,muscles:false}),props=ex.anim.catalogRig(.5).props.filter(p=>p.kind==='dumbbell'),project=camera3('side');
  checkShafts(figure,props,project,'dumbbell',12);
  for(const line of figure.svg.querySelectorAll('[data-part="shaft"]'))line.setAttribute('x2',line.getAttribute('x1'));
  assert.throws(()=>checkShafts(figure,props,project,'dumbbell',12),/drawn shaft/);
 }finally{dom.window.close();}
});

test('SVG decline supports have two roller ends and a 36 cm cylinder wall',()=>{
 const dom=svgModel();
 try{
  const{EX,buildFigure,camera3}=dom.window.api,ex=EX.find(e=>e.id==='declinebb'),figure=buildFigure(ex.anim,{camera:'front',t:.5,muscles:false}),project=camera3('front'),props=ex.anim.catalogRig(.5).props.filter(p=>p.kind==='roller');
  const ends=[...figure.svg.querySelectorAll('[data-prop="roller"][data-part="end"]')],walls=[...figure.svg.querySelectorAll('[data-prop="roller"][data-part="wall"]')];
  assert(props.length>0);assert.equal(ends.length,props.length*2);assert.equal(walls.length,props.length*24);
  const centers=ends.map(node=>{const p=points(node);return[0,1].map(k=>p.reduce((sum,q)=>sum+q[k],0)/p.length);});
  for(const prop of props){
   const axis=prop.axis||[1,0,0];
   for(const offset of [-18,18])assert(centers.some(c=>near(c,project(prop.c.map((v,k)=>v+axis[k]*offset)))), 'drawn roller ends are 36 cm apart');
  }
  const wallWidth=Math.max(...walls.map(node=>{const x=points(node).map(p=>p[0]);return Math.max(...x)-Math.min(...x);}));
  assert(wallWidth>=35.9,'the support is a cylinder, not a single disc');
 }finally{dom.window.close();}
});
