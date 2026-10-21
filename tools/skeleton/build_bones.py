"""Кости MyoSim → локальные координаты сегментов манекена (см; X влево, Y вверх, Z вперёд; начало — проксимальный сустав).
   python3 tools/skeleton/build_bones.py [выход.json]   (по умолчанию qa/skeleton/bones.json; MYOSIM — путь к клону myo_sim;
   SKEL_CFG — JSON с поправками посадки). Нужны numpy, trimesh, fast-simplification."""
import numpy as np, json, fast_simplification, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import chain, load
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
TH_PITCH=CFG.get('th_pitch',2.0); TH_DY=TH_DZ=0.; RIB_X=CFG.get('rib_x',.96)   # сдвиг TH_DY, TH_DZ — по шее (ниже)
PIV=np.array([0,24.,-12.])   # ось наклона грудного блока: на уровне шарнира грудного отдела, у задней поверхности
def pitchFit(q,a_deg,dy,dz):
    a=np.radians(a_deg); c,s_=np.cos(a),np.sin(a); d=np.asarray(q)-PIV
    y=d[:,1]*c-d[:,2]*s_; z=d[:,1]*s_+d[:,2]*c
    return np.stack([d[:,0],y,z],-1)+PIV+np.array([0,dy,dz])
def thoraxFit(q,w): return pitchFit(q,TH_PITCH*w,TH_DY*w,TH_DZ*w)
# Таз: по ширине ×sx у тазобедренных суставов (центры ±8,8 см), к крыльям подвздошных костей — ×1,0: у модели Rajagopal
# таз узкий в суставах, а гребни при общем ×1,14 давали межгребневую ширину 30 см при 27 у людей (ANSUR II).
SX_CREST=CFG.get('sx_crest',1.0)
def pelvisMap(v):
    d=np.asarray(v)-mid; u=np.clip((d[:,1]-2.)/6.,0,1); w=u*u*(3-2*u)
    return d*np.stack([sx+(SX_CREST-sx)*w,np.full(len(d),S_T),np.full(len(d),S_T)],-1)
for nm,side in (('r_pelvis','R'),('l_pelvis','L')):
    v,f=mesh(LEG,nm); add('pelvis_'+side,side,'pelvis',pelvisMap(v),f,900,xf=pelvisMap)
v,f=mesh(TOR,'sacrum_geom_1_sacrum'); add('sacrum','',  'pelvis',pelvisMap(v),f,500,xf=pelvisMap)
def trunkMap(v,w):
    """w — доля смещения грудного блока (0 у крестца, 1 у Th12 и выше)"""
    return thoraxFit((np.asarray(v)-mid)*np.array([S_T,S_T,S_T]),w)
yS=float(pelvisMap(mesh(TOR,'sacrum_geom_1_sacrum')[0])[:,1].max()); yT12=float(trunkMap(mesh(TOR,'torso_geom_1_thoracic12_s')[0],0)[:,1].mean())
TH0=np.array([0,24.,0])   # начало рамки грудной клетки манекена в рамке таза (нейтральная поза)
def buildTrunk():
    """поясничные позвонки (доля w сдвига грудного блока) и грудной блок — после того, как шея задала TH_DY, TH_DZ"""
    global AP
    for i in (5,4,3,2,1):
        v,f=mesh(TOR,f'lumbar{i}_geom_1_lumbar{i}'); yc=float(trunkMap(v,0)[:,1].mean()); w=float(np.clip((yc-yS)/(yT12-yS),0,1))
        q=trunkMap(v,w); h=float(q[:,1].mean()); add(f'L{i}','','spine',q-np.array([0,h,0]),f,260,h=round(h,2),xf=lambda p,w=w,h=h:trunkMap(p,w)-np.array([0,h,0]))
    for (b,m,file,Rg,pg) in TOR['meshes']:
        if b!='torso': continue
        v,f=load(file,Rg,pg); q=trunkMap(M(v),1)
        if 'ribcage' in m:
            q=q*np.array([RIB_X,1,1]); AP=apProfile(q); q=apStretch(q)
            add('ribcage','','thorax',q-TH0,f,5200,xf=lambda p:apStretch(trunkMap(p,1)*np.array([RIB_X,1,1]))-TH0)
        else: add(m.split('_')[-2],'','thorax',q-TH0,f,240,xf=lambda p:trunkMap(p,1)-TH0)
