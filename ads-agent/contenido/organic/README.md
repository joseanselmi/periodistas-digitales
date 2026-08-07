# organic — posts sueltos por día

**Padre:** [`ads-agent/contenido/`](../README.md)

Posts de un solo texto y una sola imagen, agrupados por semana en carpetas
`YYYY-MM-DD/`. Se diferencian de [`../carousels/`](../carousels/README.md), que
son piezas de varias placas.

## ⚠️ Este sistema está dormido

**Existe una sola semana: `2026-05-09/`**, y es de mayo. Desde entonces todo el
orgánico se hace con carruseles y con las historias diarias del muro. La carpeta
se conserva porque los siete textos siguen sirviendo de referencia de tono, no
porque el flujo esté andando.

Si se retoma, conviene revisar antes qué público le toca: desde el 16/08 la serie
del muro va en registro neutro, distinto al de estos posts. Ver
[ESTRATEGIA-ORGANICO.md](../../docs/ESTRATEGIA-ORGANICO.md) y
[ORGANICO-MURO.md](../../docs/ORGANICO-MURO.md).

## Qué hay en cada semana

| Archivo | Qué es |
|---|---|
| `calendario.json` | El plan: qué se publica cada día y de qué tipo (educativo, inspiracional, prueba social, problema consciente, venta suave, mito/verdad) |
| `dia-0N-<tipo>.md` | El texto de ese día |
| `dia-0N-imagen.jpg` | La imagen que lo acompaña |

## Quién lo produce

**Valentina** (`/valentina`), que es la de contenido orgánico de Facebook.

```bash
cd ads-agent
node scripts/agentes/organic-agent.mjs
```

> Este README decía que lo producía **Luna**. Luna es CRO/landing y no toca
> orgánico. También citaba un `lib/image-reviewer.mjs` que no existe: el revisor
> real es [`../../lib/reviewer.mjs`](../../lib/README.md). Corregido el
> 2026-08-01.

El precio del curso en cualquier texto de acá es **$27**.
