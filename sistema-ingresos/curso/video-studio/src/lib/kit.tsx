/**
 * KIT DE VIDEO-CLASES ANIMADAS  ·  reutilizable entre proyectos
 * Marca: fondo #07070f + glow indigo #6366f1 / cyan #22d3ee, glassmorphism.
 * Contiene: constantes, helpers de animación, SFX, layouts y el motor ClaseVideo.
 * Requiere en public/: bg.png (fondo horneado) y sfx/*.wav (whoosh, tick, ding, pop, rise).
 */
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;
export const INK = "#f5f5fa";
export const CYAN = "#22d3ee";
export const GOLD = "#f5b642";
export const VIOLET = "#a78bfa";
export const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
export const accent: React.CSSProperties = { backgroundImage: "linear-gradient(100deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
const PAD = "110px 130px";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ---------- SONIDO ----------
export const Snd: React.FC<{ at: number; s: string; v?: number }> = ({ at, s, v = 0.45 }) => (
  <Sequence from={at} durationInFrames={50}><Audio src={staticFile(`sfx/${s}`)} volume={v} /></Sequence>
);

// ---------- HELPERS ----------
export const useRise = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (start: number, dist = 44): React.CSSProperties => {
    const p = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 120 } });
    const op = interpolate(frame - start, [0, 8], [0, 1], clamp);
    return { opacity: op, transform: `translateY(${(1 - p) * dist}px)` };
  };
};
// entrada parametrizable: 'rise' | 'left' | 'right' | 'scale'
export const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (start: number, kind: "rise" | "left" | "right" | "scale" = "rise", dist = 44): React.CSSProperties => {
    const p = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 120 } });
    const op = interpolate(frame - start, [0, 8], [0, 1], clamp);
    if (kind === "left") return { opacity: op, transform: `translateX(${(1 - p) * -dist}px)` };
    if (kind === "right") return { opacity: op, transform: `translateX(${(1 - p) * dist}px)` };
    if (kind === "scale") return { opacity: op, transform: `scale(${0.85 + p * 0.15})` };
    return { opacity: op, transform: `translateY(${(1 - p) * dist}px)` };
  };
};

const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={CYAN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
export const IIdea = () => svg(<><path d="M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3Z" /><path d="M9 20h6M10 22h4" /></>);
export const IComu = () => svg(<><circle cx="9" cy="8" r="3" /><path d="M15 11a3 3 0 1 0-2-5" /><path d="M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" /></>);
export const ICrecer = () => svg(<><path d="M4 18 10 12l4 4 6-7" /><path d="M15 7h5v5" /></>);
export const IStep = () => svg(<><path d="M5 20V6l9-2v14" /><path d="M5 20h9" /><path d="M14 9l5-1v10h-5" /></>);
export const IRepeat = () => svg(<><path d="M4 12a8 8 0 0 1 13-6l3 2" /><path d="M20 12a8 8 0 0 1-13 6l-3-2" /><path d="M20 4v4h-4M4 20v-4h4" /></>);
export const IStar = () => svg(<path d="M12 3l2.6 5.6L20 9.3l-4 4 1 6-5-2.8L7 19.3l1-6-4-4 5.4-.7L12 3Z" />);

export const Kicker: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - 4, [0, 16], [0, 66], clamp);
  const op = interpolate(frame - 4, [4, 16], [0, 1], clamp);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, color: CYAN, fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", marginBottom: 40 }}>
      <span style={{ width: w, height: 3, background: CYAN, boxShadow: `0 0 16px ${CYAN}` }} />
      <span style={{ opacity: op }}>{text}</span>
    </div>
  );
};

export const Scene: React.FC<{ dur: number; children: React.ReactNode; justify?: React.CSSProperties["justifyContent"] }> = ({ dur, children, justify = "center" }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 10, dur - 12, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ padding: PAD, justifyContent: justify, opacity: op }}>{children}</AbsoluteFill>;
};

// ================= LAYOUTS =================

