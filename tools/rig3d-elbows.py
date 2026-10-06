# Положение локтя относительно плеча в осях тела для всех объёмных моделей, 5 фаз.
# «вперёд» — по нормали груди, «к голове» — вдоль корпуса. Запуск: python3 tools/rig3d-elbows.py (после node build.js)
import asyncio
from playwright.async_api import async_playwright
JS="""()=>{ const out=[]; const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
 for (const ex of EX.filter(e=>e.anim.rig3d)) { const row=[];
  for (const t of [0,.25,.5,.75,1]) { const R=ex.anim.rig3d(t); const s='R';
    const fwd=dot(sub(R['el'+s],R['sh'+s]),R.n), along=dot(sub(R['el'+s],R['sh'+s]),R.u), side=R['el'+s][0]-R['sh'+s][0];
    const wfwd=dot(sub(R['wr'+s],R['sh'+s]),R.n);
    row.push(`t${t}: el вперёд ${fwd.toFixed(0)} (кисть ${wfwd.toFixed(0)}), к голове ${along.toFixed(0)}, вбок ${side.toFixed(0)}`); }
  out.push(ex.id+'\\n   '+row.join('\\n   ')); }
 return out; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file:///home/claude/lazy-gym-planer/dist/index.html'); await pg.wait_for_timeout(400)
        print('\n'.join(await pg.evaluate(JS))); await b.close()
asyncio.run(main())
