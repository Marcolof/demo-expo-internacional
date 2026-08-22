import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'
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

function toChangeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return {
    target: { value } as EventTarget & HTMLInputElement,
    currentTarget: { value } as EventTarget & HTMLInputElement,
  } as ChangeEvent<HTMLInputElement>
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

  useEffect(() => {
    setCurrentValue(value ?? '')
  }, [value])

  const hasError = error !== undefined && error !== null && error !== ''
  const showInvalid = hasError || invalid
  const hasHint = hint !== undefined && hint !== ''

  const commitValue = (raw: string | number) => {
    let numValue = typeof raw === 'string' ? parseFloat(raw) : raw

    if (Number.isNaN(numValue)) {
      setCurrentValue('')
      onChange?.(toChangeEvent(''))
      return
    }

    if (min !== undefined && numValue < min) numValue = min
    if (max !== undefined && numValue > max) numValue = max

    const next = String(numValue)
    setCurrentValue(next)
    if (inputRef.current) inputRef.current.value = next
    onChange?.(toChangeEvent(next))
  }

  const handleIncrement = () => {
    const current = currentValue === '' ? (min ?? 0) : Number(currentValue)
    commitValue(current + step)
  }

  const handleDecrement = () => {
    const current = currentValue === '' ? (min ?? 0) : Number(currentValue)
    const next = current - step
    if (min === undefined || next >= min) {
      commitValue(next)
    }
  }

  const numValue = currentValue === '' ? NaN : Number(currentValue)
  const canDecrement = Number.isNaN(numValue) || min === undefined || numValue > min
  const canIncrement = Number.isNaN(numValue) || max === undefined || numValue < max

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
