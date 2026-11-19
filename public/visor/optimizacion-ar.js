/* Configuración compartida entre el editor y el visor. Sin dependencias externas. */
(function(root){
  'use strict';
  var presets={
    estable:{
      label:'Máxima estabilidad',motionGain:.72,entranceGain:.82,
      description:'Movimientos discretos y seguimiento más suave.',
      camera:{filterMinCF:.006,filterBeta:.12,warmupTolerance:6,missTolerance:22}
    },
    equilibrado:{
      label:'Equilibrado 2.5D',motionGain:1,entranceGain:1,
      description:'Estabilidad del visor actual con animaciones claramente visibles.',
      camera:{filterMinCF:.01,filterBeta:.2,warmupTolerance:6,missTolerance:18}
    },
    cinematografico:{
      label:'Cinematográfico',motionGain:1.28,entranceGain:1.16,
      description:'Movimiento y aparición más destacados sin empeorar la configuración base de seguimiento.',
      camera:{filterMinCF:.01,filterBeta:.2,warmupTolerance:6,missTolerance:18}
    }
  };
  var amplitudes={
    flotar:{min:.04,ideal:.14,max:.45,unit:''},
    pulso:{min:.015,ideal:.045,max:.16,unit:''},
    girar:{min:3,ideal:8,max:25,unit:'°'},
    desplazar:{min:.08,ideal:.22,max:.55,unit:''},
    balancear:{min:3,ideal:9,max:25,unit:'°'},
    trayectoria:{min:.12,ideal:.35,max:.75,unit:''}
  };
  function normalize(value){
    var profile=value&&typeof value==='object'?value.perfil:value;
    return {perfil:Object.prototype.hasOwnProperty.call(presets,profile)?profile:'equilibrado'};
  }
  function profile(value){return presets[normalize(value).perfil];}
  // MindAR usa un único motor para todo el catálogo. Si alguna experiencia solicita
  // estabilidad máxima, el filtro conservador se aplica al motor compartido.
  // El perfil cinematográfico nunca desactiva el suavizado de seguridad.
  function cameraFor(cuadros){
    var stable=(cuadros||[]).some(function(art){return normalize(art.optimizacionAR).perfil==='estable';});
    return stable?presets.estable.camera:presets.equilibrado.camera;
  }
  function audit(art,reference){
    var errors=[],warnings=[],notes=[];
    if(!art||!art.imagenObjetivo){errors.push('Falta una imagen impresa de reconocimiento.');}
    if(!art||!Array.isArray(art.capas)||!art.capas.length){errors.push('Agrega al menos una capa PNG.');}
    var layers=art&&Array.isArray(art.capas)?art.capas:[];
    if(layers.length>15)errors.push('Se permiten como máximo 15 capas.');
    else if(layers.length>10)warnings.push('Hay más de 10 capas: comprueba el rendimiento de la cámara en un teléfono real.');
    var ratio=Number(art&&art.relacionAltoAncho);
    if(!Number.isFinite(ratio)||ratio<=0||ratio>5)errors.push('La proporción de la referencia no es válida.');
    var ids=new Set(),visible=0,moving=0;
    var gain=profile(art&&art.optimizacionAR).motionGain;
    layers.forEach(function(layer,i){
      var label=(layer&&layer.nombre)||('Capa '+(i+1));
      if(!layer||!layer.id||ids.has(layer.id)){errors.push('La capa '+label+' tiene un identificador duplicado o vacío.');return;}
      ids.add(layer.id);
      if(!layer.imagen){errors.push('La capa '+label+' no tiene PNG.');return;}
      if(layer.visible===false)return;
      visible++;
      for(var key of ['ancho','alto','x','y','z','opacidad']){
        if(!Number.isFinite(Number(layer[key]))){errors.push('Valor inválido ('+key+') en '+label+'.');break;}
      }
      var animation=layer.animacion||{};
      if(animation.activo===false||animation.tipo==='ninguna'||!animation.tipo)return;
      var settings=amplitudes[animation.tipo];
      if(!settings)return;
      var amplitude=Number(animation.tipo==='trayectoria'?(animation.trayectoria||{}).amplitud:animation.amplitud);
      var effective=amplitude*gain;
      var duration=Number(animation.duracionMs);
      if(!Number.isFinite(amplitude)||amplitude<=0){
        warnings.push(label+': animación activa con amplitud cero o inválida.');
      } else {
        moving++;
        if(effective<settings.min){
          warnings.push(label+': efecto '+animation.tipo+' muy sutil ('+Number(effective.toFixed(3))+settings.unit+').');
        } else if(effective>settings.max){
          warnings.push(label+': efecto '+animation.tipo+' muy intenso; podría distraer del reconocimiento.');
        }
      }
      if(!Number.isFinite(duration)||duration<1200||duration>8000){
        warnings.push(label+': ajusta la duración entre 1,2 y 8 segundos para una reproducción legible.');
      }
    });
    if(visible===0)errors.push('Todas las capas están ocultas; el cuadro no mostrará contenido AR.');
    else if(moving===0)warnings.push('No hay animaciones visibles con amplitud positiva; el resultado será estático.');
    if(reference){
      if(reference.width<500||reference.height<500)warnings.push('La imagen de referencia tiene resolución reducida para un escaneo fiable.');
      if(reference.contrast<22)warnings.push('La referencia presenta poco contraste; añade detalles diferentes en el diseño impreso.');
      if(reference.edges<.055)warnings.push('La referencia tiene pocas variaciones locales; evita fondos demasiado lisos o repetitivos.');
      notes.push('Contraste y detalle estimados a partir de una muestra de píxeles; la prueba de cámara es indispensable.');
    }else{
      notes.push('Comprueba iluminación, ausencia de reflejos y nitidez de la imagen impresa. La estabilidad real solo se verifica con cámara.');
    }
    notes.push('El suavizado de seguimiento se comparte entre los cuadros del catálogo; las amplitudes sí se ajustan por cuadro.');
    return {errors:errors,warnings:warnings,notes:notes,visible:visible,moving:moving,
      perfil:normalize(art&&art.optimizacionAR).perfil,valid:errors.length===0};
  }
  // Heurística local, no sustituye el compilador MindAR ni garantiza tracking.
  function analyzeReference(src){
    return new Promise(function(resolve,reject){
      var image=new Image();
      image.crossOrigin='anonymous';
      image.onload=function(){
        try{
          var canvas=document.createElement('canvas'),size=96;
          canvas.width=size;canvas.height=size;
          var ctx=canvas.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(image,0,0,size,size);
          var rgba=ctx.getImageData(0,0,size,size).data;
          var gray=new Float32Array(size*size),total=0,ssq=0,edges=0,count=0;
          for(var i=0;i<gray.length;i++){
            var k=i*4,lum=.2126*rgba[k]+.7152*rgba[k+1]+.0722*rgba[k+2];
            gray[i]=lum;total+=lum;ssq+=lum*lum;
          }
          for(var y=1;y<size;y++)for(var x=1;x<size;x++){
            var idx=y*size+x;
            if(Math.abs(gray[idx]-gray[idx-1])+Math.abs(gray[idx]-gray[idx-size])>26)edges++;
            count++;
          }
          var mean=total/gray.length;
          resolve({width:image.naturalWidth,height:image.naturalHeight,
            contrast:Math.sqrt(Math.max(0,ssq/gray.length-mean*mean)),edges:edges/count});
        }catch(err){reject(err);}
      };
      image.onerror=function(){reject(new Error('No se pudo examinar la imagen de referencia.'));};
      image.src=src;
    });
  }
  function recommended(type,perfil){
    var conf=amplitudes[type];
    if(!conf)return 0;
    var gain=profile(perfil).motionGain;
    return Number((conf.ideal/gain).toFixed(type==='girar'||type==='balancear'?1:3));
  }
  root.VisorAROptimization={presets:presets,normalize:normalize,profile:profile,cameraFor:cameraFor,
    audit:audit,analyzeReference:analyzeReference,recommended:recommended,amplitudes:amplitudes};
})(window);
