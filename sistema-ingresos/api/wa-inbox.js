// api/wa-inbox.js — Puente WhatsApp → Telegram + Asistente automático.
//
// PARA QUÉ: el número del curso está en la Cloud API (así mandamos los mensajes
// automáticos de recuperación/regalos). Por eso NO se puede usar la bandeja de Meta
// Business Suite para leer las respuestas de los clientes. Este webhook las recibe y:
//   1) Arma una FICHA de contexto (quién es, de qué embudo viene, qué le mandamos).
//   2) El ASISTENTE decide qué responder (ver api/_lib/asistente.js): resuelve solo los
//      casos comunes (reenviar regalo, explicar, link de pago) o manda un menú de botones,
//      y escala a Jose por Telegram solo cuando hace falta un humano.
//   3) Le avisa a Jose por Telegram (aviso corto si lo resolvió solo; ficha completa si
//      necesita que conteste él). Cuando Jose responde por Telegram, el bot se hace a un
//      lado en ese chat por 24 h (tabla wa_bot_estado).
//
// INTERRUPTOR: el asistente solo manda mensajes de verdad si ASISTENTE_ENABLED=1. Mientras
// esté apagado corre en MODO BORRADOR: le muestra a Jose en Telegram "🤖 esto le
// respondería" SIN mandarle nada al cliente. Así se revisan los textos antes de encenderlo.
//
// GET  → verificación del webhook de Meta (hub.challenge si el token coincide).
// POST → evento entrante de WhatsApp → ficha + decisión del asistente + aviso a Telegram.
//        Ignora los eventos de estado (entregado/leído).
//
// Env: WA_WEBHOOK_VERIFY_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ASISTENTE_ENABLED,
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, WHATSAPP_TOKEN,
//      WHATSAPP_PHONE_NUMBER_ID.

const { normalizePhone, sendText, sendButtons, marcarEntrega, getMedia } = require('./_lib/wa');
const asistente = require('./_lib/asistente');
const tg = require('./_lib/tg');

const VERIFY_TOKEN = (process.env.WA_WEBHOOK_VERIFY_TOKEN || '').trim();
const TG_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TG_CHAT = (process.env.TELEGRAM_CHAT_ID || '').trim();
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
const ASISTENTE_ENABLED = process.env.ASISTENTE_ENABLED === '1';

const BREVO = 'https://api.brevo.com/v3';

// Postea un aviso en el buzón: al TEMA del cliente (si hay grupo) o al chat directo de Jose.
async function avisar(from, nombre, text) {
  try {
    const dest = await tg.destinoPara(normalizePhone(from), nombre);
    await tg.enviar({ ...dest, text });
  } catch (e) { console.error('[wa-inbox] avisar:', e && e.message || e); }
}

// Tipos de mensaje que traen un archivo adjunto (tienen un `media id` que hay que bajar).
const MEDIA_TYPES = ['image', 'audio', 'video', 'document', 'sticker'];
const MAX_MEDIA_BYTES = 45 * 1024 * 1024; // Telegram: docs hasta 50 MB; dejamos margen.

// Baja el adjunto de WhatsApp y se lo reenvía a Jose a Telegram como archivo real (imagen,
// nota de voz, video o documento) — al MISMO tema/chat donde ya cayó la ficha. Antes esto
// se perdía: el hilo solo mostraba "[imagen]" y el archivo no se guardaba. Best-effort.
async function reenviarMedia(from, nombre, tipo, mediaMeta) {
  const dl = await getMedia(mediaMeta.id);
  if (!dl || !dl.buffer) {
    await avisar(from, nombre, `⚠️ ${nombre} te mandó un ${tipo}, pero no pude descargarlo de WhatsApp.`);
    return;
  }
  if (dl.size > MAX_MEDIA_BYTES) {
    await avisar(from, nombre, `⚠️ ${nombre} te mandó un ${tipo} de ${(dl.size / 1048576).toFixed(1)} MB — muy grande para reenviarlo a Telegram.`);
    return;
  }
  const dest = await tg.destinoPara(normalizePhone(from), nombre);
  await tg.enviarMedia({
    ...dest, tipo,
    media: { buffer: dl.buffer, mime: dl.mime, filename: mediaMeta.filename },
    caption: mediaMeta.caption || undefined,
  });
}

