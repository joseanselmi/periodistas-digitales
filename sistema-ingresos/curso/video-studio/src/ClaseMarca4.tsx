import React from "react";
import { ClaseVideo, SceneDef, totalFrames } from "./lib/kit";
import { EdStatement, EdQuote, EdList, EdTask } from "./lib/editorial";
import { TipoScene, RO } from "./lib/marca";
import D from "./dur/f44.json";

// 4.4 — Tipografía y logo sin diseñador. Módulo 4 (ROSA).
// HERO PROPIO: DOS DECISIONES (muestrario de letras + logo wordmark que se arma).
// Estructura DOS DECISIONES, SIN DISEÑADOR.

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SIN DISEÑADOR" lines={[{ t: "Tipografía y logo:" }, { t: "dos decisiones simples.", a: true }]} sub="Suenan a terreno de especialista, y se toman con criterio y buen gusto, no con talento artístico. Hoy las resolvés las dos." variant="bare" size={112} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VAS A LOGRAR HOY" lines={[{ t: "Letra clara y logo digno," }, { t: "esta misma tarde.", a: true }]} sub="Con herramientas gratuitas que ya están a tu alcance. Sin diseñador, y sin gastar un peso." art="bulb" variant="behind" artColor={RO} /> },

  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA BUENA BASE" lines={[{ t: "No creás nada de cero:" }, { t: "elegís y combinás.", a: true }]} sub="Entre cosas que ya existen y están muy bien hechas, con las decisiones que ya tomaste. Tu trabajo es de buen gusto y sentido común." art="target" variant="left" artColor={RO} /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA IDEA QUE ORDENA" a="En tipografía y logo," b="la claridad le gana a la creatividad." full /> },

  { audio: "s5.wav", sec: 1, render: (d) => <TipoScene dur={d} kicker="LA LETRA · DOS FAMILIAS" lines={["Con remates,", "o de trazo limpio."]} sub="Las de patitas: clásicas, editoriales, con historia. Las de trazo limpio: modernas, cercanas, actuales. Ninguna es mejor: es cuál le va a tu medio." modo="tipo" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="SU NOMBRE TÉCNICO" lines={[{ t: "Serif" }, { t: "y sans serif.", a: true }]} sub="En los bancos de fuentes vas a ver esas dos palabras: serif son las de remates, y sans serif, sin remates. Con reconocerlas, ya te movés." art="chip" variant="behind" artColor={RO} /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA REGLA DE ORO" lines={[{ t: "Una, o como mucho dos." }, { t: "Nunca más.", a: true }]} sub="Con una bien elegida ya tenés un medio prolijo. Si querés más riqueza, una para títulos y una bien legible para el texto largo." variant="bare" size={112} /> },
  { audio: "s8.wav", sec: 1, render: (d) => <TipoScene dur={d} kicker="LA DUPLA QUE FUNCIONA" lines={["Una con carácter,", "una que se hace invisible."]} sub="La de títulos puede tener personalidad; la del texto largo se hace invisible para que la gente lea de corrido. La fórmula de casi todos los medios." modo="tipo" /> },

  { audio: "s9.wav", sec: 1, render: (d) => <TipoScene dur={d} kicker="EL LOGO · LA MEJOR PARTE" lines={["Tu nombre,", "bien escrito."]} sub="Tu primer logo puede ser, simplemente, tu nombre en una buena tipografía, con tu color. Muchísimas marcas gigantes son exactamente eso." modo="logo" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TIENE NOMBRE PROPIO" lines={[{ t: "Se llama" }, { t: "logo de solo texto.", a: true }]} sub="Una de las formas más elegantes y usadas que hay. Tu nombre, bien tipografiado, ya es un logo válido y profesional desde el día uno." art="target" variant="left" artColor={RO} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA VERDAD QUE LIBERA" lines={[{ t: "Sin dibujo," }, { t: "sin esperar a nadie.", a: true }]} sub="Si más adelante querés sumar un símbolo, vas a poder. Para empezar, tu nombre bien puesto es una decisión sabia y más que suficiente." art="chip" variant="behind" artColor={RO} /> },

  { audio: "s12.wav", sec: 1, render: (d) => <EdList dur={d} kicker="CÓMO LO ARMÁS, SIN GASTAR" title="El camino es corto" items={["Las fuentes, gratis, en Google Fonts", "Escribís tu nombre en el editor de diseño", "Tu tipografía de títulos y tu color", "Exportás con fondo transparente"]} /> },

  { audio: "s13.wav", sec: 1, render: (d) => <TipoScene dur={d} kicker="EL CASO · SOBREMESA" lines={["Su letra clásica,", "su color vino."]} sub="Calidez y tradición: se va a la familia de las patitas, con carácter para el nombre y una compañera legible para el texto. Y su logo sale solo." modo="logo" /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EN UNA TARDE" lines={[{ t: "Sin diseñador" }, { t: "y sin gastar.", a: true }]} sub="Pasó de un nombre suelto a un nombre con letra y con logo. No la hizo llegar saber diseñar; fue tener claras las decisiones y animarse a la versión simple." art="growth" variant="left" artColor={RO} /> },

  { audio: "s15.wav", sec: 1, render: (d) => <EdList dur={d} kicker="PARA LLEVARTE" title="Las dos decisiones" items={["Elegí la familia que respira como tu marca", "Una tipografía, o como mucho dos", "Tu nombre bien escrito ya es tu logo"]} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Tu letra\ny tu logo."} plate={["Elegí la familia", "Una o dos fuentes", "Logo de solo texto"]} ex="No busques la perfección; buscá la versión clara y digna. La vas a poder pulir siempre." /> },
  { audio: "s17.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE TE LLEVÁS" lines={[{ t: "Ya tenés todos" }, { t: "los ingredientes.", a: true }]} sub="Derribaste la idea de que hacía falta un diseñador. Nombre, color, letra y logo: tu identidad, sobre la mesa." variant="bare" size={116} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="EN LA PRÓXIMA · CIERRE" a="Falta que todas trabajen juntas." b="El sistema de marca, y tu voz." full /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_M4 = totalFrames(SCENES_D);
export const ClaseMarca4: React.FC = () => <ClaseVideo scenes={SCENES_D} audioDir="f44" />;
