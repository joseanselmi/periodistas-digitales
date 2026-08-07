import fs from "fs";
const p = "./tts-scripts.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

// 2.2 — La anatomía de un buen prompt. Estructura: disección. Hero: las 4 piezas + un 2º ejemplo (resumen).
// VERSIÓN PROFUNDA (~11 min): agrega rol flojo vs afinado, cuánto contexto, tarea implícita, formato,
// un segundo ejemplo completo (resumen) que muestra que el método transfiere, y el atajo de prioridad.
j.f22 = [
  // — Gancho —
  "Dos personas le piden lo mismo a la misma inteligencia artificial. Una recibe algo tibio, olvidable, que termina reescribiendo a mano. La otra recibe algo que casi puede usar tal cual. No cambió la herramienta. Cambió cómo pidieron.",
  "Pedir bien no es un talento con el que se nace: es una estructura. Tiene piezas, y las piezas se aprenden. Cuando termine esta clase vas a mirar cualquier pedido que le hagas a la inteligencia artificial y vas a saber qué le falta y qué le sobra.",

  // — Puente —
  "En la clase pasada llegamos a una conclusión que hoy es el punto de partida: la inteligencia artificial predice a partir de lo que le das, así que lo que le das decide lo que te devuelve. Le das poco, predice genérico. Le das bien, predice afinado.",
  "Pero eso deja una pregunta abierta, y es la más práctica de todas: ¿qué es, exactamente, darle bien? ¿Qué tiene adentro un buen pedido? Eso es lo que vamos a abrir hoy.",

  // — Idea central —
  "A ese pedido que le hacés a la inteligencia artificial se lo llama prompt. Es simplemente la instrucción que escribís. Vas a escuchar esa palabra todo el tiempo, así que quedátela: prompt es lo que le pedís.",
  "Y la idea de toda la clase es esta: un buen prompt no depende de tener labia, depende de tener las piezas. Son cuatro, siempre las mismas, y cuando están las cuatro, la inteligencia artificial tiene con qué apuntar. Vamos a descubrirlas agarrando un prompt malo y abriéndolo para ver qué le falta.",

  // — El prompt pobre —
  "Pongamos una situación bien de tu oficio: tenés que hacer una entrevista y querés que la inteligencia artificial te ayude a preparar las preguntas. Este es el pedido que hace casi todo el mundo al principio, y lo pongo tal cual: dame preguntas para una entrevista.",
  "Poné la cabeza de la inteligencia artificial: le llegó eso y nada más. No sabe a quién entrevistás, sobre qué, para qué medio, para qué lectores, ni cuántas preguntas querés. Hace lo único que puede: predice el promedio. Te devuelve preguntas genéricas, del tipo cómo empezó y cuáles son sus planes, las mismas que le daría a cualquier otro. Hizo justo lo que le tocaba: sin piezas, predijo el promedio.",

  // — Pieza 1 · Rol —
  "Vamos a ponerle las piezas una por una. La primera es decirle quién querés que sea mientras te responde. La inteligencia artificial puede responder como un editor exigente, como un entrevistador con calle, como un divulgador que explica fácil. Todos esos personajes están dentro de lo que aprendió. Si no le decís cuál querés, elige un tono de nadie en particular. Así que arrancamos así: actuá como un editor con experiencia que me ayuda a preparar entrevistas.",
  "Y acá una cosa que hace la diferencia: el rol también tiene flojo y afinado. Si le decís actuá como editor, a secas, ya ayuda. Pero si le decís actuá como editor de un medio local que le escribe a los vecinos del barrio, apuntás muchísimo más fino. Cuanto más preciso el personaje, más precisa la voz. No inventes un rol rebuscado: elegí el oficio real que haría esa tarea, y dale un apellido.",

  // — Pieza 2 · Contexto —
  "La segunda pieza es la situación: todos los datos que la inteligencia artificial no puede adivinar y que vos sí tenés. A quién entrevistás, sobre qué, para quién es la nota, qué querés lograr. Le agregamos: voy a entrevistar a la directora de una escuela del barrio, porque este año quedaron muchos chicos sin vacante, y mis lectores son familias de la zona que quieren anotar a sus hijos. Ya no es una entrevista en abstracto: es una persona concreta, un tema con borde y un lector con nombre.",
  "Y quizás te estés preguntando: ¿cuánto contexto es suficiente? ¿Le pongo todo? Hay una regla simple que te saca la duda. Un dato vale la pena si cambiaría la respuesta. Si al agregarlo la inteligencia artificial te contestaría distinto, ponelo. Si da lo mismo con o sin ese dato, no hace falta. No se trata de escribir mucho: se trata de escribir lo que mueve la aguja. Con dos o tres datos que de verdad importan, alcanza.",

  // — Pieza 3 · Tarea —
  "La tercera pieza es qué querés que haga, dicho con un verbo claro. Y acá mucha gente se enreda, porque deja la tarea implícita, como si la inteligencia artificial tuviera que adivinarla. No la dejes implícita. ¿Querés que escriba, que resuma, que compare, que corrija, que proponga? Cada uno de esos verbos lleva a un resultado distinto.",
  "Le sumamos la tarea a lo que ya teníamos: proponé diez preguntas para esa entrevista. Un verbo, proponé; un objeto claro, diez preguntas. La inteligencia artificial ya sabe qué producto tiene que entregarte. Fijate el detalle de pedir diez: un número concreto trabaja mejor que un dame varias, que la deja adivinando cuántas.",

  // — Pieza 4 · Formato —
  "Y la cuarta pieza es cómo querés recibir la respuesta. La forma. ¿En una lista o en párrafos? ¿Ordenada de algún modo? ¿Con algún detalle en cada punto? Esta pieza parece menor y no lo es: es la diferencia entre recibir un bloque de texto que después tenés que ordenar vos, y recibir algo listo para usar.",
  "Cerramos el prompt con el formato: devolvémelas en una lista, ordenadas de la más general a la más puntual, cada una en un renglón, sin explicaciones. Y con eso, las cuatro piezas están puestas. Con el formato podés pedir lo que se te ocurra: una lista, una tabla, tres opciones, un texto de tal largo. Vos ponés la forma; ella la respeta.",

  // — Reconstruido —
  "Juntemos las piezas y leamos lo que quedó armado, de corrido: actuá como editor con experiencia que me ayuda a preparar entrevistas; voy a entrevistar a la directora de una escuela del barrio porque quedaron chicos sin vacante, y mis lectores son familias de la zona; proponé diez preguntas, en una lista ordenada de la más general a la más puntual.",
  "Comparalo con el del arranque: dame preguntas para una entrevista. Es el mismo pedido de fondo. Pero uno le da cuatro coordenadas para apuntar, y el otro la deja adivinando. El primero te devuelve preguntas de manual; el segundo, un cuestionario que casi llevás a la entrevista tal cual.",
  "Y fijate lo mejor: todo lo que hiciste fue poner, en orden, cuatro piezas que ya tenías en la cabeza. Rol, contexto, tarea, formato. No hubo ningún truco.",

  // — Segundo ejemplo: el método transfiere —
  "Ahora te muestro que esto no sirve solo para entrevistas: las mismas cuatro piezas te arman cualquier cosa. Cambiemos de tarea por completo. Ahora tenés un informe largo, denso, del presupuesto del municipio, y necesitás sacar una nota clara para tus lectores. El pedido pobre sería: resumime este informe. Vago. Vamos con las piezas.",
  "Mirá cómo caen las cuatro, casi solas. Rol: actuá como un divulgador que explica temas difíciles en palabras simples. Contexto: es un informe del presupuesto municipal, y mis lectores son vecinos sin formación técnica que quieren entender en qué se gasta la plata. Tarea: resumí los cinco puntos más importantes. Formato: en viñetas, una idea por línea, sin jerga. Otra tarea distinta, la misma estructura. Una vez que la tenés, la usás para todo.",

  // — Prioridad / atajo —
  "Y si estás apurado y no vas a poner las cuatro con todo el detalle, quedate con esto: las dos que no podés saltear nunca son el contexto y la tarea. Son el esqueleto: sin ellas, la inteligencia artificial no sabe de qué hablás ni qué querés. El rol y el formato son los que afinan, y podés sumarlos cuando el resultado importa más. Pero contexto y tarea van siempre.",

  // — Modo simple de acordarte —
  "No hace falta que memorices nada rebuscado. Cuando vayas a escribir un pedido, hacete cuatro preguntas rápidas, en este orden. ¿Quién quiero que sea? Ese es el rol. ¿Qué necesita saber de mi situación? Ese es el contexto. ¿Qué quiero que haga, con qué verbo? Esa es la tarea. ¿Cómo quiero recibirlo? Ese es el formato.",
  "Cuatro preguntas. Si las cuatro tienen respuesta dentro de tu pedido, tenés un buen prompt. Y no importa si lo escribís todo de corrido, en un párrafo, o en renglones separados: a la inteligencia artificial le llega igual. Lo que cuenta es que las cuatro piezas estén.",

  // — Recuerdo —
  "Quedate con estas cuatro, que son toda la clase. Rol: quién querés que sea, con un apellido que apunte. Contexto: los datos que cambiarían la respuesta. Tarea: qué querés que haga, con un verbo claro. Formato: cómo querés recibirlo. Si te salieron las cuatro, ya tenés en la mano la estructura que hace toda la diferencia.",

  // — Tarea —
  "Ahora te toca a vos, y es cortito. Tomá aquella lista de tres tareas que armaste en la clase pasada. Elegí una sola. Y escribile las cuatro piezas por separado, en cuatro renglones: rol, contexto, tarea, formato. Es un ejercicio de papel: la cuenta la abrís en el tutorial que cierra el módulo. Vas a sentir enseguida cuál pieza te cuesta, y esa es justo la que más te estaba faltando.",

  // — Cierre y puente —
  "Hoy dejamos de depender de la suerte al pedirle a la inteligencia artificial. Un buen prompt no es cuestión de inspiración: es un pedido con sus cuatro piezas en su lugar, y ahora sabés cuáles son y cómo ponerlas.",
  "Pero hasta acá pensamos el prompt como un pedido único, de una sola vuelta. En la próxima clase vamos a ver qué pasa cuando dejás de tratar a la inteligencia artificial como un buscador de una respuesta y empezás a tratarla como alguien con quien conversás, corregís y vas afinando hasta llegar a lo que buscabas. Vamos por ahí.",
];

fs.writeFileSync(p, JSON.stringify(j, null, 2));
const w = j.f22.join(" ").split(/\s+/).length;
console.log("escenas:", j.f22.length, "· palabras:", w, "· ~min con Chris (143 ppm):", (w / 143).toFixed(1));
