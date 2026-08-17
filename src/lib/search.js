function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9'-]+/i)
    .filter(Boolean)
}

/** True if `query` matches this vocab entry's word, meaning (word-by-word), or tags. */
export function matchesSearch(item, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  if (item.word.toLowerCase().includes(q)) return true
  if (tokenize(item.meaning).some((word) => word.includes(q))) return true
  if ((item.tags || []).some((t) => t.name.toLowerCase().includes(q))) return true
  return false
}

export function matchesFilters(item, { languageId, tagIds, partOfSpeech }) {
  if (languageId && item.language_id !== languageId) return false
  if (partOfSpeech && item.part_of_speech !== partOfSpeech) return false
  if (tagIds && tagIds.length) {
    const itemTagIds = new Set((item.tags || []).map((t) => t.id))
    if (!tagIds.every((id) => itemTagIds.has(id))) return false
  }
  return true
}

export function filterVocab(list, { query = '', languageId = '', tagIds = [], partOfSpeech = '' } = {}) {
  return list.filter(
    (item) => matchesSearch(item, query) && matchesFilters(item, { languageId, tagIds, partOfSpeech }),
  )
}

export function getSuggestions(list, query, limit = 8) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return list
    .filter((item) => matchesSearch(item, q))
    .sort((a, b) => {
      const aStarts = a.word.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.word.toLowerCase().startsWith(q) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      return a.word.localeCompare(b.word)
    })
    .slice(0, limit)
}
