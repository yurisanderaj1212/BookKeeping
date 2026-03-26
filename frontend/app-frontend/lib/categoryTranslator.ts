/**
 * Maps Spanish category names (as stored in the DB) to i18n keys
 * used in the `categories` namespace of the translation files.
 */
const CATEGORY_NAME_TO_KEY: Record<string, string> = {
  // Income
  'Ventas': 'income-sales',
  'Servicios': 'income-services',
  'Consultoría': 'income-consulting',
  'ConsultorÃ­a': 'income-consulting',   // fallback: nombre corrupto en BD
  'Comisiones': 'income-commissions',
  'Inversiones': 'income-investments',
  'Freelance': 'income-freelance',
  'Otros Ingresos': 'income-other',
  // Expense
  'Oficina': 'expense-office-supplies',
  'Marketing': 'expense-marketing',
  'Software': 'expense-software',
  'Servicios Públicos': 'expense-utilities',
  'Servicios PÃºblicos': 'expense-utilities', // fallback: nombre corrupto en BD
  'Transporte': 'expense-travel',
  'Servicios Profesionales': 'expense-professional',
  'Alquiler': 'expense-rent',
  'Viajes': 'expense-travel',
  'Otros Gastos': 'expense-other',
}

/**
 * Given a Spanish category name from the backend and a `t` function
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
