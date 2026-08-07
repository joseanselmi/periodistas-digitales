import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, IN, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Los escritorios de la redacción de IA. Cada uno = un rol, con su color, su glifo y su encargo.
export const ESCRITORIOS = [
  { r: "Documentalista", g: "▤", e: "Resume y ordena material largo", c: CY },
  { r: "Titulador", g: "✎", e: "Opciones de títulos y ganchos", c: VI },
  { r: "Editor", g: "◈", e: "Pule y aclara un texto tuyo", c: GO },
  { r: "Corrector", g: "✓", e: "Ortografía y detalles finos", c: GR },
  { r: "Adapta formatos", g: "⇄", e: "Una pieza, en varias", c: IN },
  { r: "Sparring", g: "⚔", e: "Te discute y marca lo que falta", c: "#ff8a6b" },
];

/**
 * LA REDACCIÓN — hero de la clase 2.4 (motivo cyan del Módulo 2).
 * Una grilla de escritorios; cada uno es un rol de la IA. `activo` enciende el que estamos visitando
 * (el resto queda tenue). `activo = -1` los muestra todos encendidos (la redacción completa).
 * Objeto NUEVO (grilla de puestos), distinto de la máquina (2.1), el despiece (2.2) y el chat (2.3).
 */
export const Redaccion: React.FC<{ activo?: number; cx?: number; scale?: number }> = ({ activo = -1, cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 660, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {ESCRITORIOS.map((d, i) => {
          const on = activo === -1 || i === activo;
          const recien = i === activo;
          const grow = interpolate(f - (14 + i * 5), [0, 14], [0, 1], clamp);
          const pulse = recien ? 0.5 + Math.sin(f / 9) * 0.16 : 0;
          return (
            <div key={i} style={{
              opacity: (on ? 1 : 0.34) * grow, transform: `translateY(${(1 - grow) * 18}px) scale(${recien ? 1.04 : 1})`,
              borderRadius: 16, padding: "20px 20px 22px", background: on ? `linear-gradient(150deg,${d.c}1e,transparent 85%)` : "rgba(255,255,255,.02)",
              border: `1px solid ${on ? d.c + "66" : "rgba(255,255,255,.08)"}`,
              boxShadow: recien ? `0 0 ${22 + pulse * 26}px ${d.c}55` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: on ? `${d.c}22` : "rgba(255,255,255,.04)", border: `1px solid ${on ? d.c : "rgba(255,255,255,.12)"}`, color: on ? d.c : "#5a5a72" }}>{d.g}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: on ? "#fff" : "#6e6e86", letterSpacing: -0.5 }}>{d.r}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 400, color: on ? "#9a9ab2" : "#4a4a5e", lineHeight: 1.3 }}>{d.e}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + la grilla de escritorios a la derecha. */
export const RedaccionScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; activo?: number; kc?: string;
}> = ({ kicker, lines, sub, activo, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Redaccion activo={activo} scale={0.8} />
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 660, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 74, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 28, fontSize: 28, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
