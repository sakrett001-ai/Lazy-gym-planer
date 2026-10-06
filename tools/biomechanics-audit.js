#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/* Test the model, not a browser projection. No build, DOM package or Playwright needed. */
function loadModel({root = path.resolve(__dirname, '..'), fullApp = false} = {}) {
  const storage = new Map();
  const document = {addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement:() => ({style:{}, addEventListener() {}}), body:{appendChild() {}}};
  const context = {console, document, navigator:{}, location:{},
    localStorage:{getItem:k => storage.get(k) ?? null, setItem:(k,v) => storage.set(k, String(v)), removeItem:k => storage.delete(k)},
    setTimeout:() => 0, clearTimeout() {}, setInterval:() => 0, clearInterval() {},
    requestAnimationFrame:() => 0, cancelAnimationFrame() {}, matchMedia:() => ({matches:false})};
  context.window = context;
  vm.createContext(context);
  const dir = path.join(root, 'src/js');
  const files = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && Number.parseInt(f) < (fullApp ? 99 : 11)).sort();
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(dir, file), 'utf8'), context, {filename:file, timeout:10000});
  const get = expression => vm.runInContext(expression, context, {timeout:10000});
  const api = get('({EX, FL, prepAnim, poseAt, solvePose, spatialPose, camera3})');
  return {...api, get};
}

const distance = (a,b) => Array.isArray(a) && Array.isArray(b) ? Math.hypot(...a.map((x,i) => x - b[i])) : Infinity;
const dot = (a,b) => a.reduce((sum,x,i) => sum + x*b[i], 0);
const sub = (a,b) => a.map((x,i) => x - b[i]);
const angle2 = (a,b) => (Math.atan2(b[0]-a[0], a[1]-b[1])*180/Math.PI + 360)%360;
const bend3 = (root,joint,end) => Math.acos(Math.max(-1, Math.min(1,
  dot(sub(joint,root), sub(end,joint)) / (distance(root,joint)*distance(joint,end))))) * 180/Math.PI;

/* Only assert contacts specified by this exercise. Hanging feet and raised heels are free. */
const CONTACT_RULES = {
  bbbench:{bar:true, anchors:['anL','anR'], ground:['anL','anR'], bench:true},
  dbbench:{anchors:['anL','anR'], ground:['anL','anR'], bench:true, dumbbells:true},
  bbrow:{bar:true, anchors:['anL','anR'], ground:['anL','anR']},
  latpull:{bar:true, anchors:['anL','anR'], ground:['anL','anR']},
  deadlift:{bar:true, anchors:['anL','anR'], ground:['anL','anR'], straightArms:true},
  dbpress:{anchors:['anL','anR'], ground:['anL','anR'], dumbbells:true},
  ohp:{bar:true, anchors:['anL','anR'], ground:['anL','anR']},
  chinup:{bar:true, anchors:['gripL','gripR']},
  hipthrust:{bar:true, anchors:['anL','anR','backContact'], ground:['anL','anR']},
  bulgarian:{anchors:['anL','anR'], ground:['anL'], dumbbells:true},
  rdl:{bar:true, anchors:['anL','anR'], ground:['anL','anR'], straightArms:true, dumbbells:true},
  squat:{bar:true, anchors:['anL','anR'], ground:['anL','anR']},
  lunge:{anchors:['toeL','toeR'], ground:['toeL','toeR'], dumbbells:true}
};

