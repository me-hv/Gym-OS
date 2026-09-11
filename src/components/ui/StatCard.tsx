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
          card: 'bg-surface-300 hover:bg-surface-200',
          accent: 'text-amber-400',
          metricColor: 'text-amber-300',
        };
      case 'danger':
        return {
          card: 'bg-surface-300 hover:bg-surface-200',
          accent: 'text-rose-400',
          metricColor: 'text-rose-300',
        };
      case 'brand':
        return {
          card: 'bg-surface-300 hover:bg-surface-200',
          accent: 'text-brand-400',
          metricColor: 'text-white',
        };
      case 'cyan':
        return {
          card: 'bg-surface-300 hover:bg-surface-200',
          accent: 'text-cyan-400',
          metricColor: 'text-white',
        };
      case 'default':
      default:
        return {
          card: 'bg-surface-300 hover:bg-surface-200',
          accent: 'text-zinc-400',
          metricColor: 'text-white',
        };
    }
  };

  const currentVariant = getVariantClasses();

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl p-5 transition-all duration-150 flex flex-col justify-between',
          currentVariant.card,
          className
        )
      )}
    >
      {/* Label and subtle icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
          {label}
        </span>
        {icon && (
          <div className={clsx('text-zinc-400', currentVariant.accent)}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Anchor Metric */}
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className={clsx('text-3xl font-bold tracking-tight tabular-nums', currentVariant.metricColor)}>
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-zinc-400 font-medium">{subValue}</span>
          )}
        </div>

        {/* Delta or trend info */}
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
            'mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-medium transition-colors text-left group',
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
