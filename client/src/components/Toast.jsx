import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'success'
            ? CheckCircle2
            : Info;

        return (
          <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
