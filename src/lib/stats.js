import { MASTERED_INTERVAL_DAYS, toDateOnly, todayDateOnly } from './srs'

export function wordsPerLanguage(vocab, languages) {
  const counts = new Map(languages.map((l) => [l.id, 0]))
  for (const v of vocab) counts.set(v.language_id, (counts.get(v.language_id) || 0) + 1)
  return languages.map((l) => ({ language: l, count: counts.get(l.id) || 0 }))
}

export function dueCounts(vocab) {
  const today = todayDateOnly()
  const weekAhead = toDateOnly(new Date(Date.now() + 6 * 86400000))
  let dueToday = 0
  let dueThisWeek = 0
  for (const v of vocab) {
    const next = v.review?.next_review_date
    if (!next) continue
    if (next <= today) dueToday++
    if (next <= weekAhead) dueThisWeek++
  }
  return { dueToday, dueThisWeek }
}

export function masteredCount(vocab) {
  return vocab.filter((v) => (v.review?.interval_days || 0) >= MASTERED_INTERVAL_DAYS).length
}

/** Consecutive days (ending today, or yesterday if today has no reviews yet) with >=1 review. */
export function reviewStreak(entries) {
  const days = new Set(entries.map((e) => toDateOnly(e.reviewed_at)))
  const today = new Date()
  let cursor = new Date(today)
  if (!days.has(toDateOnly(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(toDateOnly(cursor))) return 0
  }
  let streak = 0
  while (days.has(toDateOnly(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Review counts per day for the last `days` days (oldest first), for the activity chart. */
export function last30DaysActivity(entries, days = 30) {
  const counts = new Map()
  for (const e of entries) {
    const d = toDateOnly(e.reviewed_at)
    counts.set(d, (counts.get(d) || 0) + 1)
  }
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = toDateOnly(new Date(Date.now() - i * 86400000))
    result.push({ date: d, label: d.slice(5), count: counts.get(d) || 0 })
  }
  return result
}
