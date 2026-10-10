/* Манекен атласа: пропорции, суставы, прямая и обратная кинематика.
   Один источник геометрии тела для отрисовки, мышечных зон, авторинга поз и валидатора.

   Внутренние координаты: сантиметры, Y вверх, пол Y=0, правая тройка.
   Тело в нейтральной позе смотрит вдоль +Z, левая сторона тела — +X.
   Наружу (для сцены и проверок) поза отдаётся в координатах каталога:
   см, ось Y вниз, пол y=186; направления — тем же отражением по Y.

   Источники:
   - длины сегментов между центрами суставов — de Leva P. Adjustments to Zatsiorsky–Seluyanov's
     segment inertia parameters. J Biomech 1996;29:1223–1230 (мужчины, рост 174,1 см → 175 см);
   - высоты ориентиров — Winter DA. Biomechanics and Motor Control of Human Movement, 4th ed., 2009, рис. 4.1;
   - обхваты и ширины — сводные средние ANSUR II (US Army, 2012), мужчины;
   - массы и центры масс сегментов — de Leva 1996;
   - пределы суставов — Soucie JM et al. Haemophilia 2011 (CDC Joint ROM), AAOS (Greene & Heckman 1994). */
const Mannequin=(()=>{
'use strict';
const D2R=Math.PI/180,R2D=180/Math.PI,FLOOR=186;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const V={
 add:(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],
 sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 scale:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 len:a=>Math.hypot(a[0],a[1],a[2]),
 dist:(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),
 unit:a=>{const l=Math.hypot(a[0],a[1],a[2]);return l<1e-12?[0,0,0]:[a[0]/l,a[1]/l,a[2]/l];},
 mix:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
 perp:(v,axis)=>{const d=v[0]*axis[0]+v[1]*axis[1]+v[2]*axis[2];return[v[0]-axis[0]*d,v[1]-axis[1]*d,v[2]-axis[2]*d];},
 angle:(a,b)=>{const la=Math.hypot(...a),lb=Math.hypot(...b);if(la<1e-12||lb<1e-12)return 0;return Math.acos(clamp((a[0]*b[0]+a[1]*b[1]+a[2]*b[2])/la/lb,-1,1))*R2D;}
};
/* 3×3, построчно: [r00,r01,r02, r10,…]. Столбцы — оси локальной системы в мире. */
const M3={
 I:()=>[1,0,0,0,1,0,0,0,1],
 mul:(A,B)=>{const o=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)o[i*3+j]=A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j];return o;},
 v:(A,p)=>[A[0]*p[0]+A[1]*p[1]+A[2]*p[2],A[3]*p[0]+A[4]*p[1]+A[5]*p[2],A[6]*p[0]+A[7]*p[1]+A[8]*p[2]],
 T:A=>[A[0],A[3],A[6],A[1],A[4],A[7],A[2],A[5],A[8]],
 col:(A,i)=>[A[i],A[3+i],A[6+i]],
 cols:(x,y,z)=>[x[0],y[0],z[0],x[1],y[1],z[1],x[2],y[2],z[2]],
 rx:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[1,0,0,0,c,-s,0,s,c];},
 ry:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[c,0,s,0,1,0,-s,0,c];},
 rz:d=>{const c=Math.cos(d*D2R),s=Math.sin(d*D2R);return[c,-s,0,s,c,0,0,0,1];},
 axis:(k,rad)=>{const l=Math.hypot(...k);if(l<1e-12||Math.abs(rad)<1e-12)return M3.I();const x=k[0]/l,y=k[1]/l,z=k[2]/l,c=Math.cos(rad),s=Math.sin(rad),t=1-c;
  return[t*x*x+c,t*x*y-s*z,t*x*z+s*y,t*x*y+s*z,t*y*y+c,t*y*z-s*x,t*x*z-s*y,t*y*z+s*x,t*z*z+c];},
 /* ортонормирование по двум осям: y — главная, z — уточняется */
 frameYZ:(y,zHint)=>{y=V.unit(y);let z=V.perp(zHint,y);if(V.len(z)<1e-9)z=V.perp(Math.abs(y[2])<.9?[0,0,1]:[1,0,0],y);z=V.unit(z);return M3.cols(V.cross(y,z),y,z);}
};
const Q={
 fromM3:m=>{const t=m[0]+m[4]+m[8];let w,x,y,z;
  if(t>0){const s=Math.sqrt(t+1)*2;w=.25*s;x=(m[7]-m[5])/s;y=(m[2]-m[6])/s;z=(m[3]-m[1])/s;}
  else if(m[0]>m[4]&&m[0]>m[8]){const s=Math.sqrt(1+m[0]-m[4]-m[8])*2;w=(m[7]-m[5])/s;x=.25*s;y=(m[1]+m[3])/s;z=(m[2]+m[6])/s;}
  else if(m[4]>m[8]){const s=Math.sqrt(1+m[4]-m[0]-m[8])*2;w=(m[2]-m[6])/s;x=(m[1]+m[3])/s;y=.25*s;z=(m[5]+m[7])/s;}
  else{const s=Math.sqrt(1+m[8]-m[0]-m[4])*2;w=(m[3]-m[1])/s;x=(m[2]+m[6])/s;y=(m[5]+m[7])/s;z=.25*s;}
  return Q.norm([w,x,y,z]);},
 toM3:q=>{const[w,x,y,z]=Q.norm(q);return[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y),2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x),2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)];},
 norm:q=>{const l=Math.hypot(...q)||1;return q.map(v=>v/l);},
 slerp:(a,b,t)=>{let d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];if(d<0){b=b.map(v=>-v);d=-d;}
  if(d>.9995)return Q.norm(a.map((v,i)=>v+(b[i]-v)*t));const th=Math.acos(d),s=Math.sin(th),wa=Math.sin((1-t)*th)/s,wb=Math.sin(t*th)/s;return a.map((v,i)=>v*wa+b[i]*wb);}
};
/* углы: Rx(α)·Rz(β)·Ry(γ) и Ry(α)·Rz(a)·Rx(b) */
function eulerXZY(M){return[Math.atan2(M[7],M[4])*R2D,Math.asin(clamp(-M[1],-1,1))*R2D,Math.atan2(M[2],M[0])*R2D];}
function eulerYZX(M){return[Math.atan2(-M[6],M[0])*R2D,Math.asin(clamp(M[3],-1,1))*R2D,Math.atan2(-M[5],M[4])*R2D];}
/* поворот «размах»: ось в плоскости XZ, вектор в градусах; затем «закрутка» вокруг Y */
function swing(vx,vz){const a=Math.hypot(vx,vz);return a<1e-9?M3.I():M3.axis([vx,0,vz],a*D2R);}
function swingTwist(M){
 const y=M3.col(M,1),ang=Math.acos(clamp(y[1],-1,1)),k=[y[2],0,-y[0]],l=Math.hypot(k[0],k[2]);
 const sv=l<1e-9?[0,0]:[k[0]/l*ang*R2D,k[2]/l*ang*R2D],S=swing(sv[0],sv[1]),Tw=M3.mul(M3.T(S),M);
 return{vx:sv[0],vz:sv[1],twist:Math.atan2(Tw[2],Tw[0])*R2D,elevation:ang*R2D};
}

/* ---------- Антропометрия: мужчина 175 см, 78 кг; высота голеностопа 8,5 см (как в кроссовках с подошвой 2 см) ---------- */
const B={
 stature:175,mass:78,
 ua:28.3,fa:27.0,th:42.4,sk:43.6,               // плечо, предплечье, бедро, голень — между центрами суставов
 hipHalf:8.8,                                    // центры тазобедренных суставов ±8,8 см
 lumbar:[0,10,0],thoracic:[0,14,0],              // поясничный и грудопоясничный «шарниры» по оси корпуса
 c7:[0,33,-4],headJoint:[0,10.5,3.5],headCenter:[0,4,2],
 sc:[2,23.5,4],ghRel:[16,-1.9,-4],               // грудино-ключичный шарнир и центр плечевого сустава от него
 head:[7.9,11.4,9.8],                            // полуоси головы: ширина, высота, глубина
 grip:[2.6,-8.0,0],knuckle:[0,-9.8,0],           // центр хвата: 8 см дистальнее и 2,6 см ладоннее запястья
 palm:{width:8.4,thick:3.0,len:10.2},finger:8.6,
 ankle:8.5,heel:-6.5,ball:[0,-6.5,13.5],toe:[0,-0.6,7.2],toeSole:-2.0, // опорные точки стопы от центра голеностопа (форма — FOOT_SECTIONS)
 sole:{heelW:6.0,ballM:4.6,ballL:4.3,ballLZ:10.8,hallux:[2.8,5.0],toe5:[-4.0,2.4]} // опора подошвы: ширина пятки, головки 1-й и 5-й плюсневых, подушечки пальцев
};
B.hipHeight=B.sk+B.th+B.ankle;                   // 94,5 см от пола до центров тазобедренных суставов
/* Сечения корпуса: h — высота над серединой тазобедренных суставов вдоль оси корпуса;
   w — полуширина, a — до передней поверхности, b — до задней. */
