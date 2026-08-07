import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 4.3 — Tu color y tu paleta. Estructura: la emoción del color. Hero: paleta que se arma.
j.f43 = [
  "Antes de que tu lector lea una sola palabra de tu medio, ya sintió algo. Lo sintió por el color. En el instante en que algo aparece en su pantalla, mucho antes de entender de qué se trata, el color ya le sopló al oído si esto es serio o relajado, cálido o técnico, para él o para otro. Es la parte de tu marca que trabaja más rápido y más callada.",
  "Hoy vas a aprender a manejar esa herramienta a favor tuyo. Vas a entender qué le dice cada color a la gente, y cómo armar una paleta simple, de pocos colores elegidos a propósito, que haga que tu medio se sienta tuyo apenas lo ven.",

  "Ya tenés tu nombre elegido y verificado. Trabaja por el oído: es lo que la gente dice y recuerda. El color es su compañero, y trabaja por el ojo: es lo que la gente siente y reconoce de lejos. Y hay algo lindo en el orden: tu nombre ya te da pistas del color. Sobremesa, un medio cálido sobre bodegones, te está pidiendo tonos con temperatura, y no un celeste frío de banco.",
  "Vamos con la idea que ordena la clase. El color no es decoración: es comunicación. Cada color arrastra emociones y asociaciones que la gente ya tiene aprendidas sin darse cuenta, y cuando elegís el tuyo, estás eligiendo qué querés que sientan antes de leerte.",
  "Y hay una segunda parte, tan importante como la primera: en marca, menos es más. No vas a elegir muchos colores; vas a elegir muy pocos, y ahí está la fuerza. Una marca que usa dos o tres colores siempre iguales se vuelve reconocible; una que usa diez no se recuerda con ninguno.",

  "Hagamos un paseo corto por las familias de color y lo que despiertan. El rojo y el naranja son calor, energía, apetito; por algo tanta gastronomía los usa. El amarillo es optimismo y cercanía. El verde es naturaleza, salud, calma. El azul es confianza, seriedad, tranquilidad. El violeta, creatividad y algo premium. El rosa, calidez moderna. Y los tonos tierra, el vino, el terracota, el crema, transmiten lo artesanal, lo cálido, lo hecho con las manos.",

  "Ahora, cómo se arma una paleta sin volverse loco. Tiene una estructura muy simple, de tres papeles. El primero es tu color principal: el que más se va a ver, el que la gente va a asociar con vos. Es el protagonista, y define el clima de todo.",
  "El segundo es un color de acento: uno solo, distinto, que usás poco y a propósito, para lo que querés que salte a la vista. Es la sal: en poca cantidad resalta todo; de más, arruina el plato.",
  "Y el tercero no es un color, son tus neutros: un tono muy oscuro para los textos y uno muy claro para los fondos, casi negro y casi blanco. Los neutros son el escenario tranquilo donde tus dos colores pueden brillar. Principal, acento y neutros: esa es toda la fórmula.",

  "Bajemos eso a una decisión que puedas tomar hoy. Empezá siempre por el principal, y sacalo de dos lugares que ya tenés: la emoción de tu tema y el espíritu de tu nombre. Preguntate qué querés que sienta tu lector al llegar, buscá esa emoción en el paseo que hicimos, y ahí está tu familia de color principal.",
  "Con el principal decidido, el acento sale casi solo: un color que contraste, que se lleve bien pero sea claramente otro. Y los neutros son los más fáciles. Si dudás entre dos opciones, este es un buen uso de la IA: contale tu nombre, tu tema y la emoción que buscás, y pedile tres combinaciones de principal, acento y neutros. No para que decida por vos, sino para ver opciones ordenadas.",

  "Y acá va la parte que convierte unos colores lindos en una marca de verdad, y es una sola palabra: repetir. Cada vez que publicás algo con tu color principal, sumás un ladrillo al reconocimiento. La disciplina de la repetición es lo que hace que, con el tiempo, alguien vea tu color sin tu nombre y ya sepa que sos vos.",
  "Por eso lo que elegís conviene anotarlo con precisión, con el código exacto de cada color. Cada color tiene una especie de matrícula única: un código corto que arranca con el signo numeral y sigue con seis caracteres, y que representa ese tono, ese exacto y ningún otro. Se llama código hexadecimal. Conseguirlo es fácil: cuando elegís un color en cualquier editor de diseño, al lado te aparece ese código listo para copiar; y si le pediste las combinaciones a la IA, sumale al pedido que te dé directamente el código de cada color.",

  "Volvamos a Sobremesa y veámoslo tomar color. Arranca por el principal, por la emoción: quiere que su lector sienta calidez, mesa larga, algo casero. Descarta los azules fríos y se va a los tonos tierra: un vino cálido, profundo, como el de una copa en un almuerzo largo de domingo. Ese es su principal. El acento, un dorado suave, como el de una lámpara vieja, que va a usar poco. Y de neutros, un marrón casi negro para los textos y un crema, como un mantel de papel, para los fondos.",
  "Vino, dorado, y los dos neutros cálidos. Con solo escucharlo ya ves su medio. Ese es el poder de elegir pocos colores, con intención, y decididos a repetirlos siempre.",

  "Fijemos lo de hoy en tres ideas. El color comunica antes que las palabras, y cada familia despierta emociones aprendidas. Una paleta que funciona es simple: un principal, un acento que usás poco, y tus neutros. Y la fuerza está en repetir siempre los mismos colores, porque la repetición es la que construye el reconocimiento.",
  "Armá tu paleta. Empezá por el principal: escribí qué emoción querés que sienta tu lector, buscá esa emoción en las familias, y elegí tu tono. Sumá un acento que contraste, y tus dos neutros. Si te trabás, pedile a la IA tres combinaciones a partir de tu nombre y tu emoción. Cuando la tengas, anotá los cuatro colores con su código exacto: es la primera página del manual de tu marca.",
  "Hoy le diste temperatura a tu marca. Entendiste que el color habla solo, que con muy pocos alcanza, y que la magia está en repetirlos siempre. Tu medio ya tiene nombre y ya tiene color: empieza a tener una cara.",
  "Falta una pieza para que esa cara termine de formarse: la letra con la que va a hablar, y un logo que no necesita ningún diseñador. Eso es lo que resolvemos en la próxima clase, con dos decisiones simples que están a tu alcance.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log("f43 OK ·", j.f43.length, "escenas");
