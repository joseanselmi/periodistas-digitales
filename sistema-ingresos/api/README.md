# api/ — Funciones serverless (Vercel)

Cada archivo `.js` de esta carpeta (menos `_lib/`) es un **endpoint** que Vercel
publica como `/api/<archivo>`. Son el backend propio del curso: procesan la
compra, trackean, recuperan carritos, corren el embudo de WhatsApp y vigilan la
salud de todo.

## Endpoints

| Endpoint | Qué hace |
|---|---|
| `hotmart.js` | **Webhook de compra de Hotmart.** Backend propio del curso: registra la venta, dispara el 1er mensaje de recuperación y otorga el bono de 1 mes de Leadr (llamando a la API interna de Leadr). Manda el evento Purchase a Meta por Conversions API con PII hasheada. |
| `hotmart-sync.js` | Dispara a mano el sync de Hotmart → Supabase (reconcilia ventas + captura rechazos). La lógica vive en `_lib/hotmart-sync.js`. |
| `event.js` | Ingesta de eventos de tracking (`events`). Lo llama el beacon `track.js` del navegador en cada pageview/clic de checkout. Público y best-effort (responde 204, nunca frena la navegación). |
| `lead.js` | Ingesta de leads de Facebook Lead Ads → tabla `leads`. Lo llama el escenario de Make (id 9474482) con un secreto compartido, para no meter la key de Supabase dentro de Make. Idempotente. |
| `recuperacion.js` | **Motor diario de recuperación** (carritos abandonados + pagos rechazados) por WhatsApp con fallback a email. Corre por Vercel Cron y, de paso, dispara los otros syncs del día (piggyback, porque Hobby solo permite 2 crons). |
| `wa-funnel.js` | Embudo de WhatsApp de la campaña "Guía Claude" (Regalos 3, 4 y Oferta). Corre 1 vez/día, calcula quién está en el día 5/7/9 y manda la plantilla que corresponde. |
| `wa-inbox.js` | **Puente WhatsApp → Telegram + asistente.** Recibe las respuestas de los clientes, el asistente decide qué contestar (`_lib/asistente.js`) y escala a Jose por Telegram cuando hace falta. |
| `salud.js` | **Panel de Salud:** un email diario que mira el estado real de cada flujo (Supabase + Brevo), lo interpreta (✅/🟡/🔴 + por qué) y lo resume. |
| `sync-estados.js` | Copia el estado de los agentes (`ads-agent/state/*.json`) a la tabla `agentes_estado` para que el Panel de Comando (nube) los pueda leer. |

Seguridad de los endpoints internos/cron: `CRON_SECRET`
(`Authorization: Bearer <secret>` o `?key=<secret>`).

## `_lib/`

Los helpers que estos endpoints comparten (Hotmart sync, WhatsApp, Telegram,
asistente, syncs de Meta) viven en [`_lib/`](_lib/README.md). Vercel **no** enruta
`_lib/` como funciones: se bundlean al requerirlas.

> Además de los endpoints versionados de arriba, pueden existir localmente otros
> más nuevos aún sin commitear (p. ej. `d.js` redirector de PDFs, `tg-webhook.js`
> puente Telegram→WhatsApp, `trello-diario.js` agenda del tablero). Cada uno lleva
> su propia cabecera explicando para qué es.
