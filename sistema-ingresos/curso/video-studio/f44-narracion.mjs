import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 4.4 — Tipografía y logo sin diseñador. Estructura: dos decisiones. Hero: letras + logo wordmark.
j.f44 = [
  "Tipografía y logo suenan a terreno de especialista, y en realidad son dos decisiones simples, que se toman con criterio y buen gusto, no con talento artístico. Hoy las vas a resolver las dos. Vas a ver que, con herramientas gratuitas que ya están a tu alcance, podés dejar tu medio con una letra clara y un logo digno esta misma tarde. Sin diseñador, y sin gastar un peso.",
  "Venís con dos piezas firmes: tu nombre, que trabaja por el oído, y tu paleta de colores, que trabaja por la emoción. Hoy sumamos las dos que faltan para que tu marca tenga cara completa: la forma de las letras y el logo.",

  "Y arranquemos con una base que da tranquilidad: hoy vas a elegir entre cosas que ya existen y están muy bien hechas, y a combinarlas con las decisiones que ya tomaste. Tu trabajo hoy es de buen gusto y de sentido común. No vas a crear nada desde cero.",
  "La idea que ordena la clase es esta: para tu marca, la claridad le gana a la creatividad. La letra tiene un trabajo antes que cualquier otro, dejarse leer sin esfuerzo; y el logo tiene un trabajo antes que cualquier otro, que se entienda tu nombre de un vistazo. Cuando entendés que están para servir, no para lucirse, las decisiones se vuelven fáciles.",

  "Empecemos por la letra. De todas las tipografías del mundo, alcanza con conocer dos grandes familias. La primera tiene unos pequeños remates, o patitas, en las puntas de cada letra: son las de aire clásico, editorial, de diario de toda la vida, y transmiten tradición y confianza. La segunda es de trazo limpio, sin esos remates: son las de aire moderno, simple, y transmiten cercanía y claridad. Ninguna es mejor que la otra: es cuál le va a tu medio.",
  "En los bancos de fuentes vas a ver estas dos familias con su nombre técnico: a las de remates se las llama serif, y a las de trazo limpio, sans serif, que quiere decir justamente sin remates. Con reconocer esas dos palabras ya te movés bien.",
  "Ahora, la regla que separa un medio prolijo de uno amateur, y es tan simple que da gracia: usá una tipografía, o como mucho dos, nunca más. Con una sola bien elegida ya tenés un medio coherente. Si querés más riqueza, se usa una para los títulos, con más personalidad, y otra bien neutra y legible para el texto largo.",
  "Esa dupla, una que tiene carácter para lo grande y una que se hace invisible para lo que se lee mucho, es la fórmula de casi todos los medios que admirás. Y si dudás qué dos combinan, pedile a la IA combinaciones de dos tipografías gratuitas que peguen bien, una para títulos y una para texto, con el clima de tu marca.",

  "Vamos al logo, y arranco con la mejor parte: tu primer logo puede ser, simplemente, tu nombre bien escrito. Eso tiene nombre propio en el diseño; se llama un logo de solo texto, y es una de las formas más elegantes y usadas que hay. Muchísimas marcas gigantes que tenés en la cabeza son exactamente eso: su nombre, en una buena tipografía, con su color.",
  "Tu nombre, bien tipografiado, ya es un logo válido y profesional desde el día uno. Tomás tu nombre, lo escribís en la tipografía de títulos que elegiste, le ponés tu color principal, y ya tenés un logo. Se lee, se entiende, es tuyo, y se ve bien.",
  "Si más adelante querés sumarle un pequeño símbolo, vas a poder; para empezar, arrancar con tu nombre bien puesto es una decisión sabia y más que suficiente. No necesitás un dibujo ni un ícono para tener un logo digno desde el arranque.",

  "Pongamos esto en herramientas de verdad. Las fuentes las sacás de bancos gratuitos y enormes; el más conocido es Google Fonts, con miles de tipografías libres para usar sin pagar nada. Y todo se arma en un editor de diseño gratuito y online, del tipo que se usa arrastrando cosas con el mouse. En este mismo módulo tenés un video aparte, un recorrido en pantalla paso a paso, donde se arma la marca dentro de una de estas herramientas. Abrís el editor, escribís tu nombre, le aplicás tu tipografía de títulos, le ponés tu color, lo centrás, y lo exportás como imagen, lo ideal con fondo transparente.",

  "Veámoslo con Sobremesa. Ella sabe que su marca respira calidez y tradición, así que para la letra se va a la familia clásica, la de las patitas, que le da ese aire de diario de siempre y de mesa familiar. Elige una tipografía con carácter para el nombre, y una compañera bien simple y legible para el texto largo. Dos, no más.",
  "Para el logo no se complica: escribe Sobremesa en su tipografía clásica, le pone su color vino, lo centra sobre un fondo crema, y listo, ahí está su logo, de solo texto, y se ve como el de un medio de verdad. En una tarde, sin diseñador y sin gastar, pasó de un nombre suelto a un nombre con letra y con logo. Lo que la hizo llegar no fue saber diseñar; fue tener claras las decisiones de antes y animarse a la versión simple.",

  "Repasemos las dos decisiones de hoy. La tipografía: elegís entre las dos familias, la clásica de las patitas o la moderna de trazo limpio, la que respira como tu marca, y usás una, o como mucho dos. El logo: tu nombre bien escrito, en tu tipografía y tu color, ya es un logo profesional. Detrás de las dos, la misma idea: la claridad le gana a la creatividad.",
  "Dejá tu letra y tu logo elegidos, aunque sea en borrador. Primero, decidí tu familia de tipografía según el clima de tu marca, y elegí una para títulos y, si querés, una para texto. Segundo, armá tu logo de solo texto: tu nombre, en tu tipografía de títulos, con tu color principal. No busques la perfección; buscá la versión clara y digna.",
  "Hoy derribaste la idea de que hacía falta un diseñador para tener una marca presentable. Elegiste tu letra con criterio y armaste un logo simple con tu propio nombre. Ya tenés todos los ingredientes de tu identidad: nombre, color, letra y logo.",
  "Lo que falta ahora no es sumar más piezas, sino hacer que todas trabajen juntas, siempre igual, para que tu medio se reconozca de lejos. Y sumarle la última capa, la que se escucha en cada texto: tu voz. En la próxima clase, la que cierra el módulo, juntamos todo en un sistema de marca coherente.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log("f44 OK ·", j.f44.length, "escenas");
