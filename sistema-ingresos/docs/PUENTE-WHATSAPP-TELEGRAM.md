# Puente WhatsApp ↔ Telegram

Doc vivo. Jose no es técnico — acá va todo el contexto para cualquier sesión futura.
**Estado: ✅ LIVE y probado (2026-07-03).**

## Qué es y para qué

Deja a Jose **leer y responder las respuestas de los clientes de WhatsApp desde Telegram**,
al instante y gratis. Cuando un cliente escribe al número del curso, le llega al bot de
Telegram; Jose contesta ahí y la respuesta sale por WhatsApp.

## Por qué NO se usa la bandeja de Meta Business Suite

El número del curso (**+34 614 79 62 00**, WABA `3355115811326692`) está conectado a la
**WhatsApp Cloud API** — así se mandan los mensajes automáticos (recuperación de carritos,
embudo de regalos). Un número en la Cloud API **no puede** estar también en la *app* WhatsApp
Business, y la bandeja de Meta Business Suite exige justamente eso (lo bloquea). Además, antes
de este puente **no había nada recibiendo los mensajes entrantes** (`subscribed_apps` estaba
vacío) → las respuestas de los clientes se perdían. El puente cierra ese hueco.

## Cómo responde Jose (operativa diaria)

1. El cliente escribe al WhatsApp del curso.
2. Le llega al bot **@Periodistasdigitalesbot** en Telegram con una **ficha de contexto**
   arriba (quién es, de qué embudo viene, qué le mandamos último) y abajo su mensaje.
3. Jose **desliza ese mensaje → "Responder" → escribe** la respuesta.
4. La respuesta sale por WhatsApp al cliente. El bot confirma con `✅ Enviado a +<número>`.

> **No depende de la PC de Jose.** Todo corre en la nube (Vercel). Jose puede tener la
> compu apagada; responde desde el celular por Telegram. Es 24/7 y automático.

## Ficha de contexto (por qué te escribe y de qué flujo viene)

Antes el mensaje llegaba "pelado" (nombre + número + texto) y no se sabía quién era ni
por qué escribía. Ahora, antes de reenviar, `wa-inbox.js` cruza el número con la base de
marketing y arma una ficha. Ejemplo real:

```
📩 Jorge Coco Godínez (+59172452994)

🔵 LEAD — embudo Guía Claude (Facebook) · 📰 es periodista
🎁 Último que le mandamos: el Regalo 3 — guía del periódico digital (WhatsApp) · hace 1 día
🗓️ Se registró hace 6 días · jorgeagodinezq@gmail.com
👤 En WhatsApp aparece como: Reportero Policial JAGQ

💬 No me llegó nada...

↩️ Deslizá este mensaje y tocá "Responder" para contestarle.
```

La ficha identifica a la persona por prioridad: **🟢 ya compró** (customers) · **🟡 casi
compra / carrito** o **🟠 pago rechazado** (clientes_potenciales) · **🔵 lead** (leads) ·
**🆕 contacto nuevo** (no está en la base). Cómo se arma:

- **Cruce por teléfono:** RPC de Postgres `contexto_contacto(p_phone)` en la base de
  marketing, que matchea por los **últimos 8 dígitos** del número (así no importa el
  prefijo/país ni el bug del "9" argentino) y devuelve `{compra, potencial, lead}`.
- **Qué regalo se mandó (solo leads):** se consulta **Brevo** por email (atributos
  `WA_STAGE` + `MAIL5_AT`). Si Brevo no responde, se estima por los días desde que se
  registró (día 5 = Regalo 3, día 7 = Regalo 4, día 8 = Regalo 5 email, día 9 = Oferta).
- **Best-effort:** todo con timeout. Si la base o Brevo fallan o tardan, el mensaje se
  reenvía igual **sin** ficha — nunca frena ni pierde un mensaje entrante.

Env vars que usa (ya existían en el proyecto): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`BREVO_API_KEY`.

**Gratis:** el texto libre es gratis dentro de la **ventana de 24 h** de atención al cliente.
Como Jose solo responde a quien le escribió, siempre cae en esa ventana. Fuera de 24 h Meta lo
rechaza (haría falta plantilla) y el bot avisa con un ❌ + el motivo.

## Arquitectura (todo en Vercel `sistema-ingresos-landing`, plan gratis)

