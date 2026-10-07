import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'dist'),html=await fs.readFile(path.join(out,'index.html'),'utf8');
const document=new JSDOM(html).window.document,assets=[...document.querySelectorAll('[src],[href]')].map(n=>n.getAttribute('src')||n.getAttribute('href')).filter(u=>u.startsWith('./'));
const css=await fs.readFile(path.join(out,'style.css'),'utf8');for(const m of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)/g))assets.push(m[1]);
for(const name of assets)assert((await fs.stat(path.join(out,name))).size>0,`Missing local asset ${name}`);
const errors=[],vc=new VirtualConsole();vc.on('error',(...args)=>{if(!String(args[0]).startsWith('THREE.WebGLRenderer: Error creating WebGL context.'))errors.push(args.map(String).join(' '));});vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://sakrett001-ai.github.io/Lazy-gym-planer/motion-lab/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
// Exercise the packaged fallback on a host without a WebGL context.
dom.window.HTMLCanvasElement.prototype.getContext=()=>null;
dom.window.eval(await fs.readFile(path.join(out,'app.js'),'utf8'));
assert(dom.window.benchLab,'Packaged application did not initialise');assert.equal(dom.window.benchLab.state.playing,false);
assert(dom.window.document.querySelector('#stage>svg path'),'Packaged SVG fallback has no drawn geometry');
assert.equal(dom.window.document.getElementById('loading').hidden,true);assert.equal(dom.window.document.querySelectorAll('[data-region]').length,5);
assert.deepEqual(errors,[]);dom.window.benchLab.destroy();dom.window.close();
console.log(`Packaged app: ${assets.length} local asset references resolve; SVG fallback initialises, draws geometry and stays paused.`);
