/**
 * verificar-repo.mjs — chequea que el repo no tenga rutas rotas.
 *
 *   node herramientas/verificar-repo.mjs
 *
 * Correrlo DESPUES de mover, renombrar o borrar archivos, y antes de deployar.
 * Nació de la reorganización del 2026-07-30 (tarjeta Trello #93): los tres
 * chequeos que hace son los que ahí atajaron roturas reales.
 *
 * 1. RUTAS EN TEXTO — links markdown y rutas "desde la raíz del repo"
 *    (ads-agent/..., sistema-ingresos/...) escritas en docs, código y HTML.
 *    Atrapa: mover un .md y dejar los links apuntando al lugar viejo.
 *
 * 2. ANCLAJES DE LOS SCRIPTS — imports relativos y rutas ancladas al archivo
 *    (new URL('x', import.meta.url), join(RAIZ|__dirname, 'x')) de todo
 *    ads-agent/scripts/. NO ejecuta nada: varios scripts publican anuncios o
 *    mandan mails. Atrapa el peor caso: un script que corre sin error pero
 *    apunta a un .env o a una carpeta que ya no está ahí, y no hace nada.
 *
 * 3. URLS PUBLICAS — resuelve como lo haría Vercel (redirects → rewrites →
 *    archivo estático) las URLs que el sistema realmente emite hoy: las páginas
 *    que chequea qa-salud-sitio.mjs y los PDF que entregan /api/d, el embudo de
 *    WhatsApp y los emails. Atrapa: agregar una guía en guias/ y olvidarse el
 *    rewrite que mantiene viva su URL de la raíz (esos links ya salieron por
 *    mail y WhatsApp — no se pueden cambiar).
 *
 * Después se fueron sumando, cada uno por una rotura real: el contrato con Vercel
 * (api/ y crons), los pipelines de .claude/, la coherencia del equipo de agentes,
 * que toda carpeta con contenido tenga README, y —desde el 2026-08-10— los FLUJOS
 * DE MAILS: que toda campaña de CAPTACIÓN tenga su ficha en
 * sistema-ingresos/docs/FLUJOS.md y que los motores que esa ficha nombra existan.
 * (Las campañas de META no llevan ficha de mails: muchas no mandan ninguno. Un
 * flujo de mails y una campaña de anuncios son cosas distintas y no van una a una.)
 * La lista viva de los pasos es el array `pasos` del final; ahí manda el código,
 * no este comentario.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

// Este script vive en herramientas/; el repo que audita es el nivel de arriba.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SI = join(ROOT, 'sistema-ingresos');

// Carpetas pesadas o generadas: no aportan y hacen lento el scan.
const EXCLUIR = /(^|[\\/])(node_modules|\.git|hotmart-transcripts|hotmart-chrome-profile|_material|_revisar|creatives|img|portadas|qa-guia-)/;
const EXT_LOCAL = /\.(md|mjs|js|json|html|pdf|png|webp|csv|txt|py|sh)$/i;

// Rutas de carpeta que se nombran a propósito aunque no existan: son el "antes"
// de una mudanza, y esa frase es justamente lo que evita que alguien las reviva.
// Si algo se agrega acá, tiene que ser porque el texto dice que ya no está.
const RUTAS_HISTORICAS = new Set([
  '_material/order-bumps',              // ahora sistema-ingresos/order-bumps
  'ads-agent/ads-curso',                // ahora campanas/<campaña>/ads
  'ads-agent/dashboards',               // ahora docs/dashboards
  'ads-agent/playbooks',                // ahora docs/playbooks
  'ads-agent/radar',                    // ahora datos/radar
  'ads-agent/hotmart-transcripts',      // ahora _material/luis-mena (fuera de git)
  'ads-agent/hotmart-chrome-profile',   // userDataDir de puppeteer, se regenera
  'sistema-ingresos/guias',             // ahora campanas/<campaña>/guias
  'sistema-ingresos/quizzes',           // ahora curso/quizzes
  'sistema-ingresos/api/hotmart',       // es el endpoint /api/hotmart, no una carpeta
  // La ruta vieja de las historias del muro. La nombran dos comentarios que
  // explican justamente por qué NO hay que usarla (daba 404 en GitHub raw).
  'ads-agent/carousels/muro-stories',
  // Ídem: send-email.mjs guardaba acá el log de cada campaña y la carpeta se
  // creaba sola, así que el rastro de los envíos se perdía. Ahora va a
  // contenido/emails/ y el comentario deja dicho por qué.
  'ads-agent/emails',
]);

// El `_` de _material entra a propósito: ahí vive material local que los docs
// citan como fuente, y una ruta mal escrita ahí también rompe en silencio.
const RE_CARPETA = /(?<![\w./-])(ads-agent|sistema-ingresos|herramientas|_material)\/[\w./-]+/g;

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;

function archivosDelRepo(exts) {
  return execSync('git ls-files --cached --others --exclude-standard', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
    .toString().split('\n')
    .filter((f) => f && !EXCLUIR.test(f) && exts.test(f));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Rutas escritas en texto
// ─────────────────────────────────────────────────────────────────────────────
function chequearRutasEnTexto() {
  const rotas = [];
  let revisadas = 0;

  for (const rel of archivosDelRepo(/\.(md|mjs|js|json|html)$/)) {
    let texto;
    try { texto = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    const dir = dirname(join(ROOT, rel));

    // Solo en .md: en un .js la forma `](...)` aparece dentro de expresiones
    // regulares (`[^"']+(...)`) y las tomaba por links rotos. Trece falsos
    // positivos de una — y un chequeo que grita en vano se empieza a ignorar,
    // que es peor que no tenerlo.
    for (const m of (rel.endsWith('.md') ? texto.matchAll(/\]\(([^)\s]+)\)/g) : [])) {
      const raw = m[1].split('#')[0];
      if (!raw || /^(https?:|mailto:|tel:|#|\/\/)/.test(raw)) continue;
      if (/^\[?[A-Z_]{4,}\]?$/.test(raw)) continue;   // marcadores tipo [URL_ACCESO_CURSO]

      // Un link puede apuntar a un archivo o a una CARPETA. Los de carpeta no
      // tienen extensión, y hasta el 2026-08-01 se salteaban: por ahí pasó
      // `organic/README.md` linkeando `../../carousels/`, que no existe desde la
      // mudanza. Un link relativo roto en un README es de los que nadie prueba.
      const esCarpeta = !EXT_LOCAL.test(raw);
      if (esCarpeta && /[<>*${}]|_X\b|_Y\b|_N\b/.test(raw)) continue;   // plantillas
      revisadas++;
      const destino = raw.startsWith('/') ? join(ROOT, raw) : resolve(dir, raw);
      if (!existsSync(destino)) {
        rotas.push({ rel, ref: raw, tipo: esCarpeta ? 'link markdown a una carpeta que no existe' : 'link markdown' });
      }
    }

    for (const m of texto.matchAll(/(?<![\w./-])(ads-agent|sistema-ingresos)\/[\w./-]+/g)) {
      if (!EXT_LOCAL.test(m[0])) continue;
      // Plantillas tipo `modulo_X/clase_Y.md`: son ejemplos, no rutas reales.
      if (/_X\b|_Y\b/.test(m[0])) continue;
      revisadas++;
      if (!existsSync(join(ROOT, m[0]))) rotas.push({ rel, ref: m[0], tipo: 'ruta desde la raíz' });
    }

    // Rutas de CARPETA (sin extensión). Este bloque se sumó el 2026-08-01: hasta
    // entonces solo se validaban rutas con extensión de archivo, y por ese hueco
    // pasaron 19 carpetas inexistentes. Una era `ads-agent/carousels/muro-stories`
    // dentro de api/_lib/story-diaria.js — la historia diaria de Facebook habría
    // dado 404 el 16/08 sin avisar.
    for (const m of texto.matchAll(RE_CARPETA)) {
      const ruta = m[0].replace(/[./]+$/, '');
      if (EXT_LOCAL.test(ruta)) continue;              // ya lo cubre el bloque de arriba
      if (/[<>*${}]|_X\b|_Y\b|_N\b|XXX|YYYY|DD-MM/.test(ruta)) continue;  // plantillas
      // Un glob corta el match antes del `*` (`log-leadr-l*.csv` llega como
      // `…/log-leadr-l`), así que hay que mirar el carácter que sigue.
      if (/[*?]/.test(texto[m.index + m[0].length] ?? '')) continue;
      if (ruta.split('/').length < 2) continue;
      if (RUTAS_HISTORICAS.has(ruta)) continue;
      revisadas++;
      if (!existsSync(join(ROOT, ruta))) {
        rotas.push({ rel, ref: ruta + '/', tipo: 'carpeta que ya no existe' });
      }
    }
  }
  return { revisadas, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Anclajes de los scripts de ads-agent
// ─────────────────────────────────────────────────────────────────────────────
// Carpetas que el propio script crea al arrancar: que no existan no es un error.
// hotmart-chrome-profile es el userDataDir de puppeteer — se borró el 2026-07-30
// para recuperar 391 MB y se regenera sola (pide login a Hotmart una vez).
// Se crean solas al correr, y el código ya contempla que no existan todavía.
const SE_CREAN_SOLAS = new Set([
  'hotmart-chrome-profile',                 // userDataDir de puppeteer
  'state/stories-publicadas.json',          // lo escribe post-story la 1ª vez
]);

function chequearAnclajes() {
  const baseScripts = join(ROOT, 'ads-agent', 'scripts');
  if (!existsSync(baseScripts)) return { revisadas: 0, rotas: [] };

  const rotas = [];
  let revisadas = 0;

  // Solo los grupos: en scripts/ también vive su propio README.md.
  const scripts = [];
  for (const g of readdirSync(baseScripts, { withFileTypes: true })) {
    if (!g.isDirectory()) continue;
    for (const f of readdirSync(join(baseScripts, g.name))) {
      if (f.endsWith('.mjs')) scripts.push(join(baseScripts, g.name, f));
    }
  }

  // `lib/` también entra. Se sumó el 2026-08-01, cuando la carga de claves se
  // centralizó en lib/env.mjs: al sacar esas rutas de los scripts, quedaron
  // fuera de este control sin que nada lo dijera. Justo la ruta más cara de
  // romper —la del archivo de claves— pasó a estar en la única carpeta que no
  // se miraba.
  const baseLib = join(ROOT, 'ads-agent', 'lib');
  if (existsSync(baseLib)) {
    for (const f of readdirSync(baseLib)) {
      if (f.endsWith('.mjs')) scripts.push(join(baseLib, f));
    }
  }

  for (const abs of scripts) {
    const rel = abs.replace(ROOT + '\\', '').replace(/\\/g, '/');
    const dir = dirname(abs);
    const src = readFileSync(abs, 'utf8');

    // A qué carpeta apunta cada variable de anclaje declarada en el archivo
    const anclas = { __dirname: dir, scriptDir: dir, DIR: dir, RAIZ: dir };
    const conSaltos = /const\s+(\w+)\s*=\s*(?:path\.)?join\(\s*(?:(?:path\.)?dirname\(fileURLToPath\(import\.meta\.url\)\)|__dirname)((?:\s*,\s*'[^']+')*)\s*\)/g;
    for (const m of src.matchAll(conSaltos)) {
      anclas[m[1]] = resolve(dir, ...[...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]));
    }
    for (const m of src.matchAll(/const\s+(\w+)\s*=\s*(?:path\.)?dirname\(fileURLToPath\(import\.meta\.url\)\)/g)) {
      anclas[m[1]] = dir;
    }

    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*'(\.[^']+)'/g)) {
      revisadas++;
      if (!existsSync(resolve(dir, m[1]))) rotas.push({ rel, ref: m[1], tipo: 'import relativo' });
    }
    for (const m of src.matchAll(/new URL\(\s*'([^']+)'\s*,\s*import\.meta\.url\s*\)/g)) {
      revisadas++;
      if (!existsSync(resolve(dir, m[1]))) rotas.push({ rel, ref: m[1], tipo: 'new URL(import.meta.url)' });
    }
    for (const m of src.matchAll(/(?:path\.)?join\(\s*(\w+)\s*,\s*'([^']+)'/g)) {
      const [, ancla, primero] = m;
      if (!(ancla in anclas) || primero.includes('${')) continue;
      if (SE_CREAN_SOLAS.has(primero)) continue;
      revisadas++;
      if (!existsSync(join(anclas[ancla], primero))) {
        rotas.push({ rel, ref: `join(${ancla}, '${primero}')`, tipo: 'anclaje de ruta' });
      }
    }

    // Carpetas nombradas como literal suelto, relativas al cwd (= ads-agent):
    //   join('datos', 'meta-exports', ...)  ·  mkdirSync('datos/reports')
    // Este caso se me escapó al reorganizar el 2026-08-01: fetch-meta seguía
    // escribiendo en 'campaigns' y, como usa mkdirSync, la RECREABA en silencio.
    // No fallaba: simplemente dejaba el export en una carpeta fantasma.
    const CWD = join(ROOT, 'ads-agent');
    const CARPETAS = /^(datos|campanas|contenido|state|lib|docs|scripts)$/;
    for (const m of src.matchAll(/'([\w-]+\/[\w./-]*)'/g)) {
      const ruta = m[1].replace(/\/$/, '');
      if (!CARPETAS.test(ruta.split('/')[0])) continue;
      if (SE_CREAN_SOLAS.has(ruta)) continue;
      if (ruta.includes('${')) continue;
      revisadas++;
      // Se valida la ruta COMPLETA, no solo el primer segmento. Mover
      // carousels/semana-* a carousels/publicados/ dejó 76 rutas rotas que el
      // chequeo anterior daba por buenas porque "carousels/" seguía existiendo.
      if (!existsSync(join(CWD, ruta))) {
        rotas.push({ rel, ref: `'${ruta}'`, tipo: 'ruta relativa al cwd que ya no existe' });
      }
    }
  }
  return { revisadas, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. URLs públicas contra vercel.json
// ─────────────────────────────────────────────────────────────────────────────
function chequearUrlsPublicas() {
  const cfgPath = join(SI, 'vercel.json');
  if (!existsSync(cfgPath)) return { revisadas: 0, rotas: [] };
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));

  // La lista de páginas vive en el script de QA. Se busca en sus ubicaciones
  // conocidas en vez de asumir una: si un día se mueve, el chequeo avisa en
  // lugar de romperse.
  const qaPath = [join(SI, 'qa', 'qa-salud-sitio.mjs'), join(SI, 'qa-salud-sitio.mjs')].find(existsSync);
  if (!qaPath) {
    return { revisadas: 0, rotas: [{ rel: 'sistema-ingresos/', ref: 'qa-salud-sitio.mjs', tipo: 'no se encontró: sin él no se pueden chequear las URLs públicas' }] };
  }
  const paginas = [...readFileSync(qaPath, 'utf8').matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);

  const emisores = ['api/wa-funnel.js', 'api/d.js', 'api/_lib/asistente.js']
    .map((f) => join(SI, f))
    .concat([join(ROOT, 'ads-agent', 'scripts', 'publicar', 'send-email.mjs')])
    .filter(existsSync)
    .map((f) => readFileSync(f, 'utf8')).join('\n');

  const pdfs = new Set([...emisores.matchAll(/(?:file=|com\/)([a-z0-9-]+\.pdf)/g)].map((m) => '/' + m[1]));
  const urls = [...new Set([...paginas, ...pdfs])].filter((u) => u && u.startsWith('/')).sort();

  const rotas = [];
  for (const url of urls) {
    const path = url.split('?')[0];
    let destino = path, via = '';

    const red = (cfg.redirects || []).find((r) =>
      new RegExp('^' + r.source.replace(/:path\*/g, '.*').replace(/\./g, '\\.') + '$').test(path));
    if (red) continue; // un redirect siempre resuelve (manda a otra URL)

    const rw = (cfg.rewrites || []).find((w) => w.source === path);
    if (rw) { destino = rw.destination; via = ` (rewrite → ${destino})`; }

    if (!existsSync(join(SI, destino.replace(/^\//, '')))) {
      rotas.push({ rel: 'sistema-ingresos/vercel.json', ref: `${url}${via}`, tipo: 'URL pública sin destino' });
    }
  }
  return { revisadas: urls.length, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. El contrato con Vercel
// ─────────────────────────────────────────────────────────────────────────────
// Hay cosas que la plataforma impone y no son decisión nuestra. La principal:
// Vercel convierte en función serverless SOLO lo que está en `api/` en la raíz
// del proyecto. Si esa carpeta se mueve o se renombra "para ordenar", los
// endpoints dejan de existir sin ningún error visible — se cae el webhook de
// compra de Hotmart y los dos crons, y nos enteramos por una venta perdida.
function chequearContratoVercel() {
  const cfgPath = join(SI, 'vercel.json');
  if (!existsSync(cfgPath)) return { revisadas: 0, rotas: [] };
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const rotas = [];
  let revisadas = 1;

  if (!existsSync(join(SI, 'api'))) {
    rotas.push({
      rel: 'sistema-ingresos/',
      ref: 'api/',
      tipo: 'TIENE que estar en la raíz del proyecto o Vercel no crea ninguna función',
    });
    return { revisadas, rotas };
  }

  // Cada función declarada (memoria, duración) tiene que existir.
  for (const f of Object.keys(cfg.functions || {})) {
    revisadas++;
    if (!existsSync(join(SI, f))) {
      rotas.push({ rel: 'sistema-ingresos/vercel.json', ref: f, tipo: 'función declarada que no existe' });
    }
  }

  // Cada cron tiene que apuntar a una función real: un cron a una ruta muerta
  // no falla ruidosamente, simplemente no pasa nada todos los días.
  for (const c of cfg.crons || []) {
    revisadas++;
    const archivo = join(SI, c.path.replace(/^\//, '') + '.js');
    if (!existsSync(archivo)) {
      rotas.push({ rel: 'sistema-ingresos/vercel.json', ref: `cron ${c.path}`, tipo: 'apunta a una función que no existe' });
    }
  }

  return { revisadas, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Los pipelines de .claude/
// ─────────────────────────────────────────────────────────────────────────────
// Un pipeline que cita un archivo que ya no existe es la peor falla del sistema:
// no rompe nada, el modelo simplemente no encuentra ese contexto e IMPROVISA.
// El resultado parece válido y no lo es.
const PIPELINES_LEGACY = new Set(['crear_clase.md', 'crear_bono.md', 'desarrollar_clase.md']);

function chequearPipelines() {
  const rotas = [];
  let revisadas = 0;
  const dirs = ['.claude/commands', '.claude/agents'];
  // rutas desde la raíz del repo citadas en el texto del pipeline
  const RE = /(?<![\w./-])((?:ads-agent|sistema-ingresos|herramientas|\.claude|\.agents)\/[\w./_-]+)/g;

  for (const d of dirs) {
    let entradas;
    try { entradas = readdirSync(join(ROOT, d)); } catch { continue; }
    for (const f of entradas) {
      if (!f.endsWith('.md')) continue;
      // El trío legacy depende de un workspace que ya no existe, a sabiendas:
      // está documentado en .claude/README.md. Marcarlo cada vez sería ruido.
      if (PIPELINES_LEGACY.has(f)) continue;
      const rel = `${d}/${f}`;
      const txt = readFileSync(join(ROOT, rel), 'utf8');
      for (const m of txt.matchAll(RE)) {
        const ref = m[1].replace(/[.,)`]+$/, '');
        if (!/\.\w{2,5}$/.test(ref)) continue;      // solo archivos concretos
        if (/_X|_Y|<|\[/.test(ref)) continue;        // plantillas tipo modulo_X/clase_Y
        revisadas++;
        if (!existsSync(join(ROOT, ref))) rotas.push({ rel, ref, tipo: 'el pipeline cita algo que no existe' });
      }
    }
  }
  return { revisadas, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Coherencia del equipo de agentes
// ─────────────────────────────────────────────────────────────────────────────
// El estado de cada agente vive en ads-agent/state/*.json, pero el Panel de
// Comando corre en la nube y NO puede clonar el repo: los baja de GitHub por
// ruta fija (sistema-ingresos/api/_lib/sync-estados.js). Esa función tiene
// además una lista fija de respaldo para cuando la API de GitHub falla — y si
// se agrega un agente y nadie la actualiza, ese agente desaparece del panel
// justo el día que GitHub responde 403. Nadie se entera.
function chequearAgentes() {
  const dirState = join(ROOT, 'ads-agent', 'state');
  const sync = join(SI, 'api', '_lib', 'sync-estados.js');
  if (!existsSync(dirState) || !existsSync(sync)) return { revisadas: 0, rotas: [] };

  const rotas = [];
  const enDisco = readdirSync(dirState)
    .filter((f) => f.endsWith('-state.json'))
    .map((f) => f.replace('-state.json', ''))
    .sort();

  const src = readFileSync(sync, 'utf8');

  // La ruta que la función usa contra GitHub tiene que seguir existiendo acá.
  const dir = src.match(/const\s+DIR\s*=\s*'([^']+)'/)?.[1];
  if (dir && !existsSync(join(ROOT, dir))) {
    rotas.push({ rel: 'sistema-ingresos/api/_lib/sync-estados.js', ref: dir, tipo: 'la función lo baja de GitHub y ya no existe en el repo' });
  }

  const fallback = (src.match(/AGENTES_FALLBACK\s*=\s*\[([\s\S]*?)\]/)?.[1] || '')
    .match(/'([^']+)'/g)?.map((s) => s.replace(/'/g, '')).sort() || [];

  for (const a of enDisco) {
    if (!fallback.includes(a)) {
      rotas.push({ rel: 'sistema-ingresos/api/_lib/sync-estados.js', ref: a, tipo: 'agente con state pero fuera de AGENTES_FALLBACK' });
    }
  }
  for (const a of fallback) {
    if (!enDisco.includes(a)) {
      rotas.push({ rel: 'sistema-ingresos/api/_lib/sync-estados.js', ref: a, tipo: 'está en AGENTES_FALLBACK pero ya no tiene state' });
    }
  }
  return { revisadas: enDisco.length + 1, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. La regla "nada suelto": carpeta con contenido propio → su README
// ─────────────────────────────────────────────────────────────────────────────
// EL CHEQUEO AL REVÉS. Los seis de arriba preguntan "lo que está nombrado,
// ¿existe?". Este pregunta lo contrario: "lo que existe, ¿está explicado?".
//
// Por qué hacía falta: una carpeta puede estar ahí, no romper nada, no aparecer
// en ningún chequeo y aun así ser un problema. Pasó dos veces el 2026-08-01 —
// `ads-agent/emails/` la creaba un script sin que nadie la nombrara, y
// `.agents/skills/` tenía dos capacidades que en ese lugar ni se cargaban.
// Ninguno de los seis controles anteriores podía verlas.
//
// Solo se miran carpetas con contenido PROPIO de texto. Las de assets
// (imágenes, PDF, JPG de un carrusel) las explica su README padre — pedirles uno
// a cada `para-subir/3-MIERCOLES` sería ruido, y un chequeo ruidoso se ignora.
const SIN_README_A_PROPOSITO = [
  /\/para-subir(\/|$)/,                       // los JPG listos de un carrusel
  /\/ads\/[\w-]+$/,                           // un anuncio: su `ficha.md` ES la documentación
  /\/\d{4}-\d{2}-\d{2}$/,                     // carpeta fechada de contenido: la explica el padre
  /^ads-agent\/campanas\/historico\//,        // archivo: lo explica el padre
  /^ads-agent\/contenido\/carousels\/publicados\//,
  /^ads-agent\/contenido\/carousels\/(muro|agosto)-s\d/,
  /^ads-agent\/contenido\/carousels\/muro-stories$/,
  /^ads-agent\/datos\//,                      // lo generan los scripts, es borrable
  /^sistema-ingresos\/curso\/video-studio\//, // respaldo del estudio, no se edita acá
  /^\.claude(\/|$)/, /^\.vscode(\/|$)/, /node_modules/,
];

function chequearCarpetasDocumentadas() {
  const rotas = [];
  const carpetas = new Set();
  const archivosPorDir = {};

  for (const rel of archivosDelRepo(/\.(md|mjs|js|json|html|ts|tsx)$/)) {
    const dir = dirname(rel);
    if (dir === '.') continue;
    carpetas.add(dir);
    (archivosPorDir[dir] ||= []).push(rel);
  }

  for (const dir of carpetas) {
    if (SIN_README_A_PROPOSITO.some((re) => re.test(dir))) continue;
    // Solo cuentan las que tienen contenido de texto propio, no solo config.
    const propios = archivosPorDir[dir].filter((f) => !/package(-lock)?\.json$/.test(f));
    if (!propios.length) continue;
    if (!existsSync(join(ROOT, dir, 'README.md'))) {
      rotas.push({ rel: dir + '/', ref: `${propios.length} archivos`, tipo: 'carpeta con contenido y sin README' });
    }
  }
  return { revisadas: carpetas.size, rotas };
}

// ── 8) Toda campaña con su ficha de flujo ────────────────────────────────────
//
// POR QUÉ. El 10/08/2026, al escribir el inventario de flujos, aparecieron dos huecos que
// nadie había visto: `republicadores` captura leads y no les manda nada después de la guía
// (196 personas, con el anuncio activo y gastando), y el post-compra no existe. Los dos
// llevaban semanas así. No se ven mirando el código: cada flujo por separado parece completo
// —el de republicadores entrega su guía y devuelve 200—, y lo que falta es el paso siguiente,
// que no está en ningún lado y por eso no falla.
//
// La ficha los hace visibles porque obliga a contestar "¿qué piezas y cuándo?" para cada
// campaña. Este chequeo existe para que una campaña nueva no pueda nacer sin esa respuesta:
// si no está registrada en FLUJOS.md, salta acá.
//
// No valida el contenido de la ficha (eso lo lee una persona) — sólo que la campaña exista
// en el inventario. Es el mínimo que se puede verificar sin adivinar.
// ⚠️ UN FLUJO DE MAILS NO ES UNA CAMPAÑA DE META. La primera versión de este chequeo (10/08)
// exigía que TODA carpeta de campaña apareciera en el inventario de flujos, incluidas las de
// `ads-agent/campanas/` — que son campañas de ANUNCIOS. Eso obligaba a `interaccion` (gasto de
// marca, no captura nada) a tener una ficha de mails que decía "ninguna pieza": ruido, y una
// ficha que nadie iba a mantener. Se corrige el mismo día: sólo se exige ficha a las campañas
// de CAPTACIÓN, que son las de `sistema-ingresos/campanas/` — las que piden un email y por
// tanto deben tener una secuencia detrás. Las de Meta declaran el vínculo en su `brief.md`.
const FICHAS = 'sistema-ingresos/docs/FLUJOS.md';
function chequearFichasDeFlujo() {
  const rotas = [];
  const ignorar = new Set(['TEMPLATE', 'historico']);

  if (!existsSync(join(ROOT, FICHAS))) {
    return { revisadas: 0, rotas: [{ rel: FICHAS, ref: 'el inventario de flujos de mails', tipo: 'no existe' }] };
  }
  const inventario = readFileSync(join(ROOT, FICHAS), 'utf8');
  let revisadas = 0;

  // 1) Toda campaña de CAPTACIÓN tiene su ficha. Si pide un email, algo tiene que pasar después.
  const baseCaptacion = join(ROOT, 'sistema-ingresos/campanas');
  if (existsSync(baseCaptacion)) {
    for (const e of readdirSync(baseCaptacion, { withFileTypes: true })) {
      if (!e.isDirectory() || ignorar.has(e.name)) continue;
      revisadas++;
      // Alcanza con que el nombre esté mencionado: no coincide entre capas (la carpeta
      // `guia-claude-periodistas` es el flujo `guias-claude`), así que exigir igualdad
      // daría falsos positivos.
      const alias = [e.name, e.name.replace(/-periodistas$/, '').replace(/^guia-/, 'guias-')];
      if (!alias.some((a) => inventario.includes(a))) {
        rotas.push({ rel: FICHAS, ref: `falta la ficha del flujo de "${e.name}"`, tipo: 'campaña de captación sin ficha' });
      }
    }
  }

  // 2) Todo motor que la ficha nombra existe de verdad. Una ficha que apunta a un archivo
  // borrado es peor que no tener ficha: se lee como si el flujo estuviera vivo.
  for (const m of inventario.matchAll(/`((?:sistema-ingresos|ads-agent)\/[\w./-]+\.(?:js|mjs|ts))`/g)) {
    revisadas++;
    if (!existsSync(join(ROOT, m[1]))) {
      rotas.push({ rel: FICHAS, ref: `nombra el motor ${m[1]}, que no existe`, tipo: 'ficha apunta a un archivo borrado' });
    }
  }
  return { revisadas, rotas };
}

// ─────────────────────────────────────────────────────────────────────────────

const pasos = [
  ['Rutas escritas en docs y código', chequearRutasEnTexto],
  ['Anclajes e imports de ads-agent/scripts', chequearAnclajes],
  ['URLs públicas contra vercel.json', chequearUrlsPublicas],
  ['Contrato con Vercel (api/ y crons)', chequearContratoVercel],
  ['Pipelines de .claude/ (contexto vivo)', chequearPipelines],
  ['Equipo de agentes (state ↔ panel en la nube)', chequearAgentes],
  ['Nada suelto: toda carpeta con su README', chequearCarpetasDocumentadas],
  ["Flujos de mails: ficha por campaña de captación + motores vivos", chequearFichasDeFlujo],
];

let totalRotas = 0;
console.log('');
for (const [titulo, fn] of pasos) {
  const { revisadas, rotas } = fn();
  totalRotas += rotas.length;
  const estado = rotas.length ? rojo(`${rotas.length} ROTA(S)`) : verde('OK');
  console.log(`${estado}  ${titulo}  —  ${revisadas} chequeadas`);
  const porArchivo = {};
  for (const r of rotas) (porArchivo[r.rel] ||= []).push(r);
  for (const [f, list] of Object.entries(porArchivo)) {
    console.log(`        ${f}`);
    for (const r of list) console.log(`          → ${r.ref}   [${r.tipo}]`);
  }
}

console.log('');
if (totalRotas) {
  console.log(rojo(`✗ ${totalRotas} referencia(s) rota(s).`) + ' Arreglar antes de deployar.\n');
  process.exit(1);
}
console.log(verde('✓ Ninguna ruta rota.') + '\n');
