// Motor de recuperación de clientes potenciales (carritos abandonados + pagos
// rechazados). Tarjeta Trello #34. **Canal: EMAIL, y sólo email** (ver más abajo).
//
// 📋 Los dos flujos que ejecuta están descritos en `_lib/flujos.js`: `recup-carrito` y
// `recup-rechazo`. Ahí viven los plazos, los topes y cuándo se da por perdido — este archivo
// los ejecuta, no los define. Antes tenía su propia lista en horas mientras el embudo de guías
// tenía otra en días: dos idiomas para el mismo concepto.
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
// EL COPY de los dos mails vive en api/_lib/recup-email.js, compartido con el webhook de
// Hotmart que manda el primero al instante. Cada pieza lleva su etiqueta en Brevo
// (recup-carrito-1/2, recup-rechazo-1/2) — sin etiqueta no se puede saber si llegó, y eso es
// lo que dejó al Panel de Salud en verde un mes entero.
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
// CANAL: EMAIL, y sólo email (09/08/2026, decisión de Jose). Antes esto salía por WhatsApp y
// el email era la excepción para quien no había dejado teléfono. Se dio vuelta porque el
// número está capado en Meta desde el 13/07 —la verificación del negocio no pasó y el nombre
// quedó rechazado—, así que la rama de WhatsApp no entregaba nada. Y era la rama PRINCIPAL:
// justamente el que SÍ dejaba teléfono era el que no recibía nada, mientras el que no lo
// dejaba sí recibía su mail. El canal peor era el premio por dar más datos.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY (reporte a Jose + los emails
//      de recuperación), CRON_SECRET, RECUP_ENABLED.

const { LINKS, primerNombre } = require('./_lib/wa');
// La FICHA de los dos flujos de recuperación: quién entra, los plazos, cuándo se da por perdido.
const { secuenciasDeRecuperacion, FLUJOS, RECUPERACION_POR_TIPO } = require('./_lib/flujos');
// Las seis sincronizaciones de datos se fueron a /api/hotmart-sync?todos=1 (17/08/2026), con
// cron propio: una que falla ya no arrastra a las demas ni queda escondida detras de esta corrida.
const { publicarStoryDelDia } = require('./_lib/story-diaria');

const BREVO = 'https://api.brevo.com/v3';
const HORA = 3600000;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// El reporte diario (interno, a Jose) va por email — no necesita aprobación de Meta.
const SENDER_EMAIL = 'jose@sistemadeingresosdiariosia.com';
const REPORTE_A = 'joseanselmi27@gmail.com';

// Espera mínima entre un mensaje y el siguiente (robustez ante corridas seguidas). Sale de la
// ficha, no de acá: tenerlo escrito en los dos lados es la duplicación que este cambio saca.
// `proximoPaso` es una sola función para los dos flujos, así que se exige que coincidan — si
// algún día uno necesita otro gap, esto revienta y obliga a hacer la función por flujo en vez
// de que uno de los dos empiece a usar en silencio el número del otro.
const MIN_GAP_HORAS = (() => {
  const gaps = Object.values(RECUPERACION_POR_TIPO).map((c) => FLUJOS[c].gapMinimoHoras);
  if (new Set(gaps).size !== 1) {
    throw new Error(`[recuperacion] los flujos tienen gaps distintos (${gaps.join(' vs ')}): proximoPaso() los comparte y hay que separarla antes.`);
  }
  return gaps[0];
})();

// ─────────────────────────────────────────────────────────────────────────────
// SECUENCIAS por tipo. paso 1: minHoras 0 → el cron lo manda solo como fallback
// (normalmente ya lo mandó el webhook al instante). paso 2: al día siguiente.
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ YA NO SE DECLARAN ACÁ: salen de la FICHA de cada flujo (`_lib/flujos.js`), igual que las
// del embudo de guías. Hasta el 10/08/2026 este archivo tenía su propia lista, en horas y
// marcando en Supabase, mientras wa-funnel.js tenía otra, en días y marcando en atributos de
// Brevo — dos idiomas para el mismo concepto. Para tocar cualquiera de los dos había que
// averiguar primero en cuál estaba escrito, y un tercer flujo iba a inventar un tercero.
// La ficha guarda todo en HORAS y traduce a lo que cada motor espera.
const SECUENCIAS = secuenciasDeRecuperacion();

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
        id: row.id, email, tipo: row.tipo, nombre: row.nombre,
        paso: due.paso, horasOld: Math.round(horasOld),
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
      <li><b>Mails enviados hoy:</b> ${res.enviados}</li>
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

