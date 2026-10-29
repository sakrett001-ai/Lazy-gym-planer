import * as THREE from 'three';
import {createCatalogScene,world,CAMERA_SETTINGS} from './scene.mjs';
import {phaseMemory} from './muscles.mjs';
import {PERSPECTIVE_FOV,FRAME_PAD,PRESET_MS,KEY_MS,KEY_YAW,KEY_PITCH,KEY_ZOOM,frameCollector,validFrame,presetView,presetAngles,cameraPose,viewLimits,rotateView,panView,zoomView,blendView,sameAngles,sameView,dragAngle} from './orbit.mjs';
import {attachOrbit} from './controls.mjs';

let rendererUnavailable=false;
/* Слабая графика: если кадры анимации идут реже ~20 в секунду, тени выключаются — до конца сеанса и для следующих фигур. */
let lowPower=false;
const PACE_SAMPLES=40,PACE_LIMIT=48;

/* Рендереры переиспользуются. Новый WebGL-контекст и сборка шейдеров — самая дорогая часть открытия разбора и смены
   ракурса (≈0,2 с на компьютере, втрое дольше на слабом телефоне). Закрытая фигура отдаёт рендерер в запас: геометрия
   и текстуры освобождаются сразу, а материалы — после первого кадра следующей фигуры на этом рендерере. Тогда её
   такие же материалы берут уже собранные программы: кеш программ three.js держит программу, пока на неё ссылается
   хоть один материал. В запасе не больше трёх рендереров (разбор в два ракурса и тренировка). */
const SPARE_LIMIT=3,spare=[],attributes={antialias:true,alpha:false,powerPreference:'low-power'};
function dropRenderer(slot){try{slot.release?.();}catch(e){}slot.renderer.dispose?.();slot.renderer.forceContextLoss?.();}
function takeRenderer(){
 while(spare.length){const slot=spare.pop();if(!slot.renderer.getContext?.()?.isContextLost?.())return slot;dropRenderer(slot);}
 const canvas=document.createElement('canvas');let renderer=null,context=null;
 try{context=canvas.getContext('webgl2',attributes);if(context){renderer=new THREE.WebGLRenderer({canvas,context,...attributes});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));}}catch(e){renderer=null;}
 if(!renderer){context?.getExtension('WEBGL_lose_context')?.loseContext();return null;}
 return{renderer,canvas,release:null};
}
function spareRenderer(slot){if(spare.length>=SPARE_LIMIT)dropRenderer(slot);else spare.push(slot);}

/* Рамка всех фаз по всем ракурсам считается один раз на упражнение и набор видимого инвентаря и хранится между
   запусками (localStorage), пока не сменится сборка — как рамки карточек (PODHOD_BUILD). 13 положений вместо 25:
   по всем 146 упражнениям и пяти ракурсам кадр сдвигается не больше чем на 0,4 % своего размера, а тело и инвентарь
   всех 25 прежних положений остаются в кадре (сверка 4.24.0, tools/volume-lifecycle.test.js); первое открытие
   упражнения вдвое короче. */
