'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { BonusItem } from '@/app/dashboard/bonus-library'

const EMPTY_FORM = {
  title: '',
  description: '',
  why_read: '',
  group_name: '',
  order_index: 0,
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function BonusForm({
  initial,
  editingItem,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY_FORM
  editingItem: BonusItem | null
  onSave: (form: typeof EMPTY_FORM, file: File | null, coverFile: File | null) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  const [file, setFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const inputCls = 'w-full bg-[#0A0F1E] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors'
  const labelCls = 'block text-slate-400 text-xs font-medium mb-1.5'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Título *</label>
          <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: El Periodista Digital" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Descripción corta *</label>
          <input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Una o dos líneas sobre el recurso" />
        </div>
        <div>
          <label className={labelCls}>Grupo / Categoría *</label>
          <input className={inputCls} value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} placeholder="Ej: Libros, Guías, Plantillas" />
        </div>
        <div>
          <label className={labelCls}>Orden</label>
          <input type="number" className={inputCls} value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Por qué tienen que leerlo / usarlo</label>
        <textarea
          className={`${inputCls} min-h-[120px] resize-y`}
          value={form.why_read}
          onChange={e => setForm(f => ({ ...f, why_read: e.target.value }))}
          placeholder="Explicá el valor del recurso: qué aprenden, cómo les cambia el trabajo, por qué es imprescindible para un periodista digital."
        />
      </div>

      {/* Upload archivo principal */}
      <div>
        <label className={labelCls}>Archivo para descargar (PDF, ZIP, etc.)</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
        >
          {file ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          ) : editingItem?.file_name ? (
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">Archivo actual: <span className="text-white">{editingItem.file_name}</span></p>
              <p className="text-slate-600 text-xs">Hacé clic para reemplazar</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-8 h-8 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-slate-500 text-sm">Hacé clic para subir el archivo</p>
              <p className="text-slate-700 text-xs">PDF, ZIP, EPUB, DOCX — hasta 50MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.zip,.epub,.docx,.xlsx,.pptx" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      </div>

      {/* Upload portada */}
      <div>
        <label className={labelCls}>Imagen de portada (opcional)</label>
        <div
          onClick={() => coverRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer transition-colors"
        >
          {coverFile ? (
            <p className="text-slate-300 text-sm">{coverFile.name}</p>
          ) : editingItem?.cover_url ? (
            <div className="flex items-center justify-center gap-3">
              <img src={editingItem.cover_url} alt="" className="h-12 w-auto rounded object-cover" />
              <p className="text-slate-600 text-xs">Hacé clic para reemplazar</p>
            </div>
          ) : (
            <p className="text-slate-600 text-sm">Subí la tapa del libro o una imagen representativa (JPG, PNG, WebP)</p>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSave(form, file, coverFile)}
          disabled={saving || !form.title || !form.group_name}
          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function BonusAdminClient({ items: initial }: { items: BonusItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BonusItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function uploadFile(file: File, folder: string) {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('bonus-files').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('bonus-files').getPublicUrl(data.path)
    return { publicUrl, fileName: file.name }
  }

  async function handleSave(form: typeof EMPTY_FORM, file: File | null, coverFile: File | null) {
    setSaving(true)
    const supabase = createClient()

    try {
      let file_url = editing?.file_url ?? null
      let file_name = editing?.file_name ?? null
      let cover_url = editing?.cover_url ?? null

      if (file) {
        const result = await uploadFile(file, 'files')
        file_url = result.publicUrl
        file_name = result.fileName
      }
      if (coverFile) {
        const result = await uploadFile(coverFile, 'covers')
        cover_url = result.publicUrl
      }

      const payload = {
        title: form.title,
        description: form.description,
        why_read: form.why_read || null,
        group_name: form.group_name,
        order_index: form.order_index,
        file_url,
        file_name,
        cover_url,
      }

      if (editing) {
        const { data } = await supabase.from('bonus_items').update(payload).eq('id', editing.id).select().single()
        if (data) setItems(ps => ps.map(p => p.id === editing.id ? { ...p, ...data } : p))
        showToast('Recurso actualizado')
      } else {
        const { data } = await supabase.from('bonus_items').insert({ ...payload, status: 'draft' }).select().single()
        if (data) setItems(ps => [data as BonusItem, ...ps])
        showToast('Recurso creado como borrador')
      }

      setShowForm(false)
      setEditing(null)
    } catch (e) {
      showToast('Error al guardar — revisá la consola')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(item: BonusItem) {
    const supabase = createClient()
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    await supabase.from('bonus_items').update({ status: newStatus }).eq('id', item.id)
    setItems(ps => ps.map(p => p.id === item.id ? { ...p, status: newStatus } : p))
    showToast(newStatus === 'published' ? 'Publicado' : 'Movido a borrador')
    router.refresh()
  }

  async function deleteItem(item: BonusItem) {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return
    const supabase = createClient()
    await supabase.from('bonus_items').delete().eq('id', item.id)
    setItems(ps => ps.filter(p => p.id !== item.id))
    showToast('Recurso eliminado')
  }

  const formInitial = editing
    ? { title: editing.title, description: editing.description, why_read: editing.why_read ?? '', group_name: editing.group_name, order_index: editing.order_index }
    : EMPTY_FORM

  return (
    <div className="text-white">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Bonus</h1>
            <p className="text-slate-400 text-sm mt-1">
              {items.filter(i => i.status === 'published').length} publicados · {items.filter(i => i.status === 'draft').length} borradores
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setEditing(null); setShowForm(true) }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo recurso
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-[#0F172A] border border-emerald-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">
              {editing ? `Editando: ${editing.title}` : 'Nuevo recurso'}
            </h2>
            <BonusForm
              key={editing?.id ?? 'new'}
              initial={formInitial}
              editingItem={editing}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null) }}
              saving={saving}
            />
          </div>
        )}

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No hay recursos todavía.{' '}
              <button onClick={() => setShowForm(true)} className="text-emerald-400 hover:underline cursor-pointer">Crear el primero</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Título</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Grupo</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Archivo</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-slate-400 text-xs">{item.group_name}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {item.file_name ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.file_name}
                        </span>
                      ) : (
                        <span className="text-slate-700 text-xs">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.status]}`}>
                        {item.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(item)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
                        >
                          {item.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => { setEditing(item); setShowForm(true) }}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteItem(item)}
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
