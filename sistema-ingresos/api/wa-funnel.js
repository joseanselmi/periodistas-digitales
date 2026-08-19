// Disparador del embudo de EMAIL (Regalos 3, 4, 5 y Oferta) para la campaña
// "Guía Claude Periodistas". Corre 1 vez por día por Vercel Cron (ver vercel.json).
//
// ⚠️ EL ARCHIVO SE SIGUE LLAMANDO wa-funnel.js POR HISTORIA, NO PORQUE MANDE WHATSAPP.
// Nació como embudo de WhatsApp; hoy no manda un solo mensaje por ese canal. Renombrarlo
// obligaría a cambiar la ruta del cron, el endpoint que consultan los paneles y los scripts
// de ads-agent — no vale el riesgo por un nombre. Lo mismo con los atributos de Brevo que
// arrastran el prefijo WA_ (WA_SENT_AT, WA_STAGE): son datos ya escritos en 900 contactos.
//
// POR QUÉ ESTO Y NO UNA AUTOMATIZACIÓN DE BREVO: el embudo no manda "el mail N el día N".
// Busca la primera pieza que le FALTA a cada lead, lo cruza contra lo que realmente salió,
// saltea a los que ya compraron (eso vive en Supabase, no en Brevo) y retiene la oferta para
// quien nunca abrió nada. Nada de eso entra en una automatización lineal — y el modelo lineal
// ya lo tuvimos: es el que dejó 400 leads clavados y el Regalo 4 sin salir en todo julio.
//
// FLUJO POR LEAD (día 0 = entró a la lista Brevo #5, lo hace el escenario Make 9474482 webhook instantáneo; antes 9433023):
//   día 0  Regalo 1 (email)      → ya andando (Make)
//   día 2  Regalo 2 (email)      → ya andando (automatización Brevo)
//   día 5  Regalo 3 (EMAIL)      → ESTA función  (guía del periódico digital)
//   día 7  Regalo 4 (EMAIL)      → ESTA función  (guía de los 5 pilares)
//   día 8  Regalo 5 (EMAIL)      → ESTA función  (guía "agentes de IA" — último regalo antes de la oferta)
//   día 9  Oferta   (EMAIL)      → ESTA función  (lleva a la landing; es la que vende)
//
// TODO VA POR EMAIL, y ya no hay otra rama (09/08/2026, decisión de Jose: "sacá todo lo de
// WhatsApp, no me anda"). El canal se había elegido el 29/07 pero las plantillas de WhatsApp
// seguían en el código detrás de WA_SEND_FORCE=1, junto con el seguimiento de leads fríos.
// Se fueron enteras. El motivo no es de código: el número está capado en Meta —la verificación
// del negocio no pasó (error 141010) y el nombre quedó DECLINED— y eso no se arregla desde acá.
// Recibir mensajes y contestarlos desde Telegram NO se tocó: eso vive en api/wa-inbox.js y
// api/tg-webhook.js y sigue funcionando igual.
//
// QUIÉN RECIBIÓ QUÉ: mandan los MARCADORES DE EMAIL (MAIL3_AT, MAIL4_AT, MAIL5_AT,
// OFERTA_MAIL_AT). Cambió el 01/08 y es el corazón de esta función. Antes decidía WA_STAGE,
// que lo avanzaba el ENVÍO por WhatsApp y no la entrega: desde que Meta capó el número
// (13/07) 400 leads figuraban "en la etapa 5, embudo terminado" sin haber recibido nunca los
// Regalos 3 y 4 — y como el cálculo del próximo paso sólo miraba hacia adelante, no había
// forma de completárselos. El Regalo 4 no le llegó a NADIE en todo julio.
// Ahora cada corrida busca la primera pieza que le FALTA a cada lead (ver PIEZAS más abajo),
// la manda y la marca. Lo que no tiene marcador, no llegó.
//
// UNO POR PERSONA POR DÍA: el tope lo pone WA_SENT_AT (el "último toque"). Alguien al que le
// faltan las cuatro piezas las recibe en cuatro días, en orden, no todas juntas.
//
// MODOS (query ?mode=):
//   inspect  — devuelve una muestra de contactos con sus atributos crudos (para ver
//              cómo se llama el campo del teléfono/nombre). No manda nada.
//   dry      — calcula a quién le tocaría hoy y qué plantilla, SIN mandar ni tocar Brevo.
//   setup    — crea los atributos WA_STAGE y MAIL5_AT en Brevo (correr una sola vez).
//   mail5test— manda el email del Regalo 5 a ?to=<email> (default Jose) para previsualizarlo. No toca Brevo.
//   regalotest— manda el Regalo 3 o 4 por email: ?nivel=3|4&to=<email>. No toca Brevo.
//   reenganchetest— manda el mail de re-enganche a ?to=<email>. No toca Brevo.
//   puerta   — qué separa la puerta de enganche (a cuántos se les está mandando la oferta sin
//              que hayan abierto nunca nada). No manda nada. Correrlo ANTES de encender el flag.
//   live     — manda de verdad. Requiere ADEMÁS WA_FUNNEL_ENABLED=1.
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
// OFERTA POR EMAIL — flags:
//   - Se envía sólo si WA_FUNNEL_ENABLED=1 Y ADEMÁS MAILOFERTA_ENABLED=1 (default OFF).
//   - Se marca con OFERTA_MAIL_AT (uno por lead).
//   - Probar primero con mode=ofertatest&to=... (no toca Brevo), y correr mode=setup una vez.
//
// REGALOS 3 y 4 POR EMAIL — flags:
//   - Se envían sólo si WA_FUNNEL_ENABLED=1 Y ADEMÁS MAILREGALOS_ENABLED=1 (default OFF).
//   - Una pieza apagada por flag se saltea (no bloquea a las de atrás: sin eso, el Regalo 4
//     apagado dejaría a todos sin la oferta).
//   - Probar primero con mode=regalotest&nivel=3&to=... y correr mode=setup una vez.
//
// PUERTA DE ENGANCHE — la oferta no sale a quien nunca abrió nada (07/08/2026, tarjeta #123):
//   - Medido: de los 517 que recibieron la oferta, 363 (70%) nunca habían abierto un mail. Esa
//     cohorte la abre al 3,6%; la que venía abriendo 3+, al 61,5%. El clic-sobre-apertura es
//     15-23% en las tres, así que el copy no era el problema: el destinatario sí.
//   - La oferta espera (sin marcador) hasta que la persona dé señal de vida. En su lugar sale
//     UNA vez el mail de re-enganche, si REENGANCHE_ENABLED=1.
//   - Con REENGANCHE_ENABLED=0 la puerta igual retiene la oferta, pero no manda nada en su lugar.
//   - El re-enganche además NO sale antes de REENGANCHE.desde y tiene tope propio por día
//     (REENGANCHE.capDia): son ~575 personas y no hay apuro en que salgan el mismo día.
//   - La puerta nace ENCENDIDA. PUERTA_ENGANCHE=0 la apaga sin redeployar (botón de vuelta).
//   - Ver el efecto sin mandar nada: mode=puerta. Correr una vez mode=setup (crea REENGANCHE_AT).
//
// VOLUMEN: PIEZAS_CAP_DIA (default 500) es el tope de mails del embudo POR DÍA, contado sobre
// los contactos ya tocados hoy — no por corrida. La función se re-dispara a sí misma hasta 12
// veces (Vercel Hobby sólo permite un cron diario) y se frena sola cuando agota el cupo.
//
// LAS TRES DEFENSAS CONTRA MANDAR DE MÁS (08/08/2026, tarjeta #123). El 07/08 salieron 1.802
// mails a 649 personas —hasta 3 copias del mismo— porque tres cadenas corrían a la vez. Ninguna
// de las tres alcanza sola:
//   1. CANDADO (_lib/candado.js) — una sola cadena enviando a la vez. La corrida que llega
//      segunda no manda nada y lo dice. Es lo que faltaba: el resto ya existía y no alcanzó.
//   2. RESERVA ANTES DEL ENVÍO (brevoMarcarPieza) — el marcador se escribe ANTES de mandar, no
//      después. Invierte el riesgo: se pierde un mail antes que repetirlo.
//   3. ALARMA DE VOLUMEN (avisarSiVolumenAlto) — si un día se pasan ALARMA_VOLUMEN_DIA mails,
//      avisa por Telegram. Las dos de arriba tapan la causa conocida; ésta avisa de la próxima.
//
// BAJA: cada mail sale con link de baja firmado al pie y con las cabeceras List-Unsubscribe
// (ver PIE_LEGAL, enviarBrevo y _lib/baja.js). La baja marca `emailBlacklisted` en Brevo, que
// esta misma función ya respeta al armar el plan.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   BREVO_API_KEY, CRON_SECRET,
//   WA_FUNNEL_ENABLED, MAIL5_ENABLED, MAILOFERTA_ENABLED, MAILREGALOS_ENABLED,
//   REENGANCHE_ENABLED, PUERTA_ENGANCHE (=0 apaga la puerta; ausente = encendida),
//   ALARMA_VOLUMEN_DIA (default 400), BAJA_SECRET (opcional: si falta, firma con CRON_SECRET),
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (el candado vive en la tabla `ops_flags`)
//   (WHATSAPP_TOKEN y WA_SEND_FORCE ya no se leen acá: se fueron con el envío por WhatsApp.
//    Siguen haciendo falta para RECIBIR — api/wa-inbox.js y api/tg-webhook.js.)

const BREVO = 'https://api.brevo.com/v3';
const LIST_ID = 5; // "Leadgen - Guía Claude"

// Telegram: para el recordatorio diario de escalaciones sin responder (ver más abajo).
const tg = require('./_lib/tg');
// Baja: el link firmado del pie y las cabeceras List-Unsubscribe (ver _lib/baja.js).
const baja = require('./_lib/baja');
// Candado: una sola corrida enviando a la vez (ver _lib/candado.js).
const candado = require('./_lib/candado');
// La FICHA de este flujo: quién entra, qué piezas, qué lo dispara, cómo se mide (_lib/flujos.js).
// Las piezas salen de ahí, no de una lista escrita en este archivo.
const { piezasParaMotor } = require('./_lib/flujos');

// PIE LEGAL DE TODAS LAS PIEZAS. El `%%BAJA%%` lo reemplaza `personalizar()` por el link firmado
// de CADA destinatario, justo antes de enviar — la baja no puede vivir en una constante porque
// depende de a quién se le manda. Hasta el 08/08/2026 ninguna de las 6 piezas tenía salida: al
// que se hartaba sólo le quedaba "Denunciar como spam", y esa queja la paga la entrega de todos.
const PIE_LEGAL = 'Recibís este email porque pediste la guía gratis en nuestro anuncio de Facebook.<br><a href="%%BAJA%%" style="color:#5a5a78;text-decoration:underline;">Darte de baja de estos correos</a>';
// Con qué se borra el link si no hay secreto para firmarlo. Un "Darte de baja" que no da de baja
// es peor que no ofrecerlo: promete una salida y la primera vez que no funciona, esa persona
// aprende que el único botón que sirve es el de spam.
const ANCLA_BAJA = /<br><a href="%%BAJA%%"[\s\S]*?<\/a>/;

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

// Regalo 5 (EMAIL) — "La revolución de los agentes de IA". Último regalo de VALOR,
// después del Regalo 4 (día 7) y antes de la oferta (día 9). Se dispara por
// su propio atributo (MAIL5_AT): sólo a quien ya recibió el Regalo 4.
// Copy espejo de la campaña 'leadgen-5-agentes-ia' de ads-agent/scripts/publicar/send-email.mjs (aprobada).
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
            <a href="https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&amp;src=em-guias-r5&amp;sck=email5" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Descargar la guía de agentes de IA (PDF) →</a>
          </td></tr></table>
          <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">${PIE_LEGAL}</p></td></tr>
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

Descargar la guía de agentes de IA (PDF): https://sistemadeingresosdiariosia.com/api/d?file=guia-agentes-ia-periodistas.pdf&src=em-guias-r5&sck=email5

Leela con calma: es la base para que la IA deje de ser una herramienta suelta y pase a trabajar para tu medio.`,
};

// OFERTA POR EMAIL — plan B mientras WhatsApp no entrega (Business Verification en revisión
// desde el 13/07: Meta marca FALLIDO el 100% de los envíos). La oferta se "disparó" a 289 leads
// que nunca la vieron. Este email la hace llegar por el canal que SÍ funciona (Brevo: 22,6% de
// apertura, 0,45% de bounce al 21/07). Copy espejo de la plantilla `oferta_sistema_ingresos` v2
// aprobada por Jose el 2026-07-09 (ver sistema-ingresos/docs/PLANTILLAS-WHATSAPP.md): posiciona el curso y hace tee-up
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
            <a href="https://sistemadeingresosdiariosia.com/?src=em-guias-oferta&amp;sck=email-oferta" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">Ver cómo funciona el curso →</a>
          </td></tr></table>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">${PIE_LEGAL}</p></td></tr>
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
https://sistemadeingresosdiariosia.com/?src=em-guias-oferta&sck=email-oferta`,
};

