"""Кости MyoSim → локальные координаты сегментов манекена (см; X влево, Y вверх, Z вперёд; начало — проксимальный сустав).
   python3 tools/skeleton/build_bones.py [выход.json]   (по умолчанию qa/skeleton/bones.json; MYOSIM — путь к клону myo_sim;
   SKEL_CFG — JSON с поправками посадки; SKEL_POSTURE — файл осанки, по умолчанию tools/skin-anny/result/posture-patch.json,
   none — посадка 4.61.0). Нужны numpy, scipy, trimesh, fast-simplification.
   Осанка (кожа Anny, шаг 2; posture.py): кости таза, поясницы, грудного блока с рёбрами, шеи и черепа сначала садятся как в
   4.61.0, затем каждая часть — своим преобразованием из файла осанки (рёбра — ещё и поворотом в рёберно-позвоночных суставах);
   цепочка шеи подбирается по посадке 4.61.0, а грудино-ключичный сустав (SC_R, B.sc) идёт за рукояткой грудины."""
import numpy as np, json, fast_simplification, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import chain, load
from posture import Posture, apply4
S_T = 1.03          # рост манекена 174,5 см против 170 см в исходных моделях
B = dict(ua=28.3, fa=27.0, th=40.7, sk=41.8, hipHalf=8.8)   # как B в src/js/09bm-mannequin.js
def M(v): v=np.asarray(v,float); return np.stack([-v[...,2], v[...,1], v[...,0]],-1)   # OpenSim (x вперёд, y вверх, z вправо) → манекен
def unit(v): return v/np.linalg.norm(v)
def rot_between(a,b):
    a,b=unit(a),unit(b); v=np.cross(a,b); c=float(a@b)
    if np.linalg.norm(v)<1e-9: return np.eye(3)
    K=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]); return np.eye(3)+K+K@K*(1/(1+c))
def long_bone(P0,P1,L,st=S_T):
    """кость от сустава P0 к P1 → от (0,0,0) к (0,−L,0); вдоль оси — масштаб по длине, поперёк — st"""
    Rr=rot_between(P1-P0,[0,-1,0]); s=L/np.linalg.norm(P1-P0); a=np.array([0,-1.,0]); A=st*np.eye(3)+(s-st)*np.outer(a,a)
    return lambda v:(A@(Rr@(np.asarray(v)-P0).T)).T
def decimate(v,f,target):
    if len(f)<=target: return v,f
    vv,ff=fast_simplification.simplify(v.astype(np.float32),f.astype(np.int32),target_reduction=1-target/len(f))
    return vv.astype(float),ff
bones=[]
XF={}   # кость (имя, сторона) → преобразование «рамка корня цепочки MyoSim (см, оси манекена) → рамка кости»: им же переносятся точки мышц
def add(name,side,seg,v,f,target,xf=None,**extra):
    if xf is not None: XF[(name,side)]=xf
    v,f=decimate(np.asarray(v),np.asarray(f),target)
    bones.append(dict(name=name,side=side,seg=seg,v=np.round(v,2).ravel().tolist(),f=np.asarray(f).ravel().tolist(),**extra))
def mesh(ch,mname):
    for (b,m,file,Rg,pg) in ch['meshes']:
        if m==mname: v,f=load(file,Rg,pg); return M(v),f
    raise KeyError(mname)
def P(ch,b): return M(ch['bodies'][b][1]*100)
def mirror(b):
    v=np.array(b['v']).reshape(-1,3); v[:,0]*=-1; f=np.array(b['f']).reshape(-1,3)[:,::-1]
    o=dict(b,side='L',v=np.round(v,2).ravel().tolist(),f=f.ravel().tolist())
    for k in ('pivot','mcp','gl','ac','nrm','ia','probe','front'):
        if k in o: o[k]=[[-p[0],p[1],p[2]] for p in o[k]]
    if 'frame' in o: o['frame']={k:[-v_[0],v_[1],v_[2]] if k!='len' else v_ for k,v_ in o['frame'].items()}
    return o

# ---------- таз, крестец, позвоночник, грудная клетка ----------
LEG=chain('leg/assets/myolegs_chain.xml','leg/assets/myolegs_assets.xml','pelvis')
TOR=chain('torso/assets/myotorso_chain.xml','torso/assets/myotorso_assets.xml','sacrum')
hjR,hjL=P(LEG,'femur_r'),P(LEG,'femur_l'); mid=(hjR+hjL)/2; sx=B['hipHalf']/abs(hjL[0]-mid[0])
CFG=json.load(open(os.environ['SKEL_CFG'])) if os.environ.get('SKEL_CFG') else {}
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../qa/skeleton/bones.json')
POST=Posture(CFG.get('posture'))
print('осанка:',('по '+os.path.relpath(CFG.get('posture') or os.environ.get('SKEL_POSTURE') or __import__('posture').DEFAULT)) if POST.on else 'как в 4.61.0', POST.params if POST.on else '')
TH_PITCH=CFG.get('th_pitch',12.0); TH_DY=CFG.get('th_dy',0.0); TH_DZ=CFG.get('th_dz',1.0); RIB_X=CFG.get('rib_x',.96)
PIV=np.array([0,24.,-12.])   # ось наклона грудного блока: на уровне шарнира грудного отдела, у задней поверхности
def thoraxFit(q,w):
    a=np.radians(TH_PITCH*w); c,s_=np.cos(a),np.sin(a); d=np.asarray(q)-PIV
    y=d[:,1]*c-d[:,2]*s_; z=d[:,1]*s_+d[:,2]*c
    return np.stack([d[:,0],y,z],-1)+PIV+np.array([0,TH_DY*w,TH_DZ*w])
