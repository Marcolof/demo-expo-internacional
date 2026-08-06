import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

export interface PageHeaderProps {
  readonly title: string
  readonly description?: string
  /** Botones de la derecha. Quien los pasa ya resolvió si van habilitados. */
  readonly actions?: ReactNode
}

/** Encabezado estándar de una pantalla. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {description !== undefined && description !== '' && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      {actions !== undefined && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
