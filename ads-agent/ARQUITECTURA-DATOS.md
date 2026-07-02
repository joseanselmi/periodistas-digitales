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
6. ⚠️ **Las 3 ventas del 30/06–02/07 NO quedan retroactivas** en la tabla (no hay acceso a
   Hotmart para backfill). La tabla captura de la próxima venta en adelante. Si hace falta,
   se pueden cargar a mano con los datos de Hotmart.

**Nota de naming:** el esquema propuesto abajo listaba esta tabla como `purchases` (inglés),
pero se creó como `ventas` (español) para ser consistente con `clientes_potenciales` y que
Jose la lea fácil en Metabase. Mismo criterio a futuro para el resto.

## Actualización (2026-07-02): motor de recuperación (tarjeta #34)

Construida la automatización que **recupera** las filas de `clientes_potenciales`
(lo que la #25 solo capturaba, ahora se acciona). Detalle completo y copy en
[sistema-ingresos/RECUPERACION.md](../sistema-ingresos/RECUPERACION.md).

- **Disparador (decisión base de la #34):** un motor propio en **Vercel Cron**
  (`sistema-ingresos/api/recuperacion.js`) que consulta Supabase cada 6 h — **no**
  Make ni disparar desde el webhook de Hotmart. Motivo: una secuencia de recuperación
  es una cadencia con delays (+1h/+24h/+72h) → necesita un poller con estado igual, y
  ya existe ese molde probado y entendido (`api/wa-funnel.js`). Reutilizarlo es más
  barato y mantenible que meter la lógica en una UI de Make.
- **Dos secuencias por `tipo`:** `carrito_abandonado` (3 emails +1h/+24h/+72h) y
  `pago_rechazado` (2 emails +1h/+24h). Canal v1: **email por Brevo**. WhatsApp queda
  para fase 2 (requiere plantilla aprobada por Meta).
- **Columnas nuevas en `clientes_potenciales`** (migración `recuperacion_agrega_paso_y_ultimo_contacto`):
  `paso_recuperacion` (int, cuántos emails se mandaron) y `ultimo_contacto_en` (timestamptz).
  Máquina de estados: `estado_recuperacion` = pendiente → contactado → recuperado | perdido.
- **Anti-acoso + medición:** antes de cada envío cruza el email con la tabla `ventas`;
  si ya compró → `recuperado` y se corta la secuencia (esto además mide cuántos se
  recuperan). El link de cada email vuelve a la landing con `?src=recup-abandono` /
  `?src=recup-rechazo`, así la venta recuperada queda atribuida en `ventas`.
- **Interruptor:** no manda nada hasta `RECUP_ENABLED=1` en Vercel (igual que
  `WA_FUNNEL_ENABLED`). El cron corre en modo dry mientras esté apagado.

**Estado:** ✅ motor + migración + cron listos y probados en dry (lógica validada contra
la fila real de Juan Aguilera). ⏳ Go-live pendiente de aprobación de Jose (OK al copy →
deploy → `?mode=dry` en prod → `RECUP_ENABLED=1`).

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
