import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, VI, GO, GR, CY, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const VIO = VI; // motivo del Módulo 5

const LeftText: React.FC<{ kicker: string; lines: string[]; sub?: string; kc: string; w?: number }> = ({ kicker, lines, sub, kc, w = 700 }) => {
  const r = useR();
  return (
    <div style={{ position: "absolute", left: 135, top: 0, bottom: 0, width: w, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Kick t={kicker} st={r(0)} c={kc} />
      <div style={{ ...r(8), fontSize: 76, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3, color: "#fff" }}>
        {lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}<span style={i === lines.length - 1 ? { color: kc } : undefined}>{l}</span></React.Fragment>)}
      </div>
      {sub && <div style={{ ...r(24), marginTop: 28, fontSize: 28, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35, borderLeft: `2px solid ${kc}88`, paddingLeft: 20 }}>{sub}</div>}
    </div>
  );
};

// ============ 5.1 · EL ZOOM (un foco que se angosta e intensifica) ============
export const Zoom: React.FC<{ foco?: number; cx?: number; scale?: number }> = ({ foco = 1, cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  const fo = interpolate(f, [10, 40], [0.15, foco], clamp); // 0 = abierto/tenue, 1 = angosto/fuerte
  const R = 210 - fo * 130; // el círculo de luz se achica al enfocar
  // puntos: todos dispersos; un cúmulo central que se ilumina al enfocar
  const pts = Array.from({ length: 40 }, (_, i) => {
    const a = i * 137.5 * (Math.PI / 180);
    const rad = 30 + (i % 7) * 34;
    return { x: Math.cos(a) * rad, y: Math.sin(a) * rad, core: rad < 90 };
  });
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <svg width={520} height={520} viewBox="-260 -260 520 520" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="haz" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={VIO} stopOpacity={0.28 + fo * 0.35} />
            <stop offset="70%" stopColor={VIO} stopOpacity={0.05} />
            <stop offset="100%" stopColor={VIO} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={R} fill="url(#haz)" stroke={VIO} strokeWidth={2} strokeOpacity={0.4 + fo * 0.4} style={{ filter: `drop-shadow(0 0 ${10 + fo * 26}px ${VIO}88)` }} />
        {pts.map((p, i) => {
          const dentro = Math.hypot(p.x, p.y) < R;
          const on = dentro && (fo < 0.5 || p.core);
          return <circle key={i} cx={p.x} cy={p.y} r={on ? 7 : 5} fill={on ? VIO : "#4a4a5e"} opacity={on ? 1 : 0.5} style={on ? { filter: `drop-shadow(0 0 8px ${VIO})` } : undefined} />;
        })}
      </svg>
      <div style={{ textAlign: "center", marginTop: 2, fontSize: 19, letterSpacing: 3, fontWeight: 800, color: VIO }}>{fo > 0.6 ? "ENFOCADO: MÁS FUERTE" : "ABIERTO: DÉBIL"}</div>
    </div>
  );
};
export const ZoomScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; foco?: number }> = ({ kicker, lines, sub, foco }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Zoom foco={foco} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} /></AbsoluteFill>
);

