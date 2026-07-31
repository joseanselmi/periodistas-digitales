// radar-tendencias.mjs — RADAR DE TENDENCIAS DE TIKTOK
//
// Mira una lista curada de cuentas de TikTok cada X horas y avisa QUE ESTA
// EXPLOTANDO AHORA, con el angulo periodistico ya escrito. Pensado como bono del
// curso: el alumno abre el radar a la manana y tiene 3 temas listos para escribir.
//
// ── POR QUE CUENTAS Y NO BUSQUEDA POR PALABRA ────────────────────────────────
// Probado el 2026-07-29: la busqueda por keyword de TikTok devuelve captcha y los
// hashtags piden registro de app. Los PERFILES publicos, en cambio, se leen gratis
// con yt-dlp (3 s por cuenta, sin bloqueos). Ademas seguir fuentes da mejor senal
// que seguir palabras. Ver fuentes.json para como armar la lista.
//
// ── LA IDEA CENTRAL: VELOCIDAD, NO VOLUMEN ──────────────────────────────────
// Un video con 800.000 vistas de hace 3 dias es historia vieja. Uno con 40.000 de
// hace 6 horas esta explotando AHORA. Eso es lo que da la primicia.
//
// Pero "vistas por hora" solo no alcanza, por dos motivos:
//   1) Un video junta la mayor parte de sus vistas en las primeras horas. Comparar
//      el ritmo de uno fresco contra el de uno viejo marcaria todo como viral.
//   2) 12.000 vistas en una cuenta chica valen mas que 300.000 en RTVE.
// Entonces hacemos dos cosas: PROYECTAMOS donde va a terminar el video segun su
// edad, y lo comparamos contra LO NORMAL DE ESA MISMA CUENTA (su mediana). El
// resultado es un "factor": 3x = triplica lo habitual de la cuenta. Eso detecta lo
// que explota sin importar el tamano de quien lo publico.
//
// ── USO ─────────────────────────────────────────────────────────────────────
//   node scripts/agentes/radar-tendencias.mjs --tema madrid
//   node scripts/agentes/radar-tendencias.mjs --tema argentina --ventana 24 --umbral 2.5
//   node scripts/agentes/radar-tendencias.mjs --verificar          # chequea que los handles existan
//   node scripts/agentes/radar-tendencias.mjs --tema madrid --sin-ia   # solo el ranking, sin Claude
//
// Requisitos: yt-dlp en el PATH  ·  ANTHROPIC_API_KEY en .env  (salvo con --sin-ia)
// NO corre en Vercel: yt-dlp es un binario y TikTok trata distinto a las IPs de
// datacenter. Corre local (o en una VM) y publica el resultado.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const execFileAsync = promisify(execFile);
// Este script vive en scripts/agentes/; radar/ esta en la raiz de ads-agent.
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RADAR_DIR = path.join(DIR, 'radar');
const FUENTES = path.join(RADAR_DIR, 'fuentes.json');
const MODELO = 'claude-sonnet-5';

// Cuantos videos recientes pedimos por cuenta. Necesitamos bastantes para que la
// mediana de la cuenta (la "linea de base") sea confiable, no solo los frescos.
const VIDEOS_POR_CUENTA = 15;
const CONCURRENCIA = 4;        // cuentas en paralelo. Mas alto = riesgo de bloqueo.
const HORAS_ASENTADO = 48;     // a partir de aca consideramos que un video ya rindio

// ── CLI ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { ventana: 48, umbral: 3, sinIA: false, verificar: false, tema: null, max: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--tema') a.tema = argv[++i];
    else if (k === '--ventana') a.ventana = Number(argv[++i]);
    else if (k === '--umbral') a.umbral = Number(argv[++i]);
    else if (k === '--max') a.max = Number(argv[++i]);
    else if (k === '--sin-ia') a.sinIA = true;
    else if (k === '--verificar') a.verificar = true;
  }
  return a;
}

