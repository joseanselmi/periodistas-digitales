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
Chequea las **siete** cosas que se rompen en silencio:

1. **Rutas en texto** — links markdown y rutas escritas en docs, código y HTML.
   Valida tanto archivos como **carpetas**: una ruta de carpeta que quedó vieja
   no da error en ningún lado.
2. **Anclajes de `ads-agent/scripts/`** — imports relativos y rutas ancladas al
   archivo. Atrapa el peor caso: un script que corre sin dar error pero perdió su
   `.env.local` y no hace nada.
3. **URLs públicas** — resuelve como Vercel (redirects → rewrites → estático) las
   URLs que el sistema realmente emite: las páginas del QA y los PDF que entregan
   `/api/d`, el embudo de WhatsApp y los emails.
4. **Contrato con Vercel** — que cada función declarada y cada cron apunten a un
   archivo que existe.
5. **Pipelines de `.claude/`** — que los comandos citen scripts que existen. Un
   comando que pide un archivo borrado no falla: el modelo improvisa.
6. **Equipo de agentes** — que `cerebro/`, `state/` y la lista de respaldo de la
   función que corre en la nube digan lo mismo.
7. **Nada suelto** — que toda carpeta con contenido propio tenga su `README.md`.

**No ejecuta ningún script**: varios publican anuncios o mandan mails. Sale con
código 1 si encuentra algo roto, así que sirve tal cual en un hook o en CI.

## Los seis primeros preguntan una cosa; el séptimo, la contraria

Del 1 al 6: *"lo que está nombrado, ¿existe?"*. El 7: *"lo que existe, ¿está
explicado?"*.

Esa segunda pregunta se agregó el 2026-08-01 porque faltaba, y la falta costaba.
Una carpeta puede estar ahí, no romper nada, no aparecer en ningún control y aun
así ser un problema: `ads-agent/emails/` la creaba un script sin que nadie la
nombrara, y `.agents/skills/` tenía dos capacidades que **en ese lugar ni se
cargaban**. Ninguno de los seis controles anteriores podía verlas.

El chequeo 7 solo mira carpetas con contenido de texto propio. Las de assets
—los JPG de un carrusel, un anuncio con su `ficha.md`— las explica su README
padre; pedirles uno a cada una sería ruido, y **un control ruidoso se empieza a
ignorar**, que es peor que no tenerlo. Las excepciones están escritas con su
motivo en `SIN_README_A_PROPOSITO`.

Nació de la reorganización del 2026-07-30 ([#93](https://trello.com/c/D0Y45QnX))
con tres chequeos. Los otros cuatro se sumaron cada vez que algo se rompió sin
avisar — el 1 y el 7 atajaron, entre los dos, la historia diaria de Facebook y el
registro de envíos de email.

## Por qué no están en la raíz

Regla del repo: nada suelto — cada cosa en su carpeta, con su README que dice de
quién cuelga. En la raíz quedan solo los archivos que **tienen** que estar ahí:
`README.md`, `CLAUDE.md`, `ESTADO.md` (generado), `.gitignore`, `.mcp.json` y
`skills-lock.json`.
