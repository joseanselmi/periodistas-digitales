# img/ — Imágenes de las landings

Las imágenes que usan las páginas del curso (`index.html`, `landing.html`, etc.).

## Convención

- Nombres con prefijo `sistema-ingresos-*` = imágenes de la página de ventas.
- Cada imagen suele estar en **dos formatos**: `.png` (original) y `.webp`
  (optimizada, la que carga la web). El `.webp` es más liviano — se sirve ese
  para que la landing cargue rápido.

## Qué imagen es cada una

| Archivo | Dónde se usa |
|---|---|
| `sistema-ingresos-instructor-foto` | Foto del instructor |
| `sistema-ingresos-problema-split` | Bloque "problema" (antes/después) |
| `sistema-ingresos-mecanismo-stack` | Bloque del mecanismo / stack de valor |
| `sistema-ingresos-bono-1-templates-ig` | Bono 1 (plantillas IG) |
| `sistema-ingresos-bono-2-guia-ia` | Bono 2 (guía IA) |
| `sistema-ingresos-bono-3-leadr-laptop` | Bono 3 (mes de Leadr) |
| `sistema-ingresos-checkout` | Captura del checkout |
| `testimonio-whatsapp-ana`, `testimonio-whatsapp-antonio` | Testimonios (capturas de WhatsApp) |

## Peso / performance

Las imágenes son la principal causa del peso de la landing. Se pasaron a WebP y el
hero 3D se difiere (carga inicial bajó de 13,7 MB → 1,39 MB). Al agregar una
imagen nueva: optimizarla (WebP) y correr `../qa-salud-sitio.mjs` para verificar
que la página siga cargando rápido.
