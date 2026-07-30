// api/trello-diario.js — AGENDA DIARIA DEL TABLERO (Roadmap Periodistas Digitales).
//
// Cada mañana, junto con el Panel de Salud, mira el tablero de Trello y hace DOS cosas:
//
//   1) EJECUTA lo que se puede solo. Una tarjeta es "auto-ejecutable" si su descripción
//      tiene una línea  AUTO: /api/xxx  (xxx en la lista blanca de abajo) y está vencida o
//      vence hoy. Corre ese flujo; si sale bien, tilda la tarjeta (dueComplete), la mueve a
//      "Hecho" y deja un comentario. Sirve para cerrar solas las tarjetas recurrentes de un
//      flujo que ya corre por su cuenta (reporte del funnel, sync, etc.).
//
//   2) AVISA el resto. Todas las tarjetas con FECHA (due) que NO están en Hecho ni tildadas
//      se agrupan en: 🔴 vencidas · 🟡 hoy · 🔵 próximos 3 días — agrupadas por agente. Eso
//      se devuelve como un bloque HTML que se cuela en el email del Panel de Salud (un solo
//      correo, ver salud.js). Así, si a Jose se le pasa una fecha, el mail se lo recuerda.
//
// La ejecución NO puede llamar a los flujos que disparan a este (recuperacion/salud) para no
// hacer un bucle. La lista blanca solo tiene flujos idempotentes y seguros.
//
// MODOS (?mode=): json (diagnostica + ejecuta, sin email) | send (manda un email suelto de
//   prueba) | run (uso interno: ejecuta y devuelve el bloque HTML, no manda nada).
// SEGURIDAD: CRON_SECRET (Authorization: Bearer <secret> o ?key=<secret>).
// Env: TRELLO_API_KEY, TRELLO_TOKEN, CRON_SECRET, BREVO_API_KEY, VERCEL_URL.

const BOARD_ID = '6a35bf86f4bbebc72953200f'; // Roadmap Periodistas Digitales
const TRELLO = 'https://api.trello.com/1';
const BREVO = 'https://api.brevo.com/v3';
const REPORTE_A = 'joseanselmi27@gmail.com';
const SENDER = { name: 'Agenda del tablero', email: 'jose@sistemadeingresosdiariosia.com' };

// Flujos que una tarjeta puede pedir con  AUTO: /api/xxx . Nunca incluir salud/recuperacion
// (son quienes disparan esta agenda → bucle). Todos aceptan ?key=<CRON_SECRET>.
const AUTO_WHITELIST = new Set(['/api/wa-funnel', '/api/hotmart-sync', '/api/sync-estados']);

const KEY = (process.env.TRELLO_API_KEY || '').trim();
const TOKEN = (process.env.TRELLO_TOKEN || '').trim();

// ── Cliente Trello mínimo (REST directo) ────────────────────────────────────
async function trello(path, options = {}) {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`${TRELLO}${path}${sep}key=${KEY}&token=${TOKEN}`, options);
  if (!r.ok) throw new Error(`Trello ${r.status}: ${await r.text()}`);
  return r.json();
}
const getLists = () => trello(`/boards/${BOARD_ID}/lists?fields=name,id`);
const getLabels = () => trello(`/boards/${BOARD_ID}/labels?fields=name,color`);
const getCards = () => trello(`/boards/${BOARD_ID}/cards?fields=name,desc,due,dueComplete,idList,idLabels,shortUrl`);
const moveCard = (id, listId) => trello(`/cards/${id}?idList=${listId}`, { method: 'PUT' });
const completeCard = (id) => trello(`/cards/${id}?dueComplete=true`, { method: 'PUT' });
const comment = (id, text) => trello(`/cards/${id}/actions/comments?text=${encodeURIComponent(text)}`, { method: 'POST' });

