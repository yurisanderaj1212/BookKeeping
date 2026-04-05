/**
 * Maps category names (as stored in the DB) to i18n keys
 * used in the `categories` namespace of the translation files.
 */
const CATEGORY_NAME_TO_KEY: Record<string, string> = {
  'Supply':    'supply',
  'Service':   'service',
  'Transport': 'transport',
  'Payroll':   'payroll',
  'Marketing': 'marketing',
  'Other':     'other',
}

/**
 * Given a category name from the DB and a `t` function
 * scoped to the `categories` namespace, returns the translated name.
 * Falls back to the original name if no mapping exists.
 */
export function translateCategoryName(
  name: string,
  t: (key: string) => string
): string {
  const key = CATEGORY_NAME_TO_KEY[name]
  if (!key) return name
  try {
    return t(key)
  } catch {
    return name
  }
}
