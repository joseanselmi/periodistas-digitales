/**
 * CONTENIDO.mjs — Septiembre 2026 · arco "IA aplicada al periodista de a pie"
 *
 * Público: el mismo de la página — el periodista que ya publica. Sigue al arco del
 * muro (agosto), que cerró el 31/08 en "qué mira un negocio antes de pagarte".
 *
 * REGLAS (heredadas del muro + las del curso):
 *  - ESPAÑOL NEUTRO (tú/puedes/dime). Nada de voseo.
 *  - SIN CIFRAS de audiencia y SIN estadísticas ajenas: no se citan datos que no
 *    sean nuestros. Todo lo que se afirma acá es observable o es criterio propio.
 *  - SIN ENLACE en el posteo. Los viernes de venta remiten a "el enlace está en la
 *    biografía", que no es un enlace en el texto.
 *  - Herramientas: Claude, ChatGPT, Gemini (IA de consumo, gratuitas). NUNCA el
 *    stack de Jose (Brevo, Make, GA4, Meta Ads, Hotmart): eso no es contenido.
 *  - SE NOMBRA EL PROBLEMA, NO SE RESUELVE EL SISTEMA. El orgánico da victorias
 *    sueltas (una pieza del encargo, señales para mirar una imagen, mostrar el
 *    proceso). Lo que se cobra queda entero: el método de las 4 piezas del prompt
 *    (M2.2), los roles de la redacción de IA (M2.4), la biblioteca (M2.5) y el
 *    circuito de verificación (M3). Precio: $27.
 *  - Cada posteo cierra con una pregunta RESPONDIBLE: pide MEMORIA, no reflexión.
 *    Sin ejemplos en el texto de la pregunta (contaminan el vocabulario).
 *
 * ESTRUCTURA SEMANAL (docs/ESTRATEGIA-ORGANICO.md): lunes C educativo · martes T
 * dolor · miércoles C tip · jueves T prueba social · viernes C venta · sábado T
 * reflexión · domingo C tendencia.
 *
 * ⚠️ EXCEPCIÓN: el viernes 04/09 NO es de venta. Abre el arco. La página venía de
 * tres días muda y volver con una venta era la peor entrada posible. Las ventas
 * quedan en los viernes 11, 18 y 25 (3 de 27 = 1 cada 9, por debajo del 1 de 7).
 *
 * ⚠️ LOS 3 JUEVES (10, 17, 24) SON MOLDE, NO TEXTO FINAL. Son días de prueba
 * social y no hay material verificado para llenarlos. Se marcan con NECESITA_DATO
 * y el generador se niega a programarlos así.
 */

