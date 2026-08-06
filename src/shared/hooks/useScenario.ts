/**
 * Resuelve el escenario activo contra el registro de un módulo.
 *
 * El id sale de `?scenario=` (o de la barra de demo) y lo resuelve
 * `resolveScenario`, que cae al escenario por defecto si el id no pertenece a
 * este módulo. Así `/mis-envios?scenario=empty-state` no rompe cuando el
 * usuario navega a otra sección con el parámetro puesto.
 */

import { useMemo } from 'react'
import {
  listScenarios,
  resolveScenario,
  useActiveScenario,
} from '@/core/session/activeScenario'
import type {
  ScenarioDefinition,
  ScenarioId,
  ScenarioRegistry,
} from '@/core/session/activeScenario'

export interface UseScenarioResult<TData> {
  readonly scenario: ScenarioDefinition<TData>
  readonly data: TData
  /** Escenarios de este módulo, para poblar el `ScenarioSwitcher`. */
  readonly available: readonly ScenarioDefinition<TData>[]
  readonly setScenarioId: (id: ScenarioId | null) => void
}

export function useScenario<TData>(
  registry: ScenarioRegistry<TData>,
  fallbackId: ScenarioId,
): UseScenarioResult<TData> {
  const { scenarioId, setScenarioId } = useActiveScenario()

  const scenario = useMemo(
    () => resolveScenario(registry, scenarioId, fallbackId),
    [registry, scenarioId, fallbackId],
  )

  const available = useMemo(() => listScenarios(registry), [registry])

  return { scenario, data: scenario.data, available, setScenarioId }
}
