import { createContext } from 'react'

export type ToastTone = 'success' | 'danger' | 'info'

export interface ToastContextValue {
  readonly showToast: (message: string, tone?: ToastTone) => void
}

/**
 * El contexto vive en su propio archivo para que `Toast.tsx` pueda importar el
 * tipo `ToastTone` sin depender del provider (evita el import circular
 * Toast ↔ ToastProvider).
 */
export const ToastContext = createContext<ToastContextValue | null>(null)
