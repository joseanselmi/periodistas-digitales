import React from "react";
import { AbsoluteFill, Img, staticFile, Sequence, interpolate, useCurrentFrame } from "remotion";

// DEMO — estilo "EDITORIAL OSCURO": titulares gigantes tipo tapa de diario, layout ASIMÉTRICO,
// gráfico que sangra fuera del cuadro, reglas de columna, pull quote. Para comparar con el estilo actual.
const F = "Segoe UI, sans-serif";
const CY = "#22d3ee", VI = "#a78bfa";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const SC = 150; // frames por escena

const useR = () => {
  const f = useCurrentFrame();
  return (d = 0, dist = 30) => {
    const p = interpolate(f - d, [0, 16], [0, 1], clamp);
    return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
  };
};

const Kick: React.FC<{ t: string; st: React.CSSProperties }> = ({ t, st }) => (
  <div style={{ ...st, display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
    <div style={{ width: 46, height: 3, background: CY, boxShadow: `0 0 12px ${CY}` }} />
    <span style={{ color: CY, fontSize: 24, fontWeight: 800, letterSpacing: 8 }}>{t}</span>
  </div>
);

// 1 — Titular gigante asimétrico + gráfico sangrando por la derecha
const EdA: React.FC = () => {
  const r = useR();
  const f = useCurrentFrame();
  const gp = interpolate(f, [4, 34], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", right: -220, top: "50%", transform: `translateY(-50%) scale(${0.9 + 0.1 * gp})`, opacity: 0.42 * gp }}>
        <svg width={860} height={860} viewBox="0 0 100 100" fill="none" stroke={CY} strokeWidth="1.1">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="34" strokeOpacity=".6" />
          <path d="M50 26v48M38 38h24M38 62h24" strokeOpacity=".8" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 112, top: 130, bottom: 130, width: 2, background: "linear-gradient(180deg,rgba(255,255,255,.16),transparent)" }} />
      <div style={{ position: "absolute", left: 152, top: 215, width: 1250 }}>
        <Kick t="EL PUNTO DE PARTIDA" st={r(0)} />
        <div style={{ ...r(8), fontSize: 152, fontWeight: 800, lineHeight: 0.92, letterSpacing: -5, color: "#fff", textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>
          Un producto<br />se cobra<br /><span style={{ color: CY }}>una sola vez.</span>
        </div>
        <div style={{ ...r(24), marginTop: 44, fontSize: 33, fontWeight: 300, color: "#9a9ab2", maxWidth: 580, lineHeight: 1.35, borderLeft: `2px solid rgba(34,211,238,.5)`, paddingLeft: 22 }}>
          Tu ingreso se termina en el momento exacto en que dejás de vender.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 2 — Pull quote editorial
const EdB: React.FC = () => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 150, top: "50%", transform: "translateY(-50%)", width: 1500 }}>
        <div style={{ ...r(0), fontSize: 260, lineHeight: 0.5, color: CY, opacity: 0.3, fontWeight: 800, height: 90 }}>“</div>
        <div style={{ ...r(10), fontSize: 120, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3.5, color: "#fff", marginTop: 24 }}>
          La autoridad nace<br />de la <span style={{ color: CY }}>especialización</span>.
        </div>
        <div style={{ ...r(26), marginTop: 44, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 100, height: 2, background: "rgba(255,255,255,.28)" }} />
          <span style={{ fontSize: 25, letterSpacing: 7, color: "#8a8aa4", fontWeight: 700 }}>LA TEORÍA DEL NICHO</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Diagrama animado: lectores fluyendo hacia tu buzón. Con barrera si es "terreno prestado".
const Flow: React.FC<{ blocked?: boolean }> = ({ blocked }) => {
  const f = useCurrentFrame();
  const W = 540, H = 150, mid = 80, N = 8;
  const barrier = W * 0.6;
  const col = blocked ? "#6e6e86" : CY;
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <line x1={0} y1={mid} x2={W - 66} y2={mid} stroke="rgba(255,255,255,.10)" strokeWidth={2} strokeDasharray="5 9" />
      {blocked && (
        <>
          <line x1={barrier} y1={16} x2={barrier} y2={H - 16} stroke="#5a5a72" strokeWidth={3} strokeDasharray="9 9" />
          <text x={barrier + 14} y={30} fill="#5a5a72" fontSize={15} fontWeight={700} letterSpacing={3} fontFamily={F}>ALGORITMO</text>
        </>
      )}
      {Array.from({ length: N }).map((_, i) => {
        const t = ((f * 1.5 + i * 20) % 160) / 160;
        let x = t * (W - 76);
        let op = 1;
        const passes = !blocked || i % 4 === 0;
        if (blocked && !passes && x > barrier - 12) {
          op = Math.max(0, 1 - (x - (barrier - 12)) / 28);
          x = Math.min(x, barrier + 14);
        }
        return <circle key={i} cx={x} cy={mid} r={7} fill={col} opacity={op} style={{ filter: blocked ? "none" : `drop-shadow(0 0 9px ${CY})` }} />;
      })}
      <g transform={`translate(${W - 60}, ${mid - 24})`} stroke={col} fill="none" strokeWidth={2.4} style={{ filter: blocked ? "none" : `drop-shadow(0 0 14px ${CY})` }}>
        <rect x="0" y="0" width="54" height="40" rx="6" />
        <path d="M0 5l27 21L54 5" />
      </g>
    </svg>
  );
};

// 3 — Comparación asimétrica + PRUEBA VISUAL animada abajo (nada de espacio muerto)
const EdC: React.FC = () => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 150, top: 165, width: 1620, display: "flex", gap: 70 }}>
        <div style={{ flex: 1.25 }}>
          <div style={{ ...r(0), fontSize: 23, letterSpacing: 7, color: "#7a7a92", fontWeight: 800, marginBottom: 22 }}>TERRENO PRESTADO</div>
          <div style={{ ...r(8), fontSize: 96, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#6e6e86" }}>Manda el<br />algoritmo.</div>
          <div style={{ ...r(20), marginTop: 28, fontSize: 29, color: "#7a7a92", fontWeight: 300, maxWidth: 520, lineHeight: 1.35 }}>
            Cambia las reglas y tus notas llegan a la mitad de la gente.
          </div>
          <div style={{ ...r(40, 18), marginTop: 60 }}><Flow blocked /></div>
        </div>
        <div style={{ width: 2, background: "linear-gradient(180deg,transparent,rgba(255,255,255,.2),transparent)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...r(14), fontSize: 23, letterSpacing: 7, color: CY, fontWeight: 800, marginBottom: 22 }}>TERRENO PROPIO</div>
          <div style={{ ...r(22), fontSize: 96, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff", textShadow: `0 0 40px rgba(34,211,238,.25)` }}>Mandás<br />vos.</div>
          <div style={{ ...r(32), marginTop: 28, fontSize: 29, color: "#b8b8cc", fontWeight: 300, maxWidth: 470, lineHeight: 1.35 }}>
            Tu newsletter: le escribís directo y nadie te la puede quitar.
          </div>
          <div style={{ ...r(50, 18), marginTop: 60 }}><Flow /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DEMO_ED_FRAMES = SC * 3;
export const DemoEditorial: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07070f" }}>
    <Img src={staticFile("bg.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <Sequence from={0} durationInFrames={SC}><EdA /></Sequence>
    <Sequence from={SC} durationInFrames={SC}><EdB /></Sequence>
    <Sequence from={SC * 2} durationInFrames={SC}><EdC /></Sequence>
  </AbsoluteFill>
);
