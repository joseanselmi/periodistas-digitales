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

    for (const m of texto.matchAll(/\]\(([^)\s]+)\)/g)) {
      const raw = m[1].split('#')[0];
      if (!raw || /^(https?:|mailto:|tel:|#|\/\/)/.test(raw) || !EXT_LOCAL.test(raw)) continue;
      revisadas++;
      const destino = raw.startsWith('/') ? join(ROOT, raw) : resolve(dir, raw);
      if (!existsSync(destino)) rotas.push({ rel, ref: raw, tipo: 'link markdown' });
    }

    for (const m of texto.matchAll(/(?<![\w./-])(ads-agent|sistema-ingresos)\/[\w./-]+/g)) {
      if (!EXT_LOCAL.test(m[0])) continue;
      // Plantillas tipo `modulo_X/clase_Y.md`: son ejemplos, no rutas reales.
      if (/_X\b|_Y\b/.test(m[0])) continue;
      revisadas++;
      if (!existsSync(join(ROOT, m[0]))) rotas.push({ rel, ref: m[0], tipo: 'ruta desde la raíz' });
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
const SE_CREAN_SOLAS = new Set(['hotmart-chrome-profile']);

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
    for (const m of src.matchAll(/(?:join|mkdirSync|readFileSync|writeFileSync|existsSync)\(\s*'([\w-]+)\/?[\w./-]*'/g)) {
      const primerSegmento = m[1];
      // solo nos importan los que parecen carpetas del proyecto
      if (!/^(datos|campanas|carousels|organic|emails|state|lib|docs|ads-curso|playbooks|dashboards|creatives|hotmart-transcripts|scripts|results)$/.test(primerSegmento)) continue;
      revisadas++;
      if (!existsSync(join(CWD, primerSegmento))) {
        rotas.push({ rel, ref: `'${primerSegmento}/…'`, tipo: 'carpeta relativa al cwd que ya no existe' });
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

const pasos = [
  ['Rutas escritas en docs y código', chequearRutasEnTexto],
  ['Anclajes e imports de ads-agent/scripts', chequearAnclajes],
  ['URLs públicas contra vercel.json', chequearUrlsPublicas],
  ['Contrato con Vercel (api/ y crons)', chequearContratoVercel],
  ['Pipelines de .claude/ (contexto vivo)', chequearPipelines],
  ['Equipo de agentes (state ↔ panel en la nube)', chequearAgentes],
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
