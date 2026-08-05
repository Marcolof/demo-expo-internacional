import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Field.module.css'

export type FieldLabelVariant = 'default' | 'textarea'

export interface FieldProps {
  /** Debe coincidir con el `id` del control que envuelve. */
  readonly id: string
  readonly label: string
  readonly error?: string | null
  readonly hint?: string
  /** Fuerza el label arriba. Necesario en `Select`, que no tiene placeholder. */
  readonly floatLabel?: boolean
  /** Pinta el label de azul (control enfocado). Sólo aplica con `floatLabel`. */
  readonly labelActive?: boolean
  readonly labelVariant?: FieldLabelVariant
  readonly className?: string
  /** El control. Va ANTES del label: el CSS usa el selector hermano. */
  readonly children: ReactNode
}

/**
 * Envoltorio de un campo con label flotante, pista y error.
 *
 * DECISIÓN DE ARQUITECTURA
 * El label se renderiza DESPUÉS del control, igual que en el HTML original,
 * porque el estado flotado se resuelve con `control + label` en CSS. No
 * invertir el orden.
 */
export function Field({
  id,
  label,
  error,
  hint,
  floatLabel = false,
  labelActive = false,
  labelVariant = 'default',
  className,
  children,
}: FieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={cn(styles.group, className)}>
      {/*
       * El label flotante se posiciona `absolute` respecto de ESTE
       * envoltorio, no de `.group`: si el label tomara `.group` como
       * referencia, el hint/error de abajo agrandarían el bloque y el
       * label (centrado con `top: 50%`) se correría fuera del control.
       */}
      <div className={styles.controlWrap}>
        {children}

        <label
          htmlFor={id}
          className={cn(
            styles.label,
            labelVariant === 'textarea' && styles.labelTextarea,
            floatLabel && styles.labelFloated,
            floatLabel && labelActive && styles.labelActive,
          )}
        >
          {label}
        </label>
      </div>

      {hint !== undefined && hint !== '' && (
        <small id={hintId} className={styles.hint}>
          {hint}
        </small>
      )}

      {error !== undefined && error !== null && error !== '' && (
        <small id={errorId} className={styles.error} role="alert">
          {error}
        </small>
      )}
    </div>
  )
}

/** Clases del control, para que Input/Select/Textarea compartan el mismo look. */
export const fieldControlClasses = {
  control: styles.control,
  controlTextarea: styles.controlTextarea,
  controlInvalid: styles.controlInvalid,
} as const

/** Ids de accesibilidad derivados del id del campo. */
export function fieldDescribedBy(
  id: string,
  options: { readonly hasHint: boolean; readonly hasError: boolean },
): string | undefined {
  const ids: string[] = []
  if (options.hasHint) ids.push(`${id}-hint`)
  if (options.hasError) ids.push(`${id}-error`)
  return ids.length > 0 ? ids.join(' ') : undefined
}
