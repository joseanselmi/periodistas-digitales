# El truco del hashtag imán

**Padre:** [`sistema-ingresos/order-bumps/`](../README.md)

La guía que se ofrece con una casilla **antes de pagar** el curso. El comprador
la marca en el checkout de Hotmart y la recibe junto con el curso.

| Archivo | Qué es |
|---|---|
| `hashtags-iman-truco-viral.pdf` | Lo que recibe el comprador |
| `hashtags-iman-truco-viral.html` | La fuente editable. Se exporta con `ads-agent/scripts/exportar/export-pdf.mjs` |
| `logo-periodistas-digitales.png` | El logo, copiado acá para poder exportar el PDF sin depender de otra carpeta |
| `qa-hashtags-iman-truco-viral/` | Las capturas de cada página que deja el lint al revisar la guía. Se regeneran solas |

## Cómo se entrega

**Por Hotmart, nunca por el sitio.** Toda la carpeta `/order-bumps/` está
bloqueada en `vercel.json`: cualquier dirección bajo esa ruta rebota a la
portada. Es contenido que se cobra.

## Si se edita

Se toca el `.html` y se vuelve a exportar — nunca el `.pdf` a mano. El lint
([`pdf-guide-linter`](../../../.claude/skills/pdf-guide-linter/SKILL.md)) corre
solo después y mide que todas las páginas tengan el mismo alto, que el logo esté
y que no se haya colado un "vos": esta guía va en **tuteo neutro**, distinto al
curso.

> Acá había un `hashtags-iman-truco-viral - version final.pdf` **idéntico byte a
> byte** al otro, con espacios en el nombre. Se borró el 2026-08-01. Si aparece
> otro "version final", es que alguien exportó sin pisar el original: el nombre
> del PDF no lleva versión, la versión la guarda git.
