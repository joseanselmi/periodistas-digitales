# Arquitectura de datos — Marketing y Analytics

Documento vivo. Jose no tiene conocimiento técnico de bases de datos — este archivo existe para que Claude (en cualquier sesión futura) tenga el contexto completo sin tener que preguntarle a Jose nada técnico. **Toda decisión nueva sobre esto se escribe acá, en el momento en que se toma.**

## Decisión (2026-06-24): base separada de la de Leadr

Hay dos proyectos de Supabase relevantes en la organización (`rrlqxawnauubcvhblvbb`):
- `leadr-plataforma` (id `ovwlsnnhiuoxoazyrhvt`) — la base transaccional de la app Leadr. Tablas: `users`, `classes`, `groups`, `prompts`, `user_progress`, `activation_tokens`, `class_ratings`, `bonus_items`, `news`, `team_members`, `costs`, `admin_tasks`, `agent_states`, `certificates`, `class_vote_sessions`, `class_votes`. **No tocar esta base para nada de marketing/analytics.**
- `periodistas-marketing` (id `wxyimqkjlwfncvzozpjy`, región sa-east-1) — **creado el 2026-07-02**. Base solo para datos de marketing/analytics cross-producto (leads, clientes potenciales, productos, compras, funnels, eventos). Detalle en "Actualización (2026-07-02)" abajo.

**Por qué separado:** los datos de marketing (leads, tracking de funnels, compras) no son específicos de Leadr — cruzan Leadr, Sistema de Ingresos Diarios, y cualquier producto futuro. Mezclarlos en la base de la app complica las políticas RLS de Leadr y ensucia las migraciones de la app con tablas que no tienen nada que ver con el producto. Postgres permite cruzar datos entre bases distintas si alguna vez hace falta (foreign data wrapper / export), así que separar no es un costo real a futuro.

**Objetivo final:** Metabase (que Jose ya usa en su trabajo) se conecta directo a esta base nueva vía API/Postgres y saca reportes — sin que haga falta construir dashboards a mano.

## Actualización (2026-07-02): base creada + primera tabla (`clientes_potenciales`)

Avance de la tarjeta Trello #25 ("Crear el objeto cliente potencial").

- **Cupo del plan gratis:** Supabase free permite solo 2 proyectos activos y ya estaban ocupados (leadr-plataforma + respira-masajes). Jose decidió **pausar `respira-masajes`** (id `efxejqrlhnaybwrvpjsz`) para liberar el cupo — lo va a migrar a otra cuenta/correo más adelante. Alternativas descartadas por ahora: pasar a Pro (~US$45/mes por 3 proyectos activos) o meter las tablas de marketing dentro de la base de Leadr.
- **Proyecto creado:** `periodistas-marketing` (id `wxyimqkjlwfncvzozpjy`, sa-east-1). Las tablas van en el schema `public` (no en un schema `marketing` aparte): al ser una base dedicada el aislamiento ya está dado, y `public` deja escribir por la API REST estándar de Supabase sin exponer schemas extra.
- **Tabla `clientes_potenciales`:** modela a quien entró al checkout del curso y NO compró (carrito abandonado o pago rechazado), para recuperarlo después. RLS activado sin políticas → nadie accede por la API pública; el webhook escribe con la `service_role` key (saltea RLS); Metabase leerá con un rol de solo-lectura. Columnas clave: `tipo` (`carrito_abandonado`|`pago_rechazado`), contacto (`email`/`nombre`/`telefono`), `valor`/`moneda`, atribución (`src`/`fbp`/`fbc`/`utm_*`), `estado_recuperacion`, `dedup_key` (idempotencia) y `payload` (JSON crudo de Hotmart). Probada la idempotencia del upsert por `dedup_key`.
- **Webhook:** `sistema-ingresos/api/hotmart.js` ahora, además de la compra, clasifica los eventos de Hotmart que no son compra e inserta el cliente potencial (upsert por `dedup_key`; nunca guarda reembolsos/chargebacks, que son ex-clientes). El mapeo (`PURCHASE_OUT_OF_SHOPPING_CART` → abandonado; `PURCHASE_EXPIRED`/`PURCHASE_CANCELED`/status rechazado → pago rechazado) es best-effort según el webhook v2 de Hotmart y **debe confirmarse contra el `raw payload` real de los logs** la primera vez que llegue cada evento (el payload crudo se guarda entero, así que reclasificar después no pierde datos).

**Estado de puesta en producción (act. 2026-07-02):**
1. ✅ Env vars cargadas en Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) en Production.
2. ✅ Deploy a producción hecho (`vercel --prod`, aliased a sistemadeingresosdiariosia.com) y **probado end-to-end**: se disparó al webhook real un evento simulado de carrito abandonado (con el hottok real de Hotmart) y la fila entró correcta en `clientes_potenciales` (tipo, contacto, valor, `src`, fbp/fbc bien parseados). Dato de prueba borrado. Test: POST a `/api/hotmart` con `event: PURCHASE_OUT_OF_SHOPPING_CART`.
3. ✅ **Eventos habilitados en Hotmart (2026-07-02):** Abandono de carrito, Compra cancelada, Compra con plazo vencido (+ las de compra que ya estaban). Sistema LIVE — los carritos reales entran solos.
4. ✅ **Código commiteado y pusheado a master** (commit `36cfc56`).
5. ✅ **VERIFICADO con carrito REAL (2026-07-02) — tarjeta #25 CERRADA.** Entró un carrito abandonado real (Juan Aguilera, jaguilera.mexico@gmail.com, 12:53 UTC): evento Hotmart `PURCHASE_OUT_OF_SHOPPING_CART` → clasificado `carrito_abandonado` correctamente. El nombre real del evento coincide con el mapeo de `classifyPotencial`. **Falta ver un pago RECHAZADO real** (`PURCHASE_CANCELED`/`PURCHASE_EXPIRED` → `pago_rechazado`) para confirmar esa rama; el payload crudo se guarda entero, así que se puede reclasificar si el string difiere. **A revisar (menor):** en esa 1ª fila `valor` y `src` vinieron `null` — chequear contra el `raw payload` si es esperado (un carrito abandonado puede no traer monto, y ese lead no traía `?src`) o si el parser se está perdiendo esos campos (relevante también para `ventas.valor`).

