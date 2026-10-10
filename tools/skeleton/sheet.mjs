import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
/* Контактный лист скелета: node tools/skeleton/sheet.mjs --ids squat --t 0,1 --cams angle,side [--focus sh --span .6] [--opacity .22]
   [--bones qa/skeleton/bones.json] --out qa/skeleton/sheet.png */
const here=path.dirname(new URL(import.meta.url).pathname),root=path.resolve(here,'../..'),require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild'),{chromium}=require('playwright');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const ids=arg('--ids','squat').split(','),ts=arg('--t','0,1').split(',').map(Number),cams=arg('--cams','angle,side').split(','),out=arg('--out','qa/skeleton/sheet.png'),bonesFile=path.resolve(root,arg('--bones','qa/skeleton/bones.json')),cols=+arg('--cols',String(cams.length)),w=+arg('--w','420'),h=+arg('--h','420');
const {bakeAll}=require(root+'/tools/mannequin/author.js');const entries=bakeAll({only:ids});
const lab=path.join(root,'tools/mannequin/.lab','skeleton-'+process.pid);await fs.mkdir(lab,{recursive:true});
await build({entryPoints:[path.join(here,'lab.mjs')],outfile:path.join(lab,'lab.js'),bundle:true,format:'iife',target:['es2020'],logLevel:'error',nodePaths:[root+'/node_modules']});
await fs.writeFile(path.join(lab,'bones.js'),'window.BONES='+await fs.readFile(bonesFile,'utf8'));
await fs.writeFile(path.join(lab,'index.html'),`<!doctype html><meta charset="utf-8"><body style="margin:0"><script src="${root}/src/js/09bm-mannequin.js"></script><script src="${root}/src/js/09bn-equipment.js"></script>${(await fs.readdir(path.join(root,'src/js'))).filter(f=>/^09bo.*\.js$/.test(f)).sort().map(f=>`<script src="${root}/src/js/${f}"></script>`).join('')}<script src="${here}/skeleton.js"></script><script src="bones.js"></script><script src="lab.js"></script>`);
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+path.join(lab,'index.html'));
const specs=[];for(const id of ids)for(const t of ts)for(const cam of cams)specs.push({id,t,cam});
const url=await page.evaluate(([specs,entries,o])=>Lab.sheet(specs,entries,o),[specs,entries,{w,h,cols,has:arg('--has',null),opacity:+arg('--opacity','.22'),focus:arg('--focus',null),span:+arg('--span','0.6')}]);
await fs.mkdir(path.dirname(path.resolve(root,out)),{recursive:true});await fs.writeFile(path.resolve(root,out),Buffer.from(url.split(',')[1],'base64'));if(errors.length)console.log('Ошибки:',errors.slice(0,5));console.log(out);await browser.close();await fs.rm(lab,{recursive:true,force:true});
