# cerebro/ — Los "cerebros" de cada agente

Un archivo `.md` por agente del equipo de marketing. Cada uno es el **prompt de
sistema / personalidad** de ese agente: quién es, qué rol cumple, cómo decide y
qué reglas sigue. Es lo que define su criterio cuando se lo invoca (por su skill
`/nombre` o cuando un script lo usa).

| Archivo | Agente | Rol |
|---|---|---|
| `ricardo.md` | Ricardo | Estratega / dirección de marketing |
| `dante.md` | Dante | Contenido y copy |
| `valentina.md` | Valentina | Diseño e imágenes |
| `mateo.md` | Mateo | Media buyer (Meta Ads) |
| `sofia.md` | Sofía | Email marketing |
| `luna.md` | Luna | Orgánico / redes |
| `max.md` | Max | Analítica / datos |
| `director.md` | Director | Director académico (curriculum Leadr) |
| `nicolas.md` | Nicolás | — |
| `valeria.md` | Valeria | — |

> También pueden existir localmente `bruno.md`, `miguel.md`, `clara.md` y
> `trello-manager.md` (reglas de gestión del tablero). El listado de arriba es el
> que está versionado.

## Cómo se relaciona con el resto

- El **estado** de cada agente (qué hizo, cuándo) NO va acá: vive en
  [`../state/`](../state/) como `<agente>-state.json`.
- La forma de invocarlos como skills está en el equipo: skill `/equipo` (router)
  o `/<nombre>` directo.
- Reglas de Trello por agente: ver [`trello-manager`](trello-manager.md) si
  existe, o [ARQUITECTURA-DATOS.md](../ARQUITECTURA-DATOS.md) / el
  [README de ads-agent](../README.md).

## Editar un agente

Cambiar su `.md` cambia su comportamiento. Mantener el tono y las reglas de marca
(precio del curso = $27, español latino con "tú", nada de mezclar con Leadr).
