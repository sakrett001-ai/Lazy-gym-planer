const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync, spawnSync} = require('node:child_process');

const script = path.resolve(__dirname, '../deploy.sh');
const git = (cwd, ...args) => execFileSync('git', args, {cwd, encoding:'utf8', stdio:['ignore','pipe','pipe']}).trim();
function write(root, file, text) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, text);
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lazy-gym-deploy-test-'));
  t.after(() => fs.rmSync(root, {recursive:true, force:true}));
  const remote = path.join(root, 'remote.git'), source = path.join(root, 'source'), seed = path.join(root, 'seed');
  git(root, 'init', '--bare', remote);
  git(root, 'init', '-b', 'gh-pages', seed);
  git(seed, 'config', 'user.name', 'Deployment test');
  git(seed, 'config', 'user.email', 'deploy-test@example.invalid');
  write(seed, 'index.html', 'old production');
  write(seed, 'atlas-preview/index.html', 'saved atlas preview');
  write(seed, 'motion-lab/index.html', 'saved bench prototype');
  write(seed, 'CNAME', 'example.invalid\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '-m', 'Original deployment with previews');
  git(seed, 'remote', 'add', 'origin', remote);
  git(seed, 'push', 'origin', 'gh-pages');
  git(root, 'init', '-b', 'main', source);
  git(source, 'remote', 'add', 'origin', remote);
  fs.copyFileSync(script, path.join(source, 'deploy.sh'));
  write(source, 'package.json', '{"version":"4.2.0"}\n');
  write(source, 'build.js', "throw new Error('The validated build must not be rebuilt');\n");
  write(source, 'dist/index.html', 'new production');
  write(source, 'dist/sw.js', 'new service worker');
  write(source, 'dist/volume.js', 'new volume engine');
  /* заглушка проверки манекена: настоящая проверка — tools/mannequin/check.js */
  write(source, 'tools/mannequin/check.js', 'process.exitCode = process.env.DEPLOY_TEST_MANNEQUIN_FAIL ? 1 : 0;\n');
  return {root, remote, source, seed};
}
const deploy = (source, env=process.env) => spawnSync('sh', ['deploy.sh', '--no-build'], {cwd:source, encoding:'utf8', env});

test('deployment preserves preview branches of the site and history; publishing twice is a no-op', t => {
  const {remote, source} = fixture(t);
  const before = git(remote, 'rev-parse', 'gh-pages');
  const first = deploy(source);
  assert.equal(first.status, 0, first.stderr);
  const published = git(remote, 'rev-parse', 'gh-pages');
  assert.notEqual(published, before);
  assert.equal(git(remote, 'rev-parse', 'gh-pages^'), before);
  for (const [file, content] of [
    ['index.html', 'new production'], ['volume.js', 'new volume engine'],
    ['atlas-preview/index.html', 'saved atlas preview'], ['motion-lab/index.html', 'saved bench prototype'],
    ['CNAME', 'example.invalid']
  ]) assert.equal(git(remote, 'show', `gh-pages:${file}`), content);
  const second = deploy(source);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /изменений нет/);
  assert.equal(git(remote, 'rev-parse', 'gh-pages'), published);
});

test('a concurrent publication rejects deployment instead of overwriting the new head', t => {
  const {root, remote, source, seed} = fixture(t);
  const realGit = execFileSync('sh', ['-c', 'command -v git'], {encoding:'utf8'}).trim();
  write(seed, 'concurrent.html', 'another publication');
  git(seed, 'add', '.');
  git(seed, 'commit', '-m', 'Concurrent deployment');
  const concurrent = git(seed, 'rev-parse', 'HEAD');
  const bin = path.join(root, 'bin');
  write(bin, 'git', '#!/bin/sh\nif [ "$1" = push ]; then\n  "$DEPLOY_TEST_GIT" -C "$DEPLOY_TEST_SEED" push origin gh-pages || exit 1\nfi\nexec "$DEPLOY_TEST_GIT" "$@"\n');
  fs.chmodSync(path.join(bin, 'git'), 0o755);
  const result = deploy(source, {...process.env, PATH:bin+path.delimiter+process.env.PATH, DEPLOY_TEST_GIT:realGit, DEPLOY_TEST_SEED:seed});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rejected|fetch first|non-fast-forward/);
  assert.equal(git(remote, 'rev-parse', 'gh-pages'), concurrent);
  assert.equal(git(remote, 'show', 'gh-pages:concurrent.html'), 'another publication');
  assert.equal(git(remote, 'show', 'gh-pages:index.html'), 'old production');
});

test('deployment refuses to publish when the mannequin check reports errors', t => {
  const {remote, source} = fixture(t);
  const before = git(remote, 'rev-parse', 'gh-pages');
  const result = deploy(source, {...process.env, DEPLOY_TEST_MANNEQUIN_FAIL:'1'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Проверка манекена не пройдена/);
  assert.equal(git(remote, 'rev-parse', 'gh-pages'), before);
});
