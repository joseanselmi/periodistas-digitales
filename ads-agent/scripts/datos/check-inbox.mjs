/**
 * check-inbox.mjs — Sofía lee el inbox de jose@sistemadeingresosdiariosia.com
 *
 * Uso:
 *   node scripts/datos/check-inbox.mjs              → últimos 20 emails no leídos
 *   node scripts/datos/check-inbox.mjs --all        → últimos 50 emails (leídos y no leídos)
 *   node scripts/datos/check-inbox.mjs --dias 3     → emails de los últimos N días
 */

import { ImapFlow } from 'imapflow';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Este script vive en scripts/datos/; el .env esta en la raiz de ads-agent.
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Cargar .env manualmente (sin depender de dotenv en runtime)
const envPath = join(RAIZ, '.env');
const env = {};
try {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  }
} catch {}

const IMAP_HOST = process.env.IMAP_HOST || env.IMAP_HOST || 'imap.hostinger.com';
const IMAP_PORT = parseInt(process.env.IMAP_PORT || env.IMAP_PORT || '993');
const IMAP_USER = process.env.IMAP_USER || env.IMAP_USER;
const IMAP_PASS = process.env.IMAP_PASS || env.IMAP_PASS;

// Args
const args = process.argv.slice(2);
const soloNoLeidos = !args.includes('--all');
const diasIndex = args.indexOf('--dias');
const dias = diasIndex !== -1 ? parseInt(args[diasIndex + 1]) : 7;

const client = new ImapFlow({
  host: IMAP_HOST,
  port: IMAP_PORT,
  secure: true,
  auth: { user: IMAP_USER, pass: IMAP_PASS },
  logger: false,
});

async function main() {
  await client.connect();
  await client.mailboxOpen('INBOX');

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const fechaFiltro = desde.toISOString().split('T')[0];

  const criterios = soloNoLeidos ? { seen: false } : {};

  // Filtrar por fecha manualmente para evitar bugs de zona horaria con IMAP
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);

  const emails = [];

  for await (const msg of client.fetch(criterios, {
    envelope: true,
    flags: true,
    bodyStructure: true,
  })) {
    const de = msg.envelope.from?.[0];
    const remitente = de ? `${de.name || ''} <${de.address}>`.trim() : 'desconocido';
    const asunto = msg.envelope.subject || '(sin asunto)';
    const fecha = msg.envelope.date?.toISOString().split('T')[0] || '?';
    const leido = msg.flags.has('\\Seen');
    const fechaMsg = msg.envelope.date ? new Date(msg.envelope.date) : new Date(0);
    if (fechaMsg < fechaLimite) continue;

    emails.push({ remitente, asunto, fecha, leido });
  }

  await client.logout();

  // Clasificar
  const keywords = {
    positivo: ['gracias', 'excelente', 'perfecto', 'me interesa', 'quiero', 'compré', 'me uní', 'genial', 'buenísimo'],
    pregunta: ['?', 'cómo', 'cuándo', 'cuánto', 'dónde', 'puedo', 'funciona', 'precio'],
    baja: ['desuscribir', 'baja', 'no me interesa', 'eliminar', 'stop', 'unsubscribe'],
  };

  const clasificar = (email) => {
    const texto = (email.asunto + ' ' + email.remitente).toLowerCase();
    for (const [tipo, words] of Object.entries(keywords)) {
      if (words.some(w => texto.includes(w))) return tipo;
    }
    return 'otro';
  };

  const grupos = { positivo: [], pregunta: [], baja: [], otro: [] };
  for (const e of emails) grupos[clasificar(e)].push(e);

  // Output
  const hoy = new Date().toISOString().split('T')[0];
  console.log(`\n📧 INBOX — ${hoy}`);
  console.log(`Período: últimos ${dias} días | Filtro: ${soloNoLeidos ? 'no leídos' : 'todos'}`);
  console.log(`Total encontrados: ${emails.length}\n`);

  if (grupos.baja.length) {
    console.log(`🔴 BAJAS (${grupos.baja.length})`);
    grupos.baja.forEach(e => console.log(`  ${e.fecha} | ${e.remitente} | ${e.asunto}`));
    console.log('');
  }

  if (grupos.positivo.length) {
    console.log(`✅ POSITIVOS (${grupos.positivo.length})`);
    grupos.positivo.forEach(e => console.log(`  ${e.fecha} | ${e.remitente} | ${e.asunto}`));
    console.log('');
  }

  if (grupos.pregunta.length) {
    console.log(`❓ PREGUNTAS (${grupos.pregunta.length})`);
    grupos.pregunta.forEach(e => console.log(`  ${e.fecha} | ${e.remitente} | ${e.asunto}`));
    console.log('');
  }

  if (grupos.otro.length) {
    console.log(`📨 OTROS (${grupos.otro.length})`);
    grupos.otro.forEach(e => console.log(`  ${e.fecha} | ${e.remitente} | ${e.asunto}`));
    console.log('');
  }

  if (emails.length === 0) {
    console.log('Sin emails nuevos en el período.');
  }
}

main().catch(err => {
  console.error('Error conectando al inbox:', err.message);
  process.exit(1);
});
