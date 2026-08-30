/**
 * Arma el manifiesto de portadas: qué archivo le corresponde a qué clase.
 *
 * Es la mitad del trabajo que NO depende de cómo sea el editor de Hotmart, así
 * que se puede tener lista y revisada antes de tocar nada. El script que sube
 * lee este JSON; el `--dry` imprime exactamente esto para que Jose lo apruebe
 * antes de que se suba una sola imagen.
 *
 *   cd ads-agent && node scripts/curso/portadas-manifiesto.mjs
 *
 * La fuente de verdad son los ARCHIVOS en disco, no una lista escrita a mano:
 * si mañana se regenera una portada o se suma una clase, el manifiesto la toma
 * sola. Lo único que se hardcodea son los títulos, que sirven para reconocer la
 * clase en Hotmart cuando el título de allá no trae el número adelante.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORTADAS = path.join(RAIZ, '..', '..', 'Contenido del curso', 'Portadas');
const SALIDA = path.join(RAIZ, 'state', 'portadas-clases.json');

// Los títulos como están en los guiones del repo. Sirven de segundo criterio
// para emparejar con Hotmart: si allá la clase no se llama "2.3 …" sino
// "Hablarle a la IA como a tu redactor", el número solo no alcanza.
const TITULOS = {
  '0.1': 'Bienvenida: tu medio, tu voz, tus ingresos',
  '0.2': 'De periodista a emprendedor (la transformación)',
  '0.3': 'Cómo aprovechar el curso',
  '0.4': 'Sumate a la comunidad',
  '0.6': 'Tu regalo: Leadr Pro (cómo entrar y usarlo)',
  '0.7': 'Lo que hace falta para lograrlo',
  '1.1': 'El negocio de un medio de nicho',
  '1.2': 'La máquina por dentro: las cinco etapas',
  '1.3': 'Alcance: cómo te encuentra la gente que no sabe que existís',
  '1.4': 'De visitante a seguidor: qué pasa en esos tres segundos',
  '1.5': 'De seguidor a suscriptor: el único canal que es tuyo',
  '1.6': 'El efecto compuesto: por qué crece lento y de golpe se dispara',
  '1.7': 'Cómo saber si tu máquina está funcionando',
  '2.1': 'Qué es la IA y cómo "piensa"',
  '2.2': 'La anatomía de un buen prompt',
  '2.3': 'Hablarle a la IA como a tu redactor',
  '2.4': 'Los roles de IA de tu redacción',
  '2.5': 'Construí tu biblioteca de prompts',
  '3.1': 'La credibilidad como base del negocio',
  '3.2': 'Verificar imágenes y videos en segundos',
  '3.3': 'Chequear declaraciones y datos con IA',
  '3.4': 'Transparencia: mostrar tu proceso genera confianza',
  '4.1': 'La teoría del nombre: qué hace que se recuerde',
  '4.2': 'Creá tu nombre con IA (y chequeá que esté libre)',
  '4.3': 'Tu color: qué transmite y cómo armás tu paleta',
  '4.4': 'Tipografía y logo sin diseñador',
  '4.5': 'El sistema de marca: coherencia + tu voz y tu tono',
  '5.1': 'La teoría del nicho: por qué enfocarte gana',
  '5.2': 'Los 3 filtros de un nicho rentable',
  '5.3': 'Investigar y validar tu nicho con IA',
  '5.4': 'Tu ángulo único dentro del nicho',
  '5.5': 'Tu lector ideal: construí el avatar',
  '5.6': 'Tu propuesta editorial y tu línea',
  final: 'Tu nueva etapa como periodista digital independiente',
};

function main() {
  if (!fs.existsSync(PORTADAS)) {
    console.error(`❌ No encuentro la carpeta de portadas:\n   ${PORTADAS}`);
    process.exit(1);
  }

  const entradas = [];
  const sinTitulo = [];
  const portadasDeModulo = [];

  for (const carpeta of fs.readdirSync(PORTADAS, { withFileTypes: true })) {
    if (!carpeta.isDirectory()) continue;
    for (const archivo of fs.readdirSync(path.join(PORTADAS, carpeta.name))) {
      if (!archivo.toLowerCase().endsWith('.png')) continue;

      // Las portadas de MÓDULO quedan afuera a propósito: se cargan a mano.
      // Son 6 y viven en otra pantalla de Hotmart — automatizarlas no paga.
      if (/portada de m[oó]dulo/i.test(archivo)) {
        portadasDeModulo.push(archivo);
        continue;
      }

      const ruta = path.join(PORTADAS, carpeta.name, archivo);
      const m = archivo.match(/^Clase\s+(\d+\.\d+)\s*-/i);
      const clave = m ? m[1] : (/^Clase final/i.test(archivo) ? 'final' : null);

      if (!clave) { sinTitulo.push(archivo); continue; }

      entradas.push({
        clase: clave,
        modulo: clave === 'final' ? null : clave.split('.')[0],
        titulo: TITULOS[clave] || null,
        archivo: ruta,
        kb: Math.round(fs.statSync(ruta).size / 1024),
      });
    }
  }

  entradas.sort((a, b) => {
    if (a.clase === 'final') return 1;
    if (b.clase === 'final') return -1;
    return a.clase.localeCompare(b.clase, undefined, { numeric: true });
  });

  // Un archivo sano pesa >1 MB. Los de 45 bytes son el error de link vencido de
  // ChatGPT guardado como .png: en la carpeta se ven idénticos a una portada.
  const sospechosos = entradas.filter((e) => e.kb < 200);
  const sinTituloConocido = entradas.filter((e) => !e.titulo);

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, JSON.stringify({ generado: null, total: entradas.length, entradas }, null, 2), 'utf8');

  console.log(`\n📋 Manifiesto de portadas de CLASE — ${entradas.length} entradas\n`);
  for (const e of entradas) {
    console.log(`  ${e.clase.padEnd(6)} ${String(e.kb).padStart(5)} KB  ${e.titulo || '⚠️ sin título conocido'}`);
  }
  console.log(`\n  Portadas de módulo excluidas (van a mano): ${portadasDeModulo.length}`);
  if (sinTitulo.length) console.log(`  ⚠️  Archivos que no pude interpretar: ${sinTitulo.join(', ')}`);
  if (sinTituloConocido.length) console.log(`  ⚠️  Clases sin título en la tabla: ${sinTituloConocido.map((e) => e.clase).join(', ')}`);
  if (sospechosos.length) {
    console.log(`  🔴 ARCHIVOS SOSPECHOSOS (menos de 200 KB, probablemente rotos):`);
    for (const s of sospechosos) console.log(`       ${s.clase} — ${s.kb} KB — ${s.archivo}`);
  }
  console.log(`\n  Guardado en: ${SALIDA}\n`);
}

main();
