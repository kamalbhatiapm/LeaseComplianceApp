import { CheckCircle, AlertTriangle, Loader, X } from 'lucide-react'

export default function Toast({ toast, onDismiss }) {
  const { type, title, sub } = toast
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Loader

  return (
    <div className={`toast ${type}`} role="alert" aria-live="assertive">
      <div className="toast-icon">
        <Icon className="icon-md" />
      </div>
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        <div className="toast-sub">{sub}</div>
      </div>
      <button className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
        <X className="icon-sm" />
      </button>
    </div>
  )
}
