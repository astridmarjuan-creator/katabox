import LanguagePill from './LanguagePill.jsx'

export default function TermCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="card w-full p-4 text-left transition hover:shadow-pop active:scale-[0.99]"
    >
      <LanguagePill language={item.language} size="sm" />
      <h3 className="mt-2 text-base font-bold text-ink">{item.term}</h3>
      <p className="mt-0.5 line-clamp-3 text-sm text-ink/60">{item.description}</p>
      {item.source && <p className="mt-2 truncate text-xs italic text-ink/40">— {item.source}</p>}
    </button>
  )
}
