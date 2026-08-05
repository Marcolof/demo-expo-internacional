import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  readonly tone: BadgeTone
  readonly children: ReactNode
}

const TONE_CLASS: Record<BadgeTone, string | undefined> = {
  neutral: styles.neutral,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

/**
 * Píldora de estado. El tono es decisión de quien la usa: el badge no sabe
 * mapear estados de negocio a colores.
 */
export function Badge({ tone, children }: BadgeProps) {
  return <span className={cn(styles.badge, TONE_CLASS[tone])}>{children}</span>
}
