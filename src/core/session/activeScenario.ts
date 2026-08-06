/**
 * Escenario activo.
 *
 * Un escenario es un estado navegable de la maqueta: "envío pendiente
 * editable", "sin permiso", "estado vacío", "error de carga". Se selecciona por
 * URL (`?scenario=pending-editable`) o desde la barra de demo.
 *
 * DECISIÓN DE ARQUITECTURA
 * Cada módulo define sus escenarios en `modules/[dominio]/scenarios`. `core`
 * sólo define el CONTRATO y cómo se resuelve. Así se puede agregar un escenario
 * nuevo sin tocar `core`.
 */

import { createContext, useContext } from 'react'
import type { FeatureFlag } from '../featureFlags/featureFlags'
import type { Permission } from '../auth/permissions'
import type { Role } from '../auth/roles'
import type { Id, LoadState } from '../types/common'

/** Identificador de escenario, tal como aparece en `?scenario=`. */
export type ScenarioId = string

/**
 * Ajustes de sesión que un escenario puede forzar.
 * Permite que "operatorWithoutPayment" cambie el usuario activo, o que
 * "digitalCommunicationsNoAccess" apague un permiso, sin tocar el componente.
 */
export interface ScenarioSessionOverrides {
  readonly userId?: Id
  readonly role?: Role
  readonly permissionOverrides?: Readonly<Partial<Record<Permission, boolean>>>
  readonly featureFlags?: Readonly<Partial<Record<FeatureFlag, boolean>>>
  /** Permite demostrar spinners y pantallas de error sin backend. */
  readonly loadState?: LoadState
}

/**
 * Definición de un escenario. `TData` es el dato que el módulo quiere
 * inyectar (una lista de envíos, un saldo, un array vacío…).
 */
export interface ScenarioDefinition<TData> {
  readonly id: ScenarioId
  readonly label: string
  readonly description: string
  readonly data: TData
  readonly session?: ScenarioSessionOverrides
}

/** Registro de escenarios de un módulo, indexado por id. */
export type ScenarioRegistry<TData> = Readonly<Record<ScenarioId, ScenarioDefinition<TData>>>

/**
 * Resuelve el escenario pedido. Si el id no existe (URL escrita a mano, o un
 * escenario de otro módulo), cae al `fallbackId`. Nunca tira.
 */
export function resolveScenario<TData>(
  registry: ScenarioRegistry<TData>,
  requestedId: ScenarioId | null,
  fallbackId: ScenarioId,
): ScenarioDefinition<TData> {
  if (requestedId !== null) {
    const requested = registry[requestedId]
    if (requested !== undefined) return requested
  }

  const fallback = registry[fallbackId]
  if (fallback !== undefined) return fallback

  // Último recurso: el primero declarado. Mantiene la maqueta navegable
  // incluso si alguien renombra el escenario por defecto.
  const first = Object.values(registry)[0]
  if (first === undefined) {
    throw new Error('El registro de escenarios está vacío.')
  }
  return first
}

/** Lista los escenarios de un registro, para poblar el `ScenarioSwitcher`. */
export function listScenarios<TData>(
  registry: ScenarioRegistry<TData>,
): readonly ScenarioDefinition<TData>[] {
  return Object.values(registry)
}

// --- Contexto ---------------------------------------------------------------

export interface ActiveScenarioContextValue {
  /** Id pedido por URL o por la barra de demo. `null` = escenario por defecto. */
  readonly scenarioId: ScenarioId | null
  readonly setScenarioId: (id: ScenarioId | null) => void
}

export const ActiveScenarioContext = createContext<ActiveScenarioContextValue | null>(null)

export function useActiveScenario(): ActiveScenarioContextValue {
  const context = useContext(ActiveScenarioContext)
  if (context === null) {
    throw new Error('useActiveScenario debe usarse dentro de <AppProviders>.')
  }
  return context
}

/** Nombre del parámetro de URL. Un solo lugar para cambiarlo. */
export const SCENARIO_QUERY_PARAM = 'scenario'
