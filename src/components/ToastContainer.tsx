import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
} from 'lucide-react';
import { useRainShield } from '../context/RainShieldContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRainShield();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-150 flex items-start gap-2.5 ${
              isError
                ? 'bg-red-950/90 border-red-500 text-red-100'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500 text-amber-100'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                : 'bg-[#0a1224]/90 border-cyan-500/50 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <AlertOctagon className="w-4 h-4 text-red-400" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400" />
              )}
            </div>

            <div className="flex-1 text-xs">
              <div className="font-bold leading-tight flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[9px] font-mono opacity-70">{toast.timestamp}</span>
              </div>
              <div className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.description}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
