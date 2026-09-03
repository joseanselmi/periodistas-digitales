# muro-stories — TODAS las stories diarias de la fanpage

**Padre:** [`ads-agent/contenido/carousels/`](../README.md)

⚠️ **El nombre engaña.** Se llamó así porque la primera serie fue "el periodista
del muro" (agosto 2026), pero hoy esta carpeta es **la única fuente de stories de
la página**, venga la story de la serie que venga. Desde septiembre convive el
arco de IA. No es la carpeta de una serie: es la carpeta del cron.

## Por qué no se renombra

Porque la ruta está **escrita a mano** en el cron que las publica:

> `sistema-ingresos/api/_lib/story-diaria.js` → `const DIR = 'ads-agent/contenido/carousels/muro-stories'`

Renombrarla obliga a tocar ese archivo y a **deployar sistema-ingresos entero**.
Y si alguien mueve la carpeta y se olvida del deploy, el cron no falla: dice
*"no hay story para hoy"* y se queda callado, todos los días. Es más barato el
nombre feo que el modo de fallar mudo.

## Cómo funciona la publicación

Las stories de página **no se pueden programar**: la API de Facebook las publica
al instante y duran 24 h. Por eso hay un disparo diario.

1. El cron `/api/recuperacion` corre a las **15:00 UTC** y llama a `story-diaria.js`.
2. Busca `<YYYY-MM-DD>.jpg` de hoy **en GitHub raw**, rama `master`.
3. Si no existe, no es un error: hay días sin story a propósito.
4. Sube la foto sin publicar (`/photos?published=false`) y la convierte en story
   (`/photo_stories`).
5. Deja constancia en `events` (`tipo_evento='story_fb'`, `url=<fecha>`), que es lo
   que la hace idempotente: si el cron corre dos veces, no duplica.

### ⚠️ Un JPG que no está pusheado no existe

La imagen se lee de **raw.githubusercontent.com**, no del disco. Generar el JPG no
alcanza: hay que **commitear y pushear a `master`**.

Y de ahí sale el riesgo que conviene tener presente: **el día que el repo pase a
privado** (la decisión de la tarjeta #117), raw devuelve 404 y **las stories dejan
de salir sin un solo error**. Verificado el 03/09/2026: el repo sigue público y raw
responde 200.

## Cómo se generan

No se editan a mano. Salen del generador del mes, que las arma desde el texto
aprobado:

```bash
cd ads-agent
node scripts/generar/gen-septiembre-ia.mjs        # HTML verticales
node scripts/exportar/export-stories.mjs contenido/carousels/muro-stories   # → JPG 1080×1920
```

> `export-stories.mjs` re-exporta **todos** los HTML de la carpeta. Si sólo hiciste
> los de un mes, filtrá por prefijo de fecha o vas a tocar los JPG viejos y a
> ensuciar el diff con archivos idénticos en contenido.

Para disparar una a mano:

```bash
node --env-file=.env.local scripts/publicar/post-story.mjs --dry-run
node --env-file=.env.local scripts/publicar/post-story.mjs 2026-09-16
```

## Qué hay hoy

| Serie | Fechas | Estado |
|---|---|---|
| El periodista del muro | 16→31/08/2026 | publicadas 13 de 16 (faltaron el 17, 18 y 19) |
| IA aplicada al periodista de a pie | 04→30/09/2026 | 24 listas · sin el 10, 17 y 24 (los jueves quedaron sin escribir) |
