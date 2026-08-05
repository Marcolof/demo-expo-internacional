import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext } from './toastContext'
import type { ToastContextValue, ToastTone } from './toastContext'
import styles from './Toast.module.css'

/** Milisegundos que dura un toast antes de cerrarse solo. */
const AUTO_DISMISS_MS = 4000

interface ToastItem {
  readonly id: string
  readonly tone: ToastTone
  readonly message: string
}

export interface ToastProviderProps {
  readonly children: ReactNode
}

/**
 * Cola de notificaciones + stack fijo abajo a la derecha.
 *
 * Los timers se guardan en un ref por id: hay que poder cancelar el de un
 * toast que se cierra a mano y limpiar todos al desmontar.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const lastId = useRef(0)

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      lastId.current += 1
      const id = `toast-${String(lastId.current)}`

      setToasts((current) => [...current, { id, tone, message }])
      timers.current.set(
        id,
        setTimeout(() => {
          dismissToast(id)
        }, AUTO_DISMISS_MS),
      )
    },
    [dismissToast],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => {
        clearTimeout(timer)
      })
      pending.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.stack} aria-live="polite" aria-label="Notificaciones">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            tone={toast.tone}
            message={toast.message}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Acceso a la cola. Falla fuerte si falta el provider: es un error de armado. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error('useToast() necesita estar dentro de un <ToastProvider>.')
  }
  return context
}
