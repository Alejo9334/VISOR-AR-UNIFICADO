# Optimización AR — VISOR-AR-UNIFICADO

El módulo de **Optimización AR** permite asignar a cada cuadro uno de tres perfiles. Todos los cuadros nuevos comienzan en **Equilibrado 2.5D**.

| Perfil | Animaciones | Aparición | Seguimiento MindAR |
| --- | --- | --- | --- |
| Máxima estabilidad | 72 % | 82 % | Filtro más conservador, tolerancia de 22 fotogramas |
| Equilibrado 2.5D | 100 % | 100 % | Configuración base probada: filterMinCF .01, filterBeta .2, warmup 6, miss 18 |
| Cinematográfico | 128 % | 116 % | Misma configuración de reconocimiento base |

**Importante:** MindAR utiliza un motor de seguimiento compartido para todos los objetivos del catálogo. Si al menos un cuadro publicado utiliza «Máxima estabilidad», el visor carga la configuración conservadora para *todos* los cuadros en esa sesión. El modo cinematográfico no empeora deliberadamente el seguimiento.

## Editor

1. Crea o selecciona un cuadro y elige el perfil en **Optimización AR**.
2. Pulsa **Comprobar cuadro** para analizar amplitudes, duración, visibilidad, cantidad de capas y una estimación del contraste y detalles de la imagen de reconocimiento.
3. Si aparece una advertencia por amplitud débil, pulsa **Ajustar amplitudes** (opcional). Esta acción solo corrige parámetros débiles y duraciones fuera de rango; no sustituye una prueba visual.
4. Prueba primero en la vista previa y luego en un teléfono real.
5. En **Preparar publicación** o **Actualizar experiencia** se ejecuta otra comprobación. Los errores estructurales bloquean la exportación; las advertencias requieren confirmación.

La imagen impresa necesita puntos visuales distintivos y buena iluminación. La inspección de píxeles es una **heurística**, no el puntaje de seguimiento MindAR ni una certificación de estabilidad. Los efectos están sujetos a la preferencia del sistema `prefers-reduced-motion`.

Los perfiles se guardan bajo `optimizacionAR.perfil` en el JSON del proyecto, en la publicación y en la actualización. Los catálogos antiguos que no tienen ese campo se interpretan como **Equilibrado 2.5D** sin reescribirlos.

## Conservación de proyectos y clientes

No se altera `targets.mind`, los ID de cuadros, las imágenes impresas ni los archivos publicados por seleccionar un perfil en el editor local. Los cambios solo llegan al visor de clientes cuando se publica o actualiza una experiencia mediante el flujo habitual de GitHub. Se recomienda descargar un respaldo JSON y comprobar el reconocimiento desde la cámara antes de compartir el nuevo cuadro.