## Actualización (2026-07-02): tabla `ventas` (compras confirmadas)

Motivo: al preguntar "¿cómo van las ventas del curso?" se detectó que las ventas
**no estaban en Supabase** — el webhook solo mandaba la compra a Meta (CAPI) y otorgaba
el bono de Leadr, pero no la guardaba en ningún lado propio. Las ventas solo vivían en
Hotmart. Decisión de Jose: **"créala, debería estar."**

- **Tabla `ventas`** (creada 2026-07-02, migración `crear_tabla_ventas`): una fila por
  compra aprobada/completa del curso. Espeja las convenciones de `clientes_potenciales`
  (nombres en español para leer fácil en Metabase, RLS activo sin políticas → solo el
  webhook escribe con `service_role`, Metabase lee con rol de solo-lectura). Columnas
  clave: contacto (`email`/`nombre`/`telefono`), `valor`/`moneda`, `evento_hotmart`,
  `transaction_id`, **atribución** (`src` = el `?src=adN-...` de la landing = campo
  "Origen" de Hotmart; más `fbp`/`fbc`/`utm_*`), `pais`, `es_afiliado`,
  `leadr_bono_otorgado`, `dedup_key` (idempotencia por transacción) y `payload` (JSON crudo).
  Índices por `ocurrido_en`, `src` y `email`. Trigger que mantiene `updated_at`.
- **Webhook (`sistema-ingresos/api/hotmart.js`):** en la rama de compra, además de Meta CAPI
  + bono Leadr, ahora llama a `saveVenta()` → upsert en `ventas` por `dedup_key`
  (`hotmart:<transaction>`). Best-effort: si Supabase falla, loguea y devuelve 200 igual
  (no rompe el pago ni el bono). Idempotente: si Hotmart manda `PURCHASE_APPROVED` y luego
  `PURCHASE_COMPLETE` de la misma compra, se actualiza la MISMA fila (no duplica la venta).

**Estado de puesta en producción (2026-07-02):**
1. ✅ Tabla `ventas` creada (migración aplicada).
2. ✅ Webhook modificado (`saveVenta`) — sintaxis validada.
3. ✅ Deploy a producción (`vercel --prod`, aliased a sistemadeingresosdiariosia.com).
4. ✅ Validado: endpoint vivo (401 sin token = deployó sin crashear) + la tabla acepta el
   registro exacto que arma `saveVenta` (insert de prueba OK, upsert por `dedup_key` OK,
   fila de prueba borrada).
5. ⏳ **Pendiente de confirmar con la 1ª venta REAL:** que los campos de Hotmart matcheen el
   mapeo (sobre todo `src` = "Origen", y `es_afiliado`). El `payload` crudo se guarda entero,
   así que cualquier ajuste posterior es recuperable.
6. ⚠️ **Las 3 ventas del 30/06–02/07 NO entran por el webhook** (es de acá en adelante).
   Se resuelven con el sync de la API de Hotmart → ver "Actualización (2026-07-03)" abajo.

**Nota de naming:** el esquema propuesto abajo listaba esta tabla como `purchases` (inglés),
pero se creó como `ventas` (español) para ser consistente con `clientes_potenciales` y que
Jose la lea fácil en Metabase. Mismo criterio a futuro para el resto.

## Actualización (2026-07-03): sync + reconciliación con la API de Hotmart

Motivo: el webhook solo captura de ahora en adelante, y las ventas viejas (y cualquier
venta que el webhook llegue a perderse un día) no quedaban en la tabla. Jose eligió la
opción robusta: **conectar la API de Hotmart** para (a) backfill del histórico completo
y (b) reconciliar a futuro (garantizar que no se escape ninguna venta).

- **Script:** `ads-agent/hotmart-sync.mjs` (Node ESM, usa `dotenv`). Autentica por OAuth
  client_credentials contra Hotmart, trae el histórico de ventas del producto (paginado),
  filtra a ventas concretadas (`APPROVED`/`COMPLETE`) e inserta en `ventas` **solo las que
  faltan** (compara por `transaction_id`; `resolution=ignore-duplicates` → nunca pisa las
  filas que cargó el webhook ni duplica). **No re-dispara Meta ni el bono de Leadr** (solo
  lee de Hotmart y escribe en la base) — ésa es la ventaja sobre reenviar webhooks. Las
  filas que inserta el sync se marcan con `evento_hotmart = 'API_SYNC:<status>'` para
  distinguirlas de las del webhook live. Flags: `--dry-run` (solo reporta), `--since YYYY-MM-DD`.
- **Producto:** `HOTMART_PRODUCT_ID` default `7966973` (el curso; código público `P106404871J`).
- **Endpoints usados:** OAuth `api-sec-vlc.hotmart.com/security/oauth/token`; ventas
  `developers.hotmart.com/payments/api/v1/sales/history`. Construido contra la API pública v1;
  el mapeo se confirma en la 1ª corrida real (igual se guarda el JSON crudo en `payload`).

