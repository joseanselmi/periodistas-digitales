/**
 * estado.mjs — foto EN VIVO del negocio, escrita en ESTADO.md
 *
 *   node estado.mjs            # consulta todo y regenera ESTADO.md (~40 s)
 *   node estado.mjs --rapido   # saltea la cola del embudo (el paso lento, ~30 s)
 *
 * POR QUÉ EXISTE: el estado real del negocio vive repartido en cuatro lados —
 * Trello (qué falta hacer), Supabase (ventas, entrega de WhatsApp), Brevo (envíos
 * y aperturas) y el propio endpoint del embudo (qué cola hay). Sin esto, cada
 * sesión de Claude lo reconstruye a mano, tarda, y termina preguntando cosas que
 * ya estaban decididas en una tarjeta. Un solo comando, una sola fuente de verdad.
 *
 * Es SOLO LECTURA: no manda un mensaje, no toca Trello, no cambia flags.
 *
 * Lee las credenciales de los .env que ya existen (no hace falta pasarle nada):
 *   sistema-ingresos/.env.local  → SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, CRON_SECRET
 *   ads-agent/.env               → TRELLO_API_KEY, TRELLO_TOKEN
 *
 * Si una fuente falla, la sección queda marcada "no disponible" con el motivo —
 * nunca inventa un número ni deja el anterior como si fuera fresco.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RAPIDO = process.argv.includes('--rapido');

const BOARD_ID = '6a35bf86f4bbebc72953200f'; // Roadmap Periodistas Digitales
const LISTA_LEADS = 5;                        // Brevo "Leadgen - Guía Claude"
// Las piezas del embudo, EN ORDEN. El embudo va 100% por email desde el 29/07 (ver el
// encabezado de sistema-ingresos/api/wa-funnel.js): cada tag es un paso del recorrido.
const TAGS_EMAIL = [
  ['regalo3-periodico', 'Regalo 3 · periódico digital (día 5)'],
  ['regalo4-pilares', 'Regalo 4 · los 5 pilares (día 7)'],
  ['regalo5-agentes-ia', 'Regalo 5 · agentes de IA (día 8)'],
  ['oferta-email', 'OFERTA (día 9) — la que vende'],
  ['oferta-reenvio', 'Reenvío de la oferta (+48 h, a los que no abrieron)'],
];
const FUNNEL_URL = 'https://sistemadeingresosdiariosia.com/api/wa-funnel';

// ── credenciales ────────────────────────────────────────────────────────────
function leerEnv(rel) {
  const out = {};
  try {
    for (const linea of readFileSync(join(ROOT, rel), 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* archivo ausente → las secciones que lo necesiten avisan */ }
  return out;
}
const envCurso = leerEnv('sistema-ingresos/.env.local');
const envAds = { ...leerEnv('ads-agent/.env'), ...leerEnv('ads-agent/.env.local') };

