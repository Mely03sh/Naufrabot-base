'use strict';
const fs = require('fs');
const path = require('path');
const DATA_PATH = process.env.NAUFRA_GAMES_DATA || path.join(__dirname, '..', 'Json', 'naufra_games.json');
const QUESTIONS = [
 {q:'¿Cuál es el planeta conocido como el planeta rojo?',a:['marte']},
 {q:'¿Cuántos lados tiene un hexágono?',a:['6','seis']},
 {q:'¿Cuál es el océano más grande del planeta?',a:['pacifico','océano pacifico','oceano pacifico']},
 {q:'¿Qué gas absorben principalmente las plantas?',a:['dioxido de carbono','co2']},
 {q:'¿Cuántos minutos tiene una hora?',a:['60','sesenta']},
 {q:'¿Cuál es el satélite natural de la Tierra?',a:['luna']},
 {q:'¿Qué instrumento tiene teclas blancas y negras?',a:['piano']},
 {q:'¿En qué continente está Colombia?',a:['america','sudamerica','américa']},
 {q:'¿Cuánto es 9 x 8?',a:['72','setenta y dos']}
];
const RIDDLES = [
 {q:'Tiene agujas y no cose, tiene números y no lee. ¿Qué es?',a:['reloj','un reloj']},
 {q:'Cuanto más le quitas, más grande se vuelve. ¿Qué es?',a:['hoyo','un hoyo','agujero','un agujero']},
 {q:'Tiene dientes y no come. ¿Qué es?',a:['peine','un peine']},
 {q:'Sube y baja, pero siempre está en el mismo lugar. ¿Qué es?',a:['escalera','la escalera']},
 {q:'Si me nombras, desaparezco. ¿Qué soy?',a:['silencio','el silencio']}
];
const TRUTHS = ['¿Cuál ha sido tu momento más vergonzoso?','¿Qué cosa nunca has contado en este grupo?','¿Cuál fue tu primer amor?','¿Qué es lo más gracioso que te ha pasado?','¿Qué talento secreto tienes?'];
const DARES = ['Envía un audio diciendo «hoy soy la estrella del grupo».','Dedícale un cumplido sincero a alguien del grupo.','Escribe una frase completa usando solo emojis.','Cuenta un chiste; el grupo decide si fue bueno.','Menciona a tres personas y diles algo positivo.'];
const GROUP_QUESTIONS = ['¿Quién tiene más probabilidades de quedarse dormido en una fiesta?','¿Quién sería el mejor líder en una isla desierta?','¿Quién se ríe en el momento menos indicado?','¿Quién sobreviviría mejor a un apocalipsis zombi?','¿Quién es más probable que se vuelva famoso?'];
function fresh(){return {version:1,players:{},pending:{},couples:{},cooldowns:{},updatedAt:Date.now()};}
function load(){
 try {
  if(!fs.existsSync(DATA_PATH)){fs.mkdirSync(path.dirname(DATA_PATH),{recursive:true});fs.writeFileSync(DATA_PATH,JSON.stringify(fresh(),null,2));}
  const d=JSON.parse(fs.readFileSync(DATA_PATH,'utf8'));
  return d&&typeof d==='object'?d:fresh();
 } catch(e){console.error('[NAUFRA GAMES] Error leyendo datos:',e.message);return fresh();}
}
let db=load();
db.cooldowns=db.cooldowns||{};
function save(){db.updatedAt=Date.now();const tmp=DATA_PATH+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DATA_PATH);}
function periods(){
 const d=new Date(),y=d.getFullYear(),m=y+'-'+String(d.getMonth()+1).padStart(2,'0');
 const first=new Date(y,0,1),w=Math.ceil((((d-first)/86400000)+first.getDay()+1)/7);
 return {month:m,week:y+'-W'+String(w).padStart(2,'0')};
}
function player(id,chat){const key=chat+'|'+id;if(!db.players[key])db.players[key]={userId:id,groupId:chat,points:0,wins:0,played:0,weekly:{},monthly:{}};const p=db.players[key];p.userId=id;p.groupId=chat;p.weekly=p.weekly||{};p.monthly=p.monthly||{};return p;}
function award(id,points,win,chat){const p=player(id,chat),k=periods();p.points+=points;p.played++;if(win)p.wins++;p.weekly[k.week]=(p.weekly[k.week]||0)+points;p.monthly[k.month]=(p.monthly[k.month]||0)+points;save();}
function clean(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[¿?¡!.,]/g,'');}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function mention(id){return '@'+String(id||'').split('@')[0];}
function mentioned(ctx){const x=ctx.info&&ctx.info.message;const c=x&&(x.extendedTextMessage&&x.extendedTextMessage.contextInfo||x.imageMessage&&x.imageMessage.contextInfo||x.videoMessage&&x.videoMessage.contextInfo);return c&&c.mentionedJid&&c.mentionedJid[0]||c&&c.participant||null;}
function randomMember(ctx,exclude){const a=(ctx.groupMembers||[]).map(x=>x.id||x.phoneNumber).filter(x=>x&&!exclude.includes(x));return a.length?pick(a):null;}
function send(ctx,t,mentions){return ctx.Naufra.sendMessage(ctx.from,{text:t,mentions:mentions||[]},{quoted:ctx.info});}
function pending(ctx,type){const key=ctx.from+'|'+type,x=db.pending[key];if(!x||x.expiresAt<Date.now()){if(x){delete db.pending[key];save();}return null;}return x;}
function setPending(chat,type,x){db.pending[chat+'|'+type]=Object.assign({},x,{expiresAt:Date.now()+90000});}
function clearPending(chat,type){delete db.pending[chat+'|'+type];save();}
async function handle(ctx){
 const c=ctx.comando,pfx=ctx.prefixo||'.',q=String(ctx.q||'').trim(),id=ctx.sender;
 const commands=['ngames','trivia','acertijo','matematicas','responder','verdad','reto','pregunta','quien','rey','compatibilidad','beso','casarv7','divorcio','duelo','aceptarduelo','ngrank','ngperfil','ngapuesta'];
 if(!commands.includes(c))return false;
 if(!ctx.isGroup){await send(ctx,'🎮 NAUFRA GAMES funciona dentro de grupos.');return true;}
 if(!ctx.isReg){await send(ctx,'📝 Primero debes registrarte con el comando de registro del bot.');return true;}
 const cooldownCommands=['verdad','reto','pregunta','quien','rey','compatibilidad','beso','casarv7','duelo','ngapuesta'];
 if(cooldownCommands.includes(c)){
  const key=ctx.from+'|'+id+'|'+c,now=Date.now(),until=db.cooldowns[key]||0;
  if(until>now){await send(ctx,'⏳ Espera '+Math.ceil((until-now)/1000)+' segundos antes de volver a usar este juego.');return true;}
  db.cooldowns[key]=now+(c==='ngapuesta'?5000:10000);
  save();
 }
 switch(c){
 case 'ngames':
  await send(ctx,'🎮 *NAUFRA GAMES V7*\n━━━━━━━━━━━━━━━━\n🧠 *Habilidad*\n• '+pfx+'trivia\n• '+pfx+'acertijo\n• '+pfx+'matematicas\n• '+pfx+'responder respuesta\n\n🎉 *Diversión*\n• '+pfx+'verdad\n• '+pfx+'reto\n• '+pfx+'pregunta\n• '+pfx+'quien\n• '+pfx+'rey\n\n💘 *Social*\n• '+pfx+'compatibilidad @persona\n• '+pfx+'beso @persona\n• '+pfx+'casarv7 @persona\n• '+pfx+'divorcio\n\n⚔️ *Competencia*\n• '+pfx+'duelo @persona\n• '+pfx+'aceptarduelo\n• '+pfx+'ngrank [semana|mes|todo]\n• '+pfx+'ngperfil\n\n🪙 *Monedas*\n• '+pfx+'ngapuesta cantidad cara|cruz\n\n🏅 Juegos sociales gratuitos; las apuestas usan monedas virtuales.');return true;
 case 'trivia':case 'acertijo':case 'matematicas':{
  if(pending(ctx,'quiz')){await send(ctx,'⏳ Ya hay un reto de preguntas activo. Responde con '+pfx+'responder tu respuesta.');return true;}
  let item,question,answer;
  if(c==='trivia'){item=pick(QUESTIONS);question=item.q;answer=item.a;}
  else if(c==='acertijo'){item=pick(RIDDLES);question=item.q;answer=item.a;}
  else {const a=2+Math.floor(Math.random()*19),b=2+Math.floor(Math.random()*11),op=pick(['+','-','×']);question='¿Cuánto es *'+a+' '+op+' '+b+'*?';answer=[String(op==='+'?a+b:op==='-'?a-b:a*b)];}
  setPending(ctx.from,'quiz',{type:c,answer:answer,question:question});
  await send(ctx,'🎯 *'+c.toUpperCase()+' — NAUFRA GAMES*\n\n'+question+'\n\n⏱️ Tienes 90 segundos.\n✍️ Responde: *'+pfx+'responder tu respuesta*\n🏆 Premio: 5 puntos + 2 XP.');return true;
 }
 case 'responder':{
  if(!q){await send(ctx,'Uso: '+pfx+'responder tu respuesta');return true;}
  const a=pending(ctx,'quiz');if(!a||!a.answer){await send(ctx,'❌ No hay reto activo o el tiempo terminó.');return true;}
  if(a.answer.map(clean).includes(clean(q))){clearPending(ctx.from,'quiz');award(id,5,true,ctx.from);if(ctx.addXp)ctx.addXp(id,2);await send(ctx,'🎉 ¡Correcto, '+mention(id)+'!\n🏆 Ganaste 5 puntos y 2 XP.\n🧠 Respuesta: *'+a.answer[0]+'*',[id]);}
  else await send(ctx,'❌ Esa no es la respuesta. ¡Inténtalo otra vez!');return true;
 }
 case 'verdad':await send(ctx,'💬 *VERDAD*\n\n'+pick(TRUTHS));award(id,1,false,ctx.from);return true;
 case 'reto':await send(ctx,'🔥 *RETO*\n\n'+pick(DARES));award(id,1,false,ctx.from);return true;
 case 'pregunta':await send(ctx,'💭 *PREGUNTA PARA EL GRUPO*\n\n'+pick(GROUP_QUESTIONS)+'\n\n¡Que todos participen!');award(id,1,false,ctx.from);return true;
 case 'quien':{
  const m=randomMember(ctx,[id]);if(!m){await send(ctx,'No encontré integrantes para elegir.');return true;}
  await send(ctx,'🤔 '+pick(GROUP_QUESTIONS)+'\n\n🎲 Elección aleatoria: '+mention(m),[m]);award(id,1,false,ctx.from);return true;
 }
 case 'rey':{
  const m=randomMember(ctx,[]);if(!m){await send(ctx,'No encontré integrantes para elegir.');return true;}
  await send(ctx,'👑 *LA CORONA DEL GRUPO ES PARA*\n\n'+mention(m)+' 👑',[m]);award(id,2,false,ctx.from);return true;
 }
 case 'compatibilidad':case 'beso':case 'casarv7':{
  let target=mentioned(ctx)||randomMember(ctx,[id]);if(!target||target===id){await send(ctx,'Uso: '+pfx+c+' @persona');return true;}
  if(c==='compatibilidad'){const n=Math.floor(Math.random()*101),bar='❤️'.repeat(Math.round(n/10))+'🖤'.repeat(10-Math.round(n/10));await send(ctx,'💘 *TEST DE COMPATIBILIDAD*\n\n'+mention(id)+' + '+mention(target)+'\n'+bar+'\n💕 Compatibilidad: *'+n+'%*\n_Solo por diversión._',[id,target]);}
  else if(c==='beso')await send(ctx,'😘 '+mention(id)+' le manda un beso virtual a '+mention(target)+' 💋',[id,target]);
  else {const ownKey=ctx.from+'|'+id,otherKey=ctx.from+'|'+target;if(db.couples[ownKey]||db.couples[otherKey]){await send(ctx,'💔 Uno de los dos ya tiene una pareja virtual en este grupo. Usa .divorcio antes de casarte de nuevo.');return true;}db.couples[ownKey]=target;db.couples[otherKey]=id;save();await send(ctx,'💍 *¡BODA VIRTUAL!*\n\n'+mention(id)+' y '+mention(target)+' ahora son pareja de NAUFRA GAMES 💞',[id,target]);}
  award(id,2,false,ctx.from);return true;
 }
 case 'divorcio':{
  const ownKey=ctx.from+'|'+id,partner=db.couples[ownKey],partnerKey=partner?ctx.from+'|'+partner:null;if(!partner){await send(ctx,'💔 No tienes pareja virtual registrada.');return true;}
  delete db.couples[ownKey];if(db.couples[partnerKey]===id)delete db.couples[partnerKey];save();await send(ctx,'💔 '+mention(id)+' y '+mention(partner)+' terminaron su relación virtual.',[id,partner]);return true;
 }
 case 'duelo':{
  const target=mentioned(ctx);if(!target||target===id){await send(ctx,'Uso: '+pfx+'duelo @oponente');return true;}
  if(pending(ctx,'duel')){await send(ctx,'⚔️ Ya hay un duelo pendiente en este grupo.');return true;}
  setPending(ctx.from,'duel',{type:'duel',challenger:id,target:target});await send(ctx,'⚔️ '+mention(id)+' reta a '+mention(target)+'.\n'+mention(target)+', acepta con *'+pfx+'aceptarduelo*. Tienen 90 segundos.',[id,target]);return true;
 }
 case 'aceptarduelo':{
  const a=pending(ctx,'duel');if(!a||a.type!=='duel'){await send(ctx,'No hay duelo pendiente.');return true;}
  if(id!==a.target){await send(ctx,'Solo la persona retada puede aceptar.');return true;}
  clearPending(ctx.from,'duel');const winner=Math.random()<0.5?a.challenger:a.target,loser=winner===a.challenger?a.target:a.challenger;award(winner,10,true,ctx.from);award(loser,2,false,ctx.from);
  await send(ctx,'🏆 *RESULTADO DEL DUELO*\n⚔️ '+mention(a.challenger)+' vs '+mention(a.target)+'\n👑 Ganador: '+mention(winner)+'\n🎖️ +10 puntos al ganador y +2 al otro participante.',[a.challenger,a.target]);return true;
 }
 case 'ngrank':{
  const mode=String((ctx.args||[])[0]||'todo').toLowerCase(),k=periods();
  const rows=Object.values(db.players).filter(d=>d.groupId===ctx.from).map(d=>({user:d.userId,points:mode==='semana'?(d.weekly&&d.weekly[k.week]||0):mode==='mes'?(d.monthly&&d.monthly[k.month]||0):(d.points||0)})).filter(x=>x.user&&x.points>0).sort((a,b)=>b.points-a.points).slice(0,10);
  if(!rows.length){await send(ctx,'🏅 Aún no hay puntuaciones. ¡Inauguren el ranking!');return true;}
  const title=mode==='semana'?'SEMANAL':mode==='mes'?'MENSUAL':'GENERAL';
  await send(ctx,'🏆 *RANKING '+title+' NAUFRA GAMES*\n\n'+rows.map((x,i)=>(i+1)+'. '+mention(x.user)+' — *'+x.points+' pts*').join('\n'),rows.map(x=>x.user));return true;
 }
 case 'ngperfil':{
  const p=player(id,ctx.from);await send(ctx,'🎮 *TU PERFIL NAUFRA GAMES*\n\n👤 '+(ctx.pushname||ctx.senderNumber||'Jugador')+'\n🏆 Puntos: *'+p.points+'*\n🥇 Victorias: *'+p.wins+'*\n🎲 Participaciones: *'+p.played+'*\n\nUsa '+pfx+'ngrank para ver el ranking.');return true;
 }
 case 'ngapuesta':{
  const amount=Number((ctx.args||[])[0]),choice=clean((ctx.args||[])[1]||'');
  if(!Number.isSafeInteger(amount)||amount<1||amount>500||!['cara','cruz'].includes(choice)){await send(ctx,'Uso: '+pfx+'ngapuesta 50 cara  (máximo 500 monedas)');return true;}
  const balance=Number(ctx.MoneyOfSender(id)||0);if(balance<amount){await send(ctx,'🪙 No tienes suficientes monedas. Saldo: *'+balance+'*');return true;}
  ctx.delkoin(id,amount);const result=Math.random()<0.5?'cara':'cruz';
  if(choice===result){ctx.addkoin(id,amount*2);award(id,3,true,ctx.from);await send(ctx,'🪙 *¡GANASTE!* Salió *'+result.toUpperCase()+'*. Premio total: *'+(amount*2)+'* monedas. Ganancia neta: +'+amount+'.');}
  else await send(ctx,'🪙 Salió *'+result.toUpperCase()+'*. Perdiste '+amount+' monedas. ¡Inténtalo de nuevo!');
  return true;
 }
 default:return false;
 }
}
module.exports={handle:handle};
