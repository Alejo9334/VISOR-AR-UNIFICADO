import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'prueba-publicar-ar-'));
try{
  fs.mkdirSync(path.join(temp,'scripts'),{recursive:true});
  fs.mkdirSync(path.join(temp,'proyectos','pendientes'),{recursive:true});
  fs.cpSync('public/visor',path.join(temp,'public','visor'),{recursive:true});
  fs.copyFileSync('scripts/preparar-publicacion-ar.mjs',path.join(temp,'scripts','preparar-publicacion-ar.mjs'));
  const site=path.join(temp,'public','visor');
  const before=JSON.parse(fs.readFileSync(path.join(site,'catalogo.json'),'utf8'));
  const report=JSON.parse(fs.readFileSync(path.join(site,'optimizacion-imagenes.json'),'utf8'));
  const originalLayer=report.imagenes.find(x=>x.original.endsWith('.png'));
  if(!originalLayer)throw Error('No se encontró un PNG original para el fixture');
  const ref=before.cuadros[0];
  const request={
    version:1,
    titulo:'Prueba aislada',
    cuadros:[ref,{
      id:'cuadro-prueba-integracion',
      nombre:'Cuadro de prueba',
      optimizacionAR:{perfil:'cinematografico'},
      relacionAltoAncho:ref.relacionAltoAncho,
      imagenObjetivo:ref.imagenObjetivo,
      capas:[{
        id:'capa-prueba',
        nombre:'Capa de prueba',
        imagen:originalLayer.original,
        ancho:1,alto:ref.relacionAltoAncho,x:0,y:0,z:.1,opacidad:.65,visible:true,
        animacion:{tipo:'ninguna',amplitud:0,duracionMs:2000}
      }]
    }]
  };
  const file='proyectos/pendientes/prueba-integracion.json';
  fs.writeFileSync(path.join(temp,file),JSON.stringify(request));
  const run=spawnSync(process.execPath,['scripts/preparar-publicacion-ar.mjs',file,'--apply','--append'],{cwd:temp,encoding:'utf8'});
  if(run.status!==0)throw Error('Preparación falló: '+run.stderr);
  const after=JSON.parse(fs.readFileSync(path.join(site,'catalogo.json'),'utf8'));
  if(after.cuadros.length!==before.cuadros.length+1)throw Error('No se agregó exactamente una experiencia');
  if(!after.cuadros.some(x=>x.id==='cuadro-prueba-integracion'))throw Error('No aparece el ID nuevo');
  const added=after.cuadros.find(x=>x.id==='cuadro-prueba-integracion');
  if(added.capas[0].opacidad!==.65)throw Error('La publicación perdió el valor de opacidad de la capa nueva');
  if(added.optimizacionAR?.perfil!=='cinematografico')throw Error('La publicación perdió el perfil de optimización del cuadro nuevo');
  for(const old of before.cuadros){
    const now=after.cuadros.find(x=>x.id===old.id);
    if(!now||now.imagenObjetivo!==old.imagenObjetivo||now.capas.length!==old.capas.length)
      throw Error('Se alteró una experiencia existente: '+old.id);
  }
  console.log('Prueba OK: acepta un proyecto con cuadro preexistente, publica solo el nuevo y conserva los anteriores.');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
