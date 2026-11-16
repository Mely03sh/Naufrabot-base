'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'naufra-registration-'));
const modulePath = path.join(__dirname, 'reg.js');
const stubRoot = path.join(temp, 'node_modules');
const momentDir = path.join(stubRoot, 'moment-timezone');
fs.mkdirSync(momentDir, { recursive: true });
fs.writeFileSync(path.join(momentDir, 'index.js'), "module.exports = { tz: () => ({ format: () => '01/01 00:00:00' }) };\\n");
const persistentFile = path.join(temp, 'volume', 'data', 'registros.json');
const env = { ...process.env, NODE_PATH: stubRoot, NAUFRA_REGISTRO_PATH: persistentFile };
const run = (code) => execFileSync(process.execPath, ['-e', code, modulePath], { env, encoding: 'utf8' });

test('registration, coins and levels survive a full Node.js process restart', () => {
  run("const r=require(process.argv[1]); r.AddReg('test-user@s.whatsapp.net','Test User'); r.addkoin('test-user@s.whatsapp.net',15); r.addLevel('test-user@s.whatsapp.net',2);");
  const result = JSON.parse(run("const r=require(process.argv[1]); process.stdout.write(JSON.stringify({registered:r.checkOfReg('test-user@s.whatsapp.net'),balance:r.MoneyOfSender('test-user@s.whatsapp.net'),level:r.levelOfsender('test-user@s.whatsapp.net')}));"));
  assert.deepEqual(result, { registered: true, balance: 65, level: 3 });
  assert.equal(fs.existsSync(persistentFile), true);
});

test.after(() => fs.rmSync(temp, { recursive: true, force: true }));
