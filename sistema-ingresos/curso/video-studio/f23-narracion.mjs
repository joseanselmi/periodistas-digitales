import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 2.3 — Hablarle a la IA como a tu redactor. Diálogo iterativo. VERSIÓN PROFUNDA (~11 min).
j.f23 = [
  // — Gancho —
  "La mayoría de la gente usa la inteligencia artificial como usa un buscador: escribe algo, mira lo que sale, y si no le gusta, se decepciona y cierra. Una vuelta y afuera.",
  "Y ahí se pierde casi todo lo bueno. Porque la inteligencia artificial no da su mejor respuesta en el primer intento, igual que un redactor no entrega su mejor nota en el primer borrador. Lo bueno aparece cuando seguís la conversación. Hoy vas a ver cómo.",

  // — Puente —
  "Venimos de armar un buen prompt con sus cuatro piezas: rol, contexto, tarea, formato. Y eso te consigue una primera respuesta mucho mejor que la del promedio.",
  "Pero fijate que dije primera respuesta. Hasta acá tratamos el prompt como un disparo único: pedís una vez y tomás lo que venga. Hoy rompemos esa idea. El prompt bien armado abre la conversación; no la cierra.",

  // — Idea central —
  "Acá va la idea de toda la clase: a la inteligencia artificial no le hablás como a un buscador, le hablás como a un redactor de tu equipo.",
  "Pensá qué hacés con un redactor. No esperás que la primera versión esté perfecta. La leés, le decís qué está bien y qué no, le pedís que ajuste una parte, que pruebe otro tono, que te dé variantes. Y entre los dos, en unas cuantas vueltas, llegan a algo bueno. Con la inteligencia artificial es igual.",

  // — Por qué el primer intento es un 70% —
  "Y quiero que veas ese primer intento con otros ojos, porque acá está la trampa. Cuando la inteligencia artificial te devuelve algo que está a mitad de camino, no falló: te entregó un borrador. Un buen borrador, con la forma ya puesta, sobre el que es facilísimo trabajar. Pensalo como el primer pantallazo de un redactor: nadie espera que esté perfecto, se espera que sea un punto de partida. Si lo mirás así, dejás de frustrarte y empezás a construir.",

  // — El error —
  "Porque el error más común es este. La inteligencia artificial te devuelve algo que está a un setenta por ciento de lo que buscabas, con partes que no cierran, y la reacción automática es borrar todo y empezar de nuevo con otro prompt desde cero.",
  "Es la jugada que más tiempo hace perder. Estás tirando a la basura un setenta por ciento que ya servía, para volver a empezar y quedar, con suerte, en otro setenta por ciento distinto. La jugada buena es la contraria: no empieces de nuevo, corregí sobre lo que ya hay. Ese setenta por ciento es tu punto de partida.",

  // — Cuándo corregir y cuándo empezar de nuevo —
  "Ahora, hay una excepción, y conviene tenerla clara para no confundirte. Corregís cuando la dirección está bien y solo hay que afinar: el tono, el largo, un dato. Pero si la inteligencia artificial entendió cualquier cosa, agarró para un tema equivocado o le habló al público que no era, ahí sí conviene reiniciar. Y reiniciás una vez, con mejor contexto, no parchándola veinte veces. La regla es simple: si vas en la buena dirección, corregís; si te fuiste de camino, volvés a arrancar con mejores piezas.",

  // — Las vueltas que sirven —
  "Veamos las vueltas que afinan. Son instrucciones cortas, de una línea, las mismas devoluciones que le darías a cualquiera de tu equipo. La primera: pedile que ajuste una parte, no todo. El segundo párrafo quedó largo, cortámelo a la mitad. La inteligencia artificial toca solo eso y te deja el resto intacto.",
  "La segunda: pedile variantes. Ese título no me convence, dame cinco más, algunos más directos y otros más curiosos. En segundos tenés opciones para elegir, en vez de pelearte con una sola.",
  "La tercera: corregile el tono. Está muy solemne, bajálo, que suene más cercano, como si le hablaras a un vecino. El tono se ajusta con una frase, y podés pedírselo tantas veces como haga falta hasta dar con el que va.",

  // — Mostrale un ejemplo (few-shot en criollo) —
  "Y esta cuarta es de las más potentes, y casi nadie la usa: mostrale un ejemplo de lo que te gusta. En vez de explicarle con palabras cómo querés algo, le pegás una muestra. Mirá cómo quedó este primer título, así de concreto y corto: seguí esa línea para los otros. Un ejemplo bueno le dice más que tres párrafos de instrucciones. Si tenés una nota vieja tuya que te salió redonda, pegásela y decile: escribí en este estilo. Y de golpe suena a vos.",

  // — Decir qué no te gustó —
  "Y la última: cuando algo no te cierra, decile qué y por qué. No le pusiste el dato principal. Usaste palabras técnicas que mis lectores no entienden. Al decirle el motivo, no solo lo corrige en esa vuelta: dentro de esa conversación no vuelve a caer en lo mismo.",

  // — Que te pregunte a vos —
  "Ahora una jugada que le da vuelta la cosa. En lugar de darle todo servido, podés pedirle que, antes de escribir, te haga las preguntas que necesite. Se lo decís así: antes de escribir, hacéme las preguntas que te falten para que esto salga bien.",
  "Y ahí, en vez de largar un texto genérico, te devuelve tres o cuatro preguntas: para quién es, qué extensión querés, qué evitar. Vos las contestás, y recién entonces escribe. El resultado arranca mucho más cerca, porque le llenaste los huecos antes de que tuviera que rellenarlos adivinando. Podés contestarle todo junto o de a una.",

  // — Ejemplo trabajado 1: el corte de agua —
  "Sigamos una conversación entera, corta. Arrancás con un buen prompt: le pedís, como editor de un medio local, un texto breve para redes que avise que mañana cortan el agua en varios barrios, en tono de servicio. Te devuelve algo correcto, pero frío y más largo de lo que va para redes. Setenta por ciento.",
  "No borres nada. Primera corrección: acortalo a tres líneas y que la primera enganche. Te lo devuelve más filoso. Segunda: sumale a qué hora vuelve el agua, es el dato que más les importa. Lo agrega. Última vuelta: dame dos variantes de la primera línea. Elegís la mejor.",
  "Cuatro mensajes. De un texto tibio y largo pasaste a uno breve, útil y con opciones, sin haber reescrito nada a mano. Eso es hablarle como a un redactor.",

  // — Ejemplo trabajado 2: el titular —
  "Y para que veas que sirve para cualquier cosa, otra conversación, más cortita, sobre un titular. Le pedís un título para una nota sobre el nuevo horario de la biblioteca municipal. Te devuelve algo correcto pero acartonado: la biblioteca municipal actualiza su horario de atención. Setenta por ciento otra vez.",
  "Una sola vuelta: más humano, que invite, pensando en un vecino que quiere ir a estudiar. Y te devuelve algo como: la biblioteca ahora abre hasta más tarde, mirá hasta cuándo. Misma nota, un mensaje de diferencia, y pasó de un cartel a algo que un lector querría tocar.",

  // — Cuándo parar —
  "Una última cosa, para no quedarte dando vueltas para siempre: ¿cuándo parás? Parás cuando la próxima corrección ya no mejora lo suficiente como para justificarla. Si estás moviendo comas y el texto ya cumple, listo, es tuyo. Iterar es para acercarte a lo que buscabas, no para perseguir una perfección que no llega nunca.",

  // — Aclaración sobre la memoria —
  "Un detalle, para que la conversación fluya. Dentro de una misma charla, la inteligencia artificial se acuerda de lo que se dijeron antes. Por eso podés decirle el segundo párrafo o ese título y sabe a qué te referís. Si mañana volvés a esa misma charla, ahí sigue todo; pero si abrís una conversación nueva, arranca limpia. Así que mientras trabajás en algo, seguí en el mismo hilo.",

  // — Recuerdo —
  "Repasemos lo de hoy de memoria. Primera: el primer intento es un borrador al setenta por ciento; corregís sobre eso, no empezás de cero, salvo que se haya ido de tema. Segunda: las vueltas que afinan son ajustar una parte, pedir variantes, corregir el tono, mostrarle un ejemplo, y decirle qué no te gustó. Tercera: para que arranque más cerca, pedile que te haga preguntas antes de escribir.",

  // — Tarea —
  "Te dejo una sola cosa para hacer, y es de papel. Pensá un pedido cualquiera de tu trabajo y escribí, además del pedido, las tres correcciones que probablemente le harías después. Por ejemplo: lo pediría, y después le diría que lo acorte, que le baje el tono, y que me dé variantes del título. Con eso ya estás pensando en vueltas, no en disparos únicos.",

  // — Cierre y puente —
  "Dejaste de pedirle una respuesta a la inteligencia artificial y empezaste a trabajar con ella. Un buen prompt abre la charla, y las vueltas siguientes la llevan a donde vos querías.",
  "Hasta acá le hablamos como a un redactor, en singular. Pero la inteligencia artificial puede ser mucho más: un editor, un corrector, un verificador, un traductor de formatos. En la próxima clase vamos a repartir esos papeles y armar, con una sola herramienta, algo parecido a una redacción entera a tu servicio. Nos vemos ahí.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f23.join(" ").split(/\s+/).length;
console.log("escenas:", j.f23.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