// REGALOS 3 y 4 POR EMAIL — la ENTRADA del embudo, que hasta acá sólo salía por WhatsApp.
// Mientras el número está LIMITED, esos dos pasos no llegaban a nadie y los leads quedaban
// parados en la etapa 0: sin Regalo 3 no hay Regalo 4, sin Regalo 4 no hay Regalo 5 ni oferta.
// El 28/07 había 285 leads esperando el Regalo 3 desde hacía diez días.
//
// Copy espejo de las plantillas `regalo3_periodico_digital` y `regalo4_sistema_completo`
// (aprobadas, ver sistema-ingresos/docs/PLANTILLAS-WHATSAPP.md), adaptado a email. Las guías van como LINK con
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
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">${PIE_LEGAL}</p></td></tr>
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

// ── UNA SOLA PUERTA DE SALIDA A BREVO ────────────────────────────────────────
// Las seis piezas mandaban con su propio bloque de `fetch`, casi idénticos. Eso estaba bien
// mientras no hubiera nada que valiera para todas; con la baja sí lo hay, y copiarla seis veces
// es garantizar que la séptima pieza nazca sin ella. Ahora todo sale por acá.

// Pone el link de baja de ESTE destinatario en el pie y al final del texto plano.
function personalizar(pieza, email) {
  const url = baja.urlBaja(email);
  if (!url) {
    // Sin secreto para firmar no hay link posible. Se saca el ancla —no se deja rota— y se grita
    // en el log: un mail sin baja es un problema, pero silencioso sería el doble de problema.
    console.error('[wa-funnel] sin BAJA_SECRET ni CRON_SECRET: el mail sale SIN link de baja');
    return { html: String(pieza.html).replace(ANCLA_BAJA, ''), text: pieza.text, url: '' };
  }
  return {
    html: String(pieza.html).split('%%BAJA%%').join(url),
    text: `${pieza.text}\n\n—\nDarte de baja de estos correos: ${url}`,
    url,
  };
}

// Manda una pieza del embudo. Además del link visible, agrega las cabeceras List-Unsubscribe:
// son las que hacen que Gmail y Outlook muestren SU propio botón de baja arriba del mail. Es la
// salida que usa la mayoría —está a un clic, antes de abrir— y cada persona que la usa es una
// que no apretó "spam". `List-Unsubscribe-Post` es la que la vuelve de un clic (RFC 8058): sin
// ella el cliente de correo no ofrece el botón.
async function enviarBrevo({ from, email, nombre, subject, html, text, tag }) {
  const p = personalizar({ html, text }, email);
  const cuerpo = {
    sender: from,
    to: [{ email, name: nombre || 'Periodista' }],
    subject,
    htmlContent: p.html,
    textContent: p.text,
    tags: [tag],
  };
  if (p.url) {
    cuerpo.headers = {
      'List-Unsubscribe': `<${p.url}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  return { ok: r.ok, status: r.status, body: await r.json().catch(() => null) };
}

const DAY = 86400000;

function pickName(attrs) {
  const n = (attrs.FIRSTNAME || attrs.NOMBRE || attrs.NAME || attrs.FIRST_NAME || '').trim();
  return (n ? n.split(/\s+/)[0] : '') || 'colega';
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

// Envía el email del Regalo 5 a un lead vía Brevo (transaccional).
// El `tag` deja que Brevo trackee aperturas/clics de EXACTAMENTE este envío
// (filtrable en Statistics → Transactional por el tag, o vía aggregatedReport).
const MAIL5_TAG = 'regalo5-agentes-ia';
async function sendMail5(email, nombre) {
  return enviarBrevo({ from: MAIL5.from, email, nombre, subject: MAIL5.subject, html: MAIL5.html, text: MAIL5.text, tag: MAIL5_TAG });
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
  return enviarBrevo({ from: MAILOFERTA.from, email, nombre, subject: MAILOFERTA.subject, html: MAILOFERTA.html, text: MAILOFERTA.text, tag: MAILOFERTA_TAG });
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
  url: 'https://sistemadeingresosdiariosia.com/?src=em-guias-oferta2&sck=email-oferta2',
  cierre: 'Está todo explicado en la página, con calma.',
};

// Molde de email de texto (sin descarga): título, párrafos y —si la config lo trae— un botón.
// Lo usan el reenvío de la oferta y el re-enganche. Recibe la config por parámetro para que
// agregar un mail de este tipo no sea copiar 30 líneas de HTML.
// El botón es OPCIONAL a propósito: un mail que sólo pregunta no puede llevar un CTA, porque
// cualquier botón lo convierte en un mail que pide algo.
function armarEmailSimple(c) {
  // Lista de guías: links de texto, NO botones. Un botón grande convierte el mail en un pedido;
  // una lista deja elegir. Cada uno con su `src` para saber qué tema tira.
  const enlaceUrl = (e) => `https://sistemadeingresosdiariosia.com/api/d?file=${e.archivo}&src=${e.src}&sck=${e.src.toLowerCase()}`;
  const lista = (c.enlaces || []).length ? `
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:4px;">
            ${c.enlaces.map((e) => `<tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);"><a href="${enlaceUrl(e).replace(/&/g, '&amp;')}" style="color:#22d3ee;font-size:15px;text-decoration:none;">${e.texto}</a></td></tr>`).join('\n            ')}
          </table>` : '';
  // Caja de "buscalas en tu correo". El término va en monoespaciada y seleccionable — la gracia
  // es que se pueda copiar y pegar sin pensar.
  const buscador = c.buscador ? `
          <p style="margin:28px 0 12px 0;font-size:15px;color:#a0a0b8;line-height:1.7;">${c.buscador.intro}</p>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td style="background:#07070f;border:1px solid rgba(99,102,241,.35);border-radius:10px;padding:16px 18px;">
            <span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:16px;color:#22d3ee;font-weight:700;letter-spacing:.3px;">${c.buscador.termino}</span>
          </td></tr></table>
          <p style="margin:12px 0 0 0;font-size:13px;color:#606080;line-height:1.6;">${c.buscador.nota}</p>` : '';
  const boton = c.cta && c.url ? `
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;"><tr><td align="center">
            <a href="${c.url.replace(/&/g, '&amp;')}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">${c.cta}</a>
          </td></tr></table>` : '';
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
${lista}${buscador}${boton}
          <p style="margin:28px 0 0 0;font-size:13px;color:#606080;text-align:center;line-height:1.6;">${c.cierre}</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 20px 0 20px;"><p style="margin:0;font-size:12px;color:#40405a;line-height:1.6;">${PIE_LEGAL}</p></td></tr>
      </table>
    </td>
  </tr></table>
</body></html>`;
  const text = `PERIODISTAS DEL FUTURO IA

${c.titulo}

${c.parrafos.join('\n\n')}
${(c.enlaces || []).map((e) => `- ${e.texto}: ${enlaceUrl(e)}`).join('\n')}
${c.buscador ? `\n${c.buscador.intro}\n\n    ${c.buscador.termino}\n\n${c.buscador.nota.replace(/<\/?b>/g, '')}\n` : ''}
${c.cta && c.url ? `\n${c.cta.replace(' →', '')}: ${c.url}\n` : ''}
${c.cierre}`;
  return { html, text };
}

async function enviarReenvioOferta(email, nombre) {
  const { html, text } = armarEmailSimple(OFERTA_REENVIO);
  return enviarBrevo({ from: OFERTA_REENVIO.from, email, nombre, subject: OFERTA_REENVIO.subject, html, text, tag: OFERTA_REENVIO.tag });
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

// ─── PUERTA DE ENGANCHE + RE-ENGANCHE (07/08/2026, tarjeta #123) ─────────────────────────
//
// EL DATO QUE LO MOTIVA. De los 517 que recibieron el mail de la oferta, 363 —el 70%— nunca
// habían abierto un solo mail nuestro. Esa cohorte abre la oferta al 3,6%; la que ya venía
// abriendo 3 o más, al 61,5%. Y el clic-sobre-apertura es 15-23% en las TRES cohortes: el mail
// de la oferta convierte igual de bien en todo el mundo. Así que el 2,75% de clic nunca fue el
// asunto ni el copy — era mandarle la que vende a gente que hace semanas que no abre nada.
//
// QUÉ HACE. La oferta sale sólo si la persona abrió o clicó ALGO nuestro alguna vez. Al que no,
// le sale UNA sola vez este mail —corto, sin oferta y sin precio— para ver quién sigue vivo.
// El que lo abre entra a la cohorte viva y recibe la oferta en la corrida siguiente; el que no,
// se queda afuera en vez de seguir gastando envíos y reputación.
const REENGANCHE = {
  marcador: 'REENGANCHE_AT',
  tag: 'reenganche',
  // NO SALE ANTES DE ESTA FECHA (inclusive). El 07/08 se fueron 1.906 mails en el día —1.200 de
  // ellos repetidos por cadenas en paralelo— y quedaban 6.257 créditos del período que cierra el
  // 24/08. Soltar 575 más ese mismo día era apilar sobre un incidente.
  desde: '2026-08-08',
  // Y aunque esté habilitado, no más de esto por día: son 575 personas y no hay ningún apuro en
  // que salgan juntas. Repartido son ~4 días, sin competirle el cupo a las piezas del embudo
  // (que van primero por `prioridad`). El tope se cuenta sobre el marcador, no sobre la corrida,
  // así que las 12 corridas encadenadas comparten el mismo tope en vez de repartirlo cada una.
  capDia: 150,
  // Días desde el último toque. Evita que al que acaba de recibir la oferta le caiga el
  // re-enganche encima al día siguiente: si no abrió, no es que no le llegó, es que no lo vio.
  minDiasDesdeUltimoToque: 2,
  from: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
  // Asunto deliberadamente distinto a todo lo anterior: los regalos empiezan con "Tu guía…" /
  // "Tu Regalo N…" y la oferta describe dónde está parado el lector. Este pregunta y no promete
  // nada — es la única forma de que el que ignoró siete asuntos declarativos abra el octavo.
  subject: '¿Te sirvieron las guías?',
  titulo: 'Una pregunta corta',
  parrafos: [
    'Te mandamos cuatro guías en las últimas semanas: el periódico digital, los prompts, los 5 pilares y los agentes de IA.',
    'Te escribo por una sola cosa: quiero saber si te sirvieron. Sos periodista, tenés oficio y criterio propio — están escritas para alguien así, y lo que me cuentes cambia las que vienen.',
    'Respondeme a este mail con una línea. La leo yo.',
    'Y si las querés volver a abrir, están todas acá:',
  ],
  // Las CUATRO, no una. Un botón a una sola guía empuja esa; la lista completa deja elegir y de
  // paso dice qué tema le interesa a cada uno (cada link tiene su propio `src`). Mismo orden en
  // que las nombra el párrafo de arriba. Siempre por /api/d: el link directo al .pdf no se cuenta.
  enlaces: [
    { texto: 'Tu periódico digital en Instagram y Facebook', archivo: 'guia-periodico-digital-ig-fb.pdf', src: 'Email-Reenganche-Periodico' },
    { texto: '+50 prompts para periodistas', archivo: 'guia-completa-50-prompts.pdf', src: 'Email-Reenganche-Prompts' },
    { texto: 'Las 5 piezas que sostienen el ingreso', archivo: 'guia-5-pilares-ingresos-periodico-digital.pdf', src: 'Email-Reenganche-Pilares' },
    { texto: 'Los agentes de IA', archivo: 'guia-agentes-ia-periodistas.pdf', src: 'Email-Reenganche-Agentes' },
  ],
  // SIN botón y SIN mencionar la venta, las dos por pedido de Jose (07/08):
  //   - "no es para venderte nada" le mete la venta en la cabeza igual que si se la nombraras;
  //   - un botón a una guía puntual convierte el mail en otro envío que pide algo, justo lo que
  //     esta persona viene ignorando hace semanas.
  // Consecuencia técnica: la única señal que deja este mail es la APERTURA (el pixel), no el
  // clic. Es a propósito — la respuesta al mail la lee Jose en la casilla, no la puerta.
  //
  // BUSCADOR. Buena parte de los que "nunca abrieron nada" probablemente las tengan en Spam o en
  // Promociones. El término está verificado: "Periodistas del Futuro IA" está en el cuerpo de LAS
  // SEIS piezas del embudo, incluido el Regalo 1 que manda Make (ver sync-embudo-contenido.mjs).
  // Buscar por el remitente NO servía: el Regalo 2 salió desde el Gmail hasta el 07/08.
  buscador: {
    intro: '¿No las ves en tu bandeja? Puede que hayan caído en Spam o en Promociones. Copiá esto en el buscador de tu correo y aparecen todas:',
    termino: 'Periodistas del Futuro IA',
    // Gmail NO busca dentro de Spam salvo que se lo pidas. Sin esta línea, el que la tiene ahí
    // busca, no encuentra nada, y se confirma a sí mismo que nunca le llegó.
    nota: 'En Gmail, para que busque también adentro de Spam, escribí <b>in:anywhere</b> delante. Y si las encontrás ahí, marcalas como “No es spam”: así las próximas te llegan bien.',
  },
  cierre: 'Y si preferís que no te escriba más, con decírmelo alcanza.',
};

async function enviarReenganche(email, nombre) {
  const { html, text } = armarEmailSimple(REENGANCHE);
  return enviarBrevo({ from: REENGANCHE.from, email, nombre, subject: REENGANCHE.subject, html, text, tag: REENGANCHE.tag });
}

// Quién dio SEÑAL DE VIDA alguna vez: abrió o clicó cualquier mail nuestro en los últimos 90 días.
//
// ⚠️ SIN filtro de tag, y es a propósito. Los Regalos 1 y 2 los manda Make —no esta función— y
// son justo los que más se abren. Filtrando por los tags del embudo el set daba 182 emails en
// vez de 479: la puerta habría dado por muertos a 297 personas que sí abrieron, sólo porque lo
// que abrieron no lo mandó este archivo.
//
// FALLA RUIDOSA, NO MUDA: si Brevo devuelve error, o si devuelve CERO eventos (que con ~1.900
// aperturas en 90 días sólo puede significar que la consulta se rompió), devuelve null. Con null
// la puerta no se aplica y el embudo se comporta como antes — un set truncado sería peor que no
// tener puerta: mandaría re-enganche a gente viva y le negaría la oferta.
const ENGANCHE_DIAS = 90;
async function abrieronAlgoSet() {
  const key = process.env.BREVO_API_KEY;
  const vivos = new Set();
  let totalEventos = 0;
  for (const evento of ['opened', 'clicks']) {
    let offset = 0;
    for (;;) {
      const u = `${BREVO}/smtp/statistics/events?limit=2500&offset=${offset}&days=${ENGANCHE_DIAS}&event=${evento}`;
      const r = await fetch(u, { headers: { 'api-key': key } });
      if (!r.ok) throw new Error(`Brevo events ${evento} ${r.status}: ${(await r.text()).slice(0, 120)}`);
      const lote = (await r.json()).events || [];
      totalEventos += lote.length;
      for (const e of lote) vivos.add(String(e.email || '').toLowerCase().trim());
      if (lote.length < 2500) break;
      offset += 2500;
    }
  }
  if (totalEventos === 0) return null; // consulta rota: mejor sin puerta que con una puerta ciega
  return vivos;
}

// Regalos 3 y 4 por email. El tag propio deja medir cada uno por separado en Brevo,
// igual que ya se hace con el Regalo 5 y la oferta.
async function enviarRegaloEmail(nivel, email, nombre) {
  const cfg = REGALOS_EMAIL[nivel];
  const { html, text } = armarEmailRegalo(cfg);
  return enviarBrevo({ from: cfg.from, email, nombre, subject: cfg.subject, html, text, tag: cfg.tag });
}

async function brevoCrearAtributoTexto(nombre) {
  const r = await fetch(`${BREVO}/contacts/attributes/normal/${nombre}`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'text' }),
  });
  return { ok: r.ok, status: r.status, detalle: r.ok ? 'creado' : await r.text() };
}


