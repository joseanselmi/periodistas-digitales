// api/story-diaria.js — VALENTINA publica la story del día en la fanpage.
//
// PARA QUÉ: las stories de página **no se pueden programar**. La API de Facebook
// las publica al instante y duran 24 h, así que la única forma de sostener una
// por día es que algo dispare una vez por día. Antes eso lo hacía Jose a mano
// corriendo ads-agent/scripts/publicar/post-story.mjs; esto lo hace solo.
//
// POR QUÉ ACÁ Y NO EN UNA RUTINA DE NUBE: la rutina de claude.ai no clona el
// repo (no ve los .jpg) y no tiene salida a internet (no llega a Facebook).
// Vercel sí tiene las dos cosas. Y la imagen se toma de **GitHub raw**, que es
// el mismo truco que ya usa _lib/sync-estados.js para leer archivos del repo
// desde la nube: Facebook acepta publicar una foto por URL, sin subir el binario.
//
// IDEMPOTENTE: antes de publicar consulta la tabla `events` por un `story_fb`
// de esa fecha. Si el cron corre dos veces, no duplica. Es la misma garantía
// que daba el state/stories-publicadas.json local.
//
// Env: FB_PAGE_TOKEN, FB_PAGE_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const REPO = 'joseanselmi/periodistas-digitales';
const BRANCH = 'master';
const DIR = 'ads-agent/carousels/muro-stories';
const GRAPH = 'https://graph.facebook.com/v21.0';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const sb = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'content-type': 'application/json',
      ...(opts.headers || {}),
    },
  });

// El calendario de stories está armado en día ARG, no UTC: a las 15:00 UTC ya es
// el mismo día en Argentina, pero conviene ser explícito y no depender del server.
function hoyARG() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
}

async function yaSePublico(fecha) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const r = await sb(`events?select=id&tipo_evento=eq.story_fb&url=eq.${fecha}&limit=1`);
    const filas = await r.json();
    return Array.isArray(filas) && filas.length > 0;
  } catch {
    // Si la base no responde no publicamos a ciegas: preferimos saltear el día
    // antes que arriesgar una story duplicada, que no se puede borrar bien.
    return true;
  }
}

async function dejarConstancia(fecha, postId) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await sb('events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        tipo_evento: 'story_fb',
        url: fecha,
        src: 'valentina',
        payload: { fecha, post_id: postId, publicado_por: 'api/story-diaria' },
      }),
    });
  } catch { /* best-effort: la story ya salió, el registro es secundario */ }
}

// Devuelve un resumen para que el Panel de Salud lo cuente en el mail diario.
async function publicarStoryDelDia({ fecha = hoyARG(), dryRun = false } = {}) {
  const TOKEN = process.env.FB_PAGE_TOKEN;
  const PAGE = process.env.FB_PAGE_ID;
  if (!TOKEN || !PAGE) return { ok: false, fecha, motivo: 'faltan FB_PAGE_TOKEN / FB_PAGE_ID' };

  const imagen = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DIR}/${fecha}.jpg`;

  // ¿Existe la story de hoy? Que no haya no es un error: el calendario tiene días
  // sin story a propósito.
  const head = await fetch(imagen, { method: 'HEAD' });
  if (!head.ok) return { ok: true, fecha, publicada: false, motivo: 'no hay story para hoy' };

  if (await yaSePublico(fecha)) {
    return { ok: true, fecha, publicada: false, motivo: 'ya se publicó hoy' };
  }
  if (dryRun) return { ok: true, fecha, publicada: false, motivo: 'dry-run', imagen };

  // 1) Subir la foto SIN publicar: queda fuera del muro y solo sirve de insumo.
  const form = new URLSearchParams();
  form.set('published', 'false');
  form.set('access_token', TOKEN);
  form.set('url', imagen);
  const subida = await (await fetch(`${GRAPH}/${PAGE}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })).json();
  if (subida.error) return { ok: false, fecha, motivo: `subiendo la foto: ${subida.error.message}` };

  // 2) Convertirla en story.
  const body = new URLSearchParams();
  body.set('access_token', TOKEN);
  body.set('photo_id', subida.id);
  const res = await (await fetch(`${GRAPH}/${PAGE}/photo_stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })).json();
  if (res.error || res.success === false) {
    return { ok: false, fecha, motivo: `publicando la story: ${(res.error || {}).message || 'error'}` };
  }

  const postId = res.post_id || res.id || subida.id;
  await dejarConstancia(fecha, postId);
  return { ok: true, fecha, publicada: true, postId };
}

module.exports = { publicarStoryDelDia, hoyARG };

// También expuesto como endpoint, para dispararlo a mano o probarlo:
//   /api/story-diaria?dry=1   → dice qué publicaría, sin publicar
module.exports.default = async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const secreto = process.env.CRON_SECRET;
  // Publicar en la fanpage es un efecto hacia afuera: no queda abierto.
  if (secreto && searchParams.get('key') !== secreto && !searchParams.get('dry')) {
    res.status(401).json({ error: 'no autorizado' });
    return;
  }
  const out = await publicarStoryDelDia({
    fecha: searchParams.get('fecha') || hoyARG(),
    dryRun: searchParams.get('dry') === '1',
  });
  res.status(out.ok ? 200 : 500).json(out);
};
