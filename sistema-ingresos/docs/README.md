# sistema-ingresos/docs — cómo funciona el sistema

**Padre:** [`sistema-ingresos/`](../README.md)

Documentación de la **máquina**: qué pasa cuando alguien compra, cómo se lo
sigue y cómo se lo recupera si no compró. Nada de contenido ni producción del
curso — eso está en [`../curso/docs/`](../curso/docs/README.md).

## Quien compra, o casi

- [`TRACKING.md`](TRACKING.md) — el tracking de punta a punta: Pixel, CAPI,
  atribución por `?src=`. **El documento de referencia.**
- [`NOMENCLATURA-SRC.md`](NOMENCLATURA-SRC.md) — **cómo se escribe un `src`**: los niveles,
  qué va en `sck`, y los límites de Hotmart (30 caracteres, sin guion bajo).
- [`POST-COMPRA.md`](POST-COMPRA.md) — qué se dispara cuando alguien compra.
- [`RECUPERACION.md`](RECUPERACION.md) — carritos abandonados y rechazos de tarjeta.
- [`TIME_TO_VALUE.md`](TIME_TO_VALUE.md) — qué recibe el comprador, y cuándo.

## Canales

- ⭐ [`FLUJOS.md`](FLUJOS.md) — **el inventario: una ficha por campaña.** Qué mails
  automáticos existen, a quién le llegan, quién los manda y qué los frena. **Empezar por
  acá** antes de tocar cualquier envío. Manda sobre las tablas `funnels`/`funnel_steps`
  de Supabase, que describen la intención y pueden estar desactualizadas.
- ⛔ [`PLANTILLAS-WHATSAPP.md`](PLANTILLAS-WHATSAPP.md) — **ARCHIVO HISTÓRICO, no está en
  uso.** Desde el 09/08/2026 nada sale por WhatsApp. Se conserva el cuerpo real de las
  plantillas aprobadas por Meta, por si algún día se reconstruye el canal.
- ✅ [`PUENTE-WHATSAPP-TELEGRAM.md`](PUENTE-WHATSAPP-TELEGRAM.md) — cómo Jose lee y
  responde WhatsApp desde Telegram. **Lo único de WhatsApp que sigue vivo**: recibir y
  contestar a mano. Recibir ≠ enviar.

## Medición

- [`ANALYTICS-GA4.md`](ANALYTICS-GA4.md) · [`ANALYTICS-CLARITY.md`](ANALYTICS-CLARITY.md)
- [`TRAZABILIDAD-VERSIONES.md`](TRAZABILIDAD-VERSIONES.md) — ningún cambio de
  checkout o landing sin versión, antes/después y veredicto.
- [`analisis-landing.md`](analisis-landing.md) — análisis puntual de la landing.
- [`AGENDA-TRELLO.md`](AGENDA-TRELLO.md) — la agenda diaria colgada del panel.

> Como `outputDirectory` de Vercel es `"."`, **todo lo que está acá se sirve por
> web**. Por eso [`../vercel.json`](../vercel.json) tiene un redirect que saca de
> circulación `/docs/*.md`.
