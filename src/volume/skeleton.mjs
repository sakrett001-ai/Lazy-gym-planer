import * as THREE from 'three';

/* Слой костей объёмной сцены. Геометрия костей — в локальных см своего сегмента (данные Skeleton.load()),
   в кадре каждая кость получает матрицу: каталог (см, Y вниз, пол 186) = A·локальные (Skeleton.frames),
   сцена (м, Y вверх) = C·каталог.
   Все кости — одна сетка (до 4.72.0 — сетка на кость: 111 вызовов отрисовки и столько же в проходе тени). Каждая вершина
   помнит номер своей кости (атрибут skelBone), кость — жёсткое тело со своей матрицей: матрицы кадра — в текстуре
   (на кость строка из 6 пикселей RGBA: 3 строки аффинной матрицы «локальные → сцена» и 3 строки матрицы нормалей —
   обратной транспонированной, как normalMatrix у прежней сетки на кость), вершинный шейдер переводит вершину и нормаль
   в сцену сам. Свет, тени, цвет, порядок треугольников и рамка кадра — те же: у всех костей определитель матрицы сцены
   положителен (рамки каталога левые, C зеркалит Y), поэтому лицевая сторона не меняется (tools/skeleton.test.js).
   Сетка строится один раз при первом включении, потом только матрицы. */
const FLOOR=186,ROW=6;
const BONE_DECL=`attribute float skelBone;
uniform highp sampler2D skelBones;`;
/* матрицы кости — в начале main: их берут и нормаль (beginnormal_vertex), и вершина (begin_vertex) */
const BONE_FETCH=`void main() {
 int skelRow=int(skelBone+.5);
 vec4 skelA0=texelFetch(skelBones,ivec2(0,skelRow),0),skelA1=texelFetch(skelBones,ivec2(1,skelRow),0),skelA2=texelFetch(skelBones,ivec2(2,skelRow),0);`;
const BONE_NORMAL=`#include <beginnormal_vertex>
 {vec3 skelN0=texelFetch(skelBones,ivec2(3,skelRow),0).xyz,skelN1=texelFetch(skelBones,ivec2(4,skelRow),0).xyz,skelN2=texelFetch(skelBones,ivec2(5,skelRow),0).xyz;
  objectNormal=vec3(dot(skelN0,objectNormal),dot(skelN1,objectNormal),dot(skelN2,objectNormal));}`;
const BONE_VERTEX=`#include <begin_vertex>
 transformed=vec3(dot(skelA0.xyz,transformed)+skelA0.w,dot(skelA1.xyz,transformed)+skelA1.w,dot(skelA2.xyz,transformed)+skelA2.w);`;
function boneShader(material,texture,key){
 material.onBeforeCompile=s=>{
  s.uniforms.skelBones={value:texture};
  s.vertexShader=BONE_DECL+'\n'+s.vertexShader.replace('void main() {',BONE_FETCH).replace('#include <beginnormal_vertex>',BONE_NORMAL).replace('#include <begin_vertex>',BONE_VERTEX);
 };
 material.customProgramCacheKey=()=>key;
 return material;
}
/* одна сетка из костей: вершины и нормали — в локальных см кости (нормали — как у прежней сетки на кость), номер кости
   у каждой вершины; углы рамки каждой кости (локальные) — для рамки кадра и тени */
