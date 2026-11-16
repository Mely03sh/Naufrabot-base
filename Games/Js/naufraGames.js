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
function fresh(){return {version:2,players:{},pending:{},couples:{},cooldowns:{},tournaments:{},weeklyRewards:{},updatedAt:Date.now()};}
function load(){
 try {
  if(!fs.existsSync(DATA_PATH)){fs.mkdirSync(path.dirname(DATA_PATH),{recursive:true});fs.writeFileSync(DATA_PATH,JSON.stringify(fresh(),null,2));}
  const d=JSON.parse(fs.readFileSync(DATA_PATH,'utf8'));
  return d&&typeof d==='object'?d:fresh();
 } catch(e){console.error('[NAUFRA GAMES] Error leyendo datos:',e.message);return fresh();}
}
let db=load();
db.cooldowns=db.cooldowns||{};db.tournaments=db.tournaments||{};db.weeklyRewards=db.weeklyRewards||{};
function save(){db.updatedAt=Date.now();const tmp=DATA_PATH+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DATA_PATH);}
function periods(){
 const d=new Date(),y=d.getFullYear(),m=y+'-'+String(d.getMonth()+1).padStart(2,'0');
 const first=new Date(y,0,1),w=Math.ceil((((d-first)/86400000)+first.getDay()+1)/7);
 return {month:m,week:y+'-W'+String(w).padStart(2,'0')};
}
function player(id,chat){const key=chat+'|'+id;if(!db.players[key])db.players[key]={userId:id,groupId:chat,points:0,wins:0,played:0,weekly:{},monthly:{}};const p=db.players[key];p.userId=id;p.groupId=chat;p.weekly=p.weekly||{};p.monthly=p.monthly||{};return p;}
function award(id,points,win,chat){const p=player(id,chat),k=periods();p.points+=points;p.played++;if(win)p.wins++;p.weekly[k.week]=(p.weekly[k.week]||0)+points;p.monthly[k.month]=(p.monthly[k.month]||0)+points;const t=db.tournaments[chat];if(t&&t.status==='open'&&t.participants.includes(id))t.scores[id]=(t.scores[id]||0)+points;save();}
function levelFor(points){if(points>=100)return {level:5,badge:'🏆 Leyenda'};if(points>=50)return {level:4,badge:'💎 Diamante'};if(points>=25)return {level:3,badge:'🥇 Experto'};if(points>=10)return {level:2,badge:'🔥 Avanzado'};return {level:1,badge:'🌱 Novato'};}
function clean(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[¿?¡!.,]/g,'');}
const ADVICE_MESSAGES = ["Confía en tu proceso; no necesitas tener todas las respuestas hoy.","No te compares: cada persona avanza a su propio ritmo.","Descansar también es parte de progresar.","Cuida tu paz, incluso cuando debas poner límites.","No tomes decisiones definitivas en un momento de enojo.","Aprende de ayer, disfruta hoy y prepárate para mañana.","Da un paso pequeño hacia eso que deseas.","Rodéate de personas que te impulsen a crecer.","Está bien cambiar de opinión cuando aprendes algo nuevo.","No confundas un tropiezo con el final del camino.","Háblate con la misma paciencia que ofreces a los demás.","Escucha para comprender, no solo para responder.","Tu valor no depende de la aprobación ajena.","Recuerda por qué comenzaste antes de rendirte.","Pedir ayuda también demuestra valentía.","Un límite sano puede cuidar una relación.","No tienes que resolverlo todo en un solo día.","Reconoce tus avances, incluso los pequeños.","Elige tus batallas y reserva energía para lo importante.","Una disculpa sincera vale más que mil excusas.","Aprende a decir no sin sentir culpa.","No permitas que un mal día te haga olvidar lo bueno.","Invierte tiempo en lo que te da tranquilidad y propósito.","La constancia vale más que esperar la motivación perfecta.","Pregunta antes de suponer; conversar puede aclararlo todo.","Cuida tus palabras: pueden convertirse en recuerdos.","Si cometiste un error, corrige lo que puedas y sigue.","No compitas con quienes pueden caminar a tu lado.","Dedica tiempo a quien también hace tiempo para ti.","Valora a quien te escucha sin juzgarte.","Elige la honestidad, incluso cuando sea difícil.","Tu historia no queda definida por una sola etapa.","Respira y ordena una cosa a la vez cuando estés saturado.","Aprender algo nuevo abre puertas inesperadas.","No te castigues por estar aprendiendo.","Una buena amistad también respeta los silencios.","Cuida tu cuerpo y tu mente: ambos necesitan atención.","Lo urgente no siempre es lo más importante.","Date permiso de sentir mientras buscas soluciones.","Evita responder desde el impulso; piensa y luego habla.","Cumple lo que prometes, incluso en los pequeños detalles.","Vuelve a tus objetivos cuando la comparación te distraiga.","El agradecimiento cambia la forma de mirar el día.","No minimices tus logros para agradar a otros.","Ser amable no significa aceptar faltas de respeto.","Deja espacio para divertirte; no todo es productividad.","Un comienzo pequeño sigue siendo un comienzo.","Revisa el plan antes de abandonar un sueño.","Cuida tus finanzas y tus metas con intención.","Dedica unos minutos al día a algo que te haga bien.","No tienes que responder todo inmediatamente.","El respeto también se demuestra al discrepar.","Celebra los éxitos ajenos sin disminuir los tuyos.","Si necesitas una pausa, tómala sin culpa.","Busca compañía que te permita ser auténtico.","Escuchar también es una forma de acompañar.","No confundas estar ocupado con avanzar.","Agradece los gestos bonitos que recibes.","Ten paciencia: algunas cosas necesitan tiempo.","Habla con calma cuando algo sea importante.","No cargues responsabilidades que no te corresponden.","Un hábito sencillo puede transformar tu rutina.","Permítete empezar de nuevo sin avergonzarte.","Elige metas que tengan sentido para ti.","Antes de criticar, intenta comprender el contexto.","Ser fuerte también es reconocer que necesitas apoyo.","Protege tu tiempo: no vuelve.","No dejes que el miedo decida siempre por ti.","Aprende a recibir elogios sin restarles importancia.","Cuida tus relaciones con detalles sinceros.","Busca información antes de sacar conclusiones.","No todo desacuerdo merece una discusión.","Cumple contigo los compromisos que haces.","Sé flexible cuando los planes cambien.","Reconoce lo que puedes controlar y suelta lo demás.","Habla de tus necesidades con claridad y respeto.","Deja que tus acciones respalden tus intenciones.","Busca un aprendizaje incluso en días complicados.","No vivas según los tiempos de otras personas.","Usa el humor con cariño; puede aliviar un día difícil.","Comparte lo que sabes: ayudar también te hace crecer.","La confianza se construye con coherencia.","Dar el primer paso vuelve más manejable una preocupación.","No te juzgues por necesitar tiempo para sanar.","Cambiar de rumbo no significa fracasar.","Presta atención completa a quien te habla.","No prometas desde la emoción lo que no podrás sostener.","Tu tranquilidad merece un lugar en tus decisiones.","Cierra ciclos con respeto y sin rencor.","Busca equilibrio entre tus responsabilidades y tu descanso.","Pregunta cómo está alguien y escucha su respuesta.","Acepta las críticas útiles y pon límites a las que hieren.","Elige cada día una acción que cuide tu bienestar.","Un error no define toda tu persona.","Comparte tus alegrías; celebrar acompañado es bonito.","Trata con dignidad, incluso cuando no estés de acuerdo.","Ten claras tus prioridades y flexibles tus métodos.","Date crédito por todo lo que has superado.","Construye el futuro con pasos reales, no con preocupaciones.","Pedir perdón no te hace menos; te hace responsable.","No sacrifiques tu bienestar por expectativas ajenas.","Distingue entre una oportunidad y una distracción.","Tu paz vale más que ganar una discusión.","Dedica energía a lo que puedes mejorar."];
const COMPLIMENT_MESSAGES = ["Tu sonrisa tiene una manera especial de alegrar el ambiente.","Tienes una energía bonita que se nota incluso a la distancia.","Tu forma de ser hace más agradable cualquier conversación.","Tu mirada transmite mucha tranquilidad.","Tu sentido del humor merece un aplauso.","Tienes una luz auténtica que hace bien encontrar.","Tu presencia le da un toque especial a este grupo.","Sabes hacer sentir bien a los demás.","Tu alegría es contagiosa y mejora el día.","Tu personalidad no pasa desapercibida.","Tu sonrisa merece su propio club de admiradores.","Conviertes momentos sencillos en recuerdos especiales.","Se nota que tienes un corazón lleno de buenos detalles.","Tu buena vibra llega antes que tus palabras.","Hay elegancia en tu manera de tratar a los demás.","Tienes una chispa que hace imposible aburrirse contigo.","Tu autenticidad es uno de tus mejores encantos.","Transmites una confianza muy bonita.","Tu forma de escuchar también es un encanto.","Tu risa merece escucharse más seguido.","Tu amabilidad habla muy bien de ti.","Eres de esas personas que dejan una buena impresión.","Tu estilo tiene personalidad propia.","Tu optimismo ilumina hasta los días grises.","Hay dulzura en tu manera de expresarte.","Tu inteligencia también tiene mucho encanto.","Tu presencia alegra al grupo.","Tienes el bonito don de hacer sonreír a los demás.","Tu seguridad se nota y te queda muy bien.","Tu esencia es más bonita que cualquier filtro.","Tienes una mirada que cuenta historias bonitas.","Tu creatividad le da un toque diferente a todo.","Tu voz invita a quedarse conversando.","Tu nobleza vale muchísimo.","Tu manera de ser es tu mejor presentación.","Si la buena energía tuviera nombre, llevaría el tuyo.","Tu sonrisa alegra todo el día.","Eres una mezcla bonita de sencillez y encanto.","Tu compañía convierte cualquier plan en uno bueno.","Haces sentir importante a quien te escucha.","Tu carisma no necesita presentación.","Brillas cuando hablas de lo que te apasiona.","Tu manera de pensar es tan interesante como tu sonrisa.","Tu alegría merece celebrarse todos los días.","Tienes el talento de iluminar un lugar.","Tu buen gusto se nota en los detalles.","Tu personalidad invita a conocerte más.","Tu paciencia también es una forma de belleza.","Tu espontaneidad hace cada momento más divertido.","Tu corazón bonito se refleja en tus acciones.","Tu sonrisa combina con tu buena energía.","Contigo hasta una charla casual es entretenida.","Ves el lado bueno de las cosas de una forma especial.","Tu encanto está en ser exactamente quien eres.","Tu respeto y amabilidad te hacen destacar.","Qué agradable es encontrar tu vibra tan bonita.","Tu talento merece tantos aplausos como tu personalidad.","Tienes una luz propia y se nota cuando llegas.","Tu forma de expresarte tiene mucha gracia.","Tu alegría es un regalo para quienes te rodean.","Mejoras cualquier fotografía y cualquier reunión.","Hay belleza en la confianza con la que eres tú.","Tu manera de ayudar habla de tu gran corazón.","Tu sonrisa tiene más encanto que un día soleado.","Eres una coincidencia que alegra el camino.","Tu energía hace que hasta el lunes parezca viernes.","Sabes brillar sin apagar a nadie.","Tu amabilidad nunca pasa de moda.","Tienes una mezcla preciosa de carácter y ternura.","Tu conversación siempre tiene algo interesante.","Tu risa es uno de tus mejores accesorios.","Tu personalidad tiene ese no sé qué que cae bien.","Tu alegría merece un aplauso de pie.","Tu mirada transmite confianza.","Tienes un encanto natural que no necesita presentación.","Tu apoyo a los demás te hace admirable.","Hay mucha clase en tu sencillez.","Tu creatividad y tu sonrisa hacen un gran equipo.","Qué bonito coincidir con alguien tan genuino.","Tu buen humor debería ser patrimonio del grupo.","Tu forma de ser deja recuerdos agradables.","Tu entusiasmo hace que las ideas parezcan posibles.","Tu sonrisa cambia el ambiente.","Tu buena actitud también atrae.","Tu presencia es de esas que se agradecen.","Tu manera de hablar transmite calidez.","Tu personalidad tiene más brillo que cualquier decoración.","Tu nobleza se nota con el tiempo.","Tu estilo demuestra que ser auténtico nunca pasa de moda.","Tu alegría hace sonreír a otros.","Tu compañía siempre suena como un buen plan.","Encuentras palabras amables con una facilidad especial.","Tu esencia tiene una belleza que no se puede copiar.","Tu confianza inspira y tu sonrisa conquista amistades.","Haces que el mundo se sienta un poquito más amable.","Si la simpatía diera premios, tendrías el primer lugar.","Tu buen corazón combina con tu gran personalidad.","Tu presencia recuerda que hay gente maravillosa.","Tu sonrisa es un gran motivo para empezar bien el día.","Tu encanto está en esos detalles que te hacen irrepetible.","Tu elegancia se nota en cómo tratas a cada persona.","Tu entusiasmo es tan bonito como tu manera de compartirlo.","Tu alegría mejora cualquier reunión.","Hay algo especial en la calma que transmites."];
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function mention(id){return '@'+String(id||'').split('@')[0];}
function mentioned(ctx){const x=ctx.info&&ctx.info.message;const c=x&&(x.extendedTextMessage&&x.extendedTextMessage.contextInfo||x.imageMessage&&x.imageMessage.contextInfo||x.videoMessage&&x.videoMessage.contextInfo);return c&&c.mentionedJid&&c.mentionedJid[0]||c&&c.participant||null;}
function randomMember(ctx,exclude){const a=(ctx.groupMembers||[]).map(x=>x.id||x.phoneNumber).filter(x=>x&&!exclude.includes(x));return a.length?pick(a):null;}
function send(ctx,t,mentions){return ctx.Naufra.sendMessage(ctx.from,{text:t,mentions:mentions||[]},{quoted:ctx.info});}
function pending(ctx,type){const key=ctx.from+'|'+type,x=db.pending[key];if(!x||x.expiresAt<Date.now()){if(x){delete db.pending[key];save();}return null;}return x;}
function setPending(chat,type,x){db.pending[chat+'|'+type]=Object.assign({},x,{expiresAt:Date.now()+90000});save();}
function clearPending(chat,type){delete db.pending[chat+'|'+type];save();}
async function handle(ctx){
 const c=ctx.comando,pfx=ctx.prefixo||'.',q=String(ctx.q||'').trim(),id=ctx.sender;
 const commands=['ngames','trivia','acertijo','matematicas','responder','verdad','reto','pregunta','quien','rey','compatibilidad','beso','casarv7','divorcio','duelo','aceptarduelo','ngrank','ngperfil','ngapuesta','ngruleta','batalla','aceptarbatalla','jugada','ntorneo','ngpremios','ngconfesion','ngconsejo','ngpiropo','ngsuerte'];
 if(!commands.includes(c))return false;
 if(!ctx.isGroup){await send(ctx,'🎮 NAUFRA GAMES funciona dentro de grupos.');return true;}
 if(!ctx.isReg){await send(ctx,'📝 Primero debes registrarte con el comando de registro del bot.');return true;}
 const cooldownCommands=['verdad','reto','pregunta','quien','rey','compatibilidad','beso','casarv7','duelo','ngapuesta','ngruleta','batalla','ngconfesion','ngconsejo','ngpiropo','ngsuerte'];
 if(cooldownCommands.includes(c)){
  const key=ctx.from+'|'+id+'|'+c,now=Date.now(),until=db.cooldowns[key]||0;
  if(until>now){await send(ctx,'⏳ Espera '+Math.ceil((until-now)/1000)+' segundos antes de volver a usar este juego.');return true;}
  db.cooldowns[key]=now+((c==='ngapuesta'||c==='ngruleta')?5000:10000);
  save();
 }
 switch(c){
 case 'ngames':
  await send(ctx,'🎮 *NAUFRA GAMES V7*\n━━━━━━━━━━━━━━━━\n🧠 *Habilidad*\n• '+pfx+'trivia\n• '+pfx+'acertijo\n• '+pfx+'matematicas\n• '+pfx+'responder respuesta\n\n🎉 *Diversión*\n• '+pfx+'verdad\n• '+pfx+'reto\n• '+pfx+'pregunta\n• '+pfx+'quien\n• '+pfx+'rey\n\n💘 *Social*\n• '+pfx+'compatibilidad @persona\n• '+pfx+'beso @persona\n• '+pfx+'casarv7 @persona\n• '+pfx+'divorcio\n\n⚔️ *Competencia*\n• '+pfx+'duelo @persona\n• '+pfx+'aceptarduelo\n• '+pfx+'ngrank [semana|mes|todo]\n• '+pfx+'ngperfil\n\n🪙 *Monedas*\n• '+pfx+'ngapuesta cantidad cara|cruz\n• '+pfx+'ngruleta cantidad\n• '+pfx+'ngpremios\n\n🏆 *Torneos y batallas*\n• '+pfx+'ntorneo abrir 100 / entrar / cerrar\n• '+pfx+'batalla @persona\n• '+pfx+'aceptarbatalla\n• '+pfx+'jugada piedra|papel|tijera\n\n🎭 *Social extra*\n• '+pfx+'ngconfesion\n• '+pfx+'ngpiropo\n• '+pfx+'ngsuerte\n\n🏅 Juegos sociales gratuitos; las apuestas usan monedas virtuales.');return true;
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
  const p=player(id,ctx.from),rank=levelFor(p.points);await send(ctx,'🎮 *TU PERFIL NAUFRA GAMES*\n\n👤 '+(ctx.pushname||ctx.senderNumber||'Jugador')+'\n🏅 Nivel: *'+rank.level+' — '+rank.badge+'*\n🏆 Puntos: *'+p.points+'*\n🥇 Victorias: *'+p.wins+'*\n🎲 Participaciones: *'+p.played+'*\n\nUsa '+pfx+'ngrank para ver el ranking.');return true;
 }
 case 'ngruleta':{
  const amount=Number((ctx.args||[])[0]);
  if(!Number.isSafeInteger(amount)||amount<5||amount>500){await send(ctx,'Uso: '+pfx+'ngruleta 50 (mínimo 5, máximo 500 monedas).');return true;}
  const balance=Number(ctx.MoneyOfSender(id)||0);if(balance<amount){await send(ctx,'🪙 Saldo insuficiente. Tienes '+balance+' monedas.');return true;}
  ctx.delkoin(id,amount);
  const multiplier=pick([0,0,1,1,2]);
  const payout=amount*multiplier;
  if(payout>0)ctx.addkoin(id,payout);
  if(multiplier===2)award(id,4,true,ctx.from);
  await send(ctx,'🎰 *RULETA NAUFRA*\n\nApuesta: '+amount+' monedas\nMultiplicador: *x'+multiplier+'*\n'+(payout>amount?'🎉 Premio: +'+(payout-amount)+' monedas netas.':payout===amount?'🤝 Recuperaste tu apuesta.':'💸 Perdiste '+amount+' monedas.')+'\n_Probabilidades del juego: 40% pierde, 40% recupera, 20% duplica._');
  return true;
 }
 case 'batalla':{
  const target=mentioned(ctx);if(!target||target===id){await send(ctx,'Uso: '+pfx+'batalla @oponente');return true;}
  if(pending(ctx,'battle')){await send(ctx,'⚔️ Ya existe una batalla pendiente en este grupo.');return true;}
  setPending(ctx.from,'battle',{type:'battle',challenger:id,target,choices:{}});
  await send(ctx,'⚔️ *BATALLA LANZADA*\n'+mention(id)+' reta a '+mention(target)+' a piedra, papel o tijera.\n'+mention(target)+', acepta con *'+pfx+'aceptarbatalla*.',[id,target]);return true;
 }
 case 'aceptarbatalla':{
  const b=pending(ctx,'battle');if(!b){await send(ctx,'No hay batalla pendiente.');return true;}
  if(id!==b.target){await send(ctx,'Solo la persona retada puede aceptar.');return true;}
  b.accepted=true;save();await send(ctx,'🥊 ¡Batalla aceptada! '+mention(b.challenger)+' y '+mention(b.target)+' deben enviar *'+pfx+'jugada piedra*, *papel* o *tijera*.',[b.challenger,b.target]);return true;
 }
 case 'jugada':{
  const b=pending(ctx,'battle'),move=clean((ctx.args||[])[0]||q);
  if(!b||!b.accepted){await send(ctx,'No hay batalla aceptada.');return true;}
  if(id!==b.challenger&&id!==b.target){await send(ctx,'Esta batalla es solo entre las dos personas retadas.');return true;}
  if(!['piedra','papel','tijera'].includes(move)){await send(ctx,'Uso: '+pfx+'jugada piedra|papel|tijera');return true;}
  b.choices=b.choices||{};if(b.choices[id]){await send(ctx,'Ya registraste tu jugada.');return true;}
  b.choices[id]=move;save();
  const other=id===b.challenger?b.target:b.challenger;
  if(!b.choices[other]){await send(ctx,'✅ Jugada registrada en secreto. Esperando a tu rival.');return true;}
  const a=b.choices[b.challenger],z=b.choices[b.target];clearPending(ctx.from,'battle');
  let winner=null,draw=a===z;
  if(!draw){const beats={piedra:'tijera',papel:'piedra',tijera:'papel'};winner=beats[a]===z?b.challenger:b.target;}
  if(draw){award(b.challenger,2,false,ctx.from);award(b.target,2,false,ctx.from);}
  else {const loser=winner===b.challenger?b.target:b.challenger;award(winner,10,true,ctx.from);award(loser,2,false,ctx.from);}
  await send(ctx,'⚔️ *RESULTADO DE BATALLA*\n'+mention(b.challenger)+': '+a+'\n'+mention(b.target)+': '+z+'\n'+(draw?'🤝 ¡Empate! Ambos reciben 2 puntos.':'🏆 Ganador: '+mention(winner)+'\n+10 puntos al ganador y +2 al rival.'),[b.challenger,b.target]);return true;
 }
 case 'ntorneo':{
  const action=clean((ctx.args||[])[0]||'estado'),t=db.tournaments[ctx.from];
  if(action==='abrir'||action==='crear'){
   const prize=Number((ctx.args||[])[1]);if(!Number.isSafeInteger(prize)||prize<10||prize>2000){await send(ctx,'Uso: '+pfx+'ntorneo abrir 100 (premio de 10 a 2000 monedas).');return true;}
   if(t&&t.status==='open'){await send(ctx,'Ya hay un torneo abierto en este grupo.');return true;}
   if(Number(ctx.MoneyOfSender(id)||0)<prize){await send(ctx,'No tienes monedas suficientes para financiar el premio.');return true;}
   ctx.delkoin(id,prize);db.tournaments[ctx.from]={status:'open',creator:id,prize,participants:[id],scores:{[id]:0},createdAt:Date.now()};save();
   await send(ctx,'🏆 *TORNEO NAUFRA ABIERTO*\nPremio: '+prize+' monedas\n'+mention(id)+' ya está inscrito.\nLos demás pueden entrar con *'+pfx+'ntorneo entrar*.\nEl creador cierra con *'+pfx+'ntorneo cerrar*.',[id]);return true;
  }
  if(action==='entrar'||action==='unirme'){
   if(!t||t.status!=='open'){await send(ctx,'No hay torneo abierto. Crea uno con '+pfx+'ntorneo abrir 100.');return true;}
   if(t.participants.includes(id)){await send(ctx,'Ya estás inscrito en el torneo.');return true;}
   t.participants.push(id);t.scores[id]=0;save();await send(ctx,'✅ '+mention(id)+' se inscribió. Participantes: '+t.participants.length+'.',[id]);return true;
  }
  if(action==='cerrar'||action==='finalizar'){
   if(!t||t.status!=='open'){await send(ctx,'No hay torneo abierto para cerrar.');return true;}
   if(t.creator!==id){await send(ctx,'Solo quien creó el torneo puede cerrarlo.');return true;}
   if(t.participants.length<2){ctx.addkoin(t.creator,t.prize);delete db.tournaments[ctx.from];save();await send(ctx,'El torneo necesitaba al menos 2 participantes. Se devolvió el premio al creador.');return true;}
   const ranked=t.participants.map(user=>({user,score:t.scores[user]||0})).sort((a,b)=>b.score-a.score);
   if(ranked[0].score===0){await send(ctx,'Todavía nadie ha sumado puntos. Jueguen primero y luego cierren el torneo.');return true;}
   const winners=ranked.filter(x=>x.score===ranked[0].score),winner=pick(winners).user;
   ctx.addkoin(winner,t.prize);t.status='closed';t.winner=winner;t.closedAt=Date.now();save();
   await send(ctx,'🏆 *TORNEO FINALIZADO*\nGanador: '+mention(winner)+'\nPuntos del torneo: '+(t.scores[winner]||0)+'\nPremio entregado: '+t.prize+' monedas.\nGracias a todos por participar.',[winner]);return true;
  }
  if(!t||t.status!=='open'){await send(ctx,'No hay torneo abierto. Usa '+pfx+'ntorneo abrir 100 para crear uno.');return true;}
  await send(ctx,'🏆 *TORNEO EN CURSO*\nParticipantes: '+t.participants.length+'\nPremio: '+t.prize+' monedas\n'+t.participants.map((u,i)=>(i+1)+'. '+mention(u)+' — '+(t.scores[u]||0)+' pts').join('\n')+'\nEntra con '+pfx+'ntorneo entrar.',t.participants);return true;
 }
 case 'ngpremios':{
  const k=periods(),rows=Object.values(db.players).filter(d=>d.groupId===ctx.from).map(d=>({user:d.userId,points:d.weekly&&d.weekly[k.week]||0})).filter(x=>x.user&&x.points>0).sort((a,b)=>b.points-a.points).slice(0,3);
  const rewards=[100,50,25],paid=db.weeklyRewards[k.week]||{};db.weeklyRewards[k.week]=paid;
  const pos=rows.findIndex(x=>x.user===id);if(pos<0){await send(ctx,'🏅 Aún no tienes puntos esta semana. Juega y vuelve a consultar.');return true;}
  if(paid[ctx.from+'|'+id]){await send(ctx,'🎁 Ya reclamaste tu premio semanal.');return true;}
  const prize=rewards[pos];if(!prize){await send(ctx,'Esta semana no alcanzaste uno de los tres primeros puestos. ¡Sigue jugando!');return true;}
  ctx.addkoin(id,prize);paid[ctx.from+'|'+id]=true;save();await send(ctx,'🎁 *PREMIO SEMANAL ENTREGADO*\nPuesto: #'+(pos+1)+'\nPremio: '+prize+' monedas\n¡Felicitaciones!');return true;
 }
 case 'ngconfesion':await send(ctx,'🤫 *CONFESIÓN*\\n\\n'+pick(['Confiesa una pequeña travesura de tu infancia.','¿Qué canción te sabes completa y te da pena admitirlo?','¿Cuál es tu gusto culposo?','¿Qué mentira piadosa has dicho recientemente?','¿Qué hábito extraño tienes?']));award(id,1,false,ctx.from);return true;
 case 'ngconsejo':{
  const target=mentioned(ctx);
  if(!target){await send(ctx,'💡 Para dar un consejo, etiqueta a la persona o responde a uno de sus mensajes.\nEjemplo: '+pfx+'ngconsejo @persona');return true;}
  const advice=pick(ADVICE_MESSAGES);
  await send(ctx,'💡 *UN CONSEJO PARA TI*\n\n'+mention(target)+', '+advice,[target]);award(id,1,false,ctx.from);return true;
 }
 case 'ngpiropo':{
  const target=mentioned(ctx);
  if(!target){await send(ctx,'💐 Para dedicar un piropo, etiqueta a la persona o responde a uno de sus mensajes.\nEjemplo: '+pfx+'ngpiropo @persona');return true;}
  const compliments=pick(COMPLIMENT_MESSAGES);
  await send(ctx,'💐 *UN PIROPO PARA TI*\n\n'+mention(target)+', '+compliments,[target]);award(id,1,false,ctx.from);return true;
 }
 case 'ngsuerte':{
  const fortunes=['🍀 Hoy es un buen día para intentar algo nuevo.','✨ Una conversación inesperada te alegrará el día.','🌟 Tu esfuerzo está más cerca de dar frutos.','💛 Comparte una buena energía y volverá a ti.','🎯 Una oportunidad aparece cuando menos lo esperas.'];
  await send(ctx,'🔮 *TU MENSAJE DE SUERTE*\n\n'+pick(fortunes));award(id,1,false,ctx.from);return true;
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
module.exports={handle:handle,messageCounts:{advice:ADVICE_MESSAGES.length,compliments:COMPLIMENT_MESSAGES.length}};
