import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

j.f14 = [
  // — Gancho: el caso —
  "Vamos a mirar una decisión de cerca. Una sola, que dura tres segundos, y que se repite miles de veces en la vida de tu medio. Es la decisión de seguirte.",
  "Una persona, llamémosla Ana, acaba de terminar de leer una nota tuya. Le gustó. Y ahora está a punto de hacer algo que decide si tu trabajo de hoy suma o se evapora: va a entrar a tu perfil.",
  "Miremos juntos esos tres segundos, uno por uno. Y de lo que pasa ahí adentro vamos a sacar todo lo que necesitás saber.",

  // — Segundo uno —
  "Ana entra. Y lo primero que hace su cabeza, antes que cualquier otra cosa, es tratar de contestar una pregunta muy básica: ¿de qué va esto?",
  "Fijate que todavía no está evaluando si sos bueno. Está tratando de entender qué sos. Y hasta que no lo entienda, no puede decidir nada, porque nadie apuesta a algo que no comprende.",
  "Acá aparece lo primero que construye un seguidor, y no es una nota espectacular: es una promesa clara. Que cualquiera que llegue entienda, en tres segundos, qué tema tocás, para quién, y qué gana si se queda.",
  "Y es el mismo músculo del buen título, que ya tenés entrenado: decir mucho en poco, sin ambigüedad.",

  // — Por qué queda borrosa —
  "Ahora bien, si Ana entra y no entiende de qué vas, casi siempre es por una de dos razones. Y las dos se arreglan igual.",
  "La primera: hablar de categorías en vez de personas. Noticias de actualidad no le dice nada a nadie, porque nadie se levanta a la mañana buscando actualidad en general.",
  "En cambio, lo que pasa en el Concejo, contado para vecinos que no tienen tiempo de seguirlo, tiene un destinatario con cara. Y fijate: la segunda no es más larga por adorno. Es más larga porque dice para quién.",
  "La segunda razón: prometer un tema en vez de un beneficio. Sobre educación es un tema. Para que entiendas qué está pasando en la escuela de tus hijos es lo que esa persona gana. El tema te importa a vos; el beneficio le importa a ella.",
  "Te dejo un test que sirve siempre: escribí tu promesa y leela poniéndole adelante, esto es para vos si. Si lo que sigue describe a una persona reconocible, está clara. Si describe a cualquiera, todavía está borrosa.",
  "Y acordate de lo que vimos en la clase anterior, porque acá las dos cosas se juntan: esa claridad no le sirve solo a Ana. Le sirve también a la plataforma, que necesita saber para quién es tu contenido para decidir a quién mostrárselo. Una promesa precisa convence al que llega, y ayuda a que lleguen los que tienen que llegar.",

  // — Segundo dos —
  "Volvamos con Ana. Ya entendió de qué vas. ¿Alcanza con eso para que toque seguir? Todavía no. Porque ahora hace algo que casi nadie tiene en cuenta al publicar: baja la vista y mira qué más hiciste.",
  "Y lo hace porque es desconfiada, como todos. Sin decirlo con estas palabras, está pensando: buenísima esta nota, ¿pero será que siempre es así de bueno, o le salió una y nada más?",
  "Ahí se juega el partido. Si lo que ve va en la misma línea, mismo mundo, mismo nivel, temas que conversan entre sí, concluye: este siempre entrega esto. Y toca seguir.",
  "Si ve un conjunto sin línea, no puede predecir qué le vas a dar mañana. Y si no lo puede predecir, no te sigue: porque seguir es apostar al futuro, y nadie apuesta a lo impredecible.",
  "Por eso la coherencia le gana a la genialidad suelta. No te sigue quien hizo una obra maestra un martes. Te sigue quien demuestra, pieza tras pieza, que se puede contar con él.",

  // — Las dos coherencias —
  "Y acá conviene separar dos cosas que suelen confundirse, porque son dos coherencias distintas y las dos hacen falta.",
  "Una es la coherencia de tema: que lo que publicás hable del mismo mundo. Si Ana ve cuatro notas sobre tu tema y una sobre algo que no tiene nada que ver, la quinta le mete ruido. No la arruina, pero le hace dudar.",
  "La otra es la coherencia de nivel, y esta se descuida mucho más. Es que todas tengan un piso parecido de cuidado. Podés tener un feed perfectamente ordenado por tema y aun así perder a Ana, porque ve una nota muy trabajada al lado de tres que se nota que salieron apuradas. Y ahí concluye algo peligroso: a veces está bueno. Y a veces no alcanza para seguir a nadie.",
  "De las dos, la de nivel es la más difícil, porque depende de tu ritmo real de trabajo. Y de ahí sale una decisión que conviene tomar temprano: es mejor publicar menos y sostener el nivel, que publicar mucho con un piso que sube y baja. Ana no cuenta cuántas publicaste. Nota si puede confiar en la próxima.",

  // — Y después de que sigue —
  "Antes de ir a los números, algo que casi nunca se cuenta: la decisión de seguirte no termina cuando toca el botón. Se revalida cada vez que aparecés.",
  "Pensalo desde Ana. Te siguió con una expectativa, formada en tres segundos. Las próximas veces que la cruces, va a estar chequeando, sin darse cuenta, si esa expectativa era correcta.",
  "Si lo que ve confirma la promesa, la decisión se afirma y deja de revisarla: pasás a ser parte de lo que espera. Si lo que ve no se parece a lo que la trajo, la decisión se afloja, y en algún momento deja de mirarte, con o sin botón de por medio.",
  "Por eso las primeras publicaciones después de que alguien te sigue valen más que las otras: son las que confirman o desmienten lo que prometiste. Y esto tiene una consecuencia práctica linda: cuando ganás un seguidor, tu trabajo no terminó, pero tampoco tenés que hacer algo nuevo. Tenés que hacer exactamente lo que prometiste. Que es, justamente, lo más fácil de sostener.",

  // — Segundo tres: los números —
  "Y ahora el momento. Ana decide. Miremos cómo se ve esa decisión repetida cien veces, con números de ejemplo para ver el mecanismo.",
  "Arranquemos con una nota que llega a mil personas nuevas. De esas mil, cien frenan y la leen entera: les gustó, como a Ana. Hasta acá, todo bien. Y ahora la pregunta del día: de esas cien a las que les gustó, ¿cuántas siguen?",
  "Primer caso. Entran y encuentran una promesa clara y cinco notas más en la misma línea, todas buenas. Piensan: esto siempre es así. De las cien, quince siguen.",
  "Segundo caso. Entran y encuentran un lugar sin línea clara, con cosas dispersas. Piensan: no sé bien qué es esto. De las cien, siguen dos.",
  "Y acá está lo importante: la nota que las trajo era la misma. Idéntica. Lo que cambió fue lo que encontraron después.",
  "De ahí sale la frase que quiero que te lleves de esta clase: la nota abre la puerta; el conjunto decide si se quedan.",

  // — El criterio —
  "Ya vimos la decisión desde adentro. Ahora bajémosla a algo que puedas usar el lunes. Porque decir sé coherente es fácil. Lo difícil es el momento real: estás frente a un tema que te entusiasma y tenés que decidir si va o no va.",
  "Antes de publicar, pasá el tema por tres preguntas. No son tres filtros distintos: son la misma pregunta mirada desde tres lados.",
  "Uno: ¿esto le sirve a la misma persona de siempre? No a gente, sino a la persona concreta que ya te lee. Si tu medio le habla a docentes de tu ciudad y aparece un tema buenísimo sobre otra cosa, la pregunta no es si el tema es bueno. Es si a esa persona le sirve.",
  "Dos: ¿si esta pieza fuera la primera que alguien ve de mí, entendería de qué voy? Y es la que más se olvida, porque cualquier publicación puede ser la puerta de entrada de un desconocido. Cualquiera puede ser el segundo uno de otra Ana.",
  "Tres: ¿podría hacer diez más como esta? Si la respuesta es no, atención: puede ser una pieza excelente y aun así una promesa que no vas a poder sostener. Y lo que se sigue es lo repetible.",
  "Ahora, esto no es una jaula. Un tema que no pasa las tres preguntas no está prohibido, y salirse de vez en cuando le da aire a un medio. Lo que no funciona es que las excepciones sean la mitad de lo que publicás, porque ahí dejan de ser excepciones y pasan a ser tu línea.",
  "La coherencia no es hacer siempre lo mismo: es que se entienda qué es lo mismo. Y para un periodista, esta decisión ya la sabés tomar. Es el criterio que usa un editor cuando define qué entra en la edición de mañana. La diferencia es que ahora el editor sos vos.",

  // — Las tres preguntas, aplicadas a un caso —
  "Probemos las tres preguntas con un caso, para que veas cómo se usan de verdad. Digamos que tu medio cubre educación en tu ciudad. Y aparece un tema nacional grande, de esos que están en todos lados, que no tiene nada que ver con lo tuyo. Tenés ganas de escribirlo: es importante, tenés una opinión, y además va a traer visitas.",
  "Pasémoslo por las tres. ¿Le sirve a la persona de siempre? A tu lector, que te sigue para entender qué pasa en las escuelas de su barrio, no especialmente. ¿Si fuera la primera pieza que alguien ve, entendería de qué vas? No: pensaría que sos un medio de política nacional, que es justo lo que no sos. ¿Podrías hacer diez más como esta? Tampoco, porque no es tu terreno.",
  "Tres noes. La respuesta es clara, y sin embargo cuesta, porque el tema es bueno. Por eso conviene tener el criterio escrito de antemano: para que la decisión no dependa del entusiasmo del momento.",
  "Ahora demos vuelta el caso. Mismo tema nacional, pero lo escribís desde tu ángulo: qué significa para las escuelas de tu ciudad, a quién afecta acá, qué cambia para tus lectores. Volvé a pasar las tres preguntas y vas a ver que ahora las pasa todas.",
  "Y ahí está lo interesante: casi nunca hay que elegir entre el tema que te entusiasma y la coherencia. Casi siempre hay un ángulo desde el cual ese tema sí es tuyo. Encontrarlo es, otra vez, oficio de periodista.",

  // — La regla —
  "Antes de cerrar, algo corto que conviene tener presente: nadie sube dos escalones de una. A Ana no le podés pedir el correo en el mismo momento en que te descubre, igual que no le pedís plata prestada a alguien que acabás de conocer.",
  "Cada escalón se gana cumpliendo el anterior. Por eso hoy nos ocupó uno solo: que diga quiero más. Los de arriba llegan después, y llegan casi solos si este está bien construido.",

  // — Pausa de recuerdo —
  "Pará un segundo. Sin releer nada, contestate: ¿qué pregunta se hace Ana, sin decirla, antes de seguirte? Date el momento.",
  "La pregunta es: ¿esto me va a seguir sirviendo? Si te salió eso o algo parecido, ya tenés la llave. Seguir no es un premio a una nota: es una apuesta a tu futuro. Y vos la hacés fácil siendo claro y siendo coherente.",

  // — Una tentación común —
  "Un último matiz, porque hay una tentación muy común en esta etapa. La tentación es pensar que para que te sigan tenés que gustarle a todos. Y entonces se abre el abanico: un poco de todo, para no dejar a nadie afuera. Suena razonable y produce el efecto contrario.",
  "Porque cuando le hablás a todos, dejás de ser claro para cada uno. Tu promesa se vuelve borrosa, tu conjunto se vuelve disperso, y Ana ya no puede predecir qué le vas a dar.",
  "La paradoja es linda: cuanto más específico sos, a más gente convertís. No porque le llegues a más, sino porque a los que le llegás los convencés de verdad. La gente no sigue lo que es un poco de todo; sigue lo que sabe exactamente qué es.",

  // — Cierre y tarea —
  "Recorrimos tres segundos y sacamos de ahí toda la clase. Que alguien pase de visitante a seguidor es que responda que sí a una pregunta, y responde que sí cuando encuentra dos cosas: una promesa clara, que le dice de qué vas al instante, y coherencia, que le prueba que esa promesa la cumplís siempre.",
  "Ahora te toca a vos. Andá a buscar la frase que escribiste en la primera clase, esa de un medio de confianza sobre tal tema, para tal comunidad. Ahí la definiste para vos, para tener claro qué estabas construyendo.",
  "Hoy la ponemos a prueba del otro lado: leela como si fueras Ana, un desconocido que le da tres segundos. ¿Entiende de qué va? ¿Se da cuenta de si es para ella? ¿Sabe qué gana si se queda? Reescribila hasta que pase esas tres preguntas.",
  "Y una aclaración que te va a sacar presión de encima: esta es una primera versión, y está bien que lo sea. Tu tema lo vamos a afinar más adelante, cuando trabajemos el nicho con calma. Lo que estás practicando hoy no es la frase definitiva: es el criterio para juzgarla.",
  "En la próxima clase subimos un escalón más. Ana ya te sigue; ahora vamos a ver cómo algunos dan el paso más valioso de todos: dejarte un canal directo, que no depende de ninguna plataforma. Seguimos en la que viene.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f14.join(" ").split(/\s+/).length;
console.log("escenas:", j.f14.length, "· palabras:", w, "· ~min con Chris:", (w / 143).toFixed(1));
