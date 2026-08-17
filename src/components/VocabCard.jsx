import LanguagePill from './LanguagePill.jsx'

const POS_LABEL = {
  noun: 'noun', verb: 'verb', adjective: 'adj.', adverb: 'adv.',
  phrase: 'phrase', idiom: 'idiom', other: 'other',
}

export default function VocabCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="card w-full p-4 text-left transition hover:shadow-pop active:scale-[0.99]"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <LanguagePill language={item.language} size="sm" />
        <span className="pill bg-mist text-ink/50 text-[11px]">{POS_LABEL[item.part_of_speech]}</span>
        {item.review && (
          <span className="ml-auto text-[11px] font-medium text-ink/35">
            {item.review.next_review_date <= new Date().toISOString().slice(0, 10)
              ? 'due now'
              : `due ${item.review.next_review_date}`}
          </span>
        )}
      </div>
      <h3 className="mt-2 truncate text-base font-bold text-ink">{item.word}</h3>
      <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">{item.meaning}</p>
      {item.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span key={t.id} className="pill bg-brand-50 text-brand-700 text-[11px]">
              #{t.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
