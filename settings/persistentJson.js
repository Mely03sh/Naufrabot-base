'use strict';

const fs = require('fs');
const path = require('path');

// Todos los JSON dinámicos se guardan en el volumen persistente de Railway.
// En local se puede sobrescribir NAUFRA_DATA_DIR.
const DATA_ROOT = path.resolve(
  process.env.NAUFRA_DATA_DIR || '/app/session/data'
);

function resolveDataPath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    throw new TypeError('Se requiere una ruta relativa de datos.');
  }
  let normalized = relativePath.split(String.fromCharCode(92)).join('/');
  while (normalized.startsWith('/')) normalized = normalized.slice(1);
  const target = path.resolve(DATA_ROOT, normalized);
  if (target !== DATA_ROOT && !target.startsWith(DATA_ROOT + path.sep)) {
    throw new Error('Ruta de datos fuera del directorio persistente.');
  }
  return target;
}

function readJson(relativePath, fallback) {
  const target = resolveDataPath(relativePath);
  if (!fs.existsSync(target)) {
    const legacy = path.resolve(process.cwd(), relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(legacy) && legacy !== target) {
      fs.copyFileSync(legacy, target);
      console.log('[NAUFRA] Datos migrados al volumen persistente:', relativePath);
    } else {
      writeJson(relativePath, fallback);
      return fallback;
    }
  }
  const value = JSON.parse(fs.readFileSync(target, 'utf8'));
  return value;
}

function writeJson(relativePath, value) {
  const target = resolveDataPath(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temp = target + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\\n');
  fs.renameSync(temp, target);
}

module.exports = { DATA_ROOT, resolveDataPath, readJson, writeJson };
