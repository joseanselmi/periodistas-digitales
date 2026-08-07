import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, GR, GO, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const VERDE = GR;

// Las señales que delatan una imagen fabricada, con su posición sobre la "foto".
const SENALES = [
  { k: "manos", x: 0.30, y: 0.66 },
  { k: "texto", x: 0.70, y: 0.30 },
  { k: "reflejos", x: 0.68, y: 0.62 },
  { k: "fondo", x: 0.26, y: 0.28 },
];

/**
 * LA LUPA FORENSE — hero de la clase 3.2 (motivo VERDE del Módulo 3).
 * Una "foto" mockup con las señales que se encienden una por una (`activa` = índice, -1 = todas).
 * Objeto NUEVO (imagen bajo la lupa), distinto de los heroes de M1/M2 y del sello de 3.1.
 */
export const Lupa: React.FC<{ activa?: number; cx?: number; scale?: number }> = ({ activa = -1, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const W = 560, H = 380;
  const sx = (x: number) => x * W, sy = (y: number) => y * H;
  // la lupa flota hacia la señal activa
  const target = activa >= 0 ? SENALES[activa] : { x: 0.5, y: 0.5 };
  const lx = sx(target.x), ly = sy(target.y);

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 30px 90px rgba(0,0,0,.6)", background: "linear-gradient(145deg,#1a1a2e,#0d0d18)" }}>
        {/* formas abstractas que simulan una foto */}
        <div style={{ position: "absolute", left: "10%", top: "38%", width: "44%", height: "50%", borderRadius: 14, background: "linear-gradient(160deg,#3a3a5c,#22223a)" }} />
        <div style={{ position: "absolute", left: "58%", top: "18%", width: "32%", height: "34%", borderRadius: 10, background: "linear-gradient(160deg,#4a4a2e,#2a2a1a)" }} />
        <div style={{ position: "absolute", left: "60%", top: "56%", width: "28%", height: "30%", borderRadius: 10, background: "linear-gradient(160deg,#2e4a4a,#1a2a2a)" }} />
        {/* marcadores de señal */}
        {SENALES.map((s, i) => {
          const on = activa === -1 || i === activa;
          const pulse = i === activa ? 0.6 + Math.sin(f / 8) * 0.2 : 0.3;
          const grow = interpolate(f - (16 + i * 6), [0, 12], [0, 1], clamp);
          return (
            <div key={i} style={{ position: "absolute", left: sx(s.x), top: sy(s.y), transform: "translate(-50%,-50%)", opacity: (on ? 1 : 0.25) * grow }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, border: `2px solid ${on ? VERDE : "#5a5a72"}`, background: on ? `${VERDE}22` : "transparent", boxShadow: i === activa ? `0 0 ${16 + pulse * 20}px ${VERDE}` : "none" }} />
              <div style={{ position: "absolute", left: 38, top: 3, fontSize: 16, fontWeight: 800, letterSpacing: 1, color: on ? VERDE : "#6e6e86", whiteSpace: "nowrap" }}>{s.k}</div>
            </div>
          );
        })}
        {/* la lupa */}
        {activa >= 0 && (
          <svg style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} width={W} height={H}>
            <circle cx={lx} cy={ly} r={62} fill="rgba(52,211,153,.06)" stroke={VERDE} strokeWidth={4} style={{ filter: `drop-shadow(0 0 14px ${VERDE}88)` }} />
            <line x1={lx + 44} y1={ly + 44} x2={lx + 84} y2={ly + 84} stroke={VERDE} strokeWidth={8} strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

/**
 * LA BÚSQUEDA INVERSA — segundo hero de 3.2. La misma foto, encontrada en páginas viejas.
 * `hasta` = cuántos resultados aparecen. El resultado marcado revela "hace 2 años · otra ciudad".
 */
export const Busqueda: React.FC<{ hasta?: number; cx?: number; scale?: number }> = ({ hasta = 3, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const res = [
    { txt: "Publicada hace 2 años", tag: "otra ciudad", alerta: true },
    { txt: "Reutilizada en 2023", tag: "otro hecho", alerta: true },
    { txt: "Aparece en un chequeo", tag: "ya desmentida", alerta: true },
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 560, borderRadius: 16, background: "#0b0b16", border: "1px solid rgba(255,255,255,.14)", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ height: 52, background: "#101020", display: "flex", alignItems: "center", gap: 12, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `${VERDE}18`, border: `1px solid ${VERDE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: VERDE }}>◎</div>
          <span style={{ fontSize: 15, letterSpacing: 3, color: "#7d7d92", fontWeight: 800 }}>BÚSQUEDA INVERSA · DÓNDE APARECIÓ ANTES</span>
        </div>
        <div style={{ padding: "18px 18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {res.slice(0, hasta).map((r, i) => {
            const grow = interpolate(f - (16 + i * 12), [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: grow, transform: `translateX(${(1 - grow) * -20}px)`, display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 12, background: `${GO}12`, border: `1px solid ${GO}44` }}>
                <div style={{ width: 46, height: 46, borderRadius: 8, background: "linear-gradient(160deg,#3a3a5c,#22223a)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 21, fontWeight: 700, color: "#e8e8f0" }}>{r.txt}</div>
                  <div style={{ fontSize: 16, color: GO, fontWeight: 700, marginTop: 2 }}>⚠ {r.tag}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LeftText: React.FC<{ kicker: string; lines: string[]; sub?: string; kc: string }> = ({ kicker, lines, sub, kc }) => {
  const r = useR();
  return (
    <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 700, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Kick t={kicker} st={r(0)} c={kc} />
      <div style={{ ...r(8), fontSize: 76, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
        {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
      </div>
      {sub && <div style={{ ...r(24), marginTop: 30, fontSize: 28, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
    </div>
  );
};

export const LupaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; activa?: number; kc?: string }> = ({ kicker, lines, sub, activa, kc = VERDE }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Lupa activa={activa} scale={0.86} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={kc} /></AbsoluteFill>
);
export const BusquedaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; hasta?: number; kc?: string }> = ({ kicker, lines, sub, hasta, kc = VERDE }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Busqueda hasta={hasta} scale={0.86} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={kc} /></AbsoluteFill>
);
