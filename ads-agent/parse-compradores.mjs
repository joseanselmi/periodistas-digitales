/**
 * parse-compradores.mjs — Procesa exports de Hotmart y genera compradores.csv
 *
 * Uso:
 *   node parse-compradores.mjs archivo1.csv archivo2.csv ...
 *
 * Soporta ambos formatos de export de Hotmart (histórico y alternativo).
 * Filtra solo compras "Completo". Deduplica por email.
 * Genera: ads-agent/emails/compradores.csv
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const archivos = process.argv.slice(2)
if (!archivos.length) {
  console.error('❌ Uso: node parse-compradores.mjs archivo1.csv archivo2.csv ...')
  process.exit(1)
}

const vistos  = new Set()
const listado = []  // [{ email, nombre }]

for (const archivo of archivos) {
  const ruta = resolve(archivo)
  let contenido

  try {
    contenido = readFileSync(ruta, 'utf-8')
  } catch {
    console.error(`⚠️  No se pudo leer: ${ruta}`)
    continue
  }

  // Quitar BOM UTF-8
  if (contenido.charCodeAt(0) === 0xFEFF) {
    contenido = contenido.slice(1)
  }

  const lineas = contenido.split('\n').filter(l => l.trim())
  if (lineas.length < 2) continue

  const cabecera = lineas[0].split(';').map(c => c.replace(/^"|"$/g, '').trim())

  // Detectar formato por columnas clave
  const iEmailIdx    = cabecera.findIndex(c => c === 'Email del Comprador(a)')
  const iNombreIdx   = cabecera.findIndex(c => c === 'Comprador(a)')
  const iEmailIdx2   = cabecera.findIndex(c => c === 'Email')
  const iNombreIdx2  = cabecera.findIndex(c => c === 'Nombre')
  const iEstatus     = cabecera.findIndex(c => c === 'Estatus de la transacción' || c === 'Estatus')

  // Escoger índices según formato
  const emailIdx  = iEmailIdx  >= 0 ? iEmailIdx  : iEmailIdx2
  const nombreIdx = iNombreIdx >= 0 ? iNombreIdx : iNombreIdx2

  if (emailIdx < 0) {
    console.warn(`⚠️  No se encontró columna de email en: ${archivo}`)
    continue
  }

  let encontrados = 0
  let duplicados  = 0

  for (let i = 1; i < lineas.length; i++) {
    const partes = lineas[i].split(';').map(p => p.replace(/^"|"$/g, '').trim())

    // Filtrar solo compras completadas
    if (iEstatus >= 0 && partes[iEstatus] !== 'Completo') continue

    const email  = partes[emailIdx]?.toLowerCase().trim()
    const nombre = partes[nombreIdx]?.trim() || ''

    if (!email || !email.includes('@')) continue

    if (vistos.has(email)) {
      duplicados++
      continue
    }

    vistos.add(email)
    listado.push({ email, nombre })
    encontrados++
  }

  console.log(`✅ ${archivo}: ${encontrados} nuevos, ${duplicados} duplicados`)
}

// Guardar compradores.csv
mkdirSync('emails', { recursive: true })
const csv = 'email,nombre\n' + listado.map(c => `${c.email},${c.nombre}`).join('\n')
writeFileSync('emails/compradores.csv', csv, 'utf-8')

console.log(`\n📋 Total únicos: ${listado.length}`)
console.log(`   Guardado en: emails/compradores.csv`)
console.log(`\n   Primeros 5:`)
listado.slice(0, 5).forEach(c => console.log(`   - ${c.email} (${c.nombre})`))
