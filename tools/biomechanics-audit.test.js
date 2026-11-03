const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadModel, auditModel} = require('./biomechanics-audit');
const model = loadModel();
function corrupted(id, mutate) {
  return {...model, EX:model.EX.filter(ex => ex.id === id).map(ex => ({...ex, anim:{...ex.anim,
    rig3d:t => {const R = ex.anim.rig3d(t); mutate(R,t); return R;}}}))};
}
function detects(id, mutate, rule) {
  const r = auditModel(corrupted(id,mutate));
  assert(r.failures.some(f => f.rule === rule), JSON.stringify(r.failures));
}
function chestRow(mutate) {
  const ex = model.EX.find(e => e.id === 'chestrowdb');
  const anim = {...ex.anim, A:structuredClone(ex.anim.A), B:structuredClone(ex.anim.B), props:structuredClone(ex.anim.props)};
  mutate(anim,ex.anim);
  return {...model, EX:[{...ex,anim}]};
}
test('all poses and cameras satisfy declared geometry and contact constraints', () => {
  const r = auditModel(model), rigs = model.EX.reduce((n, ex) => n + 1 + Object.keys(ex.anim.catalogVariants || {}).length, 0);
  /* 151: +5 прицельных на приводящие и манжету (cableadduct, copenhagen, copenhagenknee, cableextrot, bandextrot) */
  assert.equal(r.stats.exercises,151);
  assert.equal(r.stats.poses,151*101);
  assert.equal(r.stats.cameraPoses,29*101);
  /* три исходных профиля ригов, пять профилей прицельных упражнений на приводящие и манжету и уступающий акцент
     скандинавских сгибаний (09b-muscle-profiles.js) */
  assert.equal(r.stats.muscleProfiles,9);
  assert.equal(r.stats.musclePoses,3*101);
  assert.deepEqual(r.failures,[]);
  /* локоть — по 3D-позам манекена, по всем кадрам и вариантам инвентаря (4.72.0) */
  assert.equal(r.stats.mannequinPoses,rigs*101);
  assert(rigs > 151, 'equipment variants are checked too');
});
/* Переразгибание локтя по 3D-позе манекена (4.72.0). Отрицательный пример: шесть упражнений, которые старое правило
   projected-elbow помечало по плоским 2D-описаниям (12 ложных пометок), в 3D согнуты в локте 3,6–113° — пометок нет. */
test('elbow hyperextension: no flags on the 3D poses the app shows, including the old projected-elbow false flags', () => {
  const ids = ['invrow', 'goodmorning', 'burpee', 'tablerow', 'plankup', 'cableohext'];
  const r = auditModel({...model, EX:model.EX.filter(ex => ids.includes(ex.id))});
  assert.equal(r.warnings.filter(f => /elbow/.test(f.rule)).length, 0, JSON.stringify(r.warnings));
  assert(!r.warnings.some(f => f.rule.startsWith('projected-elbow')), 'the 2D rule is gone');
  for (const id of ids) {
    const ex = model.EX.find(e => e.id === id);
    for (const t of [0, .28, .5, .63, 1]) for (const s of ['L', 'R']) assert(model.Mannequin.jointAngles(ex.anim.catalogRig(t))[s].elbow > 0, `${id} t=${t} ${s}`);
  }
});
/* Положительный пример: подложенная поза — тот же манекен с локтем, разогнутым кинематикой на 25° за прямую линию (не сдвигом
   точек), между ключами (t 0,37–0,39), — правило её ловит; на 4° (в пределах нормы) — молчит */
