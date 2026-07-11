/**
 * qa-salud-sitio.mjs — Chequeo de salud del sitio del curso (velocidad + botones/links rotos)
 *
 * Qué hace, en cada corrida, sobre el sitio EN VIVO (sistemadeingresosdiariosia.com):
 *   1) VELOCIDAD  — por página: TTFB, tamaño del HTML, cantidad y peso de assets
 *      (CSS/JS/imágenes/fuentes), tiempo total de carga simulando un celular.
 *      Marca 🔴 lo lento/pesado (TTFB > 1s, assets > 500 KB, página > 3 MB).
 *      Si hay GOOGLE_PSI_KEY en el entorno, además trae score Lighthouse + LCP/CLS.
 *   2) BOTONES/LINKS — junta TODOS los links y botones de cada página (incluido el
 *      checkout de Hotmart) y verifica que ninguno esté roto (404 / caído / sin destino).
 *
 * Salida:
 *   - Reporte legible por consola.
 *   - Escribe reporte-salud-sitio.md (para leer) y reporte-salud-sitio.json
 *     (para que el email diario del Panel de Salud lo levante).
 *
 * Uso:
 *   node qa-salud-sitio.mjs                 # todas las páginas
 *   node qa-salud-sitio.mjs --solo-links    # saltea velocidad (más rápido)
 *   node qa-salud-sitio.mjs --solo-velocidad
 *   GOOGLE_PSI_KEY=xxx node qa-salud-sitio.mjs   # con Lighthouse real
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://sistemadeingresosdiariosia.com'

// User-agent de celular (el tráfico de ads entra por mobile)
const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

// Páginas del curso que se sirven en el dominio (ruta pública)
const PAGES = [
  { path: '/', nombre: 'Landing principal (index)' },
  { path: '/landing.html', nombre: 'Landing (landing.html)' },
  { path: '/landing-leadgen-v1.html', nombre: 'Landing LeadGen $1' },
  { path: '/gracias.html', nombre: 'Gracias (post-compra)' },
  { path: '/guia-5-pilares-ingresos-periodico-digital.html', nombre: 'Guía 5 pilares' },
  { path: '/guia-agentes-ia-periodistas.html', nombre: 'Guía agentes IA' },
  { path: '/guia-claude-periodistas.html', nombre: 'Guía Claude' },
  { path: '/guia-completa-50-prompts.html', nombre: 'Guía 50 prompts' },
  { path: '/guia-periodico-digital-ig-fb.html', nombre: 'Guía periódico IG/FB' },
  { path: '/upsell-periodico/espera.html', nombre: 'Upsell (espera)' },
]

const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => [a.replace(/^--/, ''), true])
)
const SOLO_LINKS = !!flags['solo-links']
const SOLO_VELOCIDAD = !!flags['solo-velocidad']
const PSI_KEY = process.env.GOOGLE_PSI_KEY

const kb = b => (b / 1024).toFixed(0)
const mb = b => (b / 1024 / 1024).toFixed(2)
const abs = (href, pageUrl) => {
  try { return new URL(href, pageUrl).href } catch { return null }
}

// --- descarga con tiempo ---
async function timedFetch(url, opts = {}) {
  const t0 = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA_MOBILE, accept: '*/*', ...(opts.headers || {}) },
      signal: AbortSignal.timeout(opts.timeout || 20000),
      method: opts.method || 'GET',
    })
    let bytes = 0
    if (opts.method !== 'HEAD') {
      const buf = await res.arrayBuffer()
      bytes = buf.byteLength
      return { ok: res.ok, status: res.status, ms: Date.now() - t0, bytes, body: opts.wantBody ? Buffer.from(buf).toString('utf8') : null, finalUrl: res.url }
    }
    return { ok: res.ok, status: res.status, ms: Date.now() - t0, bytes: 0, finalUrl: res.url }
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, bytes: 0, error: e.name === 'TimeoutError' ? 'timeout' : e.message }
  }
}

