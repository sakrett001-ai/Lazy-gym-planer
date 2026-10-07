/* Metres, Y up. A single world pose drives every camera, hand and prop. */
export const V = {
  add:(a,b,k=1)=>a.map((v,i)=>v+b[i]*k), sub:(a,b)=>a.map((v,i)=>v-b[i]),
  dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), len:a=>Math.hypot(...a),
  unit:a=>{const d=Math.hypot(...a);if(d<1e-10)throw Error('Degenerate direction');return a.map(v=>v/d);},
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  mix:(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t), distance:(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]))
};
export const DIM = Object.freeze({upperArm:.30,forearm:.27,thigh:.43,shin:.43,torso:.50,
  shoulderHalf:.19,hipHalf:.115,gripHalf:.40,palmOffset:.035,barRadius:.014,barHalf:1.10,
  plateRadius:.205,padWidth:.30,padLength:.95,padThickness:.075,floor:0});
export const VARIANTS = Object.freeze({flat:{label:'Горизонтальная',incline:0},incline:{label:'Наклон 30°',incline:30}});
export const CAMERAS = Object.freeze({
  iso:{label:'Сверху под углом',eye:[2.7,3.8,3.2]},
  oblique:{label:'Под углом',eye:[3.4,2.1,3.6]},
  side:{label:'Сбоку',eye:[4.7,1.3,.1]},
  top:{label:'Сверху',eye:[.01,5,.01]}
});
const finite = (v,label)=>{if(!Number.isFinite(v))throw Error(`${label} must be finite`);return v;};
const inUnit = (v,label)=>{finite(v,label);if(v<0||v>1)throw Error(`${label} must be in [0,1]`);return v;};
export const smooth=t=>t*t*(3-2*t);
export function solveTwoBone(root,target,a,b,preferred){
  const delta=V.sub(target,root),d=V.len(delta);
  if(d<=Math.abs(a-b)+1e-7||d>=a+b-1e-7)throw Error('Unreachable joint target');
  const axis=V.unit(delta),hint=V.sub(preferred,root);
  let bend=V.sub(hint,axis.map(v=>v*V.dot(hint,axis)));
  if(V.len(bend)<1e-8)bend=V.cross(axis,[1,0,0]);
  bend=V.unit(bend);
  const along=(a*a+d*d-b*b)/(2*d),h=Math.sqrt(a*a-along*along);
  return V.add(V.add(root,axis,along),bend,h);
}
export function boneFrame(a,b,reference){
  const z=V.unit(V.sub(b,a));let x=V.sub(reference,z.map(v=>v*V.dot(reference,z)));
  if(V.len(x)<1e-7)x=V.cross(z,[0,0,1]);
  x=V.unit(x);return {x,y:V.unit(V.cross(z,x)),z};
}
/* Cross sections of the educational torso, including its posterior surface. */
export const TORSO_RINGS = Object.freeze([
  [0,.125,.100,.100],[.10,.130,.115,.080],[.21,.135,.155,.080],
  [.31,.163,.215,.090],[.40,.182,.205,.100],[.47,.178,.140,.100],[.50,.158,.085,.100]
]);
export function torsoSection(h){
  if(h<0||h>DIM.torso)throw Error('Torso section out of bounds');
  for(let i=1;i<TORSO_RINGS.length;i++)if(h<=TORSO_RINGS[i][0]){
    const a=TORSO_RINGS[i-1],b=TORSO_RINGS[i],t=(h-a[0])/(b[0]-a[0]);
    return a.slice(1).map((v,k)=>v+(b[k+1]-v)*t);
  }
  return TORSO_RINGS.at(-1).slice(1);
}
export function torsoPoint(pose,h,x,extra=0,front=true){
  const [width,anterior,posterior]=torsoSection(h),q=Math.max(-.995,Math.min(.995,x/width));
  const d=(front?anterior:-posterior)*Math.sqrt(1-q*q)+extra;
  return V.add(V.add(V.add(pose.hip,pose.u,h),[1,0,0],x),pose.n,d);
}
export function makePose(depth,variant='flat'){
  inUnit(depth,'depth');if(!Object.hasOwn(VARIANTS,variant))throw Error('Unknown variant');
  const angle=VARIANTS[variant].incline*Math.PI/180,u=[0,Math.sin(angle),-Math.cos(angle)],n=[0,Math.cos(angle),Math.sin(angle)];
  const padTop=[0,.46,.35],hip=V.add(padTop,n,.10),shoulder=V.add(hip,u,DIM.torso);
  const p={variant,depth,u,n,hip,shoulder,head:V.add(shoulder,u,.165),joints:{},frames:{},supports:{},
    equipment:{bench:{top:padTop,u,n,width:DIM.padWidth,length:DIM.padLength,thickness:DIM.padThickness},
      seat:{center:[0,.4225,.515],size:[.30,.075,.33]}}};
  const touchHeight=variant==='flat'?.27:.40;
  const bottom=V.add(V.add(hip,u,touchHeight),n,torsoSection(touchHeight)[1]+DIM.barRadius+.003);
  const topZ=shoulder[2]+.018,reach=DIM.upperArm+DIM.forearm-.012;
  const topY=shoulder[1]+DIM.palmOffset+Math.sqrt(reach*reach-(DIM.gripHalf-DIM.shoulderHalf)**2-(topZ-shoulder[2])**2);
  p.bar=V.mix([0,topY,topZ],bottom,depth);
  p.equipment.bar={center:p.bar,axis:[1,0,0],halfLength:DIM.barHalf,radius:DIM.barRadius,plateRadius:DIM.plateRadius,plateCenters:[V.add(p.bar,[-1,0,0],.80),V.add(p.bar,[1,0,0],.80)]};
  p.equipment.rack={z:shoulder[2]-.18,halfWidth:.565,height:topY+.08,hookY:topY+.012};
  for(const [side,sign]of [['L',-1],['R',1]]){
    const sh=V.add(shoulder,[sign,0,0],DIM.shoulderHalf),grip=V.add(p.bar,[sign,0,0],DIM.gripHalf);
    const wrist=V.add(grip,[0,-1,0],DIM.palmOffset),preferred=[sign*DIM.gripHalf,wrist[1]-.27,wrist[2]-.04];
    const elbow=solveTwoBone(sh,wrist,DIM.upperArm,DIM.forearm,preferred);
    const hj=V.add(hip,[sign,0,0],DIM.hipHalf),ankle=[sign*.225,.087,.97],knee=solveTwoBone(hj,ankle,DIM.thigh,DIM.shin,[sign*.21,.37,1.1]);
    Object.assign(p.joints,{['shoulder'+side]:sh,['elbow'+side]:elbow,['wrist'+side]:wrist,['grip'+side]:grip,
      ['hip'+side]:hj,['knee'+side]:knee,['ankle'+side]:ankle});
    p.frames['upperArm'+side]=boneFrame(sh,elbow,n);p.frames['forearm'+side]=boneFrame(elbow,wrist,[1,0,0]);
    p.supports['heel'+side]=[sign*.225,0,.925];p.supports['toe'+side]=[sign*.225,0,1.13];
  }
  p.supports.pelvis=V.add(hip,n,-.10);
  p.supports.scapulaL=V.add(V.add(hip,u,.43),[-.08,0,0],1);p.supports.scapulaL=V.add(p.supports.scapulaL,n,-.10);
  p.supports.scapulaR=V.add(V.add(hip,u,.43),[.08,0,0],1);p.supports.scapulaR=V.add(p.supports.scapulaR,n,-.10);
  p.supports.head=V.add(p.head,n,-.10);
  return p;
}
export const CYCLE = Object.freeze({lower:.44,bottom:.06,press:.38,top:.12,seconds:6.8});
export function sampleCycle(progress){
  inUnit(progress,'progress');
  if(progress<CYCLE.lower)return{phase:'eccentric',label:'Опускание',depth:smooth(progress/CYCLE.lower)};
  if(progress<CYCLE.lower+CYCLE.bottom)return{phase:'holdBottom',label:'Пауза у груди',depth:1};
  if(progress<1-CYCLE.top)return{phase:'concentric',label:'Жим',depth:1-smooth((progress-CYCLE.lower-CYCLE.bottom)/CYCLE.press)};
  return{phase:'holdTop',label:'Верхняя точка',depth:0};
}
