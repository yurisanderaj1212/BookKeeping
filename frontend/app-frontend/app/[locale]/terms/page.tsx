'use client'

import Link from 'next/link'
import AppLogo from '@/components/ui/AppLogo'
import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('legal')
  const lastUpdated = '19 de marzo de 2026'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-10 pb-8 border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('termsTitle')}</h1>
            <p className="text-sm text-slate-500">{t('lastUpdated')}: {lastUpdated}</p>
          </div>

          <div className="prose-legal">

            <Section title="1. Aceptación de los Términos">
              <p>
                Al acceder o utilizar los servicios de Chill Numbers ("el Servicio"), aceptas quedar
                vinculado por estos Términos de Servicio ("Términos"). Si no estás de acuerdo con
                alguna parte de estos términos, no podrás acceder al Servicio.
              </p>
              <p>
                Estos Términos se aplican a todos los visitantes, usuarios y cualquier otra persona
                que acceda o utilice el Servicio.
              </p>
            </Section>

            <Section title="2. Descripción del Servicio">
              <p>
                Chill Numbers es una plataforma de gestión financiera y contabilidad diseñada para
                individuos y pequeñas empresas. El Servicio permite a los usuarios:
              </p>
              <ul>
                <li>Registrar y categorizar transacciones financieras</li>
                <li>Gestionar cuentas bancarias y balances</li>
                <li>Generar reportes financieros</li>
                <li>Administrar empleados y nómina básica</li>
                <li>Visualizar dashboards con métricas financieras en tiempo real</li>
              </ul>
            </Section>

            <Section title="3. Cuentas de Usuario">
              <p>
                Para utilizar el Servicio debes crear una cuenta proporcionando información precisa,
                completa y actualizada. Eres responsable de:
              </p>
              <ul>
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>Todas las actividades que ocurran bajo tu cuenta</li>
                <li>Notificarnos inmediatamente ante cualquier uso no autorizado</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o cancelar cuentas que violen estos Términos,
                proporcionen información falsa, o sean utilizadas de manera fraudulenta.
              </p>
            </Section>

            <Section title="4. Uso Aceptable">
              <p>Aceptas no utilizar el Servicio para:</p>
              <ul>
                <li>Actividades ilegales o que violen cualquier ley aplicable</li>
                <li>Evasión fiscal o cualquier forma de fraude financiero</li>
                <li>Cargar, transmitir o distribuir malware o código malicioso</li>
                <li>Intentar acceder sin autorización a sistemas o datos de otros usuarios</li>
                <li>Realizar ingeniería inversa o intentar extraer el código fuente del Servicio</li>
                <li>Revender o sublicenciar el acceso al Servicio sin autorización expresa</li>
              </ul>
            </Section>

            <Section title="5. Propiedad Intelectual">
              <p>
                El Servicio y su contenido original, características y funcionalidades son y
                seguirán siendo propiedad exclusiva de Chill Numbers y sus licenciantes. Nuestras
                marcas comerciales y imagen comercial no pueden ser utilizadas en conexión con ningún
                producto o servicio sin el consentimiento previo por escrito.
              </p>
              <p>
                Los datos que ingreses al Servicio son de tu propiedad. Nos otorgas una licencia
                limitada para procesar dichos datos únicamente con el fin de prestarte el Servicio.
              </p>
            </Section>

            <Section title="6. Privacidad y Datos">
              <p>
                El uso de tu información personal está regido por nuestra{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                  Política de Privacidad
                </Link>
                , la cual forma parte integral de estos Términos. Al utilizar el Servicio, aceptas
                las prácticas descritas en dicha política.
              </p>
            </Section>

            <Section title="7. Planes y Pagos">
              <p>
                Algunos aspectos del Servicio pueden estar sujetos a pago. Los precios están
                indicados en nuestra página de precios y pueden cambiar con previo aviso de 30 días.
              </p>
              <ul>
                <li>Los pagos se procesan de forma segura a través de Stripe</li>
                <li>Las suscripciones se renuevan automáticamente salvo que se cancelen</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu perfil</li>
                <li>La política de reembolsos específica se detallará en la página de precios</li>
              </ul>
            </Section>

            <Section title="8. Disponibilidad del Servicio">
              <p>
                Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos
                disponibilidad ininterrumpida. Podemos suspender temporalmente el acceso para
                mantenimiento, actualizaciones o por causas fuera de nuestro control.
              </p>
              <p>
                No seremos responsables por pérdidas derivadas de interrupciones del servicio,
                siempre que actuemos con diligencia razonable para restaurarlo.
              </p>
            </Section>

            <Section title="9. Limitación de Responsabilidad">
              <p>
                En ningún caso Chill Numbers, sus directores, empleados o agentes serán responsables
                por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo
                pérdida de beneficios, datos o buena voluntad, derivados del uso o la imposibilidad
                de usar el Servicio.
              </p>
              <p>
                Chill Numbers es una herramienta de gestión financiera y no constituye asesoramiento
                contable, fiscal o legal. Consulta a un profesional certificado para decisiones
                financieras importantes.
              </p>
            </Section>

            <Section title="10. Indemnización">
              <p>
                Aceptas defender, indemnizar y mantener indemne a Chill Numbers y sus afiliados
                frente a cualquier reclamación, daño, obligación, pérdida o gasto (incluidos
                honorarios legales razonables) derivados de tu uso del Servicio o violación de
                estos Términos.
              </p>
            </Section>

            <Section title="11. Modificaciones">
              <p>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los
                cambios materiales serán notificados con al menos 15 días de anticipación por email
                o mediante un aviso prominente en el Servicio. El uso continuado del Servicio tras
                la notificación constituye aceptación de los nuevos términos.
              </p>
            </Section>

            <Section title="12. Terminación">
              <p>
                Podemos suspender o cancelar tu acceso al Servicio de inmediato, sin previo aviso,
                si incumples estos Términos. Tras la terminación, tu derecho a usar el Servicio
                cesará inmediatamente. Puedes exportar tus datos antes de cancelar tu cuenta.
              </p>
            </Section>

            <Section title="13. Ley Aplicable">
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes del Estado de
                Delaware, Estados Unidos, sin tener en cuenta sus disposiciones sobre conflicto de
                leyes. Cualquier disputa se someterá a la jurisdicción exclusiva de los tribunales
                competentes de dicho estado.
              </p>
            </Section>

            <Section title="14. Contacto">
              <p>
                Si tienes preguntas sobre estos Términos, contáctanos en:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-3">
                <p className="font-medium text-slate-800">Chill Numbers</p>
                <p className="text-slate-600">Email: <a href="mailto:legal@chillnumbers.com" className="text-primary-600 hover:underline">legal@chillnumbers.com</a></p>
              </div>
            </Section>

          </div>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-primary-600 transition-colors">{t('privacy')}</Link>
          <Link href="/cookies" className="hover:text-primary-600 transition-colors">{t('cookies')}</Link>
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
