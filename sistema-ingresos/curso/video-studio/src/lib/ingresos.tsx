import React from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FUENTES =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,700;8..60,900&display=swap";

/**
 * Sin esto Remotion renderiza con la serif por defecto: el navegador headless
 * arranca el render antes de que bajen las webfonts. `delayRender` lo frena
 * hasta que `document.fonts.ready` resuelve.
 */
function useFuentes() {
  const [handle] = React.useState(() => delayRender("cargando fuentes"));
  React.useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FUENTES;
    document.head.appendChild(l);
    const listo = () => document.fonts.ready.then(() => continueRender(handle));
    l.onload = listo;
    l.onerror = listo; // si Google Fonts no responde, seguimos con la fallback
    return () => {
      l.onload = null;
      l.onerror = null;
    };
  }, [handle]);
}

const SANS = "Archivo, system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SERIF = "'Source Serif 4', Georgia, serif";

/**
 * MockupIngresos — el medio del alumno (perfil de Instagram) y lo que ese medio
 * le cobra a los comercios de su ciudad.
 *
 * Es el mismo mockup que va en la sección "El problema" de la landing, con tiempo:
 * el total cuenta, la curva se dibuja, y los cobros entran de a uno.
 *
 * ⚠️ Los montos son ILUSTRATIVOS y salen de lo que promete el propio curso
 * (2 anunciantes = 200-800 USD/mes, ver curso/docs/MODELO-MONETIZACION.md).
 * No son el resultado de ningún alumno concreto: los comercios son genéricos.
 */

export const FPS_MK = 30;
export const TOTAL_FRAMES_MK = 180; // 6 s

const VERDE = "#3ff28d";
const INDIGO = "#6366f1";
const CIAN = "#22d3ee";

// El lienzo se diseña a 2400×1350 y se escala al tamaño de la composición.
const W = 2400;
const H = 1350;

export type Cobro = { quien: string; que: string; monto: number };

/**
 * Valores por defecto. Los montos salen de lo que promete el propio curso
 * (2 anunciantes = 200-800 USD/mes). Si los cambiás, que sigan cerrando con eso.
 */
export const COBROS_DEF: Cobro[] = [
  { quien: "Inmobiliaria del Centro", que: "Banner mensual", monto: 240 },
  { quien: "Clínica Odontológica Sur", que: "Nota patrocinada", monto: 180 },
  { quien: "Ferretería San Martín", que: "Aviso semanal", monto: 120 },
];

// Cuándo entra cada cobro (frames). Un cobro más = un valor más acá.
export const ENTRADA_DEF = [80, 100, 120];

// Se resuelven en el render; el módulo los expone para que la escena los pise.
let COBROS: Cobro[] = COBROS_DEF;
let ENTRADA: number[] = ENTRADA_DEF;
export const configurar = (c?: Cobro[], e?: number[]) => {
  COBROS = c && c.length ? c : COBROS_DEF;
  ENTRADA = e && e.length ? e : ENTRADA_DEF;
};

