import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdList, EdTask } from "./lib/editorial";
import { TallerScene, RO } from "./lib/marca";
import D from "./dur/f42.json";

// 4.2 — Creá tu nombre con IA (y chequeá que esté libre). Módulo 4 (ROSA).
// HERO PROPIO: EL TALLER DE NOMBRES (generar candidatos → filtrar → verificar libre/ocupado).
// Estructura EL TALLER DE NOMBRES.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="HOY SALÍS CON NOMBRE" lines={[{ t: "Decenas de ideas," }, { t: "y vos elegís.", a: true }]} sub="En vez de esperar a que aparezca la idea perfecta, tu equipo de inteligencia artificial te da las opciones. Tu trabajo es el más lindo: elegir." variant="bare" size={116} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN CAMINO CORTO" lines={[{ t: "Cerrar la clase" }, { t: "sabiendo el nombre.", a: true }]} sub="Ordenado y con un final concreto: cómo se va a llamar tu medio." art="bulb" variant="behind" artColor={RO} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TRAÉS DE ANTES" lines={[{ t: "Las cuatro pruebas" }, { t: "son tu filtro.", a: true }]} sub="La IA aporta la cantidad; vos aportás el filtro que separa los nombres que sirven de los que no." art="target" variant="left" artColor={RO} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA QUE YA CONOCÉS" a="La IA es brillante para dar opciones." b="Vos decidís cuál es la correcta." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <EdList dur={d} kicker="EL TALLER" title="Tres movimientos, en orden" items={["Generar mucho, con contexto", "Filtrar con tu criterio", "Verificar que esté libre"]} /> },

  { audio: "s6.wav", sec: 1, render: (d) => <TallerScene dur={d} kicker="MOVIMIENTO UNO" lines={["Generá", "mucho."]} sub="La diferencia entre una lista pobre y una buena está en cómo le pedís. La IA es tan buena como el contexto que le das." modo="generar" /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL PEDIDO BIEN ARMADO" lines={[{ t: "Metele tu nicho" }, { t: "y tu lector.", a: true }]} sub="Contale qué medio lanzás, tu nicho exacto, a quién le hablás, y pedile veinte ideas cortas, fáciles de decir y de escribir. Cantidad y dirección." art="chip" variant="behind" artColor={RO} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdList dur={d} kicker="ESTIRÁ CON FÓRMULAS" title="Pedile una tanda por cada una" items={["Una sola palabra evocadora del tema", "Dos palabras juntas en una", "Una palabra cotidiana cargada de tu tema", "Un nombre que suene a lugar"]} /> },

  { audio: "s9.wav", sec: 1, render: (d) => <TallerScene dur={d} kicker="MOVIMIENTO DOS" lines={["De la lista larga,", "a tres finalistas."]} sub="El filtro es tuyo. Leé cada nombre en voz alta y pasale la vara de las cuatro pruebas, tachando rápido." modo="filtrar" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ TRES Y NO UNO" lines={[{ t: "Guardá" }, { t: "alternativas.", a: true }]} sub="A la hora de verificar disponibilidad, es muy sano tener tres finalistas y no uno solo." variant="bare" size={118} /> },

  { audio: "s11.wav", sec: 1, render: (d) => <TallerScene dur={d} kicker="MOVIMIENTO TRES" lines={["Verificá:", "que esté libre."]} sub="El paso que casi nadie hace y te evita el peor de los tropiezos. Aplicás la regla de oro del módulo de verificación." modo="verificar" /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA REGLA DE ORO" a="La disponibilidad no se le pregunta a la IA." b="Es un dato del mundo: se mira." full /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdList dur={d} kicker="TRES CHEQUEOS, A CADA FINALISTA" title="Con tus propios ojos" items={["El nombre entre comillas en el buscador", "El usuario en la red donde vas a estar", "La dirección de internet, en un registrador"]} /> },

  { audio: "s14.wav", sec: 1, render: (d) => <TallerScene dur={d} kicker="EL CASO · SOBREMESA" lines={["Verifica", "antes de festejar."]} sub="El campo está libre para lo suyo. El usuario exacto está tomado, pero una variante con su ciudad al lado está libre, y le queda mejor." modo="verificar" /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE HIZO BIEN" lines={[{ t: "Ajustó la variante," }, { t: "sin resignar la idea.", a: true }]} sub="No bajó los brazos al primer obstáculo. Tres chequeos y un poco de flexibilidad: Sobremesa dejó de ser un capricho." art="growth" variant="left" artColor={RO} /> },

  { audio: "s16.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA LLEVARTE" title="El taller, en tres pasos" items={["Generás mucho, con contexto y fórmulas", "Filtrás vos, en voz alta, con las cuatro pruebas", "Verificás cada finalista con tus ojos"]} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Salí con\ntu nombre."} plate={["Pedí veinte", "Filtrá a tres", "Verificá los tres"]} ex="Cuando un finalista pase los tres chequeos limpio, ya tenés el nombre de tu medio. Anotalo." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Tu nombre, elegido" }, { t: "y verificado.", a: true }]} sub="La IA puso la cantidad; el criterio y el chequeo, los que de verdad definen, quedaron de tu lado." variant="bare" size={116} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Un nombre se ve en blanco y negro." b="Lo primero que le sumamos es el color." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_M2 = totalFrames(SCENES_D);
export const ClaseMarca2: React.FC = () => <ClaseVideo scenes={SCENES_D} audioDir="f42" />;
