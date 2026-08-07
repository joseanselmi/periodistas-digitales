import React from "react";
import { ClaseVideo, SceneDef, totalFrames, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdCards, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { PrediccionScene, EntrenaScene } from "./lib/prediccion";
import D from "./dur/f21.json";
import C from "./dur/f21.caps.json";

// 2.1 — Qué es la IA y cómo "piensa". Módulo 2 (motivo CYAN).
// HERO PROPIO: LA MÁQUINA DE PREDICCIÓN (una frase que se arma palabra por palabra con barras de
// probabilidad) + EL ENTRENAMIENTO (adivinar la palabra tapada). Objetos nuevos, no vistos en M0/M1.
// Estructura DESMITIFICACIÓN: derribo del mito → cómo es de verdad → qué implica para vos.

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PASA SIEMPRE" lines={[{ t: "Le escribís, y responde" }, { t: "como una persona.", a: true }]} sub="En dos segundos, un texto que parece pensado." variant="bare" size={120} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LO PRIMERO", title: "Asombro.", sub: "Escribe increíblemente bien." }} right={{ label: "LO SEGUNDO", title: "Inquietud.", sub: "Si escribe así, ¿para qué me necesita a mí?" }} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA DE FONDO" a="Tiene una respuesta muy buena." b="Pero primero, entendé qué es." full /> },

  // — Puente —
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="QUEDÓ FLOTANDO" lines={[{ t: "Todo eso, para" }, { t: "una sola persona.", a: true }]} sub="El módulo pasado te mostró el negocio. Suena a mucho trabajo." art="people" variant="behind" /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL DIFERENCIAL" lines={[{ t: "Una persona sola," }, { t: "el trabajo de varias.", a: true }]} sub="Si sabe dirigir a la IA. Y si aún no tenés tu nicho, no importa: esto es la herramienta de todo lo que sigue." art="chip" variant="left" /> },

  // — Idea central —
  { audio: "s6.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA IDEA" a="No piensa." b="Predice la palabra que sigue." full /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ESO LO EXPLICA TODO" lines={[{ t: "Parece pensamiento." }, { t: "Es predicción.", a: true }]} sub="Entenderlo te dice por qué a veces sale brillante y a veces flojo." variant="bare" size={124} /> },

  // — Bloque 1 · derribemos el mito —
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EMPECEMOS POR LO QUE NO ES" lines={[{ t: "No es un cerebro." }, { t: "No piensa como vos.", a: true }]} sub="Ahí se cuelan casi todos los malentendidos." variant="bare" size={120} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y TAMPOCO" lines={[{ t: "No quiere nada." }, { t: "No tiene intención.", a: true }]} sub="Aunque a veces suene como si opinara." art="bulb" variant="behind" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <PrediccionScene dur={d} kicker="ENTONCES, ¿QUÉ ES?" lines={["Un motor que adivina", "la palabra que sigue."]} sub="Le das un texto; predice la continuación más probable." base="El intendente inauguró la nueva" cand={[{ w: "plaza", p: 0.44 }, { w: "escuela", p: 0.28 }, { w: "obra", p: 0.18 }, { w: "sede", p: 0.10 }]} elegido={0} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <PrediccionScene dur={d} kicker="LO HACÉS VOS TAMBIÉN" lines={["De tanto oírlo,", "lo completás sin pensar."]} sub="Aprendiste el patrón. La IA hace lo mismo, pero a lo grande." base="De tal palo, tal…" cand={[{ w: "astilla", p: 0.94 }, { w: "palo", p: 0.03 }, { w: "madera", p: 0.02 }, { w: "rama", p: 0.01 }]} elegido={0} enganchado /> },

  // — Bloque 1b · a gran escala —
  { audio: "s12.wav", sec: 1, render: (d) => <PrediccionScene dur={d} kicker="A GRAN ESCALA" lines={["Elige la más probable.", "La pone."]} sub="Con cualquier texto, entre todas las palabras posibles." base="Tras el temporal, el municipio" cand={[{ w: "asiste", p: 0.39 }, { w: "evalúa", p: 0.31 }, { w: "declara", p: 0.20 }, { w: "releva", p: 0.10 }]} elegido={0} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <PrediccionScene dur={d} kicker="Y OTRA, Y OTRA" lines={["Palabra por palabra,", "párrafos enteros."]} sub="No es alguien razonando. Es una predicción, muy afinada." base="Tras el temporal, el municipio asiste a las" cand={[{ w: "familias", p: 0.52 }, { w: "zonas", p: 0.27 }, { w: "escuelas", p: 0.14 }, { w: "calles", p: 0.07 }]} elegido={0} enganchado /> },

  // — Bloque 2 · cómo aprendió —
  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿CÓMO ADIVINA TAN BIEN?" lines={[{ t: "Leyendo." }, { t: "Muchísimo.", a: true }]} sub="Más texto del que una persona podría leer en mil vidas." art="news" variant="behind" /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EntrenaScene dur={d} kicker="SU ENTRENAMIENTO" lines={["Un juego, millones", "de veces."]} sub="Le tapaban la palabra siguiente y tenía que adivinarla." frase="El agua vuelve a las" oculta="seis" estado="tapada" /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EntrenaScene dur={d} kicker="ASÍ SE FUE AFINANDO" lines={["Erraba, se ajustaba.", "Acertaba, reforzaba."]} sub="Repetido a una escala descomunal, capturó los patrones del lenguaje." frase="El agua vuelve a las" oculta="seis" arriesga="nueve" estado="acierto" /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "NO", title: "Copió los\ntextos.", sub: "No es un archivo de frases guardadas." }} right={{ label: "SÍ", title: "Aprendió\nla forma.", sub: "El molde de cómo escribimos. Por eso inventa uno nuevo, no repite uno viejo." }} /> },

  // — Bloque 2b · la imagen justa —
  { audio: "s18.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LO QUE TIENE", title: "Leyó casi\ntodo.", sub: "No se cansa, escribe rápido, en el tono que pidas." }} right={{ label: "LO QUE LE FALTA", title: "No vivió\nnada.", sub: "Sin calle, sin criterio, sin tu palabra empeñada. Las dos cosas, a la vez." }} /> },

  // — Bloque 3 · las cuatro consecuencias —
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO PRÁCTICO" lines={[{ t: "De eso salen" }, { t: "cuatro consecuencias.", a: true }]} sub="Concretas, para tu trabajo." variant="bare" size={122} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "1 · PRINCIPIO POBRE", title: "Predice el\npromedio.", sub: "Dos palabras sueltas: algo genérico y tibio." }} right={{ label: "1 · PRINCIPIO RICO", title: "Predice\nafinado.", sub: "Con contexto y tono: mucho más cerca de lo tuyo." }} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CONSECUENCIA 2" lines={[{ t: "Cuanto más contexto," }, { t: "mejor la predicción.", a: true }]} sub="Cada dato recorta el abanico y la empuja hacia lo que tenías en la cabeza." art="target" variant="left" /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CONSECUENCIA 3" lines={[{ t: "Puede errar" }, { t: "con total seguridad.", a: true }]} sub="Predice lo que suena bien; a veces suena perfecto y es falso. Se llama alucinación." art="bulb" variant="behind" artColor={GO} /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TU REGLA DE ORO" a="La IA propone." b="El periodista confirma." full /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CONSECUENCIA 4" lines={[{ t: "Arranca de cero" }, { t: "cada conversación.", a: true }]} sub="No se acuerda de ayer, salvo que se lo pongas. Podés probar sin miedo a ensuciar nada." art="screen" variant="left" /> },

  // — Bloque 4 · las tres —
  { audio: "s25.wav", sec: 1, render: (d) => <EdCards dur={d} kicker="LAS QUE VAS A ESCUCHAR NOMBRAR" title="Tres nombres, una misma clase" cards={[{ tag: "Claude", text: "Predice texto.", c: CY }, { tag: "ChatGPT", text: "Predice texto.", c: VI }, { tag: "Gemini", text: "Predice texto.", c: GO }]} /> },
  { audio: "s26.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ASÍ QUE" lines={[{ t: "Mismo principio." }, { t: "Empezá por la que quieras.", a: true }]} sub="Las tres tienen versión gratis. Lo que aprendés con una sirve para las otras." variant="bare" size={116} /> },

  // — Ejemplo trabajado —
  { audio: "s27.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN CASO" lines={[{ t: "Un titular" }, { t: "sobre transporte.", a: true }]} sub="Le pedís, sin más: “dame un titular sobre transporte”." variant="bare" size={124} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="RESULTADO POBRE" lines={[{ t: "“El transporte, un" }, { t: "desafío pendiente.”", a: true }]} sub="Genérico, olvidable. Le diste dos datos: predijo el promedio." art="screen" variant="behind" /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "PROMPT POBRE", title: "“Algo sobre\ntransporte.”", sub: "El promedio de todo." }} right={{ label: "PROMPT RICO", title: "Tema, dato,\nlector, tono.", sub: "Aumento del 30%, para quien viaja a diario, claro y sin alarmar: cinco titulares afinados." }} /> },

  // — Bloque 5 · te deja mejor parado —
  { audio: "s30.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LO QUE ELLA HACE", title: "Las manos.", sub: "Redacta rápido, no se cansa." }} right={{ label: "LO QUE HACÉS VOS", title: "La cabeza.", sub: "Criterio, las preguntas que nadie hace, las fuentes, y tu firma." }} /> },
  { audio: "s31.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TU LUGAR" a="Ella pone las manos." b="Vos ponés el rumbo." full /> },

  // — Recuerdo —
  { audio: "s32.wav", sec: 1, render: (d) => <EdList dur={d} kicker="REPASEMOS" title="Tres ideas para llevarte" items={["Predice la palabra que sigue", "Todo dato para publicar, lo verificás", "La calidad depende de lo que le das"]} /> },

  // — Tarea —
  { audio: "s33.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Tres tareas\npara delegar."} plate={["Resumir", "Titular", "Simplificar"]} ex="Escribí tres cosas de tu semana que le darías a un asistente que escribe rápido y no se cansa. No las hagas: solo identificalas. Es el primer borrador de tu equipo de IA." /> },

  // — Cierre y puente —
  { audio: "s34.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "La IA, sin magia:" }, { t: "un motor que predice.", a: true }]} sub="Con una capacidad enorme y límites claros que te dejan en el lugar que importa." art="chip" variant="behind" /> },
  { audio: "s35.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={2} next={3} proxima="2.2 · La anatomía de un buen prompt" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_IA1 = totalFrames(SCENES_D);
export const ClaseIA1: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f21.mp3" caps={C as any} />;
