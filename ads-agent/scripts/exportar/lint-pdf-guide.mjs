/**
 * lint-pdf-guide.mjs — Verificación mecánica de una guía PDF antes de entregarla.
 *
 * Uso:
 *   node scripts/exportar/lint-pdf-guide.mjs <ruta.html>
 *
 * No reemplaza la revisión visual de las capturas QA — la complementa con
 * chequeos objetivos que un ojo humano (o Claude) puede pasar por alto:
 * estructura de página, logo real, fuentes, reglas de paginación, y
 * conjugaciones "vos" que se filtran por hábito de marca.
 *
 * Exit code 0 = todo OK. Exit code 1 = hay errores, no entregar la guía.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, basename, join } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const exportPdfScript = join(scriptDir, 'export-pdf.mjs')

const htmlArg = process.argv[2]
if (!htmlArg) {
  console.error('❌ Uso: node scripts/exportar/lint-pdf-guide.mjs <ruta.html>')
  process.exit(1)
}

const htmlPath = resolve(htmlArg)
if (!existsSync(htmlPath)) {
  console.error(`❌ No existe el archivo: ${htmlPath}`)
  process.exit(1)
}

const html = readFileSync(htmlPath, 'utf8')
const dir = dirname(htmlPath)
const name = basename(htmlPath, '.html')
const bodyOnly = html.replace(/<style>[\s\S]*?<\/style>/, '')

const errors = []
const warnings = []

console.log(`\n🔎 LINT PDF GUIDE — ${basename(htmlPath)}\n`)

// ── 1. Estructura: cada <section class="page"> envuelve su contenido en .page-inner ──
const pageSections = [...html.matchAll(/<section class="page"[^>]*>/g)]
const pageInnerCount = (html.match(/<div class="page-inner">/g) || []).length
if (pageSections.length === 0) {
  errors.push('No se encontró ningún <section class="page"> — revisar estructura del HTML.')
} else if (pageSections.length !== pageInnerCount) {
  errors.push(`Hay ${pageSections.length} <section class="page"> pero solo ${pageInnerCount} <div class="page-inner"> — cada página debe envolver TODO su contenido en un único .page-inner (ver skill pdf-creator).`)
}

// ── 2. La regla CSS .page tiene el centrado vertical obligatorio ──
const pageRuleMatch = html.match(/\.page\s*\{([^}]*)\}/)
if (!pageRuleMatch) {
  errors.push('No se encontró la regla CSS ".page { ... }".')
} else {
  const rule = pageRuleMatch[1].replace(/\s+/g, '')
  for (const prop of ['min-height:100vh', 'display:flex', 'justify-content:center']) {
    if (!rule.includes(prop.replace(/\s+/g, ''))) {
      errors.push(`La regla .page no tiene "${prop}" — sin esto, páginas con poco contenido dejan un hueco vacío antes del salto de página.`)
    }
  }
}

// ── 3. Logo real + nombre de marca en la portada ──
const coverMatch = html.match(/<section class="cover">([\s\S]*?)<\/section>/)
if (!coverMatch) {
  errors.push('No se encontró <section class="cover">.')
} else {
  const cover = coverMatch[1]
  if (!cover.includes('cover-logo-row')) {
    errors.push('La portada no tiene .cover-logo-row (logo + nombre de marca) — no usar el placeholder genérico "{ }".')
  }
  const imgMatch = cover.match(/<img[^>]+src="([^"]+)"/)
  if (!imgMatch) {
    errors.push('La portada no tiene una <img> de logo.')
  } else if (!existsSync(join(dir, imgMatch[1]))) {
    errors.push(`El logo referenciado ("${imgMatch[1]}") no existe en ${dir} — copiar logo-periodistas-digitales.png a esta carpeta.`)
  }
  if (!cover.includes('cover-brandname')) {
    errors.push('La portada no tiene .cover-brandname (nombre de marca grande, separado del título de la guía).')
  }
}

// ── 4. Conjugaciones "vos" filtradas (la marca usa "vos", estas guías van en "tú") ──
const vosKnownVerbs = [
  'tenés','podés','sabés','querés','elegí','configurá','armá','pasá','creá','conectá',
  'subí','usá','marcá','completá','programá','probá','revisá','definí','agregá',
  'publicás','ajustá','cubrís','mirá','dale','sos','asigná','mandá','fijate',
  'recibís','vendés','ofrecés','existís','seguís','venís','creés',
]
for (const verb of vosKnownVerbs) {
  const re = new RegExp(`\\b${verb}\\b`, 'gi')
  const hits = bodyOnly.match(re)
  if (hits) errors.push(`Conjugación "vos" encontrada: "${verb}" (×${hits.length}) — estas guías van en "tú".`)
}
// Patrón genérico de respaldo (más ruidoso, solo advertencia — requiere ojo humano)
const genericVos = bodyOnly.match(/\b[a-záéíóúñ]+(?:ás|és|ís)\b/gi) || []
const vosWhitelist = new Set(['país','países','además','través','así','jamás','detrás','atrás','quizás','demás','compás','inglés','francés','interés','cortés','después','ingleses'])
const genericVosFiltered = [...new Set(genericVos.map(w => w.toLowerCase()))].filter(w => !vosWhitelist.has(w) && !vosKnownVerbs.includes(w))
if (genericVosFiltered.length) {
  warnings.push(`Palabras a revisar manualmente (pueden ser "vos" sin detectar, o falsos positivos): ${genericVosFiltered.join(', ')}`)
}

// ── 5. Fuentes de marca cargadas ──
for (const font of ['Space+Grotesk', 'DM+Sans', 'JetBrains+Mono']) {
  if (!html.includes(font)) errors.push(`No se encontró la fuente "${font.replace('+', ' ')}" en el <link> de Google Fonts.`)
}

// ── 6. Reglas de paginación imprescindibles ──
if (!html.includes('page-break-inside: avoid') && !html.includes('page-break-inside:avoid')) {
  errors.push('Falta la regla "page-break-inside: avoid" para code-box/case-card/callout/cta-box.')
}
if (!html.includes('page-break-after: always') && !html.includes('page-break-after:always')) {
  errors.push('Falta la regla "page-break-after: always" para forzar un salto de página por sección.')
}

// ── 7. Exportar y verificar que TODAS las páginas tengan el mismo alto físico ──
console.log('📄 Exportando PDF para verificar dimensiones reales de cada página...')
try {
  execFileSync(process.execPath, [exportPdfScript, htmlPath], { stdio: 'pipe' })
} catch (e) {
  const detail = (e.stderr && e.stderr.toString().split('\n')[0]) || e.message.split('\n')[0]
  errors.push(`No se pudo correr export-pdf.mjs automáticamente (${detail}) — correrlo a mano y reintentar el lint.`)
}

const qaDir = join(dir, `qa-${name}`)
if (existsSync(qaDir)) {
  const { readdirSync } = await import('fs')
  const pngs = readdirSync(qaDir).filter(f => f.endsWith('.png')).sort()
  const dims = pngs.map(f => {
    const buf = readFileSync(join(qaDir, f))
    return { f, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  })
  if (dims.length === 0) {
    errors.push(`No se encontraron capturas PNG en ${qaDir}.`)
  } else {
    const refH = dims[0].h
    const mismatched = dims.filter(d => d.h !== refH)
    if (mismatched.length) {
      errors.push(`Páginas con alto distinto al resto (señal de que falta el centrado vertical en esa sección): ${mismatched.map(d => `${d.f} (${d.w}x${d.h}, esperado alto ${refH})`).join('; ')}`)
    } else {
      console.log(`   ✅ Las ${dims.length} páginas tienen exactamente el mismo alto (${dims[0].w}x${refH}).`)
    }
  }
} else {
  errors.push(`No existe la carpeta de capturas QA (${qaDir}) — correr export-pdf.mjs antes del lint.`)
}

// ── Reporte final ──
console.log('\n──────────────────────────────────────────')
if (warnings.length) {
  console.log(`\n⚠️  ADVERTENCIAS (revisar a ojo, no bloquean):`)
  warnings.forEach(w => console.log(`   - ${w}`))
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} PROBLEMA(S) — NO ENTREGAR esta guía todavía:`)
  errors.forEach(e => console.log(`   - ${e}`))
  console.log('')
  process.exit(1)
} else {
  console.log('\n✅ Todos los criterios mecánicos pasaron. Falta solo la revisión visual final de las capturas QA.\n')
  process.exit(0)
}
