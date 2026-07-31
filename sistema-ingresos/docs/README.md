# sistema-ingresos/docs — cómo funciona el sistema

**Padre:** [`sistema-ingresos/`](../README.md)

Documentación de la **máquina**: qué pasa cuando alguien compra, cómo se lo
sigue y cómo se lo recupera si no compró. Nada de contenido ni producción del
curso — eso está en [`../curso/docs/`](../curso/docs/README.md).

## Quien compra, o casi

- [`TRACKING.md`](TRACKING.md) — el tracking de punta a punta: Pixel, CAPI,
  atribución por `?src=`. **El documento de referencia.**
- [`POST-COMPRA.md`](POST-COMPRA.md) — qué se dispara cuando alguien compra.
- [`RECUPERACION.md`](RECUPERACION.md) — carritos abandonados y rechazos de tarjeta.
- [`TIME_TO_VALUE.md`](TIME_TO_VALUE.md) — qué recibe el comprador, y cuándo.

## Canales

- [`PLANTILLAS-WHATSAPP.md`](PLANTILLAS-WHATSAPP.md) — el cuerpo real de las
  plantillas aprobadas por Meta. Doc vivo.
- [`PUENTE-WHATSAPP-TELEGRAM.md`](PUENTE-WHATSAPP-TELEGRAM.md) — cómo Jose lee y
  responde WhatsApp desde Telegram.

## Medición

- [`ANALYTICS-GA4.md`](ANALYTICS-GA4.md) · [`ANALYTICS-CLARITY.md`](ANALYTICS-CLARITY.md)
- [`TRAZABILIDAD-VERSIONES.md`](TRAZABILIDAD-VERSIONES.md) — ningún cambio de
  checkout o landing sin versión, antes/después y veredicto.
- [`analisis-landing.md`](analisis-landing.md) — análisis puntual de la landing.
- [`AGENDA-TRELLO.md`](AGENDA-TRELLO.md) — la agenda diaria colgada del panel.

> Como `outputDirectory` de Vercel es `"."`, **todo lo que está acá se sirve por
> web**. Por eso [`../vercel.json`](../vercel.json) tiene un redirect que saca de
> circulación `/docs/*.md`.