| Pieza | Archivo | Rol |
|---|---|---|
| Entrada WhatsApp → Telegram | `api/wa-inbox.js` | GET = verificación del webhook de Meta. POST = mensaje entrante → lo reenvía al chat de Telegram. Además captura los eventos de **estado** (sent/delivered/read/failed) y actualiza los ✓✓ del hilo (ver abajo). |
| Salida Telegram → WhatsApp | `api/tg-webhook.js` | Recibe lo que Jose escribe. Si es *respuesta* a un `📩 …`, saca el número del encabezado y manda el texto por WhatsApp. `/start` o `/id` devuelven el chat_id. |
| Envío de texto libre | `api/_lib/wa.js` → `sendText({to, body})` | Manda texto normal por la Cloud API (no plantilla). Solo funciona dentro de la ventana de 24 h. |

Seguridad: `tg-webhook.js` solo atiende el chat de Jose (`TELEGRAM_CHAT_ID`) y valida el
secret token del header (`TG_WEBHOOK_SECRET`) que Telegram manda en cada request.

### Estado de entrega (los ✓✓ · desde 2026-07-05)

Meta manda por el mismo webhook (`api/wa-inbox.js`, campo `messages`) los avisos de estado
de cada mensaje **saliente**: `sent → delivered → read` (o `failed`). Antes se descartaban;
ahora `procesarStatuses()` los mapea a `enviado / entregado / leido / fallido` y llama al RPC
`marcar_entrega(p_wamid, p_estado, p_ts)` de la base de marketing, que sube el estado de la
fila del hilo (`conversaciones_wa`, match por `wamid`). El RPC **solo sube de nivel**
(enviado 1 < fallido 2 < entregado 3 < leido 4), así los avisos desordenados no bajan el
estado; guarda además `entregado_en` y `leido_en`. Los salientes nacen en `enviado` cuando
`api/_lib/wa.js` (`logConversacion` / `marcarEntrega`) crea la fila. Esto alimenta los ✓✓ del
inbox de Leadr (`/admin/chats`): 1 tilde gris = enviado, 2 grises = entregado, 2 celestes =
leído. Requisito: la app tiene que estar suscripta al campo `messages` de la WABA (ya lo está).

## Configuración (para reconstruir o depurar)

- **Bot:** @Periodistasdigitalesbot. Token en Vercel env `TELEGRAM_BOT_TOKEN` (y en BotFather —
  `/revoke` para rotarlo si se filtra). chat_id de Jose: `7905853388`.
- **Env vars (Vercel production):** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
  `WA_WEBHOOK_VERIFY_TOKEN`, `TG_WEBHOOK_SECRET`, y las ya existentes `WHATSAPP_TOKEN`,
  `WHATSAPP_PHONE_NUMBER_ID`.
- **Telegram webhook:** `setWebhook` → `https://sistemadeingresosdiariosia.com/api/tg-webhook`
  con `secret_token` = `TG_WEBHOOK_SECRET` y `allowed_updates:["message"]`.
- **Meta webhook:** panel de la app *Periodistas Digitales WP* (id `1774982020572375`) → Casos de
  uso → "Conectar en WhatsApp" → Paso 2 → **Configurar webhooks**: URL
  `https://sistemadeingresosdiariosia.com/api/wa-inbox`, verify token = `WA_WEBHOOK_VERIFY_TOKEN`.
- **Suscripción de la app a la WABA (clave):** se hizo por API con
  `POST https://graph.facebook.com/v21.0/{WABA}/subscribed_apps` usando `WHATSAPP_TOKEN`.
  Verificar con el GET del mismo endpoint (debe listar la app).
  ⚠️ Al suscribir, Meta auto-suscribe `account_alerts/account_update/...`; el campo **`messages`**
  (el que trae los mensajes de clientes) se confirmó con la prueba real. Si algún día dejan de
  llegar mensajes entrantes, lo primero a revisar es que `messages` siga suscrito.

## Cómo probarlo

Desde un WhatsApp cualquiera, escribir al **+34 614 79 62 00**. Debe aparecer en el bot de
Telegram en 1-2 segundos. Responder deslizando ese mensaje → "Responder"; el texto vuelve al
WhatsApp del que escribió.

## Asistente automático (responde solo)

Para que Jose **no tenga que responder cada mensaje a mano**, el sistema atiende solo los
casos comunes y solo lo molesta cuando hace falta un humano. Vive en
`sistema-ingresos/api/_lib/asistente.js` (toda la lógica **y todos los textos** que ve el
cliente están ahí arriba, a propósito, para editarlos sin tocar código) y lo orquesta
`wa-inbox.js`.

