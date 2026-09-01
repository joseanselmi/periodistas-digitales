# Flujo post-compra del cliente (tarjeta Trello #24)

Qué pasa cuando alguien **COMPRA** el curso (distinto de #25/#34, que modelan a los
que NO compran). Documento vivo — Jose no es técnico, acá queda el estado real para
cualquier sesión futura.

Tres piezas:
1. **Página de gracias** post-checkout (`/gracias`) — con la identidad de la landing.
2. **Alta como `customer`** en la base de marketing (tabla nueva, cruza con #6).
3. **Canal de Telegram** — ✅ encendido (grupo creado, link de invitación en la página).

---

## 1. Página de gracias — `/gracias`

- **Archivo:** [gracias.html](../paginas/gracias.html). Servida en `https://sistemadeingresosdiariosia.com/gracias`
  (rewrite `/gracias → /gracias.html` en [vercel.json](../vercel.json); también responde `/gracias.html`).
- **Identidad:** reusa exactamente los tokens de la landing (`index.html`): mismas fuentes
  (Space Grotesk + DM Sans), misma paleta (`--bg #000`, `--indigo #6366f1`, `--cyan #22d3ee`,
  `--green #22c55e`), mismo nav (punto que pulsa + "Periodistas Digitales") y mismo footer.
- **Contenido:** confirmación de pago + 3 próximos pasos:
  1. Revisá tu correo (Hotmart mandó el acceso al curso).
  2. Activá tu mes gratis de Leadr Pro (entrando a leadr.cloud con el email de compra).
  3. Entrá al canal privado → **encendido**, pero el botón pasa por la encuesta de 5 preguntas (ver punto 3).
- **`noindex`:** la página lleva `<meta name="robots" content="noindex,nofollow">` (es una
  confirmación privada, no debe aparecer en Google).
- **Meta Pixel:** dispara **solo `PageView`**. NO dispara `Purchase` del lado del navegador
  **a propósito**: la conversión `Purchase` la manda el webhook por la Conversions API
  (server-side) con el máximo de PII + `event_id = transacción`. Duplicarla en el cliente
  sin ese `event_id` inflaría las compras en Meta. La atribución por anuncio ya viaja por
  el `?src=` del checkout (ver [TRACKING.md](TRACKING.md)).

### Redirección post-compra de Hotmart — LISTA (verificado 01/09/2026)

Hotmart redirige al comprador a `https://sistemadeingresosdiariosia.com/gracias`.
**Verificado contra la tabla `events`, no contra el panel:** los referrers de las visitas
a /gracias son `pay.hotmart.com/thanks?transactionReference=...` y
`pay.hotmart.com/P106404871J?checkoutMode=10...` — o sea compradores reales saliendo del
checkout, desde MX, PE, CO, AR, ES, HN y DO.

Llegan **~9 de cada 11 compradores**. Los que faltan cierran la pestaña antes de que
corra el script. El alta del customer y el bono de Leadr no dependen de esto: van por el
webhook.

> ⚠️ Al contar visitas a /gracias hay que **descontar el robot `meta-externalads`**
> (previsualizador de Facebook): son 4 de cada 25 filas y no son personas.

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
- **Webhook** [api/hotmart.js](../api/hotmart.js) → función `saveCustomer()`, llamada en la rama
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

## 3. Canal de Telegram — ✅ encendido (2026-07-03)

Jose creó el grupo de Telegram y pasó el link de invitación. Ya está en vivo en la página de
gracias (paso 3):

### ⚠ Desde el 01/09/2026 el botón NO lleva al canal: lleva a una encuesta

El paso 3 pasa por [`ENCUESTA-VOZ-CLIENTE.md`](ENCUESTA-VOZ-CLIENTE.md) — 5 preguntas abiertas
para capturar el vocabulario del comprador y escribir anuncios con sus palabras. **El link del
canal vive en el MENSAJE DE CONFIRMACIÓN del formulario**, que Google muestra recién al enviarlo.
Ese es todo el gate: no hay código que lo aplique.

- En [gracias.html](../paginas/gracias.html) la constante ahora es `ENCUESTA_URL` (antes
  `TELEGRAM_INVITE`) y apunta al formulario, no a `t.me`.
- ⚠ **Si alguna vez se vuelve a poner el link directo del canal en ese botón, el formulario
  queda opcional y no lo llena nadie.** Es el único punto que sostiene el gate.
- **Vacía** → muestra "Canal lleno por ahora — te avisamos por email cuando lo reabramos
  próximamente" (gancho de escasez, sin dejar un link roto). Sigue funcionando igual.
- **Para cambiar el grupo:** el link de `t.me` ya no está en el código — se cambia en el mensaje
  de confirmación del formulario, sin tocar ni deployar la página.
- ⚠ **Costo a vigilar:** el paso 3 era el único enganche social del post-compra y esta gente entra
  una vez y no vuelve. Si al mes las respuestas no compensan, se revierte volviendo el botón al
  canal.
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
| Redirección post-compra en Hotmart | ✅ **lista** — verificado 01/09/2026 por los referrers de `events` |
| Mecánica de Telegram + CTA | ✅ LIVE — desde el 01/09 el botón pasa por la encuesta (`ENCUESTA_URL`); el link del canal vive en el mensaje de confirmación del formulario |
| Alta del `customer` desde el webhook | ✅ LIVE (tabla `customers` + `saveCustomer`, validado en DB) |
| Prueba E2E con compra real | ⏳ **a confirmar con la 1ª venta real** (checkout → gracias → fila en `customers`). No se simuló para no disparar Meta CAPI + bono Leadr + venta con datos falsos. |
