import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Snd } from "./kit";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * LA BOCA — objeto central de la clase 1.3 (alcance).
 * Un cono que sale de tu publicación y se abre más o menos según las señales.
 * `abertura` 0..1 → de casi cerrada (poca gente nueva) a bien abierta (mucha).
 * Deliberadamente distinto de la escalera de 1.2: acá el concepto es APERTURA, no descenso.
 */
export const Boca: React.FC<{ abertura?: number; cx?: number; cy?: number; label?: string; scale?: number }> = ({
  abertura = 0.8, cx = 1290, cy = 540, label, scale = 1,
}) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [6, 34], [0, 1], clamp);
  const a = abertura * grow;
  const L = 620;                       // largo del cono
  const half = 40 + a * 300;           // media apertura en el extremo
  const n = Math.round(6 + a * 46);    // gente alcanzada: proporcional a la apertura

  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) scale(${scale})` }}>
      <svg width={880} height={820} viewBox="-140 -410 880 820" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="bocaFill" x1="0" x2="1">
            <stop offset="0%" stopColor={CY} stopOpacity="0.30" />
            <stop offset="100%" stopColor={CY} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* el haz */}
        <path d={`M0 0 L${L} ${-half} L${L} ${half} Z`} fill="url(#bocaFill)" />
        <line x1={0} y1={0} x2={L} y2={-half} stroke={CY} strokeWidth={3} opacity={0.85}
          style={{ filter: `drop-shadow(0 0 12px ${CY})` }} />
        <line x1={0} y1={0} x2={L} y2={half} stroke={CY} strokeWidth={3} opacity={0.85}
          style={{ filter: `drop-shadow(0 0 12px ${CY})` }} />

        {/* origen: tu publicación */}
        <circle r={26} fill="#0b1020" stroke={CY} strokeWidth={4} style={{ filter: `drop-shadow(0 0 22px ${CY})` }} />
        <circle r={13} fill={CY} />
        <text x={-46} y={7} fill="#dcdcea" fontSize={22} fontWeight={700} textAnchor="end" fontFamily={F}>vos</text>

        {/* gente alcanzada: puntos que viajan por el haz */}
        {Array.from({ length: n }).map((_, k) => {
          const t = (((f * 1.5 + k * 29) % 120) / 120);
          const spread = ((k * 37) % 100) / 100 - 0.5;   // -0.5 .. 0.5
          const x = t * L;
          const y = spread * 2 * half * t;
          const near = t > 0.62;
          return (
            <circle key={k} cx={x} cy={y} r={near ? 5 : 3.4}
              fill={near ? "#eaf6ff" : CY} opacity={near ? 0.95 : 0.55 * (0.3 + t)} />
          );
        })}

        {/* rótulo con la cantidad, al final del haz */}
        {label && (
          <g opacity={interpolate(f - 26, [0, 14], [0, 1], clamp)}>
            <text x={L + 40} y={8} fill={CY} fontSize={44} fontWeight={800} fontFamily={F}
              style={{ filter: `drop-shadow(0 0 16px ${CY}88)` }}>{label}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

/** Escena: texto a la izquierda + la boca a la derecha. `flip` la espeja. */
export const BocaScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; abertura?: number; label?: string; kc?: string; flip?: boolean;
}> = ({ kicker, lines, sub, abertura, label, kc = CY, flip }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      {/* con rótulo la boca se corre a la izquierda: si no, el texto del final queda pegado al borde */}
      <Boca abertura={abertura} label={label} cx={flip ? 560 : label ? 1120 : 1230} scale={flip ? 0.92 : 1} />
      <div style={{ position: "absolute", left: flip ? 1090 : 140, top: 0, bottom: 0, width: 700, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 82, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 32, fontSize: 29, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/**
 * LA CADENA DE PRUEBAS — el ejemplo trabajado de 1.3.
 * La plataforma prueba con pocos, y si retiene amplía. `hasta` = cuántos escalones se encienden.
 * `corte` = en cuál se detiene (caso que no retiene).
 */
export const Cadena: React.FC<{ dur: number; kicker: string; title: string; pasos: string[]; hasta: number; corte?: number; nota?: string }> = ({
  kicker, title, pasos, hasta, corte, nota,
}) => {
  const f = useCurrentFrame();
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
        <div style={{ ...r(0), display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 44, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 21, fontWeight: 800, letterSpacing: 8 }}>{kicker}</span>
        </div>
        <div style={{ ...r(8), fontSize: 72, fontWeight: 800, letterSpacing: -2.5, color: "#fff" }}>{title}</div>
      </div>

      {/* los círculos ocupan el alto real del cuadro: a 96px los números quedaban ilegibles a 1080p */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, height: 340, display: "flex", justifyContent: "center", alignItems: "center", gap: 0 }}>
        {pasos.map((p, i) => {
          const on = i < hasta;
          const at = 20 + i * 16;
          const ap = interpolate(f - at, [0, 14], [0, 1], clamp);
          const cortado = corte != null && i >= corte;
          const sz = 168 + i * 48;
          const c = cortado ? "#ff6b6b" : i === hasta - 1 ? GO : CY;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                cortado ? (
                  // el conector ROTO: dos muñones y una X. Antes era una línea roja apagada que
                  // no se distinguía de "apagado", y la escena quedaba igual a la que sí avanza.
                  <div style={{ width: 76, height: 60, position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ width: 20, height: 5, background: "#ff4d4d", borderRadius: 3, boxShadow: "0 0 14px #ff4d4d" }} />
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 34, height: 34 }}>
                      <div style={{ position: "absolute", top: 15, left: 0, width: 34, height: 4, background: "#ff4d4d", borderRadius: 2, transform: "rotate(45deg)", boxShadow: "0 0 12px #ff4d4d" }} />
                      <div style={{ position: "absolute", top: 15, left: 0, width: 34, height: 4, background: "#ff4d4d", borderRadius: 2, transform: "rotate(-45deg)", boxShadow: "0 0 12px #ff4d4d" }} />
                    </div>
                    <div style={{ width: 20, height: 5, background: "#ff4d4d", borderRadius: 3, opacity: 0.45 }} />
                  </div>
                ) : (
                  <div style={{ width: 76, height: 5, position: "relative", flexShrink: 0, opacity: on ? ap : 0.14, background: `linear-gradient(90deg,${CY},${VI})`, borderRadius: 3 }}>
                    {on && <div style={{ position: "absolute", inset: 0, boxShadow: `0 0 16px ${CY}`, borderRadius: 3 }} />}
                  </div>
                )
              )}
              <div style={{
                // el estado apagado subió de 0.16 a 0.42: a 0.16 los números no se leían
                opacity: on ? ap : 0.42, transform: `scale(${on ? 1 : 0.92})`, flexShrink: 0,
                width: sz, height: sz, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: `3px solid ${cortado ? "#ff4d4d" : c}`,
                background: cortado ? "#ff4d4d10" : `${CY}14`,
                boxShadow: on && !cortado ? `0 0 44px ${c}55` : "none",
              }}>
                {on && <Snd at={at} s="pop.wav" v={0.28} />}
                <div style={{ fontSize: 44 + i * 8, fontWeight: 800, color: cortado ? "#ff8a8a" : i === hasta - 1 ? GO : "#fff", letterSpacing: -1.5 }}>{p}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {nota && (
        <div style={{ ...r(46), position: "absolute", left: 360, right: 360, top: 748, textAlign: "center", fontSize: 34, color: "#b8b8cc", fontWeight: 300, lineHeight: 1.35, textWrap: "balance" as const }}>{nota}</div>
      )}
    </AbsoluteFill>
  );
};

/** Las tres señales, con peso visual distinto: compartir pesa más. */
export const Senales: React.FC<{ dur: number; kicker: string; title: string; items: { t: string; d: string; peso: number }[] }> = ({ kicker, title, items }) => {
  const f = useCurrentFrame();
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 152, top: 0, bottom: 0, width: 1620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} />
        <div style={{ ...r(8), fontSize: 84, fontWeight: 800, letterSpacing: -3, color: "#fff", marginBottom: 56 }}>{title}</div>
        <div style={{ display: "flex", gap: 30 }}>
          {items.map((it, i) => {
            const ap = interpolate(f - (24 + i * 12), [0, 14], [0, 1], clamp);
            const c = i === items.length - 1 ? GO : CY;
            return (
              <div key={i} style={{ flex: it.peso, opacity: ap, transform: `translateY(${(1 - ap) * 20}px)` }}>
                <Snd at={24 + i * 12} s="tick.wav" v={0.24} />
                <div style={{ height: 12 + it.peso * 9, borderRadius: 7, background: c, boxShadow: `0 0 26px ${c}`, marginBottom: 28 }} />
                <div style={{ fontSize: 22, letterSpacing: 4, color: c, fontWeight: 800, marginBottom: 16 }}>{`0${i + 1}`}</div>
                <div style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1.0, letterSpacing: -2, marginBottom: 20 }}>{it.t}</div>
                <div style={{ fontSize: 30, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.34 }}>{it.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
