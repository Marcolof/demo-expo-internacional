import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Field, fieldControlClasses, fieldDescribedBy } from '@/shared/ui/Field'

type NativeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'id' | 'aria-describedby'
>

export interface TextareaProps extends NativeTextareaProps {
  readonly id: string
  readonly label: string
  readonly error?: string | null
  readonly hint?: string
  readonly tooltip?: string
  readonly className?: string
}

/**
 * Área de texto con label flotante. Vive junto a `Input` porque comparte todo
 * su comportamiento; sólo cambia el alto y la posición de reposo del label.
 */
export function Textarea({
  id,
  label,
  error,
  hint,
  tooltip,
  className,
  placeholder,
  ...rest
}: TextareaProps) {
  const hasError = error !== undefined && error !== null && error !== ''
  const hasHint = hint !== undefined && hint !== ''

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      labelVariant="textarea"
      className={className}
    >
      <textarea
        id={id}
        placeholder={placeholder ?? label}
        title={tooltip}
        aria-invalid={hasError || undefined}
        aria-describedby={fieldDescribedBy(id, { hasHint, hasError })}
        className={cn(
          fieldControlClasses.control,
          fieldControlClasses.controlTextarea,
          hasError && fieldControlClasses.controlInvalid,
        )}
        {...rest}
      />
    </Field>
  )
}
