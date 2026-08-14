import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  /** URL de un ícono del proyecto. Decorativo: va con `alt` vacío. */
  readonly iconSrc?: string
  /** `top` (default) o `bottom` — Figma masivo pone el ícono debajo del copy. */
  readonly iconPosition?: 'top' | 'bottom'
  /** `brand` pinta el título con azul de marca (#152663). */
  readonly titleTone?: 'muted' | 'brand'
  readonly action?: ReactNode
}

/** Bloque centrado para listas y tablas sin resultados. */
export function EmptyState({
  title,
  description,
  iconSrc,
  iconPosition = 'top',
  titleTone = 'muted',
  action,
}: EmptyStateProps) {
  const hasIcon = iconSrc !== undefined && iconSrc !== ''
  const icon = hasIcon ? (
    <span className={styles.iconWrap} aria-hidden="true">
      <img src={iconSrc} alt="" className={styles.icon} />
    </span>
  ) : null

  return (
    <div className={styles.empty}>
      {iconPosition === 'top' && icon}

      <p className={cn(styles.title, titleTone === 'brand' && styles.titleBrand)}>{title}</p>

      {description !== undefined && description !== '' && (
        <p className={styles.description}>{description}</p>
      )}

      {iconPosition === 'bottom' && icon}

      {action !== undefined && <div className={styles.action}>{action}</div>}
    </div>
  )
}
