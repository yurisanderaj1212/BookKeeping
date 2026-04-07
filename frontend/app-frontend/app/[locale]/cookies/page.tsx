'use client'

import Link from 'next/link'
import AppLogo from '@/components/ui/AppLogo'
import { useTranslations } from 'next-intl'

export default function CookiesPage() {
  const t = useTranslations('legal')
  const lastUpdated = '19 de marzo de 2026'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <AppLogo size={32} variant="full" />
          </Link>
          <Link href="/auth/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            {t('signIn')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-10 pb-8 border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('cookiesTitle')}</h1>
            <p className="text-sm text-slate-500">{t('lastUpdated')}: {lastUpdated}</p>
          </div>

          <div className="prose-legal">

            <Section title="1. ¿Qué son las Cookies?">
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                visitas un sitio web. Nos permiten recordar tus preferencias, mantener tu sesión
                activa y entender cómo usas nuestra plataforma para mejorarla.
              </p>
              <p>
                Además de cookies, utilizamos tecnologías similares como el almacenamiento local
                del navegador (localStorage) para guardar tokens de sesión de forma segura en
                tu dispositivo.
              </p>
            </Section>

            <Section title="2. Cookies que Utilizamos">
              <p>Clasificamos las cookies según su propósito:</p>

              {/* Cookie table */}
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 w-1/4">Nombre</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 w-1/4">Tipo</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 w-1/4">Duración</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Propósito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <CookieRow
                      name="auth-token"
                      type="Esencial"
                      duration="1 hora"
                      purpose="Mantiene tu sesión autenticada. Sin esta cookie no puedes acceder a la plataforma."
                    />
                    <CookieRow
                      name="token (localStorage)"
                      type="Esencial"
                      duration="1 hora"
                      purpose="Token JWT de acceso almacenado localmente para autenticar peticiones a la API."
                    />
                    <CookieRow
                      name="refreshToken (localStorage)"
                      type="Esencial"
                      duration="30 días"
                      purpose="Token de renovación que permite extender tu sesión sin volver a iniciar sesión."
                    />
                    <CookieRow
                      name="user (localStorage)"
                      type="Funcional"
                      duration="Sesión"
                      purpose="Almacena datos básicos del perfil (nombre, email) para mostrarlos en la interfaz sin consultar el servidor."
                    />
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="3. Categorías de Cookies">

              <SubSection title="Cookies Esenciales (siempre activas)">
                <p>
                  Son necesarias para el funcionamiento básico del Servicio. Sin ellas no puedes
                  iniciar sesión ni navegar por la plataforma. No requieren tu consentimiento ya
                  que son imprescindibles para prestarte el servicio que solicitaste.
                </p>
              </SubSection>

              <SubSection title="Cookies Funcionales">
                <p>
                  Mejoran tu experiencia recordando tus preferencias (como el idioma o el estado
                  del menú lateral). Puedes desactivarlas, pero algunas funciones pueden verse
                  afectadas.
                </p>
              </SubSection>

              <SubSection title="Cookies Analíticas (futuro)">
                <p>
                  Actualmente no utilizamos cookies analíticas de terceros. En el futuro, si
                  implementamos herramientas de análisis, te lo notificaremos y solicitaremos
                  tu consentimiento previo.
                </p>
              </SubSection>

              <SubSection title="Cookies de Marketing (no utilizadas)">
                <p>
                  No utilizamos cookies de seguimiento publicitario ni compartimos datos con
                  redes publicitarias. Nunca lo haremos sin tu consentimiento explícito.
                </p>
              </SubSection>
            </Section>

            <Section title="4. Cookies de Terceros">
              <p>
                Algunos servicios integrados pueden establecer sus propias cookies:
              </p>
              <ul>
                <li>
                  Stripe — cuando procesas un pago, Stripe puede establecer cookies para
                  prevención de fraude. Consulta la{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    política de privacidad de Stripe
                  </a>
                </li>
              </ul>
              <p>
                No tenemos control sobre las cookies de terceros. Te recomendamos revisar sus
                políticas individuales.
              </p>
            </Section>

            <Section title="5. Cómo Gestionar las Cookies">
              <p>
                Puedes controlar y eliminar las cookies desde la configuración de tu navegador:
              </p>
              <ul>
                <li>
                  Chrome: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                </li>
                <li>
                  Firefox: Opciones → Privacidad y seguridad → Cookies y datos del sitio
                </li>
                <li>
                  Safari: Preferencias → Privacidad → Gestionar datos de sitios web
                </li>
                <li>
                  Edge: Configuración → Privacidad, búsqueda y servicios → Cookies
                </li>
              </ul>
              <p>
                Ten en cuenta que eliminar las cookies esenciales cerrará tu sesión y deberás
                volver a iniciar sesión. Bloquear todas las cookies puede impedir el funcionamiento
                correcto de la plataforma.
              </p>
              <p>
                Para eliminar el almacenamiento local (localStorage), puedes usar las herramientas
                de desarrollador de tu navegador (F12 → Application → Local Storage).
              </p>
            </Section>

            <Section title="6. Consentimiento">
              <p>
                Al crear una cuenta y usar el Servicio, aceptas el uso de las cookies esenciales
                descritas en esta política. Para cookies no esenciales (si las implementamos en el
                futuro), solicitaremos tu consentimiento explícito mediante un banner de cookies.
              </p>
            </Section>

            <Section title="7. Cambios a esta Política">
              <p>
                Podemos actualizar esta política cuando cambiemos las cookies que utilizamos.
                Los cambios significativos serán notificados con al menos 15 días de anticipación.
              </p>
            </Section>

            <Section title="8. Contacto">
              <p>
                Para preguntas sobre el uso de cookies:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-3">
                <p className="font-medium text-slate-800">Chill Numbers</p>
                <p className="text-slate-600">
                  Email:{' '}
                  <a href="mailto:privacy@chillnumbers.com" className="text-primary-600 hover:underline">
                    privacy@chillnumbers.com
                  </a>
                </p>
              </div>
            </Section>

          </div>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-primary-600 transition-colors">{t('terms')}</Link>
          <Link href="/privacy" className="hover:text-primary-600 transition-colors">{t('privacy')}</Link>
          <Link href="/" className="hover:text-primary-600 transition-colors">{t('backHome')}</Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 leading-relaxed space-y-3 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 pl-4 border-l-2 border-primary-100">
      <p className="font-medium text-slate-700 mb-2">{title}</p>
      {children}
    </div>
  )
}

function CookieRow({
  name, type, duration, purpose
}: {
  name: string
  type: string
  duration: string
  purpose: string
}) {
  const typeColor =
    type === 'Esencial'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200'

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-slate-700 align-top">{name}</td>
      <td className="px-4 py-3 align-top">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
          {type}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-600 align-top whitespace-nowrap">{duration}</td>
      <td className="px-4 py-3 text-slate-600 align-top">{purpose}</td>
    </tr>
  )
}
