import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Las cuatro piezas fijas de un prompt, cada una con su color.
export const PIEZAS = [
  { k: "ROL", c: CY },
  { k: "CONTEXTO", c: VI },
  { k: "TAREA", c: GO },
  { k: "FORMATO", c: GR },
];

/**
 * LA ANATOMÍA DEL PROMPT — hero de la clase 2.2 (motivo cyan del Módulo 2).
 * Una tarjeta de prompt que se arma pieza por pieza: rol + contexto + tarea + formato.
 * Cada pieza es un bloque de color; las que faltan quedan como hueco punteado.
 * Objeto NUEVO (despiece por capas), distinto de la máquina de predicción de 2.1.
 *
 * `hasta`  = cuántas piezas están puestas (0..4). El resto se ve como placeholder.
 * `textos` = el texto de cada pieza [rol, contexto, tarea, formato].
 * `pobre`  = muestra el prompt pobre (una línea gris suelta) en lugar del despiece.
 */
export const Anatomia: React.FC<{
  hasta?: number; textos?: string[]; pobre?: string; cx?: number; scale?: number;
}> = ({ hasta = 4, textos = [], pobre, cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 640, borderRadius: 20, border: "1px solid rgba(255,255,255,.14)", background: "#0b0b16", boxShadow: "0 30px 90px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ height: 44, background: "#101020", display: "flex", alignItems: "center", gap: 10, paddingLeft: 20, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: CY, boxShadow: `0 0 12px ${CY}` }} />
          <span style={{ fontSize: 15, letterSpacing: 5, color: "#7d7d92", fontWeight: 800 }}>{pobre ? "TU PROMPT" : "TU PROMPT — 4 PIEZAS"}</span>
        </div>

        {pobre ? (
          <div style={{ padding: "40px 30px 46px" }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#8b8b9e", fontStyle: "italic" }}>“{pobre}”</div>
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, border: "2px solid #5a5a72", display: "flex", alignItems: "center", justifyContent: "center", color: "#5a5a72", fontWeight: 800 }}>?</div>
              <span style={{ fontSize: 19, color: "#6e6e86", fontWeight: 600 }}>Sin piezas. Predice el promedio.</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {PIEZAS.map((p, i) => {
              const on = i < hasta;
              const recien = i === hasta - 1;
              const grow = interpolate(f - (16 + i * 5), [0, 14], [0, 1], clamp);
              const pulse = recien ? 0.5 + Math.sin(f / 9) * 0.14 : 0.28;
              return (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", borderRadius: 12,
                  borderLeft: `4px solid ${on ? p.c : "rgba(255,255,255,.12)"}`,
                  background: on ? `linear-gradient(90deg,${p.c}18,transparent)` : "rgba(255,255,255,.02)",
                  border: on ? `1px solid ${p.c}44` : "1px dashed rgba(255,255,255,.12)",
                  borderLeftWidth: 4, opacity: on ? grow : 0.4,
                  boxShadow: on && recien ? `0 0 ${20 + pulse * 24}px ${p.c}44` : "none",
                  transform: on ? `translateX(${(1 - grow) * 24}px)` : "none",
                }}>
                  <div style={{ minWidth: 118, fontSize: 16, letterSpacing: 3, fontWeight: 800, color: on ? p.c : "#5a5a72", paddingTop: 3 }}>{p.k}</div>
                  <div style={{ flex: 1, fontSize: 21, fontWeight: on ? 600 : 500, color: on ? "#e8e8f0" : "#5a5a72", lineHeight: 1.28 }}>
                    {on ? (textos[i] || "") : "— falta —"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + la tarjeta de anatomía a la derecha. */
export const AnatomiaScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string;
  hasta?: number; textos?: string[]; pobre?: string; kc?: string;
}> = ({ kicker, lines, sub, hasta, textos, pobre, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Anatomia hasta={hasta} textos={textos} pobre={pobre} scale={0.84} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 700, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 78, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 30, fontSize: 29, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
