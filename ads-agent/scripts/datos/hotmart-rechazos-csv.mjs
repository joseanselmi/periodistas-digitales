/**
 * hotmart-rechazos-csv.mjs — Importador MANUAL de rechazos de tarjeta (tarjeta #36).
 *
 * PARA QUÉ:
 *   El webhook de Hotmart NO avisa los rechazos de tarjeta (no existe evento
 *   "declined"; el informe "Motivos de rechazo de la tarjeta" es solo un panel).
 *   Mientras no se destrabe la API de ventas (403), este script permite cargar esos
 *   rechazos a mano: Jose exporta el CSV del panel y este script lo parsea y lo
 *   normaliza al formato de la tabla `clientes_potenciales` (tipo `pago_rechazado`).
 *   Una vez insertados, el motor de recuperación (api/recuperacion.js) les manda
 *   `recup_rechazo_1` solo en su cron diario. Es el "puente" hasta la vía automática
 *   por API (ver ads-agent/scripts/datos/hotmart-sync.mjs y ads-agent/docs/ARQUITECTURA-DATOS.md #36).
 *
 * CÓMO EXPORTAR EL CSV (lo hace Jose):
 *   Hotmart → Mis análisis → Ventas perdidas → "Motivos de rechazo de la tarjeta"
 *   → Exportar → CSV. Guardarlo y pasarme la ruta del archivo.
 *
 * USO (lo corre Claude cuando Jose pasa el CSV):
 *   node scripts/datos/hotmart-rechazos-csv.mjs <archivo.csv>          → RESUMEN + preview (no escribe)
 *   node scripts/datos/hotmart-rechazos-csv.mjs <archivo.csv> --json   → imprime el JSON normalizado
 *
 *   El script NO escribe en la base (no necesita la service_role key). Claude toma el
 *   JSON que imprime `--json` y lo inserta en `clientes_potenciales` vía el MCP de
 *   Supabase (jsonb_to_recordset + ON CONFLICT (dedup_key) DO NOTHING → nunca duplica).
 *   Flujo: correr sin flags para revisar con Jose (cuántas filas, a cuántas se les
 *   mandará WhatsApp, rango de fechas) → recién ahí insertar.
 *
 * NOTA sobre columnas: los nombres del CSV de Hotmart pueden variar (idioma, versión).
 * El script detecta las columnas de forma difusa e IMPRIME el mapeo detectado para
 * verificarlo. Si alguna columna no se detecta bien, se ajustan los patrones acá.
 * NOTA sobre fechas: se asume formato dd/mm/aaaa (locale ES de Hotmart). Si el CSV
 * viniera en mm/dd/aaaa, avisar para invertir.
 */

import fs from 'node:fs'

const FILE = process.argv[2]
const AS_JSON = process.argv.includes('--json')
if (!FILE || FILE.startsWith('--')) {
  console.error('\n❌ Uso: node scripts/datos/hotmart-rechazos-csv.mjs <archivo.csv> [--json]\n')
  process.exit(1)
}

// ─── Parser CSV robusto (maneja comillas, saltos de línea dentro de campos, "") ──
function parseCSV(text, delim) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      row.push(field); field = ''
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else if (c === '\r') {
      // ignorar (CRLF)
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(v => String(v).trim() !== '')) // saca líneas vacías
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const onlyDigits = s => (String(s == null ? '' : s).replace(/\D/g, '') || undefined)

// Fecha: dd/mm/aaaa [hh:mm[:ss]] | ISO | epoch → ISO-8601 UTC.
function toIso(v) {
  if (v == null || String(v).trim() === '') return undefined
  const s = String(v).trim()
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) {
    const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)))
    return isNaN(d.getTime()) ? undefined : d.toISOString()
  }
  if (/^\d+$/.test(s)) { const n = Number(s); const d = new Date(n > 1e12 ? n : n * 1000); return isNaN(d.getTime()) ? undefined : d.toISOString() }
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}

// ─── Leer y parsear ─────────────────────────────────────────────────────────────
let raw
try { raw = fs.readFileSync(FILE, 'utf8').replace(/^﻿/, '') } // saca BOM
catch (e) { console.error(`\n❌ No pude leer el archivo: ${e.message}\n`); process.exit(1) }

const firstLineEnd = raw.indexOf('\n') === -1 ? raw.length : raw.indexOf('\n')
const firstLine = raw.slice(0, firstLineEnd)
// Delimitador: Hotmart suele exportar con ; (locale ES/PT). Se elige el más frecuente.
const delim = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ','

const table = parseCSV(raw, delim)
if (table.length < 2) { console.error('\n❌ El CSV no tiene filas de datos.\n'); process.exit(1) }
const header = table.shift()
const H = header.map(norm)

