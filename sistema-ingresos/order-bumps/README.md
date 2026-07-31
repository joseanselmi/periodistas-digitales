# order-bumps — lo que se agrega EN el checkout

**Padre:** [`sistema-ingresos/`](../README.md)

Los extras que aparecen como casilla en el checkout de Hotmart, **antes** de que
la persona pague. Una carpeta por bump.

| Carpeta | Qué es | Estado |
|---|---|---|
| `hashtags-iman-truco-viral/` | Guía "El truco del hashtag imán" | ✅ Hecho |

De cada uno hay lo mismo que de una guía-regalo: el `.html` (la fuente que se
edita), el `.pdf` (lo que recibe el comprador) y una carpeta `qa-<nombre>/` con
una captura de cada página, que genera el linter.

## Cómo se entrega

**Por Hotmart, no por nuestro sitio.** El PDF se sube al panel de Hotmart y se
adjunta al bump; nadie lo baja desde `sistemadeingresosdiariosia.com`.

Por eso [`../vercel.json`](../vercel.json) tiene un redirect que manda
`/order-bumps/*` a la home: es un entregable pago y no tiene por qué quedar
descargable gratis para quien pruebe la URL.

> Esto vivía en `_material/order-bumps/`, que está gitignorado — o sea que un
> producto que se cobra no estaba versionado. Se trajo al repo el 2026-07-31.

## Cómo se produce

```bash
cd ads-agent
node scripts/exportar/lint-pdf-guide.mjs ../sistema-ingresos/order-bumps/<bump>/<bump>.html
```

El lint exporta el PDF, saca las capturas y revisa márgenes, tono y que las
imágenes existan. **Nada se publica con el lint en rojo.**

No confundir con [`../upsells/`](../upsells/README.md), que es la oferta de
**después** de pagar.
