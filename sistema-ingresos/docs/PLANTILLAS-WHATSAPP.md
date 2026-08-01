# Plantillas de WhatsApp (Meta) — referencia viva

Doc vivo. Copia local del **cuerpo real** de las plantillas aprobadas por Meta, para no
tener que consultarlas a la API cada vez y para usarlas de fuente cuando las editemos.
Jose no es técnico → acá va todo el contexto.

- **WABA (WhatsApp Business Account):** `3355115811326692`
- **Phone number ID:** `1250736061447802` (número que envía; token en Vercel = `WHATSAPP_TOKEN`)
- **Idioma de todas:** `es` · **Categoría:** `MARKETING` (salvo `hello_world` = utility)
- **Checkout de Hotmart (producto):** `https://pay.hotmart.com/P106404871J?checkoutMode=10`
- Última sincronización con Meta: **2026-07-09**

> ⚠️ **Editar una plantilla aprobada obliga a re-mandarla a aprobación de Meta** (y hay
> tope de ediciones por período). Los textos del bot y de los emails se cambian en código
> y se deployan al toque; los de estas plantillas conviene tocarlos con criterio y en tanda.

## Cómo volver a bajarlas (si cambian en Meta)

```bash
cd sistema-ingresos
vercel env pull .env.local --environment=production --yes   # trae WHATSAPP_TOKEN (gitignored)
TOKEN=$(grep '^WHATSAPP_TOKEN=' .env.local | cut -d= -f2-)
curl -s "https://graph.facebook.com/v21.0/3355115811326692/message_templates?fields=name,status,category,language,components&limit=60&access_token=$TOKEN"
```

## Mapa: qué plantilla usa cada cosa

| Plantilla | Estado | La dispara | Nota |
|---|---|---|---|
| `regalo3_periodico_digital` | ✅ EN USO | `api/wa-funnel.js` (día 5) | Header = PDF adjunto + botón quick-reply |
| `regalo4_sistema_completo` | ✅ EN USO | `api/wa-funnel.js` (día 7) | Header = PDF adjunto + 2 quick-reply |
| `oferta_sistema_ingresos` | ✅ EN USO | `api/wa-funnel.js` (día 9) | La que **vende** — botón a la landing |
| `recup_abandono_1` | ✅ EN USO | webhook Hotmart (instantáneo) | Carrito abandonado, 1er toque |
| `recup_abandono_2` | ✅ EN USO | `api/recuperacion.js` (cron) | Carrito abandonado, recordatorio |
| `recup_rechazo_1` | ✅ EN USO | webhook Hotmart (instantáneo) | Pago rechazado, 1er toque |
| `recup_rechazo_2` | ✅ EN USO | `api/recuperacion.js` (cron) | Pago rechazado, recordatorio |
| `seguimiento_lead` | ✅ EN USO | reactivación de leads fuera de 24 h | Botón a la landing |
| `regalo3_link_periodico` | 🗄️ LEGACY | — | Versión vieja del Regalo 3 (PDF por botón URL). No la usa el código |
| `regalo4_link_pilares` | 🗄️ LEGACY | — | Versión vieja del Regalo 4. No la usa el código |
| `hello_world` | 🗄️ default | — | Plantilla de ejemplo de Meta. Ignorar |

`{{1}}` = primer nombre de la persona (lo reemplaza el código antes de enviar).

---

## Embudo de regalos (`api/wa-funnel.js`)

> Acá están las **plantillas**. La lógica de **quién recibe qué y cuándo** —que desde el
> 2026-08-01 va por email y se decide por lo que le FALTA a cada lead, no por `WA_STAGE`—
> está en [EMBUDO-REGALOS.md](EMBUDO-REGALOS.md).

### `regalo3_periodico_digital` ✅
- **Header:** DOCUMENT (se adjunta el PDF `guia-periodico-digital-ig-fb.pdf`)
- **Footer:** `Periodistas del Futuro IA`
- **Botón:** quick-reply `Quiero saber cómo` → lo responde el bot (`asistente.js`) con info + link
- **Body:**
```
Hola {{1}}! Antes de seguir: ¿llegaste a ver los 2 regalos que te mandamos por mail? Buscá los asuntos "Tu guía ya está lista" y "La versión completa: +50 prompts" — si no aparecen, revisá spam.

¿Sabías que hay muchos periodistas ganando dinero con su propio periódico digital en Instagram y Facebook?

Te dejamos el Regalo 3: una guía básica y fácil para crear el tuyo desde cero — hasta cómo planificar el contenido de todo el mes.

Y ojo: hay periodistas que ya lo hacen con IA y llevan hasta 10 periódicos en simultáneo, viviendo solo de esto como autónomos. Eso te lo contamos en el próximo mensaje 👀
```

### `regalo4_sistema_completo` ✅
- **Header:** DOCUMENT (se adjunta el PDF `guia-5-pilares-ingresos-periodico-digital.pdf`)
- **Botones:** quick-reply `Sí, mostrámelo` / `Todavía no` → los responde el bot
- **Body:**
```
Te lo contamos: los periodistas que llevan hasta 10 periódicos digitales en simultáneo no escriben cada posteo a mano — usan un sistema donde la IA hace la producción de contenido (como ya viste en los Regalos 1 y 2) y ellos solo administran cliente ideal, oferta, ventas y tráfico.

Te dejamos el Regalo 4: una guía con las 5 piezas que conectan todo lo que ya armaste con un ingreso que se repite cada semana.

¿Querés que te muestre cómo se implementa cada una, paso a paso?
```

