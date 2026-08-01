import puppeteer from 'puppeteer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '../leadr/app/.env.local' });

// Este script vive en scripts/datos/; el perfil de Chrome y las transcripciones
// estan en la raiz de ads-agent.
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MEMORY_FILE = 'C:\\Users\\Jose Anselmi\\.claude\\projects\\c--Users-Jose-Anselmi-OneDrive-Escritorio-Periodistas-Digitales\\memory\\curso_sistema_ingresos_diarios.md';
const CHROME_PROFILE = path.join(RAIZ, 'hotmart-chrome-profile'); // sesión persistente
const OUT_DIR = path.join(RAIZ, '..', '_material', 'luis-mena');

// Credenciales por entorno, NUNCA en el código: este repo es público (lo dice
// sistema-ingresos/api/_lib/sync-estados.js, que baja archivos por raw sin token).
// Van en ads-agent/.env.local, que está gitignoreado.
const HOTMART_EMAIL = process.env.HOTMART_EMAIL;
const HOTMART_PASSWORD = process.env.HOTMART_PASSWORD;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function log(msg) { console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  log(`📸 ${name}.png`);
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function structureWithClaude(moduloNum, titulo, rawText) {
  log(`  🤖 Estructurando módulo ${moduloNum} con Claude...`);
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Sos el asistente de José Anselmi que documenta el curso "Sistema de Ingresos Diarios" de Luis Mena.

Módulo: ${moduloNum} — "${titulo}"

Texto extraído de la lección:
---
${rawText.substring(0, 6000)}
---

Estructurá este contenido en Markdown limpio. Usá el mismo estilo que los módulos anteriores del curso:
- Secciones con ###
- Conceptos clave en **negrita**
- Listas con guiones
- Fórmulas o frameworks en bloques de código
- Reorganizá el texto si viene desordenado (es transcripción oral)
- No inventes información — solo estructurá lo que está

Devolvé SOLO el markdown, sin texto adicional.`
    }]
  });
  return msg.content[0].text;
}

async function appendToMemory(moduloNum, titulo, content) {
  if (!fs.existsSync(MEMORY_FILE)) {
    log(`⚠️  Memoria no encontrada: ${MEMORY_FILE}`);
    return;
  }
  let memory = fs.readFileSync(MEMORY_FILE, 'utf8');

  // Remover la línea pendiente de este módulo
  memory = memory.replace(new RegExp(`- Módulo ${moduloNum}:[^\n]*\n`), '');

  const newBlock = `\n---\n\n## MÓDULO ${moduloNum} — ${titulo}\n\n${content}\n`;
  const pendingMarker = '## MÓDULOS';

  if (memory.includes(pendingMarker)) {
    memory = memory.replace(pendingMarker, newBlock + '\n' + pendingMarker);
  } else {
    memory += newBlock;
  }

  fs.writeFileSync(MEMORY_FILE, memory, 'utf8');
  log(`  💾 Módulo ${moduloNum} guardado en memoria`);
}

async function extractPageContent(page) {
  // Intentar click en botón de subtítulos del player
  try {
    await page.click('[aria-label*="subtitle" i], [aria-label*="caption" i], [title*="subtitle" i], [class*="subtitle-btn"], [class*="caption"]');
    await wait(1500);
  } catch {}

  // Intentar acceder a los tracks de subtítulos via JS
  const subtitles = await page.evaluate(async () => {
    const tracks = [];
    // Buscar elementos <track> dentro del video
    document.querySelectorAll('video track, track').forEach(t => {
      tracks.push({ kind: t.kind, src: t.src, lang: t.srclang });
    });

    // Buscar texto de captions ya renderizados
    const captionEls = document.querySelectorAll('[class*="caption"], [class*="subtitle"], [class*="cue"], .vjs-text-track-cue, [class*="transcript"]');
    const captionTexts = [];
    captionEls.forEach(el => {
      const t = el.textContent?.trim();
      if (t && t.length > 5) captionTexts.push(t);
    });

    return { tracks, captionTexts };
  });

  // Si hay URL de subtítulos, intentar descargarlos
  let subtitleContent = '';
  if (subtitles.tracks.length > 0) {
    for (const track of subtitles.tracks) {
      if (track.src) {
        try {
          const resp = await page.evaluate(async (url) => {
            const r = await fetch(url);
            return r.ok ? r.text() : null;
          }, track.src);
          if (resp) subtitleContent += resp + '\n';
        } catch {}
      }
    }
  }

  return await page.evaluate((subtitleContent, captionTexts) => {
    const titleEl = document.querySelector('h1, h2, [class*="title"], [class*="lesson-name"]');
    const title = titleEl?.textContent?.trim() || '';

    // Info de la clase (descripción si la hay)
    const infoEl = document.querySelector('[class*="info"], [class*="description"], [class*="material"]');
    const info = infoEl?.innerText?.trim() || '';

    // Texto del sidebar — lista de módulos (útil para contexto)
    const sidebarEl = document.querySelector('[class*="sidebar"], [class*="playlist"], aside');
    const sidebarText = sidebarEl?.innerText?.trim()?.substring(0, 1000) || '';

    const bodyText = [
      subtitleContent ? `SUBTÍTULOS:\n${subtitleContent}` : '',
      captionTexts.length > 0 ? `CAPTIONS:\n${captionTexts.join('\n')}` : '',
      info ? `DESCRIPCIÓN:\n${info}` : '',
      `CONTEXTO SIDEBAR:\n${sidebarText}`
    ].filter(Boolean).join('\n\n');

    return { title, bodyText };
  }, subtitleContent, subtitles.captionTexts);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  log('🚀 Iniciando Hotmart Scraper');
  log(`📁 Outputs en: ${OUT_DIR}`);

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: CHROME_PROFILE, // guarda cookies/sesión entre ejecuciones
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  try {
    // ── LOGIN MANUAL ──
    log('🔐 Abriendo Hotmart...');
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('👉 ACCIÓN REQUERIDA:');
    log('   1. Hotmart tiene CAPTCHA — loguéate VOS en el navegador');
    log('   2. Una vez dentro de app.hotmart.com, volvé acá');
    log('   3. Presioná ENTER para continuar');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('');

    await page.goto('https://app.hotmart.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await shot(page, '01-login-page');

    // Esperar que el usuario haga login manualmente
    // El script espera hasta que la URL cambie a app.hotmart.com (sin /login)
    log('⏳ Esperando que completes el login (máx 3 minutos)...');
    try {
      await page.waitForFunction(
        () => window.location.href.includes('app.hotmart.com') && !window.location.href.includes('/login') && !window.location.href.includes('sso.hotmart'),
        { timeout: 180000, polling: 2000 }
      );
    } catch {
      log('⚠️  Tiempo agotado esperando login. Continuando igual...');
    }

    await wait(3000);
    await shot(page, '03-after-login');
    log(`✅ Login detectado. URL actual: ${page.url()}`);

    // ── NAVEGAR DIRECTO AL CURSO DE LUIS MENA ──
    const COURSE_URL = 'https://hotmart.com/es/club/luismena/products/4332046';
    log(`📚 Navegando al curso: ${COURSE_URL}`);
    await page.goto(COURSE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await wait(5000);
    await shot(page, '04-course-home');
    log(`📍 URL actual: ${page.url()}`);

    // Ya estamos en el curso — extraer lecciones del sidebar
    // ── EXPANDIR TODOS LOS MÓDULOS Y RECOLECTAR LECCIONES ──
    log('📂 Expandiendo módulos del sidebar para obtener todas las lecciones...');

    // Hacer click en cada módulo colapsado para expandirlo
    let expandAttempts = 0;
    while (expandAttempts < 20) {
      const collapsed = await page.evaluate(() => {
        // Buscar módulos colapsados (tienen un chevron/arrow que indica que se pueden expandir)
        const candidates = document.querySelectorAll('[class*="module"], [class*="section"], [class*="chapter"], li > div, li > button');
        let clicked = 0;
        candidates.forEach(el => {
          const text = el.textContent?.trim();
          // Si el elemento tiene texto de módulo y no tiene lecciones visibles debajo
          const hasChildren = el.querySelector('a[href*="/content/"]');
          if (!hasChildren && text && text.length > 3 && text.length < 100) {
            el.click();
            clicked++;
          }
        });
        return clicked;
      });
      if (collapsed === 0) break;
      await wait(1500);
      expandAttempts++;
    }

    // También intentar hacer click en los números/títulos de módulos del sidebar derecho
    await page.evaluate(() => {
      // Los módulos en Hotmart club aparecen como li con número y título
      document.querySelectorAll('li, [role="button"], [class*="accordion"], [class*="collapse"]').forEach(el => {
        if (!el.querySelector('a[href*="/content/"]')) {
          try { el.click(); } catch(e) {}
        }
      });
    });
    await wait(3000);
    await shot(page, '04b-modules-expanded');

    // Ahora extraer TODOS los links de contenido
    const allLessons = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('a[href*="/content/"]').forEach(a => {
        const href = a.href.split('?')[0]; // quitar query params
        const parent = a.closest('li') || a.closest('[class*="lesson"]') || a.parentElement;
        const text = (parent?.textContent || a.textContent || '').trim().replace(/\s+/g, ' ');
        if (href && !items.find(i => i.href === href)) {
          items.push({ text: text.substring(0, 120), href });
        }
      });
      return items;
    });

    log(`📋 Lecciones totales detectadas: ${allLessons.length}`);
    fs.writeFileSync(path.join(OUT_DIR, 'lessons.json'), JSON.stringify(allLessons, null, 2));
    log('📄 Lista completa de lecciones guardada en lessons.json');

    const toProcess = allLessons.filter(l => l.href);

    if (toProcess.length === 0) {
      log('⚠️  No encontré links. Guardando screenshot para debug...');
      await shot(page, 'debug-no-lessons');
      log('Revisá _material/luis-mena/debug-no-lessons.png');
    } else {
      // Modo automático
      log(`\n🤖 Procesando ${toProcess.length} lecciones automáticamente...\n`);

      for (let i = 0; i < toProcess.length; i++) {
        const lesson = toProcess[i];
        log(`\n[${i + 1}/${toProcess.length}] ${lesson.text.substring(0, 60)}`);

        try {
          await page.goto(lesson.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await wait(5000); // Esperar que cargue el video player y captions

          await shot(page, `lesson-${String(i + 1).padStart(2, '0')}`);

          const content = await extractPageContent(page);
          const titulo = content.title || lesson.text;

          // Guardar raw
          const rawFile = path.join(OUT_DIR, `modulo-raw-${String(i + 1).padStart(2, '0')}.txt`);
          fs.writeFileSync(rawFile, `URL: ${lesson.href}\nTÍTULO: ${titulo}\n\n${content.bodyText}`, 'utf8');

          // Solo estructurar con Claude si hay contenido sustancial
          if (content.bodyText.length > 200) {
            const moduloNum = i + 8; // Asumiendo que empezamos desde el módulo 8
            const structured = await structureWithClaude(moduloNum, titulo, content.bodyText);

            const mdFile = path.join(OUT_DIR, `modulo-${moduloNum}.md`);
            fs.writeFileSync(mdFile, structured, 'utf8');

            await appendToMemory(moduloNum, titulo, structured);
            log(`  ✅ Módulo ${moduloNum} — ${titulo.substring(0, 40)} → OK`);
          } else {
            log(`  ⚠️  Poco contenido en esta lección (${content.bodyText.length} chars) — probablemente solo video`);
          }

          await wait(2000);
        } catch (err) {
          log(`  ❌ Error en lección ${i + 1}: ${err.message}`);
          await shot(page, `error-lesson-${i + 1}`);
        }
      }

      log('\n🎉 Proceso completado!');
      log(`📁 Archivos en: ${OUT_DIR}`);
    }

  } catch (err) {
    log(`❌ Error fatal: ${err.message}`);
    await shot(page, 'fatal-error').catch(() => {});
    console.error(err);
  } finally {
    log('🏁 Fin del script. Cerrando navegador...');
    await wait(3000);
    await browser.close();
  }
}

main().catch(console.error);
