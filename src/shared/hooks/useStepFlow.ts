import { useState } from 'react'

/**
 * Estado de un wizard de N pasos: cuál está activo y cuáles quedaron
 * desbloqueados. Genérico sobre la lista de pasos — no asume una cantidad ni
 * un dominio en particular (se usa para Internacional; nacional puede
 * adoptarlo más adelante sin cambios acá).
 *
 * Reglas:
 * - `next()` desbloquea y activa el paso siguiente (si existe).
 * - `goTo(step)` sólo mueve el activo entre pasos ya desbloqueados — no
 *   permite saltar a uno futuro todavía no alcanzado.
 */
export function useStepFlow<T extends string>(steps: readonly T[], initialStep: T) {
  const [current, setCurrent] = useState<T>(initialStep)
  const [unlocked, setUnlocked] = useState<ReadonlySet<T>>(new Set([initialStep]))

  const currentIndex = steps.indexOf(current)

  const goTo = (step: T) => {
    if (unlocked.has(step)) setCurrent(step)
  }

  const next = () => {
    const nextStep = steps[currentIndex + 1]
    if (nextStep === undefined) return
    setUnlocked((prev) => new Set(prev).add(nextStep))
    setCurrent(nextStep)
  }

  const back = () => {
    const previousStep = steps[currentIndex - 1]
    if (previousStep === undefined) return
    setCurrent(previousStep)
  }

  return { current, currentIndex, unlocked, goTo, next, back } as const
}
