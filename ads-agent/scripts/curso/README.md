# scripts/curso — transcripciones del curso de Hotmart

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Bajan y transcriben el curso de Luis Mena (la fuente de método para copy, VSL y
oferta). La salida va a `../../hotmart-transcripts/`.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
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

`hotmart-transcripts/` está en `.gitignore` desde el 2026-08-01. Son
transcripciones **literales de un curso pago de un tercero** (Luis Mena) más
capturas de la sesión de Hotmart, y este repositorio es **público**.

Siguen en el disco de Jose y los scripts las usan igual. Pero **en un clon nuevo
no van a estar**: si hacen falta, hay que volver a correr el scraper.

Lo que sí se versiona es lo destilado: el método está en
[`../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md`](../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md),
que es análisis propio, no el material ajeno.
