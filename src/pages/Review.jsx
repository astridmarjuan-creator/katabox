import { useState } from 'react'
import Flashcard from '../components/Flashcard.jsx'
import LanguagePill from '../components/LanguagePill.jsx'
import { GRADES, schedule } from '../lib/srs'

const GRADE_STYLES = {
  again: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  hard: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  good: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  easy: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
}

function formatDays(n) {
  return n === 1 ? '1d' : `${n}d`
}

export default function Review({ languages, vocabApi }) {
  const [selectedLangs, setSelectedLangs] = useState([])
  const [sessionStarted, setSessionStarted] = useState(false)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [grading, setGrading] = useState(false)

  const dueAll = vocabApi.dueToday
  const dueCountFor = (langId) => dueAll.filter((v) => v.language_id === langId).length

  function toggleLang(id) {
    setSelectedLangs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function startSession() {
    const pool = selectedLangs.length ? dueAll.filter((v) => selectedLangs.includes(v.language_id)) : dueAll
    const sorted = [...pool].sort((a, b) =>
      a.review.next_review_date.localeCompare(b.review.next_review_date),
    )
    setQueue(sorted)
    setIndex(0)
    setFlipped(false)
    setReviewedCount(0)
    setSessionStarted(true)
  }

  async function grade(g) {
    if (grading) return
    setGrading(true)
    const item = queue[index]
    await vocabApi.recordReview(item.id, g)
    setGrading(false)
    setReviewedCount((c) => c + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  if (!sessionStarted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-5 sm:py-8">
        <h1 className="mb-1 text-2xl font-extrabold text-ink">Review</h1>
        <p className="mb-6 text-sm text-ink/50">
          {dueAll.length} card{dueAll.length === 1 ? '' : 's'} due today
        </p>

        <p className="field-label">Languages to review</p>
        <div className="space-y-2">
          {languages.map((l) => (
            <label
              key={l.id}
              className="card flex cursor-pointer items-center justify-between px-4 py-3"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(l.id)}
                  onChange={() => toggleLang(l.id)}
                  className="rounded border-line text-brand-500 focus:ring-brand-300"
                />
                <LanguagePill language={l} size="sm" />
              </span>
              <span className="text-sm font-semibold text-ink/50">{dueCountFor(l.id)} due</span>
            </label>
          ))}
          {languages.length === 0 && <p className="text-sm text-ink/40">Add a language to get started.</p>}
        </div>
        <p className="mt-2 text-xs text-ink/40">Leave none checked to review all due languages together.</p>

        <button
          className="btn-primary mt-6 w-full py-3.5 text-base"
          disabled={dueAll.length === 0}
          onClick={startSession}
        >
          {dueAll.length === 0 ? 'Nothing due right now' : 'Start review'}
        </button>
      </div>
    )
  }

  const current = queue[index]

  if (!current) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h1 className="mb-1 text-2xl font-extrabold text-ink">All done!</h1>
        <p className="mb-6 text-sm text-ink/50">
          You reviewed {reviewedCount} card{reviewedCount === 1 ? '' : 's'}.
        </p>
        <button className="btn-primary" onClick={() => setSessionStarted(false)}>
          Back to review setup
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-5 sm:py-8">
      <div className="mb-5 flex w-full items-center justify-between text-sm text-ink/50">
        <span className="font-semibold">
          {index + 1} / {queue.length}
        </span>
        <button className="btn-ghost py-1.5 text-sm" onClick={() => setSessionStarted(false)}>
          End session
        </button>
      </div>

      <Flashcard item={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <div className="mt-6 w-full">
        {!flipped ? (
          <button
            className="btn-primary w-full py-4 text-base"
            onClick={() => setFlipped(true)}
          >
            Show answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(GRADES).map(([key, g]) => {
              const preview = schedule(current.review ?? {}, key)
              return (
                <button
                  key={key}
                  disabled={grading}
                  onClick={() => grade(key)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-3.5 text-sm font-bold transition active:scale-[0.97] disabled:opacity-50 ${GRADE_STYLES[key]}`}
                >
                  {g.label}
                  <span className="text-[11px] font-medium opacity-70">
                    {formatDays(preview.interval_days)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
