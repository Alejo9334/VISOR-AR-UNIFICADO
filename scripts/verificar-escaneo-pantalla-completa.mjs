import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('public/visor/index.html','utf8');
const zoomLib=fs.readFileSync('public/visor/camera-zoom.js','utf8');
for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  if(script.trim())new vm.Script(script,{filename:'public/visor/index.html'});
}
new vm.Script(zoomLib,{filename:'public/visor/camera-zoom.js'});

const reticle=html.match(/#reticle\s*\{([^}]+)\}/);
const pulse=html.match(/#recognitionPulse\s*\{([^}]+)\}/);
assert.ok(reticle&&pulse,'No se encuentran los estilos del escáner');
assert.match(reticle[1],/inset:\s*max\(10px/,'La guía sigue siendo una caja central');
assert.match(reticle[1],/width:\s*auto/,'La guía debe ocupar todo el ancho disponible');
assert.match(reticle[1],/height:\s*auto/,'La guía debe ocupar todo el alto disponible');
assert.doesNotMatch(reticle[1],/290px|68vw|999px/,'La guía conserva la vieja sombra o el marco pequeño');
assert.match(pulse[1],/inset:\s*max\(10px/,'La confirmación no cubre la pantalla');
assert.ok(html.includes('id="zoomDock" hidden'),'El zoom debe estar oculto inicialmente');
assert.ok(html.includes('#zoomDock[hidden] { display: none !important; }'),'El zoom no debe mostrarse sin compatibilidad');
assert.ok(html.includes('src="./camera-zoom.js"'),'No se carga el ayudante de cámara');
assert.ok(html.includes('discoverCameraZoom();'),'No se comprueba la cámara al arrancar');
assert.ok(html.includes('resetCameraZoom();'),'No se limpian los controles de zoom');
assert.ok(html.includes('filterMinCF: '+String.fromCharCode(39)+'+cameraConfig.filterMinCF')||
  html.includes('cameraConfig.filterMinCF'),'Se perdieron los filtros de seguimiento actuales');
assert.ok(html.includes('maxTrack: 1'),'No se conservó el número de objetivos simultáneos');

const env={window:{}};vm.createContext(env);vm.runInContext(zoomLib,env);
const z=env.window.VisorARCameraZoom;
assert.ok(z,'No se registró el ayudante de zoom');
assert.equal(z.getRange(null),null);
assert.equal(z.findTrack({querySelectorAll:()=>[{srcObject:{getVideoTracks:()=>[]}}]}),null);
let value=1,calls=[];
const track={
  readyState:'live',
  getCapabilities:()=>({zoom:{min:1,max:3,step:.1}}),
  getSettings:()=>({zoom:value}),
  applyConstraints:async args=>{calls.push(args);value=args.advanced[0].zoom;}
};
const range=z.getRange(track);
assert.equal(range.min,1);assert.equal(range.max,3);
assert.equal(z.findTrack({querySelectorAll:()=>[{srcObject:{getVideoTracks:()=>[track]}}]}),track);
assert.ok(z.next(range,1,1)>1,'Zoom + debe incrementar');
assert.equal(z.next(range,3,1),3,'Zoom + respeta máximo');
assert.equal(z.next(range,1,-1),1,'Zoom - respeta mínimo');
const requested=z.next(range,1,1);
const applied=await z.apply(track,range,requested);
assert.equal(applied,requested,'No se aplicó la ampliación');
assert.equal(calls.length,1,'La cámara debe recibir una sola petición');
assert.deepEqual(Object.keys(calls[0]),['advanced']);
const unsupported={...track,getCapabilities:()=>({})};
assert.equal(z.getRange(unsupported),null,'No ofrecer zoom en cámaras incompatibles');
const stopped={...track,readyState:'ended'};
await assert.rejects(()=>z.apply(stopped,range,1.5),/desconectada/);

console.log('Escaneo completo, guía transparente, zoom nativo opcional, límites y filtros MindAR: OK');
