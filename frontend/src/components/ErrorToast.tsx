import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-6 bg-red-950/40 border border-red-500/40 backdrop-blur-xl rounded-2xl p-4 text-red-200 flex items-center justify-between shadow-xl animate-shake">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <span className="text-sm font-medium leading-snug">{message}</span>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded-lg transition-colors ml-3"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
