/**
 * ¿Puede este usuario entrar a Mis Comunicaciones Digitales?
 *
 * Son dos puertas distintas y hay que distinguirlas: el PERMISO del usuario
 * dentro de la cuenta, y el ALTA de la cuenta en el servicio. Cada estado
 * devuelve su propio mensaje porque lo que tiene que hacer el usuario es
 * distinto en cada caso (esperar, pedir el alta, o llamar a su ejecutivo).
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import type {
  DigitalCommunicationsAccess,
  ServiceAccessStatus,
} from '../types/digitalCommunications.types'

/** Motivo por estado del servicio. `HABILITADO` no tiene: es el caso permitido. */
const STATUS_REASONS: Record<Exclude<ServiceAccessStatus, 'HABILITADO'>, string> = {
  PENDIENTE_DE_ALTA:
    'Tu solicitud de alta está en trámite. Te avisamos por correo electrónico cuando esté aprobada.',
  NO_HABILITADO:
    'Tu cuenta todavía no tiene habilitado el servicio de Comunicaciones Digitales.',
  SUSPENDIDO:
    'El servicio está suspendido para tu cuenta. Comunicate con tu ejecutivo comercial.',
}

export function canAccessDigitalCommunications(
  user: CurrentUser,
  access: DigitalCommunicationsAccess,
): ActionResult {
  // El alta de la CUENTA se evalúa primero: es la puerta de afuera. Si el
  // servicio no existe para la cuenta, el permiso del usuario es irrelevante y
  // el mensaje útil es el del trámite, no el de permisos.
  if (access.status !== 'HABILITADO') {
    return deny(STATUS_REASONS[access.status])
  }

  if (!hasPermission(user, 'DIGITAL_COMMUNICATIONS_ACCESS')) {
    return deny('Tu usuario no tiene permiso para acceder a Comunicaciones Digitales.')
  }

  return allow()
}
