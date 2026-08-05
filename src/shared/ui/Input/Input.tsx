import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Field, fieldControlClasses, fieldDescribedBy } from '@/shared/ui/Field'
import styles from './Input.module.css'

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'id' | 'aria-describedby'
>

export interface InputProps extends NativeInputProps {
  readonly id: string
  readonly label: string
  readonly error?: string | null
  readonly hint?: string
  /**
   * Marca el marco en rojo sin mostrar texto de apoyo. Para formularios que
   * concentran el aviso de error en un banner aparte (p. ej. `AddArticleModal`)
   * en vez de listar el motivo debajo de cada campo.
   */
  readonly invalid?: boolean
  /** Texto del tooltip (`data-bs-title` en el original). */
  readonly tooltip?: string
  readonly className?: string
}

/**
 * Campo de texto con label flotante.
 *
 * El `placeholder` se completa con el label si no se pasa otro: el label
 * flotante se resuelve con `:not(:placeholder-shown)` y sin placeholder el
 * label nunca subiría.
 */
export function Input({
  id,
  label,
  error,
  hint,
  invalid = false,
  tooltip,
  className,
  placeholder,
  ...rest
}: InputProps) {
  const hasError = error !== undefined && error !== null && error !== ''
  const showInvalid = hasError || invalid
  const hasHint = hint !== undefined && hint !== ''

  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        placeholder={placeholder ?? label}
        title={tooltip}
        aria-invalid={showInvalid || undefined}
        aria-describedby={fieldDescribedBy(id, { hasHint, hasError })}
        className={cn(
          fieldControlClasses.control,
          styles.input,
          showInvalid && fieldControlClasses.controlInvalid,
        )}
        {...rest}
      />
    </Field>
  )
}
