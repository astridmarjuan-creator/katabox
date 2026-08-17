import { useState } from 'react'
import VocabForm from '../components/VocabForm.jsx'

export default function AddWord({ languages, tagsApi, vocabApi, onDone }) {
  const [toast, setToast] = useState('')
  const [resetKey, setResetKey] = useState(0)

  async function handleSubmit(payload) {
    const { data, error } = await vocabApi.createVocab(payload)
    if (!error) {
      setToast(`Added "${data.word}"`)
      setResetKey((k) => k + 1)
      setTimeout(() => setToast(''), 2000)
    }
    return { data, error }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:py-8">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Add a word</h1>
      <p className="mb-6 text-sm text-ink/50">Add a word, idiom, or phrase to your collection.</p>
      {toast && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}
      <VocabForm
        key={resetKey}
        languages={languages}
        tagsApi={tagsApi}
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </div>
  )
}
