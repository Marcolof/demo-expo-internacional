/**
 * Catálogo de todos los escenarios de la maqueta.
 *
 * DECISIÓN DE ARQUITECTURA
 * Cada módulo define sus propios escenarios; este archivo sólo los junta. Vive
 * en `demo/` porque los escenarios son una herramienta de demostración, y
 * tanto el `ScenarioSwitcher` como `app/providers` (que aplica los ajustes de
 * sesión) leen de acá. No se pone en `core/` a propósito: `core` no debe
 * conocer los módulos.
 *
 * Para agregar un escenario NO se toca este archivo: alcanza con declararlo en
 * `modules/[dominio]/scenarios/*.scenarios.ts`.
 */

import type { ScenarioId, ScenarioSessionOverrides } from '@/core/session/activeScenario'
import { accountScenarios } from '@/modules/account'
import { balanceScenarios } from '@/modules/balance'
import { digitalCommunicationsScenarios } from '@/modules/digital-communications'
import { shipmentsScenarios } from '@/modules/shipments'

/** Nombre visible del módulo dueño del escenario. */
export type ScenarioModule = 'Mi Cuenta' | 'Mis Envíos' | 'Mi Saldo' | 'Comunicaciones Digitales'

export interface ScenarioCatalogEntry {
  readonly id: ScenarioId
  readonly label: string
  readonly description: string
  readonly module: ScenarioModule
  readonly session?: ScenarioSessionOverrides
}

/** Registro mínimo que necesita el catálogo, sin importar el tipo de `data`. */
type AnyScenarioRegistry = Readonly<
  Record<
    ScenarioId,
    {
      readonly id: ScenarioId
      readonly label: string
      readonly description: string
      readonly session?: ScenarioSessionOverrides
    }
  >
>

function entriesOf(registry: AnyScenarioRegistry, module: ScenarioModule): ScenarioCatalogEntry[] {
  return Object.values(registry).map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    module,
    session: scenario.session,
  }))
}

export const SCENARIO_CATALOG: readonly ScenarioCatalogEntry[] = [
  ...entriesOf(accountScenarios, 'Mi Cuenta'),
  ...entriesOf(shipmentsScenarios, 'Mis Envíos'),
  ...entriesOf(balanceScenarios, 'Mi Saldo'),
  ...entriesOf(digitalCommunicationsScenarios, 'Comunicaciones Digitales'),
]

/** Ajustes de sesión por id de escenario. Lo consume `app/providers`. */
export const SCENARIO_SESSIONS: Readonly<Record<ScenarioId, ScenarioSessionOverrides | undefined>> =
  Object.fromEntries(SCENARIO_CATALOG.map((entry) => [entry.id, entry.session]))

/** Escenarios agrupados por módulo, para el desplegable de la barra de demo. */
export function scenariosByModule(): ReadonlyMap<ScenarioModule, readonly ScenarioCatalogEntry[]> {
  const grouped = new Map<ScenarioModule, ScenarioCatalogEntry[]>()

  for (const entry of SCENARIO_CATALOG) {
    const existing = grouped.get(entry.module)
    if (existing === undefined) grouped.set(entry.module, [entry])
    else existing.push(entry)
  }

  return grouped
}