# Передняя стенка грудной клетки (4.62.0). После того как грудной блок встал под шею (наклон 2°), грудина и хрящи рёбер — на
# 4–5 см под кожей груди (кожа по ANSUR II не меняется), у человека над грудиной 1,8 ± 0,9 см мягких тканей (КТ, мужчины с
# нормальным ИМТ: Lemon и др., 2021 — место введения внутрикостного катетера в рукоятку). Переднюю половину клетки выносим
# вперёд: на высоте y сдвиг AP_D(y) у переднего края (грудина, хрящи), к среднеподмышечной линии (самая широкая точка
# сечения) — плавно на нет; задняя половина (позвонки, углы рёбер, ложе лопатки) не меняется. AP_D — по коже стоящей
# фигуры: передний край на ≈1,8 см под ней; выше рукоятки — как у неё, ниже рёберной дуги — 0.
AP_D=CFG.get('ap_d',[[29.5,0.],[34.5,1.2],[41.5,2.3],[50.5,3.2]])   # [высота над тазобедренными, сдвиг], см
AP=None
def apProfile(q):
    """по слоям 1 см: z самой широкой точки (среднеподмышечная линия) и самой передней — сглажены"""
    ys=np.arange(np.floor(q[:,1].min()),np.ceil(q[:,1].max())+1); z0=np.full(len(ys),np.nan); zf=np.full(len(ys),np.nan)
    for k,y in enumerate(ys):
        s=q[np.abs(q[:,1]-y)<.6]
        if len(s)<20: continue
        z0[k]=s[np.argmax(np.abs(s[:,0])),2]; zf[k]=s[:,2].max()
    ok=~np.isnan(z0); z0=np.interp(ys,ys[ok],z0[ok]); zf=np.interp(ys,ys[ok],zf[ok])
    ker=np.ones(5)/5; pad=lambda a:np.concatenate([[a[0]]*2,a,[a[-1]]*2])
    return ys,np.convolve(pad(z0),ker,'valid'),np.convolve(pad(zf),ker,'valid')
def apStretch(p):
    p=np.array(p,float); ys,z0,zf=AP; y=p[:,1]; a=np.interp(y,ys,z0); b=np.interp(y,ys,zf)
    u=np.clip((p[:,2]-a)/np.maximum(b-a,1.),0,1); s=u*u*(3-2*u); d=np.array(AP_D)
    p[:,2]+=np.interp(y,d[:,0],d[:,1])*s; return p

