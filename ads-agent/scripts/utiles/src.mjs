/**
 * src.mjs — genera y revisa los códigos de atribución (`src`) según el estándar.
 *
 * El estándar entero está en `sistema-ingresos/docs/NOMENCLATURA-SRC.md`. Este script existe
 * para que nadie lo escriba a mano: dos personas tipeando producen `Email-Manifiesto` y
 * `em-manifiesto` para la misma cosa, y eso ya pasó — hoy conviven las dos formas en la base.
 *
 * ⭐ LA PIEZA SE IDENTIFICA POR EL NOMBRE DEL ARCHIVO (decidido con Jose el 19/08/2026).
 * Una imagen bien nombrada ya contiene su `src`: no hay que inventarlo dos veces ni acordarse
 * dentro de seis meses de qué era "la historia del 19/08". Por eso existe `--archivo`.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/utiles/src.mjs --archivo contenido/.../ig-carr-primerprecio-01.jpg
 *   node scripts/utiles/src.mjs --archivo <ruta> --pagado      (el mismo creativo, promocionado)
 *   node scripts/utiles/src.mjs --archivo <ruta> --comentario  (el link que va en el comentario)
 *   node scripts/utiles/src.mjs em comunidad 03                (a mano, cuando no hay archivo)
 *   node scripts/utiles/src.mjs --revisar em-Comunidad_3
 *   node scripts/utiles/src.mjs --canales                      (la chuleta entera)
 */

import { pathToFileURL } from 'node:url';
import { basename, extname, sep } from 'node:path';

const CANALES = {
  ad:   'Meta pago (anuncios y publicaciones promocionadas)',
  og:   'orgánico — publicado sin pagar',
  em:   'email',
  wa:   'WhatsApp (no manda nada automático; queda por el histórico y el asistente)',
  pdf:  'link dentro de una guía en PDF',
  dir:  'directo — entró sin ningún origen',
  test: 'pruebas nuestras — NO es tráfico real, sirve para poder filtrarlo',
};

// Dónde se publica. Sólo aplica al canal `og` (y a `ad` cuando es un boost de algo orgánico).
const PLATAFORMAS = {
  ig: 'Instagram',
  fb: 'Facebook',
  tt: 'TikTok',
  yt: 'YouTube',
};

// Qué forma tiene la pieza. Es el nivel que contesta "¿de qué me estás hablando?".
const FORMATOS = {
  hist:  'historia (24 h)',
  post:  'publicación de una sola imagen',
  carr:  'carrusel',
  reel:  'reel / short (video vertical)',
  video: 'video largo',
  clase: 'clase publicada en YouTube',
  bio:   'el link de la biografía del perfil',
  grupo: 'mensaje en un grupo o comunidad',
};

// Sufijos: la MISMA pieza, pero la persona llegó por otro lado. Van siempre al final.
const SUFIJOS = {
  com: 'el link del COMENTARIO de esa pieza (no la pieza en sí)',
  fij: 'el comentario FIJADO',
};

// Los límites son de Hotmart, verificados en su central de ayuda el 19/08/2026.
// No son elecciones nuestras: si se rompen, Hotmart no avisa, sólo guarda mal.
const TOPE = 30;
const PROHIBIDO = /_/;            // el guion bajo está reservado para uso interno de Hotmart
const VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const BOTONES = ['dolor', 'bonos', 'precio', 'cierre', 'pie', 'sticky'];
const LANDING = 'https://sistemadeingresosdiariosia.com/';
const CHECKOUT = 'https://pay.hotmart.com/P106404871J?checkoutMode=10';

function revisar(codigo) {
  const problemas = [];
  if (!codigo) return ['está vacío'];
  if (codigo.length > TOPE) problemas.push(`${codigo.length} caracteres: Hotmart permite ${TOPE}`);
  if (PROHIBIDO.test(codigo)) problemas.push('tiene guion bajo (_): Hotmart lo reserva para uso interno');
  if (codigo !== codigo.toLowerCase()) problemas.push('tiene mayúsculas: los reportes los ordenan como si fueran otra cosa');
  if (!VALIDO.test(codigo.toLowerCase())) problemas.push('sólo se permiten letras, números y el guion que separa niveles');
  const [canal] = codigo.toLowerCase().split('-');
  if (!CANALES[canal]) problemas.push(`el canal "${canal}" no existe. Son: ${Object.keys(CANALES).join(', ')}`);
  if (codigo.split('-').length < 2) problemas.push('le falta el nivel 2 (el origen): con el canal solo no se distingue nada');
  return problemas;
}

