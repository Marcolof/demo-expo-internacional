import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Alert.module.css'

export type AlertTone = 'danger' | 'success' | 'info' | 'warning'

export interface AlertProps {
  readonly tone: AlertTone
  readonly title?: string
  readonly children: ReactNode
  readonly onDismiss?: () => void
}

const TONE_CLASS: Record<AlertTone, string | undefined> = {
  danger: styles.danger,
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
}

/**
 * Bloque de feedback. `danger` va con `role="alert"` (interrumpe al lector de
 * pantalla porque algo falló); el resto con `role="status"`, que se anuncia sin
 * cortar lo que se esté leyendo.
 */
export function Alert({ tone, title, children, onDismiss }: AlertProps) {
  return (
    <div className={cn(styles.alert, TONE_CLASS[tone])} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className={styles.content}>
        {title !== undefined && title !== '' && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
      </div>

      {onDismiss !== undefined && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Cerrar aviso">
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  )
}
