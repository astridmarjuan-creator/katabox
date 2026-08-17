// SM-2 style spaced repetition scheduling.
// Grades map to the classic SuperMemo SM-2 "quality of recall" scale (0-5).
export const GRADES = {
  again: { label: 'Again', quality: 0, color: 'rose' },
  hard: { label: 'Hard', quality: 3, color: 'amber' },
  good: { label: 'Good', quality: 4, color: 'emerald' },
  easy: { label: 'Easy', quality: 5, color: 'brand' },
}

const MIN_EASE_FACTOR = 1.3
export const DEFAULT_EASE_FACTOR = 2.5
export const MASTERED_INTERVAL_DAYS = 21

/**
 * @param {{ ease_factor: number, interval_days: number, repetitions: number }} stats
 * @param {'again'|'hard'|'good'|'easy'} grade
 * @returns {{ ease_factor: number, interval_days: number, repetitions: number, next_review_date: string, last_result: string }}
 */
export function schedule(stats, grade) {
  const quality = GRADES[grade].quality
  let { ease_factor: ease, repetitions } = stats
  ease = ease ?? DEFAULT_EASE_FACTOR
  repetitions = repetitions ?? 0

  let interval
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round((stats.interval_days || 1) * ease)
    repetitions += 1
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ease < MIN_EASE_FACTOR) ease = MIN_EASE_FACTOR
  ease = Math.round(ease * 100) / 100

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  return {
    ease_factor: ease,
    interval_days: interval,
    repetitions,
    next_review_date: toDateOnly(nextDate),
    last_result: grade,
  }
}

export function toDateOnly(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayDateOnly() {
  return toDateOnly(new Date())
}
