import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'emerald';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40';

    const sizeStyles = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8 font-medium',
      md: 'text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-sm px-4 py-2.5 gap-2.5 h-10 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-brand-500 hover:bg-brand-400 text-zinc-950 font-semibold shadow-xs active:bg-brand-600',
      emerald:
        'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs',
      secondary:
        'bg-surface-100 hover:bg-surface-50 text-zinc-200 hover:text-white active:bg-surface-200',
      outline:
        'bg-surface-200 hover:bg-surface-100 text-zinc-300 hover:text-white active:bg-surface-50',
      ghost:
        'bg-transparent hover:bg-surface-100/80 text-zinc-400 hover:text-zinc-100',
      danger:
        'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200',
      warning:
        'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
