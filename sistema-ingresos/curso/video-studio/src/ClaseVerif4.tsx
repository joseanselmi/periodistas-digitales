import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, GR } from "./lib/editorial";
import { ProcesoScene } from "./lib/proceso";
import D from "./dur/f34.json";
import C from "./dur/f34.caps.json";

// 3.4 — Transparencia: mostrar tu proceso. Módulo 3 (VERDE). CIERRE del módulo.
// HERO PROPIO: MOSTRAR EL PROCESO (la nota con su caja "cómo lo verificamos" que se despliega).
// Estructura MOSTRAR-EL-PROCESO.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN TRABAJO INVISIBLE" lines={[{ t: "Si el lector no lo ve," }, { t: "es como si no lo hicieras.", a: true }]} sub="Podés verificar perfecto: rastrear la imagen, triangular el dato, llegar a la fuente." variant="bare" size={106} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA CLAVE" a="No alcanza con acertar." b="Tiene que notarse que sos cuidadoso." full /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA ÚLTIMA PIEZA" lines={[{ t: "De adentro ya sos confiable." }, { t: "Falta que se vea afuera.", a: true }]} sub="Ya sabés verificar imágenes y datos. Hoy: hacer visible ese trabajo." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA QUE CIERRA EL MÓDULO" a="La transparencia" b="es la firma moderna." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "AFIRMAR SIN MÁS", title: "Un acto\nde fe.", sub: "“Creeme porque sí.” Hoy la gente da poco crédito así." }} right={{ label: "MOSTRAR EL CAMINO", title: "Con qué\ncomprobar.", sub: "“Acá está de dónde lo saqué.” Ya no pedís fe: das evidencia." }} /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO PARADÓJICO" lines={[{ t: "Con que se note" }, { t: "que está, alcanza.", a: true }]} sub="Cuando podés comprobarlo, casi nunca hace falta. La señal: “esta persona trabaja con las cartas sobre la mesa”." art="people" variant="left" artColor={GR} size={116} /> },

  { audio: "s7.wav", sec: 1, render: (d) => <ProcesoScene dur={d} kicker="CÓMO SE MUESTRA" lines={["Enseñá la fuente.", "Poné la cita en contexto."]} sub="Contá el chequeo en una línea: “verificamos que la foto es de 2021”. Cambia cómo se lee todo lo demás." pasos={1} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <ProcesoScene dur={d} kicker="EL RECURSO QUE NADIE USA" lines={["Una caja al pie:", "“cómo lo verificamos”."]} sub="Dos o tres renglones con los pasos que diste. Para el lector, prueba de seriedad; para vos, tu firma de calidad." pasos={3} /> },

  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA JUGADA AL REVÉS" lines={[{ t: "Mostrá también" }, { t: "lo que no sabés.", a: true }]} sub="“Esto todavía no está confirmado.” “Pedimos la otra versión y no respondió.” Marca dónde termina lo seguro." art="bulb" variant="behind" artColor={GR} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESO FORTALECE" a="El que marca sus límites" b="se vuelve el creíble." full /> },

  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CUANDO TE EQUIVOCÁS" lines={[{ t: "Corregí a la vista," }, { t: "avisando.", a: true }]} sub="No borres en silencio. Un error corregido con la cara suma más confianza que no haberte equivocado nunca." art="target" variant="left" artColor={GR} size={116} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL TONO JUSTO" lines={[{ t: "Con naturalidad," }, { t: "sin asustar.", a: true }]} sub="No llenes de advertencias ni tecnicismos. Y no exageres la certeza: mejor “según tal fuente” que un rotundo “esto es así”." variant="bare" size={112} /> },

  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN CASO · PRIMERO VERIFICÁS" lines={[{ t: "La foto, la cifra," }, { t: "y la otra versión.", a: true }]} sub="Nota sobre un corte de calle: búsqueda inversa a la foto, el número del parte oficial, y pediste la otra parte." art="screen" variant="behind" artColor={GR} /> },
  { audio: "s14.wav", sec: 1, render: (d) => <ProcesoScene dur={d} kicker="Y LO MOSTRÁS" lines={["Tres renglones", "que se defienden solos."]} sub="Las tres herramientas del módulo, a la vista: búsqueda de origen, fuente primaria, y la honestidad sobre lo que falta." pasos={3} /> },

  { audio: "s15.wav", sec: 1, render: (d) => <EdList dur={d} kicker="LO QUE PUSIMOS HOY" title="Tres para llevarte" items={["Verificar en silencio no alcanza: mostralo", "Enseñá la fuente y decí lo que no sabés", "Cuando te equivocás, corregí a la vista"]} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"La caja de\n“cómo lo verificaría”."} plate={["Imágenes: origen", "Datos: fuente + cruce", "Qué mostrar"]} ex="Agarrá una noticia y escribile a mano su caja. No hace falta verificar de verdad: el ejercicio es diseñar el proceso y pensar cómo se vería contado." /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CERRAMOS EL MÓDULO" lines={[{ t: "Dirigís la IA," }, { t: "y verificás lo que produce.", a: true }]} sub="Potencia y criterio: eso te vuelve un periodista de esta época, no un repetidor más." art="chip" variant="behind" artColor={GR} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA ETAPA" a="Le damos forma a tu proyecto:" b="el nombre y la marca de tu medio." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_V4 = totalFrames(SCENES_D);
export const ClaseVerif4: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f34.mp3" caps={C as any} />;
