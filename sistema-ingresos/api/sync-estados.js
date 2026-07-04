// Endpoint que dispara el sync de estados de agentes → tabla `agentes_estado`.
// Normalmente NO se llama solo: api/recuperacion.js corre runSyncEstados() en su cron
// diario (piggyback, sin cron propio para no pasar el tope del plan Hobby). Este endpoint
// queda para: sembrar/forzar el sync a mano y para un futuro disparo on-demand (ej. Make).
//
// Uso:  GET /api/sync-estados?key=<CRON_SECRET>   → corre el sync y devuelve el resumen
// Seguridad: CRON_SECRET (header Authorization: Bearer <secret> o ?key=<secret>).
// Detalle: ads-agent/NOTIFICACIONES-CARTERO.md · tarjeta Trello #32.

const { runSyncEstados } = require('./_lib/sync-estados');

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) return res.status(401).json({ error: 'unauthorized' });

  try {
    const r = await runSyncEstados();
    console.log(JSON.stringify({ type: 'sync_estados', ...r }));
    return res.status(200).json(r);
  } catch (e) {
    console.error('sync-estados:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
