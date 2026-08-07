import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ClaseVideo, totalFrames, SceneDef, ProgressMap, ROADMAP, Scene, Kicker, useRise, accent, Snd } from "./lib/kit";
import { EdStatement, EdQuote, EdSplit, EdCards, EdList, EdTask, Flow, StackBars, CoinStack, FlatNoise, RiseLine, CY, VI, GO, IN } from "./lib/editorial";
import D from "./dur/f11.json";
import C from "./dur/f11.caps.json";

// 1.1 — El negocio de un medio de nicho · CLASE MOLDE del curso.
// Estilo EDITORIAL OSCURO (titulares tapa de diario, asimetría, gráfico sangrando) + CERO espacio muerto:
// cada escena tiene su visual que APORTA. Heroes a medida: CircleFlow · CompoundChain · Pyramid.
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// HERO — la máquina de tráfico (círculo que fluye)
const CircleFlow: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame(); const rise = useRise();
  const stages = ["Publicás", "Tráfico", "Audiencia", "Confianza", "Ingresos"];
  const cx = 1290, cy = 560, R = 245;
  const a0 = (f * 1.6 * Math.PI) / 180;
  return (
    <Scene dur={dur} justify="flex-start">
      <div style={{ position: "absolute", left: 152, top: 300, width: 950, textAlign: "left" }}>
        <div style={{ ...rise(4), display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 46, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 23, fontWeight: 800, letterSpacing: 8 }}>LA MÁQUINA DE TRÁFICO</span>
        </div>
        <div style={{ ...rise(12), fontSize: 92, fontWeight: 800, lineHeight: 0.98, letterSpacing: -3.5, color: "#fff", whiteSpace: "nowrap" }}>
          Un círculo que se<br /><span style={accent}>retroalimenta.</span>
        </div>
      </div>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="ringF" x1="0" x2="1"><stop offset="0" stopColor={IN} /><stop offset="1" stopColor={CY} /></linearGradient></defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#ringF)" strokeWidth={4} strokeOpacity={0.4} strokeDasharray="10 14" />
        <circle cx={cx + R * Math.cos(a0)} cy={cy + R * Math.sin(a0)} r={11} fill={CY} style={{ filter: `drop-shadow(0 0 14px ${CY})` }} />
        {stages.map((s, i) => {
          const a = ((-90 + i * (360 / stages.length)) * Math.PI) / 180;
          const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          const ap = interpolate(f - (20 + i * 10), [0, 10], [0, 1], clamp);
          return (
            <g key={i} opacity={ap}>
              <circle cx={x} cy={y} r={66} fill="#141726" stroke={CY} strokeWidth={3} />
              <text x={x} y={y + 8} fill="#fff" fontSize={22} fontWeight={700} textAnchor="middle" fontFamily="Segoe UI">{s}</text>
            </g>
          );
        })}
      </svg>
    </Scene>
  );
};

// HERO — efecto compuesto (constelación que se multiplica + contador)
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const CompoundChain: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame(); const rise = useRise();
  const N = 150; const cx = 1300, cy = 620; const golden = (137.5 * Math.PI) / 180;
  const prog = interpolate(f, [18, dur * 0.92], [0, 1], clamp);
  const eased = prog * prog;
  const shown = Math.floor(eased * N);
  const counter = Math.floor(eased * eased * 8000);
  return (
    <Scene dur={dur} justify="flex-start">
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }).map((_, i) => {
          if (i >= shown) return null;
          const r = Math.sqrt(i) * 19; const a = i * golden;
          const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          const pop = interpolate(shown - i, [0, 6], [0, 1], clamp);
          const sz = 4 + 6 * pop; const col = i % 3 === 0 ? CY : i % 3 === 1 ? VI : IN;
          return <circle key={i} cx={x} cy={y} r={sz} fill={col} opacity={0.45 + 0.55 * pop} style={{ filter: `drop-shadow(0 0 ${sz}px ${col})` }} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 152, top: 300, width: 800, textAlign: "left" }}>
        <div style={{ ...rise(4), display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 46, height: 3, background: CY }} />
          <span style={{ color: CY, fontSize: 23, fontWeight: 800, letterSpacing: 8 }}>EL EFECTO COMPUESTO</span>
        </div>
        <div style={{ ...rise(12), fontSize: 112, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, color: "#fff" }}>
          Crece cada vez<br /><span style={accent}>más rápido</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1130, top: 250, textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums", textShadow: `0 0 34px ${CY}`, lineHeight: 1 }}>{fmt(counter)}</div>
        <div style={{ marginTop: 10, fontSize: 26, color: "#9a9ab2", fontWeight: 600, letterSpacing: 6 }}>LECTORES</div>
      </div>
    </Scene>
  );
};