**Estado (2026-07-03):**
1. ✅ Script escrito, sintaxis validada, falla con mensaje claro si faltan credenciales.
2. ✅ Credenciales de Hotmart generadas por Jose y guardadas en `ads-agent/.env.local`
   (`HOTMART_CLIENT_ID` / `HOTMART_CLIENT_SECRET` / `HOTMART_BASIC` sin el prefijo "Basic ").
   **La autenticación OAuth funciona** (devuelve access_token).
3. ✅ **RESUELTO — era una credencial SANDBOX.** La 1ª credencial autenticaba pero daba
   403 `unauthorized_client` en todo (token con `scope: undefined`). Causa: estaba creada
   con la opción **Sandbox** tildada → autentica pero no lee datos de producción. Jose creó
   una credencial de **producción** (Sandbox destildado) y esas claves funcionan. La pantalla
   "Crear credencial" de Hotmart NO tiene selector de scopes; lo único que importa es **NO
   tildar Sandbox**.
4. ✅ **BACKFILL HECHO (2026-07-03) — TODOS los productos, no solo el curso.** El histórico
   trajo **9 transacciones**: 1 es la compra de PRUEBA de Jose (joseanselmi27@gmail.com) →
   **excluida** (`EXCLUDE_EMAILS`); las otras **8 son ventas reales** y se cargaron en `ventas`.
   - **Insight:** la cuenta vende 6 productos. Además del curso ($27), Hotmart **cross-sellea /
     recomienda** otros productos de Jose en el checkout y los vende solos (order bumps + el
     recomendador). Ej.: Francisco (CO) compró curso + Hashtags $10 + Guía 1.000 lectores $12
     (transacciones `...C1/C2/C3`, misma raíz, todas con `src=ad1-fomo` → **los upsells heredan
     la atribución del anuncio**). Mariano (CR) sumó Máquina de Dinero $9.99 y hasta "Método
     Espalda Fuerte" (nicho bebés) $6.99 vía el recomendador.
   - **Decisión de Jose ("cuéntalo"):** contar TODOS los productos, no filtrar por el curso.
     El script ahora trae todos los productos de la cuenta (sin `product_id` en `fetchAllSales`);
     opcional restringir con `HOTMART_ONLY_PRODUCTS`. Cada fila guarda `producto_id`+`producto`.
   - **Por qué importa el sync (no solo el webhook):** las ventas del cross-sell/recomendador
     puede que ni disparen el webhook del curso → la API de Hotmart es la única forma segura de
     contarlas. El webhook también guarda `producto_id` ahora (deploy 2026-07-03).
   - **Total backfill: 8 ventas · $122.82 bruto · $104.20 neto.** Curso: 3 ventas ($81.03),
     todas por `ad1-fomo` → confirma atribución end-to-end. Columna nueva `producto_id`
     (migración `ventas_agregar_producto_id`).
5. ✅ **MONTO EN USD + MÁXIMO DE DATOS DEL CLIENTE (pedido de Jose).** `sales/history` NO
   trae USD ni tel/dirección → se agregaron dos llamadas por transacción:
   - `sales/commissions` → **USD**: comisión neta del productor (`comision_usd` ≈ 23.84) y
     `exchange_rate_currency_payout` para calcular el **bruto** (`valor_usd` = local × exchange
     ≈ 27, el precio del curso). Se conserva además el `valor`/`moneda` local (lo que se cobró).
   - `sales/users` (rol BUYER) → **datos del comprador**: `telefono` (con código de país),
     `pais`, `ciudad`, `provincia`, `codigo_postal`, `documento`.
   Columnas nuevas en `ventas` (migración `ventas_agregar_usd_y_datos_cliente`): `valor_usd`,
   `comision_usd`, `ciudad`, `provincia`, `codigo_postal`, `documento`. Las 3 ventas quedaron
   enriquecidas (ciudad/provincia vinieron vacías: el checkout de esos compradores no las pidió).
   El script `enrichVentas()` completa **también las filas que cargó el webhook** (PATCH solo de
   esos campos, no pisa src/fbp/evento_hotmart), así toda venta termina con el máximo de datos.
6. ✅ **AUTOMATIZADO (2026-07-03) — cron diario en Vercel.** Como Hobby permite solo 2 crons y
   ya estaban (wa-funnel + recuperacion), el sync **NO tiene cron propio**: corre pegado al de
   recuperación (`api/recuperacion.js` llama `runHotmartSync()` al inicio de su corrida de las
   15:00 UTC). Así, en la misma pasada: sincroniza Hotmart → captura rechazos frescos → la
   recuperación los agarra al toque.
   - **Módulo:** `sistema-ingresos/api/_lib/hotmart-sync.js` (`runHotmartSync()`), equivalente
     serverless de `ads-agent/hotmart-sync.mjs`. Reconcilia ventas (todos los productos,
     enriquecidas con USD+comprador) + captura pagos rechazados. Best-effort (si falla no frena
     la recuperación). Env de Hotmart cargadas en Vercel producción.
   - **Endpoint manual:** `api/hotmart-sync.js` (guard `CRON_SECRET`) para disparar/testear a mano.
   - **Probado en prod 2026-07-03:** 1ª corrida trajo 0 ventas nuevas (las 8 ya estaban) y capturó
     rechazos. ⚠️ **Bug encontrado y corregido:** dedupeaba rechazos por transacción → Nelson
     (9 intentos de tarjeta) generaba 9 filas = 9 WhatsApps. **Fix:** dedup por PERSONA (email),
     `dedup_key=rechazo:<email>`, y saltea a quien ya está en `clientes_potenciales` o ya compró
     (está en `ventas`). Re-corrida: 0 rechazos nuevos (idempotente). Filas duplicadas borradas.
   - **`ads-agent/hotmart-sync.mjs`** sigue existiendo para correr el sync a mano desde la compu
     (necesita la `service_role` pegada en `.env.local`); el cron usa la de Vercel.

