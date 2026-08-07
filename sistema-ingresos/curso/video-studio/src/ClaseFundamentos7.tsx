import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { AuditScene, Hoja } from "./lib/curva";
import D from "./dur/f17.json";
import C from "./dur/f17.caps.json";

// 1.7 — Cómo saber si tu máquina funciona. ESTRUCTURA: AUDITORÍA (el alumno diagnostica en vivo).
// HERO PROPIO: LA HOJA que se va llenando con las cuatro respuestas del alumno. Cierra el módulo.
const R = ["+3", "Marta, Luis…", "2 veces", "Sí"];

const SCENES: SceneDef[] = [
  // 1-5 gancho: preparar la hoja
  { audio: "s1.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="LA ÚLTIMA CLASE" lines={["Vamos a auditar", "tu medio."]} sub="Juntos, ahora, con la hoja delante." hecha={0} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA IDEA DE HOY" lines={[{ t: "Que salgas con" }, { t: "algo hecho.", a: true }]} sub="No solo con algo entendido. Es el cierre del módulo." variant="bare" size={122} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="AGARRÁ UNA HOJA" lines={[{ t: "Y con qué" }, { t: "escribir.", a: true }]} sub="Usá el dibujo de tu máquina de la segunda clase. Y si no lo guardaste, dibujá los cinco escalones ahora en treinta segundos." art="news" variant="left" /> },
  { audio: "s4.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="CÓMO VA A SER" lines={["Yo pregunto,", "vos contestás."]} sub="Y después de cada una te explico por qué te la hice y qué significa tu respuesta." hecha={0} /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y SI RECIÉN ARRANCÁS" a="Todo en cero, con fecha," b="es la foto de tu día uno." full /> },
  // 6-9 por qué no el dinero
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE NO TE VOY A PREGUNTAR" lines={[{ t: "Cuánto dinero" }, { t: "entró.", a: true }]} sub="Y no porque no importe: importa muchísimo." variant="bare" size={122} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PORQUE EL INGRESO" lines={[{ t: "Llega" }, { t: "al final.", a: true }]} sub="Se apoya en las cuatro etapas anteriores, así que aparece cuando todo lo demás ya venía andando." art="coins" variant="left" /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SEÑAL ATRASADA", title: "El ingreso.", sub: "Te confirma tarde, y no te dice qué tocar. Si lo esperás, te enterás en seis meses." }} right={{ label: "SEÑAL ADELANTADA", title: "Lo que avisa\ntemprano.", sub: "Mientras todavía podés hacer algo." }} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE VAMOS A MIRAR HOY" a="Las señales" b="que avisan temprano." full /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SÉ QUE LA ESTÁS ESPERANDO" lines={[{ t: "La plata es el" }, { t: "último escalón.", a: true }]} sub="Llega cuando los de abajo están firmes. Primero construimos la máquina; los módulos de monetización son enteros sobre convertirla en ingresos." art="coins" variant="left" artColor={GO} /> },
  // 10-13 pregunta 1
  { audio: "s11.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="PREGUNTA 1" lines={["¿Se sumó alguien", "a tu lista?"]} sub="Escribí el número. Puede ser cero, y está perfecto si todavía no llegaste a esa etapa." hecha={1} resp={R} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y TE CUENTO POR QUÉ" lines={[{ t: "Es la primera" }, { t: "pregunta.", a: true }]} sub="No es al azar: esta señal tiene algo que las otras no." variant="bare" size={124} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA ETAPA MÁS DIFÍCIL" lines={[{ t: "Si se mueve," }, { t: "todo lo previo funciona.", a: true }]} sub="Una sola persona nueva en tu lista te dice que te alcanzaron, te leyeron, te siguieron y confiaron." art="people" variant="left" /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO ES LA QUE MÁS ADELANTA" a="La que más cuesta mover," b="y la que más confirma cuando se mueve." full /> },
  // 14-18 pregunta 2
  { audio: "s15.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="PREGUNTA 2" lines={["¿Reconocés", "algún nombre?"]} sub="Esta no se contesta con un número, sino con nombres propios. Anotá los que te vengan." hecha={2} resp={R} kc={VI} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE BUSCÁS" lines={[{ t: "Alguien que" }, { t: "aparece seguido.", a: true }]} sub="Que comente más de una vez, que responda, que esté en varias de tus publicaciones." art="people" variant="behind" /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="PORQUE CUANDO ALGUIEN VUELVE" a="Te dice algo que ningún número dice:" b="que lo que hiciste le sirvió." /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESTO CONVIENE TENERLO CLARO" a="Un puñado que vuelve vale más" b="que una multitud que pasa una vez." full /> },
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SI NO ANOTASTE NINGUNO" lines={[{ t: "Tampoco" }, { t: "pasa nada.", a: true }]} sub="Estás en la parte del recorrido donde todavía llega gente nueva y de paso. Es por donde se empieza." art="target" variant="left" /> },
  // 19-21 pregunta 3
  { audio: "s20.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="PREGUNTA 3" lines={["¿Alguien", "te compartió?"]} sub="¿Alguna publicación fue compartida, alguien te mandó a otro, te citó? Anotá cuántas veces, aunque sea una." hecha={3} resp={R} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ESTA ES ESPECIAL" lines={[{ t: "Pone su nombre" }, { t: "en juego por vos.", a: true }]} sub="Ya lo sabés de la clase del alcance: “confío tanto en esto que te lo recomiendo”. Nadie hace eso con algo apenas correcto." art="bulb" variant="left" artColor={GO} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO" a="Una sola vez que te comparten" b="dice más que cien miradas distraídas." full /> },
  // 22-25 pregunta 4
  { audio: "s23.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="PREGUNTA 4 · LA MÁS HUMANA" lines={["¿Alguien te", "preguntó algo?"]} sub="¿Alguien te escribió para consultarte sobre tu tema? ¿Te trataron como referencia?" hecha={4} resp={R} kc={GO} /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA RESPUESTA" a="Un sí" b="o un no." /> },
  { audio: "s25.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y POR QUÉ CUENTA TANTO" lines={[{ t: "Te reconoce" }, { t: "una autoridad.", a: true }]} sub="No te dice “qué linda nota”: te dice “vos sabés de esto, y confío en tu respuesta”." art="people" variant="behind" /> },
  { audio: "s26.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="ES EL CAPITAL DE CONFIANZA" a="Que aparezca temprano" b="es que ya empezó a acumularse." full /> },
  // 26-36 leé tu hoja
  { audio: "s27.wav", sec: 1, render: (d) => <AuditScene dur={d} kicker="AHORA LEÉ TU HOJA" lines={["Cuatro", "respuestas."]} sub="Miralas juntas." hecha={4} resp={R} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y FIJATE ALGO" lines={[{ t: "Ninguna necesitó" }, { t: "dinero ni herramientas.", a: true }]} sub="Las cuatro las contestás con veinte lectores. Ese tablero ya lo tenías: faltaba el hábito de mirarlo." art="growth" variant="left" /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LEAMOS EL RESULTADO" lines={[{ t: "Tres lecturas" }, { t: "posibles.", a: true }]} sub="Según lo que quedó en tu hoja." variant="bare" size={124} /> },
  { audio: "s30.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VARIAS ENCENDIDAS, CERO INGRESOS" lines={[{ t: "Siembra" }, { t: "sana.", a: true }]} sub="Lo que te falta es tiempo, no corrección. Seguí exactamente como venís." art="growth" variant="behind" /> },
  { audio: "s31.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="APAGADAS, CERO INGRESOS" lines={[{ t: "Un aviso" }, { t: "temprano.", a: true }]} sub="Hay una etapa trabada que conviene revisar ahora, sin esperar seis meses a que la falta de ingresos lo confirme." art="target" variant="left" artColor={GO} /> },
  { audio: "s32.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TODO EN CERO, RECIÉN ARRANCÁS" lines={[{ t: "Tu línea de base" }, { t: "con fecha.", a: true }]} sub="Nada que interpretar todavía, y todo por comparar." art="news" variant="behind" /> },
  { audio: "s33.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL MISMO CERO, TRES HISTORIAS" a="El tablero adelantado" b="es lo que te deja distinguirlas." full /> },
  { audio: "s34.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL PASO QUE LO CONVIERTE EN DIAGNÓSTICO" lines={[{ t: "Buscá dónde" }, { t: "se corta la cadena.", a: true }]} sub="Cada combinación de respuestas te señala una etapa distinta." variant="bare" size={116} /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CADA COMBINACIÓN, UNA ETAPA" title="Leídas de arriba hacia abajo" items={["Te ven pero no se suman — algo entre llegar y dejar el correo no cierra", "Se suman pero no vuelven — lo que reciben no engancha", "Te comparten pero no se quedan — el título promete de más"]} /> },
  { audio: "s36.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y SI NO ES NINGUNA DE ESAS" lines={[{ t: "El método" }, { t: "sirve igual.", a: true }]} sub="No es memorizar combinaciones: es leer de arriba hacia abajo y frenar en la primera que esté floja." art="target" variant="left" /> },
  { audio: "s37.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE HACE TU HOJA" a="No te dice si vas bien o mal." b="Te dice en qué escalón está la traba." full /> },
  // 37-41 qué hacés con eso
  { audio: "s38.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿Y AHORA QUÉ HACÉS?" lines={[{ t: "La parte que la vuelve" }, { t: "herramienta.", a: true }]} sub="Tenés la hoja llena y sabés dónde se traba. Falta qué se hace con eso." variant="bare" size={116} /> },
  { audio: "s39.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y CIERRA CON LO DE LA SEGUNDA CLASE" a="Frená en la primera floja," b="cambiá una sola cosa, y dale tiempo." full /> },
  { audio: "s40.wav", sec: 1, render: (d) => <EdList dur={d} kicker="AHORA SABÉS QUÉ CAMBIAR" title="Una traba, una palanca" items={["Traba arriba (te ven poco) → el título y el ángulo", "Traba al medio (no se quedan) → la promesa clara", "Traba abajo (no dan el correo) → lo que ofrecés a cambio"]} /> },
  { audio: "s41.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y NUNCA TODO JUNTO" a="Una traba, una palanca." b="Nunca las tres al mismo tiempo." full /> },
  { audio: "s42.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y UN CONSEJO SOBRE EL RITMO" lines={[{ t: "Cada quince días," }, { t: "no todos los días.", a: true }]} sub="Las señales se mueven en semanas. Mirarlas cada día no da información nueva: da ansiedad." art="target" variant="behind" /> },
  // 42-45 pausa de recuerdo
  { audio: "s43.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL EJERCICIO DE SIEMPRE" lines={[{ t: "Sin mirar" }, { t: "la hoja.", a: true }]} sub="Decilo con tus palabras." variant="bare" size={124} /> },
  { audio: "s44.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PREGUNTA" a="¿Adelantada" b="o atrasada?" full /> },
  { audio: "s45.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="…" lines={[{ t: "Tomate" }, { t: "el momento.", a: true }]} sub="Decilo antes de seguir." variant="bare" size={128} /> },
  { audio: "s46.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "ADELANTADA", title: "Avisa\ntemprano.", sub: "La lista, los que vuelven, los que comparten, los que preguntan." }} right={{ label: "ATRASADA", title: "Confirma\ndespués.", sub: "El ingreso. Cuando el trabajo ya está hecho." }} /> },
  // 46-49 ojo con esto
  { audio: "s47.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN ÚLTIMO MATIZ" lines={[{ t: "Una invitación" }, { t: "a la calma.", a: true }]} sub="Con cuatro señales, es fácil caer en la tentación opuesta." variant="bare" size={122} /> },
  { audio: "s48.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA TENTACIÓN" lines={[{ t: "Medir todo," }, { t: "todo el tiempo.", a: true }]} sub="Y vivir pendiente de cada número." art="target" variant="left" /> },
  { audio: "s49.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CON MENOS ALCANZA" lines={[{ t: "Al principio," }, { t: "tres rinden más que diez.", a: true }]} sub="Elegí las tres que mejor te hablen de tu momento y mirá solo esas, con calma, cada quince días." art="bulb" variant="behind" /> },
  { audio: "s50.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LAS DEMÁS ESPERAN SU TURNO" a="Un tablero simple que mirás con calma" b="vale más que uno completo que te agota." full /> },
  // 50-54 cierre del módulo
  { audio: "s51.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CERRAMOS LOS FUNDAMENTOS" lines={[{ t: "Repasemos lo" }, { t: "que tenés ahora.", a: true }]} sub="Que es más de lo que parece." variant="bare" size={122} /> },
  { audio: "s52.wav", sec: 1, render: (d) => <EdList dur={d} kicker="TODO EL MÓDULO, EN UNA IDEA" title="Tu medio es una máquina de cinco etapas" items={["La gente llega, se queda, se vuelve tuya", "Todo se acumula en una curva que se empina", "Y para saber si funciona, leés las señales que avisan temprano"]} /> },
  { audio: "s53.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Elegí tres señales."} plate={["Se suma gente", "Vuelven los mismos", "Te comparten"]} ex="De las cuatro, cuáles tres vas a mirar estos primeros meses. Anotalas al lado del dibujo de tu máquina." /> },
  { audio: "s54.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN UNA SOLA HOJA" a="La máquina y su tablero." b="Y ya sabés cómo se lee." full /> },
  { audio: "s55.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Terminamos Fundamentos" stops={ROADMAP} current={1} next={2} proxima="Módulo 2 · Tu equipo de inteligencia artificial" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F7 = totalFrames(SCENES_D);
export const ClaseFundamentos7: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f17.mp3" caps={C as any} />;
