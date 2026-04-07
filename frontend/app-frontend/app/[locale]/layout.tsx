import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { NotificationProvider } from '@/lib/notificationContext'
import GlobalToastContainer from '@/components/notifications/GlobalToastContainer'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Genera los parámetros estáticos para los locales soportados
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validar que el locale sea soportado
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Habilitar renderizado estático para este locale
  setRequestLocale(locale)

  // Cargar mensajes del servidor para pasarlos al cliente
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotificationProvider>
        <ErrorBoundary>
          <div className="locale-root min-h-screen bg-gray-50 dark:bg-gray-950">
            {children}
            <GlobalToastContainer />
          </div>
        </ErrorBoundary>
      </NotificationProvider>
    </NextIntlClientProvider>
  )
}
