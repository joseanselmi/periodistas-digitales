import React from "react";
import { ClaseVideo, SceneDef, totalFrames, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, GO } from "./lib/editorial";
import { ChatScene, Vuelta } from "./lib/chat";
import D from "./dur/f23.json";
import C from "./dur/f23.caps.json";

// 2.3 — Hablarle a la IA como a tu redactor. Módulo 2 (CYAN). VERSIÓN PROFUNDA.
// HERO: EL CHAT ITERATIVO (hilo que se afina, con medidor "listo %") + 2 ejemplos (agua y titular).

const SCENES: SceneDef[] = [
  // — Gancho —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL HÁBITO QUE CONVIENE DEJAR" lines={[{ t: "La usan como" }, { t: "un buscador.", a: true }]} sub="Escriben, miran lo que sale, y si no gusta, cierran. Una vuelta y afuera." variant="bare" size={120} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "UN BUSCADOR", title: "Una\nrespuesta.", sub: "La tomás o la dejás." }} right={{ label: "UN REDACTOR", title: "Varias\nvueltas.", sub: "Lo bueno aparece cuando seguís la conversación." }} /> },

  // — Puente —
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="DE DÓNDE VENIMOS" lines={[{ t: "Ya tenés una buena" }, { t: "primera respuesta.", a: true }]} sub="Las cuatro piezas te la dan, mucho mejor que la del promedio." art="chip" variant="behind" /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EL GIRO DE HOY" a="El prompt bien armado" b="abre la conversación." full /> },

  // — Idea central —
  { audio: "s5.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="TODA LA CLASE, EN UNA IDEA" a="No le hablás como a un buscador." b="Le hablás como a un redactor." full /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PENSALO ASÍ" lines={[{ t: "A un redactor no le pedís" }, { t: "la versión perfecta de una.", a: true }]} sub="La leés, le decís qué ajustar, le pedís variantes. En unas vueltas, llegan a algo bueno." art="people" variant="left" /> },

  // — Por qué el primer intento es un 70% —
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="MIRÁ EL PRIMER INTENTO ASÍ" lines={[{ t: "No falló." }, { t: "Te entregó un borrador.", a: true }]} sub="Un buen borrador, con la forma puesta, facilísimo de trabajar. Es un punto de partida, no un resultado." art="screen" variant="behind" /> },

  // — El error —
  { audio: "s8.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LA REACCIÓN AUTOMÁTICA", title: "Borra todo,\nempieza de cero.", sub: "El resultado quedó a un 70%, con partes que no cierran." }} right={{ label: "LA JUGADA BUENA", title: "Corregí sobre\nlo que hay.", sub: "Ese 70% es tu punto de partida, no basura." }} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA CUENTA QUE NO CIERRA" a="Tirar un 70% que servía," b="para volver a otro 70%." full /> },

  // — Cuándo corregir y cuándo empezar de nuevo —
  { audio: "s10.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "VAS EN LA BUENA DIRECCIÓN", title: "Corregís.", sub: "Solo hay que afinar: el tono, el largo, un dato." }} right={{ label: "SE FUE DE TEMA", title: "Reiniciás\nuna vez.", sub: "Agarró para otro lado o le habló al público que no era. Volvés a arrancar con mejor contexto, no parcheás veinte veces." }} /> },

  // — Las vueltas que sirven —
  { audio: "s11.wav", sec: 1, render: (d) => <Vuelta dur={d} kicker="VUELTA 1 · AJUSTAR UNA PARTE" instruccion="Cortá el segundo párrafo a la mitad." efecto="La IA toca solo eso y te deja el resto intacto. No rehacés nada." n={1} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <Vuelta dur={d} kicker="VUELTA 2 · PEDIR VARIANTES" instruccion="Ese título no me convence, dame cinco más." efecto="En segundos tenés opciones para elegir, en vez de pelearte con una sola." n={2} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <Vuelta dur={d} kicker="VUELTA 3 · CORREGIR EL TONO" instruccion="Bajá el tono, que suene más cercano." efecto="Se ajusta con una frase, tantas veces como haga falta hasta dar con el que va." n={3} /> },

  // — Mostrale un ejemplo —
  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VUELTA 4 · LA MÁS POTENTE" lines={[{ t: "Mostrale un ejemplo" }, { t: "de lo que te gusta.", a: true }]} sub="Una muestra le dice más que tres párrafos. Pegale una nota tuya que salió redonda: “escribí en este estilo”. Y suena a vos." art="bulb" variant="left" /> },

  // — Decir qué no te gustó —
  { audio: "s15.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="VUELTA 5 · EL PORQUÉ" lines={[{ t: "Decile qué no" }, { t: "te gustó, y por qué.", a: true }]} sub="“Le faltó el dato principal.” Así lo corrige, y dentro de esa charla no vuelve a caer en lo mismo." variant="bare" size={116} /> },

  // — Que te pregunte a vos —
  { audio: "s16.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA JUGADA QUE LE DA VUELTA" lines={[{ t: "Pedile que te" }, { t: "pregunte a vos.", a: true }]} sub="Antes de escribir, que te haga las preguntas que le falten." art="target" variant="behind" /> },
  { audio: "s17.wav", sec: 1, render: (d) => <ChatScene dur={d} kicker="ASÍ SE VE" lines={["Le llenás los huecos", "antes de que adivine."]} sub="Contestás y recién ahí escribe: arranca mucho más cerca." msgs={[{ de: "vos", t: "Antes de escribir, hacéme las preguntas que te falten." }, { de: "ia", t: "¿Para quién es? ¿Qué extensión querés? ¿Algo que deba evitar?" }]} /> },

  // — Ejemplo 1: corte de agua —
  { audio: "s18.wav", sec: 1, render: (d) => <ChatScene dur={d} kicker="UNA CONVERSACIÓN ENTERA" lines={["Arranca en el", "setenta por ciento."]} sub="Un buen prompt, pero la respuesta sale fría y larga para redes." msgs={[{ de: "vos", t: "Texto breve para redes: mañana cortan el agua en varios barrios. Tono de servicio." }, { de: "ia", t: "Se informa a los vecinos que mañana se interrumpirá el suministro de agua en diversas zonas…", pct: 70 }]} /> },
  { audio: "s19.wav", sec: 1, render: (d) => <ChatScene dur={d} kicker="NO BORRÁS: CORREGÍS" lines={["Tres vueltas cortas,", "y queda listo."]} sub="Acortar, sumar el dato clave, pedir variantes. Sin reescribir nada a mano." msgs={[{ de: "vos", t: "Acortalo a tres líneas y que la primera enganche." }, { de: "ia", t: "Atención, vecinos: mañana no hay agua en varios barrios.", pct: 85 }, { de: "vos", t: "Sumá a qué hora vuelve el agua." }, { de: "ia", t: "…el servicio se restablece a las 18 h.", pct: 100 }]} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="CUATRO MENSAJES" a="De un texto tibio y largo," b="a uno breve, útil y con opciones." full /> },

  // — Ejemplo 2: el titular —
  { audio: "s21.wav", sec: 1, render: (d) => <ChatScene dur={d} kicker="OTRA TAREA, MISMO MÉTODO" lines={["Un titular", "acartonado."]} sub="Sirve para cualquier cosa, no solo para textos de servicio." msgs={[{ de: "vos", t: "Dame un título para una nota sobre el nuevo horario de la biblioteca municipal." }, { de: "ia", t: "La biblioteca municipal actualiza su horario de atención.", pct: 70 }]} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <ChatScene dur={d} kicker="UNA SOLA VUELTA" lines={["De un cartel,", "a algo que invita."]} sub="Le decís para quién es y qué querés que despierte. Misma nota, un mensaje de diferencia." msgs={[{ de: "vos", t: "Más humano, que invite. Pensá en un vecino que quiere ir a estudiar." }, { de: "ia", t: "La biblioteca ahora abre hasta más tarde: mirá hasta cuándo.", pct: 100 }]} /> },

  // — Cuándo parar —
  { audio: "s23.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="¿Y CUÁNDO PARÁS?" lines={[{ t: "Cuando otra vuelta" }, { t: "ya no mejora bastante.", a: true }]} sub="Si movés comas y el texto ya cumple, es tuyo. Iterás para acercarte, no para perseguir una perfección que no llega." art="target" variant="left" /> },

  // — Memoria —
  { audio: "s24.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UN DETALLE ÚTIL" lines={[{ t: "En una misma charla," }, { t: "se acuerda de todo.", a: true }]} sub="Por eso entiende “el segundo párrafo”. Una charla nueva arranca limpia: seguí en el mismo hilo." art="screen" variant="behind" /> },

  // — Recuerdo —
  { audio: "s25.wav", sec: 1, render: (d) => <EdList dur={d} kicker="REPASEMOS" title="Tres cosas para llevarte" items={["El primer intento es un borrador al 70%", "Ajustar, variar, tono, ejemplo, qué no gustó", "Pedile que te pregunte antes de escribir"]} /> },

  // — Tarea —
  { audio: "s26.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"El pedido, y sus\ntres correcciones."} plate={["Acortá", "Bajá el tono", "Dame variantes"]} ex="Pensá un pedido de tu trabajo y anotá las tres correcciones que seguro le harías después. Así ya pensás en vueltas, no en disparos únicos." /> },

  // — Cierre y puente —
  { audio: "s27.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE CAMBIÓ" lines={[{ t: "Dejaste de pedir." }, { t: "Empezaste a trabajar con ella.", a: true }]} sub="El prompt abre la charla; las vueltas la llevan a donde querías." art="chip" variant="left" /> },
  { audio: "s28.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={2} next={3} proxima="2.4 · Los roles de IA de tu redacción" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_IA3 = totalFrames(SCENES_D);
export const ClaseIA3: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f23.mp3" caps={C as any} />;
