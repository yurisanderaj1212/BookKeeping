import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">CN</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Chill Numbers</span>
        </div>

        {/* 404 */}
        <div className="text-8xl font-black text-primary-500 mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Página de inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
