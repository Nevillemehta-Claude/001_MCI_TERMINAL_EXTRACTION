import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  tooltip?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * UXMI Button Component (CR-005)
 * Implements THE SEVEN STATES:
 * 1. Default - Base appearance
 * 2. Hover - Visual feedback (150ms transition, cursor: pointer)
 * 3. Focus - 2px ring for keyboard navigation
 * 4. Active - scale(0.98) on press (100ms)
 * 5. Loading - Spinner replaces content, disabled
 * 6. Disabled - opacity 0.5, cursor: not-allowed
 * 7. Success/Error - Handled by variant prop
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  tooltip,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-[0.98] active:transition-transform active:duration-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      focus:ring-blue-500
    `,
    secondary: `
      bg-gray-200 text-gray-900
      hover:bg-gray-300
      focus:ring-gray-500
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-red-500
    `,
    success: `
      bg-green-600 text-white
      hover:bg-green-700
      focus:ring-green-500
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const spinnerSizes = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  const buttonElement = (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={spinnerSizes[size]} />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );

  if (tooltip && !isDisabled) {
    return <Tooltip content={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
};

export default Button;
