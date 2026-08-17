import { Suspense, lazy, useState } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import Login from './pages/Login.jsx'
import CardBox from './pages/CardBox.jsx'
import AddWord from './pages/AddWord.jsx'
import Review from './pages/Review.jsx'
import Settings from './pages/Settings.jsx'
import { useLanguages } from './hooks/useLanguages.js'
import { useTags } from './hooks/useTags.js'
import { useVocab } from './hooks/useVocab.js'

const Stats = lazy(() => import('./pages/Stats.jsx'))

const TABS = [
  { key: 'box', label: 'Card Box', icon: BoxIcon },
  { key: 'add', label: 'Add', icon: PlusIcon },
  { key: 'review', label: 'Review', icon: ReviewIcon },
  { key: 'stats', label: 'Stats', icon: StatsIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState('box')

  const languagesApi = useLanguages()
  const tagsApi = useTags()
  const vocabApi = useVocab()

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-mist text-ink/40">
        Loading…
      </div>
    )
  }

  if (!user) return <Login />

  const dueBadge = vocabApi.dueToday.length

  return (
    <div className="min-h-[100dvh] bg-mist pb-20 sm:flex sm:pb-0">
      <nav className="hidden w-56 shrink-0 flex-col border-r border-line bg-white p-4 sm:flex">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-extrabold text-white">
            K
          </div>
          <span className="text-lg font-extrabold text-ink">KataBox</span>
        </div>
        {TABS.map((t) => (
          <NavItem key={t.key} tab={t} active={tab === t.key} onClick={() => setTab(t.key)} badge={t.key === 'review' ? dueBadge : 0} />
        ))}
      </nav>

      <main className="flex-1">
        {tab === 'box' && <CardBox languages={languagesApi.languages} tagsApi={tagsApi} vocabApi={vocabApi} />}
        {tab === 'add' && (
          <AddWord
            languages={languagesApi.languages}
            tagsApi={tagsApi}
            vocabApi={vocabApi}
            onDone={() => setTab('box')}
          />
        )}
        {tab === 'review' && <Review languages={languagesApi.languages} vocabApi={vocabApi} />}
        {tab === 'stats' && (
          <Suspense fallback={<div className="p-8 text-center text-sm text-ink/40">Loading…</div>}>
            <Stats languages={languagesApi.languages} vocabApi={vocabApi} />
          </Suspense>
        )}
        {tab === 'settings' && <Settings languagesApi={languagesApi} vocabApi={vocabApi} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 backdrop-blur sm:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
              tab === t.key ? 'text-brand-600' : 'text-ink/40'
            }`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
            {t.key === 'review' && dueBadge > 0 && (
              <span className="absolute right-[22%] top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {dueBadge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

function NavItem({ tab, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active ? 'bg-brand-50 text-brand-700' : 'text-ink/60 hover:bg-mist'
      }`}
    >
      <tab.icon className="h-5 w-5" />
      {tab.label}
      {badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

function BoxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 8v8l9 4 9-4V8M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function ReviewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="3" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 7.5L20 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function StatsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 000 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2L10 21h4l.6-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
