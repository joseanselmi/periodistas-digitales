// Motor de recuperación de clientes potenciales (carritos abandonados + pagos
// rechazados). Tarjeta Trello #34. Canal: WhatsApp, con FALLBACK A EMAIL cuando el
// cliente potencial no dejó teléfono (así ninguno queda sin contactar — p. ej. un
// abandono de Hotmart que no capturó el número).
//
// ARQUITECTURA (decisión base de la #34, revisada 2026-07-02):
//   · 1er mensaje = INSTANTÁNEO, lo dispara el webhook de Hotmart (api/hotmart.js)
//     apenas Hotmart avisa el abandono/rechazo. Es lo más cercano posible al "momento
//     exacto" (Hotmart define cuándo nos notifica; nosotros reaccionamos al toque).
//   · Recordatorio (paso 2) = ESTE motor, que corre 1 vez/día por Vercel Cron y manda
//     el siguiente paso a quien corresponda. También actúa de RED DE SEGURIDAD: si el
//     envío instantáneo del webhook falló o la persona no tenía teléfono cuando entró,
//     el cron reintenta el paso 1.
//
// POR QUÉ WHATSAPP CON PLANTILLA: Meta exige plantilla aprobada para escribirle primero
// a alguien que no nos escribió (da igual que el texto sea fijo). Las 4 plantillas
// (recup_abandono_1/2, recup_rechazo_1/2) están en la WABA. El envío usa api/_lib/wa.js.
//
// FUENTE: tabla clientes_potenciales (Supabase periodistas-marketing), la llena el
// webhook de Hotmart. Estado por persona:
//   estado_recuperacion: pendiente → contactado → recuperado | perdido
//   paso_recuperacion:   0/1/2   (cuántos mensajes se mandaron)
//   ultimo_contacto_en:  timestamp del último mensaje (respeta un gap mínimo)
//   recuperado_en:       cuándo se detectó la compra (cruce con la tabla `ventas`)
//
// ANTI-ACOSO: antes de mandar, cruza el email con `ventas`. Si ya compró → recuperado y
// no se le escribe más (además mide cuántos recuperamos). Máximo 1 mensaje por persona
// por corrida. A quien ya está recuperado/perdido nunca se lo re-contacta.
//
// MODOS (?mode=): inspect | dry | stats | report | live. El cron (sin mode) equivale a
// live+report, pero si RECUP_ENABLED != 1 se degrada a dry (no manda nada).
// SEGURIDAD: CRON_SECRET (header Authorization: Bearer <secret> o ?key=<secret>).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY (reporte a Jose + emails
//      de recuperación cuando no hay teléfono), WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
//      CRON_SECRET, RECUP_ENABLED.

const { LINKS, TEMPLATES, normalizePhone, primerNombre, sendRecupTemplate } = require('./_lib/wa');
const { runHotmartSync } = require('./_lib/hotmart-sync');
const { runMetaSpendSync } = require('./_lib/meta-spend-sync');
const { runMetaDailySync } = require('./_lib/meta-daily-sync');
const { runMetaGastoSync } = require('./_lib/meta-gasto-sync');
const { runSyncEstados } = require('./_lib/sync-estados');
const { runVersionesSync } = require('./_lib/versiones-sync');
const { publicarStoryDelDia } = require('./_lib/story-diaria');

const BREVO = 'https://api.brevo.com/v3';
const HORA = 3600000;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// El reporte diario (interno, a Jose) va por email — no necesita aprobación de Meta.
const SENDER_EMAIL = 'jose@sistemadeingresosdiariosia.com';
const REPORTE_A = 'joseanselmi27@gmail.com';

// Espera mínima entre un mensaje y el siguiente (robustez ante corridas seguidas).
const MIN_GAP_HORAS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// SECUENCIAS por tipo. paso 1: minHoras 0 → el cron lo manda solo como fallback
// (normalmente ya lo mandó el webhook al instante). paso 2: al día siguiente.
// ─────────────────────────────────────────────────────────────────────────────
const SECUENCIAS = {
  carrito_abandonado: {
    perdidoTrasHoras: 24 + 96, // tras el paso 2, ~4 días sin compra → perdido
    pasos: [
      { paso: 1, minHoras: 0 },
      { paso: 2, minHoras: 24 },
    ],
  },
  pago_rechazado: {
    perdidoTrasHoras: 24 + 72,
    pasos: [
      { paso: 1, minHoras: 0 },
      { paso: 2, minHoras: 24 },
    ],
  },
};

