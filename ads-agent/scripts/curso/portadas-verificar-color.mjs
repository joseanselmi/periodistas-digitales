/**
 * Verifica que cada portada tenga el color de acento de SU módulo. No escribe nada.
 *
 * POR QUÉ EXISTE (16/08/2026). Las portadas de M3, M4 y M5 se generaron con el color de otro
 * módulo, y nadie lo vio hasta tenerlas las 17 hechas. La causa: dos tablas de color que se
 * contradicen. La equivocada es `sistema-ingresos/curso/docs/IDENTIDAD-PORTADAS.md`, que decía
 * M3 violeta · M4 violeta · M5 cian.
 *
 * LA FUENTE DE VERDAD es el código de los videos —`video-studio/src/lib/editorial.tsx` y
 * `lib/marca.tsx`— porque la portada de una clase tiene que combinar con la clase:
 *
 *     M1 índigo #6366f1 · M2 cian #22d3ee · M3 verde #34d399 · M4 rosa #f472b6 · M5 violeta #a78bfa
 *
 *   cd ads-agent && node scripts/curso/portadas-verificar-color.mjs
 *
 * ⚠️ NO INTENTAR ARREGLARLO ROTANDO EL TONO. Se probó el 16/08 con sharp `modulate({hue})` y
 * el resultado es peor que el problema: el núcleo del neón está casi blanco y su tono no se
 * mueve, mientras el tinte del fondo sí — M5 quedó con fondo magenta y aros celestes. Una
 * portada con el color mal SE REGENERA en ChatGPT; no se corrige por software.
 *
 * ⚠️ LO QUE MEDIR ESTO DESTAPÓ, y es más grande que el bug que buscaba: **ChatGPT no produce
 * colores distintos por módulo**. Medido el 16/08 sobre las 38 portadas existentes:
 *
 *     M0 (pedido cian 188°)    → 209-222°     M3 (pedido violeta) → 252-255°
 *     M1 (pedido índigo 239°)  → 212-236°     M4 (pedido violeta) → 254-256°
 *     M2 (pedido cian 188°)    → 221-224°     M5 (pedido cian)    → 202-213°
 *
 * Pedirle cian y pedirle índigo devuelve el MISMO azul eléctrico (~215°). Sólo el violeta salió
 * distinto, porque está lejos del azul. Así que no hay seis colores: hay azul y violeta.
 * Por eso este script informa el tono y no dictamina: la tabla de la identidad describe una
 * intención que el proveedor de imágenes no cumple, y la decisión de qué hacer es de Jose.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORTADAS = path.join(RAIZ, '..', '..', 'Contenido del curso', 'Portadas');

// tono = matiz HSL en grados. tolerancia amplia: ChatGPT nunca clava el hex exacto,
// y lo que importa es que se lea como el color del módulo, no que coincida al grado.
const MODULOS = {
  '0': { carpeta: 'Módulo 0 - Bienvenida',      color: 'cian',    hex: '#22d3ee', tono: 188 },
  '1': { carpeta: 'Módulo 1 - Fundamentos',     color: 'índigo',  hex: '#6366f1', tono: 239 },
  '2': { carpeta: 'Módulo 2 - Tu equipo de IA', color: 'cian',    hex: '#22d3ee', tono: 188 },
  '3': { carpeta: 'Módulo 3 - Verificación',    color: 'verde',   hex: '#34d399', tono: 158 },
  '4': { carpeta: 'Módulo 4 - Marca',           color: 'rosa',    hex: '#f472b6', tono: 330 },
  '5': { carpeta: 'Módulo 5 - Nicho y lector',  color: 'violeta', hex: '#a78bfa', tono: 255 },
};
// 45° y no menos, a propósito. La medición mezcla el neón del elemento con el resplandor azul
// de la esquina, así que una portada cian sana mide 215-226° en vez de 188°: con un umbral
// estrecho el script grita en falso sobre M0 y M2, que están bien. Lo que tiene que detectar es
// el error grande —un módulo pintado con el color de otro—, que se va 45° o más.
const TOLERANCIA = 45; // grados

const rgb2hue = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return null;
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return h;
};

/**
 * El tono del TRAZO DE NEÓN, no el de la imagen.
 *
 * Primer intento (16/08): medir todo lo que no fuera fondo. No sirvió — el resplandor difuso de
 * la esquina es azul y arrastraba TODAS las portadas a ~220°, con lo que cian (188°) e índigo
 * (239°) quedaban indistinguibles y el script marcaba en falso M0 y M2, que están bien.
 *
 * Lo que sí separa: quedarse sólo con el 10% de píxeles MÁS SATURADOS. El trazo del neón es
 * saturado y definido; el glow del fondo es lavado. Ese decil es el color del elemento.
 */