const TORSO=[[-9,12.5,4.5,8.5],[-4,15.8,7.2,12.2],[0,16.8,8.6,11.8],[6,16.4,10.0,10.4],[12,15.0,10.4,9.6],[18,14.6,10.4,9.6],[24,15.1,10.6,10.0],
 [31,16.1,12.0,10.6],[38,16.7,12.4,11.0],[44,16.0,11.0,11.0],[49,13.8,7.8,10.2],[53,10.0,4.6,8.6],[56,6.6,3.2,7.0]];
const TORSO_JOINTS=[10,24];
/* Профили конечностей: [t, спереди, сзади, латерально, медиально], см */
const LIMBS={
 ua:[[0,5.4,5.6,6.0,4.8],[.15,5.3,5.6,5.8,4.6],[.45,5.3,5.2,5.2,4.6],[.8,4.3,4.4,4.3,4.0],[1,3.7,4.0,4.0,3.9]],
 fa:[[0,4.0,4.2,4.6,4.3],[.2,4.6,4.3,5.0,4.6],[.55,3.6,3.3,3.9,3.6],[.85,2.5,2.3,3.1,2.8],[1,2.1,2.1,3.0,2.7]],
 th:[[0,8.8,10.0,10.4,8.0],[.12,9.2,9.6,9.0,8.4],[.4,8.4,8.4,7.8,7.8],[.75,7.0,6.5,6.4,6.6],[.92,5.8,5.5,5.4,5.6],[1,5.8,5.4,5.2,5.4]],
 sk:[[0,5.2,5.0,5.2,5.4],[.1,4.2,6.0,5.2,5.6],[.3,3.7,7.3,5.4,5.8],[.6,3.0,5.2,4.0,4.1],[.85,2.6,3.4,3.0,3.0],[1,2.8,3.4,3.6,3.4]]
};
/* Шея: [t, спереди, сзади, латерально], см; t=0 — над верхним сечением корпуса, t=1 — внутри черепа */
const NECK=[[0,5.4,6.0,5.8],[.5,5.0,5.6,5.4],[1,4.8,5.2,5.2]],NECK_BLEND=.4;
const CAPS={sh:6.0,el:3.9,wr:2.7,kn:5.3,an:2.6};
/* Массы (доля от общей) и центры масс сегментов: de Leva 1996, мужчины */
const MASS={head:.0694,upperTrunk:.1596,midTrunk:.1633,lowerTrunk:.1117,ua:.0271,fa:.0162,hand:.0061,th:.1416,sk:.0433,foot:.0137};
/* Пределы, градусы: [мин, макс]. Положительные направления — в описании DOF ниже. */
const LIMITS={
 lumbar:[[-25,50],[-25,25],[-10,10]],thoracic:[[-20,40],[-25,25],[-35,35]],neck:[[-60,50],[-40,40],[-70,70]],
 girdle:[[-10,40],[-20,28]],shoulderTwist:[-75,95],elbow:[-4,150],pron:[-85,80],wrist:[[-75,80],[-25,20]],
 hipTwist:[-40,45],knee:[-4,145],ankle:[[-45,50],[-30,20]],mtp:[-80,40]
};

/* ---------- Степени свободы ----------
 root.p — центр между тазобедренными суставами; root.q — ориентация таза (кватернион).
 lumbar/thoracic/neck: [сгибание вперёд +, боковой наклон вправо +, поворот влево +].
 Для каждой стороны:
  girdle [поднимание +, протракция +];
  shoulder [сгибание, отведение, наружная ротация +] — размах (экспонента) и закрутка;
  elbow сгибание +; pron пронация + (0 — большой палец вперёд);
  wrist [сгибание к ладони +, лучевое отведение +];
  hip [сгибание, отведение, наружная ротация +]; knee сгибание +;
  ankle [тыльное сгибание +, супинация (инверсия) +]; mtp разгибание пальцев (носок вверх) +. */
const SIDES=['L','R'],SIGN={L:1,R:-1};
function sideZero(){return{girdle:[0,0],shoulder:[0,7,0],elbow:6,pron:0,wrist:[0,0],hip:[0,0,4],knee:0,ankle:[0,0],mtp:0};}
function neutral(){
 return{root:{p:[0,B.hipHeight,0],q:[1,0,0,0]},lumbar:[0,0,0],thoracic:[0,0,0],neck:[0,0,0],L:sideZero(),R:sideZero(),hands:{L:'relaxed',R:'relaxed'}};
}
function clone(q){return JSON.parse(JSON.stringify(q));}
const PACK=[['root.p',3],['root.q',4],['lumbar',3],['thoracic',3],['neck',3]];
for(const s of SIDES)for(const[k,n]of [['girdle',2],['shoulder',3],['elbow',1],['pron',1],['wrist',2],['hip',3],['knee',1],['ankle',2],['mtp',1]])PACK.push([s+'.'+k,n]);
const PACK_SIZE=PACK.reduce((s,[,n])=>s+n,0);
function getPath(o,p){return p.split('.').reduce((a,k)=>a[k],o);}
function setPath(o,p,v){const k=p.split('.'),last=k.pop();k.reduce((a,x)=>a[x],o)[last]=v;}
function pack(q){const out=[];for(const[p,n]of PACK){const v=getPath(q,p);if(n===1)out.push(v);else out.push(...v);}return out;}
function unpack(a,hands){const q=neutral();let i=0;for(const[p,n]of PACK){setPath(q,p,n===1?a[i]:a.slice(i,i+n));i+=n;}if(hands)q.hands={...hands};return q;}

