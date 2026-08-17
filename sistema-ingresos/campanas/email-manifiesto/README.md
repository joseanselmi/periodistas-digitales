# `email-manifiesto` — un solo envío a toda la base

Campaña de **un solo mail** a todos los leads, con el ángulo que pidió Jose el 18/08/2026:
la industria dejó de sostener al periodista, y los que tienen más oficio están saliendo de ahí
por su cuenta. Cierra en el curso de $27.

✅ **ENVIADA el 18/08/2026 a 1.227 personas.** Campaña Brevo **#4**.

## Las seis preguntas

| | |
|---|---|
| **¿Quiénes?** | Lista Brevo **#5** "Leadgen - Guía Claude" (919) **+** lista **#6** "Leadgen - Republicadores" (510), **deduplicadas por Brevo**: **1.258 únicos**. |
| **¿Día 0?** | No hay. Tanda única, enviada el 18/08/2026. |
| **¿Qué piezas y cuándo?** | **Una.** Sin secuencia, sin seguimiento, sin reenvío. |
| **¿Quién NO?** | Los compradores (lista de exclusión Brevo **#7**) · los dados de baja (`emailBlacklisted`). |
| **¿Tope y condiciones?** | Ninguno: salió toda la tanda de una vez. |
| **¿Qué motor la ejecuta?** | **Ninguno.** Campaña de Brevo disparada por API una sola vez. No hay cron ni cola. |

**El público, contado de verdad antes de mandar:**

```
únicos en las dos listas : 1258
  − dados de baja        :   30
  − compradores          :    1
  = recibieron el mail   : 1227
```

⚠️ **Dos números de este bloque corrigen lo que decía la doc.** La lista 6 tenía **510**, no 326:
`ad5-lectores` siguió captando desde el 10/08 y nadie actualizó la ficha. Y de los 21 compradores,
**uno solo estaba en las listas** — o sea que el embudo de guías no produjo prácticamente ninguna
venta, exactamente lo que ya decían los números de Meta.

## El mail

- **Archivo:** [email-manifiesto.html](email-manifiesto.html) — pegar tal cual en Brevo (editor HTML).
- **Remitente:** `José — Periodistas del Futuro IA <jose@sistemadeingresosdiariosia.com>` (el mismo de todo el embudo).
- **Preheader:** ya va dentro del HTML — *"La industria dejó de sostener al periodista. Los lectores no se fueron a ninguna parte."*

### Asuntos — elegir uno

1. **Lo que se está muriendo no es el periodismo** ← recomendado: es la tesis del mail, y genera la pregunta
2. Te sacaron la redacción. No te sacaron los lectores.
3. La redacción se achicó. El oficio no.

> Brevo Starter **no tiene A/B test**. Se elige uno y listo; no se puede partir la lista desde el panel.

### Baja

Usa el tag nativo `{{ unsubscribe }}` de Brevo, **no** el `%%BAJA%%` del embudo — ese lo firma
`api/_lib/baja.js` y sólo existe cuando el mail sale por el motor. Los dos terminan en lo mismo:
`emailBlacklisted:true` en Brevo, que es lo que `wa-funnel.js` ya respeta al armar su plan.

## Cómo se mide si alguien COMPRA por acá

Esta es la parte que Jose pidió expresamente. La cadena está **verificada el 18/08/2026**, no supuesta:

```
mail → /?src=Email-Manifiesto&sck=email-manifiesto
     → paginas/index.html reescribe TODOS los botones de Hotmart con ese src   (línea ~1133, applyAdAttribution)
     → Hotmart lo guarda en purchase.origin.src
     → api/hotmart.js lo lee                                                   (línea ~364 y ~440)
     → ventas.src = 'Email-Manifiesto'  ·  customers.primer_src = 'Email-Manifiesto'
```

**Por qué hay que pasar por la landing y no linkear directo al checkout:** la landing es la que
inyecta el `src`. Un link directo a Hotmart también funciona, pero se saltea la página de venta —
y esta gente es fría, necesita la página.

**La consulta para saber cuánto vendió** (MCP de Supabase, proyecto `wxyimqkjlwfncvzozpjy`):

```sql
select count(*) ventas, sum(comision_usd) neto_jose
from ventas where src = 'Email-Manifiesto';
```

⚠️ **`Email-Manifiesto` no se carga en la tabla `campanas`**, igual que `Email-Oferta`,
`recup-abandono` y `recup-rechazo`. Esa tabla es de **anuncios**: gasto, CTR, creativo, frecuencia.
Un mail no tiene nada de eso, y no tiene dónde poner lo único que sí importa medirle — aperturas.

## Cómo se actualizan solas las métricas del mail

Las de email van por otro lado, y **ya funciona sin tocar nada más**:

```
Brevo (eventos) → cron /api/salud (16:00 UTC = 18:00 España, todos los días)
                → brevo-events-sync.js → comunicaciones_email → vista v_embudo_email
```

La clave está en [brevo-events-sync.js:92](../../api/_lib/brevo-events-sync.js#L92):

```js
campana: ev.tag || porAsunto.get(ev.subject) || null,
```

Como el plan Starter no deja poner `tag` en una campaña, la atribución entra **por el asunto**.
Ese camino ya existía —se construyó porque el Regalo 1 y el Regalo 2 también salen sin tag— y para
usarlo alcanza con que el flujo esté cargado en la base. Lo está, desde el 18/08:

| tabla | qué se cargó |
|---|---|
| `funnels` | `email-manifiesto` · "Canal 4 — Manifiesto · tanda única a toda la base" · tipo `venta-directa` |
| `funnel_steps` | 3 pasos: el mail (con `brevo_tag='email-manifiesto'` y el asunto exacto), la landing y el checkout |

**Consultar las métricas:**

```sql
select * from v_embudo_email where brevo_tag = 'email-manifiesto';
-- enviados · entregados · abiertos · clics · rebotes · spam
```

🔴 **El asunto tiene que coincidir carácter por carácter.** Si alguien edita el asunto en Brevo y no
toca `funnel_steps.contenido_asunto`, la campaña deja de figurar — y no falla: simplemente muestra
cero, que es indistinguible de "no la abrió nadie". Verificado el 18/08: ningún otro paso usa este
mismo asunto, así que no hay choque.

ℹ️ El mail de prueba que se mandó antes llevaba `[PRUEBA]` adelante, así que **no ensucia estos
números**: no matchea el asunto y queda fuera de la campaña.

### Qué esperar, para no leer mal el resultado

El mail de oferta del embudo salió a 686 personas: **95 aperturas (14%), 16 clics (2%), 0 ventas
atribuidas.** Esta base es la misma gente, un poco más fría. Con ~1.115 destinatarios, el rango
realista es **10-25 clics y 0-1 ventas**.

**Eso significa que esta campaña no se puede juzgar por las ventas: no hay muestra.** Lo que sí
mide, y para lo que sirve de verdad, es **quién sigue vivo en la lista** — aperturas y clics
limpian la base antes de cualquier envío futuro.

## Por qué campaña de Brevo y no un script propio

Jose decidió el **13/08/2026** no sumar ninguna campaña de mails nueva hasta que el embudo de las
guías ande solo y verificado. Mandarla **como campaña de Brevo no viola esa decisión**: no agrega
motor, ni cron, ni candado que pueda fallar callado. Brevo se encarga de deduplicar, del link de
baja, de las métricas — y una campaña sólo se puede mandar una vez, así que el bug de las dos
corridas simultáneas no puede repetirse acá.

Un script propio mandando de a un mail sí habría sido un motor nuevo, con su propio riesgo de
mandar dos veces y sin link de baja firmado. Por eso no se hizo así.

## Cómo se armó (18/08/2026)

Todo por la API de Brevo, en tres pasos separados a propósito — el número de destinatarios se mira
**antes** de disparar, no después:

1. **Lista de exclusión #7** "Compradores del curso — EXCLUIR de campañas": 21 emails sacados de
   `customers` + `ventas` en Supabase. Queda viva y sirve para cualquier campaña futura.
2. **Borrador** con `listIds: [5,6]` y `exclusionListIds: [7]`, contando el público a mano y
   validando que el HTML todavía tuviera el link de baja y el `src` de atribución.
3. **Envío**, sólo después de comprobar que el borrador seguía en estado `draft` y que la cuenta
   tenía créditos de sobra (3.821 disponibles hasta el 24/08; se usaron 1.227).

### Dos cosas que Brevo rechazó, para no volver a chocarlas

- **El campo `tag` en campañas da 405** en el plan Starter (`not allowed to avail tag option`). La
  campaña se identifica por su nombre; las ventas, por el `?src=` del link.
- **La clave en `sistema-ingresos/.env.local` está guardada entre comillas.** Un script que la lea
  sin sacárselas se come un `401 Key not found`, que parece una clave revocada y no lo es.

## Estado

**18/08/2026 — ENVIADA.** Campaña Brevo #4, 1.227 destinatarios.

Quedó **sin verificar** una cosa que conviene mirar: el número **"+5.500 periodistas"** que aparece
en la landing a la que lleva el mail. Si no es real, se cae la credibilidad justo en el momento de
la compra, y este público fact-chequea para vivir.
