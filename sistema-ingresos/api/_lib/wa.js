// Helper compartido de WhatsApp para la recuperación de clientes potenciales.
// Lo usan DOS funciones: el webhook (api/hotmart.js) para el 1er mensaje instantáneo
// y el motor diario (api/recuperacion.js) para el recordatorio. Carpeta _lib → Vercel
// no la enruta como función; se bundlea al requerirla.
//
// Envía por WhatsApp Cloud API (mismo token que el embudo de regalos, wa-funnel.js).
// Los mensajes salen SIEMPRE como PLANTILLA APROBADA (Meta lo exige para escribir
// primero a alguien que no nos escribió). Las 4 plantillas: recup_abandono_1/2 y
// recup_rechazo_1/2 (una variable {{1}} = nombre, + botón URL estático con ?src=).
//
// Variables de entorno: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID.

const crypto = require('crypto');

const GRAPH = 'https://graph.facebook.com/v21.0';
const BASE = 'https://sistemadeingresosdiariosia.com';

// ── Registro de mensajes (gasto variable por automatización) ─────────────────
// Cada envío se registra en la tabla `mensajes` de la base de marketing, con su
// automatización + país + categoría + costo estimado. Best-effort: si falla, no
// rompe el envío. Alimenta v_gastos_mensajes_mes → Contabilidad en Leadr.
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Prefijos telefónicos → ISO-2 (best-effort, países que vemos + comunes).
const PREFIX_TO_ISO = [
  ['549', 'AR'], ['54', 'AR'], ['55', 'BR'], ['56', 'CL'], ['57', 'CO'],
  ['52', 'MX'], ['51', 'PE'], ['593', 'EC'], ['591', 'BO'], ['595', 'PY'],
  ['598', 'UY'], ['58', 'VE'], ['506', 'CR'], ['507', 'PA'], ['502', 'GT'],
  ['503', 'SV'], ['504', 'HN'], ['505', 'NI'], ['34', 'ES'], ['1', 'US'],
];
function paisFromPhone(to) {
  const d = String(to || '').replace(/\D/g, '');
  for (const [pref, iso] of PREFIX_TO_ISO) if (d.startsWith(pref)) return iso;
  return 'XX';
}

// Tarifa aprox. de Meta por CONVERSACIÓN de 24h (USD), categoría marketing, por país.
// Estimación (Meta cambia las tarifas y cobra por conversación, no por mensaje);
// se reconcilia con la factura real de WhatsApp. utility/authentication son más baratas;
// service (dentro de la ventana de 24h) es gratis.
const RATE_MARKETING = {
  AR: 0.0618, BR: 0.0625, CL: 0.0889, CO: 0.0125, MX: 0.0436, PE: 0.0703,
  EC: 0.06, CR: 0.06, PA: 0.06, GT: 0.06, DO: 0.06, ES: 0.0615, US: 0.025, XX: 0.05,
};
const CATEGORY_FACTOR = { marketing: 1, utility: 0.35, authentication: 0.3, service: 0 };
function costPerConversation(pais, categoria) {
  const base = RATE_MARKETING[pais] != null ? RATE_MARKETING[pais] : RATE_MARKETING.XX;
  const f = CATEGORY_FACTOR[categoria] != null ? CATEGORY_FACTOR[categoria] : 1;
  return Math.round(base * f * 10000) / 10000;
}

// Clave de conversación: agrupa todos los mensajes a la misma persona el mismo día y
// categoría como UNA conversación (aprox. de la ventana de 24h de Meta). No guarda el
// teléfono en claro.
function conversacionKey(to, categoria) {
  const day = new Date().toISOString().slice(0, 10);
  const digits = String(to || '').replace(/\D/g, '');
  return crypto.createHash('md5').update(`${digits}:${day}:${categoria || ''}`).digest('hex');
}

