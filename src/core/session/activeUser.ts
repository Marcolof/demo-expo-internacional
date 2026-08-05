/**
 * Usuario y feature flags activos de la sesión simulada.
 *
 * No hay login. El estado vive en memoria y lo manipula la barra de demo.
 */

import { createContext, useContext } from 'react'
import type { CurrentUser } from '../auth/currentUser'
import type { Permission } from '../auth/permissions'
import type { Role } from '../auth/roles'
import type { FeatureFlag, FeatureFlagState } from '../featureFlags/featureFlags'
import type { Id, LoadState } from '../types/common'

export interface ActiveUserContextValue {
  readonly user: CurrentUser
  readonly featureFlags: FeatureFlagState
  /** Estado de carga simulado, para demostrar spinners y errores. */
  readonly loadState: LoadState

  readonly setUserById: (id: Id) => void
  readonly setRole: (role: Role) => void
  readonly setPermissionOverride: (permission: Permission, enabled: boolean | null) => void
  readonly setFeatureFlag: (flag: FeatureFlag, enabled: boolean) => void
  readonly setLoadState: (state: LoadState) => void
  /** Vuelve a los valores por defecto. Lo usa el botón "Reiniciar" de la demo. */
  readonly reset: () => void
}

export const ActiveUserContext = createContext<ActiveUserContextValue | null>(null)

export function useActiveUser(): ActiveUserContextValue {
  const context = useContext(ActiveUserContext)
  if (context === null) {
    throw new Error('useActiveUser debe usarse dentro de <AppProviders>.')
  }
  return context
}
