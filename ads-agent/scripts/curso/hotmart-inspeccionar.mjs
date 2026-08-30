/**
 * Inspector del editor de Hotmart — NO sube nada, NO toca nada, solo mira.
 *
 * Por qué existe: para subir las portadas de las clases con un script hay que
 * saber cómo es el editor de Hotmart por dentro (qué input recibe el archivo,
 * qué botón guarda, si está dentro de un iframe). Nada de eso está escrito en
 * ningún lado, y adivinarlo es la peor opción posible: un selector inventado no
 * tira error — el script corre, dice "listo" y no sube nada.
 *
 * Cómo funciona: abre Chrome con el perfil persistente (la sesión de Hotmart
 * queda guardada entre corridas) y captura SOLO, sin pedirte nada. Vos navegás
 * por el navegador y él fotografía cada pantalla nueva que aparece. Cuando
 * terminaste, cerrás Chrome y el script se cierra con él.
 *
 *   cd ads-agent && node scripts/curso/hotmart-inspeccionar.mjs
 *
 * No lee del teclado a propósito: así puede correr en segundo plano mientras la
 * única persona que puede navegar (y pasar el CAPTCHA) usa el navegador.
 *
 * Deja todo en _material/hotmart-editor/ (gitignoreado): captura, HTML y un JSON
 * por pantalla.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Este script vive en scripts/curso/; el perfil de Chrome está en la raíz de
// ads-agent y las salidas van fuera del repo. Igual que hotmart-scraper.mjs.
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME_PROFILE = path.join(RAIZ, 'hotmart-chrome-profile');
const OUT_DIR = path.join(RAIZ, '..', '_material', 'hotmart-editor');

const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);

/**
 * Lo que se busca en cada pantalla. Se corre igual en la página principal y
 * dentro de cada iframe: el editor de Hotmart bien puede estar embebido, y si
 * lo está, los inputs no aparecen en el document de arriba.
 */
