import React from "react";
import { ClaseVideo, SceneDef, totalFrames, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdList, EdTask, GO } from "./lib/editorial";
import { RedaccionScene } from "./lib/redaccion";
import D from "./dur/f24.json";
import C from "./dur/f24.caps.json";

// 2.4 — Los roles de IA de tu redacción. Módulo 2 (CYAN). VERSIÓN PROFUNDA.
// HERO: LA REDACCIÓN (grilla de escritorios) + la CADENA (encadenar roles en un trabajo real).

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO SOLEMOS VERLA" lines={[{ t: "Una herramienta." }, { t: "Un solo uso.", a: true }]} sub="Le pedís, te responde. Y ahí queda." variant="bare" size={122} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="PERO ES OTRA COSA" lines={["No una herramienta:", "un equipo entero."]} sub="La misma IA, muchos oficios. Y vos, el que reparte los papeles." activo={-1} /> },

  // — Puente + idea central —
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE DÓNDE VENIMOS" lines={[{ t: "Ya sabés dirigir" }, { t: "una charla.", a: true }]} sub="Según el rol que le des, esa misma herramienta se convierte en oficios distintos." art="chip" variant="behind" /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA IDEA" a="Con una sola IA," b="muchos colaboradores." full /> },

  // — Escritorio 1 · Documentalista (con lista de pedidos concretos) —
  { audio: "s5.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 1" lines={["El documentalista:", "el material pesado."]} sub="Le pasás un texto largo y te lo deja manejable. Con él empieza tu jornada más veces de las que creés." activo={0} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdList dur={d} kicker="AL DOCUMENTALISTA LE PEDÍS" title="Material largo, ya ordenado" items={["“Resumime esto en diez puntos”", "“Sacame solo las cifras y las fechas”", "“Decime las tres ideas más fuertes”"]} /> },

  // — Escritorios 2–6 —
  { audio: "s7.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 2" lines={["El titulador:", "las palabras de entrada."]} sub="“Dame diez títulos, unos directos y otros curiosos.” No te casás con la primera idea." activo={1} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 3" lines={["El editor:", "pule lo tuyo."]} sub="“Aclarame esto.” “¿Qué parte no se entiende?” Una segunda mirada sobre tu texto, sin herir a nadie." activo={2} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 4" lines={["El corrector:", "los detalles finos."]} sub="Ortografía, fechas, nombres iguales en toda la nota. Tu red de seguridad antes de publicar." activo={3} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 5" lines={["El que adapta", "a formatos."]} sub="Una nota, en varias piezas. El oficio fino de cada formato tiene su propio módulo." activo={4} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="ESCRITORIO 6" lines={["El sparring:", "el que te discute."]} sub="“¿Qué le falta?” “¿Dónde está flojo este argumento?” Un colega que te lee antes de publicar." activo={5} /> },

  // — El que tiene su propio módulo —
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y FALTA UNO" lines={[{ t: "El verificador." }, { t: "Tiene su propio módulo.", a: true }]} sub="Chequear datos, imágenes y declaraciones. Un rol delicado, central para tu credibilidad." art="target" variant="left" artColor={GO} /> },

  // — No es todo o nada: los encadenás —
  { audio: "s13.wav", sec: 1, render: (d) => <RedaccionScene dur={d} kicker="LA CLAVE" lines={["No se usan de a uno.", "Los encadenás."]} sub="Un trabajo real pasa por varios, uno tras otro. Ahí una persona sola rinde como una redacción." activo={-1} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdList dur={d} kicker="UN TRABAJO REAL, EN CADENA" title="Una entrevista de una hora, en texto" items={["Documentalista: los 10 momentos clave", "Vos: elegís el ángulo y escribís", "Editor: aclara y acorta lo enredado", "Corrector: nombres, fechas, erratas"]} /> },

  // — Cómo cambiás de escritorio —
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EN LA PRÁCTICA" lines={[{ t: "Misma ventana." }, { t: "Cambiás el “actuá como…”.", a: true }]} sub="Sobre un mismo texto, seguí en el mismo chat, así se acuerda. Para algo nuevo, abrí una conversación limpia." art="screen" variant="behind" /> },

  // — Lo que lo hace funcionar —
  { audio: "s16.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE LO VUELVE UN EQUIPO" a="Misma herramienta." b="Le cambiás el sombrero." full /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ARRIBA DE TODO" lines={[{ t: "Vos dirigís" }, { t: "la redacción.", a: true }]} sub="Decidís a quién le pasás cada cosa y en qué orden. El criterio de qué se publica, y con qué firma, es tuyo." art="people" variant="left" /> },

  // — Recuerdo —
  { audio: "s18.wav", sec: 1, render: (d) => <EdList dur={d} kicker="REPASEMOS" title="Los escritorios de tu redacción" items={["Documentalista · Titulador · Editor", "Corrector · Adapta formatos · Sparring", "El rol que le asignás lo cambia todo"]} /> },

  // — Tarea —
  { audio: "s19.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Elegí dos\nescritorios."} plate={["Editor", "Documentalista"]} ex="De los que recorrimos, elegí los dos que más te servirían esta semana y anotá, al lado de cada uno, una tarea real tuya que le pasarías." /> },

  // — Cierre y puente —
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Un equipo, un motor," }, { t: "y vos dirigiendo.", a: true }]} sub="Sabés a quién llamar para cada cosa, y cómo encadenarlos en un trabajo real." art="people" variant="behind" /> },
  { audio: "s21.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={2} next={3} proxima="2.5 · Construí tu biblioteca de prompts" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_IA4 = totalFrames(SCENES_D);
export const ClaseIA4: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f24.mp3" caps={C as any} />;
