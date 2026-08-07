import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---- paleta de marca ----
const INK = "#f5f5fa";
const CYAN = "#22d3ee";
const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
const accentText: React.CSSProperties = {
  backgroundImage: "linear-gradient(100deg,#818cf8,#22d3ee)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---- iconos de linea ----
const IconIdea = () => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={CYAN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3Z" />
    <path d="M9 20h6M10 22h4" />
  </svg>
);
const IconComunidad = () => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={CYAN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M15 11a3 3 0 1 0-2-5" />
    <path d="M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" />
  </svg>
);
const IconCrecer = () => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={CYAN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18 10 12l4 4 6-7" />
    <path d="M15 7h5v5" />
  </svg>
);

const Kicker: React.FC<{ text: string; lineStart: number }> = ({ text, lineStart }) => {
  const frame = useCurrentFrame();
  const lineW = interpolate(frame - lineStart, [0, 18], [0, 66], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(frame - lineStart, [6, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, color: CYAN, fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", marginBottom: 40 }}>
      <span style={{ width: lineW, height: 3, background: CYAN, boxShadow: `0 0 16px ${CYAN}` }} />
      <span style={{ opacity: op }}>{text}</span>
    </div>
  );
};

const Card: React.FC<{ start: number; icon: React.ReactNode; tag: string; text: string }> = ({ start, icon, tag, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 110 } });
  const op = interpolate(frame - start, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ flex: 1, background: "rgba(19,21,38,.72)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 24, padding: "44px 38px", boxShadow: "0 24px 70px rgba(0,0,0,.5)", opacity: op, transform: `translateY(${(1 - p) * 120}px) scale(${0.92 + p * 0.08})` }}>
      <div style={{ width: 66, height: 66, borderRadius: 16, background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(34,211,238,.20))", border: "1px solid rgba(34,211,238,.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>{icon}</div>
      <div style={{ fontSize: 21, color: "#8a8aa0", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{tag}</div>
      <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.22 }}>{text}</div>
    </div>
  );
};

export const Clase01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = (start: number, dist = 46): React.CSSProperties => {
    const p = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 120 } });
    const op = interpolate(frame - start, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { display: "inline-block", opacity: op, transform: `translateY(${(1 - p) * dist}px)` };
  };

  // Escena A -> se va, Escena B entra
  const aOut = interpolate(frame, [188, 203], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aShift = interpolate(frame, [188, 203], [0, -30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // burst "30 dias"
  const bp = spring({ frame: frame - 252, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const burst: React.CSSProperties = {
    display: "inline-block",
    opacity: interpolate(frame - 252, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `scale(${0.5 + bp * 0.5})`,
  };

  // barra de progreso final
  const prog = interpolate(frame, [285, 356], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const footOp = interpolate(frame, [278, 292], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pad = "120px 130px";

  return (
    <AbsoluteFill style={{ backgroundColor: "#07070f", fontFamily: FONT, color: INK }}>
      <Audio src={staticFile("voz.wav")} />
      <Img src={staticFile("bg.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* ESCENA A */}
      <AbsoluteFill style={{ padding: pad, justifyContent: "center", opacity: aOut, transform: `translateY(${aShift}px)` }}>
        <Kicker text="Módulo 0 · Clase 1" lineStart={6} />
        <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.03, letterSpacing: -1.5 }}>
          <span style={rise(21)}>Bienvenido.</span>
          <br />
          <span style={rise(25)}>Vas</span> <span style={rise(30)}>a</span> <span style={rise(34)}>construir</span> <span style={{ ...rise(39), ...accentText }}>algo tuyo.</span>
        </div>
        <div style={{ ...rise(54, 30), fontSize: 36, color: "#b8b8c8", lineHeight: 1.4, maxWidth: 1250, marginTop: 38, fontWeight: 300 }}>
          Un periódico digital que informa, que crece, y que genera ingresos.
        </div>
      </AbsoluteFill>

      {/* ESCENA B */}
      <AbsoluteFill style={{ padding: pad, justifyContent: "center" }}>
        <div style={{ opacity: interpolate(frame, [203, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Kicker text="De dónde estás · a dónde vas" lineStart={203} />
        </div>
        <div style={{ ...rise(209, 40), fontSize: 92, fontWeight: 800, lineHeight: 1.03, letterSpacing: -1.5 }}>
          Tu transformación en <span style={{ ...burst, ...accentText }}>30 días</span>
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 30, marginTop: 60 }}>
          <Card start={219} icon={<IconIdea />} tag="Hoy" text="Una idea suelta o una página que no despega" />
          <Card start={230} icon={<IconComunidad />} tag="En el camino" text="Un medio con identidad y una comunidad que te sigue" />
          <Card start={240} icon={<IconCrecer />} tag="El resultado" text="Una forma concreta de monetizar lo que publicás" />
        </div>
      </AbsoluteFill>

      {/* CIERRE: barra de progreso con movimiento hasta el final */}
      <AbsoluteFill style={{ padding: pad, justifyContent: "flex-end", opacity: footOp }}>
        <div style={{ paddingBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#7a7a92", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", marginBottom: 18 }}>
            <span>Tu sistema, paso a paso</span>
            <span style={{ color: CYAN, fontWeight: 700 }}>Empecemos</span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prog}%`, borderRadius: 4, background: "linear-gradient(90deg,#6366f1,#22d3ee)", boxShadow: "0 0 14px rgba(34,211,238,.6)" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