# ---------- шея и череп (геометрия HAT в рамке туловища Rajagopal: начало в (−10,07; 8,15; 0) см от таза) ----------
HD=chain('head/assets/myohead_rigid_chain.xml','head/assets/myohead_simple_assets.xml','neck')
off=np.array([-10.07,8.15,0.])
# Череп и сетка шейного отдела HAT — в своей посадке, независимо от наклона грудного блока: поворот на HAT_PITCH (12°, как
# до 4.62.0, когда грудной блок и голова наклонялись вместе) — по этому черепу подогнаны кожа головы и лица (сдвиг не важен:
# череп ставится центром в центр головы, позвонки — цепочкой ниже)
HAT_PITCH=CFG.get('hat_pitch',12.0)
def hat(m): v,f=mesh(HD,m); return pitchFit((np.asarray(v+M(off))-mid)*S_T,HAT_PITCH,0.,1.),f
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
# с масштабом S_T·k. Цепочка: от центра верхней пластинки T1 — диск C7/T1, тело C7, диск C6/7, … тело C3, диск C2/3, тело
# C2 с атласом на его суставных отростках. Высоты дисков — по дискам HAT (0,45 см; у взрослых 4–6 мм: Gilad, Nissan, Spine
# 1986, 11: 154–157), тел C3–C7 — HAT ×1,074 вдоль оси (шаг тел C3→C6 ≈ 1,8 см). Середина верхних суставных ямок атласа — там,
# где атлас стоит под черепом в самой модели HAT (то же преобразование, что у черепа: skullP; между ямками и нижней
# поверхностью черепа MyoSim ≈0,85 см — высота затылочных мыщелков, которых в упрощённой сетке черепа нет).
# Осанка (4.62.0). До 4.62.0 грудной блок был наклонён вперёд на 12° и цепочка шла от T1 вверх к атласу, а у живого шея
# держит голову: атлас стоял на 2,5 см позади T1 (у человека C2 впереди C7: Hardacker и др., Spine 1997, 22: 1472–1480), весь
# лордоз (23°) — на диске C7/T1, блок C2 + атлас был повёрнут к черепу на −27,8° (сустав атлант — затылок неконгруэнтен), а
# остистые T1–T3 — на 4,2–5,1 см под кожей спины. Теперь цепочка подвешена к черепу:
# - блок C2 + атлас стоит к черепу так же, как в HAT (сустав атлант — затылок конгруэнтен), тела C7…C3 — по форме HAT (её
#   «углы» HATA между осями соседних позвонков — форма тел, а не клинья дисков); чтобы от T1 прийти к C2 в этой посадке,
#   клинья дисков C7/T1…C2/3 меняются на S_W поровну (−17,7°, по −3° на диск: шея почти прямая — лордоз C2–T1 ≈ 1°;
#   при наклоне черепа, под который подогнаны голова и лицо, — это предел; C2 slope черепа HAT 20°);
# - тело C2 HAT коротко: 2,4 см вдоль оси от нижней пластинки до верхушки зуба при ≈ 3,8–4 см у взрослых (зуб — 1,3–1,8 см
#   над телом: КТ 167 взрослых, Sci J Univ Benghazi; тело до суставных отростков ≈ 2,3–2,5) — тянем его вдоль оси ×K2 = 1,6
#   (3,8 см), атлас едет на суставных отростках как твёрдое тело; блок C2 + атлас — 3,2 см, шея от пластинки T1 до ямок
#   атласа — 12,7 см (шейный отдел взрослого ≈ 12,5 см: Gray's Anatomy, 1918; было 11,6);
# - грудной блок встаёт под эту шею: наклон TH_PITCH = 2° (было 12°) — верхняя пластинка T1 наклонена на 21,6° (T1 slope у
#   взрослых 25 ± 7°: Knott и др., Spine J 2010, 10: 994–998), сдвиг TH_DY, TH_DZ — так, чтобы цепочка от T1 пришла в ямки
#   атласа (−2,6 / +3,1 см; поясничные позвонки — на долю w, как раньше). Атлас — на 1,3 см впереди пластинки T1, остистые
#   C7 — на 0,8 см под кожей, T1–T3 — на 1,6–1,9, T4–T12 — на 0,8–2,4 (было 4,5 у C7 и 4,2–5,1 у T1–T3).
# Подъязычная кость (tools/skeleton/airway.js) — у нижнего края C3: при длине C2 3,8 см позвонок C3 стоит за краем нижней
# челюсти, и кость на 0,8 см ниже края (по нормали к нижнечелюстной плоскости — 0,6 см; у взрослых 1,5 ± 0,3 см: Riley,
# Powell, Guilleminault, 1983); перстневидный — у нижней пластинки C6, вырезка щитовидного — на 0,9 см ниже подбородка кости.
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
# нижние суставные ямки атласа (на верхних суставных отростках C2): нижняя четверть боковых масс
ATL_INF=np.array([0,lm[lm[:,1]<np.percentile(lm[:,1],25)][:,1].mean(),lm[:,2].mean()])
# верхняя пластинка T1: центр тела T1 и ось T2 → T1 (наклон грудного блока у шейно-грудного перехода) — по сеткам MyoSim при
# наклоне TH_PITCH, без сдвига (сдвиг грудного блока TH_DY, TH_DZ подбирается ниже — по шее)
def tbody(n):
    v,_=next(load(file,Rg,pg) for (b,m,file,Rg,pg) in TOR['meshes'] if m.endswith('_'+n+'_s'))
    v=pitchFit((M(v)-mid)*S_T,TH_PITCH,0.,0.); return v[(v[:,2]>np.median(v[:,2]))&(np.abs(v[:,0])<1.6)]
