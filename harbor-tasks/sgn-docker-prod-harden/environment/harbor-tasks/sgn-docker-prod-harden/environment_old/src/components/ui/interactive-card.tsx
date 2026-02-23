'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpRight, Info } from 'lucide-react'

interface InteractiveCardProps {
  value: number
  label: string
  description?: string
  icon?: React.ReactNode
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'gray'
  onClick?: () => void
  href?: string
  className?: string
}

const colorClasses = {
  red: {
    bg: 'bg-red-50 hover:bg-red-100',
    text: 'text-red-600',
    border: 'border-red-200 hover:border-red-300',
    icon: 'text-red-500'
  },
  orange: {
    bg: 'bg-orange-50 hover:bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200 hover:border-orange-300',
    icon: 'text-orange-500'
  },
  yellow: {
    bg: 'bg-yellow-50 hover:bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200 hover:border-yellow-300',
    icon: 'text-yellow-500'
  },
  blue: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200 hover:border-blue-300',
    icon: 'text-blue-500'
  },
  green: {
    bg: 'bg-green-50 hover:bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200 hover:border-green-300',
    icon: 'text-green-500'
  },
  gray: {
    bg: 'bg-gray-50 hover:bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200 hover:border-gray-300',
    icon: 'text-gray-500'
  }
}

export function InteractiveCard({
  value,
  label,
  description,
  icon,
  color,
  onClick,
  href,
  className
}: InteractiveCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const colors = colorClasses[color]

  const handleClick = () => {
    if (href) {
      window.open(href, '_blank')
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={cn(
        'relative text-center p-6 rounded-xl border border-gray-200 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:border-gray-300 bg-white',
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Ícone de navegação */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
        <div className="p-1 bg-gray-100 rounded-full">
          <ArrowUpRight className="h-3 w-3 text-gray-500" />
        </div>
      </div>

      {/* Ícone principal */}
      {icon && (
        <div className={cn('flex justify-center mb-4', colors.icon)}>
          <div className="p-3 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
            {icon}
          </div>
        </div>
      )}

      {/* Valor */}
      <div className={cn('text-3xl font-bold mb-2', colors.text)}>
        {value}
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-gray-900 mb-1">
        {label}
      </div>

      {/* Tooltip */}
      {showTooltip && description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-20 max-w-xs">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span className="leading-relaxed">{description}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}
