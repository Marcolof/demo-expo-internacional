/**
 * ¿Puede este usuario ver los comprobantes de la cuenta?
 *
 * No depende del estado de ningún recurso, pero se modela igual que el resto de
 * las reglas para que la pantalla no tenga que armar el mensaje.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'

export function canViewReceipts(user: CurrentUser): ActionResult {
  if (!hasPermission(user, 'RECEIPTS_VIEW')) {
    return deny(
      'Tu usuario no tiene permiso para ver los comprobantes de la cuenta. Pedíselo al titular de la cuenta.',
    )
  }

  return allow()
}
