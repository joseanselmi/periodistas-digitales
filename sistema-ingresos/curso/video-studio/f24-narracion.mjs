import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 2.4 — Los roles de IA de tu redacción. Recorrido/galería. VERSIÓN PROFUNDA (~10-11 min).
j.f24 = [
  // — Gancho —
  "Cuando pensás en la inteligencia artificial, seguramente la ves como una sola cosa: le pedís, te responde. Una herramienta, un uso.",
  "Pero hay otra manera de verla. No es una herramienta: es un equipo. La misma inteligencia artificial puede ser tu documentalista, tu titulador, tu editor, tu corrector, y varios más. Cada uno con su tarea. Y vos, el que reparte los papeles. Hoy recorremos esa redacción.",

  // — Puente + idea central —
  "Venimos aprendiendo a hablarle: las cuatro piezas de un buen prompt, y cómo conversar y corregir. Ya sabés dirigir una charla. Ahora, esa misma herramienta, según el rol que le des, se convierte en oficios distintos.",
  "La idea de hoy es esta: con una sola inteligencia artificial tenés muchos colaboradores, no uno. Lo que cambia de uno al otro es el papel que le asignás y el encargo que le das. Así que no pienses la inteligencia artificial: pensá mi equipo. Arranquemos el recorrido.",

  // — Escritorio 1 · Documentalista —
  "En el primer escritorio está el que se ocupa del material pesado: el documentalista. Le pasás un texto largo, un informe, una nota extensa, la transcripción de una entrevista que ya tenés en texto, y le pedís que te lo deje manejable.",
  "Mirá lo concreto que podés pedirle. Resumime esto en diez puntos. Sacame solo las cifras y las fechas. Decime cuáles son las tres ideas más fuertes de este documento. Le das el material y te lo devuelve ordenado, listo para trabajar. Es el que te ahorra las horas de leer todo para encontrar lo que importa, y con el que empieza tu jornada más veces de las que creés.",

  // — Escritorio 2 · Titulador —
  "En el siguiente está el titulador, el que juega con las palabras de entrada. Su trabajo es darte opciones, no una sola. Dame diez títulos para esta nota, algunos más directos y otros más curiosos. Este gancho no me convence, probá cinco más. No te casás con la primera idea: elegís entre muchas, y si ninguna cierra, pedís otra tanda hasta que aparezca.",

  // — Escritorio 3 · Editor —
  "Más allá está el editor. Le das un texto tuyo, ya escrito, y le pedís que lo mejore sin cambiarle el fondo. Aclarame esto, que se entienda a la primera. Está largo, dejámelo en la mitad sin perder lo importante. Y una que vale oro: ¿qué parte de esto no se entiende bien? Ahí le pedís que te marque los puntos flojos de tu propio texto, y tenés una segunda mirada sobre lo que escribiste, sin herir el orgullo de nadie.",

  // — Escritorio 4 · Corrector —
  "Al lado está el corrector, callado y preciso. Repasa ortografía, puntuación, y esos detalles que se te escapan cuando escribiste rápido o releíste mil veces la misma línea. Corregime los errores de este texto. Fijate que las fechas y los nombres estén escritos igual en toda la nota. Es una red de seguridad antes de publicar, y no cuesta nada pasarla.",

  // — Escritorio 5 · Adapta formatos —
  "Este escritorio rinde muchísimo: el que adapta a formatos. Agarra algo que ya tenés y lo transforma para otro lado. Una nota puede volverse un texto para redes, un guion para un video corto, una serie de mensajes para difundir de a uno. Pasá esta nota a un texto breve para redes. Ahora, honestamente: acá se ocupa de transformar de un formato al otro; el oficio fino de cada formato, qué hace bueno a un texto para redes o cómo se arma un carrusel, tiene su propio módulo más adelante.",

  // — Escritorio 6 · Sparring —
  "Y hay un escritorio que casi nadie usa: el que te discute. Tu sparring. A este no le pedís que produzca; le pedís que ponga a prueba lo tuyo. Leé esta nota y decime qué le falta. ¿Qué preguntas quedaron sin responder? Ponete en contra de este argumento: ¿dónde está flojo? Y te devuelve los huecos, las objeciones, lo que un lector exigente te marcaría. Es como tener un colega que te lee antes de publicar y te dice, sin miedo, dónde apretar más.",

  // — El que tiene su propio módulo —
  "Y falta uno, que solo voy a nombrar, porque se merece más que un escritorio de paso: el verificador, el que te ayuda a chequear datos, imágenes y declaraciones. Ya dijimos que la inteligencia artificial puede afirmar cosas falsas con total seguridad, así que este rol es delicado y tiene su técnica. Por eso le dedicamos el módulo entero que viene.",

  // — No es todo o nada: los encadenás —
  "Ahora, la parte que lo vuelve un equipo de verdad y no una lista de usos sueltos. Estos escritorios no se usan de a uno: los encadenás. Un trabajo real pasa por varios, uno después del otro, y ahí es donde una persona sola rinde como una redacción.",
  "Te lo muestro con un caso. Grabaste una entrevista de una hora y ya la tenés pasada a texto. Primero, el documentalista: resumímela en los diez momentos más importantes. Con eso en la mano, vos elegís el ángulo y escribís tu nota, que es lo que nadie puede hacer por vos. Después, el editor: aclará y acortá lo que quedó enredado. Y al final, el corrector: repasá nombres, fechas y erratas. Cuatro escritorios, un texto, y vos dirigiendo la posta de uno al otro.",

  // — Cómo cambiás de escritorio en la práctica —
  "¿Y cómo cambiás de un escritorio al otro, en la pantalla? Muy simple. Es la misma ventana de chat: solo cambiás la instrucción que le ponés adelante. Actuá como editor y mejorá esto. Después: actuá como corrector y repasá aquello. Si venís trabajando sobre un mismo texto, seguí en el mismo chat, así se acuerda de todo. Si arrancás algo nuevo y no querés que mezcle, abrí una conversación limpia. Vos elegís.",

  // — Lo que lo hace funcionar —
  "Fijate lo que tienen en común todos estos colaboradores: son la misma herramienta. Lo único que los separa es el papel que le pusiste adelante. Es la primera pieza del prompt, el rol, haciendo su magia: le cambiás el sombrero y cambia de oficio.",
  "Y arriba de todos esos escritorios estás vos. Vos decidís a quién le pasás cada cosa, en qué orden, y qué hacés con lo que cada uno devuelve. Sos el que dirige la redacción. La inteligencia artificial pone las manos en cada puesto; el criterio de qué se publica, y con qué firma, sigue siendo tuyo.",

  // — Recuerdo —
  "Repasemos de memoria, sin mirar la pantalla. Nombrá tres escritorios y qué hace cada uno. Están el documentalista, que resume; el titulador, que da opciones; el editor, que pule; el corrector, que repasa; el que adapta a formatos; y el sparring, que te discute. Y la pregunta de fondo: ¿qué convierte a la inteligencia artificial de un rol al otro? El papel que le asignás. La misma herramienta, distinto sombrero.",

  // — Tarea —
  "Ahora te toca a vos, en papel. De todos los escritorios que recorrimos, elegí los dos que más te servirían en tu semana. Anotalos, y al lado de cada uno escribí una tarea real tuya que le pasarías. Por ejemplo: editor, para las notas que me quedan enredadas. Documentalista, para los informes largos que tengo que leer. Con eso ya sabés por dónde empezar a apoyarte en tu equipo.",

  // — Cierre y puente —
  "Hoy la inteligencia artificial dejó de ser una herramienta y pasó a ser un equipo: varios colaboradores, un mismo motor, y vos dirigiendo. Ya sabés a quién llamar para cada cosa, y cómo encadenarlos en un trabajo real.",
  "Pero cada vez que armás un buen pedido para uno de estos roles, estás creando algo que sirve más de una vez. Sería un desperdicio inventarlo de memoria mañana. En la última clase del módulo vamos a guardar tus mejores pedidos y ordenarlos, para que tu equipo quede armado y listo. Vamos a construir tu biblioteca.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f24.join(" ").split(/\s+/).length;
console.log("escenas:", j.f24.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
