import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'var(--info)';
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'var(--success)';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'var(--danger)';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'var(--warning)';
          }

          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="toast-message">{toast.message}</div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{ padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
