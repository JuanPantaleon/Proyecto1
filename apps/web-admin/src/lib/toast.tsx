'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration ?? 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

interface ToastViewportProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastViewport({ toasts, onRemove }: ToastViewportProps) {
  const iconComponents = {
    default: Info,
    success: CheckCircle,
    destructive: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const iconColors = {
    default: 'text-blue-400',
    success: 'text-green-400',
    destructive: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  const bgColors = {
    default: 'bg-[#0D0D0D] border-border',
    success: 'bg-[#0D0D0D] border-green-500/30',
    destructive: 'bg-[#0D0D0D] border-red-500/30',
    warning: 'bg-[#0D0D0D] border-amber-500/30',
    info: 'bg-[#0D0D0D] border-blue-500/30',
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 sm:max-w-[420px]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const Icon = iconComponents[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-300',
              bgColors[toast.variant]
            )}
            role="alert"
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.variant])} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    toast: addToast,
    success: (title: string, description?: string) =>
      addToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) =>
      addToast({ title, description, variant: 'destructive' }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) =>
      addToast({ title, description, variant: 'info' }),
  };
}