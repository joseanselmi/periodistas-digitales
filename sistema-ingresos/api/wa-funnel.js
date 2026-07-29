// Disparador del embudo de WhatsApp (Regalos 3, 4 y Oferta) para la campaña
// "Guía Claude Periodistas". Corre 1 vez por día por Vercel Cron (ver vercel.json).
//
// POR QUÉ ESTO Y NO MAKE: el envío de WhatsApp es 100% código propio (tenemos el
// token de la Cloud API). En vez de armar un escenario en Make a mano, esta función
// lee los leads de Brevo, calcula quién está en el día 5/7/9 desde que entró, y
// dispara la plantilla que corresponde por la Graph API. Se autocontiene: no depende
// de Make ni de que nadie toque una UI.
//
// FLUJO POR LEAD (día 0 = entró a la lista Brevo #5, lo hace el escenario Make 9474482 webhook instantáneo; antes 9433023):
//   día 0  Regalo 1 (email)      → ya andando (Make)
//   día 2  Regalo 2 (email)      → ya andando (automatización Brevo)
//   día 5  Regalo 3 (EMAIL)      → ESTA función  (guía del periódico digital)
//   día 7  Regalo 4 (EMAIL)      → ESTA función  (guía de los 5 pilares)
//   día 8  Regalo 5 (EMAIL)      → ESTA función  (guía "agentes de IA" — último regalo antes de la oferta)
//   día 9  Oferta   (EMAIL)      → ESTA función  (lleva a la landing; es la que vende)
//
// EL EMBUDO VA POR EMAIL (decisión de Jose, 29/07). No es un desvío mientras Meta tenga el
// número capado (ver tarjeta #89): es el canal elegido. Las plantillas de WhatsApp siguen en
// el código y andan, pero NO se usan salvo que alguien ponga WA_SEND_FORCE=1 en Vercel — y ahí
// se le pregunta primero a Meta si el número puede enviar, para no repetir lo del 13-28/07
// (los envíos rebotaban, igual consumían el tiempo de la corrida, y el Regalo 3 —último en la
// prioridad— pasó diez días sin salir con 285 leads esperándolo).
//
// CADA PASO POR EMAIL AVANZA WA_STAGE. Es el mismo recorrido por otro canal, no mensajes
// extra: por eso la cadena llega hasta la oferta y nadie recibe dos veces lo mismo.
//
// ESTADO POR LEAD: se guarda en el atributo Brevo WA_STAGE (0/3/4/5) para no repetir
// los pasos de WhatsApp. El Regalo 5 (email) se marca aparte con el atributo MAIL5_AT
// para NO tocar la numeración lineal de WA_STAGE — así no arriesga a los leads en curso
// ni corre la fecha de la oferta. Se manda como máximo UN mensaje por lead por corrida.
//
// MODOS (query ?mode=):
//   inspect  — devuelve una muestra de contactos con sus atributos crudos (para ver
//              cómo se llama el campo del teléfono/nombre). No manda nada.
//   dry      — calcula a quién le tocaría hoy y qué plantilla, SIN mandar ni tocar Brevo.
//   setup    — crea los atributos WA_STAGE y MAIL5_AT en Brevo (correr una sola vez).
//   mail5test— manda el email del Regalo 5 a ?to=<email> (default Jose) para previsualizarlo. No toca Brevo.
//   regalotest— manda el Regalo 3 o 4 por email: ?nivel=3|4&to=<email>. No toca Brevo.
//   wasalud  — qué dice Meta del número (can_send_message). No manda nada.
//   live     — manda de verdad y actualiza WA_STAGE. Requiere ADEMÁS WA_FUNNEL_ENABLED=1.
//   (el cron llama sin mode → equivale a live, pero si WA_FUNNEL_ENABLED != 1 se degrada a dry)
//
// SEGURIDAD: protegida por CRON_SECRET (header Authorization: Bearer <secret> que agrega
// Vercel Cron, o ?key=<secret> para probar a mano).
//
// REGALO 5 (email) — flags:
//   - Se envía sólo si WA_FUNNEL_ENABLED=1 (funnel vivo) Y ADEMÁS MAIL5_ENABLED=1.
//   - Se deja MAIL5_ENABLED apagado hasta probar el email E2E (mode=mail5test&to=...).
//   - Correr una vez mode=setup para crear el atributo MAIL5_AT en Brevo.
//
// OFERTA POR EMAIL (plan B mientras WhatsApp no entrega) — flags:
//   - Se envía sólo si WA_FUNNEL_ENABLED=1 Y ADEMÁS MAILOFERTA_ENABLED=1 (default OFF).
//   - Va a quien ya está en WA_STAGE>=5: la oferta se les "disparó" por WhatsApp pero Meta la
//     marcó fallida, así que nunca la vieron. Se marca con OFERTA_MAIL_AT (uno por lead).
//   - Probar primero con mode=ofertatest&to=... (no toca Brevo), y correr mode=setup una vez.
//
// REGALOS 3 y 4 POR EMAIL — flags:
//   - Se envían sólo si WA_FUNNEL_ENABLED=1 Y ADEMÁS MAILREGALOS_ENABLED=1 (default OFF),
//     y sólo cuando Meta dice que el número NO puede enviar.
//   - Avanzan WA_STAGE (son el mismo paso, no un extra) y dejan MAIL3_AT / MAIL4_AT como
//     registro de por qué canal salieron.
//   - Probar primero con mode=regalotest&nivel=3&to=... y correr mode=setup una vez.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   BREVO_API_KEY, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, CRON_SECRET,
//   WA_FUNNEL_ENABLED, MAIL5_ENABLED, MAILOFERTA_ENABLED, MAILREGALOS_ENABLED, WA_SEND_FORCE

const GRAPH = 'https://graph.facebook.com/v21.0';
const BREVO = 'https://api.brevo.com/v3';
const LIST_ID = 5; // "Leadgen - Guía Claude"

// Registro de mensajes (gasto variable por automatización) → Contabilidad en Leadr.
// logConversacion → deja el regalo en el hilo del inbox (Leadr), como PRIMER mensaje nuestro.
const { logMensaje, logConversacion } = require('./_lib/wa');
// Telegram: para el recordatorio diario de escalaciones sin responder (ver más abajo).
const tg = require('./_lib/tg');

// Supabase (base de marketing) — solo para el recordatorio de escalaciones pendientes.
const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
async function sbRest(path, opts) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json', ...(opts && opts.headers) },
  });
}

// Emails que YA compraron el curso → salen del funnel: no más regalos ni oferta (le estaríamos
// vendiendo algo ya comprado + gastando plantillas de marketing). Cruce con `ventas`, igual que
// hace la recuperación. Best-effort: si Supabase falla, no excluye a nadie (no frena el envío).
async function ventasEmailsSet() {
  if (!SB_URL || !SB_KEY) return new Set();
  try {
    const r = await sbRest('ventas?select=email', {});
    if (!r.ok) return new Set();
    const rows = await r.json();
    return new Set((rows || []).map((v) => String(v.email || '').toLowerCase().trim()).filter(Boolean));
  } catch { return new Set(); }
}

// Teléfonos que YA nos escribieron por WhatsApp (tienen mensajes entrantes en el hilo). El
// seguimiento no se manda a quien ya respondió (criterio: "no compró NI respondió"). Best-effort.
async function respondieronSet() {
  if (!SB_URL || !SB_KEY) return new Set();
  try {
    const r = await sbRest('conversaciones_wa?select=telefono&direccion=eq.in', {});
    if (!r.ok) return new Set();
    const rows = await r.json();
    return new Set((rows || []).map((x) => normalizePhone(x.telefono)).filter(Boolean));
  } catch { return new Set(); }
}
function haceHoras(iso) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const h = Math.floor((Date.now() - t) / 3600000);
  if (h < 1) return 'hace menos de 1 h';
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

