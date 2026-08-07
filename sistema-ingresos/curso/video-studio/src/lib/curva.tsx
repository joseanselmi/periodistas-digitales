import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Los doce meses del ejemplo: lectores acumulados. Plana al principio, se empina después.
export const MESES = [10, 22, 37, 62, 102, 172, 268, 400, 580, 820, 1140, 1560];

/**
 * LA CURVA J — hero de la clase 1.6 (estructura cronología).
 * Se dibuja mes a mes: `hasta` marca hasta qué mes llegó el recorrido.
 * `siembra` sombrea la zona plana del principio. `inflexion` marca el punto donde se despega.
 */
export const CurvaJ: React.FC<{
  hasta: number; siembra?: boolean; inflexion?: boolean; cx?: number; cy?: number; scale?: number;
}> = ({ hasta, siembra, inflexion, cx = 1240, cy = 540, scale = 1 }) => {
  const f = useCurrentFrame();
  const W = 760, H = 430;
  const maxV = MESES[MESES.length - 1];
  const px = (i: number) => (i / (MESES.length - 1)) * W;
  const py = (v: number) => H - (v / maxV) * H;

  const prog = interpolate(f, [8, 40], [0, 1], clamp);
  const n = Math.max(1, Math.round(hasta * prog));
  const pts = MESES.slice(0, n).map((v, i) => `${px(i)},${py(v)}`);
  const linea = pts.length > 1 ? `M${pts.join(" L")}` : "";
  const ultimo = n - 1;

  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%,-50%) scale(${scale})` }}>
      <svg width={W + 130} height={H + 120} viewBox={`-70 -50 ${W + 140} ${H + 130}`} style={{ overflow: "visible" }}>
        {/* ejes */}
        <line x1={0} y1={H} x2={W + 26} y2={H} stroke="rgba(255,255,255,.22)" strokeWidth={2} />
        <line x1={0} y1={H} x2={0} y2={-16} stroke="rgba(255,255,255,.22)" strokeWidth={2} />
        <text x={W + 34} y={H + 6} fill="#6e6e86" fontSize={19} fontFamily={F} fontWeight={700}>meses</text>
        <text x={-14} y={-26} fill="#6e6e86" fontSize={19} fontFamily={F} fontWeight={700} textAnchor="middle">lectores</text>

        {/* zona de siembra: el tramo plano del principio */}
        {siembra && (
          <g opacity={interpolate(f - 24, [0, 16], [0, 1], clamp)}>
            <rect x={0} y={0} width={px(3)} height={H} fill={`${GO}10`} stroke={`${GO}3a`} strokeDasharray="7 6" />
            <text x={px(1.5)} y={22} fill={GO} fontSize={17} fontWeight={800} letterSpacing={2} textAnchor="middle" fontFamily={F} opacity={0.85}>SIEMBRA</text>
          </g>
        )}

        {/* la curva */}
        {linea && <path d={linea} fill="none" stroke={CY} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 16px ${CY}aa)` }} />}

        {/* los puntos de cada mes */}
        {MESES.slice(0, n).map((v, i) => (
          <circle key={i} cx={px(i)} cy={py(v)} r={i === ultimo ? 9 : 5}
            fill={i === ultimo ? GO : CY} stroke="#07070f" strokeWidth={2}
            style={i === ultimo ? { filter: `drop-shadow(0 0 18px ${GO})` } : undefined} />
        ))}

        {/* rótulo del mes actual */}
        {n > 0 && (
          <g>
            <text x={px(ultimo)} y={py(MESES[ultimo]) - 26} fill={GO} fontSize={34} fontWeight={800} textAnchor="middle" fontFamily={F}
              style={{ filter: `drop-shadow(0 0 12px ${GO}88)` }}>{MESES[ultimo]}</text>
            <text x={px(ultimo)} y={H + 30} fill="#dcdcea" fontSize={20} fontWeight={800} textAnchor="middle" fontFamily={F}>mes {ultimo + 1}</text>
          </g>
        )}

        {/* punto de inflexión */}
        {inflexion && n > 5 && (
          <g opacity={interpolate(f - 30, [0, 14], [0, 1], clamp)}>
            <line x1={px(4)} y1={py(MESES[4]) - 8} x2={px(4)} y2={H + 8} stroke={GR} strokeWidth={3} strokeDasharray="8 6" />
            <text x={px(4) + 14} y={H - 16} fill={GR} fontSize={20} fontWeight={800} fontFamily={F}>PUNTO DE INFLEXIÓN</text>
          </g>
        )}
      </svg>
    </div>
  );
};

