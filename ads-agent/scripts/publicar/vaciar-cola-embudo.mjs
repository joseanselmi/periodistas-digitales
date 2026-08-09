#!/usr/bin/env node
// Vacía la cola del embudo de las guías (tarjeta #114) hasta el tope del día.
//
// ⚠️ POR QUÉ EXISTE ESTE SCRIPT Y NO SE LLAMA AL ENDPOINT A MANO
//
// El 07/08/2026 se intentó vaciar la cola llamando 6 veces seguidas a
// /api/wa-funnel?mode=live. Resultado: ~1.800 mails a ~580 personas (tenían que
// ser ~580), con hasta 5 copias de la misma guía a la misma persona en un minuto.
//
// La causa: el endpoint YA SE AUTO-ENCADENA. Al terminar, si queda cola, se
// dispara a sí mismo hasta 12 veces (wa-funnel.js:1779). Las llamadas manuales
// corrieron EN PARALELO con esas corridas hijas, y el candado de "1 mail por
// persona por día" no aguanta corridas simultáneas: lee los atributos del
// contacto en Brevo, que se escriben DESPUÉS de mandar el mail. Dos corridas a la
// vez no se ven entre ellas y le mandan lo mismo a la misma gente.
//
// Este script evita eso de dos formas:
//   1. Manda `chain=12` en cada llamada → el endpoint NO se auto-encadena
//      (la condición `chain < MAX_CHAINS` da false). Las únicas corridas que
//      existen son las de este bucle, que van de a una.
//   2. Desde el 08/08 el que decide ya no es este script sino el CANDADO del
//      endpoint (sistema-ingresos/api/_lib/candado.js): si hay otra cadena
//      viva, la llamada vuelve con `bloqueado:true` y no manda un solo mail.
//      Antes esto se estimaba desde acá —"¿hubo envíos en los últimos 3
//      minutos?"—, que es una adivinanza: no distingue una corrida viva de una
//      que acaba de terminar, y no servía de nada si el que arrancaba en
//      paralelo era otro (el cron, otra terminal). El endpoint sabe la verdad.
//
// NUNCA correr esto entre las 12:55 y las 13:15 UTC: es la ventana del cron.
// (El candado ya lo frenaría, pero pelearle el turno al cron no tiene sentido.)
//
// Uso (parado en ads-agent/):
//   node scripts/publicar/vaciar-cola-embudo.mjs            → ensayo, no manda nada
//   node scripts/publicar/vaciar-cola-embudo.mjs --enviar    → manda de verdad

import 'dotenv/config';
import { config } from 'dotenv';

config({ path: '../sistema-ingresos/.env.local' });
config({ path: '.env' });

const BASE = 'https://sistemadeingresosdiariosia.com/api/wa-funnel';
const KEY = process.env.CRON_SECRET;
const ENVIAR = process.argv.includes('--enviar');
const MAX_TANDAS = 12;

if (!KEY) {
  console.error('Falta CRON_SECRET (vive en sistema-ingresos/.env.local).');
  process.exit(1);
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const estado = () =>
  fetch(`${BASE}?mode=dry&key=${encodeURIComponent(KEY)}`).then((r) => r.json());

const utc = new Date().toISOString().slice(11, 16);
if (utc >= '12:55' && utc <= '13:15') {
  console.error(`Son las ${utc} UTC: ventana del cron. Esperá a las 13:20 y volvé a correr.`);
  process.exit(1);
}

const antes = await estado();
console.log(`Deuda: ${antes.total_faltante} ${JSON.stringify(antes.le_falta_a)}`);
console.log(`Cola de hoy: ${antes.would_send} · ya tocados hoy: ${antes.ya_tocados_hoy} (tope 500)`);
console.log(`Embudo encendido: ${antes.enabled} · puerta: ${antes.puerta_enganche}`);

const cand = antes.candado || {};
if (cand.disponible === false) {
  console.log(`⚠️ Candado NO DISPONIBLE (${cand.motivo}): el endpoint va a enviar sin protección.`);
} else if (cand.libre === false) {
  console.error(`Hay otra corrida del embudo viva (el candado vence ${cand.vence}). No arranco.`);
  process.exit(1);
}

let previa = null;
for (let i = 1; ENVIAR && i <= MAX_TANDAS; i++) {
  const t = Date.now();
  let out;
  try {
    // chain=12 → el endpoint NO se dispara a sí mismo. El bucle lo controlamos acá.
    out = await fetch(`${BASE}?mode=live&chain=12&key=${encodeURIComponent(KEY)}`).then((r) => r.json());
  } catch (e) {
    console.log(`tanda ${i} · ERROR de red: ${e.message}`);
    break;
  }

  // El endpoint frenó solo: hay otra cadena viva. No es un error del script, es el candado
  // haciendo su trabajo — pero hay que enterarse, no seguir dando vueltas al bucle.
  if (out.bloqueado) {
    console.log(`>> Bloqueado por el candado: ${out.motivo}`);
    break;
  }

  const ahora = await estado();
  const enviados = (out.results || []).filter((r) => r.sent).length;
  const fallidos = (out.results || []).filter((r) => r.error).length;
  console.log(
    `tanda ${i} · envió ${enviados} · fallos ${fallidos} · ${((Date.now() - t) / 1000).toFixed(0)}s` +
    ` · deuda ${ahora.total_faltante} · tocados hoy ${ahora.ya_tocados_hoy}`
  );

  if (ahora.ya_tocados_hoy >= 500) { console.log('>> Tope diario de 500 alcanzado.'); break; }
  if (enviados === 0) { console.log('>> No mandó nada, no hay más para hoy.'); break; }
  if (previa !== null && ahora.total_faltante >= previa) {
    console.log('>> La deuda dejó de bajar. Freno y hay que mirar por qué.');
    break;
  }
  previa = ahora.total_faltante;
  await dormir(5000); // margen para que Brevo termine de escribir los marcadores
}

if (!ENVIAR) {
  console.log('\nEnsayo: no se mandó nada. Agregá --enviar para que salga de verdad.');
} else {
  const fin = await estado();
  console.log(`\nFINAL · deuda ${fin.total_faltante} ${JSON.stringify(fin.le_falta_a)} · tocados hoy ${fin.ya_tocados_hoy}`);
}