# Таз: по ширине ×sx у тазобедренных суставов (центры ±8,8 см), к крыльям подвздошных костей — ×1,0: у модели Rajagopal
# таз узкий в суставах, а гребни при общем ×1,14 давали межгребневую ширину 30 см при 27 у людей (ANSUR II).
SX_CREST=CFG.get('sx_crest',1.0)
def pelvisMap(v):
    d=np.asarray(v)-mid; u=np.clip((d[:,1]-2.)/6.,0,1); w=u*u*(3-2*u)
    return d*np.stack([sx+(SX_CREST-sx)*w,np.full(len(d),S_T),np.full(len(d),S_T)],-1)
for nm,side in (('r_pelvis','R'),('l_pelvis','L')):
    v,f=mesh(LEG,nm); add('pelvis_'+side,side,'pelvis',POST.apply('pelvis',pelvisMap(v)),f,900,xf=lambda p:POST.apply('pelvis',pelvisMap(p)))
v,f=mesh(TOR,'sacrum_geom_1_sacrum'); add('sacrum','',  'pelvis',POST.apply('pelvis',pelvisMap(v)),f,500,xf=lambda p:POST.apply('pelvis',pelvisMap(p)))
def trunkMap(v,w):
    """w — доля смещения грудного блока (0 у крестца, 1 у Th12 и выше)"""
    return thoraxFit((np.asarray(v)-mid)*np.array([S_T,S_T,S_T]),w)
yS=float(pelvisMap(mesh(TOR,'sacrum_geom_1_sacrum')[0])[:,1].max()); yT12=float(trunkMap(mesh(TOR,'torso_geom_1_thoracic12_s')[0],0)[:,1].mean())
for i in (5,4,3,2,1):
    v,f=mesh(TOR,f'lumbar{i}_geom_1_lumbar{i}'); yc=float(trunkMap(v,0)[:,1].mean()); w=float(np.clip((yc-yS)/(yT12-yS),0,1))
    L=f'L{i}'; q=POST.apply(L,trunkMap(v,w)); h=float(q[:,1].mean()); add(L,'','spine',q-np.array([0,h,0]),f,260,h=round(h,2),xf=lambda p,w=w,h=h,L=L:POST.apply(L,trunkMap(p,w))-np.array([0,h,0]))
TH0=np.array([0,24.,0])   # начало рамки грудной клетки манекена в рамке таза (нейтральная поза)
UNP={}                    # грудной блок до посадки по осанке (рамка грудной клетки): по нему цепочка шеи, как в 4.61.0
for (b,m,file,Rg,pg) in TOR['meshes']:
    if b!='torso': continue
    v,f=load(file,Rg,pg); q=trunkMap(M(v),1)
    if 'ribcage' in m: q=q*np.array([RIB_X,1,1])
    UNP[m.split('_')[-2]]=(q,f)
POST.setup_ribs(*UNP['ribcage'],verts=[q for k,(q,f) in UNP.items() if k!='ribcage'])
for nm,(q,f) in UNP.items():
    if nm=='ribcage': add('ribcage','','thorax',POST.rib_parts(q)-TH0,f,5200,xf=lambda p:POST.rib_points(trunkMap(p,1)*np.array([RIB_X,1,1]))-TH0)
    else: add(nm,'','thorax',POST.apply('thorax',q)-TH0,f,240,xf=lambda p:POST.apply('thorax',trunkMap(p,1))-TH0)

# ---------- шея и череп (геометрия HAT в рамке туловища Rajagopal: начало в (−10,07; 8,15; 0) см от таза) ----------
HD=chain('head/assets/myohead_rigid_chain.xml','head/assets/myohead_simple_assets.xml','neck')
off=np.array([-10.07,8.15,0.])
def hat(m): v,f=mesh(HD,m); return trunkMap(v+M(off),1),f
# начала рамок шеи и головы и центр головы в рамке таза (нейтральная поза): 24 + B.c7, + B.headJoint, + B.headCenter
neckO=np.array([0,61.2,-4]); headO=np.array([0,70.7,-0.5]); headC=np.array([0,73.6,1.5])
vc,fc=hat('hat_cervical')
vs,fs=hat('hat_skull'); vj,fj=hat('hat_jaw'); allv=np.vstack([vs,vj]); c=(allv.min(0)+allv.max(0))/2
s_head=CFG.get('s_head',1.0); dhead=np.array(CFG.get('d_head',[0,0,0.]))
# Череп MyoSim короткий для среднего мужчины ANSUR II: длина свода 17,1 см при ширине 14,4 (головной указатель 84;
# у мужчин обычно 76–80), и между затылочной костью и кожей головы (длина 19,9) оставалось 1,5 см. Растягиваем череп
# и челюсть по длине в 1,06 раза вокруг точки на 4 см впереди центра головы: лицо почти не сдвигается, затылок уходит
# назад, мягкие ткани на затылке ≈0,7 см.
s_head_z=CFG.get('s_head_z',1.06); z0_head=headC[2]+4
def skullP(v):                                    # череп — в рамке головы манекена (нейтральная поза)
    p=(v-c)*s_head+headC+dhead; p[:,2]=z0_head+(p[:,2]-z0_head)*s_head_z; return p
