import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaseVideo, totalFrames, SceneDef, Statement, JourneyMap, Terminal, ProgressMap, ROADMAP, Scene, Kicker, useRise, accent, Snd, SideArt } from "./lib/kit";
import D03 from "./dur/clase03.json";
import C03 from "./dur/clase03.caps.json";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// --- a medida para esta clase (innovación / no repetir) ---
const Flow3: React.FC<{ dur: number }> = ({ dur }) => {
  const rise = useRise();
  const steps = ["Mirá", "Entendé", "Aplicá"];
  return (
    <Scene dur={dur}>
      <SideArt name="screen" />
      <Kicker text="Cómo es cada clase" />
      <div style={{ ...rise(14), fontSize: 80, fontWeight: 800, letterSpacing: -1.5, marginBottom: 64 }}>Mirá, entendé, y aplicá</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ ...rise(26 + i * 14, 40) }}>
              <Snd at={26 + i * 14} s="pop.wav" v={0.4} />
              <div style={{ fontSize: 46, fontWeight: 800, padding: "42px 58px", borderRadius: 20, background: "linear-gradient(160deg,rgba(99,102,241,.22),rgba(19,21,38,.7))", border: "1px solid rgba(34,211,238,.4)", boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>{s}</div>
            </div>
            {i < steps.length - 1 && <div style={{ ...rise(34 + i * 14), fontSize: 64, color: "#22d3ee", textShadow: "0 0 16px #22d3ee" }}>&rarr;</div>}
          </React.Fragment>
        ))}
      </div>
    </Scene>
  );
};

const WeekRhythm: React.FC<{ dur: number }> = ({ dur }) => {
  const rise = useRise();
  const f = useCurrentFrame();
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const active = [2, 3];
  return (
    <Scene dur={dur}>
      <Kicker text="El ritmo" />
      <div style={{ ...rise(14), fontSize: 80, fontWeight: 800, letterSpacing: -1.5, marginBottom: 56 }}>1 o 2 clases por <span style={accent}>semana</span></div>
      <div style={{ display: "flex", gap: 26 }}>
        {days.map((d, i) => {
          const on = active.includes(i);
          const start = 26 + i * 6;
          const ap = interpolate(f - start, [0, 8], [0, 1], clamp);
          return (
            <div key={i} style={{ opacity: ap, transform: `scale(${0.7 + 0.3 * ap})`, width: 120, height: 120, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 800, color: on ? "#fff" : "#6a6a80", background: on ? "linear-gradient(135deg,#6366f1,#22d3ee)" : "rgba(255,255,255,.04)", border: on ? "none" : "1px solid rgba(255,255,255,.1)", boxShadow: on ? "0 0 30px rgba(34,211,238,.4)" : "none" }}>{d}</div>
          );
        })}
      </div>
      <div style={{ ...rise(80, 20), fontSize: 34, color: "#b8b8c8", marginTop: 40, fontWeight: 300 }}>Con constancia, en un par de meses ya tenés tu medio andando.</div>
    </Scene>
  );
};

const CommunityNodes: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const c = { x: 960, y: 660 };
  const around = [{ x: 560, y: 500 }, { x: 1360, y: 500 }, { x: 520, y: 800 }, { x: 1400, y: 800 }, { x: 960, y: 420 }];
  return (
    <Scene dur={dur} justify="flex-start">
      <div style={{ marginTop: 20 }}><Kicker text="No estás solo" /></div>
      <div style={{ ...rise(14), fontSize: 74, fontWeight: 800, letterSpacing: -1.5 }}>Comunidad y soporte</div>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="cn" x1="0" x2="1"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        {around.map((a, i) => { const dl = interpolate(f, [26 + i * 8, 44 + i * 8], [0, 1], clamp); return <line key={i} x1={c.x} y1={c.y} x2={a.x} y2={a.y} stroke="#22d3ee" strokeOpacity={0.45} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dl} style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />; })}
        {around.map((a, i) => { const ap = interpolate(f, [32 + i * 8, 46 + i * 8], [0, 1], clamp); return <circle key={i} cx={a.x} cy={a.y} r={40 * ap} fill="#141726" stroke="#6366f1" strokeWidth={3} />; })}
        <circle cx={c.x} cy={c.y} r={66} fill="url(#cn)" style={{ filter: "drop-shadow(0 0 24px rgba(34,211,238,.5))" }} />
        <text x={c.x} y={c.y + 11} fill="#fff" fontSize={30} fontWeight={800} textAnchor="middle" fontFamily="Segoe UI">VOS</text>
      </svg>
    </Scene>
  );
};

const PROMPT = "Actuá como editor de un medio. Dame 8 titulares de alto impacto para esta noticia: [pegá tu nota]. Cortos, con gancho y sin clickbait.";

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 13.337868, render: (d) => <Statement dur={d} kicker="Cómo aprovechar el curso" lines={[{ t: "Que cada minuto" }, { t: "se te vuelva resultado.", a: true }]} sub="Ya sabés a dónde vamos y con qué mentalidad. Ahora, cómo sacarle el máximo." art="target" /> },
  { audio: "s2.wav", sec: 15.487438, render: (d) => <JourneyMap dur={d} kicker="El curso es un mapa" title="Cada módulo, una parada" stops={ROADMAP} /> },
  { audio: "s3.wav", sec: 15.950612, render: (d) => <Flow3 dur={d} /> },
  { audio: "s4.wav", sec: 13.883220, render: (d) => <Terminal dur={d} kicker="La parte de IA" title="Prompts listos para copiar" file="prompt-titular.txt" prompt={PROMPT} /> },
  { audio: "s5.wav", sec: 12.810113, render: (d) => <WeekRhythm dur={d} /> },
  { audio: "s6.wav", sec: 12.832109, render: (d) => <Statement dur={d} kicker="La clave" lines={[{ t: "El que hace," }, { t: "se lo lleva.", a: true }]} sub="El curso te da el camino. El resultado se construye haciendo las tareas." art="growth" /> },
  { audio: "s7.wav", sec: 11.794014, render: (d) => <CommunityNodes dur={d} /> },
  { audio: "s8.wav", sec: 13.486757, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={0} next={1} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D03 as number[])[i] }));
export const TOTAL_FRAMES_A = totalFrames(SCENES_D);
export const ClaseAprovechar: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase03.mp3" caps={C03 as any} />;
