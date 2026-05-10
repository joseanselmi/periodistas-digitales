/**
 * carousel-generator.mjs — Genera carruseles de texto para Instagram/Facebook
 * Crea archivos HTML listos para capturar pantalla slide por slide.
 * Uso: node carousel-generator.mjs
 * Variables: ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { BRAND } from './lib/brand-context.mjs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Falta ANTHROPIC_API_KEY'); process.exit(1)
}

// ─── Plantilla HTML base ──────────────────────────────────────────────────────

function slideCSS() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #080810; font-family: 'Inter', system-ui, sans-serif; }

    .carousel { display: flex; flex-direction: column; gap: 32px; padding: 32px; max-width: 1200px; margin: 0 auto; }
    .carousel-title { color: #64748b; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 8px; }

    .slide {
      width: 1080px; height: 1080px;
      background: #07070f;
      border-radius: 4px;
      display: flex; flex-direction: column;
      justify-content: center; align-items: flex-start;
      padding: 80px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.06);
    }

    /* Glow de fondo */
    .slide::before {
      content: '';
      position: absolute;
      top: -200px; left: -200px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Línea de acento izquierda */
    .slide::after {
      content: '';
      position: absolute;
      left: 0; top: 80px; bottom: 80px;
      width: 3px;
      background: linear-gradient(180deg, #6366f1, #22d3ee);
      border-radius: 0 2px 2px 0;
    }

    /* Variantes de fondo */
    .slide.dark-violet::before { background: radial-gradient(circle, rgba(124,58,237,.2) 0%, transparent 70%); }
    .slide.dark-cyan::before   { background: radial-gradient(circle, rgba(34,211,238,.12) 0%, transparent 70%); }
    .slide.dark-amber::before  { background: radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%); }
    .slide.dark-red::before    { background: radial-gradient(circle, rgba(239,68,68,.1) 0%, transparent 70%); }

    /* Número de slide */
    .slide-num {
      position: absolute;
      bottom: 48px; right: 60px;
      font-size: 13px;
      color: rgba(255,255,255,.2);
      font-weight: 500;
      letter-spacing: .05em;
    }

    /* Logo/marca */
    .brand {
      position: absolute;
      top: 48px; right: 60px;
      font-size: 12px;
      color: rgba(255,255,255,.25);
      letter-spacing: .08em;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* Eyebrow */
    .eyebrow {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #6366f1;
      margin-bottom: 24px;
    }
    .eyebrow.cyan  { color: #22d3ee; }
    .eyebrow.amber { color: #f59e0b; }
    .eyebrow.green { color: #22c55e; }
    .eyebrow.red   { color: #ef4444; }

    /* Headline */
    .headline {
      font-size: 68px;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1.05;
      letter-spacing: -.03em;
      margin-bottom: 32px;
      max-width: 880px;
    }
    .headline .accent {
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .headline .accent-amber {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .headline.large  { font-size: 80px; }
    .headline.medium { font-size: 56px; }
    .headline.small  { font-size: 44px; }

    /* Body text */
    .body {
      font-size: 28px;
      color: #94a3b8;
      line-height: 1.6;
      max-width: 860px;
      margin-bottom: 40px;
    }
    .body strong { color: #f1f5f9; font-weight: 600; }
    .body.large  { font-size: 34px; }
    .body.small  { font-size: 24px; }

    /* Lista */
    .list { list-style: none; margin-bottom: 40px; display: flex; flex-direction: column; gap: 20px; }
    .list li {
      display: flex; align-items: flex-start; gap: 16px;
      font-size: 26px; color: #94a3b8; line-height: 1.4;
    }
    .list li .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #6366f1; flex-shrink: 0; margin-top: 10px;
    }
    .list li .dot.cyan  { background: #22d3ee; }
    .list li .dot.amber { background: #f59e0b; }
    .list li strong { color: #f1f5f9; }

    /* Prompt box */
    .prompt-box {
      background: rgba(99,102,241,.08);
      border: 1px solid rgba(99,102,241,.25);
      border-radius: 16px;
      padding: 32px 40px;
      font-family: 'Courier New', monospace;
      font-size: 22px;
      color: #c4b5fd;
      line-height: 1.7;
      max-width: 900px;
      margin-bottom: 32px;
      width: 100%;
    }
    .prompt-box .placeholder { color: #6366f1; font-weight: 700; }

    /* Stat grande */
    .stat { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
    .stat .num {
      font-size: 120px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -.05em;
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat .unit { font-size: 40px; color: #64748b; font-weight: 600; }

    /* Quote */
    .quote {
      font-size: 40px;
      font-style: italic;
      color: #f1f5f9;
      line-height: 1.4;
      max-width: 880px;
      margin-bottom: 24px;
      position: relative;
    }
    .quote::before {
      content: '"';
      font-size: 120px;
      color: #6366f1;
      position: absolute;
      top: -40px; left: -20px;
      line-height: 1;
      opacity: .4;
    }

    /* CTA */
    .cta {
      display: inline-flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      font-size: 22px;
      font-weight: 700;
      padding: 18px 36px;
      border-radius: 100px;
      letter-spacing: -.01em;
    }

    /* Mito/Verdad */
    .myth-tag {
      display: inline-block;
      background: rgba(239,68,68,.15);
      border: 1px solid rgba(239,68,68,.3);
      color: #ef4444;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 24px;
    }
    .truth-tag {
      display: inline-block;
      background: rgba(34,197,94,.15);
      border: 1px solid rgba(34,197,94,.3);
      color: #22c55e;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 24px;
    }

    /* Divider */
    .divider {
      width: 60px; height: 3px;
      background: linear-gradient(90deg, #6366f1, #22d3ee);
      border-radius: 2px;
      margin-bottom: 32px;
    }

    /* Swipe hint */
    .swipe {
      position: absolute;
      bottom: 48px; left: 80px;
      font-size: 13px;
      color: rgba(255,255,255,.2);
      display: flex; align-items: center; gap: 8px;
    }
    .swipe::after { content: '→'; }
  `
}

function wrapHTML(title, slides) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${slideCSS()}</style>
</head>
<body>
<div class="carousel">
  <p class="carousel-title">${title} — ${slides.length} slides · 1080×1080px · Capturá cada slide por separado</p>
  ${slides.map((s, i) => `
  <div class="slide ${s.bg || ''}">
    <span class="brand">@periodistasdelfuturo</span>
    ${s.html}
    <span class="slide-num">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
    ${i < slides.length - 1 ? '<span class="swipe">Deslizá</span>' : ''}
  </div>`).join('\n')}
</div>
</body>
</html>`
}

// ─── Carruseles prediseñados ──────────────────────────────────────────────────

const CAROUSELS = [

  // 1. PROMPT COPIABLE — IA para periodistas
  {
    id: '01-prompt-ia',
    title: 'Prompt copiable — IA para periodistas',
    generateSlides: async () => [
      {
        bg: 'dark-violet',
        html: `
          <div class="eyebrow">Tip de IA para periodistas</div>
          <h2 class="headline large">¿Empezás cada nota<br>con la hoja<br><span class="accent">en blanco?</span></h2>
          <div class="swipe" style="position:relative;bottom:auto;left:auto;margin-top:0;color:rgba(255,255,255,.35)">Copiá el prompt en el slide siguiente →</div>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow cyan">El prompt</div>
          <div class="prompt-box">
"Actuá como periodista especializado en <span class="placeholder">[tu tema]</span>.<br>
Necesito cubrir <span class="placeholder">[el hecho o evento]</span>.<br><br>
Generame:<br>
1) Un titular con gancho para Instagram<br>
2) Un lead noticioso de 3 líneas<br>
3) Las 5 preguntas clave que no pueden faltar"
          </div>
          <p class="body small">Reemplazá los <strong>[corchetes]</strong> con tu tema y tu nota. Listo en 30 segundos.</p>
        `
      },
      {
        bg: 'dark-cyan',
        html: `
          <div class="eyebrow cyan">Cómo usarlo</div>
          <ul class="list">
            <li><span class="dot cyan"></span><span>Abrí ChatGPT, Gemini o Claude</span></li>
            <li><span class="dot cyan"></span><span>Pegá el prompt con <strong>tu tema real</strong></span></li>
            <li><span class="dot cyan"></span><span>Usá la estructura que te da — añadí <strong>tu fuente y criterio</strong></span></li>
            <li><span class="dot cyan"></span><span>La nota sale en minutos, no horas</span></li>
          </ul>
          <p class="body small" style="color:#64748b">La IA no reemplaza tu ojo periodístico. <strong>Te saca el trabajo de arrancar.</strong></p>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">¿Querés más prompts así?</div>
          <h2 class="headline medium">El sistema incluye<br><span class="accent">+50 prompts</span><br>para periodistas.</h2>
          <p class="body">Investigación, titulares, entrevistas, cobertura en vivo — todos copiables y adaptables a tu trabajo.</p>
          <div class="cta">Ver el sistema completo · $17 USD</div>
        `
      },
    ]
  },

  // 2. MITO VS VERDAD — La IA va a reemplazarte
  {
    id: '02-mito-verdad',
    title: 'Mito vs. Verdad — La IA y el periodismo',
    generateSlides: async () => [
      {
        bg: 'dark-red',
        html: `
          <div class="eyebrow red">Mito</div>
          <h2 class="headline">"La IA va a<br>reemplazar a<br><span class="accent">los periodistas."</span></h2>
          <p class="body" style="margin-top:8px">Lo escuchás en todos lados. Te voy a decir lo que realmente está pasando. →</p>
        `
      },
      {
        bg: '',
        html: `
          <div class="truth-tag">La verdad</div>
          <h2 class="headline medium">La IA no reemplaza<br>periodistas.</h2>
          <div class="divider"></div>
          <p class="body">Reemplaza a los periodistas que <strong>no saben usarla.</strong><br><br>La diferencia no es la herramienta. Es quién la tiene en la mano.</p>
        `
      },
      {
        bg: 'dark-violet',
        html: `
          <div class="eyebrow">Lo que sí está pasando</div>
          <ul class="list">
            <li><span class="dot"></span><span>Redacciones que <strong>reducen equipo</strong> y exigen más producción con menos gente</span></li>
            <li><span class="dot"></span><span>Periodistas independientes que <strong>publican 3x más</strong> usando IA</span></li>
            <li><span class="dot"></span><span>Medios digitales que crecen porque <strong>uno solo puede hacer el trabajo de cinco</strong></span></li>
          </ul>
        `
      },
      {
        bg: 'dark-cyan',
        html: `
          <div class="eyebrow cyan">Lo que esto significa para vos</div>
          <h2 class="headline medium">No necesitás<br>temer a la IA.</h2>
          <div class="divider" style="background:linear-gradient(90deg,#22d3ee,#6366f1)"></div>
          <p class="body">Necesitás aprenderla antes de que sea obligatorio.<br>Cuando todos la usen, <strong>ya no será una ventaja.</strong></p>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">El siguiente paso</div>
          <h2 class="headline medium">+5.500 periodistas<br>ya tomaron la<br><span class="accent">delantera.</span></h2>
          <p class="body">Sistema de Ingresos Diarios para Periodistas — incluye micro curso de IA aplicada a tu trabajo real.</p>
          <div class="cta" style="margin-top:8px">Link en bio · $17 USD</div>
        `
      },
    ]
  },

  // 3. PROBLEMA CONSCIENTE — El piso se mueve
  {
    id: '03-problema',
    title: 'El piso se mueve — activación de dolor',
    generateSlides: async () => [
      {
        bg: 'dark-red',
        html: `
          <div class="eyebrow red">Para periodistas</div>
          <h2 class="headline">¿Cuántos años<br>llevás trabajando<br>para <span class="accent">otros?</span></h2>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">La realidad del sector</div>
          <ul class="list">
            <li><span class="dot" style="background:#ef4444"></span><span>Los medios siguen <strong>reduciendo equipos</strong> en toda LATAM</span></li>
            <li><span class="dot" style="background:#ef4444"></span><span>El sueldo promedio del periodista no cubre el costo de vida en <strong>Colombia, México ni Ecuador</strong></span></li>
            <li><span class="dot" style="background:#ef4444"></span><span>Una sola decisión de arriba puede <strong>cambiar todo</strong> sin que vos tengas voz</span></li>
          </ul>
        `
      },
      {
        bg: 'dark-violet',
        html: `
          <div class="eyebrow">La pregunta que nadie hace en voz alta</div>
          <div class="quote" style="padding-left:20px;margin-top:40px">Si esto se termina mañana... ¿tengo algo propio?</div>
          <p class="body" style="margin-top:40px">La mayoría de periodistas no tiene respuesta. <strong>Todavía.</strong></p>
        `
      },
      {
        bg: 'dark-cyan',
        html: `
          <div class="eyebrow cyan">Hay una salida</div>
          <h2 class="headline medium">Tu experiencia<br>periodística vale<br><span class="accent">más de lo que te pagan.</span></h2>
          <div class="divider" style="background:linear-gradient(90deg,#22d3ee,#6366f1)"></div>
          <p class="body small">Solo falta el sistema para cobrarlo como se merece.</p>
        `
      },
      {
        bg: '',
        html: `
          <div class="stat"><span class="num">5.5K</span><span class="unit">periodistas</span></div>
          <p class="body">ya crearon su propio medio digital sin dejar su trabajo actual.</p>
          <p class="body small" style="margin-top:0;color:#64748b">Por $17 USD podés ser el próximo. <strong>Link en bio.</strong></p>
        `
      },
    ]
  },

  // 4. PRUEBA SOCIAL — Resultado de alumno
  {
    id: '04-prueba-social',
    title: 'Prueba social — resultado de alumno',
    generateSlides: async () => [
      {
        bg: 'dark-violet',
        html: `
          <div class="eyebrow">Caso real</div>
          <div class="quote" style="font-size:36px;margin-top:20px;padding-left:20px">"Llevaba 12 años trabajando para medios ajenos. Hoy tengo mi propio periódico digital."</div>
          <p class="body small" style="margin-top:32px;color:#64748b">— María G., periodista · Quito, Ecuador</p>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">Su historia</div>
          <ul class="list">
            <li><span class="dot"></span><span>12 años en medios tradicionales en Ecuador</span></li>
            <li><span class="dot"></span><span>Empezó el sistema sin saber de tecnología</span></li>
            <li><span class="dot"></span><span>Lanzó <strong>El Diario Independiente</strong> en 19 días</span></li>
            <li><span class="dot"></span><span>Primer ingreso propio: <strong>$80 de publicidad local</strong> en el mes 1</span></li>
          </ul>
        `
      },
      {
        bg: 'dark-cyan',
        html: `
          <div class="eyebrow cyan">El número que importa</div>
          <div class="stat"><span class="num" style="background:linear-gradient(135deg,#22d3ee,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">19</span><span class="unit">días</span></div>
          <p class="body">de su primera clase a su primer artículo publicado.<br><strong>Sin conocimientos técnicos previos.</strong></p>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">¿Qué usó?</div>
          <h2 class="headline medium">El mismo sistema<br>que está disponible<br>por <span class="accent">$17 USD.</span></h2>
          <p class="body small" style="color:#64748b">5.500 periodistas en 50 países ya lo usaron.<br><strong>Acceso inmediato · Garantía 7 días · Link en bio</strong></p>
        `
      },
    ]
  },

  // 5. EDUCATIVO — Cómo monetizar tu periódico digital
  {
    id: '05-monetizacion',
    title: 'Cómo monetizar tu periódico digital',
    generateSlides: async () => [
      {
        bg: 'dark-amber',
        html: `
          <div class="eyebrow amber">Para periodistas independientes</div>
          <h2 class="headline">3 formas reales<br>de ganar dinero<br>con tu <span class="accent-amber">medio digital.</span></h2>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow">01 / Publicidad local</div>
          <h2 class="headline medium" style="margin-bottom:24px">El negocio que nadie ve.</h2>
          <p class="body">Las pymes de tu ciudad necesitan llegar a lectores locales. <strong>Vos tenés esa audiencia.</strong><br><br>Una empresa local en Ecuador paga entre <strong>$50 y $300/mes</strong> por aparecer en un medio de nicho con lectores reales.</p>
        `
      },
      {
        bg: 'dark-violet',
        html: `
          <div class="eyebrow">02 / Suscripciones</div>
          <h2 class="headline medium" style="margin-bottom:24px">El ingreso mensual predecible.</h2>
          <p class="body">Contenido premium para tu comunidad más comprometida.<br><br><strong>100 suscriptores a $5/mes = $500 fijos.</strong><br>Sin jefes. Sin dependencia.</p>
        `
      },
      {
        bg: 'dark-cyan',
        html: `
          <div class="eyebrow cyan">03 / Marcas aliadas</div>
          <h2 class="headline medium" style="margin-bottom:24px">Cuando tu audiencia<br>es tu activo.</h2>
          <p class="body">Marcas que quieren llegar a tu nicho específico pagan por contenido patrocinado.<br><br>No necesitás <strong>100.000 seguidores</strong>. Necesitás <strong>la audiencia correcta.</strong></p>
        `
      },
      {
        bg: '',
        html: `
          <div class="eyebrow amber">El sistema completo</div>
          <h2 class="headline medium">Aprende las <span class="accent">3 fuentes</span><br>en el Módulo 4.</h2>
          <div class="divider" style="background:linear-gradient(90deg,#f59e0b,#6366f1)"></div>
          <p class="body small" style="color:#94a3b8">Sistema de Ingresos Diarios para Periodistas · <strong>$17 USD · Link en bio</strong></p>
        `
      },
    ]
  },

]

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n🎨 CAROUSEL GENERATOR')
console.log(`   Generando ${CAROUSELS.length} carruseles...\n`)

const today  = new Date().toISOString().slice(0, 10)
const outDir = `carousels/${today}`
mkdirSync(outDir, { recursive: true })

for (const carousel of CAROUSELS) {
  process.stdout.write(`  ${carousel.id} — ${carousel.title}...`)

  const slides = await carousel.generateSlides()
  const html   = wrapHTML(carousel.title, slides)
  const path   = `${outDir}/${carousel.id}.html`
  writeFileSync(path, html)

  console.log(` ✅ (${slides.length} slides)`)
}

console.log('\n' + '═'.repeat(60))
console.log('CARRUSELES GENERADOS')
console.log('═'.repeat(60))
console.log(`📁 Carpeta: ${outDir}/`)
console.log()
console.log('👉 Cómo usar:')
console.log('   1. Abrí cada .html en Chrome')
console.log('   2. Zoom al 100%')
console.log('   3. Capturá cada slide con snipping tool (Win+Shift+S)')
console.log('   4. Subí las capturas a Meta Business Suite como carrusel')
console.log()
console.log('💡 Cada slide mide 1080×1080px — perfecto para Instagram')
