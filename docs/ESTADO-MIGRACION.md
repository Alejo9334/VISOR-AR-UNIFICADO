# Estado de migración y publicación

Fecha: 2026-11-18

## Integración realizada
- PR #1 integrado en `main`: https://github.com/Alejo9334/VISOR-AR-UNIFICADO/pull/1
- Commit de integración: `2fc2c1fe95632344150c15141662161522e6fc02`
- Rama de producción: `main`
- Rama de integración paralela: `integracion/base-unificada`

## Componentes
- Visor cliente: `public/visor/index.html`
- Editor AR principal: `public/visor/editor.html`
- Acceso/ayuda: `public/visor/login.html`
- Atajo editor: `public/editor/`
- Atajo administrativo: `public/admin/`
- Catálogo: `public/visor/catalogo.json`
- Reconocimiento: `public/visor/targets.mind`

## Experiencias migradas
- `cuadro-creeper-001`: 5 capas.
- `cuadro-mwa975aj-6lp` (Carnet): 4 capas.
- Total: 2 experiencias y 9 capas.

## Validaciones realizadas
- Sintaxis de scripts: correcta.
- Editor y visor: pruebas de regresión correctas.
- Actualización segura: prueba aislada correcta; preserva marcador y cuadros vecinos.
- Publicación de cuadro nuevo: prueba aislada correcta.
- Catálogo y recursos: referencias locales correctas.
- Compilador MindAR: compilación real en una copia aislada correcta.
- Optimización: 77,2% de ahorro registrado; se conservan PNG originales.
- Los enlaces de publicación del editor apuntan al nuevo repositorio y a la rama `main`.

Última validación completa: https://github.com/Alejo9334/VISOR-AR-UNIFICADO/actions/runs/44369870927

## Publicación web
GitHub Pages ya está habilitado. El despliegue manual del 2026-11-18 terminó correctamente (build y deploy en verde): https://github.com/Alejo9334/VISOR-AR-UNIFICADO/actions/runs/44371247832

Direcciones publicadas:
- `https://alejo9334.github.io/VISOR-AR-UNIFICADO/`
- Visor: `https://alejo9334.github.io/VISOR-AR-UNIFICADO/visor/`
- Editor: `https://alejo9334.github.io/VISOR-AR-UNIFICADO/editor/`

## Editor y autenticación
El editor actual funciona localmente en el navegador y exporta JSON. La publicación requiere una cuenta GitHub con permiso de escritura y un commit de JSON en `proyectos/pendientes/` o `proyectos/actualizaciones/`. No hay tokens privados incrustados en el frontend.
Supabase permanece sin configurar intencionalmente; no se requiere para el flujo local de exportación y publicación por GitHub. Si se desea guardar proyectos en nube con autenticación, habrá que configurar Supabase y sus políticas RLS antes de habilitarlo.

## Repositorios originales
`Code-fuente` y `Visor-AR` siguen intactos. No eliminarlos hasta que se prueben cámara, reconocimiento y animaciones en un teléfono real.
