import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '../leadr/app/.env.local' });

// Este script vive en scripts/curso/; las transcripciones estan en la raiz de ads-agent.
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TRANSCRIPTS_DIR = 'C:\\Users\\Jose Anselmi\\Videos\\hotmart\\transcripciones';
const OUT_DIR = path.join(RAIZ, '..', '_material', 'curso-luis-mena');
const LESSONS_FILE = path.join(OUT_DIR, 'lessons.json');
const PROGRESS_FILE = path.join(OUT_DIR, 'progress.json');

const EXTRA_DIR = path.join(OUT_DIR, 'extra');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function log(msg) { console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }

async function structureWithClaude(lessonTitle, transcript) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Sos el asistente de José Anselmi. Esta es una clase del curso "Sistema de Ingresos Diarios" de Luis Mena.

Clase: "${lessonTitle}"

Transcripción:
---
${transcript.substring(0, 6000)}
---

Estructurá en Markdown limpio:
- Secciones con ###
- Conceptos clave en **negrita**
- Listas con guiones
- Conservá TODOS los datos: números, ejemplos, herramientas

Devolvé SOLO el markdown.`
    }]
  });
  return msg.content[0].text;
}

async function main() {
  [OUT_DIR, EXTRA_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  const txtFiles = fs.readdirSync(TRANSCRIPTS_DIR)
    .filter(f => f.endsWith('.txt') && f !== 'CURSO_COMPLETO.txt')
    .sort();

  log(`📁 Transcripciones encontradas: ${txtFiles.length}`);

  let done = 0, skipped = 0;

  for (const txtFile of txtFiles) {
    const title = txtFile.replace(/\.txt$/, '').replace(/^\d+[_\s]+/, '').replace(/^\d+:\d+\s*/, '').trim();
    const slug = txtFile.replace(/\.txt$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const outFile = path.join(EXTRA_DIR, `${slug}.md`);

    if (fs.existsSync(outFile)) {
      log(`  ♻️  Ya existe: ${slug}.md`);
      skipped++;
      continue;
    }

    const transcript = fs.readFileSync(path.join(TRANSCRIPTS_DIR, txtFile), 'utf8').trim();
    if (transcript.length < 50) { skipped++; continue; }

    log(`[${done + skipped + 1}/${txtFiles.length}] ${title}`);
    try {
      const structured = await structureWithClaude(title, transcript);
      fs.writeFileSync(outFile, `# ${title}\n\n${structured}`, 'utf8');
      log(`  💾 ${slug}.md`);
      done++;
    } catch (err) {
      log(`  ❌ ${err.message.substring(0, 80)}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  log(`\n✅ Listo: ${done} nuevas | ${skipped} ya existían`);
  const extra = fs.readdirSync(EXTRA_DIR).filter(f => f.endsWith('.md')).length;
  const main_ = fs.readdirSync(OUT_DIR).filter(f => f.startsWith('leccion-') && f.endsWith('.md')).length;
  log(`📚 Total cerebro: ${main_} lecciones del curso actual + ${extra} del curso viejo`);
}

main().catch(console.error);
