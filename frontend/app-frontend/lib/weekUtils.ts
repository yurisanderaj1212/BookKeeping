/**
 * Week assignment rule (client requirement):
 * A week belongs to the month where it has 4 or more days.
 * Example: Mar 29 – Apr 4 → belongs to April (4 days in April vs 3 in March)
 * This prevents a week from appearing in two different months.
 */

export interface WeekDef {
  weekNumber: number
  startDate:  string   // ISO YYYY-MM-DD (real Sunday start, may be in prev month)
  endDate:    string   // ISO YYYY-MM-DD (real Saturday end, may be in next month)
}

/**
 * Returns the month (1-12) that a Sun-Sat week belongs to,
 * using the 4+ days rule.
 */
export function getCanonicalMonth(weekStart: Date, weekEnd: Date): number {
  // Count days in each month
  const counts = new Map<number, number>()
  const cursor = new Date(weekStart)
  while (cursor <= weekEnd) {
    const m = cursor.getMonth() + 1 // 1-based
    counts.set(m, (counts.get(m) ?? 0) + 1)
    cursor.setDate(cursor.getDate() + 1)
  }
  // Return the month with the most days (tie → later month, i.e. the end month)
  let bestMonth = weekEnd.getMonth() + 1
  let bestCount = 0
  for (const [m, c] of counts) {
    if (c > bestCount) { bestCount = c; bestMonth = m }
  }
  return bestMonth
}

/**
 * Returns all weeks (Sun-Sat) whose canonical month equals the requested month.
 * Each week is numbered sequentially within the month.
 */
export function getWeeksForMonth(year: number, month: number): WeekDef[] {
  const weeks: WeekDef[] = []

  // Search window: 3 weeks before the 1st and 3 weeks after the last day
  // to catch all weeks that could canonically belong to this month
  const firstOfMonth = new Date(year, month - 1, 1)
  const lastOfMonth  = new Date(year, month, 0)

  // Start from the Sunday 3 weeks before the 1st
  const searchStart = new Date(firstOfMonth)
  searchStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay() - 14)

  // End at the Saturday 3 weeks after the last day
  const searchEnd = new Date(lastOfMonth)
  const daysToSat = (6 - lastOfMonth.getDay() + 7) % 7
  searchEnd.setDate(lastOfMonth.getDate() + daysToSat + 14)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const cursor = new Date(searchStart)
  let weekNum = 1

  while (cursor <= searchEnd) {
    const weekStart = new Date(cursor)
    const weekEnd   = new Date(cursor)
    weekEnd.setDate(cursor.getDate() + 6)

    if (getCanonicalMonth(weekStart, weekEnd) === month) {
      weeks.push({
        weekNumber: weekNum,
        startDate:  fmt(weekStart),
        endDate:    fmt(weekEnd),
      })
      weekNum++
    }

    cursor.setDate(cursor.getDate() + 7)
  }

  return weeks
}

/**
 * Returns a human-readable label for a week, e.g. "Mar 29 - Apr 4"
 */
export function getWeekLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end   = new Date(endDate   + 'T00:00:00')
  const fmt   = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(start)} - ${fmt(end)}`
}
