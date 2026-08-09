# api/_lib/ — Helpers compartidos (no son endpoints)

Código que usan las funciones de [`../`](../README.md) pero que **no** es un
endpoint. Vercel no enruta esta carpeta como funciones: cada archivo se bundlea
cuando un endpoint lo requiere. Se separan acá para no exponerlos como URLs y
para reusarlos entre varios endpoints.

| Archivo | Qué hace |
|---|---|
| `hotmart-sync.js` | Sync Hotmart → Supabase: reconcilia TODAS las ventas (curso + upsells + cross-sell que quizá no pasa por el webhook) y captura pagos rechazados como `clientes_potenciales`. Versión serverless de `ads-agent/scripts/datos/hotmart-sync.mjs`. |
| `meta-gasto-total-por-anuncio.js` | Gasto **acumulado** de cada anuncio (toda su vida, un número por anuncio) → tabla `campanas`, agregado por `src`; además el gasto de la cuenta por mes → `gastos_meta_mensual` (P&L). |
| `meta-embudo-diario-por-anuncio.js` | El **embudo** de cada anuncio **día por día** (gasto, clics, pagos iniciados, compras) → `meta_insights_diario`. Solo los que tienen matrícula `adN-angulo`. |
| `meta-gasto-diario-toda-la-cuenta.js` | Gasto **día por día de la cuenta entera**, tenga ficha o no → `meta_gasto_diario`. Es lo que muestra el panel de campañas de Leadr. |
| `sync-estados.js` | Sync del **estado de los agentes** (`ads-agent/state/*.json` del GitHub público) → tabla `agentes_estado`, para que el Panel de Comando en la nube los lea. |
| `wa.js` | Helper de WhatsApp Cloud API **sólo para RECIBIR y contestar a mano**: `sendText` / `sendButtons` (respuestas dentro de la ventana de 24 h) y los logs del hilo. ⛔ Ya no manda nada automático — el envío de plantillas se borró el 09/08/2026. Lo usan `wa-inbox.js` y el puente de Telegram. |
| `recup-email.js` | El mail de recuperación de carrito (abandono y pago rechazado). Copy único, compartido por el webhook de Hotmart (1er mensaje, al instante) y el cron diario (recordatorio). Reemplazó a las plantillas de WhatsApp. |
| `candado.js` | Un solo dueño por vez para las corridas que mandan mails: fila con token y vencimiento en `ops_flags`. La corrida que llega segunda no manda nada. |
| `baja.js` | El link de baja firmado del pie de cada mail y las cabeceras List-Unsubscribe. Se atiende desde `d.js` (no hay función propia: `api/` está en el tope de 12 de Vercel Hobby). |
| `asistente.js` | **Cerebro del asistente de WhatsApp:** decide qué responder según de dónde viene la persona (comprador / carrito / rechazo / lead / nuevo). Todo el texto que ve el cliente está arriba del archivo, a propósito, para editarlo sin tocar la lógica. |

> Los tres `meta-*` son los **gemelos en la nube** de los `.mjs` de
> `ads-agent/scripts/datos/`, con el mismo nombre a los dos lados. Se llamaban
> `meta-spend-sync.js`, `meta-daily-sync.js` y `meta-gasto-sync.js` hasta el
> 07/08/2026: "spend" y "gasto" son la misma palabra en dos idiomas y estaban en
> la misma carpeta haciendo cosas distintas. Cuál usar y por qué se renombraron:
> [ads-agent/scripts/datos/README.md](../../../ads-agent/scripts/datos/README.md).
>
> Pueden existir localmente otros helpers aún sin commitear (p. ej. `tg.js`
> Telegram + buzón por temas, `versiones-sync.js` métricas de checkout/landing).
> Cada uno lleva su cabecera.

Detalle de toda la tubería de datos:
[ads-agent/docs/ARQUITECTURA-DATOS.md](../../../ads-agent/docs/ARQUITECTURA-DATOS.md).
