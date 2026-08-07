import React from "react";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdList, EdTask, CY, VI, GO } from "./lib/editorial";
import { PerfilScene, DosPerfiles, Perfil, Reloj } from "./lib/perfil";
import D from "./dur/f14.json";
import C from "./dur/f14.caps.json";

// 1.4 — De visitante a seguidor. ESTRUCTURA: CASO PRIMERO (Ana decide en tres segundos).
// HERO PROPIO: EL PERFIL visto por un desconocido + el reloj de tres segundos.
// Distinto de la escalera (1.2), la boca (1.3) y la curva (1.6): acá el objeto es una PANTALLA.

const SCENES: SceneDef[] = [
  // — Gancho: el caso —
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA DECISIÓN DE TRES SEGUNDOS" lines={[{ t: "La decisión" }, { t: "de seguirte.", a: true }]} sub="Se repite miles de veces en la vida de tu medio. Vamos a mirarla de cerca." variant="bare" size={124} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="ELLA ES ANA" lines={["Leyó tu nota.", "Le gustó."]} sub="Y ahora va a entrar a tu perfil. Eso decide si tu trabajo de hoy suma o se evapora." paso={1} bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE VAMOS A HACER" a="Mirar esos tres segundos," b="uno por uno." full /> },

  // — Segundo uno —
  { audio: "s4.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="SEGUNDO UNO" lines={["“¿De qué", "va esto?”"]} sub="Es lo primero que hace su cabeza, antes que cualquier otra cosa." seg={1} paso={1} bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="OJO CON EL ORDEN" lines={[{ t: "Todavía no evalúa" }, { t: "si sos bueno.", a: true }]} sub="Está tratando de entender qué sos. Y hasta que no lo entienda, no puede decidir nada." art="target" variant="behind" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE CONSTRUYE UN SEGUIDOR" lines={[{ t: "No es una nota" }, { t: "espectacular.", a: true }]} sub="Es una promesa clara: qué tema tocás, para quién, y qué gana si se queda." art="news" variant="left" /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y ESTO YA LO SABÉS HACER" a="Es el mismo músculo" b="del buen título." /> },

  // — Por qué queda borrosa —
  { audio: "s8.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SI ANA NO ENTIENDE" lines={[{ t: "Casi siempre es" }, { t: "por una de dos.", a: true }]} sub="Y las dos se arreglan igual." variant="bare" size={122} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="RAZÓN 1 · CATEGORÍAS" lines={["“Noticias de", "actualidad.”"]} sub="No le dice nada a nadie. Nadie se levanta buscando actualidad en general." paso={1} bio="Noticias de actualidad" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="EN CAMBIO" lines={["Un destinatario", "con cara."]} sub="No es más larga por adorno: es más larga porque dice para quién." paso={1} bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "RAZÓN 2 · UN TEMA", title: "“Sobre\neducación.”", sub: "El tema te importa a vos." }} right={{ label: "UN BENEFICIO", title: "“Para que\nentiendas la\nescuela de\ntus hijos.”", sub: "El beneficio le importa a ella." }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL TEST QUE SIRVE SIEMPRE" lines={[{ t: "“Esto es" }, { t: "para vos si…”", a: true }]} sub="Si lo que sigue describe a una persona reconocible, está clara. Si describe a cualquiera, todavía está borrosa." art="bulb" variant="left" /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "LE SIRVE A ANA", title: "Convence al\nque llega.", sub: "Entiende de qué vas en tres segundos." }} right={{ label: "Y A LA PLATAFORMA", title: "Ayuda a que\nlleguen los que\ntienen que llegar.", sub: "Necesita saber para quién es tu contenido para decidir a quién mostrárselo." }} /> },

  // — Segundo dos —
  { audio: "s14.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="SEGUNDO DOS" lines={["Baja la vista", "y mira el resto."]} sub="Lo que casi nadie tiene en cuenta al publicar." seg={2} paso={2} bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO QUE PIENSA, SIN DECIRLO" a="“¿Será que siempre es así de bueno," b="o le salió una y nada más?”" /> },
  { audio: "s16.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="SI VE UNA LÍNEA" lines={["“Este siempre", "entrega esto.”"]} sub="Mismo mundo, mismo nivel, temas que conversan entre sí. Y toca seguir." paso={2} coherente sigue bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s17.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="SI VE UN CONJUNTO SIN LÍNEA" lines={["No puede", "predecirte."]} sub="Y seguir es apostar al futuro. Nadie apuesta a lo impredecible." paso={2} coherente={false} sigue={false} kc={VI} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO" a="La coherencia le gana" b="a la genialidad suelta." full /> },

  // — Las dos coherencias —
  { audio: "s19.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ACÁ HAY QUE SEPARAR" lines={[{ t: "Son dos" }, { t: "coherencias.", a: true }]} sub="Suelen confundirse, y las dos hacen falta." variant="bare" size={124} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="COHERENCIA DE TEMA" lines={[{ t: "Que hable del" }, { t: "mismo mundo.", a: true }]} sub="Cuatro notas sobre tu tema y una que no tiene nada que ver: la quinta le mete ruido." art="news" variant="behind" /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="COHERENCIA DE NIVEL" lines={[{ t: "Que todas tengan" }, { t: "el mismo piso.", a: true }]} size={124} sub="Una nota muy trabajada al lado de tres apuradas, y Ana concluye algo peligroso: “a veces está bueno”." art="growth" variant="left" artColor={GO} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA DECISIÓN QUE SE DESPRENDE" a="Mejor publicar menos y sostener el nivel," b="que publicar mucho con un piso que sube y baja." /> },

  // — Después de que sigue —
  { audio: "s23.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE CASI NUNCA SE CUENTA" lines={[{ t: "La decisión no termina" }, { t: "cuando toca el botón.", a: true }]} sub="Se revalida cada vez que aparecés." art="target" variant="left" /> },
  { audio: "s24.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "SI CONFIRMÁS LA PROMESA", title: "Deja de\nrevisarla.", sub: "Pasás a ser parte de lo que espera." }} right={{ label: "SI NO SE PARECE", title: "La decisión\nse afloja.", sub: "Y en algún momento deja de mirarte, con o sin botón de por medio." }} /> },
  { audio: "s25.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA CONSECUENCIA PRÁCTICA" a="No tenés que hacer algo nuevo." b="Tenés que hacer lo que prometiste." full /> },

  // — Segundo tres: los números —
  { audio: "s26.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="SEGUNDO TRES" lines={["Ana", "decide."]} sub="Veamos esa decisión repetida cien veces, con números de ejemplo." seg={3} paso={3} sigue bio="Lo que pasa en el Concejo, para vecinos sin tiempo de seguirlo" /> },
  { audio: "s27.wav", sec: 1, render: (d) => <EdList dur={d} kicker="EL PUNTO DE PARTIDA" title="Una nota que llega a mil personas" items={["1.000 la ven — es gente nueva", "100 frenan y la leen entera — les gustó, como a Ana", "¿Y de esas cien, cuántas siguen?"]} /> },
  { audio: "s28.wav", sec: 1, render: (d) => <DosPerfiles dur={d} kicker="LOS MISMOS CIEN VISITANTES" title="Dos perfiles, dos resultados" izq="Promesa clara y cinco notas en línea → 15 de cada 100 siguen" der="Sin línea clara, cosas dispersas → 2 de cada 100 siguen" /> },
  { audio: "s29.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y ACÁ ESTÁ LO IMPORTANTE" lines={[{ t: "La nota que las trajo" }, { t: "era la misma.", a: true }]} sub="Idéntica. Lo que cambió fue lo que encontraron después." variant="bare" size={118} /> },
  { audio: "s30.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA FRASE DE HOY" a="La nota abre la puerta;" b="el conjunto decide si se quedan." full /> },

  // — El criterio —
  { audio: "s31.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="AHORA, PARA EL LUNES" lines={[{ t: "Decir “sé coherente”" }, { t: "es fácil.", a: true }]} sub="Lo difícil es el momento real: tenés un tema que te entusiasma y hay que decidir si va o no va." variant="bare" size={118} /> },
  { audio: "s32.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PASALO POR TRES PREGUNTAS" title="La misma pregunta, desde tres lados" items={["¿Le sirve a la misma persona de siempre?", "¿Si fuera la primera pieza que ven de mí, entenderían de qué voy?", "¿Podría hacer diez más como esta?"]} /> },
  { audio: "s33.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PREGUNTA 1" lines={[{ t: "No a “gente”:" }, { t: "a esa persona.", a: true }]} sub="Si tu medio le habla a docentes de tu ciudad y aparece un tema buenísimo sobre otra cosa, la pregunta no es si el tema es bueno." art="people" variant="left" /> },
  { audio: "s34.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PREGUNTA 2 · LA QUE MÁS SE OLVIDA" lines={[{ t: "Cualquiera puede ser" }, { t: "el segundo uno.", a: true }]} sub="De otra Ana. Cualquier publicación puede ser la puerta de entrada de un desconocido." art="target" variant="behind" /> },
  { audio: "s35.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PREGUNTA 3" lines={[{ t: "¿Podrías hacer" }, { t: "diez más?", a: true }]} sub="Puede ser una pieza excelente y aun así una promesa que no vas a poder sostener. Lo que se sigue es lo repetible." art="growth" variant="left" /> },
  { audio: "s36.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y NO ES UNA JAULA" a="La coherencia no es hacer siempre lo mismo:" b="es que se entienda qué es lo mismo." /> },
  { audio: "s37.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="ESTO YA LO SABÉS HACER" lines={[{ t: "Ahora el editor" }, { t: "sos vos.", a: true }]} sub="Es el mismo criterio que usa un editor cuando define qué entra en la edición de mañana." art="news" variant="behind" /> },

  // — El caso aplicado —
  { audio: "s38.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PROBEMOS EL CRITERIO" lines={[{ t: "Tu medio cubre" }, { t: "educación local.", a: true }]} sub="Y aparece un tema nacional grande, que no tiene nada que ver. Tenés ganas de escribirlo." variant="bare" size={116} /> },
  { audio: "s39.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PASÁNDOLO POR LAS TRES" title="Tres noes" items={["¿Le sirve a tu lector? — No especialmente", "¿Entenderían de qué vas? — Pensarían que sos otro medio", "¿Podrías hacer diez más? — No es tu terreno"]} /> },
  { audio: "s40.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO CONVIENE TENERLO ESCRITO" a="Para que la decisión no dependa" b="del entusiasmo del momento." full /> },
  { audio: "s41.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "EL TEMA, TAL CUAL", title: "No pasa\nninguna.", sub: "Es bueno, pero no es tuyo." }} right={{ label: "EL TEMA, DESDE TU ÁNGULO", title: "Las pasa\ntodas.", sub: "Qué significa para las escuelas de tu ciudad, a quién afecta acá, qué cambia para tus lectores." }} /> },
  { audio: "s42.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LO INTERESANTE" a="Casi siempre hay un ángulo" b="desde el cual ese tema sí es tuyo." /> },

  // — La regla —
  { audio: "s43.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA REGLA CORTA" lines={[{ t: "Nadie sube dos" }, { t: "escalones de una.", a: true }]} sub="No le pedís el correo a alguien que te acaba de descubrir, igual que no le pedís plata prestada a quien acabás de conocer." art="rocket" variant="behind" /> },
  { audio: "s44.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="POR ESO HOY, UN SOLO PELDAÑO" a="Que diga “quiero más”." b="Los de arriba llegan después." full /> },

  // — Pausa de recuerdo —
  { audio: "s45.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="PARÁ UN SEGUNDO" lines={[{ t: "¿Qué pregunta se hace" }, { t: "Ana, sin decirla?", a: true }]} sub="Sin releer nada. Date el momento." variant="bare" size={116} /> },
  { audio: "s46.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA LLAVE" a="“¿Esto me va a" b="seguir sirviendo?”" full /> },

  // — Una tentación común —
  { audio: "s47.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA TENTACIÓN COMÚN" lines={[{ t: "Querer gustarle" }, { t: "a todos.", a: true }]} sub="Y entonces se abre el abanico: un poco de todo, para no dejar a nadie afuera." art="people" variant="left" /> },
  { audio: "s48.wav", sec: 1, render: (d) => <PerfilScene dur={d} kicker="Y PRODUCE EL EFECTO CONTRARIO" lines={["Ana ya no puede", "predecirte."]} sub="Cuando le hablás a todos, dejás de ser claro para cada uno." paso={2} coherente={false} kc={VI} /> },
  { audio: "s49.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA PARADOJA" a="Cuanto más específico sos," b="a más gente convertís." full /> },

  // — Cierre y tarea —
  { audio: "s50.wav", sec: 1, render: (d) => <EdList dur={d} kicker="RECORRIMOS TRES SEGUNDOS" title="Y responde que sí cuando encuentra dos cosas" items={["Una promesa clara — le dice de qué vas al instante", "Coherencia — le prueba que esa promesa la cumplís siempre"]} /> },
  { audio: "s51.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Buscá tu frase."} plate={["Clase 1.1", "“un medio de confianza sobre…”"]} ex="Esa que escribiste en la primera clase, donde definiste qué estabas construyendo." /> },
  { audio: "s52.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="Y LEELA COMO SI FUERAS ANA" lines={[{ t: "Un desconocido" }, { t: "con tres segundos.", a: true }]} sub="¿Entiende de qué va? ¿Se da cuenta de si es para ella? ¿Sabe qué gana si se queda?" art="target" variant="left" /> },
  { audio: "s53.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="Y SIN PRESIÓN" a="Es una primera versión," b="y está bien que lo sea." full /> },
  { audio: "s54.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE ESTÁS PRACTICANDO" lines={[{ t: "No es la frase:" }, { t: "es el criterio.", a: true }]} sub="Tu tema lo afinamos más adelante. El criterio te va a servir para la versión final y para cada título que escribas." art="bulb" variant="behind" /> },
  { audio: "s55.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA" a="Ana ya te sigue." b="Ahora, el paso más valioso." full /> },
  { audio: "s56.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Seguimos" stops={ROADMAP} current={1} next={2} proxima="1.5 · De seguidor a suscriptor: el único canal que es tuyo" /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F4 = totalFrames(SCENES_D);
export const ClaseFundamentos4: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f14.mp3" caps={C as any} />;
