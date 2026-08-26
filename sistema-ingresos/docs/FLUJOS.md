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

Última verificación completa: **2026-08-10**. · `republicadores` revisado y modificado el **2026-08-18** y el **2026-08-26**.

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
| **¿Qué piezas?** | **UNA**: la guía "Que te lean miles", al instante, mandada por Make (`republicadores-r1`). **Desde el 18/08 el botón lleva a Leadr** (`www.leadr.cloud/bonus/3?src=Email-Republicadores-R1`), no al PDF. **Desde el 26/08 lleva además el correo** (`&e=…`): la puerta llega con el campo lleno y se entra con un botón. |
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

### 🚪 26/08/2026 — se saca el muro de la puerta (tarjeta #151)

**Recontado el 26/08, y el recuento cambió el diagnóstico.** La primera medición decía "197 tocan
la puerta, entran 23 = 12%". Separando quién es quién, del 18 al 26/08 (8 días):

| Quién llega a `/bonus/3` | Personas (IPs) | Crearon cuenta | Entra |
|---|---|---|---|
| Botón del **formulario de Meta** (`ad5-lectores`) | **129** | 19 | **15%** |
| Botón del **mail** (`Email-Republicadores-R1`) | **15** | 5 | **33%** |
| Previsualizador de Facebook | 111 | — | no son personas |

Tres cosas que sólo se ven separando así:

1. **Los 197 incluían 111 IPs del previsualizador de Facebook.** Personas de verdad fueron ~145,
   y entraron 27 → **19%**. Malo igual, pero ése es el número honesto.
   (Es el mismo bicho que ya había inflado 87 de 180 descargas de PDF: descontarlo no es opcional.)
2. **El mail es sólo el 10% de la puerta** — 15 personas contra 129. Ponerle un link personal al
   mail, que era el plan original de la tarjeta, arreglaba a esos 15. La fuga grande está del otro
   lado, en el botón del formulario, que es inmutable y **no puede llevar nada personal**.
