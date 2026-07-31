# Monitor diario — Funnel de Leads (Facebook → Brevo)

Documentación técnica del robot que vigila el funnel de captación de leads y
manda un reporte diario por email. Creado/arreglado el **2026-06-28**.

> Fuente de verdad de esta automatización. La memoria de Claude
> (`project_monitor_funnel_leads`) apunta acá.

## Qué es

Una **routine en la nube de Claude Code** (no corre en la PC de Jose; vive en la
infraestructura de Anthropic, se gestiona con el skill `/schedule`):

- **Nombre:** "Monitor diario - Funnel Leads (Make+Brevo)"
- **trigger_id:** `trig_01PyUJV66vgiz891HXJQoyg4`
- **Horario:** `0 12 * * *` (12:00 UTC = 14:00 Europe/Paris), todos los días.
- **Conexiones MCP:** Make + Gmail.
- **Qué hace:** revisa la salud del funnel y manda SIEMPRE un email-reporte a
  joseanselmi27@gmail.com en lenguaje NO técnico (Jose no es técnico).

## Qué vigila

El scenario de Make **`9474482` "Funnel Leads - Instantaneo (webhook)"** (teamId
`1749729`, org `3703862`): capta leads de un form de Facebook **en el instante**
en que entran (webhook), manda email de bienvenida y los suma a la lista de Brevo
id `5` ("Leadgen - Guía Claude"). Disparador instantáneo desde el **2026-07-03**
(ver "Cadencia del disparador" abajo).

> ⚠️ El scenario viejo **`9433023` "Facebook Lead Ads _ Step 1"** (polling) quedó
> **DESACTIVADO** el 2026-07-03 al migrar a webhook. Sigue existiendo como respaldo
> de emergencia: si el instantáneo falla, se puede reactivar (`scenarios_activate
> 9433023`) para volver al polling. No dejar los dos prendidos a la vez → emails
> duplicados.
>
> ⚠️⚠️ **`9433023` está apagado A PROPÓSITO — su `isActive:false` NO es una falla.**
> Cualquier rutina que vigile "el funnel" debe chequear el **`9474482`**, nunca el
> `9433023`, o reporta una falsa alarma de "funnel apagado". Pasó el 2026-07-05: el
> **Panel de Comando diario** (`trig_012j4zUuq56FyGnpUoVsXxci`, ver
> [[project_rutina_diaria_email]]) todavía apuntaba al `9433023` y gritó "APAGADO,
> 34h sin captar" varios días seguidos aunque el funnel real andaba perfecto.
> Corregido su prompt para chequear `9474482` (y se le sacó la regla vieja de
> "última corrida >8h = ROJO", que no aplica a un webhook instantáneo).

El robot chequea 3 cosas, todo por el MCP de Make (sobre el scenario `9474482`):
1. Que esté encendido (`scenarios_get` → `isActive`). Si aparece apagado =
   problema (Facebook tiró el token o Make lo auto-desactivó por 3 errores).
2. Que las ejecuciones recientes no tengan `error` (`executions_list`).
   **OJO: ya NO aplica "última corrida < 8h".** Es un scenario instantáneo: solo
   se ejecuta cuando entra un lead, así que un día sin ejecuciones = día sin
   leads, NO una falla. Lo que importa es `isActive` + que no haya `error`.
3. Emails enviados/abiertos de los últimos 7 días (ver abajo).

## El problema resuelto (por qué la arquitectura es así)

La routine corre en un **sandbox que bloquea el egress a `hook.eu2.make.com`
(devuelve 403)**. Las conexiones MCP (`mcp.make.com`, Gmail) SÍ funcionan.

Antes el robot hacía `curl` al webhook del "puente de Brevo" para traer los
stats de email → fallaba con 403 → los tests 4 y 5 daban "no se pudo verificar".
Además: **Brevo bloquea la IP de Claude**, así que el robot tampoco puede
pegarle directo a `api.brevo.com`. Y `scenarios_run` por MCP **no** ejecuta el
flujo de un scenario disparado por webhook (no sirve para refrescar datos).

### Solución: el "cajón" (Make Data Store)

Los datos de Brevo se dejan en un Data Store que el robot lee por MCP, sin tocar
internet:

| Recurso | ID | Qué es |
|---|---|---|
| Data structure | `596982` | "Brevo Stats Snapshot" — define los campos |
| Data Store | `169011` | "Brevo Stats Latest" — guarda 1 registro `latest` |
| Scenario refrescador | `9451536` | "Rutina - Brevo Stats Snapshot (cada 6h)" — programado, lee Brevo y escribe el cajón cada 6h |
| Scenario puente (webhook) | `9446647` | "Rutina - Brevo Stats Bridge" — también escribe al cajón cuando se lo llama por curl; queda para uso manual/local |

