import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { BocaScene, Cadena, Senales } from "./lib/alcance";
import D from "./dur/f13.json";
import C from "./dur/f13.caps.json";

// 1.3 — Alcance: cómo te encuentra la gente que no sabe que existís.
// HERO PROPIO de esta clase: LA BOCA (un haz que se abre o se angosta según las señales).
// Deliberadamente distinto de la escalera de 1.2: allá el concepto era descenso, acá es APERTURA.
// Segundo objeto: LA CADENA DE PRUEBAS (100 → 500 → 2.000 → miles) para el ejemplo trabajado.

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA DE SIEMPRE" lines={[{ t: "¿Por qué a unos" }, { t: "los ve todo el mundo?", a: true }]} sub="Y a otros, que publican cosas igual de buenas, casi no los ve nadie." variant="bare" size={116} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LA RESPUESTA FÁCIL", title: "“Tienen\nsuerte.”", sub: "Y tiene un problema: te deja afuera, esperando que un día te toque." }} right={{ label: "LA RESPUESTA REAL", title: "Hay una\nlógica.", sub: "Y es una lógica que podés entender y usar a tu favor." }} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EMPECEMOS POR ACÁ" a="No es una rifa." b="Es un mecanismo." full /> },
  { audio: "s4.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="LA PRIMERA ETAPA" lines={["El alcance:", "la boca de entrada."]} sub="Cuánta gente nueva ve lo que publicás." abertura={0.7} /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ UNA CLASE ENTERA" lines={[{ t: "Es la etapa que" }, { t: "más se malinterpreta.", a: true }]} sub="Y entenderla bien te cambia por completo la manera de trabajar." art="target" variant="behind" /> },

  // — La idea central —
  { audio: "s6.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA FRASE" a="Te muestran a gente nueva" b="cuando retenés a la que ya tienen." full /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA FRASE TIENE PARTES" lines={[{ t: "Vamos a verlas" }, { t: "una por una.", a: true }]} sub="Leída de corrido parece un trabalenguas. Separada, se entiende sola." variant="bare" size={118} /> },

  // — Bloque 1 · qué es el alcance —
  { audio: "s8.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="LA DEFINICIÓN" lines={["Personas", "nuevas."]} sub="La palabra importante es “nuevas”." abertura={0.6} label="gente nueva" /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "NO ES", title: "Cuántas veces\nse mostró.", sub: "Ni cuántos de tus seguidores lo vieron." }} right={{ label: "SÍ ES", title: "Cuánta gente\nte cruzó por\nprimera vez.", sub: "Los que todavía no te conocían." }} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR ESO ES LA BOCA" lines={[{ t: "La única etapa" }, { t: "que va a buscar afuera.", a: true }]} sub="Todas las demás trabajan sobre gente que ya entró." art="people" variant="left" /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UNA SEMANA", title: "Cincuenta\npersonas.", sub: "Sin que hayas cambiado nada." }} right={{ label: "LA SIGUIENTE", title: "Cinco mil.", sub: "Tampoco cambiaste nada. El gatillo lo aprieta la plataforma." }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REPARTICIÓN DE ROLES" a="Vos no lo decidís." b="Pero lo influís muchísimo." /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y VALE PARA TODAS" lines={[{ t: "No es el truco" }, { t: "de una aplicación.", a: true }]} sub="Cambian los nombres y los detalles; el principio de fondo es el mismo en una red social, en un buscador o donde publiques." art="screen" variant="left" /> },

  // — 4b · Alcance no es audiencia —
  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DOS COSAS QUE SUENAN IGUAL" lines={[{ t: "Alcance" }, { t: "no es audiencia.", a: true }]} sub="Confundirlas lleva a trabajar para el lado equivocado." variant="bare" size={124} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EL ALCANCE", title: "Es prestado.", sub: "Espacio que te prestan hoy y mañana puede ser menos. Es la parte volátil de tu trabajo." }} right={{ label: "LA AUDIENCIA", title: "Es tuya.", sub: "Gente que ya decidió que quiere lo que hacés. Esa no se mueve cuando cambia una regla." }} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL PUNTO CLAVE" lines={[{ t: "El alcance" }, { t: "no se acumula.", a: true }]} sub="Diez mil personas la semana pasada no te dejan diez mil de arranque en la próxima. Lo que se acumula es lo que el alcance te dejó." art="growth" variant="behind" /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IMAGEN QUE TE SIRVE" a="El alcance es el río que pasa." b="Tu audiencia es lo que juntaste de él." /> },

  // — Bloque 2 · por qué te reparte —
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CAMBIEMOS DE LUGAR" lines={[{ t: "Ponete un segundo" }, { t: "del lado de ella.", a: true }]} sub="Para entender por qué te reparte, hay que mirar su negocio." variant="bare" size={118} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SU NEGOCIO, EN UNA LÍNEA" lines={[{ t: "Vive de que" }, { t: "la gente se quede.", a: true }]} sub="Cuanto más tiempo se queda, más publicidad ve, y más gana." art="screen" variant="left" /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ENTONCES, ¿QUÉ VALE PARA ELLA?" a="El contenido" b="que retiene." full /> },
  { audio: "s21.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="Y AHÍ ENTRÁS VOS" lines={["Si retenés,", "te volvés útil."]} sub="Le estás dando exactamente lo que necesita: una razón para que su gente no se vaya." abertura={0.85} flip /> },
  { audio: "s22.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="Y TE PREMIA ASÍ" lines={["Mostrándote a", "más gente nueva."]} sub="Para ella es una apuesta segura: ya vio que retenés." abertura={1} label="más gente nueva" /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA VUELTA QUE LO EXPLICA TODO" a="No están en veredas opuestas." b="Los dos quieren lo mismo." /> },

  // — Bloque 3 · las tres señales —
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA OBVIA" lines={[{ t: "¿Y cómo se da" }, { t: "cuenta de que retenés?", a: true }]} sub="Lee señales. Pequeñas pistas que dejamos sin darnos cuenta cada vez que consumimos algo." variant="bare" size={116} /> },
  { audio: "s25.wav", sec: 1, render: (d) => <Senales dur={d} kicker="LAS TRES QUE IMPORTAN" title="Lo que la plataforma lee" items={[{ t: "Se detiene", d: "Frenó el pulgar. Lo trabajás con el título y la primera línea.", peso: 1 }, { t: "Se queda", d: "Lo consumió hasta el final. Frenar puede ser un accidente; quedarse es una elección.", peso: 1.25 }, { t: "Hace algo", d: "Lo comparte, lo manda, lo guarda. La señal reina.", peso: 1.6 }]} /> },
  { audio: "s26.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SEÑAL 1 · SE DETIENE" lines={[{ t: "Vos provocás" }, { t: "la detención.", a: true }]} sub="Ella la cuenta y decide. Cada vez que alguien frena, suma un voto a favor de mostrarte más." art="target" variant="left" /> },
  { audio: "s27.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SEÑAL 2 · SE QUEDA" lines={[{ t: "Frenar puede" }, { t: "ser un accidente.", a: true }]} sub="Quedarse hasta el final es una elección. Le confirma que lo que ofreciste cumplió lo que prometía." art="bulb" variant="behind" /> },
  { audio: "s28.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SEÑAL 3 · LA REINA" lines={[{ t: "Compartir es" }, { t: "poner tu nombre" }, { t: "en juego.", a: true }]} size={104} sub="“Confío tanto en esto que te lo recomiendo.” A nadie le sobra reputación para regalar." art="people" variant="left" artColor={GO} /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EN LA CLASE PASADA", title: "Cosas que\nvos provocás.", sub: "Las trabajaste desde tu lado." }} right={{ label: "HOY", title: "Cosas que\nella lee.", sub: "La misma moneda, vista por su otra cara." }} /> },

  // — El ejemplo trabajado: la cadena de pruebas —
  { audio: "s30.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VEÁMOSLO ENCADENADO" lines={[{ t: "Números de" }, { t: "ejemplo.", a: true }]} sub="Son para entender la mecánica. No son una promesa ni un dato real." variant="bare" size={122} /> },
  { audio: "s31.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="LA PRUEBA CHICA" title="Primero te prueba con pocos" pasos={["100", "500", "2.000", "miles"]} hasta={1} nota="La plataforma todavía no sabe si tu nota es buena. Así que tantea." /> },
  { audio: "s32.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="CASO 1 · RETIENE" title="Frenan, la leen, la comparten" pasos={["100", "500", "2.000", "miles"]} hasta={2} nota="Lee las señales, piensa “esto retiene”, y amplía la prueba." /> },
  { audio: "s33.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="Y SIGUE" title="Escalón por escalón" pasos={["100", "500", "2.000", "miles"]} hasta={4} nota="Eso que de afuera llamamos “se hizo viral”, por dentro fue una cadena de pruebas." /> },
  { audio: "s34.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="CASO 2 · NO RETIENE" title="Pocas frenan, nadie comparte" pasos={["100", "500", "2.000", "miles"]} hasta={1} corte={1} nota="No la castiga: simplemente deja de invertir en mostrarla." /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="CÓMO SE GANA" a="El alcance grande no se pide:" b="se gana en la prueba chica." full /> },

  // — 7b · ¿Quiénes son esas cien personas? (la señal de "para quién") —
  { audio: "s36.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA QUE CASI NADIE SE HACE" lines={[{ t: "Esas cien," }, { t: "¿quiénes son?", a: true }]} sub="¿Las elige al azar? No. Y entender cómo las elige te cambia la manera de escribir." variant="bare" size={120} /> },
  { audio: "s37.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CÓMO ARMA ESE PRIMER GRUPO" title="Leyendo tu publicación" items={["De qué habla y qué palabras usás", "Qué lugares y referencias nombrás", "A qué se parece, y quiénes reaccionaron bien a eso antes"]} /> },
  { audio: "s38.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL PUNTO" a="No adivina a quién mostrarte." b="Lo deduce de lo que escribiste." full /> },
  { audio: "s39.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="CON SEÑAL DE PARA QUIÉN" title="Sabe con quién probar" pasos={["100", "500", "2.000", "miles"]} hasta={4} nota="Nombres del lugar, las palabras de esa comunidad, referencias que ahí se entienden. Prueba con esa gente, y esa gente responde." /> },
  { audio: "s40.wav", sec: 1, render: (d) => <Cadena dur={d} kicker="SIN SEÑAL DE PARA QUIÉN" title="Tiene que adivinar" pasos={["100", "500", "2.000", "miles"]} hasta={1} corte={1} nota="Prueba con una mezcla al azar. El tema le resulta tibio, casi nadie frena. Y la nota podía ser igual de buena." /> },
  { audio: "s41.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="DE AHÍ SALE ESTO" a="Escribir para todos es la forma" b="más rápida de que no te encuentre nadie." /> },
  { audio: "s42.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "PARECE", title: "Un ejercicio\nde marketing.", sub: "Definir para quién escribís." }} right={{ label: "ES", title: "Una herramienta\nde distribución.", sub: "Cuanto más claro tengas a tu lector, más señales ponés sin darte cuenta, y mejor puede la plataforma salir a buscarlo." }} /> },
  { audio: "s43.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="QUEDATE CON ESTO" lines={[{ t: "No solo tiene que" }, { t: "gustarle a tu lector.", a: true }]} sub="Tiene que decirle a la plataforma quién es tu lector. Definirlo con precisión tiene su propia clase más adelante." art="people" variant="left" /> },

  // — Pausa de recuerdo —
  { audio: "s44.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARÁ UN SEGUNDO" lines={[{ t: "¿Por qué te muestra" }, { t: "a gente nueva?", a: true }]} sub="Sin mirar atrás. Contestate en voz baja." variant="bare" size={120} /> },
  { audio: "s45.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ALGO ASÍ" a="Porque retenés a su gente," b="y eso a ella le conviene." /> },

  // — 8b · De dónde sale el alcance —
  { audio: "s46.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="COMPLETEMOS EL MAPA" lines={[{ t: "El alcance viene" }, { t: "de cuatro lugares.", a: true }]} sub="Conocerlos te sirve para no quedar colgado de uno solo." variant="bare" size={118} /> },
  { audio: "s47.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="FUENTE 1 · REDES" lines={["Te muestra a", "quien no te sigue."]} sub="El más rápido de todos, y también el más volátil." abertura={0.9} label="no te siguen" /> },
  { audio: "s48.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="FUENTE 2 · BUSCADORES" lines={[{ t: "Sigue trayendo" }, { t: "gente meses después.", a: true }]} size={104} sub="Alguien escribe una pregunta y aparece algo que publicaste. Lento de construir, pero trabaja mientras dormís." art="growth" variant="left" /> },
  { audio: "s49.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ACÁ SOS IMBATIBLE" a="Responder bien una pregunta" b="es exactamente lo que premia." /> },
  { audio: "s50.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="FUENTE 3 · RECOMENDACIÓN" lines={[{ t: "Llega con la" }, { t: "confianza puesta.", a: true }]} sub="No te descubre solo: te descubre recomendado por alguien en quien ya confía. El de mejor calidad de los cuatro." art="people" variant="behind" /> },
  { audio: "s51.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="FUENTE 4 · ANUNCIOS" lines={[{ t: "Un acelerador," }, { t: "no un reemplazo.", a: true }]} size={112} sub="Alcance comprado. Sirve para agrandar algo que ya funciona. Lo vemos con detalle mucho más adelante." art="rocket" variant="left" artColor={GO} /> },
  { audio: "s52.wav", sec: 1, render: (d) => <EdList dur={d} kicker="LO LINDO DE ESTA LISTA" title="Tres son gratis y se ganan con oficio" items={["Redes — rápido y volátil", "Buscadores — lento, pero acumula para siempre", "Recomendación — el de mejor calidad"]} /> },

  // — Ojo con esto —
  { audio: "s53.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="OJO CON ESTO" lines={[{ t: "Enamorarse del" }, { t: "número grande.", a: true }]} sub="Es el error más común con el alcance. Quiero que lo veas venir de lejos." art="target" variant="behind" /> },
  { audio: "s54.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA QUE SALE DE ACÁ" a="El alcance vale lo que valga" b="la etapa que viene después." /> },
  { audio: "s55.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "DIEZ MIL QUE PASAN", title: "Y ninguna\nse detiene.", sub: "Como abrir la puerta de un local a una multitud que pasa de largo." }} right={{ label: "UN ALCANCE MEDIANO", title: "Que convierte\nbien.", sub: "Vale muchísimo más." }} /> },
  { audio: "s56.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE ESTO SIGNIFICA" a="No necesitás volverte viral." b="Y eso sí depende de vos." full /> },

  // — Cierre y tarea —
  { audio: "s57.wav", sec: 1, render: (d) => <BocaScene dur={d} kicker="REPASEMOS" lines={["Te reparte cuando", "retenés a su gente."]} sub="Y esas señales las trabajás con tu oficio." abertura={0.8} /> },
  { audio: "s58.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA · PARTE 1" big={"Dos publicaciones."} plate={["Una que terminaste", "Una que abandonaste"]} ex="Con el teléfono en la mano, ahora mismo. De cualquier tema, no hace falta que sean de periodismo." /> },
  { audio: "s59.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ESCRIBÍ UNA FRASE" lines={[{ t: "¿Qué hizo una" }, { t: "que la otra no?", a: true }]} size={112} sub="Mirá solo el principio: las primeras dos líneas, la imagen, el título. Eso que detectaste es la señal, vista desde el otro lado del mostrador." art="bulb" variant="left" /> },
  { audio: "s60.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA · PARTE 2" big={"Tu boca de entrada."} plate={["Redes", "Buscadores", "Recomendación"]} ex="Anotá de cuál va a venir tu alcance principal. Si estás por arrancar, elegí la que mejor conozcas." /> },
  { audio: "s61.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={1} next={2} proxima="1.4 · Qué pasa en su cabeza en los primeros tres segundos" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F3 = totalFrames(SCENES_D);
export const ClaseFundamentos3: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f13.mp3" caps={C as any} />;
