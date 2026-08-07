import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

type Msg = { de: "vos" | "ia"; t: string; pct?: number };

/**
 * EL CHAT ITERATIVO — hero de la clase 2.3 (motivo cyan del Módulo 2).
 * Un hilo de conversación: mensajes tuyos (derecha, cyan) y respuestas de la IA (izquierda, oscuras),
 * que aparecen de a uno. Cada respuesta de la IA puede traer un medidor "listo %" que sube en cada vuelta.
 * Objeto NUEVO (hilo de chat con burbujas), distinto de la máquina (2.1) y el despiece (2.2).
 *
 * `msgs` = lista de mensajes { de, t, pct? }. Se revelan de a uno con el correr de la escena.
 */
export const Chat: React.FC<{ msgs: Msg[]; cx?: number; scale?: number }> = ({ msgs, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const step = 16; // frames entre burbujas

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 640, borderRadius: 22, border: "1px solid rgba(255,255,255,.14)", background: "#0b0b16", boxShadow: "0 30px 90px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ height: 46, background: "#101020", display: "flex", alignItems: "center", gap: 10, paddingLeft: 20, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: CY, boxShadow: `0 0 12px ${CY}` }} />
          <span style={{ fontSize: 15, letterSpacing: 5, color: "#7d7d92", fontWeight: 800 }}>UNA MISMA CONVERSACIÓN</span>
        </div>

        <div style={{ padding: "24px 24px 26px", display: "flex", flexDirection: "column", gap: 14, minHeight: 380 }}>
          {msgs.map((m, i) => {
            const at = 14 + i * step;
            const ap2 = interpolate(f - at, [0, 12], [0, 1], clamp);
            if (ap2 <= 0) return null;
            const vos = m.de === "vos";
            return (
              <div key={i} style={{ display: "flex", justifyContent: vos ? "flex-end" : "flex-start", opacity: ap2, transform: `translateY(${(1 - ap2) * 14}px)` }}>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{ fontSize: 13, letterSpacing: 2, fontWeight: 800, color: vos ? CY : "#6e6e86", marginBottom: 5, textAlign: vos ? "right" : "left" }}>{vos ? "VOS" : "IA"}</div>
                  <div style={{
                    fontSize: 21, fontWeight: vos ? 700 : 500, lineHeight: 1.3, padding: "13px 17px", borderRadius: 14,
                    color: vos ? "#eafcff" : "#c9c9da",
                    background: vos ? `linear-gradient(135deg,${CY}28,${CY}10)` : "rgba(255,255,255,.05)",
                    border: vos ? `1px solid ${CY}55` : "1px solid rgba(255,255,255,.08)",
                    borderBottomRightRadius: vos ? 4 : 14, borderBottomLeftRadius: vos ? 14 : 4,
                  }}>{m.t}</div>
                  {m.pct !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 6, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${m.pct}%`, borderRadius: 6, background: m.pct >= 100 ? GR : CY, boxShadow: `0 0 12px ${m.pct >= 100 ? GR : CY}` }} />
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: m.pct >= 100 ? GR : CY, minWidth: 74 }}>{m.pct >= 100 ? "listo ✓" : `${m.pct}%`}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + el hilo de chat a la derecha. */
export const ChatScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; msgs: Msg[]; kc?: string;
}> = ({ kicker, lines, sub, msgs, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Chat msgs={msgs} scale={0.82} />
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

/** Una vuelta de corrección: instrucción corta tuya + qué ajusta la IA. Para las "vueltas que sirven". */
export const Vuelta: React.FC<{ dur: number; kicker: string; instruccion: string; efecto: string; n: number }> = ({ kicker, instruccion, efecto, n }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 150, top: 0, bottom: 0, right: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} />
        <div style={{ ...r(8), display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
          <div style={{ fontSize: 120, fontWeight: 800, color: `${CY}44`, lineHeight: 1 }}>{String(n).padStart(2, "0")}</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.02 }}>“{instruccion}”</div>
        </div>
        <div style={{ ...r(22), fontSize: 32, color: "#9a9ab2", fontWeight: 300, borderLeft: `3px solid ${CY}`, paddingLeft: 24, maxWidth: 1200 }}>{efecto}</div>
      </div>
    </AbsoluteFill>
  );
};
