import { useMemo, useState } from 'react'
import TermCard from '../components/TermCard.jsx'
import TermForm from '../components/TermForm.jsx'
import Sheet from '../components/Sheet.jsx'

function matches(item, query, languageId) {
  if (languageId && item.language_id !== languageId) return false
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    item.term.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    (item.source || '').toLowerCase().includes(q)
  )
}

export default function Terms({ languages, termsApi }) {
  const [query, setQuery] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

  const results = useMemo(
    () => termsApi.terms.filter((t) => matches(t, query, languageId)),
    [termsApi.terms, query, languageId],
  )

  async function handleCreate(payload) {
    const { data, error } = await termsApi.createTerm(payload)
    if (!error) setCreating(false)
    return { data, error }
  }

  async function handleUpdate(payload) {
    const { data, error } = await termsApi.updateTerm(editing.id, payload)
    if (!error) setEditing(null)
    return { data, error }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${editing.term}"? This can't be undone.`)) return
    await termsApi.deleteTerm(editing.id)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-ink">Terms</h1>
          <p className="text-sm text-ink/50">
            Interesting or invented terms you&apos;ve spotted while reading — not part of your flashcard review.
          </p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setCreating(true)}>
          + New
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="field-input max-w-xs flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, descriptions, sources…"
        />
        <select
          className="field-input w-auto py-2"
          value={languageId}
          onChange={(e) => setLanguageId(e.target.value)}
        >
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map((item) => (
          <TermCard key={item.id} item={item} onClick={setEditing} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-16 text-center text-ink/40">
          <p className="text-sm">
            {termsApi.terms.length === 0
              ? 'No terms saved yet — add the first one you find.'
              : 'No matches found.'}
          </p>
        </div>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="New term">
        <TermForm languages={languages} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Sheet>

      <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit term">
        {editing && (
          <TermForm
            languages={languages}
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
