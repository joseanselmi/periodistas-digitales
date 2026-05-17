'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type User = { id: string; email: string; plan: string; created_at: string }
type Class = { id: number; title: string; status: string; plan_required: string; group_id: number | null; groups: { id: number; name: string; category: string } | null }
type Group = { id: number; name: string; category: string; order_index: number }
type Task = { id: number; text: string; done: boolean; priority: string; category: string; created_at: string }

type Props = {
  users: User[]
  classes: Class[]
  groups: Group[]
  tasks: Task[]
  totalWatches: number
}

const PRIORITY_STYLES: Record<string, string> = {
  high:   'bg-red-500/20 text-red-300 border-red-500/30',
  normal: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
  low:    'bg-slate-800/50 text-slate-500 border-slate-700/30',
}

const CATEGORY_DOT: Record<string, string> = {
  contenido:  'bg-cyan-400',
  plataforma: 'bg-violet-400',
  marketing:  'bg-amber-400',
  general:    'bg-slate-500',
}

const QUICK_ACTIONS = [
  { label: 'Generar clase con IA', href: '/admin/generar-clase', color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/10' },
  { label: 'Nueva clase manual',   href: '/admin/nueva-clase',   color: 'text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-800' },
  { label: 'Grupos y módulos',     href: '/admin/grupos',        color: 'text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-800' },
  { label: 'Links de acceso',      href: '/admin/accesos',       color: 'text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-800' },
  { label: 'Usuarios y clases',    href: '/admin/usuarios',      color: 'text-slate-300 border-slate-700 bg-slate-800/40 hover:bg-slate-800' },
  { label: 'Prompts',              href: '/admin/prompts',       color: 'text-violet-300 border-violet-400/20 bg-violet-400/5 hover:bg-violet-400/10' },
]

export default function CerebroClient({ users, classes, groups, tasks: initialTasks, totalWatches }: Props) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [newPriority, setNewPriority] = useState('normal')
  const [newCategory, setNewCategory] = useState('contenido')
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done'>('pending')
  const [addingTask, setAddingTask] = useState(false)

  // ── KPIs ──
  const now = Date.now()
  const d7  = now - 7  * 86400000
  const d30 = now - 30 * 86400000

  const totalUsers  = users.length
  const proUsers    = users.filter(u => u.plan === 'pro').length
  const newLast7    = users.filter(u => new Date(u.created_at).getTime() > d7).length
  const newLast30   = users.filter(u => new Date(u.created_at).getTime() > d30).length

  const published = classes.filter(c => c.status === 'published').length
  const drafts    = classes.filter(c => c.status === 'draft').length

  const pendingTasks = tasks.filter(t => !t.done).length
  const doneTasks    = tasks.filter(t => t.done).length

  // ── Estado del curriculum ──
  const groupsWithClasses = groups.map(g => {
    const gc = classes.filter(c => c.groups?.id === g.id)
    return {
      ...g,
      total:     gc.length,
      published: gc.filter(c => c.status === 'published').length,
      drafts:    gc.filter(c => c.status === 'draft').length,
    }
  }).filter(g => g.category === 'clases').sort((a, b) => a.order_index - b.order_index)

  // ── Task actions ──
  async function addTask() {
    if (!newTask.trim()) return
    setAddingTask(true)
    const { data, error } = await supabase
      .from('admin_tasks')
      .insert({ text: newTask.trim(), priority: newPriority, category: newCategory })
      .select()
      .single()
    setAddingTask(false)
    if (!error && data) {
      setTasks(prev => [data as Task, ...prev])
      setNewTask('')
    }
  }

  async function toggleTask(task: Task) {
    const done = !task.done
    await supabase
      .from('admin_tasks')
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done } : t))
  }

  async function deleteTask(id: number) {
    await supabase.from('admin_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t =>
    taskFilter === 'all'     ? true :
    taskFilter === 'pending' ? !t.done :
    t.done
  ).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const p: Record<string, number> = { high: 0, normal: 1, low: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  // ── Últimos usuarios ──
  const recentUsers = users.slice(0, 8)

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-7 rounded-full bg-cyan-400" />
          <h1 className="text-2xl font-bold text-white">Cerebro</h1>
        </div>
        <p className="text-slate-500 text-sm ml-5">Centro de comando — estado completo de Leadr</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Usuarios totales', value: totalUsers, sub: `+${newLast30} este mes`, color: 'text-white', accent: 'border-slate-800' },
          { label: 'Plan Pro',          value: proUsers,   sub: `${Math.round(proUsers / Math.max(totalUsers, 1) * 100)}% del total`, color: 'text-violet-400', accent: 'border-violet-500/20' },
          { label: 'Nuevos (7 días)',   value: newLast7,   sub: `${newLast30} en 30 días`, color: 'text-cyan-400', accent: 'border-cyan-500/20' },
          { label: 'Clases vistas',     value: totalWatches, sub: `${published} publicadas · ${drafts} borradores`, color: 'text-emerald-400', accent: 'border-emerald-500/20' },
        ].map(k => (
          <div key={k.label} className={`bg-[#0A0F1E] border ${k.accent} rounded-xl p-5`}>
            <p className="text-slate-500 text-xs mb-2">{k.label}</p>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-slate-600 text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Tareas pendientes ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Tareas</h2>
                <p className="text-slate-600 text-xs mt-0.5">{pendingTasks} pendientes · {doneTasks} completadas</p>
              </div>
              <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
                {([
                  { key: 'pending', label: 'Pendientes' },
                  { key: 'done',    label: 'Hechas' },
                  { key: 'all',     label: 'Todas' },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setTaskFilter(f.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      taskFilter === f.key ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nueva tarea…"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="high">🔴 Alta</option>
                <option value="normal">⚪ Normal</option>
                <option value="low">🔵 Baja</option>
              </select>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="contenido">Contenido</option>
                <option value="plataforma">Plataforma</option>
                <option value="marketing">Marketing</option>
                <option value="general">General</option>
              </select>
              <button
                onClick={addTask}
                disabled={addingTask || !newTask.trim()}
                className="px-3 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#020617] font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredTasks.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-8">
                  {taskFilter === 'done' ? 'Ninguna tarea completada todavía.' : 'No hay tareas pendientes. ¡Todo al día!'}
                </p>
              )}
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    task.done
                      ? 'bg-slate-900/40 border-slate-800/50 opacity-50'
                      : PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.normal
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                      task.done
                        ? 'bg-emerald-500 border-emerald-500'
                        : task.priority === 'high'
                          ? 'border-red-400 hover:bg-red-500/20'
                          : 'border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {task.done && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${task.done ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_DOT[task.category] ?? 'bg-slate-500'}`} />
                      <span className="text-slate-600 text-xs capitalize">{task.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-700 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Estado del curriculum ── */}
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Estado del curriculum</h2>
            <div className="space-y-2">
              {groupsWithClasses.map(g => {
                const pct = g.total > 0 ? Math.round((g.published / g.total) * 100) : 0
                const isEmpty = g.total === 0
                return (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0">
                      <p className={`text-xs truncate ${isEmpty ? 'text-slate-600' : 'text-slate-300'}`}>{g.name}</p>
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-28 flex-shrink-0 flex items-center gap-2">
                      <span className="text-xs text-slate-500 tabular-nums">{g.published}/{g.total}</span>
                      {g.drafts > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full">
                          {g.drafts} borrador{g.drafts > 1 ? 'es' : ''}
                        </span>
                      )}
                      {isEmpty && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded-full">vacío</span>
                      )}
                    </div>
                    <Link
                      href={`/admin/grupos`}
                      className="text-slate-700 hover:text-cyan-400 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="space-y-4">

          {/* Acciones rápidas */}
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${a.color}`}
                >
                  {a.label}
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Últimos usuarios */}
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Últimos usuarios</h2>
              <Link href="/admin/usuarios" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-2">
              {recentUsers.map(u => {
                const isNew = new Date(u.created_at).getTime() > d7
                return (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">{u.email[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isNew && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 rounded-full font-medium">nuevo</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        u.plan === 'pro'
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {u.plan}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resumen de contenido */}
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Contenido</h2>
            <div className="space-y-3">
              {[
                { label: 'Clases publicadas', value: published, color: 'text-emerald-400' },
                { label: 'Borradores',         value: drafts,    color: 'text-amber-400' },
                { label: 'Módulos activos',    value: groupsWithClasses.filter(g => g.published > 0).length, color: 'text-cyan-400' },
                { label: 'Módulos vacíos',     value: groupsWithClasses.filter(g => g.total === 0).length,   color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">{s.label}</span>
                  <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
