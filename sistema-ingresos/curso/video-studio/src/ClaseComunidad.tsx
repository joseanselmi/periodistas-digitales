import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaseVideo, totalFrames, SceneDef, Statement, Chips, Cards3, TaskCard, Quote, ProgressMap, ROADMAP, Scene, Kicker, useRise, accent, Snd, IComu, ICrecer, IIdea } from "./lib/kit";
import D04 from "./dur/clase04.json";
import C04 from "./dur/clase04.caps.json";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// --- a medida para esta clase: "tu equipo" (avatares que se suman en fila) ---
// Distinto del mapa de nodos radiales de la 0.3 (no repetir).
const TeamRow: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const people = 6;
  return (
    <Scene dur={dur}>
      <Kicker text="Por qué importa" />
      <div style={{ ...rise(14), fontSize: 78, fontWeight: 800, letterSpacing: -1.5, marginBottom: 60 }}>
        La comunidad es tu <span style={accent}>equipo</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 30 }}>
        {Array.from({ length: people }).map((_, i) => {
          const start = 26 + i * 9;
          const ap = interpolate(f - start, [0, 12], [0, 1], clamp);
          const me = i === people - 1;
          const R = me ? 128 : 108;
          return (
            <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 28}px) scale(${0.6 + 0.4 * ap})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Snd at={start} s="pop.wav" v={0.32} />
              <svg width={R} height={R} viewBox="0 0 100 100">
                <defs>
                  <clipPath id={`clip${i}`}><circle cx="50" cy="50" r="47" /></clipPath>
                  <linearGradient id="tgme" x1="0" x2="1"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#22d3ee" /></linearGradient>
                </defs>
                <circle cx="50" cy="50" r="47" fill={me ? "url(#tgme)" : "#141726"} stroke={me ? "none" : "#6366f1"} strokeWidth="3" style={me ? { filter: "drop-shadow(0 0 20px rgba(34,211,238,.55))" } : {}} />
                <g clipPath={`url(#clip${i})`} fill={me ? "#ffffff" : "#a5b4fc"}>
                  <circle cx="50" cy="41" r="15" />
                  <circle cx="50" cy="96" r="28" />
                </g>
              </svg>
              {me && <div style={{ fontSize: 26, fontWeight: 800, color: "#22d3ee", letterSpacing: 1 }}>VOS</div>}
            </div>
          );
        })}
      </div>
      <div style={{ ...rise(92, 20), fontSize: 34, color: "#b8b8c8", marginTop: 42, fontWeight: 300 }}>
        Rodearte de otros que están en la misma te sostiene y te empuja.
      </div>
    </Scene>
  );
};

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 12.713, render: (d) => <Statement dur={d} kicker="Antes de arrancar" lines={[{ t: "Antes de los fundamentos," }, { t: "la comunidad.", a: true }]} sub="Algo que puede cambiar tu experiencia entera en el curso." art="people" /> },
  { audio: "s2.wav", sec: 11.494, render: (d) => <TeamRow dur={d} /> },
  { audio: "s3.wav", sec: 11.552, render: (d) => <Chips dur={d} kicker="Qué vas a encontrar" title="Ahí adentro" chips={["Periodistas como vos", "Tus dudas resueltas", "Ideas y devoluciones", "Ánimo cuando cuesta"]} art="people" /> },
  { audio: "s4.wav", sec: 11.18, render: (d) => <Cards3 dur={d} kicker="Cómo sumarte" title="Entrá al grupo" cards={[{ icon: <IComu />, tag: "Preguntá", text: "Lo que necesites, cuando lo necesites" }, { icon: <ICrecer />, tag: "Mostrá", text: "Tu avance y lo que vas logrando" }, { icon: <IIdea />, tag: "Aprendé", text: "De lo que hacen los demás" }]} /> },
  { audio: "s5.wav", sec: 13.329, render: (d) => <Statement dur={d} kicker="Tu primer paso" lines={[{ t: "Apenas entres," }, { t: "presentate.", a: true }]} sub="Quién sos, sobre qué tema va tu medio, y qué te trajo. Con una frase alcanza." art="bulb" /> },
  { audio: "s6.wav", sec: 11.912, render: (d) => <Quote dur={d} kicker="Lo que vemos siempre" a="Acompañado," b="todo es más fácil." /> },
  { audio: "s7.wav", sec: 10.496, render: (d) => <TaskCard dur={d} kicker="Tu tarea" label="Entrá y presentate hoy" big="Presentate en el grupo" ex="Con una frase: quién sos y sobre qué tema va tu medio." /> },
  { audio: "s8.wav", sec: 13.827, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={0} next={1} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D04 as number[])[i] }));
export const TOTAL_FRAMES_C = totalFrames(SCENES_D);
export const ClaseComunidad: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase04.mp3" caps={C04 as any} />;
