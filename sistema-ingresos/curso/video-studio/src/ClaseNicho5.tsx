import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI } from "./lib/editorial";
import { AvatarScene } from "./lib/nicho";
import D from "./dur/f55.json";
import C from "./dur/f55.caps.json";

// 5.5 — Tu lector ideal: construí el avatar. Módulo 5 (VIOLETA).
// HERO PROPIO: EL AVATAR (una ficha de lector que se completa: quién/duele/desea/habla).
// Estructura EL RETRATO.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ESCRIBIR PARA UNA AUDIENCIA" lines={[{ t: "Es escribir" }, { t: "para una nube.", a: true }]} sub="Una masa borrosa, sin cara. Te sale un texto de nube: general, tibio, para cualquiera." variant="bare" size={122} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ESCRIBIR PARA UNA PERSONA" lines={[{ t: "Tu texto cambia" }, { t: "solo: directo, cálido.", a: true }]} sub="Alguien con nombre, con un problema, con una manera de hablar. Hoy la construimos." art="people" variant="behind" artColor={VI} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PIEZA PENDIENTE" lines={[{ t: "En tu ángulo apareció:" }, { t: "para quién.", a: true }]} sub="Tu nicho tiene dos mitades: un tema, y una gente. Ya trabajaste el tema; falta la gente." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SE LLAMA" lines={[{ t: "Tu lector ideal." }, { t: "Tu avatar.", a: true }]} sub="Ponerle cara, nombre y voz a la gente para la que escribís." variant="bare" size={124} /> },

  { audio: "s5.wav", sec: 1, render: (d) => <AvatarScene dur={d} kicker="LA IDEA CENTRAL" lines={["Una persona,", "y le escribís a ella."]} sub="El cerebro no sabe hablarle a diez mil; sabe hablarle a una. Y las que se parecen se sienten incluidas." piezas={4} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UN GRUPO DEMOGRÁFICO", title: "Información\nmuerta.", sub: "“Mujeres 25-40, de ciudad.” No te dice cómo empezar." }} right={{ label: "UNA PERSONA CONCRETA", title: "Información\nviva.", sub: "“Ana, 34, llega cansada.” Ya sabés qué decirle y con qué tono." }} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿VARIOS LECTORES?" lines={[{ t: "Elegí uno:" }, { t: "el principal.", a: true }]} sub="Vas a tener secundarios, pero escribís pensando en uno. Contentar a todos es no llegarle a ninguno." art="target" variant="left" artColor={VI} /> },

  { audio: "s8.wav", sec: 1, render: (d) => <AvatarScene dur={d} kicker="PIEZA 1 · QUIÉN ES" lines={["Una foto", "de su día."]} sub="Su situación concreta: edad, momento de vida, el contexto donde se cruza con tu tema." piezas={1} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <AvatarScene dur={d} kicker="PIEZAS 2 Y 3 · DUELE Y DESEA" lines={["Su dolor", "y su deseo."]} sub="El dolor lo empuja, el deseo lo atrae. Si sabés qué le duele, sabés de qué escribir." piezas={3} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <AvatarScene dur={d} kicker="PIEZA 4 · CÓMO HABLA" lines={["Sus palabras", "exactas."]} sub="No “soluciones de gastronomía accesible”: “un lugar bueno y barato”. Con las suyas, siente que lo leés por dentro." piezas={4} /> },

  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO LO ADIVINÁS" lines={[{ t: "Las preguntas de los grupos" }, { t: "son su dolor, en sus palabras.", a: true }]} sub="Volvé a validar y copiá lo que dicen. Con ocho o diez comentarios que repitan el mismo dolor, ya tenés base." art="people" variant="behind" artColor={VI} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IA TE ORDENA" lines={[{ t: "Le pasás lo real," }, { t: "te arma el borrador.", a: true }]} sub="Pero es punto de partida, no la verdad: lo confirmás contra lo que viste con tus ojos." variant="bare" size={116} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SE VUELVE TU FILTRO" lines={[{ t: "¿Le sirve? ¿Está" }, { t: "en su lenguaje?", a: true }]} sub="Dos preguntas antes de publicar. Como el ángulo, el avatar se va afinando con el tiempo." art="bulb" variant="behind" artColor={VI} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <AvatarScene dur={d} kicker="EL CASO · SOFÍA" lines={["Nombre, dolor,", "deseo y sus frases."]} sub="Sofía, 38, cuida cada peso, cansada de gastar mal, quiere lugares buenos y baratos. “Que no te fundás.”" piezas={4} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UN AVATAR FLOJO", title: "“El que quiere\ncomer bien.”", sub: "Sin edad, sin bolsillo, sin una palabra suya. No sabés cómo hablarle." }} right={{ label: "SOFÍA", title: "Viva, con\nsus frases.", sub: "Cuatro piezas y su lenguaje: te dice cómo hablarle." }} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="FIJEMOS LO DE HOY" title="Tres para llevarte" items={["A una persona, no a un grupo", "Cuatro piezas: quién, duele, desea, habla", "Sale de las palabras reales de tu validación"]} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Construí\ntu avatar."} plate={["Nombre", "Quién / duele / desea", "Sus frases exactas"]} ex="Abrí una hoja, ponele nombre y respondé las cuatro piezas, usando las palabras reales de los grupos." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y HACÉ UNA PRUEBA" lines={[{ t: "Escribile un mensaje," }, { t: "como a un amigo.", a: true }]} sub="Colgala donde la veas al trabajar. Vas a notar lo distinto que suena tu voz con alguien del otro lado." art="screen" variant="behind" artColor={VI} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE CAMBIÓ" a="Tu lector dejó de ser una nube." b="Ahora tu voz sabe a quién hablarle." full /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="YA TENÉS EL CORAZÓN" lines={[{ t: "Tema, ángulo" }, { t: "y lector.", a: true }]} sub="Falta juntarlos en una promesa clara y una línea firme. Eso cierra el módulo." art="chip" variant="left" artColor={VI} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA ÚLTIMA" a="Tu propuesta editorial" b="y tu línea." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N5 = totalFrames(SCENES_D);
export const ClaseNicho5: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f55.mp3" caps={C as any} />;
