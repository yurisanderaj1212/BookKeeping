import Link from 'next/link'

export default function CTA() {
  return (
    <div className="bg-primary-500">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¿Listo para Tomar Control de Tus Finanzas?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
            Únete a miles de negocios que gestionan su contabilidad con facilidad
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-lg transition-all duration-200 hover:shadow-medium"
            >
              Comienza Tu Prueba Gratuita Hoy
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-linear-to-br from-blue-900 via-blue-800 to-indigo-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CN</span>
              </div>
              <span className="text-lg font-bold text-white">Chill Numbers</span>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-blue-200 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-blue-200 hover:text-white transition-colors">
                Términos de Servicio
              </Link>
              <Link href="/contact" className="text-blue-200 hover:text-white transition-colors">
                Contacto
              </Link>
            </div>
          </div>
          
          <div className="mt-8 border-t border-blue-700 pt-8">
            <p className="text-center text-sm text-blue-200">
              © 2024 Chill Numbers. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}