// Métricas del funnel: dónde está parado cada lead. Antes esto traía además las entregas y
// lecturas de las plantillas de WhatsApp desde Meta; se fue con el canal (09/08/2026).
// Las aperturas y clics de los mails los da Brevo por tag (ver mail5OpenStats).
//
// Sigue leyendo WA_STAGE, que es un nombre viejo: hoy lo escriben los envíos por EMAIL y
// significa "hasta qué paso del embudo llegó". Se conserva porque son datos ya escritos en
// ~900 contactos y los paneles lo leen.
async function computeStats(contacts) {
  const st = { r3: 0, r4: 0, oferta: 0, sin_enviar: 0, mail5: 0 };
  for (const c of contacts) {
    const a = c.attributes || {};
    if (a.MAIL5_AT) st.mail5++;
    const s = Number(a.WA_STAGE || 0);
    if (s >= 5) st.oferta++; else if (s === 4) st.r4++; else if (s === 3) st.r3++; else st.sin_enviar++;
  }
  return { total_contactos: contacts.length, enviados: { regalo3: st.r3, regalo4: st.r4, regalo5_email: st.mail5, oferta: st.oferta, aun_sin_regalo: st.sin_enviar } };
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
  const html = `${saludHtml}${contHoy}${contAyer}<h2>📊 Embudo de email — reporte diario</h2>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8a8aa0;margin:0 0 4px;"><b>Estado del embudo</b> — dónde está parado cada lead ahora (esto NO es lo que se envió hoy):</p>
    <ul>
      <li>En <b>Regalo 3</b> (ya lo recibieron, esperan el 4): <b>${a.regalo3}</b></li>
      <li>En <b>Regalo 4</b>: <b>${a.regalo4}</b></li>
      <li>Recibieron el <b>Regalo 5</b> (email agentes IA): <b>${a.regalo5_email}</b></li>
      ${r5open}
      <li>Recibieron la <b>Oferta</b>: <b>${a.oferta}</b></li>
      <li>Todavía sin su primer regalo: ${a.aun_sin_regalo} (esperan llegar al día 5)</li>
      <li>Total de leads en la lista: ${stats.total_contactos}</li>
    </ul>`;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Reporte Funnel', email: 'jose@sistemadeingresosdiariosia.com' },
      to: [{ email: 'joseanselmi27@gmail.com' }],
      subject: salud.nivel === 'critico' ? '🔴 Embudo de email — PROBLEMA (requiere tu atención)' : salud.nivel === 'alerta' ? '🟡 Embudo de email — aviso' : '✅ Embudo de email — reporte diario',
      htmlContent: html,
    }),
  });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// Dada la antigüedad y el stage ya enviado, decide qué mandar (uno solo, el próximo debido).

// ── LO QUE LE FALTA A CADA LEAD, por EMAIL ───────────────────────────────────
// Hasta el 01/08 el próximo paso lo decidía WA_STAGE. Eso dejaba dos agujeros que
// juntos sumaban ~2.700 mails que nunca salieron:
//   1. WA_STAGE lo avanza el ENVÍO por WhatsApp, no la entrega. Desde que el número
//      dejó de entregar (13/07) hay 400 leads parados "en la etapa 5" que nunca
//      recibieron los Regalos 3 y 4.
//   2. el cálculo del próximo paso sólo miraba hacia adelante: al que quedó en la
//      etapa 5 no había forma de completarle lo que le faltaba. El Regalo 4 no le
//      llegó a NADIE, nunca.
// Ahora la verdad la dan los marcadores de EMAIL: lo que no tiene marcador, no llegó.
// Se completa en orden, UNA pieza por persona por día (WA_SENT_AT hace de "último
// toque") y respetando el día del embudo que le corresponde — un lead de ayer no
// recibe hoy el Regalo 3.
// ⚠️ LAS PIEZAS YA NO SE DECLARAN ACÁ: salen de la FICHA del flujo, en `_lib/flujos.js`.
// Antes esta lista era la única definición, y la recuperación tenía otra lista con otra forma
// (en horas, marcando en Supabase) para el mismo concepto. Dos idiomas para lo mismo es lo que
// hacía caro probar cualquier cosa. Ahora la ficha es la fuente y esto la consume.
// El orden del array es el orden de prioridad de la cola — lo define la ficha.
const PIEZAS = piezasParaMotor('guias-claude');

// Las etiquetas y los textos de los mails viven en dos lugares distintos por razones distintas:
// la ficha las declara (para poder medir), y las constantes de este archivo las usan al armar el
// mail. Si algún día se cambia una y no la otra, los envíos saldrían con una etiqueta y el panel
// buscaría otra — y "no entregó" sería mentira. Esto lo hace imposible: revienta al arrancar.
{
  const esperado = { regalo3: REGALOS_EMAIL[3].tag, regalo4: REGALOS_EMAIL[4].tag, mail5: MAIL5_TAG, mailoferta: MAILOFERTA_TAG };
  for (const p of PIEZAS) {
    if (esperado[p.send] !== p.tag) {
      throw new Error(`[wa-funnel] la etiqueta de "${p.send}" no coincide: la ficha dice "${p.tag}" y este archivo usa "${esperado[p.send]}". Alinear _lib/flujos.js con las constantes de acá.`);
    }
  }
}

// SEGUNDA PRUEBA DE QUE ALGO YA SALIÓ: el registro de envíos por persona.
// El marcador de Brevo se escribe DESPUÉS del envío, en otra llamada. Si esa llamada falla
// —pasó el 29/07 con el código viejo, que además usaba dos PUT— el mail salió pero el lead
// queda como pendiente y se le vuelve a mandar. Costó 67 Regalos 3 repetidos el 31/07.
// `comunicaciones_email` (que llena el webhook de Brevo) sabe a quién se le mandó qué de
// verdad, así que se usa como respaldo del marcador. Sólo suma evidencia de envío: si
// Supabase no contesta, se sigue con los marcadores como antes.
// ⚠️ Se pagina de a 1.000 porque el servidor corta ahí por más que se pida `limit=20000`, y
// sin ruido: devuelve 1.000 filas y listo. Sin paginar traía 944 de los 1.306 envíos conocidos
// —faltaba el 28%— y los que faltaban eran justo los candidatos a repetirse.
async function enviadosSegunRegistro() {
  if (!SB_URL || !SB_KEY) return null;
  // El re-enganche va acá aunque no sea una PIEZA: se manda una sola vez en la vida, así que
  // necesita el mismo respaldo que las piezas por si el marcador no llega a escribirse.
  const tags = [...PIEZAS.map((p) => p.tag), REENGANCHE.tag].join(',');
  const PAGINA = 1000;
  const set = new Set();
  try {
    for (let offset = 0; offset < 50000; offset += PAGINA) {
      const r = await sbRest(`comunicaciones_email?select=email,campana&campana=in.(${tags})&order=enviado_en.asc&limit=${PAGINA}&offset=${offset}`, {});
      if (!r.ok) return set.size ? set : null;
      const filas = await r.json();
      for (const f of filas || []) set.add(`${String(f.email || '').toLowerCase().trim()}|${f.campana}`);
      if (!filas || filas.length < PAGINA) break;
    }
    return set;
  } catch { return set.size ? set : null; }
}

// WA_SENT_AT es de tipo `date` en Brevo y hoy vuelve como "2026-08-01", pero de él depende el
// tope de un mail por persona por día: si el formato cambiara, la comparación fallaría en
// silencio y —con 13 corridas encadenadas— alguien recibiría las cuatro piezas en diez minutos.
// Por eso se compara sólo la parte de la fecha, sirva la que sirva.
const mismoDia = (valor, hoy) => String(valor || '').slice(0, 10) === hoy;

// La primera pieza que le falta y que ya le tocaba. `habilitadas` saltea las apagadas
// por flag: si no, una pieza apagada bloquearía para siempre a todas las de atrás.
function piezaFaltante(attrs, daysOld, hoy, habilitadas, emailLc, registro) {
  if (mismoDia(attrs.WA_SENT_AT, hoy)) return null; // ya recibió algo nuestro hoy
  for (const p of PIEZAS) {
    if (!habilitadas.has(p.flag)) continue;
    if (daysOld < p.minDays) continue;
    if (attrs[p.marcador]) continue;                          // el marcador dice que salió
    if (registro && registro.has(`${emailLc}|${p.tag}`)) continue; // el registro también vale
    return p;
  }
  return null;
}

