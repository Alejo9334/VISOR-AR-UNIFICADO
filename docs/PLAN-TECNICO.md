# Plan técnico — VISOR-AR-UNIFICADO

## Objetivo
Unificar el editor principal y el visor AR en un solo repositorio, manteniendo módulos separados y publicación independiente. La migración se hará en paralelo; los repositorios originales no se modificarán ni eliminarán.

## Repositorios de referencia
- Código fuente: https://github.com/Alejo9334/Code-fuente
- Visor de vista previa: https://github.com/Alejo9334/Visor-AR
- Nuevo repositorio: https://github.com/Alejo9334/VISOR-AR-UNIFICADO

## Rama de trabajo
`integracion/base-unificada`. La rama `main` queda reservada para una versión estable y publicable.

## Arquitectura objetivo
- `src/editor/`: editor principal de experiencias AR.
- `src/viewer/`: componentes e integración del visor.
- `src/core/`: contratos de datos, carga de catálogo y lógica compartida.
- `public/visor/`: aplicación web del cliente y runtime AR.
- `public/editor/`: interfaz del editor privado.
- `public/data/catalogo.json`: catálogo central.
- `public/assets/cuadros/<id>/`: imágenes de referencia, capas y recursos de cada experiencia.
- `public/assets/targets.mind`: archivo compilado de reconocimiento, versionado junto con el catálogo compatible.
- `scripts/`: validación, optimización, compilación y actualización segura.
- `.github/workflows/`: validación, publicación del visor y actualización de experiencias como flujos separados.

## Principios obligatorios
1. No sobrescribir los repositorios originales durante la migración.
2. Mantener compatibilidad con los JSON actuales y documentar cualquier migración de esquema.
3. Una actualización de capas no debe cambiar la imagen de reconocimiento ni `targets.mind`.
4. Cambiar una imagen de referencia exige recompilar el índice MindAR y validar todos los objetivos.
5. Las actualizaciones deben modificar solo el ID seleccionado, con comprobación de hash/base revision.
6. No publicar credenciales, tokens ni archivos `.env`; usar GitHub Secrets y variables públicas documentadas.
7. Validar rutas relativas para GitHub Pages y probar también con el prefijo real del repositorio.
8. El editor debe quedar fuera de la navegación pública ordinaria y protegido por autenticación real; `noindex` no equivale a control de acceso.
9. Publicar artefactos de prueba antes de cambiar cualquier URL de clientes.
10. Los originales solo se retirarán si el usuario lo autoriza expresamente después de validar la migración.

## Fases
1. Auditoría y respaldo lógico (en curso).
2. Crear rama de integración y documentación base (realizado).
3. Inventariar dependencias, rutas, contratos JSON y recursos.
4. Integrar editor principal y runtime del visor en módulos separados.
5. Unificar catálogo y rutas de recursos, preservando IDs.
6. Añadir pruebas automatizadas y validadores de integridad.
7. Configurar despliegues de prueba independientes.
8. Prueba funcional en dispositivos móviles: cámara, permisos, reconocimiento, capas, animaciones, QR y caché.
9. Comparación con el sistema original y aprobación del usuario.
10. Publicación estable y migración de enlaces, solo con autorización.

## Criterios de aceptación
- El visor carga desde GitHub Pages sin errores de rutas ni recursos.
- La cámara solicita permisos y el reconocimiento MindAR detecta los marcadores existentes.
- Minecraft Creeper conserva sus 5 capas y el carnet sus 4 capas.
- Las animaciones y parámetros de capas se mantienen.
- Una actualización de un cuadro no altera los demás ni el marcador.
- Los editores pueden exportar un JSON compatible.
- Los flujos de CI validan antes de publicar y no se disparan en bucle por commits automatizados.
- Los repositorios originales permanecen intactos.
