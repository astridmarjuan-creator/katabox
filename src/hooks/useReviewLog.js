import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

/** Fetches review_log rows for streak + activity chart calculations. */
export function useReviewLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - 400)
    const { data, error } = await supabase
      .from('review_log')
      .select('reviewed_at, grade')
      .gte('reviewed_at', since.toISOString())
      .order('reviewed_at', { ascending: false })
    if (!error) setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, loading, refresh }
}
