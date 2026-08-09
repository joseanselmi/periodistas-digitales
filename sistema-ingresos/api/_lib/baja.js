// api/_lib/baja.js — darse de baja de los correos del embudo.
//
// POR QUÉ. Ninguna de las 6 piezas del embudo tenía link de baja. La única salida que le queda a
// alguien que se harta es "Denunciar como spam", y eso no lo paga esa persona: lo paga la entrega
// de TODOS los demás (Gmail y Outlook miran la tasa de quejas del dominio, no del mail suelto).
// Un link de baja es más barato que una queja, siempre.
//
// DÓNDE VIVE. No tiene función propia: `sistema-ingresos/api/` está EXACTAMENTE en 12 funciones,
// que es el tope del plan Hobby de Vercel. Se cuelga de `api/d.js` (el redirector de descargas,
// que ya es público y ya recibe clics desde los mails) → `/api/d?baja=<email>&t=<firma>`.
//
// EL LINK VA FIRMADO. Sin firma, cualquiera que adivine el formato da de baja a otro escribiendo
// su email en la URL — y una baja no se puede deshacer desde afuera. La firma es un HMAC del
// email con `BAJA_SECRET` (o `CRON_SECRET` si no está seteada), así que un link sólo sirve para
// el destinatario al que se le mandó.
//
// LA BAJA MARCA `emailBlacklisted:true` en Brevo, que es lo que el embudo YA respeta
// (wa-funnel.js saltea a los bloqueados antes de armar el plan). No hace falta una lista aparte.

const { createHmac, timingSafeEqual } = require('crypto');

const BREVO = 'https://api.brevo.com/v3';
const SITIO = 'https://sistemadeingresosdiariosia.com';

const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const normalizar = (email) => String(email || '').toLowerCase().trim();

// Secreto de firma. `BAJA_SECRET` es el propio; si no está, cae en CRON_SECRET para que esto
// funcione desde el primer deploy sin depender de que alguien entre a Vercel a crear una variable.
function secreto() {
  return (process.env.BAJA_SECRET || process.env.CRON_SECRET || '').trim();
}

// 20 hex alcanzan de sobra (80 bits) y mantienen el link corto: nadie lo adivina a fuerza bruta
// y no ensucia el pie del mail.
function firmar(email) {
  const s = secreto();
  if (!s) return '';
  return createHmac('sha256', s).update(normalizar(email)).digest('hex').slice(0, 20);
}

function firmaValida(email, token) {
  const esperado = firmar(email);
  if (!esperado || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

// El link que va en cada mail. Si no hay secreto configurado devuelve cadena vacía y quien llama
// decide qué hacer — nunca un link sin firma, que daría de baja a cualquiera.
function urlBaja(email) {
  const t = firmar(email);
  if (!t) return '';
  return `${SITIO}/api/d?baja=${encodeURIComponent(normalizar(email))}&t=${t}`;
}

// Marca el contacto como bloqueado en Brevo. Si el contacto no existe (404) se toma como hecho:
// el objetivo es que no le llegue más nada, y a alguien que no está en la lista no le llega.
async function bloquearEnBrevo(email) {
  const key = (process.env.BREVO_API_KEY || '').trim();
  if (!key) return { ok: false, motivo: 'sin BREVO_API_KEY' };
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(normalizar(email))}`, {
    method: 'PUT',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ emailBlacklisted: true }),
  });
  if (r.status === 404) return { ok: true, nota: 'el contacto no estaba en Brevo' };
  return { ok: r.ok, status: r.status, detalle: r.ok ? '' : (await r.text()).slice(0, 200) };
}

// Deja rastro de la baja en `events`. Best-effort: si la base no contesta, la baja igual valió
// (lo que corta el envío es la marca en Brevo, no esta fila).
async function registrar(email, origen) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await fetch(`${SB_URL}/rest/v1/events`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        tipo_evento: 'baja_email',
        url: '/api/d?baja',
        src: origen || null,
        ocurrido_en: new Date().toISOString(),
        payload: { email: normalizar(email), origen: origen || null },
      }),
      signal: AbortSignal.timeout(2500),
    });
  } catch { /* best-effort */ }
}

// Procesa una baja ya verificada. `origen` distingue el clic humano del one-click del cliente
// de correo, para poder leer después cuál de los dos usa la gente.
async function darDeBaja(email, origen) {
  const r = await bloquearEnBrevo(email);
  if (r.ok) await registrar(email, origen);
  return r;
}

// Página de confirmación, con la marca del sitio. Es la última cosa nuestra que ve esa persona:
// que diga claro que ya está y que no le pida nada más.
function paginaHtml({ ok, email }) {
  const titulo = ok ? 'Listo, no te escribimos más' : 'No pudimos darte de baja';
  const cuerpo = ok
    ? `Sacamos a <b>${escapar(email)}</b> de la lista. No vas a recibir más correos nuestros.<br><br>Gracias por haberle dado una oportunidad a las guías.`
    : 'Algo falló de nuestro lado. Escribinos respondiendo a cualquiera de nuestros correos y te sacamos a mano, en el día.';
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo}</title></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;min-height:100vh;"><tr>
    <td align="center" style="padding:60px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;"><span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr>
        <tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
          <p style="margin:0 0 18px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${titulo}</p>
          <p style="margin:0;font-size:16px;color:#a0a0b8;line-height:1.7;">${cuerpo}</p>
        </td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`;
}

const escapar = (s) => String(s || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

module.exports = { urlBaja, firmar, firmaValida, darDeBaja, paginaHtml, normalizar };
