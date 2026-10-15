import * as THREE from 'three';
import {createCatalogScene,world} from './scene.mjs';

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
const boundsValid=b=>b&&typeof b==='object'&&Object.values(b).every(e=>e&&['minX','maxX','minY','maxY'].every(k=>Number.isFinite(e[k])));
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
 const{renderer,canvas}=slot,releasePrevious=slot.release;slot.release=null;
 /* lean — кадр для костей и мышц: области манекена тогда скрыты, их поверхности не считаются */
 const data=(t,index,lean=false)=>options.data(t,index,false,lean),initial=data(0,0);
 const scene=createCatalogScene(initial),cameras=scene.cameras;root.append(renderer.domElement);let disposed=false,lastT=options.t||0,lastIndex=0,camera=options.camera||'above',selected='all',muscles=options.muscles!==false,joints=!!options.joints,stress=options.stress!==false,skeleton=null,anatomy=null;
 if(!cameras[camera])throw Error('Unknown volume camera '+camera);
 let updateVectors=()=>{};
 /* options.memoBones — фигура, которой показывают одно и то же повторение по сетке фаз (экран тренировки): матрицы костей — из памяти */
 const bonesMemo=options.memoBones?{map:new Map(),data:null}:null;
 const apply=(t,index)=>{const d=data(t,index,!!(skeleton||anatomy));if(bonesMemo)memoBones(bonesMemo,anatomy?.skeleton||skeleton,t,d);scene.apply(d,{color:options.color,selected,muscles,joints,stress,skeleton,anatomy});updateVectors(t,index,d.pose);};
 const trace=new THREE.Line(new THREE.BufferGeometry().setFromPoints(options.trace.map(p=>new THREE.Vector3(...world(p)))),new THREE.LineBasicMaterial({color:'#b4c3d9',transparent:true,opacity:.7}));trace.visible=false;scene.scene.add(trace);
 const vectors=new THREE.Group();vectors.name='movement-vectors';vectors.visible=false;scene.scene.add(vectors);
 for(const v of options.vectors){const a=new THREE.Vector3(...world(v.a)),b=new THREE.Vector3(...world(v.b)),d=b.clone().sub(a);vectors.add(new THREE.ArrowHelper(d.clone().normalize(),a,d.length(),/^(sh|hip)$/.test(v.key)?0x77a9d3:0xe97155,.075,.035));}
 updateVectors=(t,index,pose)=>{options.vectors.forEach((v,i)=>{const q=options.vectorFrame?options.vectorFrame(v,t,index,pose):v,arrow=vectors.children[i];arrow.visible=!!q;if(!q)return;const a=new THREE.Vector3(...world(q.a)),b=new THREE.Vector3(...world(q.b)),d=b.sub(a);arrow.position.copy(a);arrow.setDirection(d.clone().normalize());arrow.setLength(d.length(),.06,.03);});vectors.updateMatrixWorld(true);};
 // Camera changes reuse the full-motion fit for this exercise/equipment combination.
 const fitKey=initial.exerciseId+'|'+hashText(JSON.stringify([initial.props,options.vectors])),savedBounds=boundsGet(fitKey);
 if(savedBounds&&Object.keys(scene.bounds).every(key=>savedBounds[key]))for(const key of Object.keys(scene.bounds))Object.assign(scene.bounds[key],savedBounds[key]);
 else{
  for(let i=0;i<=FIT_STEPS;i++){apply(i/FIT_STEPS,0);scene.includeBounds();}
  boundsSet(fitKey,Object.fromEntries(Object.entries(scene.bounds).map(([key,e])=>[key,{minX:round4(e.minX),maxX:round4(e.maxX),minY:round4(e.minY),maxY:round4(e.maxY)}])));
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
 function draw(){if(disposed)return;renderer.render(scene.scene,cameras[camera]);}
 function resize(){if(disposed)return;const rect=root.getBoundingClientRect(),w=Math.max(1,Math.min(1100,rect.width||620)),h=Math.max(1,Math.round(rect.height||w/(options.ratio||1.15)));renderer.setSize(w,h);scene.resize(w,h);draw();}
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
 /* смена ракурса без новой сцены: рамки всех камер уже посчитаны, поза та же */
 const setCamera=key=>{if(disposed||!cameras[key])return false;camera=key;root.dataset.camera=key;draw();return true;};
 return{svg:root,at,get camera(){return camera;},setCamera,setMuscles,setRegion,setJoints,setStress,setSkeleton,setAnatomy,setLayers,setTrace(show){trace.visible=!!show;draw();},setVectors(show){vectors.visible=!!show;draw();},
  dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextrestored',restore);observer?.disconnect();scene.disposeGeometry();slot.release=scene.disposeMaterials;spareRenderer(slot);}};
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
  const fit=options.fit==='body'?'body':'all',fitKey=initial.exerciseId+'|'+hashText(JSON.stringify([initial.props,[]]))+'|'+fit,saved=boundsGet(fitKey);
  if(saved&&Object.keys(scene.bounds).every(k=>saved[k]))for(const k of Object.keys(scene.bounds))Object.assign(scene.bounds[k],saved[k]);
  else{
   /* рамка по телу: поза без областей манекена (lean) — их поверхности для рамки не нужны */
   for(let i=0;i<=FIT_STEPS;i++){scene.apply(data(i/FIT_STEPS,0,true),{color:options.color});scene.includeBounds(fit==='body'?'body':undefined);}
   boundsSet(fitKey,Object.fromEntries(Object.entries(scene.bounds).map(([k,e])=>[k,{minX:round4(e.minX),maxX:round4(e.maxX),minY:round4(e.minY),maxY:round4(e.maxY)}])));
  }
  scene.studio?.(slot.renderer);if(!CARD_SHADOWS)scene.setShadows?.(false);builds++;
  return{key,scene,data,color:options.color,applied:null,aspect:0,bones:{map:new Map(),data:null}};
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
    if(e.aspect!==width/height){e.aspect=width/height;e.scene.resize(width,height,CARD_PAD);}
    const k=t+'|'+(index||0)+'|'+layerKey(),t0=now();
    if(e.applied!==k){
     const d=e.data(t,index||0,!!(bones||body));
     /* матрицы костей фазы — из памяти сцены (memoBones): часы карточки идут по сетке кадров */
     memoBones(e.bones,body?.skeleton||bones,t,d);
     e.scene.apply(d,{color:e.color,selected:'all',muscles,joints:false,stress,skeleton:bones,anatomy:body});e.applied=k;
    }
    const t1=now();s.renderer.render(e.scene.scene,cam);renders++;
    const t2=now(),g=target.getContext('2d');if(!g)return false;g.drawImage(s.canvas,0,0,width,height);
    /* время частей последнего кадра (мс): поза и сцена, отрисовка, копия в холст карточки — для замеров */
    timing.apply=t1-t0;timing.render=t2-t1;timing.copy=now()-t2;
    for(const f of afterRender.splice(0))try{f();}catch(x){}
    return true;
   },
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
/* boneMisses — сколько раз скелет раскладывался заново (кадр «с холодной памятью»: его время — не мерило скорости устройства) */
window.GymVolume={create:createVolumeFigure,cards,get boneMisses(){return boneMisses;}};
