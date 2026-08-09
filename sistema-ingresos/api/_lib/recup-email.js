// api/_lib/recup-email.js — el mail de recuperación de carritos (abandono y pago rechazado).
//
// POR QUÉ ESTÁ ACÁ Y NO DENTRO DE recuperacion.js. Lo mandan DOS lugares: el webhook de Hotmart
// (`api/hotmart.js`, apenas la persona abandona — que es cuando más sirve) y el cron diario
// (`api/recuperacion.js`, el recordatorio del día siguiente). Mientras el canal fue WhatsApp los
// dos compartían la plantilla de Meta; al pasar todo a email (09/08/2026) el copy tenía que
// quedar en un solo lugar o iban a empezar a decir cosas distintas.
//
// El link va SIEMPRE con `?utm_source=recuperacion&utm_medium=email` para que la venta
// recuperada se pueda separar del resto en `ventas`. Sin eso no hay forma de saber si esto sirve.

const { LINKS, primerNombre } = require('./wa');

const BREVO = 'https://api.brevo.com/v3';
const SENDER_EMAIL = 'jose@sistemadeingresosdiariosia.com';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const COPY = {
  carrito_abandonado: {
    subject: (p) => (p >= 2 ? 'Tu lugar sigue reservado — últimas horas' : 'Te guardamos tu lugar en el Sistema de Ingresos Diarios'),
    titulo: 'Te quedó tu lugar reservado 🎯',
    cuerpo: 'Empezaste a sumarte al <b>Sistema de Ingresos Diarios para Periodistas</b> pero no llegaste a completar la compra. Tu lugar sigue guardado, con la <b>garantía de 7 días</b>: si no es para vos, te devolvemos el 100%.',
    cta: 'Retomar mi lugar',
  },
  pago_rechazado: {
    subject: (p) => (p >= 2 ? 'Tu pago quedó pendiente — completalo en 1 clic' : 'Tu pago no se procesó — probá de nuevo'),
    titulo: 'Tu pago no llegó a procesarse 💳',
    cuerpo: 'Intentaste sumarte al <b>Sistema de Ingresos Diarios para Periodistas</b> pero el pago no se completó — suele pasar con tarjetas que bloquean cobros internacionales, no es un error tuyo. Podés reintentar con <b>otra tarjeta</b> o pagar con <b>PayPal</b>. Tu lugar sigue reservado, con <b>garantía de 7 días</b>.',
    cta: 'Completar mi pago',
  },
};

function html({ nombre, titulo, cuerpo, cta, link }) {
  return `<div style="margin:0;padding:0;background:#f4f4f7;">
  <div style="max-width:520px;margin:0 auto;padding:28px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:#07070f;border-radius:14px 14px 0 0;padding:20px;text-align:center;">
      <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.3px;">Periodistas Digitales</span>
    </div>
    <div style="background:#ffffff;border-radius:0 0 14px 14px;padding:28px 24px;">
      <p style="font-size:16px;margin:0 0 6px;color:#1a1a2e;">Hola ${nombre},</p>
      <h1 style="font-size:20px;line-height:1.3;margin:8px 0 14px;color:#07070f;">${titulo}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:#333333;">${cuerpo}</p>
      <div style="text-align:center;margin:26px 0;">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 38px;border-radius:10px;">${cta} &rarr;</a>
      </div>
      <p style="font-size:12px;line-height:1.5;color:#999999;margin:18px 0 0;text-align:center;">Si ya completaste tu compra, ignorá este mensaje. · Garantía de 7 días.</p>
    </div>
  </div>
</div>`;
}

// Registra el envío en `mensajes` (canal=email, costo 0) para el historial y el P&L.
// Best-effort: el log no puede frenar una recuperación.
async function registrar(tipo, paso, ok) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mensajes`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        automatizacion: 'recuperacion', canal: 'email', tipo: `recup_${tipo}_${paso}`,
        categoria_meta: null, costo_estimado_usd: 0, ok: !!ok,
      }),
    });
  } catch { /* best-effort */ }
}

async function sendRecupEmail({ to, tipo, paso, nombre }) {
  const c = COPY[tipo];
  if (!c) return { ok: false, status: 0, error: `sin copy para tipo ${tipo}` };
  if (!to) return { ok: false, status: 0, error: 'sin email de destino' };
  if (!process.env.BREVO_API_KEY) return { ok: false, status: 0, error: 'BREVO_API_KEY sin configurar' };
  const link = `${LINKS[tipo]}&utm_source=recuperacion&utm_medium=email`;
  let r;
  try {
    r = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Periodistas Digitales', email: SENDER_EMAIL },
        to: [{ email: to, name: nombre || undefined }],
        subject: c.subject(paso),
        htmlContent: html({ nombre: primerNombre(nombre), titulo: c.titulo, cuerpo: c.cuerpo, cta: c.cta, link }),
      }),
    });
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
  await registrar(tipo, paso, r.ok);
  return { ok: r.ok, status: r.status };
}

module.exports = { sendRecupEmail, COPY };
