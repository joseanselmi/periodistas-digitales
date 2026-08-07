import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, GR, GO, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const VERDE = GR;

/**
 * LA TRIANGULACIÓN — hero de la clase 3.3 (motivo VERDE del Módulo 3).
 * Una afirmación en el centro y tres fuentes alrededor, con conectores que se encienden.
 * `confirman` = cuántas fuentes confirmaron (0..3). `contradice` = si la 3ª contradice (en rojo).
 * Objeto NUEVO (red de fuentes), distinto de todos los heroes anteriores.
 */
export const Triangulo: React.FC<{ confirman?: number; contradice?: boolean; sola?: boolean; cx?: number; scale?: number }> = ({
  confirman = 3, contradice, sola, cx = 1300, scale = 1,
}) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  // tres fuentes en triángulo alrededor del centro
  const fuentes = [
    { x: 0, y: -170, k: "Organismo\nque lo midió" },
    { x: -160, y: 110, k: "Registro\npúblico" },
    { x: 160, y: 110, k: "Experto\nindependiente" },
  ];
  const nActivas = sola ? 1 : confirman;

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <svg width={480} height={480} viewBox="-240 -240 480 480" style={{ overflow: "visible" }}>
        {/* conectores */}
        {fuentes.map((s, i) => {
          const on = i < nActivas;
          const esRojo = contradice && i === 2;
          const col = esRojo ? "#ff6b6b" : on ? VERDE : "rgba(255,255,255,.12)";
          const draw = interpolate(f - (18 + i * 8), [0, 12], [0, on || esRojo ? 1 : 0.001], clamp);
          return (
            <line key={i} x1={0} y1={0} x2={s.x * draw} y2={s.y * draw} stroke={col} strokeWidth={on || esRojo ? 4 : 2}
              strokeDasharray={on || esRojo ? "none" : "5 6"} style={{ filter: on || esRojo ? `drop-shadow(0 0 8px ${col})` : "none" }} />
          );
        })}
        {/* fuentes */}
        {fuentes.map((s, i) => {
          const on = i < nActivas;
          const esRojo = contradice && i === 2;
          const col = esRojo ? "#ff6b6b" : on ? VERDE : "#5a5a72";
          const grow = interpolate(f - (14 + i * 8), [0, 12], [0, 1], clamp);
          return (
            <g key={i} transform={`translate(${s.x},${s.y})`} opacity={grow}>
              <circle r={30} fill={`${col}1e`} stroke={col} strokeWidth={2.5} style={{ filter: on || esRojo ? `drop-shadow(0 0 12px ${col}88)` : "none" }} />
              <text y={6} textAnchor="middle" fill={col} fontSize={26} fontWeight={800} fontFamily={F}>{esRojo ? "✗" : on ? "✓" : "?"}</text>
              <text y={s.y < 0 ? -54 : 62} textAnchor="middle" fill="#9a9ab2" fontSize={17} fontWeight={700} fontFamily={F}>
                {s.k.split("\n").map((ln, j) => <tspan key={j} x={0} dy={j === 0 ? 0 : 20}>{ln}</tspan>)}
              </text>
            </g>
          );
        })}
        {/* la afirmación en el centro */}
        <circle r={54} fill="#0d0d18" stroke={sola ? GO : contradice ? "#ff6b6b" : nActivas >= 2 ? VERDE : "#6e6e86"} strokeWidth={3}
          style={{ filter: `drop-shadow(0 0 16px ${nActivas >= 2 && !contradice ? VERDE : "#000"}66)` }} />
        <text y={-2} textAnchor="middle" fill="#fff" fontSize={19} fontWeight={800} fontFamily={F}>EL</text>
        <text y={20} textAnchor="middle" fill="#fff" fontSize={19} fontWeight={800} fontFamily={F}>DATO</text>
      </svg>
      <div style={{ textAlign: "center", marginTop: 4, fontSize: 19, letterSpacing: 3, fontWeight: 800, color: sola ? GO : contradice ? "#ff6b6b" : nActivas >= 2 ? VERDE : "#6e6e86" }}>
        {sola ? "UNA SOLA FUENTE: FLOJO" : contradice ? "UNA FUENTE CONTRADICE" : nActivas >= 2 ? "TRIANGULADO: FIRME" : "SIN CRUZAR"}
      </div>
    </div>
  );
};

export const TrianguloScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; confirman?: number; contradice?: boolean; sola?: boolean; kc?: string;
}> = ({ kicker, lines, sub, confirman, contradice, sola, kc = VERDE }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Triangulo confirman={confirman} contradice={contradice} sola={sola} scale={0.82} />
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 680, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 76, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 30, fontSize: 28, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
