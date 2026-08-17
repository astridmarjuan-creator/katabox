import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('tags').select('*').order('name')
    if (!error) setTags(data)
    setLoading(false)
    return { data, error }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function suggest(query, limit = 8, exclude = []) {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const excludeIds = new Set(exclude)
    return tags
      .filter((t) => !excludeIds.has(t.id) && t.name.toLowerCase().includes(q))
      .slice(0, limit)
  }

  /** Reuses an existing tag (case-insensitive) or creates a new one. */
  async function findOrCreateTag(name) {
    const trimmed = name.trim()
    if (!trimmed) return { error: new Error('Tag name is required') }
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return { data: existing }

    const { data, error } = await supabase.from('tags').insert({ name: trimmed }).select().single()
    if (error) {
      // Handle a race against another findOrCreateTag call / unique constraint hit.
      const { data: fallback } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', trimmed)
        .maybeSingle()
      if (fallback) return { data: fallback }
      return { error }
    }
    setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data }
  }

  return { tags, loading, refresh, suggest, findOrCreateTag }
}
