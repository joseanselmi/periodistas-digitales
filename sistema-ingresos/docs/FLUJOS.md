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

Todo flujo —el de una campaña de captación, el de una recuperación de carrito, el de un
post-compra— contesta las **mismas seis preguntas**. Si un flujo nuevo no las puede contestar,
no está listo para funcionar:

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
flujo nuevo pasa a ser escribir sus mails y su ficha, sin tocar el motor.

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
Todo eso vive en el motor, no en el flujo — por eso conviene que los demás flujos pasen por él.

---

## 2. `republicadores` — "Que te lean miles"

🔴 **Captura y se detiene.** Es el hueco más caro del inventario.

| | |
|---|---|
| **¿Quiénes?** | Lista Brevo **#6** "Leadgen - Republicadores" — **510 contactos** (18/08). Los da de alta el escenario de Make **9602489**. Anuncio `ad5-lectores`, **ACTIVO y gastando**. |
| **¿Día 0?** | Cuándo entra el lead. |
| **¿Qué piezas?** | **UNA**: la guía "Que te lean miles", al instante, mandada por Make (`republicadores-r1`). |
| **¿Quién NO?** | Nadie: no hay filtros. |
| **¿Tope?** | Ninguno. |
| **Motor** | **Ninguno.** `wa-funnel.js` lee **sólo la lista 5**. |

**El problema, con números (recontado el 18/08).** De los 510 de esta lista:

- **171 están también en la lista 5** (se anotaron en las dos campañas) → reciben la secuencia
  del OTRO embudo. Ojo: esos mails están escritos para el público general, no para este
  segmento, que tiene otro tono (ver la memoria del doble público).
- **339 están SÓLO acá** → recibieron la guía y **nada más**. Ni oferta, ni seguimiento.

Es decir: se paga por traerlos, se les entrega la guía, y ahí termina. Y el anuncio sigue activo.

📈 **El hueco crece.** El 10/08 eran 196 los huérfanos; el 18/08 son **339**. El anuncio siguió
captando 184 personas más en ocho días y el paso siguiente sigue sin existir.

ℹ️ El 18/08 estos 510 recibieron, por única vez, la tanda de `email-manifiesto` (ficha 8). Eso
**no cierra el hueco**: fue un envío suelto, no la secuencia que le falta a este flujo.

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
- El **mail de acceso a Leadr** → ficha 5. Hasta el 14/08 esa línea decía "lo manda la plataforma
  Leadr, no este sistema" y se terminaba ahí. Era exactamente el error que este inventario existe
  para evitar: un mail que le llega a NUESTRO comprador, disparado por NUESTRO webhook, sin ficha
  porque se ejecuta del otro lado de la frontera. Ahora tiene la suya, con las seis preguntas.

Es el flujo que Jose pidió y el único hueco declarado del inventario. Antes de escribirlo conviene
mirar qué ve hoy un comprador, para no sumar un cuarto mail a algo que quizá sólo se entiende mal.

---

## 5. `leadr-acceso` — el mes de Leadr que viene con la compra

El comprador se lleva 1 mes de Leadr Pro. Este es el mail que le da la llave para entrar a usarlo.

| | |
|---|---|
| **¿Quiénes?** | Compradores del curso (producto **7966973**). **17 reales** al 14/08. |
| **¿Día 0?** | Cuándo se aprobó la compra. |
| **¿Qué piezas?** | **1 automática** + 1 que pide la persona (ver abajo). |
| **¿Quién NO?** | 🔴 **Quien ya tenía cuenta en Leadr**: se le extiende el plan y **no recibe ningún mail**. Se le regala el Pro y no se entera. |
| **¿Tope?** | Ninguno: es uno por compra. |
| **Condición especial** | El link **vence**, y rápido. Por eso el copy no promete un plazo y la pantalla ofrece pedir otro. |

**Las piezas**

| Cuándo | Pieza | Quién la manda | Asunto |
|---|---|---|---|
| al instante | El acceso | **Leadr** (`../Leadr/app/lib/acceso.ts`) | "Tu acceso a Leadr (viene con el curso)" |
| a pedido | Link nuevo, si el anterior venció | **Leadr**, desde `/entrar` | "Tu nuevo link para entrar a Leadr" |

