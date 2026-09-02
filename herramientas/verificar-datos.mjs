#!/usr/bin/env node
/**
 * verificar-datos.mjs — el hermano de `verificar-repo.mjs`, para los DATOS.
 *
 *   node herramientas/verificar-datos.mjs
 *   node herramientas/verificar-datos.mjs --rapido   (saltea los chequeos contra la base)
 *
 * ── POR QUÉ EXISTE ──────────────────────────────────────────────────────────
 *
 * La auditoría del 02/09/2026 encontró 84 cosas mal en las pantallas del admin.
 * Ninguna había fallado nunca: cada una devolvía 200 y dibujaba un número. El
 * problema es que los números eran de otra cosa, o de otro día, o de nadie.
 *
 * Arreglarlas una por una no alcanza — es exactamente lo que produjo esa lista:
 * cada arreglo fue correcto en su pantalla y ninguno impidió el siguiente. Esto
 * corre los chequeos que las habrían atrapado el día que aparecieron.
 *
 * No ejecuta nada que mande mails ni publique: sólo lee.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEADR = join(ROOT, '..', 'Leadr');
const RAPIDO = process.argv.includes('--rapido');

// ── Credenciales, del mismo lugar que estado.mjs ─────────────────────────────
function leerEnv(base, rel) {
  const out = {};
  try {
    for (const linea of readFileSync(join(base, rel), 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* ausente → los chequeos que lo necesiten avisan */ }
  return out;
}
const envCurso = leerEnv(ROOT, 'sistema-ingresos/.env.local');
const envAds = { ...leerEnv(ROOT, 'ads-agent/.env'), ...leerEnv(ROOT, 'ads-agent/.env.local') };
const envLeadr = leerEnv(LEADR, 'app/.env.local');