function proximoPaso(seq, pasoEnviado, horasOld, horasDesdeUltimo) {
  for (const p of seq.pasos) {
    if (pasoEnviado < p.paso && horasOld >= p.minHoras) {
      if (pasoEnviado > 0 && horasDesdeUltimo < MIN_GAP_HORAS) return null;
      return p;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase (REST con service_role)
// ─────────────────────────────────────────────────────────────────────────────
function sbHeaders(extra) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...extra };
}
async function sbGetPotenciales() {
  const url = `${SUPABASE_URL}/rest/v1/clientes_potenciales?select=*&estado_recuperacion=in.(pendiente,contactado)&order=ocurrido_en.asc`;
  const r = await fetch(url, { headers: sbHeaders() });
  if (!r.ok) throw new Error(`Supabase potenciales ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbGetVentasEmails() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=email,ocurrido_en`, { headers: sbHeaders() });
  if (!r.ok) throw new Error(`Supabase ventas ${r.status}: ${await r.text()}`);
  const rows = await r.json();
  const map = new Map();
  for (const v of rows) {
    const e = String(v.email || '').toLowerCase().trim();
    if (e) map.set(e, v.ocurrido_en || null);
  }
  return map;
}
async function sbUpdate(id, patch) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?id=eq.${id}`, {
    method: 'PATCH',
    headers: sbHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Supabase update ${r.status}: ${await r.text()}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Núcleo: arma el plan (quién recibe qué), separado de la ejecución (dry sin efectos).
// ─────────────────────────────────────────────────────────────────────────────
function construirPlan(potenciales, ventas, now) {
  const plan = [];
  const marcarRecuperado = [];
  const marcarPerdido = [];

  for (const row of potenciales) {
    const email = String(row.email || '').toLowerCase().trim();
    const seq = SECUENCIAS[row.tipo];
    if (!seq || !email) continue;

    // ¿Ya compró? → recuperado, no se le escribe más.
    if (ventas.has(email)) {
      marcarRecuperado.push({ id: row.id, email, recuperado_en: ventas.get(email) || new Date(now).toISOString() });
      continue;
    }

    const base = new Date(row.ocurrido_en || row.created_at).getTime();
    const horasOld = (now - base) / HORA;
    const pasoEnviado = Number(row.paso_recuperacion || 0);
    const lastAt = row.ultimo_contacto_en ? new Date(row.ultimo_contacto_en).getTime() : 0;
    const horasDesdeUltimo = lastAt ? (now - lastAt) / HORA : 1e9;

    const due = proximoPaso(seq, pasoEnviado, horasOld, horasDesdeUltimo);
    if (due) {
      plan.push({
        id: row.id, email, tipo: row.tipo, nombre: row.nombre, telefono: row.telefono,
        paso: due.paso, horasOld: Math.round(horasOld), tmpl: TEMPLATES[row.tipo][due.paso],
      });
      continue;
    }

    // Sin más pasos debidos: si ya mandamos el último y pasó el plazo → perdido.
    const ultimoPaso = seq.pasos[seq.pasos.length - 1].paso;
    if (pasoEnviado >= ultimoPaso && horasOld >= seq.perdidoTrasHoras) {
      marcarPerdido.push({ id: row.id, email });
    }
  }
  return { plan, marcarRecuperado, marcarPerdido };
}

function resumen(potenciales, ventas) {
  const s = { total: potenciales.length, por_tipo: {}, por_estado: {}, ya_compraron: 0 };
  for (const row of potenciales) {
    s.por_tipo[row.tipo] = (s.por_tipo[row.tipo] || 0) + 1;
    s.por_estado[row.estado_recuperacion] = (s.por_estado[row.estado_recuperacion] || 0) + 1;
    if (ventas.has(String(row.email || '').toLowerCase().trim())) s.ya_compraron++;
  }
  return s;
}

// Reporte diario interno a Jose (por email vía Brevo).
async function mandarReporte(res) {
  const html = `<h2>📊 Recuperación de carritos — reporte diario</h2>
    <ul>
      <li><b>Mensajes enviados hoy:</b> ${res.enviados}
        (WhatsApp: ${res.enviados_wa != null ? res.enviados_wa : res.enviados}, Email sin teléfono: ${res.enviados_email || 0})</li>
      <li><b>Recuperados (compraron):</b> ${res.recuperados_hoy} nuevos hoy</li>
      <li><b>En seguimiento ahora:</b> ${res.en_seguimiento}
        (carrito abandonado: ${res.abandonados}, pago rechazado: ${res.rechazados})</li>
      <li><b>Marcados como perdidos hoy:</b> ${res.perdidos_hoy}</li>
    </ul>
    <p style="color:#888;font-size:12px">Motor: api/recuperacion.js · ${res.live ? 'ENVÍO REAL' : 'modo prueba (RECUP_ENABLED apagado)'} · el 1er mensaje lo dispara el webhook al instante; este cron manda el recordatorio.</p>`;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Reporte Recuperación', email: SENDER_EMAIL },
      to: [{ email: REPORTE_A }],
      subject: '📊 Recuperación de carritos — reporte diario',
      htmlContent: html,
    }),
  });
  return { ok: r.ok, status: r.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback por EMAIL (Brevo) cuando el cliente potencial NO dejó teléfono.
// Hotmart no siempre captura el número en un abandono/rechazo; para no perder a esa
// persona se le manda el MISMO mensaje por email, con el link de atribución (?src=recup-…)
// para que la venta recuperada quede medida en `ventas`. No necesita aprobación de Meta.
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_COPY = {
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

function emailRecupHtml({ nombre, titulo, cuerpo, cta, link }) {
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

// Registra el email en `mensajes` (canal=email, costo 0) para el historial. Best-effort.
async function logEmailRecup(email, tipo, paso, ok) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mensajes`, {
      method: 'POST',
      headers: sbHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        automatizacion: 'recuperacion', canal: 'email', tipo: `recup_${tipo}_${paso}`,
        categoria_meta: null, costo_estimado_usd: 0, ok: !!ok,
      }),
    });
  } catch (e) { /* best-effort: el log no frena la recuperación */ }
}

