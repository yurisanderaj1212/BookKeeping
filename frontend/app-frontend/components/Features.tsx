'use client'

import { useEffect, useState } from 'react'

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const features = [
    {
      name: 'Panel Inteligente',
      description: 'Obtén una visión completa de tu salud financiera con información en tiempo real y visualizaciones',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Transacciones Fáciles',
      description: 'Agrega y rastrea transacciones manualmente o conecta tu cuenta bancaria para importaciones automáticas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Gestión de Equipo',
      description: 'Administra empleados, socios y asigna roles con permisos personalizables',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'Reportes Profesionales',
      description: 'Genera estados financieros detallados y expórtalos en formato PDF o CSV',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Análisis Avanzado',
      description: 'Visualiza tus datos con gráficos interactivos y compara el rendimiento a lo largo del tiempo',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Cierre Semanal',
      description: 'Cierra tus libros semanalmente con bloqueo automático para mantener la integridad de los datos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ]

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(features.length / 3))
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [features.length])

  const getVisibleFeatures = () => {
    const featuresPerSlide = 3
    const startIndex = currentIndex * featuresPerSlide
    return features.slice(startIndex, startIndex + featuresPerSlide)
  }

  return (
    <div id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
            Funciones Poderosas
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Todo lo que necesitas para gestionar las finanzas de tu negocio en un solo lugar
          </p>
        </div>
        
        {/* Carousel Container */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(features.length / 3) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0">
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
                    {features.slice(slideIndex * 3, slideIndex * 3 + 3).map((feature) => (
                      <div key={feature.name} className="flex flex-col items-center text-center">
                        <dt className="flex flex-col items-center gap-y-4 text-base font-semibold leading-7 text-navy-800">
                          <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                            {feature.icon}
                          </div>
                          {feature.name}
                        </dt>
                        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                          <p className="flex-auto">{feature.description}</p>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(features.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-primary-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}