# Flujos de MAILS — una ficha por flujo

Doc vivo. Jose no es técnico: acá está, en un solo lugar, **qué mails automáticos existen, a
quién le llegan y quién los manda.** Antes esto había que reconstruirlo mirando código, Make,
Brevo y la base cada vez.

## ⚠️ Un flujo de mails NO es una campaña de Meta

Son dos cosas distintas y no van una a una. Confundirlas fue el primer error al escribir este
doc, el 10/08/2026:

| | Campaña de Meta | Flujo de mails |
|---|---|---|
| **Qué es** | Anuncios: presupuesto, creativos, públicos | Una secuencia de mails a un grupo de gente |
| **Dónde vive** | `ads-agent/campanas/<x>/brief.md` | **este archivo** |
| **Se mide con** | gasto, CTR, costo por lead | entregas, aperturas, clics, ventas |

- Una campaña de Meta puede **no mandar ni un mail** (`interaccion` no captura nada;
  `venta-curso` va directo a la landing). Esas **no tienen ficha acá** — obligarlas a tener una
  produce fichas que dicen "ninguna pieza", que es ruido.
- Un flujo de mails puede **no tener ningún anuncio detrás** (la recuperación de carritos arranca
  con una compra fallida, no con un clic).
- Y donde sí se tocan —un anuncio de captación que alimenta una secuencia— el brief de la campaña
  **nombra** su flujo y lo deja registrado acá. Uno apunta al otro; no se copian.

Las campañas de Meta que no alimentan ningún flujo están listadas al final, sin ficha, sólo para
que nadie las busque acá y crea que falta algo.

## Cómo se lee una ficha

Todo flujo, sea una campaña de captación o la recuperación de un carrito, contesta las **mismas
cinco preguntas**. Si una campaña nueva no las puede contestar, no está lista para funcionar:

| Pregunta | Qué significa |
|---|---|
| **¿Quiénes?** | De dónde salen las personas y cuántas son |
| **¿Día 0?** | Desde qué momento se cuentan los días |
| **¿Qué piezas y cuándo?** | La secuencia de mails |
| **¿Quién NO?** | A quién hay que saltear (ya compró, se dio de baja…) |
| **¿Tope y condiciones?** | Cuántos por día y si algo retiene un envío |

**Por qué este formato.** Hoy cada flujo está escrito por separado, con su propia lógica de
"a quién le toca" y su propio conteo. Son dos motores haciendo lo mismo (`wa-funnel.js` y
`recuperacion.js`) y un tercero pendiente para el post-compra. Cuando las cinco respuestas están
escritas igual para todos, se puede pasar a **un solo motor que lea estas fichas** — y una
campaña nueva pasa a ser escribir sus mails y su ficha, sin tocar el motor.

> ⚠️ **No confundir con `funnels` / `funnel_steps` de Supabase.** Esas tablas son el mapa
> **dibujado a mano** que alimenta el panel de Campañas, y describen la intención. Ejemplo real:
> ahí figura que republicadores tiene "Secuencia de emails → Oferta del curso", y **no existe**.
> Estas fichas describen lo que el sistema hace de verdad, verificado contra el código, Make,
> Brevo y la base. Si las dos se contradicen, manda esta.

Última verificación completa: **2026-08-10**.

---

## 1. `guias-claude` — las 4 guías gratis

El embudo grande. Es el que tiene toda la maquinaria.

| | |
|---|---|
| **¿Quiénes?** | Lista Brevo **#5** "Leadgen - Guía Claude" — **919 contactos**. Entran por un formulario nativo de Meta Lead Ads; los da de alta el escenario de Make **9474482**. |
| **¿Día 0?** | Cuándo se creó el contacto en Brevo (`createdAt`). |
| **¿Qué piezas?** | **7**, ver abajo. |
| **¿Quién NO?** | Ya compró (cruce con `ventas`) · dado de baja (`emailBlacklisted`) · quien ya recibió algo hoy (uno por persona por día, marcador `WA_SENT_AT`). |
| **¿Tope?** | 500 piezas/día · 150 re-enganches/día · 80 reenvíos de oferta/día. |
| **Condición especial** | **Puerta de enganche**: la oferta NO sale a quien nunca abrió ni clicó nada en 90 días. Queda esperando; si algún día abre algo, le sale sola. |

