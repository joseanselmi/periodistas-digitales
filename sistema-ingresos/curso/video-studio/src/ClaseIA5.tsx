import React from "react";
import { ClaseVideo, SceneDef, totalFrames, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, GO } from "./lib/editorial";
import { BibliotecaScene } from "./lib/biblioteca";
import D from "./dur/f25.json";
import C from "./dur/f25.caps.json";

// 2.5 — Construí tu biblioteca de prompts. Módulo 2 (CYAN). CIERRE. VERSIÓN PROFUNDA.
// HERO: LA BIBLIOTECA (fichas con huecos, estantería por rol) + convertir un prompt en plantilla.

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TE VA A PASAR ESTO" lines={[{ t: "Un pedido sale redondo." }, { t: "Y una semana después…", a: true }]} sub="Lo escribís de nuevo, de memoria, peor, porque no te acordás cómo lo habías armado." variant="bare" size={116} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO ARREGLAMOS HOY" a="Escribiste un buen pedido." b="No lo dejes ir." full /> },

  // — Puente —
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EN EL MÓDULO JUNTASTE MUCHO" lines={[{ t: "Pedidos que funcionan," }, { t: "pero están sueltos.", a: true }]} sub="En conversaciones viejas que se pierden. Hoy los juntamos en un solo lugar." art="chip" variant="behind" /> },

  // — Idea central —
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA IDEA" a="Un prompt que funcionó" b="no es de una vez: es una plantilla." full /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "PRIMERA VEZ", title: "Unos\nminutos.", sub: "Armar y afinar el pedido." }} right={{ label: "GUARDADO", title: "Segundos.", sub: "Copiás, pegás, rellenás. Por eso los que trabajan en serio no arrancan de cero." }} /> },

  // — Qué es la biblioteca —
  { audio: "s6.wav", sec: 1, render: (d) => <BibliotecaScene dur={d} kicker="QUÉ ES, EN CONCRETO" lines={["Un documento.", "Nada más."]} sub="Una nota, un archivo de texto. Empieza chiquita, con dos o tres, y crece sola con el uso." modo="estante" hasta={1} /> },

  // — Cómo titular cada prompt —
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL TÍTULO DE CADA FICHA" lines={[{ t: "No “prompt uno”." }, { t: "Ponele lo que hace.", a: true }]} sub="“Resumir en diez puntos.” “Diez títulos para una nota.” El título es el lomo del libro en el estante." art="screen" variant="left" /> },

  // — Los huecos —
  { audio: "s8.wav", sec: 1, render: (d) => <BibliotecaScene dur={d} kicker="EL TRUCO: LOS HUECOS" lines={["Lo fijo se guarda.", "Lo que cambia, un hueco."]} sub="Marcás entre corchetes lo que varía cada vez. Rellenás tres datos en lugar de todo el pedido." modo="una" /> },

  // — Convertir un prompt en plantilla —
  { audio: "s9.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "FIJAS", title: "La estructura.", sub: "“Actuá como editor, proponé diez preguntas, en lista.” Eso se queda igual siempre." }} right={{ label: "CAMBIAN CADA VEZ", title: "Tres datos.", sub: "A quién entrevistás, sobre qué tema, para qué lectores. Esos tres se vuelven huecos." }} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y QUEDA UNA PLANTILLA" lines={[{ t: "De una entrevista puntual," }, { t: "a cualquier entrevista.", a: true }]} sub="La próxima vez solo rellenás tres corchetes en lugar de escribir todo el pedido." art="bulb" variant="behind" /> },

  // — Los corchetes son tuyos —
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARA QUE LO USES TRANQUILO" lines={[{ t: "El corchete es" }, { t: "una marca tuya.", a: true }]} sub="No es un código que la IA necesite. Reemplazás el hueco por el dato real y ella lee el texto ya completo." art="target" variant="left" artColor={GO} /> },

  // — Ordenar por roles —
  { audio: "s12.wav", sec: 1, render: (d) => <BibliotecaScene dur={d} kicker="CÓMO ORDENARLA" lines={["Por los roles", "de la clase pasada."]} sub="Un estante para el documentalista, otro para el titulador, otro para el editor. El reflejo de tu redacción." modo="estante" hasta={4} /> },

  // — Fichas de arranque —
  { audio: "s13.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA NO EMPEZAR EN BLANCO" title="Tu biblioteca de arranque" items={["Documentalista — resumir", "Titulador — pedir títulos", "Editor — aclarar un texto tuyo", "Sparring — qué le falta a una nota"]} /> },

  // — Cómo crece —
  { audio: "s14.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "GESTO 1", title: "Sale bien:\nguardalo.", sub: "En el momento, antes de que se pierda. Copiar y pegar." }} right={{ label: "GESTO 2", title: "Lo mejorás:\nactualizalo.", sub: "Cada plantilla se afina con tu experiencia. Cada vez más tuya." }} /> },

  // — Crece con el curso —
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO SE QUEDA ACÁ" lines={[{ t: "Crece con" }, { t: "todo el curso.", a: true }]} sub="Prompts para tu marca, tu contenido, tus anunciantes. Al terminar, tenés una caja de herramientas con tu letra." art="rocket" variant="behind" artColor={GO} /> },

  // — Recuerdo —
  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="FIJEMOS LO DE HOY" title="Tres ideas para llevarte" items={["Un prompt que funcionó es una plantilla", "Los huecos: lo que cambia, entre corchetes", "Ordenás por roles: un estante cada uno"]} /> },

  // — Tarea —
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Abrí “Mi biblioteca\nde prompts”."} plate={["Un prompt", "Un título", "Sus [huecos]"]} ex="Un documento nuevo. Guardá el prompt de la entrevista que convertimos en plantilla, con un título claro y sus huecos entre corchetes. Ya tenés tu biblioteca funcionando." /> },

  // — Cierre del módulo —
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CERRAMOS EL MÓDULO" lines={[{ t: "Sabés dirigir un equipo" }, { t: "de IA, no solo usarlo.", a: true }]} sub="Predecir, pedir con las cuatro piezas, conversar, repartir roles, y guardarlo en tu biblioteca." art="chip" variant="behind" /> },

  // — Puente a M3 —
  { audio: "s19.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={2} next={3} proxima="Módulo 3 · Verificación y credibilidad con IA" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_IA5 = totalFrames(SCENES_D);
export const ClaseIA5: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f25.mp3" caps={C as any} />;
