// Intl constructors are expensive; build each formatter once.
const compact = new Intl.NumberFormat('en', { notation: 'compact' })
const monthYear = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
})
const fullDate = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** 15234 → "15K" — for stars/followers badges on link cards. */
export const compactNumber = (n: number) => compact.format(n)

const formatWith = (format: Intl.DateTimeFormat, value: string | number) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : format.format(date)
}

/** "Mar 2019" — profile joined dates. */
export const formatMonthYear = (value: string) => formatWith(monthYear, value)

/** "Mar 5, 2019" — post dates. */
export const formatFullDate = (value: string | number) =>
  formatWith(fullDate, value)
