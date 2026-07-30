// api/_lib/tg.js — Helpers de Telegram + buzón por cliente (temas / topics).
//
// Cuando TELEGRAM_GROUP_ID está seteado, cada cliente cae en SU PROPIO tema dentro del
// grupo (como un chat aparte). Si no está seteado, todo va al chat directo de Jose
// (TELEGRAM_CHAT_ID) — comportamiento viejo, para no romper nada mientras se configura.
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (id de usuario de Jose, fallback DM),
//      TELEGRAM_GROUP_ID (id del grupo "Clientes WhatsApp", con Temas activados).

const asistente = require('./asistente');

const TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const CHAT = (process.env.TELEGRAM_CHAT_ID || '').trim();
const GROUP = (process.env.TELEGRAM_GROUP_ID || '').trim();

async function tgCall(method, body, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) console.error(`[tg] ${method} error`, JSON.stringify(j).slice(0, 300));
    return j;
  } catch (e) { console.error(`[tg] ${method} fetch error`, e && e.message || e); return { ok: false }; }
  finally { clearTimeout(t); }
}

// Manda un mensaje a un chat/tema.
async function enviar({ chat_id, message_thread_id, text, reply_to }) {
  const body = { chat_id, text, disable_web_page_preview: true };
  if (message_thread_id) body.message_thread_id = message_thread_id;
  if (reply_to) body.reply_to_message_id = reply_to;
  return tgCall('sendMessage', body);
}

// Sube un archivo a Telegram (multipart/form-data). Node 18+ (Vercel) trae FormData y Blob
// globales; al pasar un FormData a fetch, se arma el boundary solo.
async function tgSendFile(method, fields, file, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) if (v != null) form.append(k, String(v));
    const blob = new Blob([file.buffer], { type: file.mime || 'application/octet-stream' });
    form.append(file.field, blob, file.filename || 'file');
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: 'POST', body: form, signal: ctrl.signal });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) console.error(`[tg] ${method} error`, JSON.stringify(j).slice(0, 300));
    return j;
  } catch (e) { console.error(`[tg] ${method} fetch error`, e && e.message || e); return { ok: false }; }
  finally { clearTimeout(t); }
}

// Reenvía un adjunto entrante (imagen/audio/video/documento) a un chat/tema, como archivo
// de verdad (antes se perdía como texto "[imagen]"). `media` = { buffer, mime, filename }.
async function enviarMedia({ chat_id, message_thread_id, tipo, media, caption }) {
  const MAP = {
    image:    { method: 'sendPhoto',    field: 'photo',    filename: 'imagen.jpg' },
    video:    { method: 'sendVideo',    field: 'video',    filename: 'video.mp4' },
    audio:    { method: 'sendVoice',    field: 'voice',    filename: 'audio.ogg' },
    sticker:  { method: 'sendDocument', field: 'document', filename: 'sticker.webp' },
    document: { method: 'sendDocument', field: 'document', filename: media && media.filename || 'documento' },
  };
  const cfg = MAP[tipo] || MAP.document;
  const fields = { chat_id };
  if (message_thread_id) fields.message_thread_id = message_thread_id;
  if (caption) fields.caption = String(caption).slice(0, 1024);
  const j = await tgSendFile(cfg.method, fields, { buffer: media.buffer, mime: media.mime, field: cfg.field, filename: cfg.filename });
  // Si Telegram rechaza la foto/voz por formato, reintenta como documento (siempre entra).
  if (!j.ok && cfg.method !== 'sendDocument') {
    const f2 = { chat_id };
    if (message_thread_id) f2.message_thread_id = message_thread_id;
    if (caption) f2.caption = String(caption).slice(0, 1024);
    return tgSendFile('sendDocument', f2, { buffer: media.buffer, mime: media.mime, field: 'document', filename: cfg.filename });
  }
  return j;
}

// Crea un tema en el grupo. Devuelve su id (message_thread_id) o null.
async function crearTema(name) {
  const j = await tgCall('createForumTopic', { chat_id: GROUP, name: String(name || 'Cliente').slice(0, 128) });
  return (j && j.result && j.result.message_thread_id) || null;
}

// Devuelve a dónde postear para un número. Si hay grupo, usa (o crea) su tema.
// { chat_id, message_thread_id?, nuevo? }
async function destinoPara(telefono, nombre) {
  if (!GROUP) return { chat_id: CHAT };
  let tid = await asistente.getTopicId(telefono);
  let nuevo = false;
  if (!tid) {
    tid = await crearTema(`${(nombre || 'Cliente')} · +${telefono}`);
    if (tid) { await asistente.setTopicId(telefono, tid); nuevo = true; }
  }
  if (tid) return { chat_id: GROUP, message_thread_id: tid, nuevo };
  return { chat_id: GROUP }; // fallback: tema General
}

module.exports = { tgCall, enviar, enviarMedia, crearTema, destinoPara, GROUP, CHAT };
