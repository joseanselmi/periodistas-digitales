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
