import { useRef, useState } from 'react'
import TagPill from './TagPill.jsx'

/**
 * Chip input for tags with shared-table autocomplete.
 * @param {{id, name}[]} selected
 * @param {(tag) => void} onAdd
 * @param {(tag) => void} onRemove
 * @param {(query, limit, excludeIds) => {id, name}[]} suggest
 * @param {(name: string) => Promise<{data, error}>} onCreate  find-or-create in the shared tags table
 */
export default function TagAutocompleteInput({ selected, onAdd, onRemove, suggest, onCreate, placeholder }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef(null)

  const excludeIds = selected.map((t) => t.id)
  const suggestions = suggest(text, 8, excludeIds)

  async function confirm(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const existing = suggestions.find((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      onAdd(existing)
    } else {
      const { data, error } = await onCreate(trimmed)
      if (!error && data) onAdd(data)
    }
    setText('')
    setOpen(false)
    setHighlight(0)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (open && suggestions[highlight]) confirm(suggestions[highlight].name)
      else confirm(text)
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !text && selected.length) {
      onRemove(selected[selected.length - 1])
    }
  }

  return (
    <div className="relative">
      <div className="field-input flex flex-wrap items-center gap-1.5 py-2">
        {selected.map((tag) => (
          <TagPill key={tag.id} tag={tag} onRemove={onRemove} />
        ))}
        <input
          ref={inputRef}
          className="min-w-[100px] flex-1 border-none bg-transparent p-1 text-[16px] outline-none"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length ? '' : placeholder}
        />
      </div>
      {open && text.trim() && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-pop">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => confirm(s.name)}
              className={`block w-full px-3.5 py-2.5 text-left text-sm ${
                i === highlight ? 'bg-brand-50 text-brand-700' : 'hover:bg-mist'
              }`}
            >
              #{s.name}
            </button>
          ))}
          {!suggestions.some((s) => s.name.toLowerCase() === text.trim().toLowerCase()) && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => confirm(text)}
              className={`block w-full px-3.5 py-2.5 text-left text-sm font-medium text-brand-600 ${
                highlight === suggestions.length ? 'bg-brand-50' : 'hover:bg-mist'
              }`}
            >
              Create tag &ldquo;{text.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
