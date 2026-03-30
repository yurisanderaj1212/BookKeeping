'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

interface TourTooltipProps {
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  title: string
  description: string
  isVisible: boolean
}

export default function TourTooltip({ target, position, title, description, isVisible }: TourTooltipProps) {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!isVisible) return

    const targetElement = document.querySelector(target)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    let style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 60,
    }

    switch (position) {
      case 'top':
        style.top = rect.top + scrollTop - 10
        style.left = rect.left + scrollLeft + rect.width / 2
        style.transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        style.top = rect.bottom + scrollTop + 10
        style.left = rect.left + scrollLeft + rect.width / 2
        style.transform = 'translate(-50%, 0)'
        break
      case 'left':
        style.top = rect.top + scrollTop + rect.height / 2
        style.left = rect.left + scrollLeft - 10
        style.transform = 'translate(-100%, -50%)'
        break
      case 'right':
        style.top = rect.top + scrollTop + rect.height / 2
        style.left = rect.right + scrollLeft + 10
        style.transform = 'translate(0, -50%)'
        break
    }

    setTooltipStyle(style)
  }, [target, position, isVisible])

  if (!isVisible) return null

  const ArrowIcon = {
    top: ArrowUp,
    bottom: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight
  }[position]

  return (
    <div style={tooltipStyle} className="max-w-xs">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative">
        {/* Arrow */}
        <div className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
          position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-r-0 border-t-0' :
          position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-l-0 border-b-0' :
          position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t-0 border-l-0' :
          'left-[-6px] top-1/2 -translate-y-1/2 border-b-0 border-r-0'
        }`} />
        
        <div className="flex items-start space-x-2">
          <ArrowIcon className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}