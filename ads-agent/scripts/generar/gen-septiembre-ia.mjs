/**
 * gen-septiembre-ia.mjs — Orgánico FB septiembre 04→30: "IA aplicada al periodista de a pie"
 *
 * Continúa el arco del muro (agosto), que cerró el 31/08 en "qué mira un negocio
 * antes de pagarte". Mismo público, misma voz neutra, tema nuevo.
 *
 * EL TEXTO NO VIVE ACÁ. Los 27 pies de foto y las 27 stories están en
 * contenido/carousels/ia-sept/CONTENIDO.mjs, que es lo que Jose revisó y aprobó.
 * Este archivo sólo tiene las PLACAS de los carruseles y arma los archivos.
 * Un solo dueño por dato: si un pie de foto cambia, se cambia allá y nada más.
 *
 * REGLAS (verificadas por el chequeo de abajo, que corre antes de escribir nada):
 *  - Español NEUTRO · sin enlaces en el texto · sin cifras de audiencia
 *  - El precio ($27) sólo en los viernes de venta, con remisión a la biografía
 *  - Se nombra el problema; el método de las 4 piezas (M2.2), los roles (M2.4),
 *    la biblioteca (M2.5) y el circuito de verificación (M3) quedan del lado que se cobra
 *  - Herramientas: Claude, ChatGPT, Gemini. Nunca el stack de Jose.
 *
 * ⚠️ LOS 3 JUEVES (10, 17, 24) NO SE ESCRIBEN. Son prueba social y no hay hecho
 * verificado para llenarlos. El generador los saltea y schedule-septiembre.mjs
 * no los programa: quedan tres huecos a propósito, para escribir en la semana.
 *
 * Uso:
 *   node scripts/generar/gen-septiembre-ia.mjs
 *   node scripts/exportar/export-slides-auto.mjs contenido/carousels/ia-s0   (y s1, s2, s3, s4)
 *   node scripts/exportar/export-stories.mjs contenido/carousels/muro-stories
 *   node --env-file=.env.local scripts/programar/schedule-septiembre.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// Anclado al archivo, no al cwd: así corre desde donde sea. La forma exacta
// (join(dirname(fileURLToPath(import.meta.url)), '..', '..')) es la que sabe leer
// herramientas/verificar-repo.mjs — escrito de otra manera, da anclajes rotos.
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const { DIAS } = await import(pathToFileURL(join(RAIZ, 'contenido/carousels/ia-sept/CONTENIDO.mjs')).href)

// ═══════════════════ CHEQUEO PREVIO — si falla, no se escribe nada ═══════════
// El voseo se distingue por la TILDE. Ojo con \b: en JS es ASCII, así que después
// de una vocal acentuada NO hay borde de palabra y el patrón no cierra nunca —
// un detector escrito con \b da verde con el voseo delante. Van lookarounds Unicode.
const VOSEO = /(?<![\p{L}])(vos|sos|tenés|podés|querés|sabés|hacés|venís|decís|mirá|fijate|acordate|pensá|probá|contame|decime|agarrá|dejá|andá|poné|buscá|elegí)(?![\p{L}])/giu
const STACK = /\b(Brevo|Hotmart|Vercel|Supabase|GA4|Leadr|Make\.com)\b/i

const fallos = []
for (const d of DIAS) {
  const F = (m) => fallos.push(`${d.fecha} ${d.dia} — ${m}`)
  if (d.NECESITA_DATO) continue
  const todo = `${d.caption} ${d.story.hook} ${d.story.sub}`
  const v = todo.match(VOSEO)
  if (v) F(`voseo: ${[...new Set(v)].join(', ')}`)
  if (STACK.test(d.caption)) F('nombra el stack de Jose')
  if (/https?:\/\/|www\.|\.com\b/i.test(d.caption)) F('lleva un enlace en el texto')
  const cierre = d.caption.trim().split('\n').pop()
  if (!cierre.includes('👇')) F('no cierra con 👇')
  else if (!/[¿?]/.test(cierre) && !/\b(dime|cuéntame|cuéntamelo)\b/i.test(cierre)) F('cierra sin pregunta ni pedido')
  if (/\b\d+\s*(seguidores|lectores|suscriptores)\b/i.test(d.caption)) F('cifra de audiencia')
  const precio = /27 dólares/.test(d.caption)
  if (precio !== (d.temp === '🔥')) F(precio ? 'precio fuera de un viernes de venta' : 'viernes de venta sin precio')
  if (d.temp === '🔥' && !/biografía/.test(d.caption)) F('venta sin remisión a la biografía')
}
for (let i = 1; i < DIAS.length; i++) {
  if (DIAS[i].temp === '🔥' && DIAS[i - 1].temp === '🔥') fallos.push(`${DIAS[i].fecha} — dos ventas seguidas`)
}
if (fallos.length) {
  console.error('\n🔴 El contenido no pasa las reglas. No se escribió nada:\n')
  fallos.forEach(f => console.error('   ' + f))
  process.exit(1)
}
console.log(`✅ Chequeo: ${DIAS.filter(d => !d.NECESITA_DATO).length} posteos pasan las 8 reglas`)

// ═══════════════════ CHROME DE LAS PLACAS (idéntico al kit aprobado) ═════════
const HEAD = (title) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
.slide { width:1080px; height:1080px; background:#07070f; display:none; flex-direction:column; justify-content:space-between; padding:72px 80px 60px; position:relative; overflow:hidden; }
.slide.active { display:flex; }
.slide::before { content:''; position:absolute; top:-300px; left:-200px; width:900px; height:900px; background:radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 65%); pointer-events:none; }
.slide::after { content:''; position:absolute; left:0; top:72px; bottom:60px; width:5px; background:linear-gradient(180deg,#6366f1,#22d3ee); border-radius:0 3px 3px 0; }
.slide.cover { background:#05050c; padding:64px 74px 56px; }
.slide.cover::before { top:-420px; left:-300px; width:1250px; height:1250px; background:radial-gradient(circle, rgba(99,102,241,.42) 0%, rgba(99,102,241,.10) 45%, transparent 70%); }
.slide.cover .glow2 { content:''; position:absolute; bottom:-380px; right:-280px; width:1000px; height:1000px; background:radial-gradient(circle, rgba(34,211,238,.24) 0%, transparent 68%); pointer-events:none; }
.slide.cover h1 { font-size:104px; line-height:.99; letter-spacing:-.05em; margin-bottom:34px; }
.slide.cover p.lead { font-size:37px; color:#94a3b8; }
.slide.cover .label { font-size:14px; }
.hl {
  display:inline-block;
  background:linear-gradient(135deg,#6366f1,#22d3ee);
  color:#05050c; -webkit-text-fill-color:#05050c;
  padding:0 20px 12px; margin:6px 0 -6px;
  border-radius:16px;
  box-decoration-break:clone; -webkit-box-decoration-break:clone;
}
.top { display:flex; justify-content:space-between; align-items:flex-start; }
.brand { font-size:13px; color:rgba(255,255,255,.22); letter-spacing:.1em; text-transform:uppercase; font-weight:700; }
.label { font-size:12px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; }
.label.indigo { color:#6366f1; } .label.amber { color:#f59e0b; } .label.green { color:#22c55e; } .label.red { color:#ef4444; }
.main { flex:1; display:flex; flex-direction:column; justify-content:center; padding:28px 0 0; }
.bottom { display:flex; justify-content:space-between; align-items:center; }
.dots { display:flex; gap:8px; }
.dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.15); }
.dot.active { background:#6366f1; width:24px; border-radius:4px; }
.swipe-hint { font-size:14px; color:rgba(255,255,255,.25); }
h1 { font-size:84px; font-weight:900; color:#f1f5f9; line-height:1.0; letter-spacing:-.04em; margin-bottom:28px; }
h2 { font-size:56px; font-weight:900; color:#f1f5f9; line-height:1.05; letter-spacing:-.03em; margin-bottom:24px; }
.accent { background:linear-gradient(135deg,#6366f1,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
p { font-size:29px; color:#cbd5e1; line-height:1.6; max-width:900px; margin-bottom:18px; }
p strong { color:#f1f5f9; }
p.lead { font-size:35px; color:#cbd5e1; line-height:1.5; }
.divider { width:56px; height:4px; background:linear-gradient(90deg,#6366f1,#22d3ee); border-radius:2px; margin-bottom:28px; }
.prompt-box { background:rgba(255,255,255,.04); border:1px solid rgba(99,102,241,.3); border-radius:20px; padding:32px 36px; margin-top:8px; }
.prompt-box .ptitle { font-size:14px; color:#22d3ee; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-bottom:14px; }
.prompt-box p { font-size:23px; color:#cbd5e1; line-height:1.55; margin-bottom:0; }
.numlist { display:flex; flex-direction:column; gap:18px; margin-top:8px; }
.numlist .item { display:flex; gap:18px; align-items:flex-start; }
.numlist .n { font-size:30px; font-weight:900; color:#22d3ee; min-width:56px; }
.numlist .t { font-size:27px; color:#cbd5e1; line-height:1.5; padding-top:2px; }
.numlist .t strong { color:#f1f5f9; }
.vs { display:flex; flex-direction:column; gap:22px; margin-top:8px; }
.vs .row { border-radius:18px; padding:26px 30px; border:1px solid; }
.vs .row.bad  { background:rgba(239,68,68,.07);  border-color:rgba(239,68,68,.28); }
.vs .row.good { background:rgba(34,197,94,.07);  border-color:rgba(34,197,94,.28); }
.vs .tag { font-size:13px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px; }
.vs .row.bad .tag  { color:#f87171; }
.vs .row.good .tag { color:#4ade80; }
.vs .txt { font-size:27px; color:#e2e8f0; line-height:1.45; }
</style>
</head>
<body>`

const FOOT = `
<script>
(function(){const s=document.querySelectorAll('.slide');let c=0;function go(d){s[c].classList.remove('active');c=Math.max(0,Math.min(s.length-1,c+d));s[c].classList.add('active')}document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)})})()
</script>
</body>
</html>`

function renderSlide(sl, i, total) {
  const dots = Array.from({ length: total }, (_, j) => `<div class="dot${j === i ? ' active' : ''}"></div>`).join('')
  const hint = i === 0 ? 'Desliza →' : i === total - 1 ? 'Fin del carrusel' : 'Sigue deslizando →'
  const isCover = i === 0
  return `
<div class="slide${isCover ? ' active cover' : ''}">
  ${isCover ? '<div class="glow2"></div>' : ''}
  <div class="top">
    <span class="label ${sl.color || 'indigo'}">${sl.label}</span>
    <span class="brand">@periodistasdelfuturo</span>
  </div>
  <div class="main">${sl.body}</div>
  <div class="bottom">
    <div class="dots">${dots}</div>
    <div class="swipe-hint">${hint}</div>
  </div>
</div>`
}
const buildHTML = (title, slides) => HEAD(title) + slides.map((s, i) => renderSlide(s, i, slides.length)).join('\n') + FOOT
const numlist = (items) => `<div class="numlist">${items.map(it => `<div class="item"><div class="n">${it.n}</div><div class="t">${it.t}</div></div>`).join('')}</div>`
const vs = (badTag, bad, goodTag, good) => `<div class="vs">
  <div class="row bad"><div class="tag">${badTag}</div><div class="txt">${bad}</div></div>
  <div class="row good"><div class="tag">${goodTag}</div><div class="txt">${good}</div></div>
</div>`
const box = (t, p) => `<div class="prompt-box"><div class="ptitle">${t}</div><p>${p}</p></div>`

// Los 5 pasos aparecen en dos carruseles de venta. Un solo dueño del dato.
const CINCO_PASOS = [
  { n: '1', t: '<strong>Ponerle nombre y foco</strong> a lo que ya cubres' },
  { n: '2', t: '<strong>Abrir tu medio</strong>, el único lugar donde esto se sostiene' },
  { n: '3', t: '<strong>Mudar a los que ya te leen</strong> sin perderlos' },
  { n: '4', t: '<strong>Sostener la publicación diaria</strong> sin que te coma el día' },
  { n: '5', t: '<strong>Cobrar:</strong> tu primer anunciante' },
]

// ═══════════════════════ LAS PLACAS ══════════════════════════════════════════
const CAROUSELS = [

// ── 04 Vie · apertura ──────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s0', file: 'viernes-predice.html', title: 'Predice, no sabe — Viernes 04/09',
  slides: [
    { label: 'El malentendido', body: `<h1>La IA no sabe<br>nada de tu ciudad.<br>Y contestó<br><span class="hl">igual</span></h1><p class="lead">No sabe. Predice. Y no es lo mismo.</p>` },
    { label: 'Qué hace por dentro', body: `<h2>Calcula la<br>palabra que<br>sigue</h2><div class="divider"></div><p>Una por una, arma la continuación más probable de lo que le diste.</p><p><strong>No consulta, no recuerda tu barrio, no tiene idea de si el intendente se llama así.</strong></p>` },
    { label: 'Por eso, lo genérico', body: `<h2>Con tres<br>palabras te da<br>el promedio</h2><div class="divider"></div><p>Si le das cinco palabras sueltas, lo más probable es el promedio de todo lo que se escribió del tema.</p><p><strong>Y el promedio de todo, por definición, no se parece a nada.</strong></p>` },
    { label: 'Por eso, inventa', color: 'amber', body: `<h2>Y el dato<br>que no tiene<br>lo completa</h2><div class="divider"></div><p>Un nombre, un cargo, una cifra. Lo dice con la misma seguridad con la que te dice la capital de Francia.</p><p><strong>No te miente: para mentir habría que saber.</strong></p>` },
    { label: 'La buena noticia', color: 'green', body: `<h2>Por eso<br>se puede<br><span class="accent">dirigir</span></h2><div class="divider"></div><p>Todo lo que le pongas adelante cambia lo que puede predecir.</p><p><strong>Ahí está tu trabajo, y es un trabajo de criterio, no de botones.</strong></p>` },
    { label: 'Cerrando', body: `<h2>¿Cuál fue<br>la primera cosa<br><span class="accent">que le pediste?</span></h2><div class="divider"></div><p class="lead">La primera, no la mejor. Dime cuál fue. 👇</p>` },
  ] },

// ── 06 Dom · tendencia ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s0', file: 'domingo-tres-cosas.html', title: 'Tres cosas gratis — Domingo 06/09',
  slides: [
    { label: 'Lo que cambió', body: `<h1>Tres cosas<br>que hoy<br><span class="hl">salen gratis</span></h1><p class="lead">Y ninguna es escribir tu nota. Son las tres que te comen la tarde.</p>` },
    { label: 'Una', body: `<h2>Transcribir<br>la entrevista</h2><div class="divider"></div><p>Le das el audio y te devuelve el texto. Dos horas de auriculares se vuelven minutos.</p>${box('El encargo', 'Transcribe este audio. Marca con [?] todo nombre propio que no estés seguro de haber escrito bien.')}` },
    { label: 'Dos', body: `<h2>Leer el<br>documento<br>largo</h2><div class="divider"></div><p>El presupuesto, la licitación, el fallo de cuarenta páginas.</p>${box('El encargo', 'Este es el presupuesto de este año. Dime qué partidas cambiaron respecto del anterior y por dónde conviene empezar a mirar. No saques conclusiones.')}` },
    { label: 'Tres', body: `<h2>Pasarla<br>de un formato<br>a otro</h2><div class="divider"></div><p>La misma información como texto de muro, como guion de audio, como pie de foto corto.</p>${box('El encargo', 'Pasa esta nota a un texto de muro de seis líneas, sin perder ningún dato y sin agregar ninguno.')}` },
    { label: 'Lo que tienen en común', color: 'green', body: `<h2>Ninguna<br>decide nada</h2><div class="divider"></div><p><strong>Tú decides. Ellas mueven.</strong></p><p>Por eso las tres se pueden delegar sin que se te caiga nada encima: no hay criterio adentro de ninguna.</p>` },
    { label: 'Cerrando', body: `<h2>¿Cuál te haría<br>ganar más tiempo<br><span class="accent">esta semana?</span></h2><div class="divider"></div><p class="lead">Una de las tres. Dime el número. 👇</p>` },
  ] },

// ── 07 Lun · educativo ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s1', file: 'lunes-tres-palabras.html', title: 'Tres palabras — Lunes 07/09',
  slides: [
    { label: 'El síntoma', body: `<h1>Te devolvió algo<br>que sirve para<br><span class="hl">cualquier ciudad</span></h1><p class="lead">Incluida una que no existe.</p>` },
    { label: 'No falló', body: `<h2>Hizo justo<br>lo que le<br>pediste</h2><div class="divider"></div><p>"Escribe una nota sobre el aumento del agua" son cinco palabras.</p><p><strong>Con cinco palabras, le pediste que adivine el resto.</strong></p>` },
    { label: 'La cuenta', body: `<h2>El promedio<br>de todo no se<br>parece a nada</h2><div class="divider"></div><p>La continuación más probable de esas cinco palabras es el promedio de todo lo que se escribió alguna vez sobre aumentos del agua.</p><p><strong>Correcto, prolijo y de ningún lado.</strong></p>` },
    { label: 'Compáralo', body: `<h2>El pasante<br>del primer<br>día</h2><div class="divider"></div><p>Si le dices "escribe algo del agua", trae un texto tibio. No porque sea malo: no sabe dónde está parado ni para quién escribe.</p><p><strong>A esa persona le darías contexto sin pensarlo dos veces.</strong></p>` },
    { label: 'Y sin embargo', color: 'amber', body: `<h2>A la máquina<br>no se lo<br>damos</h2><div class="divider"></div><p>Le escribimos cinco palabras y le exigimos más que al pasante.</p><p><strong>El miércoles, la línea que lo arregla.</strong></p>` },
    { label: 'Cerrando', body: `<h2>¿Lo volviste<br>a intentar o<br><span class="accent">cerraste la pestaña?</span></h2><div class="divider"></div><p class="lead">Cuando te devolvió algo genérico. 👇</p>` },
  ] },

// ── 09 Mié · tip ───────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s1', file: 'miercoles-la-linea.html', title: 'La línea de adelante — Miércoles 09/09',
  slides: [
    { label: 'El arreglo', body: `<h1>Una línea<br>adelante.<br>Y cambia<br><span class="hl">todo</span></h1><p class="lead">Para quién es y dónde se publica. Antes de pedir nada.</p>` },
    { label: 'Cópiala', body: `<h2>La línea,<br>armada</h2><div class="divider"></div>${box('Pégala antes de tu pedido', 'Esto es para vecinos de una ciudad chica. Lo van a leer en el celular, en el muro de Facebook. A la mayoría le importa una sola cosa: cuánto le va a llegar y desde cuándo.')}` },
    { label: 'Qué cambia', body: `<h2>La misma<br>noticia, otro<br>texto</h2><div class="divider"></div>${vs('Sin la línea', 'Arranca por la resolución, el número de expediente y el organismo que la firmó.', 'Con la línea', 'Arranca por lo que le va a pasar al que lo lee, y el expediente queda donde tiene que quedar.')}` },
    { label: 'El efecto de yapa', color: 'green', body: `<h2>Deja de usar<br>las palabras<br>que nadie usa</h2><div class="divider"></div><p>"Incremento tarifario" se convierte solo en "te va a llegar más cara".</p><p><strong>Y no porque le pidieras que escriba fácil: porque le dijiste a quién le habla.</strong></p>` },
    { label: 'Es una de cuatro', color: 'amber', body: `<h2>Y ya se<br>nota</h2><div class="divider"></div><p>Esta es una sola pieza del encargo. Hay tres más, y juntas son la diferencia entre pelearte con la herramienta y dirigirla.</p><p><strong>Pero esta la puedes probar hoy.</strong></p>` },
    { label: 'Cerrando', body: `<h2>Pruébala con<br>tu última nota<br><span class="accent">y cuéntame</span></h2><div class="divider"></div><p class="lead">Qué te devolvió distinto. 👇</p>` },
  ] },

// ── 11 Vie · VENTA ─────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s1', file: 'viernes-cinco-pasos.html', title: 'VENTA · Los 5 pasos — Viernes 11/09',
  slides: [
    { label: 'Viernes', body: `<h1>Te devuelve<br>la tarde.<br>Qué haces con ella<br>es <span class="hl">otra decisión</span></h1><p class="lead">Y es la que decide si esto te cambia algo.</p>` },
    { label: 'La trampa', body: `<h2>Dos horas<br>ganadas para<br>publicar gratis</h2><div class="divider"></div><p>Se pueden ganar dos horas y usarlas en más notas gratis, mejor hechas y más rápido.</p><p><strong>Sigue siendo gratis.</strong></p>` },
    { label: 'El camino', body: `<h2>Cinco pasos,<br>en este orden</h2><div class="divider"></div>${numlist(CINCO_PASOS)}` },
    { label: 'Dónde entra la IA', color: 'amber', body: `<h2>En el cuarto</h2><div class="divider"></div><p>Sostener la publicación diaria sin que te coma el día.</p><p><strong>Y por eso importa: el cuarto es donde la mayoría abandona.</strong></p>` },
    { label: 'Acompañado', color: 'green', body: `<h2>Los cinco,<br>uno por uno</h2><div class="divider"></div><p>Con tu equipo de IA armado paso a paso: el Sistema de Ingresos Diarios.</p><p><strong>Pago único de 27 dólares, acceso de por vida y garantía de 7 días.</strong></p><p>El enlace está en la biografía.</p>` },
    { label: 'Cerrando', body: `<h2>¿En cuál de<br>los cinco<br><span class="accent">estás hoy?</span></h2><div class="divider"></div><p class="lead">Dime el número. 👇</p>` },
  ] },

// ── 13 Dom · tendencia ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s1', file: 'domingo-se-nota.html', title: 'Se nota — Domingo 13/09',
  slides: [
    { label: 'Se nota', body: `<h1>Cuando lo escribió<br>una IA y nadie<br>lo tocó,<br><span class="hl">se nota</span></h1><p class="lead">Y no por lo que la gente cree. No está mal escrito: está mejor escrito que el promedio.</p>` },
    { label: 'Marca uno', body: `<h2>Todo pesa<br>lo mismo</h2><div class="divider"></div><p>Le da el mismo espacio al dato que le cambia el mes al lector y al párrafo de contexto que nadie pidió.</p><p><strong>Un periodista jerarquiza sin pensarlo. La máquina reparte parejo.</strong></p>` },
    { label: 'Marca dos', body: `<h2>Las frases<br>van de<br>a pares</h2><div class="divider"></div><p>"No solo esto, sino también aquello." "Tanto por un lado como por el otro."</p><p><strong>Sale simétrica hasta cuando la realidad no lo es.</strong></p>` },
    { label: 'Marca tres', color: 'amber', body: `<h2>No hay<br>nadie<br>adentro</h2><div class="divider"></div><p>Ni un nombre, ni una calle, ni una hora. Habla de "los vecinos" y de "la comunidad".</p><p><strong>Que es como hablan los comunicados.</strong></p>` },
    { label: 'El arreglo', body: `<h2>Cortar<br>y meter a<br>alguien</h2><div class="divider"></div>${vs('Como sale', 'La medida generó preocupación entre los vecinos, quienes manifestaron tanto su malestar como su expectativa ante la situación.', 'Arreglado', 'Rosa Medina atiende el kiosco de Belgrano y 9 de Julio. Con la nueva tarifa paga cuatro mil pesos más por mes.')}` },
    { label: 'Cerrando', body: `<h2>¿Qué es lo<br>primero que<br><span class="accent">te hace sospechar?</span></h2><div class="divider"></div><p class="lead">Cuando lees algo y crees que lo escribió una máquina. 👇</p>` },
  ] },

// ── 14 Lun · educativo ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s2', file: 'lunes-no-se-delega.html', title: 'No se delega — Lunes 14/09',
  slides: [
    { label: 'El límite', body: `<h1>Hay una parte<br>que si se la das,<br>se te cae<br><span class="hl">encima</span></h1><p class="lead">No es la redacción. Es la respuesta.</p>` },
    { label: 'Qué es firmar', body: `<h2>Publicar con<br>tu nombre dice<br>dos cosas</h2><div class="divider"></div><p>La noticia. Y que si eso está mal, respondes tú.</p><p><strong>Es lo único que separa a un periodista de una cuenta que reenvía cosas.</strong></p>` },
    { label: 'El reparto', body: `<h2>Quién hace<br>qué</h2><div class="divider"></div>${vs('Ella mueve material', 'Juntar, ordenar, resumir, proponer, reescribir, traducir.', 'Tú respondes', 'Qué se publica. Confirmar cada dato que lleva tu firma. A quién llamar. Hacerte cargo de lo que salió.')}` },
    { label: 'Por qué importa', color: 'amber', body: `<h2>A ella no<br>le pasa<br>nada</h2><div class="divider"></div><p>Si te inventa un cargo y lo publicas, la máquina no pierde nada. No tiene nada que perder.</p><p><strong>Le pasa a tu nombre, en tu ciudad, donde la gente te cruza en la calle.</strong></p>` },
    { label: 'La cuenta', color: 'red', body: `<h2>El día que<br>se mezclan<br>los dos lados</h2><div class="divider"></div><p>Lo que se pierde no es una nota.</p><p><strong>Es la razón por la que alguien te lee a ti y no a cualquiera.</strong></p>` },
    { label: 'Cerrando', body: `<h2>¿Estuviste a punto<br>de publicar un dato<br><span class="accent">y lo frenaste?</span></h2><div class="divider"></div><p class="lead">Uno que te había dado una IA. 👇</p>` },
  ] },

// ── 16 Mié · tip ───────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s2', file: 'miercoles-verificar-imagen.html', title: 'Verificar imagen — Miércoles 16/09',
  slides: [
    { label: 'Verificar', body: `<h1>Te llegó la foto<br>por el grupo.<br>Antes de publicarla,<br><span class="hl">mira esto</span></h1><p class="lead">Cuatro señales y una búsqueda. Sin instalar nada.</p>` },
    { label: 'Señal uno', body: `<h2>Las manos<br>y los dientes</h2><div class="divider"></div><p>Es donde más se equivoca todavía cualquier generador: dedos de más, dedos fundidos, una mano que agarra algo que no está.</p><p><strong>Amplía y cuenta.</strong></p>` },
    { label: 'Señal dos', body: `<h2>Los carteles<br>y los textos</h2><div class="divider"></div><p>Un nombre de calle, una patente, el letrero de un negocio.</p><p><strong>Las letras salen casi bien y por eso engañan: parecen palabras y no dicen nada. Si un cartel no se puede leer, sospecha.</strong></p>` },
    { label: 'Señal tres', body: `<h2>Los bordes<br>de las personas</h2><div class="divider"></div><p>Donde el pelo se junta con el fondo queda una línea demasiado limpia, o al revés, una mancha borrosa que no coincide con el resto.</p>` },
    { label: 'Señal cuatro', body: `<h2>La luz y<br>las sombras</h2><div class="divider"></div><p>Sombras de personas apuntando para lados distintos. Un reflejo en una ventana que no corresponde con nada de lo que se ve.</p>` },
    { label: 'La que más resuelve', color: 'green', body: `<h2>Busca el<br><span class="accent">origen</span></h2><div class="divider"></div><p>Sube la imagen a un buscador de imágenes y fíjate si ya apareció antes, en otro país y en otro año.</p><p><strong>La mitad de las fotos falsas no son generadas: son viejas y verdaderas, sacadas de contexto.</strong></p>` },
    { label: 'Cerrando', body: `<h2>¿Te llegó alguna<br>que te hizo<br><span class="accent">dudar?</span></h2><div class="divider"></div><p class="lead">Esta semana, al teléfono. 👇</p>` },
  ] },

// ── 18 Vie · VENTA ─────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s2', file: 'viernes-verificar-vende.html', title: 'VENTA · Verificar — Viernes 18/09',
  slides: [
    { label: 'Viernes', body: `<h1>Verificar<br>no es un freno.<br>Es lo que te vuelve<br><span class="hl">el que vale la pena</span></h1><p class="lead">Míralo desde el otro lado del teléfono.</p>` },
    { label: 'Lo que tu lector ya tiene', body: `<h2>Diez lugares<br>para enterarse<br>rápido</h2><div class="divider"></div><p>Lo que no tiene es un lugar donde enterarse bien.</p><p><strong>Y ya aprendió, a los golpes, que la mitad de lo que le llega puede ser falso, viejo o sacado de contexto.</strong></p>` },
    { label: 'Lo que cambia', body: `<h2>Dejas de<br>competir por<br>ser el primero</h2><div class="divider"></div><p>Pasas a ser el que confirma.</p><p><strong>Y esa posición es la única que no se puede automatizar.</strong></p>` },
    { label: 'Y por eso se cobra', color: 'amber', body: `<h2>Un negocio no<br>le paga al<br>más rápido</h2><div class="divider"></div><p>Le paga al que no lo va a dejar mal parado.</p>` },
    { label: 'El módulo', color: 'green', body: `<h2>No es una<br>lista de<br>herramientas</h2><div class="divider"></div><p>Es cómo se construye la credibilidad como capital, cómo se chequea un dato cruzando fuentes, y cómo se muestra ese trabajo para que sume.</p><p><strong>Dentro del Sistema de Ingresos Diarios: 27 dólares, de por vida, garantía de 7 días.</strong></p><p>El enlace está en la biografía.</p>` },
    { label: 'Cerrando', body: `<h2>¿Cuántas veces<br>te pidieron que<br><span class="accent">confirmes algo?</span></h2><div class="divider"></div><p class="lead">Esta semana. 👇</p>` },
  ] },

// ── 20 Dom · tendencia ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s2', file: 'domingo-mas-falsos.html', title: 'Más falsos — Domingo 20/09',
  slides: [
    { label: 'Lo que viene', body: `<h1>Cuanto más fácil<br>es fabricar un falso,<br>más vale<br><span class="hl">el que chequea</span></h1><p class="lead">Es la misma ola, mirada del otro lado.</p>` },
    { label: 'Antes', body: `<h2>Hacía falta<br>saber para<br>falsificar</h2><div class="divider"></div><p>Hoy no hace falta nada. Y el que la reenvía al grupo del barrio ni siquiera está mintiendo.</p><p><strong>Él tampoco sabe.</strong></p>` },
    { label: 'La lectura fácil', color: 'red', body: `<h2>Se viene<br>el caos</h2><div class="divider"></div><p>Y sí. En parte se viene.</p><p><strong>Es la lectura que hace todo el mundo, y es la que deja a nuestro oficio en el lugar de la víctima.</strong></p>` },
    { label: 'La otra lectura', color: 'green', body: `<h2>Lo escaso<br>ya no es la<br>información</h2><div class="divider"></div><p>Cuando cualquiera puede publicar cualquier cosa, la información sobra.</p><p><strong>Lo escaso pasa a ser alguien que responde por lo que dice.</strong></p>` },
    { label: 'En tu ciudad', body: `<h2>Nadie busca<br>más publicaciones.<br>Busca a<br><span class="accent">cuál creerle</span></h2><div class="divider"></div><p>Y esa pregunta se contesta con un nombre, no con una cuenta.</p><p><strong>Siempre que ese trabajo se vea. Uno que nadie sabe que existe no cuenta para nadie.</strong></p>` },
    { label: 'Cerrando', body: `<h2>¿A quién<br><span class="accent">le crees tú?</span></h2><div class="divider"></div><p class="lead">Cuando pasa algo importante en tu ciudad. 👇</p>` },
  ] },

// ── 21 Lun · educativo ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s3', file: 'lunes-cuatro-senales.html', title: 'Cuatro señales — Lunes 21/09',
  slides: [
    { label: 'La confianza', body: `<h1>Nadie confía en ti<br>porque seas confiable.<br>Confía en<br><span class="hl">lo que ve</span></h1><p class="lead">Y lo que ve son cuatro cosas, siempre las mismas.</p>` },
    { label: 'Una', body: `<h2>Que apareces<br>siempre</h2><div class="divider"></div><p>La constancia dice más que cualquier credencial. El que publica todos los días, aunque sea poco, se lee como alguien que está.</p><p><strong>El que aparece cuando hay algo grande y desaparece un mes se lee como alguien que pasaba.</strong></p>` },
    { label: 'Dos', body: `<h2>Que se entiende<br>de qué eres</h2><div class="divider"></div><p>Si en tu muro hay tránsito, clima, política nacional y una receta, el lector no sabe para qué guardarte.</p><p><strong>El que cubre una cosa se vuelve el referente de esa cosa. Sobre todo si es chica.</strong></p>` },
    { label: 'Tres', color: 'green', body: `<h2>Que corriges<br>a la vista</h2><div class="divider"></div><p>Publicar la corrección con la misma cara con que publicaste el error es lo que más credibilidad construye. Y lo que menos se hace.</p><p><strong>Borrar y hacer como que no pasó es lo que más la destruye.</strong></p>` },
    { label: 'Cuatro', body: `<h2>Que se sabe<br>de dónde<br>lo sacaste</h2><div class="divider"></div><p>No hace falta una bibliografía. Alcanza con decir quién te lo dijo o dónde lo leíste.</p>` },
    { label: 'Lo que tienen en común', color: 'amber', body: `<h2>Ninguna pide<br>que seas mejor<br>periodista</h2><div class="divider"></div><p>Piden que se vea el que ya eres.</p>` },
    { label: 'Cerrando', body: `<h2>¿Cuál es la que<br>hoy no se ve<br><span class="accent">en tu muro?</span></h2><div class="divider"></div><p class="lead">De las cuatro. 👇</p>` },
  ] },

// ── 23 Mié · tip ───────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s3', file: 'miercoles-pie-de-nota.html', title: 'El pie de nota — Miércoles 23/09',
  slides: [
    { label: 'Transparencia', body: `<h1>Contar cómo<br>lo verificaste<br>no debilita la nota.<br><span class="hl">La blinda</span></h1><p class="lead">Dos líneas al pie alcanzan.</p>` },
    { label: 'Cópialo', body: `<h2>El pie,<br>armado</h2><div class="divider"></div>${box('Al final de la nota', 'Cómo lo confirmamos: la tarifa sale de la resolución publicada el martes. El testimonio es de una entrevista propia. El aumento barrio por barrio todavía no pudimos confirmarlo.')}` },
    { label: 'Lo que más pesa', color: 'green', body: `<h2>Lo que<br><span class="accent">no</span> pudiste<br>confirmar</h2><div class="divider"></div><p>Es la parte que nadie escribe y la que más suma.</p><p><strong>El que dice que confirmó todo, siempre, es el que menos parece que lo hizo.</strong></p>` },
    { label: 'La línea', body: `<h2>Se aclara el<br>origen, no la<br>herramienta</h2><div class="divider"></div><p>Que hayas usado una IA para transcribir no le importa a nadie, igual que no aclaras con qué grabador grabaste.</p><p><strong>Lo que sí se dice es de dónde salió cada dato y quién lo confirmó. Y ahí la respuesta siempre es una persona con nombre.</strong></p>` },
    { label: 'La diferencia', body: `<h2>Se ve<br>enseguida</h2><div class="divider"></div>${vs('No dice nada', 'Nota elaborada con asistencia de inteligencia artificial.', 'Dice todo', 'Los datos de tarifa salen de la resolución del martes. El testimonio es propio. El corte por barrio no está confirmado.')}` },
    { label: 'Cerrando', body: `<h2>¿Publicaste alguna vez<br>una corrección<br><span class="accent">a la vista?</span></h2><div class="divider"></div><p class="lead">Con la misma cara con la que publicaste el error. 👇</p>` },
  ] },

// ── 25 Vie · VENTA ─────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s3', file: 'viernes-el-que-responde.html', title: 'VENTA · El que responde — Viernes 25/09',
  slides: [
    { label: 'Viernes', body: `<h1>La máquina<br>no responde<br>por nada.<br><span class="hl">Ahí está tu lugar</span></h1><p class="lead">Y no es un consuelo: es el negocio.</p>` },
    { label: 'El mes en una frase', body: `<h2>No te va a dar<br>ingresos.<br>Te da tiempo</h2><div class="divider"></div><p>Los ingresos salen de lo que hagas con ese tiempo.</p><p><strong>Y eso es un camino distinto, con pasos y con orden.</strong></p>` },
    { label: 'El camino', body: `<h2>Cinco pasos,<br>en este orden</h2><div class="divider"></div>${numlist(CINCO_PASOS)}` },
    { label: 'Dónde entra la IA', color: 'amber', body: `<h2>En el cuarto</h2><div class="divider"></div><p>Sostener la publicación diaria sin que te coma el día. Ahí se vuelve tu equipo y no un juguete.</p><p><strong>Y el cuarto es donde la mayoría abandona.</strong></p>` },
    { label: 'Acompañado', color: 'green', body: `<h2>Con el módulo<br>de IA y el de<br>verificación</h2><div class="divider"></div><p>Los cinco pasos son el Sistema de Ingresos Diarios.</p><p><strong>Pago único de 27 dólares, acceso de por vida y garantía de 7 días: lo miras una semana y si no es lo que esperabas, te devuelven todo.</strong></p><p>El enlace está en la biografía.</p>` },
    { label: 'Cerrando', body: `<h2>¿Qué le dirías<br><span class="accent">primero?</span></h2><div class="divider"></div><p class="lead">A un negocio de tu ciudad, sobre por qué le conviene a él. 👇</p>` },
  ] },

// ── 27 Dom · tendencia ─────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s3', file: 'domingo-tres-caminos.html', title: 'Tres caminos — Domingo 27/09',
  slides: [
    { label: 'Lo que viene', body: `<h1>No va a ser<br>el que más sepa<br>de IA.<br><span class="hl">Va a ser otro</span></h1><p class="lead">El que la usa sin dejar de ser el que responde. Y ya se ve quién va para cada lado.</p>` },
    { label: 'Camino uno', color: 'red', body: `<h2>El que la<br>rechaza de<br>plano</h2><div class="divider"></div><p>Va a seguir haciendo bien su trabajo, y le va a llevar el triple de tiempo que a los demás.</p><p><strong>En un oficio donde el tiempo es lo único que no sobra, eso lo va dejando afuera sin que nadie lo eche.</strong></p>` },
    { label: 'Camino dos', color: 'amber', body: `<h2>El que la<br>adoptó<br>entera</h2><div class="divider"></div><p>Publica más que nadie y más rápido que nadie. Y en algún momento publica algo que no chequeó.</p><p><strong>Con eso alcanza: el capital que tardó años se le cae en una tarde.</strong></p>` },
    { label: 'Camino tres', color: 'green', body: `<h2>El que<br>menos ruido<br>hace</h2><div class="divider"></div><p>La usa para todo lo que es mover material y no le entrega ni una decisión. Chequea, corrige a la vista, dice de dónde sacó las cosas.</p><p><strong>Publica menos y le creen más.</strong></p>` },
    { label: 'Cuál cobra', body: `<h2>El tercero.<br>Y no por ser<br>el más moderno</h2><div class="divider"></div><p>Porque cuando todo se llene de textos correctos y vacíos, va a ser el único al que se le note que hay <strong>una persona atrás</strong>.</p>` },
    { label: 'Cerrando', body: `<h2>¿Cuál se parece<br>más a lo que<br><span class="accent">hiciste este mes?</span></h2><div class="divider"></div><p class="lead">De los tres. 👇</p>` },
  ] },

// ── 28 Lun · cierre ────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s4', file: 'lunes-el-mes-en-una-hoja.html', title: 'El mes en una hoja — Lunes 28/09',
  slides: [
    { label: 'Cierre de mes', body: `<h1>Todo el mes<br>en una hoja</h1><p class="lead">Cinco ideas, en el orden en que se usan.</p>` },
    { label: 'Uno', body: `<h2>No sabe:<br><span class="accent">predice</span></h2><div class="divider"></div><p>Calcula la continuación más probable de lo que le diste. Por eso lo que le pones adelante decide lo que te devuelve.</p><p><strong>Y por eso inventa datos con la misma seguridad con la que dice verdades.</strong></p>` },
    { label: 'Dos', body: `<h2>Con tres palabras,<br>el promedio<br>de todo</h2><div class="divider"></div><p>Y el promedio de todo no se parece a nada.</p>` },
    { label: 'Tres', body: `<h2>Una línea<br>adelante<br>lo cambia</h2><div class="divider"></div><p>Para quién es y dónde se publica.</p><p><strong>Es una sola pieza del encargo y ya se nota.</strong></p>` },
    { label: 'Cuatro', color: 'amber', body: `<h2>Hay una parte<br>que no se<br>delega</h2><div class="divider"></div><p>Ella mueve material. Tú decides qué se publica y respondes por lo que sale.</p><p><strong>El día que se mezclan, se pierde la razón por la que te leen a ti.</strong></p>` },
    { label: 'Cinco', color: 'green', body: `<h2>Cuanto más fácil<br>es el falso,<br>más vale el<br>que chequea</h2><div class="divider"></div><p>La ola que asusta es la que te sube el precio.</p>` },
    { label: 'Cerrando', body: `<h2>¿Cuál te resultó<br><span class="accent">más útil?</span></h2><div class="divider"></div><p class="lead">De las cinco. Dime el número. 👇</p>` },
  ] },

// ── 30 Mié · cierre ────────────────────────────────────────────────────────
{ folder: 'contenido/carousels/ia-s4', file: 'miercoles-diez-minutos.html', title: 'Diez minutos — Miércoles 30/09',
  slides: [
    { label: 'Fin de mes', body: `<h1>Diez minutos.<br>Una sola<br><span class="hl">tarea</span></h1><p class="lead">Si leíste todo el mes y no probaste nada, esto es para ti.</p>` },
    { label: 'La tarea', body: `<h2>Tres pasos,<br>hoy o mañana</h2><div class="divider"></div>${numlist([
      { n: '1', t: 'Abre <strong>Claude, ChatGPT o Gemini</strong>. Cualquiera, la gratuita.' },
      { n: '2', t: 'Agarra <strong>la última nota que publicaste</strong>. La última, no la mejor.' },
      { n: '3', t: 'Pega la línea de contexto y pide <strong>sólo la primera línea</strong>, tres versiones.' },
    ])}` },
    { label: 'Cópialo', body: `<h2>El texto<br>exacto</h2><div class="divider"></div>${box('Pega esto y abajo tu nota', 'Esto es para vecinos de mi ciudad, se lee en el celular, en el muro. Dame tres versiones de la primera línea. Sólo la primera línea, nada más.')}` },
    { label: 'Por qué la última', color: 'amber', body: `<h2>Y no<br>la mejor</h2><div class="divider"></div><p>La mejor ya te salió bien y no te va a enseñar nada.</p><p><strong>La última es la que hiciste apurado, que es donde de verdad se nota si esto sirve.</strong></p>` },
    { label: 'Y si sale mal', color: 'green', body: `<h2>También<br>sirve</h2><div class="divider"></div><p>Si te devuelve algo peor que lo tuyo, quiere decir que en esa nota tu primera línea ya estaba bien.</p><p><strong>Y ahora lo sabes.</strong></p>` },
    { label: 'Cerrando', body: `<h2>Cuéntame<br><span class="accent">cómo te fue</span></h2><div class="divider"></div><p class="lead">Y si te devolvió algo peor, cuéntamelo también. 👇</p>` },
  ] },
]

// ═══════════════════ MAPA fecha → carpeta/subcarpeta ═════════════════════════
const SEMANA_A_CARPETA = { apertura: 'ia-s0', s1: 'ia-s1', s2: 'ia-s2', s3: 'ia-s3', cierre: 'ia-s4' }
const DOW = { 'Lun': '1-LUNES', 'Mar': '2-MARTES', 'Mié': '3-MIERCOLES', 'Jue': '4-JUEVES', 'Vie': '5-VIERNES', 'Sáb': '6-SABADO', 'Dom': '7-DOMINGO' }

// ═══════════════════ ESCRITURA ═══════════════════════════════════════════════
let nCap = 0, nMolde = 0
for (const d of DIAS) {
  if (d.NECESITA_DATO) { nMolde++; continue }   // los 3 jueves no se escriben
  const dir = resolve(join(RAIZ, 'contenido/carousels', SEMANA_A_CARPETA[d.semana], 'para-subir', DOW[d.dia]))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'pie-de-foto.txt'), d.caption.trim() + '\n', 'utf-8')
  nCap++
}
console.log(`✅ ${nCap} pies de foto escritos · ${nMolde} jueves salteados (moldes sin hecho real)`)

let nHtml = 0
for (const c of CAROUSELS) {
  const dir = resolve(join(RAIZ, c.folder))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, c.file), buildHTML(c.title, c.slides), 'utf-8')
  nHtml++
  console.log(`   📄 ${c.folder}/${c.file} (${c.slides.length} placas)`)
}
console.log(`✅ ${nHtml} carruseles HTML`)

// ─── Stories verticales ───
// ⚠️ Van a contenido/carousels/muro-stories/ y NO a una carpeta propia: esa ruta
// está escrita en sistema-ingresos/api/_lib/story-diaria.js, que es el cron que
// las publica leyéndolas de GitHub raw. Moverlas exige tocar ese archivo y
// deployar sistema-ingresos entero. El nombre quedó de la serie de agosto: hoy
// la carpeta es "las stories diarias", no "las del muro". Ver su README.
const STORY_DIR = resolve(join(RAIZ, 'contenido/carousels/muro-stories'))
const storyHTML = (s, fecha) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Story ${fecha}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
.story { width:1080px; height:1920px; background:#07070f; display:flex; flex-direction:column; justify-content:space-between; padding:150px 90px 130px; position:relative; overflow:hidden; }
.story::before { content:''; position:absolute; top:-360px; left:-260px; width:1100px; height:1100px; background:radial-gradient(circle, rgba(99,102,241,.26) 0%, transparent 66%); pointer-events:none; }
.story::after  { content:''; position:absolute; bottom:-420px; right:-320px; width:1000px; height:1000px; background:radial-gradient(circle, rgba(34,211,238,.13) 0%, transparent 68%); pointer-events:none; }
.bar { position:absolute; left:0; top:150px; bottom:130px; width:6px; background:linear-gradient(180deg,#6366f1,#22d3ee); border-radius:0 4px 4px 0; }
.top { position:relative; z-index:2; }
.eyebrow { font-size:22px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:#6366f1; }
.mid { position:relative; z-index:2; flex:1; display:flex; flex-direction:column; justify-content:center; }
h1 { font-size:112px; font-weight:900; color:#f1f5f9; line-height:1.02; letter-spacing:-.045em; }
.accent { background:linear-gradient(135deg,#6366f1,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.rule { width:96px; height:6px; background:linear-gradient(90deg,#6366f1,#22d3ee); border-radius:3px; margin:52px 0 44px; }
.sub { font-size:40px; color:#cbd5e1; line-height:1.5; max-width:840px; }
.sub strong { color:#f1f5f9; }
.bottom { position:relative; z-index:2; display:flex; flex-direction:column; gap:34px; }
.cta { align-self:flex-start; font-size:31px; font-weight:800; color:#07070f; background:linear-gradient(135deg,#6366f1,#22d3ee); padding:26px 46px; border-radius:100px; letter-spacing:-.01em; }
.brand { font-size:24px; color:rgba(255,255,255,.3); letter-spacing:.1em; text-transform:uppercase; font-weight:700; }
</style>
</head>
<body>
<div class="story">
  <div class="bar"></div>
  <div class="top"><div class="eyebrow">${s.eyebrow}</div></div>
  <div class="mid">
    <h1>${s.hook}</h1>
    <div class="rule"></div>
    <div class="sub">${s.sub}</div>
  </div>
  <div class="bottom">
    <div class="cta">El posteo de hoy →</div>
    <div class="brand">@periodistasdelfuturo</div>
  </div>
</div>
</body>
</html>`

mkdirSync(STORY_DIR, { recursive: true })
let nStory = 0
for (const d of DIAS) {
  if (d.NECESITA_DATO) continue   // sin posteo no hay story que empujar
  writeFileSync(join(STORY_DIR, `${d.fecha}.html`), storyHTML(d.story, d.fecha), 'utf-8')
  nStory++
}
console.log(`✅ ${nStory} stories HTML en contenido/carousels/muro-stories/`)

console.log('\nSiguiente:')
console.log('  node scripts/exportar/export-slides-auto.mjs contenido/carousels/ia-s0   (y s1, s2, s3, s4)')
console.log('  node scripts/exportar/export-stories.mjs contenido/carousels/muro-stories')
console.log('  git add + commit + push  ← sin esto el cron de stories no ve los JPG')
console.log('  node --env-file=.env.local scripts/programar/schedule-septiembre.mjs')