// Recordatorio de escalaciones SIN RESPONDER. El bot, cuando pasa un chat a una persona,
// deja el número en modo 'esperando' con `escalado_en`. Acá buscamos los que llevan +3 h
// esperando y que todavía no fueron recordados, y le pingamos a Jose por Telegram (al tema
// del cliente) para que no queden en el olvido — como pasó con 4 pedidos de "hablar con
// equipo" del 3–8 jul que nunca recibieron respuesta. Best-effort: nunca throwea.
async function recordarEscalacionesPendientes() {
  if (!SB_URL || !SB_KEY) return { ok: false, motivo: 'sin supabase' };
  const corte = new Date(Date.now() - 3 * 3600000).toISOString();
  const r = await sbRest(`wa_bot_estado?modo=eq.esperando&escalado_en=lt.${encodeURIComponent(corte)}&recordatorio_en=is.null&select=telefono,escalado_en&limit=25`, {});
  if (!r.ok) return { ok: false, status: r.status };
  const rows = await r.json();
  let avisados = 0;
  for (const row of (rows || [])) {
    try {
      const dest = await tg.destinoPara(row.telefono, `+${row.telefono}`);
      await tg.enviar({ ...dest, text: `⏰ Recordatorio: +${row.telefono} pidió hablar con una persona ${haceHoras(row.escalado_en)} y todavía no le respondiste.\n\n↩️ Respondé acá mismo para contestarle.` });
      await sbRest(`wa_bot_estado?telefono=eq.${encodeURIComponent(row.telefono)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ recordatorio_en: new Date().toISOString() }) });
      avisados++;
    } catch (e) { console.error('[wa-funnel] recordatorio escalacion:', e && e.message || e); }
  }
  return { ok: true, pendientes: (rows || []).length, avisados };
}

// Texto legible del hilo (inbox) para cada plantilla del embudo (el body real lo renderiza
// Meta; acá guardamos qué se envió para que el hilo se lea claro).
const REGALO_TEXTO = {
  regalo3_periodico_digital: '🎁 Regalo 3 — Guía del periódico digital (PDF, WhatsApp)',
  regalo4_sistema_completo: '🎁 Regalo 4 — Guía de los 5 pilares (PDF, WhatsApp)',
  oferta_sistema_ingresos: '💰 Oferta — el mensaje con el precio',
  seguimiento_lead: '🔔 Seguimiento — reactivación (no compró tras la oferta)',
};

const PDF_R3 = 'https://sistemadeingresosdiariosia.com/guia-periodico-digital-ig-fb.pdf';
const PDF_R4 = 'https://sistemadeingresosdiariosia.com/guia-5-pilares-ingresos-periodico-digital.pdf';

// stage → { después de cuántos días se manda, cómo armar el template }
const STAGES = [
  { stage: 3, minDays: 5, tmpl: 'regalo3_periodico_digital' },
  { stage: 4, minDays: 7, tmpl: 'regalo4_sistema_completo' },
  { stage: 5, minDays: 9, tmpl: 'oferta_sistema_ingresos' },
];

// Seguimiento de leads fríos (plantilla seguimiento_lead) — reactiva a quien recibió la OFERTA
// (WA_STAGE 5) y a los N días NO compró (ya filtrado por `ventas`) ni respondió nunca por
// WhatsApp. Gateado por SEGUIMIENTO_ENABLED (default OFF), además de WA_FUNNEL_ENABLED. Se
// marca con su propio atributo SEG_AT (no toca WA_STAGE) → un solo seguimiento por lead.
const SEGUIMIENTO = { minDiasDesdeOferta: 7, tmpl: 'seguimiento_lead' };

// Regalo 5 (EMAIL) — "La revolución de los agentes de IA". Último regalo de VALOR,
// después del Regalo 4 (WhatsApp, día 7) y antes de la oferta (día 9). Se dispara por
// su propio atributo (MAIL5_AT), no por WA_STAGE: sólo a quien ya recibió el Regalo 4.
// Copy espejo de la campaña 'leadgen-5-agentes-ia' de ads-agent/send-email.mjs (aprobada).
const MAIL5 = {
  minDays: 8,        // ~1 día después del Regalo 4 (día 7); la oferta (día 9) no se toca
  afterStage: 4,     // sólo a quien ya pasó por el Regalo 4 (WhatsApp)
  from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
  subject: 'La guía de agentes de IA (el paso que viene después de los prompts)',
  html: `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr>
        <tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
          <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">El siguiente nivel: agentes de IA</p>
          <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Hasta acá usaste la IA prompt a prompt. El paso que sigue es otro: <strong style="color:#ffffff;">agentes</strong> que hacen tareas enteras por su cuenta — investigar, redactar borradores, reutilizar una nota en varios formatos — mientras vos te quedás con el criterio editorial.</p>
          <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Te armamos una guía práctica para entenderlos y empezar a usarlos en tu redacción, sin vueltas técnicas.</p>
          <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
          <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Lo que vas a encontrar</p>
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Chatbot vs. agente</strong> — la diferencia que cambia cómo trabajás</td></tr>
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Casos prácticos para una redacción</strong> — producción, investigación, audiencia y archivo</td></tr>
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Cómo empezar paso a paso</strong> — sin conocimientos técnicos y sin reformar todo de golpe</td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
            <a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&amp;src=Email-Regalo5&amp;sck=email5" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Descargar la guía de agentes de IA (PDF) →</a>
          </td></tr></table>
          <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`,
  text: `PERIODISTAS DEL FUTURO IA

El siguiente nivel: agentes de IA

Hasta acá usaste la IA prompt a prompt. El paso que sigue es otro: agentes que hacen tareas enteras por su cuenta — investigar, redactar borradores, reutilizar una nota en varios formatos — mientras vos te quedás con el criterio editorial.

Te armamos una guía práctica para entenderlos y empezar a usarlos en tu redacción, sin vueltas técnicas.

LO QUE VAS A ENCONTRAR
→ Chatbot vs. agente — la diferencia que cambia cómo trabajás
→ Casos prácticos para una redacción — producción, investigación, audiencia y archivo
→ Cómo empezar paso a paso — sin conocimientos técnicos y sin reformar todo de golpe

Descargar la guía de agentes de IA (PDF): https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&src=Email-Regalo5&sck=email5

Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.`,
};

// OFERTA POR EMAIL — plan B mientras WhatsApp no entrega (Business Verification en revisión
// desde el 13/07: Meta marca FALLIDO el 100% de los envíos). La oferta se "disparó" a 289 leads
// que nunca la vieron. Este email la hace llegar por el canal que SÍ funciona (Brevo: 22,6% de
// apertura, 0,45% de bounce al 21/07). Copy espejo de la plantilla `oferta_sistema_ingresos` v2
// aprobada por Jose el 2026-07-09 (ver PLANTILLAS-WHATSAPP.md): posiciona el curso y hace tee-up
// de la landing. NO revela el precio — eso lo hace la página (regla de la campaña).
// Se dispara por su propio atributo (OFERTA_MAIL_AT), no toca WA_STAGE: si mañana WhatsApp
// revive, el funnel sigue su curso sin duplicar nada.
const MAILOFERTA = {
  afterStage: 5,     // sólo a quien ya llegó a la etapa de oferta (la haya recibido o no)
  from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
  subject: 'Llegaste al final de las 4 guías (esto es lo que sigue)',
  html: `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr>
        <tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
          <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Ya tenés las piezas. Falta armarlas.</p>
          <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Llegaste hasta el final de las 4 guías. Eso ya te pone adelante: sabés qué es un periódico digital propio, cómo la IA te multiplica el trabajo y cuáles son los 5 pilares que sostienen un ingreso que se repite.</p>
          <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Lo que falta es lo más importante: <strong style="color:#ffffff;">armarlas en un sistema</strong> que trabaje para vos todos los días.</p>
          <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
          <p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">Para eso está el <strong style="color:#ffffff;">curso Sistema de Ingresos Diarios</strong>: te lleva paso a paso, con el método completo, desde donde estás hoy hasta generar tus propios ingresos con tu periódico digital y la IA — con tu criterio editorial al frente y sin depender de un medio.</p>
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">El método completo</strong> — el mismo recorrido, ordenado y en video</td></tr>
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Paso a paso, desde cero</strong> — qué hacer el lunes, no sólo qué entender</td></tr>
            <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">Tu oficio, tu firma</strong> — la experiencia que ya tenés, puesta a producir</td></tr>
          </table>
          <p style="margin:0 0 24px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">En esta página te mostramos cómo funciona y cómo podés empezar hoy 👇</p>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
            <a href="https://sistemadeingresosdiariosia.com/?src=Email-Oferta&amp;sck=email-oferta" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Ver cómo funciona el curso →</a>
          </td></tr></table>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`,
  text: `PERIODISTAS DEL FUTURO IA

Ya tenés las piezas. Falta armarlas.

Llegaste hasta el final de las 4 guías. Eso ya te pone adelante: sabés qué es un periódico digital propio, cómo la IA te multiplica el trabajo y cuáles son los 5 pilares que sostienen un ingreso que se repite.

Lo que falta es lo más importante: armarlas en un sistema que trabaje para vos todos los días.

Para eso está el curso Sistema de Ingresos Diarios: te lleva paso a paso, con el método completo, desde donde estás hoy hasta generar tus propios ingresos con tu periódico digital y la IA — con tu criterio editorial al frente y sin depender de un medio.

→ El método completo — el mismo recorrido, ordenado y en video
→ Paso a paso, desde cero — qué hacer el lunes, no sólo qué entender
→ Tu oficio, tu firma — la experiencia que ya tenés, puesta a producir

En esta página te mostramos cómo funciona y cómo podés empezar hoy:
https://sistemadeingresosdiariosia.com/?src=Email-Oferta&sck=email-oferta`,
};

// REGALOS 3 y 4 POR EMAIL — la ENTRADA del embudo, que hasta acá sólo salía por WhatsApp.
// Mientras el número está LIMITED, esos dos pasos no llegaban a nadie y los leads quedaban
// parados en la etapa 0: sin Regalo 3 no hay Regalo 4, sin Regalo 4 no hay Regalo 5 ni oferta.
// El 28/07 había 285 leads esperando el Regalo 3 desde hacía diez días.
//
// Copy espejo de las plantillas `regalo3_periodico_digital` y `regalo4_sistema_completo`
// (aprobadas, ver PLANTILLAS-WHATSAPP.md), adaptado a email. Las guías van como LINK con
// tracking (`/api/d`), no adjuntas: así se cuenta quién la abrió de verdad (tarjeta #50).
//
// Estos SÍ avanzan WA_STAGE (a diferencia del Regalo 5 y la oferta, que llevan marcador
// aparte): son el mismo paso del embudo por otro canal, no un extra. Avanzarlo es lo que
// destraba la cadena — y de paso evita que el lead reciba el mismo regalo dos veces si
// WhatsApp revive. El marcador propio (MAIL3_AT / MAIL4_AT) queda sólo para medir.
const REGALOS_EMAIL = {
  3: {
    stage: 3,
    marcador: 'MAIL3_AT',
    tag: 'regalo3-periodico',
    from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
    subject: 'Tu Regalo 3: cómo armar tu periódico digital desde cero',
    titulo: 'Tu propio periódico digital',
    entradas: [
      'Hay periodistas ganando dinero con su propio periódico digital en Instagram y Facebook. No con un medio detrás: con su nombre, su criterio y su oficio.',
      'Este es el Regalo 3: una guía simple para armar el tuyo desde cero, incluido cómo planificar el contenido de todo el mes.',
    ],
    bullets: [
      ['Cómo se arma desde cero', 'la estructura, el nombre y el primer mes de contenido'],
      ['Instagram y Facebook', 'qué publicar en cada uno y con qué frecuencia'],
      ['El calendario del mes', 'para no arrancar de cero cada mañana'],
    ],
    cta: 'Descargar la guía del periódico digital (PDF) →',
    archivo: 'guia-periodico-digital-ig-fb.pdf',
    src: 'Email-Regalo3',
    sck: 'email3',
    cierre: 'Y hay quienes ya llevan hasta 10 periódicos en simultáneo con ayuda de la IA, viviendo de esto como autónomos. Eso te lo contamos en el próximo mensaje.',
  },
  4: {
    stage: 4,
    marcador: 'MAIL4_AT',
    tag: 'regalo4-pilares',
    from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
    subject: 'Tu Regalo 4: las 5 piezas que sostienen el ingreso',
    titulo: 'Cómo se sostienen 10 periódicos a la vez',
    entradas: [
      'Los periodistas que llevan varios periódicos digitales en simultáneo no escriben cada posteo a mano: usan un sistema donde la IA hace la producción (como viste en los Regalos 1 y 2) y ellos se quedan con lo que decide todo — el lector ideal, la oferta, las ventas y el tráfico.',
      'Este es el Regalo 4: la guía de las 5 piezas que conectan lo que ya armaste con un ingreso que se repite cada semana.',
    ],
    bullets: [
      ['Tu lector ideal', 'para quién escribís y qué necesita de vos'],
      ['La oferta', 'qué le vendés a esa audiencia que ya te lee'],
      ['Ventas y tráfico', 'cómo llega gente nueva y cómo se convierte en ingreso'],
    ],
    cta: 'Descargar la guía de los 5 pilares (PDF) →',
    archivo: 'guia-5-pilares-ingresos-periodico-digital.pdf',
    src: 'Email-Regalo4',
    sck: 'email4',
    cierre: 'Leelas en orden: cada pieza se apoya en la anterior.',
  },
};

// Un solo molde para los dos regalos — mismo diseño que el Regalo 5 y la oferta, que ya
// vienen entregando bien en Brevo. Cambiar el molde acá los cambia a los dos a la vez.
function armarEmailRegalo(cfg) {
  const link = `https://sistemadeingresosdiariosia.com/api/d?file=${cfg.archivo}&src=${cfg.src}&sck=${cfg.sck}`;
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr>
        <tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
          <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${cfg.titulo}</p>
          ${cfg.entradas.map((p) => `<p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">${p}</p>`).join('\n          ')}
          <div style="border-top:1px solid #1e1e2e;margin:24px 0 28px 0;"></div>
          <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Lo que vas a encontrar</p>
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
            ${cfg.bullets.map(([t, d]) => `<tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="color:#22d3ee;font-size:18px;">→</span></td><td style="padding:8px 0;font-size:15px;color:#c0c0d8;line-height:1.5;"><strong style="color:#ffffff;">${t}</strong> — ${d}</td></tr>`).join('\n            ')}
          </table>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
            <a href="${link.replace(/&/g, '&amp;')}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">${cfg.cta}</a>
          </td></tr></table>
          <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">${cfg.cierre}</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`;
  const text = `PERIODISTAS DEL FUTURO IA

${cfg.titulo}

${cfg.entradas.join('\n\n')}

LO QUE VAS A ENCONTRAR
${cfg.bullets.map(([t, d]) => `→ ${t} — ${d}`).join('\n')}

${cfg.cta.replace(' →', '')}: ${link}

${cfg.cierre}`;
  return { html, text };
}

const DAY = 86400000;

// Normaliza a E.164 sin "+". Corrige el bug del "9" faltante en móviles argentinos:
// +54 [área] [nº]  →  +54 9 [área] [nº]  (WhatsApp lo exige para AR).
function normalizePhone(raw) {
  let d = String(raw == null ? '' : raw).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('54') && d[2] !== '9') d = '54' + '9' + d.slice(2);
  return d;
}

function pickName(attrs) {
  const n = (attrs.FIRSTNAME || attrs.NOMBRE || attrs.NAME || attrs.FIRST_NAME || '').trim();
  return (n ? n.split(/\s+/)[0] : '') || 'colega';
}

function pickPhone(attrs) {
  return attrs.SMS || attrs.WHATSAPP || attrs.PHONE || attrs.TELEFONO || attrs.WA || '';
}

// Construye el body de /messages según la etapa.
function buildTemplatePayload(stage, to, nombre) {
  if (stage === 3) {
    return {
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: 'regalo3_periodico_digital', language: { code: 'es' },
        components: [
          { type: 'header', parameters: [{ type: 'document', document: { link: PDF_R3, filename: 'Guia periodico digital IG-FB.pdf' } }] },
          { type: 'body', parameters: [{ type: 'text', text: nombre }] },
        ],
      },
    };
  }
  if (stage === 4) {
    return {
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: 'regalo4_sistema_completo', language: { code: 'es' },
        components: [
          { type: 'header', parameters: [{ type: 'document', document: { link: PDF_R4, filename: 'Guia 5 pilares de ingresos.pdf' } }] },
        ],
      },
    };
  }
  // stage 5 — Oferta. La v2 (reescrita 2026-07) saluda "Hola {{1}}" → requiere pasar el nombre;
  // la v1 (sin variable) no. Enviar el parámetro que no corresponde = Meta rechaza el envío.
  // Como la aprobación de Meta es asíncrona, se controla por env OFERTA_V2: poner "1" en Vercel
  // EN CUANTO Meta apruebe la v2 (surte efecto sin redeploy). Mientras, se envía la v1.
  if (process.env.OFERTA_V2 === '1') {
    return {
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: 'oferta_sistema_ingresos', language: { code: 'es' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: nombre }] }],
      },
    };
  }
  return {
    messaging_product: 'whatsapp', to, type: 'template',
    template: { name: 'oferta_sistema_ingresos', language: { code: 'es' } },
  };
}

