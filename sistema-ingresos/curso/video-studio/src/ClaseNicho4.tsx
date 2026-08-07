import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI } from "./lib/editorial";
import { PuertasScene } from "./lib/nicho";
import D from "./dur/f54.json";
import C from "./dur/f54.caps.json";

// 5.4 — Tu ángulo único. Módulo 5 (VIOLETA).
// HERO PROPIO: LAS PUERTAS (el mismo tema; tu puerta de entrada se ilumina).
// Estructura EL MISMO TEMA, OTRA PUERTA.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="MISMA INFO, MISMOS HECHOS" lines={[{ t: "Diez cubren lo mismo." }, { t: "A una la siguen.", a: true }]} sub="¿Qué tiene esa que no tienen las otras nueve?" variant="bare" size={120} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="NO ES MÁS INFORMACIÓN" lines={[{ t: "Es un" }, { t: "ángulo.", a: true }]} sub="Una manera propia de mirar y contar, que la hace reconocible entre todas." art="target" variant="behind" artColor={VI} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA DEL CAMINO" lines={[{ t: "Si ya hay gente," }, { t: "¿por qué a vos?", a: true }]} sub="La respuesta no es “lo hago mejor”. Es “lo hago distinto, desde un lugar que los demás no ocupan”." art="people" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA CENTRAL" a="El ángulo no cambia el tema." b="Cambia la puerta por la que entrás." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <PuertasScene dur={d} kicker="LA CASA Y LAS PUERTAS" lines={["Todos hablan de", "la misma casa."]} sub="Pero cada uno entra por una puerta distinta, y desde ahí la casa se ve como nadie más la muestra." mia={1} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE DÓNDE SALE · TU EXPERIENCIA" lines={[{ t: "No solo un oficio" }, { t: "con delantal.", a: true }]} sub="Los años siguiendo un tema, conocer a los protagonistas, tu forma de explicar: todo eso es experiencia." art="bulb" variant="left" artColor={VI} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdList dur={d} kicker="Y OTRAS VETAS DEL ÁNGULO" title="De dónde más puede salir" items={["Tu mirada: lo que a otros se les pasa", "Un público más fino que nadie atiende", "Una postura, por contraste"]} /> },

  { audio: "s8.wav", sec: 1, render: (d) => <PuertasScene dur={d} kicker="EL MÉTODO · MIRÁ EL HUECO" lines={["¿Qué NO están", "haciendo los demás?"]} sub="A quién no le hablan, qué tono falta, qué preguntas nadie responde bien. Ese hueco es tu puerta." mia={1} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN HUECO, NO UN POZO" lines={[{ t: "Un rincón desatendido" }, { t: "en una casa con gente.", a: true }]} sub="El hueco está dentro de un nicho que ya validaste. Si no hay demanda por ningún lado, es una zona sin público." art="target" variant="behind" artColor={VI} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="APRETALO EN UNA FRASE" lines={[{ t: "Para quién, sobre qué," }, { t: "con qué vuelta propia.", a: true }]} sub="Si es una frase que ningún competidor podría firmar igual, lo tenés. Si cualquiera la firma, afiná más." variant="bare" size={112} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SIN TRABARTE" lines={[{ t: "El del día uno no" }, { t: "tiene que ser perfecto.", a: true }]} sub="Es una apuesta con fundamento que vas afinando. Muchas veces el ángulo definitivo aparece con el tiempo." art="growth" variant="left" artColor={VI} /> },

  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CASO · MIRA EL HUECO" lines={[{ t: "La otra cuenta:" }, { t: "solo fotos y dirección.", a: true }]} sub="No cuenta quién está detrás, no tiene voz, le habla a cualquiera. Y ella conoce a los dueños." art="screen" variant="behind" artColor={VI} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <PuertasScene dur={d} kicker="EL CASO · SU PUERTA" lines={["Las historias de", "las familias, de adentro."]} sub="El mismo nicho que sus competidores, pero una puerta que solo ella puede abrir. Deja de competir." mia={1} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdList dur={d} kicker="QUEDATE CON ESTO" title="Tu ángulo, en tres" items={["No es el tema: es tu puerta de entrada", "Sale de tu experiencia, mirada o postura", "Lo encontrás en el hueco de los que ya están"]} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Tu ángulo,\nen una frase."} plate={["Mirá 3 huecos", "Para quién / qué / vuelta"]} ex="Anotá tres cosas que los otros no hacen. Después escribí tu ángulo con la fórmula: para quién, sobre qué, con qué vuelta propia." /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PRUEBA" lines={[{ t: "Una frase que solo" }, { t: "vos podrías firmar.", a: true }]} sub="No tiene que quedar perfecta. Cuando la tengas, aunque sea en borrador, ya no sos uno más." variant="bare" size={116} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Encontraste tu" }, { t: "lugar propio.", a: true }]} sub="No ganás con más información: con un ángulo que nace de lo que solo vos tenés. Empezás a ser el único en algo." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Apareció una palabra: para quién." b="Vamos a dibujar a tu lector." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N4 = totalFrames(SCENES_D);
export const ClaseNicho4: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f54.mp3" caps={C as any} />;
