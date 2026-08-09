#!/usr/bin/env node
/**
 * deploy.mjs — publica SIEMPRE el último commit, nunca lo que hay en el disco.
 *
 * POR QUÉ EXISTE (09/08/2026)
 *
 * `vercel --prod` sube el DIRECTORIO tal como está, no el commit. Con varias
 * sesiones de Claude trabajando sobre el mismo repo a la vez, eso significa que
 * publicar arrastra el trabajo a medio escribir de otro. Ya pasó dos veces:
 *
 *  - El 09/08 el cambio de "todo lo automático va por email" llegó a producción
 *    SIN estar commiteado: un deploy ajeno subió el working tree. El código que
 *    corría existía únicamente en el disco de Jose — si esa carpeta se perdía,
 *    no se recuperaba de ningún lado.
 *  - Ese mismo día hubo que frenar otro deploy porque `api/hotmart.js` estaba
 *    siendo editado por otra sesión en ese momento.
 *
 * Este script crea una copia limpia del último commit en una carpeta temporal
 * (git worktree), deploya DESDE AHÍ y la borra. Lo que no está commiteado no
 * viaja. No depende de que nadie se acuerde de mirar `git status`.
 *
 * De paso arregla la pregunta "¿qué versión está en producción?": la respuesta
 * pasa a ser un commit, y no "lo que había en el disco a esa hora".
 *
 * USO:
 *   node herramientas/deploy.mjs sistema-ingresos
 *   node herramientas/deploy.mjs leadr
 *   node herramientas/deploy.mjs sistema-ingresos --dry   (muestra y no publica)
 */

import { spawnSync } from 'child_process'
import { mkdtempSync, cpSync, existsSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// `sub` = subcarpeta desde donde se corre el CLI. OJO con Leadr: su proyecto de
// Vercel tiene Root Directory = "app", así que el CLI va en la RAÍZ del repo.
// Correrlo dentro de app/ falla el build con "Couldn't find any app directory".
const PROYECTOS = {
  'sistema-ingresos': {
    repo: RAIZ,
    sub: 'sistema-ingresos',
    url: 'https://sistemadeingresosdiariosia.com/',
  },
  leadr: {
    repo: resolve(RAIZ, '..', 'Leadr'),
    sub: '.',
    url: 'https://www.leadr.cloud/',
  },
}

const nombre = process.argv[2]
const DRY = process.argv.includes('--dry')
const cfg = PROYECTOS[nombre]

if (!cfg) {
  console.error(`\n❌ Proyecto desconocido: ${nombre || '(ninguno)'}`)
  console.error(`   Opciones: ${Object.keys(PROYECTOS).join(' · ')}\n`)
  process.exit(1)
}

const corre = (cmd, args, cwd, capturar = true) =>
  spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: false, stdio: capturar ? 'pipe' : 'inherit' })

const git = (args, cwd = cfg.repo) => corre('git', args, cwd).stdout?.trim() ?? ''

if (!existsSync(cfg.repo)) {
  console.error(`\n❌ No existe el repo: ${cfg.repo}\n`)
  process.exit(1)
}

const sha = git(['rev-parse', '--short', 'HEAD'])
const asunto = git(['log', '-1', '--format=%s'])
const rama = git(['rev-parse', '--abbrev-ref', 'HEAD'])
if (!sha) {
  console.error(`\n❌ No pude leer el último commit de ${cfg.repo}\n`)
  process.exit(1)
}

console.log(`\n📦 Deploy de ${nombre}`)
console.log(`   commit  ${sha} (${rama}) — ${asunto}`)

// Lo sucio NO se publica, pero hay que decirlo: si el cambio que se quiere subir
// está sin commitear, el deploy va a salir sin él y eso confunde muchísimo.
const sucio = git(['status', '--porcelain']).split('\n').filter(Boolean)
if (sucio.length) {
  console.log(`\n⚠️  ${sucio.length} archivo(s) sin commitear — NO se van a publicar:`)
  for (const l of sucio.slice(0, 12)) console.log(`      ${l}`)
  if (sucio.length > 12) console.log(`      … y ${sucio.length - 12} más`)
  console.log(`   Si alguno era tuyo y tenía que salir, cancelá (Ctrl+C), commiteá y volvé.`)
}

const sinPushear = git(['log', '--oneline', `origin/${rama}..${rama}`]).split('\n').filter(Boolean)
if (sinPushear.length) {
  console.log(`\n📌 ${sinPushear.length} commit(s) sin pushear a GitHub (el deploy sí los incluye).`)
}

const tmp = mkdtempSync(join(tmpdir(), `deploy-${nombre}-`))
let salida = 1

try {
  console.log(`\n🧹 Copia limpia del commit en una carpeta aparte…`)
  const add = corre('git', ['worktree', 'add', '--detach', tmp, sha], cfg.repo)
  if (add.status !== 0) throw new Error(`git worktree: ${add.stderr || add.stdout}`)

  // `.vercel/` está gitignoreado (guarda a qué proyecto apunta), así que no viene
  // en la copia: hay que llevarlo a mano o el CLI no sabe dónde publicar.
  const origenVercel = join(cfg.repo, cfg.sub, '.vercel')
  const destinoVercel = join(tmp, cfg.sub, '.vercel')
  if (!existsSync(origenVercel)) throw new Error(`falta ${origenVercel} — enlazá el proyecto con "vercel link"`)
  cpSync(origenVercel, destinoVercel, { recursive: true })

  const cwd = resolve(tmp, cfg.sub)
  if (DRY) {
    console.log(`\n🔎 --dry: se publicaría el commit ${sha} desde ${cwd}`)
    salida = 0
  } else {
    console.log(`🚀 Publicando…\n`)
    const r = corre('npx', ['vercel', '--prod', '--yes'], cwd, false)
    salida = r.status ?? 1
  }
} catch (e) {
  console.error(`\n❌ ${e.message}`)
  salida = 1
} finally {
  // Siempre limpiar: un worktree colgado hace fallar el próximo deploy.
  corre('git', ['worktree', 'remove', '--force', tmp], cfg.repo)
  if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true })
  corre('git', ['worktree', 'prune'], cfg.repo)
}

if (salida === 0 && !DRY) {
  // Verificar contra el DOMINIO real, no contra el alias que imprime el CLI: el
  // alias puede responder 200 mientras el dominio sigue con la versión vieja.
  try {
    const res = await fetch(cfg.url, { redirect: 'follow' })
    console.log(`\n${res.ok ? '✅' : '⚠️ '} ${cfg.url} → HTTP ${res.status}`)
  } catch (e) {
    console.log(`\n⚠️  No pude verificar ${cfg.url}: ${e.message}`)
  }
  console.log(`   En producción: commit ${sha}\n`)
}

process.exit(salida)