/* ---------- Прямая кинематика ---------- */
const child=(F,off,R)=>({o:V.add(F.o,M3.v(F.R,off)),R:R?M3.mul(F.R,R):F.R});
const at=(F,p)=>V.add(F.o,M3.v(F.R,p));
const spineRot=a=>M3.mul(M3.rx(a[0]),M3.mul(M3.rz(a[1]),M3.ry(a[2])));
function fk(q){
 const F={},P={};
 F.pelvis={o:[...q.root.p],R:Q.toM3(q.root.q)};
 F.lumbar=child(F.pelvis,B.lumbar,spineRot(q.lumbar));
 F.thorax=child(F.lumbar,B.thoracic,spineRot(q.thoracic));
 const half=q.neck.map(v=>v/2);
 F.neck=child(F.thorax,B.c7,spineRot(half));F.head=child(F.neck,B.headJoint,spineRot(half));
 P.head=at(F.head,B.headCenter);
 for(const s of SIDES){
  const g=SIGN[s],J=q[s];
  const sc=at(F.thorax,[g*B.sc[0],B.sc[1],B.sc[2]]),gr=M3.mul(M3.rz(g*J.girdle[0]),M3.ry(-g*J.girdle[1]));
  P['sc'+s]=sc;P['gh'+s]=V.add(sc,M3.v(M3.mul(F.thorax.R,gr),[g*B.ghRel[0],B.ghRel[1],B.ghRel[2]]));
  F['ua'+s]={o:P['gh'+s],R:M3.mul(F.thorax.R,M3.mul(swing(-J.shoulder[0],g*J.shoulder[1]),M3.ry(g*J.shoulder[2])))};
  P['el'+s]=at(F['ua'+s],[0,-B.ua,0]);
  F['fa'+s]={o:P['el'+s],R:M3.mul(F['ua'+s].R,M3.rx(-J.elbow))};
  P['wr'+s]=at(F['fa'+s],[0,-B.fa,0]);
  F['fd'+s]={o:P['wr'+s],R:M3.mul(F['fa'+s].R,M3.ry(-g*J.pron))};
  F['hand'+s]={o:P['wr'+s],R:M3.mul(F['fd'+s].R,M3.mul(M3.rz(-g*J.wrist[0]),M3.rx(-J.wrist[1])))};
  P['grip'+s]=at(F['hand'+s],[-g*B.grip[0],B.grip[1],B.grip[2]]);P['knuckle'+s]=at(F['hand'+s],B.knuckle);
  P['hip'+s]=at(F.pelvis,[g*B.hipHalf,0,0]);
  F['th'+s]={o:P['hip'+s],R:M3.mul(F.pelvis.R,M3.mul(swing(-J.hip[0],g*J.hip[1]),M3.ry(g*J.hip[2])))};
  P['kn'+s]=at(F['th'+s],[0,-B.th,0]);
  F['sk'+s]={o:P['kn'+s],R:M3.mul(F['th'+s].R,M3.rx(J.knee))};
  P['an'+s]=at(F['sk'+s],[0,-B.sk,0]);
  F['foot'+s]={o:P['an'+s],R:M3.mul(F['sk'+s].R,M3.mul(M3.rx(-J.ankle[0]),M3.rz(-g*J.ankle[1])))};
  P['heel'+s]=at(F['foot'+s],[0,-B.ankle,B.heel]);P['ball'+s]=at(F['foot'+s],B.ball);
  F['toes'+s]={o:P['ball'+s],R:M3.mul(F['foot'+s].R,M3.rx(-J.mtp))};
  P['toe'+s]=at(F['toes'+s],B.toe);
 }
 return{F,P,q};
}
/* Опорные точки подошвы (для контакта с полом и опорой) */
function solePoints(fkr,s){
 const F=fkr.F['foot'+s],T=fkr.F['toes'+s],g=SIGN[s],w=B.sole;
 return[[0,-B.ankle,B.heel],[g*w.heelW/2,-B.ankle,B.heel+1.5],[-g*w.heelW/2,-B.ankle,B.heel+1.5],[g*w.ballL,-B.ankle,w.ballLZ],[-g*w.ballM,-B.ankle,B.ball[2]]].map(p=>({p:at(F,p),part:'rear'}))
  .concat([[-g*w.hallux[0],B.toeSole,w.hallux[1]],[0,B.toeSole,4.2],[-g*w.toe5[0],B.toeSole,w.toe5[1]]].map(p=>({p:at(T,p),part:'toes'})));
}

/* ---------- Обратная кинематика ---------- */
/* Двухзвенная цепь: корень, цель, длины, «полюс» — куда смотрит средний сустав */
function twoBone(root,target,l1,l2,pole){
 let d=V.sub(target,root),dist=V.len(d);const axis=V.unit(d),reach=l1+l2;
 const clamped=dist>reach*.9995?reach*.9995:dist<Math.abs(l1-l2)+.01?Math.abs(l1-l2)+.01:dist;
 const along=(l1*l1-l2*l2+clamped*clamped)/(2*clamped),h=Math.sqrt(Math.max(0,l1*l1-along*along));
 let b=V.perp(pole,axis);if(V.len(b)<1e-9)b=V.perp(Math.abs(axis[1])<.9?[0,1,0]:[0,0,1],axis);b=V.unit(b);
 const mid=V.add(V.add(root,axis,along),b,h),end=V.add(root,axis,clamped);
 return{mid,end,reachError:dist-clamped};
}
/* Рука: ставит центр хвата в grip, ось ручки — handleAxis (направление от мизинца к большому пальцу),
   локоть — в сторону pole. Ладонь поворачивается вокруг ручки так, чтобы запястье было почти прямым.
   opts.wristExt — желаемое разгибание запястья, град. Возвращает сведения о точности. */
function solveArm(q,s,grip,handleAxis,pole,opts={}){
 const g=SIGN[s];let fkr=fk(q),hx=V.unit(handleAxis),info={};
 const gripOff=[-g*B.grip[0],B.grip[1],B.grip[2]];
 let distal=V.unit(V.perp(V.sub(grip,fkr.P['gh'+s]),hx));
 for(let it=0;it<8;it++){
  /* кисть: z — вдоль ручки, −y — дистально; ладонь (−g·x) обращена к ручке */
  let Rh=M3.frameYZ(V.scale(distal,-1),hx);
  if(opts.wristExt){Rh=M3.mul(Rh,M3.rz(g*opts.wristExt));}
  const wr=V.sub(grip,M3.v(Rh,gripOff)),sh=fkr.P['gh'+s];
  const tb=twoBone(sh,wr,B.ua,B.fa,pole);info.reachError=tb.reachError;
  setArmFromPoints(q,s,fkr,tb.mid,tb.end,Rh);
  fkr=fk(q);
  const fore=V.unit(V.sub(fkr.P['wr'+s],fkr.P['el'+s])),nd=V.unit(V.perp(fore,hx));
  if(V.len(nd)<1e-6)break;
  const change=V.angle(nd,distal);distal=nd;if(change<.05)break;
 }
 fkr=fk(q);info.gripError=V.dist(fkr.P['grip'+s],grip);info.axisError=V.angle(M3.col(fkr.F['hand'+s].R,2),hx);
 return info;
}
/* Свободная рука: запястье в точку, кисть — в продолжение предплечья (или заданная ориентация) */
function solveArmWrist(q,s,wrist,pole,handR=null){
 const fkr=fk(q),tb=twoBone(fkr.P['gh'+s],wrist,B.ua,B.fa,pole);
 setArmFromPoints(q,s,fkr,tb.mid,tb.end,handR);return{reachError:tb.reachError};
}
function setArmFromPoints(q,s,fkr,el,wr,handR){
 const g=SIGN[s],J=q[s],sh=fkr.P['gh'+s],T=fkr.F.thorax.R;
 const a=V.unit(V.sub(el,sh)),f=V.unit(V.sub(wr,el));
 let zf=V.perp(f,a);
 const bent=V.len(zf)>.02;
 if(!bent){ /* прямая рука: плоскость сгиба — по текущей закрутке */
  const cur=fkr.F['ua'+s].R;zf=V.perp(M3.col(cur,2),a);if(V.len(zf)<1e-6)zf=V.perp(M3.col(T,2),a);
 }
 const Rua=M3.frameYZ(V.scale(a,-1),zf),rel=M3.mul(M3.T(T),Rua),st=swingTwist(rel);
 J.shoulder=[-st.vx,g*st.vz,g*st.twist];
 J.elbow=V.angle(a,f)*(V.dot(f,M3.col(Rua,2))>=0?1:-1);
 const Rfa=M3.mul(Rua,M3.rx(-J.elbow));
 if(handR){
  const e=eulerYZX(M3.mul(M3.T(Rfa),handR));
  J.pron=-g*e[0];J.wrist=[-g*e[1],-e[2]];
 }
}
/* Нога: стопа задаётся рамкой (rearfoot), колено — в сторону pole */
function footFrame(support,yaw,opts={}){
 /* support — точка опоры под «мячом» стопы (подушечка под плюснефаланговыми суставами);
    подошва лежит на плоскости с нормалью up; yaw — разворот носка вокруг нормали (0 — вдоль +Z);
    heel — подъём пятки, град: задний отдел вращается вокруг плюснефаланговой линии, пальцы остаются на опоре. */
 const up=V.unit(opts.up||[0,1,0]),fwd0=opts.forward||[Math.sin(yaw*D2R),0,Math.cos(yaw*D2R)];
 let R0=M3.frameYZ(up,fwd0);if(opts.roll)R0=M3.mul(R0,M3.rz(opts.roll));
 const R=opts.heel?M3.mul(R0,M3.rx(opts.heel)):R0,ball=V.add(support,M3.v(R0,[0,-B.toeSole,0]));
 return{o:V.sub(ball,M3.v(R,B.ball)),R,toesR:R0};
}
/* Стопа, стоящая пяткой (носок поднят): опора под пяткой, pitch — подъём носка, град */
function heelFrame(support,yaw,pitch,opts={}){
 const up=V.unit(opts.up||[0,1,0]),fwd0=opts.forward||[Math.sin(yaw*D2R),0,Math.cos(yaw*D2R)],R=M3.mul(M3.frameYZ(up,fwd0),M3.rx(-pitch));
 /* самая низкая точка скруглённой пятки касается опоры: средняя линия задних сечений стопы */
 let best=null;
 for(const sec of FOOT_SECTIONS.filter(sec=>sec[0]<=0))for(let i=0;i<=36;i++){const p=footRingPoint(sec,1,Math.PI+i/36*Math.PI);p[0]=0;const w=V.dot(M3.v(R,p),up);if(!best||w<best.w)best={p,w};}
 return{o:V.sub(support,M3.v(R,best.p)),R,toesR:R};
}
function solveLeg(q,s,foot,pole){
 /* foot: {o (центр голеностопа), R (рамка стопы), toesR?} */
 const g=SIGN[s],J=q[s];let fkr=fk(q);
 const hip=fkr.P['hip'+s],tb=twoBone(hip,foot.o,B.th,B.sk,pole||M3.col(foot.R,2));
 const P=fkr.F.pelvis.R,a=V.unit(V.sub(tb.mid,hip)),sd=V.unit(V.sub(tb.end,tb.mid));
 let zf=V.scale(V.perp(sd,a),-1);
 if(V.len(zf)<.02){zf=V.perp(pole||M3.col(foot.R,2),a);}
 const Rth=M3.frameYZ(V.scale(a,-1),zf),st=swingTwist(M3.mul(M3.T(P),Rth));
 J.hip=[-st.vx,g*st.vz,g*st.twist];
 J.knee=V.angle(a,sd)*(V.dot(sd,M3.col(Rth,2))<=0?1:-1);
 const Rsk=M3.mul(Rth,M3.rx(J.knee)),e=eulerXZY(M3.mul(M3.T(Rsk),foot.R));
 J.ankle=[-e[0],-g*e[1]];
 if(foot.toesR){const m=eulerXZY(M3.mul(M3.T(foot.R),foot.toesR));J.mtp=-m[0];}
 return{reachError:tb.reachError,ankleTwist:e[2]};
}

