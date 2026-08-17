import { toDateOnly } from './srs'

function sanitizeSheetName(name) {
  return name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Sheet'
}

const COLUMNS = [
  { header: 'Word', key: 'word', width: 22 },
  { header: 'Part of Speech', key: 'pos', width: 16 },
  { header: 'Meaning', key: 'meaning', width: 36 },
  { header: 'Synonyms', key: 'synonyms', width: 28 },
  { header: 'Example Sentence', key: 'example', width: 36 },
  { header: 'Tags', key: 'tags', width: 24 },
  { header: 'Date Added', key: 'dateAdded', width: 14 },
  { header: 'Next Review', key: 'nextReview', width: 14 },
  { header: 'Interval (days)', key: 'interval', width: 14 },
]

/** Builds the KataBox backup workbook: one sheet per language, sorted A-Z by word. */
export async function buildWorkbook(vocab, languages) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'KataBox'
  workbook.created = new Date()

  const byLanguage = new Map(languages.map((l) => [l.id, []]))
  for (const v of vocab) {
    if (!byLanguage.has(v.language_id)) byLanguage.set(v.language_id, [])
    byLanguage.get(v.language_id).push(v)
  }

  const sheetSource = languages.length ? languages : [{ id: null, name: 'Vocab' }]
  for (const language of sheetSource) {
    const rows = (byLanguage.get(language.id) || [])
      .slice()
      .sort((a, b) => a.word.localeCompare(b.word))

    const sheet = workbook.addWorksheet(sanitizeSheetName(language.name))
    sheet.columns = COLUMNS
    const header = sheet.getRow(1)
    header.font = { bold: true }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7ECFB' } }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    for (const v of rows) {
      sheet.addRow({
        word: v.word,
        pos: v.part_of_speech,
        meaning: v.meaning,
        synonyms: (v.synonyms || []).map((s) => s.synonym).join(', '),
        example: v.example_sentence || '',
        tags: (v.tags || []).map((t) => t.name).join(', '),
        dateAdded: toDateOnly(v.date_added),
        nextReview: v.review?.next_review_date || '',
        interval: v.review?.interval_days ?? '',
      })
    }
  }

  return workbook
}

export async function exportToExcel(vocab, languages) {
  const workbook = await buildWorkbook(vocab, languages)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const filename = `katabox-backup-${toDateOnly(new Date())}.xlsx`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  return filename
}