function recolectar() {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  // Un selector corto y estable para poder reusarlo después en el script que sube.
  const selector = (el) => {
    if (el.id) return `#${el.id}`;
    if (el.name) return `${el.tagName.toLowerCase()}[name="${el.name}"]`;
    const cls = (el.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return cls.length ? `${el.tagName.toLowerCase()}.${cls.join('.')}` : el.tagName.toLowerCase();
  };

  const inputsArchivo = [...document.querySelectorAll('input[type="file"]')].map((el) => ({
    selector: selector(el),
    accept: el.accept || null,
    multiple: el.multiple,
    // Casi siempre están ocultos detrás de un botón lindo. No es un problema:
    // uploadFile() no necesita que se vean. Pero conviene saberlo.
    visible: visible(el),
  }));

  const botones = [...document.querySelectorAll('button, [role="button"], a.btn, input[type="submit"]')]
    .filter(visible)
    .map((el) => ({ texto: (el.innerText || el.value || '').trim().slice(0, 60), selector: selector(el) }))
    .filter((b) => b.texto);

  const imagenes = [...document.querySelectorAll('img')]
    .filter((el) => visible(el) && el.naturalWidth > 80)
    .map((el) => ({ src: (el.src || '').slice(0, 160), alto: el.naturalHeight, ancho: el.naturalWidth, selector: selector(el) }));

  const campos = [...document.querySelectorAll('input:not([type="file"]), textarea, select')]
    .filter(visible)
    .map((el) => ({ tipo: el.type || el.tagName.toLowerCase(), selector: selector(el), placeholder: el.placeholder || null }));

  return { inputsArchivo, botones, imagenes, campos };
}

async function capturar(page, n) {
  const base = String(n).padStart(2, '0');
  const url = page.url();

  await page.screenshot({ path: path.join(OUT_DIR, `${base}-pantalla.png`), fullPage: true });
  fs.writeFileSync(path.join(OUT_DIR, `${base}-pagina.html`), await page.content(), 'utf8');

  const principal = await page.evaluate(recolectar);

  // Los iframes se recorren aparte: si el editor vive adentro de uno, todo lo
  // interesante está ahí y el document de arriba se ve vacío.
  const marcos = [];
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    try {
      const datos = await frame.evaluate(recolectar);
      if (datos.inputsArchivo.length || datos.botones.length) {
        marcos.push({ url: frame.url().slice(0, 160), ...datos });
      }
    } catch {
      // Un iframe de otro dominio no se deja leer. Se anota y se sigue.
      marcos.push({ url: frame.url().slice(0, 160), inaccesible: true });
    }
  }

  const informe = { n, url, principal, marcos };
  fs.writeFileSync(path.join(OUT_DIR, `${base}-hallazgos.json`), JSON.stringify(informe, null, 2), 'utf8');

  log(`📸 Pantalla ${base} — ${url}`);
  log(`   inputs de archivo: ${principal.inputsArchivo.length}` + (marcos.length ? ` (+ ${marcos.length} iframes con contenido)` : ''));
  for (const i of principal.inputsArchivo) log(`     · ${i.selector}  accept=${i.accept}  visible=${i.visible}`);
  for (const m of marcos) {
    if (m.inaccesible) { log(`     · iframe ajeno, no se puede leer: ${m.url}`); continue; }
    log(`     · iframe ${m.url}`);
    for (const i of m.inputsArchivo) log(`         ${i.selector}  accept=${i.accept}`);
  }
  const subir = principal.botones.filter((b) => /subir|cargar|upload|imagen|portada|thumbnail|guardar|salvar/i.test(b.texto));
  if (subir.length) {
    log('   botones que suenan a lo que buscamos:');
    for (const b of subir) log(`     · "${b.texto}"  →  ${b.selector}`);
  }
  log(`   guardado: ${base}-pantalla.png · ${base}-pagina.html · ${base}-hallazgos.json`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  log('🔎 Inspector del editor de Hotmart — no sube ni modifica nada');
  log(`📁 Salidas en: ${OUT_DIR}`);

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: CHROME_PROFILE, // la sesión sobrevive entre corridas
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: null,
  });

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.goto('https://app.hotmart.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' NAVEGÁ VOS. Yo fotografío solo cada pantalla nueva.');
  console.log('   1. Si pide login, entrá (Hotmart tiene CAPTCHA: va a mano).');
  console.log('   2. Andá a tu curso → editar una CLASE → hasta donde se');
  console.log('      carga la imagen de portada.');
  console.log('   3. Si se abre un diálogo para subir la imagen, dejalo abierto');
  console.log('      unos segundos: eso también se captura.');
  console.log('');
  console.log(' Cuando termines, CERRÁ CHROME y el script termina solo.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // La pestaña que hay que mirar es la que Jose está usando, no la que abrí yo.
  // Si se cierra esa o se abre otra, hay que seguirla: mirar siempre la misma
  // referencia es quedarse fotografiando una ventana que ya no existe — y el
  // error de una pestaña muerta es de los que no se ven.
  const pestanaActiva = async () => {
    const paginas = (await browser.pages()).filter((p) => !p.isClosed());
    const utiles = paginas.filter((p) => /^https?:/.test(p.url()));
    return utiles[utiles.length - 1] || paginas[paginas.length - 1] || null;
  };

  // Se captura cuando la pantalla cambió de verdad, no cada vuelta del reloj:
  // la huella junta la URL con cuántos inputs de archivo y botones hay. Así un
  // diálogo que se abre sobre la misma URL también cuenta como pantalla nueva.
  const huellaDe = async (p) => {
    const c = await p.evaluate(() => ({
      f: document.querySelectorAll('input[type="file"]').length,
      b: document.querySelectorAll('button, [role="button"]').length,
      d: document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]').length,
    }));
    return `${p.url()}|${c.f}|${c.b}|${c.d}`;
  };

  let n = 0;
  let ultima = '';
  let vueltas = 0;
  const LIMITE_MIN = 30;
  const hasta = Date.now() + LIMITE_MIN * 60 * 1000;

  while (Date.now() < hasta && browser.isConnected()) {
    try {
      const activa = await pestanaActiva();
      if (!activa) {
        log('⏳ No hay ninguna pestaña abierta todavía…');
      } else {
        const huella = await huellaDe(activa);
        if (huella !== ultima) {
          ultima = huella;
          // Un respiro para que termine de pintar lo que se acaba de abrir.
          await new Promise((r) => setTimeout(r, 1200));
          await capturar(activa, ++n);
        } else if (vueltas % 12 === 0) {
          // Latido cada ~30 s: si esto no aparece, el bucle está muerto y hay
          // que enterarse mirando el log, no adivinando.
          log(`👀 mirando: ${activa.url().slice(0, 90)}  (${n} capturadas)`);
        }
      }
    } catch (err) {
      // Navegar mientras se mide rompe la evaluación: se reintenta. Pero se
      // avisa igual cada tanto — un error mudo repetido es lo que nos dejó
      // treinta minutos capturando nada.
      if (vueltas % 12 === 0) log(`⚠️  ${err.message.slice(0, 120)}`);
    }
    vueltas++;
    await new Promise((r) => setTimeout(r, 2500));
  }

  if (browser.isConnected()) await browser.close().catch(() => {});
  log(`🏁 Listo. ${n} pantalla(s) en ${OUT_DIR}`);
  log('   Pasame esa carpeta y escribo el script que sube.');
}

main().catch((e) => { console.error(e); process.exit(1); });