// El mail de recuperación vive en `_lib/recup-email.js`: lo comparten este cron y el webhook
// de Hotmart (que manda el primero al instante), así el copy tiene un solo dueño.
const { sendRecupEmail } = require('./_lib/recup-email');

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
    // ⚠️ LAS SEIS SINCRONIZACIONES DE DATOS YA NO CORREN ACÁ (17/08/2026).
    // Se fueron a /api/hotmart-sync?todos=1, con cron propio a las 11:00 UTC. Vivían de
    // pasajeras en esta corrida porque se creía que el plan sólo permitía 2 crons — permite 100.
    // Ahora una que falla no arrastra a las otras ni queda escondida detrás de este trabajo, y
    // un error acá ya no deja los paneles con datos de ayer.
    if (mode === 'cron' || mode === 'live') {
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
        plan: plan.map(p => ({
          tipo: p.tipo, paso: p.paso, horasOld: p.horasOld, nombre: primerNombre(p.nombre),
          canal: 'email',
          destino: `EMAIL → ${p.email}`,
          envio: `email_recup_${p.tipo}`,
        })),
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
      // Un solo canal: email. Ya no se mira el teléfono para decidir por dónde sale.
      const canal = 'email';
      const sent = await sendRecupEmail({ to: p.email, tipo: p.tipo, paso: p.paso, nombre: p.nombre });
      if (sent.ok) {
        try {
          await sbUpdate(p.id, {
            estado_recuperacion: 'contactado',
            paso_recuperacion: p.paso,
            ultimo_contacto_en: new Date(now).toISOString(),
          });
          results.push({ email: p.email, tipo: p.tipo, paso: p.paso, canal });
        } catch (e) {
          results.push({ email: p.email, paso: p.paso, canal, warn: 'enviado pero falló update: ' + e.message });
        }
      } else {
        results.push({ email: p.email, paso: p.paso, canal, error: sent.error || sent.status });
      }
      console.log(JSON.stringify({ type: 'recuperacion', email: p.email, tipo: p.tipo, paso: p.paso, canal, ok: sent.ok }));
    }

    let reporte = null;
    if (mode === 'cron') {
      // Reporte individual de recuperación: APAGADO por default (lo cubre el Panel de Salud).
      if (process.env.REPORTE_RECUP_INDIVIDUAL === '1') {
        const r = resumen(potenciales, ventas);
        // Un solo canal. Contar por 'whatsapp' daba SIEMPRE 0 y el reporte decía
        // "WhatsApp: 0, Email sin teléfono: 0" aunque hubiera salido todo bien.
        const enviados = results.filter(x => !x.error).length;
        reporte = await mandarReporte({
          enviados,
          recuperados_hoy: marcarRecuperado.length,
          perdidos_hoy: marcarPerdido.length,
          en_seguimiento: r.total,
          abandonados: r.por_tipo.carrito_abandonado || 0,
          rechazados: r.por_tipo.pago_rechazado || 0,
          live: true,
        }).catch(e => ({ ok: false, error: e.message }));
      }
      // ⚠️ EL PANEL DE SALUD YA NO SE MANDA DESDE ACÁ (17/08/2026). Tiene su propio cron.
      //
      // Vivía en esta línea "para no gastar un cron aparte (Hobby limita a 2)" — y ese límite era
      // falso: el plan permite 100 crons por proyecto, uno por día cada uno. Lo que sí limita es
      // la cantidad de FUNCIONES (12, comprobado), pero el panel no necesita una nueva: sale por
      // `/api/salud`, que ya existe.
      //
      // POR QUÉ IMPORTA SACARLO. El panel es lo ÚNICO que le avisa a Jose si algo se rompió, y
      // estaba de último pasajero en un cron que carga otras siete cosas. Si esta corrida fallaba,
      // se perdían las siete Y el aviso de que se perdieron. Desde su bandeja, "no llegó el panel"
      // y "no había nada que avisar" se ven idénticos.
      // Un vigilante no puede depender de lo que vigila.
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
