import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './InternationalStepper.module.css'

/** Pasos del flujo internacional, en orden. */
export const INTERNATIONAL_STEPS = ['Declaración', 'Paquete', 'Origen', 'Destino'] as const

export type InternationalStep = (typeof INTERNATIONAL_STEPS)[number]

export interface InternationalStepperProps {
  /** Paso en curso. Los anteriores/siguientes se muestran como incompletos. */
  readonly current: InternationalStep
  /** Pasos ya alcanzados (incluye el actual): son los únicos navegables por click. */
  readonly unlockedSteps?: ReadonlySet<InternationalStep>
  /** Si se pasa, los pasos desbloqueados (salvo el actual) se vuelven clicables. */
  readonly onStepClick?: (step: InternationalStep, index: number) => void
  readonly className?: string
}

/**
 * Stepper del flujo internacional (Figma 5611:10671 / 8040:120236): cuatro
 * pasos con label debajo del punto. El paso en curso es un anillo amarillo
 * con disco interior; los visitados (desbloqueados pero no actuales) son un
 * disco azul sólido — clicables para volver atrás; el resto queda gris y no
 * interactivo. El conector se pinta de azul hasta el paso actual.
 */
export function InternationalStepper({ current, unlockedSteps, onStepClick, className }: InternationalStepperProps) {
  const currentIndex = INTERNATIONAL_STEPS.indexOf(current)

  return (
    <div className={cn(styles.stepper, className)} role="list" aria-label="Progreso del envío">
      {INTERNATIONAL_STEPS.map((step, index) => {
        const isCurrent = step === current
        const isUnlocked = unlockedSteps?.has(step) ?? false
        const isClickable = onStepClick !== undefined && isUnlocked && !isCurrent

        return (
          <Fragment key={step}>
            {index > 0 && (
              <span
                className={cn(styles.connector, index <= currentIndex && styles.connectorPassed)}
                aria-hidden="true"
              />
            )}
            <div className={styles.step} role="listitem" aria-current={isCurrent ? 'step' : undefined}>
              <button
                type="button"
                className={styles.hitArea}
                disabled={!isClickable}
                onClick={() => onStepClick?.(step, index)}
              >
                <span
                  className={cn(
                    styles.dot,
                    isCurrent && styles.dotCurrent,
                    !isCurrent && isUnlocked && styles.dotVisited,
                    !isCurrent && !isUnlocked && styles.dotPending,
                  )}
                  aria-hidden="true"
                />
                <span className={styles.label}>{step}</span>
              </button>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
