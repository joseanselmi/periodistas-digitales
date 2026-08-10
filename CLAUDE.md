# Periodistas Digitales — contexto para Claude Code

Este repo contiene dos proyectos principales:

- `sistema-ingresos/` — landing (y, a futuro, backend) del curso "Sistema de
  Ingresos Diarios". Pago único en Hotmart, deploy propio en Vercel (proyecto
  `sistema-ingresos-landing`, dominio `sistemadeingresosdiariosia.com`).
- `ads-agent/` — agentes de marketing (Meta Ads, email, contenido orgánico, etc.)

## ⛔ WhatsApp NO manda nada automático — todo lo automático va por EMAIL (09/08/2026)

**Ninguna campaña, embudo, recordatorio ni recuperación sale por WhatsApp.** No está
"apagado por un flag": el código de envío se borró. No existe `WA_SEND_FORCE`, no hay
plantillas de Meta que disparar, no hay una rama que reactivar.

- **Lo que SÍ sigue vivo y no se toca:** RECIBIR los mensajes de la gente y contestarlos
  **a mano** desde Telegram — [`api/wa-inbox.js`](sistema-ingresos/api/wa-inbox.js) y
  [`api/tg-webhook.js`](sistema-ingresos/api/tg-webhook.js). Jose los usa todos los días.
  Recibir ≠ enviar: la distinción es toda la regla.
- **Por qué se fue:** no es un problema de código y no se arregla desde acá. El número está
  capado en Meta — la verificación del negocio no pasó (error 141010) y el nombre para
  mostrar quedó `DECLINED`. Estado y pasos en la tarjeta **#89**.
- **⚠️ Los nombres con prefijo `WA_` son historia, no canal.** `api/wa-funnel.js` es el
  embudo de EMAIL; `WA_SENT_AT` y `WA_STAGE` los escriben los envíos por email. Se
  conservan porque renombrarlos rompería la ruta del cron, los paneles que la consultan y
  ~900 contactos ya escritos en Brevo. **Ver un `WA_` no significa que algo mande WhatsApp.**

