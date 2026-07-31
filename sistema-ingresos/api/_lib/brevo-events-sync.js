// _lib/brevo-events-sync.js — baja los eventos de email de Brevo a Supabase.
//
// Por qué existe: de los mails solo guardábamos un total agregado de 7 días
// (brevo_stats). Quién abrió qué vivía únicamente adentro de Brevo, así que no
// se podía responder "¿qué le mandamos a esta persona y lo abrió?". Eso es lo
// que dejó pasar que 17 compradores nunca recibieran su acceso a Leadr
// (30/07/2026): nadie miraba el resultado por persona.
//
// Una fila por mail y por destinatario en comunicaciones_email, con la PRIMERA
// vez que pasó cada cosa (enviado → entregado → abierto → clic).
//
// Lo llama api/salud.js en cada corrida diaria (Vercel Hobby solo deja 2 crons,
// así que se cuelga del que ya existe). También se puede correr a mano:
//   node ads-agent/scripts/datos/sync-comunicaciones.mjs --dias 30

const BREVO_URL = 'https://api.brevo.com/v3/smtp/statistics/events';

// Qué columna toca cada evento de Brevo. Los que no están acá se ignoran
// (deferred, unsubscribed, loadedByProxy...): no cambian el resultado.
const COLUMNA_POR_EVENTO = {
  requests:    'enviado_en',
  delivered:   'entregado_en',
  opened:      'abierto_en',
  uniqueOpened:'abierto_en',
  clicks:      'clic_en',
  hardBounces: 'rebotado_en',
  softBounces: 'rebotado_en',
  blocked:     'rebotado_en',
  invalid:     'rebotado_en',
  error:       'rebotado_en',
  spam:        'spam_en',
};

async function traerEventos({ apiKey, dias, limite = 1000 }) {
  const eventos = [];
  const porPagina = 100;

  for (let offset = 0; offset < limite; offset += porPagina) {
    const url = `${BREVO_URL}?limit=${porPagina}&offset=${offset}&days=${dias}`;
    const res = await fetch(url, { headers: { 'api-key': apiKey, accept: 'application/json' } });
    if (!res.ok) throw new Error(`Brevo HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const lote = (await res.json()).events || [];
    eventos.push(...lote);
    if (lote.length < porPagina) break;   // última página
  }
  return eventos;
}

// Junta los eventos sueltos en una fila por (mensaje_id) quedándose con el
// timestamp MÁS VIEJO de cada tipo: si alguien abre el mail cuatro veces, lo
// que importa es cuándo lo abrió la primera vez.
function agrupar(eventos) {
  const filas = new Map();

  for (const ev of eventos) {
    const columna = COLUMNA_POR_EVENTO[ev.event];
    if (!columna || !ev.messageId || !ev.email) continue;

    // Todas las claves siempre presentes: PostgREST rechaza un insert en lote si
    // los objetos no tienen exactamente el mismo juego de claves (PGRST102).
    const fila = filas.get(ev.messageId) || {
      mensaje_id: ev.messageId,
      email: ev.email.toLowerCase().trim(),
      asunto: ev.subject || null,
      campana: ev.tag || null,
      enviado_en: null,
      entregado_en: null,
      abierto_en: null,
      clic_en: null,
      rebotado_en: null,
      spam_en: null,
    };
    const cuando = new Date(ev.date).toISOString();
    if (!fila[columna] || cuando < fila[columna]) fila[columna] = cuando;
    if (!fila.asunto && ev.subject) fila.asunto = ev.subject;

    filas.set(ev.messageId, fila);
  }
  return [...filas.values()];
}

/** Trae los eventos y los agrupa, sin escribir. Lo usa el backfill a mano. */
async function filasDeEventosBrevo({ apiKey, dias = 7, limite = 50000 }) {
  const eventos = await traerEventos({ apiKey, dias, limite });
  return { eventos: eventos.length, filas: agrupar(eventos) };
}

/**
 * @param {object} opts
 * @param {string} opts.apiKey        BREVO_API_KEY
 * @param {string} opts.supabaseUrl   URL de periodistas-marketing
 * @param {string} opts.serviceKey    service_role de esa base
 * @param {number} [opts.dias]        ventana a traer (Brevo guarda ~30 días)
 * @returns {Promise<{eventos:number, filas:number}>}
 */
async function sincronizarEventosBrevo({ apiKey, supabaseUrl, serviceKey, dias = 7, limite = 1000 }) {
  const eventos = await traerEventos({ apiKey, dias, limite });
  const filas = agrupar(eventos);
  if (filas.length === 0) return { eventos: eventos.length, filas: 0 };

  // De a 200 para no pasarse del tamaño de request.
  for (let i = 0; i < filas.length; i += 200) {
    const lote = filas.slice(i, i + 200).map(f => ({ ...f, actualizado_en: new Date().toISOString() }));

    // merge-duplicates: si el mail ya estaba, se actualiza con lo nuevo (p.ej.
    // se abrió después de la última corrida).
    const res = await fetch(`${supabaseUrl}/rest/v1/comunicaciones_email?on_conflict=mensaje_id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(lote),
    });
    if (!res.ok) throw new Error(`Supabase HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  return { eventos: eventos.length, filas: filas.length };
}

module.exports = { sincronizarEventosBrevo, filasDeEventosBrevo };
