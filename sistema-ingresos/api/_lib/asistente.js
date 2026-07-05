// api/_lib/asistente.js — Cerebro del asistente de WhatsApp.
//
// Decide, para cada mensaje entrante, QUÉ responder según de dónde viene la persona
// (comprador / carrito / rechazo / lead / nuevo) y qué escribió o qué botón tocó.
// Devuelve una "acción" que api/wa-inbox.js ejecuta (o muestra como borrador si el
// asistente todavía está apagado con ASISTENTE_ENABLED != 1).
//
// TODO EL TEXTO QUE VE EL CLIENTE ESTÁ ACÁ ARRIBA, a propósito, para que se pueda
// revisar y editar sin tocar la lógica. Los {nombre} se reemplazan solos.

const { BASE, primerNombre, logConversacion } = require('./wa');

// ── Links que usan las respuestas ────────────────────────────────────────────
const LANDING = `${BASE}/?src=wa-asistente`;
const CHECKOUT = `${BASE}/?src=wa-asistente-pago`;
// Las 5 guías del embudo, en orden cronológico de envío (R1 día 0 … R5 día 8). El link
// pasa por /api/d (redirige al PDF y registra la descarga). src=WhatsApp-Reenvio para
// distinguir en las métricas los reenvíos del asistente.
const D = (file) => `${BASE}/api/d?file=${file}&src=WhatsApp-Reenvio&sck=wa-reenvio`;
const PDF = {
  1: { label: 'la Guía Claude para periodistas', link: D('guia-claude-periodistas.pdf') },
  2: { label: 'la guía completa de +50 prompts', link: D('guia-completa-50-prompts.pdf') },
  3: { label: 'la guía del periódico digital', link: D('guia-periodico-digital-ig-fb.pdf') },
  4: { label: 'la guía de los 5 pilares de ingresos', link: D('guia-5-pilares-ingresos-periodico-digital.pdf') },
  5: { label: 'la guía de agentes de IA', link: D('guia-agentes-ia-periodistas.pdf') },
};

