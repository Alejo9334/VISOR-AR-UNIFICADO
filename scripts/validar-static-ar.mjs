import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public/visor');
const catalogPath = path.join(root, 'catalogo.json');
const fail = (message) => { console.error('ERROR:', message); process.exitCode = 1; };
if (!fs.existsSync(catalogPath)) throw new Error('No existe public/visor/catalogo.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
if (!Array.isArray(catalog.cuadros) || catalog.cuadros.length < 1) fail('El catálogo no contiene experiencias.');
if (!catalog.archivoMind) fail('Falta archivoMind en el catálogo.');

const mindPath = path.resolve(root, catalog.archivoMind || '');
if (!mindPath.startsWith(root + path.sep) || !fs.existsSync(mindPath)) fail('No existe el archivo MindAR: ' + catalog.archivoMind);

const ids = new Set();
for (const cuadro of catalog.cuadros || []) {
  if (!cuadro.id || ids.has(cuadro.id)) fail('ID vacío o duplicado: ' + cuadro.id);
  ids.add(cuadro.id);
  if (!cuadro.imagenObjetivo) fail(cuadro.id + ': falta imagenObjetivo');
  const assets = [cuadro.imagenObjetivo, ...(cuadro.capas || []).map(c => c.imagen)];
  if (!Array.isArray(cuadro.capas) || cuadro.capas.length === 0) fail(cuadro.id + ': no tiene capas');
  for (const asset of assets) {
    if (!asset || typeof asset !== 'string') { fail(cuadro.id + ': referencia de recurso inválida'); continue; }
    const absolute = path.resolve(root, asset);
    if (!absolute.startsWith(root + path.sep)) { fail(cuadro.id + ': ruta fuera del directorio visor: ' + asset); continue; }
    if (!fs.existsSync(absolute)) fail(cuadro.id + ': no existe ' + asset);
  }
}
for (const required of ['index.html','editor.html','login.html','admin-auth.js','auth-config.js','targets.mind']) {
  if (!fs.existsSync(path.join(root, required))) fail('Falta archivo esencial: ' + required);
}
if (ids.has('cuadro-creeper-001')) {
  const creeper = catalog.cuadros.find(x => x.id === 'cuadro-creeper-001');
  if (creeper.capas.length !== 5) fail('Creeper debería conservar 5 capas.');
}
if (ids.has('cuadro-mwa975aj-6lp')) {
  const carnet = catalog.cuadros.find(x => x.id === 'cuadro-mwa975aj-6lp');
  if (carnet.capas.length !== 4) fail('Carnet debería conservar 4 capas.');
}
if (process.exitCode) process.exit(process.exitCode);
console.log('Validación AR correcta.');
for (const cuadro of catalog.cuadros) console.log('- ' + cuadro.id + ': ' + cuadro.capas.length + ' capas');
console.log('- MindAR: ' + catalog.archivoMind);
