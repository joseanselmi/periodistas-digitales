import React from "react";
import { ClaseVideo, totalFrames, SceneDef, Statement, TwoUp, Equals, TaskCard, ProgressMap, ROADMAP } from "./lib/kit";
import D from "./dur/clase07.json";
import C from "./dur/clase07.caps.json";

// 0.7 — Lo que hace falta para lograrlo (Bienvenida, corta/motivacional). Voz Chris + subtítulos.
const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 12.55, render: (d) => <Statement dur={d} kicker="Antes de lo técnico" lines={[{ t: "Lo que hace falta" }, { t: "para lograrlo.", a: true }]} sub="El método te lo damos completo. Esto es lo que lo pone en movimiento." art="rocket" /> },
  { audio: "s2.wav", sec: 25.391, render: (d) => <TwoUp dur={d} kicker="Por qué AHORA" title="Nunca hubo mejor momento" left={{ l: "Antes", t: "La gente compraba el diario en el kiosco" }} right={{ l: "Ahora", t: "Vive en las redes, buscando en quién confiar" }} /> },
  { audio: "s3.wav", sec: 17.948, render: (d) => <Statement dur={d} kicker="Jugá el juego largo" lines={[{ t: "Pensá en meses," }, { t: "no en días.", a: true }]} sub="Los primeros pasos son de siembra. El largo plazo te pone por delante de la mayoría." art="growth" /> },
  { audio: "s4.wav", sec: 25.601, render: (d) => <Statement dur={d} kicker="Andá rápido" lines={[{ t: "Hacé, publicá," }, { t: "ajustá, seguí.", a: true }]} sub="Cada nota te da más experiencia. Así, sin trabarte, se construye tu medio." art="target" /> },
  { audio: "s5.wav", sec: 14.222, render: (d) => <Equals dur={d} kicker="La fórmula de los que llegan" title="Las dos, juntas" a="Paciencia para sostener" b="Velocidad para avanzar" result="Los que lo logran" /> },
  { audio: "s6.wav", sec: 10.344, render: (d) => <TaskCard dur={d} kicker="Tu tarea" label="Tomá la decisión" big={"Jugá a largo plazo\ny empezá rápido"} ex="Comprometételo con vos mismo, hoy." /> },
  { audio: "s7.wav", sec: 4.841, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={0} next={1} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_L07 = totalFrames(SCENES_D);
export const ClaseLograr: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase07.mp3" caps={C as any} />;
