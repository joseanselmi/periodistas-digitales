import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;
const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
const CYAN = "#22d3ee";
const GOLD = "#f5b642";
const VIOLET = "#a78bfa";
const PAD = "110px 130px";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Label: React.FC<{ n: number; text: string }> = ({ n, text }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [2, 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 70, left: 130, display: "flex", alignItems: "center", gap: 16, opacity: op }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 }}>{n}</div>
      <div style={{ color: "#8a8aa0", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>{text}</div>
    </div>
  );
};

const Wrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 10, dur - 12, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ padding: PAD, justifyContent: "center", opacity: op }}>{children}</AbsoluteFill>;
};

// 1 — NUMERO QUE CUENTA
const CountUp: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [12, 60], [0, 30], clamp));
  const underline = interpolate(f, [55, 80], [0, 520], clamp);
  return (
    <Wrap dur={dur}>
      <Label n={1} text="Número que cuenta" />
      <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
        <div style={{ fontSize: 300, fontWeight: 800, lineHeight: 1, backgroundImage: "linear-gradient(160deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{n}</div>
        <div style={{ fontSize: 90, fontWeight: 800, color: "#f5f5fa" }}>días</div>
      </div>
      <div style={{ height: 6, width: underline, borderRadius: 6, background: CYAN, boxShadow: `0 0 18px ${CYAN}`, marginTop: 10 }} />
      <div style={{ fontSize: 40, color: "#b8b8c8", marginTop: 36, fontWeight: 300 }}>para tener tu medio funcionando</div>
    </Wrap>
  );
};

// 2 — CHECKLIST QUE SE TILDA
const Checklist: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const items = ["Elegí tu nicho", "Creá tu cuenta profesional", "Cargá tu identidad", "Publicá tu primera nota"];
  return (
    <Wrap dur={dur}>
      <Label n={2} text="Checklist que se tilda" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 30 }}>
        {items.map((it, i) => {
          const start = 20 + i * 22;
          const inn = interpolate(f - start, [0, 8], [0, 1], clamp);
          const tick = interpolate(f - start - 6, [0, 10], [0, 1], clamp);
          const done = tick > 0.5;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, opacity: inn, transform: `translateX(${(1 - inn) * 40}px)` }}>
              <div style={{ width: 58, height: 58, borderRadius: 14, border: `2px solid ${done ? CYAN : "rgba(255,255,255,.25)"}`, background: done ? "rgba(34,211,238,.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke={CYAN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30 - tick * 30 }}><path d="M4 12l5 5L20 6" /></svg>
              </div>
              <div style={{ fontSize: 46, fontWeight: 600, color: done ? "#f5f5fa" : "#9a9ab0" }}>{it}</div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
};

// 3 — MOCKUP DE CELULAR (split)
const Phone: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - 12, fps: FPS, config: { damping: 200, stiffness: 90 } });
  const rise = (s: number) => ({ opacity: interpolate(f - s, [0, 8], [0, 1], clamp), transform: `translateY(${(1 - spring({ frame: f - s, fps: FPS, config: { damping: 200 } })) * 30}px)` });
  return (
    <Wrap dur={dur}>
      <Label n={3} text="Mockup de celular" />
      <div style={{ display: "flex", alignItems: "center", gap: 90, marginTop: 20 }}>
        <div style={{ width: 360, height: 720, borderRadius: 48, border: "10px solid #1b1d2e", background: "#0d0f1a", boxShadow: "0 40px 100px rgba(0,0,0,.6)", overflow: "hidden", transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + p * 0.1})`, opacity: interpolate(f - 12, [0, 10], [0, 1], clamp) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 20px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: "linear-gradient(135deg,#6366f1,#22d3ee)" }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f5f5fa" }}>@TuMedio</div>
          </div>
          <div style={{ height: 360, background: "linear-gradient(150deg,#141726,#0b1120)", display: "flex", alignItems: "flex-end", padding: 22 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>Confirmado: la noticia que todos comparten</div>
          </div>
          <div style={{ display: "flex", gap: 18, padding: "18px 20px", color: CYAN }}>♥ 1.2k &nbsp; 💬 84 &nbsp; ↗ 320</div>
          <div style={{ padding: "0 20px", fontSize: 18, color: "#c4c4d4" }}>Lo que significa para tu barrio…</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...rise(28), fontSize: 60, fontWeight: 800, letterSpacing: -1, color: "#f5f5fa", lineHeight: 1.1 }}>Así se ve tu medio,<br />de verdad.</div>
          <div style={{ ...rise(42), fontSize: 34, color: "#b8b8c8", marginTop: 26, fontWeight: 300 }}>Mockups reales, armados en el mismo estilo de tu marca.</div>
        </div>
      </div>
    </Wrap>
  );
};

// 4 — LINEA DE TIEMPO
const Timeline: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const steps = ["Fundamentos", "Tu medio", "Contenido", "Monetización"];
  const fill = interpolate(f, [20, 90], [0, 1], clamp);
  return (
    <Wrap dur={dur}>
      <Label n={4} text="Línea de tiempo" />
      <div style={{ position: "relative", marginTop: 60, height: 260 }}>
        <div style={{ position: "absolute", top: 60, left: 20, right: 20, height: 5, background: "rgba(255,255,255,.1)", borderRadius: 5 }} />
        <div style={{ position: "absolute", top: 60, left: 20, width: `calc((100% - 40px) * ${fill})`, height: 5, background: "linear-gradient(90deg,#6366f1,#22d3ee)", borderRadius: 5, boxShadow: `0 0 14px ${CYAN}` }} />
        {steps.map((s, i) => {
          const x = (i / (steps.length - 1)) * 100;
          const start = 24 + i * 20;
          const on = interpolate(f - start, [0, 10], [0, 1], clamp);
          return (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", opacity: on }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(135deg,#6366f1,#22d3ee)", margin: "48px auto 0", transform: `scale(${on})`, boxShadow: `0 0 16px ${CYAN}` }} />
              <div style={{ marginTop: 26, fontSize: 30, fontWeight: 700, color: "#f5f5fa", width: 260 }}>{s}</div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
};

// 5 — CITA A PANTALLA
const Quote: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mark = spring({ frame: f - 8, fps: FPS, config: { damping: 10, stiffness: 100 } });
  const t = interpolate(f - 20, [0, 14], [0, 1], clamp);
  return (
    <Wrap dur={dur}>
      <Label n={5} text="Frase a pantalla" />
      <div style={{ fontSize: 220, lineHeight: 0.6, color: CYAN, opacity: 0.5, transform: `scale(${0.4 + mark * 0.6})`, transformOrigin: "left" }}>“</div>
      <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, maxWidth: 1400, opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
        No escribas para que te aplaudan.<br /><span style={{ backgroundImage: "linear-gradient(100deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Escribí para que te reenvíen.</span>
      </div>
    </Wrap>
  );
};

// 6 — TRANSICION CON BARRIDO
const Wipe: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const rev = interpolate(f, [30, 75], [100, 0], clamp);
  const edge = interpolate(f, [30, 75], [0, 100], clamp);
  const panel = (bg: string, text: string, sub: string): React.ReactNode => (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 120 }}>
      <div style={{ fontSize: 88, fontWeight: 800, color: "#fff" }}>{text}</div>
      <div style={{ fontSize: 36, color: "rgba(255,255,255,.7)", marginTop: 18 }}>{sub}</div>
    </AbsoluteFill>
  );
  return (
    <Wrap dur={dur}>
      <Label n={6} text="Transición con barrido" />
      <div style={{ position: "absolute", inset: "180px 130px 130px", borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.5)" }}>
        {panel("linear-gradient(135deg,#141726,#0b1120)", "Antes", "una escena")}
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${rev}% 0 0)` }}>{panel("linear-gradient(135deg,#4338ca,#0891b2)", "Después", "la siguiente")}</div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${edge}%`, width: 6, background: CYAN, boxShadow: `0 0 24px ${CYAN}` }} />
      </div>
    </Wrap>
  );
};

// 7 — MOTIVO POR MODULO
const Motif: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mods = [
    { c: CYAN, name: "IA", icon: <><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /></> },
    { c: GOLD, name: "Monetización", icon: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" /></> },
    { c: VIOLET, name: "Contenido", icon: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></> },
  ];
  return (
    <Wrap dur={dur}>
      <Label n={7} text="Un sabor por módulo" />
      <div style={{ fontSize: 56, fontWeight: 800, marginTop: 20, marginBottom: 44, color: "#f5f5fa" }}>Misma marca, distinto sabor</div>
      <div style={{ display: "flex", gap: 30 }}>
        {mods.map((m, i) => {
          const start = 24 + i * 12;
          const p = spring({ frame: f - start, fps: FPS, config: { damping: 200, stiffness: 110 } });
          return (
            <div key={i} style={{ flex: 1, borderRadius: 24, padding: 44, background: `linear-gradient(160deg, ${m.c}22, rgba(19,21,38,.7))`, border: `1px solid ${m.c}66`, boxShadow: `0 20px 60px rgba(0,0,0,.45), 0 0 40px ${m.c}22`, opacity: interpolate(f - start, [0, 8], [0, 1], clamp), transform: `translateY(${(1 - p) * 80}px)` }}>
              <div style={{ width: 74, height: 74, borderRadius: 18, border: `1px solid ${m.c}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                <svg viewBox="0 0 24 24" width={38} height={38} fill="none" stroke={m.c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{m.icon}</svg>
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: "#f5f5fa" }}>Módulo</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: m.c }}>{m.name}</div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
};

