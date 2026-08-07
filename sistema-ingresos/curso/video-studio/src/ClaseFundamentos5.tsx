import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { DosRecipientes, Momento } from "./lib/recipientes";
import D from "./dur/f15.json";
import C from "./dur/f15.caps.json";

// 1.5 — De seguidor a suscriptor. ESTRUCTURA: DOS CAMINOS (seis momentos comparados en paralelo).
// HERO PROPIO: LOS DOS RECIPIENTES — el prestado tiene fugas, el propio acumula.
// Y el componente Momento, que enfrenta camino A / camino B en cada tramo.

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA SOLA PREGUNTA" lines={[{ t: "¿Podrías avisarle" }, { t: "a toda tu audiencia?", a: true }]} sub="Si mañana quisieras contarle algo importante. Respondétela de verdad." variant="bare" size={116} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DETRÁS HAY DOS ESCENARIOS" lines={[{ t: "Los vamos a recorrer" }, { t: "en paralelo.", a: true }]} sub="Uno al lado del otro, para ver exactamente en qué se diferencian." variant="bare" size={118} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <DosRecipientes dur={d} kicker="LOS DOS CAMINOS" title="Mil seguidores o cien suscriptores" a={{ label: "CAMINO A", sub: "Mil seguidores en una red social.", llena: 0.28, valor: "1.000" }} b={{ label: "CAMINO B", sub: "Cien personas en tu lista de correo.", llena: 0.62, valor: "100" }} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="DIEZ VECES MENOS GENTE" a="Y al final de la clase vas a ver" b="por qué el B vale más." full /> },

  // — Momento uno —
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="MAÑANA A LAS NUEVE" lines={[{ t: "Tenés algo urgente" }, { t: "que contar.", a: true }]} sub="Pasa algo importante sobre tu tema y querés avisarle a tu gente hoy, no cuando se enteren solos." art="news" variant="left" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <Momento dur={d} n={1} titulo="Cuando querés hablarles" a="Escribís y publicás. Y ahí empieza la espera: el reparto no lo decidís vos. Puede aparecerle a un puñado, o a nadie, o mañana a la tarde cuando ya no sirve." b="Escribís y mandás. A las nueve y cinco está en las cien bandejas." /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="NO ES DE TAMAÑO: ES DE CONTROL" a="En el A pedís permiso." b="En el B, la puerta ya está abierta." full /> },

  // — Momento dos —
  { audio: "s8.wav", sec: 1, render: (d) => <Momento dur={d} n={2} titulo="Cuando cambian las reglas" a="Tus mil seguidores están en la lista de alguien más. Vos no los tenés: te prestan el acceso. Si cambian las condiciones, tu manera de llegarles cambia con ellas." b="Tu lista es un dato que te pertenece. Si cambia la plataforma, o si te mudás, la lista sigue intacta en tu poder." remate="Lo prestado funciona mientras te lo presten. Lo propio te lo llevás puesto." /> },

  // — Momento tres —
  { audio: "s9.wav", sec: 1, render: (d) => <Momento dur={d} n={3} titulo="Cuánto pesa lo que decís" a="Aparecés en un muro, entre decenas de cosas diseñadas para llamar la atención. Competís por un segundo de alguien distraído." b="Entrás a una bandeja de correo, que es un espacio más íntimo. Y esa persona te dio permiso expreso para entrar." /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA DIFERENCIA" a="En el A, una multitud distraída." b="En el B, alguien que te abrió una puerta." /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y UNA ACLARACIÓN HONESTA" lines={[{ t: "Sí, existe la carpeta" }, { t: "de promociones.", a: true }]} sub="La diferencia es de grado, y es grande: en una red, si no te reparten, no le llega a nadie. En el correo tu mensaje sí llega a destino." art="screen" variant="left" /> },

  // — Momento cuatro: los números —
  { audio: "s12.wav", sec: 1, render: (d) => <Momento dur={d} n={4} titulo="Los números, uno al lado del otro" a="Mil seguidores. Publicás. Por el reparto, tu mensaje aparece frente a unas cien personas, y de esas, unas veinte lo consumen de verdad." b="Cien suscriptores. Mandás. Llega a cien. Y como entraron por un tema que les importaba, unos sesenta lo abren y lo leen." /> },
  { audio: "s13.wav", sec: 1, render: (d) => <DosRecipientes dur={d} kicker="VEINTE CONTRA SESENTA" title="Con diez veces menos gente, el triple" a={{ label: "MIL SEGUIDORES", sub: "Le llegó a veinte.", llena: 0.2, valor: "20" }} b={{ label: "CIEN SUSCRIPTORES", sub: "Le llegó a sesenta.", llena: 0.6, valor: "60" }} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y NO GANÓ POR TAMAÑO" a="Ganó porque no hay nadie en el medio," b="y los que están, están por elección." full /> },

  // — Momento cinco: cómo se consigue —
  { audio: "s15.wav", sec: 1, render: (d) => <Momento dur={d} n={5} titulo="Cómo se consigue cada uno" a="Que alguien te siga es gratis: un toque, sin compromiso. Por eso es fácil de conseguir, y por eso también vale menos." b="Que alguien te deje su correo tiene un costo: entrega un dato personal y un permiso para entrar a su espacio." /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL PRINCIPIO DE ESTA ETAPA" a="Nadie deja su correo por nada:" b="lo deja a cambio de algo que vale más." full /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ES UN TRUEQUE" lines={[{ t: "Te da algo valioso" }, { t: "y espera algo mejor.", a: true }]} sub="Si lo que ofrecés vale la pena, el trueque se cierra. Si ofrecés algo genérico, no hay trueque." art="coins" variant="left" /> },

  // — Qué puede ofrecer un periodista —
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA PRÁCTICA" lines={[{ t: "¿Y qué puede" }, { t: "ofrecer un periodista?", a: true }]} sub="Lo más valioso que tenés no es un producto: es tu criterio y tu acceso." variant="bare" size={116} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="OPCIÓN 1 · AHORRAR TIEMPO" lines={[{ t: "“Todo lo del Concejo" }, { t: "en una página.”", a: true }]} sub="Alguien que quiere estar informado y no tiene dos horas te da su correo por eso sin dudarlo." art="news" variant="behind" /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="OPCIÓN 2 · RESOLVER ALGO" lines={[{ t: "Los trámites de tu ciudad," }, { t: "explicados sin jerga.", a: true }]} sub="Con los horarios y qué papeles llevar. Vos ya sabés cuáles son las preguntas repetidas, porque te las hacen." art="bulb" variant="left" /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdList dur={d} kicker="Y DOS MÁS" title="Que también salen de lo que ya hacés" items={["El detrás de escena — lo que no entró, la entrevista completa, el documento", "Lo mejor de tu archivo — las diez notas que más sirvieron, ordenadas"]} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL HILO COMÚN DE LAS CUATRO" a="Tu archivo y tu criterio ya son el producto:" b="falta empaquetarlos." full /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SI OFRECÉS ALGO GENÉRICO", title: "Entra cualquiera\ny se va rápido.", sub: "El número sube, la lista no sirve." }} right={{ label: "SI OFRECÉS ALGO PRECISO", title: "Entra la persona\nque te interesa.", sub: "El trueque no solo llena tu lista: la llena con la gente correcta." }} /> },

  // — Momento seis: el tiempo —
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y HAY UN SEXTO MOMENTO" lines={[{ t: "Solo se ve" }, { t: "estirando el tiempo.", a: true }]} sub="Así que agreguémoslo." variant="bare" size={122} /> },
  { audio: "s25.wav", sec: 1, render: (d) => <Momento dur={d} n={6} titulo="Un año después" a="Cada vez que publicás, arrancás de cero la pelea por el reparto. Tener mil no te garantiza nada para mañana: tu acceso se vuelve a jugar cada vez." b="Cada persona que entra se queda. Los cien de hoy son los cien de mañana, más los que sumes. Y el acceso no se vuelve a jugar: ya lo tenés." /> },
  { audio: "s26.wav", sec: 1, render: (d) => <DosRecipientes dur={d} kicker="POR ESO, A UN AÑO" title="No se separan un poco: se separan mucho" a={{ label: "SUBE Y BAJA", sub: "Según reglas ajenas.", llena: 0.24 }} b={{ label: "SOLO CRECE", sub: "Es una base que se acumula.", llena: 0.86 }} /> },

  // — Cuándo se pide —
  { audio: "s27.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA QUE APARECE" lines={[{ t: "¿En qué momento" }, { t: "se lo pido?", a: true }]} sub="Si el correo es tan valioso, cuándo se le pide a alguien." variant="bare" size={120} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ACORDATE DE LA REGLA" lines={[{ t: "Nadie sube dos" }, { t: "escalones de una.", a: true }]} sub="Pedírselo a alguien que te acaba de descubrir es pedirle un gesto grande a cambio de casi nada de confianza." art="rocket" variant="behind" /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL MOMENTO NATURAL" a="Después de que ya recibió algo tuyo" b="y le gustó." full /> },
  { audio: "s30.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SOBRE LA FRECUENCIA" lines={[{ t: "No se hace" }, { t: "una vez.", a: true }]} sub="Se deja disponible siempre, donde la gente termina de leerte. Cada persona llega en un momento distinto de su recorrido." art="target" variant="left" /> },

  // — Pausa de recuerdo —
  { audio: "s31.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARÁ UN SEGUNDO" lines={[{ t: "¿Por qué nadie deja" }, { t: "su correo gratis?", a: true }]} sub="Y qué hace falta para que lo deje. Contestate con tus palabras." variant="bare" size={116} /> },
  { audio: "s32.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ALGO ASÍ" a="Porque tiene un costo," b="y lo cambia por algo que valga más." full /> },

  // — Lista sana vs grande —
  { audio: "s33.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA COMPARACIÓN MÁS" lines={[{ t: "Hay un número" }, { t: "que engaña.", a: true }]} sub="Y esta vez la comparación es dentro del camino B." variant="bare" size={122} /> },
  { audio: "s34.wav", sec: 1, render: (d) => <DosRecipientes dur={d} kicker="LO QUE IMPORTA NO ES CUÁNTOS SON" title="Es cuántos te esperan" a={{ label: "GRANDE Y DORMIDA", sub: "Mil correos que nadie abre. Hablarle a gente que no escucha es hablarle a una pared.", llena: 0.22, valor: "1.000" }} b={{ label: "CHICA Y SANA", sub: "Cien que abren, esperan y leen.", llena: 0.78, valor: "100" }} /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "MIL EJEMPLARES", title: "En un depósito\nque nadie abre.", sub: "El número suena bien y no vale nada." }} right={{ label: "CIEN EJEMPLARES", title: "Leídos de la\nprimera a la\núltima página.", sub: "Una lista vale por cuánto la leen, no por cuánto pesa." }} /> },
  { audio: "s36.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO, DESDE EL DÍA UNO" a="El objetivo no es inflar el número:" b="es sumar gente que quiera estar." full /> },

  // — Qué les mando después —
  { audio: "s37.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y UNA ÚLTIMA PREGUNTA" lines={[{ t: "Conseguiste el correo." }, { t: "¿Y ahora?", a: true }]} sub="Porque la decisión de quedarse también se revalida: cada envío confirma o desmiente por qué te lo dio." variant="bare" size={118} /> },
  { audio: "s38.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA, Y ES UNA SOLA" a="Mandá lo que prometiste," b="en la frecuencia que puedas sostener." full /> },
  { audio: "s39.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UNO POR SEMANA…", title: "Y después\nsilencio.", sub: "Tres semanas y desapareciste." }} right={{ label: "UNO POR MES", title: "Que llega\nsiempre.", sub: "Lo que construye confianza no es el volumen: es que aparezcas cuando dijiste." }} /> },
  { audio: "s40.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ALGO QUE NOS CUESTA" lines={[{ t: "No hace falta que" }, { t: "cada envío sea una obra.", a: true }]} size={110} sub="Alcanza con que sea útil. Un correo corto que resuelve algo vale más que uno largo que no se lee." art="news" variant="left" /> },

  // — Cierre y tarea —
  { audio: "s41.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LOS SEIS MOMENTOS, LO MISMO" a="Menos cantidad," b="más control." full /> },
  { audio: "s42.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"¿Qué das a cambio?"} plate={["Un resumen", "Una guía", "Un detrás de escena", "Tu archivo ordenado"]} ex="Algo específico, sobre tu tema, que le resuelva o le ahorre algo concreto a tu lector." /> },
  { audio: "s43.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SIN PRODUCIRLO TODAVÍA" lines={[{ t: "Hoy alcanza con" }, { t: "definirlo en una frase.", a: true }]} sub="“A cambio del correo, voy a dar tal cosa.” Esa idea es la semilla de tu audiencia propia." art="bulb" variant="behind" /> },
  { audio: "s44.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={1} next={2} proxima="1.6 · Un año entero, mes por mes: por qué crece lento y de golpe se dispara" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F5 = totalFrames(SCENES_D);
export const ClaseFundamentos5: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f15.mp3" caps={C as any} />;