Campos del registro `latest`: `delivered` (enviados), `uniqueOpens` (personas
que abrieron), `opens`, `clicks`, `uniqueClicks`, `hardBounces` (rebotes),
`subscribers` (tamaño de lista), `range`, `updatedAt`.

El robot lee con `data-store-records_list` dataStoreId `169011`, calcula
`uniqueOpens / delivered * 100` = % de apertura, y lo cuenta en criollo.

## Cadencia del disparador (webhook instantáneo — LIVE 2026-07-03)

El scenario `9474482` arranca con el módulo **instantáneo**
`facebook-lead-ads:NewLeadMultiple` (`listener`): Facebook le avisa a Make **en
el momento exacto** en que entra el lead. Latencia real de **segundos** (probado
E2E: disparó en <1s del envío) y **0 ops desperdiciadas** — solo consume cuando
hay un lead real (vs. las ~4.320 ops/mes que gastaba el polling revisando al
pedo). Antes era polling cada 6h; el 2026-07-03 se bajó primero a 10 min como
paso seguro y después se migró al webhook.

Config clave (para reconstruir o auditar):
- **Hook:** `4236957` "FB Lead Ads - Guia Claude (instant)", tipo
  `facebook-lead-ads-new-event`, `web-shared` (Facebook lo suscribe solo, sin URL
  que registrar). Conexión FB `7680405`, página `439763019230527` "Periodistas
  del Futuro IA", form `1075862554796241` "Guia Claude Periodistas | v1".
- **Scheduling:** `{"type":"immediately"}` (SIN interval) + `metadata.instant:
  true` → `nextExec: null`. ⚠️ Si se le pone un `interval`, Make lo pasa a
  `instant:false` y vuelve a comportarse como polling. Para activarlo hay que usar
  `immediately`, no `indefinitely`.
- **Mapeo de campos:** el trigger instantáneo entrega los campos como **array**
  (no como texto plano). Por eso el email/nombre/teléfono se leen con
  `{{first(1.data.email)}}`, `{{first(1.data.full_name)}}`,
  `{{first(1.data.phone_number)}}`. Con el token pelado (`{{1.data.email}}`) el
  mail sale roto → el email falla en silencio. **No cambiar a token pelado.**
- Módulos del flow (ids reales): `1` = trigger FB, `3` = email de bienvenida
  (Brevo `smtp/email`), `4` = alta de contacto (Brevo `contacts`, lista 5), `5` =
  guardado del lead en Supabase vía el endpoint propio
  `sistemadeingresosdiariosia.com/api/lead` (header `x-lead-secret`). Misma API key
  de Brevo hardcodeada en 3 y 4.

## Blindaje contra timeouts (2026-07-03)

**Incidente:** el 03/07 a las 17:14 una de las 3 llamadas HTTP tardó **>40 s**
(timeout, pico transitorio de Brevo/red — las otras ~39 corridas del día OK). Como
es un scenario `immediately`, **un solo error no manejado lo apaga solo**
(`isActive:false` + `isinvalid:true`, warning "Fix the error or clear the queue").
Quedó ~45 min apagado. Make manda 1 email de aviso por error (los 2 mails que vio
Jose eran del MISMO error). Fix inmediato: `scenarios_activate 9474482`.

**Los leads NO se perdieron.** El hook instantáneo `4236957` **sí encola** los
leads que entran mientras el scenario está caído (`hooks_get` → `queueCount`;
`queueLimit` 667). Durante la caída había 2 en cola y al reactivar se procesaron
solos (`status:1`). Esto **corrige** la nota del runbook de abajo: un lead solo se
pierde si la cola desborda (>667) o si Facebook desuscribe el webhook (token
muerto) — no por una caída corta.

**Fix permanente (a pedido de Jose "así no intervengo yo"):** error-handler
**Retry** (`builtin:Break`) en las 3 llamadas HTTP (ids 3, 4, 5) +
`metadata.scenario.dlq: true`. Config de cada handler:
`mapper { retry: true, count: 5, interval: 5 }` (reintenta solo hasta 5 veces, cada
5 min). Ahora un timeout **no apaga el scenario**: guarda el bundle como ejecución
incompleta, da un warning y sigue corriendo para el resto de los leads; el lead
frenado se reintenta solo. Si tras 5 intentos sigue fallando (outage largo >25 min)
queda en "ejecuciones incompletas" para revisión manual, pero el scenario sigue vivo.

