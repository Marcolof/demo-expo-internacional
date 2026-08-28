import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  /** URL de un ícono del proyecto. Decorativo: va con `alt` vacío. */
  readonly iconSrc?: string
  /**
   * SVG inline (preferido si hay que pintar con `currentColor`).
   * Si se pasa, tiene prioridad sobre `iconSrc`.
   */
  readonly icon?: ReactNode
  /** `top` (default) o `bottom` — Figma masivo pone el ícono debajo del copy. */
  readonly iconPosition?: 'top' | 'bottom'
  /** `brand` pinta el título con azul de marca (#152663). */
  readonly titleTone?: 'muted' | 'brand'
  /** Color del ícono cuando usa `currentColor` (p. ej. SVG inline). */
  readonly iconTone?: 'brand' | 'disabled'
  readonly action?: ReactNode
  readonly className?: string
}

/** Bloque centrado para listas y tablas sin resultados. */
export function EmptyState({
  title,
  description,
  iconSrc,
  icon: iconSlot,
  iconPosition = 'top',
  titleTone = 'muted',
  iconTone = 'brand',
  action,
  className,
}: EmptyStateProps) {
  const hasImg = iconSrc !== undefined && iconSrc !== ''
  const hasSlot = iconSlot !== undefined && iconSlot !== null
  const icon = hasSlot ? (
    <span
      className={cn(
        styles.iconWrap,
        iconTone === 'disabled' && styles.iconToneDisabled,
        iconTone === 'brand' && styles.iconToneBrand,
      )}
      aria-hidden="true"
    >
      {iconSlot}
    </span>
  ) : hasImg ? (
    <span
      className={cn(
        styles.iconWrap,
        iconTone === 'disabled' && styles.iconToneDisabled,
        iconTone === 'brand' && styles.iconToneBrand,
      )}
      aria-hidden="true"
    >
      <img src={iconSrc} alt="" className={styles.icon} />
    </span>
  ) : null

  return (
    <div className={cn(styles.empty, className)}>
      {iconPosition === 'top' && icon}

      <p className={cn(styles.title, titleTone === 'brand' && styles.titleBrand)}>{title}</p>

      {description !== undefined && description !== '' && (
        <p className={styles.description}>{description}</p>
      )}

      {iconPosition === 'bottom' && icon}

      {action !== undefined && <div className={styles.action}>{action}</div>}
    </div>
  )
}