# Шейный отдел (4.60.0) — позвонки по одному, цепочкой от верхней пластинки T1 к суставным ямкам атласа под затылочными
# мыщелками. До 4.60.0 весь отдел HAT целиком поворачивался и растягивался от Th1 к «основанию черепа» — нижней точке черепа у
# средней линии, а это твёрдое нёбо: передняя дуга атласа стояла на 7,6 см впереди мыщелков, позвонки — в 1,9 см от кожи шеи,
# а гортань — на 1–2 позвонка ниже нормы.
# Сетка HAT (OpenSim, через MyoSim) — семь позвонков и пять дисков C2/3…C6/7 (компоненты связности; диска C7/T1 в ней нет).
# Каждый позвонок — твёрдое тело: своя ось (от центра нижней к центру верхней замыкательной пластинки, по дискам), подобие
# с масштабом S_T·k. Цепочка: от центра верхней пластинки T1 (как он стоит в грудном блоке) — диск C7/T1, тело C7, диск C6/7,
# … тело C3, диск C2/3; блок C2 + атлас — как в HAT (атлас на зубе и суставных отростках C2). Высоты дисков — по дискам HAT
# (0,45 см; у взрослых 4–6 мм: Gilad, Nissan, Spine 1986, 11: 154–157), тел — по HAT; общий масштаб k и угол на диске C7/T1
# подбираются так, чтобы середина верхних суставных ямок атласа встала туда, где атлас стоит под черепом в самой модели
# HAT (то же преобразование, что у черепа: skullP). Между ямками и нижней поверхностью черепа MyoSim остаётся ≈0,85 см —
# высота затылочных мыщелков, которых в упрощённой сетке черепа нет.
# Лордоз (LORD — углы на дисках C6/7…C2/3, °; C7/T1 — подбирается): верхняя пластинка T1 манекена наклонена вперёд на
# ≈31° (T1 slope у взрослых 25 ± 7°: Knott и др., Spine J 2010, 10: 994–998), а голова ANSUR II стоит так, что ямки атласа —
# на 2,5 см позади центра этой пластинки (у живого C2 обычно впереди C7: Hardacker и др., Spine 1997, 22: 1472–1480).
# Если разложить лордоз по уровням, как у живого (больше у C2–C4), тела C4–C6 подходят к коже шеи на 2,5–3 см и гортани
# между ними нет места; поэтому изгиб собран у шейно-грудного перехода (C7/T1 ≈ 23°, C6/7 — 10°, C5/6 — 4°, C4/5 — 1°,
# выше — прямой столб), тела C2–C6 — в 3,4–4,1 см от кожи шеи (нужно 4–5; ближе к норме — только с переносом грудного блока
# или головы, а их здесь не трогаем). Всего C2–T1 ≈ 38° — в пределах нормы лордоза C1–C7 (40 ± 10°, Hardacker 1997).
# Длина: от пластинки T1 до ямок атласа у манекена 11,6 см, а столбу из позвонков взрослого нужно ≈13 (C3–C7 по 1,8 см
# с дисками, C1 + C2 от ямок до нижней пластинки C2 — ≈3,5). Тела C3–C7 и диски оставлены в натуральную величину, а нехватка
# ушла в блок C2 + атлас (1,8 см): поэтому позвонки, а с ними и гортань на своих уровнях (C3–C6), стоят относительно
# подбородка на ≈2 см выше, чем у живого (подъязычная — между половинами нижней челюсти, а не под подбородком).
LORD=CFG.get('cerv_lord',[10.,4.,1.,0.,0.])
def ccomp(f,n):                                       # компоненты связности сетки: метка на вершину
    par=np.arange(n)
    def find(x):
        while par[x]!=x: par[x]=par[par[x]]; x=par[x]
        return x
    for a,b,c_ in f:
        for u,w in ((a,b),(b,c_)):
            ru,rw=find(u),find(w)
            if ru!=rw: par[ru]=rw
    return np.array([find(i) for i in range(n)])
def sag(a): return np.array([0,np.cos(np.radians(a)),np.sin(np.radians(a))])   # ось, наклонённая вперёд на a°
def tilt(u): return float(np.degrees(np.arctan2(u[2],u[1])))
def rotX(a):                                          # поворот в сагиттальной плоскости: sag(b) → sag(b+a)
    r=np.radians(a); return np.array([[1,0,0],[0,np.cos(r),-np.sin(r)],[0,np.sin(r),np.cos(r)]])
lab=ccomp(fc,len(vc)); groups={}
for i,l in enumerate(lab): groups.setdefault(l,[]).append(i)
G=sorted(groups.values(),key=lambda g:-vc[g,1].mean())
VG=[g for g in G if len(g)>100]; DG=[g for g in G if 20<len(g)<=100]
assert len(VG)==7 and len(DG)==5, (len(VG),len(DG))
def disc_of(g):
    v=vc[g]; o=v.mean(0); _,_,Vt=np.linalg.svd(v-o); n=Vt[2]*(1 if Vt[2][1]>0 else -1); t=(v-o)@n; return o,n,t.max()-t.min()