// fetch con timeout (para que una consulta lenta nunca demore el reenvío a Telegram).
async function fetchT(url, opts, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

// ¿Ya procesamos este mensaje entrante (por wamid)? Meta reintenta el webhook cuando la
// función tarda; sin esto el bot podría responder DOS veces al mismo mensaje. Se apoya en
// el historial (conversaciones_wa) donde el entrante ya queda logueado. Best-effort: si la
// consulta falla o no hay Supabase, devuelve false (procesa igual, no bloquea nada).
async function yaProcesado(wamid) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !wamid) return false;
  try {
    const r = await fetchT(`${SUPABASE_URL}/rest/v1/conversaciones_wa?wamid=eq.${encodeURIComponent(wamid)}&direccion=eq.in&select=id&limit=1`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    }, 2000);
    if (!r.ok) return false;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch { return false; }
}

// Resumen legible del mensaje entrante según su tipo (texto o adjunto).
function describeMsg(m) {
  switch (m.type) {
    case 'text': return (m.text && m.text.body) || '';
    case 'image': return '🖼️ [imagen]' + (m.image && m.image.caption ? ' ' + m.image.caption : '');
    case 'audio': return '🎤 [audio / nota de voz]';
    case 'video': return '🎬 [video]' + (m.video && m.video.caption ? ' ' + m.video.caption : '');
    case 'document': return '📎 [documento] ' + ((m.document && m.document.filename) || '');
    case 'sticker': return '[sticker]';
    case 'location': return '📍 [ubicación]';
    case 'button': return (m.button && m.button.text) || '[botón]';
    case 'interactive': return (m.interactive && ((m.interactive.button_reply && m.interactive.button_reply.title) || (m.interactive.list_reply && m.interactive.list_reply.title))) || '[interactivo]';
    default: return `[${m.type}]`;
  }
}

function buttonIdDe(m) {
  if (m.type !== 'interactive' || !m.interactive) return null;
  return (m.interactive.button_reply && m.interactive.button_reply.id)
    || (m.interactive.list_reply && m.interactive.list_reply.id) || null;
}

// WhatsApp status → nuestro estado del hilo (los ✓✓).
const ESTADO_WA = { sent: 'enviado', delivered: 'entregado', read: 'leido', failed: 'fallido' };

// Procesa los avisos de estado (sent/delivered/read/failed) de un evento y sube el
// estado de entrega de cada mensaje saliente en el hilo. Best-effort; nunca throwea.
async function procesarStatuses(statuses) {
  for (const s of statuses) {
    try {
      const estado = ESTADO_WA[s && s.status];
      if (!estado || !s.id) continue;
      const ts = s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : undefined;
      await marcarEntrega({ wamid: s.id, estado, ts });
    } catch (e) { console.error('[wa-inbox] status:', e && e.message || e); }
  }
}

// ── Ficha de contexto ────────────────────────────────────────────────────────
function hace(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const diff = Date.now() - t;
  if (diff < 0) return 'recién';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

function diasDesde(iso) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

function funnelBonito(f) {
  if (!f) return 'desconocido';
  if (f === 'meta-leadgen-guia-claude') return 'Guía Claude (Facebook)';
  return String(f).replace(/^meta-/, '').replace(/-/g, ' ');
}

function regaloPorEstado(stage, mail5) {
  const s = Number(stage || 0);
  if (s >= 5) return 'la Oferta (el mensaje con el precio)';
  if (mail5) return 'el Regalo 5 — guía de agentes de IA (email)';
  if (s === 4) return 'el Regalo 4 — guía de los 5 pilares (WhatsApp)';
  if (s === 3) return 'el Regalo 3 — guía del periódico digital (WhatsApp)';
  return 'todavía los emails de bienvenida (Regalos 1 y 2)';
}

function regaloEstimado(dias) {
  if (dias == null) return '';
  if (dias >= 9) return 'la Oferta (el mensaje con el precio)';
  if (dias >= 8) return 'el Regalo 5 — guía de agentes de IA (email)';
  if (dias >= 7) return 'el Regalo 4 — guía de los 5 pilares (WhatsApp)';
  if (dias >= 5) return 'el Regalo 3 — guía del periódico digital (WhatsApp)';
  return 'todavía los emails de bienvenida (Regalos 1 y 2)';
}

async function brevoEstado(email) {
  if (!BREVO_API_KEY || !email) return null;
  try {
    const r = await fetchT(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
    }, 2500);
    if (!r.ok) return null;
    const j = await r.json();
    const a = (j && j.attributes) || {};
    return { stage: a.WA_STAGE, sentAt: a.WA_SENT_AT, mail5: a.MAIL5_AT };
  } catch { return null; }
}

