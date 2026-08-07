import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const VERDE = GR; // motivo del Módulo 3

/**
 * EL SELLO DE CONFIANZA — hero de la clase 3.1 (motivo VERDE del Módulo 3).
 * Un sello circular cuya corona se va llenando gota a gota (la confianza que se junta despacio).
 * `nivel` 0..1 = cuán lleno está. `grieta` = aparece una grieta y el sello se apaga/vacía de golpe
 * (la asimetría: se llena lento, se vacía de un saque). Objeto NUEVO, no visto en M0/M1/M2.
 */
export const Sello: React.FC<{ nivel?: number; grieta?: boolean; cx?: number; scale?: number }> = ({
  nivel = 1, grieta, cx = 1300, scale = 1,
}) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const R = 150, C = 2 * Math.PI * R;
  // llenado progresivo de la corona
  const fill = interpolate(f, [10, 46], [0, nivel], clamp);
  // si hay grieta, a partir del frame 40 el llenado colapsa
  const drain = grieta ? interpolate(f, [40, 52], [0, 1], clamp) : 0;
  const efectivo = fill * (1 - drain);
  const col = grieta && drain > 0.3 ? "#5a5a72" : VERDE;

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ overflow: "visible" }}>
        {/* aro base */}
        <circle r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={22} />
        {/* corona que se llena */}
        <circle r={R} fill="none" stroke={col} strokeWidth={22} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - efectivo)} transform="rotate(-90)"
          style={{ filter: `drop-shadow(0 0 16px ${col}aa)` }} />
        {/* gotas cayendo (mientras llena y no hay grieta) */}
        {!grieta && Array.from({ length: 3 }).map((_, i) => {
          const t = ((f * 2 + i * 22) % 66) / 66;
          const y = -230 + t * 120;
          const op = interpolate(t, [0, 0.7, 1], [0, 1, 0]);
          return <circle key={i} cx={0} cy={y} r={7} fill={VERDE} opacity={op * (1 - fill * 0.4)} style={{ filter: `drop-shadow(0 0 8px ${VERDE})` }} />;
        })}
        {/* núcleo */}
        <circle r={R - 34} fill={`${col}12`} stroke={`${col}44`} strokeWidth={2} />
        {/* check de verificado en el centro */}
        <path d="M-42 4 L-14 34 L46 -34" fill="none" stroke={col} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"
          opacity={grieta ? 1 - drain : Math.min(1, efectivo * 1.4)} style={{ filter: `drop-shadow(0 0 12px ${col})` }} />
        {/* la grieta */}
        {grieta && drain > 0.05 && (
          <path d="M0 -150 L-18 -40 L14 20 L-10 90 L6 150" fill="none" stroke="#ff6b6b" strokeWidth={5}
            strokeLinecap="round" opacity={drain} style={{ filter: "drop-shadow(0 0 10px #ff6b6b)" }} />
        )}
      </svg>
      <div style={{ textAlign: "center", marginTop: 6, fontSize: 20, letterSpacing: 4, fontWeight: 800, color: col }}>
        {grieta && drain > 0.3 ? "SE VACÍA DE UN GOLPE" : "CONFIANZA"}
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + el sello a la derecha. */
export const SelloScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; nivel?: number; grieta?: boolean; kc?: string;
}> = ({ kicker, lines, sub, nivel, grieta, kc = VERDE }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Sello nivel={nivel} grieta={grieta} scale={0.86} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 720, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 78, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 30, fontSize: 29, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

export { VERDE };
