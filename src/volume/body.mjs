import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/* Сетка манекена атласа. Геометрию считает приложение (Mannequin.bodyData), сцена только
   раскладывает готовые точки по буферам. Координаты на входе — каталог: см, Y вниз, пол 186. */
export const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100];
const direction=p=>[p[0],-p[1],p[2]],vec=p=>new THREE.Vector3(...p);
function basis(f){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(direction(f.x)),vec(direction(f.y)),vec(direction(f.z))));}
function local(f,p){return[f.o[0]+f.x[0]*p[0]+f.y[0]*p[1]+f.z[0]*p[2],f.o[1]+f.x[1]*p[0]+f.y[1]*p[1]+f.z[1]*p[2],f.o[2]+f.x[2]*p[0]+f.y[2]*p[1]+f.z[2]*p[2]];}
function ringGrid(rows,cols){
 const g=new THREE.BufferGeometry(),idx=[];g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((rows+1)*(cols+1)*3),3));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+1,d=a+cols+1;idx.push(a,b,d,b,d+1,d);}
 g.setIndex(idx);return g;
}
function fillRing(g,rows){
 const cols=rows[0].length,p=g.attributes.position;let i=0;
 for(const row of rows)for(let c=0;c<=cols;c++)p.setXYZ(i++,...world(row[c%cols]));
 p.needsUpdate=true;g.computeVertexNormals();
 /* шов кольца: первая и последняя вершины ряда совпадают — общая нормаль, иначе вдоль шва видна грань */
 const n=g.attributes.normal,v=new THREE.Vector3(),u=new THREE.Vector3();
 for(let r=0;r<rows.length;r++){const a=r*(cols+1),b=a+cols;v.fromBufferAttribute(n,a).add(u.fromBufferAttribute(n,b));if(v.lengthSq()>1e-12){v.normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}}
 n.needsUpdate=true;g.computeBoundingSphere();g.computeBoundingBox();
}
const centroid=row=>row.reduce((a,p)=>[a[0]+p[0]/row.length,a[1]+p[1]/row.length,a[2]+p[2]/row.length],[0,0,0]);
function handGeometry(shape){
 const geos=[],cm=1/100;
 const palm=new RoundedBoxGeometry(shape.palm.size[0]*cm,shape.palm.size[1]*cm,shape.palm.size[2]*cm,2,.012);palm.translate(...shape.palm.c.map(v=>v*cm));geos.push(palm);
 for(const f of [...shape.fingers,shape.thumb]){
  const pts=f.pts.map(p=>vec(p.map(v=>v*cm)));
  const tube=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),Math.max(6,pts.length*3),f.r*cm,7,false);geos.push(tube);
  const tip=new THREE.SphereGeometry(f.r*cm,8,6);tip.translate(...f.pts.at(-1).map(v=>v*cm));geos.push(tip);
 }
 return geos;
}
export function createMannequinBody(root,first,{skin,joint,sole,mesh}){
 const B=first.body,parts={},group=new THREE.Group();group.name='mannequin';root.add(group);
 const torsoRows=B.torso.length+1;
 parts.torso={mesh:mesh(group,ringGrid(torsoRows,B.torso[0].length),skin,'torso')};
 for(const[k,rows]of Object.entries(B.limbs))parts[k]={mesh:mesh(group,ringGrid(rows.length-1,rows[0].length),skin,k)};
 parts.neck={mesh:mesh(group,ringGrid(B.neck.length-1,B.neck[0].length),skin,'neck')};
 const head=new THREE.Group();head.name='head';group.add(head);
 const skull=mesh(head,new THREE.SphereGeometry(1,24,16),skin,'skull');skull.scale.set(...B.head.radii.map(v=>v/100));
 const nose=mesh(head,new THREE.SphereGeometry(1,10,8),skin,'nose');nose.position.set(0,-.012,.094);nose.scale.set(.015,.022,.019);
 for(const s of [-1,1]){const ear=mesh(head,new THREE.SphereGeometry(1,10,8),skin,'ear');ear.position.set(s*.077,.004,.004);ear.scale.set(.009,.028,.019);}
 parts.head={mesh:head};
 for(const c of B.caps)parts['cap-'+c.key]={mesh:mesh(group,new THREE.SphereGeometry(1,16,12),skin,'cap-'+c.key)};
 const handCache=new Map();
 for(const s of ['L','R']){
  const hand=new THREE.Group();hand.name='hand'+s;group.add(hand);parts['hand'+s]={mesh:hand,key:null};
  for(const k of ['rear','toes']){const shoe=mesh(group,new RoundedBoxGeometry(1,1,1,3,k==='rear'?.22:.3),sole,'shoe-'+k+s);parts['shoe-'+k+s]={mesh:shoe};}
 }
 const dots=new THREE.Group();dots.name='joint-dots';root.add(dots);const dotMat=new THREE.MeshBasicMaterial({color:'#e2f1ff',depthTest:false});
 for(const s of ['L','R'])for(const key of ['sh','el','wr','hip','kn','an'])parts['dot'+key+s]={mesh:mesh(dots,new THREE.SphereGeometry(.021,8,6),dotMat,key+s)};
 function setHand(s,h){
  const node=parts['hand'+s];
  if(node.key!==h.key){
   node.mesh.traverse(o=>{if(o.isMesh&&!handCache.has(o.geometry.uuid))o.geometry.dispose();});node.mesh.clear();
   for(const g of handGeometry(h.shape))mesh(node.mesh,g,skin,'hand-part'+s);node.key=h.key;
  }
  node.mesh.position.fromArray(world(h.frame.o));node.mesh.quaternion.copy(basis(h.frame));
 }
 function apply(data,options){
  const B=data.body,R=data.pose;
  /* корпус закрыт «крышками» в центроидах торцов; нормали боковой поверхности считаем по продолженной трубе,
     иначе крышка заворачивает их вверх и на стыке с шеей виден тёмный шов */
  const T=B.torso,top=centroid(T.at(-1)),bottom=centroid(T[0]),ext=(a,b)=>a.map((p,i)=>[2*p[0]-b[i][0],2*p[1]-b[i][1],2*p[2]-b[i][2]]);
  const tg=parts.torso.mesh.geometry;fillRing(tg,[ext(T[0],T[1]),...T,ext(T.at(-1),T.at(-2))]);
  {const pos=tg.attributes.position,cols=T[0].length,last=(T.length+1)*(cols+1);for(let c=0;c<=cols;c++){pos.setXYZ(c,...world(bottom));pos.setXYZ(last+c,...world(top));}pos.needsUpdate=true;tg.computeBoundingSphere();tg.computeBoundingBox();}
  for(const[k,rows]of Object.entries(B.limbs))fillRing(parts[k].mesh.geometry,rows);
  fillRing(parts.neck.mesh.geometry,B.neck);
  head.position.fromArray(world(B.head.c));head.quaternion.copy(basis({x:B.head.axes[0],y:B.head.axes[1],z:B.head.axes[2]}));
  for(const c of B.caps){const m=parts['cap-'+c.key].mesh;m.position.fromArray(world(c.c));m.scale.setScalar(c.r/100);}
  for(const s of ['L','R']){
   setHand(s,B.hands[s]);
   for(const k of ['rear','toes']){
    const f=B.feet[s][k],spec=B.shoe[k],m=parts['shoe-'+k+s].mesh;
    m.position.fromArray(world(local(f,spec.c)));m.quaternion.copy(basis(f));m.scale.set(...spec.size.map(v=>v/100));
   }
   for(const key of ['sh','el','wr','hip','kn','an'])parts['dot'+key+s].mesh.position.fromArray(world(R[key+s]));
  }
  dots.visible=!!options.joints;
 }
 return{group,parts,apply,dots};
}
