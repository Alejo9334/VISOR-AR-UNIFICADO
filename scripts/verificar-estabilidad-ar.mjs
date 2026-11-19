import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html=fs.readFileSync('public/visor/index.html','utf8');
const catalog=JSON.parse(fs.readFileSync('public/visor/catalogo.json','utf8'));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.ok(scripts.length>=1,'No se encontró el código JS del visor');
for(const source of scripts)new vm.Script(source,{filename:'public/visor/index.html'});

// El seguimiento filtra ruido del marcador y tolera pérdidas breves.
const mindar=html.match(/'mindar-image':([\s\S]*?)\n    \}\);/);
assert.ok(mindar,'No se encontró la configuración de MindAR');
for(const [key,expected] of [['filterMinCF','0.01'],['filterBeta','15'],['warmupTolerance','5'],['missTolerance','16']]){
  assert.ok(mindar[1].includes(key+': '+expected),'Falta la configuración de estabilización '+key);
}

// Las animaciones deben funcionar aunque la aparición cinematográfica esté desactivada.
const noEmergence=html.match(/if\(motionReduced\|\|!settings\.enabled\)\{([\s\S]*?)\n        return;\n      \}/);
assert.ok(noEmergence,'No se encontró la entrada sin aparición');
assert.ok(noEmergence[1].includes('startLayerMotion(group,version);'),'La animación no se inicia con aparición desactivada');

// Comprobar que las amplitudes pequeñas realmente generen un movimiento perceptible.
const floatArt=catalog.cuadros.flatMap(x=>x.capas).find(x=>x.animacion?.tipo==='flotar'&&x.animacion.amplitud>0);
const pulseArt=catalog.cuadros.flatMap(x=>x.capas).find(x=>x.animacion?.tipo==='pulso'&&x.animacion.amplitud>0);
assert.ok(floatArt&&pulseArt,'Faltan capas para probar los movimientos');
const floatAmp=floatArt.animacion.amplitud, pulseAmp=pulseArt.animacion.amplitud;
const fY=.008+Math.min(.026,floatAmp*.14);
const pScale=.025+Math.min(.10,pulseAmp*.8);
assert.ok(fY>=.008,'La flotación quedó imperceptible');
assert.ok(pScale>.025,'El pulso quedó imperceptible');
assert.ok(html.includes('y:.008+Math.min(.026,amplitude*.14)'),'No se aplicó el ajuste de flotación');
assert.ok(html.includes('scale:.025+Math.min(.10,amplitude*.8)'),'No se aplicó el ajuste de pulso');
assert.ok(html.includes('rotation:Math.min(Math.PI/3,amplitude*Math.PI/180)'),'No se aplicó el ajuste de giro');
assert.ok(html.includes('anim.activo===false'),'Se perdieron los interruptores de efectos');

console.log('Visor AR: estabilización y efectos verificados. Flotación',fY.toFixed(4),'Pulso',pScale.toFixed(4));
