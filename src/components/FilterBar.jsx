import { useState } from 'react'

const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom', 'other']

export default function FilterBar({ languages, tags, filters, onChange }) {
  const [tagMenuOpen, setTagMenuOpen] = useState(false)
  const active = filters.languageId || filters.partOfSpeech || filters.tagIds.length > 0

  function toggleTag(id) {
    const set = new Set(filters.tagIds)
    set.has(id) ? set.delete(id) : set.add(id)
    onChange({ ...filters, tagIds: [...set] })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="field-input w-auto py-2 text-sm"
        value={filters.languageId}
        onChange={(e) => onChange({ ...filters, languageId: e.target.value })}
      >
        <option value="">All languages</option>
        {languages.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <select
        className="field-input w-auto py-2 text-sm"
        value={filters.partOfSpeech}
        onChange={(e) => onChange({ ...filters, partOfSpeech: e.target.value })}
      >
        <option value="">Any part of speech</option>
        {PARTS_OF_SPEECH.map((p) => (
          <option key={p} value={p}>
            {p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <div className="relative">
        <button
          type="button"
          className="field-input flex w-auto items-center gap-1.5 py-2 text-sm"
          onClick={() => setTagMenuOpen((o) => !o)}
        >
          Tags{filters.tagIds.length > 0 ? ` (${filters.tagIds.length})` : ''}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {tagMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setTagMenuOpen(false)} />
            <div className="absolute z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-pop">
              {tags.length === 0 && <p className="px-2 py-1.5 text-sm text-ink/40">No tags yet</p>}
              {tags.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-mist"
                >
                  <input
                    type="checkbox"
                    checked={filters.tagIds.includes(t.id)}
                    onChange={() => toggleTag(t.id)}
                    className="rounded border-line text-brand-500 focus:ring-brand-300"
                  />
                  #{t.name}
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {active && (
        <button
          type="button"
          className="btn-ghost py-2 text-sm"
          onClick={() => onChange({ languageId: '', partOfSpeech: '', tagIds: [] })}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
