import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'

/** ¿Puede dar de alta un envío nuevo? */
export function canCreateShipment(user: CurrentUser): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_CREATE')) {
    return deny('Tu usuario no tiene permiso para crear envíos.')
  }
  return allow()
}
