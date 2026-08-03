/**
 * meta-gasto-sync.mjs — baja el gasto de TODAS las campañas de Meta, día por día.
 *
 * POR QUÉ EXISTE (31/07/2026)
 *
 * `meta-spend-sync.mjs` solo actualiza anuncios que ya tienen ficha en `campanas`
 * y cuyo nombre lleva la matrícula adN-angulo. Está bien para medir los anuncios
 * que Mateo lanza con método — pero deja ciego todo lo demás.
 *
 * La campaña "interacción" venía gastando ~$2 por día desde diciembre de 2024
 * ($340 en total, $80 solo en el último mes) y no aparecía en ninguna tabla, en
 * ningún reporte ni en ninguna pantalla. Jose la daba por apagada. Nadie mintió:
 * simplemente no había dónde verla.
 *
 * Este script no filtra nada. Trae la cuenta entera, tenga ficha o no. Si una
 * campaña no corresponde a ningún embudo, se guarda igual y el panel la muestra
 * aparte — que es exactamente lo que hay que poder mirar.
 *
 * Correr desde ads-agent/:
 *   node scripts/datos/meta-gasto-sync.mjs                 # últimos 90 días
 *   node scripts/datos/meta-gasto-sync.mjs --dias 400      # para el histórico
 *   node scripts/datos/meta-gasto-sync.mjs --dry           # muestra, no escribe
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

for (const ruta of ['.env.local', '../Leadr/app/.env.local', '../../Leadr/app/.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const API     = 'https://graph.facebook.com/v21.0'
const TOKEN   = (process.env.META_ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN || '').trim()
const ACCOUNT = (process.env.META_AD_ACCOUNT_ID || 'act_583636631091469').trim().replace(/^act_/, '')
const SB_URL  = (process.env.MARKETING_SUPABASE_URL || process.env.SUPABASE_URL || '').trim().replace(/\/$/, '')
const SB_KEY  = (process.env.MARKETING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

const DRY  = process.argv.includes('--dry')
const DIAS = process.argv.includes('--dias') ? Number(process.argv[process.argv.indexOf('--dias') + 1]) : 90

if (!TOKEN) { console.error('❌ Falta META_ACCESS_TOKEN'); process.exit(1) }
if (!DRY && (!SB_URL || !SB_KEY)) { console.error('❌ Faltan las claves de Supabase (o usá --dry)'); process.exit(1) }

// La URL y la clave se juntan de archivos distintos: `ads-agent/.env.local` tiene la URL
// de periodistas-marketing pero no su clave, así que el bucle de arriba sigue buscando y
// termina tomando la de `Leadr/app/.env.local` — que es de OTRO proyecto de Supabase.
// El resultado era un `401 Invalid API key` a mitad de camino, después de bajar todo de
// Meta, sin ninguna pista de que el problema fuera de qué archivo salió cada mitad.
// El JWT de Supabase lleva adentro el `ref` del proyecto: si no coincide con la URL, se
// avisa acá y no se escribe nada. Detalle en ads-agent/docs/ARQUITECTURA-DATOS.md.
if (!DRY) {
  const refUrl = SB_URL.replace(/^https?:\/\//, '').split('.')[0]
  let refKey = null
  try { refKey = JSON.parse(Buffer.from(SB_KEY.split('.')[1], 'base64').toString()).ref } catch { /* no es un JWT */ }
  if (refKey && refUrl && refKey !== refUrl) {
    console.error(`❌ La clave de Supabase no es de este proyecto.`)
    console.error(`   URL   → ${refUrl}`)
    console.error(`   clave → ${refKey}`)
    console.error(`   Poné la service_role de ${refUrl} en ads-agent/.env.local como`)
    console.error(`   MARKETING_SUPABASE_SERVICE_ROLE_KEY, o corré con --dry para solo mirar.`)
    process.exit(1)
  }
}

const dia = (d) => d.toISOString().slice(0, 10)
const desde = dia(new Date(Date.now() - DIAS * 86400e3))
const hasta = dia(new Date())

// El estado REAL de cada campaña. `status` dice lo que configuraste; el que
// manda es `effective_status`, que además mira si el conjunto o la cuenta la
// frenaron. Leer el equivocado hace decir "activo" de algo apagado.
async function estados() {
  const url = `${API}/act_${ACCOUNT}/campaigns?fields=name,effective_status&limit=200&access_token=${TOKEN}`
  const j = await (await fetch(url)).json()
  if (j.error) throw new Error(`Meta: ${j.error.message}`)
  return new Map((j.data || []).map((c) => [c.id, { nombre: c.name, estado: c.effective_status }]))
}

async function gastoDiario() {
  const filas = []
  let url = `${API}/act_${ACCOUNT}/insights?level=campaign&time_increment=1`
    + `&time_range=${encodeURIComponent(JSON.stringify({ since: desde, until: hasta }))}`
    + `&fields=campaign_id,campaign_name,spend,impressions,actions&limit=500&access_token=${TOKEN}`

  while (url) {
    const j = await (await fetch(url)).json()
    if (j.error) throw new Error(`Meta: ${j.error.message}`)
    for (const d of (j.data || [])) {
      const clics = (d.actions || []).find((a) => a.action_type === 'link_click')
      filas.push({
        fecha: d.date_start,
        meta_campana_id: d.campaign_id,
        meta_campana: d.campaign_name,
        spend_usd: Number(d.spend || 0),
        impresiones: Number(d.impressions || 0),
        link_clicks: Number(clics?.value || 0),
      })
    }
    url = j.paging?.next || null
  }
  return filas
}

const [porId, filas] = await Promise.all([estados(), gastoDiario()])
for (const f of filas) {
  const e = porId.get(f.meta_campana_id)
  f.estado = e?.estado || null
}

// Resumen por campaña, que es como se mira.
const resumen = new Map()
for (const f of filas) {
  const r = resumen.get(f.meta_campana_id) || { nombre: f.meta_campana, estado: f.estado, gasto: 0, dias: 0, ultimo: '' }
  r.gasto += f.spend_usd
  if (f.spend_usd > 0) { r.dias++; if (f.fecha > r.ultimo) r.ultimo = f.fecha }
  resumen.set(f.meta_campana_id, r)
}

console.log(`📊 GASTO DE META — del ${desde} al ${hasta}\n`)
for (const [, r] of [...resumen].sort((a, b) => b[1].gasto - a[1].gasto)) {
  const marca = r.estado === 'ACTIVE' ? '●' : '○'
  console.log(`  ${marca} $${r.gasto.toFixed(2).padStart(9)}  ${String(r.dias).padStart(3)} días con gasto  · último ${r.ultimo || '—'}  · ${r.nombre}`)
}
// Las campañas que Meta ya no lista (borradas) igual dejaron gasto: se avisan.
for (const [id, r] of resumen) if (!porId.has(id)) console.log(`     ⚠️ ${r.nombre}: gastó pero Meta ya no la lista (¿borrada?)`)

if (DRY) { console.log('\n(dry run: no se escribió nada)'); process.exit(0) }

for (let i = 0; i < filas.length; i += 300) {
  const lote = filas.slice(i, i + 300).map((f) => ({ ...f, actualizado_en: new Date().toISOString() }))
  const res = await fetch(`${SB_URL}/rest/v1/meta_gasto_diario?on_conflict=fecha,meta_campana_id`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(lote),
  })
  if (!res.ok) { console.error(`❌ Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1) }
}

console.log(`\n✅ ${filas.length} días-campaña guardados en meta_gasto_diario`)
