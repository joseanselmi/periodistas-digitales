# ad5-lectores · "Tu noticia la ven tus amigos. No tus lectores."

**Matrícula:** `ad5-lectores` · **Tipo: LEADGEN** (no venta directa) · **Creado:** 2026-07-30

> Es el primer anuncio dla campaña `meta-leadgen-republicadores` ([#106](https://trello.com/c/vFd9rZQ3)).
> No vende: captura el correo a cambio de una guía en PDF. El anuncio de **venta** de
> este mismo segmento es [`ad4-perfil`](../ad4-perfil/ficha.md) y va en Fase 3.

## 🎯 Enfoque / hipótesis

- **Público (precisado por Jose, 30/07):** el **periodista** —con oficio o título— que
  **republica en su perfil personal noticias de otros**: lo que vio en el noticiero, lo
  que levantó de la página de un diario. No produce la nota: la elige, a veces la
  reescribe, y la comparte. Todos los días. **Se mantiene el filtro de credencial**: no
  le hablamos a cualquiera que comparta noticias, sino al que viene del oficio.
- **Ángulo — dos capas, la segunda es la fuerte:**
  1. No es "te ven pocos", es **quiénes** son esos pocos. Un perfil personal reparte lo
     que publicas entre la gente de tu **vida**, no entre la gente de tu **tema**. Por
     eso los comentarios son "qué grande" en vez de discusión sobre la noticia.
  2. Y cuando toca *compartir*, **Facebook muestra la marca de la otra página, no la
     suya.** Le está poniendo su criterio y su constancia a hacerle prensa gratis a un
     medio que no le paga — y que muchas veces cuenta la noticia peor que él.
- **Hipótesis:** este reencuadre identifica más fuerte que el "te falta alcance"
  genérico, porque el lector lo puede verificar en su propio perfil en 30 segundos.
- **Para qué sirve la Fase 1:** aprender barato **qué imagen y qué gancho** enganchan a
  este perfil, antes de poner plata en el anuncio de venta. Por eso van 2 variantes de
  creativo desde el día uno.

> ⛔ **Sin cifras de audiencia** en el copy ni en la imagen. En cuanto aparece un número
> ("tienes 2.000 seguidores…") el lector se compara: al que tiene pocos lo deja afuera y
> al que tiene muchos lo pone a la defensiva. Tiene que pegar igual con 300 que con 5.000.

## 📁 Campaña / conjunto

- **Objetivo:** Clientes potenciales (Lead Ads) con **formulario nativo de Meta** — es el
  camino que ya funciona: Make ("Funnel Leads - Instantaneo (webhook)", id 9474482) →
  `sistema-ingresos/api/lead.js` → tabla `leads` en `periodistas-marketing`.
- **Campaña PROPIA y conjunto PROPIO.** No toca la campaña de ventas del curso ni el
  presupuesto de `ad1-fomo`.
- **Presupuesto:** ⏳ pendiente de Jose. Pidió **$1/día**; a ese número Meta solo entrega
  si la campaña optimiza por alcance/impresiones. Una campaña de **leads** tiene piso
  real de **~$5/día** — por debajo no gasta o no sale nunca del aprendizaje.
- **Segmentación:** la misma base de `ad1-fomo` (30-55, español, exclusiones), más
  intereses de periodismo/medios locales.

## 📄 Anuncio

- **Nombre en Meta:** `ad5-lectores · Que te lean miles`
- **Título:** Que te lean miles, no solo tus amigos
  > La promesa completa es *"Cómo hacer que miles vean las mismas noticias que hoy solo
  > ven tus amigos"* (así se llama la guía), pero son 66 caracteres y Meta la corta en
  > varias ubicaciones. En el campo del título va la versión corta; la larga vive en la
  > tapa de la guía y en la pantalla final del formulario, donde no se trunca.
- **Descripción:** Guía gratis: las 7 cosas que puedes cambiar hoy.
- **CTA:** Descargar

### Ángulo vivo — "eres de los pocos que cubre lo tuyo" (30/07)

Sale de lo único que tenemos escrito por ellos. De 1.408 mensajes de WhatsApp solo 116
son entrantes y casi todos son toques de botón, pero uno dice, sin que nadie se lo
pregunte:

> *"Estoy interesado. Soy uno de pocos en Bolivia interesado en escribir sobre
> Seguridad, Defensa y Desarrollo, Geopolítica y Geoestratégica."*

Se presenta **por su tema, con orgullo, y aclara que es de los pocos**. No dice "soy
periodista" ni habla de dinero. Ahí está la mezcla que buscábamos: **orgullo profesional
+ desperdicio**, que pega más fuerte que el alcance.

⚠️ **Es UN mensaje.** Se corre porque es mejor que decidir a ciegas, no porque esté
validado. Lo valida —o lo tumba— la encuesta de una pregunta a los 937 leads.

### Copy — texto principal

> Hay un tema que sigues hace años. Sabes quién miente, quién repite y qué es lo que
> nadie está contando.
>
> En tu ciudad son pocos los que lo cubren de verdad. Tú eres uno.
>
> Y sin embargo, cada vez que lo publicas, arriba va el logo de otro medio: compartes
> su nota, y ellos se llevan la marca y los lectores.
>
> Preparé una guía corta con las 7 cosas que puedes cambiar hoy para que ese trabajo
> —el tuyo— llegue más lejos y quede a tu nombre.
>
> 👉 Es gratis. Déjame tu correo y te la envío.

**Título:** Eres de los pocos que cubre lo tuyo
**Descripción:** Guía gratis: las 7 cosas que puedes cambiar hoy.
**CTA:** Descargar

### Overlay sobre la imagen (mitad izquierda)

```
PARA PERIODISTAS                  ← chico, cian, muy espaciado

Eres de los pocos                 ← blanco
que cubre lo tuyo.
Y lo publicas con                 ← cian
la marca de otro.

[ Toca si eres periodista ]       ← botón contorneado cian
```

### Creativo que se planeó y NO se usó — el reportero en la calle

> ⚠️ **Descartado (31/07).** Esta imagen nunca se produjo. El creativo que salió al aire
> es `ads5-lectores.png` (ver "Creativo listo" más abajo), y es el que está corriendo en
> Meta. Se deja el brief acá porque sirve de referencia si algún día se produce.

Periodista de unos 45 gritando una pregunta, micrófono extendido, credencial al cuello,
rodeado de grabadores y cámaras de otros. Noche, luz dura, tercio izquierdo en penumbra
para el overlay.

**Vestuario:** saco oscuro sobre camisa clara, sin corbata, cuello abierto (decisión de
Jose, 30/07). Con corbata se leía como conductor de estudio; el que tiene que
reconocerse es el que sale a la calle. La camisa clara además **separa la figura del
fondo oscuro**, que es lo que hace que la miniatura se entienda en el feed.

**Por qué ésta y no los retratos anteriores:**
- Dice "periodista" en dos décimas de segundo. Los retratos pensativos podían ser el
  anuncio de un banco o de una app.
- **Rompe el patrón del feed por diferencia, no por grito**: en este nicho todos
  anuncian con gente sonriendo frente a una laptop. Nadie usa cobertura en la calle.
- Pega con el ángulo: este tipo persigue la nota, se planta, no se va sin la respuesta
  — y después la publica con el logo de otro arriba. **El contraste entre lo que la
  imagen muestra y lo que el texto dice es el golpe.**

_Descartados por el camino: el mockup del teléfono (ilegible al tamaño del feed +
replicaba la interfaz de Facebook → riesgo de rechazo), el retrato en fondo negro
(genérico, podía ser cualquier rubro) y la versión con cara de festejo (contradecía al
copy, que señala un problema)._

**La imagen del escritorio de noche** —credencial, anotador escrito a mano, grabador,
taza— no se tira: va a la **sección del problema de `/tu-medio`**, que hoy usa la foto
de la credencial heredada de la landing general. Así el que llega desde el anuncio se
encuentra al mismo hombre.

## 🧾 Formulario nativo de Meta — para copiar y pegar

**Es un formulario NUEVO, no el de la Guía Claude.** Meta reenvía el `form_id` y eso es
lo que Make usa para saber a qué embudo pertenece cada lead. Si se reutiliza el
existente, estos leads caen mezclados con los 890 del embudo viejo y no se puede medir
nada por separado. **La estructura sí es la misma; el formulario, no.**

**Nombre:** `ad5-lectores · Guía Que te lean miles`

**Tipo:** Más volumen. La pregunta de calificación ya filtra; el paso de revisión solo
encarece el lead.

### Pantalla de introducción

- **Título:** Guía gratis: 7 cosas para que te lean miles
- **Descripción** (lista):
  - Por qué el botón "compartir" te juega en contra, y qué hacer en su lugar
  - Cómo escribir el primer renglón para el que no te conoce
  - Qué preguntar al final para que te comenten de verdad
  - El recuento de 10 minutos que te muestra quién te está leyendo

### Preguntas

1. **Correo electrónico** (prellenado por Meta)
2. **Nombre completo** (prellenado por Meta)
3. **Pregunta personalizada, opción múltiple:**
   *"¿Eres periodista o trabajas en un medio de comunicación?"* → **Sí** / **No**

> ⚠️ **Las opciones se escriben exactamente "Sí" y "No"** — idénticas a las del
> formulario vigente. `api/lead.js` las interpreta con una expresión regular
> (`/^(s[ií]|y|t|1)/i`) y las convierte en la columna `es_periodista`. Si se escriben
> distinto ("Sí, soy periodista"), el campo queda vacío y se pierde la segmentación.

**Sin teléfono.** WhatsApp no entrega desde el 13/07 (negocio sin verificar,
[#89](https://trello.com/c/HhfWhrB9)) y el embudo va 100% por email. Pedir un dato que
no se puede usar agrega fricción y encarece el lead. Se suma cuando el canal vuelva.

### Pantalla final (agradecimiento)

- **Título:** Tu guía está lista
- **Descripción:** También te la enviamos por correo. Si no la ves, revisa spam o promociones.
- **Botón:** `Descargar la guía`
- **URL:**
  ```
  https://sistemadeingresosdiariosia.com/api/d?file=que-te-lean-miles.pdf&src=ad5-lectores
  ```

> ⛔ **Nunca al PDF directo.** `api/d.js` registra la apertura en `events` y recién
> después redirige. Un `.pdf` estático no deja rastro: sin el redirector no hay dato de
> cuántos la abrieron.

**Política de privacidad:** el mismo enlace del formulario vigente.

### Después de crearlo

- [ ] En Make, mapear este `form_id` → `funnel: 'meta-leadgen-republicadores'`
- [ ] Probar en vista previa y confirmar que el lead entra en la tabla `leads` con
      `es_periodista` poblado

## 🎨 Creativo — 2 variantes para comparar (es el objetivo de la Fase 1)

Marca: fondo `#07070f` + índigo/cian. **Sin dinero, sin gráficos de ganancias, sin
claims de ingresos.** Texto sobre la imagen < 20%.

**El creativo del anuncio = LA PERSONA. El mockup del teléfono = el hero de la landing.**

Se probó primero el mockup (teléfono con un feed legible mostrando una publicación
compartida). Quedó muy bien **como pieza**, pero no sirve como anuncio de feed:

- **Ilegible al tamaño real.** En el feed el anuncio se ve a ~500 px de ancho: el
  nombre del medio y el titular, adentro de una pantalla inclinada, desaparecen. Todo
  el golpe del creativo vivía en un texto que no se lee.
- **Riesgo de rechazo.** La pantalla replicaba la interfaz de Facebook casi exacta
  (barra inferior, reacciones, "Me gusta / Comentar / Compartir"). Meta prohíbe
  creativos que imiten su interfaz.
- **Va contra lo que funciona en esta cuenta.** `ad1-fomo`, el ganador, es una persona
  con texto grande encima.

El mockup **no se descarta**: pasa al hero de `/tu-medio`, donde se ve grande, el
lector ya hizo clic y tiene tiempo de leer, y no pasa por revisión de Meta.

**Creativo del anuncio — el periodista**

Hombre latino de unos 40-45, ropa sencilla (no traje), sosteniendo el teléfono a la
altura del pecho. **Acaba de levantar la vista de la pantalla y mira a cámara**, con
reconocimiento sereno — no sonrisa publicitaria, no drama. La luz azulada del teléfono
le ilumina la cara desde abajo. Va en la **mitad derecha**; la izquierda queda oscura
y vacía para el overlay.

**La pantalla no muestra nada legible**: solo resplandor. Resuelve los dos problemas de
una vez — ni texto que no se lee, ni interfaz de Facebook que haga saltar la revisión.

_Diferencia con `ad4-perfil` (mismo segmento, no pueden verse iguales): ad4 mira el
teléfono; éste levanta la vista y mira al lector. El contacto visual frena el scroll._

- Overlay (Canva, mitad izquierda): `TU NOTICIA LA VEN TUS AMIGOS` (blanco) /
  `no tus lectores` (cian) / `TOCA SI ERES PERIODISTA ↓`
- Se genera **en ChatGPT** (prompt en la tarjeta [#106](https://trello.com/c/vFd9rZQ3)).

### 🔗 La imagen del mockup va en el hero de la landing

Se guarda en `sistema-ingresos/campanas/republicadores/img/republicadores-telefono.webp` y la toma `.hero-art`
de `/tu-medio`. **Por qué:** el que hace clic reconoce el lugar en el primer segundo.
Mismo mundo visual entre anuncio y landing — misma paleta, mismo neón, mismo teléfono.

_(Por eso esta landing no usa el hero 3D de Spline de la landing general: competía con
la imagen y era lo más pesado de la página.)_

Ambas cierran con el mismo CTA visual: `TOCA SI ERES PERIODISTA ↓`
⚠️ Que el CTA entre completo y no se corte contra el borde — es el error que quedó
pendiente en `ad1-fomo` ([#30](https://trello.com/c/MpM48Zc5)).

## 📥 La guía (el imán)

> **"Cómo hacer que miles vean las mismas noticias que hoy solo ven tus amigos"**
> *Las 7 cosas que puedes cambiar hoy — sin publicar nada distinto de lo que ya publicas.*

Formato **PDF** (pedido de Jose, 30/07). Contenido y racional completo en
`../estrategia/EMBUDO-GUIAS.md`.

**Límite que no se cruza:** la guía **nombra** que el perfil personal le da la audiencia
equivocada, pero **no enseña a mudarla**. Mudar la audiencia sin perderla es el Módulo 5
del curso — o sea, lo que se paga.

## Estado

**🟢 Creativo listo — `ads5-lectores.png` (1080×1080).** Overlay montado en Canva sobre
la foto del reportero. Texto: `ERES PERIODISTA` arriba / `COMPARTES NOTICIAS EN TU
PERFIL Y SOLO LAS VEN UNOS POCOS` en amarillo / `GUÍA GRATIS: 7 COSAS PARA CAMBIARLO
HOY` / CTA abajo.

- [x] Guía escrita y exportada a PDF (10 páginas)
- [x] Creativo del anuncio
- [ ] **Corregir el CTA: dice `GUIA` sin tilde.** Va `GUÍA`. Arriba en la misma pieza
      está bien escrito, así que la inconsistencia se nota. En un anuncio dirigido a
      periodistas una falta de ortografía cuesta credibilidad antes del clic.
- [ ] Imagen LIMPIA (sin overlay) para el hero de `/tu-medio`. Todavía no existe: habría
      que generarla y guardarla como `republicadores-reportero.webp` dentro de
      `sistema-ingresos/campanas/republicadores/img/`. Hoy el hero usa
      `republicadores-telefono.webp`, que sí está.
- [ ] Presupuesto confirmado por Jose ($5/día leads vs $1/día alcance)
- [ ] Formulario nativo en Meta (con la pregunta de calificación y el botón de descarga)
- [ ] Make: mapear `funnel: 'meta-leadgen-republicadores'` para este formulario
- [ ] Publicar campaña y conjunto propios

> ⚠️ **Mucho texto en la imagen.** Ocupa bastante más del 20% que Meta recomienda. Ya no
> es motivo de rechazo, pero puede limitar la entrega. Es la misma apuesta que hace
> `ad1-fomo`, que funciona — así que se deja y se mira el alcance en los primeros días.
