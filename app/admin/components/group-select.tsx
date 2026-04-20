'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Group = { id: number; name: string; category: string }

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']
const CATEGORY_ICONS: Record<string, string> = {
  clases: '📚',
  prompts: '⚡',
  automatizaciones: '🤖',
  bonus: '🎁',
}

type Props = {
  groups: Group[]
  value: string
  onChange: (id: string) => void
  onGroupCreated?: (group: Group) => void
}

export default function GroupSelect({ groups: initialGroups, value, onChange, onGroupCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('clases')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = groups.find(g => String(g.id) === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowCreate(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function createGroup() {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newName.trim(), category: newCategory, order_index: 0 })
      .select()
      .single()
    setSaving(false)
    if (error || !data) return
    const newGroup = data as Group
    setGroups(prev => [...prev, newGroup])
    onChange(String(newGroup.id))
    onGroupCreated?.(newGroup)
    setNewName('')
    setShowCreate(false)
    setOpen(false)
  }

  function selectGroup(id: string) {
    onChange(id)
    setOpen(false)
    setShowCreate(false)
  }

  const grouped = CATEGORIES.map(cat => ({
    cat,
    items: groups.filter(g => g.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setShowCreate(false) }}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
          open
            ? 'bg-slate-800 border-cyan-400/60 text-white'
            : 'bg-[#0F172A] border-slate-700 text-white hover:border-slate-500'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="text-base">{CATEGORY_ICONS[selected.category] ?? '📁'}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-slate-400">Sin grupo</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Sin grupo */}
          <button
            type="button"
            onClick={() => selectGroup('')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left hover:bg-slate-800 ${
              !value ? 'text-white bg-slate-800/60' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-slate-700 flex items-center justify-center text-xs">—</span>
            Sin grupo
            {!value && (
              <svg className="w-3.5 h-3.5 ml-auto text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Groups by category */}
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <div className="px-4 pt-2 pb-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </span>
              </div>
              {items.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => selectGroup(String(g.id))}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left hover:bg-slate-800 ${
                    String(g.id) === value ? 'text-white bg-slate-800/60' : 'text-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${String(g.id) === value ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span className="truncate">{g.name}</span>
                  {String(g.id) === value && (
                    <svg className="w-3.5 h-3.5 ml-auto text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* Divider + create */}
          <div className="border-t border-slate-800 mt-1">
            {!showCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-400/10 transition-colors cursor-pointer"
              >
                <span className="w-5 h-5 rounded-md bg-cyan-400/15 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Crear nuevo grupo
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nombre del grupo"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createGroup() } if (e.key === 'Escape') setShowCreate(false) }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategory(c)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        newCategory === c
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40'
                          : 'bg-slate-800 text-slate-400 border border-transparent hover:text-white'
                      }`}
                    >
                      {CATEGORY_ICONS[c]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={createGroup}
                    disabled={saving || !newName.trim()}
                    className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#020617] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {saving ? 'Creando…' : 'Crear grupo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setNewName('') }}
                    className="px-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
