/**
 * lib/trello.mjs — Cliente Trello para el tablero "Roadmap Periodistas Digitales"
 *
 * Permite que cada agente (Ricardo, Dante, Valentina, etc.) cree, liste y mueva
 * sus propias tareas. La "asignación" se hace vía label (Trello free no permite
 * agregar 13 miembros sin invitarlos por email), una label por agente.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = {}
try {
  const lines = readFileSync(join(__dirname, '..', '.env'), 'utf8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) env[key.trim()] = rest.join('=').trim()
  }
} catch {}

const KEY = process.env.TRELLO_API_KEY || env.TRELLO_API_KEY
const TOKEN = process.env.TRELLO_TOKEN || env.TRELLO_TOKEN
const BOARD_ID = '6a35bf86f4bbebc72953200f' // Roadmap Periodistas Digitales

if (!KEY || !TOKEN) {
  throw new Error('Faltan TRELLO_API_KEY / TRELLO_TOKEN en ads-agent/.env')
}

const auth = () => `key=${KEY}&token=${TOKEN}`

async function trelloFetch(path, options = {}) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`https://api.trello.com/1${path}${sep}${auth()}`, options)
  if (!res.ok) {
    throw new Error(`Trello API ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

// Listas del tablero, en orden de flujo
export const LISTS = {
  backlog: null,
  porHacer: null,
  enProgreso: null,
  enRevision: null,
  hecho: null,
}

let listCache = null
let labelCache = null

async function getLists() {
  if (listCache) return listCache
  const lists = await trelloFetch(`/boards/${BOARD_ID}/lists?fields=name,id`)
  listCache = lists
  return lists
}

async function getLabels() {
  if (labelCache) return labelCache
  const labels = await trelloFetch(`/boards/${BOARD_ID}/labels?fields=name,color`)
  labelCache = labels
  return labels
}

function findByLooseName(items, name) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return items.find((i) => norm(i.name).includes(norm(name)))
}

/** Busca el label de un agente por nombre parcial (ej: "ricardo", "Mateo (Media Buyer)") */
export async function findAgentLabel(agentName) {
  const labels = await getLabels()
  const label = findByLooseName(labels, agentName)
  if (!label) throw new Error(`No existe label para el agente "${agentName}"`)
  return label
}

/** Busca una lista (columna) por nombre parcial (ej: "por hacer", "hecho") */
export async function findList(listName) {
  const lists = await getLists()
  const list = findByLooseName(lists, listName)
  if (!list) throw new Error(`No existe la lista "${listName}"`)
  return list
}

/**
 * Crea una tarea asignada a un agente.
 * @param {string} agentName - ej "Mateo", debe matchear el nombre del label
 * @param {string} title
 * @param {object} opts - { desc, list = 'Por hacer', due }
 */
export async function createTask(agentName, title, opts = {}) {
  const { desc = '', list = 'Por hacer', due = null } = opts
  const [label, targetList] = await Promise.all([findAgentLabel(agentName), findList(list)])

  const params = new URLSearchParams({
    name: title,
    desc,
    idList: targetList.id,
    idLabels: label.id,
  })
  if (due) params.set('due', due)

  return trelloFetch(`/cards?${params.toString()}`, { method: 'POST' })
}

/** Lista las tareas asignadas a un agente, en cualquier columna */
export async function getTasksForAgent(agentName) {
  const label = await findAgentLabel(agentName)
  const cards = await trelloFetch(
    `/boards/${BOARD_ID}/cards?fields=name,desc,due,idList,idLabels&idLabels=${label.id}`
  )
  const lists = await getLists()
  const listById = Object.fromEntries(lists.map((l) => [l.id, l.name]))
  return cards.map((c) => ({ ...c, listName: listById[c.idList] }))
}

/** Mueve una tarjeta a otra columna (ej al terminarla: 'Hecho') */
export async function moveTask(cardId, listName) {
  const targetList = await findList(listName)
  return trelloFetch(`/cards/${cardId}?idList=${targetList.id}`, { method: 'PUT' })
}

/** Marca una tarjeta como completada (checkbox verde, sin moverla de columna) */
export async function completeTask(cardId) {
  return trelloFetch(`/cards/${cardId}?dueComplete=true`, { method: 'PUT' })
}
