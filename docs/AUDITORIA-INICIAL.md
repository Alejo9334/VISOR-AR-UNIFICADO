# Auditoría inicial — VISOR AR

Fecha: 2026-11-18

## Nuevo repositorio
- Repositorio: Alejo9334/VISOR-AR-UNIFICADO
- Visibilidad observada: público.
- Rama predeterminada: main.
- Contenido inicial observado: README.md.
- Rama creada para integración: integracion/base-unificada.
- No se configuró GitHub Pages ni hay ejecuciones de Actions observadas al momento de la revisión.

## Code-fuente
- Rama de desarrollo auditada: desarrollo/multicuadros-ar-v2.
- HEAD observado: f1b0f660c3a760a78372bff3ff10b1fc31acff15.
- Ramas observadas: main, desarrollo/multicuadros-ar-v2 y dos ramas de respaldo.
- Comparación main...desarrollo/multicuadros-ar-v2: divergente; desarrollo está 161 commits adelante y 3 detrás de main. No hacer merge directo.
- Inventario observado: 78 archivos en el árbol auditado.
- Incluye aplicación React/TypeScript en src/, herramientas en scripts/, prototipo web AR estático en public/prototipo-ar/, catálogo, recursos y cinco workflows.
- package.json define Vite, React 19, Three.js, MindAR mediante instalación aislada en workflows, TypeScript y utilidades.
- vite.config.ts usa actualmente base: '/Visor-222/'. Es incompatible con el nombre/ruta actual de Code-fuente si se publica bajo su URL GitHub Pages; debe configurarse por entorno.
- Hay dos JSON de actualización de Creeper de aproximadamente 6.88 MB cada uno dentro de proyectos/actualizaciones/. No copiarlos a la raíz ni duplicarlos; determinar si son históricos o pendientes y conservar trazabilidad.
- public/prototipo-ar/catalogo.json contiene dos experiencias: cuadro-creeper-001 con 5 capas y cuadro-mwa975aj-6lp (Carnet) con 4 capas.
- public/prototipo-ar/targets.mind y recursos de imagen son activos críticos; deben conservarse en conjunto con el catálogo compatible.

## Visor-AR
- Rama principal observada: main.
- Rama de respaldo observada: respaldo/preview-2026-11-10.
- Árbol principal observado: workflow publicar-preview.yml, README.md y un JSON de proyecto Creeper.
- Tiene un flujo de vista previa independiente. No debe ser fuente única de verdad del catálogo.

## Riesgos y decisiones
1. Las ramas de Code-fuente divergen; usar copia selectiva auditada, no merge directo.
2. El visor AR está implementado como HTML estático separado dentro de public/prototipo-ar; integrarlo como módulo independiente primero, refactorizar después.
3. El editor React 3D (src/App.tsx) y el editor AR de public/prototipo-ar/editor.html son herramientas distintas. La decisión del proyecto es conservar el editor AR como editor principal de publicación y no incorporar el editor 3D salvo que una necesidad posterior lo justifique.
4. El despliegue requiere base paths correctos y pruebas de recursos con el prefijo de GitHub Pages.
5. La autenticación del editor debe revisarse; noindex no es seguridad.
6. Los recursos optimizados deben mapearse uno a uno con las capas del catálogo; no asumir que todo archivo .optimized.webp es requerido.

## Estado de cambios
Esta auditoría solo creó documentación en la rama nueva integracion/base-unificada. No se modificaron Code-fuente, Visor-AR ni sus ramas.
