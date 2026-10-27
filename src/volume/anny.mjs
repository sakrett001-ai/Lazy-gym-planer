import * as THREE from 'three';

/* Слой кожи Anny (вид «Манекен», только внешний вид; данные и рамки — src/js/09bs-anny.js, AnnySkin). Сетка — в стойке
   манекена, в координатах каталога (см, Y вниз, пол 186): сцена (м, Y вверх) = C·каталог — матрица объекта C (отражение по Y,
   поэтому обход треугольников развёрнут: лицевые стороны и нормали те же, что у процедурной кожи). Скиннинг — на видеокарте:
   двойные кватернионы рамок сегментов кадра (uniform-массив, по два vec4 на рамку), четыре веса на вершину; корректирующие
   формы — морфы three.js (до скиннинга). Кожа прижата к полу (вершины ниже пола — на полу; почему — AnnySkin.skin). Мышечные зоны — цвет вершины (sRGB, альфа — доля зоны): та же раскраска, что у
   областей манекена (цвет по фазам, выбранная область), с тем же собственным свечением. Материал — материал кожи манекена.
   Рамка кадра и тени: сетка в стойке, поэтому её габарит в кадре — по точкам выборки вершин, скиннингом на процессоре
   (userData.boundsPoints: их берёт сцена для рамки камер и для тени). */
const FLOOR=186,BOUNDS_STEP=37;
/* Внешний вид кожи (только свет и цвет; форма и проверки — в данных anny.bin):
   ao — затенённость впадин (запечена в стойке, AnnySkin.data.shade — доля открытого неба): [для рассеянного света неба,
        для прямого]; рассеянный — как карта затенения three.js (aoMap), прямой — слабее (впадины глубже, но тень
        ключевого света на теле не рисуется: тело тень не принимает, иначе она перекрывает цвет мышц);
   relief — контраст формы: нормали «с нерезкой маской» (нормаль + relief·(нормаль − сглаженная по relief[1] кольцам)):
        граница грудной, пресс, дельты читаются при той же геометрии и том же матовом материале;
   roughness — шероховатость материала Anny (у манекена 0,62): матовее, без пластикового блика;
   trunks — тон плавок (вариант Б): цвет и доля смешения; 0 — без плавок (вариант А). Граница — линия плавок-брифов
        (trunkLine), ровная: в шейдере по расстоянию до неё со сглаживанием в пиксель (fwidth).
   Переопределение для листов сравнения — globalThis.ANNY_LOOK (те же ключи). */
export const ANNY_LOOK={ao:[.85,.35],relief:[.6,6],roughness:.72,trunks:{color:'#7b889e',alpha:1}};
const look=()=>({...ANNY_LOOK,...(globalThis.ANNY_LOOK||{})});
/* Линия плавок-брифов в стойке (см над полом, x — влево, z — вперёд; тазобедренные суставы — 89,5 над полом, ±8,8):
   пояс — 96,5 спереди, 97,5 сбоку, 98,5 сзади (≈ 8 см ниже пупка: у ANSUR II пупок — 105,5); вырез ноги — по углу a вокруг
   оси бедра (0 — спереди, +90° — снаружи, −90° — внутри, у промежности): h = 85 + 1,5·cos a + 8·sin a — у промежности 77
   (купол плавок закрыт), спереди 86,5, снаружи 93 (высокий вырез брифов), сзади 83,5 (ягодичная складка). Возвращает
   знаковое расстояние по высоте, см: плюс — внутри плавок. */
