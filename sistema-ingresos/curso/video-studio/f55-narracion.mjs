import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 5.5 — Tu lector ideal: construí el avatar. Estructura: el retrato. Hero: la ficha de lector.
j.f55 = [
  "Escribir para una audiencia es escribir para una nube: una masa borrosa, sin cara, que no te devuelve nada. Y cuando escribís para una nube, te sale un texto de nube: general, tibio, para cualquiera.",
  "Ahora, escribir para una persona concreta es otra cosa completamente distinta. Cuando tenés a alguien en la cabeza, una persona con nombre, con un problema, con una manera de hablar, tu texto cambia solo: se vuelve directo, cálido, específico. Le hablás de vos a vos. Hoy vas a construir a esa persona, para no volver a escribirle nunca más a una nube.",

  "En las clases de este módulo definiste tu tema, le pasaste los filtros, validaste que hay demanda y encontraste tu ángulo. Y en tu ángulo apareció, una y otra vez, una pieza que dejamos pendiente: para quién.",
  "Hoy la traemos al centro. Porque tu nicho tiene dos mitades: un tema, y una gente. Ya trabajaste el tema a fondo. Es hora de ponerle cara, nombre y voz a la gente. A eso se lo llama construir tu lector ideal, o tu avatar.",

  "Tu avatar es una sola persona, inventada pero realista, que representa a tu lector ideal. Le ponés un nombre, una vida, un problema y una forma de hablar, y a partir de ahí, cada vez que escribís, le escribís a ella. Parece un juego, y funciona por una razón muy concreta. El cerebro no sabe escribirle bien a diez mil personas, pero sabe perfectamente cómo hablarle a una. Y al hablarle a esa una, las diez mil que se le parecen sienten que les hablás justo a ellas.",

  "Detengámonos en por qué esto funciona tan mejor que pensar en mi público. Si yo te digo escribí para mujeres de veinticinco a cuarenta años, de ciudad, con interés en la cocina, ¿qué hacés con eso? Nada. Es una etiqueta de folleto, no te dice cómo empezar un texto. En cambio, si te digo escribí para Ana, que tiene treinta y cuatro, trabaja todo el día, llega cansada y no sabe qué cocinar que sea rico y rápido, y le da culpa pedir delivery de nuevo, ya sabés exactamente qué decirle, y hasta con qué tono.",
  "Esa es la diferencia. Un grupo demográfico es información muerta: describe pero no inspira. Una persona concreta es información viva: te pone en situación. ¿Y si en tu cabeza aparece más de un lector, uno más entendido, otro que solo quiere el resumen rápido? Elegí uno: el que mejor represente el corazón de tu público, o el que más te importa servir. Vas a tener lectores secundarios, pero escribís pensando en uno solo. Si le escribís al principal, los que se le parecen se sienten incluidos; si tratás de contentar a todos a la vez, no le llegás a ninguno.",

  "Construir tu avatar es responder cuatro preguntas sobre esa persona. La primera: quién es. Su situación concreta. La edad aproximada, el momento de vida, el contexto en el que se cruza con tu tema. No un dato de censo: una foto de su día.",
  "La segunda: qué le duele. Cuál es su problema, su frustración, eso que lo desvela con tu tema. La gente no sigue medios por gusto: los sigue porque le resuelven algo o le calman una molestia. Si sabés qué le duele a tu lector, sabés de qué escribir. La tercera: qué desea. El otro lado del dolor. Adónde querría llegar. El dolor es lo que lo empuja; el deseo es lo que lo atrae.",
  "Y la cuarta, que casi nadie trabaja: cómo habla. Las palabras exactas que usa esa persona para nombrar su problema. Porque tu lector no dice busco soluciones de gastronomía accesible; dice algún lugar bueno y barato. Si le hablás con tus palabras de experto, no se siente identificado. Si le hablás con las suyas, siente que lo leés por dentro.",

  "Y lo bueno: no tenés que adivinar a esta persona. La mayor parte del trabajo ya lo hiciste, en la clase de validación. ¿Te acordás de las preguntas repetidas que encontraste en los grupos? Eso es, literalmente, el dolor de tu lector, escrito con sus propias palabras. Volvé a esos grupos, y esta vez leé para responder las cuatro piezas, y sobre todo, copiá las palabras exactas. ¿Cuánto material junto? Con ocho o diez comentarios que repitan el mismo dolor ya tenés una base sólida.",
  "Y tu equipo de inteligencia artificial te ayuda a ordenarlo. Le podés pasar un puñado de esas preguntas reales que juntaste y pedirle: a partir de esto, ayudame a describir a la persona típica que escribe estas cosas, su situación, qué le duele, qué desea. Te va a devolver un primer borrador de avatar. Pero ya sabés la regla: eso es un punto de partida, no la verdad. Lo confirmás contra lo que viste con tus ojos, porque el avatar tiene que reflejar gente real.",

  "Una vez que tenés tu avatar, se convierte en un filtro simple para cada cosa que hacés. Antes de publicar algo, lo pasás por dos preguntas. ¿Esto le sirve a mi avatar, le resuelve un dolor o le acerca un deseo? Y: ¿está dicho en su lenguaje, o en el mío de experto? Si las dos dan que sí, publicás con confianza. Tu avatar deja de ser una ficha guardada y pasa a ser la voz que te dice, en cada decisión, si vas por buen camino.",
  "Y te da coherencia sin esfuerzo: como siempre le escribís a la misma persona, tu medio suena siempre igual, aunque toques temas distintos. Una cosa más, para que arranques tranquilo: como el ángulo, tu avatar no es de piedra. Lo vas afinando con el tiempo, a medida que conocés mejor a tu gente real.",

  "Armemos el avatar de la lectora de nuestra periodista gastronómica, con sus cuatro piezas. Quién es: le pone Sofía, treinta y ocho años, vive en la ciudad, trabaja mucho, le gusta salir a comer pero cuida cada peso. Qué le duele: está cansada de gastar en lugares caros que la decepcionan. Qué desea: descubrir esos lugares de barrio, buenos y baratos, y sentirse una que sabe dónde comer bien. Y cómo habla: lo sacó tal cual de los grupos, dice cosas como un lugar rico y que no te fundás, algo distinto para el finde.",
  "Mirá cómo le cambió la voz. Ya no le escribe a los foodies de la ciudad. Le escribe a Sofía. Y cada vez que descubre un bodegón, se pregunta: ¿esto le sirve a Sofía? ¿se lo cuento como se lo contaría a ella? Y para que veas el contraste, un avatar flojo sería algo así: el que quiere comer bien. Sin edad, sin bolsillo, sin cansancio, sin una sola palabra suya: a ese no sabés cómo hablarle. Sofía, con sus cuatro piezas y sus frases propias, sí te dice cómo.",

  "Fijemos lo de hoy. Primera: ¿por qué le escribís a una persona y no a un grupo? Porque un grupo es información muerta y una persona te pone en situación de hablarle de verdad. Segunda: ¿cuáles son las cuatro piezas del avatar? Quién es, qué le duele, qué desea, y cómo habla. Tercera: ¿de dónde sacás todo eso sin inventarlo? De las preguntas y palabras reales que juntaste al validar tu nicho.",

  "Cerramos con la tarea que le pone cara a tu lector. Abrí una hoja y construí tu avatar: ponele un nombre, y respondé sus cuatro piezas. Quién es, en una foto de su día. Qué le duele, con tu tema. Qué desea. Y, esto no te lo saltees, tres o cuatro frases con las palabras exactas que usaría, copiadas de lo que viste en los grupos.",
  "Cuando termines, tenés adelante a la persona para la que vas a escribir de ahora en más. Colgala donde la veas al trabajar. Y si podés, hacé una prueba linda: escribile un mensaje corto a esa persona sobre tu tema, como si le hablaras a un amigo. Vas a notar, al toque, lo distinto que suena tu voz cuando tiene a alguien del otro lado.",

  "Hoy tu lector dejó de ser una nube y se volvió una persona con nombre, con un dolor, con un deseo y con una manera de hablar. Y con eso, tu voz encontró a quién dirigirse. La mayoría de los medios le escriben a nadie en particular, y por eso no le llegan a nadie en particular.",
  "Ya tenés tu tema, tu ángulo y tu lector. Tenés todas las piezas del corazón de tu proyecto. Lo que falta es juntarlas en una sola promesa, clara y potente, que le diga a tu lector qué gana al elegirte, y en un criterio firme de qué vas a cubrir y qué no. Eso es tu propuesta editorial y tu línea, y con eso cerramos el módulo. Nos vemos en la última.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f55.join(" ").split(/\s+/).length;
console.log("f55 escenas:", j.f55.length, "· palabras:", w, "· ~min:", (w / 143).toFixed(1));