test('elbow hyperextension: a substituted 3D pose with the elbow bent backwards is flagged between keyframes', () => {
  const M = model.Mannequin, bent = deg => { const q = M.neutral(); q.L.elbow = deg; return M.catalogPose(q); };
  const pose = deg => ({...model, EX:model.EX.filter(ex => ex.id === 'invrow').map(ex => ({...ex, anim:{...ex.anim, catalogVariants:null,
    catalogRig:t => t >= .37 && t <= .39 ? bent(deg) : ex.anim.catalogRig(t)}}))});
  assert(M.jointAngles(bent(-25)).L.elbow < -24, 'the substituted elbow really is hyperextended');
  const r = auditModel(pose(-25)), flag = r.warnings.find(f => f.rule === 'elbow-hyperextension:L');
  assert(flag && flag.t >= .37 && flag.t <= .39 && flag.magnitude > 19, JSON.stringify(r.warnings));
  assert(!r.warnings.some(f => f.rule === 'elbow-hyperextension:R'), 'the other arm is fine');
  assert(!auditModel(pose(-4)).warnings.some(f => /elbow/.test(f.rule)), '4° is within the limit (validator: −5°)');
});
test('detects a transient hand leaving the bar between the old audit keyframes', () => {
  detects('bbrow',(R,t) => {if(t >= .37 && t <= .39) R.gripL[1] += 10;},'grip:L');
});
test('detects changed anatomical bone length', () => {
  detects('deadlift',R => {R.wrR[1] += 10;},'bone:elR-wrR');
});
test('detects a sliding support even when limb lengths remain valid', () => {
  detects('lunge',(R,t) => {R.toeR[2] += 8*t;},'anchor:toeR');
});
test('detects a stationary support that floats above the floor', () => {
  detects('lunge',R => {R.toeR[1] -= 10;},'ground:toeR');
});
test('detects a bench that does not support the head', () => {
  detects('bbbench',R => {R.head[2] -= 25;},'bench-support:head');
});
test('detects an overhead-press elbow behind the shoulder plane', () => {
  detects('ohp',R => {R.elL = R.shL.map((v,i) => v - R.n[i]*20);},'press-elbow:L');
});
test('nonfinite coordinates are failures', () => {
  detects('latpull',R => {R.elR[0] = NaN;},'finite:elR');
});
test('invalid sampling options fail clearly', () => {
  assert.throws(() => auditModel(model,{samples:1}),/samples/);
  assert.throws(() => auditModel(model,{only:'front'}),/only/);
});
test('detects an out-of-range muscle curve instead of hiding it with color clamping', () => {
  const ex=model.EX.find(e=>e.id==='squat'),p=ex.anim.muscleProfile;
  const anim={...ex.anim,muscleProfile:{...p,muscles:{...p.muscles,quads:{...p.muscles.quads,concentric:[.34,1.5,.72]}}}};
  const r=auditModel({...model,EX:[{...ex,anim}]});
  assert(r.failures.some(f=>f.rule==='muscle-curve:quads'));
});
test('detects a missing camera rather than silently accepting the fallback projection', () => {
  const ex=model.EX.find(e=>e.id==='bbbench');
  const r=auditModel({...model,EX:[{...ex,anim:{...ex.anim,cameras:['missing-camera']}}]});
  assert(r.failures.some(f=>f.rule==='camera-defined:missing-camera'));
});
test('detects the original inclined bench placed on the back, with valid bone lengths', () => {
  const r = auditModel(chestRow(anim => {
    const radians = 52*Math.PI/180;
    anim.props.find(p => p.support === 'chest').pts = [-4,64].map(h => [70+Math.sin(radians)*h-10,132-Math.cos(radians)*h-4]);
  }));
  assert(r.failures.some(f => f.rule === 'chest-pad-side'));
  assert(!r.failures.some(f => f.rule.startsWith('bone:')));
});
test('detects a chest pad moved forward without contact', () => {
  const r = auditModel(chestRow(anim => {
    const normal = [Math.cos(52*Math.PI/180),Math.sin(52*Math.PI/180)];
    const pad = anim.props.find(p => p.support === 'chest');
    pad.pts = pad.pts.map(p => p.map((v,k) => v+normal[k]*8));
  }));
  assert(r.failures.some(f => f.rule === 'chest-pad-contact'));
  assert(!r.failures.some(f => f.rule === 'chest-pad-side'));
});
test('detects chest liftoff between keyframes instead of checking only endpoints', () => {
  const r = auditModel(chestRow((anim,original) => {
    anim.sample = t => {
      const P = model.poseAt(original,t);
      if (t >= .37 && t <= .39) P.hip = P.hip.map((v,k) => v-[Math.cos(52*Math.PI/180),Math.sin(52*Math.PI/180)][k]*8);
      return P;
    };
  }));
  const failure = r.failures.find(f => f.rule === 'chest-pad-contact');
  assert(failure && failure.t >= .37 && failure.t <= .39);
  assert(!r.failures.some(f => f.rule.startsWith('bone:')));
});
test('detects an inclined chest pad with the wrong orientation', () => {
  const r = auditModel(chestRow(anim => {
    const pad = anim.props.find(p => p.support === 'chest'), [a,b] = pad.pts;
    const c = a.map((v,k) => (v+b[k])/2), angle = 15*Math.PI/180;
    pad.pts = pad.pts.map(p => {
      const [x,y] = p.map((v,k) => v-c[k]);
      return [c[0]+x*Math.cos(angle)-y*Math.sin(angle),c[1]+x*Math.sin(angle)+y*Math.cos(angle)];
    });
  }));
  assert(r.failures.some(f => f.rule === 'chest-pad-angle'));
});
test('detects a removed chest-support pad', () => {
  const r = auditModel(chestRow(anim => {anim.props = anim.props.filter(p => p.support !== 'chest');}));
  assert(r.failures.some(f => f.rule === 'chest-pad-present'));
});
test('detects a sliding foot in the side-view chest-supported row', () => {
  const r = auditModel(chestRow(anim => {anim.B.leg.ik[0] += 8;}));
  assert(r.failures.some(f => f.rule === 'anchor:anN'));
  assert(r.failures.some(f => f.rule === 'anchor:anF'));
});