DI=[disc_of(g) for g in DG]                           # C2/3 … C6/7 (сверху вниз)
RAW={}                                                # позвонок: центр нижней пластинки и ось (сырые координаты HAT)
for i in range(3,8):
    up_,lo_=DI[i-3],(DI[i-2] if i<7 else None)
    sup=up_[0]-up_[1]*up_[2]/2
    if lo_ is not None: inf=lo_[0]+lo_[1]*lo_[2]/2
    else:                                             # C7: под ним диска нет — нижняя пластинка по высоте тела вдоль оси C6/7
        v=vc[VG[6]]; b_=v[(v[:,2]>v[:,2].max()-1.7)&(np.abs(v[:,0])<1.)]; inf=sup+up_[1]*((b_-sup)@up_[1]).min()
    RAW[i]=dict(inf=inf,H=float(np.linalg.norm(sup-inf)),th=tilt(sup-inf))
RAW[2]=dict(inf=DI[0][0]+DI[0][1]*DI[0][2]/2,th=tilt(DI[0][1]))
# середина верхних суставных ямок атласа (HAT): по высоте — верх боковых масс (верхняя четверть вершин), по глубине — центр
# боковых масс (у верхней четверти он смещён назад: ямки вогнуты, задний край выше)
c1v=vc[VG[0]]; lm=c1v[(np.abs(c1v[:,0])>1.1)&(np.abs(c1v[:,0])<2.6)]; fac=lm[lm[:,1]>np.percentile(lm[:,1],75)]
FAC=np.array([0,fac[:,1].mean(),lm[:,2].mean()])
PC=skullP(FAC[None])[0]                               # там же под черепом манекена
# верхняя пластинка T1: центр тела T1 и ось T2 → T1 (наклон грудного блока у шейно-грудного перехода)
def tbody(n):                                         # тело позвонка до посадки по осанке (упрощённая сетка, как в 4.61.0)
    v=np.round(decimate(UNP[n][0]-TH0,np.asarray(UNP[n][1]),240)[0],2)+TH0; return v[(v[:,2]>np.median(v[:,2]))&(np.abs(v[:,0])<1.6)]
b1,b2=tbody('thoracic1'),tbody('thoracic2'); u1=unit(b1.mean(0)-b2.mean(0)); TH_T1=tilt(u1)
E0=b1.mean(0)+u1*np.percentile((b1-b1.mean(0))@u1,90); E0[0]=0
# масштаб позвонка: поперёк — S_T (как у всех костей MyoSim), вдоль своей оси — S_T·k (высоты под длину шеи манекена)
def scaleAlong(th,k): a=sag(th); return S_T*np.eye(3)+S_T*(k-1)*np.outer(a,a)
TD=float(np.mean([d[2] for d in DI]))                 # толщина диска HAT
def cchain(J,k):
    """цепочка C7…C2 от верхней пластинки T1: нижние пластинки и оси; возвращает и середину ямок атласа"""
    pos=E0.copy(); th=TH_T1; t=TD*S_T*k; out={}
    pos=pos+sag(th-J/2)*t; th-=J                      # диск C7/T1
    for j,i in enumerate((7,6,5,4,3)):
        out[i]=dict(inf=pos.copy(),th=th); pos=pos+sag(th)*RAW[i]['H']*S_T*k; out[i]['sup']=pos.copy()
        a=LORD[j]; pos=pos+sag(th-a/2)*t; th-=a
    out[2]=dict(inf=pos.copy(),th=th)
    return out,pos+rotX(th-RAW[2]['th'])@(scaleAlong(RAW[2]['th'],k)@(FAC-RAW[2]['inf']))
from scipy.optimize import least_squares
sol=least_squares(lambda p:(cchain(*p)[1]-PC)[1:],[15.,1.05]); J_CT,K_C=sol.x; CH,fend=cchain(J_CT,K_C)
assert np.linalg.norm((fend-PC)[1:])<1e-3, fend-PC
# Тела позвонков HAT глубже человеческих: от передней поверхности до позвоночного канала ≈1,85 см (×S_T — 1,9) при 1,5–1,75
# у взрослых (глубина замыкательных пластинок C3–C7: Panjabi и др., Spine 1991, 16: 861–869), а канал — 0,8 см при ≈1,4.
# Переднюю часть тела (и диска) поджимаем к задней поверхности тела до глубины BODY_D: дуга, отростки и бугорки не меняются.
BODY_D=CFG.get('cerv_body',1.6); BODY_RAW=1.85
def shallow(v,o,th,front=None):
    """v — вершины позвонка или диска (сырые), o — точка оси, th — наклон оси; передняя часть — к задней поверхности тела"""
    fw=np.array([0,-np.sin(np.radians(th)),np.cos(np.radians(th))]); f=(v-o)@fw
    if front is None: front=f[np.abs(v[:,0])<.8].max()
    fp=front-BODY_RAW; k=BODY_D/S_T/BODY_RAW; d=np.where(f>fp,(f-fp)*(k-1),0.)
    return v+np.outer(d,fw)
def place(i):                                         # преобразование позвонка i (2 — блок C2 с атласом)
    r=RAW[i]; T=CH[i]; Rr=rotX(T['th']-r['th']); A=scaleAlong(r['th'],K_C); return lambda v,Rr=Rr,A=A,r=r,T=T:(Rr@A@(np.asarray(v)-r['inf']).T).T+T['inf']
