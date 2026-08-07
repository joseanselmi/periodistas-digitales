import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 3.1 — La credibilidad como base del negocio. Estructura: balanza / economía de la confianza. Hero: el sello.
j.f31 = [
  // — Gancho —
  "Nunca fue tan fácil producir contenido como hoy. Cualquiera, en dos minutos, genera un texto que suena bien, una imagen que parece real, un video que engaña. Y eso significa que el mundo se está llenando de cosas que parecen ciertas.",
  "Ahí aparece una oportunidad enorme para vos. Porque cuando todo abunda, lo que escasea se vuelve valioso. Y lo que va a escasear no es el contenido: es alguien en quien confiar. Ese lugar está esperando, y en este módulo vas a aprender a ocuparlo.",

  // — Puente con M2 —
  "En el módulo pasado armaste tu equipo de inteligencia artificial: aprendiste a dirigirla, a pedirle bien, a repartirle roles. Y quedó una frase dando vueltas, que hoy tomamos como punto de partida: la inteligencia artificial puede afirmar cosas falsas con total seguridad.",
  "Eso, que parecía una advertencia, es en realidad tu ventaja. Porque justamente ahí, donde la máquina se equivoca con cara de verdad, es donde entra tu oficio. Vos sos el que confirma. Y confirmar, en un mundo lleno de cosas sin confirmar, vale oro.",

  // — Idea central —
  "En el primer módulo ya lo nombramos: la confianza es tu capital, lo que hace que alguien te lea, te siga y, con el tiempo, te compre. Hoy no venimos a repetirlo, sino a agregar la regla que decide cómo se cuida ese capital. Y para entenderla, primero hay que ver cómo se junta esa confianza, porque lo hace de una manera muy particular.",

  // — Bloque 1 · cómo se construye —
  "La confianza se construye como se llena un frasco: gota a gota. Cada vez que publicás algo y resulta ser cierto, cae una gota. Cada vez que contás bien una historia, cae otra. Nadie confía en vos por una sola nota: confía después de verte acertar muchas veces, sin fallar.",
  "Por eso la confianza es lenta. Es paciente. Se construye a lo largo de meses, con constancia, del mismo modo que se construye una audiencia propia. De hecho, son la misma cosa mirada de cerca: tu audiencia se queda con vos porque te cree. La credibilidad es el pegamento que convierte a un lector de paso en alguien que vuelve.",
  "Ese frasco que fuiste llenando es, literalmente, tu activo más valioso: más que la cantidad de seguidores, más que el alcance de un buen día. Un seguidor que te cree te compra, te defiende y te recomienda; ahí está el valor de verdad.",

  // — Bloque 2 · la asimetría —
  "Ahora, la particularidad de este capital, que es la que define cómo se cuida. La confianza se junta gota a gota, pero se vacía de un golpe.",
  "Podés tener el frasco lleno, construido con meses de trabajo bien hecho, y una sola información falsa publicada con tu nombre alcanza para inclinarlo. Por eso cuesta muchísimo llenarlo y muy poco derramarlo: esa es la asimetría que conviene tener siempre presente.",
  "Y una aclaración que tranquiliza, porque es clave: lo que rompe la confianza no es equivocarse alguna vez. A cualquiera le pasa, y un error reconocido y corregido a tiempo hasta suma, porque muestra que te importa. Lo que la rompe es no haberse tomado el trabajo de chequear. La diferencia entre un tropiezo honesto y un descuido, la gente la nota.",
  "De ahí sale algo que te conviene: ese minuto que dedicás a verificar antes de publicar es la mejor inversión que vas a hacer en todo el día. No es tiempo perdido; es cuidar lo único que no se puede comprar.",

  // — Bloque 3 · vale más ahora —
  "Podrías pensar que esto siempre fue así, y es verdad. Pero hoy pesa más que nunca, y eso juega a favor del que recién empieza. Volvamos al principio: el mundo se está llenando de contenido automático, textos, imágenes y videos que parecen reales y no lo son. La gente lo sabe, y por eso está más desconfiada que nunca.",
  "En ese clima, aparecer como alguien que verifica, que muestra de dónde saca las cosas, que no publica hasta estar seguro, no es un detalle: es exactamente lo que la gente está buscando y casi no encuentra. Mientras muchos corren a publicar cualquier cosa para llegar primero, vos podés ganarte un lugar distinto: el del que vale la pena leer justamente porque se toma el trabajo de confirmar.",
  "Dicho corto: la verificación dejó de ser una obligación aburrida de la profesión y se convirtió en tu mejor herramienta para diferenciarte. En este momento, verificar te hace ganar.",

  // — Bloque 4 · qué es y qué no es verificar —
  "Para que arranques con la idea justa, aclaremos qué significa verificar, porque a veces se lo imagina más difícil de lo que es. Verificar no es desconfiar de todo ni volverte un detective obsesivo. Tampoco es ser lento: con las herramientas de hoy, muchos chequeos toman segundos. Verificar es, simplemente, un hábito: un filtro corto que ponés entre enterarte de algo y publicarlo con tu nombre.",
  "Ese filtro se apoya en tres preguntas que vamos a desarrollar en las próximas clases. ¿Esta imagen o este video son reales? ¿Este dato o esta declaración son ciertos? Y cuando ya verificaste, ¿cómo lo muestro para que se note? Cada una tiene su clase, con su técnica concreta y sus herramientas.",
  "Y una tranquilidad más: en esto, la inteligencia artificial que aprendiste a manejar es una gran aliada. Te ayuda a rastrear el origen de una imagen, a contrastar un dato, a encontrar la fuente. Eso sí, con una regla que ya conocés: ella te acerca pistas, pero la que confirma sos vos. Es tu ayudante de investigación, no tu fuente.",

  // — Ejemplo trabajado —
  "Veámoslo con dos periodistas. Aparece un rumor fuerte, de esos que corren rápido. Los dos lo ven al mismo tiempo. El primero quiere llegar antes que nadie, así que lo publica de inmediato, sin chequear. Le va bien un rato: mucha gente lo ve y lo comparte. Pero al día siguiente el rumor se cae, era falso, y ahora tiene su nombre pegado a una información equivocada.",
  "El segundo dedica veinte minutos a confirmarlo. A veces el dato se sostiene y publica una nota sólida, un poco después, pero de la que nadie va a poder dudar. Y a veces descubre que era falso, no publica nada, y se ahorra quedar pegado a algo equivocado. En los dos casos, ganó: o una nota confiable, o mantener el frasco intacto.",
  "Pasa un año. El segundo se ganó fama de confiable: cuando él dice algo, se le cree sin dudar, lo comparten y lo recomiendan. Esa reputación es, exactamente, el capital que hace crecer un medio. ¿Cuál de los dos construyó un negocio? La respuesta se ve sola.",

  // — Recuerdo —
  "Quedate con estas ideas. Primera: ¿qué es, en el fondo, tu credibilidad, en términos de tu negocio? Tu capital, el activo que hace que tu audiencia se quede y te compre. Segunda: ¿cuál es su particularidad? Se junta lento, gota a gota con cada acierto, y se vacía de golpe con un solo error. Tercera: ¿por qué verificar vale más hoy? Porque el mundo está lleno de falsos, la gente desconfía, y el que verifica se vuelve el que vale la pena leer.",

  // — Tarea —
  "Tu tarea de hoy es de observación, y te va a cambiar la mirada. Durante el próximo día, prestá atención a las cosas que ves circular: noticias, imágenes, videos, datos. Y con cada una, hacete una sola pregunta, sin necesidad de chequear nada todavía: si esto lo tuviera que publicar con mi nombre, ¿lo daría por cierto tal como está, o querría confirmarlo primero? Vas a descubrir que son muchísimas más de las que pensabas.",

  // — Cierre y puente —
  "Hoy pusimos el cimiento del módulo: entendiste que tu credibilidad es el capital sobre el que se construye todo tu negocio, que se junta con paciencia y se cuida con un hábito simple, y que en esta época verificar no te frena, te distingue.",
  "Ya tenés el porqué. Ahora vamos al cómo. En la próxima clase arrancamos por lo que más circula y más engaña: las imágenes y los videos. Vas a aprender a mirarlos con ojo entrenado y a descubrir, en segundos y sin ser perito, cuáles merecen que mires dos veces. Empezamos por ahí.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f31.join(" ").split(/\s+/).length;
console.log("escenas:", j.f31.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