- Se editó el blueprint por el **MCP de Make** (`scenarios_update`), copiando el HTML
  del email tal cual y verificando post-update que quedó idéntico. **No hay token de
  API de Make local** (el MCP es OAuth de claude.ai) → no se puede scriptear un
  round-trip; si se reedita a mano, cuidar de no romper el HTML escapado.
- `builtin:Break` en blueprint: `count` (nº reintentos, 1-10000), `interval`
  (minutos, 1-44640), `retry` (bool). Va en el array `onerror` del módulo.
- Mejora NO pedida (queda como opción): aviso por mail / auto-reactivación si igual
  se apaga (p. ej. por token de FB muerto, que el Break no cubre).

**Cómo se probó (E2E, con Jose):** Lead Ads Testing Tool de Facebook
(https://developers.facebook.com/tools/lead-ads-testing) → página + form → "Vista
previa del formulario" → llenar con mail real → enviar. Se verifica en
`executions_list(9474482)` que la corrida dé `status: 1` sin `error` y que llegue
el mail. (En un test hay que borrar el lead anterior con "Eliminar cliente
potencial": FB deja solo 1 lead de prueba por form.)

**Generador del blueprint:** el flow se arma con un script para evitar romper el
HTML del email al escapar a mano (una comilla mal = email roto en silencio). Ver
`scratchpad/gen-instant-blueprint.mjs` de la sesión, o regenerar: HTML como
template literal + `JSON.stringify`.

## Cómo tocar este robot

- Editar prompt / horario / pausar: skill `/schedule`.
- Cambiar qué datos de Brevo se guardan: editar el scenario `9451536` en Make.
- La API key de Brevo está hardcodeada en los scenarios de Make `9446647` y
  `9451536` (header `api-key`). Si se rota, actualizar en ambos.

## Runbook: "el funnel está caído / token de Facebook inválido"

Síntoma (lo reporta el monitor diario): el scenario `9474482` aparece apagado y
en las ejecuciones sale un error `InvalidAccessTokenError [401] ... (190,
OAuthException)` "The session has been invalidated because the user changed
their password or Facebook has changed the session for security reasons".

Pasó el **2026-07-01** (con el scenario viejo `9433023`): Facebook invalidó el
token, Make falló 3 veces y apagó el scenario solo (`maxErrors: 3`). ~17 h sin
captar leads. Con el webhook instantáneo el riesgo es el mismo: si el token muere,
el hook deja de recibir y/o Make auto-desactiva el scenario.

**Causa:** el token de Facebook se cae cuando Jose cambia la contraseña de FB o
Facebook corta la sesión por seguridad. Renovarlo **requiere un login de
navegador que solo puede hacer Jose** — Claude/MCP no puede loguearse por él.

**Fix (2 pasos):**
1. **Jose** entra a Make → *Connections* → "My Facebook connection" (Jose
   Anselmii, id `7680405`) → **Reauthorize** → login en Facebook + autorizar
   todos los permisos. (Al renovar, el campo `expire` de la conexión avanza ~60
   días — así se confirma que quedó bien.)
2. **Claude** reactiva y verifica por MCP: `scenarios_activate 9474482` →
   pedirle a Jose un lead de prueba (Lead Ads Testing Tool) → chequear en
   `executions_list` que el `EXECUTION_END` sea `status: 1`. Con el webhook, los
   leads que hayan entrado durante la caída **pueden perderse** (el hook no
   guarda cursor como el viejo Watch Leads); si la caída fue larga, revisar en
   Meta Ads Manager los leads del período y darlos de alta a mano si hace falta.

> Ojo: había una 2ª conexión de Facebook duplicada (`14367546`) de la misma
> sesión original — cuando el token se cae, **las dos** quedan muertas. No sirve
> "cambiar de conexión"; hay que reautorizar de verdad.

## Pendiente / mejora conocida

- **Open rate bajo (~8%).** Al 28/06 la apertura está en ~8% (sano: 15%+). El
  reporte lo señala. Posibles causas: asunto del email de bienvenida, o que cae
  en la pestaña Promociones/Spam de Gmail. Mejora futura, no urgente.
- **Confirmar el primer reporte nuevo.** Se disparó la routine de prueba el
  28/06 tras el cambio; falta confirmar que el email llegó con el formato nuevo.