function mergeBones(bones){
 let vertices=0,indices=0;for(const b of bones){vertices+=b.pos.length/3;indices+=b.idx.length;}
 const pos=new Float32Array(vertices*3),nor=new Float32Array(vertices*3),bone=new Uint16Array(vertices),idx=vertices>65535?new Uint32Array(indices):new Uint16Array(indices),boxes=[];
 let base=0,k=0;
 bones.forEach((b,i)=>{
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b.pos,3));g.setIndex(new THREE.BufferAttribute(b.idx,1));g.computeVertexNormals();g.computeBoundingBox();
  pos.set(b.pos,base*3);nor.set(g.attributes.normal.array,base*3);bone.fill(i,base,base+b.pos.length/3);
  for(let j=0;j<b.idx.length;j++)idx[k++]=b.idx[j]+base;
  const{min,max}=g.boundingBox;boxes.push([min.x,min.y,min.z,max.x,max.y,max.z]);
  base+=b.pos.length/3;g.dispose();
 });
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('skelBone',new THREE.BufferAttribute(bone,1));g.setIndex(new THREE.BufferAttribute(idx,1));
 return{geometry:g,boxes};
}
export function createSkeletonLayer(parent){
 const group=new THREE.Group();group.name='skeleton';group.visible=false;parent.add(group);
 /* кость — тёплая слоновая кость, матовая: читается сквозь полупрозрачную кожу и на светлом, и на тёмном фоне */
 let texture=null,material=null,depth=null,mesh=null,source=null,names=[],boxes=[],matrices=null,corners=null;
 function build(data){
  dropMesh();
  const n=data.bones.length;
  texture=new THREE.DataTexture(new Float32Array(ROW*4*n),ROW,n,THREE.RGBAFormat,THREE.FloatType);
  texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.name='skeleton-bones';
  material=boneShader(new THREE.MeshStandardMaterial({color:'#ece2cb',roughness:.62,metalness:0}),texture,'skeleton-bones');material.name='skeleton-bones';
  /* тень: тот же перевод вершин (проход тени берёт этот материал вместо общего MeshDepthMaterial с упаковкой RGBA) */
  depth=boneShader(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}),texture,'skeleton-bones-depth');depth.name='skeleton-bones-depth';
  const merged=mergeBones(data.bones);boxes=merged.boxes;names=data.bones.map(b=>b.name+(b.side||''));
  mesh=new THREE.Mesh(merged.geometry,material);mesh.name='bones';mesh.matrixAutoUpdate=false;mesh.castShadow=true;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.customDepthMaterial=depth;
  /* рамка кадра и тени (scene.mjs: includeBounds, fitShadow) — по углам рамки каждой кости в её матрице, как у прежней сетки на кость */
  Object.defineProperty(mesh.userData,'boundsPoints',{get:boneCorners,enumerable:false,configurable:true});
  group.add(mesh);
  matrices=new Float32Array(n*12);corners=null;source=data;
 }
 function boneCorners(){
  if(corners)return corners;corners=[];
  boxes.forEach((b,i)=>{const o=i*12;for(const x of [b[0],b[3]])for(const y of [b[1],b[4]])for(const z of [b[2],b[5]])
   corners.push(new THREE.Vector3(matrices[o]*x+matrices[o+1]*y+matrices[o+2]*z+matrices[o+3],matrices[o+4]*x+matrices[o+5]*y+matrices[o+6]*z+matrices[o+7],matrices[o+8]*x+matrices[o+9]*y+matrices[o+10]*z+matrices[o+11]));});
  return corners;
 }
 /* A — матрицы костей кадра (Skeleton.frames), если уже посчитаны (их же берёт слой мышц) */
 function update(data,pose,body,A=globalThis.Skeleton.frames(pose,body,data.bones)){
  if(source!==data)build(data);
  const T=texture.image.data,n=names.length;
  for(let i=0;i<n;i++){
   const o=i*12,M=matrices;
   /* сцена = C·каталог: см → м, Y вниз → вверх от пола */
   M[o]=A[o]/100;M[o+1]=A[o+1]/100;M[o+2]=A[o+2]/100;M[o+3]=A[o+3]/100;
   M[o+4]=-A[o+4]/100;M[o+5]=-A[o+5]/100;M[o+6]=-A[o+6]/100;M[o+7]=(FLOOR-A[o+7])/100;
   M[o+8]=A[o+8]/100;M[o+9]=A[o+9]/100;M[o+10]=A[o+10]/100;M[o+11]=A[o+11]/100;
   const t=i*ROW*4;T.set(M.subarray(o,o+12),t);
   /* матрица нормалей — обратная транспонированная линейной части: (L⁻¹)ᵀ = cof(L)/det(L) */
   const a=M[o],b=M[o+1],c=M[o+2],d=M[o+4],e=M[o+5],f=M[o+6],g=M[o+8],h=M[o+9],k=M[o+10];
   const c00=e*k-f*h,c01=f*g-d*k,c02=d*h-e*g,det=a*c00+b*c01+c*c02,s=det?1/det:0;
   T[t+12]=c00*s;T[t+13]=c01*s;T[t+14]=c02*s;T[t+15]=0;
   T[t+16]=(c*h-b*k)*s;T[t+17]=(a*k-c*g)*s;T[t+18]=(b*g-a*h)*s;T[t+19]=0;
   T[t+20]=(b*f-c*e)*s;T[t+21]=(c*d-a*f)*s;T[t+22]=(a*e-b*d)*s;T[t+23]=0;
  }
  texture.needsUpdate=true;corners=null;group.visible=true;
 }
 function hide(){group.visible=false;}
 function dropMesh(){if(mesh){mesh.geometry.dispose();group.remove(mesh);}texture?.dispose();material?.dispose();depth?.dispose();mesh=texture=material=depth=null;}
 function dispose(){dropMesh();source=null;names=[];boxes=[];matrices=null;corners=null;}
 /* сцена закрыта (scene.disposeGeometry): текстура матриц освобождается вместе с геометрией, материалы — позже, вместе с
    остальными (их собранные программы шейдеров берёт следующая фигура на этом рендерере, main.mjs) */
 function disposeTexture(){texture?.dispose();}
 /* матрица кости в сцене (4×4, по столбцам — как Object3D.matrix) — для проверок; null — нет такой кости или слой не построен */
 function matrixOf(name){
  const i=names.indexOf(name);if(i<0||!matrices)return null;const o=i*12,M=matrices;
  return new THREE.Matrix4().set(M[o],M[o+1],M[o+2],M[o+3],M[o+4],M[o+5],M[o+6],M[o+7],M[o+8],M[o+9],M[o+10],M[o+11],0,0,0,1);
 }
 const api={group,update,hide,dispose,disposeTexture,matrixOf,get names(){return names.slice();},get meshes(){return mesh?[mesh]:[];},get material(){return material;}};
 /* проверки находят слой по сцене (getObjectByName('skeleton')) */
 group.userData.layer=api;
 return api;
}
