/**
 * trello-task.mjs — CLI para asignar y consultar tareas por agente en Trello
 *
 * Uso:
 *   node scripts/utiles/trello-task.mjs crear <agente> "<titulo>" [--desc "..."] [--list "Por hacer"]
 *   node scripts/utiles/trello-task.mjs listar <agente>
 *   node scripts/utiles/trello-task.mjs mover <cardId> <lista>
 */

import { createTask, getTasksForAgent, moveTask } from '../../lib/trello.mjs'

const [cmd, ...rest] = process.argv.slice(2)

function flag(args, name, fallback) {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : fallback
}

if (cmd === 'crear') {
  const [agente, titulo, ...flags] = rest
  const desc = flag(flags, 'desc', '')
  const list = flag(flags, 'list', 'Por hacer')
  const card = await createTask(agente, titulo, { desc, list })
  console.log(`✅ Tarea creada para ${agente}: "${titulo}" en "${list}"`)
  console.log(card.shortUrl)
} else if (cmd === 'listar') {
  const [agente] = rest
  const tasks = await getTasksForAgent(agente)
  if (!tasks.length) {
    console.log(`${agente} no tiene tareas asignadas.`)
  } else {
    console.log(`Tareas de ${agente}:`)
    tasks.forEach((t) => console.log(`  [${t.listName}] ${t.name}`))
  }
} else if (cmd === 'mover') {
  const [cardId, lista] = rest
  await moveTask(cardId, lista)
  console.log(`✅ Tarjeta movida a "${lista}"`)
} else {
  console.log('Uso: node scripts/utiles/trello-task.mjs crear|listar|mover <args>')
}