// HERO — pirámide de monetización por capas
const Pyramid: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame(); const rise = useRise();
  const layers = [{ t: "Confianza", c: IN, w: 640 }, { t: "Afiliados", c: CY, w: 500 }, { t: "Anunciantes", c: VI, w: 370 }, { t: "Tu oferta", c: GO, w: 250 }];
  return (
    <Scene dur={dur} justify="flex-start">
      <div style={{ position: "absolute", left: 152, top: 250, width: 720, textAlign: "left" }}>
        <div style={{ ...rise(4), display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 46, height: 3, background: GO }} />
          <span style={{ color: GO, fontSize: 23, fontWeight: 800, letterSpacing: 8 }}>MONETIZACIÓN POR CAPAS</span>
        </div>
        <div style={{ ...rise(12), fontSize: 100, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, color: "#fff" }}>
          Cada capa se apoya<br />en la de abajo
        </div>
        <div style={{ ...rise(28), marginTop: 34, fontSize: 30, color: "#9a9ab2", fontWeight: 300, borderLeft: `2px solid ${GO}`, paddingLeft: 20, maxWidth: 560 }}>
          Sin la base de confianza, ninguna capa de arriba se sostiene.
        </div>
      </div>
      <div style={{ position: "absolute", right: 190, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 10 }}>
        {layers.map((L, i) => {
          const ap = interpolate(f - (24 + i * 14), [0, 14], [0, 1], clamp);
          return (
            <div key={i} style={{ opacity: ap, transform: `translateY(${(1 - ap) * 44}px)`, width: L.w, padding: "20px 0", borderRadius: 12, textAlign: "center", background: `linear-gradient(135deg,${L.c}cc,${L.c}55)`, border: `1px solid ${L.c}`, color: "#fff", fontSize: 29, fontWeight: 800, boxShadow: `0 0 26px ${L.c}55` }}>
              <Snd at={24 + i * 14} s="pop.wav" v={0.3} />{L.t}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const SCENES: SceneDef[] = [
  { audio: "s1.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="MÓDULO 1 · FUNDAMENTOS" lines={[{ t: "El negocio de un" }, { t: "medio de nicho.", a: true }]} sub="La base de todo: entender qué estás construyendo de verdad." art="news" size={118} /> },
  { audio: "s2.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL PUNTO DE PARTIDA" lines={[{ t: "Un producto" }, { t: "se cobra" }, { t: "una sola vez.", a: true }]} sub="Tu ingreso se termina en el momento exacto en que dejás de vender." art="coins" size={132} /> },
  { audio: "s3.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LO QUE VAMOS A CONSTRUIR" lines={[{ t: "Un activo" }, { t: "rinde en el tiempo.", a: true }]} sub="Se construye una vez y sigue generando valor, aunque no estés encima. Una propiedad. Un árbol que da fruta cada año." art="growth" variant="left" /> },
  { audio: "s4.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="CÓMO SE ACUMULA" lines={[{ t: "Cada nota suma" }, { t: "un lector que vuelve.", a: true }]} sub="El trabajo de hoy se sigue pagando mañana, el mes que viene, y el año que viene." extra={<StackBars color={CY} dur={d} />} size={120} /> },
  { audio: "s5.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="CAMBIÁ LA PREGUNTA" a="¿Cuánto vale tu medio" b="hoy más que ayer?" /> },
  { audio: "s6.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="UNA DISTINCIÓN CLAVE" lines={[{ t: "Terreno" }, { t: "prestado.", a: true }]} sub="Tus seguidores en Instagram o Facebook no son del todo tuyos." art="screen" /> },
  { audio: "s7.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="POR QUÉ PRESTADO" lines={[{ t: "Manda" }, { t: "el algoritmo.", a: true }]} sub="Cambia las reglas y tus notas llegan a la mitad. Vos no controlás ese canal." art="chip" variant="behind" /> },
  { audio: "s8.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "TERRENO PRESTADO", title: "Manda el\nalgoritmo.", sub: "Te encontrás con tu audiencia, pero no la poseés.", proof: <Flow blocked /> }} right={{ label: "TERRENO PROPIO", title: "Mandás\nvos.", sub: "Tu newsletter: le escribís directo y nadie te la puede quitar.", proof: <Flow /> }} /> },
  { audio: "s9.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA PREGUNTA MÁS IMPORTANTE" lines={[{ t: "¿Qué le da valor" }, { t: "a tu audiencia?", a: true }]} sub="Una sola palabra: la confianza." art="people" variant="left" /> },
  { audio: "s10.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA CONFIANZA ES UN CAPITAL" lines={[{ t: "Cada aparición," }, { t: "un depósito.", a: true }]} sub="Se acumula con el tiempo. Y después te permite hacer retiros: recomendar, proponer, vender." extra={<CoinStack color={VI} dur={d} />} size={116} /> },
  { audio: "s11.wav", sec: 1, render: (d) => <EdSplit dur={d} left={{ label: "MIL POSTEOS", title: "Sin confianza,\nno valen nada.", sub: "Ruido que pasa y no deja nada.", proof: <FlatNoise dur={d} /> }} right={{ label: "MIL LECTORES", title: "Que confían,\nvalen muchísimo.", sub: "Eso es lo que después se convierte en ingresos.", proof: <RiseLine dur={d} /> }} /> },
  { audio: "s12.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="TU VENTAJA COMO PERIODISTA" lines={[{ t: "Ya sabés" }, { t: "construir confianza.", a: true }]} sub="Elegir qué importa, contarlo con rigor, sostener una línea. Eso lo traés puesto de tu oficio." art="bulb" variant="behind" size={122} /> },
  { audio: "s13.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="LA SEGUNDA CLAVE" lines={[{ t: "Especializate:" }, { t: "elegí un tema.", a: true }]} sub="Cuando hablás de todo, no sos la referencia de nada." art="target" variant="left" /> },
  { audio: "s14.wav", sec: 1, render: (d) => <EdQuote dur={d} kicker="LA TEORÍA DEL NICHO" a="La autoridad nace" b="de la especialización." full /> },
  { audio: "s15.wav", sec: 1, render: (d) => <EdCards dur={d} kicker="EJEMPLOS DE NICHO" title="Sin competencia real" cards={[{ tag: "Tecnología", text: "En tu ciudad", c: CY }, { tag: "Gastronomía", text: "De tu región", c: VI }, { tag: "Un deporte", text: "Específico, con su comunidad", c: GO }]} /> },
  { audio: "s16.wav", sec: 1, render: (d) => <CircleFlow dur={d} /> },
  { audio: "s17.wav", sec: 1, render: (d) => <CompoundChain dur={d} /> },
  { audio: "s18.wav", sec: 1, render: (d) => <EdCards dur={d} kicker="LOS CAMINOS DE INGRESO" title="Se monetiza en el camino" cards={[{ tag: "Afiliados", text: "Recomendar productos de tu nicho en los que confiás", c: CY }, { tag: "Anunciantes", text: "Negocios locales y marcas de tu comunidad", c: VI }, { tag: "Producto o servicio", text: "Lo que vos le ofrecés a tu audiencia", c: GO }]} layout="stack" /> },
  { audio: "s19.wav", sec: 1, render: (d) => <Pyramid dur={d} /> },
  { audio: "s20.wav", sec: 1, render: (d) => <EdStatement dur={d} kicker="EL ORDEN IMPORTA" lines={[{ t: "Primero el activo," }, { t: "después el ingreso.", a: true }]} sub="Y hoy lo hacés vos solo, con un equipo de IA que hace el trabajo pesado. Vos ponés el criterio." art="rocket" variant="behind" size={122} /> },
  { audio: "s21.wav", sec: 1, render: (d) => <EdList dur={d} kicker="RECAPITULANDO" title="Los cimientos" items={["Es un activo, no un producto", "Vive en una audiencia propia", "Su valor real es la confianza", "Se construye sobre un nicho", "Es una máquina con efecto compuesto", "Se monetiza por capas"]} /> },
  { audio: "s22.wav", sec: 1, render: (d) => <EdTask dur={d} kicker="TU TAREA" big={"Escribí tu frase."} plate={["Un medio de confianza sobre", "[tu tema]", "para", "[tu comunidad]"]} ex="Por ejemplo: un medio de confianza sobre tecnología para mi ciudad. Esa frase es la brújula de cada decisión que viene." /> },
  { audio: "s23.wav", sec: 1, render: (d) => <ProgressMap dur={d} kicker="Tu recorrido" stops={ROADMAP} current={1} next={2} /> },
];

const SCENES_D = SCENES.map((s, i) => ({ ...s, sec: (D as number[])[i] }));
export const TOTAL_FRAMES_F1 = totalFrames(SCENES_D);
export const ClaseFundamentos1: React.FC = () => <ClaseVideo scenes={SCENES_D} narration="f11.mp3" caps={C as any} />;