**Motor:** `sistema-ingresos/api/hotmart.js` dispara → llama a la API interna de Leadr
(`/api/internal/course-access`) → Leadr crea la cuenta, le pone Pro 30 días y manda el mail **por
Brevo**. Se nombra nuestro webhook porque es la parte que se puede romper de este lado: si no
llama, del otro lado no pasa nada y nadie se entera.

**Estado (14/08).** Desde que el mail sale por Brevo (30/07) **entran 3 de 6**. Antes salía por el
SMTP de Supabase, que no entrega: de los 11 compradores anteriores, **0** pudieron iniciar sesión
nunca, y uno se quejó por Hotmart. Ese arreglo es la diferencia entre 0% y 50%.

**Las tres cicatrices del link** (están en el código, se repiten acá porque cuestan caro):
el mail no sale por Supabase · lleva el `hashed_token` a `/entrar`, nunca el `action_link` (uno usa
flujo implícito y la pantalla corre en PKCE: el token se gastaba y la sesión no quedaba) · y
`/entrar` no canjea con GET, porque las precargas de Gmail se comían el token antes que la persona.

---

## 6. `leadr-reactivacion` — rescatar a quien no entró

🟡 **A mano, y está bien así** (decisión de Jose, 14/08). Una tanda de rescate se manda cuando hay
algo que decir, no cada martes. Queda escrito para que nadie lo confunda con un cron caído.

| | |
|---|---|
| **¿Quiénes?** | Dos segmentos de la base de Leadr: **A)** nunca inició sesión · **B)** ya entró alguna vez. |
| **¿Día 0?** | No hay: la tanda se arma con el estado del día en que se corre. |
| **¿Qué piezas?** | 1 por segmento. A: un link de acceso nuevo. B: qué se sumó desde la última vez. |
| **¿Quién NO?** | Para el A, quien ya entró. |
| **¿Tope?** | Ninguno. Tiene `--dry` y `--solo <email>` para probar antes de mandar la tanda. |
| **Motor** | `../Leadr/app/scripts/reactivacion-leadr.mjs` — **se corre a mano desde la terminal.** |

**Estado.** Tres tandas: 30/07, 31/07 y 02/08. **Rescatados: 1 de 18.** El resto abrió y no entró,
o ni abrió. Después del 02/08 no salió ninguna más — que es lo esperado en un flujo manual.

---

## 7. `leadr-vencimiento` — NO EXISTE

🔴 **Nadie avisa que el mes se termina.** Ni antes ni después.

| | |
|---|---|
| **¿Quiénes?** | Sería: quien tiene Pro y se le está por vencer. |
| **¿Qué piezas?** | **Ninguna.** |
| **Motor** | **Ninguno.** Verificado contra los crons de Leadr: los cinco que hay son Clara, el Director, los costos de Make y Clarity ×2. Ninguno manda correo. |

**Por qué importa, con fecha.** Es el único momento en que Leadr puede convertir a alguien en
cliente que paga. Sin aviso no hay decisión, así que la tarjeta #59 va a medir 0 conversiones **sin
poder distinguir "no quisieron" de "no se enteraron"** — que es la peor clase de cero, porque no
enseña nada.

⏰ **La primera ola vence entre el 28 y el 31/08: 6 personas.** Después, 5 más entre el 6 y el 12/09.

⚠️ Y un detalle de datos: la baja a `basic` ocurre **dentro del dashboard**, cuando la persona
entra. Quien no vuelve queda marcado `pro` en la base para siempre — ya pasa con un comprador
vencido el 06/08. Cualquier conteo de "cuántos Pro tenemos" está inflado por eso.

---

## 8. `email-manifiesto` — la tanda única a toda la base

✅ **ENVIADA el 18/08/2026 a 1.227 personas.** Un solo mail a todos los leads: la industria dejó de
sostener al periodista, y los que tienen más oficio están saliendo por su cuenta. Cierra en el
curso de $27. Campaña Brevo **#4**.

