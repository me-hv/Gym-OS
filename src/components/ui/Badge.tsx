import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MemberStatus, PaymentStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: MemberStatus | PaymentStatus | 'neutral' | 'brand' | 'cyan' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = true,
  className,
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium gap-1',
    sm: 'text-xs px-2 py-0.5 font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
      case 'paid':
        return {
          container: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
        };
      case 'expiring':
      case 'pending':
        return {
          container: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
          dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',
        };
      case 'expired':
      case 'overdue':
        return {
          container: 'bg-rose-500/10 text-rose-300 border border-rose-500/25',
          dot: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]',
        };
      case 'frozen':
        return {
          container: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25',
          dot: 'bg-cyan-400',
        };
      case 'brand':
        return {
          container: 'bg-brand-500/10 text-brand-400 border border-brand-500/25',
          dot: 'bg-brand-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]',
        };
      case 'cyan':
        return {
          container: 'bg-sky-500/10 text-sky-300 border border-sky-500/25',
          dot: 'bg-sky-400',
        };
      case 'purple':
        return {
          container: 'bg-purple-500/10 text-purple-300 border border-purple-500/25',
          dot: 'bg-purple-400',
        };
      case 'neutral':
      default:
        return {
          container: 'bg-surface-50 text-zinc-300 border border-border-subtle',
          dot: 'bg-zinc-400',
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full leading-none whitespace-nowrap select-none font-medium',
          sizeStyles[size],
          currentStyles.container,
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', currentStyles.dot)} />
      )}
      <span>{children}</span>
    </span>
  );
};
