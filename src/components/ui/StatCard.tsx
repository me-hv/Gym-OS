import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    periodText?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'brand' | 'warning' | 'danger' | 'cyan';
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = 'default',
  actionLabel,
  onActionClick,
  className,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return {
          card: 'bg-surface-300 border-amber-500/25 hover:border-amber-500/40 relative overflow-hidden',
          accent: 'text-amber-400',
          indicator: 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent',
          topBar: 'bg-amber-500',
        };
      case 'danger':
        return {
          card: 'bg-surface-300 border-rose-500/25 hover:border-rose-500/40 relative overflow-hidden',
          accent: 'text-rose-400',
          indicator: 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent',
          topBar: 'bg-rose-500',
        };
      case 'brand':
        return {
          card: 'bg-surface-300 border-brand-500/25 hover:border-brand-500/40 relative overflow-hidden',
          accent: 'text-brand-400',
          indicator: 'bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent',
          topBar: 'bg-brand-500',
        };
      case 'cyan':
        return {
          card: 'bg-surface-300 border-cyan-500/25 hover:border-cyan-500/40 relative overflow-hidden',
          accent: 'text-cyan-400',
          indicator: 'bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent',
          topBar: 'bg-cyan-500',
        };
      case 'default':
      default:
        return {
          card: 'bg-surface-300 border-border-subtle hover:border-border',
          accent: 'text-zinc-400',
          indicator: '',
          topBar: '',
        };
    }
  };

  const currentVariant = getVariantClasses();

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl p-4.5 border transition-all duration-150 flex flex-col justify-between shadow-subtle',
          currentVariant.card,
          className
        )
      )}
    >
      {currentVariant.topBar && (
        <div className={clsx('absolute top-0 left-0 right-0 h-0.5', currentVariant.topBar)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          {label}
        </span>
        {icon && (
          <div className={clsx('p-1.5 rounded-md bg-surface-100/80 border border-border-subtle text-zinc-300', currentVariant.accent)}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-zinc-400 font-medium">{subValue}</span>
          )}
        </div>

        {/* Trend or description */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={clsx(
                'inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded gap-0.5',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
            {trend.periodText && (
              <span className="text-[11px] text-zinc-400">{trend.periodText}</span>
            )}
          </div>
        )}
      </div>

      {/* Optional action footer */}
      {actionLabel && (
        <button
          onClick={onActionClick}
          className={clsx(
            'mt-3.5 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs font-medium transition-colors text-left group',
            variant === 'warning'
              ? 'text-amber-300 hover:text-amber-200'
              : variant === 'brand'
              ? 'text-brand-400 hover:text-brand-300'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
};
