import { cn } from '@/shared/lib/cn'
import styles from './Switch.module.css'

export type SwitchLabelPosition = 'left' | 'right'

export interface SwitchProps {
  readonly id: string
  readonly label: string
  readonly checked: boolean
  readonly onChange: (next: boolean) => void
  readonly disabled?: boolean
  readonly description?: string
  readonly labelPosition?: SwitchLabelPosition
}

/**
 * Toggle accesible. No usa `<input type="checkbox">` sino
 * `<button role="switch">`, que es lo que anuncia "activado / desactivado" en
 * lectores de pantalla sin depender de CSS para el estado.
 *
 * El texto no es un `<label>` porque un label no activa un `<button>`: se
 * asocia con `aria-labelledby`.
 */
export function Switch({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  description,
  labelPosition = 'right',
}: SwitchProps) {
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const hasDescription = description !== undefined && description !== ''

  return (
    <div className={cn(styles.wrapper, labelPosition === 'left' && styles.wrapperLabelLeft)}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(styles.track, checked && styles.trackOn)}
      >
        <span className={styles.thumb} />
      </button>

      <span className={styles.texts}>
        <span id={labelId} className={cn(styles.label, disabled && styles.labelDisabled)}>
          {label}
        </span>
        {hasDescription && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>
    </div>
  )
}
