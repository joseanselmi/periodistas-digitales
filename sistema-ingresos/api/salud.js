// api/salud.js — PANEL DE SALUD de todos los flujos automatizados, en UN solo email diario.
//
// Lee el estado real de cada flujo (Supabase + Brevo), lo INTERPRETA (✅ sano / 🟡 aviso /
// 🔴 problema + POR QUÉ, en criollo) y arma un correo con una sección clara y separada por
// flujo. Es el "uno con todo" que pidió Jose — reemplaza los reportes sueltos de cada flujo
// (que se apagan) para no llenar la casilla. Ver memoria: verificación interpretada.
//
// La idea de fondo: un OBSERVADOR externo que mira los datos que deja cada flujo y avisa si
// algo no está logrando su objetivo — no "¿se ejecutó?", sino "¿está funcionando de verdad?".
//
// MODOS (?mode=): json (diagnóstico sin enviar, para revisar) | send | cron (manda el email).
// SEGURIDAD: CRON_SECRET (header Authorization: Bearer <secret> o ?key=<secret>).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, WHATSAPP_TOKEN, CRON_SECRET.

const BREVO = 'https://api.brevo.com/v3';
const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const LIST_ID = 5;
const REPORTE_A = 'joseanselmi27@gmail.com';
const SENDER = { name: 'Panel de Salud', email: 'jose@sistemadeingresosdiariosia.com' };

// Lectura best-effort de Supabase (REST con service_role). Devuelve null si falla.
async function sb(path) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function hace(iso) {
  if (!iso) return 'nunca';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const h = Math.floor((Date.now() - t) / 3600000);
  if (h < 1) return 'hace menos de 1 h';
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}
function horas(iso) {
  const t = new Date(iso).getTime();
  return isNaN(t) ? 0 : (Date.now() - t) / 3600000;
}