## Actualización (2026-07-03): captura de rechazos de tarjeta (tarjeta #36)

Motivo: los rechazos de tarjeta (informe **Motivos de rechazo de la tarjeta** de Hotmart)
NO entraban solos a `clientes_potenciales`, así que no disparaban recuperación. Follow-up
de la #34.

**Hallazgo que cambió el plan (verificado contra la doc de Hotmart, no asumido):** el plan
original de la tarjeta ("averiguar qué evento del webhook dispara un rechazo y habilitarlo")
**no tiene solución** — ese evento **no existe**. Los estados del webhook de Hotmart son
`approved/canceled/billet_printed/refunded/dispute/completed/blocked/chargeback/delayed/expired`;
ninguno es "tarjeta rechazada". Un rechazo al instante no crea un `purchase` que notificar
(la persona sigue en el checkout). El informe "Motivos de rechazo" es **solo un panel**
exportable a CSV/XLS (`app.hotmart.com/reports/cancellation/reason`), sin webhook ni API
propia. `PURCHASE_CANCELED`/`PURCHASE_EXPIRED` (que sí habilitamos) son otra cosa
(cancelaciones y plazos de boleto/pix vencidos), no el rechazo de tarjeta del momento.

**Solución elegida — vía Sales History API (reusa el sync de ventas):** la Sales History
API **sí** devuelve las transacciones rechazadas con estados `NO_FUNDS`, `BLOCKED`,
`CANCELLED`, `EXPIRED`, `OVERDUE`. Se extendió `ads-agent/hotmart-sync.mjs`: además de las
ventas, ahora trae esos rechazos (de los últimos `--rechazos-dias` días, default 3) y los
inserta en `clientes_potenciales` como `pago_rechazado` (upsert por `dedup_key`
`hotmart:<transaction>`, `ignore-duplicates` → nunca pisa el estado de recuperación de una
fila ya capturada). El **cron diario de `api/recuperacion.js`** los agarra y manda
`recup_rechazo_1` solo (no es instantáneo como el webhook, es batch con hasta ~1 día de
demora, pero entra solo). La ventana de días evita reactivar rechazos viejos en el 1er
backfill; el anti-acoso (cruce con `ventas`) ya cubre a quien después compró.

**Por qué NO se usó el CSV del panel:** la API es automática y reusa la credencial que Jose
ya tiene que habilitar para el backfill de ventas; el CSV sería un import manual recurrente.
Queda como stopgap si hace falta capturar rechazos antes de destrabar la API.

**Estado (2026-07-03):**
1. ✅ Código escrito y sintaxis validada (`fetchRechazos`, `mapToPotencial`, `syncRechazos`,
   flags `--rechazos-dias N` / `--no-rechazos` / `--solo-rechazos`).
2. 🔴 **BLOQUEADO — misma credencial que el sync de ventas:** la API de Hotmart da 403
   (`unauthorized_client`, sin scope de Ventas/Reportes). Al habilitar ese permiso se
   destraban las dos cosas juntas (backfill de ventas + captura de rechazos).
3. ⏳ Falta `SUPABASE_SERVICE_ROLE_KEY` en `ads-agent/.env.local` para que el script escriba.
4. ⏳ E2E cuando se destrabe: `node hotmart-sync.mjs --dry-run --solo-rechazos` (verifica que
   la API devuelva rechazos y confirma el mapeo/param `transaction_status`), luego sin
   `--dry-run`, y confirmar que el cron de recuperación le manda `recup_rechazo_1`.
5. 🔮 Para que "entren solos" a diario: dejar `hotmart-sync.mjs` de cron (mismo cron que
   reconcilia ventas). Correrlo 1×/día antes del cron de recuperación de las 12:00 ART.

## Actualización (2026-07-02): motor de recuperación (tarjeta #34)

