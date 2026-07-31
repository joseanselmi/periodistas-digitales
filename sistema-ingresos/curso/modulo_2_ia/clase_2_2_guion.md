# Guion — Clase 2.2 · La anatomía de un buen prompt

> **Módulo 2 · Tu equipo de IA.** Clase de CONTENIDO/TEORÍA. **~13 min con Chris.**
> Estructura: **DISECCIÓN** (agarramos un prompt pobre, lo abrimos en la mesa, y lo reconstruimos
> pieza por pieza hasta armar uno bueno). Distinta a la desmitificación de 2.1 y a todo M1.
> Español **neutro** · SOLO positivo · dato = nuestro · números **ilustrativos**.
> **Roadmap:** viene de 2.1 (la IA predice a partir de lo que le das). No tiene nicho/marca/periódico.
> Herramientas de consumo (Claude/ChatGPT/Gemini). Ejemplo periodístico universal: preparar una entrevista.
> **Idea central:** *un buen prompt no es "pedir con onda": es darle las cuatro piezas que la IA
> necesita para predecir lo que vos tenías en la cabeza — rol, contexto, tarea y formato.*
> **Hero visual:** el prompt desarmado en 4 piezas que se ensamblan (diagrama tipo "despiece").
> **No repite:** abre el motivo cyan del módulo con un hero de despiece. **Puente →** 2.3 (la conversación).

---

## 1 · Gancho

Dos personas le piden lo mismo a la misma inteligencia artificial. Una recibe algo tibio, olvidable, que termina reescribiendo a mano. La otra recibe algo que casi puede usar tal cual. No cambió la herramienta. Cambió cómo pidieron.

Pedir bien no es un talento con el que se nace: es una estructura. Tiene piezas, y las piezas se aprenden. Cuando termine esta clase vas a mirar cualquier pedido que le hagas a la IA y vas a saber qué le falta y qué le sobra.

## 2 · Puente con lo anterior

En la clase pasada llegamos a una conclusión que hoy es el punto de partida: la IA predice a partir de lo que le das, así que lo que le das decide lo que te devuelve. Le das poco, predice genérico. Le das bien, predice afinado.

Perfecto. Pero eso deja una pregunta abierta, y es la más práctica de todas: ¿qué es, exactamente, "darle bien"? ¿Qué tiene adentro un buen pedido? Eso es lo que vamos a abrir hoy.

## 3 · La idea central

A ese pedido que le hacés a la IA se lo llama *prompt*. Es simplemente la instrucción que escribís. Vas a escuchar esa palabra todo el tiempo, así que quedátela: prompt es lo que le pedís.

Y la idea de toda la clase es esta: **un buen prompt no depende de tener labia, depende de tener las piezas.** Son cuatro, siempre las mismas, y cuando están las cuatro, la IA tiene con qué apuntar. Vamos a descubrirlas de la mejor manera que hay: agarrando un prompt malo y abriéndolo para ver qué le falta.

## 4 · El prompt pobre, sobre la mesa

Pongamos una situación bien de tu oficio: tenés que hacer una entrevista y querés que la IA te ayude a preparar las preguntas. Este es el pedido que hace casi todo el mundo al principio, y lo pongo tal cual:

*"Dame preguntas para una entrevista."*

Parece razonable. Pero poné la cabeza de la IA: le llegó eso y nada más. No sabe a quién entrevistás, sobre qué, para qué medio, para qué lectores, ni cuántas preguntas querés. Entonces hace lo único que puede: predice el promedio. Te devuelve una lista de preguntas genéricas —"¿cómo empezó?", "¿cuáles son sus planes?"— que sirven para cualquiera y para nadie. Las mismas que le daría a cualquier otro que pidió lo mismo.

La IA hizo justo lo que le tocaba: sin piezas, predijo el promedio. Vamos a ponérselas una por una, y vas a ver cómo el mismo pedido se transforma.

## 5 · Pieza 1 — El ROL

La primera pieza es decirle **quién querés que sea** mientras te responde.

La IA puede responder como un editor exigente, como un entrevistador con calle, como un divulgador que explica fácil, como un corrector. Todos esos "personajes" están dentro de lo que aprendió. Pero si no le decís cuál querés, elige un tono neutro, de nadie en particular. Asignarle un rol es lo primero que enfoca la predicción. (No hace falta que memorices una lista de roles: pedí el oficio que se te ocurra para lo que estás haciendo; a los roles más útiles para un periodista los recorremos en un par de clases.)

Entonces empecemos a reconstruir. En lugar de arrancar en frío, arrancamos así:

*"Actuá como un editor con experiencia que me ayuda a preparar entrevistas periodísticas."*

Todavía no le pedimos nada. Pero ya le dimos una voz. Sola, esta pieza cambia el color de todo lo que venga después.

## 6 · Pieza 2 — El CONTEXTO

La segunda pieza es **la situación**: todos los datos que la IA no puede adivinar y que vos sí tenés.

A quién entrevistás. Sobre qué exactamente. Qué querés lograr con la nota. Para quién es. Y cualquier límite que importe: qué evitar, qué no puede faltar. Esta es la pieza que más gente se saltea. Cada dato que sumás le recorta a la IA el abanico de cosas posibles y la empuja hacia la tuya.

Sigamos armando. Le agregamos contexto al rol:

*"Voy a entrevistar a la directora de una escuela del barrio, porque este año quedaron muchos chicos sin vacante. Mis lectores son familias de la zona que están tratando de anotar a sus hijos. Quiero preguntas que saquen respuestas concretas —números, plazos, responsables— y no declaraciones vagas."*

