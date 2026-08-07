import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI, GO } from "./lib/editorial";
import { ZoomScene } from "./lib/nicho";
import D from "./dur/f51.json";
import C from "./dur/f51.caps.json";

// 5.1 — La teoría del nicho: por qué enfocarte gana. Módulo 5 (VIOLETA).
// HERO PROPIO: EL ZOOM (un foco que se angosta e intensifica sobre un grupo).
// Estructura EL ZOOM.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL ERROR DE BUENA FE" lines={[{ t: "Querer hablarle" }, { t: "a todo el mundo.", a: true }]} sub="Parece que cuanto más amplio, más gente. Y es justo al revés." variant="bare" size={120} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ AL REVÉS" lines={[{ t: "A nadie le llama algo" }, { t: "que no parece para él.", a: true }]} sub="Enfocarte, lejos de achicarte, te vuelve imposible de ignorar." art="target" variant="behind" artColor={VI} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="YA TENÉS EL CÓMO" lines={[{ t: "Falta la decisión" }, { t: "que ordena todo.", a: true }]} sub="Activo, confianza, tu equipo de IA. Ahora: sobre qué hablás, y a quién." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="DEL PRIMER MÓDULO, AL CENTRO" a="Escribir para todos es la forma" b="más rápida de que no te encuentre nadie." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IDEA CENTRAL" lines={[{ t: "Para llegar a más," }, { t: "apuntá a menos.", a: true }]} sub="Un nicho es un tema con borde claro y una gente que lo sigue de cerca." variant="bare" size={124} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <ZoomScene dur={d} kicker="PENSÁ EN UNA LINTERNA" lines={["Abierta al máximo:", "todo en penumbra."]} sub="La misma luz repartida llega débil a cada uno, y no le cambia el día a nadie." foco={0.2} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <ZoomScene dur={d} kicker="ANGOSTÁ EL HAZ" lines={["Concentrada,", "cae con fuerza."]} sub="No perdiste luz: la juntaste. Enfocar no apaga: intensifica." foco={1} /> },

  { audio: "s8.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "MEDIOS DE TODO UN POCO", title: "No te tocan\nde cerca.", sub: "En general, sin entrar en lo tuyo." }} right={{ label: "UNO QUE TE LEE LA MENTE", title: "Habla justo\nde lo tuyo.", sub: "¿A cuál seguís y recomendás? Al segundo, sin dudar." }} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA DIFERENCIA" a="Al referente lo buscan y le compran." b="Al número cincuenta lo saltean." full /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y UN BONUS QUE YA CONOCÉS" lines={[{ t: "Tema claro," }, { t: "más fácil de encontrar.", a: true }]} sub="Cuanto más claro el tema, más señales de para quién es, y mejor te busca la plataforma." art="growth" variant="left" artColor={VI} /> },

  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UN MILLÓN TIBIO", title: "Casi nadie\nse queda.", sub: "Les interesa por arriba, lo leen si pasa y se olvidan." }} right={{ label: "CINCUENTA MIL INTENSOS", title: "Una parte\nenorme se queda.", sub: "Les importa de verdad: te comparten y te traen más gente igual." }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA QUE SALE" a="Un público chico que te ama" b="construye un medio." full /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO TE ENCIERRA" lines={[{ t: "Los grandes" }, { t: "empezaron chiquitos.", a: true }]} sub="Primero te hacés dueño de un rincón; después, si querés, ampliás. Desde un centro fuerte hacia afuera." art="rocket" variant="behind" artColor={VI} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="QUÉ ES, EN REALIDAD" lines={[{ t: "Un tema" }, { t: "más una gente.", a: true }]} sub="No “autos”: gente que restaura autos viejos con poco presupuesto. De qué, y para quiénes." variant="bare" size={120} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y NO ES UNA JAULA" lines={[{ t: "Es un centro" }, { t: "de gravedad.", a: true }]} sub="¿Entra o me fui? Prueba simple: ¿le sirve a la misma persona? Si sí, entra." art="target" variant="left" artColor={VI} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN CASO · EL IMPULSO" lines={[{ t: "“Un medio" }, { t: "de comida.”", a: true }]} sub="Amplísimo: recetas, restaurantes, nutrición. Compite contra miles y su voz se pierde." art="screen" variant="behind" artColor={VI} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <ZoomScene dur={d} kicker="UN CASO · LA ENFOCAMOS" lines={["Los bodegones de", "barrio de su ciudad."]} sub="Para quien quiere comer rico y distinto sin gastar una fortuna. La referencia de algo que nadie cubre." foco={1} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE GANÓ" lines={[{ t: "El mismo talento." }, { t: "Solo cambió el foco.", a: true }]} sub="Ya sabe de qué escribir y para quién. Y esa gente, apenas la encuentra, no la suelta." art="bulb" variant="left" artColor={VI} /> },

  { audio: "s19.wav", sec: 1, render: (d) => <EdList dur={d} kicker="REPASEMOS" title="Tres ideas para llevarte" items={["Enfocar te hace imprescindible, no chico", "Un nicho: un tema con borde + una gente", "Es un punto de partida, no una jaula"]} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"El primer trazo\nde tu nicho."} plate={["¿Qué me importa más?", "¿A quién le cambiaría el día?"]} ex="Escribí en una línea de qué sería tu medio, aunque sea amplio. Y angostalo con esas dos preguntas." /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SIN APURO" lines={[{ t: "No tenés que" }, { t: "cerrarlo hoy.", a: true }]} sub="Es el borrador. En las próximas clases le pasamos los filtros para saber si sostiene un negocio." variant="bare" size={116} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Enfocarte no te" }, { t: "resta: te da poder.", a: true }]} sub="Un tema con borde y una gente concreta valen más que hablarle al mundo entero." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="No cualquier nicho sirve." b="Los tres filtros que lo definen." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N1 = totalFrames(SCENES_D);
export const ClaseNicho1: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f51.mp3" caps={C as any} />;
