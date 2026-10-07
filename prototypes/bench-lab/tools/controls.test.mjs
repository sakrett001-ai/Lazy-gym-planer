import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {initLab} from '../src/main.mjs';
import {makePose,sampleCycle} from '../src/model.mjs';
const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
function mount(){
  const dom=new JSDOM(html,{url:'https://sakrett001-ai.github.io/Lazy-gym-planer/motion-lab/',pretendToBeVisual:true}),w=dom.window,d=w.document;
  let scheduled=0,callback;w.requestAnimationFrame=cb=>{callback=cb;return ++scheduled;};w.cancelAnimationFrame=()=>{};
  const app=initLab(d,w,{createRenderer:doc=>({domElement:doc.createElement('canvas'),setSize(){},render(scene,camera){assert(Number.isFinite(camera.projectionMatrix.elements[0]));assert(scene.getObjectByName('bar-shaft'));},dispose(){}})});
  return{dom,w,d,app,$:id=>d.getElementById(id),tick:t=>callback(t),close(){app.destroy();dom.window.close();}};
}
test('changing camera preserves repetition position and world pose',()=>{const m=mount();try{
  m.$('progress').value=470;m.$('progress').dispatchEvent(new m.w.Event('input'));
  const before=m.app.view.rigGroups.handL.position.clone();m.$('camera').value='side';m.$('camera').dispatchEvent(new m.w.Event('change'));
  assert.equal(m.app.state.progress,.47);assert(before.equals(m.app.view.rigGroups.handL.position));assert.equal(m.$('stage').dataset.camera,'side');
}finally{m.close();}});
test('incline selector updates actual bench, pose and region emphasis at the same phase',()=>{const m=mount();try{
  m.d.querySelector('[data-progress="0.47"]').click();m.d.querySelector('[data-variant="incline"]').click();
  assert.equal(m.app.state.progress,.47);assert.equal(m.$('angle-label').textContent,'30°');
  const actual=m.app.view.rigGroups.handR.position.toArray(),expected=makePose(sampleCycle(.47).depth,'incline').joints.gripR;
  assert(actual.every((v,i)=>Math.abs(v-expected[i])<1e-8));assert.equal(m.d.querySelector('[data-variant="incline"]').getAttribute('aria-pressed'),'true');
}finally{m.close();}});
test('region isolation and toggle update drawn materials, labels and pressed state',()=>{const m=mount();try{
  m.d.querySelector('[data-progress="0.69"]').click();m.d.querySelector('[data-region="pec_clavicular"]').click();
  assert.equal(m.app.state.selected,'pec_clavicular');assert(m.$('region-detail').textContent.includes('Ключичная'));
  const upper=m.app.view.muscleMeshes.find(n=>n.userData.region==='pec_clavicular'),mid=m.app.view.muscleMeshes.find(n=>n.userData.region==='pec_sternal');assert(!upper.material.color.equals(mid.material.color));
  m.$('muscles').checked=false;m.$('muscles').dispatchEvent(new m.w.Event('change'));assert(upper.material.color.equals(mid.material.color));
  m.$('all-regions').click();assert.equal(m.app.state.selected,'all');assert.equal(m.$('all-regions').getAttribute('aria-pressed'),'true');
}finally{m.close();}});
test('playback, speed and scrub preserve explicit pause behaviour',()=>{const m=mount();try{
  assert.equal(m.app.state.playing,false);m.$('play').click();m.tick(100);m.tick(200);const normal=m.app.state.progress;
  m.$('speed').value='0.5';m.$('speed').dispatchEvent(new m.w.Event('change'));m.tick(300);assert(Math.abs((m.app.state.progress-normal)-normal*.5)<1e-7);
  m.$('progress').value=690;m.$('progress').dispatchEvent(new m.w.Event('input'));assert.equal(m.app.state.playing,false);assert.equal(m.$('phase').textContent,'Жим');assert.equal(m.$('play').textContent,'Воспроизвести');
}finally{m.close();}});
test('hidden page pauses animation',()=>{const m=mount();try{
  m.$('play').click();Object.defineProperty(m.d,'hidden',{value:true,configurable:true});m.d.dispatchEvent(new m.w.Event('visibilitychange'));assert.equal(m.app.state.playing,false);
}finally{m.close();}});
