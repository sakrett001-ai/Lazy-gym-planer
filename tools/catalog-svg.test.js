const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
function svgModel(){
 const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'});
 const dir=path.join(__dirname,'../src/js'),files=fs.readdirSync(dir).filter(f=>/^\d.*\.js$/.test(f)&&parseInt(f)<11).sort();
 dom.window.eval(files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n')+'\nwindow.api={EX,buildFigure,muscleColor};');
 return dom;
}

test('SVG fallback preserves the working and supporting sides through both phases',()=>{
 const dom=svgModel();
 try{
  const {EX,buildFigure,muscleColor}=dom.window.api;
  for(const[id,region,camera,active]of [['dbrow','bi_long','front','L'],['archer','tri_long','above','R']]){
   const ex=EX.find(e=>e.id===id),figure=buildFigure(ex.anim,{camera,t:.5,muscles:true}),support=active==='L'?'R':'L';
   const colors=side=>[...figure.svg.querySelectorAll(`[data-muscle="${region}"][data-side="${side}"]`)].map(n=>n.getAttribute('fill'));
   const activeColors=[];
   for(const index of [0,2]){
    figure.at(.5,{index});const a=colors(active),b=colors(support);
    assert(a.length&&b.length,id+' exposes both sides in the fallback');
    assert(b.every(v=>v===muscleColor(.28)),id+' supporting side retains its illustrative support profile');
    assert(a.every(v=>v!==b[0]),id+' working side is distinct');activeColors.push(a[0]);
   }
   assert.notEqual(activeColors[0],activeColors[1],id+' working side changes between lifting and lowering');
  }
 }finally{dom.window.close();}
});

test('SVG limb skin encloses its highlighted regions; a narrowed rendered limb fails',()=>{
 const dom=svgModel();
 try{
  const {EX,buildFigure}=dom.window.api,ex=EX.find(e=>e.id==='goblet'),figure=buildFigure(ex.anim,{camera:'front',t:.7,muscles:true});
  const bounds=node=>{const nums=node.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number),x=nums.filter((_,i)=>i%2===0);return[Math.min(...x),Math.max(...x)];};
  const check=()=>{
   for(const side of ['L','R']){
    for(const kind of ['ua','fa','th','sh'])assert(figure.svg.querySelector(`[data-limb="${kind+side}"]`),'each catalog limb uses the shared surface profile');
    const [lo,hi]=bounds(figure.svg.querySelector(`[data-limb="th${side}"]`));
    const zones=[...figure.svg.querySelectorAll(`[data-side="${side}"][data-muscle^="quad_"]`)];assert(zones.length);
    for(const node of zones){const [a,b]=bounds(node);assert(a>=lo-.3&&b<=hi+.3,'muscle contour must remain inside the thigh skin');}
   }
  };
  check();
  const skin=figure.svg.querySelector('[data-limb="thL"]'),center=ex.anim.catalogRig(.7).hipL[0];let index=0;
  skin.setAttribute('d',skin.getAttribute('d').replace(/-?\d*\.?\d+/g,v=>String(index++%2?Number(v):center+(Number(v)-center)*.75)));
  assert.throws(check,/muscle contour/);
 }finally{dom.window.close();}
});
