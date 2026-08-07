import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

j.f15 = [
  // — Gancho: los dos caminos —
  "Te voy a hacer una sola pregunta: si mañana quisieras contarle algo importante a toda tu audiencia, ¿podrías?",
  "Detrás de esa pregunta hay dos escenarios muy distintos, y hoy los vamos a recorrer en paralelo, uno al lado del otro, para que veas exactamente en qué se diferencian.",
  "Camino A: tenés mil seguidores en una red social. Camino B: tenés cien personas en tu lista de correo.",
  "Diez veces menos gente en el camino B. Y sin embargo, al final de esta clase vas a ver por qué el B vale más. Vamos a compararlos en seis momentos.",

  // — Momento uno —
  "Pongamos un caso puntual. Mañana a la mañana pasa algo importante sobre tu tema y querés avisarle a tu gente hoy mismo, no cuando se enteren solos.",
  "Camino A. Escribís y publicás. Y ahí empieza la espera, porque el reparto no lo decidís vos: la plataforma va a mostrárselo a una parte, cuando ella considere. Podés tener mil seguidores y que tu aviso urgente le aparezca a un puñado, o a nadie, o mañana a la tarde cuando ya no sirve.",
  "Camino B. Escribís y mandás. A las nueve y cinco está en las cien bandejas. Sin espera, sin reparto, sin que nadie evalúe si tu mensaje merece ser mostrado.",
  "Esa es la primera diferencia, y no es de tamaño sino de control: en el camino A pedís permiso para hablarle a tu propia gente; en el B, la puerta ya está abierta. Y fijate que en el momento en que más importa, cuando algo es urgente, es justo cuando esa diferencia se siente más.",

  // — Momento dos —
  "Segundo momento. Pasa algo afuera: cambia una regla, se mueve el reparto, la plataforma decide otra cosa.",
  "Camino A. Tus mil seguidores siguen ahí, en la lista de alguien más. Vos no los tenés: los tiene la plataforma, y te presta el acceso. Si mañana cambian las condiciones, tu manera de llegarles cambia con ellas.",
  "Camino B. Tu lista de cien es un dato que te pertenece. Si cambia una plataforma, o si te mudás a otra, la lista sigue intacta en tu poder. Es la única pieza de toda la máquina que no depende de un tercero para existir.",
  "Esto es lo que en la primera clase llamamos terreno prestado y terreno propio. Ahora ya sabés por qué: lo prestado funciona mientras te lo presten. Lo propio te lo llevás puesto.",

  // — Momento tres —
  "Tercer momento, y este es más sutil. Camino A: tu publicación aparece en un muro, entre decenas de cosas más, muchas diseñadas para llamar la atención. Competís por un segundo de una persona distraída.",
  "Camino B: tu mensaje entra a la bandeja de correo de alguien, que es un espacio más íntimo que un muro público. Y esa persona te dio permiso expreso para entrar ahí.",
  "Por eso lo mismo dicho en un lugar y en el otro no pesa igual. En el A le hablás a una multitud distraída. En el B, a alguien que te abrió una puerta.",
  "Y una aclaración honesta, porque seguro estás pensando en el spam y en la pestaña de promociones: sí, existen. La diferencia es de grado, y es grande. En una red, si no te reparten, no le llega a nadie y no hay vuelta. En el correo tu mensaje sí llega a destino; a lo sumo entra a una carpeta secundaria, y desde ahí la persona te puede marcar como remitente de confianza. Hay maneras de trabajar para que eso pase, y las vemos en su momento.",

  // — Momento cuatro: los números —
  "Cuarto momento. Pongamos números a los dos caminos, ilustrativos como siempre.",
  "Camino A, mil seguidores. Publicás. Por el reparto, tu mensaje aparece frente a unas cien personas, y de esas, unas pocas lo consumen de verdad. Pongamos veinte.",
  "Camino B, cien suscriptores. Mandás. Llega a cien. Y como entraron por un tema que les importaba, digamos que sesenta lo abren y lo leen.",
  "Veinte contra sesenta. Con diez veces menos gente, le llegaste al triple.",
  "Y fijate que el camino B no ganó por tener más audiencia. Ganó porque no hay nadie en el medio decidiendo, y porque los que están, están por elección propia.",

  // — Momento cinco: cómo se consigue —
  "Y el quinto momento es distinto a los otros cuatro. Los anteriores comparaban qué pasa después de publicar; este compara cómo se llega a tener cada tipo de audiencia.",
  "Camino A. Que alguien te siga es gratis para esa persona. Un toque, sin compromiso, sin dar nada a cambio. Por eso es fácil de conseguir, y por eso también vale menos: no costó nada.",
  "Camino B. Que alguien te deje su correo tiene un costo para esa persona: entrega un dato personal y un permiso para entrar a su espacio. Nadie hace eso gratis. Lo sabés vos, que también tenés diez filtros antes de dar el tuyo.",
  "Y acá está el principio que ordena esta etapa entera: nadie deja su correo por nada; lo deja a cambio de algo que vale más que el correo mismo.",
  "Es un trueque. La persona te da algo valioso y espera recibir algo que justifique ese permiso. Si lo que ofrecés vale la pena, el trueque se cierra. Si no ofrecés nada, o si ofrecés algo genérico, no hay trueque.",

  // — Qué puede ofrecer un periodista —
  "¿Y qué puede ofrecer un periodista, concretamente? Porque esta es la pregunta práctica, y tiene respuestas buenas. Lo más valioso que tenés no es un producto: es tu criterio y tu acceso. Y eso se puede empaquetar de varias maneras.",
  "Podés ofrecer un resumen que ahorra tiempo: todo lo que se votó este mes en el Concejo, en una página. Alguien que quiere estar informado y no tiene dos horas te da su correo por eso sin dudarlo.",
  "Podés ofrecer una guía práctica sobre algo que la gente pregunta siempre: los trámites de tu ciudad explicados sin jerga, con los horarios y qué papeles llevar. Vos ya sabés cuáles son las preguntas repetidas, porque te las hacen.",
  "Podés ofrecer un adelanto o un detrás de escena: lo que no entró en la nota, la respuesta completa de la entrevista, el documento en el que te basaste. O una recopilación de lo mejor de tu archivo: las diez notas que más sirvieron, ordenadas para el que recién llega.",
  "Fijate el hilo común de las cuatro: ninguna te obliga a inventar algo nuevo desde cero. Todas salen de trabajo que ya hacés, ordenado de una manera que le ahorra tiempo o le resuelve algo a alguien. Tu archivo y tu criterio ya son el producto; falta empaquetarlos.",
  "Y hay una regla escondida acá: cuanto más específico sea lo que ofrecés, mejor va a ser la gente que entra. Si ofrecés algo genérico, entra cualquiera y se va rápido. Si ofrecés algo preciso sobre tu tema, entra exactamente la persona que te interesa. El trueque no solo llena tu lista: la llena con la gente correcta.",

  // — Momento seis: el tiempo —
  "Y hay un sexto momento que solo se ve estirando el tiempo, así que agreguémoslo.",
  "Camino A. Los seguidores no se acumulan de la manera que uno cree. Cada vez que publicás, arrancás de cero la pelea por el reparto: tener mil no te garantiza nada para la publicación de mañana. Tu audiencia crece, sí, pero tu acceso a ella se vuelve a jugar cada vez.",
  "Camino B. La lista sí se acumula, y de la manera más simple: cada persona que entra se queda. Los cien de hoy son los cien de mañana, más los que sumes. Y el acceso no se vuelve a jugar: ya lo tenés.",
  "Por eso, a un año, los dos caminos no se separan un poco. Se separan mucho. Uno es un número que sube y baja según reglas ajenas; el otro es una base que solo crece.",

  // — Cuándo se pide —
  "Antes de cerrar, una pregunta que seguro te está apareciendo: si el correo es tan valioso, ¿en qué momento se lo pido a alguien?",
  "Y acá se aplica algo que ya vimos: nadie sube dos escalones de una. Pedirle el correo a alguien que te acaba de descubrir es pedirle un gesto grande a cambio de casi nada de confianza. Lo más probable es que no lo dé, y encima queda la sensación de que solo querías su dato.",
  "El momento natural es después de que la persona ya recibió algo tuyo y le gustó. Cuando terminó de leer, cuando resolviste algo que le importaba, cuando ya probó que valés la pena. Ahí el pedido no interrumpe: es la continuación lógica de lo que acaba de pasar.",
  "Y sobre la frecuencia, una sola idea que te va a evitar el error más común: el ofrecimiento no se hace una vez. Se deja disponible siempre, en los lugares donde la gente termina de leerte. Porque cada persona llega en un momento distinto de su recorrido, y la que hoy no está lista puede estarlo en dos semanas.",

  // — Qué les mando después —
  "Y queda una última pregunta, que es la que sostiene todo lo anterior: conseguiste el correo, ¿y ahora? Porque acá pasa lo mismo que vimos con los seguidores: la decisión de quedarse también se revalida. Cada correo que mandás confirma o desmiente por qué esa persona te dio el suyo.",
  "La regla es simple y es una sola: mandá lo que prometiste, en la frecuencia que puedas sostener. Las dos partes importan.",
  "Lo que prometiste, porque si alguien entró por un resumen del Concejo y le llega otra cosa, el trueque se rompió. Y la frecuencia que puedas sostener, porque es preferible uno por mes que llega siempre, a uno por semana durante tres semanas y después silencio. Lo que construye confianza no es el volumen: es que aparezcas cuando dijiste que ibas a aparecer.",
  "Y una cosa más, que a los periodistas nos cuesta: no hace falta que cada envío sea una obra. Alcanza con que sea útil. Un correo corto que resuelve algo vale más que uno largo que no se lee.",

  // — Pausa de recuerdo —
  "Antes de cerrar la comparación, pará un segundo y contestate con tus palabras: ¿por qué nadie deja su correo gratis, y qué hace falta para que lo deje?",
  "Tomate el momento. Porque dar el correo tiene un costo: es un dato personal y un permiso. Y lo deja a cambio de algo que le valga más que ese costo. Si te salió por ahí, tenés el mecanismo entero de esta etapa.",

  // — Lista sana vs grande —
  "Ya comparamos los dos caminos. Ahora una comparación más, pero dentro del camino B, porque hay un número que engaña.",
  "La tentación es medir tu lista por su tamaño. Mil suscriptores suena mejor que cien. Pero lo que importa no es cuántos son: es cuántos te esperan.",
  "Una lista sana es gente que abre lo que mandás, que espera tu envío. Puede ser chica y valer muchísimo. Una lista grande y dormida, mil correos que nadie abre, juntados con algún truco para inflar el número, vale poco, porque hablarle a gente que no escucha es hablarle a una pared.",
  "Y esto lo entendés enseguida con tu oficio. ¿Qué preferís: mil ejemplares de tu diario tirados en un depósito, o cien en manos de cien personas que lo leen de la primera a la última página? Los cien. Una lista vale por cuánto la leen, no por cuánto pesa.",
  "Por eso el objetivo desde el día uno no es inflar el número, sino sumar gente que quiera estar. Y eso se logra con el trueque bien hecho: si entraron por algo específico que les importaba, el tema les importa, y te van a leer.",

  // — Cierre y tarea —
  "Recorrimos los dos caminos y en los cinco momentos pasó lo mismo: el camino B da menos cantidad y más control. Le llegás a quien querés, cuando querés, sin intermediarios, y lo que construís se queda con vos aunque todo lo demás cambie.",
  "Esto engancha directo con lo que hiciste la clase pasada. Ya escribiste la promesa de tu medio; ahora pensá qué podés ofrecer a cambio de un correo. Algo específico, sobre tu tema, que le resuelva o le ahorre algo concreto a tu lector.",
  "No hace falta que lo produzcas todavía. Hoy alcanza con definirlo en una frase: a cambio del correo, voy a dar tal cosa. Esa idea es la semilla de tu audiencia propia, y cuando llegue el momento de armarla vas a tener el camino hecho.",
  "En la próxima clase cambiamos de escala de tiempo. Vamos a recorrer un año entero de un medio, mes por mes, para ver por qué crece lento al principio y de golpe se acelera. Nos vemos en la próxima.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f15.join(" ").split(/\s+/).length;
console.log("f15:", j.f15.length, "escenas ·", w, "palabras ·", (w / 143).toFixed(1), "min");
