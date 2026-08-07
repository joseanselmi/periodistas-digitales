import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI } from "./lib/editorial";
import { PropuestaScene } from "./lib/nicho";
import D from "./dur/f56.json";
import C from "./dur/f56.caps.json";

// 5.6 — Tu propuesta editorial y tu línea. Módulo 5 (VIOLETA). CIERRE del módulo.
// HERO PROPIO: LA PROMESA + EL FILTRO (la propuesta en una frase + la línea temas sí/no).
// Estructura LA PROMESA + EL FILTRO.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CONSTRUISTE LOS CIMIENTOS" lines={[{ t: "Tema, ángulo" }, { t: "y lector.", a: true }]} sub="Pero los cimientos, solos, no se ven. Falta convertirlos en dos cosas que usás todos los días." variant="bare" size={122} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DOS HERRAMIENTAS" lines={[{ t: "Una promesa afuera." }, { t: "Un filtro adentro.", a: true }]} sub="La que le hablás a tu lector, y la que te hablás a vos cuando tenés que decidir." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VIVE EN TUS NOTAS" lines={[{ t: "Hoy lo apretamos" }, { t: "en dos frases.", a: true }]} sub="Que van a guiar cada decisión: desde qué publicás hasta cómo lo decís." art="screen" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LAS DOS, EN UNA LÍNEA" a="La propuesta atrae." b="La línea ordena." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <PropuestaScene dur={d} kicker="TU PROPUESTA EDITORIAL" lines={["Una frase: qué", "gana tu lector."]} sub="La fórmula: para quién, qué le das, y desde dónde. Todo lo que trabajaste, en términos de tu lector." modo="promesa" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA VUELTA CLAVE" lines={[{ t: "No lo que hacés vos:" }, { t: "lo que gana el lector.", a: true }]} sub="No “publico notas”: “te hago descubrir dónde comer bien”. Si tu lector piensa “esto es para mí”, la tenés." art="target" variant="left" artColor={VI} /> },

  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TU LÍNEA EDITORIAL" lines={[{ t: "El filtro: entra" }, { t: "o no entra.", a: true }]} sub="Su fuerza está tanto en lo que deja entrar como en lo que deja afuera. Decir que no a un tema ajeno cuida tu foco." variant="bare" size={116} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y YA ESTÁ CASI ESCRITA" lines={[{ t: "Sale de todo" }, { t: "lo que hiciste.", a: true }]} sub="Entra si le sirve a tu lector, encaja con tu ángulo, y lo dominás. Si no, queda afuera." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PRUEBA · LOS TEMAS DE AL LADO" lines={[{ t: "Un restaurante" }, { t: "carísimo, de moda.", a: true }]} sub="¿Le sirve a Sofía, que cuida cada peso? No. ¿Encaja con su ángulo? No. Entonces no va, por más tendencia que sea." art="target" variant="behind" artColor={VI} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESA DECISIÓN FORTALECE" a="Saben que no los mandás a un lugar impagable." b="Esa certeza es por qué confían." full /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y TE LIBERA" lines={[{ t: "La respuesta" }, { t: "aparece sola.", a: true }]} sub="Sabés en qué cancha jugás; te ahorrás dudar frente a la hoja en blanco, y tenés mucho espacio para crear." art="bulb" variant="left" artColor={VI} /> },

  { audio: "s12.wav", sec: 1, render: (d) => <PropuestaScene dur={d} kicker="EL CASO · SU PROPUESTA" lines={["Su lectora piensa:", "esto es para mí."]} sub="La promesa completa de la gastronómica, en una frase con las tres partes." modo="promesa" /> },
  { audio: "s13.wav", sec: 1, render: (d) => <PropuestaScene dur={d} kicker="EL CASO · SU LÍNEA" lines={["Dos columnas.", "Terminó de nacer."]} sub="Con esas dos frases pegadas en su escritorio, ya no improvisa: sabe qué es su medio, y qué entra y qué no." modo="linea" /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdList dur={d} kicker="QUEDATE CON ESTAS TRES" title="El cierre del módulo" items={["Propuesta: la promesa de qué gana tu lector", "Línea: el filtro de qué entra y qué no", "Decir que no te vuelve nítido y confiable"]} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Tu propuesta\ny tu línea."} plate={["Propuesta: 3 partes", "Temas sí", "Temas no"]} ex="Escribí tu propuesta con la fórmula. Y armá dos columnas: los temas de al lado los sacás de tu rubro y tus competidores." /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y MIRALO" lines={[{ t: "En pocas líneas:" }, { t: "quién sos y qué hacés.", a: true }]} sub="Para quién, y qué entra y qué no. El resumen estratégico de tu proyecto." variant="bare" size={118} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CERRAMOS EL CORAZÓN" lines={[{ t: "Ya no una idea vaga:" }, { t: "un proyecto definido.", a: true }]} sub="Enfocar, filtrar, validar, tu ángulo, tu lector, y hoy tu promesa y tu línea." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y LO QUE VIENE" a="Con esto ya podés escribir." b="El próximo módulo: el nombre y la marca." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N6 = totalFrames(SCENES_D);
export const ClaseNicho6: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f56.mp3" caps={C as any} />;
