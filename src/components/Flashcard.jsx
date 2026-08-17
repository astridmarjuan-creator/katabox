import LanguagePill from './LanguagePill.jsx'

export default function Flashcard({ item, flipped, onFlip }) {
  return (
    <div className="mx-auto w-full max-w-md select-none [perspective:1400px]" onClick={onFlip}>
      <div
        className={`relative h-80 w-full cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="card absolute inset-0 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden]">
          <LanguagePill language={item.language} />
          <p className="mt-6 break-words text-3xl font-extrabold text-ink">{item.word}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink/40">
            {item.part_of_speech}
          </p>
          <p className="mt-10 text-xs text-ink/30">Tap card to reveal</p>
        </div>

        <div className="card absolute inset-0 flex flex-col overflow-y-auto p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Meaning</p>
          <p className="mt-1 text-lg font-bold text-ink">{item.meaning}</p>

          {item.synonyms?.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/40">Synonyms</p>
              <p className="mt-1 text-sm text-ink/70">{item.synonyms.map((s) => s.synonym).join(', ')}</p>
            </>
          )}

          {item.example_sentence && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/40">Example</p>
              <p className="mt-1 text-sm italic text-ink/70">&ldquo;{item.example_sentence}&rdquo;</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
