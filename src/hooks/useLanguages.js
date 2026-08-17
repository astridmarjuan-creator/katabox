import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export const LANGUAGE_PALETTE = [
  '#3366ff', '#e0554f', '#1fa37c', '#c2793a', '#8b5cf6',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5',
]

export function useLanguages() {
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('languages').select('*').order('name')
    if (!error) setLanguages(data)
    setLoading(false)
    return { data, error }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addLanguage(name) {
    const trimmed = name.trim()
    if (!trimmed) return { error: new Error('Name is required') }
    if (languages.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      return { error: new Error(`"${trimmed}" already exists`) }
    }
    const color = LANGUAGE_PALETTE[languages.length % LANGUAGE_PALETTE.length]
    const { data, error } = await supabase
      .from('languages')
      .insert({ name: trimmed, color })
      .select()
      .single()
    if (!error) {
      setLanguages((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return { data, error }
  }

  async function renameLanguage(id, name) {
    const { data, error } = await supabase
      .from('languages')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setLanguages((prev) =>
        prev.map((l) => (l.id === id ? data : l)).sort((a, b) => a.name.localeCompare(b.name)),
      )
    }
    return { data, error }
  }

  async function deleteLanguage(id) {
    const { error } = await supabase.from('languages').delete().eq('id', id)
    if (!error) setLanguages((prev) => prev.filter((l) => l.id !== id))
    return { error }
  }

  return { languages, loading, refresh, addLanguage, renameLanguage, deleteLanguage }
}
