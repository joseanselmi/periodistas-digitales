# sistema-ingresos/guias — los lead magnets

**Padre:** [`campanas/guia-claude-periodistas/`](../../../README.md)

Las guías que se regalan para capturar el email. De cada una hay tres cosas: el
`.html` (la fuente que se edita), el `.pdf` (lo que descarga el lector) y una
carpeta `qa-<guía>/` con una captura de cada página, que genera el linter.

- `guia-5-pilares-ingresos-periodico-digital`
- `guia-agentes-ia-periodistas`
- `guia-claude-periodistas`
- `guia-completa-50-prompts`
- `guia-periodico-digital-ig-fb`

## ⚠️ La URL pública NO es esta carpeta

Se sirven desde la **raíz del dominio** (`/guia-claude-periodistas.pdf`), no
desde `/guias/...`. Esos links ya salieron por email y WhatsApp, y `/api/d`
redirige a `/<archivo>.pdf`. Lo sostienen los `rewrites` de
[`../vercel.json`](../../../vercel.json).

**Guía nueva = sumar su par de rewrites** (`.pdf` y `.html`) ahí, o su URL de la
raíz da 404. `node herramientas/verificar-repo.mjs` lo chequea.

## Cómo se produce

```bash
cd ads-agent
node scripts/exportar/lint-pdf-guide.mjs ../sistema-ingresos/guias/<guía>.html
```

El lint exporta el PDF, saca las capturas y revisa márgenes, tono y que las
imágenes existan. **Ninguna guía se muestra ni se publica con el lint en rojo.**
