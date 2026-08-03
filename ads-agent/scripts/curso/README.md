# scripts/curso — transcripciones del curso de Hotmart

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Bajan y transcriben el curso de Luis Mena (la fuente de método para copy, VSL y
oferta). La salida va a `../../../_material/luis-mena/` — fuera del repo.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/curso/transcribir-curso.mjs`

- `compilar-memoria.mjs`
- `importar-transcripciones.mjs`
- `transcribe_helper.py`
- `transcribir-curso.mjs`

`transcribe_helper.py` (faster-whisper) **tiene que quedar en esta carpeta**:
`transcribir-curso.mjs` lo busca al lado suyo.

El audio descargado ya no se conserva —eran ~800 MB de intermedios y está
gitignorado—; lo que queda son las transcripciones `.txt`/`.md`. Si hiciera
falta re-transcribir, hay que volver a bajarlo.

## ⚠️ Las transcripciones son locales, no viajan con el repo

El material vive en **`_material/luis-mena/`**, que está en `.gitignore` desde el
2026-08-01. Son transcripciones **literales de un curso pago de un tercero**
(Luis Mena) más capturas de la sesión de Hotmart, y este repositorio es
**público**.

Antes estaba en `ads-agent/hotmart-transcripts/`; se movió y se sacó de git el
2026-08-01 por ese motivo legal. Si algún documento todavía nombra la ruta
vieja, está desactualizado.

Sigue en el disco de Jose y los scripts lo usan igual. Pero **en un clon nuevo
no va a estar**: si hace falta, hay que volver a correr el scraper.

Lo que sí se versiona es lo destilado: el método está en
[`../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md`](../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md),
que es análisis propio, no el material ajeno.
