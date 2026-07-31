# api/_lib/ — Helpers compartidos (no son endpoints)

Código que usan las funciones de [`../`](../README.md) pero que **no** es un
endpoint. Vercel no enruta esta carpeta como funciones: cada archivo se bundlea
cuando un endpoint lo requiere. Se separan acá para no exponerlos como URLs y
para reusarlos entre varios endpoints.

| Archivo | Qué hace |
|---|---|
| `hotmart-sync.js` | Sync Hotmart → Supabase: reconcilia TODAS las ventas (curso + upsells + cross-sell que quizá no pasa por el webhook) y captura pagos rechazados como `clientes_potenciales`. Versión serverless de `ads-agent/scripts/datos/hotmart-sync.mjs`. |
| `meta-spend-sync.js` | Sync del **gasto** de Meta Ads → tabla `campanas` (agregado por `src`). |
| `sync-estados.js` | Sync del **estado de los agentes** (`ads-agent/state/*.json` del GitHub público) → tabla `agentes_estado`, para que el Panel de Comando en la nube los lea. |
| `wa.js` | Helper de WhatsApp Cloud API: manda las plantillas aprobadas de recuperación (`recup_abandono_1/2`, `recup_rechazo_1/2`). Lo usan el webhook (1er mensaje) y el motor diario (recordatorio). |
| `asistente.js` | **Cerebro del asistente de WhatsApp:** decide qué responder según de dónde viene la persona (comprador / carrito / rechazo / lead / nuevo). Todo el texto que ve el cliente está arriba del archivo, a propósito, para editarlo sin tocar la lógica. |

> Pueden existir localmente otros helpers aún sin commitear (p. ej.
> `meta-daily-sync.js` métricas por día, `tg.js` Telegram + buzón por temas,
> `versiones-sync.js` métricas de checkout/landing). Cada uno lleva su cabecera.

Detalle de toda la tubería de datos:
[ads-agent/docs/ARQUITECTURA-DATOS.md](../../../ads-agent/docs/ARQUITECTURA-DATOS.md).