vnew=np.empty_like(vc); owner={}
for i,g in zip((1,2,3,4,5,6,7),VG): owner.update({k_:(2 if i<=2 else i) for k_ in g})
FRONT={i:((vc[g]-RAW[i]['inf'])@np.array([0,-np.sin(np.radians(RAW[i]['th'])),np.cos(np.radians(RAW[i]['th']))]))[np.abs(vc[g][:,0])<.8].max() for i,g in zip(range(2,8),VG[1:])}
for j,g in enumerate(DG):                             # диск C(j+2)/C(j+3): между верхней пластинкой нижнего и нижней верхнего
    lo,hi=j+3,j+2; o,n,_=DI[j]; ctr=(CH[lo]['sup']+CH[hi]['inf'])/2; Rr=rotX((CH[lo]['th']+CH[hi]['th'])/2-tilt(n))
    vnew[g]=(Rr@scaleAlong(tilt(n),K_C)@(shallow(vc[g],o,tilt(n))-o).T).T+ctr
cent={i:vc[g].mean(0) for i,g in zip((1,2,3,4,5,6,7),VG)}
for g in G:                                           # позвонки и мелкие обломки сетки (к ближайшему позвонку)
    if 20<len(g)<=100: continue
    i=owner.get(g[0]) or (lambda m:2 if m<=2 else m)(min(cent,key=lambda k_:np.linalg.norm(vc[g].mean(0)-cent[k_])))
    own=next((k_ for k_,gg in zip(range(1,8),VG) if gg is g),None)   # сам позвонок C2…C7 (не атлас и не обломок)
    v=shallow(vc[g],RAW[own]['inf'],RAW[own]['th'],FRONT[own]) if own and own>=2 else vc[g]
    vnew[g]=place(i)(v)
# осанка: позвонки, диски и обломки — каждый своим преобразованием (блок C2 + атлас — 'C2', диск C(j+2)/C(j+3) — 'D(j+2)(j+3)')
part=np.empty(len(vc),object)
for i,g in zip((1,2,3,4,5,6,7),VG): part[g]='C2' if i<=2 else f'C{i}'
for j,g in enumerate(DG): part[g]=f'D{j+2}{j+3}'
for g in G:
    if part[g[0]] is None:
        i=owner.get(g[0]) or (lambda m:2 if m<=2 else m)(min(cent,key=lambda k_:np.linalg.norm(vc[g].mean(0)-cent[k_]))); part[g]=f'C{i}'
for k_ in set(part): vnew[part==k_]=POST.apply(k_,vnew[part==k_])
E0p=POST.apply('thorax',E0[None])[0]
for i in (2,3,4,5,6,7):
    for w_ in ('inf','sup'):
        if w_ in CH[i]: CH[i][w_]=POST.apply(f'C{i}',CH[i][w_][None])[0]
PCp=POST.apply('C2',PC[None])[0]
if POST.on: print('осанка шеи: ямки атласа блока C2 после посадки',np.round(PCp,2),'(под черепом',np.round(POST.apply('skull',PC[None])[0],2),')')
PC=PCp
DISC_CT=(E0p+CH[7]['inf'])/2                          # центр диска C7/T1 — ось нижнего шарнира шеи (B.neckPivot)
bc={i:(CH[i]['inf']+CH[i]['sup'])/2 for i in range(3,8)}
print('шея: T1 — пластинка',np.round(E0p,2),'наклон %.1f°'%TH_T1,'; ямки атласа',np.round(PC,2),'; угол C7/T1 %.1f°, масштаб позвонков вдоль оси %.3f'%(J_CT,S_T*K_C))
print('  шаг тел C3→C6:',' '.join('%.2f'%np.linalg.norm(bc[i+1]-bc[i]) for i in (3,4,5)),'; центр диска C7/T1 (рамка шеи)',np.round(DISC_CT-neckO,2))
# в данных кости: центр диска C7/T1 (ось нижнего шарнира шеи, B.neckPivot) и тела C7…C2 — центры нижней и верхней пластинок
# (рамка шеи; у C2 верхняя — середина ямок атласа) — для проверок посадки гортани и оси
bodies=[[*np.round(CH[i]['inf'][1:]-neckO[1:],2).tolist(),*np.round(CH[i]['sup'][1:]-neckO[1:],2).tolist()] for i in (7,6,5,4,3)]
bodies.append([*np.round(CH[2]['inf'][1:]-neckO[1:],2).tolist(),*np.round(PC[1:]-neckO[1:],2).tolist()])
add('cervical','','neck',vnew-neckO,fc,1300,discCT=np.round(DISC_CT-neckO,2).tolist(),bodies=bodies)
# Нижняя челюсть модели приоткрыта и подбородок отодвинут назад (кость подбородка на ≈3,5 см глубже кожи при обычных
# 1,2 см): закрываем рот поворотом на JAW_ROT° вокруг оси через мыщелки (верхне-задние точки ветвей).
# Тело челюсти MyoSim и после этого коротко для лица ANSUR (подбородок кости на 2,3 см глубже кожи): удлиняем
# челюсть вперёд от мыщелков в JAW_Z раза — мыщелки остаются в суставах, подбородок выходит на ≈0,8 см.
JAW_ROT=CFG.get('jaw_rot',8.0); JAW_Z=CFG.get('jaw_z',1.1)
def jawP(v):
    p=skullP(v); top=p[p[:,1]>p[:,1].max()-1.5]; cond=top[top[:,2]<np.percentile(top[:,2],30)].mean(0)
    a=np.radians(JAW_ROT); d=p-cond; y=d[:,1]*np.cos(a)+d[:,2]*np.sin(a); z=-d[:,1]*np.sin(a)+d[:,2]*np.cos(a)
    return np.stack([d[:,0],y,z*JAW_Z],-1)+cond
