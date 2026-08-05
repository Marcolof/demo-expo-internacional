import { useState } from 'react'
import internacionalIcon from '@/assets/icons/internacional.svg'
import { cn } from '@/shared/lib/cn'
import styles from './ScopeSwitch.module.css'

export type ShipmentScope = 'nacional' | 'internacional'

export interface ScopeSwitchProps {
  /**
   * Opción seleccionada (modo controlado). Si se pasa, el estado lo maneja el
   * padre — típicamente atado a la ruta (`/` vs `/internacional`).
   */
  readonly value?: ShipmentScope
  /** Opción inicial en modo no controlado. Por defecto, "nacional". */
  readonly defaultValue?: ShipmentScope
  /** Se dispara al elegir una opción distinta a la actual. */
  readonly onChange?: (scope: ShipmentScope) => void
  readonly className?: string
}

/**
 * Switch Nacional / Internacional — réplica del diseño de Figma
 * (Mi Correo 2.0, node 5578:12020). La pastilla amarilla se desliza detrás de
 * la opción elegida.
 *
 * Admite modo controlado (`value`) para atarlo a la ruta: cada pantalla lo fija
 * en su alcance y `onChange` navega a la otra. En modo no controlado alterna
 * localmente (útil de forma aislada).
 */
export function ScopeSwitch({ value, defaultValue = 'nacional', onChange, className }: ScopeSwitchProps) {
  const [internal, setInternal] = useState<ShipmentScope>(defaultValue)
  const scope = value ?? internal

  const select = (next: ShipmentScope) => {
    if (next === scope) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <div
      className={cn(styles.track, className)}
      data-selected={scope}
      role="tablist"
      aria-label="Alcance del envío"
    >
      <span className={styles.indicator} aria-hidden="true" />

      <button
        type="button"
        role="tab"
        aria-selected={scope === 'nacional'}
        className={styles.option}
        onClick={() => select('nacional')}
      >
        Nacional
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={scope === 'internacional'}
        className={styles.option}
        onClick={() => select('internacional')}
      >
        <img src={internacionalIcon} alt="" className={styles.icon} />
        Internacional
      </button>
    </div>
  )
}
