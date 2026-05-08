import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const BRAND_CONTEXT = `
PRODUCTO: Sistema de Ingresos Diarios para Periodistas
PRECIO: $17 USD (valor percibido $227)
AUDIENCIA: Periodistas latinoamericanos 30-55 años, Colombia y México principalmente
PROPUESTA DE VALOR: Crear un periódico digital con IA y generar ingresos reales sin dejar el trabajo actual
ESTÉTICA DE MARCA: Oscura, moderna, tecnológica, profesional. NO stock photos genéricos, NO dinero en efectivo
PLATAFORMA: Meta Ads (Facebook e Instagram)
OBJETIVO: Tráfico frío → conversión directa a $17

NIVELES DE CONSCIENCIA:
- NIVEL 1 (problema): Activa el miedo al desplazamiento laboral
- NIVEL 2 (solución): Muestra el sistema y resultado concreto
- NIVEL 3 (precio/urgencia): Precio vs valor, prueba social

REGLAS META ADS:
- Sin claims de ingresos garantizados
- Sin "hacerse rico rápido"
- Sin imágenes de dinero en efectivo
- Texto en imagen < 20% del área
- Sin before/after si implica resultados extremos
`

async function reviewAd({ imageUrl, primaryText, headline, cta, awarenessLevel, adSet }) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`REVISANDO: ${adSet} | Nivel ${awarenessLevel}`)
  console.log('='.repeat(60))

  // Fetch image as base64
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  const mediaType = 'image/jpeg'

  const prompt = `Eres un experto en Meta Ads para infoproductos en Latinoamérica.
Revisá este anuncio completo y devolve un análisis estructurado.

CONTEXTO DEL PRODUCTO:
${BRAND_CONTEXT}

ANUNCIO A REVISAR:
- Conjunto de anuncios: ${adSet}
- Nivel de consciencia objetivo: ${awarenessLevel}
- Texto principal: "${primaryText}"
- Titular: "${headline}"
- CTA: "${cta}"

Analizá la imagen adjunta y el copy completo. Respondé EXACTAMENTE en este formato JSON:

{
  "scores": {
    "imagen_calidad": <1-10>,
    "imagen_coherencia_marca": <1-10>,
    "imagen_audiencia_fit": <1-10>,
    "copy_hook": <1-10>,
    "copy_imagen_alineacion": <1-10>,
    "nivel_consciencia_fit": <1-10>,
    "politica_meta": <"OK" | "RIESGO" | "VIOLATION">,
    "score_total": <1-10>
  },
  "problemas": [
    "<problema específico 1>",
    "<problema específico 2>"
  ],
  "fortalezas": [
    "<fortaleza 1>",
    "<fortaleza 2>"
  ],
  "mejoras_imagen": "<prompt mejorado para regenerar la imagen si score < 7>",
  "mejoras_copy": {
    "texto_principal": "<copy mejorado si necesita cambios, sino null>",
    "titular": "<titular mejorado si necesita cambios, sino null>"
  },
  "veredicto": <"PUBLICAR" | "MEJORAR_COPY" | "REGENERAR_IMAGEN" | "RECHAZAR">,
  "razon_veredicto": "<explicación en 1 oración>"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })

  const raw = response.content[0].text
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const review = JSON.parse(jsonMatch[0])

  // Pretty print results
  const s = review.scores
  console.log(`\n📊 SCORES:`)
  console.log(`  Imagen calidad:        ${scoreBar(s.imagen_calidad)} ${s.imagen_calidad}/10`)
  console.log(`  Imagen marca:          ${scoreBar(s.imagen_coherencia_marca)} ${s.imagen_coherencia_marca}/10`)
  console.log(`  Imagen audiencia:      ${scoreBar(s.imagen_audiencia_fit)} ${s.imagen_audiencia_fit}/10`)
  console.log(`  Copy hook:             ${scoreBar(s.copy_hook)} ${s.copy_hook}/10`)
  console.log(`  Copy-imagen alineación:${scoreBar(s.copy_imagen_alineacion)} ${s.copy_imagen_alineacion}/10`)
  console.log(`  Nivel consciencia:     ${scoreBar(s.nivel_consciencia_fit)} ${s.nivel_consciencia_fit}/10`)
  console.log(`  Política Meta:         ${s.politica_meta}`)
  console.log(`  ──────────────────────────────────────`)
  console.log(`  SCORE TOTAL:           ${scoreBar(s.score_total)} ${s.score_total}/10`)

  console.log(`\n✅ FORTALEZAS:`)
  review.fortalezas.forEach(f => console.log(`  • ${f}`))

  if (review.problemas.length > 0) {
    console.log(`\n⚠️  PROBLEMAS:`)
    review.problemas.forEach(p => console.log(`  • ${p}`))
  }

  const verdictEmoji = {
    PUBLICAR: '🟢',
    MEJORAR_COPY: '🟡',
    REGENERAR_IMAGEN: '🟠',
    RECHAZAR: '🔴',
  }
  console.log(`\n${verdictEmoji[review.veredicto]} VEREDICTO: ${review.veredicto}`)
  console.log(`  ${review.razon_veredicto}`)

  if (review.mejoras_imagen && review.veredicto === 'REGENERAR_IMAGEN') {
    console.log(`\n🎨 PROMPT MEJORADO PARA IMAGEN:`)
    console.log(`  "${review.mejoras_imagen}"`)
  }

  if (review.mejoras_copy.texto_principal || review.mejoras_copy.titular) {
    console.log(`\n✍️  COPY MEJORADO:`)
    if (review.mejoras_copy.texto_principal)
      console.log(`  Texto: "${review.mejoras_copy.texto_principal}"`)
    if (review.mejoras_copy.titular)
      console.log(`  Titular: "${review.mejoras_copy.titular}"`)
  }

  return review
}

function scoreBar(score) {
  const filled = Math.round(score)
  const empty = 10 - filled
  const color = score >= 7 ? '\x1b[32m' : score >= 5 ? '\x1b[33m' : '\x1b[31m'
  return `${color}${'█'.repeat(filled)}${'░'.repeat(empty)}\x1b[0m`
}

// ── ADS A REVISAR ──────────────────────────────────────────
const ads = [
  {
    adSet: 'Conjunto A — Intereses periodismo',
    awarenessLevel: 'Nivel 1 — Problema-consciente',
    imageUrl: 'https://v3b.fal.media/files/b/0a9916f5/rt4dRKJK0VLAWzaZdFp0H_00f85a9811894eeebc8b1c80dd31fa89.jpg',
    primaryText: 'Las redacciones no avisan cuando ya no te necesitan.\nPrimero es una reunión sin tu criterio. Después, un proyecto asignado a alguien más joven. Luego, el silencio.\nSi lo estás notando, ya es momento de construir algo propio.',
    headline: 'Tu trayectoria periodística puede generar ingresos hoy. Falta el sistema correcto.',
    cta: 'Ver el sistema',
  },
  {
    adSet: 'Conjunto B — Lookalike compradores (REGENERADA)',
    awarenessLevel: 'Nivel 2 — Solución-consciente',
    imageUrl: 'https://v3b.fal.media/files/b/0a994abd/QogJvt-5EcP28e_80G1zu_feb2eb270081495bb34cf8491c75b77d.jpg',
    primaryText: 'La IA ya está escribiendo las noticias que vos podrías estar publicando.\nNo para reemplazarte. Para que finalmente monetices lo que sabés hacer.\nCon este sistema configurás tu periódico digital en 24 horas: contenido automatizado con IA, audiencia propia y 3 fuentes de ingresos activas — sin dejar tu trabajo actual.',
    headline: 'Tu periódico digital con IA — activo en 24 horas por $17',
    cta: 'Comprar ahora',
  },
  {
    adSet: 'Conjunto C — Broad Colombia 25-45 (REGENERADA)',
    awarenessLevel: 'Nivel 3 — Precio y prueba social',
    imageUrl: 'https://v3b.fal.media/files/b/0a994abd/pr0l3pLcc8AZx9-0aerir_e1ffe70691af451db2888b1e4fd71364.jpg',
    primaryText: '5.500 periodistas en Latinoamérica ya tienen su propio medio digital.\nCrearon su periódico con IA, publican desde donde quieren y generan ingresos sin depender de ninguna redacción.\nAcceso al sistema completo: $17 (precio de lanzamiento — valor normal $227).',
    headline: 'Tu medio. Tu audiencia. Tus ingresos.',
    cta: 'Comprar ahora',
  },
]

// Run reviews
console.log('🔍 AGENTE DE REVISIÓN DE ANUNCIOS — Sistema de Ingresos Diarios')
console.log('Analizando imagen + copy + coherencia estratégica...\n')

const results = []
for (const ad of ads) {
  const review = await reviewAd(ad)
  results.push({ ad: ad.adSet, veredicto: review.veredicto, score: review.scores.score_total })
}

console.log(`\n${'='.repeat(60)}`)
console.log('RESUMEN FINAL')
console.log('='.repeat(60))
results.forEach(r => {
  const emoji = { PUBLICAR: '🟢', MEJORAR_COPY: '🟡', REGENERAR_IMAGEN: '🟠', RECHAZAR: '🔴' }
  console.log(`${emoji[r.veredicto]} ${r.ad}: ${r.veredicto} (${r.score}/10)`)
})