// Body de la plantilla de seguimiento (1 variable = nombre; botón URL estático a la landing).
function buildSeguimientoPayload(to, nombre) {
  return {
    messaging_product: 'whatsapp', to, type: 'template',
    template: {
      name: 'seguimiento_lead', language: { code: 'es' },
      components: [{ type: 'body', parameters: [{ type: 'text', text: nombre }] }],
    },
  };
}

async function brevoGetContacts() {
  const key = process.env.BREVO_API_KEY;
  const out = [];
  let offset = 0;
  for (let i = 0; i < 20; i++) { // hasta 20 páginas (10.000 contactos), de sobra
    const r = await fetch(`${BREVO}/contacts/lists/${LIST_ID}/contacts?limit=500&offset=${offset}`, {
      headers: { 'api-key': key, accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`Brevo list ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const batch = j.contacts || [];
    out.push(...batch);
    if (batch.length < 500) break;
    offset += 500;
  }
  return out;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

async function brevoSetStage(email, stage) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes: { WA_STAGE: stage, WA_SENT_AT: todayISO() } }),
  });
  if (!r.ok) throw new Error(`Brevo setStage ${r.status}: ${await r.text()}`);
}

async function brevoCreateAttribute() {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/attributes/normal/WA_STAGE`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'float' }),
  });
  const text = await r.text();
  return { ok: r.ok, status: r.status, body: text };
}

// Crea el atributo MAIL5_AT (texto ISO) que marca a quién ya se le mandó el Regalo 5.
async function brevoCreateMail5Attribute() {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/attributes/normal/MAIL5_AT`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'text' }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Crea el atributo SEG_AT (texto ISO) que marca a quién ya se le mandó el seguimiento.
async function brevoCreateSegAttribute() {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/attributes/normal/SEG_AT`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'text' }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Envía el email del Regalo 5 a un lead vía Brevo (transaccional).
// El `tag` deja que Brevo trackee aperturas/clics de EXACTAMENTE este envío
// (filtrable en Statistics → Transactional por el tag, o vía aggregatedReport).
const MAIL5_TAG = 'regalo5-agentes-ia';
async function sendMail5(email, nombre) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: MAIL5.from,
      to: [{ email, name: nombre || 'Periodista' }],
      subject: MAIL5.subject,
      htmlContent: MAIL5.html,
      textContent: MAIL5.text,
      tags: [MAIL5_TAG],
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Aperturas/clics del Regalo 5 según Brevo (filtrado por el tag del envío).
async function mail5OpenStats() {
  const key = process.env.BREVO_API_KEY;
  try {
    const r = await fetch(`${BREVO}/smtp/statistics/aggregatedReport?tag=${MAIL5_TAG}`, {
      headers: { 'api-key': key, accept: 'application/json' },
    });
    if (!r.ok) return { disponible: false, motivo: `Brevo ${r.status}` };
    const j = await r.json();
    return { disponible: true, entregados: j.delivered ?? null, aperturas_unicas: j.uniqueOpens ?? null, clics_unicos: j.uniqueClicks ?? null };
  } catch (e) { return { disponible: false, motivo: String(e && e.message || e) }; }
}