// ─── Detección difusa de columnas ────────────────────────────────────────────────
const findCol = (re, exclude = []) => H.findIndex((h, i) => !exclude.includes(i) && re.test(h))
// Producto: preferir el NOMBRE del producto sobre el "id del producto".
const iProducto = (() => {
  const n = findCol(/nombre.*producto|producto.*nombre/)
  return n !== -1 ? n : findCol(/producto|product/)
})()
const iEmail    = findCol(/correo|e-?mail/)
const iTelefono = findCol(/tel|phone|celular|movil|whatsapp|fono/)
// Nombre del comprador: preferir "...comprador/cliente..."; NUNCA una columna de producto
// (evita agarrar "Nombre del Producto" cuando no hay "Nombre del Comprador" antes).
const iNombre = (() => {
  const c = findCol(/nombre.*(comprador|cliente)|(comprador|cliente).*nombre/)
  if (c !== -1) return c
  return H.findIndex((h, i) => /nombre|comprador|cliente|buyer|\bname\b/.test(h) && !/producto|product/.test(h) && i !== iProducto)
})()
const iTx       = (() => { const a = findCol(/transacc|transaction/); return a !== -1 ? a : findCol(/pedido|order|codigo/, [iProducto]) })()
const iFecha    = findCol(/fecha|date|data/)
const iMotivo   = findCol(/motivo|reason|recusa|rechazo|razon/)
const iEstadoTj = findCol(/(estado|status).*(tarjeta|card)|tarjeta|card/, [iProducto])

const val = (r, i) => (i >= 0 && i < r.length ? String(r[i]).trim() : '')

// ─── Mapear filas ────────────────────────────────────────────────────────────────
const seen = new Set()
const records = []
let sinEmail = 0
for (const r of table) {
  const email = val(r, iEmail).toLowerCase()
  if (!email || !email.includes('@')) { sinEmail++; continue }

  const tx = val(r, iTx) || undefined
  const dedup_key = tx ? `hotmart:${tx}` : `pago_rechazado:${email}:curso`
  if (seen.has(dedup_key)) continue // dedup dentro del mismo archivo
  seen.add(dedup_key)

  const motivo = [val(r, iMotivo), val(r, iEstadoTj)].filter(Boolean).join(' · ') || undefined

  // payload = la fila original con nombres de columna (trazabilidad).
  const payload = {}
  header.forEach((h, i) => { payload[String(h).trim() || `col${i}`] = val(r, i) })

  const rec = {
    tipo: 'pago_rechazado',
    email,
    nombre: val(r, iNombre) || undefined,
    telefono: onlyDigits(val(r, iTelefono)),
    producto: val(r, iProducto) || 'Sistema de Ingresos Diarios para Periodistas',
    evento_hotmart: 'CSV_MOTIVOS_RECHAZO',
    motivo_rechazo: motivo,
    transaction_id: tx,
    ocurrido_en: toIso(val(r, iFecha)),
    dedup_key,
    payload,
  }
  Object.keys(rec).forEach(k => rec[k] === undefined && delete rec[k])
  records.push(rec)
}

// ─── Salida ──────────────────────────────────────────────────────────────────────
if (AS_JSON) {
  process.stdout.write(JSON.stringify(records))
  process.exit(0)
}

const colName = i => (i >= 0 ? `"${header[i]}"` : '— NO DETECTADA —')
const conTel = records.filter(r => r.telefono && r.telefono.length >= 8).length
const fechas = records.map(r => r.ocurrido_en).filter(Boolean).sort()

console.log(`\n📄 CSV de rechazos: ${FILE}`)
console.log(`   Delimitador detectado: "${delim}"  ·  columnas: ${header.length}`)
console.log('\n🔎 Mapeo de columnas detectado (verificar):')
console.log(`   email      → ${colName(iEmail)}`)
console.log(`   nombre     → ${colName(iNombre)}`)
console.log(`   telefono   → ${colName(iTelefono)}`)
console.log(`   transacc.  → ${colName(iTx)}`)
console.log(`   fecha      → ${colName(iFecha)}`)
console.log(`   motivo     → ${colName(iMotivo)}`)
console.log(`   estado tj. → ${colName(iEstadoTj)}`)
console.log(`   producto   → ${colName(iProducto)}`)

console.log(`\n📊 Resumen:`)
console.log(`   Filas con email válido : ${records.length}`)
console.log(`   Filas salteadas (s/email): ${sinEmail}`)
console.log(`   Con teléfono (→ recibirán WhatsApp): ${conTel}`)
console.log(`   Sin teléfono (no se les puede escribir): ${records.length - conTel}`)
if (fechas.length) console.log(`   Rango de fechas: ${fechas[0].slice(0, 10)} → ${fechas[fechas.length - 1].slice(0, 10)}`)

console.log(`\n👀 Muestra (primeras 10):`)
records.slice(0, 10).forEach(r =>
  console.log(`   · ${(r.ocurrido_en || '').slice(0, 10) || '——'} | ${r.email} | ${r.nombre || '—'} | tel=${r.telefono || 'SIN TEL'} | ${r.motivo_rechazo || '—'}`)
)
console.log(`\n➡️  Si el mapeo está OK, correr con --json y Claude lo inserta en clientes_potenciales.`)
console.log('─'.repeat(64))
