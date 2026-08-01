/**
 * gen-muro-agosto.mjs — Orgánico FB agosto 16→31 para "el periodista del muro"
 *
 * Público: el periodista que YA publica noticias de otros en su perfil personal.
 * Mismo lector que el anuncio ad4-perfil, la landing /muro y la guía imán.
 * Fuente: sistema-ingresos/campanas/republicadores/guias/que-te-lean-miles.html + EMBUDO-GUIAS.md
 * Tarjetas: #107 (esta serie) · #106 (el embudo completo)
 *
 * Reglas de este embudo (decididas con Jose, 30/07):
 *  - ESPAÑOL NEUTRO (tú/puedes/dime), igual que la guía y /muro. Nada de voseo.
 *  - SIN CIFRAS DE AUDIENCIA en ningún lado: en cuanto aparece un número el lector
 *    se compara y la mitad se autoexcluye.
 *  - SIN ENLACE en el posteo: el valor entra completo en la publicación.
 *  - Se NOMBRA que el perfil personal da la audiencia equivocada, pero NO se enseña
 *    a mudarla: eso es el Módulo 5, o sea lo que se paga.
 *
 * Uso: node scripts/generar/gen-muro-agosto.mjs
 * Después: node scripts/exportar/export-slides-auto.mjs carousels/muro-s1 (s2, s3) y schedule-muro.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

// ─── CSS/chrome idéntico al template aprobado (gen-agosto.mjs) ────────────────
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
/* ── PORTADA: la que tiene que frenar el scroll ──
   Fondo más cargado y tipografía que ocupa el cuadro. El resto de las placas
   quedan sobrias a propósito: si gritan todas, no grita ninguna. */
