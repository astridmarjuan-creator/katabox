import { useState } from 'react'

/** Freeform chip input (used for synonyms) — no autocomplete, just add-on-enter. */
export default function ChipInput({ values, onChange, placeholder }) {
  const [text, setText] = useState('')

  function commit() {
    const trimmed = text.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !text && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="field-input flex flex-wrap items-center gap-1.5 py-2">
      {values.map((v) => (
        <span key={v} className="pill bg-mist text-ink/70">
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="ml-0.5 -mr-0.5 rounded-full p-0.5 hover:bg-black/10"
            aria-label={`Remove ${v}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      <input
        className="min-w-[100px] flex-1 border-none bg-transparent p-1 text-[15px] outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={values.length ? '' : placeholder}
      />
    </div>
  )
}
