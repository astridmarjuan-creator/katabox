export default function TagPill({ tag, onRemove }) {
  return (
    <span className="pill bg-brand-50 text-brand-700">
      #{tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag)}
          className="ml-0.5 -mr-0.5 rounded-full p-0.5 hover:bg-brand-100"
          aria-label={`Remove tag ${tag.name}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  )
}
