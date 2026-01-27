export default function About() {
  const team = [
    {
      name: 'María González',
      role: 'CEO & Fundadora',
      description: 'Ex-contadora con 15 años de experiencia ayudando a pequeñas empresas a gestionar sus finanzas.',
      image: '👩‍💼',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      description: 'Ingeniero de software especializado en fintech con pasión por simplificar procesos complejos.',
      image: '👨‍💻',
    },
    {
      name: 'Ana Martínez',
      role: 'Directora de Producto',
      description: 'Diseñadora UX con experiencia en crear interfaces intuitivas para aplicaciones financieras.',
      image: '👩‍🎨',
    },
  ]

  const stats = [
    { label: 'Empresas Activas', value: '10,000+' },
    { label: 'Transacciones Procesadas', value: '2M+' },
    { label: 'Países', value: '25+' },
    { label: 'Satisfacción del Cliente', value: '98%' },
  ]

  return (
    <div id="about" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
            Sobre Nosotros
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Conoce al equipo detrás de Chill Numbers y nuestra misión de simplificar la contabilidad
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="text-2xl font-bold text-navy-800 mb-6 text-center">
              Nuestra Misión
            </h3>
            <p className="text-lg text-slate-600 text-center leading-relaxed">
              En Chill Numbers, creemos que la contabilidad no debería ser complicada. Nuestra misión es 
              democratizar el acceso a herramientas financieras profesionales, permitiendo que cualquier 
              persona o pequeña empresa pueda gestionar sus finanzas con confianza y simplicidad.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 text-center shadow-soft">
                <dt className="text-sm font-medium text-slate-600">{stat.label}</dt>
                <dd className="mt-2 text-3xl font-bold text-primary-600">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Team */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-navy-800">
              Nuestro Equipo
            </h3>
            <p className="mt-4 text-lg text-slate-600">
              Profesionales apasionados por hacer la contabilidad accesible para todos
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-8 text-center shadow-soft hover:shadow-medium transition-shadow duration-300">
                <div className="text-6xl mb-4">{member.image}</div>
                <dt className="text-xl font-bold text-navy-800">{member.name}</dt>
                <dd className="mt-2 text-primary-600 font-semibold">{member.role}</dd>
                <dd className="mt-4 text-slate-600 leading-relaxed">{member.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Values */}
        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-navy-800">
              Nuestros Valores
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-navy-800 mb-2">Simplicidad</h4>
              <p className="text-slate-600">
                Creemos que las herramientas financieras deben ser intuitivas y fáciles de usar para todos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-navy-800 mb-2">Confianza</h4>
              <p className="text-slate-600">
                La seguridad de tus datos financieros es nuestra máxima prioridad en todo lo que hacemos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-navy-800 mb-2">Comunidad</h4>
              <p className="text-slate-600">
                Construimos herramientas pensando en las necesidades reales de nuestra comunidad de usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}