// ── Menús guiados por segmento (hasta 3 botones; title máx 20 caracteres) ─────
const MENUS = {
  lead: {
    body: '¡Hola {nombre}! 👋 Soy el asistente de Periodistas Digitales. Para ayudarte al toque, elegí una opción 👇',
    buttons: [
      { id: 'no_llego', title: '📥 No llegó mi guía' },
      { id: 'como', title: '❓ Cómo funciona' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  carrito: {
    body: '¡Hola {nombre}! 👋 Vi que estabas por sumarte al curso. ¿En qué te doy una mano? 👇',
    buttons: [
      { id: 'pago', title: '💳 Problema al pagar' },
      { id: 'duda', title: '❓ Tengo una duda' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  rechazo: {
    body: '¡Hola {nombre}! 👋 Vi que tu pago no llegó a procesarse. Lo resolvemos en un minuto 👇',
    buttons: [
      { id: 'pago', title: '💳 Reintentar pago' },
      { id: 'duda', title: '❓ Tengo una duda' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  comprador: {
    body: '¡Hola {nombre}! 👋 ¡Gracias por tu compra! 🙌 ¿En qué te ayudo? 👇',
    buttons: [
      { id: 'acceso', title: '🔑 No puedo entrar' },
      { id: 'leadr', title: '🎁 Mi mes de Leadr' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  nuevo: {
    body: '¡Hola! 👋 Soy el asistente de Periodistas Digitales. ¿Qué estás buscando? 👇',
    buttons: [
      { id: 'no_llego', title: '📥 No llegó mi guía' },
      { id: 'info', title: '📘 Info del curso' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
};

// ── Respuestas fijas (las {..} se reemplazan solas) ──────────────────────────
const RESP = {
  info: 'Te cuento rápido, {nombre} 👇\n\n"Sistema de Ingresos Diarios" es un método para que, usando IA, un periodista arme ingresos propios sin depender de un medio. Toda la info y cómo empezar están acá:\n{LANDING}\n\nSi tenés una duda puntual, escribime y te respondo. 🙌',
  pago: '¡Tranqui, {nombre}, lo resolvemos! 🙌\n\nProbá el pago de nuevo desde acá (muchas veces es solo reintentar):\n{CHECKOUT}\n\nSi te vuelve a fallar, escribí "no puedo pagar" y te paso otra forma.',
  duda: '¡Dale, contame! 🙌 Escribime en una línea qué duda tenés y te respondo.\n\n(Toda la info también está acá: {LANDING})',
  acceso: '¡Vamos a resolverlo, {nombre}! 🔑\n\nEl acceso llega al mail con el que compraste (revisá también spam), desde Hotmart. Si no lo encontrás, respondé "no me llegó el acceso" y te lo reenvío.',
  // TODO Jose: si hay un link para auto-activar Leadr, lo pego acá.
  leadr: '¡Tu regalo! 🎁 Con la compra tenés 1 mes gratis de Leadr Pro.\n\nSe activa con el mail de tu compra. Si todavía no lo ves activo, respondé "activar Leadr" y lo dejamos listo.',
  ack_humano: '¡Dale, {nombre}! 🙌 Ya le aviso al equipo y te responde a la brevedad por acá.',
  ack_media: '¡Recibí tu mensaje, {nombre}! 🙌 Ya se lo paso al equipo y te responde en un rato.',
  aun_no: '¡Sin problema, {nombre}! 🙌 Cuando quieras te muestro cómo se arma, sin apuro. Igual te dejo todo acá por si le querés dar una mirada 👉 {LANDING}\n\nY si te queda alguna duda, escribime por acá.',
};

// ── Utilidades ───────────────────────────────────────────────────────────────
// Baja a minúsculas y saca acentos (rango de marcas diacríticas combinantes
// U+0300–U+036F) para que la detección tolere "cómo"/"como", "recibí"/"recibi", etc.
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(DIACRITICOS, '');
}

function fill(tpl, nombre) {
  return String(tpl || '')
    .replace(/\{nombre\}/g, primerNombre(nombre))
    .replace(/\{LANDING\}/g, LANDING)
    .replace(/\{CHECKOUT\}/g, CHECKOUT);
}

// Segmento a partir del contexto de la base (ficha).
function segmentoDe(ctx) {
  if (!ctx || typeof ctx !== 'object') return 'nuevo';
  if (ctx.compra) return 'comprador';
  if (ctx.potencial) return /rechaz/i.test(String(ctx.potencial.tipo || '')) ? 'rechazo' : 'carrito';
  if (ctx.lead) return 'lead';
  return 'nuevo';
}

// Última guía que se le mandó (para reenviarla si dice "no me llegó"). Identifica lo más
// fino posible: usa el estado real de Brevo (WA_STAGE = regalos de WhatsApp 3/4/oferta,
// MAIL5_AT = regalo 5 por email); si no hay dato de Brevo, estima por los días desde que
// se registró siguiendo el calendario del embudo (R1 día 0, R2 día 2, R3 día 5, R4 día 7,
// R5 día 8). Por defecto, la guía principal (la que promete el anuncio).
function ultimoRegalo(estado, diasRegistro) {
  const stage = estado ? Number(estado.stage || 0) : null;
  const mail5 = estado ? estado.mail5 : null;
  if (stage != null) {                                  // es un lead con datos de Brevo
    if (stage >= 4) return mail5 ? PDF[5] : PDF[4];      // ya recibió R4 (y R5 si mail5) / oferta
    if (stage === 3) return PDF[3];                       // último = R3 (WhatsApp)
    return (diasRegistro != null && diasRegistro >= 2) ? PDF[2] : PDF[1]; // stage 0 → emails R1/R2
  }
  if (diasRegistro != null) {                            // sin Brevo, estimo por antigüedad
    if (diasRegistro >= 8) return PDF[5];
    if (diasRegistro >= 7) return PDF[4];
    if (diasRegistro >= 5) return PDF[3];
    if (diasRegistro >= 2) return PDF[2];
    return PDF[1];
  }
  return PDF[1];                                          // sin datos → la guía principal
}

// Clasifica el texto libre en una intención. Devuelve null si no matchea nada claro.
function clasificar(texto) {
  const t = norm(texto);
  if (!t) return null;
  if (/\b(hablar|habla|comunicar|contactar)\b.*(persona|alguien|jose|humano|asesor|vos|uds|ustedes)|hablar con|quiero hablar|atencion al cliente|un asesor|una persona real|operador|\bequipo\b|no (me |se )?abre|no (me )?abrio|no puedo abrir|sigue sin abrir|no (anda|funciona) el link|link (roto|no anda|no funciona)/.test(t)) return 'humano';
  if (/no.*(lleg|recib|aparec|puedo ver)|donde.*(esta|regalo|guia|pdf|link|material|archivo)|no me llega|no me aparece|no lo tengo/.test(t)) return 'no_llego';
  if (/pag|tarjeta|rechaz|debit|credit|transferenc|no puedo pagar|error al pagar|no me deja pagar|checkout|no se proceso/.test(t)) return 'pago';
  if (/acces|acceder|entrar|ingresar|no me deja entrar|clave|contrasen|usuario|login|donde veo el curso|no puedo ver el curso/.test(t)) return 'acceso';
  if (/leadr|mes gratis|bono|regalo del curso/.test(t)) return 'leadr';
  if (/precio|cuanto|sale|cuesta|vale|cuanto es/.test(t)) return 'precio';
  if (/como (funciona|empiezo|es|arranco|uso|acced|entro)|de que se trata|se trata|informacion|info\b|quiero saber|me interesa|contame|explicame|duda|consulta/.test(t)) return 'como';
  return null;
}

// Botones de las PLANTILLAS del embudo (Regalos 3 y 4) → intención. Llegan como type
// 'button' (quick-reply de plantilla), SIN un id nuestro. Antes caían en "no es texto →
// escalar" y el lead quedaba esperando a una persona; ahora los respondemos al toque.
//   "Quiero saber cómo" (Regalo 3) / "Sí, mostrámelo" (Regalo 4) → info + link
//   "Todavía no" (Regalo 4)                                       → respuesta sin presión
function intentDeBotonPlantilla(texto) {
  const t = norm(texto);
  if (!t) return null;
  if (/quiero saber como/.test(t)) return 'como';
  if (/mostramelo|mostrame|si,? mostra/.test(t)) return 'como';
  if (/todavia no|aun no|mas tarde|despues|luego/.test(t)) return 'aun_no';
  return null;
}

// Construye la acción para un MENÚ del segmento.
function accionMenu(segmento, nombre) {
  const m = MENUS[segmento] || MENUS.nuevo;
  return {
    clase: 'menu',
    body: fill(m.body, nombre),
    buttons: m.buttons,
    intent: 'menu',
    resumen: `🤖 Le mandé el menú de opciones a ${primerNombre(nombre)}.`,
  };
}

function accionTexto(body, intent, resumen) {
  return { clase: 'texto', body, buttons: null, intent, resumen };
}

function accionEscalar(nombre, ack) {
  return {
    clase: 'escalar',
    body: fill(ack || RESP.ack_humano, nombre),
    buttons: null,
    intent: 'humano',
    resumen: `🧑 ${primerNombre(nombre)} necesita que le contestes vos.`,
  };
}

// Mapea (segmento, intención) → acción concreta.
function resolver(segmento, intent, nombre, estado, diasRegistro) {
  const n = primerNombre(nombre);
  if (intent === 'humano') return accionEscalar(nombre);

  if (intent === 'no_llego') {
    if (segmento === 'comprador') return accionTexto(fill(RESP.acceso, nombre), 'acceso', `🤖 Le di los pasos de acceso a ${n}.`);
    const g = ultimoRegalo(estado, diasRegistro);
    const body = `¡Perdón por eso, ${n}! 🙏 Acá va de nuevo ${g.label} 👇\n${g.link}\n\nSi aún así no se te abre, escribí *equipo* y te paso con una persona que te da una mano. 🙌`;
    return accionTexto(body, 'no_llego', `🤖 Le reenvié ${g.label} a ${n} (dijo que no le llegó).`);
  }
  if (intent === 'pago') return accionTexto(fill(RESP.pago, nombre), 'pago', `🤖 Le reenvié el link de pago a ${n}.`);
  if (intent === 'acceso') return accionTexto(fill(RESP.acceso, nombre), 'acceso', `🤖 Le di los pasos de acceso a ${n}.`);
  if (intent === 'leadr') return accionTexto(fill(RESP.leadr, nombre), 'leadr', `🤖 Le expliqué lo del mes de Leadr a ${n}.`);
  if (intent === 'duda') return accionTexto(fill(RESP.duda, nombre), 'duda', `🤖 Le pedí a ${n} que me cuente su duda.`);
  if (intent === 'aun_no') return accionTexto(fill(RESP.aun_no, nombre), 'aun_no', `🤖 ${n} dijo "todavía no"; le respondí sin presión y le dejé el link.`);
  if (intent === 'como' || intent === 'precio' || intent === 'info') return accionTexto(fill(RESP.info, nombre), 'info', `🤖 Le pasé la info del curso (con el link) a ${n}.`);

  // Sin intención clara → menú del segmento.
  return accionMenu(segmento, nombre);
}

// ── Decisión principal ───────────────────────────────────────────────────────
// entrada: { ctx, nombre, texto, tipoMsg, buttonId, estado, diasRegistro }
//   ctx          = { compra?, potencial?, lead? } de la RPC
//   tipoMsg      = 'text' | 'interactive' | 'image' | 'audio' | ...
//   buttonId     = id del botón si tocaron uno (interactive)
//   estado       = { stage, mail5, sentAt } de Brevo (opcional, para reenviar regalo)
//   diasRegistro = días desde que se registró el lead (fallback del regalo)
function decidir({ ctx, nombre, texto, tipoMsg, buttonId, estado, diasRegistro }) {
  const segmento = segmentoDe(ctx);

  // 1) Tocó un botón de NUESTRO menú (interactive con id propio).
  if (buttonId) {
    if (buttonId === 'humano' || buttonId === 'compre') return accionEscalar(nombre);
    return resolver(segmento, buttonId === 'info' ? 'como' : buttonId, nombre, estado, diasRegistro);
  }

  // 2) Tocó un botón de una PLANTILLA del embudo ("Quiero saber cómo" / "Sí, mostrámelo" /
  //    "Todavía no"). Llega como type 'button' sin id nuestro → lo respondemos al toque
  //    (antes caía en el punto 3 y escalaba a un humano que casi nunca contestaba).
  if (tipoMsg === 'button') {
    const btnIntent = intentDeBotonPlantilla(texto);
    if (btnIntent) return resolver(segmento, btnIntent, nombre, estado, diasRegistro);
    return accionEscalar(nombre, RESP.ack_media); // botón desconocido → lo atiende una persona
  }

  // 3) Mensaje que no es texto (audio/imagen/etc.) → lo atiende una persona.
  if (tipoMsg && tipoMsg !== 'text') return accionEscalar(nombre, RESP.ack_media);

  // 3) Texto libre → clasificar.
  const intent = clasificar(texto);
  return resolver(segmento, intent, nombre, estado, diasRegistro);
}

// ── Estado bot↔humano (tabla wa_bot_estado en la base de marketing) ──────────
// Best-effort: si Supabase no está o falla, se asume modo 'bot' (nunca frena nada).
const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const HUMANO_HORAS = 24; // cuánto cede el bot el control tras una respuesta de Jose

async function sbFetch(path, opts, ms = 2500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(`${SB_URL}/rest/v1/${path}`, {
      ...opts,
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'content-type': 'application/json',
        ...(opts && opts.headers),
      },
      signal: ctrl.signal,
    });
  } finally { clearTimeout(t); }
}

// ¿El bot está en pausa para este número porque Jose tomó la conversación?
async function enPausa(telefono) {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const r = await sbFetch(`wa_bot_estado?telefono=eq.${encodeURIComponent(telefono)}&select=modo,humano_hasta`, {});
    if (!r.ok) return false;
    const rows = await r.json();
    const row = rows && rows[0];
    if (!row || row.modo !== 'humano') return false;
    if (!row.humano_hasta) return true;
    return new Date(row.humano_hasta).getTime() > Date.now();
  } catch { return false; }
}

async function upsertEstado(telefono, patch) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await sbFetch('wa_bot_estado?on_conflict=telefono', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ telefono, updated_at: new Date().toISOString(), ...patch }),
    });
  } catch { /* best-effort */ }
}

// Jose respondió por Telegram → el bot cede el control por HUMANO_HORAS.
async function marcarHumano(telefono) {
  const hasta = new Date(Date.now() + HUMANO_HORAS * 3600000).toISOString();
  await upsertEstado(telefono, { modo: 'humano', humano_hasta: hasta });
}

// El bot hizo una acción automática → deja registro (y vuelve/queda en modo 'bot').
async function marcarBot(telefono, intent) {
  await upsertEstado(telefono, { modo: 'bot', ultimo_intent: intent || null, ultimo_bot_en: new Date().toISOString(), humano_hasta: null });
}

// ── Temas de Telegram (buzón por cliente) ────────────────────────────────────
// Cada número tiene un "tema" (topic) en el grupo de Telegram; se guarda su id en
// wa_bot_estado.tg_topic_id para poder rutear las respuestas de vuelta.
async function getTopicId(telefono) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await sbFetch(`wa_bot_estado?telefono=eq.${encodeURIComponent(telefono)}&select=tg_topic_id`, {});
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0] && rows[0].tg_topic_id) || null;
  } catch { return null; }
}

async function setTopicId(telefono, topicId) {
  await upsertEstado(telefono, { tg_topic_id: topicId });
}

async function getPhoneByTopic(topicId) {
  if (!SB_URL || !SB_KEY || !topicId) return null;
  try {
    const r = await sbFetch(`wa_bot_estado?tg_topic_id=eq.${encodeURIComponent(topicId)}&select=telefono&limit=1`, {});
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0] && rows[0].telefono) || null;
  } catch { return null; }
}

// ── Historial de conversación (tabla conversaciones_wa) ──────────────────────
// Alimenta el buzón y el inbox de Leadr. Delega en wa.logConversacion (única fuente
// del logueo del hilo, compartida con los envíos de regalos/recuperación). Best-effort.
async function logChat(row) {
  return logConversacion(row);
}

module.exports = { decidir, segmentoDe, clasificar, MENUS, RESP, enPausa, marcarHumano, marcarBot, getTopicId, setTopicId, getPhoneByTopic, logChat };
