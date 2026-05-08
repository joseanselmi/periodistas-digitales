import Anthropic from '@anthropic-ai/sdk'
import { BRAND } from './brand-context.mjs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function reviewAd({ imageUrl, primaryText, headline, cta, awarenessLevel, adSet }) {
  const imageRes = await fetch(imageUrl)
  const imageBuffer = await imageRes.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')

  const brandContext = `
PRODUCTO: ${BRAND.product}
PRECIO: $${BRAND.price} USD (valor percibido $${BRAND.perceivedValue})
AUDIENCIA: ${BRAND.audience.description}
MERCADOS TOP HISTÓRICOS: ${BRAND.topMarkets.join(', ')}
IDIOMA: ${BRAND.audience.language} (usar "tú", NO "vos")
PROPUESTA DE VALOR: ${BRAND.valueProposition}
ÁNGULO GANADOR HISTÓRICO: ${BRAND.winningAngle}
ESTÉTICA: ${BRAND.aesthetic.join(', ')}
POLÍTICA META: ${BRAND.metaPolicy.join(' | ')}
NIVEL DE CONSCIENCIA ${awarenessLevel}: ${BRAND.awarenessLevels[awarenessLevel.split(' ')[0]] ?? ''}

BENCHMARKS REALES DE CAMPAÑAS ANTERIORES:
- CPA objetivo: $${BRAND.benchmarks.cpaTarget} (histórico $9.93-$10.72)
- CTR mínimo: ${BRAND.benchmarks.ctrMin}% | bueno: ${BRAND.benchmarks.ctrGood}% | excelente: ${BRAND.benchmarks.ctrExcellent}%
- CVR landing objetivo: ${BRAND.benchmarks.cvrTarget}%
- ROAS real objetivo (con order bumps): ${BRAND.benchmarks.realRoasTarget}x
- IMPORTANTE: El ROAS reportado en Meta parece bajo porque solo trackea $17 front-end. Con order bumps el AOV real es $26-30.
`

  const prompt = `Eres un experto en Meta Ads para infoproductos en Latinoamérica.
Revisá este anuncio y devolvé un análisis en JSON.

CONTEXTO:
${brandContext}

ANUNCIO:
- Conjunto: ${adSet}
- Nivel de consciencia: ${awarenessLevel}
- Texto principal: "${primaryText}"
- Titular: "${headline}"
- CTA: "${cta}"

Respondé SOLO con JSON válido, sin markdown:
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
  "problemas": ["<problema 1>", "<problema 2>"],
  "fortalezas": ["<fortaleza 1>", "<fortaleza 2>"],
  "mejoras_imagen": "<nuevo prompt para Flux si score imagen < 7, sino null>",
  "mejoras_copy": {
    "texto_principal": "<copy mejorado o null>",
    "titular": "<titular mejorado o null>"
  },
  "veredicto": <"PUBLICAR" | "MEJORAR_COPY" | "REGENERAR_IMAGEN" | "RECHAZAR">,
  "razon_veredicto": "<1 oración>"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
        { type: 'text', text: prompt },
      ],
    }],
  })

  const raw = response.content[0].text
  return JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
}

export function printReview(adSet, awarenessLevel, review) {
  const bar = (score) => {
    const color = score >= 7 ? '\x1b[32m' : score >= 5 ? '\x1b[33m' : '\x1b[31m'
    return `${color}${'█'.repeat(Math.round(score))}${'░'.repeat(10 - Math.round(score))}\x1b[0m`
  }

  const emoji = { PUBLICAR: '🟢', MEJORAR_COPY: '🟡', REGENERAR_IMAGEN: '🟠', RECHAZAR: '🔴' }
  const s = review.scores

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`${adSet} | ${awarenessLevel}`)
  console.log('═'.repeat(60))
  console.log(`\n📊 SCORES:`)
  console.log(`  Imagen calidad:         ${bar(s.imagen_calidad)} ${s.imagen_calidad}/10`)
  console.log(`  Imagen marca:           ${bar(s.imagen_coherencia_marca)} ${s.imagen_coherencia_marca}/10`)
  console.log(`  Imagen audiencia:       ${bar(s.imagen_audiencia_fit)} ${s.imagen_audiencia_fit}/10`)
  console.log(`  Copy hook:              ${bar(s.copy_hook)} ${s.copy_hook}/10`)
  console.log(`  Copy-imagen alineación: ${bar(s.copy_imagen_alineacion)} ${s.copy_imagen_alineacion}/10`)
  console.log(`  Nivel consciencia:      ${bar(s.nivel_consciencia_fit)} ${s.nivel_consciencia_fit}/10`)
  console.log(`  Política Meta:          ${s.politica_meta}`)
  console.log(`  ${'─'.repeat(42)}`)
  console.log(`  SCORE TOTAL:            ${bar(s.score_total)} ${s.score_total}/10`)

  console.log(`\n✅ FORTALEZAS:`)
  review.fortalezas.forEach(f => console.log(`  • ${f}`))

  if (review.problemas.length > 0) {
    console.log(`\n⚠️  PROBLEMAS:`)
    review.problemas.forEach(p => console.log(`  • ${p}`))
  }

  console.log(`\n${emoji[review.veredicto]} VEREDICTO: ${review.veredicto}`)
  console.log(`  ${review.razon_veredicto}`)

  if (review.mejoras_imagen) {
    console.log(`\n🎨 NUEVO PROMPT IMAGEN:\n  "${review.mejoras_imagen}"`)
  }
  if (review.mejoras_copy.texto_principal || review.mejoras_copy.titular) {
    console.log(`\n✍️  COPY MEJORADO:`)
    if (review.mejoras_copy.texto_principal) console.log(`  Texto: "${review.mejoras_copy.texto_principal}"`)
    if (review.mejoras_copy.titular) console.log(`  Titular: "${review.mejoras_copy.titular}"`)
  }
}
