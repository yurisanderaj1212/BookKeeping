import Link from 'next/link'

export default function Pricing() {
  const plans = [
    {
      name: 'Prueba Gratuita',
      description: 'Perfecto para comenzar',
      price: '$0',
      period: '/mes',
      highlight: 'Primeros 2 meses gratis',
      features: [
        'Acceso al panel',
        'Transacciones manuales',
        'Reportes básicos',
        'Hasta 50 transacciones/mes',
        'Soporte por email',
      ],
      cta: 'Comenzar Prueba Gratuita',
      ctaLink: '/auth/register',
      popular: false,
    },
    {
      name: 'Plan Anual',
      description: 'El mejor valor para tu negocio',
      price: '$99.99',
      period: '/año',
      highlight: 'Ahorra $19.89 al año',
      features: [
        'Todo en Gratuito',
        'Transacciones ilimitadas',
        'Integración bancaria (Plaid)',
        'Análisis avanzado',
        'Función de cierre semanal',
        'Gestión de equipo',
        'Soporte prioritario',
        'Respaldos automáticos',
        'Categorías personalizadas',
        'Reportes por email',
        'Acceso multiplataforma',
      ],
      cta: 'Elegir Plan Anual',
      ctaLink: '/auth/register',
      popular: true,
    },
    {
      name: 'Plan Mensual',
      description: 'Flexibilidad mes a mes',
      price: '$9.99',
      period: '/mes',
      highlight: 'Facturado mensualmente después de la prueba',
      features: [
        'Todo en Gratuito',
        'Transacciones ilimitadas',
        'Integración bancaria (Plaid)',
        'Análisis avanzado',
        'Función de cierre semanal',
        'Gestión de equipo',
        'Soporte prioritario',
        'Respaldos automáticos',
        'Categorías personalizadas',
      ],
      cta: 'Elegir Plan Mensual',
      ctaLink: '/auth/register',
      popular: false,
    },
  ]

  return (
    <div id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
            Precios Simples y Transparentes
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Comienza gratis, actualiza cuando estés listo. Sin tarifas ocultas.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-6xl lg:grid-cols-3">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.name}
              className={`${
                plan.popular
                  ? 'relative bg-linear-to-br from-primary-400 via-primary-500 to-cyan-500 text-white shadow-strong ring-2 ring-primary-400 lg:z-10 scale-105'
                  : 'bg-white/60 shadow-soft'
              } rounded-3xl p-8 lg:mx-0 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-16`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 px-3 py-2 text-sm font-medium text-white text-center shadow-lg">
                  Popular
                </div>
              )}
              
              <div className="mx-auto max-w-xs lg:mx-0 lg:flex-auto">
                <h3 className={`text-2xl font-bold tracking-tight ${
                  plan.popular ? 'text-white' : 'text-navy-800'
                }`}>
                  {plan.name}
                </h3>
                <p className={`mt-6 text-base leading-7 ${
                  plan.popular ? 'text-blue-100' : 'text-slate-600'
                }`}>
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-5xl font-bold tracking-tight ${
                    plan.popular ? 'text-white' : 'text-navy-800'
                  }`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${
                    plan.popular ? 'text-blue-100' : 'text-slate-600'
                  }`}>
                    {plan.period}
                  </span>
                </p>
                <p className={`mt-3 text-sm leading-6 font-medium ${
                  plan.popular ? 'text-cyan-200' : 'text-primary-600'
                }`}>
                  {plan.highlight}
                </p>
                
                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${
                  plan.popular ? 'text-blue-100' : 'text-slate-600'
                }`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className={`h-6 w-5 flex-none ${
                          plan.popular ? 'text-cyan-200' : 'text-primary-500'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={plan.ctaLink}
                  className={`${
                    plan.popular
                      ? 'bg-white text-primary-600 shadow-sm hover:bg-blue-50 focus-visible:outline-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600'
                  } mt-8 block w-full rounded-lg px-3 py-2 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 transition-all duration-200`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}