const PEOR = { ok: 0, alerta: 1, critico: 2 };
function peor(a, b) { return PEOR[b] > PEOR[a] ? b : a; }

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 1 — Funnel de regalos (WhatsApp). Objetivo real: que la gente LLEGUE a la oferta.
// ─────────────────────────────────────────────────────────────────────────────
async function saludFunnel() {
  const key = process.env.BREVO_API_KEY;
  const met = {}; const puntos = []; let nivel = 'ok';
  try {
    const all = []; let off = 0;
    for (let i = 0; i < 20; i++) {
      const r = await fetch(`${BREVO}/contacts/lists/${LIST_ID}/contacts?limit=500&offset=${off}`, { headers: { 'api-key': key, accept: 'application/json' } });
      if (!r.ok) throw new Error(`Brevo ${r.status}`);
      const j = await r.json(); const b = j.contacts || []; all.push(...b);
      if (b.length < 500) break; off += 500;
    }
    let oferta = 0, r4 = 0, r3 = 0, sinreg = 0;
    for (const c of all) { const s = Number((c.attributes || {}).WA_STAGE || 0); if (s >= 5) oferta++; else if (s === 4) r4++; else if (s === 3) r3++; else sinreg++; }
    Object.assign(met, { oferta, regalo4: r4, regalo3: r3, sin_regalo: sinreg, total: all.length });
    if (oferta === 0 && (r4 + r3) > 20) {
      nivel = 'critico';
      puntos.push(`0 personas recibieron la OFERTA (el mensaje que vende) pese a ${r4 + r3} en etapas previas. El embudo no está completando hasta la venta — revisar el funnel.`);
    } else {
      puntos.push(`La oferta llegó a ${oferta} personas. En camino: ${r4} en Regalo 4, ${r3} en Regalo 3.`);
    }
  } catch (e) { nivel = 'alerta'; puntos.push(`No se pudo leer el estado del funnel (${e.message || e}).`); }
  return { flujo: '🎁 Funnel de regalos (WhatsApp)', que_mira: 'Que los leads avancen hasta la oferta.', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 2 — Recuperación de carritos/rechazos. Objetivo: recontactar y recuperar ventas.
// ─────────────────────────────────────────────────────────────────────────────
async function saludRecuperacion() {
  const met = {}; const puntos = []; let nivel = 'ok';
  const rows = await sb('clientes_potenciales?select=estado_recuperacion,tipo');
  if (rows == null) { return { flujo: '🛒 Recuperación de carritos', que_mira: 'Recontactar a quien no completó la compra.', nivel: 'alerta', puntos: ['No se pudo leer la base de recuperación.'], met }; }
  const est = {}; const tipo = {};
  for (const r of rows) { est[r.estado_recuperacion] = (est[r.estado_recuperacion] || 0) + 1; tipo[r.tipo] = (tipo[r.tipo] || 0) + 1; }
  Object.assign(met, { pendientes: est.pendiente || 0, contactados: est.contactado || 0, recuperados: est.recuperado || 0, perdidos: est.perdido || 0, total: rows.length });
  if ((est.pendiente || 0) > 0) {
    nivel = 'alerta';
    puntos.push(`Hay ${est.pendiente} sin contactar todavía — deberían recibir el 1er mensaje en la próxima corrida. Si no baja, algo frena el envío.`);
  }
  puntos.push(`En seguimiento: ${(est.contactado || 0)} · recuperados (compraron): ${(est.recuperado || 0)} · perdidos: ${(est.perdido || 0)}.`);
  return { flujo: '🛒 Recuperación de carritos', que_mira: 'Recontactar a quien no completó la compra.', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 3 — Asistente / Puente WhatsApp↔Telegram. Objetivo: nadie queda sin respuesta.
// ─────────────────────────────────────────────────────────────────────────────
async function saludAsistente() {
  const met = {}; const puntos = []; let nivel = 'ok';
  const esperando = await sb('wa_bot_estado?modo=eq.esperando&select=telefono,escalado_en');
  if (esperando == null) { return { flujo: '💬 Asistente de WhatsApp', que_mira: 'Que ningún cliente quede sin respuesta.', nivel: 'alerta', puntos: ['No se pudo leer el estado del asistente.'], met }; }
  const viejas = esperando.filter((r) => r.escalado_en && horas(r.escalado_en) > 6);
  met.escalaciones_esperando = esperando.length;
  met.sin_responder_6h = viejas.length;
  if (viejas.length > 0) {
    nivel = 'critico';
    const masVieja = viejas.map((r) => r.escalado_en).sort()[0];
    puntos.push(`${viejas.length} persona(s) pidió hablar con vos y sigue(n) sin respuesta (la más vieja, ${hace(masVieja)}). Están esperando en WhatsApp.`);
  } else if (esperando.length > 0) {
    nivel = 'alerta';
    puntos.push(`${esperando.length} escalación(es) reciente(s) esperando respuesta (menos de 6 h). Revisá tu Telegram.`);
  } else {
    puntos.push('Ninguna conversación quedó esperando respuesta. El bot está atendiendo solo.');
  }
  return { flujo: '💬 Asistente de WhatsApp', que_mira: 'Que ningún cliente quede sin respuesta.', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 4 — Post-compra (webhook Hotmart → ventas + clientes). Objetivo: registrar cada venta.
// ─────────────────────────────────────────────────────────────────────────────
async function saludPostCompra() {
  const met = {}; const puntos = []; let nivel = 'ok';
  const ventas = await sb('ventas?select=email,ocurrido_en');
  const customers = await sb('customers?select=email');
  if (ventas == null || customers == null) { return { flujo: '🟢 Post-compra (Hotmart)', que_mira: 'Que cada venta quede registrada (venta + cliente + bono).', nivel: 'alerta', puntos: ['No se pudo leer ventas/clientes.'], met }; }
  const emailsVenta = new Set(ventas.map((v) => String(v.email || '').toLowerCase().trim()).filter(Boolean));
  const distintos = emailsVenta.size; // compradores únicos (las ventas pueden repetir email)
  const ultima = ventas.map((v) => v.ocurrido_en).filter(Boolean).sort().slice(-1)[0];
  Object.assign(met, { ventas: ventas.length, compradores_distintos: distintos, clientes: customers.length, ultima_venta: ultima || null });
  if (ventas.length > 0 && customers.length === 0) {
    nivel = 'critico';
    puntos.push(`Entraron ${ventas.length} ventas pero hay 0 clientes guardados. El webhook no está dando de alta a los compradores — revisar.`);
  } else if (distintos > customers.length) {
    nivel = 'alerta';
    puntos.push(`${ventas.length} ventas de ${distintos} compradores distintos, pero solo ${customers.length} quedaron guardados como cliente. Faltarían ${distintos - customers.length} altas — revisar el webhook. Última venta: ${hace(ultima)}.`);
  } else {
    puntos.push(`${ventas.length} ventas · ${customers.length} clientes guardados · última venta: ${hace(ultima)}. Se está registrando todo bien.`);
  }
  return { flujo: '🟢 Post-compra (Hotmart)', que_mira: 'Que cada venta quede registrada (venta + cliente + bono).', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 5 — Salud del sitio (velocidad de carga + botones/links rotos). Corre desde
// Vercel (que SÍ tiene salida a internet, a diferencia del sandbox de las rutinas de nube).
// Objetivo: que la landing cargue rápido y que ningún botón (checkout incluido) esté roto.
// ─────────────────────────────────────────────────────────────────────────────
const SITIO_BASE = 'https://sistemadeingresosdiariosia.com';
const SITIO_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITIO_PAGES = [
  ['/', 'Landing principal'], ['/landing.html', 'Landing'], ['/landing-leadgen-v1.html', 'Landing LeadGen $1'],
  ['/gracias.html', 'Gracias'], ['/guia-5-pilares-ingresos-periodico-digital.html', 'Guía 5 pilares'],
  ['/guia-agentes-ia-periodistas.html', 'Guía agentes IA'], ['/guia-claude-periodistas.html', 'Guía Claude'],
  ['/guia-completa-50-prompts.html', 'Guía 50 prompts'], ['/guia-periodico-digital-ig-fb.html', 'Guía periódico IG/FB'],
  ['/upsell-periodico/espera.html', 'Upsell'],
];
async function saludSitio() {
  const met = {}; const puntos = []; let nivel = 'ok';
  const abs = (href, page) => { try { return new URL(href, page).href; } catch { return null; } };
  // peso aprox de un asset por HEAD (Content-Length; algunos vienen gzip → subestima, sirve de alarma de regresión)
  const cabeza = async (url) => {
    try { const r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'user-agent': SITIO_UA }, signal: AbortSignal.timeout(10000) }); return { status: r.status, len: Number(r.headers.get('content-length') || 0) }; }
    catch (e) { return { status: 0, len: 0, err: e.name }; }
  };
  // ping a un link: GET al checkout (Hotmart bloquea HEAD), HEAD al resto
  const ping = async (url) => {
    const esCheckout = /hotmart\.com/i.test(url);
    try { const r = await fetch(url, { method: esCheckout ? 'GET' : 'HEAD', redirect: 'follow', headers: { 'user-agent': SITIO_UA }, signal: AbortSignal.timeout(12000) }); return { status: r.status }; }
    catch (e) { return { status: 0, err: e.name }; }
  };
  try {
    let landingMax = 0, landingMaxNombre = '', chequeados = 0, checkoutRoto = false;
    const rotos = []; const linkCache = new Map();
    for (const [path, nombre] of SITIO_PAGES) {
      const pageUrl = SITIO_BASE + path;
      const g = await fetch(pageUrl, { headers: { 'user-agent': SITIO_UA }, signal: AbortSignal.timeout(12000) }).catch(() => null);
      if (!g || !g.ok) { rotos.push({ url: pageUrl, status: g ? g.status : 'sin respuesta', tipo: 'pagina' }); continue; }
      const html = await g.text();
      const assets = new Set(); const links = new Set();
      for (const m of html.matchAll(/<(?:script|img|source)[^>]+src=["']([^"']+)["']/gi)) { const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) assets.add(u); }
      for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)) { if (/rel=["'](stylesheet|preload|icon)/i.test(m[0])) { const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) assets.add(u); } }
      for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) { const raw = m[1].trim(); if (/^(mailto:|tel:|javascript:|#)/i.test(raw) || !raw) continue; const u = abs(raw, pageUrl); if (u && /^https?:/.test(u)) links.add(u); }
      for (const m of html.matchAll(/<form[^>]+action=["']([^"']+)["']/gi)) { const u = abs(m[1], pageUrl); if (u && /^https?:/.test(u)) links.add(u); }
      // peso solo en las landings (son el destino de los ads)
      if (/landing/i.test(path) || path === '/') {
        let peso = Number(g.headers.get('content-length') || html.length);
        const heads = await Promise.all([...assets].slice(0, 40).map(cabeza));
        for (const h of heads) peso += h.len;
        if (peso > landingMax) { landingMax = peso; landingMaxNombre = nombre; }
      }
      for (const url of links) {
        if (!linkCache.has(url)) linkCache.set(url, await ping(url));
        const r = linkCache.get(url); chequeados++;
        const externo = !url.startsWith(SITIO_BASE);
        const okStatus = r.status >= 200 && r.status < 400;
        const bloqueoExterno = externo && [401, 403, 405, 429].includes(r.status); // no está roto, solo bloqueó el chequeo
        if (!okStatus && !bloqueoExterno) {
          const esCheckout = /hotmart\.com/i.test(url);
          rotos.push({ url, status: r.status || r.err || '0', tipo: esCheckout ? 'checkout' : externo ? 'externo' : 'interno', desde: path });
          if (esCheckout) checkoutRoto = true;
        }
      }
    }
    const landingMB = landingMax / 1024 / 1024;
    Object.assign(met, { landing_mas_pesada_mb: Number(landingMB.toFixed(2)), links_chequeados: chequeados, links_rotos: rotos.length });
    if (checkoutRoto) { nivel = 'critico'; puntos.push('🚨 El botón de COMPRA (checkout de Hotmart) no responde. Nadie puede pagar — revisar YA.'); }
    const rotosDuros = rotos.filter((r) => r.tipo === 'interno' || r.tipo === 'pagina');
    if (rotosDuros.length) { nivel = peor(nivel, 'critico'); puntos.push(`${rotosDuros.length} link/página rotos en el sitio: ${rotosDuros.slice(0, 3).map((r) => `${r.url.replace(SITIO_BASE, '')} (${r.status})`).join(', ')}.`); }
    const rotosExt = rotos.filter((r) => r.tipo === 'externo');
    if (rotosExt.length) { nivel = peor(nivel, 'alerta'); puntos.push(`${rotosExt.length} link externo no respondió (puede ser temporal).`); }
    if (landingMB > 4) { nivel = peor(nivel, 'alerta'); puntos.push(`La landing más pesada (${landingMaxNombre}) pesa ~${landingMB.toFixed(1)} MB en celular — conviene comprimir imágenes, el tráfico de ads rebota.`); }
    if (nivel === 'ok') puntos.push(`Botones OK (${chequeados} chequeados, el checkout responde) · landing más pesada ~${landingMB.toFixed(1)} MB. El sitio carga bien.`);
  } catch (e) { nivel = 'alerta'; puntos.push(`No se pudo revisar el sitio (${e.message || e}).`); }
  return { flujo: '🩺 Salud del sitio (velocidad + botones)', que_mira: 'Que la landing cargue rápido y ningún botón (checkout) esté roto.', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// Composición del email — un banner general + una tarjeta clara por flujo.
// ─────────────────────────────────────────────────────────────────────────────
const COLOR = {
  critico: { bg: '#3a0d18', bd: '#e0396f', chip: '🔴' },
  alerta: { bg: '#3a2f0d', bd: '#e0a83a', chip: '🟡' },
  ok: { bg: '#0d2f22', bd: '#22c58a', chip: '✅' },
};
function tituloGeneral(nivel) {
  if (nivel === 'critico') return '🔴 Hay un problema que necesita tu atención';
  if (nivel === 'alerta') return '🟡 Todo corre, con un par de avisos';
  return '✅ Todos los flujos están sanos';
}
function tarjeta(f) {
  const c = COLOR[f.nivel] || COLOR.ok;
  const puntos = f.puntos.map((p) => `<div style="font-size:14px;line-height:1.6;color:#e8e8f0;margin:2px 0;">• ${p}</div>`).join('');
  return `<div style="background:${c.bg};border-left:5px solid ${c.bd};border-radius:12px;padding:16px 18px;margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:16px;font-weight:800;color:#ffffff;">${c.chip} ${f.flujo}</div>
      <div style="font-size:12px;color:#9a9ab0;margin:2px 0 10px;">Vigila: ${f.que_mira}</div>
      ${puntos}
    </div>`;
}
function armarHtml(flujos) {
  const general = flujos.reduce((acc, f) => peor(acc, f.nivel), 'ok');
  const c = COLOR[general];
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    general,
    subject: general === 'critico' ? '🔴 Panel de Salud — hay algo roto (revisar)' : general === 'alerta' ? '🟡 Panel de Salud — con avisos' : '✅ Panel de Salud — todo sano',
    html: `<div style="background:#07070f;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:8px;"><span style="font-size:22px;font-weight:800;color:#fff;">Panel de Salud <span style="color:#22d3ee;">de los flujos</span></span></div>
        <div style="text-align:center;font-size:12px;color:#606080;margin-bottom:18px;">${hoy} · un vistazo a todo lo que corre solo</div>
        <div style="background:${c.bg};border:1px solid ${c.bd};border-radius:12px;padding:16px 18px;margin:0 0 20px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:#fff;">${tituloGeneral(general)}</div>
        </div>
        ${flujos.map(tarjeta).join('')}
        <div style="font-size:11px;color:#40405a;text-align:center;margin-top:16px;line-height:1.6;">Este panel reemplaza los reportes sueltos de cada flujo. 🔴 = algo no está logrando su objetivo · 🟡 = corre con avisos · ✅ = sano.</div>
      </div>
    </div>`,
  };
}

async function enviar(subject, html) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: REPORTE_A }], subject, htmlContent: html }),
  });
  return { ok: r.ok, status: r.status };
}

// Diagnostica TODOS los flujos, compone el panel y (salvo mode=json) lo envía. Reusable: lo
// llama el endpoint /api/salud y también el cron de recuperación (para no gastar un cron aparte
// — Vercel Hobby limita a 2). Cada flujo se diagnostica por separado: si uno falla, no tumba
// a los demás.
async function enviarPanelSalud(mode) {
  const flujos = [];
  for (const fn of [saludFunnel, saludRecuperacion, saludAsistente, saludPostCompra, saludSitio]) {
    try { flujos.push(await fn()); }
    catch (e) { flujos.push({ flujo: fn.name, que_mira: '', nivel: 'alerta', puntos: [`Error al diagnosticar: ${e.message || e}`], met: {} }); }
  }
  const { general, subject, html } = armarHtml(flujos);
  if (mode === 'json') return { general, enviado: false, flujos: flujos.map((f) => ({ flujo: f.flujo, nivel: f.nivel, puntos: f.puntos, met: f.met })) };
  const sent = await enviar(subject, html);
  return { general, enviado: sent.ok, resumen: flujos.map((f) => `${f.nivel}:${f.flujo}`) };
}

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'cron';
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret || req.headers.authorization === `Bearer ${secret}` || searchParams.get('key') === secret;
  if (!authOk) { res.status(401).json({ error: 'unauthorized' }); return; }
  try {
    const out = await enviarPanelSalud(mode);
    res.status(200).json({ mode, ...out });
  } catch (e) {
    console.error('salud error', e);
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
module.exports.enviarPanelSalud = enviarPanelSalud;
module.exports.saludSitio = saludSitio;
