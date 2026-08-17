export default function LanguagePill({ language, size = 'md' }) {
  if (!language) return null
  const color = language.color || '#3366ff'
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'pill'
  return (
    <span
      className={sizeClasses + ' font-semibold rounded-full inline-flex items-center gap-1'}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {language.name}
    </span>
  )
}
