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
//
// ⚠️ ADEMÁS ATIENDE LAS BAJAS: `/api/d?baja=<email>&t=<firma>` (ver _lib/baja.js).
// No es que pinte acá — es que `sistema-ingresos/api/` está exactamente en 12
// funciones, el tope del plan Hobby de Vercel, y crear `/api/baja` rompería el
// deploy entero. Esta función ya es pública y ya recibe clics desde los mails,
// así que es el lugar menos malo. La baja se resuelve ANTES de mirar `file`.

const baja = require('./_lib/baja');

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
        // Sin esto la fila queda sin fecha: se sabe CUÁNTOS abrieron pero no CUÁNDO,
        // y no se puede cruzar con el día que salió cada correo ni ver evolución.
        // (Las 322 aperturas anteriores al 31/07/2026 quedaron sin fecha por este motivo.)
        ocurrido_en: new Date().toISOString(),
        payload: { file, src: src || null, sck: sck || null },
      }),
      signal: ctrl.signal,
    });
  } catch { /* best-effort */ }
  finally { clearTimeout(t); }
}

// Lee un cuerpo `application/x-www-form-urlencoded` a mano. Sólo se usa como respaldo cuando el
// runtime no dejó `req.body` armado. Best-effort: ante cualquier problema devuelve {} y el
// llamador sigue por el camino de la firma, que es el normal.
async function leerCuerpo(req) {
  try {
    let crudo = '';
    for await (const trozo of req) crudo += trozo;
    if (!crudo) return {};
    if (crudo.trim().startsWith('{')) return JSON.parse(crudo);
    return Object.fromEntries(new URLSearchParams(crudo));
  } catch { return {}; }
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const file = searchParams.get('file');
  const src = searchParams.get('src');
  const sck = searchParams.get('sck');

  // ── BAJA ──────────────────────────────────────────────────────────────────
  // Dos formas de llegar acá, y las dos tienen que funcionar:
  //   - GET  → la persona hizo clic en "Darte de baja" al pie del mail. Ve una página.
  //   - POST → el cliente de correo (Gmail, Outlook) apretó el botón de baja de su propia
  //            interfaz, por la cabecera List-Unsubscribe-Post. Nadie ve nada, sólo el 200.
  // Si el POST no funcionara, Gmail deja de ofrecer su botón y volvemos a que la única salida
  // sea "Denunciar como spam" — que es justo lo que esto viene a evitar.
  // El formulario de la red de seguridad manda el email en el CUERPO, no en la URL.
  // Vercel suele dejar `req.body` ya parseado, pero no siempre según el content-type — y si no
  // llegara, el formulario fallaría en silencio y la persona volvería a quedarse sin salida.
  // Así que se lee el crudo como respaldo. No toca el camino del one-click, que no mira el cuerpo.
  const cuerpo = req.method === 'POST' ? (req.body || await leerCuerpo(req)) : {};
  const confirmado = String(cuerpo.confirmar || '') === '1';
  const email = searchParams.get('baja') || (confirmado ? cuerpo.baja : '');
  if (email) {
    // one-click = el botón de baja del propio Gmail/Outlook (cabecera List-Unsubscribe-Post).
    // El envío del formulario también es POST, así que hay que distinguirlos: `confirmar=1`.
    const unClic = req.method === 'POST' && !confirmado;
    if (!confirmado && !baja.firmaValida(email, searchParams.get('t'))) {
      console.log(JSON.stringify({ type: 'baja_firma_invalida', ts: new Date().toISOString() }));
      // ⚠️ NO se procesa la baja, pero TAMPOCO se deja a la persona sin salida (14/08/2026).
      //   - one-click: 400 y punto. Nadie está mirando una pantalla y una firma mala en un POST
      //     automático es un robot, no alguien que se quiere ir.
      //   - clic humano: se le pide que escriba su dirección y confirme (ver `paginaConfirmar`).
      //     Antes veía "no pudimos darte de baja" y el botón siguiente es "spam" — que le cuesta
      //     la entrega a TODOS los demás, no sólo a ese mail.
      if (unClic) { res.status(400).send('firma inválida'); return; }
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.status(200).send(baja.paginaConfirmar(email));
      return;
    }
    const r = await baja.darDeBaja(email, unClic ? 'list-unsubscribe' : (confirmado ? 'formulario' : 'link-pie'));
    console.log(JSON.stringify({ type: 'baja_email', ok: r.ok, origen: unClic ? 'one-click' : 'link', ts: new Date().toISOString() }));
    if (unClic) { res.status(200).send('OK'); return; }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.status(r.ok ? 200 : 500).send(baja.paginaHtml({ ok: r.ok, email }));
    return;
  }

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
