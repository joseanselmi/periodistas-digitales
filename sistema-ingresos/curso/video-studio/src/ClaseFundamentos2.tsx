import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { MachineScene, PausaRecuerdo, DosEscenarios } from "./lib/maquina";
import D from "./dur/f12.json";
import C from "./dur/f12.caps.json";

// 1.2 — La máquina por dentro. PRODUCCIÓN: voz Chris (public/f12.mp3) + subtítulos (f12.caps.json).
// RECURSO NARRATIVO: "la cámara baja por la máquina" — el mismo objeto vuelve a lo largo de la
// clase con la etapa activa iluminada. Cohesión sin repetición.
// v2 (informe del agente alumno): + bloque "dónde se mira cada etapa", + por-nota vs acumulado,
// + conexión explícita de "audiencia propia" con la 1.1, − recap final redundante.
const V = ["1.000", "100", "10", "3", "1"];

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TODOS VIVIMOS" lines={[{ t: "Le pusiste horas." }, { t: "Casi nadie la vio.", a: true }]} sub="Y la que subiste sin pensarla demasiado, esa voló." art="news" variant="behind" size={120} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LA QUE TRABAJASTE", title: "Casi\nsin alcance.", sub: "Horas de trabajo, poca respuesta." }} right={{ label: "LA QUE SALIÓ SOLA", title: "Voló.", sub: "Sin esfuerzo aparente, mucha gente." }} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA BUENA NOTICIA" a="No es una lotería." b="Es un proceso." full /> },
  { audio: "s4.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="EL MOTOR POR DENTRO" lines={["Ese círculo,", "abierto."]} sub="Cinco etapas, cada una con reglas propias." /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CAMBIO DE PREGUNTA" lines={[{ t: "“¿Por qué no" }, { t: "funcionó?”", a: true }]} sub="Es una pregunta demasiado grande: no tiene respuesta accionable." variant="bare" size={124} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA QUE SÍ SIRVE" a="¿En qué etapa" b="se frenó?" full /> },

  // — Bloque 1 · que te vean y que te lean —
  { audio: "s7.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="BLOQUE 1" lines={["Que te vean", "y que te lean."]} sub="Las dos primeras etapas del recorrido." /> },
  { audio: "s8.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ETAPA 1" lines={["Alcance:", "la boca de entrada."]} sub="Cuánta gente nueva ve lo que publicaste." active={0} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE HAY QUE SABER" lines={[{ t: "El alcance lo" }, { t: "reparte la plataforma.", a: true }]} sub="Por eso sube y baja de una semana a la otra, con el mismo esfuerzo de tu parte." art="screen" variant="left" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR LAS DUDAS" a="No perdiste el talento." b="Se movió la etapa." full /> },
  { audio: "s11.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ETAPA 2" lines={["Atención:", "ver no es leer."]} sub="De los que lo vieron, cuántos frenaron de verdad." active={1} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DOS SEGUNDOS" lines={[{ t: "Se decide en" }, { t: "lo primero que ve.", a: true }]} sub="El título, la primera línea, la imagen." art="target" variant="behind" /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "ETAPA 1 · ALCANCE", title: "Depende de\nla plataforma.", sub: "Vos influís, pero no decidís." }} right={{ label: "ETAPA 2 · ATENCIÓN", title: "Depende de\ntu oficio.", sub: "Que llegue, y que enganche." }} /> },

  // — Bloque 2 · que vuelvan y que sean tuyos —
  { audio: "s14.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="BLOQUE 2" lines={["Que vuelvan", "y que sean tuyos."]} sub="Acá el lector de paso se convierte en algo que se queda." kc={VI} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ETAPA 3" lines={["Seguimiento:", "deciden volver."]} sub="De los que te leyeron, cuántos quieren más." active={2} kc={VI} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "ANTES", title: "Evaluaban\nuna pieza.", sub: "Esta nota, este título." }} right={{ label: "ACÁ", title: "Evalúan\nel conjunto.", sub: "“¿Esto me va a seguir sirviendo mañana?”" }} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL PRIMER LADRILLO" a="Dejás de ser algo que apareció" b="y pasás a ser alguien a quien elijo." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ETAPA 4" lines={["Audiencia propia:", "te dejan el correo."]} sub="De los que te siguen, cuántos dan ese paso." active={3} kc={VI} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EN LA CLASE ANTERIOR", title: "La meta\nde todo esto.", sub: "El gran activo: tu audiencia propia." }} right={{ label: "HOY", title: "El cuarto\nescalón.", sub: "Sigue siendo la meta. Ahora además tiene un lugar exacto en la máquina." }} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SEGUIRTE", title: "Es gratis.", sub: "No compromete a nada." }} right={{ label: "DEJARTE EL CORREO", title: "Te abren\nsu puerta.", sub: "La única etapa que te deja algo completamente tuyo." }} /> },

  // — Bloque 3 · que rinda —
  { audio: "s21.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ETAPA 5" lines={["Ingreso:", "la consecuencia."]} sub="Compran, le compran a quien recomendás, o un anunciante paga por llegar a tu gente." active={4} kc={GO} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ ESTÁ AL FINAL" lines={[{ t: "Se apoya en" }, { t: "todo lo anterior.", a: true }]} sub="No está al final porque haya que esperar años. Está al final porque es una consecuencia." art="coins" variant="left" /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="CONSECUENCIA PRÁCTICA" a="Si el ingreso no aparece," b="el ajuste está más arriba." /> },

  // — El recorrido de una lectora real —
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="AHORA CON UNA PERSONA" lines={[{ t: "El recorrido" }, { t: "de una lectora.", a: true }]} sub="Desde que no sabe que existís hasta que confía en vos." art="people" variant="left" /> },
  { audio: "s25.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="MARTES, 22:40" lines={["Aparece", "tu nota."]} sub="La plataforma decidió mostrársela. Eso es alcance." active={0} traveler /> },
  { audio: "s26.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="FRENA" lines={["El título le tocó", "algo que le importa."]} sub="Esta etapa la ganaste vos: tu título y tu manera de contar." active={1} traveler /> },
  { audio: "s27.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="ENTRA A TU PERFIL" lines={["Ve que hay más", "como esa. Sigue."]} sub="No te siguió por una nota: te siguió por el conjunto." active={2} traveler kc={VI} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="DOS SEMANAS DESPUÉS" lines={["Te deja", "su correo."]} sub="Ahora podés llegarle directo, sin que una plataforma decida por vos." active={3} traveler kc={VI} /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ESO QUE LE OFRECISTE" lines={[{ t: "Es una pieza" }, { t: "que se prepara.", a: true }]} sub="Tiene su propia clase, con el paso a paso. Hoy alcanza con saber que esa etapa se cruza así: ofreciendo algo que valga el correo." art="news" variant="behind" /> },
  { audio: "s30.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="MESES DESPUÉS" lines={["Te escucha", "distinto."]} sub="Porque ya no sos un desconocido." active={4} traveler kc={GO} /> },
  { audio: "s31.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TU TRABAJO" a="Hacer que ese camino" b="sea fácil de recorrer." full /> },

  // — El ejemplo trabajado —
  { audio: "s32.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VEÁMOSLO CON NÚMEROS" lines={[{ t: "Números de" }, { t: "ejemplo.", a: true }]} sub="Sirven para ver la mecánica. No son una promesa ni un dato real." variant="bare" size={122} /> },
  { audio: "s33.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="TU MÁQUINA, CON NÚMEROS" lines={["De mil,", "queda uno."]} sub="Y en cada escalón queda un grupo más chico y más interesado." values={V} /> },
  { audio: "s34.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LAS TRES DE ARRIBA", title: "Se miran por\npublicación.", sub: "Cada nota tiene las suyas." }} right={{ label: "LAS DOS DE ABAJO", title: "Se van\nacumulando.", sub: "María tardó semanas en dejarte el correo y meses en confiar." }} /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="DÓNDE ESTÁ LA PALANCA" a="Un título mejor no te suma un lector:" b="te suma en las cinco etapas a la vez." /> },
  { audio: "s36.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO IMPORTANTE" lines={[{ t: "Ahora sí:" }, { t: "¿qué hacés con esto?", a: true }]} sub="Acá la teoría se convierte en una herramienta de diagnóstico." variant="bare" size={118} /> },
  { audio: "s37.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="CASO 1" lines={["Mismo alcance,", "menos lectura."]} sub="Se frenó en la atención: el ajuste es el título y el ángulo." values={["1.000", "20", "—", "—", "—"]} breakAt={1} /> },
  { audio: "s38.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="CASO 2" lines={["Misma lectura,", "menos seguidores."]} sub="Enganchó, pero no quedó claro qué van a encontrar si se quedan." values={["1.000", "100", "2", "—", "—"]} breakAt={2} kc={VI} /> },
  { audio: "s39.wav", sec: 1, render: (d) => <EdList dur={d} kicker="DÓNDE SE ARREGLA" title="Lo que miran antes de tocar “seguir”" items={["La descripción de tu perfil — de qué va tu medio y para quién, en una línea", "Las últimas publicaciones — que se parezcan lo suficiente como para prometer más de lo mismo"]} /> },
  { audio: "s40.wav", sec: 1, render: (d) => <DosEscenarios dur={d} kicker="EL MISMO “NO FUNCIONÓ”" title="Dos problemas opuestos" leftLabel="Se frena en ATENCIÓN → se ajusta el título" rightLabel="Se frena en SEGUIMIENTO → se ajusta la promesa" /> },

  // — 7a · Cada etapa tiene un número real (conceptual: sin interfaz, eso es 1.3-1.5 y M4) —
  { audio: "s41.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ACÁ, UNA TRANQUILIDAD" lines={[{ t: "Cada etapa tiene" }, { t: "un número real.", a: true }]} sub="Un número que ya existe, esperándote, sin que tengas que armar nada nuevo." art="growth" variant="left" /> },
  { audio: "s42.wav", sec: 1, render: (d) => <EdList dur={d} kicker="LAS TRES QUE YA PODÉS MIRAR" title="La plataforma las mide sola" items={["Alcance — cuánta gente nueva lo vio", "Atención — cuánta se detuvo a consumirlo", "Seguimiento — cuánta decidió seguirte"]} /> },
  { audio: "s43.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL DÓNDE EXACTO" lines={[{ t: "Una etapa" }, { t: "por clase.", a: true }]} sub="Cómo se llama cada número y en qué pantalla se toca, lo vemos con calma en las próximas clases. Así los nombres se te van quedando de a uno." art="bulb" variant="behind" /> },
  { audio: "s44.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="LAS DOS DE ABAJO" lines={["Todavía", "no existen."]} sub="La audiencia propia la construís unas clases más adelante; el ingreso llega con monetización. Hoy van en cero, y ese cero es tu punto de partida." breakAt={2} kc={GO} /> },
  { audio: "s45.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA FOTO DE HOY" a="Tres etapas para empezar a mirar." b="Dos que todavía no existen." full /> },

  // — 7b · El método, en tres pasos —
  { audio: "s46.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL MÉTODO" lines={[{ t: "Tres pasos," }, { t: "todas las semanas.", a: true }]} sub="Para que esto no quede en teoría." variant="bare" size={120} /> },
  { audio: "s47.wav", sec: 1, render: (d) => <MachineScene dur={d} kicker="PASO 1" lines={["De arriba hacia abajo:", "frená en la primera floja."]} sub="Se mejora de a una, y siempre por la de más arriba." active={0} flip /> },
  { audio: "s48.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SI TRABAJÁS LA CUARTA", title: "Pulís el final\nde un caudal\nchiquito.", sub: "Con poca gente frenando a leerte, mueve poco." }} right={{ label: "SI ARREGLÁS LA ATENCIÓN", title: "Todas las de\nabajo reciben\nmás gente.", sub: "Automáticamente, sin que toques ninguna otra." }} /> },
  { audio: "s49.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PASO 2" lines={[{ t: "Cambiá" }, { t: "una sola cosa.", a: true }]} sub="Cambiás solo el título, algo mejora, y sabés con certeza que fue el título. Cada resultado te enseña algo limpio." art="target" variant="left" /> },
  { audio: "s50.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PASO 3" lines={[{ t: "Dale tiempo" }, { t: "antes de juzgar.", a: true }]} sub="Hacen falta cuatro o cinco publicaciones para que el dato sea confiable. Según tu ritmo, eso son dos semanas o un mes por prueba." art="bulb" variant="behind" /> },
  { audio: "s51.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL CICLO" a="Mirar, cambiar una cosa, esperar." b="Así mejora sola." full /> },

  // — Pausa de recuerdo —
  { audio: "s52.wav", sec: 1, render: (d) => <PausaRecuerdo dur={d} pregunta="¿Cuáles eran las cinco etapas, en orden?" /> },
  { audio: "s53.wav", sec: 1, render: (d) => <PausaRecuerdo dur={d} pregunta="Las cinco etapas" respuesta={["Alcance", "Atención", "Seguimiento", "Audiencia propia", "Ingreso"]} /> },

  // — La mejor noticia —
  { audio: "s54.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CADA ETAPA, DISTINTO" title="Cada etapa se mejora con acciones distintas" items={["Atención — el título y el ángulo", "Seguimiento — una promesa clara de qué va tu medio", "Audiencia propia — algo que valga el correo"]} /> },
  { audio: "s55.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO ES MANEJABLE" a="Nunca algo gigante e indefinido." b="Siempre una tarea chica y concreta." full /> },

  // — Cierre y tarea —
  { audio: "s56.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA QUE TE LLEVÁS" a="No preguntes si funcionó." b="Preguntá en qué etapa se frenó." full /> },
  { audio: "s57.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Dibujá tu máquina."} plate={["Alcance", "Atención", "Seguimiento", "Audiencia propia", "Ingreso"]} ex="Cinco escalones con el nombre de cada etapa, en orden. Ese es tu tablero." /> },
  { audio: "s58.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ESE DIBUJO ES TU TABLERO" a="En las próximas clases" b="le vas poniendo números reales." full /> },
  { audio: "s59.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={1} next={2} proxima="1.3 · Alcance: cómo te encuentra la gente que todavía no sabe que existís" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F2 = totalFrames(SCENES_D);
export const ClaseFundamentos2: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f12.mp3" caps={C as any} />;
