import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { F, CY, VI, GO, GR, useR, Kick } from "./editorial";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/**
 * LA FICHA DE PROMPT — pieza base de la biblioteca (clase 2.5, motivo cyan).
 * Una tarjeta con título + cuerpo, donde los [huecos] entre corchetes se resaltan en dorado.
 * `partes` = trozos del prompt; los que empiezan con "[" se pintan como hueco rellenable.
 */
export const Ficha: React.FC<{ titulo: string; partes: string[]; c?: string; w?: number }> = ({ titulo, partes, c = CY, w = 560 }) => (
  <div style={{ width: w, borderRadius: 16, background: "#0d0d18", border: `1px solid ${c}44`, borderLeft: `4px solid ${c}`, padding: "20px 22px", boxShadow: "0 20px 60px rgba(0,0,0,.5)", fontFamily: F }}>
    <div style={{ fontSize: 15, letterSpacing: 3, color: c, fontWeight: 800, marginBottom: 12 }}>{titulo}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color: "#c9c9da", lineHeight: 1.45 }}>
      {partes.map((p, i) => {
        const hueco = p.startsWith("[");
        return hueco
          ? <span key={i} style={{ color: GO, fontWeight: 800, borderBottom: `2px solid ${GO}`, padding: "0 3px" }}>{p}</span>
          : <span key={i}>{p}</span>;
      })}
    </div>
  </div>
);

/**
 * LA BIBLIOTECA — hero de la clase 2.5. Una estantería de fichas de prompt que crece y se ordena por rol.
 * `modo`: "una" (una ficha con huecos, para explicar la plantilla) · "estante" (varias fichas apiladas,
 * la biblioteca que crece). Objeto NUEVO (estantería de fichas), distinto de los heroes de 2.1–2.4.
 */
export const Biblioteca: React.FC<{ modo?: "una" | "estante"; hasta?: number; cx?: number; scale?: number }> = ({ modo = "una", hasta = 3, cx = 1300, scale = 1 }) => {
  const f = useCurrentFrame();
  const ap = interpolate(f, [4, 22], [0, 1], clamp);

  if (modo === "una") {
    return (
      <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap }}>
        <Ficha titulo="TÍTULOS PARA UNA NOTA" c={VI} w={620} partes={[
          "Actuá como editor de un medio. Mis lectores son ", "[QUIÉNES SON]", ". Dame diez títulos sobre ", "[TEMA]", ", en tono ", "[TONO]", ". Claros y de un vistazo.",
        ]} />
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: F }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${GO}22`, border: `1px solid ${GO}`, color: GO, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>[ ]</div>
          <span style={{ fontSize: 19, color: "#9a9ab2", fontWeight: 500 }}>Los huecos: lo único que cambia cada vez.</span>
        </div>
      </div>
    );
  }

  // modo estante: fichas apiladas, agrupadas por rol, que van apareciendo.
  const fichas = [
    { titulo: "DOCUMENTALISTA · RESUMIR", c: CY, partes: ["Resumí ", "[TEXTO]", " en diez puntos claros."] },
    { titulo: "TITULADOR · GANCHOS", c: VI, partes: ["Dame diez títulos sobre ", "[TEMA]", " para ", "[PÚBLICO]", "."] },
    { titulo: "EDITOR · ACLARAR", c: GO, partes: ["Aclará este texto para que se entienda a la primera: ", "[TEXTO]"] },
    { titulo: "SPARRING · QUÉ FALTA", c: "#ff8a6b", partes: ["Leé esta nota y decime qué preguntas quedaron sin responder: ", "[NOTA]"] },
  ];
  return (
    <div style={{ position: "absolute", left: cx, top: "50%", transform: `translate(-50%,-50%) scale(${scale})`, opacity: ap, fontFamily: F }}>
      <div style={{ fontSize: 16, letterSpacing: 5, color: "#7d7d92", fontWeight: 800, marginBottom: 16 }}>MI BIBLIOTECA DE PROMPTS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 600 }}>
        {fichas.map((fi, i) => {
          const on = i < hasta;
          const grow = interpolate(f - (16 + i * 8), [0, 14], [0, 1], clamp);
          if (!on) return null;
          return (
            <div key={i} style={{ opacity: grow, transform: `translateX(${(1 - grow) * -26}px)` }}>
              <Ficha titulo={fi.titulo} c={fi.c} w={600} partes={fi.partes} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Escena: texto a la izquierda + la biblioteca a la derecha. */
export const BibliotecaScene: React.FC<{
  dur: number; kicker: string; lines: string[]; sub?: string; modo?: "una" | "estante"; hasta?: number; kc?: string;
}> = ({ kicker, lines, sub, modo, hasta, kc = CY }) => {
  const r = useR();
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Biblioteca modo={modo} hasta={hasta} scale={0.82} />
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
