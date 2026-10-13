import * as THREE from 'three';

/* Слой мышц объёмной сцены (режим «Анатомия мышц»). Мышца — тело вдоль линии действия: путь от начала через
   промежуточные точки к прикреплению, огибающий кости (src/js/09br-muscles.js). Толщина — по объёму брюшка и длинам
   сухожилий (этап М2): при укорочении мышца утолщается; у кожи сечение сплющивается вдоль неё. Вершины тела считает
   Muscles.surface (каталог, см) — те же, что проверяет tools/muscles/check.js; здесь они переводятся в сцену (м, Y вверх).
   Все мышцы — одна сетка трубок постоянной топологии: кадр обновляет координаты, нормали и (при смене упражнения) цвета.
   Мышцы упражнения выделены цветом: основные — цветом нагрузки, вспомогательные — бледнее. */
const ARC_STEP=1.5;   /* шаг дуг огибания, см */
export const MUSCLE_REST='#b98c86';
/* последний расчёт вершин (на все сцены): данные мышц, матрицы костей кадра и вершины */
const LAST={muscles:null,only:null,frames:null,pos:null,nor:null};
const sameFrames=(a,b)=>{if(!a||!b||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
export function createMuscleLayer(parent){
 const group=new THREE.Group();group.name='muscles';group.visible=false;parent.add(group);
 /* геометрия — при первом включении: сцена строится и для миниатюр атласа, где мышц нет */
 let mesh=null,geo=null,material=null,bound=null,key=null,colored=null,start=null,owner=null,SIDES=0;
 const c=new THREE.Color();
 function build(){
  const M=globalThis.Muscles;SIDES=M.SIDES;
  start=new Uint32Array(bound.length+1);for(let i=0;i<bound.length;i++)start[i+1]=start[i]+M.ringCount(bound[i]);
  const nv=start[bound.length]*SIDES,idx=[];owner=[];
  for(let i=0;i<bound.length;i++)for(let r=start[i];r<start[i+1]-1;r++)for(let j=0;j<SIDES;j++){
   /* обход против часовой снаружи (Muscles.surface: кольцо идёт от оси к коже o к w) */
   const a=r*SIDES+j,b=r*SIDES+(j+1)%SIDES,d=a+SIDES,e=b+SIDES;idx.push(a,b,d,b,e,d);owner.push(i,i);
  }
  geo?.dispose();geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nv*3),3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nv*3),3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(nv*3),3));
  geo.setIndex(nv>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));
  if(!material)material=new THREE.MeshStandardMaterial({roughness:.55,metalness:0,vertexColors:true});
  if(mesh){group.remove(mesh);}
  mesh=new THREE.Mesh(geo,material);mesh.name='muscle-bodies';mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;group.add(mesh);
 }
 /* цвет мышцы: уровень её групп в упражнении (1 — основные, 0.38 — вспомогательные) */
 function paint(level,color){
  const col=geo.attributes.color.array;
  bound.forEach((mu,i)=>{
   const v=Math.max(0,...(mu.group||[]).map(g=>level?.[g]||0));c.set(v>=1?color(1):v>0?color(.55):MUSCLE_REST);
   for(let k=start[i]*SIDES;k<start[i+1]*SIDES;k++){col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;}
  });
  geo.attributes.color.needsUpdate=true;
 }
 function update(anatomy,frames,color){
  const M=globalThis.Muscles,k=anatomy.muscles;
  if(key!==k||bound?.skel!==anatomy.skeleton){bound=M.bind(k,anatomy.skeleton);bound.skel=anatomy.skeleton;key=k;build();colored=null;}
  if(colored!==anatomy.level||bound.color!==color){paint(anatomy.level,color);colored=anatomy.level;bound.color=color;}
  const pos=geo.attributes.position.array,nor=geo.attributes.normal.array,only=anatomy.only||null;
  /* второй вид разбора показывает ту же позу: вершины берутся из прошлого расчёта, если кости кадра те же */
  if(LAST.muscles===k&&!only&&!LAST.only&&LAST.pos?.length===pos.length&&sameFrames(LAST.frames,frames)){pos.set(LAST.pos);nor.set(LAST.nor);finish();return;}
  const paths=M.layoutDrawn(bound,frames,ARC_STEP);
  paths.forEach((path,i)=>{
   const a=start[i]*SIDES*3,z=start[i+1]*SIDES*3;
   /* только выбранные мышцы (просмотрщик, контактные листы): остальные — в точку */
   if(only&&!only.test(bound[i].name)){pos.fill(0,a,z);return;}
   M.surface(bound[i],path,frames,pos,nor,start[i]*SIDES);
   /* каталог (см, Y вниз, пол 186) → сцена (м, Y вверх): отражение по Y — у нормалей меняется знак y */
   for(let v=a;v<z;v+=3){pos[v]/=100;pos[v+1]=(186-pos[v+1])/100;pos[v+2]/=100;nor[v+1]=-nor[v+1];}
  });
  LAST.muscles=k;LAST.only=only;LAST.frames=Float32Array.from(frames);LAST.pos=Float32Array.from(pos);LAST.nor=Float32Array.from(nor);
  finish();
 }
 function finish(){geo.attributes.position.needsUpdate=true;geo.attributes.normal.needsUpdate=true;geo.boundingSphere=null;geo.boundingBox=null;group.visible=true;}
 function hide(){group.visible=false;}
 function dispose(){if(mesh)group.remove(mesh);geo?.dispose();material?.dispose();mesh=geo=material=null;bound=null;key=null;}
 /* мышца под лучом (просмотрщик для ревью): номер в данных мышц или −1 */
 function pick(raycaster){
  if(!group.visible||!mesh)return -1;geo.computeBoundingSphere();const hit=raycaster.intersectObject(mesh,false)[0];
  return hit?owner[hit.faceIndex]:-1;
 }
 return{group,update,hide,dispose,pick,get mesh(){return mesh;}};
}
