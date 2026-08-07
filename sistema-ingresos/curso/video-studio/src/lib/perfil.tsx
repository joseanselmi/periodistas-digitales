import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Snd } from "./kit";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * EL PERFIL VISTO POR UN DESCONOCIDO — hero de la clase 1.4.
 * Un mockup de perfil con el reloj de tres segundos corriendo. `paso` marca qué mira Ana:
 * 1 = la promesa (bio) · 2 = el conjunto (la grilla) · 3 = decide.
 * `coherente` cambia la grilla: piezas de la misma familia vs. piezas dispersas.
 * Distinto de la escalera de 1.2 y de la boca de 1.3: acá el objeto es una PANTALLA.
 */
export const Perfil: React.FC<{
  paso?: 1 | 2 | 3; coherente?: boolean; bio?: string; sigue?: boolean; cx?: number; scale?: number;
}> = ({ paso = 1, coherente = true, bio = "Noticias de actualidad", sigue, cx = 1330, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 24], [0, 1], clamp);
  const W = 560;

  // el foco: un halo que resalta lo que Ana está mirando en este paso
  const focoY = paso === 1 ? 100 : paso === 2 ? 168 : 520;
  const focoH = paso === 1 ? 76 : paso === 2 ? 344 : 70;
  const pulse = 0.5 + Math.sin(f / 10) * 0.18;

  // la grilla: coherente = misma familia de color; dispersa = colores que no conversan
  const piezas = coherente
    ? [CY, CY, CY, CY, CY, CY]
    : [CY, GO, VI, "#ff6b6b", GR, "#8b8b9e"];

  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap }}>
      <div style={{ width: W, borderRadius: 22, border: "1px solid rgba(255,255,255,.16)", background: "#0b0b16", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        {/* barra superior tipo app */}
        <div style={{ height: 46, background: "#12121f", display: "flex", alignItems: "center", paddingLeft: 18, gap: 8 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 99, background: "rgba(255,255,255,.22)" }} />)}
        </div>

        {/* cabecera del perfil */}
        <div style={{ padding: "26px 26px 18px", display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: 99, background: `${CY}22`, border: `2px solid ${CY}`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 15, width: "62%", borderRadius: 4, background: "rgba(255,255,255,.55)", marginBottom: 12 }} />
            <div style={{ fontSize: 20, color: paso === 1 ? "#fff" : "#7d7d92", fontWeight: 600, lineHeight: 1.25, fontFamily: F }}>{bio}</div>
          </div>
        </div>

        {/* la grilla de publicaciones */}
        <div style={{ padding: "6px 26px 26px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {piezas.map((c, i) => {
            const on = interpolate(f - (18 + i * 4), [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 10, opacity: on,
                background: `linear-gradient(140deg, ${c}30, ${c}0c)`,
                border: `1px solid ${c}${paso === 2 ? "99" : "3a"}`,
              }} />
            );
          })}
        </div>

        {/* el botón de seguir */}
        {sigue !== undefined && (
          <div style={{ padding: "0 26px 26px" }}>
            <div style={{
              height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F, fontSize: 21, fontWeight: 800, letterSpacing: 1,
              background: sigue ? CY : "transparent", color: sigue ? "#07070f" : "#6e6e86",
              border: sigue ? "none" : "1px solid rgba(255,255,255,.18)",
              boxShadow: sigue ? `0 0 34px ${CY}88` : "none",
            }}>{sigue ? "SIGUIENDO" : "SEGUIR"}</div>
          </div>
        )}
      </div>

      {/* el foco de atención sobre lo que mira en este paso */}
      <div style={{
        position: "absolute", left: -14, width: W + 28, top: focoY, height: focoH,
        border: `2px solid ${GO}`, borderRadius: 14, opacity: pulse,
        boxShadow: `0 0 30px ${GO}55`, pointerEvents: "none",
      }} />
    </div>
  );
};

/** El reloj de tres segundos: se llena mientras dura la escena. */
export const Reloj: React.FC<{ seg: 1 | 2 | 3; x?: number; y?: number }> = ({ seg, x = 1330, y = 92 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [6, 20], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", display: "flex", gap: 12, alignItems: "center", opacity: ap, fontFamily: F }}>
      {[1, 2, 3].map((n) => {
        const on = n <= seg;
        return (
          <div key={n} style={{
            width: 46, height: 46, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 21, fontWeight: 800,
            background: on ? `${GO}22` : "transparent",
            border: `2px solid ${on ? GO : "rgba(255,255,255,.16)"}`,
            color: on ? GO : "#4a4a5e",
            boxShadow: on && n === seg ? `0 0 26px ${GO}88` : "none",
          }}>{n}</div>
        );
      })}
      <span style={{ marginLeft: 10, fontSize: 19, letterSpacing: 5, color: "#7d7d92", fontWeight: 700 }}>SEGUNDOS</span>
    </div>
  );
};

/** Escena: texto a la izquierda + el perfil a la derecha, con el reloj arriba. */
export const PerfilScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string;
  seg?: 1 | 2 | 3; paso?: 1 | 2 | 3; coherente?: boolean; bio?: string; sigue?: boolean; kc?: string;
}> = ({ kicker, lines, sub, seg, paso, coherente, bio, sigue, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Perfil paso={paso} coherente={coherente} bio={bio} sigue={sigue} scale={0.82} />
      {seg && <Reloj seg={seg} />}
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 760, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 82, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 32, fontSize: 29, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Dos perfiles lado a lado: el coherente convierte, el disperso no. */
export const DosPerfiles: React.FC<{ dur: number; kicker: string; title: string; izq: string; der: string }> = ({ kicker, title, izq, der }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 74, textAlign: "center" }}>
        <div style={{ ...r(0), display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 44, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 21, fontWeight: 800, letterSpacing: 8 }}>{kicker}</span>
        </div>
        <div style={{ ...r(8), fontSize: 66, fontWeight: 800, letterSpacing: -2.5, color: "#fff" }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 250, top: "46%" }}><Perfil paso={2} coherente cx={0} scale={0.56} sigue bio="Lo que pasa en el Concejo, para vecinos" /></div>
      <div style={{ position: "absolute", left: 1240, top: "46%" }}><Perfil paso={2} coherente={false} cx={0} scale={0.56} sigue={false} bio="Un poco de todo, sin línea clara" /></div>
      {/* rótulos por encima de la banda de subtítulos (que vive abajo del cuadro): top 792, no 900 */}
      {[{ x: 0, t: izq, c: CY }, { x: 990, t: der, c: "#8b8b9e" }].map((b, i) => (
        <div key={i} style={{ ...r(40), position: "absolute", left: b.x, top: 792, width: 930, textAlign: "center" }}>
          <div style={{ width: 54, height: 3, background: b.c, margin: "0 auto 14px" }} />
          <div style={{ fontSize: 30, color: "#dcdcea", fontWeight: 700, lineHeight: 1.25 }}>{b.t}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