// ── Fechas en horario Argentina (UTC-3) ─────────────────────────────────────
// "Hoy" en ART: tomamos ahora, restamos 3h y nos quedamos con la fecha (YYYY-MM-DD).
function hoyART() {
  return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10);
}
function fechaART(iso) {
  return new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 10);
}
function diasDesdeHoy(dueIso) {
  const hoy = hoyART();
  const d = fechaART(dueIso);
  return Math.round((Date.parse(d) - Date.parse(hoy)) / 86400000); // <0 vencida, 0 hoy, >0 futuro
}
function labelAuto(desc) {
  const m = (desc || '').match(/AUTO:\s*(\/api\/[\w-]+)/i);
  return m ? m[1] : null;
}
function baseUrl() {
  const h = (process.env.VERCEL_URL || '').trim();
  return h ? `https://${h}` : 'https://sistemadeingresosdiariosia.com';
}

// ── Núcleo: ejecuta AUTO + arma buckets ─────────────────────────────────────
async function agendaTrello(mode = 'run') {
  if (!KEY || !TOKEN) {
    return { htmlBlock: '', ejecutadas: [], vencidas: [], hoy: [], proximas: [], error: 'faltan TRELLO_API_KEY / TRELLO_TOKEN' };
  }
  const [lists, labels, cards] = await Promise.all([getLists(), getLabels(), getCards()]);
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hecho = lists.find((l) => norm(l.name).includes('hecho'));
  const hechoId = hecho ? hecho.id : null;
  const listName = Object.fromEntries(lists.map((l) => [l.id, l.name]));
  const labelName = Object.fromEntries(labels.map((l) => [l.id, l.name]));

  const agentesDe = (c) => (c.idLabels || []).map((id) => labelName[id]).filter(Boolean).join(', ') || '—';

  // Candidatas: con fecha, no tildadas, no en Hecho.
  const activas = cards.filter((c) => c.due && !c.dueComplete && c.idList !== hechoId);

  // 1) EJECUTAR: AUTO válido + vencida u hoy.
  const ejecutadas = [];
  for (const c of activas) {
    const path = labelAuto(c.desc);
    if (!path || !AUTO_WHITELIST.has(path)) continue;
    if (diasDesdeHoy(c.due) > 0) continue; // todavía no toca
    const secret = process.env.CRON_SECRET || '';
    try {
      const r = await fetch(`${baseUrl()}${path}?key=${encodeURIComponent(secret)}`, {
        headers: secret ? { authorization: `Bearer ${secret}` } : {},
      });
      const ok = r.ok;
      if (ok && hechoId) {
        await completeCard(c.id).catch(() => {});
        await moveCard(c.id, hechoId).catch(() => {});
        await comment(c.id, `✅ Corrido automático (${hoyART()}) → ${path} respondió ${r.status}. Movida a Hecho.`).catch(() => {});
      } else if (!ok) {
        await comment(c.id, `⚠️ Auto-ejecución de ${path} falló (${r.status}) el ${hoyART()}. Queda pendiente para revisar.`).catch(() => {});
      }
      ejecutadas.push({ card: c.name, agente: agentesDe(c), path, status: r.status, ok });
    } catch (e) {
      ejecutadas.push({ card: c.name, agente: agentesDe(c), path, status: 0, ok: false, error: e.message || String(e) });
    }
  }

  // 2) AVISAR: el resto (las AUTO ok ya se fueron a Hecho, pero por las dudas re-filtramos por si quedaron).
  const ejecutadasOk = new Set(ejecutadas.filter((e) => e.ok).map((e) => e.card));
  const pendientes = activas.filter((c) => !ejecutadasOk.has(c.name));
  const fmt = (c) => ({ name: c.name, agente: agentesDe(c), lista: listName[c.idList] || '', due: fechaART(c.due), url: c.shortUrl, dias: diasDesdeHoy(c.due) });
  const vencidas = pendientes.filter((c) => diasDesdeHoy(c.due) < 0).map(fmt).sort((a, b) => a.dias - b.dias);
  const hoy = pendientes.filter((c) => diasDesdeHoy(c.due) === 0).map(fmt);
  const proximas = pendientes.filter((c) => { const d = diasDesdeHoy(c.due); return d >= 1 && d <= 3; }).map(fmt).sort((a, b) => a.dias - b.dias);

  return { htmlBlock: armarBloque({ ejecutadas, vencidas, hoy, proximas }), ejecutadas, vencidas, hoy, proximas };
}

