/**
 * ¿Se puede editar este domicilio?
 *
 * Devuelve `ActionResult` y no un booleano para que la UI pueda explicar el
 * motivo del bloqueo en un tooltip o en una alerta, en vez de mostrar un botón
 * grisado sin explicación.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import type { Address } from '../types/account.types'

export function canEditAddress(user: CurrentUser, address: Address): ActionResult {
  if (!hasPermission(user, 'ADDRESS_EDIT')) {
    return deny(`No tenés permiso para editar el domicilio "${address.alias}".`)
  }

  return allow()
}
