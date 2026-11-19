import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const viewer=fs.readFileSync('public/visor/index.html','utf8');
const catalog=JSON.parse(fs.readFileSync('public/visor/catalogo.json','utf8'));

// La estabilización no debe alterar las imágenes publicadas ni el índice MindAR.
assert.equal(catalog.cuadros.length,3,'Se alteró el número de experiencias registradas');
assert.deepEqual(catalog.cuadros.map(x=>x.capas.length),[5,4,5],'Se alteró la estructura de capas');
assert.ok(/filterMinCF:\s*0\.01; filterBeta:\s*0\.2; warmupTolerance:\s*6; missTolerance:\s*18/.test(viewer),'Configuración de suavizado MindAR ausente');
assert.ok(viewer.includes('var c1=.36,c3=c1+1'),'La entrada cinematográfica sigue con exceso de rebote');
assert.ok(viewer.includes('startLayerMotion(group,version);'),'La reproducción de capas no se inicia');

// Extraer los manejadores reales del visor para probar pérdidas breves y largas.
function handler(event){
  const marker="target.addEventListener('"+event+"', function () {";
  const at=viewer.indexOf(marker);
  assert.ok(at>=0,'No existe el manejador de '+event);
  const fnStart=viewer.indexOf('function () {',at);
  const open=viewer.indexOf('{',fnStart);
  let depth=0,end=-1;
  for(let i=open;i<viewer.length;i++){
    if(viewer[i]==='{')depth++;
    else if(viewer[i]==='}'&&--depth===0){end=i+1;break;}
  }
  assert.ok(end>open,'Manejador mal formado: '+event);
  return viewer.slice(fnStart,end);
}

const timers=new Map();
let nextTimer=1,resetCalls=0,revealCalls=0,statusCalls=0,flashes=0;
const group={loaded:true,sequence:0,lostTimer:0};
const art={id:'cuadro-prueba',nombre:'Prueba'};
const tracked=new Set();
const context={
  group,art,tracked,
  document:{body:{classList:{add(){},remove(){}}}},
  emergenceSettings:()=>({flash:false}),
  pulseRecognition:()=>flashes++,
  revealArtwork:()=>revealCalls++,
  ensureArtworkAssets:()=>Promise.resolve(),
  resetReveal:()=>{resetCalls++;group.sequence++;},
  say:()=>statusCalls++,
  setTimeout:(callback,ms)=>{assert.equal(ms,650);const id=nextTimer++;timers.set(id,callback);return id;},
  clearTimeout:(id)=>{timers.delete(id);}
};
vm.createContext(context);
const found=vm.runInContext('('+handler('targetFound')+')',context);
const lost=vm.runInContext('('+handler('targetLost')+')',context);
found();
assert.equal(revealCalls,1,'No se mostró la experiencia al detectar la imagen');
lost();
assert.equal(resetCalls,0,'La detección se reinició inmediatamente tras una pérdida breve');
assert.equal(timers.size,1,'No se programó confirmación de pérdida');
found();
assert.equal(timers.size,0,'No se canceló una pérdida temporal');
assert.equal(revealCalls,1,'El efecto de entrada se reinició durante un microcorte');
assert.equal(resetCalls,0,'El microcorte reinició el reconocimiento');
assert.ok(tracked.has(art.id),'Se perdió el estado de reconocimiento tras recuperar el objetivo');
lost();
assert.equal(timers.size,1);
for(const callback of timers.values())callback();
timers.clear();
assert.equal(resetCalls,1,'La pérdida prolongada no limpia el estado');
assert.ok(!tracked.has(art.id),'La pérdida prolongada no permite volver a escanear');
found();
assert.equal(revealCalls,2,'No se volvió a activar al detectar realmente la imagen de nuevo');
console.log('OK: suavizado, recuperación de microcortes, pérdidas prolongadas y retorno de los efectos AR');