b1,b2=tbody('thoracic1'),tbody('thoracic2'); u1=unit(b1.mean(0)-b2.mean(0)); TH_T1=tilt(u1)
E00=b1.mean(0)+u1*np.percentile((b1-b1.mean(0))@u1,90); E00[0]=0
# масштаб позвонка: поперёк — S_T (как у всех костей MyoSim), вдоль своей оси — S_T·k (высоты под длину шеи манекена)
def scaleAlong(th,k): a=sag(th); return S_T*np.eye(3)+S_T*(k-1)*np.outer(a,a)
TD=float(np.mean([d[2] for d in DI]))                 # толщина диска HAT
K_C=CFG.get('k_c',1.074)                              # тела C3–C7 и диски вдоль оси (шаг тел C3→C6 ≈ 1,8 см)
# Клинья: в HAT ось позвонка (от центра нижней к центру верхней пластинки) и нормали дисков не совпадают (тела шейных позвонков
# в профиль — параллелограммы), поэтому «угол» между осями соседних позвонков HAT (HATA, C6/7…C2/3; у C2 — ось по нормали
# диска C2/3) — это форма самих позвонков, а не клин диска. Цепочка повторяет форму HAT и меняет клинья дисков (C7/T1 и
# C6/7…C2/3) на S_W·CW: так, чтобы блок C2 + атлас встал к черепу так же, как в HAT (сустав атлант — затылок конгруэнтен).
HATA=[RAW[i]['th']-RAW[i-1]['th'] for i in (7,6,5,4,3)]
CW=np.array(CFG.get('cerv_w',[1,1,1,1,1,1]),float); CW=CW/CW.sum()
S_W=TH_T1-RAW[2]['th']-sum(HATA)
JW=[S_W*w for w in CW]; J_CT=JW[0]; LORD=[HATA[j]+JW[j+1] for j in range(5)]
def cchain(k2,E0,kc=None):
    """цепочка C7…C2 от верхней пластинки T1: нижние пластинки и оси; возвращает и середину ямок атласа.
       k2 — масштаб тела C2 вдоль оси (атлас — твёрдый, едет на суставных отростках C2), kc — тел C3–C7 и дисков"""
    kc=K_C if kc is None else kc; pos=E0.copy(); th=TH_T1; t=TD*S_T*kc; out={}
    pos=pos+sag(th-J_CT/2)*t; th-=J_CT                # диск C7/T1
    for j,i in enumerate((7,6,5,4,3)):
        out[i]=dict(inf=pos.copy(),th=th); pos=pos+sag(th)*RAW[i]['H']*S_T*kc; out[i]['sup']=pos.copy()
        a=LORD[j]; pos=pos+sag(th-a/2)*t; th-=a
    out[2]=dict(inf=pos.copy(),th=th)
    return out,pos+rotX(th-RAW[2]['th'])@(S_T*(FAC-RAW[2]['inf'])+atlShift(k2))
def atlShift(k2): a=sag(RAW[2]['th']); return S_T*(k2-1)*a*(a@(ATL_INF-RAW[2]['inf']))
from scipy.optimize import brentq
K2=CFG.get('k2',1.6)
if 'neck_len' in CFG: K_C=brentq(lambda k:np.linalg.norm((cchain(K2,E00,k)[1]-E00)[1:])-CFG['neck_len'],.5,3.)   # проба: длину шеи добирают тела C3–C7
_,f0=cchain(K2,E00); TH_DY,TH_DZ=float(PC[1]-f0[1]),float(PC[2]-f0[2])   # грудной блок — под шею, подвешенную к черепу
E0=E00+np.array([0,TH_DY,TH_DZ]); CH,fend=cchain(K2,E0)
assert np.linalg.norm((fend-PC)[1:])<1e-6, fend-PC
buildTrunk()
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
def place(i):                                         # преобразование позвонка i (2 — C2, 1 — атлас на суставных отростках C2)
    r=RAW[max(i,2)]; T=CH[max(i,2)]; Rr=rotX(T['th']-r['th'])
    if i==1: d=atlShift(K2); return lambda v,Rr=Rr,r=r,T=T,d=d:(Rr@(S_T*(np.asarray(v)-r['inf'])+d).T).T+T['inf']
    A=scaleAlong(r['th'],K2 if i==2 else K_C); return lambda v,Rr=Rr,A=A,r=r,T=T:(Rr@A@(np.asarray(v)-r['inf']).T).T+T['inf']
vnew=np.empty_like(vc); owner={}
for i,g in zip((1,2,3,4,5,6,7),VG): owner.update({k_:i for k_ in g})
FRONT={i:((vc[g]-RAW[i]['inf'])@np.array([0,-np.sin(np.radians(RAW[i]['th'])),np.cos(np.radians(RAW[i]['th']))]))[np.abs(vc[g][:,0])<.8].max() for i,g in zip(range(2,8),VG[1:])}
for j,g in enumerate(DG):                             # диск C(j+2)/C(j+3): между верхней пластинкой нижнего и нижней верхнего, повёрнут
    lo,hi=j+3,j+2; o,n,_=DI[j]; ctr=(CH[lo]['sup']+CH[hi]['inf'])/2   # как его позвонки относительно HAT (в среднем)
    Rr=rotX(((CH[lo]['th']-RAW[lo]['th'])+(CH[hi]['th']-RAW[hi]['th']))/2)
    vnew[g]=(Rr@scaleAlong(tilt(n),K_C)@(shallow(vc[g],o,tilt(n))-o).T).T+ctr
