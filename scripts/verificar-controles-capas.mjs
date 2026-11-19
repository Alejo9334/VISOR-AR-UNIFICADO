import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('public/visor/editor.html','utf8');
const viewer=fs.readFileSync('public/visor/index.html','utf8');
const publishing=fs.readFileSync('scripts/preparar-publicacion-ar.mjs','utf8');
const updating=fs.readFileSync('scripts/actualizar-cuadro.mjs','utf8');

// Los tres grupos conservan su configuración cuando se desactivan.
for(const id of ['rotationEnabled','shadowEnabled','animationEnabled']){
  assert.ok(html.includes('id="'+id+'"'), 'Falta el control '+id);
}
for(const id of ['rotationSettings','shadowSettings','animationSettings']){
  assert.ok(html.includes('id="'+id+'"'), 'Falta el panel '+id);
}
assert.ok(html.includes("l.rotacion3DActiva=$('rotationEnabled').checked"),'No se guarda el interruptor de rotación');
assert.ok(html.includes("activo:$('animationEnabled').checked"),'No se guarda el interruptor de animación');
assert.ok(viewer.includes("anim.activo===false?'ninguna'"),'El visor no respeta la animación desactivada');
assert.ok(viewer.includes("layer.rotacion3DActiva===false"),'El visor no respeta la rotación desactivada');
for(const src of [publishing,updating]){
  assert.ok(src.includes('rotacion3DActiva:l.rotacion3DActiva!==false'),'La publicación omite el interruptor de rotación');
  assert.ok(src.includes('activo:a.activo!==false'),'La publicación omite el interruptor de animación');
}

// Los botones actúan sobre el orden de capas, no sobre el orden de carga.
for(const id of ['layerUp','layerDown','toFront','toBack']){
  assert.ok(html.includes('id="'+id+'"'),'Falta el botón '+id);
}
assert.ok(html.includes("all.slice().reverse().forEach"),'La lista no presenta las capas de frente a fondo');
const match=html.match(/  function move\(delta\)\{[\s\S]*?\n  \}/);
assert.ok(match,'No se encontró la función para subir/bajar capas');
let recorded=0,rendered=0,persisted=0;
const layers=[
  {id:'fondo',nombre:'Fondo',z:.10,separacionZ:.002},
  {id:'medio',nombre:'Medio',z:.20,separacionZ:.004},
  {id:'frente',nombre:'Frente',z:.30,separacionZ:.006}
];
const context={article:()=>({capas:layers}),selectedId:'medio',checkpoint:()=>recorded++,render:()=>rendered++,persistQuiet:()=>persisted++,note:()=>{}};
vm.createContext(context);
vm.runInContext(match[0],context);
context.move(1);
assert.deepEqual(layers.map(x=>x.id),['fondo','frente','medio'],'Subir no lleva la capa hacia el frente');
assert.equal(layers[2].z,.30,'Subir no actualizó la profundidad física del PNG');
assert.equal(layers[2].separacionZ,.006,'Subir no actualizó la separación del PNG');
context.move(-1);
assert.deepEqual(layers.map(x=>x.id),['fondo','medio','frente'],'Bajar no devuelve la capa hacia el fondo');
assert.equal(layers[1].z,.20,'La profundidad original no se restauró al bajar');
assert.equal(recorded,2,'Las operaciones de orden deben ser deshacibles');
assert.equal(rendered,2,'La vista debe actualizarse al cambiar el orden');
assert.equal(persisted,2,'El orden debe guardarse localmente');
console.log('Controles de efectos y orden de capas: OK');
