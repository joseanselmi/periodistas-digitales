import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Este script vive en scripts/curso/; los datos estan en la raiz de ads-agent.
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(RAIZ, '..', '_material', 'luis-mena');
const EXTRA_DIR = path.join(OUT_DIR, 'extra');
const MEMORY_FILE = 'C:\\Users\\Jose Anselmi\\.claude\\projects\\c--Users-Jose-Anselmi-OneDrive-Escritorio-Periodistas-Digitales\\memory\\curso_sistema_ingresos_diarios.md';

function log(msg) { console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); }

const moduleMap = {
  1:  { title: 'Fundamentos', range: [1, 5] },
  2:  { title: 'Micro Ofertas', range: [6, 8] },
  4:  { title: 'Ofertas de Alto Impacto', range: [9, 15] },
  5:  { title: 'Crea tu Producto Digital', range: [16, 25] },
  6:  { title: 'Copy Express', range: [26, 32] },
  7:  { title: 'Página de Ventas', range: [33, 42] },
  8:  { title: 'Anuncios', range: [43, 53] },
  9:  { title: 'Tráfico', range: [54, 65] },
  10: { title: 'Optimización y Escalamiento', range: [66, 68] },
  11: { title: 'Aceleradores de Ganancias', range: [69, 78] },
  12: { title: 'Master en VSL', range: [79, 107] },
  13: { title: 'Edición de VSL', range: [108, 118] },
  14: { title: 'Masterclass', range: [119, 119] },
};

let memory = `---
name: Curso Sistema de Ingresos Diarios - Luis Mena
description: Contenido completo del curso pagado de José. Modelo de negocio digital con micro ofertas + Meta Ads. 109 lecciones transcritas + 64 del curso anterior. Usar para estrategia, copy, y decisiones de negocio.
type: project
---
# Sistema de Ingresos Diarios — Luis Mena
**Plataforma:** Hotmart | **15 módulos** | **109/133 lecciones transcritas** (excluye reuniones semanales)

`;

let totalLessons = 0;

// Módulos del curso actual
for (const [modNum, mod] of Object.entries(moduleMap)) {
  const [start, end] = mod.range;
  const lessonFiles = [];
  for (let i = start; i <= end; i++) {
    const f = path.join(OUT_DIR, `leccion-${String(i).padStart(3,'0')}.md`);
    if (fs.existsSync(f)) {
      lessonFiles.push({ num: i, content: fs.readFileSync(f, 'utf8') });
    }
  }
  if (lessonFiles.length === 0) continue;

  memory += `\n---\n\n## MÓDULO ${modNum} — ${mod.title}\n\n`;
  for (const lf of lessonFiles) {
    memory += lf.content + '\n\n';
    totalLessons++;
  }
  log(`✅ Módulo ${modNum} — ${mod.title}: ${lessonFiles.length} lecciones`);
}

// Contenido extra (curso viejo — temas complementarios)
const extraFiles = fs.readdirSync(EXTRA_DIR).filter(f => f.endsWith('.md')).sort();
if (extraFiles.length > 0) {
  memory += `\n---\n\n## CONTENIDO COMPLEMENTARIO (Curso anterior — temas de referencia)\n\n`;
  for (const ef of extraFiles) {
    const content = fs.readFileSync(path.join(EXTRA_DIR, ef), 'utf8');
    memory += content + '\n\n';
    totalLessons++;
  }
  log(`✅ Extra: ${extraFiles.length} lecciones del curso anterior`);
}

// Escribir memoria
fs.writeFileSync(MEMORY_FILE, memory, 'utf8');
const sizeKB = Math.round(fs.statSync(MEMORY_FILE).size / 1024);
log(`\n🧠 Memoria compilada: ${totalLessons} lecciones, ${sizeKB}KB`);
log(`📁 ${MEMORY_FILE}`);
