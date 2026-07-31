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

// Foto de stats de email de Brevo → Supabase (tabla brevo_stats). El Panel de Comando corre en un
// sandbox de nube que NO alcanza Brevo (403); Vercel sí. Así que la guardamos acá 1×/día y la
// rutina la lee de Supabase. Reemplaza el Data Store de Make 169011, que quedaba CONGELADO cuando
// su scenario se pausaba por el tope de escenarios activos del plan free de Make (solo 2 slots).
async function snapshotBrevo() {
  const key = process.env.BREVO_API_KEY;
  if (!key || !SB_URL || !SB_KEY) return { ok: false, motivo: 'faltan credenciales' };
  try {
    const [aggR, listR] = await Promise.all([
      fetch(`${BREVO}/smtp/statistics/aggregatedReport?days=7`, { headers: { 'api-key': key, accept: 'application/json' } }),
      fetch(`${BREVO}/contacts/lists/${LIST_ID}`, { headers: { 'api-key': key, accept: 'application/json' } }),
    ]);
    if (!aggR.ok) throw new Error(`aggregatedReport ${aggR.status}`);
    const a = await aggR.json();
    let subscribers = null;
    if (listR.ok) { const l = await listR.json(); subscribers = l.totalSubscribers ?? l.uniqueSubscribers ?? null; }
    const row = {
      key: 'latest',
      delivered: a.delivered ?? null, unique_opens: a.uniqueOpens ?? null, opens: a.opens ?? null,
      clicks: a.clicks ?? null, unique_clicks: a.uniqueClicks ?? null, hard_bounces: a.hardBounces ?? null,
      requests: a.requests ?? null, subscribers, rango: a.range ?? null, updated_at: new Date().toISOString(),
    };
    const up = await fetch(`${SB_URL}/rest/v1/brevo_stats`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify([row]),
    });
    return { ok: up.ok, status: up.status };
  } catch (e) { return { ok: false, motivo: e.message || String(e) }; }
}

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
    // Se mide lo que FALTA, no la etapa. Hasta el 01/08 este panel contaba WA_STAGE y por eso
    // daba ✅ mientras el Regalo 4 no le llegaba a nadie: esa etapa la avanzaba el envío por
    // WhatsApp, que no entregaba. Lo único que prueba que un mail salió es su marcador.
    // ⚠️ Espejo de PIEZAS en api/wa-funnel.js: si allá se agrega o cambia un paso, cambiar acá.
    const PIEZAS = [['Regalo 3', 'MAIL3_AT', 5], ['Regalo 4', 'MAIL4_AT', 7], ['Regalo 5', 'MAIL5_AT', 8], ['Oferta', 'OFERTA_MAIL_AT', 9]];
    const dia = (v) => String(v || '').slice(0, 10);
    const hoyISO = new Date().toISOString().slice(0, 10);
    const ayerISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let falta = 0, mailsHoy = 0, mailsAyer = 0, bloqueados = 0;
    const porPieza = {};
    for (const c of all) {
      if (c.emailBlacklisted) { bloqueados++; continue; } // Brevo no les entrega: fuera a propósito
      const a = c.attributes || {};
      if (dia(a.WA_SENT_AT) === hoyISO) mailsHoy++;
      if (dia(a.WA_SENT_AT) === ayerISO) mailsAyer++;
      const antiguedad = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000);
      for (const [nombre, marcador, minDays] of PIEZAS) {
        if (!a[marcador] && antiguedad >= minDays) { porPieza[nombre] = (porPieza[nombre] || 0) + 1; falta++; }
      }
    }
    Object.assign(met, { total: all.length, bloqueados, falta_total: falta, falta_por_pieza: porPieza, mails_hoy: mailsHoy, mails_ayer: mailsAyer });

    if (falta === 0) {
      puntos.push(`Al día: los ${all.length - bloqueados} leads activos tienen las 4 piezas del embudo.`);
    } else if (mailsHoy === 0 && mailsAyer === 0) {
      nivel = 'critico';
      puntos.push(`🚨 EMBUDO FRENADO: faltan ${falta} mails por salir y hace dos días que no sale ninguno. Revisar el cron de /api/wa-funnel y los flags MAILREGALOS_ENABLED / MAIL5_ENABLED / MAILOFERTA_ENABLED en Vercel.`);
    } else {
      const ritmo = Math.max(mailsHoy, mailsAyer);
      const detalle = Object.entries(porPieza).map(([k, v]) => `${k}: ${v}`).join(' · ');
      puntos.push(`Faltan ${falta} mails por salir (${detalle}). Ritmo: ${mailsHoy} hoy, ${mailsAyer} ayer → se completa en ~${Math.ceil(falta / ritmo)} día(s).`);
      // El tope diario es 500. Un ritmo muy por debajo significa que la cadena de corridas se
      // está cortando antes de tiempo: no está "yendo lento", está fallando.
      if (ritmo < 100) {
        nivel = peor(nivel, 'alerta');
        puntos.push(`El ritmo (${ritmo}/día) está muy por debajo del tope de 500: el auto-encadenado de /api/wa-funnel se está cortando antes de vaciar la cola.`);
      }
    }
    if (bloqueados > 0) puntos.push(`${bloqueados} contactos bloqueados en Brevo (rebote duro o baja): quedan fuera del embudo a propósito.`);

    // ENTREGA REAL (Meta): el WA_STAGE de Brevo solo dice que se DISPARÓ (la API de Meta aceptó el
    // envío), NO que se ENTREGÓ. Cruzamos con conversaciones_wa (estado_entrega) de los envíos del
    // funnel de los últimos 3 días: si la mayoría quedó 'fallido', el funnel "envía" pero no llega a
    // nadie (típico: número sin verificar en Meta que tocó su tope de mensajería). Este agujero nos
    // costó del 13/07 al 18/07: el panel reportaba ✅ mientras Meta rechazaba el 100% de las entregas.
    try {
      const desde = new Date(Date.now() - 3 * 86400000).toISOString();
      const ent = await sb(`conversaciones_wa?direccion=eq.out&origen=eq.funnel&creado_en=gte.${desde}&select=estado_entrega&limit=5000`);
      if (Array.isArray(ent) && ent.length >= 10) {
        let fall = 0, lleg = 0;
        for (const e of ent) { if (e.estado_entrega === 'fallido') fall++; else if (e.estado_entrega === 'entregado' || e.estado_entrega === 'leido') lleg++; }
        const total = ent.length; const pctFall = Math.round((100 * fall) / total);
        met.entrega_3d = { enviados: total, entregados_o_leidos: lleg, fallidos: fall, pct_fallo: pctFall };
        if (pctFall >= 50) {
          nivel = 'critico';
          puntos.push(`🚨 ENTREGA ROTA: Meta marcó FALLIDO el ${pctFall}% de los ${total} WhatsApp del funnel de los últimos 3 días (${fall}/${total}). Se dispara pero NO llega a nadie. Revisá el número en Meta: verificación de negocio, nombre para mostrar y límite de mensajería.`);
        } else if (pctFall >= 20) {
          nivel = peor(nivel, 'alerta');
          puntos.push(`Atención: falló la entrega del ${pctFall}% de los WhatsApp del funnel en los últimos 3 días (${fall}/${total}). Vigilá el estado del número en Meta.`);
        } else {
          puntos.push(`Entrega WhatsApp (últimos 3 días): ${lleg}/${total} llegaron, ${fall} fallaron (${pctFall}%).`);
        }
      }
    } catch (e) { puntos.push(`No se pudo verificar la entrega real de WhatsApp (${e.message || e}).`); }
  } catch (e) { nivel = 'alerta'; puntos.push(`No se pudo leer el estado del funnel (${e.message || e}).`); }
  return { flujo: '🎁 Embudo de regalos (email)', que_mira: 'Que a cada lead le lleguen las 4 piezas, hasta la oferta.', nivel, puntos, met };
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
  met.escalaciones_esperando = esperando.length;
  const masVieja = esperando.map((r) => r.escalado_en).filter(Boolean).sort()[0];
  const hVieja = masVieja ? horas(masVieja) : 0;
  met.mas_vieja_h = Math.round(hVieja);
  if (esperando.length === 0) {
    puntos.push('Ninguna conversación quedó esperando respuesta. El bot está atendiendo solo.');
  } else if (esperando.length >= 5) {
    // muchos a la vez esperando = algo real que atender YA
    nivel = 'critico';
    puntos.push(`${esperando.length} personas pidieron hablar con vos y siguen sin respuesta (la más vieja, ${hace(masVieja)}). Revisá WhatsApp/Telegram.`);
  } else {
    // Un handoff a humano es una tarea TUYA pendiente, no "el sistema roto": queda en amarillo (no
    // rojo) para no gritar 🔴 todos los días por la misma conversación que quedó sin cerrar.
    nivel = 'alerta';
    if (hVieja >= 48) {
      puntos.push(`${esperando.length} conversación(es) figura(n) esperando respuesta, la más vieja ${hace(masVieja)}. Si ya le respondiste desde Telegram, está OK: el bot no siempre detecta tu respuesta y la deja marcada como pendiente. Si no, entrá y cerrala.`);
    } else {
      puntos.push(`${esperando.length} persona(s) pidió hablar con vos y espera(n) respuesta (la más vieja, ${hace(masVieja)}). Revisá tu Telegram.`);
    }
  }
  return { flujo: '💬 Asistente de WhatsApp', que_mira: 'Que ningún cliente quede sin respuesta.', nivel, puntos, met };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLUJO 4 — Post-compra (webhook Hotmart → ventas + clientes). Objetivo: registrar cada venta.
