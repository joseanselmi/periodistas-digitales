# scripts/generar — crean contenido y creativos

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Producen las piezas: carruseles, imágenes de campaña, posts del calendario
orgánico. Escriben en [`../../carousels/`](../../contenido/carousels/README.md) y
[`../../organic/`](../../contenido/organic/README.md).

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/generar/carousel-generator.mjs`

- `carousel-generator.mjs` — arma un carrusel a partir de lo que se le pase.
- `gen-agosto.mjs` — los posteos de la primera quincena de agosto (público
  general, voseo).
- `gen-muro-agosto.mjs` — la serie "el periodista del muro", del 16 al 31 de
  agosto.
- `gen-muro-stories.mjs` — las stories verticales que acompañan esa serie.

Generan **borradores**. La revisión visual la hace Jose antes de que nada salga.

## Qué se borró (07/08/2026) y por qué no hay que revivirlo

- `add-nav.mjs` — de un solo uso. Le metía flechas de navegación a cuatro
  carruseles HTML de la semana del 12 de mayo, escritos a mano adentro del
  script, para poder sacarles captura a mano con Win+Shift+S. Esos cuatro
  archivos ya tienen las flechas puestas (volver a correrlo se las duplicaba), y
  el trabajo que habilitaba lo hace solo
  [`../exportar/export-slides-auto.mjs`](../exportar/README.md), que saca los JPG
  sin capturas manuales.
