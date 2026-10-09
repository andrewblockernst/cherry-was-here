const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

/** Parts of a `YYYY-MM-DD` date for the cancellation mark (parsed by hand, so no timezone drift). */
export function postmark(date: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  const month = m ? MONTHS[Number(m[2]) - 1] : undefined
  if (!m || !month) return { day: '', month: date, year: '' }
  return { day: String(Number(m[3])), month, year: m[1]! }
}
