'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('persistent JSON helper migrates legacy data and preserves updates', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'naufra-json-'));
  const project = path.join(root, 'project');
  const volume = path.join(root, 'volume');
  fs.mkdirSync(path.join(project, 'Games', 'Json'), { recursive: true });
  fs.writeFileSync(path.join(project, 'Games', 'Json', 'mining.json'), '[{"user":"u1","time":123}]');
  const env = { ...process.env, NAUFRA_DATA_DIR: path.join(volume, 'data') };
  const code = [
    `const db=require(${JSON.stringify(path.join(__dirname, 'persistentJson.js'))});`,
    "const first=db.readJson('Games/Json/mining.json', []);",
    "if(first.length!==1 || first[0].user!=='u1') process.exit(2);",
    "first.push({user:'u2',time:456});",
    "db.writeJson('Games/Json/mining.json',first);",
    "const second=db.readJson('Games/Json/mining.json',[]);",
    "if(second.length!==2) process.exit(3);"
  ].join('');
  const run = spawnSync(process.execPath, ['-e', code], { cwd: project, env, encoding: 'utf8' });
  try {
    assert.equal(run.status, 0, run.stderr || run.stdout);
    const saved = JSON.parse(fs.readFileSync(path.join(volume, 'data', 'Games', 'Json', 'mining.json'), 'utf8'));
    assert.equal(saved.length, 2);
    assert.equal(saved[1].user, 'u2');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