function auditModel(model, {samples = 101, only = 'all'} = {}) {
  if (!Number.isInteger(samples) || samples < 9 || samples > 2001) throw new Error('samples must be an integer from 9 to 2001');
  if (!['all','side','spatial'].includes(only)) throw new Error('only must be all, side or spatial');
  const {EX, FL, prepAnim, poseAt, solvePose, spatialPose, camera3} = model;
  const failures = new Map(), warnings = new Map();
  const stats = {exercises:0, spatialExercises:0, poses:0, cameraPoses:0, checks:0};
  function check(ok, ex, rule, t, detail, magnitude = 1) {
    stats.checks++;
    if (ok) return;
    const key = ex.id + ':' + rule;
    const old = failures.get(key);
    if (!old || magnitude > old.magnitude) failures.set(key, {exercise:ex.id, rule, t, detail, magnitude});
  }
  function warn(ex, rule, t, detail, magnitude = 1) {
    const key = ex.id + ':' + rule;
    const old = warnings.get(key);
    if (!old || magnitude > old.magnitude) warnings.set(key, {exercise:ex.id, rule, t, detail, magnitude});
  }
  for (const ex of EX) {
    const a = ex.anim;
    if (!a) { check(false, ex, 'missing-animation', 0, 'Exercise has no animation'); continue; }
    const spatial = typeof a.rig3d === 'function';
    if (only === 'spatial' && !spatial || only === 'side' && (spatial || a.view !== 'side')) continue;
    stats.exercises++;
    if (spatial) stats.spatialExercises++;
    prepAnim(a);
    const rules = CONTACT_RULES[ex.id];
    if (spatial && !rules) warn(ex, 'contact-coverage', 0, 'Add explicit grip/support rules for this new rig');
    const first = spatial ? a.rig3d(0) : null;
    let previous;
    for (let i=0; i<samples; i++) {
      const t = i/(samples-1), P = poseAt(a,t), J = spatial ? a.rig3d(t) : solvePose(a,P,a._C);
      stats.poses++;
      for (const [key,p] of Object.entries(J)) if (Array.isArray(p) && typeof p[0] === 'number') {
        const finite = p.every(Number.isFinite);
        check(finite, ex, 'finite:'+key, t, 'Joint coordinates must be finite');
        if (finite && previous?.[key]) {
          const step = distance(p,previous[key]);
          /* Scale threshold to sampling density; a hard discontinuity remains detectable. */
          check(step <= 12 * 100/(samples-1), ex, 'continuity:'+key, t, `Jump ${step.toFixed(4)} model units`, step);
        }
      }
      if (spatial) {
        for (const side of ['L','R']) {
          for (const [x,y,length] of [['sh'+side,'el'+side,FL.ua],['el'+side,'wr'+side,FL.fa],['hip'+side,'kn'+side,FL.th],['kn'+side,'an'+side,FL.sh]]) {
            const error = Math.abs(distance(J[x],J[y])-length);
            check(error < 1e-4, ex, 'bone:'+x+'-'+y, t, `Length error ${error.toFixed(6)}`, error);
          }
          if (rules?.bar) {
            /* Bar axis is X; the hand may slide along its width, but not leave its Y/Z line. */
            const error = Math.hypot(J['grip'+side][1]-J.bar[1], J['grip'+side][2]-J.bar[2]);
            check(error <= .75, ex, 'grip:'+side, t, `Hand/bar gap ${error.toFixed(4)} model units`, error);
          }
          if (rules?.straightArms) {
            const bend = bend3(J['sh'+side],J['el'+side],J['wr'+side]);
            check(bend <= 5, ex, 'straight-arm:'+side, t, `Elbow flexion ${bend.toFixed(3)} degrees`, bend);
          }
          if (rules?.bench && t >= .9) {
            const headward = dot(sub(J['el'+side],J['sh'+side]),J.u);
            check(headward <= 0, ex, 'bench-elbow:'+side, t, 'At the bottom, elbow must not point toward the head', headward);
          }
          if (['ohp','dbpress'].includes(ex.id) && t < .85) {
            const forward = dot(sub(J['el'+side],J['sh'+side]),J.n);
            check(forward >= -2, ex, 'press-elbow:'+side, t, 'Elbow is behind the shoulder plane', -forward);
          }
        }
        for (const key of rules?.anchors || []) {
          const error = distance(J[key],first[key]);
          check(error < 1e-4, ex, 'anchor:'+key, t, `Support drift ${error.toFixed(4)} model units`, error);
        }
        /* World-space support centers lie at Y=180; the foot surface/marker is drawn lower. */
        for (const key of rules?.ground || []) {
          const error = Math.abs(J[key][1]-180);
          check(error < 1e-4, ex, 'ground:'+key, t, `Support is ${error.toFixed(4)} units off the floor plane`, error);
        }
        if (rules?.dumbbells) {
          const props = J.props.filter(p => p.kind === 'dumbbell');
          for (const prop of props) {
            const error = Math.min(distance(prop.c,J.gripL),distance(prop.c,J.gripR));
            check(error <= .75, ex, 'dumbbell-contact', t, `Hand/dumbbell gap ${error.toFixed(4)} model units`, error);
          }
        }
        if (rules?.bench) {
          const bench = J.props.find(p => p.kind === 'box' && p.lo[1] === 136);
          check(!!bench, ex, 'bench-present', t, 'Support bench missing');
          if (bench) for (const key of ['head','sh','hip']) {
            const margin = key === 'head' ? 9 : 0;
            check(J[key][2]-margin >= bench.lo[2] && J[key][2]+margin <= bench.hi[2], ex, 'bench-support:'+key, t, 'Body point falls outside the bench length');
          }
        }
        const savedCamera = a.camera;
        try {
          for (const camera of a.cameras || [savedCamera || 'side']) {
            a.camera = camera;
            const projected = spatialPose(a,t), project = camera3(camera);
            stats.cameraPoses++;
            for (const key of ['hip','head','shL','shR','elL','elR','wrL','wrR','knL','knR','anL','anR']) {
              const expected = project(J[key]).slice(0,2), actual = projected[key];
              const error = distance(actual,expected);
              check(error < 1e-4, ex, 'camera:'+camera+':'+key, t, 'Cameras must project the same world pose', error);
            }
          }
        } finally { a.camera = savedCamera; }
      } else if (a.view === 'side') {
        for (const side of ['N','F']) {
          for (const [x,y,length] of [['sh','el'+side,FL.ua],['el'+side,'wr'+side,FL.fa],['hip','kn'+side,FL.th],['kn'+side,'an'+side,FL.sh]]) {
            const error = Math.abs(distance(J[x],J[y])-length);
            check(error < 1e-4, ex, 'bone:'+x+'-'+y, t, `Length error ${error.toFixed(6)}`, error);
          }
          /* A 2D bend sign is a visual-review flag, not proof of an anatomical violation.
             Shoulder rotation and out-of-plane limbs can reverse the projected sign. */
          const elbow = (angle2(J['el'+side],J['wr'+side])-angle2(J.sh,J['el'+side])+360)%360;
          if (elbow > 10 && elbow < 170) warn(ex, 'projected-elbow:'+side, t, 'Review elbow in another projection', Math.min(elbow,180-elbow));
          const knee = (angle2(J['kn'+side],J['an'+side])-angle2(J.hip,J['kn'+side])+360)%360;
          if (knee > 190 && knee < 350) warn(ex, 'projected-knee:'+side, t, 'Review knee in another projection', Math.min(knee-180,360-knee));
        }
      }
      previous = J;
    }
  }
  return {stats, failures:[...failures.values()], warnings:[...warnings.values()],
    limitations:['This audits schematic geometry and declared contacts; it does not validate medical safety, individual mobility, muscle force or unmodeled collisions.', 'Front-view 2D poses have no anatomical depth; projected limb lengths and bend signs are not used as 3D evidence.']};
}