// La service_role está marcada "Sensitive" en Vercel → `vercel env pull` la trae vacía.
// Por eso se busca en los dos .env: alcanza con pegarla en cualquiera de los dos.
const SB_URL = (envCurso.SUPABASE_URL || envAds.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = envCurso.SUPABASE_SERVICE_ROLE_KEY || envAds.SUPABASE_SERVICE_ROLE_KEY || '';
const BREVO_KEY = envCurso.BREVO_API_KEY || '';
const CRON_SECRET = envCurso.CRON_SECRET || '';
const TRELLO = `key=${envAds.TRELLO_API_KEY || ''}&token=${envAds.TRELLO_TOKEN || ''}`;

// ── utilidades ──────────────────────────────────────────────────────────────
const AHORA = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const hace = (dias) => iso(new Date(AHORA.getTime() - dias * 86400000));
const pct = (parte, total) => (total ? `${Math.round((100 * parte) / total)}%` : '—');
// ESTADO.md se versiona en git: los emails de clientes van tapados. Alcanza para
// reconocer a alguien de un vistazo, no para dejar la base de compradores en el repo.
const tapar = (email) => String(email || '').replace(/^(.{3}).*(@.*)$/, '$1***$2');

// Brevo rechaza cualquier fecha posterior a "hoy" en SU reloj (UTC). Si acá ya es
// el día siguiente, pedirle el día de hoy local devuelve error: se topea en UTC.
const HOY_UTC = iso(AHORA);

// Un corte de red pasajero dejaba una sección entera en blanco, que es justo lo que
// este informe no puede permitirse: un hueco se lee como un cero. Un reintento.
async function pedir(url, opts = {}, segundos = 90, intento = 1) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), segundos * 1000);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    const texto = await r.text();
    let cuerpo;
    try { cuerpo = JSON.parse(texto); } catch { cuerpo = texto; }
    if (!r.ok) throw new Error(`${r.status} ${String(texto).slice(0, 160)}`);
    return cuerpo;
  } catch (e) {
    // Sólo se reintenta la caída de red o el error del servidor; un 4xx (clave mal,
    // parámetro inválido) va a fallar igual y hay que verlo, no taparlo con esperas.
    const esCuatrocientos = /^4\d\d\b/.test(String((e && e.message) || ''));
    if (intento < 2 && !esCuatrocientos) {
      await new Promise((r) => setTimeout(r, 2000));
      return pedir(url, opts, segundos, intento + 1);
    }
    throw e;
  } finally { clearTimeout(t); }
}
const sb = (path) => pedir(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
const brevo = (path) => pedir(`https://api.brevo.com/v3/${path}`, { headers: { 'api-key': BREVO_KEY } });

// Cada bloque se resuelve por separado: una fuente caída no puede tumbar el resto
// del informe ni, peor, dejar un hueco que parezca un cero real.
async function intentar(nombre, fn) {
  if (!SB_KEY && nombre.startsWith('sb:')) {
    return { error: 'falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).' };
  }
  try { return { dato: await fn() }; } catch (e) { return { error: String((e && e.message) || e) }; }
}

// ── fuentes ─────────────────────────────────────────────────────────────────
async function ventas() {
  const filas = await sb(`ventas?select=ocurrido_en,email,comision_usd,valor_usd,evento_hotmart&ocurrido_en=gte.${hace(30)}&order=ocurrido_en.desc`);
  const pagas = filas.filter((v) => /APPROVED|COMPLETE/i.test(v.evento_hotmart || ''));
  const desde = (dias) => pagas.filter((v) => v.ocurrido_en >= hace(dias));
  const neto = (arr) => arr.reduce((s, v) => s + Number(v.comision_usd || 0), 0);
  const u7 = desde(7), u30 = pagas;
  const previas7 = pagas.filter((v) => v.ocurrido_en < hace(7) && v.ocurrido_en >= hace(14));
  return {
    d7: u7.length, neto7: neto(u7), d30: u30.length, neto30: neto(u30), previas7: previas7.length,
    ultimas: u30.slice(0, 5).map((v) => ({ fecha: (v.ocurrido_en || '').slice(0, 10), email: v.email, neto: Number(v.comision_usd || 0) })),
    emails: new Set(u30.map((v) => String(v.email || '').toLowerCase())),
  };
}

async function entregaWhatsApp() {
  const filas = await sb(`conversaciones_wa?select=creado_en,estado_entrega&direccion=eq.out&creado_en=gte.${hace(7)}`);
  const tally = {};
  for (const f of filas) tally[f.estado_entrega || 'sin_estado'] = (tally[f.estado_entrega || 'sin_estado'] || 0) + 1;
  const total = filas.length;
  return { total, tally, fallidos: tally.fallido || 0, ratioFallo: total ? (tally.fallido || 0) / total : 0 };
}

async function aterrizajeEmail() {
  const filas = await sb(`events?select=src,tipo_evento&src=ilike.Email*&ocurrido_en=gte.${hace(30)}`);
  const tally = {};
  for (const f of filas) {
    const k = `${f.src} · ${f.tipo_evento}`;
    tally[k] = (tally[k] || 0) + 1;
  }
  return tally;
}

async function emailBrevo() {
  const lista = await brevo(`contacts/lists/${LISTA_LEADS}`);
  const global = await brevo(`smtp/statistics/aggregatedReport?startDate=${hace(30)}&endDate=${HOY_UTC}`);
  const porTag = {};
  for (const [tag] of TAGS_EMAIL) porTag[tag] = await brevo(`smtp/statistics/aggregatedReport?tag=${tag}&startDate=${hace(30)}&endDate=${HOY_UTC}`);
  return { lista, global, porTag };
}

// Estado por lead: vive en atributos de Brevo (WA_STAGE / MAIL5_AT / OFERTA_MAIL_AT).
// Se recorre la lista entera para saber cuántos están parados en cada escalón.
async function etapasDeLosLeads() {
  const etapas = { total: 0, stage: {}, regalo3: 0, regalo4: 0, regalo5: 0, oferta_email: 0, reenvio: 0, seguimiento: 0, sin_telefono: 0, emails: new Set() };
  let offset = 0;
  for (;;) {
    const p = await brevo(`contacts/lists/${LISTA_LEADS}/contacts?limit=500&offset=${offset}`);
    const lote = p.contacts || [];
    for (const c of lote) {
      const a = c.attributes || {};
      etapas.total++;
      etapas.emails.add(String(c.email || '').toLowerCase());
      const s = String(Number(a.WA_STAGE || 0));
      etapas.stage[s] = (etapas.stage[s] || 0) + 1;
      if (a.MAIL3_AT) etapas.regalo3++;
      if (a.MAIL4_AT) etapas.regalo4++;
      if (a.MAIL5_AT) etapas.regalo5++;
      if (a.OFERTA_MAIL_AT) etapas.oferta_email++;
      if (a.OFERTA_MAIL2_AT) etapas.reenvio++;
      if (a.SEG_AT) etapas.seguimiento++;
      if (!a.SMS && !a.WHATSAPP) etapas.sin_telefono++;
    }
    if (lote.length < 500) break;
    offset += 500;
  }
  return etapas;
}

// Cola del embudo: se la pedimos al propio endpoint en modo ensayo (no manda nada).
async function colaDelEmbudo() {
  if (!CRON_SECRET) throw new Error('falta CRON_SECRET');
  const r = await pedir(`${FUNNEL_URL}?mode=dry&key=${encodeURIComponent(CRON_SECRET)}`, {}, 120);
  return { pendientes: r.would_send, desglose: r.desglose, encendido: r.enabled };
}

async function tablero() {
  const listas = await pedir(`https://api.trello.com/1/boards/${BOARD_ID}/lists?${TRELLO}`);
  const tarjetas = await pedir(`https://api.trello.com/1/boards/${BOARD_ID}/cards?checklists=all&checklist_fields=name&fields=name,idShort,idList,dateLastActivity,shortUrl,labels&${TRELLO}`);
  const nombreLista = Object.fromEntries(listas.map((l) => [l.id, l.name]));
  return tarjetas.map((c) => {
    const items = (c.checklists || []).flatMap((ch) => ch.checkItems || []);
    const abiertos = items.filter((i) => i.state !== 'complete');
    return {
      n: c.idShort, nombre: c.name, lista: nombreLista[c.idList] || '?', url: c.shortUrl,
      actividad: (c.dateLastActivity || '').slice(0, 10),
      agente: (c.labels || []).map((l) => l.name).filter(Boolean).join(', '),
      hechos: items.length - abiertos.length, total: items.length,
      abiertos: abiertos.map((i) => i.name),
    };
  });
}

// ── informe ─────────────────────────────────────────────────────────────────
function armarMarkdown(d) {
  const L = [];
  const bloque = (r, cuerpo) => (r.error ? `> ⚠️ No disponible: ${r.error}` : cuerpo(r.dato));

  L.push('# ESTADO — foto en vivo del negocio');
  L.push('');
  L.push(`_Generado el ${AHORA.toISOString().slice(0, 16).replace('T', ' ')} UTC por \`node estado.mjs\`. Si esta fecha no es de hoy, **volvé a correrlo antes de sacar conclusiones**._`);
  L.push('');
  L.push('Este archivo se REGENERA, no se edita a mano. Las decisiones y el detalle técnico');
  L.push('viven en las tarjetas de Trello y en los `.md` de cada proyecto; acá están sólo los');
  L.push('hechos frescos que hacen falta para saber en qué estamos y qué sigue.');
  L.push('');

  // Semáforo — reglas explícitas, para que el veredicto sea auditable y no una impresión.
  L.push('## 🚦 Semáforo');
  L.push('');
  const focos = [];
  if (!d.wa.error) {
    const w = d.wa.dato;
    if (w.total === 0) focos.push('⚪ **WhatsApp** — sin envíos salientes en 7 días.');
    else if (w.ratioFallo > 0.5) focos.push(`🔴 **WhatsApp NO entrega** — ${w.fallidos} de ${w.total} envíos fallidos en 7 días (${pct(w.fallidos, w.total)}). Todo lo que dependa de este canal no llega a nadie.`);
    else if (w.ratioFallo > 0.2) focos.push(`🟡 **WhatsApp con fallas** — ${pct(w.fallidos, w.total)} de entrega fallida en 7 días.`);
    else focos.push(`🟢 **WhatsApp entrega** — ${pct(w.fallidos, w.total)} de fallo en 7 días.`);
  }
  if (!d.cola.error) {
    const c = d.cola.dato;
    const r3 = (c.desglose || {}).wa_stage_3 || 0;
    if (r3 > 50) focos.push(`🔴 **Entrada del embudo tapada** — ${r3} leads esperan el Regalo 3 (el primer paso). Mientras estén ahí no llegan ni al Regalo 5 ni a la oferta.`);
    focos.push(`${c.encendido ? '🟢' : '⚪'} **Embudo** ${c.encendido ? 'encendido' : 'APAGADO'} — ${c.pendientes} envíos en cola: ${JSON.stringify(c.desglose)}`);
  }
  if (!d.ventas.error) {
    const v = d.ventas.dato;
    const flecha = v.d7 > v.previas7 ? '↑' : v.d7 < v.previas7 ? '↓' : '=';
    focos.push(`${v.d7 ? '🟢' : '🔴'} **Ventas** — ${v.d7} en 7 días (${flecha} vs ${v.previas7} los 7 previos), neto US$${v.neto7.toFixed(2)}.`);
  }
  L.push(focos.length ? focos.map((f) => `- ${f}`).join('\n') : '_sin datos_');
  L.push('');

  L.push('## 💰 Ventas (neto de Jose)');
  L.push('');
  L.push(bloque(d.ventas, (v) => [
    `- **7 días:** ${v.d7} compras · neto **US$${v.neto7.toFixed(2)}** (7 previos: ${v.previas7})`,
    `- **30 días:** ${v.d30} compras · neto **US$${v.neto30.toFixed(2)}**`,
    '',
    v.ultimas.length ? '| fecha | comprador | neto |\n|---|---|---|\n' + v.ultimas.map((u) => `| ${u.fecha} | ${tapar(u.email)} | US$${u.neto.toFixed(2)} |`).join('\n') : '_sin compras en el período_',
  ].join('\n')));
  L.push('');

  L.push('## 📥 Embudo de las guías gratis');
  L.push('');
  L.push(bloque(d.etapas, (e) => [
    `**${e.total} leads** en la lista. Dónde está parado cada uno (atributo \`WA_STAGE\`):`,
    '',
    ...Object.keys(e.stage).sort().map((s) => `- etapa ${s}: **${e.stage[s]}** leads` + (s === '0' ? ' _(nunca recibieron el primer regalo)_' : '')),
    '',
    '',
    'Cuántos recibieron cada paso **por email** (el embudo va 100% por mail desde el 29/07):',
    '',
    `- Regalo 3 → **${e.regalo3}** · Regalo 4 → **${e.regalo4}** · Regalo 5 → **${e.regalo5}**`,
    `- Oferta → **${e.oferta_email}** · reenvío de la oferta → **${e.reenvio}**`,
    '',
    `_(el Regalo 3 y el 4 empezaron a salir por mail el 28/07; a quien los recibió antes por WhatsApp sólo lo registra su \`WA_STAGE\`, no el marcador)_`,
  ].join('\n')));
  L.push('');
  L.push('### Cola de hoy (ensayo del cron, no manda nada)');
  L.push('');
  L.push(RAPIDO ? '_salteado por `--rapido`_' : bloque(d.cola, (c) => `- **${c.pendientes}** envíos pendientes: \`${JSON.stringify(c.desglose)}\`\n- Embudo ${c.encendido ? 'encendido' : '**apagado**'} (\`WA_FUNNEL_ENABLED\`)`));
  L.push('');
  L.push('### Entrega de WhatsApp (últimos 7 días)');
  L.push('');
  L.push(bloque(d.wa, (w) => `- ${w.total} envíos salientes: \`${JSON.stringify(w.tally)}\``));
  L.push('');

  L.push('## 📧 Email (Brevo, últimos 30 días)');
  L.push('');
  L.push(bloque(d.email, (e) => {
    const fila = (nombre, s) => `| ${nombre} | ${s.requests} | ${s.delivered} | ${s.uniqueOpens} (${pct(s.uniqueOpens, s.delivered)}) | ${s.uniqueClicks} (${pct(s.uniqueClicks, s.delivered)}) |`;
    return [
      `Lista "${e.lista.name}": **${e.lista.totalSubscribers} contactos**.`,
      '',
      '| paso del embudo | enviados | entregados | aperturas únicas | clics únicos |',
      '|---|---|---|---|---|',
      ...TAGS_EMAIL.map(([t, nombre]) => fila(nombre, e.porTag[t])),
      fila('_todo el correo (incluye Regalos 1 y 2)_', e.global),
    ].join('\n');
  }));
  L.push('');
  L.push('### Qué hicieron los que abrieron (eventos en la landing)');
  L.push('');
  L.push(bloque(d.aterrizaje, (t) => (Object.keys(t).length ? Object.entries(t).map(([k, v]) => `- ${k}: **${v}**`).join('\n') : '_sin eventos con `src=Email*`_')));
  L.push('');

  // Cruce que contesta la única pregunta que importa del embudo: ¿vendió?
  // Se cruza por email (los compradores llegan por Hotmart, los leads por el anuncio):
  // si nadie de la lista compró, el embudo entretiene pero no vende.
  L.push('### ¿El embudo vendió?');
  L.push('');
  if (d.ventas.error || d.etapas.error) {
    L.push('> ⚠️ No disponible: falta una de las dos fuentes (ventas o lista de leads).');
  } else {
    const cruce = [...d.ventas.dato.emails].filter((e) => d.etapas.dato.emails.has(e));
    L.push(cruce.length
      ? `De las ${d.ventas.dato.d30} compras de los últimos 30 días, **${cruce.length} salieron de la lista de leads**: ${cruce.map(tapar).join(', ')}.`
      : `**0 de las ${d.ventas.dato.d30} compras** de los últimos 30 días salieron de la lista de leads. El embudo de guías gratis todavía no produjo una venta.`);
  }
  L.push('');

  L.push('## 🧭 Trello — qué falta, tarjeta por tarjeta');
  L.push('');
  L.push(bloque(d.trello, (cards) => {
    const orden = ['En progreso', 'Bloqueada', 'En revision', 'Por hacer'];
    const partes = [];
    for (const lista of orden) {
      const enLista = cards.filter((c) => c.lista === lista).sort((a, b) => (a.actividad < b.actividad ? 1 : -1));
      if (!enLista.length) continue;
      partes.push(`### ${lista} (${enLista.length})`);
      partes.push('');
      for (const c of enLista) {
        const prog = c.total ? `${c.hechos}/${c.total}` : 'sin checklist ⚠️';
        partes.push(`**[#${c.n} ${c.nombre}](${c.url})** — ${prog}${c.agente ? ` · ${c.agente}` : ''} · últ. ${c.actividad}`);
        for (const item of c.abiertos.slice(0, 8)) partes.push(`- ⬜ ${item}`);
        if (c.abiertos.length > 8) partes.push(`- _…y ${c.abiertos.length - 8} más_`);
        partes.push('');
      }
    }
    return partes.join('\n');
  }));

  L.push('## ⏳ Esperando a Jose');
  L.push('');
  L.push(bloque(d.trello, (cards) => {
    const suyos = cards.flatMap((c) => c.abiertos.filter((i) => /\(JOSE\)/i.test(i)).map((i) => `- [#${c.n}](${c.url}) ${i.replace(/\(JOSE\)\s*/i, '')}`));
    return suyos.length ? suyos.join('\n') : '_nada pendiente de su lado_';
  }));
  L.push('');

  L.push('## 📋 Tarjetas sin checklist');
  L.push('');
  L.push(bloque(d.trello, (cards) => {
    const sin = cards.filter((c) => !c.total && ['En progreso', 'Bloqueada', 'Por hacer', 'En revision'].includes(c.lista));
    return sin.length
      ? sin.map((c) => `- [#${c.n} ${c.nombre}](${c.url}) — ${c.lista}`).join('\n') + '\n\n_Regla del tablero: toda tarjeta activa lleva checklist con pasos concretos._'
      : '_todas las tarjetas activas tienen checklist_';
  }));
  L.push('');

  return L.join('\n');
}

// ── main ────────────────────────────────────────────────────────────────────
console.log('Consultando fuentes en vivo…');
const [v, wa, aterrizaje, email, etapas, trello] = await Promise.all([
  intentar('sb:ventas', ventas),
  intentar('sb:wa', entregaWhatsApp),
  intentar('sb:events', aterrizajeEmail),
  intentar('brevo', emailBrevo),
  intentar('brevo:etapas', etapasDeLosLeads),
  intentar('trello', tablero),
]);
const cola = RAPIDO ? { error: 'salteado (--rapido)' } : await intentar('funnel', colaDelEmbudo);

const datos = { ventas: v, wa, aterrizaje, email, etapas, trello, cola };
writeFileSync(join(ROOT, 'ESTADO.md'), armarMarkdown(datos), 'utf8');

// Resumen en pantalla + qué fuente falló (para no confundir "0" con "no pude leer").
const fallas = Object.entries(datos).filter(([, r]) => r.error).map(([k, r]) => `${k}: ${r.error}`);
console.log(`\n✅ ESTADO.md actualizado — ${AHORA.toISOString().slice(0, 16).replace('T', ' ')} UTC`);
if (!v.error) console.log(`   Ventas 7d: ${v.dato.d7} (neto US$${v.dato.neto7.toFixed(2)}) · 30d: ${v.dato.d30}`);
if (!wa.error) console.log(`   WhatsApp 7d: ${wa.dato.fallidos}/${wa.dato.total} fallidos`);
if (!cola.error) console.log(`   Cola del embudo: ${cola.dato.pendientes} → ${JSON.stringify(cola.dato.desglose)}`);
if (!trello.error) console.log(`   Trello: ${trello.dato.filter((c) => c.lista !== 'Hecho' && c.lista !== 'Backlog').length} tarjetas activas`);
if (fallas.length) console.log(`\n⚠️  Fuentes caídas (quedaron marcadas en el archivo):\n   - ${fallas.join('\n   - ')}`);
