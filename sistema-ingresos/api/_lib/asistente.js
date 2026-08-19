// api/_lib/asistente.js — Cerebro del asistente de WhatsApp.
//
// Decide, para cada mensaje entrante, QUÉ responder según de dónde viene la persona
// (comprador / carrito / rechazo / lead / nuevo) y qué escribió o qué botón tocó.
// Devuelve una "acción" que api/wa-inbox.js ejecuta (o muestra como borrador si el
// asistente todavía está apagado con ASISTENTE_ENABLED != 1).
//
// TODO EL TEXTO QUE VE EL CLIENTE ESTÁ ACÁ ARRIBA, a propósito, para que se pueda
// revisar y editar sin tocar la lógica. Los {nombre} se reemplazan solos.

const { BASE, primerNombre, logConversacion } = require('./wa');

// ── Links que usan las respuestas ────────────────────────────────────────────
const LANDING = `${BASE}/?src=wa-asistente`;
// Link de pago = SIEMPRE el checkout de Hotmart (no la landing): quien tiene un problema
// de pago ya decidió comprar; necesita completar el pago, no volver a la página de ventas.
// El ?src= alimenta el campo "Origen" de Hotmart, con un identificador PROPIO del asistente
// (separado del de recuperación) para medir si el bot cierra ventas. La venta recuperada se
// cuenta igual por cruce de email en `ventas`, así que separar el src NO rompe esa métrica.
const HOTMART_CHECKOUT = 'https://pay.hotmart.com/P106404871J?checkoutMode=10';
function checkoutFor(segmento) {
  const src = segmento === 'carrito' ? 'wa-asistente-abandono'
            : segmento === 'rechazo' ? 'wa-asistente-rechazo'
            : 'wa-asistente-pago';
  return `${HOTMART_CHECKOUT}&src=${src}&utm_source=wa-asistente&utm_medium=whatsapp`;
}
// Las 5 guías del embudo, en orden cronológico de envío (R1 día 0 … R5 día 8). El link
// pasa por /api/d (redirige al PDF y registra la descarga). src=wa-reenvio para
// distinguir en las métricas los reenvíos del asistente.
const D = (file) => `${BASE}/api/d?file=${file}&src=wa-reenvio&sck=wa-reenvio`;
const PDF = {
  1: { label: 'la Guía Claude para periodistas', link: D('guia-claude-periodistas.pdf') },
  2: { label: 'la guía completa de +50 prompts', link: D('guia-completa-50-prompts.pdf') },
  3: { label: 'la guía del periódico digital', link: D('guia-periodico-digital-ig-fb.pdf') },
  4: { label: 'la guía de los 5 pilares de ingresos', link: D('guia-5-pilares-ingresos-periodico-digital.pdf') },
  5: { label: 'la guía de agentes de IA', link: D('guia-agentes-ia-periodistas.pdf') },
};

