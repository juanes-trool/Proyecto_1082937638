// components/ui/Toast.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info',
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '!',
  };

  return (
    <div className={`fixed bottom-4 right-4 border ${typeStyles[type]} rounded-lg p-4 shadow-lg max-w-sm`}>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">{icons[type]}</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

// Hook para usar Toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...props, id, onClose: () => removeToast(id) }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast };
};
