"""Извлечение костей MyoSim: все тела цепочки в рамке корня (нулевая поза), сетки и центры суставов, см, оси OpenSim (x вперёд, y вверх, z вправо)."""
import xml.etree.ElementTree as ET, numpy as np, trimesh, json, sys, os
# путь к клону https://github.com/MyoHub/myo_sim — переменная окружения MYOSIM
R=os.environ.get('MYOSIM','/home/claude/myohub/myo_sim').rstrip('/')+'/myo_sim/models/'
def rx(a): c,s=np.cos(a),np.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def ry(a): c,s=np.cos(a),np.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def rz(a): c,s=np.cos(a),np.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
def rot(el):
    q=el.get('quat'); e=el.get('euler')
    if q:
        w,x,y,z=map(float,q.split()); n=np.sqrt(w*w+x*x+y*y+z*z); w,x,y,z=w/n,x/n,y/n,z/n
        return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    if e:
        a,b,c=map(float,e.split()); return rx(a)@ry(b)@rz(c)   # eulerseq xyz (внутренние оси)
    return np.eye(3)
def pos(el): p=el.get('pos'); return np.array(list(map(float,p.split())) if p else [0,0,0])
def chain(f, assets, root_name):
    meshfile={m.get('name'):m.get('file') for m in ET.parse(R+assets).getroot().iter('mesh')}
    t=ET.parse(R+f).getroot(); out={'bodies':{},'meshes':[]}
    root=[b for b in t.iter('body') if b.get('name')==root_name][0]
    def rec(b,Rm,p):
        out['bodies'][b.get('name')]=(Rm.copy(),p.copy())
        for g in b.findall('geom'):
            if g.get('mesh'):
                Rg=Rm@rot(g); pg=p+Rm@pos(g)
                out['meshes'].append((b.get('name'),g.get('mesh'),meshfile[g.get('mesh')],Rg,pg))
        for c in b.findall('body'):
            rec(c,Rm@rot(c),p+Rm@pos(c))
    rec(root,np.eye(3),np.zeros(3))   # корень — без собственного поворота (он ориентирует модель в мире MuJoCo)
    return out
def load(path,Rg,pg):
    m=trimesh.load(R+path,process=True); m.merge_vertices()
    if path.endswith('thorax.stl'):
        # в сетке грудной клетки MoBL есть сердце и его части — отдельные куски целиком спереди (x > 2 см); оставляем рёбра и грудину
        m=trimesh.util.concatenate([c for c in m.split(only_watertight=False) if c.bounds[0][0] < 0.02])
    v=(np.asarray(m.vertices)@Rg.T+pg)*100; return v,np.asarray(m.faces)
if __name__=='__main__':
    for f,a,r in [('leg/assets/myolegs_chain.xml','leg/assets/myolegs_assets.xml','pelvis'),('torso/assets/myotorso_chain.xml','torso/assets/myotorso_assets.xml','sacrum'),
                  ('arm/assets/myoarm_r_chain.xml','arm/assets/myoarm_r_assets.xml','clavicle_r'),('head/assets/myohead_rigid_chain.xml','head/assets/myohead_simple_assets.xml','neck')]:
        c=chain(f,a,r)
        print(f, len(c['meshes']))
        for b,(Rm,p) in list(c['bodies'].items())[:60]: pass
        for (b,m,file,Rg,pg) in c['meshes']:
            v,fc=load(file,Rg,pg); lo,hi=v.min(0),v.max(0)
            print(f'  {b:16s} {m:28s} tris {len(fc):6d}  x[{lo[0]:6.1f},{hi[0]:6.1f}] y[{lo[1]:6.1f},{hi[1]:6.1f}] z[{lo[2]:6.1f},{hi[2]:6.1f}]')
