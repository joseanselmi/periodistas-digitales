import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const RO = "#f472b6"; // motivo del Módulo 4 (marca) · rosa/magenta
const RO_D = "#9d3b6b";

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

// ============ 4.1 · LA PRUEBA DEL RECUERDO (un nombre pasa 4 pruebas que se encienden) ============
const PRUEBAS = ["Se dice fácil", "Se escribe como suena", "Dice algo (o se llena)", "Está libre"];
export const PruebaRecuerdo: React.FC<{ activa?: number; nombre?: string; cx?: number; scale?: number }> = ({ activa = 0, nombre = "Sobremesa", cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      {/* la tarjeta del nombre */}
      <div style={{ width: 440, padding: "26px 0", borderRadius: 18, textAlign: "center", background: "#12101a", border: `2px solid ${RO}`, boxShadow: `0 0 34px ${RO}55`, marginBottom: 26 }}>
        <div style={{ fontSize: 15, letterSpacing: 4, color: RO, fontWeight: 800 }}>EL NOMBRE</div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: -1, marginTop: 4 }}>{nombre}</div>
      </div>
      {/* las 4 pruebas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13, width: 440 }}>
        {PRUEBAS.map((p, i) => {
          const on = i < activa;
          const app = interpolate(f, [16 + i * 5, 30 + i * 5], [0, 1], clamp);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderRadius: 12, background: on ? `${RO}1c` : "#15151f", border: `1.5px solid ${on ? RO : "#33333f"}`, opacity: 0.35 + app * 0.65, boxShadow: on ? `0 0 16px ${RO}44` : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: on ? RO : "transparent", border: `2px solid ${on ? RO : "#44444f"}`, color: "#12101a", fontWeight: 900, fontSize: 17 }}>{on ? "✓" : i + 1}</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: on ? "#fff" : "#7a7a8c" }}>{p}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const PruebaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; activa?: number; nombre?: string }> = ({ kicker, lines, sub, activa, nombre }) => (
  <AbsoluteFill style={{ fontFamily: F }}><PruebaRecuerdo activa={activa} nombre={nombre} scale={0.82} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={RO} /></AbsoluteFill>
);

// ============ 4.2 · EL TALLER DE NOMBRES (generar candidatos + verificar libre/ocupado) ============
const CAND = ["Sobremesa", "De Barrio", "Mantel", "La Mesa", "Bodegón", "Sazón", "El Cubierto", "Mesa Chica"];
export const Taller: React.FC<{ modo?: "generar" | "filtrar" | "verificar"; cx?: number; scale?: number }> = ({ modo = "generar", cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  const finalistas = ["Sobremesa", "De Barrio", "Mantel"];
  const estado: Record<string, boolean> = { Sobremesa: true, "De Barrio": true, Mantel: false };
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      {modo === "verificar" ? (
        <div style={{ width: 460 }}>
          <div style={{ fontSize: 15, letterSpacing: 4, color: RO, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>¿LIBRE?</div>
          {finalistas.map((c, i) => {
            const libre = estado[c];
            const app = interpolate(f, [12 + i * 8, 26 + i * 8], [0, 1], clamp);
            return (
              <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", marginBottom: 12, borderRadius: 12, background: "#14121c", border: `1.5px solid ${libre ? "#34d399" : "#55555f"}`, opacity: app, boxShadow: libre ? "0 0 16px #34d39944" : "none" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{c}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: libre ? "#34d399" : "#8a8a96", letterSpacing: 1 }}>{libre ? "LIBRE ✓" : "ocupado"}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ width: 470, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {CAND.map((c, i) => {
            const app = interpolate(f, [8 + i * 3, 20 + i * 3], [0, 1], clamp);
            const fin = modo === "filtrar" && finalistas.includes(c);
            const dim = modo === "filtrar" && !finalistas.includes(c);
            return (
              <div key={c} style={{ padding: "12px 20px", borderRadius: 999, fontSize: 23, fontWeight: 700, background: fin ? `${RO}22` : "#15151f", color: dim ? "#5a5a66" : "#fff", border: `1.5px solid ${fin ? RO : "#33333f"}`, opacity: (dim ? 0.4 : 1) * app, boxShadow: fin ? `0 0 16px ${RO}55` : "none", transform: `translateY(${(1 - app) * 12}px)` }}>{c}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export const TallerScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; modo?: "generar" | "filtrar" | "verificar" }> = ({ kicker, lines, sub, modo }) => (
  <AbsoluteFill style={{ fontFamily: F }}><Taller modo={modo} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={RO} /></AbsoluteFill>
);

// ============ 4.3 · LA EMOCIÓN DEL COLOR (una paleta que se arma: principal + acento + neutros) ============
type Sw = { c: string; rol: string; emo: string };
const PALETA: Sw[] = [
  { c: "#7b2d3a", rol: "PRINCIPAL", emo: "calidez, casero" },
  { c: "#d9a441", rol: "ACENTO", emo: "resalta, poco" },
  { c: "#1c1512", rol: "NEUTRO", emo: "textos" },
  { c: "#f3e9d8", rol: "NEUTRO", emo: "fondos" },
];
export const PaletaHero: React.FC<{ piezas?: number; cx?: number; scale?: number }> = ({ piezas = 4, cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F, width: 470 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PALETA.map((s, i) => {
          const on = i < piezas;
          const app = interpolate(f, [12 + i * 7, 26 + i * 7], [0, 1], clamp);
          const claro = s.c === "#f3e9d8";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: on ? app : 0.12, transform: `translateX(${on ? (1 - app) * 26 : 0}px)` }}>
              <div style={{ width: 92, height: 92, borderRadius: 16, background: s.c, flexShrink: 0, border: claro ? "1.5px solid #33333f" : "none", boxShadow: on ? `0 0 22px ${s.c}${claro ? "22" : "77"}` : "none" }} />
              <div>
                <div style={{ fontSize: 15, letterSpacing: 3, color: i === 0 ? RO : "#8a8a96", fontWeight: 800 }}>{s.rol}</div>
                <div style={{ fontSize: 26, color: "#fff", fontWeight: 600, marginTop: 2 }}>{s.emo}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const PaletaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; piezas?: number }> = ({ kicker, lines, sub, piezas }) => (
  <AbsoluteFill style={{ fontFamily: F }}><PaletaHero piezas={piezas} scale={0.86} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={RO} /></AbsoluteFill>
);

// ============ 4.4 · DOS DECISIONES (muestrario de letras + logo wordmark que se arma) ============
export const TipoLogo: React.FC<{ modo?: "tipo" | "logo"; cx?: number; scale?: number }> = ({ modo = "tipo", cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  if (modo === "logo") {
    const build = interpolate(f, [14, 40], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
        <div style={{ width: 480, height: 300, borderRadius: 20, background: "#f3e9d8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${RO}44`, border: `2px solid ${RO}66` }}>
          <div style={{ fontSize: 66, fontWeight: 800, color: "#7b2d3a", fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: -1, opacity: build }}>Sobremesa</div>
          <div style={{ width: interpolate(build, [0, 1], [0, 180]), height: 3, background: "#d9a441", marginTop: 12 }} />
          <div style={{ fontSize: 17, letterSpacing: 5, color: "#7b2d3a99", marginTop: 12, opacity: build }}>BODEGONES DE BARRIO</div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 18, letterSpacing: 2, fontWeight: 800, color: RO }}>LOGO = TU NOMBRE, BIEN PUESTO</div>
      </div>
    );
  }
  const fams = [
    { n: "Con remates", ff: "Georgia, 'Times New Roman', serif", d: "clásica · editorial" },
    { n: "Sin remates", ff: "Arial, Helvetica, sans-serif", d: "moderna · limpia" },
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F, display: "flex", flexDirection: "column", gap: 22 }}>
      {fams.map((fm, i) => {
        const app = interpolate(f, [12 + i * 10, 28 + i * 10], [0, 1], clamp);
        return (
          <div key={i} style={{ width: 470, padding: "22px 28px", borderRadius: 16, background: "#12101a", border: `1.5px solid ${i === 0 ? RO : "#33333f"}`, opacity: app, boxShadow: i === 0 ? `0 0 20px ${RO}33` : "none" }}>
            <div style={{ fontSize: 72, fontWeight: 700, color: "#fff", fontFamily: fm.ff, lineHeight: 1 }}>Aa</div>
            <div style={{ fontSize: 21, color: "#9a9ab2", marginTop: 6 }}>{fm.n} — <span style={{ color: i === 0 ? RO : "#9a9ab2" }}>{fm.d}</span></div>
          </div>
        );
      })}
    </div>
  );
};
export const TipoScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; modo?: "tipo" | "logo" }> = ({ kicker, lines, sub, modo }) => (
  <AbsoluteFill style={{ fontFamily: F }}><TipoLogo modo={modo} scale={0.84} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={RO} /></AbsoluteFill>
);

// ============ 4.5 · LA COHERENCIA (piezas sueltas que encajan en una hoja de marca) ============
const HOJA = [
  { k: "LOGO", v: "Sobremesa" },
  { k: "COLOR", v: "vino · dorado · crema" },
  { k: "LETRA", v: "clásica + legible" },
  { k: "VOZ", v: "cálida, cercana, con humor" },
];
export const HojaMarca: React.FC<{ piezas?: number; cx?: number; scale?: number }> = ({ piezas = 4, cx = 1310, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ width: 460, padding: 26, borderRadius: 18, background: "#12101a", border: `2px solid ${RO}`, boxShadow: `0 0 40px ${RO}44` }}>
        <div style={{ fontSize: 15, letterSpacing: 4, color: RO, fontWeight: 800, marginBottom: 18, textAlign: "center" }}>TU HOJA DE MARCA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {HOJA.map((h, i) => {
            const on = i < piezas;
            const app = interpolate(f, [14 + i * 8, 30 + i * 8], [0, 1], clamp);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 16px", borderRadius: 11, background: on ? "#181420" : "#141420", border: `1px solid ${on ? `${RO}88` : "#2a2a34"}`, opacity: on ? app : 0.15, transform: `scale(${on ? interpolate(app, [0, 1], [0.9, 1]) : 0.9})` }}>
                <div style={{ width: 96, fontSize: 15, letterSpacing: 2, color: RO, fontWeight: 800, flexShrink: 0 }}>{h.k}</div>
                <div style={{ fontSize: 23, color: "#fff", fontWeight: 600 }}>{h.v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export const HojaScene: React.FC<{ dur: number; kicker: string; lines: string[]; sub?: string; piezas?: number }> = ({ kicker, lines, sub, piezas }) => (
  <AbsoluteFill style={{ fontFamily: F }}><HojaMarca piezas={piezas} scale={0.86} /><LeftText kicker={kicker} lines={lines} sub={sub} kc={RO} /></AbsoluteFill>
);

export { RO, RO_D };