/** Escena de un mes: texto a la izquierda, la curva dibujándose a la derecha. */
export const MesScene: React.FC<{
  dur: number; mes: string; lines: string[]; sub?: string; hasta: number; siembra?: boolean; inflexion?: boolean; kc?: string;
}> = ({ mes, lines, sub, hasta, siembra, inflexion, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <CurvaJ hasta={hasta} siembra={siembra} inflexion={inflexion} scale={0.86} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 660, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ ...r(0), display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div style={{ width: 46, height: 3, background: GO, boxShadow: `0 0 12px ${GO}` }} />
          <span style={{ color: GO, fontSize: 23, fontWeight: 800, letterSpacing: 8 }}>{mes}</span>
        </div>
        <div style={{ ...r(8), fontSize: 80, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 32, fontSize: 29, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/**
 * LA HOJA DE AUDITORÍA — hero de la clase 1.7.
 * Las cuatro preguntas se van llenando a medida que el alumno contesta.
 * `hecha` = cuántas están respondidas. `resp` = qué se escribió en cada una.
 */
export const Hoja: React.FC<{ hecha: number; resp?: (string | null)[]; cx?: number; scale?: number }> = ({
  hecha, resp = [], cx = 1330, scale = 1,
}) => {
  const f = useCurrentFrame();
  const preguntas = [
    "¿Se sumó alguien a tu audiencia propia?",
    "¿Reconocés algún nombre?",
    "¿Alguien te compartió?",
    "¿Alguien te preguntó algo?",
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, fontFamily: F }}>
      <div style={{ width: 620, padding: "36px 38px", borderRadius: 18, background: "#0d0d18", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize: 21, letterSpacing: 6, color: GO, fontWeight: 800, marginBottom: 8 }}>TU HOJA</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 30, letterSpacing: -1 }}>Auditoría del mes</div>

        {preguntas.map((q, i) => {
          const on = i < hecha;
          const ap = interpolate(f - (10 + i * 8), [0, 12], [0, 1], clamp);
          const r = resp[i];
          return (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22, opacity: on ? ap : 0.26 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0, marginTop: 2,
                border: `2px solid ${on ? CY : "rgba(255,255,255,.2)"}`,
                background: on ? `${CY}22` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 19, fontWeight: 800, color: on ? CY : "#4a4a5e",
              }}>{on ? "✓" : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, color: on ? "#dcdcea" : "#6e6e86", fontWeight: 600, lineHeight: 1.25 }}>{q}</div>
                {on && r && (
                  <div style={{ marginTop: 8, fontSize: 26, color: GO, fontWeight: 800, fontFamily: F, borderBottom: `1px dashed ${GO}66`, display: "inline-block", paddingBottom: 3 }}>{r}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Escena de pregunta de la auditoría: el texto a la izquierda, la hoja llenándose a la derecha. */
export const AuditScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; hecha: number; resp?: (string | null)[]; kc?: string;
}> = ({ kicker, lines, sub, hecha, resp, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Hoja hecha={hecha} resp={resp} scale={0.9} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 700, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={kc} />
        <div style={{ ...r(8), fontSize: 78, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
          {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
        </div>
        {sub && <div style={{ ...r(24), marginTop: 30, fontSize: 28, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
