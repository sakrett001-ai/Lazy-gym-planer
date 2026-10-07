const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit');
const model=loadModel(),api=model.get('({catalogVolumeData,muscleColor})');
const sceneApi=()=>import('../src/volume/scene.mjs');
const three=()=>import('three');
const dataFor=(id,t)=>api.catalogVolumeData(model.EX.find(ex=>ex.id===id).anim,t,0);

// Check drawn geometry, not an axis stored in the source descriptor.
function handShaftError(THREE,view,side,propIndex){
 const hand=view.parts['hand'+side].mesh,shaft=view.propNodes()[propIndex].group.children[0];
 const across=new THREE.Vector3(1,0,0).transformDirection(hand.matrixWorld),handle=new THREE.Vector3(0,1,0).transformDirection(shaft.matrixWorld);
 return 1-Math.abs(across.dot(handle));
}
function meshFloorViolations(THREE,view){
 const floor=view.scene.getObjectByName('floor'),bad=[];
 // Body and shoe meshes are the surfaces users see disappearing into the floor.
 for(const side of ['L','R'])for(const key of ['th','sh','kn-joint','shoe']){
  const o=view.parts[key+side].mesh,p=o.geometry.attributes.position;let min=Infinity;
  for(let i=0;i<p.count;i++)min=Math.min(min,new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).y);
  if(min<floor.position.y-.001)bad.push(key+side);
 }
 return bad;
}

test('drawn fingers follow neutral dumbbells and fixed rails throughout the repetition',async()=>{
 const THREE=await three(),{createCatalogScene}=await sceneApi();
 for(const id of ['dbfly','dip','hangknee','bbbench']){
  const view=createCatalogScene(dataFor(id,0));let count=0;
  try{for(let i=0;i<=10;i++){
   const d=dataFor(id,i/10);view.apply(d,{color:api.muscleColor});
   for(const side of ['L','R']){
    const grip=d.pose['grip'+side];
    const index=d.props.findIndex(p=>p.kind==='dumbbell'&&Math.hypot(...p.c.map((v,k)=>v-grip[k]))<.01||p.kind==='barbell'||p.kind==='line'&&p.equipmentRole==='grip'&&(!p.side||p.side===side));
    assert(index>=0,id+':'+side+' has a held shaft');count++;
    assert(handShaftError(THREE,view,side,index)<1e-6,id+':'+side+' grip must wrap the actual shaft at '+i/10);
   }
  }}finally{view.dispose();}
  assert.equal(count,22);
 }
});

test('negative: a rotated rendered hand fails grip alignment without changing the pose',async()=>{
 const THREE=await three(),{createCatalogScene}=await sceneApi(),d=dataFor('dbfly',.5),view=createCatalogScene(d);
 try{
  const index=d.props.findIndex(p=>p.kind==='dumbbell'&&p.c[0]<0);
  assert(handShaftError(THREE,view,'L',index)<1e-6);
  view.parts.handL.mesh.rotateZ(Math.PI/2);view.scene.updateMatrixWorld(true);
  assert(handShaftError(THREE,view,'L',index)>.9);
 }finally{view.dispose();}
});

test('wrist surface closes the forearm and meets the palm when the handle turns',async()=>{
 const THREE=await three(),{createCatalogScene,world}=await sceneApi();
 for(const id of ['dbfly','dbincline','dip','pecdeck']){
  const d=dataFor(id,.5),view=createCatalogScene(d);
  try{for(const side of ['L','R']){
   const joint=view.parts['wr-joint'+side].mesh,palm=view.parts['hand'+side].mesh.getObjectByName('palm'+side),wr=new THREE.Vector3(...world(d.pose['wr'+side]));
   assert(joint.worldToLocal(wr.clone()).length()<1e-7,'drawn wrist is centered on the forearm endpoint');
   const toward=palm.getWorldPosition(new THREE.Vector3()).sub(wr).normalize(),ray=new THREE.Raycaster(wr,toward),a=ray.intersectObject(joint,false)[0],b=ray.intersectObject(palm,false)[0];
   assert(a&&b,'both wrist and palm have actual intersectable surfaces');
   const vertices=palm.geometry.attributes.position;let gap=Infinity;
   for(let k=0;k<vertices.count;k++)gap=Math.min(gap,new THREE.Vector3().fromBufferAttribute(vertices,k).applyMatrix4(palm.matrixWorld).distanceTo(wr));
   assert(gap<joint.scale.x*.9,id+':'+side+' a real palm vertex must lie inside the wrist surface');
  }}finally{view.dispose();}
 }
});

test('hanging and floor-supported lower limbs stay above a stationary floor through the full cycle',async()=>{
 const THREE=await three(),{createCatalogScene}=await sceneApi();
 for(const id of ['hang','pullup','chinup','legraise','hangknee','rollout','nordic','superman','cablecrunch']){
  const view=createCatalogScene(dataFor(id,0)),floorY=view.scene.getObjectByName('floor').position.y;
  try{for(let i=0;i<=20;i++){
   view.apply(dataFor(id,i/20),{color:api.muscleColor});
   assert.equal(view.scene.getObjectByName('floor').position.y,floorY,'floor cannot follow the current pose');
   assert.deepEqual(meshFloorViolations(THREE,view),[],id+' at '+i/20);
  }}finally{view.dispose();}
 }
});

test('negative: raised opaque floor detects the leg clipping seen in phone screenshots',async()=>{
 const THREE=await three(),{createCatalogScene}=await sceneApi(),view=createCatalogScene(dataFor('hangknee',.5));
 try{
  assert.deepEqual(meshFloorViolations(THREE,view),[]);
  view.scene.getObjectByName('floor').position.y+=1.5;
  assert(meshFloorViolations(THREE,view).length>0);
 }finally{view.dispose();}
});

test('rendered shoes remain attached to the ankle, and a detached shoe fails independently',async()=>{
 const THREE=await three(),{createCatalogScene,world}=await sceneApi();
 const contains=(shoe,point)=>{
  const ray=new THREE.Raycaster(point,new THREE.Vector3(.37,.19,.73).normalize()),hits=ray.intersectObject(shoe,false);
  const unique=hits.filter((hit,i)=>i===0||Math.abs(hit.distance-hits[i-1].distance)>1e-6);
  return unique.length%2===1;
 };
 for(const id of ['declinebb','hangknee','dbincline']){
  const view=createCatalogScene(dataFor(id,0));
  try{for(let i=0;i<=10;i++){
   const d=dataFor(id,i/10);view.apply(d,{color:api.muscleColor});
   for(const side of ['L','R'])assert(contains(view.parts['shoe'+side].mesh,new THREE.Vector3(...world(d.pose['an'+side]))),id+':'+side+' shoe encloses the end of the shin');
  }
  const shoe=view.parts.shoeL.mesh,ankle=new THREE.Vector3(...world(dataFor(id,1).pose.anL));
  shoe.position.y+=.1;view.scene.updateMatrixWorld(true);
  assert.equal(contains(shoe,ankle),false,'a disconnected drawn shoe is detectable without changing the skeleton');
  }finally{view.dispose();}
 }
});
