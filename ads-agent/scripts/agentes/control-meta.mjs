/**
 * control-meta.mjs — Pausar/reanudar anuncios y cambiar presupuestos en Meta Ads
 *
 * SEGURIDAD: por default corre en modo DRY-RUN (solo muestra qué haría).
 * Para ejecutar de verdad hay que agregar --confirm explícitamente.
 *
 * Uso:
 *   node scripts/agentes/control-meta.mjs status   --type ad|adset|campaign --id <id>
 *   node scripts/agentes/control-meta.mjs pause    --type ad|adset|campaign --id <id> [--confirm]
 *   node scripts/agentes/control-meta.mjs resume   --type ad|adset|campaign --id <id> [--confirm]
 *   node scripts/agentes/control-meta.mjs budget   --type adset|campaign    --id <id> --daily <monto_en_centavos> [--confirm]
 *
 * Ejemplos:
 *   node scripts/agentes/control-meta.mjs status --type campaign --id 1234567890
 *   node scripts/agentes/control-meta.mjs pause  --type ad       --id 1234567890 --confirm
 *   node scripts/agentes/control-meta.mjs budget --type adset    --id 1234567890 --daily 500 --confirm   (= $5.00/día)
 *
 * Variables requeridas: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 */

const TOKEN = process.env.META_ACCESS_TOKEN
const API_VERSION = 'v21.0'
const BASE = `https://graph.facebook.com/${API_VERSION}`

if (!TOKEN) {
  console.error('\n❌ Falta META_ACCESS_TOKEN')
  process.exit(1)
}

function argVal(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : null
}

const COMMAND  = process.argv[2]
const TYPE     = argVal('--type')   // ad | adset | campaign
const ID       = argVal('--id')
const DAILY    = argVal('--daily') // en centavos de la moneda de la cuenta
const CONFIRM  = process.argv.includes('--confirm')

const VALID_COMMANDS = ['status', 'pause', 'resume', 'budget']
const VALID_TYPES    = ['ad', 'adset', 'campaign']

if (!VALID_COMMANDS.includes(COMMAND)) {
  console.error(`❌ Comando inválido. Usar: ${VALID_COMMANDS.join(' | ')}`)
  process.exit(1)
}
if (!TYPE || !VALID_TYPES.includes(TYPE)) {
  console.error(`❌ Falta --type válido (${VALID_TYPES.join(' | ')})`)
  process.exit(1)
}
if (!ID) {
  console.error('❌ Falta --id')
  process.exit(1)
}
if (COMMAND === 'budget' && !DAILY) {
  console.error('❌ Falta --daily (en centavos, ej: 500 = $5.00)')
  process.exit(1)
}

// El endpoint plural correcto para cada tipo (campaign/adset/ad usan su propio nodo singular en la API)
const NODE_PATH = { ad: 'ads', adset: 'adsets', campaign: 'campaigns' }

async function apiGet(path, params = {}) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', TOKEN)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.error) throw new Error(`Meta API [${path}]: ${data.error.message} (code ${data.error.code})`)
  return data
}

async function apiPost(path, body) {
  const url = new URL(`${BASE}${path}`)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: TOKEN }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Meta API [${path}]: ${data.error.message} (code ${data.error.code})`)
  return data
}

async function getStatus(id, type) {
  const fields = type === 'campaign'
    ? 'id,name,status,effective_status,daily_budget,lifetime_budget'
    : type === 'adset'
    ? 'id,name,status,effective_status,daily_budget,lifetime_budget,campaign_id'
    : 'id,name,status,effective_status,adset_id,campaign_id'
  return apiGet(`/${id}`, { fields })
}

async function main() {
  console.log(`\n🎛️  META ADS CONTROL — ${COMMAND.toUpperCase()} (${TYPE} ${ID})`)

  const current = await getStatus(ID, TYPE)
  console.log('   Estado actual:', JSON.stringify(current, null, 2).split('\n').join('\n   '))

  if (COMMAND === 'status') return

  if (!CONFIRM) {
    console.log('\n🟡 DRY-RUN — no se ejecutó ningún cambio real.')
    console.log('   Agregá --confirm al final del comando para aplicar el cambio de verdad.')
    if (COMMAND === 'pause')  console.log(`   Acción que se haría: status → PAUSED`)
    if (COMMAND === 'resume') console.log(`   Acción que se haría: status → ACTIVE`)
    if (COMMAND === 'budget') console.log(`   Acción que se haría: daily_budget → ${DAILY} (centavos)`)
    return
  }

  let result
  if (COMMAND === 'pause')  result = await apiPost(`/${ID}`, { status: 'PAUSED' })
  if (COMMAND === 'resume') result = await apiPost(`/${ID}`, { status: 'ACTIVE' })
  if (COMMAND === 'budget') result = await apiPost(`/${ID}`, { daily_budget: DAILY })

  console.log('\n✅ Cambio aplicado:', JSON.stringify(result))

  const after = await getStatus(ID, TYPE)
  console.log('   Estado nuevo:', JSON.stringify(after, null, 2).split('\n').join('\n   '))
}

main().catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})
