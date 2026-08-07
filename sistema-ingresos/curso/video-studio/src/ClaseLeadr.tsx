import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaseVideo, totalFrames, SceneDef, Statement, TaskCard, Timeline, Scene, Kicker, useRise, accent, Snd } from "./lib/kit";
import D06 from "./dur/clase06.json";
import C06 from "./dur/clase06.caps.json";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// --- marca Leadr (fiel a la plataforma real) ---
const LC = { card: "#0F172A", card2: "#0A0F1E", cyan: "#22d3ee", violet: "#a78bfa", slate: "#1e293b", text: "#e2e8f0", dim: "#94a3b8" };

const Logo: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: LC.cyan, display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 800, fontSize: size * 0.52 }}>L</div>
    <span style={{ fontWeight: 800, fontSize: size * 0.62, color: "#fff" }}>Leadr</span>
  </div>
);

// ventana tipo navegador con la barra leadr.cloud
const Win: React.FC<{ children: React.ReactNode; url?: string; w?: number }> = ({ children, url = "leadr.cloud", w = 1180 }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(10), width: w, maxWidth: "90%", background: LC.card, border: `1px solid ${LC.slate}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 34px 90px rgba(0,0,0,.55)" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", background: LC.card2, borderBottom: `1px solid ${LC.slate}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
        </div>
        <div style={{ marginLeft: 16, background: "#020617", border: `1px solid ${LC.slate}`, borderRadius: 8, padding: "6px 18px", color: LC.dim, fontSize: 20 }}>{url}</div>
      </div>
      <div style={{ padding: 30 }}>{children}</div>
    </div>
  );
};

// S2 — qué es Leadr
const LeadrIntro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  return (
    <Scene dur={dur}>
      <Kicker text="Qué es Leadr" />
      <div style={{ ...rise(14), marginBottom: 28 }}><Logo size={72} /></div>
      <div style={{ ...rise(24), fontSize: 46, fontWeight: 700, color: LC.text, marginBottom: 46, textAlign: "center" }}>Tu plataforma de <span style={accent}>IA para periodistas</span></div>
      <div style={{ display: "flex", gap: 22 }}>
        {["Clases", "Prompts", "Recursos"].map((t, i) => {
          const ap = interpolate(f - (42 + i * 10), [0, 10], [0, 1], clamp);
          return <div key={i} style={{ opacity: ap, transform: `scale(${0.85 + 0.15 * ap})`, padding: "22px 44px", borderRadius: 16, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.32)", fontSize: 36, fontWeight: 700, color: "#fff" }}><Snd at={42 + i * 10} s="pop.wav" v={0.3} />{t}</div>;
        })}
      </div>
    </Scene>
  );
};

