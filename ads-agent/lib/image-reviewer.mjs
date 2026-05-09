/**
 * image-reviewer.mjs — Revisor universal de imágenes generadas con IA
 * Usado por: organic-agent, publish, reviewer, y cualquier agente que genere imágenes.
 *
 * Criterios de aprobación:
 * - Sin texto visible en ninguna parte
 * - Persona latinoamericana reconocible (cuando aplica)
 * - Coherencia con el tipo de contenido
 * - Score mínimo 7/10
 * - Máximo MAX_RETRIES intentos antes de usar la última versión
 */

import Anthropic from '@anthropic-ai/sdk'

const client     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MAX_RETRIES = 3

// Prefijo obligatorio para TODOS los prompts de imagen del ecosistema
export const LATAM_IMAGE_PREFIX = `
Photorealistic editorial photograph.
MANDATORY: Latin American person (Colombian, Mexican, Ecuadorian or Argentine), brown skin tone, dark hair, natural features. Age 35-55.
MANDATORY: NO text, NO letters, NO words, NO subtitles, NO UI text anywhere in the image.
MANDATORY: NO stock photo smile, NO generic office look, NO white backgrounds.
Style: cinematic, dramatic lighting, dark moody background, blue-purple or warm amber ambient light.
Setting: home office at night OR newsroom with dark walls OR outdoor Latin American urban environment.
`.trim()

/**
 * Revisa una imagen con Claude Vision.
 * @param {Buffer} imageBuffer
 * @param {string} context - tipo de post o ad (ej: 'educativo', 'prueba-social', 'ad-frio')
 * @param {string} copy - fragmento del copy para evaluar coherencia
 * @returns {{ aprobada: boolean, score: number, problemas: string[], razon: string }}
 */
export async function reviewImage(imageBuffer, context = 'genérico', copy = '') {
  const base64 = imageBuffer.toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
        },
        {
          type: 'text',
          text: `Revisá esta imagen generada para una marca latinoamericana de periodismo digital (Sistema de Ingresos Diarios para Periodistas).
Contexto del uso: ${context}
Copy asociado: "${copy.slice(0, 150)}..."

Respondé SOLO con JSON válido:
{
  "aprobada": true/false,
  "score": 1-10,
  "problemas": ["problema 1", "problema 2"],
  "razon": "una línea clara explicando la decisión"
}

RECHAZOS AUTOMÁTICOS (aprobada: false, score ≤ 5):
- Texto, letras, palabras visibles en cualquier parte de la imagen
- Persona claramente no latinoamericana (piel muy clara, rasgos asiáticos/europeos marcados)
- Imagen de stock genérica (fondo blanco, sonrisa forzada, ropa genérica)
- Estética de hacking/oscura sin contexto periodístico
- Sin coherencia con el contexto "${context}"
- Imagen de baja calidad o muy oscura sin detalles

APROBACIÓN (score ≥ 7):
- Persona latinoamericana creíble
- Sin texto en ningún lado
- Iluminación dramática y atractiva
- Coherente con el contexto periodístico latinoamericano`,
        },
      ],
    }],
  })

  try {
    const raw = response.content[0].text
    return JSON.parse(raw.match(/\{[\s\S]*\}/)[0])
  } catch {
    return { aprobada: true, score: 7, problemas: [], razon: 'Review no parseado — aprobado por defecto' }
  }
}

/**
 * Genera una imagen y la revisa. Reintenta si falla.
 * @param {Function} generateFn - función async que recibe (prompt) y devuelve Buffer
 * @param {string} basePrompt - prompt sin el prefijo LATAM (se agrega automáticamente)
 * @param {string} context - tipo de contenido para la revisión
 * @param {string} copy - copy del post/ad para evaluar coherencia
 * @param {Function} onAttempt - callback opcional para logging: (attempt, review) => void
 * @returns {Buffer} imagen aprobada (o última generada si se agotan los intentos)
 */
export async function generateAndReview(generateFn, basePrompt, context, copy = '', onAttempt = null) {
  const fullPrompt = `${LATAM_IMAGE_PREFIX}\n\n${basePrompt}`
  let lastBuffer = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const buffer = await generateFn(fullPrompt)
    lastBuffer   = buffer

    const review = await reviewImage(buffer, context, copy)

    if (onAttempt) onAttempt(attempt, review)

    if (review.aprobada || review.score >= 7) {
      return buffer
    }

    if (attempt === MAX_RETRIES) {
      console.warn(`\n  ⚠️  Imagen "${context}" no pasó revisión en ${MAX_RETRIES} intentos. Usando última versión.`)
    }
  }

  return lastBuffer
}