// Crea el atributo OFERTA_MAIL_AT (texto ISO) que marca a quién ya se le mandó la oferta por email.
async function brevoCreateMailOfertaAttribute() {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/attributes/normal/OFERTA_MAIL_AT`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'text' }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Envía la OFERTA por email (plan B de WhatsApp). Tag propio → sus aperturas/clics se miden
// separadas del Regalo 5 y se pueden comparar contra la oferta por WhatsApp cuando reviva.
const MAILOFERTA_TAG = 'oferta-email';
async function sendMailOferta(email, nombre) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: MAILOFERTA.from,
      to: [{ email, name: nombre || 'Periodista' }],
      subject: MAILOFERTA.subject,
      htmlContent: MAILOFERTA.html,
      textContent: MAILOFERTA.text,
      tags: [MAILOFERTA_TAG],
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Marca en Brevo que a este lead ya se le mandó la oferta por email (para no repetir).
async function brevoSetMailOferta(email) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes: { OFERTA_MAIL_AT: todayISO() } }),
  });
  if (!r.ok) throw new Error(`Brevo setMailOferta ${r.status}: ${await r.text()}`);
}

// REENVÍO DE LA OFERTA — segunda oportunidad para quien no la abrió.
// La oferta abre al 11% contra el 22% de los regalos: casi 9 de cada 10 leads que terminan el
// recorrido nunca ven el mensaje que vende. No es un problema del contenido —es del asunto—,
// así que el reenvío cambia la puerta de entrada (otro asunto, texto más corto) y mantiene el
// mismo destino. Va sólo a quien NO abrió, a las 48 h, una sola vez (marcador OFERTA_MAIL2_AT).
//
// ⚙️ El asunto es lo único que decide si esto sirve: es la variable que estamos moviendo.
const OFERTA_REENVIO = {
  minHoras: 48,
  marcador: 'OFERTA_MAIL2_AT',
  tag: 'oferta-reenvio',      // el de ESTE envío
  tagOrigen: 'oferta-email',  // el del envío original: de ahí salen las aperturas que hay que respetar
  from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
  // Elegido por Jose el 29/07. El asunto original ("Llegaste al final de las 4 guías…") rendía
  // 11%: describía dónde estaba parado el lector. Este cambia el TIPO de asunto —promete un
  // resultado—, no sólo las palabras. Si el reenvío también fuera descriptivo estaríamos
  // probando la misma tecla y midiendo lo mismo otra vez.
  subject: 'De las cuatro guías a tu primer ingreso',
  titulo: 'Las cuatro guías, en un solo sistema',
  parrafos: [
    'Te mandamos cuatro guías: el periódico digital, los prompts, los 5 pilares y los agentes de IA. Cada una resuelve una parte.',
    'Lo que las vuelve un ingreso es el orden en que se usan — qué va primero, qué se apoya en qué, y qué hacés el lunes a la mañana.',
    'Eso es el curso Sistema de Ingresos Diarios: el recorrido completo, en video, desde donde estás hoy hasta tu periódico digital funcionando con tu firma y tu criterio.',
  ],
  cta: 'Ver cómo funciona el curso →',
  url: 'https://sistemadeingresosdiariosia.com/?src=Email-Oferta2&sck=email-oferta2',
  cierre: 'Está todo explicado en la página, con calma.',
};

function armarEmailReenvio() {
  const c = OFERTA_REENVIO;
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;"><tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:32px;"><span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Periodistas del Futuro <span style="color:#22d3ee;">IA</span></span></td></tr>
        <tr><td style="background:#0f0f1a;border-radius:16px;padding:40px 36px;">
          <p style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${c.titulo}</p>
          ${c.parrafos.map((p) => `<p style="margin:0 0 16px 0;font-size:16px;color:#a0a0b8;line-height:1.7;">${p}</p>`).join('\n          ')}
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;"><tr><td align="center">
            <a href="${c.url.replace(/&/g, '&amp;')}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">${c.cta}</a>
          </td></tr></table>
          <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">${c.cierre}</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.</p></td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`;
  const text = `PERIODISTAS DEL FUTURO IA

${c.titulo}

${c.parrafos.join('\n\n')}

${c.cta.replace(' →', '')}: ${c.url}

${c.cierre}`;
  return { html, text };
}

async function enviarReenvioOferta(email, nombre) {
  const { html, text } = armarEmailReenvio();
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: OFERTA_REENVIO.from,
      to: [{ email, name: nombre || 'Periodista' }],
      subject: OFERTA_REENVIO.subject,
      htmlContent: html,
      textContent: text,
      tags: [OFERTA_REENVIO.tag],
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.json().catch(() => null) };
}

// Quiénes ABRIERON la oferta (o le hicieron clic) — para NO reenviarles. Se lee de los eventos
// de Brevo del tag `oferta-email`. Best-effort: si la consulta falla devuelve null y el reenvío
// se saltea esa corrida. Preferimos no mandar nada antes que mandarle de nuevo a quien ya abrió.
async function abrieronOfertaSet() {
  const key = process.env.BREVO_API_KEY;
  const desde = new Date(Date.now() - 45 * DAY).toISOString().slice(0, 10);
  const hasta = new Date().toISOString().slice(0, 10);
  const abrieron = new Set();
  for (const evento of ['opened', 'clicks']) {
    let offset = 0;
    for (;;) {
      const u = `${BREVO}/smtp/statistics/events?limit=2500&offset=${offset}&startDate=${desde}&endDate=${hasta}&event=${evento}&tags=${OFERTA_REENVIO.tagOrigen}`;
      const r = await fetch(u, { headers: { 'api-key': key } });
      if (!r.ok) throw new Error(`Brevo events ${r.status}: ${(await r.text()).slice(0, 120)}`);
      const j = await r.json();
      const lote = j.events || [];
      for (const e of lote) abrieron.add(String(e.email || '').toLowerCase().trim());
      if (lote.length < 2500) break;
      offset += 2500;
    }
  }
  return abrieron;
}

// Regalos 3 y 4 por email. El tag propio deja medir cada uno por separado en Brevo,
// igual que ya se hace con el Regalo 5 y la oferta.
async function enviarRegaloEmail(nivel, email, nombre) {
  const cfg = REGALOS_EMAIL[nivel];
  const { html, text } = armarEmailRegalo(cfg);
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: cfg.from,
      to: [{ email, name: nombre || 'Periodista' }],
      subject: cfg.subject,
      htmlContent: html,
      textContent: text,
      tags: [cfg.tag],
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.json().catch(() => null) };
}

// Marcador genérico (MAIL3_AT / MAIL4_AT): deja registro de por qué canal salió el paso.
async function brevoSetMarcador(email, atributo) {
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes: { [atributo]: todayISO() } }),
  });
  if (!r.ok) throw new Error(`Brevo setMarcador ${atributo} ${r.status}: ${await r.text()}`);
}

async function brevoCrearAtributoTexto(nombre) {
  const r = await fetch(`${BREVO}/contacts/attributes/normal/${nombre}`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'text' }),
  });
  return { ok: r.ok, status: r.status, detalle: r.ok ? 'creado' : await r.text() };
}

// ¿Sale algo por WhatsApp? NO — decisión de Jose del 29/07: el embudo va por EMAIL, y punto.
// No es un desvío temporal mientras Meta tenga el número capado: es el canal elegido. Por eso
// la respuesta por defecto es "no" sin siquiera preguntarle a Meta, y no se vuelve solo a
// WhatsApp aunque lo habiliten.
//
// Para volver a WhatsApp hay que quererlo: WA_SEND_FORCE=1 en Vercel. Recién ahí se le
// pregunta a Meta si el número puede enviar (health_status.can_send_message), porque encender
// el canal contra un número capado es lo que nos costó dos semanas de embudo tapado: cada
// intento fallido consumía los ~45 s de la corrida y el Regalo 3 nunca llegaba a salir.
async function whatsappPuedeEnviar() {
  if (process.env.WA_SEND_FORCE !== '1') {
    return { puede: false, motivo: 'el embudo va por email (decisión 29/07). WA_SEND_FORCE=1 para volver a WhatsApp' };
  }
  const token = process.env.WHATSAPP_TOKEN;
  const pn = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !pn) return { puede: false, motivo: 'faltan WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID' };
  try {
    const r = await fetch(`${GRAPH}/${pn}?fields=health_status&access_token=${token}`);
    const j = await r.json();
    const estado = j && j.health_status && j.health_status.can_send_message;
    if (!estado) return { puede: true, motivo: 'Meta no devolvió health_status → se sigue enviando' };
    return { puede: estado === 'AVAILABLE', estado, motivo: `Meta dice can_send_message=${estado}` };
  } catch (e) {
    return { puede: true, motivo: `no se pudo consultar a Meta (${e && e.message}) → se sigue enviando` };
  }
}

// Marca en Brevo que a este lead ya se le mandó el Regalo 5 (para no repetir).
async function brevoSetMail5(email) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes: { MAIL5_AT: todayISO() } }),
  });
  if (!r.ok) throw new Error(`Brevo setMail5 ${r.status}: ${await r.text()}`);
}

// Marca en Brevo que a este lead ya se le mandó el seguimiento (para no repetir).
async function brevoSetSeg(email) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes: { SEG_AT: todayISO() } }),
  });
  if (!r.ok) throw new Error(`Brevo setSeg ${r.status}: ${await r.text()}`);
}

