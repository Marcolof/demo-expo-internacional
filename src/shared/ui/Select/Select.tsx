import { useState } from 'react'
import type { SelectHTMLAttributes } from 'react'
import type { SelectOption } from '@/core/types/common'
import { cn } from '@/shared/lib/cn'
import { Field, fieldControlClasses, fieldDescribedBy } from '@/shared/ui/Field'
import styles from './Select.module.css'

type NativeSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'id' | 'aria-describedby' | 'children'
>

export interface SelectProps extends NativeSelectProps {
  readonly id: string
  readonly label: string
  readonly options: readonly SelectOption[]
  readonly error?: string | null
  readonly hint?: string
  /** Marca el marco en rojo sin mostrar texto de apoyo (ver `Input`). */
  readonly invalid?: boolean
  readonly tooltip?: string
  /** `pill` ≈ border-radius 24px (filtros Mis envíos / Figma). */
  readonly shape?: 'default' | 'pill'
  readonly className?: string
  /**
   * Texto de la opción vacía. El original usa `"-"` con value `"-1"`.
   * Pasar `null` si el select no debe ofrecer opción vacía.
   */
  readonly placeholderOption?: string | null
  readonly placeholderOptionValue?: string
}

/**
 * Desplegable con label flotante.
 *
 * A diferencia del `Input`, el label de un `<select>` está SIEMPRE arriba: el
 * control muestra una opción desde el principio, así que no existe el estado
 * "vacío" que en un input mantiene el label centrado. Es el mismo criterio del
 * CSS original (`.form-floating > .form-select ~ label`).
 */
export function Select({
  id,
  label,
  options,
  error,
  hint,
  invalid = false,
  tooltip,
  shape = 'default',
  className,
  placeholderOption = '-',
  placeholderOptionValue = '-1',
  onFocus,
  onBlur,
  ...rest
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = error !== undefined && error !== null && error !== ''
  const showInvalid = hasError || invalid
  const hasHint = hint !== undefined && hint !== ''

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      className={className}
      floatLabel
      labelActive={isFocused}
    >
      <select
        id={id}
        title={tooltip}
        aria-invalid={showInvalid || undefined}
        aria-describedby={fieldDescribedBy(id, { hasHint, hasError })}
        className={cn(
          fieldControlClasses.control,
          shape === 'pill' && fieldControlClasses.controlPill,
          styles.select,
          showInvalid && fieldControlClasses.controlInvalid,
        )}
        onFocus={(event) => {
          setIsFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setIsFocused(false)
          onBlur?.(event)
        }}
        {...rest}
      >
        {placeholderOption !== null && (
          <option value={placeholderOptionValue}>{placeholderOption}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
