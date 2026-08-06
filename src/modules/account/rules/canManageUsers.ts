/**
 * Reglas de administración de subusuarios.
 *
 * `canManageUsers` es la puerta de entrada a la pantalla; `canCreateUser`,
 * `canEditUser` y `canDeleteUser` agregan las reglas que dependen del usuario
 * apuntado. Ninguna pantalla combina permisos a mano: siempre llama acá.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import type { AccountUser } from '../types/account.types'

/** Mensaje único del bloqueo por permiso, para no escribirlo distinto en cada regla. */
const NO_PERMISSION = 'No tenés permiso para administrar los usuarios de la cuenta.'

export function canManageUsers(user: CurrentUser): ActionResult {
  if (!hasPermission(user, 'USERS_MANAGE')) {
    return deny(NO_PERMISSION)
  }

  return allow()
}

export function canCreateUser(user: CurrentUser): ActionResult {
  return canManageUsers(user)
}

/**
 * El titular no se edita desde acá: sus datos se cambian en Mi Cuenta › Perfil.
 * Permitirlo dejaría dos lugares para editar lo mismo, con reglas distintas.
 */
export function canEditUser(user: CurrentUser, target: AccountUser): ActionResult {
  const manage = canManageUsers(user)
  if (!manage.allowed) return manage

  if (target.isOwner) {
    return deny('Los datos del titular de la cuenta se editan desde el perfil.')
  }

  return allow()
}

export function canDeleteUser(user: CurrentUser, target: AccountUser): ActionResult {
  const manage = canManageUsers(user)
  if (!manage.allowed) return manage

  if (target.isOwner) {
    return deny('No podés eliminar al titular de la cuenta.')
  }

  return allow()
}
