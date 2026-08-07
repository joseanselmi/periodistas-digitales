import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 2.1 — Qué es la IA y cómo "piensa". Estructura: desmitificación. Hero: máquina de predicción.
j.f21 = [
  // — Gancho —
  "Hay una escena que se repite. Alguien abre por primera vez una de estas inteligencias artificiales, le escribe algo, y en dos segundos recibe un texto que parece escrito por una persona.",
  "Y siente dos cosas al mismo tiempo: asombro, y un poco de inquietud. El asombro se entiende. La inquietud también: si esta cosa escribe así de bien, ¿para qué me necesita a mí?",
  "Esa pregunta tiene una respuesta muy buena. Pero para llegar bien a ella, primero hay que entender qué es realmente esto que tenés adelante. Porque casi todo el mundo lo usa sin saber cómo funciona, y por eso obtiene la mitad de lo que podría.",

  // — Puente con lo anterior —
  "En el módulo pasado vimos el negocio: tu medio como activo, tu audiencia propia, la máquina que trae y retiene gente. Y quedó una pregunta flotando: todo eso suena a mucho trabajo para una sola persona.",
  "Y es verdad. Hace unos años, montar un medio de nicho pedía un equipo. Hoy no: una persona sola puede hacer el trabajo de varias, si sabe dirigir a la inteligencia artificial. Y si todavía no elegiste tu nicho ni montaste nada, quedate tranquilo: no te estás salteando ningún paso. Aprenderla ahora es llegar con las manos listas a todo lo que sigue.",

  // — Idea central —
  "Toda la clase cabe en una idea, y te la doy ahora, sin vueltas: la inteligencia artificial no piensa; predice la palabra que sigue.",
  "Suena raro, porque el resultado parece pensamiento. Pero cuando entiendas de verdad lo que hace por debajo, vas a saber por qué a veces te da algo brillante y a veces algo flojo, y qué podés hacer para que sea casi siempre lo primero.",

  // — Bloque 1 · derribemos el mito —
  "Empecemos por lo que la inteligencia artificial no es, porque ahí se cuelan casi todos los malentendidos. No es un cerebro. No es una persona chiquita adentro de la computadora.",
  "No sabe cosas como las sabés vos, con recuerdos y experiencias. Y no tiene intención propia: no quiere nada, no le importa nada, no tiene opinión, aunque a veces suene como si la tuviera.",
  "Entonces, ¿qué es? Es un sistema que aprendió a hacer una sola cosa, pero la hace increíblemente bien: dada una cantidad de texto, adivinar cuál es la palabra que vendría después.",
  "Pensalo así. Si yo te digo: de tal palo, tal… tu cabeza completa sola: astilla. Si te digo: más vale pájaro en mano que… completás: cien volando. No lo pensás, te sale. Aprendiste el patrón de tanto escucharlo.",

  // — Bloque 1b · a gran escala —
  "La inteligencia artificial hace esa misma jugada, pero a una escala enorme y con cualquier tipo de texto. Le das un principio, y calcula, entre todas las palabras posibles, cuál es la más probable que siga. La pone.",
  "Después mira todo de nuevo, incluida la palabra que acaba de poner, y predice la siguiente. Y otra. Palabra por palabra, así construye párrafos enteros que parecen pensados. No estás viendo a alguien razonar: estás viendo una predicción, muy afinada, de cómo se seguiría escribiendo eso que empezaste.",

  // — Bloque 2 · cómo aprendió —
  "¿Y cómo llegó a adivinar tan bien? Leyendo. Muchísimo. Se la entrenó mostrándole una cantidad gigantesca de texto: libros, artículos, páginas, conversaciones. Tanto que ninguna persona podría leer eso en mil vidas.",
  "Y con todo ese texto delante, jugó millones y millones de veces al mismo juego: le tapaban la palabra siguiente y tenía que adivinarla.",
  "Cuando erraba, se ajustaba un poquito. Cuando acertaba, reforzaba. Repetí eso a una escala descomunal y pasa algo notable: para adivinar bien, el sistema fue capturando, sin que nadie se lo dictara, un montón de patrones del lenguaje. Cómo se arma una oración, qué tono va con qué tema, cómo sigue una idea a la otra.",
  "No memorizó los textos como quien copia. Absorbió la forma en que solemos escribir: el molde, no las palabras exactas. Es la diferencia entre alguien que se aprendió mil recetas de memoria y alguien que, de tanto cocinar, ya sabe cómo se arma un plato y puede inventar uno nuevo. Por eso no está copiando un texto que ya existe: está prediciendo cómo se escribiría uno nuevo.",

  // — Bloque 2b · la imagen justa —
  "Quedate con una imagen justa de lo que tenés adelante. Imaginá un asistente que leyó casi todo, que nunca se cansa, que escribe rapidísimo y en el tono que le pidas. Y al mismo tiempo, ese asistente no vivió nada, no estuvo en la calle, no tiene tu criterio ni tu palabra empeñada. Las dos cosas son ciertas a la vez, y de esa doble verdad sale todo lo que viene.",

  // — Bloque 3 · las cuatro consecuencias —
  "De esa manera de funcionar salen cuatro consecuencias muy concretas para tu trabajo.",
  "Primera: lo que le das decide lo que te devuelve. Si predice a partir del texto que le pusiste, entonces ese texto es todo. Le das un principio pobre, de dos palabras, y predice algo genérico, promedio, tibio. Le das un principio rico, con contexto y con el tono que buscás, y predice algo mucho más afinado.",
  "Segunda: cuanto más contexto, mejor la predicción. La inteligencia artificial no te conoce, no sabe para qué es esto ni quién te va a leer, salvo que se lo digas. Cada dato que sumás le recorta el abanico de posibilidades y la empuja hacia lo que vos tenías en la cabeza. Darle contexto no es ser educado con la máquina: es lo que sube la puntería.",
  "Tercera, y esta va despacio: puede equivocarse con total seguridad. Como predice lo que suena más probable, a veces predice algo que suena perfecto pero es falso. Un dato inventado, una cita que nadie dijo, una fecha cambiada. Y lo dice con el mismo tono seguro con que dice las cosas ciertas. A esto se lo suele llamar alucinación.",
  "Y para vos, que sos periodista, tiene una consecuencia directa: todo dato que la inteligencia artificial te dé y que vayas a publicar, lo verificás. No porque la herramienta sea mala, sino porque así funciona. Ella propone; el periodista confirma. Cómo verificar rápido, usando la propia inteligencia artificial a tu favor, es el módulo entero que sigue. Por ahora quedate con la regla: lo que lleva tu firma, lo confirmás vos.",
  "Cuarta: arranca de cero cada vez, salvo que le des memoria. Cuando abrís una conversación nueva, no se acuerda de vos ni de lo que hablaron ayer. Eso tiene una cara buena, que es que podés probar sin miedo a ensuciar nada, y una cara práctica: si querés que trabaje con tu estilo o tus datos, se los tenés que poner en la conversación.",

  // — Bloque 4 · las tres que vas a escuchar nombrar —
  "Seguramente escuchaste tres nombres: Claude, ChatGPT y Gemini. Son tres de estas inteligencias artificiales, hechas por empresas distintas.",
  "Para lo que nos importa hoy, quedate tranquilo con esto: las tres funcionan con el mismo principio de fondo. Las tres predicen texto, las tres mejoran si les das buen contexto, las tres pueden alucinar. Y las tres tienen una versión gratis para empezar. ¿Por cuál empezar? Por la que quieras: probalas y quedate con la más cómoda. Lo que aprendas con una te sirve para las otras.",

  // — Ejemplo trabajado —
  "Veámoslo con un caso, con números de ejemplo. Necesitás un titular para una nota. Abrís la inteligencia artificial y escribís, sin más: dame un titular para una nota sobre transporte.",
  "¿Qué le diste? Casi nada. Dos datos: es un titular, es sobre transporte. Con eso predice lo más promedio que existe sobre transporte, y te devuelve algo correcto y olvidable, del tipo: el transporte, un desafío pendiente. Sirve para nada.",
  "Ahora de nuevo, con un buen principio. Le contás que el pasaje del transporte público aumenta un treinta por ciento el mes que viene; que tus lectores lo usan todos los días para ir a trabajar; que querés un titular claro, sin exagerar ni alarmar; y le pedís cinco opciones. Le recortaste el abanico a un rincón muy específico. El mismo motor, la misma inteligencia artificial: lo único que cambió fue lo que le diste de entrada. Esa es toda la diferencia.",

  // — Bloque 5 · te deja mejor parado —
  "Volvamos a la inquietud del principio: si escribe tan bien, ¿para qué te necesita? Ahora tenés con qué responder. Todo lo que le falta es, casualmente, lo que vos tenés de sobra: el criterio para saber qué historia vale, las preguntas que nadie hace, la calle, las fuentes, y la palabra empeñada de que lo que publicás es cierto.",
  "La inteligencia artificial es un asistente extraordinario para las manos, y vos seguís siendo la cabeza. Ella redacta rápido diez versiones; vos elegís la que sirve y sabés por qué. Ella te ofrece un dato; vos lo verificás antes de ponerle tu nombre. Ella no se cansa nunca; vos ponés el rumbo. El que le saca jugo de verdad es el que tiene oficio y aprende a dirigirla. Ese es exactamente tu lugar.",

  // — Práctica de recuerdo —
  "Fijemos lo importante, sin volver atrás. Primera: ¿qué hace la inteligencia artificial cuando te escribe algo? Predice la palabra que sigue, una tras otra, según lo que le diste. Segunda: si te da un dato para publicar, ¿qué hacés antes? Lo verificás, siempre. Tercera: ¿de qué depende sobre todo lo que te devuelve? De lo que le diste de entrada. Si esas tres las tenés claras, ya entendés la inteligencia artificial mejor que la mayoría de la gente que la usa todos los días.",

  // — Tarea —
  "Antes de la próxima clase, una tarea corta y muy concreta. Agarrá papel, o abrí una nota, y escribí tres tareas de tu semana de trabajo que le encargarías a un asistente que escribe rápido, leyó de todo y no se cansa nunca. Pueden ser cosas como resumir un documento largo, escribir cinco versiones de un titular, o pasar una nota a un tono más simple. No hace falta que las hagas todavía: solo identificalas. Esa lista es el primer borrador de tu equipo de inteligencia artificial.",

  // — Cierre y puente —
  "Hoy sacamos a la inteligencia artificial del terreno de la magia y la pusimos donde se la puede dirigir. Ya sabés qué es: un motor que predice texto a partir de lo que le das, con una capacidad enorme y unos límites claros que a vos, como periodista, te dejan justo en el lugar que importa.",
  "Y quedó claro el punto que vas a usar todo el tiempo: lo que le das de entrada decide lo que te devuelve. Así que la próxima clase va entera a eso: la anatomía de un buen prompt, las piezas exactas que necesita una instrucción para que la inteligencia artificial te dé lo que tenías en la cabeza. Lo armamos juntos en la que viene.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f21.join(" ").split(/\s+/).length;
console.log("escenas:", j.f21.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
