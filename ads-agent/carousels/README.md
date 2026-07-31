# carousels/ — Carruseles para redes (orgánico)

Los carruseles (posts de varias placas) que se publican en Instagram/Facebook.
Una subcarpeta por semana o por tanda.

## Cómo se organiza

- **Por semana**: `semana-DD-MM/` (ej. `semana-12-05/`) o `agosto-s1/`, etc.
- Dentro de cada semana, un archivo por día/pieza:
  - `*.html` — el diseño del carrusel (una placa por "pantalla"). Es la fuente:
    se abre en el navegador y se exporta a imágenes.
  - `*-imagenes/slide-01.jpg …` — las placas ya exportadas a imagen, listas.
  - `*-texto.md` / `jueves-texto.md` — el texto/copy de ese post.
  - `para-subir/N-DIA/` — carpeta final "lista para publicar": las `slide-*.jpg`
    + `pie-de-foto.txt` (el caption a copiar y pegar al subir).

## Cómo se generan

Los HTML se arman con el generador y se exportan a imágenes:

```bash
node ../scripts/generar/carousel-generator.mjs      # genera el HTML del carrusel
node ../scripts/exportar/export-slides.mjs           # HTML → slide-01.jpg, slide-02.jpg, ...
```

## Reglas

- Precio del curso en los textos = **$27** (no $10).
- Revisar **legibilidad** antes de publicar (contraste, tamaño de texto): es un
  problema recurrente en placas de Facebook.
- El arco semanal y el calendario de publicación están en
  [ESTRATEGIA-ORGANICO.md](../docs/ESTRATEGIA-ORGANICO.md).
