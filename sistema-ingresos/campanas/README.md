# Campañas — solo lo público

Acá vive **únicamente lo que Vercel tiene que publicar** de cada campaña: la
landing y las guías. Nada más.

```
<segmento>/
  landing/   ← la página a la que llega el anuncio
  guias/     ← el imán: la fuente .html y el .pdf que descarga el lector
```

Esto está de este lado por una razón concreta: **Vercel publica todo lo que está
bajo `sistema-ingresos/`**. Si el PDF viviera del lado de los agentes, el botón
de descarga del formulario de Meta no tendría de dónde bajarlo.

La estrategia, el copy y las fichas de los anuncios **no van acá**: son internos
y no tienen por qué estar en el árbol que se deploya.

| Qué | Dónde |
|---|---|
| Estrategia, copy, embudo | [`ads-agent/campanas/<segmento>/`](../../ads-agent/campanas/README.md) |
| Fichas de anuncios | `ads-agent/ads-curso/<matrícula>/` |
| Landing y guías (esto) | `sistema-ingresos/campanas/<segmento>/` |

> Hasta el 2026-07-30 esta carpeta guardaba todo junto. Se separó al aplicar la
> convención acordada ese día (ver el README de `ads-agent/campanas/`): lo
> interno describe a la persona en nuestros términos, lo público le habla a ella.

## Las URLs

Estos archivos **no se sirven por su ruta real** sino por una URL limpia, para
que el lector nunca vea la estructura interna ni la palabra "republicadores".
Se define en los `rewrites` de [`vercel.json`](../vercel.json):

| Lo que ve el lector | Lo que sirve Vercel |
|---|---|
| `/tu-medio` | `/campanas/republicadores/landing/tu-medio.html` |
| `/que-te-lean-miles.pdf` | `/campanas/republicadores/guias/que-te-lean-miles.pdf` |

Y hay redirects que mandan a la home cualquier intento de entrar por la ruta
real (`/campanas/...`).

**Campaña o guía nueva = sumar su rewrite.** Sin eso el archivo igual se sirve,
pero con la ruta interna a la vista. `node herramientas/verificar-repo.mjs` lo chequea.

## Campañas

**La carpeta lleva el nombre que la campaña tiene en Meta**, para poder cruzarla
de un vistazo con el Administrador de Anuncios.

| Carpeta | Nombre en Meta | A quién le habla | Estado |
|---|---|---|---|
| [`republicadores/`](republicadores/) | `CURSO Periodistas — LEADS — republicadores` | El periodista que republica en su perfil noticias de otros | 🟢 Activa — [#106](https://trello.com/c/vFd9rZQ3) |
| [`guia-claude-periodistas/`](guia-claude-periodistas/README.md) | `LEADGEN \| Guía Claude Periodistas \| $1d \| 2026-06` | (nombrada por el imán, no por la persona) | ⏸️ Pausada · 890 leads, el embudo de email sigue |

> El embudo de republicadores también se llamó **"el periodista del muro"**. Ganó
> `republicadores`, que es como está en Meta (2026-07-31).