// ── Del nombre del archivo al `src` ──────────────────────────────────────────
//
// La convención de nombre es `<plataforma>-<formato>-<tema>[-<n>].<ext>`, y de ahí sale el
// código solo. El número de slide se descarta a propósito: las 7 imágenes de un carrusel son
// UNA publicación, así que comparten un único `src` — si cada slide tuviera el suyo, el
// reporte diría que el carrusel vendió siete veces menos de lo que vendió.
//
// Si el archivo no sigue la convención, se intenta adivinar por la CARPETA (así funciona con
// lo que ya está guardado, como `muro-stories/2026-08-19.jpg`) y se avisa cómo renombrarlo.
function desdeArchivo(ruta) {
  const partes = ruta.split(/[\\/]/).filter(Boolean);
  const archivo = basename(ruta, extname(ruta));
  const carpetas = partes.slice(0, -1).map((p) => p.toLowerCase());
  const avisos = [];

  const trozos = archivo.toLowerCase().split('-').filter(Boolean);
  let plataforma = PLATAFORMAS[trozos[0]] ? trozos[0] : null;
  let formato = null;
  let tema = null;

  if (plataforma) {
    // El nombre ya sigue la convención: <plataforma>-<formato>-<tema>[-<n>]
    const resto = trozos.slice(1);
    if (FORMATOS[resto[0]]) {
      formato = resto[0];
      // el último trozo, si es sólo números, es el número de slide → se descarta
      const sinSlide = resto.slice(1).filter((t, i, a) => !(i === a.length - 1 && /^\d+$/.test(t) && a.length > 1));
      tema = sinSlide.filter((t) => !/^\d+$/.test(t) || sinSlide.length === 1).join('');
    } else {
      avisos.push(`"${resto[0] || '(nada)'}" no es un formato conocido. Son: ${Object.keys(FORMATOS).join(', ')}`);
    }
  }

  // ── Adivinar por la carpeta, para lo que ya está guardado con otro criterio ──
  if (!plataforma || !formato || !tema) {
    const ruta_ = carpetas.join('/');
    if (/muro-stories/.test(ruta_)) {
      plataforma ||= 'ig';
      formato ||= 'hist';
      // `2026-08-19.jpg` → la historia diaria del muro de ese día
      const f = archivo.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (f) tema ||= `muro${f[3]}${f[2]}`;
      avisos.push('nombre viejo: la historia diaria del muro. Se dedujo por la carpeta.');
    } else if (/carousels|carrusel/.test(ruta_)) {
      plataforma ||= 'ig';
      formato ||= 'carr';
      avisos.push('nombre viejo: es un slide de carrusel y NO dice de qué trata.');
    } else if (/organic/.test(ruta_)) {
      plataforma ||= 'ig';
      formato ||= 'post';
      avisos.push('nombre viejo: no dice plataforma ni tema.');
    }
  }

  return { plataforma, formato, tema, avisos, archivo };
}

function armar({ canal, plataforma, formato, tema, sufijo }) {
  return [canal, plataforma, formato, tema, sufijo].filter(Boolean).join('-');
}

function nombreSugerido({ plataforma, formato, tema }, ext) {
  return `${plataforma || 'ig'}-${formato || 'post'}-${tema || 'TEMA'}${ext}`;
}

function imprimirLinks(codigo) {
  console.log('Para pegar:\n');
  console.log(`  A la landing   ${LANDING}?src=${codigo}`);
  console.log(`  Al checkout    ${CHECKOUT}&src=${codigo}`);
  console.log(`  A /tu-medio    https://sistemadeingresosdiariosia.com/tu-medio?src=${codigo}`);
  console.log(`  A una guía     https://sistemadeingresosdiariosia.com/api/d?file=<archivo>.pdf&src=${codigo}\n`);
  console.log('Recordá: el `sck` lo pone el botón de la página, no el link de origen.');
  console.log(`Botones de la landing: ${BOTONES.join(' · ')}\n`);
}

// La validación la reusa `herramientas/verificar-repo.mjs` para revisar los `src`
// escritos en todo el repo. Se exporta para que el criterio tenga UN solo dueño:
// si se reimplementara allá, en tres meses dirían cosas distintas.
export { revisar, CANALES, PLATAFORMAS, FORMATOS, SUFIJOS, BOTONES, TOPE, desdeArchivo };

// De acá para abajo es la CLI. Sólo corre si se invoca el script directamente;
// al importarlo (verificar-repo) no debe imprimir ni llamar a process.exit().
const esCLI = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esCLI) main();

