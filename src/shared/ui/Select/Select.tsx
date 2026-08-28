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
   * Si es `true` (default en formularios), la opción vacía no muestra texto: el label
   * flotante actúa como placeholder hasta seleccionar. Si es `false`, se muestra
   * `placeholderOption` como texto de la opción vacía (filtros «Todas…»).
   */
  readonly labelAsPlaceholder?: boolean
  /**
   * Texto de la opción vacía cuando `labelAsPlaceholder={false}`.
   * Pasar `null` si el select no debe ofrecer opción vacía.
   */
  readonly placeholderOption?: string | null
  readonly placeholderOptionValue?: string
}

/**
 * Desplegable con label flotante.
 *
 * Con `labelAsPlaceholder` (default), el label reposa centrado hasta foco o valor;
 * la opción vacía no duplica ese texto. Con `labelAsPlaceholder={false}` el label
 * queda siempre arriba y la opción vacía muestra el copy (p. ej. filtros).
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
  labelAsPlaceholder = true,
  placeholderOption = '-',
  placeholderOptionValue = '-1',
  value,
  defaultValue,
  onFocus,
  onBlur,
  ...rest
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = error !== undefined && error !== null && error !== ''
  const showInvalid = hasError || invalid
  const hasHint = hint !== undefined && hint !== ''

  const resolvedValue = value ?? defaultValue ?? ''
  const hasEmptyOption = placeholderOption !== null
  const isEmpty = hasEmptyOption && String(resolvedValue) === String(placeholderOptionValue)
  const shouldFloatLabel = labelAsPlaceholder ? !isEmpty || isFocused : true

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      className={className}
      floatLabel={shouldFloatLabel}
      labelActive={isFocused}
      labelFloatManual
    >
      <select
        id={id}
        title={tooltip}
        aria-invalid={showInvalid || undefined}
        aria-describedby={fieldDescribedBy(id, { hasHint, hasError })}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          fieldControlClasses.control,
          shape === 'pill' && fieldControlClasses.controlPill,
          styles.select,
          labelAsPlaceholder && isEmpty && !isFocused && styles.selectLabelPlaceholder,
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
        {hasEmptyOption && (
          <option value={placeholderOptionValue} hidden={labelAsPlaceholder || undefined}>
            {labelAsPlaceholder ? '' : placeholderOption}
          </option>
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