const SC: { dur: number; render: (d: number) => React.ReactNode }[] = [
  { dur: 150, render: (d) => <CountUp dur={d} /> },
  { dur: 160, render: (d) => <Checklist dur={d} /> },
  { dur: 180, render: (d) => <Phone dur={d} /> },
  { dur: 180, render: (d) => <Timeline dur={d} /> },
  { dur: 150, render: (d) => <Quote dur={d} /> },
  { dur: 150, render: (d) => <Wipe dur={d} /> },
  { dur: 180, render: (d) => <Motif dur={d} /> },
];

export const DEMO_FRAMES = SC.reduce((a, s) => a + s.dur, 0);

// efectos de sonido sincronizados (frame absoluto)
const SFX: { f: number; s: string; v: number }[] = [
  { f: 12, s: "rise.wav", v: 0.4 }, { f: 62, s: "ding.wav", v: 0.42 },
  { f: 150, s: "whoosh.wav", v: 0.5 },
  { f: 176, s: "tick.wav", v: 0.45 }, { f: 198, s: "tick.wav", v: 0.45 }, { f: 220, s: "tick.wav", v: 0.45 }, { f: 242, s: "tick.wav", v: 0.45 },
  { f: 310, s: "whoosh.wav", v: 0.5 }, { f: 340, s: "pop.wav", v: 0.4 }, { f: 356, s: "pop.wav", v: 0.4 },
  { f: 490, s: "whoosh.wav", v: 0.5 }, { f: 514, s: "tick.wav", v: 0.4 }, { f: 534, s: "tick.wav", v: 0.4 }, { f: 554, s: "tick.wav", v: 0.4 }, { f: 574, s: "tick.wav", v: 0.4 },
  { f: 670, s: "whoosh.wav", v: 0.45 }, { f: 680, s: "ding.wav", v: 0.4 },
  { f: 820, s: "whoosh.wav", v: 0.5 }, { f: 850, s: "whoosh.wav", v: 0.4 },
  { f: 970, s: "whoosh.wav", v: 0.5 }, { f: 996, s: "pop.wav", v: 0.4 }, { f: 1008, s: "pop.wav", v: 0.4 }, { f: 1020, s: "pop.wav", v: 0.4 },
];

export const DemoDinamismo: React.FC = () => {
  let from = 0;
  const seqs = SC.map((s, i) => {
    const el = <Sequence key={i} from={from} durationInFrames={s.dur}>{s.render(s.dur)}</Sequence>;
    from += s.dur;
    return el;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070f", fontFamily: FONT, color: "#f5f5fa" }}>
      <Img src={staticFile("bg.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {seqs}
      {SFX.map((x, i) => (
        <Sequence key={`sfx${i}`} from={x.f} durationInFrames={50}>
          <Audio src={staticFile(`sfx/${x.s}`)} volume={x.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
