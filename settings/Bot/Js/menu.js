const Menu = (timeFt, Bot, prefixo, sender, groupName, groupMembers) => {
return \`
╭━━━〔 🤖 *\${Bot}* 〕━━━╮
│ 👋 Hola, @\${sender.split('@')[0]}
│ 🕒 \${timeFt}
│ ⚙️ Prefijo: *\${prefixo}*
│ 🌐 naufrabot.com
╰━━━━━━━━━━━━━━━━━━╯

       *📚 MENÚ GENERAL*

╭━━〔 ℹ️ INFORMACIÓN 〕
│ • *ping* — Velocidad e información
│ • *perfil* — Tu perfil
│ • *ship* — Compatibilidad entre personas
│ • *grupos* — Grupos oficiales
│ • *canales* — Canales oficiales
│ • *serbot* — Cómo ser un bot
│ • *personalizarbot* — Personalizar el bot
│ • *miapi* — Consultar tu API key
│ • *comprarapi* — Adquirir una API key
│ • *infocomando* — Explicación de comandos con IA
╰━━━━━━━━━━━━━━━━━━

╭━━〔 🏆 NAUFRA COMPETENCIAS 〕
│ *Listas de competencias Free Fire*
│
│ • \`\${prefixo}lista hexagonal 8pm\`
│ • \`\${prefixo}lista cuadrilatero 8pm\`
│ • \`\${prefixo}lista scrim femenina 8pm\`
│ • \`\${prefixo}lista scrim mixta 8pm\`
│ • \`\${prefixo}lista clk 8pm\`
│ • \`\${prefixo}lista vv2 8pm\`
│ • \`\${prefixo}lista liga femenina 8pm\`
│ • \`\${prefixo}lista liga mixta 8pm\`
│ • \`\${prefixo}lista dinamica 8pm 20\`
│
│ 👥 Crea listas con hora y cupos.
│ 🔒 Comando disponible para administradores.
╰━━━━━━━━━━━━━━━━━━

╭━━〔 🎮 NAUFRA GAMES V7 〕
│ • *ngames* — Ver juegos disponibles
│ • *trivia / acertijo / matematicas* — Retos mentales
│ • *responder* — Responder el reto activo
│ • *verdad / reto / pregunta* — Dinámicas grupales
│ • *quien / rey* — Elecciones aleatorias
│ • *compatibilidad / beso* — Juegos sociales
│ • *casarv7 / divorcio* — Parejas virtuales
│ • *duelo / aceptarduelo* — Retos entre jugadores
│ • *batalla / aceptarbatalla* — Piedra, papel o tijera
│ • *jugada* — Enviar tu jugada
│ • *ngperfil / ngrank* — Perfil y clasificación
│ • *ngapuesta / ngruleta* — Juegos con monedas
│ • *ntorneo* — Torneos grupales
│ • *ngpremios* — Premios semanales
│ • *ngconsejo @persona* — Dedicar un consejo
│ • *ngpiropo @persona* — Dedicar un piropo
│ • *ngconfesion / ngsuerte* — Juegos sociales
╰━━━━━━━━━━━━━━━━━━

╭━━〔 🛡️ ADMINISTRACIÓN 〕
│ • *antilink 1/0* — Activar o desactivar anti-enlaces
│ • *modoadmin 1/0* — Solo administradores
│ • *todos / anuncio* — Mencionar al grupo
│ • *ban / kick* — Expulsar participante
│ • *notify* — Notificación
│ • *grupo* — Abrir o cerrar el grupo
│ • *mute / desmute* — Silenciar o habilitar
│ • *sorteo* — Sortear un premio
│ • *rankrep* — Ranking de reputación
│ • *rankcoins* — Ranking de monedas
│ • *ranknivel* — Ranking de niveles
╰━━━━━━━━━━━━━━━━━━

╭━━〔 👋 BIENVENIDAS 〕
│ • *bienvenida 1/0* — Activar o desactivar
│ • *despedida 1/0* — Activar o desactivar
│ • *setbienvenida* — Editar bienvenida
│ • *setdespedida* — Editar despedida
│ • *setfotobienvenida* — Cambiar imagen
│ • *setfotodespedida* — Cambiar imagen
│ • *probarbienvenida* — Vista previa
│ • *probardespedida* — Vista previa
│ • *resetbienvenida* — Restaurar mensaje
│ • *avisosadmin 1/0* — Avisos de cambios de admin
│ • *configbienvenida* — Ver configuración
╰━━━━━━━━━━━━━━━━━━

╭━━〔 💰 ECONOMÍA Y NIVELES 〕
│ • *nivel* — Tu tarjeta de nivel
│ • *cartera* — Consultar saldo
│ • *reg* — Registrarte
│ • *listreg* — Ver registrados
│ • *ruleta / casino* — Juegos de azar
│ • *levelup* — Subir de nivel
│ • *minar / pescar* — Ganar monedas
│ • *regalar* — Regalar dinero
│ • *mireputacion* — Ver reputación
│ • *tragamonedas / dado / flip* — Minijuegos
│ • *dayli* — Recompensa diaria
│ • *tienda* — Comprar experiencia
│ • *casar* — Parejas aleatorias
╰━━━━━━━━━━━━━━━━━━

╭━━〔 📥 DESCARGAS 〕
│ • *play / play2* — Descargar música
│ • *playvideo / playdoc* — Descargar videos
│ • *tiktok* — Videos de TikTok
│ • *x* — Videos de X
│ • *facebook* — Videos de Facebook
│ • *instagram* — Contenido de Instagram
│ • *mediafire* — Descargar archivos
│ • *descargarapk* — Descargar APK
│ • *pinterest* — Imágenes de Pinterest
╰━━━━━━━━━━━━━━━━━━

╭━━〔 🎨 STICKERS, IMAGEN E IA 〕
│ • *sticker* — Crear sticker
│ • *attp / attp2 / attp3 / attp4 / attp5 / attp6* — Texto a sticker
│ • *buscarsticker* — Buscar stickers
│ • *emojimix* — Mezclar emojis
│ • *toimg* — Sticker a imagen
│ • *hd* — Mejorar imagen
│ • *removebg* — Quitar fondo
│ • *imagine* — Crear imágenes con IA
│ • *llama / ia / chatgpt* — Consultar inteligencia artificial
╰━━━━━━━━━━━━━━━━━━

╭━━〔 🌦️ HERRAMIENTAS 〕
│ • *clima / tiempo* — Consultar el clima
│ • *mareas / marea* — Estado del mar y mareas
│ • *tomp3* — Convertir video a audio
│ • *ytsearch* — Buscar videos en YouTube
│ • *wikipedia* — Consultar Wikipedia
│ • *google* — Buscar en Google
│ • *horoscopo* — Horóscopo diario
│ • *simi* — Conversar con Simi
╰━━━━━━━━━━━━━━━━━━

╭━━〔 👑 CREADOR DEL BOT 〕
│ • *sercreador* — Información para ser creador
│ • *antiprivado* — Control de mensajes privados
│ • *revelarvisu* — Revelar contenido de vista única
│ • *reiniciar* — Reiniciar el bot
│ • *setprefix* — Cambiar prefijo
│ • *bangp / unbangp* — Bloquear o desbloquear un grupo
│ • *botoff / boton* — Apagar o encender el bot
╰━━━━━━━━━━━━━━━━━━

✨ *NAUFRABOT* — herramientas, competencias y diversión.
🌐 https://naufrabot.com
\`
}
module.exports = Menu
