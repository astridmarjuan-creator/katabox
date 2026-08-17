import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const SELECT = `*, language:languages ( id, name, color )`

export function useTerms() {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('terms')
      .select(SELECT)
      .order('date_added', { ascending: false })
    if (error) setError(error)
    else {
      setError(null)
      setTerms(data)
    }
    setLoading(false)
    return { data, error }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createTerm(input) {
    const { data, error } = await supabase.from('terms').insert(input).select(SELECT).single()
    if (!error) setTerms((prev) => [data, ...prev])
    return { data, error }
  }

  async function updateTerm(id, input) {
    const { data, error } = await supabase
      .from('terms')
      .update(input)
      .eq('id', id)
      .select(SELECT)
      .single()
    if (!error) setTerms((prev) => prev.map((t) => (t.id === id ? data : t)))
    return { data, error }
  }

  async function deleteTerm(id) {
    const { error } = await supabase.from('terms').delete().eq('id', id)
    if (!error) setTerms((prev) => prev.filter((t) => t.id !== id))
    return { error }
  }

  return { terms, loading, error, refresh, createTerm, updateTerm, deleteTerm }
}
