import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'dist');
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(path.join(out,'fonts'),{recursive:true});
await build({entryPoints:[path.join(root,'src/main.mjs')],outfile:path.join(out,'app.js'),bundle:true,minify:true,format:'iife',target:['es2020'],legalComments:'eof'});
for(const f of ['index.html','style.css'])await fs.copyFile(path.join(root,f),path.join(out,f));
for(const f of ['favicon-32.png','icon-192.png'])await fs.copyFile(path.join(root,'../../src',f),path.join(out,f));
for(const f of ['golos-text-cyrillic-400.woff2','golos-text-latin-400.woff2','golos-text-cyrillic-600.woff2','golos-text-latin-600.woff2'])await fs.copyFile(path.join(root,'../../src/fonts',f),path.join(out,'fonts',f));
await fs.copyFile(path.join(root,'node_modules/three/LICENSE'),path.join(out,'three-LICENSE.txt'));
for(const f of ['audit-report.json','preview.png'])try{await fs.copyFile(path.join(root,'public',f),path.join(out,f));}catch(e){if(e.code!=='ENOENT')throw e;}
console.log('Bench lab built: local assets, no CDN dependencies.');
