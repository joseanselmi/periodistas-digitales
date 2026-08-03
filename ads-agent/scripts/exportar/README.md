# scripts/exportar — pasar a archivo

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Convierten un HTML en el entregable final: el PDF de una guía, los JPG de un
carrusel, las stories. Incluye el **linter de guías**, que es obligatorio.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/exportar/lint-pdf-guide.mjs <ruta.html>`

- `export-pdf.mjs`
- `export-slides-auto.mjs`
- `export-slides.mjs`
- `export-stories.mjs`
- `hook-lint-pdf.mjs`
- `lint-pdf-guide.mjs`

Los tres se llaman entre sí y **por eso viven juntos**: `hook-lint-pdf` invoca a
`lint-pdf-guide`, que invoca a `export-pdf`, cada uno buscando al siguiente en
su misma carpeta. Separarlos los rompe.

Ninguna guía se muestra ni se publica con el lint en rojo.