const BASES = {
  marketing: {
    url: (envCurso.SUPABASE_URL || envAds.SUPABASE_URL || '').replace(/\/$/, ''),
    key: envCurso.SUPABASE_SERVICE_ROLE_KEY || envAds.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  leadr: {
    url: (envLeadr.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, ''),
    key: envLeadr.SUPABASE_SERVICE_ROLE_KEY || '',
  },
};

// ── CADENCIA DECLARADA ───────────────────────────────────────────────────────
// Cada cuánto DEBERÍA recibir filas cada fuente que alimenta una pantalla.
//
// Esto es lo que convierte "esta tabla no se toca hace 107 días" de un hallazgo
// de auditoría en una alarma automática. Si una fuente se seca, alguien se
// entera el día que pasa y no tres meses después.
//
// `dias: null` = no se espera cadencia (histórico, catálogo, snapshots).
const CADENCIAS = [
  { base: 'marketing', tabla: 'events',               col: 'ocurrido_en',  dias: 2,   que: 'visitas y clics de la landing' },
  { base: 'marketing', tabla: 'leads',                col: 'created_at',   dias: 7,   que: 'captación de Meta' },
  { base: 'marketing', tabla: 'comunicaciones_email', col: 'enviado_en',   dias: 8,   que: 'envíos de mail' },
  { base: 'marketing', tabla: 'meta_gasto_diario',    col: 'fecha',        dias: 3,   que: 'gasto de Meta por campaña (llega 1-2 días atrasado)' },
  { base: 'marketing', tabla: 'gastos_meta_mensual',  col: 'updated_at',   dias: 2,   que: 'gasto de Meta a nivel cuenta' },
  { base: 'marketing', tabla: 'clarity_diario',       col: 'fecha',        dias: 3,   que: 'comportamiento en la landing' },
  { base: 'marketing', tabla: 'funnel_corridas',      col: 'fecha',        dias: 2,   que: 'corridas del embudo de mails' },
  { base: 'marketing', tabla: 'agentes_bitacora',     col: 'fecha',        dias: 3,   que: 'lo que dejaron escrito los agentes' },
  { base: 'marketing', tabla: 'ventas',               col: 'created_at',   dias: 21,  que: 'compras (si pasa de 3 semanas, mirar el webhook)' },
  { base: 'leadr',     tabla: 'content_views',        col: 'last_view_at', dias: 7,   que: 'qué abre la gente adentro de Leadr' },
  { base: 'leadr',     tabla: 'users',                col: 'created_at',   dias: 14,  que: 'altas en la plataforma' },
  { base: 'leadr',     tabla: 'news',                 col: 'created_at',   dias: 3,   que: 'noticias de Clara' },
  { base: 'leadr',     tabla: 'automation_costs',     col: 'date',         dias: 3,   que: 'costos de Make' },
];

// ── Utilidades ───────────────────────────────────────────────────────────────
const P = { rojo: '\x1b[31m', ambar: '\x1b[33m', verde: '\x1b[32m', gris: '\x1b[90m', neg: '\x1b[1m', fin: '\x1b[0m' };
const problemas = [];
const avisos = [];
let sanos = 0;

function mal(chequeo, detalle) { problemas.push({ chequeo, detalle }); }
function ojo(chequeo, detalle) { avisos.push({ chequeo, detalle }); }
function bien(msg) { sanos++; console.log(`  ${P.verde}✓${P.fin} ${msg}`); }

// Una base sin credenciales se avisa UNA vez y con la solución al lado. Repetir
// el mismo error trece veces es la forma más rápida de que nadie lea la salida.
const sinCredencial = new Set();
function faltaCredencial(base) {
  if (!sinCredencial.has(base)) {
    sinCredencial.add(base);
    ojo('credenciales', base === 'marketing'
      ? 'falta SUPABASE_SERVICE_ROLE_KEY de periodistas-marketing → los chequeos contra esa base NO corrieron. Vercel no la deja bajar (está marcada "Sensitive"): pegarla en ads-agent/.env.local desde Supabase → periodistas-marketing → Project Settings → API → service_role.'
      : 'falta SUPABASE_SERVICE_ROLE_KEY de leadr-plataforma en ../Leadr/app/.env.local → los chequeos contra esa base NO corrieron.');
  }
}

async function sb(base, path) {
  const b = BASES[base];
  if (!b.url || !b.key) { faltaCredencial(base); return { error: null, sinCredencial: true }; }
  try {
    const r = await fetch(`${b.url}/rest/v1/${path}`, {
      headers: { apikey: b.key, Authorization: `Bearer ${b.key}`, Accept: 'application/json' },
    });
    if (!r.ok) return { error: `HTTP ${r.status} — ${(await r.text()).slice(0, 200)}` };
    return { data: await r.json() };
  } catch (e) { return { error: e.message }; }
}

/** El esquema real, tal como lo publica PostgREST (tablas, vistas y sus columnas). */
async function esquema(base) {
  const b = BASES[base];
  if (!b.url || !b.key) return null;
  try {
    const r = await fetch(`${b.url}/rest/v1/`, { headers: { apikey: b.key, Authorization: `Bearer ${b.key}` } });
    if (!r.ok) return null;
    const j = await r.json();
    const out = {};
    for (const [tabla, def] of Object.entries(j.definitions || {})) {
      out[tabla] = new Set(Object.keys(def.properties || {}));
    }
    return out;
  } catch { return null; }
}

/** Todos los archivos de código de los dos repos, sin node_modules ni builds. */
function archivos(base, exts = ['.ts', '.tsx', '.js', '.mjs']) {
  const out = [];
  const saltar = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.vercel']);
  (function rec(dir) {
    let entradas;
    try { entradas = readdirSync(dir); } catch { return; }
    for (const e of entradas) {
      if (saltar.has(e)) continue;
      const p = join(dir, e);
      let st; try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) rec(p);
      else if (exts.some(x => e.endsWith(x))) out.push(p);
    }
  })(base);
  return out;
}

const CODIGO = [
  ...archivos(join(ROOT, 'sistema-ingresos')),
  ...archivos(join(ROOT, 'ads-agent')),
  ...archivos(join(LEADR, 'app', 'app')),
  ...archivos(join(LEADR, 'app', 'lib')),
  ...archivos(join(LEADR, 'app', 'components')),
].map(p => ({ p, rel: relative(ROOT, p).replace(/\\/g, '/'), txt: (() => { try { return readFileSync(p, 'utf8'); } catch { return ''; } })() }));

