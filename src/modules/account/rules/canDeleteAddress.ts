/**
 * ¿Se puede eliminar este domicilio?
 *
 * DECISIÓN DE ARQUITECTURA
 * Primero se chequea el permiso y después la regla de negocio. El orden importa:
 * el escenario `cannot-delete-favorite-address` le PRENDE el permiso al usuario
 * justamente para que quede claro que el bloqueo viene de la regla (el domicilio
 * favorito no se puede borrar) y no del control de acceso.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import type { Address } from '../types/account.types'

export function canDeleteAddress(user: CurrentUser, address: Address): ActionResult {
  if (!hasPermission(user, 'ADDRESS_DELETE')) {
    return deny('No tenés permiso para eliminar domicilios.')
  }

  if (address.isFavorite) {
    return deny(
      'No podés eliminar el domicilio favorito. Marcá otro como favorito y volvé a intentarlo.',
    )
  }

  return allow()
}
