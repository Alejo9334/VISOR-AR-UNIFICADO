import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const lib=fs.readFileSync('public/visor/optimizacion-ar.js','utf8');
const editor=fs.readFileSync('public/visor/editor.html','utf8');
const viewer=fs.readFileSync('public/visor/index.html','utf8');
const newPublisher=fs.readFileSync('scripts/preparar-publicacion-ar.mjs','utf8');
const updater=fs.readFileSync('scripts/actualizar-cuadro.mjs','utf8');
const ctx={window:{}};vm.createContext(ctx);
new vm.Script(lib);
vm.runInContext(lib,ctx);
const O=ctx.window.VisorAROptimization;
assert.ok(O,'Falta la biblioteca AR compartida');
assert.equal(O.normalize(null).perfil,'equilibrado','El perfil predeterminado debe ser Equilibrado 2.5D');
assert.equal(O.normalize({perfil:'inválido'}).perfil,'equilibrado','Los perfiles desconocidos no deben romper la experiencia');
assert.equal(O.profile({perfil:'equilibrado'}).motionGain,1,'El modo equilibrado debe conservar el movimiento actual');
assert.ok(O.profile({perfil:'estable'}).motionGain<1,'El perfil estable debe disminuir el movimiento');
assert.ok(O.profile({perfil:'cinematografico'}).motionGain>1,'El perfil cinematográfico debe aumentar el movimiento');
const base=O.cameraFor([{optimizacionAR:{perfil:'equilibrado'}}]);
assert.equal(base.filterMinCF,.01,'No modificar el filtro de la versión ya probada');
assert.equal(base.filterBeta,.2,'No modificar Beta del visor ya probado');
assert.equal(base.warmupTolerance,6);
assert.equal(base.missTolerance,18);
const stable=O.cameraFor([{optimizacionAR:{perfil:'cinematografico'}},{optimizacionAR:{perfil:'estable'}}]);
assert.ok(stable.filterBeta<base.filterBeta,'Máxima estabilidad debe suavizar más que el perfil equilibrado');
assert.ok(stable.missTolerance>base.missTolerance,'Máxima estabilidad debe tolerar más fotogramas perdidos');
const artwork={
 id:'nuevo',nombre:'Ejemplo',imagenObjetivo:'data:image/jpeg;base64,AA==',relacionAltoAncho:1.4,
 optimizacionAR:{perfil:'equilibrado'},
 capas:[{id:'capa-1',nombre:'Elemento',imagen:'data:image/png;base64,AA==',ancho:1,alto:1.4,
    x:0,y:0,z:.1,opacidad:1,visible:true,
    animacion:{activo:true,tipo:'balancear',amplitud:0,duracionMs:2500}}]
};
const weak=O.audit(artwork,{width:768,height:950,contrast:45,edges:.19});
assert.equal(weak.valid,true,'Las advertencias no deben bloquear una publicación válida');
assert.ok(weak.warnings.some(x=>x.includes('amplitud cero')),'No se detecta una animación invisible');
artwork.capas[0].animacion.amplitud=O.recommended('balancear',artwork.optimizacionAR);
const corrected=O.audit(artwork,{width:768,height:950,contrast:45,edges:.19});
assert.equal(corrected.moving,1,'La corrección debe activar una animación visible');
assert.ok(!corrected.warnings.some(x=>x.includes('amplitud cero')),'La corrección no eliminó el problema de amplitud');
artwork.capas[0].visible=false;
assert.equal(O.audit(artwork).valid,false,'No permitir publicar cuadros con todas sus capas ocultas');
artwork.capas[0].visible=true;
const poor=O.audit(artwork,{width:240,height:280,contrast:9,edges:.01});
assert.ok(poor.warnings.some(x=>x.includes('contraste')),'La imagen de bajo contraste no genera alerta');
assert.ok(poor.warnings.some(x=>x.includes('referencia')),'La imagen de referencia pequeña no genera alerta');

for(const [tag,html] of [['editor',editor],['visor',viewer]]){
 assert.ok(html.includes('src="./optimizacion-ar.js"'),'Falta la biblioteca compartida en '+tag);
}
for(const name of ['arOptimizationProfile','arOptimizationCheck','arOptimizationFix','arOptimizationReport']){
 assert.ok(editor.includes('id="'+name+'"'),'Falta el control '+name);
}
assert.ok(editor.includes("optimizacionAR:optimization.normalize({perfil:'equilibrado'})"),'Los cuadros nuevos no tienen el perfil equilibrado');
assert.ok(editor.includes('optimization.analyzeReference('),'La comprobación no examina la imagen');
assert.equal(editor.split('await requireOptimizationCheck(art)').length-1,2,'Falta validación previa a publicación o actualización');
assert.ok(editor.includes('optimizacionAR:optimization.normalize(art.optimizacionAR)'),'El JSON nuevo no lleva su perfil');
assert.ok(viewer.includes('optimization.cameraFor(data.cuadros)'),'El visor no configura el seguimiento');
assert.ok(viewer.includes('gain:group.optimization.motionGain'),'El visor no asigna la intensidad por cuadro');
assert.ok(viewer.includes('group.optimization.entranceGain'),'La entrada 2.5D no respeta el perfil');
for(const src of [newPublisher,updater])assert.ok(src.includes('optimizacionAR:{perfil:'),'El backend no conserva perfiles');
console.log('Perfiles, motor compartido, contraste de referencia, amplitudes y comprobación previa AR: OK');
