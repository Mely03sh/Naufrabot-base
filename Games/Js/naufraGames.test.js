'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naufra-games-v7-'));
process.env.NAUFRA_GAMES_DATA = path.join(tempDir, 'games.json');
const games = require('./naufraGames.js');

function makeCtx(overrides = {}) {
  const sent = [];
  const ctx = {
    comando: 'ngames',
    prefixo: '.',
    q: '',
    args: [],
    sender: '111@s.whatsapp.net',
    senderNumber: '111',
    pushname: 'Jugador',
    from: 'group-test@g.us',
    isGroup: true,
    isReg: true,
    groupMembers: [
      { id: '111@s.whatsapp.net' },
      { id: '222@s.whatsapp.net' },
      { id: '333@s.whatsapp.net' }
    ],
    info: { message: {} },
    Naufra: { sendMessage: async (...args) => { sent.push(args); return {}; } },
    addXp: () => {},
    MoneyOfSender: () => 100,
    addkoin: () => {},
    delkoin: () => {},
    sent,
    ...overrides
  };
  return ctx;
}

test('unknown command is not handled', async () => {
  const ctx = makeCtx({ comando: 'notagame' });
  assert.equal(await games.handle(ctx), false);
});

test('game menu works in groups and rejects private chats', async () => {
  const dm = makeCtx({ isGroup: false });
  assert.equal(await games.handle(dm), true);
  assert.match(dm.sent[0][1].text, /funciona dentro de grupos/);

  const group = makeCtx();
  assert.equal(await games.handle(group), true);
  assert.match(group.sent[0][1].text, /NAUFRA GAMES V7/);
});

test('free games award points scoped to the group', async () => {
  const ctx = makeCtx({ comando: 'verdad' });
  await games.handle(ctx);
  const data = JSON.parse(fs.readFileSync(process.env.NAUFRA_GAMES_DATA, 'utf8'));
  assert.equal(data.players['group-test@g.us|111@s.whatsapp.net'].points, 1);

  const otherGroup = makeCtx({ comando: 'verdad', from: 'other-group@g.us' });
  await games.handle(otherGroup);
  const after = JSON.parse(fs.readFileSync(process.env.NAUFRA_GAMES_DATA, 'utf8'));
  assert.equal(after.players['other-group@g.us|111@s.whatsapp.net'].points, 1);
  assert.equal(after.players['group-test@g.us|111@s.whatsapp.net'].points, 1);
});

test('quiz and duel sessions can coexist in the same group', async () => {
  const quiz = makeCtx({ comando: 'trivia' });
  await games.handle(quiz);

  const duel = makeCtx({
    comando: 'duelo',
    info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: ['222@s.whatsapp.net'] } } } }
  });
  await games.handle(duel);

  const data = JSON.parse(fs.readFileSync(process.env.NAUFRA_GAMES_DATA, 'utf8'));
  assert.ok(data.pending['group-test@g.us|quiz']);
  assert.ok(data.pending['group-test@g.us|duel']);

  const accept = makeCtx({ comando: 'aceptarduelo', sender: '222@s.whatsapp.net' });
  await games.handle(accept);
  const afterDuel = JSON.parse(fs.readFileSync(process.env.NAUFRA_GAMES_DATA, 'utf8'));
  assert.ok(afterDuel.pending['group-test@g.us|quiz']);
  assert.equal(afterDuel.pending['group-test@g.us|duel'], undefined);
});

test('only the challenged member can accept a duel', async () => {
  const challenge = makeCtx({
    comando: 'duelo',
    from: 'duel-test@g.us',
    info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: ['222@s.whatsapp.net'] } } } }
  });
  await games.handle(challenge);

  const wrongUser = makeCtx({ comando: 'aceptarduelo', from: 'duel-test@g.us', sender: '333@s.whatsapp.net' });
  await games.handle(wrongUser);
  assert.match(wrongUser.sent[0][1].text, /Solo la persona retada/);
});

test('betting validates amount and choice before changing balance', async () => {
  let charged = 0;
  const ctx = makeCtx({
    comando: 'ngapuesta',
    args: ['999999', 'cara'],
    MoneyOfSender: () => 100,
    delkoin: (_id, amount) => { charged += amount; }
  });
  await games.handle(ctx);
  assert.equal(charged, 0);
  assert.match(ctx.sent[0][1].text, /máximo 500 monedas/);
});

test.after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
