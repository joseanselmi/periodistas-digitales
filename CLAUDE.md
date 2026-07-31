# Periodistas Digitales — contexto para Claude Code

Este repo contiene dos proyectos principales:

- `sistema-ingresos/` — landing (y, a futuro, backend) del curso "Sistema de
  Ingresos Diarios". Pago único en Hotmart, deploy propio en Vercel (proyecto
  `sistema-ingresos-landing`, dominio `sistemadeingresosdiariosia.com`).
- `ads-agent/` — agentes de marketing (Meta Ads, email, contenido orgánico, etc.)

### Dónde vive cada cosa (reorganizado el 2026-07-30)

- `ads-agent/scripts/<grupo>/` — todos los ejecutables, agrupados por función:
  `datos/` (fetch y syncs) · `agentes/` (analizan y deciden) · `generar/` ·
  `programar/` · `publicar/` (⚠️ salen al mundo) · `exportar/` · `curso/` ·
  `utiles/`. **Se corren parados en `ads-agent/`**, no dentro de `scripts/`:
  varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
  carpeta. Ej: `cd ads-agent && node scripts/datos/fetch-meta.mjs`.
- `ads-agent/docs/` y `sistema-ingresos/docs/` — la documentación. En la raíz de
  cada proyecto solo quedan `README.md` y lo que tiene que estar ahí sí o sí.
- `sistema-ingresos/guias/` — las guías-regalo (`.html` + `.pdf`). **Su URL
  pública sigue siendo la de la raíz** (`/guia-x.pdf`), sostenida por los
  `rewrites` de `sistema-ingresos/vercel.json`: esos links ya salieron por email
  y WhatsApp. Guía nueva = sumar su par de rewrites ahí.

**Después de mover, renombrar o borrar archivos — y antes de deployar:**

```bash
node herramientas/verificar-repo.mjs
```

Chequea las tres cosas que se rompen en silencio: los links y rutas escritos en
docs/código, los anclajes de ruta de `ads-agent/scripts/` (un script puede correr
sin error y no hacer nada si perdió su `.env.local`), y que toda URL pública en
uso siga resolviendo contra `vercel.json`. No ejecuta ningún script — varios
publican anuncios o mandan mails.

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
  13 miembros reales sin invitarlos por email).

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
