# VISOR AR unificado

Plataforma central de experiencias AR, editor y visor para clientes.

## Direcciones

<badge>Publicado en GitHub Pages</badge>
- Visor de clientes: `https://alejo9334.github.io/VISOR-AR-UNIFICADO/visor/`
- Editor AR: `https://alejo9334.github.io/VISOR-AR-UNIFICADO/visor/editor.html`
- Acceso/ayuda del editor: `https://alejo9334.github.io/VISOR-AR-UNIFICADO/visor/login.html`

El editor trabaja localmente en el navegador. La publicación se realiza subiendo el JSON a la rama `main` con una cuenta que tenga permiso de escritura en este repositorio. No hay tokens de GitHub dentro del navegador.

## Publicar un cuadro nuevo
1. Desde el editor, prepara y descarga el JSON publicable.
2. Abre el enlace de GitHub de la ventana de publicación.
3. Sube un único JSON a `proyectos/pendientes/` en `main`.
4. Confirma el commit. GitHub Actions valida el paquete, optimiza imágenes, recompila `targets.mind` y actualiza el catálogo.
5. Espera a que terminen las pruebas y la publicación de Pages.

## Actualizar un cuadro existente
1. Descarga el JSON de actualización desde el editor.
2. Súbelo a `proyectos/actualizaciones/` en `main`.
3. Confirma el commit. El flujo verifica el hash de la versión base, actualiza solo el ID solicitado y preserva la imagen de reconocimiento y el archivo `targets.mind`.

## Publicación
GitHub Pages está habilitado y el último despliegue desde `main` terminó correctamente. Ver [ejecución de publicación](https://github.com/Alejo9334/VISOR-AR-UNIFICADO/actions/runs/44371247832).

## Seguridad
- No guardar claves personales, contraseñas ni tokens en archivos públicos.
- `auth-config.js` está vacío intencionalmente. La autenticación de Supabase no está habilitada; el editor es local y no tiene permisos de escritura directa.
- El repositorio público no debe contener credenciales privadas. Para proteger la edición, se requiere configurar un backend de autenticación y RLS antes de habilitar almacenamiento compartido.
- Las ramas originales de Code-fuente y Visor-AR se conservan como respaldo durante la migración.

## Desarrollo
La rama de producción es `main`; la rama `integracion/base-unificada` conserva la ruta de integración. No fusionar ni eliminar repositorios originales hasta validar la cámara, el reconocimiento, las capas, las animaciones, el editor y las publicaciones en dispositivos reales.