export const Statement: React.FC<{ dur: number; kicker: string; lines: { t: string; a?: boolean }[]; sub?: string; progress?: boolean; art?: string }> = ({ dur, kicker, lines, sub, progress, art }) => {
  const rise = useRise();
  const frame = useCurrentFrame();
  const prog = interpolate(frame, [dur - 90, dur - 20], [0, 100], clamp);
  return (
    <Scene dur={dur}>
      {art && <SideArt name={art} />}
      <Kicker text={kicker} />
      <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
        {lines.map((l, i) => <div key={i} style={rise(18 + i * 7)}><span style={l.a ? accent : undefined}>{l.t}</span></div>)}
      </div>
      {sub && <div style={{ ...rise(18 + lines.length * 7 + 6, 26), fontSize: 36, color: "#b8b8c8", lineHeight: 1.4, maxWidth: 1300, marginTop: 40, fontWeight: 300 }}>{sub}</div>}
      {progress && <div style={{ marginTop: 70, maxWidth: 900 }}><div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><div style={{ height: "100%", width: `${prog}%`, borderRadius: 4, background: "linear-gradient(90deg,#6366f1,#22d3ee)", boxShadow: "0 0 14px rgba(34,211,238,.6)" }} /></div></div>}
    </Scene>
  );
};

