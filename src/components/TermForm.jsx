import { useState } from 'react'

export default function TermForm({ languages, initial, onSubmit, onCancel, onDelete }) {
  const [form, setForm] = useState(() => ({
    language_id: initial?.language_id || languages[0]?.id || '',
    term: initial?.term || '',
    description: initial?.description || '',
    source: initial?.source || '',
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(initial)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.language_id) return setError('Choose a language')
    if (!form.term.trim()) return setError('Term is required')
    if (!form.description.trim()) return setError('Description is required')

    setBusy(true)
    const { error } = await onSubmit({
      ...form,
      term: form.term.trim(),
      description: form.description.trim(),
      source: form.source.trim() || null,
    })
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24 sm:pb-0">
      {languages.length === 0 && (
        <div className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm font-medium text-amber-700">
          Add a language in Settings first.
        </div>
      )}

      <div>
        <label className="field-label">Language</label>
        <select
          className="field-input"
          value={form.language_id}
          onChange={(e) => update('language_id', e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Term</label>
        <input
          className="field-input"
          value={form.term}
          onChange={(e) => update('term', e.target.value)}
          placeholder="e.g. pancaroba perubahan"
          autoFocus
        />
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          className="field-input min-h-[90px] resize-y"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="What does it mean, and any context worth remembering?"
        />
      </div>

      <div>
        <label className="field-label">Source</label>
        <input
          className="field-input"
          value={form.source}
          onChange={(e) => update('source', e.target.value)}
          placeholder="Book, article, author — wherever you found it"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</div>
      )}

      <div className="fixed inset-x-0 bottom-20 z-20 flex gap-2 border-t border-line bg-white/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        {isEdit && onDelete && (
          <button type="button" className="btn-danger" onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1 sm:flex-none">
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add term'}
        </button>
      </div>
    </form>
  )
}