Antes de proponer "reactivemos WhatsApp para este envío": no. Si Jose lo pide, primero se
destraba Meta (#89) y recién después se reescribe el envío, que no está en ningún lado más
que en el historial de git.

### Dónde vive cada cosa (reorganizado el 2026-07-30)

- `ads-agent/scripts/<grupo>/` — todos los ejecutables, agrupados por función:
  `datos/` (fetch y syncs) · `agentes/` (analizan y deciden) · `generar/` ·
  `programar/` · `publicar/` (⚠️ salen al mundo) · `exportar/` · `curso/` ·
  `utiles/`. **Se corren parados en `ads-agent/`**, no dentro de `scripts/`:
  varios buscan `.env.local` o `state/` relativos a esa carpeta.
  Ej: `cd ads-agent && node scripts/datos/fetch-meta.mjs`.
- `ads-agent/docs/` y `sistema-ingresos/docs/` — la documentación. En la raíz de
  cada proyecto solo quedan `README.md` y lo que tiene que estar ahí sí o sí.
- **Las guías-regalo van dentro de su campaña**, nunca en una carpeta suelta:
  `sistema-ingresos/campanas/<campaña>/guias/` (`.html` + `.pdf`).
  - Se entregan **siempre** por `/api/d?file=<archivo>.pdf&src=<origen>`, que es
    lo único que cuenta la descarga. Un link directo al `.pdf` no deja rastro.
  - Las 5 guías de `guia-claude-periodistas` conservan además un rewrite directo
    (`/guia-x.pdf`) porque esos links salieron por email y WhatsApp antes de que
    existiera `/api/d`. **Es una excepción histórica, no el modelo a copiar.**
  - Guía nueva = su `/api/d`, y nada más.

## 📋 Un FLUJO DE MAILS no es una CAMPAÑA DE META (estándar desde el 10/08/2026)

**No van una a una, y confundirlas es el error a evitar.** Una campaña de Meta puede no mandar
ni un mail (`interaccion` no captura nada; `venta-curso` va directo al checkout). Y un flujo de
mails puede no tener anuncio detrás (la recuperación de carritos arranca con una compra fallida).

- **Campaña de Meta** → anuncios, presupuesto, creativos. Vive en
  `ads-agent/campanas/<x>/brief.md`. Su brief declara **una sola cosa** sobre mails: si captura
  emails y, si sí, qué flujo alimenta.
- **Flujo de mails** → [`sistema-ingresos/docs/FLUJOS.md`](sistema-ingresos/docs/FLUJOS.md), el
  inventario único. **Antes de tocar cualquier envío, leerlo.** Manda sobre las tablas
  `funnels`/`funnel_steps` de Supabase, que son el mapa dibujado a mano del panel y describen la
  intención, no lo que pasa.

Cada flujo contesta **seis preguntas**: ¿quiénes? · ¿día 0? · ¿qué piezas y cuándo? · ¿quién
NO? · ¿tope y condiciones? · **¿qué motor la ejecuta?** — la última es la que más atrapa: si no
hay motor, la campaña entrega su regalo y ahí termina.

Chequeado por `node herramientas/verificar-repo.mjs`: toda campaña de **captación**
(`sistema-ingresos/campanas/`) tiene su ficha, y todo motor que la ficha nombra existe.

**Por qué existe todo esto.** Escribir el inventario destapó dos huecos de semanas:
`republicadores` capturaba leads y no les mandaba nada después de la guía (196 personas, con el
anuncio activo y gastando), y el post-compra no existía. Ninguno se veía leyendo el código: cada
pieza funcionaba y devolvía 200. Lo que faltaba era el paso siguiente, que **no estaba en ningún
lado y por eso no fallaba**.

## 🚀 Deploy — SIEMPRE con `herramientas/deploy.mjs`, nunca `vercel --prod` a mano

```bash
node herramientas/deploy.mjs sistema-ingresos     # el curso
node herramientas/deploy.mjs leadr                # la plataforma
node herramientas/deploy.mjs sistema-ingresos --dry
```

**Por qué.** `vercel --prod` sube el DIRECTORIO tal como está, no el commit. Con
varias sesiones de Claude trabajando sobre el mismo repo a la vez, publicar
arrastra el trabajo a medio escribir de otra. Ya pasó dos veces el 09/08/2026: un
cambio grande llegó a producción sin estar commiteado (el código que corría
existía solo en el disco de Jose), y hubo que frenar otro deploy porque
`api/hotmart.js` estaba siendo editado en ese momento.

El script crea una copia limpia del último commit en una carpeta temporal, deploya
desde ahí y la borra. **Lo que no está commiteado, no se publica** — deja de
depender de que alguien mire `git status`. Avisa qué quedó sin commitear, deploya
igual sin eso, y verifica el dominio real (no el alias que imprime el CLI).

**Después de mover, renombrar o borrar archivos — y antes de deployar:**

```bash
node herramientas/verificar-repo.mjs
```

Chequea las **ocho** cosas que se rompen en silencio:

1. los links y rutas escritos en docs y código;
2. los anclajes de ruta de `ads-agent/scripts/` — un script puede correr sin
   error y no hacer nada si perdió su `.env.local`;
3. que toda URL pública en uso siga resolviendo contra `vercel.json`;
4. que los crons declarados existan como función;
5. que los pipelines de `.claude/` apunten a scripts que existen;
6. que el equipo de agentes sea coherente entre cerebro, state y comandos;
7. que toda carpeta con contenido tenga su README;
8. que toda campaña de CAPTACIÓN tenga su ficha en `sistema-ingresos/docs/FLUJOS.md`,
   y que los motores que esa ficha nombra existan
   (ver la sección de la ficha de flujo más arriba).

No ejecuta ningún script — varios publican anuncios o mandan mails.

> **Leadr se separó de este repo el 2026-06-27.** Antes vivía en `leadr/app/`.
> Ahora es un repositorio independiente (`https://github.com/joseanselmi/leadr`)
> en la carpeta hermana `../Leadr`, con su propio deploy en Vercel
> (`www.leadr.cloud`). **No traer código de Leadr de vuelta a este repo.** La
> única integración entre el curso y Leadr (el mes gratis de Pro que se regala
> con la compra) se resuelve por una API interna de Leadr, no por código
> compartido. Si una tarea es de la plataforma Leadr, se trabaja en `../Leadr`,
> no acá.

## ⚡ Antes de contestar cualquier pregunta de estado — `node herramientas/estado.mjs`

Jose pregunta cosas como "¿cómo va el envío de mails?", "¿cómo venimos con X?".
El estado real NO está en el repo: vive en Trello (qué falta), Supabase (ventas,
entrega de WhatsApp), Brevo (envíos y aperturas) y el endpoint del embudo (qué
cola hay). Reconstruirlo a mano cada sesión es lento y termina en preguntas cuya
respuesta ya estaba decidida en una tarjeta. Para eso está:

```bash
node herramientas/estado.mjs            # trae todo en vivo y reescribe ESTADO.md (~40 s)
node herramientas/estado.mjs --rapido   # sin la cola del embudo (el paso lento)
```

Reglas:

1. **Antes de responder sobre el estado de algo, correr `estado.mjs` y leer
   [ESTADO.md](ESTADO.md).** Si el encabezado de ESTADO.md ya dice hoy, alcanza
   con leerlo. Nunca contestar de memoria ni con un export viejo.
2. **Antes de preguntarle algo a Jose, buscarlo en la sección de Trello de
   ESTADO.md** — está el checklist abierto de cada tarjeta, que es donde viven
   las decisiones ya tomadas. Preguntar algo que ya estaba decidido le hace
   perder el día.
3. Si una sección aparece como "no disponible" por falta de
   `SUPABASE_SERVICE_ROLE_KEY` (Vercel no deja bajarla), consultar esos datos con
   el **MCP de Supabase**, proyecto `periodistas-marketing`
   (`wxyimqkjlwfncvzozpjy`) — no dar el hueco por cero.
4. ESTADO.md se **regenera**, no se edita a mano. Lo que hay que recordar entre
   sesiones va a la tarjeta de Trello o al `.md` del proyecto.

## Integración con Trello

Hay un **servidor MCP de Trello** configurado en `.mcp.json` (raíz del repo,
paquete `@delorenj/mcp-server-trello`, vía `npx`). Si está activo en la sesión
aparecen herramientas nativas `mcp__trello__*` (`add_card_to_list`,
`move_card`, `get_my_cards`, `assign_member_to_card`, `get_board_labels`,
etc.) — **usalas directamente, no asumas que falta integración.**

- Tablero por defecto: "Roadmap Periodistas Digitales"
  (board id `6a35bf86f4bbebc72953200f`, workspace `periodistasdigitales`,
  https://trello.com/b/Bgt6wooU/roadmap-periodistas-digitales)
- Columnas: Backlog → Por hacer → En progreso → Bloqueada → En revisión → Hecho
- Cada agente (Ricardo, Dante, Valentina, Sofía, Luna, Director,
  Bruno, Miguel, Clara) tiene su propia **label** en el
  tablero — así se le "asigna" una tarjeta (Trello free no permite agregar
  nueve miembros reales sin invitarlos por email).
- Quedaron labels huérfanas de **Mateo, Max, Nicolás y Valeria**, agentes dados
  de baja el 2026-08-01. No se usan más. El detalle de por qué se fueron está en
  [ads-agent/cerebro/README.md](ads-agent/cerebro/README.md).

**Reglas obligatorias de gestión del tablero — leer
[ads-agent/cerebro/trello-manager.md](ads-agent/cerebro/trello-manager.md)
antes de crear o tocar cualquier tarjeta.** Resumen: toda tarjeta activa
necesita un checklist con pasos concretos (no solo descripción libre),
tildar los ítems a medida que se completan (no todos juntos al final), y
verificar contra el estado real (API, código) antes de declarar algo
hecho o bloqueado — no confiar en lo que la tarjeta ya dice si se puede
chequear directamente. Estas reglas se aplican siempre, automáticamente
(este archivo se carga en cada sesión) — también existe el skill
`/trello-manager` para invocar gestión explícita del tablero.

Si las herramientas `mcp__trello__*` no aparecen en la sesión (el `.mcp.json`
recién se cargó y todavía no fue aprobado/reiniciado), hay un **fallback**
funcional sin depender del MCP: `ads-agent/lib/trello.mjs` y la CLI
`ads-agent/scripts/utiles/trello-task.mjs` (usa la misma API REST de Trello directamente):

```bash
cd ads-agent
node scripts/utiles/trello-task.mjs crear <Agente> "<título>" --list "Por hacer" [--desc "..."]
node scripts/utiles/trello-task.mjs listar <Agente>
node scripts/utiles/trello-task.mjs mover <cardId> "<lista>"
```

Detalle completo en [ads-agent/README.md](ads-agent/README.md).
