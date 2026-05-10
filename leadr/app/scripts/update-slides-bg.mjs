/**
 * update-slides-bg.mjs — Actualiza el fondo de todos los slides existentes en storage
 * Cambia el bg de #020617 (idéntico a la página) a #0F172A (slate-900, claramente distinto)
 *
 * Uso:
 *   node scripts/update-slides-bg.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BRAND = {
  primary:   '#22D3EE',
  secondary: '#7C3AED',
  bg:        '#0F172A',   // ← antes #020617 — ahora slate-900, claramente distinto al fondo de la página
  surface:   '#1E293B',  // ← antes #0F172A — un tono más claro para superficies internas
  text:      '#F8FAFC',
}

// ─── Misma función generateSlidesHTML que en crear-clase.mjs ─────────────────

function generateSlidesHTML(slides, brand) {
  const b = { ...BRAND, ...brand }

  const slideHTML = slides.map((slide) => {
    let content = ''

    if (slide.type === 'title') {
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2.5rem;">
          <h1 style="font-size:2.5rem;font-weight:800;color:${b.text};margin-bottom:1.25rem;line-height:1.2;">${slide.heading || slide.title || ''}</h1>
          ${slide.subheading ? `<p style="font-size:1.15rem;color:${b.primary};opacity:0.9;max-width:600px;line-height:1.6;">${slide.subheading}</p>` : ''}
        </div>`

    } else if (slide.type === 'checklist') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.5rem;">${slide.heading || 'Qué vas a poder hacer'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.items || []).map(item => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1.05rem;line-height:1.5;"><span style="color:${b.primary};font-weight:800;flex-shrink:0;font-size:1.1rem;">✓</span><span>${item}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'bullets') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.85;margin-bottom:1.25rem;font-size:1rem;line-height:1.65;">${slide.subheading}</p>` : ''}
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.bullets || slide.items || []).map(item => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1rem;line-height:1.55;"><span style="color:${b.primary};flex-shrink:0;font-size:1.15rem;margin-top:1px;">→</span><span>${item}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'content') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};font-size:1.05rem;line-height:1.75;opacity:0.9;">${slide.subheading}</p>` : ''}
        </div>`

    } else if (slide.type === 'practice') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Ejemplo real'}</h2>
          <ol style="padding:0 0 0 1.35rem;display:flex;flex-direction:column;gap:0.65rem;margin-bottom:1.35rem;">
            ${(slide.steps || []).map(s => `<li style="color:${b.text};font-size:1rem;line-height:1.55;">${s}</li>`).join('')}
          </ol>
          ${slide.tip ? `<div style="background:${b.primary}18;border-left:3px solid ${b.primary};padding:0.875rem 1.1rem;border-radius:0 8px 8px 0;"><span style="color:${b.primary};font-weight:700;">💡 </span><span style="color:${b.text};font-size:0.95rem;">${slide.tip}</span></div>` : ''}
        </div>`

    } else if (slide.type === 'errors') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:#F87171;margin-bottom:1.25rem;">${slide.heading || 'Errores que valen la pena evitar'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.bullets || slide.items || []).map(e => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1rem;line-height:1.55;"><span style="color:#F87171;flex-shrink:0;font-weight:800;">✗</span><span>${e}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'exercise') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.secondary};margin-bottom:1rem;">${slide.heading || 'Tu ejercicio de hoy'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.8;margin-bottom:1.1rem;font-size:1rem;line-height:1.6;">${slide.subheading}</p>` : ''}
          ${slide.task ? `<div style="background:${b.secondary}22;border:1px solid ${b.secondary}44;padding:1.1rem 1.35rem;border-radius:10px;color:${b.text};font-size:1rem;line-height:1.65;">${slide.task}</div>` : ''}
        </div>`

    } else if (slide.type === 'resources') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Recursos seleccionados'}</h2>
          <div style="display:flex;flex-direction:column;gap:0.65rem;">
            ${(slide.items || []).map(item => {
              const text = typeof item === 'string' ? item : item.text
              const url  = typeof item === 'string' ? '#' : (item.url || '#')
              const tag  = typeof item === 'string' ? '' : (item.tag || '')
              return `<a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.875rem;padding:0.7rem 1rem;background:${b.surface};border:1px solid rgba(255,255,255,0.1);border-radius:8px;text-decoration:none;color:${b.text};font-size:0.95rem;">
                ${tag ? `<span style="background:${b.primary}22;color:${b.primary};font-size:0.72rem;padding:0.2rem 0.5rem;border-radius:4px;font-weight:700;flex-shrink:0;">${tag}</span>` : ''}
                <span>${text}</span>
              </a>`
            }).join('')}
          </div>
        </div>`

    } else if (slide.type === 'diagram') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:0.75rem;">${slide.heading || slide.center || 'Mapa conceptual'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.75;margin-bottom:1.35rem;font-size:0.95rem;line-height:1.65;">${slide.subheading}</p>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:0.65rem;align-items:center;">
            <span style="background:${b.primary};color:${b.bg};padding:0.55rem 1.1rem;border-radius:8px;font-weight:800;font-size:0.95rem;">${slide.center || ''}</span>
            ${(slide.nodes || []).map(node => `<span style="background:${b.surface};border:1px solid ${b.primary}44;color:${b.text};padding:0.55rem 1.1rem;border-radius:8px;font-size:0.9rem;">${node}</span>`).join('')}
          </div>
        </div>`

    } else if (slide.type === 'quote') {
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:2.5rem;text-align:center;">
          <blockquote style="font-size:1.4rem;font-style:italic;color:${b.text};line-height:1.6;margin-bottom:1.25rem;max-width:600px;">"${slide.quote || ''}"</blockquote>
          ${slide.author ? `<cite style="color:${b.primary};font-size:0.9rem;font-weight:600;">— ${slide.author}</cite>` : ''}
        </div>`

    } else {
      content = `<div style="padding:2rem;"><p style="color:${b.text};font-size:1rem;">${slide.heading || slide.subheading || ''}</p></div>`
    }

    return `<div class="slide" style="min-height:100vh;background:${b.bg};display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid rgba(255,255,255,0.06);">${content}</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background: ${b.bg}; color: ${b.text}; }
  html { scroll-snap-type: y mandatory; overflow-y: scroll; }
  .slide { scroll-snap-align: start; }
  a:hover { opacity: 0.85; }
</style>
</head>
<body>${slideHTML}</body>
</html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨 Actualizando fondo de slides: #020617 → #0F172A\n')

  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, title, slides_url, slides_json')
    .not('slides_json', 'is', null)
    .not('slides_url', 'is', null)

  if (error) { console.error('❌ Error leyendo clases:', error.message); process.exit(1) }

  console.log(`📋 ${classes.length} clases a actualizar\n`)

  let ok = 0, fail = 0

  for (const clase of classes) {
    process.stdout.write(`  [${clase.id}] ${clase.title.slice(0, 55)}... `)

    try {
      const json = clase.slides_json
      const slides = json?.slides ?? (Array.isArray(json) ? json : null)
      if (!slides || slides.length === 0) { console.log('(sin slides, salteado)'); continue }

      const html = generateSlidesHTML(slides, BRAND)

      // Extraer path relativo del storage desde la URL pública
      const urlObj = new URL(clase.slides_url)
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/slides\/(.+)/)
      if (!pathMatch) { console.log('⚠️  URL no reconocida'); fail++; continue }
      const storagePath = pathMatch[1]

      const { error: uploadError } = await supabase.storage
        .from('slides')
        .update(storagePath, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: true })

      if (uploadError) throw new Error(uploadError.message)
      console.log('✅')
      ok++
    } catch (err) {
      console.log(`❌ ${err.message}`)
      fail++
    }
  }

  console.log(`\n${'═'.repeat(50)}`)
  console.log(`✅ Actualizadas: ${ok} | ❌ Fallidas: ${fail}`)
  console.log('Recargá cualquier clase para ver el nuevo fondo.\n')
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1) })
