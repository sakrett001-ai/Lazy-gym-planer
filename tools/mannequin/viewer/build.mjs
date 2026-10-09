/* Сборка просмотрщика: node tools/mannequin/viewer/build.mjs out.html [--only id,id] [--report qa/check-all.json] */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild');
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;};
const out=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:path.join(root,'qa/viewer.html'),only=arg('--only')?.split(',')||null;
const {bakeAll,loadSpecs}=require(path.join(root,'tools/mannequin/author.js')),{run}=require(path.join(root,'tools/mannequin/check.js'));
const {loadModel}=require(path.join(root,'tools/biomechanics-audit.js'));
const entries=bakeAll({only});for(const k of Object.keys(entries))if(k.startsWith('_'))delete entries[k];
/* отчёт проверки: готовый JSON полного прогона (--report) или свежий прогон */
const report=arg('--report')?JSON.parse(await fs.readFile(path.resolve(root,arg('--report')),'utf8')):run({entries,samples:41}),{EX}=loadModel();
const GROUPS={'pilot.js':'Со скриншотов','g1-barbell.js':'Штанга и машина Смита','g2-dumbbell.js':'Гантели и гири','g3-cable.js':'Блоки и эспандеры','g4-machines.js':'Тренажёры и турник','g5a-floor.js':'На полу','g5b-home.js':'Дома','g6-cardio.js':'Кардио'};
const specs=loadSpecs(),order=Object.keys(GROUPS);
const ids=Object.keys(entries).sort((a,b)=>order.indexOf(specs[a].file)-order.indexOf(specs[b].file));
const base=JSON.parse(await fs.readFile(path.join(root,'docs/biomech-baseline-4.2.1.json'),'utf8')).report;
const meta=ids.map(id=>{const ex=EX.find(e=>e.id===id),b=base.find(r=>r.id===id)||{issues:[]},r=report.find(r=>r.id===id)||{issues:[]};
 const opts=[...new Set((entries[id].equipment||[]).flatMap(q=>[q.optional,q.optionalNot]).filter(Boolean))];
 return{id,name:ex.name,group:GROUPS[specs[id].file]||'Прочее',loop:!!entries[id].loop,opts,eccFirst:!!ex.anim.eccFirst,cues:ex.anim.cues,hold:!!ex.anim.hold,
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
