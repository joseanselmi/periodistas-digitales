# herramientas — los dos comandos del repo

**Padre:** la raíz del repo · [`README.md`](../README.md) · [`CLAUDE.md`](../CLAUDE.md)

Scripts que operan sobre **el repo entero**, no sobre un proyecto en particular
(por eso no viven ni en `ads-agent/` ni en `sistema-ingresos/`). Se corren
parados en la raíz.

## `estado.mjs` — qué está pasando en el negocio

```bash
node herramientas/estado.mjs            # trae todo en vivo y reescribe ESTADO.md (~40 s)
node herramientas/estado.mjs --rapido   # sin la cola del embudo (el paso lento)
```

El estado real **no está en el repo**: vive en Trello (qué falta), Supabase
(ventas, entrega de WhatsApp), Brevo (envíos y aperturas) y el endpoint del
embudo (qué cola hay). Esto lo junta todo y escribe [`../ESTADO.md`](../ESTADO.md).

Es **solo lectura**: no manda un mensaje, no toca Trello, no cambia flags. Si
una fuente falla, esa sección queda marcada "no disponible" con el motivo — nunca
inventa un número ni deja el anterior como si fuera fresco.

> `ESTADO.md` se **regenera**, no se edita a mano. Lo que hay que recordar entre
> sesiones va a la tarjeta de Trello o al `.md` del proyecto.

## `verificar-repo.mjs` — que nada quedó apuntando a un lugar que ya no existe

```bash
node herramientas/verificar-repo.mjs
```

Correrlo **después de mover, renombrar o borrar archivos, y antes de deployar.**
Chequea las tres cosas que se rompen en silencio:

1. **Rutas en texto** — links markdown y rutas desde la raíz escritas en docs,
   código y HTML.
2. **Anclajes de `ads-agent/scripts/`** — imports relativos y rutas ancladas al
   archivo. Atrapa el peor caso: un script que corre sin dar error pero perdió su
   `.env.local` y no hace nada.
3. **URLs públicas** — resuelve como Vercel (redirects → rewrites → estático) las
   URLs que el sistema realmente emite: las páginas del QA y los PDF que entregan
   `/api/d`, el embudo de WhatsApp y los emails.

**No ejecuta ningún script**: varios publican anuncios o mandan mails. Sale con
código 1 si encuentra algo roto, así que sirve tal cual en un hook o en CI.

Nació de la reorganización del 2026-07-30 ([#93](https://trello.com/c/D0Y45QnX));
los tres chequeos son los que ahí atajaron roturas reales.

## Por qué no están en la raíz

Regla del repo: nada suelto — cada cosa en su carpeta, con su README que dice de
quién cuelga. En la raíz quedan solo los archivos que **tienen** que estar ahí:
`README.md`, `CLAUDE.md`, `ESTADO.md` (generado), `.gitignore`, `.mcp.json` y
`skills-lock.json`.
