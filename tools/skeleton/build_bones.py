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
def add(name,side,seg,v,f,target,**extra):
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
    for k in ('pivot','mcp'):
        if k in o: o[k]=[[-p[0],p[1],p[2]] for p in o[k]]
    if 'frame' in o: o['frame']={k:[-v_[0],v_[1],v_[2]] if k!='len' else v_ for k,v_ in o['frame'].items()}
    return o

# ---------- таз, крестец, позвоночник, грудная клетка ----------
LEG=chain('leg/assets/myolegs_chain.xml','leg/assets/myolegs_assets.xml','pelvis')
TOR=chain('torso/assets/myotorso_chain.xml','torso/assets/myotorso_assets.xml','sacrum')
hjR,hjL=P(LEG,'femur_r'),P(LEG,'femur_l'); mid=(hjR+hjL)/2; sx=B['hipHalf']/abs(hjL[0]-mid[0])
CFG=json.load(open(os.environ['SKEL_CFG'])) if os.environ.get('SKEL_CFG') else {}
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../qa/skeleton/bones.json')
TH_PITCH=CFG.get('th_pitch',12.0); TH_DY=CFG.get('th_dy',0.0); TH_DZ=CFG.get('th_dz',1.0); RIB_X=CFG.get('rib_x',.96)
PIV=np.array([0,24.,-12.])   # ось наклона грудного блока: на уровне шарнира грудного отдела, у задней поверхности
def thoraxFit(q,w):
    a=np.radians(TH_PITCH*w); c,s_=np.cos(a),np.sin(a); d=np.asarray(q)-PIV
    y=d[:,1]*c-d[:,2]*s_; z=d[:,1]*s_+d[:,2]*c
    return np.stack([d[:,0],y,z],-1)+PIV+np.array([0,TH_DY*w,TH_DZ*w])
def pelvisMap(v): return (np.asarray(v)-mid)*np.array([sx,S_T,S_T])
for nm,side in (('r_pelvis','R'),('l_pelvis','L')):
    v,f=mesh(LEG,nm); add('pelvis_'+side,side,'pelvis',pelvisMap(v),f,900)
v,f=mesh(TOR,'sacrum_geom_1_sacrum'); add('sacrum','',  'pelvis',pelvisMap(v),f,500)
def trunkMap(v,w):
    """w — доля смещения грудного блока (0 у крестца, 1 у Th12 и выше)"""
    return thoraxFit((np.asarray(v)-mid)*np.array([S_T,S_T,S_T]),w)
yS=float(pelvisMap(mesh(TOR,'sacrum_geom_1_sacrum')[0])[:,1].max()); yT12=float(trunkMap(mesh(TOR,'torso_geom_1_thoracic12_s')[0],0)[:,1].mean())
for i in (5,4,3,2,1):
    v,f=mesh(TOR,f'lumbar{i}_geom_1_lumbar{i}'); yc=float(trunkMap(v,0)[:,1].mean()); w=float(np.clip((yc-yS)/(yT12-yS),0,1))
    q=trunkMap(v,w); h=float(q[:,1].mean()); add(f'L{i}','','spine',q-np.array([0,h,0]),f,260,h=round(h,2))
TH0=np.array([0,24.,0])   # начало рамки грудной клетки манекена в рамке таза (нейтральная поза)
for (b,m,file,Rg,pg) in TOR['meshes']:
    if b!='torso': continue
    v,f=load(file,Rg,pg); q=trunkMap(M(v),1)
    if 'ribcage' in m:
        q=q*np.array([RIB_X,1,1])
        add('ribcage','','thorax',q-TH0,f,5200)
    else: add(m.split('_')[-2],'','thorax',q-TH0,f,240)

# ---------- шея и череп (геометрия HAT в рамке туловища Rajagopal: начало в (−10,07; 8,15; 0) см от таза) ----------
HD=chain('head/assets/myohead_rigid_chain.xml','head/assets/myohead_simple_assets.xml','neck')
off=np.array([-10.07,8.15,0.])
def hat(m): v,f=mesh(HD,m); return trunkMap(v+M(off),1),f
# начала рамок шеи и головы и центр головы в рамке таза (нейтральная поза): 24 + B.c7, + B.headJoint, + B.headCenter
neckO=np.array([0,61.2,-4]); headO=np.array([0,70.7,-0.5]); headC=np.array([0,73.6,1.5])
vc,fc=hat('hat_cervical')
vs,fs=hat('hat_skull'); vj,fj=hat('hat_jaw'); allv=np.vstack([vs,vj]); c=(allv.min(0)+allv.max(0))/2
s_head=CFG.get('s_head',1.0); dhead=np.array(CFG.get('d_head',[0,0,0.]))
skullP=lambda v:(v-c)*s_head+headC+dhead          # череп — в рамке головы манекена (нейтральная поза)
# шейный отдел: тело C7 — к верхней замыкательной пластинке Th1 (как она стоит в грудном блоке), C1 — к основанию черепа
t1=[b for b in bones if b['name']=='thoracic1'][0]; t1v=np.array(t1['v']).reshape(-1,3)+TH0
body=t1v[t1v[:,2]>np.median(t1v[:,2])]; t1top=np.array([0,body[:,1].max(),body[:,2].mean()])
sk=skullP(vs); col=sk[(np.abs(sk[:,0])<1.2)]; zc=np.median(col[:,2]); base=col[(col[:,2]>zc-3)&(col[:,2]<zc+1)]; skb=np.array([0,base[:,1].min(),base[:,2].mean()])
def endpoint(v,top):
    y=v[:,1]; sl=v[(y>y.max()-1.2)] if top else v[(y<y.min()+1.2)]; ant=sl[sl[:,2]>np.median(sl[:,2])]; return np.array([0,ant[:,1].mean(),ant[:,2].mean()])
c0,c1=endpoint(vc,False),endpoint(vc,True); Rn=rot_between(c1-c0,skb-t1top); sn=np.linalg.norm(skb-t1top)/np.linalg.norm(c1-c0)
print('шея: Th1',np.round(t1top,1),'основание черепа',np.round(skb,1),'масштаб',round(sn,3))
add('cervical','','neck',(sn*(Rn@(vc-c0).T)).T+t1top-neckO,fc,1300)
for nm,v,f,t in (('skull',vs,fs,2600),('jaw',vj,fj,900)):
    add(nm,'','head',(v-c)*s_head+headC+dhead-headO,f,t)

# ---------- правая рука (левая — зеркально) ----------
ARM=chain('arm/assets/myoarm_r_chain.xml','arm/assets/myoarm_r_assets.xml','clavicle_r')
# центр плечевого сустава от грудино-ключичного — B.ghRel (правая сторона)
gh=P(ARM,'scapphant_r'); tgt=np.array([-16,-3.1,-4.]); Rg_=rot_between(gh,tgt); sg=np.linalg.norm(tgt)/np.linalg.norm(gh)
girdle=lambda v:(sg*(Rg_@np.asarray(v).T)).T
arm=[]
for nm,t in (('clavicle_r',300),('scapula_r',1100)):
    v,f=mesh(ARM,nm); add(nm[:-2],'R','girdle',girdle(v),f,t); arm.append(bones[-1])
hum=P(ARM,'humerus_r'); el=P(ARM,'ulna_r'); T=long_bone(hum,el,B['ua'],1.0)
v,f=mesh(ARM,'humerus_r'); add('humerus','R','ua',T(v),f,700); arm.append(bones[-1])
wr=P(ARM,'lunate_r'); T=long_bone(el,wr,B['fa'],1.0)
v,f=mesh(ARM,'ulna_r'); add('ulna','R','fa',T(v),f,450); arm.append(bones[-1])
rh=P(ARM,'radius_r'); v,f=mesh(ARM,'radius_r'); add('radius','R','fa',T(v),f,450,pivot=[T(rh[None])[0].round(2).tolist(),[0,-B['fa'],0]]); arm.append(bones[-1])
# кисть: подгонка запястья и пястно-фаланговых суставов к кисти манекена (Умеяма)
FING=[2.9,1.0,-0.9,-2.8]; names=['2proxph_r','3proxph_r','4proxph_r','5proxph_r']
src=np.array([wr]+[P(ARM,n) for n in names]); dst=np.array([[0,0,0]]+[[0.2,-9.6,w] for w in FING])
mu_s,mu_d=src.mean(0),dst.mean(0); X=src-mu_s; Y=dst-mu_d; U,Sv,Vt=np.linalg.svd(Y.T@X); D=np.eye(3); D[2,2]=np.sign(np.linalg.det(U@Vt))
Rh=U@D@Vt; sh=np.trace(np.diag(Sv)@D)/np.sum(X*X); th=mu_d-sh*Rh@mu_s
hand=lambda v:(sh*(Rh@np.asarray(v).T)).T+th
print('кисть: масштаб',round(sh,3),'невязка МЦФ',np.round(np.linalg.norm(hand(src)-dst,axis=1),2))
carp=['lunate','scaphoid','pisiform','triquetrum','capitate','trapezium','trapezoid','hamate','2mc','3mc','4mc','5mc']
for c_ in carp:
    v,f=mesh(ARM,c_+'_r'); add(c_,'R','hand',hand(v),f,110 if 'mc' not in c_ else 180); arm.append(bones[-1])
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
    loc=np.stack([(vh-p0)@np.cross(-a,dz),(vh-p0)@(-a),(vh-p0)@dz],-1)
    return loc,f,float(np.linalg.norm(p1-p0))
for k,(mc,pp,mp,dp) in enumerate([('2','2proxph_r','midph2_r','distph2_r'),('3','3proxph_r','midph3_r','distph3_r'),('4','4proxph_r','midph4_r','distph4_r'),('5','5proxph_r','midph5_r','distph5_r')]):
    for j,(nm,body,child) in enumerate([(mc+'proxph_r',pp,mp),(mc+'midph_r',mp,dp),(mc+'distph_r',dp,None)]):
        loc,f,L=phal(nm,body,child); add(nm[:-2],'R','finger',loc,f,120,finger=k,joint=j,len=round(L,2)); arm.append(bones[-1])
for j,(nm,body,child) in enumerate([('1mc_r','firstmc_r','proximal_thumb_r'),('thumbprox_r','proximal_thumb_r','distal_thumb_r'),('thumbdist_r','distal_thumb_r',None)]):
    loc,f,L=phal(nm,body,child); add(nm[:-2],'R','thumb',loc,f,140,joint=j,len=round(L,2)); arm.append(bones[-1])
for b in arm: bones.append(mirror(b))

# ---------- ноги ----------
for s,sx_ in (('R','r'),('L','l')):
    hj=P(LEG,f'femur_{sx_}'); kn=P(LEG,f'tibia_{sx_}'); an=P(LEG,f'talus_{sx_}'); mtp=P(LEG,f'toes_{sx_}')
    T=long_bone(hj,kn,B['th']); v,f=mesh(LEG,f'{sx_}_femur'); add('femur',s,'th',T(v),f,1100)
    # надколенник: положение по углу колена (полиномы связи из модели), в рамке бедра
    v,f=mesh(LEG,f'{sx_}_patella'); pb=P(LEG,f'patella_{sx_}')
    tx=[0.0524192,-0.0150188,-0.0340522,0.0133393,-0.000879151]; ty=[-0.0108281,-0.0487847,0.00927644,0.0131673,-0.00349673]; rz=[0.010506,0.0247615,-1.31647,0.716337,-0.138302]
    pol=lambda c,t:sum(ci*t**i for i,ci in enumerate(c))
    track=[]
    for deg in range(0,151,10):
        t=np.radians(deg); ang=pol(rz,t); tr=M(np.array([pol(tx,t),pol(ty,t),0])*100)
        track.append([deg,round(float(np.degrees(ang)),2)]+np.round(T((pb+tr)[None])[0],2).tolist())
    # вершины надколенника — относительно его начала, в осях бедра (поворот модели вокруг оси z OpenSim = вокруг −X манекена)
    Tl=long_bone(hj,kn,B['th']); loc=Tl(v)-Tl(pb[None])[0]
    add('patella',s,'th',loc,f,140,track=track)
    T=long_bone(kn,an,B['sk']); v,f=mesh(LEG,f'{sx_}_tibia'); add('tibia',s,'sk',T(v),f,800)
    v,f=mesh(LEG,f'{sx_}_fibula'); add('fibula',s,'sk',T(v),f,400)
    # стопа: голеностоп → (0,0,0), плюснефаланговый сустав → B.ball (0; −5,35; 13,5)
    tgt=np.array([0,-5.35,13.5]); Rf=rot_between(mtp-an,tgt); sf=np.linalg.norm(tgt)/np.linalg.norm(mtp-an); FT=lambda v:(sf*(Rf@(np.asarray(v)-an).T)).T
    for nm,t in ((f'{sx_}_talus',300),(f'{sx_}_foot',1500)):
        v,f=mesh(LEG,nm); add(nm[2:],s,'foot',FT(v),f,t)
    v,f=mesh(LEG,f'{sx_}_bofoot'); add('toes',s,'toes',FT(v)-tgt,f,1200)
    print(s,'стопа: масштаб',round(sf,3),'низ пятки',np.round(FT(mesh(LEG,f'{sx_}_foot')[0]).min(0),2))
tot=sum(len(b['f'])//3 for b in bones); print('костей',len(bones),'треугольников',tot)
os.makedirs(os.path.dirname(os.path.abspath(OUT)),exist_ok=True)
json.dump(dict(bones=bones,source='MyoSim (MyoHub, Apache 2.0): Rajagopal 2016, Holzbaur 2005 (MoBL), lumbar spine model'),open(OUT,'w'))
print(OUT,round(os.path.getsize(OUT)/1024),'КБ')
