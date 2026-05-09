/**
 * publish.mjs — Publica ads reales en Meta via Marketing API
 * Uso: node publish.mjs campaigns/2026-05-08-v2/config.json
 * Variables: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 *
 * Flujo:
 *   1. Lee config.json con los ad sets definidos
 *   2. Crea campaña (o usa existente por nombre)
 *   3. Por cada ad set: crea adset + sube imagen + crea creative + crea ad
 *   4. Todos en estado PAUSED — vos los activás manualmente en Meta
 */

import { readFileSync, writeFileSync } from 'fs'

const TOKEN   = process.env.META_ACCESS_TOKEN
const ACCOUNT = process.env.META_AD_ACCOUNT_ID?.replace('act_', '')
const PAGE_ID = process.env.META_PAGE_ID || '439763019230527'
const BASE    = 'https://graph.facebook.com/v21.0'

if (!TOKEN || !ACCOUNT) {
  console.error('❌ Faltan META_ACCESS_TOKEN y/o META_AD_ACCOUNT_ID')
  process.exit(1)
}

const configPath = process.argv[2]
if (!configPath) {
  console.error('Uso: node publish.mjs campaigns/FECHA/config.json')
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'))

// ─── API helper ───────────────────────────────────────────────────────────────

async function api(method, path, body = null) {
  const url = new URL(`${BASE}${path}`)
  if (method === 'GET') url.searchParams.set('access_token', TOKEN)

  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (method !== 'GET') {
    opts.body = JSON.stringify({ ...body, access_token: TOKEN })
  }

  const res  = await fetch(url.toString(), opts)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API [${path}]: ${data.error.message} (code ${data.error.code})`)
  }
  return data
}

// ─── 1. Crear o reusar campaña ────────────────────────────────────────────────

async function getOrCreateCampaign() {
  console.log('\n📋 Creando campaña...')

  const campaign = await api('POST', `/act_${ACCOUNT}/campaigns`, {
    name:               config.name,
    objective:          config.objective || 'OUTCOME_SALES',
    status:             'PAUSED',
    special_ad_categories: [],
    buying_type:        'AUCTION',
  })

  console.log(`   ✅ Campaña creada: ${campaign.id}`)
  return campaign.id
}

// ─── 2. Subir imagen desde URL ────────────────────────────────────────────────

async function uploadImageFromUrl(imageUrl) {
  if (!imageUrl) return null

  console.log(`   📸 Subiendo imagen...`)

  // Descargar la imagen
  const imgRes    = await fetch(imageUrl)
  const buffer    = await imgRes.arrayBuffer()
  const bytes     = Buffer.from(buffer)
  const b64       = bytes.toString('base64')

  const result = await api('POST', `/act_${ACCOUNT}/adimages`, {
    bytes: b64,
  })

  const hash = Object.values(result.images || {})[0]?.hash
  if (!hash) throw new Error('No se pudo obtener hash de la imagen')
  console.log(`   ✅ Imagen subida: hash ${hash}`)
  return hash
}

// ─── 3. Crear ad set ──────────────────────────────────────────────────────────

async function createAdSet(campaignId, adSet) {
  console.log(`\n   Creando ad set: ${adSet.name}`)

  const targeting = buildTargeting(adSet.targeting)

  const result = await api('POST', `/act_${ACCOUNT}/adsets`, {
    name:              adSet.name,
    campaign_id:       campaignId,
    status:            'PAUSED',
    daily_budget:      Math.round((adSet.dailyBudget || 10) * 100), // en centavos
    optimization_goal: adSet.optimization || 'OFFSITE_CONVERSIONS',
    billing_event:     'IMPRESSIONS',
    targeting,
    promoted_object: {
      pixel_id:        config.pixel,
      custom_event_type: 'PURCHASE',
    },
  })

  console.log(`   ✅ Ad set creado: ${result.id}`)
  return result.id
}

function buildTargeting(t) {
  const targeting = {
    age_min: t.ageMin || 25,
    age_max: t.ageMax || 65,
    brand_safety_content_filter_levels: ['FACEBOOK_RELAXED', 'AN_RELAXED'],
    targeting_automation: { advantage_audience: 1 },
  }

  if (t.countries?.length) {
    targeting.geo_locations = {
      countries: t.countries,
      location_types: ['home', 'recent'],
    }
  } else {
    targeting.geo_locations = {
      country_groups: ['worldwide'],
      location_types: ['home', 'recent'],
    }
    targeting.excluded_geo_locations = {
      countries: ['IN', 'LY', 'MZ', 'PK', 'VE', 'AU', 'BR', 'TW', 'BD', 'NI'],
      location_types: ['home', 'recent'],
    }
  }

  if (t.language) {
    targeting.locales = t.language.includes('es') ? [23] : []
  } else {
    targeting.locales = [23]
  }

  return targeting
}

// ─── 4. Crear ad creative ─────────────────────────────────────────────────────

async function createCreative(adSet, imageHash) {
  console.log(`   🎨 Creando creative...`)

  const creative = await api('POST', `/act_${ACCOUNT}/adcreatives`, {
    name: `Creative — ${adSet.name}`,
    object_story_spec: {
      page_id: PAGE_ID,
      link_data: {
        message:     adSet.primaryText,
        link:        config.landingUrl,
        name:        adSet.headline,
        description: adSet.description || '',
        call_to_action: {
          type:  adSet.cta || 'LEARN_MORE',
          value: { link: config.landingUrl },
        },
        ...(imageHash ? { image_hash: imageHash } : {}),
      },
    },
    degrees_of_freedom_spec: {
      creative_features_spec: {
        standard_enhancements: { enroll_status: 'OPT_OUT' },
      },
    },
  })

  console.log(`   ✅ Creative creado: ${creative.id}`)
  return creative.id
}

// ─── 5. Crear ad ──────────────────────────────────────────────────────────────

async function createAd(adSetId, creativeId, name) {
  console.log(`   📢 Creando ad...`)

  const ad = await api('POST', `/act_${ACCOUNT}/ads`, {
    name,
    adset_id:    adSetId,
    creative:    { creative_id: creativeId },
    status:      'PAUSED',
    tracking_specs: [{
      action: ['offsite_conversion'],
      'fb_pixel': [config.pixel],
    }],
  })

  console.log(`   ✅ Ad creado: ${ad.id}`)
  return ad.id
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n🚀 PUBLISH — META ADS')
console.log(`   Campaña: ${config.name}`)
console.log(`   Account: act_${ACCOUNT}`)
console.log(`   Landing: ${config.landingUrl}`)
console.log(`   Ads a publicar: ${config.adSets.length}`)
console.log('\n⚠️  Todos los ads se crean en PAUSED — activálos manualmente en Meta cuando estés listo.\n')

const results = []
let campaignId

try {
  campaignId = await getOrCreateCampaign()
} catch (e) {
  console.error('❌ Error creando campaña:', e.message)
  process.exit(1)
}

for (const adSet of config.adSets) {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`AD SET: ${adSet.name}`)
  console.log('─'.repeat(50))

  try {
    const adSetId    = await createAdSet(campaignId, adSet)
    const imageHash  = adSet.imageUrl ? await uploadImageFromUrl(adSet.imageUrl) : null
    const creativeId = await createCreative(adSet, imageHash)
    const adId       = await createAd(adSetId, creativeId, adSet.name)

    results.push({ name: adSet.name, adSetId, creativeId, adId, status: 'OK' })
    console.log(`\n   🟢 ${adSet.name} — listo`)
  } catch (e) {
    console.error(`\n   🔴 Error en "${adSet.name}":`, e.message)
    results.push({ name: adSet.name, status: 'ERROR', error: e.message })
  }
}

// Guardar resultado
const outPath = configPath.replace('config.json', 'published.json')
writeFileSync(outPath, JSON.stringify({ campaignId, results, publishedAt: new Date().toISOString() }, null, 2))

console.log(`\n${'═'.repeat(50)}`)
console.log('RESUMEN')
console.log('═'.repeat(50))
results.forEach(r => {
  const icon = r.status === 'OK' ? '🟢' : '🔴'
  console.log(`${icon} ${r.name}`)
})
console.log(`\n📁 Resultado guardado: ${outPath}`)
console.log('\n👉 Próximo paso: entrá a Meta Ads Manager y activá los ads cuando estés listo.')
