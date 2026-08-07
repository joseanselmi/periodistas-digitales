import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const VERDE = GR;

/**
 * MOSTRAR EL PROCESO — hero de la clase 3.4 (motivo VERDE del Módulo 3).
 * Una nota (título + cuerpo simulado) con una caja "Cómo lo verificamos" que se despliega abajo,
 * con líneas tildadas que aparecen una a una. Objeto NUEVO (la nota con su caja de proceso).
 * `pasos` = cuántas líneas de la caja se muestran (0..3).
 */
export const Proceso: React.FC<{ pasos?: number; cx?: number; scale?: number }> = ({ pasos = 3, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const lineas = [
    "La foto es de hoy: chequeada con búsqueda inversa.",
    "La cifra es del parte oficial, no de la que circulaba.",
    "Pedimos la otra versión; hasta el cierre, sin respuesta.",
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 580, borderRadius: 16, background: "#0b0b16", border: "1px solid rgba(255,255,255,.14)", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        {/* la nota */}
        <div style={{ padding: "24px 26px 6px" }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: VERDE, fontWeight: 800, marginBottom: 10 }}>LA NOTA</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>Corte de calle: qué pasó y quiénes estuvieron</div>
          {[100, 96, 88].map((w, i) => <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 4, background: "rgba(255,255,255,.10)", marginBottom: 10 }} />)}
        </div>
        {/* la caja de proceso */}
        <div style={{ margin: "12px 22px 22px", borderRadius: 12, background: `${VERDE}0e`, border: `1px solid ${VERDE}55` }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${VERDE}33`, fontSize: 15, letterSpacing: 2, fontWeight: 800, color: VERDE, display: "flex", alignItems: "center", gap: 8 }}>
            <span>✓</span> CÓMO LO VERIFICAMOS
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {lineas.slice(0, pasos).map((t, i) => {
              const grow = interpolate(f - (18 + i * 12), [0, 12], [0, 1], clamp);
              return (
                <div key={i} style={{ opacity: grow, transform: `translateY(${(1 - grow) * 10}px)`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${VERDE}22`, border: `1px solid ${VERDE}`, color: VERDE, fontWeight: 800, fontSize: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>✓</div>
                  <div style={{ fontSize: 19, color: "#dcdcea", fontWeight: 500, lineHeight: 1.3 }}>{t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProcesoScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; pasos?: number; kc?: string }> = ({ kicker, lines, sub, pasos, kc = VERDE }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Proceso pasos={pasos} scale={0.84} />
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
