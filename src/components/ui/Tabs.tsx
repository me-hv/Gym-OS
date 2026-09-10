import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div
        className={twMerge(
          clsx(
            'inline-flex items-center p-1 bg-surface-200 border border-border-subtle rounded-lg gap-1',
            className
          )
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all select-none',
                isActive
                  ? 'bg-surface-50 text-white shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-100/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-brand-500/20 text-brand-300'
                      : 'bg-surface-100 text-zinc-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('border-b border-border-subtle flex gap-6', className))}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'inline-flex items-center gap-2 pb-3 pt-1 text-sm font-medium border-b-2 transition-all relative select-none',
              isActive
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums leading-none',
                  isActive
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'bg-surface-100 text-zinc-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
