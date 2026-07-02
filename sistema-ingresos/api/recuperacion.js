// Motor de recuperación de clientes potenciales (carritos abandonados + pagos
// rechazados). Corre por Vercel Cron (ver vercel.json). Tarjeta Trello #34.
//
// POR QUÉ ESTO Y NO MAKE / NI DISPARAR DESDE EL WEBHOOK (decisión base de la #34):
// una secuencia de recuperación es una CADENCIA con delays (+1h / +24h / +72h),
// o sea necesita un scheduler con estado. Disparar al insertar la fila (Supabase
// webhook o el propio webhook de Hotmart) solo resuelve el PRIMER toque; los
// siguientes igual necesitan un poller. Así que un poller es inevitable — y ya
// existe exactamente este molde funcionando y entendido: api/wa-funnel.js. Este
// archivo lo copia: lee una fuente, calcula quién está en el paso N desde que
// ocurrió el evento, manda por API (acá Brevo email), guarda estado para no
// repetir, tiene modos dry/live y reporte diario. Todo en código, versionado,
// sin depender de que nadie toque una UI.
//
// FUENTE: tabla clientes_potenciales de la base de marketing (Supabase
// periodistas-marketing). La llena solo el webhook de Hotmart (ver
// api/hotmart.js y ARQUITECTURA-DATOS.md). Dos flujos según la columna `tipo`:
//   tipo = carrito_abandonado → 3 emails para que vuelvan y compren.
//   tipo = pago_rechazado     → 2 emails "tu pago no se procesó" + link a reintentar.
//
// ESTADO POR PERSONA (columnas en clientes_potenciales):
//   estado_recuperacion: pendiente → contactado → recuperado | perdido
//   paso_recuperacion:   0/1/2/3   (cuántos emails de la secuencia ya se mandaron)
//   ultimo_contacto_en:  timestamp del último email (para respetar la cadencia)
//   recuperado_en:       cuándo se detectó la compra (cruce con la tabla `ventas`)
// Se manda como máximo UN email por persona por corrida (avanza un escalón).
//
// ANTI-ACOSO: antes de mandar, se cruza el email con la tabla `ventas`. Si ya
// compró → estado=recuperado y no se le escribe más (esto además mide cuántos
// recuperamos). A quien ya está 'recuperado'/'perdido' nunca se lo re-contacta.
//
// MODOS (query ?mode=):
//   inspect — muestra las filas candidatas con lo que el motor calculó. No manda.
//   dry     — calcula a quién le toca hoy y qué email, SIN mandar ni tocar la DB.
//   stats   — devuelve el resumen del embudo de recuperación (no manda).
//   report  — manda el reporte diario por email a Jose (no manda recuperaciones).
//   live    — manda de verdad y actualiza la DB. Requiere ADEMÁS RECUP_ENABLED=1.
//   (el cron llama sin mode → equivale a live+report, pero si RECUP_ENABLED != 1
//    se degrada a dry: NO manda nada hasta que Jose lo habilite).
//
// SEGURIDAD: protegida por CRON_SECRET (header Authorization: Bearer <secret> que
// agrega Vercel Cron, o ?key=<secret> para probar a mano).
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — base de marketing (lee/escribe saltando RLS)
//   BREVO_API_KEY                           — para mandar los emails y el reporte
//   CRON_SECRET                             — auth del endpoint
//   RECUP_ENABLED                           — "1" habilita el envío real (interruptor)

const BREVO = 'https://api.brevo.com/v3';
const BASE = 'https://sistemadeingresosdiariosia.com';
const HORA = 3600000;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Remitente de los emails (mismo que ya usa el motor de WhatsApp para el reporte).
const SENDER = { name: 'Jose · Sistema de Ingresos', email: 'jose@sistemadeingresosdiariosia.com' };
const REPORTE_A = 'joseanselmi27@gmail.com';

// Espera mínima entre un email y el siguiente (robustez ante corridas seguidas).
const MIN_GAP_HORAS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// COPY  (fuente única; RECUPERACION.md lo documenta). Regla: no quemar el precio
// hasta el cierre; tono servicial. El link vuelve a la landing con ?src= para
// atribuir la venta recuperada en la tabla `ventas`.
// ─────────────────────────────────────────────────────────────────────────────

function primerNombre(nombre) {
  const n = String(nombre || '').trim().split(/\s+/)[0] || '';
  return n;
}
function saludo(nombre) {
  const n = primerNombre(nombre);
  return n ? `Hola ${n}:` : 'Hola:';
}
function boton(link, texto) {
  return `<p style="margin:24px 0"><a href="${link}" style="background:#6366f1;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${texto}</a></p>`;
}
function pie() {
  return `<hr style="border:none;border-top:1px solid #eee;margin:28px 0 12px">
<p style="color:#888;font-size:12px">Te escribo porque dejaste tu correo al entrar al checkout del Sistema de Ingresos Diarios. Si no querés recibir más estos mensajes, respondé este correo con <b>BAJA</b> y listo.</p>`;
}
function envolver(inner) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a2e;max-width:560px;margin:auto">${inner}${pie()}</div>`;
}

