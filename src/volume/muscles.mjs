import * as THREE from 'three';
const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100];   /* каталог (см, Y вниз, пол 186) → сцена (м, Y вверх) */

/* Слой мышц объёмной сцены (режим «Анатомия мышц»). Мышца — линия действия: путь от начала через промежуточные точки
   к прикреплению, огибающий кости (Muscles.layout по матрицам костей кадра, src/js/09br-muscles.js). Рисуется отрезками
   цилиндров и шарами в изломах — по одному набору экземпляров на всю сцену, так что кадр не пересобирает геометрию.
   Мышцы упражнения выделены: основные — цветом нагрузки и толще, вспомогательные — бледнее, остальные — тонкие. */
const R_MAIN=.45,R_HELP=.36,R_REST=.24,ARC_STEP=1.5;     /* радиусы трубок, см; шаг дуг огибания, см */
export const MUSCLE_REST='#b98c86';
export function createMuscleLayer(parent){
 const group=new THREE.Group();group.name='muscles';group.visible=false;parent.add(group);
 /* геометрия и буферы — при первом включении: сцена строится и для миниатюр атласа, где мышц нет */
 let segGeo=null,ballGeo=null,material=null,segs=null,balls=null,cap=0,bound=null,key=null,colors=null,radii=null,segOwner=null,ballOwner=null;
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),d=new THREE.Vector3(),p=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();
 function alloc(n){
  if(!segGeo){segGeo=new THREE.CylinderGeometry(1,1,1,7,1,true);segGeo.translate(0,.5,0);ballGeo=new THREE.SphereGeometry(1,8,6);material=new THREE.MeshStandardMaterial({roughness:.5,metalness:0});}
  for(const o of [segs,balls])if(o){group.remove(o);o.dispose();}
  cap=Math.ceil(n*1.3);segOwner=new Uint16Array(cap);ballOwner=new Uint16Array(cap);
  segs=new THREE.InstancedMesh(segGeo,material,cap);balls=new THREE.InstancedMesh(ballGeo,material,cap);
  for(const o of [segs,balls]){o.name=o===segs?'muscle-segments':'muscle-joints';o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;o.instanceMatrix.setUsage(THREE.DynamicDrawUsage);o.count=0;group.add(o);}
 }
 /* цвет и толщина мышцы: уровень её групп в упражнении (1 — основные, 0.38 — вспомогательные) */
 function paint(level,color){
  colors=bound.map(mu=>{const v=Math.max(0,...(mu.group||[]).map(g=>level?.[g]||0));return v>=1?color(1):v>0?color(.55):MUSCLE_REST;});
  radii=bound.map(mu=>{const v=Math.max(0,...(mu.group||[]).map(g=>level?.[g]||0));return v>=1?R_MAIN:v>0?R_HELP:R_REST;});
 }
 function update(anatomy,frames,color){
  const k=anatomy.muscles;
  if(key!==k||bound?.skel!==anatomy.skeleton){bound=globalThis.Muscles.bind(k,anatomy.skeleton);bound.skel=anatomy.skeleton;key=k;colors=null;}
  if(!colors||anatomy.level!==bound.level){paint(anatomy.level,color);bound.level=anatomy.level;}
  const paths=globalThis.Muscles.layout(bound,frames,ARC_STEP);
  const n=paths.reduce((t,x)=>t+x.points.length-1,0);
  if(n>cap)alloc(Math.max(n,1600));
  let i=0,j=0;
  paths.forEach((path,mi)=>{
   const pts=path.points.map(world),r=radii[mi]/100;c.set(colors[mi]);
   for(let a=1;a<pts.length;a++){
    const A=pts[a-1],B=pts[a];d.set(B[0]-A[0],B[1]-A[1],B[2]-A[2]);const L=d.length();if(L<1e-6)continue;
    q.setFromUnitVectors(up,d.divideScalar(L));m4.compose(p.set(...A),q,s.set(r,L,r));segs.setMatrixAt(i,m4);segs.setColorAt(i,c);segOwner[i]=mi;i++;
    if(a<pts.length-1){m4.compose(p.set(...B),q.identity(),s.set(r,r,r));balls.setMatrixAt(j,m4);balls.setColorAt(j,c);ballOwner[j]=mi;j++;}
   }
  });
  segs.count=i;balls.count=j;
  for(const o of [segs,balls]){o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.boundingSphere=null;o.boundingBox=null;}
  group.visible=true;
 }
 function hide(){group.visible=false;}
 function dispose(){for(const o of [segs,balls])o?.dispose();segGeo?.dispose();ballGeo?.dispose();material?.dispose();segs=balls=null;bound=null;}
 /* мышца под лучом (просмотрщик для ревью): номер в данных мышц или −1 */
 function pick(raycaster){
  if(!group.visible||!segs)return -1;const hit=raycaster.intersectObjects([segs,balls],false)[0];
  return hit?(hit.object===segs?segOwner:ballOwner)[hit.instanceId]:-1;
 }
 return{group,update,hide,dispose,pick,get segments(){return segs;}};
}
