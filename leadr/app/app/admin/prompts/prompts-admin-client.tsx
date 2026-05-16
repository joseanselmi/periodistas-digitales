'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Variable = { name: string; description: string }

type Prompt = {
  id: number
  title: string
  description: string
  objective: string
  use_case: string
  tool: string
  difficulty: string
  time_estimate: string
  prompt_text: string
  variables: Variable[]
  why_it_works: string | null
  how_to_use: string | null
  example_output: string | null
  limitations: string | null
  related_ids: number[]
  module_slug: string | null
  status: string
  order_index: number
}

const USE_CASES = [
  { value: 'investigacion',  label: 'Investigación y OSINT' },
  { value: 'redaccion',     label: 'Redacción y edición' },
  { value: 'verificacion',  label: 'Verificación y fact-checking' },
  { value: 'redes',         label: 'Redes sociales y distribución' },
  { value: 'multimedia',    label: 'Video, imagen y multimedia' },
  { value: 'automatizacion',label: 'Automatización de flujos' },
]

const TOOLS = [
  { value: 'claude',     label: 'Claude' },
  { value: 'chatgpt',   label: 'ChatGPT' },
  { value: 'gemini',    label: 'Gemini' },
  { value: 'perplexity',label: 'Perplexity' },
  { value: 'veo',       label: 'Veo' },
  { value: 'otro',      label: 'Otro' },
]

