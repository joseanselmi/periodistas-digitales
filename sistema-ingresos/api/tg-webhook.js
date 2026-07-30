// api/tg-webhook.js — Puente Telegram → WhatsApp (parte 2 de 2; la otra es wa-inbox.js).
//
// PARA QUÉ: recibe lo que Jose escribe en Telegram y se lo manda al cliente por WhatsApp
// como texto libre (gratis dentro de la ventana de 24 h). Con el BUZÓN POR TEMAS, Jose
// responde escribiendo DENTRO del tema del cliente (el bot sabe a quién por el tema). Como
// respaldo también sirve "Responder" sobre un mensaje que tenga "(+<número>)".
//
// /start o /id → devuelven chat_id y thread_id (sirve para configurar TELEGRAM_GROUP_ID).
//
// Seguridad: solo actúa si el que escribe es Jose (TELEGRAM_CHAT_ID = su user id; vale en
// el chat directo y dentro del grupo) y valida el secret token del header.
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_GROUP_ID, TG_WEBHOOK_SECRET,
//      WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID.

const { normalizePhone, sendText } = require('./_lib/wa');
const asistente = require('./_lib/asistente');
const tg = require('./_lib/tg');

const TG_OWNER = (process.env.TELEGRAM_CHAT_ID || '').trim(); // user id de Jose
const TG_SECRET = (process.env.TG_WEBHOOK_SECRET || '').trim();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  // Valida el secret token del header (si está configurado en setWebhook).
  if (TG_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== TG_SECRET) {
    return res.status(200).json({ ok: true, ignored: 'bad secret' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const msg = body.message || body.edited_message;
  if (!msg || !msg.chat) return res.status(200).json({ ok: true });

  // Ignora mensajes de bots (incluido el nuestro, para no hacer loops).
  if (msg.from && msg.from.is_bot) return res.status(200).json({ ok: true });

  // Solo Jose (su user id). Vale en el chat directo y dentro del grupo.
  const fromId = msg.from ? String(msg.from.id) : '';
  if (TG_OWNER && fromId !== TG_OWNER) return res.status(200).json({ ok: true, ignored: 'not owner' });

  const chatId = String(msg.chat.id);
  const threadId = msg.message_thread_id || null;
  const text = (msg.text || '').trim();

  // /start o /id → devuelve los ids (para configurar el grupo la 1ª vez).
  if (/^\/(start|id)\b/.test(text)) {
    await tg.enviar({
      chat_id: chatId, message_thread_id: threadId, reply_to: msg.message_id,
      text: `✅ Puente WhatsApp↔Telegram activo.\nchat_id: ${chatId}\nthread_id: ${threadId || '(general)'}\n\nPara el buzón por cliente, pasame el chat_id de este grupo.`,
    });
    return res.status(200).json({ ok: true });
  }

  if (!text) return res.status(200).json({ ok: true });

  // ¿A quién le contestamos? 1) por el tema del cliente; 2) respaldo: "Responder" a un "(+<n>)".
  let to = null;
  if (threadId) {
    try { to = await asistente.getPhoneByTopic(threadId); } catch { to = null; }
  }
  if (!to) {
    const rep = msg.reply_to_message;
    const repText = (rep && (rep.text || rep.caption)) || '';
    const m = repText.match(/\(\+(\d{6,15})\)/);
    if (m) to = normalizePhone(m[1]);
  }
  if (!to) {
    await tg.enviar({
      chat_id: chatId, message_thread_id: threadId, reply_to: msg.message_id,
      text: '↩️ No supe a quién contestarle. Escribí dentro del tema del cliente, o deslizá su mensaje (el que empieza con “📩”) y elegí “Responder”.',
    });
    return res.status(200).json({ ok: true });
  }

  const sent = await sendText({ to, body: text });
  if (sent.ok) {
    // Jose tomó la conversación → el asistente se hace a un lado en este chat por 24 h.
    try { await asistente.marcarHumano(to); } catch (e) { console.error('[tg-webhook] marcarHumano:', e && e.message || e); }
    try { await asistente.logChat({ telefono: to, direccion: 'out', origen: 'jose', texto: text, tipo: 'text', wamid: sent.wamid }); } catch {}
    await tg.enviar({ chat_id: chatId, message_thread_id: threadId, reply_to: msg.message_id, text: `✅ Enviado a +${to}` });
  } else {
    const err = (sent.body && sent.body.error && sent.body.error.message) || sent.status;
    const outside = /re-?engage|24 hours|outside|allowed window|131047|131051/i.test(JSON.stringify(sent.body || {}));
    const hint = outside
      ? '\n\n⚠️ Pasaron más de 24 h desde el último mensaje del cliente. Por regla de WhatsApp no se puede mandar texto libre; el cliente tiene que volver a escribirte primero.'
      : '';
    await tg.enviar({ chat_id: chatId, message_thread_id: threadId, reply_to: msg.message_id, text: `❌ No se pudo enviar a +${to}: ${err}${hint}` });
  }
  return res.status(200).json({ ok: true });
};
