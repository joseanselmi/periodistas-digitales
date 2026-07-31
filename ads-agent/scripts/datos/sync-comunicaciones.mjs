/**
 * sync-comunicaciones.mjs — baja los eventos de email de Brevo a Supabase.
 *
 * En producción esto corre solo, colgado del Panel de Salud diario. Este script
 * es para el backfill inicial y para forzar una actualización a mano.
 *
 * Uso:
 *   node scripts/datos/sync-comunicaciones.mjs               # últimos 7 días
 *   node scripts/datos/sync-comunicaciones.mjs --dias 30     # todo lo que Brevo guarda
 *
 * Necesita en el entorno (o en ../Leadr/app/.env.local, que las tiene todas):
 *   BREVO_API_KEY
 *   MARKETING_SUPABASE_URL / SUPABASE_URL
 *   MARKETING_SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { sincronizarEventosBrevo } from '../../../sistema-ingresos/api/_lib/brevo-events-sync.js'

// Las claves de marketing viven en el .env.local de Leadr (es el único proyecto
// que habla con las dos bases). Se cargan sin pisar lo que ya esté en el entorno.
for (const ruta of ['../../Leadr/app/.env.local', '../Leadr/app/.env.local', '.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const apiKey      = process.env.BREVO_API_KEY
const supabaseUrl = process.env.MARKETING_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey  = process.env.MARKETING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const i = process.argv.indexOf('--dias')
const dias = i > -1 ? parseInt(process.argv[i + 1]) : 7

// La service_role de periodistas-marketing está marcada "Sensitive" en Vercel y
// el pull la trae vacía, así que localmente no siempre está. Con --sql el
// script no escribe: deja el SQL en un archivo para aplicarlo por el MCP de
// Supabase. En Vercel (donde salud.js lo llama) la clave sí está y escribe solo.
const j = process.argv.indexOf('--sql')
const SALIDA_SQL = j > -1 ? process.argv[j + 1] : null

if (!apiKey) { console.error('❌ Falta BREVO_API_KEY'); process.exit(1) }
if (!SALIDA_SQL) {
  for (const [k, v] of Object.entries({ SUPABASE_URL: supabaseUrl, SERVICE_ROLE_KEY: serviceKey })) {
    if (!v) { console.error(`❌ Falta ${k} (o usá --sql <archivo> para no escribir directo)`); process.exit(1) }
  }
}

console.log(`📨 Trayendo eventos de email de Brevo (últimos ${dias} días)...`)

if (SALIDA_SQL) {
  const { writeFileSync } = await import('fs')
  const { filasDeEventosBrevo } = await import('../../../sistema-ingresos/api/_lib/brevo-events-sync.js')
  const { eventos, filas } = await filasDeEventosBrevo({ apiKey, dias })

  const txt = v => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
  const COLS = ['mensaje_id', 'email', 'asunto', 'campana', 'enviado_en', 'entregado_en', 'abierto_en', 'clic_en', 'rebotado_en', 'spam_en']

  // En trozos: un INSERT de 450 filas no entra en una sola llamada al MCP.
  const TROZO = 150
  const base = resolve(SALIDA_SQL).replace(/\.sql$/, '')
  let archivos = 0

  for (let k = 0; k < filas.length; k += TROZO) {
    const values = filas.slice(k, k + TROZO).map(f => `(${COLS.map(c => txt(f[c])).join(',')})`).join(',\n')
    const sql = `insert into public.comunicaciones_email (${COLS.join(', ')}) values\n${values}\n` +
      `on conflict (mensaje_id) do update set\n` +
      COLS.slice(1).map(c => `  ${c} = coalesce(excluded.${c}, public.comunicaciones_email.${c})`).join(',\n') +
      `,\n  actualizado_en = now();\n`
    writeFileSync(`${base}-${++archivos}.sql`, sql)
  }
  console.log(`✅ ${eventos} eventos → ${filas.length} mails · ${archivos} archivos SQL en ${base}-N.sql`)
} else {
  const { eventos, filas } = await sincronizarEventosBrevo({ apiKey, supabaseUrl, serviceKey, dias })
  console.log(`✅ ${eventos} eventos → ${filas} mails guardados en comunicaciones_email`)
}
