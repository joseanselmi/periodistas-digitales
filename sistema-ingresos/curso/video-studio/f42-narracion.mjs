import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 4.2 — Creá tu nombre con IA. Estructura: el taller de nombres. Hero: generar/filtrar/verificar.
j.f42 = [
  "Hoy salís con el nombre de tu medio elegido. En vez de esperar a que aparezca la idea perfecta, vas a tener decenas de opciones en minutos, generadas por tu equipo de inteligencia artificial, y tu trabajo va a ser el más lindo: elegir entre buenas candidatas. Y después, con la misma calma, vas a confirmar que la elegida sea tuya de verdad.",
  "Es un camino corto y ordenado, con un final concreto: cerrar la clase sabiendo cómo se va a llamar tu medio.",

  "En la clase anterior te quedaste con una vara de cuatro pruebas: que se diga fácil, que se escriba como suena, que signifique algo o sea una palabra limpia, y que esté libre. Esa vara es la que hace que hoy funcione todo. La IA aporta la cantidad, y vos aportás el filtro que separa los que sirven de los que no.",
  "Vale la pena recordar una regla que ya es tuya, de cuando armamos tu equipo de inteligencia artificial. La IA es un generador brillante de opciones, y un pésimo juez final. Es increíble para darte cuarenta caminos que a vos solo no se te habrían ocurrido; no es quién para decidir cuál es el correcto para tu medio. Esa decisión es tuya.",

  "El trabajo de hoy tiene tres movimientos, en este orden. Primero, generar mucho. Segundo, filtrar con criterio. Tercero, verificar que esté libre. Los vemos uno por uno.",

  "Empecemos por generar. La diferencia entre una lista pobre y una buena está en cómo le pedís. Si le decís dame nombres para un medio de comida, te va a dar cosas genéricas. La IA es tan buena como el contexto que le pasás, y eso ya lo sabés hacer.",
  "El truco es darle de comer todo lo que definiste en el módulo anterior: le contás que estás por lanzar un medio digital, le decís tu nicho exacto, le decís a quién le hablás, y le pedís algo concreto, veinte ideas de nombre, cortas, fáciles de decir y de escribir. Fijate que no le pedís un nombre: le pedís veinte, y le das las condiciones. Cantidad y dirección.",
  "Podés estirar esa lista, porque hay fórmulas conocidas para crear nombres. Le pedís una tanda por cada una: nombres de una sola palabra evocadora, nombres que junten dos palabras en una, una palabra de todos los días cargada de tu tema, o nombres que suenen a lugar. De golpe pasás de veinte candidatos a muchos más, ordenados por estilo.",

  "Ahora el segundo movimiento, el tuyo: filtrar. Tenés una lista larga y buena, y le vas a pasar por encima la vara de la clase anterior. Leé cada nombre en voz alta. El que trabás al decirlo, afuera. El que tendrías que explicar cómo se escribe, afuera. Vas a bajar a unos pocos que se sienten bien en la boca y en tu tema.",
  "De esos pocos, elegí tus tres finalistas: los tres que, si tuvieras que lanzar hoy, no te darían vergüenza. Todavía no elegís uno solo. Te quedás con tres, porque a la hora de verificar disponibilidad, es muy sano tener alternativas.",

  "Y llegamos al tercer movimiento, el que hace que tu nombre sea tuyo de verdad: verificar que esté libre. Acá aplicás, tal cual, la regla de oro del módulo de verificación.",
  "La disponibilidad de un nombre la confirmás vos, con tus ojos, en las fuentes reales. La IA es genial para generar; el chequeo de si algo está libre es un dato del mundo, que se mira, no se pregunta.",
  "Son tres chequeos, con cada finalista. Primero, escribí el nombre entre comillas en tu buscador de siempre y mirá si ya hay otro medio del mismo tema usándolo fuerte. Segundo, entrá a la red social donde vas a arrancar y fijate si el nombre de usuario está libre: la forma más simple es ir a crear el perfil o editar el usuario y escribirlo; si está tomado, la app te avisa al instante. Tercero, entrá a cualquier sitio de registro de dominios y escribí tu nombre para ver si la dirección está disponible.",

  "Sigamos a nuestra periodista, que llega con Sobremesa como favorito y otros dos de respaldo. Antes de festejar, verifica. Busca Sobremesa entre comillas y ve que no hay otro medio de bodegones de su ciudad llamado así: el campo está libre. Va a la red y prueba el usuario: el exacto está tomado por una cuenta dormida de otro rubro, pero una variante cercana, con una palabra de su ciudad al lado, está libre y hasta le queda mejor.",
  "Y chequea la dirección de internet: hay una versión disponible que le sirve. Tres chequeos, un poco de flexibilidad en la variante, y Sobremesa dejó de ser un capricho para volverse un nombre que puede usar con tranquilidad. No bajó los brazos al primer obstáculo: ajustó, sin cambiar lo que amaba.",

  "Repasemos el taller, que son tres movimientos en orden. Uno: generás mucho, dándole a la IA todo el contexto de tu nicho y tu lector, y estirás con las fórmulas. Dos: filtrás vos, en voz alta, con las cuatro pruebas, hasta tres finalistas. Tres: verificás cada finalista con tus ojos, porque la disponibilidad no se adivina, se confirma.",
  "Hoy salís con nombre. Abrí tu asistente de inteligencia artificial y armale el pedido con tu nicho y tu lector adentro, pidiéndole veinte candidatos. Sumá una tanda por un par de fórmulas. Filtrá en voz alta hasta tus tres finalistas. Y no cierres sin la parte que importa: hacé los tres chequeos de disponibilidad a cada uno. Cuando uno pase limpio, ya tenés el nombre de tu medio.",
  "Pasaste de la hoja en blanco a un nombre elegido y verificado, con la IA poniendo la cantidad y vos poniendo el criterio y el chequeo. Ese nombre es la primera pieza firme de tu marca, y ya es tuyo de verdad, no de palabra.",
  "Un nombre, sin embargo, todavía se ve en blanco y negro. Lo que hace que una marca se sienta y se reconozca de lejos es lo que le sumamos alrededor, y lo primero es el color. En la próxima clase vemos qué transmite cada color y cómo elegir la paleta de tu medio.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log("f42 OK ·", j.f42.length, "escenas");
