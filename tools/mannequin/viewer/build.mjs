/* Сборка просмотрщика: node tools/mannequin/viewer/build.mjs out.html [--only id,id] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild');
const out=process.argv[2]||path.join(root,'qa/viewer.html'),i=process.argv.indexOf('--only'),only=i>0?process.argv[i+1].split(','):null;
const {bakeAll}=require(path.join(root,'tools/mannequin/author.js')),{run}=require(path.join(root,'tools/mannequin/check.js'));
const {loadModel}=require(path.join(root,'tools/biomechanics-audit.js'));
const entries=bakeAll({only});for(const k of Object.keys(entries))if(k.startsWith('_'))delete entries[k];
const report=run({entries,samples:41}),{EX}=loadModel();
const base=JSON.parse(await fs.readFile(path.join(root,'docs/biomech-baseline-4.2.1.json'),'utf8')).report;
const meta=Object.keys(entries).map(id=>{const ex=EX.find(e=>e.id===id),b=base.find(r=>r.id===id),r=report.find(r=>r.id===id);
 return{id,name:ex.name,eccFirst:!!ex.anim.eccFirst,cues:ex.anim.cues,hold:!!ex.anim.hold,
  before:{errors:b.issues.filter(x=>x.severity==='error').map(x=>x.detail),warns:b.issues.filter(x=>x.severity!=='error').length},
  issues:r.issues.map(x=>({rule:x.rule,severity:x.severity,detail:x.detail,depth:x.depth,unit:x.unit,t:x.t}))};});
const bundle=(await build({entryPoints:[path.join(root,'tools/mannequin/viewer/entry.mjs')],bundle:true,minify:true,format:'iife',target:['es2020'],write:false,logLevel:'error'})).outputFiles[0].text;
const read=f=>fs.readFile(path.join(root,f),'utf8');
const tpl=await read('tools/mannequin/viewer/page.html');
const poses=`const CATALOG_POSES=${JSON.stringify(entries)};`;
const machineFiles=(await fs.readdir(path.join(root,'src/js'))).filter(f=>/^09bo.*\.js$/.test(f)).sort();
const parts=await Promise.all(['src/js/09bm-mannequin.js','src/js/09bn-equipment.js',...machineFiles.map(f=>'src/js/'+f)].map(read));
const finalHtml=tpl.replace('/*@SCRIPTS@*/',()=>parts.join('\n')).replace('/*@DATA@*/',()=>poses+'\nconst REVIEW='+JSON.stringify(meta)+';').replace('/*@BUNDLE@*/',()=>bundle.replace(/<\/script/g,'<\\/script'));
await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,finalHtml);
console.log(out,(finalHtml.length/1024).toFixed(0)+' КБ',meta.length,'упражнений');