for nm,v,f,t in (('skull',vs,fs,2600),('jaw',vj,fj,900)):
    add(nm,'','head',POST.apply('skull',jawP(v) if nm=='jaw' else skullP(v))-headO,f,t)

# ---------- правая рука (левая — зеркально) ----------
ARM=chain('arm/assets/myoarm_r_chain.xml','arm/assets/myoarm_r_assets.xml','clavicle_r')
# центр плечевого сустава от грудино-ключичного — B.ghRel (правая сторона). Лопатка — в натуральную величину (×S_T),
# суставной впадиной на центре плечевого сустава манекена (головка плечевой кости в ней); ключица — от грудино-ключичного
# сустава к акромиально-ключичному этой лопатки (растянута по длине). Поворот — тот, что совмещает направления
# «грудино-ключичный → плечевой сустав» модели и манекена.
# С осанкой (posture.py) грудино-ключичный сустав сел ниже и глубже; плечевой сустав уходит с ним назад, а по высоте остаётся
# на 25,4 см над началом рамки грудной клетки (138,9 см стоя — на 3,5 см ниже акромиона ANSUR II): B.ghRel = (17; 25,4 − y SC; −4).
gh=P(ARM,'scapphant_r'); ac=P(ARM,'clavphant_r'); Rg_=None
# Лопатка на рёбрах: так поставленная, лопатка MoBL уходит телом на 1,5–2 см в грудную клетку манекена (у живого
# человека между рёбрами и лопаткой — подлопаточная и передняя зубчатая мышцы). Поворачиваем её вокруг центра
# плечевого сустава — вокруг вертикали и поперечной оси — на наименьшие углы, при которых передняя поверхность лежит
# не ближе SCAP_GAP см к оболочке рёбер; ключица потом идёт к новому положению акромиона.
# Грудино-ключичный сустав справа — как B.sc: в 4.61.0 (−2; 28,5; 4) в рамке грудной клетки; по осанке он идёт с рукояткой
# грудины (поворот рёбер и посадка грудного блока)
SCAP_GAP=CFG.get('scap_gap',0.8); SC_R=np.round(POST.rib_points(np.array([[-2.,28.5,4.]])+TH0)[0]-TH0,2)
tgt=np.array([-17.0,round(25.4-SC_R[1],2),-4.]); Rg_=rot_between(gh,tgt)
print('грудино-ключичный сустав (B.sc):',SC_R,'; плечевой от него (B.ghRel):',tgt)
def ribShell():
    r=np.array([b for b in bones if b['name']=='ribcage'][0]['v']).reshape(-1,3)-SC_R   # рёбра в рамке ключицы
    zc=r[:,2].mean(); a=np.degrees(np.arctan2(r[:,0]+2.,r[:,2]-zc)); rad=np.hypot(r[:,0]+2.,r[:,2]-zc); sh={}
    for y,ab,rr in zip(np.round(r[:,1]).astype(int),np.round(a/5).astype(int),rad): sh[(y,ab)]=max(sh.get((y,ab),0),rr)
    return zc,sh
RIB_ZC,RIB_SH=ribShell()
def ribPen(v):
    a=np.degrees(np.arctan2(v[:,0]+2.,v[:,2]-RIB_ZC)); rad=np.hypot(v[:,0]+2.,v[:,2]-RIB_ZC); out=0.
    for y,ab,rr in zip(np.round(v[:,1]).astype(int),np.round(a/5).astype(int),rad):
        s_=max(RIB_SH.get((y,ab+k),0) for k in (-1,0,1))
        if s_: out=max(out,s_+SCAP_GAP-rr)
    return out
def rotXY(px,ty):
    a,b=np.radians(px),np.radians(ty); X=np.array([[1,0,0],[0,np.cos(a),-np.sin(a)],[0,np.sin(a),np.cos(a)]]); Y=np.array([[np.cos(b),0,np.sin(b)],[0,1,0],[-np.sin(b),0,np.cos(b)]]); return Y@X
v0=S_T*(Rg_@(mesh(ARM,'scapula_r')[0]-gh).T).T
best=None
for px in range(-15,16):
    for ty in range(-20,21):
        q=tgt+(rotXY(px,ty)@v0.T).T; pen=ribPen(q[::3]); cost=(pen>.05)*100+pen*10+abs(px)+abs(ty)
        if best is None or cost<best[0]: best=(cost,px,ty,pen)
