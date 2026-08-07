import { useRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Field, fieldControlClasses, fieldDescribedBy } from '@/shared/ui/Field'
import styles from './NumberInput.module.css'

type NativeNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'id' | 'aria-describedby' | 'type'
>

export interface NumberInputProps extends NativeNumberInputProps {
  readonly id: string
  readonly label: string
  readonly error?: string | null
  readonly hint?: string
  readonly invalid?: boolean
  readonly tooltip?: string
  readonly className?: string
  readonly min?: number
  readonly max?: number
  readonly step?: number
}

export function NumberInput({
  id,
  label,
  error,
  hint,
  invalid = false,
  tooltip,
  className,
  min = 0,
  max,
  step = 1,
  value,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentValue, setCurrentValue] = useState(value ?? '')
  const [isFocused, setIsFocused] = useState(false)

  const hasError = error !== undefined && error !== null && error !== ''
  const showInvalid = hasError || invalid
  const hasHint = hint !== undefined && hint !== ''

  const handleChange = (newValue: string | number) => {
    let numValue = typeof newValue === 'string' ? parseFloat(newValue) : newValue

    if (isNaN(numValue)) {
      setCurrentValue('')
      return
    }

    if (min !== undefined && numValue < min) numValue = min
    if (max !== undefined && numValue > max) numValue = max

    setCurrentValue(numValue)

    if (inputRef.current) {
      inputRef.current.value = String(numValue)
      const nativeEvent = new Event('change', { bubbles: true })
      inputRef.current.dispatchEvent(nativeEvent)
    }

    onChange?.({ target: { value: String(numValue) } } as any)
  }

  const handleIncrement = () => {
    const current = currentValue === '' ? min ?? 0 : Number(currentValue)
    handleChange(current + step)
  }

  const handleDecrement = () => {
    const current = currentValue === '' ? min ?? 0 : Number(currentValue)
    const next = current - step
    if (min === undefined || next >= min) {
      handleChange(next)
    }
  }

  const numValue = currentValue === '' ? NaN : Number(currentValue)
  const canDecrement = isNaN(numValue) || (min === undefined || numValue > min)
  const canIncrement = isNaN(numValue) || (max === undefined || numValue < max)

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
      <div className={styles.container}>
        <input
          ref={inputRef}
          id={id}
          type="number"
          placeholder={label}
          title={tooltip}
          aria-invalid={showInvalid || undefined}
          aria-describedby={fieldDescribedBy(id, { hasHint, hasError })}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.value)
            onChange?.(e)
          }}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            onBlur?.(event)
          }}
          className={cn(
            fieldControlClasses.control,
            styles.input,
            showInvalid && fieldControlClasses.controlInvalid,
          )}
          {...rest}
        />
        <div className={styles.spinnerButtons}>
          <button
            type="button"
            className={styles.spinButton}
            onClick={handleIncrement}
            disabled={!canIncrement}
            aria-label="Aumentar"
            tabIndex={-1}
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.spinButton}
            onClick={handleDecrement}
            disabled={!canDecrement}
            aria-label="Disminuir"
            tabIndex={-1}
          >
            ▼
          </button>
        </div>
      </div>
    </Field>
  )
}
