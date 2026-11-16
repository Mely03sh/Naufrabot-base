const { readJson, writeJson } = require('../../settings/persistentJson.js')
const JsonGamesClaim = 'Games/Json/claim.json'
const GameClaim = readJson(JsonGamesClaim, [])

const addClaim = ( sender , time ) => {
const obj = {
user : sender,
time : Date.now() + time
}
GameClaim.push(obj)
writeJson(JsonGamesClaim, GameClaim)
}

const checkClaim = (sender) => {
return GameClaim.some(i => i.user === sender)
}

const timeClaim = (sender) => {
let position = false
Object.keys(GameClaim).forEach((i) =>{
if(GameClaim[i].user === sender) {
position = i
}})
if(position !== false ){
return GameClaim[position].time
}}

const expiredClaim = () => {
setInterval(() => {
 const ahora = Date.now()
GameClaim.forEach((item , indice) => {
if(ahora >= item.time){
GameClaim.splice(indice , 1)
writeJson(JsonGamesClaim, GameClaim)
}
});
},5* 60* 1000); // verifica cada 5 min
}

module.exports = { addClaim , checkClaim , timeClaim ,expiredClaim }