3. **Entrar con email y contraseña estaba muerto.** De las 24 cuentas con origen, **22 entraron por
   Google**. Las 2 que eligieron email+contraseña quedaron con `email_confirmed_at` y
   `last_sign_in_at` en null: nunca entraron. Es la enfermedad de siempre — `signUp()` manda el mail
   de confirmación por el SMTP de Supabase, que no entrega. La única puerta que funcionaba era
   Google, y encima Google muestra el dominio raro de Supabase (tarjeta #144).

**Y el que entra, lee**: de las 24 cuentas, 22 vieron contenido. No hay un problema de interés —
hay una puerta cerrada. Traer a cada persona cuesta 3 centavos y se pierden ~14 por día en los tres
segundos entre el clic y el formulario.

**Lo que se hizo (26/08).** Dos arreglos, en ese orden:

- **La puerta**, para los 129: `/bonus/N` ya no dibuja el login. Dibuja `PuertaGuia` — **un campo,
  ninguna contraseña**: escribís tu correo y quedás adentro, en la guía. Es un `<form>` nativo con
  un 303, sin `fetch` y sin JavaScript, porque por ahí entra el navegador de adentro de Facebook,
  que es donde se registran el 100% de nuestros errores de JS. Google sigue estando, abajo.
- **El mail**, para los 15: el botón lleva `&e=<correo>`, así que la puerta llega **con el campo ya
  lleno** y sólo hay que apretar un botón. Sigue pasando por `/api/d` —la serie histórica de la
  campaña no se corta—. En Make es un parámetro más en la URL: ni módulo nuevo, ni secreto, ni
  depender de que Leadr conteste para que el correo salga.

**La regla, y por qué es segura.** La decide el alta misma, no una consulta previa: si la cuenta
**no existía**, se crea y entra en el acto —es tan seguro como no haber tenido cuenta—; si **ya
existía**, link por Brevo y nada más, porque ahí puede haber un comprador o un Pro. El `&e=` no es
una credencial: es exactamente lo que la persona podría tipear en el campo, y escribir el correo de
otro nunca alcanza para entrar en su cuenta.

⚠️ **Eso depende de que nadie pre-cree cuentas.** Se evaluó el camino de crearle la cuenta al lead
cuando entra (que era el plan original de la tarjeta) y se descartó por dos motivos que sólo se ven
juntos: daría de alta ~24 cuentas por día de gente que quizá nunca entre —y `cuentas nuevas por
día`, que es justo la métrica con la que se mide este arreglo, dejaría de significar nada—, y
además daría vuelta la regla de arriba, mandando por correo justo a los leads. El aviso está
escrito en `Leadr/app/lib/puerta.ts`, donde vive la regla.

**Cómo se verifica que funcionó** (a los 7 días, o sea el **02/09/2026**): cuentas nuevas por día y
por origen. Hoy son 3-4 por día; con los mismos ~24 leads diarios deberían ser 12-18.

### 🎁 18/08/2026 — el regalo pasó a entregarse DENTRO de Leadr (tarjeta #136)

El botón del mail del día 0 **ya no baja un PDF**: abre
`www.leadr.cloud/bonus/3?src=Email-Republicadores-R1`, donde la guía se lee entera y también se
puede descargar. El cambio se hizo en el escenario de Make **9602489**, módulo 2 — el resto del
escenario (alta en Brevo lista 6, POST a `/api/lead`, link de baja) quedó igual.

**Por qué acá y no en `guias-claude`:** la tarjeta pedía cambiar el día 0 de `guias-claude`, pero
ese embudo **no recibe un lead desde el 31/07** (anuncio pausado, y Jose decidió no reactivarlo
todavía). Todo el tráfico nuevo entra por acá: 184 personas en 7 días.

**Qué cambia para medir — y qué NO.** El botón sigue pasando por `/api/d`, ahora con `&ir=leadr-bonus-3`:
registra el MISMO evento `pdf_open`, con el mismo `file` y el mismo `src`, y recién después redirige
a Leadr. **La serie histórica de la campaña no se corta**, que es lo que permite comparar el antes
con el después. `payload.destino` dice `pdf` o `leadr`.

⚠️ Lo que **no** es comparable: antes un clic significaba que la persona YA tenía la guía; ahora
significa que llegó a la puerta de Leadr y puede no entrar. Ese segundo tramo se mide del otro
lado — `content_views` en Leadr — que además dice QUIÉN, cosa que el PDF anónimo nunca dio.

O sea, el embudo entero queda así:

| Se mide | Dónde | Qué contesta |
|---|---|---|
| clics en el botón | `events.pdf_open` (marketing) | cuánta gente pidió la guía — **serie continua desde siempre** |
| cuentas creadas | `users.origen` (Leadr) | cuántas de ésas entraron |
| lecturas | `content_views` (Leadr) | cuántas la leyeron de verdad, y quiénes |

⚠️ Se cambió sólo la pieza del día 0. Los links a `/api/d` de los mails YA ENVIADOS siguen
funcionando y no se tocan.

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

**Métricas del MAIL — corregido el 18/08 a la noche.** Se consulta con
`select * from v_embudo_email where brevo_tag='email-manifiesto'` y hoy devuelve
**1.227 enviados · 1.189 entregados · 65 aperturas · 7 clics · 48 rebotes** (números deduplicados:
1.227 filas para 1.227 emails distintos, o sea **nadie lo recibió dos veces** — la duda que había
quedado abierta esa noche).

> 🔴 **Durante todo el 18/08 esta ficha dijo algo falso y el panel mostró CERO.** Decía que las
> métricas iban por `funnels`/`funnel_steps` → cron `/api/salud` → `comunicaciones_email`, y que la
> atribución entraba por el asunto. **Ninguna de las dos cosas podía funcionar**, y ninguna se había
> probado contra los datos — sólo leído en el código, donde cada eslabón existía:
>
> - el cron le pregunta a `/v3/smtp/statistics/events`, que es la API **transaccional** y **no
>   contiene una sola campaña de marketing**;
> - el webhook de campañas **ni siquiera existía** (había uno solo, de tipo `transactional`);
> - y el payload de una campaña **no trae `subject`**, así que la atribución por asunto era
>   imposible de entrada.
>
> Cómo funciona ahora: **webhook de tipo `marketing`** → `/api/brevo-webhook` en Leadr →
> `comunicaciones_email`, atribuyendo por **`funnel_steps.brevo_camp_id`** (el número de campaña de
> Brevo, que nadie puede editar sin querer — a diferencia del asunto). Una campaña nueva **tiene que
> cargar su `brevo_camp_id`**; si no, sus filas quedan sin atribuir (visibles, no perdidas).
>
> Lo vigila el **FLUJO 6 del Panel de Salud** (`saludCampanas` en `api/salud.js`): le pregunta a
> Brevo cuánto entregó de verdad y lo compara con lo guardado. Si Brevo dice 1.353 y tenemos 0,
> avisa en rojo el mismo día.

⚠️ **No se puede juzgar por las ventas.** El mail de oferta salió a 686 y dio 16 clics y 0 ventas;
acá el rango realista es 10-25 clics y 0-1 ventas. Lo que sí mide es **quién sigue vivo en la lista**.

📌 **Dato que salió al mandarla:** de los 21 compradores, **uno solo estaba en estas listas**. El
embudo de guías no produjo prácticamente ninguna venta — confirma por otro camino lo que ya decían
los números de Meta.

Ficha completa, asuntos y checklist de envío: [campanas/email-manifiesto/](../campanas/email-manifiesto/README.md).

---

## 9. `email-comunidad` — el semanal a los activos

🟡 **Andamiaje montado el 19/08/2026. Todavía no salió ningún envío.** Un mail por semana, para
siempre, a quien sigue leyendo: qué pasa en la comunidad, cómo le va a los alumnos, el oficio.
Cierra en el curso de $27 o en Leadr. **Es el único canal que no se paga** — no se apaga cuando se
pausa un anuncio, y mejora envío a envío en vez de gastarse.

| | |
|---|---|
| **¿Quiénes?** | Los **ACTIVOS**, calculados de nuevo antes de cada envío. Hoy: **425 activos + 299 nuevos = 724**. |
| **¿Día 0?** | No hay. Es un canal permanente, no una secuencia: cada envío es su propio día 0. |
| **¿Qué piezas y cuándo?** | Una por semana, día y hora fijos. Se anotan de a una, a medida que salen. |
| **¿Quién NO?** | Compradores · marcó spam (para siempre) · rebota siempre · **dormidos** · dados de baja. |
| **¿Tope y condiciones?** | 1 envío por semana. ~2.900 mails/mes de un plan de ~10.000, con el embudo usando ~7.500. |
| **Motor** | **Ninguno, a propósito.** Una campaña de Brevo por semana, programada a mano. |

### ⚠️ La audiencia es DINÁMICA — la lista no es la audiencia

La lista **#8 de Brevo es sólo el vehículo**. Quién recibe lo decide la vista
`v_email_comunidad_audiencia`, que se recalcula **cada vez que se la consulta**, y el script
`ads-agent/scripts/datos/sincronizar-audiencia-comunidad.mjs` deja la lista igual a eso **antes de
cada envío**. Quien abre un mail esta semana vuelve a entrar solo; quien deja de abrir, sale solo.

**Congelar esa lista a mano es volver exactamente al problema que esto resuelve.**

La regla, entera:

| Estado | Quién es | Hoy |
|---|---|---|
| **activo** | abrió o clicó **cualquier** mail nuestro en los últimos **60 días** | **425** |
| **nuevo** | lead de menos de 30 días **y** con menos de 3 mails recibidos — todavía no tuvo chance real de abrir | **299** |
| **dormido** | 3 mails de este canal sin abrir ninguno, o sin señal en 60 días | 554 |
| **excluido** | ya compró · marcó spam · 2+ rebotes y 0 entregas | 38 |

> 🔎 **El corte del "nuevo" ya se corrigió una vez, el mismo día que se escribió.** La primera
> versión miraba sólo los mails *de este canal*, y metía como "nuevos" a **166 personas que ya
> habían recibido 3+ mails del embudo sin abrir uno solo**: fríos disfrazados de recién llegados.
> El beneficio de la duda es para quien no tuvo oportunidad, no para quien no la usó.

### Cómo se sabe qué funcionó — y qué NO se va a poder saber

**No se puede decidir por ventas.** Con ~700 destinatarios lo esperable son 10-25 clics y 0-1
ventas por envío; a ese volumen, cero ventas y una venta son el mismo número. Por eso cada envío
declara su **`angulo`**, su **`tono`** y su **`destino`** en `funnel_steps`, y lo que se compara es
el **acumulado por ángulo**, no un mail contra otro:

```sql
select * from v_email_comunidad_envios  order by envio;   -- ¿cómo fue ESTE mail?
select * from v_email_comunidad_angulos order by pct_clic_sobre_apertura desc;  -- ¿qué TEMA funciona?
```

`v_email_comunidad_angulos` **avisa sola** cuando la muestra es chica (`⚠️ muestra chica: N envíos,
no concluir`). Recién con 3+ envíos del mismo ángulo empieza a significar algo.

El clic se mide **sobre aperturas, no sobre entregados**: si no abrieron el asunto, el cuerpo nunca
tuvo la oportunidad de fallar. Mezclarlos hace culpar al mensaje por un problema de asunto.

### El número incómodo que hay que mirar de frente

La última tanda a toda la base (`email-manifiesto`, 18/08) tuvo **6,1% de apertura y 7 clics sobre
1.189 entregados**. La base está fría. Por eso este canal arranca **sólo con los activos**: mandarle
seguido a quien no abre no es neutral — **quema la reputación del dominio por el que también salen
los mails de acceso de los compradores a Leadr**.

Los 554 dormidos no se tocan todavía. Se les prueba aparte, con una serie corta de reactivación,
cuando este canal tenga varios envíos encima.

### Atribución de ventas

Cada envío usa su propio `src` numerado según el estándar de [NOMENCLATURA-SRC.md](NOMENCLATURA-SRC.md):
`/?src=em-comunidad-01`. El `sck` NO se manda: lo pone el botón de la landing. La
cadena es la misma verificada para el manifiesto (`paginas/index.html` lo inyecta en los botones de
Hotmart → `api/hotmart.js` lo guarda en `ventas.src`), y `v_email_comunidad_envios` ya lo cuenta.

⚠️ **Cada campaña nueva tiene que cargar su `brevo_camp_id`** en su fila de `funnel_steps`. Si no,
sus eventos quedan sin atribuir y el panel muestra CERO — que se lee igual que "no lo abrió nadie".

Ficha completa, plan de ángulos y checklist de envío:
[campanas/email-comunidad/](../campanas/email-comunidad/README.md).

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
| `republicadores` | 510 | 1 | ninguno | 🔴 339 sin secuencia · anuncio activo · 🎁 el día 0 lleva a Leadr desde el 18/08, y entra sin contraseña desde el 26/08 |
| `recuperacion-carrito` | ~9 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `recuperacion-rechazo` | ~21 | 2 | `recuperacion.js` | encendido · 0 recuperadas |
| `post-compra` | — | **0** | — | 🔴 no existe |
| `leadr-acceso` | 17 | 2 | webhook → Leadr | ✅ automático · entran 3 de 6 desde el 30/07 |
| `leadr-reactivacion` | 18 | 2 | script **a mano** | 🟡 manual a propósito · 1 rescatado de 18 |
| `leadr-vencimiento` | 19 | **0** | — | 🔴 no existe · ⏰ 6 vencen el 28–31/08 |
| `email-manifiesto` | 1.227 | 1 | campaña Brevo (una vez) | ✅ enviada 18/08 |
| `email-comunidad` | **724** (dinámica) | 1/semana | campaña Brevo (a mano) | 🟡 andamiaje listo 19/08 · falta escribir el envío 1 |

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