### `oferta_sistema_ingresos` ✅  ← la que vende
- **Botón:** URL `Ver el curso` → `https://sistemadeingresosdiariosia.com/?src=WhatsApp-Oferta&sck=wa-oferta`
- **Body (nuevo — ⏳ en re-aprobación de Meta desde 2026-07-09):**
```
Hola {{1}} 🙌 Llegaste hasta el final de las 4 guías. Ya tenés las piezas sueltas; lo que falta es armarlas en un sistema que trabaje para vos.

Para eso está el *curso Sistema de Ingresos Diarios*: te lleva paso a paso, con el método completo, desde donde estás hoy hasta generar tus propios ingresos con tu periódico digital y la IA — sin depender de un medio.

En esta página te mostramos cómo funciona y cómo podés empezar hoy 👇
```
> ✅ **Reescrita 2026-07-09** (aprobada por Jose): ahora posiciona el **curso** que los lleva
> al objetivo y hace tee-up de la landing, en vez del "regalo extra" ambiguo de antes. Sigue
> sin revelar el precio (lo hace la página). El nombre va tras "Hola" porque Meta no permite
> una variable al principio del texto. **Hasta que Meta apruebe, se envía la versión anterior.**
> <details><summary>Body anterior (por si Meta rechaza)</summary>
>
> `Antes de cerrar, te tenemos un regalo más. Armamos una página completa donde te mostramos en profundidad cómo se implementa todo esto, paso a paso — y cómo ya lo están haciendo otros periodistas que arrancaron exactamente como vos. Por haber llegado hasta la guía 4, ahí te va a estar esperando un regalo extra — para quien llegó hasta el final del camino.`
> </details>

---

## Recuperación de carritos y pagos (`api/recuperacion.js` + webhook)

Todas llevan `{{1}}` = nombre y **botón URL directo al checkout de Hotmart** con el `src`
que atribuye la venta recuperada en `ventas` (campo "Origen" de Hotmart).

### `recup_abandono_1` ✅
- **Botón:** URL `Retomar mi lugar` → `…/P106404871J?checkoutMode=10&src=recup-abandono&utm_source=recuperacion&utm_medium=whatsapp`
- **Body:**
```
Hola {{1}} 👋 Vi que estabas por entrar al Sistema de Ingresos Diarios y justo se cortó antes de terminar. ¿Te quedó alguna duda? Escribime por acá y te ayudo. Y si querés retomar, es en un toque 👇
```

### `recup_abandono_2` ✅
- **Botón:** URL `Retomar mi lugar` → `…&src=recup-abandono&utm_source=recuperacion&utm_medium=whatsapp`
- **Body:**
```
Hola {{1}}, soy Jose 🙂 No te quiero insistir, solo asegurarme de que no te quedaste con una duda dando vueltas. Si hay algo que te frena, escribime por acá y lo vemos juntos 👇
```

### `recup_rechazo_1` ✅
- **Botón:** URL `Reintentar mi pago` → `…&src=recup-rechazo&utm_source=recuperacion&utm_medium=whatsapp`
- **Body:**
```
Hola {{1}} 👋 Quisiste entrar al Sistema de Ingresos pero tu pago no se llegó a procesar (suele ser algo del banco o la tarjeta). Se arregla en 1 minuto 👇 Cualquier cosa, escribime.
```

### `recup_rechazo_2` ✅
- **Botón:** URL `Completar mi pago` → `…&src=recup-rechazo&utm_source=recuperacion&utm_medium=whatsapp`
- **Body:**
```
Hola {{1}}, te guardé el lugar. Tu pago quedó pendiente — cuando quieras lo reintentás acá 👇 Si tuviste un problema, respondeme y lo resolvemos.
```

### `seguimiento_lead` ✅
Reactiva leads fuera de la ventana de 24 h.
- **Botón:** URL `Quiero verlo` → `https://sistemadeingresosdiariosia.com/?src=wa-seguimiento`
- **Body:**
```
Hola {{1}} 👋 ¿Pudiste ver la guía que te enviamos?

Si querés, te muestro cómo dar el primer paso para generar tus propios ingresos con IA 👇
```

---

## Legacy (aprobadas pero NO las usa el código)

Se pueden archivar en Meta. Se conservan acá solo por registro.

### `regalo3_link_periodico` 🗄️
- **Botón:** URL `Abrir la guia` → `…/api/d?file=guia-periodico-digital-ig-fb.pdf&src=WhatsApp-Regalo3&sck=wa3`
- **Body:**
```
🎁 ¡Acá está tu guía para armar tu periódico digital en Instagram y Facebook!

Tocá el botón de abajo para abrirla y guardarla. 👇
```

### `regalo4_link_pilares` 🗄️
- **Botón:** URL `Abrir la guia` → `…/api/d?file=guia-5-pilares-ingresos-periodico-digital.pdf&src=WhatsApp-Regalo4&sck=wa4`
- **Body:**
```
🎁 ¡Tu segunda guía: los 5 pilares para generar ingresos con tu periódico digital!

Tocá el botón para abrirla. 👇
```