/* ---------- Корень и вспомогательные ---------- */
function rootRot(yaw=0,pitch=0,roll=0){return Q.fromM3(M3.mul(M3.ry(yaw),M3.mul(M3.rx(pitch),M3.rz(roll))));}
function rootFromAxes(up,forward){return Q.fromM3(M3.frameYZ(up,forward));}

/* ---------- Интерполяция ключей ---------- */
/* монотонная кубическая (Fritsch–Carlson) по каждой компоненте: без выбросов за пределы ключей */
function monotone(ts,ys){
 const n=ts.length,d=[],m=new Array(n).fill(0);
 for(let i=0;i<n-1;i++)d.push((ys[i+1]-ys[i])/(ts[i+1]-ts[i]));
 if(n===2){m[0]=m[1]=d[0];return m;}
 m[0]=d[0];m[n-1]=d[n-2];
 for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){if(Math.abs(d[i])<1e-12){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],h=a*a+b*b;if(h>9){const k=3/Math.sqrt(h);m[i]=k*a*d[i];m[i+1]=k*b*d[i];}}
 return m;
}
function makeTrack(keys,{loop=false}={}){
 /* keys: [{t, v:[...pack], hands:{L,R}}], v упакованы; кватернион корня приведён к одной полусфере.
    loop — замкнутый цикл (ключ t=1 совпадает с t=0): касательные на концах берутся через стык, без остановки. */
 const ts=keys.map(k=>k.t),n=keys[0].v.length,vals=keys.map(k=>k.v.slice());
 for(let i=1;i<vals.length;i++){const a=vals[i-1],b=vals[i];if(a[3]*b[3]+a[4]*b[4]+a[5]*b[5]+a[6]*b[6]<0)for(let j=3;j<7;j++)b[j]=-b[j];}
 const slopes=[];for(let j=0;j<n;j++)slopes.push(keys.length>1?monotone(ts,vals.map(v=>v[j])):[0]);
 if(loop&&keys.length>2){const m=keys.length-1;for(let j=0;j<n;j++){const d0=(vals[1][j]-vals[0][j])/(ts[1]-ts[0]),d1=(vals[m][j]-vals[m-1][j])/(ts[m]-ts[m-1]),s=d0*d1<=0?0:(d0+d1)/2;slopes[j][0]=slopes[j][m]=s;}}
 return t=>{
  if(keys.length===1)return{v:vals[0].slice(),hands:keys[0].hands};
  t=clamp(t,ts[0],ts.at(-1));let i=0;while(i<ts.length-2&&t>ts[i+1])i++;
  const h=ts[i+1]-ts[i],u=(t-ts[i])/h,u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2,out=new Array(n);
  for(let j=0;j<n;j++)out[j]=h00*vals[i][j]+h10*h*slopes[j][i]+h01*vals[i+1][j]+h11*h*slopes[j][i+1];
  const qn=Math.hypot(out[3],out[4],out[5],out[6])||1;for(let j=3;j<7;j++)out[j]/=qn;
  return{v:out,hands:(u<.5?keys[i]:keys[i+1]).hands};
 };
}

/* ---------- Вывод в координаты каталога ---------- */
const toCat=p=>[p[0],FLOOR-p[1],p[2]],dirCat=d=>[d[0],-d[1],d[2]];
function frameCat(F){return{o:toCat(F.o),x:dirCat(M3.col(F.R,0)),y:dirCat(M3.col(F.R,1)),z:dirCat(M3.col(F.R,2))};}
function catalogPose(q){
 const r=fk(q),P=r.P,F=r.F,R={basis:'mannequin',props:[],contacts:[]};
 R.hip=toCat(F.pelvis.o);R.u=dirCat(M3.col(F.pelvis.R,1));R.n=dirCat(M3.col(F.pelvis.R,2));R.x=dirCat(V.scale(M3.col(F.pelvis.R,0),-1)); /* x — анатомически правая сторона */
 R.waist=toCat(at(F.lumbar,[0,8,0]));R.chestU=dirCat(M3.col(F.thorax.R,1));R.chestN=dirCat(M3.col(F.thorax.R,2));
 R.sh=toCat(at(F.thorax,[0,21.6,0]));R.neckBase=toCat(at(F.thorax,[0,30,-3]));
 R.head=toCat(P.head);R.headU=dirCat(M3.col(F.head.R,1));R.headN=dirCat(M3.col(F.head.R,2));
 for(const s of SIDES){
  R['sh'+s]=toCat(P['gh'+s]);R['el'+s]=toCat(P['el'+s]);R['wr'+s]=toCat(P['wr'+s]);R['grip'+s]=toCat(P['grip'+s]);R['hand'+s]=toCat(P['knuckle'+s]);
  R['hip'+s]=toCat(P['hip'+s]);R['kn'+s]=toCat(P['kn'+s]);R['an'+s]=toCat(P['an'+s]);R['heel'+s]=toCat(P['heel'+s]);R['ball'+s]=toCat(P['ball'+s]);R['toe'+s]=toCat(P['toe'+s]);
 }
 R.frames={};for(const[k,f]of Object.entries(F))R.frames[k]=frameCat(f);
 R.hands={...(q.hands||{L:'relaxed',R:'relaxed'})};
 R.girdle={L:toCat(P.ghL),R:toCat(P.ghR)};
 R.gripRadius={L:q.gripRadius?.L??1.4,R:q.gripRadius?.R??1.4};
 return R;
}

