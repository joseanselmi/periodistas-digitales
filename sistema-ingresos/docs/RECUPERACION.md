# Recuperación de carritos abandonados + pagos rechazados

Tarjeta Trello #34. Doc vivo — Jose no es técnico, acá va todo el contexto para
cualquier sesión futura.

## Qué es

Automatización que **recupera por WhatsApp** a los clientes potenciales que se guardan
solos en Supabase (tabla `clientes_potenciales` de `periodistas-marketing`, la llena el
webhook de Hotmart — ver [ARQUITECTURA-DATOS.md](../ads-agent/ARQUITECTURA-DATOS.md) y
tarjeta #25). Dos flujos según la columna `tipo`:

- `carrito_abandonado` → 2 WhatsApp para que vuelvan y compren.
- `pago_rechazado` → 2 WhatsApp avisando que el pago no se procesó + link a reintentar.

## Arquitectura (decisión base de la #34, revisada)

**Canal: WhatsApp** (lo pidió Jose — más cercano que el email). **Timing: el 1er mensaje
es instantáneo.**

- **1er mensaje = al instante, desde el webhook de Hotmart** (`api/hotmart.js` →
  `instantRecup`). Apenas Hotmart nos avisa el abandono/rechazo, sale el WhatsApp. Es lo
  más cerca posible del "momento exacto" (Hotmart decide cuándo nos notifica; nosotros
  reaccionamos al toque). Esta es la opción (b) que proponía la tarjeta.
- **Recordatorio (paso 2) = motor diario** (`api/recuperacion.js`) por Vercel Cron, 1
  vez/día (`0 15 * * *` = 12:00 ART). También es **red de seguridad**: si el envío
  instantáneo falló o la persona no tenía teléfono, el cron reintenta el paso 1.
- **Envío**: WhatsApp Cloud API (mismo token que el embudo de regalos), helper compartido
  `api/_lib/wa.js`. Se usa el mismo patrón probado de `wa-funnel.js`.

### Por qué WhatsApp obliga a plantillas aprobadas por Meta

Para escribirle **primero** a alguien que no nos escribió en las últimas 24 h, Meta exige
una **plantilla aprobada** — da igual que el texto sea fijo. No hay forma legal de
esquivarlo (automatizar un WhatsApp personal con apps no oficiales = baneo del número).
La aprobación es gratis, de una vez y rápida (minutos a pocas horas).

**Las 4 plantillas** (creadas y enviadas a aprobación el 2026-07-02, categoría MARKETING,
idioma `es`, una variable `{{1}}` = nombre + botón URL con `?src=`):

| Plantilla | Cuándo | Botón |
|---|---|---|
| `recup_abandono_1` | abandono, al instante | Retomar mi lugar |
| `recup_abandono_2` | abandono, día siguiente | Retomar mi lugar |
| `recup_rechazo_1` | rechazo, al instante | Reintentar mi pago |
| `recup_rechazo_2` | rechazo, día siguiente | Completar mi pago |

Los botones vuelven a la landing con `?src=recup-abandono` / `?src=recup-rechazo` → la
venta recuperada queda **atribuida** en la tabla `ventas`.

## Estado por persona (tabla `clientes_potenciales`)

- `estado_recuperacion`: `pendiente → contactado → recuperado | perdido`
- `paso_recuperacion`: `0/1/2` — cuántos WhatsApp se mandaron.
- `ultimo_contacto_en`: timestamp del último mensaje (gap mínimo de 12 h entre pasos).
- `recuperado_en`: cuándo se detectó la compra.

**Anti-acoso:** antes de cada envío se cruza el email con `ventas`; si ya compró →
`recuperado` y se corta la secuencia (esto además mide cuántos se recuperan). Máximo 1
mensaje por persona por corrida. Idempotencia del 1er envío: el webhook "reserva" el
envío con un PATCH condicional (`paso_recuperacion=0`), así un reintento de Hotmart no
duplica el mensaje.

## Cómo responde Jose desde el celu

Las respuestas del cliente llegan al **número de WhatsApp Business** (no al WhatsApp
personal de Jose). Se leen y contestan desde la app **Meta Business Suite** (bandeja de
WhatsApp) en el teléfono.

## Modos (para probar sin romper nada)

`GET /api/recuperacion?mode=<modo>&key=<CRON_SECRET>`

- `inspect` / `dry` — muestran el plan (a quién le toca y qué plantilla) **sin enviar**.
- `stats` — resumen del embudo.
- `report` — manda el reporte diario a Jose (por email, no WhatsApp).
- `live` — envía de verdad y actualiza la DB. **Requiere además `RECUP_ENABLED=1`.**
- El cron (sin `mode`) equivale a `live`, pero **si `RECUP_ENABLED != 1` se degrada a dry**.

## Interruptor de seguridad

Nada se envía (ni el instantáneo del webhook, ni el recordatorio del cron) hasta poner
**`RECUP_ENABLED=1`** en Vercel. Igual que el motor de WhatsApp con `WA_FUNNEL_ENABLED`.

## Variables de entorno (proyecto Vercel sistema-ingresos-landing)

Todas ya existen menos el interruptor:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — base de marketing.
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` — envío por WhatsApp (ya los usa wa-funnel).
- `BREVO_API_KEY` — solo el reporte interno a Jose.
- `CRON_SECRET` — auth del endpoint.
- `RECUP_ENABLED` — **falta**: setear en `1` para el go-live.

## Estado: ✅ LIVE (2026-07-02)

- ✅ Código: `api/_lib/wa.js`, envío instantáneo en `api/hotmart.js`, motor diario en
  `api/recuperacion.js`. Deployado a prod.
- ✅ Migración de columnas aplicada (`paso_recuperacion`, `ultimo_contacto_en`).
- ✅ Las 4 plantillas **APROBADAS por Meta**.
- ✅ **Prueba real** enviada al WhatsApp de Jose (+34 677239574, `recup_abandono_1`) →
  llegó bien, confirmado.
- ✅ **`RECUP_ENABLED=1`** seteado en Vercel + redeploy; `enabled:true` verificado.

Operativa: cada carrito/rechazo nuevo recibe el WhatsApp al instante; el recordatorio y el
backlog pendiente (Juan) los manda el cron de las 12:00 ART.

## Historial

- Se armó primero una versión por **email** (Brevo). Jose pidió cambiarlo a **WhatsApp**
  (más cercano) y que el 1er mensaje sea **instantáneo**. El motor, el estado, el
  anti-acoso, la atribución, el interruptor y el reporte se reusaron tal cual; solo cambió
  el canal de envío (Brevo → WhatsApp) y se movió el 1er toque al webhook. El texto de los
  emails sirvió de base para las plantillas.