// — Carrito abandonado —
function emailAbandono1(nombre, link) {
  return {
    subject: `${primerNombre(nombre) ? primerNombre(nombre) + ', ¿' : '¿'}te quedó una duda con el Sistema de Ingresos?`,
    html: envolver(`
      <p>${saludo(nombre)}</p>
      <p>Vi que estuviste a un paso de sumarte al <b>Sistema de Ingresos Diarios</b> y algo te frenó justo antes de terminar. Es súper normal — quería asegurarme de que tengas todo claro.</p>
      <p>Es el método paso a paso para armar ingresos con tu conocimiento aunque hoy no sepas por dónde empezar. Te queda todo grabado y podés ir a tu ritmo.</p>
      <p>Si te quedó alguna duda concreta, <b>respondé este correo</b> y te contesto yo mismo.</p>
      <p>Y si solo se te cortó, retomá donde lo dejaste:</p>
      ${boton(link, 'Volver a mi lugar')}`),
  };
}
function emailAbandono2(nombre, link) {
  return {
    subject: 'Lo que más me preguntan antes de empezar',
    html: envolver(`
      <p>${saludo(nombre)}</p>
      <p>Cuando alguien duda antes de entrar, casi siempre es por una de dos cosas: <i>"¿me va a alcanzar el tiempo?"</i> o <i>"¿esto sirve para mi caso?"</i>.</p>
      <p>El sistema está pensado justo para eso: son pasos cortos, aplicás sobre lo que ya sabés hacer, y no necesitás una audiencia gigante ni conocimientos técnicos para arrancar.</p>
      <p>No hace falta que lo hagas todo hoy. Solo dar el primer paso.</p>
      ${boton(link, 'Retomar mi inscripción')}
      <p>Cualquier duda, respondé este mail. Lo leo yo.</p>`),
  };
}
function emailAbandono3(nombre, link) {
  return {
    subject: 'Última vez que te escribo por esto',
    html: envolver(`
      <p>${saludo(nombre)}</p>
      <p>No quiero ser insistente, así que este es el último correo que te mando por tu inscripción al <b>Sistema de Ingresos Diarios</b>.</p>
      <p>Si era el momento, dejarlo para "después" casi siempre termina en nunca. Y si tenías una duda, de verdad respondé este mail — prefiero que decidas con la info que sin ella.</p>
      <p>Si querés entrar, tu lugar sigue disponible acá:</p>
      ${boton(link, 'Completar mi inscripción')}</p>`),
  };
}

// — Pago rechazado —
function emailRechazo1(nombre, link) {
  return {
    subject: `${primerNombre(nombre) ? primerNombre(nombre) + ', tu' : 'Tu'} pago no se completó (se soluciona en 1 minuto)`,
    html: envolver(`
      <p>${saludo(nombre)}</p>
      <p>Intentaste sumarte al <b>Sistema de Ingresos Diarios</b> pero tu pago <b>no llegó a procesarse</b>. Suele ser algo menor: un límite del banco, un dato mal tipeado o un rechazo automático de la tarjeta.</p>
      <p>La buena noticia es que se arregla en un minuto. Reintentá acá (podés usar otro medio de pago si preferís):</p>
      ${boton(link, 'Reintentar mi pago')}
      <p>Si te vuelve a rechazar, respondé este correo y lo resolvemos juntos.</p>`),
  };
}
function emailRechazo2(nombre, link) {
  return {
    subject: '¿Seguís queriendo entrar al Sistema de Ingresos?',
    html: envolver(`
      <p>${saludo(nombre)}</p>
      <p>Te guardé el lugar. Tu pago quedó pendiente ayer, así que si todavía querés entrar, podés reintentarlo cuando quieras:</p>
      ${boton(link, 'Completar mi pago')}
      <p>Y si tuviste algún problema con el medio de pago, escribime respondiendo este mail y te ayudo a que quede resuelto.</p>`),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECUENCIAS  (config por tipo)
// ─────────────────────────────────────────────────────────────────────────────
const SECUENCIAS = {
  carrito_abandonado: {
    src: 'recup-abandono',
    perdidoTrasHoras: 72 + 96, // tras el último paso, si pasan ~4 días más sin compra → perdido
    pasos: [
      { paso: 1, minHoras: 1, email: emailAbandono1 },
      { paso: 2, minHoras: 24, email: emailAbandono2 },
      { paso: 3, minHoras: 72, email: emailAbandono3 },
    ],
  },
  pago_rechazado: {
    src: 'recup-rechazo',
    perdidoTrasHoras: 24 + 72,
    pasos: [
      { paso: 1, minHoras: 1, email: emailRechazo1 },
      { paso: 2, minHoras: 24, email: emailRechazo2 },
    ],
  },
};

function linkDe(seq) {
  return `${BASE}/?src=${seq.src}`;
}

// Dada la antigüedad y el paso ya enviado, decide qué paso mandar (el próximo debido).
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
// Brevo (email transaccional)
// ─────────────────────────────────────────────────────────────────────────────
async function enviarEmail(to, subject, html) {
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      headers: { 'List-Unsubscribe': `<mailto:${SENDER.email}?subject=BAJA>` },
      tags: ['recuperacion'],
    }),
  });
  const body = await r.text();
  return { ok: r.ok, status: r.status, body };
}