SCAP_R=rotXY(best[1],best[2])
print('лопатка на рёбрах: поворот вокруг поперечной оси',best[1],'°, вокруг вертикали',best[2],'°; заход в рёбра',round(best[3],2),'см')
scapM=lambda v,tgt=tgt,SCAP_R=SCAP_R,Rg_=Rg_,gh=gh:tgt+(SCAP_R@(S_T*(Rg_@(np.asarray(v)-gh).T))).T
acT=scapM(ac[None])[0]; Rc=rot_between(ac,acT); kc=np.linalg.norm(acT)/np.linalg.norm(ac); ca=unit(acT)
Ac=S_T*np.eye(3)+(kc-S_T)*np.outer(ca,ca); clavM=lambda v,Ac=Ac,Rc=Rc:(Ac@(Rc@np.asarray(v).T)).T
vS,fS=mesh(ARM,'scapula_r'); sv=scapM(vS)
# плоскость лопатки (наименьший разброс вершин) и нижний угол: для поворота лопатки за рукой (09bq-skeleton.js)
_,_,Vt=np.linalg.svd(sv-sv.mean(0)); nrm=Vt[2]; ia=sv[sv[:,1].argmin()]
# пробные точки задней поверхности лопатки (8 шт.): по ним лопатка держится под кожей при протракции
rng=np.random.default_rng(1); back=sv[sv[:,2]<np.percentile(sv[:,2],40)]; probe=back[rng.choice(len(back),8,replace=False)]
# пробные точки передней (рёберной) поверхности тела лопатки: по ним лопатка не заходит в рёбра. Передняя — та
# половина вершин тела (без акромиона и клюва), что ближе к рёбрам вдоль нормали плоскости лопатки; 16 точек
# равномерно по площади (выбор самых удалённых друг от друга)
_,_,Vt0=np.linalg.svd(sv-sv.mean(0)); n0=Vt0[2]*(1 if Vt0[2][2]>0 else -1)          # нормаль — вперёд (к рёбрам)
body_=sv[(sv[:,1]<tgt[1]-1)&(np.abs(sv[:,0]-tgt[0])>3)]; dd=(body_-body_.mean(0))@n0; frontP=body_[dd>np.percentile(dd,55)]
sel=[int(np.argmax(frontP[:,1]))]
while len(sel)<16: dist=np.min(np.linalg.norm(frontP[:,None,:]-frontP[sel][None,:,:],axis=2),axis=1); sel.append(int(np.argmax(dist)))
front=frontP[sel]
print('ключица',round(np.linalg.norm(acT),1),'см (×%.2f по длине), АКС'%kc,np.round(acT,1),'нижний угол',np.round(ia,1))
meta=dict(gl=[tgt.round(2).tolist()],ac=[acT.round(2).tolist()],nrm=[nrm.round(4).tolist()],ia=[ia.round(2).tolist()],probe=probe.round(2).tolist(),front=front.round(2).tolist())
arm=[]
v,f=mesh(ARM,'clavicle_r'); add('clavicle','R','girdle',clavM(v),f,300,xf=clavM,**meta); arm.append(bones[-1])
add('scapula','R','girdle',sv,fS,1100,xf=scapM,**meta); arm.append(bones[-1])
hum=P(ARM,'humerus_r'); el=P(ARM,'ulna_r'); T=long_bone(hum,el,B['ua'],1.0)
v,f=mesh(ARM,'humerus_r'); add('humerus','R','ua',T(v),f,700,xf=T); arm.append(bones[-1])
wr=P(ARM,'lunate_r'); T=long_bone(el,wr,B['fa'],1.0)
v,f=mesh(ARM,'ulna_r'); add('ulna','R','fa',T(v),f,450,xf=T); arm.append(bones[-1])
rh=P(ARM,'radius_r'); v,f=mesh(ARM,'radius_r'); add('radius','R','fa',T(v),f,450,xf=T,pivot=[T(rh[None])[0].round(2).tolist(),[0,-B['fa'],0]]); arm.append(bones[-1])
# кисть: подгонка запястья и пястно-фаланговых суставов к кисти манекена (Умеяма)
FING=[2.9,1.0,-0.9,-2.8]; names=['2proxph_r','3proxph_r','4proxph_r','5proxph_r']
src=np.array([wr]+[P(ARM,n) for n in names]); dst=np.array([[0,0,0]]+[[0.2,-9.6,w] for w in FING])
mu_s,mu_d=src.mean(0),dst.mean(0); X=src-mu_s; Y=dst-mu_d; U,Sv,Vt=np.linalg.svd(Y.T@X); D=np.eye(3); D[2,2]=np.sign(np.linalg.det(U@Vt))
Rh=U@D@Vt; sh=np.trace(np.diag(Sv)@D)/np.sum(X*X); th=mu_d-sh*Rh@mu_s
hand=lambda v,sh=sh,Rh=Rh,th=th:(sh*(Rh@np.asarray(v).T)).T+th
print('кисть: масштаб',round(sh,3),'невязка МЦФ',np.round(np.linalg.norm(hand(src)-dst,axis=1),2))
carp=['lunate','scaphoid','pisiform','triquetrum','capitate','trapezium','trapezoid','hamate','2mc','3mc','4mc','5mc']
for c_ in carp:
    v,f=mesh(ARM,c_+'_r'); add(c_,'R','hand',hand(v),f,110 if 'mc' not in c_ else 180,xf=hand); arm.append(bones[-1])
# фаланги: канонические координаты — ось от проксимального сустава к дистальному (−Y), тыл — +Z, длина len
def phal(nm,body,child,tip=False,thumb=False):
    v,f=mesh(ARM,nm); p0=hand(P(ARM,body)[None])[0]
    if child: p1=hand(P(ARM,child)[None])[0]
    vh=hand(v)
    if tip: a=unit(p1-p0) if child else None
    if not child:   # дистальная фаланга: кончик — самая дальняя точка вдоль оси от сустава
        a0=unit(vh.mean(0)-p0); d=(vh-p0)@a0; p1=p0+a0*d.max()
    a=unit(p1-p0); dors=np.array([-1.,0,0])      # тыл кисти правой руки — −X (ладонь смотрит в +X)
    dz=unit(dors-a*(dors@a)); dx=np.cross(a,dz)   # правая тройка: X' = Y'×Z' при Y' = −a
    xf=lambda q,p0=p0,a=a,dz=dz:(lambda w:np.stack([(w-p0)@np.cross(-a,dz),(w-p0)@(-a),(w-p0)@dz],-1))(hand(np.asarray(q)))
    return xf(v),f,float(np.linalg.norm(p1-p0)),xf