// Registra un mensaje enviado. Best-effort (nunca throwea).
async function logMensaje({ automatizacion, to, tipo, categoria_meta = 'marketing', ok = true, wamid = null }) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
    const pais = paisFromPhone(to);
    const row = {
      automatizacion,
      canal: 'whatsapp',
      tipo: tipo || null,
      categoria_meta,
      pais,
      conversacion_key: conversacionKey(to, categoria_meta),
      costo_estimado_usd: costPerConversation(pais, categoria_meta),
      ok: !!ok,
      wamid: wamid || null,
    };
    await fetch(`${SUPABASE_URL}/rest/v1/mensajes`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error('[wa logMensaje] no se pudo registrar el mensaje:', e && e.message || e);
  }
}

// ── Historial de conversación (tabla `conversaciones_wa`) → hilo del inbox ────
// Guarda CADA mensaje de WhatsApp (entrante o saliente) con su texto legible, para
// reconstruir el hilo completo tipo WhatsApp en Leadr — incluido el PRIMER mensaje que
// le mandamos nosotros (regalo / recuperación), que antes solo iba a `mensajes` (costos).
// Es la única fuente de logueo del hilo: la usan los envíos (regalos, recuperación) y el
// puente (asistente.logChat delega acá). Best-effort: nunca throwea ni frena un envío.
async function logConversacion({ telefono, direccion, origen, texto, tipo, wamid, intent, media_id }) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
    await fetch(`${SUPABASE_URL}/rest/v1/conversaciones_wa`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        telefono: normalizePhone(telefono),
        direccion,
        origen: origen || null,
        texto: texto || null,
        tipo: tipo || null,
        wamid: wamid || null,
        intent: intent || null,
        media_id: media_id || null, // adjuntos entrantes: para re-descargar el archivo de Meta
        // Los salientes arrancan en "enviado"; el webhook los sube a entregado/leido.
        estado_entrega: direccion === 'out' ? 'enviado' : null,
      }),
    });
  } catch (e) {
    console.error('[wa logConversacion] no se pudo registrar en el hilo:', e && e.message || e);
  }
}

// Sube el estado de entrega de un mensaje saliente (por wamid) cuando WhatsApp avisa
// sent/delivered/read/failed → enviado/entregado/leido/fallido. El RPC solo sube de
// nivel (los avisos llegan desordenados). Best-effort: nunca throwea.
async function marcarEntrega({ wamid, estado, ts }) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !wamid || !estado) return;
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/marcar_entrega`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ p_wamid: wamid, p_estado: estado, p_ts: ts || new Date().toISOString() }),
    });
  } catch (e) {
    console.error('[wa marcarEntrega] no se pudo actualizar el estado:', e && e.message || e);
  }
}

// Link del botón de recuperación por tipo. Va DIRECTO al checkout de Hotmart (no a la
// landing): quien ya abandonó/rechazó conoce la oferta, lo que necesita es volver a pagar.
// El ?src= alimenta el campo "Origen" de Hotmart → atribuye la venta recuperada en `ventas`.
// Lo usa el mail de recuperación (_lib/recup-email.js).
const CHECKOUT = 'https://pay.hotmart.com/P106404871J?checkoutMode=10';
const LINKS = {
  carrito_abandonado: `${CHECKOUT}&src=em-recup-abandono`,
  pago_rechazado: `${CHECKOUT}&src=em-recup-rechazo`,
};

// Normaliza a E.164 sin "+". Corrige el bug del "9" faltante en móviles argentinos
// (idéntico a wa-funnel.js). Para otros países solo deja los dígitos.
function normalizePhone(raw) {
  let d = String(raw == null ? '' : raw).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('54') && d[2] !== '9') d = '54' + '9' + d.slice(2);
  return d;
}

function primerNombre(nombre) {
  const n = String(nombre || '').trim().split(/\s+/)[0] || '';
  return n || 'Hola';
}

// ⚠️ Acá vivía `sendRecupTemplate`, que mandaba las plantillas de recuperación de carrito por
// WhatsApp. Se fue el 09/08/2026 junto con el resto del envío automático por ese canal (el
// número está capado en Meta y no entregaba). La recuperación ahora sale por email desde
// `_lib/recup-email.js`. Lo que queda en este archivo es para RECIBIR y CONTESTAR a mano:
// sendText y sendButtons los usan el puente de Telegram y el asistente del inbox.

// Manda un mensaje de TEXTO LIBRE (no plantilla). Solo funciona dentro de la ventana
// de 24 h de atención al cliente (o sea, si la persona nos escribió en las últimas 24 h)
// — y ahí es GRATIS. Fuera de esa ventana Meta lo rechaza (hay que usar plantilla).
// Lo usa el puente WhatsApp↔Telegram (api/tg-webhook.js) para responder al cliente.
async function sendText({ to, body }) {
  const token = process.env.WHATSAPP_TOKEN;
  const pn = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const r = await fetch(`${GRAPH}/${pn}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: String(body || '') },
    }),
  });
  const j = await r.json().catch(() => ({}));
  const wamid = j && j.messages && j.messages[0] && j.messages[0].id;
  await logMensaje({ automatizacion: 'puente', to, tipo: 'texto-libre', categoria_meta: 'service', ok: r.ok, wamid });
  return { ok: r.ok, status: r.status, body: j, wamid };
}

