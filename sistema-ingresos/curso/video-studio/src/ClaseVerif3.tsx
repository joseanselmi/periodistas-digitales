import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, GR, GO } from "./lib/editorial";
import { TrianguloScene } from "./lib/triangulo";
import D from "./dur/f33.json";
import C from "./dur/f33.caps.json";

// 3.3 — Chequear declaraciones y datos con IA. Módulo 3 (VERDE).
// HERO PROPIO: LA TRIANGULACIÓN (una afirmación al centro, tres fuentes que se cruzan).
// Estructura TRIANGULACIÓN.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA FRASE QUE LO EXPLICA" lines={[{ t: "La repetición convence," }, { t: "aunque atrás no haya nada.", a: true }]} sub="Una mentira repetida mil veces no se vuelve verdad, pero empieza a sonar como si lo fuera." variant="bare" size={104} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR ESO, HOY" lines={[{ t: "Las palabras viajan" }, { t: "más rápido que los hechos.", a: true }]} sub="Vamos a lo que más se repite sin chequear: las declaraciones y los datos." art="screen" variant="behind" artColor={GR} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE LAS IMÁGENES A LAS PALABRAS" lines={[{ t: "Una frase no tiene" }, { t: "una foto que buscar.", a: true }]} sub="Pero tiene algo parecido, y más poderoso: rastrear de dónde salió, y cruzarlo. Triangular." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <TrianguloScene dur={d} kicker="LA IDEA CENTRAL" lines={["Un dato no se confirma", "con una sola fuente."]} sub="Una fuente sola puede estar equivocada o interesada. Un dato serio lo dicen varias que coinciden." sola /> },

  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA DECLARACIÓN" lines={[{ t: "Buscá el momento real" }, { t: "en que lo dijo.", a: true }]} sub="El video, la entrevista, el documento. No la captura de pantalla, que es facilísimo de falsificar." art="screen" variant="left" artColor={GR} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN DATO O UN NÚMERO" lines={[{ t: "Buscá quién lo midió," }, { t: "cuándo y cómo.", a: true }]} sub="Un número sin dueño, sin un organismo o un informe detrás, es un rumor con forma de cifra." art="news" variant="behind" artColor={GR} /> },

  { audio: "s7.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CÓMO VIAJA UNA INFORMACIÓN" title="Cuatro pasos del dato real" items={["Un organismo publica un informe", "Un medio lo resume y cambia el énfasis", "Otro lo copia y exagera el título", "Alguien lo postea, y vos lo ves"]} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CAMINO AL REVÉS" lines={[{ t: "Llegá al informe," }, { t: "mirá qué dice de verdad.", a: true }]} sub="Seguido, “un estudio demuestra” en el original dice “sugiere que, en ciertas condiciones, podría”. Esa diferencia es tu nota." art="growth" variant="left" artColor={GR} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO SE HACE, EN CONCRETO" lines={[{ t: "Buscá el nombre" }, { t: "entre comillas.", a: true }]} sub="O el dato + “informe” o “fuente”. Si te trabás, pedile a la IA qué organismo suele medirlo. Lleva unos minutos: tiempo bien gastado." art="target" variant="behind" artColor={GR} /> },

  { audio: "s10.wav", sec: 1, render: (d) => <TrianguloScene dur={d} kicker="TRIANGULAR" lines={["Fuentes que llegaron", "por caminos distintos."]} sub="Diez medios copiándose son una sola fuente repetida diez veces. La coincidencia vale cuando son independientes." confirman={2} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <TrianguloScene dur={d} kicker="¿CUÁNTAS ALCANZAN?" lines={["Con dos, más firme.", "Con tres, sólido."]} sub="No es un número mágico: es cuántas hacen falta para que dejes de dudar con razón." confirman={3} /> },

  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA TRAMPA A EVITAR" lines={[{ t: "No le preguntes" }, { t: "“¿es cierto?”.", a: true }]} sub="Puede inventar una cita o un número con total seguridad. Usarla como fuente es volver al problema." art="bulb" variant="left" artColor={GO} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EN SU LUGAR JUSTO, ES ORO" lines={[{ t: "Pegale el informe." }, { t: "Que te lo resuma.", a: true }]} sub="Ahí no inventa: resume lo que vos le diste. Y el dato que vas a publicar lo leés vos en el original." art="chip" variant="behind" artColor={GR} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdList dur={d} kicker="LUCES AMARILLAS" title="Cuando aparecen, chequeá" items={["Número redondo y sin fecha", "Dato sin dueño: “estudios demuestran”", "Declaración que solo es captura de pantalla", "Una cifra demasiado cómoda"]} /> },

  { audio: "s15.wav", sec: 1, render: (d) => <TrianguloScene dur={d} kicker="UN CASO · “EL 90%”" lines={["Redondo, sin fecha,", "sin dueño."]} sub="Rastreás la fuente: el estudio era chico, viejo, de un grupo específico, y el número real era más bajo." sola /> },
  { audio: "s16.wav", sec: 1, render: (d) => <TrianguloScene dur={d} kicker="Y SE RESUELVE" lines={["Triangulás con un", "dato reciente y serio."]} sub="No publicás el 90%: publicás el dato correcto y contás por qué el otro engañaba. Convertiste un rumor en periodismo." confirman={2} /> },

  { audio: "s17.wav", sec: 1, render: (d) => <EdList dur={d} kicker="SIN VUELTAS, TRES PREGUNTAS" title="Para fijar la idea" items={["¿Por qué no alcanza una fuente?", "¿Qué es la fuente primaria y cómo se llega?", "¿La trampa con la IA? Preguntarle “¿es cierto?”"]} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Un mini\nrastreo."} plate={["Elegí un dato viral", "Remontá a la fuente"]} ex="Buscá quién lo dijo primero, llegá a la fuente original y fijate si dice lo que circulaba. No importa el resultado: el ejercicio es el rastreo." /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE SUMASTE" lines={[{ t: "Para las palabras," }, { t: "la triangulación.", a: true }]} sub="Remontar a la fuente primaria y cruzar con fuentes independientes. La IA, ayudante; nunca fuente." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="QUEDA LA ÚLTIMA PIEZA" a="De nada sirve verificar en silencio." b="Hay que mostrarlo." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_V3 = totalFrames(SCENES_D);
export const ClaseVerif3: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f33.mp3" caps={C as any} />;