const Tick: React.FC<{ s?: number }> = ({ s = 19 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={VERDE} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// ────────────────────────────────────────────────────────────── CELULAR
const Celular: React.FC = () => {
  const tiles = [
    { a: "#0f2f44", b: "#2d6b8a", t: "Crecida del río: 300 evacuados", lbl: "ÚLTIMA HORA" },
    { a: "#141d33", b: "#33436b", t: "«La obra del puente no puede esperar»" },
    { a: "#1c3a5e", b: "#4a6f96", t: "Cortes de luz en el barrio norte" },
    { a: "#eef1f6", b: "#cfd7e4", t: "La feria de productores vuelve a la plaza", osc: true },
    { a: "#2b2320", b: "#6b544a", t: "El bar de la esquina cumple 50 años", lbl: "CIUDAD" },
    { a: "#3a2f2a", b: "#7a5f4a", t: "Vecinos juntaron 800 firmas por el alumbrado" },
    { a: "#0d1526", b: "#2a3a5c", t: "Qué cambia con el plan de estacionamiento" },
    { a: "#123a2a", b: "#2f7a56", t: "El club ascendió tras 12 años", lbl: "DEPORTES" },
    { a: "#eef1f6", b: "#cfd7e4", t: "Los comercios del centro piden más seguridad", osc: true },
  ];
  const dest = [
    ["#1f4d8f", "ES\nVIRAL", "ES VIRAL"],
    ["#7a2222", "CONTRA\nTAPA", "CONTRATA…"],
    ["#1c5c3a", "LA\nFERIA", "La feria"],
    ["#3b2a5e", "EN\nFOTOS", "En fotos"],
  ];
  return (
    <div style={{ width: 540, height: 1170, borderRadius: 52, overflow: "hidden", background: "#000", color: "#fff", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* barra de estado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "44px 34px 0", fontSize: 30, fontWeight: 600, flex: "none" }}>
        <span>17:48</span>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <svg width={34} height={24} viewBox="0 0 34 24" fill="#fff"><rect x={0} y={15} width={6} height={9} rx={1.6} /><rect x={9} y={10} width={6} height={14} rx={1.6} /><rect x={18} y={5} width={6} height={19} rx={1.6} /><rect x={27} y={1} width={6} height={23} rx={1.6} opacity={0.38} /></svg>
          <svg width={30} height={24} viewBox="0 0 30 22" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round"><path d="M3 8a17 17 0 0 1 24 0" /><path d="M8 13.5a10 10 0 0 1 14 0" /><circle cx={15} cy={18.5} r={1.8} fill="#fff" stroke="none" /></svg>
          <div style={{ width: 44, height: 22, border: "2.5px solid #ffffffa6", borderRadius: 6, padding: 2.5, position: "relative" }}>
            <div style={{ height: "100%", width: "66%", background: "#fff", borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* arroba */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 26px 0", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 31, fontWeight: 700, letterSpacing: "-0.02em" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          elcronistadelvalle
          <svg width={26} height={26} viewBox="0 0 24 24"><path fill="#3897f0" d="M12 1.5l2.6 2.2 3.4-.3.6 3.4 2.9 1.9-1.6 3 1.6 3-2.9 1.9-.6 3.4-3.4-.3L12 22.5l-2.6-2.2-3.4.3-.6-3.4L2.5 15l1.6-3-1.6-3 2.9-1.9.6-3.4 3.4.3z" /><path fill="#fff" d="M10.6 15.4l-3-3 1.3-1.3 1.7 1.7 4.4-4.4 1.3 1.3z" /></svg>
        </div>
        <div style={{ display: "flex", gap: 5 }}>{[0, 1, 2].map((i) => <i key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />)}</div>
      </div>

      {/* perfil */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 26px 0", flex: "none" }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", flex: "none", padding: 5, background: "conic-gradient(from 200deg,#f9ce34,#ee2a7b,#6228d7,#f9ce34)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #000", background: "linear-gradient(160deg,#1e4d94,#0d2b56)", display: "grid", placeItems: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 48, letterSpacing: "-0.03em" }}>CV</div>
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "space-between", textAlign: "center", minWidth: 0 }}>
          {[["412", "publicaciones"], ["3.847", "seguidores"], ["96", "seguidos"]].map(([n, l]) => (
            <div key={l}><b style={{ display: "block", fontSize: 29, fontWeight: 700, letterSpacing: "-0.02em" }}>{n}</b><span style={{ fontSize: 18, color: "#d6d6d6", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{l}</span></div>
          ))}
        </div>
      </div>

      {/* bio */}
      <div style={{ padding: "22px 26px 0", fontSize: 25, lineHeight: 1.38, flex: "none" }}>
        <b style={{ fontWeight: 700, display: "block", fontSize: 26 }}>EL CRONISTA DEL VALLE</b>
        Lo que pasa en tu ciudad, contado por quien sabe chequearlo
        <span style={{ color: "#7aa9f7", display: "block", marginTop: 5 }}>linkin.bio/elcronistadelvalle</span>
      </div>

      {/* botones */}
      <div style={{ display: "flex", gap: 12, padding: "24px 26px 0", flex: "none" }}>
        <div style={{ flex: 1, textAlign: "center", padding: "19px 0", borderRadius: 13, fontSize: 25, fontWeight: 700, background: "#4a5df9" }}>Seguir</div>
        <div style={{ flex: 1, textAlign: "center", padding: "19px 0", borderRadius: 13, fontSize: 25, fontWeight: 700, background: "#262626" }}>Mensaje</div>
        <div style={{ flex: "0 0 82px", background: "#262626", borderRadius: 13, display: "grid", placeItems: "center" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx={10} cy={8} r={4} /><path d="M2 21a8 8 0 0 1 16 0" /><path d="M19 8v6M22 11h-6" /></svg>
        </div>
      </div>

      {/* destacadas */}
      <div style={{ display: "flex", gap: 20, padding: "24px 26px 0", overflow: "hidden", flex: "none" }}>
        {dest.map(([c, t, cap]) => (
          <figure key={cap} style={{ margin: 0, width: 112, flex: "none", textAlign: "center" }}>
            <div style={{ width: 112, height: 112, borderRadius: "50%", border: "3px solid #3a3a3a", padding: 4, boxSizing: "border-box", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: c, display: "grid", placeItems: "center", fontSize: 19, fontWeight: 800, lineHeight: 1.1, whiteSpace: "pre-line" }}>{t}</div>
            </div>
            <figcaption style={{ fontSize: 19, color: "#e4e4e4", marginTop: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cap}</figcaption>
          </figure>
        ))}
      </div>

      {/* pestañas */}
      <div style={{ display: "flex", marginTop: 28, borderTop: "1px solid #262626", flex: "none" }}>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "20px 0", borderBottom: "3px solid #fff" }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="#fff">{[2, 9, 16].map((y) => [2, 9, 16].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={6} height={6} rx={1} />))}</svg>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "20px 0" }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth={2}><rect x={2} y={3} width={20} height={18} rx={4} /><path d="M10 9l6 3-6 3z" fill="#8e8e8e" stroke="none" /></svg>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "20px 0" }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth={2} strokeLinejoin="round"><path d="M3 4h18v13H14l-2 3-2-3H3z" /></svg>
        </div>
      </div>

      {/* grilla */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, paddingTop: 3, flex: "none" }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#111" }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs><linearGradient id={`mk${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={t.a} /><stop offset="100%" stopColor={t.b} /></linearGradient></defs>
              <rect width="100" height="100" fill={`url(#mk${i})`} />
              <circle cx={50} cy={64} r={18} fill="#000" opacity={0.2} />
              <rect x={24} y={82} width={52} height={30} rx={14} fill="#000" opacity={0.2} />
            </svg>
            {t.lbl && <div style={{ position: "absolute", left: 11, top: 12, background: "#0009", color: "#fff", fontSize: 15, fontWeight: 700, padding: "5px 9px", borderRadius: 5, letterSpacing: "0.06em" }}>{t.lbl}</div>}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 11px", fontFamily: SERIF, fontWeight: 700, fontSize: 19, lineHeight: 1.16, color: t.osc ? "#0d1220" : "#fff", textShadow: t.osc ? "none" : "0 2px 8px #000000d9" }}>{t.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────── TABLET
const Tablet: React.FC = () => {
  const frame = useCurrentFrame();

  // cuántos cobros ya entraron (define el total que se muestra)
  const entrados = ENTRADA.filter((f) => frame >= f).length;
  const acumulado = COBROS.slice(0, entrados).reduce((a, c) => a + c.monto, 0);

  // el total sube suave hacia el acumulado en vez de saltar de golpe
  const suave = totalSuave(frame);

  // la curva se dibuja
  const dibujo = interpolate(frame, [15, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const LARGO = 700;

  // pulso del glow al entrar cada cobro
  const pulso = ENTRADA.reduce((acc, f) => {
    const d = frame - f;
    if (d < 0 || d > 18) return acc;
    return Math.max(acc, Math.sin((d / 18) * Math.PI));
  }, 0);

  return (
    <div style={{ width: 1336, height: 806, borderRadius: 26, overflow: "hidden", background: "#080810", display: "flex", position: "relative" }}>
      {/* barra lateral */}
      <div style={{ width: 112, background: "#05050c", borderRight: "1px solid #16162a", display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 0", gap: 30, flex: "none" }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(140deg,${INDIGO},${CIAN})`, boxShadow: `0 0 26px ${INDIGO}80` }} />
        <div style={{ width: 52, height: 52, display: "grid", placeItems: "center" }}>
          <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke="#4b4b6b" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: `${VERDE}1f`, boxShadow: `0 0 0 1px ${VERDE}4d` }}>
          <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></svg>
        </div>
        <div style={{ width: 52, height: 52, display: "grid", placeItems: "center" }}>
          <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke="#4b4b6b" strokeWidth={2.1}><rect x={3} y={5} width={18} height={14} rx={2} /><path d="M3 10h18" /></svg>
        </div>
      </div>

      <div style={{ flex: 1, padding: "38px 46px 34px", display: "flex", flexDirection: "column", gap: 30, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            Ingresos
            <small style={{ display: "block", fontSize: 22, fontWeight: 400, color: "#79799c", marginTop: 9, letterSpacing: 0 }}>El Cronista del Valle</small>
          </div>
          <div style={{ border: "1px solid #26263c", background: "#0e0e1a", color: "#b6b6d4", borderRadius: 12, padding: "14px 26px", fontFamily: MONO, fontSize: 22 }}>Agosto 2026</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 52 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", color: "#79799c", fontWeight: 600 }}>Cobrado este mes</div>
            <div style={{ fontSize: 172, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 0.84, marginTop: 16, color: VERDE, fontVariantNumeric: "tabular-nums", textShadow: `0 0 ${68 + pulso * 70}px ${VERDE}${pulso > 0.2 ? "aa" : "80"},0 0 24px ${VERDE}59` }}>
              <span style={{ fontSize: 60, fontWeight: 700, marginRight: 14, verticalAlign: "0.5em", color: `${VERDE}ad`, textShadow: "none" }}>USD</span>
              {suave}
            </div>
            <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 12, background: `${VERDE}1c`, border: `1px solid ${VERDE}59`, borderRadius: 999, padding: "12px 26px", fontFamily: MONO, fontSize: 23, fontWeight: 600, color: VERDE, opacity: entrados === 3 ? interpolate(frame, [135, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0 }}>
              ▲ 38% contra julio
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <svg viewBox="0 0 670 232" preserveAspectRatio="none" style={{ width: "100%", height: 232, display: "block" }}>
              <defs>
                <linearGradient id="mkfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={VERDE} stopOpacity={0.42} /><stop offset="100%" stopColor={VERDE} stopOpacity={0} /></linearGradient>
                <linearGradient id="mkline" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={CIAN} /><stop offset="100%" stopColor={VERDE} /></linearGradient>
                <clipPath id="mkclip"><rect x={0} y={0} width={670 * dibujo} height={232} /></clipPath>
              </defs>
              <line x1={4} y1={222} x2={656} y2={222} stroke="#1c1c30" strokeWidth={2} />
              <line x1={4} y1={150} x2={656} y2={150} stroke="#14142450" strokeWidth={2} />
              <line x1={4} y1={78} x2={656} y2={78} stroke="#14142450" strokeWidth={2} />
              <g clipPath="url(#mkclip)">
                <path d="M14,200 L172,168 L330,110 L488,68 L636,26 L636,222 L14,222 Z" fill="url(#mkfill)" />
                <path d="M14,200 L172,168 L330,110 L488,68 L636,26" fill="none" stroke="url(#mkline)" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={LARGO} strokeDashoffset={LARGO * (1 - dibujo)} />
              </g>
              {dibujo > 0.98 && (<><circle cx={636} cy={26} r={17} fill={VERDE} opacity={0.24} /><circle cx={636} cy={26} r={9} fill={VERDE} stroke="#080810" strokeWidth={5} /></>)}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, color: "#55557a", marginTop: 14 }}>
              {["sem 1", "sem 2", "sem 3", "sem 4"].map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>

        {/* cobros — entran de a uno */}
        <div style={{ borderTop: "1px solid #16162a" }}>
          {COBROS.map((c, i) => <Cobro key={c.quien} c={c} desde={ENTRADA[i]} />)}
        </div>
      </div>
    </div>
  );
};

const Cobro: React.FC<{ c: (typeof COBROS)[0]; desde: number }> = ({ c, desde }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 15, mass: 0.6 } });
  const op = interpolate(frame - desde, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tick = interpolate(frame - desde, [5, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px 200px", alignItems: "center", padding: "26px 0", borderBottom: "1px solid #101020", opacity: op, transform: `translateX(${(1 - s) * 44}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${VERDE}1c`, boxShadow: `0 0 0 1px ${VERDE}59`, display: "grid", placeItems: "center", flex: "none", transform: `scale(${0.4 + tick * 0.6})` }}>
          <Tick />
        </div>
        <b style={{ fontSize: 31, fontWeight: 700, letterSpacing: "-0.014em", color: "#f2f2fb" }}>{c.quien}</b>
      </div>
      <div style={{ fontSize: 24, color: "#79799c" }}>{c.que}</div>
      <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, textAlign: "right", color: VERDE, fontVariantNumeric: "tabular-nums" }}>USD {c.monto}</div>
    </div>
  );
};

/**
 * El total persigue al acumulado con un filtro exponencial.
 *
 * ⚠️ Se recalcula desde el frame 0 en CADA frame, a propósito: Remotion puede
 * renderizar los frames fuera de orden y en procesos distintos, así que un
 * contador que dependa del frame anterior da resultados distintos según quién
 * lo renderice. Esto es determinístico: el mismo frame da siempre lo mismo.
 */
function totalSuave(frame: number) {
  const PASOS = 9;
  let v = 0;
  for (let f = 0; f <= frame; f++) {
    const ent = ENTRADA.filter((x) => f >= x).length;
    const acu = COBROS.slice(0, ent).reduce((a, c) => a + c.monto, 0);
    v = v + (acu - v) / PASOS;
  }
  return Math.round(v);
}

// ────────────────────────────────────────────────────────────── ESCENA
/**
 * MedioAIngresos — recurso de banco (catálogo #89e).
 * El medio del alumno a la izquierda, lo que ese medio cobra a la derecha.
 */
export const MedioAIngresos: React.FC<{ cobros?: Cobro[]; entradas?: number[] }> = ({ cobros, entradas }) => {
  configurar(cobros, entradas);
  useFuentes();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esc = Math.min(width / W, height / H);

  const entrada = spring({ frame, fps, config: { damping: 22, mass: 0.9 } });
  const zoom = interpolate(frame, [0, TOTAL_FRAMES_MK], [1, 1.035]); // deriva lenta, da vida

  return (
    <AbsoluteFill style={{ background: "#05050b", overflow: "hidden", fontFamily: SANS, color: "#fff" }}>
      {/* fondo digital */}
      <AbsoluteFill style={{ background: "radial-gradient(58% 62% at 12% 22%, #4f46e544 0%, transparent 62%),radial-gradient(52% 58% at 78% 74%, #3ff28d2e 0%, transparent 60%),radial-gradient(46% 50% at 62% 12%, #22d3ee26 0%, transparent 62%),radial-gradient(70% 70% at 50% 50%, #0a0a18 0%, #05050b 78%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px)", backgroundSize: "120px 120px", opacity: 0.55, maskImage: "radial-gradient(ellipse 80% 72% at 50% 46%,#000 22%,transparent 76%)", WebkitMaskImage: "radial-gradient(ellipse 80% 72% at 50% 46%,#000 22%,transparent 76%)" }} />

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: W, height: H, transform: `scale(${esc * zoom})`, transformOrigin: "center", display: "flex", alignItems: "center", justifyContent: "center", perspective: 3400 }}>
          <div style={{ display: "flex", alignItems: "center", transformStyle: "preserve-3d", opacity: entrada, transform: `translateY(${(1 - entrada) * 40}px)` }}>
            {/* celular */}
            <div style={{ position: "relative", zIndex: 3, padding: 20, borderRadius: 70, width: 540, background: "linear-gradient(148deg,#82829a 0%,#3a3a4b 5%,#2b2b38 16%,#15151d 42%,#1b1b26 70%,#3c3c4c 94%,#77778e 100%)", boxShadow: "0 4px 0 #ffffff21 inset,0 -3px 0 #00000087 inset,0 100px 150px -36px #000000e0,0 0 0 1px #ffffff14", transform: "rotateY(9deg) rotateZ(-1deg) translateZ(-30px)" }}>
              <Celular />
            </div>

            {/* flecha */}
            <div style={{ width: 320, flex: "none", position: "relative", zIndex: 4, margin: "0 -6px" }}>
              <svg viewBox="0 0 320 88" fill="none" style={{ width: "100%", display: "block", filter: `drop-shadow(0 0 38px ${VERDE}7a) drop-shadow(0 0 14px ${INDIGO}8a)` }}>
                <defs><linearGradient id="mkar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={INDIGO} /><stop offset="52%" stopColor={CIAN} /><stop offset="100%" stopColor={VERDE} /></linearGradient></defs>
                <path d="M8 44 H238" stroke="url(#mkar)" strokeWidth={19} strokeLinecap="round" />
                <path d="M224 12 L302 44 L224 76" stroke="url(#mkar)" strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* tablet */}
            <div style={{ position: "relative", zIndex: 3, padding: 22, borderRadius: 44, width: 1336, background: "linear-gradient(148deg,#82829a 0%,#3a3a4b 5%,#2b2b38 16%,#15151d 42%,#1b1b26 70%,#3c3c4c 94%,#77778e 100%)", boxShadow: "0 4px 0 #ffffff21 inset,0 -3px 0 #00000087 inset,0 100px 150px -36px #000000e0,0 0 0 1px #ffffff14", transform: "rotateY(-7deg) rotateZ(0.5deg)" }}>
              <Tablet />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
