import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, startIcon, endIcon, id, ...props }, ref) => {
    
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 text-[var(--color-text-secondary)]">
              {startIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              flex h-10 w-full rounded-md border 
              ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
              bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] 
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-offset-1 
              disabled:cursor-not-allowed disabled:opacity-50
              transition-colors
              ${startIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 text-[var(--color-text-secondary)]">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-medium text-[var(--color-error)]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--color-text-secondary)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
