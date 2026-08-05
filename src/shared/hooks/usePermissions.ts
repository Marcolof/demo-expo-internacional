/**
 * Acceso a los permisos del usuario activo desde un componente.
 *
 * Es un envoltorio fino sobre `core/auth/access`. Las pantallas usan `can(...)`
 * para casos simples (mostrar un botón) y las funciones de `rules/*` cuando la
 * decisión depende del estado del recurso.
 */

import { useCallback, useMemo } from 'react'
import { hasAllPermissions, hasAnyPermission, isReadOnly } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import type { Permission } from '@/core/auth/permissions'
import { useActiveUser } from '@/core/session/activeUser'

export interface UsePermissionsResult {
  readonly user: CurrentUser
  readonly can: (permission: Permission) => boolean
  readonly canAll: (permissions: readonly Permission[]) => boolean
  readonly canAny: (permissions: readonly Permission[]) => boolean
  readonly readOnly: boolean
}

export function usePermissions(): UsePermissionsResult {
  const { user } = useActiveUser()

  const can = useCallback(
    (permission: Permission) => hasAnyPermission(user, [permission]),
    [user],
  )

  const canAll = useCallback(
    (permissions: readonly Permission[]) => hasAllPermissions(user, permissions),
    [user],
  )

  const canAny = useCallback(
    (permissions: readonly Permission[]) => hasAnyPermission(user, permissions),
    [user],
  )

  const readOnly = useMemo(() => isReadOnly(user), [user])

  return { user, can, canAll, canAny, readOnly }
}
