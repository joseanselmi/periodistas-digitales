import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Snd } from "./kit";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const ETAPAS = [
  { t: "Alcance", w: 660, c: CY },
  { t: "Atención", w: 560, c: CY },
  { t: "Seguimiento", w: 460, c: VI },
  { t: "Audiencia propia", w: 370, c: VI },
  { t: "Ingreso", w: 280, c: GO },
];
const H = 88, GAP = 38;   // aire entre escalones: la línea "SE FRENA" entra sin tocar ninguna caja

/** Partículas que caen entre etapas: menos caudal a medida que baja. */
const Caudal: React.FC<{ i: number; x: number; y: number; w: number; color: string }> = ({ i, x, y, w, color }) => {
  const f = useCurrentFrame();
  const n = Math.max(2, 8 - i * 2);
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const t = ((f * 2 + k * 37 + i * 13) % 100) / 100;
        const px = x + ((k * 97) % Math.max(1, w - 40)) - w / 2 + 20;
        const py = y + t * GAP * 2;
        return <circle key={k} cx={px} cy={py} r={3.2} fill={color} opacity={0.75 * (1 - t)} />;
      })}
    </>
  );
};

/**
 * LA MÁQUINA — objeto central de la clase 1.2.
 * `active`: etapa iluminada (0-4). La "cámara" acompaña para centrarla.
 * `values`: números por etapa (ejemplo trabajado).
 * `breakAt`: etapa donde se traba el caudal (escenario roto).
 */