.slide.cover { background:#05050c; padding:64px 74px 56px; }
.slide.cover::before { top:-420px; left:-300px; width:1250px; height:1250px; background:radial-gradient(circle, rgba(99,102,241,.42) 0%, rgba(99,102,241,.10) 45%, transparent 70%); }
.slide.cover .glow2 { content:''; position:absolute; bottom:-380px; right:-280px; width:1000px; height:1000px; background:radial-gradient(circle, rgba(34,211,238,.24) 0%, transparent 68%); pointer-events:none; }
.slide.cover h1 { font-size:104px; line-height:.99; letter-spacing:-.05em; margin-bottom:34px; }
.slide.cover p.lead { font-size:37px; color:#94a3b8; }
.slide.cover .label { font-size:14px; }
/* Frase marcada: bloque sólido con texto oscuro. Es lo único con fondo claro en
   todo el kit, así que es lo primero que se ve en un feed lleno de placas grises. */
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
/* ── comparación antes/después (propio de esta serie) ── */
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
  const dots = Array.from({ length: total }, (_, j) =>
    `<div class="dot${j === i ? ' active' : ''}"></div>`).join('')
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

const buildHTML = (title, slides) =>
  HEAD(title) + slides.map((s, i) => renderSlide(s, i, slides.length)).join('\n') + FOOT

const numlist = (items) => `<div class="numlist">${items.map(it =>
  `<div class="item"><div class="n">${it.n}</div><div class="t">${it.t}</div></div>`).join('')}</div>`
const vs = (badTag, bad, goodTag, good) => `<div class="vs">
  <div class="row bad"><div class="tag">${badTag}</div><div class="txt">${bad}</div></div>
  <div class="row good"><div class="tag">${goodTag}</div><div class="txt">${good}</div></div>
</div>`

// ═══════════════════════ CARRUSELES ═══════════════════════════════════════════
const CAROUSELS = [
  // ── Dom 16 — el más fuerte de la guía, va primero ────────────────────────
  { folder: 'contenido/carousels/muro-s1', file: 'domingo-marca-ajena.html', title: 'La marca que se ve — Domingo 16/08',
    slides: [
      { label: 'El punto ciego', body: `<h1>Compartes.<br>Y el nombre<br>que se ve<br><span class="hl">no es el tuyo</span></h1><p class="lead">Le estás haciendo prensa gratis a un medio que no te paga. Todos los días.</p>` },
      { label: 'Lo que haces', body: `<h2>El trabajo<br>es tuyo</h2><div class="divider"></div><p>Revisas, descartas, eliges. Sabes cuál importa y cuál no merece que la gente pierda el tiempo.</p><p><strong>Ese filtro es tu oficio. Te llevó años.</strong></p>` },
      { label: 'Lo que se ve', body: `<h2>La marca<br>es de ellos</h2><div class="divider"></div><p>Cuando tocas compartir, en la publicación aparece el logo de esa página. No el tuyo.</p><p><strong>El lector que se interesa los sigue a ellos. Tu criterio y tu constancia les hicieron prensa gratis.</strong></p>` },
      { label: 'Y encima', body: `<h2>Se muestra<br>menos</h2><div class="divider"></div><p>Lo compartido se reparte menos que una publicación propia: Facebook ya mostró ese contenido, tu vez es la segunda.</p><p><strong>Y si lleva enlace afuera, peor: lo que saca gente de la plataforma se muestra menos que lo que se queda adentro.</strong></p>` },
      { label: 'La cuenta', color: 'amber', body: `<h2>Treinta<br>segundos<br>que salen caros</h2><div class="divider"></div><p>Tocar compartir te lleva treinta segundos y hace que se vea poco, con el nombre de otro.</p><p><strong>Reescribir la noticia con tus palabras te lleva tres minutos y hace que se vea, con tu nombre encima.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Cuántas de<br>tus últimas<br><span class="accent">son compartidas?</span></h2><div class="divider"></div><p class="lead">Abre tu perfil y fíjate. Dime cuántas de las últimas diez son publicación tuya y cuántas son de otro. 👇</p>` },
    ] },

  // ── Lun 17 — el mecanismo ────────────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s1', file: 'lunes-mecanismo.html', title: 'Los que te siguen — Lunes 17/08',
    slides: [
      { label: 'Por qué pasa', body: `<h1>Publicaste<br>la nota del año.<br><span class="hl">La vio tu tía</span></h1><p class="lead">No es mala suerte y no es el alcance. Es a quién le está llegando.</p>` },
      { label: 'Cómo elige', body: `<h2>Facebook<br>no se lo<br>muestra a todos</h2><div class="divider"></div><p>Cuando publicas, elige a quién. Y para elegir usa sobre todo una señal: con quién interactuaste antes, y quién interactuó antes contigo.</p>` },
      { label: 'Quiénes son', body: `<h2>Esa lista tiene<br>nombre y apellido</h2><div class="divider"></div><p>Tu familia. Tus amigos. Tus excompañeros de la redacción. Los que te saludaron el cumpleaños, los que comentaron la foto de tus hijos.</p><p><strong>Publicas sobre el presupuesto municipal y el sistema hace lo único que sabe hacer: se lo muestra a ellos.</strong></p>` },
      { label: 'El círculo', body: `<h2>Y ahí<br>empieza<br>el círculo</h2><div class="divider"></div><p>Tu prima comenta "qué grande". El sistema entiende que tu contenido le interesa a gente parecida a tu prima.</p><p><strong>Y la próxima se la muestra a más gente parecida a tu prima. Cada vez más lejos de quien sí quería enterarse.</strong></p>` },
      { label: 'La diferencia', color: 'amber', body: `<h2>Conocidos,<br>no lectores</h2><div class="divider"></div><p>Un perfil personal reparte lo que publicas entre la gente de tu <strong>vida</strong>, no entre la gente de tu <strong>tema</strong>.</p><p>Por eso los comentarios son "qué grande" en vez de discusión sobre la noticia.</p>` },
      { label: 'Cerrando', body: `<h2>¿Qué te<br>comentan<br><span class="accent">a ti?</span></h2><div class="divider"></div><p class="lead">Mira los comentarios de tu última noticia. ¿Se parecen más a un saludo o a una conversación sobre el tema? Dime abajo. 👇</p>` },
    ] },

  // ── Mié 19 — qué hacer en lugar de compartir ─────────────────────────────
  { folder: 'contenido/carousels/muro-s1', file: 'miercoles-en-vez-de-compartir.html', title: 'En vez de compartir — Miércoles 19/08',
    slides: [
      { label: 'Empieza por acá', body: `<h1>Treinta segundos<br>que te cuestan<br><span class="hl">todos tus</span><br><span class="hl">lectores</span></h1><p class="lead">Lo que tarda tocar "compartir". Los cuatro pasos que lo reemplazan tardan tres minutos.</p>` },
      { label: 'Paso 01', color: 'green', body: `<h2>Publícala<br>con tus<br>palabras</h2><div class="divider"></div><p>Como publicación tuya, no como compartida. Tres a cinco líneas: qué pasó, dónde, a quién le afecta.</p><p><strong>No es plagiar. Es lo que hace cualquier redacción cuando levanta una noticia de otra.</strong></p>` },
      { label: 'Paso 02', color: 'green', body: `<h2>Cita la fuente<br>en tu texto</h2><div class="divider"></div><p>"Lo informó [el medio]".</p><p><strong>Cuatro palabras que te cubren y que te hacen ver más serio, no menos.</strong></p>` },
      { label: 'Paso 03', color: 'green', body: `<h2>Pon una<br>imagen propia</h2><div class="divider"></div><p>Una foto tuya del lugar, o una placa simple con el titular.</p><p><strong>Lo que no va es la miniatura del otro medio: es la que lleva su marca.</strong></p>` },
      { label: 'Paso 04', color: 'green', body: `<h2>El enlace,<br>al primer<br>comentario</h2><div class="divider"></div><p>"Nota completa acá 👇".</p><p><strong>El que quiere leer la original la encuentra, y tu publicación no arrastra la penalización de sacar gente de la plataforma.</strong></p>` },
      { label: 'Cerrando', body: `<h2>La próxima<br><span class="accent">pruébalo</span></h2><div class="divider"></div><p class="lead">Una sola noticia, con los cuatro pasos. Dime cómo te fue comparado con la anterior. 👇</p>` },
    ] },

  // ── Vie 21 — la tabla de titulares ───────────────────────────────────────
  { folder: 'contenido/carousels/muro-s1', file: 'viernes-titulares.html', title: 'Titular de muro — Viernes 21/08',
    slides: [
      { label: 'Tu trabajo principal', body: `<h1>Nadie frena<br>el dedo por<br>un titular<br><span class="hl">de diario</span></h1><p class="lead">El que trae la nota está escrito para quien ya entró a informarse. Tu lector venía mirando fotos de un cumpleaños.</p>` },
      { label: 'La diferencia', body: `<h2>Dos lectores<br>distintos</h2><div class="divider"></div><p>El titular de diario es para quien ya decidió informarse: entró a buscar noticias.</p><p><strong>El de muro es para alguien que venía mirando fotos de un cumpleaños. Hay que hacerlo frenar.</strong></p>` },
      { label: 'Ejemplo 01', body: `<h2>La tarifa</h2><div class="divider"></div>${vs('De diario', 'Aumento del 12% en la tarifa de agua', 'De muro', 'El agua te va a llegar 12% más cara desde el mes que viene')}` },
      { label: 'Ejemplo 02', body: `<h2>La basura</h2><div class="divider"></div>${vs('De diario', 'Nuevo cronograma de recolección de residuos', 'De muro', 'Si sacas la basura los martes, te cambió el día')}` },
      { label: 'Ejemplo 03', body: `<h2>El hospital</h2><div class="divider"></div>${vs('De diario', 'Denuncian demoras en el hospital municipal', 'De muro', 'Tres semanas sin tomógrafo: los estudios se derivan a 40 km')}` },
      { label: 'El patrón', color: 'amber', body: `<h2>Qué cambia<br>en los dos</h2><div class="divider"></div><p>El de diario <strong>nombra el hecho</strong>. El de muro <strong>le dice al lector qué le cambia a él</strong>.</p><p>Ninguno de los de la derecha miente ni infla nada. Es la misma noticia, contada para quien no la estaba buscando.</p>` },
      { label: 'Cerrando', body: `<h2>Pásame<br><span class="accent">uno tuyo</span></h2><div class="divider"></div><p class="lead">Escribe abajo un titular que hayas publicado esta semana y te devuelvo la versión de muro. 👇</p>` },
    ] },

  // ── Dom 23 — la primera línea ────────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s2', file: 'domingo-primera-linea.html', title: 'La primera línea — Domingo 23/08',
    slides: [
      { label: 'Cómo lo escribes', body: `<h1>Te leen<br>dos líneas.<br><span class="hl">Y las estás</span><br><span class="hl">regalando</span></h1><p class="lead">El feed corta ahí. Lo que pongas arriba decide si alguien sigue leyendo o sigue de largo.</p>` },
      { label: 'El error', body: `<h2>Das por sabido<br>el contexto</h2><div class="divider"></div><p>"Otra vez lo mismo en la esquina de siempre" lo entiende tu vecino.</p><p><strong>Y nadie más. El que no te conoce ya siguió de largo.</strong></p>` },
      { label: 'El otro error', body: `<h2>O escribes<br>para que<br>compartan</h2><div class="divider"></div><p>"Miren esto 😱 Compartan para que se enteren todos" no informa nada.</p><p><strong>El lector no sabe todavía de qué se trata, así que no tiene por qué frenar.</strong></p>` },
      { label: 'Antes y después', body: `<h2>La misma<br>noticia</h2><div class="divider"></div>${vs('Arriba de lo compartido', 'Miren esto 😱 Compartan para que se enteren todos!!', 'Escrito para un lector', 'El hospital municipal lleva tres semanas sin tomógrafo. Los estudios se derivan a 40 km.')}` },
      { label: 'La regla', color: 'amber', body: `<h2>Escríbela<br>para el que<br>no te conoce</h2><div class="divider"></div><p>Qué pasó, dónde, a quién le afecta. En las dos primeras líneas, sin sobreentendidos.</p><p><strong>El que te conoce la entiende igual. El que no, recién ahí tiene motivo para quedarse.</strong></p>` },
      { label: 'Cerrando', body: `<h2>Lee la tuya<br><span class="accent">en voz alta</span></h2><div class="divider"></div><p class="lead">Tu última publicación, solo las dos primeras líneas. ¿Se entiende sin el resto? Dime qué te pasó. 👇</p>` },
    ] },

  // ── Lun 24 — el recuento C/L ─────────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s2', file: 'lunes-recuento.html', title: 'El recuento — Lunes 24/08',
    slides: [
      { label: 'El diagnóstico', body: `<h1>En diez minutos<br>vas a saber si<br>tienes lectores<br><span class="hl">o conocidos</span></h1><p class="lead">Sin herramientas ni paneles. Tu perfil, una hoja y dos letras.</p>` },
      { label: 'Paso 01', color: 'green', body: `<h2>Abre tus<br>últimas diez<br>publicaciones</h2><div class="divider"></div><p>Las de noticias. Las de la familia no cuentan para esto.</p>` },
      { label: 'Paso 02', color: 'green', body: `<h2>Anota quién<br>comentó</h2><div class="divider"></div><p>Nombre por nombre. Sin saltearte ninguno.</p>` },
      { label: 'Paso 03', color: 'green', body: `<h2>Marca cada<br>nombre con<br>una letra</h2><div class="divider"></div>${numlist([
        { n: 'C', t: 'De <strong>círculo</strong>: familia, amigos, gente que conoces fuera de internet.' },
        { n: 'L', t: 'De <strong>lector</strong>: alguien que llegó por el tema y no conoces personalmente.' },
      ])}` },
      { label: 'Lo que vas a ver', color: 'amber', body: `<h2>Casi siempre<br>la enorme<br>mayoría son C</h2><div class="divider"></div><p>No porque publiques mal. Publicas bien, y hace años.</p><p><strong>Es porque estás publicando donde la audiencia disponible es la de tu vida.</strong></p>` },
      { label: 'Qué hacer', body: `<h2>Ese número<br>es tu punto<br>de partida</h2><div class="divider"></div><p>Aplica las cosas de esta semana durante dos semanas y vuelve a contar. Van a aparecer <strong>L</strong>. Pocos al principio, pero van a aparecer.</p><p>Si no se movió nada, vuelve al botón "compartir": en nueve de cada diez casos el problema sigue siendo ese.</p>` },
    ] },

  // ── Mié 26 — los formatos que hoy se reparten ────────────────────────────
  { folder: 'contenido/carousels/muro-s2', file: 'miercoles-formatos.html', title: 'Los formatos — Miércoles 26/08',
    slides: [
      { label: 'Con qué publicas', body: `<h1>La peor imagen<br>es la que<br><span class="hl">viene sola</span></h1><p class="lead">La miniatura que trae el enlace del otro medio. Y es la que pone todo el mundo. Hay tres que la reemplazan.</p>` },
      { label: 'Formato 01', color: 'green', body: `<h2>Una placa<br>propia</h2><div class="divider"></div><p>El titular sobre fondo liso, siempre con el mismo diseño: los mismos colores, la misma tipografía, tu nombre en una esquina.</p><p><strong>Además de mostrarse más, empieza a construir tu marca. A las semanas se reconoce sin leer quién la publicó.</strong></p>` },
      { label: 'Formato 02', color: 'green', body: `<h2>Video corto<br>cuando el tema<br>lo permite</h2><div class="divider"></div><p>Treinta a sesenta segundos con el teléfono, sin edición y sin producción.</p><p><strong>Es lo único que ninguna otra página puede copiar: tu cara contando lo que averiguaste.</strong></p>` },
      { label: 'Formato 03', color: 'green', body: `<h2>Foto propia<br>si puedes<br>pasar por ahí</h2><div class="divider"></div><p>La esquina, la fila, el cartel, la máquina que no funciona.</p><p><strong>Una foto tuya del lugar te convierte de repetidor en fuente. Y eso no se discute.</strong></p>` },
      { label: 'Lo que reemplazan', body: `<h2>Los tres<br>ocupan el<br>mismo lugar</h2><div class="divider"></div><p>El de la miniatura que viene con el enlace del otro medio: la que muestra el logo de ellos y se reparte poco.</p><p><strong>Cualquiera de los tres es mejor que esa. El peor de los tres es mejor que esa.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Cuál te<br>queda más<br><span class="accent">a mano?</span></h2><div class="divider"></div><p class="lead">Empieza por el que puedas hacer mañana sin preparar nada. Dime cuál es. 👇</p>` },
    ] },

  // ── Vie 28 — VENTA: los 5 pasos ──────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s2', file: 'viernes-cinco-pasos.html', title: 'Los 5 pasos — Viernes 28/08',
    slides: [
      { label: 'Y si quieres vivir de esto', color: 'amber', body: `<h1>Informar gratis,<br>pero mejor,<br><span class="hl">sigue siendo</span><br><span class="hl">gratis</span></h1><p class="lead">Todo lo de estas semanas hace que te vean más y mejor. Si lo que quieres es que este trabajo te pague, el camino tiene cinco pasos.</p>` },
      { label: 'Paso 01', body: `<h2>Ponle nombre<br>y foco a lo<br>que ya cubres</h2><div class="divider"></div><p>El tema del que ya compartes noticias es tu nicho. Lo elegiste sin darte cuenta.</p><p><strong>Ahora hay que declararlo.</strong></p>` },
      { label: 'Paso 02', body: `<h2>Abre tu medio<br>— ahora sí</h2><div class="divider"></div><p>Nombre, identidad y primera publicación.</p><p><strong>Con el foco ya definido, deja de ser una página vacía.</strong></p>` },
      { label: 'Pasos 03 y 04', body: `<h2>La parte<br>difícil</h2><div class="divider"></div>${numlist([
        { n: '03', t: '<strong>Muda a los que ya te leen, sin perderlos.</strong> Si este paso sale mal, empiezas de cero y abandonas al mes.' },
        { n: '04', t: '<strong>Sostén la publicación diaria sin que te coma el día.</strong> Un medio que publica salteado no se vende.' },
      ])}` },
      { label: 'Paso 05', color: 'green', body: `<h2>Cobra: tu<br>primer<br>anunciante</h2><div class="divider"></div><p>Un negocio de tu zona valora más a los lectores de su propio barrio que a un montón de seguidores sueltos de cualquier lado.</p><p><strong>Hay que saber pedirlo, y cuánto pedir.</strong></p>` },
      { label: 'El sistema', color: 'amber', body: `<h2>Esos cinco pasos,<br><span class="accent">acompañados</span></h2><div class="divider"></div><p>Son el Sistema de Ingresos Diarios: el método completo, desde ponerle nombre a lo que ya haces hasta cerrar tu primer anunciante.</p><p><strong>Pago único, acceso de por vida y garantía de 7 días. El enlace está en la biografía.</strong></p>` },
    ] },

  // ── Dom 30 — qué mira un negocio ─────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s3', file: 'domingo-que-mira-un-negocio.html', title: 'Qué mira un negocio — Domingo 30/08',
    slides: [
      { label: 'Del otro lado', body: `<h1>Lo primero<br>que mira no es<br>cuántos<br><span class="hl">te siguen</span></h1><p class="lead">Qué se pregunta de verdad un negocio de tu zona antes de decidir si te paga. Cuatro cosas, en orden.</p>` },
      { label: 'Mira 01', body: `<h2>Si le hablas<br>a su cliente</h2><div class="divider"></div><p>Lo primero que se pregunta no es a cuánta gente llegas. Es si esa gente le puede comprar a él.</p><p><strong>Lectores de su barrio le sirven. Seguidores sueltos de cualquier lado, no.</strong></p>` },
      { label: 'Mira 02', body: `<h2>Si apareces<br>siempre</h2><div class="divider"></div><p>Un negocio no paga por una publicación suelta. Paga por estar donde la gente ya mira todos los días.</p><p><strong>La constancia es lo que convierte tu espacio en un lugar, y a un lugar se le pone presupuesto.</strong></p>` },
      { label: 'Mira 03', body: `<h2>Si se entiende<br>de qué eres</h2><div class="divider"></div><p>"Publico de todo un poco" no se vende. "Cubro salud en esta ciudad" sí.</p><p><strong>Cuanto más claro es tu tema, más fácil le resulta al negocio imaginarse adentro.</strong></p>` },
      { label: 'Mira 04', body: `<h2>Si puedes<br>contarle<br>qué pasó</h2><div class="divider"></div><p>Después de publicar, poder decirle qué se movió: cuánta gente respondió, qué preguntaron, quién escribió.</p><p><strong>No hace falta un informe. Alcanza con que no tenga que preguntarte él.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Ya te<br>pidieron<br><span class="accent">difusión gratis?</span></h2><div class="divider"></div><p class="lead">Si un negocio de tu ciudad ya te escribió pidiendo un favor, ya te considera un medio. Dime si te pasó. 👇</p>` },
    ] },

  // ── Lun 31 — cierre de mes ───────────────────────────────────────────────
  { folder: 'contenido/carousels/muro-s3', file: 'lunes-vuelve-a-contar.html', title: 'Vuelve a contar — Lunes 31/08',
    slides: [
      { label: 'Cierre de agosto', body: `<h1>Vuelve<br><span class="hl">a contar</span></h1><p class="lead">Último día del mes. Si hiciste el recuento hace dos semanas, hoy toca repetirlo — y comparar.</p>` },
      { label: 'El repaso', body: `<h2>Lo que<br>vimos<br>este mes</h2><div class="divider"></div>${numlist([
        { n: '01', t: 'Los que te siguen <strong>no son los que te leen</strong>.' },
        { n: '02', t: 'El botón "compartir" te <strong>entierra</strong> y le da la marca a otro.' },
        { n: '03', t: 'La primera línea se escribe <strong>para el que no te conoce</strong>.' },
        { n: '04', t: 'La pregunta del final se responde <strong>con un dato</strong>, no con una opinión.' },
      ])}` },
      { label: 'Y también', body: `<h2>Lo demás</h2><div class="divider"></div>${numlist([
        { n: '05', t: 'Los <strong>primeros treinta minutos</strong> deciden el resto del día.' },
        { n: '06', t: 'El <strong>titular de muro</strong> dice qué le cambia al lector.' },
        { n: '07', t: 'Placa, video o foto propia: siempre <strong>mejor que la miniatura ajena</strong>.' },
      ])}` },
      { label: 'El recuento', color: 'amber', body: `<h2>Cuenta otra vez<br>las C y las L</h2><div class="divider"></div><p>Tus últimas diez publicaciones de noticias. Quién comentó, nombre por nombre, y la letra al lado.</p><p><strong>Si aparecieron L que antes no estaban, funcionó. Aunque sean pocas.</strong></p>` },
      { label: 'Lo honesto', body: `<h2>Y si no<br>se movió<br>nada</h2><div class="divider"></div><p>Casi siempre es la misma causa: seguiste tocando "compartir" en las noticias apuradas.</p><p><strong>Es la más difícil de soltar de las siete, porque es la más cómoda. Empieza por esa en septiembre.</strong></p>` },
      { label: 'Cerrando', body: `<h2>¿Cuántas L<br><span class="accent">te aparecieron?</span></h2><div class="divider"></div><p class="lead">Cuéntame abajo cómo te dio el recuento comparado con el de hace dos semanas. 👇</p>` },
    ] },
]

