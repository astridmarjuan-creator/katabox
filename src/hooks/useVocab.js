import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { schedule, todayDateOnly } from '../lib/srs'

const SELECT = `
  *,
  language:languages ( id, name, color ),
  synonyms ( id, synonym ),
  vocab_tags ( tags ( id, name ) ),
  review_stats ( * )
`

function normalize(row) {
  return {
    ...row,
    synonyms: row.synonyms ?? [],
    tags: (row.vocab_tags ?? []).map((vt) => vt.tags).filter(Boolean),
    review: row.review_stats?.[0] ?? row.review_stats ?? null,
  }
}

export function useVocab() {
  const [vocab, setVocab] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('vocab').select(SELECT).order('word')
    if (error) setError(error)
    else {
      setError(null)
      setVocab(data.map(normalize))
    }
    setLoading(false)
    return { data, error }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function fetchOne(id) {
    const { data, error } = await supabase.from('vocab').select(SELECT).eq('id', id).single()
    if (error) return { error }
    return { data: normalize(data) }
  }

  /**
   * @param {{ language_id, word, part_of_speech, meaning, example_sentence, synonyms: string[], tagIds: string[] }} input
   */
  async function createVocab(input) {
    const { synonyms = [], tagIds = [], ...fields } = input
    const { data: created, error } = await supabase.from('vocab').insert(fields).select().single()
    if (error) return { error }

    if (synonyms.length) {
      await supabase.from('synonyms').insert(synonyms.map((synonym) => ({ vocab_id: created.id, synonym })))
    }
    if (tagIds.length) {
      await supabase.from('vocab_tags').insert(tagIds.map((tag_id) => ({ vocab_id: created.id, tag_id })))
    }

    const { data: full } = await fetchOne(created.id)
    if (full) setVocab((prev) => [...prev, full].sort((a, b) => a.word.localeCompare(b.word)))
    return { data: full }
  }

  async function updateVocab(id, input) {
    const { synonyms, tagIds, ...fields } = input
    const { error } = await supabase.from('vocab').update(fields).eq('id', id)
    if (error) return { error }

    if (synonyms) {
      await supabase.from('synonyms').delete().eq('vocab_id', id)
      if (synonyms.length) {
        await supabase.from('synonyms').insert(synonyms.map((synonym) => ({ vocab_id: id, synonym })))
      }
    }
    if (tagIds) {
      await supabase.from('vocab_tags').delete().eq('vocab_id', id)
      if (tagIds.length) {
        await supabase.from('vocab_tags').insert(tagIds.map((tag_id) => ({ vocab_id: id, tag_id })))
      }
    }

    const { data: full } = await fetchOne(id)
    if (full) setVocab((prev) => prev.map((v) => (v.id === id ? full : v)).sort((a, b) => a.word.localeCompare(b.word)))
    return { data: full }
  }

  async function deleteVocab(id) {
    const { error } = await supabase.from('vocab').delete().eq('id', id)
    if (!error) setVocab((prev) => prev.filter((v) => v.id !== id))
    return { error }
  }

  /** Grades a card and persists the new SM-2 schedule + a review_log entry. */
  async function recordReview(vocabId, grade) {
    const current = vocab.find((v) => v.id === vocabId)
    if (!current) return { error: new Error('Vocab not found') }
    const base = current.review ?? { ease_factor: 2.5, interval_days: 0, repetitions: 0 }
    const next = schedule(base, grade)

    const { data: updatedStats, error } = await supabase
      .from('review_stats')
      .update({ ...next, last_reviewed_at: new Date().toISOString() })
      .eq('vocab_id', vocabId)
      .select()
      .single()
    if (error) return { error }

    await supabase.from('review_log').insert({ vocab_id: vocabId, grade })

    setVocab((prev) => prev.map((v) => (v.id === vocabId ? { ...v, review: updatedStats } : v)))
    return { data: updatedStats }
  }

  const dueToday = vocab.filter((v) => v.review && v.review.next_review_date <= todayDateOnly())

  return {
    vocab,
    loading,
    error,
    refresh,
    createVocab,
    updateVocab,
    deleteVocab,
    recordReview,
    dueToday,
  }
}