// ── Lectura de una cuenta via yt-dlp ────────────────────────────────────────
// --flat-playlist evita descargar el video: solo trae los metadatos, que es todo
// lo que necesitamos (vistas, likes, fecha, descripcion). Por eso es rapido.
async function leerCuenta(handle) {
  const args = [
    '--flat-playlist',
    '--playlist-end', String(VIDEOS_POR_CUENTA),
    '--dump-json',
    '--no-warnings',
    '--ignore-errors',
    `https://www.tiktok.com/@${handle}`,
  ];
  try {
    const { stdout } = await execFileAsync('yt-dlp', args, {
      maxBuffer: 32 * 1024 * 1024,
      timeout: 90_000,
    });
    const videos = [];
    for (const linea of stdout.split('\n')) {
      if (!linea.trim()) continue;
      try {
        const d = JSON.parse(linea);
        if (!d.id || !d.timestamp) continue;
        videos.push({
          id: String(d.id),
          cuenta: handle,
          url: d.url || d.original_url || `https://www.tiktok.com/@${handle}/video/${d.id}`,
          texto: (d.title || d.description || '').trim(),
          vistas: Number(d.view_count) || 0,
          likes: Number(d.like_count) || 0,
          comentarios: Number(d.comment_count) || 0,
          publicado: Number(d.timestamp) * 1000,
        });
      } catch { /* linea suelta que no es JSON: se ignora */ }
    }
    return { handle, ok: videos.length > 0, videos };
  } catch (e) {
    return { handle, ok: false, videos: [], error: String(e.message || e).slice(0, 160) };
  }
}

// Corre las cuentas de a tandas para no golpear a TikTok de una.
async function leerCuentas(handles, onProgreso) {
  const salida = [];
  for (let i = 0; i < handles.length; i += CONCURRENCIA) {
    const tanda = handles.slice(i, i + CONCURRENCIA);
    const res = await Promise.all(tanda.map(leerCuenta));
    for (const r of res) { salida.push(r); onProgreso?.(r, salida.length, handles.length); }
  }
  return salida;
}

// ── El calculo de velocidad ─────────────────────────────────────────────────
const mediana = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Que fraccion de sus vistas finales tiene un video a las `h` horas de publicado.
// Aproximacion: los videos son muy front-loaded (la mayoria de las vistas llegan
// temprano), asi que usamos una raiz en vez de una recta. A las 6h ~35%, a las 12h
// ~50%, a las 24h ~71%, a las 48h 100%. No es exacto — es suficiente para ordenar.
function fraccionVista(h) {
  return Math.sqrt(Math.min(Math.max(h, 0.5), HORAS_ASENTADO) / HORAS_ASENTADO);
}

function analizarCuenta(videos, ahora, ventanaHoras) {
  const conEdad = videos.map((v) => ({ ...v, edadHoras: (ahora - v.publicado) / 3_600_000 }));

  // Linea de base: cuanto junta normalmente esta cuenta. Solo videos ya asentados,
  // porque los frescos todavia estan sumando y ensuciarian la mediana hacia abajo.
  const asentados = conEdad.filter((v) => v.edadHoras >= HORAS_ASENTADO && v.vistas > 0);
  const base = mediana(asentados.map((v) => v.vistas));

  const frescos = conEdad.filter((v) => v.edadHoras <= ventanaHoras && v.edadHoras >= 0.5);
  return frescos.map((v) => {
    const proyectado = Math.round(v.vistas / fraccionVista(v.edadHoras));
    // Sin linea de base (cuenta nueva o sin videos viejos) no podemos comparar
    // contra su normal: devolvemos factor 0 para que no ensucie el ranking.
    const factor = base > 0 ? proyectado / base : 0;
    const interaccion = v.vistas > 0 ? (v.likes + v.comentarios) / v.vistas : 0;
    return { ...v, base, proyectado, factor, interaccion };
  });
}

// ── Memoria: que ya avisamos ────────────────────────────────────────────────
// Sin esto el radar repetiria el mismo video en cada pasada y perderia utilidad.
async function leerVistos(tema) {
  const f = path.join(RADAR_DIR, `vistos-${tema}.json`);
  if (!existsSync(f)) return { ids: {} };
  try { return JSON.parse(await readFile(f, 'utf8')); } catch { return { ids: {} }; }
}
async function guardarVistos(tema, vistos, nuevos) {
  const ahora = Date.now();
  for (const v of nuevos) vistos.ids[v.id] = ahora;
  // Purga lo de mas de 15 dias para que el archivo no crezca sin fin.
  const corte = ahora - 15 * 86_400_000;
  for (const [id, t] of Object.entries(vistos.ids)) if (t < corte) delete vistos.ids[id];
  await mkdir(RADAR_DIR, { recursive: true });
  await writeFile(path.join(RADAR_DIR, `vistos-${tema}.json`), JSON.stringify(vistos, null, 1), 'utf8');
}

