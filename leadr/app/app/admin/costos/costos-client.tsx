'use client'

import { useEffect, useState } from 'react'

interface Cost {
  id: string
  service: string
  category: string
  amount: number
  currency: string
  month: string
  notes: string | null
}

const CATEGORIES = ['IA', 'Infraestructura', 'Publicidad', 'Herramientas', 'Otros']

const CATEGORY_COLORS: Record<string, string> = {
  'IA':              'bg-violet-400/10 text-violet-300 border-violet-400/20',
  'Infraestructura': 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  'Publicidad':      'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'Herramientas':    'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  'Otros':           'bg-slate-400/10 text-slate-300 border-slate-400/20',
}

const CATEGORY_DOT: Record<string, string> = {
  'IA':              'bg-violet-400',
  'Infraestructura': 'bg-cyan-400',
  'Publicidad':      'bg-amber-400',
  'Herramientas':    'bg-emerald-400',
  'Otros':           'bg-slate-400',
}

function toMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${months[parseInt(m) - 1]} ${y}`
}

const EMPTY_FORM = { service: '', category: 'IA', amount: '', currency: 'USD', notes: '' }

export default function CostosClient() {
  const now = new Date()
  const [month, setMonth] = useState(toMonthParam(now))
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load(m: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/costs?month=${m}`)
    const data = await res.json()
    setCosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load(month) }, [month])

  function prevMonth() {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setMonth(toMonthParam(d))
  }

  function nextMonth() {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m, 1)
    setMonth(toMonthParam(d))
  }

  const total = costs.reduce((s, c) => s + Number(c.amount), 0)

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    items: costs.filter(c => c.category === cat),
    subtotal: costs.filter(c => c.category === cat).reduce((s, c) => s + Number(c.amount), 0),
  })).filter(g => g.items.length > 0)

  function openNew() {
    setForm({ ...EMPTY_FORM })
    setEditId(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(c: Cost) {
    setForm({
      service: c.service,
      category: c.category,
      amount: String(c.amount),
      currency: c.currency,
      notes: c.notes ?? '',
    })
    setEditId(c.id)
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.service.trim()) { setError('El servicio es requerido'); return }
    if (form.amount === '' || isNaN(Number(form.amount))) { setError('Monto inválido'); return }

    setSaving(true)
    setError('')

    const payload = {
      service: form.service.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      currency: form.currency,
      month,
      notes: form.notes.trim() || null,
    }

    try {
      const url = editId ? `/api/admin/costs/${editId}` : '/api/admin/costs'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Error al guardar')
        return
      }
      setShowForm(false)
      setEditId(null)
      await load(month)
    } catch {
      setError('Error de red')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    await fetch(`/api/admin/costs/${id}`, { method: 'DELETE' })
    await load(month)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Costos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gastos operativos mensuales de Leadr</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black text-sm font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar gasto
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold text-base min-w-36 text-center">{formatMonth(month)}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm py-16 text-center">Cargando...</div>
      ) : (
        <>
          {/* Total card */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total mensual</p>
              <p className="text-3xl font-bold text-white">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-slate-500 text-base font-normal ml-2">USD</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {byCategory.map(({ cat, subtotal }) => (
                <div key={cat} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Otros']}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[cat] ?? CATEGORY_DOT['Otros']}`} />
                  {cat} · ${subtotal.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          {/* Costs by category */}
          {costs.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Sin gastos para este mes</p>
              <button onClick={openNew} className="mt-3 text-cyan-400 text-sm hover:underline">Agregar el primero</button>
            </div>
          ) : (
            <div className="space-y-4">
              {byCategory.map(({ cat, items, subtotal }) => (
                <div key={cat} className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat] ?? CATEGORY_DOT['Otros']}`} />
                      <span className="text-sm font-semibold text-white">{cat}</span>
                    </div>
                    <span className="text-sm text-slate-400">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {items.map(cost => (
                      <div key={cost.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-800/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{cost.service}</p>
                          {cost.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{cost.notes}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-white">
                            ${Number(cost.amount).toFixed(2)}
                            <span className="text-slate-600 text-xs ml-1">{cost.currency}</span>
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEdit(cost)}
                            className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cost.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d1120] border border-slate-700/60 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">{editId ? 'Editar gasto' : 'Nuevo gasto'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Servicio</label>
                <input
                  type="text"
                  value={form.service}
                  onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                  placeholder="ej. Claude API, Vercel..."
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Moneda</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Monto</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Notas <span className="text-slate-600">(opcional)</span></label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Descripción o contexto..."
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:text-white hover:border-slate-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
