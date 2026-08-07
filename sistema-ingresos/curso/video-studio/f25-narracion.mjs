import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 2.5 — Construí tu biblioteca de prompts. Construcción/sistema. CIERRE. VERSIÓN PROFUNDA (~9-10 min).
j.f25 = [
  // — Gancho —
  "Te va a pasar esto, si no lo pensás antes. Una tarde le pedís algo a la inteligencia artificial, armás un pedido que sale redondo, el resultado es justo lo que querías. Y una semana después necesitás lo mismo, y lo escribís de nuevo, de memoria, peor, porque no te acordás bien de cómo lo habías armado.",
  "Escribiste un buen pedido y lo dejaste ir. Hoy vamos a arreglar eso de una vez: vamos a guardar tus mejores pedidos para no volver a inventarlos nunca más.",

  // — Puente —
  "En las clases del módulo fuiste juntando un montón: entendiste cómo piensa la inteligencia artificial, aprendiste las cuatro piezas de un buen prompt, a conversar y corregir, y recorriste los roles de tu redacción. En el camino fuiste creando pedidos que funcionan. El problema es que están sueltos, en conversaciones viejas que se pierden.",

  // — Idea central —
  "La idea de la clase es esta: un prompt que te funcionó no es algo de una sola vez; es una plantilla. Lo guardás, y la próxima vez no lo escribís, lo usás.",
  "Y hacé la cuenta de lo que eso te ahorra. Un pedido bueno te lleva unos minutos de armar y afinar la primera vez. Guardado, la segunda vez te lleva segundos. Multiplicá eso por todas las veces que hacés tareas parecidas, y entendés por qué los que trabajan en serio con inteligencia artificial no arrancan nunca de cero: arrancan de su biblioteca.",

  // — Qué es la biblioteca —
  "¿Qué es, en concreto? Nada complicado. Tu biblioteca es un documento. Una nota, un archivo de texto, un documento donde vos escribas y guardes: eso alcanza y sobra. Empieza chiquita, con dos o tres prompts, y crece sola con el uso.",

  // — Cómo titular cada prompt —
  "Y hay un detalle que hace toda la diferencia para que la biblioteca te sirva de verdad: el título de cada prompt. No le pongas prompt uno, prompt dos. Ponele lo que hace, así lo encontrás en dos segundos. Resumir un documento en diez puntos. Diez títulos para una nota. Bajar el tono de un texto. El título es el lomo del libro en el estante: si está bien puesto, encontrás lo que buscás sin abrir nada.",

  // — Los huecos —
  "Ahora la parte que convierte un prompt guardado en una plantilla de verdad: los huecos. Un buen prompt tiene partes fijas y partes que cambian cada vez. Las que cambian, en lugar de escribirlas, las dejás como un hueco marcado, entre corchetes, para rellenar en el momento. La estructura queda fija; lo único que hacés cada vez es rellenar esos huecos con lo del día.",

  // — Convertir un prompt en plantilla, paso a paso —
  "Veámoslo con algo que ya tenés. Agarremos el prompt de la entrevista que armaste en la clase de la anatomía. Fijate cuáles partes son fijas y cuáles cambian. Fijas: actuá como editor que prepara entrevistas, proponé diez preguntas, en una lista. Y las que cambian según el día: a quién entrevistás, sobre qué tema, para qué lectores.",
  "Entonces esas tres, las que cambian, las convertís en huecos. Queda así: actuá como editor; voy a entrevistar a alguien, entre corchetes, sobre tal tema, entre corchetes; mis lectores son tal gente, entre corchetes; proponé diez preguntas en una lista. Y listo: de un pedido para una entrevista puntual, hiciste una plantilla que te sirve para cualquier entrevista. La próxima vez solo rellenás tres corchetes en lugar de escribir todo.",

  // — Los corchetes son tuyos —
  "Y una aclaración, para que lo uses tranquilo: los corchetes son una marca tuya, para acordarte de qué cambiar. No son un código que la inteligencia artificial necesite. Cuando armás el pedido del día, reemplazás el corchete por el dato real, y ella lee el texto ya completo, como cualquier otro.",

  // — Ordenar por roles —
  "Cuando la biblioteca crece, conviene tenerla ordenada, y hay una forma natural: por los roles que vimos en la clase pasada. Una sección para el documentalista, otra para el titulador, otra para el editor, y así. Cada rol, su estante. Cuando necesitás algo, vas directo al estante que corresponde. Tu biblioteca termina siendo el reflejo de tu redacción: un cajón por cada colaborador.",

  // — Fichas de arranque —
  "Para que no arranques con la hoja en blanco, pensá que tu biblioteca puede abrir con cuatro fichas básicas, una por los roles que más vas a usar. Una del documentalista, para resumir. Una del titulador, para pedir títulos. Una del editor, para aclarar un texto tuyo. Y una del sparring, para que te diga qué le falta a una nota. Con esas cuatro ya tenés media semana cubierta, y de ahí en más sumás las tuyas.",

  // — Cómo crece —
  "Una biblioteca viva se cuida con dos gestos muy simples. El primero: cuando un pedido sale bien, guardalo ahí mismo, en el momento, antes de que se pierda. El segundo: cuando mejorás uno que ya tenías, actualizá la versión guardada. Con esos dos gestos, en poco tiempo tenés algo que no tiene nadie más: un equipo de inteligencia artificial ajustado a tu manera de trabajar. Genérico al principio; cada vez más tuyo.",

  // — Crece con el curso —
  "Y algo lindo: esta biblioteca no se queda en este módulo. A medida que avancemos, cada tema nuevo te va a dar prompts nuevos para guardar. Prompts para tu marca, para tu contenido, para tus anunciantes. Cuando termines el curso, no vas a tener solo lo que aprendiste: vas a tener una caja de herramientas armada, con tu letra, lista para trabajar.",

  // — Recuerdo —
  "Fijemos lo de hoy. Primera: un prompt que te funcionó es una plantilla, que guardás con un título claro y reusás. Segunda: los huecos son las partes que cambian cada vez, marcadas entre corchetes para rellenar; hacen que una misma plantilla sirva para muchos casos. Tercera: ordenás la biblioteca por roles, un estante para cada colaborador de tu redacción.",

  // — Tarea —
  "Cerramos el módulo con la tarea que lo deja todo en marcha. Abrí un documento nuevo y ponele mi biblioteca de prompts. Es el primer ladrillo. Adentro, guardá al menos un prompt: puede ser el de la entrevista que convertimos en plantilla recién. Ponele un título que diga para qué sirve, y dejale sus huecos entre corchetes. Con eso ya tenés tu biblioteca abierta y funcionando.",

  // — Cierre del módulo —
  "Y con esto cerramos tu equipo de inteligencia artificial. Recorrimos todo el camino: entendiste qué es y cómo predice, aprendiste a pedirle con las cuatro piezas, a conversar y afinar, a repartirle roles, y hoy a guardar todo eso en una biblioteca que es tuya y crece con vos. Saliste de este módulo sabiendo dirigir un equipo de inteligencia artificial, no solo usarlo.",

  // — Puente a M3 —
  "Y justo lo que viene es la pieza que le pone el sello de periodista a todo esto. Porque una cosa dijimos varias veces: la inteligencia artificial puede afirmar cosas falsas con total seguridad. En el próximo módulo aprendemos a verificar imágenes, datos y declaraciones, y a convertir esa credibilidad en la base de tu medio. Nos encontramos en la próxima etapa.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f25.join(" ").split(/\s+/).length;
console.log("escenas:", j.f25.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
