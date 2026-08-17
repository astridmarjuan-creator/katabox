import { useState } from 'react'
import { getSuggestions } from '../lib/search'

/** Search-engine style search: dropdown suggests as you type, Enter/click commits full results. */
export default function SearchBar({ vocab, onCommit }) {
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const suggestions = getSuggestions(vocab, draft)

  function commit(text) {
    setDraft(text)
    onCommit(text)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(open && suggestions[highlight] ? suggestions[highlight].word : draft)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          className="field-input pl-10 pr-9"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setOpen(true)
            setHighlight(0)
            if (!e.target.value.trim()) commit('')
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search words, meanings, tags…"
        />
        {draft && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/30 hover:bg-mist hover:text-ink"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => commit('')}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {open && draft.trim() && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-pop">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(s.word)}
              className={`flex w-full items-baseline gap-2 px-3.5 py-2.5 text-left text-sm ${
                i === highlight ? 'bg-brand-50' : 'hover:bg-mist'
              }`}
            >
              <span className="font-semibold text-ink">{s.word}</span>
              <span className="truncate text-ink/45">{s.meaning}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