// ── HTML del bloque (mismo estilo oscuro del Panel de Salud) ────────────────
function fila(c, color) {
  const cuando = c.dias < 0 ? `venció hace ${Math.abs(c.dias)} d` : c.dias === 0 ? 'hoy' : `en ${c.dias} d`;
  const link = c.url ? `<a href="${c.url}" style="color:#22d3ee;text-decoration:none;">abrir</a>` : '';
  return `<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;color:#e5e7eb;font-size:13px;">${c.name}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;color:#8b8ba7;font-size:12px;white-space:nowrap;">${c.agente}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;color:${color};font-size:12px;white-space:nowrap;">${cuando}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;font-size:12px;white-space:nowrap;">${link}</td>
  </tr>`;
}
function tabla(titulo, cards, color) {
  if (!cards.length) return '';
  return `<div style="margin:0 0 14px;">
    <div style="font-size:13px;font-weight:700;color:${color};margin:0 0 6px;">${titulo} (${cards.length})</div>
    <table style="width:100%;border-collapse:collapse;">${cards.map((c) => fila(c, color)).join('')}</table>
  </div>`;
}
function armarBloque({ ejecutadas, vencidas, hoy, proximas }) {
  const nada = !vencidas.length && !hoy.length && !proximas.length && !ejecutadas.length;
  const ejec = ejecutadas.length
    ? `<div style="margin:0 0 14px;">
        <div style="font-size:13px;font-weight:700;color:#4ade80;margin:0 0 6px;">Corridas solas hoy (${ejecutadas.length})</div>
        <table style="width:100%;border-collapse:collapse;">${ejecutadas.map((e) => `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;color:#e5e7eb;font-size:13px;">${e.card}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #1a1a2e;color:${e.ok ? '#4ade80' : '#f87171'};font-size:12px;white-space:nowrap;">${e.ok ? '✅ ' + e.path : '⚠️ falló ' + e.path}</td>
        </tr>`).join('')}</table>
      </div>`
    : '';
  const cuerpo = nada
    ? `<div style="color:#8b8ba7;font-size:13px;text-align:center;padding:8px 0;">Ninguna tarjeta con fecha para hoy ni vencida. 🎉</div>`
    : ejec + tabla('🔴 Vencidas', vencidas, '#f87171') + tabla('🟡 Para hoy', hoy, '#fbbf24') + tabla('🔵 Próximos 3 días', proximas, '#60a5fa');
  return `<div style="background:#0d0d1a;border:1px solid #1f1f38;border-radius:12px;padding:16px 18px;margin:0 0 20px;">
    <div style="font-size:15px;font-weight:800;color:#fff;margin:0 0 4px;">🗂️ Agenda del tablero</div>
    <div style="font-size:11px;color:#606080;margin:0 0 14px;">Tarjetas con fecha en Trello · lo vencido y lo de hoy</div>
    ${cuerpo}
  </div>`;
}

// ── Email suelto (solo para probar con ?mode=send) ──────────────────────────
async function enviar(html) {
  const key = process.env.BREVO_API_KEY;
  const r = await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: REPORTE_A }], subject: `🗂️ Agenda del tablero — ${hoyART()}`, htmlContent: `<div style="background:#07070f;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:640px;margin:0 auto;">${html}</div></div>` }),
  });
  return { ok: r.ok, status: r.status };
}

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const mode = searchParams.get('mode') || 'json';
  const secret = process.env.CRON_SECRET || '';
  const authOk = !secret || req.headers.authorization === `Bearer ${secret}` || searchParams.get('key') === secret;
  if (!authOk) { res.status(401).json({ error: 'unauthorized' }); return; }
  try {
    const out = await agendaTrello(mode);
    if (mode === 'send') {
      const sent = await enviar(out.htmlBlock);
      res.status(200).json({ mode, enviado: sent.ok, status: sent.status, ejecutadas: out.ejecutadas, vencidas: out.vencidas.length, hoy: out.hoy.length, proximas: out.proximas.length });
      return;
    }
    res.status(200).json({ mode, ...out, htmlBlock: undefined }); // no devolvemos el HTML crudo en json
  } catch (e) {
    console.error('trello-diario error', e);
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
module.exports.agendaTrello = agendaTrello;
