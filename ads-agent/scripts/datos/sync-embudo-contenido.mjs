/**
 * sync-embudo-contenido.mjs — guarda en `funnel_steps` QUÉ DICE cada mail del
 * embudo, para que la página de Campañas de Leadr lo muestre sin que nadie
 * tenga que abrir Brevo ni el código.
 *
 * El original de cada mensaje sigue viviendo donde se manda. Esto baja una copia
 * a la base y anota de dónde salió (`contenido_fuente`) y cuándo (`contenido_
 * actualizado_en`), así la página puede decir "esto es lo que se manda, tomado
 * el 31/07" en vez de mentir con una copia sin fecha.
 *
 *   1. Los mails del funnel de regalos → `contenidoEmbudo()` de
 *      sistema-ingresos/api/wa-funnel.js (la MISMA definición que se envía).
 *   2. El Regalo 2 → plantilla 1 de Brevo (la manda una automatización de Brevo).
 *   3. El Regalo 1 y la guía de republicadores → escenario 9474482 de Make, que
 *      arma el HTML a mano. Como Make no tiene API pública de solo lectura acá,
 *      van transcriptos abajo con su `fuente` apuntando al módulo exacto.
 *
 * Correr desde ads-agent/ (necesita el .env.local de Leadr para las claves):
 *   node scripts/datos/sync-embudo-contenido.mjs
 *   node scripts/datos/sync-embudo-contenido.mjs --dry          # muestra, no escribe
 *   node scripts/datos/sync-embudo-contenido.mjs --sql out.sql  # deja el SQL para aplicar por el MCP
 *
 * (--sql existe porque la service_role de periodistas-marketing está marcada
 * "Sensitive" en Vercel y el pull la trae vacía: sin ella el script no puede
 * escribir solo, pero sí dejar el SQL listo.)
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'

const AQUI = dirname(fileURLToPath(import.meta.url))
const WA_FUNNEL = resolve(AQUI, '../../../sistema-ingresos/api/wa-funnel.js')

for (const ruta of ['../../Leadr/app/.env.local', '../Leadr/app/.env.local', '.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const BREVO_KEY  = process.env.BREVO_API_KEY
const SUPA_URL   = process.env.MARKETING_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_KEY   = process.env.MARKETING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const DRY        = process.argv.includes('--dry')
const SALIDA_SQL = process.argv.includes('--sql') ? process.argv[process.argv.indexOf('--sql') + 1] : null

if (!BREVO_KEY) { console.error('❌ Falta BREVO_API_KEY'); process.exit(1) }
if (!DRY && !SALIDA_SQL && (!SUPA_URL || !SUPA_KEY)) {
  console.error('❌ Faltan MARKETING_SUPABASE_URL / MARKETING_SUPABASE_SERVICE_ROLE_KEY (o usá --dry)')
  process.exit(1)
}

// wa-funnel.js es un handler de Vercel: usa `export default` (ESM) pero adentro
// hace `require('./_lib/wa')`. Vercel se lo banca porque lo empaqueta; Node
// suelto no. Le dejamos un `require` anclado a SU carpeta para poder importarlo
// desde acá. Es solo para leerlo: no cambia nada de cómo corre en producción.
globalThis.require ??= createRequire(pathToFileURL(WA_FUNNEL))
const { contenidoEmbudo } = await import(pathToFileURL(WA_FUNNEL).href)

// ── Los dos mails que arma Make (escenario 9474482) ──────────────────────────
// Transcriptos del blueprint. Si se edita el copy en Make, hay que actualizarlos
// acá y volver a correr el script; la página avisa con la fecha de la copia.
const DESDE_MAKE = [
  {
    tag: 'regalo1-guia-claude',
    subject: 'Tu guía gratis de Claude para periodismo',
    fuente: 'make:9474482#3 (ruta "Formulario Guia Claude")',
    text: 'Tu guía ya está lista. Descargala acá: https://sistemadeingresosdiariosia.com/api/d?file=guia-claude-periodistas.pdf&src=em-guias-r1&sck=email1',
    html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /></head><body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr><td align="center" style="padding:40px 20px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr><tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;"><p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;">Tu guía ya está lista</p><p style="margin:0 0 24px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Acá está lo que pediste: cómo usar Claude para investigar, escribir y editar más rápido como periodista.</p><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"><a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-claude-periodistas.pdf&amp;src=em-guias-r1&amp;sck=email1" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;">Descargar la guía (PDF) →</a></td></tr></table><p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;">En los próximos días te escribimos con algo más: la versión completa, con +50 prompts.</p></td></tr><tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr></table></td></tr></table></body></html>`,
  },
  {
    tag: 'rep-guia-que-te-lean',
    subject: 'Tu guía: que te lean miles, no solo tus amigos',
    fuente: 'make:9474482#30 (ruta "Republicadores")',
    text: `Tu guía ya está lista.

Compartes noticias en tu perfil casi todos los días. Y solo las ven unos pocos. No es que publiques mal: hay cosas que Facebook premia y otras que entierra, y nadie te las contó.

LO QUE VAS A ENCONTRAR
- Por qué el botón compartir te juega en contra, y qué hacer en su lugar
- Cómo escribir el primer renglón para el que no te conoce
- Qué preguntar al final para que te comenten de verdad
- El recuento de 10 minutos que te muestra quién te está leyendo

Descargar la guía (PDF): https://sistemadeingresosdiariosia.com/api/d?file=que-te-lean-miles.pdf&src=em-lectores-r1&sck=emailrep1`,
    html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /></head><body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr><td align="center" style="padding:40px 20px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr><tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;"><p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Tu guía ya está lista</p><p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Compartes noticias en tu perfil casi todos los días. Y solo las ven unos pocos.</p><p style="margin:0 0 24px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">No es que publiques mal. Es que hay cosas que Facebook premia y otras que entierra, y nadie te las contó.</p><p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Lo que vas a encontrar</p><table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;"><tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">Por qué el botón <strong style="color:#ffffff;">compartir</strong> te juega en contra, y qué hacer en su lugar</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">Cómo escribir el <strong style="color:#ffffff;">primer renglón</strong> para el que no te conoce</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">Qué <strong style="color:#ffffff;">preguntar al final</strong> para que te comenten de verdad</td></tr><tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;">El <strong style="color:#ffffff;">recuento de 10 minutos</strong> que te muestra quién te está leyendo</td></tr></table><table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center"><a href="https://sistemadeingresosdiariosia.com/api/d?file=que-te-lean-miles.pdf&amp;src=em-lectores-r1&amp;sck=emailrep1" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;">Descargar la guía (PDF) →</a></td></tr></table><p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Son siete cosas concretas, para aplicar en tu próxima publicación. Sin publicar nada distinto de lo que ya publicas.</p></td></tr><tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibes este correo porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr></table></td></tr></table></body></html>`,
  },
]

// ── El Regalo 2 vive como plantilla de Brevo ─────────────────────────────────
async function desdeBrevo() {
  const r = await fetch('https://api.brevo.com/v3/smtp/templates/1', {
    headers: { 'api-key': BREVO_KEY, accept: 'application/json' },
  })
  if (!r.ok) {
    console.warn(`⚠️  No se pudo leer la plantilla 1 de Brevo (HTTP ${r.status}) — el Regalo 2 queda sin contenido`)
    return []
  }
  const t = await r.json()
  return [{
    tag: 'regalo2-50-prompts',
    subject: t.subject || 'La versión completa: +50 prompts para periodistas',
    html: t.htmlContent || '',
    text: '',
    fuente: `brevo:template-1 (${t.name || 'sin nombre'})`,
  }]
}

const todos = [...contenidoEmbudo(), ...DESDE_MAKE, ...await desdeBrevo()]

const sql = []

for (const c of todos) {
  console.log(`${c.tag.padEnd(24)} ${String(c.html.length).padStart(6)} car. HTML · ${c.subject}`)
  if (DRY) continue

  if (SALIDA_SQL) {
    const txt = v => (v == null || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
    sql.push(
      `update public.funnel_steps set\n` +
      `  contenido_asunto = ${txt(c.subject)},\n` +
      `  contenido_html = ${txt(c.html)},\n` +
      `  contenido_texto = ${txt(c.text)},\n` +
      `  contenido_fuente = ${txt(c.fuente)},\n` +
      `  contenido_actualizado_en = now()\n` +
      `where brevo_tag = ${txt(c.tag)};`
    )
    continue
  }

  const url = `${SUPA_URL}/rest/v1/funnel_steps?brevo_tag=eq.${encodeURIComponent(c.tag)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      contenido_asunto: c.subject,
      contenido_html: c.html,
      contenido_texto: c.text || null,
      contenido_fuente: c.fuente,
      contenido_actualizado_en: new Date().toISOString(),
    }),
  })
  if (!res.ok) { console.error(`   ❌ ${res.status}: ${(await res.text()).slice(0, 200)}`); continue }
  const filas = await res.json()
  if (filas.length === 0) console.warn(`   ⚠️  ningún paso con brevo_tag='${c.tag}' — ¿falta cargarlo en funnel_steps?`)
}

if (SALIDA_SQL) {
  const { writeFileSync } = await import('fs')
  writeFileSync(resolve(SALIDA_SQL), sql.join('\n\n') + '\n')
  console.log(`\n✅ SQL de ${sql.length} mensajes en ${resolve(SALIDA_SQL)}`)
} else {
  console.log(DRY ? '\n(dry run: no se escribió nada)' : `\n✅ ${todos.length} mensajes guardados en funnel_steps`)
}
