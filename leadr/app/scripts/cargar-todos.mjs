/**
 * cargar-todos.mjs — Carga todos los módulos nuevos del curriculum de 12 meses
 * Uso: node --env-file=.env.local scripts/cargar-todos.mjs
 */

import { execSync } from 'child_process'

const MODULOS = [
  'osint',
  'seguridad-digital',
  'automatizacion',
  'data-journalism',
  'cobertura-tiempo-real',
  'especializacion-beat',
  'liderazgo-ia-redaccion',
  'investigacion-avanzada',
  'autoridad-editorial',
  'marca-personal-newsletter',
  'comunidad-retencion',
  'construir-medio-digital',
  'escalar-credibilidad',
  'negocio-sostenible',
]

const total = MODULOS.length
let ok = 0
let errores = []

console.log(`\n${'═'.repeat(60)}`)
console.log(`📚 CARGA MASIVA — ${total} módulos del Curriculum Leadr 12M`)
console.log(`${'═'.repeat(60)}\n`)

for (let i = 0; i < MODULOS.length; i++) {
  const modulo = MODULOS[i]
  const config = `scripts/configs/${modulo}.json`
  const num = `[${i + 1}/${total}]`

  console.log(`${num} ▶ ${modulo}`)
  console.log(`    Config: ${config}`)

  try {
    const out = execSync(
      `node --env-file=.env.local scripts/crear-clase.mjs --config ${config}`,
      { encoding: 'utf-8', timeout: 600000 }
    )
    // Mostrar solo el resumen final
    const lines = out.split('\n')
    const resumen = lines.filter(l => l.includes('✅') || l.includes('ID') || l.includes('Grupo')).slice(-3)
    resumen.forEach(l => console.log(`    ${l.trim()}`))
    ok++
    console.log(`    ✅ OK\n`)
  } catch (err) {
    console.error(`    ❌ ERROR en ${modulo}`)
    console.error(`    ${err.message?.slice(0, 200)}`)
    errores.push(modulo)
    console.log()
  }
}

console.log(`${'═'.repeat(60)}`)
console.log(`📊 RESULTADO FINAL`)
console.log(`   ✅ Cargados: ${ok}/${total}`)
if (errores.length > 0) {
  console.log(`   ❌ Con error: ${errores.join(', ')}`)
}
console.log(`${'═'.repeat(60)}\n`)
