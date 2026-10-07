import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {createScene} from '../src/scene.mjs';
import {makePose} from '../src/model.mjs';
import {muscleValues} from '../src/muscles.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dom=new JSDOM('<!doctype html><html><body></body></html>');globalThis.window=dom.window;globalThis.document=dom.window.document;
const renderer=new SVGRenderer();renderer.setQuality('high');renderer.setSize(1000,740);
const view=createScene();view.resize(1000,740);
const files=[];
for(const [variant,depth,phase]of [['flat',1,'holdBottom'],['flat',.5,'concentric'],['incline',1,'holdBottom']]){
  view.apply(makePose(depth,variant),muscleValues({depth,phase},variant));view.resize(1000,740);renderer.render(view.scene,view.cameras.iso);
  const filename=`${variant}-${depth}.svg`,out=path.join(root,'public',filename);await fs.writeFile(out,renderer.domElement.outerHTML);files.push(out);
}
if(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES){
  const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
  await sharp(Buffer.from(await fs.readFile(files[0],'utf8'))).png().toFile(path.join(root,'public/preview.png'));
  const panels=[];for(let i=0;i<files.length;i++){
    const svg=await fs.readFile(files[i],'utf8'),p=await sharp(Buffer.from(svg)).resize(660,490).png().toBuffer();panels.push({input:p,left:i*660,top:50});
  }
  const labels=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1980" height="70"><style>text{font:24px sans-serif;fill:#cbd7ec}</style><text x="25" y="35">Горизонтальная · у груди</text><text x="685" y="35">Горизонтальная · жим</text><text x="1345" y="35">Наклон 30° · у груди</text></svg>');
  await sharp({create:{width:1980,height:540,channels:4,background:'#101722'}}).composite([...panels,{input:labels,left:0,top:0}]).png().toFile(path.join(root,'../../docs/bench-lab-preview.png'));
}
console.log('Actual Three.js scene rendered with SVGRenderer; not a browser screenshot.');view.dispose();dom.window.close();
