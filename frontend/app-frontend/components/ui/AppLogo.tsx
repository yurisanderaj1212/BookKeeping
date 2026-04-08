interface AppLogoProps {
  size?: number
  className?: string
  variant?: 'icon' | 'full'
  textColor?: string
}

export default function AppLogo({ size = 36, className = '', variant = 'icon', textColor }: AppLogoProps) {
  // viewBox fijo 100x100 — fontSize 22 garantiza que "Numbers" cabe con margen
  const Icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={variant === 'icon' ? className : undefined}
      aria-label="Chill Numbers"
      role="img"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="100" height="100" rx="16" ry="16" fill="#2a9d9c" />
      <text
        x="8"
        y="40"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="19"
        fill="white"
        dominantBaseline="middle"
      >
        Chill
      </text>
      <text
        x="8"
        y="68"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="19"
        fill="white"
        dominantBaseline="middle"
      >
        Numbers
      </text>
    </svg>
  )

  if (variant === 'icon') return Icon

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      {Icon}
      <span
        className="text-gray-900 dark:text-gray-100"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 700,
          fontSize: Math.round(size * 0.44),
          color: textColor,  // only applied if explicitly passed
          lineHeight: 1,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        Chill Numbers
      </span>
    </div>
  )
}
