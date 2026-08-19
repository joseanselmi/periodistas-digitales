/**
 * sincronizar-audiencia-comunidad.mjs — recalcula QUIÉN recibe el semanal y reescribe la lista de Brevo.
 *
 * La audiencia del canal `email-comunidad` es DINÁMICA: no hay una lista hecha a mano que se
 * pudra sola. La regla vive en la vista `v_email_comunidad_audiencia` de Supabase (un solo dueño
 * del criterio) y este script sólo la LEE y deja la lista de Brevo igual a lo que la vista dice.
 *
 * Se corre ANTES de cada envío. Quien abrió algo esta semana vuelve a entrar solo; quien dejó de
 * abrir sale solo — y el script dice cuántos salieron y por qué, para que nadie se vaya callado.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/datos/sincronizar-audiencia-comunidad.mjs              # sólo mira y reporta (default)
 *   node scripts/datos/sincronizar-audiencia-comunidad.mjs --aplicar    # escribe la lista en Brevo
 *   node scripts/datos/sincronizar-audiencia-comunidad.mjs --crear-lista
 *   node scripts/datos/sincronizar-audiencia-comunidad.mjs --audiencia aud.json   # sin Supabase local
 *
 * ⚠️ El default NO escribe. Es al revés que `wa-funnel.js`, donde el default ENVÍA y eso ya costó
 * una tanda de 1.800 mails. Acá hay que pedir `--aplicar` a propósito.
 *
 * Necesita: BREVO_API_KEY (sistema-ingresos/.env.local) · SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * de `periodistas-marketing` — ojo, esa service_role NO está en ningún .env local (ver abajo).
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ⚠️ Una variable VACÍA no es una variable definida. `sistema-ingresos/.env.local` tiene
// `SUPABASE_URL=""` y `SUPABASE_SERVICE_ROLE_KEY=""` porque Vercel no baja las marcadas
// "Sensitive" — y un `??=` las daría por cargadas, dejando afuera el archivo siguiente que sí
// las tiene. Por eso se ignora el valor vacío en vez de asignarlo.
for (const ruta of ['../sistema-ingresos/.env.local', '.env.local', '../.env.local',
                    '../../Leadr/app/.env.local', '../Leadr/app/.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const valor = m[2].trim().replace(/^["']|["']$/g, '')
    if (valor && !process.env[m[1]]) process.env[m[1]] = valor
  }
}

const BREVO   = process.env.BREVO_API_KEY
const SB_URL  = process.env.MARKETING_SUPABASE_URL || process.env.SUPABASE_URL
const SB_KEY  = process.env.MARKETING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const APLICAR = process.argv.includes('--aplicar')
const CREAR   = process.argv.includes('--crear-lista')

// La service_role de `periodistas-marketing` está marcada "Sensitive" en Vercel y el pull la trae
// vacía: localmente NO existe. Para poder correr esto desde la notebook, la audiencia puede venir
// de un JSON exportado con el MCP de Supabase (mismo criterio, misma vista, otro transporte):
//   select json_agg(t) from (select email, nombre, estado, motivo from v_email_comunidad_audiencia) t;
const iArchivo = process.argv.indexOf('--audiencia')
const ARCHIVO  = iArchivo > -1 ? process.argv[iArchivo + 1] : null

// El id de la lista de Brevo del canal. Se guarda acá y no en un .env para que esté a la vista:
// si algún día cambia, cambia en un lugar que se lee, no en una variable que nadie mira.
const LISTA_ID = Number(process.env.BREVO_LISTA_COMUNIDAD || 8)

const brevo = (ruta, opciones = {}) =>
  fetch('https://api.brevo.com/v3' + ruta, {
    ...opciones,
    headers: { 'api-key': BREVO, accept: 'application/json', 'content-type': 'application/json', ...(opciones.headers || {}) },
  })

/** PostgREST corta en 1.000 filas sin avisar: una respuesta truncada se ve igual que una sana. */
async function leerVista(vista, columnas) {
  const filas = []
  for (let desde = 0; ; desde += 1000) {
    const r = await fetch(`${SB_URL}/rest/v1/${vista}?select=${columnas}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Range: `${desde}-${desde + 999}` },
    })
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`)
    const lote = await r.json()
    filas.push(...lote)
    if (lote.length < 1000) return filas
  }
}

/** Todos los contactos que Brevo tiene HOY en la lista, paginando igual que arriba. */
async function contactosDeLaLista(id) {
  const emails = new Map()
  for (let offset = 0; ; offset += 500) {
    const r = await brevo(`/contacts/lists/${id}/contacts?limit=500&offset=${offset}`)
    if (r.status === 404) return null              // la lista todavía no existe
    if (!r.ok) throw new Error(`Brevo ${r.status}: ${await r.text()}`)
    const { contacts = [] } = await r.json()
    for (const c of contacts) emails.set(c.email.toLowerCase(), c)
    if (contacts.length < 500) return emails
  }
}

const enTandas = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

