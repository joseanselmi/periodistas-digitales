'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Group = { id: number; name: string; category: string }

const CATEGORIES_LIST = ['clases', 'prompts', 'automatizaciones', 'bonus']

type ClaseData = {
  id?: number
  title?: string
  description?: string | null
  group_id?: number | null
  plan_required?: string
  video_url?: string | null
  slides_url?: string | null
  slides_json?: unknown
  audio_urls?: string[] | null
  status?: string
}

type Props = { groups: Group[]; clase?: ClaseData }

export default function ClaseForm({ groups: initialGroups, clase }: Props) {
  const router = useRouter()
  const isEditing = !!clase?.id

  const [title, setTitle] = useState(clase?.title ?? '')
  const [description, setDescription] = useState(clase?.description ?? '')
  const [groupId, setGroupId] = useState<string>(clase?.group_id?.toString() ?? '')
  const [plan, setPlan] = useState(clase?.plan_required ?? 'basic')
  const [videoUrl, setVideoUrl] = useState(clase?.video_url ?? '')
  const [slidesUrl, setSlidesUrl] = useState(clase?.slides_url ?? '')
  const [status, setStatus] = useState(clase?.status ?? 'draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [audioDone, setAudioDone] = useState(!!clase?.audio_urls?.length)
  const [audioError, setAudioError] = useState('')

  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupCategory, setNewGroupCategory] = useState('clases')
  const [savingGroup, setSavingGroup] = useState(false)

  async function createGroup() {
    if (!newGroupName.trim()) return
    setSavingGroup(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newGroupName.trim(), category: newGroupCategory, order_index: 0 })
      .select()
      .single()
    setSavingGroup(false)
    if (error || !data) return
    setGroups(prev => [...prev, data])
    setGroupId(String(data.id))
    setNewGroupName('')
    setShowNewGroup(false)
  }

  async function handleGenerateAudio() {
    setGeneratingAudio(true)
    setAudioError('')
    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: clase!.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setAudioDone(true)
      setSlidesUrl(data.slidesUrl)
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Error generando audio')
    } finally {
      setGeneratingAudio(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setSaving(true)
    setError('')

    const supabase = createClient()
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      group_id: groupId ? parseInt(groupId) : null,
      plan_required: plan,
      video_url: videoUrl.trim() || null,
      slides_url: slidesUrl.trim() || null,
      status,
    }

    if (isEditing) {
      const { error } = await supabase.from('classes').update(payload).eq('id', clase.id!)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('classes').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">{isEditing ? 'Editar clase' : 'Nueva clase'}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Título *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Cómo usar Claude para investigar"
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Breve descripción de la clase..."
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          {/* Grupo y Plan en fila */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Grupo</label>
              <select
                value={groupId}
                onChange={e => {
                  if (e.target.value === '__new__') {
                    setShowNewGroup(true)
                    setGroupId('')
                  } else {
                    setGroupId(e.target.value)
                    setShowNewGroup(false)
                  }
                }}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
              >
                <option value="">Sin grupo</option>
                {CATEGORIES_LIST.map(cat => (
                  <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                    {groups.filter(g => g.category === cat).map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="__new__">+ Crear nuevo grupo…</option>
              </select>
              {showNewGroup && (
                <div className="mt-2 p-3 bg-slate-900 border border-cyan-400/30 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre del grupo"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createGroup()}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <select
                    value={newGroupCategory}
                    onChange={e => setNewGroupCategory(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {CATEGORIES_LIST.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createGroup}
                      disabled={savingGroup || !newGroupName.trim()}
                      className="flex-1 py-1.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#020617] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {savingGroup ? 'Creando…' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewGroup(false); setNewGroupName('') }}
                      className="px-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Plan requerido</label>
              <select
                value={plan}
                onChange={e => setPlan(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
              >
                <option value="basic">Basic (gratis)</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">ID de video YouTube</label>
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="Ej: dQw4w9WgXcQ (solo el ID, no la URL completa)"
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Slides URL */}
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">URL de slides (Supabase Storage)</label>
            <input
              value={slidesUrl}
              onChange={e => setSlidesUrl(e.target.value)}
              placeholder="https://...supabase.co/storage/v1/object/public/slides/..."
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Estado</label>
            <div className="flex gap-3">
              {(['draft', 'published'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    status === s
                      ? s === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'draft' ? 'Borrador' : 'Publicada'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#020617] font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear clase'}
            </button>
            {isEditing && clase?.id && (
              <Link
                href={`/preview/${clase.id}`}
                target="_blank"
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver preview
              </Link>
            )}
            <Link href="/admin" className="text-slate-400 hover:text-white text-sm transition-colors">
              Cancelar
            </Link>
          </div>
        </form>

        {/* Panel de audio — solo en edición con slides_json */}
        {isEditing && !!clase?.slides_json && (
          <div className="mt-8 border-t border-slate-800 pt-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-white font-medium text-sm">Narración con IA</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  ElevenLabs genera audio por cada slide usando el campo <code className="text-slate-400">notes</code>.
                </p>
              </div>
              {audioDone && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Audio generado
                </span>
              )}
            </div>

            {audioError && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">
                {audioError}
              </p>
            )}

            <button
              onClick={handleGenerateAudio}
              disabled={generatingAudio}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              {generatingAudio ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generando audio...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 9.5v5m0 0l-2-2m2 2l2-2M9.172 16.828a4 4 0 010-5.656" />
                  </svg>
                  {audioDone ? 'Regenerar audio' : 'Generar audio con ElevenLabs'}
                </>
              )}
            </button>
            {generatingAudio && (
              <p className="text-slate-500 text-xs mt-2">
                Esto puede tardar 30-60 segundos dependiendo de la cantidad de slides.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
