# guia-claude-periodistas — lo público de la campaña de leads

**Padre:** [`campanas/`](../README.md) · **Abuelo:** [`sistema-ingresos/`](../../README.md)

La campaña que en Meta se llama **`LEADGEN | Guía Claude Periodistas | $1d | 2026-06`**
(objetivo Leads). Capturó **890 leads**; hoy está **pausada**, pero su embudo de
email sigue corriendo solo con la gente que ya entró.

Acá vive solo [`guias/`](guias/README.md): los 5 imanes que se regalan, en orden
del embudo.

| # | Guía | Cuándo se manda |
|---|---|---|
| 1 | `guia-claude-periodistas` | Al suscribirse (es el imán del anuncio) |
| 2 | `guia-completa-50-prompts` | Regalo 2 |
| 3 | `guia-periodico-digital-ig-fb` | Regalo 3 · día 5 |
| 4 | `guia-5-pilares-ingresos-periodico-digital` | Regalo 4 · día 7 |
| 5 | `guia-agentes-ia-periodistas` | Regalo 5 · día 8 |

Después del regalo 5 va la oferta (día 9) y su reenvío a los que no abrieron.

> **En los regalos 1 a 4 nunca se menciona el precio.** Se revela recién en la
> oferta.

## Las URLs no son estas rutas

Cada guía se sirve desde la **raíz del dominio** (`/guia-claude-periodistas.pdf`),
no desde `/campanas/...`. Esos links ya salieron por email y WhatsApp y no se
pueden cambiar. Lo sostienen los `rewrites` de
[`../../vercel.json`](../../vercel.json).

Y los PDF se enlazan **siempre** por el redirector `/api/d?file=<archivo>.pdf&src=<origen>`:
un `.pdf` servido directo no deja ningún rastro y perdemos el dato de aperturas.

## La estrategia no está acá

Esta carpeta es solo lo que Vercel tiene que publicar. El copy, el racional del
embudo y las fichas de los anuncios van del lado de los agentes — ver la
convención en [`ads-agent/campanas/README.md`](../../../ads-agent/campanas/README.md).

> Nombre pendiente de revisión: la campaña está nombrada **por su imán**, que es
> el defecto que la convención busca evitar (el regalo cambia, la persona no).
> Se conserva porque es el nombre que tiene en Meta.
