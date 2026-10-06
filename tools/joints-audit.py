import asyncio, json
from playwright.async_api import async_playwright
JS = """()=>{
  const ang=(a,b)=>{ const d=[b[0]-a[0], b[1]-a[1]]; return (Math.atan2(d[0], -d[1])*180/Math.PI+360)%360; };
  const out=[];
  for (const ex of EX) {
    const a=ex.anim; if (a.rig3d || a.view!=='side') continue;
    const bad={};
    for (let i=0;i<=8;i++) { const t=i/8; const J=solvePose(a, poseAt(a,t), a._C);
      for (const s of ['N','F']) {
        const ua=ang(J.sh, J['el'+s]), fa=ang(J['el'+s], J['wr'+s]);
        const d=((fa-ua)%360+360)%360;           // локоть: сгиб допустим при d в (180,360)
        if (d>10 && d<170) { const k='elbow'+s; bad[k]=Math.max(bad[k]||0, Math.min(d,180-d)); }
        const th=ang(J.hip, J['kn'+s]), sh=ang(J['kn'+s], J['an'+s]);
        const e=((sh-th)%360+360)%360;           // колено: сгиб допустим при e в (0,180)
        if (e>190 && e<350) { const k='knee'+s; bad[k]=Math.max(bad[k]||0, Math.min(e-180,360-e)); }
      }
    }
    if (Object.keys(bad).length) out.push(ex.id+' '+JSON.stringify(bad));
  }
  return out; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file:///home/claude/lazy-gym-planer/dist/index.html'); await pg.wait_for_timeout(400)
        r=await pg.evaluate(JS); print(len(r)); print('\n'.join(r)); await b.close()
asyncio.run(main())
