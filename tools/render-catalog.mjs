import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {createCatalogScene} from '../src/volume/scene.mjs';
const require=createRequire(import.meta.url),{loadModel}=require('./biomechanics-audit.js');
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const model=loadModel(),api=model.get('({catalogVolumeData,muscleColor})'),meshMode=process.argv.includes('--mesh');
const dom=new JSDOM('<html><body></body></html>');globalThis.window=dom.window;globalThis.document=dom.window.document;
const scripts=(await fs.readdir('src/js')).filter(f=>f.endsWith('.js')&&parseInt(f)<11).sort();
dom.window.eval((await Promise.all(scripts.map(f=>fs.readFile('src/js/'+f,'utf8')))).join('\n')+'\nwindow.previewCatalog={EX,buildFigure};');
let css=(await Promise.all((await fs.readdir('src/css')).filter(f=>f.endsWith('.css')).sort().map(f=>fs.readFile('src/css/'+f,'utf8')))).join('\n');
const colors=Object.fromEntries([...css.matchAll(/--([\w-]+)\s*:\s*(#[\da-fA-F]+)/g)].map(m=>[m[1],m[2]])),resolve=s=>s.replace(/var\(--([\w-]+)\)/g,(_,k)=>colors[k]||'#8c9aad');css=resolve(css);
const renderer=new SVGRenderer();renderer.setSize(440,350);renderer.setQuality('high');renderer.setPrecision(2);
const ids=process.argv.includes('--all')?model.EX.map(e=>e.id):['bbbench','inclinebb','dbfly','latpull','dbrow','squat','kbswing','chestrowdb'];
await fs.mkdir('qa/catalog',{recursive:true});
const panels=[],labels=[];
for(const[id,i]of ids.map((id,i)=>[id,i])){
 const ex=model.EX.find(e=>e.id===id),t=ex.anim.hold?0:.7;let svg;
 if(meshMode){const data=api.catalogVolumeData(ex.anim,t,0),view=createCatalogScene(data);view.apply(data,{color:api.muscleColor,muscles:true});view.includeBounds();view.resize(440,350);renderer.render(view.scene,view.cameras.above);svg=renderer.domElement.outerHTML;view.dispose();}
 else{const ex=dom.window.previewCatalog.EX.find(e=>e.id===id),f=dom.window.previewCatalog.buildFigure(ex.anim,{label:ex.name,has:()=>true,t,camera:'above',muscles:true,ratio:440/350});f.svg.setAttribute('width','440');f.svg.setAttribute('height','350');f.svg.insertAdjacentHTML('afterbegin',`<style>${css}</style>`);svg=resolve(f.svg.outerHTML);}
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 await fs.writeFile('qa/catalog/'+id+'.png',png);panels.push({input:png,left:(i%4)*440,top:Math.floor(i/4)*395+45});labels.push(`<text x="${(i%4)*440+15}" y="${Math.floor(i/4)*395+29}">${ex.name.replaceAll('&','&amp;')}</text>`);
 if(i%10===0)console.log(`Rendered ${i+1}/${ids.length}`);
}
const h=Math.ceil(ids.length/4)*395,label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1760" height="${h}"><style>text{font:17px sans-serif;fill:#cbd7ec}</style>${labels.join('')}</svg>`);
const out=meshMode?'qa/catalog-mesh.svg.png':process.argv.includes('--all')?'qa/catalog-all.png':'docs/catalog-preview.png';
await sharp({create:{width:1760,height:h,channels:4,background:'#101722'}}).composite([...panels,{input:label,left:0,top:0}]).png().toFile(out);
console.log(out);dom.window.close();
