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
6. ⏳ **Para automatizar (cron diario) falta la `SUPABASE_SERVICE_ROLE_KEY`** en el entorno que
   corra el script. Vercel la tiene marcada "Sensitive" → `vercel env pull` la trae vacía. Opciones:
   (a) pegarla a mano en `ads-agent/.env.local`, o (b) —mejor— deployar el sync como **Vercel
   cron en sistema-ingresos**, donde esa key ya existe en runtime (habría que sumar las 3 vars
   de Hotmart a ese proyecto). El backfill de hoy no la necesitó (se hizo por conexión directa).

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

## Esquema propuesto (boceto, todavía NO creado en Supabase)

| Tabla | Para qué | Notas |
|---|---|---|
| `leads` | cada contacto capturado (email, teléfono, fuente, fecha, funnel de origen) | se llena desde Make (Facebook Lead Ads) y desde cualquier form futuro |
| `clientes_potenciales` ✅ | quien entró al checkout y NO compró (carrito abandonado / pago rechazado) | **creada 2026-07-02** — se llena desde el webhook de Hotmart; ver "Actualización (2026-07-02)" arriba |
| `customers` | quién compró al menos una vez | puede originarse de un `lead`, o entrar directo (ej. compra sin pasar por lead-gen) |
| `products` | catálogo: Sistema de Ingresos Diarios ($27 con order bump/upsell/downsell), Leadr ($10/mes) | |
| `ventas` ✅ (era `purchases`) | quién compró qué, cuándo, cuánto, con atribución por anuncio | **creada 2026-07-02** — se llena desde el webhook (`saveVenta`); ver "Actualización (2026-07-02): tabla `ventas`" arriba |
| `funnels` | definición de cada embudo (ver `ads-agent/dashboards/FUNNELS.html` para el mapa visual actual) | cada funnel tiene un `id` legible, ej. `meta-leadgen-guia-claude` |
| `funnel_steps` | los pasos de cada funnel, en orden, con su URL/identificador | espejo de los nodos del diagrama de FUNNELS.html |
| `events` | cada visita/click real, con URL, parámetro `sck`/UTM, a qué `funnel_step` corresponde, y `lead_id`/`customer_id` si ya se identificó a la persona | esta es la tabla que falta "alimentar" — ver pendiente abajo |

## Pendiente / no resuelto todavía

- ~~**Crear el proyecto de Supabase nuevo**~~ ✅ hecho 2026-07-02 (`periodistas-marketing`).
- **Crear las tablas** del esquema de arriba (con SQL real). ✅ `clientes_potenciales` y ✅ `ventas` ya creadas; faltan `leads`, `customers`, `products`, `funnels`, `funnel_steps`, `events`.
- **Cómo se llena `events` automáticamente**: hace falta un pixel/script de tracking en las landings (sistema-ingresos, leadr) que mande cada visita/click a esta base. Sin esto, la tabla de eventos queda vacía — es la pieza de instrumentación que falta diseñar.
- **Conectar Metabase**: una vez que la base y las tablas existan, dar de alta la conexión Postgres en Metabase con credenciales de solo lectura (no usar la `service_role` key para esto).
- Definir si `leads`/`events` se llenan en tiempo real (vía Make, como ya hacemos con Facebook Lead Ads) o en batch.

## Relación con lo ya construido

- El funnel "Meta Lead Ads + embudo de regalos" (Canal 2 en `ads-agent/dashboards/FUNNELS.html`) es el primer caso real que esta base debería trackear: Anuncio → Formulario → Regalo 1 (email) → Regalo 2 (email +48h, Brevo) → Regalo 3/4 (WhatsApp, pendiente de construir) → Oferta del curso → Checkout → Order Bump → Upsell → Downsell.
- El escenario de Make "Integration Facebook Lead Ads" (id `9433023`) ya captura el lead y dispara los regalos — cuando se cree la base nueva, ese mismo escenario debería agregar un paso más: insertar el lead en la tabla `leads`.
