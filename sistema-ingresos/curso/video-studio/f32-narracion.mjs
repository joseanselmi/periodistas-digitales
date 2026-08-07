import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 3.2 — Verificar imágenes y videos en segundos. Estructura: forense/lupa. Hero: la lupa + búsqueda inversa.
j.f32 = [
  // — Gancho —
  "Una imagen convence más rápido que mil palabras. La vemos y le creemos casi sin pensar, porque durante toda la vida una foto fue prueba de que algo pasó. Ese reflejo, hoy, es justo el que conviene revisar.",
  "Porque ahora una imagen puede mentir. Se fabrican fotos que parecen reales, se reutilizan viejas como si fueran de hoy, se trucan videos. La buena noticia es que casi ninguna miente perfecto: dejan rastros. Y en esta clase vas a aprender a verlos, sin ser perito y en cuestión de segundos.",

  // — Puente —
  "En la clase pasada quedó claro que tu credibilidad es tu capital, y que hoy verificar te distingue. Empecemos por donde ese capital corre más peligro y donde más fácil es cuidarlo: las imágenes y los videos. Son lo que más circula, lo que más rápido se comparte y, por eso mismo, lo que más gente publica sin mirar dos veces.",

  // — Idea central —
  "La idea de hoy te va a sacar un peso de encima: para revisar una imagen no necesitás ser un experto en tecnología. Alcanza con dos cosas, y las dos están a tu alcance. Una es mirar con ojo entrenado un puñado de señales que los falsos suelen dejar. La otra es una jugada muy simple para averiguar de dónde salió realmente esa imagen. Con esas dos, resolvés la enorme mayoría de los casos.",

  // — Bloque 1 · las dos preguntas —
  "Antes de las señales, ordenemos qué estamos buscando, porque una imagen puede engañar de dos maneras distintas. La primera pregunta es: ¿esta imagen es auténtica, o fue fabricada o retocada? Acá entra lo generado por inteligencia artificial y lo trucado con edición.",
  "La segunda es más sutil y engaña muchísimo: ¿esta imagen es de cuándo y de dónde dice ser? Muchas veces la foto es totalmente real, pero es vieja, o es de otro lugar, y alguien la hace pasar por algo que está ocurriendo ahora, acá. Esa es la trampa más común de todas, la que más gente cree. Y ojo, porque acá la imagen puede ser cien por cien real, sin nada de inteligencia artificial, y engañar igual: con un pie de foto falso o recortada para esconder el contexto. Por eso esta segunda pregunta es tan importante como la primera.",

  // — Bloque 2 · las señales a ojo —
  "Arranquemos por descubrir si una imagen fue fabricada. Acá la lupa sos vos, mirando los detalles que las máquinas todavía suelen arruinar. Mirá las manos y los dedos: en las imágenes generadas suelen salir de más, torcidos o fundidos entre sí. Mirá cualquier texto dentro de la foto, un cartel, una placa de auto, una camiseta: los falsos lo escriben deforme, con letras que no son letras.",
  "Mirá los reflejos y las sombras: fijate si el reflejo de un espejo o de unos anteojos coincide con la escena, y si las sombras caen todas para el mismo lado. Mirá los fondos: en los falsos, lo que está lejos a veces se derrite, se repite o se mezcla. Y desconfiá de lo demasiado perfecto: piel sin un poro, simetrías raras.",
  "Ninguna de estas señales, sola, es una condena. Pero cuando ves dos o tres juntas, tenés que mirar dos veces. Y una advertencia honesta, para que no te confíes: estas fallas se corrigen rápido, cada vez las imágenes falsas tienen menos. Por eso las señales a ojo son el primer filtro, no el último. El que nunca falla es el que viene ahora.",

  // — Bloque 3 · la búsqueda de origen —
  "Esta se llama búsqueda inversa de imagen, y sirve para las dos preguntas a la vez. Funciona al revés de una búsqueda normal. En vez de escribir palabras para encontrar imágenes, subís la imagen y el buscador te dice en qué otros lugares de internet apareció esa foto.",
  "¿Cómo se hace, en concreto? En el buscador de imágenes de Google tocás el ícono de la cámara que está en la barra de búsqueda, subís la foto o pegás su dirección, y te muestra dónde está publicada. En el teléfono, esa misma función se llama Google Lens y está a un toque. Es gratis, no hay que instalar nada, y toma segundos.",
  "¿Y qué te muestra? Todo. Si la foto que alguien presenta como de hoy en realidad apareció hace tres años en otro país, la búsqueda inversa te lo va a mostrar. Si esa imagen ya fue desmentida por otros, es muy probable que también aparezca esa desmentida. Para leer el resultado, entrá a las páginas que parezcan de otra fecha y fijate cuándo se publicaron.",
  "¿Y si no aparece en ningún lado? Eso solo no prueba nada, porque puede ser una foto genuina y recién sacada; ahí volvés a las señales a ojo y la cruzás con otras fuentes que estén cubriendo lo mismo. Antes de compartir o publicar cualquier imagen fuerte, esta búsqueda de treinta segundos es lo mínimo que conviene hacer, y es de los hábitos que más problemas públicos te van a ahorrar.",

  // — Bloque 4 · la IA —
  "Tu equipo de inteligencia artificial también juega en esta cancha. Y sí: es la misma inteligencia artificial que venís usando desde el módulo pasado. Muchas de ellas hoy pueden mirar una imagen que les pegues y describirte lo que ven. Podés pedirle que te señale inconsistencias en las sombras, las manos o el fondo. Te sirve como una segunda mirada rápida.",
  "Ahora, dos reglas. La primera, la de siempre: la inteligencia artificial te acerca pistas, no veredictos. Puede equivocarse en las dos direcciones. Lo que ella señala lo confirmás vos, con las señales y con la búsqueda de origen. La segunda: existen programas que prometen detectar si una imagen fue hecha por inteligencia artificial, y dan un porcentaje. Tratalos con cuidado: fallan seguido. Usalos, si querés, como una pista más, nunca como la palabra final.",

  // — Bloque 5 · los videos —
  "Para los videos vale casi todo lo mismo, con un par de agregados. Las mismas señales, pero en movimiento: fijate si los bordes de una persona tiemblan, si la boca no termina de coincidir con lo que se escucha, si hay parpadeos raros. Y sobre todo, no te olvides de la segunda pregunta, que en video engaña igual: ¿este video es de cuándo y de dónde dice? Un video real de otro momento, presentado como de ahora, es de lo más común.",

  // — Ejemplo trabajado —
  "Pongámosle un caso. Te llega una foto impactante que dice mostrar algo que acaba de pasar en tu ciudad, y todos la están compartiendo. Primer paso, la mirás con la lupa: las manos están bien, pero un cartel del fondo tiene letras que no se leen, medio derretidas. Ya es una señal.",
  "Segundo paso, y definitivo: hacés la búsqueda inversa. En segundos aparece la misma foto, publicada hace dos años, en otra ciudad, por otra razón. Listo: no era de tu ciudad ni de ahora. En menos de un minuto, sin ser perito y sin ningún programa raro, evitaste publicar algo falso con tu nombre.",

  // — Recuerdo —
  "Repasemos rápido lo de hoy. Primera: ¿cuáles son las dos preguntas que le hacés a toda imagen? Si es auténtica o fabricada, y si es de cuándo y de dónde dice ser. Segunda: nombrá dos señales a ojo. Manos y dedos raros, textos deformes, reflejos que no cierran, fondos que se derriten. Tercera: ¿cuál es la jugada maestra? La búsqueda inversa: subís la foto y ves dónde apareció antes.",

  // — Tarea —
  "Ahora te toca hacerlo con las manos, y es fácil. Agarrá una imagen cualquiera, una foto de una noticia, y probá la búsqueda inversa: subila al buscador de imágenes y mirá qué te muestra, en qué otros lugares aparece. La primera vez es para perderle el miedo a la herramienta. Cuando lo hagas una vez, se te vuelve un reflejo para siempre.",

  // — Cierre y puente —
  "Hoy dejaste de mirar las imágenes como antes. Ya sabés que casi ningún falso es perfecto, que tenés un puñado de señales para leerlos a ojo, y que la búsqueda de origen es el chequeo de treinta segundos que resuelve la mayoría de los casos.",
  "Pero no todo lo que hay que verificar es una imagen. Muchas veces lo que circula es una frase: una declaración que supuestamente dijo alguien, un dato, un número que se repite hasta que parece cierto. Eso se chequea de otra manera, y es lo que vemos en la próxima clase. Seguimos por el camino.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f32.join(" ").split(/\s+/).length;
console.log("escenas:", j.f32.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