/* ---------- Поверхность тела (в координатах каталога, только по рамкам — без векторных произведений) ---------- */
const lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function profileAt(prof,t){
 if(t<=prof[0][0])return prof[0].slice(1);
 for(let i=1;i<prof.length;i++)if(t<=prof[i][0]){const a=prof[i-1],b=prof[i],u=(t-a[0])/(b[0]-a[0]);return a.slice(1).map((v,k)=>lerp(v,b[k+1],u));}
 return prof.at(-1).slice(1);
}
const sectionAt=h=>profileAt(TORSO,h);
/* Ось корпуса: таз до 10 см, поясница 10–24, грудная клетка выше; скругление ±3 см у шарниров */
function spineFrame(R,h){
 const fr=R.frames,segs=[[fr.pelvis,0],[fr.lumbar,10],[fr.thorax,24]];
 const pointOn=(i,hh)=>{const[f,h0]=segs[i];return V.add(f.o,f.y,hh-h0);};
 const axesOf=i=>{const f=segs[i][0];return{x:f.x,y:f.y,z:f.z};};
 let seg=h<10?0:h<24?1:2;
 for(const[j,hj]of [[1,10],[2,24]]){
  if(Math.abs(h-hj)<3){
   const u=(h-hj+3)/6,P0=pointOn(j-1,hj-3),P1=pointOn(j,hj),P2=pointOn(j,hj+3);
   const c=[0,1,2].map(k=>(1-u)*(1-u)*P0[k]+2*u*(1-u)*P1[k]+u*u*P2[k]);
   const a=axesOf(j-1),b=axesOf(j),w=smooth(u),mixU=(p,q)=>V.unit(V.mix(p,q,w));
   const y=mixU(a.y,b.y),z=V.unit(V.perp(mixU(a.z,b.z),y)),x=V.unit(V.perp(V.perp(mixU(a.x,b.x),y),z));
   return{c,x,y,z};
  }
 }
 const ax=axesOf(seg);return{c:pointOn(seg,h),...ax};
}
/* Точка поверхности корпуса: side — 'L'/'R', ang ∈ [0, π] от передней линии через бок к спине */
function torsoPoint(R,h,side,ang,extra=0){return torsoPointIn(R,h,side,ang,extra,spineFrame(R,h),sectionAt(h));}
/* то же по готовой рамке сечения: сетка тела считает рамку и профиль один раз на ряд, а не на каждую точку */
function torsoPointIn(R,h,side,ang,extra,f,[w,a,b]){
 const c=Math.cos(ang),s=Math.sin(ang),lat=V.scale(f.x,SIGN[side]); /* f.x — левая сторона тела */
 let p=V.add(V.add(f.c,f.z,((c>=0?a:b)+extra)*c),lat,(w+extra)*s);
 /* надплечья следуют за поднятием и протракцией плечевого пояса */
 if(h>38&&R.girdle&&R.frames.thorax){
  /* основание шеи следует за лопаткой лишь частично (до 60 % у h = 56): трапеция растягивается плавно, без складок */
  const k=smooth((h-38)/12)*(1-.4*smooth((h-50)/6))*Math.pow(Math.max(0,s),2),gh=R.girdle[side],rest=V.add(V.add(V.add(R.frames.thorax.o,R.frames.thorax.y,21.6),R.frames.thorax.x,SIGN[side]*18),R.frames.thorax.z,0);
  p=V.add(p,V.sub(gh,rest),k*.85);
 }
 return p;
}
const LIMB_DEF={ua:['ua','sh','el'],fa:['fa','el','wr'],th:['th','hip','kn'],sk:['sk','kn','an']};
/* Рамка сечения конечности: спереди (front) и латерально (lat). Для предплечья спереди — ладонная сторона,
   закрутка по длине — от локтевой (t=0) к лучевой (t=1) кости. */
function limbAxes(R,kind,side,t){
 const g=SIGN[side],fr=R.frames;
 if(kind==='fa'){
  const p=fr['fa'+side],d=fr['fd'+side],front=V.unit(V.mix(V.scale(p.x,-g),V.scale(d.x,-g),t)),lat=V.unit(V.mix(p.z,d.z,t));
  return{front,lat:V.unit(V.perp(lat,front)),axis:V.scale(p.y,-1)};
 }
 const f=fr[kind+side];return{front:f.z,lat:V.scale(f.x,g),axis:V.scale(f.y,-1)};
}
function limbPoint(R,kind,side,t,ang,extra=0){
 const[,a,b]=LIMB_DEF[kind];return limbPointIn(V.mix(R[a+side],R[b+side],t),limbAxes(R,kind,side,t),profileAt(LIMBS[kind],t),ang,extra);
}
/* ряд точек на одном сечении: рамка, оси и профиль считаются один раз (сетки тела и мышечных зон) */
function torsoRow(R,h,side){const f=spineFrame(R,h),sec=sectionAt(h);return(ang,extra=0)=>torsoPointIn(R,h,side,ang,extra,f,sec);}
function limbRow(R,kind,side,t){const[,a,b]=LIMB_DEF[kind],center=V.mix(R[a+side],R[b+side],t),ax=limbAxes(R,kind,side,t),prof=profileAt(LIMBS[kind],t);return(ang,extra=0)=>limbPointIn(center,ax,prof,ang,extra);}
/* то же по готовому сечению (центр, оси, профиль) — для сетки, где сечение общее для ряда точек */
function limbPointIn(center,ax,[rf,rb,rl,rm],ang,extra=0){
 const c=Math.cos(ang),s=Math.sin(ang);
 return V.add(V.add(center,ax.front,((c>=0?rf:rb)+extra)*c),ax.lat,((s>=0?rl:rm)+extra)*s);
}
/* Шея: ось — от основания (на уровне верхнего сечения корпуса, впереди остистых отростков) к точке внутри черепа.
   Нижние 40 % плавно переходят из верхнего сечения корпуса (надплечья с поднятием плечевого пояса) в круглую шею:
   поверхность непрерывна, без уступа и открытого края сзади. ang: 0 — спереди, π/2 — левая сторона, π — сзади. */
function neckPoint(R,t,ang,top){
 const n=R.frames.neck,h=R.frames.head,lo=V.add(V.add(n.o,n.y,-1),n.z,2.5),hi=V.add(h.o,h.y,1.5),c=V.mix(lo,hi,t);
 const z=V.unit(V.mix(n.z,h.z,t)),x=V.unit(V.mix(n.x,h.x,t)),[rf,rb,rl]=profileAt(NECK,t),cs=Math.cos(ang),sn=Math.sin(ang);
 const p=V.add(V.add(c,z,(cs>=0?rf:rb)*cs),x,rl*sn),w=smooth(t/NECK_BLEND);
 if(w>=1)return p;
 /* основание — продолжение поверхности корпуса по её же касательной: стык корпуса и шеи без излома */
 const a=((ang%(2*Math.PI))+2*Math.PI)%(2*Math.PI),side=a<=Math.PI?'L':'R',an=a<=Math.PI?a:2*Math.PI-a,hTop=TORSO.at(-1)[0];
 const A=top?torsoPointIn(R,hTop,side,an,0,top.f,top.sec):torsoPoint(R,hTop,side,an),A0=top?torsoPointIn(R,hTop-2,side,an,0,top.f0,top.sec0):torsoPoint(R,hTop-2,side,an),base=V.add(A,V.unit(V.sub(A,A0)),t*V.dist(lo,hi));
 return V.mix(base,p,w);
}
const TORSO_H=[];for(let h=TORSO[0][0];h<=TORSO.at(-1)[0]+1e-9;h+=2.5)TORSO_H.push(+h.toFixed(2));if(TORSO_H.at(-1)<TORSO.at(-1)[0])TORSO_H.push(TORSO.at(-1)[0]);
/* Полная сетка тела для сцены: точки в координатах каталога */
function surface(R,{cols=24,limbRows=10,limbCols=16}={}){
 /* рамка и профиль сечения считаются один раз на ряд — точки те же, что у torsoPoint/limbPoint/neckPoint */
 const torso=TORSO_H.map(h=>{const f=spineFrame(R,h),sec=sectionAt(h);return Array.from({length:cols},(_,c)=>{const a=c/cols*2*Math.PI,side=a<=Math.PI?'L':'R',ang=a<=Math.PI?a:2*Math.PI-a;return torsoPointIn(R,h,side,ang,0,f,sec);});});
 const limbs={};
 for(const s of SIDES)for(const k of Object.keys(LIMB_DEF)){
  const[,a,b]=LIMB_DEF[k],A=R[a+s],Bp=R[b+s];
  limbs[k+s]=Array.from({length:limbRows+1},(_,r)=>{const t=r/limbRows,center=V.mix(A,Bp,t),ax=limbAxes(R,k,s,t),prof=profileAt(LIMBS[k],t);return Array.from({length:limbCols},(_,c)=>limbPointIn(center,ax,prof,c/limbCols*2*Math.PI));});
 }
 const hTop=TORSO.at(-1)[0],top={f:spineFrame(R,hTop),sec:sectionAt(hTop),f0:spineFrame(R,hTop-2),sec0:sectionAt(hTop-2)};
 const neck=Array.from({length:9},(_,r)=>Array.from({length:20},(_,c)=>neckPoint(R,r/8,c/20*2*Math.PI,top)));
 return{torso,limbs,neck,torsoHeights:TORSO_H};
}

