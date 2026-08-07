import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { RadioDot } from '@/shared/ui/RadioDot'
import styles from './PostalServiceCard.module.css'

export interface PostalServiceCardProps {
  /** Prefijo del `id`/`name` del radio (agrupa las cards de un mismo selector). */
  readonly name: string
  readonly value: string
  readonly label: string
  readonly description?: string
  readonly selected: boolean
  readonly onSelect: (value: string) => void
  /** Para reglas de disponibilidad futuras (doc funcional §9.3): país, peso, medidas. */
  readonly disabled?: boolean
  /** Motivo de `disabled`, mostrado en vez de `description`. */
  readonly disabledReason?: string
  /** Precio u otro dato a la derecha, cuando exista cotización. */
  readonly trailing?: ReactNode
  readonly className?: string
}

/**
 * Card de servicio postal con radio (Figma 5589:10467). Reutilizable: hoy la
 * usa "Servicio postal" en Destino, con los 4 servicios internacionales; más
 * adelante llevará las reglas de disponibilidad de §9.3 (país, peso, medidas,
 * peso volumétrico) vía `disabled`/`disabledReason`.
 */
export function PostalServiceCard({
  name,
  value,
  label,
  description,
  selected,
  onSelect,
  disabled = false,
  disabledReason,
  trailing,
  className,
}: PostalServiceCardProps) {
  const inputId = `${name}-${value}`
  const helperText = disabled ? disabledReason : description

  return (
    <label
      htmlFor={inputId}
      className={cn(styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled, className)}
    >
      {/* Input real (accesible, teclado) + `RadioDot` (visual, reutilizable en
          cualquier otro selector con este mismo estilo de radio). */}
      <input
        id={inputId}
        name={name}
        type="radio"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="visually-hidden"
      />
      <RadioDot selected={selected} disabled={disabled} className={styles.radioDot} />

      <span className={styles.body}>
        <span className={styles.label}>{label}</span>
        {helperText !== undefined && helperText !== '' && (
          <span className={cn(styles.description, disabled && styles.descriptionDisabled)}>{helperText}</span>
        )}
      </span>

      {trailing !== undefined && <span className={styles.trailing}>{trailing}</span>}
    </label>
  )
}
