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
  variant = 'pills',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div
        className={twMerge(
          clsx(
            'inline-flex items-center p-1 bg-surface-200 rounded-lg gap-1',
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
                  ? 'bg-surface-100 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-100/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 rounded-md text-[10px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-brand-500/20 text-brand-300'
                      : 'bg-surface-300 text-zinc-400'
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
    <div className={twMerge(clsx('flex gap-6', className))}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'inline-flex items-center gap-2 pb-2.5 pt-1 text-sm font-medium transition-all relative select-none',
              isActive
                ? 'text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums leading-none',
                  isActive
                    ? 'bg-brand-500/20 text-brand-300'
                    : 'bg-surface-200 text-zinc-400'
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
