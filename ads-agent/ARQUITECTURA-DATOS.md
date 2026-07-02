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
3. ⏳ **Falta (Jose, en Hotmart):** habilitar los eventos de carrito abandonado y de compra cancelada/vencida/rechazada en la config del webhook del curso (por defecto puede estar activada solo la compra aprobada). Hasta eso, no entran carritos reales. Cuando lleguen los primeros, confirmar el mapeo de eventos contra el `raw payload` real (logs de Vercel).
4. ⚠️ **Código en prod pero SIN commitear a git:** los cambios de `sistema-ingresos/api/hotmart.js` y este doc se deployaron desde local; el repo todavía no los tiene versionados. Commitear para que git no quede atrasado de producción.

## Esquema propuesto (boceto, todavía NO creado en Supabase)

| Tabla | Para qué | Notas |
|---|---|---|
| `leads` | cada contacto capturado (email, teléfono, fuente, fecha, funnel de origen) | se llena desde Make (Facebook Lead Ads) y desde cualquier form futuro |
| `clientes_potenciales` ✅ | quien entró al checkout y NO compró (carrito abandonado / pago rechazado) | **creada 2026-07-02** — se llena desde el webhook de Hotmart; ver "Actualización (2026-07-02)" arriba |
| `customers` | quién compró al menos una vez | puede originarse de un `lead`, o entrar directo (ej. compra sin pasar por lead-gen) |
| `products` | catálogo: Sistema de Ingresos Diarios ($27 con order bump/upsell/downsell), Leadr ($10/mes) | |
| `purchases` | quién compró qué, cuándo, cuánto, vía qué plataforma (Hotmart) | |
| `funnels` | definición de cada embudo (ver `ads-agent/dashboards/FUNNELS.html` para el mapa visual actual) | cada funnel tiene un `id` legible, ej. `meta-leadgen-guia-claude` |
| `funnel_steps` | los pasos de cada funnel, en orden, con su URL/identificador | espejo de los nodos del diagrama de FUNNELS.html |
| `events` | cada visita/click real, con URL, parámetro `sck`/UTM, a qué `funnel_step` corresponde, y `lead_id`/`customer_id` si ya se identificó a la persona | esta es la tabla que falta "alimentar" — ver pendiente abajo |

## Pendiente / no resuelto todavía

- ~~**Crear el proyecto de Supabase nuevo**~~ ✅ hecho 2026-07-02 (`periodistas-marketing`).
- **Crear las tablas** del esquema de arriba (con SQL real). ✅ `clientes_potenciales` ya creada; faltan `leads`, `customers`, `products`, `purchases`, `funnels`, `funnel_steps`, `events`.
- **Cómo se llena `events` automáticamente**: hace falta un pixel/script de tracking en las landings (sistema-ingresos, leadr) que mande cada visita/click a esta base. Sin esto, la tabla de eventos queda vacía — es la pieza de instrumentación que falta diseñar.
- **Conectar Metabase**: una vez que la base y las tablas existan, dar de alta la conexión Postgres en Metabase con credenciales de solo lectura (no usar la `service_role` key para esto).
- Definir si `leads`/`events` se llenan en tiempo real (vía Make, como ya hacemos con Facebook Lead Ads) o en batch.

## Relación con lo ya construido

- El funnel "Meta Lead Ads + embudo de regalos" (Canal 2 en `ads-agent/dashboards/FUNNELS.html`) es el primer caso real que esta base debería trackear: Anuncio → Formulario → Regalo 1 (email) → Regalo 2 (email +48h, Brevo) → Regalo 3/4 (WhatsApp, pendiente de construir) → Oferta del curso → Checkout → Order Bump → Upsell → Downsell.
- El escenario de Make "Integration Facebook Lead Ads" (id `9433023`) ya captura el lead y dispara los regalos — cuando se cree la base nueva, ese mismo escenario debería agregar un paso más: insertar el lead en la tabla `leads`.