// ── Menús guiados por segmento (hasta 3 botones; title máx 20 caracteres) ─────
const MENUS = {
  lead: {
    body: '¡Hola {nombre}! 👋 Soy el asistente de Periodistas Digitales. Para ayudarte al toque, elegí una opción 👇',
    buttons: [
      { id: 'no_llego', title: '📥 No llegó mi guía' },
      { id: 'como', title: '❓ Cómo funciona' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  carrito: {
    body: '¡Hola {nombre}! 👋 Vi que estabas por sumarte al curso. ¿En qué te doy una mano? 👇',
    buttons: [
      { id: 'pago', title: '💳 Problema al pagar' },
      { id: 'duda', title: '❓ Tengo una duda' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  rechazo: {
    body: '¡Hola {nombre}! 👋 Vi que tu pago no llegó a procesarse. Lo resolvemos en un minuto 👇',
    buttons: [
      { id: 'pago', title: '💳 Reintentar pago' },
      { id: 'duda', title: '❓ Tengo una duda' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  comprador: {
    body: '¡Hola {nombre}! 👋 ¡Gracias por tu compra! 🙌 ¿En qué te ayudo? 👇',
    buttons: [
      { id: 'acceso', title: '🔑 No puedo entrar' },
      { id: 'leadr', title: '🎁 Mi mes de Leadr' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
  nuevo: {
    body: '¡Hola! 👋 Soy el asistente de Periodistas Digitales. ¿Qué estás buscando? 👇',
    buttons: [
      { id: 'no_llego', title: '📥 No llegó mi guía' },
      { id: 'info', title: '📘 Info del curso' },
      { id: 'humano', title: '🧑 Hablar con equipo' },
    ],
  },
};

// ── Respuestas fijas (las {..} se reemplazan solas) ──────────────────────────
const RESP = {
  info: 'Te cuento rápido, {nombre} 👇\n\n"Sistema de Ingresos Diarios" es un método para que, usando IA, un periodista arme ingresos propios sin depender de un medio. Toda la info y cómo empezar están acá:\n{LANDING}\n\nSi tenés una duda puntual, escribime y te respondo. 🙌',
  pago: '¡Tranqui, {nombre}, lo resolvemos! 🙌\n\nProbá de nuevo desde acá (muchas veces es solo reintentar):\n{CHECKOUT}\n\nSi la tarjeta te rechaza, casi siempre es que bloquea cobros del exterior: probá con *otra tarjeta* o con *PayPal* (está en la misma página). Si aún así no sale, escribí *equipo* y te damos una mano. 🙌',
  duda: '¡Dale, contame! 🙌 Escribime en una línea qué duda tenés y te respondo.\n\n(Toda la info también está acá: {LANDING})',
  acceso: '¡Vamos a resolverlo, {nombre}! 🔑\n\nEl acceso llega al mail con el que compraste (revisá también spam), de parte de Hotmart. Si no lo encontrás, escribí *equipo* y una persona te lo reenvía enseguida.',
  // El mes de Leadr Pro se activa SOLO con la compra (API interna course-access); no hay
  // link de auto-activación → si no aparece, se escala a una persona con la palabra "equipo".
  leadr: '¡Tu regalo! 🎁 Con la compra ya tenés *1 mes de Leadr Pro activado*.\n\nEntrá a www.leadr.cloud con el *mismo mail* de tu compra y ya lo vas a ver como Pro. Si no aparece, escribí *equipo* y lo dejamos listo. 🙌',
  ack_humano: '¡Dale, {nombre}! 🙌 Ya le aviso al equipo y te responde a la brevedad por acá.',
  ack_media: '¡Recibí tu mensaje, {nombre}! 🙌 Ya se lo paso al equipo y te responde en un rato.',
  aun_no: '¡Sin problema, {nombre}! 🙌 Cuando quieras te muestro cómo se arma, sin apuro. Igual te dejo todo acá por si le querés dar una mirada 👉 {LANDING}\n\nY si te queda alguna duda, escribime por acá.',
  // Cierre cordial: cuando la persona agradece o dice "lo reviso". NO lleva botones ni link
  // ni CTA — solo una respuesta cálida para que no quede en visto (antes caía en el menú).
  cierre: '¡Genial, {nombre}! 🙌 Cualquier cosa que necesites, me escribís por acá cuando quieras.',
  // Anti-bucle: la persona repitió lo mismo varias veces y el bot no lo pudo resolver →
  // se corta el loop y se le pasa a una persona (no se le manda el mismo texto otra vez).
  bucle: '¡Perdón, {nombre}! 🙏 Veo que esto no se te está resolviendo por acá. Ya le aviso a una persona del equipo para que te dé una mano directo.',
};

// ── Utilidades ───────────────────────────────────────────────────────────────
// Baja a minúsculas y saca acentos (rango de marcas diacríticas combinantes
// U+0300–U+036F) para que la detección tolere "cómo"/"como", "recibí"/"recibi", etc.
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(DIACRITICOS, '');
}

// `segmento` (opcional) define el ?src= del link de pago: carrito→abandono, rechazo→rechazo,
// resto→genérico. Sin segmento (la mayoría de las respuestas, que no llevan {CHECKOUT}) da
// el link genérico, pero como esos textos no contienen {CHECKOUT} el reemplazo no aplica.
function fill(tpl, nombre, segmento) {
  return String(tpl || '')
    .replace(/\{nombre\}/g, primerNombre(nombre))
    .replace(/\{LANDING\}/g, LANDING)
    .replace(/\{CHECKOUT\}/g, checkoutFor(segmento));
}

// Segmento a partir del contexto de la base (ficha).
function segmentoDe(ctx) {
  if (!ctx || typeof ctx !== 'object') return 'nuevo';
  if (ctx.compra) return 'comprador';
  if (ctx.potencial) return /rechaz/i.test(String(ctx.potencial.tipo || '')) ? 'rechazo' : 'carrito';
  if (ctx.lead) return 'lead';
  return 'nuevo';
}

// Última guía que se le mandó (para reenviarla si dice "no me llegó"). Identifica lo más
// fino posible: usa el estado real de Brevo (WA_STAGE = regalos de WhatsApp 3/4/oferta,
// MAIL5_AT = regalo 5 por email); si no hay dato de Brevo, estima por los días desde que
// se registró siguiendo el calendario del embudo (R1 día 0, R2 día 2, R3 día 5, R4 día 7,
// R5 día 8). Por defecto, la guía principal (la que promete el anuncio).
function ultimoRegalo(estado, diasRegistro) {
  const stage = estado ? Number(estado.stage || 0) : null;
  const mail5 = estado ? estado.mail5 : null;
  if (stage != null) {                                  // es un lead con datos de Brevo
    if (stage >= 4) return mail5 ? PDF[5] : PDF[4];      // ya recibió R4 (y R5 si mail5) / oferta
    if (stage === 3) return PDF[3];                       // último = R3 (WhatsApp)
    return (diasRegistro != null && diasRegistro >= 2) ? PDF[2] : PDF[1]; // stage 0 → emails R1/R2
  }
  if (diasRegistro != null) {                            // sin Brevo, estimo por antigüedad
    if (diasRegistro >= 8) return PDF[5];
    if (diasRegistro >= 7) return PDF[4];
    if (diasRegistro >= 5) return PDF[3];
    if (diasRegistro >= 2) return PDF[2];
    return PDF[1];
  }
  return PDF[1];                                          // sin datos → la guía principal
}

// ¿El mensaje es un cierre cordial ("gracias", "lo reviso", "estaré en contacto")?
// Se chequea ANTES que 'como/precio' pero devuelve false si trae una pregunta/interés
// real sobre el curso, para no confundir "gracias, ¿cuánto sale?" con un simple cierre.
function esCierre(t) {
  if (!t) return false;
  if (/quiero saber|como (funciona|empiezo|es|arranco|uso|acced|entro|hago|puedo)|de que se trata|me interesa|explica|contame|cuanto|precio|cuesta|vale|costo|no (me )?(lleg|abre|aparec)/.test(t)) return false;
  if (/^(muchas gracias|mil gracias|gracias|ok+|oka+|okey|okay|dale|listo|perfecto|genial|buenisimo|barbaro|de acuerdo|entendido|excelente)\b/.test(t)) return true;
  if (/\bgracias\b|(lo|la) (reviso|revisare|voy a revisar|veo|vere|leo|leere|lee|mirare|miro|chequeo|checo|dare lectura)\b|doy lectura|revisare|lo revisare|en breve|mas tarde|mas rato|espero\b|esperare|quedo esperando|aguardo|estare (en contacto|pendiente|atento|atenta)|quedo (atento|atenta|pendiente)|muy interesante|si tengo (alguna )?(duda|consulta)|cualquier (duda|cosa)|ya (te|les) (aviso|cuento|escribo)/.test(t)) return true;
  return false;
}

// Clasifica el texto libre en una intención. Devuelve null si no matchea nada claro.
function clasificar(texto) {
  const t = norm(texto);
  if (!t) return null;
  if (/\b(hablar|habla|comunicar|contactar)\b.*(persona|alguien|jose|humano|asesor|vos|uds|ustedes)|hablar con|quiero hablar|atencion al cliente|un asesor|una persona real|operador|\bequipo\b|no (me |se )?abre|no (me )?abrio|no puedo abrir|sigue sin abrir|no (anda|funciona) el link|link (roto|no anda|no funciona)|con quien (hablo|interactuo|estoy hablando|me comunico)|(sos|eres|es|hablo con) (un |una )?(bot|robot|maquina|maquina|persona|humano|humana)|hay (alguien|una persona|un humano|un asesor)|ampliacion de (su|el|tu) aviso|ampliar (la |el |su |mas )?(info|informacion|aviso)/.test(t)) return 'humano';
  if (/no.*(lleg|recib|aparec|puedo ver)|donde.*(esta|regalo|guia|pdf|link|material|archivo)|no me llega|no me aparece|no lo tengo/.test(t)) return 'no_llego';
  // Problema de pago o intención de pagar — NO una pregunta de precio. Requiere contexto de
  // problema/compra ("no puedo pagar", "me rechazó", "quiero pagar"), no el suelto "pag":
  // así "¿es pago?" / "¿hay que pagar?" caen en 'precio' (más abajo), no acá.
  if (/no puedo pagar|no me deja pagar|error al pagar|falla el pago|no se proceso|no se concreto|problema.*(pag|tarjeta|cobr)|(tarjeta|pago|cobro).*(rechaz|fall|error|no anda|no funciona)|rechaz|tarjeta|debit|credit|transferenc|checkout|medio de pago|forma de pago|metodo de pago|quiero pagar|como pago|donde pago|link de pago/.test(t)) return 'pago';
  if (/acces|acceder|entrar|ingresar|no me deja entrar|clave|contrasen|usuario|login|donde veo el curso|no puedo ver el curso/.test(t)) return 'acceso';
  if (/leadr|mes gratis|bono|regalo del curso/.test(t)) return 'leadr';
  if (/precio|cuanto|sale|cuesta|vale|cuanto es|costo|gratis|gratuit|es pago|de pago|se paga|hay que pagar|tiene (algun )?(costo|precio)/.test(t)) return 'precio';
  if (esCierre(t)) return 'cierre';
  if (/como (funciona|empiezo|es|arranco|uso|acced|entro)|de que se trata|se trata|informacion|info\b|quiero saber|me interesa|contame|explicame|duda|consulta/.test(t)) return 'como';
  return null;
}

// Botones de las PLANTILLAS del embudo (Regalos 3 y 4) → intención. Llegan como type
// 'button' (quick-reply de plantilla), SIN un id nuestro. Antes caían en "no es texto →
// escalar" y el lead quedaba esperando a una persona; ahora los respondemos al toque.
//   "Quiero saber cómo" (Regalo 3) / "Sí, mostrámelo" (Regalo 4) → info + link
//   "Todavía no" (Regalo 4)                                       → respuesta sin presión
function intentDeBotonPlantilla(texto) {
  const t = norm(texto);
  if (!t) return null;
  if (/quiero saber como/.test(t)) return 'como';
  if (/mostramelo|mostrame|si,? mostra/.test(t)) return 'como';
  if (/todavia no|aun no|mas tarde|despues|luego/.test(t)) return 'aun_no';
  return null;
}

// Construye la acción para un MENÚ del segmento.
function accionMenu(segmento, nombre) {
  const m = MENUS[segmento] || MENUS.nuevo;
  return {
    clase: 'menu',
    body: fill(m.body, nombre),
    buttons: m.buttons,
    intent: 'menu',
    resumen: `🤖 Le mandé el menú de opciones a ${primerNombre(nombre)}.`,
  };
}

function accionTexto(body, intent, resumen) {
  return { clase: 'texto', body, buttons: null, intent, resumen };
}

function accionEscalar(nombre, ack) {
  return {
    clase: 'escalar',
    body: fill(ack || RESP.ack_humano, nombre),
    buttons: null,
    intent: 'humano',
    resumen: `🧑 ${primerNombre(nombre)} necesita que le contestes vos.`,
  };
}

// Anti-bucle: la persona repitió el mismo pedido varias veces y el bot no lo resolvió.
// Se corta el loop (no se le manda el mismo texto de nuevo) y se escala a una persona.
function accionBucle(nombre) {
  return {
    clase: 'escalar',
    body: fill(RESP.bucle, nombre),
    buttons: null,
    intent: 'humano',
    resumen: `🔁 ${primerNombre(nombre)} repitió lo mismo varias veces y el bot no lo pudo resolver — te lo paso.`,
  };
}

// Mapea (segmento, intención) → acción concreta.
function resolver(segmento, intent, nombre, estado, diasRegistro) {
  const n = primerNombre(nombre);
  if (intent === 'humano') return accionEscalar(nombre);

  if (intent === 'no_llego') {
    if (segmento === 'comprador') return accionTexto(fill(RESP.acceso, nombre), 'acceso', `🤖 Le di los pasos de acceso a ${n}.`);
    const g = ultimoRegalo(estado, diasRegistro);
    const body = `¡Perdón por eso, ${n}! 🙏 Acá va de nuevo ${g.label} 👇\n${g.link}\n\nSi aún así no se te abre, escribí *equipo* y te paso con una persona que te da una mano. 🙌`;
    return accionTexto(body, 'no_llego', `🤖 Le reenvié ${g.label} a ${n} (dijo que no le llegó).`);
  }
  if (intent === 'pago') return accionTexto(fill(RESP.pago, nombre, segmento), 'pago', `🤖 Le reenvié el link de pago a ${n}.`);
  if (intent === 'acceso') return accionTexto(fill(RESP.acceso, nombre), 'acceso', `🤖 Le di los pasos de acceso a ${n}.`);
  if (intent === 'leadr') return accionTexto(fill(RESP.leadr, nombre), 'leadr', `🤖 Le expliqué lo del mes de Leadr a ${n}.`);
  if (intent === 'duda') return accionTexto(fill(RESP.duda, nombre), 'duda', `🤖 Le pedí a ${n} que me cuente su duda.`);
  if (intent === 'cierre') return accionTexto(fill(RESP.cierre, nombre), 'cierre', `🤖 ${n} agradeció / dijo que lo revisa; le respondí cordial sin presionar (sin menú).`);
  if (intent === 'aun_no') return accionTexto(fill(RESP.aun_no, nombre), 'aun_no', `🤖 ${n} dijo "todavía no"; le respondí sin presión y le dejé el link.`);
  if (intent === 'como' || intent === 'precio' || intent === 'info') return accionTexto(fill(RESP.info, nombre), 'info', `🤖 Le pasé la info del curso (con el link) a ${n}.`);

  // Sin intención clara → menú del segmento.
  return accionMenu(segmento, nombre);
}

// ── Decisión principal ───────────────────────────────────────────────────────
// entrada: { ctx, nombre, texto, tipoMsg, buttonId, estado, diasRegistro }
//   ctx          = { compra?, potencial?, lead? } de la RPC
//   tipoMsg      = 'text' | 'interactive' | 'image' | 'audio' | ...
//   buttonId     = id del botón si tocaron uno (interactive)
//   estado       = { stage, mail5, sentAt } de Brevo (opcional, para reenviar regalo)
//   diasRegistro = días desde que se registró el lead (fallback del regalo)
function decidir({ ctx, nombre, texto, tipoMsg, buttonId, estado, diasRegistro }) {
  const segmento = segmentoDe(ctx);

  // 1) Tocó un botón de NUESTRO menú (interactive con id propio).
  if (buttonId) {
    if (buttonId === 'humano' || buttonId === 'compre') return accionEscalar(nombre);
    return resolver(segmento, buttonId === 'info' ? 'como' : buttonId, nombre, estado, diasRegistro);
  }

  // 2) Tocó un botón de una PLANTILLA del embudo ("Quiero saber cómo" / "Sí, mostrámelo" /
  //    "Todavía no"). Llega como type 'button' sin id nuestro → lo respondemos al toque
  //    (antes caía en el punto 3 y escalaba a un humano que casi nunca contestaba).
  if (tipoMsg === 'button') {
    const btnIntent = intentDeBotonPlantilla(texto);
    if (btnIntent) return resolver(segmento, btnIntent, nombre, estado, diasRegistro);
    return accionEscalar(nombre, RESP.ack_media); // botón desconocido → lo atiende una persona
  }

  // 3) Mensaje que no es texto (audio/imagen/etc.) → lo atiende una persona.
  if (tipoMsg && tipoMsg !== 'text') return accionEscalar(nombre, RESP.ack_media);

  // 3) Texto libre → clasificar.
  const intent = clasificar(texto);
  return resolver(segmento, intent, nombre, estado, diasRegistro);
}

// ── Estado bot↔humano (tabla wa_bot_estado en la base de marketing) ──────────
// Best-effort: si Supabase no está o falla, se asume modo 'bot' (nunca frena nada).
const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const HUMANO_HORAS = 24; // cuánto cede el bot el control tras una respuesta de Jose

async function sbFetch(path, opts, ms = 2500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(`${SB_URL}/rest/v1/${path}`, {
      ...opts,
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'content-type': 'application/json',
        ...(opts && opts.headers),
      },
      signal: ctrl.signal,
    });
  } finally { clearTimeout(t); }
}

// ¿El bot está en pausa para este número? Sí cuando Jose ya tomó la conversación
// (modo 'humano') o cuando el bot escaló y está ESPERANDO que conteste una persona
// (modo 'esperando'). En ambos casos respeta el vencimiento (humano_hasta): pasado ese
// plazo el bot vuelve a atender solo, para que nadie quede en silencio permanente.
async function enPausa(telefono) {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const r = await sbFetch(`wa_bot_estado?telefono=eq.${encodeURIComponent(telefono)}&select=modo,humano_hasta`, {});
    if (!r.ok) return false;
    const rows = await r.json();
    const row = rows && rows[0];
    if (!row || (row.modo !== 'humano' && row.modo !== 'esperando')) return false;
    if (!row.humano_hasta) return true;
    return new Date(row.humano_hasta).getTime() > Date.now();
  } catch { return false; }
}

// Lee el estado de repetición para el anti-bucle: qué intent resolvió el bot por última
// vez, cuántas veces seguidas y cuándo. Best-effort (si Supabase falla → arranca de cero).
async function leerRepeticion(telefono) {
  const vacio = { ultimoIntent: null, repes: 0, ultimoBotEn: null };
  if (!SB_URL || !SB_KEY) return vacio;
  try {
    const r = await sbFetch(`wa_bot_estado?telefono=eq.${encodeURIComponent(telefono)}&select=ultimo_intent,repes,ultimo_bot_en`, {});
    if (!r.ok) return vacio;
    const rows = await r.json();
    const row = rows && rows[0];
    if (!row) return vacio;
    return { ultimoIntent: row.ultimo_intent || null, repes: row.repes || 0, ultimoBotEn: row.ultimo_bot_en || null };
  } catch { return vacio; }
}

async function upsertEstado(telefono, patch) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await sbFetch('wa_bot_estado?on_conflict=telefono', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ telefono, updated_at: new Date().toISOString(), ...patch }),
    });
  } catch { /* best-effort */ }
}

// Jose respondió por Telegram → el bot cede el control por HUMANO_HORAS. Además limpia
// el estado de escalación pendiente (ya la atendió una persona → no hace falta recordarla).
async function marcarHumano(telefono) {
  const hasta = new Date(Date.now() + HUMANO_HORAS * 3600000).toISOString();
  await upsertEstado(telefono, { modo: 'humano', humano_hasta: hasta, escalado_en: null, recordatorio_en: null });
}

// El bot escaló a una persona y queda ESPERANDO que Jose conteste. Deja el bot en pausa
// (con vencimiento, por si nadie contesta) y marca `escalado_en` para el recordatorio
// diario de "escalaciones sin responder" (api/wa-funnel.js).
const ESPERA_HORAS = 48; // tope de pausa esperando a un humano; luego el bot retoma
async function marcarEsperando(telefono) {
  const hasta = new Date(Date.now() + ESPERA_HORAS * 3600000).toISOString();
  await upsertEstado(telefono, { modo: 'esperando', humano_hasta: hasta, escalado_en: new Date().toISOString(), recordatorio_en: null, repes: 0 });
}

// El bot hizo una acción automática → deja registro (y vuelve/queda en modo 'bot').
// `repes` = cuántas veces seguidas resolvió el MISMO intent (para el anti-bucle).
async function marcarBot(telefono, intent, repes) {
  await upsertEstado(telefono, { modo: 'bot', ultimo_intent: intent || null, ultimo_bot_en: new Date().toISOString(), humano_hasta: null, ...(repes != null ? { repes } : {}) });
}

// ── Temas de Telegram (buzón por cliente) ────────────────────────────────────
// Cada número tiene un "tema" (topic) en el grupo de Telegram; se guarda su id en
// wa_bot_estado.tg_topic_id para poder rutear las respuestas de vuelta.
async function getTopicId(telefono) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await sbFetch(`wa_bot_estado?telefono=eq.${encodeURIComponent(telefono)}&select=tg_topic_id`, {});
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0] && rows[0].tg_topic_id) || null;
  } catch { return null; }
}

async function setTopicId(telefono, topicId) {
  await upsertEstado(telefono, { tg_topic_id: topicId });
}

async function getPhoneByTopic(topicId) {
  if (!SB_URL || !SB_KEY || !topicId) return null;
  try {
    const r = await sbFetch(`wa_bot_estado?tg_topic_id=eq.${encodeURIComponent(topicId)}&select=telefono&limit=1`, {});
    if (!r.ok) return null;
    const rows = await r.json();
    return (rows && rows[0] && rows[0].telefono) || null;
  } catch { return null; }
}

// ── Historial de conversación (tabla conversaciones_wa) ──────────────────────
// Alimenta el buzón y el inbox de Leadr. Delega en wa.logConversacion (única fuente
// del logueo del hilo, compartida con los envíos de regalos/recuperación). Best-effort.
async function logChat(row) {
  return logConversacion(row);
}

module.exports = { decidir, segmentoDe, clasificar, esCierre, accionBucle, MENUS, RESP, enPausa, leerRepeticion, marcarHumano, marcarEsperando, marcarBot, getTopicId, setTopicId, getPhoneByTopic, logChat };
