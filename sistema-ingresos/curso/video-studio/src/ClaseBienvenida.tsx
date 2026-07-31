import React from "react";
import { ClaseVideo, totalFrames, FPS, SceneDef, Statement, Equals, Chips, Cards3, Stat, TaskCard, ProgressMap, ROADMAP, IIdea, IComu, ICrecer } from "./lib/kit";

import D01 from "./dur/clase01.json";
import C01 from "./dur/clase01.caps.json";

const RECORRIDO = ["Bienvenida", "Fundamentos", "Tu medio", "Contenido", "Monetización", "Escala"];

export { FPS };

// 0.1 — layouts variados: Statement · Equals · Chips · Stat(count-up) · Cards3 · TaskCard
const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 18.234467, render: (d) => <Statement dur={d} kicker="Módulo 0 · Bienvenida" lines={[{ t: "Bienvenido." }]} sub="Diste un paso que la mayoría no da. Estás en el lugar y el momento indicados para lograrlo." art="bulb" /> },
  { audio: "s2.wav", sec: 20.007166, render: (d) => <Statement dur={d} kicker="Lo que vamos a construir" lines={[{ t: "Tu medio, como una" }, { t: "máquina que trabaja para vos.", a: true }]} sub="Un periódico digital de nicho que informa, crece, y genera ingresos mientras crece." art="growth" /> },
  { audio: "s3.wav", sec: 20.173651, render: (d) => <Equals dur={d} kicker="Qué es un periódico digital" a="Instagram profesional" b="Página de Facebook" result="Tu medio de noticias" /> },
  { audio: "s4.wav", sec: 17.034875, render: (d) => <Statement dur={d} kicker="Tu ventaja" lines={[{ t: "Ya sos periodista." }, { t: "Esa es la parte difícil.", a: true }]} sub="Elegir la noticia, escribir el título, contar la historia. A los demás les lleva años; vos ya la tenés." art="news" /> },
  { audio: "s5.wav", sec: 23.742268, render: (d) => <Chips dur={d} kicker="Tu diferencial" title="Tu equipo de inteligencia artificial" chips={["Titulares", "Imágenes", "Diseños", "Desde cero, sin saber nada"]} art="chip" /> },
  { audio: "s6.wav", sec: 22.795873, render: (d) => <Chips dur={d} kicker="De dónde salen los ingresos" title="Varios caminos, no uno solo" chips={["Afiliados de tu nicho", "Anunciantes locales", "Marcas", "Tus propios productos"]} art="coins" /> },
  { audio: "s7.wav", sec: 14.270249, render: (d) => <Stat dur={d} kicker="De dónde partís · a dónde llegás" to={30} unit="días" sub="para tener tu medio funcionando, con comunidad y tu primera vía de ingresos" /> },
  { audio: "s8.wav", sec: 14.308934, render: (d) => <Cards3 dur={d} kicker="Cómo está hecho el curso" title="Todo es hacer" cards={[{ icon: <IIdea />, tag: "Entendés", text: "Clases cortas: el porqué" }, { icon: <IComu />, tag: "Hacés", text: "Tutorial en pantalla, paso a paso" }, { icon: <ICrecer />, tag: "Aplicás", text: "Prompts listos para copiar y pegar" }]} /> },
  { audio: "s9.wav", sec: 22.086077, render: (d) => <Statement dur={d} kicker="Tu parte" lines={[{ t: "Yo pongo las herramientas." }, { t: "Vos ponés la presencia.", a: true }]} sub="Ver las clases, hacer las tareas, sostener. El resto lo construimos juntos." art="people" /> },
  { audio: "s10.wav", sec: 19.995465, render: (d) => <TaskCard dur={d} kicker="Tu primera acción" label="Antes de seguir" big={"Definí tu meta a 30 días\ny escribila."} ex="Ejemplo: publicar 3 veces por semana y llegar a tus primeros 500 lectores." /> },
  { audio: "s11.wav", sec: 22.152698, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={0} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D01 as number[])[i] }));
export const TOTAL_FRAMES = totalFrames(SCENES_D);
export const ClaseBienvenida: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase01.mp3" caps={C01 as any} />;