// Manda un mensaje INTERACTIVO con botones de respuesta rápida (hasta 3). Como el texto
// libre, solo funciona dentro de la ventana de 24 h (y ahí es GRATIS). Cada botón:
// { id, title } — title máx 20 caracteres (WhatsApp lo corta). Lo usa el asistente
// (api/_lib/asistente.js) para ofrecer "opciones guiadas" a quien escribe.
async function sendButtons({ to, body, buttons, header, footer }) {
  const token = process.env.WHATSAPP_TOKEN;
  const pn = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const action = {
    buttons: (buttons || []).slice(0, 3).map((b) => ({
      type: 'reply',
      reply: { id: String(b.id).slice(0, 256), title: String(b.title).slice(0, 20) },
    })),
  };
  const interactive = { type: 'button', body: { text: String(body || '') }, action };
  if (header) interactive.header = { type: 'text', text: String(header).slice(0, 60) };
  if (footer) interactive.footer = { text: String(footer).slice(0, 60) };
  const r = await fetch(`${GRAPH}/${pn}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'interactive', interactive }),
  });
  const j = await r.json().catch(() => ({}));
  const wamid = j && j.messages && j.messages[0] && j.messages[0].id;
  await logMensaje({ automatizacion: 'asistente', to, tipo: 'menu-botones', categoria_meta: 'service', ok: r.ok, wamid });
  return { ok: r.ok, status: r.status, body: j, wamid };
}

// ── Descarga de adjuntos entrantes (imagen/audio/video/documento) ────────────
// WhatsApp NO manda el archivo en el webhook, solo un `media id`. Bajarlo es en 2 pasos:
//   1) GET /{media-id}  → devuelve una URL temporal (válida ~5 min) + mime_type + tamaño.
//   2) GET esa URL (con el MISMO token en el header) → el binario.
// El medio queda disponible en Meta ~30 días, pero SOLO si guardamos el media id (por eso
// hay que capturarlo en el webhook al instante). Devuelve { buffer, mime, size } o null.
async function getMedia(mediaId) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    if (!token || !mediaId) return null;
    const meta = await fetch(`${GRAPH}/${mediaId}`, { headers: { authorization: `Bearer ${token}` } });
    if (!meta.ok) { console.error('[wa getMedia] meta', meta.status); return null; }
    const info = await meta.json().catch(() => ({}));
    if (!info || !info.url) return null;
    const bin = await fetch(info.url, { headers: { authorization: `Bearer ${token}` } });
    if (!bin.ok) { console.error('[wa getMedia] bin', bin.status); return null; }
    const buffer = Buffer.from(await bin.arrayBuffer());
    return { buffer, mime: info.mime_type || 'application/octet-stream', size: Number(info.file_size) || buffer.length };
  } catch (e) {
    console.error('[wa getMedia] error:', e && e.message || e);
    return null;
  }
}

module.exports = { GRAPH, BASE, LINKS, normalizePhone, primerNombre, sendText, sendButtons, logMensaje, logConversacion, marcarEntrega, getMedia };
