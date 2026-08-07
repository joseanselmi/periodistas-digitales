import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask } from "./lib/editorial";
import { PruebaScene, RO } from "./lib/marca";
import D from "./dur/f41.json";

// 4.1 — La teoría del nombre: qué hace que se recuerde. Módulo 4 (ROSA).
// HERO PROPIO: LA PRUEBA DEL RECUERDO (un nombre pasa 4 pruebas que se encienden).
// Estructura LA PRUEBA DEL RECUERDO.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO PRIMERO QUE SE DICE" lines={[{ t: "El nombre:" }, { t: "la primera palabra.", a: true }]} sub="Lo primero que escucha tu lector, antes de un solo color o una sola línea. Lo primero que se dice y lo último que se olvida." variant="bare" size={118} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VAS A LOGRAR HOY" lines={[{ t: "Saber qué hace" }, { t: "que se recuerde.", a: true }]} sub="Para mirar cualquier idea que se te ocurra y saber si tiene con qué quedarse en la cabeza de la gente." art="bulb" variant="behind" artColor={RO} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LLEGAMOS EN ORDEN" lines={[{ t: "El nombre" }, { t: "sale del nicho.", a: true }]} sub="No se inventa en el aire: nace de saber muy bien de qué se trata tu medio y a quién le habla. Todo eso ya lo tenés." art="target" variant="left" artColor={RO} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="SIN MITOS" a="Un gran nombre no es un golpe de genio." b="Es cumplir bien con pocas cosas simples." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <PruebaScene dur={d} kicker="SU ÚNICO TRABAJO" lines={["Quedarse", "en la memoria."]} sub="De una persona ocupada que lo escuchó una vez al pasar. Lo que ayuda a eso, suma. Son cuatro pruebas." activa={0} /> },

  { audio: "s6.wav", sec: 1, render: (d) => <PruebaScene dur={d} kicker="PRUEBA UNO" lines={["Se dice", "fácil."]} sub="Entra por el oído antes que por los ojos. Se dice de un tirón, sin tomar aire en el medio, y suena bien en voz alta." activa={1} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL TEST, LITERAL" lines={[{ t: "Decilo" }, { t: "en voz alta.", a: true }]} sub="Como si se lo contaras a un amigo en un café. Si sale redondo, vas bien. Cuanto más fácil de decir, más veces lo dicen por vos." variant="bare" size={116} /> },

  { audio: "s8.wav", sec: 1, render: (d) => <PruebaScene dur={d} kicker="PRUEBA DOS" lines={["Se escribe", "como suena."]} sub="Cuando a alguien le gusta tu medio, te busca: escribe tu nombre en un teclado. Si se escribe tal como suena, te encuentra a la primera." activa={2} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR QUÉ IMPORTAN LAS DOS" a="Que se diga fácil hace que te nombren." b="Que se escriba fácil hace que te encuentren." full /> },

  { audio: "s10.wav", sec: 1, render: (d) => <PruebaScene dur={d} kicker="PRUEBA TRES" lines={["Dice algo,", "o se llena."]} sub="Dos caminos válidos: el que ya dice de qué se trata, o la palabra limpia que se carga de tu sentido con el tiempo." activa={3} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "DESCRIPTIVO", title: "Explica\nsolo.", sub: "Desde el primer día se entiende de qué va. Trabaja gratis." }} right={{ label: "EN BLANCO", title: "Se llena\ncon vos.", sub: "Arranca limpio y pasa a significar lo que hiciste con él." }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO ELEGÍS" lines={[{ t: "Cuánto explicás," }, { t: "cuánto construís.", a: true }]} sub="Si querés que se entienda ya, andá por el descriptivo. Si tenés una palabra que amás y le das tiempo, andá por la limpia." art="chip" variant="behind" artColor={RO} /> },

  { audio: "s13.wav", sec: 1, render: (d) => <PruebaScene dur={d} kicker="PRUEBA CUATRO" lines={["Es tuyo:", "está libre."]} sub="Un nombre es tuyo cuando confirmás que podés usarlo sin pisarte con nadie. Cómo chequearlo, en la próxima clase." activa={4} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UNA IDEA LARGA", title: "Guía... \nIndependiente", sub: "Serio, pero largo. No se dice de un tirón. Cae en la primera prueba." }} right={{ label: "UNA IDEA CORTA", title: "Sobremesa", sub: "Se dice de corrido, se escribe sin trampa, y evoca el bodegón." }} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CASO · SOBREMESA" lines={[{ t: "Tres pruebas," }, { t: "con claridad.", a: true }]} sub="Suena, se escribe, y dice algo sin explicar de más. Le queda pendiente la de disponibilidad, la próxima clase." art="growth" variant="left" artColor={RO} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA LLEVARTE" title="Las cuatro pruebas" items={["Se dice fácil y suena bien", "Se escribe tal como suena", "Dice algo, o es palabra limpia lista para llenarse", "Está libre para ser tuyo"]} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Tres nombres\nque admirás."} plate={["¿Se dice fácil?", "¿Se escribe igual?", "¿Dice algo?"]} ex="Pasalos por las tres primeras pruebas. La cuarta, la de disponibilidad, guardala para tu propio nombre." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "El nombre dejó" }, { t: "de ser una lotería.", a: true }]} sub="Tenés cuatro pruebas claras para mirar cualquier idea de frente y saber si tiene con qué." variant="bare" size={116} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Ya tenés la vara." b="Ahora generamos tu nombre con la IA." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_M1 = totalFrames(SCENES_D);
export const ClaseMarca1: React.FC = () => <ClaseVideo scenes={SCENES_D} audioDir="f41" />;
