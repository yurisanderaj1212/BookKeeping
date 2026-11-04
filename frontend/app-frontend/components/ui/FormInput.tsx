import { forwardRef } from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    const errorId  = props.id ? `${props.id}-error`  : undefined
    const helperId = props.id ? `${props.id}-helper` : undefined

    return (
      <div className="space-y-1">
        <label htmlFor={props.id} className="block text-sm font-medium text-slate-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          {props.required && <span className="sr-only">(requerido)</span>}
        </label>

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <div className="h-5 w-5 text-slate-400">
                {icon}
              </div>
            </div>
          )}

          <input
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            aria-required={props.required}
            className={`
              appearance-none block w-full px-3 py-3 border rounded-lg placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              sm:text-sm transition-colors
              ${icon ? 'pl-10' : ''}
              ${error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-300'
              }
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput