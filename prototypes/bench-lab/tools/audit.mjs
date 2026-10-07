import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {CAMERAS,DIM,VARIANTS,V,makePose,sampleCycle,torsoPoint} from '../src/model.mjs';
import {PROFILES,REGIONS,muscleValues,MUSCLE_TREE} from '../src/muscles.mjs';
import {createScene} from '../src/scene.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bend=(a,b,c)=>Math.acos(Math.max(-1,Math.min(1,V.dot(V.unit(V.sub(a,b)),V.unit(V.sub(c,b))))))*180/Math.PI;
const pointSegment=(p,a,b)=>{const d=V.sub(b,a),t=Math.max(0,Math.min(1,V.dot(V.sub(p,a),d)/V.dot(d,d)));return V.distance(p,V.add(a,d,t));};
export function audit({samples=101,poseFactory=makePose,profiles=PROFILES,sceneCheck=true,sceneFactory=createScene}={}){
  if(!Number.isInteger(samples)||samples<21||samples>1001)throw Error('samples must be an integer from 21 to 1001');
  const errors=new Map(),stats={variants:2,poses:0,phaseFrames:0,scenePoses:0,cameraPoses:0,checks:0};
  function check(ok,rule,variant,depth,detail){stats.checks++;if(!ok&&!errors.has(`${variant}:${rule}`))errors.set(`${variant}:${rule}`,{rule,variant,depth,detail});}
  for(const variant of Object.keys(VARIANTS)){
    const first=poseFactory(0,variant);let previous;
    for(let i=0;i<samples;i++){
      const t=i/(samples-1),p=poseFactory(t,variant),j=p.joints;stats.poses++;
      for(const [name,point]of Object.entries({...j,bar:p.bar,...p.supports})){
        check(Array.isArray(point)&&point.length===3&&point.every(Number.isFinite),'finite:'+name,variant,t,'Non-finite position');
        if(previous&&j[name]&&previous.joints[name])check(V.distance(point,previous.joints[name])<.025*100/(samples-1),'continuity:'+name,variant,t,'Joint jumps between samples');
      }
      for(const side of ['L','R']){
        for(const [a,b,length]of [['shoulder','elbow',DIM.upperArm],['elbow','wrist',DIM.forearm],['hip','knee',DIM.thigh],['knee','ankle',DIM.shin]])check(Math.abs(V.distance(j[a+side],j[b+side])-length)<1e-8,'bone:'+a+'-'+b+side,variant,t,'Bone length changed');
        check(Math.hypot(j['grip'+side][1]-p.bar[1],j['grip'+side][2]-p.bar[2])<1e-7,'grip:'+side,variant,t,'Palm leaves the actual bar axis');
        check(Math.abs(j['grip'+side][0])<p.equipment.bar.halfLength-.20,'grip-on-shaft:'+side,variant,t,'Grip reaches sleeve or leaves shaft');
        check(Math.abs(V.distance(j['wrist'+side],j['grip'+side])-DIM.palmOffset)<1e-8,'wrist-palm:'+side,variant,t,'Wrist/palm offset changes');
        const elbow=bend(j['shoulder'+side],j['elbow'+side],j['wrist'+side]);
        check(elbow>65&&elbow<177.5,'elbow-range:'+side,variant,t,`Elbow angle ${elbow.toFixed(2)}`);
        if(t===1)check(V.unit(V.sub(j['wrist'+side],j['elbow'+side]))[1]>Math.cos(15*Math.PI/180),'bottom-forearm:'+side,variant,t,'Forearm is more than 15° from vertical in the lower point');
        const knee=bend(j['hip'+side],j['knee'+side],j['ankle'+side]);check(knee>45&&knee<135,'knee-range:'+side,variant,t,`Knee angle ${knee.toFixed(2)}`);
        check(V.distance(j['ankle'+side],first.joints['ankle'+side])<1e-8,'foot-drift:'+side,variant,t,'Foot support drifts');
        for(const name of ['heel','toe'])check(Math.abs(p.supports[name+side][1]-DIM.floor)<1e-8,'floor:'+name+side,variant,t,'Foot is above/below floor');
        for(const name of ['upperArm','forearm']){
          const f=p.frames[name+side];check(['x','y','z'].every(k=>Math.abs(V.len(f[k])-1)<1e-7)&&Math.abs(V.dot(f.x,f.y))<1e-7&&Math.abs(V.dot(f.y,f.z))<1e-7&&V.distance(V.cross(f.x,f.y),f.z)<1e-7,'rotation:'+name+side,variant,t,'Bone frame is not right-handed/orthonormal');
        }
      }
      check(V.distance(p.hip,first.hip)<1e-8&&V.distance(p.shoulder,first.shoulder)<1e-8,'body-support-drift',variant,t,'Torso/pelvis lifts off support');
      const b=p.equipment.bench;
      check(Math.abs(V.dot(b.u,b.n))<1e-8&&V.dot(b.n,p.n)>.999,'bench-side',variant,t,'Pad normal points away from the back');
      check(Math.abs(Math.asin(b.u[1])*180/Math.PI-VARIANTS[variant].incline)<1e-7,'bench-angle',variant,t,'Wrong incline');
      for(const name of ['scapulaL','scapulaR','head']){
        const q=V.sub(p.supports[name],b.top),normal=V.dot(q,b.n),along=V.dot(q,b.u);
        check(Math.abs(normal)<.002&&along>.01&&along<b.length-.025&&Math.abs(q[0])<b.width/2-.012,'bench-contact:'+name,variant,t,'Support outside pad or contact gap');
      }
      check(Math.abs(p.equipment.bar.axis[0]-1)<1e-8&&V.len(p.equipment.bar.axis)>0.999,'bar-axis',variant,t,'Bar rotates independently of hands');
      for(const plate of p.equipment.bar.plateCenters){
        check(plate[1]-p.equipment.bar.plateRadius>0,'plate-floor',variant,t,'Plate enters floor');
        check(Math.abs(plate[0])>b.width/2+.15,'plate-bench',variant,t,'Plate intersects pad');
      }
      const h=V.dot(V.sub(p.bar,p.hip),p.u);
      if(h>=0&&h<=DIM.torso){const surface=torsoPoint(p,h,0);check(V.dot(V.sub(p.bar,surface),p.n)-p.equipment.bar.radius>=-.001,'bar-chest-clearance',variant,t,'Bar penetrates actual torso envelope');}
      check(pointSegment(p.head,V.add(p.bar,[-1,0,0],DIM.barHalf),V.add(p.bar,[1,0,0],DIM.barHalf))>.14,'bar-head-clearance',variant,t,'Bar crosses the head');
      for(const sign of [-1,1]){
        const r=p.equipment.rack,barX=sign*r.halfWidth;
        check(Math.abs(p.bar[2]-r.z)>.055,'bar-rack-clearance',variant,t,`Bar crosses post at x=${barX}`);
      }
      previous=p;
    }
    const profile=profiles[variant];check(profile?.basis==='illustrative','muscle-basis',variant,0,'Curve must be labelled illustrative');
    for(const r of REGIONS){
      const curves=profile?.regions?.[r.id];
      const valid=['concentric','eccentric'].every(k=>Array.isArray(curves?.[k])&&curves[k].length===3&&curves[k].every(v=>Number.isFinite(v)&&v>=0&&v<=1));
      check(valid,'muscle-curve:'+r.id,variant,0,'Invalid/missing region curve');
      if(valid)check(curves.concentric[0]===curves.eccentric[0]&&curves.concentric[2]===curves.eccentric[2],'muscle-turn:'+r.id,variant,0,'Colour flashes at phase boundaries');
    }
    if(REGIONS.every(r=>profile?.regions?.[r.id]))for(let i=0;i<=400;i++){
      const frame=sampleCycle(i/400),values=muscleValues(frame,variant,profiles);stats.phaseFrames++;
      check(Object.values(values).every(v=>Number.isFinite(v)&&v>0&&v<=1),'phase-values',variant,i/400,'Invalid colour or load disappears during hold');
    }
  }
  check(MUSCLE_TREE.triceps_brachii.regions.triceps_medial.scope==='deep-not-drawn','anatomy-scope','all',0,'Deep medial head must not be presented as a superficial region');
  if(sceneCheck){
    const view=sceneFactory();const raycaster=new THREE.Raycaster();
    for(const [width,height]of [[390,350],[900,650]]){
      view.resize(width,height);
      for(const variant of Object.keys(VARIANTS))for(let i=0;i<=20;i++){
        const t=i/20,p=poseFactory(t,variant);view.apply(p,muscleValues({depth:t,phase:'concentric'},variant,profiles));if(i===0)view.resize(width,height);stats.scenePoses++;
        for(const [group,a,b,length]of [['upperArm','shoulder','elbow',DIM.upperArm],['forearm','elbow','wrist',DIM.forearm],['thigh','hip','knee',DIM.thigh],['shin','knee','ankle',DIM.shin]])for(const side of ['L','R']){
          const g=view.rigGroups[group+side],start=new THREE.Vector3().applyMatrix4(g.matrixWorld).toArray(),end=new THREE.Vector3(0,0,length).applyMatrix4(g.matrixWorld).toArray();
          check(V.distance(start,p.joints[a+side])<1e-7&&V.distance(end,p.joints[b+side])<1e-7,'rendered-bone:'+group+side,variant,t,'Rendered bone differs from audited skeleton');
        }
        for(const side of ['L','R']){
          const actual=view.rigGroups['hand'+side].getWorldPosition(new THREE.Vector3()).toArray();check(V.distance(actual,p.joints['grip'+side])<1e-7,'rendered-grip:'+side,variant,t,'Rendered hand leaves model grip');
          const sole=view.scene.getObjectByName('sole'+side),bounds=new THREE.Box3().setFromObject(sole);
          check(Math.abs(bounds.min.y)<.001,'rendered-floor:'+side,variant,t,'Rendered sole is not on the floor');
        }
        for(const name of ['scapulaL','scapulaR','head']){
          const q=p.supports[name];let gap=Infinity;
          // Avoid a ray landing exactly on a shared triangle vertex at a sphere pole.
          for(const offset of [0,.0002,-.0002]){
            const origin=V.add(V.add(V.add(q,p.n,-.03),[offset,0,0]),p.u,Math.abs(offset));raycaster.set(new THREE.Vector3(...origin),new THREE.Vector3(...p.n));
            const hits=raycaster.intersectObject(view.body,true);if(hits.length)gap=Math.min(gap,Math.abs(hits[0].distance-.03));
          }
          check(gap<.005,'rendered-support:'+name,variant,t,`Drawn body/support gap ${gap.toFixed(5)}`);
          raycaster.set(new THREE.Vector3(...V.add(q,p.n,.03)),new THREE.Vector3(...p.n.map(v=>-v)));
          const padHits=raycaster.intersectObject(view.scene.getObjectByName('backrest'));
          const padGap=padHits.length?Math.abs(padHits[0].distance-.03):Infinity;
          check(padGap<.002,'rendered-pad-contact:'+name,variant,t,`Drawn pad/contact gap ${padGap.toFixed(5)}`);
        }
        const positions=[];
        view.scene.traverse(o=>{if(!o.isMesh||o.name==='floor')return;const attr=o.geometry.getAttribute('position');
          for(let j=0;j<attr.count;j++){
            const v=new THREE.Vector3().fromBufferAttribute(attr,j).applyMatrix4(o.matrixWorld);
            if(j%7===0)positions.push(v);check([v.x,v.y,v.z].every(Number.isFinite),'rendered-finite:'+o.name,variant,t,'NaN in drawn mesh');
          }});
        for(const [cameraId,cam]of Object.entries(view.cameras)){
          stats.cameraPoses++;const poseBefore=JSON.stringify(p);let outside=0;
          for(const v of positions){const q=v.clone().project(cam);if(Math.abs(q.x)>.987||Math.abs(q.y)>.987||q.z<-1||q.z>1)outside++;}
          check(!outside,'camera-crop:'+cameraId,variant,t,`${outside} sampled rendered vertices are clipped at ${width}×${height}`);
          check(JSON.stringify(p)===poseBefore,'camera-pose-integrity:'+cameraId,variant,t,'Camera changes pose');
        }
        for(const m of view.muscleMeshes){check(REGIONS.some(r=>r.id===m.userData.region),'region-coverage:'+m.name,variant,t,'Drawn region lacks declared profile');}
      }
    }
    view.dispose();
  }
  return{prototype:'bench-lab',version:'0.1.0',stats,errors:[...errors.values()],limitations:[
    'Educational geometry and declared contacts, not an individual medical/biomechanical clearance.',
    'Colour curves are illustrative. Sources support qualitative regional differences, not these numerical knots or muscle force.',
    'Three pectoral surface regions. Triceps uses a shared group profile; deep medial head is not drawn.',
    'Rendered contact/cropping checks sample meshes. They are not a general collision solver for every pair of objects.',
    'SVG fallback is checked; actual Android WebGL speed and appearance require review on the phone.'
  ]};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=audit();await fs.mkdir(path.join(root,'public'),{recursive:true});await fs.writeFile(path.join(root,'public/audit-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Bench lab: ${report.stats.poses} poses, ${report.stats.phaseFrames} phase frames, ${report.stats.cameraPoses} camera projections, ${report.stats.checks} checks; ${report.errors.length} errors.`);
  for(const e of report.errors)console.error(`${e.variant} / ${e.rule} @ ${e.depth}: ${e.detail}`);
  process.exitCode=report.errors.length?1:0;
}
