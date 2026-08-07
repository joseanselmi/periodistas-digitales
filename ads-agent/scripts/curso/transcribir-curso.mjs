import puppeteer from 'puppeteer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Las claves salen de ads-agent/.env.local. Un solo lugar decide de donde se
// leen y avisa claro si falta alguna: ../../lib/env.mjs
import { cargarEnv } from '../../lib/env.mjs';
cargarEnv(['ANTHROPIC_API_KEY']);

const execAsync = promisify(exec);
// Dos anclas distintas: transcribe_helper.py viaja al lado de este script
// (scripts/curso/), pero los datos viven en la raiz de ads-agent.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(RAIZ, '..', '_material', 'luis-mena');
const AUDIO_DIR = path.join(OUT_DIR, 'audio');
const CHROME_PROFILE = path.join(RAIZ, 'hotmart-chrome-profile');
const MEMORY_FILE = 'C:\\Users\\Jose Anselmi\\.claude\\projects\\c--Users-Jose-Anselmi-OneDrive-Escritorio-Periodistas-Digitales\\memory\\curso_sistema_ingresos_diarios.md';
const LESSONS_FILE = path.join(OUT_DIR, 'lessons.json');
const PROGRESS_FILE = path.join(OUT_DIR, 'progress.json');

const COURSE_URL = 'https://hotmart.com/es/club/luismena/products/4332046';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function log(msg) { console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// Cargar progreso guardado (para resumir si se interrumpe)
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { completed: [] };
}

function saveProgress(lessonHref) {
  const p = loadProgress();
  if (!p.completed.includes(lessonHref)) p.completed.push(lessonHref);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: false });
}

// Extraer URL del video desde el player de Hotmart
async function getVideoUrl(page) {
  // Interceptar requests de red para capturar la URL del video
  const videoUrls = [];

  page.on('request', req => {
    const url = req.url();
    if (
      url.includes('.mp4') || url.includes('.m3u8') ||
      url.includes('vimeo') || url.includes('player') ||
      url.includes('video') || url.includes('stream')
    ) {
      videoUrls.push(url);
    }
  });

  // Esperar que el video cargue
  await wait(5000);

  // También buscar iframes de video en la página
  const iframeUrl = await page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="vimeo"], iframe[src*="video"], iframe[src*="player"]');
    return iframe?.src || null;
  });

  if (iframeUrl) videoUrls.unshift(iframeUrl);

  // Buscar en el DOM cualquier src de video
  const videoSrc = await page.evaluate(() => {
    const video = document.querySelector('video');
    if (video?.src) return video.src;
    const source = document.querySelector('video source');
    return source?.src || null;
  });

  if (videoSrc) videoUrls.unshift(videoSrc);

  return videoUrls[0] || null;
}

// Transcribir con faster-whisper (16 threads, int8, modelo tiny)
async function transcribeAudio(audioFile) {
  log(`  🎙️  Transcribiendo con faster-whisper...`);
  const txtFile = audioFile.replace(/\.[^.]+$/, '') + '.txt';
  const helperScript = path.join(__dirname, 'transcribe_helper.py');

  try {
    await execAsync(`python "${helperScript}" "${audioFile}" "${txtFile}"`, { timeout: 300000 });
    if (fs.existsSync(txtFile)) return fs.readFileSync(txtFile, 'utf8');
  } catch (err) {
    log(`  ⚠️  faster-whisper error: ${err.message.substring(0, 120)}`);
  }
  return null;
}

