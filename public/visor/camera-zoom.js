/* Zoom nativo opcional para cámaras compatibles.
   No altera el escalado del canvas ni el filtro de seguimiento de MindAR. */
(function(root){
  'use strict';
  function getRange(track){
    if(!track||typeof track.getCapabilities!=='function'||typeof track.applyConstraints!=='function')return null;
    try{
      var cap=track.getCapabilities(),z=cap&&cap.zoom;
      if(!z||!Number.isFinite(z.min)||!Number.isFinite(z.max)||z.max<=z.min)return null;
      var min=Math.max(1,z.min),max=Math.min(4,z.max);
      if(max<=min)return null;
      return {min:min,max:max,step:Number.isFinite(z.step)&&z.step>0?z.step:.1};
    }catch(error){return null;}
  }
  function findTrack(doc){
    if(!doc||typeof doc.querySelectorAll!=='function')return null;
    var videos=doc.querySelectorAll('video');
    for(var i=0;i<videos.length;i++){
      var stream=videos[i].srcObject;
      if(!stream||typeof stream.getVideoTracks!=='function')continue;
      var tracks=stream.getVideoTracks();
      for(var j=0;j<tracks.length;j++){
        if(tracks[j]&&tracks[j].readyState!=='ended'&&getRange(tracks[j]))return tracks[j];
      }
    }
    return null;
  }
  function current(track,range){
    var z=NaN;
    try{z=Number(track.getSettings().zoom);}catch(error){}
    return Number.isFinite(z)&&z>=range.min&&z<=range.max?z:range.min;
  }
  function next(range,now,direction){
    var step=Math.max(.25,range.step);
    var base=Math.round((now-range.min)/range.step);
    var steps=Math.max(1,Math.round(step/range.step));
    var raw=range.min+(base+steps*(direction<0?-1:1))*range.step;
    return Math.round(Math.max(range.min,Math.min(range.max,raw))*1000)/1000;
  }
  async function apply(track,range,zoom){
    if(!track||track.readyState==='ended')throw Error('Cámara desconectada');
    var value=Math.max(range.min,Math.min(range.max,zoom));
    // Solo cambia el zoom de una pista que ya está activa, si el navegador
    // declara compatibilidad; nunca solicita una cámara nueva.
    await track.applyConstraints({advanced:[{zoom:value}]});
    return current(track,range);
  }
  root.VisorARCameraZoom={getRange:getRange,findTrack:findTrack,current:current,next:next,apply:apply};
})(window);
