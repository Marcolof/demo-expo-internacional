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
 * debajo del punto. El paso en curso va con disco amarillo; los pasos ya
 * completados (anteriores al actual) van con disco azul (mismo azul de marca
 * que el resto del sitio); los que faltan, círculo gris.
 */
export function InternationalStepper({ current, className }: InternationalStepperProps) {
  const currentIndex = INTERNATIONAL_STEPS.indexOf(current)

  return (
    <div className={cn(styles.stepper, className)} role="list" aria-label="Progreso del envío">
      {INTERNATIONAL_STEPS.map((step, index) => {
        const isCurrent = step === current
        const isVisited = index < currentIndex

        return (
          <Fragment key={step}>
            {index > 0 && (
              <span
                className={cn(styles.connector, index <= currentIndex && styles.connectorVisited)}
                aria-hidden="true"
              />
            )}
            <div className={styles.step} role="listitem" aria-current={isCurrent ? 'step' : undefined}>
              <span
                className={cn(
                  styles.dot,
                  isCurrent ? styles.dotCurrent : isVisited ? styles.dotVisited : styles.dotPending,
                )}
                aria-hidden="true"
              />
              <span className={styles.label}>{step}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
