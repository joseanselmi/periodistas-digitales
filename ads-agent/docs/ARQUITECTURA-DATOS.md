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

- **Script:** `ads-agent/scripts/datos/hotmart-sync.mjs` (Node ESM, usa `dotenv`). Autentica por OAuth
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
     serverless de `ads-agent/scripts/datos/hotmart-sync.mjs`. Reconcilia ventas (todos los productos,
     enriquecidas con USD+comprador) + captura pagos rechazados. Best-effort (si falla no frena
     la recuperación). Env de Hotmart cargadas en Vercel producción.
   - **Endpoint manual:** `api/hotmart-sync.js` (guard `CRON_SECRET`) para disparar/testear a mano.
   - **Probado en prod 2026-07-03:** 1ª corrida trajo 0 ventas nuevas (las 8 ya estaban) y capturó
     rechazos. ⚠️ **Bug encontrado y corregido:** dedupeaba rechazos por transacción → Nelson
     (9 intentos de tarjeta) generaba 9 filas = 9 WhatsApps. **Fix:** dedup por PERSONA (email),
     `dedup_key=rechazo:<email>`, y saltea a quien ya está en `clientes_potenciales` o ya compró
     (está en `ventas`). Re-corrida: 0 rechazos nuevos (idempotente). Filas duplicadas borradas.
   - **`ads-agent/scripts/datos/hotmart-sync.mjs`** sigue existiendo para correr el sync a mano desde la compu
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
`CANCELLED`, `EXPIRED`, `OVERDUE`. Se extendió `ads-agent/scripts/datos/hotmart-sync.mjs`: además de las
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
4. ⏳ E2E cuando se destrabe: `node scripts/datos/hotmart-sync.mjs --dry-run --solo-rechazos` (verifica que
   la API devuelva rechazos y confirma el mapeo/param `transaction_status`), luego sin
   `--dry-run`, y confirmar que el cron de recuperación le manda `recup_rechazo_1`.
5. 🔮 Para que "entren solos" a diario: dejar `scripts/datos/hotmart-sync.mjs` de cron (mismo cron que
   reconcilia ventas). Correrlo 1×/día antes del cron de recuperación de las 12:00 ART.

## Actualización (2026-07-02): motor de recuperación (tarjeta #34)

