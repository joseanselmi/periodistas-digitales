import React from "react";
import { ClaseVideo, totalFrames, SceneDef, Statement, Checklist, Quote, Timeline, TwoUp, ProgressMap, ROADMAP } from "./lib/kit";
import D02 from "./dur/clase02.json";
import C02 from "./dur/clase02.caps.json";

// 0.2 — layouts DISTINTOS a la 0.1: Checklist · Quote · Timeline · TwoUp (para no repetir)
const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 14.113152, render: (d) => <Statement dur={d} kicker="La pieza que falta" lines={[{ t: "Ya tenés el oficio." }, { t: "Ahora, la mentalidad.", a: true }]} sub="La única pieza que convierte tu oficio en un medio propio, y que depende solo de vos." art="news" /> },
  { audio: "s2.wav", sec: 15.259501, render: (d) => <Statement dur={d} kicker="La capa nueva" lines={[{ t: "El periodista que ya sos," }, { t: "al mando de su medio.", a: true }]} sub="Sumás una mirada nueva: la emprendedora. Llevar tu oficio por tu cuenta, con tu nombre al frente." art="rocket" /> },
  { audio: "s3.wav", sec: 15.253061, render: (d) => <Checklist dur={d} kicker="Lo que pasa a ser tuyo" items={["El rumbo", "Los temas", "El tono", "La visión"]} /> },
  { audio: "s4.wav", sec: 22.452154, render: (d) => <Quote dur={d} kicker="La habilidad que más vale" a="Lo que más se paga" b="es saber resolver." /> },
  { audio: "s5.wav", sec: 18.200091, render: (d) => <Statement dur={d} kicker="Los desafíos" lines={[{ t: "Cada desafío" }, { t: "te vuelve más capaz.", a: true }]} sub="Como a todo el que emprende. Y en cada uno tenés el curso, las herramientas y la IA de tu lado." art="growth" /> },
  { audio: "s6.wav", sec: 16.887891, render: (d) => <Timeline dur={d} kicker="El cómo" title="Se construye con constancia" steps={["Un paso hoy", "Cada día", "Con el tiempo", "Quién sos"]} /> },
  { audio: "s7.wav", sec: 16.892245, render: (d) => <TwoUp dur={d} kicker="Una parte solo para vos" title="Además de la práctica" left={{ l: "Libros", t: "Lecturas elegidas para tu mentalidad" }} right={{ l: "Videos", t: "Charlas y casos que te forman e inspiran" }} /> },
  { audio: "s8.wav", sec: 22.105079, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={0} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D02 as number[])[i] }));
export const TOTAL_FRAMES_T = totalFrames(SCENES_D);
export const ClaseTransformacion: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase02.mp3" caps={C02 as any} />;