| | |
|---|---|
| **¿Quiénes?** | Listas Brevo **#5** (919) + **#6** (510), deduplicadas: **1.258 únicos** → menos 30 bajas y 1 comprador = **1.227**. |
| **¿Día 0?** | No hay: tanda única, 18/08/2026. |
| **¿Qué piezas?** | **1.** Sin secuencia ni reenvío. |
| **¿Quién NO?** | Compradores (lista de exclusión Brevo **#7**, 21 emails sacados de `customers`+`ventas`) · los dados de baja. |
| **¿Tope?** | Ninguno: salió entera. |
| **Motor** | **Ninguno, a propósito.** Campaña de Brevo disparada una vez por API. |

**Por qué no tiene motor.** La decisión del 13/08 congela las campañas de mails nuevas hasta que el
embudo de las guías ande solo. Una campaña de Brevo no agrega cron, candado ni cola que pueda fallar
callada — y sólo se puede mandar una vez, así que el bug de las dos corridas no puede repetirse acá.

**Atribución de VENTAS (verificada el 18/08).** El CTA va a `/?src=Email-Manifiesto&sck=email-manifiesto`;
`paginas/index.html` inyecta ese `src` en los botones de Hotmart, y `api/hotmart.js` lo guarda en
`ventas.src`. Se mide con `select count(*) from ventas where src='Email-Manifiesto'`.

**Métricas del MAIL — se actualizan solas.** Van por `funnels`/`funnel_steps` → el cron `/api/salud`
(18:00 España) → `comunicaciones_email` → vista `v_embudo_email`. Como el plan Starter de Brevo no
deja poner `tag` en una campaña, la atribución entra **por el asunto** (el mismo camino que ya usan
el Regalo 1 y el 2). Se consulta con
`select * from v_embudo_email where brevo_tag='email-manifiesto'`.

> 🔴 Si alguien edita el asunto en Brevo sin tocar `funnel_steps.contenido_asunto`, la campaña pasa
> a mostrar cero — que es indistinguible de "no la abrió nadie".

⚠️ **No se puede juzgar por las ventas.** El mail de oferta salió a 686 y dio 16 clics y 0 ventas;
acá el rango realista es 10-25 clics y 0-1 ventas. Lo que sí mide es **quién sigue vivo en la lista**.

📌 **Dato que salió al mandarla:** de los 21 compradores, **uno solo estaba en estas listas**. El
embudo de guías no produjo prácticamente ninguna venta — confirma por otro camino lo que ya decían
los números de Meta.

Ficha completa, asuntos y checklist de envío: [campanas/email-manifiesto/](../campanas/email-manifiesto/README.md).

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
| `republicadores` | 510 | 1 | ninguno | 🔴 339 sin secuencia · anuncio activo |
| `recuperacion-carrito` | ~9 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `recuperacion-rechazo` | ~21 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `post-compra` | — | **0** | — | 🔴 no existe |
| `leadr-acceso` | 17 | 2 | webhook → Leadr | ✅ automático · entran 3 de 6 desde el 30/07 |
| `leadr-reactivacion` | 18 | 2 | script **a mano** | 🟡 manual a propósito · 1 rescatado de 18 |
| `leadr-vencimiento` | 19 | **0** | — | 🔴 no existe · ⏰ 6 vencen el 28–31/08 |
| `email-manifiesto` | 1.227 | 1 | campaña Brevo (una vez) | ✅ enviada 18/08 |

---

## Cómo se agrega un flujo de mails nuevo

1. Escribir su ficha acá: una sección con las **seis preguntas** y una línea en la tabla.
2. Si lo alimenta una campaña de Meta, que el `brief.md` de esa campaña **nombre este flujo**.
   Uno apunta al otro; la ficha no se copia en dos lados.

**Chequeado automáticamente** por `node herramientas/verificar-repo.mjs`:

- toda campaña que CAPTURA emails (las de `sistema-ingresos/campanas/`) tiene su flujo
  registrado en este archivo — si pide un email, algo tiene que pasar después;
- todo motor que se nombra acá existe de verdad en el disco.

No es burocracia: así aparecieron los dos huecos de arriba —republicadores sin secuencia y el
post-compra inexistente—, que llevaban semanas sin que nadie los viera.

El chequeo verifica que la ficha **exista** y que su motor exista, no que la ficha esté bien:
eso lo lee una persona.
