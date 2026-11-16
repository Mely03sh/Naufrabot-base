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


test('tournament escrows prize, records group participation and pays winner', async () => {
  let balance = 500, paid = 0;
  const creator = makeCtx({
    comando: 'ntorneo', args: ['abrir', '100'], from: 'tournament@g.us',
    MoneyOfSender: () => balance, delkoin: (_id, amount) => { balance -= amount; },
    addkoin: (_id, amount) => { paid += amount; }
  });
  await games.handle(creator);
  assert.equal(balance, 400);

  const joiner = makeCtx({ comando: 'ntorneo', args: ['entrar'], from: 'tournament@g.us', sender: '222@s.whatsapp.net' });
  await games.handle(joiner);
  const score = makeCtx({ comando: 'verdad', from: 'tournament@g.us', sender: '222@s.whatsapp.net' });
  await games.handle(score);

  const close = makeCtx({
    comando: 'ntorneo', args: ['cerrar'], from: 'tournament@g.us',
    MoneyOfSender: () => balance, addkoin: (_id, amount) => { paid += amount; }
  });
  await games.handle(close);
  assert.equal(paid, 100);
  assert.match(close.sent[0][1].text, /TORNEO FINALIZADO/);
});

test('battle requires acceptance and both secret moves before resolving', async () => {
  const group = 'battle-rps@g.us';
  const challenge = makeCtx({
    comando: 'batalla', from: group,
    info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: ['222@s.whatsapp.net'] } } } }
  });
  await games.handle(challenge);

  const accept = makeCtx({ comando: 'aceptarbatalla', from: group, sender: '222@s.whatsapp.net' });
  await games.handle(accept);

  const first = makeCtx({ comando: 'jugada', args: ['piedra'], from: group });
  await games.handle(first);
  assert.match(first.sent[0][1].text, /Esperando a tu rival/);

  const second = makeCtx({ comando: 'jugada', args: ['tijera'], from: group, sender: '222@s.whatsapp.net' });
  await games.handle(second);
  assert.match(second.sent[0][1].text, /RESULTADO DE BATALLA/);
});

test('roulette rejects invalid stakes without charging coins', async () => {
  let charged = 0;
  const ctx = makeCtx({
    comando: 'ngruleta', args: ['1'], MoneyOfSender: () => 100,
    delkoin: (_id, amount) => { charged += amount; }
  });
  await games.handle(ctx);
  assert.equal(charged, 0);
  assert.match(ctx.sent[0][1].text, /mínimo 5/);
});

test('profile exposes level and badge progression', async () => {
  const ctx = makeCtx({ comando: 'ngperfil', from: 'profile-level@g.us' });
  await games.handle(ctx);
  assert.match(ctx.sent[0][1].text, /Nivel:/);
  assert.match(ctx.sent[0][1].text, /Novato/);
});


test('advice tags the selected group member', async () => {
  const target = '222@s.whatsapp.net';
  const ctx = makeCtx({
    comando: 'ngconsejo',
    info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: [target] } } } }
  });
  await games.handle(ctx);
  assert.match(ctx.sent[0][1].text, /UN CONSEJO PARA TI/);
  assert.match(ctx.sent[0][1].text, /@222/);
  assert.deepEqual(ctx.sent[0][1].mentions, [target]);
});

test('compliment tags the selected group member', async () => {
  const target = '333@s.whatsapp.net';
  const ctx = makeCtx({
    comando: 'ngpiropo',
    info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: [target] } } }
  });
  await games.handle(ctx);
  assert.match(ctx.sent[0][1].text, /UN PIROPO PARA TI/);
  assert.match(ctx.sent[0][1].text, /@333/);
  assert.deepEqual(ctx.sent[0][1].mentions, [target]);
});

test('targeted advice and compliment require a tagged or replied-to person', async () => {
  const advice = makeCtx({ comando: 'ngconsejo' });
  await games.handle(advice);
  assert.match(advice.sent[0][1].text, /etiqueta a la persona o responde/);

  const compliment = makeCtx({ comando: 'ngpiropo' });
  await games.handle(compliment);
  assert.match(compliment.sent[0][1].text, /etiqueta a la persona o responde/);
});

test.after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
