/**
 * audit-cmo.mjs — Agente CMO Senior
 * Revisa coherencia de todo el ecosistema de marketing:
 * landing, ads, copies, estrategia, embudo.
 *
 * Uso: node audit-cmo.mjs
 * Variables requeridas: ANTHROPIC_API_KEY
 * Opcional: META_ACCESS_TOKEN + META_AD_ACCOUNT_ID para incluir data fresca de Meta
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { BRAND } from './lib/brand-context.mjs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Falta ANTHROPIC_API_KEY')
  process.exit(1)
}

// ─── 1. Recolectar contexto del ecosistema ────────────────────────────────────

async function fetchLanding(url) {
  console.log(`  Fetching landing: ${url}`)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    const html = await res.text()
    // Extraer texto visible (strip HTML tags)
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 8000)
  } catch (e) {
    return `[No se pudo acceder a ${url}: ${e.message}]`
  }
}

function loadMetaExport() {
  // Buscar el export más reciente
  const files = ['campaigns/meta-export-2026-05-08.json']
  for (const f of files) {
    if (existsSync(f)) {
      const d = JSON.parse(readFileSync(f, 'utf-8'))
      // Resumir para no saturar el contexto
      const topAds = d.rawInsights
        .map(r => ({
          adset: r.adset_name,
          campaign: r.campaign_name,
          spend: parseFloat(r.spend).toFixed(0),
          purchases: (r.actions || []).find(a => a.action_type === 'purchase')?.value || 0,
          ctr: parseFloat(r.ctr).toFixed(2),
          cpa: (r.actions || []).find(a => a.action_type === 'purchase')?.value > 0
            ? (parseFloat(r.spend) / parseInt((r.actions || []).find(a => a.action_type === 'purchase').value)).toFixed(2)
            : null,
        }))
        .filter(r => parseFloat(r.spend) > 10)
        .sort((a, b) => parseFloat(b.spend) - parseFloat(a.spend))
        .slice(0, 15)

      return {
        account: d.account.name,
        totalSpend: (d.account.amount_spent / 100).toFixed(2),
        summary: d.summary,
        topAds,
        lastExport: d.exportedAt,
      }
    }
  }
  return null
}

function loadAdCampaignConfig() {
  const path = 'campaigns/2026-05-08/config.json'
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf-8'))
  }
  return null
}

// ─── 2. Prompt del CMO ────────────────────────────────────────────────────────

const CMO_SYSTEM = `Eres el Chief Marketing Officer de una agencia top de performance marketing en Latinoamérica.
Tenés más de 15 años de experiencia en infoproductos, tráfico frío en Meta Ads, y funnels de conversión.
Has gestionado cuentas con presupuestos de $50k/mes+.

Tu trabajo es hacer una auditoría brutal y honesta del ecosistema completo de marketing de un cliente.
No sos complaciente. Decís exactamente qué está mal, por qué, y qué fix concreto aplicar.
Tu criterio es de clase mundial: revisás con el ojo de quien sabe que cada dólar mal gastado es un desperdicio real.

Formato de respuesta: texto estructurado con secciones claras, en español latinoamericano.
Usá emojis de semáforo para señalar severidad: 🔴 crítico | 🟡 mejorable | 🟢 correcto`

// ─── 3. Main ─────────────────────────────────────────────────────────────────

console.log('\n🧠 CMO AUDIT AGENT')
console.log('   Recolectando datos del ecosistema...\n')

const [landingText, metaData, adConfig] = await Promise.all([
  fetchLanding(BRAND.landingUrl),
  Promise.resolve(loadMetaExport()),
  Promise.resolve(loadAdCampaignConfig()),
])

console.log('  Analizando con Claude...\n')

const userPrompt = `
Hacé una auditoría completa del ecosistema de marketing de este cliente. Revisá la coherencia entre todos los elementos: landing, ads activos, datos históricos de performance, y posicionamiento de marca.

═══════════════════════════════════════════
CONTEXTO DE MARCA
═══════════════════════════════════════════
Producto: ${BRAND.product}
Precio: $${BRAND.price} USD (valor percibido $${BRAND.perceivedValue})
Audiencia: ${BRAND.audience.description}
Mercados top reales (por ventas históricas): ${BRAND.topMarkets.join(', ')}
Propuesta de valor: ${BRAND.valueProposition}
Ángulo ganador histórico: ${BRAND.winningAngle}
Prueba social: ${BRAND.socialProof}
Política Meta: ${BRAND.metaPolicy.join(' | ')}

Benchmarks reales:
- CPA histórico: $9.93–$10.72 (objetivo $${BRAND.benchmarks.cpaTarget})
- CTR mínimo aceptable: ${BRAND.benchmarks.ctrMin}% | bueno: ${BRAND.benchmarks.ctrGood}% | excelente: ${BRAND.benchmarks.ctrExcellent}%
- CVR landing objetivo: ${BRAND.benchmarks.cvrTarget}%
- CPM histórico: $${BRAND.benchmarks.cpmRange[0]}–$${BRAND.benchmarks.cpmRange[1]}

═══════════════════════════════════════════
LANDING PAGE ACTUAL (${BRAND.landingUrl})
═══════════════════════════════════════════
${landingText}

═══════════════════════════════════════════
ADS EN CAMPAÑA ACTIVA (config)
═══════════════════════════════════════════
${adConfig ? JSON.stringify(adConfig, null, 2) : 'No hay config de campaña activa disponible'}

═══════════════════════════════════════════
PERFORMANCE HISTÓRICO META ADS (top 15 por gasto)
═══════════════════════════════════════════
${metaData ? JSON.stringify(metaData, null, 2) : 'No hay datos de Meta disponibles'}

═══════════════════════════════════════════
TU AUDITORÍA
═══════════════════════════════════════════

Estructurá tu análisis así:

## 1. DIAGNÓSTICO EJECUTIVO (3-4 líneas, el panorama general)

## 2. LANDING PAGE — Coherencia y conversión
   - ¿El headline conecta con el pain del ICP real?
   - ¿La propuesta de valor es clara en los primeros 5 segundos?
   - ¿La prueba social es creíble para tráfico frío?
   - ¿Hay urgencia real?
   - ¿El CTA es claro y único?
   - Veredicto: score /10 y los 3 fixes más urgentes

## 3. ADS → LANDING — Coherencia del mensaje
   - ¿El copy de los ads conecta directamente con el headline de la landing?
   - ¿La promesa del ad se cumple en la landing?
   - ¿El visitante siente que llegó al lugar correcto?
   - Identificá cualquier "message mismatch" concreto

## 4. POSICIONAMIENTO — ¿Está bien enfocado el ángulo?
   - ¿El ángulo actual (periódico digital / plan B) es el más fuerte dado el historial?
   - ¿El ángulo de IA está suficientemente explotado dado que fue el que más convirtió?
   - ¿Hay confusión entre los dos productos (curso IA $11.99 vs. sistema periódico $17)?

## 5. AUDIENCIA Y TARGETING — ¿Estamos hablando con la persona correcta?
   - ¿El copy habla al ICP correcto (40-55 años, periodista con trayectoria)?
   - ¿Los mercados actuales son los que históricamente más convierten?
   - ¿Hay segmentos sin explotar evidentes?

## 6. PERFORMANCE GAPS — Lo que dicen los números
   - ¿Qué patrón claro hay entre los ads que convirtieron y los que no?
   - ¿Cuál fue el copy/imagen que generó el mejor CPA y por qué funcionó?
   - ¿Dónde se fue el dinero en ads que no convirtieron?

## 7. PLAN DE ACCIÓN — Priorizado por impacto
   Lista las 5 acciones concretas en orden de impacto en ventas, con criterio de qué hacer esta semana vs. este mes.

## 8. SCORE GENERAL DEL ECOSISTEMA
   | Elemento | Score /10 | Estado |
   Dá un score honesto a: Landing, Coherencia Ad→LP, Ángulo/Posicionamiento, Targeting, Prueba Social, Urgencia
`

const stream = client.messages.stream({
  model: 'claude-opus-4-7',
  max_tokens: 4000,
  system: CMO_SYSTEM,
  messages: [{ role: 'user', content: userPrompt }],
})

// Stream output en tiempo real
console.log('═'.repeat(70))
console.log('AUDITORÍA CMO — ECOSISTEMA SISTEMA DE INGRESOS DIARIOS')
console.log('═'.repeat(70))
console.log()

let fullResponse = ''
stream.on('text', (text) => {
  process.stdout.write(text)
  fullResponse += text
})

await stream.finalMessage()

// Guardar reporte
const timestamp = new Date().toISOString().slice(0, 10)
const outputPath = `campaigns/cmo-audit-${timestamp}.md`
writeFileSync(outputPath, `# Auditoría CMO — ${timestamp}\n\n${fullResponse}`)

console.log('\n\n' + '═'.repeat(70))
console.log(`✅ Reporte guardado en: ${outputPath}`)
