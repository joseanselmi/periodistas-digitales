# lib/ — Módulos compartidos

Código reutilizable que importan los scripts de `ads-agent/`. No se corre solo:
son piezas que usan `scripts/agentes/review.mjs`, `scripts/agentes/organic-agent.mjs`, `scripts/publicar/publish.mjs`, etc.

| Archivo | Qué hace |
|---|---|
| `brand-context.mjs` | La identidad de marca en un solo lugar: producto, **precio ($27)**, valor percibido, URLs (landing + checkout Hotmart), audiencia (periodistas LatAm 30-55, español latino con "tú"), política de Meta. Fuente de verdad para todos los agentes. |
| `brand-palette.mjs` | La paleta oficial de color (`#07070f` + indigo `#6366f1` + cyan `#22d3ee`). La misma de la web y Leadr. Se usa en carruseles/placas. |
| `reviewer.mjs` | Revisión de un anuncio (imagen + copy) con Claude Vision: puntúa y sugiere mejoras según la marca. |
| `image-reviewer.mjs` | Revisor universal de imágenes generadas: rechaza texto encima, valida persona latinoamericana, exige score ≥ 7, reintenta. Lo usan organic-agent, publish, etc. |

> generación de imágenes migró a ChatGPT (manual, web). fal.ai/higgsfield ya no
> se usan como flujo por defecto — ver la memoria del proyecto antes de rutear
> generación automática de imágenes.

También puede existir `trello.mjs` (cliente del tablero por agente) — ver el
[README de ads-agent](../README.md).