const FIT_STEPS=12;
const fittedBounds=new Map(),BOUNDS_STORE='podhod.volume-bounds.v1',BOUNDS_LIMIT=256;
let boundsLoaded=false,boundsSave=0;
const boundsBuild=()=>window.PODHOD_BUILD||null;
function hashText(s){let h1=0x811c9dc5,h2=0x01000193;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,0x01000193);h2=Math.imul(h2^c,0x5bd1e995)^(h2>>>15);}return(h1>>>0).toString(36)+(h2>>>0).toString(36);}
/* _view — рамка свободной камеры (orbit.mjs: коробка движения и кадры предустановок с перспективой) */
const boundsValid=b=>b&&typeof b==='object'&&Object.entries(b).every(([k,e])=>k==='_view'||e&&['minX','maxX','minY','maxY'].every(k=>Number.isFinite(e[k])));
function boundsGet(key){
 if(!boundsLoaded){
  boundsLoaded=true;
  try{const saved=JSON.parse(localStorage.getItem(BOUNDS_STORE)||'null');if(saved&&saved.build&&saved.build===boundsBuild())for(const[k,v]of Object.entries(saved.bounds||{}))if(!fittedBounds.has(k)&&boundsValid(v))fittedBounds.set(k,v);}catch(e){}
 }
 return fittedBounds.get(key)||null;
}
function boundsSet(key,value){
 fittedBounds.delete(key);fittedBounds.set(key,value);
 while(fittedBounds.size>BOUNDS_LIMIT)fittedBounds.delete(fittedBounds.keys().next().value);
 if(!boundsBuild())return;clearTimeout(boundsSave);
 boundsSave=setTimeout(()=>{try{localStorage.setItem(BOUNDS_STORE,JSON.stringify({build:boundsBuild(),bounds:Object.fromEntries(fittedBounds)}));}catch(e){}},1500);
}
const round4=v=>Math.round(v*1e4)/1e4;
const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
const calm=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* настройки свободной камеры — при первой фигуре (верх модуля не трогает импорты: проверки на заглушках их подменяют) */
let viewSettings=null;
const viewOptions=()=>viewSettings||(viewSettings={fov:PERSPECTIVE_FOV,pad:FRAME_PAD,settings:CAMERA_SETTINGS});

/* Память матриц костей по фазе: кадры с той же фазой t (часы карточек и экрана тренировки идут по сетке ≈30 кадров
   в секунду) со второго круга повторения не раскладывают скелет заново — ≈5 КБ на кадр (102 кости × 12 чисел), а
   лопатка с поднятой рукой стоит до 5 мс процессора на кадр (втрое больше на бюджетном телефоне). Не больше BONE_FRAMES
   фаз: первые уходят первыми. Матрицы — те же, что посчитал бы scene.apply (data.boneFrames). */
