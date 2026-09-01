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

// El tope existe para no colgarse si Brevo devuelve de más, pero cortar sin
// avisar es peor que cortar: la tabla queda con un agujero que nadie ve. El
// 31/07 el tope de 1000 cortaba 2.243 eventos de 7 días por la mitad.
async function traerEventos({ apiKey, dias, limite = 20000 }) {
  const eventos = [];
  const porPagina = 100;
  let cortado = false;

  for (let offset = 0; offset < limite; offset += porPagina) {
    const url = `${BREVO_URL}?limit=${porPagina}&offset=${offset}&days=${dias}`;
    const res = await fetch(url, { headers: { 'api-key': apiKey, accept: 'application/json' } });
    if (!res.ok) throw new Error(`Brevo HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const lote = (await res.json()).events || [];
    eventos.push(...lote);
    if (lote.length < porPagina) break;   // última página
    if (eventos.length >= limite) { cortado = true; break; }
  }
  if (cortado) console.warn(`⚠️ sync Brevo: se llegó al tope de ${limite} eventos en ${dias} días — hay más que no se bajaron`);
  return eventos;
}

// Brevo manda sin etiqueta el Regalo 1 (lo arma Make) y el Regalo 2 (es una
// automatización). Sin tag, esos mails no son de ninguna campaña y quedan
// afuera del embudo — justo los dos pasos de más volumen.
//
// En vez de etiquetarlos a mano cada vez (que fue lo que se hizo, y que la
// propia sincronización volvió a borrar), se deducen por el asunto: cada paso
// del embudo ya tiene guardado el asunto exacto con el que sale.
//
// ⚠️ FALLA ABIERTO, PERO RUIDOSO (01/09/2026). Antes devolvía un Map vacío y no decía nada.
// Seguir corriendo está BIEN —quedarse sin los eventos por no poder deducir un tag sería peor—
// pero callarse no: sin el mapa, el Regalo 1 y el Regalo 2 (los dos de MÁS volumen) entran con
// `campana: null`, se caen de todos los filtros por campaña del Panel de Salud, y el panel se
// pone verde porque las filas son INVISIBLES, no porque la entrega funcione. Es la tercera vez
// que aparece la misma forma: un fallo y un "no hay nada" que se escriben igual.
// Por eso ahora devuelve TAMBIÉN si pudo o no, y quien llama lo reporta.
async function tagsPorAsunto({ supabaseUrl, serviceKey }) {
  const vacio = (motivo) => {
    console.error(`[brevo-events-sync] ⚠️ no se pudo leer funnel_steps (${motivo}). Los mails sin tag propio —Regalo 1 y Regalo 2— van a quedar con campana:null y desaparecen de los filtros por campaña.`);
    return { mapa: new Map(), ok: false, motivo };
  };
  if (!supabaseUrl || !serviceKey) return vacio('faltan supabaseUrl/serviceKey');
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/funnel_steps?select=brevo_tag,contenido_asunto&brevo_tag=not.is.null&contenido_asunto=not.is.null`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!res.ok) return vacio(`Supabase HTTP ${res.status}`);
    const mapa = new Map((await res.json()).map((s) => [s.contenido_asunto, s.brevo_tag]));
    // Un mapa que llega VACÍO sin error también es un problema: significa que ningún paso tiene
    // asunto cargado, y el efecto es idéntico al de no poder consultarlo.
    if (mapa.size === 0) return vacio('funnel_steps no devolvió ningún asunto');
    return { mapa, ok: true, motivo: null };
  } catch (e) {
    return vacio((e && e.message) || String(e));
  }
}

// Junta los eventos sueltos en una fila por (mensaje_id) quedándose con el
// timestamp MÁS VIEJO de cada tipo: si alguien abre el mail cuatro veces, lo
// que importa es cuándo lo abrió la primera vez.
function agrupar(eventos, porAsunto = new Map()) {
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
      campana: ev.tag || porAsunto.get(ev.subject) || null,
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
async function filasDeEventosBrevo({ apiKey, dias = 7, limite = 50000, supabaseUrl, serviceKey }) {
  const eventos = await traerEventos({ apiKey, dias, limite });
  const tags = supabaseUrl && serviceKey
    ? await tagsPorAsunto({ supabaseUrl, serviceKey })
    : { mapa: new Map(), ok: false, motivo: 'no se pidieron credenciales de Supabase' };
  const filas = agrupar(eventos, tags.mapa);
  return { eventos: eventos.length, filas, tags_ok: tags.ok, tags_motivo: tags.motivo, sin_campana: filas.filter((f) => !f.campana).length };
}

/**
 * @param {object} opts
 * @param {string} opts.apiKey        BREVO_API_KEY
 * @param {string} opts.supabaseUrl   URL de periodistas-marketing
 * @param {string} opts.serviceKey    service_role de esa base
 * @param {number} [opts.dias]        ventana a traer (Brevo guarda ~30 días)
 * @returns {Promise<{eventos:number, filas:number}>}
 */
async function sincronizarEventosBrevo({ apiKey, supabaseUrl, serviceKey, dias = 7, limite = 20000 }) {
  const eventos = await traerEventos({ apiKey, dias, limite });
  const tags = await tagsPorAsunto({ supabaseUrl, serviceKey });
  const filas = agrupar(eventos, tags.mapa);
  // Se informa SIEMPRE, salga bien o mal: `sin_campana` es el síntoma directo de que los mails
  // sin tag propio no se pudieron atribuir, y es lo que el Panel de Salud mira para no ponerse
  // verde por filas invisibles.
  const diagnostico = { tags_ok: tags.ok, tags_motivo: tags.motivo, sin_campana: filas.filter((f) => !f.campana).length };
  if (filas.length === 0) return { eventos: eventos.length, filas: 0, ...diagnostico };

  // ⚠️ Se escribe por la función merge_comunicaciones y NO por el upsert de
  // PostgREST. `Prefer: resolution=merge-duplicates` REEMPLAZA la fila: como
  // cada corrida solo ve los eventos de su ventana, un mail al que esta vez solo
  // se le vio el "abierto" volvía con enviado_en, entregado_en y campana en
  // null. La corrida borraba lo que había aprendido la anterior, y por eso la
  // tabla nunca cerraba con Brevo (31/07/2026). La función solo completa lo que
  // falta y se queda con la fecha más vieja de cada tipo.
  for (let i = 0; i < filas.length; i += 200) {
    const lote = filas.slice(i, i + 200);

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/merge_comunicaciones`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filas: lote }),
    });
    if (!res.ok) throw new Error(`Supabase HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  return { eventos: eventos.length, filas: filas.length, ...diagnostico };
}

module.exports = { sincronizarEventosBrevo, filasDeEventosBrevo };