export const DIAS = [

// ══════════════ APERTURA (04→06/09) — "La IA no piensa: predice" ══════════════

{ fecha: '2026-09-04', dia: 'Vie', tipo: 'carrusel', temp: '❄️', semana: 'apertura',
  titulo: 'Predice, no sabe',
  story: { eyebrow: 'Arranca el mes',
    hook: 'La IA no sabe<br>nada de tu ciudad.<br>Y te contestó<br><span class="accent">igual</span>',
    sub: 'No sabe: <strong>predice</strong>. Por eso lo que le das decide lo que te devuelve.' },
  caption: `La IA no sabe nada de tu ciudad. Y aun así te contestó con total seguridad.

Ese malentendido es el que hace que la mayoría la pruebe una semana y la abandone. Le pedimos que sepa. Y no sabe: predice.

Lo que hace por dentro es calcular, palabra por palabra, cuál es la continuación más probable de lo que le diste. Nada más. No consulta, no conoce tu barrio, no tiene idea de si el intendente se llama así. Arma la frase que suena más probable.

Por eso pasan las dos cosas que ya te pasaron.

Si le das tres palabras, te devuelve lo más genérico que existe. Lo genérico es, justamente, lo más probable.

Y si le preguntas un dato que no tiene, se lo inventa con la misma seguridad con la que te dice cuál es la capital de Francia. Para ella las dos cosas son lo mismo: la continuación más probable. No te está mintiendo, porque para mentir habría que saber.

Eso no la vuelve inútil. La vuelve dirigible. Todo lo que le pongas adelante cambia lo que puede predecir.

Este mes vamos a ver exactamente eso: cómo dirigirla para el trabajo de todos los días, sin dejar de ser el que responde por lo que firma.

¿Cuál fue la primera cosa que le pediste a una IA? La primera, no la mejor. 👇` },

{ fecha: '2026-09-05', dia: 'Sáb', tipo: 'texto', temp: '🌡️', semana: 'apertura',
  titulo: 'A quién reemplaza de verdad',
  story: { eyebrow: 'El miedo',
    hook: 'No escribe<br>mejor que tú.<br>Escribe<br><span class="accent">parecido</span>',
    sub: 'Y sale gratis. Por eso conviene mirar de frente <strong>qué parte es tu oficio</strong>.' },
  caption: `El miedo no es que la IA escriba mejor que tú. Es que escriba parecido y salga gratis.

Vale la pena mirarlo de frente, porque es lo que frena a la gente de nuestro oficio para siquiera abrir una.

Lo que la IA hace bien es lo que se puede hacer sin levantarse de la silla: resumir un texto largo, ordenar un borrador desordenado, proponer diez maneras de decir lo mismo, pasar una nota de un formato a otro. Todo eso lo hace en segundos y lo hace bien.

Y ahora la parte que casi nadie dice: nada de eso es tu oficio. Es lo que rodea a tu oficio.

Tu oficio es saber a quién llamar. Es notar que el número que te pasaron no cierra con el del año pasado. Es que el comerciante de la esquina te cuente algo porque te conoce desde hace años y sabe que no lo vas a dejar mal parado. Es decidir qué no se publica.

Ninguna de esas cosas ocurre adentro de una pantalla. Por eso ninguna máquina las va a poder hacer, por buena que se ponga.

Lo que sí cambia es dónde se te va el día. Si las tareas de silla te comen media jornada, esa media jornada no la estás usando en lo único que solo puedes hacer tú.

Ahí es donde entra. Y no en otro lado.

¿Qué fue lo último que hiciste esta semana que cualquiera podría haber hecho por ti? 👇` },

{ fecha: '2026-09-06', dia: 'Dom', tipo: 'carrusel', temp: '❄️', semana: 'apertura',
  titulo: 'Tres cosas que ya no se pagan',
  story: { eyebrow: 'Lo que cambió',
    hook: 'Tres cosas<br>que hoy salen<br><span class="accent">gratis</span>',
    sub: 'Y ninguna es escribir tu nota. Son las tres que <strong>te comen la tarde</strong>.' },
  caption: `Tres cosas que hoy hace una IA gratuita y hace dos años había que pagarlas o hacerlas a mano.

Ninguna es escribir tu nota. Son las tres que te comen la tarde.

Transcribir una entrevista. Le das el audio y te devuelve el texto. Lo que antes eran dos horas de auriculares y rebobinar, hoy son minutos. El repaso sigue siendo tuyo, sobre todo con los nombres propios: esos los escribe mal casi siempre.

Leer un documento largo. El presupuesto, la licitación, el fallo de cuarenta páginas. Le pides que te diga qué cambió respecto de la versión anterior y por dónde conviene empezar a mirar. No reemplaza que lo leas: te dice dónde leer primero, que en un día con cierre es la diferencia entre abrirlo y no abrirlo.

Pasar una nota de un formato a otro. La misma información como texto para el muro, como guion para un audio, como pie de foto corto. Es el trabajo más mecánico de todos y es el que más tiempo se lleva.

Las tres tienen algo en común: ninguna decide nada. Tú decides, ellas mueven.

En el carrusel, las tres con el encargo exacto que hay que darle a cada una.

¿Cuál de las tres te haría ganar más tiempo esta semana? 👇` },

// ═══════ SEMANA 1 (07→13/09) — "Por qué te devuelve cosas mediocres" ═══════

{ fecha: '2026-09-07', dia: 'Lun', tipo: 'carrusel', temp: '❄️', semana: 's1',
  titulo: 'Le diste tres palabras',
  story: { eyebrow: 'El motivo',
    hook: 'Te devolvió algo<br>que sirve para<br><span class="accent">cualquier ciudad</span>',
    sub: 'Porque le diste tres palabras. Y con tres palabras <strong>lo más probable es lo genérico</strong>.' },
  caption: `Le pediste "escribe una nota sobre el aumento del agua" y te devolvió algo que sirve para cualquier ciudad del mundo. Incluida una que no existe.

No falló. Hizo exactamente lo que le pediste.

Acuérdate de lo del viernes: predice la continuación más probable. Cuando lo único que tiene son cinco palabras sueltas, la continuación más probable de "nota sobre el aumento del agua" es el promedio de todo lo que se escribió alguna vez sobre aumentos del agua. Y el promedio de todo, por definición, no se parece a nada.

El problema no es la herramienta. Es que le pediste que adivine.

Piénsalo con alguien de carne y hueso. Si entra un pasante el primer día y le dices "escribe algo del agua", te va a traer un texto tibio, y no porque sea malo: porque no sabe dónde está parado, para quién escribe ni qué se publicó la semana pasada. A esa persona le darías contexto sin pensarlo dos veces.

A la IA, en cambio, casi nadie se lo da. Y encima le exigimos más que al pasante.

Mañana quiero saber cuál de las dos cosas te pasó a ti. El miércoles, la línea que lo arregla.

Cuando te devolvió algo genérico, ¿lo volviste a intentar o cerraste la pestaña? 👇` },

{ fecha: '2026-09-08', dia: 'Mar', tipo: 'texto', temp: '❄️', semana: 's1', encuesta: true,
  titulo: 'ENCUESTA · A o B',
  story: { eyebrow: 'Encuesta',
    hook: '¿Te devolvió<br>una obviedad<br>o te inventó<br><span class="accent">un dato?</span>',
    sub: 'Contesta <strong>A o B</strong> en el posteo de hoy. Una letra, nada más.' },
  caption: `Encuesta rápida, y contesta con una sola letra.

Casi todo el que probó una IA para trabajo periodístico y la dejó, la dejó por una de estas dos razones. Quiero saber cuál fue la tuya.

A — Te devolvió una obviedad. Algo correcto, prolijo y completamente vacío. Lo leíste y pensaste "esto no lo firmo".

B — Te inventó un dato. Un nombre, un cargo, una cifra, una ley con número y todo. Lo dijo con tanta seguridad que casi lo das por bueno, y si no llegas a chequearlo se te iba publicado.

C — Las dos, en el mismo intento.

Escribe la letra en los comentarios. Sin explicación: la letra sola.

Lo pregunto porque las dos tienen arreglo, pero son arreglos distintos, y quiero escribir el del miércoles para el que le pasa a más gente acá.

La A se arregla con lo que le pones adelante. La B se arregla con lo que haces después, y es la parte que no se delega nunca.

¿A, B o C? 👇` },

{ fecha: '2026-09-09', dia: 'Mié', tipo: 'carrusel', temp: '❄️', semana: 's1',
  titulo: 'La línea de adelante',
  story: { eyebrow: 'El arreglo',
    hook: 'Una línea<br>adelante.<br>Y cambia<br><span class="accent">todo</span>',
    sub: 'Para quién es y dónde se publica. <strong>Antes</strong> de pedir nada.' },
  caption: `Una sola línea adelante y lo que te devuelve deja de ser genérico.

La línea es esta: para quién es y dónde se publica.

No es un truco. Es lo mismo que harías con una persona. Si le dices a alguien "escribe sobre el aumento del agua para vecinos de una ciudad chica, que lo van a leer en el celular, en el muro, y a la mayoría le importa una sola cosa: cuánto le va a llegar", esa persona escribe otra cosa. La IA también.

Fíjate qué cambia en la práctica. Sin esa línea, el texto arranca por la resolución y el número del expediente. Con esa línea, arranca por lo que le va a pasar al que lo lee. Es la misma noticia y es otro texto.

Y hay un efecto de yapa: cuando le dices para quién es, deja de usar las palabras que nadie usa. "Incremento tarifario" se convierte en "te va a llegar más cara". No porque le pidieras que escriba fácil, sino porque le dijiste a quién le habla.

Eso es una sola pieza del encargo, y ya te cambia el resultado. Hay tres más, y juntas son la diferencia entre pelearte con la herramienta y dirigirla. Las cuatro, con el orden y el porqué de cada una, están adentro del curso.

Pero esta la puedes probar hoy. En el carrusel está la línea armada para que la copies y le cambies lo tuyo.

Pruébala con la última nota que publicaste y dime qué te devolvió distinto. 👇` },

{ fecha: '2026-09-10', dia: 'Jue', tipo: 'texto', temp: '🌡️', semana: 's1', NECESITA_DATO: true,
  titulo: '⚠️ MOLDE — prueba social',
  story: { eyebrow: 'Lo que me escribieron',
    hook: '(pendiente: la frase<br>textual de<br><span class="accent">alguien real</span>)',
    sub: 'Molde. No se genera hasta que haya un hecho verificado.' },
  caption: `⚠️ MOLDE — NO PROGRAMAR ASÍ. Necesita un hecho real.

Estructura que funciona (es la del jueves 27/08, el de "Once años publicando para mis conocidos"):

1. Arranca con la frase TEXTUAL de alguien, entre comillas, como gancho.
2. Segunda línea: quién lo dijo y cuándo, sin nombre si no dio permiso.
3. El cuerpo desarma por qué eso le pasa a mucha más gente de la que lo dice.
4. Cierra con una pregunta que le pida al lector su propia versión del mismo hecho.

QUÉ FALTA DE JOSE — cualquiera de estas tres sirve:
· Algo que le haya escrito un lector o un colega sobre IA esta semana (el escéptico funciona igual de bien que el entusiasta).
· Una cosa concreta que Jose haya probado con una IA y qué pasó — con el resultado real, incluido si salió mal.
· El testimonio de Carlos o de Jorge, si ya dieron la ciudad (tarjeta #155).` },

{ fecha: '2026-09-11', dia: 'Vie', tipo: 'carrusel', temp: '🔥', semana: 's1',
  titulo: 'VENTA · La tarde que te devuelve',
  story: { eyebrow: 'Viernes',
    hook: 'Te devuelve<br>la tarde.<br>Qué haces con ella<br>es <span class="accent">otra decisión</span>',
    sub: 'El enlace está en la biografía.' },
  caption: `Dirigir bien una IA te devuelve la tarde. Lo que hagas con esa tarde es otra decisión, y es la que decide si esto te cambia algo.

Porque se pueden ganar dos horas y usarlas en publicar más notas gratis, mejor hechas y más rápido. Sigue siendo gratis.

Esta semana viste tres cosas: que la IA predice, y por eso lo que le das decide lo que devuelve; que con tres palabras te va a dar el promedio de todo; y que una línea adelante cambia el resultado.

Eso alcanza para trabajar más liviano. No alcanza para cobrar.

Para cobrar hace falta lo otro: que lo que publicas lleve tu nombre encima, que llegue a gente a la que le interesa el tema y no solo a tus conocidos, y que exista un lugar tuyo donde eso se pueda sostener. El camino tiene cinco pasos y este es el orden en que funciona: ponerle nombre y foco a lo que ya cubres, abrir tu medio, mudar a los que ya te leen sin perderlos, sostener la publicación diaria sin que te coma el día, y cobrar tu primer anunciante.

La IA entra en el cuarto. Y por eso importa: el cuarto es donde la mayoría abandona.

Los cinco pasos acompañados, con tu equipo de IA armado uno por uno, son el Sistema de Ingresos Diarios. Pago único de 27 dólares, acceso de por vida y garantía de 7 días. El enlace está en la biografía.

En el carrusel, los cinco pasos y dónde entra la IA en cada uno.

¿En cuál de los cinco estás hoy? Dime el número. 👇` },

{ fecha: '2026-09-12', dia: 'Sáb', tipo: 'texto', temp: '🌡️', semana: 's1',
  titulo: 'El tiempo que se llena solo',
  story: { eyebrow: 'Sábado',
    hook: 'Ganaste<br>dos horas.<br>¿Y ahora<br><span class="accent">qué?</span>',
    sub: 'El tiempo que no se decide, <strong>se llena solo</strong>.' },
  caption: `Ganas dos horas con una herramienta nueva y a la semana siguiente ya no las tienes. A nadie le sobra tiempo por mucho tiempo.

Es lo que pasa siempre y no tiene nada de raro: el tiempo que no se decide, se llena solo. Con otra nota gratis, con otro favor, con el grupo de mensajes que no para.

Por eso conviene decidirlo antes de tenerlo.

No hace falta un plan grande. Alcanza con reservar el primer rato de la mañana, el que sea, para lo único que no te pide nadie y no te paga nadie todavía: lo tuyo. El nombre de lo que cubres. El lugar propio donde va a vivir. Las tres personas de tu ciudad que ya te leen todos los días y todavía no lo saben.

Esa parte no la puede hacer una IA, y no porque sea difícil: porque nadie te la va a encargar. Es la única cosa del día que depende de que la agarres tú.

Y es exactamente la que se posterga, todos los días, hasta que el día se acaba.

¿A qué hora del día tienes el primer rato en que nadie te busca? 👇` },

{ fecha: '2026-09-13', dia: 'Dom', tipo: 'carrusel', temp: '❄️', semana: 's1',
  titulo: 'Se nota, y se nota por tres cosas',
  story: { eyebrow: 'Se nota',
    hook: 'Cuando lo escribió<br>una IA y nadie<br>lo tocó,<br><span class="accent">se nota</span>',
    sub: 'Por tres cosas concretas. <strong>Las tres se arreglan en un minuto.</strong>' },
  caption: `Cuando un texto lo escribió una IA y nadie lo tocó, se nota. Y no se nota por lo que la gente cree.

No se nota porque esté mal escrito. Casi siempre está mejor escrito que el promedio. Se nota por tres cosas, y las tres se arreglan en un minuto.

La primera: todo pesa lo mismo. Le dedica el mismo espacio al dato que le cambia el mes al lector y al párrafo de contexto que nadie pidió. Un periodista jerarquiza sin pensarlo; la máquina reparte parejo.

La segunda: las frases van de a pares. "No solo esto, sino también aquello." "Tanto por un lado como por el otro." Queda simétrica hasta cuando la realidad no lo es, y a las tres frases el oído lo detecta aunque no sepa qué está detectando.

La tercera, la más delatora: no hay nadie adentro. Ni un nombre, ni una calle, ni una hora. Habla de "los vecinos" y de "la comunidad", que es como hablan los comunicados.

Las tres se arreglan igual: cortando lo que sobra y metiendo una persona concreta.

En el carrusel, un párrafo con las tres marcas y el mismo párrafo arreglado, para que veas la diferencia de un vistazo.

Cuando lees algo y sospechas que lo escribió una máquina, ¿qué es lo primero que te hace sospechar? 👇` },

// ═════════ SEMANA 2 (14→20/09) — "Lo que no se le delega" ═════════

{ fecha: '2026-09-14', dia: 'Lun', tipo: 'carrusel', temp: '❄️', semana: 's2',
  titulo: 'La parte que se te cae encima',
  story: { eyebrow: 'El límite',
    hook: 'Hay una parte<br>que si se la das,<br>se te cae<br><span class="accent">encima</span>',
    sub: 'La IA no responde por nada. <strong>El que firma eres tú.</strong>' },
  caption: `Hay una parte de tu trabajo que, si se la das a la IA, se te cae encima a ti.

No es la redacción. Es la respuesta.

Cuando publicas algo con tu nombre, estás diciendo una cosa además de la noticia: que si eso está mal, respondes tú. Es lo único que separa a un periodista de una cuenta que reenvía cosas. Y es lo único que una máquina no puede hacer, no por falta de capacidad: porque no tiene nada que perder.

Si la IA te inventa un cargo y lo publicas, no le pasa nada a ella. Le pasa a tu nombre en tu ciudad, donde la gente te cruza en la calle.

Por eso el reparto es este, y conviene tenerlo claro antes de empezar a usarla y no después.

Ella puede juntar, ordenar, resumir, proponer, reescribir y traducir. Todo eso es mover material.

Tú decides qué se publica, confirmas cada dato que lleva tu firma, eliges a quién llamar y te haces cargo de lo que salió. Todo eso es responder.

El día que se mezclan los dos lados, lo que se pierde no es una nota: es la razón por la que alguien te lee a ti y no a cualquiera.

En el carrusel, el reparto completo en dos columnas, para tenerlo a mano.

¿Alguna vez estuviste a punto de publicar un dato que la IA te dio y lo frenaste? 👇` },

{ fecha: '2026-09-15', dia: 'Mar', tipo: 'texto', temp: '❄️', semana: 's2', encuesta: true,
  titulo: 'ENCUESTA · Confianza en el dato',
  story: { eyebrow: 'Encuesta',
    hook: '¿Publicarías<br>un dato que te<br>dio una IA<br><span class="accent">sin chequear?</span>',
    sub: 'A, B o C en los comentarios. <strong>Una letra.</strong>' },
  caption: `Segunda encuesta, y otra vez con una letra sola.

Un dato te lo dio una IA. Un número, una fecha, el cargo de alguien. ¿Lo publicas?

A — Nunca. Todo lo que lleva mi firma lo confirmo yo en la fuente, venga de donde venga.

B — Depende del dato. Si es algo grande sí lo chequeo; si es un detalle menor, lo dejo pasar.

C — Si suena razonable, lo publico. Total, casi siempre acierta.

La letra en los comentarios, sin explicación.

Pregunto porque la B es la respuesta más honesta y también la más peligrosa, y lo digo sin ninguna ironía: es lo que hacemos todos con cualquier fuente cuando hay cierre encima. El problema es que con una IA no existe el detalle menor, porque no hay forma de saber cuál inventó. Los inventa todos con el mismo tono.

Mañana, las señales concretas para no comerte una imagen falsa. Y son señales que se miran en segundos, sin instalar nada.

¿A, B o C? 👇` },

{ fecha: '2026-09-16', dia: 'Mié', tipo: 'carrusel', temp: '❄️', semana: 's2',
  titulo: 'Mirar una imagen antes de creerle',
  story: { eyebrow: 'Verificar',
    hook: 'Te llegó la foto<br>por el grupo.<br>Antes de publicarla,<br><span class="accent">míra esto</span>',
    sub: 'Cuatro señales y una búsqueda. <strong>Segundos, sin instalar nada.</strong>' },
  caption: `Te llegó la foto por el grupo del barrio. Antes de publicarla, hay cuatro cosas que se miran en segundos.

No hace falta ser perito ni instalar nada. Alcanza con saber dónde mirar.

Las manos y los dientes. Es donde más se equivoca todavía cualquier generador de imágenes: dedos de más, dedos fundidos, una mano que agarra algo que no está. Amplía y cuenta.

Los carteles y los textos. Un nombre de calle, la patente de un auto, el letrero de un negocio. Las letras salen casi bien y por eso engañan: parecen palabras y no dicen nada. Si un cartel no se puede leer, sospecha.

Los bordes de las personas. Donde el pelo se junta con el fondo suele quedar una línea demasiado limpia, o al revés, una mancha borrosa que no coincide con el resto de la foto.

La luz. Las sombras de las personas apuntando para lados distintos, o un reflejo en una ventana que no corresponde con nada de lo que se ve.

Y la quinta, que es la que más resuelve: busca el origen. Sube la imagen a un buscador de imágenes y fíjate si ya apareció antes, en otro país y en otro año. La mitad de las fotos falsas no son generadas: son viejas y verdaderas, sacadas de contexto.

Estas cinco te dicen cuándo mirar dos veces. Confirmar de verdad —cruzar la imagen con fuentes que se contradigan entre sí— es el paso que sigue, y ese está entero en el curso.

En el carrusel, las cinco con qué buscar exactamente en cada una.

¿Te llegó alguna foto al teléfono esta semana que te hizo dudar? 👇` },

{ fecha: '2026-09-17', dia: 'Jue', tipo: 'texto', temp: '🌡️', semana: 's2', NECESITA_DATO: true,
  titulo: '⚠️ MOLDE — prueba social',
  story: { eyebrow: 'Un caso',
    hook: '(pendiente:<br>un caso<br><span class="accent">verificado</span>)',
    sub: 'Molde. No se genera hasta que haya un hecho verificado.' },
  caption: `⚠️ MOLDE — NO PROGRAMAR ASÍ. Necesita un hecho real.

Este jueves cae justo después del posteo de verificar imágenes, así que el molde ideal es un caso: algo falso que circuló y alguien frenó a tiempo.

QUÉ FALTA DE JOSE — cualquiera sirve:
· Una foto o un audio falso que haya circulado en el grupo/ciudad de algún lector y cómo se dieron cuenta.
· Algo que Jose haya chequeado y resultara falso, con lo que lo delató.
· Un lector que cuente que publicó algo sin verificar y qué le pasó después.

Si no aparece nada, la alternativa honesta es convertir el jueves en un posteo de "lo que contestaron en la encuesta del martes", que es prueba social real y se escribe ese mismo día con los comentarios a la vista.` },

{ fecha: '2026-09-18', dia: 'Vie', tipo: 'carrusel', temp: '🔥', semana: 's2',
  titulo: 'VENTA · Verificar no es un freno',
  story: { eyebrow: 'Viernes',
    hook: 'Verificar<br>no es un freno.<br>Es lo que te vuelve<br><span class="accent">el que vale la pena</span>',
    sub: 'El enlace está en la biografía.' },
  caption: `Verificar no es un freno. Es lo único que hace que valga la pena leerte a ti y no al primero que publicó.

Es una idea incómoda porque va contra la velocidad, que es lo que todo el mundo persigue. Pero míralo desde el otro lado del teléfono.

Tu lector ya tiene diez lugares donde enterarse rápido. Lo que no tiene es un lugar donde enterarse bien. Y a esta altura ya aprendió, a los golpes, que la mitad de lo que le llega puede ser falso, viejo o sacado de contexto.

El día que ese lector sepa que lo que tú publicas está chequeado, dejas de competir por ser el primero. Pasas a ser el que confirma. Y esa es la posición que se puede cobrar, porque es la única que no se puede automatizar.

Un negocio de tu ciudad no le paga al que publica rápido. Le paga al que no lo va a dejar mal parado.

Esa es toda la idea del módulo de verificación del curso: no es una lista de herramientas, es cómo se construye la credibilidad como capital, cómo se chequea un dato cruzando fuentes que se contradicen, y cómo se muestra ese trabajo para que sume en vez de quedar invisible.

Está adentro del Sistema de Ingresos Diarios, junto con los cinco pasos para que esto te pague. Pago único de 27 dólares, acceso de por vida y garantía de 7 días. El enlace está en la biografía.

En el carrusel, por qué el que verifica termina cobrando más que el que publica primero.

¿Cuántas veces te reenviaron algo esta semana pidiéndote que confirmes si era cierto? 👇` },

{ fecha: '2026-09-19', dia: 'Sáb', tipo: 'texto', temp: '🌡️', semana: 's2',
  titulo: 'Tardó años, se rompe en una tarde',
  story: { eyebrow: 'Sábado',
    hook: 'Tardó años<br>en juntarse.<br>Se rompe<br><span class="accent">en una tarde</span>',
    sub: 'Tu credibilidad es tu capital. <strong>Y es el único que no se recupera comprándolo.</strong>' },
  caption: `Tu credibilidad tardó años en juntarse y se rompe en una tarde. Es el capital más raro que existe: no se compra, no se hereda y no se recupera con dinero.

Lo curioso es que casi nunca lo tratamos como capital. Lo tratamos como una cualidad, algo que se tiene o no se tiene, cuando en realidad se acumula publicación por publicación, y se gasta igual.

Cada vez que confirmas un dato antes de publicarlo, sumas un poco. Nadie lo ve, no genera un solo comentario, y no pasa nada visible ese día. Por eso cuesta tanto sostenerlo: el trabajo de verificar es invisible cuando sale bien.

Y cada vez que publicas algo sin chequear y sale mal, no restas: se te cae de golpe. La gente no lleva un promedio de tus aciertos. Se acuerda del error.

Es injusto y es así, y no lo cambió la IA: la IA solo hizo que aparezca más material falso y más convincente, o sea que subió el precio de no mirar.

Lo bueno de que sea un capital es que se puede administrar. El que verifica hoy está guardando para el día en que quiera cobrar por esto, aunque todavía no lo sepa.

¿Te acuerdas de la última vez que un medio te falló con un dato? ¿Lo seguís leyendo? 👇` },

{ fecha: '2026-09-20', dia: 'Dom', tipo: 'carrusel', temp: '❄️', semana: 's2',
  titulo: 'Cada vez más falsos, cada vez vale más el que chequea',
  story: { eyebrow: 'Lo que viene',
    hook: 'Cuanto más fácil<br>es fabricar un falso,<br>más vale<br><span class="accent">el que chequea</span>',
    sub: 'La misma ola que asusta <strong>es la que sube tu precio</strong>.' },
  caption: `Cuanto más fácil se vuelve fabricar algo falso, más vale el que chequea. Es la misma ola, mirada del otro lado.

Hace unos años hacía falta saber para falsificar una foto. Hoy no hace falta nada: cualquiera fabrica una imagen convincente en menos tiempo del que se tarda en leer esta frase, y el que la reenvía al grupo del barrio ni siquiera está mintiendo, porque él tampoco sabe.

La lectura fácil de eso es que se viene el caos. Y sí, en parte se viene.

La otra lectura, la que casi no se hace, es esta: cuando cualquiera puede publicar cualquier cosa, lo escaso deja de ser la información. Lo escaso pasa a ser alguien que responde por lo que dice.

Piensa en tu ciudad. Cuando pasa algo grande, la gente no busca más publicaciones: busca cuál creerle. Y esa pregunta se contesta con un nombre, no con una cuenta.

Ahí es donde el oficio, que parecía el más amenazado, resulta ser el que queda mejor parado. Siempre que se lo vea. Un trabajo de verificación que nadie sabe que existe no cuenta para nadie.

De eso hablamos esta semana que viene: cómo mostrarlo sin que parezca que te estás elogiando.

En el carrusel, por qué la misma ola que asusta es la que te sube el precio.

Cuando pasa algo importante en tu ciudad, ¿a quién le crees tú? 👇` },

// ═════════ SEMANA 3 (21→27/09) — "Que se note que lo hiciste tú" ═════════

{ fecha: '2026-09-21', dia: 'Lun', tipo: 'carrusel', temp: '❄️', semana: 's3',
  titulo: 'Cómo se ve alguien confiable',
  story: { eyebrow: 'La confianza',
    hook: 'Nadie confía<br>en ti porque<br>seas confiable.<br><span class="accent">Confía en lo que ve</span>',
    sub: 'Y lo que ve son <strong>cuatro cosas concretas</strong>.' },
  caption: `Nadie confía en ti porque seas confiable. Confía en lo que ve. Y lo que ve son cuatro cosas, siempre las mismas.

Vale la pena saber cuáles son, porque la mayoría hace bien el trabajo y no muestra ninguna de las cuatro.

Que apareces siempre. La constancia dice más que cualquier credencial. Alguien que publica todos los días, aunque sea poco, se lee como alguien que está. El que aparece cuando hay algo grande y desaparece un mes se lee como alguien que pasaba.

Que se entiende de qué eres. Si en tu muro hay una noticia de tránsito, una del clima, una de política nacional y una receta, el lector no sabe para qué guardarte. El que cubre una cosa se vuelve el referente de esa cosa, aunque sea chica. Sobre todo si es chica.

Que corriges a la vista. Publicar la corrección con la misma cara con que publicaste el error es lo que más credibilidad construye, y lo que menos se hace. Borrar y hacer como que no pasó es lo que más la destruye.

Que se sabe de dónde sacaste las cosas. No hace falta una bibliografía. Alcanza con decir quién te lo dijo o dónde lo leíste.

Ninguna de las cuatro requiere que seas mejor periodista de lo que ya eres. Requieren que se vea.

En el carrusel, las cuatro con qué hacer esta semana para cada una.

De las cuatro, ¿cuál es la que hoy no se ve en tu muro? 👇` },

{ fecha: '2026-09-22', dia: 'Mar', tipo: 'texto', temp: '❄️', semana: 's3', encuesta: true,
  titulo: 'ENCUESTA · Decirlo o no decirlo',
  story: { eyebrow: 'Encuesta',
    hook: 'Si un medio dice<br>que usa IA,<br>¿confías más<br><span class="accent">o menos?</span>',
    sub: 'A o B en los comentarios. <strong>Y contesta como lector, no como periodista.</strong>' },
  caption: `Tercera encuesta, y esta contéstala como lector, no como periodista.

Un medio que sigues aclara al pie de sus notas que usa inteligencia artificial para ayudarse: para transcribir, para ordenar, para resumir documentos largos. Lo dice él, nadie lo descubrió.

A — Confío más. Que lo diga me tranquiliza: si cuenta esto, probablemente cuenta el resto.

B — Confío menos. Prefiero no saberlo, o directamente prefiero que no la use.

La letra en los comentarios, sin explicación.

Pregunto porque entre nosotros hay una discusión que se da por saldada en las dos direcciones, y ninguna de las dos está saldada. Hay quien lo oculta convencido de que decirlo le resta autoridad. Y hay quien lo aclara convencido de que le suma.

Mañana escribo sobre eso: qué se aclara, qué no hace falta aclarar, y por qué la diferencia no está en la herramienta sino en quién responde por el resultado.

Pero primero quiero saber qué contesta la gente de acá, que es la que lee.

¿A o B? 👇` },

{ fecha: '2026-09-23', dia: 'Mié', tipo: 'carrusel', temp: '❄️', semana: 's3',
  titulo: 'Mostrar cómo lo hiciste',
  story: { eyebrow: 'Transparencia',
    hook: 'Contar cómo<br>lo verificaste<br>no debilita la nota.<br><span class="accent">La blinda</span>',
    sub: 'Dos líneas al pie. <strong>Es la forma moderna de firmar.</strong>' },
  caption: `Contar cómo verificaste una nota no la debilita. La blinda.

Es lo contrario de lo que enseña el instinto. El instinto dice que mostrar el trabajo por dentro le saca autoridad, como el mago que explica el truco. Pero un lector de hoy ya no supone que estás diciendo la verdad: te la tiene que ver.

Dos líneas al pie alcanzan. Con qué confirmaste, a quién llamaste, qué no pudiste confirmar todavía.

Esa última parte es la que más pesa y la que nadie escribe. Decir "esto lo confirmé, esto otro todavía no" te vuelve creíble en las dos frases: en la que confirmaste y en la que no. El que dice que confirmó todo, siempre, es el que menos parece que lo hizo.

Ahora, la línea que importa, porque es la de la encuesta de ayer.

Lo que se aclara no es la herramienta: es quién responde. Que hayas usado una IA para transcribir la entrevista le importa a nadie, igual que no aclaras con qué grabador la grabaste. Lo que sí se dice es de dónde salió cada dato y quién lo confirmó, y ahí la respuesta siempre tiene que ser una persona con nombre. La tuya.

La regla corta: se aclara el origen y la responsabilidad, no las herramientas.

En el carrusel, el pie de nota armado, listo para copiar y adaptar.

¿Alguna vez publicaste una corrección con la misma cara con la que publicaste el error? 👇` },

{ fecha: '2026-09-24', dia: 'Jue', tipo: 'texto', temp: '🌡️', semana: 's3', NECESITA_DATO: true,
  titulo: '⚠️ MOLDE — prueba social',
  story: { eyebrow: 'Lo que pasó',
    hook: '(pendiente:<br>un resultado<br><span class="accent">real</span>)',
    sub: 'Molde. No se genera hasta que haya un hecho verificado.' },
  caption: `⚠️ MOLDE — NO PROGRAMAR ASÍ. Necesita un hecho real.

Es el último jueves de prueba social del mes, así que el molde que mejor cierra es un resultado: alguien que probó algo de este mes y le pasó algo.

QUÉ FALTA DE JOSE — cualquiera sirve:
· Un comentario de estas tres semanas donde alguien cuente que probó la línea de contexto (posteo del 09/09) y qué le devolvió distinto.
· Alguien que haya empezado a poner el pie de nota de transparencia.
· Un comprador del curso que cuente qué cambió — ojo, con permiso explícito de nombre y foto en la misma frase (tarjeta #155).

Alternativa sin depender de nadie: el recuento de las tres encuestas del mes (08, 15 y 22) con lo que contestó la gente. Es material propio, verificable, y se escribe ese día con los comentarios a la vista.` },

{ fecha: '2026-09-25', dia: 'Vie', tipo: 'carrusel', temp: '🔥', semana: 's3',
  titulo: 'VENTA · El que responde',
  story: { eyebrow: 'Viernes',
    hook: 'La máquina<br>no responde<br>por nada.<br><span class="accent">Ahí está tu lugar</span>',
    sub: 'El enlace está en la biografía.' },
  caption: `La máquina no responde por nada de lo que dice. Ahí está tu lugar, y no es un consuelo: es el negocio.

Todo este mes fue en la misma dirección. La IA predice y por eso hay que dirigirla. Hace bien lo que se hace sentado. No puede decidir qué se publica ni hacerse cargo de lo que salió. Y en un mundo donde fabricar algo falso no cuesta nada, el que confirma vale más, no menos.

De ahí sale una conclusión que conviene decir sin vueltas: la IA no te va a dar ingresos. Te va a dar tiempo. Los ingresos salen de lo que hagas con ese tiempo, y eso es un camino distinto, con pasos y con orden.

Ponerle nombre y foco a lo que ya cubres, para que se entienda de qué eres. Abrir tu medio, que es el único lugar donde esto se puede sostener y medir. Mudar a los que ya te leen sin perderlos por el camino. Sostener la publicación diaria sin que te coma el día, que es donde la IA se vuelve tu equipo y no un juguete. Y cobrar: tu primer anunciante local.

Los cinco pasos acompañados, con el módulo de IA y el de verificación adentro, son el Sistema de Ingresos Diarios. Pago único de 27 dólares, acceso de por vida y garantía de 7 días: lo miras una semana y si no es lo que esperabas, te devuelven todo. El enlace está en la biografía.

En el carrusel, el mes entero resumido en una pieza, para el que llegó tarde.

Si hoy tuvieras que explicarle a un negocio de tu ciudad por qué te conviene a él, ¿qué le dirías primero? 👇` },

{ fecha: '2026-09-26', dia: 'Sáb', tipo: 'texto', temp: '🌡️', semana: 's3',
  titulo: 'Firmar es responder',
  story: { eyebrow: 'Sábado',
    hook: 'Firmar no es<br>poner tu nombre.<br>Es decir<br><span class="accent">yo respondo</span>',
    sub: 'Y eso, por ahora, <strong>no se delega</strong>.' },
  caption: `Firmar no es poner tu nombre arriba de un texto. Es decir "si esto está mal, yo respondo".

Es una diferencia que no se nota hasta que algo sale mal. Ahí se ve enseguida quién estaba firmando y quién estaba solamente publicando.

Pienso en esto porque todo el mes hablamos de herramientas, y las herramientas tienen una manera silenciosa de correr la responsabilidad de lugar. "Me lo dio la IA" se parece muchísimo a "me lo pasaron por el grupo", y las dos frases sirven para lo mismo: para que el error sea de otro.

Pero no hay otro. El lector no le reclama a la máquina. Te cruza a ti en la vereda.

Lo interesante es que eso, que suena a peso, es en realidad lo único que te vuelve necesario. Si responder no valiera nada, cualquiera podría ocupar tu lugar mañana, porque escribir bien ya no es escaso.

Responder sí lo es. Y se nota en las cosas chicas: cuando corriges a la vista, cuando dices qué no pudiste confirmar, cuando te bancas no publicar algo que te habría dado muchas visitas.

Nada de eso lo puede hacer un programa. Y ninguna versión nueva lo va a poder hacer, porque no es una cuestión de capacidad. Es que no tiene nada en juego.

¿Cuál fue la última nota que decidiste no publicar? 👇` },

{ fecha: '2026-09-27', dia: 'Dom', tipo: 'carrusel', temp: '❄️', semana: 's3',
  titulo: 'El periodista que va a importar',
  story: { eyebrow: 'Lo que viene',
    hook: 'No va a ser<br>el que más sepa<br>de IA.<br><span class="accent">Va a ser otro</span>',
    sub: 'El que la usa <strong>sin dejar de ser el que responde</strong>.' },
  caption: `El periodista que va a importar dentro de unos años no va a ser el que más sepa de inteligencia artificial. Va a ser el que la use sin dejar de ser el que responde.

Y no es una frase bonita: es una diferencia práctica, y ya se ve quiénes van para cada lado.

Están los que la rechazan de plano. Van a seguir haciendo bien su trabajo, y les va a llevar el triple de tiempo que a los demás. En un oficio donde el tiempo es lo único que no sobra, eso los va a ir dejando afuera sin que nadie los eche.

Están los que la adoptaron entera. Publican más que nadie, más rápido que nadie, y en algún momento publican algo que no chequearon. Con eso alcanza: el capital que tardó años se les cae en una tarde.

Y está el tercero, que es el que menos ruido hace. Usa la IA para todo lo que es mover material y no le entrega ni una sola decisión. Chequea, corrige a la vista, dice de dónde sacó las cosas. Publica menos y le creen más.

Ese tercero es el que va a poder cobrar por esto. No porque sea el más moderno, sino porque cuando todo se llene de textos correctos y vacíos, va a ser el único al que se le note que hay una persona atrás.

En el carrusel, los tres caminos y en qué se nota cada uno desde afuera.

De los tres, ¿cuál se parece más a lo que hiciste este mes? 👇` },

// ═════════ CIERRE (28→30/09) ═════════

{ fecha: '2026-09-28', dia: 'Lun', tipo: 'carrusel', temp: '❄️', semana: 'cierre',
  titulo: 'El mes en una hoja',
  story: { eyebrow: 'Cierre',
    hook: 'Todo el mes<br>en una hoja.<br>Para el que<br><span class="accent">llegó tarde</span>',
    sub: 'Cinco ideas. <strong>Y una sola cosa para hacer esta semana.</strong>' },
  caption: `Todo lo de este mes en una hoja, para el que llegó tarde y para el que quiere tenerlo junto.

Cinco ideas, en el orden en que se usan.

La IA no sabe: predice la continuación más probable de lo que le diste. Por eso lo que le pones adelante decide lo que te devuelve, y por eso inventa datos con la misma seguridad con la que dice verdades.

Con tres palabras te da el promedio de todo. Y el promedio de todo no se parece a nada.

Una línea adelante cambia el resultado: para quién es y dónde se publica. Es una sola pieza del encargo y ya se nota.

Hay una parte que no se delega. Ella mueve material; tú decides qué se publica y respondes por lo que sale. El día que se mezclan, lo que se pierde es la razón por la que te leen a ti.

Y la que cierra todo: cuanto más fácil es fabricar un falso, más vale el que chequea. La ola que asusta es la que te sube el precio.

En el carrusel, las cinco en placas, para guardar.

Mañana, la última encuesta del mes: quiero saber en qué quedó esto para cada uno.

De las cinco, ¿cuál te resultó más útil? Dime el número. 👇` },

{ fecha: '2026-09-29', dia: 'Mar', tipo: 'texto', temp: '❄️', semana: 'cierre', encuesta: true,
  titulo: 'ENCUESTA · En qué quedó',
  story: { eyebrow: 'Última encuesta',
    hook: 'Después de<br>todo el mes,<br>¿en qué<br><span class="accent">quedó?</span>',
    sub: 'A, B, C o D. <strong>Y la D es una respuesta tan válida como las otras.</strong>' },
  caption: `Última encuesta del mes, y la más útil para mí. Una letra.

Pasó septiembre entero hablando de esto. ¿En qué quedó para ti?

A — Todavía no probé nada. Lo leí, me interesó, no lo abrí.

B — Probé una cosa suelta y funcionó, pero no lo volví a hacer.

C — Ya es parte de mi rutina: hay algo que hago con IA todas las semanas.

D — Lo probé y no es para mí. Prefiero seguir como estoy.

La letra en los comentarios, sin explicación.

Y una aclaración sobre la D, porque me interesa de verdad: no es la respuesta equivocada. Es la que más me sirve leer. Si el mes entero no te movió, o el contenido no sirvió o la herramienta no es para tu manera de trabajar, y las dos cosas son información para lo que escriba en octubre.

La A tampoco es un problema. Es la más común y la más honesta: entre leer algo y hacerlo hay una distancia que no se cruza con ganas, se cruza con un rato reservado.

Mañana cierro el mes con lo único que hay que hacer para pasar de la A a la B. Es una sola cosa y lleva diez minutos.

¿A, B, C o D? 👇` },

{ fecha: '2026-09-30', dia: 'Mié', tipo: 'carrusel', temp: '❄️', semana: 'cierre',
  titulo: 'Los diez minutos de octubre',
  story: { eyebrow: 'Fin de mes',
    hook: 'Diez minutos.<br>Una sola tarea.<br>Y mañana<br><span class="accent">empieza octubre</span>',
    sub: 'De leer a hacer hay <strong>un rato reservado</strong>, no ganas.' },
  caption: `Último día del mes. Si estas semanas leíste todo y no probaste nada, esto es para ti, y lleva diez minutos.

Una sola tarea, hoy o mañana, antes de que empiece octubre y se llene solo.

Abre una IA gratuita —Claude, ChatGPT o Gemini, cualquiera— y agarra la última nota que publicaste. La última, no la mejor.

Pégala y pon adelante la línea del 9 de septiembre: para quién es y dónde se publica. Tu ciudad, tu lector, el celular, el muro, y qué es lo único que a esa persona le importa del tema.

Y pídele una sola cosa: la primera línea. No la nota entera. La primera línea, tres versiones.

Eso es todo. Diez minutos, una nota que ya escribiste y una decisión que sigue siendo tuya, porque de las tres versiones eliges tú, o no eliges ninguna.

Lo hago con la última y no con la mejor a propósito. La mejor ya te salió bien y no te va a enseñar nada. La última es la que hiciste apurado, que es donde de verdad se nota si esto sirve.

Si te devuelve algo peor que lo tuyo, también sirve: quiere decir que en esa nota tu primera línea ya estaba bien, y ahora lo sabes.

En el carrusel, la tarea con el texto exacto para copiar.

Cuéntame cómo te fue. Y si te devolvió algo peor, cuéntamelo también. 👇` },

]
