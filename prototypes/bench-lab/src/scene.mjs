import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CAMERAS,DIM,TORSO_RINGS,V,makePose,torsoPoint} from './model.mjs';
import {color} from './muscles.mjs';

const vec=p=>new THREE.Vector3(...p),X=[1,0,0];
function material(hex,shininess=24){return new THREE.MeshPhongMaterial({color:hex,shininess,specular:0x3d4553});}
function mesh(geometry,mat,parent,name){const m=new THREE.Mesh(geometry,mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,p,scale,mat,name){const m=mesh(new THREE.SphereGeometry(1,18,12),mat,parent,name);m.position.fromArray(p);m.scale.fromArray(scale);return m;}
function box(parent,p,size,mat,name,r=.012){const m=mesh(new RoundedBoxGeometry(...size,2,r),mat,parent,name);m.position.fromArray(p);return m;}
function beam(parent,a,b,width,mat,name){
  const m=box(parent,V.mix(a,b,.5),[width,V.distance(a,b),width],mat,name,.004);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec(V.unit(V.sub(b,a))));return m;
}
function cylinder(parent,a,b,r,mat,name){const m=mesh(new THREE.CylinderGeometry(r,r,V.distance(a,b),24),mat,parent,name);m.position.fromArray(V.mix(a,b,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec(V.unit(V.sub(b,a))));return m;}
function tube(parent,points,r,mat,name){const curve=new THREE.CatmullRomCurve3(points.map(vec));return mesh(new THREE.TubeGeometry(curve,10,r,5,false),mat,parent,name);}
function basisQuaternion(x,y,z){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(x),vec(y),vec(z)));}
function indexed(points,indices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;}
function gridGeometry(rows,cols,point,normalHint){
  const points=[],indices=[];
  for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++)points.push(point(r/rows,c/cols));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const a=r*(cols+1)+c,b=a+1,d=a+cols+1,e=d+1;
    let f=[a,b,d,b,e,d];
    if(normalHint&&V.dot(V.cross(V.sub(points[b],points[a]),V.sub(points[d],points[a])),normalHint)<0)f=[a,d,b,b,d,e];
    indices.push(...f);
  }
  return indexed(points,indices);
}
function torsoGeometry(){
  const local={hip:[0,0,0],u:[0,0,-1],n:[0,1,0]},points=[],indices=[],slices=32;
  for(const [h,w,a,b]of TORSO_RINGS)for(let j=0;j<slices;j++){
    const t=j/slices*Math.PI*2,s=Math.sin(t);points.push([w*Math.cos(t),(s>=0?a:b)*s,-h]);
  }
  for(let i=0;i<TORSO_RINGS.length-1;i++)for(let j=0;j<slices;j++){
    const a=i*slices+j,b=i*slices+(j+1)%slices,c=a+slices,d=b+slices;
    indices.push(a,c,b,b,c,d);
  }
  const g=indexed(points,indices);g.userData.local=local;return g;
}
function radiusAt(profile,t){
  for(let i=1;i<profile.length;i++)if(t<=profile[i][0]){const a=profile[i-1],b=profile[i],q=(t-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];}
  return profile.at(-1).slice(1);
}
function limbGeometry(length,profile){
  return gridGeometry(profile.length*2,18,(t,q)=>{const [a,b]=radiusAt(profile,t),theta=q*Math.PI*2;return[a*Math.cos(theta),b*Math.sin(theta),t*length];});
}
const UPPER=[[0,.054,.055],[.18,.072,.068],[.45,.068,.064],[.78,.052,.047],[1,.042,.040]];
const LOWER=[[0,.044,.044],[.22,.057,.052],[.45,.049,.047],[.76,.035,.033],[1,.026,.027]];
const THIGH=[[0,.091,.090],[.25,.088,.082],[.60,.071,.065],[1,.052,.050]];
const SHIN=[[0,.050,.050],[.27,.057,.057],[.57,.044,.040],[1,.028,.030]];
export function createScene(){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#101722');
  const skin=material('#9aaac1',20),jointMat=material('#8c9fb9',16),shorts=material('#43526d',12),sole=material('#283549',14);
  const steel=material('#425570',62),metal=material('#bbc9db',105),plate=material('#263e5c',44),pad=material('#35445c',10),rubber=material('#182536',8);
  const regionMaterials=new Map(),muscleMeshes=[],rigGroups={},allParts=[];
  const regionMaterial=id=>{if(!regionMaterials.has(id))regionMaterials.set(id,material('#a7b3c6',28));return regionMaterials.get(id);};
  const floor=mesh(new THREE.PlaneGeometry(12,12),material('#0d1622',5),scene,'floor');floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.castShadow=false;
  const gridPoints=[];for(let n=-2.5;n<=2.5;n+=.25)gridPoints.push(-2.5,-.009,n,2.5,-.009,n,n,-.009,-2.5,n,-.009,2.5);
  const floorGridGeometry=new THREE.BufferGeometry();floorGridGeometry.setAttribute('position',new THREE.Float32BufferAttribute(gridPoints,3));
  scene.add(new THREE.LineSegments(floorGridGeometry,new THREE.LineBasicMaterial({color:'#2b3a50',transparent:true,opacity:.45})));
  scene.add(new THREE.AmbientLight(0xd9e7ff,.65));
  const key=new THREE.DirectionalLight(0xf6f3ea,1.25);key.position.set(-2,5,3);key.castShadow=true;key.shadow.mapSize.set(512,512);key.shadow.camera.left=-2;key.shadow.camera.right=2;key.shadow.camera.top=2;key.shadow.camera.bottom=-2;key.shadow.bias=-.0008;key.shadow.normalBias=.012;scene.add(key);
  const rim=new THREE.DirectionalLight(0xa9c4ff,.55);rim.position.set(3,2,-4);scene.add(rim);
  const body=new THREE.Group();body.name='athlete';scene.add(body);
  mesh(torsoGeometry(),skin,body,'torso');const pelvis=sphere(body,[0,0,.015],[.139,.100,.135],shorts,'pelvis');
  const pelvisBase=pelvis.geometry.attributes.position.array.slice();
  for(const sign of [-1,1])sphere(body,[sign*.080,-.088,-.43],[.058,.012,.080],skin,'scapular-contact');
  cylinder(body,[0,0,-.48],[0,0,-.58],.050,skin,'neck');
  sphere(body,[0,0,-.665],[.088,.100,.123],skin,'head');
  sphere(body,[0,.096,-.654],[.017,.020,.033],jointMat,'nose');
  for(const sign of [-1,1])sphere(body,[sign*.087,.025,-.666],[.011,.023,.021],jointMat,'ear');
  // Each chest zone follows the same convex torso surface. Fibre strokes show direction only.
  const PEC={pec_clavicular:[.440,.483,.425,.467,.166],pec_sternal:[.346,.427,.365,.425,.164],pec_costal:[.267,.339,.317,.358,.150]};
  const local={hip:[0,0,0],u:[0,0,-1],n:[0,1,0]};
  for(const [id,[lo,hi,outLo,outHi,width]]of Object.entries(PEC))for(const sign of [-1,1]){
    const point=(r,q)=>{const h0=lo+(hi-lo)*r,h1=outLo+(outHi-outLo)*r,h=h0+(h1-h0)*q;
      const x=sign*(.009+(width-.009)*q),bulge=.004+.009*Math.sin(Math.PI*q)*Math.sin(Math.PI*r);
      return torsoPoint(local,h,x,bulge);};
    const m=mesh(gridGeometry(5,10,point,[0,1,0]),regionMaterial(id),body,`${id}-${sign}`);
    m.userData={region:id,attachment:'torso',side:sign};muscleMeshes.push(m);
    const fibre=material('#405169',12);fibre.transparent=true;fibre.opacity=.30;
    for(const r of [.18,.43,.68,.88])tube(body,Array.from({length:6},(_,i)=>{const p=point(r,.03+i*.184);return[p[0],p[1]+.0012,p[2]];}),.00065,fibre,'fibre-direction');
  }
  function limb(name,length,profile){const g=new THREE.Group();g.name=name;scene.add(g);mesh(limbGeometry(length,profile),skin,g,name+'-surface');rigGroups[name]=g;return g;}
  for(const side of ['L','R']){
    const upper=limb('upperArm'+side,DIM.upperArm,UPPER),fore=limb('forearm'+side,DIM.forearm,LOWER);
    limb('thigh'+side,DIM.thigh,THIGH);limb('shin'+side,DIM.shin,SHIN);
    for(const [region,angleLo,angleHi,start,end]of [['delt_anterior',-.75,.75,.01,.35],['triceps',1.80,2.95,.20,.83],['triceps',-2.95,-1.65,.23,.87]]){
      const m=mesh(gridGeometry(7,7,(q,r)=>{const t=start+(end-start)*q,[a,b]=radiusAt(UPPER,t),angle=angleLo+(angleHi-angleLo)*r;
        return[(a+.004)*Math.cos(angle),(b+.004)*Math.sin(angle),t*DIM.upperArm];}),regionMaterial(region),upper,region+'-'+side);
      m.material.side=THREE.DoubleSide;m.userData={region,attachment:'upperArm'+side,side};muscleMeshes.push(m);
    }
    const shoulder=sphere(scene,[0,0,0],[.064,.066,.066],skin,'shoulder'+side);
    const elbow=sphere(scene,[0,0,0],[.043,.043,.043],jointMat,'elbow'+side);
    const knee=sphere(scene,[0,0,0],[.053,.052,.053],jointMat,'knee'+side);
    rigGroups['shoulder'+side]=shoulder;rigGroups['elbow'+side]=elbow;rigGroups['knee'+side]=knee;
    const hand=new THREE.Group();hand.name='hand'+side;scene.add(hand);rigGroups['hand'+side]=hand;
    sphere(hand,[0,-.024,-.008],[.038,.036,.019],skin,'palm'+side);
    for(let f=0;f<4;f++)tube(hand,Array.from({length:9},(_,i)=>{const a=-2.0+i/8*4.65;return[(f-1.5)*.017,.020*Math.cos(a),.020*Math.sin(a)];}),.0065,skin,'finger'+side+f);
    tube(hand,[[side==='L'?.039:-.039,-.030,-.013],[side==='L'?.046:-.046,-.006,.015],[side==='L'?.026:-.026,.014,.014]],.009,skin,'thumb'+side);
    const shoe=new THREE.Group();shoe.name='shoe'+side;scene.add(shoe);rigGroups['shoe'+side]=shoe;
    box(shoe,[0,.022,.055],[.102,.044,.235],sole,'sole'+side,.014);
    sphere(shoe,[0,.064,.048],[.049,.058,.112],skin,'shoe-upper'+side);
    box(shoe,[0,.093,.009],[.063,.018,.051],sole,'shoe-strap'+side,.006);
  }
  let equipment=new THREE.Group();equipment.name='equipment';scene.add(equipment);
  const barGroup=new THREE.Group();barGroup.name='barbell';scene.add(barGroup);
  cylinder(barGroup,[-1.10,0,0],[1.10,0,0],DIM.barRadius,metal,'bar-shaft');
  for(const sign of [-1,1]){
    cylinder(barGroup,[sign*.65,0,0],[sign*1.045,0,0],.025,metal,'sleeve');
    cylinder(barGroup,[sign*.775,0,0],[sign*.825,0,0],DIM.plateRadius,plate,'plate');
    cylinder(barGroup,[sign*.83,0,0],[sign*.855,0,0],.045,metal,'collar');
    cylinder(barGroup,[sign*.76,0,0],[sign*.771,0,0],.066,metal,'plate-hub');
  }
  let variant,currentPose,currentValues={},currentOptions={};
  function rebuildEquipment(p){
    scene.remove(equipment);equipment.traverse(o=>{if(o.geometry)o.geometry.dispose();});equipment=new THREE.Group();equipment.name='equipment';scene.add(equipment);
    const b=p.equipment.bench,r=p.equipment.rack;
    const back=box(equipment,V.add(V.add(b.top,b.u,b.length/2),b.n,-b.thickness/2),[b.width,b.thickness,b.length],pad,'backrest',.018);
    back.quaternion.copy(basisQuaternion(X,b.n,b.u.map(v=>-v)));back.userData={support:'bench',top:b.top,normal:b.n};
    box(equipment,p.equipment.seat.center,p.equipment.seat.size,pad,'seat',.018);
    beam(equipment,[0,.20,-.38],[0,.20,.91],.064,steel,'bench-spine');
    for(const z of [-.35,.86]){
      box(equipment,[0,.025,z],[.49,.05,.085],steel,'bench-foot');
      for(const sign of [-1,1])box(equipment,[sign*.21,.024,z],[.10,.048,.11],rubber,'bench-rubber');
    }
    beam(equipment,[0,.065,.86],[0,.39,.50],.058,steel,'seat-leg');
    beam(equipment,[0,.065,-.35],[0,.33,.29],.058,steel,'rear-leg');
    cylinder(equipment,[-.175,.375,.35],[.175,.375,.35],.035,metal,'bench-hinge');
    const attach=V.add(V.add(b.top,b.u,.63),b.n,-.09);
    beam(equipment,[0,.22,-.29],attach,.04,steel,'backrest-support');
    for(const sign of [-1,1]){
      const x=sign*r.halfWidth;
      box(equipment,[x,.032,r.z+.02],[.10,.064,.64],steel,'rack-foot');
      box(equipment,[x,r.height/2,r.z],[.061,r.height,.061],steel,'rack-post');
      beam(equipment,[x,.13,r.z+.22],[x,.43,r.z],.045,steel,'rack-brace');
      box(equipment,[x,r.hookY-.025,r.z+.07],[.074,.035,.17],metal,'rack-hook');
      box(equipment,[x,r.hookY+.003,r.z+.15],[.074,.06,.023],rubber,'rack-lip');
      for(let y=.50;y<r.height-.08;y+=.12)sphere(equipment,[x,y,r.z+.032],[.010,.010,.002],rubber,'rack-hole');
    }
    beam(equipment,[-r.halfWidth,.16,r.z],[r.halfWidth,.16,r.z],.05,steel,'rack-crossbar');
  }
  function apply(p,values={},options={}){
    currentPose=p;currentValues=values;currentOptions=options;
    const variantChanged=p.variant!==variant;
    if(variantChanged){rebuildEquipment(p);variant=p.variant;}
    body.position.fromArray(p.hip);body.quaternion.copy(basisQuaternion(X,p.n,p.u.map(v=>-v)));
    if(variantChanged){
      // Small compression of the educational gluteal volume on the horizontal seat.
      body.updateMatrixWorld(true);pelvis.updateMatrixWorld(true);
      const attr=pelvis.geometry.attributes.position,inv=pelvis.matrixWorld.clone().invert();
      for(let i=0;i<attr.count;i++){
        const q=new THREE.Vector3(...pelvisBase.slice(i*3,i*3+3)).applyMatrix4(pelvis.matrixWorld);
        if(q.z>=.35&&q.y<.461)q.y=.461;
        q.applyMatrix4(inv);attr.setXYZ(i,q.x,q.y,q.z);
      }
      attr.needsUpdate=true;pelvis.geometry.computeVertexNormals();pelvis.geometry.computeBoundingSphere();
    }
    for(const side of ['L','R']){
      const j=p.joints;
      for(const [name,a,b,ref]of [['upperArm','shoulder','elbow',p.n],['forearm','elbow','wrist',X],['thigh','hip','knee',X],['shin','knee','ankle',X]]){
        const g=rigGroups[name+side],a0=j[a+side],b0=j[b+side],z=V.unit(V.sub(b0,a0));
        let x=V.sub(ref,z.map(v=>v*V.dot(ref,z)));if(V.len(x)<1e-7)x=V.cross(z,[0,0,1]);x=V.unit(x);const y=V.cross(z,x);
        g.position.fromArray(a0);g.quaternion.copy(basisQuaternion(x,y,z));
      }
      for(const id of ['shoulder','elbow','knee'])rigGroups[id+side].position.fromArray(j[id+side]);
      rigGroups['hand'+side].position.fromArray(j['grip'+side]);
      rigGroups['shoe'+side].position.set(j['ankle'+side][0],0,j['ankle'+side][2]);
    }
    barGroup.position.fromArray(p.bar);
    for(const [id,mat]of regionMaterials){
      const active=options.muscles!==false&&(!options.selected||options.selected==='all'||options.selected===id);
      mat.color.set(active?color(values[id]??.28):'#a7b3c6');
    }
    scene.updateMatrixWorld(true);
  }
  const cameras=Object.fromEntries(Object.entries(CAMERAS).map(([id,c])=>{
    const cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,30);cam.position.fromArray(c.eye);cam.lookAt(0,.69,.21);cam.updateMatrixWorld();return[id,cam];
  }));
  const envelopes=new Map();
  function resize(width,height){
    const ratio=width/height,saved=[currentPose,currentValues,currentOptions];
    if(!envelopes.has(variant)){
      const envelope=Object.fromEntries(Object.keys(cameras).map(id=>[id,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}]));
      // Fit actual part boxes over the complete stroke; camera stays still during playback.
      for(let i=0;i<=20;i++){
        apply(makePose(i/20,variant));
        scene.traverse(o=>{if(!o.isMesh||o.name==='floor')return;
          if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
          for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
            const point=vec([x,y,z]).applyMatrix4(o.matrixWorld);
            for(const [id,cam]of Object.entries(cameras)){
              const q=point.clone().applyMatrix4(cam.matrixWorldInverse),e=envelope[id];
              e.minX=Math.min(e.minX,q.x);e.maxX=Math.max(e.maxX,q.x);e.minY=Math.min(e.minY,q.y);e.maxY=Math.max(e.maxY,q.y);
            }
          }
        });
      }
      envelopes.set(variant,envelope);apply(...saved);
    }
    for(const [id,cam]of Object.entries(cameras)){
      const {minX,maxX,minY,maxY}=envelopes.get(variant)[id],cx=(minX+maxX)/2,cy=(minY+maxY)/2;
      let w=(maxX-minX)*1.14,h=(maxY-minY)*1.14;if(w/h<ratio)w=h*ratio;else h=w/ratio;
      cam.left=cx-w/2;cam.right=cx+w/2;cam.top=cy+h/2;cam.bottom=cy-h/2;cam.updateProjectionMatrix();
    }
  }
  apply(makePose(0));resize(900,650);
  scene.traverse(o=>{if(o.isMesh)allParts.push(o);});
  return{scene,cameras,apply,resize,muscleMeshes,rigGroups,body,barGroup,allParts,
    dispose(){const materials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});for(const mat of materials)mat.dispose();}};
}