// Estructurar con Claude
async function structureWithClaude(lessonTitle, transcript) {
  log(`  🤖 Estructurando con Claude...`);
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Sos el asistente de José Anselmi. Transcribiste esta clase del curso "Sistema de Ingresos Diarios" de Luis Mena.

Clase: "${lessonTitle}"

Transcripción en bruto:
---
${transcript.substring(0, 5000)}
---

Estructurá el contenido en Markdown limpio:
- Secciones con ###
- Conceptos clave en **negrita**
- Listas con guiones
- Fórmulas en bloques de código
- Reorganizá si viene desordenado (es oral)
- Conservá TODOS los datos específicos: números, ejemplos, nombres de herramientas

Devolvé SOLO el markdown.`
    }]
  });
  return msg.content[0].text;
}

// Guardar en memoria agrupando por módulo
function saveToMemory(lessonNum, lessonTitle, content) {
  if (!fs.existsSync(MEMORY_FILE)) {
    log(`⚠️  Memoria no encontrada`);
    return;
  }

  // Guardar como archivo individual primero
  const file = path.join(OUT_DIR, `leccion-${String(lessonNum).padStart(3,'0')}.md`);
  fs.writeFileSync(file, `# ${lessonTitle}\n\n${content}`, 'utf8');
  log(`  💾 Guardado en ${path.basename(file)}`);
}

