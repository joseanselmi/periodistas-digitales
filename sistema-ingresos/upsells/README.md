# upsells — lo que se ofrece DESPUÉS de la compra

**Padre:** [`sistema-ingresos/`](../README.md)

Ofertas de un solo clic (OTO) que ve quien **ya pagó** el curso, en la página de
espera anterior a la de gracias. Una carpeta por upsell.

| Carpeta | Oferta | Precio |
|---|---|---|
| [`periodico-digital/`](periodico-digital/README.md) | Periódico Digital + Redacción IA | US$ 37 (ancla US$ 520) |

## No confundir con los order bumps

| | Cuándo aparece | Dónde |
|---|---|---|
| **Order bump** ([`../order-bumps/`](../order-bumps/README.md)) | **Antes** de pagar, como casilla en el checkout | Hotmart |
| **Upsell** (esto) | **Después** de pagar, en una página propia | Nuestro sitio |

## Ojo con las URLs

A diferencia del curso y los order bumps, **las páginas de upsell sí se
publican**: el comprador tiene que poder verlas. La URL a la que Hotmart manda
después del pago está configurada **en el panel de Hotmart**, no en el código —
por eso no se puede cambiar desde acá sin tocar allá.

Cuando esta carpeta se reorganizó (2026-07-31) la ruta real cambió, así que
[`../vercel.json`](../vercel.json) mantiene viva la URL vieja
(`/upsell-periodico/espera.html`) con un rewrite. **Upsell nuevo = su carpeta acá
y su rewrite ahí.**

## Cuidado con el tracking

La conversión de la compra original **ya se disparó** en
[`../paginas/gracias.html`](../paginas/gracias.html). Un upsell no puede volver a dispararla o
las compras se cuentan dos veces en Meta. El detalle está en
[`../docs/POST-COMPRA.md`](../docs/POST-COMPRA.md).