async function sendRecupEmail({ to, tipo, paso, nombre }) {
  const c = EMAIL_COPY[tipo];
  if (!c) return { ok: false, status: 0, error: `sin copy para tipo ${tipo}` };
  if (!process.env.BREVO_API_KEY) return { ok: false, status: 0, error: 'BREVO_API_KEY sin configurar' };
  // Directo al checkout de Hotmart; utm_medium=email para distinguir el canal en `ventas`.
  const link = `${LINKS[tipo]}&utm_source=recuperacion&utm_medium=email`;
  const html = emailRecupHtml({ nombre: primerNombre(nombre), titulo: c.titulo, cuerpo: c.cuerpo, cta: c.cta, link });
  let r;
  try {
    r = await fetch(`${BREVO}/smtp/email`, {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Periodistas Digitales', email: SENDER_EMAIL },
        to: [{ email: to, name: nombre || undefined }],
        subject: c.subject(paso),
        htmlContent: html,
      }),
    });
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
  await logEmailRecup(to, tipo, paso, r.ok);
  return { ok: r.ok, status: r.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'cron';

  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) return res.status(401).json({ error: 'unauthorized' });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase sin configurar (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' });
  }

  try {
    // Antes de recuperar: sincronizar con Hotmart (reconcilia ventas + captura pagos
    // rechazados frescos → clientes_potenciales, para que la recuperación los agarre en
    // esta misma corrida). Best-effort: si falla, no afecta la recuperación. Solo en la
    // corrida real del cron / live (no en modos de solo lectura).
    if (mode === 'cron' || mode === 'live') {
      try {
        const sync = await runHotmartSync();
        console.log(JSON.stringify({ type: 'hotmart_sync', ...sync }));
      } catch (e) {
        console.error('hotmart-sync (no frena la recuperación):', e.message);
      }
      // Gasto de Meta → campanas (para CPA/ROAS por anuncio). Best-effort, misma corrida.
      try {
        const meta = await runMetaSpendSync();
        console.log(JSON.stringify({ type: 'meta_spend_sync', ...meta }));
      } catch (e) {
        console.error('meta-spend-sync (no frena la recuperación):', e.message);
      }
      // Métricas de Meta POR DÍA → meta_insights_diario (las lee la rutina autónoma de Mateo).
      try {
        const metaDia = await runMetaDailySync();
        console.log(JSON.stringify({ type: 'meta_daily_sync', ...metaDia }));
      } catch (e) {
        console.error('meta-daily-sync (no frena la recuperación):', e.message);
      }
      // Gasto de Meta POR DÍA y por CAMPAÑA → meta_gasto_diario, la cuenta ENTERA (tenga
      // ficha o no). Es lo que muestra el panel de campañas de Leadr. Antes se corría a
      // mano y quedaba viejo sin avisar: el 02/08 el panel decía $0,52 y eran $1,86.
      try {
        const metaGasto = await runMetaGastoSync();
        console.log(JSON.stringify({ type: 'meta_gasto_sync', ...metaGasto }));
      } catch (e) {
        console.error('meta-gasto-sync (no frena la recuperación):', e.message);
      }
      // Estado de los agentes → agentes_estado (para que el Panel de Comando de la nube
      // los lea por MCP; la nube no puede clonar el repo). Best-effort. Tarjeta #32.
      try {
        const est = await runSyncEstados();
        console.log(JSON.stringify({ type: 'sync_estados', count: est.count, errores: est.errores }));
      } catch (e) {
        console.error('sync-estados (no frena la recuperación):', e.message);
      }
      // Métricas de la versión activa del checkout (Hotmart) + landing (events) → checkout_versiones
      // / landing_versiones. Best-effort, misma corrida. Así las tablas de versiones se actualizan solas.
      try {
        const ver = await runVersionesSync();
        console.log(JSON.stringify({ type: 'versiones_sync', ...ver }));
      } catch (e) {
        console.error('versiones-sync (no frena la recuperación):', e.message);
      }
      // VALENTINA — la story del día en la fanpage. Las stories de página NO se
      // pueden programar (la API las publica al instante y duran 24 h), así que
      // la única forma de sostener una por día es dispararla una vez por día, y
      // este es el cron que ya corre. Idempotente: si corre dos veces no duplica.
      // Best-effort: una story no puede frenar la recuperación de carritos.
      try {
        const story = await publicarStoryDelDia();
        console.log(JSON.stringify({ type: 'story_diaria', ...story }));
      } catch (e) {
        console.error('story-diaria (no frena la recuperación):', e.message);
      }
    }

    const now = Date.now();
    const [potenciales, ventas] = await Promise.all([sbGetPotenciales(), sbGetVentasEmails()]);

    if (mode === 'stats') {
      return res.status(200).json({ mode, ...resumen(potenciales, ventas) });
    }
    if (mode === 'inspect') {
      const { plan } = construirPlan(potenciales, ventas, now);
      const sample = potenciales.slice(0, 10).map(r => ({
        email: r.email, tipo: r.tipo, estado: r.estado_recuperacion, paso: r.paso_recuperacion,
        telefono: r.telefono ? '…' + String(r.telefono).slice(-4) : null,
        ocurrido_en: r.ocurrido_en, ultimo_contacto_en: r.ultimo_contacto_en,
      }));
      return res.status(200).json({ mode, total: potenciales.length, would_send: plan.length, sample });
    }

    const { plan, marcarRecuperado, marcarPerdido } = construirPlan(potenciales, ventas, now);
    const enabled = process.env.RECUP_ENABLED === '1';
    const live = (mode === 'live' || mode === 'cron') && enabled;

    if (mode === 'report') {
      const r = resumen(potenciales, ventas);
      const rep = await mandarReporte({
        enviados: 0, recuperados_hoy: 0, perdidos_hoy: 0,
        en_seguimiento: r.total, abandonados: r.por_tipo.carrito_abandonado || 0,
        rechazados: r.por_tipo.pago_rechazado || 0, live,
      });
      return res.status(200).json({ mode, reporte_enviado: rep.ok });
    }

    if (!live) {
      return res.status(200).json({
        mode, live: false, enabled,
        would_send: plan.length,
        recuperados_detectados: marcarRecuperado.length,
        perdidos_detectados: marcarPerdido.length,
        plan: plan.map(p => {
          const to = normalizePhone(p.telefono);
          const porEmail = !to || to.length < 8;
          return {
            tipo: p.tipo, paso: p.paso, horasOld: p.horasOld, nombre: primerNombre(p.nombre),
            canal: porEmail ? 'email' : 'whatsapp',
            destino: porEmail ? `EMAIL → ${p.email}` : '…' + String(p.telefono).slice(-4),
            envio: porEmail ? `email_recup_${p.tipo}` : p.tmpl,
          };
        }),
      });
    }

    // ── live ──
    for (const m of marcarRecuperado) {
      await sbUpdate(m.id, { estado_recuperacion: 'recuperado', recuperado_en: m.recuperado_en }).catch(e => console.error('recuperado', m.email, e.message));
    }
    for (const m of marcarPerdido) {
      await sbUpdate(m.id, { estado_recuperacion: 'perdido' }).catch(e => console.error('perdido', m.email, e.message));
    }

    const LIMIT = 80;
    const batch = plan.slice(0, LIMIT);
    const results = [];
    for (const p of batch) {
      const to = normalizePhone(p.telefono);
      // Excepción: sin teléfono válido → la recuperación sale por EMAIL (Brevo). Así ningún
      // abandono/rechazo sin teléfono queda sin contactar. Mismo estado, misma atribución.
      const porEmail = !to || to.length < 8;
      const canal = porEmail ? 'email' : 'whatsapp';
      const sent = porEmail
        ? await sendRecupEmail({ to: p.email, tipo: p.tipo, paso: p.paso, nombre: p.nombre })
        : await sendRecupTemplate({ to, tmpl: p.tmpl, nombre: p.nombre });
      if (sent.ok) {
        try {
          await sbUpdate(p.id, {
            estado_recuperacion: 'contactado',
            paso_recuperacion: p.paso,
            ultimo_contacto_en: new Date(now).toISOString(),
          });
          results.push({ email: p.email, tipo: p.tipo, paso: p.paso, canal, wamid: sent.wamid || null });
        } catch (e) {
          results.push({ email: p.email, paso: p.paso, canal, warn: 'enviado pero falló update: ' + e.message });
        }
      } else {
        const errMsg = porEmail
          ? (sent.error || sent.status)
          : ((sent.body && sent.body.error && sent.body.error.message) || sent.status);
        results.push({ email: p.email, paso: p.paso, canal, error: errMsg });
      }
      console.log(JSON.stringify({ type: 'recuperacion', email: p.email, tipo: p.tipo, paso: p.paso, canal, ok: sent.ok }));
    }

    let reporte = null;
    if (mode === 'cron') {
      // Reporte individual de recuperación: APAGADO por default (lo cubre el Panel de Salud).
      if (process.env.REPORTE_RECUP_INDIVIDUAL === '1') {
        const r = resumen(potenciales, ventas);
        const enviadosWA = results.filter(x => x.canal === 'whatsapp' && !x.error).length;
        const enviadosEmail = results.filter(x => x.canal === 'email' && !x.error).length;
        reporte = await mandarReporte({
          enviados: enviadosWA + enviadosEmail,
          enviados_wa: enviadosWA,
          enviados_email: enviadosEmail,
          recuperados_hoy: marcarRecuperado.length,
          perdidos_hoy: marcarPerdido.length,
          en_seguimiento: r.total,
          abandonados: r.por_tipo.carrito_abandonado || 0,
          rechazados: r.por_tipo.pago_rechazado || 0,
          live: true,
        }).catch(e => ({ ok: false, error: e.message }));
      }
      // PANEL DE SALUD unificado (el "uno con todo"): se dispara acá, tras el trabajo del día,
      // para no gastar un cron aparte (Hobby limita a 2). Best-effort: nunca frena la recuperación.
      try {
        const { enviarPanelSalud } = require('./salud');
        const p = await enviarPanelSalud('send');
        console.log(JSON.stringify({ type: 'panel_salud', ...p }));
      } catch (e) { console.error('panel salud (no frena la recuperación):', e && e.message || e); }
    }

    return res.status(200).json({
      mode, live: true,
      due_total: plan.length, attempted: batch.length, remaining: plan.length - batch.length,
      recuperados: marcarRecuperado.length, perdidos: marcarPerdido.length,
      reporte: reporte ? reporte.ok : null, results,
    });
  } catch (e) {
    console.error('recuperacion error', e);
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