// S3 — cómo acceder (3 pasos reales de /acceso)
const AccessSteps: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const steps = [
    ["01", "Revisá tu email", "Te llega “Activá tu cuenta”"],
    ["02", "Creá tu contraseña", "Con el link del email"],
    ["03", "Entrá a Leadr", "Tu Pro ya está activo"],
  ];
  return (
    <Scene dur={dur}>
      <Kicker text="Cómo acceder" />
      <div style={{ ...rise(14), fontSize: 62, fontWeight: 800, letterSpacing: -1.5, marginBottom: 44 }}>Entrar es en <span style={accent}>3 pasos</span></div>
      <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
        {steps.map(([n, title, desc], i) => {
          const ap = interpolate(f - (28 + i * 12), [0, 12], [0, 1], clamp);
          return (
            <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 26}px)`, width: 340, background: LC.card, border: `1px solid ${LC.slate}`, borderRadius: 18, padding: "28px 26px" }}>
              <Snd at={28 + i * 12} s="tick.wav" v={0.3} />
              <div style={{ width: 54, height: 54, borderRadius: 14, background: LC.cyan, color: "#020617", fontWeight: 800, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontFamily: "monospace" }}>{n}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 22, color: LC.dim, lineHeight: 1.4 }}>{desc}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// S4 — dashboard con módulos
const Dashboard: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  // módulos REALES de Leadr (de scripts/configs/*.json)
  const mods: [string, string, number][] = [
    ["Verificación con IA", LC.cyan, 100],
    ["Monetización del periodismo", LC.violet, 55],
    ["Automatización del flujo", LC.cyan, 25],
    ["Cobertura en tiempo real", LC.violet, 0],
  ];
  return (
    <Scene dur={dur}>
      <Kicker text="Adentro: los módulos" />
      <Win url="leadr.cloud/dashboard">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <Logo size={30} />
          <div style={{ fontSize: 20, color: LC.dim }}>Tu recorrido</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {mods.map(([title, col, prog], i) => {
            const ap = interpolate(f - (26 + i * 9), [0, 11], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 18}px)`, background: LC.card2, border: `1px solid ${LC.slate}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 15, color: col, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>Curso</div>
                <div style={{ fontSize: 25, fontWeight: 700, color: "#fff" }}>{title}</div>
                <div style={{ marginTop: 16, height: 7, borderRadius: 99, background: LC.slate }}>
                  <div style={{ width: `${prog * ap}%`, height: "100%", borderRadius: 99, background: col }} />
                </div>
              </div>
            );
          })}
        </div>
      </Win>
    </Scene>
  );
};

// S5 — biblioteca de prompts
const PromptsLib: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rows = ["8 titulares de alto impacto", "Briefing de cobertura en 10 minutos", "Hilo para X desde tu nota"];
  return (
    <Scene dur={dur}>
      <Kicker text="La joya: prompts listos" />
      <Win url="leadr.cloud/prompts">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Logo size={28} />
          <span style={{ fontSize: 24, color: LC.text, fontWeight: 700, marginLeft: 8 }}>Biblioteca de prompts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map((p, i) => {
            const ap = interpolate(f - (28 + i * 11), [0, 11], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: ap, transform: `translateX(${(1 - ap) * -24}px)`, display: "flex", alignItems: "center", justifyContent: "space-between", background: LC.card2, border: `1px solid ${LC.slate}`, borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: LC.violet, fontWeight: 800, fontSize: 20 }}>{">"}</div>
                  <span style={{ fontSize: 25, color: LC.text }}>{p}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: LC.cyan, border: "1px solid rgba(34,211,238,.4)", borderRadius: 8, padding: "8px 20px" }}>Copiar</div>
              </div>
            );
          })}
        </div>
      </Win>
    </Scene>
  );
};

// S6 — bonos
const IconDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={LC.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4M5 21h14" /></svg>
);
const Bonos: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const items = ["Guías en PDF", "Plantillas de trabajo", "Checklists descargables"];
  return (
    <Scene dur={dur}>
      <Kicker text="Bonos y recursos" />
      <Win url="leadr.cloud/bonos">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {items.map((name, i) => {
            const ap = interpolate(f - (22 + i * 8), [0, 10], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 16}px)`, background: LC.card2, border: `1px solid ${LC.slate}`, borderRadius: 14, padding: "24px 22px" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><IconDown /></div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>{name}</div>
                <div style={{ fontSize: 18, color: LC.dim }}>Descargable</div>
              </div>
            );
          })}
        </div>
      </Win>
    </Scene>
  );
};

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 9.218, render: (d) => <Statement dur={d} kicker="Tu regalo incluido" lines={[{ t: "Un mes gratis" }, { t: "de Leadr Pro.", a: true }]} sub="Con tu compra ya lo desbloqueaste. Te muestro qué es y cómo entrar." art="rocket" /> },
  { audio: "s2.wav", sec: 11.668, render: (d) => <LeadrIntro dur={d} /> },
  { audio: "s3.wav", sec: 13.699, render: (d) => <AccessSteps dur={d} /> },
  { audio: "s4.wav", sec: 11.285, render: (d) => <Dashboard dur={d} /> },
  { audio: "s5.wav", sec: 10.217, render: (d) => <PromptsLib dur={d} /> },
  { audio: "s6.wav", sec: 5.77, render: (d) => <Bonos dur={d} /> },
  { audio: "s7.wav", sec: 8.046, render: (d) => <Timeline dur={d} kicker="Siempre creciendo" title="Cada semana, algo nuevo" steps={["Clases nuevas", "Prompts nuevos", "Recursos y bonos"]} /> },
  { audio: "s8.wav", sec: 9.602, render: (d) => <TaskCard dur={d} kicker="Tu tarea" label="Entrá hoy a leadr.cloud" big="Date una vuelta por Leadr" ex="Es tu mes Pro — aprovechalo al máximo." /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D06 as number[])[i] }));
export const TOTAL_FRAMES_L = totalFrames(SCENES_D);
export const ClaseLeadr: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="clase06.mp3" caps={C06 as any} />;
