/**
 * src.mjs — genera y revisa los códigos de atribución (`src`) según el estándar.
 *
 * El estándar entero está en `sistema-ingresos/docs/NOMENCLATURA-SRC.md`. Este script existe
 * para que nadie lo escriba a mano: dos personas tipeando producen `Email-Manifiesto` y
 * `em-manifiesto` para la misma cosa, y eso ya pasó — hoy conviven las dos formas en la base.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/utiles/src.mjs em comunidad 03        → el código + los links listos para pegar
 *   node scripts/utiles/src.mjs ad fomo a1
 *   node scripts/utiles/src.mjs --revisar em-Comunidad_3
 *   node scripts/utiles/src.mjs --canales             → qué canales hay y qué significan
 */

import { pathToFileURL } from 'node:url';

const CANALES = {
  ad:  'Meta pago (anuncios)',
  em:  'email',
  wa:  'WhatsApp (canal cerrado; queda por el histórico)',
  og:  'orgánico (posteos, no pago)',
  pdf: 'link dentro de una guía',
  dir: 'directo — entró sin ningún origen',
};

// Los tres límites son de Hotmart, verificados en su central de ayuda el 19/08/2026.
// No son elecciones nuestras: si se rompen, Hotmart no avisa, sólo guarda mal.
const TOPE = 30;
const PROHIBIDO = /_/;            // el guion bajo está reservado para uso interno de Hotmart
const VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const BOTONES = ['dolor', 'bonos', 'precio', 'cierre', 'pie', 'sticky'];
const LANDING = 'https://sistemadeingresosdiariosia.com/';

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

// La validacion la reusa `herramientas/verificar-repo.mjs` para revisar los `src`
// escritos en todo el repo. Se exporta para que el criterio tenga UN solo dueno:
// si se reimplementara alla, en tres meses dirian cosas distintas.
export { revisar, CANALES, BOTONES, TOPE };

// De aca para abajo es la CLI. Solo corre si se invoca el script directamente;
// al importarlo (verificar-repo) no debe imprimir ni llamar a process.exit().
const esCLI = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esCLI) main();

function main() {

const args = process.argv.slice(2);

if (args.includes('--canales')) {
  console.log('\nCanales (nivel 1 — siempre va):\n');
  for (const [c, q] of Object.entries(CANALES)) console.log(`  ${c.padEnd(5)} ${q}`);
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

if (!args.length) {
  console.log(`
Faltan los niveles. Se usan sólo los que hagan falta:

  node scripts/utiles/src.mjs <canal> <origen> [pieza]

  node scripts/utiles/src.mjs ad fomo a1        → ad-fomo-a1     (anuncio a1 de la campaña fomo)
  node scripts/utiles/src.mjs em comunidad 03   → em-comunidad-03 (mail 3 del semanal)
  node scripts/utiles/src.mjs em manifiesto     → em-manifiesto   (sin piezas: dos niveles alcanzan)

  --canales   qué canales hay        --revisar <codigo>   revisar uno ya escrito
`);
  process.exit(1);
}

const codigo = args.map(a => a.toLowerCase().trim()).join('-');
const problemas = revisar(codigo);

if (problemas.length) {
  console.log(`\n🔴 "${codigo}" no cumple el estándar:`);
  for (const p of problemas) console.log(`   · ${p}`);
  console.log('');
  process.exit(1);
}

console.log(`\n✅ ${codigo}   (${codigo.length}/${TOPE} caracteres)\n`);
console.log('Para pegar:\n');
console.log(`  A la landing   ${LANDING}?src=${codigo}`);
console.log(`  Al checkout    https://pay.hotmart.com/P106404871J?checkoutMode=10&src=${codigo}&sck=directo`);
console.log(`  A una guía     https://sistemadeingresosdiariosia.com/api/d?file=<archivo>.pdf&src=${codigo}\n`);
console.log('Recordá: el `sck` lo pone el botón de la página, no el link de origen.');
console.log(`Botones de la landing: ${BOTONES.join(' · ')}\n`);

} // fin de main()
