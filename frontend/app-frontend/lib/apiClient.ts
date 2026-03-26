/**
 * apiClient — wrapper de fetch con:
 * - Access token en memoria (variable de módulo) — enviado como Bearer header
 * - Refresh token en localStorage — solo para renovar el access token
 * - Auto-refresh en 401 con cola para requests concurrentes
 * - Timeout configurable por request
 * - Mensajes de error normalizados
 *
 * Por qué memoria y no cookie httpOnly:
 * El proxy de Next.js no reenvía Set-Cookie del backend al browser,
 * así que la cookie nunca llega. Bearer header es la solución correcta
 * para este stack (Next.js frontend + ASP.NET backend separado).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const DEFAULT_TIMEOUT_MS = 15_000

// ─── Access token en memoria ──────────────────────────────────────────────────
// No persiste entre recargas — se restaura via refresh token al montar la app
let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

// ─── Refresh token en localStorage ───────────────────────────────────────────
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

function saveRefreshToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('refreshToken', token)
}

function clearRefreshToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('refreshToken')
}

// ─── Guardar sesión tras login/refresh ───────────────────────────────────────
export function saveTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken)
  saveRefreshToken(refreshToken)
  // Cookie no-httpOnly para que el middleware de Next.js detecte sesión activa
  if (typeof document !== 'undefined') {
    document.cookie = 'session-active=1; path=/; max-age=3600; SameSite=Lax'
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  setAccessToken(null)
  clearRefreshToken()
  localStorage.removeItem('user')
  document.cookie = 'session-active=; path=/; max-age=0'
  document.cookie = 'sub-status=; path=/; max-age=0'
  window.location.href = '/auth/login'
}

// ─── Fetch con timeout ────────────────────────────────────────────────────────
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

// ─── Flag para evitar múltiples refreshes simultáneos ────────────────────────
let isRefreshing = false
let refreshQueue: Array<(success: boolean) => void> = []

// ─── Promise que se resuelve cuando el token inicial está listo ───────────────
// Permite que los componentes esperen a que useAuth restaure el token
// antes de disparar requests, evitando 401s en el arranque.
let _authReadyResolve: (() => void) | null = null
const _authReadyPromise: Promise<void> = new Promise(resolve => {
  _authReadyResolve = resolve
})
let _authReady = false

export function signalAuthReady(): void {
  if (!_authReady) {
    _authReady = true
    _authReadyResolve?.()
  }
}

/** Resolves once useAuth has finished restoring the session (or determined there is none). */
export function waitForAuth(): Promise<void> {
  return _authReadyPromise
}

// ─── Refresh automático ───────────────────────────────────────────────────────
async function attemptRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetchWithTimeout(
      `${API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
      10_000
    )

    if (!res.ok) return false

    const data = await res.json()
    saveTokens(data.token, data.refreshToken)
    return true
  } catch {
    return false
  }
}

// ─── Cliente principal ────────────────────────────────────────────────────────
export interface ApiClientOptions extends Omit<RequestInit, 'signal'> {
  skipAuth?: boolean
  timeoutMs?: number
  _retry?: boolean
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    skipAuth  = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    _retry    = false,
    headers: extraHeaders,
    ...rest
  } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  }

  // Adjuntar access token como Bearer si existe
  const token = getAccessToken()
  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Si no hay token en memoria pero hay refresh token guardado,
  // esperar a que useAuth complete la restauración (máx 5s) antes de disparar
  // el request — evita 401s en el arranque de la app.
  if (!skipAuth && !_retry && !getAccessToken() && typeof window !== 'undefined') {
    const hasRefreshToken = !!localStorage.getItem('refreshToken')
    if (hasRefreshToken && !_authReady) {
      await Promise.race([
        _authReadyPromise,
        new Promise<void>(r => setTimeout(r, 5000)), // timeout de seguridad
      ])
      // Re-adjuntar token si ya está disponible tras la espera
      const freshToken = getAccessToken()
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`
      }
    }
  }

  let res: Response
  try {
    res = await fetchWithTimeout(
      `${API_URL}${endpoint}`,
      { headers, ...rest },
      timeoutMs
    )
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error('La solicitud tardó demasiado. Verifica tu conexión.')
    throw err
  }

  // Auto-refresh en 401 (una sola vez por request)
  if (res.status === 401 && !skipAuth && !_retry) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push(async (success) => {
          if (!success) { reject(new Error('Sesión expirada.')); return }
          try {
            resolve(await apiClient<T>(endpoint, { ...options, _retry: true }))
          } catch (e) { reject(e) }
        })
      })
    }

    isRefreshing = true
    const success = await attemptRefresh()
    isRefreshing = false

    refreshQueue.forEach(cb => cb(success))
    refreshQueue = []

    if (success) return apiClient<T>(endpoint, { ...options, _retry: true })

    clearSession()
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
  }

  if (res.status === 401) {
    clearSession()
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
  }

  if (res.status === 429) {
    // Leer el header Retry-After si el backend lo envía
    const retryAfter = res.headers.get('Retry-After')
    const minutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 15
    throw new Error(`Demasiadas solicitudes. Por favor espera ${minutes} minuto(s) e intenta de nuevo.`)
  }

  if (!res.ok) {
    let message = `Error ${res.status}`
    let code: string | undefined
    try {
      const body = await res.json()
      code = body.code
      message = body.message || body.title || body.errors?.[0] || message
    } catch { /* body no es JSON */ }
    const err = new Error(code ?? message) as Error & { code?: string; extra?: Record<string, unknown> }
    if (code) err.code = code
    throw err
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Utilidad para construir query strings ────────────────────────────────────
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.append(key, String(val))
    }
  }
  const str = q.toString()
  return str ? `?${str}` : ''
}

export { API_URL }
