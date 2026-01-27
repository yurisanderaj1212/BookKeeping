'use client'

import { useState } from 'react'
import { X, Sparkles, Play, ArrowRight } from 'lucide-react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTour: () => void
  userName?: string
}

export default function WelcomeModal({ isOpen, onClose, onStartTour, userName = 'Usuario' }: WelcomeModalProps) {
  if (!isOpen) return null

  const handleStartTour = () => {
    onStartTour()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden border border-gray-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">¡Bienvenido a Chill Numbers!</h2>
              <p className="text-primary-100">Hola {userName}, tu cuenta está lista</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tu herramienta de contabilidad profesional
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Gestiona tus finanzas de manera inteligente con reportes automáticos, 
              análisis detallados y una interfaz diseñada para pequeñas empresas.
            </p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">📊</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Reportes Automáticos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">💰</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Control de Gastos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">👥</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Gestión de Empleados</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-primary-600 text-sm font-bold">📈</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Análisis Avanzado</p>
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-3">
            <button
              onClick={handleStartTour}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Comenzar Tour Guiado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium py-2"
            >
              Explorar por mi cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}