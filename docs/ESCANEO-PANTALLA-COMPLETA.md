# Escaneo de pantalla completa y reconocimiento a distancia

En el visor AR la **guía azul ocupa casi toda la pantalla**, respetando las áreas seguras del teléfono. Las esquinas son una ayuda visual y no una región que limite el reconocimiento. MindAR ya analiza la imagen de cámara; agrandar el contorno no acelera por sí mismo el algoritmo.

## Reconocer cuadros más lejanos

La distancia máxima es variable: depende de la superficie impresa, contraste, detalle único, nitidez, iluminación, enfoque y calidad del teléfono. Un cuadro físicamente más grande suele ser más fácil de reconocer a mayor distancia que una tarjeta pequeña. No existe una distancia fija garantizada.

Recomendaciones:

- Utilizar imágenes de reconocimiento con rasgos visuales distintivos en toda la superficie.
- Evitar reflejos, patrones idénticos, fondos lisos y fotografías fuera de foco.
- Mostrar la imagen completa, sin recortarla, y mantener la cámara lo más estable posible.
- Si el cuadro se ve demasiado pequeño, acercarse o utilizar el **zoom opcional** cuando el móvil lo permita.
- Probar la experiencia en distintas distancias y celulares reales antes de compartirla.

## Control de zoom (si el teléfono lo soporta)

El visor consulta las capacidades de la **pista nativa de cámara que MindAR ya utiliza**. Solo si informa un rango de zoom válido aparecen los botones **− / +**. Nunca se solicita una cámara adicional ni se modifica la resolución del canvas. El zoom está limitado al rango del dispositivo y como máximo 4×. En cámaras que no admiten zoom controlable mediante el navegador, no aparece ningún botón.

**Advertencia:** el zoom puede ser digital, por lo que no necesariamente aporta nuevos detalles para detectar una imagen lejana. Aumentar zoom también reduce el campo de visión. El control es manual y opcional; comienza siempre con el zoom original.

Se conservaron los filtros de estabilidad, la tolerancia a microcortes y los perfiles de Optimización AR ya publicados. El catálogo, los PNG y `targets.mind` permanecen intactos.

### Comprobaciones

`node scripts/verificar-escaneo-pantalla-completa.mjs` valida la sintaxis del visor, los límites de zoom, la compatibilidad de cámaras no soportadas y que el marco no siga reducido a su tamaño anterior. La prueba física de cámara debe completarse en un teléfono real.