async function main() {
  if (!BREVO) {
    console.error('❌ Falta BREVO_API_KEY (vive en sistema-ingresos/.env.local).')
    return 1
  }

  if (CREAR) {
    const r = await brevo('/contacts/lists', {
      method: 'POST',
      body: JSON.stringify({ name: 'Comunidad - activos (se reescribe sola)', folderId: 1 }),
    })
    const cuerpo = await r.json()
    if (!r.ok) { console.error('❌ Brevo', r.status, cuerpo); return 1 }
    console.log(`✅ Lista creada: id ${cuerpo.id} → si no es ${LISTA_ID}, corregir LISTA_ID en este archivo.`)
    return 0
  }

  if (!ARCHIVO && (!SB_URL || !SB_KEY)) {
    console.error('❌ No hay acceso a Supabase desde acá: la SUPABASE_SERVICE_ROLE_KEY de')
    console.error('   `periodistas-marketing` está marcada "Sensitive" en Vercel y el pull la trae VACÍA.')
    console.error('   Salida: exportar la audiencia con el MCP de Supabase y pasarla con --audiencia <archivo.json>.')
    return 1
  }

  // ── 1. Qué dice la regla, hoy ──────────────────────────────────────────────
  const audiencia = ARCHIVO
    ? JSON.parse(readFileSync(resolve(process.cwd(), ARCHIVO), 'utf-8'))
    : await leerVista('v_email_comunidad_audiencia', 'email,nombre,estado,motivo')

  if (ARCHIVO) console.log(`📄 Audiencia leída de ${ARCHIVO} (export del MCP, no de la vista en vivo).`)

  const deben     = audiencia.filter(p => p.estado === 'activo' || p.estado === 'nuevo')
  const porEstado = audiencia.reduce((a, p) => ({ ...a, [p.estado]: (a[p.estado] || 0) + 1 }), {})

  console.log('\n📋 La regla, recalculada recién:')
  for (const [estado, n] of Object.entries(porEstado).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${estado.padEnd(9)} ${String(n).padStart(5)}`)
  }
  console.log(`   ${'-'.repeat(15)}\n   RECIBEN   ${String(deben.length).padStart(5)}\n`)

  if (!deben.length) {
    console.error('🔴 La regla no devolvió a nadie. Eso casi siempre es un error de datos, no una')
    console.error('   audiencia vacía de verdad: no se toca la lista.')
    return 1
  }

  // ── 2. Qué tiene Brevo hoy ─────────────────────────────────────────────────
  const actuales = await contactosDeLaLista(LISTA_ID)
  if (actuales === null) {
    console.error(`❌ La lista ${LISTA_ID} no existe en Brevo. Correr con --crear-lista.`)
    return 1
  }

  const debenSet = new Set(deben.map(p => p.email))
  const entran   = deben.filter(p => !actuales.has(p.email))
  const salen    = [...actuales.keys()].filter(e => !debenSet.has(e))
  const motivos  = new Map(audiencia.map(p => [p.email, `${p.estado} · ${p.motivo}`]))

  // Los dados de baja no se tocan: Brevo nunca le manda a un blacklisted, así que la baja se
  // respeta sola. Se cuentan igual porque un salto acá es la primera señal de que algo molesta.
  const bajas = [...actuales.values()].filter(c => c.emailBlacklisted).length

  console.log(`📮 Lista ${LISTA_ID}: ${actuales.size} contactos hoy · ${bajas} de baja`)
  console.log(`   entran ${entran.length} · salen ${salen.length} · quedan igual ${deben.length - entran.length}`)

  if (salen.length) {
    console.log('\n   Los que salen (los primeros 10, con el motivo — nadie se va callado):')
    for (const e of salen.slice(0, 10)) console.log(`     · ${e} — ${motivos.get(e) || 'ya no está en leads'}`)
    if (salen.length > 10) console.log(`     ... y ${salen.length - 10} más`)
  }

  if (!APLICAR) {
    console.log('\n🟡 No se escribió nada. Para aplicarlo: --aplicar\n')
    return 0
  }

  // ── 3. Dejar la lista igual a la regla ─────────────────────────────────────
  let sumados = 0
  for (const tanda of enTandas(entran, 100)) {
    const r = await brevo('/contacts/import', {
      method: 'POST',
      body: JSON.stringify({
        listIds: [LISTA_ID],
        updateExistingContacts: true,
        emptyContactsAttributes: false,
        jsonBody: tanda.map(p => ({ email: p.email, attributes: { NOMBRE: p.nombre || '' } })),
      }),
    })
    if (!r.ok) { console.error('  ⚠️ import falló:', r.status, await r.text()); break }
    sumados += tanda.length
  }

  let sacados = 0
  for (const tanda of enTandas(salen, 100)) {
    const r = await brevo(`/contacts/lists/${LISTA_ID}/contacts/remove`, {
      method: 'POST',
      body: JSON.stringify({ emails: tanda }),
    })
    if (!r.ok) { console.error('  ⚠️ remove falló:', r.status, await r.text()); break }
    sacados += tanda.length
  }

  // La verificación no se hace sobre lo que devolvió el POST: se le vuelve a preguntar a Brevo.
  const despues = await contactosDeLaLista(LISTA_ID)
  const ok = despues.size === deben.length
  console.log(`\n${ok ? '✅' : '🔴'} Sumados ${sumados} · sacados ${sacados} · Brevo dice ${despues.size}, la regla dice ${deben.length}`)
  if (!ok) console.log('   No coinciden: revisar ANTES de mandar. Un import de Brevo tarda unos segundos en reflejarse.')
  return ok ? 0 : 1
}

process.exitCode = await main()
