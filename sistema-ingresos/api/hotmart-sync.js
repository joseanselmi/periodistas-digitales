// Endpoint para disparar el sync de Hotmart a mano (o testearlo). NO tiene cron propio
// (Hobby permite 2 y ya están usados): el cron real lo llama api/recuperacion.js al inicio
// de su corrida diaria. La lógica vive en api/_lib/hotmart-sync.js.
// Seguridad: CRON_SECRET (Authorization: Bearer <secret> o ?key=<secret>).

const { runHotmartSync } = require('./_lib/hotmart-sync');

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret
    || req.headers.authorization === `Bearer ${secret}`
    || searchParams.get('key') === secret;
  if (!authOk) return res.status(401).json({ error: 'unauthorized' });

  try {
    const out = await runHotmartSync();
    return res.status(200).json({ ok: true, ...out });
  } catch (e) {
    console.error('hotmart-sync endpoint', e);
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