// ═════════════════════════════════════════════════════════════════════════════
// 1. Las tres vistas canónicas de ventas tienen que reconciliar
// ═════════════════════════════════════════════════════════════════════════════
async function chequearVentas() {
  console.log(`\n${P.neg}1. Las vistas de ventas dicen lo mismo${P.fin}`);
  if (RAPIDO) return console.log(`  ${P.gris}(saltado por --rapido)${P.fin}`);

  const [lin, com, per] = await Promise.all([
    sb('marketing', 'v_ventas_lineas?select=comision_usd,viva,es_curso&viva=is.true'),
    sb('marketing', 'v_ventas_compras?select=neto_usd'),
    sb('marketing', 'v_ventas_personas?select=neto_usd'),
  ]);
  if (lin.sinCredencial) return;
  if (lin.error || com.error || per.error) {
    return ojo('ventas', `no se pudieron leer las vistas canónicas (${lin.error || com.error || per.error})`);
  }

  const suma = (filas, campo) => Math.round(filas.reduce((a, f) => a + Number(f[campo] || 0), 0) * 100) / 100;
  const nLin = suma(lin.data, 'comision_usd');
  const nCom = suma(com.data, 'neto_usd');
  const nPer = suma(per.data, 'neto_usd');

  // Las tres cuentan unidades distintas, pero el DINERO tiene que ser el mismo.
  // Si no, alguna está dejando filas afuera o contándolas dos veces.
  if (Math.abs(nLin - nCom) > 0.01 || Math.abs(nLin - nPer) > 0.01) {
    mal('ventas', `el neto no coincide entre las tres vistas: líneas $${nLin} · compras $${nCom} · personas $${nPer}`);
  } else {
    bien(`el neto coincide en las tres unidades ($${nLin}) — ${lin.data.length} líneas, ${com.data.length} compras, ${per.data.length} personas`);
  }

  // Nadie debería contar `ventas` a mano teniendo el diccionario.
  const crudas = CODIGO.filter(f => /from\(['"]ventas['"]\)/.test(f.txt) && !f.rel.includes('hotmart'));
  for (const f of crudas) {
    ojo('ventas', `${f.rel} consulta la tabla \`ventas\` cruda — ¿no le sirve v_ventas_lineas/compras/personas?`);
  }
  if (!crudas.length) bien('ninguna pantalla cuenta `ventas` por su cuenta');
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. Ninguna consulta pide una columna que no existe
//    (el bug que dejó la caja "Leadr" del panel en "No disponible" desde siempre)
// ═════════════════════════════════════════════════════════════════════════════
async function chequearColumnas() {
  console.log(`\n${P.neg}2. Las columnas que pide el código existen${P.fin}`);
  if (RAPIDO) return console.log(`  ${P.gris}(saltado por --rapido)${P.fin}`);

  const esquemas = { marketing: await esquema('marketing'), leadr: await esquema('leadr') };
  if (!esquemas.marketing && !esquemas.leadr) return ojo('columnas', 'no se pudo leer el esquema de ninguna base');

  let revisadas = 0;
  for (const f of CODIGO) {
    // .from('tabla')…select('a, b, c')  — con lo que haya en el medio en la misma cadena
    const re = /\.from\(\s*['"]([a-z0-9_]+)['"]\s*\)[\s\S]{0,200}?\.select\(\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(f.txt))) {
      const [, tabla, sel] = m;
      if (sel.includes('*') || sel.includes('(')) continue;   // embebidos y comodines: no se validan
      const cols = sel.split(',').map(c => c.trim().split(':').pop().trim()).filter(Boolean);
      for (const base of ['marketing', 'leadr']) {
        const esq = esquemas[base];
        if (!esq || !esq[tabla]) continue;
        revisadas++;
        const faltan = cols.filter(c => !esq[tabla].has(c));
        if (faltan.length) {
          mal('columnas', `${f.rel} le pide a \`${tabla}\` (${base}) la columna ${faltan.map(c => `\`${c}\``).join(', ')} y no existe — PostgREST devuelve 400 y la pantalla se queda sin ese bloque`);
        }
      }
    }
  }
  if (revisadas) bien(`${revisadas} consultas revisadas contra el esquema real`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. Los valores por los que se filtra existen de verdad
//    (el 'devuelto' que nunca matcheaba porque en la base dice 'devuelta')
// ═════════════════════════════════════════════════════════════════════════════
const FILTROS_A_VERIFICAR = [
  { base: 'marketing', tabla: 'ventas',               col: 'estado' },
  { base: 'marketing', tabla: 'clientes_potenciales', col: 'tipo' },
  { base: 'marketing', tabla: 'funnels',              col: 'proposito' },
  { base: 'leadr',     tabla: 'classes',              col: 'status' },
  { base: 'leadr',     tabla: 'news',                 col: 'status' },
];

async function chequearValores() {
  console.log(`\n${P.neg}3. Los valores por los que se filtra existen${P.fin}`);
  if (RAPIDO) return console.log(`  ${P.gris}(saltado por --rapido)${P.fin}`);

  for (const { base, tabla, col } of FILTROS_A_VERIFICAR) {
    if (sinCredencial.has(base)) continue;
    const r = await sb(base, `${tabla}?select=${col}&limit=5000`);
    if (r.error) { if (!r.sinCredencial) ojo('valores', `no pude leer ${tabla}.${col} (${r.error})`); continue; }
    const reales = new Set(r.data.map(f => f[col]).filter(v => v != null).map(String));
    if (!reales.size) continue;

    // Cómo filtra el código por esa columna: .eq('col','valor') y ARRAY['a','b']
    const usados = new Set();
    for (const f of CODIGO) {
      const re1 = new RegExp(`\\.(eq|neq)\\(\\s*['"]${col}['"]\\s*,\\s*['"]([^'"]+)['"]`, 'g');
      let m; while ((m = re1.exec(f.txt))) usados.add(`${m[2]}|${f.rel}`);
    }
    let malos = 0;
    for (const u of usados) {
      const [valor, donde] = u.split('|');
      if (!reales.has(valor)) {
        malos++;
        mal('valores', `${donde} filtra ${tabla}.${col} = "${valor}" y ese valor NO existe en la base (hay: ${[...reales].join(', ')}) — el filtro no matchea nunca y no da error`);
      }
    }
    if (!malos && usados.size) bien(`${tabla}.${col}: los ${usados.size} filtros del código usan valores que existen`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. Ninguna fuente se secó sin que nadie se enterara
// ═════════════════════════════════════════════════════════════════════════════
async function chequearFrescura() {
  console.log(`\n${P.neg}4. Las fuentes siguen recibiendo datos${P.fin}`);
  if (RAPIDO) return console.log(`  ${P.gris}(saltado por --rapido)${P.fin}`);

  for (const c of CADENCIAS) {
    if (c.dias == null || sinCredencial.has(c.base)) continue;
    const r = await sb(c.base, `${c.tabla}?select=${c.col}&order=${c.col}.desc&limit=1`);
    if (r.error) { if (!r.sinCredencial) ojo('frescura', `${c.tabla}: no se pudo leer (${r.error})`); continue; }
    if (!r.data.length) { mal('frescura', `${c.tabla} está VACÍA (${c.que})`); continue; }

    const ultima = new Date(r.data[0][c.col]);
    const dias = Math.floor((Date.now() - ultima.getTime()) / 86400000);
    const fecha = ultima.toISOString().slice(0, 10);
    if (dias > c.dias) {
      mal('frescura', `${c.tabla}: última fila hace ${dias} días (${fecha}), se esperaba dentro de ${c.dias} — ${c.que}`);
    } else {
      bien(`${c.tabla}: al día (${fecha})`);
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. Un error no puede dibujarse como un cero
// ═════════════════════════════════════════════════════════════════════════════
function chequearCeros() {
  console.log(`\n${P.neg}5. Un error no se dibuja como un cero${P.fin}`);
  let encontrados = 0;

  for (const f of CODIGO) {
    // Sólo en el admin y en las pantallas del alumno: ahí es donde un cero se lee
    // como un dato. En scripts de consola el operador ve la traza.
    if (!/\/(admin|dashboard|api)\//.test(f.rel)) continue;

    const lineas = f.txt.split('\n');
    for (const [i, linea] of lineas.entries()) {
      const n = i + 1;
      // Los comentarios no ejecutan nada. Sin esto la herramienta se marcaba a sí
      // misma: el comentario que EXPLICA por qué `count ?? 0` estaba mal contiene
      // esas tres palabras, y se reportaba como si fuera código.
      if (/^\s*(\/\/|\*|\/\*)/.test(linea)) continue;

      // `count ?? 0` — un contador que no se pudo leer, contado como cero.
      //
      // Sólo si NO hay una guarda cerca. Cuando el error ya se chequeó arriba
      // (`chequear(...)`, `if (error)`), el `?? 0` es nada más para el tipo y
      // está bien: marcarlo igual convierte esto en ruido, y una herramienta que
      // grita en falso se deja de leer a la segunda corrida.
      if (/\bcount\s*\?\?\s*0/.test(linea)) {
        // La línea propia entra en la ventana: la guarda puede estar ahí mismo
        // (`error ? null : count ?? 0`), no sólo más arriba.
        const cerca = lineas.slice(Math.max(0, i - 20), i + 1).join('\n');
        if (!/chequear\(|if\s*\(\s*\w*[eE]rror|\berror\s*[?&|]|\.error\b|throw\s/.test(cerca)) {
          encontrados++;
          ojo('ceros', `${f.rel}:${n} — \`count ?? 0\` sin chequear el error antes: si la consulta falla, la pantalla dice 0 y eso se lee como "no hay nada"`);
        }
      }
      // `.rpc(` que no se consume: el builder de supabase-js es perezoso y la
      // petición NUNCA sale. Así estuvo `registrar_descarga` desde que existe.
      if (/(?<!await\s)(?<!void\s)\.rpc\(/.test(linea) && !/await|\.then|return|void|=/.test(linea)) {
        encontrados++;
        mal('ceros', `${f.rel}:${n} — \`.rpc(\` sin await ni .then(): el builder es perezoso, la petición no sale nunca`);
      }
    }
  }
  if (!encontrados) bien('no hay contadores que conviertan un fallo en cero');
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. Toda campaña declara para qué es
//    (así se coló `reenganche`: 551 mails sin figurar en ninguna pantalla)
// ═════════════════════════════════════════════════════════════════════════════
async function chequearCampanas() {
  console.log(`\n${P.neg}6. Toda campaña que manda algo está declarada${P.fin}`);
  if (RAPIDO) return console.log(`  ${P.gris}(saltado por --rapido)${P.fin}`);

  const [f, pasos, mails] = await Promise.all([
    sb('marketing', 'funnels?select=slug,proposito'),
    sb('marketing', 'funnel_steps?select=brevo_tag&brevo_tag=not.is.null'),
    sb('marketing', 'comunicaciones_email?select=campana&campana=not.is.null&limit=20000'),
  ]);
  if (f.sinCredencial) return;
  if (f.error || pasos.error || mails.error) return ojo('campanas', 'no se pudieron leer los embudos');

  const sinProposito = f.data.filter(x => !x.proposito);
  if (sinProposito.length) {
    mal('campanas', `hay campañas sin declarar para qué son: ${sinProposito.map(x => x.slug).join(', ')}`);
  } else {
    bien(`las ${f.data.length} campañas declaran su propósito`);
  }

  const declarados = new Set(pasos.data.map(p => p.brevo_tag));
  const enviados = new Map();
  for (const m of mails.data) enviados.set(m.campana, (enviados.get(m.campana) || 0) + 1);

  // Piezas de prueba y avisos internos: no son campañas.
  const ignorar = /^(test|prueba|qa|leadr-acceso|panel-|salud|rutina|reporte)/i;
  const huerfanas = [...enviados.entries()]
    .filter(([tag, n]) => n >= 20 && !declarados.has(tag) && !ignorar.test(tag))
    .sort((a, b) => b[1] - a[1]);

  if (huerfanas.length) {
    for (const [tag, n] of huerfanas) {
      mal('campanas', `salieron ${n} mails con la etiqueta "${tag}" y ningún embudo la declara — no aparece en ninguna pantalla`);
    }
  } else {
    bien('no hay envíos con etiquetas que nadie declara');
  }
}

// ── Salida ───────────────────────────────────────────────────────────────────
console.log(`${P.neg}Verificación de datos${P.fin} ${P.gris}— ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} (hora de España)${P.fin}`);

await chequearVentas();
await chequearColumnas();
await chequearValores();
await chequearFrescura();
chequearCeros();
await chequearCampanas();

console.log('');
if (avisos.length) {
  console.log(`${P.ambar}${P.neg}${avisos.length} para mirar${P.fin}`);
  for (const a of avisos) console.log(`  ${P.ambar}•${P.fin} [${a.chequeo}] ${a.detalle}`);
  console.log('');
}
if (problemas.length) {
  console.log(`${P.rojo}${P.neg}${problemas.length} ${problemas.length === 1 ? 'problema' : 'problemas'}${P.fin}`);
  for (const p of problemas) console.log(`  ${P.rojo}✗${P.fin} [${p.chequeo}] ${p.detalle}`);
  console.log('');
  process.exit(1);
}
console.log(`${P.verde}${P.neg}Todo en orden${P.fin} ${P.gris}(${sanos} chequeos pasados)${P.fin}\n`);
