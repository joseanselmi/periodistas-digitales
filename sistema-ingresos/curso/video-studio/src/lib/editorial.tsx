import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SideArt, Snd } from "./kit";

// ===== LIBRERÍA "EDITORIAL OSCURO" =====
// Titulares gigantes tipo tapa de diario · layout ASIMÉTRICO · gráfico sangrando · CERO espacio muerto.
// VARIANTES de EdStatement para que no se repita el mismo molde: normal | flip (ícono a la izq) | bare (sin ícono).
export const F = "Segoe UI, sans-serif";
export const CY = "#22d3ee", VI = "#a78bfa", GO = "#f5b642", IN = "#6366f1", GR = "#34d399";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const useR = () => {
  const f = useCurrentFrame();
  return (d = 0, dist = 30) => {
    const p = interpolate(f - d, [0, 16], [0, 1], clamp);
    return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
  };
};

export const Rule: React.FC<{ x?: number }> = ({ x = 112 }) => (
  <div style={{ position: "absolute", left: x, top: 120, bottom: 120, width: 2, background: "linear-gradient(180deg,rgba(255,255,255,.16),transparent)" }} />
);

export const Kick: React.FC<{ t: string; st?: React.CSSProperties; c?: string }> = ({ t, st, c = CY }) => (
  <div style={{ ...st, display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
    <div style={{ width: 46, height: 3, background: c, boxShadow: `0 0 12px ${c}` }} />
    <span style={{ color: c, fontSize: 23, fontWeight: 800, letterSpacing: 8 }}>{t}</span>
  </div>
);

/** Titular gigante. variant: "right" (ícono der) | "left" (ícono izq) | "bare" (sin ícono, título full-bleed). */
export const EdStatement: React.FC<{
  dur: number; kicker: string; lines: { t: string; a?: boolean }[]; sub?: string;
  art?: string; artColor?: string; size?: number; extra?: React.ReactNode; variant?: "right" | "left" | "bare" | "behind";
}> = ({ kicker, lines, sub, art, artColor, size = 138, extra, variant = "right" }) => {
  const r = useR();
  const f = useCurrentFrame();
  const gp = interpolate(f, [4, 34], [0, 1], clamp);
  const behind = variant === "behind" && !!art;
  const bare = (variant === "bare" || !art) && !behind;
  const flip = variant === "left";
  const textLeft = flip ? 800 : 152;
  const titleSize = bare || behind ? size + 20 : size;
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      {/* ícono: adentro del cuadro (margen 70px), nunca cortado por el borde */}
      {!bare && !behind && <SideArt name={art!} color={artColor} size={600} side={flip ? "left" : "right"} offset={70} maxOp={0.62} />}
      {/* variante "behind": ícono gigante centrado, MUY tenue, detrás del texto */}
      {behind && <SideArt name={art!} color={artColor} size={900} side="right" offset={510} maxOp={0.14} />}
      <Rule x={flip ? 760 : 112} />
      <div style={{ position: "absolute", left: textLeft, top: 0, bottom: 0, width: bare || behind ? 1560 : 1130, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} />
        <div style={{ ...r(8), fontSize: titleSize, fontWeight: 800, lineHeight: 0.93, letterSpacing: -4.5, color: "#fff", textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>
          {lines.map((l, i) => (
            <React.Fragment key={i}>
              <span style={l.a ? { color: CY } : undefined}>{l.t}</span>
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        {sub && (
          <div style={{ ...r(24), marginTop: 40, fontSize: 32, fontWeight: 300, color: "#9a9ab2", maxWidth: bare ? 1100 : 620, lineHeight: 1.35, textWrap: "balance" as const, borderLeft: "2px solid rgba(34,211,238,.5)", paddingLeft: 22 }}>{sub}</div>
        )}
        {extra && <div style={{ ...r(38, 18), marginTop: 50 }}>{extra}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Pull quote. full=true → versión centrada a pantalla, para no repetir el molde. */
export const EdQuote: React.FC<{ dur: number; kicker: string; a: string; b: string; full?: boolean }> = ({ kicker, a, b, full }) => {
  const r = useR();
  // El cuerpo se adapta al largo: si la frase no entra en UNA línea, se parte y deja una palabra
  // sola colgando abajo, que es lo primero que se nota en una placa centrada a pantalla.
  const longest = Math.max(a.length, b.length);
  const qs = longest > 30 ? 88 : longest > 24 ? 106 : 128;
  const qsInline = longest > 30 ? 84 : longest > 24 ? 98 : 116;
  if (full) {
    return (
      <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 1500 }}>
          <div style={{ ...r(0), display: "flex", justifyContent: "center", gap: 14, marginBottom: 34 }}>
            <div style={{ width: 70, height: 2, background: "rgba(255,255,255,.25)", alignSelf: "center" }} />
            <span style={{ fontSize: 23, letterSpacing: 8, color: "#8a8aa4", fontWeight: 800 }}>{kicker}</span>
            <div style={{ width: 70, height: 2, background: "rgba(255,255,255,.25)", alignSelf: "center" }} />
          </div>
          <div style={{ ...r(10), fontSize: qs, fontWeight: 800, lineHeight: 1.04, letterSpacing: -4, color: "#fff", textWrap: "balance" as const }}>
            {a}<br /><span style={{ color: CY, textShadow: `0 0 44px rgba(34,211,238,.35)` }}>{b}</span>
          </div>
          <div style={{ ...r(28), marginTop: 46, display: "flex", justifyContent: "center", gap: 12 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 99, background: i === 1 ? CY : "rgba(255,255,255,.25)" }} />)}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <div style={{ position: "absolute", left: 150, top: "50%", transform: "translateY(-50%)", width: 1520 }}>
        <div style={{ ...r(0), fontSize: 250, lineHeight: 0.5, color: CY, opacity: 0.3, fontWeight: 800, height: 86 }}>“</div>
        <div style={{ ...r(10), fontSize: qsInline, fontWeight: 800, lineHeight: 1.03, letterSpacing: -3.5, color: "#fff", marginTop: 24, textWrap: "balance" as const }}>
          {a}<br /><span style={{ color: CY }}>{b}</span>
        </div>
        <div style={{ ...r(26), marginTop: 44, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 100, height: 2, background: "rgba(255,255,255,.28)" }} />
          <span style={{ fontSize: 24, letterSpacing: 7, color: "#8a8aa4", fontWeight: 700 }}>{kicker}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Comparación asimétrica con prueba visual debajo de cada columna. */
export const EdSplit: React.FC<{
  dur: number;
  left: { label: string; title: string; sub: string; proof?: React.ReactNode };
  right: { label: string; title: string; sub: string; proof?: React.ReactNode };
}> = ({ left, right }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      {/* Antes las dos columnas flotaban centradas y dejaban el alto del cuadro vacío arriba y abajo.
          Ahora cada una es un panel que ocupa la altura: rótulo arriba, titular al medio, apoyo abajo. */}
      {/* space-between repartía el sobrante en una banda muerta ENTRE el titular y el pie, y eso se
          repetía en todas las escenas partidas. Ahora el trío rótulo+titular+pie va junto y centrado:
          el aire queda arriba y abajo, simétrico, que se lee como respiro y no como hueco. */}
      <div style={{ position: "absolute", left: 150, top: 132, bottom: 132, width: 1620, display: "flex", gap: 70 }}>
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ ...r(0), width: 84, height: 3, background: "#8c8ca2", marginBottom: 22 }} />
          <div style={{ ...r(0), fontSize: 22, letterSpacing: 7, color: "#9494a8", fontWeight: 800, marginBottom: 40 }}>{left.label}</div>
          <div style={{ ...r(8), fontSize: 96, fontWeight: 800, lineHeight: 0.96, letterSpacing: -3.5, color: "#9a9aae", whiteSpace: "pre-line" }}>{left.title}</div>
          <div style={{ ...r(20), marginTop: 40, fontSize: 29, color: "#9494a8", fontWeight: 300, maxWidth: 540, lineHeight: 1.35, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24, textWrap: "balance" as const }}>{left.sub}</div>
          {left.proof && <div style={{ ...r(40, 18), marginTop: 34 }}>{left.proof}</div>}
        </div>
        <div style={{ width: 2, background: "linear-gradient(180deg,transparent,rgba(255,255,255,.22),transparent)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ ...r(14), width: 84, height: 3, background: CY, marginBottom: 22, boxShadow: `0 0 18px ${CY}` }} />
          <div style={{ ...r(14), fontSize: 22, letterSpacing: 7, color: CY, fontWeight: 800, marginBottom: 40 }}>{right.label}</div>
          <div style={{ ...r(22), fontSize: 96, fontWeight: 800, lineHeight: 0.96, letterSpacing: -3.5, color: "#fff", textShadow: "0 0 40px rgba(34,211,238,.25)", whiteSpace: "pre-line" }}>{right.title}</div>
          <div style={{ ...r(32), marginTop: 40, fontSize: 29, color: "#b8b8cc", fontWeight: 300, maxWidth: 500, lineHeight: 1.35, borderTop: `1px solid ${CY}44`, paddingTop: 24, textWrap: "balance" as const }}>{right.sub}</div>
          {right.proof && <div style={{ ...r(50, 18), marginTop: 34 }}>{right.proof}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Lectores fluyendo al buzón; barrera "ALGORITMO" si es terreno prestado. */
export const Flow: React.FC<{ blocked?: boolean }> = ({ blocked }) => {
  const f = useCurrentFrame();
  const W = 540, H = 150, mid = 80, N = 8;
  const barrier = W * 0.6;
  const col = blocked ? "#6e6e86" : CY;
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <line x1={0} y1={mid} x2={W - 66} y2={mid} stroke="rgba(255,255,255,.10)" strokeWidth={2} strokeDasharray="5 9" />
      {blocked && (
        <>
          <line x1={barrier} y1={16} x2={barrier} y2={H - 16} stroke="#5a5a72" strokeWidth={3} strokeDasharray="9 9" />
          <text x={barrier + 14} y={30} fill="#5a5a72" fontSize={15} fontWeight={700} letterSpacing={3} fontFamily={F}>ALGORITMO</text>
        </>
      )}
      {Array.from({ length: N }).map((_, i) => {
        const t = ((f * 1.5 + i * 20) % 160) / 160;
        let x = t * (W - 76);
        let op = 1;
        const passes = !blocked || i % 4 === 0;
        if (blocked && !passes && x > barrier - 12) { op = Math.max(0, 1 - (x - (barrier - 12)) / 28); x = Math.min(x, barrier + 14); }
        return <circle key={i} cx={x} cy={mid} r={7} fill={col} opacity={op} style={{ filter: blocked ? "none" : `drop-shadow(0 0 9px ${CY})` }} />;
      })}
      <g transform={`translate(${W - 60}, ${mid - 24})`} stroke={col} fill="none" strokeWidth={2.4} style={{ filter: blocked ? "none" : `drop-shadow(0 0 14px ${CY})` }}>
        <rect x="0" y="0" width="54" height="40" rx="6" />
        <path d="M0 5l27 21L54 5" />
      </g>
    </svg>
  );
};

/** Barras que crecen a lo largo de TODA la escena (el activo que se acumula). */
export const StackBars: React.FC<{ color?: string; n?: number; dur?: number }> = ({ color = CY, n = 7, dur = 300 }) => {
  const f = useCurrentFrame();
  const start = 12;
  const step = Math.max(8, (dur * 0.8 - start) / n);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150 }}>
      {Array.from({ length: n }).map((_, i) => {
        const p = interpolate(f - (start + i * step), [0, 16], [0, 1], clamp);
        const h = (28 + i * 17) * p;
        return <div key={i} style={{ width: 44, height: h, borderRadius: 6, background: `linear-gradient(180deg,${color},${color}22)`, boxShadow: `0 0 18px ${color}55` }} />;
      })}
    </div>
  );
};

/** Monedas que se apilan a lo largo de TODA la escena (el capital que se acumula mientras se habla). */
export const CoinStack: React.FC<{ color?: string; n?: number; dur?: number }> = ({ color = VI, n = 10, dur = 300 }) => {
  const f = useCurrentFrame();
  const start = 14;
  const step = Math.max(10, (dur * 0.84 - start) / n);  // los depósitos se reparten por toda la escena
  const baseY = 224, gap = 18;
  const arrived = Math.min(n, Math.max(0, Math.floor((f - start) / step) + 1));
  return (
    <svg width={430} height={276} style={{ overflow: "visible" }}>
      <ellipse cx={150} cy={baseY + 14} rx={122} ry={12} fill={color} opacity={0.12} />
      {Array.from({ length: n }).map((_, i) => {
        const at = start + i * step;
        const p = interpolate(f - at, [0, 14], [0, 1], clamp);
        if (p <= 0) return null;
        const bounce = Math.sin(Math.min(1, p) * Math.PI) * 5;      // pequeño rebote al aterrizar
        const y = baseY - i * gap - (1 - p) * 90 + bounce;
        return (
          <g key={i} opacity={Math.min(1, p * 1.2)}>
            <Snd at={Math.round(at)} s="tick.wav" v={0.2} />
            <ellipse cx={150} cy={y} rx={78} ry={16} fill="#141726" stroke={color} strokeWidth={2.6} style={{ filter: `drop-shadow(0 0 10px ${color}66)` }} />
          </g>
        );
      })}
      <text x={150} y={baseY + 52} fill={color} fontSize={18} fontWeight={800} letterSpacing={3} textAnchor="middle" fontFamily={F}>
        {arrived} DEPÓSITOS
      </text>
    </svg>
  );
};

/** Ruido que pica y se apaga (mil posteos sin confianza). Se dibuja a lo largo de la escena. */
export const FlatNoise: React.FC<{ dur?: number }> = ({ dur = 300 }) => {
  const f = useCurrentFrame();
  const W = 520, H = 150, base = H - 26;
  const end = Math.max(44, dur * 0.8);
  const pts: string[] = [];
  for (let i = 0; i <= 44; i++) {
    const x = (i / 44) * W;
    const spike = i < 30 ? Math.abs(Math.sin(i * 0.9)) * Math.max(0, 34 - i * 1.1) : 0;
    pts.push(`${x.toFixed(1)},${(base - spike).toFixed(1)}`);
  }
  const draw = interpolate(f, [6, end], [0, 1], clamp);
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <line x1={0} y1={base} x2={W} y2={base} stroke="rgba(255,255,255,.08)" strokeWidth={2} />
      <polyline points={pts.join(" ")} fill="none" stroke="#6e6e86" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <text x={W - 4} y={base + 28} fill="#5a5a72" fontSize={17} fontWeight={800} letterSpacing={2} textAnchor="end" fontFamily={F}>SE APAGA</text>
    </svg>
  );
};

/** Línea que sube (crecimiento real) + sonido al llegar. */
export const RiseLine: React.FC<{ dur?: number }> = ({ dur = 300 }) => {
  const f = useCurrentFrame();
  const W = 520, H = 150, base = H - 26;
  const end = Math.max(46, dur * 0.82);
  const soundAt = Math.round(end);
  const yAt = (t: number) => base - Math.pow(t, 1.6) * (H - 54);
  const pts: string[] = [];
  for (let i = 0; i <= 44; i++) { const t = i / 44; pts.push(`${(t * W).toFixed(1)},${yAt(t).toFixed(1)}`); }
  const draw = interpolate(f, [8, end], [0, 1], clamp);
  const ex = draw * W, ey = yAt(draw);
  return (
    <>
      <Snd at={soundAt} s="ding.wav" v={0.4} />
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <line x1={0} y1={base} x2={W} y2={base} stroke="rgba(255,255,255,.08)" strokeWidth={2} />
        <polyline points={pts.join(" ")} fill="none" stroke={GR} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: `drop-shadow(0 0 12px ${GR})` }} />
        <circle cx={ex} cy={ey} r={9} fill={GR} style={{ filter: `drop-shadow(0 0 16px ${GR})` }} />
        <text x={W - 4} y={base + 28} fill={GR} fontSize={17} fontWeight={800} letterSpacing={2} textAnchor="end" fontFamily={F}>SE ACUMULA</text>
      </svg>
    </>
  );
};

/** Tarjetas editoriales. layout: "cols" (3 columnas altas) | "stack" (capas escalonadas). */
export const EdCards: React.FC<{ dur: number; kicker: string; title: string; cards: { tag: string; text: string; c?: string }[]; layout?: "cols" | "stack" }> = ({ kicker, title, cards, layout = "cols" }) => {
  const r = useR();
  const f = useCurrentFrame();
  if (layout === "stack") {
    return (
      <AbsoluteFill style={{ fontFamily: F }}>
        <Rule />
        <div style={{ position: "absolute", left: 152, top: 150, width: 1640 }}>
          <Kick t={kicker} st={r(0)} />
          <div style={{ ...r(8), fontSize: 92, fontWeight: 800, letterSpacing: -3.5, color: "#fff", marginBottom: 46 }}>{title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {cards.map((c, i) => {
              const ap = interpolate(f - (26 + i * 13), [0, 14], [0, 1], clamp);
              const col = c.c ?? CY;
              return (
                <div key={i} style={{ opacity: ap, transform: `translateX(${(1 - ap) * -30}px)`, marginLeft: i * 90, display: "flex", alignItems: "center", gap: 28, background: `linear-gradient(90deg,${col}1c,transparent)`, borderLeft: `4px solid ${col}`, padding: "26px 32px", borderRadius: "0 14px 14px 0", maxWidth: 1300 }}>
                  <Snd at={26 + i * 13} s="pop.wav" v={0.26} />
                  <span style={{ fontSize: 22, color: col, fontWeight: 800, letterSpacing: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: -1, minWidth: 380 }}>{c.tag}</span>
                  <span style={{ fontSize: 26, color: "#9a9ab2", fontWeight: 300 }}>{c.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Rule />
      <div style={{ position: "absolute", left: 152, top: 155, width: 1620 }}>
        <Kick t={kicker} st={r(0)} />
        <div style={{ ...r(8), fontSize: 92, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3.5, color: "#fff", marginBottom: 52 }}>{title}</div>
        <div style={{ display: "flex", gap: 26 }}>
          {cards.map((c, i) => {
            const ap = interpolate(f - (26 + i * 12), [0, 14], [0, 1], clamp);
            const col = c.c ?? CY;
            return (
              <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 26}px)`, flex: 1, minHeight: 300, borderTop: `3px solid ${col}`, background: `linear-gradient(180deg,${col}1a,transparent 92%)`, padding: "30px 26px 36px" }}>
                <Snd at={26 + i * 12} s="tick.wav" v={0.28} />
                <div style={{ fontSize: 21, letterSpacing: 5, color: col, fontWeight: 800, marginBottom: 18 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.02 }}>{c.tag}</div>
                <div style={{ fontSize: 27, color: "#9a9ab2", fontWeight: 300, lineHeight: 1.35 }}>{c.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Recap en DOS columnas (ocupa todo el alto). */
export const EdList: React.FC<{ dur: number; kicker: string; title: string; items: string[] }> = ({ kicker, title, items }) => {
  const r = useR();
  const f = useCurrentFrame();
  // Con 3 ítems o menos, dos columnas dejaban una fila huérfana y un hueco al costado:
  // en ese caso va una sola columna a ancho completo y con cuerpo más grande.
  const single = items.length <= 3;
  const half = single ? items.length : Math.ceil(items.length / 2);
  const cols = single ? [items] : [items.slice(0, half), items.slice(half)];
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Rule />
      <div style={{ position: "absolute", left: 152, top: 0, bottom: 0, width: 1620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} />
        <div style={{ ...r(8), fontSize: 92, fontWeight: 800, letterSpacing: -3.5, color: "#fff", marginBottom: 52 }}>{title}</div>
        <div style={{ display: "flex", gap: 64 }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: single ? 40 : 48 }}>
              {col.map((t, i) => {
                const idx = ci * half + i;
                const ap = interpolate(f - (22 + idx * 9), [0, 12], [0, 1], clamp);
                return (
                  <div key={i} style={{ opacity: ap, transform: `translateX(${(1 - ap) * -24}px)`, display: "flex", alignItems: "baseline", gap: 20, borderBottom: "1px solid rgba(255,255,255,.10)", paddingBottom: 18 }}>
                    <span style={{ fontSize: single ? 26 : 22, color: CY, fontWeight: 800, letterSpacing: 3, minWidth: single ? 54 : 44 }}>{String(idx + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: single ? 47 : 36, color: "#e8e8f0", fontWeight: 600, lineHeight: 1.15 }}>{t}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Tarea con PLACA rellenable (los corchetes en dorado). */
export const EdTask: React.FC<{ dur: number; kicker: string; big: string; ex: string; plate?: string[] }> = ({ kicker, big, ex, plate }) => {
  const r = useR();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Rule />
      <div style={{ position: "absolute", left: 152, top: 0, bottom: 0, width: 1620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kick t={kicker} st={r(0)} c={GO} />
        <div style={{ ...r(8), fontSize: 92, fontWeight: 800, lineHeight: 1.0, letterSpacing: -3.5, color: "#fff", whiteSpace: "pre-line" }}>{big}</div>
        {plate && (
          <div style={{ ...r(26, 20), marginTop: 46, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, background: "rgba(245,182,66,.07)", border: `2px dashed ${GO}88`, borderRadius: 16, padding: "30px 34px", maxWidth: 1400 }}>
            {plate.map((p, i) => {
              const isBlank = p.startsWith("[");
              const ap = interpolate(f - (34 + i * 8), [0, 12], [0, 1], clamp);
              // cada ítem es una pastilla separada (nunca se leen corridos como una sola frase)
              return isBlank ? (
                <span key={i} style={{ opacity: ap, fontSize: 44, fontWeight: 800, color: GO, borderBottom: `3px solid ${GO}`, paddingBottom: 4 }}>{p}</span>
              ) : (
                <span key={i} style={{ opacity: ap, fontSize: 32, fontWeight: 700, color: "#e8e8f0", border: `1px solid ${GO}55`, background: `${GO}12`, borderRadius: 10, padding: "12px 20px", display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 17, color: GO, fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</span>{p}
                </span>
              );
            })}
          </div>
        )}
        <div style={{ ...r(46), marginTop: 36, fontSize: 30, color: "#9a9ab2", fontWeight: 300, borderLeft: `2px solid ${GO}`, paddingLeft: 22, maxWidth: 1100 }}>{ex}</div>
      </div>
    </AbsoluteFill>
  );
};
