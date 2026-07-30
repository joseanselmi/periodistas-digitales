# Flujo post-compra del cliente (tarjeta Trello #24)

Qué pasa cuando alguien **COMPRA** el curso (distinto de #25/#34, que modelan a los
que NO compran). Documento vivo — Jose no es técnico, acá queda el estado real para
cualquier sesión futura.

Tres piezas:
1. **Página de gracias** post-checkout (`/gracias`) — con la identidad de la landing.
2. **Alta como `customer`** en la base de marketing (tabla nueva, cruza con #6).
3. **Canal de Telegram** — bloque listo en la página pero apagado (el canal todavía no existe).

---

## 1. Página de gracias — `/gracias`

- **Archivo:** [gracias.html](gracias.html). Servida en `https://sistemadeingresosdiariosia.com/gracias`
  (rewrite `/gracias → /gracias.html` en [vercel.json](vercel.json); también responde `/gracias.html`).
- **Identidad:** reusa exactamente los tokens de la landing (`index.html`): mismas fuentes
  (Space Grotesk + DM Sans), misma paleta (`--bg #000`, `--indigo #6366f1`, `--cyan #22d3ee`,
  `--green #22c55e`), mismo nav (punto que pulsa + "Periodistas Digitales") y mismo footer.
- **Contenido:** confirmación de pago + 3 próximos pasos:
  1. Revisá tu correo (Hotmart mandó el acceso al curso).
  2. Activá tu mes gratis de Leadr Pro (entrando a leadr.cloud con el email de compra).
  3. Sumate a la comunidad de Telegram → **apagado por ahora** (ver punto 3).
- **`noindex`:** la página lleva `<meta name="robots" content="noindex,nofollow">` (es una
  confirmación privada, no debe aparecer en Google).
- **Meta Pixel:** dispara **solo `PageView`**. NO dispara `Purchase` del lado del navegador
  **a propósito**: la conversión `Purchase` la manda el webhook por la Conversions API
  (server-side) con el máximo de PII + `event_id = transacción`. Duplicarla en el cliente
  sin ese `event_id` inflaría las compras en Meta. La atribución por anuncio ya viaja por
  el `?src=` del checkout (ver [TRACKING.md](TRACKING.md)).

### Pendiente de Jose (config en el panel de Hotmart)
Para que el comprador **llegue** a esta página hay que configurar la redirección post-compra
en Hotmart → producto "Sistema de Ingresos Diarios" → Configuración de compra / Página de
agradecimiento → URL propia: `https://sistemadeingresosdiariosia.com/gracias`.
Hasta que se configure, Hotmart muestra su propia página genérica (el alta del customer y el
bono de Leadr funcionan igual, porque van por el webhook, no por la página).

---

## 2. Alta del comprador como `customer`

- **Tabla `customers`** en Supabase `periodistas-marketing` (migración `crear_tabla_customers`).
  **Una fila por PERSONA** que compró al menos una vez (clave: `email`). Es la contracara de
  `clientes_potenciales` (los que NO compraron). El detalle por transacción (cuánto, atribución
  completa) sigue en `ventas`; `customers` guarda la **identidad** + el **estado de los flujos
  post-compra**.
  - Columnas: `email` (unique), `nombre`, `telefono`, `pais`/`ciudad`/`provincia`/`codigo_postal`/`documento`,
    `primera_compra_en` (fija en el insert), `ultima_compra_en`, `ultimo_producto`, `ultimo_src`,
    `leadr_bono_otorgado`, **`telegram_estado`** (`pendiente`|`invitado`|`unido`|`baja`), `origen`.
  - RLS activo sin políticas (solo el webhook escribe con `service_role`; Metabase leerá con
    rol de solo-lectura). Mismo criterio que `ventas`/`clientes_potenciales`.
- **Webhook** [api/hotmart.js](api/hotmart.js) → función `saveCustomer()`, llamada en la rama
  de compra aprobada (después de Meta CAPI + bono Leadr + `saveVenta`). Best-effort: si Supabase
  falla, loguea y devuelve 200 igual (no rompe el pago ni el bono).
  - **Idempotente por email** (`on_conflict=email`, `merge-duplicates`): una 2ª compra actualiza
    la MISMA fila. `primera_compra_en` **no se reenvía** en el upsert → queda fija del insert.
    `telegram_estado` **no lo toca el webhook** → lo maneja el flujo de Telegram. `leadr_bono_otorgado`
    solo se setea en `true` (nunca se pisa `true→false` si una 2ª compra no re-otorga el bono).
  - Validado contra la tabla real (insert 1ª compra + upsert 2ª compra) antes de deployar:
    `primera_compra_en` se preserva, `ultima_compra_en`/`ultimo_producto`/`ultimo_src` se actualizan,
    `telegram_estado` queda en `pendiente`.

---

## 3. Canal de Telegram — apagado hasta que exista

**Decisión de Jose (2026-07-03):** el canal de Telegram **todavía no existe**. La página de
gracias ya trae el bloque (paso 3) construido pero **apagado**:

- En [gracias.html](gracias.html) hay una constante `const TELEGRAM_INVITE = "";`.
  - **Vacía** → se muestra el estado "Canal lleno por ahora — te avisamos por email cuando lo
    reabramos próximamente" (gancho de escasez, sin dejar un link roto).
  - **Con un link** `t.me/...` → el botón "Unirme al canal de Telegram" se enciende solo y el
    aviso de "muy pronto" desaparece.
- **Para activarlo (cuando el canal exista):** crear el canal, sacar su link de invitación y
  pegarlo en esa constante. Es el ÚNICO cambio necesario; después `vercel --prod`.
- **Mecánica elegida para v1:** link de invitación **fijo** (el mismo para todos). El link
  **único por comprador** (bot que genera un link de un solo uso por compra) queda para una v2
  si hace falta control de acceso.
- **Columna lista para el futuro:** `customers.telegram_estado` permite trackear quién entró
  (`pendiente → invitado → unido`) cuando se automatice el ingreso.

---

## Estado (2026-07-03)

| Paso | Estado |
|---|---|
| Copy + diseño de la página de gracias | ✅ hecho (respeta la identidad de la landing) |
| Publicar `/gracias` | ✅ LIVE (deploy prod, responde 200) |
| Redirección post-compra en Hotmart | ⏳ **pendiente de Jose** (config en el panel de Hotmart) |
| Mecánica de Telegram + CTA | 🟡 CTA construido y apagado; se enciende con `TELEGRAM_INVITE` cuando exista el canal |
| Alta del `customer` desde el webhook | ✅ LIVE (tabla `customers` + `saveCustomer`, validado en DB) |
| Prueba E2E con compra real | ⏳ **a confirmar con la 1ª venta real** (checkout → gracias → fila en `customers`). No se simuló para no disparar Meta CAPI + bono Leadr + venta con datos falsos. |
