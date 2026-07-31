// Sync del ESTADO de los agentes del equipo → tabla `agentes_estado`
// (Supabase periodistas-marketing). Espejo en la nube de ads-agent/state/*.json.
//
// PARA QUÉ (tarjeta Trello #32): el "Panel de Comando" corre en la nube y NO puede
// clonar el repo (directorio vacío, sin git) → no puede leer ads-agent/state/*.json y
// el mail diario salía sin los datos de los agentes. Solución (Plan B): este sync corre
// donde SÍ hay internet + credenciales (Vercel), lee los state JSON del GitHub público
// y los deja en `agentes_estado`; el Panel los lee por MCP de Supabase (que la nube sí
// alcanza, igual que la sección Ventas). Detalle en ads-agent/docs/NOTIFICACIONES-CARTERO.md.
//
// CÓMO: lista los *-state.json del repo (GitHub contents API; si falla, usa una lista
// fija de respaldo), baja cada uno por raw.githubusercontent (repo público, sin token) y
// hace UPSERT por `agente` en una sola llamada a PostgREST. Best-effort, igual que
// meta-spend-sync: lo llama api/recuperacion.js en su corrida diaria y, si falla, no
// tumba nada. Freshness = último push del repo (el detalle en vivo está en /rutina local).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ya presentes en Vercel).

const REPO   = 'joseanselmi/periodistas-digitales';
const BRANCH = 'master';
const DIR    = 'ads-agent/state';
const RAW    = (name) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DIR}/${name}`;

// Respaldo si la contents API de GitHub falla (rate limit / 403): no dejamos el panel a
// oscuras. Mantener en sync si se agrega/quita un agente (aunque el listado dinámico ya
// los toma solos cuando la API responde).
// 2026-08-01: se retiraron mateo, nicolas, valeria y max. Los tres últimos se
// unificaron en la skill `revisar-codigo-leadr` (revisan código de otro repo, no
// necesitan estado propio). Mateo se dio de baja por decisión de Jose: auditaba
// sus campañas él mismo y las 27 recomendaciones nunca se leyeron.
const AGENTES_FALLBACK = [
  'bruno', 'clara', 'dante', 'director', 'luna',
  'miguel', 'ricardo', 'sofia', 'valentina',
];

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// Lista los archivos *-state.json del repo. Dinámico (toma agentes nuevos solos); si la
// API de GitHub falla, cae a la lista fija.
async function listStateFiles() {
  try {
    const r = await fetchWithTimeout(
      `https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`,
      { headers: { 'User-Agent': 'periodistas-sync', Accept: 'application/vnd.github+json' } },
    );
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list)) {
        const names = list
          .filter((e) => e && e.type === 'file' && /-state\.json$/.test(e.name))
          .map((e) => e.name);
        if (names.length) return names;
      }
    }
  } catch { /* cae al fallback */ }
  return AGENTES_FALLBACK.map((a) => `${a}-state.json`);
}

async function runSyncEstados() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase sin configurar (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');

  const files = await listStateFiles();
  const now = new Date().toISOString();
  const rows = [];
  const errores = [];

  for (const name of files) {
    const agente = name.replace(/-state\.json$/, '');
    try {
      const r = await fetchWithTimeout(RAW(name), { headers: { 'User-Agent': 'periodistas-sync' }, cache: 'no-store' });
      if (!r.ok) { errores.push(`${agente}: HTTP ${r.status}`); continue; }
      const estado = JSON.parse(await r.text());
      rows.push({ agente, estado, actualizado_en: now });
    } catch (e) {
      errores.push(`${agente}: ${e.message}`);
    }
  }

  if (!rows.length) throw new Error('no se pudo leer ningún state de GitHub (' + errores.join('; ') + ')');

  // Upsert por PK (agente) en una sola llamada.
  const up = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/agentes_estado`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  }, 10000);

  if (!up.ok) {
    const detalle = await up.text().catch(() => '');
    throw new Error(`Supabase upsert HTTP ${up.status}: ${detalle.slice(0, 200)}`);
  }

  return { ok: true, count: rows.length, agentes: rows.map((r) => r.agente), errores };
}

module.exports = { runSyncEstados };