async function sendTemplate(payload, logsOut) {
  const token = process.env.WHATSAPP_TOKEN;
  const pn = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const r = await fetch(`${GRAPH}/${pn}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  const wamid = j && j.messages && j.messages[0] && j.messages[0].id;
  const tmpl = payload && payload.template && payload.template.name;
  // Logs best-effort (costos + hilo del inbox) EN SEGUNDO PLANO: no se esperan acá, para no
  // frenar el próximo envío (el cron tiene 60 s; cada await de log resta throughput). Las
  // promesas se juntan en logsOut y se esperan todas juntas al final de la corrida. Si no se
  // pasa logsOut (uso suelto), se esperan acá como antes.
  const logs = [logMensaje({ automatizacion: 'funnel-regalos', to: payload && payload.to, tipo: tmpl, categoria_meta: 'marketing', ok: r.ok, wamid })];
  if (r.ok) logs.push(logConversacion({ telefono: payload && payload.to, direccion: 'out', origen: 'funnel', texto: REGALO_TEXTO[tmpl] || `📨 Plantilla ${tmpl}`, tipo: 'plantilla', wamid, intent: 'regalo' }));
  if (logsOut) logsOut.push(...logs); else await Promise.allSettled(logs);
  return { ok: r.ok, status: r.status, body: j, wamid };
}

// Métricas del funnel: enviados por etapa (dato propio) + entregas/lecturas de Meta (cuando estén).
async function computeStats(contacts) {
  const st = { r3: 0, r4: 0, oferta: 0, sin_enviar: 0, con_tel: 0, mail5: 0, seg: 0 };
  for (const c of contacts) {
    const a = c.attributes || {};
    if (a.SMS || a.WHATSAPP) st.con_tel++;
    if (a.MAIL5_AT) st.mail5++;
    if (a.SEG_AT) st.seg++;
    const s = Number(a.WA_STAGE || 0);
    if (s >= 5) st.oferta++; else if (s === 4) st.r4++; else if (s === 3) st.r3++; else st.sin_enviar++;
  }
  let analytics;
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - 60 * 86400;
    const ids = encodeURIComponent('["27442098415417742","1633579005082323","3311508099029400"]');
    const mt = encodeURIComponent('["SENT","DELIVERED","READ","CLICKED"]');
    const u = `${GRAPH}/3355115811326692/template_analytics?start=${start}&end=${end}&granularity=DAILY&metric_types=${mt}&template_ids=${ids}&access_token=${process.env.WHATSAPP_TOKEN}`;
    const r = await fetch(u);
    const j = await r.json();
    analytics = j.error ? { disponible: false, motivo: j.error.error_user_title || j.error.message } : j;
  } catch (e) { analytics = { disponible: false, motivo: String(e && e.message || e) }; }
  return { total_contactos: contacts.length, enviados: { regalo3: st.r3, regalo4: st.r4, regalo5_email: st.mail5, oferta: st.oferta, seguimiento: st.seg, aun_sin_regalo: st.sin_enviar, con_telefono: st.con_tel }, entregas_lecturas: analytics };
}

// Diagnóstico INTERPRETADO del funnel: no solo números, sino un veredicto en criollo de si
// está sano o roto, y por qué. Va arriba de todo en el reporte y define el asunto del mail
// (para que un problema se vea sin abrirlo). `runInfo` = datos de la corrida; `stats` = estado
// parado por etapa. Es el MOLDE de "verificación interpretada" para replicar en cada flujo.
function diagnosticarFunnel(stats, runInfo) {
  const r = runInfo || {};
  const e = stats.enviados || {};
  const problemas = [];
  // 1) El mensaje que VENDE no está saliendo (el fallo silencioso que nos costó una semana).
  if ((r.due_oferta || 0) > 0 && (r.sent_oferta || 0) === 0) {
    problemas.push({ n: 'critico', t: `La OFERTA no está saliendo: ${r.due_oferta} leads listos y 0 enviadas en esta corrida. Es el mensaje que vende — revisar ya: plantilla en Meta, flag OFERTA_V2 o errores de envío.` });
  } else if ((e.oferta || 0) === 0 && ((e.regalo4 || 0) + (e.regalo3 || 0)) > 20) {
    // 2) Nadie llegó NUNCA a la oferta pese a haber gente en etapas previas (embudo no completa).
    problemas.push({ n: 'critico', t: `0 personas recibieron la oferta pese a ${(e.regalo4 || 0) + (e.regalo3 || 0)} en etapas previas. El embudo no está completando hasta la venta.` });
  }
  // 3) Muchos envíos fallan (plantilla rechazada / problema con Meta).
  if ((r.attempted || 0) >= 10 && (r.fallidos || 0) / r.attempted > 0.4) {
    problemas.push({ n: 'critico', t: `Fallan ${r.fallidos} de ${r.attempted} envíos (${Math.round((100 * r.fallidos) / r.attempted)}%). Probable plantilla rechazada o problema con Meta.` });
  }
  // 4) Backlog creciendo: entran leads más rápido de lo que se procesan.
  if ((r.remaining || 0) > 80) {
    problemas.push({ n: 'alerta', t: `Cola grande: quedan ${r.remaining} sin procesar tras la corrida. El funnel va más lento que la entrada de leads y puede demorar a los que esperan.` });
  }
  if (!problemas.length) {
    return { nivel: 'ok', titulo: '✅ Funnel sano', detalle: `La oferta está saliendo${r.sent_oferta ? ` (${r.sent_oferta} enviadas en la última corrida)` : ''} y los envíos no muestran fallos anómalos.` };
  }
  const critico = problemas.some((p) => p.n === 'critico');
  return {
    nivel: critico ? 'critico' : 'alerta',
    titulo: critico ? '🔴 PROBLEMA en el funnel — requiere tu atención' : '🟡 Aviso en el funnel',
    detalle: problemas.map((p) => `${p.n === 'critico' ? '🔴' : '🟡'} ${p.t}`).join('<br><br>'),
  };
}

// ── Continuidad diaria (cuadro "debía vs enviado vs en cola") ────────────────
// Nota fija de cómo se obtiene el "Debía" (transparencia que pidió Jose).
const NOTA_DEBIA = '<b>Cómo se obtiene el "Debía":</b> el <b>Regalo 3</b> son los leads nuevos que ese día cumplen 5 días (la entrada del embudo — depende de cuántos entran por Facebook, no se puede saber de antemano). El <b>Regalo 4</b>, el <b>5</b>, la <b>Oferta</b> y el <b>Seguimiento</b> están <b>determinados por los envíos de días previos</b>: nadie llega a un paso sin haber recibido el anterior, así que ese número es exacto. "En cola" = lo que quedó para la próxima corrida (o "apagado" si el paso está desactivado por flag).';

function filaEtapa(e) {
  const env = (e.enviado || 0) > 0 ? `<span style="color:#22c58a;font-weight:700;">${e.enviado}</span>` : '0';
  const cola = e.apagado
    ? '<span style="color:#8a8aa0;">apagado</span>'
    : ((e.cola || 0) > 0 ? `<span style="color:#e0a83a;font-weight:700;">${e.cola}</span>` : '0');
  return `<tr>
        <td style="padding:7px 10px;border-top:1px solid #23233a;color:#e8e8f0;">${e.label}</td>
        <td style="padding:7px 10px;border-top:1px solid #23233a;text-align:center;color:#e8e8f0;">${e.debido}</td>
        <td style="padding:7px 10px;border-top:1px solid #23233a;text-align:center;">${env}</td>
        <td style="padding:7px 10px;border-top:1px solid #23233a;text-align:center;">${cola}</td>
      </tr>`;
}

// Dibuja un cuadro de continuidad (título + tabla + nota/veredicto). Reutilizado por hoy y ayer.
function tablaContinuidad(titulo, etapas, nota) {
  if (!Array.isArray(etapas) || !etapas.length) return '';
  return `<div style="background:#0f0f1a;border-radius:12px;padding:16px 18px;margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:8px;">${titulo}</div>
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 10px;color:#8a8aa0;font-weight:700;">Etapa</td>
          <td style="padding:6px 10px;color:#8a8aa0;font-weight:700;text-align:center;">Debía</td>
          <td style="padding:6px 10px;color:#8a8aa0;font-weight:700;text-align:center;">Enviado</td>
          <td style="padding:6px 10px;color:#8a8aa0;font-weight:700;text-align:center;">En cola</td>
        </tr>
        ${etapas.map(filaEtapa).join('')}
      </table>
      ${nota ? `<div style="font-size:12px;color:#8a8aa0;line-height:1.65;margin-top:12px;">${nota}</div>` : ''}
    </div>`;
}

// Lee el snapshot de continuidad de una fecha (YYYY-MM-DD). Best-effort.
async function leerSnapshotDia(fecha) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await sbRest(`funnel_reporte_diario?fecha=eq.${fecha}&select=fecha,etapas,resumen&limit=1`, {});
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0]) || null;
  } catch { return null; }
}

// Guarda (upsert) el snapshot de continuidad de HOY → mañana es el "ayer" del reporte.
async function guardarSnapshotDiario(fecha, etapas, resumen) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await sbRest('funnel_reporte_diario?on_conflict=fecha', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ fecha, etapas, resumen: resumen || null, creado_en: new Date().toISOString() }),
    });
  } catch (e) { console.error('[wa-funnel] guardar snapshot:', e && e.message || e); }
}

// Manda el reporte diario por email vía Brevo (a Jose).
async function sendReport(stats, runInfo, snapAyer) {
  const key = process.env.BREVO_API_KEY;
  const a = stats.enviados;
  // Diagnóstico interpretado arriba de todo (verde/amarillo/rojo + por qué).
  const salud = diagnosticarFunnel(stats, runInfo);
  const colBg = salud.nivel === 'critico' ? '#3a0d18' : salud.nivel === 'alerta' ? '#3a2f0d' : '#0d2f22';
  const colBd = salud.nivel === 'critico' ? '#e0396f' : salud.nivel === 'alerta' ? '#e0a83a' : '#22c58a';
  const saludHtml = `<div style="background:${colBg};border-left:5px solid ${colBd};border-radius:10px;padding:16px 18px;margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:16px;font-weight:800;color:#ffffff;margin-bottom:6px;">${salud.titulo}</div>
      <div style="font-size:14px;line-height:1.65;color:#e8e8f0;">${salud.detalle}</div>
    </div>`;
  const av = stats.entregas_lecturas || {};
  const leidos = (av.disponible === false)
    ? '<p><i>Los datos de "abiertos/leídos" de Meta todavía no están habilitados (se activan a los pocos días de una cuenta nueva). En cuanto estén, aparecen acá.</i></p>'
    : '<p>Los datos de entregas/lecturas de Meta ya están disponibles en el panel.</p>';
  // Aperturas/clics del email Regalo 5 (Brevo, por tag).
  const o = await mail5OpenStats();
  const r5open = o.disponible
    ? `<li style="margin-left:18px;list-style:circle;">De ese Regalo 5: <b>${o.aperturas_unicas ?? 0}</b> lo abrieron, <b>${o.clics_unicos ?? 0}</b> hicieron clic en la guía</li>`
    : '';
  // Cuadro de HOY (qué debía salir vs qué salió) + cuadro de AYER (cómo cerró), con veredicto.
  const contHoy = tablaContinuidad('📆 Hoy: qué debía salir vs qué salió', (runInfo && runInfo.etapas) || [], NOTA_DEBIA);
  let contAyer = '';
  if (snapAyer && Array.isArray(snapAyer.etapas) && snapAyer.etapas.length) {
    const pend = snapAyer.etapas.filter((e) => !e.apagado && (e.cola || 0) > 0);
    const ver = pend.length === 0
      ? '✅ <b>Día completo:</b> ayer salió todo lo que debía.'
      : '⚠️ <b>Faltó:</b> ayer quedó en cola ' + pend.map((e) => `${e.label} (${e.cola})`).join(', ') + ' → se arrastró a hoy.';
    contAyer = tablaContinuidad('📅 Ayer: cómo cerró el día', snapAyer.etapas, ver);
  } else if (runInfo && runInfo.etapas) {
    contAyer = '<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8aa0;margin:-8px 0 18px;">📅 (El cuadro comparativo de <b>ayer</b> aparece a partir de mañana — desde hoy se guarda el cierre de cada día.)</p>';
  }
  const html = `${saludHtml}${contHoy}${contAyer}<h2>📊 Funnel WhatsApp — reporte diario</h2>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8a8aa0;margin:0 0 4px;"><b>Estado del embudo</b> — dónde está parado cada lead ahora (esto NO es lo que se envió hoy):</p>
    <ul>
      <li>En <b>Regalo 3</b> (ya lo recibieron, esperan el 4): <b>${a.regalo3}</b></li>
      <li>En <b>Regalo 4</b>: <b>${a.regalo4}</b></li>
      <li>Recibieron el <b>Regalo 5</b> (email agentes IA): <b>${a.regalo5_email}</b></li>
      ${r5open}
      <li>Recibieron la <b>Oferta</b>: <b>${a.oferta}</b></li>
      <li>Recibieron <b>Seguimiento</b> (reactivación de fríos): <b>${a.seguimiento || 0}</b></li>
      <li>Todavía sin su primer regalo: ${a.aun_sin_regalo} (esperan llegar al día 5)</li>
      <li>Leads con teléfono: ${a.con_telefono} de ${stats.total_contactos}</li>
    </ul>${leidos}`;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Reporte Funnel', email: 'jose@sistemadeingresosdiariosia.com' },
      to: [{ email: 'joseanselmi27@gmail.com' }],
      subject: salud.nivel === 'critico' ? '🔴 Funnel WhatsApp — PROBLEMA (requiere tu atención)' : salud.nivel === 'alerta' ? '🟡 Funnel WhatsApp — aviso' : '✅ Funnel WhatsApp — reporte diario',
      htmlContent: html,
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Dada la antigüedad y el stage ya enviado, decide qué mandar (uno solo, el próximo debido).
const MIN_GAP_DAYS = 2; // espera mínima entre un regalo y el siguiente

function nextDue(daysOld, stageSent, daysSinceLast) {
  for (const s of STAGES) {
    if (stageSent < s.stage && daysOld >= s.minDays) {
      // entre etapas (ya mandamos al menos una), respetar la cadencia desde el último envío
      if (stageSent > 0 && daysSinceLast < MIN_GAP_DAYS) return null;
      return s;
    }
  }
  return null;
}

// Prioridad de negocio para ordenar la cola de envíos. CLAVE: el cron tiene ~60 s y procesa
// la cola EN ORDEN hasta que se acaba el tiempo (procesa ~40 leads y Vercel lo corta). Si la
// OFERTA (la que vende) quedara al fondo, detrás del backlog de Regalos 3/4, la función se
// muere antes de llegar a ella y NUNCA se envía. Por eso: oferta primero, seguimiento último.
// Menor número = se manda antes.
function prioridad(p) {
  if (p.send === 'mailoferta') return 0;      // la que VENDE
  if (p.send === 'ofertareenvio') return 1;   // la segunda oportunidad de la que vende
  if (p.send === 'regalo3' || p.send === 'regalo4') return 2; // la ENTRADA: sin esto no hay a quién venderle
  if (p.channel === 'wa') {                   // sólo existen con WA_SEND_FORCE=1
    if (p.send === 5) return 3;
    if (p.send === 4) return 4;
    if (p.send === 3) return 5;
  }
  if (p.channel === 'email') return 6;        // Regalo 5: bonus para quien ya está adentro, puede esperar
  if (p.channel === 'seguimiento') return 7;  // reactivación de fríos, al final
  return 8;
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'cron';
  // Nº de eslabón del auto-encadenado (ver más abajo). 0 = corrida inicial (el cron); 1,2… = las
  // corridas que la función dispara sobre sí misma para vaciar la cola el mismo día.
  const chain = parseInt(searchParams.get('chain') || '0', 10) || 0;

  // --- Auth ---
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret // si no hay secret configurado, no exige (no recomendado)
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) { res.status(401).json({ error: 'unauthorized' }); return; }

  try {
    // Recordatorio de escalaciones sin responder: en la corrida del cron (siempre, aunque
    // el funnel esté apagado) y en modo manual ?mode=recordatorios para probarlo aislado.
    if (mode === 'cron') {
      try { await recordarEscalacionesPendientes(); } catch (e) { console.error('[wa-funnel] recordatorios cron:', e && e.message || e); }
    }
    if (mode === 'recordatorios') {
      const rec = await recordarEscalacionesPendientes();
      res.status(200).json({ mode, ...rec });
      return;
    }

    if (mode === 'setup') {
      const wa = await brevoCreateAttribute();
      const m5 = await brevoCreateMail5Attribute();
      const seg = await brevoCreateSegAttribute();
      const mof = await brevoCreateMailOfertaAttribute();
      const m3 = await brevoCrearAtributoTexto('MAIL3_AT');
      const m4 = await brevoCrearAtributoTexto('MAIL4_AT');
      const m2 = await brevoCrearAtributoTexto(OFERTA_REENVIO.marcador);
      res.status(200).json({ mode, WA_STAGE_attribute: wa, MAIL5_AT_attribute: m5, SEG_AT_attribute: seg, OFERTA_MAIL_AT_attribute: mof, MAIL3_AT_attribute: m3, MAIL4_AT_attribute: m4, OFERTA_MAIL2_AT_attribute: m2 });
      return;
    }

    // Previsualizar el reenvío de la oferta: ?mode=reenviotest&to=...
    if (mode === 'reenviotest') {
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await enviarReenvioOferta(to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, to, asunto: OFERTA_REENVIO.subject, sent });
      return;
    }

    // A cuántos les tocaría el reenvío y cuántos abrieron la oferta: ?mode=noabrieron
    if (mode === 'noabrieron') {
      const abrieron = await abrieronOfertaSet();
      const todos = await brevoGetContacts();
      const conOferta = todos.filter((c) => (c.attributes || {}).OFERTA_MAIL_AT);
      const sinAbrir = conOferta.filter((c) => !abrieron.has(String(c.email || '').toLowerCase().trim()));
      res.status(200).json({
        mode,
        recibieron_la_oferta: conOferta.length,
        abrieron: conOferta.length - sinAbrir.length,
        no_abrieron: sinAbrir.length,
        ya_reenviado: conOferta.filter((c) => (c.attributes || {})[OFERTA_REENVIO.marcador]).length,
      });
      return;
    }

    // Previsualizar los Regalos 3 y 4 por email sin tocar a nadie: ?mode=regalotest&nivel=3&to=...
    if (mode === 'regalotest') {
      const nivel = Number(searchParams.get('nivel') || '3');
      if (!REGALOS_EMAIL[nivel]) { res.status(400).json({ error: 'nivel debe ser 3 o 4' }); return; }
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await enviarRegaloEmail(nivel, to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, nivel, to, sent });
      return;
    }

    // Qué dice Meta del número, sin más: ?mode=wasalud
    if (mode === 'wasalud') {
      res.status(200).json({ mode, whatsapp: await whatsappPuedeEnviar() });
      return;
    }

    if (mode === 'mail5test') {
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await sendMail5(to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, to, sent });
      return;
    }

    if (mode === 'ofertatest') {
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await sendMailOferta(to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, to, sent });
      return;
    }

    const contacts = await brevoGetContacts();

    if (mode === 'inspect') {
      const sample = contacts.slice(0, 5).map((c) => ({
        email: c.email, createdAt: c.createdAt, attributes: c.attributes,
      }));
      res.status(200).json({ mode, total: contacts.length, sample });
      return;
    }

    if (mode === 'stats' || mode === 'report') {
      const stats = await computeStats(contacts);
      if (mode === 'report') {
        const email = await sendReport(stats);
        res.status(200).json({ mode: 'report', email_enviado: email.ok, stats });
        return;
      }
      res.status(200).json({ mode: 'stats', ...stats });
      return;
    }

    const now = Date.now();
    const enabled = process.env.WA_FUNNEL_ENABLED === '1';
    const live = (mode === 'live' || mode === 'cron') && enabled;
    const mail5Enabled = process.env.MAIL5_ENABLED === '1';
    const mailOfertaEnabled = process.env.MAILOFERTA_ENABLED === '1';

    const regalosEmailEnabled = process.env.MAILREGALOS_ENABLED === '1';
    const reenvioEnabled = process.env.MAILOFERTA2_ENABLED === '1';

    // Quiénes ya abrieron la oferta: no se les reenvía. Si Brevo no contesta, `null` → esta
    // corrida no encola ningún reenvío (mejor perder un día que insistirle a quien ya la vio).
    let abrieronOferta = null;
    if (reenvioEnabled) {
      try { abrieronOferta = await abrieronOfertaSet(); }
      catch (e) { console.error('[wa-funnel] aperturas de la oferta:', e && e.message || e); }
    }

    // Se le pregunta a Meta UNA vez por corrida si el número puede enviar. De esto depende
    // si los Regalos 3 y 4 salen por WhatsApp o por email, así que se resuelve antes del plan.
    const waEstado = await whatsappPuedeEnviar();
    const waActivo = waEstado.puede;

    // Los que ya compraron no reciben más regalos ni la oferta.
    const compradores = await ventasEmailsSet();
    const seguimientoEnabled = process.env.SEGUIMIENTO_ENABLED === '1';
    // Para el seguimiento: quién ya nos escribió (no se le manda si ya respondió).
    const respondieron = await respondieronSet();

    const plan = [];
    for (const c of contacts) {
      const emailLc = String(c.email || '').toLowerCase().trim();
      if (emailLc && compradores.has(emailLc)) continue; // ya compró → fuera del funnel
      const attrs = c.attributes || {};
      const stageSent = Number(attrs.WA_STAGE || 0);
      const daysOld = Math.floor((now - new Date(c.createdAt).getTime()) / DAY);
      const lastAt = attrs.WA_SENT_AT ? new Date(attrs.WA_SENT_AT).getTime() : 0;
      const daysSinceLast = lastAt ? Math.floor((now - lastAt) / DAY) : 999;

      // Regalo 5 (email): a quien ya pasó por el Regalo 4 y todavía no lo recibió.
      if (!attrs.MAIL5_AT && stageSent >= MAIL5.afterStage && daysOld >= MAIL5.minDays) {
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, send: 'mail5' });
      }

      // Oferta por EMAIL (plan B de WhatsApp): a quien ya llegó a la etapa de oferta y todavía
      // no la recibió por mail. No mira la entrega de WhatsApp a propósito — el 100% falló, y si
      // mañana WhatsApp revive el atributo propio evita que le llegue dos veces.
      if (!attrs.OFERTA_MAIL_AT && stageSent >= MAILOFERTA.afterStage) {
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, send: 'mailoferta' });
      }

      // Reenvío de la oferta: pasaron 48 h desde que se la mandamos, no la abrió, y todavía no
      // se le reenvió. (Los compradores ya quedaron afuera arriba.)
      if (abrieronOferta && attrs.OFERTA_MAIL_AT && !attrs[OFERTA_REENVIO.marcador]) {
        const horas = (now - new Date(attrs.OFERTA_MAIL_AT).getTime()) / 3600000;
        if (horas >= OFERTA_REENVIO.minHoras && !abrieronOferta.has(emailLc)) {
          plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, send: 'ofertareenvio' });
        }
      }

      // Paso siguiente del embudo (Regalos 3/4 y la oferta): a lo sumo uno por corrida.
      // Si el número está capado, los Regalos 3 y 4 salen por EMAIL: es el mismo paso por
      // otro canal, no un mensaje extra. La oferta no entra acá — ya tiene su cola por email.
      const due = nextDue(daysOld, stageSent, daysSinceLast);
      if (due && waActivo) {
        const phoneRaw = pickPhone(attrs);
        const to = normalizePhone(phoneRaw);
        plan.push({ channel: 'wa', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: due.stage, tmpl: due.tmpl, phoneRaw, to });
      } else if (due && REGALOS_EMAIL[due.stage] && !attrs[REGALOS_EMAIL[due.stage].marcador]) {
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: `regalo${due.stage}` });
      } else if (due && due.stage === 5 && !attrs.OFERTA_MAIL_AT) {
        // La OFERTA como paso natural del embudo. Sin esto, con WhatsApp apagado nadie llegaría
        // nunca a la etapa 5 (la avanzaba el envío de WhatsApp) y el embudo terminaría en el
        // Regalo 5: entregaría las cuatro guías y no vendería nada. `avanzarA` hace que el envío
        // por mail mueva la etapa, igual que hacen los Regalos 3 y 4.
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: 'mailoferta', avanzarA: 5 });
      }

      // Seguimiento (reactivación): recibió la oferta (stage 5), pasaron N días desde el último
      // envío, no compró (ya filtrado arriba) ni respondió por WhatsApp, y no se le mandó aún.
      // (también es WhatsApp: si el número está capado, no tiene sentido encolarlo)
      if (waActivo && !attrs.SEG_AT && stageSent >= 5 && daysSinceLast >= SEGUIMIENTO.minDiasDesdeOferta) {
        const phoneRaw = pickPhone(attrs);
        const to = normalizePhone(phoneRaw);
        if (to && !respondieron.has(to)) {
          plan.push({ channel: 'seguimiento', email: c.email, nombre: pickName(attrs), daysOld, to, phoneRaw });
        }
      }
    }

    // Ordenar por prioridad de negocio (oferta primero). Sin esto, con un backlog grande el
    // cron gasta sus 60 s repartiendo Regalos 3/4 y se apaga antes de llegar a la oferta.
    plan.sort((a, b) => prioridad(a) - prioridad(b));

    if (!live) {
      // dry: mostrar el plan sin ejecutar
      // Desglose del plan COMPLETO: `plan` sale recortado a 100 para no devolver un JSON enorme,
      // y sin esto el ensayo parecía ser todo Regalos 4 cuando en realidad la cola es mixta.
      const desglose = {};
      for (const p of plan) {
        const k = p.channel === 'wa' ? `wa_stage_${p.send}` : String(p.send || p.channel);
        desglose[k] = (desglose[k] || 0) + 1;
      }
      res.status(200).json({ mode, live: false, enabled, whatsapp: waEstado, regalos_email: regalosEmailEnabled ? 'encendidos' : 'APAGADOS (MAILREGALOS_ENABLED!=1)', would_send: plan.length, desglose, plan: plan.slice(0, 100) });
      return;
    }

    // --- live --- Presupuesto de TIEMPO en vez de un tope fijo. Antes cortábamos en 40 leads
    // por corrida: con un backlog grande eso dejaba a los leads nuevos afuera (nunca entraban al
    // embudo) y la cola sólo crecía. Ahora procesamos en orden de prioridad hasta agotar ~45 s
    // (la función corta a los 60 s → queda margen para el reporte y los logs). Así una sola
    // corrida despacha TODO lo que entre en el tiempo, sin timeout. HARD_MAX es un tope de
    // seguridad anti-runaway por si los envíos fueran muy rápidos.
    const BUDGET_MS = 45000;
    const HARD_MAX = 220;
    const EMAIL_CAP = 60; // Regalo 5 (email): instantáneo y sin límite de rate → tope propio y generoso
    const OFERTA_CAP = 100; // Oferta por email: cola propia, en rampa (~3 días para las ~289)
    const REGALOS_CAP = 120; // Regalos 3 y 4 por email: la entrada del embudo, también en rampa
    const REENVIO_CAP = 80;  // Reenvío de la oferta a los que no la abrieron
    // Tope manual para la PRIMERA corrida de algo nuevo (?max=2): deja verificar el camino
    // completo —envío, avance de etapa y marcador— con dos personas reales en vez de
    // descubrir un problema recién cuando ya salieron cientos. Sin el parámetro no limita nada.
    const MAX_MANUAL = parseInt(searchParams.get('max') || '0', 10) || 0;
    const t0 = Date.now();
    const results = [];
    const pendingLogs = []; // logs best-effort en segundo plano; se esperan todos al final
    let attempted = 0;

    // CLAVE del arreglo: el email (Regalo 5) NO comparte presupuesto con WhatsApp. Ese era el bug
    // que ahogaba la entrada del embudo (cientos de emails "debidos" copaban el tope y los leads
    // nuevos nunca recibían el Regalo 3). Ahora los emails van PRIMERO con su propio tope (son
    // instantáneos: ~60 entran en pocos segundos) y después WhatsApp usa el resto del tiempo, en
    // orden de prioridad (oferta → Regalo 4 → Regalo 3). Así ambos canales avanzan cada corrida.
    // La OFERTA por email lleva cola y tope propios: si compartiera los 60 de EMAIL_CAP con el
    // Regalo 5, un backlog de regalos la dejaría afuera justo al mensaje que vende. Con 100/día
    // las ~289 pendientes salen en 3 corridas — y de paso el envío entra en rampa, que es lo sano
    // para la reputación del remitente en vez de un blast de 289 de una.
    const emailQueue = plan.filter((p) => p.channel === 'email' && p.send === 'mail5').slice(0, EMAIL_CAP);
    const ofertaQueue = plan.filter((p) => p.channel === 'email' && p.send === 'mailoferta').slice(0, OFERTA_CAP);
    // Regalos 3/4 por email: van ANTES del Regalo 5 porque son la entrada del embudo — un lead
    // parado en la etapa 0 no tiene cómo llegar a nada de lo que viene después. Tope propio y
    // generoso (el backlog eran ~370 el 28/07) pero en rampa, para no quemar la reputación.
    const regalosQueue = plan.filter((p) => p.channel === 'email' && String(p.send).startsWith('regalo')).slice(0, REGALOS_CAP);
    const reenvioQueue = plan.filter((p) => p.send === 'ofertareenvio').slice(0, REENVIO_CAP);
    const waQueue = plan.filter((p) => p.channel !== 'email'); // wa + seguimiento (ya ordenados por prioridad)
    const queue = [...ofertaQueue, ...reenvioQueue, ...regalosQueue, ...emailQueue, ...waQueue];
    for (const p of queue) {
      if (attempted >= HARD_MAX || Date.now() - t0 > BUDGET_MS) break;
      if (MAX_MANUAL && attempted >= MAX_MANUAL) break;
      attempted++;
      if (p.channel === 'email') {
        // Reenvío de la oferta: no toca la etapa (el lead ya terminó el recorrido), sólo su marcador.
        if (p.send === 'ofertareenvio') {
          if (!reenvioEnabled) { results.push({ email: p.email, skipped: 'MAILOFERTA2_ENABLED!=1 (reenvío apagado)' }); continue; }
          const sent = await enviarReenvioOferta(p.email, p.nombre);
          if (sent.ok) {
            try { await brevoSetMarcador(p.email, OFERTA_REENVIO.marcador); } catch (e) { results.push({ email: p.email, sent: 'ofertareenvio', warn: 'enviado pero falló marcarlo: ' + e.message }); continue; }
            results.push({ email: p.email, sent: 'ofertareenvio' });
          } else {
            results.push({ email: p.email, send: 'ofertareenvio', error: sent.status });
          }
          console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'ofertareenvio', ok: sent.ok }));
          continue;
        }
        // Regalos 3 y 4 por email: además de marcarlos, AVANZAN la etapa del embudo. Sin eso
        // el lead se quedaría en la misma etapa para siempre y nunca llegaría a la oferta.
        if (String(p.send).startsWith('regalo')) {
          if (!regalosEmailEnabled) { results.push({ email: p.email, skipped: 'MAILREGALOS_ENABLED!=1 (regalos 3/4 por email apagados)' }); continue; }
          const nivel = Number(String(p.send).replace('regalo', ''));
          const cfg = REGALOS_EMAIL[nivel];
          const sent = await enviarRegaloEmail(nivel, p.email, p.nombre);
          if (sent.ok) {
            try {
              await brevoSetStage(p.email, cfg.stage);       // avanza el embudo
              await brevoSetMarcador(p.email, cfg.marcador); // deja registro de que salió por email
              results.push({ email: p.email, sent: p.send, stage: cfg.stage });
            } catch (e) {
              results.push({ email: p.email, sent: p.send, warn: 'enviado pero falló marcarlo en Brevo: ' + e.message });
            }
          } else {
            results.push({ email: p.email, send: p.send, error: sent.status });
          }
          console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: p.send, ok: sent.ok }));
          continue;
        }
        if (p.send === 'mailoferta') {
          if (!mailOfertaEnabled) { results.push({ email: p.email, skipped: 'MAILOFERTA_ENABLED!=1 (oferta por email apagada)' }); continue; }
          const sent = await sendMailOferta(p.email, p.nombre);
          if (sent.ok) {
            try {
              // Si la oferta salió como paso del embudo (no como recuperación de los que ya
              // estaban en etapa 5), mover también la etapa: el lead terminó el recorrido.
              if (p.avanzarA) await brevoSetStage(p.email, p.avanzarA);
              await brevoSetMailOferta(p.email);
            } catch (e) { results.push({ email: p.email, sent: 'mailoferta', warn: 'enviado pero falló marcarlo en Brevo: ' + e.message }); continue; }
            results.push({ email: p.email, sent: 'mailoferta', stage: p.avanzarA || null });
          } else {
            results.push({ email: p.email, send: 'mailoferta', error: sent.status });
          }
          console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'mailoferta', ok: sent.ok }));
          continue;
        }
        if (!mail5Enabled) { results.push({ email: p.email, skipped: 'MAIL5_ENABLED!=1 (regalo 5 apagado)' }); continue; }
        const sent = await sendMail5(p.email, p.nombre);
        if (sent.ok) {
          try { await brevoSetMail5(p.email); } catch (e) { results.push({ email: p.email, sent: 'mail5', warn: 'enviado pero falló setMail5: ' + e.message }); continue; }
          results.push({ email: p.email, sent: 'mail5' });
        } else {
          results.push({ email: p.email, send: 'mail5', error: sent.status });
        }
        console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'mail5', ok: sent.ok }));
        continue;
      }
      if (p.channel === 'seguimiento') {
        if (!seguimientoEnabled) { results.push({ email: p.email, skipped: 'SEGUIMIENTO_ENABLED!=1 (seguimiento apagado)' }); continue; }
        if (!p.to || p.to.length < 8) { results.push({ email: p.email, skipped: 'sin telefono valido', phoneRaw: p.phoneRaw }); continue; }
        const sent = await sendTemplate(buildSeguimientoPayload(p.to, p.nombre), pendingLogs);
        if (sent.ok) {
          try { await brevoSetSeg(p.email); } catch (e) { results.push({ email: p.email, sent: 'seguimiento', warn: 'enviado pero fallo setSeg: ' + e.message }); continue; }
          results.push({ email: p.email, sent: 'seguimiento' });
        } else {
          results.push({ email: p.email, send: 'seguimiento', error: sent.body?.error?.message || sent.status });
        }
        console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'seguimiento', ok: sent.ok }));
        continue;
      }
      if (!p.to || p.to.length < 8) { results.push({ email: p.email, skipped: 'sin telefono valido', phoneRaw: p.phoneRaw }); continue; }
      const payload = buildTemplatePayload(p.send, p.to, p.nombre);
      const sent = await sendTemplate(payload, pendingLogs);
      if (sent.ok) {
        try { await brevoSetStage(p.email, p.send); } catch (e) { /* log abajo */ results.push({ email: p.email, sent: p.send, warn: 'enviado pero fallo setStage: ' + e.message }); continue; }
        results.push({ email: p.email, sent: p.send, wamid: sent.body?.messages?.[0]?.id || null });
      } else {
        results.push({ email: p.email, send: p.send, error: sent.body?.error?.message || sent.status });
      }
      console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: p.send, ok: sent.ok }));
    }
    // Esperar los logs best-effort que quedaron en vuelo (costos + hilo del inbox), para no
    // perderlos aunque no se hayan awaiteado en cada envío.
    await Promise.allSettled(pendingLogs);
    // En la corrida automática del cron, mandar además el reporte diario por email.
    let report = null;
    // Reporte individual del funnel: APAGADO por default (lo cubre el Panel de Salud unificado).
    // Se puede reactivar con REPORTE_FUNNEL_INDIVIDUAL=1 (trae el diagnóstico con datos de la corrida).
    if (mode === 'cron' && process.env.REPORTE_FUNNEL_INDIVIDUAL === '1') {
      // Datos de ESTA corrida para el diagnóstico interpretado del reporte.
      const planWA = (s) => plan.filter((p) => p.channel === 'wa' && p.send === s).length;
      const sentWA = (s) => results.filter((x) => x.sent === s).length;
      const etapaRow = (label, fuente, debido, enviado, apagado) => ({ label, fuente, debido, enviado, cola: Math.max(0, debido - enviado), apagado: !!apagado });
      const runInfo = {
        due_oferta: planWA(5),
        sent_oferta: sentWA(5),
        attempted,
        fallidos: results.filter((x) => x.error !== undefined).length,
        enviados_ok: results.filter((x) => x.sent !== undefined).length,
        remaining: plan.length - attempted,
        // Continuidad de HOY por etapa: qué DEBÍA salir (el plan, antes del cap) vs qué SALIÓ.
        // "debido" limpio según su fuente: R3 = leads nuevos que hoy cumplen día 5 (entrada del
        // embudo → depende del ingreso por Facebook, no se sabe de antemano). R4/R5/Oferta/
        // Seguimiento = determinado por envíos previos (no se llega a un paso sin el anterior),
        // así que ese número es exacto y trazable.
        etapas: [
          etapaRow('🎁 Regalo 3 (día 5 · entrada)', 'nuevos', planWA(3), sentWA(3), false),
          etapaRow('🎁 Regalo 4 (día 7)', 'previos', planWA(4), sentWA(4), false),
          etapaRow('📧 Regalo 5 (email · día 8)', 'previos', plan.filter((p) => p.channel === 'email').length, results.filter((x) => x.sent === 'mail5').length, !mail5Enabled),
          etapaRow('💰 Oferta (día 9)', 'previos', planWA(5), sentWA(5), false),
          etapaRow('🔔 Seguimiento (reactivación)', 'previos', plan.filter((p) => p.channel === 'seguimiento').length, results.filter((x) => x.sent === 'seguimiento').length, !seguimientoEnabled),
        ],
      };
      const hoyISO = new Date().toISOString().slice(0, 10);
      const ayerISO = new Date(Date.now() - DAY).toISOString().slice(0, 10);
      const snapAyer = await leerSnapshotDia(ayerISO);
      try { report = await sendReport(await computeStats(await brevoGetContacts()), runInfo, snapAyer); } catch (e) { report = { ok: false, error: String(e && e.message || e) }; }
      // Guardar el cierre de HOY → mañana es el "ayer" del reporte (continuidad día a día).
      await guardarSnapshotDiario(hoyISO, runInfo.etapas, { attempted: runInfo.attempted, enviados_ok: runInfo.enviados_ok, fallidos: runInfo.fallidos, remaining: runInfo.remaining });
    }

    // --- AUTO-ENCADENADO (gratis, plan Hobby) ---
    // Vercel Hobby dispara el cron 1×/día, pero el volumen real (~23 leads/día → ~67 WhatsApp/día)
    // necesita ~3 corridas. Solución: al terminar, si quedó cola, la función se re-dispara a sí
    // misma (una NUEVA invocación independiente en Vercel — la hija sigue corriendo aunque cortemos
    // la espera). Se repite hasta MAX_CHAINS veces o hasta vaciar la cola (se frena solo). Tope de
    // seguridad: 3 corridas ≈ ~100-110 WhatsApp/día → no arriesga el número en Meta. En régimen
    // normal, cuando la cola se vacía antes, se detiene solo (no gasta corridas de más).
    const MAX_CHAINS = 2; // corridas iniciales (chain 0) + 2 encadenadas = 3 en total
    const remaining = plan.length - attempted;
    if (live && remaining > 0 && chain < MAX_CHAINS) {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'sistemadeingresosdiariosia.com';
      // El `max` se arrastra a la hija. Sin esto, una corrida de prueba con tope disparaba una
      // hija SIN tope y salía la cola entera: pasó el 28/07 al estrenar los Regalos 3/4 por email.
      const selfUrl = `https://${host}/api/wa-funnel?mode=live&chain=${chain + 1}${MAX_MANUAL ? `&max=${MAX_MANUAL}` : ''}&key=${encodeURIComponent(secret)}`;
      try {
        // Disparamos la próxima corrida y NO esperamos a que termine: abortamos la espera a los 3 s
        // (la hija ya arrancó sola en Vercel). Best-effort: si falla, no rompe la corrida actual.
        await fetch(selfUrl, { signal: AbortSignal.timeout(3000) });
      } catch (_) { /* esperado: abort tras disparar, o red → best-effort */ }
    }

    res.status(200).json({ mode, chain, live: true, due_total: plan.length, attempted, remaining, encadenada: live && remaining > 0 && chain < MAX_CHAINS, report: report ? report.ok : null, results });
  } catch (e) {
    console.error('wa-funnel error', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
