import * as THREE from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {createScene} from './scene.mjs';
import {makePose,sampleCycle,CYCLE,CAMERAS} from './model.mjs';
import {REGIONS,muscleValues,band,color} from './muscles.mjs';

export function initLab(doc=document,win=window,{createRenderer}={}){
  const $=id=>doc.getElementById(id),stage=$('stage'),state={progress:0,variant:'flat',camera:'iso',selected:'all',muscles:true,playing:false,speed:1};
  let renderer,raf=0,previousTime=0,destroyed=false,lastFrame=0;
  const view=createScene();
  if(createRenderer)renderer=createRenderer(doc);
  else try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(win.devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();pause();$('loading').textContent='Демонстрация приостановлена. Перезагрузите страницу для восстановления.';$('loading').hidden=false;});
  }catch{
    renderer=new SVGRenderer();renderer.setQuality('low');
    const note=doc.createElement('span');note.className='fallback-note';note.textContent='Упрощённое отображение';stage.append(note);
  }
  stage.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');$('loading').hidden=true;
  const buttons=REGIONS.map(r=>{
    const b=doc.createElement('button');b.type='button';b.className='region';b.dataset.region=r.id;b.setAttribute('aria-pressed','false');
    const label=doc.createElement('span');label.className='region-name';label.textContent=r.label;
    const role=doc.createElement('span');role.className='region-role';role.textContent=r.role;
    const strength=doc.createElement('span');strength.className='region-band';
    const dot=doc.createElement('span');dot.className='region-dot';dot.setAttribute('aria-hidden','true');
    const text=doc.createElement('span');strength.append(dot,text);b.append(label,role,strength);$('region-list').append(b);
    b.addEventListener('click',()=>{state.selected=state.selected===r.id?'all':r.id;render();});return{b,r,text,dot};
  });
  const cues={
    flat:{eccentric:'Опускайте гриф к нижней части груди. Сохраняйте опору стоп и таза.',holdBottom:'Гриф у груди, предплечья близки к вертикали. Сохраните контроль без отбива.',concentric:'Жмите вверх и немного к плечам. Кисти сохраняют хват, таз остаётся на скамье.',holdTop:'Гриф над плечами. Сохраняйте опору и контроль перед следующим повторением.'},
    incline:{eccentric:'Опускайте гриф к груди. Лопатки и таз сохраняют опору на наклонной скамье.',holdBottom:'Удерживайте гриф у груди. Локти направлены вниз, хват сохраняется.',concentric:'Жмите вверх над плечами. Скамья и стопы остаются неподвижными.',holdTop:'Гриф над плечами. Наклон меняет положение корпуса и распределение работы мышц.'}
  };
  const notes={eccentric:'При опускании мышцы продолжают контролировать движение.',holdBottom:'В паузе у груди подсветка сохраняется: удержание тоже требует работы мышц.',concentric:'Области груди, передняя дельта и трицепс участвуют в жиме совместно.',holdTop:'Верхняя точка показана отдельно. Яркость остаётся непрерывной при смене фаз.'};
  function render(){
    if(destroyed)return;
    const frame=sampleCycle(state.progress),values=muscleValues(frame,state.variant),p=makePose(frame.depth,state.variant);
    view.apply(p,values,state);renderer.render(view.scene,view.cameras[state.camera]);
    $('phase').textContent=frame.label;$('progress-label').textContent=Math.round(state.progress*100)+'% повторения';
    $('progress').value=Math.round(state.progress*1000);$('progress').setAttribute('aria-valuetext',`${frame.label}, ${Math.round(state.progress*100)}% повторения`);
    $('cue').textContent=cues[state.variant][frame.phase];$('phase-note').textContent=notes[frame.phase];
    $('view-label').textContent=CAMERAS[state.camera].label;$('angle-label').textContent=state.variant==='flat'?'0°':'30°';
    $('all-regions').setAttribute('aria-pressed',String(state.selected==='all'));
    $('region-detail').textContent=state.selected==='all'?'Грудные разделены на верхнюю, среднюю и нижнюю области. Нажмите на область, чтобы выделить её.':REGIONS.find(r=>r.id===state.selected).detail;
    for(const {b,r,text,dot}of buttons){b.setAttribute('aria-pressed',String(state.selected===r.id));text.textContent=state.muscles?band(values[r.id]):'Выключено';dot.style.background=state.muscles?color(values[r.id]):'#a7b3c6';}
    stage.dataset.phase=frame.phase;stage.dataset.variant=state.variant;stage.dataset.camera=state.camera;
  }
  function resize(){const rect=stage.getBoundingClientRect(),w=Math.max(1,rect.width||720),h=Math.max(1,rect.height||500);view.resize(w,h);renderer.setSize(w,h);render();}
  function pause(){state.playing=false;win.cancelAnimationFrame(raf);raf=0;previousTime=0;$('play').textContent='Воспроизвести';$('play').setAttribute('aria-pressed','false');}
  function tick(now){
    if(!state.playing||destroyed)return;
    if(previousTime)state.progress=(state.progress+Math.min(.1,(now-previousTime)/1000)*state.speed/CYCLE.seconds)%1;
    previousTime=now;
    const fps=renderer instanceof SVGRenderer?20:40;if(now-lastFrame>=1000/fps){render();lastFrame=now;}
    raf=win.requestAnimationFrame(tick);
  }
  $('play').addEventListener('click',()=>{if(state.playing){pause();return;}state.playing=true;$('play').textContent='Пауза';$('play').setAttribute('aria-pressed','true');raf=win.requestAnimationFrame(tick);});
  $('progress').addEventListener('input',event=>{pause();state.progress=Number(event.target.value)/1000;render();});
  $('camera').addEventListener('change',event=>{state.camera=event.target.value;render();});
  $('speed').addEventListener('change',event=>{state.speed=Number(event.target.value);});
  $('muscles').addEventListener('change',event=>{state.muscles=event.target.checked;render();});
  $('all-regions').addEventListener('click',()=>{state.selected='all';render();});
  doc.querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>{
    state.variant=b.dataset.variant;doc.querySelectorAll('[data-variant]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render();resize();
  }));
  doc.querySelectorAll('[data-progress]').forEach(b=>b.addEventListener('click',()=>{pause();state.progress=Number(b.dataset.progress);render();}));
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)pause();});
  win.addEventListener('resize',resize);
  const observer=win.ResizeObserver?new win.ResizeObserver(resize):null;observer?.observe(stage);
  resize();
  return{state,view,render,pause,destroy(){pause();destroyed=true;observer?.disconnect();win.removeEventListener('resize',resize);renderer.dispose?.();view.dispose();}};
}
if(typeof document!=='undefined'&&document.getElementById('stage')){
  try{window.benchLab=initLab();}catch(error){console.error(error);document.getElementById('loading').textContent='Не удалось загрузить демонстрацию. Попробуйте обновить страницу.';document.getElementById('loading').hidden=false;}
}