async function contextoDb(phone) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    const r = await fetchT(`${SUPABASE_URL}/rest/v1/rpc/contexto_contacto`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_phone: phone }),
    }, 3000);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function nombreDe(ctx) {
  if (!ctx) return null;
  return (ctx.compra && ctx.compra.nombre) || (ctx.potencial && ctx.potencial.nombre) || (ctx.lead && ctx.lead.nombre) || null;
}

// Arma las líneas de la ficha (string) a partir del contexto + estado de Brevo.
function fichaTexto(ctx, estado) {
  if (!ctx || typeof ctx !== 'object') return '';
  const compra = ctx.compra, pot = ctx.potencial, lead = ctx.lead;

  if (compra) {
    const L = [`🟢 YA TE COMPRÓ${compra.ultimo_producto ? ` — "${compra.ultimo_producto}"` : ''}`];
    const cuando = hace(compra.ultima_compra_en);
    const extra = [cuando && `compró ${cuando}`, compra.pais && `🌎 ${compra.pais}`].filter(Boolean).join(' · ');
    if (extra) L.push(`🗓️ ${extra}`);
    return L.join('\n');
  }

  if (pot) {
    const tipo = String(pot.tipo || '');
    const prod = pot.producto ? ` "${pot.producto}"` : '';
    const val = pot.valor ? ` (${pot.valor} ${pot.moneda || ''})`.trimEnd() : '';
    let cab;
    if (/rechaz/i.test(tipo)) cab = `🟠 PAGO RECHAZADO —${prod}${pot.motivo_rechazo ? ` · motivo: ${pot.motivo_rechazo}` : ''}`;
    else if (/carrito|abandon/i.test(tipo)) cab = `🟡 CASI COMPRA — dejó el carrito de${prod}${val}`;
    else cab = `🟡 CLIENTE POTENCIAL —${prod}${val}`;
    const L = [cab];
    const paso = pot.paso_recuperacion ? `recuperación paso ${pot.paso_recuperacion}` : (pot.estado_recuperacion || null);
    const cuando = hace(pot.ultimo_contacto_en || pot.ocurrido_en);
    const linea2 = [paso && `📨 ${paso}`, cuando].filter(Boolean).join(' · ');
    if (linea2) L.push(linea2);
    if (lead) L.push(`🔵 También es lead del embudo ${funnelBonito(lead.funnel)}`);
    return L.join('\n');
  }

  if (lead) {
    const L = [`🔵 LEAD — embudo ${funnelBonito(lead.funnel)}${lead.es_periodista === true ? ' · 📰 es periodista' : lead.es_periodista === false ? ' · no es periodista' : ''}`];
    if (estado) {
      const cuando = hace(estado.sentAt);
      L.push(`🎁 Último que le mandamos: ${regaloPorEstado(estado.stage, estado.mail5)}${cuando ? ` · ${cuando}` : ''}`);
    } else {
      const r = regaloEstimado(diasDesde(lead.registrado_en));
      if (r) L.push(`🎁 Probablemente le tocó: ${r} (estimado)`);
    }
    const cuando = hace(lead.registrado_en);
    L.push(`🗓️ Se registró${cuando ? ` ${cuando}` : ''}${lead.email ? ` · ${lead.email}` : ''}`);
    return L.join('\n');
  }

  return '🆕 CONTACTO NUEVO — no figura en la base (no vino de un embudo conocido)';
}