// ── La capa que convierte datos en temas ────────────────────────────────────
const PROMPT = `Sos el editor de una redaccion que recibe una lista de videos de TikTok que estan
acelerando ahora mismo. Tu trabajo NO es describir los videos: es decirle a un periodista
QUE NOTA PUEDE ESCRIBIR HOY con esto.

Contexto del tema: {{CONTEXTO}}

Videos detectados (ordenados por cuanto superan lo normal de su cuenta):
{{VIDEOS}}

Agrupa los videos que hablan de LO MISMO en un solo tema (varios videos sobre el mismo
hecho = un tema, y eso es senal fuerte de que el asunto esta caliente).

Devolve SOLO un JSON valido, sin texto alrededor, con esta forma:
{"temas":[{
  "tema": "de que se trata, en una linea",
  "por_que_ahora": "por que esto es noticia HOY y no la semana pasada",
  "angulo": "el angulo concreto para trabajarlo, en 1-2 frases",
  "titulos": ["tres titulos posibles", "...", "..."],
  "chequear": "que habria que verificar antes de publicarlo",
  "fuerza": "alta|media|baja",
  "videos": [indices de los videos, empezando en 1]
}]}

Reglas:
- Maximo 5 temas. Mejor 2 buenos que 5 flojos.
- Si algo es puro entretenimiento sin arista periodistica, descartalo.
- "fuerza" alta solo si varios videos coinciden o el factor es muy alto.
- "chequear" es obligatorio: nada de TikTok se publica sin verificar.`;

async function pedirTemas(videos, contexto) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const lista = videos.map((v, i) =>
    `${i + 1}. @${v.cuenta} | ${v.vistas.toLocaleString('es')} vistas en ${v.edadHoras.toFixed(1)}h | ` +
    `${v.factor.toFixed(1)}x lo normal de la cuenta | ${(v.interaccion * 100).toFixed(1)}% interaccion\n` +
    `   "${v.texto.slice(0, 220)}"\n   ${v.url}`
  ).join('\n');

  const r = await client.messages.create({
    model: MODELO,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: PROMPT.replace('{{CONTEXTO}}', contexto).replace('{{VIDEOS}}', lista),
    }],
  });

  const txt = r.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Claude no devolvio JSON:\n' + txt.slice(0, 300));
  return JSON.parse(m[0]).temas || [];
}

// ── Informe ─────────────────────────────────────────────────────────────────
const ICONO = { alta: '🔴', media: '🟡', baja: '🔵' };

function informe({ titulo, temas, candidatos, cuentasOk, cuentasFallidas, ventana, umbral }) {
  const cuando = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  const L = [];
  L.push(`# ${titulo}`, '', `_${cuando} · ultimas ${ventana}h · umbral ${umbral}x_`, '');

  // Ojo con no mentir aca: "sin temas" y "sin videos" son cosas distintas. Si hubo
  // videos acelerando pero no se analizaron (falta la clave, o --sin-ia), hay que
  // mostrarlos igual en crudo — si no, el radar dice "no hay nada" habiendo algo.
  if (!temas.length && !candidatos.length) {
    L.push('**Nada caliente en esta pasada.**', '');
    L.push(`Se miraron ${cuentasOk} cuentas y ningun video supero ${umbral}x lo normal de la suya.`);
    L.push('Eso es informacion util: no hay nada urgente ahora mismo.', '');
  } else if (!temas.length) {
    L.push(`**${candidatos.length} video(s) acelerando, sin analizar.**`, '');
    L.push('_Se detectaron pero no se agruparon en temas (falta ANTHROPIC_API_KEY o se uso --sin-ia)._', '');
    candidatos.forEach((v) => L.push(
      `- **${v.factor.toFixed(1)}x** [@${v.cuenta}](${v.url}) — ${v.vistas.toLocaleString('es')} vistas en ${v.edadHoras.toFixed(1)}h\n  _${v.texto.slice(0, 160)}_`
    ));
    L.push('');
  }

  temas.forEach((t, i) => {
    L.push(`## ${ICONO[t.fuerza] || '⚪'} ${i + 1}. ${t.tema}`, '');
    L.push(`**Por que ahora:** ${t.por_que_ahora}`, '');
    L.push(`**Angulo:** ${t.angulo}`, '');
    if (t.titulos?.length) {
      L.push('**Titulos posibles:**');
      t.titulos.forEach((x) => L.push(`- ${x}`));
      L.push('');
    }
    L.push(`**⚠️ Antes de publicar:** ${t.chequear}`, '');
    const vs = (t.videos || []).map((n) => candidatos[n - 1]).filter(Boolean);
    if (vs.length) {
      L.push('**Videos:**');
      vs.forEach((v) => L.push(
        `- [@${v.cuenta}](${v.url}) — ${v.vistas.toLocaleString('es')} vistas en ${v.edadHoras.toFixed(1)}h (**${v.factor.toFixed(1)}x**)`
      ));
      L.push('');
    }
  });

  L.push('---', '');
  L.push(`Cuentas leidas: ${cuentasOk}${cuentasFallidas.length ? ` · sin respuesta: ${cuentasFallidas.join(', ')}` : ''}`);
  L.push(`Videos que superaron el umbral: ${candidatos.length}`, '');
  return L.join('\n');
}