// ─────────────────────────────────────────────────────────────────────────────
async function saludPostCompra() {
  const met = {}; const puntos = []; let nivel = 'ok';
  const ventas = await sb('ventas?select=email,producto,ocurrido_en');
  const customers = await sb('customers?select=email');
  if (ventas == null || customers == null) { return { flujo: '🟢 Post-compra (Hotmart)', que_mira: 'Que cada venta quede registrada (venta + cliente + bono).', nivel: 'alerta', puntos: ['No se pudo leer ventas/clientes.'], met }; }
  // `customers` solo da de alta a compradores del CURSO (webhook propio /api/hotmart). Comparar contra
  // TODAS las ventas mezcla universos distintos — Sala VIP, guías, order bumps de otros productos — y
  // marca falsos "falta 1 alta" por gente que nunca compró el curso (p.ej. Juan Manuel, que solo compró
  // la Sala VIP). Por eso acá contamos SOLO las ventas del curso.
  const esCurso = (p) => /ingresos diarios/i.test(String(p || ''));
  const ventasCurso = ventas.filter((v) => esCurso(v.producto));
  const emailsVenta = new Set(ventasCurso.map((v) => String(v.email || '').toLowerCase().trim()).filter(Boolean));
  const distintos = emailsVenta.size; // compradores del CURSO únicos (las ventas pueden repetir email)
  const ultima = ventasCurso.map((v) => v.ocurrido_en).filter(Boolean).sort().slice(-1)[0];
  Object.assign(met, { ventas: ventasCurso.length, compradores_distintos: distintos, clientes: customers.length, ultima_venta: ultima || null });
  if (ventasCurso.length > 0 && customers.length === 0) {
    nivel = 'critico';
    puntos.push(`Entraron ${ventasCurso.length} ventas del curso pero hay 0 clientes guardados. El webhook no está dando de alta a los compradores — revisar.`);
  } else if (distintos > customers.length) {
    nivel = 'alerta';
    puntos.push(`${ventasCurso.length} ventas del curso de ${distintos} compradores distintos, pero solo ${customers.length} quedaron guardados como cliente. Faltarían ${distintos - customers.length} altas — revisar el webhook. Última venta: ${hace(ultima)}.`);
  } else {
    puntos.push(`${ventasCurso.length} ventas del curso · ${customers.length} clientes guardados · última venta: ${hace(ultima)}. Se está registrando todo bien.`);
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
  // Refresca la foto de Brevo en Supabase para el Panel de Comando (best-effort: si falla, el panel igual sale).
  try { await snapshotBrevo(); } catch (e) { console.error('snapshotBrevo (no frena el panel):', (e && e.message) || e); }
  // Baja los eventos de email por persona (quién abrió qué) para la ficha del cliente.
  // Se cuelga de acá porque Vercel Hobby solo deja 2 crons. Best-effort igual que arriba.
  try { await syncComunicaciones(7); } catch (e) { console.error('syncComunicaciones (no frena el panel):', (e && e.message) || e); }
  const flujos = [];
  for (const fn of [saludFunnel, saludRecuperacion, saludAsistente, saludPostCompra, saludSitio]) {
    try { flujos.push(await fn()); }
    catch (e) { flujos.push({ flujo: fn.name, que_mira: '', nivel: 'alerta', puntos: [`Error al diagnosticar: ${e.message || e}`], met: {} }); }
  }
  const { general, subject, html } = armarHtml(flujos);
  if (mode === 'json') return { general, enviado: false, flujos: flujos.map((f) => ({ flujo: f.flujo, nivel: f.nivel, puntos: f.puntos, met: f.met })) };

  // AGENDA DEL TABLERO (Trello): ejecuta lo auto-ejecutable y cuela lo pendiente en ESTE mismo
  // email (un solo correo, ver trello-diario.js). Best-effort: si Trello falla, el panel igual sale.
  let htmlFinal = html;
  let agenda = null;
  try {
    const { agendaTrello } = require('./trello-diario');
    agenda = await agendaTrello('run');
    if (agenda && agenda.htmlBlock) {
      htmlFinal = html.replace(
        '<div style="font-size:11px;color:#40405a;text-align:center;margin-top:16px;',
        `${agenda.htmlBlock}<div style="font-size:11px;color:#40405a;text-align:center;margin-top:16px;`
      );
    }
  } catch (e) { console.error('agenda trello (no frena el panel):', e && e.message || e); }

  const sent = await enviar(subject, htmlFinal);
  return {
    general, enviado: sent.ok, resumen: flujos.map((f) => `${f.nivel}:${f.flujo}`),
    trello: agenda ? { ejecutadas: agenda.ejecutadas, vencidas: agenda.vencidas.length, hoy: agenda.hoy.length, proximas: agenda.proximas.length, error: agenda.error } : null,
  };
}

// Trae de Brevo quién recibió/abrió cada mail y lo guarda en comunicaciones_email.
// Es lo que le faltaba a la ficha por cliente: del WhatsApp ya guardábamos entrega
// y lectura, del email no guardábamos nada por persona.
async function syncComunicaciones(dias, limite) {
  const { sincronizarEventosBrevo } = require('./_lib/brevo-events-sync');
  return sincronizarEventosBrevo({
    apiKey: process.env.BREVO_API_KEY,
    supabaseUrl: SB_URL,
    serviceKey: SB_KEY,
    dias,
    limite,
  });
}

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'cron';
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret || req.headers.authorization === `Bearer ${secret}` || searchParams.get('key') === secret;
  if (!authOk) { res.status(401).json({ error: 'unauthorized' }); return; }

  // ?mode=comunicaciones&dias=30 → solo baja los eventos de email, sin mandar el
  // panel. Para el backfill inicial (Brevo guarda ~30 días de historia).
  if (mode === 'comunicaciones') {
    try {
      const dias = parseInt(searchParams.get('dias') || '7', 10);
      // El backfill tiene que poder traer toda la historia; la corrida diaria se
      // queda con el tope bajo para no comerse el tiempo del panel.
      const limite = parseInt(searchParams.get('max') || '20000', 10);
      const out = await syncComunicaciones(dias, limite);
      res.status(200).json({ mode, dias, ...out });
    } catch (e) {
      res.status(500).json({ error: String((e && e.message) || e) });
    }
    return;
  }

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
module.exports.snapshotBrevo = snapshotBrevo;