cent={i:vc[g].mean(0) for i,g in zip((1,2,3,4,5,6,7),VG)}
for g in G:                                           # позвонки и мелкие обломки сетки (к ближайшему позвонку)
    if 20<len(g)<=100: continue
    i=owner.get(g[0]) or min(cent,key=lambda k_:np.linalg.norm(vc[g].mean(0)-cent[k_]))
    own=next((k_ for k_,gg in zip(range(1,8),VG) if gg is g),None)   # сам позвонок C2…C7 (не атлас и не обломок)
    v=shallow(vc[g],RAW[own]['inf'],RAW[own]['th'],FRONT[own]) if own and own>=2 else vc[g]
    vnew[g]=place(i)(v)
DISC_CT=(E0+CH[7]['inf'])/2                           # центр диска C7/T1 — ось нижнего шарнира шеи (B.neckPivot)
bc={i:(CH[i]['inf']+CH[i]['sup'])/2 for i in range(3,8)}
print('шея: T1 — пластинка',np.round(E0,2),'наклон %.1f°'%TH_T1,'; ямки атласа',np.round(PC,2),'; угол C7/T1 %.1f°, масштаб позвонков вдоль оси %.3f'%(J_CT,S_T*K_C))
print('  клинья дисков к HAT %.1f° (C7/T1 %.1f°); C2 + атлас к черепу %.1f°; тело C2 ×%.3f вдоль оси, C2 + атлас %.2f см; T1 → атлас %.2f см, атлас впереди T1 на %.2f см; грудной блок: наклон %.1f°, сдвиг %.2f / %.2f см'%(
    S_W,J_CT,CH[2]['th']-RAW[2]['th'],K2,np.linalg.norm((PC-CH[2]['inf'])[1:]),np.linalg.norm((PC-E0)[1:]),PC[2]-E0[2],TH_PITCH,TH_DY,TH_DZ))
_c2=vnew[VG[1]]; _ax=sag(CH[2]['th']); _h=(_c2[np.abs(_c2[:,0])<1.]-CH[2]['inf'])@_ax
print('  шаг тел C3→C6:',' '.join('%.2f'%np.linalg.norm(bc[i+1]-bc[i]) for i in (3,4,5)),'; центр диска C7/T1 (рамка шеи)',np.round(DISC_CT-neckO,2),'; высота C2 (от нижней пластинки до верхушки зуба вдоль оси) %.2f см'%_h.max())
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
    add(nm,'','head',(jawP(v) if nm=='jaw' else skullP(v))-headO,f,t)

# ---------- правая рука (левая — зеркально) ----------
ARM=chain('arm/assets/myoarm_r_chain.xml','arm/assets/myoarm_r_assets.xml','clavicle_r')
# центр плечевого сустава от грудино-ключичного — B.ghRel (правая сторона). Лопатка — в натуральную величину (×S_T),
# суставной впадиной на центре плечевого сустава манекена (головка плечевой кости в ней); ключица — от грудино-ключичного
# сустава к акромиально-ключичному этой лопатки (растянута по длине). Поворот — тот, что совмещает направления
# «грудино-ключичный → плечевой сустав» модели и манекена.
gh=P(ARM,'scapphant_r'); ac=P(ARM,'clavphant_r'); tgt=np.array([-17.0,-3.1,-4.]); Rg_=rot_between(gh,tgt)
# Лопатка на рёбрах: так поставленная, лопатка MoBL уходит телом на 1,5–2 см в грудную клетку манекена (у живого
# человека между рёбрами и лопаткой — подлопаточная и передняя зубчатая мышцы). Поворачиваем её вокруг центра
# плечевого сустава — вокруг вертикали и поперечной оси — на наименьшие углы, при которых передняя поверхность лежит
# не ближе SCAP_GAP см к оболочке рёбер; ключица потом идёт к новому положению акромиона.
SCAP_GAP=CFG.get('scap_gap',0.8); SC_R=np.array([-2.,28.5,4.])        # грудино-ключичный сустав справа — как B.sc
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