function main() {

const args = process.argv.slice(2);

if (args.includes('--canales')) {
  console.log('\nCanales (nivel 1 — siempre va):\n');
  for (const [c, q] of Object.entries(CANALES)) console.log(`  ${c.padEnd(6)} ${q}`);
  console.log('\nPlataformas (nivel 2 del orgánico):\n');
  for (const [c, q] of Object.entries(PLATAFORMAS)) console.log(`  ${c.padEnd(6)} ${q}`);
  console.log('\nFormatos (nivel 3 — de qué pieza hablamos):\n');
  for (const [c, q] of Object.entries(FORMATOS)) console.log(`  ${c.padEnd(6)} ${q}`);
  console.log('\nSufijos (van al final):\n');
  for (const [c, q] of Object.entries(SUFIJOS)) console.log(`  ${c.padEnd(6)} ${q}`);
  console.log(`\nBotones (sck, los pone la landing):\n  ${BOTONES.join(' · ')}\n`);
  process.exit(0);
}

const iRevisar = args.indexOf('--revisar');
if (iRevisar > -1) {
  const codigo = args[iRevisar + 1];
  const problemas = revisar(codigo);
  if (!problemas.length) {
    console.log(`\n✅ "${codigo}" cumple el estándar (${codigo.length}/${TOPE} caracteres).\n`);
    process.exit(0);
  }
  console.log(`\n🔴 "${codigo}" no cumple:`);
  for (const p of problemas) console.log(`   · ${p}`);
  console.log('');
  process.exit(1);
}

// ── El camino principal: del archivo al link ────────────────────────────────
const iArchivo = args.indexOf('--archivo');
if (iArchivo > -1) {
  const ruta = args[iArchivo + 1];
  if (!ruta) {
    console.log('\nFalta la ruta. Ej: --archivo contenido/carousels/ig-carr-primerprecio-01.jpg\n');
    process.exit(1);
  }
  const pagado = args.includes('--pagado');
  const comentario = args.includes('--comentario');
  const info = desdeArchivo(ruta);
  const ext = extname(ruta) || '.jpg';

  console.log(`\nArchivo: ${basename(ruta)}`);

  if (!info.plataforma || !info.formato || !info.tema) {
    console.log('\n🔴 El nombre no alcanza para armar el código.\n');
    for (const a of info.avisos) console.log(`   · ${a}`);
    console.log('\n   Renombralo así:  <plataforma>-<formato>-<tema>[-<n>]' + ext);
    console.log(`   Por ejemplo:     ${nombreSugerido(info, ext)}`);
    console.log(`\n   Plataformas: ${Object.keys(PLATAFORMAS).join(' · ')}`);
    console.log(`   Formatos:    ${Object.keys(FORMATOS).join(' · ')}\n`);
    process.exit(1);
  }

  for (const a of info.avisos) console.log(`   ⚠️  ${a}`);

  const codigo = armar({
    canal: pagado ? 'ad' : 'og',
    plataforma: info.plataforma,
    formato: info.formato,
    tema: info.tema,
    sufijo: comentario ? 'com' : null,
  });

  const problemas = revisar(codigo);
  if (problemas.length) {
    console.log(`\n🔴 "${codigo}" no cumple el estándar:`);
    for (const p of problemas) console.log(`   · ${p}`);
    if (codigo.length > TOPE) {
      console.log(`\n   Acortá el TEMA en el nombre del archivo: "${info.tema}" es muy largo.`);
      console.log(`   Te sobran ${codigo.length - TOPE} caracteres.`);
    }
    console.log('');
    process.exit(1);
  }

  const que = [
    pagado ? 'PROMOCIONADO (pago)' : 'orgánico',
    PLATAFORMAS[info.plataforma],
    FORMATOS[info.formato],
    comentario ? '— el link del COMENTARIO' : '',
  ].filter(Boolean).join(' · ');

  console.log(`\n✅ ${codigo}   (${codigo.length}/${TOPE} caracteres)`);
  console.log(`   ${que}\n`);
  imprimirLinks(codigo);

  if (!comentario) {
    const conCom = armar({ canal: pagado ? 'ad' : 'og', plataforma: info.plataforma, formato: info.formato, tema: info.tema, sufijo: 'com' });
    if (revisar(conCom).length === 0) {
      console.log(`Si además dejás el link en un comentario, ese va con:  ${conCom}\n`);
    }
  }
  process.exit(0);
}

if (!args.length) {
  console.log(`
Se usan sólo los niveles que hagan falta.

  ⭐ Lo normal — dejá que el nombre del archivo lo arme:

  node scripts/utiles/src.mjs --archivo <ruta al jpg/mp4>
  node scripts/utiles/src.mjs --archivo <ruta> --pagado       el mismo creativo, promocionado
  node scripts/utiles/src.mjs --archivo <ruta> --comentario   el link que va en el comentario

  A mano, cuando no hay archivo (mails, guías, anuncios):

  node scripts/utiles/src.mjs ad fomo a1        → ad-fomo-a1      (anuncio a1 de la campaña fomo)
  node scripts/utiles/src.mjs em comunidad 03   → em-comunidad-03 (mail 3 del semanal)
  node scripts/utiles/src.mjs em manifiesto     → em-manifiesto   (sin piezas: dos niveles alcanzan)

  --canales   la chuleta entera      --revisar <codigo>   revisar uno ya escrito
`);
  process.exit(1);
}

const codigo = args.filter((a) => !a.startsWith('--')).map((a) => a.toLowerCase().trim()).join('-');
const problemas = revisar(codigo);

if (problemas.length) {
  console.log(`\n🔴 "${codigo}" no cumple el estándar:`);
  for (const p of problemas) console.log(`   · ${p}`);
  console.log('');
  process.exit(1);
}

console.log(`\n✅ ${codigo}   (${codigo.length}/${TOPE} caracteres)\n`);
imprimirLinks(codigo);

} // fin de main()
