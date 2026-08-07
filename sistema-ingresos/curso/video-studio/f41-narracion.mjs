import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 4.1 — La teoría del nombre. Estructura: la prueba del recuerdo. Hero: 4 pruebas que se encienden.
j.f41 = [
  "Hay una palabra que tu lector va a escuchar antes que cualquier nota que escribas, antes de ver un solo color, antes de leer una sola línea: el nombre de tu medio. Es lo primero que se dice y lo último que se olvida. Y, sin embargo, pocas veces se le da el tiempo que de verdad merece.",
  "Hoy le vamos a dar el lugar que merece. Vas a salir sabiendo exactamente qué hace que un nombre se quede en la cabeza de la gente, para poder mirar cualquier idea que se te ocurra y saber si tiene con qué.",

  "En el módulo anterior tomaste las decisiones de fondo. Elegiste tu nicho, encontraste tu ángulo, dibujaste a tu lector con nombre y todo, y escribiste tu propuesta en una línea. Ahora empieza otra etapa, más visible: ponerle cara a todo eso. Y la cara empieza por el nombre. Llegamos en el orden correcto: el nombre sale del nicho, no al revés.",
  "Vamos a desarmar un mito, con cariño. Mucha gente cree que un gran nombre es un golpe de genio, una palabra rarísima que a nadie se le ocurrió. Y la verdad es más tranquilizadora: los mejores nombres casi nunca son los más ingeniosos. Son los que cumplen bien con unas pocas cosas simples.",

  "Un nombre tiene un solo trabajo: quedarse en la memoria de una persona ocupada que lo escuchó una vez al pasar. Todo lo que ayuda a ese trabajo suma; todo lo que lo complica, resta. Y esas cosas que suman se pueden nombrar y aprender. Vamos a verlas como cuatro pruebas que tu nombre tiene que pasar.",

  "La primera prueba es la del sonido. Un buen nombre entra por el oído antes que por los ojos. Se dice de un tirón, sin que nadie tenga que tomar aire en el medio, y suena bien cuando lo repetís en voz alta.",
  "Hay una manera muy simple de probarlo, y es literal: decilo en voz alta, varias veces, como si se lo contaras a un amigo en un café. Si te sale redondo, vas bien. Si trabás, o suena a que estás leyendo un trámite, ahí hay una fricción. Cuanto más fácil es decirlo, más veces lo van a decir por vos.",

  "La segunda prueba es la de la mano. Hoy, cuando a alguien le gusta tu medio, lo primero que hace es buscarte: escribe tu nombre en un teclado. Y cuando el nombre se escribe tal como suena, sin sorpresas, te encuentra directo, a la primera. Un detalle que suele preguntarse: una tilde o una eñe no son ningún problema, siempre que la palabra sea de uso común y se escriba de una sola forma natural.",
  "La prueba es esta: decile el nombre a alguien que no lo conoce y pedile que lo escriba sin verlo. Si lo escribe igual que vos, sin dudar, pasaste. Que se diga fácil te ayuda a que te nombren; que se escriba fácil te ayuda a que te encuentren.",

  "La tercera prueba es la del sentido, y tiene dos caminos igual de válidos. El primero es el nombre que ya dice de qué se trata: apenas lo escuchás, tenés una pista del tema. Tiene una ventaja enorme al principio: trabaja gratis, porque explica solo.",
  "El segundo camino es el nombre que al principio no dice nada por sí mismo, una palabra corta y linda que podría ser cualquier cosa. Arranca en blanco, pero como no está atado a un significado, se llena con el tuyo a medida que publicás, y con el tiempo pasa a significar exactamente lo que vos hiciste con él.",
  "Cuál te conviene, es una decisión a conciencia. Si querés que la gente entienda de qué se trata desde el primer día, sin explicar nada, andá por el descriptivo. Si tenés una palabra corta que amás y estás dispuesto a darle tiempo para cargarla de sentido, andá por la limpia. Elegí según cuánto querés que el nombre explique al principio, y cuánto querés construir con el tiempo. Las dos ganan.",

  "La cuarta prueba es la más terrenal, y la que más se agradece haber hecho: que el nombre esté disponible para que puedas usarlo de verdad. Un nombre es realmente tuyo cuando está libre: cuando confirmaste que ningún otro medio de tu tema lo usa y que el espacio en internet para tenerlo está disponible para vos. Hoy solo la nombramos, porque la próxima clase entera es sobre esto.",

  "Bajemos las cuatro pruebas a nuestra periodista de los bodegones de barrio. Tiene dos ideas que le gustan. La primera, Guía Gastronómica Urbana Independiente: suena serio, pero es largo, no se dice de un tirón, y a nadie se le va a quedar. Cae en la primera. La segunda, Sobremesa: se dice de corrido, suena cálido, se escribe como suena, y tiene sentido para su mundo.",
  "Tres pruebas pasadas con claridad. La sobremesa es ese momento de quedarse charlando en la mesa después de comer, justo el espíritu del bodegón de barrio. Dice algo sin explicar de más. Le queda pendiente la cuarta, la de disponibilidad, que es exactamente lo que va a resolver en la próxima clase.",

  "Fijemos las cuatro pruebas, que son la vara con la que vas a medir cualquier idea. La del sonido: se dice fácil y suena bien. La de la mano: se escribe tal como suena. La del sentido: dice algo claro, o es una palabra limpia lista para llenarse. Y la de la disponibilidad: está libre para ser tuyo de verdad.",
  "Antes de generar nombres nuevos, entrená el ojo con lo que ya existe. Elegí tres medios, marcas o cuentas que te gusten y recuerdes de memoria. Escribí sus nombres y pasalos por las tres primeras pruebas: sonido, escritura y sentido. La cuarta, la de disponibilidad, guardala para tu propio nombre, que es lo de la próxima clase. Vas a descubrir un patrón: casi todos son cortos, se dicen fácil y se escriben sin dudar.",
  "Hoy dejaste de pensar el nombre como una lotería de inspiración y lo empezaste a pensar como una decisión con criterio. Tenés cuatro pruebas claras: suena, se escribe, significa, está libre. Un buen nombre no tiene que ser un milagro de creatividad; tiene que pasar estas cuatro.",
  "Con la vara lista, en la próxima clase pasamos a la acción: vas a poner a tu equipo de inteligencia artificial a generar decenas de candidatos en minutos, los vas a filtrar con estas cuatro pruebas, y vas a aprender a verificar que el que elijas esté realmente libre. De la teoría del nombre, a tu nombre. Vamos.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log("f41 OK ·", j.f41.length, "escenas");
