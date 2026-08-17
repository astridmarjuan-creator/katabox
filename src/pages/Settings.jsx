import { useState } from 'react'
import LanguagePill from '../components/LanguagePill.jsx'
import { exportToExcel } from '../lib/export'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Settings({ languagesApi, vocabApi }) {
  const { user, signOut } = useAuth()
  const { languages, addLanguage, deleteLanguage } = languagesApi
  const [newLanguage, setNewLanguage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  async function handleAddLanguage(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await addLanguage(newLanguage)
    setBusy(false)
    if (error) setError(error.message)
    else setNewLanguage('')
  }

  async function handleDeleteLanguage(l) {
    if (!confirm(`Delete "${l.name}"? All of its words will be deleted too. This can't be undone.`)) return
    await deleteLanguage(l.id)
    vocabApi.refresh()
  }

  async function handleExport() {
    setExporting(true)
    setExportMsg('')
    try {
      const filename = await exportToExcel(vocabApi.vocab, languages)
      setExportMsg(`Downloaded ${filename}`)
    } catch (err) {
      setExportMsg(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Settings</h1>
      <p className="mb-6 text-sm text-ink/50">{user?.email}</p>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-bold text-ink">Languages</h2>
        <div className="space-y-2">
          {languages.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-lg px-1 py-1">
              <LanguagePill language={l} />
              <button
                className="rounded-full p-1.5 text-ink/30 hover:bg-rose-50 hover:text-rose-500"
                onClick={() => handleDeleteLanguage(l)}
                aria-label={`Delete ${l.name}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.6 8.5a1 1 0 001 .95h3.8a1 1 0 001-.95L11.5 5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
          {languages.length === 0 && <p className="text-sm text-ink/40">No languages yet.</p>}
        </div>

        <form onSubmit={handleAddLanguage} className="mt-4 flex gap-2">
          <input
            className="field-input"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="e.g. Japanese"
          />
          <button type="submit" disabled={busy} className="btn-primary shrink-0">
            Add
          </button>
        </form>
        {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      </section>

      <section className="card mt-4 p-4">
        <h2 className="mb-1 text-sm font-bold text-ink">Backup &amp; export</h2>
        <p className="mb-3 text-sm text-ink/50">
          Download your entire collection as an Excel workbook — one sheet per language.
        </p>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Generating…' : 'Export to Excel (.xlsx)'}
        </button>
        {exportMsg && <p className="mt-2 text-sm font-medium text-emerald-600">{exportMsg}</p>}
      </section>

      <section className="card mt-4 p-4">
        <h2 className="mb-3 text-sm font-bold text-ink">Account</h2>
        <button className="btn-secondary" onClick={signOut}>
          Sign out
        </button>
      </section>
    </div>
  )
}
