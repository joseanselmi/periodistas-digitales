# Contabilidad automática — buzón de facturas (gastos@leadr.cloud)

**Qué resuelve (tarjeta Trello #46, decidido por Jose 2026-07-03):** cerrar el
círculo de la Contabilidad. Los gastos **variables** ya se cargan solos (Meta Ads,
comisión Hotmart, mensajería). Faltaba que los gastos **fijos** (Vercel, Supabase,
Brevo, Make, higgsfield, Anthropic, dominios…) también se carguen solos desde las
**facturas reales**, sin que Jose tipee montos a mano.

## Circuito

```
Proveedor factura ──► gastos@leadr.cloud ──(reenvío Hostinger)──► joseanselmi27@gmail.com
                                                                        │
                          Rutina de nube 1×/mes ◄────(Gmail MCP: lee SOLO to:gastos@)
                                   │
                                   ├─ extrae servicio + monto + mes (con IA)
                                   ├─ upsert en tabla `gastos` (base periodistas-marketing)
                                   └─ deposita resumen en el buzón "Cartero" ──► email a Jose
```

- **Buzón dedicado:** `gastos@leadr.cloud` (casilla en Hostinger). Todos los
  proveedores facturan ahí. Reenvía a `joseanselmi27@gmail.com` para que la rutina
  lo lea por Gmail. La rutina lee **solo** los mails `to:gastos@leadr.cloud` — no
  toca el resto del Gmail de Jose.
- **Frecuencia:** 1×/semana, lunes (elegido por Jose). El upsert es idempotente, así que
  re-correr no duplica (ver "Frecuencia" abajo).

## Datos donde carga (Supabase `periodistas-marketing`, id `wxyimqkjlwfncvzozpjy`)

Tabla **`gastos`** — columnas relevantes: `servicio`, `categoria`
(`IA|Infraestructura|Publicidad|Herramientas|Otros`), `tipo` (`fijo|variable`),
`fuente` (`manual|auto:hotmart|auto:meta|auto:factura`), `monto`, `moneda`, `mes`
(date, día 1 del mes), `recurrente`, `notas`.

- **Constraint clave:** `UNIQUE (servicio, mes)` → el upsert va con
  `ON CONFLICT (servicio, mes)` y es **idempotente** (re-correr no duplica).
- **`fuente = 'auto:factura'`** — valor agregado el 2026-07-03 (migración
  `gastos_fuente_agregar_auto_factura`) para distinguir lo cargado desde facturas.
  Antes el CHECK solo permitía `manual|auto:hotmart|auto:meta`.

### Mapeo proveedor → servicio canónico

La rutina identifica el servicio por el **dominio del remitente Y por el
asunto/cuerpo** (varios facturan vía Stripe/PayPal, así que el remitente puede ser
`stripe.com` aunque el servicio sea otro).

| Pista (remitente / cuerpo)        | `servicio` (exacto)      | `categoria`      |
|-----------------------------------|--------------------------|------------------|
| vercel.com                        | Vercel                   | Infraestructura  |
| supabase.io / supabase.com        | Supabase                 | Infraestructura  |
| brevo.com / sendinblue            | Brevo                    | Infraestructura  |
| make.com / integromat             | Make.com                 | Herramientas     |
| higgsfield.ai                     | higgsfield               | IA               |
| anthropic.com (a veces vía Stripe)| Anthropic API (Claude)   | IA               |
| fal.ai                            | fal.ai                   | IA               |
| Hostinger / registrar de dominios | Dominios                 | Infraestructura  |

Si una factura no matchea ninguno, la rutina **no inventa** un nombre canónico: la
reporta como "no reconocida" para que Jose la cargue a mano.

## El envío del resumen — patrón "Cartero"

La rutina de nube **no puede mandar mails directo** (el conector Gmail solo crea
borradores y el sandbox no tiene salida a internet). Usa el buzón "Cartero" ya
existente (ver `NOTIFICACIONES-CARTERO.md`):

1. Deposita `{subject, text}` en el **data store 169612** (Make MCP
   `data-store-records_create`).
2. Dispara el escenario **Cartero 9470203** (Make MCP `scenarios_run`) → manda por
   Brevo a `joseanselmi27@gmail.com` y borra el registro.
3. Contrato del `text`: HTML con `<br>` (nunca saltos reales), **sin comillas
   dobles** (usar `'`), **sin `\`**. `subject`/`text` nunca vacíos.

## Frecuencia y desfase

Corre **1×/semana** (lunes), leyendo `newer_than:40d`. Cada corrida re-lee las
facturas de los últimos 40 días y hace upsert (idempotente, no duplica), pero **solo
le manda email a Jose si detectó una factura nueva o con monto distinto** al que ya
estaba — así la Contabilidad queda al día sin llenar la casilla con listas repetidas.
El `mes` se toma del **período de la factura**, así que aunque se lea con desfase,
siempre queda en el mes correcto. (Antes era mensual, día 4; se pasó a semanal el
2026-07-03 a pedido de Jose.)

## Rutina de nube — IDs

- **Trigger (routine):** `trig_019crWyCPfrzbGpQgUqgs41J`
  ([panel](https://claude.ai/code/routines/trig_019crWyCPfrzbGpQgUqgs41J))
- **Cron:** `34 12 * * 1` (todos los **lunes**, 12:34 UTC ≈ 09:34 ART).
  Solo avisa a Jose cuando cargó una factura **nueva o con monto cambiado** (semana
  sin novedad = no manda email). Ignora facturas de **Meta Ads / WhatsApp** (ya se
  cargan solas por otra vía → evita duplicar). **Aviso-si-falla:** si no puede leer
  Gmail / escribir en Supabase por un error de conexión (distinto de "0 facturas"),
  manda un email de alerta por el Cartero → nunca se rompe en silencio.
- **Nota (leftover de Make):** durante la sesión se exploró una variante Make/IMAP
  (leer la casilla por IMAP en vez de Gmail) para más estabilidad; se descartó porque
  crear la conexión IMAP era un paso manual trabado para Jose y el circuito Gmail quedó
  probado. Quedó **sin usar** un data store `facturas_inbox` (id 169871) + su estructura
  (598949) en Make — se pueden borrar; se dejaron por si algún día se retoma IMAP.
- **MCP conectados:** Gmail (lee facturas) + Supabase (upsert) + Make (Cartero).
  Sin `sources` (repo) — el prompt es autocontenido.
- **Aviso-si-falla:** si un lunes no puede leer el correo (ej. Gmail desconectado), en vez
  de quedarse callada deposita un aviso en el Cartero → email a Jose. No se rompe en silencio.
- Se corre a mano con `RemoteTrigger action:run` o desde el panel de claude.ai/code/routines.

**Nota (IMAP descartado 2026-07-03):** se evaluó leer la casilla directo por Make/IMAP para
no depender del conector de Gmail (más estable en el papel), pero se descartó por la fricción
de crear la conexión IMAP a mano (Jose no es técnico y se trabó en el "Add"). Se optó por la
vía Gmail + reenvío (ya construida y probada) + el aviso-si-falla como mitigación. Quedaron
creados **sin usar** el data store Make `facturas_inbox` (169871) y su estructura
`facturas_inbox_struct` (598949), por si algún día se retoma IMAP.

## Rutina de nube — prompt (fuente de verdad)

> ⚠️ **El prompt EXACTO vigente vive en la rutina** (leer con `RemoteTrigger get
> trig_019crWyCPfrzbGpQgUqgs41J`). El bloque de abajo es la **versión inicial mensual**,
> referencial. La versión vigente (2026-07-03) es **semanal** y agrega: (a) solo avisa
> si hay factura nueva/cambiada, (b) ignora Meta Ads / WhatsApp. El resto (mapeo,
> upsert, Cartero) es idéntico.
>
> Es **autocontenido a propósito**: la sesión de nube no tiene el contexto de estas
> conversaciones y puede ni clonar el repo. Cualquier cambio de lógica se edita acá
> y en la rutina.

```
Sos una rutina automática mensual de contabilidad del negocio "Periodistas
Digitales". Tu tarea: leer las facturas que llegaron al buzón dedicado
gastos@leadr.cloud (reenviado a este Gmail), extraer de cada una servicio + monto +
mes, cargarlas en la tabla `gastos` de Supabase (proyecto periodistas-marketing) y
mandarle a Jose un resumen en lenguaje simple. NO toques ningún otro email. Todo lo
que necesitás está acá abajo; no dependas de archivos del repo.

PASO 1 — Leer las facturas (Gmail MCP, solo lectura):
- Buscá en Gmail con la query EXACTA: to:gastos@leadr.cloud newer_than:40d
- Esos son los ÚNICOS mails que podés leer. Si la búsqueda da 0 resultados, está
  bien: saltá al PASO 4 y reportá "0 facturas encontradas" (y aclarás que quizás el
  reenvío de Hostinger todavía no está activo).
- Por cada hilo, abrilo y leé el último mensaje: es (o debería ser) una factura/
  recibo de un proveedor.

PASO 2 — Extraer, por cada factura:
- servicio → mapealo a EXACTAMENTE uno de estos nombres canónicos (identificá por el
  dominio del remitente Y por el asunto/cuerpo, porque varios facturan vía Stripe y
  el remitente puede ser stripe.com):
    Vercel (vercel.com) · Supabase (supabase.io/.com) · Brevo (brevo.com/sendinblue)
    · Make.com (make.com/integromat) · higgsfield (higgsfield.ai) ·
    Anthropic API (Claude) (anthropic.com, a veces vía Stripe) · fal.ai (fal.ai) ·
    Dominios (Hostinger / registrador de leadr.cloud o sistemadeingresosdiariosia.com)
  Si una factura no matchea ninguno, NO inventes un nombre: dejala como "no
  reconocida" y reportala en el PASO 4.
- monto → el total cobrado (número).
- moneda → código (USD, EUR, ARS…). Si hay "$" sin aclarar, asumí USD.
- mes → el día 1 del mes calendario que cubre la factura (YYYY-MM-01). Usá el período
  facturado; si no está, usá el mes de la fecha de emisión.
- notas → corto: nº de factura / período / remitente.

PASO 3 — Upsert en Supabase (Supabase MCP, project_id wxyimqkjlwfncvzozpjy):
Por cada factura, ejecutá execute_sql (idempotente por ON CONFLICT):
  insert into gastos (servicio, categoria, tipo, fuente, monto, moneda, mes, recurrente, notas)
  values ('<servicio>', '<categoria>', 'fijo', 'auto:factura', <monto>, '<moneda>', '<YYYY-MM-01>', true, '<notas>')
  on conflict (servicio, mes) do update
    set monto = excluded.monto, moneda = excluded.moneda,
        fuente = 'auto:factura', notas = excluded.notas, updated_at = now();
- categoria: Vercel/Supabase/Brevo/Dominios = 'Infraestructura'; Make.com =
  'Herramientas'; higgsfield/fal.ai/Anthropic = 'IA'.

PASO 4 — Avisar a Jose por el buzón "Cartero" (Make MCP):
- Depositá UN registro en el data store 169612 con data = { subject, text }:
    subject: 🧾 Contabilidad — facturas cargadas (mes actual)   (una línea, SIN comillas dobles)
    text: HTML. REGLAS OBLIGATORIAS (si no, se rompe el envío): líneas con <br>
      (nunca saltos reales), SIN comillas dobles (usá '), SIN backslash. Se permiten
      <b> y emojis. Nunca vacío.
    Contenido: resumen humano. Ej: "Cargué N facturas al mes de julio:<br>• Vercel:
      USD X (jul-2026)<br>• Supabase: USD Y<br>...<br><br>No pude interpretar M
      facturas, cargalas a mano: ...". Si fueron 0: "No llegaron facturas nuevas a
      gastos@leadr.cloud este mes. Si esperabas alguna, revisá que el reenvío de
      Hostinger esté activo."
- Después disparás el Cartero para que mande al instante: Make MCP scenarios_run del
  escenario 9470203.

PASO 5 — Listo. No mandes ningún otro email, no crees borradores en Gmail, no
modifiques ninguna otra tabla.
```

## DNS de correo (leadr.cloud) — para que gastos@ reciba

**Clave (no obvia):** la DNS de `leadr.cloud` está en **Vercel** (nameservers
`ns1/ns2.vercel-dns.com`), NO en Hostinger — porque ahí vive la web de Leadr. Por eso
Hostinger mostraba *"domain setup isn't complete"*: le faltaba el registro **MX**, y
Hostinger no puede agregarlo (no controla la DNS). Sin MX, los mails a `gastos@leadr.cloud`
no se reciben → la rutina nunca vería facturas.

**Solución (2026-07-03):** se agregaron en Vercel (via `vercel dns add`, CLI de Jose) los
registros de correo de Hostinger. No tocan la web (son solo de correo):
- `MX` `mx1.hostinger.com` prioridad 5
- `MX` `mx2.hostinger.com` prioridad 10
- `TXT` (SPF) `v=spf1 include:_spf.mail.hostinger.com ~all`

**DKIM / DMARC** quedaron SIN poner: son para el correo *saliente* y acá solo se *recibe*;
agregarlos solo si una factura reenviada cae en spam. Ver: `vercel dns ls leadr.cloud`.

## Estado / pendientes (2026-07-03)

- [x] Casilla `gastos@leadr.cloud` creada en Hostinger.
- [x] `fuente='auto:factura'` habilitado en el constraint de `gastos`.
- [x] Rutina de nube creada (**1×/semana, lunes**) — solo avisa si hay novedad.
- [x] **Reenvío activado + verificado E2E (03/07):** `gastos@leadr.cloud → joseanselmi27@gmail.com`.
      Requirió agregar el **MX** en Vercel (ver "DNS de correo" arriba). Mail de prueba a
      `gastos@` llegó reenviado al Gmail y la búsqueda `to:gastos@leadr.cloud` lo encuentra.
- [ ] **Jose:** poner `gastos@leadr.cloud` como email de facturación en los
      proveedores que SÍ cobran: **Make.com + dominio leadr.cloud (Hostinger) +
      dominio sistemadeingresosdiariosia.com**. (Brevo y Anthropic ✅ ya hechos.)
      **No aplica:** Vercel (Hobby) y Supabase (Free) = gratis, no facturan;
      **higgsfield = se da de baja** (imágenes pasan a ChatGPT, Trello #51);
      **fal.ai = no se usa** ($0). Meta Ads = solo verificar (no redirigir, ya se
      carga solo). Detalle por proveedor en Trello #48.
- [ ] Validar con la 1ª factura real que entra sola (la rutina la carga + avisa).

## ⚠️ Un fijo en `$0` no quiere decir gratis (01/08/2026)

La rutina busca **solo** `to:gastos@leadr.cloud`. Un proveedor que todavía factura al
Gmail personal **no la ve pasar**, y su fila se queda en el `$0` con que se sembró la
tabla. Desde afuera se lee igual que "es gratis": el P&L no avisa nada, simplemente
reporta de menos.

Pasó con **Make.com**: plan Core pagado el 18/07/2026 (**$10.59 USD**, recibo Stripe
#2912-2386, ciclo **18-jul → 18-ago**, no mes calendario), pero la fila decía $0 porque
el recibo llegó a `joseanselmi27@gmail.com`, no a `gastos@`. Se cargó a mano el 01/08;
los fijos de julio pasaron de $21.00 a **$31.59**.

**Regla:** cada tanto, contrastar los fijos en `$0` contra la realidad — un `$0` es
"nadie lo cargó" hasta que se confirme que el proveedor no cobra. Los únicos gratis
confirmados son Vercel (Hobby), Supabase (Free) y **ChatGPT** (plan free, proveedor de
imágenes desde el 03/07 — ver `CHATGPT-IMAGENES.md`). La forma de que deje de pasar es
el ítem de arriba: poner `gastos@` en los proveedores que cobran.

Relacionado: `NOTIFICACIONES-CARTERO.md`, `ARQUITECTURA-DATOS.md` (sección
"contabilidad"), memoria `project_contabilidad_pnl`.