/* Точки для рамки кадра SVG-фигуры: все ряды туловища и каждый третий ряд конечностей (с последним) — ровно те точки
   surface(), по которым считается рамка, без шеи, кистей и стоп; совпадают с surface() до бита. */
function boundsSurface(R,{cols=24,limbRows=10,limbCols=16,limbStep=3}={}){
 const torso=TORSO_H.map(h=>{const f=spineFrame(R,h),sec=sectionAt(h);return Array.from({length:cols},(_,c)=>{const a=c/cols*2*Math.PI,side=a<=Math.PI?'L':'R',ang=a<=Math.PI?a:2*Math.PI-a;return torsoPointIn(R,h,side,ang,0,f,sec);});});
 const rows=[];for(let r=0;r<=limbRows;r++)if(r%limbStep===0||r===limbRows)rows.push(r);
 const limbs={};
 for(const s of SIDES)for(const k of Object.keys(LIMB_DEF)){
  const[,a,b]=LIMB_DEF[k],A=R[a+s],Bp=R[b+s];
  limbs[k+s]=rows.map(r=>{const t=r/limbRows,center=V.mix(A,Bp,t),ax=limbAxes(R,k,s,t),prof=profileAt(LIMBS[k],t);return Array.from({length:limbCols},(_,c)=>limbPointIn(center,ax,prof,c/limbCols*2*Math.PI));});
 }
 return{torso,limbs};
}

/* ---------- Знаковые расстояния тела (каталог) ---------- */
function ellipseRadius(lx,ly,rf,rb,rl,rm){
 const a=lx>=0?rf:rb,b=ly>=0?rl:rm,th=Math.atan2(ly/b,lx/a);return Math.hypot(a*Math.cos(th),b*Math.sin(th));
}
function limbSDF(R,kind,side,p){
 const[,a,b]=LIMB_DEF[kind],A=R[a+side],Bp=R[b+side],d=V.sub(Bp,A),L2=V.dot(d,d),t=clamp(V.dot(V.sub(p,A),d)/L2,0,1);
 const ax=limbAxes(R,kind,side,t),c=V.mix(A,Bp,t),off=V.sub(p,c),along=V.dot(off,V.unit(d)),rad=V.perp(off,V.unit(d));
 const lx=V.dot(rad,ax.front),ly=V.dot(rad,ax.lat),[rf,rb,rl,rm]=profileAt(LIMBS[kind],t),rho=Math.hypot(lx,ly),r=rho<1e-9?Math.min(rf,rb,rl,rm):ellipseRadius(lx,ly,rf,rb,rl,rm);
 const radial=rho-r,axial=t<=0||t>=1?Math.abs(along):0;
 return axial>0?(radial>0?Math.hypot(radial,axial):axial):radial;
}
const TORSO_SAMPLES=[];for(let h=-9;h<=56;h+=1)TORSO_SAMPLES.push(h);
function torsoSDF(R,p,cache){
 const frames=cache||TORSO_SAMPLES.map(h=>({h,f:spineFrame(R,h)}));
 let best=null;
 for(const s of frames){const off=V.sub(p,s.f.c),along=V.dot(off,s.f.y);if(!best||Math.abs(along)<Math.abs(best.along))best={s,along,off};}
 const{s,off,along}=best,lz=V.dot(off,s.f.z),lx=V.dot(off,s.f.x),[w,a,b]=sectionAt(s.h),rho=Math.hypot(lz,lx);
 const r=rho<1e-9?Math.min(w,a,b):ellipseRadius(lz,lx,a,b,w,w),radial=rho-r;
 /* торец корпуса (низ таза, основание шеи): внутри — до ближайшей поверхности, снаружи — до кромки */
 const lo=TORSO[0][0],hi=TORSO.at(-1)[0],hp=s.h+along,axial=Math.max(lo-hp,hp-hi);
 return axial>0?(radial>0?Math.hypot(radial,axial):axial):Math.max(radial,axial);
}
function torsoCache(R){return TORSO_SAMPLES.map(h=>({h,f:spineFrame(R,h)}));}
function headSDF(R,p){
 const c=R.head,ax=[R.frames.head.x,R.frames.head.y,R.frames.head.z],r=B.head,d=V.sub(p,c),qv=ax.map((a,i)=>V.dot(d,a)/r[i]);
 const k0=Math.hypot(...qv),k1=Math.hypot(...ax.map((a,i)=>V.dot(d,a)/(r[i]*r[i])));return k1<1e-9?-Math.min(...r):k0*(k0-1)/k1;
}

/* ---------- Кисть и стопа: опорные точки для сетки (локальные координаты кисти/стопы, см) ---------- */
/* Кисть: начало — центр лучезапястного сустава; −Y — к пальцам; ладонь смотрит в −g·X; +Z — сторона большого пальца.
   mode: grip — обхват ручки радиуса r; flat — ладонь на опоре; relaxed — расслабленная; fist — кулак. */
const FINGERS=[[2.9,8.0,.85],[1.0,8.8,.86],[-.9,8.2,.8],[-2.8,6.6,.72]];
function handShape(mode='relaxed',side='L',r=1.4){
 const g=SIGN[side],P=(u,v,w)=>[-g*u,-v,w],fingers=[],G=[B.grip[0],-B.grip[1]];
 for(const[w,len,rad]of FINGERS){
  let pts=[];
  if(mode==='grip'||mode==='fist'){
   const rr=mode==='fist'?1.15:r+.85,gu=mode==='fist'?2.2:G[0],gv=mode==='fist'?8.4:G[1];
   pts.push(P(.2,9.6,w));let used=0,prev=[.2,9.6],phi=-.6;
   while(used<len&&phi<3.3){const u=gu+rr*Math.sin(phi),v=gv+rr*Math.cos(phi);used+=Math.hypot(u-prev[0],v-prev[1]);prev=[u,v];pts.push(P(u,v,w*.96));phi+=.32;}
  }else{
   const bend=mode==='flat'?[0,4,2]:mode==='hook'?[10,95,48]:[22,34,22],seg=[.47,.29,.24];let dir=0,u=.2,v=9.6;pts.push(P(u,v,w));
   for(let i=0;i<3;i++){dir+=bend[i]*D2R;u+=Math.sin(dir)*len*seg[i];v+=Math.cos(dir)*len*seg[i];pts.push(P(u,v,w*(mode==='flat'?1.08:1)));}
  }
  fingers.push({pts,r:rad});
 }
 const T={hook:[[.4,2.6,3.0],[1.0,5.8,4.4],[1.4,8.0,4.6]],grip:[[.4,2.6,3.0],[1.9,6.0,3.7],[G[0]+r+2.0,G[1]-.4,2.4],[G[0]+r*.6+1.4,G[1]+r+.9,1.0]],
  fist:[[.4,2.6,3.0],[2.2,6.0,3.3],[3.4,8.6,1.6]],flat:[[.4,2.6,3.0],[.6,5.4,5.6],[.6,7.9,6.6]],relaxed:[[.4,2.6,3.0],[1.2,5.6,4.6],[1.9,7.7,4.2]]};
 return{palm:{c:P(.2,5.6,.15),size:[B.palm.thick,8.6,B.palm.width]},fingers,thumb:{pts:(T[mode]||T.relaxed).map(p=>P(...p)),r:1.0}};
}
/* Стопа (босая). Рамка — как у сегмента foot: начало в центре голеностопного сустава, +Z — к пальцам, +Y — вверх
   по голени, латеральная сторона — g·X. Подошва лежит на −B.ankle (стопа на полу).
   Задний и средний отдел — сечения вдоль Z: [z, верх (тыл стопы), низ латерально, низ медиально, полуширина
   латерально, полуширина медиально, смещение центра медиально; необязательно — показатели суперэллипса верха и боков]. Медиальный край подошвы поднят сводом (до 1,6 см
   над полом у ладьевидной кости), латеральный лежит на полу. Перед — подушечка вокруг оси плюснефаланговых
   суставов (центр — точка ball, радиус 2 см до пола): при подъёме пятки опора остаётся на ней.
   Пальцы — в рамке toes (начало в точке ball): [смещение к медиальному краю, z основания, длина до кончика,
   радиус, разворот наружу (рад; мизинец чуть повёрнут внутрь)]. Пятый плюснефаланговый сустав на ~3 см позади первого —
   линия косая; латеральный край стопы от пятки до головки пятой плюсневой почти прямой, ширина переднего отдела
   прибавляется с медиальной стороны.
   Размеры для роста 175 см: длина стопы 26,9 см (0,152·H), ширина по головкам плюсневых костей 9,6 см (0,055·H) —
   Winter 2009, рис. 4.1; ширина пятки 6,6 см — ANSUR II. Высота центра голеностопа оставлена 8,5 см, как у
   кинематики всех поз (босая стопа — 6,8 см, 0,039·H): подошвенные мягкие ткани нарисованы на 1,7 см толще. */