export function trunkLine(x,h,z){
 const phi=Math.atan2(x,z),top=97.5-Math.cos(phi);
 const s=x>=0?1:-1,a=Math.atan2((x-8.8*s)*s,z),leg=85+1.5*Math.cos(a)+8*Math.sin(a);
 return Math.min(top-h,h-leg);
}
const TRUNK_FRAMES=new Set(['pelvis','lumbar','thorax','thL','thR']);
/* нормали «с нерезкой маской»: n + k·(n − n̄), n̄ — нормали, усреднённые по соседям rings раз */
function reliefNormals(g,idx,nv,k,rings){
 if(!(k>0))return;
 const n=g.attributes.normal.array,adj=Array.from({length:nv},()=>new Set());
 for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2];adj[a].add(b).add(c);adj[b].add(a).add(c);adj[c].add(a).add(b);}
 let s=Float32Array.from(n);
 for(let r=0;r<rings;r++){const o=new Float32Array(s.length);for(let v=0;v<nv;v++){let x=s[v*3],y=s[v*3+1],z=s[v*3+2];for(const u of adj[v]){x+=s[u*3];y+=s[u*3+1];z+=s[u*3+2];}const l=Math.hypot(x,y,z)||1;o[v*3]=x/l;o[v*3+1]=y/l;o[v*3+2]=z/l;}s=o;}
 for(let v=0;v<nv;v++){const x=n[v*3]+k*(n[v*3]-s[v*3]),y=n[v*3+1]+k*(n[v*3+1]-s[v*3+1]),z=n[v*3+2]+k*(n[v*3+2]-s[v*3+2]),l=Math.hypot(x,y,z)||1;n[v*3]=x/l;n[v*3+1]=y/l;n[v*3+2]=z/l;}
 g.attributes.normal.needsUpdate=true;
}
const DQ_PARS=`
uniform vec4 annyDQ[ANNY_FRAMES*2];
#define ANNY_FLOOR ${FLOOR.toFixed(1)}
attribute vec4 annyIndex;
attribute vec4 annyWeight;
void annyBlend(out vec4 r,out vec4 d){
 ivec4 ix=ivec4(annyIndex+.5);
 vec4 r0=annyDQ[ix.x*2];r=vec4(0.);d=vec4(0.);
 for(int k=0;k<4;k++){
  float w=annyWeight[k];if(w<=0.)continue;
  int i=ix[k];vec4 qr=annyDQ[i*2],qd=annyDQ[i*2+1];
  if(dot(qr,r0)<0.)w=-w;
  r+=w*qr;d+=w*qd;
 }
 float l=length(r);r/=l;d/=l;
}
vec3 annyRotate(vec4 q,vec3 p){return p+2.*cross(q.xyz,cross(q.xyz,p)+q.w*p);}
vec3 annyMove(vec4 r,vec4 d,vec3 p){return annyRotate(r,p)+2.*(r.w*d.xyz-d.w*r.xyz+cross(r.xyz,d.xyz));}
#ifdef ANNY_LBS
/* линейное смешение тех же преобразований (только для сравнения на листах: globalThis.ANNY_METHOD = 'lbs') */
vec3 annyLinear(vec3 p,bool dir){
 ivec4 ix=ivec4(annyIndex+.5);vec3 o=vec3(0.);
 for(int k=0;k<4;k++){float w=annyWeight[k];if(w<=0.)continue;int i=ix[k];vec4 r=annyDQ[i*2],d=annyDQ[i*2+1];o+=w*(dir?annyRotate(r,p):annyMove(r,d,p));}
 return o;
}
#endif
`;
const COLOR_PARS='attribute vec4 annyColor;\nvarying vec4 vAnnyColor;\nattribute vec2 annyLook;\nvarying vec2 vAnnyLook;\n',COLOR_OUT='\nvAnnyColor=annyColor;vAnnyLook=annyLook;';
function patch(shader,frames,{normals=true,color=false}={}){
 if(globalThis.ANNY_METHOD==='lbs'){
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n#define ANNY_LBS\n#define ANNY_FRAMES '+frames+'\n'+DQ_PARS+(color?COLOR_PARS:''));
  if(normals)shader.vertexShader=shader.vertexShader.replace('#include <skinnormal_vertex>','objectNormal=normalize(annyLinear(objectNormal,true));');
  shader.vertexShader=shader.vertexShader.replace('#include <skinning_vertex>','transformed=annyLinear(transformed,false);transformed.y=min(transformed.y,ANNY_FLOOR);'+(color?COLOR_OUT:''));
  return;
 }
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n#define ANNY_FRAMES '+frames+'\n'+DQ_PARS+(color?COLOR_PARS:''));
 if(normals)shader.vertexShader=shader.vertexShader.replace('#include <skinnormal_vertex>','vec4 annyR,annyD;annyBlend(annyR,annyD);objectNormal=annyRotate(annyR,objectNormal);\n#ifdef USE_TANGENT\nobjectTangent=annyRotate(annyR,objectTangent);\n#endif');
 shader.vertexShader=shader.vertexShader.replace('#include <skinning_vertex>',(normals?'':'vec4 annyR,annyD;annyBlend(annyR,annyD);\n')+'transformed=annyMove(annyR,annyD,transformed);transformed.y=min(transformed.y,ANNY_FLOOR);'+(color?COLOR_OUT:''));
}
export function createAnnyLayer(parent,skin){
 const group=new THREE.Group();group.name='anny';group.visible=false;parent.add(group);
 let source=null,mesh=null,material=null,depth=null,uniforms=null,colorAttr=null,lastColors='',boundsIdx=null;
 const glow={value:.28};
 function build(d){
  dispose();
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(d.pos,3));
  /* каталог — зеркальная система: обход треугольников разворачиваем, нормали считаем в ней же */
  const idx=new Uint16Array(d.idx.length);for(let i=0;i<idx.length;i+=3){idx[i]=d.idx[i];idx[i+1]=d.idx[i+2];idx[i+2]=d.idx[i+1];}
  g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  const L=look();reliefNormals(g,idx,d.nv,L.relief?.[0]??0,L.relief?.[1]??6);
  g.setAttribute('annyIndex',new THREE.BufferAttribute(Float32Array.from(d.wi),4));
  g.setAttribute('annyWeight',new THREE.BufferAttribute(d.ww,4));
  colorAttr=new THREE.BufferAttribute(new Uint8Array(d.nv*4),4,true);colorAttr.setUsage(THREE.DynamicDrawUsage);g.setAttribute('annyColor',colorAttr);
  /* вид вершины: затенённость впадин (доля открытого неба) и расстояние до линии плавок (см, плюс — внутри; только таз и
     бёдра — кисти и предплечья у бёдер в стойке не красятся) */
  const lk=new Float32Array(d.nv*2);
  for(let v=0;v<d.nv;v++){const f=d.frames[d.wi[v*4]];lk[v*2]=d.shade?d.shade[v]:1;lk[v*2+1]=TRUNK_FRAMES.has(f)?Math.max(-8,Math.min(8,trunkLine(d.pos[v*3],FLOOR-d.pos[v*3+1],d.pos[v*3+2]))):-8;}
  g.setAttribute('annyLook',new THREE.BufferAttribute(lk,2));
  if(d.correctives.length){
   g.morphAttributes.position=d.correctives.map(c=>{const a=new Float32Array(d.nv*3);for(let j=0;j<c.n;j++){const v=c.i[j];a[v*3]=c.d[j*3];a[v*3+1]=c.d[j*3+1];a[v*3+2]=c.d[j*3+2];}return new THREE.BufferAttribute(a,3);});
   g.morphTargetsRelative=true;
  }
  /* габарит задаём сами (по точкам кадра): сетка в стойке, без него отсечение по пирамиде видимости ошибётся */
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e3);g.boundingBox=new THREE.Box3(new THREE.Vector3(-1e3,-1e3,-1e3),new THREE.Vector3(1e3,1e3,1e3));
  uniforms={annyDQ:{value:new Float32Array(d.frames.length*8)}};
  /* сетка замкнута, лицевая сторона — снаружи: изнанка не рисуется (у материала манекена — обе стороны: у процедурной
     кожи открытые края). Иначе в прорези век видна изнанка их внутренней стороны, и её перевёрнутую нормаль ярко
     освещает контровой свет — «белые глаза»; заодно вдвое меньше работы фрагментам. */
  material=skin.clone();material.name='anny-skin';material.side=THREE.FrontSide;material.roughness=L.roughness??skin.roughness;
  const tc=new THREE.Color(L.trunks?.color||'#000'),ta=L.trunks?.alpha||0;
  uniforms.annyAO={value:new THREE.Vector2(L.ao?.[0]??0,L.ao?.[1]??0)};uniforms.annyTrunk={value:new THREE.Vector4(tc.r,tc.g,tc.b,ta)};
  material.onBeforeCompile=s=>{
   s.uniforms.annyDQ=uniforms.annyDQ;s.uniforms.annyGlow=glow;s.uniforms.annyAO=uniforms.annyAO;s.uniforms.annyTrunk=uniforms.annyTrunk;patch(s,d.frames.length,{color:true});
   s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vAnnyColor;\nvarying vec2 vAnnyLook;\nuniform float annyGlow;\nuniform vec2 annyAO;\nuniform vec4 annyTrunk;\nvec3 annyLinear(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c));}')
    /* плавки — под цветом мышц: активная зона закрашивает и их */
    .replace('#include <color_fragment>','#include <color_fragment>\nfloat annyFw=max(fwidth(vAnnyLook.y)*.75,1e-3);diffuseColor.rgb=mix(diffuseColor.rgb,annyTrunk.rgb,smoothstep(-annyFw,annyFw,vAnnyLook.y)*annyTrunk.a);\nvec3 annyZone=annyLinear(vAnnyColor.rgb);diffuseColor.rgb=mix(diffuseColor.rgb,annyZone,vAnnyColor.a);')
    .replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectDiffuse*=mix(1.,vAnnyLook.x,annyAO.x);float annyDir=mix(1.,vAnnyLook.x,annyAO.y);reflectedLight.directDiffuse*=annyDir;reflectedLight.directSpecular*=annyDir;')
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=annyZone*annyGlow*vAnnyColor.a;');
  };
  material.customProgramCacheKey=()=>'anny-skin-'+d.frames.length+(globalThis.ANNY_METHOD||'');
  /* тень: та же деформация в материале глубины */
  depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
  depth.onBeforeCompile=s=>{s.uniforms.annyDQ=uniforms.annyDQ;patch(s,d.frames.length,{normals:false});};
  depth.customProgramCacheKey=()=>'anny-depth-'+d.frames.length+(globalThis.ANNY_METHOD||'');
  mesh=new THREE.Mesh(g,material);mesh.name='anny-skin';mesh.customDepthMaterial=depth;mesh.castShadow=true;mesh.receiveShadow=false;mesh.frustumCulled=false;
  mesh.matrixAutoUpdate=false;mesh.matrix.set(.01,0,0,0, 0,-.01,0,FLOOR/100, 0,0,.01,0, 0,0,0,1);
  if(d.correctives.length)mesh.morphTargetInfluences=new Array(d.correctives.length).fill(0);
  group.add(mesh);source=d;lastColors='';
  boundsIdx=[];for(let v=0;v<d.nv;v+=BOUNDS_STEP)boundsIdx.push(v);
 }
 /* кадр: data — данные кадра сцены (поза), look — цвета зон: {on, color, values, sideValues, regions, selected} */
 function update(d,data,look){
  if(source!==d)build(d);
  const A=globalThis.AnnySkin,R=data.pose,S=A.skinMats(R,d),cw=A.correctiveWeights(R,d);
  uniforms.annyDQ.value.set(A.dualQuats(S,d.frames.length));
  if(mesh.morphTargetInfluences)cw.forEach((w,i)=>{mesh.morphTargetInfluences[i]=w;});
  paint(d,look);
  /* точки рамки — каталог → сцена */
  const P=A.skin(R,{d,only:boundsIdx,corr:cw}),pts=[];for(let k=0;k<boundsIdx.length;k++)pts.push(new THREE.Vector3(P[k*3]/100,(FLOOR-P[k*3+1])/100,P[k*3+2]/100));
  mesh.userData.boundsPoints=pts;
  group.visible=true;return mesh;
 }
 /* цвет зон: тот же, что у областей манекена в scene.mjs (активная — цвет нагрузки, иначе — цвет кожи) */
 function paint(d,look){
  const reg=look?.on?globalThis.AnnySkin.regions(d):null,ids=reg?reg.ids:[];
  const tint=[];let key='';
  for(const id of ids)for(const side of ['L','R']){
   const r=look.regions?.[id],vis=!!r?.visible,active=vis&&(!look.selected||look.selected==='all'||look.selected===id||look.selected===r.parent);
   const c=active?look.color(look.sideValues?.[side]?.[id]??look.values?.[id]??.28):null;tint.push(c);key+=(c||'-')+'|';
  }
  if(key===lastColors)return;lastColors=key;
  /* в атрибуте — sRGB (8 бит без полос в тенях), в шейдере — в линейные, как у цвета материала областей манекена */
  const col=new THREE.Color(),s={},rgba=tint.map(c=>{if(!c)return[0,0,0,0];col.set(c).getRGB(s,THREE.SRGBColorSpace);return[Math.round(s.r*255),Math.round(s.g*255),Math.round(s.b*255),255];});
  const a=colorAttr.array;a.fill(0);
  if(reg)for(let v=0;v<d.nv;v++){const r=reg.rid[v];if(!r)continue;const q=rgba[(r-1)*2+d.region.side[v]];if(!q[3])continue;a[v*4]=q[0];a[v*4+1]=q[1];a[v*4+2]=q[2];a[v*4+3]=255;}
  colorAttr.needsUpdate=true;
 }
 function hide(){group.visible=false;}
 function dispose(){if(mesh){mesh.geometry.dispose();group.remove(mesh);}material?.dispose();depth?.dispose();mesh=material=depth=null;source=null;}
 return{group,update,hide,dispose,setGlow(v){glow.value=v;},get mesh(){return mesh;}};
}