// --- extraer assets (para peso/velocidad) y links (para botones rotos) ---
function extraer(html, pageUrl) {
  const assets = new Set()
  const links = new Set()
  // assets que pesan en la carga
  for (const m of html.matchAll(/<(?:script|img|source)[^>]+src=["']([^"']+)["']/gi)) {
    const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) assets.add(u)
  }
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)) {
    if (/rel=["'](stylesheet|preload|icon)/i.test(m[0])) {
      const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) assets.add(u)
    }
  }
  // links y botones navegables
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) {
    const raw = m[1].trim()
    if (/^(mailto:|tel:|javascript:|#)/i.test(raw) || raw === '') continue
    const u = abs(raw, pageUrl); if (u && /^https?:/.test(u)) links.add(u)
  }
  // botones que navegan por JS (onclick / data-href / location)
  for (const m of html.matchAll(/(?:data-href|onclick)=["']([^"']*(?:https?:\/\/|\/)[^"']*)["']/gi)) {
    const mm = m[1].match(/(https?:\/\/[^"'\s)]+|\/[A-Za-z0-9._\-/?=&%]+)/)
    if (mm) { const u = abs(mm[1], pageUrl); if (u && /^https?:/.test(u)) links.add(u) }
  }
  for (const m of html.matchAll(/(?:location\.href|window\.location(?:\.href)?)\s*=\s*["']([^"']+)["']/gi)) {
    const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) links.add(u)
  }
  // form action (checkout)
  for (const m of html.matchAll(/<form[^>]+action=["']([^"']+)["']/gi)) {
    const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) links.add(u)
  }
  return { assets: [...assets], links: [...links] }
}

const esInterno = url => url.startsWith(BASE)
const esCheckout = url => /hotmart\.com|pay\.hotmart/i.test(url)

// --- Lighthouse opcional (solo si hay API key) ---
async function psi(pageUrl) {
  if (!PSI_KEY) return null
  const u = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&strategy=mobile&category=performance&key=${PSI_KEY}`
  try {
    const j = await (await fetch(u, { signal: AbortSignal.timeout(45000) })).json()
    if (j.error) return { error: `${j.error.code}` }
    const lr = j.lighthouseResult
    return {
      score: Math.round(lr.categories.performance.score * 100),
      lcp: lr.audits['largest-contentful-paint'].displayValue,
      cls: lr.audits['cumulative-layout-shift'].displayValue,
      fcp: lr.audits['first-contentful-paint'].displayValue,
    }
  } catch (e) { return { error: e.message } }
}

// ------------------------------------------------------------------
async function main() {
  const out = { fecha: new Date().toISOString(), base: BASE, velocidad: [], links: { total: 0, rotos: [], ok: 0 }, resumen: {} }
  const linksVistos = new Map() // url -> resultado (cachear, no re-chequear)

  console.log(`\n🩺 SALUD DEL SITIO — ${BASE}`)
  console.log('   ' + new Date().toLocaleString('es-AR'))
  if (!PSI_KEY) console.log('   (velocidad medida por descarga real — sin GOOGLE_PSI_KEY no hay LCP/CLS Lighthouse)')

  for (const page of PAGES) {
    const pageUrl = BASE + page.path
    const main = await timedFetch(pageUrl, { wantBody: true })

    // --- VELOCIDAD ---
    if (!SOLO_LINKS) {
      const v = { pagina: page.nombre, path: page.path, status: main.status, ttfbHtmlMs: main.ms, htmlBytes: main.bytes, assets: 0, pesoTotalBytes: main.bytes, assetsLentos: [], alertas: [] }
      if (main.ok && main.body) {
        const { assets } = extraer(main.body, pageUrl)
        const results = await Promise.all(assets.slice(0, 40).map(a => timedFetch(a, { timeout: 15000 }).then(r => ({ url: a, ...r }))))
        v.assets = results.length
        for (const r of results) {
          v.pesoTotalBytes += r.bytes
          if (r.bytes > 500 * 1024) v.assetsLentos.push({ url: r.url.replace(BASE, ''), kb: kb(r.bytes) })
          if (!r.ok && r.status !== 0) v.alertas.push(`asset ${r.status}: ${r.url.slice(0, 60)}`)
        }
      }
      // veredicto
      if (main.ms > 1000) v.alertas.push(`TTFB lento (${main.ms}ms)`)
      if (v.pesoTotalBytes > 3 * 1024 * 1024) v.alertas.push(`página pesada (${mb(v.pesoTotalBytes)} MB)`)
      if (!main.ok) v.alertas.push(`la página no cargó (status ${main.status || main.error})`)
      if (PSI_KEY) v.psi = await psi(pageUrl)
      out.velocidad.push(v)

      const flag = v.alertas.length ? '🔴' : '✅'
      const psiTxt = v.psi && !v.psi.error ? `  PSI:${v.psi.score} LCP:${v.psi.lcp}` : ''
      console.log(`\n${flag} ${page.nombre}  (${page.path})`)
      console.log(`   carga: TTFB ${main.ms}ms · HTML ${kb(main.htmlBytes || main.bytes)}KB · ${v.assets} assets · peso total ${mb(v.pesoTotalBytes)}MB${psiTxt}`)
      if (v.assetsLentos.length) console.log(`   ⚠️ assets pesados: ${v.assetsLentos.map(a => `${a.url} (${a.kb}KB)`).join(', ')}`)
      if (v.alertas.length) console.log(`   🔴 ${v.alertas.join(' · ')}`)
    }

    // --- LINKS / BOTONES ---
    if (!SOLO_VELOCIDAD && main.body) {
      const { links } = extraer(main.body, pageUrl)
      for (const url of links) {
        if (!linksVistos.has(url)) {
          // Hotmart/externos bloquean HEAD → GET con UA de navegador
          const r = await timedFetch(url, { timeout: 15000 })
          linksVistos.set(url, r)
        }
        const r = linksVistos.get(url)
        out.links.total++
        // 403/429 en externos = el server bloqueó el chequeo, NO está roto
        const bloqueado = !esInterno(url) && (r.status === 403 || r.status === 429)
        if (r.ok || (r.status >= 200 && r.status < 400) || bloqueado) {
          out.links.ok++
        } else {
          out.links.rotos.push({ desde: page.path, url, status: r.status || r.error, tipo: esCheckout(url) ? 'CHECKOUT' : esInterno(url) ? 'interno' : 'externo' })
        }
      }
    }
  }

  // --- LINKS: reporte ---
  if (!SOLO_VELOCIDAD) {
    console.log(`\n\n🔗 BOTONES / LINKS — ${out.links.total} chequeados, ${out.links.ok} OK, ${out.links.rotos.length} rotos`)
    if (out.links.rotos.length === 0) {
      console.log('   ✅ Ningún botón/link roto. El checkout responde.')
    } else {
      for (const r of out.links.rotos) {
        const icon = r.tipo === 'CHECKOUT' ? '🚨 CHECKOUT ROTO' : '🔴'
        console.log(`   ${icon} [${r.status}] ${r.url}\n        (en ${r.desde})`)
      }
    }
  }

  // --- resumen + veredicto global ---
  const paginasConAlerta = out.velocidad.filter(v => v.alertas.length).length
  const checkoutRoto = out.links.rotos.some(r => r.tipo === 'CHECKOUT')
  out.resumen = {
    paginas: PAGES.length,
    paginasConAlertaVelocidad: paginasConAlerta,
    linksChequeados: out.links.total,
    linksRotos: out.links.rotos.length,
    checkoutRoto,
    veredicto: checkoutRoto ? '🚨 CHECKOUT ROTO' : (paginasConAlerta || out.links.rotos.length) ? '⚠️ hay avisos' : '✅ todo sano',
  }

  console.log(`\n\n📋 VEREDICTO: ${out.resumen.veredicto}`)
  console.log(`   ${PAGES.length} páginas · ${paginasConAlerta} con aviso de velocidad · ${out.links.rotos.length} links rotos${checkoutRoto ? ' · ⚠️ INCLUYE EL CHECKOUT' : ''}\n`)

  // --- escribir archivos ---
  writeFileSync(join(__dirname, 'reporte-salud-sitio.json'), JSON.stringify(out, null, 2))
  writeFileSync(join(__dirname, 'reporte-salud-sitio.md'), toMarkdown(out))
  console.log('   → reporte-salud-sitio.md  y  reporte-salud-sitio.json escritos.\n')
}

function toMarkdown(out) {
  const l = []
  l.push(`# 🩺 Salud del sitio — ${new Date(out.fecha).toLocaleString('es-AR')}`)
  l.push(`\n**Veredicto: ${out.resumen.veredicto}**`)
  l.push(`\n${out.resumen.paginas} páginas · ${out.resumen.paginasConAlertaVelocidad} con aviso de velocidad · ${out.resumen.linksRotos} links rotos\n`)
  l.push(`## Velocidad de carga`)
  l.push(`| Página | TTFB | Peso total | Assets | Estado |`)
  l.push(`|---|---|---|---|---|`)
  for (const v of out.velocidad) {
    const est = v.alertas.length ? '🔴 ' + v.alertas.join('; ') : '✅'
    l.push(`| ${v.pagina} | ${v.ttfbHtmlMs}ms | ${mb(v.pesoTotalBytes)}MB | ${v.assets} | ${est} |`)
  }
  l.push(`\n## Botones / links`)
  l.push(`${out.links.total} chequeados · ${out.links.ok} OK · **${out.links.rotos.length} rotos**\n`)
  if (out.links.rotos.length === 0) l.push(`✅ Ningún botón/link roto. El checkout responde.`)
  else for (const r of out.links.rotos) l.push(`- ${r.tipo === 'CHECKOUT' ? '🚨 **CHECKOUT**' : '🔴'} [${r.status}] ${r.url} _(en ${r.desde})_`)
  return l.join('\n') + '\n'
}

main().catch(e => { console.error('\n❌ Error:', e.message); process.exit(1) })
