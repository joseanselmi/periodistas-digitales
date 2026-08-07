import React from "react";
import { ClaseVideo, SceneDef, totalFrames, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { AnatomiaScene } from "./lib/anatomia";
import D from "./dur/f22.json";
import C from "./dur/f22.caps.json";

// 2.2 — La anatomía de un buen prompt. Módulo 2 (CYAN). VERSIÓN PROFUNDA.
// HERO: LA ANATOMÍA (tarjeta de prompt que se arma pieza por pieza) + 2º ejemplo (resumen) que transfiere.

const T = [
  "Actuá como un editor que prepara entrevistas.",
  "Entrevisto a la directora de una escuela sin vacantes. Lectores: familias del barrio.",
  "Proponé diez preguntas.",
  "En lista, de la más general a la más puntual.",
];
const T2 = [
  "Actuá como divulgador que explica fácil.",
  "Informe del presupuesto municipal. Lectores: vecinos sin formación técnica.",
  "Resumí los cinco puntos más importantes.",
  "En viñetas, una idea por línea, sin jerga.",
];

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UNA PERSONA", title: "Algo tibio.", sub: "Que termina reescribiendo a mano." }} right={{ label: "LA OTRA", title: "Algo casi\nlisto.", sub: "Misma herramienta. Cambió cómo pidieron." }} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA BUENA NOTICIA" lines={[{ t: "Pedir bien no es talento." }, { t: "Es una estructura.", a: true }]} sub="Tiene piezas, y las piezas se aprenden." variant="bare" size={118} /> },

  // — Puente —
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE DÓNDE VENIMOS" lines={[{ t: "Lo que le das" }, { t: "decide lo que devuelve.", a: true }]} sub="Le das poco, predice genérico. Le das bien, predice afinado." art="chip" variant="behind" /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA PRÁCTICA" a="¿Qué es, exactamente," b="darle bien?" full /> },

  // — Idea central —
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA PALABRA PARA GUARDAR" lines={[{ t: "Prompt:" }, { t: "lo que le pedís.", a: true }]} sub="Es la instrucción que escribís. Vas a escucharla todo el tiempo." art="screen" variant="left" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA IDEA" a="No depende de la labia." b="Depende de las piezas." full /> },

  // — El prompt pobre —
  { audio: "s7.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="SOBRE LA MESA" lines={["El pedido que hace", "casi todo el mundo."]} sub="Tenés que preparar una entrevista y le pedís ayuda." pobre="Dame preguntas para una entrevista." /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="QUÉ HACE LA IA CON ESO" lines={[{ t: "Sin piezas," }, { t: "predice el promedio.", a: true }]} sub="“¿Cómo empezó?”, “¿cuáles son sus planes?”. Las mismas que le daría a cualquiera." art="screen" variant="behind" /> },

  // — Pieza 1 · Rol —
  { audio: "s9.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="PIEZA 1 · ROL" lines={["Quién querés", "que sea."]} sub="Editor, entrevistador, divulgador. Si no se lo decís, elige un tono de nadie." hasta={1} textos={T} kc={CY} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "ROL FLOJO", title: "“Actuá\ncomo editor.”", sub: "Ya ayuda, pero es genérico." }} right={{ label: "ROL AFINADO", title: "“…editor de un\nmedio local.”", sub: "Dale un apellido: el oficio real que haría esa tarea. Más preciso el personaje, más precisa la voz." }} /> },

  // — Pieza 2 · Contexto —
  { audio: "s11.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="PIEZA 2 · CONTEXTO" lines={["Los datos que", "no puede adivinar."]} sub="A quién, sobre qué, para quién. La pieza que más gente se saltea." hasta={2} textos={T} kc={VI} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿CUÁNTO CONTEXTO?" lines={[{ t: "El dato que" }, { t: "cambiaría la respuesta.", a: true }]} sub="Si al agregarlo te contestaría distinto, ponelo. Si da lo mismo, no hace falta. Dos o tres que importan, alcanza." art="target" variant="left" /> },

  // — Pieza 3 · Tarea —
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PIEZA 3 · TAREA" lines={[{ t: "No la dejes" }, { t: "implícita.", a: true }]} sub="¿Escribir, resumir, comparar, proponer? Cada verbo lleva a un resultado distinto. Elegí el tuyo." variant="bare" size={120} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="EL VERBO, DIRECTO" lines={["Proponé diez", "preguntas."]} sub="Un número concreto trabaja mejor que “dame varias”, que la deja adivinando cuántas." hasta={3} textos={T} kc={GO} /> },

  // — Pieza 4 · Formato —
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PIEZA 4 · FORMATO" lines={[{ t: "Cómo querés" }, { t: "recibirlo.", a: true }]} sub="La diferencia entre un bloque que ordenás vos, y algo listo para usar." variant="bare" size={120} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="LA FORMA QUE VOS PONÉS" lines={["En lista, ordenada,", "un renglón cada una."]} sub="Una lista, una tabla, tres opciones, un texto de tal largo. Vos ponés la forma; ella la respeta." hasta={4} textos={T} kc={GO} /> },

  // — Reconstruido —
  { audio: "s17.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="EL PROMPT COMPLETO" lines={["Las cuatro piezas,", "en su lugar."]} sub="Una persona concreta, un tema con borde, una tarea clara. La predicción ya tiene a dónde ir." hasta={4} textos={T} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EL DEL ARRANQUE", title: "Preguntas\nde manual.", sub: "“Dame preguntas para una entrevista.”" }} right={{ label: "EL ARMADO", title: "Un cuestionario\ncasi listo.", sub: "El mismo tema; cuatro coordenadas para apuntar en vez de dejarla adivinando." }} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y LO MEJOR" lines={[{ t: "Cuatro piezas que ya" }, { t: "tenías en la cabeza.", a: true }]} sub="Rol, contexto, tarea, formato. No hubo ningún truco." art="bulb" variant="left" /> },

  // — Segundo ejemplo: transfiere —
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="NO ES SOLO PARA ENTREVISTAS" lines={[{ t: "Otra tarea," }, { t: "las mismas piezas.", a: true }]} sub="Un informe largo del presupuesto municipal, y una nota clara para tus lectores. El pobre: “resumime este informe”." art="news" variant="behind" /> },
  { audio: "s21.wav", sec: 1, render: (d) => <AnatomiaScene dur={d} kicker="CAEN CASI SOLAS" lines={["Mismo método,", "otro encargo."]} sub="Una vez que tenés la estructura, la usás para todo." hasta={4} textos={T2} /> },

  // — Prioridad / atajo —
  { audio: "s22.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SI ESTÁS APURADO" lines={[{ t: "Contexto y tarea:" }, { t: "no las saltees nunca.", a: true }]} sub="Son el esqueleto. El rol y el formato afinan, y los sumás cuando el resultado importa más." art="chip" variant="left" /> },

  // — Modo simple de acordarte —
  { audio: "s23.wav", sec: 1, render: (d) => <EdList dur={d} kicker="UN MODO SIMPLE DE ACORDARTE" title="Cuatro preguntas, en orden" items={["¿Quién quiero que sea? — el rol", "¿Qué necesita saber? — el contexto", "¿Qué quiero que haga? — la tarea", "¿Cómo lo quiero recibir? — el formato"]} /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO TE COMPLIQUES" lines={[{ t: "Corrido o en renglones:" }, { t: "a la IA le llega igual.", a: true }]} sub="Lo que cuenta es que las cuatro piezas estén." variant="bare" size={116} /> },

  // — Recuerdo —
  { audio: "s25.wav", sec: 1, render: (d) => <EdList dur={d} kicker="QUEDATE CON ESTAS CUATRO" title="Las piezas de un buen prompt" items={["Rol — quién querés que sea (con apellido)", "Contexto — los datos que cambian la respuesta", "Tarea — el verbo claro", "Formato — cómo lo querés"]} /> },

  // — Tarea —
  { audio: "s26.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Una tarea,\ncuatro piezas."} plate={["Rol", "Contexto", "Tarea", "Formato"]} ex="Tomá una de las tres tareas de la clase pasada y escribile las cuatro piezas por separado. De papel. La pieza que te cueste es la que más te estaba faltando." /> },

  // — Cierre y puente —
  { audio: "s27.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "No es inspiración." }, { t: "Son cuatro piezas.", a: true }]} sub="Y ahora sabés cuáles son y cómo ponerlas." art="chip" variant="behind" size={122} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={2} next={3} proxima="2.3 · Hablarle a la IA como a tu redactor" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_IA2 = totalFrames(SCENES_D);
export const ClaseIA2: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f22.mp3" caps={C as any} />;