**Las piezas**

| Día | Pieza | Quién la manda | Etiqueta en Brevo |
|---|---|---|---|
| 0 | Regalo 1 · La guía de Claude | **Make** 9474482 | `regalo1-guia-claude` |
| 2 | Regalo 2 · +50 prompts | **automatización de Brevo** (plantilla #1) | `regalo2-50-prompts` |
| 5 | Regalo 3 · El periódico digital | `api/wa-funnel.js` | `regalo3-periodico` |
| 7 | Regalo 4 · Los 5 pilares | `api/wa-funnel.js` | `regalo4-pilares` |
| 8 | Regalo 5 · Los agentes de IA | `api/wa-funnel.js` | `regalo5-agentes-ia` |
| 9 | **La oferta del curso** | `api/wa-funnel.js` | `oferta-email` |
| +48 h | Reenvío de la oferta (sólo a quien no la abrió) | `api/wa-funnel.js` | `oferta-reenvio` |
| — | Re-enganche (en lugar de la oferta, para quien nunca abrió nada) | `api/wa-funnel.js` | `reenganche` |

**Motor:** `sistema-ingresos/api/wa-funnel.js` · cron diario **15:00 España**.

**Estado y resultado.** El anuncio está **PAUSADO desde el 31/07**: gastó $38 y trajo 944
personas (4 centavos por lead). **De esas 944, 1 compró.** Ver [EMBUDO-REGALOS.md](EMBUDO-REGALOS.md)
para el detalle de cómo decide qué mandarle a quién.

**Lo que este flujo tiene y los otros no:** candado contra corridas simultáneas, reserva del
marcador antes de enviar, link de baja en las 6 piezas propias, alarma de volumen y tope diario.
Todo eso vive en el motor, no en la campaña — por eso conviene que los demás flujos pasen por él.

---

## 2. `republicadores` — "Que te lean miles"

🔴 **Captura y se detiene.** Es el hueco más caro del inventario.

| | |
|---|---|
| **¿Quiénes?** | Lista Brevo **#6** "Leadgen - Republicadores" — **326 contactos**. Los da de alta el escenario de Make **9602489**. Anuncio `ad5-lectores`, **ACTIVO y gastando**. |
| **¿Día 0?** | Cuándo entra el lead. |
| **¿Qué piezas?** | **UNA**: la guía "Que te lean miles", al instante, mandada por Make (`republicadores-r1`). |
| **¿Quién NO?** | Nadie: no hay filtros. |
| **¿Tope?** | Ninguno. |
| **Motor** | **Ninguno.** `wa-funnel.js` lee **sólo la lista 5**. |

**El problema, con números (verificado 10/08).** De los 326 de esta lista:

- **130 están también en la lista 5** (se anotaron en las dos campañas) → reciben la secuencia
  del OTRO embudo. Ojo: esos mails están escritos para el público general, no para este
  segmento, que tiene otro tono (ver la memoria del doble público).
- **196 están SÓLO acá** → recibieron la guía y **nada más**. Ni oferta, ni seguimiento.

Es decir: se paga por traerlos, se les entrega la guía, y ahí termina. Y el anuncio sigue activo.

**Lo mínimo para cerrarlo:** darle una secuencia. Con el motor único, es escribir los mails y su
ficha. Sin el motor único, es duplicar `wa-funnel.js` para la lista 6 — que es exactamente lo que
no conviene hacer una tercera vez.

---

## 3. `recuperacion-carrito` y `recuperacion-rechazo`

Los dos flujos son el mismo motor con distinta secuencia y copy.

| | |
|---|---|
| **¿Quiénes?** | Filas de `clientes_potenciales` (Supabase), separadas por la columna `tipo`: `carrito_abandonado` o `pago_rechazado`. Las escribe el webhook de Hotmart. |
| **¿Día 0?** | `ocurrido_en` — cuándo abandonó o le rechazaron la tarjeta. |
| **¿Qué piezas?** | **2**: el paso 1 **al instante** (lo dispara el webhook, no espera al cron) y el recordatorio a las **24 h**. |
| **¿Quién NO?** | Ya compró (cruce con `ventas` → pasa a `recuperado`) · ya marcado `perdido` · menos de 12 h desde el último mensaje. |
| **¿Tope?** | 80 por corrida. |
| **Condición especial** | Se apaga entero con `RECUP_ENABLED`. Hoy está **encendido**. |

**Motor:** `api/hotmart.js` (el instantáneo) + `api/recuperacion.js` (cron **17:00 España**).
El copy de los dos mails vive en `api/_lib/recup-email.js` — un solo dueño, compartido.

**Canal:** email, y sólo email desde el 09/08. Antes salía por WhatsApp, que no entregaba — ver
[RECUPERACION.md](RECUPERACION.md).

**Estado:** ~30 personas en total en la tabla, **0 recuperadas**. Al pasar a email recién ahora
empieza a medirse de verdad: la rama de WhatsApp, que era la principal, no llegaba a nadie.

---

## 4. `post-compra` — NO EXISTE

| | |
|---|---|
| **¿Quiénes?** | Sería: quien acaba de comprar (`ventas` / `customers`). |
| **¿Qué piezas?** | **Ninguna nuestra.** |

**Verificado el 09/08 contra Brevo**, comprador por comprador: **ningún comprador recibe un mail
nuestro después de comprar.** Lo que sí recibe:

- Los mails de **Hotmart** (confirmación y acceso al curso) — no los controlamos.
- El **mail de acceso a Leadr**, que manda la plataforma Leadr, no este sistema.

Es el flujo que Jose pidió y el único hueco declarado del inventario. Antes de escribirlo conviene
mirar qué ve hoy un comprador, para no sumar un cuarto mail a algo que quizá sólo se entiende mal.

---

## Campañas de Meta que NO alimentan ningún flujo de mails

No tienen ficha porque no mandan mails. Se listan sólo para que nadie las busque acá:

| Campaña de Meta | Por qué no tiene flujo |
|---|---|
| `venta-curso` (`ad1-fomo`) | Va directo a la landing y al checkout. **No captura el email antes de comprar**, así que no hay a quién escribirle. Por acá vinieron 26 de las 27 ventas. Lo que recibe alguien *después* de comprar es la ficha 4 (`post-compra`), que no existe. |
| `interaccion` | ⛔ **Gasto de marca, a propósito. No proponer apagarla.** No captura nada y no manda nada. ~$2,50/día, $212,94 desde el 15/11/2025, ACTIVA. Está anotada porque en los números crudos de Meta una campaña de marca es **indistinguible de una fuga** —gasto y cero ventas— y ya se propuso apagarla en cuatro sesiones distintas. |

---

## Resumen

| Flujo | Personas | Piezas | Motor | Estado |
|---|---|---|---|---|
| `guias-claude` | 919 | 7 | `wa-funnel.js` | anuncio pausado · 1 venta de 944 |
| `republicadores` | 326 | 1 | ninguno | 🔴 196 sin secuencia · anuncio activo |
| `recuperacion-carrito` | ~9 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `recuperacion-rechazo` | ~21 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `post-compra` | — | **0** | — | 🔴 no existe |

---

## Cómo se agrega un flujo de mails nuevo

1. Escribir su ficha acá: una sección con las **seis preguntas** y una línea en la tabla.
2. Si lo alimenta una campaña de Meta, que el `brief.md` de esa campaña **nombre este flujo**.
   Uno apunta al otro; la ficha no se copia en dos lados.

**Chequeado automáticamente** por `node herramientas/verificar-repo.mjs`:

- toda carpeta de `sistema-ingresos/campanas/` (las campañas de captación, que sí tienen
  secuencia de mails) aparece en este archivo;
- todo motor que se nombra acá existe de verdad en el disco.

No es burocracia: así aparecieron los dos huecos de arriba —republicadores sin secuencia y el
post-compra inexistente—, que llevaban semanas sin que nadie los viera.

El chequeo verifica que la ficha **exista** y que su motor exista, no que la ficha esté bien:
eso lo lee una persona.
