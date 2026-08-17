import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useReviewLog } from '../hooks/useReviewLog.js'
import LanguagePill from '../components/LanguagePill.jsx'
import { dueCounts, last30DaysActivity, masteredCount, reviewStreak, wordsPerLanguage } from '../lib/stats'

function StatTile({ label, value, sub }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
    </div>
  )
}

export default function Stats({ languages, vocabApi }) {
  const { entries, loading } = useReviewLog()

  const perLanguage = useMemo(() => wordsPerLanguage(vocabApi.vocab, languages), [vocabApi.vocab, languages])
  const { dueToday, dueThisWeek } = useMemo(() => dueCounts(vocabApi.vocab), [vocabApi.vocab])
  const mastered = useMemo(() => masteredCount(vocabApi.vocab), [vocabApi.vocab])
  const streak = useMemo(() => reviewStreak(entries), [entries])
  const activity = useMemo(() => last30DaysActivity(entries), [entries])

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Stats</h1>
      <p className="mb-6 text-sm text-ink/50">Your progress at a glance</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Due today" value={dueToday} />
        <StatTile label="Due this week" value={dueThisWeek} />
        <StatTile label="Mastered" value={mastered} sub="21+ day interval" />
        <StatTile label="Streak" value={`${streak}🔥`} sub={streak === 1 ? 'day' : 'days'} />
      </div>

      <div className="card mt-4 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Words per language</p>
        <div className="space-y-2.5">
          {perLanguage.map(({ language, count }) => {
            const max = Math.max(1, ...perLanguage.map((p) => p.count))
            return (
              <div key={language.id} className="flex items-center gap-3">
                <LanguagePill language={language} size="sm" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: language.color }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-ink/60">{count}</span>
              </div>
            )
          })}
          {perLanguage.length === 0 && <p className="text-sm text-ink/40">Add a language to see stats.</p>}
        </div>
      </div>

      <div className="card mt-4 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Reviews — last 30 days
        </p>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink/30">Loading…</div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#1f243066' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <Tooltip
                  cursor={{ fill: '#3366ff0d' }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 12 }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date ?? label}
                  formatter={(value) => [value, 'reviews']}
                />
                <Bar dataKey="count" fill="#3366ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
