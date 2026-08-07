import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 3.3 — Chequear declaraciones y datos con IA. Estructura: triangulación. Hero: el triángulo de fuentes.
j.f33 = [
  // — Gancho —
  "Hay una frase que lo explica todo: una mentira repetida mil veces no se vuelve verdad, pero empieza a sonar como si lo fuera. Un dato que ves en diez lugares distintos, una declaración que todos citan, un número que se repite hasta el cansancio: la repetición nos convence, aunque atrás no haya nada sólido.",
  "Las palabras viajan más rápido que los hechos. Por eso hoy vamos a lo que más se repite sin chequear: las declaraciones y los datos. Y vas a aprender un método simple para no dejarte llevar por el eco.",

  // — Puente —
  "En la clase pasada, para las imágenes, tenías la búsqueda de origen: subías la foto y veías de dónde salía. Para una frase o un número no podés hacer exactamente eso, porque una frase no tiene una única foto original que buscar. Pero tiene algo parecido, y hasta más poderoso. En vez de buscar de dónde salió una imagen, vas a aprender a rastrear de dónde salió un dicho o un dato, y a cruzarlo. A eso los periodistas lo llamamos, desde siempre, triangular.",

  // — Idea central —
  "La idea de hoy es una regla vieja del oficio que la tecnología no cambió, solo hizo más fácil de cumplir: un dato no se confirma con una sola fuente. Una fuente sola puede estar equivocada, puede haber entendido mal, o puede tener un interés. Por eso un dato serio se apoya en varias fuentes que, sin copiarse entre sí, dicen lo mismo. Cuando tres apuntan al mismo lugar, empezás a estar parado en algo firme.",

  // — Bloque 1 · dos cosas distintas —
  "Antes del método, separemos qué estamos verificando, porque hay dos animales distintos. Uno es una declaración: tal persona dijo tal cosa. Acá el chequeo es encontrar el momento real en que lo dijo, el video, la entrevista, el documento, y no quedarte con quién lo repitió. Muchas veces una frase se recorta, se saca de contexto o directamente se inventa, y circula como captura de pantalla, que es facilísimo de falsificar.",
  "El otro es un dato o un número: el tanto por ciento de tal cosa, subió tanto, hay tantos casos. Acá el chequeo es encontrar quién lo midió, cuándo y cómo. Un número sin un dueño, sin un organismo, un estudio o un informe detrás, es apenas un rumor con forma de cifra. Para los dos, el camino es el mismo: remontar hasta la fuente primaria y triangular.",

  // — Bloque 2 · la fuente primaria —
  "Primera pieza: remontar hasta el origen. La fuente primaria es el lugar donde el dato nació, no donde lo leíste. Pensá cómo viaja una información. Un organismo publica un informe. Un medio grande lo cuenta y, al resumir, le cambia un poco el énfasis. Otro medio copia a ese, y le exagera el título. Alguien hace una publicación con ese título. Y vos ves la publicación. Estás a cuatro pasos del dato real, y en cada paso alguien le puso o le sacó algo.",
  "Verificar es hacer ese camino al revés hasta llegar al informe original, y mirar qué dice de verdad. Y pasa muy seguido: cuando llegás a la fuente primaria, descubrís que el dato existe pero decía otra cosa, más matizada, menos jugosa que el título que circulaba. Un estudio demuestra que, leído en el estudio, muchas veces dice: un estudio sugiere que, en ciertas condiciones, podría. No es lo mismo, y esa diferencia es tu nota bien hecha.",
  "La pregunta que abre esta puerta es siempre la misma: ¿quién lo dijo primero, y dónde puedo verlo con mis propios ojos? ¿Y cómo se hace ese camino al revés, en concreto? El primer movimiento es simple: buscá el nombre del estudio o de la persona entre comillas, o escribí el dato junto con la palabra informe o fuente, y fijate qué resultado está más cerca del origen. Si te trabás, ahí tu equipo de inteligencia artificial ayuda a orientar: pedile qué organismo suele medir este tipo de dato. Esto lleva unos minutos, a veces cinco, a veces media hora si la fuente está enterrada. Es tiempo bien gastado.",

  // — Bloque 3 · triangular —
  "Segunda pieza: cruzar. Una vez que tenés una fuente, buscás si otras, independientes, dicen lo mismo. La palabra importante es independientes. Diez medios que publicaron lo mismo copiándose entre sí no son diez fuentes: son una sola fuente repetida diez veces. La coincidencia recién vale cuando las fuentes llegaron al dato por caminos distintos. Cuando cosas que no se hablaron entre sí coinciden, ahí sí estás firme.",
  "¿Y cuántas alcanzan? Con dos independientes que coincidan ya estás mucho más parado; con tres, sólido. No es un número mágico: es cuántas hacen falta para que dejes de dudar con razón. Y al revés también sirve: si encontrás que una fuente seria contradice el dato, o que ya fue desmentido, acabás de ahorrarte un error. Triangular no es solo confirmar; es exponer el dato a que lo contradigan, y ver si aguanta.",

  // — Bloque 4 · la IA —
  "Acá tu equipo de inteligencia artificial es un gran ayudante de investigación, siempre que lo uses en su lugar justo. Y hay una trampa grande que quiero que evites. Es tentador abrir la inteligencia artificial y escribir: ¿es cierto que tal persona dijo tal cosa?, y tomar su respuesta como la verdad. No lo hagas. Acordate: predice lo que suena probable, y puede inventar una cita, un estudio o un número con total seguridad. Usarla como fuente es volver justo al problema que estamos tratando de resolver.",
  "Ahora, en su lugar justo, es oro. Pedile que te ayude a ordenar la búsqueda: ¿qué organismos suelen medir este dato?, ¿qué preguntas debería hacerme? Pedile que te haga de documentalista: si conseguís el informe original, pegáselo y pedile qué dice exactamente sobre tu punto. Ahí no está inventando, está resumiendo algo que vos le diste. Y como tenés el documento delante, el dato puntual que vas a publicar lo leés vos en el original. La regla, otra vez: la inteligencia artificial te ayuda a buscar y a leer más rápido; la que confirma, con la fuente delante, sos vos.",

  // — Bloque 5 · señales de alerta —
  "Para cerrar el método, un puñado de luces amarillas: cosas que, cuando aparecen, te tienen que prender la alarma para chequear antes de creer. Un número muy redondo y sin fecha. Un dato sin dueño: estudios demuestran, los expertos dicen, sin decir cuáles. Una declaración que solo existe como captura de pantalla. Un dato que aparece únicamente en lugares que ya venían empujando esa idea. Y una cifra demasiado perfecta para lo que querés que diga: cuando un número te viene tan cómodo, es justo cuando más conviene chequearlo.",

  // — Ejemplo trabajado —
  "Veámoslo. Circula un dato fuerte: el noventa por ciento de la gente de tal lugar hace tal cosa. Suena tremendo, y todos lo comparten. Primer reflejo: es un número redondo, sin fecha y sin dueño. Luz amarilla. Segundo paso, la fuente primaria: rastreás quién lo dijo primero, y llegás a una nota que cita un estudio. Vas al estudio. Y ahí está la sorpresa: el estudio era chico, de hace años, sobre un grupo muy específico, y el número real era bastante más bajo.",
  "Tercer paso, triangular: buscás si algún organismo serio midió lo mismo hace poco, y encontrás una cifra distinta y más confiable. Resultado: no publicás el noventa por ciento. Publicás el dato correcto, con su fuente, y de paso podés contar por qué el otro número era engañoso, que es una nota todavía mejor. Tardaste un rato, sí. Pero acabás de convertir un rumor en periodismo.",

  // — Recuerdo —
  "Sin vueltas, tres preguntas para fijar la idea. Primera: ¿por qué no alcanza una sola fuente? Porque puede estar equivocada o interesada; un dato firme lo dicen varias fuentes independientes que coinciden. Segunda: ¿qué es la fuente primaria y cómo se llega? Es el origen donde nació el dato; se llega remontando la cadena hacia atrás hasta verlo con tus propios ojos. Tercera: ¿cuál es la trampa con la inteligencia artificial? Preguntarle ¿es cierto? y creerle, porque puede inventar la respuesta.",

  // — Tarea —
  "Tu tarea es un mini rastreo, y es entretenido. Elegí un dato o una declaración que hayas visto circular hace poco, algo que te haya llamado la atención. Y hacé el camino al revés: buscá quién lo dijo primero, tratá de llegar a la fuente original y fijate si dice exactamente lo que circulaba. No importa si el dato termina siendo cierto o falso: el ejercicio es el rastreo.",

  // — Cierre y puente —
  "Hoy sumaste la segunda gran herramienta del módulo. Para las imágenes tenías la búsqueda de origen; para las palabras y los números tenés la triangulación: remontar a la fuente primaria y cruzar con fuentes independientes, con la inteligencia artificial como ayudante de investigación, nunca como fuente.",
  "Ya sabés verificar imágenes y datos. Queda una última pieza, y es la que convierte todo este trabajo en confianza visible para tu lector. Porque de nada sirve verificar en silencio: hay que mostrarlo, y saber mostrarlo. De eso, y de cómo cierra todo el módulo, hablamos en la próxima. Vamos con eso.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f33.join(" ").split(/\s+/).length;
console.log("escenas:", j.f33.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
