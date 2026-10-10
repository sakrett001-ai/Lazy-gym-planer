import * as THREE from 'three';

/* Слой костей объёмной сцены. Геометрия костей — в локальных см своего сегмента (данные Skeleton.load()),
   в кадре каждая кость получает матрицу: каталог (см, Y вниз, пол 186) = A·локальные (Skeleton.frames),
   сцена (м, Y вверх) = C·каталог. Сетки строятся один раз при первом включении, потом только матрицы. */
const FLOOR=186;
export function createSkeletonLayer(parent){
 const group=new THREE.Group();group.name='skeleton';group.visible=false;parent.add(group);
 /* кость — тёплая слоновая кость, матовая: читается сквозь полупрозрачную кожу и на светлом, и на тёмном фоне */
 const material=new THREE.MeshStandardMaterial({color:'#ece2cb',roughness:.62,metalness:0});
 let source=null,meshes=[];
 function build(data){
  for(const m of meshes){m.geometry.dispose();group.remove(m);}
  meshes=data.bones.map(b=>{
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b.pos,3));g.setIndex(new THREE.BufferAttribute(b.idx,1));g.computeVertexNormals();
   const m=new THREE.Mesh(g,material);m.name='bone-'+b.name+(b.side||'');m.matrixAutoUpdate=false;m.castShadow=true;m.receiveShadow=false;m.frustumCulled=false;group.add(m);return m;
  });
  source=data;
 }
 function update(data,pose,body){
  if(source!==data)build(data);
  const A=globalThis.Skeleton.frames(pose,body,data.bones);
  meshes.forEach((m,i)=>{
   const o=i*12,a=k=>A[o+k];
   m.matrix.set(a(0)/100,a(1)/100,a(2)/100,a(3)/100, -a(4)/100,-a(5)/100,-a(6)/100,(FLOOR-a(7))/100, a(8)/100,a(9)/100,a(10)/100,a(11)/100, 0,0,0,1);
   m.matrixWorldNeedsUpdate=true;
  });
  group.visible=true;
 }
 function hide(){group.visible=false;}
 function dispose(){for(const m of meshes)m.geometry.dispose();material.dispose();meshes=[];source=null;}
 return{group,update,hide,dispose,get meshes(){return meshes;}};
}