// RESERVA la pieza, en UNA sola llamada: el marcador, el "último toque" (WA_SENT_AT, que es el
// tope de uno por día) y, si la pieza tiene etapa, WA_STAGE —para que WhatsApp no la repita si
// el número revive—. Antes eran dos PUT por envío: la mitad del tiempo de cada corrida se iba
// en marcar. La etapa sólo AVANZA: completarle el Regalo 3 a alguien que ya recibió la oferta
// no puede devolverlo a la etapa 3.
//
// ⚠️ SE LLAMA ANTES DE ENVIAR, no después (cambió el 08/08/2026, tarjeta #123). Hasta acá el
// marcador se escribía al volver de Brevo, y entre "mandé" y "marqué" había una ventana de
// medio segundo en la que otra corrida veía a esa persona como pendiente y le mandaba lo mismo.
// Reservando primero, la ventana se invierte: lo peor que puede pasar es que la reserva quede
// escrita y el envío falle → esa persona se queda un día sin su pieza y la recibe en la corrida
// siguiente (la reserva se libera con `brevoLiberarPieza`). Mejor un mail que no sale que uno
// que sale tres veces: el primero se recupera solo, el segundo se cobra en reputación.
async function brevoMarcarPieza(email, pieza, stageActual = 0) {
  const attributes = { [pieza.marcador]: todayISO(), WA_SENT_AT: todayISO() };
  if (pieza.stage && pieza.stage > Number(stageActual || 0)) attributes.WA_STAGE = pieza.stage;
  const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ attributes }),
  });
  if (!r.ok) throw new Error(`Brevo marcar ${pieza.marcador} ${r.status}: ${await r.text()}`);
}

// Deshace la reserva cuando el envío falló: borra el marcador de la pieza para que vuelva a la
// cola. WA_SENT_AT se deja como está, a propósito — no sabemos qué fecha tenía antes y, ante la
// duda, que esa persona quede "ya tocada hoy" sólo le cuesta un día de espera; pisarlo con un
// valor inventado podría hacerle llegar dos mails la misma tarde.
async function brevoLiberarPieza(email, pieza) {
  try {
    const r = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ attributes: { [pieza.marcador]: '' } }),
    });
    return r.ok;
  } catch (e) {
    console.error('[wa-funnel] liberar reserva:', e && e.message || e);
    return false;
  }
}

// Los dos lados de "reservar antes de enviar", en un solo lugar para que las tres piezas que
// mandan mail (la del embudo, el re-enganche y el reenvío de la oferta) no se separen con el
// tiempo — que fue como el reenvío terminó con un manejo de errores distinto al del resto.

// Si la reserva no se puede escribir, NO se manda. Un envío sin marcador es exactamente el que
// vuelve a salir mañana, y pasado.
async function reservar(p, pieza, results) {
  try { await brevoMarcarPieza(p.email, pieza, p.stageSent); return true; }
  catch (e) {
    results.push({ email: p.email, send: p.send, error: 'no se pudo reservar en Brevo (no se envió): ' + e.message });
    return false;
  }
}

// El envío falló con la reserva ya escrita: se libera para que la pieza vuelva a la cola. Si ni
// eso se puede, se dice con todas las letras — es el único caso en que alguien se queda sin una
// pieza para siempre, y tiene que verse en la respuesta de la corrida.
async function fallo(p, pieza, sent, results) {
  const liberada = await brevoLiberarPieza(p.email, pieza);
  results.push({
    email: p.email,
    send: p.send,
    error: sent.status,
    reserva: liberada
      ? 'liberada: vuelve a la cola'
      : '⚠️ NO se pudo liberar: queda marcada sin haber salido, esa pieza ya no le llega',
  });
}

// Despacha la pieza que corresponda. Cada una ya tiene su tag propio en Brevo.
async function enviarPieza(pieza, email, nombre) {
  if (pieza.send === 'regalo3') return enviarRegaloEmail(3, email, nombre);
  if (pieza.send === 'regalo4') return enviarRegaloEmail(4, email, nombre);
  if (pieza.send === 'mail5') return sendMail5(email, nombre);
  return sendMailOferta(email, nombre);
}

// Prioridad de negocio para ordenar la cola de envíos. CLAVE: el cron tiene ~60 s y procesa
// la cola EN ORDEN hasta que se acaba el tiempo (procesa ~40 leads y Vercel lo corta). Si la
// OFERTA (la que vende) quedara al fondo, detrás del backlog de Regalos 3/4, la función se
// muere antes de llegar a ella y NUNCA se envía. Por eso la oferta va primero.
// Menor número = se manda antes.
function prioridad(p) {
  if (p.send === 'mailoferta') return 0;      // la que VENDE
  if (p.send === 'ofertareenvio') return 1;   // la segunda oportunidad de la que vende
  if (p.send === 'regalo3' || p.send === 'regalo4') return 2; // la ENTRADA: sin esto no hay a quién venderle
  if (p.send === 'reenganche') return 6;      // rescate de fríos: barato, pero cede el turno a todo lo demás
  return 6;                                   // Regalo 5: bonus para quien ya está adentro, puede esperar
}

// ── ALARMA DE VOLUMEN ────────────────────────────────────────────────────────
// El 07/08/2026 el embudo mandó 1.906 mails en un día —1.200 de ellos repetidos— y nadie se
// enteró hasta que Jose entró a Brevo a mirar los créditos, horas después. El candado y la
// reserva previa evitan que se repita POR ESA CAUSA; esto avisa igual, porque la próxima forma
// de mandar de más va a ser otra y el problema de fondo era que un día raro se veía igual que
// uno normal.
//
// El umbral: un día del embudo son ~90-150 mails y el tope duro es PIEZAS_CAP_DIA (500). 400 es
// "acá está pasando algo" sin llegar a ser el techo — cuando salta, todavía hay margen para
// frenar antes de gastar el cupo del mes.
const ALARMA_UMBRAL = parseInt(process.env.ALARMA_VOLUMEN_DIA || '400', 10);
async function avisarSiVolumenAlto(mailsHoy, hoy) {
  if (!Number.isFinite(mailsHoy) || mailsHoy < ALARMA_UMBRAL) {
    return `ok — ${mailsHoy} mails hoy (avisa a partir de ${ALARMA_UMBRAL})`;
  }
  // Una sola vez por día. Se usa el mismo mecanismo del candado —la fila la crea el primero que
  // llega, atómicamente— porque las 13 corridas encadenadas cruzan el umbral todas juntas y
  // mandarían 13 avisos idénticos, que es la mejor forma de que Jose los empiece a ignorar.
  const primero = await candado.tomar(`alarma_volumen_${hoy}`, 24 * 3600);
  if (!primero.ok) return `⚠️ volumen alto (${mailsHoy}) — ya avisado hoy`;
  const texto = `⚠️ VOLUMEN ALTO DEL EMBUDO\n\n${mailsHoy} mails salieron hoy (${hoy}). Un día normal son 90-150 y el aviso salta en ${ALARMA_UMBRAL}.\n\nPuede ser una puesta al día de la cola —que es esperado— o dos corridas pisándose. Para saber cuál: mirá el embudo con ?mode=dry y fijate si "candado" dice que hay otra corrida viva.`;
  if (!tg.CHAT && !tg.GROUP) return `⚠️ volumen alto (${mailsHoy}) — sin Telegram configurado, no se pudo avisar`;
  const r = await tg.enviar({ chat_id: tg.CHAT || tg.GROUP, text: texto });
  return r && r.ok ? `⚠️ VOLUMEN ALTO (${mailsHoy}) — avisado por Telegram` : `⚠️ volumen alto (${mailsHoy}) — falló el aviso por Telegram`;
}

// ─── EL LOG DE CORRIDAS (12/08/2026) ─────────────────────────────────────────────────────
//
// POR QUÉ. El 11 y el 12/08 el embudo mandó 63 y 77 mails con 237 planificados, y para saber
// qué había pasado hubo que contar mails uno por uno en Brevo: no existía NINGÚN registro de
// qué hizo cada corrida. La tabla que ya había (`funnel_reporte_diario`) no sirve para esto y
// no es cuestión de encenderla: guarda UNA FILA POR DÍA con upsert por fecha —trece corridas
// dejan una sola fila, la última que escriba— y además sólo la escribe la madre (`mode=cron`),
// que es justo la que nunca falla. Las 12 encadenadas, que son las que hacen el trabajo y las
// que se mueren, no escribían nada.
//
// CÓMO FUNCIONA. Una fila POR CORRIDA, que no se pisa nunca. Se abre al arrancar y se cierra
// al terminar. **Una fila que queda abierta para siempre ES el dato**: significa que esa
// corrida murió sin llegar al final. Es la única forma de ver un timeout de Vercel, que mata
// la función sin ejecutar ningún `catch` y sin dejar ni un rastro.
//
// BEST-EFFORT DE PUNTA A PUNTA: si Supabase no contesta, el embudo manda igual. Un log que
// puede frenar los envíos es peor que no tener log.
async function abrirCorrida(fecha, eslabon, modo, cand, hostRecibido) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await sbRest('funnel_corridas', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ fecha, eslabon, modo, estado: 'arranco', candado: cand, host_recibido: hostRecibido || null }),
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0] && rows[0].id) || null;
  } catch (e) { console.error('[wa-funnel] abrir corrida:', e && e.message || e); return null; }
}

