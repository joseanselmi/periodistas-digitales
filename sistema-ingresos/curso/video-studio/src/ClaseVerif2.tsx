import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, GR, GO } from "./lib/editorial";
import { LupaScene, BusquedaScene } from "./lib/forense";
import D from "./dur/f32.json";
import C from "./dur/f32.caps.json";

// 3.2 — Verificar imágenes y videos en segundos. Módulo 3 (VERDE).
// HERO PROPIO: LA LUPA FORENSE (señales que se encienden) + LA BÚSQUEDA INVERSA (dónde apareció antes).
// Estructura FORENSE / lupa.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN REFLEJO A REVISAR" lines={[{ t: "Una imagen convence" }, { t: "más rápido que mil palabras.", a: true }]} sub="Toda la vida una foto fue prueba de que algo pasó." variant="bare" size={104} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PERO HOY PUEDE MENTIR" lines={[{ t: "Casi ninguna" }, { t: "miente perfecto.", a: true }]} sub="Se fabrican, se reutilizan, se trucan. La buena noticia: dejan rastros." art="screen" variant="behind" artColor={GR} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR DÓNDE EMPEZAR" lines={[{ t: "Lo que más circula" }, { t: "y más se comparte.", a: true }]} sub="Ahí, mirar bien te pone media cabeza por delante del resto." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IDEA DE HOY" lines={[{ t: "No necesitás ser" }, { t: "experto en tecnología.", a: true }]} sub="Dos cosas: mirar un puñado de señales, y averiguar de dónde salió la imagen." variant="bare" size={110} /> },

  { audio: "s5.wav", sec: 1, render: (d) => <LupaScene dur={d} kicker="PREGUNTA 1" lines={["¿Es auténtica,", "o fue fabricada?"]} sub="Acá entra lo generado por IA y lo trucado con edición." activa={-1} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PREGUNTA 2" lines={[{ t: "¿Es de cuándo y" }, { t: "de dónde dice ser?", a: true }]} sub="La trampa más común: una foto real, vieja o de otro lugar, con un pie de foto falso. Tan importante como la primera." art="target" variant="left" artColor={GR} /> },

  { audio: "s7.wav", sec: 1, render: (d) => <LupaScene dur={d} kicker="SEÑALES A OJO" lines={["Manos, dedos", "y textos."]} sub="En los falsos, las manos salen torcidas y los carteles tienen letras que no son letras." activa={0} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <LupaScene dur={d} kicker="Y TAMBIÉN" lines={["Reflejos, sombras", "y fondos."]} sub="Fijate si el reflejo coincide, si las sombras caen igual, si el fondo se derrite." activa={2} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="OJO CON ESTO" lines={[{ t: "Son el primer filtro," }, { t: "no el último.", a: true }]} sub="Ninguna sola es condena; dos o tres juntas, mirá dos veces. Y estas fallas se corrigen rápido." variant="bare" size={112} /> },

  { audio: "s10.wav", sec: 1, render: (d) => <BusquedaScene dur={d} kicker="LA JUGADA MAESTRA" lines={["La búsqueda", "inversa de imagen."]} sub="Al revés de una búsqueda normal: subís la foto y te dice dónde apareció antes." hasta={1} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO SE HACE, EN CONCRETO" lines={[{ t: "El ícono de la cámara." }, { t: "En el celular: Google Lens.", a: true }]} sub="En el buscador de imágenes tocás la cámara, subís la foto, y te muestra dónde está. Gratis, sin instalar nada." art="screen" variant="left" artColor={GR} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <BusquedaScene dur={d} kicker="QUÉ TE MUESTRA" lines={["Dónde apareció", "y cuándo."]} sub="Entrá a las páginas de otra fecha y fijate cuándo se publicaron." hasta={2} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <BusquedaScene dur={d} kicker="EL CHEQUEO DE 30 SEGUNDOS" lines={["Antes de compartir", "cualquier imagen fuerte."]} sub="¿Y si no aparece nada? Solo no prueba nada: volvés a las señales y cruzás con otras fuentes." hasta={3} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y LA IA ACÁ" lines={[{ t: "La misma de M2:" }, { t: "puede mirar la imagen.", a: true }]} sub="Pedile que te señale inconsistencias en sombras, manos o fondo. Una segunda mirada rápida." art="bulb" variant="behind" artColor={GR} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LA REGLA DE SIEMPRE", title: "Pistas, no\nveredictos.", sub: "La IA se equivoca en las dos direcciones. Lo que señala, lo confirmás vos." }} right={{ label: "LOS DETECTORES", title: "Con cuidado.", sub: "Los programas que dan un porcentaje fallan seguido. Una pista más, nunca la palabra final." }} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <LupaScene dur={d} kicker="LOS VIDEOS, EN CORTO" lines={["Las mismas señales,", "en movimiento."]} sub="Bordes que tiemblan, boca que no coincide, parpadeos. Y siempre: ¿de cuándo y de dónde es?" activa={-1} /> },

  { audio: "s17.wav", sec: 1, render: (d) => <LupaScene dur={d} kicker="UN CASO · PASO 1" lines={["Un cartel del fondo", "con letras derretidas."]} sub="Te llega una foto impactante de tu ciudad. La mirás con la lupa: ya hay una señal." activa={1} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <BusquedaScene dur={d} kicker="UN CASO · PASO 2" lines={["Publicada hace dos años,", "en otra ciudad."]} sub="La búsqueda inversa lo resuelve. En menos de un minuto, evitaste publicar algo falso." hasta={1} /> },

  { audio: "s19.wav", sec: 1, render: (d) => <EdList dur={d} kicker="REPASEMOS RÁPIDO" title="Tres para llevarte" items={["Dos preguntas: ¿fabricada? ¿de cuándo/dónde?", "Señales a ojo: manos, textos, reflejos, fondos", "La jugada maestra: la búsqueda inversa"]} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Probá la búsqueda\ninversa."} plate={["Agarrá una foto", "Subila al buscador"]} ex="Mirá qué te muestra, en qué otros lugares aparece. La primera vez es para perderle el miedo. Después se vuelve un reflejo." /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Ya no mirás las" }, { t: "imágenes como antes.", a: true }]} sub="Señales a ojo, y el chequeo de treinta segundos que resuelve la mayoría de los casos." art="screen" variant="behind" artColor={GR} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="No todo es una imagen." b="A veces, lo que miente es una frase." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_V2 = totalFrames(SCENES_D);
export const ClaseVerif2: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f32.mp3" caps={C as any} />;
