# organic/ — Posts orgánicos diarios (calendario)

Contenido orgánico armado por día, agrupado por semana (`YYYY-MM-DD/`). A
diferencia de [`carousels/`](../../carousels/) (que son piezas de varias placas),
acá viven los **posts sueltos** con su calendario, texto e imagen.

## Qué hay en cada semana

- `calendario.json` — el plan de la semana: qué se publica cada día y de qué tipo
  (educativo, inspiracional, prueba social, problema consciente, venta suave,
  mito/verdad, etc.).
- `dia-0N-<tipo>.md` — el texto/copy de ese día.
- `dia-0N-imagen.jpg` — la imagen que acompaña ese día.

## Cómo se genera

Lo produce el agente de orgánico (Luna):

```bash
node ../scripts/agentes/organic-agent.mjs
```

Las imágenes pasan por el revisor ([`../lib/image-reviewer.mjs`](../../lib/README.md))
antes de quedar aprobadas (sin texto encima, persona latinoamericana, score ≥ 7).

## Relación con el resto

- Estrategia y arco semanal: [ESTRATEGIA-ORGANICO.md](../../docs/ESTRATEGIA-ORGANICO.md).
- Carruseles (multi-placa): [`../carousels/`](../../carousels/).
- Precio del curso en los textos = **$27**.
