import type { Metadata } from 'next'
import Link from 'next/link'
import AppLogo from '@/components/ui/AppLogo'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Chill Numbers',
  description: 'Conoce cómo Chill Numbers recopila, usa y protege tu información personal.',
}

export default function PrivacyPage() {
  const lastUpdated = '19 de marzo de 2026'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <AppLogo size={32} variant="full" />
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-10 pb-8 border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
            <p className="text-sm text-slate-500">Última actualización: {lastUpdated}</p>
          </div>

          {/* Intro highlight */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-10 text-sm text-primary-800 leading-relaxed">
            Tu privacidad es fundamental para nosotros. Esta política explica de forma clara qué
            datos recopilamos, por qué los recopilamos y cómo los protegemos. No vendemos tu
            información personal a terceros, nunca.
          </div>

          <div className="prose-legal">

            <Section title="1. Quiénes Somos">
              <p>
                Chill Numbers ("nosotros", "nuestro") opera la plataforma de gestión financiera
                disponible en chillnumbers.com. Somos el responsable del tratamiento de tus datos
                personales conforme a esta política.
              </p>
              <p>
                Contacto de privacidad:{' '}
                <a href="mailto:privacy@chillnumbers.com" className="text-primary-600 hover:underline">
                  privacy@chillnumbers.com
                </a>
              </p>
            </Section>

            <Section title="2. Información que Recopilamos">
              <p>Recopilamos los siguientes tipos de información:</p>

              <SubSection title="Información que nos proporcionas directamente">
                <ul>
                  <li>Nombre y apellido</li>
                  <li>Dirección de email</li>
                  <li>Contraseña (almacenada con hash bcrypt — nunca en texto plano)</li>
                  <li>Datos financieros que ingresas: transacciones, cuentas, empleados, categorías</li>
                  <li>Información de perfil opcional: teléfono, cargo</li>
                </ul>
              </SubSection>

              <SubSection title="Información recopilada automáticamente">
                <ul>
                  <li>Dirección IP y datos de geolocalización aproximada</li>
                  <li>Tipo de navegador y sistema operativo</li>
                  <li>Páginas visitadas y tiempo de uso</li>
                  <li>Tokens de sesión (JWT) para mantener tu sesión activa</li>
                  <li>Logs de acceso para seguridad y detección de fraude</li>
                </ul>
              </SubSection>

              <SubSection title="Información de terceros">
                <ul>
                  <li>Datos de procesadores de pago (Stripe) — solo recibimos confirmación de pago, no datos de tarjeta</li>
                  <li>En el futuro: datos de integración bancaria (Plaid) — solo con tu consentimiento explícito</li>
                </ul>
              </SubSection>
            </Section>

            <Section title="3. Cómo Usamos tu Información">
              <p>Utilizamos tu información para:</p>
              <ul>
                <li>Proveer, mantener y mejorar el Servicio</li>
                <li>Autenticar tu identidad y proteger tu cuenta</li>
                <li>Procesar pagos y gestionar tu suscripción</li>
                <li>Enviarte notificaciones del servicio (no marketing sin consentimiento)</li>
                <li>Detectar y prevenir fraude, abuso y actividades ilegales</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Analizar el uso agregado y anónimo para mejorar la plataforma</li>
              </ul>
              <p>
                Nunca usamos tus datos financieros para publicidad ni los compartimos con
                anunciantes.
              </p>
            </Section>

            <Section title="4. Base Legal del Tratamiento">
              <p>Tratamos tus datos bajo las siguientes bases legales:</p>
              <ul>
                <li>Ejecución del contrato — para prestarte el Servicio que contrataste</li>
                <li>Interés legítimo — para seguridad, prevención de fraude y mejora del servicio</li>
                <li>Consentimiento — para comunicaciones de marketing (puedes retirarlo en cualquier momento)</li>
                <li>Obligación legal — cuando la ley nos exige conservar o divulgar datos</li>
              </ul>
            </Section>

            <Section title="5. Compartición de Datos">
              <p>
                No vendemos tu información personal. Podemos compartir datos con terceros únicamente en
                estos casos:
              </p>
              <ul>
                <li>
                  Proveedores de servicio que nos ayudan a operar la plataforma (hosting, email
                  transaccional, procesamiento de pagos) — bajo contratos de confidencialidad
                </li>
                <li>
                  Autoridades legales cuando sea requerido por ley, orden judicial o para proteger
                  derechos legales
                </li>
                <li>
                  En caso de fusión, adquisición o venta de activos — con notificación previa a los
                  usuarios afectados
                </li>
              </ul>

              <p>Proveedores actuales relevantes:</p>
              <ul>
                <li>Stripe — procesamiento de pagos (política: stripe.com/privacy)</li>
                <li>SendGrid — emails transaccionales (política: sendgrid.com/privacy)</li>
              </ul>
            </Section>

            <Section title="6. Seguridad de los Datos">
              <p>
                Implementamos medidas técnicas y organizativas para proteger tu información:
              </p>
              <ul>
                <li>Contraseñas hasheadas con bcrypt (factor de costo 12)</li>
                <li>Tokens JWT con expiración corta (1 hora) y refresh tokens rotativos</li>
                <li>Bloqueo automático de cuenta tras 5 intentos fallidos de login</li>
                <li>Transmisión cifrada mediante TLS/HTTPS</li>
                <li>Tokens de reset de contraseña hasheados con SHA-256 y expiración de 15 minutos</li>
                <li>Headers de seguridad HTTP en todas las respuestas</li>
                <li>Rate limiting para prevenir ataques de fuerza bruta</li>
              </ul>
              <p>
                Ningún sistema es 100% seguro. En caso de brecha de seguridad que afecte tus datos,
                te notificaremos dentro de las 72 horas siguientes a tener conocimiento del incidente.
              </p>
            </Section>

            <Section title="7. Retención de Datos">
              <p>
                Conservamos tus datos mientras tu cuenta esté activa o sea necesario para prestarte
                el Servicio. Tras la cancelación de tu cuenta:
              </p>
              <ul>
                <li>Datos de cuenta: eliminados dentro de los 30 días siguientes a la solicitud</li>
                <li>Datos financieros: eliminados junto con la cuenta salvo obligación legal de retención</li>
                <li>Logs de seguridad: conservados hasta 12 meses por razones de seguridad</li>
                <li>Datos de facturación: conservados 7 años por obligaciones fiscales</li>
              </ul>
            </Section>

            <Section title="8. Tus Derechos">
              <p>Tienes derecho a:</p>
              <ul>
                <li>Acceder a los datos personales que tenemos sobre ti</li>
                <li>Rectificar datos inexactos o incompletos</li>
                <li>Solicitar la eliminación de tus datos ("derecho al olvido")</li>
                <li>Portabilidad de datos — exportar tus datos en formato legible</li>
                <li>Oponerte al tratamiento basado en interés legítimo</li>
                <li>Retirar el consentimiento en cualquier momento</li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, escríbenos a{' '}
                <a href="mailto:privacy@chillnumbers.com" className="text-primary-600 hover:underline">
                  privacy@chillnumbers.com
                </a>
                . Responderemos dentro de los 30 días siguientes.
              </p>
            </Section>

            <Section title="9. Cookies">
              <p>
                Utilizamos cookies y tecnologías similares para mantener tu sesión y mejorar tu
                experiencia. Consulta nuestra{' '}
                <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                  Política de Cookies
                </Link>{' '}
                para más detalles.
              </p>
            </Section>

            <Section title="10. Transferencias Internacionales">
              <p>
                Tus datos pueden ser procesados en servidores ubicados en Estados Unidos. Al usar
                el Servicio, consientes esta transferencia. Nos aseguramos de que cualquier
                transferencia internacional cumpla con las salvaguardas legales aplicables.
              </p>
            </Section>

            <Section title="11. Menores de Edad">
              <p>
                El Servicio no está dirigido a personas menores de 18 años. No recopilamos
                conscientemente datos de menores. Si detectamos que hemos recopilado datos de un
                menor, los eliminaremos de inmediato.
              </p>
            </Section>

            <Section title="12. Cambios a esta Política">
              <p>
                Podemos actualizar esta Política periódicamente. Los cambios materiales serán
                notificados por email o mediante aviso en el Servicio con al menos 15 días de
                anticipación. La fecha de "última actualización" al inicio del documento siempre
                refleja la versión vigente.
              </p>
            </Section>

            <Section title="13. Contacto">
              <p>Para cualquier consulta sobre privacidad:</p>
              <div className="bg-slate-50 rounded-lg p-4 mt-3">
                <p className="font-medium text-slate-800">Chill Numbers — Privacidad</p>
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
          <Link href="/terms" className="hover:text-primary-600 transition-colors">Términos de Servicio</Link>
          <Link href="/cookies" className="hover:text-primary-600 transition-colors">Política de Cookies</Link>
          <Link href="/" className="hover:text-primary-600 transition-colors">Volver al inicio</Link>
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
    <div className="mt-3">
      <p className="font-medium text-slate-700 mb-2">{title}</p>
      {children}
    </div>
  )
}
