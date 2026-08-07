import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, GR, GO } from "./lib/editorial";
import { SelloScene } from "./lib/credibilidad";
import D from "./dur/f31.json";
import C from "./dur/f31.caps.json";

// 3.1 — La credibilidad como base del negocio. Módulo 3 (motivo VERDE).
// HERO PROPIO: EL SELLO DE CONFIANZA (se llena gota a gota; la grieta lo vacía de golpe).
// Estructura BALANZA / economía de la confianza.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="NUNCA FUE TAN FÁCIL" lines={[{ t: "El mundo se llena de cosas" }, { t: "que parecen ciertas.", a: true }]} sub="Cualquiera genera un texto, una imagen, un video, en dos minutos." variant="bare" size={112} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y AHÍ, TU OPORTUNIDAD" lines={[{ t: "Lo que escasea" }, { t: "es en quién confiar.", a: true }]} sub="Cuando todo abunda, lo escaso vale. Ese lugar está esperando." art="people" variant="behind" artColor={GR} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DEL MÓDULO PASADO" lines={[{ t: "La IA puede afirmar" }, { t: "falsos con seguridad.", a: true }]} sub="Parecía una advertencia. Es tu punto de partida." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR QUÉ ES TU VENTAJA" a="Donde la máquina se equivoca," b="entra tu oficio: confirmar." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <SelloScene dur={d} kicker="LA IDEA CENTRAL" lines={["Tu credibilidad", "es tu capital."]} sub="Ya lo nombramos en M1. Hoy: la regla que decide cómo se cuida." nivel={0.18} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <SelloScene dur={d} kicker="CÓMO SE CONSTRUYE" lines={["Gota a gota.", "Cada acierto, una gota."]} sub="Nadie confía por una nota: confía después de verte acertar muchas veces." nivel={0.42} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <SelloScene dur={d} kicker="POR ESO ES LENTA" lines={["Se junta con", "paciencia, en meses."]} sub="Es lo mismo que tu audiencia propia: se queda porque te cree." nivel={0.7} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <SelloScene dur={d} kicker="TU ACTIVO MÁS VALIOSO" lines={["Más que seguidores.", "Más que un buen día."]} sub="Un seguidor que te cree te compra, te defiende y te recomienda." nivel={1} /> },

  { audio: "s9.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PARTICULARIDAD" a="Se junta gota a gota." b="Se vacía de un golpe." full /> },
  { audio: "s10.wav", sec: 1, render: (d) => <SelloScene dur={d} kicker="LA ASIMETRÍA" lines={["Meses para llenarlo.", "Un error para vaciarlo."]} sub="Una sola información falsa con tu nombre alcanza para inclinar el frasco." grieta /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UN TROPIEZO HONESTO", title: "Suma.", sub: "Un error reconocido y corregido a tiempo muestra que te importa." }} right={{ label: "UN DESCUIDO", title: "Rompe.", sub: "Lo que quiebra la confianza es no haberse tomado el trabajo de chequear." }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE AHÍ SALE ESTO" lines={[{ t: "El minuto de verificar," }, { t: "tu mejor inversión.", a: true }]} sub="No es tiempo perdido; es cuidar lo único que no se puede comprar." art="target" variant="left" artColor={GR} /> },

  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y HOY PESA MÁS QUE NUNCA" lines={[{ t: "Todo se llena de" }, { t: "contenido automático.", a: true }]} sub="La gente lo sabe, y está más desconfiada que nunca. Eso juega a tu favor." art="screen" variant="behind" artColor={GR} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "MUCHOS", title: "Corren a\npublicar.", sub: "Cualquier cosa, para llegar primero." }} right={{ label: "VOS", title: "Te ganás\notro lugar.", sub: "El del que vale la pena leer, porque se toma el trabajo de confirmar." }} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN ESTE MOMENTO" a="Verificar dejó de ser una obligación." b="Verificar te hace ganar." full /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="QUÉ ES, EN REALIDAD" lines={[{ t: "Verificar es" }, { t: "un hábito.", a: true }]} sub="No desconfiar de todo ni ser lento: un filtro corto entre enterarte y publicar con tu nombre." variant="bare" size={116} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdList dur={d} kicker="EL FILTRO, EN TRES PREGUNTAS" title="Una clase para cada una" items={["¿La imagen o el video son reales?", "¿El dato o la declaración son ciertos?", "¿Cómo lo muestro para que se note?"]} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y LA IA ES TU ALIADA" lines={[{ t: "Ayuda a rastrear." }, { t: "La que confirma sos vos.", a: true }]} sub="Es tu ayudante de investigación, no tu fuente. Te acerca pistas; el criterio es tuyo." art="bulb" variant="left" artColor={GR} /> },

  { audio: "s19.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EL PRIMERO", title: "Publica el\nrumor ya.", sub: "Le va bien un rato. Al día siguiente, era falso, y su nombre quedó pegado." }} right={{ label: "EL SEGUNDO", title: "Dedica veinte\nminutos.", sub: "O una nota sólida, o descubre que era falso y no publica. En los dos casos, gana." }} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PASA UN AÑO" lines={[{ t: "El segundo se ganó" }, { t: "fama de confiable.", a: true }]} sub="Cuando él dice algo, se le cree, lo comparten y lo recomiendan." art="growth" variant="behind" artColor={GR} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA RESPUESTA SE VE SOLA" a="Esa reputación es el capital" b="que hace crecer un medio." full /> },

  { audio: "s22.wav", sec: 1, render: (d) => <EdList dur={d} kicker="QUEDATE CON ESTAS IDEAS" title="Tres para llevarte" items={["Tu credibilidad es tu capital", "Se junta lento y se vacía de golpe", "Verificar hoy te distingue"]} /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Entrená\nel reflejo."} plate={["¿Lo publicaría con mi nombre?", "¿O lo confirmaría antes?"]} ex="Durante un día, mirá lo que circula y con cada cosa hacete esa pregunta. Sin chequear nada aún: solo detectar qué pediría un chequeo." /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL CIMIENTO DEL MÓDULO" lines={[{ t: "Ya tenés el porqué." }, { t: "Ahora vamos al cómo.", a: true }]} sub="Tu credibilidad es el capital sobre el que se construye todo tu negocio." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s25.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Empezamos por lo que más engaña:" b="las imágenes y los videos." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_V1 = totalFrames(SCENES_D);
export const ClaseVerif1: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f31.mp3" caps={C as any} />;
