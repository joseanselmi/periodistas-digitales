# Periodistas Digitales — contexto para Claude Code

Este repo contiene dos proyectos principales:

- `sistema-ingresos/` — landing (y, a futuro, backend) del curso "Sistema de
  Ingresos Diarios". Pago único en Hotmart, deploy propio en Vercel (proyecto
  `sistema-ingresos-landing`, dominio `sistemadeingresosdiariosia.com`).
- `ads-agent/` — agentes de marketing (Meta Ads, email, contenido orgánico, etc.)

> **Leadr se separó de este repo el 2026-06-27.** Antes vivía en `leadr/app/`.
> Ahora es un repositorio independiente (`https://github.com/joseanselmi/leadr`)
> en la carpeta hermana `../Leadr`, con su propio deploy en Vercel
> (`www.leadr.cloud`). **No traer código de Leadr de vuelta a este repo.** La
> única integración entre el curso y Leadr (el mes gratis de Pro que se regala
> con la compra) se resuelve por una API interna de Leadr, no por código
> compartido. Si una tarea es de la plataforma Leadr, se trabaja en `../Leadr`,
> no acá.

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
- Cada agente (Ricardo, Dante, Valentina, Mateo, Sofía, Luna, Max, Director,
  Bruno, Nicolás, Valeria, Miguel, Clara) tiene su propia **label** en el
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
`ads-agent/trello-task.mjs` (usa la misma API REST de Trello directamente):

```bash
cd ads-agent
node trello-task.mjs crear <Agente> "<título>" --list "Por hacer" [--desc "..."]
node trello-task.mjs listar <Agente>
node trello-task.mjs mover <cardId> "<lista>"
```

Detalle completo en [ads-agent/README.md](ads-agent/README.md).