// ═══════════════════════ CAPTIONS ═════════════════════════════════════════════
const CAPTIONS = {
  // ── muro-s1 (Dom 16 → Sáb 22) ──
  'contenido/carousels/muro-s1|7-DOMINGO': `Tocas "compartir" y le haces prensa gratis a un medio que no te paga.

Revisas, descartas, eliges. Sabes cuál importa y cuál no merece que la gente pierda el tiempo. Ese filtro es tu oficio y te llevó años.

Pero cuando tocas "compartir", en la publicación aparece el logo de esa página. No el tuyo. El lector que se interesa los sigue a ellos.

Y encima se muestra menos: lo compartido se reparte menos que una publicación propia, porque Facebook ya mostró ese contenido y tu vez es la segunda.

Treinta segundos que salen caros. En el carrusel, la cuenta completa.

¿Cuántas de tus últimas diez son publicación tuya y cuántas son de otro? 👇`,

  'contenido/carousels/muro-s1|1-LUNES': `Publicaste la nota del año. La vio tu tía.

Cuando publicas, Facebook no se lo muestra a todos. Elige. Y para elegir usa sobre todo una señal: con quién interactuaste antes, y quién interactuó antes contigo.

En un perfil personal esa lista tiene nombre y apellido: tu familia, tus amigos, tus excompañeros de la redacción. Los que te saludaron el cumpleaños, los que comentaron la foto de tus hijos.

Entonces publicas sobre el presupuesto municipal y el sistema hace lo único que sabe hacer: se lo muestra a ellos. Tu prima comenta "qué grande", el sistema entiende que a la gente parecida a tu prima le interesa, y la próxima se la muestra a más gente parecida a tu prima.

Cada vez más lejos de quien sí quería enterarse.

No tienes un problema de alcance. Tienes un problema de a quién le está llegando.

Mira los comentarios de tu última noticia: ¿se parecen más a un saludo o a una conversación sobre el tema? 👇`,

  'contenido/carousels/muro-s1|2-MARTES': `"¿Y no debería abrirme una página primero?"

Es la pregunta correcta. Y la respuesta es sí — pero vas a llegar ahí con una ventaja que conviene no desperdiciar.

Una página es donde todo esto termina: es lo que se puede buscar, seguir, medir y vender. Un perfil personal no. Por eso, tarde o temprano, el camino pasa por ahí.

Ahora, la mayoría de los que abren una empiezan desde cero. Nombre nuevo, muro vacío y nadie del otro lado. Publican tres semanas contra el silencio y lo dejan.

Tú no estás en esa situación. Ya tienes lo que a esa gente le falta: gente que te lee todos los días y la costumbre de publicar sin que nadie te lo pida. Eso no se abre en tres minutos. Te llevó años.

Por eso el orden importa. Primero haz que lo que publicas funcione donde ya te leen. Después lo llevas a tu medio, y tu página no arranca vacía: arranca con tu gente adentro.

Al revés —abrir la página y recién ahí aprender qué funciona— es aprender delante de nadie.

Todo lo que estamos viendo estas semanas te sirve hoy en tu perfil. Y te va a servir el doble el día que tengas tu medio, porque son exactamente las mismas cosas.

¿Ya intentaste abrir una página alguna vez? Cuéntame cómo te fue. 👇`,

  'contenido/carousels/muro-s1|3-MIERCOLES': `Treinta segundos que te cuestan todos tus lectores.

Es lo que tarda tocar "compartir": ves la noticia, le agregas una línea arriba y listo. El problema es que esos treinta segundos hacen que se vea poco y con el nombre de otro.

Los cuatro pasos que lo reemplazan están en el carrusel. Te llevan tres minutos:

Publicarla con tus palabras, citar la fuente en el texto, poner una imagen propia y dejar el enlace original en el primer comentario.

No es plagiar. Es lo que hace cualquier redacción cuando levanta una noticia de otra.

Pruébalo con una sola noticia esta semana y compara cómo le fue contra la anterior. Dime qué pasó. 👇`,

  'contenido/carousels/muro-s1|4-JUEVES': `"¿Qué opinan?" es la pregunta que garantiza que te comente tu prima. Y nadie más.

Casi todos cerramos las publicaciones con una pregunta, y casi todos usamos justo esa.

Es la que trae el "qué grande". No porque tu prima esté haciendo algo mal, sino porque una pregunta de opinión solo la responde el que ya te tiene confianza. El que no te conoce no va a exponer lo que piensa delante de desconocidos.

Los comentarios pesan mucho más que un "me gusta": son la señal más fuerte de que vale la pena seguir mostrando eso. Así que la pregunta del final no es un adorno, es el motor.

Una que sirve se responde con un dato, no con una opinión.

❌ "¿Qué opinan de esto?"
✅ "¿En tu barrio también cortaron el agua hoy? Dime cuál y lo sumo al mapa."

El que responde "en Villa Elena también" no te está halagando. Te está dando información —que además mejora tu nota— y le está diciendo al sistema que este tema le importa a gente que no es de tu familia.

Y hay un efecto secundario: te obliga a preguntar algo que de verdad quieres saber. Se nota la diferencia.

Fíjate cómo terminaste tu última publicación. ¿Pediste una opinión o pediste un dato? 👇`,

  'contenido/carousels/muro-s1|5-VIERNES': `Nadie frena el dedo por "Aumento del 12% en la tarifa de agua".

Pero sí por "El agua te va a llegar 12% más cara desde el mes que viene". Es la misma noticia.

El titular de diario es para quien ya decidió informarse: entró a buscar noticias. El de muro es para alguien que venía mirando fotos de un cumpleaños y hay que hacerlo frenar.

Tres ejemplos de la misma noticia, contada de las dos maneras, en el carrusel.

El patrón: el de diario nombra el hecho, el de muro le dice al lector qué le cambia a él. Ninguno miente ni infla nada.

Escribe abajo un titular que hayas publicado esta semana y te devuelvo la versión de muro. 👇`,

  'contenido/carousels/muro-s1|6-SABADO': `Publicas y guardas el teléfono. Ahí se murió la nota.

Lo que pasa en la primera media hora define cuánto se sigue mostrando después. Si en ese rato nadie comenta ni responde nada, el sistema entiende que no interesa y deja de repartirlo. Después ya no hay forma de recuperarlo, por buena que fuera la nota.

Tres cosas cambian eso, y ninguna cuesta dinero:

Publica cuando puedas quedarte cerca. Vale más a las siete de la tarde contigo disponible que a las ocho de la mañana sin nadie del otro lado.

Responde cada comentario dentro de la primera media hora, y que la respuesta agregue algo. "Gracias" no es una conversación; "sí, y además el municipio confirmó que…" sí lo es.

Si alguien aporta un dato, súbelo a la publicación: "Actualizo: en Villa Elena también, me avisa Marta". El que aportó vuelve a mirar, los demás ven que acá pasan cosas, y tu nota mejoró de verdad.

Esa media hora no es tiempo extra: es la misma publicación, trabajada cuando todavía sirve trabajarla.

¿A qué hora sueles publicar? Y más importante: ¿estás ahí cuando lo haces? 👇`,

  // ── muro-s2 (Dom 23 → Sáb 29) ──
  'contenido/carousels/muro-s2|7-DOMINGO': `Te leen dos líneas. Y las estás regalando.

El feed corta ahí: lo que pongas arriba decide si alguien sigue leyendo o sigue de largo.

El error más común es dar por sabido el contexto: "otra vez lo mismo en la esquina de siempre" lo entiende tu vecino, y nadie más.

El otro error es escribir para que compartan en vez de para que lean: "Miren esto 😱" no informa nada, así que el que no sabe de qué se trata no tiene por qué frenar.

El antes y el después de la misma noticia, en el carrusel.

Lee las dos primeras líneas de tu última publicación en voz alta. ¿Se entiende sin el resto? 👇`,

  'contenido/carousels/muro-s2|1-LUNES': `En diez minutos vas a saber si tienes lectores o conocidos.

Sin herramientas ni paneles. Tu perfil, una hoja y dos letras.

Abre tus últimas diez publicaciones de noticias. Anota quién comentó, nombre por nombre. Marca cada nombre con una letra: C de círculo (familia, amigos, gente que conoces fuera de internet) y L de lector (alguien que llegó por el tema y no conoces personalmente).

Cuenta.

Casi siempre la enorme mayoría son C. No porque publiques mal: publicas bien, y hace años. Es porque estás publicando donde la audiencia disponible es la de tu vida.

Ese número es tu punto de partida. Aplica las cosas de estas dos semanas y vuelve a contar a fin de mes.

El paso a paso está en el carrusel. Si te animas, dime cómo te dio. 👇`,

  'contenido/carousels/muro-s2|2-MARTES': `Ya te escribieron. "¿Me compartes esto?"

El gimnasio que abrió, la veterinaria de la esquina, el que organiza la feria. Te piden difusión porque saben que la gente de la ciudad te lee. Y tú la das, porque sale natural y porque no está mal ayudar.

Pero fíjate lo que acaba de pasar: ese negocio ya te trata como un medio. Ya te reconoce audiencia. Lo único que no hace es pagarte.

Y no es que sea aprovechado. Es que nadie —ni él ni tú— puso el tema sobre la mesa. Él pidió un favor porque no sabía que se podía pedir otra cosa. Tú dijiste que sí porque no sabías cuánto cobrar, ni con qué argumento, ni cómo pasar del favor al presupuesto sin quedar como el que le cobra a un conocido.

Así que la difusión sigue siendo gratis por costumbre, no por decisión.

Lo incómodo es que ese pedido es, en realidad, la mejor noticia que te dieron en meses: significa que ya tienes lo más difícil de conseguir, que es que confíen en tu llegada. Lo que falta es lo más fácil de aprender, que es qué responder.

¿A ti ya te pidieron difusión gratis? Cuéntame qué contestaste. 👇`,

  'contenido/carousels/muro-s2|3-MIERCOLES': `La peor imagen que puedes poner es la que viene sola.

La miniatura que trae el enlace del otro medio. Y es la que pone todo el mundo.

Lleva la marca de ellos y se reparte poco. Hay tres formatos que ocupan ese mismo lugar y funcionan mejor: una placa propia con el titular, un video corto con el teléfono, o una foto tuya del lugar.

Los tres, con para qué sirve cada uno, en el carrusel.

El peor de los tres es mejor que la miniatura ajena.

¿Cuál te queda más a mano para mañana? 👇`,

  'contenido/carousels/muro-s2|4-JUEVES': `"Once años publicando para mis conocidos."

Eso me escribió un periodista al día siguiente de hacer el recuento de las C y las L.

Cubre temas municipales en una ciudad del interior. Hace once años que publica noticias en su perfil, todos los días, sin faltar.

Hizo lo que decía el ejercicio: sus últimas diez publicaciones de noticias, los nombres de todos los que comentaron, y al lado la letra. C de círculo, L de lector.

Le dieron casi todas C.

"Once años", me puso. "Once años publicando para mis conocidos."

Le contesté que no había perdido once años: había construido la costumbre de publicar todos los días, que es lo que casi nadie tiene y no se compra. Lo que estaba mal no era el trabajo, era el lugar donde lo estaba dejando.

Empezó por lo más incómodo, que era dejar de tocar "compartir". Reescribir la noticia con sus palabras, la fuente citada en el texto, el enlace en el primer comentario.

A las dos semanas volvió a contar. Aparecieron tres L. Tres nombres que no conocía, que llegaron por el tema.

Me dijo que hacía años que no se ponía contento con un número tan chico.

Si haces el recuento, cuéntame cómo te dio. 👇`,

  'contenido/carousels/muro-s2|5-VIERNES': `Todo lo de estas semanas hace que te vean más y mejor. Pero informar gratis, mejor que antes, sigue siendo gratis.

Si lo que quieres es que este trabajo te pague, el camino tiene cinco pasos y este es el orden. No es opinión: es el orden en que funciona.

Ponerle nombre y foco a lo que ya cubres. Abrir tu medio. Mudar a los que ya te leen sin perderlos. Sostener la publicación diaria sin que te coma el día. Y cobrar: tu primer anunciante.

Los cinco, uno por uno, en el carrusel.

Esos cinco pasos acompañados son el Sistema de Ingresos Diarios: pago único, acceso de por vida y garantía de 7 días. El enlace está en la biografía.`,

  'contenido/carousels/muro-s2|6-SABADO': `El miedo no es al trabajo. Es a perder lo que ya tienes.

Es lo que frena a casi todos los periodistas que ya publican y podrían tener algo propio. No es pereza ni falta de ideas: es que abrir un lugar nuevo se siente como abandonar el que funciona.

Y el miedo tiene una parte de razón. Lo que construiste no es poco: gente que espera tus publicaciones, que te escribe cuando pasa algo, que te reconoce en la calle. Nadie quiere cambiar eso por un muro vacío.

Pero fíjate cómo está planteada la elección: o esto, o aquello. Y no es así.

Lo que ya tienes no se pierde por armar algo aparte. Se pierde por otras razones, y ninguna tiene que ver con haber empezado algo propio. Lo que sí puede pasar —y pasa seguido— es hacerlo en el orden equivocado: abrir el lugar nuevo primero, publicar ahí contra el silencio, y dejarlo a las tres semanas.

Por eso el orden es al revés. Primero que funcione donde ya te leen. Después el lugar propio, con esa gente adentro.

No es saltar al vacío. Es mudarse con las cosas.

¿Qué es lo que más te costaría dejar atrás? Cuéntame abajo. 👇`,

  // ── muro-s3 (Dom 30 → Lun 31) ──
  'contenido/carousels/muro-s3|7-DOMINGO': `Lo primero que mira un negocio antes de pagarte no es cuántos te siguen.

Eso es lo que casi todos creen, y por eso muchos esperan a "tener suficiente" para animarse a cobrar.

Lo primero que se pregunta es si esa gente le puede comprar a él. Después, si apareces siempre. Después, si se entiende de qué eres. Y por último, si vas a poder contarle qué pasó cuando la publicación salga.

Las cuatro, en orden, en el carrusel.

Si un negocio de tu ciudad ya te escribió pidiendo un favor, ya te considera un medio. ¿Te pasó? 👇`,

  'contenido/carousels/muro-s3|1-LUNES': `Último día de agosto. Si hiciste el recuento de las C y las L hace dos semanas, hoy toca repetirlo.

Tus últimas diez publicaciones de noticias, quién comentó, la letra al lado. Y comparar.

Si aparecieron L que antes no estaban, funcionó. Aunque sean pocas: los primeros lectores que llegan por el tema son siempre pocos, y son la señal de que el resto viene.

Y si no se movió nada, casi siempre es la misma causa: seguiste tocando "compartir" en las noticias apuradas. Es la más difícil de soltar de todas, porque es la más cómoda.

En el carrusel, el repaso de todo lo que vimos este mes, para que lo tengas en un solo lugar.

¿Cuántas L te aparecieron? Cuéntame cómo te dio comparado con el recuento anterior. 👇`,
}

// ═══════════════════════ ESCRITURA ════════════════════════════════════════════
let nCap = 0
for (const [key, text] of Object.entries(CAPTIONS)) {
  const [folder, subdir] = key.split('|')
  const dir = resolve(join(folder, 'para-subir', subdir))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'pie-de-foto.txt'), text.trim() + '\n', 'utf-8')
  nCap++
}
console.log(`✅ ${nCap} captions escritas`)

let nHtml = 0
for (const c of CAROUSELS) {
  const dir = resolve(c.folder)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, c.file), buildHTML(c.title, c.slides), 'utf-8')
  nHtml++
  console.log(`   📄 ${c.folder}/${c.file} (${c.slides.length} slides)`)
}
console.log(`✅ ${nHtml} carruseles HTML generados`)
console.log('\nSiguiente: node scripts/exportar/export-slides-auto.mjs carousels/muro-s1 (s2, s3)')
