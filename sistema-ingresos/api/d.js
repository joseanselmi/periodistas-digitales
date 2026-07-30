// Redirector con tracking para descargas de PDF.
// Uso: /api/d?file=guia-periodico-digital-ig-fb.pdf&src=WhatsApp-Regalo3&sck=wa3
//
// Por qué existe: un archivo .pdf servido como estático no deja ningún rastro
// en los logs de Vercel (solo las invocaciones de funciones se loguean). Esta
// función registra el hit y recién después redirige al PDF real — invisible
// para quien hace clic (mismo PDF, demora imperceptible).
//
// Además del log de Vercel (efímero), guarda CADA apertura en la tabla `events`
// de la base de marketing (tipo_evento='pdf_open') para que sea consultable:
// cuántas veces se abrió cada guía, por qué origen (src). Best-effort: si la
// base falla o tarda, redirige igual (nunca frena la descarga).
//
// `file` está restringido a un patrón seguro (sin protocolo/dominio/"..") para
// que esto no se pueda usar como open-redirect hacia un sitio externo.

const SAFE_FILENAME = /^[a-z0-9][a-z0-9-]*\.pdf$/i;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Registra la apertura en `events`. Best-effort con timeout (no frena el redirect).
async function logApertura({ file, src, sck, ip, ua }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1500);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tipo_evento: 'pdf_open',
        url: file,
        src: src || null,
        sck: sck || null,
        ip: ip || null,
        user_agent: ua || null,
        payload: { file, src: src || null, sck: sck || null },
      }),
      signal: ctrl.signal,
    });
  } catch { /* best-effort */ }
  finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const file = searchParams.get('file');
  const src = searchParams.get('src');
  const sck = searchParams.get('sck');

  if (!file || !SAFE_FILENAME.test(file)) {
    res.status(400).send('Falta o es inválido el parámetro "file".');
    return;
  }

  // Visible vía `vercel logs` — no bloquea el redirect si falla nada acá.
  console.log(JSON.stringify({ type: 'pdf_download', file, src: src || null, sck: sck || null, ts: new Date().toISOString() }));

  // Guarda la apertura en la base (best-effort, con timeout corto).
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null;
  const ua = req.headers['user-agent'] || null;
  await logApertura({ file, src, sck, ip, ua });

  res.writeHead(302, { Location: `/${file}` });
  res.end();
}