async function cerrarCorrida(id, campos) {
  if (!id || !SB_URL || !SB_KEY) return;
  try {
    await sbRest(`funnel_corridas?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ cerro_en: new Date().toISOString(), ...campos }),
    });
  } catch (e) { console.error('[wa-funnel] cerrar corrida:', e && e.message || e); }
}

// Cuántos hay de cada tipo de envío. Se usa para las tres columnas del log (planificado,
// enviado, sin_intentar) — que son la misma pregunta hecha en tres momentos.
const contarPorTipo = (arr) => arr.reduce((acc, p) => {
  const k = String((p && (p.send || p.sent || p.channel)) || 'otro');
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

// El nombre de cada envío EN CASTELLANO. La alarma la lee Jose, no un programador: "reenganche"
// no le dice nada, «Una pregunta corta» sí.
const NOMBRE_ENVIO = {
  regalo3: 'Regalo 3 · el periódico digital',
  regalo4: 'Regalo 4 · los 5 pilares',
  mail5: 'Regalo 5 · los agentes de IA',
  mailoferta: 'la OFERTA',
  ofertareenvio: 'el reenvío de la oferta',
  reenganche: 'el re-enganche («Una pregunta corta»)',
};

// ─── ALARMA DE SUB-ENVÍO (12/08/2026) ────────────────────────────────────────────────────
//
// El espejo de `avisarSiVolumenAlto`. Hasta hoy TODA la vigilancia de este archivo miraba para
// un solo lado: avisaba si salían de MÁS, nunca si salían de MENOS. Está calibrada contra el
// incidente del 07/08 —1.200 mails repetidos—, que era el error de ayer.
//
// El error de hoy es el contrario y salió más caro: piezas que se planifican, no se despachan
// y devuelven 200. El Regalo 4 no salió en TODO julio. El re-enganche lleva tres días con 150
// planificados y 0 enviados. Ninguno de los dos disparó nada, porque no había nada que
// disparar: la única alarma viva se activa a partir de 400 mails y estos fallan por defecto.
//
// Sólo avisa en el ÚLTIMO eslabón de la cadena —cuando ya no va a haber otra corrida que
// despache lo que quedó— y una vez por día, con el mismo candado que usa la de volumen.
//
// ⚠️ LO QUE ESTA ALARMA NO CUBRE: si la cadena se muere de golpe (timeout de Vercel), no hay
// último eslabón y por lo tanto no hay aviso. Ese caso lo tapa el log de corridas: la fila
// queda abierta. Que el Panel de Salud lo lea es el paso siguiente, todavía sin hacer.
async function avisarSiFaltoMandar(pendientes, hoy, cadenaCortada) {
  const total = Object.values(pendientes).reduce((a, b) => a + b, 0);
  if (!total) return 'ok — el día cerró sin cola pendiente';
  const primero = await candado.tomar(`alarma_faltante_${hoy}`, 24 * 3600);
  if (!primero.ok) return `⚠️ quedaron ${total} sin mandar — ya avisado hoy`;
  const detalle = Object.entries(pendientes)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `• ${NOMBRE_ENVIO[k] || k}: ${v}`).join('\n');
  const texto = cadenaCortada
    ? `🚨 SE CORTÓ LA CADENA DEL EMBUDO\n\nLa corrida siguiente no arrancó (se la disparó 3 veces), así que el día terminó acá con esto sin mandar:\n\n${detalle}\n\nTotal: ${total} mails (${hoy}). Mañana se reintenta solo, pero si esto se repite el embudo nunca vacía la cola.\n\nQué pasó, corrida por corrida: tabla \`funnel_corridas\` en Supabase.`
    : `⚠️ EL EMBUDO CERRÓ EL DÍA CON COLA SIN MANDAR\n\n${detalle}\n\nTotal: ${total} mails planificados que NO salieron (${hoy}).\n\nLa cadena de corridas terminó y esto quedó pendiente. Mañana se reintenta solo — pero si el número se repite todos los días, hay algo trabado y no se está vaciando.\n\nQué pasó, corrida por corrida: tabla \`funnel_corridas\` en Supabase.`;
  if (!tg.CHAT && !tg.GROUP) return `⚠️ quedaron ${total} sin mandar — sin Telegram configurado, no se pudo avisar`;
  const r = await tg.enviar({ chat_id: tg.CHAT || tg.GROUP, text: texto });
  return r && r.ok ? `⚠️ QUEDARON ${total} SIN MANDAR — avisado por Telegram` : `⚠️ quedaron ${total} sin mandar — falló el aviso por Telegram`;
}

export default async function handler(req, res) {
  // MOMENTO CERO DE LA FUNCIÓN. Vercel la mata a los 60 s cuente lo que cuente, así que los
  // presupuestos de tiempo se miden desde ACÁ y no desde que empieza el envío: el arranque
  // —leer ~900 contactos de Brevo, 3.100 eventos de la puerta, 4.500 envíos del registro—
  // tarda entre 5 y 35 s y era completamente invisible para el presupuesto del bucle.
  const T_INICIO = Date.now();
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

  // El candado se declara fuera del `try` para que el `catch` pueda soltarlo: si la corrida
  // revienta con el candado en la mano, sin esto el embudo queda trabado hasta que venza el TTL.
  const LOCK = 'embudo_envio';
  const LOCK_TTL = 240; // segundos: un eslabón tarda ~40-60 s, así que sobra margen
  let lockToken = '';
  // Id de la fila del log de ESTA corrida. Fuera del `try` para que el `catch` pueda cerrarla:
  // una corrida que revienta tiene que quedar registrada como 'error', no como abierta.
  let corridaId = null;
  const soltarCandado = async () => {
    if (!lockToken) return;
    const t = lockToken;
    lockToken = ''; // no soltarlo dos veces (podría borrar el candado de la corrida siguiente)
    await candado.soltar(LOCK, t);
  };

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

    // ── EL CANDADO ───────────────────────────────────────────────────────────
    // Se toma ANTES de leer los contactos, no antes de enviar: si hay otra cadena viva, esta
    // corrida se entera en una consulta en vez de gastar 20 segundos armando un plan que no va
    // a ejecutar. Sólo lo toman las corridas que MANDAN — dry, setup y los modos de prueba
    // pasan de largo.
    //
    // La cadena comparte UN candado, no uno por eslabón: la corrida inicial lo toma y le pasa el
    // token a su hija por la URL (`&lock=`), y cada hija lo renueva. Si no se compartiera, el
    // primer eslabón se bloquearía a sí mismo en el segundo. Y si una hija encuentra que el
    // token ya no vale (venció y otro lo tomó), frena: dos cadenas a la vez es exactamente lo
    // que mandó 1.200 mails repetidos el 07/08.
    const vaAEnviar = (mode === 'live' || mode === 'cron') && process.env.WA_FUNNEL_ENABLED === '1';
    const tokenHeredado = searchParams.get('lock') || '';
    let candadoInfo = 'no aplica (esta corrida no envía)';
    if (vaAEnviar) {
      // `pasar` y no `renovar`: el eslabón que arranca se queda con un token NUEVO. Así la madre
      // puede disparar a la hija varias veces sin riesgo —sólo la primera se lleva el candado— y
      // así se sabe desde afuera si la hija arrancó: si el token cambió, arrancó. Ver `pasar`.
      const r = tokenHeredado
        ? await candado.pasar(LOCK, tokenHeredado)
        : await candado.tomar(LOCK, LOCK_TTL);
      if (!r.ok) {
        // NO se manda nada. Y se dice por qué, que es la mitad del arreglo: el 07/08 las
        // corridas en paralelo devolvían todas un 200 alegre y nadie podía saber cuál sobraba.
        // Queda en el log: una hija bloqueada es una de las formas conocidas de que la cadena
        // muera devolviendo 200, y sin fila era indistinguible de una hija que nunca arrancó.
        const idBloq = await abrirCorrida(todayISO(), chain, mode, `bloqueado: ${r.motivo || 'candado tomado'}`);
        await cerrarCorrida(idBloq, { estado: 'bloqueado', motivo_corte: r.motivo || 'el candado está tomado por otra corrida' });
        res.status(200).json({
          mode, chain, bloqueado: true, enviados: 0,
          motivo: r.motivo || 'el candado está tomado por otra corrida',
          que_hacer: 'esperá a que termine la corrida viva (o a que venza el candado) y volvé a intentar',
        });
        return;
      }
      // ⚠️ EL TOKEN NUEVO MANDA. Antes era `tokenHeredado || r.token` porque la cadena compartía
      // uno solo; ahora cada eslabón rota el suyo y quedarse con el viejo dejaría a esta corrida
      // sin poder renovar ni soltar su propio candado.
      lockToken = r.token || tokenHeredado || '';
      candadoInfo = r.sinRed ? `⚠️ SIN CANDADO — ${r.motivo}` : (tokenHeredado ? `recibido de la madre (eslabón ${chain})` : 'tomado');
      // La fila se abre ACÁ: con el candado ya en la mano y ANTES de leer nada de Brevo. Si la
      // corrida se muere durante el arranque —la hipótesis del 11/08, cuando el arranque tardó
      // ~32 s y Vercel la mató en el segundo 60— la fila queda abierta, y eso es el diagnóstico.
      corridaId = await abrirCorrida(todayISO(), chain, mode, candadoInfo, req.headers['x-forwarded-host'] || req.headers.host || '');
    }

    if (mode === 'setup') {
      const wa = await brevoCreateAttribute();
      const m5 = await brevoCreateMail5Attribute();
      const mof = await brevoCreateMailOfertaAttribute();
      const m3 = await brevoCrearAtributoTexto('MAIL3_AT');
      const m4 = await brevoCrearAtributoTexto('MAIL4_AT');
      const m2 = await brevoCrearAtributoTexto(OFERTA_REENVIO.marcador);
      const rg = await brevoCrearAtributoTexto(REENGANCHE.marcador);
      res.status(200).json({ mode, WA_STAGE_attribute: wa, MAIL5_AT_attribute: m5, OFERTA_MAIL_AT_attribute: mof, MAIL3_AT_attribute: m3, MAIL4_AT_attribute: m4, OFERTA_MAIL2_AT_attribute: m2, REENGANCHE_AT_attribute: rg });
      return;
    }

    // Previsualizar el reenvío de la oferta: ?mode=reenviotest&to=...
    if (mode === 'reenviotest') {
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await enviarReenvioOferta(to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, to, asunto: OFERTA_REENVIO.subject, sent });
      return;
    }

    // Previsualizar el re-enganche: ?mode=reenganchetest&to=...
    if (mode === 'reenganchetest') {
      const to = searchParams.get('to') || 'joseanselmi27@gmail.com';
      const sent = await enviarReenganche(to, searchParams.get('nombre') || 'Jose');
      res.status(200).json({ mode, to, asunto: REENGANCHE.subject, sent });
      return;
    }

    // Qué separa la puerta de enganche, sin mandar nada: ?mode=puerta
    // Contesta la única pregunta que importa antes de encenderla: de los que hoy recibirían la
    // oferta, ¿a cuántos se la estamos mandando sabiendo que nunca abrieron nada?
    if (mode === 'puerta') {
      const vivos = await abrieronAlgoSet();
      const todos = await brevoGetContacts();
      const compradores = await ventasEmailsSet();
      const activos = todos.filter((c) => !c.emailBlacklisted && !compradores.has(String(c.email || '').toLowerCase().trim()));
      const conSenal = (c) => vivos && vivos.has(String(c.email || '').toLowerCase().trim());
      const yaRecibieronOferta = activos.filter((c) => (c.attributes || {}).OFERTA_MAIL_AT);
      const enCola = activos.filter((c) => {
        const a = c.attributes || {};
        return !a.OFERTA_MAIL_AT && Math.floor((Date.now() - new Date(c.createdAt).getTime()) / DAY) >= 9;
      });
      res.status(200).json({
        mode,
        puerta: vivos ? 'operativa' : 'SIN DATOS (Brevo devolvió 0 eventos) — no se aplicaría',
        ventana_dias: ENGANCHE_DIAS,
        contactos_activos: activos.length,
        con_senal_de_vida: vivos ? activos.filter(conSenal).length : null,
        ya_recibieron_la_oferta: {
          total: yaRecibieronOferta.length,
          con_senal: vivos ? yaRecibieronOferta.filter(conSenal).length : null,
          sin_senal_se_la_mandamos_a_ciegas: vivos ? yaRecibieronOferta.filter((c) => !conSenal(c)).length : null,
        },
        en_cola_para_la_oferta: {
          total: enCola.length,
          pasarian_la_puerta: vivos ? enCola.filter(conSenal).length : null,
        },
        // Los dos caminos al re-enganche, que es lo que de verdad se va a enviar.
        reenganche_pendiente: vivos ? {
          frenados_por_la_puerta: enCola.filter((c) => !conSenal(c) && !(c.attributes || {})[REENGANCHE.marcador]).length,
          ya_gastados_antes_de_la_puerta: yaRecibieronOferta.filter((c) => !conSenal(c) && !(c.attributes || {})[REENGANCHE.marcador]).length,
        } : null,
      });
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
    // El re-enganche se puede apagar solo: si está OFF, la puerta igual retiene la oferta (que es
    // lo que evita el gasto) pero no manda nada en su lugar.
    // Además de la flag, tiene fecha de arranque y tope diario propio (ver REENGANCHE).
    const hoyISO = todayISO();
    const reengancheEnFecha = hoyISO >= REENGANCHE.desde;
    const reenganicheEnabled = process.env.REENGANCHE_ENABLED === '1' && reengancheEnFecha;

    // Quiénes ya abrieron la oferta: no se les reenvía. Si Brevo no contesta, `null` → esta
    // corrida no encola ningún reenvío (mejor perder un día que insistirle a quien ya la vio).
    let abrieronOferta = null;
    if (reenvioEnabled) {
      try { abrieronOferta = await abrieronOfertaSet(); }
      catch (e) { console.error('[wa-funnel] aperturas de la oferta:', e && e.message || e); }
    }

    // La puerta de enganche: quién dio señal de vida alguna vez (ver REENGANCHE más arriba).
    // Si queda en null la puerta NO se aplica y la oferta sale como antes — se avisa en el
    // resultado de la corrida (`puerta_enganche`) para que no falle en silencio.
    // Nace encendida (es el arreglo, no un experimento). PUERTA_ENGANCHE=0 en Vercel la apaga
    // sin redeployar: si algún día el set de aperturas viniera raro, ese es el botón de vuelta.
    let enganchados = null;
    let enganchePorQue = 'ok';
    if (process.env.PUERTA_ENGANCHE === '0') {
      enganchePorQue = 'apagada a mano (PUERTA_ENGANCHE=0)';
    } else {
      try {
        enganchados = await abrieronAlgoSet();
        if (!enganchados) enganchePorQue = 'Brevo devolvió 0 eventos — puerta desactivada esta corrida';
      } catch (e) {
        enganchePorQue = 'falló la consulta de aperturas: ' + (e && e.message || e);
        console.error('[wa-funnel] puerta de enganche:', enganchePorQue);
      }
    }

    // Los que ya compraron no reciben más regalos ni la oferta.
    const compradores = await ventasEmailsSet();

    const hoy = todayISO();
    // Respaldo del marcador: a quién se le mandó qué de verdad, según el registro por persona.
    const registroEnvios = await enviadosSegunRegistro();
    // Qué piezas están habilitadas por flag. Una apagada se saltea (no bloquea a las de atrás).
    const piezasHabilitadas = new Set([
      ...(regalosEmailEnabled ? ['regalos'] : []),
      ...(mail5Enabled ? ['mail5'] : []),
      ...(mailOfertaEnabled ? ['oferta'] : []),
    ]);

    // Cupo de re-enganche que queda HOY. Se cuenta sobre el marcador ya escrito en Brevo —no sobre
    // lo que lleve esta corrida— para que las corridas encadenadas compartan un solo tope en vez
    // de gastarse `capDia` cada una.
    const reenganchesHoy = contacts.filter((c) => mismoDia((c.attributes || {})[REENGANCHE.marcador], hoy)).length;
    let cupoReenganche = Math.max(0, REENGANCHE.capDia - reenganchesHoy);

    const plan = [];
    for (const c of contacts) {
      const emailLc = String(c.email || '').toLowerCase().trim();
      if (emailLc && compradores.has(emailLc)) continue; // ya compró → fuera del funnel
      // Bloqueado en Brevo (rebote duro, queja de spam o baja): Brevo NO le entrega, así que el
      // envío falla, el marcador no se escribe y el lead vuelve a la cola mañana. Y pasado. Para
      // siempre. Con ~5% de rebote sobre 2.000 mails eso son ~100 direcciones muertas que se
      // comen el presupuesto de cada corrida hasta frenar el embudo entero — y además dejarían
      // `total_faltante` clavado sin llegar nunca a cero. Se saltean acá, de una.
      if (c.emailBlacklisted) continue;
      const attrs = c.attributes || {};
      const stageSent = Number(attrs.WA_STAGE || 0);
      const daysOld = Math.floor((now - new Date(c.createdAt).getTime()) / DAY);
      const lastAt = attrs.WA_SENT_AT ? new Date(attrs.WA_SENT_AT).getTime() : 0;
      const daysSinceLast = lastAt ? Math.floor((now - lastAt) / DAY) : 999;

      // Lo que le falta por EMAIL: Regalo 3 → 4 → 5 → oferta, uno por día y en orden.
      let pieza = piezaFaltante(attrs, daysOld, hoy, piezasHabilitadas, emailLc, registroEnvios);

      // LA PUERTA. Si lo que le toca es la OFERTA y nunca dio señal de vida, no se le manda: la
      // oferta queda esperando (sin marcador, así que le sale sola en cuanto abra algo) y en su
      // lugar se encola el re-enganche, una única vez. Las demás piezas no se tocan — los regalos
      // son los que crean el enganche, cortarlos sería cerrar la puerta desde adentro.
      let frenadoPorPuerta = false;
      if (pieza && pieza.send === 'mailoferta' && enganchados && !enganchados.has(emailLc)) {
        frenadoPorPuerta = true;
        pieza = null;
      }
      if (pieza) {
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: pieza.send, pieza });
      }

      // Re-enganche. Va a los que no dan señal de vida, en los DOS casos que existen:
      //   a) los que la puerta acaba de frenar (todavía no recibieron la oferta), y
      //   b) los 336 que YA la recibieron a ciegas antes de que la puerta existiera — que son
      //      justamente la cohorte que motivó todo esto. Sin este segundo caso, el arreglo sólo
      //      valdría para los leads futuros y dejaría afuera a los que ya pagamos por traer.
      const sinSenal = !!enganchados && !enganchados.has(emailLc);
      const yaRecibioLaOferta = !!attrs.OFERTA_MAIL_AT;
      const tocaReenganche = reenganicheEnabled && sinSenal && (frenadoPorPuerta || yaRecibioLaOferta)
        && !pieza                                    // si hoy le toca una pieza del embudo, esa manda
        && !mismoDia(attrs.WA_SENT_AT, hoy)          // uno por persona por día
        && daysSinceLast >= REENGANCHE.minDiasDesdeUltimoToque
        && !attrs[REENGANCHE.marcador]
        && !(registroEnvios && registroEnvios.has(`${emailLc}|${REENGANCHE.tag}`));
      if (tocaReenganche && cupoReenganche > 0) {
        plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: 'reenganche' });
        cupoReenganche--;
      }

      // Reenvío de la oferta: pasaron 48 h desde que se la mandamos, no la abrió, y todavía no
      // se le reenvió. (Los compradores ya quedaron afuera arriba.) No es una pieza del embudo
      // sino un empujón, así que cede el turno: si hoy le toca una pieza, el reenvío espera.
      // ⚠️ `!tocaReenganche` los vuelve excluyentes: al que no da NINGUNA señal de vida no se le
      // insiste con la oferta por segunda vez —es la misma venta al mismo buzón muerto—, se le
      // manda el re-enganche. El reenvío queda para quien sí abre cosas pero no abrió ésta.
      if (abrieronOferta && attrs.OFERTA_MAIL_AT && !attrs[OFERTA_REENVIO.marcador] && !pieza && !tocaReenganche && !mismoDia(attrs.WA_SENT_AT, hoy)) {
        const horas = (now - new Date(attrs.OFERTA_MAIL_AT).getTime()) / 3600000;
        if (horas >= OFERTA_REENVIO.minHoras && !abrieronOferta.has(emailLc)) {
          plan.push({ channel: 'email', email: c.email, nombre: pickName(attrs), daysOld, stageSent, send: 'ofertareenvio' });
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
        const k = String(p.send || p.channel);
        desglose[k] = (desglose[k] || 0) + 1;
      }
      // Cuánto falta para que TODOS tengan TODO, pieza por pieza. Es la pregunta que el panel
      // de Campañas no podía contestar: no alcanza con "cuántos mails salieron hoy".
      const faltantes = {};
      for (const pz of PIEZAS) {
        faltantes[pz.send] = contacts.filter((c) => {
          const a = c.attributes || {};
          const e = String(c.email || '').toLowerCase().trim();
          if (a[pz.marcador]) return false;
          if (registroEnvios && registroEnvios.has(`${e}|${pz.tag}`)) return false;
          // Mismos descartes que el plan real: si no, este número nunca llega a cero y no hay
          // forma de saber si el embudo terminó de completarse o si se frenó.
          if (c.emailBlacklisted) return false;
          if (compradores.has(e)) return false;
          // Y desde el 07/08, el mismo descarte por la puerta: al que no da señal de vida la
          // oferta NO le falta, se le está reteniendo a propósito. Sin esto `total_faltante`
          // quedaría clavado en ~200 para siempre y parecería un embudo frenado.
          if (pz.send === 'mailoferta' && enganchados && !enganchados.has(e)) return false;
          return Math.floor((now - new Date(c.createdAt).getTime()) / DAY) >= pz.minDays;
        }).length;
      }
      // Los que la puerta retiene, contados aparte: no son deuda del embudo, son la decisión.
      const retenidosPorPuerta = enganchados ? contacts.filter((c) => {
        const a = c.attributes || {};
        const e = String(c.email || '').toLowerCase().trim();
        if (a.OFERTA_MAIL_AT || c.emailBlacklisted || compradores.has(e)) return false;
        if (enganchados.has(e)) return false;
        return Math.floor((now - new Date(c.createdAt).getTime()) / DAY) >= 9;
      }).length : null;
      res.status(200).json({
        mode, live: false, enabled, canal: 'email (WhatsApp se sacó el 09/08/2026)',
        // Si acá dice que hay una corrida viva, cualquier llamada a live va a rebotar — y es lo
        // correcto. Se muestra en el ensayo para poder verlo ANTES de intentar mandar.
        candado: await candado.estado(LOCK, LOCK_TTL),
        piezas_habilitadas: [...piezasHabilitadas],
        // Si esto dice "NO DISPONIBLE", el cruce contra el registro de envíos no está actuando y
        // volvemos a depender sólo del marcador — que es como salieron 67 mails repetidos.
        registro_envios: registroEnvios ? `${registroEnvios.size} envíos conocidos` : 'NO DISPONIBLE (sólo marcadores)',
        // Si esto no dice "operativa", la oferta está saliendo sin filtro — como antes del 07/08.
        // Se muestra siempre para que la puerta no se caiga en silencio.
        puerta_enganche: enganchados
          ? `operativa — ${enganchados.size} con señal de vida en ${ENGANCHE_DIAS} días`
          : `INACTIVA (${enganchePorQue})`,
        contactos: contacts.length,
        le_falta_a: faltantes,
        total_faltante: Object.values(faltantes).reduce((a, b) => a + b, 0),
        // Esperando señal de vida para que les salga la oferta. NO cuenta como faltante.
        retenidos_por_la_puerta: retenidosPorPuerta,
        reenganche: {
          estado: process.env.REENGANCHE_ENABLED !== '1' ? 'apagado (REENGANCHE_ENABLED!=1)'
            : !reengancheEnFecha ? `programado: no sale antes del ${REENGANCHE.desde}`
            : 'activo',
          enviados_hoy: reenganchesHoy,
          cupo_del_dia: REENGANCHE.capDia,
          cupo_restante: cupoReenganche,
        },
        ya_tocados_hoy: contacts.filter((c) => mismoDia((c.attributes || {}).WA_SENT_AT, hoy)).length,
        would_send: plan.length, desglose, plan: plan.slice(0, 100),
      });
      return;
    }

    // --- live --- Presupuesto de TIEMPO en vez de un tope fijo. Antes cortábamos en 40 leads
    // por corrida: con un backlog grande eso dejaba a los leads nuevos afuera (nunca entraban al
    // embudo) y la cola sólo crecía. Ahora procesamos en orden de prioridad hasta agotar ~45 s
    // (la función corta a los 60 s → queda margen para el reporte y los logs). Así una sola
    // corrida despacha TODO lo que entre en el tiempo, sin timeout. HARD_MAX es un tope de
    // seguridad anti-runaway por si los envíos fueran muy rápidos.
    // 30 s, no 45: con 45 la corrida llena (arranque + envíos) llegaba al tope de 60 s de Vercel
    // y MORÍA ANTES de disparar la corrida siguiente. El encadenado sólo funcionaba cuando no
    // hacía falta. Con 30 s sobra margen y la cadena avanza siempre.
    // ⚠️ 16/08/2026 — EL LÍMITE DE 60 s NUNCA FUE DEL PLAN, ERA NUESTRO. La documentación de
    // Vercel dice que el plan gratuito permite funciones de 300 s (5 minutos); el 60 estaba
    // escrito a mano en `vercel.json`, heredado de cuando ese sí era el tope. Comprobado: se
    // deployó con `maxDuration: 300` y la plataforma lo aceptó.
    //
    // LO QUE ESTO SIGNIFICA. Todo el aparato del auto-encadenado —la hija, el candado que se
    // pasa de mano en mano, los segundos contados, las alarmas para vigilarlo— existe SÓLO
    // porque una corrida no podía durar más de 60 s. Con 300 s una sola corrida despacha ~750
    // mails y la cadena deja de hacer falta para el volumen de hoy.
    // No se borra el encadenado todavía: queda de red por si un día la cola supera eso. Pero
    // pasa de ser el mecanismo principal a ser el respaldo.
    const BUDGET_MS = 280000;
    // TOPE DURO MEDIDO DESDE EL ARRANQUE DE LA FUNCIÓN (12/08/2026). Vercel corta a los 60 s sin
    // ejecutar ningún `catch`: la corrida muere muda, no suelta el candado y —lo más caro— NO
    // llega a la línea que dispara la corrida siguiente, así que se corta la cadena entera.
    //
    // Pasó el 11/08: primer mail a las 15:00:47, último a las 15:01:15. El bucle usó sus 30 s
    // completos y el arranque se había comido los otros ~32. Total: 60 s justos. Salieron 63
    // mails de 237 y no hubo segunda corrida.
    //
    // `BUDGET_MS` no podía verlo venir porque se mide desde que empieza el envío. Esta línea sí:
    // pase lo que pase, el bucle suelta el turno a los 46 s de haber arrancado la función y deja
    // 14 s para encadenar, cerrar el log y contestar. Es el arreglo de fondo del comentario de
    // acá arriba, que bajó el presupuesto de 45 a 30 s por este mismo problema: eso compró
    // margen sin eliminar la falla, y el margen se volvió a consumir solo.
    //
    // 13/08: subido de 46 a 48 s. Medido en la corrida real de ese día: arranque 7,1 s, bucle
    // 30,8 s, cierre inmediato → 38 s de 60. Sobraban 22. Con 48 s el bucle manda ~41 s en vez
    // de 30 (+37%) y quedan ~9 s para encadenar, verificar y cerrar el log.
    //
    // 14/08: BAJADO de 48 a 38 s, y es una corrección de rumbo. Con 48 el bucle terminaba pasado
    // el segundo 52 —el corte no es exacto: la última pieza en vuelo se pasa unos segundos— y el
    // tope de reintentos de abajo daba por perdida la cadena SIN disparar ni una vez. Resultado
    // medido el 14/08: 61 mails en una sola corrida, 116 re-enganches sin mandar, candado tomado
    // a las 15:07:53 y jamás renovado. Ninguna hija.
    // El canje es a favor: una corrida gorda que no encadena manda ~90 mails y se apaga; una
    // corrida más flaca que SÍ encadena manda eso doce veces. El volumen lo da la cadena, no el
    // tamaño del eslabón. Con 38 s quedan ~20 s de sobra para disparar, comprobar y cerrar.
    // 16/08: de 38 s a 280. La función ahora puede durar 300 (ver BUDGET_MS): el bucle suelta el
    // turno a los 280 y quedan 20 s para encadenar —si hiciera falta—, cerrar el log y contestar.
    const DEADLINE = T_INICIO + 280000;
    // 16/08: de 220 a 1.200, por el mismo motivo que los 60 s. Era un tope anti-desbocado puesto
    // cuando una corrida duraba 45 s y no llegaba ni cerca — o sea, no frenaba nada. Con 280 s de
    // bucle una corrida puede despachar ~600, así que 220 pasó a ser EL techo real sin que nadie
    // lo decidiera: el mismo patrón que el límite de 60 s heredado del plan viejo.
    // Sigue siendo un backstop de verdad (si algo se desboca, corta), pero deja de ser el freno.
    // Quien manda el volumen son los topes del DÍA y el tiempo, que sí se eligieron a propósito.
    const HARD_MAX = 1200;
    // Tope del DÍA (no de la corrida) para las piezas del embudo. Con ~900 leads a los que les
    // falta algo, esto define en cuántos días se completa: a 500/día, ~6 días.
    const CAP_PIEZAS_DIA = parseInt(process.env.PIEZAS_CAP_DIA || '500', 10);
    const REENVIO_CAP = 80;  // Reenvío de la oferta a los que no la abrieron (también por día)
    // Tope manual para la PRIMERA corrida de algo nuevo (?max=2): deja verificar el camino
    // completo —envío, avance de etapa y marcador— con dos personas reales en vez de
    // descubrir un problema recién cuando ya salieron cientos. Sin el parámetro no limita nada.
    const MAX_MANUAL = parseInt(searchParams.get('max') || '0', 10) || 0;
    const t0 = Date.now();
    const results = [];
    let attempted = 0;

    // UNA sola cola de piezas, no una por tipo de mail. Cuando cada paso tenía su tope propio y
    // se concatenaban en orden fijo, el último de la fila no llegaba a salir nunca: el reenvío de
    // la oferta se comía 38 de los 45 segundos y el Regalo 4, que iba detrás, no salió ni una vez
    // en un mes. Ahora hay una cola sola, ordenada por cercanía a la compra.
    // Los topes son del DÍA, no de la corrida: se cuenta a cuánta gente ya se le mandó algo hoy
    // (WA_SENT_AT). Sin esto, 13 corridas encadenadas repartirían 13 veces el mismo tope.
    const yaTocadosHoy = contacts.filter((c) => mismoDia((c.attributes || {}).WA_SENT_AT, hoy)).length;
    const yaReenviadosHoy = contacts.filter((c) => mismoDia((c.attributes || {})[OFERTA_REENVIO.marcador], hoy)).length;

    // Primero el que está MÁS CERCA de la compra: oferta → Regalo 5 → 4 → 3. Antes la cola salía
    // en el orden en que Brevo devuelve la lista (del más nuevo al más viejo) y por eso el
    // Regalo 4 quedaba siempre último: entraban 11 Regalos 3 y se acababa el tiempo justo antes.
    const ordenPieza = (p) => PIEZAS.findIndex((x) => x.send === p.pieza.send);
    const piezasQueue = plan
      .filter((p) => p.pieza)
      .sort((a, b) => ordenPieza(b) - ordenPieza(a))
      .slice(0, Math.max(0, CAP_PIEZAS_DIA - yaTocadosHoy));
    const reenvioQueue = plan.filter((p) => p.send === 'ofertareenvio').slice(0, Math.max(0, REENVIO_CAP - yaReenviadosHoy));
    // ⚠️ EL RE-ENGANCHE TIENE QUE ESTAR ACÁ. Desde que se encendió (08/08) hasta el 10/08 se
    // planificaba y no se despachaba NUNCA: 575 personas esperando y cero enviados. La cola
    // eran sólo las dos de arriba, y una entrada de re-enganche no entra en ninguna — no tiene
    // `pieza` (así que se cae de piezasQueue) y su `send` es 'reenganche', no 'ofertareenvio'.
    // El bug era invisible leyendo el bucle: ahí abajo SÍ existe la rama `send === 'reenganche'`,
    // completa y correcta, sólo que nada llegaba hasta ella. Código muerto con aspecto de vivo.
    // LECCIÓN: al agregar un tipo de envío nuevo, la rama que lo manda no alcanza — hay que
    // sumarlo a `queue`, que es la única puerta de salida. Si no aparece acá, no existe.
    // El tope diario ya está aplicado arriba (cupoReenganche, contado sobre el marcador ya
    // escrito en Brevo), así que no se vuelve a recortar. Va último, igual que dice prioridad().
    const reengancheQueue = plan.filter((p) => p.send === 'reenganche');

    // ⚠️ CUPO GARANTIZADO POR TIPO (12/08/2026). Estar en `queue` no alcanza: hay que llegar a
    // tiempo. El re-enganche entró a la cola el 10/08 y aun así salió 0 el 10, el 11 y el 12 —
    // 150 planificados cada día— porque va último y el bucle se corta antes de llegar a él.
    //
    // El orden por prioridad NO está mal: la oferta tiene que ir primero, está más cerca de la
    // compra. Lo que está mal es que el último de la fila dependa de que sobre tiempo, porque no
    // sobra nunca. Es exactamente lo que dejó al Regalo 4 sin salir en todo julio, y lo que la
    // nota de la cola única de acá arriba creyó haber arreglado.
    //
    // Cada tipo entra con CUPO_GARANTIZADO lugares AL FRENTE; el resto sigue por prioridad. A
    // ~2,5 mails por segundo (medido: 77 mails en 30 s el 12/08), la cabeza completa —3 tipos ×
    // 15— sale en ~18 s y entra cómoda en cualquier corrida, incluso en una sola.
    // LECCIÓN, la misma de siempre en este archivo: una pieza que sólo sale si sobra tiempo es
    // una pieza que no sale.
    const CUPO_GARANTIZADO = 15;
    const grupos = [piezasQueue, reenvioQueue, reengancheQueue];
    const queue = [
      ...grupos.flatMap((g) => g.slice(0, CUPO_GARANTIZADO)),
      ...grupos.flatMap((g) => g.slice(CUPO_GARANTIZADO)),
    ];
    // Por qué dejó de mandar. Sin esto, "se vació la cola" y "se acabó el tiempo" se ven igual
    // desde afuera, que es la mitad del problema de los últimos dos meses.
    let motivoCorte = '';
    for (const p of queue) {
      if (attempted >= HARD_MAX) { motivoCorte = `tope de seguridad (${HARD_MAX} por corrida)`; break; }
      if (Date.now() - t0 > BUDGET_MS) { motivoCorte = `presupuesto del bucle (${BUDGET_MS / 1000} s)`; break; }
      if (Date.now() > DEADLINE) { motivoCorte = 'límite de 60 s de Vercel: el arranque se comió el tiempo'; break; }
      if (MAX_MANUAL && attempted >= MAX_MANUAL) { motivoCorte = `tope manual ?max=${MAX_MANUAL}`; break; }
      attempted++;
      {
        // Reenvío de la oferta: no toca la etapa (el lead ya terminó el recorrido), sólo su marcador.
        if (p.send === 'ofertareenvio') {
          if (!reenvioEnabled) { results.push({ email: p.email, skipped: 'MAILOFERTA2_ENABLED!=1 (reenvío apagado)' }); continue; }
          const reserva = { marcador: OFERTA_REENVIO.marcador, stage: null };
          const ok = await reservar(p, reserva, results);
          if (!ok) continue;
          const sent = await enviarReenvioOferta(p.email, p.nombre);
          if (sent.ok) results.push({ email: p.email, sent: 'ofertareenvio' });
          else await fallo(p, reserva, sent, results);
          console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'ofertareenvio', ok: sent.ok }));
          continue;
        }
        // Re-enganche: tampoco toca la etapa. El lead sigue debiendo la oferta a propósito —
        // sin marcador OFERTA_MAIL_AT, así que en cuanto abra algo la oferta le sale sola.
        if (p.send === 'reenganche') {
          const reserva = { marcador: REENGANCHE.marcador, stage: null };
          const ok = await reservar(p, reserva, results);
          if (!ok) continue;
          const sent = await enviarReenganche(p.email, p.nombre);
          if (sent.ok) results.push({ email: p.email, sent: 'reenganche' });
          else await fallo(p, reserva, sent, results);
          console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: 'reenganche', ok: sent.ok }));
          continue;
        }
        // La pieza que le faltaba. Primero se RESERVA en Brevo (marcador propio + toque del día
        // + etapa si corresponde) y recién después se manda: mientras el marcador se escribía al
        // volver del envío, otra corrida podía leer a esta persona como pendiente en el medio.
        const ok = await reservar(p, p.pieza, results);
        if (!ok) continue;
        const sent = await enviarPieza(p.pieza, p.email, p.nombre);
        if (sent.ok) results.push({ email: p.email, sent: p.send, stage: p.pieza.stage || null });
        else await fallo(p, p.pieza, sent, results);
        console.log(JSON.stringify({ type: 'wa_funnel', email: p.email, stage: p.send, ok: sent.ok }));
        continue;
      }
    }
    if (!motivoCorte) motivoCorte = 'cola vacía: se despachó todo lo que había';

    // LAS TRES COLUMNAS DEL LOG. Es la misma pregunta en tres momentos: qué había que mandar,
    // qué salió, y qué quedó. `sin_mandar` se calcula como la resta y no como "lo que sobró en
    // la cola" a propósito: así incluye tanto lo que el bucle no alcanzó a intentar como lo que
    // los topes diarios sacaron antes de encolar. Lo que importa es que no salió, no por dónde
    // se cayó.
    const planificadoPorTipo = contarPorTipo(plan);
    const enviadoPorTipo = contarPorTipo(results.filter((x) => x.sent !== undefined));
    const sinMandarPorTipo = {};
    for (const [k, v] of Object.entries(planificadoPorTipo)) {
      const falta = v - (enviadoPorTipo[k] || 0);
      if (falta > 0) sinMandarPorTipo[k] = falta;
    }

    // En la corrida automática del cron, mandar además el reporte diario por email.
    let report = null;
    // Reporte individual del funnel: APAGADO por default (lo cubre el Panel de Salud unificado).
    // Se puede reactivar con REPORTE_FUNNEL_INDIVIDUAL=1 (trae el diagnóstico con datos de la corrida).
    if (mode === 'cron' && process.env.REPORTE_FUNNEL_INDIVIDUAL === '1') {
      // Datos de ESTA corrida para el diagnóstico interpretado del reporte.
      // Por PIEZA, no por canal: desde el 01/08 el embudo se mide por lo que le falta a cada
      // lead (los marcadores de email), no por la etapa que dejó un WhatsApp que no entregó.
      const planWA = (s) => plan.filter((p) => p.send === s).length;
      const sentWA = (s) => results.filter((x) => x.sent === s).length;
      const etapaRow = (label, fuente, debido, enviado, apagado) => ({ label, fuente, debido, enviado, cola: Math.max(0, debido - enviado), apagado: !!apagado });
      const runInfo = {
        due_oferta: planWA('mailoferta'),
        sent_oferta: sentWA('mailoferta'),
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
          etapaRow('🎁 Regalo 3 (día 5 · entrada)', 'nuevos', planWA('regalo3'), sentWA('regalo3'), !regalosEmailEnabled),
          etapaRow('🎁 Regalo 4 (día 7)', 'previos', planWA('regalo4'), sentWA('regalo4'), !regalosEmailEnabled),
          etapaRow('📧 Regalo 5 (email · día 8)', 'previos', planWA('mail5'), sentWA('mail5'), !mail5Enabled),
          etapaRow('💰 Oferta (día 9)', 'previos', planWA('mailoferta'), sentWA('mailoferta'), !mailOfertaEnabled),
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
    // 12 (13 corridas de ~40 s ≈ 9 minutos en total). Antes eran 3 corridas ≈ 200 mails/día,
    // contra una cola de ~2.700: la cola crecía más rápido de lo que se vaciaba. El tope real
    // de volumen ya no lo pone esto sino CAP_PIEZAS_DIA — la cadena se frena sola al agotarlo.
    const MAX_CHAINS = 12;
    const remaining = plan.length - attempted;
    // ENCADENA SEGÚN LO QUE QUEDÓ EN LA COLA, no según el plan entero (12/08/2026). `plan`
    // incluye lo que los topes del día ya descartaron, y eso no lo va a mandar ninguna corrida
    // siguiente: el tope vuelve a cortarlo igual. Comparando contra `plan.length`, la cadena
    // disparaba sus 12 eslabones aunque no quedara nada por hacer, y cada uno paga el arranque
    // completo —Brevo, la puerta, el registro— para no mandar nada.
    const enCola = Math.max(0, queue.length - attempted);
    const encadena = live && enCola > 0 && chain < MAX_CHAINS;
    // Qué pasó con la corrida siguiente. Hasta hoy esto no se sabía: la respuesta decía
    // `encadenada: true` cuando la madre había DISPARADO, no cuando la hija había arrancado.
    let hija = encadena ? 'sin disparar todavía' : 'no corresponde: último eslabón';
    if (encadena) {
      // ⚠️ EL DOMINIO VA FIJO, NO SALE DE LA CABECERA (16/08/2026). Ésta era LA causa de que la
      // cadena no arrancara nunca sola, y de que sí arrancara siempre que la probaba a mano.
      //
      // MEDIDO: el dominio público contesta 200 con JSON; la URL del deployment contesta 302 a la
      // pantalla de login de Vercel. La madre armaba la dirección de la hija copiando el host que
      // le llegaba en la cabecera — que cuando invoca el cron de Vercel es la del deployment. La
      // hija se chocaba con el login y no se ejecutaba jamás.
      //
      // Por eso la prueba a mano SIEMPRE daba bien y el cron SIEMPRE fallaba: la única diferencia
      // entre las dos era quién había puesto esa cabecera. Dos días de corridas automáticas
      // (15 y 16/08) con `hija: NO ARRANCÓ tras 3 intentos` y 81 y 38 re-enganches sin salir.
      //
      // LECCIÓN: una función que se llama a sí misma no puede deducir su propia dirección de lo
      // que le manda quien la llamó. Tiene que saberla.
      const HOST_PROPIO = 'sistemadeingresosdiariosia.com';
      const host = HOST_PROPIO;
      // El `max` se arrastra a la hija. Sin esto, una corrida de prueba con tope disparaba una
      // hija SIN tope y salía la cola entera: pasó el 28/07 al estrenar los Regalos 3/4 por email.
      // Y el `lock`: la hija sigue la MISMA cadena, así que renueva este candado en vez de pedir
      // uno nuevo (que estaría tomado por nosotros y la haría frenar en seco).
      const selfUrl = `https://${host}/api/wa-funnel?mode=live&chain=${chain + 1}${MAX_MANUAL ? `&max=${MAX_MANUAL}` : ''}${lockToken ? `&lock=${encodeURIComponent(lockToken)}` : ''}&key=${encodeURIComponent(secret)}`;

      // ─── QUE LA HIJA ARRANQUE DE VERDAD (13/08/2026) ─────────────────────────────────────
      //
      // EL DATO. El 13/08 la corrida del cron mandó 70 mails, dijo `encadena: true` y la hija
      // NUNCA escribió su fila en el log. Como hasta una corrida bloqueada deja fila, eso sólo
      // puede significar que no llegó a arrancar. Explica la serie de la semana: 968 → 384 → 63
      // → 70. No es que baje el volumen: es que la cadena se corta en el primer eslabón.
      //
      // LA CAUSA. Se disparaba UNA vez y se abandonaba a los 3 s, dando por hecho que Vercel ya
      // la había puesto en marcha. Con la función fría, 3 s no alcanzan: se cancela el socket
      // mientras la invocación todavía está en el ruteo, y la hija muere antes de nacer.
      //
      // EL ARREGLO. Se dispara hasta TRES veces. Es seguro porque el candado ahora rota su token
      // (ver `candado.pasar`): la primera hija que arranca se lo lleva, y cualquier otra que
      // llegue con el token viejo queda bloqueada y no manda nada — deja su fila diciéndolo.
      // Sin esa rotación esto sería el incidente del 07/08 otra vez, no un arreglo.
      //
      // Y SE COMPRUEBA. Que el token haya cambiado ES la prueba de vida: sólo puede cambiarlo
      // una hija que arrancó. Si después de tres intentos sigue siendo el nuestro, la cadena se
      // cortó acá — y eso ahora se avisa, en vez de quedar en un `encadena: true` que miente.
      // ⚠️ EL PRIMER DISPARO SALE SIEMPRE, aunque no quede tiempo (corregido el 14/08). El tope de
      // 52 s se aplicaba también al primero, así que una corrida que terminaba tarde no disparaba
      // NADA y mataba la cadena entera por ahorrarse 2,5 s. Pasó el 14/08 en la primera corrida
      // automática: 61 mails, 116 re-enganches sin salir, y el candado tomado a las 15:07:53 sin
      // renovar una sola vez. El seguro se había vuelto el freno.
      // Disparar es barato y es lo único que mantiene viva la cadena. Lo caro —y lo prescindible
      // cuando el reloj aprieta— es COMPROBAR que arrancó y REINTENTAR.
      for (let intento = 1; intento <= 3; intento++) {
        const sinTiempo = Date.now() > T_INICIO + 52000;
        if (sinTiempo && intento > 1) { hija = `disparada ${intento - 1}× — sin tiempo para reintentar`; break; }
        try { await fetch(selfUrl, { signal: AbortSignal.timeout(2500) }); } catch (_) { /* abort esperado */ }
        if (sinTiempo) { hija = 'disparada 1× — sin tiempo para comprobar si arrancó'; break; }
        const ahora = await candado.dueno(LOCK);
        if (ahora === undefined) { hija = `disparada ${intento}× (no se pudo verificar: Supabase no contestó)`; break; }
        if (ahora !== lockToken) { hija = `arrancó (intento ${intento})`; break; }
        hija = `NO ARRANCÓ tras ${intento} intento(s)`;
      }
    } else {
      // No hay hija: la cadena termina acá y el candado tiene que quedar libre ya, no en 4 minutos.
      await soltarCandado();
    }

    // Alarma de volumen (ver avisarSiVolumenAlto). Va después de soltar el candado a propósito:
    // es un aviso, no puede demorar la liberación ni romper la corrida si Telegram no contesta.
    // El try no es decorativo: si esto tirara, el catch de abajo soltaría un candado que en este
    // punto ya puede ser de la corrida hija, y la cadena se cortaría por un problema de Telegram.
    const enviadosOk = results.filter((x) => x.sent !== undefined).length;
    let alarma;
    try { alarma = await avisarSiVolumenAlto(yaTocadosHoy + enviadosOk, hoy); }
    catch (e) { alarma = `no se pudo evaluar (${e && e.message || e})`; }

    // El aviso por lo que FALTÓ, no por lo que sobró. Sólo en el último eslabón: en los del
    // medio que quede cola es lo normal y esperado —para eso encadena—, avisar ahí sería ruido
    // trece veces por día, que es la forma más rápida de que Jose empiece a ignorar los avisos.
    //
    // 13/08: también avisa cuando LA CADENA SE CORTA. La versión de ayer sólo sonaba en el
    // último eslabón, y el primer día en producción falló justo por eso: la hija no arrancó, no
    // hubo último eslabón, quedaron 97 mails sin salir y no sonó nada. Un aviso que depende de
    // que el sistema termine bien no sirve para avisar que el sistema no terminó bien.
    // 14/08: se avisa siempre que la cadena TENÍA que seguir y no hay confirmación de que siguió.
    // Antes sólo contemplaba el caso "la disparé y no arrancó", y el día que falló de verdad fue
    // por otro camino —ni siquiera llegó a dispararla—, así que no sonó nada mientras 116 mails
    // se quedaban sin salir. Una alarma que enumera las formas de fallar sólo cubre las que
    // alguien imaginó; ésta pregunta al revés: ¿hay prueba de que siguió? Si no, avisa.
    const cadenaCortada = encadena && !String(hija).startsWith('arrancó');
    let alarmaFaltante = null;
    if (!encadena || cadenaCortada) {
      try { alarmaFaltante = await avisarSiFaltoMandar(sinMandarPorTipo, hoy, cadenaCortada); }
      catch (e) { alarmaFaltante = `no se pudo evaluar (${e && e.message || e})`; }
    }

    // Cerrar la fila del log. Va acá, después de encadenar y de las alarmas, para que quede
    // registrado si disparó la corrida siguiente — el dato que faltaba para saber en qué
    // eslabón se corta la cadena.
    await cerrarCorrida(corridaId, {
      estado: 'termino',
      arranque_ms: t0 - T_INICIO,
      bucle_ms: Date.now() - t0,
      motivo_corte: motivoCorte,
      planificado: planificadoPorTipo,
      enviado: enviadoPorTipo,
      sin_intentar: sinMandarPorTipo,
      encadena,
      hija,
      candado: candadoInfo,
    });

    res.status(200).json({
      mode, chain, live: true, due_total: plan.length, attempted, remaining,
      candado: candadoInfo,
      // Qué cortó el envío y qué quedó sin salir. Antes esto no existía en ningún lado: una
      // corrida que despachaba 63 de 237 devolvía exactamente el mismo 200 que una que
      // despachaba todo.
      motivo_corte: motivoCorte,
      arranque_ms: t0 - T_INICIO, bucle_ms: Date.now() - t0,
      planificado: planificadoPorTipo, enviado: enviadoPorTipo, sin_mandar: sinMandarPorTipo,
      alarma_faltante: alarmaFaltante,
      puerta_enganche: enganchados ? `operativa — ${enganchados.size} con señal de vida` : `INACTIVA (${enganchePorQue})`,
      mails_del_embudo_hoy: yaTocadosHoy + enviadosOk,
      alarma_volumen: alarma,
      // `encadenada` decía que la madre había DISPARADO, no que la hija hubiera arrancado — y esa
      // diferencia se comió la mitad de los mails de la semana. `hija` dice lo segundo.
      encadenada: encadena, hija, report: report ? report.ok : null, results,
    });
  } catch (e) {
    console.error('wa-funnel error', e);
    // Cerrar la fila ANTES de soltar el candado: si esto quedara abierto, una corrida que
    // reventó se vería igual que una que murió por timeout, y son dos problemas distintos.
    try { await cerrarCorrida(corridaId, { estado: 'error', error: String(e && e.message || e) }); } catch (_) { /* best-effort */ }
    try { await soltarCandado(); } catch (_) { /* ya se hizo lo que se podía */ }
    res.status(500).json({ error: String(e && e.message || e) });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO DEL EMBUDO — para que la página de Campañas de Leadr pueda mostrar
// qué dice cada mensaje sin que nadie tenga que abrir Brevo ni este archivo.
//
// El original de cada mail sigue siendo el de acá arriba: esto no es una copia
// paralela, es la MISMA definición expuesta con nombre. El script
// `ads-agent/scripts/datos/sync-embudo-contenido.mjs` la lee y la guarda en
// funnel_steps (columnas contenido_*). Si se edita un copy, se vuelve a correr
// el script y la página queda al día — no hay que tocar la base a mano.
//
// Los mails que NO salen de este archivo (Regalo 1 y la guía de republicadores
// salen de Make; el Regalo 2 es una plantilla de Brevo) los resuelve el script.
//
// Es una FUNCIÓN y no una constante a propósito: este archivo es el cron del
// embudo y arranca en frío muchas veces por día. Armar cinco mails en HTML al
// cargar el módulo sería trabajo que nadie pidió — y una forma de romper el
// envío desde un lugar que no tiene nada que ver con enviar.
// ─────────────────────────────────────────────────────────────────────────────
export function contenidoEmbudo() {
  // El pie lleva `%%BAJA%%`, que en un envío real se reemplaza por el link firmado de esa
  // persona. Acá no hay destinatario: se apunta al sitio para que el panel muestre el pie
  // completo sin exhibir un link de baja que dé de baja a nadie.
  const sinDestinatario = (p) => ({ ...p, html: String(p.html).split('%%BAJA%%').join('https://sistemadeingresosdiariosia.com/') });
  return [
    {
      tag: 'regalo3-periodico',
      subject: REGALOS_EMAIL[3].subject,
      ...sinDestinatario(armarEmailRegalo(REGALOS_EMAIL[3])),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#REGALOS_EMAIL[3]',
    },
    {
      tag: 'regalo4-pilares',
      subject: REGALOS_EMAIL[4].subject,
      ...sinDestinatario(armarEmailRegalo(REGALOS_EMAIL[4])),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#REGALOS_EMAIL[4]',
    },
    {
      tag: MAIL5_TAG,
      subject: MAIL5.subject,
      ...sinDestinatario({ html: MAIL5.html, text: MAIL5.text }),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#MAIL5',
    },
    {
      tag: MAILOFERTA_TAG,
      subject: MAILOFERTA.subject,
      ...sinDestinatario({ html: MAILOFERTA.html, text: MAILOFERTA.text }),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#MAILOFERTA',
    },
     {
      tag: OFERTA_REENVIO.tag,
      subject: OFERTA_REENVIO.subject,
      ...sinDestinatario(armarEmailSimple(OFERTA_REENVIO)),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#OFERTA_REENVIO',
    },
    {
      tag: REENGANCHE.tag,
      subject: REENGANCHE.subject,
      ...sinDestinatario(armarEmailSimple(REENGANCHE)),
      fuente: 'codigo:sistema-ingresos/api/wa-funnel.js#REENGANCHE',
    },
  ];
}