async function main() {
  [OUT_DIR, AUDIO_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  log('🚀 Transcriptor de Curso — Sistema de Ingresos Diarios');
  log('');

  // Cargar lecciones ya scrapeadas
  if (!fs.existsSync(LESSONS_FILE)) {
    log('❌ No encontré lessons.json — corré primero hotmart-scraper.mjs');
    process.exit(1);
  }

  const allLessons = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'));
  const progress = loadProgress();
  const pending = allLessons.filter(l => !progress.completed.includes(l.href));

  log(`📋 Total lecciones: ${allLessons.length}`);
  log(`✅ Ya procesadas: ${progress.completed.length}`);
  log(`⏳ Pendientes: ${pending.length}`);

  if (pending.length === 0) {
    log('🎉 Todo procesado!');
    return;
  }

  // Iniciar browser
  log('\n🌐 Abriendo navegador (con sesión guardada)...');
  let browser = await puppeteer.launch({
    headless: false,
    userDataDir: CHROME_PROFILE,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  let page = await browser.newPage();

  // Verificar si ya está logueado
  await page.goto('https://app.hotmart.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(3000);

  if (page.url().includes('/login') || page.url().includes('sso.hotmart')) {
    log('🔐 Sesión expirada — loguéate en el navegador que se abrió...');
    try {
      await page.waitForFunction(
        () => window.location.href.includes('app.hotmart.com') && !window.location.href.includes('/login'),
        { timeout: 180000, polling: 2000 }
      );
    } catch { log('⚠️  Timeout login'); }
    await wait(2000);
  } else {
    log('✅ Sesión activa — sin necesidad de login');
  }

  // CDP session en la página principal — persiste para todas las lecciones
  // Captura requests de la página Y de todos sus iframes (incluyendo el embed de Hotmart)
  const allCapturedUrls = [];
  let cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent', ({ request }) => {
    const u = request.url;
    if (u.match(/\.(m3u8|mp4|ts)(\?|$)/i) || u.includes('vod-akm') || u.includes('cloudfront')) {
      allCapturedUrls.push({ url: u, ts: Date.now() });
    }
  });

  // Procesar cada lección
  for (let i = 0; i < pending.length; i++) {
    const lesson = pending[i];
    const lessonNum = allLessons.findIndex(l => l.href === lesson.href) + 1;
    const title = lesson.text.replace(/^\d+:\d+/, '').trim(); // quitar duración del título

    log(`\n[${i + 1}/${pending.length}] Lección ${lessonNum}: ${title}`);

    const audioFile = path.join(AUDIO_DIR, `leccion-${String(lessonNum).padStart(3,'0')}.mp3`);
    const txtFile = audioFile.replace('.mp3', '.txt');

    // Si ya tiene transcripción guardada, usar esa
    if (fs.existsSync(txtFile)) {
      log(`  ♻️  Transcripción ya existe, reutilizando...`);
      const transcript = fs.readFileSync(txtFile, 'utf8');
      const structured = await structureWithClaude(title, transcript);
      saveToMemory(lessonNum, title, structured);
      saveProgress(lesson.href);
      continue;
    }

    try {
      const lessonStart = Date.now();

      // Navegar a la lección — el embed iframe carga dentro de esta página
      await page.goto(lesson.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await wait(4000);

      // Mostrar embed URL si existe (informativo)
      const embedSrc = await page.evaluate(() => {
        for (const f of document.querySelectorAll('iframe')) {
          if (f.src && f.src.includes('cf-embed')) return f.src.substring(0, 70);
        }
        return null;
      }).catch(() => null);
      if (embedSrc) log(`  🔍 Embed: ${embedSrc}`);

      // Click en play — probar iframe embed primero, luego página directa
      try {
        const frames = page.frames();
        for (const frame of frames) {
          try {
            const fu = frame.url();
            if (fu.includes('cf-embed') || fu.includes('vimeo') || fu.includes('player')) {
              try { await frame.click('video'); } catch {}
              try { await frame.click('[class*="play"], .player-btn-play'); } catch {}
            }
          } catch {}
        }
      } catch {}
      try { await page.click('video, [class*="play"]'); } catch {}

      await wait(10000); // esperar que el HLS stream arranque

      // Filtrar URLs capturadas durante esta lección
      const lessonUrls = allCapturedUrls
        .filter(e => e.ts >= lessonStart)
        .map(e => e.url);

      const streamUrl = lessonUrls.find(u => u.includes('.m3u8')) ||
                        lessonUrls.find(u => u.includes('.mp4')) ||
                        lessonUrls[0] || null;

      log(`  🎬 Stream URLs: ${lessonUrls.length} — ${streamUrl ? streamUrl.substring(0, 90) : 'ninguna'}`);

      if (!streamUrl) {
        log(`  ❌ No se detectó stream de video — saltando`);
        // No marcar como completado, para poder reintentar
        continue;
      }

      // Descargar audio — la URL m3u8 ya tiene token hdnts, no necesita cookies
      log(`  ⬇️  Descargando audio...`);
      let downloaded = false;

      // Intento 1: yt-dlp sobre la URL del stream (soporta HLS m3u8)
      try {
        execSync(
          `yt-dlp --extract-audio --audio-format mp3 --audio-quality 5 ` +
          `--add-header "Referer: https://hotmart.com/" ` +
          `-o "${audioFile}" "${streamUrl}"`,
          { timeout: 300000, stdio: 'pipe' }
        );
        if (fs.existsSync(audioFile) && fs.statSync(audioFile).size > 1000) downloaded = true;
      } catch {}

      // Intento 2: ffmpeg directamente sobre el stream (sin cookies, el token está en la URL)
      if (!downloaded) {
        try {
          execSync(
            `ffmpeg -y -i "${streamUrl}" -vn -acodec libmp3lame -ab 64k -ar 16000 "${audioFile}"`,
            { timeout: 300000, stdio: 'pipe' }
          );
          if (fs.existsSync(audioFile) && fs.statSync(audioFile).size > 1000) downloaded = true;
        } catch (ffErr) {
          log(`  ❌ ffmpeg error: ${ffErr.message.substring(0, 120)}`);
        }
      }

      if (!downloaded) {
        log(`  ❌ No se pudo descargar el audio`);
        continue;
      }
      log(`  ✅ Audio descargado (${Math.round(fs.statSync(audioFile).size / 1024)}KB)`);

      // PIPELINE: lanzar transcripción async — mientras Whisper corre, el loop
      // ya navegará a la próxima lección (browser + descarga se solapan con CPU de Whisper)
      const transcriptPromise = transcribeAudio(audioFile);

      // Almacenar la promesa para que el PRÓXIMO ciclo pueda esperarla si hace falta
      // (se resuelve antes de structureWithClaude, que necesita el texto)
      const transcript = await transcriptPromise;

      if (!transcript) {
        log(`  ❌ faster-whisper no generó transcripción`);
        continue;
      }

      fs.writeFileSync(txtFile, transcript, 'utf8');
      log(`  📝 ${transcript.substring(0, 100).replace(/\n/g, ' ')}...`);

      const structured = await structureWithClaude(title, transcript);
      saveToMemory(lessonNum, title, structured);
      saveProgress(lesson.href);

      try { fs.unlinkSync(audioFile); } catch {}

    } catch (err) {
      log(`  ❌ Error en lección ${lessonNum}: ${err.message.substring(0, 100)}`);

      // Si el frame se desconectó, reiniciar el browser para las siguientes lecciones
      if (err.message.includes('detached') || err.message.includes('closed') || err.message.includes('Target closed')) {
        log('  🔄 Reiniciando browser...');
        try { await browser.close(); } catch {}
        // Limpiar lock files para evitar que Chrome quede colgado
        try { fs.unlinkSync(path.join(CHROME_PROFILE, 'SingletonLock')); } catch {}
        try { fs.unlinkSync(path.join(CHROME_PROFILE, 'SingletonSocket')); } catch {}
        await wait(4000);
        browser = await puppeteer.launch({
          headless: false,
          userDataDir: CHROME_PROFILE,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          defaultViewport: { width: 1280, height: 800 }
        });
        page = await browser.newPage();
        // Recrear CDP session
        cdp = await page.createCDPSession();
        await cdp.send('Network.enable');
        cdp.on('Network.requestWillBeSent', ({ request }) => {
          const u = request.url;
          if (u.match(/\.(m3u8|mp4|ts)(\?|$)/i) || u.includes('vod-akm') || u.includes('cloudfront')) {
            allCapturedUrls.push({ url: u, ts: Date.now() });
          }
        });
        log('  ✅ Browser reiniciado');
      }
    }
  }

  // Compilar todo en la memoria
  log('\n📚 Compilando lecciones en módulos de memoria...');
  compileToMemory();

  log('\n🎉 ¡Transcripción completada!');
  await browser.close();
}

function compileToMemory() {
  // Agrupar lecciones por módulo y actualizar la memoria
  const moduleMap = {
    1: { title: 'Fundamentos', range: [1, 5] },
    2: { title: 'Micro Ofertas', range: [6, 8] },
    4: { title: 'Ofertas de Alto Impacto', range: [9, 15] },
    5: { title: 'Crea tu Producto Digital', range: [16, 25] },
    6: { title: 'Copy Express', range: [26, 32] },
    7: { title: 'Página de Ventas', range: [33, 42] },
    8: { title: 'Anuncios', range: [43, 53] },
    9: { title: 'Tráfico', range: [54, 65] },
    10: { title: 'Optimización y Escalamiento', range: [66, 68] },
    11: { title: 'Aceleradores de Ganancias', range: [69, 78] },
    12: { title: 'Master en VSL', range: [79, 107] },
    13: { title: 'Edición de VSL', range: [108, 118] },
    14: { title: 'Masterclass', range: [119, 119] },
    15: { title: 'Reuniones Semanales', range: [120, 133] },
  };

  for (const [modNum, mod] of Object.entries(moduleMap)) {
    const [start, end] = mod.range;
    const lessonFiles = [];
    for (let i = start; i <= end; i++) {
      const f = path.join(OUT_DIR, `leccion-${String(i).padStart(3,'0')}.md`);
      if (fs.existsSync(f)) lessonFiles.push(fs.readFileSync(f, 'utf8'));
    }
    if (lessonFiles.length === 0) continue;

    const content = lessonFiles.join('\n\n---\n\n');
    if (!fs.existsSync(MEMORY_FILE)) continue;

    let memory = fs.readFileSync(MEMORY_FILE, 'utf8');
    memory = memory.replace(new RegExp(`- Módulo ${modNum}:[^\n]*\n`), '');
    const newBlock = `\n---\n\n## MÓDULO ${modNum} — ${mod.title}\n\n${content}\n`;
    const marker = '## MÓDULOS';
    if (memory.includes(marker)) {
      memory = memory.replace(marker, newBlock + '\n' + marker);
    } else {
      memory += newBlock;
    }
    fs.writeFileSync(MEMORY_FILE, memory, 'utf8');
    log(`  ✅ Módulo ${modNum} — ${mod.title} compilado (${lessonFiles.length} lecciones)`);
  }
}

main().catch(console.error);