const FOOT_SECTIONS=[
 [-7.35,-5.5,-7.2,-7.2,.8,.6,0],[-7.1,-3.6,-7.9,-7.9,2.2,1.7,0],[-6.4,-2.4,-8.4,-8.4,3.2,2.5,0],[-5.2,-1.4,-8.5,-8.5,3.6,2.9,0],
 [-3.4,-.4,-8.5,-8.5,3.8,3.3,0,2.8,3.2],[-1.2,-.1,-8.5,-8.45,3.9,3.45,0,2.8,3.2],[1.0,-.6,-8.5,-8.1,4.0,3.55,0,2.6,3],[3.4,-1.5,-8.5,-7.4,4.15,3.7,0],
 [6.0,-2.4,-8.5,-6.95,4.3,3.95,0],[8.6,-3.5,-8.5,-7.25,4.45,4.4,0],[11.0,-4.35,-8.5,-8.2,4.55,4.95,0],[12.6,-4.75,-8.5,-8.5,3.9,5.2,0],
 [13.6,-4.95,-8.5,-8.5,3.1,5.2,0],[14.6,-5.45,-8.2,-8.2,2.2,4.7,.4],[15.3,-6.0,-7.45,-7.45,1.1,3.5,1.0],[15.6,-6.5,-7.0,-7.0,.3,1.6,1.9]
];
const TOES=[[2.9,.2,5.7,1.2,.08],[.8,-.2,5.6,.86,.02],[-1.05,-.9,5.0,.82,.03],[-2.6,-1.8,4.5,.78,.03],[-3.85,-2.8,3.9,.78,-.06]];
/* точка сечения: phi — угол вокруг оси Z от +X через верх; nt/nb/nx — показатели суперэллипса (верх круглее, подошва площе) */
function footRingPoint(sec,g,phi){
 const[z,top,bl,bm,wl,wm,cm,nt=2.2,nx=2.6]=sec,nb=3.6,c=Math.cos(phi),sn=Math.sin(phi),lat=c*g>=0;
 const x=-g*cm+Math.sign(c)*(lat?wl:wm)*Math.pow(Math.abs(c),2/nx);
 const k=(1+c*g)/2,bot=bm+(bl-bm)*k,yc=(top+bl)/2;
 const y=sn>=0?yc+(top-yc)*Math.pow(sn,2/nt):yc-(yc-bot)*Math.pow(-sn,2/nb);
 return[x,y,z];
}
/* ось пальца: от основания по фалангам, кончик — так, чтобы подушечка касалась плоскости подошвы (B.toeSole) */
function toePath(t,g){
 const[m,z0,len,r,splay]=t,big=r>1,seg=big?[.55,.45]:[.42,.32,.26],bend=big?[0,10]:[-6,22,14],y0=big?-.4:-.5,yaw=g*splay;
 const run=pitch=>{let a=pitch*D2R,p=[-g*m,y0,z0];const pts=[p];
  for(let i=0;i<seg.length;i++){a+=bend[i]*D2R;const l=(len-r)*seg[i],h=Math.cos(a);p=[p[0]+Math.sin(yaw)*h*l,p[1]-Math.sin(a)*l,p[2]+Math.cos(yaw)*h*l];pts.push(p);}
  return pts;};
 let lo=-20,hi=40;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(run(mid).at(-1)[1]>B.toeSole+r)lo=mid;else hi=mid;}
 return run((lo+hi)/2);
}
const FOOT_CACHE={};
/* Форма стопы для сетки: кольца заднего и среднего отдела (в рамке foot) и пальцы (в рамке toes) */
function footShape(side='L'){
 if(FOOT_CACHE[side])return FOOT_CACHE[side];
 const g=SIGN[side],N=24,sub=3,rings=FOOT_SECTIONS.map(sec=>Array.from({length:N},(_,i)=>footRingPoint(sec,g,i/N*2*Math.PI)));
 /* сглаживание вдоль стопы: Catmull–Rom по каждой образующей */
 const cr=(a,b,c,d,t)=>a.map((_,k)=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t));
 const rows=[];
 for(let j=0;j<rings.length-1;j++)for(let k=0;k<sub;k++){const t=k/sub,A=rings[Math.max(0,j-1)],Bq=rings[j],Cq=rings[j+1],D=rings[Math.min(rings.length-1,j+2)];rows.push(Bq.map((_,i)=>cr(A[i],Bq[i],Cq[i],D[i],t)));}
 rows.push(rings.at(-1));
 const cap=row=>{const c=row.reduce((a,p)=>V.add(a,p,1/row.length),[0,0,0]);return row.map(()=>c);};
 const shape={rear:[cap(rows[0]),...rows,cap(rows.at(-1))],toes:TOES.map(t=>({pts:toePath(t,g),r:t[3]}))};
 return FOOT_CACHE[side]=shape;
}
/* Точки поверхности стопы для проверок (валидатор, авторинг): part — rear (рамка foot) или toes (рамка toes);
   sole — подошвенная сторона. */
function footPoints(side='L'){
 const key='pts'+side;if(FOOT_CACHE[key])return FOOT_CACHE[key];
 const g=SIGN[side],out=[];
 for(const sec of FOOT_SECTIONS.slice(1,-1))for(let i=0;i<10;i++){const phi=i/10*2*Math.PI+Math.PI/10;out.push({part:'rear',sole:Math.sin(phi)<-.5,p:footRingPoint(sec,g,phi)});}
 for(const sec of FOOT_SECTIONS.slice(1,-1))out.push({part:'rear',sole:true,p:footRingPoint(sec,g,1.5*Math.PI)});
 for(const t of TOES){const pts=toePath(t,g),r=t[3];
  pts.forEach((p,i)=>{out.push({part:'toes',sole:true,p:[p[0],p[1]-r,p[2]]},{part:'toes',sole:false,p:[p[0],p[1]+r,p[2]]});if(i)out.push({part:'toes',sole:false,p:[p[0]+g*r,p[1],p[2]]},{part:'toes',sole:false,p:[p[0]-g*r,p[1],p[2]]});});
  const a=pts.at(-2),b=pts.at(-1),d=V.unit(V.sub(b,a));out.push({part:'toes',sole:false,p:V.add(b,d,r)});}
 return FOOT_CACHE[key]=out;
}
/* Лодыжки — выступы большеберцовой (медиальная: на уровне сустава, чуть впереди) и малоберцовой (латеральная:
   на 1 см ниже, чуть позади) костей. Для сетки — утолщение нижних колец голени: [угол сечения (0 — спереди,
   π/2 — латерально), t по голени, высота выступа, см]; для проверок — точки на вершинах выступов. */
