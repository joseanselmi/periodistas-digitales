// Helper compartido de WhatsApp para la recuperación de clientes potenciales.
// Lo usan DOS funciones: el webhook (api/hotmart.js) para el 1er mensaje instantáneo
// y el motor diario (api/recuperacion.js) para el recordatorio. Carpeta _lib → Vercel
// no la enruta como función; se bundlea al requerirla.
//
// Envía por WhatsApp Cloud API (mismo token que el embudo de regalos, wa-funnel.js).
// Los mensajes salen SIEMPRE como PLANTILLA APROBADA (Meta lo exige para escribir
// primero a alguien que no nos escribió). Las 4 plantillas: recup_abandono_1/2 y
// recup_rechazo_1/2 (una variable {{1}} = nombre, + botón URL estático con ?src=).
//
// Variables de entorno: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID.

const GRAPH = 'https://graph.facebook.com/v21.0';
const BASE = 'https://sistemadeingresosdiariosia.com';

// Link del botón por tipo (con ?src= para atribuir la venta recuperada en `ventas`).
const LINKS = {
  carrito_abandonado: `${BASE}/?src=recup-abandono`,
  pago_rechazado: `${BASE}/?src=recup-rechazo`,
};

// Plantilla aprobada por tipo y paso. El paso 1 lo manda el webhook al instante;
// el paso 2 lo manda el cron al día siguiente.
const TEMPLATES = {
  carrito_abandonado: { 1: 'recup_abandono_1', 2: 'recup_abandono_2' },
  pago_rechazado: { 1: 'recup_rechazo_1', 2: 'recup_rechazo_2' },
};

// Normaliza a E.164 sin "+". Corrige el bug del "9" faltante en móviles argentinos
// (idéntico a wa-funnel.js). Para otros países solo deja los dígitos.
function normalizePhone(raw) {
  let d = String(raw == null ? '' : raw).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('54') && d[2] !== '9') d = '54' + '9' + d.slice(2);
  return d;
}

function primerNombre(nombre) {
  const n = String(nombre || '').trim().split(/\s+/)[0] || '';
  return n || 'Hola';
}

// Manda una plantilla de recuperación. Devuelve { ok, status, body, wamid }.
async function sendRecupTemplate({ to, tmpl, nombre }) {
  const token = process.env.WHATSAPP_TOKEN;
  const pn = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: tmpl,
      language: { code: 'es' },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: primerNombre(nombre) }] },
      ],
    },
  };
  const r = await fetch(`${GRAPH}/${pn}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body: j, wamid: j && j.messages && j.messages[0] && j.messages[0].id };
}

module.exports = { GRAPH, BASE, LINKS, TEMPLATES, normalizePhone, primerNombre, sendRecupTemplate };
