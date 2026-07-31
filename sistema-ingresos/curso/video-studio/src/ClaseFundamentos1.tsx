import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaseVideo, totalFrames, SceneDef, Statement, Chips, TwoUp, TaskCard, ProgressMap, ROADMAP, Scene, Kicker, useRise, accent, Snd } from "./lib/kit";
import D from "./dur/m1c1.json";
import C from "./dur/m1c1.caps.json";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// componente a medida: el activo se acumula (barras que crecen)
const GrowthBars: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const bars = [28, 40, 52, 66, 82, 100];
  return (
    <Scene dur={dur}>
      <Kicker text="Lo mejor" />
      <div style={{ ...rise(14), fontSize: 80, fontWeight: 800, letterSpacing: -1.5, marginBottom: 50 }}>El activo se <span style={accent}>acumula</span></div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34, height: 330 }}>
        {bars.map((h, i) => {
          const start = 24 + i * 10;
          const p = interpolate(f - start, [0, 14], [0, 1], clamp);
          return (
            <div key={i} style={{ position: "relative", width: 150, height: "100%", display: "flex", alignItems: "flex-end" }}>
              <Snd at={start} s="pop.wav" v={0.35} />
              <div style={{ width: "100%", height: `${h * p}%`, borderRadius: "16px 16px 0 0", background: "linear-gradient(180deg,#22d3ee,#6366f1)", boxShadow: "0 0 26px rgba(34,211,238,.35)" }} />
            </div>
          );
        })}
      </div>
      <div style={{ ...rise(92, 16), fontSize: 30, color: "#8a8aa0", marginTop: 24, letterSpacing: 3, textTransform: "uppercase" }}>Un lector se queda y trae a otro &rarr;</div>
    </Scene>
  );
};

// M1.1 — layouts variados: Statement · Chips · TwoUp (hero) · GrowthBars (a medida) · TaskCard · ProgressMap(current=1)
const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 13.607, render: (d) => <Statement dur={d} kicker="Módulo 1 · Fundamentos" lines={[{ t: "Tu medio" }, { t: "es un activo.", a: true }]} sub="En la bienvenida vimos a dónde vamos. Ahora empezamos a construir, por el concepto que lo cambia todo." /> },
  { audio: "s2.wav", sec: 15.011, render: (d) => <Chips dur={d} kicker="Qué es un activo" title="Se arma una vez, rinde solo" chips={["Una casa que alquilás", "Una máquina que produce", "Un medio con audiencia"]} /> },
  { audio: "s3.wav", sec: 12.365, render: (d) => <TwoUp dur={d} kicker="El salto que vas a dar" title="Sueldo o activo" left={{ l: "Sueldo", t: "Cambiás tu tiempo: si parás, para" }} right={{ l: "Activo", t: "Trabaja para vos, aunque no estés" }} /> },
  { audio: "s4.wav", sec: 12.574, render: (d) => <Statement dur={d} kicker="El activo real" lines={[{ t: "No son los posteos." }, { t: "Es la confianza.", a: true }]} sub="La audiencia que te lee es lo que vale, lo que crece y lo que se monetiza de muchas formas." art="people" /> },
  { audio: "s5.wav", sec: 15.673, render: (d) => <GrowthBars dur={d} /> },
  { audio: "s6.wav", sec: 11.866, render: (d) => <Statement dur={d} kicker="El cambio" lines={[{ t: "Pensá como dueño," }, { t: "no como empleado.", a: true }]} sub="No corrés detrás del posteo de hoy: construís algo que dentro de un año vale mucho más." /> },
  { audio: "s7.wav", sec: 12.33, render: (d) => <TaskCard dur={d} kicker="Tu tarea" label="Definilo en una frase" big={"¿Qué activo estás\nconstruyendo?"} ex="Ej: un medio de confianza sobre tecnología para tu ciudad." /> },
  { audio: "s8.wav", sec: 12.55, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={1} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F1 = totalFrames(SCENES_D);
export const ClaseFundamentos1: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="m1c1.mp3" caps={C as any} />;
