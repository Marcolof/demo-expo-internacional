import { cn } from '@/shared/lib/cn'
import type { ToastTone } from './toastContext'
import styles from './Toast.module.css'

export interface ToastProps {
  readonly id: string
  readonly tone: ToastTone
  readonly message: string
  readonly onDismiss: (id: string) => void
}

const TONE_CLASS: Record<ToastTone, string | undefined> = {
  success: styles.success,
  danger: styles.danger,
  info: styles.info,
}

/** Notificación individual. El provider maneja la cola y el auto-cierre. */
export function Toast({ id, tone, message, onDismiss }: ToastProps) {
  return (
    <div className={cn(styles.toast, TONE_CLASS[tone])} role={tone === 'danger' ? 'alert' : 'status'}>
      <p className={styles.message}>{message}</p>

      <button
        type="button"
        className={styles.dismiss}
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}
