#!/usr/bin/env node
/**
 * Hook PostToolUse (matcher: Bash). Si el comando corrido invocó export-pdf.mjs,
 * corre automáticamente lint-pdf-guide.mjs sobre el mismo HTML y devuelve el
 * resultado a Claude (additionalContext) y al usuario (systemMessage) — sin
 * depender de que el modelo se acuerde de invocarlo manualmente.
 *
 * No usa jq (no está disponible en este entorno Git Bash de Windows) — todo
 * el parseo/armado de JSON va en Node puro.
 */
import { existsSync } from 'fs'
import { resolve, dirname, isAbsolute, join } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

let raw = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) raw += chunk

let input
try { input = JSON.parse(raw) } catch { process.exit(0) }

const cmd = input?.tool_input?.command || ''
if (!cmd.includes('export-pdf.mjs')) process.exit(0)

// Detectar `cd "<dir>" && ...` al inicio del comando, para resolver rutas relativas
let baseDir = process.cwd()
const cdMatch = cmd.match(/^cd\s+"([^"]+)"/) || cmd.match(/^cd\s+'([^']+)'/)
if (cdMatch) baseDir = cdMatch[1]

// Extraer el último argumento que termine en .html (con o sin comillas)
const htmlMatches = [...cmd.matchAll(/"([^"]*\.html)"|(\S*\.html)\b/g)]
const last = htmlMatches[htmlMatches.length - 1]
const htmlArg = last ? (last[1] || last[2]) : null

function out(obj) {
  process.stdout.write(JSON.stringify(obj))
}

if (!htmlArg) {
  out({ systemMessage: '⚠️ lint-pdf-guide: no se detectó la ruta .html en el comando export-pdf.mjs — correr el lint a mano.' })
  process.exit(0)
}

const htmlPath = isAbsolute(htmlArg) ? htmlArg : resolve(baseDir, htmlArg)

if (!existsSync(htmlPath)) {
  out({ systemMessage: `⚠️ lint-pdf-guide: no encontré el archivo "${htmlArg}" (base: ${baseDir}) — correr el lint a mano.` })
  process.exit(0)
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const lintScript = join(scriptDir, 'lint-pdf-guide.mjs')

let lintOutput, exitCode
try {
  lintOutput = execFileSync(process.execPath, [lintScript, htmlPath], { encoding: 'utf8' })
  exitCode = 0
} catch (e) {
  lintOutput = (e.stdout || '') + (e.stderr || '')
  exitCode = e.status ?? 1
}

if (exitCode !== 0) {
  out({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `🔎 lint-pdf-guide.mjs (automático) encontró problemas — NO mostrar ni publicar esta guía todavía:\n\n${lintOutput}`,
    },
    systemMessage: '❌ lint-pdf-guide.mjs encontró problemas en la guía PDF — revisar antes de seguir.',
  })
} else {
  out({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '🔎 lint-pdf-guide.mjs (automático): todos los criterios mecánicos pasaron.',
    },
    systemMessage: '✅ lint-pdf-guide.mjs: todo OK.',
  })
}
