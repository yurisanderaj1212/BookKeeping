/**
 * Maps backend API error codes to i18n translation keys.
 * Backend returns { code: "ERROR_CODE" } — frontend translates here.
 */

// Map from backend error code → i18n key under "apiErrors.*"
const CODE_TO_KEY: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS:       'invalidCredentials',
  ACCOUNT_LOCKED:            'accountLocked',
  ACCOUNT_LOCKED_TOO_MANY:   'accountLockedTooMany',
  PASSWORD_MISMATCH:         'passwordMismatch',
  PASSWORD_WEAK:             'passwordWeak',
  EMAIL_INVALID:             'emailInvalid',
  REFRESH_TOKEN_REQUIRED:    'refreshTokenRequired',
  SESSION_INVALID:           'sessionInvalid',
  FIELDS_REQUIRED:           'fieldsRequired',
  INVALID_OR_EXPIRED_CODE:   'invalidOrExpiredCode',
  PASSWORD_INCORRECT:        'passwordIncorrect',

  // Generic
  UNAUTHORIZED:              'unauthorized',
  NOT_FOUND:                 'notFound',
  INVALID_PARAMS:            'invalidParams',
  INTERNAL_ERROR:            'internalError',
  LIMIT_OUT_OF_RANGE:        'limitOutOfRange',

  // Employees
  EMPLOYEE_NOT_FOUND:        'employeeNotFound',

  // Accounts
  ACCOUNT_NOT_FOUND:         'accountNotFound',

  // WeekClosure
  WEEK_CLOSURE_NOT_FOUND:    'weekClosureNotFound',
  WEEK_ALREADY_CLOSED:       'weekAlreadyClosed',
  WEEK_ALREADY_OPEN:         'weekAlreadyOpen',

  // Categories
  CATEGORY_NOT_FOUND:        'categoryNotFound',
  CATEGORIES_FIXED:          'categoriesFixed',
}

export type ApiErrorTranslator = (key: string) => string

/**
 * Translates a backend error code to a localized string.
 * Falls back to the raw code if no mapping exists.
 *
 * @param codeOrMessage - The error code from the backend (e.g. "INVALID_CREDENTIALS")
 * @param t - The next-intl translator for the "apiErrors" namespace
 */
export function translateApiError(
  codeOrMessage: string | undefined,
  t: ApiErrorTranslator,
  fallback?: string
): string {
  if (!codeOrMessage) return fallback ?? t('internalError')
  const key = CODE_TO_KEY[codeOrMessage]
  if (key) {
    try {
      return t(key)
    } catch {
      return fallback ?? codeOrMessage
    }
  }
  return fallback ?? codeOrMessage
}

/**
 * Extracts the error code from an unknown caught error.
 * Works with errors thrown by apiClient (which attach a .code property).
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code?: string }).code
  }
  if (error instanceof Error) {
    // The message itself may be the code if apiClient set it that way
    return error.message
  }
  return undefined
}