// ─────────────────────────────────────────────────────────────────────────────
// Núcleo: arma el plan (quién recibe qué), separado de la ejecución para poder
// correrlo en dry sin efectos.
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
        id: row.id, email, tipo: row.tipo, nombre: row.nombre,
        paso: due.paso, horasOld: Math.round(horasOld), emailFn: due.email, link: linkDe(seq),
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

async function mandarReporte(res) {
  const html = `<h2>📊 Recuperación de carritos — reporte diario</h2>
    <ul>
      <li><b>Enviados hoy:</b> ${res.enviados} email(s) de recuperación</li>
      <li><b>Recuperados (compraron):</b> ${res.recuperados_hoy} nuevos hoy</li>
      <li><b>En seguimiento ahora:</b> ${res.en_seguimiento}
        (carrito abandonado: ${res.abandonados}, pago rechazado: ${res.rechazados})</li>
      <li><b>Marcados como perdidos hoy:</b> ${res.perdidos_hoy}</li>
    </ul>
    <p style="color:#888;font-size:12px">Motor: api/recuperacion.js · ${res.live ? 'ENVÍO REAL' : 'modo prueba (RECUP_ENABLED apagado)'} </p>`;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Reporte Recuperación', email: SENDER.email },
      to: [{ email: REPORTE_A }],
      subject: '📊 Recuperación de carritos — reporte diario',
      htmlContent: html,
    }),
  });
  return { ok: r.ok, status: r.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'cron';

  // Auth
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) return res.status(401).json({ error: 'unauthorized' });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase sin configurar (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' });
  }

  try {
    const now = Date.now();
    const [potenciales, ventas] = await Promise.all([sbGetPotenciales(), sbGetVentasEmails()]);

    if (mode === 'stats') {
      return res.status(200).json({ mode, ...resumen(potenciales, ventas) });
    }
    if (mode === 'inspect') {
      const { plan } = construirPlan(potenciales, ventas, now);
      const sample = potenciales.slice(0, 10).map(r => ({
        email: r.email, tipo: r.tipo, estado: r.estado_recuperacion,
        paso: r.paso_recuperacion, ocurrido_en: r.ocurrido_en, ultimo_contacto_en: r.ultimo_contacto_en,
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
      // dry: mostrar el plan sin ejecutar nada
      return res.status(200).json({
        mode, live: false, enabled,
        would_send: plan.length,
        recuperados_detectados: marcarRecuperado.length,
        perdidos_detectados: marcarPerdido.length,
        plan: plan.map(p => ({ email: p.email, tipo: p.tipo, paso: p.paso, horasOld: p.horasOld, subject: p.emailFn(p.nombre, p.link).subject })),
      });
    }

    // ── live ──
    // 1) actualizar recuperados / perdidos (no mandan email).
    for (const m of marcarRecuperado) {
      await sbUpdate(m.id, { estado_recuperacion: 'recuperado', recuperado_en: m.recuperado_en }).catch(e => console.error('recuperado', m.email, e.message));
    }
    for (const m of marcarPerdido) {
      await sbUpdate(m.id, { estado_recuperacion: 'perdido' }).catch(e => console.error('perdido', m.email, e.message));
    }

    // 2) mandar la secuencia (cap por corrida para no pasar el timeout serverless).
    const LIMIT = 80;
    const batch = plan.slice(0, LIMIT);
    const results = [];
    for (const p of batch) {
      const { subject, html } = p.emailFn(p.nombre, p.link);
      const sent = await enviarEmail(p.email, subject, html);
      if (sent.ok) {
        try {
          await sbUpdate(p.id, {
            estado_recuperacion: 'contactado',
            paso_recuperacion: p.paso,
            ultimo_contacto_en: new Date(now).toISOString(),
          });
          results.push({ email: p.email, tipo: p.tipo, paso: p.paso });
        } catch (e) {
          results.push({ email: p.email, paso: p.paso, warn: 'enviado pero falló update: ' + e.message });
        }
      } else {
        results.push({ email: p.email, paso: p.paso, error: sent.status });
      }
      console.log(JSON.stringify({ type: 'recuperacion', email: p.email, tipo: p.tipo, paso: p.paso, ok: sent.ok }));
    }

    // 3) reporte diario (solo en la corrida del cron).
    let reporte = null;
    if (mode === 'cron') {
      const r = resumen(potenciales, ventas);
      reporte = await mandarReporte({
        enviados: results.filter(x => !x.error).length,
        recuperados_hoy: marcarRecuperado.length,
        perdidos_hoy: marcarPerdido.length,
        en_seguimiento: r.total,
        abandonados: r.por_tipo.carrito_abandonado || 0,
        rechazados: r.por_tipo.pago_rechazado || 0,
        live: true,
      }).catch(e => ({ ok: false, error: e.message }));
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
