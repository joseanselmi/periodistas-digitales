# cerebro — quién es cada agente y cómo decide

**Padre:** [`ads-agent/`](../README.md)

Un `.md` por agente: su rol, su criterio y sus reglas. Es lo que define **cómo
piensa** cuando se lo invoca.

**Esta tabla es la lista completa.** Si un agente no está acá, no existe —
aunque otro documento lo nombre.

| Cerebro | Rol real | Se invoca | Estado |
|---|---|---|---|
| `ricardo.md` | CMO — prioriza y decide qué se hace primero | `/ricardo` | ✅ |
| `dante.md` | Analytics — datos y benchmarks | `/dante` | ✅ |
| `sofia.md` | Email Marketing | `/sofia` | ✅ |
| `valentina.md` | Contenido Orgánico de Facebook | `/valentina` | ✅ |
| `luna.md` | CRO / Landing | `/luna` | ✅ |
| `bruno.md` | Senior Data Analyst | `/bruno` | ✅ |
| `director.md` | Director Académico (curriculum Leadr) | `/director-universidad` | ✅ |
| `miguel.md` | Gestor de Comunidad / WhatsApp | ⚠️ **sin comando** | ver abajo |
| `trello-manager.md` | No es una persona: son las **reglas** del tablero | `/trello-manager` | ✅ |

Router: `/equipo` detecta la intención y activa a quien corresponda.

## Los que se eliminaron (2026-08-01)

Están acá para que nadie los busque ni los reviva por error:

| Se fue | Por qué | Quién hace ahora ese trabajo |
|---|---|---|
| **Mateo** (Media Buyer) | Produjo 27 recomendaciones diarias, **las 27 sin leer**, y su alarma de "checkout roto" era un falso positivo (comparaba el pixel de Meta contra nuestra tabla de ventas — dos universos distintos). Jose audita sus campañas él mismo | Jose, a mano |
| **Nicolás** (Backend) · **Valeria** (Frontend) · **Max** (QA) | Los tres auditaban código de Leadr, que **ya no vive en este repo**. Nunca se los invocaba | La skill [`revisar-codigo-leadr`](../../.claude/skills/revisar-codigo-leadr/SKILL.md), con las tres lentes y los hallazgos abiertos que dejaron |

Con ellos se fue el router `/it`, que solo servía para repartirles trabajo.

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
> del equipo. Ni con `.claude/skills/`, que son capacidades reutilizables.

## Editar un agente

Cambiar su `.md` cambia su comportamiento. Respetar el tono y las reglas de marca:
curso a US$ 27, y **nunca mezclar el curso con Leadr** — son dos productos y dos
repos distintos.
