import { useState } from 'react'
import ChipInput from './ChipInput.jsx'
import TagAutocompleteInput from './TagAutocompleteInput.jsx'

const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'other']

export default function VocabForm({ languages, tagsApi, initial, onSubmit, onCancel, onDelete }) {
  const [form, setForm] = useState(() => ({
    language_id: initial?.language_id || languages[0]?.id || '',
    word: initial?.word || '',
    part_of_speech: initial?.part_of_speech || 'noun',
    meaning: initial?.meaning || '',
    example_sentence: initial?.example_sentence || '',
  }))
  const [synonyms, setSynonyms] = useState(() => (initial?.synonyms || []).map((s) => s.synonym))
  const [tags, setTags] = useState(() => initial?.tags || [])
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
    if (!form.word.trim()) return setError('Word is required')
    if (!form.meaning.trim()) return setError('Meaning is required')

    setBusy(true)
    const { error } = await onSubmit({
      ...form,
      word: form.word.trim(),
      meaning: form.meaning.trim(),
      example_sentence: form.example_sentence.trim() || null,
      synonyms,
      tagIds: tags.map((t) => t.id),
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

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
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
        <div className="col-span-2 sm:col-span-1">
          <label className="field-label">Part of speech</label>
          <select
            className="field-input"
            value={form.part_of_speech}
            onChange={(e) => update('part_of_speech', e.target.value)}
          >
            {PARTS_OF_SPEECH.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Word / phrase</label>
        <input
          className="field-input"
          value={form.word}
          onChange={(e) => update('word', e.target.value)}
          placeholder="e.g. serendipity"
          autoFocus
        />
      </div>

      <div>
        <label className="field-label">Meaning</label>
        <textarea
          className="field-input min-h-[80px] resize-y"
          value={form.meaning}
          onChange={(e) => update('meaning', e.target.value)}
          placeholder="What does it mean?"
        />
      </div>

      <div>
        <label className="field-label">Synonyms</label>
        <ChipInput values={synonyms} onChange={setSynonyms} placeholder="Type a synonym, press Enter…" />
      </div>

      <div>
        <label className="field-label">Example sentence</label>
        <textarea
          className="field-input min-h-[70px] resize-y"
          value={form.example_sentence}
          onChange={(e) => update('example_sentence', e.target.value)}
          placeholder="Use it in a sentence"
        />
      </div>

      <div>
        <label className="field-label">Tags</label>
        <TagAutocompleteInput
          selected={tags}
          onAdd={(t) => setTags((prev) => [...prev, t])}
          onRemove={(t) => setTags((prev) => prev.filter((x) => x.id !== t.id))}
          suggest={tagsApi.suggest}
          onCreate={tagsApi.findOrCreateTag}
          placeholder="Type a tag, press Enter…"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 flex gap-2 border-t border-line bg-white/95 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        {isEdit && onDelete && (
          <button type="button" className="btn-danger" onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary flex-1 sm:flex-none">
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add word'}
        </button>
      </div>
    </form>
  )
}