Fijate lo que pasó. Ya no es "una entrevista" en abstracto. Es una persona concreta, un tema con borde, un lector con nombre y una intención clara. La predicción ya tiene a dónde ir.

## 7 · Pieza 3 — La TAREA

La tercera pieza es **qué querés que haga**, dicho con un verbo claro.

Acá mucha gente se enreda, porque deja la tarea implícita, como si la IA tuviera que adivinarla. No la dejes implícita. ¿Querés que escriba, que resuma, que compare, que corrija, que haga una lista, que proponga? Cada uno de esos verbos lleva a un resultado distinto. Elegí el que necesitás y decilo directo.

Sumamos la tarea a lo que ya teníamos:

*"Proponé diez preguntas para esa entrevista."*

Corto y sin vueltas. Un verbo —proponé— y un objeto claro —diez preguntas—. La IA ya sabe qué producto tiene que entregarte.

## 8 · Pieza 4 — El FORMATO

Y la cuarta pieza es **cómo querés recibir la respuesta**. La forma.

¿La querés en una lista o en párrafos? ¿Ordenada de algún modo? ¿Con algún detalle en cada punto? Esta pieza parece menor y no lo es: es la diferencia entre recibir un bloque que después tenés que ordenar vos, y recibir algo listo para usar.

Cerramos el prompt con el formato:

*"Devolvémelas en una lista, ordenadas de la más general a la más puntual, cada una en un renglón, sin explicaciones."*

Y con eso, las cuatro piezas están puestas.

## 9 · El prompt reconstruido, entero

Juntemos las piezas y leamos lo que quedó armado, de corrido:

*"Actuá como un editor con experiencia que me ayuda a preparar entrevistas. Voy a entrevistar a la directora de una escuela del barrio porque este año quedaron muchos chicos sin vacante; mis lectores son familias de la zona que quieren anotar a sus hijos. Quiero preguntas que saquen respuestas concretas —números, plazos, responsables—, no declaraciones vagas. Proponé diez preguntas, en una lista ordenada de la más general a la más puntual, cada una en un renglón."*

Comparalo con el del arranque: *"dame preguntas para una entrevista"*. Es el mismo pedido de fondo. Pero uno le da a la IA cuatro coordenadas para apuntar, y el otro la deja adivinando. El primero te devuelve preguntas de manual; el segundo, un cuestionario que casi llevás a la entrevista tal cual.

Todo lo que hiciste fue poner, en orden, cuatro piezas que ya tenías en la cabeza: rol, contexto, tarea, formato. Y esto vale para cualquier encargo, no solo para una entrevista: cambiás el rol y el contexto, y las mismas cuatro piezas te arman un titular, un resumen o una nota.

## 10 · Un modo simple de acordarte

No hace falta que memorices nada rebuscado. Cuando vayas a escribir un pedido, hacete cuatro preguntas rápidas, en este orden:

¿Quién quiero que sea? Ese es el rol.
¿Qué necesita saber de mi situación? Ese es el contexto.
¿Qué quiero que haga, con qué verbo? Esa es la tarea.
¿Cómo quiero recibirlo? Ese es el formato.

Cuatro preguntas. Si las cuatro tienen respuesta dentro de tu pedido, tenés un buen prompt. Y no importa si lo escribís todo de corrido, en un párrafo, o en renglones separados: a la IA le llega igual. Lo que cuenta es que las cuatro piezas estén. No siempre vas a necesitarlas con el mismo detalle —para algo simple, un rol livianito alcanza— pero tenerlas presentes te evita el pedido pobre casi siempre.

## 11 · Práctica de recuerdo

Quedate con estas cuatro, que son toda la clase. ¿Cuáles son las piezas de un buen prompt?

Rol: quién querés que sea la IA. Contexto: los datos de tu situación que ella no puede adivinar. Tarea: qué querés que haga, con un verbo claro. Formato: cómo querés recibir la respuesta.

Si te salieron las cuatro, ya tenés en la mano la estructura que hace toda la diferencia.

## 12 · Tarea aplicada

Ahora te toca a vos, y es cortito. Tomá aquella lista de tres tareas que armaste en la clase pasada —esas cosas de tu semana que le delegarías a un asistente—. Elegí una sola.

Y escribile las cuatro piezas por separado, en cuatro renglones: rol, contexto, tarea, formato. Es un ejercicio de papel: todavía no hace falta que tengas cuenta abierta —eso llega en el tutorial que cierra el módulo, donde lo probás en vivo—. Por ahora, solo armar las piezas. Vas a sentir enseguida cuáles te salen fáciles y cuál te cuesta, y esa que te cuesta es justo la que más te estaba faltando hasta ahora.

## 13 · Cierre y puente

Hoy dejamos de depender de la suerte al pedirle a la IA. Un buen prompt no es cuestión de inspiración: es un pedido con sus cuatro piezas en su lugar, y ahora sabés cuáles son y cómo ponerlas.

Pero hay algo que todavía no aprovechamos, y que es donde la IA se vuelve de verdad potente. Hasta acá pensamos el prompt como un pedido único, de una sola vuelta. En la próxima clase vamos a ver qué pasa cuando dejás de tratarla como un buscador de una respuesta y empezás a tratarla como lo que puede ser: alguien con quien conversás, corregís y vas afinando hasta llegar a lo que buscabas. Vamos por ahí.
