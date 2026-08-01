# scripts/generar — crean contenido y creativos

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Producen las piezas: carruseles, imágenes de campaña, posts del calendario
orgánico. Escriben en [`../../carousels/`](../../contenido/carousels/README.md) y
[`../../organic/`](../../contenido/organic/README.md).

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/generar/carousel-generator.mjs`

- `add-nav.mjs`
- `carousel-generator.mjs`
- `gen-agosto.mjs`
- `gen-muro-agosto.mjs`
- `gen-muro-stories.mjs`

Generan **borradores**. La revisión visual la hace Jose antes de que nada salga.
