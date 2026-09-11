import React from 'react';
import { useGym } from '../../context/GymContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            case 'info':
            default:
              return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
          }
        };

        const getBgColor = () => {
          switch (toast.type) {
            case 'success':
              return 'bg-surface-300/95';
            case 'warning':
              return 'bg-surface-300/95';
            case 'error':
              return 'bg-surface-300/95';
            case 'info':
            default:
              return 'bg-surface-300/95';
          }
        };

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto backdrop-blur-md rounded-xl p-4 shadow-modal flex items-start gap-3 transition-all duration-200 animate-slide-down',
              getBgColor()
            )}
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-100">{toast.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded hover:bg-surface-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
