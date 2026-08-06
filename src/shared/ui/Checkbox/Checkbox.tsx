import { cn } from '@/shared/lib/cn'
import styles from './Checkbox.module.css'

export interface CheckboxProps {
  readonly id: string
  readonly label: string
  readonly checked: boolean
  readonly onChange: (checked: boolean) => void
  readonly disabled?: boolean
  readonly description?: string
  readonly name?: string
  readonly className?: string
}

/** Casilla de verificación. */
export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  description,
  name,
  className,
}: CheckboxProps) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className={cn(styles.input, styles.checkbox)}
      />
      <label htmlFor={id} className={styles.labelBlock}>
        <span className={styles.label}>{label}</span>
        {description !== undefined && description !== '' && (
          <span className={styles.description}>{description}</span>
        )}
      </label>
    </div>
  )
}
