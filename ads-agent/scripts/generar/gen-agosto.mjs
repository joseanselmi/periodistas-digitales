/**
 * gen-agosto.mjs — Genera contenido orgánico FB de agosto 2026 (1→15)
 * Escribe captions (pie-de-foto.txt) + 8 carruseles HTML con la paleta indigo-cyan.
 * Uso: node scripts/generar/gen-agosto.mjs
 * Después: node scripts/exportar/export-slides-auto.mjs carousels/agosto-s1 (s2, s3) y luego el scheduler.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

// ─── CSS/chrome idéntico al template aprobado (semana-27-07) ──────────────────
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
  const dots = Array.from({ length: total }, (_, j) =>
    `<div class="dot${j === i ? ' active' : ''}"></div>`).join('')
  const hint = i === 0 ? 'Deslizá →' : i === total - 1 ? 'Fin del carrusel' : 'Seguí deslizando →'
  return `
<div class="slide${i === 0 ? ' active' : ''}">
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

function buildHTML(title, slides) {
  return HEAD(title) + slides.map((s, i) => renderSlide(s, i, slides.length)).join('\n') + FOOT
}

// ─── helpers de contenido ─────────────────────────────────────────────────────
const numlist = (items) => `<div class="numlist">${items.map(it =>
  `<div class="item"><div class="n">${it.n}</div><div class="t">${it.t}</div></div>`).join('')}</div>`
const promptBox = (title, text) => `<div class="prompt-box"><div class="ptitle">${title}</div><p>${text}</p></div>`

// ═══════════════════════ CARRUSELES ═══════════════════════════════════════════
const CAROUSELS = [
  // ── Aug 2 (Dom) — tendencia ──────────────────────────────────────────────
  { folder: 'carousels/agosto-s1', file: 'domingo-tendencias.html', title: '6 señales — Domingo 02/08',
    slides: [
      { label: 'Panorama', body: `<h1>6 señales<br>del periodismo<br><span class="accent">en agosto</span></h1><p class="lead">Lo que se está moviendo en LATAM este mes. Sin venderte nada — solo para que leas mejor el terreno.</p>` },
      { label: 'Señal 01', body: `<h2>Los anunciantes<br>miran distinto</h2><div class="divider"></div><p>Cada vez más negocios locales desconfían de pautar en las grandes plataformas: caro, frío, sin control. Buscan medios cercanos, de confianza, con audiencia real.</p><p><strong>Un medio chico y local tiene algo que Meta no puede ofrecer: contexto.</strong></p>` },
      { label: 'Señal 02', body: `<h2>La IA entró a<br>las redacciones</h2><div class="divider"></div><p>Dejó de ser tabú. Los que la usan bien producen más y mejor; los que la ignoran quedan lentos.</p><p>La ventaja ya no es tenerla. Es <strong>saber usarla con criterio periodístico.</strong></p>` },
      { label: 'Señal 03', body: `<h2>Los grandes<br>recortan</h2><div class="divider"></div><p>Reestructuraciones, cierres, equipos más chicos. La contracara: nunca hubo tanto talento periodístico buscando ejercer por su cuenta.</p><p>El mercado de <strong>medios propios</strong> se está llenando de profesionales.</p>` },
      { label: 'Señales 04 y 05', body: `<h2>Dos más,<br>rápidas</h2><div class="divider"></div>${numlist([
        { n: '04', t: '<strong>Newsletters propias</strong> que crecen mientras las redes se saturan de ruido.' },
        { n: '05', t: '<strong>Audiencias que pagan</strong> por buena información, no por cantidad.' },
      ])}` },
      { label: 'Cerrando', body: `<h2>¿Cuál ves<br><span class="accent">en tu país?</span></h2><div class="divider"></div><p class="lead">Contame en los comentarios cuál de estas señales notás más donde vivís.</p>` },
    ] },

  // ── Aug 3 (Lun) — educativo: prompt temas locales ────────────────────────
  { folder: 'carousels/agosto-s2', file: 'lunes-temas-locales.html', title: 'Temas locales — Lunes 03/08',
    slides: [
      { label: 'Tip de IA', body: `<h1>10 temas que<br>nadie en tu zona<br><span class="accent">está cubriendo</span></h1><p class="lead">Los huecos que dejan los medios grandes son tu oportunidad. Hoy, el prompt para encontrarlos.</p>` },
      { label: 'El problema', body: `<h2>Todos cubren<br>lo mismo</h2><div class="divider"></div><p>Los medios grandes van por las mismas noticias nacionales. Mientras tanto, en tu ciudad hay temas que la gente busca y nadie responde bien.</p><p><strong>Ahí, donde no hay oferta, está tu audiencia.</strong></p>` },
      { label: 'Cómo funciona', body: `<h2>Qué hace<br>el prompt</h2><div class="divider"></div><p>Le das tu ciudad y tu área de interés. Te devuelve 10 ángulos de temas locales con potencial de audiencia: cosas específicas, buscables, que a un medio nacional no le interesan pero a tu vecino sí.</p>` },
      { label: 'Copiable', color: 'green', body: `<h2>El <span class="accent">prompt</span></h2><div class="divider"></div>${promptBox('Copiá y pegá en ChatGPT o Claude', '"Actúa como editor de un medio digital local. Vivo en [tu ciudad/región] y me interesa cubrir [tu tema: cultura, política local, gastronomía, deportes…]. Dame 10 ideas de temas o secciones que la gente de mi zona probablemente busca y que los medios grandes no cubren bien. Para cada una: el ángulo, por qué le importaría a un lector local y una idea de primer título. Sé específico de mi región, no genérico."')}` },
      { label: 'Tip extra', color: 'amber', body: `<h2>Afiná<br>el resultado</h2><div class="divider"></div><p>Si te da ideas muy generales, pedile: "hacelas más específicas de mi ciudad y basadas en cosas que están pasando esta semana".</p><p><strong>Cuanto más contexto le das, mejor sale.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Sobre qué tema<br><span class="accent">arrancarías?</span></h2><div class="divider"></div><p class="lead">Contame en los comentarios el primer tema local que se te viene a la cabeza.</p>` },
    ] },

  // ── Aug 5 (Mié) — tip: primer anunciante local ───────────────────────────
  { folder: 'carousels/agosto-s2', file: 'miercoles-anunciante.html', title: 'Primer anunciante — Miércoles 05/08',
    slides: [
      { label: 'Tip práctico', body: `<h1>Tu primer<br>anunciante está<br><span class="accent">a 10 cuadras</span></h1><p class="lead">No está en internet. Está en tu barrio. Los 3 negocios que primero le pagan a un medio local — y qué decirles.</p>` },
      { label: 'Por qué ellos', body: `<h2>El negocio local<br>necesita lo<br>que tenés</h2><div class="divider"></div><p>Un comercio de barrio no puede competir en Facebook Ads con las grandes marcas. Pero sí puede aparecer en el medio que lee su propia clientela.</p><p><strong>Vos tenés exactamente eso: la atención de la gente de la zona.</strong></p>` },
      { label: 'Negocio 01', color: 'green', body: `<h2>El que ya invierte<br>en publicidad</h2><div class="divider"></div><p>Inmobiliarias, concesionarias, clínicas, gimnasios. Ya gastan en publicidad y entienden que cuesta dinero.</p><p><strong>Qué decirle:</strong> "Llego a [X] personas de [tu zona] cada semana. Te ofrezco una mención por [precio de prueba]."</p>` },
      { label: 'Negocio 02', color: 'green', body: `<h2>El que abrió<br>hace poco</h2><div class="divider"></div><p>Un restaurante nuevo, una tienda recién inaugurada. Necesitan que los conozcan ya y tienen presupuesto de lanzamiento.</p><p><strong>Qué decirle:</strong> "Puedo presentar tu apertura a mi audiencia local con una nota + menciones en redes."</p>` },
      { label: 'Negocio 03', color: 'green', body: `<h2>El que ya<br>te conoce</h2><div class="divider"></div><p>El comercio donde comprás, el profesional que te atiende. La confianza ya existe.</p><p><strong>Qué decirle, sin vueltas:</strong> "Armé un medio local sobre [tema]. ¿Te interesa que lo cuente a mi audiencia? Te paso los detalles."</p>` },
      { label: 'La clave', color: 'amber', body: `<h2>Empezá<br>barato</h2><div class="divider"></div><p>Tu primer precio no es el definitivo. Es para romper el hielo y tener el primer "sí".</p><p><strong>Un anunciante que ya te pagó una vez es diez veces más fácil de renovar.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Cuál de estos<br><span class="accent">tenés cerca?</span></h2><div class="divider"></div><p class="lead">Pensá en un negocio de tu barrio ahora mismo. Escribí cuál en los comentarios.</p>` },
    ] },

  // ── Aug 7 (Vie) — VENTA: qué incluye ($27) ───────────────────────────────
  { folder: 'carousels/agosto-s2', file: 'viernes-sistema.html', title: 'El Sistema — Viernes 07/08',
    slides: [
      { label: 'El sistema', color: 'amber', body: `<h1>Todo en<br>un solo<br><span class="accent">lugar</span></h1><p class="lead">El método de 4 semanas que ya usaron +3.700 personas para armar un medio propio que cobra.</p>` },
      { label: 'Las 4 semanas', body: `<h2>El camino,<br>por partes</h2><div class="divider"></div>${numlist([
        { n: '01', t: '<strong>Elegí</strong> tu nicho rentable.' },
        { n: '02', t: '<strong>Armá</strong> tu medio y tu distribución.' },
        { n: '03', t: '<strong>Producí</strong> más con IA, sin perder tu voz.' },
        { n: '04', t: '<strong>Conseguí</strong> tu primera fuente de ingresos.' },
      ])}` },
      { label: 'Incluye', color: 'green', body: `<h2>Lo que<br>te llevás</h2><div class="divider"></div>${numlist([
        { n: '›', t: 'El <strong>sistema completo</strong> paso a paso.' },
        { n: '›', t: 'Los <strong>3 bonos</strong> prácticos.' },
        { n: '›', t: '<strong>1 mes de Leadr</strong> de regalo ($97 de valor).' },
      ])}` },
      { label: 'El valor', body: `<h2>$227 en<br>valor real</h2><div class="divider"></div><p>El sistema + los 3 bonos + el mes de Leadr suman <strong>$227 de valor</strong>.</p><p>No lo pagás.</p>` },
      { label: 'El precio', color: 'amber', body: `<h1>Hoy:<br><span class="accent">$27 USD</span></h1><p class="lead">Pago único. Acceso inmediato. 7 días de garantía: si no es para vos, te devolvemos todo.</p>` },
      { label: 'Cerrando', body: `<h2>El link está<br><span class="accent">en la bio</span></h2><div class="divider"></div><p class="lead">Acceso inmediato por $27 USD. Si venís posponiendo esto, hoy es un buen día para empezar.</p>` },
    ] },

  // ── Aug 9 (Dom) — tendencia: IA y búsqueda ───────────────────────────────
  { folder: 'carousels/agosto-s2', file: 'domingo-busqueda-ia.html', title: 'IA y búsqueda — Domingo 09/08',
    slides: [
      { label: 'Panorama', body: `<h1>La IA cambió<br>cómo te<br><span class="accent">encuentran</span></h1><p class="lead">5 cambios de 2026 en cómo la gente busca información — y qué significan para un medio chico.</p>` },
      { label: 'Cambio 01', body: `<h2>Google<br>responde solo</h2><div class="divider"></div><p>Cada vez más búsquedas se resuelven sin un clic: Google muestra la respuesta arriba. El tráfico "de paso" baja.</p><p>Lo que sube en valor: <strong>la audiencia que te busca a vos por tu nombre.</strong></p>` },
      { label: 'Cambio 02', body: `<h2>Le preguntan<br>a la IA</h2><div class="divider"></div><p>Mucha gente hoy le pregunta a ChatGPT lo que antes buscaba en un diario. La información genérica la da la IA gratis.</p><p>Lo que la IA no tiene: <strong>tu mirada local, tu criterio, tu voz.</strong></p>` },
      { label: 'Cambio 03', body: `<h2>Gana la<br>confianza</h2><div class="divider"></div><p>En un mar de contenido generado por IA, la gente vuelve a lo que reconoce y en lo que confía.</p><p><strong>Una firma humana, constante y cercana, vale más que nunca.</strong></p>` },
      { label: 'Cambios 04 y 05', body: `<h2>Dos más,<br>para cerrar</h2><div class="divider"></div>${numlist([
        { n: '04', t: 'Las redes premian <strong>cercanía</strong>, no links salientes.' },
        { n: '05', t: 'El <strong>email propio</strong> es el único canal que nadie te puede quitar.' },
      ])}` },
      { label: 'Cerrando', body: `<h2>¿Ya lo notaste<br><span class="accent">en tus lectores?</span></h2><div class="divider"></div><p class="lead">Contame en los comentarios cuál de estos cambios estás viendo.</p>` },
    ] },

  // ── Aug 10 (Lun) — educativo: prompt titulares ───────────────────────────
  { folder: 'carousels/agosto-s3', file: 'lunes-titulares.html', title: 'Titulares — Lunes 10/08',
    slides: [
      { label: 'Tip de IA', body: `<h1>10 titulares<br>que la gente<br><span class="accent">sí clickea</span></h1><p class="lead">El titular decide si tu nota se lee o pasa de largo. Hoy, el prompt para no quedarte con el primero que se te ocurre.</p>` },
      { label: 'La diferencia', body: `<h2>Titular ≠<br>clickbait</h2><div class="divider"></div><p>Un buen titular no engaña. Da claridad y la curiosidad justa para querer saber más. El clickbait promete y no cumple; el buen titular promete y cumple.</p><p><strong>La misma nota, con mejor titular, puede duplicar sus lecturas.</strong></p>` },
      { label: 'Cómo funciona', body: `<h2>Qué hace<br>el prompt</h2><div class="divider"></div><p>Le das el tema de tu nota y para quién es. Te devuelve 10 titulares con ángulos distintos: uno directo, uno con pregunta, uno con dato, uno con curiosidad.</p><p>Vos elegís el que mejor le hable a tu audiencia.</p>` },
      { label: 'Copiable', color: 'green', body: `<h2>El <span class="accent">prompt</span></h2><div class="divider"></div>${promptBox('Copiá y pegá en ChatGPT o Claude', '"Actúa como editor experto en titulares para medios digitales. Mi nota trata sobre [tema]. Mi audiencia es [describí: periodistas, vecinos de tu ciudad…]. Dame 10 titulares distintos, variados en ángulo (directo, pregunta, dato, curiosidad, beneficio). Claros, honestos (nada de clickbait) y de menos de 12 palabras. Marcá cuál recomendás y por qué."')}` },
      { label: 'Tip extra', color: 'amber', body: `<h2>Probá dos<br>y medí</h2><div class="divider"></div><p>Si podés, publicá la misma nota con dos titulares distintos (uno hoy, otro en otra red) y mirá cuál trae más lecturas.</p><p><strong>Con el tiempo vas a saber qué le gusta a tu audiencia, no a la teoría.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿El peor titular<br>que <span class="accent">pusiste?</span></h2><div class="divider"></div><p class="lead">Todos tenemos uno. Contámelo en los comentarios, sin vergüenza 😅</p>` },
    ] },

  // ── Aug 12 (Mié) — tip: producir el doble con IA ─────────────────────────
  { folder: 'carousels/agosto-s3', file: 'miercoles-producir-doble.html', title: 'Producir el doble — Miércoles 12/08',
    slides: [
      { label: 'Tip práctico', body: `<h1>El doble de<br>contenido, sin<br><span class="accent">el doble de horas</span></h1><p class="lead">No es que la IA escriba por vos. Es que haga las partes lentas para que vos hagas lo que solo vos podés hacer.</p>` },
      { label: 'Uso 01', body: `<h2>Investigación<br>previa</h2><div class="divider"></div><p>Antes de escribir, pedile que te resuma el contexto de un tema, te liste fuentes o arme un cuestionario para una entrevista. Lo que te tomaba una hora, en 5 minutos.</p><p><strong>El criterio de qué usar sigue siendo tuyo.</strong></p>` },
      { label: 'Uso 02', body: `<h2>Reciclar<br>formatos</h2><div class="divider"></div><p>Una nota se convierte en un hilo, un mail y 3 posts. Pedile que adapte tu texto original a cada formato.</p><p><strong>Escribís una vez, publicás en cinco lugares.</strong></p>` },
      { label: 'Uso 03', body: `<h2>Las tareas<br>que odiás</h2><div class="divider"></div><p>Titulares, resúmenes, descripciones para redes, corrección de estilo. Las partes mecánicas que te cansan y no aportan tu voz.</p><p><strong>Delegalas y quedate con lo que te gusta hacer.</strong></p>` },
      { label: 'La regla', color: 'amber', body: `<h2>La IA asiste,<br>vos decidís</h2><div class="divider"></div><p>Nunca publiques lo que la IA generó sin leerlo y ponerle tu criterio. Es un asistente rapidísimo, no un reemplazo de tu juicio.</p><p><strong>Tu voz es lo que te hace distinto.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿En cuál perdés<br>más <span class="accent">tiempo hoy?</span></h2><div class="divider"></div><p class="lead">Investigación, reciclar formatos o las tareas mecánicas. Contame en los comentarios.</p>` },
    ] },

  // ── Aug 14 (Vie) — VENTA: "¿y si no soy de tecnología?" ($27) ─────────────
  { folder: 'carousels/agosto-s3', file: 'viernes-sin-tecnologia.html', title: 'Sin tecnología — Viernes 14/08',
    slides: [
      { label: 'Para vos', color: 'amber', body: `<h1>"¿Y si no soy<br>de <span class="accent">tecnología?"</span></h1><p class="lead">Es la duda que frena a la mayoría de los periodistas. Hoy la respondemos de frente.</p>` },
      { label: 'La verdad', body: `<h2>Está hecho<br>para<br>periodistas</h2><div class="divider"></div><p>No para programadores. El sistema asume que no sabés nada técnico y te lleva paso a paso.</p><p><strong>Si sabés escribir un mail y usar WhatsApp, tenés todo lo que hace falta para empezar.</strong></p>` },
      { label: 'La prueba', color: 'green', body: `<h2>Marta, 52.<br>Nunca usó<br>Canva.</h2><div class="divider"></div><p>Y armó su medio igual. La mayoría de la gente que lo hizo no venía del mundo tech.</p><p><strong>Venían del periodismo, que es justo lo que hace falta.</strong></p>` },
      { label: 'Incluye', body: `<h2>Lo que<br>te llevás</h2><div class="divider"></div>${numlist([
        { n: '01', t: 'El <strong>sistema completo</strong> paso a paso.' },
        { n: '02', t: 'Los <strong>3 bonos</strong> prácticos.' },
        { n: '03', t: '<strong>1 mes de Leadr</strong> de regalo ($97).' },
        { n: '04', t: '<strong>7 días de garantía</strong> total.' },
      ])}` },
      { label: 'El precio', color: 'amber', body: `<h1>Valor $227.<br>Hoy <span class="accent">$27</span></h1><p class="lead">Pago único, acceso inmediato. Si no es para vos, te devolvemos todo dentro de los 7 días. El riesgo es cero.</p>` },
      { label: 'Cerrando', body: `<h2>El link está<br><span class="accent">en la bio</span></h2><div class="divider"></div><p class="lead">No hace falta que sepas de tecnología. Hace falta que empieces. $27 USD, acceso inmediato.</p>` },
    ] },
]

// ═══════════════════════ CAPTIONS (pie-de-foto.txt) ═══════════════════════════
// key = "folder|subdir"
const CAPTIONS = {
  // ── agosto-s1 (finde) ──
  'carousels/agosto-s1|6-SABADO': `Empieza agosto. Y con cada mes nuevo vuelve la misma frase silenciosa: "el mes que viene sí".

El mes que viene sí voy a armar algo propio. El mes que viene sí me pongo con eso que vengo posponiendo. El mes que viene, cuando esté menos ocupado.

El problema es que el "mes que viene" nunca llega menos ocupado. Llega igual de lleno, con las mismas 24 horas y las mismas urgencias.

No hace falta un mes despejado para empezar. Hace falta una tarde. Una decisión chica y concreta: elegir el tema, abrir el documento, escribir la primera línea.

Agosto no va a ser distinto porque el calendario cambió de número. Va a ser distinto si vos hacés algo distinto adentro de él.

¿Qué es esa cosa chica que venís posponiendo "para el mes que viene"? Escribila abajo. A veces nombrarla ya es empezar.

#PeriodismoDigital #Reflexion #PeriodistasLatam`,

  'carousels/agosto-s1|7-DOMINGO': `Arranca agosto y esto es lo que se está moviendo en el periodismo digital de LATAM, sin venderte nada.

Anunciantes locales que ya no quieren pautar en las grandes plataformas y buscan medios de confianza. IA que dejó de ser tabú en las redacciones. Newsletters propias que crecen mientras los grandes recortan.

Un resumen de 6 señales para leer el mes que empieza.

¿Cuál de estas ves en tu país? 👇`,

  // ── agosto-s2 (Lun 3 → Dom 9) ──
  'carousels/agosto-s2|1-LUNES': `El prompt que te da 10 temas locales que nadie en tu zona está cubriendo.

Los medios grandes cubren lo mismo de siempre. Los huecos —los temas que la gente de tu ciudad busca y nadie responde— son tu oportunidad.

Pegalo en ChatGPT, Gemini o Claude, completá los corchetes con tu ciudad y tu tema, y te devuelve 10 ángulos con potencial de audiencia local.

Copialo del slide 4.

¿Sobre qué tema local arrancarías? 👇`,

  'carousels/agosto-s2|2-MARTES': `Te rebotaron la nota. Otra vez.

No porque estuviera mal escrita. Estaba bien. La rebotaron porque "no entra en la línea", porque "ahora no es el momento", porque el que decide no la vio igual que vos.

Y ahí está el problema de fondo: no es tu nota. Es que tu trabajo depende de que otro diga que sí.

Podés ser el mejor redactor de la redacción y seguir dependiendo de una firma que no es la tuya para que tu trabajo exista.

Un medio propio no borra los rebotes. Pero cambia quién decide. La nota que a un editor no le sirve, en tu propio espacio puede ser exactamente lo que tu audiencia estaba esperando leer.

No se trata de irte dando un portazo. Se trata de no tener un solo lugar donde tu voz pueda existir.

¿Cuántas notas buenas tenés guardadas que nunca salieron porque alguien dijo que no? Contanos abajo.

#PeriodismoDigital #PeriodistasLatam #MedioPropio`,

  'carousels/agosto-s2|3-MIERCOLES': `Tu primer anunciante local no está en internet. Está a 10 cuadras de tu casa.

La mayoría de los periodistas que arrancan un medio propio se traban en lo mismo: "¿y quién me va a pagar publicidad?". La respuesta es más cercana de lo que pensás.

En este carrusel: los 3 tipos de negocios que primero le pagan a un medio local, y exactamente qué decirles.

¿Cuál de estos tenés cerca? 👇`,

  'carousels/agosto-s2|4-JUEVES': `Tres periodistas. Tres primeros cobros en julio. Tres ciudades.

Esteban, Rosario.
Cubría deportes para una radio AM. En julio armó un newsletter sobre el ascenso del fútbol argentino. La semana pasada una casa de indumentaria deportiva del barrio le pagó su primera pauta mensual.

Lucía, Medellín.
Doce años en prensa escrita. Abrió un espacio digital de gastronomía local. Un restaurante nuevo le pagó por una nota + tres menciones en redes. Ya la llamó otro.

Tomás, Montevideo.
Freelance de tecnología. Lanzó una guía semanal de trámites y servicios de la ciudad. Una inmobiliaria le compró el primer banner fijo del mes.

Ninguno reemplazó su ingreso principal todavía. Pero los tres tienen algo que hace dos meses no tenían: dinero que entra por algo que es de ellos.

Empezaron sin saber si iba a funcionar. Cobraron sin haberlo hecho nunca antes.

¿Cuál de las tres historias se parece más a lo que vos podrías armar? 👇

#PeriodismoDigital #IngresosPropios #PeriodistasLatam`,

  'carousels/agosto-s2|5-VIERNES': `Todo lo que necesitás para armar tu primera fuente de ingresos propia. En un solo lugar.

El Sistema de Ingresos Diarios: el método de 4 semanas que ya usaron +3.700 personas para pasar de "algún día" a un medio propio que cobra.

Adentro: el sistema completo, los 3 bonos y 1 mes de Leadr de regalo ($97 de valor). Valor real $227.

Hoy, $27 USD. Acceso inmediato y 7 días de garantía. Link en bio.

#PeriodismoDigital #IngresosPropios #PeriodistasLatam`,

  'carousels/agosto-s2|6-SABADO': `Hay una diferencia enorme entre "saber hacer algo" y "cobrar por hacerlo".

La mayoría de los periodistas sabe hacer un montón de cosas: escribir, investigar, editar, contar, verificar. Habilidades que tardaron años en afilar.

Pero muchas de esas habilidades solo valen dinero mientras haya un medio dispuesto a contratarte. El día que ese medio recorta, la habilidad sigue intacta y el ingreso desaparece.

Aprender a cobrar por lo que sabés —directo, sin intermediario— es una habilidad distinta. No te la enseñaron en la facultad ni en la redacción. Y es, probablemente, la más importante para los próximos diez años.

No es venderte. Es dejar de depender de que otro decida cuánto vale tu trabajo.

¿Alguna vez pensaste cuánto de lo que sabés hacer podría generarte ingresos por tu cuenta? Contanos abajo.

#PeriodismoDigital #Reflexion #PeriodistasLatam`,

  'carousels/agosto-s2|7-DOMINGO': `La IA cambió cómo se busca información este año. Y eso cambia dónde te encuentra tu audiencia.

Google mostrando respuestas sin clics. Buscadores con IA. Gente preguntándole a ChatGPT lo que antes buscaba en un diario.

En este carrusel: 5 cambios concretos de 2026 y qué significan para un medio digital chico.

¿Ya notaste alguno de estos en tus lectores? 👇`,

  // ── agosto-s3 (Lun 10 → Sáb 15) ──
  'carousels/agosto-s3|1-LUNES': `El prompt para escribir 10 titulares que la gente sí quiere clickear.

Un buen titular no es clickbait. Es claridad + curiosidad justa. La diferencia entre una nota que se lee y una que pasa de largo, muchas veces, es solo el titular.

Pegá este prompt, poné el tema de tu nota, y te da 10 opciones con distintos ángulos para elegir.

Copialo del slide 4.

¿Cuál es el peor titular que pusiste alguna vez? 😅 Contanos abajo.`,

  'carousels/agosto-s3|2-MARTES': `"Cuando me jubile / cuando cierre / cuando me echen, ahí veo qué hago."

Es el plan de carrera más común entre periodistas de más de 40. Y el más peligroso.

Porque deja la decisión más importante de tu vida laboral en manos de un evento que no controlás y que casi siempre llega en el peor momento: sin aviso, sin ahorro extra, sin nada armado.

El mejor momento para construir algo propio no es cuando ya no te queda otra. Es cuando todavía tenés un ingreso que te sostiene mientras lo armás sin presión.

Armar tu propio espacio hoy, con tu sueldo actual todavía entrando, es la diferencia entre construir con calma y construir con desesperación.

Nadie construye bien con el agua al cuello.

¿Estás armando tu "plan B" ahora, o esperando a necesitarlo? Contanos abajo.

#PeriodismoDigital #PeriodistasLatam #FuturoDelTrabajo`,

  'carousels/agosto-s3|3-MIERCOLES': `Cómo producir el doble de contenido sin pasar el doble de horas frente a la pantalla.

No se trata de que la IA escriba por vos. Se trata de que haga las partes lentas —las que te comen tiempo pero no aportan tu criterio— para que vos hagas lo que solo vos podés hacer.

3 usos concretos de IA que le devuelven horas a tu semana, en este carrusel.

¿En cuál de estas tres perdés más tiempo hoy? 👇`,

  'carousels/agosto-s3|4-JUEVES': `Le pregunté a una periodista qué fue lo que más la sorprendió de armar su medio propio. Su respuesta no tuvo nada que ver con la plata.

Se llama Paola, tiene 47 años, y hace ocho meses abrió un espacio digital sobre educación en Bogotá después de veinte años en un diario.

Esperaba que lo más difícil fuera la tecnología. No lo fue: dice que en dos semanas le agarró la mano.

Esperaba que lo más lindo fuera el primer ingreso. Lo fue, pero no lo más importante.

Lo que más la sorprendió, me dijo, fue "volver a decidir". Elegir sobre qué escribir sin pedir permiso. Publicar una nota un domingo porque le pareció que valía la pena. Responderle a un lector que le escribió para agradecerle.

"Me había olvidado de que el periodismo, antes que un trabajo, había sido una decisión mía", me escribió.

El ingreso extra fue la consecuencia. Lo que recuperó fue algo que había perdido sin darse cuenta.

¿Cuánto hace que no sentís que decidís de verdad sobre lo que publicás? Contanos abajo.

#PeriodismoDigital #PeriodistasLatam #IngresosPropios`,

  'carousels/agosto-s3|5-VIERNES': `"¿Y si no soy de tecnología?" Es la duda que frena a la mayoría. Hoy la respondemos.

El Sistema de Ingresos Diarios está pensado para periodistas, no para programadores. Paso a paso, sin dar por sentado que sabés nada técnico. Si sabés escribir un mail, podés seguirlo.

Adentro: el sistema completo, los 3 bonos, 1 mes de Leadr de regalo ($97) y 7 días de garantía. Si no es para vos, te devolvemos todo.

Valor real $227. Hoy, $27 USD. Link en bio.

#PeriodismoDigital #IngresosPropios #PeriodistasLatam`,

  'carousels/agosto-s3|6-SABADO': `Pasó la mitad de agosto. Buen momento para una pregunta incómoda: ¿en qué cambió tu situación laboral en lo que va del año?

No es para hacerte sentir mal. Es para medir con honestidad.

Si la respuesta es "en nada", no significa que hiciste algo mal. La mayoría de la gente termina el año exactamente igual que como lo empezó, no por falta de capacidad, sino porque nunca movió la primera ficha.

Los que sí cambian algo no suelen ser los más talentosos. Son los que hicieron una cosa concreta —chica, imperfecta— y la sostuvieron.

Todavía quedan cuatro meses y medio de 2026. Es tiempo de sobra para que, en diciembre, la respuesta a esta pregunta sea distinta.

Pero eso se decide ahora, en agosto, no en diciembre.

¿Qué querés poder responder a fin de año que hoy no podés? Contanos abajo.

#PeriodismoDigital #Reflexion #PeriodistasLatam`,
}

// ═══════════════════════ ESCRITURA ════════════════════════════════════════════
// 1) Captions → para-subir/<subdir>/pie-de-foto.txt
let nCap = 0
for (const [key, text] of Object.entries(CAPTIONS)) {
  const [folder, subdir] = key.split('|')
  const dir = resolve(join(folder, 'para-subir', subdir))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'pie-de-foto.txt'), text.trim() + '\n', 'utf-8')
  nCap++
}
console.log(`✅ ${nCap} captions escritas`)

// 2) Carruseles → <folder>/<file>.html
let nHtml = 0
for (const c of CAROUSELS) {
  const dir = resolve(c.folder)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, c.file), buildHTML(c.title, c.slides), 'utf-8')
  nHtml++
  console.log(`   📄 ${c.folder}/${c.file} (${c.slides.length} slides)`)
}
console.log(`✅ ${nHtml} carruseles HTML generados`)
console.log('\nSiguiente: node scripts/exportar/export-slides-auto.mjs carousels/agosto-s1 (s2, s3)')
