const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit');
const model=loadModel(),api=model.get('({catalogVolumeData,muscleColor})');
test('negative: a rendered wrist or palm offset is detected with unchanged skeleton data',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnScene}=await import('./catalog-render-audit.mjs');
 const ex=model.EX.find(e=>e.id==='kbswing'),d=api.catalogVolumeData(ex.anim,.5,0),v=createCatalogScene(d);
 try{assert.deepEqual(checkDrawnScene(v,d,{cameras:false}),[]);v.parts.handL.mesh.getObjectByName('palmL').position.y+=.10;v.scene.updateMatrixWorld(true);assert(checkDrawnScene(v,d,{cameras:false}).includes('drawn-palm:L'));}finally{v.dispose();}
});
test('negative: changed rendered limb geometry and moved equipment fail independently',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnScene}=await import('./catalog-render-audit.mjs');
 const ex=model.EX.find(e=>e.id==='bbbench'),d=api.catalogVolumeData(ex.anim,.5,0),v=createCatalogScene(d);
 try{const a=v.parts.uaL.mesh.geometry.attributes.position;for(let i=170;i<186;i++)a.setX(i,a.getX(i)+.1);v.propNodes()[0].group.children[0].position.y+=.1;v.scene.updateMatrixWorld(true);const r=checkDrawnScene(v,d,{cameras:false});assert(r.some(r=>r.startsWith('drawn-bone:uaL')));assert(r.some(r=>r.startsWith('drawn-prop:0')));}finally{v.dispose();}
});
test('negative: a camera cropping actual geometry fails the same envelope audit',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnScene}=await import('./catalog-render-audit.mjs');
 const ex=model.EX.find(e=>e.id==='bbbench'),d=api.catalogVolumeData(ex.anim,.5,0),v=createCatalogScene(d);
 try{v.includeBounds();v.resize(360,300);assert.deepEqual(checkDrawnScene(v,d),[]);v.cameras.above.left*=.1;v.cameras.above.right*=.1;v.cameras.above.updateProjectionMatrix();assert(checkDrawnScene(v,d).some(r=>r.startsWith('crop:above')));}finally{v.dispose();}
});
test('negative: moving a real pad breaks body surface contact, with unchanged joint data',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnSupports}=await import('./catalog-render-audit.mjs');
 for(const id of ['bbbench','dbfly','inclinebb','chestrowdb']){
  const ex=model.EX.find(e=>e.id===id),d=api.catalogVolumeData(ex.anim,.5,0),v=createCatalogScene(d);
  try{assert.deepEqual(checkDrawnSupports(v,d),[],id);const i=d.props.findIndex(p=>p.tone==='pad');v.propNodes()[i].group.children[0].position.y-=.10;v.scene.updateMatrixWorld(true);assert(checkDrawnSupports(v,d).length,id);}finally{v.dispose();}
 }
});
test('negative: muscle patches displaced off the drawn skin cannot pass',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnScene}=await import('./catalog-render-audit.mjs');
 const ex=model.EX.find(e=>e.id==='squat'),d=api.catalogVolumeData(ex.anim,.5,0),v=createCatalogScene(d);
 try{assert.deepEqual(checkDrawnScene(v,d,{cameras:false}),[]);v.regionMeshes.get('quad_lateral:L').position.x-=.2;v.scene.updateMatrixWorld(true);assert(checkDrawnScene(v,d,{cameras:false}).includes('drawn-region-skin:quad_lateral:L'));}finally{v.dispose();}
});
test('turning arms keep the full clipped region geometry through the whole repetition',async()=>{
 const{createCatalogScene}=await import('../src/volume/scene.mjs'),{checkDrawnScene}=await import('./catalog-render-audit.mjs');
 for(const id of ['dbfly','ohp','cablelat']){
  const ex=model.EX.find(e=>e.id===id),v=createCatalogScene(api.catalogVolumeData(ex.anim,0,0));
  try{for(let i=0;i<=20;i++){const d=api.catalogVolumeData(ex.anim,i/20,0);v.apply(d,{color:api.muscleColor,muscles:true});assert.deepEqual(checkDrawnScene(v,d,{cameras:false}),[],id+':'+i);}}finally{v.dispose();}
 }
});
