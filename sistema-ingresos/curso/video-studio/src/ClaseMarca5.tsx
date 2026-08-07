import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdList, EdTask } from "./lib/editorial";
import { HojaScene, RO } from "./lib/marca";
import D from "./dur/f45.json";

// 4.5 — El sistema de marca: coherencia + tu voz. Módulo 4 (ROSA). CIERRE del módulo.
// HERO PROPIO: LA COHERENCIA (piezas sueltas que encajan en una hoja de marca).
// Estructura LA COHERENCIA.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL ÚLTIMO PASO" lines={[{ t: "Cuatro piezas sueltas" }, { t: "no son una marca.", a: true }]} sub="Nombre, paleta, tipografía y logo. Una marca aparece cuando dejan de estar sueltas y trabajan juntas, siempre igual." variant="bare" size={112} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE CIERRA EL MÓDULO" lines={[{ t: "Convertir tus decisiones" }, { t: "en un sistema.", a: true }]} sub="Juntarlas en una sola hoja que te va a guiar para siempre, y sumarle la pieza que faltaba: tu voz." art="bulb" variant="behind" artColor={RO} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IDEA DE SIEMPRE" lines={[{ t: "La que venimos repitiendo:" }, { t: "la coherencia.", a: true }]} sub="Hoy la ponemos en el centro y le damos una forma concreta que puedas usar todos los días." art="target" variant="left" artColor={RO} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA QUE CIERRA" a="Una marca no es una pieza genial." b="Es pocas decisiones repetidas siempre igual." full /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DESDE TU LECTOR" lines={[{ t: "La coherencia es ayudarlo" }, { t: "a acordarse de vos.", a: true }]} sub="Si cada vez ve los mismos colores, la misma letra y el mismo tono, en su cabeza se arma una sola figura sólida: vos." art="people" variant="behind" artColor={RO} /> },

  { audio: "s6.wav", sec: 1, render: (d) => <HojaScene dur={d} kicker="TU HOJA DE MARCA" lines={["Una hoja:", "no decidís de nuevo."]} sub="El manual de identidad, en tu versión modesta: una sola página con tus decisiones, para no volver a dudarlas nunca." piezas={3} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARA QUÉ SIRVE" lines={[{ t: "Mirás tu hoja" }, { t: "y usás lo que dice.", a: true }]} sub="La armás en un documento simple o en el mismo editor del logo. Cada vez que creás algo, no decidís de nuevo: tu marca, guardada afuera de tu cabeza." variant="bare" size={114} /> },

  { audio: "s8.wav", sec: 1, render: (d) => <HojaScene dur={d} kicker="LA PIEZA QUE FALTA" lines={["Tu marca", "también suena."]} sub="En las palabras que elegís y el trato que le das a tu lector. Dos medios con el mismo color se sienten distintos solo por cómo hablan." piezas={4} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TU VOZ" lines={[{ t: "Es cómo le" }, { t: "hablás a tu lector.", a: true }]} sub="Gran parte ya la definiste en el módulo anterior: sabés a quién le hablás y con qué mirada. Tu voz es la forma de hablarle a esa persona." art="chip" variant="left" artColor={RO} size={104} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SE DEFINE CON POCAS PALABRAS" lines={[{ t: "Cómo querés" }, { t: "sonar.", a: true }]} sub="De igual a igual o con distancia; cercano o técnico; con humor o sereno. Elegí tres o cuatro palabras: por ejemplo, cercana, clara, con humor, sin solemnidad." variant="bare" size={116} /> },

  { audio: "s11.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL TRUCO QUE LA VUELVE ÚTIL" a="Bajá tu voz a ejemplos:" b="dos frases de muestra, escritas como hablás." full /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y MUY ACTUAL" lines={[{ t: "Se las pasás a la IA," }, { t: "y escribe como vos.", a: true }]} sub="Le decís el tono y le pegás tus dos frases de muestra. Deja de sonar a robot genérico: suena a tu medio, porque le diste el ejemplo exacto." art="bulb" variant="behind" artColor={RO} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO TE ATA" lines={[{ t: "El sistema te libera" }, { t: "para el trabajo diario.", a: true }]} sub="Como el nombre, el color, la letra y la voz ya están resueltos, esa energía queda entera para lo que importa cada día: tu contenido." variant="bare" size={112} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <HojaScene dur={d} kicker="EL CASO · SOBREMESA" lines={["Todo tirando", "para el mismo lado."]} sub="Logo, colores con código, dos tipografías, y su voz en cuatro palabras con dos frases de muestra. Todo en una hoja." piezas={4} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE LOGRÓ" lines={[{ t: "Se siente Sobremesa," }, { t: "sin pensarlo.", a: true }]} sub="Cualquier cosa que publique sale de esa hoja, sin que lo piense cada vez. Eso, y no una pieza genial, es lo que hace que un lector la reconozca de lejos." art="growth" variant="left" artColor={RO} size={104} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA LLEVARTE" title="El cierre en tres ideas" items={["Una marca es repetir pocas decisiones simples", "La hoja de marca las guarda, para no dudar", "Tu voz es cómo hablás, y hasta le sirve a la IA"]} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Armá tu\nhoja de marca."} plate={["Logo + colores con código", "Tus tipografías", "Voz: palabras + frases"]} ex="Guardala donde la tengas siempre a mano. Es la brújula de todo lo que publiques de ahora en adelante." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Tu medio" }, { t: "ya tiene identidad.", a: true }]} sub="Nombre, color, tipografía, logo y voz, no como piezas sueltas, sino como un sistema coherente. Y esa identidad ya es tuya." variant="bare" size={118} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA ETAPA" a="Tenés todo lo que define a tu medio." b="Lo que sigue: montarlo online, su casa." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_M5 = totalFrames(SCENES_D);
export const ClaseMarca5: React.FC = () => <ClaseVideo scenes={SCENES_D} audioDir="f45" />;