// ============ 5.2 · LA INTERSECCIÓN (3 círculos: pasión/demanda/dinero) ============
export const Interseccion: React.FC<{ activos?: number; cx?: number; scale?: number }> = ({ activos = 3, cx = 1320, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  const circ = [
    { x: 0, y: -70, c: VIO, k: "PASIÓN" },
    { x: -78, y: 66, c: CY, k: "DEMANDA" },
    { x: 78, y: 66, c: GO, k: "DINERO" },
  ];
  const centro = activos >= 3;
  const pulse = 0.5 + Math.sin(f / 9) * 0.16;
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <svg width={480} height={480} viewBox="-240 -240 480 480" style={{ overflow: "visible" }}>
        {circ.map((c, i) => {
          const on = i < activos;
          const grow = interpolate(f - (14 + i * 8), [0, 14], [0, 1], clamp);
          return (
            <g key={i} opacity={(on ? 1 : 0.18) * grow}>
              <circle cx={c.x} cy={c.y} r={125} fill={`${c.c}1c`} stroke={c.c} strokeWidth={2.5} style={on ? { filter: `drop-shadow(0 0 12px ${c.c}66)` } : undefined} />
              <text x={c.x} y={c.y + (i === 0 ? -78 : 92)} textAnchor="middle" fill={on ? c.c : "#5a5a72"} fontSize={22} fontWeight={800} fontFamily={F} letterSpacing={2}>{c.k}</text>
            </g>
          );
        })}
        {centro && (
          <g opacity={interpolate(f - 34, [0, 14], [0, 1], clamp)}>
            <circle r={34} fill={`${VIO}33`} stroke="#fff" strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 ${16 + pulse * 22}px ${VIO})` }} />
            <text y={6} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800} fontFamily={F}>★</text>
          </g>
        )}
      </svg>
      <div style={{ textAlign: "center", marginTop: 2, fontSize: 19, letterSpacing: 3, fontWeight: 800, color: centro ? VIO : "#6e6e86" }}>{centro ? "TU NICHO: EL CENTRO" : "FALTA UN CÍRCULO"}</div>
    </div>
  );
};
export const InterseccionScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; activos?: number }> = ({ kicker, lines, sub, activos }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Interseccion activos={activos} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} /></AbsoluteFill>
);

// ============ 5.3 · LAS SEÑALES DE DEMANDA + PUNTO JUSTO ============
export const Demanda: React.FC<{ activas?: number; punto?: "amplio" | "justo" | "chico"; cx?: number; scale?: number }> = ({ activas = 4, punto, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const senales = ["Busca el tema", "Pregunta y repregunta", "Se junta en comunidades", "Ya consume y paga"];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 560, borderRadius: 16, background: "#0b0b16", border: "1px solid rgba(255,255,255,.14)", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ height: 46, background: "#141024", display: "flex", alignItems: "center", gap: 10, paddingLeft: 18, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: VIO, boxShadow: `0 0 12px ${VIO}` }} />
          <span style={{ fontSize: 15, letterSpacing: 4, color: "#8a8aa4", fontWeight: 800 }}>SEÑALES DE DEMANDA</span>
        </div>
        <div style={{ padding: "18px 20px 6px", display: "flex", flexDirection: "column", gap: 12 }}>
          {senales.map((s, i) => {
            const on = i < activas;
            const grow = interpolate(f - (16 + i * 8), [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: on ? grow : 0.3 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${on ? VIO : "#4a4a5e"}`, background: on ? `${VIO}22` : "transparent", color: on ? VIO : "#4a4a5e", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{on ? "✓" : i + 1}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: on ? "#e8e8f0" : "#6e6e86" }}>{s}</div>
              </div>
            );
          })}
        </div>
        {/* medidor del punto justo */}
        {punto && (
          <div style={{ padding: "14px 20px 20px", marginTop: 6 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, color: "#6e6e86", fontWeight: 800, marginBottom: 8 }}>EL PUNTO JUSTO</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["amplio", "Muy amplio"], ["justo", "Justo"], ["chico", "Muy chico"]].map(([k, t]) => {
                const on = punto === k;
                const col = k === "justo" ? GR : "#6e6e86";
                return <div key={k} style={{ flex: 1, textAlign: "center", padding: "10px 4px", borderRadius: 8, fontSize: 16, fontWeight: 800, color: on ? (k === "justo" ? "#07070f" : "#fff") : "#6e6e86", background: on ? (k === "justo" ? GR : "#3a3a4e") : "rgba(255,255,255,.04)", border: on ? "none" : "1px solid rgba(255,255,255,.08)" }}>{t}</div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export const DemandaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; activas?: number; punto?: "amplio" | "justo" | "chico" }> = ({ kicker, lines, sub, activas, punto }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Demanda activas={activas} punto={punto} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} w={660} /></AbsoluteFill>
);

// ============ 5.4 · LAS PUERTAS (mismo tema, tu puerta se ilumina) ============
export const Puertas: React.FC<{ mia?: number; cx?: number; scale?: number }> = ({ mia = 1, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const pulse = 0.55 + Math.sin(f / 9) * 0.16;
  const puertas = ["", "", ""];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      {/* la casa = el tema */}
      <div style={{ width: 520, height: 340, borderRadius: 16, background: "linear-gradient(160deg,#181828,#0d0d18)", border: "1px solid rgba(255,255,255,.14)", position: "relative", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", fontSize: 16, letterSpacing: 4, color: "#8a8aa4", fontWeight: 800 }}>EL MISMO TEMA</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "0 40px" }}>
          {puertas.map((_, i) => {
            const es = i === mia;
            const grow = interpolate(f - (16 + i * 8), [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{ width: 96, height: es ? 190 : 150, borderRadius: "10px 10px 0 0", opacity: grow, background: es ? `linear-gradient(180deg,${VIO}44,${VIO}12)` : "rgba(255,255,255,.04)", border: `2px solid ${es ? VIO : "rgba(255,255,255,.14)"}`, borderBottom: "none", boxShadow: es ? `0 0 ${20 + pulse * 26}px ${VIO}66` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 18, gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 99, background: es ? VIO : "#4a4a5e" }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: es ? VIO : "#5a5a72", letterSpacing: 1, writingMode: "vertical-rl" as const, transform: "rotate(180deg)" }}>{es ? "TU ÁNGULO" : "otro"}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 19, letterSpacing: 3, fontWeight: 800, color: VIO }}>DISTINTAS PUERTAS DE ENTRADA</div>
    </div>
  );
};
export const PuertasScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; mia?: number }> = ({ kicker, lines, sub, mia }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Puertas mia={mia} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} /></AbsoluteFill>
);

// ============ 5.5 · EL AVATAR (ficha de lector que se completa) ============
export const Avatar: React.FC<{ piezas?: number; cx?: number; scale?: number }> = ({ piezas = 4, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  const campos = [
    { k: "QUIÉN ES", v: "Sofía, 38. Trabaja mucho, cuida cada peso.", c: VIO },
    { k: "QUÉ LE DUELE", v: "Gastar en lugares caros que decepcionan.", c: "#ff8a6b" },
    { k: "QUÉ DESEA", v: "Descubrir lugares buenos y baratos.", c: GR },
    { k: "CÓMO HABLA", v: "“Un lugar rico y que no te fundás.”", c: CY },
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 580, borderRadius: 18, background: "#0b0b16", border: "1px solid rgba(255,255,255,.14)", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, background: "#141024", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: `${VIO}22`, border: `2px solid ${VIO}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: VIO, fontWeight: 800 }}>S</div>
          <div style={{ fontSize: 20, letterSpacing: 3, color: "#8a8aa4", fontWeight: 800 }}>TU LECTOR IDEAL</div>
        </div>
        <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {campos.map((c, i) => {
            const on = i < piezas;
            const grow = interpolate(f - (16 + i * 9), [0, 12], [0, 1], clamp);
            return (
              <div key={i} style={{ opacity: on ? grow : 0.28, transform: `translateY(${on ? (1 - grow) * 8 : 0}px)`, borderLeft: `3px solid ${on ? c.c : "#3a3a4e"}`, paddingLeft: 14 }}>
                <div style={{ fontSize: 13, letterSpacing: 2, fontWeight: 800, color: on ? c.c : "#5a5a72", marginBottom: 3 }}>{c.k}</div>
                <div style={{ fontSize: 21, fontWeight: 600, color: on ? "#e8e8f0" : "#5a5a72" }}>{on ? c.v : "…"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export const AvatarScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; piezas?: number }> = ({ kicker, lines, sub, piezas }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Avatar piezas={piezas} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} w={640} /></AbsoluteFill>
);

// ============ 5.6 · LA PROMESA + EL FILTRO (propuesta + línea sí/no) ============
export const Propuesta: React.FC<{ modo?: "promesa" | "linea"; cx?: number; scale?: number }> = ({ modo = "linea", cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 20], [0, 1], clamp);
  if (modo === "promesa") {
    return (
      <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
        <div style={{ width: 600, borderRadius: 16, background: `linear-gradient(160deg,${VIO}18,transparent)`, border: `1px solid ${VIO}66`, padding: "26px 28px", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
          <div style={{ fontSize: 14, letterSpacing: 4, color: VIO, fontWeight: 800, marginBottom: 14 }}>TU PROPUESTA EDITORIAL</div>
          <div style={{ fontSize: 27, fontWeight: 700, color: "#eee", lineHeight: 1.4 }}>
            Para <span style={{ color: CY, fontWeight: 800 }}>quien come rico sin gastar</span>, el medio que te hace descubrir los <span style={{ color: VIO, fontWeight: 800 }}>bodegones de barrio con historia</span>, contados por <span style={{ color: GO, fontWeight: 800 }}>alguien de adentro</span>.
          </div>
          <div style={{ marginTop: 16, fontSize: 18, color: "#9a9ab2", fontStyle: "italic" }}>para quién · qué le das · desde dónde</div>
        </div>
      </div>
    );
  }
  const si = ["Bodegones buenos y baratos", "Historias de las familias", "Comer rico gastando poco"];
  const no = ["Alta cocina de autor", "Cadenas y lugares caros", "Polémicas del ambiente"];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F, display: "flex", gap: 16 }}>
      {[{ t: "TEMAS SÍ", items: si, c: GR, ic: "✓" }, { t: "TEMAS NO", items: no, c: "#ff6b6b", ic: "✗" }].map((col, ci) => (
        <div key={ci} style={{ width: 290, borderRadius: 16, background: "#0b0b16", border: `1px solid ${col.c}44`, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
          <div style={{ padding: "12px 16px", background: `${col.c}18`, borderBottom: `1px solid ${col.c}44`, fontSize: 16, letterSpacing: 3, fontWeight: 800, color: col.c }}>{col.t}</div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {col.items.map((it, i) => {
              const grow = interpolate(f - (16 + (ci * 3 + i) * 7), [0, 12], [0, 1], clamp);
              return (
                <div key={i} style={{ opacity: grow, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: col.c, fontWeight: 800, fontSize: 18 }}>{col.ic}</span>
                  <span style={{ fontSize: 19, color: "#dcdcea", fontWeight: 500, lineHeight: 1.25 }}>{it}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
export const PropuestaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; modo?: "promesa" | "linea" }> = ({ kicker, lines, sub, modo }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Propuesta modo={modo} scale={0.82} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={VIO} w={620} /></AbsoluteFill>
);
