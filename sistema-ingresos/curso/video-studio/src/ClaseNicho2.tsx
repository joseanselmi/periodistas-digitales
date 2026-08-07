import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI, GO } from "./lib/editorial";
import { InterseccionScene } from "./lib/nicho";
import D from "./dur/f52.json";
import C from "./dur/f52.caps.json";

// 5.2 — Los 3 filtros de un nicho rentable. Módulo 5 (VIOLETA).
// HERO PROPIO: LA INTERSECCIÓN (3 círculos: pasión + demanda + dinero; el centro se enciende).
// Estructura LA INTERSECCIÓN.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA QUE QUEDÓ" lines={[{ t: "Enfocarte, sí." }, { t: "Pero ¿en qué?", a: true }]} sub="Es la que separa a los que arrancan bien de los que arrancan mal." variant="bare" size={124} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "TE ENCANTA, PERO…", title: "No le interesa\na nadie.", sub: "Te deja hablando solo." }} right={{ label: "DA DINERO, PERO…", title: "Te aburre.", sub: "Te apaga en tres meses." }} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="HOY LE PONEMOS CRITERIO" lines={[{ t: "Tres preguntas" }, { t: "sobre tu borrador.", a: true }]} sub="Las tres patas que sostienen, en la práctica, a todo medio que funciona." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y LO IMPORTANTE" lines={[{ t: "Tienen que estar" }, { t: "las tres juntas.", a: true }]} sub="Vamos a verlas de a una, y después a ver por qué el cruce lo es todo." variant="bare" size={118} /> },

  { audio: "s5.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="LA IDEA CENTRAL" lines={["Tu nicho vive", "en un cruce."]} sub="Donde se tocan lo que te apasiona, lo que la gente busca, y aquello por lo que alguien paga." activos={3} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="FILTRO 1 · PASIÓN" lines={["Un tema que", "podés sostener."]} sub="No euforia: algo que no te cansa, que ya conocés más que el promedio, del que podrías escribir mes tras mes." activos={1} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PRUEBA" lines={[{ t: "¿Me imagino con esto" }, { t: "durante años?", a: true }]} sub="Incluso los días sin ganas. El aburrimiento le gana siempre a la billetera." art="bulb" variant="left" artColor={VI} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="FILTRO 2 · DEMANDA" lines={["Gente que ya", "busca el tema."]} sub="La diferencia entre un medio y un diario íntimo. El filtro que más gente se saltea." activos={2} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y DEJA SEÑALES" lines={[{ t: "¿Ya ves gente" }, { t: "reunida?", a: true }]} sub="Comunidades, grupos, cuentas que ya juntan seguidores. Si hay movimiento, la demanda está." art="people" variant="behind" artColor={VI} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="FILTRO 3 · DINERO" lines={["Que alguien ya", "pague por algo."]} sub="No que sepas cómo cobrar: que en el mundo del tema haya dinero moviéndose." activos={3} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdList dur={d} kicker="¿DÓNDE LO MIRÁS?" title="El dinero está en tres lugares" items={["Marcas que pagan por llegar a esa gente", "Productos, cursos, servicios del tema", "Lectores que pagan por sostenerlo"]} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="NO ES SER INTERESADO" lines={[{ t: "Es ser" }, { t: "responsable.", a: true }]} sub="Un medio necesita sostenerse para durar. Un tema serio no pierde este filtro: cambia de dónde sale el dinero." art="coins" variant="left" artColor={GO} /> },

  { audio: "s13.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="CON DOS NO ALCANZA" lines={["Pasión y demanda,", "sin dinero."]} sub="Un lindo pasatiempo con público, pero un proyecto que te cuesta sostener. Se disfruta, pero cansa." activos={2} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "PASIÓN + DINERO, SIN DEMANDA", title: "Le hablás a una\nplaza vacía.", sub: "Enamorado de algo que casi nadie sigue." }} right={{ label: "DEMANDA + DINERO, SIN PASIÓN", title: "El negocio\nde otro.", sub: "Te cansás antes de que rinda: la constancia no se compra." }} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <InterseccionScene dur={d} kicker="EL PUNTO DULCE" lines={["Donde los tres", "se tocan a la vez."]} sub="Un tema que te gusta, que la gente busca, y donde hay dinero. Las tres patas para durar." activos={3} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CASO, POR LOS FILTROS" lines={[{ t: "Bodegones de barrio:" }, { t: "los tres círculos, sí.", a: true }]} sub="Le apasiona, hay gente preguntando dónde ir, y los restaurantes y marcas mueven dinero." art="target" variant="behind" artColor={VI} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO NO ES SOLO SIMPÁTICO" a="Los filtros te ahorran enamorarte" b="de un nicho que no se sostiene." full /> },

  { audio: "s18.wav", sec: 1, render: (d) => <EdList dur={d} kicker="EN RESUMEN" title="Tres preguntas, una por círculo" items={["Pasión: ¿lo sostengo durante años?", "Demanda: ¿hay gente ya reunida?", "Dinero: ¿alguien ya paga por algo?"]} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Dibujá tus\ntres círculos."} plate={["Pasión", "Demanda", "Dinero"]} ex="Agarrá tu borrador y respondé la pregunta de cada círculo con honestidad, con lo que sepas hoy." /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VAS A TERMINAR EN UNO DE TRES" lines={[{ t: "Candidato fuerte," }, { t: "falta uno, o a validar.", a: true }]} sub="Si no estás seguro de la demanda, tranquilo: la próxima clase es sobre salir a comprobarla." variant="bare" size={112} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Ya no elegís" }, { t: "porque suena lindo.", a: true }]} sub="Pasión para durar, demanda para tener público, dinero para vivir de eso." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="La demanda no se supone." b="Se sale a comprobar, con la IA." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N2 = totalFrames(SCENES_D);
export const ClaseNicho2: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f52.mp3" caps={C as any} />;
