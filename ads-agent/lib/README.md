# lib — lo que comparten todos los scripts

**Padre:** [`ads-agent/`](../README.md)

Piezas que importan los scripts. **Ninguna se corre sola.** La idea es que cada
cosa tenga un solo dueño: si el precio, el trato o la forma de leer las claves
estuvieran copiados en cada script, alcanzaría con olvidarse de uno para que el
sistema empiece a decir dos cosas distintas.

| Archivo | Qué hace |
|---|---|
| `env.mjs` | **De dónde salen las claves.** Lee `.env.local` y `.env`, y corta con un mensaje claro si falta alguna que el script necesita |
| `brand-context.mjs` | **La identidad de marca.** Producto, precio (**$27**), valor percibido, URLs, público (periodistas de LatAm, 30-55) y política de Meta |
| `reviewer.mjs` | Revisa un anuncio —imagen y texto— con Claude Vision: le pone nota y sugiere mejoras según la marca |
| `trello.mjs` | El cliente del tablero. Es el más usado de los cuatro, y el fallback cuando el MCP de Trello no está: `crear`, `listar`, `mover`, `completar` |

## Dos cosas que se corrigieron acá el 2026-08-01

**El trato es voseo.** Esta tabla decía *"español latino con «tú»"* y era falso:
los guiones publicados del curso usan voseo 387 veces y "tú" ninguna, y la
landing 15 contra cero. `brand-context.mjs` decía lo mismo en un comentario y
`reviewer.mjs` se lo pedía a Claude en cada revisión de anuncio.

**`trello.mjs` no es hipotético.** Acá decía *"también puede existir"*. Existe, y
`CLAUDE.md` depende de él: es el camino que queda cuando las herramientas
`mcp__trello__*` no cargan en la sesión.

## Las imágenes no se generan por código

Se hacen a mano en ChatGPT — ver [`../docs/CHATGPT-IMAGENES.md`](../docs/CHATGPT-IMAGENES.md).
Los proveedores por API (fal.ai, higgsfield) se dieron de baja el 2026-08-01 y su
código se eliminó. Si algún script vuelve a nombrarlos, está viejo.