export const Machine: React.FC<{ active?: number; values?: string[]; breakAt?: number; cx?: number; scale?: number; topY?: number; traveler?: boolean }> = ({ active, values, breakAt, cx = 1310, scale = 1, topY = 230, traveler }) => {
  const f = useCurrentFrame();
  // cámara: centra la etapa activa PERO nunca sube el escalón 01 más allá del margen superior
  const camRaw = active != null ? -(active * (H + GAP)) * 0.55 : 0;
  const camY = Math.max(camRaw, 60 - topY);
  const camAnim = interpolate(f, [0, 18], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: 0, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "center" }}>
      <svg width={760} height={1080} viewBox="0 0 760 1080" style={{ overflow: "visible" }}>
        <g transform={`translate(0, ${camY * camAnim})`}>
          {ETAPAS.map((e, i) => {
            const y = topY + i * (H + GAP);
            const appear = interpolate(f - (8 + i * 9), [0, 14], [0, 1], clamp);
            const isOn = active == null || active === i;
            const dim = active != null && active !== i;
            const broken = breakAt != null && i > breakAt;
            const op = (broken ? 0.18 : dim ? 0.3 : 1) * appear;
            const sc = active === i ? 1.06 : 1;
            return (
              <g key={i} opacity={op} transform={`translate(${380 - (e.w * sc) / 2}, ${y}) scale(${sc},1)`} style={{ transformOrigin: "center" }}>
                <Snd at={8 + i * 9} s="tick.wav" v={0.2} />
                <rect x={0} y={0} width={e.w} height={H} rx={14}
                  fill={`${e.c}${active === i ? "33" : "1a"}`} stroke={e.c} strokeWidth={active === i ? 3 : 2}
                  style={{ filter: active === i ? `drop-shadow(0 0 26px ${e.c}aa)` : "none" }} />
                <text x={26} y={H / 2 + 9} fill="#fff" fontSize={28} fontWeight={800} fontFamily={F}>{e.t}</text>
                <text x={e.w - 24} y={H / 2 + 13} fill={e.c} fontSize={values ? 38 : 22} fontWeight={800} letterSpacing={values ? 0 : 2} textAnchor="end" fontFamily={F}
                  style={values ? { filter: `drop-shadow(0 0 12px ${e.c}88)` } : undefined}>
                  {values && values[i] ? values[i] : `0${i + 1}`}
                </text>
              </g>
            );
          })}
          {/* caudal entre etapas */}
          {ETAPAS.slice(0, -1).map((e, i) => {
            const y = topY + i * (H + GAP) + H;
            const broken = breakAt != null && i >= breakAt;
            if (broken) return null;
            return <Caudal key={i} i={i} x={380} y={y + 2} w={e.w} color={e.c} />;
          })}
          {/* LA LECTORA que va bajando por la máquina (recorrido de una persona real) */}
          {traveler && active != null && (() => {
            const ty = topY + active * (H + GAP) + H / 2;
            const ap = interpolate(f, [6, 22], [0, 1], clamp);
            const pulse = 1 + Math.sin(f / 8) * 0.12;
            // SIEMPRE por fuera de la caja de la etapa activa (si no, le tapa el texto: "Alc●ce")
            const tx = 380 + ETAPAS[active].w / 2 + 66;
            return (
              <g opacity={ap} transform={`translate(${tx}, ${ty})`}>
                <circle r={30 * pulse} fill={`${GR}22`} />
                <circle r={20} fill="#0b1020" stroke={GR} strokeWidth={3} style={{ filter: `drop-shadow(0 0 16px ${GR})` }} />
                <circle cx={0} cy={-5} r={6} fill={GR} />
                <path d="M-10 12 a10 10 0 0 1 20 0 z" fill={GR} />
                <text x={0} y={52} fill={GR} fontSize={19} fontWeight={800} letterSpacing={2} textAnchor="middle" fontFamily={F}>MARÍA</text>
              </g>
            );
          })()}
          {/* marca del punto donde se traba */}
          {breakAt != null && (
            <g opacity={interpolate(f - 30, [0, 12], [0, 1], clamp)}>
              <line x1={90} y1={topY + breakAt * (H + GAP) + H + GAP / 2} x2={470} y2={topY + breakAt * (H + GAP) + H + GAP / 2}
                stroke="#ff6b6b" strokeWidth={4} strokeDasharray="10 8" />
              <text x={492} y={topY + breakAt * (H + GAP) + H + GAP / 2 + 8} fill="#ff6b6b" fontSize={22} fontWeight={800} letterSpacing={3} textAnchor="start" fontFamily={F}>SE FRENA ACÁ</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

/** Escena con la máquina + bloque de texto a la izquierda. */
export const MachineScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; active?: number; values?: string[]; breakAt?: number; kc?: string; traveler?: boolean; flip?: boolean }> = ({ kicker, lines, sub, active, values, breakAt, kc = CY, traveler, flip }) => {
  const r = useR();
  // flip: la máquina pasa a la izquierda y el texto a la derecha. Rompe la monotonía del layout
  // en las tandas largas donde el mismo objeto vuelve escena tras escena.
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Machine active={active} values={values} breakAt={breakAt} traveler={traveler} cx={flip ? 610 : 1310} />
      <div style={{ position: "absolute", left: flip ? 1010 : 140, top: 0, bottom: 0, width: 830, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 86, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 34, fontSize: 30, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** PAUSA DE RECUERDO: la pregunta + anillo que late. Momento distinto del resto de la clase. */
export const PausaRecuerdo: React.FC<{ dur: number; pregunta: string; respuesta?: string[] }> = ({ dur, pregunta, respuesta }) => {
  const f = useCurrentFrame();
  const r = useR();
  const pulse = 1 + Math.sin(f / 9) * 0.045;
  const revealAt = Math.min(30, dur * 0.18);   // las respuestas entran temprano y se ven casi toda la escena
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", border: `2px solid ${CY}55`, transform: `scale(${pulse})`, boxShadow: `0 0 120px ${CY}26 inset` }} />
      <div style={{ ...r(0), fontSize: 24, letterSpacing: 9, color: CY, fontWeight: 800, marginBottom: 30, zIndex: 2 }}>PARÁ UN SEGUNDO</div>
      {/* la pregunta iba en 70 y quedaba chica frente a las otras placas centradas del video (~120) */}
      <div style={{ ...r(8), fontSize: respuesta ? 76 : 106, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2.5, color: "#fff", maxWidth: respuesta ? 1180 : 1340, zIndex: 2 }}>{pregunta}</div>
      {respuesta && (
        <div style={{ marginTop: 48, display: "flex", gap: 14, zIndex: 2, justifyContent: "center", maxWidth: 1720 }}>
          {respuesta.map((t, i) => {
            const at = revealAt + i * 9;
            const ap = interpolate(f - at, [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 18}px)`, padding: "26px 26px", borderRadius: 16, border: `1px solid ${CY}77`, background: `${CY}16`, boxShadow: `0 0 24px ${CY}22`, minWidth: 244 }}>
                <Snd at={Math.round(at)} s="pop.wav" v={0.3} />
                <div style={{ fontSize: 22, color: CY, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>{`0${i + 1}`}</div>
                <div style={{ fontSize: 35, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{t}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Dos escenarios lado a lado: la misma máquina, frenada en etapas distintas. */
export const DosEscenarios: React.FC<{ dur: number; kicker: string; title: string; leftLabel: string; rightLabel: string }> = ({ kicker, title, leftLabel, rightLabel }) => {
  const r = useR();
  // Título arriba con aire propio · máquinas centradas · cada rótulo pegado DEBAJO de su máquina.
  const SC = 0.86, TOPBOX = 150, TOPY = 150, LABELY = 790;
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 62, textAlign: "center" }}>
        <div style={{ ...r(0), display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 40, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 21, fontWeight: 800, letterSpacing: 8 }}>{kicker}</span>
        </div>
        <div style={{ ...r(8), fontSize: 66, fontWeight: 800, letterSpacing: -2.5, color: "#fff" }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 480, top: TOPBOX, transform: `scale(${SC})`, transformOrigin: "top center" }}>
        <Machine breakAt={1} cx={0} topY={TOPY} />
      </div>
      <div style={{ position: "absolute", left: 1440, top: TOPBOX, transform: `scale(${SC})`, transformOrigin: "top center" }}>
        <Machine breakAt={2} cx={0} topY={TOPY} />
      </div>
      {[{ x: 130, t: leftLabel, c: CY }, { x: 1090, t: rightLabel, c: VI }].map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x, top: LABELY, width: 700, textAlign: "center" }}>
          <div style={{ width: 54, height: 3, background: b.c, margin: "0 auto 16px" }} />
          <div style={{ fontSize: 30, color: "#dcdcea", fontWeight: 600, lineHeight: 1.3 }}>{b.t}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
