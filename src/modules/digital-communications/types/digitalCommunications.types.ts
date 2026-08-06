/**
 * Tipos de Mis Comunicaciones Digitales.
 *
 * Es el servicio de notificación digital fehaciente del Correo Argentino: la
 * cuenta tiene que estar dada de alta para poder usarlo, así que el estado del
 * acceso es parte del dominio y no un detalle de permisos.
 */

import type { Id, IsoDate } from '@/core/types/common'

export type ServiceAccessStatus =
  | 'HABILITADO'
  | 'PENDIENTE_DE_ALTA'
  | 'NO_HABILITADO'
  | 'SUSPENDIDO'

export interface DigitalCommunicationsAccess {
  readonly status: ServiceAccessStatus
  readonly requestedAt?: IsoDate
  readonly enabledAt?: IsoDate
  readonly reason?: string
}

export type CommunicationState =
  | 'ENVIADA'
  | 'ENTREGADA'
  | 'LEIDA'
  | 'RECHAZADA'
  | 'VENCIDA'

export interface DigitalCommunication {
  readonly id: Id
  readonly subject: string
  readonly recipient: string
  readonly sentAt: IsoDate
  readonly state: CommunicationState
  readonly trackingCode: string
}

/** Nombre visible del estado de acceso al servicio. */
export const ACCESS_STATUS_LABELS: Record<ServiceAccessStatus, string> = {
  HABILITADO: 'Habilitado',
  PENDIENTE_DE_ALTA: 'Pendiente de alta',
  NO_HABILITADO: 'No habilitado',
  SUSPENDIDO: 'Suspendido',
}

/** Nombre visible del estado de una comunicación. */
export const COMMUNICATION_STATE_LABELS: Record<CommunicationState, string> = {
  ENVIADA: 'Enviada',
  ENTREGADA: 'Entregada',
  LEIDA: 'Leída',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
}
