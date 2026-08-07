import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * LOS DOS RECIPIENTES — hero de la clase 1.5 (estructura "dos caminos").
 * Izquierda: seguidores, un recipiente con fugas (lo que entra se escapa por los costados).
 * Derecha: suscriptores, un recipiente cerrado (lo que entra se acumula).
 * `llenaA` / `llenaB` (0..1) = cuánto queda adentro de cada uno.
 * Distinto de la escalera (1.2), la boca (1.3) y el perfil (1.4).
 */
const Recipiente: React.FC<{
  x: number; label: string; sub: string; color: string; llena: number; fuga: boolean; valor?: string;
}> = ({ x, label, sub, color, llena, fuga, valor }) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [10, 44], [0, 1], clamp);
  const nivel = llena * grow;
  const W = 340, H = 380;

  return (
    <div style={{ position: "absolute", left: x, top: "52%", transform: "translate(-50%,-50%)", fontFamily: F, textAlign: "center" }}>
      <div style={{ fontSize: 20, letterSpacing: 5, color, fontWeight: 800, marginBottom: 16 }}>{label}</div>

      <svg width={W + 120} height={H + 90} viewBox={`${-60} -30 ${W + 120} ${H + 90}`} style={{ overflow: "visible" }}>
        {/* el recipiente */}
        <path d={`M0 0 L0 ${H} Q0 ${H + 26} 26 ${H + 26} L${W - 26} ${H + 26} Q${W} ${H + 26} ${W} ${H} L${W} 0`}
          fill="none" stroke={color} strokeWidth={3} opacity={0.85} style={{ filter: `drop-shadow(0 0 14px ${color}66)` }} />

        {/* el contenido acumulado */}
        <rect x={4} y={H - nivel * (H - 10)} width={W - 8} height={nivel * (H - 10) + 22} rx={20}
          fill={`${color}2e`} stroke={`${color}88`} strokeWidth={1.5} />

        {/* lo que cae desde arriba */}
        {Array.from({ length: 7 }).map((_, k) => {
          const t = ((f * 2.4 + k * 26) % 100) / 100;
          return <circle key={k} cx={W / 2 + ((k * 41) % 120) - 60} cy={-24 + t * 90} r={4} fill={color} opacity={0.8 * (1 - t)} />;
        })}

        {/* las fugas: en el recipiente prestado, lo que entra se escapa */}
        {fuga && Array.from({ length: 6 }).map((_, k) => {
          const lado = k % 2 === 0 ? -1 : 1;
          const t = ((f * 2.6 + k * 33) % 100) / 100;
          const y0 = 90 + (k % 3) * 90;
          return (
            <circle key={`f${k}`} cx={(lado < 0 ? 0 : W) + lado * t * 74} cy={y0 + t * 44} r={6} fill="#ff6b6b" opacity={0.95 * (1 - t)} />
          );
        })}
        {fuga && [110, 200, 290].map((y, i) => (
          <g key={`h${i}`} opacity={interpolate(f - 20, [0, 14], [0, 1], clamp)}>
            <line x1={-2} y1={y} x2={10} y2={y} stroke="#ff6b6b" strokeWidth={3} />
            <line x1={W - 10} y1={y + 26} x2={W + 2} y2={y + 26} stroke="#ff6b6b" strokeWidth={3} />
          </g>
        ))}

        {valor && (
          <text x={W / 2} y={H - nivel * (H - 10) - 24} fill={color} fontSize={56} fontWeight={800}
            textAnchor="middle" fontFamily={F} style={{ filter: `drop-shadow(0 0 16px ${color}88)` }}>{valor}</text>
        )}
      </svg>

      <div style={{ marginTop: 20, fontSize: 25, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.28, maxWidth: 330, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>
    </div>
  );
};

/** Escena con los dos recipientes en paralelo y el título arriba. */
export const DosRecipientes: React.FC<{
  dur: number; kicker: string; title: string;
  a: { label: string; sub: string; llena: number; valor?: string };
  b: { label: string; sub: string; llena: number; valor?: string };
}> = ({ kicker, title, a, b }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 62, textAlign: "center" }}>
        <div style={{ ...r(0), display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 44, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 21, fontWeight: 800, letterSpacing: 8 }}>{kicker}</span>
        </div>
        <div style={{ ...r(8), fontSize: 66, fontWeight: 800, letterSpacing: -2.5, color: "#fff" }}>{title}</div>
      </div>
      <Recipiente x={560} label={a.label} sub={a.sub} color={VI} llena={a.llena} fuga valor={a.valor} />
      <Recipiente x={1400} label={b.label} sub={b.sub} color={CY} llena={b.llena} fuga={false} valor={b.valor} />
    </AbsoluteFill>
  );
};

/** Escena de "momento": el rótulo del momento + los dos caminos como texto enfrentado. */
export const Momento: React.FC<{
  dur: number; n: number; titulo: string; a: string; b: string; remate?: string;
}> = ({ n, titulo, a, b, remate }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 150, right: 150, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ ...r(0), display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
          <div style={{ width: 62, height: 62, borderRadius: 99, border: `2px solid ${GO}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 800, color: GO, boxShadow: `0 0 24px ${GO}55` }}>{n}</div>
          <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: -2, color: "#fff" }}>{titulo}</div>
        </div>

        <div style={{ display: "flex", gap: 56, marginTop: 14 }}>
          <div style={{ ...r(14), flex: 1, borderLeft: `3px solid ${VI}`, paddingLeft: 26 }}>
            <div style={{ fontSize: 20, letterSpacing: 6, color: VI, fontWeight: 800, marginBottom: 18 }}>CAMINO A · SEGUIDORES</div>
            <div style={{ fontSize: 31, color: "#b8b8cc", fontWeight: 300, lineHeight: 1.4 }}>{a}</div>
          </div>
          <div style={{ ...r(24), flex: 1, borderLeft: `3px solid ${CY}`, paddingLeft: 26 }}>
            <div style={{ fontSize: 20, letterSpacing: 6, color: CY, fontWeight: 800, marginBottom: 18 }}>CAMINO B · SUSCRIPTORES</div>
            <div style={{ fontSize: 31, color: "#e8e8f0", fontWeight: 400, lineHeight: 1.4 }}>{b}</div>
          </div>
        </div>

        {remate && (
          <div style={{ ...r(40), marginTop: 52, fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: -1, borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 32, textWrap: "balance" as const }}>{remate}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
