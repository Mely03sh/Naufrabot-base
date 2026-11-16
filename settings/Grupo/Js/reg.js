const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const moment = require("moment-timezone")
const time = moment.tz('America/Lima').format('DD/MM HH:mm:ss')

// Railway volume: /app/session. En local se usa ./session/data.
const REGISTRO_PATH = process.env.NAUFRA_REGISTRO_PATH ||
    path.resolve(__dirname, '../../../session/data/registros.json');
const LEGACY_REGISTRO_PATH = path.resolve(__dirname, '../Json/registros.json');

fs.mkdirSync(path.dirname(REGISTRO_PATH), { recursive: true });

// Migra el JSON anterior solo si aún no existe una copia persistente.
if (!fs.existsSync(REGISTRO_PATH)) {
    if (fs.existsSync(LEGACY_REGISTRO_PATH)) {
        fs.copyFileSync(LEGACY_REGISTRO_PATH, REGISTRO_PATH);
        console.log('[NAUFRA] Registro de usuarios migrado al almacenamiento persistente.');
    } else {
        fs.writeFileSync(REGISTRO_PATH, '[]\n');
    }
}

const registro = JSON.parse(fs.readFileSync(REGISTRO_PATH, 'utf8'));
if (!Array.isArray(registro)) {
    throw new Error('[NAUFRA] El archivo persistente de registros no contiene una lista JSON válida.');
}

function guardarRegistro() {
    const temporal = REGISTRO_PATH + '.tmp';
    fs.writeFileSync(temporal, JSON.stringify(registro, null, 2) + '\n');
    fs.renameSync(temporal, REGISTRO_PATH);
}
/////REGISTRO
 const AddReg = ( sender, nombre) => {
     const obj = {
  id : sender ,
  nombre : nombre,
  nivel : 1,
  xp : 1,
  rxp : 0,
  dinero : 50,
  rep : 0}
            registro.push(obj)
            guardarRegistro()
        }

        

        const checkOfReg = (sender) => {
            let status = false
            Object.keys(registro).forEach((i) => {
                if (registro[i].id === sender) {
                    status = true
                }
            })
            return status
        }
        
      const checkOfRegM  = (usuario) => {
            let status = false
            Object.keys(registro).forEach((i) => {
                if (registro[i].id === usuario) {
                    status = true
                }
            })
            return status
        }
        
 //////REGISTRO
 /////ECONOMÍA 

const delkoin = (sender, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
registro[position].dinero -= monto
guardarRegistro()
}
}

const addkoin = (sender, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
registro[position].dinero += monto
guardarRegistro()
}
}

const MoneyOfSender = (sender) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
return registro[position].dinero
}
}
 
 /// mentioned
 const delkoinM = (usuario, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === usuario) {
position = i
}
})
if (position !== false) {
registro[position].dinero -= monto
guardarRegistro()
}
}

const addkoinM = (usuario, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === usuario) {
position = i
}
})
if (position !== false) {
registro[position].dinero += monto
guardarRegistro()
}
}

const MoneyOfM = (usuario) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === usuario) {
position = i
}
})
if (position !== false) {
return registro[position].dinero
}
}
////ECONOMÍA 
////NIVEL
const addLevel = (sender, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
registro[position].nivel += monto
guardarRegistro()
}
}
/////ADD XP
const addXp = (sender, monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
registro[position].xp += monto
guardarRegistro()
}
}
////NIVEL DEL USUARIO 
const levelOfsender = (sender) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
return registro[position].nivel
}
}
///XP DEL USUARIO 
 const xpOfsender = (sender) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
return registro[position].xp
}
}          
///////////RXP
const addRxp = (sender,monto) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
registro[position].rxp += monto
guardarRegistro()
}
}
const Rxp = (sender) => {
let position = false
Object.keys(registro).forEach((i) => {
if (registro[i].id === sender) {
position = i
}
})
if (position !== false) {
return registro[position].rxp
}
}





// Función para agregar reputación a un usuario
const addRep = (usuario, monto) => {
    let status = false;

    // Asegúrate de que el usuario sea una cadena
    if (typeof usuario === 'string') {
        // Recorta el valor del usuario para asegurarse de que no haya espacios adicionales
        usuario = usuario.trim();

        // Busca el usuario dentro de registro
        registro.forEach((user, index) => {
            // Recorta los valores de id de los usuarios en el JSON para evitar problemas con espacios
            let userId = user.id.trim();
            if (userId === usuario) {
                console.log(`Usuario encontrado: ${userId}`); // Depuración: Verificación de usuario
                user.rep += monto;  // Actualiza la reputación del usuario
                console.log(`Nueva reputación: ${user.rep}`); // Depuración: Verificación de reputación
                status = true;  // Marca que se encontró y se actualizó el usuario
            }
        });
    }

    // Si el usuario fue encontrado y se actualizó, guarda el archivo
    if (status) {
        console.log('Guardando cambios en el archivo JSON...');
        guardarRegistro()
        console.log('Cambios guardados correctamente.');
    } else {
        console.log('Usuario no encontrado o no se pudo actualizar.');
    }
}



// Función para agregar reputación a un usuario
const delRep = (usuario, monto) => {
    let status = false;

    // Asegúrate de que el usuario sea una cadena
    if (typeof usuario === 'string') {
        // Recorta el valor del usuario para asegurarse de que no haya espacios adicionales
        usuario = usuario.trim();

        // Busca el usuario dentro de registro
        registro.forEach((user, index) => {
            // Recorta los valores de id de los usuarios en el JSON para evitar problemas con espacios
            let userId = user.id.trim();
            if (userId === usuario) {
                console.log(`Usuario encontrado: ${userId}`); // Depuración: Verificación de usuario
                user.rep -= monto;  // Actualiza la reputación del usuario
                console.log(`Nueva reputación: ${user.rep}`); // Depuración: Verificación de reputación
                status = true;  // Marca que se encontró y se actualizó el usuario
            }
        });
    }

    // Si el usuario fue encontrado y se actualizó, guarda el archivo
    if (status) {
        console.log('Guardando cambios en el archivo JSON...');
        guardarRegistro()
        console.log('Cambios guardados correctamente.');
    } else {
        console.log('Usuario no encontrado o no se pudo actualizar.');
    }
}


const repUser = (sender) =>{
let position = false ;
Object.keys(registro).forEach((i) =>{
if(registro[i].id === sender){
position = i
}})
if(position !== false){
return registro[position].rep
}}
////LEVEL  
   module.exports = {
   MoneyOfSender, 
   addkoin ,
    delkoin,  
    AddReg, 
    checkOfReg , 
    addLevel , 
    addXp , 
    levelOfsender , 
    xpOfsender ,
    checkOfRegM,
    addkoinM , 
    delkoinM ,
     MoneyOfM,
    Rxp,
    addRxp,
    addRep ,
    delRep , 
    repUser 
    }