const BONE_FRAMES=240;let boneMisses=0;
function memoBones(memo,sk,t,d){
 if(!sk||!d.body||!globalThis.Skeleton?.frames)return;
 if(memo.data!==sk){memo.map.clear();memo.data=sk;}
 let fr=memo.map.get(t);
 if(!fr){boneMisses++;fr=globalThis.Skeleton.frames(d.pose,d.body,sk.bones);if(memo.map.size>=BONE_FRAMES)memo.map.delete(memo.map.keys().next().value);memo.map.set(t,fr);}
 d.boneFrames=fr;
}
export function createVolumeFigure(options){
 if(rendererUnavailable)return null;
 if(typeof window.WebGL2RenderingContext==='undefined'){rendererUnavailable=true;return null;}
 const root=document.createElement('div');root.className='fig volume-figure';root.setAttribute('role','img');root.setAttribute('aria-label',options.label);root.dataset.camera=options.camera||'above';
 const slot=takeRenderer();
 if(!slot){rendererUnavailable=true;return null;}root.dataset.renderer='webgl';
 const{renderer,canvas}=slot,releasePrevious=slot.release,VIEW=viewOptions();slot.release=null;
 /* lean — кадр для костей и мышц: области манекена тогда скрыты, их поверхности не считаются */
 const data=(t,index,lean=false)=>options.data(t,index,false,lean),initial=data(0,0);
 const scene=createCatalogScene(initial),cameras=scene.cameras;root.append(renderer.domElement);let disposed=false,lastT=options.t||0,lastIndex=0,camera=options.camera||'above',selected='all',muscles=options.muscles!==false,joints=!!options.joints,stress=options.stress!==false,skeleton=null,anatomy=null;
 if(!cameras[camera])throw Error('Unknown volume camera '+camera);
 let updateVectors=()=>{};
 /* options.memoBones — фигура, которой показывают одно и то же повторение по сетке фаз (экран тренировки): матрицы костей — из памяти */
 const bonesMemo=options.memoBones?{map:new Map(),data:null}:null;
 /* кожа Anny (вид «Манекен», src/js/09bs-anny.js): данные грузятся при первом кадре фигуры без костей и мышц; пришли — кадр
    заново (до того и при ошибке — процедурная кожа) */
 let annyAsked=false;
 const wantAnny=()=>{
  const A=globalThis.AnnySkin;if(annyAsked||!A||A.data||skeleton||anatomy)return;annyAsked=true;
  A.load().then(()=>{if(!disposed&&!skeleton&&!anatomy)at(lastT,{index:lastIndex});},()=>{});
 };
 const apply=(t,index)=>{const d=data(t,index,!!(skeleton||anatomy));if(bonesMemo)memoBones(bonesMemo,anatomy?.skeleton||skeleton,t,d);scene.apply(d,{color:options.color,selected,muscles,joints,stress,skeleton,anatomy});updateVectors(t,index,d.pose);wantAnny();};
 const trace=new THREE.Line(new THREE.BufferGeometry().setFromPoints(options.trace.map(p=>new THREE.Vector3(...world(p)))),new THREE.LineBasicMaterial({color:'#b4c3d9',transparent:true,opacity:.7}));trace.visible=false;scene.scene.add(trace);
 const vectors=new THREE.Group();vectors.name='movement-vectors';vectors.visible=false;scene.scene.add(vectors);
 for(const v of options.vectors){const a=new THREE.Vector3(...world(v.a)),b=new THREE.Vector3(...world(v.b)),d=b.clone().sub(a);vectors.add(new THREE.ArrowHelper(d.clone().normalize(),a,d.length(),/^(sh|hip)$/.test(v.key)?0x77a9d3:0xe97155,.075,.035));}
 updateVectors=(t,index,pose)=>{options.vectors.forEach((v,i)=>{const q=options.vectorFrame?options.vectorFrame(v,t,index,pose):v,arrow=vectors.children[i];arrow.visible=!!q;if(!q)return;const a=new THREE.Vector3(...world(q.a)),b=new THREE.Vector3(...world(q.b)),d=b.sub(a);arrow.position.copy(a);arrow.setDirection(d.clone().normalize());arrow.setLength(d.length(),.06,.03);});vectors.updateMatrixWorld(true);};
 // Camera changes reuse the full-motion fit for this exercise/equipment combination.
 /* та же выборка поз даёт и рамку свободной камеры (_view, orbit.mjs): коробку движения и кадры предустановок с перспективой */
 const fitKey=initial.exerciseId+'|'+hashText(JSON.stringify([initial.props,options.vectors])),savedBounds=boundsGet(fitKey);
 let fit=null;
 if(savedBounds&&Object.keys(scene.bounds).every(key=>savedBounds[key])&&validFrame(savedBounds._view,VIEW)){for(const key of Object.keys(scene.bounds))Object.assign(scene.bounds[key],savedBounds[key]);fit=savedBounds._view;}
 else{
  const collect=frameCollector(CAMERA_SETTINGS,VIEW);
  for(let i=0;i<=FIT_STEPS;i++){apply(i/FIT_STEPS,0);scene.includeBounds(undefined,collect.add);}
  fit=collect.data();
  boundsSet(fitKey,{...Object.fromEntries(Object.entries(scene.bounds).map(([key,e])=>[key,{minX:round4(e.minX),maxX:round4(e.maxX),minY:round4(e.minY),maxY:round4(e.maxY)}])),...(fit?{_view:fit}:{})});
 }
 apply(lastT,0);scene.studio?.(renderer);if(lowPower)scene.setShadows?.(false);
 /* замер скорости (?perf, src/js/19-perf-panel.js): обёртки вызовов этой фигуры; выключенный — одна проверка при создании */
 globalThis.GymPerf?.volume({scene,renderer,options,root,low:()=>lowPower});
 const pace=[];let lastAt=0;
 function watchPace(){
  const now=typeof performance!=='undefined'?performance.now():Date.now(),dt=now-lastAt;lastAt=now;if(lowPower||!(dt>0&&dt<200))return;
  pace.push(dt);if(pace.length<PACE_SAMPLES)return;
  const median=pace.sort((a,b)=>a-b)[pace.length>>1];pace.length=0;
  if(median>PACE_LIMIT){lowPower=true;scene.setShadows?.(false);root.dataset.quality='low';}
 }
 /* Свободная камера (options.interactive — разбор и экран тренировки): своя камера у фигуры, жесты на сцене (controls.mjs),
    математика — orbit.mjs. Карточки, атлас и листы — по-прежнему ортографические камеры сцены (scene.cameras). Жест меняет
    только камеру: поза и сцена не пересчитываются, кадр рисуется не чаще раза на requestAnimationFrame — и только если
    в этом кадре его ещё не нарисовал проигрыватель (at). */
 const orbit=options.interactive&&fit?{cam:PERSPECTIVE_FOV>0?new THREE.PerspectiveCamera(PERSPECTIVE_FOV,1,.05,40):new THREE.OrthographicCamera(-1,1,1,-1,.01,40),
  aspect:options.ratio||1.15,v:null,go:null,free:false,user:false,basis:new THREE.Matrix4(),R:new THREE.Vector3(),U:new THREE.Vector3(),B:new THREE.Vector3()}:null;
 let pending=0,dirty=false,drawnAt=-1;
 const presetOf=key=>presetView(fit,key,orbit.aspect,VIEW);
 if(orbit){orbit.v=presetOf(camera);root.dataset.orbit='';root.dataset.free='0';root.tabIndex=0;}
 /* положение камеры сейчас: во время перехода — по времени кадра; переход дошёл — он закончен */
 function viewNow(){
  const g=orbit.go;if(!g)return orbit.v;
  const u=(clock()-g.t0)/g.ms;if(u<1)return blendView(g.from,g.to,u);
  orbit.v=g.to;orbit.go=null;return orbit.v;
 }
 /* жест или клавиша: переход останавливается там, где камера сейчас */
 function settle(){if(orbit?.go){orbit.v=viewNow();orbit.go=null;}}
 function placeCamera(){
  const v=viewNow(),p=cameraPose(fit,v,orbit.aspect,VIEW),c=orbit.cam;
  c.position.fromArray(p.position);c.quaternion.setFromRotationMatrix(orbit.basis.makeBasis(orbit.R.fromArray(p.right),orbit.U.fromArray(p.up),orbit.B.fromArray(p.back)));
  if(c.isPerspectiveCamera){c.fov=p.fov;c.aspect=orbit.aspect;}else{c.left=-p.half[0];c.right=p.half[0];c.top=p.half[1];c.bottom=-p.half[1];}
  c.near=p.near;c.far=p.far;c.zoom=p.zoom;c.updateProjectionMatrix();
 }
 function draw(){
  if(disposed)return;dirty=false;drawnAt=clock();
  if(orbit){placeCamera();if(orbit.go)schedule();}
  renderer.render(scene.scene,orbit?orbit.cam:cameras[camera]);
 }
 /* кадр по запросу камеры: не рисуется, если проигрыватель уже нарисовал этот кадр (drawnAt — после метки кадра) */
 function schedule(){if(!disposed&&!pending&&typeof requestAnimationFrame==='function')pending=requestAnimationFrame(tick);}
 function tick(ts){pending=0;if(disposed)return;if(dirty||(orbit?.go&&drawnAt<ts))draw();else if(orbit?.go)schedule();}
 function changed(){dirty=true;schedule();}
 /* ракурс свободный — углы ушли от нажатой предустановки; подпись и кнопки ракурсов — у приложения (options.onCamera) */
 function checkFree(){
  const v=orbit.go?orbit.go.to:orbit.v,free=!sameAngles(v,presetAngles(CAMERA_SETTINGS,camera));
  if(free===orbit.free)return;orbit.free=free;root.dataset.free=free?'1':'0';try{options.onCamera?.({camera,free});}catch(e){console.error(e);}
 }
 const limits=v=>viewLimits(fit,v,orbit.aspect,VIEW);
 function input(next){
  if(disposed||!orbit)return false;settle();const v=orbit.v,n=next(v);if(n===v||sameView(n,v))return false;
  orbit.v=n;orbit.user=true;checkFree();changed();try{options.onGesture?.();}catch(e){}return true;
 }
 /* к положению to за ms (уменьшение движения в системе — сразу) */
 function glide(to,ms){
  settle();if(ms>0&&!calm())orbit.go={from:orbit.v,to,t0:clock(),ms};else orbit.v=to;
  checkFree();changed();
 }
 const size=()=>{const r=root.getBoundingClientRect();return[Math.max(1,r.width),Math.max(1,r.height)];};
 const detach=orbit?attachOrbit(root,{
  start:settle,
  rotate:(dx,dy)=>{const[w]=size();return input(v=>rotateView(v,dragAngle(dx,w),dragAngle(dy,w)*.8,limits(v)));},
  pan:(dx,dy)=>{const[w,h]=size();return input(v=>panView(v,2*dx/w,-2*dy/h,orbit.aspect,limits(v)));},
  zoom:(f,x,y)=>{const[w,h]=size();return input(v=>zoomView(v,f,2*x/w-1,1-2*y/h,orbit.aspect,limits(v)));},
  reset:()=>{reset();try{options.onGesture?.();}catch(e){}},
  key(a){
   if(a==='reset'){reset();return;}
   settle();const v=orbit.v,lim=limits(v),D=Math.PI/180;
   const n=a==='left'||a==='right'?rotateView(v,(a==='left'?-1:1)*KEY_YAW*D,0,lim):a==='up'||a==='down'?rotateView(v,0,(a==='down'?1:-1)*KEY_PITCH*D,lim):zoomView(v,a==='in'?KEY_ZOOM:1/KEY_ZOOM,0,0,orbit.aspect,lim);
   if(sameView(n,v))return;orbit.user=true;glide(n,KEY_MS);try{options.onGesture?.();}catch(e){}
  }
 }):null;
 function reset(){if(!orbit||disposed)return;orbit.user=false;glide(presetOf(camera),PRESET_MS);}
 function resize(){
  if(disposed)return;const rect=root.getBoundingClientRect(),w=Math.max(1,Math.min(1100,rect.width||620)),h=Math.max(1,Math.round(rect.height||w/(options.ratio||1.15)));renderer.setSize(w,h);scene.resize(w,h);
  /* кадр предустановки зависит от пропорций сцены; повёрнутая или приближенная вручную камера остаётся как есть */
  if(orbit){orbit.aspect=w/h;if(!orbit.user){const to=presetOf(camera);if(orbit.go)orbit.go.to=to;else orbit.v=to;}}
  draw();
 }
 function at(t,frame){if(disposed)return;lastT=t;lastIndex=frame?.index||0;apply(t,lastIndex);root.dataset.pose=String(t);root.dataset.phase=String(lastIndex);draw();watchPace();}
 // Three restores its GPU resources first; paused views also need a fresh frame.
 const restore=()=>{if(!disposed){apply(lastT,lastIndex);resize();}};
 canvas.addEventListener('webglcontextrestored',restore);
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(root);resize();
 const setMuscles=show=>{muscles=!!show;at(lastT,{index:lastIndex});};
 const setRegion=id=>{selected=id;at(lastT,{index:lastIndex});};
 const setJoints=show=>{joints=!!show;at(lastT,{index:lastIndex});};
 const setStress=show=>{stress=!!show;at(lastT,{index:lastIndex});};
 /* кости (данные Skeleton.load()) или null — выключить */
 const setSkeleton=data=>{skeleton=data||null;root.dataset.skeleton=skeleton?'on':'off';at(lastT,{index:lastIndex});};
 /* мышцы: {skeleton, muscles (Muscles.load()), level: {группа: 0..1}} или null — выключить */
 const setAnatomy=data=>{anatomy=data||null;root.dataset.anatomy=anatomy?'on':'off';at(lastT,{index:lastIndex});};
 /* вид фигуры одним кадром: кости и мышцы (или null) */
 const setLayers=(bones,body)=>{skeleton=bones||null;anatomy=body||null;root.dataset.skeleton=skeleton?'on':'off';root.dataset.anatomy=anatomy?'on':'off';at(lastT,{index:lastIndex});};
 at(lastT,{index:lastIndex});
 /* первый кадр нарисован: материалы прежней фигуры на этом рендерере больше не держат программы */
 try{releasePrevious?.();}catch(e){}
 /* смена ракурса без новой сцены: рамки всех камер уже посчитаны, поза та же. Свободная камера переходит к предустановке
    плавно (PRESET_MS; при уменьшении движения — сразу), {instant:true} — сразу */
 const setCamera=(key,how={})=>{
  if(disposed||!cameras[key])return false;camera=key;root.dataset.camera=key;
  if(!orbit){draw();return true;}
  orbit.user=false;glide(presetOf(key),how.instant?0:PRESET_MS);return true;
 };
 return{svg:root,at,get camera(){return camera;},setCamera,setMuscles,setRegion,setJoints,setStress,setSkeleton,setAnatomy,setLayers,setTrace(show){trace.visible=!!show;draw();},setVectors(show){vectors.visible=!!show;draw();},
  /* свободная камера: есть ли она, повёрнута ли вручную, вернуть предустановку, положение (для проверок) */
  get orbit(){return !!orbit;},get free(){return !!orbit?.free;},resetCamera:reset,cameraState:()=>orbit?{...viewNow(),aspect:orbit.aspect,free:orbit.free,moving:!!orbit.go,camera}:null,
  dispose(){if(disposed)return;disposed=true;if(pending&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(pending);pending=0;detach?.();canvas.removeEventListener('webglcontextrestored',restore);observer?.disconnect();scene.disposeGeometry();slot.release=scene.disposeMaterials;spareRenderer(slot);}};
}

/* ---------- Карточки плана: один общий рендерер вне экрана (вид «Анатомия», этап 2) ----------
   WebGL-контекстов в браузере мало (8–16), а карточек в плане 3–10 (за неделю больше), поэтому своего рендерера у
   карточки нет. Один рендерер с холстом вне страницы рисует кадр нужной карточки и сразу, в той же задаче, копирует его
   в её холст 2D (drawImage; буфер кадра цел до конца задачи — preserveDrawingBuffer не нужен). Холст карточки и хранит
   картинку: неподвижная карточка больше ничего не считает, а потеря контекста WebGL картинку не стирает.
   Сцены упражнений — общий запас по ключу «упражнение, видимый инвентарь»: карточки одного упражнения рисуются из одной
   сцены, и поза кадра (кости, пути и тела мышц) считается один раз на фазу, а не на карточку. В запасе не больше
   CARD_SCENES сцен (анимируемые карточки и одна под неподвижные кадры); давняя сцена освобождается: геометрия — сразу,
   материалы — после кадра следующей сцены, как у фигур разбора (собранные программы шейдеров переходят к ней).
   Рамка карточки — по телу (fit:'body'): в маленьком кадре человек крупнее, тренажёр может уйти за край.
   Миниатюры витрины атласа (этап 3, 13e-gallery-anatomy.js) — неподвижный кадр одной фазы (still:true): рамка — по
   показанной позе (как у SVG-миниатюр), а не по 13 положениям повторения; она считается после самого кадра, без
   лишних расчётов позы, и не пишется в общую память рамок (в ней — рамки карточек и разбора). Сцену такой фигуры
   можно собрать заранее, отдельной задачей (prepare), — тогда кадр (поза, кости, мышцы, отрисовка) идёт следующей.
   Теней нет (CARD_SHADOWS): в кадре 130–200 px их почти не видно, а проход тени — ещё одна отрисовка всех костей. */
const CARD_SCENES=3,CARD_SHADOWS=false,CARD_PAD=1.1;
function createCardStage(){
 let slot=null,width=0,height=0,renders=0,builds=0;const scenes=new Map(),afterRender=[],timing={apply:0,render:0,copy:0};
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function drop(){
  for(const e of scenes.values())disposeEntry(e,true);scenes.clear();
  for(const f of afterRender.splice(0))try{f();}catch(e){}
  if(slot){slot.canvas.removeEventListener('webglcontextrestored',restored);dropRenderer(slot);slot=null;}width=height=0;
 }
 /* контекст вернулся: сцены собираются заново по требованию (картинки карточек остались в их холстах) */
 function restored(){for(const e of scenes.values())disposeEntry(e,true);scenes.clear();width=height=0;}
 function ensure(){
  if(slot)return slot;
  if(rendererUnavailable)return null;
  if(typeof window.WebGL2RenderingContext==='undefined'){rendererUnavailable=true;return null;}
  const canvas=document.createElement('canvas');let renderer=null,context=null;
  try{context=canvas.getContext('webgl2',attributes);if(context){renderer=new THREE.WebGLRenderer({canvas,context,...attributes});renderer.setPixelRatio(1);}}catch(e){renderer=null;}
  if(!renderer){context?.getExtension?.('WEBGL_lose_context')?.loseContext();rendererUnavailable=true;return null;}
  slot={renderer,canvas,release:null};canvas.addEventListener('webglcontextrestored',restored);return slot;
 }
 function build(key,options){
  const data=(t,index,lean)=>options.data(t,index,false,lean),initial=data(0,0,true),scene=createCatalogScene(initial);
  const fit=options.fit==='body'?'body':'all',still=!!options.still,fitKey=initial.exerciseId+'|'+hashText(JSON.stringify([initial.props,[]]))+'|'+fit,saved=still?null:boundsGet(fitKey);
  if(still){/* рамка неподвижного кадра — по нему самому, при отрисовке (paint) */}
  else if(saved&&Object.keys(scene.bounds).every(k=>saved[k]))for(const k of Object.keys(scene.bounds))Object.assign(scene.bounds[k],saved[k]);
  else{
   /* рамка по телу: поза без областей манекена (lean) — их поверхности для рамки не нужны */
   for(let i=0;i<=FIT_STEPS;i++){scene.apply(data(i/FIT_STEPS,0,true),{color:options.color});scene.includeBounds(fit==='body'?'body':undefined);}
   boundsSet(fitKey,Object.fromEntries(Object.entries(scene.bounds).map(([k,e])=>[k,{minX:round4(e.minX),maxX:round4(e.maxX),minY:round4(e.minY),maxY:round4(e.maxY)}])));
  }
  scene.studio?.(slot.renderer);if(!CARD_SHADOWS)scene.setShadows?.(false);builds++;
  /* замер скорости (?perf, src/js/19-perf-panel.js): обёртки вызовов этой сцены и общего рендерера (card — не трогать
     признак облегчённого режима фигур разбора); выключенный — одна проверка на сборку сцены */
  globalThis.GymPerf?.volume({scene,renderer:slot.renderer,options,root:null,card:true});
  return{key,scene,data,color:options.color,applied:null,aspect:0,bones:{map:new Map(),data:null},still,fit,framed:null};
 }
 function disposeEntry(e,now){try{e.scene.disposeGeometry();}catch(x){}if(now)try{e.scene.disposeMaterials();}catch(x){}else afterRender.push(e.scene.disposeMaterials);}
 function entry(key,options){
  let e=scenes.get(key);
  if(e){scenes.delete(key);scenes.set(key,e);return e;}
  e=build(key,options);scenes.set(key,e);
  for(const[k,old]of scenes){if(scenes.size<=CARD_SCENES)break;if(old===e)continue;scenes.delete(k);disposeEntry(old,false);}
  return e;
 }
 /* фигура карточки: ключ сцены, данные кадра и свой вид (кости, мышцы, цвет по фазам, метки нагрузки) */
 function figure(options){
  let bones=null,body=null,muscles=options.muscles!==false,stress=options.stress!==false,released=false;
  const layerKey=()=>(bones?'b':'')+(body?'a'+Object.entries(body.level||{}).map(([k,v])=>k+v).join(','):'')+(muscles?'m':'')+(stress?'s':'');
  return{key:options.key,
   setLayers(b,a){bones=b||null;body=a||null;},
   setLook(o){if('muscles'in o)muscles=!!o.muscles;if('stress'in o)stress=!!o.stress;},
   /* кадр фазы (t, index) ракурсом camera — в холст target (размер — его width × height в точках экрана); false — не нарисован */
   paint(target,t,index,camera='above'){
    if(released||!target?.width||!target?.height)return false;
    const s=ensure();if(!s)return false;
    if(s.renderer.getContext?.()?.isContextLost?.())return false;
    const e=entry(options.key,options),cam=e.scene.cameras[camera]||e.scene.cameras.above;
    if(width!==target.width||height!==target.height){width=target.width;height=target.height;s.renderer.setSize(width,height,false);}
    if(!e.still&&e.aspect!==width/height){e.aspect=width/height;e.scene.resize(width,height,CARD_PAD);}
    const k=t+'|'+(index||0)+'|'+layerKey(),t0=now();
    if(e.applied!==k){
     const d=e.data(t,index||0,!!(bones||body));
     /* матрицы костей фазы — из памяти сцены (memoBones): часы карточки идут по сетке кадров */
     memoBones(e.bones,body?.skeleton||bones,t,d);
     e.scene.apply(d,{color:e.color,selected:'all',muscles,joints:false,stress,skeleton:bones,anatomy:body});e.applied=k;
    }
    /* неподвижный кадр: рамка — по показанной позе (тело или всё в кадре), один раз на фазу и размер */
    const fk=k+'|'+width/height;
    if(e.still&&e.framed!==fk){
     for(const b of Object.values(e.scene.bounds))Object.assign(b,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});
     e.scene.includeBounds(e.fit==='body'?'body':undefined);e.scene.resize(width,height,CARD_PAD);e.framed=fk;e.aspect=width/height;
    }
    const t1=now();s.renderer.render(e.scene.scene,cam);renders++;
    const t2=now(),g=target.getContext('2d');if(!g)return false;g.drawImage(s.canvas,0,0,width,height);
    /* время частей последнего кадра (мс): поза и сцена, отрисовка, копия в холст карточки — для замеров */
    timing.apply=t1-t0;timing.render=t2-t1;timing.copy=now()-t2;
    /* панель замера: весь кадр карточки и копия в её холст (части кадра пишут обёртки сцены); миниатюры витрины
       панель считает сама (13e-gallery-anatomy.js) */
    const pf=globalThis.GymPerf;if(pf&&!e.still)pf.card?.(timing.apply+timing.render+timing.copy,timing.copy);
    for(const f of afterRender.splice(0))try{f();}catch(x){}
    return true;
   },
   /* сцена упражнения — заранее, отдельной задачей (витрина: сборка сцены и кадр — две задачи покороче вместо одной
      длинной); true — сцена готова (собрана сейчас или уже была), false — рисовать нечем */
   prepare(){
    if(released)return false;const s=ensure();if(!s||s.renderer.getContext?.()?.isContextLost?.())return false;
    entry(options.key,options);return true;
   },
   /* сцена этой фигуры больше не нужна (миниатюра витрины нарисована: её упражнение второй раз не рисуется) — отпустить
      сразу, не дожидаясь вытеснения: геометрия — сейчас, материалы — после следующего кадра (собранные программы шейдеров
      переходят к следующей сцене); фигура отпускается */
   forget(){released=true;const e=scenes.get(options.key);if(e){scenes.delete(options.key);disposeEntry(e,false);}},
   release(){released=true;}};
 }
 /* builds — сколько сцен собрано: кадр со сборкой сцены не годится для замера скорости (12-motion-player.js) */
 return{figure,dispose:drop,stats:()=>({scenes:scenes.size,renders,builds,context:!!slot,size:[width,height],timing:{...timing}}),get builds(){return builds;},get available(){return !rendererUnavailable;}};
}
let cardStage=null;
/* общий рендерер карточек — один на страницу; null — объёмной графики нет (тогда карточки — SVG-манекен) */
function cards(){
 if(!rendererUnavailable&&typeof window.WebGL2RenderingContext==='undefined')rendererUnavailable=true;
 if(rendererUnavailable)return null;if(!cardStage)cardStage=createCardStage();return cardStage;
}
/* boneMisses — сколько раз скелет раскладывался заново или кожа мышц считалась без памяти по фазе (кадр «с холодной памятью»:
   его время — не мерило скорости устройства; первое повторение в «Анатомии» дороже) */
window.GymVolume={create:createVolumeFigure,cards,get boneMisses(){return boneMisses+phaseMemory().misses;}};
