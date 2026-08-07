/**
 * De dónde salen las claves. Un solo lugar.
 *
 * Antes cada script resolvía esto por su cuenta y ninguno igual: uno anclaba la
 * ruta a su propia ubicación, otro la armaba desde el directorio donde lo
 * corrías, y tres apuntaban a `../leadr/app/.env.local` — una carpeta que no
 * existe desde que Leadr se fue a su propio repo el 2026-06-27. Esos tres
 * arrancaban sin ninguna variable, porque dotenv no se queja cuando el archivo
 * no está: fallaban después, con un error que no tenía nada que ver.
 *
 * Uso, desde cualquier script de scripts/<grupo>/ — dos niveles más abajo, así
 * que el import sube dos y entra a lib:
 *
 *     import { cargarEnv } from "../.." + "/lib/env.mjs"
 *     cargarEnv(['ANTHROPIC_API_KEY'])     // corta con mensaje claro si falta
 *
 * (el import va escrito de una sola pieza, sin el `+`: acá está partido para que
 * el verificador del repo no lo lea como una ruta real de este archivo)
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));

// El de este repo manda. El de Leadr es una red de contención heredada: hasta el
// 2026-08-01 varias claves (ANTHROPIC_API_KEY, las de Supabase) vivían SOLO allá,
// así que este repo dependía en silencio de tener el repo hermano al lado y con
// ese nombre exacto. Copiándolas a ads-agent/.env.local, la red deja de hacer
// falta y se puede borrar esta segunda ruta.
const ARCHIVOS = [
  join(AQUI, '../.env.local'),                             // ads-agent/.env.local
  join(AQUI, '../.env'),                                   // ads-agent/.env
  resolve(process.cwd(), '../../Leadr/app/.env.local'),    // red: el repo hermano
];

/**
 * Carga los archivos de entorno y verifica que estén las claves pedidas.
 * No pisa una variable que ya venga del sistema — eso deja que un cron de la
 * nube mande sin tener que tocar ningún archivo.
 *
 * @param {string[]} requeridas  claves sin las cuales el script no tiene sentido
 * @returns {{cargados: string[]}}
 */
export function cargarEnv(requeridas = []) {
  const cargados = [];

  for (const archivo of ARCHIVOS) {
    if (!existsSync(archivo)) continue;
    cargados.push(archivo);
    for (const linea of readFileSync(archivo, 'utf-8').split('\n')) {
      const limpia = linea.trim();
      if (!limpia || limpia.startsWith('#')) continue;
      const i = limpia.indexOf('=');
      if (i < 1) continue;
      const clave = limpia.slice(0, i).trim();
      const valor = limpia.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[clave]) process.env[clave] = valor;
    }
  }

  const faltan = requeridas.filter((k) => !process.env[k]);
  if (faltan.length) {
    console.error(`\n❌ Faltan claves: ${faltan.join(', ')}`);
    console.error('   Van en ads-agent/.env.local — la lista completa de cuáles');
    console.error('   hacen falta está en ads-agent/.env.example.\n');
    process.exit(1);
  }

  return { cargados };
}
