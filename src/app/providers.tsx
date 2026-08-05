import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_USER, findDemoUser } from '@/core/auth/currentUser'
import type { CurrentUser } from '@/core/auth/currentUser'
import type { Permission } from '@/core/auth/permissions'
import type { Role } from '@/core/auth/roles'
import { DEFAULT_FEATURE_FLAGS } from '@/core/featureFlags/featureFlags'
import type { FeatureFlag, FeatureFlagState } from '@/core/featureFlags/featureFlags'
import { ActiveScenarioContext, SCENARIO_QUERY_PARAM } from '@/core/session/activeScenario'
import type { ScenarioId, ScenarioSessionOverrides } from '@/core/session/activeScenario'
import { ActiveUserContext } from '@/core/session/activeUser'
import type { ActiveUserContextValue } from '@/core/session/activeUser'
import type { Id, LoadState } from '@/core/types/common'
import { ToastProvider } from '@/shared/ui/Toast'
import { SCENARIO_SESSIONS } from '@/demo/scenarioCatalog'

export interface AppProvidersProps {
  readonly children: ReactNode
}

/**
 * Estado de la sesión simulada.
 *
 * Precedencia: lo que se toca a mano en la barra de demo gana sobre lo que
 * pide el escenario, y el escenario gana sobre los valores por defecto. Así se
 * puede entrar por una URL de escenario y después ajustar un permiso suelto sin
 * que el escenario lo vuelva atrás.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [manualUserId, setManualUserId] = useState<Id | null>(null)
  const [manualRole, setManualRole] = useState<Role | null>(null)
  const [manualPermissions, setManualPermissions] = useState<
    Readonly<Partial<Record<Permission, boolean>>>
  >({})
  const [manualFlags, setManualFlags] = useState<Readonly<Partial<Record<FeatureFlag, boolean>>>>({})
  const [manualLoadState, setManualLoadState] = useState<LoadState | null>(null)

  const scenarioId = searchParams.get(SCENARIO_QUERY_PARAM)

  const setScenarioId = useCallback(
    (id: ScenarioId | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (id === null) next.delete(SCENARIO_QUERY_PARAM)
          else next.set(SCENARIO_QUERY_PARAM, id)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const scenarioSession: ScenarioSessionOverrides = useMemo(() => {
    if (scenarioId === null) return {}
    return SCENARIO_SESSIONS[scenarioId] ?? {}
  }, [scenarioId])

  const user: CurrentUser = useMemo(() => {
    const resolvedId = manualUserId ?? scenarioSession.userId ?? DEFAULT_USER.id
    const base = findDemoUser(resolvedId) ?? DEFAULT_USER

    return {
      ...base,
      role: manualRole ?? scenarioSession.role ?? base.role,
      permissionOverrides: {
        ...base.permissionOverrides,
        ...scenarioSession.permissionOverrides,
        ...manualPermissions,
      },
    }
  }, [manualUserId, manualRole, manualPermissions, scenarioSession])

  const featureFlags: FeatureFlagState = useMemo(
    () => ({
      ...DEFAULT_FEATURE_FLAGS,
      ...scenarioSession.featureFlags,
      ...manualFlags,
    }),
    [scenarioSession, manualFlags],
  )

  const loadState: LoadState = manualLoadState ?? scenarioSession.loadState ?? 'success'

  const setPermissionOverride = useCallback((permission: Permission, enabled: boolean | null) => {
    setManualPermissions((current) => {
      const next = { ...current }
      // `null` devuelve el permiso a lo que dicte el rol.
      if (enabled === null) delete next[permission]
      else next[permission] = enabled
      return next
    })
  }, [])

  const setFeatureFlag = useCallback((flag: FeatureFlag, enabled: boolean) => {
    setManualFlags((current) => ({ ...current, [flag]: enabled }))
  }, [])

  const reset = useCallback(() => {
    setManualUserId(null)
    setManualRole(null)
    setManualPermissions({})
    setManualFlags({})
    setManualLoadState(null)
    setScenarioId(null)
  }, [setScenarioId])

  const activeUserValue: ActiveUserContextValue = useMemo(
    () => ({
      user,
      featureFlags,
      loadState,
      setUserById: (id) => {
        setManualUserId(id)
        // Cambiar de usuario descarta el rol forzado: se toma el del usuario.
        setManualRole(null)
      },
      setRole: setManualRole,
      setPermissionOverride,
      setFeatureFlag,
      setLoadState: setManualLoadState,
      reset,
    }),
    [user, featureFlags, loadState, setPermissionOverride, setFeatureFlag, reset],
  )

  const activeScenarioValue = useMemo(
    () => ({ scenarioId, setScenarioId }),
    [scenarioId, setScenarioId],
  )

  return (
    <ActiveUserContext.Provider value={activeUserValue}>
      <ActiveScenarioContext.Provider value={activeScenarioValue}>
        <ToastProvider>{children}</ToastProvider>
      </ActiveScenarioContext.Provider>
    </ActiveUserContext.Provider>
  )
}