// Junta todo el contexto de un número (best-effort; nunca throwea).
async function armarContexto(from) {
  let ctx = null, estado = null;
  try { ctx = await contextoDb(from); } catch { ctx = null; }
  try { if (ctx && ctx.lead && ctx.lead.email) estado = await brevoEstado(ctx.lead.email); } catch { estado = null; }
  const ficha = fichaTexto(ctx || {}, estado);
  const nombre = nombreDe(ctx);
  const diasRegistro = ctx && ctx.lead ? diasDesde(ctx.lead.registrado_en) : null;
  return { ctx: ctx || {}, estado, ficha, nombre, diasRegistro };
}

// Vista previa de una acción para el borrador que ve Jose.
function previewAccion(accion) {
  let s = `“${accion.body}”`;
  if (accion.buttons && accion.buttons.length) s += `\n   [botones: ${accion.buttons.map((b) => b.title).join(' · ')}]`;
  if (accion.clase === 'escalar') s += `\n   (+ te lo escala para que le contestes vos)`;
  return s;
}

module.exports = async (req, res) => {
  // 1) Verificación del webhook (Meta hace un GET al configurarlo).
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    if (mode === 'subscribe' && VERIFY_TOKEN && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 2) Evento entrante.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  try {
    for (const entry of (body.entry || [])) {
      for (const change of (entry.changes || [])) {
        const value = change.value || {};
        // Avisos de estado (entregado/leído) → actualizan los ✓✓ del hilo.
        if (value.statuses && value.statuses.length) {
          try { await procesarStatuses(value.statuses); } catch (e) { console.error('[wa-inbox] statuses:', e && e.message || e); }
        }
        const messages = value.messages || [];
        if (!messages.length) continue; // sin mensajes entrantes: era solo un aviso de estado
        const nameByWa = {};
        for (const c of (value.contacts || [])) nameByWa[c.wa_id] = c.profile && c.profile.name;

        for (const m of messages) {
          const from = m.from;
          const telKey = normalizePhone(from);
          // Dedup: si Meta reintenta el webhook, no reprocesar el mismo mensaje (evita que el
          // bot conteste dos veces). Best-effort: si la consulta falla, sigue normal.
          if (await yaProcesado(m.id)) continue;
          const waName = nameByWa[from] || null;
          const texto = describeMsg(m) || `[${m.type}]`;
          const buttonId = buttonIdDe(m);

          // Contexto + ficha (best-effort).
          let info = { ctx: {}, estado: null, ficha: '', nombre: null, diasRegistro: null };
          try { info = await armarContexto(from); } catch (e) { console.error('[wa-inbox] contexto:', e && e.message || e); }

          const nombre = info.nombre || waName || 'Cliente';
          const aliasWa = (info.nombre && waName && waName !== info.nombre) ? `\n👤 En WhatsApp aparece como: ${waName}` : '';
          const encabezado = `📩 ${nombre} (+${from})`;
          const bloqueFicha = info.ficha ? `\n\n${info.ficha}${aliasWa}` : (aliasWa ? aliasWa : '');

          // Decisión del asistente.
          const accion = asistente.decidir({
            ctx: info.ctx, nombre, texto, tipoMsg: m.type, buttonId,
            estado: info.estado, diasRegistro: info.diasRegistro,
          });

          // Guarda el mensaje entrante en el historial (para el buzón y, a futuro, Leadr).
          // Si es un adjunto, guarda también el `media id` para poder re-descargar el archivo.
          const mediaId = (MEDIA_TYPES.includes(m.type) && m[m.type] && m[m.type].id) || null;
          try { await asistente.logChat({ telefono: telKey, direccion: 'in', origen: 'cliente', texto, tipo: m.type, wamid: m.id, intent: accion.intent, media_id: mediaId }); } catch {}

          // ¿Jose ya está en esta conversación? → el bot no responde, solo avisa.
          let paused = false;
          try { paused = await asistente.enPausa(telKey); } catch { paused = false; }

          // Anti-bucle: si el bot ya resolvió hace poco el MISMO intent y la persona vuelve
          // a caer en lo mismo (típico: "no me llegó" una y otra vez, o "hola" repetido),
          // no repetir el mismo texto al infinito → escalar a una persona. Solo aplica a
          // intents "de bucle" y con un umbral por intent; se descarta si pasaron +30 min
          // (ahí ya es una consulta nueva, no un loop de frustración).
          let accionEnv = accion;
          let repesNuevas = 1;
          if (ASISTENTE_ENABLED && !paused && accion.clase !== 'escalar') {
            const UMBRAL = { no_llego: 2, menu: 2, pago: 2, acceso: 2, leadr: 2, info: 3, duda: 3 };
            let rep = { ultimoIntent: null, repes: 0, ultimoBotEn: null };
            try { rep = await asistente.leerRepeticion(telKey); } catch {}
            const reciente = rep.ultimoBotEn && (Date.now() - new Date(rep.ultimoBotEn).getTime() < 30 * 60000);
            const mismo = reciente && rep.ultimoIntent === accion.intent;
            repesNuevas = mismo ? (rep.repes || 0) + 1 : 1;
            const umbral = UMBRAL[accion.intent];
            if (umbral && mismo && repesNuevas >= umbral) accionEnv = asistente.accionBucle(nombre);
          }

          if (ASISTENTE_ENABLED && !paused) {
            // --- MODO REAL: el bot responde de verdad ---
            if (accionEnv.clase === 'escalar') {
              try { await sendText({ to: telKey, body: accionEnv.body }); } catch (e) { console.error('[wa-inbox] ack escalar:', e); }
              try { await asistente.marcarEsperando(telKey); } catch {}
              try { await asistente.logChat({ telefono: telKey, direccion: 'out', origen: 'bot', texto: accionEnv.body, tipo: 'ack', intent: 'humano' }); } catch {}
              const cabeza = accionEnv.resumen || `🧑 ${nombre} pidió hablar con vos.`;
              await avisar(from, nombre, `${cabeza}\nYa le dije que le respondés en un rato.\n\n${encabezado}${bloqueFicha}\n\n💬 “${texto}”\n\n↩️ Respondé acá mismo para contestarle.`);
            } else {
              try {
                if (accionEnv.clase === 'menu') await sendButtons({ to: telKey, body: accionEnv.body, buttons: accionEnv.buttons });
                else await sendText({ to: telKey, body: accionEnv.body });
                await asistente.marcarBot(telKey, accionEnv.intent, repesNuevas);
              } catch (e) { console.error('[wa-inbox] enviar accion:', e); }
              try { await asistente.logChat({ telefono: telKey, direccion: 'out', origen: 'bot', texto: accionEnv.body, tipo: accionEnv.clase, intent: accionEnv.intent }); } catch {}
              // El bot resolvió solo (menú / info+link / reenvío de guía / pago / acceso…) →
              // NO se avisa a Telegram, para no llenar a Jose de pings de cosas ya atendidas.
              // El intercambio igual queda en `conversaciones_wa` → inbox de Leadr. Solo las
              // ESCALACIONES (rama de arriba: "hablar con equipo" / audio-imagen / botón raro)
              // le llegan a Telegram, que es cuando de verdad tiene que meterse una persona.
            }
          } else {
            // --- MODO BORRADOR (apagado) o EN PAUSA (Jose ya está en el chat) ---
            const nota = paused
              ? '\n\n⏸️ El bot está en pausa en este chat porque vos ya estás respondiendo.'
              : `\n\n🤖 BORRADOR — le respondería:\n${previewAccion(accion)}`;
            await avisar(from, nombre, `${encabezado}${bloqueFicha}\n\n💬 ${texto}${nota}\n\n↩️ Respondé acá mismo para contestarle.`);
          }

          // Si el mensaje trae un ADJUNTO, además de la ficha le reenviamos el archivo real
          // a Telegram (foto/nota de voz/video/documento). Independiente de lo que haya
          // decidido el asistente. Best-effort: si falla, nunca corta el flujo.
          if (MEDIA_TYPES.includes(m.type) && m[m.type] && m[m.type].id) {
            try { await reenviarMedia(from, nombre, m.type, m[m.type]); }
            catch (e) { console.error('[wa-inbox] reenviar media:', e && e.message || e); }
          }
        }
      }
    }
  } catch (e) {
    console.error('[wa-inbox] error procesando el evento:', e);
  }
  // Siempre 200 rápido para que Meta no reintente.
  return res.status(200).json({ ok: true });
};
