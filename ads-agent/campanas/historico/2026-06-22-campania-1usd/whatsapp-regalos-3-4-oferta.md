# WhatsApp — Regalo 3, Regalo 4 y Oferta del curso

Continuación del embudo de email (Regalo 1 = prompt maestro, Regalo 2 = +50 prompts).
Borrador para validar con Jose antes de cargar como plantillas en Meta. Precio del curso
verificado en vivo el 2026-06-26 en `sistema-ingresos/paginas/landing.html`: **$27 USD pago único**
(no asumir este número en el futuro sin volver a verificar — ver memoria
`feedback_diferenciacion_productos`).

Cada uno de los 3 mensajes va como **plantilla pre-aprobada de Meta** (el negocio escribe
primero, no puede ser texto libre). Si el lead responde dentro de las 24hs siguientes, se abre
ventana gratis — por eso los 3 terminan con una pregunta.

## Por qué este orden (lógica narrativa)

Regalo 1+2 (mail) ya dejaron al lead sabiendo producir contenido más rápido con IA — el Regalo 2
termina literalmente diciendo "ya tenés el primer ladrillo... te vamos a escribir por WhatsApp
con el siguiente paso". Regalo 3 cambia de eje: de "producir contenido" a "tener un canal propio"
— entrega una guía real (PDF) de cómo armar un periódico digital en IG/FB, y cierra con el gancho
de que hay quienes ya escalan esto con IA a 10 periódicos simultáneos, viviendo de ello como
autónomos. Ese gancho es lo que Regalo 4 retoma y la Oferta resuelve.

---

## Regalo 3 — Plantilla `regalo3_periodico_digital`

**Categoría:** Marketing
**Header:** Documento — adjunta `guia-periodico-digital-ig-fb.pdf`
(ya escrito, exportado y publicado: https://sistemadeingresosdiariosia.com/guia-periodico-digital-ig-fb.pdf
— guía de 10 páginas: nicho/nombre, configurar perfil IG+FB con plantilla de bio, los 4 formatos
de contenido que funcionan, cómo armar el calendario del mes con tabla de ejemplo, frecuencia y
horarios. Sin mención de precio, cumple la regla de revelar precio solo en la Oferta.)
**Body** (variable {{1}} = nombre):

```
Hola {{1}}! Antes de seguir: ¿llegaste a ver los 2 regalos que te mandamos por mail? Buscá los asuntos "Tu guía ya está lista" y "La versión completa: +50 prompts" — si no aparecen, revisá spam.

¿Sabías que hay muchos periodistas ganando dinero con su propio periódico digital en Instagram y Facebook?

Te dejamos el Regalo 3: una guía básica y fácil para crear el tuyo desde cero — hasta cómo planificar el contenido de todo el mes.

Y ojo: hay periodistas que ya lo hacen con IA y llevan hasta 10 periódicos en simultáneo, viviendo solo de esto como autónomos. Eso te lo contamos en el próximo mensaje 👀
```

**Footer:** Periodistas del Futuro IA
**Botón (quick reply):** `Quiero saber cómo 👀`

---

## Regalo 4 — Plantilla `regalo4_sistema_completo`

**Categoría:** Marketing
**Header:** Documento — adjunta `guia-5-pilares-ingresos-periodico-digital.pdf`
(https://sistemadeingresosdiariosia.com/guia-5-pilares-ingresos-periodico-digital.pdf — guía
conceptual de los 5 pilares que conectan contenido+canal con ingreso recurrente: cliente ideal,
oferta de alto impacto, sistema de ventas, atracción/tráfico, optimización. A propósito da el
"qué" y el "por qué" de cada pilar con una pregunta guía, no el "cómo" paso a paso — eso es lo
que vende el curso. Sin mención de precio.)
**Body:**

```
Te lo contamos: los periodistas que llevan hasta 10 periódicos digitales en simultáneo no escriben cada posteo a mano en cada uno — usan un sistema donde la IA hace la producción de contenido (como ya viste en los Regalos 1 y 2) y ellos solo administran cliente ideal, oferta, ventas y tráfico para cada periódico.

Te dejamos el Regalo 4: una guía con las 5 piezas que conectan todo lo que ya armaste con un ingreso que se repite cada semana.

¿Querés que te muestre cómo se implementa cada una, paso a paso?
```

**Botones (quick reply):** `Sí, mostrámelo` / `Todavía no`

---

## Oferta — Plantilla `oferta_sistema_ingresos`

**Categoría:** Marketing
**Body** (revisado 2026-06-26 a pedido de Jose: sin precio en el mensaje — el precio se ve
recién en la página, no acá. Se llama "Oferta" en este doc pero el tono es de regalo/invitación,
no de venta directa):

```
Antes de cerrar, te tenemos un regalo más.

Armamos una página completa donde te mostramos en profundidad cómo se implementa todo esto, paso a paso — y cómo ya lo están haciendo otros periodistas que arrancaron exactamente como vos.

👉 [link]

Por haber llegado hasta la guía 4, ahí te va a estar esperando un regalo extra — para quien llegó hasta el final del camino.
```

**Botón (CTA URL):** `Ver la página` → `https://sistemadeingresosdiariosia.com/?src=WhatsApp-Oferta&sck=wa-oferta`
(va a la landing completa —con testimonios de otros periodistas y el detalle paso a paso—, NO directo al checkout; el precio y el botón de compra ya están en esa página, no hace falta repetirlo en el mensaje)

**Nota:** "el regalo extra" de la landing es uno de los bonos que ya incluye la oferta (ver
`sistema-ingresos/paginas/index.html`, sección de bonos) — no es una pieza nueva a construir, es
posicionar uno de los bonos existentes como recompensa por haber leído las 4 guías.

**Nota 2:** si el lead no respondió la pregunta del Regalo 4 (ventana de 24hs cerrada), esta
plantilla también sirve como mensaje en frío — no depende de que haya respuesta previa.

---

## Cadencia propuesta (a confirmar con Jose)

| Paso | Cuándo |
|---|---|
| Regalo 1 (mail) | Inmediato al dejar el lead |
| Regalo 2 (mail) | 48hs después (ya activo en Brevo) |
| Regalo 3 (WhatsApp) | Día 5 |
| Regalo 4 (WhatsApp) | Día 7 |
| Oferta (WhatsApp) | Día 9 |

## Pendiente técnico (cuando exista la conexión de Make)

- Normalizar números argentinos antes de cualquier envío: si el número empieza con `+54` y el
  dígito siguiente NO es `9`, insertar el `9` ahí (ej. `+541133418561` → `+5491133418561`).
  Ver `reference_whatsapp_business_api` (memoria) para los 4 números reales ya confirmados con
  el bug.
- Las 3 plantillas de arriba deben cargarse y aprobarse en WhatsApp Manager ANTES de armar el
  escenario de Make (la aprobación puede tardar horas).