const MALLEOLI={lat:[Math.PI/2+.25,1.025,.8],med:[1.5*Math.PI+.2,1.0,.7]};
const malleolusBump=(ang,t)=>Object.values(MALLEOLI).reduce((a,[c,tc,h])=>a+h*Math.pow(Math.max(0,Math.cos(ang-c)),6)*Math.max(0,1-Math.abs(t-tc)/.07),0);
function malleoli(R,s){
 return Object.values(MALLEOLI).flatMap(([c,tc,h])=>[-.25,0,.25].map(d=>limbRow(R,'sk',s,tc)(c+d,malleolusBump(c+d,tc))));
}
/* Данные тела для сцены: сетки, голова, кисти, стопы, «шапки» суставов и лодыжки */
function bodyData(R){
 const S=surface(R),fr=R.frames,caps=[];
 /* Голеностоп для сетки (проверки — по surface): голень продолжается на 3 см ниже центра сустава, сужаясь, и это
    продолжение поворачивается вместе со стопой (точки смешиваются между рамками голени и стопы, как при скиннинге).
    Конец трубы всегда внутри стопы — при любом сгибании голеностопа нет открытого края, стык — складка на коже. */
 for(const s of SIDES){
  const rows=S.limbs['sk'+s],n=rows[0].length,sk=R.frames['sk'+s],ff=R.frames['foot'+s],an=R['an'+s];
  const ring=(t,ex=0)=>{const row=limbRow(R,'sk',s,t);return Array.from({length:n},(_,c)=>{const a=c/n*2*Math.PI;return row(a,ex+malleolusBump(a,t));});};
  const follow=(p,w)=>{const d=V.sub(p,an),l=[V.dot(d,sk.x),V.dot(d,sk.y),V.dot(d,sk.z)];return V.mix(p,V.add(V.add(V.add(an,ff.x,l[0]),ff.y,l[1]),ff.z,l[2]),w);};
  rows.splice(rows.length-1,1,ring(.965),ring(1));
  for(const[t,ex,w]of [[1.035,-.35,.5],[1.07,-1.1,1]])rows.push(ring(t,ex).map(p=>follow(p,w)));
 }

 for(const s of SIDES){
  const ua=fr['ua'+s],g=SIGN[s];
  caps.push({key:'sh'+s,c:V.add(V.add(R['sh'+s],ua.y,-1.4),ua.x,g*.7),r:CAPS.sh},{key:'el'+s,c:R['el'+s],r:CAPS.el},{key:'wr'+s,c:R['wr'+s],r:CAPS.wr},{key:'kn'+s,c:V.add(R['kn'+s],fr['sk'+s].z,.4),r:CAPS.kn},{key:'an'+s,c:R['an'+s],r:CAPS.an});
 }
 const hands={},feet={};
 for(const s of SIDES){const mode=R.hands?.[s]||'relaxed',r=R.gripRadius?.[s]??1.4;hands[s]={frame:fr['hand'+s],mode,r,key:mode+':'+s+':'+r.toFixed(2),shape:handShape(mode,s,r)};feet[s]={rear:fr['foot'+s],toes:fr['toes'+s],shape:footShape(s)};}
 return{...S,head:{c:R.head,axes:[fr.head.x,fr.head.y,fr.head.z],radii:B.head},caps,hands,feet};
}

/* ---------- Углы суставов по рамкам сегментов ----------
   Общие для валидатора (tools/biomech/validator2.js) и меток нагрузки на суставы в приложении. */
const jaInt = f => M3.cols([f.x[0], -f.x[1], f.x[2]], [f.y[0], -f.y[1], f.y[2]], [f.z[0], -f.z[1], f.z[2]]); /* каталог → внутренняя правая тройка */
const jaRel = (a, b) => M3.mul(M3.T(jaInt(a)), jaInt(b));
function jointAngles(R) {
  const F = R.frames, out = {};
  out.lumbar = eulerXZY(jaRel(F.pelvis, F.lumbar));
  out.thoracic = eulerXZY(jaRel(F.lumbar, F.thorax));
  out.neck = eulerXZY(jaRel(F.thorax, F.head));
  for (const s of SIDES) {
    const g = SIGN[s], A = {};
    /* плечо относительно грудной клетки */
    const ua = jaRel(F.thorax, F['ua' + s]), st = swingTwist(ua), hum = M3.v(ua, [0, -1, 0]);
    A.elevation = V.angle(hum, [0, -1, 0]);
    A.flexion = Math.atan2(hum[2], -hum[1]) * R2D;         /* вперёд + */
    A.abduction = Math.atan2(g * hum[0], Math.hypot(hum[1], hum[2])) * R2D; /* наружу + */
    A.posterior = -hum[2];                                     /* >0 — плечо позади фронтальной плоскости */
    A.up = hum[1]; A.lat = g * hum[0];
    A.twist = g * st.twist;
    const fa = jaRel(F['ua' + s], F['fa' + s]); A.elbow = -Math.atan2(fa[7], fa[4]) * R2D;
    const pr = jaRel(F['fa' + s], F['fd' + s]); A.pron = -g * Math.atan2(pr[2], pr[0]) * R2D;
    /* запястье: направление кисти в рамке дистального предплечья — устойчиво и при разгибании ~90° */
    const wr = jaRel(F['fd' + s], F['hand' + s]), d = [-wr[1], -wr[4], -wr[7]];
    A.wristFlex = Math.atan2(-g * d[0], -d[1]) * R2D; A.wristDev = Math.asin(clamp(d[2], -1, 1)) * R2D;
    { const ex = M3.mul(M3.rz(-g * A.wristFlex), M3.rx(-A.wristDev)), zE = M3.col(ex, 2), zH = M3.col(wr, 2), ax = V.unit(d);
      const a1 = V.unit(V.perp(zE, ax)), a2 = V.unit(V.perp(zH, ax)); A.wristTwist = Math.atan2(V.dot(V.cross(a1, a2), ax), V.dot(a1, a2)) * R2D; }
    const th = jaRel(F.pelvis, F['th' + s]), fem = M3.v(th, [0, -1, 0]), ht = swingTwist(th);
    A.hipFlex = Math.atan2(fem[2], -fem[1]) * R2D; A.hipAbd = Math.atan2(g * fem[0], Math.hypot(fem[1], fem[2])) * R2D; A.hipRot = g * ht.twist;
    const kn = jaRel(F['th' + s], F['sk' + s]); A.knee = Math.atan2(kn[7], kn[4]) * R2D;
    const an = eulerXZY(jaRel(F['sk' + s], F['foot' + s])); A.dorsi = -an[0]; A.inversion = -g * an[1]; A.ankleTwist = an[2];
    const mt = eulerXZY(jaRel(F['foot' + s], F['toes' + s])); A.mtp = -mt[0];
    out[s] = A;
  }
  return out;
}

/* ---------- Масса ---------- */
function centerOfMass(R,extra=[]){
 const m=B.mass,parts=[];
 const add=(p,frac)=>parts.push([p,frac*m]);
 add(R.head,MASS.head);
 add(spineFrame(R,40).c,MASS.upperTrunk);add(spineFrame(R,20).c,MASS.midTrunk);add(spineFrame(R,2).c,MASS.lowerTrunk);
 for(const s of SIDES){
  add(V.mix(R['sh'+s],R['el'+s],.5772),MASS.ua);add(V.mix(R['el'+s],R['wr'+s],.4574),MASS.fa);add(V.mix(R['wr'+s],R['hand'+s],.79),MASS.hand);
  add(V.mix(R['hip'+s],R['kn'+s],.4095),MASS.th);add(V.mix(R['kn'+s],R['an'+s],.4459),MASS.sk);add(V.mix(R['heel'+s],R['toe'+s],.4415),MASS.foot);
 }
 for(const e of extra)parts.push(e);
 const M=parts.reduce((s,[,w])=>s+w,0);return{c:parts.reduce((acc,[p,w])=>V.add(acc,p,w/M),[0,0,0]),mass:M};
}

return{V,M3,Q,B,TORSO,TORSO_H,TORSO_JOINTS,LIMBS,NECK,CAPS,MASS,LIMITS,SIDES,SIGN,FLOOR,D2R,R2D,clamp,
 neutral,clone,pack,unpack,PACK,PACK_SIZE,fk,solePoints,twoBone,solveArm,solveArmWrist,setArmFromPoints,footFrame,heelFrame,solveLeg,rootRot,rootFromAxes,
 swing,swingTwist,eulerXZY,eulerYZX,spineRot,makeTrack,monotone,toCat,dirCat,catalogPose,
 profileAt,sectionAt,spineFrame,torsoPoint,torsoPointIn,torsoRow,limbAxes,limbPoint,limbPointIn,limbRow,neckPoint,surface,boundsSurface,limbSDF,torsoSDF,torsoCache,headSDF,ellipseRadius,centerOfMass,LIMB_DEF,
 handShape,footShape,footPoints,FOOT_SECTIONS,TOES,malleoli,bodyData,jointAngles};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Mannequin;
