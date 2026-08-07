import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdList, EdTask } from "./lib/editorial";
import { PaletaScene, RO } from "./lib/marca";
import D from "./dur/f43.json";

// 4.3 — Tu color: qué transmite y cómo armás tu paleta. Módulo 4 (ROSA).
// HERO PROPIO: LA EMOCIÓN DEL COLOR (una paleta que se arma: principal + acento + neutros).
// Estructura LA EMOCIÓN DEL COLOR.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ANTES DE LEERTE" lines={[{ t: "Tu lector" }, { t: "ya sintió algo.", a: true }]} sub="Por el color. Antes de entender de qué se trata, el color ya le sopló si esto es serio o relajado, cálido o técnico, para él o para otro." variant="bare" size={118} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VAS A MANEJAR HOY" lines={[{ t: "Qué le dice" }, { t: "cada color.", a: true }]} sub="Y cómo armar una paleta simple, de pocos colores a propósito, que haga que tu medio se sienta tuyo apenas lo ven." art="bulb" variant="behind" artColor={RO} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL COMPAÑERO DEL NOMBRE" lines={[{ t: "El nombre, por el oído." }, { t: "El color, por el ojo.", a: true }]} sub="Y tu nombre ya te da pistas del color. Sobremesa, cálido y de bodegón, te pide tonos con temperatura, no un celeste frío." art="target" variant="left" artColor={RO} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA QUE ORDENA" a="El color no es decoración." b="Es comunicación." full /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y EN MARCA" lines={[{ t: "Muy pocos colores," }, { t: "con intención.", a: true }]} sub="Una marca que usa dos o tres colores siempre iguales se vuelve reconocible; una que usa diez no se recuerda con ninguno." art="chip" variant="behind" artColor={RO} /> },

  { audio: "s6.wav", sec: 1, render: (d) => <EdList dur={d} kicker="QUÉ DESPIERTA CADA FAMILIA" title="Un punto de partida compartido" items={["Rojo y naranja: calor, energía, apetito", "Azul: confianza, seriedad, calma", "Verde: naturaleza, salud, lo fresco", "Tonos tierra: lo artesanal, cálido, casero"]} /> },

  { audio: "s7.wav", sec: 1, render: (d) => <PaletaScene dur={d} kicker="PIEZA UNO" lines={["El principal:", "el protagonista."]} sub="El que más se va a ver, el que la gente va a asociar con vos. Define el clima de todo." piezas={1} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <PaletaScene dur={d} kicker="PIEZA DOS" lines={["El acento:", "la sal."]} sub="Uno solo, distinto, que usás poco y a propósito. En poca cantidad resalta todo; de más, arruina el plato." piezas={2} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <PaletaScene dur={d} kicker="Y LOS NEUTROS" lines={["El escenario", "tranquilo."]} sub="Un oscuro para los textos y un claro para los fondos. Son el escenario donde tus dos colores pueden brillar." piezas={4} /> },

  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO ELEGÍS LOS TUYOS" lines={[{ t: "Empezá por el principal:" }, { t: "la emoción.", a: true }]} sub="Preguntate qué querés que sienta tu lector al llegar, buscá esa emoción entre las familias, y ahí está tu color." art="target" variant="left" artColor={RO} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y SI DUDÁS" a="Pedile a la IA tres combinaciones." b="No para que decida: para ver opciones ordenadas." full /> },

  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE LO HACE FUNCIONAR" lines={[{ t: "Una sola palabra:" }, { t: "repetir.", a: true }]} sub="Cada vez que publicás con tu color principal, sumás un ladrillo al reconocimiento. Con el tiempo, ven tu color sin tu nombre y ya saben que sos vos." art="chip" variant="behind" artColor={RO} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CÓDIGO EXACTO" lines={[{ t: "Cada color tiene" }, { t: "su matrícula.", a: true }]} sub="Un código corto que arranca con el numeral y sigue con seis caracteres: el hexadecimal. Lo copiás del editor de diseño, o se lo pedís a la IA junto con cada combinación." variant="bare" size={104} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <PaletaScene dur={d} kicker="EL CASO · SOBREMESA" lines={["Vino, dorado", "y dos neutros."]} sub="Principal: un vino cálido de almuerzo largo. Acento: un dorado suave, poco. Neutros: un marrón casi negro y un crema de mantel de papel." piezas={4} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL PODER DE ELEGIR POCO" lines={[{ t: "Con solo escucharlo," }, { t: "ya ves su medio.", a: true }]} sub="Pocos colores, elegidos con intención, decididos a repetirse siempre. Eso es la teoría del color puesta a trabajar." art="growth" variant="left" artColor={RO} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA LLEVARTE" title="La paleta en tres ideas" items={["El color comunica antes que las palabras", "Simple: un principal, un acento, y neutros", "La fuerza está en repetir siempre los mismos"]} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Armá\ntu paleta."} plate={["Principal: la emoción", "Un acento de contraste", "Dos neutros"]} ex="Anotá los cuatro colores con su código exacto. Esa notita es la primera página del manual de tu marca." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Tu medio ya tiene" }, { t: "temperatura.", a: true }]} sub="El color habla solo, con muy pocos alcanza, y la magia está en repetirlos siempre. Nombre y color: empieza a tener cara." variant="bare" size={116} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Falta la letra con la que va a hablar." b="Y un logo, sin ningún diseñador." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_M3 = totalFrames(SCENES_D);
export const ClaseMarca3: React.FC = () => <ClaseVideo scenes={SCENES_D} audioDir="f43" />;
