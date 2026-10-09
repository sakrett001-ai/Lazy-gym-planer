const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {buildSync}=require('esbuild');
const code=buildSync({entryPoints:[path.join(__dirname,'../floot/helpers/plannerRelease.tsx')],platform:'node',format:'cjs',bundle:true,write:false}).outputFiles[0].text;
const moduleResult={exports:{}};
new Function('require','module','exports',code)(require,moduleResult,moduleResult.exports);
const {plannerRelease}=moduleResult.exports;
const sha='a'.repeat(40);
const html=lang=>`<!doctype html><html><body><script>window.PODHOD_VERSION='4.7.0';window.PODHOD_LANG='${lang}';</script></body></html>`;
const document=lang=>({path:`floot/releases/${sha}/planner-${lang}.html`,bytes:Buffer.byteLength(html(lang)),sha256:createHash('sha256').update(html(lang)).digest('hex')});
function fixture(change=m=>m,changeHtml=h=>h){
  const manifest=change({schemaVersion:1,repository:'sakrett001-ai/Lazy-gym-planer',sourceBranch:'main',sourceCommit:sha,version:'4.7.0',checks:'passed',builtAt:'2026-10-09T00:00:00Z',documents:{ru:document('ru'),en:document('en')}});
  const urls=[];
  const fetcher=async url=>{
    urls.push(url);
    return new Response(url.includes('floot-release.json')?JSON.stringify(manifest):changeHtml(html(url.endsWith('planner-en.html')?'en':'ru')));
  };
  return {fetcher,urls};
}
test('Floot loads both languages from the immutable source commit and checks their hash',async()=>{
  for(const lang of ['ru','en']){
    const {fetcher,urls}=fixture();
    const result=await plannerRelease.read(lang,fetcher);
    assert.equal(result.html,html(lang));assert.equal(result.sourceCommit,sha);
    assert.equal(urls[1],`https://raw.githubusercontent.com/sakrett001-ai/Lazy-gym-planer/gh-pages/floot/releases/${sha}/planner-${lang}.html`);
  }
});
test('Floot refuses a document altered after the manifest was published',async()=>{
  const {fetcher}=fixture(m=>m,h=>h.replace('4.7.0','4.7.1'));
  await assert.rejects(plannerRelease.read('ru',fetcher),/целостности/);
});
test('Floot refuses unapproved builds and other repositories before downloading code',async()=>{
  for(const change of [m=>({...m,checks:'failed'}),m=>({...m,repository:'someone/else'}),m=>({...m,sourceBranch:'feat/unreviewed'})]){
    const {fetcher,urls}=fixture(change);
    await assert.rejects(plannerRelease.read('ru',fetcher),/подтвердить/);assert.equal(urls.length,1);
  }
});
test('Floot refuses external paths, traversal and mixed source revisions',async()=>{
  for(const unsafe of ['https://example.invalid/attack.html','../attack.html',`floot/releases/${'b'.repeat(40)}/planner-ru.html`]){
    const {fetcher,urls}=fixture(m=>({...m,documents:{...m.documents,ru:{...m.documents.ru,path:unsafe}}}));
    await assert.rejects(plannerRelease.read('ru',fetcher),/описание/);assert.equal(urls.length,1);
  }
});
test('Floot refuses oversized builds and an invalid language',async()=>{
  const {fetcher}=fixture(m=>({...m,documents:{...m.documents,ru:{...m.documents.ru,bytes:5_000_000}}}));
  await assert.rejects(plannerRelease.read('ru',fetcher),/описание/);
  await assert.rejects(plannerRelease.read('../en',fetcher),/язык/);
});
test('Floot reports an upstream outage instead of executing an error response',async()=>{
  await assert.rejects(plannerRelease.read('ru',async()=>new Response('Not found',{status:404})),/временно недоступен/);
});
test('Floot refuses a correctly hashed document with the wrong version or a service worker',async()=>{
  for(const broken of [html('ru').replace('4.7.0','4.7.1'),html('ru')+'navigator.serviceWorker.register("/sw.js")']){
    const {fetcher}=fixture(m=>({...m,documents:{...m.documents,ru:{...m.documents.ru,bytes:Buffer.byteLength(broken),sha256:createHash('sha256').update(broken).digest('hex')}}}),()=>broken);
    await assert.rejects(plannerRelease.read('ru',fetcher),/описанию/);
  }
});