function elbowProfile(model) {
  for (const ex of model.EX.filter(e => e.anim.rig3d)) {
    console.log(ex.id);
    for (const t of [0,.25,.5,.75,1]) {
      const R = ex.anim.rig3d(t);
      console.log('  '+t+' '+['L','R'].map(s => {
        const d = sub(R['el'+s],R['sh'+s]);
        return `${s}: forward=${dot(d,R.n).toFixed(2)}, headward=${dot(d,R.u).toFixed(2)}, lateral=${d[0].toFixed(2)}`;
      }).join(' | '));
    }
  }
}

function main(args) {
  const opts = {};
  let json = false, elbows = false;
  for (let i=0; i<args.length; i++) {
    if (args[i] === '--samples') opts.samples = Number(args[++i]);
    else if (args[i] === '--only') opts.only = args[++i];
    else if (args[i] === '--json') json = true;
    else if (args[i] === '--elbows') elbows = true;
    else if (args[i] === '--help') { console.log('node tools/biomechanics-audit.js [--samples 101] [--only all|side|spatial] [--json] [--elbows]'); return; }
    else throw new Error('Unknown argument: '+args[i]);
  }
  const model = loadModel();
  if (elbows) { elbowProfile(model); return; }
  const report = auditModel(model,opts);
  if (json) console.log(JSON.stringify(report,null,2));
  else {
    console.log(`Biomechanics: ${report.stats.exercises} exercises, ${report.stats.poses} poses, ${report.stats.cameraPoses} camera poses; ${report.failures.length} errors, ${report.warnings.length} review flags.`);
    for (const f of report.failures) console.log(`ERROR ${f.exercise} / ${f.rule} @ ${f.t.toFixed(3)}: ${f.detail}`);
    for (const f of report.warnings) console.log(`REVIEW ${f.exercise} / ${f.rule} @ ${f.t.toFixed(3)}: ${f.detail}`);
  }
  process.exitCode = report.failures.length ? 1 : 0;
}

module.exports = {loadModel, auditModel, CONTACT_RULES, main};
if (require.main === module) {
  try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 1; }
}
