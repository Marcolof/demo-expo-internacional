import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  /** URL de un ícono del proyecto. Decorativo: va con `alt` vacío. */
  readonly iconSrc?: string
  readonly action?: ReactNode
}

/** Bloque centrado para listas y tablas sin resultados. */
export function EmptyState({ title, description, iconSrc, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      {iconSrc !== undefined && iconSrc !== '' && (
        <span className={styles.iconWrap} aria-hidden="true">
          <img src={iconSrc} alt="" className={styles.icon} />
        </span>
      )}

      <p className={styles.title}>{title}</p>

      {description !== undefined && description !== '' && (
        <p className={styles.description}>{description}</p>
      )}

      {action !== undefined && <div className={styles.action}>{action}</div>}
    </div>
  )
}