Construida la automatización que **recupera** las filas de `clientes_potenciales`
(lo que la #25 solo capturaba, ahora se acciona). Detalle completo y copy en
[sistema-ingresos/RECUPERACION.md](../sistema-ingresos/RECUPERACION.md).

- **Canal: WhatsApp** (lo pidió Jose — más cercano que el email). El 1er mensaje es
  **instantáneo**, lo dispara el **webhook de Hotmart** (`api/hotmart.js` → `instantRecup`)
  apenas Hotmart avisa. El recordatorio (paso 2) lo manda el **motor diario**
  (`api/recuperacion.js`, Vercel Cron 1×/día), que además es red de seguridad del paso 1.
  Esto es la opción (b) de la tarjeta. WhatsApp exige **plantillas aprobadas por Meta**
  (recup_abandono_1/2, recup_rechazo_1/2 — enviadas a aprobación 2026-07-02).
- **Dos secuencias por `tipo`:** `carrito_abandonado` y `pago_rechazado`, 2 WhatsApp cada
  una (instantáneo + recordatorio al día siguiente). Helper compartido `api/_lib/wa.js`.
  El reporte interno a Jose sigue por email (Brevo, no necesita aprobación de Meta).
- **Columnas nuevas en `clientes_potenciales`** (migración `recuperacion_agrega_paso_y_ultimo_contacto`):
  `paso_recuperacion` (int, cuántos emails se mandaron) y `ultimo_contacto_en` (timestamptz).
  Máquina de estados: `estado_recuperacion` = pendiente → contactado → recuperado | perdido.
- **Anti-acoso + medición:** antes de cada envío cruza el email con la tabla `ventas`;
  si ya compró → `recuperado` y se corta la secuencia (esto además mide cuántos se
  recuperan). El link de cada email vuelve a la landing con `?src=recup-abandono` /
  `?src=recup-rechazo`, así la venta recuperada queda atribuida en `ventas`.
- **Interruptor:** no manda nada hasta `RECUP_ENABLED=1` en Vercel (igual que
  `WA_FUNNEL_ENABLED`). El cron corre en modo dry mientras esté apagado.

**Estado:** ✅ código (webhook instantáneo + motor diario + helper WhatsApp) deployado y
probado en dry. ✅ 4 plantillas enviadas a aprobación de Meta (PENDING). ⏳ Go-live: que
Meta apruebe las plantillas → prueba real a un número propio → `RECUP_ENABLED=1`. Detalle
y copy en [sistema-ingresos/RECUPERACION.md](../sistema-ingresos/RECUPERACION.md).

## Actualización (2026-07-03): tabla `customers` (compradores) + página de gracias (tarjeta #24)

Flujo post-compra del cliente (lo que pasa cuando alguien **COMPRA**, contracara de
`clientes_potenciales`). Detalle completo y copy en
[sistema-ingresos/POST-COMPRA.md](../sistema-ingresos/POST-COMPRA.md).

- **Tabla `customers`** (creada 2026-07-03, migración `crear_tabla_customers`) — la tabla `customers`
  del esquema propuesto abajo (cruza con la tarjeta #6). **Una fila por PERSONA** que compró al
  menos una vez, clave `email`. Guarda **identidad** (`email`/`nombre`/`telefono`/`pais`/`ciudad`/
  `provincia`/`codigo_postal`/`documento`) + **ciclo de compra** (`primera_compra_en` fija en el
  insert, `ultima_compra_en`, `ultimo_producto`, `ultimo_src`) + **estado de flujos post-compra**
  (`leadr_bono_otorgado`, **`telegram_estado`** = `pendiente`|`invitado`|`unido`|`baja`). El detalle
  por transacción (montos, atribución completa, USD) sigue en `ventas`. RLS activo sin políticas
  (mismo criterio); índice por `telegram_estado`; trigger `set_updated_at`.
- **Webhook** (`sistema-ingresos/api/hotmart.js` → `saveCustomer()`): en la rama de compra aprobada,
  además de Meta CAPI + bono Leadr + `saveVenta`, ahora da de alta/actualiza el `customer`. Upsert
  por `email` (`merge-duplicates`): NO reenvía `primera_compra_en` (queda fija) ni `telegram_estado`
  (lo maneja el flujo de Telegram); `leadr_bono_otorgado` solo se pone en `true`. Best-effort.
- **Página de gracias** `/gracias` ([sistema-ingresos/gracias.html](../sistema-ingresos/gracias.html),
  rewrite en `vercel.json`): identidad de la landing, `noindex`, Pixel solo `PageView` (el `Purchase`
  lo manda el webhook server-side, no se duplica en el cliente). Bloque de Telegram construido pero
  **apagado** (constante `TELEGRAM_INVITE` vacía → estado "muy pronto"; el canal todavía no existe).

**Estado (2026-07-03):**
1. ✅ Tabla `customers` creada; upsert por email validado en DB (insert 1ª compra + upsert 2ª:
   `primera_compra_en` no se pisa, `ultima_*` sí, `telegram_estado` queda en `pendiente`).
2. ✅ Webhook (`saveCustomer`) — sintaxis validada.
3. ✅ Página `/gracias` construida y **deployada a prod** (`vercel --prod`, aliased al dominio):
   responde 200 (clean URL y `.html`), Telegram en estado "muy pronto".
4. ✅ Webhook deployado sin romper (401 sin token = vivo).
5. ⏳ **Pendiente de Jose:** configurar en el panel de Hotmart la redirección post-compra a
   `/gracias` (hasta entonces se ve la página genérica de Hotmart; el alta del customer va por el
   webhook igual). Y crear el canal de Telegram → pegar el link en `TELEGRAM_INVITE`.
6. ⏳ **Confirmar con la 1ª venta real** que entra la fila en `customers` (no se simuló para no
   disparar Meta CAPI/bono/venta con datos falsos).

## Actualización (2026-07-03): tabla `leads` + ingesta desde Make (tarjeta #6)

Primera pieza del "paraguas" que quedaba de la tarjeta #6. Hasta ahora los leads de
Facebook Lead Ads solo vivían en Brevo (lista 5) y en el email del regalo; no quedaban
en ninguna tabla propia. Ahora entran solos a `leads` en la base de marketing.

- **Tabla `leads`** (creada 2026-07-03, migración `crear_tabla_leads`): una fila por
  contacto capturado antes de comprar (FB Lead Ads y cualquier form futuro). Mismas
  convenciones que el resto (nombres en español, RLS activo sin políticas, `dedup_key`
  idempotente, `payload` crudo, trigger `set_updated_at`). Columnas: contacto
  (`email`/`nombre`/`telefono`), `fuente` (`facebook_lead_ads`|`form_web`), `funnel`
  (id legible, ej. `meta-leadgen-guia-claude`), atribución (`src`/`fbp`/`fbc`/`utm_*`),
  ids de FB (`leadgen_id`/`form_id`/`ad_id`/`campaign_id`), `estado`
  (`nuevo`→`contactado`→`convertido`|`descartado`) y `dedup_key`. Índices por
  `email`/`ocurrido_en`/`fuente`/`funnel`.
- **Endpoint de ingesta:** `sistema-ingresos/api/lead.js` (Vercel Function del proyecto
  del curso). Make pega acá un POST por cada lead. **Por qué un endpoint propio y no meter
  Supabase directo en Make:** así la `service_role` key (que lee/escribe TODA la base,
  incluida PII de ventas/customers) NO vive dentro de Make — queda en Vercel, donde ya
  está, igual que el resto de `api/`. Make solo conoce un secreto acotado
  (`LEAD_INGEST_SECRET`, header `x-lead-secret`) que únicamente sirve para insertar leads.
  Idempotente: `dedup_key = fb:<leadgen_id>` + `on_conflict` con `resolution=ignore-duplicates`
  → si Make reprocesa el mismo lead no duplica ni pisa el `estado` de trabajo del lead.
- **Paso de insert (`/api/lead`)** = último módulo del escenario del funnel de leads, con
  `stopOnHttpError:false` (si el insert fallara, el regalo ya salió igual).
  > ⚠️ **MIGRADO 2026-07-03:** el funnel pasó de polling (escenario viejo `9433023`, hoy
  > DESACTIVADO) al **webhook instantáneo `9474482`** "Funnel Leads - Instantaneo (webhook)"
  > — ver [ads-agent/MONITOR-FUNNEL-LEADS.md](MONITOR-FUNNEL-LEADS.md) y tarjeta Trello #29.
  > El módulo de insert se replicó en el `9474482` (módulo 5, mismo endpoint + secreto). **OJO
  > mapeo:** en el trigger instantáneo los campos del lead vienen como array → email/nombre/tel
  > se leen con `{{first(1.data.email)}}` etc.; los top-level (`{{1.leadgenId}}`, `{{1.campaignId}}`…)
  > quedan igual. Con token pelado el dato entra roto.

**Estado (2026-07-03):**
1. ✅ Tabla `leads` creada (migración aplicada).
2. ✅ Endpoint `/api/lead` escrito, `LEAD_INGEST_SECRET` cargado en Vercel producción, y
   **deployado** (`vercel --prod`). Probado e2e por HTTP: GET→405, POST sin secreto→401,
   POST con secreto→200 e inserta bien (campos mapeados: nombre/telefono/fuente/funnel/
   utm/leadgen_id/ocurrido_en/estado); idempotencia confirmada (2 POSTs = 1 fila). Fila de
   prueba borrada; `leads` queda en 0.
3. ✅ Módulo de insert en el escenario del funnel (migrado al webhook `9474482` el 03/07).
4. ✅ **CONFIRMADO con leads REALES:** la tabla `leads` tiene 2 filas insertadas por el
   módulo `/api/lead`, incluida una de un **lead real** (`juancadesco@gmail.com` "Juan Carlos
   Forra", 03/07 00:25) — mapeo nombre/telefono/fuente/funnel/leadgen_id OK. (Estas 2 las
   metió la config del insert mientras corría en `9433023`; falta ver una corrida del insert
   ya **dentro del `9474482`** — se confirma con el próximo lead real, es el mismo módulo.)
5. 🔒 **Pendiente menor de higiene:** `api/lead.js` está deployado pero todavía **sin commitear**
   a git (mismo criterio que el resto: se commitea cuando Jose lo pida).

**Naming:** el esquema de abajo la listaba como `leads` (ya estaba en inglés/genérico); se
creó con ese mismo nombre. `estado`/`fuente`/`funnel` en español para leer fácil en Metabase.

## Actualización (2026-07-03): tablas `products`, `funnels`, `funnel_steps`, `events` (tarjeta #6)

Se crearon las 4 tablas que faltaban del esquema (migración `crear_tablas_products_funnels_events`).
Con esto **el esquema completo de la tarjeta #6 existe en Supabase**: `clientes_potenciales`,
`ventas`, `customers`, `leads`, `products`, `funnels`, `funnel_steps`, `events`. Mismas
convenciones (RLS activo sin políticas, `updated_at` por trigger). Tres se sembraron con datos
reales; `events` queda vacía a propósito.

- **`products`** — catálogo. Sembrada con los **6 productos reales** que aparecen en `ventas`
  (curso principal + 2 order bumps + 3 cross-sell del recomendador de Hotmart) **+ Leadr Pro**
  ($10/mes). Cada fila trae `producto_id_hotmart` → cruza directo con `ventas.producto_id`
  (verificado: el curso matchea sus 3 ventas, cada order bump/cross-sell su venta). `tipo`:
  `curso_principal`/`order_bump`/`upsell`/`downsell`/`cross_sell`/`membresia`/`lead_magnet`.
- **`funnels`** + **`funnel_steps`** — espejo del mapa `ads-agent/dashboards/FUNNELS.html`.
  2 embudos sembrados: **Canal 1 "Meta Ads directo"** (7 pasos: ads→landing→checkout→order
  bump→upsell→downsell→gracias) y **Canal 2 "Meta Lead Ads + regalos"** (11 pasos:
  anuncio→formulario→regalos 1-4→oferta→checkout→order bump→upsell→downsell). Ambos venden el
  curso y convergen en Leadr. `funnel_steps.tipo` = `trafico`/`checkout`/`monetizacion`/`gracias`;
  `estado` = `activo`/`pendiente` (Regalo 4 = pendiente). **El slug del Canal 2 es
  `meta-leadgen-guia-claude`, igual que el default de `leads.funnel`** → los leads joinean con su embudo.
- **`events`** — creada con las columnas del diseño (tipo_evento, funnel_id/funnel_step_id, url,
  atribución `src`/`sck`/`utm_*`/`fbp`/`fbc`, `lead_id`/`customer_id`/`session_id`, ip/ua/país,
  `payload`) y FKs a `funnels`/`funnel_steps`/`leads`/`customers`. **VACÍA a propósito:** se llena
  cuando exista el pixel/script de tracking en las landings — esa instrumentación es la única
  pieza de la tarjeta #6 que sigue pendiente de diseñar/construir.

**Estado (2026-07-03):** ✅ 4 tablas creadas; ✅ products/funnels/funnel_steps sembradas y
verificadas (7 products, 2 funnels, 18 steps, cruces OK); ⏳ `events` espera el tracking;
⏳ conectar Metabase (postergado, ver nota abajo).

## Actualización (2026-07-03): tabla `campanas` (gasto de ads ↔ ventas)

Faltaba la tabla que ata el **gasto publicitario** con las ventas/leads — sin ella no se
puede calcular CPA/ROAS por anuncio dentro de la base (migración `crear_tabla_campanas`).

- **`campanas`** — catálogo de anuncios de ads. **Grain = un anuncio por su "matrícula" `src`**
  (`adN-angulo`, el sistema de Mateo que aparece igual en Meta / la URL `?src=` / Hotmart
  "Origen"). Guarda identidad + config + ciclo de vida (`estado`:
  `activa`/`en_preparacion`/`pausada`/`finalizada`) + **gasto y métricas de Meta**
  (`gasto_usd`, `ctr`, `frecuencia`, `impresiones`, `clics`, `ultimo_chequeo_en`, `decision`)
  que **no salen de la base**. Relaciones a `funnels` y `products`.
- **Cómo cruza:** por `src` con `ventas`/`leads`/`clientes_potenciales`/`events` (esas tablas ya
  tienen la columna `src`, así que **NO se agregaron FKs nuevas**). Las ventas/CPA/ROAS se
  **calculan** con el join; solo el gasto se guarda. Verificado: `ad1-fomo` (gasto $32.72) cruza
  con sus 5 ventas ($103.03 bruto) → **CPA curso $10.91 · ROAS 3.15**, idéntico al chequeo de Mateo.
- **Sembrada** con los 2 anuncios del registro (`ads-agent/registro-anuncios.md`): `ad1-fomo`
  (🟢 activa) y `ad2-fomo2` (🟡 en preparación).
- **Fuente de la verdad operativa sigue siendo `registro-anuncios.md`** (lo escribe Mateo); esta
  tabla es el espejo consultable para Metabase/queries. Al monitorear, actualizar `gasto_usd`/
  métricas/`decision` acá también (o a futuro, traerlas por la API de Meta).

## Actualización (2026-07-03): tracking de `events` (instrumentación) + gasto de Meta en `campanas`

Las dos piezas que quedaban como "pendiente de construir".

### `events` — tracking de las landings (✅ LIVE)
- **Endpoint** `sistema-ingresos/api/event.js` — público (lo dispara el navegador, como un
  pixel de analytics; no lleva secreto). Best-effort, responde 204, nunca frena la navegación.
  Anti-spam básico: solo acepta beacons cuyo Origin/Referer es del dominio propio. Escribe con
  la service_role (misma que el resto de `api/`). Captura `user_agent`, `ip` y **`pais`** (del
  header `x-vercel-ip-country`).
- **Beacon** `sistema-ingresos/track.js` — script liviano en las landings. Manda un evento por
  **pageview** y por **clic de checkout** (link de Hotmart), con atribución (`src`/`sck`/`utm_*`/
  `fbp`/`fbc`) + un `session_id` anónimo persistente (localStorage). Cada página declara su lugar
  en el embudo: `window.PD_TRACK={funnel,step}` (landing en index.html, gracias en gracias.html).
- **Resolución del paso:** el beacon manda `funnel`/`step` por slug; un **trigger en Postgres**
  (`events_resolve_step`) los mapea a los FKs `funnel_step_id`/`funnel_id` en el insert, así el
  endpoint queda tonto. Verificado e2e (deploy prod): pageview con `src=ad1-fomo` entró con
  país + fbp + session + `funnel_step` resuelto a `meta-ads-directo/landing`; beacon de otro
  origin rechazado. Fila de prueba borrada; `events` en 0 esperando tráfico real.
- Wireado en `index.html` y `gracias.html` (script antes de `</body>`).

### `campanas.gasto_usd` — sync automático desde Meta (✅ LIVE 2026-07-03)
- **Script** `ads-agent/meta-spend-sync.mjs` — complemento de `hotmart-sync.mjs`: ese trae las
  VENTAS, éste el GASTO. Trae los insights por anuncio (Marketing API v21.0), extrae la matrícula
  `src` (`adN-angulo`) del nombre del **conjunto o anuncio** en Meta, agrega por `src` y hace PATCH
  de `gasto_usd`/`impresiones`/`clics`/`ctr`/`frecuencia`/`ultimo_chequeo_en` en la ficha de
  `campanas` (solo esas columnas; no pisa config ni `decision`). Solo ACTUALIZA fichas existentes;
  si un anuncio de Meta no tiene ficha, lo reporta para que Mateo la registre. Flags: `--dry-run`,
  `--preset`. Sintaxis validada; falla con mensaje claro sin credenciales.
- **✅ Credencial RESUELTA (2026-07-03):** `META_ACCESS_TOKEN` (System User "Claude publisher",
  token permanente con `ads_read`/`ads_management`/`read_insights`) + `META_AD_ACCOUNT_ID`
  `act_583636631091469`. En `ads-agent/.env.local` (local) y en Vercel Production (para el cron).
  **Aprendizajes para no repetir:** (a) el `FB_PAGE_TOKEN` NO sirve (es de Página; `/me` = fanpage).
  (b) El token hay que generarlo eligiendo la **app del píxel** ("Periodistas digitales"), NO la app
  de WhatsApp ("Periodistas Digitales WP") — esa solo ofrece scopes de WhatsApp, sin `ads_read`.
  (c) Además de generar el token con `ads_read`, hay que **asignarle la cuenta publicitaria** al
  System User (Agregar activos), o Meta da error #200. El anuncio matchea aunque su `ad_name` en
  Meta sea genérico ("Nuevo anuncio de Ventas"): la matrícula vive en el nombre del **conjunto**.
- **✅ AUTOMATIZADO (cron diario):** módulo serverless `sistema-ingresos/api/_lib/meta-spend-sync.js`
  (`runMetaSpendSync()`), lo llama `api/recuperacion.js` en su corrida de las 15:00 UTC justo después
  de `runHotmartSync` (Hobby solo permite 2 crons → va pegado). Best-effort. 1ª corrida verificada:
  `ad1-fomo` → gasto $33.49 / 390 clics / CTR 7.99% en `campanas`; el cruce con `ventas` da
  **CPA curso $11.16 · ROAS 3.08** en vivo. El `.mjs` sigue para correr a mano (`--dry-run`/`--preset`);
  el write local necesita la `service_role` (el cron usa la de Vercel).

## Esquema propuesto (boceto, todavía NO creado en Supabase)

| Tabla | Para qué | Notas |
|---|---|---|
| `leads` ✅ | cada contacto capturado (email, teléfono, fuente, fecha, funnel de origen) | **creada 2026-07-03** — se llena desde Make (escenario `9474482` webhook instantáneo, antes 9433023) vía el endpoint `api/lead.js`; ver "Actualización (2026-07-03): tabla `leads`" arriba |
| `clientes_potenciales` ✅ | quien entró al checkout y NO compró (carrito abandonado / pago rechazado) | **creada 2026-07-02** — se llena desde el webhook de Hotmart; ver "Actualización (2026-07-02)" arriba |
| `customers` ✅ | quién compró al menos una vez | **creada 2026-07-03** — se llena desde el webhook (`saveCustomer`); ver "Actualización (2026-07-03): tabla `customers`" arriba |
| `products` ✅ | catálogo: Sistema de Ingresos Diarios ($27 con order bump/upsell/downsell), Leadr ($10/mes) | **creada 2026-07-03** — sembrada con 6 productos de Hotmart + Leadr Pro; cruza con `ventas.producto_id` |
| `ventas` ✅ (era `purchases`) | quién compró qué, cuándo, cuánto, con atribución por anuncio | **creada 2026-07-02** — se llena desde el webhook (`saveVenta`); ver "Actualización (2026-07-02): tabla `ventas`" arriba |
| `funnels` ✅ | definición de cada embudo (ver `ads-agent/dashboards/FUNNELS.html` para el mapa visual actual) | **creada 2026-07-03** — 2 embudos sembrados; `slug` legible, ej. `meta-leadgen-guia-claude` |
| `funnel_steps` ✅ | los pasos de cada funnel, en orden, con su URL/identificador | **creada 2026-07-03** — 18 pasos sembrados, espejo de los nodos de FUNNELS.html |
| `events` ✅ (vacía) | cada visita/click real, con URL, parámetro `sck`/UTM, a qué `funnel_step` corresponde, y `lead_id`/`customer_id` si ya se identificó a la persona | **creada 2026-07-03** — la tabla existe; falta "alimentarla" con el tracking (ver pendiente abajo) |
| `campanas` ✅ | catálogo de anuncios de ads + gasto/métricas de Meta; ata el gasto con las ventas por `src` | **creada 2026-07-03** (no estaba en el boceto original) — cruza por `src` para CPA/ROAS; ver "Actualización (2026-07-03): tabla `campanas`" arriba |

## Pendiente / no resuelto todavía

- ~~**Crear el proyecto de Supabase nuevo**~~ ✅ hecho 2026-07-02 (`periodistas-marketing`).
- ~~**Crear las tablas** del esquema de arriba (con SQL real).~~ ✅ **TODAS creadas 2026-07-03:** `clientes_potenciales`, `ventas`, `customers`, `leads`, `products`, `funnels`, `funnel_steps`, `events`.
- ~~**Cómo se llena `events` automáticamente**~~ ✅ hecho 2026-07-03 para la landing del curso (`track.js` + `api/event.js` + trigger). **Falta extenderlo a Leadr** (leadr.cloud) si se quiere trackear ese sitio también.
- ~~**Gasto de Meta en `campanas`**~~ ✅ LIVE 2026-07-03 (token `ads_read` + cuenta resueltos; cron diario en `recuperacion.js`). CPA/ROAS por anuncio ya se calculan cruzando con `ventas`.
- **Conectar Metabase**: una vez que la base y las tablas existan, dar de alta la conexión Postgres en Metabase con credenciales de solo lectura (no usar la `service_role` key para esto).
- Definir si `leads`/`events` se llenan en tiempo real (vía Make, como ya hacemos con Facebook Lead Ads) o en batch.

## Relación con lo ya construido

- El funnel "Meta Lead Ads + embudo de regalos" (Canal 2 en `ads-agent/dashboards/FUNNELS.html`) es el primer caso real que esta base debería trackear: Anuncio → Formulario → Regalo 1 (email) → Regalo 2 (email +48h, Brevo) → Regalo 3/4 (WhatsApp, pendiente de construir) → Oferta del curso → Checkout → Order Bump → Upsell → Downsell.
- El escenario de Make que capta el lead y dispara los regalos — desde el **2026-07-03** es `9474482` "Funnel Leads - Instantaneo (webhook)" (antes `9433023`, polling, hoy desactivado) — también inserta el lead en la tabla `leads` (módulo `/api/lead`). ✅ hecho.
