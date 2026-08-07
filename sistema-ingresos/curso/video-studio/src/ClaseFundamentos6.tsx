import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { MesScene, CurvaJ } from "./lib/curva";
import D from "./dur/f16.json";
import C from "./dur/f16.caps.json";

// 1.6 — El efecto compuesto. ESTRUCTURA: CRONOLOGÍA (un año, mes por mes).
// HERO PROPIO: LA CURVA J, que se dibuja mes a mes a medida que avanza la clase.

const SCENES: SceneDef[] = [
  // 1-3 gancho
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="HOY, ALGO DISTINTO" lines={[{ t: "Un año entero," }, { t: "mes por mes.", a: true }]} sub="En vez de teoría y después un ejemplo, recorremos un año, y la teoría aparece cuando se necesita." variant="bare" size={122} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ ASÍ" lines={[{ t: "El crecimiento solo se ve" }, { t: "con el año completo.", a: true }]} sub="No se ve en una semana, ni en un mes." variant="bare" size={118} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <MesScene dur={d} mes="ARRANCAMOS" lines={["Mes", "uno."]} sub="Vamos a dibujar la curva juntos, un punto por mes." hasta={1} /> },
  // 4-7 mes 1
  { audio: "s4.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 1" lines={["Publicás,", "y nada."]} sub="Diez lectores, doce, quince. Nada que se parezca a lo que imaginabas." hasta={1} /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="NÚMEROS CHIQUITOS" lines={[{ t: "Diez, doce," }, { t: "quince.", a: true }]} sub="Muy lejos de lo que esperabas cuando arrancaste." art="growth" variant="left" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA QUE DEFINE" a="¿Esto está" b="funcionando o no?" full /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA TRAMPA DE ESTE MES" lines={[{ t: "Desde los números," }, { t: "no se puede saber.", a: true }]} sub="La respuesta correcta es “todavía no se ve”. Y esa no es la que uno quiere escuchar." variant="bare" size={116} /> },
  // 8-12 mes 1 qué pasa de verdad + siembra
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="MIREMOS ABAJO" lines={[{ t: "Ahí está" }, { t: "la acción.", a: true }]} sub="Debajo de los números, donde no se ve, es donde pasa lo importante." art="target" variant="behind" /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CADA NOTA DEJÓ ALGO" title="Aunque casi nadie la haya visto" items={["Sumó un lector que antes no tenías", "Mejoró tu oficio un poco", "Le enseñó a la plataforma qué hacés", "Quedó en tu archivo para el que llegue mañana"]} /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="NO SE VE EN EL NÚMERO" a="Pero todo eso" b="queda." full /> },
  { audio: "s11.wav", sec: 1, render: (d) => <MesScene dur={d} mes="LA ZONA DE SIEMBRA" lines={["El que siembra no ve", "nada por semanas."]} sub="La tierra se ve igual de vacía el día diez que el día uno. Pero abajo, la semilla ya trabaja." hasta={2} siembra /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA CONFUSIÓN QUE HACE ABANDONAR" a="“No lo veo todavía”" b="no es “no está pasando”." full /> },
  // 13-20 mes 3
  { audio: "s13.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 3" lines={["Treinta y siete", "lectores."]} sub="En tres meses de trabajo. Números de ejemplo, para ver cómo se mueve la curva." hasta={3} siembra /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TREINTA Y SIETE" lines={[{ t: "En tres meses" }, { t: "de trabajo.", a: true }]} sub="Si mirás solo esto, dirías que crece lentísimo. Y para esta etapa, tendrías razón." variant="bare" size={120} /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL MOMENTO MÁS DIFÍCIL" lines={[{ t: "Es donde" }, { t: "la mayoría deja.", a: true }]} sub="No por falta de talento: por falta de una explicación que le diga qué está pasando." art="target" variant="left" /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y LA EXPLICACIÓN ES" a="El esfuerzo y el resultado" b="todavía no van de la mano." full /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SI ESPERÁS UNA RECTA", title: "Pongo uno,\nsaco uno.", sub: "Este mes te desconcierta." }} right={{ label: "SI SABÉS LA FORMA REAL", title: "Es una curva\nque se empina.", sub: "Este mes lo transitás tranquilo." }} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SEGURO TE PREGUNTÁS" lines={[{ t: "¿Es normal, o algo" }, { t: "mío está fallando?", a: true }]} sub="Desde adentro, los dos casos se ven igual: números chiquitos." variant="bare" size={116} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "CURVA SANA", title: "37, creciendo\nde a poco.", sub: "Diez, doce, quince. Sube aunque sea despacio." }} right={{ label: "PARA REVISAR", title: "37, clavados\nhace dos meses.", sub: "Ahí sí hay algo que mirar." }} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y EL RESTO" a="La respuesta completa" b="es la clase que viene." full /> },
  // 21-26 mes 4
  { audio: "s21.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 4" lines={["En vez de quince,", "sumás veinticinco."]} sub="Y no cambiaste nada. Publicás lo mismo, con la misma dedicación." hasta={4} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SIN CAMBIAR NADA" lines={[{ t: "¿Qué" }, { t: "pasó?", a: true }]} sub="Misma cantidad de trabajo, más resultado. Algo se movió." variant="bare" size={124} /> },
  { audio: "s23.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE PASÓ" a="Ya tenés base." b="Y la base trabaja por vos." full /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL MOTOR" lines={[{ t: "Cada lector es una" }, { t: "fuente de más lectores.", a: true }]} sub="Te comparte, y con su atención le avisa a la plataforma que retenés. Dos cosas al mismo tiempo." art="people" variant="left" /> },
  { audio: "s25.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO" a="Ese lector no se suma solo:" b="te trae otros." full /> },
  { audio: "s26.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA BOLA DE NIEVE" lines={[{ t: "Cada vuelta junta" }, { t: "más que la anterior.", a: true }]} sub="Porque la nieve que ya tiene hace que junte más en la vuelta siguiente." art="growth" variant="behind" /> },
  // 27-31 mes 6
  { audio: "s27.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 6" lines={["Cinco: cuarenta.", "Seis: setenta."]} sub="La curva empieza a despegarse del piso." hasta={6} inflexion /> },
  { audio: "s28.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="FRENÁ Y MIRÁ" lines={[{ t: "Lo que acaba" }, { t: "de pasar.", a: true }]} sub="Poné los números uno al lado del otro." variant="bare" size={124} /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LOS PRIMEROS 3 MESES", title: "37 lectores\nen total.", sub: "Sumando de a poquito." }} right={{ label: "EL MES 6, SOLO", title: "Casi el\ndoble de eso.", sub: "En un mes. Con el mismo trabajo." }} /> },
  { audio: "s30.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y NO FUE UN TRUCO" a="Lo que ya construiste" b="empezó a trabajar por vos." full /> },
  { audio: "s31.wav", sec: 1, render: (d) => <MesScene dur={d} mes="EL PUNTO DE INFLEXIÓN" lines={["Deja de arrastrarse", "y sube de verdad."]} sub="No llega por suerte: llega cuando la base acumulada alcanza el tamaño para moverse sola." hasta={6} inflexion /> },
  // 32-38 mes 9
  { audio: "s32.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 9" lines={["Quinientos ochenta.", "Ya no se discute."]} sub="El crecimiento ya se ve." hasta={9} /> },
  { audio: "s33.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA QUE APARECE" lines={[{ t: "¿Se puede hacer que" }, { t: "el punto llegue antes?", a: true }]} sub="Sí. Y no con trucos: con tres cosas que ya venís haciendo." variant="bare" size={116} /> },
  { audio: "s34.wav", sec: 1, render: (d) => <EdList dur={d} kicker="TRES PALANCAS" title="Que aceleran la curva" items={["Publicar con constancia — más regularidad, no más cantidad", "Mejorar lo que la gente quiere compartir", "Cuidar a los que ya están"]} /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PALANCA 1 · CONSTANCIA" lines={[{ t: "Cada publicación es" }, { t: "una vuelta de la bola.", a: true }]} sub="Y la bola solo junta si sigue rodando. Dos meses de silencio la hacen empezar de nuevo." art="rocket" variant="left" /> },
  { audio: "s36.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PALANCA 2 · LO COMPARTIBLE" lines={[{ t: "Una nota que se comparte" }, { t: "hace dos trabajos.", a: true }]} sub="Entre tres cosas correctas y una que la gente quiera mandar a un amigo, la segunda acelera la curva." art="news" variant="behind" /> },
  { audio: "s37.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PALANCA 3 · LOS QUE YA ESTÁN" lines={[{ t: "Ellos traen" }, { t: "a los que vienen.", a: true }]} sub="Responder un comentario, contestar una duda, tratar bien a los primeros. No es cortesía: es el motor." art="people" variant="left" /> },
  { audio: "s38.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y FIJATE" a="Ninguna es trabajar más." b="Son las mismas horas, mejor puestas." full /> },
  // 39-41 pausa
  { audio: "s39.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARÁ UN SEGUNDO" lines={[{ t: "Antes de mirar" }, { t: "el resto del año.", a: true }]} sub="Sin espiar hacia arriba, contestate una cosa." variant="bare" size={120} /> },
  { audio: "s40.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA" a="¿Por qué se acelera" b="con el tiempo?" full /> },
  { audio: "s41.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ALGO ASÍ" a="Cada lector nuevo trae más," b="y la base empieza a crecer sola." full /> },
  // 42-47 mes 12
  { audio: "s42.wav", sec: 1, render: (d) => <MesScene dur={d} mes="MES 12" lines={["Mirá la forma", "que dibujaron."]} sub="Estirá la película hasta acá y mirá el año entero de un tirón." hasta={12} /> },
  { audio: "s43.wav", sec: 1, render: (d) => <MesScene dur={d} mes="TIENE NOMBRE" lines={["Es una", "curva en jota."]} sub="Plana al principio, y después se empina y no para." hasta={12} inflexion /> },
  { audio: "s44.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESTO SOLO SE VE DESDE ACÁ" a="Los meses planos no fueron perdidos:" b="hicieron posible el resto." full /> },
  { audio: "s45.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR ESO CAMBIA TODO SABERLO" lines={[{ t: "El mes tres deja" }, { t: "de ser una alarma.", a: true }]} sub="Pasa a ser lo que siempre fue: el mes en que se arman las raíces." art="growth" variant="left" /> },
  { audio: "s46.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ALGO MÁS QUE CONVIENE SABER" lines={[{ t: "La curva no sube" }, { t: "sola para siempre.", a: true }]} sub="Se empina mientras vos sigas alimentando la base. La velocidad de tu crecimiento está en tus manos, no en la suerte." art="target" variant="behind" /> },
  { audio: "s47.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESO ES LO BUENO" a="Se empina porque hacés algo." b="Depende de vos." full /> },
  // 48-51 ojo con esto
  { audio: "s48.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN MATIZ" lines={[{ t: "Hay una manera de entender" }, { t: "esto que juega en contra.", a: true }]} sub="Y quiero que te quedes con la otra." variant="bare" size={118} /> },
  { audio: "s49.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA LECTURA EQUIVOCADA" lines={[{ t: "“Me relajo y" }, { t: "espero la magia.”", a: true }]} sub="Siembro cualquier cosa y que la bola de nieve haga lo suyo. Ahí se entiende todo al revés." art="target" variant="left" /> },
  { audio: "s50.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="PORQUE" a="La bola amplifica lo que le des." b="No reemplaza la calidad: la multiplica." full /> },
  { audio: "s51.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA LECTURA CORRECTA" lines={[{ t: "Lo bueno que hacés hoy" }, { t: "se sigue pagando mañana.", a: true }]} sub="Esa nota que hoy leen quince personas puede seguir sumando lectores durante meses. Sembrás en una tierra que multiplica." art="growth" variant="behind" /> },
  // 52-55 cierre y tarea
  { audio: "s52.wav", sec: 1, render: (d) => <MesScene dur={d} mes="RECORRIMOS UN AÑO" lines={["No es una recta:", "es una curva."]} sub="Se empina porque cada lector nuevo trae más, y la base termina trabajando sola." hasta={12} /> },
  { audio: "s53.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Dibujá tu curva."} plate={["Tiempo abajo", "Lectores al costado", "Plana, y después empinada"]} ex="A doce meses. Los números no importan; lo que importa es que te quede grabada la forma." /> },
  { audio: "s54.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y COLGALA DONDE LA VEAS" a="El día que sientas que no pasa nada," b="te va a decir dónde estás parado." full /> },
  { audio: "s55.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={1} next={2} proxima="1.7 · Cómo saber si tu máquina está funcionando" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F6 = totalFrames(SCENES_D);
export const ClaseFundamentos6: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f16.mp3" caps={C as any} />;
