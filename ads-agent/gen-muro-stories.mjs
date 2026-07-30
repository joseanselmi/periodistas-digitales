/**
 * gen-muro-stories.mjs — Stories verticales (1080×1920) de la serie "el periodista del muro"
 *
 * Una story por día, con el gancho del posteo de ese día. La story NO reemplaza al
 * posteo: lo empuja. Se ve tres segundos, así que lleva una sola idea y nada más.
 *
 * Uso: node gen-muro-stories.mjs   →   node export-stories.mjs
 * Publicar: node --env-file=.env.local post-story.mjs [YYYY-MM-DD]
 *
 * ⚠️ Las stories de página NO se pueden programar (la API las publica al instante).
 *    Por eso post-story.mjs publica la del día y hay que dispararlo a diario.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

const OUT = 'carousels/muro-stories'

const HEAD = (title) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
.story {
  width:1080px; height:1920px; background:#07070f;
  display:flex; flex-direction:column; justify-content:space-between;
  padding:150px 90px 130px; position:relative; overflow:hidden;
}
/* halo indigo arriba y un segundo foco cyan abajo: da profundidad en vertical */
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
.cta {
  align-self:flex-start;
  font-size:31px; font-weight:800; color:#07070f;
  background:linear-gradient(135deg,#6366f1,#22d3ee);
  padding:26px 46px; border-radius:100px; letter-spacing:-.01em;
}
.brand { font-size:24px; color:rgba(255,255,255,.3); letter-spacing:.1em; text-transform:uppercase; font-weight:700; }
</style>
</head>
<body>`

const FOOT = `</body></html>`

const build = (s) => `${HEAD(s.title)}
<div class="story">
  <div class="bar"></div>
  <div class="top"><div class="eyebrow">${s.eyebrow}</div></div>
  <div class="mid">
    <h1>${s.hook}</h1>
    <div class="rule"></div>
    <div class="sub">${s.sub}</div>
  </div>
  <div class="bottom">
    <div class="cta">${s.cta}</div>
    <div class="brand">@periodistasdelfuturo</div>
  </div>
</div>
${FOOT}`

// Una por día. El gancho es el mismo del posteo — la story lo empuja, no lo repite entero.
const STORIES = [
  { date: '2026-08-16', title: 'Story 16/08', eyebrow: 'El punto ciego',
    hook: `Compartes.<br>Y el nombre<br>que se ve<br><span class="accent">no es el tuyo</span>`,
    sub: `Le estás haciendo prensa gratis a un medio que <strong>no te paga</strong>.`,
    cta: 'El posteo de hoy →' },

  { date: '2026-08-17', title: 'Story 17/08', eyebrow: 'Por qué pasa',
    hook: `Publicaste<br>la nota del año.<br><span class="accent">La vio tu tía</span>`,
    sub: `No es mala suerte. Es <strong>a quién le está llegando</strong>.`,
    cta: 'Te explico por qué →' },

  { date: '2026-08-18', title: 'Story 18/08', eyebrow: 'La pregunta correcta',
    hook: `"¿No debería<br>abrirme una<br><span class="accent">página primero?</span>"`,
    sub: `Sí. Pero no todavía — y por una razón que casi nadie te dice.`,
    cta: 'La respuesta, abajo →' },

  { date: '2026-08-19', title: 'Story 19/08', eyebrow: 'Empieza por acá',
    hook: `Treinta<br>segundos que<br>te cuestan<br><span class="accent">tus lectores</span>`,
    sub: `Lo que tarda tocar "compartir". Reemplazarlo tarda <strong>tres minutos</strong>.`,
    cta: 'Los 4 pasos →' },

  { date: '2026-08-20', title: 'Story 20/08', eyebrow: 'El final del posteo',
    hook: `"¿Qué opinan?"<br>es la pregunta<br>que te comenta<br><span class="accent">tu prima</span>`,
    sub: `Una que sirve se responde <strong>con un dato</strong>, no con una opinión.`,
    cta: 'La diferencia →' },

  { date: '2026-08-21', title: 'Story 21/08', eyebrow: 'Tu trabajo principal',
    hook: `Nadie frena<br>el dedo por<br>un titular<br><span class="accent">de diario</span>`,
    sub: `Tu lector venía mirando fotos de un cumpleaños. Hay que hacerlo parar.`,
    cta: '5 ejemplos →' },

  { date: '2026-08-22', title: 'Story 22/08', eyebrow: 'La media hora que decide',
    hook: `Publicas y<br>guardas el<br>teléfono.<br><span class="accent">Ahí se murió</span>`,
    sub: `Los primeros treinta minutos definen cuánto se muestra <strong>el resto del día</strong>.`,
    cta: 'Qué hacer en ese rato →' },

  { date: '2026-08-23', title: 'Story 23/08', eyebrow: 'Cómo lo escribes',
    hook: `Te leen<br>dos líneas.<br><span class="accent">Y las estás<br>regalando</span>`,
    sub: `El feed corta ahí. Lo que pongas arriba decide si siguen leyendo.`,
    cta: 'El antes y después →' },

  { date: '2026-08-24', title: 'Story 24/08', eyebrow: 'El diagnóstico',
    hook: `En diez minutos<br>vas a saber<br>si tienes lectores<br><span class="accent">o conocidos</span>`,
    sub: `Sin herramientas. Tu perfil, una hoja y <strong>dos letras</strong>.`,
    cta: 'Hacé el recuento →' },

  { date: '2026-08-25', title: 'Story 25/08', eyebrow: 'Lo que no te dicen',
    hook: `Ya te tratan<br>como un medio.<br>Lo único que<br><span class="accent">no hacen<br>es pagarte</span>`,
    sub: `"¿Me compartes esto?" es un pedido de <strong>publicidad</strong> sin presupuesto.`,
    cta: 'Por qué pasa →' },

  { date: '2026-08-26', title: 'Story 26/08', eyebrow: 'Con qué publicas',
    hook: `La peor<br>imagen es<br>la que<br><span class="accent">viene sola</span>`,
    sub: `La miniatura del enlace ajeno. Y es la que pone <strong>todo el mundo</strong>.`,
    cta: 'Las 3 que la reemplazan →' },

  { date: '2026-08-27', title: 'Story 27/08', eyebrow: 'Una historia',
    hook: `"Once años<br>publicando<br>para mis<br><span class="accent">conocidos</span>"`,
    sub: `Lo que me escribió un periodista al día siguiente de hacer el recuento.`,
    cta: 'Cómo siguió →' },

  { date: '2026-08-28', title: 'Story 28/08', eyebrow: 'Y si quieres vivir de esto',
    hook: `Informar gratis,<br>pero mejor,<br><span class="accent">sigue siendo<br>gratis</span>`,
    sub: `El camino para que este trabajo te pague tiene <strong>cinco pasos</strong>.`,
    cta: 'Los 5 pasos →' },

  { date: '2026-08-29', title: 'Story 29/08', eyebrow: 'Lo que de verdad frena',
    hook: `No te frena<br>el trabajo.<br>Te frena<br><span class="accent">perder lo<br>que ya tienes</span>`,
    sub: `Y esa elección está mal planteada. No es <strong>o esto o aquello</strong>.`,
    cta: 'Por qué →' },

  { date: '2026-08-30', title: 'Story 30/08', eyebrow: 'Del otro lado',
    hook: `Lo primero<br>que mira<br>no es cuántos<br><span class="accent">te siguen</span>`,
    sub: `Qué se pregunta de verdad un negocio antes de decidir si te paga.`,
    cta: 'Las 4 cosas →' },

  { date: '2026-08-31', title: 'Story 31/08', eyebrow: 'Cierre de agosto',
    hook: `Vuelve<br>a contar`,
    sub: `Si hiciste el recuento hace dos semanas, hoy toca repetirlo — <strong>y comparar</strong>.`,
    cta: 'El repaso del mes →' },
]

mkdirSync(resolve(OUT), { recursive: true })
for (const s of STORIES) {
  writeFileSync(join(resolve(OUT), `${s.date}.html`), build(s), 'utf-8')
  console.log(`   📄 ${OUT}/${s.date}.html`)
}
console.log(`\n✅ ${STORIES.length} stories generadas (1080×1920)`)
console.log('Siguiente: node export-stories.mjs')
