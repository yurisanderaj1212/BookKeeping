'use client'

import { useEffect, useState } from 'react'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface TourTooltipProps {
  target: string
  title: string
  description: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isVisible: boolean
}

export default function TourTooltipWithArrow({
  target,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isVisible
}: TourTooltipProps) {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({})
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')

  useEffect(() => {
    if (!isVisible) return

    const updatePosition = () => {
      const targetElement = document.querySelector(target)
      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      const tooltipWidth = Math.min(350, windowWidth - 40) // Responsive width
      const tooltipHeight = 240 // Increased for better content fit
      const arrowSize = 12
      const margin = 20

      let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
      let style: React.CSSProperties = {}
      let arrow: React.CSSProperties = {}

      // Calculate available space in each direction
      const spaceTop = rect.top
      const spaceBottom = windowHeight - rect.bottom
      const spaceLeft = rect.left
      const spaceRight = windowWidth - rect.right

      // Special handling for sidebar step - always position to the right
      if (target === '[data-tour="sidebar"]') {
        bestPosition = 'right'
      } else {
        // Determine best position based on available space and screen position
        const positions = [
          { pos: 'bottom', space: spaceBottom, minSpace: tooltipHeight + margin },
          { pos: 'top', space: spaceTop, minSpace: tooltipHeight + margin },
          { pos: 'right', space: spaceRight, minSpace: tooltipWidth + margin },
          { pos: 'left', space: spaceLeft, minSpace: tooltipWidth + margin }
        ]

        // Sort by available space and find the best fit
        const validPositions = positions.filter(p => p.space >= p.minSpace)
        if (validPositions.length > 0) {
          bestPosition = validPositions.sort((a, b) => b.space - a.space)[0].pos as any
        } else {
          // Fallback: choose position with most space even if not ideal
          bestPosition = positions.sort((a, b) => b.space - a.space)[0].pos as any
        }
      }

      const centerX = rect.left + scrollLeft + rect.width / 2
      const centerY = rect.top + scrollTop + rect.height / 2

      switch (bestPosition) {
        case 'top':
          const topY = Math.max(margin, rect.top + scrollTop - tooltipHeight - arrowSize - 10)
          const topX = Math.max(margin, Math.min(windowWidth - tooltipWidth - margin, centerX - tooltipWidth / 2))
          
          style = {
            position: 'absolute',
            top: topY,
            left: topX,
            width: tooltipWidth,
            zIndex: 1000,
          }
          arrow = {
            position: 'absolute',
            bottom: -arrowSize,
            left: Math.max(15, Math.min(tooltipWidth - 25, centerX - topX)),
            width: 0,
            height: 0,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderTop: `${arrowSize}px solid white`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }
          break

        case 'bottom':
          const bottomY = Math.min(windowHeight - tooltipHeight - margin, rect.bottom + scrollTop + arrowSize + 10)
          const bottomX = Math.max(margin, Math.min(windowWidth - tooltipWidth - margin, centerX - tooltipWidth / 2))
          
          style = {
            position: 'absolute',
            top: bottomY,
            left: bottomX,
            width: tooltipWidth,
            zIndex: 1000,
          }
          arrow = {
            position: 'absolute',
            top: -arrowSize,
            left: Math.max(15, Math.min(tooltipWidth - 25, centerX - bottomX)),
            width: 0,
            height: 0,
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid white`,
            filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.1))',
          }
          break

        case 'left':
          const leftX = Math.max(margin, rect.left + scrollLeft - tooltipWidth - arrowSize - 10)
          const leftY = Math.max(margin, Math.min(windowHeight - tooltipHeight - margin, centerY - tooltipHeight / 2))
          
          style = {
            position: 'absolute',
            top: leftY,
            left: leftX,
            width: tooltipWidth,
            zIndex: 1000,
          }
          arrow = {
            position: 'absolute',
            right: -arrowSize,
            top: Math.max(15, Math.min(tooltipHeight - 25, centerY - leftY)),
            width: 0,
            height: 0,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderLeft: `${arrowSize}px solid white`,
            filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))',
          }
          break

        case 'right':
          // For sidebar, position tooltip further to the right to avoid overlap
          const rightOffset = target === '[data-tour="sidebar"]' ? 20 : 10
          const rightX = Math.min(windowWidth - tooltipWidth - margin, rect.right + scrollLeft + arrowSize + rightOffset)
          const rightY = Math.max(margin, Math.min(windowHeight - tooltipHeight - margin, centerY - tooltipHeight / 2))
          
          style = {
            position: 'absolute',
            top: rightY,
            left: rightX,
            width: tooltipWidth,
            zIndex: 1000,
          }
          arrow = {
            position: 'absolute',
            left: -arrowSize,
            top: Math.max(15, Math.min(tooltipHeight - 25, centerY - rightY)),
            width: 0,
            height: 0,
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid white`,
            filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.1))',
          }
          break
      }

      setPosition(bestPosition)
      setTooltipStyle(style)
      setArrowStyle(arrow)
    }

    // Initial position update with delay to ensure DOM is ready
    const initialTimeout = setTimeout(updatePosition, 200)
    
    // Add event listeners for dynamic updates
    const handleResize = () => {
      setTimeout(updatePosition, 100)
    }
    
    const handleScroll = () => {
      setTimeout(updatePosition, 50)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(initialTimeout)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [target, isVisible])

  if (!isVisible) return null

  return (
    <div style={tooltipStyle} className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Arrow */}
      <div style={arrowStyle} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-primary-50 to-primary-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">{currentStep + 1}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            <p className="text-xs text-gray-500">Paso {currentStep + 1} de {totalSteps}</p>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 leading-relaxed mb-4 text-sm">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors text-xs font-medium"
          >
            Saltar tour
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={onPrevious}
                className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={onNext}
              className="flex items-center space-x-1 bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium text-xs"
            >
              <span>
                {currentStep === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
              </span>
              {currentStep === totalSteps - 1 ? (
                <Check className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}