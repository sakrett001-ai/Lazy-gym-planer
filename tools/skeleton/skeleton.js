/* Прототип: раскладка костей MyoSim по рамкам манекена. Вход — каталожная поза R (см, Y вниз) и данные тела (кисти).
   Возвращает для каждой кости мировые координаты вершин (каталог). */
(function(root){
const M=(typeof Mannequin!=='undefined')?Mannequin:require('../../src/js/09bm-mannequin.js');
const {V}=M, SIGN={L:1,R:-1};
const lin=(F,p)=>[F.o[0]+F.x[0]*p[0]+F.y[0]*p[1]+F.z[0]*p[2],F.o[1]+F.x[1]*p[0]+F.y[1]*p[1]+F.z[1]*p[2],F.o[2]+F.x[2]*p[0]+F.y[2]*p[1]+F.z[2]*p[2]];
function rotAxis(v,k,a){const c=Math.cos(a),s=Math.sin(a),d=V.dot(k,v),x=V.cross(k,v);return[v[0]*c+x[0]*s+k[0]*d*(1-c),v[1]*c+x[1]*s+k[1]*d*(1-c),v[2]*c+x[2]*s+k[2]*d*(1-c)];}
function minRot(a,b){a=V.unit(a);b=V.unit(b);const k=V.cross(a,b),s=V.len(k);if(s<1e-9)return v=>v;const ax=V.scale(k,1/s),ang=Math.atan2(s,V.dot(a,b));return v=>rotAxis(v,ax,ang);}
const signedAngle=(a,b,axis)=>Math.atan2(V.dot(V.cross(a,b),axis),V.dot(a,b));
function girdleFrame(R,s){
 const T=R.frames.thorax,g=SIGN[s],sc=lin(T,[g*2,23.5,4]),n0=V.sub(lin(T,[g*16,-1.9,-4]),T.o),d=V.sub(R.girdle[s],sc),r=minRot(n0,d);
 return{o:sc,x:r(T.x),y:r(T.y),z:r(T.z)};
}
function pointAt(pts,s){let acc=0;for(let i=1;i<pts.length;i++){const l=V.dist(pts[i-1],pts[i]);if(acc+l>=s||i===pts.length-1){const u=l<1e-9?0:Math.min(1,(s-acc)/l);return V.mix(pts[i-1],pts[i],u);}acc+=l;}return pts.at(-1);}
function chainJoints(pts,fr){const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+V.dist(pts[i-1],pts[i]));return fr.map(f=>pointAt(pts,f*L.at(-1)));}
function place(R,body,bones,opts={}){
 const out=[],cache={},st=opts.fingerScale??.9;
 for(const b of bones){
  const s=b.side,g=SIGN[s]||1,v=b.v,n=v.length/3,P=new Float32Array(v.length);
  let map;
  if(b.seg==='spine'){const f=M.spineFrame(R,b.h);const F={o:f.c,x:f.x,y:f.y,z:f.z};map=p=>lin(F,p);}
  else if(b.seg==='girdle'){const F=cache['g'+s]||(cache['g'+s]=girdleFrame(R,s));map=p=>lin(F,p);}
  else if(b.name==='radius'){
   const fa=R.frames['fa'+s],fd=R.frames['fd'+s],phi=signedAngle(fa.z,fd.z,fa.y),[rh,w]=b.pivot,ax=V.unit(V.sub(rh,w));
   map=p=>lin(fa,V.add(w,rotAxis(V.sub(p,w),ax,phi)));
  }else if(b.name==='patella'){
   const th=R.frames['th'+s],sk=R.frames['sk'+s],k=signedAngle(th.y,sk.y,th.x)*180/Math.PI,tr=b.track;
   let i=Math.max(0,Math.min(tr.length-2,Math.floor(k/10)));const u=Math.max(0,Math.min(1,(k-tr[i][0])/10)),row=tr[i].map((x,j)=>x+(tr[i+1][j]-x)*u);
   const a=-row[1]*Math.PI/180,o=[row[2],row[3],row[4]];map=p=>lin(th,V.add(o,rotAxis(p,[1,0,0],a)));
  }else if(b.seg==='finger'||b.seg==='thumb'){
   const H=body.hands[s],F=H.frame,sh=H.shape;let pts,fr;
   if(b.seg==='finger'){pts=sh.fingers[b.finger].pts;const len=[8.0,8.8,8.2,6.6][b.finger];const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+V.dist(pts[i-1],pts[i]));
    const tot=Math.min(len,L.at(-1)),js=[0,.47,.76,1].map(f=>pointAt(pts,f*tot));fr=[js[b.joint],js[b.joint+1]];}
   else{pts=sh.thumb.pts;const js=pts.length>=4?pts.slice(0,4):[pts[0],pts[1],V.mix(pts[1],pts[2],.55),pts[2]];fr=[js[b.joint],js[b.joint+1]];}
   const a=V.unit(V.sub(fr[1],fr[0])),L=V.dist(fr[0],fr[1]),ref=[g,0,0],dz=V.unit(V.sub(ref,V.scale(a,V.dot(ref,a)))),Y=V.scale(a,-1),X=V.cross(Y,dz),k=L/b.len;
   const loc={o:fr[0],x:X,y:Y,z:dz};map=p=>lin(F,lin(loc,[p[0]*st,p[1]*k,p[2]*st]));
  }else{
   const key=b.seg==='pelvis'||b.seg==='thorax'||b.seg==='neck'||b.seg==='head'?b.seg:b.seg+s;const F=R.frames[key];
   if(!F)throw Error('нет рамки '+key);map=p=>lin(F,p);
  }
  for(let i=0;i<n;i++){const q=map([v[3*i],v[3*i+1],v[3*i+2]]);P[3*i]=q[0];P[3*i+1]=q[1];P[3*i+2]=q[2];}
  out.push({bone:b,pos:P});
 }
 return out;
}
const api={place,girdleFrame};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Skeleton=api;
})(typeof window!=='undefined'?window:globalThis);