Construida la automatización que **recupera** las filas de `clientes_potenciales`
(lo que la #25 solo capturaba, ahora se acciona). Detalle completo y copy en
[sistema-ingresos/docs/RECUPERACION.md](../../sistema-ingresos/docs/RECUPERACION.md).

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
y copy en [sistema-ingresos/docs/RECUPERACION.md](../../sistema-ingresos/docs/RECUPERACION.md).

## Actualización (2026-07-03): tabla `customers` (compradores) + página de gracias (tarjeta #24)

Flujo post-compra del cliente (lo que pasa cuando alguien **COMPRA**, contracara de
`clientes_potenciales`). Detalle completo y copy en
[sistema-ingresos/docs/POST-COMPRA.md](../../sistema-ingresos/docs/POST-COMPRA.md).

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
- **Página de gracias** `/gracias` ([sistema-ingresos/paginas/gracias.html](../../sistema-ingresos/paginas/gracias.html),
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
  > — ver [ads-agent/docs/MONITOR-FUNNEL-LEADS.md](MONITOR-FUNNEL-LEADS.md) y tarjeta Trello #29.
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
6. ✅ **`es_periodista` forward-capture cableado (2026-07-03, tarjeta #38):** el form de FB
   tiene la pregunta sí/no "¿Eres periodista o trabajas en un medio de comunicación?".
   `api/lead.js` la lee de `body.periodista` y la convierte a booleano en la columna
   `es_periodista` (el form crudo entero queda en `payload`). El **módulo 5 del `9474482`**
   ahora reenvía ese campo. **OJO clave especial:** el nombre del campo en FB trae acentos y
   signos (`¿` … `?`), así que en el body del módulo 5 se referencia con la sintaxis de
   backticks de Make (property con caracteres especiales):

   ```
   "periodista":"{{first(1.data.`¿eres_periodista_o_trabajas_en_un_medio_de_comunicación?`)}}"
   ```

   El nombre exacto del campo salió del CSV de **FORMULARIOS INSTANTÁNEOS** de Meta (no del CSV
   del CRM/Centro de leads, que no trae las respuestas).
   Verificado el lado endpoint **E2E** (POST sintético `periodista=si` → `es_periodista=true`
   en la base real, fila borrada); el deploy ya estaba live. Falta solo confirmar con **1 lead
   orgánico real** (no se fuerza uno falso: re-emailearía a una persona real). Backfill
   histórico: 288 leads = 265 periodistas / 23 no. **Verificación automatizada (no depende de
   Jose):** rutina nube `trig_01Luaf3amWj4rhEE4MDaRTk7` "Verificar captura es_periodista (#38)"
   (cron `0 */3 * * *`, connectors Supabase+Make) chequea leads con `ocurrido_en >
   2026-07-03T08:38:00Z` y emailea a Jose por el Cartero cuando confirma (o si detecta falla
   silenciosa: entran leads pero todos con `es_periodista` null). Idempotente vía tabla nueva
   `ops_flags` (flag `es_periodista_fwd_38`) → avisa una sola vez. **Al llegar el mail de OK:
   mover #38 a Hecho y desactivar esa rutina** (no puede tocar Trello sola: no es connector en
   la nube + sandbox sin egress). La **campaña a periodistas** (subir el segmento limpio a Meta
   como Público Personalizado + Lookalike) se separó a la **tarjeta #43** (Mateo).

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
- **`funnels`** + **`funnel_steps`** — espejo del mapa `ads-agent/docs/dashboards/FUNNELS.html`.
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
- **Beacon** `sistema-ingresos/paginas/track.js` — script liviano en las landings. Manda un evento por
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
- **Script** `ads-agent/scripts/datos/meta-gasto-total-por-anuncio.mjs` (hasta el 07/08/2026 se llamaba
  `meta-spend-sync.mjs`) — complemento de `scripts/datos/hotmart-sync.mjs`: ese trae las
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
- **✅ AUTOMATIZADO (cron diario):** módulo serverless `sistema-ingresos/api/_lib/meta-gasto-total-por-anuncio.js`
  (`runMetaGastoTotalPorAnuncio()`), lo llama `api/recuperacion.js` en su corrida de las 15:00 UTC justo después
  de `runHotmartSync` (Hobby solo permite 2 crons → va pegado). Best-effort. 1ª corrida verificada:
  `ad1-fomo` → gasto $33.49 / 390 clics / CTR 7.99% en `campanas`; el cruce con `ventas` da
  **CPA curso $11.16 · ROAS 3.08** en vivo. El `.mjs` sigue para correr a mano (`--dry-run`/`--preset`);
  el write local necesita la `service_role` (el cron usa la de Vercel).

## Actualización (2026-07-03): contabilidad — tabla `gastos` + P&L + página en Leadr

Motivo: Jose pidió "la contabilidad de la empresa" — saber cuánto gasta por mes en
cada cosa y **cruzarlo con las ventas** para ver la ganancia neta, y **que se vea en
Leadr**. Modelo que pidió: él **configura los gastos FIJOS** (se repiten cada mes) y
**el sistema consulta y carga solos los VARIABLES** desde las fuentes reales.

- **Tabla `gastos`** (creada 2026-07-03, migración `crear_tabla_gastos`) en
  `periodistas-marketing` (misma base que ventas/campanas → todo el P&L en un solo
  lugar, Metabase-ready). Columnas: `servicio`, `categoria`
  (IA/Infraestructura/Publicidad/Herramientas/Otros), `tipo` (`fijo`|`variable`),
  `fuente` (`manual`|`auto:hotmart`|`auto:meta`), `monto`, `moneda`, `mes` (1er día),
  `recurrente`, `notas`. RLS activo sin políticas; `unique(servicio, mes)`; trigger
  `updated_at`. Sembrada con la lista de servicios (fijos en $0 con notas para que Jose
  configure; los confirmados gratis marcados: Vercel Hobby, Supabase Free).
- **Vistas de cálculo** (migración `crear_vistas_pnl`):
  - `v_ingresos_mes` — ventas brutas (USD) por mes desde `ventas` (el ingreso del P&L
    es el BRUTO; la comisión de Hotmart se cuenta como gasto, no se descuenta acá).
  - `v_gastos_variables_mes` — **automáticos, no se cargan a mano:** Comisión Hotmart
    (`sum(valor_usd - comision_usd)` por mes) + Meta Ads (**gasto a nivel cuenta por mes
    calendario** desde `gastos_meta_mensual` — ver Fix 03/07 abajo).
  - `v_pnl_mensual` — **ganancia neta** = ingresos brutos − (gastos variables auto +
    variables-manuales) − gastos fijos, por mes.
  - **Verificado con datos reales (03/07):** Julio → ingresos $120.01 (7 ventas) −
    Hotmart $18.24 − Meta Ads $33.49 − fijos $0 = **ganancia $68.28**. Junio → $2.43.
  - **Fix Meta Ads (03/07, Jose):** la línea Meta Ads sumaba `campanas.gasto_usd` = solo
    ads **registrados** + gasto **lifetime** → perdía campañas (interacción, LEADGEN) y no
    era del mes. Ahora tabla **`gastos_meta_mensual(mes, spend_usd)`** poblada a **nivel
    cuenta** (Meta `insights level=account time_increment=monthly` = TODAS las campañas, mes
    calendario; backfill dic-2024→jul-2026); `v_gastos_variables_mes` lee de ahí. Sync
    continuo: `fetchGastoMensual`/`upsertGastoMensual` en `_lib/meta-gasto-total-por-anuncio.js` (cron
    recuperación). `campanas` se queda para CPA/ROAS por anuncio. Efecto: julio Meta
    $33.49 → **$36.27** (real). Ciclo Meta = mes calendario (Make, en cambio, factura 6→6).
- **Página en Leadr (`/admin/costos`, ahora "Contabilidad"):** ya existía como CRUD de
  la tabla `costs` de la base de Leadr (vacía, solo gastos, sin ventas). Se **reapuntó a
  la base de marketing** (`gastos` + vistas) y se le sumó el **panel de ganancia neta**
  (ingresos, gastos, margen) + sección de **variables automáticos** (solo lectura) +
  fijos/manuales editables con tipo fijo/variable. La tabla `costs` de la base de Leadr
  queda **deprecada** (no se borró; la página ya no la usa).
  - **Trabajo en `../Leadr`** (repo separado): `app/lib/supabase/marketing.ts` (cliente
    service-role a la base de marketing), `app/app/api/admin/costs/route.ts` +
    `[id]/route.ts` (auth sigue en la base de Leadr; datos en marketing; **arrastre de
    fijos**: al abrir un mes nuevo, los recurrentes se materializan copiando el último
    valor — fijos repiten monto, variables-manuales arrancan en 0), `app/app/admin/costos/
    costos-client.tsx` (UI nueva), `admin-sidebar.tsx` (label → "Contabilidad").
  - **Go-live pendiente (Leadr):** faltan 2 env vars en el Vercel de Leadr (proyecto
    `leadr`): `MARKETING_SUPABASE_URL` = `https://wxyimqkjlwfncvzozpjy.supabase.co` y
    `MARKETING_SUPABASE_SERVICE_ROLE_KEY` (la service_role de la base de marketing, la
    misma que usa el Vercel del curso). Después, deploy de leadr.cloud. `Leadr/app` no
    tiene `node_modules` local → el build corre en el pipeline de Vercel.

- **Gasto de mensajería DESGLOSADO POR AUTOMATIZACIÓN** (pedido de Jose: "sumar los
  gastos variables de las automatizaciones, dentro de cada una lo que se gasta en msj"):
  - **Tabla `mensajes`** (migración `crear_tabla_mensajes`) + vista `v_gastos_mensajes_mes`:
    un registro por mensaje de WhatsApp con `automatizacion`, `pais`, `categoria_meta`,
    `conversacion_key` (dedup a conversación 24h) y `costo_estimado_usd`. La vista dedupe a
    conversaciones y suma el costo **por automatización por mes**. `v_gastos_variables_mes`
    ahora la UNIONa → cada automatización aparece como línea `Mensajes · <automatizacion>`
    en los variables del P&L (entra sola a `v_pnl_mensual`).
  - **Costeo:** Meta cobra por **conversación de 24h**, no por mensaje, y el precio varía por
    país. Se **estima** con una tabla de tarifas embebida en `api/_lib/wa.js`
    (`RATE_MARKETING` por país × `CATEGORY_FACTOR` marketing/utility/service) — se
    **reconcilia** con la factura real de WhatsApp. `service` (texto libre en ventana 24h del
    puente) = gratis pero se registra para volumen.
  - **Instrumentación (curso, `sistema-ingresos/api`):** `_lib/wa.js` gana `logMensaje()`
    (best-effort, escribe a `/rest/v1/mensajes` con la service_role que ya tiene el curso) y
    lo llaman: `sendRecupTemplate` → `automatizacion='recuperacion'` (utility),
    `sendText` → `'puente'` (service, gratis), y `wa-funnel.js` `sendTemplate` →
    `'funnel-regalos'` (marketing). Sintaxis validada con `node --check`.
  - **Go-live pendiente (curso):** deploy de sistemadeingresosdiariosia.com (`vercel --prod`)
    para que los envíos empiecen a registrarse. Los datos son de acá en adelante (no hay
    backfill; se puede estimar histórico con el `conversation_analytics`/`template_analytics`
    de Meta más adelante si hace falta).

### Gastos FIJOS automáticos — buzón de facturas (tarjeta #46, 2026-07-03)

Cierra el círculo: los variables ya entran solos; ahora los **fijos** también, desde
las **facturas reales**, sin que Jose tipee montos.

- **Circuito:** proveedores facturan a `gastos@leadr.cloud` (casilla Hostinger) →
  reenvía a `joseanselmi27@gmail.com` → **rutina de nube semanal**
  (`trig_019crWyCPfrzbGpQgUqgs41J`, cron `34 12 * * 1`, lunes) lee SOLO
  `to:gastos@leadr.cloud` por Gmail MCP → extrae servicio+monto+mes con IA → **upsert
  en `gastos`** (`fuente='auto:factura'`, idempotente por `UNIQUE (servicio, mes)`) →
  avisa a Jose por el buzón **Cartero** solo si hubo factura nueva/cambiada. Ignora
  Meta Ads / WhatsApp (ya se cargan por otra vía → evita duplicar).
- **Constraint:** se agregó `auto:factura` a `gastos_fuente_check` (migración
  `gastos_fuente_agregar_auto_factura`).
- **Detalle completo + prompt de la rutina + mapeo proveedor→servicio:** ver
  `ads-agent/docs/CONTABILIDAD-BUZON-FACTURAS.md`.
- **Depende de Jose (manual):** activar el reenvío en Hostinger + poner `gastos@` como
  email de facturación en cada proveedor. Hasta entonces la rutina corre y reporta
  "0 facturas".

## Actualización (2026-07-03): tabla `agentes_estado` (Panel de Comando de la nube, tarjeta #32)

**Problema:** el "Panel de Comando" corre en una sesión de la nube que **no clona el repo**,
así que no podía leer `ads-agent/state/*.json` y el mail diario salía sin los datos de los
agentes (confirmado que fallaba también en la corrida programada, no solo on-demand).

**Solución (Plan B):** la nube lee los estados de una tabla por MCP de Supabase (mismo
camino que la sección Ventas, que sí funciona en la nube).

- **Tabla `agentes_estado`** — espejo en la base de los `ads-agent/state/*.json`.
  - `agente` (text, PK) = nombre del archivo sin `-state.json` (sofia, mateo, clara…).
  - `estado` (jsonb) = el JSON completo del state de ese agente.
  - `actualizado_en` (timestamptz) = cuándo el sync escribió la fila (qué tan fresco está).
  - RLS **enabled** (sin políticas): la escribe el service_role de Vercel y la lee el MCP.
- **Cómo se llena:** `sistema-ingresos/api/_lib/sync-estados.js` (`runSyncEstados`) lista los
  `*-state.json` del **GitHub público** (contents API, con fallback a lista fija), baja cada
  uno por `raw.githubusercontent` y hace UPSERT por `agente`. Corre **1×/día colgado del cron
  `recuperacion`** (15:00 UTC), igual que `runHotmartSync`/`runMetaGastoTotalPorAnuncio` — sin cron
  propio (tope del plan Hobby). Endpoint manual: `GET /api/sync-estados?key=<CRON_SECRET>`.
- **Freshness:** el mail muestra el **último push** del repo. El detalle en vivo sigue en el
  `/rutina` **local**. `bruno`/`miguel` aún no se pushean → el sync trae 11 de 13; esos dos
  quedan con el último valor sembrado a mano hasta que se commiteen.
- **Prompt de la rutina** (`trig_012j4zUuq56FyGnpUoVsXxci`): PASO 1 pasó de `Glob` de archivos
  a `SELECT agente, estado, actualizado_en FROM agentes_estado`. Ver
  `ads-agent/docs/NOTIFICACIONES-CARTERO.md`.

## Esquema propuesto (boceto, todavía NO creado en Supabase)

| Tabla | Para qué | Notas |
|---|---|---|
| `leads` ✅ | cada contacto capturado (email, teléfono, fuente, fecha, funnel de origen) | **creada 2026-07-03** — se llena desde Make (escenario `9474482` webhook instantáneo, antes 9433023) vía el endpoint `api/lead.js`; ver "Actualización (2026-07-03): tabla `leads`" arriba |
| `clientes_potenciales` ✅ | quien entró al checkout y NO compró (carrito abandonado / pago rechazado) | **creada 2026-07-02** — se llena desde el webhook de Hotmart; ver "Actualización (2026-07-02)" arriba |
| `customers` ✅ | quién compró al menos una vez | **creada 2026-07-03** — se llena desde el webhook (`saveCustomer`); ver "Actualización (2026-07-03): tabla `customers`" arriba |
| `products` ✅ | catálogo: Sistema de Ingresos Diarios ($27 con order bump/upsell/downsell), Leadr ($10/mes) | **creada 2026-07-03** — sembrada con 6 productos de Hotmart + Leadr Pro; cruza con `ventas.producto_id` |
| `ventas` ✅ (era `purchases`) | quién compró qué, cuándo, cuánto, con atribución por anuncio | **creada 2026-07-02** — se llena desde el webhook (`saveVenta`); ver "Actualización (2026-07-02): tabla `ventas`" arriba |
| `funnels` ✅ | definición de cada embudo (ver `ads-agent/docs/dashboards/FUNNELS.html` para el mapa visual actual) | **creada 2026-07-03** — 2 embudos sembrados; `slug` legible, ej. `meta-leadgen-guia-claude` |
| `funnel_steps` ✅ | los pasos de cada funnel, en orden, con su URL/identificador | **creada 2026-07-03** — 18 pasos sembrados, espejo de los nodos de FUNNELS.html |
| `events` ✅ (vacía) | cada visita/click real, con URL, parámetro `sck`/UTM, a qué `funnel_step` corresponde, y `lead_id`/`customer_id` si ya se identificó a la persona | **creada 2026-07-03** — la tabla existe; falta "alimentarla" con el tracking (ver pendiente abajo) |
| `campanas` ✅ | catálogo de anuncios de ads + gasto/métricas de Meta; ata el gasto con las ventas por `src` | **creada 2026-07-03** (no estaba en el boceto original) — cruza por `src` para CPA/ROAS; ver "Actualización (2026-07-03): tabla `campanas`" arriba |

## Actualización (2026-07-05): atribución de upsells post-compra de Hotmart (tarjeta #60, PENDIENTE)

**Hallazgo (verificado contra la API de Hotmart, no asumido):** el **recomendador POST-COMPRA
de Hotmart** ("también te puede interesar", tras concretar una compra) vende productos extra a
un comprador que entró por un anuncio, pero esas ventas **entran con `src` = null** ("sin
anuncio"). A diferencia de los **order bumps** del checkout (que SÍ heredan el `src` del
anuncio), el recomendador genera **transacciones nuevas sin tracking**. Caso real: Mariano
Rodríguez entró por `ad1-fomo`, compró el curso (src=ad1-fomo) y en el post-compra agregó
"Máquina de Dinero" + "Método Espalda Fuerte" (ambas src=null, mismo día). Resultado: esas 2
ventas figuran "sin anuncio" y **subvalúan a `ad1-fomo`** (su ROAS real es mayor).

**Solución elegida (pendiente de construir — bloqueada por acceso a Supabase):** una vista
**`v_ventas_atribuidas`** con una columna `src_atribuido = coalesce(src, <src de otra venta
del MISMO email que tenga src, dentro de ±7 días>)`. Regla: solo se atribuye si el comprador
tiene una venta con `src` real cercana; si no, queda "sin anuncio" **genuino** (orgánico /
directo de Hotmart, como la "Sala VIP IA" de Juan Manuel Arienti, que no vino por ningún
anuncio). Después, apuntar el cálculo de CPA/ROAS por anuncio de **Mateo y Dante** a
`src_atribuido` en vez de `src`, para que el anuncio cobre el crédito completo de lo que trajo.
No muta `ventas` (el `src` crudo se conserva); la atribución vive en la vista. Detalle operativo
en la tarjeta Trello #60.

## Pendiente / no resuelto todavía

- ~~**Crear el proyecto de Supabase nuevo**~~ ✅ hecho 2026-07-02 (`periodistas-marketing`).
- ~~**Crear las tablas** del esquema de arriba (con SQL real).~~ ✅ **TODAS creadas 2026-07-03:** `clientes_potenciales`, `ventas`, `customers`, `leads`, `products`, `funnels`, `funnel_steps`, `events`.
- ~~**Cómo se llena `events` automáticamente**~~ ✅ hecho 2026-07-03 para la landing del curso (`track.js` + `api/event.js` + trigger). **Falta extenderlo a Leadr** (leadr.cloud) si se quiere trackear ese sitio también.
- ~~**Gasto de Meta en `campanas`**~~ ✅ LIVE 2026-07-03 (token `ads_read` + cuenta resueltos; cron diario en `recuperacion.js`). CPA/ROAS por anuncio ya se calculan cruzando con `ventas`.
- **Conectar Metabase**: una vez que la base y las tablas existan, dar de alta la conexión Postgres en Metabase con credenciales de solo lectura (no usar la `service_role` key para esto).
- Definir si `leads`/`events` se llenan en tiempo real (vía Make, como ya hacemos con Facebook Lead Ads) o en batch.

## Relación con lo ya construido

- El funnel "Meta Lead Ads + embudo de regalos" (Canal 2 en `ads-agent/docs/dashboards/FUNNELS.html`) es el primer caso real que esta base debería trackear: Anuncio → Formulario → Regalo 1 (email) → Regalo 2 (email +48h, Brevo) → Regalo 3/4 (WhatsApp, pendiente de construir) → Oferta del curso → Checkout → Order Bump → Upsell → Downsell.
- El escenario de Make que capta el lead y dispara los regalos — desde el **2026-07-03** es `9474482` "Funnel Leads - Instantaneo (webhook)" (antes `9433023`, polling, hoy desactivado) — también inserta el lead en la tabla `leads` (módulo `/api/lead`). ✅ hecho.

## Actualización (2026-07-16): tabla `brevo_stats` (foto de stats de email)

Motivo: el Panel de Comando diario (rutina de nube) mostraba las estadísticas de email de
Brevo (enviados/aperturas/suscriptores) **congeladas desde el 06/07** — el mismo número todos
los días. Causa raíz: esas stats venían del Data Store de Make `169011`, que alimentaba el
escenario Make `9451536` "Brevo Stats Snapshot"; ese escenario quedó pausado porque **Make free
solo permite 2 escenarios activos** y los 2 slots están ocupados por los críticos (Cartero
`9470203` + Funnel Leads `9474482`). No se puede activar un 3ro ni correrlo on-demand
("Scenario is not activated"). Ver tarjeta Trello #31 (Pagar Make Pro) y #78.

- **Tabla `brevo_stats`** (migración `create_brevo_stats`, base `periodistas-marketing`): una sola
  fila, `key='latest'`. Columnas: `delivered`, `unique_opens`, `opens`, `clicks`, `unique_clicks`,
  `hard_bounces`, `requests`, `subscribers`, `rango` (texto, ej `2026-07-10|2026-07-17`),
  `updated_at`. Es la foto de los últimos 7 días de Brevo (aggregatedReport) + tamaño de la lista 5.
- **Quién la escribe:** `sistema-ingresos/api/salud.js` → `snapshotBrevo()` (llamada al tope de
  `enviarPanelSalud`, best-effort). Corre en **Vercel** (que SÍ alcanza Brevo; el sandbox de las
  rutinas de nube da 403) colgado del cron `recuperacion` (15:00 UTC), 1×/día. UPSERT por REST con
  `Prefer: resolution=merge-duplicates`.
- **Quién la lee:** el Panel de Comando (rutina `trig_012j4z...`, PASO 2) por `execute_sql`
  (`SELECT ... FROM brevo_stats WHERE key='latest'`). Ya NO usa el Data Store de Make 169011.
- **Por qué así:** saca la dependencia del cupo de escenarios de Make. Si algún día se paga Make
  Pro se podría volver al snapshot nativo, pero esto es más robusto (una pieza menos que se pausa).

Verificado E2E 16/07: la tabla quedó con 579 subscribers (vs 363 congelado), 23.7% de apertura,
rango 10-17/07. Detalle: memorias `project_rutina_diaria_email` y `project_salud_sitio_qa`.

## Actualización (2026-08-02): `meta_gasto_diario` se sincroniza sola (los TRES syncs de Meta)

Hay **tres** syncs de Meta y cada uno cubre algo distinto. Confundirlos hace mirar una
tabla que nadie está llenando:

| Sync | Escribe | Alcance |
|---|---|---|
| `_lib/meta-gasto-total-por-anuncio.js` | `campanas`, `gastos_meta_mensual` | solo anuncios **con ficha** en `campanas`, gasto acumulado (sin abrir por día) |
| `_lib/meta-embudo-diario-por-anuncio.js` | `meta_insights_diario` | solo los que tienen matrícula `adN-angulo`, día por día y con el embudo completo |
| `_lib/meta-gasto-diario-toda-la-cuenta.js` | `meta_gasto_diario` | **la cuenta entera**, por campaña y por día |

> **Se renombraron el 07/08/2026.** Antes eran `meta-spend-sync`, `meta-daily-sync` y
> `meta-gasto-sync` — "spend" y "gasto" son la misma palabra en dos idiomas, y estaban
> uno al lado del otro haciendo cosas distintas. El nombre viejo de cada uno y el motivo
> del cambio están en
> [`ads-agent/scripts/datos/README.md`](../scripts/datos/README.md). Los `.mjs` locales
> llevan exactamente los mismos nombres que estos `.js` de la nube.

Los tres cuelgan del cron `recuperacion` (15:00 UTC, 1×/día) y son best-effort: si uno
falla, loguea y no frena a los otros ni a la recuperación de carritos.

**Por qué se agregó el tercero al cron.** `meta_gasto_diario` es la tabla que lee el panel
de campañas de Leadr (`/admin/campanas`) para mostrar gasto y costo por lead, y hasta ahora
se llenaba **solo a mano** con `ads-agent/scripts/datos/meta-gasto-diario-toda-la-cuenta.mjs`. Nadie se
acuerda de correr un script a mano: quedó congelada en la foto parcial del **31/07 a las
22:55**, y el 02/08 el panel mostraba **$0,52 de gasto y $0,009 por lead** cuando lo real
era **$1,86 y $0,032**. Un número viejo se ve igual que uno fresco — de ahí que tenga que
correr solo.

**El script `.mjs` sigue existiendo** para corridas manuales y para el histórico largo
(`--dias 400`); la función de Vercel sincroniza los últimos 30 días (`META_GASTO_DIAS`),
que es lo que mira el panel.

⚠️ **Trampa de credenciales del script local.** `ads-agent/.env.local` tiene la URL de
`periodistas-marketing` pero **no** su `service_role`, así que el script seguía buscando en
las otras rutas y terminaba tomando la clave de `Leadr/app/.env.local`, que es de **otro
proyecto** (`ovwlsnnhiuoxoazyrhvt`). Resultado: `401 Invalid API key` recién al final,
después de bajar todo de Meta, sin ninguna pista de la causa. Ahora el script compara el
`ref` que viene dentro del JWT contra la URL y avisa antes de escribir nada. En Vercel esto
no pasa: ahí `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son las dos de marketing.
