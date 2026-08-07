import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, VI, GO } from "./lib/editorial";
import { DemandaScene } from "./lib/nicho";
import D from "./dur/f53.json";
import C from "./dur/f53.caps.json";

// 5.3 — Investigar y validar tu nicho con IA. Módulo 5 (VIOLETA).
// HERO PROPIO: LAS SEÑALES DE DEMANDA (tablero que se enciende) + el medidor del PUNTO JUSTO.
// Estructura LA BRÚJULA / SEÑALES.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UNA CORAZONADA", title: "“Creo que\nhay gente.”", sub: "Sin piso." }} right={{ label: "UNA DECISIÓN", title: "“Sé que hay,\nporque la vi.”", sub: "Con piso." }} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VAS A APRENDER" lines={[{ t: "De la corazonada" }, { t: "a la certeza.", a: true }]} sub="Antes de invertir un solo día, saliendo a buscar las señales de que tu nicho tiene público." art="target" variant="behind" artColor={VI} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE LOS TRES FILTROS" lines={[{ t: "La demanda es la" }, { t: "que hay que comprobar.", a: true }]} sub="La pasión la conocés, el dinero lo estimás; la demanda es demasiado importante para adivinarla." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IDEA DE HOY" lines={[{ t: "La demanda" }, { t: "deja huellas.", a: true }]} sub="Cuando a un grupo le importa un tema, busca, pregunta, se junta, compra. Todo deja rastros, gratis." variant="bare" size={122} /> },

  { audio: "s5.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="SEÑAL 1" lines={["La gente", "busca el tema."]} sub="El autocompletado del buscador es una ventana a lo que la gente quiere saber." activas={1} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="SEÑAL 2" lines={["La gente", "pregunta."]} sub="Grupos y foros llenos de preguntas sin buena respuesta. Cada pregunta repetida es hambre." activas={2} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="SEÑAL 3" lines={["La gente", "se junta."]} sub="Comunidades ya armadas que crecen. Si alguien ya la juntó, la demanda está probada." activas={3} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="SEÑAL 4" lines={["La gente", "ya consume."]} sub="Productos, cursos o cuentas que viven del tema y les va bien. La prueba más fuerte de todas." activas={4} /> },

  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IA TE ACELERA" lines={[{ t: "“¿Dónde se" }, { t: "reúne esta gente?”", a: true }]} sub="Te sugiere lugares y preguntas para ir a chequear. En minutos, un mapa de por dónde empezar." art="bulb" variant="left" artColor={VI} size={112} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA QUE YA CONOCÉS" a="La IA te dice dónde mirar." b="La demanda la comprobás vos." full /> },

  { audio: "s11.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="EL PUNTO JUSTO" lines={["Ni tan amplio…", ""]} sub="Muy amplio: le sirve a cualquiera, competís con miles, las señales no dicen nada." activas={4} punto="amplio" /> },
  { audio: "s12.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="…NI TAN CHICO" lines={["Específico,", "y con pulso."]} sub="Muy chico: un desierto sin comunidades. El punto justo: específico, pero al buscar, encontrás vida." activas={4} punto="justo" /> },

  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y UNA GRAN SEÑAL" lines={[{ t: "Que ya haya" }, { t: "otros es bueno.", a: true }]} sub="La prueba más fuerte de que hay demanda y dinero: alguien ya confirmó que el público existe." art="people" variant="behind" artColor={VI} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA COMPAÑÍA ES BUENA NOTICIA" a="La competencia no te cierra la puerta:" b="te confirma que lleva a algún lado." full /> },

  { audio: "s15.wav", sec: 1, render: (d) => <DemandaScene dur={d} kicker="EL CASO · VALIDANDO" lines={["Autocompletado,", "preguntas, competencia."]} sub="La gastronómica busca, entra a los grupos y encuentra la misma pregunta repetida. Y una cuenta que lo hace a medias." activas={4} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EN UNA TARDE" lines={[{ t: "De “creo” a" }, { t: "“sé que existe”.", a: true }]} sub="Sin gastar nada, se ahorró quizás un año de trabajar a ciegas. Cada cosa la fue a ver con sus ojos." art="growth" variant="left" artColor={VI} /> },

  { audio: "s17.wav", sec: 1, render: (d) => <EdList dur={d} kicker="ANTES DE CERRAR" title="Tres para llevarte" items={["Señales: busca, pregunta, se junta, consume", "La IA orienta; la demanda la ves vos", "La competencia es buena señal; el desierto no"]} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Salí a mirar\ntres señales."} plate={["Autocompletar", "Preguntas repetidas", "¿Alguien vive de esto?"]} ex="Una tarde alcanza. Anotá lo que encontrás en una lista simple, para verlo junto." /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿SÍ O NO?" lines={[{ t: "Cientos y con" }, { t: "movimiento: vida.", a: true }]} sub="Veinte miembros y el último posteo de hace un año: no. Con dos o tres señales fuertes, luz verde." variant="bare" size={112} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SI SALE MEZCLADO" lines={[{ t: "No es un fracaso:" }, { t: "es información a tiempo.", a: true }]} sub="Ajustás el nicho, un poco más amplio o más fino, y volvés a mirar hasta encontrar el pulso." art="chip" variant="behind" artColor={VI} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Dejaste de apostar." }, { t: "Empezaste a comprobar.", a: true }]} sub="Tu nicho dejó de ser una corazonada y pasó a ser una decisión con piso." art="target" variant="left" artColor={VI} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Hay otros en tu nicho." b="¿Por qué te van a elegir a vos?" full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_N3 = totalFrames(SCENES_D);
export const ClaseNicho3: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f53.mp3" caps={C as any} />;