// ── Verificacion de handles ─────────────────────────────────────────────────
// Un handle mal escrito no da error: devuelve 0 videos y el radar queda ciego sin
// avisar. Por eso conviene correr esto cada vez que se toca fuentes.json.
async function verificarTodo(fuentes) {
  console.log('Verificando handles de fuentes.json...\n');
  let malos = 0;
  for (const [clave, tema] of Object.entries(fuentes.temas)) {
    console.log(`[${clave}] ${tema.titulo}`);
    const res = await leerCuentas(tema.cuentas);
    for (const r of res) {
      console.log(`   ${r.ok ? '✅' : '❌'} @${r.handle}  ${r.ok ? `${r.videos.length} videos` : 'sin videos — revisar el handle'}`);
      if (!r.ok) malos++;
    }
    console.log('');
  }
  console.log(malos ? `⚠️  ${malos} cuenta(s) sin responder. Abri tiktok.com/@handle y corregi fuentes.json.` : '✅ Todas las cuentas responden.');
  return malos === 0;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fuentes = JSON.parse(await readFile(FUENTES, 'utf8'));

  if (args.verificar) { process.exit((await verificarTodo(fuentes)) ? 0 : 1); }

  if (!args.tema || !fuentes.temas[args.tema]) {
    console.error(`Falta --tema. Disponibles: ${Object.keys(fuentes.temas).join(', ')}`);
    process.exit(1);
  }
  const tema = fuentes.temas[args.tema];
  const handles = args.max ? tema.cuentas.slice(0, args.max) : tema.cuentas;

  console.log(`\n🛰️  ${tema.titulo} — ${handles.length} cuentas, ultimas ${args.ventana}h\n`);

  const res = await leerCuentas(handles, (r, hechas, total) => {
    console.log(`   [${hechas}/${total}] ${r.ok ? '✅' : '⚠️ '} @${r.handle} ${r.ok ? `(${r.videos.length})` : '— sin videos'}`);
  });

  const cuentasFallidas = res.filter((r) => !r.ok).map((r) => r.handle);
  const ahora = Date.now();

  let candidatos = res
    .filter((r) => r.ok)
    .flatMap((r) => analizarCuenta(r.videos, ahora, args.ventana))
    .filter((v) => v.factor >= args.umbral)
    .sort((a, b) => b.factor - a.factor);

  // Sacamos lo que ya avisamos en pasadas anteriores.
  const vistos = await leerVistos(args.tema);
  const repetidos = candidatos.filter((v) => vistos.ids[v.id]).length;
  candidatos = candidatos.filter((v) => !vistos.ids[v.id]).slice(0, 25);

  console.log(`\n📊 ${candidatos.length} videos acelerando${repetidos ? ` (${repetidos} ya avisados antes)` : ''}\n`);
  candidatos.forEach((v, i) => console.log(
    `   ${String(i + 1).padStart(2)}. ${v.factor.toFixed(1)}x  @${v.cuenta}  ${v.vistas.toLocaleString('es')} vistas / ${v.edadHoras.toFixed(1)}h`
  ));

  let temas = [];
  if (candidatos.length && !args.sinIA) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('\n⚠️  Falta ANTHROPIC_API_KEY — salteo el analisis. (Usa --sin-ia para no ver este aviso.)');
    } else {
      console.log('\n🧠 Analizando con Claude...');
      temas = await pedirTemas(candidatos, tema.contexto || tema.descripcion || '');
    }
  }

  const md = informe({
    titulo: tema.titulo, temas, candidatos,
    cuentasOk: res.filter((r) => r.ok).length, cuentasFallidas,
    ventana: args.ventana, umbral: args.umbral,
  });

  await mkdir(RADAR_DIR, { recursive: true });
  const sello = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const salida = path.join(RADAR_DIR, `${args.tema}-${sello}.md`);
  await writeFile(salida, md, 'utf8');
  await writeFile(path.join(RADAR_DIR, `ultimo-${args.tema}.md`), md, 'utf8');
  await guardarVistos(args.tema, vistos, candidatos);

  console.log('\n' + '─'.repeat(60));
  console.log(md);
  console.log('─'.repeat(60));
  console.log(`\n💾 ${path.relative(process.cwd(), salida)}\n`);
}

main().catch((e) => { console.error('\n❌', e.message || e); process.exit(1); });