async function tonoDominante(file) {
  const { data, info } = await sharp(file).resize(500).raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 110) continue;                 // fondo casi negro
    const sat = (mx - mn) / mx;
    if (sat < 0.2) continue;                // núcleo blanco del neón: no dice el color
    const h = rgb2hue(r, g, b);
    if (h !== null) px.push({ h, sat });
  }
  if (px.length < 50) return null;
  px.sort((a, b) => b.sat - a.sat);
  const top = px.slice(0, Math.max(50, Math.floor(px.length * 0.1)));
  const hs = top.map((p) => p.h).sort((a, b) => a - b);
  return hs[Math.floor(hs.length / 2)];
}

const distancia = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

async function main() {
  if (!fs.existsSync(PORTADAS)) {
    console.error(`❌ No encuentro la carpeta de portadas:\n   ${PORTADAS}`);
    process.exit(1);
  }

  console.log('\n🎨 Color de acento de cada portada contra el color de su módulo\n');
  let mal = 0, bien = 0, chicos = 0;

  for (const [mod, cfg] of Object.entries(MODULOS)) {
    const dir = path.join(PORTADAS, cfg.carpeta);
    if (!fs.existsSync(dir)) continue;
    console.log(`── Módulo ${mod} · debe ser ${cfg.color} ${cfg.hex} (${cfg.tono}°)`);

    for (const f of fs.readdirSync(dir).filter((x) => x.toLowerCase().endsWith('.png'))) {
      const src = path.join(dir, f);
      const kb = Math.round(fs.statSync(src).size / 1024);
      // Un PNG de menos de 200 KB no es una imagen: es el error de link vencido de ChatGPT.
      if (kb < 200) { console.log(`   🔴 ${f} — ${kb} KB, NO es una imagen`); chicos++; continue; }

      const t = await tonoDominante(src);
      if (t === null) { console.log(`   ⚠️  ${f} — sin acento medible`); continue; }
      const d = distancia(t, cfg.tono);

      // La segunda regla, y la que más sirve: ¿se parece MÁS al color de otro módulo que al
      // propio? Cian y violeta están a 67° nada más, así que un umbral fijo no alcanza — M5
      // pintado en cian se escapaba por debajo de los 45°. Esto lo atrapa igual.
      let confundible = null;
      for (const [otroMod, otro] of Object.entries(MODULOS)) {
        if (otroMod === mod || otro.color === cfg.color) continue;
        if (distancia(t, otro.tono) < d) {
          if (!confundible || distancia(t, otro.tono) < distancia(t, MODULOS[confundible].tono)) confundible = otroMod;
        }
      }

      const ok = d <= TOLERANCIA && !confundible;
      if (ok) bien++; else mal++;
      const nota = confundible
        ? `  ← se lee como el M${confundible} (${MODULOS[confundible].color})`
        : '';
      console.log(`   ${ok ? '✅' : '❌'} ${f.padEnd(56).slice(0, 56)} ${String(Math.round(t)).padStart(3)}°  (a ${String(Math.round(d)).padStart(3)}° del objetivo)${nota}`);
    }
    console.log('');
  }

  console.log(`  ${bien} con el color correcto · ${mal} con el color de otro módulo` + (chicos ? ` · ${chicos} archivo(s) roto(s)` : ''));
  if (mal) console.log(`  Las que están mal SE REGENERAN en ChatGPT. No se arreglan rotando el tono (ver el comentario de arriba).\n`);
  else console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