export const Chips: React.FC<{ dur: number; kicker: string; title: string; chips: string[]; sfx?: boolean; art?: string }> = ({ dur, kicker, title, chips, sfx = true, art }) => {
  const rise = useRise();
  return (
    <Scene dur={dur}>
      {art && <SideArt name={art} />}
      <Kicker text={kicker} />
      <div style={{ ...rise(16), fontSize: 82, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 56 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, maxWidth: 1500 }}>
        {chips.map((c, i) => (
          <div key={i} style={{ ...rise(30 + i * 9), display: "inline-block" }}>
            {sfx && <Snd at={30 + i * 9} s="pop.wav" v={0.4} />}
            <div style={{ fontSize: 36, fontWeight: 600, padding: "24px 40px", borderRadius: 999, background: "rgba(19,21,38,.72)", border: "1px solid rgba(34,211,238,.35)", boxShadow: "0 12px 40px rgba(0,0,0,.4)" }}>{c}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

export const Cards3: React.FC<{ dur: number; kicker: string; title: string; cards: { icon: React.ReactNode; tag: string; text: string }[]; sfx?: boolean }> = ({ dur, kicker, title, cards, sfx = true }) => {
  const rise = useRise();
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <div style={{ ...rise(16), fontSize: 84, fontWeight: 800, lineHeight: 1.03, letterSpacing: -1.5 }}>{title}</div>
      <div style={{ display: "flex", gap: 30, marginTop: 60 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ ...rise(30 + i * 10, 90), flex: 1, background: "rgba(19,21,38,.72)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 24, padding: "44px 38px", boxShadow: "0 24px 70px rgba(0,0,0,.5)" }}>
            {sfx && <Snd at={30 + i * 10} s="pop.wav" v={0.4} />}
            <div style={{ width: 66, height: 66, borderRadius: 16, background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(34,211,238,.20))", border: "1px solid rgba(34,211,238,.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>{c.icon}</div>
            <div style={{ fontSize: 21, color: "#8a8aa0", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{c.tag}</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.22 }}>{c.text}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

export const Equals: React.FC<{ dur: number; kicker: string; title?: string; a: string; b: string; result: string; sfx?: boolean }> = ({ dur, kicker, title = "Tu medio, en 2 piezas", a, b, result, sfx = true }) => {
  const rise = useRise();
  const box = (hot?: boolean): React.CSSProperties => ({ flex: 1, textAlign: "center", fontSize: 40, fontWeight: 700, padding: "56px 32px", borderRadius: 24, background: hot ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(34,211,238,.18))" : "rgba(19,21,38,.72)", border: hot ? "1px solid rgba(34,211,238,.5)" : "1px solid rgba(255,255,255,.10)", boxShadow: "0 20px 60px rgba(0,0,0,.45)" });
  const op: React.CSSProperties = { fontSize: 60, color: CYAN, alignSelf: "center", textShadow: `0 0 18px ${CYAN}` };
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <div style={{ ...rise(16), fontSize: 78, fontWeight: 800, letterSpacing: -1.5, marginBottom: 56 }}>{title}</div>
      {sfx && <><Snd at={28} s="pop.wav" v={0.4} /><Snd at={44} s="pop.wav" v={0.4} /><Snd at={60} s="ding.wav" v={0.4} /></>}
      <div style={{ display: "flex", alignItems: "stretch", gap: 28 }}>
        <div style={rise(28)}><div style={box()}>{a}</div></div>
        <div style={{ ...rise(38), ...op }}>+</div>
        <div style={rise(44)}><div style={box()}>{b}</div></div>
        <div style={{ ...rise(54), ...op }}>=</div>
        <div style={rise(60)}><div style={box(true)}>{result}</div></div>
      </div>
    </Scene>
  );
};

export const TwoUp: React.FC<{ dur: number; kicker: string; title: string; left: { l: string; t: string }; right: { l: string; t: string }; sfx?: boolean }> = ({ dur, kicker, title, left, right, sfx = true }) => {
  const rise = useRise();
  const panel = (p: { l: string; t: string }) => (
    <div style={{ flex: 1, background: "rgba(19,21,38,.72)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 24, padding: "56px 48px", boxShadow: "0 24px 70px rgba(0,0,0,.5)" }}>
      <div style={{ color: CYAN, fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 22 }}>{p.l}</div>
      <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2 }}>{p.t}</div>
    </div>
  );
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <div style={{ ...rise(16), fontSize: 82, fontWeight: 800, letterSpacing: -1.5, marginBottom: 56 }}>{title}</div>
      {sfx && <><Snd at={30} s="pop.wav" v={0.4} /><Snd at={42} s="pop.wav" v={0.4} /></>}
      <div style={{ display: "flex", gap: 30 }}>
        <div style={{ ...rise(30, 80), flex: 1, display: "flex" }}>{panel(left)}</div>
        <div style={{ ...rise(42, 80), flex: 1, display: "flex" }}>{panel(right)}</div>
      </div>
    </Scene>
  );
};

export const TaskCard: React.FC<{ dur: number; kicker: string; label: string; big: string; ex: string }> = ({ dur, kicker, label, big, ex }) => {
  const rise = useRise();
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <Snd at={16} s="ding.wav" v={0.38} />
      <div style={{ ...rise(16, 60), background: "linear-gradient(120deg,rgba(99,102,241,.18),rgba(34,211,238,.10))", border: "1px solid rgba(99,102,241,.4)", borderRadius: 28, padding: "64px 68px", boxShadow: "0 0 60px rgba(99,102,241,.22)", maxWidth: 1500 }}>
        <div style={{ color: CYAN, fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 22 }}>{label}</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, whiteSpace: "pre-line" }}>{big}</div>
        <div style={{ fontSize: 32, color: "#c4c4d4", marginTop: 28, fontWeight: 300 }}>{ex}</div>
      </div>
    </Scene>
  );
};

export const Stat: React.FC<{ dur: number; kicker: string; to: number; unit: string; sub: string; sfx?: boolean }> = ({ dur, kicker, to, unit, sub, sfx = true }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [12, 60], [0, to], clamp));
  const underline = interpolate(f, [55, 82], [0, 560], clamp);
  const subOp = interpolate(f, [64, 78], [0, 1], clamp);
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      {sfx && <><Snd at={12} s="rise.wav" v={0.38} /><Snd at={60} s="ding.wav" v={0.42} /></>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
        <div style={{ fontSize: 300, fontWeight: 800, lineHeight: 1, ...accent }}>{n}</div>
        <div style={{ fontSize: 90, fontWeight: 800, color: INK }}>{unit}</div>
      </div>
      <div style={{ height: 6, width: underline, borderRadius: 6, background: CYAN, boxShadow: `0 0 18px ${CYAN}`, marginTop: 10 }} />
      <div style={{ fontSize: 40, color: "#b8b8c8", marginTop: 34, fontWeight: 300, opacity: subOp }}>{sub}</div>
    </Scene>
  );
};

export const Quote: React.FC<{ dur: number; kicker: string; a: string; b: string; sfx?: boolean }> = ({ dur, kicker, a, b, sfx = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({ frame: f - 8, fps, config: { damping: 10, stiffness: 100 } });
  const t = interpolate(f - 20, [0, 14], [0, 1], clamp);
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      {sfx && <Snd at={10} s="ding.wav" v={0.4} />}
      <div style={{ fontSize: 220, lineHeight: 0.6, color: CYAN, opacity: 0.5, transform: `scale(${0.4 + mark * 0.6})`, transformOrigin: "left" }}>&ldquo;</div>
      <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, maxWidth: 1400, opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>{a}<br /><span style={accent}>{b}</span></div>
    </Scene>
  );
};

export const Timeline: React.FC<{ dur: number; kicker: string; title: string; steps: string[]; sfx?: boolean }> = ({ dur, kicker, title, steps, sfx = true }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const fill = interpolate(f, [24, 96], [0, 1], clamp);
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <div style={{ ...rise(14), fontSize: 76, fontWeight: 800, letterSpacing: -1.5, marginBottom: 30 }}>{title}</div>
      <div style={{ position: "relative", marginTop: 40, height: 220 }}>
        <div style={{ position: "absolute", top: 60, left: 20, right: 20, height: 5, background: "rgba(255,255,255,.1)", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 60, left: 20, width: `calc((100% - 40px) * ${fill})`, height: 5, background: "linear-gradient(90deg,#6366f1,#22d3ee)", borderRadius: 5, boxShadow: `0 0 14px ${CYAN}` }} />
        {steps.map((s, i) => {
          const x = (i / (steps.length - 1)) * 100;
          const start = 28 + i * 18;
          const on = interpolate(f - start, [0, 10], [0, 1], clamp);
          return (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", opacity: on, width: 240 }}>
              {sfx && <Snd at={start} s="tick.wav" v={0.4} />}
              <div style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(135deg,#6366f1,#22d3ee)", margin: "48px auto 0", transform: `scale(${on})`, boxShadow: `0 0 16px ${CYAN}` }} />
              <div style={{ marginTop: 24, fontSize: 28, fontWeight: 700, color: INK }}>{s}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

export const Checklist: React.FC<{ dur: number; kicker: string; items: string[]; sfx?: boolean }> = ({ dur, kicker, items, sfx = true }) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>
        {items.map((it, i) => {
          const start = 20 + i * 20;
          const inn = interpolate(f - start, [0, 8], [0, 1], clamp);
          const tick = interpolate(f - start - 6, [0, 10], [0, 1], clamp);
          const done = tick > 0.5;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, opacity: inn, transform: `translateX(${(1 - inn) * 40}px)` }}>
              {sfx && <Snd at={start + 6} s="tick.wav" v={0.42} />}
              <div style={{ width: 56, height: 56, borderRadius: 14, border: `2px solid ${done ? CYAN : "rgba(255,255,255,.25)"}`, background: done ? "rgba(34,211,238,.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={CYAN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30 - tick * 30 }}><path d="M4 12l5 5L20 6" /></svg>
              </div>
              <div style={{ fontSize: 44, fontWeight: 600, color: done ? INK : "#9a9ab0" }}>{it}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

export const Split: React.FC<{ dur: number; kicker: string; title: string; sub: string; post: { user: string; headline: string }; sfx?: boolean }> = ({ dur, kicker, title, sub, post, sfx = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = useRise();
  const p = spring({ frame: f - 12, fps, config: { damping: 200, stiffness: 90 } });
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      {sfx && <Snd at={12} s="whoosh.wav" v={0.4} />}
      <div style={{ display: "flex", alignItems: "center", gap: 90, marginTop: 10 }}>
        <div style={{ width: 340, height: 680, borderRadius: 46, border: "10px solid #1b1d2e", background: "#0d0f1a", boxShadow: "0 40px 100px rgba(0,0,0,.6)", overflow: "hidden", transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + p * 0.1})`, opacity: interpolate(f - 12, [0, 10], [0, 1], clamp) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 18px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 999, background: "linear-gradient(135deg,#6366f1,#22d3ee)" }} />
            <div style={{ fontSize: 19, fontWeight: 700, color: INK }}>{post.user}</div>
          </div>
          <div style={{ height: 340, background: "linear-gradient(150deg,#141726,#0b1120)", display: "flex", alignItems: "flex-end", padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>{post.headline}</div>
          </div>
          <div style={{ display: "flex", gap: 16, padding: "16px 18px", color: CYAN, fontSize: 17 }}>&hearts; 1.2k &nbsp; &#128172; 84 &nbsp; &#8599; 320</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...rise(28), fontSize: 60, fontWeight: 800, letterSpacing: -1, color: INK, lineHeight: 1.1 }}>{title}</div>
          <div style={{ ...rise(42), fontSize: 34, color: "#b8b8c8", marginTop: 26, fontWeight: 300 }}>{sub}</div>
        </div>
      </div>
    </Scene>
  );
};

// ---- ROADMAP CANÓNICO del curso (13 módulos: M0..M11) ----
export const ROADMAP = ["Bienvenida", "Fundamentos", "IA", "Nicho", "Tu medio", "Contenido", "Comunidad", "Afiliados", "Anunciantes", "Producto", "Anuncios", "Escala"];

// ---- INNOVADOR: Mapa del curso con cámara que viaja ----
export const JourneyMap: React.FC<{ dur: number; kicker: string; title: string; stops: string[] }> = ({ dur, kicker, title, stops }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const nn = stops.length;
  const pts = stops.map((_, i) => ({ x: 150 + (i * 1620) / (nn - 1), y: 610 + Math.sin(i * 0.95) * 145 }));
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); total += l; }
  const p = interpolate(f, [22, dur - 22], [0, 1], clamp);
  let travel = p * total, tx = pts[0].x, ty = pts[0].y;
  for (let i = 0; i < seg.length; i++) { if (travel <= seg[i]) { const r = travel / seg[i]; tx = pts[i].x + (pts[i + 1].x - pts[i].x) * r; ty = pts[i].y + (pts[i + 1].y - pts[i].y) * r; break; } travel -= seg[i]; tx = pts[i + 1].x; ty = pts[i + 1].y; }
  const poly = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");
  let cum = 0; const nodeFrac = [0]; for (let i = 0; i < seg.length; i++) { cum += seg[i]; nodeFrac.push(cum / total); }
  return (
    <Scene dur={dur} justify="flex-start">
      <div style={{ marginTop: 20 }}><Kicker text={kicker} /></div>
      <div style={{ ...rise(14), fontSize: 74, fontWeight: 800, letterSpacing: -1.5 }}>{title}</div>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="jm" x1="0" x2="1"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        <polyline points={poly} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={poly} fill="none" stroke="url(#jm)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total * (1 - p)} style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }} />
        {pts.map((pt, i) => {
          const on = interpolate(p, [Math.max(0, nodeFrac[i] - 0.03), nodeFrac[i] + 0.02], [0, 1], clamp);
          return (
            <g key={i} opacity={on}>
              <text x={pt.x} y={pt.y - 30} fill="#f5f5fa" fontSize={20} fontWeight={700} textAnchor="middle" fontFamily="Segoe UI">{stops[i]}</text>
              <circle cx={pt.x} cy={pt.y} r={13} fill="#0d0f1a" stroke="#22d3ee" strokeWidth={3} />
            </g>
          );
        })}
        <circle cx={tx} cy={ty} r={11} fill="#22d3ee" style={{ filter: "drop-shadow(0 0 14px #22d3ee)" }} />
      </svg>
    </Scene>
  );
};

// ---- INNOVADOR: Terminal que escribe el prompt sola ----
export const Terminal: React.FC<{ dur: number; kicker: string; title: string; file: string; prompt: string }> = ({ dur, kicker, title, file, prompt }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const typeEnd = 24 + prompt.length * 1.05;
  const chars = Math.floor(interpolate(f, [24, typeEnd], [0, prompt.length], clamp));
  const done = chars >= prompt.length;
  const cursorOn = Math.floor(f / 12) % 2 === 0;
  const copied = interpolate(f, [typeEnd + 8, typeEnd + 20], [0, 1], clamp) > 0.5;
  return (
    <Scene dur={dur}>
      <Kicker text={kicker} />
      <Snd at={Math.round(typeEnd + 10)} s="ding.wav" v={0.4} />
      <div style={{ ...rise(14), fontSize: 68, fontWeight: 800, letterSpacing: -1.5, marginBottom: 34 }}>{title}</div>
      <div style={{ ...rise(20, 50), width: 1440, background: "#0b0e18", border: "1px solid rgba(34,211,238,.25)", borderRadius: 18, boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, background: "#ff5f56" }} /><span style={{ width: 14, height: 14, borderRadius: 99, background: "#ffbd2e" }} /><span style={{ width: 14, height: 14, borderRadius: 99, background: "#27c93f" }} />
          <span style={{ marginLeft: 14, color: "#8a8aa0", fontSize: 22, fontFamily: "Consolas, monospace" }}>{file}</span>
          <div style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 10, border: `1px solid ${copied ? "#22d3ee" : "rgba(255,255,255,.15)"}`, color: copied ? "#22d3ee" : "#8a8aa0", fontSize: 22, fontWeight: 700 }}>{copied ? "¡Copiado! ✓" : "Copiar ⧉"}</div>
        </div>
        <div style={{ padding: "36px 36px", fontFamily: "Consolas, monospace", fontSize: 34, lineHeight: 1.5, color: "#d6f7ff", minHeight: 300 }}>
          <span style={{ color: "#22d3ee" }}>&gt; </span>{prompt.slice(0, chars)}<span style={{ opacity: done ? 0 : cursorOn ? 1 : 0 }}>▋</span>
        </div>
      </div>
    </Scene>
  );
};

// ---- ARTE LATERAL: ícono grande decorativo para llenar el espacio ----
const bigIcons: Record<string, React.ReactNode> = {
  news: (<><rect x="3.5" y="5" width="17" height="14.5" rx="1.5" /><path d="M3.5 8.5h17" /><path d="M6 11.5h6M6 14h6M6 16.5h4" /><rect x="14.5" y="11.5" width="4" height="5" rx="0.5" /></>),
  screen: (<><rect x="3" y="4.5" width="18" height="12" rx="1.5" /><path d="M8.5 20h7M12 16.5v3.5" /><path d="M10.8 8.2l3.4 2.3-3.4 2.3z" /></>),
  coins: (<><ellipse cx="12" cy="6.5" rx="6.5" ry="2.6" /><path d="M5.5 6.5v5c0 1.45 2.9 2.6 6.5 2.6s6.5-1.15 6.5-2.6v-5" /><path d="M5.5 11.5v5c0 1.45 2.9 2.6 6.5 2.6s6.5-1.15 6.5-2.6v-5" /></>),
  growth: (<><path d="M3.5 18.5l5.5-5.5 3.5 3.5 7.5-8.5" /><path d="M15.5 7.5h5v5" /></>),
  chip: (<><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" /></>),
  people: (<><circle cx="9" cy="8" r="3" /><path d="M15 11a3 3 0 1 0-2-5" /><path d="M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" /></>),
  bulb: (<><path d="M9.5 18h5" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.5 1.3 1.2 1.3 2.4h5c0-1.2.7-1.9 1.3-2.4A6 6 0 0 0 12 3Z" /></>),
  rocket: (<><path d="M12 3c2.6 1.2 4.5 4 4.5 7.8L14 13.5H10L7.5 10.8C7.5 7 9.4 4.2 12 3Z" /><circle cx="12" cy="9" r="1.4" /><path d="M10 13.5l-2.3 4 3-1.2M14 13.5l2.3 4-3-1.2" /></>),
  target: (<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1.3" /></>),
};
const artColor: Record<string, string> = { coins: GOLD, growth: GOLD, people: VIOLET, news: VIOLET };
export const SideArt: React.FC<{ name: keyof typeof bigIcons | string; color?: string; size?: number }> = ({ name, color, size = 360 }) => {
  const f = useCurrentFrame();
  const c = color ?? artColor[name] ?? CYAN;
  const float = Math.sin(f / 22) * 10;
  const op = interpolate(f, [8, 30], [0, 0.5], clamp);
  return (
    <div style={{ position: "absolute", right: 170, top: "50%", transform: `translateY(-50%) translateY(${float}px)`, opacity: op }}>
      <div style={{ position: "absolute", inset: -70, borderRadius: "50%", background: `radial-gradient(closest-side, ${c}33, transparent)`, filter: "blur(24px)" }} />
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 26px ${c}66)`, position: "relative" }}>{bigIcons[name] ?? bigIcons.news}</svg>
    </div>
  );
};

// ---- FIRMA: línea de tiempo de progreso (cierre fijo de cada clase) ----
export const ProgressMap: React.FC<{ dur: number; kicker: string; stops: string[]; current: number; next?: number }> = ({ dur, kicker, stops, current, next }) => {
  const f = useCurrentFrame();
  const rise = useRise();
  const n = stops.length;
  const cw = Math.floor(1560 / n);
  const nodeSz = n > 7 ? 32 : 44;
  const fs = n > 7 ? 19 : 26;
  const fillTo = n > 1 ? current / (n - 1) : 0;
  const fill = interpolate(f, [24, dur - 24], [0, fillTo], clamp);
  const pulse = 1 + 0.1 * Math.sin(f / 6);
  return (
    <Scene dur={dur} justify="flex-start">
      <div style={{ marginTop: 20 }}><Kicker text={kicker} /></div>
      <div style={{ ...rise(14), fontSize: 70, fontWeight: 800, letterSpacing: -1.5 }}>Tu recorrido</div>
      <div style={{ position: "relative", marginTop: 130, height: 210, marginLeft: 30, marginRight: 30 }}>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, height: 5, background: "rgba(255,255,255,.1)", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 40, left: 0, width: `${fill * 100}%`, height: 5, background: "linear-gradient(90deg,#6366f1,#22d3ee)", borderRadius: 5, boxShadow: "0 0 14px #22d3ee" }} />
        {stops.map((s, i) => {
          const x = (i / (n - 1)) * 100;
          const done = i <= current;
          const isCur = i === current;
          const isNext = next != null && i === next;
          const on = interpolate(f, [26 + i * 8, 40 + i * 8], [0, 1], clamp);
          const sc = isCur ? pulse : 1;
          return (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", opacity: on, width: cw }}>
              {isCur && <Snd at={30} s="ding.wav" v={0.38} />}
              <div style={{ margin: "22px auto 0", width: nodeSz, height: nodeSz, borderRadius: 999, transform: `scale(${sc})`, background: done ? "linear-gradient(135deg,#6366f1,#22d3ee)" : isNext ? "rgba(99,102,241,.25)" : "rgba(255,255,255,.06)", border: done ? "none" : isNext ? "2px solid #6366f1" : "2px solid rgba(255,255,255,.15)", boxShadow: done || isCur ? "0 0 22px rgba(34,211,238,.6)" : isNext ? "0 0 16px rgba(99,102,241,.5)" : "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: nodeSz > 36 ? 20 : 15 }}>{done ? "✓" : i + 1}</div>
              <div style={{ marginTop: 14, fontSize: fs, fontWeight: 700, lineHeight: 1.1, color: isCur ? "#22d3ee" : isNext ? "#a9b0ff" : done ? "#f5f5fa" : "#7a7a90" }}>{s}</div>
              {isCur && <div style={{ marginTop: 8, fontSize: 15, color: "#22d3ee", fontWeight: 700, letterSpacing: 1 }}>ACÁ ESTÁS</div>}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ---- SUBTÍTULOS sincronizados a la voz ----
export const Caption: React.FC<{ lines: { s: number; e: number; t: string }[] }> = ({ lines }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const line = lines.find((l) => t >= l.s && t <= l.e + 0.15);
  if (!line) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 62, display: "flex", justifyContent: "center", pointerEvents: "none", padding: "0 130px" }}>
      <div style={{ maxWidth: 1500, padding: "14px 32px", borderRadius: 14, background: "rgba(7,7,15,.74)", color: "#fff", fontSize: 40, fontWeight: 600, textAlign: "center", lineHeight: 1.25, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 8px 30px rgba(0,0,0,.45)" }}>{line.t}</div>
    </div>
  );
};

// ================= MOTOR =================
export type SceneDef = { audio: string; sec: number; render: (dur: number) => React.ReactNode; whoosh?: boolean };
export const framesOf = (scenes: SceneDef[], fps = FPS) => scenes.map((s) => Math.round(s.sec * fps));
export const totalFrames = (scenes: SceneDef[], fps = FPS) => framesOf(scenes, fps).reduce((a, b) => a + b, 0);

export const ClaseVideo: React.FC<{ scenes: SceneDef[]; audioDir?: string; narration?: string; caps?: { s: number; e: number; t: string }[] }> = ({ scenes, audioDir, narration, caps }) => {
  const F = framesOf(scenes);
  let from = 0;
  const els = scenes.map((s, i) => {
    const dur = F[i];
    const el = (
      <Sequence key={i} from={from} durationInFrames={dur}>
        {!narration && audioDir && <Audio src={staticFile(`${audioDir}/${s.audio}`)} />}
        {s.whoosh !== false && <Snd at={0} s="whoosh.wav" v={0.38} />}
        {s.render(dur)}
      </Sequence>
    );
    from += dur;
    return el;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070f", fontFamily: FONT, color: INK }}>
      <Img src={staticFile("bg.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {narration && <Audio src={staticFile(narration)} />}
      {els}
      {caps && <Caption lines={caps} />}
    </AbsoluteFill>
  );
};
