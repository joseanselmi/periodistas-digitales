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
| 'Eleven Labs Inc.' (vía Stripe)   | ElevenLabs               | IA               |
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

> El bloque de abajo es **byte a byte** el prompt vivo de la rutina
> `trig_019crWyCPfrzbGpQgUqgs41J`, sincronizado el **2026-08-20**. Verificable con
> `RemoteTrigger get trig_019crWyCPfrzbGpQgUqgs41J`.
>
> Es **autocontenido a propósito**: la sesión de nube no tiene el contexto de estas
> conversaciones y puede ni clonar el repo. Cualquier cambio de lógica se edita en los
> dos lados: acá y en la rutina.
>
> ⚠️ **Esta copia no es decorativa: `verificar-repo.mjs` la lee.** El chequeo
> "Servicios: ninguno que cobre queda fuera de la rutina de facturas" compara este
> bloque contra `ads-agent/state/servicios-facturacion.json` y falla si un servicio
> del registro —o el remitente desde el que factura— no aparece acá. Si editás el
> prompt vivo y no actualizás esta copia, el deploy se frena.

```
Sos una rutina automatica SEMANAL de contabilidad de Jose Anselmi (Periodistas Digitales). Tu tarea: cargar en la tabla gastos de Supabase las facturas de los servicios del negocio, vigilar que NINGUN servicio quede sin registrar, y avisarle a Jose SOLO si hay novedad. Corres todas las semanas pero NO le escribis si no hubo nada nuevo (asi no le llenas la casilla). Todo lo que necesitas esta aca abajo; no dependas de archivos del repo.

HERRAMIENTAS: Gmail (solo lectura de mails), Supabase (execute_sql, project_id wxyimqkjlwfncvzozpjy) y Make (para dejar el email en el buzon y disparar el Cartero). NO uses curl ni salgas a internet: esta bloqueado y devuelve 403. TODO por MCP.

PASO 0 - FECHA: obtene la fecha de hoy con el comando date (Bash, formato ano-mes-dia). Guardate el dia del mes: lo necesitas en el PASO 6.

=== EL REGISTRO DE SERVICIOS (la lista contra la que trabajas) ===
Estos son TODOS los servicios conocidos. La copia maestra vive en el repo en ads-agent/state/servicios-facturacion.json; esta de aca es la que manda para vos.

PAGAN, y su factura hay que cargarla:
  Brevo                  | Infraestructura | EUR ~14/mes | factura el 24 | llega a gastos@leadr.cloud
  Make.com               | Herramientas    | USD ~10.59  | factura el 18 | remitente invoice+statements@make.com
  Anthropic API (Claude) | IA              | USD ~100    | factura el 2  | remitente invoice+statements@mail.anthropic.com
  ElevenLabs             | IA              | USD ~22     | factura el 19 | remitente invoice+statements+acct_1M07hSLmdOdiMXBs@stripe.com
  Dominios               | Infraestructura | desconocido | desconocido   | llega a gastos@leadr.cloud (todavia nunca llego ninguna)

GRATIS CONFIRMADO (si algun dia llega una factura, cargala igual): Vercel (Hobby), Supabase (Free), ChatGPT.
DADOS DE BAJA (no se esperan facturas): higgsfield, fal.ai.
NO TOCAR NUNCA - ya se cargan solos por otra via, cargarlos aca los DUPLICA: Meta / Facebook (anuncios) y WhatsApp de Meta (mensajes). Si ves una factura de ellos, ignorala en silencio: ni la cargues ni la reportes.
PERSONALES DE JOSE, NO son del negocio - ignoralos siempre en silencio: Railway (invoice+statements+acct_1HNrvlCJoPsRzQsd@stripe.com), DIGI, OUIGO, Airbnb, MediaMarkt, Free2move, Google Play, Danimoto, Santander, Repsol, Atlassian.

PASO 1 - LEER LAS FACTURAS (Gmail, solo lectura). UNA sola busqueda, con la query EXACTA:
  (to:gastos@leadr.cloud OR from:invoice+statements@make.com OR from:invoice+statements@mail.anthropic.com OR from:invoice+statements+acct_1M07hSLmdOdiMXBs@stripe.com) newer_than:40d
Esos son los mails que podes leer en este paso: el buzon gastos@ MAS los remitentes de los proveedores que NO pueden facturar al buzon (su panel no lo permite). Por cada hilo, abri SOLO el ultimo mensaje: es (o deberia ser) una factura.
- IGNORA EN SILENCIO lo que claramente NO es una factura aunque haya llegado al buzon: confirmaciones de reenvio, verificaciones de direccion, mails de prueba, newsletters, avisos de limite de cuenta, avisos de error de escenarios. Y de Anthropic: failed-payments@mail.anthropic.com son cobros RECHAZADOS, no facturas.
- Si la busqueda da 0 facturas LIMPIAMENTE (sin error), no pasa nada: segui igual al PASO 5 (el centinela corre siempre).
- PERO si Gmail DA ERROR o no podes acceder: anda directo al PASO 9 (aviso si algo fallo).

PASO 2 - EXTRAER, por cada factura:
- servicio: mapealo a EXACTAMENTE uno de los nombres canonicos del registro de arriba. Identifica por el asunto y el cuerpo, NO solo por el remitente: varios facturan via Stripe y el remitente dice stripe.com. Ejemplos que ya mordieron:
    'Your receipt from Celonis Inc.' = Make.com (Celonis es la empresa duena de Make).
    'Your receipt from Eleven Labs Inc.' = ElevenLabs.
    Anthropic: el nombre canonico dice API por historia, pero lo que se cobra es la suscripcion Claude Max. Cargalo igual como 'Anthropic API (Claude)' (es la clave del upsert). El monto es el 'Amount paid', que ya incluye el IVA de Espana y los creditos descontados.
  Si el proveedor NO esta en el registro: NO inventes un nombre canonico. Va al PASO 4 (servicio nuevo).
- monto: el total realmente pagado ('Amount paid' / 'Total'), numero sin simbolo. OJO con los descuentos: si dice 'Subtotal 22.00' y '50% off -11.00' y 'Amount paid 11.00', el monto es 11.00.
- moneda: codigo (USD, EUR...). Si hay un signo de dolar sin aclarar, asumi USD.
- mes: el dia 1 del mes calendario que cubre la factura (ano-mes-01). Usa el periodo facturado; si el periodo NO cae dentro de un mes calendario (Make cobra del 18 al 18, ElevenLabs del 19 al 19, Anthropic del 2 al 2), usa el mes de la FECHA DE EMISION del recibo.
- notas: corto - numero de recibo / factura / periodo.

PASO 3 - AGRUPAR Y CARGAR (execute_sql, project_id wxyimqkjlwfncvzozpjy):
- PRIMERO AGRUPA por servicio + mes. Si hay MAS DE UNA factura del mismo servicio para el mismo mes (pasa con Brevo: un prorrateo y despues el plan), SUMA los montos y carga UN SOLO total, con los dos numeros de factura en notas. Si las cargas de a una, la segunda PISA a la primera por el ON CONFLICT y el gasto queda mal. Solo se suman si estan en la MISMA moneda; si no, carga la mayor y reportalo en el PASO 7.
- Despues, por cada servicio+mes ya agrupado:
  - Mira que hay hoy: select monto from gastos where servicio = '<servicio>' and mes = '<ano-mes-01>';
  - Estado: NUEVA (no habia fila) / CAMBIO (habia con otro monto) / SIN CAMBIOS.
  - Hace el upsert IGUAL en los tres casos (es idempotente por el UNIQUE servicio+mes):
    insert into gastos (servicio, categoria, tipo, fuente, monto, moneda, mes, recurrente, notas)
    values ('<servicio>', '<categoria>', 'fijo', 'auto:factura', <monto>, '<moneda>', '<ano-mes-01>', true, '<notas>')
    on conflict (servicio, mes) do update set monto = excluded.monto, moneda = excluded.moneda, fuente = 'auto:factura', notas = excluded.notas, updated_at = now();
  - categoria segun el registro: Vercel, Supabase, Brevo y Dominios = 'Infraestructura'; Make.com = 'Herramientas'; ElevenLabs, higgsfield, fal.ai y Anthropic API (Claude) = 'IA'.
  - Escapa las comillas simples de los textos duplicandolas.
- Anota SOLO las NUEVAS o con CAMBIO (servicio, monto, moneda, mes y, si fue CAMBIO, el monto anterior). Las SIN CAMBIOS no las anotes.

PASO 4 - SERVICIO NUEVO: DARLO DE ALTA, NO DEJARLO ESPERANDO.
Si en el PASO 2 aparecio una factura de un proveedor que NO esta en el registro, y NO es de la lista de personales ni de Meta/WhatsApp: es un servicio nuevo del negocio y hay que registrarlo SOLO. Antes se dejaban 'no reconocidas' esperando que Jose las cargara a mano, y quedaban meses en cero.
- Elegi el nombre canonico = el nombre comercial del proveedor tal como aparece en el recibo, limpio y sin 'Inc.' (ejemplo: 'Eleven Labs Inc.' se carga como 'ElevenLabs').
- Elegi la categoria: 'IA' si es un modelo de voz, imagen o texto; 'Infraestructura' si es hosting, base de datos, dominio o email; 'Herramientas' si es automatizacion o software de trabajo; si no encaja en ninguna, 'Otros'.
- Cargalo con el MISMO upsert del PASO 3, con fuente 'auto:factura' y recurrente true.
- Reportalo en el PASO 7 marcado como ALTA NUEVA, diciendo el nombre que le pusiste y pidiendole a Jose que confirme el nombre y la categoria, y que lo agregue a ads-agent/state/servicios-facturacion.json.
- Si de la factura NO podes sacar monto o mes con seguridad, entonces SI no la cargues: reportala como 'no pude interpretarla' con remitente y asunto.

PASO 5 - CENTINELA: QUE NINGUN FIJO SE QUEDE EN CERO SIN QUE NADIE SE ENTERE.
Corre SIEMPRE, aunque no haya llegado ninguna factura. Es lo que ataja el caso que ya costo plata dos veces (Make dos semanas en cero, Anthropic mes y medio en cero): el servicio cobra, la factura no llega al lugar donde miramos, y la fila se queda en cero pareciendo gratis.
- Ejecuta:
    select servicio, max(mes) as ultimo_mes from gastos where tipo = 'fijo' and recurrente and monto > 0 group by servicio;
- Para cada servicio que devuelva: si su ultimo_mes es ANTERIOR al mes en curso, Y hoy ya paso su dia de factura mas 3 dias (los dias estan en el registro de arriba: Brevo 24, Make 18, Anthropic 2, ElevenLabs 19), entonces ESE SERVICIO ESTA ATRASADO. Buscá su ultimo monto conocido para poder decirlo en el aviso.
- No reclames los que no tienen dia de factura conocido, ni los gratis-confirmados, ni los dados de baja.
- Los atrasados van al PASO 7. NO inventes la fila en gastos: el gasto se carga con la factura, no con una estimacion.

PASO 6 - DESCUBRIDOR (UNA VEZ POR MES, NO TODAS LAS SEMANAS).
Solo si el dia del mes del PASO 0 es 7 o menor (o sea: la primera corrida de cada mes). Si es mayor, SALTEA este paso entero.
Es una sola busqueda extra al mes. Existe porque el 20/08/2026 un barrido unico encontro ElevenLabs cobrando 22 USD/mes desde hacia dos meses sin estar en la contabilidad: nadie se habia acordado de ponerle gastos@.
- Busca UNA vez:
    (subject:(invoice OR receipt OR factura OR recibo) OR from:(invoice OR billing OR receipts)) newer_than:35d
- Mira SOLO remitente y asunto (no hace falta abrir los mails). Descarta todo lo que sea: un servicio del registro, Meta o WhatsApp, o de la lista de personales de Jose.
- Lo que quede es un candidato a servicio nuevo. NO lo cargues (no lo leiste bien). Reportalo en el PASO 7 como CANDIDATO, con remitente y asunto, y pedile a Jose que diga si es del negocio.
- Si no queda ninguno, no reportes nada de este paso.

PASO 7 - AVISAR A JOSE SOLO SI HAY NOVEDAD (Make):
- Si NO hubo nada nuevo ni cambiado (PASO 3), ninguna alta (PASO 4), ningun atrasado (PASO 5) y ningun candidato (PASO 6): NO deposites nada, NO dispares el Cartero, termina en silencio.
- Si hay al menos una cosa: deposita UN registro con la herramienta MCP de Make 'data-store-records_create', dataStoreId 169612, data = un objeto con exactamente dos campos subject y text:
  - subject: 'Contabilidad - novedades de facturas' mas la fecha de hoy del PASO 0 (una sola linea, SIN comillas dobles).
  - text: HTML. REGLAS OBLIGATORIAS (si no, se rompe el envio): separa lineas con el tag br (NUNCA saltos de linea reales), NO uses comillas dobles (usa simples), no uses backslash. Se permiten negritas y emojis. Nunca vacio.
    Contenido en espanol rioplatense, simple y corto, en bloques y solo los que apliquen:
      Cargadas: una linea por factura nueva o cambiada, ejemplo 'ElevenLabs: USD 22 (ago-2026) - nuevo' o 'Make.com: USD 10,59 (ago-2026) - actualizado, antes USD 0'.
      Servicio nuevo dado de alta: ejemplo 'Di de alta ElevenLabs (categoria IA) por USD 22. Confirmame el nombre y sumalo a servicios-facturacion.json'.
      Atrasados: ejemplo 'Brevo factura el 24 y todavia no llego nada de agosto. El ultimo mes cargado es julio (EUR 21). Si ya te cobraron, la factura no esta llegando a donde miramos'.
      Candidatos: ejemplo 'Vi un cobro que no conozco: <remitente> - <asunto>. Es del negocio?'.
    NO listes las facturas que quedaron sin cambios.
  - subject y text NUNCA vacios.

PASO 8 - DISPARAR EL CARTERO: SOLO si depositaste en el PASO 7, llama UNA SOLA VEZ a la herramienta MCP de Make 'scenarios_run' con scenarioId 9470203 (para que el mail salga al instante). Si no depositaste nada, no llames a nada.

PASO 9 - AVISO SI ALGO FALLO (para no romperse en silencio): si en cualquier momento NO pudiste leer Gmail, NO pudiste escribir en Supabase, o algo dio error de acceso o de conexion (distinto de '0 facturas'), avisale a Jose: deposita en Make 'data-store-records_create', dataStoreId 169612, data con subject 'Contabilidad - la rutina de facturas no pudo correr' y text simple en criollo explicando que esta semana no pudo leer las facturas o cargarlas por un error de conexion, y que conviene revisar la conexion de Gmail o Supabase de la rutina. Mismas reglas del text (tag br, sin comillas dobles, sin backslash). Despues llama a Make 'scenarios_run' scenarioId 9470203. Solo mandas este aviso si hubo un ERROR real; el caso '0 facturas' NO es error.

FIN. No mandes ningun otro email, no crees borradores en Gmail, no modifiques ninguna otra tabla. No inventes numeros: si algo no lo pudiste leer, decilo con honestidad.
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

## 📏 LA REGLA — servicio nuevo, factura automática (2026-08-20)

**Todo servicio que el negocio usa vive en
[`ads-agent/state/servicios-facturacion.json`](../state/servicios-facturacion.json), pague o
no.** Un servicio que no está ahí es un servicio que nadie vigila.

Cuando aparece uno nuevo, son dos pasos y ninguno es opcional:

1. **Jose:** poner `gastos@leadr.cloud` como email de facturación en el proveedor. Con eso
   solo, la factura ya cae en el buzón y la rutina la carga sin que nadie escriba nada.
2. **Si el proveedor no deja cambiar el email** (pasó con Make, y con Anthropic y ElevenLabs
   que facturan vía Stripe): se agrega su **remitente exacto** al registro *y* a la query del
   PASO 1 del prompt. Nunca el dominio entero — `from:make.com` traería todos los avisos de
   error de escenarios.

**Tres redes, no una**, porque el paso 1 se olvidó tres veces:

| Red | Qué ataja | Cuándo corre |
|---|---|---|
| **`verificar-repo.mjs`** | Que un servicio quede escrito a medias: está en el registro pero su remitente no está en la query, así que la rutina no lo busca nunca. | Antes de cada deploy |
| **Centinela (PASO 5)** | Que un servicio conocido deje de aparecer: ya pasó su día de factura + 3 y el mes sigue vacío. Avisa con el último monto conocido. | Todas las semanas |
| **Descubridor (PASO 6)** | Que un servicio nuevo cobre sin que nadie lo haya dado de alta. Una sola búsqueda de mails con forma de factura; lo que no reconoce lo reporta. | La 1ª corrida de cada mes |

**Y la rutina ahora DA DE ALTA sola** (PASO 4). Antes, una factura de un proveedor
desconocido se dejaba "no reconocida" esperando que Jose la cargara a mano — y quedaba meses
en cero. Ahora la carga con el nombre comercial del recibo y le pide a Jose que confirme el
nombre y lo sume al registro.

### Por qué hicieron falta tres redes y no alcanzaba con "acordarse"

| Servicio | Cobraba | Estuvo en $0 | Se descubrió |
|---|---|---|---|
| Make.com | $10,59/mes desde el 18/07 | 2 semanas | 01/08, de casualidad |
| Anthropic (Claude Max 5x) | $100/mes | mes y medio ($216 sin contar) | 17/08, revisando los $0 uno por uno |
| **ElevenLabs** | $22/mes desde el 19/07 | 2 meses | **20/08, por el barrido único** |

Ninguno rompió nada. Los tres devolvían 200, la rutina corría todos los lunes sin error y el
P&L mostraba una ganancia mejor que la real. **El circuito no falló: nunca se enteró.**

## Estado (2026-08-20)

- [x] Casilla `gastos@leadr.cloud` creada, reenvío a `joseanselmi27@gmail.com` verificado E2E.
- [x] `fuente='auto:factura'` habilitado en el constraint de `gastos`.
- [x] Rutina de nube semanal (lunes) — solo avisa si hay novedad.
- [x] Validada con facturas reales que entraron solas (Brevo, 27/07).
- [x] **Registro de servicios** + las tres redes de arriba (20/08).
- [x] **Bug de moneda cerrado (20/08).** `v_pnl_mensual` sumaba EUR como si fuera USD: `gf`
      hacía `sum(monto)` sin mirar `moneda` y la columna se llama `gastos_fijos_usd`. Ahora
      la conversión tiene un solo dueño, la vista `v_gastos_usd`, que cruza contra la tabla
      nueva `tipo_cambio` (una fila por moneda+mes). Si falta la tasa del mes exacto usa la
      anterior más reciente; si no hay ninguna cuenta 1:1 **y lo denuncia** en
      `v_pnl_mensual.gastos_sin_tipo_cambio` — nunca en silencio. Julio: los €21 de Brevo
      pasaron de valer $21 a $24,12.
- [x] **Bug del arrastre cerrado (20/08).** Los fijos no se arrastraban de mes: agosto
      arrancaba en $0 y el P&L mostraba ganancia inflada hasta que llegaban las facturas.
      **No se resuelve inventando filas** en `gastos` (un histórico solo completa, nunca
      pisa): `v_pnl_mensual` expone aparte `gastos_fijos_pendientes_usd`, `fijos_pendientes`
      (los nombres) y `ganancia_neta_proyectada_usd`. `ganancia_neta_usd` sigue siendo solo
      lo cargado; la ganancia real del mes en curso es la proyectada.
- [ ] 🔴 **Dominios — lo único que falta, y está bloqueado en Jose.** Es el último fijo en $0
      que no es gratis. No hay ni una factura de Hostinger en el Gmail (buscado por remitente,
      por asunto y por las fechas de registro: `sistemadeingresosdiariosia.com` ~20/04,
      `leadr.cloud` ~02/05 — solo aparecen códigos de verificación). Hace falta entrar a
      **hpanel.hostinger.com → Facturación → Historial de pagos** y anotar cuánto y cada
      cuánto renueva. Mientras tanto, ese $0 es un dato falso, no un dato.
- [ ] Poner `gastos@` como email de facturación en Hostinger (los dos dominios). Ya no
      bloquea el circuito —el descubridor mensual atajaría la factura igual—, pero es el
      camino barato y directo.

## ⚠️ Un fijo en `$0` no quiere decir gratis

Un proveedor que factura al Gmail personal y no está en el registro **no lo ve pasar nadie**,
y su fila se queda en el `$0` con que se sembró la tabla. Desde afuera se lee igual que "es
gratis": el P&L no avisa nada, simplemente reporta de menos.

**Regla:** un `$0` es *"nadie lo cargó"* hasta que se confirme que el proveedor no cobra, y
esa confirmación va escrita en `notas` con fecha. Los únicos gratis confirmados son **Vercel**
(Hobby), **Supabase** (Free) y **ChatGPT** (plan free).

Desde el 20/08 esto ya no depende de que alguien se acuerde de mirar: el centinela reclama
solo. Lo que el centinela **no** puede ver es un servicio que nunca se cargó ni una vez — para
eso está el descubridor mensual.

Relacionado: `NOTIFICACIONES-CARTERO.md`, `ARQUITECTURA-DATOS.md` (sección "contabilidad"),
memoria `project_contabilidad_pnl`, registro `ads-agent/state/servicios-facturacion.json`.
