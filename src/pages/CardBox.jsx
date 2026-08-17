import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import FilterBar from '../components/FilterBar.jsx'
import VocabCard from '../components/VocabCard.jsx'
import VocabForm from '../components/VocabForm.jsx'
import Sheet from '../components/Sheet.jsx'
import { filterVocab } from '../lib/search'

export default function CardBox({ languages, tagsApi, vocabApi }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ languageId: '', partOfSpeech: '', tagIds: [] })
  const [editing, setEditing] = useState(null)

  const results = useMemo(
    () => filterVocab(vocabApi.vocab, { query, ...filters }),
    [vocabApi.vocab, query, filters],
  )

  async function handleUpdate(payload) {
    const { data, error } = await vocabApi.updateVocab(editing.id, payload)
    if (!error) setEditing(null)
    return { data, error }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${editing.word}"? This can't be undone.`)) return
    await vocabApi.deleteVocab(editing.id)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Card Box</h1>
      <p className="mb-5 text-sm text-ink/50">
        {vocabApi.vocab.length} word{vocabApi.vocab.length === 1 ? '' : 's'} in your collection
      </p>

      <div className="space-y-3">
        <SearchBar vocab={vocabApi.vocab} onCommit={setQuery} />
        <FilterBar languages={languages} tags={tagsApi.tags} filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map((item) => (
          <VocabCard key={item.id} item={item} onClick={setEditing} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-16 text-center text-ink/40">
          <p className="text-sm">
            {vocabApi.vocab.length === 0 ? 'No words yet — add your first one!' : 'No matches found.'}
          </p>
        </div>
      )}

      <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit word">
        {editing && (
          <VocabForm
            languages={languages}
            tagsApi={tagsApi}
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            onDelete={handleDelete}
          />
        )}
      </Sheet>
    </div>
  )
}