const DIFFICULTIES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio',   label: 'Intermedio' },
  { value: 'avanzado',     label: 'Avanzado' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  objective: '',
  use_case: 'investigacion',
  tool: 'claude',
  difficulty: 'principiante',
  time_estimate: '10 min',
  prompt_text: '',
  variables: [] as Variable[],
  why_it_works: '',
  how_to_use: '',
  example_output: '',
  limitations: '',
  module_slug: '',
  order_index: 0,
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const USE_CASE_LABELS: Record<string, string> = {
  investigacion:  'Investigación',
  redaccion:      'Redacción',
  verificacion:   'Verificación',
  redes:          'Redes',
  multimedia:     'Multimedia',
  automatizacion: 'Automatización',
}

const TOOL_STYLES: Record<string, string> = {
  claude:     'bg-orange-500/15 text-orange-300',
  chatgpt:    'bg-emerald-500/15 text-emerald-300',
  gemini:     'bg-blue-500/15 text-blue-300',
  perplexity: 'bg-cyan-500/15 text-cyan-300',
  veo:        'bg-violet-500/15 text-violet-300',
  otro:       'bg-slate-500/15 text-slate-300',
}

function PromptForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY_FORM
  onSave: (data: typeof EMPTY_FORM) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)

  function set(key: keyof typeof EMPTY_FORM, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addVariable() {
    set('variables', [...form.variables, { name: '', description: '' }])
  }

  function updateVariable(i: number, field: keyof Variable, value: string) {
    const vars = form.variables.map((v, idx) =>
      idx === i ? { ...v, [field]: value } : v
    )
    set('variables', vars)
  }

  function removeVariable(i: number) {
    set('variables', form.variables.filter((_, idx) => idx !== i))
  }

  const inputCls = 'w-full bg-[#0A0F1E] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors'
  const labelCls = 'block text-slate-400 text-xs font-medium mb-1.5'

  return (
    <div className="space-y-5">
      {/* Fila 1: título */}
      <div>
        <label className={labelCls}>Título *</label>
        <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Investigar fuentes con Claude en 5 minutos" />
      </div>

      {/* Fila 2: descripción */}
      <div>
        <label className={labelCls}>Descripción corta *</label>
        <input className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Una línea. Qué resuelve este prompt." />
      </div>

      {/* Fila 3: objetivo */}
      <div>
        <label className={labelCls}>Objetivo *</label>
        <input className={inputCls} value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="Qué logra el periodista al usarlo" />
      </div>

      {/* Fila 4: selects en grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Caso de uso *</label>
          <select className={inputCls} value={form.use_case} onChange={e => set('use_case', e.target.value)}>
            {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Herramienta *</label>
          <select className={inputCls} value={form.tool} onChange={e => set('tool', e.target.value)}>
            {TOOLS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Dificultad</label>
          <select className={inputCls} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tiempo estimado</label>
          <input className={inputCls} value={form.time_estimate} onChange={e => set('time_estimate', e.target.value)} placeholder="10 min" />
        </div>
        <div>
          <label className={labelCls}>Módulo vinculado</label>
          <input className={inputCls} value={form.module_slug ?? ''} onChange={e => set('module_slug', e.target.value)} placeholder="Ej: notebooklm" />
        </div>
        <div>
          <label className={labelCls}>Orden</label>
          <input type="number" className={inputCls} value={form.order_index} onChange={e => set('order_index', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      {/* El prompt */}
      <div>
        <label className={labelCls}>El prompt *</label>
        <textarea
          className={`${inputCls} font-mono min-h-[140px] resize-y`}
          value={form.prompt_text}
          onChange={e => set('prompt_text', e.target.value)}
          placeholder="Escribí el prompt completo. Usá [VARIABLE] para los placeholders."
        />
      </div>

      {/* Variables */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls}>Variables (placeholders)</label>
          <button
            type="button"
            onClick={addVariable}
            className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar variable
          </button>
        </div>
        {form.variables.length > 0 && (
          <div className="space-y-2">
            {form.variables.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  className={`${inputCls} flex-1 font-mono`}
                  value={v.name}
                  onChange={e => updateVariable(i, 'name', e.target.value)}
                  placeholder="[TEMA]"
                />
                <input
                  className={`${inputCls} flex-[2]`}
                  value={v.description}
                  onChange={e => updateVariable(i, 'description', e.target.value)}
                  placeholder="El tema que estás cubriendo"
                />
                <button
                  type="button"
                  onClick={() => removeVariable(i)}
                  className="p-2 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Por qué funciona */}
      <div>
        <label className={labelCls}>Por qué funciona</label>
        <textarea
          className={`${inputCls} min-h-[80px] resize-y`}
          value={form.why_it_works ?? ''}
          onChange={e => set('why_it_works', e.target.value)}
          placeholder="2-3 líneas explicando la lógica detrás del prompt"
        />
      </div>

      {/* Cómo usarlo */}
      <div>
        <label className={labelCls}>Cómo usarlo paso a paso</label>
        <textarea
          className={`${inputCls} min-h-[100px] resize-y`}
          value={form.how_to_use ?? ''}
          onChange={e => set('how_to_use', e.target.value)}
          placeholder="1. Abrí Claude&#10;2. Pegá el prompt&#10;3. Completá [TEMA] con..."
        />
      </div>

      {/* Ejemplo de output */}
      <div>
        <label className={labelCls}>Ejemplo de output</label>
        <textarea
          className={`${inputCls} min-h-[100px] resize-y`}
          value={form.example_output ?? ''}
          onChange={e => set('example_output', e.target.value)}
          placeholder="Mostrá qué debería obtener el periodista al usar este prompt"
        />
      </div>

      {/* Limitaciones */}
      <div>
        <label className={labelCls}>Limitaciones / cuándo NO usar</label>
        <textarea
          className={`${inputCls} min-h-[70px] resize-y`}
          value={form.limitations ?? ''}
          onChange={e => set('limitations', e.target.value)}
          placeholder="Cuándo este prompt no aplica o puede fallar"
        />
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.title || !form.prompt_text}
          className="px-5 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {saving ? 'Guardando…' : 'Guardar prompt'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function PromptsAdminClient({ prompts: initial }: { prompts: Prompt[] }) {
  const router = useRouter()
  const [prompts, setPrompts] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [ucFilter, setUcFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Prompt | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = prompts.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter
    const matchUC = ucFilter === 'all' || p.use_case === ucFilter
    return matchStatus && matchUC
  })

  async function handleSave(form: typeof EMPTY_FORM) {
    setSaving(true)
    const supabase = createClient()
    const payload = {
      title: form.title,
      description: form.description,
      objective: form.objective,
      use_case: form.use_case,
      tool: form.tool,
      difficulty: form.difficulty,
      time_estimate: form.time_estimate,
      prompt_text: form.prompt_text,
      variables: form.variables,
      why_it_works: form.why_it_works || null,
      how_to_use: form.how_to_use || null,
      example_output: form.example_output || null,
      limitations: form.limitations || null,
      module_slug: form.module_slug || null,
      order_index: form.order_index,
    }

    if (editing) {
      const { data } = await supabase.from('prompts').update(payload).eq('id', editing.id).select().single()
      if (data) setPrompts(ps => ps.map(p => p.id === editing.id ? { ...p, ...data } : p))
      showToast('Prompt actualizado')
    } else {
      const { data } = await supabase.from('prompts').insert({ ...payload, status: 'draft' }).select().single()
      if (data) setPrompts(ps => [data, ...ps])
      showToast('Prompt creado como borrador')
    }

    setSaving(false)
    setShowForm(false)
    setEditing(null)
  }

  async function toggleStatus(p: Prompt) {
    const supabase = createClient()
    const newStatus = p.status === 'published' ? 'draft' : 'published'
    await supabase.from('prompts').update({ status: newStatus }).eq('id', p.id)
    setPrompts(ps => ps.map(x => x.id === p.id ? { ...x, status: newStatus } : x))
    showToast(newStatus === 'published' ? 'Prompt publicado' : 'Movido a borrador')
    router.refresh()
  }

  async function deletePrompt(p: Prompt) {
    if (!confirm(`¿Eliminar "${p.title}"?`)) return
    const supabase = createClient()
    await supabase.from('prompts').delete().eq('id', p.id)
    setPrompts(ps => ps.filter(x => x.id !== p.id))
    showToast('Prompt eliminado')
  }

  function startEdit(p: Prompt) {
    setEditing(p)
    setShowForm(true)
  }

  const formInitial = editing
    ? {
        title: editing.title,
        description: editing.description,
        objective: editing.objective,
        use_case: editing.use_case,
        tool: editing.tool,
        difficulty: editing.difficulty,
        time_estimate: editing.time_estimate,
        prompt_text: editing.prompt_text,
        variables: editing.variables ?? [],
        why_it_works: editing.why_it_works ?? '',
        how_to_use: editing.how_to_use ?? '',
        example_output: editing.example_output ?? '',
        limitations: editing.limitations ?? '',
        module_slug: editing.module_slug ?? '',
        order_index: editing.order_index,
      }
    : EMPTY_FORM

  return (
    <div className="text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Prompts</h1>
            <p className="text-slate-400 text-sm mt-1">
              {prompts.filter(p => p.status === 'published').length} publicados ·{' '}
              {prompts.filter(p => p.status === 'draft').length} borradores
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setEditing(null); setShowForm(true) }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo prompt
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-[#0F172A] border border-violet-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">
              {editing ? `Editando: ${editing.title}` : 'Nuevo prompt'}
            </h2>
            <PromptForm
              key={editing?.id ?? 'new'}
              initial={formInitial}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null) }}
              saving={saving}
            />
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            {(['all', 'published', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filter === f ? 'bg-[#0F172A] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Borradores'}
              </button>
            ))}
          </div>
          <select
            value={ucFilter}
            onChange={e => setUcFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-slate-600 cursor-pointer"
          >
            <option value="all">Todos los casos de uso</option>
            {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              {prompts.length === 0
                ? <>No hay prompts todavía. <button onClick={() => setShowForm(true)} className="text-violet-400 hover:underline cursor-pointer">Crear el primero</button></>
                : 'No hay prompts con ese filtro.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Título</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Herramienta</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{p.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{p.description}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-slate-400 text-xs">{USE_CASE_LABELS[p.use_case] ?? p.use_case}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TOOL_STYLES[p.tool]}`}>
                        {p.tool === 'chatgpt' ? 'ChatGPT' : p.tool.charAt(0).toUpperCase() + p.tool.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status]}`}>
                        {p.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(p)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                        >
                          {p.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-violet-300 hover:border-violet-500/40 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletePrompt(p)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
