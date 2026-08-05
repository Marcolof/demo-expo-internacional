import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Checkbox.module.css'

export interface RadioOption<TValue extends string> {
  readonly value: TValue
  readonly label: string
  readonly description?: string
  readonly disabled?: boolean
  /** Contenido extra a la derecha de la opción (por ejemplo, el precio). */
  readonly trailing?: ReactNode
}

export interface RadioGroupProps<TValue extends string> {
  /** Prefijo de los ids de cada radio y `name` del grupo. */
  readonly name: string
  readonly legend?: string
  readonly options: readonly RadioOption<TValue>[]
  readonly value: TValue | null
  readonly onChange: (value: TValue) => void
  readonly disabled?: boolean
  readonly inline?: boolean
  readonly error?: string | null
  readonly className?: string
}

/**
 * Grupo de radios en un `<fieldset>`.
 *
 * Se tipa con el union de valores posibles para que el `onChange` no devuelva
 * un `string` cualquiera — evita comparar contra literales inexistentes.
 */
export function RadioGroup<TValue extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled = false,
  inline = false,
  error,
  className,
}: RadioGroupProps<TValue>) {
  const hasError = error !== undefined && error !== null && error !== ''

  return (
    <fieldset className={cn(styles.group, inline && styles.groupInline, className)}>
      {legend !== undefined && legend !== '' && (
        <legend className={styles.groupLegend}>{legend}</legend>
      )}

      {options.map((option) => {
        const optionId = `${name}-${option.value}`
        const isDisabled = disabled || option.disabled === true

        return (
          <div key={option.value} className={styles.wrapper}>
            <input
              id={optionId}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              disabled={isDisabled}
              onChange={() => onChange(option.value)}
              className={cn(styles.input, styles.radio)}
            />
            <label htmlFor={optionId} className={styles.labelBlock}>
              <span className={styles.label}>{option.label}</span>
              {option.description !== undefined && option.description !== '' && (
                <span className={styles.description}>{option.description}</span>
              )}
              {option.trailing}
            </label>
          </div>
        )
      })}

      {hasError && (
        <small className={styles.groupError} role="alert">
          {error}
        </small>
      )}
    </fieldset>
  )
}
