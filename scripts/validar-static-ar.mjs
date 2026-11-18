import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve('public/visor');
const file=(rel)=>path.resolve(root,rel.replace(/^\.\//,''));
const exists=(rel,label)=>{
  assert.ok(typeof rel==='string'&&rel.startsWith('./'),label+' debe ser una ruta relativa ./');
  const target=file(rel);
  assert.ok(target.startsWith(root+path.sep),label+' sale del directorio del visor');
  assert.ok(fs.existsSync(target)&&fs.statSync(target).isFile(),label+' no existe: '+rel);
  return target;
};
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalogo.json'),'utf8'));
assert.ok(Array.isArray(catalog.cuadros)&&catalog.cuadros.length>=1&&catalog.cuadros.length<=30,'Catálogo vacío o excede 30 experiencias');
assert.equal(catalog.archivoMind,'./targets.mind','El catálogo debe usar el archivo targets.mind del proyecto');
exists(catalog.archivoMind,'Índice MindAR');
assert.equal(catalog.compilador?.cantidadObjetivos,catalog.cuadros.length,'Cantidad de objetivos no coincide con el catálogo');

const ids=new Set();
const layers=new Set();
const targets=new Set();
for(const art of catalog.cuadros){
  assert.ok(art.id&&typeof art.id==='string','Experiencia sin ID');
  assert.ok(!ids.has(art.id),'ID de experiencia duplicado: '+art.id);
  ids.add(art.id);
  assert.ok(Number.isInteger(art.targetIndex)&&art.targetIndex>=0,'targetIndex inválido: '+art.id);
  assert.ok(!targets.has(art.targetIndex),'targetIndex duplicado: '+art.targetIndex);
  targets.add(art.targetIndex);
  assert.ok(art.imagenObjetivo,'Falta imagen de referencia: '+art.id);
  exists(art.imagenObjetivo,'Referencia '+art.id);
  assert.ok(Array.isArray(art.capas)&&art.capas.length>=1&&art.capas.length<=15,'Número de capas inválido: '+art.id);
  const layerIds=new Set();
  for(const layer of art.capas){
    assert.ok(layer.id&&!layerIds.has(layer.id),'ID de capa vacío o repetido: '+art.id);
    layerIds.add(layer.id);
    exists(layer.imagen,'Capa '+art.id+'/'+layer.id);
    layers.add(layer.imagen);
    for(const key of ['ancho','alto','x','y','z','opacidad'])
      assert.ok(Number.isFinite(Number(layer[key])),'Parámetro '+key+' inválido: '+art.id+'/'+layer.id);
  }
}
assert.deepEqual([...targets].sort((a,b)=>a-b),catalog.cuadros.map(x=>x.targetIndex).sort((a,b)=>a-b).map((x,i)=>i),'Los índices de reconocimiento deben ser consecutivos desde cero');

const reportPath=path.join(root,'optimizacion-imagenes.json');
assert.ok(fs.existsSync(reportPath),'Falta el informe de optimización');
const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
assert.ok(Array.isArray(report.imagenes),'Informe de optimización inválido');
assert.ok(report.totalOriginal>=report.totalServido,'Las imágenes servidas no deben pesar más que los originales');
const reportUsed=new Set();
for(const item of report.imagenes){
  exists(item.original,'PNG original');
  exists(item.usado,'Imagen optimizada');
  assert.ok(layers.has(item.usado),'El informe incluye una imagen no referenciada en el catálogo: '+item.usado);
  assert.ok(item.bytesOptimizado<=item.bytesOriginal,'Optimización más pesada que el original: '+item.usado);
  assert.ok(item.transparencia===true,'Se perdió la transparencia: '+item.usado);
  assert.ok(!reportUsed.has(item.usado),'Imagen repetida en informe: '+item.usado);
  reportUsed.add(item.usado);
}
for(const layer of layers)assert.ok(reportUsed.has(layer),'Falta registro de optimización para la capa: '+layer);

for(const name of ['index.html','editor.html','login.html','admin-auth.js','auth-config.js','targets.mind','catalogo.json'])
  assert.ok(fs.existsSync(path.join(root,name)),'Falta archivo esencial: '+name);
const editor=fs.readFileSync(path.join(root,'editor.html'),'utf8');
assert.ok(editor.includes('Alejo9334/VISOR-AR-UNIFICADO/upload/integracion/base-unificada/proyectos/pendientes'),'El botón de alta aún apunta al repositorio anterior');
assert.ok(editor.includes('Alejo9334/VISOR-AR-UNIFICADO/upload/integracion/base-unificada/proyectos/actualizaciones'),'El botón de actualización aún apunta al repositorio anterior');
assert.ok(!editor.includes('Alejo9334/Code-fuente/upload')&&!editor.includes('Alejo9334/Visor-222/upload'),'El editor conserva enlaces a repositorios anteriores');

const creeper=catalog.cuadros.find(x=>x.id==='cuadro-creeper-001');
if(creeper)assert.equal(creeper.capas.length,5,'Creeper debe conservar sus 5 capas');
const carnet=catalog.cuadros.find(x=>x.id==='cuadro-mwa975aj-6lp');
if(carnet)assert.equal(carnet.capas.length,4,'Carnet debe conservar sus 4 capas');
console.log('Validación AR correcta.');
console.log('Experiencias:',catalog.cuadros.length,'Capas:',[...layers].length);
console.log('MindAR:',catalog.archivoMind,'Bytes:',fs.statSync(file(catalog.archivoMind)).size);
console.log('Optimización:',report.ahorroPorcentaje+'%');
