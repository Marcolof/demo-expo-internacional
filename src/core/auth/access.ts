/**
 * Primitivas de acceso.
 *
 * Éste es el nivel más bajo: responde "¿tiene el permiso X?".
 * Las preguntas de negocio ("¿puede cancelar ESTE envío?") NO van acá: van en
 * `modules/[dominio]/rules/*`, que combinan estas primitivas con el estado del
 * recurso.
 */

import type { CurrentUser } from './currentUser'
import { effectivePermissions } from './currentUser'
import type { Permission } from './permissions'

/** ¿El usuario tiene este permiso? */
export function hasPermission(user: CurrentUser, permission: Permission): boolean {
  return effectivePermissions(user).has(permission)
}

/** ¿Tiene TODOS estos permisos? */
export function hasAllPermissions(
  user: CurrentUser,
  permissions: readonly Permission[],
): boolean {
  const effective = effectivePermissions(user)
  return permissions.every((permission) => effective.has(permission))
}

/** ¿Tiene AL MENOS UNO de estos permisos? Útil para mostrar una sección. */
export function hasAnyPermission(
  user: CurrentUser,
  permissions: readonly Permission[],
): boolean {
  if (permissions.length === 0) return true
  const effective = effectivePermissions(user)
  return permissions.some((permission) => effective.has(permission))
}

/**
 * ¿Es sólo lectura? Atajo para deshabilitar bloques enteros de UI.
 * Se define por permisos, no por rol: un usuario sin ningún permiso de
 * escritura es de sólo lectura aunque su rol diga otra cosa.
 */
export function isReadOnly(user: CurrentUser): boolean {
  return !hasAnyPermission(user, [
    'ACCOUNT_EDIT',
    'ADDRESS_CREATE',
    'ADDRESS_EDIT',
    'ADDRESS_DELETE',
    'USERS_MANAGE',
    'SHIPMENT_CREATE',
    'SHIPMENT_EDIT',
    'SHIPMENT_PAY',
    'SHIPMENT_CANCEL',
    'SHIPMENT_RESCUE',
    'BALANCE_TOP_UP',
  ])
}