**Interruptor `ASISTENTE_ENABLED` (env de Vercel):**
- **sin setear / ≠ 1 → MODO BORRADOR (así arrancó).** No le manda NADA al cliente; a Jose
  le llega a Telegram la ficha + `🤖 BORRADOR — le respondería: …`. Sirve para revisar los
  textos sobre tráfico real sin riesgo.
- **= 1 → REAL.** El bot responde de verdad por WhatsApp y a Jose le llega solo un aviso
  corto (o la ficha completa si escala). Para encenderlo: agregar `ASISTENTE_ENABLED=1` en
  Vercel (production) y redeployar.

**Qué hace, según de dónde viene la persona (segmento):**
- Identifica el segmento con la misma ficha: 🟢 comprador · 🟡 carrito · 🟠 pago rechazado ·
  🔵 lead · 🆕 nuevo.
- Clasifica el mensaje (tolerante a typos/acentos) en una intención: `no_llego`, `como`/`info`,
  `pago`, `acceso`, `leadr`, `precio`, `cierre`, `humano`. Si no la entiende → manda un **menú de
  botones** propio del segmento (WhatsApp permite botones gratis dentro de la ventana de 24 h).
- Resuelve solo: `no_llego` de un lead → **reenvía el último regalo** (sabe cuál por el
  `WA_STAGE` de Brevo); `como`/`precio` → info del curso (landing, **sin** revelar precio —
  `precio` ahora también engancha con "costo", "gratis", "es pago"); `pago` → link de pago;
  `acceso`/`leadr` → ayuda post-compra.
- `cierre` (agradecimientos / "lo reviso" / "estaré en contacto") → respuesta **cálida sin
  botones ni CTA**. Antes caían en el menú y quedaba robótico ("elegí una opción 👇").
- `humano` (o botón "Hablar con equipo", o un audio/imagen que no puede leer, o **"¿con quién
  hablo? / ¿es un bot? / ampliación del aviso"**) → le manda al cliente un "ya le aviso al
  equipo" y **escala** a Telegram con la ficha completa.

**Anti-bucle (desde 2026-07-09).** Si el bot ya resolvió el MISMO intent hace poco (<30 min)
y la persona vuelve a caer en lo mismo —el caso típico: tocar "📥 No llegó mi guía" una y otra
vez y recibir siempre el mismo link, o "Hola" repetido— **deja de repetir el mismo texto y
escala a una persona**. Umbral por intent (`no_llego`/`menu`/`pago`/`acceso` = 2ª vez;
`info` = 3ª). El contador vive en `wa_bot_estado.repes` (se resetea al cambiar de intent o
pasados 30 min).

**Handoff bot↔humano (tabla `wa_bot_estado`):**
- Cuando el bot **escala**, deja el número en modo `esperando` (con `escalado_en`) y el bot
  queda en pausa hasta 48 h (por si nadie contesta, luego retoma).
- Apenas **Jose responde** por Telegram, `tg-webhook.js` lo pasa a `humano` por 24 h → el bot
  **no le pisa** la conversación (y limpia la escalación pendiente).
- **Recordatorio de escalaciones sin responder (#2):** el cron diario de `wa-funnel.js`
  (`?mode=recordatorios` para probarlo aislado) busca los `esperando` de +3 h aún sin respuesta
  y **le pinga a Jose por Telegram** al tema del cliente, para que ninguna quede en el olvido
  (pasó con 4 pedidos de "hablar con equipo" del 3–8 jul que nunca se contestaron). Marca
  `recordatorio_en` para avisar una sola vez por escalación.

**Intents/segmentos probados** con 12 casos (incluidos typos como "no me llego", "komo
funciona", "kiero hablar con alguien") — todos rutean bien. Falta: encender el flag tras la
aprobación de los textos por Jose. (Pendiente menor en el copy: el link self-serve para
activar Leadr, marcado con `TODO Jose` en `asistente.js`.)

## Limitaciones / a futuro

- Es 1 número ↔ 1 Telegram (el de Jose). Alcanza para el volumen actual.
- Para responder hay que usar **"Responder"** sobre el mensaje del cliente (así el bot sabe a
  quién mandar). Si Jose escribe suelto, el bot le recuerda cómo hacerlo.
- Solo texto (los adjuntos entrantes llegan como `[imagen]`, `[audio]`, etc.; para verlos habría
  que abrir la conversación por otro medio). Suficiente para el caso de uso actual.
