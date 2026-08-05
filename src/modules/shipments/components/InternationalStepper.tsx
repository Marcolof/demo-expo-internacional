import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './InternationalStepper.module.css'

/** Pasos del flujo internacional, en orden. */
export const INTERNATIONAL_STEPS = ['Declaración', 'Paquete', 'Origen', 'Destino'] as const

export type InternationalStep = (typeof INTERNATIONAL_STEPS)[number]

export interface InternationalStepperProps {
  /** Paso en curso. Los anteriores/siguientes se muestran como incompletos. */
  readonly current: InternationalStep
  readonly className?: string
}

/**
 * Stepper del flujo internacional (Figma 5611:10671): cuatro pasos con label
 * debajo del punto. El paso en curso va con disco amarillo; el resto, círculo
 * gris. Puramente visual (la maqueta no navega entre pasos todavía).
 */
export function InternationalStepper({ current, className }: InternationalStepperProps) {
  return (
    <div className={cn(styles.stepper, className)} role="list" aria-label="Progreso del envío">
      {INTERNATIONAL_STEPS.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && <span className={styles.connector} aria-hidden="true" />}
          <div className={styles.step} role="listitem" aria-current={step === current ? 'step' : undefined}>
            <span
              className={cn(styles.dot, step === current ? styles.dotCurrent : styles.dotPending)}
              aria-hidden="true"
            />
            <span className={styles.label}>{step}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
