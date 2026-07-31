# cerebro — quién es cada agente y cómo decide

**Padre:** [`ads-agent/`](../README.md)

Un `.md` por agente: su rol, su criterio y sus reglas. Es lo que define **cómo
piensa** cuando se lo invoca.

| Cerebro | Rol real | Se invoca | Estado |
|---|---|---|---|
| `ricardo.md` | CMO — prioriza y decide qué se hace primero | `/ricardo` | ✅ |
| `mateo.md` | Media Buyer (Meta Ads) | `/mateo` | ✅ |
| `dante.md` | Analytics — datos y benchmarks | `/dante` | ✅ |
| `sofia.md` | Email Marketing | `/sofia` | ✅ |
| `valentina.md` | Contenido Orgánico de Facebook | `/valentina` | ✅ |
| `luna.md` | CRO / Landing | `/luna` | ✅ |
| `director.md` | Director Académico (curriculum Leadr) | `/director-universidad` | ✅ |
| `bruno.md` | Senior Data Analyst · Equipo IT | `/bruno` | ✅ |
| `nicolas.md` | Senior Backend · Equipo IT | `/nicolas` | ✅ |
| `valeria.md` | Senior Frontend · Equipo IT | `/valeria` | ✅ |
| `max.md` | QA / Performance · Equipo IT | `/max` | ✅ |
| `miguel.md` | Gestor de Comunidad / WhatsApp | ⚠️ **sin comando** | ver abajo |
| `trello-manager.md` | No es una persona: son las **reglas** del tablero | `/trello-manager` | ✅ |

Routers: `/equipo` detecta la intención y activa a quien corresponda; `/it`
coordina a Bruno, Nicolás, Valeria y Max.

> Este listado se corrigió el 2026-08-01. El anterior contradecía a los propios
> cerebros: daba a Dante como "contenido y copy" (es Analytics), a Valentina como
> "diseño e imágenes" (es Orgánico), a Luna como "redes" (es CRO) y a Max como
> "analítica" (es QA). Y listaba un `clara.md` que nunca existió.

## Los dos casos raros

**Miguel** tiene cerebro y estado —con una tarea pendiente y todo— pero **no
tiene comando**, así que no hay forma de activarlo. O se le crea `/miguel`, o se
decide que su trabajo lo absorbe otro.

**Clara** no tiene cerebro, y **está bien**: no es una persona a la que se le
habla sino una **automatización**. Su `state` lo dice — `"frecuencia": "diaria"`
y el comando que la corre. Vive en
[`../scripts/agentes/clara.mjs`](../scripts/agentes/README.md) y baja noticias
para Leadr. Los agentes-script no llevan cerebro ni slash command.

## Las tres capas de un agente

No están en la misma carpeta, y hay un motivo para cada una:

| Capa | Dónde | Por qué ahí |
|---|---|---|
| **Cómo se lo invoca** | `.claude/commands/<agente>.md` | Convención de Claude Code: los slash commands se leen de ahí. No se puede mover |
| **Cómo piensa** | `ads-agent/cerebro/<agente>.md` | Acá |
| **Qué hizo** | [`../state/<agente>-state.json`](../state/README.md) | Lo lee el Panel de Comando **desde GitHub**, por ruta fija |

Ese último punto es el que hay que respetar: `sistema-ingresos/api/_lib/sync-estados.js`
corre en la nube, no puede clonar el repo, y baja los `*-state.json` de
`ads-agent/state` por la API de GitHub. **Mover esa carpeta rompe el panel diario
en silencio.** Además esa función tiene una lista fija de respaldo que debe
incluir a todos los agentes; `node herramientas/verificar-repo.mjs` chequea que
no se desincronice.

> No confundir con `.claude/agents/`, que son otra cosa: **subagentes** que se
> lanzan desde un flujo (`revisor-clase-video`, `alumno-periodista`), no miembros
> del equipo. Ni con `.agents/skills/`, que son capacidades reutilizables.

## Editar un agente

Cambiar su `.md` cambia su comportamiento. Respetar el tono y las reglas de marca:
curso a US$ 27, y **nunca mezclar el curso con Leadr** — son dos productos y dos
repos distintos.
