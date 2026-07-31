# Recuperación de carritos abandonados + pagos rechazados

Tarjeta Trello #34. Doc vivo — Jose no es técnico, acá va todo el contexto para
cualquier sesión futura.

## Qué es

Automatización que **recupera por WhatsApp** a los clientes potenciales que se guardan
solos en Supabase (tabla `clientes_potenciales` de `periodistas-marketing`, la llena el
webhook de Hotmart — ver [ARQUITECTURA-DATOS.md](../../ads-agent/docs/ARQUITECTURA-DATOS.md) y
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

Los botones/enlaces van **directo al checkout de Hotmart** (`pay.hotmart.com/P106404871J`)
con `?src=recup-abandono` / `?src=recup-rechazo` → quien ya abandonó/rechazó vuelve derecho
a pagar (no a la landing), y el `?src=` deja la venta recuperada **atribuida** en `ventas`.
El **email** de fallback ya apunta al checkout. ⚠️ Las **plantillas de WhatsApp** aprobadas
tienen su URL de botón fija; si todavía apuntan a la landing hay que re-enviarlas a
aprobación de Meta para alinearlas al checkout (tarea pendiente aparte).

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

Las respuestas del cliente llegan al bot de Telegram **@Periodistasdigitalesbot** (puente
WhatsApp↔Telegram, LIVE 2026-07-03). Jose las lee ahí y contesta **deslizando el mensaje →
"Responder"**; la respuesta sale por WhatsApp. Gratis dentro de la ventana de 24 h. Detalle
completo en [PUENTE-WHATSAPP-TELEGRAM.md](PUENTE-WHATSAPP-TELEGRAM.md).

> ❌ **NO** se usa la bandeja de Meta Business Suite: el número está en la Cloud API y esa
> bandeja exige el número en la *app* WhatsApp Business (incompatible). Por eso el puente.

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

## ⚠️ Hueco de captura: rechazos de tarjeta (tarjeta #36) — solución vía API

**Diagnóstico (2026-07-03, verificado contra la doc de Hotmart):** el webhook **nunca** va
a traer un rechazo de tarjeta. No es que falte habilitar un evento — es que **no existe**.
Los estados del webhook de Hotmart son `approved, canceled, billet_printed, refunded,
dispute, completed, blocked, chargeback, delayed, expired`: **ninguno es "tarjeta
rechazada/declined"**. Cuando una tarjeta se rechaza en el momento, la persona sigue en el
checkout (puede reintentar), así que Hotmart no crea un "purchase" que notificar. El informe
**Motivos de rechazo de la tarjeta** (`app.hotmart.com/reports/cancellation/reason`) es
**solo un panel** exportable a CSV/XLS — sin webhook ni API documentada de ese informe.
Evidencia: al 2026-07-02 `clientes_potenciales` no tenía **ningún** `pago_rechazado` real
pese a haber rechazos en el panel (el único cargado, Nelson, fue a mano).

**Solución (la vía que SÍ funciona):** la **Sales History API** de Hotmart (la misma que ya
usa `ads-agent/scripts/datos/hotmart-sync.mjs` para las ventas) **sí devuelve** las transacciones
rechazadas, con estados `NO_FUNDS` (sin fondos), `BLOCKED` (banco/antifraude), `CANCELLED`,
`EXPIRED`, `OVERDUE`. El sync ahora, además de las ventas, **captura esos rechazos** (de los
últimos N días, default 3) y los inserta en `clientes_potenciales` como `pago_rechazado` →
el cron diario de este motor los agarra y les manda `recup_rechazo_1` solo. El 1er mensaje
no es instantáneo como en el webhook (es batch, hasta ~1 día de demora), pero entra solo.

**Estado (2026-07-03):** ✅ código escrito (`scripts/datos/hotmart-sync.mjs`, funciones `fetchRechazos` /
`mapToPotencial` / `syncRechazos`) y sintaxis validada. 🔴 **BLOQUEADO** en lo mismo que el
backfill de ventas: la credencial de la API de Hotmart da **403** (`unauthorized_client`,
sin scope de Ventas/Reportes). En cuanto Jose habilite ese permiso, se destraban las dos
cosas. Detalle en [ads-agent/docs/ARQUITECTURA-DATOS.md](../../ads-agent/docs/ARQUITECTURA-DATOS.md).
Para que "entren solos" a diario falta además dejar el sync de cron (ver esa doc).

**Matiz importante (del CSV real de Nelson, 03/07):** los rechazos de tarjeta figuran en
Hotmart con **Estatus = "Cancelado"** (son transacciones reales: HP0978768683, etc.). Como el
02/07 activamos el evento **"Compra cancelada"** (`PURCHASE_CANCELED` → `pago_rechazado` en
`classifyPotencial`) y los de Nelson son del **30/06** (previos a activarlo), no entraron. →
Queda una **duda abierta, posiblemente favorable**: puede que los rechazos **nuevos** (del
02/07 en adelante) **ya entren solos por el webhook** como "Compra cancelada". **Prueba
pendiente:** cuando haya un rechazo real nuevo, ver si aparece solo en `clientes_potenciales`.
Si aparece, el hueco ya está cerrado por el webhook para el caso "Cancelado" y no hace falta
ni CSV ni API. Si no aparece, se usa el puente CSV (abajo) o la API.

### Puente manual por CSV (disponible ya, sin la API)

Mientras la API sigue bloqueada, los rechazos se cargan desde el **CSV** que Hotmart deja
exportar del panel (Mis análisis → Ventas perdidas → **Motivos de rechazo de la tarjeta** →
Exportar CSV). Importador: **`ads-agent/scripts/datos/hotmart-rechazos-csv.mjs`** (probado 2026-07-03).

- Jose exporta el CSV y pasa la ruta. Claude corre `node scripts/datos/hotmart-rechazos-csv.mjs <archivo>`
  → muestra el mapeo de columnas detectado + resumen (cuántas filas, a cuántas se les
  mandará WhatsApp, rango de fechas). Se revisa con Jose ANTES de insertar.
- Con el OK, Claude corre `--json` e inserta en `clientes_potenciales` vía el MCP de Supabase
  (`jsonb_to_recordset` + `ON CONFLICT (dedup_key) DO NOTHING` → nunca duplica; no necesita
  la service_role key). `evento_hotmart='CSV_MOTIVOS_RECHAZO'`, `dedup_key=hotmart:<tx>`
  (mismo esquema que la API → si después llega por API no se duplica).
- Una vez insertados, el **cron de recuperación** les manda `recup_rechazo_1` en su próxima
  corrida. ⚠️ Ojo: mete a TODOS los del CSV con teléfono, sin filtro de antigüedad → exportar
  solo rechazos recientes, o pedir un recorte por fecha. Anti-acoso ya saltea a quien compró.

## Historial

- **2026-07-02 — primeros envíos reales (forzados a mano):** el motor estaba LIVE pero no
  había mandado ningún mensaje real todavía. Se contactó a los 2 clientes potenciales
  cargados disparando `GET /api/recuperacion?mode=live`:
  - **Juan Aguilera** (carrito abandonado, entró 12:53 UTC, antes de encender el sistema →
    se había saltado el cron): recibió `recup_abandono_1`.
  - **Nelson Vásquez** (3 rechazos de tarjeta el 30/06 — pre-sistema; se **cargó a mano** a
    `clientes_potenciales` como `pago_rechazado`, dedup_key `manual:pago_rechazado:...`):
    recibió `recup_rechazo_1`.
  Ambos quedaron `contactado`/paso 1; el paso 2 lo manda el cron. Ver hueco de captura arriba.
- Se armó primero una versión por **email** (Brevo). Jose pidió cambiarlo a **WhatsApp**
  (más cercano) y que el 1er mensaje sea **instantáneo**. El motor, el estado, el
  anti-acoso, la atribución, el interruptor y el reporte se reusaron tal cual; solo cambió
  el canal de envío (Brevo → WhatsApp) y se movió el 1er toque al webhook. El texto de los
  emails sirvió de base para las plantillas.
