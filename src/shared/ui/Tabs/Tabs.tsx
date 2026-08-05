import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import styles from './Tabs.module.css'

export interface TabItem {
  readonly id: string
  readonly label: string
  readonly disabled?: boolean
  /**
   * Si se define, la pestaña navega en lugar de cambiar el panel.
   * El original hace esto con "Masivo", que es otra pantalla.
   */
  readonly to?: string
}

export interface TabsProps {
  readonly items: readonly TabItem[]
  readonly activeId: string
  readonly onChange: (id: string) => void
  /** `false` deja que cada pestaña mida su contenido en vez de repartir el ancho. */
  readonly grow?: boolean
  readonly variant?: 'primary' | 'secondary'
  readonly ariaLabel?: string
  readonly className?: string
  readonly children?: ReactNode
}

/**
 * Pestañas. Cada ítem puede cambiar el panel activo (`onChange`) o navegar a
 * otra ruta (`to`), que es lo que hace la pestaña "Masivo" del original.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  grow = true,
  variant = 'primary',
  ariaLabel,
  className,
  children,
}: TabsProps) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(styles.tablist, variant === 'secondary' && styles.tablistSecondary)}
      >
        {items.map((item) => {
          const isActive = item.id === activeId
          const classes = cn(styles.tab, !grow && styles.tabAuto, isActive && styles.tabActive)

          if (item.to !== undefined && item.disabled !== true) {
            return (
              <Link key={item.id} to={item.to} role="tab" aria-selected={isActive} className={classes}>
                {item.label}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => onChange(item.id)}
              className={classes}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {children !== undefined && (
        <div role="tabpanel" id={`panel-${activeId}`} className={styles.panel}>
          {children}
        </div>
      )}
    </div>
  )
}
