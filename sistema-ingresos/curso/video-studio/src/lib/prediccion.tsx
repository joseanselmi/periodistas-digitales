import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * LA MÁQUINA DE PREDICCIÓN — hero de la clase 2.1 (motivo cyan del Módulo 2).
 * Muestra una frase que se está armando: un texto base + candidatos a "palabra que sigue",
 * cada uno con su barra de probabilidad. El más probable se enciende y se engancha a la frase.
 * Es un objeto NUEVO, no visto en M0/M1: acá el hero es un MOTOR que predice, no un gráfico de datos.
 *
 * `base`     = lo que ya está escrito (la frase hasta ahora).
 * `cand`     = candidatos [{ w: palabra, p: 0..1 }], ordenados de mayor a menor.
 * `elegido`  = índice del candidato que gana (default 0). -1 = ninguno todavía (solo muestra el abanico).
 * `enganchado` = si true, la palabra ganadora ya quedó pegada al final de la frase.
 */
export const Prediccion: React.FC<{
  base: string; cand: { w: string; p: number }[]; elegido?: number; enganchado?: boolean;
  cx?: number; scale?: number;
}> = ({ base, cand, elegido = 0, enganchado, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  const win = cand[elegido];
  // la ganadora "vuela" hacia la frase entre los frames 40 y 58
  const fly = enganchado ? 1 : interpolate(f, [40, 58], [0, elegido >= 0 ? 1 : 0], clamp);
  const cursorOn = Math.floor(f / 15) % 2 === 0;

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 620, borderRadius: 22, border: "1px solid rgba(255,255,255,.14)", background: "#0b0b16", boxShadow: "0 30px 90px rgba(0,0,0,.6)", overflow: "hidden" }}>
        {/* barra superior tipo "motor" */}
        <div style={{ height: 46, background: "#101020", display: "flex", alignItems: "center", gap: 10, paddingLeft: 20, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: CY, boxShadow: `0 0 12px ${CY}` }} />
          <span style={{ fontSize: 15, letterSpacing: 5, color: "#7d7d92", fontWeight: 800 }}>MOTOR DE PREDICCIÓN</span>
        </div>

        {/* la frase que se está construyendo */}
        <div style={{ padding: "30px 30px 20px", fontSize: 34, fontWeight: 700, color: "#e8e8f0", lineHeight: 1.3, minHeight: 100 }}>
          {base}{" "}
          {(enganchado || fly > 0.98) && win && <span style={{ color: CY, textShadow: `0 0 18px ${CY}88` }}>{win.w}</span>}
          <span style={{ opacity: cursorOn ? 0.9 : 0.1, color: CY, fontWeight: 400 }}>▏</span>
        </div>

        {/* el abanico de candidatos con sus barras de probabilidad */}
        <div style={{ padding: "6px 30px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 14, letterSpacing: 3, color: "#5a5a72", fontWeight: 800, marginBottom: 14 }}>PALABRA QUE SIGUE — CANDIDATAS</div>
          {cand.map((c, i) => {
            const on = i === elegido;
            const grow = interpolate(f - (18 + i * 6), [0, 16], [0, 1], clamp);
            const pulse = on ? 0.55 + Math.sin(f / 8) * 0.12 : 0;
            const flyUp = on ? fly : 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: 1 - flyUp, transform: `translateY(${-flyUp * 22}px)` }}>
                <div style={{ width: 132, fontSize: 24, fontWeight: 800, color: on ? CY : "#8b8b9e", textAlign: "right" }}>{c.w}</div>
                <div style={{ flex: 1, height: 22, borderRadius: 7, background: "rgba(255,255,255,.05)", overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${c.p * 100 * grow}%`, borderRadius: 7, background: on ? `linear-gradient(90deg,${CY},${CY}77)` : "rgba(255,255,255,.16)", boxShadow: on ? `0 0 ${16 + pulse * 20}px ${CY}` : "none" }} />
                </div>
                <div style={{ width: 60, fontSize: 20, fontWeight: 800, color: on ? CY : "#6e6e86", textAlign: "left" }}>{Math.round(c.p * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + la máquina a la derecha. */
export const PrediccionScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string;
  base: string; cand: { w: string; p: number }[]; elegido?: number; enganchado?: boolean; kc?: string;
}> = ({ kicker, lines, sub, base, cand, elegido, enganchado, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Prediccion base={base} cand={cand} elegido={elegido} enganchado={enganchado} scale={0.84} />
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

/**
 * EL ENTRENAMIENTO — variante para "cómo aprendió a predecir".
 * Un texto con una palabra tapada; la máquina intenta adivinarla, falla, se ajusta y acierta.
 * `estado`: "tapada" (se ve el hueco) · "fallo" (arriesga mal, en rojo) · "acierto" (acierta, en verde).
 */
export const Entrena: React.FC<{ frase: string; oculta: string; arriesga?: string; estado?: "tapada" | "fallo" | "acierto"; cx?: number; scale?: number }> = ({
  frase, oculta, arriesga, estado = "tapada", cx = 1300, scale = 1,
}) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const color = estado === "acierto" ? GR : estado === "fallo" ? "#ff6b6b" : "#5a5a72";
  const shown = estado === "tapada" ? "•••••" : estado === "fallo" ? arriesga : oculta;
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F, width: 640 }}>
      <div style={{ fontSize: 15, letterSpacing: 5, color: "#5a5a72", fontWeight: 800, marginBottom: 20 }}>ADIVINÁ LA PALABRA TAPADA</div>
      <div style={{ fontSize: 40, fontWeight: 700, color: "#e8e8f0", lineHeight: 1.4 }}>
        {frase}{" "}
        <span style={{
          color, fontWeight: 800,
          borderBottom: `3px solid ${color}`, padding: "0 8px",
          textShadow: estado !== "tapada" ? `0 0 18px ${color}88` : "none",
        }}>{shown}</span>
      </div>
      <div style={{ marginTop: 26, fontSize: 22, fontWeight: 800, letterSpacing: 2, color, height: 26 }}>
        {estado === "fallo" ? "✗ ERRÓ · SE AJUSTA" : estado === "acierto" ? "✓ ACERTÓ · REFUERZA" : ""}
      </div>
    </div>
  );
};

/** Escena del entrenamiento: texto a la izquierda + el juego de adivinar a la derecha. */
export const EntrenaScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string;
  frase: string; oculta: string; arriesga?: string; estado?: "tapada" | "fallo" | "acierto"; kc?: string;
}> = ({ kicker, lines, sub, frase, oculta, arriesga, estado, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Entrena frase={frase} oculta={oculta} arriesga={arriesga} estado={estado} scale={0.9} />
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