for k,(mc,pp,mp,dp) in enumerate([('2','2proxph_r','midph2_r','distph2_r'),('3','3proxph_r','midph3_r','distph3_r'),('4','4proxph_r','midph4_r','distph4_r'),('5','5proxph_r','midph5_r','distph5_r')]):
    for j,(nm,body,child) in enumerate([(mc+'proxph_r',pp,mp),(mc+'midph_r',mp,dp),(mc+'distph_r',dp,None)]):
        loc,f,L,xf=phal(nm,body,child); add(nm[:-2],'R','finger',loc,f,120,finger=k,joint=j,len=round(L,2),xf=xf); arm.append(bones[-1])
for j,(nm,body,child) in enumerate([('1mc_r','firstmc_r','proximal_thumb_r'),('thumbprox_r','proximal_thumb_r','distal_thumb_r'),('thumbdist_r','distal_thumb_r',None)]):
    loc,f,L,xf=phal(nm,body,child); add(nm[:-2],'R','thumb',loc,f,140,joint=j,len=round(L,2),xf=xf); arm.append(bones[-1])
for b in arm: bones.append(mirror(b))

# ---------- ноги ----------
for s,sx_ in (('R','r'),('L','l')):
    hj=P(LEG,f'femur_{sx_}'); kn=P(LEG,f'tibia_{sx_}'); an=P(LEG,f'talus_{sx_}'); mtp=P(LEG,f'toes_{sx_}')
    T=long_bone(hj,kn,B['th']); v,f=mesh(LEG,f'{sx_}_femur'); add('femur',s,'th',T(v),f,1100,xf=T)
    # надколенник: положение по углу колена (полиномы связи из модели), в рамке бедра. Стоя середина надколенника —
    # на 0,3 см ниже наружного надмыщелка (ANSUR II: 48,5 и 48,8 см), у модели — на 1,2 см выше: опускаем на 1,5 см
    # при прямом колене; к 60° сгибания поправка сходит на нет (дальше надколенник ведёт блок бедра)
    PAT_DY=CFG.get('pat_dy',-1.5)
    v,f=mesh(LEG,f'{sx_}_patella'); pb=P(LEG,f'patella_{sx_}')
    tx=[0.0524192,-0.0150188,-0.0340522,0.0133393,-0.000879151]; ty=[-0.0108281,-0.0487847,0.00927644,0.0131673,-0.00349673]; rz=[0.010506,0.0247615,-1.31647,0.716337,-0.138302]
    pol=lambda c,t:sum(ci*t**i for i,ci in enumerate(c))
    track=[]
    for deg in range(0,151,10):
        t=np.radians(deg); ang=pol(rz,t); tr=M(np.array([pol(tx,t),pol(ty,t),0])*100)
        track.append([deg,round(float(np.degrees(ang)),2)]+np.round(T((pb+tr)[None])[0]+[0,PAT_DY*max(0.,1-deg/60),0],2).tolist())
    # вершины надколенника — относительно его начала, в осях бедра (поворот модели вокруг оси z OpenSim = вокруг −X манекена)
    Tl=long_bone(hj,kn,B['th']); loc=Tl(v)-Tl(pb[None])[0]
    add('patella',s,'th',loc,f,140,track=track,xf=lambda p,Tl=Tl,pb=pb:Tl(p)-Tl(pb[None])[0])
    T=long_bone(kn,an,B['sk']); v,f=mesh(LEG,f'{sx_}_tibia'); add('tibia',s,'sk',T(v),f,800,xf=T)
    v,f=mesh(LEG,f'{sx_}_fibula'); add('fibula',s,'sk',T(v),f,400,xf=T)
    # стопа: голеностоп → (0,0,0), плюснефаланговый сустав → B.ball (0; −5,35; 13,5)
    tgt=np.array([0,-5.35,13.5]); Rf=rot_between(mtp-an,tgt); sf=np.linalg.norm(tgt)/np.linalg.norm(mtp-an); FT=lambda v,Rf=Rf,sf=sf,an=an:(sf*(Rf@(np.asarray(v)-an).T)).T
    for nm,t in ((f'{sx_}_talus',300),(f'{sx_}_foot',1500)):
        v,f=mesh(LEG,nm); add(nm[2:],s,'foot',FT(v),f,t,xf=FT)
    v,f=mesh(LEG,f'{sx_}_bofoot'); add('toes',s,'toes',FT(v)-tgt,f,1200,xf=lambda p,FT=FT,tgt=tgt:FT(p)-tgt)
    print(s,'стопа: масштаб',round(sf,3),'низ пятки',np.round(FT(mesh(LEG,f'{sx_}_foot')[0]).min(0),2))
tot=sum(len(b['f'])//3 for b in bones); print('костей',len(bones),'треугольников',tot)
if __name__=='__main__':   # при импорте (tools/muscles/build_muscles.py) нужны только преобразования костей XF
    os.makedirs(os.path.dirname(os.path.abspath(OUT)),exist_ok=True)
    json.dump(dict(bones=bones,source='MyoSim (MyoHub, Apache 2.0): Rajagopal 2016, Holzbaur 2005 (MoBL), lumbar spine model'),open(OUT,'w'))
    print(OUT,round(os.path.getsize(OUT)/1024),'КБ')
