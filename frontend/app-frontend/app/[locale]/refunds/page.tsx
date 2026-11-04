import Link from 'next/link'
import AppLogo from '@/components/ui/AppLogo'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Reembolsos — Chill Numbers',
  description: 'Condiciones de reembolso y cancelación para los planes de suscripción de Chill Numbers.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-3">{title}</h2>
      <div className="text-slate-600 dark:text-gray-400 leading-relaxed space-y-3 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}

export default async function RefundsPage() {
  const t = await getTranslations('legal')
  const lastUpdated = '3 de noviembre de 2026'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-8 md:p-12">

          {/* Title */}
          <div className="mb-10 pb-8 border-b border-slate-100 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">
              Política de Reembolsos
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">{t('lastUpdated')}: {lastUpdated}</p>
          </div>

          {/* Intro */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-5 mb-10 text-sm text-primary-800 dark:text-primary-300 leading-relaxed">
            Queremos que estés completamente satisfecho con Chill Numbers. Si por cualquier razón
            no quedas conforme, esta política explica tus opciones de reembolso de forma clara y
            sin letra pequeña.
          </div>

          <Section title="1. Período de Prueba Gratuita">
            <p>
              Todos los usuarios nuevos reciben <strong>30 días de prueba gratuita</strong> con acceso
              completo a todas las funciones, sin necesidad de tarjeta de crédito. Te recomendamos
              aprovechar este período para evaluar si el servicio se adapta a tus necesidades antes
              de suscribirte.
            </p>
            <p>
              No se realiza ningún cargo durante el período de prueba. Si decides no continuar,
              simplemente no suscribas — no hay nada que cancelar ni ningún cargo que reclamar.
            </p>
          </Section>

          <Section title="2. Política de Reembolso — Plan Mensual">
            <p>
              Si te suscribes al <strong>Plan Mensual ($9.99/mes)</strong> y no estás satisfecho,
              puedes solicitar un reembolso completo dentro de los <strong>7 días calendario</strong> siguientes
              a la fecha de tu primer pago.
            </p>
            <ul>
              <li>El reembolso aplica únicamente al primer pago de una nueva suscripción</li>
              <li>Las renovaciones mensuales posteriores no son reembolsables</li>
              <li>Puedes cancelar tu suscripción en cualquier momento para evitar cargos futuros</li>
              <li>Al cancelar, conservas el acceso hasta el final del período ya pagado</li>
            </ul>
          </Section>

          <Section title="3. Política de Reembolso — Plan Anual">
            <p>
              Si te suscribes al <strong>Plan Anual ($99.99/año)</strong>, puedes solicitar un
              reembolso completo dentro de los <strong>14 días calendario</strong> siguientes a
              la fecha del pago.
            </p>
            <ul>
              <li>El reembolso aplica únicamente dentro de los 14 días desde el cargo</li>
              <li>Pasado ese plazo, no se ofrecen reembolsos proporcionales por el tiempo no utilizado</li>
              <li>Puedes cancelar la renovación automática en cualquier momento desde Configuración → Facturación</li>
              <li>Al cancelar, conservas el acceso hasta el final del año ya pagado</li>
            </ul>
          </Section>

          <Section title="4. Cómo Solicitar un Reembolso">
            <p>
              Para solicitar un reembolso, contáctanos dentro del plazo aplicable:
            </p>
            <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-4 mt-3">
              <p className="font-medium text-slate-800 dark:text-gray-200">Email de soporte</p>
              <p className="text-slate-600 dark:text-gray-400">
                <a href="mailto:support@chillnumbers.com" className="text-primary-600 hover:underline">
                  support@chillnumbers.com
                </a>
              </p>
              <p className="text-slate-500 dark:text-gray-500 text-xs mt-2">
                Incluye en tu solicitud: el email de tu cuenta y la fecha del cargo. Respondemos en menos de 48 horas hábiles.
              </p>
            </div>
            <p>
              Los reembolsos se procesan a través de Stripe y se acreditan al método de pago
              original en un plazo de <strong>5 a 10 días hábiles</strong>, dependiendo de tu banco.
            </p>
          </Section>

          <Section title="5. Cancelación de Suscripción">
            <p>
              Puedes cancelar tu suscripción en cualquier momento desde:
              <strong> Configuración → Facturación → Gestionar suscripción</strong>
            </p>
            <p>
              La cancelación detiene la renovación automática. No se realizará ningún cargo adicional
              tras la cancelación. Seguirás teniendo acceso completo hasta el último día del período
              ya pagado.
            </p>
          </Section>

          <Section title="6. Excepciones">
            <p>No se ofrecen reembolsos en los siguientes casos:</p>
            <ul>
              <li>Solicitudes realizadas fuera del plazo establecido (7 días mensual / 14 días anual)</li>
              <li>Cuentas suspendidas por violación de los Términos de Servicio</li>
              <li>Períodos de prueba gratuita (no generan ningún cargo)</li>
              <li>Renovaciones automáticas cuando la cancelación ya era posible antes del cargo</li>
            </ul>
          </Section>

          <Section title="7. Cambios a Esta Política">
            <p>
              Podemos actualizar esta política ocasionalmente. Los cambios serán notificados por
              email con al menos 15 días de anticipación. La versión vigente siempre está disponible
              en esta página con su fecha de actualización.
            </p>
          </Section>

          <Section title="8. Contacto">
            <p>Para cualquier duda sobre reembolsos o facturación:</p>
            <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-4 mt-3">
              <p className="font-medium text-slate-800 dark:text-gray-200">Chill Numbers — Soporte</p>
              <p className="text-slate-600 dark:text-gray-400">
                Email:{' '}
                <a href="mailto:support@chillnumbers.com" className="text-primary-600 hover:underline">
                  support@chillnumbers.com
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-gray-400">
          <Link href="/terms"   className="hover:text-primary-600 transition-colors">Términos</Link>
          <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacidad</Link>
          <Link href="/pricing" className="hover:text-primary-600 transition-colors">Precios</Link>
          <Link href="/"        className="hover:text-primary-600 transition-colors">Inicio</Link>
        </div>
      </main>
    </div>
  )
}
